import { MyCache } from "./cache.js";
import { Navigation } from "./navigation.js";
import { Template } from "./template.js";
import UIManager from "./UIElements/uimanager.js";
import AppBar from "./Appbar/appbar.js";
import AppBarButton from "./Appbar/appbarbutton.js";
import { Tooltip } from "./UIElements/tooltip.js";
import { Notification } from "./UIElements/notification.js";

//import _ from 'lodash';

const prodHost = "https://lolstatistics-app.herokuapp.com/";
const devHost = "http://michi-pc/API/riot_api_dev/";

var apiHost = "";
var devMode = false;
var locale = "de_DE";
var views = new Array();
var mobile = false;

const templateFolder = "view";
const viewModelFolder = "viewmodel";
const navigation = new Navigation(true, true);
const ui = new UIManager();
const titleBar = new AppBar("#appbar-template");

//TitleBar Buttons
const searchBtn = new AppBarButton("search-icon", "#appbar-button-template", {
    icon: "far fa-search",
    position: "right",
    order: 0,
});
const backBtn = new AppBarButton("back-icon", "#appbar-button-template", {
    icon: "far fa-chevron-left",
    position: "left",
    order: 0,
});
const devModeBtn = new AppBarButton("devmode-icon", "#appbar-button-template", {
    icon: "far fa-file-code",
    position: "left",
    order: 1,
});

const ro = new ResizeObserver((entries) => {
    for (let entry of entries) {
        const cr = entry.contentRect;
        const jQElement = $(entry.target);

        (function setNavbar() {
            if (jQElement.outerHeight() > jQElement.outerWidth()) {
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-position", "right");
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-open-direction", "x");

                mobile = false;
            } else {
                $("#bot-navigation-wr > [ms-uielement]").attr("ms-uielement-position", "top");
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
            },
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
        let testNotification = new Notification({
            content: "testTT",
            data: { content: "testNotification" },
            attach: false,
        });

        let homepage = new Template({
            file: "homepage.handlebars",
            path: "view",
            target: ".main-view.active",
        });

        titleBar.reset();
        titleBar.addButton(searchBtn);
        titleBar.addTheme("dark");
        titleBar.setTitle("Dashboard");
        switchActiveCSS($("#bot-navigation-wr > .tab"), $("#bot-nav-home"), "active");
        // titleBar.addButton(backBtn);

        $(window).trigger("viewReady");
    });

    navigation.router.on("summoner/:name/:region", async function (params) {
        let sum_name = params.name.replace(/ /g, "");
        let region = params.region.toLowerCase();

        titleBar.reset();
        titleBar.addButton(backBtn);
        titleBar.addButton(searchBtn);

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
        },
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

        let index = views.findIndex((needle) => needle.url === scrollObject.url);

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
        let index = views.findIndex((needle) => needle.url === url);

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

Handlebars.registerHelper("LoadTemplate", function (template, params) {
    let random1 = (Math.random() * Math.floor(1000000)).toFixed(0);
    let random2 = (Math.random() * Math.floor(1000000)).toFixed(0);
    let identifier = random1 + "_" + template + "_" + random2;
    let token = '<div id="' + identifier + '"></div>';
    let _html = token;

    if (typeof template !== "undefined") {
        import("../" + viewModelFolder + "/" + template + ".js")
            .then(function (result) {
                let mod = result;
                let obj = new mod[template](params);
                let ctx = obj.getContext();

                //wait for the context to load, then start the template rendering.
                ctx.then(function (context) {
                    let html = new Template({
                        path: templateFolder,
                        file: template + ".handlebars",
                        data: context,
                        method: "return",
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
