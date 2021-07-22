let {MessageEmbed} = require('discord.js');
let {client} = require('../bot.js');
const config = require('../config.json');
let {sql} = require('../mysql/mysqlpool.js');


client.on('guildCreate', async guild => { // Joined a server

    // Thanks embed for new guild
    let welcomeembed = new MessageEmbed()
        .setTitle(`ZSurvive`)
        .setDescription(`Thanks for adding me to **${guild.name}**!
        \nJoin our [**Discord server**](https://zsurvive.xyz/invite) to have fun and talk with the **ZSurvive community** or visit [**ZSurvive.xyz**](https://zsurvive.xyz/)!
        \n\nIf you don't know where to start from, type \`z help\`
        \n\nRemember to use the \`z vote\` command to get rewarded with **ZCoins**! `)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Logo);


    try {
        if (guild.systemChannelID) {
            let channel = await guild.channels.fetch(guild.systemChannelID);
            await channel.send(welcomeembed);
        }
    } catch {
    }


    addToDB(guild.id, 'true');

});


client.on('guildDelete', guild => { //Kicked from a server

    addToDB(guild.id, 'false');

});


function addToDB(guild, joined) { // Track invite or kick in database for charts.js

    sql.query(`INSERT INTO zsurvive.invites (guild, date, joined) VALUES (?, ?, ?);`, [guild, (new Date).getTime(), joined], async (err, rows) => {
        if (err) throw err;
    });

}


if (client.shard.ids[0] === 0) {


    async function updateGuildCount() { // Track guild count in database for charts.js

        let count = await client.shard.fetchClientValues('guilds.cache.size');
        count = count.reduce((prev, guildCount) => prev + guildCount, 0);

        sql.query(`INSERT INTO zsurvive.guild_count (date, amount) VALUES (?, ?);`, [(new Date).getTime(), count], async (err, rows) => {
            if (err) throw err;
        });
    }


    setInterval(async () => {
        await updateGuildCount();
    }, 1000 * 60 * 60);

}