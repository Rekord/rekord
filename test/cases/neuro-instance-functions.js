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
    $saved: { id: 4, name: 'This', done: true }
  });
  strictEqual( live.lastMessage, null );
});