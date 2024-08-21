const { parsePermissions } = require("@helpers/Utils");
const { timeformat } = require("@helpers/Utils");

const cooldownCache = new Map();

module.exports = {
  /**
   * @param {import('discord.js').ContextMenuInteraction} interaction
   * @param {import("@structures/BaseContext")} context
   */
  handleContext: async function (interaction, context) {
    // check cooldown
    if (context.cooldown) {
      const remaining = getRemainingCooldown(interaction.user.id, context);
      if (remaining > 0) {
        return interaction.reply({
          content: `Você está em cooldown. Você pode usar novamente o comando depois ${timeformat(remaining)}`,
          ephemeral: true,
        });
      }
    }

    // check user permissions
    if (interaction.member && context.userPermissions && context.userPermissions?.length > 0) {
      if (!interaction.member.permissions.has(context.userPermissions)) {
        return interaction.reply({
          content: `Você precisa ${parsePermissions(context.userPermissions)} para esse comando`,
          ephemeral: true,
        });
      }
    }

    try {
      await interaction.deferReply({ ephemeral: context.ephemeral });
      await context.run(interaction);
    } catch (ex) {
      interaction.followUp("Oops! Ocorreu um erro executando esse comando");
      interaction.client.logger.error("contextRun", ex);
    } finally {
      applyCooldown(interaction.user.id, context);
    }
  },
};

/**
 * @param {string} memberId
 * @param {object} context
 */
function applyCooldown(memberId, context) {
  const key = context.name + "|" + memberId;
  cooldownCache.set(key, Date.now());
}

/**
 * @param {string} memberId
 * @param {object} context
 */
function getRemainingCooldown(memberId, context) {
  const key = context.name + "|" + memberId;
  if (cooldownCache.has(key)) {
    const remaining = (Date.now() - cooldownCache.get(key)) * 0.001;
    if (remaining > context.cooldown) {
      cooldownCache.delete(key);
      return 0;
    }
    return context.cooldown - remaining;
  }
  return 0;
}