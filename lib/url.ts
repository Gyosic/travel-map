/**
 * URL 해석기
 *
 * @description
 * URL의 부분들을 해석하여 JSON으로 반환한다.
 *
 * @example
 * const parsed = parse("redis://hello:world@example.com:6379/0")
 *
 * @param url URL 주소
 * @returns [URL 객체](https://developer.mozilla.org/en-US/docs/Web/API/URL)
 */
export const parse = (url: string): URL => {
  const hasAuthentication = url.includes("@");

  if (!hasAuthentication) return new URL(url);

  const [head, tail] = url.split("@");

  const heads = head.split("//");

  const [protocol] = heads;
  let [, authorization] = heads;

  const isUsernamePasswordPair = authorization.includes(":");

  if (isUsernamePasswordPair) {
    const [username, password] = authorization.split(":");
    authorization = `${encodeURIComponent(username)}:${encodeURIComponent(password)}`;
  } else {
    // password only
    authorization = `:${encodeURIComponent(authorization)}`;
  }

  return new URL(`${protocol}//${authorization}@${tail}`);
};
