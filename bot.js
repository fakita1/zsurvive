const envconfig = require('./envconfig.json');
const PREFIX = 'z ';
const Discord = require('discord.js-light');

const client = new Discord.Client({
    cacheGuilds: true,
    cacheChannels: false,
    cacheOverwrites: false,
    cacheRoles: false,
    cacheEmojis: false,
    cachePresences: false,

    ws: {intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'DIRECT_MESSAGES']}
});

module.exports = {client};


const fs = require('fs');
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    command.name.forEach(element => {
        client.commands.set(element, command);
    });

}


client.on('ready', () => {

    console.log(`ZShard ${client.shard.ids[0]} online.`);

    client.user.setActivity('ZSurvive.xyz | z help');

    setInterval(() => {
        client.user.setActivity('ZSurvive.xyz | z help');
    }, 1000 * 60 * 15);


    require('./src/onReaction.js');
    require('./src/onGuild.js');

    if (client.shard.ids[0] === 0) {
        require('./src/notificationsManager.js');
        require('./src/dblapi.js');
        require('./src/removeExpiredPatreons.js');
    }


});


let {getLang} = require('./functions/getLang.js');


client.on('message', async message => {


    if (message.author.bot || !message.content.toLowerCase().startsWith(PREFIX)) return;
    let args = message.content.substring(PREFIX.length).toLowerCase().split(' ');
    const command = args.shift().toLowerCase();
    if (!client.commands.has(command)) return;

    if (message.guild === null && command !== 'notifications') return; // Private message
    let lang = await getLang(message);


    try {

        client.commands.get(command).execute(message, args, lang);

    } catch (error) {
        sendError(error);
        message.reply('beep boop! There was an error trying to execute that, please try again later.');
    }


});


const ignore = ['Missing Permissions', 'Unknown Message', 'Missing Access', 'Cannot read property \'emoji\' of undefined', 'Cannot send messages to this user', 'AbortError',
    'Unknown Channel', 'socket hang up', 'failed, reason: read ECONNRESET', 'Response: Internal Server Error'];

process
    .on('unhandledRejection', async (reason) => {

        let shouldSend = true;
        ignore.forEach(element => {
            if (reason.toString().includes(element)) shouldSend = false;
        });

        if (shouldSend) sendError(reason);
    })


    .on('uncaughtException', err => {

        sendError(err);

    });


client.login(envconfig.BotToken);


const {Webhook, MessageBuilder} = require('discord-webhook-node');
const errorhook = new Webhook(envconfig.ErrorWebhook);


function sendError(err) {

    if (envconfig.Dev) console.log(err);

    let error = err.toString();
    if (err.stack) error = err.stack.toString();


    try {

        if (error === '[object Response]') return; // Too many requests discord api


        const embed = new MessageBuilder()
            .setTitle('Beep boop... I had an error!')
            .setColor(14036783)
            .setThumbnail('https://images.emojiterra.com/google/android-nougat/512px/26a0.png')
            .setDescription(error);
        errorhook.send(embed);


    } catch (e) {
        console.error(e + 'For some reason I could not send this to error Discord channel:\n\n', err);
    }
}