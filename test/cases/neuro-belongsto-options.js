module( 'Neuro belongsTo options' );

test( 'model string', function(assert)
{
  var prefix = 'belongsTo_model_string_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: 'belongsTo_model_string_user',
        local: 'created_by'
      }
    }
  });

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  strictEqual( Task.Database.relations.creator.model, User );
});

test( 'model reference', function(assert)
{
  var prefix = 'belongsTo_model_reference_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        store: Neuro.Store.None
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        store: Neuro.Store.Model
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        store: Neuro.Store.Key
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

  var User = Neuro({
    name: prefix + 'user',
    key: ['id', 'house_id'],
    fields: ['id', 'house_id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by', 'created_by_house'],
    belongsTo: {
      creator: {
        model: User,
        local: ['created_by', 'created_by_house'],
        store: Neuro.Store.Keys
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        save: Neuro.Save.None
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        save: Neuro.Save.Model
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

test( 'auto true', function(assert)
{
  var prefix = 'belongsTo_auto_true_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

test( 'local default', function(assert)
{
  var prefix = 'belongsTo_local_default_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

test( 'cascade true', function(assert)
{ 
  var prefix = 'belongsTo_cascade_true_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: true
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  u0.$remove();

  ok( u0.$isDeleted() );
  ok( t0.$isDeleted() );
});

test( 'cascade false', function(assert)
{
  var prefix = 'belongsTo_cascade_false_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: false
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  ok( u0.$isSaved() );
  notOk( u0.$isDeleted() );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );

  strictEqual( t0.created_by, u0.id );
  strictEqual( t0.creator, u0 );

  u0.$remove();

  ok( u0.$isDeleted() );
  notOk( t0.$isDeleted() );

  strictEqual( t0.created_by, null );
  strictEqual( t0.creator, null );
});