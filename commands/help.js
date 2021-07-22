let {MessageEmbed} = require('discord.js');
const config = require('../config.json');


module.exports = {
    name: ['help', 'donate', 'ayuda'],
    execute(message, args, lang) {

        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | Help`)
            .setDescription(`<@${message.author.id}> ${lang.helpEmbedDesc.join('\n\n')}
		\n\n${lang.becomePremium}
		\n${lang.premiumPerks.join('\n')}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo)
            .setFooter(lang.defaultFooter, config.Logo);

        message.channel.send(embed);
    }
};