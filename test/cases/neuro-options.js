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

test( 'missing key', function(assert)
{
  var missing_key = Neuro({
    name: 'missing_key',
    fields: ['name']
  });

  deepEqual( missing_key.Database.fields, ['id', 'name'] );
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

test( 'no fields', function(assert)
{
  var no_fields = Neuro({
    name: 'no_fields',
    key: ['user_id', 'group_id']
  });

  deepEqual( no_fields.Database.fields, ['user_id', 'group_id'] );
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
  strictEqual( f.notspecified, void 0 );

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

  deepEqual( comparator_prop.all().toArray(), expected );
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

  deepEqual( comparator__prop.all().toArray(), expected );
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

  deepEqual( comparator_props.all().toArray(), expected );
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

  deepEqual( custom_comparator.all().toArray(), expected );
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

  deepEqual( comparatorNullsFirst.all().toArray(), expected );
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
  noline();

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
  noline();

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

test( 'cache all', function(assert)
{
  var cache_all = Neuro({
    name: 'cache_all',
    fields: ['id', 'name'],
    cache: Neuro.Cache.All
  });

  var local = Neuro.store.cache_all.map.values;

  strictEqual( local.length, 0 );

  var ct0 = cache_all.create({name: 'name0'});
  var ct1 = cache_all.create({name: 'name1'});

  strictEqual( local.length, 2 );
});

test( 'cache none', function(assert)
{
  var cache_none = Neuro({
    name: 'cache_none',
    fields: ['id', 'name'],
    cache: Neuro.Cache.None
  });

  var local = Neuro.store.cache_none.map.values;
  var remote = Neuro.rest.cache_none.map.values;

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 0 );

  var ct0 = cache_none.create({name: 'name0'});
  var ct1 = cache_none.create({name: 'name1'});

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 2 );
});

test( 'cache pending', function(assert)
{
  noline();

  var cache_pending = Neuro({
    name: 'cache_pending',
    fields: ['id', 'name'],
    cache: Neuro.Cache.Pending
  });

  var local = Neuro.store.cache_pending.map.values;
  var remote = Neuro.rest.cache_pending.map.values;

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 0 );

  var ct0 = cache_pending.create({name: 'name0'});

  strictEqual( local.length, 0 );
  strictEqual( remote.length, 1 );

  offline();

  var ct1 = cache_pending.create({name: 'name1'});  

  strictEqual( local.length, 1 );
  strictEqual( remote.length, 1 );

  online();

  strictEqual( local.length, 0 );
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

test( 'summarize prop', function(assert)
{
  var summarize_prop = Neuro({
    name: 'summarize_prop',
    fields: ['id', 'name'],
    summarize: 'name'
  });

  var inst = summarize_prop.create({name: 'name0'});

  strictEqual( summarize_prop.Database.summarize( inst ), 'name0' );
});

test( 'summarize custom', function(assert)
{
  var summarize_custom = Neuro({
    name: 'summarize_custom',
    fields: ['id', 'name'],
    summarize: function(model) {
      return model.id + '/' + model.name;
    }
  });

  var inst = summarize_custom.create({id: 4, name: 'name0'});

  strictEqual( summarize_custom.Database.summarize( inst ), '4/name0' );
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

test( 'methods', function(assert)
{
  var Todo = Neuro({
    name: 'methods',
    fields: ['name', 'done', 'finished_at', 'updated_at', 'created_at'],
    defaults: {
      name: '',
      done: false,
      finished_at: null,
      updated_at: Date.now,
      created_at: Date.now
    },
    methods: {
      setDone: function(done) {
        this.$save({
          done: done,
          finished_at: done ? Date.now() : null,
          updated_at: Date.now()
        });
      },
      setName: function(name) {
        this.$save({
          name: name,
          updated_at: Date.now()
        });
      }
    }
  });

  var t0 = new Todo({name: 't0'});

  strictEqual( t0.name, 't0' );
  strictEqual( t0.done, false );
  strictEqual( t0.finished_at, null );

  t0.setDone( true );

  strictEqual( t0.done, true );
  notStrictEqual( t0.finished_at, null );

  t0.setName( 't1' );

  strictEqual( t0.name, 't1' );
});

test( 'dynamic get', function(assert)
{
  var now = function() {
    return 1448323200; // Tuesday 24th November 2015 12:00:00 AM
  };

  var Person = Neuro({
    name: 'dynamic_get',
    fields: ['name', 'dob'],
    dynamic: {
      age: function() {
        return Math.floor( (now() - this.dob) / 31536000 );
      }
    }
  });

  var p = new Person();
  p.dob = 599856120; // Tuesday 3rd January 1989 06:42:00 PM

  strictEqual( p.age, 26 );

  p.age = 23;

  strictEqual( p.age, 26 );
});

test( 'dynamic set', function(assert)
{
  var MyNumber = Neuro({
    name: 'dynamic_set',
    fields: ['even'],
    dynamic: {
      number: {
        set: function(x) {
          this.even = !(x % 2);
        }
      }
    }
  });

  var p = new MyNumber();

  strictEqual( p.even, void 0 );

  p.even = true;

  strictEqual( p.even, true );

  p.number = 23;

  strictEqual( p.even, false );

  p.number = 0;

  strictEqual( p.even, true );

  strictEqual( p.number, void 0 );
});

test( 'dynamic get/set', function(assert)
{
  var Task = Neuro({
    name: 'dynamic_get_set',
    fields: ['name', 'finished_at', 'updated_at'],
    defaults: {
      finished_at: null,
      updated_at: Date.now
    },
    dynamic: {
      done: {
        get: function() {
          return !!this.finished_at;
        },
        set: function(x) {
          this.finished_at = x ? Date.now() : null;
          this.updated_at = Date.now();
        }
      }
    }
  });

  var t = new Task();

  strictEqual( t.done, false );
  strictEqual( t.finished_at, null );
  isType( t.updated_at, 'number' );

  t.done = true;

  strictEqual( t.done, true );
  isType( t.finished_at, 'number' );
  isType( t.updated_at, 'number' );
  
  t.done = false;

  strictEqual( t.done, false );
  strictEqual( t.finished_at, null );
  isType( t.updated_at, 'number' );

  t.finished_at = Date.now();

  strictEqual( t.done, true );
  isType( t.finished_at, 'number' );
  isType( t.updated_at, 'number' );
});

test( 'events', function(assert)
{
  var context0 = {name: 'c0'};
  var context1 = {name: 'c1'};

  expect( 12 );

  var Task = Neuro({
    name: 'events',
    fields: ['name'],
    events: {
      // Model Event
      saved: function() {
        isInstance( this, Task, 'on saved: isInstance' );
      },
      // Model Event
      change: {
        on: [
          function() {
            strictEqual( context0, this, 'on change: context check' );
          },
          context0
        ],
        once: function() {
          isInstance( this, Task, 'once change: isInstance' );
        }
      },
      // Database Event
      modelAdded: function(model) {
        notStrictEqual( model, void 0, 'on modelAdded: model given' );
      },
      // Database Event
      modelUpdated: [
        function(model) {
          isInstance( model, Task, 'on moduleUpdated: isInstance' );
          strictEqual( context1, this, 'on modelUpdated: context check')
        },
        context1
      ]
    }
  });

  var t = Task.create({name: 'Phil'});

  assert.push( 1, 1, 1, '*** pre-save ***' );

  t.$save({
    name: 'Joe'
  });
});