module( 'RekordModelCollection' );

test( 'duplicate value', function(assert)
{
  var prefix = 'RekordModelCollection_duplicate_value_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var all = Todo.all();
  var filtered = all.filtered();
  var page = filtered.page(10);

  strictEqual( all.length, 0 );
  strictEqual( filtered.length, 0 );
  strictEqual( page.length, 0 );

  var t0 = new Todo({name: 't0'});
  t0.$save();
  t0.$save();

  strictEqual( all.length, 1 );
  strictEqual( filtered.length, 1 );
  strictEqual( page.length, 1 );
});

test( 'pushWhere', function(assert)
{
  var prefix = 'RekordModelCollection_pushWhere_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: true});

  t1.name = 't1a';
  t2.name = 't2a';

  var c = Todo.collect([t0, t1, t2]);

  c.pushWhere(['name'], 'done', true);

  deepEqual( t0.$savedState, {name: 't0'} );
  deepEqual( t1.$savedState, void 0 );
  deepEqual( t2.$savedState, {name: 't2a'} );
});

test( 'popWhere', function(assert)
{
  var prefix = 'RekordModelCollection_popWhere_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: true});

  var c = Todo.collect([t0, t1, t2]);

  c.pushWhere();

  t1.name = 't1a';
  t2.name = 't2a';

  c.popWhere(false, 'done', true);

  strictEqual( t0.name, 't0' );
  strictEqual( t1.name, 't1a' );
  strictEqual( t2.name, 't2' );
});

test( 'discardWhere', function(assert)
{
  var prefix = 'RekordModelCollection_discardWhere_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: true});

  var c = Todo.collect([t0, t1, t2]);

  c.pushWhere();

  t1.name = 't1a';
  t2.name = 't2a';

  c.discardWhere('done', true);
  c.popWhere();

  strictEqual( t0.name, 't0' );
  strictEqual( t1.name, 't1' );
  strictEqual( t2.name, 't2a' );
});

test( 'cancelWhere', function(assert)
{
  var prefix = 'RekordModelCollection_cancelWhere_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: true});
  var t3 = new Todo({name: 't3', done: true});

  var c = Todo.collect([t0, t1, t2, t3]);

  t1.name = 't1a';
  t2.name = 't2a';

  c.cancelWhere(false, 'done', true);

  strictEqual( t0.name, 't0' );
  strictEqual( t1.name, 't1a' );
  strictEqual( t2.name, 't2' );
  strictEqual( t3.name, 't3' );

  c.cancelWhere(true, 'name', 't3');

  strictEqual( t3.name, void 0 );
});

test( 'clone models', function(assert)
{
  var prefix = 'RekordModelCollection_clone_models_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});

  var c = Todo.collect([t0, t1]);

  var clone = c.clone( true, {done: false} );
  var t2 = clone[ 0 ];
  var t3 = clone[ 1 ];

  notStrictEqual( t0, t2 );
  strictEqual( t0.name, t2.name );
  strictEqual( t2.done, false );

  notStrictEqual( t1, t3 );
  strictEqual( t1.name, t3.name );
  strictEqual( t3.done, false );
});

test( 'refreshWhere', function(assert)
{
  var prefix = 'RekordModelCollection_refreshWhere_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var t0 = Todo.create({name: 't0', done: true});
  var t1 = Todo.create({name: 't1', done: false});
  var t2 = Todo.create({name: 't2', done: true});

  var c = Todo.collect([t0, t1, t2]);

  Todo.Database.rest.map.put( t0.id, {name: 't0a'} );
  Todo.Database.rest.map.put( t1.id, {name: 't1a'} );
  Todo.Database.rest.map.put( t2.id, {name: 't2a'} );

  c.refreshWhere( 'done', true );

  strictEqual( t0.name, 't0a' );
  strictEqual( t1.name, 't1' );
  strictEqual( t2.name, 't2a' );
});

