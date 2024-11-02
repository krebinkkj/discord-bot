const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "flagtranslation",
    description: "Configure a tradução por bandeira no servidor",
    category: "ADMIN",
    userPermissions: ["ManageGuild"],
    command: {
        enabled: true,
        aliases: ["flagtr"],
        minArgsCount: 1,
        usage: "<on|off>",
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        options: [
            {
                name: "status",
                description: "habilitado ou desabilitado",
                required: true,
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "ON",
                        value: "on",
                    },
                    {
                        name: "OFF",
                        value: "off",
                    },
                ],
            },
        ]
    },

    async messageRun(message, args, data) {
        const status = args[0].toLocaleLowerCase();
        if (!["on", "off"].includes(status)) return message.safeReply("Status inválido, o valor tem que ser (on | off)");

        const response = await setFlagTranslation(status, data.settings);
        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const response = await setFlagTranslation(interaction.options.getString("status"), data.settings);
        await interaction.followUp(response);
    },
};

async function setFlagTranslation(input, settings) {
    const status = input.toLowerCase() === "on" ? true : false;

    settings.flag_translation.enabled = status;
    await settings.save();

    return `Configuração salva! Flag translation agora está ${status ? "habilitado" : "desabilitado"}`;
}