import { renderTemplate } from "./render.js";

class AppBarButton {
    constructor(id, template, options = { icon: "", position: "right", order: 0, cssClas: "" }) {
        this.id = id;
        this.button = $(template);
        this.icon = "";
        this.position = "right";
        this.order = 0;
        this.cssClass = "";

        if ("icon" in options) {
            this.icon = options.icon;
        }

        if ("position" in options) {
            this.position = options.position;
        }

        if ("order" in options) {
            this.order = options.order;
        }

        if ("cssClass" in options) {
            this.cssClass = options.cssClass;
        }

        return this;
    }

    render() {
        let compiledButton = null;

        compiledButton = renderTemplate(
            this.button,
            null,
            {
                "id": this.id,
                "class": this.cssClass,
                "icon": this.icon
            },
            null,
            false
        );

        return compiledButton;
    }
}

class MainActionButton extends AppBarButton {
    constructor(id, template, action, options = {icon:"", position: "right", order: 0, cssClas: ""}) {
        super(id, template, options);
        this.action = action;
        this.render();

    }

    setAction(action) {
        this.action = action;
        this.getDOMElement().attr("data-action", this.action);
    }

    setIcon(icon) {
        this.icon = icon;
        this.render();
        
    }

    getDOMElement() {
        return $("#" + this.id);
    }

    render() {
        let compiledButton = renderTemplate(
            this.button,
            "#bot-navigation-wr",
            {
                "id": this.id,
                "class": this.cssClass,
                "icon": this.icon
            },
            "replace",
            false
        );

        this.setAction(this.action);
    }
}

class AppBar {
    constructor(template) {
        this.bar = $(template);
        this.leftButtons = new Array;
        this.rightButtons = new Array;
        this.title = "";
        this.buttonCSSClass;
        this.theme = "";
    }

    addButton(appBarButton) {

        let index = this.leftButtons.findIndex(button => button.id === appBarButton.id);

        if (index === -1) {
            index = this.rightButtons.findIndex(button => button.id === appBarButton.id);
        }

        if (index < 0) {
            let button = new Object;

            button["id"] = appBarButton.id;
            button["position"] = appBarButton.position;
            button["order"] = appBarButton.order;
            button["button"] = appBarButton.render();

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

            this.render();
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
        this.render();
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

        this.render();
    }


    setTitle(title) {
        this.title = title;
        this.render();
    }

    render() {

        //check if this appbar already exists
        let appBarId = $($(this.bar).html()).attr('id');

        if ($("#" + appBarId).length > 0) {
            $("#" + appBarId).remove();
        }

        renderTemplate(
            this.bar,
            "body",
            {
                "title": this.title,
                "leftButtons": this.leftButtons,
                "rightButtons": this.rightButtons
            },
            "prepend",
            false);

        this.setTheme();

        //console.log("AppBar rendered");
    }

    setTheme() {
        $("#"+$($(this.bar).html()).attr('id')).addClass(this.theme);
    }

    addTheme(theme) {
        this.theme = theme;
    }

    hide() {
        $(this.bar).first().hide();
    }

    show() {
        $(this.bar).first().show();
    }
}
export {AppBar, AppBarButton, MainActionButton}
