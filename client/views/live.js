let MAP_ZOOM = 17,
    locationId = 0;

Template.live.onCreated(function() {
    GoogleMaps.ready('map', (map) => {
        let primaryMarker, otherMarkers = {};
        this.autorun(function() {
            console.log('I just ran!');
            let latLng = Geolocation.latLng();

            if (latLng) {
                Meteor.users.update(Meteor.userId(), {$set: {'profile.location': latLng}});
                if (!primaryMarker) {
                    primaryMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance
                    });
                }
                else {
                    primaryMarker.setPosition(latLng);
                }

                map.instance.setCenter(primaryMarker.getPosition());
                map.instance.setZoom(MAP_ZOOM);
            }

            Meteor.users.find().forEach(function(user) {
                let latLng = user.profile.location;
                if (!(user._id in otherMarkers) && user._id != Meteor.userId()) {
                    otherMarkers[user._id] = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance
                    });
                } else if (user._id != Meteor.userId()){
                    otherMarkers[document.user].setPosition(latLng)
                }
            });
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
