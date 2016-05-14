module( 'Rekord functions' );

test( 'Rekord.get', function(assert)
{
  expect( 1 );

  Rekord.get( 'rekord_get' ).complete(function(rekord)
  {
    ok( true, 'rekord returned' );
  });

  Rekord({
    name: 'rekord_get',
    fields: ['id', 'name']
  });
});

test( 'Rekord.indexOf', function(assert)
{
  var arr1 = [1, 2];
  var arr2 = [1, 2, 1];
  var arr3 = [];
  var arr4 = [1, 2, '3', 3];

  var equalCompare = function(a, b) {
    return Rekord.compare( a, b ) === 0;
  };

  strictEqual( Rekord.indexOf(arr1, 1), 0 );
  strictEqual( Rekord.indexOf(arr1, 2), 1 );
  strictEqual( Rekord.indexOf(arr1, 3), false );

  strictEqual( Rekord.indexOf(arr2, 1), 0 );

  strictEqual( Rekord.indexOf(arr3, 1), false );

  strictEqual( Rekord.indexOf(arr4, 3), 3 );
  strictEqual( Rekord.indexOf(arr4, 3, equalCompare), 2, 'okay - custom compare' );
});

test( 'Rekord.uuid', function(assert)
{
  ok( typeof Rekord.uuid() === 'string' );
  strictEqual( Rekord.uuid().length, 36 ); // 32 characters + 4 hyphens
});

test( 'Rekord.propsMatch', function(assert)
{
  var m0 = {x: 4, y: 6};
  var m1 = {x: 5, y: 6};
  var m2 = {x: 4, y: 6};
  var m3 = {x: 3, y: 7};
  var m4 = {z: 5, w: 6};

  ok( Rekord.propsMatch( m0, 'x', m2, 'x' ) );
  ok( Rekord.propsMatch( m0, ['y'], m1, ['y'] ) );
  ok( Rekord.propsMatch( m0, ['y', 'x'], m2, ['y', 'x'] ) );
  ok( Rekord.propsMatch( m1, ['x', 'y'], m4, ['z', 'w'] ) );

  notOk( Rekord.propsMatch( m0, 'x', m1, 'x' ) );
  notOk( Rekord.propsMatch( m0, 'x', m1, 'y' ) );
});

