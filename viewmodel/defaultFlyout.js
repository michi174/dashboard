export class defaultFlyout{
    constructor(params){
        this.prop = "prop";
        console.log(params)
        
    }

    getContext(){
        return {"context": "testContext"};
    }
}