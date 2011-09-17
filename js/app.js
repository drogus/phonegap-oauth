var twitter = Strobe.Social('twitter');

jQuery(function($) {
  $(".twitter-login").click(function() {
    console.log('twitter login');
    twitter.login({
      type: 'redirect',
      success: function(body, message, xhr) {
        console.log("Successfully logged in.");
      },

      error: function() {
        console.warn("Error authenticating with Twitter.");
      }
    });
  });

  $(".twitter-logout").click(function() {
    twitter.logout({
      type: 'redirect',
      success: function() {
        console.log("Successfully logged out.");
      },

      error: function() {
        console.warn("Error on logging out.");
      }
    });
  });

  $(".twitter-tweet").click(function() {
    var message = $("#tweet").val();
    console.log(message);
    twitter.tweet(message, {
      success: function() {
        console.log("Successful tweet");
      },
      error: function(xhr, message, body) {
        console.log("Unsuccessful tweet");
        console.log(body);
        console.log(xhr.status);
      }
    });
  });

  $("#console_form").submit(function() {
    eval($("#console").val());
    return false;
  });

  $(".device-info").click(function() {
    console.log(window.DeviceInfo);
  });
});
