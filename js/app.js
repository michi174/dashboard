import AppBar from "../js/appbar/appbar.js";
import AppBarButton from "../js/appbar/appbarbutton.js";
import { Navigation } from "./navigation.js";

export default class App {
    constructor() {
        const instance = this.constructor.instance;

        if (instance) {
            console.log("[APP] Already has a instance of APP. Returning instance");
            return instance;
        }
        console.log("[APP] New app instance has been created");

        this.sessionCache;
        this.cache;
        this.navigation;
        this.apiHost;

        this.appName = "Dashboard";
        this.title = "Dashboard";

        this.appBar = new AppBar("#appbar-template");

        this.init();

        this.constructor.instance = this;
    }

    init() {
        this.appBar.reset();
        this.appBar.setTheme("dark");
        this.appBar.setTitle("Dashboards");
        this.createButtons();
        this.navigation = new Navigation(true, true);
    }

    setTitle($title) {
        this.appBar.setTitle($title);
    }

    createButtons() {
        //TitleBar Buttons
        let searchBtn = new AppBarButton("search-icon", "#appbar-button-template", {
            icon: "far fa-search",
            position: "right",
            order: 0
        });

        let devModeBtn = new AppBarButton("devmode-icon", "#appbar-button-template", {
            icon: "far fa-file-code",
            position: "left",
            order: 1
        });

        this.appBar.addButton(searchBtn);
    }
}
