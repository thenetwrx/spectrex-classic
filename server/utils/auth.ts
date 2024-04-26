import { Lucia, TimeSpan, User } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import db from "./database";
import { Discord } from "arctic";
import Cryptr from "cryptr";
import { users_table, sessions_table } from "./schema";

export const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  process.env.BASE_URL! + "/api/v1/auth/discord/callback"
);

const adapter = new DrizzlePostgreSQLAdapter(db, sessions_table, users_table);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !import.meta.dev,
    },
    name: "session",
  },
  sessionExpiresIn: new TimeSpan(3, "d"),
  getUserAttributes: (attributes) => {
    return attributes;
  },
  getSessionAttributes: (attributes) => {
    return attributes;
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

interface DatabaseUserAttributes {
  provider_id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  premium_since: number | null;
  email: string;
  public: boolean;
  description: string | null;
  admin: boolean;
  banned: boolean;
  created_at: number;
  updated_at: number;
  monthly_server_reports: boolean;
}

interface DatabaseSessionAttributes {
  provider_access_token: string; // Must be encrypted
  provider_access_token_refreshed_at: number;
  provider_access_token_expires_at: number;
  provider_refresh_token: string; // Must be encrypted
  created_at: number;
}
