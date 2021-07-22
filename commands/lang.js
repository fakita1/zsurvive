let {MessageEmbed} = require('discord.js');
let {getLang, updateLang, getLangList, langExists} = require('../functions/getLang.js');
const config = require('../config.json');
const langFooter = `Please visit https://ZSurvive.xyz if you need more help!`;


module.exports = {
    name: ['lang', 'language'],
    async execute(message, args) {


        if (!args[0]) {

            const embed = new MessageEmbed()
                .setTitle(`ZSurvive | Language setup`)
                .setDescription(`Please select a language from this list:\n` + getLangList())
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo)
                .setFooter(langFooter, config.LogoSmall);


            return message.channel.send(embed);

        }

        if (!langExists(args[0])) {
            const embed = new MessageEmbed()
                .setTitle(`ZSurvive | Language setup`)
                .setDescription(`That language **does not exist**! Please use the **z lang** command to get a list with available languages.`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo)
                .setFooter(langFooter, config.LogoSmall);


            return message.channel.send(embed);
        }


        let lang = await getLang(message);
        if (lang.LangName === args[0]) {
            const embed = new MessageEmbed()
                .setTitle(`ZSurvive | Error`)
                .setDescription(`The **specified language** is the **same as the current one**, please choose a different one.`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo)
                .setFooter(langFooter, config.LogoSmall);

            return message.channel.send(embed);
        }


        // Permissions check

        let allowed = await hasPerms(message);


        if (allowed) {
            await updateLang(message.guild.id, args[0]);
            lang = await getLang(message);

            const embed = new MessageEmbed()
                .setTitle(`ZSurvive | ${lang.langSuccessTitle}`)
                .setDescription(`${lang.langSuccessDescription}`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo)
                .setFooter(lang.defaultFooter, config.LogoSmall);
            return message.channel.send(embed);
        }


        const embed = new MessageEmbed()
            .setTitle(`ZSurvive | Language setup`)
            .setDescription(`You must have the **MANAGE SERVER** or **ADMINISTRATOR** permission to use this command.`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo)
            .setFooter(langFooter, config.LogoSmall);

        message.channel.send(embed);


    }
};


function hasPerms(message) {

    return new Promise(async (resolve, reject) => {

        if (message.guild.ownerID === message.author.id) return resolve(true);


        let member = message.member;
        if (!member) member = await message.guild.members.fetch(message.author.id);


        for (let role of member.roles.cache.keys()) {
            let fetched = await message.guild.roles.fetch(role);
            if (fetched.permissions.has('MANAGE_GUILD') || fetched.permissions.has('ADMINISTRATOR')) return resolve(true);
        }

        return resolve(false);


    });

}