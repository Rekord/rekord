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