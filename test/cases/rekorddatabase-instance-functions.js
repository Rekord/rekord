
module( 'Rekord.Database instance functions' );

test( 'parseModel', function(assert)
{
  var parseModel = Rekord({
    name: 'parseModel',
    fields: ['id', 'name']
  });

  var db = parseModel.Database;

  var p0 = parseModel.create({id: 4, name: 'name0'});
  var p1 = parseModel.create({id: 5, name: 'name1'});

  strictEqual( parseModel.all().length, 2 );

  strictEqual( null, db.parseModel() );
  strictEqual( null, db.parseModel( null ) );
  strictEqual( null, db.parseModel( void 0 ) );
  strictEqual( p0, db.parseModel( p0 ) );
  strictEqual( p1, db.parseModel( 5 ) );
  strictEqual( p1, db.parseModel( {id:5} ) );
  strictEqual( null, db.parseModel( 34 ) );

  var p2 = db.parseModel( {id: 6, name: 'name2'} );

  isInstance( p2, parseModel );

  strictEqual( parseModel.all().length, 2 );

  var p3 = new parseModel({id: 7, name: 'name3'});

  strictEqual( parseModel.all().length, 2 );

  db.parseModel( p3 );

  strictEqual( parseModel.all().length, 2 );

  var p4 = db.parseModel( parseModel );

  isInstance( p4, parseModel );
});

test( 'remove key default', function(assert)
{
  var remove_key_default = Rekord({
    name: 'remove_key_default',
    fields: ['id', 'name']
  });

  var db = remove_key_default.Database;

  var r0 = remove_key_default.create({name: 'name0'});

  notStrictEqual( r0.id, void 0 );

  db.keyHandler.removeKey( r0 );

  strictEqual( r0.id, void 0 );
});

test( 'remove key prop', function(assert)
{
  var remove_key_prop = Rekord({
    name: 'remove_key_prop',
    key: 'key',
    fields: ['key', 'name']
  });

  var db = remove_key_prop.Database;

  var r0 = remove_key_prop.create({name: 'name0'});

  notStrictEqual( r0.key, void 0 );

  db.keyHandler.removeKey( r0 );

  strictEqual( r0.key, void 0 );
});

test( 'remove key props', function(assert)
{
  var remove_key_props = Rekord({
    name: 'remove_key_props',
    key: ['subject_id', 'object_id'],
    fields: ['subject_id', 'object_id', 'name']
  });

  var db = remove_key_props.Database;

  var r0 = remove_key_props.create({subject_id: 4, object_id: 5, name: 'name0'});

  notStrictEqual( r0.subject_id, void 0 );
  notStrictEqual( r0.object_id, void 0 );

  db.keyHandler.removeKey( r0 );

  strictEqual( r0.subject_id, void 0 );
  strictEqual( r0.object_id, void 0 );
});

test( 'buildKey', function(assert)
{
  var buildKey = Rekord({
    name: 'buildKey',
    fields: ['id', 'name', 'age']
  });

  var db = buildKey.Database;

  var b0 = buildKey.create({id: 6, name: 'name0', age: 1});

  strictEqual( db.keyHandler.buildKey( b0 ), 6 );
});

test( 'buildKey with relationships', function(assert)
{
  var prefix = 'buildKey_with_relationships_';

  var ItemName = prefix + 'item';
  var ListName = prefix + 'list';
  var ListItemName = prefix + 'list_item';

  var Item = Rekord({
    name: ItemName,
    fields: ['name']
  });

  var List = Rekord({
    name: ListName,
    fields: ['name']
  });

  var ListItem = Rekord({
    name: ListItemName,
    key: ['list_id', 'item_id'],
    fields: ['amount'],
    belongsTo: {
      list: {
        model: List,
        local: 'list_id'
      },
      item: {
        model: Item,
        local: 'item_id'
      }
    }
  });

  var l0 = List.create({id: 3, name: 'l0'});
  var i0 = Item.create({id: 4, name: 'i0'});

  var input = {
    list: l0,
    item: i0,
    amount: 24
  };

  var key = ListItem.Database.keyHandler.buildKeyFromInput(input);

  strictEqual( key, '3/4' );
  strictEqual( input.list_id, 3 );
  strictEqual( input.item_id, 4 );

  var created = ListItem.create(input);
  var gotten = ListItem.get({list: l0, item: i0});

  strictEqual( created, gotten );
});

test( 'buildKeys', function(assert)
{
  var buildKeys = Rekord({
    name: 'buildKeys',
    key: ['id', 'name'],
    fields: ['age']
  });

  var db = buildKeys.Database;

  var b0 = buildKeys.create({id: 6, name: 'name0', age: 1});

  deepEqual( db.keyHandler.getKeys( b0 ), [6, 'name0'] );
});

