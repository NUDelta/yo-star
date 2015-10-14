/*

    ADD IN SERVER METHODS HERE.

    e.g. if you need to call a secure function from the
    serzer that has full access to database.

*/

Meteor.methods({
	createLobby: function() {
		// Lobbies.remove({});
		Lobbies.insert({
			users: [],
			active: false,
			createdAt: new Date()
		});
	},
    joinLobby: function(user) {
        if (Lobbies.find().count() === 0) {
        	Meteor.call("createLobby");
        }
        var currLobby = Lobbies.findOne({active: false});
        Lobbies.update({ _id: Meteor.user().profile.lobby._id },{ $push: { "users": Meteor.user().username }});
        Meteor.users.update({_id:Meteor.user()._id}, {$set:{"profile.isInLobby":true}})
        Meteor.users.update({_id:Meteor.user()._id}, {$set: {"profile.lobby": currLobby}});
        console.log('Lobby joined');
        console.log(user);
    },
    leaveLobby: function(user) {
    	Meteor.users.update({_id:Meteor.user()._id}, {$set: {"profile.isInLobby": false}});
    	console.log('Lobby left');
    }
});