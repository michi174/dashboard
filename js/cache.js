class MyCache {
    constructor() {
        this.summoners = new Array;
        this.matches = new Array;
    }

    loadSummoner(summoner, region) {

        //console.log("----------------");
        //console.log("Cache");
        //console.log("----------------");
        //console.log("cache has " + this.summoners.length + " items");

        if (this.summoners.length > 0) {
            let _summoner = null;

            console.log("looking for summoner " + summoner + " in cache");

            for (let key in this.summoners) {

                let name = (this.summoners[key].name).toLowerCase().replace(/ /g, '');
                let reg = (this.summoners[key].region).toLowerCase();

                console.log("----------------");
                console.log("comparing");
                console.log("----------------");
                console.log(summoner.toLowerCase() + " (" + region.toLowerCase() + ") | from Needle");
                console.log(name + " (" + reg + ") | from Chache");
                console.log("----------------");

                if (name.toLowerCase().replace(/ /g, '') === summoner.toLowerCase() && reg === region.toLowerCase()) {

                    console.log("match found");

                    _summoner = this.summoners[key];
                    break;
                }
                else {
                    console.log("no match");
                }
            }
            if (_summoner !== null) {
                console.log("returning summoner " + _summoner.name);
                return _summoner;
            }
            else {
                console.log("Cant find " + summoner + " (" + region + ") in Cache");
                return false;
            }

        }
        else {
            console.log("summoner cache is empty");
            return false;
        }
    }

    addSummoner(summoner) {
        if (typeof summoner === "object" && summoner !== null) {
            let newSummoner = true;

            for (let [key, oldSummoner] of this.summoners.entries()) {
                if (oldSummoner.accountId === summoner.accountId && oldSummoner.region === summoner.region) {
                    this.summoners[key] = summoner;
                    newSummoner = false;
                    console.log("Updated summoner " + summoner.name + " in Cache");
                    break;
                }
            }

            if (newSummoner) {
                this.summoners.push(summoner);
                console.log("Added summoner " + summoner.name + " to Cache");
            }
    }
    else {
        console.log("Error on caching...");
        console.log(summoner);
        console.log("...has a wrong type.");
    }
}

    loadMatch(matchId, region) {

        //console.log("Cache");
        //console.log("----------------");
        //console.log("cache has " + this.matches.length + " items");

        if (this.matches.length > 0) {
            for (let [index, match] of this.matches.entries()) {

                //console.log("comparing");
                //console.log("----------------");
                //console.log(matchId + " (" + typeof matchId + ") | from Needle");
                //console.log(match.gameId + " (" + typeof match.gameId + ") | from Chache");
                //console.log("----------------");

                if (parseInt(match.gameId) === parseInt(matchId)) {
                    console.info("returning match " + match.gameId + " from cache");
                    match.fromCache = true;
                    return match;
                }
            }
            console.log("no match " + matchId);
            return false;
            
        }
        else {
            return false;
        }
    }

    addMatch(match) {
        let matches = new Array;

        if (!Array.isArray(match)) {
            matches.push(match);
        }
        else {
            matches = match;
        }

        for (let match of matches) {
            if (typeof match === "object" && match !== null) {
                this.matches.push(match);
                console.log(match.gameId + " added to cache");
            }
            else {
                console.log("Error on caching...");
                console.log(match);
                console.log("...has a wrong type.");
            }
        }

    }
}

export {MyCache}