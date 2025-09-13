

window.addEventListener('load', (event) => {
    console.debug('.__        .__                 ')
    console.debug('|  |  __ __|__| ___________    ')
    console.debug('|  | |  |  \\  |/  ___/\\__  \\   ')
    console.debug('|  |_|  |  /  |\\___ \\  / __ \\_ ')
    console.debug('|____/____/|__/____  >(____  / ')
    console.debug('                   \\/      \\/  ')
   
    var node = document.querySelector(".luisa-iframe-cntr")
    if (!node) {
        console.error("Luisa > No element with .luisa-iframe-cntr")
        return
    }

    var app = node.getAttribute('data-luisa-app')
    if (!app) {
        console.error("Luisa > data-luisa-app attribute")
        return
    }

    var resizeCntr = node.getAttribute("data-luisa-resize") != "false"
    console.debug("Luisa > resizeCntr: ", resizeCntr,  node.getAttribute("data-luisa-resize"))


    var iframe = document.createElement("iframe")
    iframe.seamless = true
    iframe.style.height = "100%"
    iframe.style.width = "100%"
    iframe.style.border = "none"
    iframe.src = "https://luisa.cloud/#/embedded/" + app + ".html"
    node.appendChild(iframe)

    window.addEventListener("message",function (event) {
        if (event.data.type === 'resize' && resizeCntr) {
            console.debug('Luisa.onMessage() > size', event.data.size);
            var size = event.data.size
            node.style.height = size.h + 'px'
        }
    })
});

