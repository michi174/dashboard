import Template from "./template.js";
import UIManager from "./uielements/uimanager.js";
import FrontController from "./frontcontroller/frontcontroller.js";
import App from "../js/app.js";
import Helpers from "./helpers.js";
import Route from "./route/route.js";

//import _ from 'lodash';

const prodHost = "https://lolstatistics-app.herokuapp.com/";
const devHost = "http://blogapi.localhost:8080/";

document.documentElement.classList.add("light");

var apiHost = "";
var devMode = false;
var locale = "de_DE";
var views = new Array();
var mobile = false;

const app = new App();
const templateFolder = "view";
const viewModelFolder = "viewmodel";
const navigation = app.navigation;
const ui = new UIManager();

window.app = app;

app.apiHost = devHost;

const ro = new ResizeObserver(entries => {
    for (let entry of entries) {
        const cr = entry.contentRect;
        const jQElement = $(entry.target);

        (function setNavbar() {
            if (jQElement.outerHeight() > jQElement.outerWidth()) {
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-position", "topright");
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-open-direction", "x");

                mobile = false;
            } else {
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-position", "topleft");
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-open-direction", "y");
                mobile = true;
            }
        })();
    }
});

let navbar = $("#bot-navigation-wr");

ro.observe(navbar[0]);

async function init() {
    try {
        navigation.router.hooks({
            before: function (done, params) {
                setDevSettings();
                hideAllModals();
                $(".remove-on-nav").remove();
                $(".overlay").hide();

                done();
            },
            after: function (params) {
                //titleBar.addButton(devModeBtn);
            }
        });
        //initiate the App
        //do everything inside here before we start sending the navigation trigger and rendering a view.
    } catch (e) {
        let message = "Sorry, something went wrong.<br><br>";

        message += "It seems, there's no connection to our servers. Please check your connection.<br><br>";

        if (devMode) {
            message += "This app is in development mode.<br>Try switching to production mode could help.";
        }
        $("#app-status").html(message);

        throw new Error(e);
    }
}

//Starting the app
init().then(function () {
    try {
        startApp();
    } catch (e) {
        throw new Error(e);
    }
});

function startApp() {
    console.log("APP started");

    /*
     * _____________________________________________________________
     * VIEW AND NAVIGATION
     * -------------------------------------------------------------
     * Navigate through your app and render the views
     * _____________________________________________________________
     */

    /*
     * When navigated to the homepage.
     */

    navigation.router.on("*", async function () {
        let viewName = navigation.getViewName();
        let params = navigation.getParams();
        let action = navigation.getAction();

        //app.setRoute(new Route("uitests", "cms", "article", "article", "cms"));
        //                      name,       target,     viewmodel, view,        folder
        app.setRoute(new Route("newarticle", "newarticle", "article", "article", "cms"));

        new FrontController(viewName, action, app.navigation.viewReplacedWithCache, params);
        switchActiveCSS($("#bot-navigation-wr > .tab"), $("#bot-nav-home"), "active");
        $(window).trigger("viewReady");
    });

    navigation.start();
}

/*
 * _____________________________________________________________
 * DATA CONTEXT
 * -------------------------------------------------------------
 * Generates all the data your views need.
 * _____________________________________________________________
 */

/*
 * _____________________________________________________________
 * DATA FUNCTION
 * -------------------------------------------------------------
 * All the data you need.
 * Make sure everything you add is asyncronious.
 * _____________________________________________________________
 */

/*
 * Gets the JSON of an API Endpoint
 */
async function getJson(url) {
    try {
        let result = await fetch(url);

        if (!result.ok) {
            throw new Error(result.status + " - " + result.statusText);
        }
        console.log("fetching URL: " + url);
        let data = await result.json();

        return data;
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }
}

/*
 * _____________________________________________________________
 * HELPER FUNCTION
 * -------------------------------------------------------------
 * In this section, some useful function are proivided.
 * Feel free to add some more.
 * _____________________________________________________________
 */

//DEVELOPER

function loadTemplate(filename) {
    var source;
    var template;

    console.log("Loading template: " + filename);

    return $.ajax({
        url: templateFolder + "/" + filename,
        cache: false,
        success: function (data) {
            console.log(data);
        }
    });
}

