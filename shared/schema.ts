import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, decimal, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - Discord users who play the game
export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: varchar("discord_id", { length: 20 }).notNull().unique(),
  username: text("username").notNull(),
  avatar: text("avatar"),
  nexiumCrystals: decimal("nexium_crystals", { precision: 20, scale: 2 }).default("1000.00").notNull(),
  energy: integer("energy").default(100).notNull(),
  maxEnergy: integer("max_energy").default(100).notNull(),
  lastEnergyRestore: timestamp("last_energy_restore").defaultNow().notNull(),
  rank: integer("rank").default(0).notNull(),
  totalExplored: integer("total_explored").default(0).notNull(),
  totalBattlesWon: integer("total_battles_won").default(0).notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastActive: timestamp("last_active").defaultNow().notNull(),
}, (table) => ({
  discordIdIdx: index("users_discord_id_idx").on(table.discordId),
  rankIdx: index("users_rank_idx").on(table.rank),
}));

// Ships table - Player starships
export const ships = pgTable("ships", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  shipType: varchar("ship_type", { length: 50 }).default("explorer").notNull(),
  hull: integer("hull").default(100).notNull(),
  maxHull: integer("max_hull").default(100).notNull(),
  shields: integer("shields").default(50).notNull(),
  maxShields: integer("max_shields").default(50).notNull(),
  attack: integer("attack").default(20).notNull(),
  defense: integer("defense").default(15).notNull(),
  speed: integer("speed").default(10).notNull(),
  cargo: integer("cargo").default(100).notNull(),
  maxCargo: integer("max_cargo").default(100).notNull(),
  fuel: integer("fuel").default(100).notNull(),
  maxFuel: integer("max_fuel").default(100).notNull(),
  experience: integer("experience").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  upgrades: jsonb("upgrades").default({}).notNull(),
  cosmetics: jsonb("cosmetics").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("ships_user_id_idx").on(table.userId),
  activeIdx: index("ships_active_idx").on(table.isActive),
}));

// Sectors table - Universe exploration areas
export const sectors = pgTable("sectors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  coordinates: text("coordinates").notNull().unique(),
  sectorType: varchar("sector_type", { length: 50 }).default("unexplored").notNull(),
  difficulty: integer("difficulty").default(1).notNull(),
  resources: jsonb("resources").default({}).notNull(),
  hazards: jsonb("hazards").default({}).notNull(),
  discoveredBy: uuid("discovered_by").references(() => users.id),
  discoveredAt: timestamp("discovered_at"),
  visitCount: integer("visit_count").default(0).notNull(),
  lastVisited: timestamp("last_visited"),
  isSpecial: boolean("is_special").default(false).notNull(),
  specialData: jsonb("special_data").default({}).notNull(),
}, (table) => ({
  coordinatesIdx: index("sectors_coordinates_idx").on(table.coordinates),
  discoveredByIdx: index("sectors_discovered_by_idx").on(table.discoveredBy),
  typeIdx: index("sectors_type_idx").on(table.sectorType),
}));

// Items table - Game items, resources, upgrades
export const items = pgTable("items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  itemType: varchar("item_type", { length: 50 }).notNull(),
  rarity: varchar("rarity", { length: 20 }).default("common").notNull(),
  value: decimal("value", { precision: 20, scale: 2 }).default("0.00").notNull(),
  stackable: boolean("stackable").default(true).notNull(),
  maxStack: integer("max_stack").default(100).notNull(),
  stats: jsonb("stats").default({}).notNull(),
  requirements: jsonb("requirements").default({}).notNull(),
  effects: jsonb("effects").default({}).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  typeIdx: index("items_type_idx").on(table.itemType),
  rarityIdx: index("items_rarity_idx").on(table.rarity),
}));

// Player inventory
export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  itemId: uuid("item_id").references(() => items.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").default(1).notNull(),
  acquiredAt: timestamp("acquired_at").defaultNow().notNull(),
}, (table) => ({
  userItemIdx: index("inventory_user_item_idx").on(table.userId, table.itemId),
  userIdIdx: index("inventory_user_id_idx").on(table.userId),
}));

