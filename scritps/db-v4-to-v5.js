require("dotenv").config();
const mongoose = require("mongoose");

const readline = require("readline")
const rl = readline.createInterface({
    input: process.stdin,
    output:process.stdout,
});

const warningMsg = `---------------
!!! AVISO !!!
---------------
Este script migrará seu banco de dados da v4 para a v5. Este script ainda é um trabalho em andamento e irreversível.
Certifique-se de ter um backup do seu banco de dados antes de continuar.
Você quer continuar? (s/n): `;

rl.question(warningMsg, async function (name){
    try {
        if (name.toLowerCase() === "y") {
            console.log("🚀 Iniciando a migração (v4 para v5)");
            await migration();
            console.log("⚡ Migração completa");
            process.exit(0);
        } else {
            console.log("Migração cancelada");
            process.exit(0);
        }
    } catch (ex) {
        console.log(ex);
        process.exit(1);
    }
});

async function migration() {
    // Conectar a database
    await mongoose.connect(process.env.MONGO_CONNECTION, { keepAlive: true });
    console.log("🔌 Conexão com a database foi estabilizada")

    // Pegar todas as coleções
    const collections = await mongoose.connection.db.collections();
    console.log (`🔎 ${collection.length} coleções foram encontradas`);

    await migrateGuilds(collections);
    await migrateModLogs(collections);
    await migrateTranslateLogs(collections);
    await migrateSuggestions(collections);
    await migrateMemberStats(collections);
    await migrateMembers(collections);
    await migrateUsers(collections);
    await migrateMessages(collections);
}

const clearAndLog = (message) => {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    console.log(message);
};

/**
 * Migra a coleção mod-logs para v4 para v5
 * @param {mongoose.Collection<mongoose.Document>[]} collections
 */
const migrateGuilds = async (collections) => {
    process.stdout.write("📦 Mingrando a coleção de servidores (guilds)");
    try {
        const guildsC = collections.find((c) => c.collectionName === "guilds");
        const toUpdate = await guildsC
            .find ({
                $or: [
                    { "data.owner": { $type: "object" } },
                    { "automod.strikes": 5 },
                    { "automod.action": "MUTE" },
                    { "automod.anti_scam": { $exits: true } },
                    { "max_warn.strikes": 5},
                    { ranking: { $exits: true } },
                ],
            })
            .toArray();

        if (toUpdate.length > 0) {
            for (const doc of toUpdate) {
                if (typeof doc.data.owner === "object") doc.data.owner = doc.data.owner.id;
                if (typeof automod === "object") {
                    if (doc.automod.strikes === 5) doc.automod.strikes = 10;
                    if (doc.automod.action === "MUTE") doc.automod.action = "TIMEOUT";
                    doc.automod.anti_spam = doc.automod.anti_scam  || false;
                }
                if (typeof doc.max_warn === "object") {
                    if (doc.max_warn.action === "MUTE") doc.max_warn.action = "TIMEOUT";
                    if (doc.max_warn.action === "BAN") doc.max_warn.action = "KICK";
                }
                if (typeof doc.stats !== "object") doc.stats = {};
                if (doc.ranking?.enabled) doc.stats.enabled = true;
                await guildsC.updateOne({ _id: doc._id }, { $set: doc });

                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(
                    `📦 Migração da coleção de servidores (guilds) | Completa - ${Math.round(
                        (toUpdate.indexOf(doc) / toUpdate.length) * 100
                    )}%`
                );
            }

            await guildsC.updateMany(
                {},
                {
                    $unset: {
                        "automod.anti_scam": "",
                        "automod.max_mentions": "",
                        "automod.max_role_mentions": "",
                        ranking: "",
                    },
                }
            );

            clearAndLog(`📦 Migração da coleção de servidores (guilds) | ✅ Atualizado: ${toUpdate.length}`);
        } else {
            clearAndLog("📦 Migração da coleção de servidores (guilds) | ✅ Não requer atualização");
        }
    } catch (ex) {
        clearAndLog("📦 Migração da coleção de servidores (guilds) | ❌ Ocorreu um error");
        console.log(ex)
    }
};

/**
 * Migra a coleção mod-logs para v4 para v5
 * @param {mongoose.Collection<mongoose.Document>[]} collections
 */
