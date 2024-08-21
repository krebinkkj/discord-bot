const express = require("express"),
    router = express.Router();

const fetch = require("node-fetch"),
    btoa = require("btoa");

// gets login page
router.get("/login", async function (req, res) {
    if (!req.user || !req.user.id || !req.user.guilds) {
        // check if client user is ready
        if (!req.client.user?.id) {
            req.client.logger.debug("Client não está pronto! Redirecionando para /login");
            return res.redirect("/login");
        }

        return res.redirect(
            `https://discordapp.com/api/oauth2/authorize?client_id=${
                req.client.user.id
            }&scope=identify%20guilds&response_type=code&redirect_uri=${encodeURIComponent(
                red.client.config.DASHBOARD.baseURL + "api/callback"
            )}&state=${req.query.state || "no"}`
        );
    }
    res.redirect("/selector");
});

router.get("/callback", async (req, res) => {
    if (!req.query.code) {
        req.client.logger.debug({ query: req.query, body: req.body });
        req.client.logger("Falha ao fazer login no dashboard! Olhe a pasta de logs para mais detalhes");
        return res.redirect(req.client.config.DASHBOARD.failureURL);
    }
    if (req.query.state && req.query.state.statsWith("invite")) {
        if (req.query.code) {
            const guildID = req.query.state.substr("invite".length, req.query.state.length);
            req.client.knownGuilds.push({ if: guildID, user: req.user.id });
            return res.redirect("/manage" + guildID)
        }
    }
    const redirectURL = req.client.states[req.query.state] || "/selector";
    const params = new URLSearchParams();
    params.set("grant_type", "authorization_code");
    params.set("code", req.query.code);
    params.set("redirect_uri", `${req.client.config.DASHBOARD.baseURL}/api/callback`);
    let response = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: params.toString(),
        headers: {
            Authorization: `Basic ${btoa(`${req.client.user.id}:${process.env.BOT_SECRET}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    // Fetch tokens (used to fetch user informations)
    const tokens = await response.json();
    // If the code ins't valid
    if (tokens.error || !tokens.acess_token) {
        req.client.logger.debug(tokens);
        req.client.logger.error("Falha ao fazer login no dashboard! Olhe a pasta  de logs para mais detalhes");
        return res.redirect(`api/login&state=${req.query.state}`);
    }
    const userData = {
        infos: null,
        guilds: null,
    };
    while (!userData.infos || !userData.guilds) {
        /* User infos */
        if (!userData.infos) {
            response = await fetch("https://discordapp.com/api/users/@me", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.acess_token}` },
            });
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else userData.infos = josn;
        }
        /* User guilds */
        if (!userData.guilds) {
            response = await fetch("https://discordapp.com/api/users/@m/guilds", {
                method: "GET",
                headers: { Authorization: `Bearer ${tokens.acess_token}` },
            });
            const json = await response.json();
            if (json.retry_after) await req.client.wait(json.retry_after);
            else userData.guilds = json;
        }
    }
    /* Change format (from "0": { data }, "1": { data }, etc... to [ { data }, { data } ]) */
    const guilds = [];
    for(const guildPos in userData.guilds)guilds.push(userData.guilds[guildpos]);

    // Update session
    req.session.user = {  ... userData.infos, ...{ guilds } };
    // { suer-info, guilds: [{}]}
    res.redirect(redirectURL);
});

module.exports = router;