
module( 'Rekord Context' );

test( 'simple', function(assert)
{
  var prefix = 'Context_simple_';

  var TaskName = prefix + 'task';
  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done']
  });

  var db = Task.Database;

  deepEqual( db.all, {} );
  deepEqual( db.models.slice(), [] );

  var c0 = Rekord.Context.start([TaskName]);

  var t0 = new Task({id: 1, name: 't1'});
  var t1 = Task.create({id: 2, name: 't2'});

  strictEqual( c0.getApplied(), 1 );
  deepEqual( db.all, {1: t0, 2: t1} );
  deepEqual( db.models.slice(), [t1] );

  var c1 = Rekord.Context.start([TaskName]);

  var t2 = new Task({id: 3, name: 't3'});
  var t3 = Task.create({id: 4, name: 't4'});

  deepEqual( db.all, {3: t2, 4: t3} );
  deepEqual( db.models.slice(), [t3] );
  strictEqual( c1.getApplied(), 1 );
  strictEqual( c0.getApplied(), 0 );

  c0.apply();

  strictEqual( c0.getApplied(), 1 );
  deepEqual( db.all, {1: t0, 2: t1} );
  deepEqual( db.models.slice(), [t1] );

  c0.discard();

  deepEqual( db.all, {} );
  deepEqual( db.models.slice(), [] );
});
