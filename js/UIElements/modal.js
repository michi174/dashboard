import {UIElement} from "./uielement.js";


class Modal extends UIElement{
    constructor(options){

        options.UIHandler = "ms-modal";
        options.template = "modal.handlebars";
        options.prefix = "ms-modal-";
        options.moveToHandler = false;
        

        super(options);
        
        this.prefix = options.prefix;

    }
}


(function toggle(){ 
    $('[ms-modal]').click(function(){
        let elemName = $(this).attr("ms-modal");

        if(!$(this).hasClass("isOpen")){
            console.log("Loading Modal: "+elemName);
            new Modal({
                "id": elemName,
                "position": {
                    "UIHandler": $(this)
                },
                "data": {
                    "modal": elemName
                }
            });
        }
        else{
            $(this).removeClass("isOpen");
            Modal.destroy("ms-modal-"+elemName);
        }
    });
})();

(function closeModal(){
    $('body').on('click', '.ms-modal-close-btn', function () {
        let element = $(this).closest(".ms-modal-wrapper").attr("id");
        Modal.destroy(element);
    });
})();

export {};