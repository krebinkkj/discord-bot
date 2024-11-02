const { EmbedBuilder, ApplicationCommandOptionType } = require("discord.js");
const { MESSAGES, EMBED_COLORS } = require("@root/config");
const { getJson }  = require("@helpers/HttpUtils");
const { stripIndent } = require("common-tags");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "pokedex",
    description: "Mostra a informação de um pokemon",
    category: "UTILIDADE",
    botPermissions: ["EmbedLinks"],
    cooldown: 5,
    command: {
        enabled: true,
        usage: "<pokemon>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        options: [
            {
                name: "pokemon",
                description: "Nome do pokemon que você que ver as informações",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args) {
        const pokemon = args.join(" ");
        const response = await pokedex(pokemon);
        await message.safeReply(response);
    },

    async interactionRun(interaction) {
        const pokemon = interaction.options.getString("pokemon");
        const response = await pokedex(pokemon);
        await interaction.followUp(response);
    },
};

async function pokedex(pokemon) {
    const response = await getJson(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`);
    if (response.status === 404) return "```O pokemon não foi encontrado```";
    if (!response.success) return MESSAGES.API_ERROR;

    const json = response.data[0];

    const embed = new EmbedBuilder()
    .setTitle(`Pokédex - ${json.name}`)
    .setColor(EMBED_COLORS.BOT_EMBED)
    .setThumbnail(json.sprite)
    .setDescription(
        stripIndent`
       ♢ **ID**: ${json.number}
       ♢ **Nome**: ${json.name}
       ♢ **Espécie**: ${json.species}
       ♢ **Tipo(s)**: ${json.types}
       ♢ **Habilidade**: ${json.abilities.normal}
       ♢ **Hablidade escondida**: ${json.abilities.hidden}
       ♢ **Grupo de ovo(s)**: ${json.eggGroups}
       ♢ **Genero**: ${json.gender}
       ♢ **Altura**: ${json.height}
       ♢ **Peso**: ${json.weight}
       ♢ **Estágio de evolução atual**: ${json.family.evolutionStage}
       ♢ **Linha evolutiva**: ${json.family.evolutionLine}
       ♢ **É inicial?** ${json.starter}
       ♢ **É Lendario?**: ${json.legendary}
       ♢ **É Mitico?**: ${json.mythical}
       ♢ **Geração**: ${json.gen}
        `
    )
    .setFooter({ text: json.description });

    return { embeds: [embed] };
}