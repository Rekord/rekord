module( 'RekordCollection' );

function createRekordCollection()
{
  var c = new Rekord.Collection();

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
  var c = createRekordCollection();

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

test( 'isSorted', function(assert)
{
  var c = new Rekord.Collection([1, 5, 4, 2]);

  ok( c.isSorted() );  // no comparator, consider it sorted

  c.setComparator( Rekord.compare );

  ok( c.isSorted() );

  deepEqual( c.toArray(), [1, 2, 4, 5] );

  Array.prototype.push.call( c, 3 );

  notOk( c.isSorted() );

  c.sort();

  ok( c.isSorted() );
});

test( 'add', function(assert)
{
  var c = createRekordCollection();
  c.setComparator( 'name' );

  strictEqual( c[0].name, 'Adam' );

  c.add({id: 8, name: 'Aardvark'});

  strictEqual( c[0].name, 'Aardvark' );
});

test( 'removeAt', function(assert)
{
  var c = createRekordCollection();
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
  var c = createRekordCollection();

  strictEqual( c.minModel('name'), c[2] ); // Adam
  strictEqual( c.minModel('age'), c[0] ); // Phil
  strictEqual( c.minModel('id'), c[0] ); // Phil
});

test( 'maxModel', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.maxModel('name'), c[6] ); // Sam
  strictEqual( c.maxModel('age'), c[6] ); // Sam
  strictEqual( c.maxModel('id'), c[6] ); // Sam
});

test( 'min', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.min('name'), 'Adam' ); // Adam
  strictEqual( c.min('age'), 26 ); // Phil
  strictEqual( c.min('id'), 1 ); // Phil
});

test( 'max', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.max('name'), 'Sam' ); // Sam
  strictEqual( c.max('age'), 31 ); // Sam
  strictEqual( c.max('id'), 7 ); // Sam
});

test( 'firstWhere', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.firstWhere('age', 28), c[2] ); // Adam
});

test( 'first', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.first('superhero'), true ); // Phil
});

test( 'lastWhere', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.lastWhere('age', 28), c[4] ); // Robert
});

test( 'last', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.last('superhero'), true ); // Robert
});

test( 'sum', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.sum('age'), 198 );
});

test( 'avg', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.avg('age'), 28.285714285714285 );
});

test( 'count', function(assert)
{
  var c = createRekordCollection();

  strictEqual( c.count(), 7 );
  strictEqual( c.count('superhero'), 2 );
});

test( 'countWhere', function(assert)
{
  var c = createRekordCollection();

  var between27and30 = function(model)
  {
    return model.age >= 27 && model.age <= 30;
  };

  strictEqual( c.countWhere('sex', 'M'), 3 );
  strictEqual( c.countWhere( between27and30 ), 4 );
});

test( 'pluck', function(assert)
{
  var c = createRekordCollection();

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
  var c = createRekordCollection();

  deepEqual( c.chunk( 3 ), [
    [ c[0], c[1], c[2] ],
    [ c[3], c[4], c[5] ],
    [ c[6] ]
  ]);

});

test( 'filtered', function(assert)
{
  var c = createRekordCollection();

  deepEqual( c.filtered('age', 28).slice(), [
    c[2], c[4]
  ]);
});

test( 'contains', function(assert)
{
  var c = createRekordCollection();

  ok( c.contains('age') );
  ok( c.contains('age', 28) );
  notOk( c.contains('age', 34) );

});

