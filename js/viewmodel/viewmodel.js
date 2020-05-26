import BaseView from "../view/baseview.js";
import HTML from "../view/html.js";

export default class ViewModel {
    static get DEFAULT_VIEW_PATH() {
        return "view";
    }

    constructor(params = {}) {
        if (new.target === ViewModel) {
            throw new Error("Can't create instance of an abstract class");
        }

        console.log("[ViewModel] new ViewModel was created");

        this.view = null;
        this.viewModel = this.constructor.name.toLowerCase();
        this.params = params;
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
        this.view.setTemplateFile(this.viewModel);
        this.view.setTemplatePath(`${BaseView.DEFAULT_VIEW_PATH}/${this.viewModel}`);
        return this.view;
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

    /**
     * Starts the rendering process of our view and places its content into the target.
     */
    async ready() {
        console.log("[ViewModel] We're ready to send our content");
        if (this.view !== null && this.view instanceof BaseView) {
            await this.view.render();
        } else {
            throw new Error(
                `need to initialize a view before "ready()" is called. Call createView() to use a default HTML based view.`
            );
        }
    }
}
