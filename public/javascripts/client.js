/* global TrelloPowerUp */

var open = require("oauth-open");
var request = require("request");

// we can access Bluebird Promises as follows
var Promise = TrelloPowerUp.Promise;
Promise.promisifyAll(request);

var LINE_ICON = './images/LINE_Icon.png';

var lineNotify = function(t, payload){
    return t.get('member', 'private', 'token').then((access_token) => {
        if (!access_token){
            return Promise.reject(new Error(`token not found.`));
        }
        let url = `https://${window.location.hostname}/api/notify?access_token=${access_token}`;
        return request.postAsync({
            url: url,
            body: payload,
            json: true
        });
    }).then((response) => {
        console.log(`Message sent.`);
    }).catch((e) => {
        console.error();(`Failed to send message.`);
        console.error(e);
    });
}

var lineCelebrateButtonCallback = function(t){
    return t.card('all').then((card) => {
        return lineNotify(t, {
            message: `Congrats for completing "${card.name}"!`,
            stickerPackageId: 2,
            stickerId: 144
        });
    }).then((response) => {
        console.log('callback completed.');
    });
}

var lineCheckStatusButtonCallback = function(t){
    return t.card('all').then((card) => {
        return lineNotify(t, {
            message: `How is "${card.name}" going?`,
            stickerPackageId: 1,
            stickerId: 113
        });
    }).then((response) => {
        console.log('callback completed.');
    });
}

// We need to call initialize to get all of our capability handles set up and registered with Trello
TrelloPowerUp.initialize({
  'card-buttons': function(t, options) {
    return [{
      icon: LINE_ICON,
      text: 'Check Status',
      callback: lineCheckStatusButtonCallback
    },{
      icon: LINE_ICON,
      text: 'Celebrate',
      callback: lineCelebrateButtonCallback
    }];
  },
  'card-from-url': function(t, options) {
    // options.url has the url in question
    // if we know cool things about that url we can give Trello a name and desc
    // to use when creating a card. Trello will also automatically add that url
    // as an attachment to the created card
    // As always you can return a Promise that resolves to the card details

    return new Promise(function(resolve) {
      resolve({
        name: '💻 ' + options.url + ' 🤔',
        desc: 'This Power-Up knows cool things about the attached url'
      });
    });

    // if we don't actually have any valuable information about the url
    // we can let Trello know like so:
    // throw t.NotHandled();
  },
  'show-settings': function(t, options){
    // when a user clicks the gear icon by your Power-Up in the Power-Ups menu
    // what should Trello show. We highly recommend the popup in this case as
    // it is the least disruptive, and fits in well with the rest of Trello's UX
    return t.popup({
      title: 'Settings',
      url: './settings.html',
      height: 184 // we can always resize later, but if we know the size in advance, its good to tell Trello
    });
  },

  /*

      🔑 Authorization Capabiltiies 🗝

      The following two capabilities should be used together to determine:
      1. whether a user is appropriately authorized
      2. what to do when a user isn't completely authorized

  */
  'authorization-status': function(t, options){
    // Return a promise that resolves to an object with a boolean property 'authorized' of true or false
    // The boolean value determines whether your Power-Up considers the user to be authorized or not.

    // When the value is false, Trello will show the user an "Authorize Account" options when
    // they click on the Power-Up's gear icon in the settings. The 'show-authorization' capability
    // below determines what should happen when the user clicks "Authorize Account"

    // For instance, if your Power-Up requires a token to be set for the member you could do the following:
    return t.get('member', 'private', 'token')
    .then(function(token){
      if(token){
        return { authorized: true};
      }
      return { authorized: false};
    });
    /*
    return new TrelloPowerUp.Promise((resolve) =>
      resolve({ authorized: false })
    );
    */
    // You can also return the object synchronously if you know the answer synchronously.
  },
  'show-authorization': function(t, options){
    // Returns what to do when a user clicks the 'Authorize Account' link from the Power-Up gear icon
    // which shows when 'authorization-status' returns { authorized: false }.

    // If we want to ask the user to authorize our Power-Up to make full use of the Trello API
    // you'll need to add your API from trello.com/app-key below:
    //let trelloAPIKey = TRELLO_API_KEY;
    // This key will be used to generate a token that you can pass along with the API key to Trello's
    // RESTful API. Using the key/token pair, you can make requests on behalf of the authorized user.

    // In this case we'll open a popup to kick off the authorization flow.

    // Auth Endpoint in case of using LINE Login.
    //var auth_url = 'https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=' + LINE_CLIENT_ID + '&redirect_uri=' + window.location.origin + '%2Fauth-success.html&state=12345&scope=openid%20profile';

    var response_type = "code";
    var client_id = encodeURIComponent(LINE_CLIENT_ID);
    var redirect_uri = encodeURIComponent(`https://${window.location.hostname}/auth-success`);
    var scope = "notify";
    var state = encodeURIComponent(Math.floor( Math.random() * (99999 - 10000 + 1) ) + 10000);
    var auth_url = "https://notify-bot.line.me/oauth/authorize?response_type=" + response_type + "&client_id=" + client_id + "&redirect_uri=" + redirect_uri + "&scope=" + scope + "&state=" + state;
    console.log("auth_url is " + auth_url);

    open(auth_url, {height: 800, width: 900}, function(err, query){
        if (err) throw err;
        if (query.state !== state){
            throw new Error(`state does not match. original state was ${state} but got ${query.state}.`);
        }

        console.log("access token is " + query.token);
        return t.set("member", "private", "token", query.token).then((response) => {
            return t.closePopup();
        });
    });
  }
});

console.log('Loaded by: ' + document.referrer);
