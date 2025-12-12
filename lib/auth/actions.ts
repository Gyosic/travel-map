"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";

export async function login(email: string, password: string, redirect: boolean = false) {
  try {
    const res = await signIn("credentials", {
      email,
      password,
      redirect,
    });
    console.info(res, redirect);

    return res;
  } catch (error) {
    const { message = "알 수 없는 오류가 발생했습니다." } = (error as AuthError) || {};

    try {
      return { error: { message: JSON.parse(message) } };
    } catch {
      return { error: { message } };
    }
  }
}
