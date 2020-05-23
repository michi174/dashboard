export default class FrontController {
    static get DEBUG_PREFIX() {
        return "[Frontcontroller] ";
    }
    static get HOMEPAGE() {
        return "Homepage";
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
        params = ({
            __param: [],
        } = {})
    ) {
        this.viewModelName = viewModelName || FrontController.HOMEPAGE;
        this.action = action;
        this.params = params;

        console.log(FrontController.DEBUG_PREFIX + this._getViewModelPath());
        console.log(this._loadViewModel());
    }

    async _loadViewModel() {
        let self = this;
        let state = "error";

        let module, viewModelObject;

        console.log(FrontController.DEBUG_PREFIX);

        try {
            module = await import("../../" + this._getViewModelPath());
            state = "success";

            if ("default" in module) return new module.default(this.params);
            if (this.viewModelName in module) return new module[this.viewModelName](this.params);
        } catch (e) {
            console.error(FrontController.DEBUG_PREFIX + FrontController.NOT_FOUND);
            console.error(e);
            state = "error";
        }

        console.error(`[Frontcontroller] Loaded Module "${this.viewModelName}" with ${state}`);

        return null;

        // import("../../" + this._getViewModelPath()).then(function (module) {
        //     let viewModelObject = new module.default(self.params);
        // });
    }

    _getViewModelPath() {
        let fileName = this.viewModelName.toLowerCase();
        let folder = `viewmodel/${fileName}`;
        let path = `${folder}/${fileName}.js`;

        return path;
    }
}
