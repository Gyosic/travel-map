import { cookies } from "next/headers";
import { CredentialsSignin, type User } from "next-auth";
import { site } from "@/config";

class CustomCredentialsSignin extends CredentialsSignin {
  code: string;

  constructor(message: string, code?: string) {
    super();
    this.message = message;
    this.code = code || "credentials_error";
  }
}

export const authorize = async (credentials: Partial<Record<"email" | "password", unknown>>) => {
  const signinRes = await fetch(new URL("/api/signin", site.baseurl), {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!signinRes.ok) {
    const errorText = await signinRes.text();
    throw new CustomCredentialsSignin(errorText);
  }

  const { user } = await signinRes.json();

  return user as User;
};
