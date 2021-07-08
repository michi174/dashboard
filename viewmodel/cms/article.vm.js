import BaseView from "../../js/view/baseview.js";
import HTML from "../../js/view/html.js";
import ViewModel from "../../js/viewmodel/viewmodel.js";

export default class Article extends ViewModel {
    constructor(params) {
        super(params);
        this.app.setTitle("New Article");
        this.options;

        let view = new HTML();
        view.setTemplateFile(this.constructor.name.toLowerCase());
        view.setTemplatePath(`${BaseView.DEFAULT_VIEW_PATH}/cms`);

        this.setView(view);
    }

    async default() {}

    async onLoad() {}
}
