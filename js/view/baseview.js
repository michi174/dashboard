import HandleBars from "./renderer/handlebars.js";
import BaseRenderer from "./renderer/baserenderer.js";
import { Template } from "../template.js";

export default class BaseView {
    static get DEFAULT_RENDERER() {
        return new HandleBars();
    }

    static get DEFAULT_VIEW_PATH() {
        return "view";
    }

    static get DEFAULT_DOM_TARGET() {
        return $(".main-view.active");
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
        this.templatePath = BaseView.DEFAULT_VIEW_PATH;

        /**
         * Optional content of the template file. This will be loaded automatically if there is a template file
         * @type string
         */
        this.templateContent;

        /**
         * Target in the DOM Tree where the Content needs to be added
         */
        this.DOMTarget = BaseView.DEFAULT_DOM_TARGET;

        /**
         * Status of the view.
         */
        this.isRendered = false;
    }

    /**
     * Tells the renderer to start the rendering process
     */
    async render(insert = true) {
        if (!this.renderer instanceof BaseRenderer) {
            this.renderer = BaseView.DEFAULT_RENDERER;
            console.warn("[BaseView] set the renderer to default because we didn't get it from you");
        }

        try {
            await this.loadFile();
        } catch (e) {
            console.warn(e);
        } finally {
            this.renderedContent = await this.renderer.render(this.content, this.context);
            this.isRendered = true;
            if (insert) {
                this.insert();
            }
        }
    }

    /**
     * returns the rendered content.
     */
    getContent() {
        return this.renderedContent;
    }

    /**
     * returns the raw content (unrendered)
     */
    getRawConent() {
        return this.content;
    }

    /**
     * Sets the renderer which will be used to render the raw content.
     * @param {BaseRenderer} renderer
     */
    setRenderer(renderer) {
        if (renderer instanceof BaseRenderer) {
            this.renderer = renderer;
        } else {
            throw new Error("the renderer must extend the BaseRenderer class");
        }
    }

    /**
     * Sets the target DOM Element which the content needs to be rendered to.
     * @param {jQueryObject} $target
     */
    setRenderTarget($target) {
        this.DOMTarget = $target;
    }

    /**
     * Sets the datacontext for the view to render
     *
     * @param {object} context
     */
    setDataContext(context) {
        if (typeof context === "object") {
            this.context = context;
        } else {
            throw new Error("context must to be a valid object");
        }
    }

    insert() {
        console.log("[BaseView] inserting content to DOM");
        if (this.isRendered) {
            this.DOMTarget.html(this.renderedContent);
        } else {
            throw new Error("unrendered content can't be added to DOM. Call render() first");
        }
    }

    setTemplateFile(file) {
        this.templateFile = file;
    }

    setTemplatePath(path) {
        this.templatePath = path;
    }

    async loadFile() {
        let fullpath = "/" + this.templatePath + "/" + this.templateFile + this.renderer.fileExtension;

        try {
            let content = await Template.loadFile(this.templatePath, this.templateFile, this.renderer.fileExtension);

            if (content) {
                let $content = $(content);

                if ($content.length === 1) {
                    this.content += content;
                    return content;
                } else {
                    throw new Error(
                        `The received template is not valid. Check if the templatefile "${fullpath}" even exists`
                    );
                }
            } else {
                return "";
            }
        } catch (e) {
            console.warn(e);
        }
    }
}
