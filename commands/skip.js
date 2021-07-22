let {getUser} = require('../functions/getUser.js');
let {insertUser} = require('../functions/cmdFunctions/tutorial.js');
let {MessageEmbed} = require('discord.js');
const config = require('../config.json');


module.exports = {
    name: ['skip'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (user) return message.reply('You can\'t skip the tutorial because you already have a survivor!');

        await insertUser(message);

        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | Tutorial`)
            .setDescription(`You have successfully created a survivor! Type \`z survive\` to start playing.`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo);

        return message.channel.send(embed);


    }
};