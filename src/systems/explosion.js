var PoolHelper = require('../lib/poolhelper.js');

SP.EXPLOSIONS = {};

SP.registerExplosion = function (name, data, definition) {
    if (SP.EXPLOSIONS[name]) {
        throw new Error('The explosion `' + name + '` has been already registered. ' +
            'Check that you are not loading two versions of the same explosion ' +
            'or two different enemies of the same name.');
    }

    SP.EXPLOSIONS[name] = {
        poolSize: data.poolSize,
        components: data.components,
        definition: definition,
        name: name
    };

    console.info('Explosion registered ', name);
};

AFRAME.registerSystem('explosion', {
    init: function () {
        this.poolHelper = new PoolHelper('explosion', SP.EXPLOSIONS, this.sceneEl);
        this.activeExplosions = [];
    },

    reset: function (entity) {
        var self = this;
        this.activeExplosions.forEach(function (entity) {
            self.returnToPool(entity.getAttribute('explosion').name, entity);
        });
    },

    returnToPool: function (name, entity) {
        this.activeExplosions.splice(this.activeExplosions.indexOf(entity), 1);
        this.poolHelper.returnEntity(name, entity);
    },

    getFromPool: function (name) {
        var entity = this.poolHelper.requestEntity(name);
        this.activeExplosions.push(entity);
        return entity;
    },

    createExplosion: function (type, position, color, scale, direction, enemyName) {
        var explosionEntity = this.getFromPool(type);
        explosionEntity.setAttribute('position', position || this.el.getAttribute('position'));
        explosionEntity.setAttribute('explosion', {
            type: type,
            lookAt: direction.clone(),
            color: color || '#FFF',
            scale: scale || 1.0
        });

        explosionEntity.setAttribute('visible', true);

        explosionEntity.play();
    }
});


SP.registerExplosion(
    // name
    'enemy',
    // data
    {
        components: {
            explosion: {
                type: 'enemy',
            },
        },
        poolSize: 10
    },
    // implementation
    {
    }
);
