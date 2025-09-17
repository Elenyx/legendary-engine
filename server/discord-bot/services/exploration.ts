import { IStorage } from '../../storage';
import { User, Ship, Sector } from '@shared/schema';
import { UniverseGenerator } from '../utils/universe-generator';

export class ExplorationService {
  constructor(private storage: IStorage) {}

  async explore(user: User, ship: Ship) {
    const generator = new UniverseGenerator();
    
    // Generate or get a nearby sector
    const coordinates = generator.generateCoordinates();
    let sector = await this.storage.getSector(coordinates);
    
    if (!sector) {
      sector = await this.storage.createSector({
        name: generator.generateSectorName(),
        coordinates,
        sectorType: generator.randomSectorType(),
        difficulty: Math.floor(Math.random() * 5) + 1,
        resources: generator.generateResources(),
        hazards: generator.generateHazards(),
        discoveredBy: user.id,
      });
    } else {
      // Update sector visit count
      await this.storage.updateSector(sector.id, {
        visitCount: sector.visitCount + 1,
        lastVisited: new Date(),
      });
    }

    // Determine exploration success based on ship stats and sector difficulty
    const successChance = this.calculateSuccessChance(ship, sector);
    const success = Math.random() < successChance;

    const rewards: string[] = [];
    const experience = Math.floor(Math.random() * 20) + 10;

    if (success) {
      // Generate rewards based on sector type and resources
      if (sector.resources && typeof sector.resources === 'object') {
        const resourceKeys = Object.keys(sector.resources);
        if (resourceKeys.length > 0) {
          const resource = resourceKeys[Math.floor(Math.random() * resourceKeys.length)];
          const amount = Math.floor(Math.random() * 50) + 10;
          rewards.push(`💎 ${amount} ${resource.replace('_', ' ')}`);
        }
      }

      // Nexium crystals reward
      const crystalReward = Math.floor(Math.random() * 100) + 25;
      rewards.push(`💰 ${crystalReward} Nexium Crystals`);

      // Update user crystals
      await this.storage.updateUser(user.id, {
        nexiumCrystals: (parseFloat(user.nexiumCrystals) + crystalReward).toString(),
        totalExplored: user.totalExplored + 1,
      });
    }

    // Update ship experience
    await this.storage.updateShip(ship.id, {
      experience: ship.experience + experience,
      level: ship.level + (ship.experience + experience >= ship.level * 100 ? 1 : 0),
    });

    // Log exploration
    await this.storage.createExploration({
      userId: user.id,
      sectorId: sector.id,
      shipId: ship.id,
      actionType: 'explore',
      energyCost: 10,
      results: {
        success,
        coordinates,
        sectorType: sector.sectorType,
        difficulty: sector.difficulty,
      },
      rewards: { crystals: success ? Math.floor(Math.random() * 100) + 25 : 0 },
      success,
    });

    return {
      success,
      sector,
      rewards,
      experience,
      discovery: sector.discoveredBy === user.id ? `🌟 You discovered ${sector.name}!` : null,
      description: this.generateExplorationDescription(sector, success),
    };
  }

  async scan(user: User, ship: Ship) {
    const generator = new UniverseGenerator();
    
    // Generate multiple nearby sectors for scanning
    const sectors: Sector[] = [];
    for (let i = 0; i < 3; i++) {
      const coordinates = generator.generateCoordinates();
      let sector = await this.storage.getSector(coordinates);
      
      if (!sector) {
        sector = await this.storage.createSector({
          name: generator.generateSectorName(),
          coordinates,
          sectorType: generator.randomSectorType(),
          difficulty: Math.floor(Math.random() * 5) + 1,
          resources: generator.generateResources(),
          hazards: generator.generateHazards(),
        });
      }
      sectors.push(sector);
    }

    // Detect resources and anomalies
    const resources: string[] = [];
    const anomalies: string[] = [];

    for (const sector of sectors) {
      if (sector.resources && typeof sector.resources === 'object') {
        const resourceKeys = Object.keys(sector.resources);
        if (resourceKeys.length > 0) {
          resources.push(`📍 ${resourceKeys[0].replace('_', ' ')} detected in ${sector.name}`);
        }
      }

      if (sector.hazards && typeof sector.hazards === 'object') {
        const hazardKeys = Object.keys(sector.hazards);
        if (hazardKeys.length > 0) {
          anomalies.push(`⚠️ ${hazardKeys[0].replace('_', ' ')} in ${sector.name}`);
        }
      }
    }

    // Log scan
    await this.storage.createExploration({
      userId: user.id,
      sectorId: sectors[0].id,
      shipId: ship.id,
      actionType: 'scan',
      energyCost: 5,
      results: {
        sectorsScanned: sectors.length,
        resourcesDetected: resources.length,
        anomaliesDetected: anomalies.length,
      },
      rewards: {},
      success: true,
    });

    return {
      sectors,
      resources,
      anomalies,
    };
  }

  private calculateSuccessChance(ship: Ship, sector: Sector): number {
    const baseChance = 0.7; // 70% base success
    const levelBonus = ship.level * 0.02; // 2% per level
    const difficultyPenalty = sector.difficulty * 0.05; // 5% penalty per difficulty level
    
    return Math.max(0.1, Math.min(0.95, baseChance + levelBonus - difficultyPenalty));
  }

  private generateExplorationDescription(sector: Sector, success: boolean): string {
    const descriptions = {
      asteroid_field: success 
        ? `You successfully navigate through the ${sector.name} asteroid field, avoiding collisions and finding valuable minerals!`
        : `Your ship takes minor damage while navigating the treacherous ${sector.name} asteroid field.`,
      gas_giant: success
        ? `Your sensors detect rare gases and energy signatures around the massive ${sector.name} gas giant!`
        : `The intense radiation from ${sector.name} interferes with your ship's systems.`,
      planetary_system: success
        ? `You discover an inhabited planetary system in ${sector.name} with potential trading opportunities!`
        : `Hostile forces in the ${sector.name} system force you to retreat quickly.`,
      nebula: success
        ? `The beautiful ${sector.name} nebula yields exotic matter and energy readings!`
        : `Dense particle clouds in ${sector.name} damage your ship's sensors.`,
      binary_star: success
        ? `The unique electromagnetic properties of the ${sector.name} binary star system prove valuable for research!`
        : `Dangerous solar flares from ${sector.name} force an emergency retreat.`,
      black_hole: success
        ? `You carefully study the gravitational anomalies around ${sector.name} and make groundbreaking discoveries!`
        : `The intense gravitational forces of ${sector.name} nearly trap your ship!`,
      ancient_ruins: success
        ? `You uncover ancient alien artifacts in the mysterious ruins of ${sector.name}!`
        : `Automated defense systems in ${sector.name} activate, forcing you to flee.`,
    };

    return descriptions[sector.sectorType as keyof typeof descriptions] || 
           (success ? `You successfully explore ${sector.name}!` : `Your exploration of ${sector.name} encounters difficulties.`);
  }
}