test( 'sort', function(assert)
{
  var prefix = 'RekordModelCollection_sort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var c = Todo.collect([
    {id: 1, name: 't1', done: 0},
    {id: 2, name: 't2', done: 1},
    {id: 3, name: 't3', done:-1}
  ]);

  c.sort( 'done' );

  strictEqual( Rekord.sizeof( c.map.indices ), 3 );
  strictEqual( c.map.indices[3], 0 );
  strictEqual( c.map.indices[1], 1 );
  strictEqual( c.map.indices[2], 2 );
});

test( 'subtract array', function(assert)
{
  var prefix = 'RekordModelCollection_subtract_array_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c0 = Todo.collect([t1, t2, t3, t4]);
  var s0 = [3, t5];
  var r0 = c0.subtract( s0, [] );

  deepEqual( r0, [t1, t2, t4] );
});

test( 'subtract collection', function(assert)
{
  var prefix = 'RekordModelCollection_subtract_collection_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c0 = Todo.collect([t1, t2, t3, t4]);
  var s0 = Todo.collect([3, t5]);
  var r0 = c0.subtract( s0, [] );

  deepEqual( r0, [t1, t2, t4] );
});

test( 'intersect array', function(assert)
{
  var prefix = 'RekordModelCollection_intersect_array_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c0 = Todo.collect([t1, t2, t3, t4]);
  var s0 = [t1, 3, t5];
  var r0 = c0.intersect( s0, [] );

  deepEqual( r0, [t1, 3] );
});

test( 'intersect collection', function(assert)
{
  var prefix = 'RekordModelCollection_intersect_collection_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c0 = Todo.collect([t1, t2, t3, t4]);
  var s0 = Todo.collect([t1, 3, t5]);
  var r0 = c0.intersect( s0, [] );

  deepEqual( r0, [t1, t3] );
});

test( 'complement array', function(assert)
{
  var prefix = 'RekordModelCollection_complement_array_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c0 = Todo.collect([t1, t2, t3, t4]);
  var s0 = [t1, 3, 5];
  var r0 = c0.complement( s0, [] );

  deepEqual( r0, [5] );
});

test( 'complement collection', function(assert)
{
  var prefix = 'RekordModelCollection_complement_collection_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c0 = Todo.collect([t1, t2, t3, t4]);
  var s0 = Todo.collect([t1, 3, 5]);
  var r0 = c0.complement( s0, [] );

  deepEqual( r0, [t5] );
});

test( 'clear', function(assert)
{
  var prefix = 'RekordModelCollection_clear_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t3, t4, t5]);

  strictEqual( Rekord.sizeof( c.map.indices ), 5 );

  c.clear();

  strictEqual( Rekord.sizeof( c.map.indices ), 0 );
  strictEqual( c.length, 0 );
});

test( 'reset', function(assert)
{
  var prefix = 'RekordModelCollection_reset_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t3]);

  deepEqual( c.map.indices, {1: 0, 2: 1, 3: 2} );

  c.reset( t4 );

  deepEqual( c.map.indices, {4: 0} );

  c.reset( [4, 3, 1] );

  deepEqual( c.map.indices, {4: 0, 3: 1, 1: 2} );
  deepEqual( c.toArray(), [t4, t3, t1] );
});

test( 'put', function(assert)
{
  var prefix = 'RekordModelCollection_put_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v.id, 2, 'model matched' );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  c.put( 2, t2 );

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2, 2: 3} );
});

test( 'put autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_put_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]).setComparator( 'name' );

  expect( 4 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v.id, 2, 'model matched' );
  });

  deepEqual( c.map.indices, {1: 0, 3: 1, 4: 2} );

  c.put( 2, t2 );

  deepEqual( c.map.indices, {1: 0, 2: 1, 3: 2, 4: 3} );
});

test( 'add', function(assert)
{
  var prefix = 'RekordModelCollection_add_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v.id, 2, 'model matched' );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  c.add( t2 );

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2, 2: 3} );
});

