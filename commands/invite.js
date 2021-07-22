module.exports = {
    name: ['invite'],
    execute(message, args, lang) {
        let {MessageEmbed} = require('discord.js');
        const config = require('../config.json');

        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | Invite`)
            .setDescription(`<@${message.author.id}> [**INVITE**](https://zsurvive.xyz/invite?x=invitecmd)`)
            .setColor(config.EmbedsColor)
            .setFooter(lang.defaultFooter, config.Logo);

        message.channel.send(embed);
    }
};