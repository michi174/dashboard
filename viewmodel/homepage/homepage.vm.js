import ViewModel from "../viewmodel.js";

export default class Homepage extends ViewModel {
    constructor() {
        super();
    }

    default() {
        this.createView();
        console.log("[Homepage VM] yes, we loaded the default action");
    }
}

export { Homepage };
