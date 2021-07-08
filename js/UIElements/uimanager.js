import UIFactory from "./uifactory.js";
import Template from "../template.js";
import Tools from "../tools.js";

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
        return Tools.GUID();
        //return (Math.random() * Math.floor(1000000000000000000000)).toFixed(0).toString(16);
    }
}

(function call() {
    let leaveTimeOut = 300;

    $("body").on("mouseenter", "[ms-uielement]", function () {
        console.log("[UIMANAGER] hovering a trigger");
        if ($(this).attr("ms-uielement-trigger") === "hover") {
            console.log("[UIMANAGER] hover handler triggered");
            if ($(this).attr("ms-uielement-is-open") !== "true") {
                createUIElement(this);
            }
        }
    });

    $("body").on("mouseleave", "[ms-uielement]", function () {
        console.log("[UIMANAGER] leaving a trigger");
        if ($(this).attr("ms-uielement-trigger") === "hover") {
            console.log("[UIMANAGER] hover handler triggered");
            if ($(this).attr("ms-uielement-is-open") == "true") {
                createUIElement(this);
            }
        }
    });

    $("body").on("click", "[ms-uielement]", function () {
        if ($(this).attr("ms-uielement-trigger") === "click") {
            console.log("[UIMANAGER] click handler triggered");
            createUIElement(this);
        }
    });

    function createUIElement(element) {
        if ($(element).attr("ms-uielement-is-open") !== "true") {
            console.log(
                "[UIMANAGER] click on UIElement: " +
                    $(element).attr("ms-uielement-type") +
                    " " +
                    $(element).attr("ms-uielement-tpl")
            );

            let options = {
                template: $(element).attr("ms-uielement-tpl") || "",
                caller: $(element) || null,
                type: $(element).attr("ms-uielement-type") || "",
                content: $(element).attr("ms-uielement-content") || "",
                trigger: $(element).attr("ms-uielement-trigger") || "",
                sticky: $(element).attr("ms-uielement-sticky") || "",
                openPositionRelativeToCaller: $(element).attr("ms-uielement-position") || "",
                openDirection: $(element).attr("ms-uielement-open-direction") || "",
                animation: $(element).attr("ms-uielement-animation") || "",
                align: $(element).attr("ms-ui-element-align") || "",
                keepInViewPortX: $(element).attr("ms-uielement-keepinviewport-x") || false,
                keepInViewPortY: $(element).attr("ms-uielement-keepinviewport-y") || false,
                ownXPosition: $(element).attr("ms-uielement-own-x-pos") || "",
                openIndicator: $(element).attr("ms-uielement-open-indicator") || false,
                autoClose: $(element).attr("ms-uielement-autoclose") || false
            };
            new UIFactory(options);
        } else {
            let uid = $(element).attr("ms-uielement-id");

            let uimngr = new UIManager();

            if ($(element).attr("ms-uielement-trigger") === "hover") {
                let hoveredElem = $(uimngr.elements[uimngr.find(uid)].element);
                let isHovered = false;

                hoveredElem = $(".ms-ui-element");

                hoveredElem.hover(
                    function () {
                        console.log("[UIMANAGER] hovering an UIElement");
                        isHovered = true;
                    },
                    function () {
                        console.log("[UIMANAGER] leaving an UIElement");

                        let triggerHover = $("[ms-uielement-id='" + uid + "']:hover").length > 0;

                        if (triggerHover) {
                            console.log("[UIMANAGER] hovering trigger again");
                            isHovered = true;
                        } else {
                            console.log("[UIMANAGER] trigger not hovered after leaving element");
                            isHovered = false;
                        }

                        setTimeout(() => {
                            isHovered;
                            if (!isHovered) {
                                console.log("[UIMANAGER] destroying element after leaving the element");
                                new UIManager().remove(uid);
                            }
                        }, leaveTimeOut);
                    }
                );

                setTimeout(() => {
                    if (!isHovered) {
                        new UIManager().remove(uid);
                        console.log("[UIMANAGER] destroying element after leaving the trigger");
                    }
                }, leaveTimeOut);
            }

            if ($(element).attr("ms-uielement-trigger") === "click") {
                new UIManager().remove(uid);
            }

            //
        }
    }
})();
