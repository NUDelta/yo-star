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
                            icon: 'blue-dot.png'
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
                primaryMarker.setIcon('green-dot.png');

                // Kicks out users back to the lobby.
                setTimeout(function() {
                    Meteor.call('makeLobbyActive', Meteor.user().profile.lobby);
                    Router.go('home');
                }, 5000);
            } else {
                locationUtil.turnGrey(otherMarkers);
                primaryMarker.setIcon('blue-dot.png');
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
        let userLats = [];
        let userLngs = [];
        let points = [];
        if (Meteor.user()) {
            Meteor.users.find({
                'profile.lobby': Meteor.user().profile.lobby,
                'profile.isInLobby': true
            }).forEach(function(user) {
                points.push({ x: user.profile.location.lat, y: user.profile.location.lng });
            });
            let dp = douglasPeucker(points, 0.001);
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

function linearRegression(x, y) {
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
        sum_xy += (x[i] * y[i]);
        sum_xx += (x[i] * x[i]);
        sum_yy += (y[i] * y[i]);
    }

    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x) / n;
    lr['r2'] = Math.pow((n * sum_xy - sum_x * sum_y) / Math.sqrt((n * sum_xx - sum_x * sum_x) * (n * sum_yy - sum_y * sum_y)), 2);

    return lr;
}

function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;

    this.distanceToPoint = function(point) {
        if (this.p1.x == this.p2.x && (this.p1.y == this.p2.y)) {
            return Math.sqrt(Math.pow((point.y - this.p1.y), 2) + Math.pow((point.x - this.p1.x), 2));
        }

        // slope
        var m = (this.p2.x - this.p1.x) / (this.p2.y - this.p1.y),
            // y offset
            b = this.p1.x - (m * this.p1.y),
            d = [];
        // distance to the linear equation
        d.push(Math.abs(point.x - (m * point.y) - b) / Math.sqrt(Math.pow(m, 2) + 1));
        // distance to p1
        d.push(Math.sqrt(Math.pow((point.y - this.p1.y), 2) + Math.pow((point.x - this.p1.x), 2)));
        // distance to p2
        d.push(Math.sqrt(Math.pow((point.y - this.p2.y), 2) + Math.pow((point.x - this.p2.x), 2)));
        // return the smallest distance
        return d.sort(function(a, b) {
            return (a - b); //causes an array to be sorted numerically and ascending
        })[0];
    };
};

function douglasPeucker(points, tolerance) {
    //console.log('points this round ', points.map(function(x){return {lat:x.x,lng:x.y}}));

    if (points.length <= 2) {
        return [points[0]];
    }
    var returnPoints = [],
        // make line from start to end
        line = new Line(points[0], points[points.length - 1]),

        // find the largest distance from intermediate poitns to this line
        maxDistance = 0,
        maxDistanceIndex = 0,
        p;

    //      console.log('making line between ' +  points[0].x + ','+points[0].y + ' and ' + points[points.length - 1].x + ','+points[points.length-1].y)

    for (var i = 1; i <= points.length - 2; i++) {

        var distance = line.distanceToPoint(points[i]);

        //      console.log('considering...', points[i].x, points[i].y)
        if (distance > maxDistance) {
            maxDistance = distance;
            maxDistanceIndex = i;
        }
    }

    // console.log('tolerance:', tolerance)
    // console.log('maxDist:', maxDistance)
    // console.log('maxDistIndex:', maxDistanceIndex)

    // check if the max distance is greater than our tollerance allows
    if (maxDistance >= tolerance) {
        p = points[maxDistanceIndex];

        // console.log('including... ', maxDistanceIndex)

        line.distanceToPoint(p, true);
        // include this point in the output
        // console.log('calling with 0 to ', (maxDistanceIndex))

        returnPoints = returnPoints.concat(douglasPeucker(points.slice(0, maxDistanceIndex + 1), tolerance));
        // returnPoints.push( points[maxDistanceIndex] );

        // console.log('calling with  ', (maxDistanceIndex), ' to ', (points.length - 1))

        returnPoints = returnPoints.concat(douglasPeucker(points.slice(maxDistanceIndex, points.length), tolerance));
    } else {
        // ditching this point
        p = points[maxDistanceIndex];

        // console.log('ditching ' + maxDistanceIndex + ': ' + p.x + ', ' + p.y)

        line.distanceToPoint(p, true);
        returnPoints = [points[0]];
    }
    // console.log('returnPoints: ');
    // console.log(returnPoints);
    return returnPoints;
};
