import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { NextAuthConfig, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { authorize } from "@/lib/auth/authorization";
import { writeDb } from "@/lib/pg";
import { accounts, users } from "@/lib/schema/user.table";

export type NextAuthPageSearchParams = Promise<{ callbackUrl?: string }>;

export interface Credentials {
  email: string;
  password: string;
}

// const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "secret");

const authConfig = {
  session: { strategy: "jwt" },
  adapter: DrizzleAdapter(writeDb, {
    usersTable: users,
    accountsTable: accounts,
  }),
  providers: [
    CredentialsProvider({
      id: "credentials",
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, email, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Username", type: "text", placeholder: "ID를 입력해주세요." },
        password: { label: "Password", type: "password", placeholder: "비밀번호를 입력해주세요." },
      },
      // Signin 할 때 사용 함: 사용자 정보 조회하고 객체 리턴하는 함수
      authorize,
    }),
    Google,
  ],
  pages: {
    signIn: "/",
    signOut: "/signout",
    error: "/error",
  },
  callbacks: {
    // Exclude `refresh_token` In `Response`
    // 토큰 만드는 함수, 반환된 객체는 jwt 토큰화됨
    jwt: async ({ token, user }) => ({ ...token, ...user }),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    session: ({ session, token: { refresh_token, ...user } }): Session =>
      Object.assign(session, { user }),
    // `Provider.authorize()` 를 통해 반환된 사용자 정보가 `user` 파라미터에 포함되어
    // 호출되는 콜백 함수로, 로그인을 허용할지말지 boolean값으로 리턴함.
    // 오류발생시 문자열로 `메시지`를 보내거나 `uri`방식으로 redirect할 수 있음.
    signIn: async ({ user }): Promise<boolean> => Boolean(user.id),
    authorized: async ({ auth }): Promise<boolean> => Boolean(auth),
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export default authConfig;
