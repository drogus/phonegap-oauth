document.addEventListener('deviceready', function () {
    if (typeof ChildBrowser.install == "function") {
        ChildBrowser.install();
    }

    window.plugins.childBrowser.showWebPage("http://www.google.com");
}, false);
