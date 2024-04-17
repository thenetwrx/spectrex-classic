import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users_table = pgTable("users", {
  id: text("id").primaryKey(),
  provider_id: text("provider_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  display_name: text("display_name"),
  email: text("email").notNull(),
  premium_since: text("premium_since"),
  banned: boolean("banned").notNull().default(false),
  description: text("description"),
  public: boolean("public").notNull().default(false),
  admin: boolean("admin").notNull().default(false),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at").notNull(),
});

export const sessions_table = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users_table.id),
  provider_access_token: text("provider_access_token").notNull(),
  provider_access_token_expires_at: text(
    "provider_access_token_expires_at"
  ).notNull(),
  provider_refresh_token: text("provider_refresh_token").notNull(),
  created_at: text("created_at").notNull(),
});

export const servers_table = pgTable("servers", {
  id: text("id").primaryKey(),
  created_at: text("created_at").notNull(),
  owner_id: text("owner_id")
    .notNull()
    .references(() => users_table.id),
  approved_at: text("approved_at"),
  provider_id: text("provider_id").notNull(),
  approximate_member_count: text("approximate_member_count").notNull(),
  nsfw: boolean("nsfw").notNull().default(false),
  banned: boolean("banned").notNull().default(false),
  owner_provider_id: text("owner_provider_id").notNull(),
  invite_link: text("invite_link"),
  name: text("name").notNull(),
  icon: text("icon"),
  approximate_presence_count: text("approximate_presence_count").notNull(),
  bumped_at: text("bumped_at"),
  language: text("language"),
  description: text("description"),
  tags: text("tags").array().default([]),
  public: boolean("public").default(false),
  category: text("category"),
  updated_at: text("updated_at").notNull(),
});

export const server_reports_table = pgTable("server_reports", {
  id: text("id").primaryKey(),
  created_at: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
  from_id: text("from_id")
    .notNull()
    .references(() => users_table.id),
  from_provider_id: text("from_provider_id").notNull(),
  suspect_id: text("suspect_id").notNull(),
  suspect_provider_id: text("suspect_provider_id").notNull(),
  suspect_server_id: text("suspect_server_id").notNull(),
  suspect_server_provider_id: text("suspect_server_provider_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
});
