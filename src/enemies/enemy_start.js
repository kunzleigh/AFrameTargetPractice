SP.registerEnemy(
    // name
    'enemy_start',
    // data
    {
        components: {
            enemy: {
                name: 'enemy_start',
                color: '#FFB911',
                scale: 0.1,
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
        poolSize: 1
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
        onHit: function (type) { }
    }
);
