console.log(ChildBrowser);
console.log('works?');

PhoneGap.addConstructor(function() {
  PhoneGap.addPlugin("childBrowser", new ChildBrowser());
  PluginManager.addService("ChildBrowser", "com.phonegap.plugins.childBrowser.ChildBrowser");
});

PhoneGap.exec(null, null, "ChildBrowser", "showWebPage", ["http://www.google.com", false]);
PhoneGap.exec(null, null, "com.phonegap.plugins.childBrowser.ChildBrowser", "showWebPage", ["http://www.google.com", false]);

//var childBrowser = new ChildBrowser();
//childBrowser.showWebPage("http://www.google.com");
// var client_browser = ChildBrowser.install();
// client_browser.onLocationChange = function(loc){
//   jQuery("#messages").append("<p>child browser location change" + loc + "</p>");
//   client_browser.close();
// };

// console.log(client_browser);

// if (client_browser != null) {
//   window.plugins.childBrowser.showWebPage("/browser.html");
// }