test( 'buildKeyFromInput', function(assert)
{
  var buildKeyFromInput = Rekord({
    name: 'buildKeyFromInput',
    fields: ['id', 'name']
  });

  var db = buildKeyFromInput.Database;

  var i0 = buildKeyFromInput.create({id: 89, name: 'name0'});
  var i1 = [1, 2];
  var i2 = {id: 34};
  var i3 = 'uuid';

  var e0 = 89;
  var e1 = '1/2';
  var e2 = 34;
  var e3 = 'uuid';

  strictEqual( db.keyHandler.buildKeyFromInput( i0 ), e0 );
  strictEqual( db.keyHandler.buildKeyFromInput( i1 ), e1 );
  strictEqual( db.keyHandler.buildKeyFromInput( i2 ), e2 );
  strictEqual( db.keyHandler.buildKeyFromInput( i3 ), e3 );
});

test( 'setRevision', function(assert)
{
  var Todo = Rekord({
    name: 'setRevision_todo',
    fields: ['id', 'name', 'done', 'updated_at', 'created_at'],
    defaults: {
      name: null,
      done: false,
      updated_at: currentTime(),
      created_at: currentTime()
    }
  });

  var db = Todo.Database;

  isType( db.revisionFunction, 'function' );

  var t0 = Todo.create({
    name: 'todo0'
  });

  strictEqual( t0.done, false );

  Rekord.live.setRevision_todo.liveSave({
    id: t0.id,
    done: true,
    updated_at: currentTime()() + 100
  });

  strictEqual( t0.done, true );

  Rekord.live.setRevision_todo.liveSave({
    id: t0.id,
    done: false,
    updated_at: currentTime()() - 100
  });

  strictEqual( t0.done, false );

  db.setRevision( 'updated_at' );

   Rekord.live.setRevision_todo.liveSave({
    id: t0.id,
    done: true,
    updated_at: currentTime()() - 200
  });

  strictEqual( t0.done, false );
});

test( 'sort', function(assert)
{
  var sort = Rekord({
    name: 'sort',
    fields: ['id', 'age'],
    comparator: 'age'
  });

  var db = sort.Database;

  var s0 = sort.create({age: 4});
  var s1 = sort.create({age: 5});
  var s2 = sort.create({age: 3});

  var expected0 = [s2, s0, s1];

  ok( Rekord.equals( sort.all().toArray(), expected0 ) );

  s1.age = 2;

  ok( Rekord.equals( sort.all().toArray(), expected0 ) );

  notOk( db.isSorted() );

  db.sort();

  var expected1 = [s1, s2, s0];

  ok( Rekord.equals( sort.all().toArray(), expected1 ) );
});

test( 'setComparator', function(assert)
{
  var setComparator = Rekord({
    name: 'setComparator',
    fields: ['id', 'name'],
    comparator: 'id'
  });

  var db = setComparator.Database;

  var s0 = setComparator.create({id: 1, name: 'name0'});
  var s1 = setComparator.create({id: 3, name: null});
  var s2 = setComparator.create({id: 2, name: 'name1'});

  var expected0 = [s0, s2, s1];

  ok( Rekord.equals( setComparator.all().toArray(), expected0 ) );

  db.setComparator( '-name', true );

  var expected1 = [s1, s2, s0];

  ok( Rekord.equals( setComparator.all().toArray(), expected1 ) );
});

test( 'refresh', function(assert)
{
  var rest = Rekord.rest.refresh = new TestRest();
  rest.map.put( 2, {id: 2, name: 'name2'} );
  rest.map.put( 3, {id: 3, name: 'name3'} );

  var refresh = Rekord({
    name: 'refresh',
    fields: ['id', 'name']
  });

  var db = refresh.Database;

  strictEqual( refresh.all().length, 2 );

  rest.map.put( 4, {id: 4, name: 'name4'} );
  rest.map.put( 2, {id: 2, name: 'name2b'} );

  strictEqual( refresh.all().length, 2 );

  db.refresh();

  strictEqual( refresh.all().length, 3 );
});

test( 'refresh callback', function(assert)
{
  var timer = assert.timer();

  var rest = Rekord.rest.refresh_callback = new TestRest();
  rest.map.put( 2, {id: 2, name: 'name2'} );
  rest.map.put( 3, {id: 3, name: 'name3'} );

  var refresh = Rekord({
    name: 'refresh_callback',
    fields: ['id', 'name']
  });

  var db = refresh.Database;

  expect( 4 );

  strictEqual( refresh.all().length, 2 );

  rest.delay = 1;
  rest.map.put( 4, {id: 4, name: 'name4'} );
  rest.map.put( 2, {id: 2, name: 'name2b'} );

  strictEqual( refresh.all().length, 2 );

  var context = {d: 34};

  var onRefresh = function(all)
  {
    strictEqual( context, this );
    strictEqual( all.length, 3 );
  };

  db.refresh( onRefresh, context );

  timer.run();
});

