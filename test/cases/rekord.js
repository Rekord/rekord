module( 'Rekord' );

test( 'browser refresh', function(assert)
{
  noline();

  var prefix = 'Rekord_browser_refresh_';

  var Task0 = Rekord({
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
    $status: Rekord.Model.Status.SavePending
  }, 'task 1 locally is save pending' );
  deepEqual( local.map.get(2), {
    id: 2, name: 't1', done: true,
    $publish: {done: true},
    $saving: {done: true},
    $saved: {id: 2, name: 't1', done: false},
    $status: Rekord.Model.Status.RemovePending
  }, 'task 2 locally is remove pending' );
  deepEqual( local.map.get(3), {
    id: 3, name: 't2', done: false,
    $publish: {id: 3, name: 't2', done: false},
    $saving: {id: 3, name: 't2', done: false},
    $status: Rekord.Model.Status.SavePending
  }, 'task 3 locally is save/create pending' );

  restart();

  var Task1 = Rekord({
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

  strictEqual( k0.$status, Rekord.Model.Status.Synced, 'task 1 is synced' );
  strictEqual( k0.$saving, void 0, 'task 1 is not being saved anymore' );
  strictEqual( k0.$publish, void 0 );

  strictEqual( k2.$status, Rekord.Model.Status.Synced, 'task 2 is synced' );
  strictEqual( k2.$saving, void 0, 'task 2 is not being saved anymore' );
  strictEqual( k2.$publish, void 0 );

  noline();
});

test( 'remote key change', function(assert)
{
  var prefix = 'Rekord_remote_key_change_';

  var Task = Rekord({
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
  // Rekord.load the relationships are loaded for local-storage models before
  // their pending operations are resumed.

  Rekord.autoload = false;

  var timer = assert.timer();
  var prefix = 'Rekord_dependents_on_load_';

  var TaskName = prefix + 'task';
  var UserName = prefix + 'user';
  var TaskStore = Rekord.store[ TaskName ] = new TestStore();
  var UserStore = Rekord.store[ UserName ] = new TestStore();
  var TaskRest = Rekord.rest[ TaskName ] = new TestRest();
  var UserRest = Rekord.rest[ UserName ] = new TestRest();

  UserRest.delay = 2;
  UserStore.map.put( 1, {
    id: 1, name: 'u1',
    $status: Rekord.Model.Status.SavePending,
    $saving: {id: 1, name: 'u1'},
    $publish: {}
  });

  TaskRest.delay = 2;
  TaskStore.map.put( 2, {
    id: 2, name: 't2', created_by: 1,
    $status: Rekord.Model.Status.SavePending,
    $saving: {id: 2, name: 't2', created_by: 1},
    $publish: {}
  });

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done', 'created_by'],
    belongsTo: {
      creator: {
        model: UserName,
        local: 'created_by'
      }
    }
  });

  var User = Rekord({
    name: UserName,
    fields: ['name']
  });

  Rekord.load();

  var u1 = User.get( 1 );
  var t2 = Task.get( 2 );

  notOk( u1.$isSaved(), 'user not saved' );
  notOk( t2.$isSaved(), 'task not saved' );

  wait( 1, function()
  {
    notOk( u1.$isSaved(), 'user still not saved' );
    notOk( t2.$isSaved(), 'task still not saved' );
  });

  wait( 3, function()
  {
    ok( u1.$isSaved(), 'user saved' );
    notOk( t2.$isSaved(), 'task still not saved again' );
  });

  wait( 5, function()
  {
    ok( u1.$isSaved(), 'user still saved' );
    ok( t2.$isSaved(), 'task saved' );
  });

  timer.run();

  Rekord.autoload = true;
});

test( 'remove while iterating related', function(assert)
{
  var prefix = 'Rekord_remove_iterating_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
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

test( 'load lazy get by object', function(assert)
{
  var prefix = 'Rekord_load_lazy_get_by_object_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done'],
    load: Rekord.Load.Lazy
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

test( 'load lazy get by id', function(assert)
{
  var prefix = 'Rekord_load_lazy_get_by_id_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done'],
    load: Rekord.Load.Lazy
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

test( 'load lazy hasOne', function(assert)
{
  var prefix = 'Rekord_load_lazy_hasOne_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    load: Rekord.Load.Lazy
  });

  User.Database.rest.map.put( 1, {id: 1, name: 'u1'} );

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

test( 'cached Rekord', function(assert)
{
  var prefix = 'rekord_cached_Rekord_';

  var Task0 = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var Task1 = Rekord({
    name: prefix + 'task',
    fields: ['name']
  });

  strictEqual( Task0, Task1 );
  deepEqual( Task1.Database.fields, ['id', 'name', 'done'] );
});

test( 'load related before initialize with load none', function(assert)
{
  var prefix = 'load_related_before_initialize_with_load_none_';
  var timer = assert.timer();

  var ItemName = prefix + 'item';
  var ListItemName = prefix + 'list_item';

  var ItemStore = Rekord.store[ ItemName ] = new TestStore();
  var ListItemStore = Rekord.store[ ListItemName ] = new TestStore();

  ItemStore.delay = 2;
  ItemStore.map.put(3, {
    id: 3, name: 'item3',
    $status: 0, $saved: {
      id: 3, name: 'item3'
    }
  });

  ListItemStore.map.put(4, {
    id: 4, amount: 23, item_id: 3,
    $status: 0, $saved: {
      id: 4, amount: 23, item_id: 3
    }
  });

  var Item = Rekord({
    name: ItemName,
    fields: ['name'],
    load: Rekord.Load.None
  });

  var ListItem = Rekord({
    name: ListItemName,
    fields: ['amount', 'item_id'],
    load: Rekord.Load.None,
    belongsTo: {
      item: {
        model: ItemName,
        local: 'item_id'
      }
    }
  });

  var l0 = ListItem.get(4);
  var i0 = Item.get(3);

  ok( l0 );
  notOk( l0.item );
  notOk( i0 );

  wait(3, function()
  {
    var i0 = Item.get(3);

    ok( i0 );
    strictEqual( l0.item, i0 );
  });

  timer.run();
});

test( 'unload', function()
{
  var prefix = 'Rekord_unload_';
  var TaskName = prefix + 'task';

  var Task0 = Rekord({
    name: TaskName,
    fields: ['done', 'name'],
    backend: 'firebase'
  });

  strictEqual( Task0.Database.backend, 'firebase' );

  Rekord.unload( [TaskName], true, true, true );

  var Task1 = Rekord({
    name: TaskName,
    fields: ['done', 'name'],
    backend: 'local'
  });

  strictEqual( Task1.Database.backend, 'local' );
});

test( 'refresh with decoding', function()
{
  var prefix = 'Rekord_refresh_decoding_';
  var TaskName = prefix + 'task';

  var Task = Rekord({
    name: TaskName,
    fields: ['done', 'name'],
    decodings: {
      done: function(value) {
        return /^(yes|y|ya|1|t|true)$/i.test(value + '');
      }
    }
  });

  var t1 = Task.boot({id: 1, done: 'y', name: 't1'});

  notOk( t1.$hasChanges() );
  notOk( t1.$hasChange('done') );
  strictEqual( t1.done, true );

  t1.$remote({done: 'f'});

  notOk( t1.$hasChanges() );
  notOk( t1.$hasChange('done') );
  strictEqual( t1.done, false );

  t1.$remote({done: 't'}, true);

  notOk( t1.$hasChanges() );
  notOk( t1.$hasChange('done') );
  strictEqual( t1.done, true );

  Task.Database.live.liveSave({id: 1, done: 'no'});

  notOk( t1.$hasChanges() );
  notOk( t1.$hasChange('done') );
  strictEqual( t1.done, false );
});


test( 'repeated searches second finishes first', function(assert)
{
  var prefix = 'repeated_searches_second_finishes_first_';
  var timer = assert.timer();

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var remote = Todo.Database.rest;

  remote.queries.put( '1', [
    {id: 1, name: 't1', done: true},
    {id: 2, name: 't2', done: false},
    {id: 3, name: 't3', done: true}
  ]);

  remote.queries.put( '2', [
    {id: 4, name: 't4', done: true}
  ]);

  remote.queries.put( '3', [
    {id: 5, name: 't5', done: false},
    {id: 6, name: 't6', done: false}
  ]);

  remote.delay = 4;

  var q0 = Todo.search();
  var r0 = q0.$results;
  var p0 = q0.$run('1');

  remote.delay = 2;

  var p1 = q0.$run('2');

  remote.delay = 6;

  var p2 = q0.$run('3');

  expect(6);

  wait( 1, function() {
    strictEqual( r0.length, 0 );
  });

  // 2 (p1) finishes, but not latest
  wait( 3, function() {
    strictEqual( r0.length, 0 );
  });

  // 1 (p0) finishes, but not latest
  wait( 5, function() {
    strictEqual( r0.length, 0 );
  });

  // 3 (p2) finishes, is latest
  wait( 7, function() {
    strictEqual( r0.length, 2 );
    strictEqual( r0[0].id, 5 );
    strictEqual( r0[1].id, 6 );
  });

  timer.run();
});

test( 'load priority', function(assert)
{
  var prefix = 'load_priority_';

  Rekord.autoload = false;

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['text', 'done'],
    priority: 2
  });

  var Action = Rekord({
    name: prefix + 'action',
    fields: ['message'],
    priority: 3
  });

  var order = 0;

  expect(2);

  Todo.Database.on( Rekord.Database.Events.LocalLoad, function() {
    strictEqual(order++, 1);
  });

  Action.Database.on( Rekord.Database.Events.LocalLoad, function() {
    strictEqual(order++, 0);
  });

  Rekord.load();
  Rekord.autoload = true;
});

test( 'load relation order', function(assert)
{
  var prefix = 'load_relation_order';

  Rekord.autoload = false;

  var ActionName = prefix + 'action';
  var TodoName = prefix + 'todo';
  var ListName = prefix + 'list';

  var Discriminators = {};
  Discriminators[ ActionName ] = 'action';
  Discriminators[ TodoName ] = 'todo';
  Discriminators[ ListName ] = 'list';

  var Action = Rekord({
    name: ActionName,
    priority: 0,
    fields: ['related_id', 'related_type'],
    hasOne: {
      related: {
        local: 'related_id',
        discriminator: 'related_type',
        discriminators: Discriminators,
        cascade: Rekord.Cascade.None,
        saveCascade: Rekord.Cascade.None
      }
    }
  });

  var Todo = Rekord({
    name: TodoName,
    priority: 1,
    fields: ['list_id', 'text', 'done'],
    belongsTo: {
      list: {
        model: ListName,
        local: 'list_id'
      }
    }
  });

  var List = Rekord({
    name: ListName,
    priority: 2,
    fields: ['name'],
    hasMany: {
      todos: {
        model: TodoName,
        foreign: 'list_id'
      }
    }
  });

  // Ones referenced in belongsTo and hasOne should be loaded BEFORE

  // Polymorphic hasOne/belongsTo have lowest priority number
  // Normal hasOne/belongsTo has middle priority number
  // Polymorphic & Normal hasMany/hasManyThrough has highest priority number

  var ActionStore = Action.Database.store.map;
  var TodoStore = Todo.Database.store.map;
  var ListStore = List.Database.store.map;

  ActionStore.put(1, {id: 1, related_id: 1, related_type: 'todo'});
  ActionStore.put(2, {id: 2, related_id: 1, related_type: 'list'});
  ActionStore.put(3, {id: 3, related_id: 2, related_type: 'todo'});

  TodoStore.put(1, {id: 1, list_id: 1, text: 'todo1', done: false});
  TodoStore.put(2, {id: 2, list_id: 1, text: 'todo2', done: true});
  TodoStore.put(3, {id: 3, list_id: 3, text: 'todo3', done: false});

  ListStore.put(1, {id: 1, name: 'list1'});
  ListStore.put(2, {id: 2, name: 'list2'});

  Rekord.load();
  Rekord.autoload = true;

  var a1 = Action.get(1);
  var a2 = Action.get(2);
  var a3 = Action.get(3);

  var t1 = Todo.get(1);
  var t2 = Todo.get(2);
  var t3 = Todo.get(3);

  var l1 = List.get(1);
  var l2 = List.get(2);

  strictEqual(t1.list, l1, 'list1 matched to todo1');
  strictEqual(t2.list, l1, 'list1 matched to todo2');
  strictEqual(t3.list, undefined, 'no list matched to todo3');

  strictEqual(l1.name, 'list1', 'list1 name loaded');
  strictEqual(t1.text, 'todo1', 'todo1 name loaded');
  strictEqual(t2.text, 'todo2', 'todo2 name loaded');

  strictEqual(a1.related, t1, 'todo1 related to action1');
  strictEqual(a2.related, l1, 'list1 related to action2');
  strictEqual(a3.related, t2, 'todo2 related to action3');

  deepEqual(l1.todos.toArray(), [t1, t2], 'todos matched to list1');
  deepEqual(l2.todos.toArray(), [], 'todos matched to list2');
});
