let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {mapFunction} = require('../functions/cmdFunctions/mapF.js');
let {zoneFunction} = require('../functions/cmdFunctions/zoneF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');
let {getUser} = require('../functions/getUser.js');


module.exports = {
    name: ['map', 'zone', 'zones', 'travel', 'farm'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        if (!args[0]) return mapFunction(message, null, lang, surviveFunction);


        const zones = require('../configs/zones.json');

        let zone = zones.find(x => x.id === args[0]);

        let zonesTxt = [];
        zones.forEach(element => {
            zonesTxt.push(element.id);
        });

        zonesTxt = zonesTxt.join(' | ');
        if (!zone) return message.reply('`z map { ' + zonesTxt + ' }`');
        zoneFunction(message, null, lang, surviveFunction, zone, mapFunction);

    }
};