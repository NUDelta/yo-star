let MAP_ZOOM = 17;

Template.live.onCreated(function() {
    GoogleMaps.ready('map', (map) => {
        let primaryMarker, otherMarkers = {};
        this.autorun(function() {
            console.log('I just ran!');

            Meteor.users.find({ lobby: Meteor.user().lobby }).forEach(function(user) {
                let latLng = user.profile.location;
                if (latLng != 0 && user._id != Meteor.userId()) {
                    if (!(user._id in otherMarkers)) {
                        otherMarkers[user._id] = new google.maps.Marker({
                            position: new google.maps.LatLng(latLng.lat, latLng.lng),
                            map: map.instance,
                            icon: 'grey-dot.png'
                        });
                    } else {
                        otherMarkers[user._id].setPosition(latLng)
                    }
                } else if (latLng == 0 && user._id in otherMarkers) {
                    otherMarkers[user._id].setMap(null);
                    delete otherMarkers[user._id];
                }
            });

            let latLng = Geolocation.latLng();
            if (latLng) {
                Meteor.users.update(Meteor.userId(), {$set: {'profile.location': latLng}});
                if (!primaryMarker) {
                    primaryMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance,
                        icon: 'blue-dot.png'
                    });
                }
                else {
                    primaryMarker.setPosition(latLng);
                }

                map.instance.setCenter(primaryMarker.getPosition());
                map.instance.setZoom(MAP_ZOOM);
            }
        });
    });
});

Template.live.helpers({
    geolocationError: function() {
        let error = Geolocation.error();
        return error && error.message;
    },
    mapOptions: function() {
        let latLng = Geolocation.latLng();
        // Initialize the map once we have the latLng.
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: MAP_ZOOM
            };
        }
    }
});
