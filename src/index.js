window.PEWVR = {};

// Assets managment
require('./a-asset-image.js')

require('./lib/utils.js');

// Systems.
require('./systems/bullet.js');
require('./systems/enemy.js');
require('./systems/explosion.js');

// Bullet registration for player
require('./bullets/player.js');

// Enemies.
require('./enemies/enemy_start.js');
require('./enemies/enemy_target.js');

// Components
require('./components/curve-movement.js');
require('./components/collision-helper.js');
require('./components/gamestate.js');
require('./components/bullet.js');
require('./components/enemy.js');
require('./components/gun.js');
require('./components/json-model.js');
require('./components/explosion.js');
