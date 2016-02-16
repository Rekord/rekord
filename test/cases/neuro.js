module( 'Neuro' );

test( 'browser refresh', function(assert)
{
  noline();

  var prefix = 'Neuro_browser_refresh_';

  var Task0 = Neuro({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var remote = Task0.Database.rest;
  var local = Task0.Database.store;

  var t0 = Task0.create({id: 1, name: 't0', done: true});
  var t1 = Task0.create({id: 2, name: 't1', done: false});

  strictEqual( local.map.size(), 2, 'tasks saved locally' );
  strictEqual( remote.map.size(), 2, 'tasks saved remotely' );

  offline();

  var t2 = Task0.create({id: 3, name: 't2', done: false});
  var t3 = Task0.create({id: 4, name: 't3', done: true});

  t0.$save('name', 't0a');
  t1.$save('done', true);
  t1.$remove();

  strictEqual( local.map.size(), 4, 'task changes saved locally' );

  t3.$remove();

  strictEqual( local.map.size(), 3, 'task changes saved locally' );
  strictEqual( remote.map.size(), 2, 'remote is untouched as expected' );

  deepEqual( remote.map.get(1), {
    id: 1, name: 't0', done: true
  }, 'task 1 remotely is untouched');
  deepEqual( remote.map.get(2), {
    id: 2, name: 't1', done: false
  }, 'task 2 remotely is untouched');
  deepEqual( local.map.get(1), {
    id: 1, name: 't0a', done: true,
    $publish: {name: 't0a'},
    $saving: {name: 't0a'},
    $saved: {id: 1, name: 't0', done: true},
    $status: Neuro.Model.Status.SavePending
  }, 'task 1 locally is save pending' );
  deepEqual( local.map.get(2), {
    id: 2, name: 't1', done: true,
    $publish: {done: true},
    $saving: {done: true},
    $saved: {id: 2, name: 't1', done: false},
    $status: Neuro.Model.Status.RemovePending
  }, 'task 2 locally is remove pending' );
  deepEqual( local.map.get(3), {
    id: 3, name: 't2', done: false,
    $publish: {id: 3, name: 't2', done: false},
    $saving: {id: 3, name: 't2', done: false},
    $status: Neuro.Model.Status.SavePending
  }, 'task 3 locally is save/create pending' );

  restart();

  var Task1 = Neuro({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var k0 = Task1.get( 1 );
  var k1 = Task1.get( 2 );
  var k2 = Task1.get( 3 );

  deepEqual( k0.$saved, {
    id: 1, name: 't0a', done: true
  }, 'task 1 saved on browser restart' );
  deepEqual( k1, void 0, 'task 2 no longer exists' );
  deepEqual( k2.$saved, {
    id: 3, name: 't2', done: false
  }, 'task 3 created on browser restart' );

  strictEqual( k0.$status, Neuro.Model.Status.Synced, 'task 1 is synced' );
  strictEqual( k0.$saving, void 0, 'task 1 is not being saved anymore' );
  strictEqual( k0.$publish, void 0 );

  strictEqual( k2.$status, Neuro.Model.Status.Synced, 'task 2 is synced' );
  strictEqual( k2.$saving, void 0, 'task 2 is not being saved anymore' );
  strictEqual( k2.$publish, void 0 );

  noline();
});

test( 'remote key change', function(assert)
{
  var prefix = 'Neuro_remote_key_change_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  var t0 = Task.create({id: 4, name: 't0', done: true});

  rest.returnValue = {id: 5};

  assert.throws(function()
  {
    t0.$save('name', 't0a');

  }, 'Model keys cannot be changed.');

});

test( 'ensure relationships are loaded before saves/removes are resumed', function(assert)
{
  // Task is loaded first, and if autoload were true it would try to save tasks
  // before the unsaved creator would be saved. With autoload = false & using
  // Neuro.load the relationships are loaded for local-storage models before
  // their pending operations are resumed.

  Neuro.autoload = false;

  var timer = assert.timer();
  var prefix = 'Neuro_dependents_on_load_';

  var TaskName = prefix + 'task';
  var UserName = prefix + 'user';
  var TaskStore = Neuro.store[ TaskName ] = new TestStore();
  var UserStore = Neuro.store[ UserName ] = new TestStore();
  var TaskRest = Neuro.rest[ TaskName ] = new TestRest();
  var UserRest = Neuro.rest[ UserName ] = new TestRest();

  UserRest.delay = 2;
  UserStore.map.put( 1, {
    id: 1, name: 'u1',
    $status: Neuro.Model.Status.SavePending,
    $saving: {id: 1, name: 'u1'},
    $publish: {}
  });

  TaskRest.delay = 2;
  TaskStore.map.put( 2, {
    id: 2, name: 't2', created_by: 1,
    $status: Neuro.Model.Status.SavePending,
    $saving: {id: 2, name: 't2', created_by: 1},
    $publish: {}
  });

  var Task = Neuro({
    name: TaskName,
    fields: ['name', 'done', 'created_by'],
    belongsTo: {
      creator: {
        model: UserName,
        local: 'created_by'
      }
    }
  });

  var User = Neuro({
    name: UserName,
    fields: ['name']
  });

  Neuro.load();

  var u1 = User.get( 1 );
  var t2 = Task.get( 2 );

  notOk( u1.$isSaved() );
  notOk( t2.$isSaved() );

  wait( 1, function()
  {
    notOk( u1.$isSaved() );
    notOk( t2.$isSaved() );
  });

  wait( 3, function()
  {
    ok( u1.$isSaved() );
    notOk( t2.$isSaved() );
  });

  wait( 5, function()
  {
    ok( u1.$isSaved() );
    ok( t2.$isSaved() );
  });

  timer.run();

  Neuro.autoload = true;
});

test( 'remove while iterating related', function(assert)
{
  var prefix = 'Neuro_remove_iterating_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id',
        comparator: 'id'
      }
    }
  });

  var l0 = TaskList.boot({
    id: 23,
    name: 'l0',
    tasks: [
      { id: 1, name: 't0', done: true },
      { id: 2, name: 't1', done: false },
      { id: 3, name: 't2', done: false },
      { id: 4, name: 't3', done: true }
    ]
  });

  strictEqual( l0.tasks[0].list_id, 23 );

  var t0 = l0.tasks[0];
  var t1 = l0.tasks[1];
  var t2 = l0.tasks[2];
  var t3 = l0.tasks[3];

  ok( t0.$isSaved() );
  ok( t1.$isSaved() );
  ok( t2.$isSaved() );
  ok( t3.$isSaved() );

  var names = [];

  l0.tasks.each(function(t)
  {
    if ( t.done )
    {
      t.$remove();
    }

    names.push( t.name );
  });

  notOk( t0.$isSaved() );
  ok( t1.$isSaved() );
  ok( t2.$isSaved() );
  notOk( t3.$isSaved() );

  strictEqual( l0.tasks.length, 2 );

  deepEqual( names, ['t0', 't1', 't2', 't3'] );
});

