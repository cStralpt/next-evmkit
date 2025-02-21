import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { verifyNonce } from "@/lib/auth";
import { isValidDomain } from "@/lib/siwe";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: "siwe",
      name: "SIWE",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        nonce: { label: "Nonce", type: "text" },
        chainId: { label: "Chain ID", type: "text" },
      },
      async authorize(credentials) {
        try {
          console.log("SIWE Auth - Received credentials:", {
            message: credentials?.message ? "present" : "missing",
            signature: credentials?.signature ? "present" : "missing",
            nonce: credentials?.nonce ? "present" : "missing",
            chainId: credentials?.chainId ? "present" : "missing",
          });

          if (
            !credentials?.message ||
            !credentials?.signature ||
            !credentials?.nonce ||
            !credentials?.chainId
          ) {
            throw new Error("Missing credentials");
          }

          if (!verifyNonce(credentials.nonce)) {
            throw new Error("Invalid or expired nonce");
          }

          let messageObject: Record<string, unknown>;
          try {
            messageObject = JSON.parse(credentials.message);
            console.log("SIWE Auth - Parsed message object:", messageObject);
          } catch (error) {
            console.error("SIWE Auth - Error parsing message:", error);
            throw new Error("Invalid message format");
          }

          const siweMessage = new SiweMessage(messageObject);
          console.log("SIWE Auth - Created SIWE message:", siweMessage);

          if (siweMessage.chainId !== Number.parseInt(credentials.chainId)) {
            throw new Error("Chain ID mismatch");
          }

          const expirationTime = new Date(siweMessage.expirationTime as string);
          if (Date.now() >= expirationTime.getTime()) {
            throw new Error("Message expired");
          }

          if (!isValidDomain(siweMessage.domain)) {
            console.error("SIWE Auth - Domain mismatch:", siweMessage.domain);
            throw new Error("Domain mismatch");
          }

          const result = await siweMessage.verify({
            signature: credentials.signature,
            domain: siweMessage.domain,
            nonce: credentials.nonce,
          });

          if (!result.success) {
            console.error("SIWE Auth - Signature verification failed:", result);
            throw new Error("Invalid signature");
          }

          return {
            id: siweMessage.address,
            address: siweMessage.address,
            chainId: credentials.chainId,
          };
        } catch (error) {
          console.error("SIWE Auth - Error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.address = user.address;
        token.chainId = user.chainId;
        token.accessToken = `jwt_${user.address}_${Date.now()}`;
        token.iat = Math.floor(Date.now() / 1000);
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      const tokenAge = Math.floor(Date.now() / 1000) - (token.iat as number);
      if (tokenAge > 12 * 60 * 60) {
        throw new Error("Session expired");
      }

      return {
        ...session,
        address: token.sub,
        chainId: token.chainId,
        accessToken: token.accessToken,
        user: {
          ...session.user,
          name: token.sub,
          address: token.sub,
        },
      };
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
