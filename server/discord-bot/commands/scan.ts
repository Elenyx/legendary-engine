import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { IStorage } from '../../storage';
import { ExplorationService } from '../services/exploration';

export const scanCommand = {
  data: new SlashCommandBuilder()
    .setName('scan')
    .setDescription('Scan nearby sectors for resources and anomalies'),

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
          content: '❌ You need a ship to scan! Contact an admin to get your starting ship.',
        });
      }

      if (user.energy < 5) {
        return interaction.editReply({
          content: `⚡ You need at least 5 energy to scan! You have ${user.energy}/${user.maxEnergy} energy.`,
        });
      }

      const explorationService = new ExplorationService(storage);
      const result = await explorationService.scan(user, ship);

      // Update user energy
      await storage.updateUser(user.id, {
        energy: Math.max(0, user.energy - 5),
        lastActive: new Date(),
      });

      const embed = new EmbedBuilder()
        .setTitle('🔍 Sector Scan')
        .setDescription('Your ship\'s sensors have detected the following:')
        .setColor(0x6366F1)
        .addFields(
          { name: '🚀 Ship', value: ship.name, inline: true },
          { name: '⚡ Energy Used', value: '5', inline: true },
          { name: '📊 Scan Range', value: '5 light-years', inline: true }
        )
        .setTimestamp();

      if (result.sectors.length > 0) {
        const sectorList = result.sectors.map(sector => 
          `**${sector.name}** - ${sector.sectorType} (Difficulty: ${sector.difficulty})`
        ).join('\n');
        
        embed.addFields({
          name: '🌌 Nearby Sectors',
          value: sectorList,
          inline: false
        });
      }

      if (result.resources.length > 0) {
        embed.addFields({
          name: '💎 Detected Resources',
          value: result.resources.join('\n'),
          inline: false
        });
      }

      if (result.anomalies.length > 0) {
        embed.addFields({
          name: '⚠️ Anomalies Detected',
          value: result.anomalies.join('\n'),
          inline: false
        });
      }

      embed.setFooter({
        text: `Energy: ${Math.max(0, user.energy - 5)}/${user.maxEnergy}`,
        iconURL: interaction.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Scan command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while scanning. Please try again later.',
      });
    }
  },
};
