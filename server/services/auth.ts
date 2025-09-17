import { storage } from '../storage';
import { insertUserSchema } from '@shared/schema';
import { z } from 'zod';

export interface AuthUser {
  id: string;
  discordId: string;
  username: string;
  avatar?: string;
}

export class AuthService {
  async validateDiscordUser(profile: any): Promise<AuthUser> {
    // Validate the Discord profile data
    const userData = {
      discordId: profile.id,
      username: profile.username,
      avatar: profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png` : undefined,
    };

    // Check if user exists
    let user = await storage.getUserByDiscordId(profile.id);
    
    if (!user) {
      // Create new user
      user = await storage.createUser(userData);
      
      // Create default ship for new user
      await storage.createShip({
        userId: user.id,
        name: `${user.username}'s Explorer`,
        shipType: "explorer",
      });

      // Give starting resources
      await this.giveStartingResources(user.id);
    } else {
      // Update existing user data
      await storage.updateUser(user.id, {
        username: userData.username,
        avatar: userData.avatar,
        lastActive: new Date(),
      });
    }

    return {
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar || undefined,
    };
  }

  private async giveStartingResources(userId: string): Promise<void> {
    // Give some starting items to new players
    const startingItems = [
      { name: 'Basic Fuel Cell', type: 'fuel', quantity: 5 },
      { name: 'Hull Repair Kit', type: 'repair', quantity: 3 },
      { name: 'Scanner Upgrade', type: 'upgrade', quantity: 1 },
    ];

    for (const item of startingItems) {
      // Check if item exists in database
      let gameItem = await storage.getItemByName(item.name);
      
      if (!gameItem) {
        // Create the item if it doesn't exist
        gameItem = await storage.createItem({
          name: item.name,
          description: `A basic ${item.type} item for new explorers`,
          itemType: item.type,
          rarity: 'common',
          value: '10.00',
          stackable: true,
          maxStack: 100,
          stats: {},
          requirements: {},
          effects: {},
        });
      }

      // Add to user's inventory
      await storage.addToInventory({
        userId,
        itemId: gameItem.id,
        quantity: item.quantity,
      });
    }
  }

  async refreshUserData(userId: string): Promise<AuthUser | null> {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar || undefined,
    };
  }

  async updateLastActive(userId: string): Promise<void> {
    await storage.updateUser(userId, {
      lastActive: new Date(),
    });
  }

  async getUserStats(userId: string) {
    const user = await storage.getUser(userId);
    if (!user) return null;

    const ships = await storage.getUserShips(userId);
    const activeShip = ships.find(ship => ship.isActive);
    const inventory = await storage.getUserInventory(userId);
    const explorations = await storage.getUserExplorations(userId, 10);
    const battles = await storage.getUserBattles(userId, 10);
    const guild = await storage.getUserGuild(userId);

    return {
      user,
      ships,
      activeShip,
      inventory,
      explorations,
      battles,
      guild,
      stats: {
        totalShips: ships.length,
        totalItems: inventory.reduce((sum, inv) => sum + inv.inventory.quantity, 0),
        winRate: battles.length > 0 ? 
          (battles.filter(b => b.battles.winner === userId).length / battles.length) * 100 : 0,
        lastExploration: explorations[0]?.exploration.createdAt || null,
      }
    };
  }

  async isUserAuthorized(userId: string, action: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    if (!user) return false;

    // Basic authorization logic
    switch (action) {
      case 'trade':
        return user.energy >= 5;
      case 'battle':
        return user.energy >= 20;
      case 'explore':
        return user.energy >= 10;
      case 'market':
        return true; // Everyone can access market
      default:
        return true;
    }
  }
}

export const authService = new AuthService();
