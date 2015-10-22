Accounts.onCreateUser(function(options, user) {
    user.profile = options.profile || {};
    user.profile.location = user.profile.location || { lat: 0, lng: 0};
    return user;
});

// streamline this
Meteor.users.find({ 'status.online': true }).observeChanges({
    added: function(id, fields) {
        let user = Meteor.users.findOne(id)
        let currentLobby = Lobbies.findOne(user.profile.lobby);
        if (currentLobby) {
            console.log(`[status] ${user.username} just came online and entered ${currentLobby._id}`);
            Meteor.users.update(id, { $set: { 'profile.isInLobby': true } });
            Lobbies.update(currentLobby._id, { $push: { 'users': user.username } });
        }
    },
    removed: function(id) {
        let user = Meteor.users.findOne(id)
        let currentLobby = Lobbies.findOne(user.profile.lobby);
        if (currentLobby) {
            console.log(`[status] ${user.username} just went offline and left ${currentLobby._id}`);
            Meteor.users.update(id, { $set: { 'profile.isInLobby': false } });
            Lobbies.update(currentLobby._id, { $pull: { 'users': user.username } });
        }
    }
});
