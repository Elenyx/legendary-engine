import { 
  users, ships, sectors, items, inventory, marketListings, battles, guilds, guildMembers, explorations,
  type User, type InsertUser, type Ship, type InsertShip, type Sector, type InsertSector,
  type Item, type InsertItem, type Inventory, type InsertInventory, type MarketListing, 
  type InsertMarketListing, type Battle, type InsertBattle, type Guild, type InsertGuild,
  type GuildMember, type InsertGuildMember, type Exploration, type InsertExploration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, gt, lt, sql, count, sum } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getTopPlayersByRank(limit: number): Promise<User[]>;
  
  // Ship methods
  getUserShips(userId: string): Promise<Ship[]>;
  getActiveShip(userId: string): Promise<Ship | undefined>;
  createShip(ship: InsertShip): Promise<Ship>;
  updateShip(id: string, updates: Partial<Ship>): Promise<Ship>;
  
  // Sector methods
  getSector(coordinates: string): Promise<Sector | undefined>;
  getSectorById(id: string): Promise<Sector | undefined>;
  createSector(sector: InsertSector): Promise<Sector>;
  updateSector(id: string, updates: Partial<Sector>): Promise<Sector>;
  getNearbySectors(coordinates: string, radius: number): Promise<Sector[]>;
  
  // Item methods
  getItem(id: string): Promise<Item | undefined>;
  getItemByName(name: string): Promise<Item | undefined>;
  getAllItems(): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  
  // Inventory methods
  getUserInventory(userId: string): Promise<(Inventory & { item: Item })[]>;
  getUserInventoryItem(userId: string, itemId: string): Promise<Inventory | undefined>;
  addToInventory(inventory: InsertInventory): Promise<Inventory>;
  updateInventoryQuantity(userId: string, itemId: string, quantity: number): Promise<Inventory>;
  removeFromInventory(userId: string, itemId: string): Promise<void>;
  
  // Market methods
  getActiveMarketListings(limit?: number, offset?: number): Promise<(MarketListing & { item: Item, seller: User })[]>;
  getMarketListingsByItem(itemId: string): Promise<(MarketListing & { item: Item, seller: User })[]>;
  getUserMarketListings(userId: string): Promise<(MarketListing & { item: Item })[]>;
  createMarketListing(listing: InsertMarketListing): Promise<MarketListing>;
  updateMarketListing(id: string, updates: Partial<MarketListing>): Promise<MarketListing>;
  deleteMarketListing(id: string): Promise<void>;
  
  // Battle methods
  getBattle(id: string): Promise<Battle | undefined>;
  getUserBattles(userId: string, limit?: number): Promise<(Battle & { attackerUser: User, defenderUser: User, winnerUser: User | null })[]>;
  createBattle(battle: InsertBattle): Promise<Battle>;
  
  // Guild methods
  getGuild(id: string): Promise<Guild | undefined>;
  getGuildByName(name: string): Promise<Guild | undefined>;
  getUserGuild(userId: string): Promise<(Guild & { members: (GuildMember & { user: User })[] }) | undefined>;
  createGuild(guild: InsertGuild): Promise<Guild>;
  joinGuild(membership: InsertGuildMember): Promise<GuildMember>;
  
  // Exploration methods
  getUserExplorations(userId: string, limit?: number): Promise<(Exploration & { sector: Sector })[]>;
  createExploration(exploration: InsertExploration): Promise<Exploration>;
  
  // Statistics methods
  getGlobalStats(): Promise<{
    totalPlayers: number;
    totalSectorsExplored: number;
    totalBattles: number;
    totalCrystalsInCirculation: string;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.discordId, discordId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getTopPlayersByRank(limit: number): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.rank)).limit(limit);
  }

  // Ship methods
  async getUserShips(userId: string): Promise<Ship[]> {
    return db.select().from(ships).where(eq(ships.userId, userId)).orderBy(desc(ships.isActive), desc(ships.level));
  }

  async getActiveShip(userId: string): Promise<Ship | undefined> {
    const [ship] = await db.select().from(ships).where(and(eq(ships.userId, userId), eq(ships.isActive, true)));
    return ship || undefined;
  }

  async createShip(ship: InsertShip): Promise<Ship> {
    const [newShip] = await db.insert(ships).values(ship).returning();
    return newShip;
  }

  async updateShip(id: string, updates: Partial<Ship>): Promise<Ship> {
    const [ship] = await db.update(ships).set(updates).where(eq(ships.id, id)).returning();
    return ship;
  }

  // Sector methods
  async getSector(coordinates: string): Promise<Sector | undefined> {
    const [sector] = await db.select().from(sectors).where(eq(sectors.coordinates, coordinates));
    return sector || undefined;
  }

  async getSectorById(id: string): Promise<Sector | undefined> {
    const [sector] = await db.select().from(sectors).where(eq(sectors.id, id));
    return sector || undefined;
  }

  async createSector(sector: InsertSector): Promise<Sector> {
    const [newSector] = await db.insert(sectors).values(sector).returning();
    return newSector;
  }

  async updateSector(id: string, updates: Partial<Sector>): Promise<Sector> {
    const [sector] = await db.update(sectors).set(updates).where(eq(sectors.id, id)).returning();
    return sector;
  }

  async getNearbySectors(coordinates: string, radius: number): Promise<Sector[]> {
    // This is a simplified version - in production you'd want proper spatial queries
    return db.select().from(sectors).limit(10);
  }

  // Item methods
  async getItem(id: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.id, id));
    return item || undefined;
  }

  async getItemByName(name: string): Promise<Item | undefined> {
    const [item] = await db.select().from(items).where(eq(items.name, name));
    return item || undefined;
  }

  async getAllItems(): Promise<Item[]> {
    return db.select().from(items).where(eq(items.isActive, true));
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db.insert(items).values(item).returning();
    return newItem;
  }

  // Inventory methods
  async getUserInventory(userId: string): Promise<(Inventory & { item: Item })[]> {
    const result = await db.select().from(inventory)
      .innerJoin(items, eq(inventory.itemId, items.id))
      .where(eq(inventory.userId, userId))
      .orderBy(asc(items.name));
    
    return result.map(row => ({
      ...row.inventory,
      item: row.items
    }));
  }

  async getUserInventoryItem(userId: string, itemId: string): Promise<Inventory | undefined> {
    const [item] = await db.select().from(inventory)
      .where(and(eq(inventory.userId, userId), eq(inventory.itemId, itemId)));
    return item || undefined;
  }

  async addToInventory(inventoryItem: InsertInventory): Promise<Inventory> {
    const [item] = await db.insert(inventory).values(inventoryItem).returning();
    return item;
  }

  async updateInventoryQuantity(userId: string, itemId: string, quantity: number): Promise<Inventory> {
    const [item] = await db.update(inventory)
      .set({ quantity })
      .where(and(eq(inventory.userId, userId), eq(inventory.itemId, itemId)))
      .returning();
    return item;
  }

  async removeFromInventory(userId: string, itemId: string): Promise<void> {
    await db.delete(inventory).where(and(eq(inventory.userId, userId), eq(inventory.itemId, itemId)));
  }

  // Market methods
  async getActiveMarketListings(limit = 50, offset = 0): Promise<(MarketListing & { item: Item, seller: User })[]> {
    const result = await db.select().from(marketListings)
      .innerJoin(items, eq(marketListings.itemId, items.id))
      .innerJoin(users, eq(marketListings.sellerId, users.id))
      .where(eq(marketListings.isActive, true))
      .orderBy(asc(marketListings.pricePerUnit))
      .limit(limit)
      .offset(offset);
    
    return result.map(row => ({
      ...row.market_listings,
      item: row.items,
      seller: row.users
    }));
  }

  async getMarketListingsByItem(itemId: string): Promise<(MarketListing & { item: Item, seller: User })[]> {
    const result = await db.select().from(marketListings)
      .innerJoin(items, eq(marketListings.itemId, items.id))
      .innerJoin(users, eq(marketListings.sellerId, users.id))
      .where(and(eq(marketListings.itemId, itemId), eq(marketListings.isActive, true)))
      .orderBy(asc(marketListings.pricePerUnit));
    
    return result.map(row => ({
      ...row.market_listings,
      item: row.items,
      seller: row.users
    }));
  }

  async getUserMarketListings(userId: string): Promise<(MarketListing & { item: Item })[]> {
    const result = await db.select().from(marketListings)
      .innerJoin(items, eq(marketListings.itemId, items.id))
      .where(eq(marketListings.sellerId, userId))
      .orderBy(desc(marketListings.createdAt));
    
    return result.map(row => ({
      ...row.market_listings,
      item: row.items
    }));
  }

  async createMarketListing(listing: InsertMarketListing): Promise<MarketListing> {
    const [newListing] = await db.insert(marketListings).values(listing).returning();
    return newListing;
  }

  async updateMarketListing(id: string, updates: Partial<MarketListing>): Promise<MarketListing> {
    const [listing] = await db.update(marketListings).set(updates).where(eq(marketListings.id, id)).returning();
    return listing;
  }

  async deleteMarketListing(id: string): Promise<void> {
    await db.delete(marketListings).where(eq(marketListings.id, id));
  }

  // Battle methods
  async getBattle(id: string): Promise<Battle | undefined> {
    const [battle] = await db.select().from(battles).where(eq(battles.id, id));
    return battle || undefined;
  }

  async getUserBattles(userId: string, limit = 10): Promise<(Battle & { attackerUser: User, defenderUser: User, winnerUser: User | null })[]> {
    const result = await db.select({
      battle: battles,
      attackerUser: users,
      defenderUser: users,
      winnerUser: users
    }).from(battles)
      .innerJoin(users, eq(battles.attacker, users.id))
      .where(or(eq(battles.attacker, userId), eq(battles.defender, userId)))
      .orderBy(desc(battles.createdAt))
      .limit(limit);

    // This is a simplified version - proper implementation would need separate queries for each user
    const battles_with_users: any[] = [];
    for (const battle of result) {
      const attackerUser = await this.getUser(battle.battle.attacker);
      const defenderUser = await this.getUser(battle.battle.defender);
      const winnerUser = battle.battle.winner ? await this.getUser(battle.battle.winner) : null;
      
      battles_with_users.push({
        ...battle.battle,
        attackerUser,
        defenderUser,
        winnerUser
      });
    }
    
    return battles_with_users;
  }

  async createBattle(battle: InsertBattle): Promise<Battle> {
    const [newBattle] = await db.insert(battles).values(battle).returning();
    return newBattle;
  }

  // Guild methods
  async getGuild(id: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.id, id));
    return guild || undefined;
  }

  async getGuildByName(name: string): Promise<Guild | undefined> {
    const [guild] = await db.select().from(guilds).where(eq(guilds.name, name));
    return guild || undefined;
  }

  async getUserGuild(userId: string): Promise<(Guild & { members: (GuildMember & { user: User })[] }) | undefined> {
    const memberRecord = await db.select().from(guildMembers)
      .innerJoin(guilds, eq(guildMembers.guildId, guilds.id))
      .where(eq(guildMembers.userId, userId));
    
    if (!memberRecord.length) return undefined;
    
    const guild = memberRecord[0].guilds;
    const members = await db.select().from(guildMembers)
      .innerJoin(users, eq(guildMembers.userId, users.id))
      .where(eq(guildMembers.guildId, guild.id));
    
    return { ...guild, members } as any;
  }

  async createGuild(guild: InsertGuild): Promise<Guild> {
    const [newGuild] = await db.insert(guilds).values(guild).returning();
    return newGuild;
  }

  async joinGuild(membership: InsertGuildMember): Promise<GuildMember> {
    const [member] = await db.insert(guildMembers).values(membership).returning();
    return member;
  }

  // Exploration methods
  async getUserExplorations(userId: string, limit = 10): Promise<(Exploration & { sector: Sector })[]> {
    const result = await db.select().from(explorations)
      .innerJoin(sectors, eq(explorations.sectorId, sectors.id))
      .where(eq(explorations.userId, userId))
      .orderBy(desc(explorations.createdAt))
      .limit(limit);
    
    return result.map(row => ({
      ...row.explorations,
      sector: row.sectors
    }));
  }

  async createExploration(exploration: InsertExploration): Promise<Exploration> {
    const [newExploration] = await db.insert(explorations).values(exploration).returning();
    return newExploration;
  }

  // Statistics methods
  async getGlobalStats(): Promise<{
    totalPlayers: number;
    totalSectorsExplored: number;
    totalBattles: number;
    totalCrystalsInCirculation: string;
  }> {
    const [playerCount] = await db.select({ count: count() }).from(users);
    const [sectorCount] = await db.select({ count: count() }).from(sectors);
    const [battleCount] = await db.select({ count: count() }).from(battles);
    const [crystalSum] = await db.select({ sum: sum(users.nexiumCrystals) }).from(users);

    return {
      totalPlayers: playerCount.count,
      totalSectorsExplored: sectorCount.count,
      totalBattles: battleCount.count,
      totalCrystalsInCirculation: crystalSum.sum || "0",
    };
  }
}

export const storage = new DatabaseStorage();
