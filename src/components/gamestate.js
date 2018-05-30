AFRAME.registerComponent('gamestate', {
    schema: {
        // Enemy count in current scene
        numEnemies: { default: 0 },
        // Sequence count left in current wave 
        numSequences: { default: 0 },
        // Number of enemies killed
        points: { default: 0 },
        // Enemy kill count required to win the game
        numEnemiesToWin: { default: 100 },
        // Current state of the game
        state: { default: 'STATE_INIT', oneOf: ['STATE_INIT', 'STATE_PLAYING', 'STATE_GAME_WIN'] },
        // Current wave
        wave: { default: 0 },
        // Current sequence of the wave (Ex: Wave 1-X)
        waveSequence: { default: 0 }
    },

    init: function () {
        // Reference to the current object (so that we can access it in anonymous function)
        var self = this;
        // Reference to the element
        var el = this.el;
        // Instantiated state object based on the schema
        var state = this.data;

        // Handle various events emitted from enemy system

        // Transition into start game state when the starting enemy has been destroyed
        registerHandler('start-game', function (newState) {
            newState.state = 'STATE_PLAYING';
            return newState;
        });

        // Increase the number of enemies available in the scene when a new enemy has been spawned
        registerHandler('enemy-spawn', function (newState) {
            newState.numEnemies++;
            return newState;
        });

        // Record the number of wave sequences available when a new wave starts
        registerHandler('wave-created', function (newState, params) {
            var wave = params.detail.wave;
            newState.numSequences = wave.sequences.length;
            newState.waveSequence = 0;
            return newState;
        });

        // Check for advancing to next wave/wave sequence or ending the game when an enemy has been killed
        registerHandler('enemy-death', function (newState) {
            newState.points++;
            if (newState.points >= self.data.numEnemiesToWin) {
                newState.state = 'STATE_GAME_WIN';
            }

            newState.numEnemies--;
            // All enemies killed, advance wave.
            if (newState.numEnemies === 0) {
                newState.numSequences--;
                newState.waveSequence++;
                if (newState.numSequences === 0) {
                    newState.waveSequence = 0;
                    newState.wave++;
                    if (newState.wave >= WAVES.length) {
                        newState.state = 'STATE_GAME_WIN';
                    }
                }
            }
            return newState;
        });

        // Register a handler for the event
        function registerHandler(event, handler) {
            el.addEventListener(event, function (param) {
                var newState = handler(AFRAME.utils.extend({}, state), param);
                publishState(event, newState);
            });
        }

        // Emit an event with the newly modified state.
        // Various systems will listen to this `gamestate-changed` event and handle it accordingly.
        function publishState(event, newState) {
            var oldState = AFRAME.utils.extend({}, state);
            el.setAttribute('gamestate', newState);
            state = newState;
            el.emit('gamestate-changed', {
                event: event,
                diff: AFRAME.utils.diff(oldState, newState),
                state: newState
            });
        }
    }
});
