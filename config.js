module.exports = {
    OWNER_IDS: [""], 
    SUPPORT_SERVER: "",
    PREFIX_COMMANDS: {
      ENABLED: true, 
      DEFAULT_PREFIX: "!", 
    },
    INTERACTIONS: {
      SLASH: true, //
      CONTEXT: false, 
      GLOBAL: false, 
      TEST_GUILD_ID: "", 
    },
    EMBED_COLORS: {
      BOT_EMBED: "#068ADD",
      TRANSPARENT: "#36393F",
      SUCCESS: "#00A56A",
      ERROR: "#D61A3C",
      WARNING: "#F7E919",
    },
    CACHE_SIZE: {
      GUILDS: 100,
      USERS: 10000,
      MEMBERS: 10000,
    },
    MESSAGES: {
      API_ERROR: "Unexpected Backend Error! Try again later or contact support server",
    },
  
    // PLUGINS
  
    AUTOMOD: {
      ENABLED: false,
      LOG_EMBED: "#36393F",
      DM_EMBED: "#36393F",
    },
  
    DASHBOARD: {
      enabled: false, 
      baseURL: "http://localhost:8080", // base url
      failureURL: "http://localhost:8080",
      port: "8080", 
    },
  
    ECONOMY: {
      ENABLED: false,
      CURRENCY: "₪",
      DAILY_COINS: 100, 
      MIN_BEG_AMOUNT: 100, 
      MAX_BEG_AMOUNT: 2500, 
    },
  
    MUSIC: {
      ENABLED: false,
      IDLE_TIME: 60, 
      MAX_SEARCH_RESULTS: 5,
      DEFAULT_SOURCE: "SC", // YT = Youtube, YTM = Youtube Music, SC = SoundCloud
     
     
      LAVALINK_NODES: [
        {
          host: "localhost",
          port: 2333,
          password: "youshallnotpass",
          id: "Local Node",
          secure: false,
        },
      ],
    },
  
    GIVEAWAYS: {
      ENABLED: false,
      REACTION: "🎁",
      START_EMBED: "#FF468A",
      END_EMBED: "#FF468A",
    },
  
    IMAGE: {
      ENABLED: false,
      BASE_API: "https://strangeapi.hostz.me/api",
    },
  
    INVITE: {
      ENABLED: false,
    },
  
    MODERATION: {
      ENABLED: false,
      EMBED_COLORS: {
        TIMEOUT: "#102027",
        UNTIMEOUT: "#4B636E",
        KICK: "#FF7961",
        SOFTBAN: "#AF4448",
        BAN: "#D32F2F",
        UNBAN: "#00C853",
        VMUTE: "#102027",
        VUNMUTE: "#4B636E",
        DEAFEN: "#102027",
        UNDEAFEN: "#4B636E",
        DISCONNECT: "RANDOM",
        MOVE: "RANDOM",
      },
    },
  
    PRESENCE: {
      ENABLED: false,
      STATUS: "online",
      TYPE: "WATCHING", 
      MESSAGE: "{members} members in {servers} servers", 
    },
  
    STATS: {
      ENABLED: false,
      XP_COOLDOWN: 5, 
      DEFAULT_LVL_UP_MSG: "{member:tag}, You just advanced to **Level {level}**",
    },
  
    SUGGESTIONS: {
      ENABLED: false, 
      EMOJI: {
        UP_VOTE: "⬆️",
        DOWN_VOTE: "⬇️",
      },
      DEFAULT_EMBED: "#4F545C",
      APPROVED_EMBED: "#43B581",
      DENIED_EMBED: "#F04747",
    },
  
    TICKET: {
      ENABLED: false,
      CREATE_EMBED: "#068ADD",
      CLOSE_EMBED: "#068ADD",
    },
  };