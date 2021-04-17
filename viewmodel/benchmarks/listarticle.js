import ViewModel from "../../js/viewmodel/viewmodel.js";
import Helpers from "../../js/helpers.js";
import App from "../../js/app.js";

export class listarticle {
    constructor(params = null) {
        this.prop = "prop";
        this.context = params;
    }

    async _createContext() {
        if (this.context !== null) {
            let helper = new Helpers();
            let userdata = await helper.getUserDataById(this.context.createUserId);
            this.context.fullname = userdata.firstname + " " + userdata.lastname;
            return this.context;
        }
    }

    async getContext() {
        let rndTime = (Math.random() * Math.floor(1000)).toFixed(0);
        rndTime = 0; // <--------- comment it if we need to test a rnd server loadtime!
        console.log(rndTime);
        let self = this;
        return new Promise(async function (resolve, reject) {
            setTimeout(async function () {
                let ctx = await self._createContext();
                resolve(ctx);
            }, rndTime);
        });
    }
}
