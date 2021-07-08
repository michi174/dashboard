import App from "../app.js";
import UIManager from "./uimanager.js";

export default class UIFactory {
    constructor(options) {
        this.type = null;
        this.template = null;
        this.content = null;
        this.context = null;
        this.trigger = null;
        this.sticky = null;
        this.caller = null;
        this.openDirection = null; //ltr, rtl, ttb, btt
        this.openPositionRelativeToCaller = null; //top, bottom, right, left
        this.animation = null;
        this.align = null;
        this.keepInViewPortY = false;
        this.keepInViewPortX = false;
        this.ownXPosition = "left";
        this.openIndicator = false;
        this.autoClose = false;

        this.options = options;

        if (typeof options === "object") {
            for (let [prop, value] of Object.entries(options)) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = value;
                }
            }

            this.build();
        }
    }

    async build() {
        let version = new App().getVersion();
        if (this.type !== null && (this.template !== null || this.content !== null)) {
            let mod = import("./elements/" + this.type.toLowerCase() + ".js?" + version);

            let state = "";
            let element = null;

            let self = this;

            mod.then(function (Component) {
                state = "success";
                if (Object.keys(Component).includes(self.type)) {
                    element = new Component[self.type]({
                        data: {
                            template: self.template,
                            content: self.content
                        },
                        caller: self.caller,
                        type: self.type,
                        content: self.content,
                        trigger: self.trigger,
                        sticky: self.sticky,
                        openPositionRelativeToCaller: self.openPositionRelativeToCaller,
                        openDirection: self.openDirection,
                        animation: self.animation,
                        align: self.align,
                        keepInViewPortY: self.keepInViewPortY,
                        keepInViewPortX: self.keepInViewPortX,
                        ownXPosition: self.ownXPosition,
                        openIndicator: self.openIndicator,
                        autoClose: self.autoClose
                    });
                } else {
                    console.log(
                        "[UIFactory] Class " + self.type + " not found. Check uielement-type, it's case sensitive"
                    );
                    console.log(Component);
                }
                console.log(Component);
            });

            mod.catch(function (err) {
                state = "error";
                console.error(err);
            });

            mod.finally(function () {
                console.log("[UIFactory] module loading finished with " + state);
            });
        }
    }
}

export {};
