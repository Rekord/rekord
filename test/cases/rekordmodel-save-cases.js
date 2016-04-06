module( 'Rekord.Model save cases' );

test( 'save while deleted', function(assert)
{
  var Todo = Rekord({
    name: 'save_while_deleted',
    fields: ['id', 'name']
  });

  var t0 = Todo.create({id: 5, name: 'name0'});

  ok( t0.$isSaved() );

  deepEqual( t0.$saved, {id: 5, name: 'name0'} );

  t0.$remove();

  deepEqual( t0.$saved, void 0 );

  t0.name = 'name1';

  t0.$save();

  deepEqual( t0.$saved, void 0 );
});

test( 'save with cache:none should go right to remote', function(assert)
{
  var timer = assert.timer();

  var Todo = Rekord({
    name: 'save_no_cache',
    fields: ['id', 'name'],
    cache: Rekord.Cache.None
  });

  var rest = Todo.Database.rest;

  rest.delay = 10;

  var t0 = Todo.create({name: 'todo#0'});

  strictEqual( t0.$operation.type, 'SaveRemote' );

  timer.run();
});

test( 'save without changes', function(assert)
{
  var timer = assert.timer();

  var Todo = Rekord({
    name: 'save_without_changes',
    fields: ['id', 'name']
  });

  var rest = Todo.Database.rest;

  var t0 = Todo.create({name: 'todo#0'});

  rest.delay = 10;

  t0.$save();

  strictEqual( t0.$operation, null );

  timer.run();
});

test( 'save while remotely removed', function(assert)
{
  var Todo = Rekord({
    name: 'save_while_removed',
    fields: ['id', 'name']
  });

  var rest = Todo.Database.rest;
  var local = Todo.Database.store.map.values;

  var t0 = Todo.create({name: 'todo#0'});

  ok( t0.$isSaved() );
  strictEqual( local.length, 1 );

  rest.status = 404;

  t0.name = 'todo#1';
  t0.$save();

  ok( t0.$isDeleted() );
  notStrictEqual( t0.$status, Rekord.Model.Status.SavePending );
});

test( 'save with unexpected status code', function(assert)
{
  var Todo = Rekord({
    name: 'save_unexpected_status',
    fields: ['id', 'name']
  });

  var rest = Todo.Database.rest;

  var t0 = Todo.create({name: 'todo#0'});

  ok( t0.$isSaved() );

  rest.status = 303;

  var t1 = Todo.create({name: 'todo#1'});

  notOk( t1.$isSaved() );
});

test( 'save while offline, resume save online', function(assert)
{
  noline();

  var Todo = Rekord({
    name: 'save_offline',
    fields: ['id', 'name']
  });

  var t0 = new Todo({name: 'name0'});

  offline();

  t0.$save();

  notOk( t0.$isSaved() );

  online();

  ok( t0.$isSaved() );

  noline();
});

test( 'save, then delete, then save finishes', function(assert)
{
  noline();

  var Todo = Rekord({
    name: 'save_offline',
    fields: ['id', 'name']
  });

  var t0 = new Todo({name: 'name0'});

  offline();

  t0.$save();

  notOk( t0.$isSaved() );

  t0.$remove();

  online();

  notOk( t0.$isSaved() );

  noline();
});

test( 'save, rest returns updated fields', function(assert)
{
  var Todo = Rekord({
    name: 'save_updated',
    fields: ['id', 'name']
  });

  var rest = Todo.Database.rest;

  var t0 = new Todo({name: 'name0'});

  strictEqual( t0.name, 'name0' );

  rest.returnValue = {name: 'name1'};

  t0.$save();

  strictEqual( t0.name, 'name1' );
});

test( 'save remote first time, check $saved', function(assert)
{
  var Todo = Rekord({
    name: 'save_first',
    fields: ['id', 'name']
  });

  var t0 = new Todo({name: 'name0'});

  strictEqual( t0.$saved, void 0 );

  t0.$save();

  strictEqual( t0.id, t0.$saved.id );
  strictEqual( t0.name, t0.$saved.name );
});

