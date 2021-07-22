let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
const resources = require('../../configs/resources.json');
let {awaitR} = require('../awaitR.js');
const tiers = require('../../configs/patreonTiers.json');
let {getFarmedAmount, getPercentageSymbols} = require('../mathFormulas.js');


async function farmFunction(message, msg, lang, surviveFunction, zone, mapFunction, zoneFunction) {


    let user = await getUser(message);
    let data = user.data;


    let id = zone.id;
    let zoneResources = Object.assign([], resources[id]); // Solves problem of obj modifying partent obj (resources from config)


    if (data.energy < 1) return zoneFunction(message, msg, lang, surviveFunction, zone, mapFunction); // Not enough energy


    let min = 2, max;
    if (zoneResources.length <= 3) max = 3; else if (zoneResources.length <= 6) max = 4; else max = zoneResources.length - 2;

    let farmTimes = Math.floor(Math.random() * (max - min + 1)) + min;


    let farmed = [];

    for (let i = 0; i < farmTimes; i++) {
        let index = Math.floor(Math.random() * (zoneResources.length)); // Random between 0 and length - 1

        farmed.push(zoneResources[index]);
        zoneResources.splice(index, 1); // Remove resource from array so it is not repeated
    }


    let farmedList = '';


    // Farm multiplier for Patrons
    let patreonMultiplier = 1;
    let patreonMultiplierTxt = '';
    if (user.premium !== null) {
        let tier = tiers.find(x => x.tier === user.premium);
        if (tier.farm > 1) {
            patreonMultiplier = tier.farm;
            patreonMultiplierTxt = `${lang.patreonFarmMultiplier.replace('{multiplier}', tier.farm)}\n\n`;
        }

    } // END Farm multiplier for Patrons


    farmed.forEach(element => {

        let tool = data.upgrades.find(x => x.id === element.requires);
        if (!tool) tool = {tier: 0, level: 0};


        let farmedAmount = getFarmedAmount(tool, element.baseTier);
        if (patreonMultiplier > 1) farmedAmount = farmedAmount * patreonMultiplier;


        let currentObj = data.inventory.find(x => x.id === element.id);

        if (!currentObj) {
            currentObj = {type: 'resource', id: element.id, amount: farmedAmount};
            data.inventory.push(currentObj);

        } else {
            currentObj.amount += farmedAmount;
        }


        data.stats.resourcesFarmed += farmedAmount; // Updating survivor stats

        farmedList += element.emoji + ' ' + lang[element.id] + ': ' + farmedAmount + '\n';

    });


    data.energy--;
    await updateUserData(data);


    let emojis = [config.Reactions.GoBack];
    let farmAgainTxt;
    if (data.energy > 0) {
        emojis.push(config.Reactions.Farm);
        farmAgainTxt = lang.reactionsMenuFarmAgain.replace('{emoji}', config.Reactions.Farm);


    } else {
        farmAgainTxt = lang.zoneFarmInCooldown.replace('{emoji}', config.Reactions.Farm);
    }


    let fullInTxt = '';
    if (data.energy < data.maxenergy) fullInTxt += ', ' + lang.surviveEnergyFullIn.replace('{time}', data.energyTimeTxt).replace('{minutes}', config.MinutesPerEnergy);


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang[id]}`)
        .setDescription(`<@${message.author.id}> ${patreonMultiplierTxt}${lang.justfarmed}
        \n${farmedList}
        \n\n:zap: ${getPercentageSymbols(data.energy, data.maxenergy)} [${data.energy}/${data.maxenergy}${fullInTxt}]
            \n\n\n${lang.reactionsMenuGoBack2.replace('{emoji}', config.Reactions.GoBack)}
            \n${farmAgainTxt}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(zone.image)
        .setFooter(lang.defaultFooter, config.Logo);


    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, emojis, lang);

    if (reaction === config.Reactions.GoBack) return zoneFunction(message, msg, lang, surviveFunction, zone, mapFunction);
    else if (reaction === config.Reactions.Farm) farmFunction(message, msg, lang, surviveFunction, zone, mapFunction, zoneFunction);


}


module.exports = {farmFunction};