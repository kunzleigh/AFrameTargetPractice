AFRAME.registerComponent('bullet', {
    schema: {
        name: { default: '' },
        direction: { type: 'vec3' },
        maxSpeed: { default: 1.0 },
        initialSpeed: { default: 0.1 },
        position: { type: 'vec3' },
        acceleration: { default: 0.4 },
        color: { default: '#fff' }
    },

    /**
     * Lifecycle hook invoked on initialization of the component
     */
    init: function () {
        // Reference to the starting enemy
        this.startEnemy = document.getElementById('start_enemy');
        // Get the registered bullet from our pool
        // This should've already been created in our gun component
        this.bullet = PEWVR.BULLETS[this.data.name];
        // Call the initialization function on the registered bullet (setting scale, material, etc.)
        // See player.js for how bullet registration is done
        this.bullet.definition.init.call(this);
        // Property to keep track of whether the bullet has hit a target
        this.hit = false;
        // Empty 3d vector for the current bullet's direction
        this.direction = new THREE.Vector3();
        // Temporary object we will work with to store and modify direction/position properties of our bullet
        this.temps = {
            direction: new THREE.Vector3(),
            position: new THREE.Vector3()
        }
    },

    /**
     * Lifecycle hook invoked whenever a property of the bullet object has been updated
     * @param: oldData: Reference to the old bullet data (unused here)
     */
    update: function (oldData) {
        // Update the acceleration/speed/starting position of the bullet entity
        var newData = this.data;
        this.direction.set(newData.direction.x, newData.direction.y, newData.direction.z);
        this.currentAcceleration = newData.acceleration;
        this.speed = newData.initialSpeed;
        this.startPosition = newData.position;
    },

    /**
     * Lifecycle hook invoked called on each rendering of the frame
     * @param time: Current timestamp in milliseconds (unused here)
     * @param delta: Time difference since the last frame's rendering in millliseconds
     */
    tick: function tick(time, delta) {
        // Align the bullet to its direction
        this.el.object3D.lookAt(this.direction.clone());

        // Update speed based on acceleration
        this.speed = this.currentAcceleration * .1 * delta;
        // Cap the speed
        if (this.speed > this.data.maxSpeed) { 
            this.speed = this.data.maxSpeed; 
        }

        // Set new bullet position
        this.temps.position.copy(this.el.getAttribute('position'));
        this.temps.direction.copy(this.direction);
        var newBulletPosition = this.temps.position.add(this.temps.direction.multiplyScalar(this.speed));
        this.el.setAttribute('position', newBulletPosition);

        // Check if the bullet is lost in the sky
        if (this.temps.position.length() >= 25) {
            this.resetBullet();
            return;
        }

        var state = this.el.sceneEl.getAttribute('gamestate').state;
        if (state === 'STATE_INIT') {
            // Detect collision with the start game enemy
            if (this.hasCollidedWithBullet(this.startEnemy, newBulletPosition)) {
                this.hitObject(this.startEnemy);
            }
        } else {
            // Detect collisions with all the active enemies
            var enemies = this.el.sceneEl.systems.enemy.activeEnemies;
            for (var i = 0; i < enemies.length; i++) {
                if (this.hasCollidedWithBullet(enemies[i], newBulletPosition)) {
                    this.hitObject(enemies[i]);
                    return;
                }
            }
        }
    },

    /**
     * Performs a collision check on the bullet against an enemy.
     * If the bullet is within the enemy radius + bulletRadius, the bullet has
     * collided with the enemy.
     * 
     * @param enemy: Enemy entity
     * @param bulletPosition: Position of the bullet (Vector3) 
     * @returns True if collision occured, false otherwise
     */
    hasCollidedWithBullet: function (enemy, bulletPosition) {
        var bulletCollisionHelper = this.el.getAttribute('collision-helper');
        var bulletRadius = bulletCollisionHelper.radius;

        var enemyCollisionHelper = enemy.getAttribute('collision-helper');
        var enemyRadius = enemyCollisionHelper.radius;

        if (bulletPosition.distanceTo(enemy.object3D.position) < enemyRadius + bulletRadius) {
            return true;
        }
        return false;
    },

    /**
     * Handler for bullet hitting an enemy. Creates an explosion and calls reset bullet method
     * @param enemyEntity Enemy Entity
     */
    hitObject: function (enemyEntity) {
        this.hit = true;
        // Get the data property off the entity
        var enemyData = enemyEntity.getAttribute('enemy');
        // Create an explosion based on where the enemy is
        this.el.sceneEl.systems.explosion.createExplosion('enemy', enemyEntity.object3D.position, enemyData.color, enemyData.scale, this.direction, enemyData.name);
        this.resetBullet()
        // Call collided method on the enemy component and let it handle its collision properly
        enemyEntity.components.enemy.collided();
    },

    /**
     * Resets the bullet's properties and returns the bullet to the pool
     */
    resetBullet: function () {
        this.hit = false;
        this.speed = this.data.initialSpeed;

        // You can reference the system directly if the component's name is the same as the entity's name
        this.system.returnBullet(this.data.name, this.el);
    },
});
