import UIFactory from "./uifactory.js";
import Template from "../template.js";

export default class UIManager {
    constructor() {
        const instance = this.constructor.instance;

        if (instance) {
            return instance;
        }

        this.elements = new Array();

        this.constructor.instance = this;
    }

    add(element) {
        let index = this.find(element.id);
        if (index < 0) {
            this.elements.push(element);
        } else {
            this.elements[index] = element;
        }
    }

    remove(uid) {
        let index = this.find(uid);
        let element;

        if (index >= 0) {
            element = this.elements[index];
            let jQElement = $("#" + element.id);

            if (element.caller) {
                element.caller.removeAttr("ms-uielement-id");
                element.caller.removeAttr("ms-uielement-is-open");
            }

            console.log("[UIManager] removing element");

            Template.remove(Template.getGuid(jQElement));
            element.remove();
            this.elements.splice(index, 1);
        }
    }

    find(uid) {
        if (this.elements.length > 0) {
            let index = this.elements.findIndex(element => element.id === uid);
            return index;
        } else {
            return -1;
        }
    }

    getUniqueID() {
        let uid = "ms-uie-" + this._generateRandom();

        //TODO: FIX this includes(uid)
        if (this.elements.includes(uid)) {
            this.getUniqueID();
        } else {
            return uid;
        }
    }

    _generateRandom() {
        return (Math.random() * Math.floor(1000000000000000000000)).toFixed(0).toString(16);
    }
}

(function call() {
    $("body").on("click", "[ms-uielement]", function () {
        if ($(this).attr("ms-uielement-is-open") !== "true") {
            console.log(
                "[UIMANAGER] click on UIElement: " +
                    $(this).attr("ms-uielement-type") +
                    " " +
                    $(this).attr("ms-uielement-tpl")
            );

            let options = {
                template: $(this).attr("ms-uielement-tpl") || "",
                caller: $(this) || null,
                type: $(this).attr("ms-uielement-type") || "",
                content: $(this).attr("ms-uielement-content") || "",
                trigger: $(this).attr("ms-uielement-trigger") || "",
                sticky: $(this).attr("ms-uielement-sticky") || "",
                openPositionRelativeToCaller: $(this).attr("ms-uielement-position") || "",
                openDirection: $(this).attr("ms-uielement-open-direction") || "",
                animation: $(this).attr("ms-uielement-animation") || "",
                align: $(this).attr("ms-ui-element-align") || "",
                keepInViewPortX: $(this).attr("ms-uielement-keepinviewport-x") || false,
                keepInViewPortY: $(this).attr("ms-uielement-keepinviewport-y") || false,
                ownXPosition: $(this).attr("ms-uielement-own-x-pos") || "",
                openIndicator: $(this).attr("ms-uielement-open-indicator") || false
            };

            new UIFactory(options);
        } else {
            let uid = $(this).attr("ms-uielement-id");
            new UIManager().remove(uid);
        }
    });
})();
