let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
let {getUser, updateUserData} = require('../functions/getUser.js');


module.exports = {
    name: ['notifications', 'notification'],
    async execute(message, args) {

        if (args[0] !== 'on' && args[0] !== 'off') {

            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | Notifications`)
                .setDescription(`To toggle notifications type \`z notifications off\` or \`z notifications on\``)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo);

            return message.channel.send(embed);

        }


        let user = await getUser(message); // Simulate message

        if (!user) {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | Notifications`)
                .setDescription(`Please **complete the tutorial first**! Use the \`z survive\` command in any channel.`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo);

            return message.channel.send(embed);
        }


        let data = user.data;


        if ((args[0] === 'on' && !data.notifDisabled) || (args[0] === 'off' && data.notifDisabled)) {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | Notifications`)
                .setDescription(`You already have notifications **turned ${args[0]}**!`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo);

            return message.channel.send(embed);
        }


        data.notifDisabled = args[0] === 'off';
        await updateUserData(data);


        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | Notifications`)
            .setDescription(`You have successfully **updated your preferences**!`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo);

        message.channel.send(embed);


    }
};