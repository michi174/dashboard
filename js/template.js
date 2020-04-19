class Template{
    constructor(options){
        this.path = "";
        this.file = "";
        this.extension = "handlebars";
        this.html = "";
        this.target = "";
        this.data = {};
        this.method = "default";
        this.designMode = false;



        if(typeof options === "object"){
            for (let [prop, value] of Object.entries(options)) {
                
                if(this.hasOwnProperty(prop)){
                    this[prop] = value;
                }
            }
        }

        console.log(this);

        return this._render();


    }

    async _render(){
        let compiledHTML;
        let content = (this.file !== "") ? await this._loadFile() : this.html;

        if(this.file !== "" && this.html !== ""){
            console.warn("HTML is ignored because we also have a file. Give either a file or html to render!");
        }

        let compile = Handlebars.compile(content);
        let html = compile(this.data);
    
        
    
        if (!this.designMode) {
            compiledHTML = html;
        }
        else {
            compiledHTML = content;
        }
    
        if (this.target !== null) {

            let target = $(this.target);


            switch (this.method) {

                case "append":
                    target.append(compiledHTML);
                    break;
    
                case "prepend":
                    target.prepend(compiledHTML);
                    break;

                case "return":
                    break;
    
                case "replace":
                    let obj = $(compiledHTML);
                    $('#' + obj.first().attr('id')).remove();
                    target.append(compiledHTML);
                    break;
    
                default:
                    target.html(compiledHTML);
                    break;
            }
        }
        //console.log(compiledHTML);
        return compiledHTML;
    }

    _loadFile(){

        console.log("Loading template: "+ this.file);

        return $.ajax({
            url: this.path+"/"+this.file,
            cache: false,
            success: function(data) {
            }               
        });   
    }
}

export {Template};