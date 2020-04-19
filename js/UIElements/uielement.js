import { Template } from "../template.js"

class UIElement{
    constructor(options){
        this.id = "";
        this.data = "";
        this.content = "";
        this.template = "";
        this.element = "";
        this.prefix = "ms-";
        this.referer = "";
        this.position = null;

        console.log(options);
        console.log("----------");
        

        if(typeof options === "object"){
            for (let [prop, value] of Object.entries(options)) {
                
                if(this.hasOwnProperty(prop)){
                    this[prop] = value;
                    console.log(prop + " : "+ value);
                }
            }
        }

        if(this.id !== ""){
            this.createElement();
            $(this.position.UIHandler).addClass("isOpen");       
        }
        else{
            console.error("No ID for UIElement! We didn't create it.");
        }

        
    }

    async createElement(){
        let element = await this.create();
        this.move(this.calculatePosition());
        element.addClass("isOpen");

    }

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

    async create(){
        new Template({
           "path": "view/UIElements",
           "file": this.template,
           "data": {"id": this.prefix + this.id},
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

    static destroy(element){
        $("#"+element).remove();
        console.log(element);
    }

    move(position){
        let UIElement = $("#"+this.prefix + this.id);

        UIElement.css({top: position.top+"px", left: position.left+"px"});

    }
}

export { UIElement };