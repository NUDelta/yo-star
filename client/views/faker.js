Template.faker.helpers({
    lobbies: function() {
        return Lobbies.find();
    },
    getUser: function(username) {
        return Meteor.users.findOne({ username: username });
    },
    fakeUsers: function() {
        return Meteor.users.find({ 'profile.fake': true, 'profile.lobby': this._id });
    },
    fakeCount: function() {
        console.log('fakeCount');
        return Meteor.users.find({ 'profile.fake': true, 'profile.lobby': this._id }).count();
    },
    realCount: function() {
        // This query's not working, but it  should
        return Meteor.users.find({ 'profile.lobby': this._id, 'profile.fake': { $ne: true } }).count();
    },
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
        Meteor.call('createFakeUser', userObject);
    },
    'click #deleteFake': function(event, template) {
        let userId = event.target.getAttribute('user');
        Meteor.users.remove(userId);
    }
});
