module( 'Neuro Shard' );

test( 'get', function(assert)
{
  var prefix = 'NeuroShard_get_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var multiplex = Neuro.shard({
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  });

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    createRest: multiplex
  });

  shards[0].map.put( 3, {id: 3, name: 't3', done: 0} );
  shards[1].map.put( 1, {id: 1, name: 't1', done: 1} );
  shards[2].map.put( 2, {id: 2, name: 't2', done: 1} );

  expect( 16 );

  Task.fetch( 3, function(t)
  {
    ok( t );
    strictEqual( t.id, 3 );
    strictEqual( t.name, 't3' );
    ok( t.$isSaved() );
  });

  Task.fetch( 1, function(t)
  {
    ok( t );
    strictEqual( t.id, 1 );
    strictEqual( t.name, 't1' );
    ok( t.$isSaved() );
  });

  Task.fetch( 2, function(t)
  {
    ok( t );
    strictEqual( t.id, 2 );
    strictEqual( t.name, 't2' );
    ok( t.$isSaved() );
  });

  Task.fetch( 4, function(t)
  {
    ok( t );
    strictEqual( t.id, 4 );
    strictEqual( t.name, void 0 );
    notOk( t.$isSaved() );
  });

});

test( 'create', function(assert)
{
  var prefix = 'NeuroShard_create_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var multiplex = Neuro.shard({
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  });

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    createRest: multiplex
  });

  var t4 = Task.create({id: 4, name: 't4', done: false});

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4', done: false} );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'update', function(assert)
{
  var prefix = 'NeuroShard_update_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var multiplex = Neuro.shard({
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  });

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    createRest: multiplex
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 5 );

  var t = Task.fetch( 4 );
  t.name = 't4b';

  strictEqual( t.id, 4 );
  ok( t.$isSaved() );

  t.$save();

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4b', done: false } );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'remove', function(assert)
{
  var prefix = 'NeuroShard_remove_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var multiplex = Neuro.shard({
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  });

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    createRest: multiplex
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 5 );

  var t = Task.fetch( 4 );

  ok( t.$isSaved() );

  t.$remove();

  ok( t.$isDeleted() );
  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'all', function(assert)
{
  var prefix = 'NeuroShard_all_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var multiplex = Neuro.shard({
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  });

  shards[1].map.put( 1, {id: 1, name: 't1', done: 0} );
  shards[2].map.put( 2, {id: 2, name: 't2', done: 1} );
  shards[0].map.put( 3, {id: 3, name: 't3', done: 1} );
  shards[1].map.put( 4, {id: 4, name: 't4', done: 0} );

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    createRest: multiplex,
    comparator: 'name'
  });

  strictEqual( Task.all().length, 4 );
  strictEqual( Task.all()[0].name, 't1' );
  strictEqual( Task.all()[1].name, 't2' );
  strictEqual( Task.all()[2].name, 't3' );
  strictEqual( Task.all()[3].name, 't4' );
});
