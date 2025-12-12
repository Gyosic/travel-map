import "next-auth";
import type { User as SchemaUser } from "@/lib/schema/user";

declare module "next-auth" {
  interface User extends SchemaUser {
    access_token?: string;
    refresh_token?: string;

    _id?: number;
    id?: string;
    username?: string;
    is_sysadmin?: boolean;
    ip?: string;
    picture?: string;
    email: string;
    emailVerified?: Date;
  }

  interface Session {
    user: User;
  }
}
