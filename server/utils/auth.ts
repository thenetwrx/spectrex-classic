import { Lucia, TimeSpan } from "lucia";
import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import database from "./database";

const adapter = new NodePostgresAdapter(database, {
  user: "users",
  session: "sessions",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: !import.meta.dev,
    },
  },
  sessionExpiresIn: new TimeSpan(1, "h"),
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
  discord_id: string;
  username: string;
  avatar: string | null;
  global_name: string | null;
  email: string | null;
  premium_since: string | null;
  banned: boolean;
}

interface DatabaseSessionAttributes {
  discord_access_token: string;
}
