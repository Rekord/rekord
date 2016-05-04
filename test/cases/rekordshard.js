module( 'Rekord Shard' );

test( 'get', function(assert)
{
  var prefix = 'RekordShard_get_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
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

test( 'get failure', function(assert)
{
  var prefix = 'RekordShard_get_failure_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  shards[0].status = 500;
  shards[1].status = 500;
  shards[2].status = 500;

  expect( 4 );

  Task.fetch( 3, function(t)
  {
    ok( t );
    strictEqual( t.id, 3 );
    strictEqual( t.name, void 0 );
    notOk( t.$isSaved() );
  });

});

test( 'get unknown', function(assert)
{
  var prefix = 'RekordShard_get_unknown_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return false;
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
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
  var prefix = 'RekordShard_create_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var t4 = Task.create({id: 4, name: 't4', done: false});

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4', done: false} );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'create failure', function(assert)
{
  var prefix = 'RekordShard_create_failure_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[0].status = 500;
  shards[1].status = 500;
  shards[2].status = 500;

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var t4 = Task.create({id: 4, name: 't4', done: false});

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
  notOk( t4.$isSaved() );
});

test( 'create unknown', function(assert)
{
  var prefix = 'RekordShard_create_unknown_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model, forRead) {
      return forRead ? shards[ model.id % shards.length ] : false;
    },
    getShards: function(forRead) {
      return forRead ? shards : [];
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var t4 = Task.create({id: 4, name: 't4', done: false});

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );

  notOk( t4.$isSaved() );
});

test( 'update', function(assert)
{
  var prefix = 'RekordShard_update_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
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

test( 'update failure', function(assert)
{
  var prefix = 'RekordShard_update_failure_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 8 );

  var t = Task.fetch( 4 );

  notOk( t.$hasChanges() );

  t.name = 't4b';

  strictEqual( t.id, 4 );
  ok( t.$isSaved() );
  ok( t.$hasChanges() );

  shards[ 1 ].status = 500;

  t.$save();

  ok( t.$hasChanges() );

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4', done: false } );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'update unknown', function(assert)
{
  var prefix = 'RekordShard_update_unknown_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model, forRead) {
      return forRead ? shards[ model.id % shards.length ] : false;
    },
    getShards: function(forRead) {
      return forRead ? shards : [];
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 8 );

  var t = Task.fetch( 4 );

  strictEqual( t.id, 4 );
  ok( t.$isSaved() );
  notOk( t.$hasChanges() );

  t.name = 't4b';

  ok( t.$hasChanges() );

  t.$save();

  ok( t.$hasChanges() );

  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4', done: false } );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'remove', function(assert)
{
  var prefix = 'RekordShard_remove_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 7 );

  var t = Task.fetch( 4 );

  ok( t.$isSaved() );
  strictEqual( t.$status, Rekord.Model.Status.Synced );

  t.$remove();

  strictEqual( t.$status, Rekord.Model.Status.Removed );
  ok( t.$isDeleted() );
  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'remove failure', function(assert)
{
  var prefix = 'RekordShard_remove_failure_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 7 );

  var t = Task.fetch( 4 );

  ok( t.$isSaved() );
  strictEqual( t.$status, Rekord.Model.Status.Synced );

  shards[ 1 ].status = 500;

  t.$remove();

  strictEqual( t.$status, Rekord.Model.Status.RemovePending );
  ok( t.$isDeleted() );
  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4', done: false} );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'remove unknown', function(assert)
{
  var prefix = 'RekordShard_remove_unknown_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model, forRead) {
      return forRead ? shards[ model.id % shards.length ] : false;
    },
    getShards: function(forRead) {
      return forRead ? shards : [];
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  shards[ 1 ].map.put( 4, {id: 4, name: 't4', done: false} );

  expect( 7 );

  var t = Task.fetch( 4 );

  ok( t.$isSaved() );
  strictEqual( t.$status, Rekord.Model.Status.Synced );

  t.$remove();

  strictEqual( t.$status, Rekord.Model.Status.RemovePending );
  ok( t.$isDeleted() );
  deepEqual( shards[ 0 ].map.get( 4 ), void 0 );
  deepEqual( shards[ 1 ].map.get( 4 ), {id: 4, name: 't4', done: false} );
  deepEqual( shards[ 2 ].map.get( 4 ), void 0 );
});

test( 'all', function(assert)
{
  var prefix = 'RekordShard_all_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[1].map.put( 1, {id: 1, name: 't1', done: 0} );
  shards[2].map.put( 2, {id: 2, name: 't2', done: 1} );
  shards[0].map.put( 3, {id: 3, name: 't3', done: 1} );
  shards[1].map.put( 4, {id: 4, name: 't4', done: 0} );

  var Task = Rekord({
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

test( 'all failure', function(assert)
{
  var prefix = 'RekordShard_all_failure_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    ATOMIC_ALL: false,
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[1].map.put( 1, {id: 1, name: 't1', done: 0} );
  shards[2].map.put( 2, {id: 2, name: 't2', done: 1} );
  shards[0].map.put( 3, {id: 3, name: 't3', done: 1} );
  shards[1].map.put( 4, {id: 4, name: 't4', done: 0} );
  shards[1].status = 500;

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder,
    comparator: 'name'
  });

  strictEqual( Task.all().length, 2 );
  strictEqual( Task.all()[0].name, 't2' );
  strictEqual( Task.all()[1].name, 't3' );
});

test( 'initialize override', function(assert)
{
  var prefix = 'RekordShard_initialize_override_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    initialize: function(db) {
      strictEqual( db.name, prefix + '_task', 'database passed' );
    },
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder,
    comparator: 'name'
  });
});

test( 'writer readers', function(assert)
{
  var prefix = 'RekordShard_writer_readers_';

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

  var Task = Rekord({
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

test( 'query default', function(assert)
{
  var prefix = 'RekordShard_query_default_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[0].queries.put( '/done', [{id: 3, name: 't3', done: 1}, {id: 6, name: 't6', done: 1}] );
  shards[1].queries.put( '/done', [{id: 4, name: 't4', done: 1}] );
  shards[2].queries.put( '/done', [] );

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var done = Task.search( '/done' );
  var p = done.$run();
  done.$results.setComparator('name');

  strictEqual( done.$results.length, 3 );
  strictEqual( done.$results[0].name, 't3' );
  strictEqual( done.$results[1].name, 't4' );
  strictEqual( done.$results[2].name, 't6' );
});

test( 'query specific', function(assert)
{
  var prefix = 'RekordShard_query_specific_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    },
    getShardsForQuery: function() {
      return [ shards[0], shards[2] ];
    }
  };

  shards[0].queries.put( '/done', [{id: 3, name: 't3', done: 1}, {id: 6, name: 't6', done: 1}] );
  shards[1].queries.put( '/done', [{id: 4, name: 't4', done: 1}] );
  shards[2].queries.put( '/done', [] );

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var done = Task.search( '/done' );
  var p = done.$run();
  done.$results.setComparator('name');

  strictEqual( done.$results.length, 2 );
  strictEqual( done.$results[0].name, 't3' );
  strictEqual( done.$results[1].name, 't6' );
});

test( 'query failure atomic', function(assert)
{
  var prefix = 'RekordShard_query_failure_atomic_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    ATOMIC_QUERY: true,
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[0].status = 500;
  shards[0].queries.put( '/done', [{id: 3, name: 't3', done: 1}, {id: 6, name: 't6', done: 1}] );
  shards[1].queries.put( '/done', [{id: 4, name: 't4', done: 1}] );
  shards[2].queries.put( '/done', [] );

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var done = Task.search( '/done' );
  var p = done.$run();
  done.$results.setComparator('name');

  strictEqual( done.$results.length, 0 );
});

test( 'query failure not atomic', function(assert)
{
  var prefix = 'RekordShard_query_failure_not_atomic_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    ATOMIC_QUERY: false,
    getShardForModel: function(model) {
      return shards[ model.id % shards.length ];
    },
    getShards: function() {
      return shards;
    }
  };

  shards[0].status = 500;
  shards[0].queries.put( '/done', [{id: 3, name: 't3', done: 1}, {id: 6, name: 't6', done: 1}] );
  shards[1].queries.put( '/done', [{id: 4, name: 't4', done: 1}] );
  shards[2].queries.put( '/done', [] );

  var Task = Rekord({
    name: prefix + '_task',
    fields: ['name', 'done'],
    shard: sharder
  });

  var done = Task.search( '/done' );
  var p = done.$run();
  done.$results.setComparator('name');

  strictEqual( done.$results.length, 1 );
  strictEqual( done.$results[0].name, 't4' );
});

test( 'save multiple (M-N relationships)', function(assert)
{
  var prefix = 'RekordShard_save_multiple_';

  var shards = [
    new TestRest(), new TestRest(), new TestRest()
  ];

  var sharder = {
    getShardsForModel: function(model) {
      if ( !Rekord.isNumber( model.user_id ) || !Rekord.isNumber( model.group_id ) ) {
        return []; // or falsy value
      }
      var ui = model.user_id % shards.length;
      var gi = model.group_id % shards.length;
      if ( ui === gi ) {
        return [ shards[ ui ] ];
      } else {
        return [ shards[ ui ], shards[ gi ] ];
      }
    },
    getShards: function() {
      return shards;
    }
  };

  shards[1].map.put( '1/1', { user_id: 1, group_id: 1, role: 2 } );

  var UserGroup = Rekord({
    name: prefix + 'user_group',
    key: ['user_id', 'group_id'],
    fields: ['role'],
    shard: sharder
  });

  var ug1 = UserGroup.create( { user_id: 1, group_id: 2, role: 3 } );

  ok( ug1.$isSaved() );
  deepEqual( shards[0].map.get( '1/2' ), void 0 );
  deepEqual( shards[1].map.get( '1/2' ), { user_id: 1, group_id: 2, role: 3 } );
  deepEqual( shards[2].map.get( '1/2' ), { user_id: 1, group_id: 2, role: 3 } );

  ug1.role = 4;
  ug1.$save();

  deepEqual( shards[0].map.get( '1/2' ), void 0 );
  deepEqual( shards[1].map.get( '1/2' ), { user_id: 1, group_id: 2, role: 4 } );
  deepEqual( shards[2].map.get( '1/2' ), { user_id: 1, group_id: 2, role: 4 } );

  var ug2 = UserGroup.fetch([1, 1]);
  strictEqual( ug2.role, 2 );

  var ug3 = UserGroup.create( { user_id: 5, group_id: false, role: 5 } );
  notOk( ug3.$isSaved() );
});
