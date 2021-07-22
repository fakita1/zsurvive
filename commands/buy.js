let {MessageEmbed} = require('discord.js');
let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
const market = require('../configs/market.json');
const resources = require('../configs/resources.json');
let {marketFunction} = require('../functions/cmdFunctions/marketF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');
const config = require('../config.json');
let {getUser, updateUserData} = require('../functions/getUser.js');
let {awaitR} = require('../functions/awaitR.js');

let {getFarmedAmount} = require('../functions/mathFormulas.js');


module.exports = {
    name: ['buy'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        let data = user.data;
        if (!args[0]) return marketFunction(message, null, lang, surviveFunction);


        let item = market.find(x => x.id === args[0]);
        if (!item) {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.defaultNotFound}
                \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Market)
                .setFooter(lang.defaultFooter, config.Logo);

            let msg = await message.channel.send(embed);

            let reaction = await awaitR(msg, message, [config.Reactions.Yes], lang);
            if (reaction) marketFunction(message, msg, lang, surviveFunction);
            return;
        }


        if ((item.id === 'hp' && data.hp >= data.maxhp) || (item.id === 'energy' && data.energy >= data.maxenergy)) {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.marketPropIsFull}
                \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Market)
                .setFooter(lang.defaultFooter, config.Logo);

            let msg = await message.channel.send(embed);

            let reaction = await awaitR(msg, message, [config.Reactions.Yes], lang);
            if (reaction) marketFunction(message, msg, lang, surviveFunction);
            return;
        }


        let msg;
        let emojis = [config.Reactions.GoBack];

        if (data.coins < item.price) { // Not enough coins
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.notEnoughCoins.replace('{item}', lang[item.id + '_market']).replace('{emoji}', config.Reactions.Coins).replace('{amount}', data.coins).replace('{price}', item.price)}
                 \n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(item.image || config.Images.Market)
                .setFooter(lang.defaultFooter, config.Logo);

            msg = await message.channel.send(embed);


        } else { // Enough coins

            emojis.push(config.Reactions.Buy);

            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.confirmPurchase.replace('{item}', lang[item.id + '_market']).replace('{amount}', data.coins).replace('{price}', item.price)}
                \n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)} 
                \n${lang.reactionsMenuPurchase.replace('{emoji}', config.Reactions.Buy)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(item.image || config.Images.Market)
                .setFooter(lang.defaultFooter, config.Logo);

            msg = await message.channel.send(embed);
        }


        let reaction = await awaitR(msg, message, emojis, lang);
        if (reaction === config.Reactions.GoBack) return marketFunction(message, msg, lang, surviveFunction); else if (reaction === config.Reactions.Buy) { // Item was purchased


            // START confirmation from user


            user = await getUser(message);
            data = user.data;


            if (data.coins < item.price) { // Not enough coins
                let embed = new MessageEmbed()
                    .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
                    .setDescription(`<@${message.author.id}> ${lang.notEnoughCoins.replace('{item}', lang[item.id + '_market']).replace('{emoji}', config.Reactions.Coins).replace('{amount}', data.coins).replace('{price}', item.price)}
                     \n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                    .setColor(config.EmbedsColor)
                    .setThumbnail(item.image || config.Images.Market)
                    .setFooter(lang.defaultFooter, config.Logo);

                await msg.edit(embed);


            } else { // Enough coins, BUY IT!!!


                let itemsTxt = '';

                if (item.type === 'box') {
                    itemsTxt += lang.boxItemListTitle + '\n\n';


                    if (item.zone) {    //It is a zone box, it will have resources


                        let zoneResources = resources[item.zone];

                        zoneResources.forEach(element => {

                            let tool = data.upgrades.find(x => x.id === element.requires);
                            if (!tool) tool = {tier: 0, level: 0};


                            let farmedAmount = getFarmedAmount(tool, element.baseTier) * 5;


                            let max = Math.floor(farmedAmount * 1.5), min = Math.floor(farmedAmount / 1.5);
                            farmedAmount = Math.floor(Math.random() * (max - min + 1)) + min; //max and min included

                            let currentObj = data.inventory.find(x => x.id === element.id);

                            if (!currentObj) {
                                currentObj = {type: 'resource', id: element.id, amount: farmedAmount};
                                data.inventory.push(currentObj);

                            } else {
                                currentObj.amount += farmedAmount;
                            }


                            itemsTxt += lang.resourceInBox.replace('{emoji}', element.emoji).replace('{amount}', farmedAmount).replace('{resource}', lang[element.id]) + '\n';

                        });


                    }

                    data.stats.boxesOpened++;


                } else if (item.id === 'hp') data.hp = data.maxhp; else if (item.id === 'energy') data.energy += 10;


                let embed = new MessageEmbed()
                    .setTitle(`ZSurvive | ${lang.marketEmbedTitle}`)
                    .setDescription(`<@${message.author.id}> ${lang.purchaseSuccess.replace('{item}', lang[item.id + '_market'])}
                    \n${itemsTxt}
                    \n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}
                     `)
                    .setColor(config.EmbedsColor)
                    .setThumbnail(item.image || config.Images.Market)
                    .setFooter(lang.defaultFooter, config.Logo);

                msg.edit(embed);


                data.coins -= item.price; // Spend coins

                data.stats.coinsSpent += item.price;
                await updateUserData(data);
            }


            reaction = await awaitR(msg, message, [config.Reactions.Yes], lang);
            if (reaction) return marketFunction(message, msg, lang, surviveFunction);

        }


    }
};