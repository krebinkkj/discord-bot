const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "setprefix",
    description: "Configure um novo prefixo para o bot",
    category: "ADMIN",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        usage: "<novo-prefixo>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "novo-prefixo",
                description: "novo prefixo para o bot",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },

    async messageRun(message, args, data) {
        const newPrefix = args[0];
        const response = await setNewPrefix(newPrefix, data.settings);
        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const response = await setNewPrefix(interaction.options.getString("newprefix"), data.settings);
        await interaction.followUp(response);
    },
};

async function setNewPrefix(newPrefix, settings) {
    if (newPrefix.length > 2) return "O novo prefixo não pode passar de **2** caracteres";
    settings.prefix = newPrefix;
    await settings.save();

    return `O novo prefixo foi setado para \`${newPrefix}\``;
}