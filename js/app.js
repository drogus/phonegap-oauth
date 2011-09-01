document.addEventListener('deviceready', function () {
    if (typeof ChildBrowser.install == "function") {
        ChildBrowser.install();
    } else {
        window.plugins = window.plugins || {};
        window.plugins.childBrowser = new ChildBrowser;
    }

    window.plugins.childBrowser.showWebPage("http://www.google.com");
}, false);
