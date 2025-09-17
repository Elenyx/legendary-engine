import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { IStorage } from '../../storage';
import { ExplorationService } from '../services/exploration';

export const exploreCommand = {
  data: new SlashCommandBuilder()
    .setName('explore')
    .setDescription('Explore a new sector of space and discover resources or encounters'),

  async execute(interaction: any, storage: IStorage) {
    await interaction.deferReply();

    try {
      // Get or create user
      let user = await storage.getUserByDiscordId(interaction.user.id);
      if (!user) {
        user = await storage.createUser({
          discordId: interaction.user.id,
          username: interaction.user.username,
          avatar: interaction.user.displayAvatarURL(),
        });

        // Create default ship
        await storage.createShip({
          userId: user.id,
          name: `${user.username}'s Explorer`,
          shipType: "explorer",
        });
      }

      // Get active ship
      const ship = await storage.getActiveShip(user.id);
      if (!ship) {
        return interaction.editReply({
          content: '❌ You need a ship to explore! Contact an admin to get your starting ship.',
        });
      }

      // Check energy
      if (user.energy < 10) {
        return interaction.editReply({
          content: `⚡ You need at least 10 energy to explore! You have ${user.energy}/${user.maxEnergy} energy.`,
        });
      }

      // Perform exploration
      const explorationService = new ExplorationService(storage);
      const result = await explorationService.explore(user, ship);

      // Update user energy
      await storage.updateUser(user.id, {
        energy: Math.max(0, user.energy - 10),
        lastActive: new Date(),
      });

      // Create result embed
      const embed = new EmbedBuilder()
        .setTitle('🌌 Space Exploration')
        .setDescription(result.description)
        .setColor(result.success ? 0x00D4FF : 0xFF4747)
        .addFields(
          { name: '🚀 Ship', value: ship.name, inline: true },
          { name: '📍 Sector', value: result.sector.name, inline: true },
          { name: '⚡ Energy Used', value: '10', inline: true }
        )
        .setTimestamp();

      if (result.rewards.length > 0) {
        embed.addFields({
          name: '🎁 Rewards',
          value: result.rewards.join('\n'),
          inline: false
        });
      }

      if (result.discovery) {
        embed.addFields({
          name: '🔍 Discovery',
          value: result.discovery,
          inline: false
        });
      }

      embed.setFooter({
        text: `Energy: ${Math.max(0, user.energy - 10)}/${user.maxEnergy}`,
        iconURL: interaction.user.displayAvatarURL()
      });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Explore command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while exploring. Please try again later.',
      });
    }
  },
};
