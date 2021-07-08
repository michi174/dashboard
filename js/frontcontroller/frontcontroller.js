import App from "../app.js";

export default class FrontController {
    static get DEBUG_PREFIX() {
        return "[Frontcontroller] ";
    }
    static get HOMEPAGE() {
        return "Homepage";
    }
    static get DEFAULT_ACTION() {
        return "default";
    }
    static set HOMEPAGE(value) {
        throw new Error(`can't set value (${value}) of private property HOMEPAGE`);
    }
    static get NOT_FOUND() {
        return "404_notfound";
    }
    static get ERROR() {
        return "500_error";
    }

    constructor(
        viewModelName,
        action = "",
        onlyViewModel = false,
        params = ({
            __param: []
        } = {})
    ) {
        this.app = new App();
        this.manualRoute = false;
        this.route;

        let vmName = null;

        if (viewModelName) {
            vmName = this.app.getRoute(viewModelName);
        }
        //console.error("vmR: " + vmName.target);
        //console.error("vmN: " + viewModelName);

        if (vmName !== null && typeof vmName != "undefined") {
            this.route = vmName;
            this.viewModelName = vmName.viewmodel;
            console.log(
                "[FrontController] manual routing from " + viewModelName + " to " + this.viewModelName + " initiated"
            );
            this.manualRoute = true;
        } else {
            this.viewModelName = viewModelName || FrontController.HOMEPAGE;
            console.log("[FrontController] no manual routes found");
            this.manualRoute = false;
        }

        this.action = action || FrontController.DEFAULT_ACTION;
        this.params = params;
        this.onlyViewModel = onlyViewModel;

        if (!viewModelName) {
            console.log(
                "[FrontController] got no ViewModel as parameter, using the default one: " + FrontController.HOMEPAGE
            );
        } else {
            console.log("[FrontController] using the given ViewModel " + viewModelName);
        }

        Object.defineProperty(this, "test", {
            value: "testVal",
            writeable: false
        });

        try {
            this.run();
        } catch (e) {
            console.error(e);
        }
    }

    async run() {
        //load the VM
        let viewModel = await this._loadViewModel();

        console.log(viewModel);

        await viewModel.onLoad();

        if (!this.onlyViewModel) {
            //if the VM has the requested action, run it
            if (typeof viewModel[this.action] !== "function") {
                this.action = FrontController.DEFAULT_ACTION;
                console.warn(
                    FrontController.DEBUG_PREFIX + "invalid action. running the default action for this viewmodel"
                );
            }

            await viewModel[this.action]();
            await viewModel.ready();
        }
    }

    async _loadViewModel() {
        let module;
        module = await import("/" + this._getViewModelPath());

        if (typeof module["default"]) return new module.default(this.params);
        if (typeof module[this.viewModelName]) return new module[this.viewModelName](this.params);

        // try {
        //     module = await import("/" + this._getViewModelPath());

        //     if (typeof module["default"]) return new module.default(this.params);
        //     if (typeof module[this.viewModelName]) return new module[this.viewModelName](this.params);
        // } catch (e) {
        //     console.error(FrontController.DEBUG_PREFIX + FrontController.NOT_FOUND);
        //     console.error(e);
        //     this.app.navigation.router.navigate("#");
        // }

        console.error(
            `[Frontcontroller] Can't load module "${this.viewModelName}". Either it doesn't provide a default export or the name is misspelled.
            Check the import header as well.`
        );

        return null;
    }

    _getViewModelPath() {
        let path, fileName, folder, version;

        version = new App().getVersion();

        if (!this.manualRoute) {
            fileName = this.viewModelName.toLowerCase();
            folder = `viewmodel/${fileName}`;
            console.log(FrontController.DEBUG_PREFIX + version);
            path = `${folder}/${fileName}.vm.js?${version}`;
        } else {
            let routeObj = this.route;
            fileName = routeObj.viewmodel.toLowerCase();
            folder = `viewmodel/${routeObj.folderPath}`;
            path = `${folder}/${fileName}.vm.js?${version}`;
        }
        console.log(path);
        return path;
    }
}
