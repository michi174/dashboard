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
        this.openDirection = "right"; //up, right, down, left
        this.openPositionRelativeToCaller = "topRight";
        this.resizeObserver = null;
        this.target = "body";
        this.animation = "";
        this.align = "left";

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
                this._move(this._calcStartPoint());

                //Recalculate the position if the element changes its size.
                this.resizeObserver = new ResizeObserver((entries) => {
                    for (let entry of entries) {
                        const cr = entry.contentRect;
                        const jQElement = $(entry.target);

                        this._move(this._calcStartPoint());
                    }
                });

                this.resizeObserver.observe(element[0]);
            }
            element.addClass("isOpen");
            element.addClass("ms-ui-element");
            element.addClass(this.animation);
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
    _calcStartPoint() {
        let position,
            callerWidth,
            callerHeight,
            callerStartX,
            callerStartY,
            callerMiddleX,
            callerMiddleY,
            callerEndX,
            callerEndY,
            clientHeight,
            clientWidth;

        let UIElementNewPosition = new Object();

        self = this;

        if (this.moveToCaller) {
            if (typeof this.caller === "object" && this.caller !== null) {
                let UIElement = $("#" + this.id);
                let caller = this.caller;

                position = caller.offset();

                callerWidth = caller.outerWidth(false);
                callerHeight = caller.outerHeight(false);

                callerStartX = position.left;
                callerStartY = position.top;

                callerEndX = callerStartX + callerWidth;
                callerEndY = callerStartY + callerHeight;

                callerMiddleX = callerStartX + callerWidth / 2;
                callerMiddleY = callerStartY + callerHeight;

                clientHeight = document.documentElement.clientHeight;
                clientWidth = document.documentElement.clientWidth;

                let callerVpPos = caller[0].getBoundingClientRect();

                let elemHeight = UIElement.outerHeight();
                let elemWidth = UIElement.outerWidth();

                let leftDistance = 0;
                let rightDistance = 0;
                let topDistance = 0;
                let botDistance = 0;

                switch (this.openPositionRelativeToCaller) {
                    case "topLeft":
                        UIElementNewPosition.X = callerStartX;
                        UIElementNewPosition.Y = callerStartY;
                        break;
                    case "topCenter":
                        UIElementNewPosition.X = callerMiddleX;
                        UIElementNewPosition.Y = callerStartY;
                        console.log(callerStartY);
                        break;
                    case "topRight":
                        UIElementNewPosition.X = callerEndX;
                        UIElementNewPosition.Y = callerStartY;
                        console.log(callerStartY);
                        break;
                    case "top":
                        UIElementNewPosition.Y = callerStartY;

                        leftDistance = callerVpPos.left;
                        rightDistance =
                            clientWidth - (callerVpPos.left + callerWidth);

                        if (leftDistance > rightDistance) {
                            UIElementNewPosition.X = callerEndX;
                            this.caller.attr(
                                "ms-uielement-position",
                                "topRight"
                            );
                            this.openPositionRelativeToCaller = "topRight";
                        } else {
                            UIElementNewPosition.X = callerStartX;
                            this.caller.attr(
                                "ms-uielement-position",
                                "topLeft"
                            );
                            this.openPositionRelativeToCaller = "topLeft";
                        }
                        break;

                    case "rightTop":
                        UIElementNewPosition.X = callerEndX;
                        UIElementNewPosition.Y = callerStartY;
                        break;
                    case "rightCenter":
                        UIElementNewPosition.X = callerEndX;
                        UIElementNewPosition.Y = callerMiddleY;
                        break;
                    case "rightBot":
                        UIElementNewPosition.X = callerEndX;
                        UIElementNewPosition.Y = callerEndY;
                        break;
                    case "right":
                        UIElementNewPosition.X = callerEndX;

                        topDistance = callerVpPos.top;
                        botDistance =
                            clientHeight - (callerVpPos.top + callerHeight);

                        if (
                            topDistance > botDistance ||
                            elemHeight < botDistance
                        ) {
                            UIElementNewPosition.Y = callerStartY;
                        } else {
                            UIElementNewPosition.Y = callerEndY;
                        }
                        break;

                    case "botLeft":
                        UIElementNewPosition.X = callerStartX;
                        UIElementNewPosition.Y = callerEndY;
                        break;
                    case "botCenter":
                        UIElementNewPosition.X = callerMiddleX;
                        UIElementNewPosition.Y = callerEndY;
                        break;
                    case "botRight":
                        UIElementNewPosition.X = callerEndX;
                        UIElementNewPosition.Y = callerEndY;
                        break;
                    case "bot":
                        UIElementNewPosition.Y = callerEndY;

                        leftDistance = callerVpPos.left;
                        rightDistance =
                            clientWidth - (callerVpPos.left + callerWidth);

                        if (leftDistance > rightDistance) {
                            UIElementNewPosition.X = callerEndX;
                            this.caller.attr(
                                "ms-uielement-position",
                                "botRight"
                            );
                            this.openPositionRelativeToCaller = "botRight";
                        } else {
                            UIElementNewPosition.X = callerStartX;
                            this.caller.attr(
                                "ms-uielement-position",
                                "botLeft"
                            );
                            this.openPositionRelativeToCaller = "botLeft";
                        }
                        break;

                    case "leftTop":
                        UIElementNewPosition.X = callerStartX;
                        UIElementNewPosition.Y = callerStartY;
                        break;
                    case "leftCenter":
                        UIElementNewPosition.X = callerStartX;
                        UIElementNewPosition.Y = callerMiddleY;
                        break;
                    case "leftBot":
                        UIElementNewPosition.X = callerStartX;
                        UIElementNewPosition.Y = callerEndY;
                        break;
                    case "left":
                        UIElementNewPosition.X = callerStartX;

                        topDistance = callerVpPos.top;
                        botDistance =
                            clientHeight - (callerVpPos.top + callerHeight);

                        if (topDistance > botDistance) {
                            UIElementNewPosition.Y = callerStartY;
                        } else {
                            UIElementNewPosition.Y = callerEndY;
                        }

                        break;

                    case "Y":
                        break;
                    case "X":
                        break;

                    default:
                        UIElementNewPosition.X = callerStartX;
                        UIElementNewPosition.Y = callerEndY;
                        break;
                }
            }
        }
        return UIElementNewPosition;
    }

    /**
     * Moves an UIElement to the given Position.
     *
     * Make sure the UIElement is already part of the DOM Tree.
     *
     * @param {UIElement.position} position
     */

    _move(position) {
        let UIElement = $("#" + this.id);

        let overflowOffset = 0;

        let startX = "left";
        let startY = "top";

        let clientHeight = document.documentElement.clientHeight;
        let clientWidth = document.documentElement.clientWidth;
        let clientMiddle = clientWidth / 2;

        let elemHeight = UIElement.outerHeight();
        let elemWidth = UIElement.outerWidth();

        let originElemX = position.X;
        let originElemY = position.Y;

        let callerHeight = this.caller.outerHeight();
        let callerWidth = this.caller.outerWidth();
        let callerStartY = this.caller.offset().top;
        let callerStartX = this.caller.offset().left;
        let callerEndY = callerStartY + callerHeight;
        let callerEndX = callerStartX + callerWidth;
        let callerMiddleX = callerStartX + callerWidth / 2;
        let callerMiddleY = callerStartY + callerHeight / 2;

        let newElemY = originElemY;
        let newElemX = originElemX;

        let elementStartY = newElemY;
        let elementEndY = newElemY + elemHeight;
        let elementStartX = newElemX;
        let elementEndX = newElemX + elemWidth;

        let leftDistance = 0;
        let rightDistance = 0;
        let align = "left";
        let calcCallerHeight = 0;

        console.log(position);

        switch (this.openDirection) {
            case "up":
                console.log("Opening up");
                if (elementEndX > clientWidth) {
                    getNewElemPosX(this);
                }
                break;
            case "right":
                console.log("Opening right");

                getNewElemPosY(this);
                break;
            case "left":
                console.log("Opening left");
                newElemX = clientWidth - callerEndX;
                startX = "right";

                getNewElemPosY(this);

                break;
            case "down":
                console.log("Opening down");
                if (elementEndX > clientWidth) {
                    getNewElemPosX(this);
                }

                break;
            case "x":
                console.log("Opening x");
                if (elementEndX > clientWidth) {
                    newElemX = overflowOffset;
                    startX = "right";
                } else {
                    if (elementStartX < 0) {
                        newElemX = overflowOffset;
                        startX = "left";
                    }
                }

                if (elementEndY > clientHeight) {
                    newElemY = overflowOffset;
                    startY = "bottom";
                }

                break;
            case "y":
                console.log("Opening y");
                console.log(position.X);
                getNewElemPosY(this);
                console.log(newElemX);
                getNewElemPosX(this);
                console.log(newElemX);

                break;
            default:
                break;
        }

        function getNewElemPosY(self) {
            if (elementEndY + callerHeight > clientHeight) {
                if (self.openPositionRelativeToCaller.search(/bot/i) > -1) {
                    calcCallerHeight = callerHeight;
                } else if (
                    self.openPositionRelativeToCaller.search(/top/i) > -1
                ) {
                    calcCallerHeight = 0;
                }

                newElemY = clientHeight - originElemY + calcCallerHeight;
                startY = "bottom";
            } else {
                console.log(
                    `Element (${elemHeight}) + ${elementStartY} = ${elementEndY} is not higher than our viewport ${clientHeight}`
                );
                if (self.openPositionRelativeToCaller.search(/top/i) > -1) {
                    calcCallerHeight = callerHeight;
                } else if (
                    self.openPositionRelativeToCaller.search(/bot/i) > -1
                ) {
                    calcCallerHeight = 0;
                }

                newElemY = newElemY + calcCallerHeight;
            }
        }

        function getNewElemPosX(self) {
            if (self.openPositionRelativeToCaller.search(/left/i) > -1) {
                align = "left";
            } else if (
                self.openPositionRelativeToCaller.search(/Right/i) > -1
            ) {
                align = "right";
            } else if (
                self.openPositionRelativeToCaller.search(/center/i) > -1
            ) {
                align = "center";
            }

            switch (align) {
                case "left":
                    leftDistance = callerStartX;
                    rightDistance = clientWidth - callerStartX;

                    if (leftDistance > rightDistance) {
                        newElemX = clientWidth - callerStartX;
                        startX = "right";
                    } else {
                        newElemX = callerStartX;
                        startX = "left";
                    }

                    break;
                case "center":
                    leftDistance = callerMiddleX;
                    rightDistance = clientWidth - callerMiddleX;

                    if (leftDistance > rightDistance) {
                        newElemX = clientWidth - callerMiddleX;
                        startX = "right";
                    } else {
                        newElemX = callerMiddleX;
                        startX = "left";
                    }

                    break;
                case "right":
                    leftDistance = callerEndX;
                    rightDistance = clientWidth - callerEndX;

                    if (leftDistance > rightDistance) {
                        newElemX = clientWidth - callerStartX - callerWidth;
                        startX = "right";
                    } else {
                        newElemX = callerStartX;
                        startX = "left";
                    }
                    break;
            }
        }

        if (startX === "left") {
            UIElement.css("right", "auto");
        } else {
            UIElement.css("left", "auto");
        }

        if (startY === "top") {
            UIElement.css("bottom", "auto");
        } else {
            UIElement.css("top", "auto");
        }

        UIElement.css(startY, newElemY + "px");
        UIElement.css(startX, newElemX + "px");
    }
}

export { UIElement };
