Accounts.registerLoginHandler(function(loginRequest) {
  if(!loginRequest.cordova) {
    return undefined;
  }

  loginRequest = loginRequest.authResponse;

  var whitelisted = ['id', 'email', 'name', 'first_name',
      'last_name', 'gender', 'locale', 'user_birthday'];

  var identity = getIdentity(loginRequest.accessToken, whitelisted);

  var profilePicture = getProfilePicture(loginRequest.accessToken);

  var serviceData = {
    accessToken: loginRequest.accessToken,
    expiresAt: (+new Date) + (1000 * loginRequest.expiresIn)
  };


  var fields = _.pick(identity, whitelisted);
  _.extend(serviceData, fields);

  var options = {profile: {}};
  var profileFields = _.pick(identity, Meteor.settings.public.facebook.profileFields);
  _.extend(options.profile, profileFields);

  options.profile.avatar = profilePicture;

  return Accounts.updateOrCreateUserFromExternalService("facebook", serviceData, options);

});

var getIdentity = function (accessToken, fields) {
  try {
    return HTTP.get("https://graph.facebook.com/me", {
      params: {
        access_token: accessToken,
        fields: fields.join(",")
      }
    }).data;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Facebook. " + err.message),
                   {response: err.response});
  }
};

var getProfilePicture = function (accessToken) {
  try {
    return HTTP.get("https://graph.facebook.com/v2.8/me/picture/?redirect=false", {
      params: {access_token: accessToken}}).data.data.url;
  } catch (err) {
    throw _.extend(new Error("Failed to fetch identity from Facebook. " + err.message),
                   {response: err.response});
  }
};
