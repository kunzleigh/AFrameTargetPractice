AFRAME.registerComponent('bullet', {
    schema: {
        name: { default: '' },
        direction: { type: 'vec3' },
        maxSpeed: { default: 5.0 },
        initialSpeed: { default: 5.0 },
        position: { type: 'vec3' },
        acceleration: { default: 0.5 },
        destroyable: { default: false },
        color: { default: '#fff' }
    },

    init: function () {
        // Reference to the starting enemy
        this.startEnemy = document.getElementById('start_enemy');
        // Get the registered bullet from our pool
        // This should've already been created in our gun component
        this.bullet = PEWVR.BULLETS[this.data.name];
        // Call the initialization function on the registered bullet
        // See player.js for how bullet registration is done
        this.bullet.definition.init.call(this);
        this.hit = false;
        // Empty 3d vector for the current bullet's direction
        this.direction = new THREE.Vector3();
        // Temporary object we will work with to store and modify direction/position properties of our bullet
        this.temps = {
            direction: new THREE.Vector3(),
            position: new THREE.Vector3()
        }
    },

    update: function (oldData) {
        // Update the acceleration/speed/starting position of the bullet entity
        var data = this.data;
        this.direction.set(data.direction.x, data.direction.y, data.direction.z);
        this.currentAcceleration = data.acceleration;
        this.speed = data.initialSpeed;
        this.startPosition = data.position;
    },

    hitObject: function (data) {
        this.bullet.definition.onHit.call(this);
        this.hit = true;
        var enemy = data.getAttribute('enemy');
        this.el.sceneEl.systems.explosion.createExplosion('enemy', data.object3D.position, enemy.color, enemy.scale, this.direction, enemy.name);
        PEWVR.currentScore.validShoot++;
        this.resetBullet();
    },

    handleEnemyHit: function (enemy, bulletPosition) {
        var bulletCollisionHelper = this.el.getAttribute('collision-helper');
        var bulletRadius = bulletCollisionHelper.radius;

        var enemyCollisionHelper = enemy.getAttribute('collision-helper');
        var enemyRadius = enemyCollisionHelper.radius;

        if (bulletPosition.distanceTo(enemy.object3D.position) < enemyRadius + bulletRadius) {
            enemy.emit('hit');
            this.hitObject(enemy);
            return true;
        }
        return false;
    },

    resetBullet: function () {
        this.hit = false;

        this.direction.set(this.data.direction.x, this.data.direction.y, this.data.direction.z);

        this.currentAcceleration = this.data.acceleration;
        this.speed = this.data.initialSpeed;
        this.startPosition = this.data.position;

        this.system.returnBullet(this.data.name, this.el);
    },

    tick: function tick(time, delta) {
        // Align the bullet to its direction
        this.el.object3D.lookAt(this.direction.clone().multiplyScalar(1000));

        // Update acceleration based on the friction
        this.temps.position.copy(this.el.getAttribute('position'));

        // Update speed based on acceleration
        this.speed = this.currentAcceleration * .1 * delta;
        if (this.speed > this.data.maxSpeed) { this.speed = this.data.maxSpeed; }

        // Set new bullet position
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
            this.handleEnemyHit(this.startEnemy, newBulletPosition);
        } else {
            // Detect collisions with all the active enemies
            var enemies = this.el.sceneEl.systems.enemy.activeEnemies;
            for (var i = 0; i < enemies.length; i++) {
                if (this.handleEnemyHit(enemies[i], newBulletPosition)) {
                    return;
                }
            }
        }
    }
});
