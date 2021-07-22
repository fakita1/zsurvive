let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {healFunction} = require('../functions/cmdFunctions/healF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');
let {getUser} = require('../functions/getUser.js');


module.exports = {
    name: ['heal', 'healing'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        return healFunction(message, null, lang, surviveFunction);

    }
};