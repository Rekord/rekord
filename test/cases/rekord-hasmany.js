module( 'Rekord hasMany' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasMany_no_initial_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done'],
    defaults: { done: false },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var l0 = TaskList.create({name: 'l0'});

  deepEqual( l0.tasks.toArray(), [] );
});

test( 'initial value', function(assert)
{
  var prefix = 'hasMany_initial_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done'],
    defaults: { done: false },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
});

test( 'ninja remove', function(assert)
{
  var prefix = 'hasMany_ninja_remove_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done'],
    defaults: { done: false },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  t1.$remove();

  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t2 );
});

test( 'ninja save unrelated', function(assert)
{
  var prefix = 'hasMany_ninja_save_unrelated_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done'],
    defaults: { done: false },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  t1.task_list_id = 4;
  t1.$save();

  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t2 );
});

test( 'ninja save sort', function(assert)
{
  var prefix = 'hasMany_ninja_save_sort_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: currentTime() },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        comparator: ['-done', 'created_at']
      }
    }
  });

  var t0 = Task.create({name: 't0', created_at: 1});
  var t1 = Task.create({name: 't1', created_at: 2});
  var t2 = Task.create({name: 't2', created_at: 3});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  t1.done = true;
  t1.$save();

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t2 );
  strictEqual( l0.tasks[2], t1 );
});

test( 'ninja save add', function(assert)
{
  var prefix = 'hasMany_ninja_save_add_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: currentTime() },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  var t3 = Task.create({name: 't3', task_list_id: l0.id});

  strictEqual( l0.tasks.length, 4 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
  strictEqual( l0.tasks[3], t3 );
});

test( 'set', function(assert)
{
  var prefix = 'hasMany_set_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1]});

  strictEqual( t0.list, l0 );
  strictEqual( t1.list, l0 );
  strictEqual( t2.list, void 0 );
  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );

  notOk( t0.$isDeleted() );
  notOk( t1.$isDeleted() );
  notOk( t2.$isDeleted() );

  l0.$set( 'tasks', [t2, t1] );

  ok( t0.$isDeleted() );
  notOk( t1.$isDeleted() );
  notOk( t2.$isDeleted() );

  strictEqual( t0.list, null );
  strictEqual( t1.list, l0 );
  strictEqual( t2.list, l0 );
});

test( 'relate', function(assert)
{
  var prefix = 'hasMany_relate_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 0 );

  l0.tasks.relate( t0.id );

  strictEqual( l0.tasks.length, 1 );
  strictEqual( l0.tasks[0], t0 );

  l0.tasks.relate( t1 );

  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );

  l0.tasks.relate( [t2] );

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
});

test( 'unrelate', function(assert)
{
  var prefix = 'hasMany_unrelate_';
  var index = 0;
  var nextIndex = function() {
    return index++;
  };

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'index'],
    defaults: { index: nextIndex },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        comparator: 'index'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( l0.tasks.length, 3 );

  l0.tasks.unrelate( t0.id );

  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t1 );
  strictEqual( l0.tasks[1], t2 );

  l0.tasks.unrelate( t1 );

  strictEqual( l0.tasks.length, 1 );
  strictEqual( l0.tasks[0], t2 );

  l0.tasks.unrelate();

  strictEqual( l0.tasks.length, 0 );
});

test( 'unrelateWhere', function(assert)
{
  var prefix = 'hasMany_unrelateWhere_';
  var index = 0;
  var nextIndex = function() {
    return index++;
  };

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'index', 'done'],
    defaults: { index: nextIndex, done: false },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        comparator: 'index'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1', done: true});
  var t2 = Task.create({name: 't2'});
  var t3 = Task.create({name: 't3', done: true});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2, t3]});

  strictEqual( l0.tasks.length, 4 );

  l0.tasks.unrelateWhere('done', true);

  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t2 );

  l0.tasks.unrelateWhere();

  strictEqual( l0.tasks.length, 0 );
});

test( 'isRelated', function(assert)
{
  var prefix = 'hasMany_isRelated_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( l0.tasks.length, 3 );
  ok( l0.tasks.isRelated( t0.id ) );
  ok( l0.tasks.isRelated( t1.id ) );
  ok( l0.tasks.isRelated( t2.id ) );

  l0.tasks.unrelate( t1.id );

  strictEqual( l0.tasks.length, 2 );
  ok( l0.tasks.isRelated( t0.id ) );
  notOk( l0.tasks.isRelated( t1.id ) );
  ok( l0.tasks.isRelated( t2.id ) );
});

test( 'get', function(assert)
{
  var prefix = 'hasMany_get_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  var expected = [t0, t1, t2];

  deepEqual( l0.$get( 'tasks').toArray(), expected );
  strictEqual( l0.$get( 'tasks' ), l0.tasks );
});