// Market listings for player trading
export const marketListings = pgTable("market_listings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  sellerId: uuid("seller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  itemId: uuid("item_id").references(() => items.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 20, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 20, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
}, (table) => ({
  sellerIdx: index("market_seller_idx").on(table.sellerId),
  itemIdx: index("market_item_idx").on(table.itemId),
  activeIdx: index("market_active_idx").on(table.isActive),
  priceIdx: index("market_price_idx").on(table.pricePerUnit),
}));

// Battle logs for PvP combat
export const battles = pgTable("battles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  attacker: uuid("attacker").references(() => users.id, { onDelete: "cascade" }).notNull(),
  defender: uuid("defender").references(() => users.id, { onDelete: "cascade" }).notNull(),
  attackerShip: uuid("attacker_ship").references(() => ships.id).notNull(),
  defenderShip: uuid("defender_ship").references(() => ships.id).notNull(),
  winner: uuid("winner").references(() => users.id),
  battleData: jsonb("battle_data").notNull(),
  rewards: jsonb("rewards").default({}).notNull(),
  battleType: varchar("battle_type", { length: 20 }).default("pvp").notNull(),
  sectorId: uuid("sector_id").references(() => sectors.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  attackerIdx: index("battles_attacker_idx").on(table.attacker),
  defenderIdx: index("battles_defender_idx").on(table.defender),
  winnerIdx: index("battles_winner_idx").on(table.winner),
  createdAtIdx: index("battles_created_at_idx").on(table.createdAt),
}));

// Space corporations/guilds
export const guilds = pgTable("guilds", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  leaderId: uuid("leader_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  treasury: decimal("treasury", { precision: 20, scale: 2 }).default("0.00").notNull(),
  level: integer("level").default(1).notNull(),
  experience: integer("experience").default(0).notNull(),
  memberLimit: integer("member_limit").default(10).notNull(),
  isRecruiting: boolean("is_recruiting").default(true).notNull(),
  requirements: jsonb("requirements").default({}).notNull(),
  perks: jsonb("perks").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  nameIdx: index("guilds_name_idx").on(table.name),
  leaderIdx: index("guilds_leader_idx").on(table.leaderId),
}));

// Guild memberships
export const guildMembers = pgTable("guild_members", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  guildId: uuid("guild_id").references(() => guilds.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: varchar("role", { length: 20 }).default("member").notNull(),
  contribution: decimal("contribution", { precision: 20, scale: 2 }).default("0.00").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  guildUserIdx: index("guild_members_guild_user_idx").on(table.guildId, table.userId),
  guildIdx: index("guild_members_guild_idx").on(table.guildId),
}));

// Exploration logs
export const explorations = pgTable("explorations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sectorId: uuid("sector_id").references(() => sectors.id, { onDelete: "cascade" }).notNull(),
  shipId: uuid("ship_id").references(() => ships.id, { onDelete: "cascade" }).notNull(),
  actionType: varchar("action_type", { length: 30 }).notNull(),
  energyCost: integer("energy_cost").notNull(),
  results: jsonb("results").notNull(),
  rewards: jsonb("rewards").default({}).notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("explorations_user_idx").on(table.userId),
  sectorIdx: index("explorations_sector_idx").on(table.sectorId),
  createdAtIdx: index("explorations_created_at_idx").on(table.createdAt),
}));

// Define relations
export const usersRelations = relations(users, ({ many, one }) => ({
  ships: many(ships),
  inventory: many(inventory),
  marketListings: many(marketListings),
  battlesAsAttacker: many(battles, { relationName: "attacker" }),
  battlesAsDefender: many(battles, { relationName: "defender" }),
  battlesWon: many(battles, { relationName: "winner" }),
  sectorsDiscovered: many(sectors),
  guildsLed: many(guilds),
  guildMembership: one(guildMembers),
  explorations: many(explorations),
}));

