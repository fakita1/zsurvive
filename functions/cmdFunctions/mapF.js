let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
const zones = require('../../configs/zones.json');
let {zoneFunction} = require('./zoneF.js');
let {awaitR} = require('../awaitR.js');


async function mapFunction(message, msg, lang, surviveFunction) {

    let user = await getUser(message);
    let data = user.data;

    let amountKilled = data.stats.bossesKilled;


    let zonestxt = '';
    let emojis = [config.Reactions.GoBack];


    zones.forEach(element => {

        let remaining = element.unlockedByKilling - amountKilled;

        if (remaining <= 0) {
            emojis.push(element.emoji);
            let zoneBossesKilled = data.zones.find(x => x.id === element.id);
            if (zoneBossesKilled) zoneBossesKilled = zoneBossesKilled.bossesKilled; else zoneBossesKilled = 0;
            zonestxt += `\n${lang.zoneMenuItems.replace('{emoji}', element.emoji).replace('{zone}', lang[element.id].toUpperCase())} (${zoneBossesKilled}/${element.bossAmount} ${lang.bosses}).`;

        } else {

            zonestxt += `\n${lang.zoneMenuItemsLocked.replace('{emoji}', element.emoji).replace('{zone}', lang[element.id].toUpperCase()).replace('{amount}', remaining)}`;
        }


    });


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.mapEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${lang.mapEmbedDesc}
    \n${lang.totalBossesKilled.replace('{amount}', amountKilled).replace('{emoji}', config.Reactions.Bosses)}
    \n\n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}
    ${zonestxt}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Map)
        .setFooter(lang.defaultFooter, config.Logo);

    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, emojis, lang);
    if (!reaction) return;


    user = await getUser(message);
    data = user.data;


    if (reaction === config.Reactions.GoBack) surviveFunction(message, msg, lang); else {

        let selectedzone = zones.find(x => x.emoji === reaction);
        if (!selectedzone) return surviveFunction(message, msg, lang);
        zoneFunction(message, msg, lang, surviveFunction, selectedzone, mapFunction);
    }


}

module.exports = {mapFunction};