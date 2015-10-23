const MAP_ZOOM = 17;

let primaryMarker,
    otherMarkers = {};

Template.god.onCreated(function() {
    GoogleMaps.ready('map', (map) => {
        this.autorun(function() {
            Meteor.users.find().forEach(function(user) {
                let latLng = user.profile.location;
                if (latLng && latLng != 0 && user.profile.isInLobby) {
                    if (!(user._id in otherMarkers)) {
                    	console.log("hit");
                        otherMarkers[user._id] = new google.maps.Marker({
                            position: new google.maps.LatLng(latLng.lat, latLng.lng),
                            map: map.instance,
                            icon: 'grey-dot.png'
                        });
                    } else {
                        otherMarkers[user._id].setPosition(latLng);
                    }
                } else if ((latLng == 0 || !user.profile.isInLobby) && user._id in otherMarkers) {
                    console.log(`${user.username} went offline. Removing.`);
                    otherMarkers[user._id].setMap(null);
                    delete otherMarkers[user._id];
                }
            });


            // refactor this
            if (Template.god.__helpers.get('score')() > 0.999) {
                Object.keys(otherMarkers).forEach((key) => {
                    let marker = otherMarkers[key];
                    marker.setIcon('green-dot.png');
                })
            } else {
                Object.keys(otherMarkers).forEach((key) => {
                    let marker = otherMarkers[key];
                    marker.setIcon('grey-dot.png');
                })
            }
        });
    });
});

Template.god.helpers({
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