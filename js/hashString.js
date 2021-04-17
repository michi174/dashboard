export default class Tools {
    constructor() {}
    static getRandomHexString(_bits = 16, _blocks = 1) {
        let numBlocks = _blocks;

        let blocks = new Array();
        let builtString = "";

        for (let j = 0; j < numBlocks; j++) {
            let random = Math.random();
            let bits = _bits;
            let multiplier = 2 ** bits;
            let yourNumber = parseInt(random * multiplier);

            let hexString = yourNumber.toString(16);

            let length = hexString.length;

            let missingFigures = bits / 4 - length;

            console.log(missingFigures);

            if (missingFigures > 0) {
                for (let i = 0; i < missingFigures; i++) {
                    hexString = "0" + hexString;
                }
            }

            blocks.push(hexString);
            builtString += hexString;

            if (j < numBlocks - 1) {
                builtString += "-";
            }
        }
        return builtString;
    }

    static GUID() {
        let guid = Tools.getRandomHexString(16, 1);
        guid += "-" + Tools.getRandomHexString(32, 1);
        guid += "-" + Tools.getRandomHexString(32, 1);
        guid += "-" + Tools.getRandomHexString(32, 1);
        guid += "-" + Tools.getRandomHexString(16, 1);

        return guid;
    }
}
