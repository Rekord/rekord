module( 'Neuro functions' );

test( 'Neuro.get', function(assert)
{
  var done = assert.async();

  Neuro.get( 'neuro_get', function(neuro)
  {
    ok( true, 'neuro returned' );

    done();
  });

  Neuro({
    name: 'neuro_get',
    fields: ['id', 'name']
  });

});

test( 'Neuro.indexOf', function(assert)
{
  var arr1 = [1, 2];
  var arr2 = [1, 2, 1];
  var arr3 = [];
  var arr4 = [1, 2, '3', 3];

  var equalCompare = function(a, b) {
    return Neuro.compare( a, b ) === 0;
  };

  strictEqual( Neuro.indexOf(arr1, 1), 0 );
  strictEqual( Neuro.indexOf(arr1, 2), 1 );
  strictEqual( Neuro.indexOf(arr1, 3), false );

  strictEqual( Neuro.indexOf(arr2, 1), 0 );

  strictEqual( Neuro.indexOf(arr3, 1), false );

  strictEqual( Neuro.indexOf(arr4, 3), 3 );
  strictEqual( Neuro.indexOf(arr4, 3, equalCompare), 2, 'okay - custom compare' );
});

test( 'Neuro.uuid', function(assert)
{
  ok( typeof Neuro.uuid() === 'string' );
  strictEqual( Neuro.uuid().length, 36 ); // 32 characters + 4 hyphens
});

test( 'Neuro.propsMatch', function(assert)
{
  var m0 = {x: 4, y: 6};
  var m1 = {x: 5, y: 6};
  var m2 = {x: 4, y: 6};
  var m3 = {x: 3, y: 7};
  var m4 = {z: 5, w: 6};

  ok( Neuro.propsMatch( m0, 'x', m2, 'x' ) );
  ok( Neuro.propsMatch( m0, ['y'], m1, ['y'] ) );
  ok( Neuro.propsMatch( m0, ['y', 'x'], m2, ['y', 'x'] ) );
  ok( Neuro.propsMatch( m1, ['x', 'y'], m4, ['z', 'w'] ) );

  notOk( Neuro.propsMatch( m0, 'x', m1, 'x' ) );
  notOk( Neuro.propsMatch( m0, 'x', m1, 'y' ) );
});

test( 'Neuro.extend', function(assert)
{
  function Parent()
  {
  }
  Parent.prototype = {
    foo: function() {return 1;},
    bar: function() {return 2;}
  };

  function Child()
  {
  }
  Neuro.extend( Parent, Child, {
    bar: function() {return 3;}
  });

  var p = new Parent();
  strictEqual( p.foo(), 1 );
  strictEqual( p.bar(), 2 );
  isInstance( p, Parent );

  var c = new Child();
  strictEqual( c.foo(), 1 );
  strictEqual( c.bar(), 3 );
  isInstance( c, Parent );
});

test( 'Neuro.transfer', function(assert)
{
  var a = {$secret: 6, pub: 7};
  var b = {};

  notOk( '$secret' in b );
  notOk( 'pub' in b );

  Neuro.transfer( a, b );

  ok( '$secret' in b );
  ok( 'pub' in b );
  strictEqual( b.$secret, 6 );
  strictEqual( b.pub, 7 );
});

test( 'Neuro.swap', function(assert)
{
  var a = [0, 1, 2, 3, 4];

  Neuro.swap( a, 0, 1 );

  strictEqual( a[0], 1, 'okay - forward beside' );
  strictEqual( a[1], 0 );

  Neuro.swap( a, 1, 0 );

  strictEqual( a[0], 0, 'okay - backward beside' );
  strictEqual( a[1], 1 );

  Neuro.swap( a, 4, 0 );

  strictEqual( a[0], 4, 'okay - backward spread' );
  strictEqual( a[4], 0 );
});

