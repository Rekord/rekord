module( 'Neuro options' );

test( 'default key', function(assert)
{
  var default_key = Neuro({
    name: 'default_key',
    fields: ['id', 'name']
  });

  strictEqual( default_key.Database.key, 'id' );

  var dk0 = default_key.create({
    name: 'name0'
  });

  ok( !!dk0.id );
});

test( 'custom key', function(assert)
{
  var custom_key = Neuro({
    key: 'key',
    name: 'custom_key',
    fields: ['key', 'name']
  });

  strictEqual( custom_key.Database.key, 'key' );

  var ck0 = custom_key.create({
    name: 'name0'
  });

  ok( !!ck0.key );

  var ck1 = custom_key.create({
    key: 'key1',
    name: 'name1'
  });

  strictEqual( ck1.key, 'key1' );
  hasModel( custom_key, 'key1', ck1 );
});

test( 'key array', function(assert)
{
  var key_array = Neuro({
    key: ['user_id', 'group_id'],
    name: 'key_array',
    fields: ['user_id', 'group_id', 'created_at']
  });

  deepEqual( key_array.Database.key, ['user_id', 'group_id'] );

  var ka0 = key_array.create({
    user_id: 2,
    group_id: 3,
    created_at: Date.now()
  });

  strictEqual( ka0.$key(), '2/3' );
  deepEqual( ka0.$keys(), [2,3] );
  hasModel( key_array, '2/3', ka0 );
});

test( 'key separator', function(assert)
{
  var key_separator = Neuro({
    key: ['user_id', 'group_id'],
    keySeparator: '/group/',
    name: 'key_separator',
    fields: ['user_id', 'group_id', 'created_at']
  });

  strictEqual( key_separator.Database.keySeparator, '/group/' );

  var ks0 = key_separator.create({
    user_id: 2,
    group_id: 3,
    created_at: Date.now()
  });

  strictEqual( ks0.$key(), '2/group/3' );
});

test( 'fields', function(assert)
{
  var fields = Neuro({
    name: 'fields',
    fields: ['id', 'name']
  });

  var f = fields.create({
    name: 'name0',
    notspecified: true
  });

  strictEqual( f.name, 'name0' );
  strictEqual( f.notspecified, true );

  var fjs = f.$toJSON();

  strictEqual( fjs.name, 'name0' );
  strictEqual( fjs.notspecified, void 0 );
});

test( 'defaults', function(assert)
{
  var defaults_related = Neuro({
    name: 'defaults_related',
    fields: ['id', 'created_at'],
    defaults: {
      id: Neuro.uuid,
      created_at: Date.now
    }
  });

  var defaults = Neuro({
    name: 'defaults',
    fields: ['id', 'done', 'nullable', 'array', 'related'],
    defaults: {
      done: false,
      nullable: null,
      array: [],
      related: defaults_related
    }
  });

  var d0 = new defaults();
  strictEqual( d0.done, false );
  strictEqual( d0.nullable, null );
  deepEqual( d0.array, [] );
  isInstance( d0.related, defaults_related );
  isType( d0.related.id, 'string' );
  isType( d0.related.created_at, 'number' );

  var d1 = new defaults();
  notStrictEqual( d1.related, d0.related );
  notStrictEqual( d1.array, d0.array );
});

test( 'name', function(assert)
{
  var name = Neuro({
    name: 'name',
    fields: ['id', 'name']
  });

  strictEqual( name.Database.name, 'name' );
});

test( 'default className', function(assert)
{
  var default_className = Neuro({
    name: 'default_className',
    fields: ['id', 'name']
  });

  strictEqual( default_className.Database.className, 'DefaultClassName' );
});

test( 'custom className', function(assert)
{
  var CustomClassName = Neuro({
    name: 'custom_className',
    className: 'CustomClassNameTest',
    fields: ['id', 'name']
  });

  strictEqual( CustomClassName.Database.className, 'CustomClassNameTest' );

  var ccn0 = new CustomClassName({
    name: 'name0'
  });

  strictEqual( ccn0.toString(), 'CustomClassNameTest {"name":"name0"}');
});

