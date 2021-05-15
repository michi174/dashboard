import Template from "../template.js";
import UIManager from "./uimanager.js";
export default class UIElement {
    constructor(options) {
        this.id = "";
        this.data = {};
        this.content = "";
        this.template = "";
        this.element = "";
        this.caller = null;
        this.attach = true;
        this.openDirection = "right"; //up, right, down, left, x, y
        this.openPositionRelativeToCaller = "topRight";
        this.ownXPosition = "left"; //left, right, center
        this.elementAlignX = "left";
        this.elementAlignY = "top";
        this.resizeObserver = null;
        this.target = "body";
        this.animation = "";
        this.alignX = "left";
        this.alignY = "bot";
        this.ignoreCallerPositionYOnCollide = true;
        this.ignoreCallerPositionXOnCollide = true;
        this.keepInViewPortX = false;
        this.keepInViewPortY = false;
        this.observe = true;
        this.animationDirection = this.openDirection;
        this.actualPosition = this.openDirection;
        this.openIndicator = false;

        if (typeof options === "object") {
            for (let [prop, value] of Object.entries(options)) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = value;
                }
            }
        }

        this.id = new UIManager().getUniqueID();
        this.data.id = this.id;

        if (this.id !== "") {
            this.createElement().then(function (element) {});
        } else {
            console.warn("[UIElement] No ID for UIElement. Can't create it.");
        }

        //console.log(this);
    }

    /**
     * Creates a new UIElement and places it into the DOM Tree.
     */
    async createElement() {
        try {
            let element = await this.create();

            let self = this;

            // element.on("ms.uielement.content.changed", function () {
            //     self._move(self._calcStartPoint());
            // });

            if (this.attach) {
                this._move(this._calcStartPoint());

                //Recalculate the position if the element changes its size.
                if (this.observe) {
                    let counter = 0;
                    this.resizeObserver = new ResizeObserver(entries => {
                        for (let entry of entries) {
                            const cr = entry.contentRect;
                            const jQElement = $(entry.target);

                            this._move(this._calcStartPoint());
                            counter++;
                            if (counter >= 20) {
                                this.resizeObserver.unobserve(element[0]);
                                console.warn(
                                    "[UIElement] Disabling resizeObserver -> way too much changes on one element"
                                );
                            }
                        }
                    });
                    this.resizeObserver.observe(element[0]);
                }
            }

            element.addClass("isOpen");
            element.addClass("ms-ui-element");
            element.addClass(this.animation);
            element.addClass(this.openDirection);

            if (this.caller) {
                this.caller.attr("ms-uielement-id", this.id);
                this.caller.attr("ms-uielement-is-open", "true");
            }

            if (this.animation) {
                element.on("animationend", function () {
                    element.trigger("ms.uielement.ready");
                });
            } else {
                element.trigger("ms.uielement.ready");
            }

            new UIManager().add(this);
            this.element = element;
            return this.element;
        } catch (e) {
            console.warn(e);
        }
    }

    /**
     * Creates a new DOM Element into the DOM Tree.
     */
    async create() {
        let method = "append";

        new Template({
            path: "view/UIElements",
            file: this.template,
            data: this.data,
            target: this.target,
            method: method
        });

        let self = this;

        return new Promise(function (resolve, reject) {
            let interval;
            let timer = 0;
            let step = 1;

            interval = setInterval(function () {
                timer += step;
                if ($("body").find("#" + self.id).length > 0) {
                    let UIElement = $("#" + self.id);

                    UIElement.on("ms.tpl.content.added", function () {
                        UIElement.trigger("ms.uielement.content.changed");
                    });

                    UIElement.trigger("ms.uielement.dom.ready");
                    clearInterval(interval);
                    resolve($("#" + self.id));
                } else {
                    if (timer > 5000) {
                        clearInterval(interval);
                        reject("can't create the DOM Element (ID: " + self.id + ")");
                    }
                }
            }, step);
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

        if (this.attach) {
            if (typeof this.caller === "object" && this.caller !== null) {
                let UIElement = $("#" + this.id);
                let caller = this.caller;

                position = caller.offset();

                callerWidth = caller.outerWidth(true);
                callerHeight = caller.outerHeight(true);

                callerStartX = position.left;
                callerStartY = position.top;

                callerEndX = callerStartX + callerWidth;
                callerEndY = callerStartY + callerHeight;

                callerMiddleX = callerStartX + callerWidth / 2;
                callerMiddleY = callerStartY + callerHeight;

                clientHeight = document.documentElement.clientHeight;
                clientWidth = document.documentElement.clientWidth;

                let callerVpPos = caller[0].getBoundingClientRect();

                let elemHeight = UIElement.outerHeight(true);
                let elemWidth = UIElement.outerWidth(true);

                let leftDistance = callerVpPos.left;
                let rightDistance = clientWidth - (callerVpPos.left + callerWidth);
                let topDistance = callerVpPos.top;
                let botDistance = clientHeight - (callerVpPos.top + callerHeight);

                let alignX = "";
                let alignY = "";

                if (self.openPositionRelativeToCaller.search(/left/i) > -1) {
                    alignX = "left";
                } else if (self.openPositionRelativeToCaller.search(/right/i) > -1) {
                    alignX = "right";
                } else if (self.openPositionRelativeToCaller.search(/center/i) > -1) {
                    alignX = "center";
                }

                if (self.openPositionRelativeToCaller.search(/bot/i) > -1) {
                    alignY = "bot";
                } else if (self.openPositionRelativeToCaller.search(/top/i) > -1) {
                    alignY = "top";
                } else if (self.openPositionRelativeToCaller.search(/middle/i) > -1) {
                    alignY = "middle";
                }

                //console.log(alignX);
                //console.log(alignY);

                if (alignX === "") {
                    if (elemWidth < rightDistance || leftDistance > rightDistance) {
                        alignX = "right";
                    } else {
                        alignX = "left";
                    }
                }

                if (alignY === "") {
                    if (elemHeight < botDistance || botDistance > topDistance) {
                        alignY = "bot";
                    } else {
                        alignY = "top";
                    }
                }

                //console.log(alignX + alignY);

                switch (alignX) {
                    case "left":
                        UIElementNewPosition.X = callerStartX;
                        break;
                    case "center":
                        UIElementNewPosition.X = callerMiddleX;
                        break;
                    case "right":
                        UIElementNewPosition.X = callerEndX;
                        break;
                    default:
                        UIElementNewPosition.X = callerStartX;
                }

                switch (alignY) {
                    case "top":
                        UIElementNewPosition.Y = callerStartY;
                        break;
                    case "middle":
                        UIElementNewPosition.Y = callerMiddleY;
                        break;
                    case "center":
                        UIElementNewPosition.Y = callerEndY;
                        break;
                    default:
                        UIElementNewPosition.Y = callerEndY;
                }

                this.openPositionRelativeToCaller = alignX + alignY;

                this.alignX = alignX;
                this.alignY = alignY;
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

        let elemHeight = UIElement.outerHeight(true);
        let elemWidth = UIElement.outerWidth(true);

        let originElemX = position.X;
        let originElemY = position.Y;

        let callerHeight = this.caller.outerHeight(true);
        let callerWidth = this.caller.outerWidth(true);
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

        let xOffset = 0;

        switch (self.ownXPosition) {
            case "left":
                xOffset = 0;
                break;
            case "center":
                xOffset = elemWidth / 2;
                break;
            case "right":
                xOffset = elemWidth;
                break;
            default:
                xOffset = 0;
        }

        switch (this.openDirection) {
            case "up":
                newElemY = newElemY - elemHeight;
                newElemX = newElemX - xOffset;
                startY = "top";

                //console.log("Opening up");
                if (elementEndX > clientWidth) {
                    getNewElemPosX(this);
                }
                this.actualPosition = "top";
                break;
            case "right":
                //console.log("Opening right");
                newElemX = newElemX - xOffset;
                getNewElemPosY(this);
                this.actualPosition = "right";
                break;
            case "left":
                //console.log("Opening left");
                newElemX = clientWidth - callerEndX - xOffset;
                startX = "right";

                getNewElemPosY(this);
                this.actualPosition = "left";

                break;
            case "down":
                newElemX = newElemX - xOffset;
                startY = "bot";
                //console.log("Opening down");
                if (elementEndX > clientWidth) {
                    getNewElemPosX(this);
                }

                this.actualPosition = "bottom";

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
            let distanceTop = callerMiddleY - clientScrollTop;
            let distanceBot = clientHeight + clientScrollTop - callerMiddleY;
            let distanceLeft = callerMiddleX;
            let distanceRight = clientWidth - callerMiddleX;

            //console.log("Open direction is: " + self.openDirection);

            switch (self.alignX) {
                case "left":
                    distanceLeft = callerStartX;
                    distanceRight = clientWidth - callerStartX;
                    break;
                case "right":
                    distanceLeft = callerEndX;
                    distanceRight = clientWidth - callerEndX;
                    break;
                case "center":
                    distanceLeft = callerMiddleX;
                    distanceRight = clientWidth - callerMiddleX;
                    break;
            }

            /**
             * Only if we open in Y direction
             */
            if (self.openDirection === "x" || self.openDirection === "") {
                //do if drection is x
                //console.log("open in X direction");
                //Set the vertical alignment

                //console.log("left:" + distanceLeft);
                //console.log("right: " + distanceRight);
                //console.log("elemWidth: " + elemWidth);

                let horizontalAlign = self.alignX;
                //console.log("horizontal align is: " + horizontalAlign);
                //which direction we have to move?
                if (elemWidth < distanceRight || distanceLeft < distanceRight) {
                    self.actualPosition = "right";
                    //console.log("opening to right side");
                    switch (horizontalAlign) {
                        case "left":
                            callerOffsetX = callerWidth;
                            break;
                        case "right":
                            callerOffsetX = callerWidth;
                            break;
                        case "center":
                            callerOffsetX = callerWidth / 2;
                            break;
                    }

                    newElemX = callerStartX + callerOffsetX;
                    startX = "left";
                } else {
                    //console.log("opening to left side");
                    self.actualPosition = "left";
                    if (self.ignoreCallerPositionXOnCollide) {
                        switch (horizontalAlign) {
                            case "left":
                                callerOffsetX = 0;
                                break;
                            case "right":
                                callerOffsetX = callerWidth;
                                break;
                            case "center":
                                callerOffsetX = callerWidth / 2;
                                break;
                        }
                    }

                    newElemX = clientWidth - callerEndX + callerOffsetX;
                    startX = "right";
                }

                if (self.keepInViewPortY == "true") {
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

                let verticalAlign = self.alignY;

                if (elemHeight < distanceBot || distanceTop < distanceBot) {
                    //console.log(`open to BOT`);
                    //console.log(self.openPositionRelativeToCaller);

                    newElemY = callerStartY + calcCallerHeight;
                    startY = "top";
                } else {
                    //console.log(`open to TOP`);

                    newElemY = callerStartY - elemHeight - calcCallerHeight;
                    startY = "top";

                    //If we open to top, but we are bigger than the viewport, we need to open it bot anyways.
                    if (newElemY + elemHeight > clientHeight + clientScrollTop) {
                        console.warn("overflowing top!");
                        //console.warn("open bot");
                        newElemY = callerStartY;
                        startY = "top";
                    }
                }
            }

            /**
             * Only if we open in Y direction
             */

            if (self.openDirection === "y" || self.openDirection === "") {
                //do if drection is y
                //console.log("open in Y direction");

                let verticalAlign = self.alignY;

                if (elemHeight < distanceBot || distanceTop < distanceBot) {
                    //console.log(`open to BOT`);
                    //console.log(self.openPositionRelativeToCaller);
                    self.actualPosition = "bottom";
                    if (self.ignoreCallerPositionYOnCollide) {
                        switch (verticalAlign) {
                            case "top":
                                calcCallerHeight = callerHeight;
                                break;
                            case "bot":
                                calcCallerHeight = 0;
                                break;
                            case "middle":
                                calcCallerHeight = callerHeight / 2;
                                break;
                        }
                    }

                    newElemY = callerStartY + calcCallerHeight;
                    startY = "top";

                    /*console.log(
                        `openPos: ${
                            callerStartY + calcCallerHeight
                        } from ${startY}`
                    );*/
                } else {
                    //console.log(`open to TOP`);
                    self.actualPosition = "top";
                    if (self.ignoreCallerPositionYOnCollide) {
                        switch (verticalAlign) {
                            case "top":
                                calcCallerHeight = 0;
                                break;
                            case "bot":
                                calcCallerHeight = callerHeight;
                                break;
                            case "middle":
                                calcCallerHeight = callerHeight / 2;
                                break;
                        }
                    }

                    newElemY = callerStartY - elemHeight - calcCallerHeight;
                    startY = "top";

                    //If we open to top, but we are bigger than the viewport, we need to open it bot anyways.
                    if (newElemY + elemHeight > clientHeight + clientScrollTop) {
                        console.warn("overflowing top!");
                        //console.warn("open bot");
                        newElemY = callerStartY;
                        startY = "top";
                    }
                }
            }
        }

        function getNewElemPosX(self) {
            align = self.alignX;

            switch (align) {
                case "left":
                    leftDistance = callerStartX - xOffset;
                    rightDistance = clientWidth - callerStartX - xOffset;

                    if (elemWidth < rightDistance || leftDistance < rightDistance) {
                        newElemX = callerStartX - xOffset;
                        startX = "left";
                    } else {
                        newElemX = clientWidth - callerStartX - xOffset;
                        startX = "right";
                    }

                    break;
                case "center":
                    leftDistance = callerMiddleX - xOffset;
                    rightDistance = clientWidth - callerMiddleX - xOffset;

                    if (elemWidth < rightDistance || leftDistance < rightDistance) {
                        //console.log("open to right");
                        newElemX = callerMiddleX - xOffset;
                        startX = "left";
                    } else {
                        //console.log("open to left");
                        newElemX = clientWidth - callerMiddleX - xOffset;

                        startX = "right";
                    }

                    break;
                case "right":
                    leftDistance = callerEndX - xOffset;
                    rightDistance = clientWidth - callerEndX - xOffset;

                    if (elemWidth < rightDistance || leftDistance < rightDistance) {
                        newElemX = callerEndX - xOffset;
                        startX = "left";
                    } else {
                        newElemX = clientWidth - callerEndX - xOffset;
                        startX = "right";
                    }
                    break;
            }
        }

        if (newElemX < 0) {
            newElemX = 2;
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

        if (self.caller !== null) {
            self.caller.attr("ms-ui-element-actual-pos", self.actualPosition);
        }

        UIElement.css(startY, newElemY + "px");
        UIElement.css(startX, newElemX + "px");
    }
}

export { UIElement };
