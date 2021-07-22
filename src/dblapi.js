let {sql} = require('../mysql/mysqlpool.js');
const envconfig = require('../envconfig.json');
const config = require('../config.json');
let {client} = require('../bot.js');
let {MessageEmbed} = require('discord.js');
const dblToken = envconfig.dblToken;
const coinsReward = config.VoteReward;
const DBL = require('dblapi.js');
let request = require('request');


const dbl = new DBL(dblToken, {webhookPort: 8080, webhookAuth: envconfig.dblWebhookAuth});


dbl.on('error', e => {
    console.log(`Oops! ${e}`);
});


dbl.webhook.on('vote', vote => {

    sql.query(`SELECT * FROM zsurvive.users WHERE id = ? LIMIT 1;`, vote.user, async (err, rows) => {
        if (err) throw err;

        let now = Date.now();

        if (!rows[0] || !rows[0].data) return;
        let data = JSON.parse(rows[0].data);
        let userVotes;
        if (!rows[0].votes) userVotes = []; else userVotes = JSON.parse(rows[0].votes);


        userVotes.push(now);
        data.coins += coinsReward;


        sql.query(`UPDATE zsurvive.users SET data = ?, voteNotifAt = ?, votes = ?, totalVotes = ? WHERE id = ? LIMIT 1;`, [JSON.stringify(data), now + 1000 * 60 * 60 * 12, JSON.stringify(userVotes), rows[0].totalVotes + 1, vote.user], async (err, rows) => {
            if (err) throw err;

            try {
                let embed = new MessageEmbed()
                    .setTitle(`ZSurvive | Vote`)
                    .setDescription(`Thanks for voting ZSurvive on **top.gg**!\n\nYour reward: ${config.Reactions.Coins} **${coinsReward} ZCoins**`)
                    .setColor(config.EmbedsColor)
                    .setThumbnail(config.Images.Vote);

                let user = await client.users.fetch(vote.user);
                user.send(embed);

            } catch (e) {
            }


        });

    });
});


async function updateDBLcount() {

    const result = await client.shard.fetchClientValues('guilds.cache.size');
    let server_count = result.reduce((prev, guildCount) => prev + guildCount, 0);


    let options = {
        uri: `https://top.gg/api/bots/712738481285103676/stats`,
        method: 'POST',
        json: {
            server_count: server_count
        },
        headers: {
            'Authorization': dblToken
        }
    };


    request.post(options);

}


if (!envconfig.Dev) { // !!!!!!!!!! CHANGE THIS WHEN TESTING !!!----//

    setInterval(async () => {
        await updateDBLcount();
    }, 1000 * 60 * 15);

}