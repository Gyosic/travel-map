import crypto from "crypto";

export function hmacEncrypt(
  data: string,
  salt: string,
  algorithm: string = "sha512",
  digest: crypto.BinaryToTextEncoding = "base64",
) {
  return crypto.createHmac(algorithm, salt).update(data).digest(digest);
}

export function getHash(data: string, type = "md5", digest: crypto.BinaryToTextEncoding = "hex") {
  return crypto.createHash(type).update(data).digest(digest);
}
