let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
let {getUser, updateUserData} = require('../functions/getUser.js');


module.exports = {
    name: ['stats', 'profile', 'user'],
    async execute(message, args, lang) {


        let taggedUser = message.author;
        if (message.mentions.users.size) taggedUser = message.mentions.users.first();
        else if (args[0]) taggedUser = {id: args[0]};


        let user = await getUser({author: {id: taggedUser.id}});


        if (!user) {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.statsTitle}`)
                .setDescription(`That user has not completed the tutorial yet!`)
                .setColor(config.EmbedsColor)
                .setThumbnail('https://images.emojiterra.com/twitter/v13.0/128px/1f4ca.png');

            return message.channel.send(embed);
        }


        let data = user.data;


        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.statsTitle}`)
            .setDescription(`:man_mage: ${lang.surviveSurvivor.replace('{user}', '<@' + data.id + '>')}
            \n:heart: ${data.maxhp} HP 
            \n:zap: ${data.maxenergy}
            \n${config.Reactions.Fight} ${lang.surviveDamage.replace('{amount}', data.dmg)}
			\n
			- ${lang.stats_bossesKilled.replace('{amount}', data.stats.bossesKilled)}
			- ${lang.stats_coinsSpent.replace('{amount}', data.stats.coinsSpent)}
			- ${lang.stats_boxesOpened.replace('{amount}', data.stats.boxesOpened)}
			- ${lang.stats_resourcesFarmed.replace('{amount}', data.stats.resourcesFarmed)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail('https://images.emojiterra.com/twitter/v13.0/128px/1f4ca.png');

        message.channel.send(embed);


    }
};