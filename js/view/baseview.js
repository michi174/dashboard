import HandleBars from "./renderer/handlebars.js";
import BaseRenderer from "./renderer/baserenderer.js";

export default class BaseView {
    static get DEFAULT_RENDERER() {
        return new HandleBars();
    }
    constructor() {
        if (new.target === BaseView) {
            throw new Error("Can't create instance of an abstract class");
        }
        console.log("[BaseView] new view was created.");

        /**
         * The renderer which renders our content.
         * @type BaseRenderer
         */
        this.renderer = null;

        /**
         * The actual data the renderer trys to replace in the template
         * @type object
         */
        this.context = {};

        /**
         * The content which has to be returned to the caller.
         * @type string
         */
        this.renderedContent = "";

        /**
         * The content that has to be rendered.
         * @type string
         */
        this.content = "";

        /**
         * Optional template filename
         * @type string
         */
        this.templateFile;

        /**
         * Optional path to the template
         * Required if the temaplateFile is given
         * @type string
         */
        this.templatePath;

        /**
         * Optional content of the template file. This will be loaded automatically if there is a template file
         * @type string
         */
        this.templateContent;

        /**
         * Target in the DOM Tree where the Content needs to be added
         */
        this.DOMTarget = null;
    }

    render() {
        if (!this.renderer instanceof BaseRenderer) {
            this.renderer = BaseView.DEFAULT_RENDERER;
        }

        this.renderedContent = this.renderer.render();
    }

    getContent() {
        return this.renderedContent;
    }

    getRawConent() {
        return this.content;
    }

    setRenderer(renderer) {
        if (renderer instanceof BaseRenderer) {
            this.renderer = renderer;
        }
    }
}
