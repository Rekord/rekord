module( 'Rekord Search Paged' );

test( '$next', function(assert)
{
  var prefix = 'RekordSearchPaged_next_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  rest.returnValue = {
    results: [
      {id: 1, name: 't0', done: 1},
      {id: 2, name: 't1', done: 0}
    ],
    total: 5
  };

  strictEqual( Task.all().length, 0 );

  var search = Task.searchPaged('/api/something', {
    page_index: 0,
    page_size: 2
  });
  search.name = 'names';
  search.$run();

  deepEqual( rest.lastRecord, {name: 'names', page_index: 0, page_size: 2, total: 0} );

  strictEqual( search.$results.length, 2 );
  strictEqual( Task.all().length, 2 );

  var t0 = Task.get(1);
  var t1 = Task.get(2);

  ok( t0 );
  ok( t1 );
  strictEqual( search.$results[0], t0 );
  strictEqual( search.$results[1], t1 );

  rest.returnValue.results = [
    {id: 3, name: 't2', done: 0},
    {id: 4, name: 't3', done: 1}
  ];

  search.$next();

  deepEqual( rest.lastRecord, {name: 'names', page_index: 1, page_size: 2, total: 5} );

  strictEqual( search.$results.length, 2 );
  strictEqual( Task.all().length, 4 );

  rest.returnValue.results = [
    {id: 5, name: 't4', done: 1}
  ];

  search.$next();

  deepEqual( rest.lastRecord, {name: 'names', page_index: 2, page_size: 2, total: 5} );

  strictEqual( search.$results.length, 1 );
  strictEqual( Task.all().length, 5 );
});

test( '$more', function(assert)
{
  var prefix = 'RekordSearchPaged_more_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var rest = Task.Database.rest;

  rest.returnValue = {
    results: [
      {id: 1, name: 't0', done: 1},
      {id: 2, name: 't1', done: 0}
    ],
    total: 5
  };

  strictEqual( Task.all().length, 0 );

  var search = Task.searchPaged('/api/something', {
    page_index: 0,
    page_size: 2
  });
  search.name = 'names';
  search.$run();

  deepEqual( rest.lastRecord, {name: 'names', page_index: 0, page_size: 2, total: 0} );

  strictEqual( search.$results.length, 2 );
  strictEqual( Task.all().length, 2 );

  var t0 = Task.get(1);
  var t1 = Task.get(2);

  ok( t0 );
  ok( t1 );
  strictEqual( search.$results[0], t0 );
  strictEqual( search.$results[1], t1 );

  rest.returnValue.results = [
    {id: 3, name: 't2', done: 0},
    {id: 4, name: 't3', done: 1}
  ];

  search.$more();

  deepEqual( rest.lastRecord, {name: 'names', page_index: 1, page_size: 2, total: 5} );

  strictEqual( search.$results.length, 4 );
  strictEqual( Task.all().length, 4 );

  rest.returnValue.results = [
    {id: 5, name: 't4', done: 1}
  ];

  search.$more();

  deepEqual( rest.lastRecord, {name: 'names', page_index: 2, page_size: 2, total: 5} );

  strictEqual( search.$results.length, 5 );
  strictEqual( Task.all().length, 5 );
});
