import {UIElement} from "./uielement.js";

(function toggleFlyOut(){ 
    $('[ms-flyout]').click(function(){
        let flyOutName = $(this).attr("ms-flyout");



        console.log("Loading FlyOut: "+flyOutName);
    });
})(); 

class FlyOut extends UIElement{
    constructor(options){
        super();
        this.template = "flyout.handlebars";
    }

    loadTemplate(){
        
    }

    create(){

    }

    destroy(){

    }

    move(){

    }



}

export {};