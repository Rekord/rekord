module( 'RekordCollection' );

function createRekordCollection()
{
  return Rekord.collect([
    {id: 1, name: 'Phil',   age: 26, sex: 'M', superhero: true},
    {id: 2, name: 'Nicole', age: 26, sex: 'F'},
    {id: 3, name: 'Adam',   age: 28, sex: 'M'},
    {id: 4, name: 'Ashley', age: 30, sex: 'F'},
    {id: 5, name: 'Robert', age: 28, sex: 'M', superhero: true},
    {id: 6, name: 'Andrea', age: 29, sex: 'F'},
    {id: 7, name: 'Sam',    age: 31, sex: 'F'}
  ]);
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

test( 'addComparator', function(assert)
{
  var p0 = {age: 1, name: 'A'};
  var p1 = {age: 1, name: 'B'};
  var p2 = {age: 1, name: 'C'};
  var p3 = {age: 2, name: 'A'};
  var p4 = {age: 2, name: 'B'};
  var p5 = {age: 3, name: 'A'};

  var c = Rekord.collect([p4, p5, p3, p2, p0, p1]);

  c.setComparator( 'age' );

  strictEqual( c[0].age, 1 );
  strictEqual( c[1].age, 1 );
  strictEqual( c[2].age, 1 );
  strictEqual( c[3].age, 2 );
  strictEqual( c[4].age, 2 );
  strictEqual( c[5].age, 3 );

  c.addComparator( 'name' );

  strictEqual( c[0], p0 );
  strictEqual( c[1], p3 );
  strictEqual( c[2], p5 );
  strictEqual( c[3], p1 );
  strictEqual( c[4], p4 );
  strictEqual( c[5], p2 );
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

test( 'sort', function(assert)
{
  var c = Rekord.collect([1, 2, 5, 4, 3]);

  expect( 2 );

  c.on( Rekord.Collection.Events.Sort, function(arr)
  {
    ok( true, 'collection sorted' );
    strictEqual( c, arr );
  });

  c.sort();
});

test( 'sort by name', function(assert)
{
  var p0 = {age: 1, name: 'A'};
  var p1 = {age: 1, name: 'B'};
  var p2 = {age: 1, name: 'C'};
  var p3 = {age: 2, name: 'D'};

  var c = Rekord.collect([p0, p2, p3, p1]);

  strictEqual( c[0], p0 );
  strictEqual( c[1], p2 );
  strictEqual( c[2], p3 );
  strictEqual( c[3], p1 );

  c.sort( 'name' );

  strictEqual( c[0], p0 );
  strictEqual( c[1], p1 );
  strictEqual( c[2], p2 );
  strictEqual( c[3], p3 );
});

test( 'reset', function(assert)
{
  var c = Rekord.collect([1, 2, 3]);

  expect( 7 );

  c.on( Rekord.Collection.Events.Reset, function(arr)
  {
    ok( true, 'collection reset' );
    strictEqual( arr, c );
  });

  strictEqual( c.length, 3 );

  c.reset( 4 );

  strictEqual( c.length, 1 );

  c.reset( [4, 5] );

  strictEqual( c.length, 2 );
});

test( 'reset autoSort', function(assert)
{
  var c = Rekord.collect([1, 3, 2]);

  c.setComparator( Rekord.compareNumbers );

  expect( 7 );
  deepEqual( c.toArray(), [1, 2, 3] );

  c.on( Rekord.Collection.Events.Reset, function(arr)
  {
    strictEqual( arr, c, 'collection reset' );
  });

  strictEqual( c.length, 3 );

  c.reset( 4 );

  strictEqual( c.length, 1 );

  c.reset( [5, 4] );

  strictEqual( c.length, 2 );
  deepEqual( c.toArray(), [4, 5] );
});

test( 'where', function(assert)
{
  var c = createRekordCollection();
  var w = c.where('superhero', true);

  strictEqual( w.length, 2 );
  strictEqual( w[0].name, 'Phil' );
  strictEqual( w[1].name, 'Robert' );
});

test( 'where regex', function(assert)
{
  var c = createRekordCollection();
  var w = c.where('name', /[e]/, Rekord.equals);

  strictEqual( w.length, 4 );
  strictEqual( w[0].name, 'Nicole' );
  strictEqual( w[1].name, 'Ashley' );
  strictEqual( w[2].name, 'Robert' );
  strictEqual( w[3].name, 'Andrea' );
});

test( 'add', function(assert)
{
  var c = createRekordCollection();
  c.setComparator( 'name' );

  expect( 4 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v.id, 8, 'model matched' );
  });

  strictEqual( c[0].name, 'Adam' );

  c.add({id: 8, name: 'Aardvark'});

  strictEqual( c[0].name, 'Aardvark' );
});

test( 'push', function(assert)
{
  var c = Rekord.collect([1, 3, 4, 5]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( added, [6, 7] );
  });

  c.push( 6, 7 );

  strictEqual( c.length, 6 );
  deepEqual( c.toArray(), [1, 3, 4, 5, 6, 7] );
});

