Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile || {};
    user.profile.location = 0;
    return user;
});
