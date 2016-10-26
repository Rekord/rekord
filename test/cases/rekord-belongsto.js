module( 'Rekord belongsTo' );

test( 'no initial value', function(assert)
{
  var prefix = 'belongsTo_no_initial_';

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

  var t0 = Task.create({name: 'This'});

  strictEqual( t0.creator, void 0 );
  strictEqual( t0.created_by, void 0 );
});

test( 'initial value', function(assert)
{
  var prefix = 'belongsTo_initial_value_';

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
  var t0 = Task.create({name: 'This', creator: u0.id});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );
});

test( 'initial foreign key', function(assert)
{
  var prefix = 'belongsTo_initial_foreign_key_';

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
  var t0 = Task.create({name: 'This', created_by: u0.id});

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );
});

test( 'ninja remove', function(assert)
{
  var prefix = 'belongsTo_ninja_remove_';

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

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  u0.$remove();

  ok( u0.$isDeleted() );
  ok( t0.$isDeleted() );
});

test( 'ninja save', function(assert)
{
  var prefix = 'belongsTo_ninja_save_';

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

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  u0.$save( 'name', 'Me' );

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );
});

test( 'set', function(assert)
{
  var prefix = 'belongsTo_set_';

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

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  var u1 = User.create({name: 'Me'});

  t0.$set( 'creator', u1 );

  strictEqual( t0.creator, u1 );
  strictEqual( t0.created_by, u1.id );
});

test( 'relate', function(assert)
{
  var prefix = 'belongsTo_relate_';

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

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  var u1 = User.create({name: 'Me'});

  t0.$relate( 'creator', u1 );

  strictEqual( t0.creator, u1 );
  strictEqual( t0.created_by, u1.id );
});

test( 'unrelate', function(assert)
{
  var prefix = 'belongsTo_unrelate_';

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

  strictEqual( t0.creator, u0 );
  strictEqual( t0.created_by, u0.id );

  t0.$unrelate( 'creator' );

  strictEqual( t0.creator, null );
  strictEqual( t0.created_by, null );
});

test( 'isRelated', function(assert)
{
  var prefix = 'belongsTo_isRelated_';

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

  ok( t0.$isRelated( 'creator', u0 ) );
  ok( t0.$isRelated( 'creator', u0.id ) );
  ok( t0.$isRelated( 'creator', {id: u0.id} ) );

  notOk( t0.$isRelated( 'creator', null ) );
  notOk( t0.$isRelated( 'creator', 6 ) );
  notOk( t0.$isRelated( 'creator', {} ) );
});

test( 'get', function(assert)
{
  var prefix = 'belongsTo_get_';

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

  strictEqual( t0.$get( 'creator' ), u0 );

  u0.$remove();

  strictEqual( t0.$get( 'creator' ), null );
});

test( 'encode', function(assert)
{
  var prefix = 'belongsTo_encode_';

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
  var prefix = 'belongsTo_cascade_remove_';

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

  notOk( u0.$isDeleted() );
  notOk( t0.$isDeleted() );

  u0.$remove();

  ok( u0.$isDeleted() );
  ok( t0.$isDeleted() );

  strictEqual( User.Database.store.map.size(), 0 );
  strictEqual( Task.Database.store.map.size(), 0 );
  strictEqual( User.Database.rest.map.size(), 0 );
  strictEqual( Task.Database.rest.map.size(), 0 );
});

test( 'more than one belongsTo relationship', function(assert)
{
  var prefix = 'belongsTo_more_than_one_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by', 'edited_by'],
    belongsTo: {
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
  var u1 = User.create({name: 'Me'});
  var t0 = Task.create({name: 'This', creator: u0, editor: u1});

  strictEqual( t0.created_by, u0.id );
  strictEqual( t0.creator, u0 );
  strictEqual( t0.edited_by, u1.id );
  strictEqual( t0.editor, u1 );

  u1.$remove();

  ok( t0.$isDeleted() );

  u0.$remove();

  ok( t0.$isDeleted() );
});

test( 'wait until dependents are saved', function(assert)
{
  var prefix = 'belongsTo_wait_dependents_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var u0 = new User({name: 'u0'});
  var t0 = new Task({name: 't0', creator: u0});

  t0.$save();

  notOk( t0.$isSaved(), 'task not saved since user not saved' );
  notOk( u0.$isSaved(), 'user not saved' );

  Task.Database.rest.returnValue = { id: t0.id, name: 't0a' };

  u0.$save();

  strictEqual( t0.name, 't0a' );
  ok( t0.$isSaved(), 'task saved since user has saved' );
  ok( u0.$isSaved(), 'user saved' );

  strictEqual( t0.creator, u0 );
});

test( 'clone', function(assert)
{
  var prefix = 'belongsTo_clone_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name']
  });

  var Address = Rekord({
    name: prefix + 'address',
    fields: ['location', 'created_by'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var a0 = new Address({
    location: 'everywhere',
    creator: {
      name: 'u0'
    }
  });

  var a1 = a0.$clone( {creator:{}} );

  notStrictEqual( a1, a0 );
  strictEqual( a1.creator, a0.creator );
});

test( 'sync', function(assert)
{
  var prefix = 'belongsTo_sync_';

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['list_id', 'name', 'done'],
    belongsTo: {
      list: {
        model: TaskList,
        local: 'list_id'
      }
    }
  });

  var l0 = TaskList.create({name: 'l0'});
  var l1 = TaskList.create({name: 'l1'});
  var l2 = TaskList.create({name: 'l2'});

  var t0 = Task.create({list_id: l0.id});

  strictEqual( t0.list, l0 );

  t0.list_id = null;
  t0.$sync( 'list' );

  strictEqual( t0.list, l0 );

  t0.$sync( 'list', true );

  strictEqual( t0.list, null );

  t0.list_id = l1.id;
  t0.$sync( 'list' );

  strictEqual( t0.list, l1 );
});
