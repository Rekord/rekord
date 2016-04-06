module( 'Rekord hasRemote options' );

test( 'model string', function(assert)
{
  var prefix = 'hasRemote_model_string_';

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
    hasRemote: {
      tasks: {
        model: prefix + 'task',
        foreign: 'task_list_id'
      }
    }
  });

  strictEqual( TaskList.Database.relations.tasks.model, Task );
});

test( 'model reference', function(assert)
{
  var prefix = 'hasRemote_model_string_';

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
    hasRemote: {
      tasks: {
        model: Task,
        foreign: 'task_list_id'
      }
    }
  });

  strictEqual( TaskList.Database.relations.tasks.model, Task );
});

test( 'store none', function(assert)
{
  var prefix = 'hasRemote_store_none_';

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
        query: '/tasks/{name}',
        store: Rekord.Store.None
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: l0.id, name: l0.name
  });
});

test( 'store model', function(assert)
{
  var prefix = 'hasRemote_store_model_';

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
        query: '/tasks/{name}',
        store: Rekord.Store.Model
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name}, $status: 0,
    tasks: [
      t0.$local,
      t1.$local,
      t2.$local
    ]
  });
  deepEqual( remote.lastRecord, {
    id: l0.id, name: l0.name
  });
});

test( 'store key', function(assert)
{
  var prefix = 'hasRemote_store_key_';

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
        query: '/tasks/{name}',
        store: Rekord.Store.Key
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name}, $status: 0,
    tasks: [ t0.id, t1.id, t2.id ]
  });
  deepEqual( remote.lastRecord, {
    id: l0.id, name: l0.name
  });
});

test( 'store keys', function(assert)
{
  var prefix = 'hasRemote_store_keys_';

  var Task = Rekord({
    name: prefix + 'task',
    key: ['id1', 'id2'],
    fields: ['id1', 'id2', 'name', 'done'],
    defaults: { done: false }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}',
        store: Rekord.Store.Keys
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({id1: 01, id2: 02, name: 't0'});
  var t1 = Task.create({id1: 11, id2: 12, name: 't1'});
  var t2 = Task.create({id1: 21, id2: 22, name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name}, $status: 0,
    tasks: [ [t0.id1, t0.id2], [t1.id1, t1.id2], [t2.id1, t2.id2] ]
  });
  deepEqual( remote.lastRecord, {
    id: l0.id, name: l0.name
  });
});

test( 'save none', function(assert)
{
  var prefix = 'hasRemote_save_none_';

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
        query: '/tasks/{name}',
        save: Rekord.Save.None
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: l0.id, name: l0.name
  });
});

test( 'save model', function(assert)
{
  var prefix = 'hasRemote_save_model_';

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
        query: '/tasks/{name}',
        save: Rekord.Save.Model
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name, 
      tasks: [ t0.$saved, t1.$saved, t2.$saved ]
    }, $status: 0
  });

  deepEqual( remote.map.get( l0.id ), {
    id: l0.id, name: l0.name,
    tasks: [ t0.$saved, t1.$saved, t2.$saved ]
  });
});

test( 'save key', function(assert)
{
  var prefix = 'hasRemote_save_key_';

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
        query: '/tasks/{name}',
        save: Rekord.Save.Key
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );

  deepEqual( local.lastRecord, {
    id: l0.id, name: l0.name,
    $saved: {id: l0.id, name: l0.name, 
      tasks: [ t0.id, t1.id, t2.id ]
    }, $status: 0
  });

  deepEqual( remote.map.get( l0.id ), {
    id: l0.id, name: l0.name,
    tasks: [ t0.id, t1.id, t2.id ]
  });
});

test( 'property true', function(assert)
{
  var prefix = 'hasRemote_property_true_';

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
        query: '/tasks/{name}',
        property: true
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  ok( l0.tasks );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
});

test( 'property false', function(assert)
{
  var prefix = 'hasRemote_property_false_';

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
        query: '/tasks/{name}',
        property: false
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks, void 0 );
});

test( 'comparator', function(assert)
{
  var prefix = 'hasRemote_comparator_';

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
        comparator: ['-done', '-created_at']
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1', done: true});
  var t2 = Task.create({name: 't2', done: false});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  var l0 = TaskList.create({name: 'l0'});

  var expected = [t2, t0, t1];

  deepEqual( l0.tasks.toArray(), expected );
});

test( 'comparatorNullsFirst', function(assert)
{
  var prefix = 'hasRemote_comparatorNullsFirst_';

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
        comparator: ['-done', '-created_at'],
        comparatorNullsFirst: true
      }
    }
  });

  var t0 = Task.create({name: 't0', done: false});
  var t1 = Task.create({name: 't1', done: true});
  var t2 = Task.create({name: 't2', done: false});
  var t3 = Task.create({name: 't3', done: null});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2, t3] );

  var l0 = TaskList.create({name: 'l0'});

  var expected = [t3, t2, t0, t1];

  deepEqual( l0.tasks.toArray(), expected );
});

test( 'lazy true', function(assert)
{
  var prefix = 'hasRemote_lazy_true_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    defaults: { done: false, created_at: currentTime() }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}',
        lazy: true
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1] );

  var l0 = TaskList.create({name: 'l0'});

  strictEqual( l0.tasks, void 0 );
  strictEqual( l0.$relations.tasks, void 0 );

  isInstance( l0.$get('tasks'), Rekord.ModelCollection );
  deepEqual( l0.tasks.toArray(), [t0, t1] );
  notStrictEqual( l0.$relations.tasks, void 0 );
});

test( 'lazy false', function(assert)
{
  var prefix = 'hasRemote_lazy_false_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    defaults: { done: false, created_at: currentTime() }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}',
        lazy: false
      }
    }
  });
  
  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1] );

  var l0 = TaskList.create({name: 'l0'});

  isInstance( l0.$get('tasks'), Rekord.ModelCollection );
  deepEqual( l0.tasks.toArray(), [t0, t1] );
  notStrictEqual( l0.$relations.tasks, void 0 );
});

test( 'autoRefresh', function(assert)
{
  var prefix = 'hasRemote_autoRefresh_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['id', 'name'],
    defaults: { done: false, created_at: currentTime() }
  });

  var TaskList = Rekord({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasRemote: {
      tasks: {
        model: Task,
        query: '/tasks/{name}',
        autoRefresh: Rekord.Model.Events.RemoteGets
      }
    }
  });
  
  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1] );

  var l0 = TaskList.create({name: 'l0'});

  deepEqual( l0.tasks.toArray(), [t0, t1] );

  Task.Database.rest.queries.put( '/tasks/l0', [t0, t1, t2] );

  l0.$refresh();

  deepEqual( l0.tasks.toArray(), [t0, t1, t2] );

  isInstance( l0.$relations.tasks.query, Rekord.RemoteQuery, 'query exists' );
});