test( 'save remote and cache pending should remove locally', function(assert)
{
  var timer = assert.timer();
  var done = assert.async();

  var Todo = Rekord({
    name: 'save_cache_pending',
    fields: ['id', 'name'],
    cache: Rekord.Cache.Pending
  });

  var local = Todo.Database.store;
  var remote = Todo.Database.rest;

  remote.delay = 10;

  var t0 = Todo.create({name: 'name0'});

  ok( t0.$isSavedLocally() );
  notOk( t0.$isSaved() );

  ok( local.map.has( t0.id ) );
  notOk( remote.map.has( t0.id ) );

  wait(15, function()
  {
    ok( t0.$isSaved() );
    notOk( local.map.has( t0.id ) );
    ok( remote.map.has( t0.id ) );

    done();
  });

  timer.run();
});

test( 'save remote transaction', function(assert)
{
  var timer = assert.timer();
  var prefix = 'RekordModel_save_remote_transaction_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var List = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id',
        cascadeSave: Rekord.Cascade.All
      }
    }
  });

  var t0 = Task.create({name: 't0', done: 0});
  var t1 = Task.create({name: 't1', done: 1});
  var l0 = List.create({name: 'l0', tasks: [t0, t1]});

  l0.name = 'l0a';
  t0.name = 't0a';
  t1.$save();

  Task.Database.rest.delay = 2;
  List.Database.rest.delay = 1;

  var txn = l0.$save();
  var done = false;

  txn.then(function(result)
  {
    ok( done, 'then called' );
    strictEqual( result, 'remote-success' );
  });

  wait( 0, function()
  {
    notOk( txn.isFinished() );
    strictEqual( txn.completed, 0 );
    strictEqual( txn.operations, 2 );
  });

  wait( 1, function()
  {
    notOk( txn.isFinished() );
    strictEqual( txn.completed, 1 );
    done = true;
  });

  wait( 2, function()
  {
    ok( txn.isFinished() );
    strictEqual( txn.completed, 2 );
  });

  timer.run();
});

test( 'save local transaction', function(assert)
{
  var timer = assert.timer();
  var prefix = 'RekordModel_save_local_transaction_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var List = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id',
        cascadeSave: Rekord.Cascade.Local
      }
    }
  });

  var t0 = Task.create({name: 't0', done: 0});
  var t1 = Task.create({name: 't1', done: 1});
  var l0 = List.create({name: 'l0', tasks: [t0, t1]});

  l0.name = 'l0a';
  t0.name = 't0a';
  t1.$save();

  Task.Database.store.delay = 2;
  List.Database.store.delay = 1;

  var txn = l0.$save( Rekord.Cascade.Local );
  var done = false;

  txn.then(function(result)
  {
    ok( done, 'then called' );
    strictEqual( result, 'local-success' );
  });

  wait( 0, function()
  {
    notOk( txn.isFinished() );
    strictEqual( txn.completed, 0 );
    strictEqual( txn.operations, 2 );
  });

  wait( 1, function()
  {
    notOk( txn.isFinished() );
    strictEqual( txn.completed, 1 );
    done = true;
  });

  wait( 2, function()
  {
    ok( txn.isFinished() );
    strictEqual( txn.completed, 2 );
  });

  timer.run();
});

test( 'save offline transaction', function(assert)
{
  var timer = assert.timer();
  var prefix = 'RekordModel_save_offline_transaction_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var List = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0', done: 0});
  var t1 = Task.create({name: 't1', done: 1});
  var l0 = List.create({name: 'l0', tasks: [t0, t1]});

  l0.name = 'l0a';
  t0.name = 't0a';
  t1.$save();

  Task.Database.rest.delay = 2;
  List.Database.rest.delay = 1;

  offline();

  var txn = l0.$save();

  txn.then(function(result)
  {
    strictEqual( result, 'offline' );
  });

  timer.run();

  noline();
});
