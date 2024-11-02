const {
    ApplicationCommandOptionType,
    ChannelType,
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
  } = require("discord.js");
  const { isValidColor, isHex } = require("@helpers/Utils");
  
  /**
   * @type {import("@structures/Command")}
   */
  module.exports = {
    name: "embed",
    description: "enviar mensagem embed",
    category: "ADMIN",
    userPermissions: ["ManageMessages"],
    command: {
      enabled: true,
      usage: "<#canal>",
      minArgsCount: 1,
      aliases: ["dizer"],
    },
    slashCommand: {
      enabled: true,
      ephemeral: true,
      options: [
        {
          name: "canal",
          description: "canal para enviar embed",
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildText],
          required: true,
        },
      ],
    },
  
    async messageRun(message, args) {
      const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
      if (!channel) return message.reply("Por favor, forneça um canal válido");
      if (channel.type !== ChannelType.GuildText) return message.reply("Por favor, forneça um canal válido");
      if (!channel.canSendEmbeds()) {
        return message.reply("Não tenho permissão para enviar embeds nesse canal");
      }
      message.reply(`Configuração do embed iniciada em ${channel}`);
      await embedSetup(channel, message.member);
    },
  
    async interactionRun(interaction) {
      const channel = interaction.options.getChannel("canal");
      if (!channel.canSendEmbeds()) {
        return interaction.followUp("Não tenho permissão para enviar embeds nesse canal");
      }
      interaction.followUp(`Configuração do embed iniciada em ${channel}`);
      await embedSetup(channel, interaction.member);
    },
  };
  
  /**
   * @param {import('discord.js').GuildTextBasedChannel} channel
   * @param {import('discord.js').GuildMember} member
   */
  async function embedSetup(channel, member) {
    const sentMsg = await channel.send({
      content: "Clique no botão abaixo para começar",
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("EMBED_ADD").setLabel("Criar Embed").setStyle(ButtonStyle.Primary)
        ),
      ],
    });
  
    const btnInteraction = await channel
      .awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => i.customId === "EMBED_ADD" && i.member.id === member.id && i.message.id === sentMsg.id,
        time: 20000,
      })
      .catch((ex) => {});
  
    if (!btnInteraction) return sentMsg.edit({ content: "Nenhuma resposta recebida", components: [] });
  
    await btnInteraction.showModal(
      new ModalBuilder({
        customId: "EMBED_MODAL",
        title: "Gerador de Embed",
        components: [
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("title")
              .setLabel("Título do Embed")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("author")
              .setLabel("Autor do Embed")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("description")
              .setLabel("Descrição do Embed")
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("color")
              .setLabel("Cor do Embed")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId("footer")
              .setLabel("Rodapé do Embed")
              .setStyle(TextInputStyle.Short)
              .setRequired(false)
          ),
        ],
      })
    );
  
    // receber entrada do modal
    const modal = await btnInteraction
      .awaitModalSubmit({
        time: 1 * 60 * 1000,
        filter: (m) => m.customId === "EMBED_MODAL" && m.member.id === member.id && m.message.id === sentMsg.id,
      })
      .catch((ex) => {});
  
    if (!modal) return sentMsg.edit({ content: "Nenhuma resposta recebida, cancelando a configuração", components: [] });
  
    modal.reply({ content: "Embed enviado", ephemeral: true }).catch((ex) => {});
  
    const title = modal.fields.getTextInputValue("title");
    const author = modal.fields.getTextInputValue("author");
    const description = modal.fields.getTextInputValue("description");
    const footer = modal.fields.getTextInputValue("footer");
    const color = modal.fields.getTextInputValue("color");
  
    if (!title && !author && !description && !footer)
      return sentMsg.edit({ content: "Você não pode enviar um embed vazio!", components: [] });
  
    const embed = new EmbedBuilder();
    if (title) embed.setTitle(title);
    if (author) embed.setAuthor({ name: author });
    if (description) embed.setDescription(description);
    if (footer) embed.setFooter({ text: footer });
    if ((color && isValidColor(color)) || (color && isHex(color))) embed.setColor(color);
  
    // botão de adicionar/remover campo
    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("EMBED_FIELD_ADD").setLabel("Adicionar Campo").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("EMBED_FIELD_REM").setLabel("Remover Campo").setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId("EMBED_FIELD_DONE").setLabel("Concluído").setStyle(ButtonStyle.Primary)
    );
  
    await sentMsg.edit({
      content: "Por favor, adicione campos usando os botões abaixo. Clique em concluído quando terminar.",
      embeds: [embed],
      components: [buttonRow],
    });
  
    const collector = channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.member.id === member.id,
      message: sentMsg,
      idle: 5 * 60 * 1000,
    });
  
    collector.on("collect", async (interaction) => {
      if (interaction.customId === "EMBED_FIELD_ADD") {
        await interaction.showModal(
          new ModalBuilder({
            customId: "EMBED_ADD_FIELD_MODAL",
            title: "Adicionar Campo",
            components: [
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId("name")
                  .setLabel("Nome do Campo")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId("value")
                  .setLabel("Valor do Campo")
                  .setStyle(TextInputStyle.Paragraph)
                  .setRequired(true)
              ),
              new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                  .setCustomId("inline")
                  .setLabel("Inline? (true/false)")
                  .setStyle(TextInputStyle.Short)
                  .setValue("true")
                  .setRequired(true)
              ),
            ],
          })
        );
  
        // receber entrada do modal
        const modal = await interaction
          .awaitModalSubmit({
            time: 5 * 60 * 1000,
            filter: (m) => m.customId === "EMBED_ADD_FIELD_MODAL" && m.member.id === member.id,
          })
          .catch((ex) => {});
  
        if (!modal) return sentMsg.edit({ components: [] });
  
        modal.reply({ content: "Campo adicionado", ephemeral: true }).catch((ex) => {});
  
        const name = modal.fields.getTextInputValue("name");
        const value = modal.fields.getTextInputValue("value");
        let inline = modal.fields.getTextInputValue("inline").toLowerCase();
  
        if (inline === "true") inline = true;
        else if (inline === "false") inline = false;
        else inline = true; // padrão para true
  
        const fields = embed.data.fields || [];
        fields.push({ name, value, inline });
        embed.setFields(fields);
      }
  
      // remover campo
      else if (interaction.customId === "EMBED_FIELD_REM") {
        const fields = embed.data.fields;
        if (fields) {
          fields.pop();
          embed.setFields(fields);
          interaction.reply({ content: "Campo removido", ephemeral: true });
        } else {
          interaction.reply({ content: "Não há campos para remover", ephemeral: true });
        }
      }
  
      // concluído
      else if (interaction.customId === "EMBED_FIELD_DONE") {
        return collector.stop();
      }
  
      await sentMsg.edit({ embeds: [embed] });
    });
  
    collector.on("end", async (_collected, _reason) => {
      await sentMsg.edit({ content: "", components: [] });
    });
  }
  