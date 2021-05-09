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
        this.viewModelName = viewModelName || FrontController.HOMEPAGE;
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

        this.app = new App();
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

        console.log(FrontController.DEBUG_PREFIX);

        try {
            module = await import("/" + this._getViewModelPath());

            if (typeof module["default"]) return new module.default(this.params);
            if (typeof module[this.viewModelName]) return new module[this.viewModelName](this.params);
        } catch (e) {
            console.error(FrontController.DEBUG_PREFIX + FrontController.NOT_FOUND);
            console.error(e);
            this.app.navigation.router.navigate("#");
        }

        console.error(
            `[Frontcontroller] Can't load module "${this.viewModelName}". Either it doesn't provide a default export or the name is misspelled.
            Check the import header as well.`
        );

        return null;
    }

    _getViewModelPath() {
        let fileName = this.viewModelName.toLowerCase();
        let folder = `viewmodel/${fileName}`;
        let path = `${folder}/${fileName}.vm.js`;

        return path;
    }
}
