export default class Route {
    constructor(name, target, viewmodel = name, view = name, folderPath = name) {
        this.name = name;
        this.target = target;
        this.viewmodel = viewmodel;
        this.view = view;
        this.folderPath = folderPath;
    }
}
