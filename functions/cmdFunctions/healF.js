let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
const resourcesData = require('../../configs/resources.json');
let {awaitR} = require('../awaitR.js');
const zones = require('../../configs/zones.json');
let {getPercentageSymbols} = require('../mathFormulas.js');


const costMultiplier = 1;


let healOptions = [
    {
        percentage: 100,
        emoji: '❤️',
        from: 1
    },
    {
        percentage: 70,
        emoji: '🧡',
        from: 3
    },
    {
        percentage: 40,
        emoji: '💜',
        from: 6
    }
];


let resources = [];

for (const prop in resourcesData) {
    resourcesData[prop].forEach(element => {
        element.zone = prop;
        resources.push(element);
    });
}


function calcNeededAmount(amount, medicRes) {

    let n = amount * costMultiplier;
    if (medicRes.id === 'medikit') n /= 1.8; else if (medicRes.id === 'healingcrystal') n /= 2.2; else if (medicRes.id === 'healingwater') n /= 2.6; else if (medicRes.id === 'rose') n /= 4; else if (medicRes.id === 'nanobot') n /= 6;
    return Math.floor(n);

}

function shouldPush(medicRes, amount) {
    //if (medicRes.id == 'bandage' || (medicRes.id == 'medikit' && amount > 15) || (medicRes.id == 'healingcrystal' && amount > 50) || (medicRes.id == 'healingwater' && amount > 150)) return true;
    return true;
}


async function healFunction(message, msg, lang, surviveFunction) {


    let user = await getUser(message);
    let data = user.data;


    if (data.hp >= data.maxhp) { // HP is full, no need to heal
        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.healEmbedTitle}`)
            .setDescription(`<@${message.author.id}> ${lang.healHpFull}
            \n:heart: ${getPercentageSymbols(data.hp, data.maxhp)} [${data.hp}/${data.maxhp} HP]
            \n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Heal)
            .setFooter(lang.defaultFooter, config.Logo);

        if (msg != null) msg = await msg.edit(embed); else msg = await message.channel.send(embed);

        let reaction = await awaitR(msg, message, [config.Reactions.GoBack], lang);
        if (reaction) surviveFunction(message, msg, lang);
        return;
    }


    let txt = '';
    let emojis = [config.Reactions.GoBack];

    difference = data.maxhp - data.hp;
    let amountKilled = data.stats.bossesKilled;


    healOptions.forEach(async element => {

        let amount = Math.floor(difference / 100 * element.percentage);

        if (difference > element.from) {

            let cost = [];

            zones.forEach(zone => {

                if (zone.unlockedByKilling - amountKilled <= 0) {
                    let medicRes = resourcesData[zone.id][0]; //[0] NEEDS TO ALWAYS BE THE MEDICAL RES IN resources.json

                    let neededAmount = calcNeededAmount(amount, medicRes);

                    if (shouldPush(medicRes, amount)) cost.push({id: medicRes.id, amount: neededAmount});
                }

            });


            let costTxt = '';
            let hasItems = true;
            cost.forEach(ele => {
                let item = data.inventory.find(x => x.id === ele.id);
                let currentAmount = 0;
                if (item) currentAmount = item.amount;

                let defaultResData = resources.find(x => x.id === ele.id);

                costTxt += `\n- ${defaultResData.emoji} **${ele.amount} ${lang[defaultResData.id]}** (${currentAmount}/${ele.amount})`;

                if (currentAmount < element.amount) hasItems = false;
            });


            if (hasItems) { // Add option to menu
                txt += `\n\n\n${lang.reactionsMenuHealOption.replace('{emoji}', element.emoji).replace('{amount}', amount)}`;
                emojis.push(element.emoji);

            } else txt += `\n\n\n${lang.healNotEnoughResourcesOption.replace('{emoji}', emoji)}`;


            txt += costTxt; // Add cost below option in menu

        }


    });


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.healEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${lang.healEmbedDesc}
        \n\n:heart: ${getPercentageSymbols(data.hp, data.maxhp)} [${data.hp}/${data.maxhp} HP]
        ${txt}
        \n\n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Heal)
        .setFooter(lang.defaultFooter, config.Logo);

    if (msg != null) msg = await msg.edit(embed); else msg = await message.channel.send(embed);


    let reaction = await awaitR(msg, message, emojis, lang);
    if (!reaction) return;
    else if (reaction === config.Reactions.GoBack) return surviveFunction(message, msg, lang);


    // If reaction and reaction != goBack
    //START BOT CONFIRMATION EMBED

    user = await getUser(message);
    data = user.data;


    let healObj = healOptions.find(x => x.emoji === reaction);
    let difference = data.maxhp - data.hp;
    let amount = Math.floor(difference / 100 * healObj.percentage);


    let cost = [];

    zones.forEach(zone => {

        if (zone.unlockedByKilling - amountKilled <= 0) {
            let medicRes = resourcesData[zone.id][0]; //[0] NEEDS TO ALWAYS BE THE MEDICAL RES IN resources.json

            let neededAmount = calcNeededAmount(amount, medicRes);

            if (shouldPush(medicRes, amount)) cost.push({id: medicRes.id, amount: neededAmount});
        }

    });


    let hasItemsConfirm = true; // Variable with confirmation if user has req items
    cost.forEach(element => {

        let currentAmount = data.inventory.find(x => x.id === element.id);
        if (!currentAmount) currentAmount = 0; else currentAmount = currentAmount.amount;
        if (!currentAmount || currentAmount < element.amount) hasItemsConfirm = false;

    });


    if (hasItemsConfirm) { // if has enough resources, make purchase

        cost.forEach(neededRes => {
            let userRes = data.inventory.find(x => x.id === neededRes.id);
            userRes.amount -= neededRes.amount;
        });


        data.hp += amount;


        await updateUserData(data);


        embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.healEmbedTitle}`)
            .setDescription(`<@${message.author.id}> ${lang.healSuccess.replace('{amount}', amount)}
            \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Heal)
            .setFooter(lang.defaultFooter, config.Logo);


    } else {// not enough resources

        embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.healEmbedTitle}`)
            .setDescription(`<@${message.author.id}> ${lang.notEnoughItems}
            \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Heal)
            .setFooter(lang.defaultFooter, config.Logo);
    }


    msg = await msg.edit(embed);

    let reaction2 = await awaitR(msg, message, [config.Reactions.Yes], lang);
    if (reaction2) healFunction(message, msg, lang, surviveFunction);


}

module.exports = {healFunction};