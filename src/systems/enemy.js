var PoolHelper = require('../lib/poolhelper.js');

SP.ENEMIES = {};

SP.registerEnemy = function (name, data, definition) {
    if (SP.ENEMIES[name]) {
        throw new Error('The enemy `' + name + '` has been already registered. ' +
            'Check that you are not loading two versions of the same enemy ' +
            'or two different enemies of the same name.');
    }

    SP.ENEMIES[name] = {
        poolSize: data.poolSize,
        components: data.components,
        definition: definition,
        name: name
    };

    console.info('Enemy registered ', name);
};

AFRAME.registerSystem('enemy', {
    schema: {
        wave: { default: 0 }
    },

    init: function () {
        var self = this;
        var sceneEl = this.sceneEl;

        if (!sceneEl.hasLoaded) {
            sceneEl.addEventListener('loaded', this.init.bind(this));
            return;
        }

        this.poolHelper = new PoolHelper('enemy', SP.ENEMIES, this.sceneEl);

        this.activeEnemies = [];

        sceneEl.addEventListener('gamestate-changed', function (evt) {
            if ('state' in evt.detail.diff) {
                if (evt.detail.state.state === 'STATE_PLAYING') {
                    setTimeout(function () {
                        self.createWave(0);
                    }, 1000);
                }
                else if (evt.detail.state.state === 'STATE_GAME_WIN'
                    || evt.detail.state.state === 'STATE_INIT') {
                    self.reset();
                    return;
                }
            }

            if ('waveSequence' in evt.detail.diff) {
                self.createSequence(evt.detail.state.waveSequence);
            }

            if ('wave' in evt.detail.diff) {
                self.createWave(evt.detail.state.wave);
            }
        });
    },

    getEnemy: function (name) {
        return this.poolHelper.requestEntity(name);
    },

    onEnemyDeath: function (name, entity) {
        if (this.sceneEl.getAttribute('gamestate').state === 'STATE_INIT') {
            this.sceneEl.emit('start-game');
        } else {
            this.poolHelper.returnEntity(name, entity);
            this.sceneEl.emit('enemy-death');
        }
    },

    createSequence: function (sequenceNumber) {
        var self = this;
        setTimeout(function initFirstSequence() {
            self.currentSequence = sequenceNumber;
            var sequence = self.currentWave.sequences[sequenceNumber];
            sequence.enemies.forEach(function createEnemyFromDef(enemyDef) {
                self.createEnemies(enemyDef);
            });
        }, 100);
    },

    createWave: function (waveNumber) {
        this.currentWave = WAVES[waveNumber];
        this.createSequence(0);
        this.sceneEl.emit('wave-created', { wave: this.currentWave });
    },

    createEnemy: function (enemyType, enemyDefinition, timeOffset) {
        var self = this;
        var entity = this.getEnemy(enemyType);

        entity.setAttribute('curve-movement', {
            type: enemyDefinition.movement,
            loopStart: enemyDefinition.loopStart || 1,
            timeOffset: timeOffset || 0
        });

        function activateEnemy(entity) {
            entity.setAttribute('visible', true);
            entity.components['curve-movement'].addPoints(enemyDefinition.points);
            entity.play();
            self.activeEnemies.push(entity);
            self.sceneEl.emit('enemy-spawn', { enemy: entity });
        }

        if (timeOffset) {
            if (timeOffset < 0) {
                entity.setAttribute('visible', false);
                setTimeout(function () {
                    activateEnemy(entity);
                }, -timeOffset);
            } else {

            }
        } else {
            activateEnemy(entity);
        }
    },

    createEnemies: function (enemyDefinition) {
        if (Array.isArray(enemyDefinition.type)) {
            for (var i = 0; i < enemyDefinition.type.length; i++) {
                var type = enemyDefinition.type[i];
                var timeOffset = (enemyDefinition.enemyTimeOffset || 0) * i;
                this.createEnemy(type, enemyDefinition, timeOffset);
            }
        } else {
            this.createEnemy(enemyDefinition.type, enemyDefinition);
        }
    },

    reset: function (entity) {
        var self = this;
        this.activeEnemies.forEach(function (enemy) {
            self.poolHelper.returnEntity(enemy.getAttribute('enemy').name, enemy);
        });
    }
});