test( 'Rekord.extend', function(assert)
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
  Rekord.extend( Parent, Child, {
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

test( 'Rekord.transfer', function(assert)
{
  var a = {$secret: 6, pub: 7};
  var b = {};

  notOk( '$secret' in b );
  notOk( 'pub' in b );

  Rekord.transfer( a, b );

  ok( '$secret' in b );
  ok( 'pub' in b );
  strictEqual( b.$secret, 6 );
  strictEqual( b.pub, 7 );
});

test( 'Rekord.swap', function(assert)
{
  var a = [0, 1, 2, 3, 4];

  Rekord.swap( a, 0, 1 );

  strictEqual( a[0], 1, 'okay - forward beside' );
  strictEqual( a[1], 0 );

  Rekord.swap( a, 1, 0 );

  strictEqual( a[0], 0, 'okay - backward beside' );
  strictEqual( a[1], 1 );

  Rekord.swap( a, 4, 0 );

  strictEqual( a[0], 4, 'okay - backward spread' );
  strictEqual( a[4], 0 );
});

test( 'Rekord.grab', function(assert)
{
  var obj1 = {a: 2, b: new Date(), c: {y:6}, d:true};
  var props1 = ['a', 'b', 'c'];
  var props2 = ['b', 'e'];

  var grab1 = Rekord.grab( obj1, props1 );
  notOk( 'd' in grab1, 'okay - without copy' );
  strictEqual( grab1.a, obj1.a );
  strictEqual( grab1.b, obj1.b );
  strictEqual( grab1.c, obj1.c );

  var grab2 = Rekord.grab( obj1, props1, true );
  notOk( 'd' in grab2, 'okay - with copy' );
  strictEqual( grab2.a, obj1.a );
  notStrictEqual( grab2.b, obj1.b );
  notStrictEqual( grab2.c, obj1.c );
  ok( grab2.b.getTime() === obj1.b.getTime() );
  ok( grab2.c.y === obj1.c.y );

  var grab3 = Rekord.grab( obj1, props2 );
  notOk( 'e' in grab3, 'okay - undefined property' );
  strictEqual( grab3.b, obj1.b );
});

test( 'Rekord.pull', function(assert)
{
  var obj1 = {a: 2, b: new Date(), c: {y:6}, d:true};
  var props1 = ['a', 'c', 'b'];
  var props2 = ['b', 'e'];
  var props3 = 'a';

  var pull1 = Rekord.pull( obj1, props1 );
  strictEqual( pull1.length, 3, 'okay - without copy' );
  strictEqual( pull1[0], obj1.a );
  strictEqual( pull1[1], obj1.c );
  strictEqual( pull1[2], obj1.b );

  var pull2 = Rekord.pull( obj1, props1, true );
  strictEqual( pull2.length, 3, 'okay - with copy' );
  strictEqual( pull2[0], obj1.a );
  notStrictEqual( pull2[1], obj1.c );
  notStrictEqual( pull2[2], obj1.b );
  ok( pull2[2].getTime() === obj1.b.getTime() );
  ok( pull2[1].y === obj1.c.y );

  var pull3 = Rekord.pull( obj1, props2 );
  strictEqual( pull3.length, 2, 'okay - undefined property' );
  strictEqual( pull3[0], obj1.b );
  strictEqual( pull3[1], void 0 );

  var pull4 = Rekord.pull( obj1, props3 );
  strictEqual( pull4, 2, 'okay - string only' );
});

test( 'Rekord.copy', function(assert)
{
  var s1 = void 0;
  var s2 = [1,2,3];
  var s3 = currentTime();
  var s4 = null;
  var s5 = new Date();
  var s6 = /^.*\.php$/i;
  var s7 = {x: 23, y: 42, z:[2]};

  var c1 = Rekord.copy( s1 );
  var c2 = Rekord.copy( s2 );
  var c3 = Rekord.copy( s3 );
  var c4 = Rekord.copy( s4 );
  var c5 = Rekord.copy( s5 );
  var c6 = Rekord.copy( s6 );
  var c7 = Rekord.copy( s7 );

  deepEqual( s1, c1 );
  deepEqual( s2, c2 ); notStrictEqual( s2, c2 );
  deepEqual( s3, c3 );
  deepEqual( s4, c4 );
  deepEqual( s5, c5 ); notStrictEqual( s5, c5 );
  deepEqual( s6, c6 );
  deepEqual( s7, c7 ); notStrictEqual( s7, c7 );

  var s8 = {x: 5, $y: 4};
  var e8 = {x: 5};
  var c8 = Rekord.copy( s8 );

  deepEqual( c8, e8 );

  var s9 = {x: 5, $y: 4};
  var c9 = Rekord.copy( s9, true );

  deepEqual( c9, s9 );
});

test( 'Rekord.diff', function(assert)
{
  var curr = {a: 'what', b: 4, c: true, d: [5,6], e: null};
  var prev = {a: 'what', b: 6, c: false, d: [7,8]};
  var prop = ['a', 'c', 'd', 'e'];

  var diff = Rekord.diff( curr, prev, prop, Rekord.equals );

  notOk( 'a' in diff, 'okay - property presence' );
  notOk( 'b' in diff );
  ok( 'c' in diff );
  ok( 'd' in diff );
  ok( 'e' in diff );

  deepEqual( diff.c, curr.c, 'okay - property equals' );
  deepEqual( diff.d, curr.d );
  deepEqual( diff.e, curr.e );
});

test( 'Rekord.sizeof', function(assert)
{
  strictEqual( Rekord.sizeof( 0 ), 0, 'okay - no size' );
  strictEqual( Rekord.sizeof( false ), 0 );
  strictEqual( Rekord.sizeof( true ), 0 );
  strictEqual( Rekord.sizeof( {} ), 0 );
  strictEqual( Rekord.sizeof( [] ), 0 );
  strictEqual( Rekord.sizeof( '' ), 0 );
  strictEqual( Rekord.sizeof( 123 ), 123 );
  strictEqual( Rekord.sizeof( null ), 0 );
  strictEqual( Rekord.sizeof( void 0 ), 0 );

  strictEqual( Rekord.sizeof( 'hello' ), 5, 'okay - sized' );
  strictEqual( Rekord.sizeof( [3] ), 1 );
  strictEqual( Rekord.sizeof( [4,5] ), 2 );
  strictEqual( Rekord.sizeof( {x:4,y:5} ), 2 );
});

test( 'Rekord.isEmpty', function(assert)
{
  ok( Rekord.isEmpty( null ), 'okay - empty values' );
  ok( Rekord.isEmpty( void 0 ) );
  ok( Rekord.isEmpty( 0 ) );
  ok( Rekord.isEmpty( [] ) );
  ok( Rekord.isEmpty( '' ) );
  ok( Rekord.isEmpty( new Date(0) ) );
  ok( Rekord.isEmpty( {} ) );

  notOk( Rekord.isEmpty( 3 ), 'okay - non empty values' );
  notOk( Rekord.isEmpty( false ) );
  notOk( Rekord.isEmpty( true ) );
  notOk( Rekord.isEmpty( [0] ) );
  notOk( Rekord.isEmpty( 'empty' ) );
  notOk( Rekord.isEmpty( new Date() ) );
  notOk( Rekord.isEmpty( {x:4} ) );
});

test( 'Rekord.compare', function(assert)
{
  var d2 = currentTime()();
  var d0 = new Date( d2 );
  var d1 = new Date( d2 );


  strictEqual( Rekord.compare( 1, 1 ), 0, 'okay - equivalent values' );
  strictEqual( Rekord.compare( 1, '1' ), 0 );
  strictEqual( Rekord.compare( [], [] ), 0 );
  strictEqual( Rekord.compare( 1, 1 ), 0 );
  strictEqual( Rekord.compare( null, void 0 ), 0 );
  strictEqual( Rekord.compare( null, null ), 0 );
  strictEqual( Rekord.compare( void 0, void 0 ), 0 );
  strictEqual( Rekord.compare( '3,4,5', [3,4,5] ), 0 );
  strictEqual( Rekord.compare( d0, d1 ), 0 );
  strictEqual( Rekord.compare( d0, d2 ), 0 );

  strictEqual( Rekord.compare( 1, 2 ), -1, 'okay - numbers' );
  strictEqual( Rekord.compare( 2, 1 ), +1 );

  strictEqual( Rekord.compare( 1, null ), -1, 'okay - against nulls' );
  strictEqual( Rekord.compare( 1, null, true ), +1 );
  strictEqual( Rekord.compare( null, 1 ), +1 );
  strictEqual( Rekord.compare( null, 1, true ), -1 );
});

test( 'Rekord.equals', function(assert)
{
  ok( Rekord.equals( 1, 1 ), 'okay - same equals' );
  ok( Rekord.equals( null, null ) );
  ok( Rekord.equals( NaN, NaN ) );

  var d1 = new Date(), d2 = new Date( d1.getTime() );

  ok( Rekord.equals( d1, d2 ), 'okay - equals' );
  ok( Rekord.equals( {x:4}, {x:4} ) );
  ok( Rekord.equals( {x:4}, {x:4, $y:5} ) );
  ok( Rekord.equals( {x:4, $y: 6}, {x:4, $y:5} ) );
  ok( Rekord.equals( {x:4, $y: 6}, {x:4} ) );
  ok( Rekord.equals( [0,1], [0,1] ) );

  notOk( Rekord.equals( 1, '1' ), 'okay - not equals' );
  notOk( Rekord.equals( 1, null ) );
  notOk( Rekord.equals( 1, [] ) );
  notOk( Rekord.equals( 1, true ) );
  notOk( Rekord.equals( true, false ) );
  notOk( Rekord.equals( {x:5}, {x:5, y:6} ) );
  notOk( Rekord.equals( {x:5, y:6}, {x:5} ) );
  notOk( Rekord.equals( [0], [0, 1] ) );
  notOk( Rekord.equals( [0, 1], [0] ) );
  notOk( Rekord.equals( [0, 1], [0, '1'] ) );
});

test( 'Rekord.equalsStrict', function(assert)
{
  var obj = {};
  var arr = [];
  var dat = new Date();

  ok( Rekord.equalsStrict( 1, 1 ), 'okay - equals' );
  ok( Rekord.equalsStrict( true, true ) );
  ok( Rekord.equalsStrict( false, false ) );
  ok( Rekord.equalsStrict( null, null ) );
  ok( Rekord.equalsStrict( void 0, undefined ) );
  ok( Rekord.equalsStrict( obj, obj ) );
  ok( Rekord.equalsStrict( arr, arr ) );
  ok( Rekord.equalsStrict( dat, dat ) );
  ok( Rekord.equalsStrict( 'x', 'x' ) );

  notOk( Rekord.equalsStrict( 1, '1' ), 'okay - not equals' );
  notOk( Rekord.equalsStrict( 0, false ) );
  notOk( Rekord.equalsStrict( 1, true ) );
  notOk( Rekord.equalsStrict( 0, false ) );
  notOk( Rekord.equalsStrict( 0, null ) );
  notOk( Rekord.equalsStrict( null, void 0 ) );
  notOk( Rekord.equalsStrict( {}, {} ) );
  notOk( Rekord.equalsStrict( [], [] ) );
  notOk( Rekord.equalsStrict( new Date(), new Date() ) );
  notOk( Rekord.equalsStrict( 'x', 'xy' ) );
});

test( 'Rekord.createComparator', function(assert)
{
  var c0 = Rekord.createComparator( Rekord.compare );
  var c1 = Rekord.createComparator( 'name' );
  var c2 = Rekord.createComparator( '-name' );
  var c3 = Rekord.createComparator( 'name', true );
  var c4 = Rekord.createComparator( ['age', 'name'] );
  var c5 = Rekord.createComparator( 'friend.sex' );
  var c6 = Rekord.createComparator( '{age}-{friend.sex}' );

  var m0 = {name: 'Adam', age: 22, friend:{sex:1}};
  var m1 = {name: 'Barnabas', age: 22, friend:{sex:3}};
  var m2 = {name: 'Connor', age: 19, friend:{sex:4}};
  var m3 = {name: 'Dylan', age: 20, friend:{sex:2}};

  var arr0 = [4, 3, 1, 2, 5, 0];
  var arr1 = [m3, m2, m0, m1, null];
  var arr2 = [m0, m1, null, m2, m3, null];
  var arr3 = [null, m0, m1, m2, null];
  var arr4 = [m1, m3, m2, m0];
  var arr5 = [null, m0, m1, m2, m3];
  var arr6 = [m3, m1, m0, m2];

  var exp0 = [0, 1, 2, 3, 4, 5];
  var exp1 = [m0, m1, m2, m3, null];
  var exp2 = [m3, m2, m1, m0, null, null];
  var exp3 = [null, null, m0, m1, m2 ];
  var exp4 = [m2, m3, m0, m1];
  var exp5 = [m0, m3, m1, m2, null];
  var exp6 = [m2, m3, m0, m1];

  deepEqual( arr0.sort( c0 ), exp0 );
  deepEqual( arr1.sort( c1 ), exp1 );
  deepEqual( arr2.sort( c2 ), exp2 );
  deepEqual( arr3.sort( c3 ), exp3 );
  deepEqual( arr4.sort( c4 ), exp4 );
  deepEqual( arr5.sort( c5 ), exp5 );
  deepEqual( arr6.sort( c6 ), exp6 );
});

test( 'Rekord.saveComparator', function(assert)
{
  Rekord.saveComparator( 'compare0', 'name' );

  var c1 = Rekord.createComparator( 'compare0' );

  var m0 = {name: 'Adam', age: 22};
  var m1 = {name: 'Barnabas', age: 22};
  var m2 = {name: 'Connor', age: 19};
  var m3 = {name: 'Dylan', age: 20};

  var arr1 = [m3, m2, m0, m1, null];
  var exp1 = [m0, m1, m2, m3, null];

  deepEqual( arr1.sort( c1 ), exp1 );
});

test( 'Rekord.addComparator', function(assert)
{
  var c0 = Rekord.collect([
    {id: 1, name: 'a'},
    {id: 2, name: 'c'},
    {id: 3, name: 'a'},
    {id: 4, name: 'b'},
    {id: 6, name: 'c'},
    {id: 5, name: 'd'}
  ]);

  c0.setComparator( 'id' );

  strictEqual( c0[0].id, 1 );
  strictEqual( c0[1].id, 2 );
  strictEqual( c0[2].id, 3 );
  strictEqual( c0[3].id, 4 );
  strictEqual( c0[4].id, 5 );
  strictEqual( c0[5].id, 6 );

  c0.addComparator( 'name' );

  strictEqual( c0[0].id, 1 );
  strictEqual( c0[1].id, 3 );
  strictEqual( c0[2].id, 4 );
  strictEqual( c0[3].id, 2 );
  strictEqual( c0[4].id, 6 );
  strictEqual( c0[5].id, 5 );
});

test( 'Rekord.saveWhere', function(assert)
{
  Rekord.saveWhere( 'where0', 'age', 22 );
  Rekord.saveWhere( 'where1', {name: 'Connor'} );
  Rekord.saveWhere( 'where2', 'age', '22', Rekord.equalsCompare );

  var m0 = {name: 'Adam', age: 22};
  var m1 = {name: 'Barnabas', age: 22};
  var m2 = {name: 'Connor', age: 19};
  var m3 = {name: 'Dylan', age: 20};

  ok(    Rekord.createWhere( 'where0' )( m0 ) );
  ok(    Rekord.createWhere( 'where0' )( m1 ) );
  notOk( Rekord.createWhere( 'where0' )( m2 ) );
  notOk( Rekord.createWhere( 'where0' )( m3 ) );

  notOk( Rekord.createWhere( 'where1' )( m0 ) );
  notOk( Rekord.createWhere( 'where1' )( m1 ) );
  ok(    Rekord.createWhere( 'where1' )( m2 ) );
  notOk( Rekord.createWhere( 'where1' )( m3 ) );

  ok(    Rekord.createWhere( 'where2' )( m0 ) );
  ok(    Rekord.createWhere( 'where2' )( m1 ) );
  notOk( Rekord.createWhere( 'where2' )( m2 ) );
  notOk( Rekord.createWhere( 'where2' )( m3 ) );
});

test( 'Rekord.createWhere array', function(assert)
{
  var m0 = {name: 'Adam', age: 22};
  var m1 = {name: 'Barnabas', age: 22};
  var m2 = {name: 'Connor', age: 19};
  var m3 = {name: 'Dylan', age: 20};

  var c0 = Rekord.createWhere( [{age: 22}, ['name', 'Adam']] );

  ok(    c0( m0 ) );
  notOk( c0( m1 ) );
  notOk( c0( m2 ) );
  notOk( c0( m3 ) );
});

test( 'Rekord.savePropertyResolver', function(assert)
{
  Rekord.savePropertyResolver( 'prop0', 'name' );
  Rekord.savePropertyResolver( 'prop1', ['name', 'age'] );
  Rekord.savePropertyResolver( 'prop2' );

  var p0 = Rekord.createPropertyResolver( 'prop0' );
  var p1 = Rekord.createPropertyResolver( 'prop1' );
  var p2 = Rekord.createPropertyResolver( 'prop2' );

  var m0 = {name: 'Adam', age: 22};
  var m1 = {name: 'Barnabas', age: 22};
  var m2 = {name: 'Connor', age: 19};
  var m3 = {name: 'Dylan', age: 20};

  strictEqual( p0( m0 ), 'Adam' );
  strictEqual( p0( m1 ), 'Barnabas' );
  strictEqual( p0( m2 ), 'Connor' );
  strictEqual( p0( m3 ), 'Dylan' );

  strictEqual( p1( m0 ), 'Adam,22' );
  strictEqual( p1( m1 ), 'Barnabas,22' );
  strictEqual( p1( m2 ), 'Connor,19' );
  strictEqual( p1( m3 ), 'Dylan,20' );

  strictEqual( p2( m0 ), m0 );
  strictEqual( p2( m1 ), m1 );
  strictEqual( p2( m2 ), m2 );
  strictEqual( p2( m3 ), m3 );
});

test( 'Rekord.saveNumberResolver', function(assert)
{
  Rekord.saveNumberResolver( 'num0', 'age' );
  Rekord.saveNumberResolver( 'num1' );

  var n0 = Rekord.createNumberResolver( 'num0' );
  var n1 = Rekord.createNumberResolver( 'num1' );

  var m0 = {name: 'Adam', age: 22};
  var m1 = {name: 'Barnabas', age: 23};
  var m2 = 45;

  deepEqual( n0( m0 ), 22 );
  deepEqual( n0( m1 ), 23 );
  deepEqual( n0( m2 ), NaN );

  deepEqual( n1( m0 ), NaN );
  deepEqual( n1( m1 ), NaN );
  deepEqual( n1( m2 ), 45 );
});

test( 'Rekord.hasFields', function(assert)
{
  var hasFields = Rekord({
    name: 'hasFields',
    fields: ['id', 'name']
  });

  var exists = function(x) {
    return !!x;
  };
  var isString = function(x) {
    return typeof x === 'string';
  };

  var m0 = hasFields.create({name: 'name0'});

  ok( Rekord.hasFields( m0, 'name', exists ) );
  ok( Rekord.hasFields( m0, 'id', exists ) );
  ok( Rekord.hasFields( m0, ['id', 'name'], exists ) );
  ok( Rekord.hasFields( m0, [], exists ) );
  ok( Rekord.hasFields( m0, ['id', 'name'], isString ) );

  notOk( Rekord.hasFields( m0, 'noprop', exists ) );
  notOk( Rekord.hasFields( m0, ['id', 'noprop'], exists ) );
});