test( 'add autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_add_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]).setComparator( 'name' );

  expect( 4 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v.id, 2, 'model matched' );
  });

  deepEqual( c.map.indices, {1: 0, 3: 1, 4: 2} );

  c.add( t2 );

  deepEqual( c.map.indices, {1: 0, 2: 1, 3: 2, 4: 3} );
});

test( 'push', function(assert)
{
  var prefix = 'RekordModelCollection_push_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, values)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( values, [t2, 5, t3] );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  c.push( t2, 5, t3 );

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2, 2: 3, 5: 4} );
});

test( 'addAll', function(assert)
{
  var prefix = 'RekordModelCollection_addAll_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, values)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( values, [t2, 5, t3] );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  c.addAll( [t2, 5, t3] );

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2, 2: 3, 5: 4} );
});

test( 'pop', function(assert)
{
  var prefix = 'RekordModelCollection_pop_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t3 );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  var popped = c.pop();

  strictEqual( popped, t3 );
  deepEqual( c.map.indices, {1: 0, 4: 1} );
});

test( 'pop autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_pop_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]).setComparator('name');

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t4 );
  });

  deepEqual( c.map.indices, {1: 0, 3: 1, 4: 2} );

  var popped = c.pop();

  strictEqual( popped, t4 );
  deepEqual( c.map.indices, {1: 0, 3: 1} );
});

test( 'shift', function(assert)
{
  var prefix = 'RekordModelCollection_shift_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t1 );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  var popped = c.shift();

  strictEqual( popped, t1 );
  deepEqual( c.map.indices, {3: 0, 4: 1} );
});

test( 'shift autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_shift_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]).setComparator('name');

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t1 );
  });

  deepEqual( c.map.indices, {1: 0, 3: 1, 4: 2} );

  var popped = c.shift();

  strictEqual( popped, t1 );
  deepEqual( c.map.indices, {3: 0, 4: 1} );
});

test( 'removeAt', function(assert)
{
  var prefix = 'RekordModelCollection_removeAt_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t1 );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  var popped = c.removeAt(0);

  strictEqual( popped, t1 );
  deepEqual( c.map.indices, {3: 0, 4: 1} );
});

test( 'removeAt autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_removeAt_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]).setComparator('name');

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t1 );
  });

  deepEqual( c.map.indices, {1: 0, 3: 1, 4: 2} );

  var popped = c.removeAt(0);

  strictEqual( popped, t1 );
  deepEqual( c.map.indices, {3: 0, 4: 1} );
});

test( 'remove', function(assert)
{
  var prefix = 'RekordModelCollection_remove_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t1 );
  });

  deepEqual( c.map.indices, {1: 0, 4: 1, 3: 2} );

  var popped = c.remove(1);

  strictEqual( popped, t1 );
  deepEqual( c.map.indices, {3: 0, 4: 1} );
});

test( 'remove autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_remove_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]).setComparator('name');

  expect( 5 );

  c.on( Rekord.Collection.Events.Remove, function(arr, removed, i)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed, t1 );
  });

  deepEqual( c.map.indices, {1: 0, 3: 1, 4: 2} );

  var popped = c.remove(1);

  strictEqual( popped, t1 );
  deepEqual( c.map.indices, {3: 0, 4: 1} );
});

test( 'indexOf', function(assert)
{
  var prefix = 'RekordModelCollection_indexOf_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  strictEqual( c.indexOf(1), 0 );
  strictEqual( c.indexOf(t1), 0 );
  strictEqual( c.indexOf(t2), -1 );
  strictEqual( c.indexOf(4), 1 );
  strictEqual( c.indexOf(3), 2 );
});

test( 'keys', function(assert)
{
  var prefix = 'RekordModelCollection_keys_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t4, t3]);

  c.reverse();

  deepEqual( c.keys(), [3, 4, 1] );

  c.splice( 1, 1, t2 );

  deepEqual( c.keys(), [3, 2, 1] );
});

