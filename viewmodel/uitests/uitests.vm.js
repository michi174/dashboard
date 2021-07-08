import ViewModel from "../../js/viewmodel/viewmodel.js";
import Notification from "../../js/uielements/elements/notification.js";

class Attribute {
    constructor(name, formname = "", value = "") {
        this.name = name;
        this.formname = formname;
        this.value = value;
    }

    setValue(value) {
        this.value = value;
    }
}

export default class UITests extends ViewModel {
    constructor(params) {
        super(params);
        this.app.setTitle("UI Tests");
        this.options;
    }

    async default() {
        this.options = new Array();
        this.options.push(new Attribute("ms-uielement-type", "uielementtype"));
        this.options.push(new Attribute("ms-uielement-trigger", "trigger"));
        this.options.push(new Attribute("ms-uielement-animation", "animation"));
        this.options.push(new Attribute("ms-uielement-open-indicator", "openindicator"));
        this.options.push(new Attribute("ms-uielement-tpl", "template"));
        this.options.push(new Attribute("ms-uielement-content", "customtext"));
        this.options.push(new Attribute("ms-uielement-position", "uielementpos"));
        this.options.push(new Attribute("ms-uielement-open-direction", "opendirection"));
        this.options.push(new Attribute("ms-uielement-own-x-pos", "uielementalignx"));
        this.options.push(new Attribute("ms-uielement-autoclose", "timeout"));

        this.view.existsInDOM().then(() => {
            this.setString();

            $("#clip-copy").click(() => {
                navigator.clipboard
                    .writeText(encodeURI(document.querySelector("#rendered-code").innerHTML))
                    .then(() => {
                        new Notification({
                            data: { content: "code copied successfully to your clipboard!" },
                            autoClose: 3000
                        });
                    });
            });
        });

        $("body").on("change", '.page input[name="uielementposx"], input[name="uielementposy"] ', () => {
            $('input[name="uielementpos"]').val(
                $('input[name="uielementposx"]:checked').val() + $('input[name="uielementposy"]:checked').val()
            );
        });

        $("body").on("keyup", '.page input[name="customtpl"]', () => {
            $('.page input[id="custom"]').prop("checked", true);
            $('.page input[id="custom"]').val($('input[name="customtpl"]').val());
        });

        $("body").on("keyup", '.page input[name="customtext"]', () => {
            $('.page input[id="text"]').prop("checked", true);
            $('.page input[id="text"]').val($('input[name="customtext"]').val());
        });

        $("body").on("keyup", '.page input[name="timeout"]', () => {
            $('.page input[id="timeout"]').val($('input[name="timeout"]').val());
        });

        $("body").on("change", ".page input", () => {
            this.setString();
        });

        $("body").on("click", ".page #uihandler", () => {
            this.setString();
        });
    }

    setString() {
        let code = this.createString();
        $("#rendered-code").text("<div\n  ms-uielement\n" + code + ">UI Handler</div>");
    }

    findOption(name) {
        return this.options.find(element => element.name === name);
    }

    createString() {
        let str = "";
        let val = "";
        for (let attr of this.options) {
            let formElem = $("body").find('input[name="' + attr.formname + '"]');

            switch (formElem.attr("type")) {
                case "radio":
                    val = $('input[name="' + attr.formname + '"]:checked').val();
                    break;
                case "checkbox":
                    val = $('input[name="' + attr.formname + '"]').is(":checked") == true ? "true" : "false";
                    break;
                default:
                    val = $('input[name="' + attr.formname + '"]').val();
            }

            $("#uihandler").attr("ms-uielement", "");

            if (val !== "") {
                $("#uihandler").attr(attr.name, val);
                if (attr.name === "ms-uielement-tpl") {
                    if ($('input[id="text"]').is(":checked")) {
                        $("#uihandler").attr(attr.name, "");
                    } else {
                        str += `  ${attr.name}="${val}"\n`;
                    }
                } else {
                    str += `  ${attr.name}="${val}"\n`;
                }
            }
        }

        return str;
    }

    async onLoad() {}
}
