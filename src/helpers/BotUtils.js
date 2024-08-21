const { getJson } = require("@helpers/HttpUtils");
const { success, warn, error } = require("@helpers/Logger");

module.exports = class BotUtils {
  /**
   * Check if the bot is up to date
   */
  static async checkForUpdates() {
    const response = await getJson("https://api.github.com/repos/krebinkkj/discord-bot/releases/latest");
    if (!response.success) return error("VersionCheck: Falha ao checar as atualizações do bot");
    if (response.data) {
      if (
        require("@root/package.json").version.replace(/[^0-9]/g, "") >= response.data.tag_name.replace(/[^0-9]/g, "")
      ) {
        success("VersionCheck: Bot está atualizado");
      } else {
        warn(`VersionCheck: ${response.data.tag_name} atualização disponivel`);
        warn("download: https://github.com/krebinkkj/discord-bot/releases/latest");
      }
    }
  }

  /**
   * Get the image url from the message
   * @param {import('discord.js').Message} message
   * @param {string[]} args
   */
  static async getImageFromMessage(message, args) {
    let url;

    // check for attachments
    if (message.attachments.size > 0) {
      const attachment = message.attachments.first();
      const attachUrl = attachment.url;
      const attachIsImage = attachUrl.endsWith(".png") || attachUrl.endsWith(".jpg") || attachUrl.endsWith(".jpeg");
      if (attachIsImage) url = attachUrl;
    }

    if (!url && args.length === 0) url = message.author.displayAvatarURL({ size: 256, extension: "png" });

    if (!url && args.length !== 0) {
      try {
        url = new URL(args[0]).href;
      } catch (ex) {
        /* Ignore */
      }
    }

    if (!url && message.mentions.users.size > 0) {
      url = message.mentions.users.first().displayAvatarURL({ size: 256, extension: "png" });
    }

    if (!url) {
      const member = await message.guild.resolveMember(args[0]);
      if (member) url = member.user.displayAvatarURL({ size: 256, extension: "png" });
    }

    if (!url) url = message.author.displayAvatarURL({ size: 256, extension: "png" });

    return url;
  }

  static get musicValidations() {
    return [
      {
        callback: ({ client, guildId }) => client.musicManager.getPlayer(guildId),
        message: "🚫 Nenhuma musica está tocando!",
      },
      {
        callback: ({ member }) => member.voice?.channelId,
        message: "🚫 Você precisa está no meu canal de voz.",
      },
      {
        callback: ({ member, client, guildId }) =>
          member.voice?.channelId === client.musicManager.getPlayer(guildId)?.channelId,
        message: "🚫 Você não está no mesmo canal de voz que o meu.",
      },
    ];
  }
};