import BaseRenderer from "./baserenderer.js";
import { Template } from "../../template.js";

export default class HandleBars extends BaseRenderer {
    constructor() {
        super();
        this.tpl = null;
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
                html: template
            },
            true
        );

        renderedContent = await contentObject._render();

        this.tpl = contentObject;

        return renderedContent;
    }

    async rendering(timeout = 3000) {
        return new Promise((resolve, reject) => {
            let timer = 0;
            let interval = 10;

            if (this.tpl === null) {
                let int = setInterval(() => {
                    if (this.tpl === null) {
                        timer = timer + interval;
                        if (timer >= timeout) {
                            clearInterval(int);
                            console.error("[HB RENDERER] REJECTING! Not finished after time: " + timer);
                            reject("[HB Renderer] rendering is too slow!");
                        }
                    } else {
                        clearInterval(int);
                        console.log("[HB RENDERER] rendering finished after: " + timer + "ms");
                        resolve();
                    }
                }, interval);
            } else {
                console.log("[HB RENDERER]");
                resolve();
            }
        });
    }

    async isReady(timeout = 3000) {
        await this.rendering(timeout);
        return this.tpl.isReady(timeout);
    }
}
