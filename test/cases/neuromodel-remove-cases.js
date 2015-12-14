module( 'Neuro.Model remove cases' );

test( 'delete while in the middle of save', function(assert)
{
  var timer = assert.timer();
  var done = assert.async();

  var Todo = Neuro({
    name: 'delete_mid_save',
    fields: ['id', 'name']
  });

  var rest = Todo.Database.rest;

  var t0 = Todo.create({name: 'todo0'});

  ok( t0.$isSaved() );

  rest.delay = 1;

  t0.name = 'todo1';
  t0.$save();

  strictEqual( t0.$saved.name, 'todo0' );
  notOk( t0.$isDeleted() );

  rest.delay = 0;

  t0.$remove();

  wait(2, function()
  {
    strictEqual( rest.map.values.length, 0 );
    strictEqual( t0.$saved, void 0 )
    ok( t0.$isDeleted() );

    done();
  });

  timer.run();
});

test( 'delete with cache:none should go right to remote', function(assert)
{
  var Todo = Neuro({
    name: 'delete_cache_false',
    fields: ['id', 'name'],
    cache: Neuro.Cache.None
  });

  var rest = Todo.Database.rest;

  var t0 = Todo.create({name: 'todo#0'});

  rest.delay = 10;

  t0.$remove();

  strictEqual( t0.$operation.type, 'NeuroRemoveRemote' );
});

test( 'delete local when it hasn\'t been saved locally', function(assert)
{
  var Todo = Neuro({
    name: 'delete_local_missing',
    fields: ['id', 'name']
  });

  var local = Todo.Database.store;

  var t0 = new Todo({name: 'todo0'});

  notOk( t0.$isDeleted() );

  local.valid = false;
  t0.$save();
  local.valid = true;

  t0.$remove();

  ok( t0.$isDeleted() );
});

test( 'delete when it hasn\'t been saved remotely', function(assert)
{
  var Todo = Neuro({
    name: 'delete_not_remote',
    fields: ['id', 'name']
  });

  var local = Todo.Database.store.map;

  offline();

  var t0 = new Todo({name: 'todo0'});

  notOk( t0.$isSavedLocally() );
  notOk( t0.$isSaved() );

  t0.$save();

  ok( local.has( t0.id ) );
  ok( t0.$isSavedLocally() );
  notOk( t0.$isSaved() );

  t0.$remove();

  notOk( local.has( t0.id ) );
  notOk( t0.$isSaved() );

  online();

  noline();
});

test( 'delete while remotely removed (404/410)', function(assert)
{
  var Todo = Neuro({
    name: 'delete_remote_remove',
    fields: ['id', 'name']
  });

  var remote = Todo.Database.rest;

  var t0 = Todo.create({name: 'name0'});

  ok( t0.$isSaved() );

  remote.status = 404;

  t0.$remove();

  ok( t0.$isDeleted() );
});

test( 'delete with unexpected status code shouldn\'t remove from local storage', function(assert)
{
  var Todo = Neuro({
    name: 'delete_unexpected',
    fields: ['id', 'name']
  });

  var remote = Todo.Database.rest;
  var local = Todo.Database.store.map;

  var t0 = Todo.create({name: 'name0'});

  ok( t0.$isSaved() );
  ok( local.has( t0.id ) );
  ok( remote.map.has( t0.id ) );
  notOk( t0.$isDeleted() );

  remote.status = 303;

  t0.$remove();

  ok( local.has( t0.id ) );
  ok( remote.map.has( t0.id ) );
  ok( t0.$isDeleted() );

  remote.status = 200;

  t0.$remove();

  /* TODO fix remove that has failed - so I can remove locally. Remove $local
  notOk( local.has( t0.id ) );
  notOk( remote.map.has( t0.id ) );
  ok( t0.$isDeleted() );
   */
});

test( 'delete while offline, resume delete online', function(assert)
{
  var Todo = Neuro({
    name: 'delete_offline',
    fields: ['id', 'name']
  });

  var remote = Todo.Database.rest;
  var local = Todo.Database.store;

  var t0 = Todo.create({name: 'name0'});

  offline();

  ok( remote.map.has( t0.id ) );
  ok( local.map.has( t0.id ) );

  t0.$remove();

  ok( remote.map.has( t0.id ) );
  ok( local.map.has( t0.id ) );

  online();

  notOk( remote.map.has( t0.id ) );
  notOk( local.map.has( t0.id ) );

  noline();
});