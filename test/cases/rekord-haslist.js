module( 'Rekord hasList' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasList_no_initial_';

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

  var l0 = TaskList.create({name: 'l0'});

  deepEqual( l0.tasks.toArray(), [] );
});

test( 'initial value', function(assert)
{
  var prefix = 'hasList_initial_';

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

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
});

test( 'ninja remove', function(assert)
{
  var prefix = 'hasList_ninja_remove_';

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

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  t1.$remove();

  strictEqual( l0.tasks.length, 2 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t2 );
});

test( 'ninja save sort', function(assert)
{
  var prefix = 'hasList_ninja_save_sort_';

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
        comparator: ['-done', 'created_at']
      }
    }
  });

  var t0 = Task.create({name: 't0', created_at: 1});
  var t1 = Task.create({name: 't1', created_at: 2});
  var t2 = Task.create({name: 't2', created_at: 3});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

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

test( 'auto save parent', function(assert)
{
  var prefix = 'hasList_auto_save_parent_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name']
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

  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0]});

  deepEqual( remote.lastRecord, {
    id: l0.id, name: 'l0',
    tasks: [
      {id: t0.id, name: 't0'}
    ]
  });

  t0.$save( 'name', 't0a' );

  deepEqual( remote.lastRecord, {
    tasks: [
      {id: t0.id, name: 't0a'}
    ]
  });
});
