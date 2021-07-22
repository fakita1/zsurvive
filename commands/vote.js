let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {getUser} = require('../functions/getUser.js');


module.exports = {
    name: ['vote'],
    async execute(message, args, lang) {

        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);


        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.vote}`)
            .setDescription(`<@${message.author.id}> ${lang.voteDesc.replace('{coins}', config.VoteReward)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Vote)
            .setFooter(lang.defaultFooter, config.Logo);

        message.channel.send(embed);
    }
};