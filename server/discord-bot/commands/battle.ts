import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { IStorage } from '../../storage';
import { CombatService } from '../services/combat';

export const battleCommand = {
  data: new SlashCommandBuilder()
    .setName('battle')
    .setDescription('Challenge another player to ship-to-ship combat')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('The player you want to battle')
        .setRequired(true)
    ),

  async execute(interaction: any, storage: IStorage) {
    await interaction.deferReply();

    try {
      // Get attacker
      let attacker = await storage.getUserByDiscordId(interaction.user.id);
      if (!attacker) {
        return interaction.editReply({
          content: '❌ You need to use `/explore` first to start your space journey!',
        });
      }

      // Get opponent
      const opponentUser = interaction.options.getUser('opponent');
      if (opponentUser.id === interaction.user.id) {
        return interaction.editReply({
          content: '❌ You cannot battle yourself!',
        });
      }

      if (opponentUser.bot) {
        return interaction.editReply({
          content: '❌ You cannot battle bots!',
        });
      }

      let defender = await storage.getUserByDiscordId(opponentUser.id);
      if (!defender) {
        return interaction.editReply({
          content: '❌ That player has not started their space journey yet!',
        });
      }

      // Get ships
      const attackerShip = await storage.getActiveShip(attacker.id);
      const defenderShip = await storage.getActiveShip(defender.id);

      if (!attackerShip) {
        return interaction.editReply({
          content: '❌ You need a ship to battle!',
        });
      }

      if (!defenderShip) {
        return interaction.editReply({
          content: '❌ Your opponent does not have an active ship!',
        });
      }

      // Check energy requirements
      if (attacker.energy < 20) {
        return interaction.editReply({
          content: `⚡ You need at least 20 energy to battle! You have ${attacker.energy}/${attacker.maxEnergy} energy.`,
        });
      }

      // Check cooldown (prevent spam battles)
      const recentBattles = await storage.getUserBattles(attacker.id, 1);
      if (recentBattles.length > 0) {
        const lastBattle = recentBattles[0];
        const timeSinceLastBattle = Date.now() - lastBattle.createdAt.getTime();
        const cooldownTime = 5 * 60 * 1000; // 5 minutes

        if (timeSinceLastBattle < cooldownTime) {
          const remainingTime = Math.ceil((cooldownTime - timeSinceLastBattle) / 60000);
          return interaction.editReply({
            content: `⏱️ You must wait ${remainingTime} more minutes before your next battle!`,
          });
        }
      }

      // Simulate battle
      const combatService = new CombatService(storage);
      const battleResult = await combatService.simulateBattle(attackerShip, defenderShip);

      // Determine winner and apply results
      const winner = battleResult.winner === 'attacker' ? attacker : defender;
      const loser = battleResult.winner === 'attacker' ? defender : attacker;
      const winnerShip = battleResult.winner === 'attacker' ? attackerShip : defenderShip;
      const loserShip = battleResult.winner === 'attacker' ? defenderShip : attackerShip;

      // Update energy and stats
      await storage.updateUser(attacker.id, {
        energy: attacker.energy - 20,
        lastActive: new Date(),
        totalBattlesWon: winner.id === attacker.id ? attacker.totalBattlesWon + 1 : attacker.totalBattlesWon,
      });

      // Apply ship damage
      await storage.updateShip(winnerShip.id, {
        hull: Math.max(0, winnerShip.hull - battleResult.winnerDamage),
      });

      await storage.updateShip(loserShip.id, {
        hull: Math.max(0, loserShip.hull - battleResult.loserDamage),
      });

      // Award rewards to winner
      const crystalReward = Math.floor(loser.nexiumCrystals * 0.05); // 5% of loser's crystals
      await storage.updateUser(winner.id, {
        nexiumCrystals: parseFloat(winner.nexiumCrystals) + crystalReward,
      });

      await storage.updateUser(loser.id, {
        nexiumCrystals: Math.max(0, parseFloat(loser.nexiumCrystals) - crystalReward),
      });

      // Log battle
      await storage.createBattle({
        attacker: attacker.id,
        defender: defender.id,
        attackerShip: attackerShip.id,
        defenderShip: defenderShip.id,
        winner: winner.id,
        battleData: battleResult,
        rewards: { crystalReward },
        battleType: 'pvp',
      });

      // Create battle result embed
      const embed = new EmbedBuilder()
        .setTitle('⚔️ Space Battle Complete')
        .setDescription(battleResult.description)
        .setColor(battleResult.winner === 'attacker' ? 0x00FF00 : 0xFF4747)
        .addFields(
          { 
            name: '🚀 Attacker', 
            value: `${interaction.user.username}\n${attackerShip.name}\nHull: ${Math.max(0, attackerShip.hull - battleResult.winnerDamage)}/${attackerShip.maxHull}`, 
            inline: true 
          },
          { 
            name: '🛡️ Defender', 
            value: `${opponentUser.username}\n${defenderShip.name}\nHull: ${Math.max(0, defenderShip.hull - battleResult.loserDamage)}/${defenderShip.maxHull}`, 
            inline: true 
          },
          { 
            name: '🏆 Victor', 
            value: battleResult.winner === 'attacker' ? interaction.user.username : opponentUser.username, 
            inline: true 
          }
        );

      if (crystalReward > 0) {
        embed.addFields({
          name: '💎 Rewards',
          value: `${crystalReward.toLocaleString()} Nexium Crystals`,
          inline: false
        });
      }

      embed.addFields(
        { name: '⚡ Energy Used', value: '20', inline: true },
        { name: '🎲 Battle Rounds', value: battleResult.rounds.toString(), inline: true },
        { name: '📊 Battle Rating', value: battleResult.rating || 'Standard', inline: true }
      );

      embed.setTimestamp()
        .setFooter({
          text: `Energy: ${attacker.energy - 20}/${attacker.maxEnergy}`,
          iconURL: interaction.user.displayAvatarURL()
        });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Battle command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred during battle. Please try again later.',
      });
    }
  },
};
