import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        // get all users.
        return this.store.find('user');
    }
});
