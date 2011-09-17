(function ($) {
  var Strobe = {};

  /**
    Strobe global object.

    @class Strobe
    @static
  */
  window.Strobe = Strobe;

  /**
    True when running inside a native application,
    like PhoneGap, and false otherwise.

    @static
    @property {Boolean}
    @default false
  */
  Strobe.isNativeApp || (Strobe.isNativeApp = window.DeviceInfo && DeviceInfo.uuid !== undefined);

  /**
    Specifies whether we want to use https when connecting to
    application on native devices.

    @static
    @property {Boolean}
    @default false
  */
  Strobe.useHttps || (Strobe.useHttps = false);

  /**
    Adds Strobe proxy prefix to a given path.

    @method urlFor
    @static
    @param {String} path Path to convert
      (i.e. "api.strobeapp.com/application").
    @return {String} Converted path
      (i.e. "/_strobe/proxy/api.strobeapp.com/application").
  */
  Strobe.urlFor = function (path) {
      var url = path.replace(/^\//, "");
      return !Strobe.isNativeApp ? "/_strobe/proxy/" + url : url;
  };

  /**
    Sends an XMLHttpRequest through Strobe proxy.

    Typically, web applications are bound by the browser security model such
    that they can only send or receive data to the same hostname from which the
    page was loaded. Strobe allows you to send XHRs to any hostname through a
    fast, streaming proxy.

    This method creates a new XHR using jQuery, then configures it to go
    through the Strobe proxy.

    The settings object you give to `Strobe.ajax()` is passed to
    `jQuery.ajax()`, and supports the same options. To learn more about the
    options available, see http://api.jquery.com/jQuery.ajax.

    If the URL argument contains a protocol, it will be converted to an
    X-Strobe-Proxy-Protocol header and added to the settings object.

    @method send
    @static
    @param {String} url Path or URI
      (i.e. https://api.strobeapp.com/applications)
    @param {Object} settings (optional) Settings for the request.
    @return {Object} jqXHR object
  */
  Strobe.ajax = function (url, options) {
      if (typeof url === "object") {
        options = url;
        url = undefined;
      }

      options || (options = {});
      options.headers || (options.headers = {});
      url || (url = options.url);

      url = url.replace(/^https?:\/\//, function (protocol) {
          if (protocol === "https://") {
              options.headers["X-Strobe-Proxy-Protocol"] = "https";
          }
          return "";
      });

      options.url = Strobe.urlFor(url);

      return $.ajax(options);
  };

  /**
    Opens and focuses a new popup window with given settings. If no
    top/left settings given, the popup is centered relatively to a
    parent window. An url parameter tells popup to open the given
    URL inside. A name parameter prevents opening multiple popups
    with the same name. Each call may include an optional settings
    object, with following properties:

    width:        width of the popup window, default is 600 px.

    height:       height of the popup window, default is 680 px.

    top:          top position of the popup.

    left:         left position of the popup.

    scrollbars:   tells the popup to display scrollbars, default is
                  true.

    location:     tells the popup to display a location bar, default
                  is true.

    toolbar:      display a toolbar, default is false.

    menubar:      display a menubar, default is false.

    status:       display a status bar, default is false.

    Note that browsers usually prevent popup windows. Popups are
    not blocked if they are a direct result of a user's action
    (i.e. click event).

    @method popup
    @static
    @private
    @param {String} url URL address to open in the popup.
    @param {String} name Name of the popup window.
    @param {Object} settings (optional) Settings object.
    @return {Object} The newly created popup window.
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
    Fetches a cookie with a given name.

    @method getCookie
    @static
    @private
    @param {String} name Cookie name to fetch.
    @return {String} Fetched cookie value or unfedined if no cookie
     with the given name exists.
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
    Deletes a cookie with a given name. Optional path and name
    parameters allows to delete a cookie for specific path/domain.

    @method deleteCookie
    @static
    @private
    @param {String} name Cookie name to delete.
    @param {String} path (optional) Delete cookie for given path.
    @param {String} domain (optional) Delete cookie for given domain.
    @return void
  */
  Strobe.deleteCookie = function (name, path, domain) {
      document.cookie = ""
          + name + "="
          + (path ? ";path=" + path : "")
          + (domain ? ";domain=" + domain : "")
          + ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
  };

  /**
    Construct application url
    @static
    @return {String} applicationUrl
  */
  Strobe.applicationUrl = function() {
    if(!Settings.applicationUrl) {
      throw("Application url was not loaded");
    }

    var scheme = Strobe.useHttps ? "https://" : "http://";
    return scheme + Settings.applicationUrl;
  };

  /**
    Ensure that strobe has loaded and run given callback.

    @method run
    @static
    @param {Function} callback to run
  */
  Strobe.run = function(fn, context) {
    var f = function() { fn.apply(context); };
    if(_loaded || _dependencies.length === 0) {
      f();
    } else {
      Strobe._when().then(f).then(function() { _loaded = true; });
    }
  };

  Strobe.hasLoaded = function() {
    return _loaded;
  };

  /**
   * Internal functions for handling dependencies, they need to be here
   */

  var _loaded, _dependencies, _deferred;

  Strobe._reset = function() {
    _loaded = false;
    _dependencies = [];
    _deferred = null;
  };

  Strobe._reset();

  Strobe._when = function() {
    if(!_deferred) {
      var deps = $.map(_dependencies, function(d) { return d(); });
      _deferred = $.when.apply(this, deps);
    }
    return _deferred;
  };

  Strobe._addDependency = function(fn) {
    _dependencies.push(function() {
      return $.Deferred(function(deferred) {
        fn(deferred);
      });
    });
  };

  var STROBE_JS_VERSION = '0.1.0';

  Strobe.isNativeApp = true;

  var loadScript = function(src, callback) {
    var head   = document.getElementsByTagName('head')[0];
    var script = document.createElement("script");

    if(callback) {
      script.onload = function() {
        if ( ! script.onloadDone ) {
          script.onloadDone = true;
          callback();
        }
      };

      script.onreadystatechange = function() {
        if ( ( "loaded"   === script.readyState ||
               "complete" === script.readyState ) &&
             !script.onloadDone ) {
               script.onloadDone = true;
            callback();
          }
      };
    };

    script.type = "text/javascript";
    script.src  = src;

    head.appendChild(script);
  };

  Strobe._addDependency(function(defer) {
    $(function() {
      document.addEventListener("deviceready", function() {
        var agent = navigator.userAgent.match("Android") ? "android" : "iphone";
        loadScript("childbrowser-" + agent + ".js", function() {
          defer.resolve();
        });
      }, false);
    });
  });

  window.Settings = {
    applicationUrl: "eb0bd0d107.applications.strobeapp.com"
  };

})(jQuery);
(function (window, $, Strobe) {

var encodeURIComponent = window.encodeURIComponent,

// When the Strobe.Social() function is called, dynamically set the
// prototype of the new object to whatever service is specified.
//
// For example, if `service` is `twitter`, it will create a new object
// with Strobe.Social.Twitter as its prototype.

StrobeSocial = Strobe.Social = function(service) {
  var C = function() {}, ret;
  C.prototype = Strobe.Social[service].prototype;
  ret = new C();
  ret.service = service;

  return ret;
},

Twitter = StrobeSocial.Twitter = StrobeSocial.twitter = function() { },
Facebook = StrobeSocial.Facebook = StrobeSocial.facebook = function() { },

Twitter_prototype = Twitter.prototype,
Facebook_prototype = Facebook.prototype;

/**
  Short-hand for posting a tweet.

  @param {String} message the message to post
  @param {Object} settings (optional) an optional settings hash that
    will be passed to jQuery.ajax
*/

Twitter_prototype.tweet = function(message, settings) {
  settings = settings || {};

  settings.type = 'post';
  settings.data = {
    status: message
  };

  this.ajax('1/statuses/update.json', settings);
};

/**
  Sends an XHR request to the Twitter API server.

  For example, to retrieve a list of recent updates, you might
  call `send` like this:

      twitter.send('1/statuses/home_timeline.json', {
        success: function(tweets) {
          // process tweets here
        }
      });

  An optional settings hash, the second parameter, will be passed to
  jQuery.ajax. Additional information about jQuery.ajax is available at:
  http://api.jquery.com/jQuery.ajax/

  @param {String} url the Twitter API URL to which the request should be sent
  @Param {Object} settings (optional) additional settings to pass to jQuery.ajax
*/

Twitter_prototype.ajax = function(url, options) {
  if (typeof url === "object") {
    options = url;
    url = undefined;
  }

  options || (options = {});
  url || (url = options.url);

  options.url = this.urlFor(url);
  console.log(options.url);
  return $.ajax(options);
};

/**
  Returns a Twitter API URL, converted to work with the Strobe Social add-on.

      twitter.urlFor('1/statuses/home_timeline.json');
      // returns "/_strobe/social/twitter/1/statuses/home_timeline.json"

  @param {String} url the Twitter API URL to make compatible with the Strobe Social add-on.
  @returns {String}
*/

Twitter_prototype.urlFor = function(path) {
  var prefix = "/_strobe/social/twitter/";
  if(Strobe.isNativeApp) {
    prefix = Strobe.applicationUrl() + prefix;
  }
  return  prefix + path.replace(/^\//, "");
};

/**
  Returns url for oauth callback passed to twitter

  @private
  @returns {String}
*/
Twitter_prototype.oauthCallback = function() {
  var url = this.urlFor("/callback");
  if(Strobe.isNativeApp) {
    return url;
  } else {
    return window.location.protocol + "//" + window.location.host + url;
  }
};

/**
  Prompts the user to log in to Twitter. Once authenticated, the callback you
  provide will be called.

      twitter.login({
        success: function() {
          alert("User logged in.");
        },

        error: function() {
          alert("Unable to authenticate user.");
        }
      });

  @param {Object} settings
*/

Twitter_prototype.login = function (settings, prompt) {
  Strobe.run(function() {
    settings               || (settings = {});
    settings.oauthCallback || (settings.oauthCallback = this.oauthCallback());
    settings.interval      || (settings.interval = 100);
    settings.type          || (settings.type = 'popup');

    prompt = (prompt === undefined) ? true : false;

    var interval, popup, path, self = this;
    var error = settings.error, success = settings.success;

    path  = this.urlFor("/authentication?oauth_callback=");
    path += encodeURIComponent(settings.oauthCallback);

    // First, issue an XHR request to the Strobe Social add-on authentication resource.
    $.ajax(path, {

      success: function(data) {
        var authenticationResults = data.authentication;

        // If the server tells us that we are not authenticated, we need to send the
        // user to twitter.com to grant us access to their account.
        if (authenticationResults.status === 'unauthenticated') {

          // If we're told not to prompt for authentication, we should treat this login
          // request as essentially a status check. This is used internally if
          // we display a pop-up to determine if the user actually granted us
          // access after displaying the pop-up, or if they bailed at the last
          // moment.
          if (prompt) {

            // If the developer has asked us to show a popup, create a new window,
            // then continue polling until its closed. Once closed, we double check
            // with the server to verify that the user actually granted us access
            // and didn't just close the window.
            if (settings.type === 'popup') {
              popup = Strobe.popup(authenticationResults.authentication_uri, 'twitter_authentication');

              interval = window.setInterval(function () {
                if (popup.closed) {
                  window.clearInterval(interval);

                  // Call this method with prompt set to false, which will not
                  // prompt the user again if they are still not authenticated.
                  self.login(settings, false);
                }
              }, settings.interval);
            } else {

              // If we're not showing a popup, just redirect to the twitter.com page.
              // Once authentication is complete, we'll be redirected to this page.
              var uri = authenticationResults.authentication_uri;
              if (Strobe.isNativeApp) {
                window.plugins.childBrowser.onLocationChange = function (url) {
                  if ( url == Strobe.applicationUrl() ) {
                    window.plugins.childBrowser.close ();
                  }
                };
                window.plugins.childBrowser.showWebPage (uri, {showLocationBar: false});
              } else {
                window.location = uri;
              }

              return;
            }

          } else {
            // Trigger error callback if we're not authenticated and not allowed
            // to prompt the user.
            if (error) { error(); }
          }
        } else {
          if (success) { success(); }
        }
      },

      // Tell jQuery to call the provided error callback if a network error is
      // encountered.
      error: settings.error
    });
  }, this);
};

/**
  Logs out from Twitter.

  @param {Object} settings (optional) Settings object.
*/
Twitter_prototype.logout = function (settings) {
  Strobe.run(function() {
    settings || (settings = {});

    $.ajax({
      type: 'DELETE',
      url: this.urlFor('/authentication'),
      success: settings.success,
      error: settings.error,
      complete: settings.complete
    });
  }, this);
};

/**
 * Logs in to Facebook. You can pass additional settings like:
 *
 * clientId: *required* by Facebook API, you receive client ID
 *   when you register your application on Facebook.
 *
 * callback: function to execute after the login procedure
 *   finishes.
 *
 * type: "redirect" or "popup" (default) options are usually
 *   supported.
 *
 * interval: used by popup login - checks the popup state in
 *   given intervals (in ms)
 *
 * scope: permissions you'd like to receive, see
 *   http://developers.facebook.com/docs/reference/api/permissions/
 *   for details
 *
 * redirectUri: redirect URI after the login procedure finishes, default:
 *   protocol://your.host.url/_strobe/social/facebook/callback
 *
 * @method login
 * @static
 * @param {Object} settings (optional) Settings object.
 * @return void
 */
Facebook_prototype.login = function (settings) {
    settings             || (settings = {});
    settings.type        || (settings.type = "popup");
    settings.interval    || (settings.interval = 100);
    settings.scope       || (settings.scope = "");
    settings.redirectUri || (settings.redirectUri = window.location.protocol + "//" + window.location.host + "/_strobe/social/facebook/callback");

    var interval, popup, url;

    url  = "https://www.facebook.com/dialog/oauth?response_type=token";
    url += "&scope=" + encodeURIComponent(settings.scope);
    url += "&client_id=" + encodeURIComponent(settings.clientId);
    url += "&redirect_uri=" + encodeURIComponent(settings.redirectUri);

    switch (settings.type) {
    case "redirect":
        window.location = url;
        break;
    case "popup":
        url += "&display=popup";
        popup = Strobe.popup(url, "facebook_authentication", { width: 627, height: 326 });
        interval = window.setInterval(function () {
            if (popup.closed) {
                window.clearInterval(interval);
                StrobeSocial.facebook.status({ callback: settings.callback });
            }
        }, settings.interval);
        break;
    default:
        // unsupported login type
    }
};

/**
 * Logs out from Facebook. You can pass additional settings like:
 *
 * callback: function to execute after the logout procedure
 *   finishes.
 *
 * @method logout
 * @static
 * @param {Object} settings (optional) Settings object.
 * @return void
 */
Facebook_prototype.logout = function (settings) {
    settings || (settings = {});

    Strobe.deleteCookie("facebook_access_token", "/_strobe/social/facebook");
    StrobeSocial.facebook.status({ callback: settings.callback });
};

/**
 * Checks the login status in Facebook. You can pass additional
 * settings like:
 *
 * callback: function to execute after the status procedure
 *   finishes. Response object is passed to the function, it
 *   contains "status" and "accessToken" properties.
 *
 * @method status
 * @static
 * @param {Object} settings (optional) Settings object.
 * @return void
 */
Facebook_prototype.status = function (settings) {
    settings || (settings = {});

    var iframe = $("<iframe>").hide().appendTo(document.body);

    iframe.load(function () {
        var accessToken = Strobe.getCookie("facebook_access_token", iframe[0].contentWindow.document.cookie),
            status = $(iframe[0].contentWindow.document.body).text();

        StrobeSocial.facebook.ACCESS_TOKEN = accessToken;

        if (typeof settings.callback === "function") {
            settings.callback({ status: status, accessToken: accessToken });
        }

        // avoid infinite page loading in FF
        setTimeout(function () {
            iframe.remove();
        }, 0);
    });

    iframe.attr("src", "/_strobe/social/facebook/status");
};

/**
 * Adds a Facebook specific prefix to a given path.
 *
 * @method urlFor
 * @static
 * @param {String} path Path to convert
 *   (i.e. "/me")
 * @return {String} Converted path
 *   (i.e. "/_strobe/proxy/graph.facebook.com/me")
 */
Facebook_prototype.urlFor = function (path) {
    return "/_strobe/proxy/graph.facebook.com/" + path.replace(/^\//, "");
};

/**
 * Sends a request to Facebook. It uses jQuery.ajax under the
 * hood, see http://api.jquery.com/jQuery.ajax for reference. A
 * settings object is passed directly to jQuery.ajax with a
 * modified url option.
 *
 * WARNING: this function needs to fetch an access token
 *   cookie. If it's the first request to the service, and no
 *   accessToken is given - additional "status" request is made
 *   internally. In this case the function returns undefined
 *   instead of a jqXHR object! (we can avoid that only if we
 *   block here)
 *
 * @method send
 * @static
 * @param {String} path Path in the Facebook service.
 *   (i.e. /me)
 * @param {Object} settings (optional) Settings for the request.
 * @return {Object} jqXHR object or undefined
 */
StrobeSocial.facebook.send = function (url, settings) {
    settings             || (settings = {});
    settings.headers     || (settings.headers = {});
    settings.accessToken || (settings.accessToken = StrobeSocial.facebook.ACCESS_TOKEN);

    if (!settings.accessToken && !StrobeSocial.facebook.hasOwnProperty("ACCESS_TOKEN")) {
        return StrobeSocial.facebook.status({
            callback: function (response) {
                StrobeSocial.facebook.send(url, settings);
            }
        });
    }

    settings.url = StrobeSocial.facebook.urlFor(url);

    if (StrobeSocial.facebook.ACCESS_TOKEN) {
        settings.headers["X-Strobe-Proxy-Protocol"] = "https";
        settings.url += (settings.url.indexOf("?") === -1) ? "?access_token=" : "&access_token=";
        settings.url += encodeURIComponent(StrobeSocial.facebook.ACCESS_TOKEN);
    }

    return $.ajax(settings);
};

})(this, jQuery, Strobe);
