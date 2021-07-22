let {getUser} = require('../functions/getUser.js');
let {startTutorial} = require('../functions/cmdFunctions/tutorial.js');
let {surviveFunction} = require('../functions/cmdFunctions/surviveF.js');


module.exports = {
    name: ['survive', 'survival'],
    async execute(message, args, lang) {

        let user = await getUser(message);
        if (!user) return startTutorial(message, lang);
        surviveFunction(message, null, lang);

    }
};