let {MessageEmbed} = require('discord.js');
const config = require('../config.json');
let {getUser, updateUserData} = require('../functions/getUser.js');


module.exports = {
    name: ['edit'],
    async execute(message, args) {

        if (!config.Admins.includes(message.author.id)) return;
        if (!args[1]) return message.reply('`.set {prop} {value} {add/remove/null} @user ` (tag the user please!)');


        let taggedUser = message.author;
        if (message.mentions.users.size) taggedUser = message.mentions.users.first();


        let user = await getUser({author: {id: taggedUser.id}}); // Simulate message
        if (!user) return message.reply('User was not found, survivor needs to finish tutorial first.');
        let data = user.data;


        let notFoundTxt = '';
        if (data[args[0]] === undefined) notFoundTxt = '**Prop was not found, but I added it for you**';

        let oldValue = data[args[0]];

        if (message.content.includes('add')) {
            data[args[0]] += parseInt(args[1]);

        } else if (message.content.includes('remove')) {
            data[args[0]] -= parseInt(args[1]);

        } else {
            data[args[0]] = parseInt(args[1]);
        }


        await updateUserData(data);

        let embed = new MessageEmbed()
            .setTitle(`Success!`)
            .setDescription(`${notFoundTxt}\n<@${message.author.id}> **Updated user!**\nProp: ${args[0]}\nValue: ${data[args[0]]}\nOld value: ${oldValue}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Logo);

        await message.channel.send(embed);


    }
};