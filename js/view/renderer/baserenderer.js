export default class BaseRenderer {
    constructor() {
        if (new.target === BaseRenderer) {
            throw new Error("Can't create instance of an abstract class");
        }

        console.log("[BaseRenderer] created a new renderer.");
    }

    get fileExtension() {
        throw new Error("Can't get an abstract property. Overriding is required in renderer: " + this.constructor.name);
    }
    set fileExtension(value) {
        throw new Error("Can't set a value of an abstract property. Overriding is required.");
    }

    async render(template, context = {}) {
        throw new Error("Can't call an abstract method. Overriding is required.");
    }

    async isReady(timeout = 3000) {
        throw new Error("Can't call an abstract method. Overriding is required.");
    }
}
