export default class Abstract {
    constructor() {
        if (new.target === Abstract) {
            throw new Error("Can't create instance of an Abstract class");
        }
    }
}
