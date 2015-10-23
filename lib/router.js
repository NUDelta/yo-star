Router.onBeforeAction(function() {
  GoogleMaps.load();
  this.next();
}, { only: ['live', 'god'] });

Router.route('/', { name: 'home' });

Router.route('/live/', {
    name: 'live',
    waitOn: function() {
    }
});

Router.route('/faker/', {
    name: 'faker'
});

Router.route('/god/', {
    name: 'god'
});
