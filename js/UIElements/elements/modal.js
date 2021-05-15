import UIElement from "../uielement.js";
import UIManager from "../uimanager.js";

export default class Modal extends UIElement {
    constructor(options) {
        options.template = "modal.handlebars";
        options.attach = false;

        super(options);
    }
}

(function close() {
    $("body").on("click", ".ms-ui-close-btn", function () {
        let uid = $(this).attr("ms-ui-referer");
        new UIManager().remove(uid);
    });
})();

export { Modal };
