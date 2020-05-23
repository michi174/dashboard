import HTML from "./renderer/html";

export default class BaseView {
    constructor() {
        const DEFAULT_RENDERER = "html";

        if (new.target === BaseView) {
            throw new Error("Can't create instance of an abstract class");
        }
    }

    getViewContent() {
        throw new Error("Can't call an abstract method. Overriding is required.");
    }
}
