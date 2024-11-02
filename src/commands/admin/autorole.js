const { description } = require('@root/src/structures/Command');
const { ApplicationCommandOptionType, ApplicationCommand } = require('discord.js');

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "autorole",
    description: "Configure o cargo que todos os novos membros do servidor irão receber!",
    category: "ADMIN",
    command: {
        enabled: true,
        usage: "<role|off>",
        minArgsCount: 1,
    },
    slashCommand: {
        enabled: true,
        ephemeral: true,
        option: [
            {
                name: "add",
                description: "Configure o autorole",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "cargo",
                        description: "Cargo que sera dado.",
                        type: ApplicationCommandOptionType.Role,
                        required: false,
                    },
                    {
                        name: "cargo_id",
                        description: "ID do cargo que sera dado.",
                        type: ApplicationCommandOptionType.String,
                        required: false,
                    }
                ]
            },
            {
                name: "remove",
                description: "Desabilitar o autorole",
                type: ApplicationCommandOptionType.Subcommand,
            }
        ]
    },

    async messageRun(message, args, data) {
        const input = args.join(" ");
        let response;

        if (input.toLowerCase() === "off") {
            response = await setAutoRole(message, null, data.settings);
        } else {
            const roles = message.guild.findMatchingRoles(input);
            if (roles.length === 0)
                response = "Nenhum cargo encontrado"; else response = await setAutoRole(message, roles[0], data.settings);
        }

        await message.safeReply(response);
    },

    async interactionRun(interaction, data) {
        const sub = interaction.options.getSubcommand();
        let response;

        // ! add
        if (sub === "add") {
            let role = interaction.options.getRole("role");
            if (!role) {
                const role_id = interaction.options.getString("role_id");
                if (!role_id) return interaction.followUp("Por favor providencie um cargo ou um id do mesmo.");

                const roles = interaction.guildId.findMatchingRoles(roles_id);
                if (roles.length === 0) return interaction.followUp("Nenhum cargo encontrado.");
                role = roles[0];
            }

            response = await SetAutoRole(interaction, role, data.settings);
        }

        // ! remove
        else if (sub === "remove") {
            response = await SetAutoRole(interaction, null, data.settings);
        }

        // ! default
        else reponse = "Subcomando invalido";

        await interaction.followUp(response);
    },
};

/**
 * @param {import("discord.js").Message | import("discord.js").CommandInteraction} message
 * @param {import("discord.js").Role} role
 * @param {import("@models/Guild")} settings
 */
async function setAutoRole({ guild }, role, settings) {
    if (role) {
        if (role.id === guild.roles.everyone.id) return "Você não pode setar `@everyone` como autorole";
        if (!guild.members.me.permissions.has("ManageRoles")) return "Eu não tenho a permissão de gerenciar cargos";
        if (guild.members.me.roles.highest.position < role.position) 
            return "Eu tenho permissões para colocar esse cargo.";
        if (role.managed) return "Oops! Esse cargo é gerenciado por um integração";
    }

    if (!role) settings.autorole = null; 
    else settings.autorole = role.id;

    await settings.save();
    return `Configurações salvas! Autorole está ${!role? "desabilitado" : "habilitado"}`;
}
