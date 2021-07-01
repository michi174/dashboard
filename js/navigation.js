import AppBarButton from "./appbar/appbarbutton.js";

class Navigation {
    constructor(debug = false, disableTransition = false) {
        console.log("-------------------");
        console.log("Navigation");
        console.log("-------------------");
        var self = this;

        this.debug = debug;
        this.useHashNavigation = true;
        this.router = !this.useHashNavigation
            ? new Navigo(window.location.protocol + "//" + window.location.host + "/")
            : new Navigo(null, true, "#");
        this.navHistory = new Array();
        this.mainView = ".main-view.active";
        this.subView = ".main-view:not(.active)";
        this.makeViewActive = ".toActive";
        this.transition = false;
        this.views = new Array();
        this.insert = false;
        this.disableTransition = disableTransition;
        this.viewReplacedWithCache = false;

        this.backBtn = new AppBarButton("back-icon", "#appbar-button-template", {
            icon: "fad fa-chevron-left",
            position: "left",
            order: 0
        });

        $(window).on("canRenderView", function () {
            if (self.viewReplacedWithCache) {
                self._debug("[Navigation] running viewModel's onLoad(), cached view found - no rendering needed.");
            } else {
                self._debug("[Navigation] start rendering, no cached view found");
            }

            self.router.resume();
            self.router.resolve();
            self.router.pause();
        });

        $("body").click(function () {
            self.saveScrollPosition();
        });

        $(window).on("navigation.start", function () {
            console.warn("[Navigation]navigation initiated");
        });

        this._listenHashChange();
    }

    start() {
        console.log("[Navigation] start() called");
        console.log("[Navigation] URL:" + this.getCurrentUrl());
        this.forceTransition("none");

        if (this.getCurrentUrl() === "") {
            console.log("[Navigation] No location set");
            this._addHistoryElement("");
            this._triggerCanRenderView();
            //$(window).trigger("hashchange");
        } else {
            this._unlistenHashChange();
            this._listenHashChange();
            this.navigate(this.getCurrentUrl());
            $(window).trigger("hashchange");
        }
    }

    getHistoryDepth() {
        return this.navHistory.length;
    }

    navigate(
        url,
        direction = "none",
        transition = "swipeHorizontal",
        caller = "function",
        insert = false,
        event = null
    ) {
        this.insert = insert;
        let self = this;
        let loadContent = true;

        //console.clear();

        transition = self.transition !== false ? self.transition : transition;

        if (caller === "function") {
            self.router.navigate(url, direction, transition, (caller = "function"), insert, event);
        } else {
            $(window).trigger("navigation.start");

            console.log("[Navigation] navigation.start");
            console.log("[Navigation] target URL is: " + url);
            console.log("[Navigation] caller is: " + caller);

            if (direction === "none") {
                console.log("[Navigation] requesting direction");
                direction = this._getNavDirection();
            }

            console.log("[Navigation] direction is: " + direction);

            if (direction !== "back") {
                if (this.navHistory.length > 0) {
                    console.log(
                        `[Navigation] here we have to save the current view content for ${
                            this.router.lastRouteResolved().url
                        }`
                    );
                    //console.log($(this.mainView).html());
                    console.log(
                        `[Navigation] updating viewcache for ${this.navHistory[this.navHistory.length - 1].url}`
                    );
                    this.navHistory[this.navHistory.length - 1].view = $(this.mainView).html();
                } else {
                    console.log(`[Navigation] We don't have a navHistory yet `);
                }
            } else {
                console.log(`[Navigation] We don't need to update viewcache, because we are navigating back`);
            }

            console.log(`[Navigation] Current navHistroy: `);
            console.log(this.navHistory);

            if (direction !== "back") {
                self._clearContent(self.subView);

                if (insert) {
                    $(this.subView).html($(this.mainView).html());
                }
            } else {
                this.insert = false;
                //self._clearContent(self.mainView);
            }

            $(".main-view").removeClass("collapsed");

            let hasTransition = false;

            if (!this.disableTransition) {
                switch (transition) {
                    case "swipeHorizontal":
                        hasTransition = true;
                        break;
                    case "none":
                        hasTransition = false;
                        break;
                    default:
                        hasTransition = false;
                        console.log("no transition found");
                        break;
                }
            }

            if (hasTransition) {
                console.log("navigation has a transition: " + transition);

                $(this.subView).css("overflow", "hidden");
                $(this.mainView).css("overflow", "hidden");

                let back = "";

                setTimeout(() => {
                    if (direction === "back") {
                        back = "reverse";
                    }

                    $(".main-view").removeClass(transition + "In");
                    $(".main-view").removeClass(transition + "Out");
                    $(".main-view").removeClass(back);

                    $(self.mainView).addClass(transition + "Out " + back);
                    $(self.subView).addClass(transition + "In " + back);

                    $(self.mainView).off("animationend");
                    $(self.subView).off("animationend");

                    $(self.mainView).on("animationend", function (event) {
                        if (event.target === event.currentTarget) {
                            self._switchActiveView();

                            $(".main-view").removeClass(transition + "In");
                            $(".main-view").removeClass(transition + "Out");
                            $(".main-view").removeClass(back);

                            $(self.subView).addClass("collapsed");
                            loadContent = self._replaceInactiveView(direction);

                            if (loadContent) {
                                self._triggerCanRenderView();
                            }
                        }
                    });
                }, 50);
            } else {
                self._switchActiveView();
                $(self.subView).addClass("collapsed");
                loadContent = self._replaceInactiveView(direction);

                if (loadContent) {
                    self._triggerCanRenderView();
                }
            }

            if (!loadContent) {
                console.log("[Navigation] using cached view");
            }

            self._unsetForcedTransition();

            if (direction !== "back") {
                this._addHistoryElement(url);
            }

            if (direction === "back") {
                this._destroyHistoryElement(this._findHistoryElement(this.getCurrentUrl()), true);
                this._addHistoryElement(url);
            }

            console.log("[Navigation] Historylength is: " + this.getFullHistory().length);
            this._triggerNavigationDone();
            console.log("-------------------");
        }
    }