test( 'push autoSort', function(assert)
{
  var c = Rekord.collect([1, 5, 4, 3]);
  c.setComparator( Rekord.compareNumbers );

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( added, [7, 6] );
  });

  c.push( 7, 6 );

  strictEqual( c.length, 6 );
  deepEqual( c.toArray(), [1, 3, 4, 5, 6, 7] );
});

test( 'unshift', function(assert)
{
  var c = Rekord.collect([1, 3, 4, 5]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( added, [6, 7] );
  });

  c.unshift( 6, 7 );

  strictEqual( c.length, 6 );
  deepEqual( c.toArray(), [6, 7, 1, 3, 4, 5] );
});

test( 'unshift autoSort', function(assert)
{
  var c = Rekord.collect([1, 5, 4, 3]);
  c.setComparator( Rekord.compareNumbers );

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( added, [7, 6] );
  });

  c.unshift( 7, 6 );

  strictEqual( c.length, 6 );
  deepEqual( c.toArray(), [1, 3, 4, 5, 6, 7] );
});

test( 'addAll', function(assert)
{
  var c = Rekord.collect([1, 4, 2, 5]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( added, [2, 3, 5] );
  });

  c.addAll([2, 3, 5]);

  strictEqual( c.length, 7 );
  deepEqual( c.toArray(), [1, 4, 2, 5, 2, 3, 5] );
});

test( 'addAll autoSort', function(assert)
{
  var c = Rekord.collect([1, 4, 2, 5]);
  c.setComparator( Rekord.compareNumbers );

  expect( 4 );

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( added, [2, 3, 5] );
  });

  c.addAll([2, 3, 5]);

  strictEqual( c.length, 7 );
  deepEqual( c.toArray(), [1, 2, 2, 3, 4, 5, 5] );
});

test( 'insertAt', function(assert)
{
  var c = Rekord.collect(1, 3, 4);

  expect( 3 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v, 2 );
  });

  c.insertAt( 1, 2 );

  deepEqual( c.toArray(), [1, 2, 3, 4] );
});

test( 'insertAt autoSort', function(assert)
{
  var c = Rekord.collect(1, 4, 3);
  c.setComparator( Rekord.compareNumbers );

  expect( 3 );

  c.on( Rekord.Collection.Events.Add, function(arr, v)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v, 2 );
  });

  c.insertAt( 2, 2 );

  deepEqual( c.toArray(), [1, 2, 3, 4] );
});

test( 'pop', function(assert)
{
  var c = Rekord.collect([1, 8, 3, 6]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Remove, function(arr, v, i)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v, 6 );
    strictEqual( i, 3 );
  });

  var p = c.pop();

  strictEqual( p, 6 );
});

test( 'shift', function(assert)
{
  var c = Rekord.collect([1, 8, 3, 6]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Remove, function(arr, v, i)
  {
    strictEqual( arr, c, 'collection matched' );
    strictEqual( v, 1 );
    strictEqual( i, 0 );
  });

  var p = c.shift();

  strictEqual( p, 1 );
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

test( 'removeAll autoSort', function(assert)
{
  var c = new Rekord.Collection([1, 2, 5, 4, 3]);
  c.setComparator( Rekord.compareNumbers );

  c.removeAll( [4, 2, 1] );

  deepEqual( c.toArray(), [3, 5] );

  c.removeAll( [-1] );

  deepEqual( c.toArray(), [3, 5] );
});

test( 'removeWhere', function(assert)
{
  var EVEN = function(x) { return x % 2 === 0; };
  var c = Rekord.collect([1, 2, 3, 4, 5, 6]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Removes, function(arr, removed)
  {
    strictEqual( arr, c, 'collection matched' );
    deepEqual( removed.toArray(), [6, 4, 2] );
  });

  var r = c.removeWhere( EVEN );

  deepEqual( r.toArray(), [6, 4, 2] );
  deepEqual( c.toArray(), [1, 3, 5] );
});

test( 'splice delete and add', function(assert)
{
  var c = Rekord.collect([1, 2, 3, 4, 5, 6, 7, 8]);

  expect( 6 );

  c.on( Rekord.Collection.Events.Removes, function(arr, removed)
  {
    strictEqual( c, arr, 'collection matched' );
    deepEqual( removed, [3, 4], 'removed' );
  });

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( c, arr, 'collection matched' );
    deepEqual( added, [3.5, 4.5], 'added' );
  });

  var r = c.splice( 2, 2, 3.5, 4.5 );

  deepEqual( r, [3, 4] );
  deepEqual( c.toArray(), [1, 2, 3.5, 4.5, 5, 6, 7, 8] );
});

