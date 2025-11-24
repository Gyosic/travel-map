// biome-ignore lint/style/noCommonJs: <>
const crypto = require("crypto");

// function getRandomString({ alphabet = true, number = true } = {}) {
//   const material = `${alphabet ? "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" : ""}${number ? "0123456789" : ""}`;

//   return material
//     .split("")
//     .sort(() => 0.5 - Math.random())
//     .join("")
//     .slice(0, Math.random() * material.length + 2);
// }

// function guid({ length = 40, str = "", startsWithAlphabet = false } = {}) {
//   if (startsWithAlphabet) str += getRandomString({ number: false });

//   for (let i = 0, ilen = startsWithAlphabet ? length - 1 : length; i < ilen / 3 + 1; i++)
//     str += getRandomString();
//   return str.substring(0, length);
// }

function getSalt(length = 64) {
  return crypto.randomBytes(length).toString("base64");
}

function hmacEncrypt(data, salt, algorithm = "sha512", digest = "base64") {
  return crypto.createHmac(algorithm, salt).update(data).digest(digest);
}

function main() {
  const [, , password] = process.argv;

  if ("secret" === password) return console.info(`AUTH_SECRET='${getSalt()}'`);

  if (!password) {
    return console.info(
      `"password" 파라미터는 필수 입니다. "npm run genpass -- PASSWORD" 명령을 통해 입력하실 수 있습니다. 특수문자가 필요하다면 비밀번호 파라미터를 따옴표(')를 묶을 수 있습니다.`,
    );
  }

  const salt = getSalt();
  const secret = hmacEncrypt(password, salt);

  console.info(`SYSADMIN_SALT="${salt}"`);
  console.info(`SYSADMIN_PASSWORD="${secret}"`);
}

main();