test( 'Neuro.grab', function(assert)
{
  var obj1 = {a: 2, b: new Date(), c: {y:6}, d:true};
  var props1 = ['a', 'b', 'c'];
  var props2 = ['b', 'e'];

  var grab1 = Neuro.grab( obj1, props1 );
  notOk( 'd' in grab1, 'okay - without copy' );
  strictEqual( grab1.a, obj1.a );
  strictEqual( grab1.b, obj1.b );
  strictEqual( grab1.c, obj1.c );

  var grab2 = Neuro.grab( obj1, props1, true );
  notOk( 'd' in grab2, 'okay - with copy' );
  strictEqual( grab2.a, obj1.a );
  notStrictEqual( grab2.b, obj1.b );
  notStrictEqual( grab2.c, obj1.c );
  ok( grab2.b.getTime() === obj1.b.getTime() );
  ok( grab2.c.y === obj1.c.y );

  var grab3 = Neuro.grab( obj1, props2 );
  notOk( 'e' in grab3, 'okay - undefined property' );
  strictEqual( grab3.b, obj1.b );
});

test( 'Neuro.pull', function(assert)
{
  var obj1 = {a: 2, b: new Date(), c: {y:6}, d:true};
  var props1 = ['a', 'c', 'b'];
  var props2 = ['b', 'e'];
  var props3 = 'a';

  var pull1 = Neuro.pull( obj1, props1 );
  strictEqual( pull1.length, 3, 'okay - without copy' );
  strictEqual( pull1[0], obj1.a );
  strictEqual( pull1[1], obj1.c );
  strictEqual( pull1[2], obj1.b );

  var pull2 = Neuro.pull( obj1, props1, true );
  strictEqual( pull2.length, 3, 'okay - with copy' );
  strictEqual( pull2[0], obj1.a );
  notStrictEqual( pull2[1], obj1.c );
  notStrictEqual( pull2[2], obj1.b );
  ok( pull2[2].getTime() === obj1.b.getTime() );
  ok( pull2[1].y === obj1.c.y );

  var pull3 = Neuro.pull( obj1, props2 );
  strictEqual( pull3.length, 2, 'okay - undefined property' );
  strictEqual( pull3[0], obj1.b );
  strictEqual( pull3[1], void 0 );

  var pull4 = Neuro.pull( obj1, props3 );
  strictEqual( pull4, 2, 'okay - string only' );
});

test( 'Neuro.copy', function(assert)
{
  var s1 = void 0;
  var s2 = [1,2,3];
  var s3 = Date.now;
  var s4 = null;
  var s5 = new Date();
  var s6 = /^.*\.php$/i;
  var s7 = {x: 23, y: 42, z:[2]};

  var c1 = Neuro.copy( s1 );
  var c2 = Neuro.copy( s2 );
  var c3 = Neuro.copy( s3 );
  var c4 = Neuro.copy( s4 );
  var c5 = Neuro.copy( s5 );
  var c6 = Neuro.copy( s6 );
  var c7 = Neuro.copy( s7 );

  deepEqual( s1, c1 );
  deepEqual( s2, c2 ); notStrictEqual( s2, c2 );
  deepEqual( s3, c3 );
  deepEqual( s4, c4 );
  deepEqual( s5, c5 ); notStrictEqual( s5, c5 );
  deepEqual( s6, c6 );
  deepEqual( s7, c7 ); notStrictEqual( s7, c7 );

  var s8 = {x: 5, $y: 4};
  var e8 = {x: 5};
  var c8 = Neuro.copy( s8 );

  deepEqual( c8, e8 );

  var s9 = {x: 5, $y: 4};
  var c9 = Neuro.copy( s9, true );

  deepEqual( c9, s9 );
});

test( 'Neuro.diff', function(assert)
{
  var curr = {a: 'what', b: 4, c: true, d: [5,6], e: null};
  var prev = {a: 'what', b: 6, c: false, d: [7,8]};
  var prop = ['a', 'c', 'd', 'e'];

  var diff = Neuro.diff( curr, prev, prop, Neuro.equals );

  notOk( 'a' in diff, 'okay - property presence' );
  notOk( 'b' in diff );
  ok( 'c' in diff );
  ok( 'd' in diff );
  ok( 'e' in diff );

  deepEqual( diff.c, curr.c, 'okay - property equals' );
  deepEqual( diff.d, curr.d );
  deepEqual( diff.e, curr.e );
});

