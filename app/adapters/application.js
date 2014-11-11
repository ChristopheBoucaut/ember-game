import DS from 'ember-data';

var adapter = DS.LSAdapter.extend({
    namespace: 'ember-game'
});

export default adapter;