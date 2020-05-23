class Navigation {
    constructor(debug = false, disableTransition = false) {
        this._debug("-------------------");
        this._debug("Navigation");
        this._debug("-------------------");
        var self = this;

        this.debug = debug;
        this.router = new Navigo(null, true, "#");
        this.navHistory = new Array();
        this.mainView = ".main-view.active";
        this.subView = ".main-view:not(.active)";
        this.makeViewActive = ".toActive";
        this.transition = false;
        this.views = new Array();
        this.insert = false;

        this.disableTransition = disableTransition;

        $(window).on("canRenderView", function () {
            self._debug("Navigation: start rendering");
            self.router.resume();
            self.router.resolve(self.getCurrentUrl());
            self.router.pause();
        });

        $("body").click(function () {
            self.saveScrollPosition();
        });

        $(window).on("navigation.start", function () {
            console.warn("navigation initiated");
        });

        this._listenHashChange();
    }

    start() {
        this._debug("Navigation: start() called");
        this._debug("Navigation: URL:" + this.getCurrentUrl());
        this.forceTransition("none");

        if (this.getCurrentUrl() === "") {
            this._debug("Navigation: No location set");
            this._triggerCanRenderView();
            //$(window).trigger("hashchange");
        } else {
            this._unlistenHashChange();
            this._listenHashChange();
            this.navigate(this.getCurrentUrl());
            $(window).trigger("hashchange");
        }
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

            this._debug("Navigation: navigation.start");
            this._debug("Navigation: target URL is: " + url);
            this._debug("Navigation: caller is: " + caller);

            if (direction === "none") {
                this._debug("Navigation: requesting direction");
                direction = this._getNavDirection();
            }

            this._debug("Navigation: direction is: " + direction);

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
                        this._debug("no transition found");
                        break;
                }
            }

            if (hasTransition) {
                this._debug("navigation has a transition: " + transition);

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
                self._debug("Navigation: using cached view");
            }

            self._unsetForcedTransition();

            this._addHistoryElement(url);

            if (direction === "back") {
                this._destroyHistoryElement(this._findHistoryElement(this.getCurrentUrl()), true);
                this._addHistoryElement(url);
            }

            this._debug("Navigation: Historylength is: " + this.getFullHistory().length);
            this._triggerNavigationDone();
            this._debug("-------------------");
        }
    }

    _clearContent(view) {
        $(view).empty();
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
                this._debug(this.getFullHistory());

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
        //    this._debug("Navigation: ScrollPosition saved");
        //    this._debug(element);
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
            this._updateHistoryElementView(element);
        }
    }

    clearHistory() {
        this.navHistory = new Array();
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

        if (direction === "back") {
            if (this.navHistory.length > 1) {
                let el = this.navHistory[this.navHistory.length - 2];
                let content = el.view;

                if (content !== "") {
                    $(this.subView).html(content);
                    //$(this.subView).scrollTop($(this.subView).attr("data-scroll"));
                    this._debug("Navigation: we've replaced the last view");

                    return true; //TODO: return false, for using cached view. But fix the AppBar Bug first.
                } else {
                    return true;
                }
            } else {
                this._debug("no view available");
                return true;
            }
        } else {
            this._debug("Navigation: direction in _replaceInactiveView is: " + direction);
            return true;
        }
    }

    _triggerNavigationDone() {
        this._debug("Navigation: navigation.done");
        $(window).trigger("navigation.done");
    }

    _triggerCanRenderView() {
        self = this;

        self._debug("Navigation: can_render_view");
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

        self._debug("Navigation: eventlistener (hashchange) enabled");
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
        this._debug("Navigation: Eventlistener off");
        $(window).off("hashchange");
    }

    _addHistoryElement(url) {
        let element = new Object();
        element.url = url;
        element.view = null;
        element.scrollPosition = new Object();
        element.scrollPosition.top = $(window).scrollTop();
        element.scrollPosition.left = $(window).scrollLeft();
        element.transition = this.transition;

        this._updateHistoryElementView(element, $(this.mainView).html());

        this.navHistory.push(element);
        this._debug("Navigation: Historyelement added: " + element.url);
    }

    _updateHistoryElementView(element, nonsense = null) {
        let view = null;
        this._debug("Navigation: element.view has been updated");

        console.warn("updated Element");

        setTimeout(() => {
            view = $(".main-view.active").html();

            element.view = view;
            this.transition = element.transition;
            this._debug(element);
            this._debug(this.navHistory);
        }, 50);
    }

    _destroyHistoryElement(historyElement, allAfterElement = false, reverse = false) {
        let index = -1;
        let deleteCount = 1;

        if (!reverse) {
            index = this.navHistory.findIndex((element) => (element.url === historyElement.url ? true : false));
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

            this._debug("Navigation: Historyelement deleted: " + this.navHistory[index].url);
            this._debug("Navigation: deleting: " + deleteCount + " elements");
            this.navHistory.splice(index, deleteCount);
        }
    }

    _findHistoryElement(url, reverse = true) {
        let index = -1;

        if (!reverse) {
            index = this.navHistory.findIndex((element) => (element.url === url ? true : false));
        } else {
            for (let [i, value] of this.navHistory.entries()) {
                if (value.url === url) {
                    index = i;
                }
            }
        }

        if (index >= 0) {
            this._debug("Navigation: Historyelement " + this.navHistory[index].url + " found index: " + index);
            return this.navHistory[index];
        } else {
            this._debug("ERROR: Navigation: Historyelement " + url + " not found!");
            return false;
        }
    }

    getViewName() {
        let url = this.router.lastRouteResolved().url;
        let view = url.split("/")[0];

        return view;
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
        let urlParamsArray = url.split("/");
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
                if (value.split("=").length > 1) {
                    let prop = value.split("=")[0];
                    let val = value.split("=")[1];
                    queryParamsObject[prop] = val;
                } else {
                    queryParamsObject.__param.push(value.split("=")[0]);
                }
            });
        }

        return queryParamsObject;
    }
}

export { Navigation };
