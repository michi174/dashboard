import UIElement from "../uielement.js";
import UIManager from "../uimanager.js";

export default class Modal extends UIElement {
    constructor(options) {
        options.template = "modal.handlebars";
        options.attach = false;

        super(options);
    }
}

(function closeModal() {
    $("body").on("click", ".ms-modal-close-btn", function () {
        let uid = $(this).attr("ms-ui-referer");
        new UIManager().remove(uid);
    });
})();
export { Modal };
