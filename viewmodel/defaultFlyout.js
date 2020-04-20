export class defaultFlyout{
    constructor(params = null){
        this.prop = "prop";        
    }

    async _createContext(){
        return {"context": "testContext"}
    }

    async getContext(){
        let self = this;
        return new Promise(async function(resolve, reject){
            setTimeout(async function(){

                let ctx = await self._createContext();
                resolve(ctx);
            },0);            
        });        
    }
}