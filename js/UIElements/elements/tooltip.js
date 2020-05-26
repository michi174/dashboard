import UIElement from "../uielement.js";
import UIManager from "../uimanager.js";

export default class Tooltip extends UIElement {
    constructor(options) {
        options.template = "tooltip.handlebars";
        super(options);
    }
}

(function close() {
    $("body").on("click", ".ms-tooltip.isOpen", function () {
        let uid = $(this).attr("id");
        new UIManager().remove(uid);
    });
})();

(function closeAll() {
    $("body").on("click", function () {
        let elements = $(".ms-tooltip.isOpen");
        let uim = new UIManager();
        //console.log(elements);

        for (let [index, element] of Object.entries(elements)) {
            let uid = $(element).attr("id");
            uim.remove(uid);
        }
    });
})();

export { Tooltip };
