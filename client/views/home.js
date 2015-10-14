/*

    ADD IN JAVASCRIPT CODE HERE.

    Rename and reorder these pages as necessary.

*/

Template.home.onRendered = function () {
    // add javascript to be executed when the template first_view is rendered
};


Template.home.events({
    "click .btn-join-lobby": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      console.log("Trying to join lobby");
      // Insert a task into the collection
      Meteor.call("joinLobby", Meteor.user());
  },
      "click .btn-leave-lobby": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      console.log("Trying to leave lobby");
      // Insert a task into the collection
      Meteor.call("leaveLobby", Meteor.user());
  }
});

Template.home.helpers({
    usersInLobby: function () {
        console.log("get users");
        console.log(Lobbies.findOne({active: false}).users);
        return Lobbies.findOne({active: false}).users;
    }
});