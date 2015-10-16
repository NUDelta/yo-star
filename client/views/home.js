Template.home.events({
    "click .btn-join-lobby": function (event) {
      event.preventDefault();
      Meteor.call("joinLobby", Meteor.user());
  },
      "click .btn-leave-lobby": function (event) {
      event.preventDefault();
      Meteor.call("leaveLobby", Meteor.user());
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
