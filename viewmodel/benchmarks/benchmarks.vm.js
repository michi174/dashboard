import ViewModel from "../../js/viewmodel/viewmodel.js";
import Helpers from "../../js/helpers.js";

export default class Benchmarks extends ViewModel {
    constructor(params) {
        super(params);
        this.app.setTitle("Benchmarks");
    }

    async default() {
        let helper = new Helpers();
        let ctx = await helper.getJson("http://blogapi.localhost:8080/v1/cms/entry/entrylist/");
        this.view.setDataContext({ entries: ctx });
        console.log("[Benchmarks VM] yes, we loaded the default action");
    }

    async detail() {}

    async onLoad() {}
}

export { Benchmarks };
