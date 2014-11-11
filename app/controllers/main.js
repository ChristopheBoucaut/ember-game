import Ember from 'ember';

export default Ember.Controller.extend({
    actions:{
        addUser: function(){
            var store = this.store;

            var newUser = store.createRecord('user', {
                name: this.get("name"),
                score: this.get("score")
            });
            newUser.save();
            console.log(newUser.get("id"));
        }
    }
});
