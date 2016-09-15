module( 'RekordRelationCollection' );

test( 'events', function(assert)
{
  var prefix = 'RekordRelationCollection_events_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['list_id', 'name', 'done']
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id',
        comparator: 'name'
      }
    }
  });

  var t0 = new Task({name: 't0'});
  var t1 = new Task({name: 't1'});
  var t2 = new Task({name: 't2'});

  var l0 = new TaskList({name: 'l0', tasks: [t1, t2]});

  expect(6);

  deepEqual( l0.tasks.pluck('name'), ['t1', 't2'] );

  l0.tasks.on( Rekord.Collection.Events.Remove, function(tasks, removed, key) {
    strictEqual( removed, t1 );
  });

  l0.tasks.on( Rekord.Collection.Events.Add, function(tasks, added) {
    strictEqual( added, t0 );
  });

  l0.tasks.unrelate( t1 );

  deepEqual( l0.tasks.pluck('name'), ['t2'] );

  l0.tasks.relate( t0 );

  deepEqual( l0.tasks.pluck('name'), ['t0', 't2'] );

  l0.tasks.relate( t2 ); // should have no effect

  deepEqual( l0.tasks.pluck('name'), ['t0', 't2'] );
});
