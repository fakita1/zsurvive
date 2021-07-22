let {MessageEmbed} = require('discord.js');
let {getUser} = require('../functions/getUser.js');
let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let upgrades = require('../configs/upgrades.json');
let {upgradeListFunction} = require('../functions/cmdFunctions/upgradeListF.js');
let {upgradeFunction} = require('../functions/cmdFunctions/upgradeF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');
const config = require('../config.json');
let {awaitR} = require('../functions/awaitR.js');


const resourcesData = require('../configs/resources.json');


let resources = [];

for (const prop in resourcesData) {
    resourcesData[prop].forEach(element => {
        element.zone = prop;
        resources.push(element);
    });
}


module.exports = {
    name: ['upgrade', 'up', 'upgrades'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        if (!args[0]) return upgradeListFunction(message, null, lang, surviveFunction);


        let upgradeElement = upgrades.find(x => x.id === args[0]);
        if (!upgradeElement) {
            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.upgradesEmbedTitle}`)
                .setDescription(`<@${message.author.id}> ${lang.defaultNotFound}
                \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Upgrades)
                .setFooter(lang.defaultFooter, config.Logo);

            let msg = await message.channel.send(embed);

            let reaction = await awaitR(msg, message, [config.Reactions.Yes], lang);
            if (reaction) surviveFunction(message, msg, lang);
            return;
        }


        upgradeFunction(message, null, lang, surviveFunction, upgradeListFunction, upgradeElement);

    }
};