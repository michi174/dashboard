class UIManager{
    constructor(){
        if(!UIManager.instance){
            this.elements = new Array;


            UIManager.instance = this;
        }
        return UIManager.instance;
    }

    add(element){
        this.elements.push(element);
    }

    remove(element){
        
    }
}

const instance = new UIManager();
Object.freeze(instance);
export default instance;
