**Simple Todo Example**
```javascript
var Todo = Rekord({
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

var t0 = Todo.create({name: 'Download Rekord'});
t0.$isSaved(); // true
t0.finish( true );
t0.done; // true
t0.$remove();

var t1 = new Todo({name: 'Use Rekord'});
t1.$isSaved(); // false
t1.id; // UUID
t1.$save();

var t2 = Todo.boot({id: 34, name: 'Profit'}); // Todo data that already exists remotely
t2.$isSaved(); // true
t2.name = '???';
t2.$hasChanges(); // true

var t3 = Todo.fetch(45); // REST call if doesn't exist locally

Todo.all(); // [t1, t2, t3]

Todo.collect(t1, t2); // creates a collection of todos

var allRemote = Todo.fetchAll(function(all) {}); // call REST API

var f0 = Todo.find('name', 'Download Rekord'); // first match
var f1 = Todo.find({done: true});

var w0 = Todo.filtered('done', true); // all done todos
var w1 = Todo.filtered({finished_at: null});

var g0 = Todo.get(34); // get cached version

var g1 = Todo.grab(34); // get cached version, otherwise call REST API
var a0 = Todo.grabAll(function(all) {}); // get all cached, if none cached call REST API

Todo.ready(function() {}); // when it has been initialized locally and/or remotely (depends on options).

Todo.refresh(); // re-fetch from REST API

var search0 = Todo.search({done: true}); // sends a search to the REST API (POST by default)

var searchPaged0 = Todo.searchPaged({done: true, page_offset: 0, page_size: 20});
searchPaged0.$next();
```

**Less Simple Task List Example**
```javascript
var User = Rekord({
  name: 'user',
  api: '/api/1.0/user/',
  fields: ['name', 'email'],
  load: Rekord.Load.None,
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

var Task = Rekord({
  name: 'task',
  api: '/api/1.0/task/',
  fields: ['task_list_id', 'name', 'done', 'created_by', 'assigned_to'],
  defaults: { done: false },
  timestamps: true,
  load: Rekord.Load.None,
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

var TaskList = Rekord({
  name: 'task_list',
  api: '/api/1.0/task_list/',
  fields: ['name'],
  timestamps: true,
  hasMany: {
    tasks: {
      model: 'Task'
      save: Rekord.Save.Model,
      store: Rekord.Store.Model
    }
  }
});

var t0 = Task.create({name: 'Task#0'});
var t1 = new Task({name: 'Task#1'});
var l0 = TaskList.create({name: 'List#1', tasks: [
  t0, t1, {name: 'Task #2'}
]});

```
