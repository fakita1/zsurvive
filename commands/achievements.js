let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {achievementsFunction} = require('../functions/cmdFunctions/achievementsF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');
let {getUser} = require('../functions/getUser.js');


module.exports = {
    name: ['ach', 'achievements', 'collect'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        return achievementsFunction(message, null, lang, surviveFunction);

    }
};