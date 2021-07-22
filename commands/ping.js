let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
let {client} = require('../bot.js');
let {getUser, updateUserData} = require('../functions/getUser.js');

module.exports = {
    name: ['ping'],
    async execute(message, args) {


        if (!config.Admins.includes(message.author.id)) return;

        const promises = [
            client.shard.fetchClientValues('guilds.cache.size'),
            client.shard.broadcastEval('this.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0)')
        ];


        return Promise.all(promises)
            .then(async results => {
                const totalGuilds = results[0].reduce((prev, guildCount) => prev + guildCount, 0);
                const totalMembers = results[1].reduce((prev, memberCount) => prev + memberCount, 0);

                let beforedb = (new Date).getTime();
                let user = await getUser(message);
                let data = user.data;
                await updateUserData(data);
                let afterdb = (new Date).getTime();

                let embed = new MessageEmbed()
                    .setTitle(`Pong!`)
                    .setDescription(`**API Latency**: ${client.ws.ping}ms\n**DB read + write**: ${afterdb - beforedb}ms\n\n\n**Server count: ${totalGuilds}\nMember count: ${totalMembers}**`)
                    .setColor(config.EmbedsColor)
                    .setThumbnail(config.Logo);

                await message.channel.send(embed);


            })
            .catch(console.error);

    }
};