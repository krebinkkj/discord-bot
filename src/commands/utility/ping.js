const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { EMBED_COLORS } = require("@root/config");

/**
 * @type {import("@structures/Command")}
 */

module.exports = {
    name: "ping",
    description: "Obtenha o ping do bot",
    cooldown: 3,
    category: "UTILIDADE",
    botPermissions: ["EmbedLinks"],
    userPermissions: [],
    command: {
        enabled: true,
        aliases: [],
        usage: "",
        minArgsCount: 0,
    },
    slashCommand: {
        enabled: true,
        options: [],
    },

    async messageRun(message, args) {
        const response = await getPingData(message.client);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const response  = await getPingData(interaction.client);
        await interaction.followUp(response);
    },
};

async function getPingData(client) {
    let circles = {
        good: '<:Bom:1302640218762903663>',
        okay: '<:Ok:1302640603225391235>',
        bad: '<:Ruim:1302640809622900736>'
    };

    // Simulate pinging
    const ws = client.ws.ping;
    const msgEdit = Date.now() - (client.lastPing || Date.now());

    // Uptime calculation
    let days = Math.floor(client.uptime / 86400000);
    let hours = Math.floor(client.uptime /3600000) % 24;
    let minutes = Math.floor(client.uptime / 60000) & 60;
    let seconds = Math.floor(client.uptime / 1000) % 60;

    const wsEmoji = ws <=100 ? circles.good : ws <= 200 ? circles.okay : circles.bad;
    const msgEmoji = msgEdit <= 200 ? circles.good : circles.bad;

    const pingEmbed = new EmbedBuilder()
        .setThumbnail(client.user.displayAvatarURL({ size: 64 }))
        .setColor(EMBED_COLORS.BOT_EMBED)
        .setTimestamp()
        .setFooter({ text: `Pingado em` })
        .addFields(
            {
                name: 'Latencia da websocket',
                value: `${wsEmoji} \`${ws}ms\``
            },
            { 
                name: 'Latencia da API',
                value: `${msgEmoji} \`${ws}ms\``
            },
            {
                name: `${client.user.username} Uptime`,
                value: `<:Timer:1302643602110812213> \`${days} dias, ${hours} horas, ${minutes} minutos, ${seconds} segundos\``,
            }
        );

        return { embeds: [pingEmbed] };
}