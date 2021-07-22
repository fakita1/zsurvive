let {sql} = require('../../mysql/mysqlpool.js');
const config = require('../../config.json');
let {surviveFunction} = require('./surviveF.js');
let {awaitR} = require('../awaitR');


async function startTutorial(message, lang) {


    let msg = await awaitR(null, message, [config.Reactions.Yes], lang, {
        isTutorial: true,
        embedDesc: lang.tutorialInitial.replace('{emoji}', config.Reactions.Yes),
        embedImage: config.Logo
    });
    if (!msg) return;


    msg = await awaitR(msg, message, [config.Reactions.Map], lang, {
        isTutorial: true,
        embedDesc: lang.tutorialMenu.replace('{emoji}', config.Reactions.Map).replace('{forest_emoji}', '🌲'),
        embedImage: config.Logo
    });
    if (!msg) return;


    msg = await awaitR(msg, message, [config.Reactions.Farm], lang, {
        isTutorial: true,
        embedDesc: lang.tutorialFarm + lang.reactionsMenuFarm.replace('{emoji}', config.Reactions.Farm),
        embedImage: config.Images.Farm
    });
    if (!msg) return;


    msg = await awaitR(msg, message, [config.Reactions.Upgrades], lang, {
        isTutorial: true,
        embedDesc: lang.tutorialUpgrade.replace('{emoji}', config.Reactions.Upgrades),
        embedImage: config.Images.Upgrades
    });
    if (!msg) return;


    msg = await awaitR(msg, message, [config.Reactions.Fight], lang, {
        isTutorial: true,
        embedDesc: `${lang.tutorialFight.replace('{emoji}', config.Reactions.Fight)}\n\n\n${lang.reactionsMenuFight.replace('{emoji}', config.Reactions.Fight)}`,
        embedImage: config.Images.Bosses
    });
    if (!msg) return;


    await insertUser(message);


    msg = await awaitR(msg, message, [config.Reactions.Yes], lang, {
        isTutorial: true,
        embedDesc: lang.tutorialFinishEmbed.replace('{emoji}', config.Reactions.Yes),
        embedImage: config.Images.Yes
    });
    if (msg) return surviveFunction(message, msg, lang);


}


async function insertUser(message) {
    return new Promise(async (resolve, reject) => {


        let defaultData = {
            id: message.author.id,
            coins: 10,
            hp: 20,
            maxhp: 20,
            dmg: 1,
            energy: 15,
            maxenergy: 15,
            lastEnergyRegen: 0,
            inventory: [],
            zones: [],
            upgrades: [
                {
                    id: 'pickaxe',
                    tier: 0,
                    level: 1
                }
            ],
            achievements: [],
            stats: {
                bossesKilled: 0,
                coinsSpent: 0,
                boxesOpened: 0,
                resourcesFarmed: 0
            }
        };


        let now = (new Date).getTime();


        sql.query(`SELECT * FROM zsurvive.users WHERE id = ? LIMIT 1;`, message.author.id, async (err, rows) => {
            if (err) throw err;

            if (!rows[0]) { // If there is no user insert it

                sql.query(`INSERT INTO zsurvive.users (id, data, createdAt) VALUES (?, ?, ?);`, [message.author.id, JSON.stringify(defaultData), now], async (err, rows) => {
                    if (err) throw err;

                    resolve();

                });
            }
        });


    });

}


module.exports = {startTutorial, insertUser};