let {client} = require('../bot.js');
const config = require('../config.json');
let {getUser} = require('../functions/getUser.js');
let zones = require('../configs/zones.json');
let {MessageEmbed} = require('discord.js');


async function checkZGuildRolesForUser(id, isReaction) {

    let guild = client.guilds.cache.get('503243929559367710');

    let member = await guild.members.fetch(id);
    if (!member) return;


    let user = await getUser({author: {id: id}});

    if (!user) {
        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | Roles`)
            .setDescription(`Please **complete the tutorial first**! Use the \`z survive\` command in any channel.`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo);
        if (isReaction) member.send(embed);
        return;
    }

    let data = user.data;
    let killed = data.stats.bossesKilled;


    // ZONE ROLES start

    for (let i = 0; i < zones.length; i++) {

        let role;
        if (zones[i].id !== 'forest') role = await guild.roles.fetch(zones[i].roleID);

        if (killed >= zones[i].unlockedByKilling && (!zones[i + 1] || killed < zones[i + 1].unlockedByKilling)) {

            if (!member.roles.cache.has(zones[i].roleID)) { // Doesnt have role, add it

                if (zones[i].id === 'forest') {

                    try {
                        let embed = new MessageEmbed()
                            .setTitle(`ZSurvive | Roles`)
                            .setDescription(`<@${id}>, I am sorry! You need to at least reach the **city** to claim a role.`)
                            .setColor(config.EmbedsColor);
                        if (isReaction) member.send(embed);
                    } catch {
                    }

                    return;
                }


                member.roles.add(role);

                try {
                    let embed = new MessageEmbed()
                        .setTitle(`ZSurvive | Roles`)
                        .setDescription(`<@${id}>, you have been **rewarded** with the **${role.name}** role!`)
                        .setColor(config.EmbedsColor)
                        .setThumbnail(zones[i].image);
                    if (isReaction) member.send(embed);
                } catch {
                }
            } else {


                try {
                    let embed = new MessageEmbed()
                        .setTitle(`ZSurvive | Roles`)
                        .setDescription(`<@${id}>, you **already have** the **${role.name}** role. Unlock a new zone to be rewarded with a better one!`)
                        .setColor(config.EmbedsColor)
                        .setThumbnail(zones[i].image);
                    if (isReaction) member.send(embed);
                    return;
                } catch {
                }


            }


        } else if (member.roles.cache.has(zones[i].roleID)) { // Has role but not the right one
            member.roles.remove(role);
        }


    }


}


module.exports = {checkZGuildRolesForUser};