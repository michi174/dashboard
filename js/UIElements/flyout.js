import {UIElement} from "./uielement.js";


class FlyOut extends UIElement{
    constructor(options){

        options.UIHandler = "ms-flyout";
        options.template = "flyout.handlebars";
        options.prefix = "ms-flyout-";
        
        super(options);
        
        this.prefix = "ms-flyout-";

    }
}


(function toggleFlyOut(){ 
    $('[ms-flyout]').click(function(){
        let flyoutName = $(this).attr("ms-flyout");

        if(!$(this).hasClass("isOpen")){
            console.log("Loading FlyOut: "+flyoutName);
            new FlyOut({
                "id": flyoutName,
                "position": {
                    "UIHandler": $(this)
                },
                "data": {
                    "flyout": flyoutName
                }
            });
        }
        else{
            $(this).removeClass("isOpen");
            FlyOut.destroy("ms-flyout-"+flyoutName);
        }
    });
})();

export {};