export const shipsRelations = relations(ships, ({ one, many }) => ({
  user: one(users, {
    fields: [ships.userId],
    references: [users.id],
  }),
  battlesAsAttacker: many(battles, { relationName: "attackerShip" }),
  battlesAsDefender: many(battles, { relationName: "defenderShip" }),
  explorations: many(explorations),
}));

export const sectorsRelations = relations(sectors, ({ one, many }) => ({
  discoveredByUser: one(users, {
    fields: [sectors.discoveredBy],
    references: [users.id],
  }),
  battles: many(battles),
  explorations: many(explorations),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  inventoryEntries: many(inventory),
  marketListings: many(marketListings),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  user: one(users, {
    fields: [inventory.userId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [inventory.itemId],
    references: [items.id],
  }),
}));

export const marketListingsRelations = relations(marketListings, ({ one }) => ({
  seller: one(users, {
    fields: [marketListings.sellerId],
    references: [users.id],
  }),
  item: one(items, {
    fields: [marketListings.itemId],
    references: [items.id],
  }),
}));

export const battlesRelations = relations(battles, ({ one }) => ({
  attackerUser: one(users, {
    fields: [battles.attacker],
    references: [users.id],
    relationName: "attacker",
  }),
  defenderUser: one(users, {
    fields: [battles.defender],
    references: [users.id],
    relationName: "defender",
  }),
  winnerUser: one(users, {
    fields: [battles.winner],
    references: [users.id],
    relationName: "winner",
  }),
  attackerShipData: one(ships, {
    fields: [battles.attackerShip],
    references: [ships.id],
    relationName: "attackerShip",
  }),
  defenderShipData: one(ships, {
    fields: [battles.defenderShip],
    references: [ships.id],
    relationName: "defenderShip",
  }),
  sector: one(sectors, {
    fields: [battles.sectorId],
    references: [sectors.id],
  }),
}));

export const guildsRelations = relations(guilds, ({ one, many }) => ({
  leader: one(users, {
    fields: [guilds.leaderId],
    references: [users.id],
  }),
  members: many(guildMembers),
}));

export const guildMembersRelations = relations(guildMembers, ({ one }) => ({
  guild: one(guilds, {
    fields: [guildMembers.guildId],
    references: [guilds.id],
  }),
  user: one(users, {
    fields: [guildMembers.userId],
    references: [users.id],
  }),
}));

export const explorationsRelations = relations(explorations, ({ one }) => ({
  user: one(users, {
    fields: [explorations.userId],
    references: [users.id],
  }),
  sector: one(sectors, {
    fields: [explorations.sectorId],
    references: [sectors.id],
  }),
  ship: one(ships, {
    fields: [explorations.shipId],
    references: [ships.id],
  }),
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  joinedAt: true,
  lastActive: true,
});

export const insertShipSchema = createInsertSchema(ships).omit({
  id: true,
  createdAt: true,
});

export const insertSectorSchema = createInsertSchema(sectors).omit({
  id: true,
  discoveredAt: true,
  lastVisited: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  acquiredAt: true,
});

export const insertMarketListingSchema = createInsertSchema(marketListings).omit({
  id: true,
  createdAt: true,
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
  createdAt: true,
});

export const insertGuildSchema = createInsertSchema(guilds).omit({
  id: true,
  createdAt: true,
});

export const insertGuildMemberSchema = createInsertSchema(guildMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertExplorationSchema = createInsertSchema(explorations).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Ship = typeof ships.$inferSelect;
export type InsertShip = z.infer<typeof insertShipSchema>;
export type Sector = typeof sectors.$inferSelect;
export type InsertSector = z.infer<typeof insertSectorSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type MarketListing = typeof marketListings.$inferSelect;
export type InsertMarketListing = z.infer<typeof insertMarketListingSchema>;
export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;
export type Guild = typeof guilds.$inferSelect;
export type InsertGuild = z.infer<typeof insertGuildSchema>;
export type GuildMember = typeof guildMembers.$inferSelect;
export type InsertGuildMember = z.infer<typeof insertGuildMemberSchema>;
export type Exploration = typeof explorations.$inferSelect;
export type InsertExploration = z.infer<typeof insertExplorationSchema>;
