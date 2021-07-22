let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
let {healFunction} = require('./healF.js');
let {awaitR} = require('../awaitR.js');
let {upgradeListFunction} = require('./upgradeListF.js');
const zones = require('../../configs/zones.json');
let {getPercentageSymbols} = require('../mathFormulas.js');


function getBossData(zone, amountKilled) {

    if (amountKilled >= zone.bossAmount) return false;

    let multiplier = 1;

    for (let i = 0; i < amountKilled; i++) {
        multiplier += zone.scaleMultiplier;
    }


    let baseStat = Math.floor(zone.baseStat * multiplier);
    let boss = {hp: baseStat, dmg: baseStat, coins: zone.coins};


    let decreasedStat = Math.floor(boss.hp - (boss.hp * 0.05));
    if (amountKilled % 2 === 0) boss.hp = decreasedStat; else boss.dmg = decreasedStat; // Determine what stat will be decreased so values dont look plain to users! (is number odd or not)


    return boss;
}


async function bossMenuFunction(message, msg, lang, surviveFunction, zone, mapFunction, zoneFunction) {


    let user = await getUser(message);
    let data = user.data;
    let id = zone.id;


    let totalAmountKilled = data.stats.bossesKilled;

    let amountKilled = data.zones.find(x => x.id === id);
    if (!amountKilled) amountKilled = 0; else amountKilled = amountKilled.bossesKilled;


    if (totalAmountKilled < zone.unlockedByKilling) return mapFunction(message, msg, lang, surviveFunction); // If zone is not unlocked


    let nextBossTxt;


    let emojis = [config.Reactions.GoBack];


    let nextBossObj = getBossData(zone, amountKilled);

    if (!nextBossObj) {
        nextBossTxt = lang.allBossesKilled;

    } else {


        nextBossTxt = `\n\n:heart: ${getPercentageSymbols(data.hp, data.maxhp)} [${data.hp}/${data.maxhp} HP, ${lang.zheal}]\n:crossed_swords: **${lang.yourdamage}**: ${data.dmg}\n\n:drop_of_blood: **${lang.bosshp}**: ${nextBossObj.hp}\n:dagger: **${lang.bossdamage}**: ${nextBossObj.dmg}\n\n\n\n`;

        nextBossTxt += `${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}\n\n`;


        if (data.dmg < nextBossObj.hp) {
            nextBossTxt += `${lang.notEnoughDmg}\n\n${lang.reactionsMenuUpgrades.replace('{emoji}', config.Reactions.Upgrades)}`;
            emojis.push(config.Reactions.Upgrades);

        } else if (data.hp <= nextBossObj.dmg && data.maxhp > nextBossObj.dmg) {
            nextBossTxt += `${lang.notEnoughHp}\n\n${lang.reactionsMenuHeal.replace('{emoji}', config.Reactions.Heal)}`;
            emojis.push(config.Reactions.Heal);

        } else if (data.hp <= nextBossObj.dmg && data.maxhp <= nextBossObj.dmg) {
            nextBossTxt += `${lang.notEnoughMaxHp}\n\n${lang.reactionsMenuUpgrades.replace('{emoji}', config.Reactions.Upgrades)}`;
            emojis.push(config.Reactions.Upgrades);

        } else { // If boss hp reach 0 (can kill successfully)
            emojis.push(config.Reactions.Fight);
            nextBossTxt += lang.reactionsMenuFight.replace('{emoji}', config.Reactions.Fight);
        }


    }


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.bossesEmbedTitle} (${lang[id].toLowerCase()})`)
        .setDescription(`<@${message.author.id}> ${lang.bossesEmbedDesc}
        \n${nextBossTxt}
\n`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Bosses)
        .setFooter(lang.defaultFooter, config.Logo);

    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, emojis, lang);


    switch (reaction) {
        case config.Reactions.GoBack:
            return zoneFunction(message, msg, lang, surviveFunction, zone, mapFunction);

        case config.Reactions.Heal:
            return healFunction(message, msg, lang, surviveFunction);

        case config.Reactions.Upgrades:
            return upgradeListFunction(message, msg, lang, surviveFunction);


        case config.Reactions.Fight:

            user = await getUser(message);
            data = user.data;


            let currentStageN;
            let currentStage = data.zones.find(x => x.id === zone.id);
            if (currentStage) currentStageN = currentStage.bossesKilled;
            if (!currentStageN) currentStageN = 0; // In case currentStage or bossesKilled doesnt exist


            let nextBossObj = getBossData(zone, amountKilled);
            if (!nextBossObj) return zoneFunction(message, msg, lang, surviveFunction, zone, mapFunction);


            if (data.dmg >= nextBossObj.hp && data.hp > nextBossObj.dmg) {// If boss is killed


                if (!currentStage) data.zones.push({id: zone.id, bossesKilled: 1}); // In case element didnt exist
                else currentStage.bossesKilled++;


                data.hp -= nextBossObj.dmg;
                if (nextBossObj.coins) data.coins += nextBossObj.coins;

                data.stats.bossesKilled++; //Also update the total amount killed in all zones


                updateUserData(data);

                let newZoneTxt = '';
                let unlockedZone = zones.find(x => x.unlockedByKilling === data.stats.bossesKilled);
                if (unlockedZone) newZoneTxt = '\n\n' + lang.newZoneUnlocked.replace('{zone}', lang[unlockedZone.id]).replace('{emoji}', unlockedZone.emoji);


                let embed = new MessageEmbed()
                    .setTitle(`ZSurvive | ${lang.bossesEmbedTitle} (${lang[id].toLowerCase()})`)
                    .setDescription(`<@${message.author.id}> ${lang.bossKilled.replace('{amount}', nextBossObj.coins)}${newZoneTxt}
                            \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                    .setColor(config.EmbedsColor)
                    .setThumbnail(config.Images.Bosses)
                    .setFooter(lang.defaultFooter, config.Logo);


                msg = await msg.edit(embed);


                reaction = await awaitR(msg, message, [config.Reactions.Yes], lang);
                if (reaction) return bossMenuFunction(message, msg, lang, surviveFunction, zone, mapFunction, zoneFunction);


            } else { // If boss cannot be killed
                return zoneFunction(message, msg, lang, surviveFunction, zone, mapFunction);
            }

            break;


        default:
            break;

    } // End break


} // End function


module.exports = {bossMenuFunction};