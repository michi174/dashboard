import ViewModel from "../../js/viewmodel/viewmodel.js";

export default class Homepage extends ViewModel {
    constructor(params) {
        super(params);
    }

    default() {
        this.view.setDataContext({});
        console.log("[Homepage VM] yes, we loaded the default action");
    }

    async onLoad() {
        this.app.setTitle(this.app.appName);
        return true;
    }
}

export { Homepage };
