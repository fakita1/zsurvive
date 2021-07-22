let {getUser} = require('../functions/getUser.js');
let {MessageEmbed} = require('discord.js');
let {client} = require('../bot.js');
const config = require('../config.json');
let {sql} = require('../mysql/mysqlpool.js');
let {getLang} = require('../functions/getLang.js');


async function sendNotifications() {

    let now = Date.now();


    sql.query(`SELECT id, data, energyNotifAt, voteNotifAt FROM zsurvive.users WHERE energyNotifAt < ? OR voteNotifAt < ?;`, [now, now], async (err, rows) => {
        if (err) throw err;


        rows.forEach(async element => {

            let user = await getUser({author: {id: element.id}});
            if (!user) return;
            let data = user.data;


            if (!data.notifDisabled) {

                let lang = await getLang({guild: {id: data.stats.lastGuild || 1}});


                if (element.energyNotifAt !== null && element.energyNotifAt < now && data.energy >= data.maxenergy) { // Energy notification

                    data.stats.energyNotifAt = null;

                    sql.query(`UPDATE zsurvive.users SET data = ?, energyNotifAt = ? WHERE id = ? LIMIT 1;`, [JSON.stringify(data), null, data.id], async (err, rows) => {
                        if (err) throw err;
                    });


                    try {

                        let embed = new MessageEmbed()
                            .setTitle(`ZSurvive | ${lang.notifEnergyTitle}`)
                            .setDescription(lang.notifEnergyDesc.replace('{energy}', data.energy).replace('{maxenergy}', data.maxenergy) + '\n\n\n' + lang.notifTurnOffGuide)
                            .setColor(config.EmbedsColor)
                            .setThumbnail(config.Images.Energy);

                        let user = await client.users.fetch(data.id);
                        user.send(embed);

                    } catch (e) {
                    }

                }


                if (element.voteNotifAt !== null && element.voteNotifAt < now) { // Vote notification

                    sql.query(`UPDATE zsurvive.users SET voteNotifAt = ? WHERE id = ? LIMIT 1;`, [null, data.id], async (err, rows) => {
                        if (err) throw err;
                    });

                    try {

                        let embed = new MessageEmbed()
                            .setTitle(`ZSurvive | ${lang.notifVoteTitle}`)
                            .setDescription(lang.notifVoteDesc + '\n\n\n' + lang.notifTurnOffGuide)
                            .setColor(config.EmbedsColor)
                            .setThumbnail(config.Images.VoteReminder);

                        let user = await client.users.fetch(data.id);
                        user.send(embed);

                    } catch (e) {
                    }

                }


            } else {

                sql.query(`UPDATE zsurvive.users SET energyNotifAt = ? WHERE id = ? LIMIT 1;`, [null, data.id], async (err, rows) => {
                    if (err) throw err;
                });

                sql.query(`UPDATE zsurvive.users SET voteNotifAt = ? WHERE id = ? LIMIT 1;`, [null, data.id], async (err, rows) => {
                    if (err) throw err;
                });

            }


        });


    });
}


setInterval(async () => {
    await sendNotifications();
}, 60000);