test( 'encode', function(assert)
{
  var prefix = 'hasMany_encode_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        save: Rekord.Save.Model,
        store: Rekord.Store.Model
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0]});

  var saving0 = l0.$toJSON( true );
  var storing0 = l0.$toJSON( false );

  deepEqual( saving0, {
    id: l0.id, name: l0.name,
    tasks: [
      {id: t0.id, name: t0.name, task_list_id: l0.id}
    ]
  });

  deepEqual( storing0, {
    id: l0.id, name: l0.name,
    tasks: [
      {id: t0.id, name: t0.name, task_list_id: l0.id,
        $saved: {id: t0.id, name: t0.name, task_list_id: l0.id}, $status: 0
      }
    ]
  });

  l0.tasks.unrelate();

  var saving1 = l0.$toJSON( true );
  var storing1 = l0.$toJSON( false );

  deepEqual( saving1, {
    id: l0.id, name: l0.name,
    tasks: []
  });

  deepEqual( storing1, {
    id: l0.id, name: l0.name,
    tasks: []
  });
});

test( 'auto save parent', function(assert)
{
  var prefix = 'hasMany_auto_save_parent_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        save: Rekord.Save.Model
      }
    }
  });

  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0]});

  deepEqual( remote.lastRecord, {
    id: l0.id, name: 'l0',
    tasks: [
      {id: t0.id, name: 't0', task_list_id: l0.id}
    ]
  });

  t0.$save( 'name', 't0a' );

  deepEqual( remote.lastRecord, {
    tasks: [
      {id: t0.id, name: 't0a', task_list_id: l0.id}
    ]
  });
});

test( 'wait until dependents are saved', function(assert)
{
  var timer = assert.timer();
  var prefix = 'hasMany_wait_dependents_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'created_by']
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'created_by',
        cascadeSave: Rekord.Cascade.All
      }
    }
  });

  var trest = Task.Database.rest;
  var urest = User.Database.rest;

  var t0 = new Task({name: 't0'});
  var t1 = new Task({name: 't1'});
  var u0 = new User({name: 'u0', tasks: [t0, t1]});

  ok( t0.$isSynced() );
  ok( t1.$isSynced() );
  notOk( t0.$isSaved() );
  notOk( t1.$isSaved() );
  notOk( u0.$isSaved() );
  strictEqual( t0.created_by, u0.id );
  strictEqual( t1.created_by, u0.id );

  urest.delay = 2;
  trest.delay = 2;

  User.Database.rest.returnValue = {id: u0.id, tasks: []};

  u0.$save();

  notOk( t0.$isSynced() );
  notOk( t1.$isSynced() );

  notOk( t0.$isSaved(), 'task 0 not saved since user not saved' );
  notOk( t1.$isSaved(), 'task 1 not saved since user not saved' );
  notOk( u0.$isSaved(), 'user not saved' );

  wait(1, function()
  {
    notOk( t0.$isSaved(), 'task 0 not saved since user not saved (2)' );
    notOk( t1.$isSaved(), 'task 1 not saved since user not saved (2)' );
    notOk( u0.$isSaved(), 'user not saved (2)' );
  });

  wait(3, function()
  {
    notOk( t0.$isSaved(), 'task 0 not saved since user not saved (3)' );
    notOk( t1.$isSaved(), 'task 1 not saved since user not saved (3)' );
    ok( u0.$isSaved(), 'user saved' );
  });

  wait(5, function()
  {
    ok( t0.$isSaved(), 'task 0 saved' );
    ok( t1.$isSaved(), 'task 1 saved' );
    ok( u0.$isSaved(), 'user saved' );

    deepEqual( u0.tasks.toArray(), [t0, t1] );
  });

  timer.run();
});

test( 'clone', function(assert)
{
  var prefix = 'hasMany_clone_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: prefix + 'task',
        foreign: 'created_by'
      }
    }
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'created_by'],
    belongsTo: {
      creator: {
        model: prefix + 'user',
        local: 'created_by'
      }
    }
  });

  var u0 = new User({
    name: 'u0',
    tasks: [
      {name: 't0', done: true},
      {name: 't1', done: false},
      {name: 't2', done: true}
    ]
  });

  ok( u0.id );
  strictEqual( u0.tasks.length, 3 );
  isInstance( u0.tasks[0], Task );
  isInstance( u0.tasks[1], Task );
  isInstance( u0.tasks[1], Task );
  strictEqual( u0.tasks[0].created_by, u0.id );
  strictEqual( u0.tasks[1].created_by, u0.id );
  strictEqual( u0.tasks[2].created_by, u0.id );
  strictEqual( u0.tasks[0].creator, u0 );
  strictEqual( u0.tasks[1].creator, u0 );
  strictEqual( u0.tasks[2].creator, u0 );

  var u1 = u0.$clone( {tasks:{}} );

  notOk( u1.$isSaved() );
  notOk( u1.tasks[0].$isSaved() );
  notOk( u1.tasks[1].$isSaved() );
  notOk( u1.tasks[2].$isSaved() );
  ok( u1.id );
  notStrictEqual( u0.id, u1.id );
  strictEqual( u1.tasks.length, 3 );
  isInstance( u1.tasks[0], Task );
  isInstance( u1.tasks[1], Task );
  isInstance( u1.tasks[1], Task );
  strictEqual( u1.tasks[0].created_by, u1.id );
  strictEqual( u1.tasks[1].created_by, u1.id );
  strictEqual( u1.tasks[2].created_by, u1.id );
  strictEqual( u1.tasks[0].creator, u1 );
  strictEqual( u1.tasks[1].creator, u1 );
  strictEqual( u1.tasks[2].creator, u1 );
  notStrictEqual( u0.tasks[0], u1.tasks[0] );
  notStrictEqual( u0.tasks[1], u1.tasks[1] );
  notStrictEqual( u0.tasks[2], u1.tasks[2] );
});

