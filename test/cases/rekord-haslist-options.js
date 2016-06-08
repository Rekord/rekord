module( 'Rekord hasList options' );

test( 'model string', function(assert)
{
  var prefix = 'hasList_model_string_';

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
    hasList: {
      tasks: {
        model: prefix + 'task'
      }
    }
  });

  strictEqual( TaskList.Database.relations.tasks.model, Task );
});

test( 'model reference', function(assert)
{
  var prefix = 'hasList_model_string_';

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
    hasList: {
      tasks: {
        model: Task
      }
    }
  });

  strictEqual( TaskList.Database.relations.tasks.model, Task );
});

test( 'store/save model', function(assert)
{
  var prefix = 'hasList_store_model_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasList: {
      tasks: {
        model: Task
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    tasks: [
      t0.$local,
      t1.$local,
      t2.$local
    ],
    $status: 0,
    $saved: {
      id: l0.id, name: l0.name,
      tasks: [t0.$saved, t1.$saved, t2.$saved]
    }
  });
  deepEqual( remote.lastRecord, {
    id: l0.id, name: l0.name,
    tasks: [t0.$saved, t1.$saved, t2.$saved]
  });
});

test( 'property true', function(assert)
{
  var prefix = 'hasList_property_true_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasList: {
      tasks: {
        model: Task,
        property: true
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  ok( l0.tasks );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
});

test( 'property false', function(assert)
{
  var prefix = 'hasList_property_false_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasList: {
      tasks: {
        model: Task,
        property: false
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( l0.tasks, void 0 );
});

test( 'comparator', function(assert)
{
  var prefix = 'hasList_comparator_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: currentTime() }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasList: {
      tasks: {
        model: Task,
        comparator: ['-done', '-created_at']
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1', done: true});
  var t2 = Task.create({name: 't2', done: false});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  var expected = [t2, t0, t1];

  deepEqual( l0.tasks.toArray(), expected );
});

test( 'comparatorNullsFirst', function(assert)
{
  var prefix = 'hasList_comparatorNullsFirst_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: currentTime() }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasList: {
      tasks: {
        model: Task,
        comparator: ['-done', '-created_at'],
        comparatorNullsFirst: true
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1', done: true});
  var t2 = Task.create({name: 't2', done: false});
  var t3 = Task.create({name: 't3', done: null});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2, t3]});

  var expected = [t3, t2, t0, t1];

  deepEqual( l0.tasks.toArray(), expected );
});
