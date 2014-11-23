import Ember from 'ember';

export default Ember.ArrayController.extend({
    sortProperties: ['score'],
    sortAscending: false,
    actions: {
        /**
         * To clear all score.
         */
        clearScores: function() {
            if (confirm("Êtes-vous sûr de vouloir vider la liste des scores ?")) {
                for (var i = this.get("model").content.length - 1; i >= 0; i--) {
                    this.get("model").content[i].destroyRecord();
                };
            }
        }
    }
});
