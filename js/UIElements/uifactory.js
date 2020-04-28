import UIManager from "./uimanager.js";

export default class UIFactory{

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
            
            let mod = import("./"+(this.type).toLowerCase()+".js");

            let state = "";
            let element = null;

            let self = this;

            mod.then(function(Component){
                state = "success";
                if(Object.keys(Component).includes(self.type)){
                    element = new Component[self.type]({
                        "data": {"template": self.template},
                        "caller": self.caller,
                        "type": self.type,
                        "content": self.content,
                        "trigger": self.trigger,
                        "sticky": self.sticky
                    });
                }else
                {
                    console.log("[UIFactory] Class "+self.type+" not found. Check uielement-type, it's case sensitive");
                    console.log(Component);
                }

            });

            mod.catch(function(err){
                state = "error";
                console.error(err);
            });

            mod.finally(function(){
                console.log("[UIFactory] module loading finished with "+state);
            });
        }
    }
}



export {};