module( 'Neuro hasMany options' );

test( 'model string', function(assert)
{
  var prefix = 'hasMany_model_string_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
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
  var prefix = 'hasMany_model_string_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
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
  var prefix = 'hasMany_store_none_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        store: Neuro.Store.None
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
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
  var prefix = 'hasMany_store_model_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        store: Neuro.Store.Model
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
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
  var prefix = 'hasMany_store_key_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        store: Neuro.Store.Key
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
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
  var prefix = 'hasMany_store_keys_';

  var Task = Neuro({
    name: prefix + 'task',
    key: ['id1', 'id2'],
    fields: ['id1', 'id2', 'task_list_id', 'name', 'done'],
    defaults: { done: false },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        store: Neuro.Store.Keys
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({id1: 01, id2: 02, name: 't0'});
  var t1 = Task.create({id1: 11, id2: 12, name: 't1'});
  var t2 = Task.create({id1: 21, id2: 22, name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
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
  var prefix = 'hasMany_save_none_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        save: Neuro.Save.None
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
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
  var prefix = 'hasMany_save_model_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        save: Neuro.Save.Model
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
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

test( 'auto true', function(assert)
{
  var prefix = 'hasMany_auto_true_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        auto: true
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var t0 = Task.create({name: 't0'});
  var l0 = TaskList.create({name: 'l0'});

  strictEqual( t0.list, undefined );
  strictEqual( l0.tasks.length, 0 );

  deepEqual( remote.lastRecord, {id: t0.id, name: t0.name, done: false, task_list_id: undefined} );

  l0.tasks.relate( t0 );

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 1 );

  deepEqual( remote.lastRecord, {task_list_id: l0.id} );
});

test( 'auto false', function(assert)
{
  var prefix = 'hasMany_auto_false_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        auto: false
      }
    }
  });

  var local = Task.Database.store;
  var remote = Task.Database.rest;

  var t0 = Task.create({name: 't0'});
  var l0 = TaskList.create({name: 'l0'});

  strictEqual( t0.list, undefined );
  strictEqual( l0.tasks.length, 0 );

  deepEqual( remote.lastRecord, {id: t0.id, name: t0.name, done: false, task_list_id: undefined} );

  l0.tasks.relate( t0 );

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks.length, 1 );

  deepEqual( remote.lastRecord, {id: t0.id, name: t0.name, done: false, task_list_id: undefined} );
});

test( 'property true', function(assert)
{
  var prefix = 'hasMany_property_true_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
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

  strictEqual( t0.list, l0 );
  ok( l0.tasks );
  strictEqual( l0.tasks.length, 3 );
  strictEqual( l0.tasks[0], t0 );
  strictEqual( l0.tasks[1], t1 );
  strictEqual( l0.tasks[2], t2 );
});

test( 'property false', function(assert)
{
  var prefix = 'hasMany_property_false_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
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

  strictEqual( t0.list, l0 );
  strictEqual( l0.tasks, void 0 );
});

test( 'dynamic true', function(assert)
{
  var prefix = 'hasMany_dynamic_true_';

  var Task = Neuro({
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

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        comparator: 'name',
        property: true,
        dynamic: true
      }
    }
  });

  var local = TaskList.Database.store;
  var remote = TaskList.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var t3 = Task.create({name: 't3'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t0.list, l0 );
  ok( l0.tasks );
  deepEqual( l0.tasks.toArray(), [t0, t1, t2] );
  strictEqual( t3.task_list_id, void 0 );

  l0.tasks = [t1, t3];

  deepEqual( l0.tasks.toArray(), [t1, t3] );
  strictEqual( t3.task_list_id, l0.id );

  ok( t0.$isDeleted() );
  ok( t2.$isDeleted() );
});

test( 'foreign default', function(assert)
{
  var prefix = 'hasMany_foreign_default_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', prefix + 'list_id', 'name', 'done'],
    defaults: { done: false },
    belongsTo: {
      list: {
        model: prefix + 'list'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0]});

  strictEqual( t0.hasMany_foreign_default_list_id, l0.id );
});

test( 'foreign custom', function(assert)
{
  var prefix = 'hasMany_foreign_custom_';

  var Task = Neuro({
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

  var TaskList = Neuro({
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
  var l0 = TaskList.create({name: 'l0', tasks: [t0]});

  strictEqual( t0.task_list_id, l0.id );
});

test( 'comparator', function(assert)
{
  var prefix = 'hasMany_comparator_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: Date.now },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
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
  var prefix = 'hasMany_comparatorNullsFirst_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: Date.now },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
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

test( 'cascadeRemove true', function(assert)
{ 
  var prefix = 'hasMany_cascadeRemove_true_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: Date.now },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        cascadeRemove: true
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  ok( t0.$exists() );
  ok( t1.$exists() );
  ok( t2.$exists() );
  ok( l0.$exists() );

  l0.$remove();

  notOk( t0.$exists() );
  notOk( t1.$exists() );
  notOk( t2.$exists() );
  notOk( l0.$exists() );
});

test( 'cascadeRemove false', function(assert)
{
  var prefix = 'hasMany_cascadeRemove_false_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name', 'done', 'created_at'],
    defaults: { done: false, created_at: Date.now },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id',
        cascade: false
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        cascadeRemove: false
      }
    }
  });

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  ok( t0.$exists() );
  ok( t1.$exists() );
  ok( t2.$exists() );
  ok( l0.$exists() );

  l0.$remove();

  ok( t0.$exists() );
  strictEqual( t0.list, null );
  strictEqual( t0.task_list_id, null );
  ok( t1.$exists() );
  ok( t2.$exists() );
  notOk( l0.$exists() );
});

test( 'cascadeSave true', function(assert)
{
  var prefix = 'hasMany_cascadeSave_true_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    defaults: { done: false, created_at: Date.now },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        cascadeSave: true
      }
    }
  });

  var remote = Task.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t1.$saved.name, 't1' );

  t1.name = 't1a';

  l0.$save();

  strictEqual( t1.$saved.name, 't1a' );
  deepEqual( remote.lastRecord, { name: t1.name });
});


test( 'cascadeSave false', function(assert)
{
  var prefix = 'hasMany_cascadeSave_false_';

  var Task = Neuro({
    name: prefix + 'task',
    fields: ['id', 'task_list_id', 'name'],
    defaults: { done: false, created_at: Date.now },
    belongsTo: {
      list: {
        model: prefix + 'list',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: prefix + 'list',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'task_list_id',
        cascadeSave: false
      }
    }
  });

  var remote = Task.Database.rest;

  var t0 = Task.create({name: 't0'});
  var t1 = Task.create({name: 't1'});
  var t2 = Task.create({name: 't2'});
  var l0 = TaskList.create({name: 'l0', tasks: [t0, t1, t2]});

  strictEqual( t1.$saved.name, 't1' );

  t1.name = 't1a';

  l0.$save();

  strictEqual( t1.$saved.name, 't1' );

  t1.$save();

  strictEqual( t1.$saved.name, 't1a' );
  deepEqual( remote.lastRecord, { name: t1.name });
});
