import { IStorage } from '../../storage';
import { User, Item } from '@shared/schema';

export class EconomyService {
  constructor(private storage: IStorage) {}

  async restoreEnergy(user: User): Promise<number> {
    const now = new Date();
    const lastRestore = new Date(user.lastEnergyRestore);
    const timeDiff = now.getTime() - lastRestore.getTime();
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));

    // Restore 1 energy per minute
    const energyToRestore = Math.min(minutesPassed, user.maxEnergy - user.energy);
    
    if (energyToRestore > 0) {
      const newEnergy = user.energy + energyToRestore;
      await this.storage.updateUser(user.id, {
        energy: newEnergy,
        lastEnergyRestore: now,
      });
      return newEnergy;
    }

    return user.energy;
  }

  async calculateMarketTrends(): Promise<{ [itemId: string]: { trend: 'rising' | 'falling' | 'stable', change: number } }> {
    // Get recent market activity
    const listings = await this.storage.getActiveMarketListings(100, 0);
    const trends: { [itemId: string]: { trend: 'rising' | 'falling' | 'stable', change: number } } = {};

    // Group by item
    const itemPrices: { [itemId: string]: number[] } = {};
    
    for (const listing of listings) {
      const itemId = listing.item.id;
      if (!itemPrices[itemId]) {
        itemPrices[itemId] = [];
      }
      itemPrices[itemId].push(parseFloat(listing.pricePerUnit));
    }

    // Calculate trends
    for (const [itemId, prices] of Object.entries(itemPrices)) {
      if (prices.length < 2) {
        trends[itemId] = { trend: 'stable', change: 0 };
        continue;
      }

      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const recentPrices = prices.slice(-Math.min(5, prices.length));
      const recentAvg = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;

      const change = ((recentAvg - avgPrice) / avgPrice) * 100;

      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (Math.abs(change) > 5) {
        trend = change > 0 ? 'rising' : 'falling';
      }

      trends[itemId] = { trend, change: Math.round(change * 100) / 100 };
    }

    return trends;
  }

  async getPopularItems(): Promise<Array<{ item: Item, listings: number, avgPrice: number }>> {
    const listings = await this.storage.getActiveMarketListings(1000, 0);
    const itemStats: { [itemId: string]: { item: Item, listings: number, totalPrice: number, count: number } } = {};

    for (const listing of listings) {
      const itemId = listing.item.id;
      if (!itemStats[itemId]) {
        itemStats[itemId] = {
          item: listing.item,
          listings: 0,
          totalPrice: 0,
          count: 0,
        };
      }

      itemStats[itemId].listings++;
      itemStats[itemId].totalPrice += parseFloat(listing.pricePerUnit);
      itemStats[itemId].count++;
    }

    return Object.values(itemStats)
      .map(stat => ({
        item: stat.item,
        listings: stat.listings,
        avgPrice: stat.totalPrice / stat.count,
      }))
      .sort((a, b) => b.listings - a.listings)
      .slice(0, 10);
  }

  async processMarketTransaction(buyerId: string, listingId: string): Promise<{ success: boolean, message: string }> {
    try {
      const listings = await this.storage.getActiveMarketListings(1000, 0);
      const listing = listings.find(l => l.id === listingId);

      if (!listing) {
        return { success: false, message: 'Listing not found or no longer available' };
      }

      const buyer = await this.storage.getUser(buyerId);
      if (!buyer) {
        return { success: false, message: 'Buyer not found' };
      }

      const seller = listing.seller;
      const totalPrice = parseFloat(listing.totalPrice);

      if (parseFloat(buyer.nexiumCrystals) < totalPrice) {
        return { success: false, message: 'Insufficient Nexium Crystals' };
      }

      if (seller.id === buyer.id) {
        return { success: false, message: 'Cannot buy your own listing' };
      }

      // Process transaction
      await this.storage.updateUser(buyer.id, {
        nexiumCrystals: (parseFloat(buyer.nexiumCrystals) - totalPrice).toString(),
      });

      await this.storage.updateUser(seller.id, {
        nexiumCrystals: (parseFloat(seller.nexiumCrystals) + totalPrice).toString(),
      });

      // Transfer item
      const existingInventory = await this.storage.getUserInventoryItem(buyer.id, listing.item.id);
      if (existingInventory) {
        await this.storage.updateInventoryQuantity(
          buyer.id,
          listing.item.id,
          existingInventory.quantity + listing.quantity
        );
      } else {
        await this.storage.addToInventory({
          userId: buyer.id,
          itemId: listing.item.id,
          quantity: listing.quantity,
        });
      }

      // Remove listing
      await this.storage.deleteMarketListing(listing.id);

      return { success: true, message: 'Transaction completed successfully' };

    } catch (error) {
      console.error('Market transaction error:', error);
      return { success: false, message: 'Transaction failed due to an error' };
    }
  }

  async generateDailyRewards(user: User): Promise<{ crystals: number, energy: number, items?: Array<{ name: string, quantity: number }> }> {
    const baseReward = 100;
    const levelBonus = user.rank * 10;
    const randomBonus = Math.floor(Math.random() * 50);
    
    const crystals = baseReward + levelBonus + randomBonus;
    const energyRestore = user.maxEnergy; // Full energy restore

    // 10% chance for bonus items
    const items: Array<{ name: string, quantity: number }> = [];
    if (Math.random() < 0.1) {
      const bonusItems = ['Fuel Cell', 'Repair Kit', 'Shield Booster', 'Energy Core'];
      const randomItem = bonusItems[Math.floor(Math.random() * bonusItems.length)];
      items.push({ name: randomItem, quantity: Math.floor(Math.random() * 3) + 1 });
    }

    // Update user
    await this.storage.updateUser(user.id, {
      nexiumCrystals: (parseFloat(user.nexiumCrystals) + crystals).toString(),
      energy: user.maxEnergy,
      lastEnergyRestore: new Date(),
    });

    return { crystals, energy: energyRestore, items: items.length > 0 ? items : undefined };
  }
}
