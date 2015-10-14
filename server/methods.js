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
        }
        let currLobby = Lobbies.findOne({ active: false });
        Lobbies.update(currLobby._id,{ $push: { 'users': user.username } });
        Meteor.users.update(user._id, { $set: {'profile.isInLobby': true} })
        Meteor.users.update(user._id, { $set: {'profile.lobby': currLobby._id} });
        console.log('Lobby joined');
        console.log(user);
    },
    leaveLobby: function(user) {

        // Meteor.users.update({_id:user._id}, {$set: {'profile.lobby': null}});
        Lobbies.update({ _id: user.profile.lobby._id },{ $pull: { 'users': user.username }});
        Meteor.users.update(user._id, {$set: {'profile.isInLobby': false}});
    	console.log('Lobby left');
    }
});