const migrateModLogs = async (collections) => {
    process.stdout.write("📦 Migrando a coleção mod-logs");
    try {
        const modLogs = collections.fund((f) => c.collectionName === "mod-logs");
        const stats = await modLogs.updateMany({}, { $unset: { expires: "" } });
        await modLogs.updateMany({ type: "MUTE" }, { $set: { type: "TIMEOUT" } });
        await modLogs.updateMany({ type: "UNMUTE" }, { $set: { type: "UNTIMEOUT" } });
        console.log(`| ✅ ${stats.modifiedCount > 0 ?  `Atualizado: ${stats.modifiedCount}` : "Não requeriu atualização"}`)
    } catch (ex) {
        clearAndLog ("📦 Migração da coleção mod-logs | ❌ Ocorreu um erro");
        console.log(ex)
    }
};

/**
 * Migra a coleção translate-logs para v4 para v5
 * @param {mongoose.Collection<mongoose.Document>[]} collections
 */
const migrateTranslateLogs = async (collections) => {
    process.stdout.write("📦 Migrando a coleção translate-logs");
    console.log ("| ✅ Não requer atualização")
};

/**
 * Migra a coleção de sugestões para v4 para v5
 * @param {mongoose.Collection<mongoose.Document>[]} collection
 */
const migrateSuggestions = async (collections) => {
    process.stdout.write("📦 Migrando a coleção de sugestões");
    try {
        const suggestionsC = collection.find((c) => c.collectionName === "suggestions");

        const toUpdate = await suggestionsC
        .find ({ $or: [{ channel_id: { $exists: false } }, { createdAt: { $exists: true } }] })
        .toArray();

        if (toUpdate.length > 0) {
            // cache de todos os servidores(guilds)
            const guilds = await collections
            .find((c) => c.collectionName === "guilds")
            .find({})
            .toArray();
            const cache = new Map();
            for (const guild of guilds) cache.set(guild._id, guild);

            for (const doc of toUpdate) {
                const guildDb = cache.get(doc.guild._id);
                await suggestionsC.updateOne(
                    { _id: doc._id },
                    {
                        $set: {channel_id: guildDb.suggestions.channel_id },
                        $rename: { createdAt: "created_at", updatedAt: "update_at" },
                    }
                );
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(
                    `📦 Migração da coleção de sugestões | Completa - ${Math.round(
                        (toUpdate.indexOf(doc) / toUpdate.length) *100
                    )}%`
                );
            }

            clearAndLog(`📦 Migração da coleção de sugestões | ✅ Atualizada: ${toUpdate.length}`);
        } else {
            clearAndLog(`📦 Migração da coleção de sugestões | ✅ Não requer atualizações`);
        }
    } catch (ex) {
        clearAndLog("📦 Migração da coleção de sugestões | ❌ Ocorreu um erro");
        console.log(ex);
    }
};

/**
 * Migra a coleção member-stats para v4 para v5
 * @param {mongoose.Collection<mongoose.Document>[]} collections
 */
