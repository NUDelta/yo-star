Accounts.onCreateUser(function(options, user) {
    Locations.insert({ lobby: 0, user: user._id, location: 0});
    return user;
});