test( 'comparator prop', function(assert)
{
  var comparator_prop = Neuro({
    name: 'comparator_prop',
    fields: ['id', 'name'],
    comparator: 'name'
  });

  var cp0 = comparator_prop.create({name: 'D'});
  var cp1 = comparator_prop.create({name: 'B'});
  var cp2 = comparator_prop.create({name: 'A'});
  var cp3 = comparator_prop.create({name: 'C'});
  var cp4 = comparator_prop.create({name: null});
  var cp5 = comparator_prop.create({name: '1'});

  var expected = [cp5, cp2, cp1, cp3, cp0, cp4];

  deepEqual( comparator_prop.all(), expected );
});

test( 'comparator -prop', function(assert)
{
  var comparator__prop = Neuro({
    name: 'comparator__prop',
    fields: ['id', 'name'],
    comparator: '-name'
  });

  var cp0 = comparator__prop.create({name: 'D'});
  var cp1 = comparator__prop.create({name: 'B'});
  var cp2 = comparator__prop.create({name: 'A'});
  var cp3 = comparator__prop.create({name: 'C'});
  var cp4 = comparator__prop.create({name: null});
  var cp5 = comparator__prop.create({name: '1'});

  var expected = [cp0, cp3, cp1, cp2, cp5, cp4];

  deepEqual( comparator__prop.all(), expected );
});

test( 'comparator props', function(assert)
{
  var comparator_props = Neuro({
    name: 'comparator_props',
    fields: ['id', 'name', 'age'],
    comparator: ['age', 'name']
  });

  var cp0 = comparator_props.create({name: 'D',  age: 1});
  var cp1 = comparator_props.create({name: 'B',  age: 0});
  var cp2 = comparator_props.create({name: 'A',  age: 2});
  var cp3 = comparator_props.create({name: 'C',  age: 1});
  var cp4 = comparator_props.create({name: null, age: 1});
  var cp5 = comparator_props.create({name: '1',  age: 2});

  var expected = [cp1, cp3, cp0, cp4, cp5, cp2];

  deepEqual( comparator_props.all(), expected );
});

test( 'custom comparator', function(assert)
{
  var custom_comparator = Neuro({
    name: 'custom_comparator',
    fields: ['id', 'age'],
    comparator: function(a, b) { // evens first, odds second
      var aa = a.age % 2;
      var ba = b.age % 2;
      var da = Neuro.compare( aa, ba );
      return da !== 0 ? da : Neuro.compare( a.age, b.age );
    }
  });

  var cc0 = custom_comparator.create({age: 2});
  var cc1 = custom_comparator.create({age: 1});
  var cc2 = custom_comparator.create({age: 3});
  var cc3 = custom_comparator.create({age: 5});
  var cc4 = custom_comparator.create({age: 6});
  var cc5 = custom_comparator.create({age: 7});

  var expected = [cc0, cc4, cc1, cc2, cc3, cc5];

  deepEqual( custom_comparator.all(), expected );
});

test( 'comparatorNullsFirst', function(assert)
{
  var comparatorNullsFirst = Neuro({
    name: 'comparatorNullsFirst',
    fields: ['id', 'name'],
    comparator: 'name',
    comparatorNullsFirst: true
  });

  var c0 = comparatorNullsFirst.create({name: 'D'});
  var c1 = comparatorNullsFirst.create({name: 'C'});
  var c2 = comparatorNullsFirst.create({name: 'E'});
  var c3 = comparatorNullsFirst.create({name: 'B'});
  var c4 = comparatorNullsFirst.create({name: null});

  var expected = [c4, c3, c1, c0, c2];

  deepEqual( comparatorNullsFirst.all(), expected );
});

test( 'revision', function(assert)
{
  var Todo = Neuro({
    name: 'revision_todo',
    fields: ['id', 'name', 'done', 'updated_at', 'created_at'],
    defaults: {
      name: null,
      done: false,
      updated_at: Date.now,
      created_at: Date.now
    },
    revision: 'updated_at'
  });

  isType( Todo.Database.revisionFunction, 'function' );

  var t0 = Todo.create({
    name: 'todo0'
  });

  strictEqual( t0.done, false );

  Neuro.live.revision_todo.save({
    id: t0.id,
    done: true,
    updated_at: Date.now() + 100
  });

  strictEqual( t0.done, true );

  Neuro.live.revision_todo.save({
    id: t0.id,
    done: false,
    updated_at: Date.now() - 100
  });

  strictEqual( t0.done, true );
});

