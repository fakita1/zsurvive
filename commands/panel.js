const config = require('../config.json');
let {MessageEmbed} = require('discord.js');
let {updatePanelIdFromCache} = require('../src/onReaction');
let {getLang} = require('../functions/getLang.js');


module.exports = {
    name: ['panel'],
    async execute(message, args, lang) {

        if (message.guild.id !== '503243929559367710') return message.reply('This can only be used from main Discord server!');


        let embed;

        if (!args[0]) {
            embed = new MessageEmbed()
                .setTitle(`ZSurvive | Information`)
                .setDescription(`\u200b\n\u200b**__Rules__**: 

                **[1]** Do not send spam or flood. Discord invites will be deleted by auto-mod, and user will be warned.
                **[2]** No personal attacks, please be respectful with other members. Don't send IP grabber links or other user's personal information.
                **[3]** Please respect channels or you will might be warned. For example, do not start discussing things in the suggestions channel.

                - Use your common sense, staff can warn you for any other reason if they think it is necessary.
                - We follow Discord's [community guidelines](https://discordapp.com/guidelines/).
                

                **__Useful links__**:
                [**Website**](https://zsurvive.xyz)
                :love_letter:  [**Invite the BOT to your server**](https://zsurvive.xyz/invite)
                **Server invite**: https://discord.gg/asdcd7F`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo);

            let msg = await message.channel.send(embed);

        } else if (args[0] === 'roles') {

            embed = new MessageEmbed()
                .setTitle(`ZSurvive | Roles`)
                .setDescription(`React with 🧙‍♂️ to get a **role** according to the **zones you have __unlocked__**!


            - **<@&737101964600541236>**
            - **<@&737490387467370536>**
            - **<@&736415554239201311>**
            - **<@&736415556986732584>**
            - **<@&736415551773081630>**
            

            You will receive a confirmation by private message (if you do not have your DM's turned off).

            - Information about **PATREON** roles in <#738072031018352781>`)
                .setColor(config.EmbedsColor)
                .setThumbnail('https://images.emojiterra.com/twitter/v13.0/128px/1f9d9-2642.png');

            let msg = await message.channel.send(embed);
            await msg.react('🧙‍♂️');
            updatePanelIdFromCache(msg.id);


        } else if (args[0] === 'patreon') {

            let lang = await getLang(message);


            embed = new MessageEmbed()
                .setTitle(`ZSurvive | Patreon`)
                .setDescription(`\u200bDo you want to **support ZSurvive's development** and **get rewarded** by doing so?


                [**Become a Patron**](https://zsurvive.xyz/patreon?x=panel) and get access to these perks:

                ${lang.premiumPerks.join('\n')}

                - **<@&750788372313669752>**
                - **<@&750788435534545007>**
                - **<@&750788444476932216>**
                - **<@&750788456212332706>**

                
                :star: Become a **Patron** now! Find more information [**here**](https://zsurvive.xyz/patreon?x=panel).`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Images.Premium);

            let msg = await message.channel.send(embed);
        }

    }
};