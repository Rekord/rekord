module( 'Neuro.Model save cases' );

test( 'save while deleted', function(assert)
{
  var Todo = Neuro({
    name: 'save_while_deleted',
    fields: ['id', 'name']
  });

  var t0 = Todo.create({id: 5, name: 'name0'});

  ok( t0.$isSaved() );

  deepEqual( t0.$saved, {id: 5, name: 'name0'} );

  t0.$remove();

  t0.name = 'name1';

  t0.$save();

  deepEqual( t0.$saved, {id: 5, name: 'name0'} );
});

test( 'save with cache:none should go right to remote', function(assert)
{
  var Todo = Neuro({
    name: 'save_no_cache',
    fields: ['id', 'name'],
    cache: Neuro.Cache.None
  });

  var rest = Todo.Database.rest;

  rest.delay = 10;

  var t0 = Todo.create({name: 'todo#0'});

  strictEqual( t0.$operation.type, 'NeuroSaveRemote' );
});

test( 'save without changes', function(assert)
{
  var Todo = Neuro({
    name: 'save_without_changes',
    fields: ['id', 'name']
  });

  var rest = Todo.Database.rest;

  var t0 = Todo.create({name: 'todo#0'});

  rest.delay = 10;

  t0.$save();

  strictEqual( t0.$operation, null );
});

test( 'save while remotely removed', function(assert)
{
  var Todo = Neuro({
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

  ok( t0.$deleted );
  notOk( t0.$pendingSave );
});

test( 'save with unexpected status code', function(assert)
{
  var Todo = Neuro({
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
  var Todo = Neuro({
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
  var Todo = Neuro({
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
  var Todo = Neuro({
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
  var Todo = Neuro({
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
  var done = assert.async();

  var Todo = Neuro({
    name: 'save_cache_pending',
    fields: ['id', 'name'],
    cache: Neuro.Cache.Pending
  });

  var local = Todo.Database.store;
  var remote = Todo.Database.rest;

  remote.delay = 10;

  var t0 = Todo.create({name: 'name0'});

  ok( t0.$isSavedLocally() );
  notOk( t0.$isSaved() );

  ok( local.map.has( t0.id ) );
  notOk( remote.map.has( t0.id ) );

  setTimeout(function()
  {
    ok( t0.$isSaved() );
    notOk( local.map.has( t0.id ) );
    ok( remote.map.has( t0.id ) );
    done();

  }, 15);
});