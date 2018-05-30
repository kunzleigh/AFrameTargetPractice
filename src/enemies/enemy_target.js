PEWVR.registerEnemy(
    // name
    'enemy_target',
    // data
    {
        components: {
            enemy: {
                name: 'enemy_target',
                color: '#FFB911',
                scale: 0.9,
            },
            'collision-helper': {
                debug: false,
                radius: 0.4
            },
            'json-model': {
                src: 'url(assets/models/target.json)',
                texturePath: 'url(assets/images/)',
            }
        },
        poolSize: 10
    },
    // implementation
    {
        init: function () {
            this.reset();
        },
        reset: function () {
            var el = this.el;
            var sc = this.data.scale;

            el.addEventListener('model-loaded', function (event) {
                el.getObject3D('mesh').scale.set(sc, sc, sc);
            });
            this.lastShoot = undefined;
            this.willShootEmited = false;
        },
        tick: function (time, delta) {
            if (this.lastShoot == undefined) {
                this.lastShoot = time;
            }
        },
        onHit: function (type) { }
    }
);
