# Neurosync

A javascript library for creating applications that work offline and in real-time.

Neurosync is a client-side ORM that saves data locally, attempts to save remotely, and when successful it publishes any changes to a pubsub channel for other applications to see.

The real-time feature ensures local changes are not lost - and any conflicts
causes events to be thrown.

### Simple Example

```javascript
// Setup a new type
var Todo = Neuro({

  // Local Storage
  name: 'todos',

  // Rest
  api: 'http://yourwebsite.com/api/1.0/todos/',
  
  // Real-time
  pubsub: 'http://yourwebsite.com:3000',
  channel: 'todos',
  token: 'a_valid_token', 

  // Definition
  className: 'Todo',
  key: 'id',
  fields: ['id', 'name', 'done', 'created_at', 'updated_at'],
  defaults: {
    done: false,
    created_at: Date.now,
    updated_at: Date.now
  },

  // Sort Todo.Database by this field (function can also be used)
  comparator: '-created_at'
});

// Create an instance
var t = new Todo.Model({
  name: 'Use Neurosync'
});
t.$save();

// Update an instance
t.name = 'Using Neurosync';
// or
t.$set('updated_at', Date.now());
// or
t.$set({
  done: true
});
// finally
t.$save();

// Checking whether an instance has been saved via REST
if ( t.$isSaved() ) {
  
}

// Checking whether an instance has unsaved changes
if ( t.$hasChanges() ) {
  
}

// Removing an instance
t.$remove()

// Checking if an instance has been removed
if ( t.$deleted ) {
  
}

// Get reference to todos array (this reference doesn't change)
var todos = Todo.Database.getModels()

// Listen for database changes
Todo.Database.on('updated', function() {
  // Todos added, updated, or removed
});

// Get a specific model and listen for it's changes
var existing = Todo.Database.getModel('some-uuid');
existing.on('saved', function() { ... });
existing.on('removed', function() { ... });

```