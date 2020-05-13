import { UIElement } from "./uielement.js";
import UIManager from "./uimanager.js";

export class FlyOut extends UIElement {
    constructor(options) {
        options.template = "flyout.handlebars";
        super(options);
    }
}

(function closeChilds() {
    $("body").on("click", ".ms-flyout.isOpen", function () {
        let elements = $(this).parent().parent().find(".ms-flyout.isOpen");
        let clickedElement = $(this);
        let clickedElementIndex = elements.index(clickedElement);

        let el = elements.slice(clickedElementIndex + 1);

        let uim = new UIManager();

        let deleteElements = el.get().reverse();

        for (let i = 0; i < deleteElements.length; i++) {
            console.log();
            let uid = $($(deleteElements[i])).attr("id");
            uim.remove(uid);
        }
    });
})();

(function closeAll() {
    $("body").on("click", function (event) {
        if (!$(event.target).closest(".ms-flyout.isOpen").length) {
            let elements = $(".ms-flyout.isOpen");
            let uim = new UIManager();

            for (let [index, element] of Object.entries(elements)) {
                let uid = $(element).attr("id");
                uim.remove(uid);
            }
        }
    });
})();
