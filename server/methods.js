Meteor.methods({
    addMessage: function (message) {
        Messages.insert({
          message: message,
          createdAt: new Date()
      });
    },
    clearMessages: function() {
        Messages.remove({});
    },
    createLobby: function() {
        Lobbies.insert({
            users: [],
            active: false,
            createdAt: new Date()
        });
    },
    createFakeUser: function(userObject) {
        Accounts.createUser(userObject);    
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
        console.log('lobby:' + Lobbies.findOne().createdAt);
    },
    leaveLobby: function(user) {
        Lobbies.update(user.profile.lobby, { $pull: { 'users': user.username }});
        Meteor.users.update(user._id, {$set: {'profile.lobby': null}});
        Meteor.users.update(user._id, {$set: {'profile.isInLobby': false}});
        console.log(`[leaveLobby] ${user.username} left lobby ${user.profile.lobby}`);
        Lobbies.remove(Lobbies.findOne( {'users.1': {$exists: false } })._id);
    },
    log: function(message) {
        console.log(message);
    }
});
