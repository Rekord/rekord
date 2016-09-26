module( 'Rekord hasReference options' );

test( 'model string', function(assert)
{
  var prefix = 'hasReference_model_string_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: 'hasReference_model_string_user'
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
  var prefix = 'hasReference_model_reference_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User
      }
    }
  });

  strictEqual( Task.Database.relations.creator.model, User );
});

test( 'store none', function(assert)
{
  var prefix = 'hasReference_store_none_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        store: Rekord.Store.None
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name,
    $saved: {id: t0.id, name: t0.name}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name
  });
});

test( 'store model', function(assert)
{
  var prefix = 'hasReference_store_model_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        store: Rekord.Store.Model
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name,
    $saved: {id: t0.id, name: t0.name}, $status: 0,
    creator: {id: u0.id, name: u0.name, $saved: {id: u0.id, name: u0.name}, $status: 0}
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name
  });
});

test( 'store key', function(assert)
{
  var prefix = 'hasReference_store_key_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        store: Rekord.Store.Key
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name,
    $saved: {id: t0.id, name: t0.name}, $status: 0,
    creator: u0.id
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name
  });
});

test( 'store keys', function(assert)
{
  var prefix = 'hasReference_store_keys_';

  var User = Rekord({
    name: prefix + 'user',
    key: ['id', 'house_id'],
    fields: ['id', 'house_id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        store: Rekord.Store.Keys
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({id: 4, house_id: 5, name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
      id: t0.id, name: t0.name,
      $saved: {id: t0.id, name: t0.name}, $status: 0,
      creator: [u0.id, u0.house_id]
  });
  deepEqual( remote.lastRecord, {
    id: t0.id, name: t0.name
  });
});

test( 'save none', function(assert)
{
  var prefix = 'hasReference_save_none_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        save: Rekord.Save.None
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name,
    $saved: {id: t0.id, name: t0.name}, $status: 0,
  });
  deepEqual( remote.lastRecord, {
      id: t0.id, name: t0.name
  });
});

test( 'save model', function(assert)
{
  var prefix = 'hasReference_save_model_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        save: Rekord.Save.Model
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name,
    $saved: {id: t0.id, name: t0.name,
      creator: {
        id: u0.id, name: u0.name
      }
    }, $status: 0
  });

  deepEqual( remote.map.get( t0.id ), {
    id: t0.id, name: t0.name,
    creator: {id: u0.id, name: u0.name}
  });
});

test( 'save key', function(assert)
{
  var prefix = 'hasReference_save_key_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        save: Rekord.Save.Key
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  deepEqual( local.lastRecord, {
    id: t0.id, name: t0.name,
    $saved: {id: t0.id, name: t0.name,
      creator: u0.id
    }, $status: 0
  });

  deepEqual( remote.map.get( t0.id ), {
    id: t0.id, name: t0.name,
    creator: u0.id
  });
});

test( 'property true', function(assert)
{
  var prefix = 'hasReference_property_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
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

  strictEqual( t0.creator, u1 );
});

test( 'property false', function(assert)
{
  var prefix = 'hasReference_property_false_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
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
  var prefix = 'hasReference_dynamic_true_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    hasReference: {
      creator: {
        model: User,
        property: true,
        dynamic: true
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var u1 = User.create({name: 'Us'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  t0.creator = u1;

  strictEqual( t0.creator, u1 );
});

test( 'query', function(assert)
{
  var prefix = 'hasReference_query_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasReference: {
      creator: {
        model: User,
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
