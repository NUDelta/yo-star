Meteor.methods({
	createLobby: function() {
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
    	
        // Meteor.users.update({_id:Meteor.user()._id}, {$set: {"profile.lobby": null}});
        Lobbies.update({ _id: Meteor.user().profile.lobby._id },{ $pull: { "users": Meteor.user().username }});
        Meteor.users.update({_id:Meteor.user()._id}, {$set: {"profile.isInLobby": false}});
    	console.log('Lobby left');
    }
});