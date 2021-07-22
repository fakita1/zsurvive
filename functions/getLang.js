let {sql} = require('../mysql/mysqlpool.js');
const channels = require('../configs/channels.json');
let fs = require('fs');
let path = require('path');

let langs = [];
let guilds = [];


const langFiles = fs.readdirSync('./lang').filter(file => file.endsWith('.json'));
let en = fs.readFileSync(path.join(__dirname, '..', 'lang', 'en.json'));
en = JSON.parse(en); // EN for default


for (const file of langFiles) {
    let rawdata = fs.readFileSync(path.join(__dirname, '..', 'lang', file));
    let langdata = JSON.parse(rawdata);
    langdata = {...en, ...langdata};// Merge both objects, priority for selected

    langs.push(langdata);
}


function getLang(message) {

    let lang = 'en';

    return new Promise(async (resolve, reject) => {


        if (!message.guild || !message.guild.id) return resolve(langs.find(x => x.LangName === 'en')); // Private messages


        if (message.guild.id === '503243929559367710' && message.channel) { // Multi language for ZSurvive guild
            let ch = channels.find(x => x.id === message.channel.id);
            if (ch) return resolve(langs.find(x => x.LangName === ch.lang));
        }


        let search = guilds.find(g => g.id === message.guild.id); // Search on cache

        if (search) { // Guild was found
            let langobj = langs.find(x => x.LangName === search.lang);
            return resolve(langobj);
        }


        sql.query(`SELECT * FROM zsurvive.guilds WHERE guild = ?;`, message.guild.id, async (err, rows) => {
            if (err) throw err;

            if (rows[0] && rows[0].lang) lang = rows[0].lang; // Lang = mysql lang


            let langobj = langs.find(x => x.LangName === lang); // Selected lang
            if (!langobj) langobj = langs.find(x => x.LangName === 'en'); // Default EN


            guilds.push({id: message.guild.id, lang: langobj.LangName, time: (new Date).getTime()});

            resolve(langobj);

        });

    });

}


function updateLang(guildid, lang) {

    return new Promise((resolve, reject) => {


        let g = guilds.find(x => x.id === guildid);
        if (g) g.lang = lang; // Updating cache


        sql.query(`UPDATE zsurvive.guilds SET lang = ? WHERE guild = ?;`, [lang, guildid], async (err, result) => {
            if (err) throw err;
            if (result.affectedRows > 0) return resolve();


            sql.query(`INSERT INTO zsurvive.guilds (guild, lang) VALUES (?, ?);`, [guildid, lang], async (err, rows) => {
                if (err) throw err;
                return resolve();
            });


        });

    });

}


function getLangList() {

    let txt = '';


    langs.forEach(element => {
        txt += `\n${element.LangEmoji} \`${element.LangName}\` | ${element.LangSetup.replace('{cmd}', '\`z lang ' + element.LangName + '\`')}`;
    });


    return txt;
}


function langExists(lang) {

    let langobj = langs.find(x => x.LangName === lang);
    return !!langobj;


}


module.exports = {getLang, updateLang, getLangList, langExists};


setInterval(() => { // Clean cache every 15m. All server that were not used in the last 30m

    guilds = guilds.filter(x => x.time + 1000 * 60 * 30 > (new Date).getTime());

}, 1000 * 60 * 15);