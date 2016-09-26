module( 'Rekord hasReference' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasReference_no_initial_';

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

  var t0 = Task.create({name: 'This'});

  strictEqual( t0.creator, void 0 );
});

test( 'initial value', function(assert)
{
  var prefix = 'hasReference_initial_value_';

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

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0.id});

  strictEqual( t0.creator, u0 );
});

test( 'ninja remove', function(assert)
{
  var prefix = 'hasReference_ninja_remove_';

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

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  u0.$remove();

  strictEqual( t0.creator, null );
});

test( 'set', function(assert)
{
  var prefix = 'hasReference_set_';

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

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  var u1 = User.create({name: 'Me'});

  t0.$set( 'creator', u1 );

  strictEqual( t0.creator, u1 );
});

test( 'relate', function(assert)
{
  var prefix = 'hasReference_relate_';

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

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  var u1 = User.create({name: 'Me'});

  t0.$relate( 'creator', u1 );

  strictEqual( t0.creator, u1 );
});

test( 'unrelate', function(assert)
{
  var prefix = 'hasReference_unrelate_';

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

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.creator, u0 );

  t0.$unrelate( 'creator' );

  strictEqual( t0.creator, null );
});

test( 'isRelated', function(assert)
{
  var prefix = 'hasReference_isRelated_';

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
  var prefix = 'hasReference_get_';

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

  var u0 = User.create({name: 'You'});
  var t0 = Task.create({name: 'This', creator: u0});

  strictEqual( t0.$get( 'creator' ), u0 );

  u0.$remove();

  strictEqual( t0.$get( 'creator' ), null );
});

test( 'encode', function(assert)
{
  var prefix = 'hasReference_encode_';

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
    id: t0.id, name: t0.name,
    creator: {id: u0.id, name: u0.name}
  });

  deepEqual( storing0, {
    id: t0.id, name: t0.name,
    creator: {id: u0.id, name: u0.name,
      $saved: {id: u0.id, name: u0.name}, $status: 0
    }
  });

  t0.$unrelate( 'creator' );

  var saving1 = t0.$toJSON( true );
  var storing1 = t0.$toJSON( false );

  deepEqual( saving1, {
    id: t0.id, name: t0.name,
    creator: null
  });

  deepEqual( storing1, {
    id: t0.id, name: t0.name,
    creator: null
  });
});

test( 'more than one hasReference relationship', function(assert)
{
  var prefix = 'hasReference_more_than_one_';

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

  strictEqual( t0.creator, u0 );
  strictEqual( t0.editor, u1 );

  u1.$remove();

  strictEqual( t0.creator, u0 );
  strictEqual( t0.editor, null );

  u0.$remove();

  strictEqual( t0.creator, null );
  strictEqual( t0.editor, null );
});

test( 'clone', function(assert)
{
  var prefix = 'hasReference_clone_';

  var Address = Rekord({
    name: prefix + 'address',
    fields: ['location']
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasReference: {
      address: {
        model: Address
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
  strictEqual( a1.location, 'everywhere' );
  notStrictEqual( a1.id, a0.id );
});
