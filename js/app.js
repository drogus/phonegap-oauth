var twitter = Strobe.Social('twitter');

jQuery(function($) {
  $(".twitter-login").click(function() {
    console.log('twitter login');
    twitter.login({
      type: 'redirect',
      success: function() {
        console.log("Successfully logged in.");
      },

      error: function() {
        console.warn("Error authenticating with Twitter.");
      }
    });
  });

  $(".twitter-logout").click(function() {
    twitter.logout({
      type: 'redirect'
    });
  });
});
