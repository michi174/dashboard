import ViewModel from "../../js/viewmodel/viewmodel.js";

export default class Homepage extends ViewModel {
    constructor(params) {
        super(params);
        this.app.setTitle(this.app.appName);
    }

    default() {
        this.view.setDataContext({});
        console.log("[Homepage VM] yes, we loaded the default action");

        //this.ready();
    }
}

export { Homepage };
