import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const nonce = cookieStore.get("siwe_nonce");

  if (!nonce) {
    return new Response("Nonce not found", { status: 404 });
  }

  return new Response(nonce.value);
}
