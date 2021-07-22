let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
const resourcesData = require('../../configs/resources.json');
let {awaitR} = require('../awaitR.js');
const zones = require('../../configs/zones.json');


async function invFunction(message, msg, lang, surviveFunction) {


    let user = await getUser(message);
    let data = user.data;


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.inventoryEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${lang.inventoryEmbedDesc}\n\n\u200b`);


    let amountKilled = data.stats.bossesKilled;


    zones.forEach(element => {

        let remaining = element.unlockedByKilling - amountKilled;

        if (remaining <= 0) {

            let values = ['', ''];
            let column = 0;


            resourcesData[element.id].forEach(res => {

                let amount = 0;
                let rFound = data.inventory.find(x => x.id === res.id);
                if (rFound) amount = rFound.amount;

                values[column] += res.emoji + ' ' + lang[res.id] + ': ' + amount + '\n';

                column++;
                if (column === 2) column = 0;
            });

            values[0] += '';
            values[1] += '';

            embed.addFields({
                name: `${element.emoji} **${lang.inventoryZoneResourcesTitle.replace('{zone}', lang[element.id])}**`,
                value: values[0],
                inline: true
            }, {name: '\u200b', value: values[1], inline: true}).addField('\u200b', '\u200b');
        }


    });


    embed.addField('\u200b', `${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Inventory)
        .setFooter(lang.defaultFooter, config.Logo);


    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, [config.Reactions.GoBack], lang);
    if (reaction) surviveFunction(message, msg, lang);


}

module.exports = {invFunction};