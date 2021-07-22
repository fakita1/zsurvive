let {getUser} = require('../functions/getUser.js');
let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {marketFunction} = require('../functions/cmdFunctions/marketF.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');


module.exports = {
    name: ['market', 'shop'],
    async execute(message, args, lang) {


        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        return marketFunction(message, null, lang, surviveFunction);

    }
};