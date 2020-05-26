export default class App {
    constructor() {
        const instance = this.constructor.instance;

        if (instance) {
            return instance;
        }

        this.sessionCache;
        this.cache;

        this.constructor.instance = this;
    }
}
