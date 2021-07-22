let {client} = require('../bot.js');
let {checkZGuildRolesForUser} = require('./checkZGuildRoles');


let path = require('path');
let fs = require('fs');
let cache = fs.readFileSync(path.join(__dirname, '..', 'envconfig.json'));
cache = JSON.parse(cache);


client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot || !reaction.message.guild || reaction.message.guild.id !== '503243929559367710' || !cache || !cache.reactionPanelMessageID || cache.reactionPanelMessageID !== reaction.message.id) return;


    // When we receive a reaction we check if the reaction is partial or not
    if (reaction.partial) {
        // If the message this reaction belongs to was removed the fetching might result in an API error, which we need to handle
        try {
            await reaction.fetch();
        } catch (error) {
            console.log('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }


    let r = await reaction.users.fetch({limit: 100});
    r.forEach(element => {
        if (!element.bot) reaction.users.remove(element.id); //Deleting all reactions with this emoji that aren't from the bot
    });


    checkZGuildRolesForUser(user.id, true);

});


function updatePanelIdFromCache(newID) {

    cache.reactionPanelMessageID = newID;
    fs.writeFile(path.join(__dirname, '..', 'envconfig.json'), JSON.stringify(cache, null, 2), function (err) {
        if (err) return console.log(err);
    });

}


module.exports = {updatePanelIdFromCache};