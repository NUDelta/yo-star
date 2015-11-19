locationUtil = {
    // Creates or updates location marker for every user in the lobby, except
    // the current client.
    updateLocations: (map, markers) => {
        Meteor.users.find({
            'profile.lobby': Meteor.user().profile.lobby
        }).forEach(function(user) {
            let latLng = user.profile.location;
            if (latLng && latLng != 0 && user.profile.isInLobby) {
                if (!(user._id in markers)) {
                    markers[user._id] = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance,
                        icon: Markers.greyMarker()
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
          marker.setIcon(Markers.greenMarker());
      });
    },

    turnGrey: (markers) => {
      Object.keys(markers).forEach((key) => {
          let marker = markers[key];
          marker.setIcon(Markers.greyMarker());
      });
    },

    getAllPoints: () => {
      let points = [];
      Meteor.users.find({
          'profile.lobby': Meteor.user().profile.lobby,
          'profile.isInLobby': true
      }).forEach(function(user) {
          points.push({ x: user.profile.location.lat, y: user.profile.location.lng });
      });
      return points
    }
};

Markers = {
    greyMarker: () => {
        return new google.maps.MarkerImage('grey-dot.png',
                                            new google.maps.Size(30, 30),
                                            new google.maps.Point(0, 0),
                                            new google.maps.Point(15, 15));
    },

    blueMarker: () => {
        return new google.maps.MarkerImage('blue-dot.png',
                                            new google.maps.Size(30, 30),
                                            new google.maps.Point(0, 0),
                                            new google.maps.Point(15, 15));
    },

    greenMarker: () => {
        return new google.maps.MarkerImage('green-dot.png',
                                            new google.maps.Size(30, 30),
                                            new google.maps.Point(0, 0),
                                            new google.maps.Point(15, 15));
    }
}
