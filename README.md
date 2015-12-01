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

**Simple Example**
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
var t = Todo.create({
  name: 'Use Neurosync'
});

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
if ( t.$isDeleted() ) {
  
}

// Get reference to todos array (this reference doesn't change)
var todos = Todo.all();

// Listen for database changes
Todo.Database.on('updated', function() {
  // Todos added, updated, or removed
});

// Get a specific model and listen for it's changes
var existing = Todo.get('some-uuid');
existing.on('saved', function() { ... });
existing.on('removed', function() { ... });

```
