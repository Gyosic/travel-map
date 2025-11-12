import { parse as urlParse } from "@/lib/url";

export const logo = {
  light: process.env.LOGO_LIGHT,
  dark: process.env.LOGO_DARK,
};

export type LogoType = typeof logo;

export const site = {
  name: process.env.SITE_TITLE,
  description: process.env.SITE_DESCRIPTION,
  baseurl: process.env.SITE_BASEURL,
};

export type SiteType = typeof site;

const psqlUrl = urlParse(process.env.PG_BASEURL as string);
export const postgresql = {
  host: psqlUrl?.hostname,
  port: Number(psqlUrl?.port || "5432"),
  user: decodeURIComponent(psqlUrl?.username as string),
  password: decodeURIComponent(psqlUrl?.password as string),
  database: psqlUrl?.pathname.substring(1),
  ssl: false,
};
export type PostgresqlType = typeof postgresql;

const geoUrl = urlParse(process.env.GEO_BASEURL as string);
export const geo = {
  host: geoUrl?.hostname,
  port: Number(geoUrl?.port || "5432"),
  user: decodeURIComponent(geoUrl?.username as string),
  password: decodeURIComponent(geoUrl?.password as string),
  database: geoUrl?.pathname.substring(1),
  ssl: false,
};

export const isDev = process.env.NODE_ENV !== "production";
