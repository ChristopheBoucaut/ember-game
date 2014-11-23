import Ember from 'ember';

export default Ember.Route.extend({
    model: function(controller) {
        return this.store.find('user');
    }
});
