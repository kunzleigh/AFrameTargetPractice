/* global AFRAME */
PEWVR.currentScore = {
    name: '',
    points: 0,
    time: 0,
    shoots: 0,
    validShoot: 0
};

AFRAME.registerComponent('gamestate', {
    schema: {
        numEnemies: { default: 0 },
        numSequences: { default: 0 },
        points: { default: 0 },
        numEnemiesToWin: { default: 100 },
        isGameWin: { default: false },
        state: { default: 'STATE_INIT', oneOf: ['STATE_INIT', 'STATE_PLAYING', 'STATE_GAME_WIN'] },
        wave: { default: 0 },
        waveSequence: { default: 0 }
    },

    init: function () {
        var self = this;
        var el = this.el;
        var state = this.data;

        registerHandler('start-game', function (newState) {
            newState.isGameWin = false;
            newState.state = 'STATE_PLAYING';
            return newState;
        });

        registerHandler('enemy-spawn', function (newState) {
            newState.numEnemies++;
            return newState;
        });

        registerHandler('wave-created', function (newState, params) {
            var wave = params.detail.wave;
            newState.numSequences = wave.sequences.length;
            newState.waveSequence = 0;
            return newState;
        });

        registerHandler('enemy-death', function (newState) {
            newState.points++;
            PEWVR.currentScore.points++;
            if (newState.points >= self.data.numEnemiesToWin) {
                newState.state = 'STATE_GAME_WIN';
                newState.isGameWin = true;
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
                        newState.isGameWin = true;
                    }
                }
            }
            return newState;
        });

        function registerHandler(event, handler) {
            el.addEventListener(event, function (param) {
                var newState = handler(AFRAME.utils.extend({}, state), param);
                publishState(event, newState);
            });
        }

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