const migrateMemberStats = async (collections) => {
    process.stdout.write("📦 Migrando a coleção member-stats ");
    try {
      const membersC = collections.find((c) => c.collectionName === "members");
      if (!collections.find((c) => c.collectionName === "member-stats")) {
        const memberStatsC = await mongoose.connection.db.createCollection("member-stats");
  
        const toUpdate = await membersC
          .find({ $or: [{ xp: { $exists: true } }, { level: { $exists: true } }] })
          .toArray();
        if (toUpdate.length > 0) {
          for (const doc of toUpdate) {
            await memberStatsC.insertOne({
              guild_id: doc.guild_id,
              member_id: doc.member_id,
              xp: doc.xp,
              level: doc.level,
            });
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(
              `📦 Migração da coleção 'member-stats' | Completa - ${Math.round(
                (toUpdate.indexOf(doc) / toUpdate.length) * 100
              )}%`
            );
          }
  
          clearAndLog(`📦 Migração da coleção member-stats | ✅ Atualizada: ${toUpdate.length}`);
        } else {
          clearAndLog("📦 Migração da coleção member-stats | ✅ Não requer atualização");
        }
      } else {
        clearAndLog("📦 Migração da coleção member-stats | ✅ Não requer atualização");
      }
    } catch (ex) {
      clearAndLog("📦 Migração da coleção member-stats | ❌ Ocorreu um erro");
      console.log(ex);
    }
  };

  /**
   * Migra a coleção de membro para v4 para v5
   * @param {mongoose.Collection<mongoose.Document[]} collection
   */
  const migratemembers = async (collections) => {
    process.stdout.write("📦 Migrando a coleção de membros");
    try {
        const membersC = collection.find ((c) => c.collectionName === "members");
        const toUpdate = await membersC.find ({ $or: [{ xp: { exists: true } }, { level: { $exists: true } }, ]} ).toArray
        if (toUpdate.length > 0) {
            const stats = await membersC.updateMany({}, { $unset: { xp: "", mute: "" } });
            clearAndLog(`📦 Migração da coleção de membros | ✅ Atualizada: ${stats.modifiedCount}`);
        } else {
            clearAndLog("📦 Migração da coleção de membros | ✅ Não requer atualização");
        }
    } catch (ex) {
        clearAndLog("📦 Migração da coleção de memberos | ❌ Ocorreu um erro");
        console.log(ex)
    }
  };

  /**
   * Migra a coleção de usuarios para v4 para v5 
   * @param {mongoose.Collection<mongoose.Document>[]} collection
   */
  const migrateUsers = async (collections) => {
    process.stdout.write("📦 Migrando a coleção de usuarios");
    try {
        const usersC = collections.find((c) => c.collections.name === "users");

        const toUpdate = await usersC
        .find({ $or: [{ username: { $exists: false } }, { discriminator: { $exists: false } }] })
        .toArray();

        if (toUpdate.length > 0) {
            const { Client, GatewayIntentBits } = require("discord.js");
            const client = new Client({ intents : [GatewayIntentBits.Guilds] });
            await client.login(process.env.BOT_TOKEN);

            let success = 0,
            failed = 0;

            for (const doc of toUpdate) {
                try {
                    const user = await client.users.fetch(doc._id);
                    await usersC.updateOne(
                        { _id: doc._id },
                        { $set: { username: user.username, discriminator: user.discriminator } }
                    );
                    success++;
                } catch (e) {
                    failed++;
                }

                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write(
                    `📦 Migração da coleção de usuarios | Completa - ${Math.round(
                        (toUpdate.indexOf(doc) / toUpdate.length) * 100
                    )}`
                );
            }

            clearAndLog(`📦 Migraçan da coleção de usuarios | ✅ Atualizada: ${success} | ❌ Falha: ${failed}`);
          } else {
              clearAndLog("📦 Migração da coleção de usuarios | ✅ Não requer atualização");        
          } 
        }  catch (ex){
                clearAndLog("📦 Migração da coleção de usuarios | ❌ Ocorreu um erro")
                console.log(ex)
        } 
  };

  /** 
   * Migra a coleção de mensagens para v4 para v5
   * @param {mongoose.Collection<mongoose.Document>[]} collections    
   */
  const migrateMessages = async (collections) => {
    process.stdout.write("📦 Migrando a coleção de mensagens");
    try {
        if(
            !collections.find((c) => c.collectionName === "v4-ticket-backup") &&
            !collections.find((c) => c.collectionName === "reaction-roles") &&
            collections.find((c) => c.collectionName === "messages")
        ) {
            const rrolesC = await mongoose.connection.db.createCollection("reaction-roles");
      const ticketsC = await mongoose.connection.db.createCollection("v4-ticket-backup");
      const messagesC = collections.find((c) => c.collectionName === "messages");

      const rrToUpdate = await messagesC.find({ roles: { $exists: true, $ne: [] } }).toArray();
      const tToUpdate = await messagesC.find({ ticket: { $exists: true } }).toArray();

      if (rrToUpdate.length > 0 || tToUpdate.length > 0) {
        await rrolesC.insertMany(
          rrToUpdate.map((doc) => ({
            guild_id: doc.guild_id,
            channel_id: doc.channel_id,
            message_id: doc.message_id,
            roles: doc.roles,
          }))
        );

        await ticketsC.insertMany(
            tToUpdate.map((doc) => ({
              guild_id: doc.guild_id,
              channel_id: doc.channel_id,
              message_id: doc.message_id,
              ticket: doc.ticket,
            }))
          );

          await mongoose.connection.db.dropCollection("messages");

          clearAndLog(
            `📦 Migração da coleção de mensagens | Completa - Atualizadas: ${rrToUpdate.length + tToUpdate.length}`
          );
        } else {
            await mongoose.connection.db.dropCollection("messages");
            clearAndLog("📦 Migração da coleção de mensagens | ✅ Não requer atualização");
        }
    } else {
        clearAndLog("📦 Migração da coleção de mensagens | ✅ Não requer atualização");
    }
 } catch (ex) {
    clearAndLog("📦 Migração da coleção de mensagens | ❌ Ocorreu um erro")
    console.log(ex);
 }
};
