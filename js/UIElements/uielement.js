import { Template } from "../template.js";
import UIManager from "./uimanager.js";

class UIElement{
    constructor(options){
        this.id = "";
        this.data = {};
        this.content = "";
        this.template = "";
        this.element = "";
        this.referer = "";
        this.position = null;
        this.moveToCaller = true;
        this.caller = null;

        if(typeof options === "object"){
            for (let [prop, value] of Object.entries(options)) {
                
                if(this.hasOwnProperty(prop)){
                    this[prop] = value;
                }
            }
        }

        this.id = new UIManager().getUniqueID();

        if(this.id !== ""){
            this.createElement();                
        }
        else{
            console.warn("[UIElement] No ID for UIElement. Can't create it.");
        }

        this.data.id = this.id;
    }

    /**
     * Creates a new UIElement and places it into the DOM Tree.
     */
    async createElement(){
        try{
            let element = await this.create();

            if(this.moveToCaller){
                this._move(this._calculatePosition());
            }
            element.addClass("isOpen");

            this.caller.attr("ms-uielement-id", this.id);
            this.caller.attr("ms-uielement-is-open", "true");

            new UIManager().add(this);
            
        }
        catch(e){
            console.warn(e);
        }
    }

    /**
     * Creates a new DOM Element into the DOM Tree.
     */
    async create(){
        new Template({
           "path": "view/UIElements",
           "file": this.template,
           "data": this.data,
           "target": "body",
           "method": "append"
        });

        let self = this;

        return new Promise(function(resolve, reject){
            let interval;
            let timer = 0;

            interval = setInterval(function(){
                timer+=10;
                if($("body").find("#"+self.id).length > 0){
                    clearInterval(interval);
                    resolve($("#"+self.id));
                }
                else{
                    if(timer > 5000){
                        clearInterval(interval);
                        reject("can't create the DOM Element (ID: "+self.id+")");
                    }
                }
            }, 10);
        });
    }

    /**
     * Removes the given Element from the DOM Tree
     * 
     */
    remove(){
        $($("#"+this.id)).remove();
    }

    static getPrefix(){
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
    _calculatePosition(){

        let position, width, height;
        let UIElementNewPosition = new Object;

        self = this;

        if(this.moveToCaller){
            if(typeof this.caller === "object" && this.caller !== null){
                let caller = this.caller;
                position = caller.offset();
                width = caller.outerWidth(false);
                height = caller.outerHeight(false);

                UIElementNewPosition.left = position.left + width;
                UIElementNewPosition.top = position.top;

                return UIElementNewPosition;

            }
            else{
                console.log("[UIElement] No Caller received!")
            }
        }
        else{

        }
    }


    /**
     * Moves an UIElement to the given Position.
     * 
     * Make sure the UIElement is already part of the DOM Tree.
     * 
     * @param {UIElement.position} position 
     */
    _move(position){
        console.log("[UIElement] Position")
        console.log(position);
        if(this.moveToCaller){
            if(typeof this.caller === "object" && this.caller !== null){
                let UIElement = $("#"+this.id);
                UIElement.css({top: position.top+"px", left: position.left+"px"});
            }
        }
    }
}

export { UIElement };