import Template from "../../template.js";
import UIElement from "../uielement.js";
import UIManager from "../uimanager.js";

export default class Notification extends UIElement {
    constructor(options) {
        options.template = "notification.handlebars";
        options.attach = false;

        console.log(options.autoClose);

        if (
            options.autoClose === false ||
            options.autoClose === "" ||
            options.autoClose === "undefined" ||
            !options.hasOwnProperty("autoClose")
        ) {
            options.autoClose = 3000;
        }

        super(options);

        if (this.autoClose !== 0 || this.autoClose === false) {
            this._autoClose(this.autoClose);
        }

        this._reorder();
    }

    _autoClose(timeout) {
        setTimeout(() => {
            new UIManager().remove(this.id);
        }, timeout);

        Template.DOMReady(this.id, 3000, true).then(() => {
            $("#" + this.id + " .ms-notification-loading-bar").css("animation-duration", timeout + "ms");
        });
    }

    _reorder() {
        Template.DOMReady(this.id, 3000, true).then(() => {
            let $notifications = $(".ms-notification");
            let loop = 0;

            if ($notifications.length > 1) {
                for (let i = $notifications.length; i > 0; i--) {
                    let index = i - 1;
                    let $elem = $($notifications[index]);
                    $elem.css("bottom", $elem.outerHeight(true) * loop);
                    loop++;
                }
            }
        });
    }
}

(function close() {
    $("body").on("click", ".ms-ui-close-btn", function () {
        let uid = $(this).attr("ms-ui-referer");
        new UIManager().remove(uid);
    });
})();

export { Notification };
