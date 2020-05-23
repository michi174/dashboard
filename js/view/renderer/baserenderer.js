export default class BaseRenderer {
    constructor() {
        if (new.target === BaseRenderer) {
            throw new Error("Can't create instance of an abstract class");
        }
    }

    render() {
        throw new Error("Can't call an abstract method. Overriding is required.");
    }
}