test( 'group', function(assert)
{
  var c = createRekordCollection();

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

test( 'clear', function(assert)
{
  var c = new Rekord.Collection([1, 2, 3, 4]);

  strictEqual( c.length, 4 );
  strictEqual( c[0], 1 );

  c.clear();

  strictEqual( c.length, 0 );

  c.push( 45 );

  strictEqual( c.length, 1 );
  strictEqual( c[0], 45 );
});

test( 'subtract', function(assert)
{
  var c = new Rekord.Collection([1, 2, 3, 4, 5]);

  deepEqual( c.subtract([2, 4, 5, 6], []), [1, 3] );
});

test( 'intersect', function(assert)
{
  var c = new Rekord.Collection([1, 2, 3, 4, 5]);

  deepEqual( c.intersect([2, 5, 6], []), [2, 5] );
});

test( 'complement', function(assert)
{
  var c = new Rekord.Collection([1, 2, 3, 4, 5]);

  deepEqual( c.complement([2, 5, 6], []), [6] );
});

test( 'remove', function(assert)
{
  var c = new Rekord.Collection([1, 2, 3, 4, 5]);

  c.remove( 4 );

  deepEqual( c.toArray(), [1, 2, 3, 5] );

  c.remove( -1 );

  deepEqual( c.toArray(), [1, 2, 3, 5] );
});

test( 'removeAll', function(assert)
{
  var c = new Rekord.Collection([1, 2, 3, 4, 5]);

  c.removeAll( [4, 2, 1] );

  deepEqual( c.toArray(), [3, 5] );

  c.removeAll( [-1] );

  deepEqual( c.toArray(), [3, 5] );
});

test( 'indexOf', function(assert)
{
  var c = Rekord.collect(1, 3, 4, 5, 6, 3);

  strictEqual( c.indexOf( 0 ), -1 );
  strictEqual( c.indexOf( 1 ), 0 );
  strictEqual( c.indexOf( 2 ), -1 );
  strictEqual( c.indexOf( 3 ), 1 );
  strictEqual( c.indexOf( 4 ), 2 );
  strictEqual( c.indexOf( 5 ), 3 );
  strictEqual( c.indexOf( 6 ), 4 );
  strictEqual( c.indexOf( 7 ), -1 );

});

test( 'insertAt', function(assert)
{
  var c = Rekord.collect(1, 3, 4);

  c.insertAt( 1, 2 );

  deepEqual( c.toArray(), [1, 2, 3, 4] );
});

test( 'reduce', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4);

  var reducer = function(accum, value)
  {
    return accum * value;
  };

  strictEqual( c.reduce( reducer, 1 ), 24 );
});

test( 'filtered', function(assert)
{
  var EVEN = function(x) { return x % 2 === 0; };

  var c = Rekord.collect(1, 2, 3, 4, 5, 6, 7, 8);

  var f = c.filtered( EVEN );

  deepEqual( f.toArray(), [2, 4, 6, 8] );

  c.add( 9 );

  deepEqual( f.toArray(), [2, 4, 6, 8] );

  c.add( 10 );

  deepEqual( f.toArray(), [2, 4, 6, 8, 10] );

  c.add( 0 );

  deepEqual( f.toArray(), [2, 4, 6, 8, 10, 0] );

  f.setComparator( Rekord.compare );

  deepEqual( f.toArray(), [0, 2, 4, 6, 8, 10] );

  c.addAll( [14, 16, -2] );

  deepEqual( f.toArray(), [-2, 0, 2, 4, 6, 8, 10, 14, 16] );

  c.remove( 2 );

  deepEqual( f.toArray(), [-2, 0, 4, 6, 8, 10, 14, 16] );

  c.removeAll( [4, 8, 10, -2] );

  deepEqual( f.toArray(), [0, 6, 14, 16] );

  c.insertAt( 3, 4 );

  deepEqual( f.toArray(), [0, 4, 6, 14, 16] );

  c.removeWhere( EVEN );

  deepEqual( f.toArray(), [] );
});

test( 'page', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
  var p = c.page( 4 );

  deepEqual( p.toArray(), [1, 2, 3, 4] );

  p.next();

  deepEqual( p.toArray(), [5, 6, 7, 8] );

  p.next();

  deepEqual( p.toArray(), [9, 10, 11, 12] );

  p.next();

  deepEqual( p.toArray(), [13, 14, 15] );

  p.first();

  deepEqual( p.toArray(), [1, 2, 3, 4] );

  p.last();

  deepEqual( p.toArray(), [13, 14, 15] );

  c.removeAll( [11, 12, 13, 14, 15] );

  deepEqual( p.toArray(), [9, 10] );

  c.clear();

  strictEqual( p.length, 0 );
  deepEqual( p.toArray(), [] );

});

test( 'change', function(assert)
{
  var c = Rekord.collect();

  expect(2);

  var off = c.change(function()
  {
    strictEqual( this[0], 23 );
  });

  c.add( 23 );
  c.add( 45 );

  off();

  c.add( 56 );

});

test( 'page change', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4, 5);
  var p = c.page( 2 );

  expect(1);

  p.change(function()
  {
    notOk();

    return false;
  });

  p.next();

  p.next();

});
