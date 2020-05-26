import BaseRenderer from "./baserenderer.js";
import { Template } from "../../template.js";

export default class HandleBars extends BaseRenderer {
    constructor() {
        super();
    }

    get fileExtension() {
        return ".handlebars";
    }

    set fileExtension(value) {
        throw new Error("fileextionsion can't be overwritten!");
    }

    async render(template = "", context = {}) {
        let renderedContent;
        let contentObject = new Template(
            {
                method: "return",
                data: context,
                html: template,
            },
            true
        );

        renderedContent = await contentObject._render();

        return renderedContent;
    }
}
