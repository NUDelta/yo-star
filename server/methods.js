Meteor.methods({
    createLobby: function() {
        Lobbies.insert({
            users: [],
            active: false,
            createdAt: new Date()
        });
    },
    joinLobby: function(user) {
        if (Lobbies.find({ active: false }).count() === 0) {
            Meteor.call('createLobby');
            console.log('[joinLobby] No lobbies currently exist. Creating.');
        }
        let currLobby = Lobbies.findOne({ active: false });
        Lobbies.update(currLobby._id, { $push: { 'users': user.username } });
        Meteor.users.update(user._id, { $set: {'profile.isInLobby': true} })
        Meteor.users.update(user._id, { $set: {'profile.lobby': currLobby._id} });
        console.log(`[joinLobby] ${user.username} joined lobby ${currLobby._id}`);
    },
    leaveLobby: function(user) {
        Lobbies.update(user.profile.lobby, { $pull: { 'users': user.username }});
        Meteor.users.update(user._id, {$set: {'profile.lobby': null}});
        Meteor.users.update(user._id, {$set: {'profile.isInLobby': false}});
        console.log(`[leaveLobby] ${user.username} left lobby ${user.profile.lobby}`);
    },
    log: function(message) {
        console.log(message);
    }
});
