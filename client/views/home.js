Template.home.events({
    'click .btn-join-lobby': function(event, template) {
        event.preventDefault();
        Meteor.call('joinLobby', Meteor.user());
    },
    'click .btn-leave-lobby': function(event, template) {
        event.preventDefault();
        Meteor.call('leaveLobby', Meteor.user());
    },
    'click .btn-logout': function(event, template) {
        Meteor.logout(function(err) {

        });
    },
    'submit form': function(event, template) {
        event.preventDefault();
        let username = event.target.username.value;
        Meteor.loginWithPassword(username, 'password', function(err) {
            if (err) { // e.g. user doesn't yet exist
                let userObject = {
                    username: username,
                    password: 'password'
                };
                Accounts.createUser(userObject, function(err) {
                    if (err) {
                     // handle case with username already taken
                    }
                });
            }
        });
    }
});

Template.home.helpers({
    usersInLobby: function () {
        if (Meteor.user() && Meteor.user().profile.lobby) {
            return Lobbies.findOne(Meteor.user().profile.lobby).users;
        } else {
            return [];
        }
    }
});
