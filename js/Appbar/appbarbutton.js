import {Template} from "../template.js";

export default class AppBarButton {
    constructor(id, template, options = { icon: "", position: "right", order: 0, cssClas: "" }) {
        this.id = id;
        this.button = $(template);
        this.icon = "";
        this.position = "right";
        this.order = 0;
        this.cssClass = "";

        if ("icon" in options) {
            this.icon = options.icon;
        }

        if ("position" in options) {
            this.position = options.position;
        }

        if ("order" in options) {
            this.order = options.order;
        }

        if ("cssClass" in options) {
            this.cssClass = options.cssClass;
        }

        return this;
    }

    async render() {
        let compiledButton = null;

        let temp = new Template({
            "path": "view",
            "file": "appbarbutton.handlebars",
            "data": {
                "id": this.id,
                "class": this.cssClass,
                "icon": this.icon
                },
            "target": "body",
            "method": "return"
            }, false);

            compiledButton = temp;

        return compiledButton;
    }
}