test( 'removeWhere', function(assert)
{
  var prefix = 'RekordModelCollection_removeWhere_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var is2or3 = function(t) {
    return t.id === 2 || t.id === 3;
  };

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t3, t4, t5]);

  var r = c.removeWhere( false, is2or3 );

  deepEqual( r.toArray(), [t2, t3] );
  deepEqual( c.toArray(), [t1, t5, t4] );
});

test( 'removeWhere autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_removeWhere_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name']
  });

  var is2or3 = function(t) {
    return t.id === 2 || t.id === 3;
  };

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t3, t4, t5]).setComparator('name');

  var r = c.removeWhere( false, is2or3 );

  deepEqual( r.toArray(), [t2, t3] );
  deepEqual( c.toArray(), [t1, t4, t5] );
});

test( 'update', function(assert)
{
  var prefix = 'RekordModelCollection_update_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: {
      done: false
    }
  });

  var is2or3 = function(t) {
    return t.id === 2 || t.id === 3;
  };

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t3, t4, t5]);

  c.update('done', true);

  strictEqual( t1.done, true );
  strictEqual( t2.done, true );
  strictEqual( t3.done, true );
  strictEqual( t4.done, true );
  strictEqual( t5.done, true );
});

test( 'updateWhere', function(assert)
{
  var prefix = 'RekordModelCollection_update_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: {
      done: false
    }
  });

  var is2or3 = function(t) {
    return t.id === 2 || t.id === 3;
  };

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t3, t4, t5]);

  c.updateWhere(is2or3, 'done', true);

  strictEqual( t1.done, false );
  strictEqual( t2.done, true );
  strictEqual( t3.done, true );
  strictEqual( t4.done, false );
  strictEqual( t5.done, false );
});

test( 'updateWhere autoSort', function(assert)
{
  var prefix = 'RekordModelCollection_update_autoSort_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: {
      done: false
    }
  });

  var is2or3 = function(t) {
    return t.id === 2 || t.id === 3;
  };

  var t1 = Todo.create({id: 1, name: 't1'});
  var t2 = Todo.create({id: 2, name: 't2'});
  var t3 = Todo.create({id: 3, name: 't3'});
  var t4 = Todo.create({id: 4, name: 't4'});
  var t5 = Todo.create({id: 5, name: 't5'});

  var c = Todo.collect([t1, t2, t4, t3, t5]).setComparator(['done', 'name']);

  deepEqual( c.pluck('id'), [1, 2, 3, 4, 5] );

  c.updateWhere(is2or3, 'done', true);

  deepEqual( c.pluck('id'), [2, 3, 1, 4, 5] );
});

test( 'hasChanges', function(assert)
{
  var prefix = 'RekordModelCollection_hasChanges_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: {
      done: false
    }
  });

  var t0 = Todo.create({name: 't0'});
  var t1 = Todo.create({name: 't1'});
  var t2 = Todo.create({name: 't2'});

  var c = Todo.collect([t0, t1, t2]);

  notOk( c.hasChanges() );

  t0.name = 't0a';

  ok( c.hasChanges() );

  t0.$save();

  notOk( c.hasChanges() );
});

test( 'getChanges', function(assert)
{
  var prefix = 'RekordModelCollection_getChanges_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: {
      done: false
    }
  });

  var t0 = Todo.create({id: 10, name: 't0'});
  var t1 = Todo.create({id: 11, name: 't1'});
  var t2 = Todo.create({id: 12, name: 't2'});

  var c = Todo.collect([t0, t1, t2]);

  deepEqual( c.getChanges().toObject(), {} );

  t0.name = 't0a';

  deepEqual( c.getChanges().toObject(), {10: {name: 't0a'}} );

  t0.$save();

  deepEqual( c.getChanges().toObject(), {} );
});
