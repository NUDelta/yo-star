Template.faker.helpers({
    lobbies: function() {
        return Lobbies.find();
    },
    getUser: function(username) {
        return Meteor.users.findOne({ username: username });
    },
    fakeUsers: function() {
        return Meteor.users.find({ 'profile.fake': true, 'profile.lobby': this._id});
    }
});

Template.faker.events({
    'keyup form': function(event, template) {
        event.preventDefault();
        let userId = event.currentTarget.getAttribute('user'),
            lat = parseFloat(event.currentTarget.lat.value),
            lng = parseFloat(event.currentTarget.lng.value),
            location = { lat: lat, lng: lng };

        if (lat && lng) {
            Meteor.users.update(userId, { $set: { 'profile.location': location } });
        }
    },
    'submit form': function(event, template) {
        event.preventDefault();
    },
    'click #makeFake': function(event, template) {
        let randomNum = Math.round(Math.random() * 10000),
            lobby = event.target.getAttribute('lobby'),
            userObject = {
                username: `test${randomNum}`,
                password: 'password',
                profile: {
                    lobby: lobby,
                    isInLobby: true,
                    fake: true,
                }
            };
        Accounts.createUser(userObject, (err) => {
            Meteor.logout();
        });
    },
    'click #deleteFake': function(event, template) {
        let userId = event.target.getAttribute('user');
        Meteor.users.update(userId, { $set: { 'profile.isInLobby': false } });
        Meteor.setTimeout(function() {
            Meteor.users.remove(userId);
        }, 1000);
    }
});
