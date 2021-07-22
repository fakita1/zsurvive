const config = require('../config.json');
let {MessageEmbed} = require('discord.js');

function awaitR(msg, message, emojis, lang, tutorial) {

    return new Promise(async (resolve, reject) => {


        if (tutorial && tutorial.isTutorial === true) {

            let embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.tutorialTitle}`)
                .setDescription(`<@${message.author.id}> ${tutorial.embedDesc}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(tutorial.embedImage)
                .setFooter(lang.defaultFooter, config.Logo);

            if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);

        }


        let reaction;

        const filter = (reaction, user) => {
            return emojis.includes(reaction.emoji.name) && user.id === message.author.id;
        };


        msg.awaitReactions(filter, {max: 1, time: config.Timeout, errors: ['time']})
            .then(async collected => {

                reaction = collected.first().emoji.name;
                if (tutorial && tutorial.isTutorial === true) resolve(msg); else resolve(reaction);

                await msg.reactions.removeAll();


            }).catch(err => {
            resolve(null);
            return handleError(err, msg, lang, message);
        });


        for (let i = 0; i < emojis.length; i++) {
            if (!reaction || !emojis.includes(reaction)) { // !emojis.includes(reaction) is an OLD CHECK because I couldnt find a way to fix a bug where an old emoji was stored. I THINK IT IS FIXED NOW!

                try {
                    await msg.react(emojis[i]); // For each emoji react if it was not reacted.
                } catch (err) {
                    resolve(null);
                    return handleError(err, msg, lang, message);
                }

            }
        }

    });

}


async function handleError(err, msg, lang, message) {


    let embed;

    if (err.toString().includes('Missing Permissions')) {

        let permsTxt = '';
        lang.neededPermissions.forEach(element => {
            permsTxt += `\n- ${element}`;
        });


        embed = new MessageEmbed()
            .setTitle(`ZSurvive`)
            .setDescription(`<@${message.author.id}> ${lang.missingPermissions}\n${permsTxt}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo)
            .setFooter(lang.defaultFooter, config.Logo);


    } else {

        embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.generalTimeout}`)
            .setDescription(`<@${message.author.id}> ${lang.generalTimeoutDesc}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Timeout)
            .setFooter(lang.defaultFooter, config.Logo);

    }


    try {
        await msg.edit(embed);
        await msg.reactions.removeAll();
    } catch (e) {
    }


}


module.exports = {awaitR};