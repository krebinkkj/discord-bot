const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "qrcode",
  description: "gerar um código QR para um texto ou URL",
  cooldown: 5,
  category: "UTILIDADE",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    usage: "<content|url>",
    minArgsCount: 1,
  },
  slashCommand: {
    enabled: true,
    options: [
      {
        name: "conteudo",
        description: "texto ou conteúdo para gerar um QR Code",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },

  async messageRun (message, args) {
    const content = args.join(" ");
    const response = await getQrCode(content, message.author, message.guild);
    await message.safeReply(response);
  },

  async interactionRun (interaction) {
    const content = interaction.options.getString("content");
    const response = await getQrCode(content, interaction.user, interaction.guild);
    await interaction.followUp(response);
  },
};

async function getQrCode (content, member, guild) {
  const response = await fetch(
    `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(content)}`
  );

  const qrCodeUrl = response.url;

  const embed = new EmbedBuilder()
    .setAuthor({ name: member.username })
    .setTitle(`QR Code`)
    .setDescription(`Aqui está o seu QR Code`)
    .setImage(qrCodeUrl)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setFooter({ text: guild.name })
    .setTimestamp();

  return { embeds: [embed] };
}