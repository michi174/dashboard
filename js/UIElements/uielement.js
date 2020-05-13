import { Template } from "../template.js";
import UIManager from "./uimanager.js";
import detectElementOverflow from "../../libs/elementOverflow.js";
class UIElement {
    constructor(options) {
        this.id = "";
        this.data = {};
        this.content = "";
        this.template = "";
        this.element = "";
        this.referer = "";
        this.position = null;
        this.moveToCaller = true;
        this.caller = null;
        this.openDirection = "leftToRight"; //ltr, rtl, ttb, btt
        this.openPositionRelativeToCaller = "bottom"; //top, bottom, right, left
        this.resizeObserver = null;
        this.target = "body";

        const openDirections = {
            leftToRight: {
                allowDirection: "x",
            },
            rightToLeft: {
                allowDirection: "x",
            },
            topToBottom: {
                allowDirection: "y",
            },
            BottomToTop: {
                allowDirection: "y",
            },
        };

        if (typeof options === "object") {
            for (let [prop, value] of Object.entries(options)) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = value;
                }
            }
        }

        this.id = new UIManager().getUniqueID();

        if (this.id !== "") {
            this.createElement();
        } else {
            console.warn("[UIElement] No ID for UIElement. Can't create it.");
        }

        this.data.id = this.id;
    }

    /**
     * Creates a new UIElement and places it into the DOM Tree.
     */
    async createElement() {
        try {
            let element = await this.create();

            if (this.moveToCaller) {
                this._move(this._calculatePosition());

                //Recalculate the position if the element changes its size.
                this.resizeObserver = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        const cr = entry.contentRect;
                        const jQElement = $(entry.target);

                        this._move(this._calculatePosition());
                    }
                });

                this.resizeObserver.observe(element[0]);
            }
            element.addClass("isOpen");

            element.addClass(this.openDirection);

            this.caller.attr("ms-uielement-id", this.id);
            this.caller.attr("ms-uielement-is-open", "true");

            new UIManager().add(this);
        } catch (e) {
            console.warn(e);
        }
    }

    /**
     * Creates a new DOM Element into the DOM Tree.
     */
    async create() {
        let method = "append";

        //should we create the UI Element after the caller instead of appending it to the body?
        //it would be a big benefit if the user is scrolling. the UIElement would stick to the callers position.

        // if (typeof this.caller === "object" && this.caller !== null) {

        //     if(this.moveToCaller){
        //         this.target = this.caller[0];
        //         method = "after";
        //     }

        // }

        //If activate the above code, we need to change the method of the template to "after" instead of "append".

        new Template({
            path: "view/UIElements",
            file: this.template,
            data: this.data,
            target: this.target,
            method: method,
        });

        let self = this;

        return new Promise(function (resolve, reject) {
            let interval;
            let timer = 0;

            interval = setInterval(function () {
                timer += 10;
                if ($("body").find("#" + self.id).length > 0) {
                    clearInterval(interval);
                    resolve($("#" + self.id));
                } else {
                    if (timer > 5000) {
                        clearInterval(interval);
                        reject(
                            "can't create the DOM Element (ID: " + self.id + ")"
                        );
                    }
                }
            }, 10);
        });
    }

    /**
     * Removes the given Element from the DOM Tree
     *
     */
    remove() {
        if (this.resizeObserver !== null) {
            this.resizeObserver = null;
        }
        $($("#" + this.id)).remove();
    }

    static getPrefix() {
        return this.prefix;
    }

    /**
     * Calculates the Endposition of the UIElement
     *
     * It only works if the UIHandler is given in the @var position object
     * and the childclass hansn't @var moveToCaller set to false.
     *
     * @return The absolute position of the new Element.
     */
    _calculatePosition() {
        let position, width, height;
        let startTop, startLeft;
        let UIElementNewPosition = new Object();

        self = this;

        if (this.moveToCaller) {
            if (typeof this.caller === "object" && this.caller !== null) {
                let caller = this.caller;

                position = caller.offset();
                width = caller.outerWidth(false);
                height = caller.outerHeight(false);

                switch (this.openPositionRelativeToCaller) {
                    case "right":
                        UIElementNewPosition.left = position.left + width;
                        UIElementNewPosition.top = position.top;
                        break;
                    case "left":
                        UIElementNewPosition.left = position.left;
                        UIElementNewPosition.top = position.top;
                        break;
                    case "top":
                        UIElementNewPosition.left = position.left;
                        UIElementNewPosition.top = position.top;
                        break;
                    case "bottom":
                        UIElementNewPosition.left = position.left;
                        UIElementNewPosition.top = position.top + height;
                        break;
                    default:
                        UIElementNewPosition.left = position.left;
                        UIElementNewPosition.top = position.top;
                }

                return UIElementNewPosition;
            } else {
                console.log("[UIElement] No Caller received!");
            }
        } else {
            //console.log("[UIElement] No movement required")
        }
    }

    /**
     * Moves an UIElement to the given Position.
     *
     * Make sure the UIElement is already part of the DOM Tree.
     *
     * @param {UIElement.position} position
     */
    _move(position) {
        if (this.moveToCaller) {
            if (typeof this.caller === "object" && this.caller !== null) {
                let UIElement = $("#" + this.id);

                let clientHeight = document.documentElement.clientHeight;
                let clientWidth = document.documentElement.clientWidth;
                let clientMiddle = clientWidth / 2;

                let elemHeight = UIElement.outerHeight();
                let elemWidth = UIElement.outerWidth();

                let originElemTop = position.top;
                let originElemLeft = position.left;

                let newElemTop = originElemTop;
                let newElemLeft = originElemLeft;

                let callerHeight = this.caller.outerHeight();
                let callerWidth = this.caller.outerWidth();
                let callerTop = this.caller.offset().top;
                let callerLeft = this.caller.offset().left;
                let callerStartY = callerTop;
                let callerEndY = callerTop + callerHeight;
                let callerStartX = callerLeft;
                let callerEndX = callerLeft + callerWidth;
                let callerMiddle = callerStartX + callerWidth / 2;

                let elementStartY = newElemTop;
                let elementEndY = newElemTop + elemHeight;
                let elementStartX = newElemLeft;
                let elementEndX = newElemLeft + elemWidth;

                let lr = "left";
                let tb = "top";

                if (elemHeight + originElemTop > clientHeight) {
                    newElemTop =
                        originElemTop -
                        (elemHeight + originElemTop - clientHeight);
                    console.log(
                        `[UIElement][Position] New TOP-Position: ${newElemTop}px`
                    );
                    if (this.openPositionRelativeToCaller === "top") {
                        newElemTop = originElemTop - elemHeight;
                        console.log(
                            `[UIElement][Position] New TOP-Position: ${newElemTop}px`
                        );
                    } else {
                    }
                    console.log("[UIElement][Position] Element is too high!");
                }

                if (elemWidth + originElemLeft + 1 > clientWidth) {
                    console.log("[UIElement][Position] Element is too wide!");

                    //lets get the caller position
                    if (callerMiddle >= clientMiddle) {
                        lr = "right";
                        newElemLeft = clientWidth - callerEndX;
                    } else {
                        // lr = "left";
                        // newElemLeft = callerStartX;
                    }

                    //center the element if the caller is in the middle of the client
                    if (clientMiddle - callerMiddle < callerWidth) {
                        lr = "left";

                        newElemLeft = clientMiddle - elemWidth / 2;
                    }
                } else {
                }

                //Do we hit the clients viewport dimensions?

                //Do we hit the caller? That would be bad.

                elementStartY = newElemTop;
                elementEndY = newElemTop + elemHeight;
                elementStartX = newElemLeft;
                elementEndX = newElemLeft + elemWidth;

                console.log(`[UIElement][Position] Moving UIElement`);
                // console.log(
                //     `[UIElement][Position] clientHeight: ${clientHeight}px`
                // );
                // console.log(
                //     `[UIElement][Position] elemHeight: ${elemHeight}px`
                // );
                // console.log(
                //     `[UIElement][Position] originElemTop: ${originElemTop}px`
                // );
                // console.log(
                //     `[UIElement][Position] New TOP-Position: ${newElemTop}px`
                // );
                // console.log(`-----------------------X------------------------`);
                // console.log(
                //     `[UIElement][Position] clientWidth: ${clientWidth}px`
                // );
                // console.log(`[UIElement][Position] elemWidth: ${elemWidth}px`);
                // console.log(
                //     `[UIElement][Position] originElemLeft: ${originElemLeft}px`
                // );
                // console.log(
                //     `[UIElement][Position] New LEFT-Position: ${newElemLeft}px`
                // );

                //UIElement.css({top: newElemTop+"px", left: newElemLeft+"px"});
                UIElement.css(tb, newElemTop + "px");
                UIElement.css(lr, newElemLeft + "px");
            }
        }
    }
}

export { UIElement };
