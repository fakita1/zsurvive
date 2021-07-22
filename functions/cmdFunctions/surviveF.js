let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {mapFunction} = require('./mapF.js');
let {invFunction} = require('./invF.js');
let {upgradeListFunction} = require('./upgradeListF.js');
let {marketFunction} = require('./marketF.js');
let {achievementsFunction} = require('./achievementsF.js');
let {getUser, updateUserData} = require('../getUser.js');
let {awaitR} = require('../awaitR.js');
let {getPercentageSymbols} = require('../mathFormulas.js');


async function surviveFunction(message, msg, lang) {


    let user = await getUser(message);
    let data = user.data;

    let fullInTxt = '';
    if (data.energy < data.maxenergy) fullInTxt += ', ' + lang.surviveEnergyFullIn.replace('{time}', data.energyTimeTxt).replace('{minutes}', config.MinutesPerEnergy);


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.surviveEmbedTitle}`)
        .setDescription(`:man_mage: ${lang.surviveSurvivor.replace('{user}', '<@' + message.author.id + '>')}
            \n:heart: ${getPercentageSymbols(data.hp, data.maxhp)} [${data.hp}/${data.maxhp} HP, ${lang.zheal}]
            \n:zap: ${getPercentageSymbols(data.energy, data.maxenergy)} [${data.energy}/${data.maxenergy}${fullInTxt}]
            \n${config.Reactions.Fight} ${lang.surviveDamage.replace('{amount}', '`' + data.dmg + '`')}
            \n${config.Reactions.Coins} ${lang.surviveCoins.replace('{amount}', '`' + data.coins + '`')}
            \n\n\n${lang.reactionsMenuMap.replace('{emoji}', config.Reactions.Map)}
        \n${lang.reactionsMenuInventory.replace('{emoji}', config.Reactions.Inventory)}
        \n${lang.reactionsMenuUpgrades.replace('{emoji}', config.Reactions.Upgrades)}
        \n${lang.reactionsMenuMarket.replace('{emoji}', config.Reactions.Market)}
        \n${lang.reactionsMenuAchievements.replace('{emoji}', config.Reactions.Achievements)}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Logo)
        .setFooter(lang.defaultFooter, config.Logo);

    if (msg == null) msg = await message.channel.send(embed); else await msg.edit(embed);

    let emojis = [config.Reactions.Map, config.Reactions.Inventory, config.Reactions.Upgrades, config.Reactions.Market, config.Reactions.Achievements];
    let reaction = await awaitR(msg, message, emojis, lang);


    switch (reaction) {
        case config.Reactions.Map:
            mapFunction(message, msg, lang, surviveFunction);
            break;

        case config.Reactions.Inventory:
            invFunction(message, msg, lang, surviveFunction);
            break;

        case config.Reactions.Upgrades:
            upgradeListFunction(message, msg, lang, surviveFunction);
            break;

        case config.Reactions.Market:
            marketFunction(message, msg, lang, surviveFunction);
            break;

        case config.Reactions.Achievements:
            achievementsFunction(message, msg, lang, surviveFunction);
            break;

        default:
            break;
    }


}

module.exports = {surviveFunction};