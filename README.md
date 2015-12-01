# Neurosync

[![Build Status](https://travis-ci.org/ClickerMonkey/neurosync.svg?branch=master)](https://travis-ci.org/ClickerMonkey/neurosync)
[![devDependency Status](https://david-dm.org/ClickerMonkey/neurosync/dev-status.svg)](https://david-dm.org/ClickerMonkey/neurosync#info=devDependencies)
[![Dependency Status](https://david-dm.org/ClickerMonkey/neurosync.svg)](https://david-dm.org/ClickerMonkey/neurosync)

Neurosync is a javascript ORM that is offline & real-time capable.

**Neurosync's life-cycle is simple:**
- Save pending changes to local storage
- Make REST call
- If REST call succeeds: remove pending changes, mark as saved, publish to real-time API
- If REST call fails because application is offline, wait until application comes back online to proceed with changes
- If the application restarts with pending operations, they will be resumed

**Features**
- Stores data locally through `Neuro.store` interface (ex: https://github.com/ClickerMonkey/neurosync-storkjs)
- Stores data remotely through `Neuro.rest` interface (ex: https://github.com/ClickerMonkey/neurosync-angular)
- Publishes changes through `Neuro.live` interface (ex: https://github.com/ClickerMonkey/neurosync-pubsub)
- Relationships `hasOne`, `belongsTo`, `hasMany`, & `hasManyThrough`
- Polymorphic relationships for `hasOne`, `belongsTo` & `hasMany`
- Extend an existing model
- Look at a subset of models with `model.where( properties to match or custom function )`
- Query REST API with `model.query( URL or HTTP options )`
- Fetch a single model from the REST API with `model.fetch( key )`
- Load bootstrapped data with `model.boot( model or array of models )`
- Supports composite keys
- Specify default values
- Handle collisions with a "revision" field
- Automatically refresh when application becomes online
- Cache all data or only pending changes
- Send only changed values to REST/real-time APIs or entire object
- Convert values between client & server data types
- Easily order by field, combination of fields, or custom function
- Control what information from relationships (if any) is stored locally or sent to the REST api
- Add `updated_at` and `created_at` timestamps and their automatic behavior with a single option
- Add custom methods to the model objects
- Add global event listeners to the "database" or all model instances
- Add dynamic fields to model objects (setting & getting)
- Create a live filtered view of any collection
- Create a live paginated view of any collection
- All collections have the following operations: filter, subtract, intersect, complement, removeWhere, min, max, first, last, sum, avg, count, pluck, reduce, random, chunk, where, & group
- Model collections have the following operations: removeWhere, update, & updateWhere

**Simple Todo Example**
```javascript
var Todo = Neuro({
  name: 'todo',
  api: '/api/1.0/todo/',
  fields: ['name', 'finished_at'],
  timestamps: true,
  comparator: ['-finished_at', '-created_at'], // finished go to bottom, most recently created are at the top
  methods: {
    finish: function(finished) {
      this.$save('finished_at', finished ? Date.now() null);
    }
  },
  dynamic: {
    done: function() {
      return !this.finished_at;
    }
  }
});

var t0 = Todo.create({name: 'Download Neurosync'});
t0.$isSaved(); // true
t0.finish( true );
t0.done; // true
t0.$remove();

var t1 = new Todo({name: 'Use Neurosync'});
t1.$isSaved(); // false
t1.id; // undefined
t1.$save();

var t2 = Todo.boot({id: 34, name: 'Profit'});
t2.$isSaved(); // true
t2.name = '???';
t2.$hasChanges(); // true

var t3 = Todo.fetch(45);

Todo.all(); // [t1, t2, t3]
```

**Less Simple Task List Example**
```javascript
var User = Neuro({
  name: 'user',
  api: '/api/1.0/user/',
  fields: ['name', 'email'],
  loadRemote: false,
  hasMany: {
    created: {
      model: 'Task',
      foreign: 'created_by'
    },
    tasks: {
      model: 'Task',
      foreign: 'assigned_to'
    }
  }
);

var Task = Neuro({
  name: 'task',
  api: '/api/1.0/task/',
  fields: ['task_list_id', 'name', 'done', 'created_by', 'assigned_to'],
  defaults: { done: false },
  timestamps: true,
  loadRemote: false,
  belongsTo: {
    creator: {
      model: 'User',
      local: 'created_by',
      cascade: false
    },
    assignee: {
      model: 'User',
      local: 'assigned_to',
      cascade: false
    },
    list: {
      model: 'TaskList'
    }
  }
});

var TaskList = Neuro({
  name: 'task_list',
  api: '/api/1.0/task_list/',
  fields: ['name'],
  timestamps: true,
  hasMany: {
    tasks: {
      model: 'Task'
      save: Neuro.Save.Model,
      store: Neuro.Store.Model
    }
  }
});

var t0 = Task.create({name: 'Task#0'});
var t1 = new Task({name: 'Task#1'});
var l0 = TaskList.create({name: 'List#1', tasks: [
  t0, t1, {name: 'Task #2'}
]});

```
