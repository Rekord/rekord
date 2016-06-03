module( 'Rekord Search' );

test( '$run default', function(assert)
{
  var prefix = 'RekordSearch_run_default_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  strictEqual( Task.all().length, 0 );

  var rest = Task.Database.rest;

  rest.returnValue = [
    {id: 1, name: 't0', done: 1},
    {id: 2, name: 't1', done: 0}
  ];

  var search = Task.search();
  search.name = 'names';
  search.$run();

  deepEqual( rest.lastRecord, {name: 'names'} );

  strictEqual( search.$results.length, 2 );
  strictEqual( Task.all().length, 2 );

  var t0 = Task.get(1);
  var t1 = Task.get(2);

  ok( t0 );
  ok( t1 );
  strictEqual( search.$results[0], t0 );
  strictEqual( search.$results[1], t1 );
});

test( '$run url', function(assert)
{
  var prefix = 'RekordSearch_run_url_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  strictEqual( Task.all().length, 0 );

  var rest = Task.Database.rest;

  rest.returnValue = [
    {id: 1, name: 't0', done: 1},
    {id: 2, name: 't1', done: 0}
  ];

  var search = Task.search();
  search.name = 'names';
  search.$run('/some/url');

  deepEqual( rest.lastRecord, {name: 'names'} );
  strictEqual( search.$url, '/some/url' );

  strictEqual( search.$results.length, 2 );
  strictEqual( Task.all().length, 2 );

  var t0 = Task.get(1);
  var t1 = Task.get(2);

  ok( t0 );
  ok( t1 );
  strictEqual( search.$results[0], t0 );
  strictEqual( search.$results[1], t1 );
});

test( '$run props', function(assert)
{
  var prefix = 'RekordSearch_run_props_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  strictEqual( Task.all().length, 0 );

  var rest = Task.Database.rest;

  rest.returnValue = [
    {id: 1, name: 't0', done: 1},
    {id: 2, name: 't1', done: 0}
  ];

  var search = Task.search();
  search.$run( void 0, {
    name: 'names'
  });

  deepEqual( rest.lastRecord, {name: 'names'} );
  strictEqual( search.$url, void 0 );

  strictEqual( search.$results.length, 2 );
  strictEqual( Task.all().length, 2 );

  var t0 = Task.get(1);
  var t1 = Task.get(2);

  ok( t0 );
  ok( t1 );
  strictEqual( search.$results[0], t0 );
  strictEqual( search.$results[1], t1 );
});

test( '$run concurrent', function(assert)
{
  var timer = assert.timer();
  var prefix = 'RekordSearch_run_concurrent_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  rest.delay = 2;
  rest.returnValue = [
    {id: 1, name: 't0', done: 1},
    {id: 2, name: 't1', done: 0}
  ];

  var search = Task.search();
  search.name = 'names';
  var p = search.$run();

  ok( p.isPending() );

  wait( 1, function()
  {
    ok( p.isPending() );

    rest.returnValue = [
      {id: 3, name: 't2', done: 1}
    ];

    p = search.$run();

    ok( p.isPending() );
  });

  wait( 4, function()
  {
    ok( p.isSuccess() );
    strictEqual( search.$results.length, 1 );
    strictEqual( search.$results[0].name, 't2' );
  });

  timer.run();
});

test( '$run concurrent, ensure latest', function(assert)
{
  var timer = assert.timer();

  var prefix = 'RekordSearch_run_concurrent_latest_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  rest.delay = 5;
  rest.returnValue = [
    {id: 1, name: 't0', done: 1},
    {id: 2, name: 't1', done: 0}
  ];

  var search = Task.search();
  search.name = 'names';
  search.$run();

  wait( 1, function()
  {
    rest.delay = 2;

    search.name = 'names2';
    search.$run();
  });

  wait( 4, function()
  {
    strictEqual( search.$results.length, 2 );
  });

  timer.run();
});

test( '$cancel', function(assert)
{
  var timer = assert.timer();

  var prefix = 'RekordSearch_cancel_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  rest.delay = 2;
  rest.returnValue = [
    {id: 1, name: 't0', done: 1},
    {id: 2, name: 't1', done: 0}
  ];

  var search = Task.search();
  search.name = 'names';
  search.$run();

  wait( 1, function()
  {
    search.$cancel();
  });

  wait( 3, function()
  {
    strictEqual( search.$results.length, 0 );
  });

  timer.run();
});

test( '$decode', function(assert)
{
  var timer = assert.timer();

  var prefix = 'RekordSearch_decode_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  expect( 2 );

  rest.delay = 2;
  rest.returnValue = {
    results: [
      {id: 1, name: 't0', done: 1},
      {id: 2, name: 't1', done: 0}
    ]
  };

  var search = Task.search('/some/url', {
    $decode: function(response) {
      ok( response.results, 'response results exist' );
      return response.results;
    }
  });

  search.name = 'names';
  search.$run();

  wait( 3, function()
  {
    strictEqual( search.$results.length, 2, 'response results returned' );
  });

  timer.run();
});

test( '$offline', function(assert)
{
  var prefix = 'RekordSearch_offline_';

  noline();

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  offline();

  var search = Todo.search('/some/url');

  expect( 2 );

  var p = search.$run();

  p.offline(function()
  {
    ok( true, 'offline!' );
  });

  p.failure(function()
  {
    ok( false, 'oops, failure' );
  });

  ok( p.isOffline() );

  noline();
});

test( '$change', function(assert)
{
  var prefix = 'RekordSearch_change_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  var rest = Todo.Database.rest;

  rest.returnValue = [
      {id: 1, name: 't0', done: 1},
      {id: 2, name: 't1', done: 0}
  ];

  var search = Todo.search('/some/url');

  expect( 2 );

  search.$change(function()
  {
    ok( true, 'change triggered' );
    strictEqual( this.length, 2 );
  });

  search.$run();
});
