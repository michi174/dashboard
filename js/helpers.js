import App from "./app.js";

export default class Helpers {
    constructor() {
        this.app = new App();
    }
    async getJson(url) {
        try {
            let result = await fetch(url);

            if (!result.ok) {
                throw new Error(result.status + " - " + result.statusText);
            }
            console.log("fetching URL: " + url);

            let data = await result.json();

            return data;
        } catch (e) {
            console.log(e);
            throw new Error(e);
        }
    }

    async getUserDataById(id) {
        let userdata = await this.getJson(this.app.apiHost + "v1/user/byid/" + id);

        return userdata;
    }
}