test( 'Neuro.sizeof', function(assert)
{
  strictEqual( Neuro.sizeof( 0 ), 0, 'okay - no size' );
  strictEqual( Neuro.sizeof( false ), 0 );
  strictEqual( Neuro.sizeof( true ), 0 );
  strictEqual( Neuro.sizeof( {} ), 0 );
  strictEqual( Neuro.sizeof( [] ), 0 );
  strictEqual( Neuro.sizeof( '' ), 0 );
  strictEqual( Neuro.sizeof( 123 ), 0 );
  strictEqual( Neuro.sizeof( null ), 0 );
  strictEqual( Neuro.sizeof( void 0 ), 0 );

  strictEqual( Neuro.sizeof( 'hello' ), 5, 'okay - sized' );
  strictEqual( Neuro.sizeof( [3] ), 1 );
  strictEqual( Neuro.sizeof( [4,5] ), 2 );
  strictEqual( Neuro.sizeof( {x:4,y:5} ), 2 );
});

test( 'Neuro.isEmpty', function(assert)
{
  ok( Neuro.isEmpty( null ), 'okay - empty values' );
  ok( Neuro.isEmpty( void 0 ) );
  ok( Neuro.isEmpty( 0 ) );
  ok( Neuro.isEmpty( [] ) );
  ok( Neuro.isEmpty( '' ) );
  ok( Neuro.isEmpty( new Date(0) ) );
  ok( Neuro.isEmpty( {} ) );

  notOk( Neuro.isEmpty( 3 ), 'okay - non empty values' );
  notOk( Neuro.isEmpty( false ) );
  notOk( Neuro.isEmpty( true ) );
  notOk( Neuro.isEmpty( [0] ) );
  notOk( Neuro.isEmpty( 'empty' ) );
  notOk( Neuro.isEmpty( new Date() ) );
  notOk( Neuro.isEmpty( {x:4} ) );
});

test( 'Neuro.compare', function(assert)
{
  var d0 = new Date();
  var d1 = new Date();
  var d2 = Date.now();

  strictEqual( Neuro.compare( 1, 1 ), 0, 'okay - equivalent values' );
  strictEqual( Neuro.compare( 1, '1' ), 0 );
  strictEqual( Neuro.compare( [], [] ), 0 );
  strictEqual( Neuro.compare( 1, 1 ), 0 );
  strictEqual( Neuro.compare( null, void 0 ), 0 );
  strictEqual( Neuro.compare( null, null ), 0 );
  strictEqual( Neuro.compare( void 0, void 0 ), 0 );
  strictEqual( Neuro.compare( '3,4,5', [3,4,5] ), 0 );
  strictEqual( Neuro.compare( d0, d1 ), 0 );
  strictEqual( Neuro.compare( d0, d2 ), 0 );

  strictEqual( Neuro.compare( 1, 2 ), -1, 'okay - numbers' );
  strictEqual( Neuro.compare( 2, 1 ), +1 );

  strictEqual( Neuro.compare( 1, null ), -1, 'okay - against nulls' );
  strictEqual( Neuro.compare( 1, null, true ), +1 );
  strictEqual( Neuro.compare( null, 1 ), +1 );
  strictEqual( Neuro.compare( null, 1, true ), -1 );
});