test( 'refresh relationships', function(assert)
{
  var prefix = 'RekordDatabase_refresh_relationships_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['list_id', 'name', 'done'],
    defaults: { done: false },
    cache: Rekord.Cache.None,
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'list_id'
      }
    },
    toString: function(task) {
      return task.name;
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: prefix + 'task',
        foreign: 'list_id',
        save: Rekord.Save.Model,
        store: Rekord.Store.Model,
        comparator: 'name'
      }
    },
    toString: function(list) {
      return list.name;
    }
  });

  var remoteTasks = Task.Database.rest;
  var localTasks = Task.Database.store;
  var db = TaskList.Database;
  var remote = db.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks:[t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( t1.list, l0 );
  strictEqual( t2.list, l0 );

  remote.map.put( l0.id, {
    id: l0.id,
    name: l0.name,
    tasks: [
      {
        id: t1.id, list_id: l0.id, name: t1.name, done: true
      },
      {
        id: t2.id, list_id: l0.id, name: t2.name, done: false
      },
      {
        id: 45, list_id: l0.id, name: 't3', done: true
      },
      {
        id: 46, list_id: l0.id, name: 't4', done: false
      }
    ]
  });

  remoteTasks.lastModel = remoteTasks.lastRecord = null;

  strictEqual( Task.all().length, 3 );

  db.refresh();

  ok( t0.$isDeleted() );
  notOk( t1.$isDeleted() );
  notOk( t2.$isDeleted() );

  strictEqual( l0.tasks.length, 4 );
  strictEqual( l0.tasks[0], t1 );
  strictEqual( l0.tasks[1], t2 );

  strictEqual( l0.tasks[0].done, true );
  strictEqual( l0.tasks[1].done, false );
  strictEqual( l0.tasks[2].name, 't3' );
  strictEqual( l0.tasks[3].name, 't4' );

  strictEqual( Task.all().length, 4 );
  strictEqual( remoteTasks.lastModel, null, 'not removed remotely' );
  strictEqual( remoteTasks.lastRecord, null );
});

test( 'getModel', function(assert)
{
  var getModel = Rekord({
    name: 'getModel',
    fields: ['id', 'name']
  });

  var db = getModel.Database;

  getModel.create({id: 1, name: 'name1'});
  getModel.create({id: 2, name: 'name2'});
  getModel.create({id: 3, name: 'name3'});

  strictEqual( getModel.all().length, 3 );

  strictEqual( db.get(2).name, 'name2' );
  strictEqual( db.get([3]).name, 'name3' );

  strictEqual( db.get(4), void 0 );
  strictEqual( db.get(23), void 0 );
});

test( 'change', function(assert)
{
  var change = Rekord({
    name: 'change',
    fields: ['id', 'name']
  });

  var db = change.Database;

  expect(2);

  var off = db.change(function()
  {
    notOk();
  });

  db.updated();
  db.updated();

  off();

  db.updated();

});

test( 'override refresh', function(assert)
{
  var prefix = 'override_refresh_';

  var TaskName = prefix + 'task';
  var TaskRest = Rekord.rest[ TaskName ] = new TestRest();

  TaskRest.queries.put('/url', [
    {id: 1, name: 't0', done: false},
    {id: 2, name: 't1', done: false}
  ]);

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done'],
    executeRefresh: function(success, failure) {
      this.rest.query('/url', {}, success, failure);
    }
  });

  var t0 = Task.get(1);
  var t1 = Task.get(2);

  ok( t0 );
  ok( t1 );
  strictEqual( Task.all().length, 2 );
  strictEqual( t0.name, 't0' );
  strictEqual( t1.name, 't1' );
});

test( 'setStoreEnabled', function(assert)
{
  var prefix = 'setStoreEnabled_';
  var TaskName = prefix + 'task';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done']
  });

  var TaskStore = Task.Database.store;

  var t1 = Task.create({id: 1, name: 't1', done: true});

  deepEqual( TaskStore.map.get(1), {id: 1, name: 't1', done: true, $status: 0, $saved: {id: 1, name: 't1', done: true}});

  Task.Database.setStoreEnabled( false );

  t1.done = false;
  t1.$save();

  deepEqual( TaskStore.map.get(1), {id: 1, name: 't1', done: true, $status: 0, $saved: {id: 1, name: 't1', done: true}});

  Task.Database.setStoreEnabled( true );

  t1.name = 't2';
  t1.$save();

  deepEqual( TaskStore.map.get(1), {id: 1, name: 't2', done: false, $status: 0, $saved: {id: 1, name: 't2', done: false}});

  Task.Database.setStoreEnabled( false );

  t1.name = 't3';
  t1.$save();

  deepEqual( TaskStore.map.get(1), {id: 1, name: 't2', done: false, $status: 0, $saved: {id: 1, name: 't2', done: false}});

  Task.Database.setStoreEnabled( true );

  t1.name = 't4';
  t1.$save();

  deepEqual( TaskStore.map.get(1), {id: 1, name: 't4', done: false, $status: 0, $saved: {id: 1, name: 't4', done: false}});
});

