import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { IStorage } from '../../storage';

export const profileCommand = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your space exploration profile and statistics')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('View another player\'s profile')
        .setRequired(false)
    ),

  async execute(interaction: any, storage: IStorage) {
    await interaction.deferReply();

    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      
      let user = await storage.getUserByDiscordId(targetUser.id);
      if (!user) {
        if (targetUser.id === interaction.user.id) {
          return interaction.editReply({
            content: '❌ You need to use `/explore` first to start your space journey!',
          });
        } else {
          return interaction.editReply({
            content: '❌ That player has not started their space journey yet!',
          });
        }
      }

      // Get user's ships
      const ships = await storage.getUserShips(user.id);
      const activeShip = ships.find(ship => ship.isActive);

      // Get recent explorations
      const explorations = await storage.getUserExplorations(user.id, 5);

      // Get battle history
      const battles = await storage.getUserBattles(user.id, 5);

      // Get guild info
      const guild = await storage.getUserGuild(user.id);

      // Calculate time since last activity
      const lastActive = new Date(user.lastActive);
      const now = new Date();
      const timeDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60)); // minutes

      let lastActiveText = 'Just now';
      if (timeDiff > 0) {
        if (timeDiff < 60) {
          lastActiveText = `${timeDiff} minutes ago`;
        } else if (timeDiff < 1440) {
          lastActiveText = `${Math.floor(timeDiff / 60)} hours ago`;
        } else {
          lastActiveText = `${Math.floor(timeDiff / 1440)} days ago`;
        }
      }

      const embed = new EmbedBuilder()
        .setTitle(`🌌 ${user.username}'s Space Profile`)
        .setColor(0x00D4FF)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '💎 Nexium Crystals', value: parseFloat(user.nexiumCrystals).toLocaleString(), inline: true },
          { name: '⚡ Energy', value: `${user.energy}/${user.maxEnergy}`, inline: true },
          { name: '🏆 Rank', value: user.rank.toString(), inline: true },
          { name: '🌍 Sectors Explored', value: user.totalExplored.toString(), inline: true },
          { name: '⚔️ Battles Won', value: user.totalBattlesWon.toString(), inline: true },
          { name: '🕐 Last Active', value: lastActiveText, inline: true }
        );

      if (activeShip) {
        embed.addFields({
          name: '🚀 Active Ship',
          value: `**${activeShip.name}** (${activeShip.shipType})\n` +
                 `Hull: ${activeShip.hull}/${activeShip.maxHull}\n` +
                 `Shields: ${activeShip.shields}/${activeShip.maxShields}\n` +
                 `Level: ${activeShip.level} (${activeShip.experience} XP)`,
          inline: true
        });
      }

      if (guild) {
        embed.addFields({
          name: '🏢 Space Corporation',
          value: `**${guild.name}**\nMembers: ${guild.members.length}/${guild.memberLimit}`,
          inline: true
        });
      }

      if (ships.length > 1) {
        embed.addFields({
          name: '🛸 Fleet',
          value: `${ships.length} ships total`,
          inline: true
        });
      }

      if (explorations.length > 0) {
        const recentExplorations = explorations.slice(0, 3).map(exp => 
          `• ${exp.actionType} in ${exp.sector.name}`
        ).join('\n');
        
        embed.addFields({
          name: '📊 Recent Activity',
          value: recentExplorations,
          inline: false
        });
      }

      if (battles.length > 0) {
        const wins = battles.filter(b => b.winner === user.id).length;
        const winRate = Math.round((wins / battles.length) * 100);
        
        embed.addFields({
          name: '⚔️ Combat Stats',
          value: `Win Rate: ${winRate}% (${wins}/${battles.length} recent battles)`,
          inline: true
        });
      }

      embed.setTimestamp()
        .setFooter({
          text: `Player since ${new Date(user.joinedAt).toLocaleDateString()}`,
          iconURL: targetUser.displayAvatarURL()
        });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Profile command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while fetching the profile. Please try again later.',
      });
    }
  },
};
