/**
 * Spawn bullets on an event.
 */
var MobileVRControls = require('../lib/mobile-vr-controls.js');

AFRAME.registerComponent('gun', {
  schema: {
    direction: {type: 'vec3'},   // Event to fire bullet.
    on: {default: 'triggerdown'},  // Event to fire bullet.
    spaceKeyEnabled: {default: false},  // Keyboard support.
  },

  init: function () {
    var data = this.data;
    var el = this.el;
    var self = this;

    this.mobileVRControls = new MobileVRControls();
    this.coolingDown = false;  // Limit fire rate.
    this.shoot = this.shoot.bind(this);

    // Add keyboard listener.
    if (data.spaceKeyEnabled) {
      window.addEventListener('keydown', function (evt) {
        if (evt.code === 'Space' || evt.keyCode === '32') { self.shoot(); }
      });
    }
    if (AFRAME.utils.device.isMobile())
    {
      window.addEventListener('click', function (evt) {
        self.shoot();
      });
      this.mobileVRControls.addVRClickListener(function() {
        self.shoot();
      });
    }
  },

  update: function (oldData) {
    if (oldData.on !== this.data.on) {
      this.el.removeEventListener(oldData.on, this.shoot);
      this.el.addEventListener(this.data.on, this.shoot);
    }
  },

  shoot: (function () {
    var direction = new THREE.Vector3();
    var position = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var scale = new THREE.Vector3();
    var translation = new THREE.Vector3();
    var inc = new THREE.Vector3();

    return function () {
      var bulletEntity;
      var el = this.el;
      var data = this.data;
      var matrixWorld;
      var self = this;

      if (this.coolingDown) { return; }

      PEWVR.currentScore.shoots++;

      // Get firing entity's transformations.
      el.object3D.updateMatrixWorld();
      matrixWorld = el.object3D.matrixWorld;
      position.setFromMatrixPosition(matrixWorld);
      matrixWorld.decompose(translation, quaternion, scale);

      // Set projectile direction.
      direction.set(data.direction.x, data.direction.y, data.direction.z);
      direction.applyQuaternion(quaternion);
      direction.normalize();

      inc.applyQuaternion(quaternion);
      position.add(inc);

      // Ask system for bullet and set bullet position to starting point.
      
      bulletEntity = el.sceneEl.systems.bullet.getBullet("default");
      bulletEntity.setAttribute('position', position);
      bulletEntity.setAttribute('bullet', {
        direction: direction.clone(),
        position: position.clone(),
      });
      bulletEntity.setAttribute('visible', true);
      bulletEntity.setAttribute('position', position);
      bulletEntity.play();

      // Communicate the shoot.
      el.emit('shoot', bulletEntity);

      // Set cooldown period.
      this.coolingDown = true;
      setTimeout(function () {
        self.coolingDown = false;
      }, 100);
    };
  })()
});
