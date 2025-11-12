import "next-auth";
import type { User as SchemaUser } from "@/lib/schema/user";

declare module "next-auth" {
  interface User extends SchemaUser {
    access_token?: string;
    refresh_token?: string;

    _id?: number;
    username?: string;
    is_sysadmin?: boolean;
    ip?: string;
  }

  interface Session {
    user: User;
  }
}
