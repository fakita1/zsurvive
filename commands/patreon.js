let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
const tiers = require('../configs/patreonTiers.json');
let {getUser} = require('../functions/getUser.js');
let {client} = require('../bot.js');
let {addPremiumCoinsForUser} = require('../src/addPremiumCoins');
let {sql} = require('../mysql/mysqlpool');


module.exports = {
    name: ['patreon', 'patron', 'premium'],
    async execute(message, args, lang) {

        if (!message.guild || message.guild.id !== '503243929559367710') {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | Patreon`)
                .setDescription(`<@${message.author.id}> This command can only be used from [**our server**](https://zsurvive.xyz/discord?x=patreoncmdtodiscord)!`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Premium)
                .setFooter(lang.defaultFooter, config.Logo);

            return message.channel.send(embed);
        }


        let user = await getUser(message);
        if (!user) return message.channel.send('Please complete the tutorial before executing this command!');


        let guild = client.guilds.cache.get('503243929559367710');
        let member = message.member;
        if (!member) member = await guild.members.fetch(message.author.id);
        if (!member) return message.channel.send('Please report this error to an admin. Code: MEMBERNOTFOUND');


        let tier = null;
        for (let i = 0; i < tiers.length; i++) {

            let element = tiers[i];

            if (member.roles.cache.has(element.role)) {

                if (user.premium !== element.tier) { // If user has a different premium tier compared to their role --> Add new premium.
                    await addPremium(message, element);
                    user.premium = element.tier;
                }

                tier = element;
                break;

            }


        }


        if (tier === null && user.premium !== null) { // Removing premium if user has no role
            await addPremium(message, {tier: null});
            user.premium = null;
        }

        if (!tier) return;
        if (user.premium !== null) {

            if (user.lastPremiumCoins === null || user.lastPremiumCoins < Date.now() - 1000 * 60 * 60 * 24 * 30) {
                await addPremiumCoinsForUser(message, tier);
                /******************
                 *
                 * TODO: give partial coins to the ones that have upgraded their patron tier.
                 *
                 ******************/
                user.lastPremiumCoins = Date.now();
            }


            let perks = `\n+ ${tier.coins} ZCoins every month.\n+ ${tier.energy} Extra energy limit.`;
            if (user.premium > 2) perks += `\n+ ${tier.farm}x Farm multiplier.\n+ Access to BETA features.`;

            let upgradeTxt = '';
            if (user.premium < 4) upgradeTxt = `\n\nRemember you can always [upgrade](https://zsurvive.xyz/patreon?x=patreoncmd) your Patron tier to get better perks such as more ZCoins every month, extra energy limit points and a greater farm multiplier!`;


            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | Patreon`)
                .setDescription(`<@${message.author.id}> Thanks for contributing to ZSurvive's development by being a Patron!
			\n\n\n**Current tier**: **<@&${tier.role}>**
			\nYour **current perks** are:${perks}${upgradeTxt}
			\n\n\n${config.Reactions.Coins} **__Patreon ZCoins__**:
			\n**Last time you collected them**: ${new Date(parseInt(user.lastPremiumCoins)).toUTCString()}
			**Collect them again on**: ${new Date(parseInt(user.lastPremiumCoins) + 1000 * 60 * 60 * 24 * 30).toUTCString()}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Premium)
                .setFooter(lang.defaultFooter, config.Logo);

            message.channel.send(embed);


        } else {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | Patreon`)
                .setDescription(`<@${message.author.id}> ${lang.becomePremium}
			\n${lang.premiumPerks.join('\n')}
			\n\nIf you already are a Patron, make sure you have get your Patron role by linking your Patreon account with Discord.`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Premium)
                .setFooter(lang.defaultFooter, config.Logo);

            message.channel.send(embed);
        }

    }
};


function addPremium(message, tier) {
    return new Promise(async (resolve, reject) => {
        sql.query(`UPDATE zsurvive.users SET premium = ?, premiumUntil = ? WHERE id = ? LIMIT 1;`, [tier.tier, Date.now() + 1000 * 60 * 60 * 24 * 30, message.author.id], async (err, result) => {
            if (err) throw err;
            resolve();
        });
    });
}