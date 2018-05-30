/**
 * Spawn bullets on an event.
 */
var MobileVRControls = require('../lib/mobile-vr-controls.js');

AFRAME.registerComponent('gun', {
    schema: {
        direction: { type: 'vec3' }, // Direction which the bullets will be fired in
    },

    init: function () {
        // Instantiated gun object based on the schema
        var data = this.data;
        // Reference to the current object (so that we can access it in anonymous function)
        var self = this;

        this.mobileVRControls = new MobileVRControls();
        this.coolingDown = false;  // Limit fire rate.

        // Add keyboard listener.
        window.addEventListener('keydown', function (evt) {
            if (evt.code === 'Space' || evt.keyCode === '32') { 
                self.shoot();
            }
        });

        // Add two separate listeners for mobile - window click and VR click
        if (AFRAME.utils.device.isMobile()) {
            window.addEventListener('click', function (evt) {
                self.shoot();
            });
            this.mobileVRControls.addVRClickListener(function () {
                self.shoot();
            });
        }
    },

    shoot: (function () {
        // Initialize empty 3d vectors / quaternion to use
        var direction = new THREE.Vector3();
        var position = new THREE.Vector3();
        var quaternion = new THREE.Quaternion();
        var scale = new THREE.Vector3();
        var translation = new THREE.Vector3();

        return function () {
            var bulletEntity;
            var data = this.data;
            var matrixWorld;
            var self = this;

            if (this.coolingDown) { 
                return;
            }

            // Get firing entity's transformations.

            // Make sure to get the latest child object's updated matrix world to account for
            // Parent/child object's transformation changes
            this.el.object3D.updateMatrixWorld();
            matrixWorld = this.el.object3D.matrixWorld;
            // Copy the gun's transformation matrix position
            position.setFromMatrixPosition(matrixWorld);
            // Decompose the current matrix into position, quaternion and scale components.
            matrixWorld.decompose(translation, quaternion, scale);

            // Set projectile direction.
            direction.set(data.direction.x, data.direction.y, data.direction.z);
            direction.applyQuaternion(quaternion);
            direction.normalize();

            // Ask system for bullet and set bullet position to starting point.
            bulletEntity = this.el.sceneEl.systems.bullet.getBullet("playerbullet");
            bulletEntity.setAttribute('position', position);
            bulletEntity.setAttribute('bullet', {
                direction: direction.clone(),
                position: position.clone(),
            });
            bulletEntity.setAttribute('visible', true);
            bulletEntity.setAttribute('position', position);
            bulletEntity.play();

            // Set cooldown period.
            this.coolingDown = true;
            setTimeout(function () {
                self.coolingDown = false;
            }, 100);
        };
    })()
});
