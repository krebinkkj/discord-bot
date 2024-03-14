const Discord = require('discord.js');

const Functions = require("../../database/models/functions");

module.exports = async (client, guild) => {
    const webhookClient = new Discord.WebhookClient({
        id: client.webhooks.serverLogs.id,
        token: client.webhooks.serverLogs.token,
    });

    if (guild == undefined) return;

    new Functions({
        Guild: guild.id,
        Prefix: client.config.discord.prefix
    }).save();

    try {
        const promises = [
            client.shard.broadcastEval(client => client.guilds.cache.size),
            client.shard.broadcastEval(client => client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)),
        ];
        Promise.all(promises)
            .then(async (results) => {
                const totalGuilds = results[0].reduce((acc, guildCount) => acc + guildCount, 0);
                const embed = new Discord.EmbedBuilder()
                    .setTitle("🟢・Adicionado em um novo servidor!")
                    .addFields(
                        { name: "Servidores totais:", value: `${totalGuilds}`, inline: true },
                        { name: "Nome do servidor", value: `${guild.name}`, inline: true },
                        { name: "ID do servidor", value: `${guild.id}`, inline: true },
                        { name: "Membros do servidor", value: `${guild.memberCount}`, inline: true },
                        { name: "Dono do servidor", value: `<@!${guild.ownerId}> (${guild.ownerId})`, inline: true },
                    )
                    .setThumbnail("https://cdn.discordapp.com/attachments/843487478881976381/852419422392156210/BotPartyEmote.png")
                    .setColor(client.config.colors.normal)
                webhookClient.send({
                    username: 'Bot Logs',
                    avatarURL: client.user.avatarURL(),
                    embeds: [embed],
                });
            })

        let defaultChannel = "";
        guild.channels.cache.forEach((channel) => {
            if (channel.type == Discord.ChannelType.GuildText && defaultChannel == "") {
                if (channel.permissionsFor(guild.members.me).has(Discord.PermissionFlagsBits.SendMessages)) {
                    defaultChannel = channel;
                }
            }
        })

        let row = new Discord.ActionRowBuilder()
            .addComponents(
                new Discord.ButtonBuilder()
                    .setLabel("Invite")
                    .setURL(client.config.discord.botInvite)
                    .setStyle(Discord.ButtonStyle.Link),

                new Discord.ButtonBuilder()
                    .setLabel("Servidor de suporte")
                    .setURL(client.config.discord.serverInvite)
                    .setStyle(Discord.ButtonStyle.Link),
            );

        client.embed({
            title: "Obrigado por me convidar!",
            image: "https://cdn.discordapp.com/attachments/843487478881976381/874694194474668052/bot_banner_invite.jpg",
            fields: [{
                name: "❓┆ Como me configurar?",
                value: 'Meu prefixo padrão é: = \`/\` \nPara me configurar mande:\`/setup\`',
                inline: false,
            },
            {
                name: "☎️┆ Precisa de ajuda?",
                value: `Entre no [[Servidor de suporte]](${client.config.discord.serverInvite})`,
                inline: false,
            },
            {
                name: "💻┆ Quais são os meu comandos?",
                value: 'Veja todos os meus comandos mandando:  \`/help\`',
                inline: false,
            },
            {
                name: "📨┆ Me convide!!",
                value: `Me convide clicando [[AQUI]](${client.config.discord.botInvite})`,
                inline: false,
            },
            ],
            components: [row], 
        }, defaultChannel)
    }
    catch (err) {
        console.log(err);
    }


};