test( 'loadRemote true', function(assert)
{
  var done = assert.async();

  var rest = Neuro.rest.loadRemote_true = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );
  rest.map.put( 3, {id: 3, name: 'name3' } );
  rest.map.put( 4, {id: 4, name: 'name4' } );
  rest.delay = 10;

  var loadRemote_true = Neuro({
    name: 'loadRemote_true',
    fields: ['id', 'name'],
    loadRemote: true
  });

  strictEqual( loadRemote_true.all().length, 0 );

  setTimeout(function() {

    strictEqual( loadRemote_true.all().length, 4 );
    done();

  }, 15);
  
});

test( 'loadRemote false', function(assert)
{
  var done = assert.async();

  var rest = Neuro.rest.loadRemote_false = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );
  rest.map.put( 3, {id: 3, name: 'name3' } );
  rest.map.put( 4, {id: 4, name: 'name4' } );
  rest.delay = 10;

  var loadRemote_false = Neuro({
    name: 'loadRemote_false',
    fields: ['id', 'name'],
    loadRemote: false
  });

  strictEqual( loadRemote_false.all().length, 0 );

  setTimeout(function() {

    strictEqual( loadRemote_false.all().length, 0 );
    done();

  }, 15);
  
});

test( 'autoRefresh true', function(assert)
{
  var rest = Neuro.rest.autoRefresh_true = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );

  var autoRefresh_true = Neuro({
    name: 'autoRefresh_true',
    fields: ['id', 'name'],
    autoRefresh: true
  });

  strictEqual( autoRefresh_true.all().length, 2 );

  offline();

  rest.map.put( 3, {id: 3, name: 'name3' } );
  rest.map.put( 4, {id: 4, name: 'name4' } );
  
  strictEqual( autoRefresh_true.all().length, 2 );

  online();

  strictEqual( autoRefresh_true.all().length, 4 );

  noline();
});

test( 'autoRefresh false', function(assert)
{
  var rest = Neuro.rest.autoRefresh_false = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );

  var autoRefresh_false = Neuro({
    name: 'autoRefresh_false',
    fields: ['id', 'name'],
    autoRefresh: false
  });

  strictEqual( autoRefresh_false.all().length, 2 );

  offline();

  rest.map.put( 3, {id: 3, name: 'name3' } );
  rest.map.put( 4, {id: 4, name: 'name4' } );
  
  strictEqual( autoRefresh_false.all().length, 2 );

  online();

  strictEqual( autoRefresh_false.all().length, 2 );

  noline();
});

test( 'cache true', function(assert)
{
  var cache_true = Neuro({
    name: 'cache_true',
    fields: ['id', 'name'],
    cache: true
  });

  var local = Neuro.store.cache_true.map.values;

  strictEqual( local.length, 0 );

  var ct0 = cache_true.create({name: 'name0'});
  var ct1 = cache_true.create({name: 'name1'});

  strictEqual( local.length, 2 );
});

test( 'cache false', function(assert)
{
  var cache_false = Neuro({
    name: 'cache_false',
    fields: ['id', 'name'],
    cache: false
  });

  var local = Neuro.store.cache_false.map.values;
  var remote = Neuro.rest.cache_false.map.values;

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 0 );

  var ct0 = cache_false.create({name: 'name0'});
  var ct1 = cache_false.create({name: 'name1'});

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 2 );
});

test( 'cachePending true', function(assert)
{
  var cachePending_true = Neuro({
    name: 'cachePending_true',
    fields: ['id', 'name'],
    cachePending: true
  });

  var local = Neuro.store.cachePending_true.map.values;
  var remote = Neuro.rest.cachePending_true.map.values;

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 0 );

  var ct0 = cachePending_true.create({name: 'name0'});

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 1 );

  offline();

  var ct1 = cachePending_true.create({name: 'name1'});  

  strictEqual( local.length, 1 );
  strictEqual( remote.length, 1 );

  online();

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 2 );

  noline();
});

test( 'cachePending false', function(assert)
{
  var cachePending_false = Neuro({
    name: 'cachePending_false',
    fields: ['id', 'name'],
    cachePending: false
  });

  var local = Neuro.store.cachePending_false.map.values;
  var remote = Neuro.rest.cachePending_false.map.values;

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 0 );

  var ct0 = cachePending_false.create({name: 'name0'});

  strictEqual( local.length, 1 );
  strictEqual( remote.length, 1 );

  offline();

  var ct1 = cachePending_false.create({name: 'name1'});  

  strictEqual( local.length, 2 );
  strictEqual( remote.length, 1 );

  online();

  strictEqual( local.length, 2 );
  strictEqual( remote.length, 2 );

  noline();
});

