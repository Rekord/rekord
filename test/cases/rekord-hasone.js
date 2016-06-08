module( 'Rekord hasOne' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasOne_no_initial_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var t0 = Task.create({name: 'This'});

  strictEqual( t0.creator, void 0 );
  strictEqual( t0.created_by, void 0 );
});

test( 'initial value', function(assert)
{
  var prefix = 'hasOne_initial_value_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0.id});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );
});

test( 'initial foreign key', function(assert)
{
  var prefix = 'hasOne_initial_foreign_key_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', created_by: u0.id});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );
});

test( 'ninja remove', function(assert)
{
  var prefix = 'hasOne_ninja_remove_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  u0.$remove();

  strictEqual( t0.creator, null );
  strictEqual( t0.created_by, null );
});

test( 'set', function(assert)
{
  var prefix = 'hasOne_set_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  var u1 = User.create({name: 'Me'});

  t0.$set( 'creator', u1 );

  strictEqual( t0.creator, u1 );
  strictEqual( t0.created_by, u1.id );
});

test( 'relate', function(assert)
{
  var prefix = 'hasOne_relate_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  var u1 = User.create({name: 'Me'});

  t0.$relate( 'creator', u1 );

  strictEqual( t0.creator, u1 );
  strictEqual( t0.created_by, u1.id );
});

test( 'unrelate', function(assert)
{
  var prefix = 'hasOne_unrelate_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$unrelate( 'creator' );

  strictEqual( t0.creator, null );
  strictEqual( t0.created_by, null );
});

test( 'isRelated', function(assert)
{
  var prefix = 'hasOne_isRelated_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  ok( t0.$isRelated( 'creator', u0 ) );
  ok( t0.$isRelated( 'creator', u0.id ) );
  ok( t0.$isRelated( 'creator', {id: u0.id} ) );

  notOk( t0.$isRelated( 'creator', null ) );
  notOk( t0.$isRelated( 'creator', 6 ) );
  notOk( t0.$isRelated( 'creator', {} ) );
});

test( 'get', function(assert)
{
  var prefix = 'hasOne_get_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.$get( 'creator' ), u0 );

  u0.$remove();

  strictEqual( t0.$get( 'creator' ), null );
});

test( 'encode', function(assert)
{
  var prefix = 'hasOne_encode_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by',
        save: Rekord.Save.Model,
        store: Rekord.Store.Model
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  var saving0 = t0.$toJSON( true );
  var storing0 = t0.$toJSON( false );

  deepEqual( saving0, {
    id: t0.id, name: t0.name, created_by: t0.created_by,
    creator: {id: u0.id, name: u0.name}
  });

  deepEqual( storing0, {
    id: t0.id, name: t0.name, created_by: t0.created_by,
    creator: {id: u0.id, name: u0.name,
      $saved: {id: u0.id, name: u0.name}, $status: 0
    }
  });

  t0.$unrelate( 'creator' );

  var saving1 = t0.$toJSON( true );
  var storing1 = t0.$toJSON( false );

  deepEqual( saving1, {
    id: t0.id, name: t0.name, created_by: t0.created_by,
    creator: null
  });

  deepEqual( storing1, {
    id: t0.id, name: t0.name, created_by: t0.created_by,
    creator: null
  });
});

test( 'cascade remove', function(assert)
{
  var prefix = 'hasOne_cascade_remove_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: Rekord.Cascade.All
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  notOk( u0.$isDeleted() );
  notOk( t0.$isDeleted() );

  t0.$remove();

  ok( u0.$isDeleted() );
  ok( t0.$isDeleted() );

  strictEqual( User.Database.store.map.size(), 0 );
  strictEqual( Task.Database.store.map.size(), 0 );
  strictEqual( User.Database.rest.map.size(), 0 );
  strictEqual( Task.Database.rest.map.size(), 0 );
});

test( 'more than one hasOne relationship', function(assert)
{
  var prefix = 'hasOne_more_than_one_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by', 'edited_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      },
      editor: {
        model: User,
        local: 'edited_by'
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var u1 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0, editor: u1});

  strictEqual( t0.created_by, u0.id );
  strictEqual( t0.creator, u0 );
  strictEqual( t0.edited_by, u1.id );
  strictEqual( t0.editor, u1 );

  u1.$remove();

  strictEqual( t0.created_by, u0.id );
  strictEqual( t0.creator, u0 );
  strictEqual( t0.edited_by, null );
  strictEqual( t0.editor, null );

  u0.$remove();

  strictEqual( t0.created_by, null );
  strictEqual( t0.creator, null );
  strictEqual( t0.edited_by, null );
  strictEqual( t0.editor, null );
});

test( 'wait until dependents are saved', function(assert)
{
  var timer = assert.timer();
  var prefix = 'hasOne_wait_dependents_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var trest = Task.Database.rest;
  var urest = User.Database.rest;

  var u0 = new User({name: 'u0'});
  var t0 = new Task({name: 't0', creator: u0});

  urest.delay = 2;
  trest.delay = 2;

  t0.$save();

  expect(9);

  notOk( t0.$isSaved(), 'task not saved since user not saved' );
  notOk( u0.$isSaved(), 'user not saved' );

  wait( 1, function()
  {
    notOk( t0.$isSaved(), 'task not saved since user not saved (2)' );
    notOk( u0.$isSaved(), 'user not saved (2)' );
  });

  wait( 3, function()
  {
    notOk( t0.$isSaved(), 'task not saved since user not saved (3)' );
    ok( u0.$isSaved(), 'user saved' );
  });

  wait( 5, function()
  {
    ok( t0.$isSaved(), 'task saved since user has saved' );
    ok( u0.$isSaved(), 'user saved (2)' );

    strictEqual( t0.creator, u0 );
  });

  timer.run();
});