function executeFunctionByName(functionName, context /*, args */) {
    var args = Array.prototype.slice.call(arguments, 2);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    for (var i = 0; i < namespaces.length; i++) {
        context = context[namespaces[i]];
    }
    return context[func].apply(context, args);
}

function saveScrollPosition(element = null) {
    let scrollObject = new Object();

    if (element === null) {
        element = $(window);
    } else {
        element = $(element);
    }

    let url = navigation.router.lastRouteResolved() !== null ? navigation.router.lastRouteResolved().url : "index";

    if (typeof element !== "undefined" && url !== "") {
        scrollObject.url = url;
        scrollObject.scrollPosTop = element.scrollTop();
        scrollObject.scrollPosLeft = element.scrollLeft();

        let index = views.findIndex(needle => needle.url === scrollObject.url);

        if (index > -1) {
            views[index] = scrollObject;
        } else {
            views.unshift(scrollObject);
        }
    }
}

function restoreScrollPosition(element = null, url) {
    if (element === null) {
        element = $(window);
    } else {
        element = $(element);
    }

    if (typeof element !== "undefined" && url !== "" && url !== null) {
        let index = views.findIndex(needle => needle.url === url);

        if (index > -1) {
            element.scrollLeft(views[index].scrollPosLeft);
            element.scrollTop(views[index].scrollPosTop);
        }
    }
}

function getViewportValues() {
    let url = navigation.router.lastRouteResolved() !== null ? navigation.router.lastRouteResolved().url : "index";
    console.groupCollapsed("Viewport");
    console.log("current view: " + url);
    console.log("window width: " + $(window).width());
    console.log("window height: " + $(window).height());
    console.log("window scrollTop: " + $(navigation.mainView).scrollTop());
    console.log("window scrollLeft: " + $(navigation.mainView).scrollLeft());
    console.groupEnd();
}

function setDevSettings() {
    //titleBar.addButton(devModeBtn);

    if (devMode) {
        apiHost = devHost;
        $("#devmode-icon").removeClass("active");
    } else {
        apiHost = prodHost;
        $("#devmode-icon").addClass("active");
    }

    console.log("DevMode is " + devMode);
}

function toggleDevMode() {
    if (devMode) {
        devMode = false;
    } else {
        devMode = true;
    }

    setDevSettings();
    init().then(function () {
        startApp();
    });
}

function checkLocalStorage() {
    try {
        localStorage.setItem("test", "test");
        localStorage.getItem("test");
        localStorage.removeItem("test");
        console.log("localStorage is available");
        return true;
    } catch (e) {
        console.warn("localStorage not available");
        return false;
    }
}

function toggleOverlay() {
    if ($(".modal").hasClass("visible")) {
        $(".overlay").show();
    } else {
        $(".overlay").hide();
    }
}

function toggleModal(modal) {
    $(modal).toggleClass("visible");
    toggleOverlay();
}

/*
 * Returns an Object of the Participiant Match Data
 */

function switchActiveCSS(jqItems, activeJqItem, cssClass) {
    jqItems.each(function (index, jqItem) {
        $(this).removeClass(cssClass);
    });
    activeJqItem.addClass(cssClass);
}

function hideAllModals() {
    $(".modal").removeClass("visible");
    toggleOverlay();
}

