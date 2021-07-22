let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
let {sql} = require('../mysql/mysqlpool.js');

module.exports = {
    name: ['deleteuser'],
    async execute(message, args) {

        if (!config.Admins.includes(message.author.id)) return;
        if (!message.mentions.users.size) return message.reply('tag an user please.');

        let taggedUser = message.mentions.users.first();

        sql.query(`UPDATE zsurvive.users SET id = ? WHERE id = ? LIMIT 1;`, ['DELETED_' + taggedUser.id, taggedUser.id], async (err, result) => {
            if (err) throw err;

            let embed = new MessageEmbed()
                .setTitle(`Success!`)
                .setDescription(`Database updated. Affected rows: ${result.affectedRows} (must be 1 if user existed before)`)
                .setColor(config.EmbedsColor)
                .setThumbnail(config.Logo);

            await message.channel.send(embed);

        });

    }
};