test( 'loadRemote false get by object', function(assert)
{
  var prefix = 'Neuro_loadRemote_false_get_by_object_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['name', 'done'],
    loadRemote: false
  });

  Task.Database.rest.map.put( 2, {id: 2, name: 't2', done: true} );

  expect( 3 );

  Task.get( {id: 2, name: 't2a'}, function(t)
  {
    ok( t.$isSaved() );
    strictEqual( t.done, true );
    strictEqual( t.name, 't2a' );
  });
});

test( 'loadRemote false get by id', function(assert)
{
  var prefix = 'Neuro_loadRemote_false_get_by_id_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['name', 'done'],
    loadRemote: false
  });

  Task.Database.rest.map.put( 2, {id: 2, name: 't2', done: true} );

  expect( 3 );

  Task.get( 2, function(t)
  {
    ok( t.$isSaved() );
    strictEqual( t.done, true );
    strictEqual( t.name, 't2' );
  });
});

test( 'loadRemote false hasOne', function(assert)
{
  var prefix = 'Neuro_loadRemote_false_hasOne_';

  var User = Neuro({
    name: prefix + 'user',
    fields: ['name'],
    loadRemote: false
  });

  User.Database.rest.map.put( 1, {id: 1, name: 'u1'} );

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['name', 'created_by'],
    hasOne: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  strictEqual( User.all().length, 0 );

  var t1 = Task.boot({
    id: 1,
    name: 't1',
    created_by: 1
  });

  strictEqual( User.all().length, 1 );

  ok( t1.creator );
  strictEqual( t1.creator.name, 'u1' );
});