test( 'splice delete', function(assert)
{
  var c = Rekord.collect([1, 2, 3, 4, 5, 6, 7, 8]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Removes, function(arr, removed)
  {
    strictEqual( c, arr, 'collection matched' );
    deepEqual( removed, [3, 4], 'removed' );
  });

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( c, arr, 'collection matched' );
    deepEqual( added, [3.5, 4.5], 'added' );
  });

  var r = c.splice( 2, 2 );

  deepEqual( r, [3, 4] );
  deepEqual( c.toArray(), [1, 2, 5, 6, 7, 8] );
});

test( 'splice add', function(assert)
{
  var c = Rekord.collect([1, 2, 3, 4, 5, 6, 7, 8]);

  expect( 4 );

  c.on( Rekord.Collection.Events.Removes, function(arr, removed)
  {
    strictEqual( c, arr, 'collection matched' );
    deepEqual( removed, [3, 4], 'removed' );
  });

  c.on( Rekord.Collection.Events.Adds, function(arr, added)
  {
    strictEqual( c, arr, 'collection matched' );
    deepEqual( added, [3.5, 4.5], 'added' );
  });

  var r = c.splice( 2, 0, 3.5, 4.5 );

  deepEqual( r, [] );
  deepEqual( c.toArray(), [1, 2, 3.5, 4.5, 3, 4, 5, 6, 7, 8] );
});

test( 'reverse', function(assert)
{
  var c = Rekord.collect([1, 4, 6, 8]);

  expect( 2 );

  c.on( Rekord.Collection.Events.Updates, function(arr)
  {
    strictEqual( arr, c, 'collection matched' );
  });

  c.reverse();

  deepEqual( c.toArray(), [8, 6, 4, 1] );
});

test( 'reverse autoSort', function(assert)
{
  var c = Rekord.collect([1, 4, 6, 8]);
  c.setComparator( Rekord.compareNumbers );

  expect( 2 );

  c.on( Rekord.Collection.Events.Updates, function(arr)
  {
    strictEqual( arr, c, 'collection matched' );
  });

  c.reverse();

  deepEqual( c.toArray(), [8, 6, 4, 1], 'not sorted back yet' );
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

test( 'reduce', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4);

  var reducer = function(accum, value)
  {
    return accum * value;
  };

  strictEqual( c.reduce( reducer, 1 ), 24 );
});

test( 'random', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4);

  notStrictEqual( c.random(), void 0 );
});

test( 'filtered more', function(assert)
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

test( 'page more', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15);
  var p = c.page( 4 );

  deepEqual( p.toArray(), [1, 2, 3, 4] );

  p.more();

  deepEqual( p.toArray(), [1, 2, 3, 4, 5, 6, 7, 8] );

  p.more(2);

  deepEqual( p.toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] );

  p.more();

  deepEqual( p.toArray(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] );

  p.next();

  deepEqual( p.toArray(), [5, 6, 7, 8] );

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

test( 'each', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4, 5);

  expect( 5 );

  c.each(function(x, i)
  {
    strictEqual( x, i + 1 );
  })
});

test( 'eachWhere', function(assert)
{
  var c = Rekord.collect(1, 2, 3, 4, 5);

  expect( 4 );

  function isEven(x)
  {
    return x % 2 === 0;
  }

  function lookAtItem(x, i)
  {
    strictEqual( x, i + 1 );
    strictEqual( 0, x % 2 );
  }

  c.eachWhere( lookAtItem, isEven );
});

test( 'clone', function(assert)
{
  var c = Rekord.collect([1, 2, 3, 4]);

  var n = c.clone();

  notStrictEqual( c, n );
  deepEqual( n.toArray(), [1, 2, 3, 4] );
});
