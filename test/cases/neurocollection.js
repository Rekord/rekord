module( 'NeuroCollection' );

function createNeuroCollection()
{
  var c = new Neuro.Collection();

  c.addAll([
    {id: 1, name: 'Phil',   age: 26, sex: 'M', superhero: true},
    {id: 2, name: 'Nicole', age: 26, sex: 'F'},
    {id: 3, name: 'Adam',   age: 28, sex: 'M'},
    {id: 4, name: 'Ashley', age: 30, sex: 'F'},
    {id: 5, name: 'Robert', age: 28, sex: 'M', superhero: true},
    {id: 6, name: 'Andrea', age: 29, sex: 'F'},
    {id: 7, name: 'Sam',    age: 31, sex: 'F'}
  ]);

  return c;
}

function resolveFirstLetter(x)
{
  return isString( x ) ? x.charAt(0).toLowerCase() : x;
}

function aggregateConcat(properties)
{
  var resolver = createPropertyResolver( properties );

  return function(models)
  {
    var concat = '';

    for (var i = 0; i < models.length; i++)
    {
      concat += resolver( models[ i ] );
    }

    return concat;
  };
}

test( 'setComparator', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c[0].name, 'Phil' );
  strictEqual( c[1].name, 'Nicole' );

  c.setComparator( 'name' );

  strictEqual( c[0].name, 'Adam' );
  strictEqual( c[1].name, 'Andrea' );
  strictEqual( c[2].name, 'Ashley' );

  c.setComparator( ['age', 'name'] );

  strictEqual( c[0].name, 'Nicole' );
  strictEqual( c[1].name, 'Phil' );
  strictEqual( c[2].name, 'Adam' );
});

test( 'add', function(assert)
{
  var c = createNeuroCollection();
  c.setComparator( 'name' );

  strictEqual( c[0].name, 'Adam' );

  c.add({id: 8, name: 'Aardvark'});

  strictEqual( c[0].name, 'Aardvark' );
});

test( 'removeAt', function(assert)
{
  var c = createNeuroCollection();
  c.setComparator( 'name' );

  strictEqual( c[0].name, 'Adam' );
  strictEqual( c[1].name, 'Andrea' );
  strictEqual( c[2].name, 'Ashley' );

  c.removeAt( 1 );

  strictEqual( c[0].name, 'Adam' );
  strictEqual( c[1].name, 'Ashley' );
});

test( 'minModel', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.minModel('name'), c[2] ); // Adam
  strictEqual( c.minModel('age'), c[0] ); // Phil
  strictEqual( c.minModel('id'), c[0] ); // Phil
});

test( 'maxModel', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.maxModel('name'), c[6] ); // Sam
  strictEqual( c.maxModel('age'), c[6] ); // Sam
  strictEqual( c.maxModel('id'), c[6] ); // Sam
});

test( 'min', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.min('name'), 'Adam' ); // Adam
  strictEqual( c.min('age'), 26 ); // Phil
  strictEqual( c.min('id'), 1 ); // Phil
});

test( 'max', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.max('name'), 'Sam' ); // Sam
  strictEqual( c.max('age'), 31 ); // Sam
  strictEqual( c.max('id'), 7 ); // Sam
});

test( 'firstWhere', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.firstWhere('age', 28), c[2] ); // Adam
});

test( 'sum', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.sum('age'), 198 );
});

test( 'avg', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.avg('age'), 28.285714285714285 );
});

test( 'count', function(assert)
{
  var c = createNeuroCollection();

  strictEqual( c.count(), 7 );
  strictEqual( c.count('superhero'), 2 );
});

test( 'countWhere', function(assert)
{
  var c = createNeuroCollection();

  var between27and30 = function(model)
  {
    return model.age >= 27 && model.age <= 30;
  };

  strictEqual( c.countWhere('sex', 'M'), 3 );
  strictEqual( c.countWhere( between27and30 ), 4 );
});

test( 'pluck', function(assert)
{
  var c = createNeuroCollection();

  deepEqual( c.pluck('name'), ['Phil', 'Nicole', 'Adam', 'Ashley', 'Robert', 'Andrea', 'Sam']);

  deepEqual( c.pluck('name', 'id'), {
    1: 'Phil',
    2: 'Nicole',
    3: 'Adam',
    4: 'Ashley',
    5: 'Robert',
    6: 'Andrea',
    7: 'Sam'
  });
});

test( 'chunk', function(assert)
{
  var c = createNeuroCollection();

  deepEqual( c.chunk( 3 ), [
    [ c[0], c[1], c[2] ],
    [ c[3], c[4], c[5] ],
    [ c[6] ]
  ]);

});

test( 'where', function(assert)
{
  var c = createNeuroCollection();

  deepEqual( c.where('age', 28), [
    c[2], c[4]
  ]);
});

test( 'contains', function(assert)
{
  var c = createNeuroCollection();

  ok( c.contains('age') );
  ok( c.contains('age', 28) );
  notOk( c.contains('age', 34) );

});

test( 'group', function(assert)
{
  var c = createNeuroCollection();

  var grouped = c.group({
    by: 'sex', 
    select: {age: 'avg', name: 'max'}, 
    comparator: 'sex',
    count: false, 
    track: false
  });

  strictEqual( grouped.length, 2 );
  deepEqual( grouped[0], {sex: 'F', age: 29, name: 'Sam'} );
  deepEqual( grouped[1], {sex: 'M', age: 27.333333333333332, name: 'Robert'} );
  
});