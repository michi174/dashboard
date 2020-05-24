import BaseView from "./baseview.js";
import HandleBars from "./renderer/handlebars.js";

export default class HTML extends BaseView {
    constructor() {
        super();
        this.setRenderer(new HandleBars());
    }
}
