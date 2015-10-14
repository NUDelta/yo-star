let MAP_ZOOM = 17,
    locationId = 0;

Template.live.onCreated(function() {
    locationId = Locations.findOne({ user: Meteor.userId() });

    GoogleMaps.ready('map', (map) => {
        let primaryMarker, otherMarkers = {};
        this.autorun(function() {
            let latLng = Geolocation.latLng();

            if (latLng) {
                Locations.update({ _id: locationId }, {$set: { location: latLng }});
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

            Locations.find().forEach(function(document) {
                let latLng = document.location;
                if (!(document.user in otherMarkers) && document.user != Meteor.userId()) {
                    otherMarkers[document.user] = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance
                    });
                } else {
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
