let {MessageEmbed} = require('discord.js');
const config = require('../../config.json');
let {getUser, updateUserData} = require('../getUser.js');
let ach = require('../../configs/achievements.json');
let {awaitR} = require('../awaitR.js');
let upgrades = require('../../configs/upgrades.json');


async function achievementsFunction(message, msg, lang, surviveFunction) {


    let user = await getUser(message);
    let data = user.data;


    let isCollectAvailable = false;
    let achList = '';

    ach.forEach(element => {

        let stage = data.achievements.find(x => x.id === element.id); // Find current stage
        if (!stage) stage = 0; else stage = stage.stageNumber;

        achList += lang.achFormat.replace('{achName}', lang['ach_' + element.id + 'Name'])
            .replace('{stage}', stage)
            .replace('{maxstage}', element.stages.length)
            .replace('{emoji}', config.Reactions.Coins)
            .replace('{coins}', element.reward);

        achList += ' | ';

        let currentStageValue = element.stages[stage]; //stages is the amount that needs to be reached to complete. Stage is the index number stored in player data.achievements

        let isAchCompleted = true;
        let notCompletedTxt;


        if (currentStageValue) {
            switch (element.id) {


                case 'killbosses':

                    if (data.stats.bossesKilled < currentStageValue) { // Ach NOT completed
                        isAchCompleted = false;
                        notCompletedTxt = lang.ach_killbosses.replace(/{amount}/g, currentStageValue).replace('{killed}', data.stats.bossesKilled);
                    }

                    break; // End KILL BOSSES


                case 'upgrades':

                    upgrades.forEach(ele => {
                        let up = data.upgrades.find(x => x.id === ele.id);
                        if (!up || up.tier < currentStageValue) isAchCompleted = false;
                    });

                    if (!isAchCompleted) notCompletedTxt = lang.ach_upgrades.replace('{tier}', currentStageValue);

                    break; // End UPGRADE TIERS


                case 'boxes':

                    if (data.stats.boxesOpened < currentStageValue) {

                        isAchCompleted = false;
                        notCompletedTxt = lang.ach_boxes.replace(/{amount}/g, currentStageValue).replace('{opened}', data.stats.boxesOpened);

                    }

                    break; // End OPEN BOXES


                case 'coins':

                    if (data.stats.coinsSpent < currentStageValue) {

                        isAchCompleted = false;
                        notCompletedTxt = lang.ach_coins.replace(/{amount}/g, currentStageValue).replace('{spent}', data.stats.coinsSpent);

                    }

                    break; // End SPEND COINS


                case 'resources':

                    if (data.stats.resourcesFarmed < currentStageValue) {

                        isAchCompleted = false;
                        notCompletedTxt = lang.ach_resources.replace(/{amount}/g, currentStageValue).replace('{farmed}', data.stats.resourcesFarmed);

                    }

                    break; // End FARM RESOURCES


                default:
                    break;
            }


            if (isAchCompleted) {
                achList += lang.achCompleted;
                isCollectAvailable = true;

            } else achList += notCompletedTxt;


        } else achList += lang.achMaxStageReached; // Max stage reached so no more rewards


        achList += '\n\n'; // Always add \n\n


    });


    let embed = new MessageEmbed()
        .setTitle(`ZSurvive | ${lang.achievementsEmbedTitle}`)
        .setDescription(`<@${message.author.id}> ${lang.achievementsEmbedDesc.replace('{emoji}', config.Reactions.Coins)}
        \n\n\n${achList}
        \n\n${lang.reactionsMenuGoBack.replace('{emoji}', config.Reactions.GoBack)}`)
        .setColor(config.EmbedsColor)
        .setThumbnail(config.Images.Achievements)
        .setFooter(lang.defaultFooter, config.Logo);

    if (msg != null) msg = await msg.edit(embed); else msg = await message.channel.send(embed);


    let emojis = [config.Reactions.GoBack];
    if (isCollectAvailable) emojis.push(config.Reactions.Buy);

    let reaction = await awaitR(msg, message, emojis, lang);


    // START COLLECT

    if (reaction === config.Reactions.GoBack) return surviveFunction(message, msg, lang); else if (reaction === config.Reactions.Buy) {


        user = await getUser(message);
        data = user.data;

        let amountCollected = 0;
        ach.forEach(achElement => {


            let userAch = data.achievements.find(x => x.id === achElement.id);

            if (!userAch) {
                data.achievements.push({id: achElement.id, stageNumber: 0});
                userAch = data.achievements.find(x => x.id === achElement.id);
            }


            let currentStageValue = achElement.stages[userAch.stageNumber];


            if (currentStageValue) {
                let isAchCompleted = true;


                switch (userAch.id) {


                    case 'killbosses':

                        if (data.stats.bossesKilled < currentStageValue) isAchCompleted = false;


                        break; // End KILL BOSSES


                    case 'upgrades':

                        upgrades.forEach(ele => {
                            let up = data.upgrades.find(x => x.id === ele.id);
                            if (!up || up.tier < currentStageValue) isAchCompleted = false;
                        });


                        break; // End UPGRADE TIERS


                    case 'boxes':

                        if (data.stats.boxesOpened < currentStageValue) isAchCompleted = false;


                        break; // End OPEN BOXES


                    case 'coins':

                        if (data.stats.coinsSpent < currentStageValue) isAchCompleted = false;


                        break; // End SPEND COINS


                    case 'resources':

                        if (data.stats.resourcesFarmed < currentStageValue) isAchCompleted = false;

                        break; // End FARM RESOURCES


                    default:
                        break;
                }


                if (isAchCompleted) {
                    amountCollected += achElement.reward;
                    userAch.stageNumber++;
                }


            }

        });


        let confirmationTxt;

        if (amountCollected > 0) {

            confirmationTxt = lang.achCollectConfirmation.replace('{amount}', amountCollected);
            data.coins += amountCollected;
            await updateUserData(data);


        } else confirmationTxt = lang.achNotCompleted;


        let embed = new MessageEmbed()
            .setTitle(`ZSurvive | ${lang.achievementsEmbedTitle}`)
            .setDescription(`<@${message.author.id}> ${confirmationTxt}
            \n\n${lang.reactionsMenuOk.replace('{emoji}', config.Reactions.Yes)}`)
            .setColor(config.EmbedsColor)
            .setThumbnail(config.Images.Achievements)
            .setFooter(lang.defaultFooter, config.Logo);

        if (!msg) msg = await message.channel.send(embed); else msg = await msg.edit(embed);


        let reaction = await awaitR(msg, message, [config.Reactions.Yes], lang);
        if (reaction) return achievementsFunction(message, msg, lang, surviveFunction);


    }


}

module.exports = {achievementsFunction};