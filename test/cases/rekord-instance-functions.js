module( 'Rekord instance functions' );

test( 'collect', function(assert)
{
  var Task = Rekord({
    name: 'task',
    fields: ['name']
  });

  var tasks = Task.collect();

  ok( tasks instanceof Array );
  ok( tasks instanceof Rekord.Collection );
  notOk( Array.isArray( tasks ) );

  tasks.add(new Task({name: 't0'}));

  strictEqual( tasks.length, 1 );
});

test( 'array', function(assert)
{
  var Task = Rekord({
    name: 'task',
    fields: ['name']
  });

  var tasks = Task.array();

  ok( tasks instanceof Array );
  notOk( tasks instanceof Rekord.Collection );
  ok( Array.isArray( tasks ) );

  tasks.add(new Task({name: 't0'}));

  strictEqual( tasks.length, 1 );
});

test( 'all', function(assert)
{
  var all = Rekord({
    name: 'all',
    fields: ['id']
  });

  deepEqual( all.all().toArray(), [] );

  var a0 = all.create();
  var a1 = all.create();
  var a2 = all.create();
  var a3 = all.create();
  var a4 = all.create();

  deepEqual( all.all().toArray(), [a0, a1, a2, a3, a4] );

  a3.$remove();

  deepEqual( all.all().toArray(), [a0, a1, a2, a4] );
});

test( 'at', function(assert)
{
  var at = Rekord({
    name: 'at',
    fields: ['id']
  });

  deepEqual( at.at( 0 ), void 0 );

  var a0 = at.create();
  var a1 = at.create();
  var a2 = at.create();
  var a3 = at.create();
  var a4 = at.create();

  strictEqual( at.at(0), a0 );
  strictEqual( at.at(1), a1 );
  strictEqual( at.at(2), a2 );
  strictEqual( at.at(3), a3 );
  strictEqual( at.at(4), a4 );

  a3.$remove();

  strictEqual( at.at(0), a0 );
  strictEqual( at.at(1), a1 );
  strictEqual( at.at(2), a2 );
  strictEqual( at.at(3), a4 );
});

test( 'create', function(assert)
{
  var create = Rekord({
    name: 'create',
    fields: ['id', 'name', 'created_at'],
    defaults: {
      created_at: currentTime()
    }
  });

  var c0 = create.create({name: 'name0'});

  strictEqual( c0.name, 'name0' );
  ok( c0.$isSaved() );
});

