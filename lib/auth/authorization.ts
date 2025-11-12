import { cookies } from "next/headers";
import type { User } from "next-auth";
import { site } from "@/config";

export const authorize = async (credentials: Partial<Record<"username" | "password", unknown>>) => {
  const signinRes = await fetch(new URL("/api/signin", site.baseurl), {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password,
    }),
  });

  if (!signinRes.ok) throw new Error(await signinRes.text());

  const { user, error } = await signinRes.json();

  // new Error()를 해도 client에서는 Error 메시지를 받을 수 없으므로 cookies에 저장하고, client에서 읽은 뒤 삭제하는 방식으로 로그인 에러 메시지를 처리
  const cookieStore = await cookies();
  if (error) {
    const { message } = error;
    cookieStore.set("auth_error", message);

    return null;
  }

  // 로그인 성공시 쿠키 삭제
  cookieStore.set("auth_error", "", { maxAge: 0 });

  return user as User;
};
