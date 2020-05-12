class Graph {
    constructor() {
        this.functions = new Array();
    }

    registerFunction(name, fn) {
        this.functions[name] = fn;
    }

    callFunction(fn, args) {
        if (typeof this[fn] === "function") {
            console.log(fn + " is function");
            return this[fn].apply("", args);
        } else {
            console.log(fn + " is NOT function");
            return null;
        }
    }

    ManipulateGameTimeToLifeTime(lifeTime, matchdetailsContext) {
        let gameTime;
        let _lifeTime = 0;

        gameTime = parseInt(matchdetailsContext.matchdata.gameDuration);
        console.log("Lifetime = " + lifeTime);
        console.log("GameTime = " + matchdetailsContext.matchdata.gameDuration);

        if (lifeTime === 0) {
            _lifeTime = gameTime;
        } else {
            _lifeTime = lifeTime;
        }
        console.log("new Lifetime = " + _lifeTime);

        return _lifeTime;
    }

    SecondsToMinutes(seconds) {
        let minutes = parseInt(Math.floor(seconds) / 60);
        let secondsLeft = seconds - minutes * 60;

        return minutes + " min " + secondsLeft + " sec";
    }
}
export { Graph };
