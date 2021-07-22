let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
let {getUpResAmountNeeded} = require('../mathFormulas.js');
const resourcesData = require('../../configs/resources.json');
let {awaitR} = require('../awaitR.js');


let resources = [];

for (const prop in resourcesData) {
    resourcesData[prop].forEach(element => {
        element.zone = prop;
        resources.push(element);
    });
}


async function upgradeFunction(message, msg, lang, surviveFunction, upgradeListFunction, upgradeElement) {


    // FIRST EMBED START (user confirmation)

    let user = await getUser(message);
    let data = user.data;

    let up = data.upgrades.find(x => x.id === upgradeElement.id);
    if (!up) up = {id: upgradeElement.id, tier: 0, level: 0};

    let tier = upgradeElement.tiers.find(x => x.from <= up.tier && x.to >= up.tier);

    let levels = 5;
    if (up.tier === 0) levels = 2;


    if (!tier) {
        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
            .setDescription(`<@${message.author.id}> ${lang.maxTierDesc}
        \n\n${lang.reactionsMenuGoBack2.replace('{emoji}', config.Reactions.GoBack)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Upgrades)
            .setFooter(lang.defaultFooter, config.Logo);

        if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);
        let reaction = await awaitR(msg, message, [config.Reactions.GoBack], lang);
        if (reaction) upgradeListFunction(message, msg, lang, surviveFunction);
        return;
    }

    if (up.level >= levels) {
        up.tier++;
        up.level = 0;
        await updateUserData(data); // Update user data in case it was upgraded and there was an upgrades config change (less levels in tier)
        tier = upgradeElement.tiers.find(x => x.from <= up.tier && x.to >= up.tier);
    }


    let hasItems = true;
    let txt;


    txt = `${lang['info' + up.id]}\n\n\n${lang.upgradeCost} (${lang.upgradeCurrentInfo.replace('{tier}', up.tier).replace('{level}', up.level)}):\n\n`;

    tier.resources.forEach(element => {
        let item = data.inventory.find(x => x.id === element);
        let currentAmount = 0;
        if (item) currentAmount = item.amount;

        let defaultResData = resources.find(x => x.id === element);

        let neededAmount = getUpResAmountNeeded(up.tier, defaultResData.baseTier);


        txt += `${defaultResData.emoji} **${neededAmount} ${lang[element]}** (${currentAmount}/${neededAmount})\n`;

        if (currentAmount < neededAmount) hasItems = false;
    });


    let emojis = [config.Reactions.GoBack];
    let optionalReaction = '';


    if (!hasItems) {
        txt += '\n\n' + lang.notEnoughItems;

    } else {
        emojis.push(config.Reactions.Upgrades);
        optionalReaction = `\n\n${lang.reactionsMenuMakeUpgrade.replace('{emoji}', config.Reactions.Upgrades)}`;
    }


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${txt}
            \n\n${lang.reactionsMenuGoBack2.replace('{emoji}', config.Reactions.GoBack)}${optionalReaction}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Upgrades)
        .setFooter(lang.defaultFooter, config.Logo);

    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, emojis, lang);
    if (!reaction) return;


    // SECOND EMBED START (bot confirmation)

    if (reaction === config.Reactions.GoBack) return upgradeListFunction(message, msg, lang, surviveFunction); else {

        user = await getUser(message);
        data = user.data;

        up = data.upgrades.find(x => x.id === upgradeElement.id);

        if (!up) {
            up = {id: upgradeElement.id, tier: 0, level: 0};
            data.upgrades.push(up);
        }

        tier = upgradeElement.tiers.find(x => x.from <= up.tier && x.to >= up.tier);

        if (tier && up.level >= tier.levels) {
            up.level = 0;
            up.tier++;
            tier = upgradeElement.tiers.find(x => x.from <= up.tier && x.to >= up.tier);
        }


        if (!tier) {
            embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.maxTierDesc}
        \n\n${lang.reactionsMenuGoBack2.replace('{emoji}', config.Reactions.GoBack)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Upgrades)
                .setFooter(lang.defaultFooter, config.Logo);

            msg = await msg.edit(embed);
            reaction = await awaitR(msg, message, [config.Reactions.GoBack], lang);
            if (reaction) upgradeListFunction(message, msg, lang, surviveFunction);
            return;
        }


        let hasItemsConfirm = true; // Variable with confirmation if user has req items
        tier.resources.forEach(element => {

            let currentAmount = data.inventory.find(x => x.id === element);
            if (!currentAmount) currentAmount = 0; else currentAmount = currentAmount.amount;

            let defaultResData = resources.find(x => x.id === element);
            let neededAmount = getUpResAmountNeeded(up.tier, defaultResData.baseTier);


            if (currentAmount < neededAmount) hasItemsConfirm = false;

        });


        if (hasItemsConfirm) { // if has enough resources, make upgrade

            tier.resources.forEach(neededRes => {
                let userRes = data.inventory.find(x => x.id === neededRes);

                let defaultResData = resources.find(x => x.id === neededRes);
                let neededAmount = getUpResAmountNeeded(up.tier, defaultResData.baseTier);

                userRes.amount -= neededAmount;
            });


            up.level++;

            let levels = 5;
            if (up.tier === 0) levels = 2;

            if (up.level >= levels) {
                up.tier++;
                up.level = 0;
            }


            await updateUserData(data);


            embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.upgradeSuccess}
                        \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Upgrades)
                .setFooter(lang.defaultFooter, config.Logo);


        } else {// not enough resources

            embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.notEnoughItems}
                        \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Upgrades)
                .setFooter(lang.defaultFooter, config.Logo);
        }


        msg = await msg.edit(embed);

        let reaction2 = await awaitR(msg, message, [config.Reactions.Yes], lang);
        if (reaction2) upgradeFunction(message, msg, lang, surviveFunction, upgradeListFunction, upgradeElement);

    }


}

module.exports = {upgradeFunction};