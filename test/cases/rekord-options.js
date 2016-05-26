online();

module( 'Rekord options' );

test( 'default key', function(assert)
{
  var default_key = Rekord({
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
  var custom_key = Rekord({
    key: 'key',
    name: 'custom_key',
    fields: ['key', 'name']
  });

  strictEqual( custom_key.Database.key, 'key', 'key field set' );

  var ck0 = custom_key.create({
    name: 'name0'
  });

  ok( ck0.key, 'model has custom key' );

  var ck1 = custom_key.create({
    key: 'key1',
    name: 'name1'
  });

  strictEqual( ck1.key, 'key1', 'custom key set on create' );
  hasModel( custom_key, 'key1', ck1 );
});

test( 'missing key', function(assert)
{
  var missing_key = Rekord({
    name: 'missing_key',
    fields: ['name']
  });

  deepEqual( missing_key.Database.fields, ['id', 'name'] );
});

test( 'key array', function(assert)
{
  var key_array = Rekord({
    key: ['user_id', 'group_id'],
    name: 'key_array',
    fields: ['user_id', 'group_id', 'created_at']
  });

  deepEqual( key_array.Database.key, ['user_id', 'group_id'] );

  var ka0 = key_array.create({
    user_id: 2,
    group_id: 3,
    created_at: currentTime()()
  });

  strictEqual( ka0.$key(), '2/3' );
  deepEqual( ka0.$keys(), [2,3] );
  hasModel( key_array, '2/3', ka0 );
});

test( 'key separator', function(assert)
{
  var key_separator = Rekord({
    key: ['user_id', 'group_id'],
    keySeparator: '/group/',
    name: 'key_separator',
    fields: ['user_id', 'group_id', 'created_at']
  });

  strictEqual( key_separator.Database.keySeparator, '/group/' );

  var ks0 = key_separator.create({
    user_id: 2,
    group_id: 3,
    created_at: currentTime()()
  });

  strictEqual( ks0.$key(), '2/group/3' );
});

test( 'no fields', function(assert)
{
  var no_fields = Rekord({
    name: 'no_fields',
    key: ['user_id', 'group_id']
  });

  deepEqual( no_fields.Database.fields, ['user_id', 'group_id'] );
});

test( 'fields', function(assert)
{
  var fields = Rekord({
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
  var defaults_related = Rekord({
    name: 'defaults_related',
    fields: ['id', 'created_at'],
    defaults: {
      id: Rekord.uuid,
      created_at: currentTime()
    }
  });

  var defaults = Rekord({
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
  var name = Rekord({
    name: 'name',
    fields: ['id', 'name']
  });

  strictEqual( name.Database.name, 'name' );
});

test( 'default className', function(assert)
{
  var default_className = Rekord({
    name: 'default_className',
    fields: ['id', 'name']
  });

  strictEqual( default_className.Database.className, 'DefaultClassName' );
});

test( 'custom className', function(assert)
{
  var CustomClassName = Rekord({
    name: 'custom_className',
    className: 'CustomClassNameTest',
    fields: ['id', 'name']
  });

  strictEqual( CustomClassName.Database.className, 'CustomClassNameTest' );

  var ccn0 = new CustomClassName({
    id: 6,
    name: 'name0'
  });

  strictEqual( ccn0.toString(), 'CustomClassNameTest {"id":6,"name":"name0"}');
});

test( 'comparator prop', function(assert)
{
  var comparator_prop = Rekord({
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
  var comparator__prop = Rekord({
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
  var comparator_props = Rekord({
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
  var custom_comparator = Rekord({
    name: 'custom_comparator',
    fields: ['id', 'age'],
    comparator: function(a, b) { // evens first, odds second
      var aa = a.age % 2;
      var ba = b.age % 2;
      var da = Rekord.compare( aa, ba );
      return da !== 0 ? da : Rekord.compare( a.age, b.age );
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
  var comparatorNullsFirst = Rekord({
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
  var now = currentTime()();

  var Todo = Rekord({
    name: 'revision_todo',
    fields: ['id', 'name', 'done', 'updated_at', 'created_at'],
    defaults: {
      name: null,
      done: false,
      updated_at: now,
      created_at: now
    },
    revision: 'updated_at'
  });

  var live = Todo.Database.live;

  isType( Todo.Database.revisionFunction, 'function' );

  var t0 = Todo.create({
    name: 'todo0'
  });

  strictEqual( t0.done, false );

  live.liveSave({
    id: t0.id,
    done: true,
    updated_at: now + 100
  });

  strictEqual( t0.done, true );

  live.liveSave({
    id: t0.id,
    done: false,
    updated_at: now - 100
  });

  strictEqual( t0.done, true );
});

test( 'load all', function(assert)
{
  var timer = assert.timer();
  var done = assert.async();

  var rest = Rekord.rest.load_all = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );
  rest.map.put( 3, {id: 3, name: 'name3' } );
  rest.map.put( 4, {id: 4, name: 'name4' } );
  rest.delay = 1;

  var load_all = Rekord({
    name: 'load_all',
    fields: ['id', 'name'],
    load: Rekord.Load.All
  });

  strictEqual( load_all.all().length, 0 );

  wait(2, function()
  {
    strictEqual( load_all.all().length, 4 );
    done();
  });

  timer.run();
});

test( 'load none', function(assert)
{
  var timer = assert.timer();
  var done = assert.async();

  var rest = Rekord.rest.load_none = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );
  rest.map.put( 3, {id: 3, name: 'name3' } );
  rest.map.put( 4, {id: 4, name: 'name4' } );
  rest.delay = 1;

  var load_none = Rekord({
    name: 'load_none',
    fields: ['id', 'name'],
    load: Rekord.Load.None
  });

  strictEqual( load_none.all().length, 0 );

  wait(2, function()
  {
    strictEqual( load_none.all().length, 0 );
    done();
  });

  timer.run();
});

test( 'autoRefresh true', function(assert)
{
  noline();

  var rest = Rekord.rest.autoRefresh_true = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );

  var autoRefresh_true = Rekord({
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

  var rest = Rekord.rest.autoRefresh_false = new TestRest();
  rest.map.put( 1, {id: 1, name: 'name1' } );
  rest.map.put( 2, {id: 2, name: 'name2' } );

  var autoRefresh_false = Rekord({
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
  var cache_all = Rekord({
    name: 'cache_all',
    fields: ['id', 'name'],
    cache: Rekord.Cache.All
  });

  var local = Rekord.store.cache_all.map.values;

  strictEqual( local.length, 0 );

  var ct0 = cache_all.create({name: 'name0'});
  var ct1 = cache_all.create({name: 'name1'});

  strictEqual( local.length, 2 );
});

test( 'cache none', function(assert)
{
  var cache_none = Rekord({
    name: 'cache_none',
    fields: ['id', 'name'],
    cache: Rekord.Cache.None
  });

  var local = Rekord.store.cache_none.map.values;
  var remote = Rekord.rest.cache_none.map.values;

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

  var cache_pending = Rekord({
    name: 'cache_pending',
    fields: ['id', 'name'],
    cache: Rekord.Cache.Pending
  });

  var local = Rekord.store.cache_pending.map.values;
  var remote = Rekord.rest.cache_pending.map.values;

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
  var fullSave_true = Rekord({
    name: 'fullSave_true',
    fields: ['id', 'name'],
    fullSave: true
  });

  var remote = Rekord.rest.fullSave_true;

  var fs0 = fullSave_true.create({id: 2, name: 'name0'});

  deepEqual( remote.lastRecord, {id: 2, name: 'name0'} );

  fs0.$save( 'name', 'name1' );

  deepEqual( remote.lastRecord, {id: 2, name: 'name1'} );
});

test( 'fullSave false', function(assert)
{
  var fullSave_false = Rekord({
    name: 'fullSave_false',
    fields: ['id', 'name'],
    fullSave: false
  });

  var remote = Rekord.rest.fullSave_false;

  var fs0 = fullSave_false.create({id: 2, name: 'name0'});

  deepEqual( remote.lastRecord, {id: 2, name: 'name0'} );

  fs0.$save( 'name', 'name1' );

  deepEqual( remote.lastRecord, {name: 'name1'} );
});

test( 'fullPublish true', function(assert)
{
  var fullPublish_true = Rekord({
    name: 'fullPublish_true',
    fields: ['id', 'name'],
    fullPublish: true
  });

  var live = Rekord.live.fullPublish_true;

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
  var fullPublish_false = Rekord({
    name: 'fullPublish_false',
    fields: ['id', 'name'],
    fullPublish: false
  });

  var live = Rekord.live.fullPublish_false;

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
  var summarize_prop = Rekord({
    name: 'summarize_prop',
    fields: ['id', 'name'],
    summarize: 'name'
  });

  var inst = summarize_prop.create({name: 'name0'});

  strictEqual( summarize_prop.Database.summarize( inst ), 'name0' );
});

test( 'summarize custom', function(assert)
{
  var summarize_custom = Rekord({
    name: 'summarize_custom',
    fields: ['id', 'name'],
    summarize: function(model) {
      return model.id + '/' + model.name;
    }
  });

  var inst = summarize_custom.create({id: 4, name: 'name0'});

  strictEqual( summarize_custom.Database.summarize( inst ), '4/name0' );
});

test( 'summarize format', function(assert)
{
  var summarize_format = Rekord({
    name: 'summarize_format',
    fields: ['id', 'name'],
    summarize: '{id}/{name}'
  });

  var inst = summarize_format.create({id: 4, name: 'name0'});

  strictEqual( summarize_format.Database.summarize( inst ), '4/name0' );
});

test( 'encode decode', function(assert)
{
  function now() {
    return new Date();
  }

  var encode_decode = Rekord({
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

  var remote = Rekord.rest.encode_decode;

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
  var Todo = Rekord({
    name: 'methods',
    fields: ['name', 'done', 'finished_at', 'updated_at', 'created_at'],
    defaults: {
      name: '',
      done: false,
      finished_at: null,
      updated_at: currentTime(),
      created_at: currentTime()
    },
    methods: {
      setDone: function(done) {
        this.$save({
          done: done,
          finished_at: done ? currentTime()() : null,
          updated_at: currentTime()()
        });
      },
      setName: function(name) {
        this.$save({
          name: name,
          updated_at: currentTime()()
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

test( 'methods global default', function(assert)
{
  Rekord.Database.Defaults.methods = {
    setDone: function(done) {
      this.$save({
        done: done,
        finished_at: done ? currentTime()() : null,
        updated_at: currentTime()()
      });
    },
    setName: function(name) {
      this.$save({
        name: name,
        updated_at: currentTime()()
      });
    }
  };

  var Todo = Rekord({
    name: 'methods_default',
    fields: ['name', 'done', 'finished_at', 'updated_at', 'created_at'],
    defaults: {
      name: '',
      done: false,
      finished_at: null,
      updated_at: currentTime(),
      created_at: currentTime()
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

  delete Rekord.Database.Defaults.methods;
});

test( 'dynamic get', function(assert)
{
  var now = function() {
    return 1448323200; // Tuesday 24th November 2015 12:00:00 AM
  };

  var Person = Rekord({
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

test( 'dynamic get global default', function(assert)
{
  var now = function() {
    return 1448323200; // Tuesday 24th November 2015 12:00:00 AM
  };

  Rekord.Database.Defaults.dynamic = {
    age: function() {
      return Math.floor( (now() - this.dob) / 31536000 );
    }
  };

  var Person = Rekord({
    name: 'dynamic_get',
    fields: ['name', 'dob']
  });

  var p = new Person();
  p.dob = 599856120; // Tuesday 3rd January 1989 06:42:00 PM

  strictEqual( p.age, 26 );

  p.age = 23;

  strictEqual( p.age, 26 );

  delete Rekord.Database.Defaults.dynamic;
});

test( 'dynamic set', function(assert)
{
  var MyNumber = Rekord({
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
  var Task = Rekord({
    name: 'dynamic_get_set',
    fields: ['name', 'finished_at', 'updated_at'],
    defaults: {
      finished_at: null,
      updated_at: currentTime()
    },
    dynamic: {
      done: {
        get: function() {
          return !!this.finished_at;
        },
        set: function(x) {
          this.finished_at = x ? currentTime()() : null;
          this.updated_at = currentTime()();
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

  t.finished_at = currentTime()();

  strictEqual( t.done, true );
  isType( t.finished_at, 'number' );
  isType( t.updated_at, 'number' );
});

test( 'events', function(assert)
{
  var context0 = {name: 'c0'};
  var context1 = {name: 'c1'};

  expect( 10 );

  var Task = Rekord({
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

test( 'events global default', function(assert)
{
  var context0 = {name: 'c0'};
  var context1 = {name: 'c1'};

  Rekord.Database.Defaults.events = {
    // Database Event
    modelAdded: function(model) {
      notStrictEqual( model, void 0, 'on modelAdded: model given' );
    },
  };

  expect( 2 );

  var Task = Rekord({
    name: 'events_global_default',
    fields: ['name']
  });

  var t = Task.create({name: 'Phil'});

  assert.push( 1, 1, 1, '*** pre-save ***' );

  t.$save({
    name: 'Joe'
  });

  delete Rekord.Database.Defaults.events;
});

test( 'encodings decodings', function(assert)
{
  var prefix = 'encodings_decodings_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'times'],
    encodings: {
      times: String
    },
    decodings: {
      times: parseInt
    }
  });

  var t0 = Todo.boot({
    id: 5,
    name: 't0',
    times: '456'
  });

  isType( t0.times, 'number' );
  strictEqual( t0.times, 456 );

  isType( t0.$saved.times, 'string' );
  strictEqual( t0.$saved.times, '456' );
});

test( 'timestamps default', function(assert)
{
  var done = assert.async();

  var prefix = 'timestamps_default_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: true
  });

  Todo.Database.defaults.updated_at = currentDate();
  Todo.Database.defaults.created_at = currentDate();

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'created_at', 'updated_at'] );

  var t0 = Todo.create({name: 't0'});

  strictEqual( t0.name, 't0' );
  strictEqual( t0.done, false );
  isInstance( t0.created_at, Date, t0.created_at );
  isInstance( t0.updated_at, Date, t0.updated_at );

  isType( t0.$saved.updated_at, 'number' );
  isType( t0.$saved.created_at, 'number' );

  var t1 = Todo.boot({id: 5, name: 't0', created_at: 1448800534000, updated_at: 1448850534000});

  isInstance( t1.created_at, Date, t1.created_at );
  isInstance( t1.updated_at, Date, t1.updated_at );

  var time0 = t0.updated_at.getTime();

  setTimeout(function()
  {
    t0.$save('done', true);

    notDeepEqual( t0.updated_at.getTime(), time0, t0.updated_at );

    done();

  }, 2 );
});

test( 'timestamps default global default', function(assert)
{
  var done = assert.async();

  var prefix = 'timestamps_default_default_';

  Rekord.Database.Defaults.timestamps = true;

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false }
  });

  Todo.Database.defaults.updated_at = currentDate();
  Todo.Database.defaults.created_at = currentDate();

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'created_at', 'updated_at'] );

  var t0 = Todo.create({name: 't0'});

  strictEqual( t0.name, 't0' );
  strictEqual( t0.done, false );
  isInstance( t0.created_at, Date, t0.created_at );
  isInstance( t0.updated_at, Date, t0.updated_at );

  isType( t0.$saved.updated_at, 'number' );
  isType( t0.$saved.created_at, 'number' );

  var t1 = Todo.boot({id: 5, name: 't0', created_at: 1448800534000, updated_at: 1448850534000});

  isInstance( t1.created_at, Date, t1.created_at );
  isInstance( t1.updated_at, Date, t1.updated_at );

  var time0 = t0.updated_at.getTime();

  setTimeout(function()
  {
    t0.$save('done', true);

    notDeepEqual( t0.updated_at.getTime(), time0, t0.updated_at );

    done();

  }, 2 );

  delete Rekord.Database.Defaults.timestamps;
});

test( 'timestamps custom', function(assert)
{
  var prefix = 'timestamps_custom_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at'
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.create({name: 't0'});

  strictEqual( t0.name, 't0' );
  strictEqual( t0.done, false );
  isInstance( t0.done_at, Date );
});

test( 'timestamps type date', function(assert)
{
  var prefix = 'timestamps_type_date_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampType: Rekord.Timestamp.Date
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  isInstance( t0.done_at, Date );
});

test( 'timestamps type millis', function(assert)
{
  var prefix = 'timestamps_type_millis_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampType: Rekord.Timestamp.Millis,
    timestampUTC: true
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  strictEqual( t0.done_at, 1041465600000 );
});

test( 'timestamps type seconds', function(assert)
{
  var prefix = 'timestamps_type_seconds_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampType: Rekord.Timestamp.Seconds,
    timestampUTC: true
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  strictEqual( t0.done_at, 1041465600 );
});

test( 'timestamps type custom', function(assert)
{
  var prefix = 'timestamps_type_custom_';

  Rekord.formatDate = function(date, format) {
    // format = 'yyyy-m-d'
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  };

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampType: 'yyyy-m-d'
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  strictEqual( t0.done_at, '2003-1-2' );
});

test( 'timestamps format millis', function(assert)
{
  var prefix = 'timestamps_format_millis_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampFormat: Rekord.Timestamp.Millis,
    timestampUTC: true
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  isInstance( t0.done_at, Date );

  var e0 = t0.$toJSON(true);

  strictEqual( e0.done_at, 1041465600000 );
});

test( 'timestamps format seconds', function(assert)
{
  var prefix = 'timestamps_format_seconds_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampFormat: Rekord.Timestamp.Seconds,
    timestampUTC: true
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  isInstance( t0.done_at, Date );

  var e0 = t0.$toJSON(true);

  strictEqual( e0.done_at, 1041465600 );
});

test( 'timestamps format custom', function(assert)
{
  var prefix = 'timestamps_format_custom_';

  Rekord.formatDate = function(date, format) {
    // format = 'yyyy-m-d'
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  };

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: 'done_at',
    timestampFormat: 'yyyy-m-d'
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'done_at'] );

  var t0 = Todo.boot({id: 1, name: 't0', done_at: '01/02/2003'});

  isInstance( t0.done_at, Date );

  var e0 = t0.$toJSON(true);

  strictEqual( e0.done_at, '2003-1-2' );
});

test( 'timestamps updated_at saving skipped', function(assert)
{
  var prefix = 'timestamps_updated_at_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: { done: false },
    timestamps: true
  });

  var remote = Todo.Database.rest;

  var t0 = Todo.create({name: 't0'});

  remote.lastModel = null;

  t0.$save();

  strictEqual( remote.lastModel, null );
});

test( 'timestamps renamed', function(assert)
{
  var timer = assert.timer();

  var prefix = 'timestamps_renamed_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    defaults: {
      done: false,
      updated_tms: currentDate(),
      created_tms: currentDate()
    },
    timestamps: {created_at: 'created_tms', updated_at: 'updated_tms'}
  });

  deepEqual( Todo.Database.fields, ['id', 'name', 'done', 'created_tms', 'updated_tms'] );

  var t0 = Todo.create({name: 't0'});

  strictEqual( t0.name, 't0' );
  strictEqual( t0.done, false );
  isInstance( t0.created_tms, Date, t0.created_tms );
  isInstance( t0.updated_tms, Date, t0.updated_tms );

  isType( t0.$saved.updated_tms, 'number' );
  isType( t0.$saved.created_tms, 'number' );

  var t1 = Todo.boot({id: 5, name: 't0', created_tms: 1448800534000, updated_tms: 1448850534000});

  isInstance( t1.created_tms, Date, t1.created_tms );
  isInstance( t1.updated_tms, Date, t1.updated_tms );

  var time0 = t0.updated_tms.getTime();

  wait( 2, function()
  {
    t0.$save('done', true);

    notDeepEqual( t0.updated_tms.getTime(), time0, t0.updated_tms );
  });

  timer.run();
});

test( 'extend', function(assert)
{
  var prefix = 'extend_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name']
  });

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done', 'created_by'],
    defaults: { done: false },
    timestamps: true,
    load: Rekord.Load.None,
    comparator: 'name',
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var TodoUpdatable = Rekord({
    name: prefix + 'todo_extended',
    extend: Todo,
    fields: ['updated_by'],
    load: Rekord.Load.All,
    belongsTo: {
      updater: {
        model: User,
        local: 'updated_by'
      }
    }
  });

  var db = TodoUpdatable.Database;

  deepEqual( db.fields, ['id', 'name', 'done', 'created_by', 'created_at', 'updated_at', 'updated_by'] );
  strictEqual( db.load, Rekord.Load.All );
  ok( 'created_at' in db.defaults );
  ok( 'updated_at' in db.defaults );
  ok( 'done' in db.defaults );
  ok( 'updater' in db.relations );
  ok( 'creator' in db.relations );
});

test( 'extend global default', function(assert)
{
  var prefix = 'extend_default_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name']
  });

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done', 'created_by'],
    defaults: { done: false },
    timestamps: true,
    load: Rekord.Load.None,
    comparator: 'name',
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  Rekord.Database.Defaults.extend = Todo;

  var TodoUpdatable = Rekord({
    name: prefix + 'todo_extended',
    fields: ['updated_by'],
    load: Rekord.Load.All,
    belongsTo: {
      updater: {
        model: User,
        local: 'updated_by'
      }
    }
  });

  var db = TodoUpdatable.Database;

  deepEqual( db.fields, ['id', 'name', 'done', 'created_by', 'created_at', 'updated_at', 'updated_by'] );
  strictEqual( db.load, Rekord.Load.All );
  ok( 'created_at' in db.defaults );
  ok( 'updated_at' in db.defaults );
  ok( 'done' in db.defaults );
  ok( 'updater' in db.relations );
  ok( 'creator' in db.relations );

  delete Rekord.Database.Defaults.extend;
});

test( 'prepare', function(assert)
{
  var prefix = 'prepare_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done'],
    prepare: function(db, options) {
      db.api = '/api/1.0/' + db.name;
    }
  });

  strictEqual( Todo.Database.api, '/api/1.0/prepare_todo' );
});

test( 'prepare global default', function(assert)
{
  var prefix = 'prepare_default_';

  Rekord.Database.Defaults.prepare = function(db, options) {
    db.api = '/api/1.0/' + db.name;
  };

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'done']
  });

  strictEqual( Todo.Database.api, '/api/1.0/prepare_default_todo' );
});

test( 'publishAlways', function(assert)
{
  var prefix = 'publishAlways_';

  var Todo = Rekord({
    name: prefix + 'todo',
    fields: ['name', 'updated_at'],
    publishAlways: ['updated_at']
  });

  var TodoLive = Todo.Database.live;

  var t0 = Todo.create({id: 4, name: 't0', updated_at: 23});

  deepEqual( TodoLive.lastMessage.model, {id: 4, name: 't0', updated_at: 23} );

  t0.$save('name', 't1');

  deepEqual( TodoLive.lastMessage.model, {name: 't1', updated_at: 23} );
});
