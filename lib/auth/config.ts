import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import type { NextAuthConfig, Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
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
    Naver,
  ],
  pages: {
    signIn: "/",
    signOut: "/signout",
    error: "/error",
  },
  callbacks: {
    jwt: async ({ token, user }) => ({ ...token, ...user }),
    session: ({ session, token: { refresh_token, password, salt, ...user } }): Session => {
      if (!!user?.image && !(user.image as string).includes("http"))
        Object.assign(user, { image: `/api/files${user.image}` });

      return Object.assign(session, { user });
    },
    signIn: async ({ user }): Promise<boolean> => Boolean(user.id),
    authorized: async ({ auth }): Promise<boolean> => Boolean(auth),
  },
  events: {
    async createUser({ user }) {
      await writeDb
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.email, user.email));
    },
  },
  secret: process.env.AUTH_SECRET,
} satisfies NextAuthConfig;

export default authConfig;
