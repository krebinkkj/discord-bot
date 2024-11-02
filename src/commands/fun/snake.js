const SnakeGame = require("snakecord");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
    name: "cobra",
    description: "Jogue o joguinho da cobra",
    cooldown: 300,
    botPermissions: ["SendMessages", "EmbedLinks", "AddReactions", "ReadMessageHistory", "ManageMessages"],
    command: {
        enabled: true,
    },
    slashCommand: {
        enabled: true,
    },

    async messageRun(message, args) {
        await message.safeReply("**Iniciando o jogo da cobra**");
        await startSnakeGame(message);
    },

    async interactionRun(interaction) {
        await interaction.followUp("** Iniciando o jogo da cobra")
    },
};

async function startSnakeGame(data) {
    const snakeGame = new SnakeGame({
        title: "Jogo da cobra",
        color: "BLUE",
        timestamp: true,
        gameOverTitle: "GAME OVER",
    });

    await snakeGame.newGame(data);
}