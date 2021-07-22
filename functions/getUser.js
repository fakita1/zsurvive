let {sql} = require('../mysql/mysqlpool.js');
let upgrades = require('../configs/upgrades.json');
let zones = require('../configs/zones.json');


let hpupdefault = upgrades.find(x => x.id === 'hp');
let dmgupdefault = upgrades.find(x => x.id === 'damage');
let energyupdefault = upgrades.find(x => x.id === 'energy');
const config = require('../config.json');
const timePerEnergy = config.MinutesPerEnergy * 60 * 1000; // Calculate minutes to ms
const tiers = require('../configs/patreonTiers.json');


function getUser(message) {

    return new Promise((resolve, reject) => {
        sql.query(`SELECT id, data, premium, lastPremiumCoins FROM zsurvive.users WHERE id = ? LIMIT 1;`, message.author.id, async (err, rows) => {
            if (err) throw err;

            if (!rows[0]) return resolve(rows[0]);

            let user = rows[0];
            let data = JSON.parse(user.data);


            data.maxhp = getMaxHp(data);
            if (data.hp > data.maxhp) data.hp = data.maxhp;
            data.dmg = getDmg(data);

            data.maxenergy = getMaxEnergy(data);
            if (user.premium !== null) {
                let tier = tiers.find(x => x.tier === user.premium);
                data.maxenergy += tier.energy;
            }

            data = getEnergy(data); // Also sets human readable time for energy & notif
            data.lastEnergyRegen = Date.now();
            data.stats.userName = message.author.username + '#' + message.author.discriminator;
            data.stats.bossesKilled = 0;

            if (message.guild) data.stats.lastGuild = message.guild.id;


            data.zones.forEach(zone => {
                let killed = zone.bossesKilled || 0;
                let zoneData = zones.find(x => x.id === zone.id);
                if (killed > zoneData.bossAmount) zone.bossesKilled = zoneData.bossAmount;
                data.stats.bossesKilled += zone.bossesKilled;
            });


            user.data = data;
            resolve(user);
        });
    });


}


function updateUserData(data) {

    return new Promise((resolve, reject) => {

        let name = data.stats.userName;
        data.stats.userName = '';

        data = getEnergy(data); // Refresh energy for acurrate notification and information on farm energy


        sql.query(`UPDATE zsurvive.users SET data = ?, bossesKilled = ?, coinsSpent = ?, resourcesFarmed = ?, userName = ?, energyNotifAt = ? WHERE id = ? LIMIT 1;`, [JSON.stringify(data), data.stats.bossesKilled, data.stats.coinsSpent, data.stats.resourcesFarmed, name, data.stats.energyNotifAt, data.id], async (err, rows) => {
            if (err) throw err;
            return resolve();
        });


    });


}


module.exports = {getUser, updateUserData};


function getMaxHp(data) {

    let hpmax = 5;
    let up = data.upgrades.find(x => x.id === 'hp');

    if (up) {

        for (let i = 0; i <= up.tier; i++) { // For with all completed and current tiers in hp
            let tier = hpupdefault.tiers.find(x => x.from <= i && x.to >= i); // Current default tier in for loop

            let levels = 5;
            if (i === 0) levels = 2;


            if (tier) {
                if (i < up.tier) hpmax += tier.amount * levels; else hpmax += tier.amount * up.level; // If tier is completed (== not the current one), add all levels to hp max.
            }


        }
    }

    return hpmax;
}


function getDmg(data) {

    let dmg = 5;
    let up = data.upgrades.find(x => x.id === 'damage');

    if (up) {

        for (let i = 0; i <= up.tier; i++) { // For with all completed and current tiers in hp
            let tier = dmgupdefault.tiers.find(x => x.from <= i && x.to >= i); // Current default tier in for loop

            let levels = 5;
            if (i === 0) levels = 2;


            if (tier) {
                if (i < up.tier) dmg += tier.amount * levels; else dmg += tier.amount * up.level; // If tier is completed (== not the current one), add all levels to hp max.
            }

        }
    }

    return dmg;
}


function getMaxEnergy(data) {

    let max = 10;
    let up = data.upgrades.find(x => x.id === 'energy');

    if (up) {

        for (let i = 0; i <= up.tier; i++) { // For with all completed and current tiers in hp
            let tier = energyupdefault.tiers.find(x => x.from <= i && x.to >= i); // Current default tier in for loop

            let levels = 5;
            if (i === 0) levels = 2;


            if (tier) {
                if (i < up.tier) max += tier.amount * levels; else max += tier.amount * up.level; // If tier is completed (== not the current one), add all levels to hp max.
            }

        }
    }


    return parseFloat(max.toFixed(1));
}


function getEnergy(data) {

    let now = Date.now();
    let difference = now - data.lastEnergyRegen; // Difference between now and last regen
    data.energy += difference / timePerEnergy;
    if (data.energy >= data.maxenergy) data.energy = data.maxenergy;


    let remainingMS = timePerEnergy * (data.maxenergy - data.energy);
    data.energyTimeTxt = getReadableTime(remainingMS);
    data.energy = parseFloat(data.energy.toFixed(1)); // Rounded at the end to get exact timeTxt


    if (data.energy >= data.maxenergy || data.notifDisabled) data.stats.energyNotifAt = null; else data.stats.energyNotifAt = now + remainingMS; // Notifications


    return data;
}


function getReadableTime(s) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;
    if (hrs < 10) hrs = '0' + hrs;
    if (mins < 10) mins = '0' + mins;
    if (secs < 10) secs = '0' + secs;


    return hrs + ':' + mins + ':' + secs;
}