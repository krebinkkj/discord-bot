const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { postToBin } = require("@helpers/HttpUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "paste",
    description: "Cole algo na sourcen.in",
    cooldown: 5,
    category: "UTILIDADE",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        minArgsCount: 2,
        usage: "<titulo> <conteudo>",
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "titulo",
                description: "Titulo para o seu conteudo",
                required: "true",
                type: ApplicationCommandOptionType.String,
            },
            {
                name: "conteudo",
                description: "Conteudo que será postado",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        const title = args.shift();
        const content = args.join(" ");
        const response = await paste(content, title);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const title = interaction.options.getString("title");
        const content = interaction.options.getString("content");
        const response = await paste(content, title);
        await interaction.followUp(response);
    },
};

async function paste(content, title) {
    const response = await postToBin(content, title);
    if (!response) return "Algo deu errado";

    const embed = new EmbedBuilder()
    .setAuthor({ name: "Paste links"})
    .setDescription(`🔸 Normal: ${response.url}\n🔹 Raw: ${response.raw}`);

    return { embeds: [embed] };
}