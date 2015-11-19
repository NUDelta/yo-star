locationUtil = {
    // Creates or updates location marker for every user in the lobby, except
    // the current client.
    updateLocations: (map, markers) => {
        Meteor.users.find({
            'profile.lobby': Meteor.user().profile.lobby
        }).forEach(function(user) {
            let latLng = user.profile.location;
            if (latLng && latLng != 0 && user._id != Meteor.userId() && user.profile.isInLobby) {
                if (!(user._id in markers)) {
                    markers[user._id] = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance,
                        icon: 'grey-dot.png'
                    });
                } else {
                    markers[user._id].setPosition(latLng)
                }
            } else if ((latLng == 0 || !user.profile.isInLobby) && user._id in markers) {
                console.log(`${user.username} went offline. Removing.`);
                markers[user._id].setMap(null);
                delete markers[user._id];
            }
        });
    },

    turnGreen: (markers) => {
      Object.keys(markers).forEach((key) => {
          let marker = markers[key];
          marker.setIcon('green-dot.png');
      });
    },

    turnGrey: (markers) => {
      Object.keys(markers).forEach((key) => {
          let marker = markers[key];
          marker.setIcon('grey-dot.png');
      });
    }
}
