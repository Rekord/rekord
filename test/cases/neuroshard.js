module( 'Neuro Shard' );

test( 'get', function(assert)
{
  var prefix = 'NeuroShard_get_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
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

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
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

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
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

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
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

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[1].map.put( 1, {id: 1, name: 't1', done: 0} );
  shards[2].map.put( 2, {id: 2, name: 't2', done: 1} );
  shards[0].map.put( 3, {id: 3, name: 't3', done: 1} );
  shards[1].map.put( 4, {id: 4, name: 't4', done: 0} );

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder,
    comparator: 'name'
  });

  strictEqual( Task.all().length, 4 );
  strictEqual( Task.all()[0].name, 't1' );
  strictEqual( Task.all()[1].name, 't2' );
  strictEqual( Task.all()[2].name, 't3' );
  strictEqual( Task.all()[3].name, 't4' );
});

test( 'initialize override', function(assert)
{
  var prefix = 'NeuroShard_initialize_override_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    initialize: function(db) {
      strictEqual( db.name, prefix + '_task', 'database passed' );
    },
    getShardForModel: function(model) {
      return shards[ model.id % 3 ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder,
    comparator: 'name'
  });
});

test( 'writer readers', function(assert)
{
  var prefix = 'NeuroShard_writer_readers_';

  var writer = new TestRest();
  var writers = [ writer ];
  var readers = [
    new TestRest(),
    new TestRest(),
    new TestRest()
  ];
  var readerIndex = 0;

  readers[0].map = writer.map;
  readers[1].map = writer.map;
  readers[2].map = writer.map;

  writer.map.put( 4, {id: 4, name: 't4', done: 0} );

  var sharder = {
    getShardsForModel: function(model, forRead) {
      if ( forRead ) {
        readerIndex = (readerIndex + 1) % readers.length;
        return [ readers[ readerIndex ] ];
      } else {
        return writers;
      }
    },
    getShards: function(forRead) {
      return forRead ? readers : writers;
    }
  };

  var Task = Neuro({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder,
    comparator: 'name'
  });

  var t4 = Task.fetch( 4 );

  strictEqual( readers[ 0 ].lastModel, null );
  strictEqual( readers[ 1 ].lastModel, t4 );
  strictEqual( readers[ 2 ].lastModel, null );
  strictEqual( writer.lastModel, null );

  readers[ 1 ].lastModel = null;

  t4.$refresh();

  strictEqual( readers[ 0 ].lastModel, null );
  strictEqual( readers[ 1 ].lastModel, null );
  strictEqual( readers[ 2 ].lastModel, t4 );
  strictEqual( writer.lastModel, null );

  readers[ 2 ].lastModel = null;

  t4.$save('name', 't4a');

  strictEqual( readers[ 0 ].lastModel, null );
  strictEqual( readers[ 1 ].lastModel, null );
  strictEqual( readers[ 2 ].lastModel, null );
  strictEqual( writer.lastModel, t4 );
});
