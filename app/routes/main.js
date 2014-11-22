import Ember from 'ember';

export default Ember.Route.extend({
    model: function() {
        return {
            life: 0,
            score: 0
        };
    }
});
