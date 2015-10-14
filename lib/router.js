Router.onBeforeAction(function() {
  GoogleMaps.load();
  this.next();
}, { only: ['live'] });

Router.route('/', { name: 'home' });

Router.route('/live/', {
    name: 'live',
    data: function() {
        return Locations.findOne();
    },
    waitOn: function() {
    }
});
