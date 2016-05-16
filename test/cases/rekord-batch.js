module( 'Rekord Batch' );

test( 'batch specific model', function(assert)
{
  var prefix = 'batch_specific_model_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var all = Task.all();
  var t0 = Task.boot({id: 1, name: 't0', done: true});
  var t1 = Task.boot({id: 2, name: 't1', done: false});

  expect( 6 );

  Rekord.batch(Task, 'get', function(operations)
  {
    strictEqual( operations.length, 2 );
    strictEqual( operations[0].model, t0 );
    strictEqual( operations[1].model, t1 );

    operations[0].failure( null, 404 );
    operations[1].success( {}, 200 );
  });

  var tasks = Task.collect([t0, t1]);

  strictEqual( all.length, 2 );

  tasks.refreshWhere();

  strictEqual( all.length, 1 );
  ok( t0.$isDeleted() );
});
