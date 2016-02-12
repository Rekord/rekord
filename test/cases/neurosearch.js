module( 'Neuro Search' );

test( '$run default', function(assert)
{
  var prefix = 'NeuroSearch_run_default_';

  var Task = Neuro({
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

  deepEqual( rest.lastModel, search );
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

test( '$run concurrent', function(assert)
{
  var timer = assert.timer();
  var prefix = 'NeuroSearch_run_concurrent_';

  var Task = Neuro({
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

  strictEqual( search.$status, Neuro.Search.Status.Pending );

  wait( 1, function()
  {
    strictEqual( search.$status, Neuro.Search.Status.Pending );

    rest.returnValue = [
      {id: 3, name: 't2', done: 1}
    ];

    search.$run();

    strictEqual( search.$status, Neuro.Search.Status.Pending );
  });

  wait( 3, function()
  {
    strictEqual( search.$status, Neuro.Search.Status.Pending );
  });

  wait( 4, function()
  {
    strictEqual( search.$status, Neuro.Search.Status.Success );
    strictEqual( search.$results.length, 1 );
    strictEqual( search.$results[0].name, 't2' );
  });

  timer.run();
});