test( 'fetch new', function(assert)
{
  var Task = Rekord({
    name: 'fetch_new',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  remote.map.put( 4, {id: 4, name: 'This', done: true} );

  var t0 = Task.fetch( 4 );

  ok( t0.$isSaved() );
  strictEqual( t0.id, 4 );
  strictEqual( t0.name, 'This' );
  strictEqual( t0.done, true );
});

test( 'fetch callback', function(assert)
{
  var timer = assert.timer();

  var Task = Rekord({
    name: 'Rekord_fetch_callback',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  remote.delay = 1;
  remote.map.put( 4, {id: 4, name: 'This'} );

  expect(3);

  var t0 = Task.fetch( 4, function(t1)
  {
    strictEqual( t0, t1 );
    strictEqual( t0.name, 'This' );
  });

  strictEqual( t0.name, void 0 );

  timer.run();
});

test( 'grab', function(assert)
{
  var timer = assert.timer();

  var Task = Rekord({
    name: 'Rekord_grab',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  remote.delay = 1;
  remote.map.put( 4, {id: 4, name: 'That'} );

  expect(2);

  var t0 = Task.grab( 4, function(fetched)
  {
    strictEqual( fetched.name, 'That' );
  });

  strictEqual( t0, void 0 );

  timer.run();
});

test( 'grabAll', function(assert)
{
  var timer = assert.timer();

  var Task = Rekord({
    name: 'Rekord_grabAll',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  remote.delay = 1;
  remote.map.put( 4, {id: 4, name: 'That'} );
  remote.map.put( 5, {id: 5, name: 'This'} );

  expect( 2 );

  var models = Task.grabAll( function(all)
  {
    strictEqual( all.length, 2 );
  });

  strictEqual( models.length, 0 );

  timer.run();
});

test( 'refresh', function(assert)
{
  var Task = Rekord({
    name: 'Rekord_refresh',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  strictEqual( Task.all().length, 0 );

  remote.map.put( 4, {id: 4, name: 'This', done: true} );

  Task.refresh();

  strictEqual( Task.all().length, 1 );
});

test( 'find', function(assert)
{
  var Task = Rekord({
    name: 'Rekord_find',
    fields: ['name', 'done']
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't0'});

  strictEqual( Task.find('name', 't0'), t0 );
  strictEqual( Task.find('name', 't1'), t1 );
  strictEqual( Task.find('name', 't2'), null );
});

test( 'fetch existing', function(assert)
{
  var Task = Rekord({
    name: 'fetch_existing',
    fields: ['name', 'done']
  });

  var remote = Task.Database.rest;

  remote.map.put( 4, {id: 4, name: 'This', done: true} );

  Task.create({id: 4, name: 'That', done: false});

  var t0 = Task.fetch( 4 );

  ok( t0.$isSaved() );
  strictEqual( t0.id, 4 );
  strictEqual( t0.name, 'That' );
  strictEqual( t0.done, false );

  remote.map.get( 4 ).done = true;

  var t1 = Task.fetch( 4 );
  ok( t1.$isSaved() );
  strictEqual( t1.id, 4 );
  strictEqual( t1.name, 'That' );
  strictEqual( t1.done, true );
  strictEqual( t1, t0 );
});

test( 'boot', function(assert)
{
  var Task = Rekord({
    name: 'Rekord_boot_task',
    fields: ['name', 'done']
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;
  var live = Task.Database.live;

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
  var prefix = 'Rekord_boot_complex_';

  var UserName = prefix + 'user';
  var TaskName = prefix + 'task';
  var ListName = prefix + 'list';

  var User = Rekord({
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

  var Task = Rekord({
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

  var TaskList = Rekord({
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
        foreign: 'list_id',
        comparator: 'id'
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
      // list will be automatically populated
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

  deepEqual( u1.assigned.toArray(), [t0], 'user 1 has one task' );
  deepEqual( u2.assigned.toArray(), [t1], 'user 2 has one task' );
  deepEqual( u1.lists.toArray(), [l0], 'user 1 has a list' );
  deepEqual( u2.lists.toArray(), [], 'user 2 has no list' );

  // Ensure no remote calls were made
  strictEqual( User.Database.rest.lastModel, null );
  strictEqual( Task.Database.rest.lastModel, null );
  strictEqual( TaskList.Database.rest.lastModel, null );
});

test( 'filtered', function(assert)
{
  var prefix = 'Rekord_filtered_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: false});
  var t3 = Todo.create({name: 't3', done: true});

  var done = Todo.filtered('done', true);

  done.setComparator( 'name' );

  strictEqual( done.length, 2 );
  strictEqual( done[0], t0 );
  strictEqual( done[1], t3 );

  t2.$save('done', true);

  strictEqual( done.length, 3 );
  strictEqual( done[0], t0 );
  strictEqual( done[1], t2 );
  strictEqual( done[2], t3 );

  t0.$remove();

  strictEqual( done.length, 2 );
  strictEqual( done[0], t2 );
  strictEqual( done[1], t3 );

  t3.done = false;

  done.sync();

  strictEqual( done.length, 1 );
  strictEqual( done[0], t2 );

  var t4 = Todo.create({name: 't4', done: true});
  var t5 = Todo.boot({id: 5, name: 't5', done: true});

  strictEqual( done.length, 3 );
  strictEqual( done[0], t2 );
  strictEqual( done[1], t4 );
  strictEqual( done[2], t5 );
});

test( 'where', function(assert)
{
  var prefix = 'Rekord_where_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: false});
  var t3 = Todo.create({name: 't3', done: true});

  var done = Todo.where('done', true);

  done.setComparator( 'name' );

  strictEqual( done.length, 2 );
  strictEqual( done[0], t0 );
  strictEqual( done[1], t3 );
});

test( 'search success', function(assert)
{
  var timer = assert.timer();
  var prefix = 'Rekord_search_success_';

  expect( 4 );

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    load: Rekord.Load.None
  });

  var remote = Todo.Database.rest;

  remote.queries.put( 'http://rekord.io', [
    {id: 1, name: 't1', done: true},
    {id: 2, name: 't2', done: false},
    {id: 3, name: 't3', done: true}
  ]);

  remote.delay = 1;

  var q = Todo.search( 'http://rekord.io' );
  var p = q.$run();

  expect( 4 );

  strictEqual( q.$results.length, 0 );

  p.complete(function()
  {
    strictEqual( q.$results.length, 3, 'query ready and models loaded' );
  });

  p.success(function()
  {
    strictEqual( q.$results.length, 3, 'query success and models loaded' );
  });

  p.failure(function()
  {
    ok();
  });

  wait( 2, function()
  {
    strictEqual( q.$results.length, 3, 'times up, data loaded' );
  });

  timer.run();
});

test( 'search failure', function(assert)
{
  var timer = assert.timer();
  var prefix = 'Rekord_search_failure_';

  expect( 4 );

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    load: Rekord.Load.None
  });

  var remote = Todo.Database.rest;

  remote.queries.put( 'http://rekord.io', [
    {id: 1, name: 't1', done: true},
    {id: 2, name: 't2', done: false},
    {id: 3, name: 't3', done: true}
  ]);

  remote.delay = 1;
  remote.status = 300;

  var q = Todo.search( 'http://rekord.io' );
  var p = q.$run();

  expect( 4 );

  strictEqual( q.$results.length, 0, 'initial length zero' );

  p.complete(function()
  {
    strictEqual( q.$results.length, 0, 'ready but empty' );
  });

  p.success(function()
  {
    ok();
  });

  p.failure(function()
  {
    strictEqual( q.$results.length, 0, 'failure notified' );
  });

  wait( 2, function()
  {
    strictEqual( q.$results.length, 0, 'times up, no data' );
  });

  timer.run();
});

test( 'search single', function(assert)
{
  var timer = assert.timer();
  var prefix = 'Rekord_search_single_';

  expect( 4 );

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    load: Rekord.Load.None
  });

  var remote = Todo.Database.rest;

  remote.queries.put( 'http://rekord.io', {id: 1, name: 't1', done: true} );

  remote.delay = 1;

  var q = Todo.search( 'http://rekord.io' );
  var p = q.$run();

  strictEqual( q.$results.length, 0 );

  p.complete(function()
  {
    strictEqual( q.$results.length, 1, 'query ready and models loaded' );
  });

  p.success(function()
  {
    strictEqual( q.$results.length, 1, 'query success and models loaded' );
  });

  p.failure(function()
  {
    ok();
  });

  wait( 2, function()
  {
    strictEqual( q.$results.length, 1, 'times up, data loaded' );
  });

  timer.run();
});

test( 'ready', function(assert)
{
  var prefix = 'Rekord_ready_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  expect(1);

  Todo.ready(function(db)
  {
    strictEqual( db, Todo.Database );
  });
});

test( 'fetchAll', function(assert)
{
  var timer = assert.timer();
  var prefix = 'Rekord_fetchAll_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var remote = Todo.Database.rest;

  remote.map.put( 1, {id: 1, name: 't1' } );
  remote.map.put( 2, {id: 2, name: 't2' } );
  remote.map.put( 3, {id: 3, name: 't3' } );

  remote.delay = 1;

  expect( 2 );

  var todos = Todo.fetchAll(function(loadedTodos)
  {
    strictEqual( todos, loadedTodos );
    strictEqual( todos.length, 3 );
  });

  timer.run();
});

test( 'findOrCreate', function(assert)
{
  var prefix = 'Rekord_findOrCreate_';

  var Item = Rekord({
    name: prefix + 'item',
    fields: ['name']
  });

  var List = Rekord({
    name: prefix + 'list',
    fields: ['name']
  });

  var ListItem = Rekord({
    name: prefix + 'list_item',
    key: ['list_id', 'item_id'],
    fields: ['quantity'],
    belongsTo: {
      list: {
        model: List,
        local: 'list_id'
      },
      item: {
        model: Item,
        local: 'item_id'
      }
    }
  });

  var l1 = List.create({id: 1, name: 'list1'});
  var i2 = Item.create({id: 2, name: 'item2'});

  var li0 = ListItem.findOrCreate({
    list: l1,
    item: i2,
    quantity: 3
  });

  ok( li0.$isSaved() );
  strictEqual( li0.list_id, 1 );
  strictEqual( li0.item_id, 2 );
  strictEqual( li0.quantity, 3 );

  var li1 = ListItem.findOrCreate({
    list: l1,
    item: i2,
    quantity: 4
  });

  strictEqual( li0, li1 );
  strictEqual( li0.quantity, 4 );
  strictEqual( li0.$saved.quantity, 3 );
});

test( 'persist', function(assert)
{
  var prefix = 'Rekord_persist_';

  var Item = Rekord({
    name: prefix + 'item',
    fields: ['name']
  });

  var List = Rekord({
    name: prefix + 'list',
    fields: ['name']
  });

  var ListItem = Rekord({
    name: prefix + 'list_item',
    key: ['list_id', 'item_id'],
    fields: ['quantity'],
    belongsTo: {
      list: {
        model: List,
        local: 'list_id'
      },
      item: {
        model: Item,
        local: 'item_id'
      }
    }
  });

  var l1 = List.create({id: 1, name: 'list1'});
  var i2 = Item.create({id: 2, name: 'item2'});

  var li0 = ListItem.persist({
    list: l1,
    item: i2,
    quantity: 3
  });

  ok( li0.$isSaved() );
  strictEqual( li0.list_id, 1 );
  strictEqual( li0.item_id, 2 );
  strictEqual( li0.quantity, 3 );

  var li1 = ListItem.persist({
    list: l1,
    item: i2,
    quantity: 4
  });

  strictEqual( li0, li1 );
  strictEqual( li0.quantity, 4 );
  strictEqual( li0.$saved.quantity, 4 );
});

test( 'count', function(assert)
{
  var prefix = 'Rekord_count_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  strictEqual( Task.count(), 0 );
  strictEqual( Task.count('done', true), 0 );

  Task.create({id: 2, name: 't2', done: true});
  Task.create({id: 3, name: 't3', done: false});
  Task.create({id: 4, name: 't4', done: false});
  Task.create({id: 5, name: 't5', done: true});

  strictEqual( Task.count(), 4 );
  strictEqual( Task.count('done', true), 2 );
});