test( 'fullSave true', function(assert)
{
  var fullSave_true = Neuro({
    name: 'fullSave_true',
    fields: ['id', 'name'],
    fullSave: true
  });

  var remote = Neuro.rest.fullSave_true;

  var fs0 = fullSave_true.create({id: 2, name: 'name0'});

  deepEqual( remote.lastRecord, {id: 2, name: 'name0'} );

  fs0.$save( 'name', 'name1' );

  deepEqual( remote.lastRecord, {id: 2, name: 'name1'} );
});

test( 'fullSave false', function(assert)
{
  var fullSave_false = Neuro({
    name: 'fullSave_false',
    fields: ['id', 'name'],
    fullSave: false
  });

  var remote = Neuro.rest.fullSave_false;

  var fs0 = fullSave_false.create({id: 2, name: 'name0'});

  deepEqual( remote.lastRecord, {id: 2, name: 'name0'} );

  fs0.$save( 'name', 'name1' );

  deepEqual( remote.lastRecord, {name: 'name1'} );
});

test( 'fullPublish true', function(assert)
{
  var fullPublish_true = Neuro({
    name: 'fullPublish_true',
    fields: ['id', 'name'],
    fullPublish: true
  });

  var live = Neuro.live.fullPublish_true;

  live.onHandleMessage = function(message)
  {
    deepEqual( message.model, {id: 3, name: 'name0'} );
  };

  var fp0 = fullPublish_true.create({id: 3, name: 'name0'});

  live.onHandleMessage = function(message)
  {
    deepEqual( message.model, {id: 3, name: 'name1'} );
  };

  fp0.$save( 'name', 'name1' );
});

test( 'fullPublish false', function(assert)
{
  var fullPublish_false = Neuro({
    name: 'fullPublish_false',
    fields: ['id', 'name'],
    fullPublish: false
  });

  var live = Neuro.live.fullPublish_false;

  live.onHandleMessage = function(message)
  {
    deepEqual( message.model, {id: 3, name: 'name0'} );
  };

  var fp0 = fullPublish_false.create({id: 3, name: 'name0'});

  live.onHandleMessage = function(message)
  {
    deepEqual( message.model, {name: 'name1'} );
  };

  fp0.$save( 'name', 'name1' );
});

test( 'toString prop', function(assert)
{
  var toString_prop = Neuro({
    name: 'toString_prop',
    fields: ['id', 'name'],
    toString: 'name'
  });

  var inst = toString_prop.create({name: 'name0'});

  strictEqual( toString_prop.Database.toString( inst ), 'name0' );
});

test( 'toString custom', function(assert)
{
  var toString_custom = Neuro({
    name: 'toString_custom',
    fields: ['id', 'name'],
    toString: function(model) {
      return model.id + '/' + model.name;
    }
  });

  var inst = toString_custom.create({id: 4, name: 'name0'});

  strictEqual( toString_custom.Database.toString( inst ), '4/name0' );
});

test( 'encode decode', function(assert)
{
  function now() {
    return new Date();
  }

  var encode_decode = Neuro({
    name: 'encode_decode',
    fields: ['id', 'created_at', 'validation'],
    defaults: {
      created_at: now
    },
    decode: function(rawData) {
      if (typeof rawData.created_at === 'number') rawData.created_at = new Date( rawData.created_at );
      if (typeof rawData.validation === 'string') rawData.validation = new RegExp( rawData.validation );
      return rawData;
    },
    encode: function(data) {
      if (data.created_at instanceof Date) data.created_at = data.created_at.getTime();
      if (data.validation instanceof RegExp) data.validation = data.validation.source;
      return data;
    }
  });

  var remote = Neuro.rest.encode_decode;

  var ed = new encode_decode({
    validation: /name/
  });

  isInstance( ed.created_at, Date );
  isInstance( ed.validation, RegExp );

  ed.$save();

  var encoded = remote.lastRecord;

  isType( encoded.created_at, 'number' );
  isType( encoded.validation, 'string' );
});
