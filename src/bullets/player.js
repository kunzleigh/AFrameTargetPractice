PEWVR.registerBullet(
    // name
    'playerBullet',
    // data
    {
        components: {
            bullet: {
                name: 'playerBullet',
                maxSpeed: 1,
                initialSpeed: 0.1,
                acceleration: 0.4,
                color: '#ffc724'
            },
            'collision-helper': {
                debug: false,
                radius: 0.2
            },
            'json-model': {
                src: '#playerBullet',
                useObjectLoader: true,
            }
        },
        poolSize: 10
    },
    // implementation
    {
        init: function () {
            var el = this.el;
            var color = this.bullet.components.bullet.color;
            el.setAttribute('material', 'color', color);
            el.setAttribute('scale', { x: 0.2, y: 0.2, z: 0.2 });
            this.trail = null;
            var self = this;
            el.addEventListener('model-loaded', function (event) {
                // Reduce size of the bullet so that it doesn't look huge on mobile displays
                self.trail = self.el.getObject3D('mesh').getObjectByName('trail');
                self.trail.scale.setY(0.001);
            });
        },
        onHit: function (type) {
            this.el.setAttribute('material', 'color', '#FFF');
        }
    }
);
