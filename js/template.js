import Tools from "./tools.js";

export default class Template {
    constructor(options, retObj = false) {
        this.guid = this.uniqueID();
        this.path = "";
        this.file = "";
        this.extension = "handlebars";
        this.html = "";
        this.target = "";
        this.data = {};
        this.method = "default";
        this.designMode = false;
        this.renderedHTML = "";

        if (typeof options === "object") {
            for (let [prop, value] of Object.entries(options)) {
                if (this.hasOwnProperty(prop)) {
                    this[prop] = value;
                }
            }
        }

        console.log("[TEMPLATE] Initialising template: " + this.file);

        if (!retObj) {
            return this._render();
        } else {
            return this;
        }
    }

    getGuid() {
        console.log("returning guid:" + this.guid);
        return this.guid;
    }

    async _render() {
        console.log("[TEMPLATE] start rendering template: " + this.file);

        let compiledHTML;
        let content = this.file !== "" ? await this._loadFile() : this.html;

        if (this.file !== "" && this.html !== "") {
            console.warn("HTML is ignored because we also have a file. Give either a file or html to render!");
        }

        let compile = Handlebars.compile(content);
        let html = compile(this.data);

        if (!this.designMode) {
            compiledHTML = html;
        } else {
            compiledHTML = content;
        }

        compiledHTML = '<ms-ui-element tpl-guid="' + this.guid + '">' + compiledHTML + "</ms-ui-element>";

        if (this.target !== null) {
            let target = $(this.target);

            switch (this.method) {
                case "append":
                    target.append(compiledHTML);
                    break;

                case "prepend":
                    target.prepend(compiledHTML);
                    break;

                case "after":
                    target.after(compiledHTML);
                    break;

                case "return":
                    break;

                case "replace":
                    let obj = $(compiledHTML);
                    $("#" + obj.first().attr("id")).remove();
                    target.append(compiledHTML);
                    break;

                default:
                    target.html(compiledHTML);
                    break;
            }
        }

        console.log("[TEMPLATE] rendering template '" + this.file + "' has finished");

        this.renderedHTML = compiledHTML;

        this.isReady();

        return compiledHTML;
    }

    static remove(guid) {
        $("[tpl-guid='" + guid + "']").remove();
    }

    static getGuid(element) {
        let guid = element.closest("[tpl-guid]").attr("tpl-guid");
        return guid;
    }

    static DOMReady(guid, timeout = 3000, uielement = false) {
        return new Promise(function (resolve, reject) {
            let timer = 0;
            let interval = 10;

            let searchStr = "";

            if (uielement) {
                searchStr = "#" + guid;
            } else {
                searchStr = "[tpl-guid='" + guid + "']";
            }

            if ($(searchStr).length === 0) {
                let int = setInterval(function () {
                    if ($(searchStr).length === 0) {
                        timer = timer + interval;
                        if (timer >= timeout) {
                            clearInterval(int);
                            console.error("[TEMPLATE] REJECTING! Not found after time: " + timer);
                            reject("[TEMPLATE] Element " + guid + " not found.");
                        } else {
                            //console.log("[TEMPLATE] not found after "+timer+"ms". Trying again);
                        }
                    } else {
                        console.log("[TEMPLATE] " + guid + " ready after " + timer + "ms");
                        clearInterval(int);
                        resolve();
                    }
                }, interval);
            } else {
                console.log("[TEMPLATE] " + guid + " ready");
                resolve();
            }
        });
    }

    isReady(timeout = 3000) {
        let self = this;

        return new Promise((resolve, reject) => {
            let timer = 0;
            let interval = 10;

            if ($("[tpl-guid='" + this.guid + "']").length === 0) {
                let int = setInterval(() => {
                    if ($("[tpl-guid='" + this.guid + "']").length === 0) {
                        timer = timer + interval;
                        if (timer >= timeout) {
                            clearInterval(int);
                            console.error("[TEMPLATE] REJECTING! Not found after time: " + timer);
                            reject("[TEMPLATE] Element " + this.guid + " not found.");
                        } else {
                            //console.log("[TEMPLATE] "+self.guid+" not found after "+timer+"ms. Trying again");
                        }
                    } else {
                        console.log("[TEMPLATE] " + this.file + " was added to DOM after " + timer + "ms");
                        clearInterval(int);
                        resolve(true);
                    }
                }, interval);
            } else {
                console.log("[TEMPLATE] " + this.file + " was added to DOM instantly");
                resolve(true);
            }
        });
    }

    _triggerDomReady(jQElement) {
        jQElement.trigger("tpl-dom-inserted", [jQElement.attr("tpl-guid")]);
        console.log("[TEMPLATE] event: tpl-dom-inserted");
    }

    static getUniqueID() {
        let uid = Tools.GUID();

        if ($("[tpl-guid='" + uid + "']").length > 0) {
            Tools.GUID();
        } else {
            return uid;
        }
    }

    uniqueID() {
        let uid = Tools.GUID();

        if ($("[tpl-guid='" + uid + "']").length > 0) {
            this.uniqueID();
        } else {
            return uid;
        }
    }

    _generateRandom() {
        return Tools.GUID();
    }

    _loadFile() {
        return Template.loadFile(this.path, this.file);
    }

    static loadFile(path, file, extension = "") {
        console.log("[TEMPLATE] Loading file: " + file);

        return $.ajax({
            url: "" + path + "/" + file + extension,
            cache: false,
            success: function (data) {},
            error: function (e) {
                console.error("Error loading file: " + "" + path + "/" + file + extension);
                throw new Error(e);
            }
        });
    }
}

export { Template };
