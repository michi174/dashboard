import ViewModel from "../../js/viewmodel/viewmodel.js";
import Helpers from "../../js/helpers.js";
import App from "../../js/app.js";
import bbCodeParser from "../../libs/parser.js";

export default class Benchmark extends ViewModel {
    constructor(params) {
        super(params);
        this.id = this.params.__param[0];
    }

    async default() {
        let helper = new Helpers();
        let ctx = {};
        if (this.id !== ("" || "undefined" || null)) {
            console.log("[Benchmark VM] loading context for id " + this.id);
            try {
                ctx = await helper.getJson(this.app.apiHost + "v1/cms/entry/" + this.id);
                let userdata = await helper.getUserDataById(ctx.createUserId);
                ctx.fullname = userdata.firstname + " " + userdata.lastname;
                ctx.content = bbCodeParser.parse(ctx.content);
            } catch (e) {
                //this.app.navigation.router.navigate("404");
                console.error(e);
                console.log(ctx);
            }
        }

        this.view.setDataContext(ctx);
    }

    async onLoad() {
        this.app.setTitle("Benchmark");
    }
}

export { Benchmark };