Handlebars.registerHelper("LoadTemplate", function (template, params, customFolder = "", obj) {
    let random1 = (Math.random() * Math.floor(1000000)).toFixed(0);
    let random2 = (Math.random() * Math.floor(1000000)).toFixed(0);
    let identifier = random1 + "_" + template + "_" + random2;
    let token = `
    <div id="${identifier}">
        <div class="lds-ring small">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>`;
    let _html = token;

    let _customFolder = "";
    let version = "";

    if (typeof customFolder !== "object") {
        _customFolder = "/" + customFolder;
    }

    let path = "../" + viewModelFolder + _customFolder + "/" + template + ".js?" + version;
    //console.log("/" + customFolder);

    //console.log(path);

    if (typeof template !== "undefined") {
        import(path)
            .then(function (result) {
                let mod = result;

                let obj = new mod[template](params);

                let ctx = obj.getContext();

                //wait for the context to load, then start the template rendering.
                ctx.then(function (context) {
                    let html = new Template({
                        path: templateFolder + _customFolder,
                        file: template + ".handlebars",
                        data: context,
                        method: "return"
                        //wait for the template to be rendered and placed in DOM Tree, then replace the token with the actual content.
                    })
                        .then(function (result) {
                            let newElem = $(result);

                            $("#" + identifier).replaceWith(newElem[0].outerHTML);
                            let guid = newElem.attr("tpl-guid");

                            let timer = 0;
                            let step = 10;
                            let timeOut = 3000;

                            let interval = setInterval(function () {
                                if ($("[tpl-guid='" + guid + "']").length > 0) {
                                    clearInterval(interval);
                                    $("[tpl-guid='" + guid + "']").trigger("ms.tpl.content.added");
                                } else {
                                    timer += step;
                                    if (timer >= timeOut) {
                                        clearInterval(interval);
                                        console.warn("can't replace inline template");
                                    }
                                }
                            }, step);
                        })
                        .catch(function (e) {});
                });
                //console.log(templateFolder+"/"+template+".handlebars");
            })
            .catch(function (e) {
                console.warn(`Can't fetch the requested viewModel ${template}`);
                console.warn(e);
            });
        return new Handlebars.SafeString(_html);
    }
});

Handlebars.registerHelper("limit", function (context, start, num, obj) {
    console.log(context);
    console.log(start);
    console.log(num);

    if (start > 0) {
        context.splice(0, start - 1);
    }

    context.splice(num, context.length - num);

    console.log(context);

    return context;
});

Handlebars.registerHelper("dateToMoment", function (date) {
    return moment(date).fromNow();
});

Handlebars.registerHelper("dateFormat", function (date, format = "LL") {
    return moment(date).format(format);
});

Handlebars.registerHelper("UserIdToName", function (id) {
    helper = new Helpers();
    helper
        .getJson(app.apiHost + "v1/user/byid/" + id)
        .then(function (result) {
            let userdata = result;
        })
        .catch(function (e) {
            console.error(e);
        });
});

Handlebars.registerHelper("eachWithLimit", function (context, start, num, options) {
    let fn = options.fn;
    let ret = "";
    for (let i = 0, j = context.length; i < j; i++) {
        if (i >= start) {
            if (num - 1 >= i) {
                ret = ret + options.fn(context[i]);
            }
        }
    }
    return ret;
});

/*
 * _____________________________________________________________
 * GLOBAL EVENTS
 * -------------------------------------------------------------
 * In this section the global events are present. You can not access events here which are generated dynamicly
 * by the template engine. In case you need to register an event for the latter, just register it after compiling the template.
 * _____________________________________________________________
 */

$("body").on("click", "#back-icon", function () {
    history.back();
});

$("body").on("click", "#search-icon", function () {
    $("#search-wr").toggleClass("visible");
});

$("#close-search-icon").click(function () {
    $("#search-wr").toggleClass("visible");
});

$(".main-view.active").on("keypress", "#home-search-summoner-name", function (e) {
    let key = e.which;
    if (key === 13) {
        $("#home-search-btn").click();
        return false;
    }
});

$("#bot-navigation-wr .tab:not(.no-view)").click(function () {
    switchActiveCSS($("#bot-navigation-wr .tab:not(.no-view)"), $(this), "active");
    $(".modal").removeClass("visible");
    $(".overlay").hide();
});

$("body").on("click", ".overlay, .nav-tooltip", function () {
    $(".overlay").hide();
    $(".modal").removeClass("visible");

    if ($(".nav-tooltip").length > 0) {
        history.back();
    }
});

$("body").on("click", "#devmode-icon", function () {
    toggleDevMode();
});

$("body").on("click", "#dev-init-btn", async function () {
    $("#app-status").html("loading...");
    setTimeout(function () {
        init().then(function () {
            navigation.clearHistory();
            startApp();
        });
    }, 500);
});

$("html").on("touchstart", function () {
    $("html").removeClass("no-touch");
});

$("html").on("mouseenter", function () {
    $("html").addClass("no-touch");
});

/*     $('body').click(function () {
        getViewportValues();
        saveScrollPosition();
    }); */

$(window).on("viewReady", function () {
    restoreScrollPosition(null, navigation.router.lastRouteResolved().url);
    navigation.viewReady(navigation.getCurrentUrl());
});
