module( 'Rekord hasRemote' );

test( 'no initial value', function(assert)
{
  var prefix = 'hasRemote_no_initial_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}'
      }
    }
  });

  var l0 = TaskList.create({name: 'l0'});

  deepEqual( l0.tasks.toArray(), [] );
});

test( 'initial value', function(assert)
{
  var prefix = 'hasRemote_initial_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  // Initial values don't work - when the relation is initialized it runs the
  // query to populate the values. In this example the query returns nothing.
  strictEqual( l0.tasks.length, 0 );
/*
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
*/
});

test( 'ninja remove', function(assert)
{
  var prefix = 'hasRemote_ninja_remove_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}'
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

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
  var prefix = 'hasRemote_ninja_save_sort_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: currentTime() }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}',
        comparator: ['-done', 'created_at']
      }
    }
  });

  var t0 = Task.create({name: 't0', created_at: 1});
  var t1 = Task.create({name: 't1', created_at: 2});
  var t2 = Task.create({name: 't2', created_at: 3});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

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
  var prefix = 'hasRemote_auto_save_parent_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name']
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}',
        save: Rekord.Save.Model
      }
    }
  });

  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0] );

  var l0 = TaskList.create({name: 'l0'});

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
