import { UIElement } from "./uielement.js";

export class FlyOut extends UIElement {
    constructor(options) {
        options.template = "flyout.handlebars";
        super(options);
    }
}
