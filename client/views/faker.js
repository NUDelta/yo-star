Template.faker.helpers({
    lobbies: function() {
        return Lobbies.find();
    },
    getUser: function(username) {
        console.log(username);
        return Meteor.users.findOne({ username: username });
    }
});

Template.faker.onRendered(function() {

});