test( 'transfer', function(assert)
{
  var prefix = 'hasMany_transfer';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'list_id']
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'list_id'
      }
    }
  });

  var l0 = TaskList.create({id: 1, name: 'l0'});
  var l1 = TaskList.create({id: 2, name: 'l1'});
  var t0 = Task.create({id: 3, name: 't0', list_id: 1});

  deepEqual( l0.tasks.toArray(), [t0] );
  deepEqual( l1.tasks.toArray(), [] );

  l1.tasks.relate( t0 );

  strictEqual( t0.list_id, 2 );
  deepEqual( l0.tasks.toArray(), [] );
  deepEqual( l1.tasks.toArray(), [t0] );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );
});

test( 'transfer belongsTo', function(assert)
{
  var prefix = 'hasMany_transfer_belongsTo_';
  var TaskName = prefix + 'task';
  var ListName = prefix + 'list';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done', 'list_id'],
    belongsTo: {
      list: {
        model: ListName,
        local: 'list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: ListName,
    fields: ['name'],
    hasMany: {
      tasks: {
        model: TaskName,
        foreign: 'list_id'
      }
    }
  });

  var l0 = TaskList.create({id: 1, name: 'l0'});
  var l1 = TaskList.create({id: 2, name: 'l1'});
  var t0 = Task.create({id: 3, name: 't0', list_id: 1});

  deepEqual( l0.tasks.toArray(), [t0] );
  deepEqual( l1.tasks.toArray(), [] );
  strictEqual( t0.list, l0 );

  l1.tasks.relate( t0 );

  strictEqual( t0.list, l1 );
  strictEqual( t0.list_id, 2 );
  deepEqual( l0.tasks.toArray(), [] );
  deepEqual( l1.tasks.toArray(), [t0] );
  ok( t0.$isSaved() );
  notOk( t0.$isDeleted() );
});

test( 'where', function(assert)
{
  var prefix = 'hasMany_where_';
  var TaskName = prefix + 'task';
  var ListName = prefix + 'list';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done', 'list_id'],
    belongsTo: {
      list: {
        model: ListName,
        local: 'list_id'
      }
    }
  });

  var TaskList = Rekord({
    name: ListName,
    fields: ['name'],
    hasMany: {
      tasks: {
        model: TaskName,
        foreign: 'list_id',
        comparator: 'name',
        where: Rekord.createWhere('done', true)
      }
    }
  });

  var l0 = TaskList.create({name: 'l0'});

  var t0 = Task.create({name: 't0', done: true, list_id: l0.id});
  var t1 = Task.create({name: 't1', done: false, list_id: l0.id});
  var t2 = Task.create({name: 't2', done: true, list_id: l0.id});
  var t3 = Task.create({name: 't3', done: 0, list_id: l0.id});

  strictEqual( l0.tasks.length, 2 );
  deepEqual( l0.tasks.toArray(), [t0, t2] );
});

test( 'relation name', function(assert)
{
  var prefix = 'relation_name_';
  var TaskName = prefix + 'task';
  var ListName = prefix + 'list';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done', ListName + '_id']
  });

  var TaskList = Rekord({
    name: ListName,
    fields: ['name'],
    hasMany: {
      tasks: TaskName
    }
  });

  var l0 = TaskList.create({name: 'l0'});

  var t0 = Task.create({name: 't0', done: true, relation_name_list_id: l0.id});
  var t1 = Task.create({name: 't1', done: false, relation_name_list_id: l0.id});
  var t2 = Task.create({name: 't2', done: true, relation_name_list_id: l0.id});
  var t3 = Task.create({name: 't3', done: 0, relation_name_list_id: l0.id});

  strictEqual( l0.tasks.length, 4 );
});

test( 'relation true', function(assert)
{
  var prefix = 'relation_true_';
  var TaskName = prefix + 'task';
  var ListName = prefix + 'list';

  var Task = Rekord({
    name: TaskName,
    fields: ['name', 'done', ListName + '_id']
  });

  var TaskList = Rekord({
    name: ListName,
    fields: ['name'],
    hasMany: {
      relation_true_task: true
    }
  });

  var l0 = TaskList.create({name: 'l0'});

  var t0 = Task.create({name: 't0', done: true, relation_true_list_id: l0.id});
  var t1 = Task.create({name: 't1', done: false, relation_true_list_id: l0.id});
  var t2 = Task.create({name: 't2', done: true, relation_true_list_id: l0.id});
  var t3 = Task.create({name: 't3', done: 0, relation_true_list_id: l0.id});

  strictEqual( l0.relation_true_task.length, 4 );
});
