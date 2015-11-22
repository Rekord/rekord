module( 'Neuro hasOne' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasOne_no_initial_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

test( 'ninja save', function(assert)
{
  var prefix = 'hasOne_ninja_save_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  u0.$save( 'id', 6 );

  strictEqual( t0.creator, null );
  strictEqual( t0.created_by, null );
});

test( 'set', function(assert)
{
  var prefix = 'hasOne_set_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by',
        save: Neuro.Save.Model,
        store: Neuro.Store.Model
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
      $saved: {id: u0.id, name: u0.name}
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

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by',
        cascade: true
      }
    }
  });

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  notOk( u0.$deleted );
  notOk( t0.$deleted );

  t0.$remove();

  ok( u0.$deleted );
  ok( t0.$deleted );

  strictEqual( User.Database.store.map.size(), 0 );
  strictEqual( Task.Database.store.map.size(), 0 );
  strictEqual( User.Database.rest.map.size(), 0 );
  strictEqual( Task.Database.rest.map.size(), 0 );
});

test( 'more than one hasOne relationship', function(assert)
{
  var prefix = 'hasOne_more_than_one_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['id', 'name']
  });

  var Task = Neuro({
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
