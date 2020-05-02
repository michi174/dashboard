import {Template} from "../template.js";

export default class AppBar {
    constructor(template) {
        console.log("[APPBAR] Initialising AppBar");
        this.bar = $(template);
        this.leftButtons = new Array;
        this.rightButtons = new Array;
        this.title = "";
        this.buttonCSSClass;
        this.theme = "";
        this.isRendered = false;
        this.isReady = false;
        this.guid = 0;
        this.DOMElement = null;

        this.render();
    }

    async addButton(appBarButton) {

        

        let index = this.leftButtons.findIndex(button => button.id === appBarButton.id);

        if (index === -1) {
            index = this.rightButtons.findIndex(button => button.id === appBarButton.id);
        }

        if (index < 0) {
            let button = new Object;

            button["id"] = appBarButton.id;
            button["position"] = appBarButton.position;
            button["order"] = appBarButton.order;
            button["button"] = await appBarButton.render();

            if (button.position === "left") {
                this.leftButtons.push(button);
                //console.log("added left button");
            }

            if (button.position === "right") {
                this.rightButtons.push(button);
                //console.log("added right button");
            }

            this.leftButtons.sort(function (a, b) {
                if (a.order > b.order) {
                    return 1;
                }
                else {
                    return -1;
                }
            });

            this.rightButtons.sort(function (a, b) {
                if (a.order < b.order) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            console.log("[APPBAR] addButton");
            this.render(true);
        }
    }

    removeButton(btn) {
        let index;

        if (btn.position === "left") {
            index = this.leftButtons.findIndex(button => button.id === btn.id);
            this.leftButtons.splice(index, 1);
        }
        else {
            index = this.rightButtons.findIndex(button => button.id === btn.id);
            this.rightButtons.splice(index, 1);
        }    
        
        console.log("[APPBAR] removeButton");
        this.render(true);
    }

    replaceButton(BtnToReplace, newBtn) {
        this.removeButton(BtnToReplace);
        this.addButton(newBtn);
    }

    reset() {
        this.leftButtons = new Array;
        this.rightButtons = new Array;
        this.title = "";
        this.theme = "";

        console.log("[APPBAR] reset");
        this.render(true);
    }

    setTitle(title) {
        this.title = title;
        this.render(true);
    }

    remove(){
        
    }

    _isReady(){
        let self = this;

        return new Promise(function(resolve, reject){
            let timer = 0;
            let interval = 10;
            let timeout = 3000;

            let watcher = setInterval(function(){
                timer = timer+interval;
    
                if(self.isReady){
                    clearInterval(watcher);
                    console.log("[APPBAR] appbar found");
                    resolve();
                }
    
                if(timer > timeout){
                    clearInterval(watcher);
                    reject("Cant find Appbar");
                }
            }, interval);
        });

    }

    async render(refresh = false) {

        
        let appBarIdent = false;

        if(refresh){
            console.log("[APPBAR] refreshing appbar");
            await this._isReady();
            appBarIdent = $("[guid='"+this.guid+"']");
            console.log("[APPBAR] removing Appbar "+appBarIdent.attr("id"));
            Template.remove(Template.getGuid(appBarIdent));
            this.isReady = false;

        }
        else{
            console.log("[APPBAR] new appbar required");
        }


        if(this.isRendered === false || (this.isRendered === true && refresh === true)){

            this.isRendered = true;

            console.log("[APPBAR] Creating a new appbar");
            let temp = new Template({
                "path": "view",
                "file": "appbar.handlebars",
                "data": {
                    "title": this.title,
                    "leftButtons": this.leftButtons,
                    "rightButtons": this.rightButtons
                    },
                "target": "body",
                "method": "prepend"
                }, true);
    
                temp.data.guid = temp.guid;
                this.guid = temp.guid;
                
            temp._render();
    
            let self = this;
            
            temp.isReady().then(function(){
                console.log("[APPBAR] "+self.guid+" is rendered and ready in DOM.");
                self.isReady = true;
                self.setTheme();
            });
        }
    }

    setTheme() {
        console.log("[APPBAR] setting theme for appbar guid: "+this.guid);
        
        let elem = $("[guid='"+this.guid+"']");
        elem.addClass(this.theme);
        
    }

    addTheme(theme) {
        this.theme = theme;
    }
}
