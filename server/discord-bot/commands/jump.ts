import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { IStorage } from '../../storage';

export const jumpCommand = {
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription('Make a long-distance jump to a distant sector')
    .addStringOption(option =>
      option.setName('coordinates')
        .setDescription('Target coordinates (e.g., X-127:Y-495)')
        .setRequired(true)
    ),

  async execute(interaction: any, storage: IStorage) {
    await interaction.deferReply();

    try {
      let user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        return interaction.editReply({
          content: '❌ You need to use `/explore` first to start your space journey!',
        });
      }

      const ship = await storage.getActiveShip(user.id);
      if (!ship) {
        return interaction.editReply({
          content: '❌ You need a ship to jump! Contact an admin to get your starting ship.',
        });
      }

      const coordinates = interaction.options.getString('coordinates');
      const energyCost = this.calculateJumpCost(coordinates);

      if (user.energy < energyCost) {
        return interaction.editReply({
          content: `⚡ You need at least ${energyCost} energy for this jump! You have ${user.energy}/${user.maxEnergy} energy.`,
        });
      }

      if (ship.fuel < 20) {
        return interaction.editReply({
          content: `⛽ You need at least 20 fuel for a jump! You have ${ship.fuel}/${ship.maxFuel} fuel.`,
        });
      }

      // Check if sector exists, create if not
      let sector = await storage.getSector(coordinates);
      if (!sector) {
        sector = await storage.createSector({
          name: this.generateSectorName(coordinates),
          coordinates,
          sectorType: this.randomSectorType(),
          difficulty: Math.floor(Math.random() * 5) + 1,
          resources: this.generateResources(),
          hazards: this.generateHazards(),
        });
      }

      // Perform jump
      const success = Math.random() > 0.1; // 90% success rate
      
      if (success) {
        // Update user and ship
        await storage.updateUser(user.id, {
          energy: user.energy - energyCost,
          lastActive: new Date(),
        });

        await storage.updateShip(ship.id, {
          fuel: ship.fuel - 20,
        });

        // Update sector visit count
        await storage.updateSector(sector.id, {
          visitCount: sector.visitCount + 1,
          lastVisited: new Date(),
        });

        // Log exploration
        await storage.createExploration({
          userId: user.id,
          sectorId: sector.id,
          shipId: ship.id,
          actionType: 'jump',
          energyCost,
          results: { coordinates, success: true },
          rewards: {},
          success: true,
        });

        const embed = new EmbedBuilder()
          .setTitle('🌟 Hyperspace Jump Complete')
          .setDescription(`Successfully jumped to ${sector.name}!`)
          .setColor(0x00D4FF)
          .addFields(
            { name: '📍 Destination', value: `${sector.name} (${coordinates})`, inline: true },
            { name: '🌌 Sector Type', value: sector.sectorType, inline: true },
            { name: '⚠️ Difficulty', value: `Level ${sector.difficulty}`, inline: true },
            { name: '⚡ Energy Used', value: energyCost.toString(), inline: true },
            { name: '⛽ Fuel Used', value: '20', inline: true },
            { name: '👥 Previous Visitors', value: sector.visitCount.toString(), inline: true }
          )
          .setTimestamp()
          .setFooter({
            text: `Energy: ${user.energy - energyCost}/${user.maxEnergy} | Fuel: ${ship.fuel - 20}/${ship.maxFuel}`,
            iconURL: interaction.user.displayAvatarURL()
          });

        await interaction.editReply({ embeds: [embed] });

      } else {
        // Jump failed
        await storage.updateUser(user.id, {
          energy: Math.max(0, user.energy - Math.floor(energyCost / 2)),
          lastActive: new Date(),
        });

        await storage.updateShip(ship.id, {
          fuel: Math.max(0, ship.fuel - 10),
          hull: Math.max(0, ship.hull - 10),
        });

        const embed = new EmbedBuilder()
          .setTitle('⚠️ Jump Failure')
          .setDescription('Your hyperspace jump failed! Your ship took damage and you\'re stranded in space.')
          .setColor(0xFF4747)
          .addFields(
            { name: '💥 Hull Damage', value: '10 points', inline: true },
            { name: '⚡ Energy Lost', value: Math.floor(energyCost / 2).toString(), inline: true },
            { name: '⛽ Fuel Lost', value: '10', inline: true }
          )
          .setTimestamp()
          .setFooter({
            text: `Energy: ${Math.max(0, user.energy - Math.floor(energyCost / 2))}/${user.maxEnergy} | Hull: ${Math.max(0, ship.hull - 10)}/${ship.maxHull}`,
            iconURL: interaction.user.displayAvatarURL()
          });

        await interaction.editReply({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Jump command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred during the jump. Please try again later.',
      });
    }
  },

  calculateJumpCost(coordinates: string): number {
    // Calculate cost based on distance (simplified)
    const parts = coordinates.split(':');
    const x = Math.abs(parseInt(parts[0]?.split('-')[1] || '0'));
    const y = Math.abs(parseInt(parts[1]?.split('-')[1] || '0'));
    const distance = Math.sqrt(x * x + y * y);
    return Math.max(15, Math.floor(distance / 10));
  },

  generateSectorName(coordinates: string): string {
    const prefixes = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Sigma', 'Zeta'];
    const suffixes = ['Nebula', 'Cluster', 'System', 'Void', 'Expanse', 'Region'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix} ${suffix} ${coordinates}`;
  },

  randomSectorType(): string {
    const types = ['asteroid_field', 'gas_giant', 'planetary_system', 'nebula', 'binary_star', 'black_hole', 'ancient_ruins'];
    return types[Math.floor(Math.random() * types.length)];
  },

  generateResources(): object {
    const resources = ['iron', 'titanium', 'platinum', 'nexium_crystals', 'dark_matter'];
    const result: any = {};
    
    for (const resource of resources) {
      if (Math.random() < 0.3) {
        result[resource] = Math.floor(Math.random() * 100) + 10;
      }
    }
    
    return result;
  },

  generateHazards(): object {
    const hazards = ['radiation', 'gravity_wells', 'plasma_storms', 'space_pirates', 'temporal_anomalies'];
    const result: any = {};
    
    for (const hazard of hazards) {
      if (Math.random() < 0.2) {
        result[hazard] = Math.floor(Math.random() * 5) + 1;
      }
    }
    
    return result;
  },
};
