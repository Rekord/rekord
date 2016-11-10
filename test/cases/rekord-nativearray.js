
module( 'Rekord native-array' );

test( 'Rekord.collect', function(assert)
{
  var c0 = Rekord.collect(1, 2, 3, 4);

  ok( Array.isArray( c0 ) );
  deepEqual( c0, [1, 2, 3, 4] );
});

test( 'ModelCollection', function(assert)
{
  var prefix = 'ModelCollection_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  ok( Array.isArray( Task.all() ) );
  deepEqual( Task.all(), [] );
});

test( 'RelationCollection', function(assert)
{
  var prefix = 'RelationCollection_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['list_id', 'name', 'done']
  });

  var List = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: prefix + 'task',
        foreign: 'list_id'
      }
    }
  });

  var l0 = List.boot({
    id: 1,
    name: 'l0',
    tasks: [
      {id: 2, name: 't2', done: false},
      {id: 3, name: 't3', done: false}
    ]
  });

  ok( Array.isArray( l0.tasks ) );
});
