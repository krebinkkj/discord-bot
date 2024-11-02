const { EmbedBuilder } = require("discord.js")
const { EMBED_COLORS } = require("@root/config")

/**
 * @param {import('discord.js').User} user
 */
module.exports = (user) => {
    const x64 = user.displayAvatarURL({ extension: "png", size: 64 });
    const x128 = user.displayAvatarURL({ extension: "png", size: 128 });
    const x256 = user.displayAvatarURL({ extension: "png", size: 256 });

    const embed = new EmbedBuilder()
    .setTitle(`Avatar de ${user.username}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setImage(x256)
    .setDescription(
        `Links:\n [x64](${x64})\n` +
        `[x128](${x128})\n` +
        `[x256](${x256})\n` 
    );

    return {
        embeds: [embed],
    };
};
