import Ember from 'ember';


var poney = Ember.Object.extend(Ember.Evented, {
    generatePoney: function() {
        var imgPoney = $("<img>");
        imgPoney.addClass("poney");
        var horizontalPosition = Math.random() * 100;
        if (horizontalPosition <= 50) {
            imgPoney.css("left", horizontalPosition+"%");
        } else {
            imgPoney.css("right", 100-horizontalPosition+"%");
        }
        imgPoney.attr("src", "/assets/img/poney_fall.gif");
        
        var currentPoney = this;
        imgPoney[0].onload = function() {
            currentPoney.move(imgPoney);
        };

        $("#game").append(imgPoney);
    },
    move: function(imgPoney) {
        var transitionEnd = function() {
            console.log(this);
            this.remove();
        }
        imgPoney.on("transitionend", transitionEnd);
        imgPoney.on("webkitTransitionEnd", transitionEnd);
        imgPoney.css("-webkit-transition", "3s linear");
        imgPoney.css("-moz-transition", "3s linear");
        imgPoney.css("-ms-transition", "3s linear");
        imgPoney.css("-o-transition", "3s linear");
        imgPoney.css("transition", "3s linear");
        imgPoney.css("top", "100%");
        imgPoney.addClass("move");
    },
    test: function() {
        this.get("managerGame").upScore();
    }
});

var managerGame = Ember.Object.extend(Ember.Evented, {
    score: 0,
    life: 10,
    poneyDie: 0,
    inProgress: function() {
        var currentManager = this;
        var timeBeforeStart = 1;
        $("#game button.start-game").remove();
        $("#game").html("<div class='start-in-progress'>Start in "+timeBeforeStart+" sec</div>");
        var changeTextBeforeStart = function() {
            setTimeout(
                function() {
                    $("#game > div").text("Start in "+timeBeforeStart+" sec");
                    if (timeBeforeStart > 0) {
                        timeBeforeStart--;
                        changeTextBeforeStart();
                    } else {
                        currentManager.trigger("inProgressFinished");
                    }
                },
                1000
            );
        }
        changeTextBeforeStart();
    },
    startGame: function() {
        $("#game").html("");
        var currentManager = this;
        var runStepGame = function() {
            setTimeout(
                function() {
                    currentManager.generatePoney();
                    currentManager.looseOneLife();
                    if (!currentManager.isLoose()) {
                        runStepGame();
                    } else {
                        currentManager.trigger("gameOver");
                    }
                },
                1000-currentManager.poneyDie
            );
        }
        runStepGame();
    },
    looseOneLife: function() {
        this.life--;
        this.poneyDie++;
        this.trigger("changeLife");
    },
    winOneLife: function() {
        if (this.isLoose) {
            return;
        }
        this.life++;
        this.trigger("changeLife");
    },
    upScore: function() {
        this.score++;
        this.trigger("changeScore");
    },
    isLoose: function() {
        return this.life <= 0 ? true : false;
    },
    generatePoney: function() {
        var newPoney = poney.create({managerGame: this});
        newPoney.generatePoney();
    }
});

export default Ember.Controller.extend({
    managerGame: null,
    actions: {
        startGame: function() {
            var mainController = this;
            this.managerGame = managerGame.create();
            mainController.set('model.life', this.managerGame.life);

            // life change.
            this.managerGame.on("changeLife", function() {
                mainController.set('model.life', this.life);
            });

            // score change.
            this.managerGame.on("changeScore", function() {
                mainController.set('model.score', this.score);
            });
            
            // event on gameover.
            // this.managerGame.on("gameOver", function() {
            //     // ask name and register score.
            //     var name = prompt("Please enter your name", "Pinkie Pie");
            //     if (name != null) {
            //         var newUser = mainController.store.createRecord('user', {
            //             name: name,
            //             score: this.score
            //         });
            //         newUser.save();
            //     }
            //     mainController.transitionToRoute("scores");
            // });

            // start game.
            this.managerGame.on("inProgressFinished", function() {
                this.startGame();
            });
            this.managerGame.inProgress();
        }
    }
});
