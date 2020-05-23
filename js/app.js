export default class App {
    constructor() {
        const instance = this.constructor.instance;

        if (instance) {
            return instance;
        }

        const VERSION = 0.1;
        this.constructor.instance = this;
    }

    getInstance() {}
}