test( 'setRestEnabled', function(assert)
{
  var prefix = 'setRestEnabled_';
  var TaskName = prefix + 'task';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done']
  });

  var TaskRest = Task.Database.rest;

  var t1 = Task.create({id: 1, name: 't1', done: true});

  deepEqual( TaskRest.map.get(1), {id: 1, name: 't1', done: true});

  Task.Database.setRestEnabled( false );

  t1.done = false;
  t1.$save();

  deepEqual( TaskRest.map.get(1), {id: 1, name: 't1', done: true});

  Task.Database.setRestEnabled( true );

  t1.name = 't2';
  t1.$save();

  deepEqual( TaskRest.map.get(1), {id: 1, name: 't2', done: true});

  Task.Database.setRestEnabled( false );

  t1.name = 't3';
  t1.$save();

  deepEqual( TaskRest.map.get(1), {id: 1, name: 't2', done: true});

  Task.Database.setRestEnabled( true );

  t1.name = 't4';
  t1.$save();

  deepEqual( TaskRest.map.get(1), {id: 1, name: 't4', done: true});
});

test( 'setLiveEnabled', function(assert)
{
  var prefix = 'setLiveEnabled_';
  var TaskName = prefix + 'task';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done']
  });

  var TaskLive = Task.Database.live;

  var t1 = Task.create({id: 1, name: 't1', done: true});

  deepEqual( TaskLive.lastMessage.model, {id: 1, name: 't1', done: true});

  Task.Database.setLiveEnabled( false );

  t1.done = false;
  t1.$save();

  deepEqual( TaskLive.lastMessage.model, {id: 1, name: 't1', done: true});

  Task.Database.setLiveEnabled( true );

  t1.name = 't2';
  t1.$save();

  deepEqual( TaskLive.lastMessage.model, {name: 't2'});

  Task.Database.setLiveEnabled( false );

  t1.name = 't3';
  t1.$save();

  deepEqual( TaskLive.lastMessage.model, {name: 't2'});

  Task.Database.setLiveEnabled( true );

  t1.name = 't4';
  t1.$save();

  deepEqual( TaskLive.lastMessage.model, {name: 't4'});
});

test( 'clear', function(assert)
{
  var prefix = 'Database_clear_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name']
  });

  deepEqual( Task.Database.all, {} );
  strictEqual( Task.all().length, 0 );

  var t0 = new Task({id: 2, name: 't0'});

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 0 );
  strictEqual( Task.Database.store.map.size(), 0 );

  t0.$save();

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 1 );

  Task.Database.clear( false );

  deepEqual( Task.Database.all, {} );
  strictEqual( Task.all().length, 0 );
  strictEqual( Task.Database.store.map.size(), 1 );
});

test( 'reset_success', function(assert)
{
  var prefix = 'Database_reset_success_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name']
  });

  deepEqual( Task.Database.all, {} );
  strictEqual( Task.all().length, 0 );

  var t0 = new Task({id: 2, name: 't0'});

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 0 );
  strictEqual( Task.Database.store.map.size(), 0 );

  t0.$save();

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 1 );

  var promise = Task.Database.reset( false, false );

  deepEqual( Task.Database.all, {} );
  strictEqual( Task.all().length, 0 );
  strictEqual( Task.Database.store.map.size(), 0 );

  ok( promise.isSuccess() );
});

test( 'reset_failure', function(assert)
{
  var prefix = 'Database_reset_failure_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name']
  });

  deepEqual( Task.Database.all, {} );
  strictEqual( Task.all().length, 0 );

  var t0 = new Task({id: 2, name: 't0'});

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 0 );
  strictEqual( Task.Database.store.map.size(), 0 );

  offline();

  t0.$save();

  ok( t0.$isPending() );

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 1 );
  strictEqual( Task.Database.store.map.size(), 1 );

  var promise = Task.Database.reset( true, false );

  deepEqual( Task.Database.all, {2: t0} );
  strictEqual( Task.all().length, 1 );
  strictEqual( Task.Database.store.map.size(), 1 );

  notOk( promise.isSuccess() );
  ok( promise.isFailure() );

  online();
});
