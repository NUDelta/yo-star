const MAP_ZOOM = 17;

let primaryMarker,
    otherMarkers = {};

Template.live.onCreated(function() {
    GoogleMaps.ready('map', (map) => {
        this.autorun(function() {
            if (Session.get('win') !== true) {
                locationUtil.updateLocations(map, otherMarkers);

                // TODO: This will soon be deprecated for non-HTTPS domains.
                // Does location updates for current client.
                let latLng = Geolocation.latLng();
                if (latLng) {
                    Meteor.users.update(Meteor.userId(), {
                        $set: {
                            'profile.location': latLng
                        }
                    });
                    if (!primaryMarker) {
                        primaryMarker = new google.maps.Marker({
                            position: new google.maps.LatLng(latLng.lat, latLng.lng),
                            map: map.instance,
                            icon: Markers.blueMarker()
                        });
                    } else {
                        primaryMarker.setPosition(latLng);
                    }
                }
            } else {
                console.log('drawing failed');
            }

            // Determines if win condition has been achieved.
            // Changes colors if so.
            if (Template.live.__helpers.get('score')() === 3) {
                Session.set('win', true);
                locationUtil.turnGreen(otherMarkers);
                primaryMarker.setIcon(Markers.greenMarker());

                // Kicks out users back to the lobby.
                setTimeout(function() {
                    Meteor.call('makeLobbyActive', Meteor.user().profile.lobby);
                    Router.go('home');
                }, 5000);
            } else {
                locationUtil.turnGrey(otherMarkers);
                primaryMarker.setIcon(Markers.blueMarker());
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
        if (GoogleMaps.loaded() && latLng) {
            return {
                center: new google.maps.LatLng(latLng.lat, latLng.lng),
                zoom: MAP_ZOOM
            };
        }
    },
    messages: function() {
        return Messages.find({}, {
            sort: {
                createdAt: -1
            }
        });
    },
    score: function() {
        if (Meteor.user()) {
            let points = locationUtil.getAllPoints(),
                dp = shapeUtil.douglasPeucker(points, 0.001);
            return dp.length;
        } else {
            return 0;
        }
    },
    timer: function() {
        if (Session.get('timer') != undefined) {
            return 570 - Session.get('timer');
        }
    }
});
