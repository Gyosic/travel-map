"use client";

import { CookiesProvider, type ReactCookieProps } from "react-cookie";

export function CookieArea(props: ReactCookieProps) {
  return <CookiesProvider {...props} />;
}
