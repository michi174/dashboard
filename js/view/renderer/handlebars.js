import BaseRenderer from "./baserenderer.js";

export default class HandleBars extends BaseRenderer {
    constructor() {
        super();
    }

    render(template, context = {}) {
        return template;
    }
}
