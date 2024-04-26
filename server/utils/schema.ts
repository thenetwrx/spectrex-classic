import { bigint, boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users_table = pgTable("users", {
  id: text("id").primaryKey(),
  provider_id: text("provider_id").notNull(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  display_name: text("display_name"),
  email: text("email").notNull(),
  premium_since: bigint("premium_since", { mode: "number" }),
  banned: boolean("banned").notNull().default(false),
  description: text("description"),
  public: boolean("public").notNull().default(false),
  admin: boolean("admin").notNull().default(false),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
  monthly_server_reports: boolean("monthly_server_reports")
    .notNull()
    .default(true),
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
  provider_access_token_refreshed_at: bigint(
    "provider_access_token_refreshed_at",
    { mode: "number" }
  ).notNull(),
  provider_access_token_expires_at: bigint("provider_access_token_expires_at", {
    mode: "number",
  }).notNull(),
  provider_refresh_token: text("provider_refresh_token").notNull(),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
});

export const servers_table = pgTable("servers", {
  id: text("id").primaryKey(),
  created_at: bigint("created_at", { mode: "number" }).notNull(),
  owner_id: text("owner_id")
    .notNull()
    .references(() => users_table.id),
  approved_at: bigint("approved_at", { mode: "number" }),
  provider_id: text("provider_id").notNull(),
  approximate_member_count: bigint("approximate_member_count", {
    mode: "number",
  }).notNull(),
  nsfw: boolean("nsfw").notNull().default(false),
  banned: boolean("banned").notNull().default(false),
  owner_provider_id: text("owner_provider_id").notNull(),
  invite_link: text("invite_link"),
  name: text("name").notNull(),
  icon: text("icon"),
  approximate_presence_count: bigint("approximate_presence_count", {
    mode: "number",
  }).notNull(),
  bumped_at: bigint("bumped_at", { mode: "number" }),
  language: text("language"),
  description: text("description"),
  tags: text("tags").array().notNull().default([]),
  public: boolean("public").notNull().default(false),
  category: text("category"),
  updated_at: bigint("updated_at", { mode: "number" }).notNull(),
  invite_uses: text("invite_uses").array().notNull().default([]),
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
