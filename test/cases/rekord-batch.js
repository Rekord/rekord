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

  expect( 7 );

  Rekord.batch( Task, 'get', function(operations)
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

  Rekord.batchClear();

  strictEqual( 0, Rekord.batchDepth() );
});

test( 'batch multiple operations', function(assert)
{
  var prefix = 'batch_multiple_operations_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var t0 = Task.create({id: 1, name: 't0', done: true});
  var t1 = new Task({id: 2, name: 't1', done: false});

  expect( 10 );

  Rekord.batch( Task, ['create', 'update'], function(operations)
  {
    strictEqual( operations.length, 2 );
    strictEqual( operations[0].model, t0 );
    strictEqual( operations[1].model, t1 );

    operations[0].success( {name: 't0a'}, 200 );
    operations[1].success( {name: 't1a'}, 200 );
  });

  var tasks = Task.collect([t0, t1]);

  ok( t0.$isSaved() );
  notOk( t1.$isSaved() );

  t0.name = 't0b';
  t1.name = 't1b';

  tasks.saveWhere();

  ok( t0.$isSaved() );
  ok( t1.$isSaved() );

  strictEqual( t0.name, 't0a' );
  strictEqual( t1.name, 't1a' );

  Rekord.batchClear();

  strictEqual( 0, Rekord.batchDepth() );
});

test( 'batch all models', function(assert)
{
  var prefix = 'batch_all_models_';

  var Email = Rekord({
    name: prefix + 'email',
    fields: ['address']
  });

  var Address = Rekord({
    name: prefix + 'address',
    fields: ['door', 'street', 'city', 'state']
  });

  var e0, a0;

  expect( 6 );

  Rekord.batch( true, 'create', function(operations)
  {
    strictEqual( operations.length, 2 );
    strictEqual( operations[0].model, e0 );
    strictEqual( operations[1].model, a0 );

    operations[0].success( {}, 200 );
    operations[1].success( {}, 200 );
  });

  Rekord.batchExecute(function()
  {
    e0 = Email.create({address: 'rekord@gmail.com'});
    a0 = Address.create({door: 1505, street: 'Manor', city: 'Harrisburg', state: 'AL'});
  });

  ok( e0.$isSaved() );
  ok( a0.$isSaved() );

  Rekord.batchClear();

  strictEqual( 0, Rekord.batchDepth() );
});