    _clearContent(view) {
        $(view).empty();
    }

    _setCachedView(state) {
        console.log("[Navigation] cachedView set to " + state);
        this.viewReplacedWithCache = state;
    }

    _getNavDirection() {
        let self = this;
        let currentURL = this.getCurrentUrl();
        let navDirection = "none";
        let deletedKeys;
        let trigger = false;

        if (self.getFullHistory().length <= 1) {
            navDirection = "forward";
        } else {
            if (this.getFullHistory().length > 1) {
                console.log(this.getFullHistory());

                navDirection = "forward";

                if (this.navHistory[this.navHistory.length - 2].url === currentURL) {
                    navDirection = "back";
                }
            }
        }
        return navDirection;
    }

    forceTransition(transition) {
        this.transition = transition;
    }

    _unsetForcedTransition() {
        this.transition = false;
    }

    restoreScrollPosition(url = this.getCurrentUrl()) {
        //let element = this._findHistoryElement(url);
        //if (url !== "" && typeof element === "object") {
        //    $(window).scrollTop(element.scrollPosition.top);
        //    $(window).scrollLeft(element.scrollPosition.left);
        //}
    }

    saveScrollPosition(url = this.getCurrentUrl()) {
        //let element = this._findHistoryElement(url);
        //if (url !== "" && typeof element === "object") {
        //    element.scrollPosition.top = $(window).scrollTop();
        //    element.scrollPosition.left = $(window).scrollLeft();
        //    console.log("[Navigation] ScrollPosition saved");
        //    console.log(element);
        //}
    }

    getCurrentUrl() {
        return window.location.hash.substring(1);
    }

    getFullHistory() {
        return this.navHistory;
    }

    getHistoryObject(url) {
        return this._findHistoryElement(url);
    }

    viewReady(url) {
        let element = this._findHistoryElement(url);

        if (typeof element === "object") {
            //this._updateHistoryElementView(element);
        }
    }

    clearHistory() {
        this.navHistory = new Array();
        this._onHistoryUpdated();
    }

    _debug(message) {
        if (this.debug) {
            console.log(message);
        }
    }

    /*
     * If theres a back navigation, we have to restore the previous view.
     * @return boolean Use the cached view instead of rendering an existing view twice.
     */
    _replaceInactiveView(direction) {
        let dbg_msg = "";

        //setTimeout(() => {}, 100);

        if (direction === "back") {
            if (this.navHistory.length > 2) {
                let el = this.navHistory[this.navHistory.length - 3];
                console.log(
                    `[Navigation] we need to replace the content of the inactive view with the content of ${el.url}`
                );

                console.log(`[Navigation] our history length is ${this.navHistory.length}`);

                let content = el.view;

                //console.log(el.view);

                $(this.subView).html(content);
                //$(this.subView).scrollTop($(this.subView).attr("data-scroll"));
                console.log("[Navigation] we've replaced the last view");

                //TODO: return true, for using cached view.
                //But we need to fix the bug caching the wrong view for the history elements first.
                //We should chase a view right before we change it, so we don't distract the user
                //with wrong scroll positions if he decides to navigate backwards.
                this._setCachedView(true);

                return true;
            } else {
                console.log("no view available");
                //this._setCachedView(false);
                return true;
            }
        } else {
            this._setCachedView(false);
            console.log("[Navigation] direction in _replaceInactiveView is: " + direction);
            return true;
        }
    }

    _triggerNavigationDone() {
        console.log("[Navigation] navigation.done");
        $(window).trigger("navigation.done");
    }

    _triggerCanRenderView() {
        self = this;

        console.log("[Navigation] can_render_view");
        setTimeout(function () {
            $(self.subView).css("overflow", "scroll");
            $(self.mainView).css("overflow", "scroll");
            $(window).trigger("canRenderView");
        }, 100);
    }

    _switchActiveView() {
        $(this.subView).addClass("toActive");
        $(this.mainView).attr("data-scroll", $(this.mainView).scrollTop());
        $(this.mainView).removeClass("active");
        $(this.makeViewActive).addClass("active");
        $(this.makeViewActive).removeClass("toActive");
        //this.restoreScrollPosition();
    }

