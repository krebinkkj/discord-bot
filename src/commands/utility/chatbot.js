const { ApplicationCommandOptionType, ChannelType, EmbedBuilder } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");
const config = require("@root/config");
const { getSettings } = require("@root/src/database/schemas/Guild");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "chatbot",
  description: "Configure canal do chatbot",
  category: "UTILIDADE",
  userPermissions: ["ManageGuild"],
  command: {
    enabled: true,
    usage: `set [Id do canal] ou chatbot delete`,
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [
      {
        name: "set",
        description: "Configure o chatbot",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "channel",
            description: "Canal para acionar o chatbot",
            required: false,
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
          },
        ],
      },
      {
        name: "delete",
        description: "Excluir canal do chatbot",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },

  async messageRun(message, args, data) {
    const input = args[0].toLowerCase();
    const response = await chatbot(message, input, data);
    await message.safeReply(response);
  },

  async interactionRun(interaction, data) {
    const subcommand = interaction.options.getSubcommand();
    const response = await chatbot(interaction, subcommand, data);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 * @param {string} input
 */
async function chatbot({ client, guildId, options, channel }, input, data) {
  if (input !== "set" && input !== "delete") {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription("Opção inválida. Por favor use `set` ou `delete`.");

    return { embeds: [embed] };
  }

  const sub = input;

  try {
    if (sub === "set") {
      let targetChannel = options?.getChannel("channel") || channel;

      if (!data.settings.chatbotId) {
        data.settings.chatbotId = targetChannel.id;
        await data.settings.save();

        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.SUCCESS)
          .setDescription(`Canal do chatbot definido para ${targetChannel}.`);

        return { embeds: [embed] };
      } else {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription(`O Chatbot já está configurado neste servidor. Canal atual: <#${data.settings.chatbotId}>`);

        return { embeds: [embed] };
      }
    } else if (sub === "delete") {
      if (!data.settings.chatbotId) {
        const embed = new EmbedBuilder()
          .setColor(EMBED_COLORS.ERROR)
          .setDescription("Nenhuma configuração de chatbot encontrada neste servidor");

        return { embeds: [embed] };
      }

      data.settings.chatbotId = undefined;
      await data.settings.save();

      const embed = new EmbedBuilder()
        .setColor(EMBED_COLORS.SUCCESS)
        .setDescription("O canal do chatbot foi apagado com sucesso.");

      return { embeds: [embed] };
    }
  } catch (error) {
    const embed = new EmbedBuilder()
      .setColor(EMBED_COLORS.ERROR)
      .setDescription(`Falha ao executar a operação. Erro: ${error.message}`);

    return { embeds: [embed] };
  }
}