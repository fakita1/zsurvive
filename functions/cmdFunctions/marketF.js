let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
const resourcesData = require('../../configs/resources.json');
const market = require('../../configs/market.json');
let {awaitR} = require('../awaitR.js');
const zones = require('../../configs/zones.json');


let resources = [];

for (const prop in resourcesData) {
    resourcesData[prop].forEach(element => {
        resources.push(element);
    });
}


async function marketFunction(message, msg, lang, surviveFunction) {

    let user = await getUser(message);
    let data = user.data;


    let amountKilled = data.stats.bossesKilled;


    let items = '';
    market.forEach(element => {

        let price = element.price;

        if (element.type === 'box') {
            let zone = zones.find(x => x.id === element.zone);
            if (zone) {
                let remaining = zone.unlockedByKilling - amountKilled;
                if (!data.zones[zone.id]) data.zones[zone.id] = {stage: 0};
                if (remaining <= 0) items += `\n\n${zone.emoji} **${lang[element.id + '_market']}** (${config.Reactions.Coins} ${price}) \`z buy ${element.id}\` | ${lang[element.id + 'Desc_market']}`; else items += `\n\n${zone.emoji} ${lang.marketZoneLocked.replace('{box}', lang[element.id + '_market'])}`;
            }

        } else {
            items += `\n\n${element.emoji} **${lang[element.id + '_market']}** (${config.Reactions.Coins} ${price}) \`z buy ${element.id}\` | ${lang[element.id + 'Desc_market']}`;
        }

    });

    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${lang.marketEmbedDesc}
        \n\n**${lang.surviveCoins.replace('{coins_emoji}', config.Reactions.Coins).replace('{amount}', data.coins)}**
        \n${lang.marketCoinsEmbedDesc.join('\n')}
        \n${items}
        \n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}
        `)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Market)
        .setFooter(lang.defaultFooter, config.Logo);

    if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


    let reaction = await awaitR(msg, message, [config.Reactions.GoBack], lang);
    if (reaction) surviveFunction(message, msg, lang);


}

module.exports = {marketFunction};