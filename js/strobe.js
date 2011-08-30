(function ($) {

    /**
     * Strobe library
     *
     * @module strobe
     */

    /**
     * Strobe global object.
     *
     * @class Strobe
     * @static
     */
    this.Strobe || (Strobe = {});

    /**
     * Will be true when running inside a native application,
     * like PhoneGap, and false otherwise.
     *
     * @static
     * @property {Boolean}
     * @default false
    */
    Strobe.isNativeApp = navigator.standalone === false;

    /**
     * Adds Strobe proxy prefix to a given path.
     *
     * @method urlFor
     * @static
     * @param {String} path Path to convert
     *   (i.e. "api.strobeapp.com/application").
     * @return {String} Converted path
     *   (i.e. "/_strobe/proxy/api.strobeapp.com/application").
     */
    Strobe.urlFor = function (path) {
        var url = path.replace(/^\//, "");
        return !Strobe.isNativeApp ? "/_strobe/proxy/" + url : url;
    };

    /**
     * Sends an XHR through Strobe proxy. It uses jQuery.ajax under
     * the hood, see http://api.jquery.com/jQuery.ajax for
     * reference. A settings object is passed directly to jQuery.ajax
     * with a modified url option. If an url argument contains
     * protocol, it's converted to X-Strobe-Proxy-Protocol header and
     * added to the settings object.
     *
     * @method send
     * @static
     * @param {String} url Path or URI
         (i.e. https://api.strobeapp.com/applications)
     * @param {Object} settings (optional) Settings for the request.
     * @return {Object} jqXHR object
     */
    Strobe.send = function (url, settings) {
        settings         || (settings = {});
        settings.headers || (settings.headers = {});

        url = url.replace(/^https?:\/\//, function (protocol) {
            if (protocol === "https://") {
                settings.headers["X-Strobe-Proxy-Protocol"] = "https";
            }
            return "";
        });

        settings.url = Strobe.urlFor(url);

        return $.ajax(settings);
    };

    /**
     * Opens and focuses a new popup window with given settings. If no
     * top/left settings given, the popup is centered relatively to a
     * parent window. An url parameter tells popup to open the given
     * URL inside. A name parameter prevents opening multiple popups
     * with the same name. Each call may include an optional settings
     * object, with following properties:
     *
     * width: width of the popup window, default is 600 px.
     *
     * height: height of the popup window, default is 680 px.
     *
     * top: top position of the popup.
     *
     * left: left position of the popup.
     *
     * scrollbars: tells the popup to display scrollbars, default is
     *             true.
     *
     * location: tells the popup to display a location bar, default
     *           is true.
     *
     * toolbar: display a toolbar, default is false.
     *
     * menubar: display a menubar, default is false.
     *
     * status: display a status bar, default is false.
     *
     * Notice that browsers usually prevent popup windows. Popups are
     * not blocked if they are a direct result of a user's action
     * (i.e. click event).
     *
     * @method popup
     * @static
     * @param {String} url URL address to open in the popup.
     * @param {String} name Name of the popup window.
     * @param {Object} settings (optional) Settings object.
     * @return {Object} The newly created popup window.
     */
    Strobe.popup = function (url, name, settings) {
        settings = $.extend({
            width: 600,
            height: 680,
            scrollbars: true,
            location: true,
            toolbar: false,
            menubar: false,
            status: false
        }, settings);

        // top, left calculations based on Facebook's JS library
        var popup, features,
            screenLeft = typeof window.screenX !== "undefined" ? window.screenX : window.screenLeft,
            screenTop = typeof window.screenY !== "undefined" ? window.screenY : window.screenTop,
            clientWidth = typeof window.outerWidth !== "undefined" ? window.outerWidth : document.documentElement.clientWidth,
            clientHeight = typeof window.outerHeight !== "undefined" ? window.outerHeight : (document.documentElement.clientHeight - 22),
            left = parseInt(((screenLeft < 0) ? window.screen.width + screenLeft : screenLeft) + ((clientWidth - settings.width) / 2), 10),
            top = parseInt(screenTop + ((clientHeight - settings.height) / 2.5), 10);

        features = [
            "width=" + settings.width,
            "height=" + settings.height,
            "left=" + (settings.left !== "undefined" ? left : settings.left),
            "top=" + (settings.top !== "undefined" ? top : settings.top),
            "scrollbars=" + (settings.scrollbars ? "1" : "0"),
            "location=" + (settings.location ? "1" : "0"),
            "toolbar=" + (settings.toolbar ? "1" : "0"),
            "menubar=" + (settings.menubar ? "1" : "0"),
            "status=" + (settings.status ? "1" : "0")
        ];

        popup = window.open(url, name, features.join(","));
        popup.focus();

        return popup;
    };

    /**
     * Fetches a cookie with a given name.
     *
     * @method getCookie
     * @static
     * @param {String} name Cookie name to fetch.
     * @return {String} Fetched cookie value or unfedined if no cookie
     *   with the given name exists.
     */
    Strobe.getCookie = function (name, cookie) {
        cookie || (cookie = document.cookie);

        var cookieString = "; " + cookie + ";",
            i = cookieString.indexOf("; " + name + "=");

        if (i > -1) {
            return cookieString.slice(i += 3 + name.length, cookieString.indexOf(";", i));
        } else {
            return undefined;
        }
    };

    /**
     * Deletes a cookie with a given name. Optional path and name
     * parameters allows to delete a cookie for specific path/domain.
     *
     * @method deleteCookie
     * @static
     * @param {String} name Cookie name to delete.
     * @param {String} path (optional) Delete cookie for given path.
     * @param {String} domain (optional) Delete cookie for given domain.
     * @return void
     */
    Strobe.deleteCookie = function (name, path, domain) {
        document.cookie = ""
            + name + "="
            + (path ? ";path=" + path : "")
            + (domain ? ";domain=" + domain : "")
            + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
    };

    Strobe._loadApplicationId = function() {
        $.ajax({
            url: '/strobe/config.json',
            dataType: 'text',
            async: false,
            success: function(data) {
                data = eval("(" + data + ")");;
                var id = data["application_id"];
                if(id) {
                    window.Settings = window.Settings || {};
                    window.Settings.applicationId = id;
                }
            }
        });
    };

    if(Strobe.isNativeApp) {
        Strobe._loadApplicationId();
    }

})(jQuery.noConflict(true));
