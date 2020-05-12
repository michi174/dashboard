import { UIElement } from "./uielement.js";

export class Tooltip extends UIElement {
    constructor(options) {
        options.template = "tooltip.handlebars";
        super(options);
    }
}
