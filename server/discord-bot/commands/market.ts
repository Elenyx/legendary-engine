import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { IStorage } from '../../storage';

export const marketCommand = {
  data: new SlashCommandBuilder()
    .setName('market')
    .setDescription('Access the galactic marketplace')
    .addSubcommand(subcommand =>
      subcommand
        .setName('browse')
        .setDescription('Browse available items for purchase')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('sell')
        .setDescription('List an item for sale')
        .addStringOption(option =>
          option.setName('item')
            .setDescription('Item name to sell')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('quantity')
            .setDescription('Quantity to sell')
            .setRequired(true)
            .setMinValue(1)
        )
        .addNumberOption(option =>
          option.setName('price')
            .setDescription('Price per unit in Nexium Crystals')
            .setRequired(true)
            .setMinValue(1)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('buy')
        .setDescription('Purchase an item from the market')
        .addStringOption(option =>
          option.setName('listing_id')
            .setDescription('The ID of the listing to purchase')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('my-listings')
        .setDescription('View your active market listings')
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

      const subcommand = interaction.options.getSubcommand();

      switch (subcommand) {
        case 'browse':
          await this.handleBrowse(interaction, storage, user);
          break;
        case 'sell':
          await this.handleSell(interaction, storage, user);
          break;
        case 'buy':
          await this.handleBuy(interaction, storage, user);
          break;
        case 'my-listings':
          await this.handleMyListings(interaction, storage, user);
          break;
      }

    } catch (error) {
      console.error('Market command error:', error);
      await interaction.editReply({
        content: '❌ An error occurred while accessing the market. Please try again later.',
      });
    }
  },

  async handleBrowse(interaction: any, storage: IStorage, user: any) {
    const listings = await storage.getActiveMarketListings(10, 0);

    if (listings.length === 0) {
      return interaction.editReply({
        content: '🏪 The galactic marketplace is currently empty. Be the first to list an item!',
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('🏪 Galactic Marketplace')
      .setDescription('Browse available items and resources')
      .setColor(0x6366F1)
      .setTimestamp();

    const listingFields = listings.slice(0, 8).map((listing, index) => ({
      name: `${index + 1}. ${listing.item.name}`,
      value: `**Quantity:** ${listing.quantity}\n` +
             `**Price:** ${parseFloat(listing.pricePerUnit).toLocaleString()} crystals/unit\n` +
             `**Total:** ${parseFloat(listing.totalPrice).toLocaleString()} crystals\n` +
             `**Seller:** ${listing.seller.username}\n` +
             `**ID:** \`${listing.id.slice(0, 8)}\``,
      inline: true
    }));

    embed.addFields(listingFields);

    embed.setFooter({
      text: `Use /market buy <listing_id> to purchase • ${listings.length} total listings`,
      iconURL: interaction.user.displayAvatarURL()
    });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('market_refresh')
          .setLabel('🔄 Refresh')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('market_next_page')
          .setLabel('➡️ Next Page')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(listings.length < 10)
      );

    await interaction.editReply({ embeds: [embed], components: [row] });
  },

  async handleSell(interaction: any, storage: IStorage, user: any) {
    const itemName = interaction.options.getString('item');
    const quantity = interaction.options.getInteger('quantity');
    const pricePerUnit = interaction.options.getNumber('price');

    // Check if user has the item
    const inventory = await storage.getUserInventory(user.id);
    const inventoryItem = inventory.find(inv => 
      inv.item.name.toLowerCase().includes(itemName.toLowerCase())
    );

    if (!inventoryItem) {
      return interaction.editReply({
        content: `❌ You don't have any **${itemName}** in your inventory!`,
      });
    }

    if (inventoryItem.quantity < quantity) {
      return interaction.editReply({
        content: `❌ You only have ${inventoryItem.quantity} **${inventoryItem.item.name}** but tried to sell ${quantity}!`,
      });
    }

    const totalPrice = pricePerUnit * quantity;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create market listing
    const listing = await storage.createMarketListing({
      sellerId: user.id,
      itemId: inventoryItem.item.id,
      quantity,
      pricePerUnit: pricePerUnit.toString(),
      totalPrice: totalPrice.toString(),
      expiresAt,
    });

    // Remove items from inventory
    const newQuantity = inventoryItem.quantity - quantity;
    if (newQuantity > 0) {
      await storage.updateInventoryQuantity(user.id, inventoryItem.item.id, newQuantity);
    } else {
      await storage.removeFromInventory(user.id, inventoryItem.item.id);
    }

    const embed = new EmbedBuilder()
      .setTitle('✅ Item Listed Successfully')
      .setDescription(`Your **${inventoryItem.item.name}** has been listed on the galactic marketplace!`)
      .setColor(0x00FF00)
      .addFields(
        { name: '📦 Item', value: inventoryItem.item.name, inline: true },
        { name: '📊 Quantity', value: quantity.toString(), inline: true },
        { name: '💰 Price per Unit', value: `${pricePerUnit.toLocaleString()} crystals`, inline: true },
        { name: '💎 Total Value', value: `${totalPrice.toLocaleString()} crystals`, inline: true },
        { name: '⏰ Expires', value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: true },
        { name: '🆔 Listing ID', value: `\`${listing.id.slice(0, 8)}\``, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: 'Buyers can purchase with /market buy <listing_id>',
        iconURL: interaction.user.displayAvatarURL()
      });

    await interaction.editReply({ embeds: [embed] });
  },

  async handleBuy(interaction: any, storage: IStorage, user: any) {
    const listingId = interaction.options.getString('listing_id');

    // Find the listing (assuming we can search by partial ID)
    const listings = await storage.getActiveMarketListings(100, 0);
    const listing = listings.find(l => l.id.startsWith(listingId));

    if (!listing) {
      return interaction.editReply({
        content: `❌ No active listing found with ID **${listingId}**. Use \`/market browse\` to see available items.`,
      });
    }

    if (listing.seller.id === user.id) {
      return interaction.editReply({
        content: '❌ You cannot buy your own listing!',
      });
    }

    const totalPrice = parseFloat(listing.totalPrice);

    if (parseFloat(user.nexiumCrystals) < totalPrice) {
      return interaction.editReply({
        content: `❌ You need ${totalPrice.toLocaleString()} Nexium Crystals but only have ${parseFloat(user.nexiumCrystals).toLocaleString()}!`,
      });
    }

    // Process the transaction
    // Deduct crystals from buyer
    await storage.updateUser(user.id, {
      nexiumCrystals: (parseFloat(user.nexiumCrystals) - totalPrice).toString(),
      lastActive: new Date(),
    });

    // Add crystals to seller
    await storage.updateUser(listing.seller.id, {
      nexiumCrystals: (parseFloat(listing.seller.nexiumCrystals) + totalPrice).toString(),
    });

    // Add item to buyer's inventory
    const existingInventory = await storage.getUserInventoryItem(user.id, listing.item.id);
    if (existingInventory) {
      await storage.updateInventoryQuantity(
        user.id, 
        listing.item.id, 
        existingInventory.quantity + listing.quantity
      );
    } else {
      await storage.addToInventory({
        userId: user.id,
        itemId: listing.item.id,
        quantity: listing.quantity,
      });
    }

    // Remove the listing
    await storage.deleteMarketListing(listing.id);

    const embed = new EmbedBuilder()
      .setTitle('✅ Purchase Complete')
      .setDescription(`Successfully purchased **${listing.item.name}** from ${listing.seller.username}!`)
      .setColor(0x00FF00)
      .addFields(
        { name: '📦 Item', value: listing.item.name, inline: true },
        { name: '📊 Quantity', value: listing.quantity.toString(), inline: true },
        { name: '💰 Total Cost', value: `${totalPrice.toLocaleString()} crystals`, inline: true },
        { name: '💎 Remaining Crystals', value: `${(parseFloat(user.nexiumCrystals) - totalPrice).toLocaleString()}`, inline: true },
        { name: '👤 Seller', value: listing.seller.username, inline: true },
        { name: '📍 Location', value: 'Added to your inventory', inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: 'Items added to your inventory',
        iconURL: interaction.user.displayAvatarURL()
      });

    await interaction.editReply({ embeds: [embed] });
  },

  async handleMyListings(interaction: any, storage: IStorage, user: any) {
    const listings = await storage.getUserMarketListings(user.id);

    if (listings.length === 0) {
      return interaction.editReply({
        content: '📦 You have no active market listings. Use `/market sell` to list items for sale!',
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📦 Your Market Listings')
      .setDescription(`You have ${listings.length} active listing(s)`)
      .setColor(0x6366F1)
      .setTimestamp();

    const listingFields = listings.slice(0, 8).map((listing, index) => ({
      name: `${index + 1}. ${listing.item.name}`,
      value: `**Quantity:** ${listing.quantity}\n` +
             `**Price:** ${parseFloat(listing.pricePerUnit).toLocaleString()} crystals/unit\n` +
             `**Total Value:** ${parseFloat(listing.totalPrice).toLocaleString()} crystals\n` +
             `**Listed:** <t:${Math.floor(listing.createdAt.getTime() / 1000)}:R>\n` +
             `**ID:** \`${listing.id.slice(0, 8)}\``,
      inline: true
    }));

    embed.addFields(listingFields);

    const totalValue = listings.reduce((sum, listing) => 
      sum + parseFloat(listing.totalPrice), 0
    );

    embed.setFooter({
      text: `Total potential earnings: ${totalValue.toLocaleString()} crystals`,
      iconURL: interaction.user.displayAvatarURL()
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
