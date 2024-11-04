const {
    ApplicationCommandOptionType,
    EmbedBuilder,
    ActivityType,
  } = require('discord.js')
  const { getPresenceConfig, updatePresenceConfig } = require('@schemas/RPC')
  const { EMBED_COLORS } = require('@root/config')
  const DEV_ID = process.env.DEV_ID // owner's user ID(s)
  
  /**
   * @type {import('@structures/Command')}
   */
  module.exports = {
    name: 'presence',
    description: 'Manage bot presence/status configuration',
    category: 'DONO', // Change this to OWNER if your DEV = OWNER
    botPermissions: ['EmbedLinks'],
    userPermissions: ['Administrator'],
    slashCommand: {
      enabled: true,
      ephemeral: true,
      options: [
        {
          name: 'view',
          description: 'View current presence configuration',
          type: ApplicationCommandOptionType.Subcommand,
        },
        {
          name: 'set',
          description: 'Set bot presence configuration',
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: 'enabled',
              description: 'Enable/disable presence updates',
              type: ApplicationCommandOptionType.Boolean,
              required: false,
            },
            {
              name: 'status',
              description: 'Set bot status',
              type: ApplicationCommandOptionType.String,
              required: false,
              choices: [
                { name: 'Online', value: 'online' },
                { name: 'Idle', value: 'idle' },
                { name: 'Do Not Disturb', value: 'dnd' },
                { name: 'Invisible', value: 'invisible' },
              ],
            },
            {
              name: 'type',
              description: 'Set activity type',
              type: ApplicationCommandOptionType.String,
              required: false,
              choices: [
                { name: 'Competing', value: 'COMPETING' },
                { name: 'Listening', value: 'LISTENING' },
                { name: 'Playing', value: 'PLAYING' },
                { name: 'Watching', value: 'WATCHING' },
                { name: 'Streaming', value: 'STREAMING' },
                { name: 'Custom', value: 'CUSTOM' },
              ],
            },
            {
              name: 'message',
              description:
                'Set status message ({servers} and {members} are supported)',
              type: ApplicationCommandOptionType.String,
              required: false,
            },
            {
              name: 'url',
              description: 'Set streaming URL (only for streaming type)',
              type: ApplicationCommandOptionType.String,
              required: false,
            },
          ],
        },
      ],
    },
  
    async interactionRun(interaction) {
      if (interaction.user.id !== DEV_ID) {
        return interaction.reply({
          content:
            "Aww, sorry cutie! You're not authorized to use this command! 💖",
          ephemeral: true,
        })
      }
      const sub = interaction.options.getSubcommand()
      if (sub === 'view') {
        return await viewPresence(interaction)
      }
      if (sub === 'set') {
        return await setPresence(interaction)
      }
    },
  }
  
  async function viewPresence(interaction) {
    const config = await getPresenceConfig()
  
    let message = config.PRESENCE.MESSAGE
    if (message.includes('{servers}')) {
      message = message.replaceAll(
        '{servers}',
        interaction.client.guilds.cache.size
      )
    }
    if (message.includes('{members}')) {
      const members = interaction.client.guilds.cache
        .map(g => g.memberCount)
        .reduce((partial_sum, a) => partial_sum + a, 0)
      message = message.replaceAll('{members}', members)
    }
  
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Bot Presence Configuration' })
      .setColor(EMBED_COLORS.BOT_EMBED)
      .setDescription("Here's the current presence configuration:")
      .addFields([
        {
          name: '✨ Status Updates',
          value: config.PRESENCE.ENABLED ? '`Enabled`' : '`Disabled`',
          inline: true,
        },
        {
          name: '🎮 Status',
          value: `\`${config.PRESENCE.STATUS}\``,
          inline: true,
        },
        {
          name: '📋 Activity Type',
          value: `\`${config.PRESENCE.TYPE}\``,
          inline: true,
        },
        { name: '💭 Message', value: `\`${message}\``, inline: false },
        {
          name: '🔗 Stream URL',
          value: config.PRESENCE.URL ? `\`${config.PRESENCE.URL}\`` : '`Not Set`',
          inline: false,
        },
      ])
      .setFooter({ text: 'Use /presence set to update these settings' })
  
    return interaction.followUp({ embeds: [embed] })
  }
  
  async function setPresence(interaction) {
    const enabled = interaction.options.getBoolean('enabled')
    const status = interaction.options.getString('status')
    const type = interaction.options.getString('type')
    const message = interaction.options.getString('message')
    const url = interaction.options.getString('url')
  
    const currentConfig = await getPresenceConfig()
  
    // If no options provided, return current config
    if (![enabled, status, type, message, url].some(opt => opt !== null)) {
      return interaction.followUp(
        '❌ You need to provide at least one setting to update!'
      )
    }
  
    const update = {
      PRESENCE: {
        ...currentConfig.PRESENCE,
        ...(enabled !== null && { ENABLED: enabled }),
        ...(status && { STATUS: status }),
        ...(type && { TYPE: type }),
        ...(message && { MESSAGE: message }),
        ...(url && { URL: url }),
      },
    }
  
    await updatePresenceConfig(update)
  
    // Update the bot's presence immediately
    if (update.PRESENCE.ENABLED) {
      let processedMessage = update.PRESENCE.MESSAGE
      if (processedMessage.includes('{servers}')) {
        processedMessage = processedMessage.replaceAll(
          '{servers}',
          interaction.client.guilds.cache.size
        )
      }
      if (processedMessage.includes('{members}')) {
        const members = interaction.client.guilds.cache
          .map(g => g.memberCount)
          .reduce((partial_sum, a) => partial_sum + a, 0)
        processedMessage = processedMessage.replaceAll('{members}', members)
      }
  
      const presence = {
        status: update.PRESENCE.STATUS,
        activities: [
          {
            name: processedMessage,
            type: ActivityType[update.PRESENCE.TYPE],
            ...(update.PRESENCE.TYPE === 'STREAMING' && {
              url: update.PRESENCE.URL,
            }),
          },
        ],
      }
  
      await interaction.client.user.setPresence(presence)
    } else {
      await interaction.client.user.setPresence({
        status: 'invisible',
        activities: [],
      })
    }
  
    const embed = new EmbedBuilder()
      .setAuthor({ name: 'Presence Updated' })
      .setColor(EMBED_COLORS.SUCCESS)
      .setDescription('✅ Bot presence configuration has been updated!')
      .addFields([
        {
          name: '✨ Status Updates',
          value: update.PRESENCE.ENABLED ? '`Enabled`' : '`Disabled`',
          inline: true,
        },
        {
          name: '🎮 Status',
          value: `\`${update.PRESENCE.STATUS}\``,
          inline: true,
        },
        {
          name: '📋 Activity Type',
          value: `\`${update.PRESENCE.TYPE}\``,
          inline: true,
        },
        {
          name: '💭 Message',
          value: `\`${update.PRESENCE.MESSAGE}\``,
          inline: false,
        },
        {
          name: '🔗 Stream URL',
          value: update.PRESENCE.URL ? `\`${update.PRESENCE.URL}\`` : '`Not Set`',
          inline: false,
        },
      ])
  
    return interaction.followUp({ embeds: [embed] })
  }
  