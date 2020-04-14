import {renderTemplate} from "../render.js";

class UIElement{
    constructor(options){
        if(typeof options === "object"){
            if(options.hasOwnProperty("name")){
                this.id = options.name;
            }
        }
    }
}

export { UIElement };