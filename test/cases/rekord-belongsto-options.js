module( 'Rekord belongsTo options' );

test( 'model string', function(assert)
{
  var prefix = 'belongsTo_model_string_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: 'belongsTo_model_string_user',
        local: 'created_by'
      }
    }
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  strictEqual( Task.Database.relations.creator.model, User );
});

test( 'model reference', function(assert)
{
  var prefix = 'belongsTo_model_reference_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  strictEqual( Task.Database.relations.creator.model, User );
});

test( 'store none', function(assert)
{
  var prefix = 'belongsTo_store_none_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        store: Rekord.Store.None
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id,
    $saved: {id: t0.id, name: t0.name, created_by: u0.id}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id
  });
});

test( 'store model', function(assert)
{
  var prefix = 'belongsTo_store_model_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        store: Rekord.Store.Model
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id,
    $saved: {id: t0.id, name: t0.name, created_by: u0.id}, $status: 0,
    creator: {id: u0.id, name: u0.name, $saved: {id: u0.id, name: u0.name}, $status: 0}
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id
  });
});

test( 'store key', function(assert)
{
  var prefix = 'belongsTo_store_key_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        store: Rekord.Store.Key
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id,
    $saved: {id: t0.id, name: t0.name, created_by: u0.id}, $status: 0,
    creator: u0.id
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id
  });
});

test( 'store keys', function(assert)
{
  var prefix = 'belongsTo_store_keys_';

  var User = Rekord({
    name: prefix + 'user',
    key: ['id', 'house_id'],
    fields: ['id', 'house_id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by', 'created_by_house'],
    belongsTo: {
      creator: {
        model: User,
        local: ['created_by', 'created_by_house'],
        store: Rekord.Store.Keys
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({id: 4, house_id: 5, name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
      id: t0.id, name: t0.name, created_by: u0.id, created_by_house: u0.house_id,
      $saved: {id: t0.id, name: t0.name, created_by: u0.id, created_by_house: u0.house_id}, $status: 0,
      creator: [u0.id, u0.house_id]
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id, created_by_house: u0.house_id
  });
});

test( 'save none', function(assert)
{
  var prefix = 'belongsTo_save_none_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        save: Rekord.Save.None
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id,
    $saved: {id: t0.id, name: t0.name, created_by: u0.id}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id
  });
});

test( 'save model', function(assert)
{
  var prefix = 'belongsTo_save_model_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        save: Rekord.Save.Model
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id,
    $saved: {id: t0.id, name: t0.name, created_by: u0.id,
      creator: {
        id: u0.id, name: u0.name
      }
    }, $status: 0
  });

  deepEqual( remote.map.get( t0.id ), {
    id: t0.id, name: t0.name, created_by: u0.id,
    creator: {id: u0.id, name: u0.name}
  });
});

test( 'save key', function(assert)
{
  var prefix = 'belongsTo_save_key_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        save: Rekord.Save.Key
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$save();

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name, created_by: u0.id,
    $saved: {id: t0.id, name: t0.name, created_by: u0.id,
      creator: u0.id
    }, $status: 0
  });

  deepEqual( remote.map.get( t0.id ), {
    id: t0.id, name: t0.name, created_by: u0.id,
    creator: u0.id
  });
});

test( 'auto true', function(assert)
{
  var prefix = 'belongsTo_auto_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        auto: true
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This'});

  deepEqual( remote.lastRecord, {id: t0.id, name: t0.name, created_by: undefined} );

  t0.$set('creator', u0);

  deepEqual( remote.lastRecord, {created_by: u0.id} );
});

test( 'auto false', function(assert)
{
  var prefix = 'belongsTo_auto_false_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        auto: false
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This'});

  deepEqual( remote.lastRecord, {id: t0.id, name: t0.name, created_by: undefined} );

  t0.$set('creator', u0);

  notDeepEqual( remote.lastRecord, {created_by: u0.id} );
  deepEqual( remote.lastRecord, {id: t0.id, name: t0.name, created_by: undefined} );
  strictEqual( t0.created_by, u0.id );
});

test( 'property true', function(assert)
{
  var prefix = 'belongsTo_property_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        property: true
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  var u1 = User.create({name: 'Me'});

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );

  t0.$set( 'creator', u1 );

  notOk( u0.$isDeleted() );

  strictEqual( t0.creator, u1 );
});

test( 'property false', function(assert)
{
  var prefix = 'belongsTo_property_false_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        property: false
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, void 0 );
});

