let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {invFunction} = require('../functions/cmdFunctions/invF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');
let {getUser} = require('../functions/getUser.js');


module.exports = {
    name: ['inv', 'inventory'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        return invFunction(message, null, lang, surviveFunction);

    }
};