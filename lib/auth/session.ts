import type { Session } from "next-auth";
import type { SessionContextValue } from "next-auth/react";

export function getSession(context: SessionContextValue | Session | null): Session | null {
  if (!context) return context;

  if (Object.hasOwn(context, "data")) return (<SessionContextValue>context).data;

  return context as Session;
}

export function isSys(context: SessionContextValue | Session | null) {
  return Boolean(getSession(context)?.user?.is_sysadmin);
}

export function isAdmin(context: SessionContextValue | Session | null) {
  // @ts-expect-error: admin is not defined in the Session type
  return "admin" === getSession(context)?.user.role || isSys(context);
}

export function get(context: SessionContextValue | Session | null, key: keyof Session["user"]) {
  return getSession(context)?.user[key];
}

export function id(context: SessionContextValue | Session | null) {
  return getSession(context)?.user.id;
}

export function token(context: SessionContextValue | Session | null) {
  return getSession(context)?.user.access_token ?? "";
}

export function isAuthenticated(context: SessionContextValue | null) {
  return context?.status === "authenticated";
}
