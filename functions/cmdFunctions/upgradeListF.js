let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
let upgrades = require('../../configs/upgrades.json');
const resourcesData = require('../../configs/resources.json');
let {awaitR} = require('../awaitR.js');


let {upgradeFunction} = require('./upgradeF.js');
let {getUpResAmountNeeded} = require('../mathFormulas.js');


let resources = [];

for (const prop in resourcesData) {
    resourcesData[prop].forEach(element => {
        element.zone = prop;
        resources.push(element);
    });
}


async function upgradeListFunction(message, msg, lang, surviveFunction) {


    let user = await getUser(message);
    let data = user.data;

    let fields = [];
    let emojis = [config.Reactions.GoBack];


    upgrades.forEach(async element => {

        emojis.push(element.emoji);


        let up = data.upgrades.find(x => x.id === element.id);
        if (!up) up = {id: element.id, tier: 0, level: 0};

        let tier = element.tiers.find(x => x.from <= up.tier && x.to >= up.tier);

        let levels = 5;
        if (up.tier === 0) levels = 2;


        if (tier && up.level >= levels) {
            up.tier++;
            up.level = 0;
            await updateUserData(data); // Update user data in case it was upgraded and there was an upgrades config change (less levels in tier) 
            tier = element.tiers.find(x => x.from <= up.tier && x.to >= up.tier);
        }


        let txt;

        if (tier) { // Tier exists
            let hoverTxt;

            let costTxt = '';
            tier.resources.forEach(ele => {
                let currentAmount = data.inventory.find(x => x.id === ele);
                if (!currentAmount) currentAmount = 0; else currentAmount = currentAmount.amount;

                let defaultResData = resources.find(x => x.id === ele);
                let neededAmount = getUpResAmountNeeded(up.tier, defaultResData.baseTier);


                costTxt += `${currentAmount}/${neededAmount} ${lang[ele]}\n`;
            });


            hoverTxt = `${costTxt}\n${lang['info' + element.id]}`;

            hoverTxt = hoverTxt.replace(/\*/g, '');
            txt = `${element.emoji} **${lang[element.id]}** (${lang.tier} ${up.tier}, ${lang.level} ${up.level}/${levels})  |  [${lang.hover}](https://zsurvive.xyz/guide '${hoverTxt}')`;


        } else { // Tier does not exist / MAX
            txt = `${element.emoji} **${lang[element.id]}** | **${lang.tier} ${up.tier} (MAX)**`;
        }


        fields.push({name: '\u200b', value: txt}); // Push upgrade field to embed

    });


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${lang.upgradesEmbedDesc}`)
        .addField('\u200b', '\u200b')
        .addFields(fields)
        .addField('\u200b', '\u200b')
        .addField('\u200b', `${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Logo)
        .setFooter(lang.defaultFooter, config.Logo);

    if (msg != null) msg = await msg.edit(embed); else msg = await message.channel.send(embed);


    let reaction = await awaitR(msg, message, emojis, lang);

    if (reaction === config.Reactions.GoBack) surviveFunction(message, msg, lang);
    else if (reaction) {
        let upgradeElement = upgrades.find(x => x.emoji === reaction);
        if (upgradeElement) upgradeFunction(message, msg, lang, surviveFunction, upgradeListFunction, upgradeElement); else surviveFunction(message, msg, lang);
    }


}

module.exports = {upgradeListFunction};