test( 'dynamic true', function(assert)
{
  var prefix = 'belongsTo_dynamic_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        property: true,
        dynamic: true
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var u1 = User.create({name: 'Us'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.creator = u1;

  strictEqual( t0.creator, u1 );
  strictEqual( t0.created_by, u1.id );
});

test( 'local default', function(assert)
{
  var prefix = 'belongsTo_local_default_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'belongsTo_local_default_user_id'],
    belongsTo: {
      creator: {
        model: User
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.belongsTo_local_default_user_id, u0.id );
});

test( 'local custom', function(assert)
{
  var prefix = 'belongsTo_local_custom_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.created_by, u0.id );
});

test( 'cascade none', function(assert)
{
  var prefix = 'belongsTo_cascade_none_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.None
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade local', function(assert)
{
  var prefix = 'belongsTo_cascade_local_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.Local
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, t0.id, 'local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade rest', function(assert)
{
  var prefix = 'belongsTo_cascade_rest_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.Rest
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, t0, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade nolive', function(assert)
{
  var prefix = 'belongsTo_cascade_nolive_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.NoLive
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, t0, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, t0.id, 'local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade live', function(assert)
{
  var prefix = 'belongsTo_cascade_live_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.Live
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, null, 'rest' );
  strictEqual( live.lastMessage.key, t0.id, 'live' );
  strictEqual( local.lastKey, null, 'local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade norest', function(assert)
{
  var prefix = 'belongsTo_cascade_norest_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.NoRest
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, null, 'rest' );
  strictEqual( live.lastMessage.key, t0.id, 'live' );
  strictEqual( local.lastKey, t0.id, 'local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade remote', function(assert)
{
  var prefix = 'belongsTo_cascade_remote_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.Remote
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted(), 'user deleted' );
  ok( t0.$isDeleted(), 'task deleted' );

  strictEqual( rest.lastModel, t0, 'rest' );
  strictEqual( live.lastMessage.key, t0.id, 'live' );
  strictEqual( local.lastKey, null, 'local' );

  strictEqual( t0.creator, null, 'reference cleared' );
  strictEqual( t0.created_by, null, 'foreign key cleared' );
});

test( 'cascade all', function(assert)
{
  var prefix = 'belongsTo_cascade_all_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.All
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var db = Task.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  ok( t0.$isDeleted() );

  strictEqual( rest.lastModel, t0 );
  strictEqual( live.lastMessage.key, t0.id );
  strictEqual( local.lastKey, t0.id );

  strictEqual( t0.creator, null );
  strictEqual( t0.created_by, null );
});

test( 'lazy true', function(assert)
{
  var prefix = 'belongsTo_lazy_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        lazy: true
      }
    }
  });

  var u0 = User.create({name: 'u0'});
  var t0 = Task.create({name: 't0', created_by: u0.id});

  strictEqual( t0.creator, void 0 );
  strictEqual( t0.$relations.creator, void 0 );

  strictEqual( t0.$get('creator'), u0 );
  strictEqual( t0.creator, u0 );
  notStrictEqual( t0.$relations.creator, void 0 );
});

test( 'lazy false', function(assert)
{
  var prefix = 'belongsTo_lazy_false_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        lazy: false
      }
    }
  });

  var u0 = User.create({name: 'u0'});
  var t0 = Task.create({name: 't0', created_by: u0.id});

  strictEqual( t0.creator, u0 );
  notStrictEqual( t0.$relations.creator, void 0 );
});

test( 'query', function(assert)
{
  var prefix = 'belongsTo_query_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        query: '/user/{created_by}'
      }
    }
  });

  var rest = User.Database.rest;

  rest.queries.put( '/user/6', {
    id: 6, name: 'u0'
  });

  var t0 = Task.create({name: 't0', created_by: 6});

  notStrictEqual( t0.creator, void 0 );
  strictEqual( t0.creator.id, 6 );
  strictEqual( t0.creator.name, 'u0' );

  isInstance( t0.$relations.creator.query, Rekord.Search, 'query exists' );
});

test( 'preserve true', function(assert)
{
  var prefix = 'belongsTo_preserve_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        preserve: true
      }
    }
  });

  var t0 = Task.create({name: 't0', created_by: 23});

  strictEqual( t0.created_by, 23 );
});

test( 'preserve false', function(assert)
{
  var prefix = 'belongsTo_preserve_false_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        preserve: false
      }
    }
  });

  var t0 = Task.create({name: 't0', created_by: 23});

  strictEqual( t0.created_by, null );
});
