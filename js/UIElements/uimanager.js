import UIFactory from "./uifactory.js";

export default class UIManager{
    constructor(){
        const instance = this.constructor.instance;
        
        if(instance){
            return instance
        }

        this.elements = new Array;


        this.constructor.instance = this;
    }

    add(element){
        let index = this.find(element.id);
        if(index < 0){
            this.elements.push(element);
        }
        else{
            this.elements[index] = element;
        }
        
    }

    remove(uid){
        let index = this.find(uid);
        let element;

        if(index >= 0){
            element = this.elements[index];
            element.caller.removeAttr("ms-uielement-id");
            element.caller.removeAttr("ms-uielement-is-open");

            console.log("[UIManager] removing element");
            element.remove();
        }

    }

    find(uid){
        if(this.elements.length > 0){
            let index = this.elements.findIndex(element => element.id === uid);
            return index;
        }
        else{
            return -1;
        }
    }

    getUniqueID(){
        let uid = "ms-uie-"+this._generateRandom();

        //TODO: FIX this includes(uid)
        if(this.elements.includes(uid)){
            this.getUniqueID();
        }
        else{
            return uid;
        }
    }

    _generateRandom(){
        return (Math.random() * Math.floor(1000000000000000000000)).toFixed(0).toString(16)
    }
}

(function call(){ 
    $("body").on("click","[ms-uielement]", function(){
        if($(this).attr("ms-uielement-is-open") !== "true"){
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
        }
        else{
            let uid = $(this).attr("ms-uielement-id");
            new UIManager().remove(uid);
            
        }
    })
})();