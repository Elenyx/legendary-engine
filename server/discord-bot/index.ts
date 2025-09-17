import { Client, GatewayIntentBits, Collection, Events, REST, Routes } from 'discord.js';
import { storage } from '../storage';
import { exploreCommand } from './commands/explore';
import { scanCommand } from './commands/scan';
import { jumpCommand } from './commands/jump';
import { battleCommand } from './commands/battle';
import { profileCommand } from './commands/profile';
import { marketCommand } from './commands/market';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || 'your_bot_token';
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'your_client_id';

class NexiumBot {
  private client: Client;
  private commands: Collection<string, any>;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.commands = new Collection();
    this.setupCommands();
    this.setupEventHandlers();
  }

  private setupCommands() {
    const commands = [
      exploreCommand,
      scanCommand,
      jumpCommand,
      battleCommand,
      profileCommand,
      marketCommand,
    ];

    for (const command of commands) {
      this.commands.set(command.data.name, command);
    }
  }

  private setupEventHandlers() {
    this.client.once(Events.ClientReady, (readyClient) => {
      console.log(`🚀 Nexium RPG Bot is online! Logged in as ${readyClient.user.tag}`);
    });

    this.client.on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction, storage);
      } catch (error) {
        console.error('Error executing command:', error);
        const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      }
    });
  }

  async deployCommands() {
    const rest = new REST().setToken(DISCORD_BOT_TOKEN);

    try {
      console.log('Started refreshing application (/) commands.');

      const commandData = this.commands.map(command => command.data.toJSON());

      await rest.put(
        Routes.applicationCommands(DISCORD_CLIENT_ID),
        { body: commandData },
      );

      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error('Error deploying commands:', error);
    }
  }

  async start() {
    await this.deployCommands();
    await this.client.login(DISCORD_BOT_TOKEN);
  }

  getClient() {
    return this.client;
  }
}

// Initialize and start bot if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const bot = new NexiumBot();
  bot.start().catch(console.error);
}

export { NexiumBot };