test( 'Neuro.equals', function(assert)
{
  ok( Neuro.equals( 1, 1 ), 'okay - same equals' );
  ok( Neuro.equals( null, null ) );
  ok( Neuro.equals( NaN, NaN ) );

  var d1 = new Date(), d2 = new Date( d1.getTime() );

  ok( Neuro.equals( d1, d2 ), 'okay - equals' );
  ok( Neuro.equals( {x:4}, {x:4} ) );
  ok( Neuro.equals( {x:4}, {x:4, $y:5} ) );
  ok( Neuro.equals( {x:4, $y: 6}, {x:4, $y:5} ) );
  ok( Neuro.equals( {x:4, $y: 6}, {x:4} ) );
  ok( Neuro.equals( [0,1], [0,1] ) );

  notOk( Neuro.equals( 1, '1' ), 'okay - not equals' );
  notOk( Neuro.equals( 1, null ) );
  notOk( Neuro.equals( 1, [] ) );
  notOk( Neuro.equals( 1, true ) );
  notOk( Neuro.equals( true, false ) );
  notOk( Neuro.equals( {x:5}, {x:5, y:6} ) );
  notOk( Neuro.equals( {x:5, y:6}, {x:5} ) );
  notOk( Neuro.equals( [0], [0, 1] ) );
  notOk( Neuro.equals( [0, 1], [0] ) );
  notOk( Neuro.equals( [0, 1], [0, '1'] ) );
});

test( 'Neuro.equalsStrict', function(assert)
{
  var obj = {};
  var arr = [];
  var dat = new Date();

  ok( Neuro.equalsStrict( 1, 1 ), 'okay - equals' );
  ok( Neuro.equalsStrict( true, true ) );
  ok( Neuro.equalsStrict( false, false ) );
  ok( Neuro.equalsStrict( null, null ) );
  ok( Neuro.equalsStrict( void 0, undefined ) );
  ok( Neuro.equalsStrict( obj, obj ) );
  ok( Neuro.equalsStrict( arr, arr ) );
  ok( Neuro.equalsStrict( dat, dat ) );
  ok( Neuro.equalsStrict( 'x', 'x' ) );

  notOk( Neuro.equalsStrict( 1, '1' ), 'okay - not equals' );
  notOk( Neuro.equalsStrict( 0, false ) );
  notOk( Neuro.equalsStrict( 1, true ) );
  notOk( Neuro.equalsStrict( 0, false ) );
  notOk( Neuro.equalsStrict( 0, null ) );
  notOk( Neuro.equalsStrict( null, void 0 ) );
  notOk( Neuro.equalsStrict( {}, {} ) );
  notOk( Neuro.equalsStrict( [], [] ) );
  notOk( Neuro.equalsStrict( new Date(), new Date() ) );
  notOk( Neuro.equalsStrict( 'x', 'xy' ) );
});

test( 'Neuro.createComparator', function(assert)
{
  var c0 = Neuro.createComparator( Neuro.compare );
  var c1 = Neuro.createComparator( 'name' );
  var c2 = Neuro.createComparator( '-name' );
  var c3 = Neuro.createComparator( 'name', true );
  var c4 = Neuro.createComparator( ['age', 'name'] );

  var m0 = {name: 'Adam', age: 22};
  var m1 = {name: 'Barnabas', age: 22};
  var m2 = {name: 'Connor', age: 19};
  var m3 = {name: 'Dylan', age: 20};

  var arr0 = [4, 3, 1, 2, 5, 0];
  var arr1 = [m3, m2, m0, m1, null];
  var arr2 = [m0, m1, null, m2, m3, null];
  var arr3 = [null, m0, m1, m2, null];
  var arr4 = [m1, m3, m2, m0];

  var exp0 = [0, 1, 2, 3, 4, 5];
  var exp1 = [m0, m1, m2, m3, null];
  var exp2 = [m3, m2, m1, m0, null, null];
  var exp3 = [null, null, m0, m1, m2 ];
  var exp4 = [m2, m3, m0, m1];

  deepEqual( arr0.sort( c0 ), exp0 );
  deepEqual( arr1.sort( c1 ), exp1 );
  deepEqual( arr2.sort( c2 ), exp2 );
  deepEqual( arr3.sort( c3 ), exp3 );
  deepEqual( arr4.sort( c4 ), exp4 );
});











