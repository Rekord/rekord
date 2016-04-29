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
