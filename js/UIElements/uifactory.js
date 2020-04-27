import * as UIManager from "./uimanager.js";

class UIFactory{

    constructor(options){
        this.type = null;
        this.template = null;
        this.content = null;
        this.context = null;
        this.trigger = null;
        this.sticky = null;
        this.caller = null;

        if(typeof options === "object"){
            for (let [prop, value] of Object.entries(options)) {
                
                if(this.hasOwnProperty(prop)){
                    this[prop] = value;
                }
            }

            this.build();
        }
    }

    async build(){
        if(this.type !== null && (this.template !== null || this.content !== null)){
            
            let mod = import("./"+this.type+".js");

            let state = "";
            let element = null;

            let self = this;

            mod.then(function(Component){
                if(Object.keys(Component).includes(self.type)){
                    element = new Component[self.type]({
                        "template": self.template,
                        "caller": self.caller,
                        "type": self.type,
                        "content": self.content,
                        "trigger": self.trigger,
                        "sticky": self.sticky
                    });
                }else
                {
                    console.log("Class "+self.type+" no found. Check uielement-type, it's case sensitive");
                }

            });

            mod.catch(function(err){
                state = "error";
                console.error(err);
            });

            mod.finally(function(){
                console.log("module loading finished with "+state);
            });
        }
    }
}

(function call(){ 
    $("body").on("click","[ms-uielement]", function(){

        console.log("click on UIElement: "+$(this).attr("ms-uielement-type")+" "+$(this).attr("ms-uielement-tpl"));

        let options = {
            "template": $(this).attr("ms-uielement-tpl"),
            "caller": $(this),
            "type": $(this).attr("ms-uielement-type"),
            "content": $(this).attr("ms-uielement-content"),
            "trigger": $(this).attr("ms-uielement-trigger"),
            "sticky": $(this).attr("ms-uielement-sticky")
        };

        new UIFactory(options);
    })
})();

export {};