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
        this.ignoreCallerPositionYOnCollide = true;
        this.ignoreCallerPositionXOnCollide = true;
        this.keepInViewPort = false;

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
                        break;
                    case "topRight":
                        UIElementNewPosition.X = callerEndX;
                        UIElementNewPosition.Y = callerStartY;
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
                            this.openPositionRelativeToCaller = "rightTop";
                        } else {
                            UIElementNewPosition.Y = callerEndY;
                            this.openPositionRelativeToCaller = "rightBot";
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
                            this.openPositionRelativeToCaller = "botRight";
                        } else {
                            UIElementNewPosition.X = callerStartX;
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
        let clientScrollTop = document.documentElement.scrollTop;
        let clientScrollLeft = document.documentElement.scrollLeft;

        let elemHeight = UIElement.outerHeight();
        let elemWidth = UIElement.outerWidth();

        let originElemX = position.X;
        let originElemY = position.Y;

        let callerHeight = this.caller.outerHeight();
        let callerWidth = this.caller.outerWidth();
        let callerStartY = position.Y;
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
        let callerOffsetX = 0;

        //console.log(position);

        switch (this.openDirection) {
            case "up":
                //console.log("Opening up");
                if (elementEndX > clientWidth) {
                    getNewElemPosX(this);
                }
                break;
            case "right":
                //console.log("Opening right");
                getNewElemPosY(this);
                break;
            case "left":
                //console.log("Opening left");
                newElemX = clientWidth - callerEndX;
                startX = "right";

                getNewElemPosY(this);

                break;
            case "down":
                //console.log("Opening down");
                if (elementEndX > clientWidth) {
                    getNewElemPosX(this);
                }

                break;
            case "x":
                //console.log("Opening x");
                getNewElemPosX(this);
                getNewElemPosY(this);
                break;
            case "y":
                //console.log("Opening y");
                getNewElemPosY(this);
                getNewElemPosX(this);

                break;
            default:
                break;
        }

        function getNewElemPosY(self) {
            //console.warn(wtf);
            let distanceTop = callerMiddleY - clientScrollTop;
            let distanceBot = clientHeight + clientScrollTop - callerMiddleY;
            let distanceLeft = callerMiddleX;
            let distanceRight = clientWidth - callerMiddleX;

            //console.log("Open direction is: " + self.openDirection);

            /**
             * Only if we open in Y direction
             */
            if (
                self.openDirection === "x" ||
                self.openDirection === "" ||
                self.openDirection === ""
            ) {
                //do if drection is x
                //console.log("open in X direction");
                //Set the vertical alignment

                let horizontalAlign;

                if (self.openPositionRelativeToCaller.search(/left/i) > -1) {
                    horizontalAlign = "left";
                } else if (
                    self.openPositionRelativeToCaller.search(/right/i) > -1
                ) {
                    horizontalAlign = "right";
                } else if (
                    self.openPositionRelativeToCaller.search(/center/i) > -1
                ) {
                    horizontalAlign = "center";
                }

                //console.log("horizontal align is: " + horizontalAlign);

                /**
                 *
                 *---------------------------------------------------------------------------------------------------------
                 *
                 *
                 */
                //which direction we have to move?
                if (distanceLeft > distanceRight) {
                    //console.log("opening to left side");
                    //console.log("left:" + distanceLeft);
                    //console.log("right: " + distanceRight);

                    if (self.ignoreCallerPositionXOnCollide) {
                        if (horizontalAlign === "left") {
                            callerOffsetX = 0;
                        }
                        if (horizontalAlign === "right") {
                            callerOffsetX = callerWidth;
                        }
                        if (horizontalAlign === "center") {
                            callerOffsetX = callerWidth / 2;
                        }
                    }

                    newElemX = callerEndX - elemWidth - callerOffsetX;
                    startX = "left";
                } else {
                    //console.log("opening to right side");
                    //console.log("left:" + distanceLeft);
                    //console.log("right: " + distanceRight);

                    if (self.ignoreCallerPositionXOnCollide) {
                        if (horizontalAlign === "left") {
                            callerOffsetX = callerWidth;
                        }
                        if (horizontalAlign === "right") {
                            callerOffsetX = callerWidth;
                        }
                        if (horizontalAlign === "center") {
                            callerOffsetX = callerWidth / 2;
                        }
                    }

                    newElemX = callerStartX + callerOffsetX;
                    startX = "left";
                }

                if (self.keepInViewPort == "true") {
                    if (elementEndY > clientHeight + clientScrollTop) {
                        //console.log(`${elementEndY}  > ${clientHeight}`);
                        /*console.log(
                            `ScrollTop: ${clientScrollTop}, ClientH: ${clientHeight}, elemHeight: ${elemHeight}`
                        );*/
                        newElemY = clientScrollTop + clientHeight - elemHeight;
                        startY = "top";
                    } else {
                        //console.log(`${elementEndY}  < ${clientHeight}`);
                    }
                }

                if (newElemX < 0) {
                    newElemX = callerEndX;
                    self.openDirection = "right";
                }
            }

            /**
             * Only if we open in Y direction
             */

            if (
                self.openDirection === "y" ||
                self.openDirection === "" ||
                self.openDirection === ""
            ) {
                //do if drection is y
                //console.log("open in Y direction");

                let verticalAlign = "";

                //Set the vertical alignment
                if (self.openPositionRelativeToCaller.search(/bot/i) > -1) {
                    verticalAlign = "bot";
                } else if (
                    self.openPositionRelativeToCaller.search(/top/i) > -1
                ) {
                    verticalAlign = "top";
                } else if (
                    self.openPositionRelativeToCaller.search(/middle/i) > -1
                ) {
                    verticalAlign = "middle";
                }

                //Which direction we have to move?
                //console.log("vertical align is: " + verticalAlign);
                if (distanceTop > distanceBot) {
                    //console.log(`open to TOP`);

                    if (self.ignoreCallerPositionYOnCollide) {
                        if (verticalAlign === "top") {
                            calcCallerHeight = 0;
                        }
                        if (verticalAlign === "bot") {
                            calcCallerHeight = callerHeight;
                        }
                        if (verticalAlign === "middle") {
                            calcCallerHeight = callerHeight / 2;
                        }
                    }

                    newElemY = callerStartY - elemHeight - calcCallerHeight;
                    startY = "top";

                    //If we open to top, but we are bigger than the viewport, we need to open it bot anyways.
                    if (
                        newElemY + elemHeight >
                        clientHeight + clientScrollTop
                    ) {
                        if (
                            self.openPositionRelativeToCaller.search(/top/i) >
                            -1
                        ) {
                            calcCallerHeight = 0;
                        } else if (
                            self.openPositionRelativeToCaller.search(/bot/i) >
                            -1
                        ) {
                            calcCallerHeight = 0;
                        }

                        console.warn("overflowing top!");
                        //console.warn("open bot");
                        newElemY = callerStartY + calcCallerHeight;
                        startY = "top";
                    }
                } else {
                    //console.log(`open to BOT`);
                    //console.log(self.openPositionRelativeToCaller);

                    if (self.ignoreCallerPositionYOnCollide) {
                        if (verticalAlign === "top") {
                            calcCallerHeight = callerHeight;
                        }
                        if (verticalAlign === "bot") {
                            calcCallerHeight = 0;
                        }
                        if (verticalAlign === "middle") {
                            calcCallerHeight = callerHeight / 2;
                        }
                    }

                    newElemY = callerStartY + calcCallerHeight;
                    startY = "top";

                    /*console.log(
                        `openPos: ${
                            callerStartY + calcCallerHeight
                        } from ${startY}`
                    );*/
                }
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
                        newElemX = clientWidth - callerEndX;
                        startX = "right";
                    } else {
                        newElemX = callerEndX;
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