test( 'clone', function(assert)
{
  var prefix = 'hasOne_clone_';

  var Address = Rekord({
    name: prefix + 'address',
    fields: ['location']
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['address_id', 'name'],
    hasOne: {
      address: {
        model: Address,
        local: 'address_id'
      }
    }
  });

  var u0 = new User({
    name: 'u0',
    address: {
      location: 'everywhere'
    }
  });

  var a0 = u0.address;

  var u1 = u0.$clone( {address:{}} );
  var a1 = u1.address;

  notStrictEqual( a1, a0 );
  ok( a1.id );
  ok( u1.address_id );
  strictEqual( a1.location, 'everywhere' );
  strictEqual( a1.id, u1.address_id );
  notStrictEqual( a1.id, a0.id );
});

test( 'child table', function(assert)
{
  var prefix = 'hasOne_child_table_';

  var ItemName = prefix + 'item';
  var ItemPreferenceName = prefix + 'item_preference';

  var Item = Rekord({
    name: ItemName,
    fields: ['name'],
    hasOne: {
      preference: {
        model: ItemPreferenceName,
        local: 'id'
      }
    }
  });

  var ItemPreference = Rekord({
    name: ItemPreferenceName,
    key: 'item_id',
    fields: ['brand', 'model'],
    belongsTo: {
      item: {
        model: ItemName,
        local: 'item_id'
      }
    }
  });

  var i0 = Item.create({name: 'i0', preference: {brand: 'Rekord', model: '#53434'}});
  var p0 = i0.preference;

  ok( p0 );
  strictEqual( p0.item_id, i0.id );
  ok( i0.$isSaved() );
  ok( p0.$isSaved() );
});

test( 'child table value instance', function(assert)
{
  var prefix = 'hasOne_child_table_value_instance_';

  var ItemName = prefix + 'item';
  var ItemPreferenceName = prefix + 'item_preference';

  var Item = Rekord({
    name: ItemName,
    fields: ['name'],
    hasOne: {
      preference: {
        model: ItemPreferenceName,
        local: 'id'
      }
    }
  });

  var ItemPreference = Rekord({
    name: ItemPreferenceName,
    key: 'item_id',
    fields: ['brand', 'model'],
    belongsTo: {
      item: {
        model: ItemName,
        local: 'item_id'
      }
    }
  });

  var i0 = Item.create({name: 'i0', preference: new ItemPreference({brand: 'Rekord', model: '#53434'})});
  var p0 = i0.preference;

  ok( p0 );
  strictEqual( p0.item_id, i0.id );
  ok( i0.$isSaved() );
  ok( p0.$isSaved() );
  deepEqual( i0.$saved, {id: i0.id, name: 'i0'} );
  deepEqual( p0.$saved, {item_id: i0.id, brand: 'Rekord', model: '#53434'} );
});

test( 'child table default rekord', function(assert)
{
  var prefix = 'hasOne_child_table_default_rekord_';

  var ItemName = prefix + 'item';
  var ItemPreferenceName = prefix + 'item_preference';

  var ItemPreference = Rekord({
    name: ItemPreferenceName,
    key: 'item_id',
    fields: ['brand', 'model'],
    belongsTo: {
      item: {
        model: ItemName,
        local: 'item_id'
      }
    }
  });

  var Item = Rekord({
    name: ItemName,
    fields: ['name'],
    defaults: {
      preference: ItemPreference
    },
    hasOne: {
      preference: {
        model: ItemPreferenceName,
        local: 'id'
      }
    }
  });

  var i0 = Item.create({name: 'i0'});
  var p0 = i0.preference;

  ok( p0 );
  strictEqual( p0.item_id, i0.id );
  ok( i0.$isSaved() );
  ok( p0.$isSaved() );
  deepEqual( i0.$saved, {id: i0.id, name: 'i0'} );
  deepEqual( p0.$saved, {item_id: i0.id, brand: undefined, model: undefined} );
});

test( 'child table default function', function(assert)
{
  var prefix = 'hasOne_child_table_default_function_';

  var ItemName = prefix + 'item';
  var ItemPreferenceName = prefix + 'item_preference';

  var ItemPreference = Rekord({
    name: ItemPreferenceName,
    key: 'item_id',
    fields: ['brand', 'model'],
    belongsTo: {
      item: {
        model: ItemName,
        local: 'item_id'
      }
    }
  });

  var Item = Rekord({
    name: ItemName,
    fields: ['name'],
    defaults: {
      preference: function() {
        return new ItemPreference({brand: 'brand', model: 'model'});
      }
    },
    hasOne: {
      preference: {
        model: ItemPreferenceName,
        local: 'id'
      }
    }
  });

  var i0 = Item.create({name: 'i0'});
  var p0 = i0.preference;

  ok( p0 );
  strictEqual( p0.item_id, i0.id );
  ok( i0.$isSaved() );
  ok( p0.$isSaved() );
  strictEqual( p0.brand, 'brand' );
  strictEqual( p0.model, 'model' );
  deepEqual( i0.$saved, {id: i0.id, name: 'i0'} );
  deepEqual( p0.$saved, {item_id: i0.id, brand: 'brand', model: 'model'} );
});
