import { Lucia, TimeSpan } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import pool from "./database";
import { Discord } from "arctic";
import Cryptr from "cryptr";

export const cryptr = new Cryptr(process.env.ENCRYPTION_KEY!);

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_CLIENT_SECRET!,
  process.env.BASE_URL! + "/api/v1/auth/discord/callback"
);

const adapter = new NodePostgresAdapter(pool, {
  user: "users",
  session: "sessions",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !import.meta.dev,
    },
    name: "session",
  },
  sessionExpiresIn: new TimeSpan(14, "d"),
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
  premium_since: string | null;
  email: string;
  public: boolean;
  description: string | null;
  admin: boolean;
  banned: boolean;
  created_at: string;
  updated_at: string;
}

interface DatabaseSessionAttributes {
  provider_access_token: string; // Must be encrypted
  provider_access_token_expires_at: string;
  provider_refresh_token: string; // Must be encrypted
  created_at: string;
}
