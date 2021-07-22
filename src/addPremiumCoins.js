let {getUser, updateUserData} = require('../functions/getUser.js');
let {sql} = require('../mysql/mysqlpool.js');


async function addPremiumCoinsForUser(message, tier) {
    return new Promise(async (resolve) => {
        let zuser = await getUser(message);
        if (!zuser) return;
        let data = zuser.data;


        data.coins += tier.coins;
        updateUserData(data);

        sql.query(`UPDATE zsurvive.users SET lastPremiumCoins = ? WHERE id = ? LIMIT 1;`, [Date.now(), message.author.id], async (err) => {
            if (err) throw err;
            resolve();
        });

    });
}

module.exports = {addPremiumCoinsForUser};