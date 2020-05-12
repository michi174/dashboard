function renderTemplate(
    template,
    target = null,
    data = {},
    method = "default",
    designMode = false
) {
    let templatename = null;

    if (typeof template === "object") {
        templatename = $(template).attr("id");
    } else {
        templatename = template;
    }

    console.log("Renderer: Start rendering template: " + templatename);
    let tplName = template;
    template = $(template).html();
    let compile = Handlebars.compile(template);
    let html = compile(data);

    let compiledHTML;

    if (designMode === false) {
        compiledHTML = html;
    } else {
        compiledHTML = template;
    }

    if (target !== null) {
        target = $(target);

        switch (method) {
            case "append":
                target.append(compiledHTML);
                break;

            case "prepend":
                target.prepend(compiledHTML);
                break;

            case "replace":
                let obj = $(compiledHTML);
                $("#" + obj.first().attr("id")).remove();
                target.append(compiledHTML);
                break;

            default:
                target.html(compiledHTML);
                break;
        }
    }

    return compiledHTML;
}

export { renderTemplate };
