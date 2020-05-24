import BaseView from "../js/view/baseview.js";
import HTML from "../js/view/html.js";

export default class ViewModel {
    constructor() {
        if (new.target === ViewModel) {
            throw new Error("Can't create instance of an abstract class");
        }

        console.log("[ViewModel] new ViewModel was created");

        this.view = "viewObject";
    }

    /**
     * The default action is called if no action was found in the URL.
     */
    default() {
        throw new Error("Can't call an abstract method. Overriding is required.");
    }

    /**
     * Creates a view for the ViewModel.
     */
    createView() {
        this.view = new HTML();
    }

    /**
     * Sets an already exisiting view object.
     * @param {BaseView} view
     */
    setView(view) {
        if (view instanceof BaseView) {
            this.view = view;
        }
    }
}
