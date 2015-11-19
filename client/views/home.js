Template.home.events({
    'click .btn-join-lobby': function(event, template) {
        event.preventDefault();
        Meteor.call('joinLobby', Meteor.user(), function(error, results) {
            console.log(Meteor.user());
            var createdAt = Lobbies.findOne(Meteor.user().profile.lobby).createdAt;
            console.log('createdAt: ' + createdAt);
            Session.set('createdAt', createdAt);
            var timer = Math.floor((Date.now() - Date.parse(Session.get('createdAt'))) / 1000);

            console.log("timer: " + timer);
            Session.set('timer', timer);
        });
    },
    'click .btn-leave-lobby': function(event, template) {
        event.preventDefault();
        Meteor.call('leaveLobby', Meteor.user());
        Session.set('timer', undefined);
    },
    'click .btn-logout': function(event, template) {
        Meteor.logout();
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

Template.home.onCreated(function() {
    Session.set('timer', undefined);

    let lobbyInterval = setInterval(function() {
        Session.set('timer', Session.get('timer') + 1);
        if (Session.get('timer') > 29 && Session.get('timer') < 31) {
            Session.set('win', false);
            Meteor.call('makeLobbyActive', Meteor.user().profile.lobby);
            Router.go('live');
        }

        if (Session.get('timer') > 570) {
            Meteor.call('makeLobbyInactive', Meteor.user().profile.lobby);
            Router.go('home');
            Meteor.call('leaveLobby', Meteor.user());
            clearInterval(lobbyInterval);
        }
    }, 1000);
});


Template.home.helpers({
    timer: function() {
        if (Session.get('timer') != undefined) {
            return 30 - Session.get('timer');
        }
    },
    timerIsRunning: function() {
        if (Session.get('timer') && Session.get('timer') !== NaN) {
            return true;
        } else {
            return false;
        }
    },
    usersInLobby: function() {
        if (Meteor.user() && Meteor.user().profile.lobby) {
            return Lobbies.findOne(Meteor.user().profile.lobby).users;
        } else {
            return [];
        }
    },
    win: function() {
        if (Session.get('win')) {
            return "Congratulations, you won!";
        }
    }
});
