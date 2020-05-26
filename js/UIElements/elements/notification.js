import UIElement from "../uielement.js";
import UIManager from "../uimanager.js";

export default class Notification extends UIElement {
    constructor(options) {
        options.template = "notification.handlebars";
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

export { Notification };