    //This is the actual navigation
    _listenHashChange() {
        let self = this;

        self._debug("[Navigation] eventlistener (hashchange) enabled");
        console.log(window.location);
        $(window).on("hashchange", function (event) {
            event.preventDefault();
            self._debug(
                "------------------------------------------------------------------------------------------------------------------"
            );
            self._debug("URL changed");
            self._debug("should navigate to:" + window.location.hash);
            self.navigate(window.location.hash.substring(1), "none", "swipeHorizontal", "listener", self.insert);
        });
    }

    _unlistenHashChange() {
        console.log("[Navigation] Eventlistener off");
        $(window).off("hashchange");
    }

    _onHistoryUpdated() {
        //console.error(typeof this.app.appBar === "object");
        //return 0;
        if (typeof app.appBar === "object") {
            if (this.getHistoryDepth() > 1) {
                app.appBar.addButton(this.backBtn);
                //console.error("Navigation add button");
                //console.log("history length: " + this.getHistoryDepth());
                //console.log(app);
            } else {
                app.appBar.removeButton(this.backBtn);
                //console.error("Navigation Remove button");
            }
        }
    }

    _addHistoryElement(url) {
        let element = new Object();
        element.url = url;
        element.view = "";
        element.scrollPosition = new Object();
        element.scrollPosition.top = $(window).scrollTop();
        element.scrollPosition.left = $(window).scrollLeft();
        element.transition = this.transition;

        //this._updateHistoryElementView(element, $(this.mainView).html());

        this.navHistory.push(element);
        console.log("[Navigation] Historyelement added: " + element.url);
        this._onHistoryUpdated();
    }

    async _updateHistoryElementView(element, nonsense = null) {
        return;
        let view = null;

        console.log(`[Navigation] element.view of ${element.url} is updating`);
        setTimeout(() => {
            view = $(".main-view.active").html();

            element.view = view;
            this.transition = element.transition;
            console.log(element);
            console.log(this.navHistory);
        }, 50);

        console.log(`[Navigation] element.view of ${element.url} has been updated`);
    }

    _destroyHistoryElement(historyElement, allAfterElement = false, reverse = false) {
        let index = -1;
        let deleteCount = 1;

        if (!reverse) {
            index = this.navHistory.findIndex(element => (element.url === historyElement.url ? true : false));
        } else {
            for (let [i, value] of this.navHistory.entries()) {
                if (value.url === historyElement.url) {
                    index = i;
                }
            }
        }

        if (index >= 0) {
            if (allAfterElement) {
                deleteCount = this.navHistory.length - index;
            }

            console.log("[Navigation] Historyelement deleted: " + this.navHistory[index].url);
            console.log("[Navigation] deleting: " + deleteCount + " elements");
            this.navHistory.splice(index, deleteCount);
        }
        this._onHistoryUpdated();
    }

    _findHistoryElement(url, reverse = true) {
        let index = -1;

        if (!reverse) {
            index = this.navHistory.findIndex(element => (element.url === url ? true : false));
        } else {
            for (let [i, value] of this.navHistory.entries()) {
                if (value.url === url) {
                    index = i;
                }
            }
        }

        if (index >= 0) {
            console.log("[Navigation] Historyelement " + this.navHistory[index].url + " found index: " + index);
            return this.navHistory[index];
        } else {
            console.log("ERROR: [Navigation] Historyelement " + url + " not found!");
            return false;
        }
    }

    getViewName() {
        let url = this.router.lastRouteResolved().url;
        if (!this.useHashNavigation) {
            url = url.substring(1);
        }

        let view = url.split("/");
        let res;

        res = view.filter(item => item !== "");

        if (res.length > 0) {
            return res[0];
        } else {
            return "";
        }
    }

    getAction() {
        let params = this.getParams();
        return params.action || "";
    }

    getQuery() {
        let query = this.router.lastRouteResolved().query;
        return query;
    }

    getParams() {
        let url = this.router.lastRouteResolved().url;

        if (!this.useHashNavigation) {
            url = url.substring(1);
        }
        let urlParamsArray = url.split("/");
        urlParamsArray = urlParamsArray.filter(item => item !== "");

        urlParamsArray.shift();

        let query = this.getQuery();

        if (urlParamsArray[urlParamsArray.length - 1] === "") {
            urlParamsArray.pop();
        }

        let queryParamsArray = query.split("&");
        let queryParamsObject = new Object();
        queryParamsObject.__param = new Array();

        if (urlParamsArray.length > 0) {
            queryParamsObject.__param = urlParamsArray;
        }

        if (queryParamsArray.length > 0) {
            queryParamsArray.forEach(function (value) {
                if (value !== "") {
                    if (value.split("=").length > 1) {
                        let prop = value.split("=")[0];
                        let val = value.split("=")[1];
                        queryParamsObject[prop] = val;
                    } else {
                        queryParamsObject.__param.push(value.split("=")[0]);
                    }
                }
            });
        }

        return queryParamsObject;
    }
}

export { Navigation };
