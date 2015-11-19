const MAP_ZOOM = 17;

let otherMarkers = {};

Template.god.onCreated(function() {
    GoogleMaps.ready('map', (map) => {
        this.autorun(function() {
            locationUtil.updateLocations(map, otherMarkers);
            if (Template.god.__helpers.get('score')() === 3) {
                locationUtil.turnGreen(otherMarkers);
            } else {
                locationUtil.turnGrey(otherMarkers);
            }
        });
    });
});

Template.god.events({
    'submit .god-form': function (event) {
      event.preventDefault();
      let message = event.target[0].value;
      Meteor.call('addMessage', message);
    },
    'click .messages-clear': function (event) {
      event.preventDefault();
      Meteor.call('clearMessages');
    }
});

Template.god.helpers({
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
      return Messages.find({}, {sort: {createdAt: -1}});
    },
    score: function() {
      return Template.live.__helpers.get('score')();
    }
});
