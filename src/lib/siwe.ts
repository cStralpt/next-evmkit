import { SiweMessage } from "siwe";

export function isValidDomain(domain: string) {
  const allowedDomains = [
    process.env.NEXT_PUBLIC_SIWE_DOMAIN,
    process.env.NEXT_PUBLIC_LOCAL_DOMAIN,
  ];
  return allowedDomains.includes(domain.split(":")[0]);
}

export function createSiweMessage(
  address: string,
  statement: string,
  nonce: string,
) {
  const domain = window.location.host.split(":")[0];
  const origin = window.location.origin;

  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    nonce,
    resources: [`${origin}/`],
  });

  // Return both the message object and the prepared message string
  return {
    message,
    preparedMessage: message.prepareMessage(),
  };
}
