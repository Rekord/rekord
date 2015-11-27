module( 'Neuro instance functions' );

test( 'all', function(assert)
{
  var all = Neuro({
    name: 'all',
    fields: ['id']
  });

  deepEqual( all.all(), [] );

  var a0 = all.create();
  var a1 = all.create();
  var a2 = all.create();
  var a3 = all.create();
  var a4 = all.create();

  deepEqual( all.all(), [a0, a1, a2, a3, a4] );

  a3.$remove();

  deepEqual( all.all(), [a0, a1, a2, a4] );
});

test( 'create', function(assert)
{
  var create = Neuro({
    name: 'create',
    fields: ['id', 'name', 'created_at'],
    defaults: {
      created_at: Date.now
    }
  });

  var c0 = create.create({name: 'name0'});

  strictEqual( c0.name, 'name0' );
  ok( c0.$isSaved() );
});

test( 'fetch', function(assert)
{
  var Task = Neuro({
    name: 'fetch',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  remote.map.put( 4, {id: 4, name: 'This', done: true} );

  var t0 = Task.fetch( 4 );

  strictEqual( t0.id, 4 );
  strictEqual( t0.name, 'This' );
  strictEqual( t0.done, true );
});

test( 'boot', function(assert)
{
  var Task = Neuro({
    name: 'boot',
    fields: ['name', 'done']
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;
  var live = Task.Database.live.live;

  var t0 = Task.boot({
    id: 4,
    name: 'This',
    done: true
  });

  ok( t0.$isSaved() );
  ok( t0.$isSavedLocally() );
  notOk( t0.$hasChanges() );

  strictEqual( remote.lastModel, null );
  strictEqual( remote.lastRecord, null );
  strictEqual( local.lastKey, 4 );
  deepEqual( local.lastRecord, {
    id: 4, name: 'This', done: true,
    $saved: { id: 4, name: 'This', done: true }, $status: 0
  });
  strictEqual( live.lastMessage, null );
});

test( 'boot complex', function(assert)
{
  var prefix = 'Neuro_boot_complex_';

  var UserName = prefix + 'user';
  var TaskName = prefix + 'task';
  var ListName = prefix + 'list';

  var User = Neuro({
    name: UserName,
    fields: ['name'],
    hasMany: {
      assigned: {
        model: TaskName,
        foreign: 'assignee_id'
      },
      lists: {
        model: ListName,
        foreign: 'created_by'
      }
    }
  });

  var Task = Neuro({
    name: TaskName,
    fields: ['name', 'done', 'assignee_id', 'list_id'],
    belongsTo: {
      assignee: {
        model: UserName,
        local: 'assignee_id'
      },
      list: {
        model: ListName, 
        local: 'list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: ListName,
    fields: ['name', 'created_by'],
    belongsTo: {
      creator: {
        model: UserName,
        local: 'created_by'
      }
    },
    hasMany: {
      tasks: {
        model: TaskName,
        foreign: 'list_id'
      }
    }
  });

  // Go!
  var l0 = TaskList.boot({
    id: 1,
    name: 'My List',
    created_by: 2,
    creator: {
      id: 2,
      name: 'Tom'
    },
    tasks: [
      // list_id, list, and assignee will be automatically populated
      {
        id: 3,
        name: 'This Issue',
        done: false,
        assignee_id: 2
      }, 
      // list will be automaticall populated
      {
        id: 4,
        list_id: 1,
        name: 'Another Issue',
        done: true,
        assignee_id: 5,
        assignee: {
          id: 5,
          name: 'John'
        }
      }
    ]
  });

  var u0 = l0.creator;
  var t0 = l0.tasks[ 0 ];
  var t1 = l0.tasks[ 1 ];
  var u1 = t0.assignee;
  var u2 = t1.assignee;
  var l2 = t0.list;
  var l3 = t1.list;

  // All references need to be there!
  strictEqual( u0, u1, 'list & task has same user' );
  strictEqual( l2, l0, 'list on task 0 matches' );
  strictEqual( l3, l0, 'list on task 1 matches' );

  strictEqual( t0.list_id, l0.id, 'list_id for task 0 updated' );
  strictEqual( t1.list_id, l0.id, 'list_id for task 1 updated' );

  strictEqual( t0.assignee_id, u1.id, 'assignee_id for task 0 updated' );
  strictEqual( t1.assignee_id, u2.id, 'assignee_id for task 1 updated' );

  deepEqual( u1.assigned, [t0], 'user 1 has one task' );
  deepEqual( u2.assigned, [t1], 'user 2 has one task' );
  deepEqual( u1.lists, [l0], 'user 1 has a list' );
  deepEqual( u2.lists, [], 'user 2 has no list' );

  // Ensure no remote calls were made
  strictEqual( User.Database.rest.lastModel, null );
  strictEqual( Task.Database.rest.lastModel, null );
  strictEqual( TaskList.Database.rest.lastModel, null );
});