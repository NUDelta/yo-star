const MAP_ZOOM = 17;

let primaryMarker,
    bestFitLine,
    otherMarkers = {};

Template.live.onCreated(function() {
    GoogleMaps.ready('map', (map) => {
        const greyMarker = new google.maps.MarkerImage('grey-dot.png',
                                                        new google.maps.Size(30, 30),
                                                        new google.maps.Point(0, 0),
                                                        new google.maps.Point(15, 15));

        const blueMarker = new google.maps.MarkerImage('blue-dot.png',
                                                        new google.maps.Size(30, 30),
                                                        new google.maps.Point(0, 0),
                                                        new google.maps.Point(15, 15));

        const greenMarker = new google.maps.MarkerImage('green-dot.png',
                                                        new google.maps.Size(30, 30),
                                                        new google.maps.Point(0, 0),
                                                        new google.maps.Point(15, 15));

        this.autorun(function() {
            // REFACTOR ALL OF THIS
            let userLats = [],
                userLngs = [];

            Meteor.users.find({ 'profile.lobby': Meteor.user().profile.lobby }).forEach(function(user) {
                let latLng = user.profile.location;
                userLats.push(latLng.lat * 10000);
                userLngs.push(latLng.lng * 10000);
                if (latLng && latLng != 0 && user._id != Meteor.userId() && user.profile.isInLobby) {
                    if (!(user._id in otherMarkers)) {
                        otherMarkers[user._id] = new google.maps.Marker({
                            position: new google.maps.LatLng(latLng.lat, latLng.lng),
                            map: map.instance,
                            icon: greyMarker
                        });
                    } else {
                        otherMarkers[user._id].setPosition(latLng)
                    }
                } else if ((latLng == 0 || !user.profile.isInLobby) && user._id in otherMarkers) {
                    console.log(`${user.username} went offline. Removing.`);
                    otherMarkers[user._id].setMap(null);
                    delete otherMarkers[user._id];
                }
            });

            // TODO: This will soon be deprecated for non-HTTPS domains.
            let latLng = Geolocation.latLng();
            if (latLng) {
                userLats.push(latLng.lat * 10000);
                userLngs.push(latLng.lng * 10000);
                Meteor.users.update(Meteor.userId(), { $set: {'profile.location': latLng}} );
                if (!primaryMarker) {
                    primaryMarker = new google.maps.Marker({
                        position: new google.maps.LatLng(latLng.lat, latLng.lng),
                        map: map.instance,
                        icon: blueMarker
                    });
                } else {
                    primaryMarker.setPosition(latLng);
                }
            }

            const extend = 4000; // if this is too high, things seem to get messed up? scale dependent.

            let minLat = arrayMin(userLats),
                maxLat = arrayMax(userLats),
                regression = linearRegression(userLats, userLngs);

            let minLng = regression['slope'] * minLat + regression['intercept'],
                maxLng = regression['slope'] * maxLat + regression['intercept'];

            let extMinLat = ((minLng - extend) - regression['intercept']) / regression['slope'],
                extMaxLat = ((maxLng + extend) - regression['intercept']) / regression['slope'];

            let path = [
                new google.maps.LatLng(extMinLat / 10000, minLng / 10000 - (extend / 10000)),
                new google.maps.LatLng(extMaxLat / 10000, maxLng / 10000 + (extend / 10000))
            ];

            if (!bestFitLine) {
                bestFitLine = new google.maps.Polyline({
                    path: path,
                    strokeColor: '#17be32',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                });
                bestFitLine.setMap(map.instance)
            } else {
                bestFitLine.setPath(path);
            }

            if (Template.live.__helpers.get('score')() > 0.95) {
                Object.keys(otherMarkers).forEach((key) => {
                    let marker = otherMarkers[key];
                    marker.setIcon(greenMarker);
                })
                primaryMarker.setIcon(greenMarker);
            } else {
                Object.keys(otherMarkers).forEach((key) => {
                    let marker = otherMarkers[key];
                    marker.setIcon(greyMarker);
                })
                primaryMarker.setIcon(blueMarker);
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
    },
    score: function() {
        let userLats = [];
        let userLngs = [];
        if (Meteor.user()) {
            Meteor.users.find({ 'profile.lobby': Meteor.user().profile.lobby, 'profile.isInLobby': true }).forEach(function(user) {
                userLats.push(user.profile.location.lat * 10000);
                userLngs.push(user.profile.location.lng * 10000);
            });
            let lr = linearRegression(userLngs, userLats);
            console.log('UserLats: ' + userLats);
            console.log('UserLngs: ' + userLngs);
            console.log('R-squared: ' + lr.r2);
            return lr.r2 ? lr.r2 : 0;
        } else {
            return 0;
        }
    }
});

function linearRegression(x, y){
        var lr = {};
        var n = y.length;
        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_xx = 0;
        var sum_yy = 0;

        for (var i = 0; i < y.length; i++) {

            sum_x += x[i];
            sum_y += y[i];
            sum_xy += (x[i]*y[i]);
            sum_xx += (x[i]*x[i]);
            sum_yy += (y[i]*y[i]);
        }

        lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
        lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);

        return lr;
}

function arrayMax(array) {
  return array.reduce((a, b) => Math.max(a, b));
}

function arrayMin(array) {
  return array.reduce((a, b) => Math.min(a, b));
}
