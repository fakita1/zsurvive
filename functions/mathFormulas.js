function getUpResAmountNeeded(tierN, baseTier) {

    let totalTierN = tierN - baseTier;
    let n = 6 * ((totalTierN * totalTierN) / 2 + 1);
    return Math.floor(n);
}


function getExactFarmedAmount(tool, baseTier) {
    let tierMultiplier = (tool.tier - baseTier) * 6; //That is *X to add importance to tier, and then tool level * 0.1 in main formula
    if (tierMultiplier < 0) tierMultiplier = 0;


    return Math.floor(7 + 1.5 * (tierMultiplier + 0.2 * tool.level));

    /* FORMULA USED FOR FARM AMOUNT:
    Base amount of farm: 5

    The difference between the tier and the requiered tier. If required tier level is not reached, this plus is 0, so nothing is added.
    */

}


function getFarmedAmount(tool, baseTier) {

    let farmedAmount = getExactFarmedAmount(tool, baseTier);


    let max = Math.floor(farmedAmount * 1.5), min = Math.floor(farmedAmount / 1.5);
    farmedAmount = Math.floor(Math.random() * (max - min + 1)) + min; //max and min included

    return farmedAmount;

}


function getPercentageSymbols(current, max) {
    let percentage = (current / max) * 100;
    let symbols = '';

    for (let i = 0; i <= 9; i++) {
        if (percentage >= 10) symbols += '▰'; else symbols += '▱';
        percentage -= 10;
    }


    return symbols;
}


module.exports = {getUpResAmountNeeded, getFarmedAmount, getPercentageSymbols};