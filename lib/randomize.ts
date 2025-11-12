const alphabets = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const numbers = "0123456789";

export function getRandomString({ alphabet = true, number = true } = {}) {
  const material = `${alphabet ? alphabets : ""}${number ? numbers : ""}`;

  return material
    .split("")
    .sort(() => 0.5 - Math.random())
    .join("")
    .slice(0, Math.random() * material.length + 2);
}

export function guid({ length = 40, str = "", startsWithAlphabet = false } = {}) {
  if (startsWithAlphabet) str += getRandomString({ number: false });

  for (let i = 0, ilen = startsWithAlphabet ? length - 1 : length; i < ilen / 3 + 1; i++)
    str += getRandomString();
  return str.substring(0, length);
}
