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
        imgPoney.click(function(e) {
            e.preventDefault();
            $(this).stop();
            this.remove();
            currentPoney.trigger("poneySafe");
        });

        var currentPoney = this;
        imgPoney[0].onload = function() {
            currentPoney.move(imgPoney);
        };

        $("#game").append(imgPoney);
    },
    move: function(imgPoney) {
        var currentPoney = this;
        var timeToMove = 5000-this.get("score")*20;
        timeToMove = timeToMove > 0 ? timeToMove : 0;
        imgPoney.animate(
            {
                top: "100%"
            },
            timeToMove,
            "linear",
            function() {
                this.remove();
                currentPoney.trigger("poneyDie");
            }
        );
    }
});

var managerGame = Ember.Object.extend(Ember.Evented, {
    score: 0,
    life: 10,
    poneyDie: 0,
    inProgress: function() {
        var currentManager = this;
        var timeBeforeStart = 5;
        $("#game button.start-game").remove();
        $("#game").html("<div class='start-in-progress'>Start in "+timeBeforeStart+" sec</div>");
        var changeTextBeforeStart = function() {
            setTimeout(
                function() {
                    timeBeforeStart--;
                    $("#game > div").text("Start in "+timeBeforeStart+" sec");
                    if (timeBeforeStart > 0) {
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
            var timeToPop = 1000-currentManager.poneyDie*2;
            timeToPop = timeToPop > 0 ? timeToPop : 0;
            setTimeout(
                function() {
                    currentManager.generatePoney();
                    if (!currentManager.isLoose()) {
                        runStepGame();
                    } else {
                        currentManager.trigger("gameOver");
                    }
                },
                timeToPop
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
        if (this.isLoose()) {
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
        var managerGame = this;
        var newPoney = poney.create({score: this.score});

        // Poney is die.
        newPoney.on("poneyDie", function() {
            managerGame.looseOneLife();
        });

        // Poney is safe.
        newPoney.on("poneySafe", function() {
            managerGame.winOneLife();
            managerGame.upScore();
        });
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
            this.managerGame.on("gameOver", function() {
                // ask name and register score.
                var name = prompt("Please enter your name", "Pinkie Pie");
                if (name != null) {
                    var newUser = mainController.store.createRecord('user', {
                        name: name,
                        score: this.score
                    });
                    newUser.save();
                }
                mainController.transitionToRoute("scores");
            });

            // start game.
            this.managerGame.on("inProgressFinished", function() {
                this.startGame();
            });
            this.managerGame.inProgress();
        }
    }
});
