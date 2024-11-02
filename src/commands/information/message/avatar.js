const avatarInfo = require("../shared/avatar");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "avatar",
    description: "Veja o avatar de algum membro",
    category: "INFORMAÇÃO",
    botPermissions: ["EmbedLinks"],
    command: {
        enabled: true,
        usage: "[@membro | ID]",
    },

    async messageRun(message, args) {
        const target = (await message.guild.resolveMember(args[0])) || message.member;
        const response = avatarInfo(target.user);
        await message.safeReply(response);
    },
};