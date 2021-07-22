let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
let {farmFunction} = require('./farmF.js');
let {bossMenuFunction} = require('./bossMenuF.js');
let {awaitR} = require('../awaitR.js');
let {getPercentageSymbols} = require('../mathFormulas.js');


async function zoneFunction(message, msg, lang, surviveFunction, zone, mapFunction) {
    let id = zone.id;


    let user = await getUser(message);
    let data = user.data;

    let amountKilled = data.stats.bossesKilled;

    if (amountKilled < zone.unlockedByKilling) return mapFunction(message, msg, lang, surviveFunction);


    let emojis = [config.Reactions.GoBack];
    let menuTxt = '';
    let fullInTxt = '';
    if (data.energy < data.maxenergy) fullInTxt += ', ' + lang.surviveEnergyFullIn.replace('{time}', data.energyTimeTxt).replace('{minutes}', config.MinutesPerEnergy);

    if (data.energy >= 1) {
        emojis.push(config.Reactions.Farm);
        menuTxt += `\n\n${lang.reactionsMenuFarm.replace('{emoji}', config.Reactions.Farm)}`;
        //cooldown embed
    } else {
        menuTxt += `\n\n${lang.zoneFarmInCooldown.replace('{emoji}', config.Reactions.Farm)}`;
    }


    emojis.push(config.Reactions.Bosses);
    menuTxt += `\n\n${lang.reactionsMenuBosses.replace('{emoji}', config.Reactions.Bosses)}`;


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang[id]}`)
        .setDescription(`<@${message.author.id}> ${lang.zoneEmbedDesc}
        \n:zap: ${getPercentageSymbols(data.energy, data.maxenergy)} [${data.energy}/${data.maxenergy}${fullInTxt}]
\n\n\n${lang.reactionsMenuGoBack2.replace('{emoji}', config.Reactions.GoBack)}${menuTxt}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(zone.image)
        .setFooter(lang.defaultFooter, config.Logo);


    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, emojis, lang);

    if (reaction === config.Reactions.GoBack) {
        mapFunction(message, msg, lang, surviveFunction);


    } else if (reaction === config.Reactions.Farm) {

        farmFunction(message, msg, lang, surviveFunction, zone, mapFunction, zoneFunction);

    } else if (reaction === config.Reactions.Bosses) {

        bossMenuFunction(message, msg, lang, surviveFunction, zone, mapFunction, zoneFunction);
    }


}

module.exports = {zoneFunction};