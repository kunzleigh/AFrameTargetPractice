var PoolHelper = require('../lib/poolhelper.js');

// Global Key-value store for registered bullets
// Useful if you need to have different types of bullets
// In our game, we only have one bullet (playerbullet)
SP.BULLETS = {};

/**
 * Registers a bullet into the bullet system (Ex: Player Bullet).
 * @param {string} name Name of the bullet being registered
 * @param {object} data Data associated with the player bullet
 * @param {object} definition Collection of methods that can be ran with this specific bullet being registered
 */
SP.registerBullet = function (name, data, definition) {
    if (SP.BULLETS[name]) {
        throw new Error('The bullet `' + name + '` has been already registered. ' +
            'Check that you are not loading two versions of the same bullet ' +
            'or two different bullets of the same name.');
    }

    SP.BULLETS[name] = {
        poolSize: data.poolSize,
        components: data.components,
        definition: definition
    };

    console.info('Bullet registered ', name);
};

AFRAME.registerSystem('bullet', {
    /**
     * Perform bullet system initialization
     */
    init: function () {
        this.poolHelper = new PoolHelper('bullet', SP.BULLETS, this.sceneEl);
        this.activeBullets = [];
    },

    /**
     * Retrieves a bullet entity from the pool
     * 
     * @param name Bullet name to request
     */
    getBullet: function (name) {
        var bullet = this.poolHelper.requestEntity(name);
        this.activeBullets.push(bullet);
        return bullet;
    },

    /**
     * Returns the bullet entity back to the object pool
     * 
     * @param name Bullet entity name
     * @param entity Entity to return
     */
    returnBullet: function (name, entity) {
        this.activeBullets.splice(this.activeBullets.indexOf(entity), 1);
        this.poolHelper.returnEntity(name, entity);
    },

    /**
     * Resets the bullet system
     * 
     * Returns all of the active bullets in the scene back to the object pool
     */
    reset: function () {
        var self = this;
        this.activeBullets.forEach(function (bullet) {
            self.returnBullet(bullet.getAttribute('bullet').name, bullet);
        });
    },
});
