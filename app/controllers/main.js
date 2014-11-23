import Ember from 'ember';

/**
 * Class to manage a poney.
 */
var poney = Ember.Object.extend(Ember.Evented, {
    /**
     * Generate HTML to present a poney on the view.
     */
    generatePoney: function() {
        // Generate an img html and add css properties.
        var imgPoney = $("<img>");
        imgPoney.addClass("poney");
        var horizontalPosition = Math.random() * 100;
        if (horizontalPosition <= 50) {
            imgPoney.css("left", horizontalPosition+"%");
        } else {
            imgPoney.css("right", 100-horizontalPosition+"%");
        }

        // add gif.
        imgPoney.attr("src", "/assets/img/poney_fall.gif");

        // event on click.
        imgPoney.click(function(e) {
            e.preventDefault();
            // stop animation, remove html of the view.
            $(this).stop();
            this.remove();

            // dispatch an event to indicate this poney is saved.
            currentPoney.trigger("poneySafe");
        });

        // run move after picture is loaded.
        var currentPoney = this;
        imgPoney[0].onload = function() {
            currentPoney.move(imgPoney);
        };

        // add img html at the view.
        $("#game").append(imgPoney);
    },
    /**
     * Manage move on the view.
     * 
     * @param {string} imgPoney It's html to present the poney.
     */
    move: function(imgPoney) {
        var currentPoney = this;
        // calculate the speed from the current score.
        var timeToMove = 5000-this.get("score")*20;
        timeToMove = timeToMove > 0 ? timeToMove : 0;

        // animate the poney.
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

/**
 * Manage the current game
 */
var managerGame = Ember.Object.extend(Ember.Evented, {
    score: 0,
    life: 10,
    poneyDie: 0,
    /**
     * To start the game.
     */
    inProgress: function() {
        var currentManager = this;
        var timeBeforeStart = 5;
        $("#game button.start-game").remove();
        $("#game").html("<div class='start-in-progress'>Start in "+timeBeforeStart+" sec</div>");
        // to count time before start game.
        var changeTextBeforeStart = function() {
            setTimeout(
                function() {
                    timeBeforeStart--;
                    $("#game > div").text("Start in "+timeBeforeStart+" sec");
                    if (timeBeforeStart > 0) {
                        changeTextBeforeStart();
                    } else {
                        // dispatch event to report the count is finished.
                        currentManager.trigger("inProgressFinished");
                    }
                },
                1000
            );
        }
        changeTextBeforeStart();
    },
    /**
     * Start game.
     */
    startGame: function() {
        $("#game").html("");
        var currentManager = this;
        // present one step
        var runStepGame = function() {
            // calculate time before next pop.
            var timeToPop = 1000-currentManager.poneyDie*2;
            timeToPop = timeToPop > 0 ? timeToPop : 0;
            setTimeout(
                function() {
                    // generate one poney.
                    if (!currentManager.isLoose()) {
                        currentManager.generatePoney();
                        // no loose ? run next step.
                        runStepGame();
                    } else {
                        // loose ? dispatch event to report it's finished.
                        currentManager.trigger("gameOver");
                    }
                },
                timeToPop
            );
        }
        runStepGame();
    },
    /**
     * remove one hp & add one poney died & dispatch event to report.
     */
    looseOneLife: function() {
        this.life--;
        this.poneyDie++;
        this.trigger("changeLife");
    },
    /**
     * add one hp & dispatch event to report. But check before the game isn't loose.
     */
    winOneLife: function() {
        if (this.isLoose()) {
            return;
        }
        this.life++;
        this.trigger("changeLife");
    },
    /**
     * up score & dispatch event to report.
     * @return {[type]} [description]
     */
    upScore: function() {
        this.score++;
        this.trigger("changeScore");
    },
    /**
     * Check if the current game is loose or not.
     */
    isLoose: function() {
        return this.life <= 0 ? true : false;
    },
    /**
     * Generate one poney and add listener on events.
     */
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
    },
    stopGame: function() {
        this.life = 0;
        $("#game img").each(function() {
            $(this).stop();
            $(this).remove();
        });
    }
});

export default Ember.Controller.extend({
    managerGame: null,
    gameIsStopped: false,
    actions: {
        /**
         * Action to start game.
         */
        startGame: function() {
            this.gameIsStopped = false;
            var mainController = this;
            this.managerGame = managerGame.create();
            mainController.set('model.life', this.managerGame.life);

            $("#menu a").click(function() {
                mainController.gameIsStopped = true;
                mainController.managerGame.stopGame();
            });

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
                if(!mainController.gameIsStopped) {
                    var name = prompt("Please enter your name", "Pinkie Pie");
                    if (name != null) {
                        var newUser = mainController.store.createRecord('user', {
                            name: name,
                            score: this.score
                        });
                        newUser.save();
                    }
                    mainController.transitionToRoute("scores");
                }
            });

            // start game.
            this.managerGame.on("inProgressFinished", function() {
                this.startGame();
            });
            this.managerGame.inProgress();
        }
    }
});
