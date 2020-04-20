import { Template } from "../template.js"

class UIElement{
    constructor(options){
        this.id = "";
        this.data = {};
        this.content = "";
        this.template = "";
        this.element = "";
        this.prefix = "ms-";
        this.referer = "";
        this.position = null;
        this.moveToHandler = true;

        if(typeof options === "object"){
            for (let [prop, value] of Object.entries(options)) {
                
                if(this.hasOwnProperty(prop)){
                    this[prop] = value;
                }
            }
        }

        if(this.id !== ""){
            this.createElement();
            $(this.position.UIHandler).addClass("isOpen");       
        }
        else{
            console.warn("No ID for UIElement! We didn't create it.");
        }

        this.data.id = this.prefix + this.id;

        console.log(this.data);
    }

    async createElement(){
        let element = await this.create();
        if(this.moveToHandler){
            this.move(this.calculatePosition());
        }
        
        element.addClass("isOpen");

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
                if($("body").find("#"+self.prefix + self.id).length > 0){
                    clearInterval(interval);
                    resolve($("#"+self.prefix + self.id));
                }
                else{
                    if(timer > 5000){
                        clearInterval(interval);
                        reject("can't create the DOM Element");
                    }
                }
            }, 10);
        });
    }

    /**
     * Removes the given Element from the DOM Tree
     * 
     * @param {UIElement.id} element 
     */
    static destroy(element, handler=null){
        console.log(element+" destroyed");
        $("#"+element).remove();
        console.log("test");
    }

    static getPrefix(){
        return this.prefix;
    }

    /**
     * Calculates the Endposition of the UIElement
     * 
     * It only works if the UIHandler is given in the @var position object 
     * and the childclass hansn't @var moveToHandler set to false.
     * 
     * @return The absolute position of the new Element.
     */
    calculatePosition(){

        let position, width, height;
        let UIElementNewPosition = new Object;

        self = this;

        if(typeof this.position === "object"){
            if(this.position.hasOwnProperty("UIHandler")){
                let UIHandler = this.position.UIHandler;

                position = UIHandler.offset();
                width = UIHandler.outerWidth(false);
                height = UIHandler.outerHeight(false);

                UIElementNewPosition.left = position.left + width;
                UIElementNewPosition.top = position.top;

                return UIElementNewPosition;

            }
            else
            {
                console.log("no UIHandler received");
            }
        }
        else{
            console.log("no position object received");
        }
    }


    /**
     * Moves an UIElement to the given Position.
     * 
     * Make sure the UIElement is already part of the DOM Tree.
     * 
     * @param {UIElement.position} position 
     */
    move(position){
        if(typeof this.position === "object"){
            if(this.position.hasOwnProperty("UIHandler")){
                let UIElement = $("#"+this.prefix + this.id);

                UIElement.css({top: position.top+"px", left: position.left+"px"});
            }
        }
    }
}

export { UIElement };