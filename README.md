# ![Logo](https://avatars2.githubusercontent.com/u/18293077?v=3&s=100) Rekord

[![Build Status](https://travis-ci.org/Rekord/rekord.svg?branch=master)](https://travis-ci.org/Rekord/rekord)
[![devDependency Status](https://david-dm.org/Rekord/rekord/dev-status.svg)](https://david-dm.org/Rekord/rekord#info=devDependencies)
[![Dependency Status](https://david-dm.org/Rekord/rekord.svg)](https://david-dm.org/Rekord/rekord)

Rekord is a javascript ORM that is offline & real-time capable.

*ORM you say?* Rekord doesn't do anything crazy directly with a database - the database to Rekord is a facade typically backed by a REST API. It's an ORM in the sense that it handles creating, updating, and deleting relational data to any degree you wish.

**Installation**

The easiest way to install rekord is through bower via `bower install rekord`.

**Rekord's life-cycle is simple:**
- Save pending changes to local storage
- Make REST call
- If REST call succeeds: remove pending changes, mark as saved, publish to real-time API
- If REST call fails because application is offline, wait until application comes back online to proceed with changes
- If the application restarts with pending operations, they will be resumed

**Restrictions**

One minor restriction currently exists - id has to be supplied upon instance creation otherwise a UUID is generated and must be used as the ID of the instance.

**Features**
- Stores data locally through `Rekord.store` interface (ex: [rekord-storkjs](https://github.com/Rekord/rekord-storkjs))
- Stores data remotely through `Rekord.rest` interface (ex: [rekord-angular](https://github.com/Rekord/rekord-angular) or [rekord-jquery](https://github.com/Rekord/rekord-jquery))
- Publishes changes through `Rekord.live` interface (ex: [rekord-pubsub](https://github.com/Rekord/rekord-pubsub))
- Relationships `hasOne`, `belongsTo`, `hasMany`, `hasManyThrough`, & `hasRemote`
- Polymorphic relationships for `hasOne`, `belongsTo` & `hasMany`
- Extend an existing model
- Horizontal scaling with sharding
- Look at a subset of models with `model.filtered( properties to match or custom function )`
- Query REST API with `model.query( URL or HTTP options )`
- Fetch a single model from the REST API with `model.fetch( key )`
- Load bootstrapped data with `model.boot( model or array of models )`
- Execute searches (fields are sent to REST API and an array of models is expected)
- Execute paginated searches
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
- Data returned from REST calls or real-time events is intelligibly merged to avoid overwriting local unsaved changes  
- Create a live filtered view of any collection
- Create a live paginated view of any collection
- All collections have the following operations: filter, subtract, intersect, complement, removeWhere, min, max, first, last, sum, avg, count, pluck, reduce, random, chunk, where, & group
- Model collections have the following operations: removeWhere, update, & updateWhere

**Bindings**  
Bindings are used to implement core pieces of functionality in rekord - these interfaces allows any library to work with rekord.

- [Angular](https://github.com/Rekord/rekord-angular) - implements `Rekord.rest`
- [StorkJS](https://github.com/Rekord/rekord-storkjs) - implements `Rekord.store`
- [PubSub](https://github.com/Rekord/rekord-pubsub) - implements `Rekord.live`
- [Firebase](https://github.com/Rekord/rekord-firebase) - implements `Rekord.store`, `Rekord.rest`, & `Rekord.live`
- [PouchDB](https://github.com/Rekord/rekord-pouchdb) - implements `Rekord.store`, `Rekord.rest`, & `Rekord.live`
- [jQuery](https://github.com/Rekord/rekord-jquery) - implements `Rekord.rest`
- [Debugging](https://github.com/Rekord/rekord-debug) - implements `Rekord.debug`

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

var Task = Rekord({
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

**Rekord Options**

Defaults can be overridden by changing `Rekord.Database.Defaults`

```javascript
var ModelClass = Rekord({

  // (string) [required] The name of the type. Equivalent to the table name for a database. This can be used to
  // reference this model by relationships. This is often used by local storage, REST, and live implementations.
  name: 'model_class',

  // (string) The name of the class. This is visible when debugging your application. If not provided it will
  /// take the name option and camelcase it.
  className: 'ModelClass',

  // Custom options can be used by Rekord.store, Rekord.rest, and Rekord.live implementations. The AngularJS Rekord.rest
  // implementation uses an 'api' option. The PubSub Rekord.live implementation uses 'pubsub', 'channel', and 'token'
  // options.
  customOption: 'some value',

  // (string|string[]) The primary key of the class. This can be an array of string for models with composite keys.
  key: 'id', // default: 'id'

  // (string) When a class has a composite key, the values of the key need to be joined together to create
  // a singular key used in caching and hash maps.
  keySeparator: '/', // default: '/'

  // (string[]) The fields which exist on the model. If the key(s) are not specified in this list, they are automatically
  // added. There are other options that may also add fields.
  fields: ['name', 'finished_at', 'created_by'], // default: []

  // (object) An object with fields as properties that determines whether a change in a field should result in a save.
  // By default there are no ignored fields. If there are non-ignored fields in a save, the ignored field will be saved.
  ignoredFields: { created_by: true }, // default: {}

  // (object) An object with default values when a model is created for the first time. If the value is a function it is
  // called. If the value is a Rekord (like ModelClass) then new is called on the model. The value given will be copied
  // each time to avoid multiple models reference the same object/arrays.
  defaults: { finished_at: Date.now },

  // (boolean|string[]|object) An option which adds timestamps to the fields, encodings, decodings, and defaults options.
  // If true is given, created_at & updated_at are the fields added. If an array is given all elements specified are
  // added as timestamp fields. An object can be given to retain the updated_at & created_at behaviors but used to
  // name the fields differently. An updated_at field has the behavior of setting updated_at to the current time
  // each time $save is called. The updated_at field is also added to the ignoredFields option to avoid from sending
  // saves with only updated_at.
  timestamps: true, // default: false

  // (boolean) The option which determines whether encodings and decodings are added for the timestamp fields determined
  // above. They are converted to the Date object if their remote value is a UNIX timestamp or date string. They are
  // converted from Date objects to UNIX timestamps on save.
  timestampsAsDate: true, // default: false

  // (Rekord) This class can optionally extend another class. All fields are copied over, options that aren't specified
  // in this class are copied from the parent (or merged if objects).
  extend: AnotherClass,

  // (function|string|any[]) A field, a comparison function, or an array of mixed values can be used to sort. If a negative
  // sign is before a field name it will be sorted in descending order (default is ascending). When an array is given,
  // the first comparator is used - if the two models are equivalent the next comparator is used. This option only affects
  // the collection returned by ModelClass.all().
  comparator: '-finished_at', // default: null

  // (boolean) When comparing, an object might have a null or undefined value. This determines whether null/undefined
  // values should be first or last. This option only affects the collection returned by ModelClass.all().
  comparatorNullsFirst: true, // default: null

  // (string|function) This compares a model to data returned by a REST call or real-time event. If a field is given and the
  // new data has a lesser value - the entirety of the remote data is rejected. If a function is given and returns true
  // the entirety of the remote data is rejected as well. Default behavior is to intelligibly merge changes to avoid
  // overwriting properties changed locally that have not been saved via REST.
  revision: 'updated_at', // default: null

  // (boolean) Whether relations (hasOne, belongsTo, hasMany, hasManyThrough) are automatically initialized for every model
  // instance or lazily through the $get/$set/$relate/$unrelate/$isRelated methods.
  loadRelations: false, // default: true

  // (boolean) Whether all models should be remotely fetched via a REST call as soon as the models are loaded from local
  // storage (if cache is not set to Rekord.Cache.None).
  loadRemote: false, // default: true

  // (boolean) Whether all models should be remotely fetched after an application is offline, gets back online, and is
  // finished syncing all local changes to REST & real-time interfaces. This option is ignored if loadRemote is false.
  autoRefresh: true, // default: true

  // (string) Determines if models are stored in local storage all the time (Rekord.Cache.All or 'all'), never
  // (Rekord.Cache.None or 'none'), or only when there are pending values to save/remove (Rekord.Cache.Pending or 'pending').
  cache: Rekord.Cache.Pending, // default: Rekord.Cache.All

  // (boolean) Determines whether all fields are sent on saves (true) or only fields that have changed since the last save.
  fullSave: true, // default: false

  // (boolean) Determines whether all fields are sent on real-time events after a save (true) or only fields that have
  // changed since the last save.
  fullPublish: false, // default: false

  // (object) An object where the keys are fields and the values are functions to pass the value to before a save to convert
  // it from the local data type to the data type expected by the REST & real-time services.
  encodings: { name: trim }, // default: {}

  // (object) An object where the keys are fields and the values are functions to pass the value to after data is received
  // from REST & real-time services to convert it from the remote data type to the local data type.
  decodings: { id: parseInt }, // default: {}

  // (function) A function to convert data from the local data types to the data types expected by the REST & real-time
  // services. If this option is given, the encodings option is ineffective.
  encode: function(data) { ... },

  // (function) A function to convert data from the remote data types to the local data types. If this option is given
  // the decodings option is ineffective.
  decode: function(rawData) { ... },

  // (function) A function which accepts a model instance and returns a string which describes the model. This is primarily
  // used in debugging.
  summarize: function(model) { return model.name; },

  // (function) A function which accepts the database instance and options passed to it. This function is called before
  // The store, rest, and live services are created for the given database.
  prepare: function(db, options) { ... },

  // (object) Adds dynamic properties to every model. Dynamic properties appear like normal fields but invoke functions
  // when they are set or get.
  dynamic: {
    // getter only.
    finished: function() { // if (model.finished) ...
      return !!this.finished_at;
    },
    // getter and setter
    done: {
      set: function(x) { // model.done = true;
        this.done_at = x ? Date.now() : null;
      },
      get: function() { // if (model.done) ...
        return !!this.done_at;
      }
    }
  },

  // (object) Adds methods to every model.
  methods: {
    setFinished: function(finished) {
      this.$save( 'finished_at', finished ? Date.now() : null );
    }
  },

  // (object) Provides the ability to listen to all database & model events in a single place. A function can be given, an
  // array containing a function and context (this), or an object with on, once, or after properties. By default when a
  // function is given it listens via on. Property names will be automatically camelcased so for the ModelAdded database
  // event, several property names are acceptable: modelAdded, ModelAdded, & model_added.
  // Database events: NoLoad, RemoteLoad, LocalLoad, Updated, ModelAdded, ModelUpdated, ModelRemoved, & Loads
  // Model events: Created, Saved, PreSave, PostSave, PreRemove, PostRemove, PartialUpdate, FullUpdate, Updated, Detach,
  //               Change, CreateAndSave, UpdateAndSave, KeyUpdate, RelationUpdate, Removed, RemoteUpdate, RemoteRemove,
  //               RemoteAndRemove, SavedRemoteUpdate, Changes
  events: {
    // function, this = Database
    modelAdded: function(model) { ... },
    // object, this = Model
    postSave: {
      after: function(model) { ... },
    },
    // array, this = someContext
    modelUpdated: [ function(model) { ... }, someContext ]
  },

  // (1-1) This model owns another - when this model is removed, these models should be removed as well.
  hasOne: {
    fieldName: {
      // hasOne options below
    }
  },

  // (N-1) This model belongs to another, when the related model is removed, this model should be as well.
  belongsTo: {
    fieldName: {
      // belongsTo options below
    }
  },

  // (1-N) This model owns zero or more related models. When this model is removed, all related models should be as well.
  hasMany: {
    fieldName: {
      // hasMany options below
    }
  },

  // (N-M) This model is related to zero or more related models through another model. When this model is removed,
  // the related models are untouched but the through models are removed.
  hasManyThrough: {
    fieldName: {
      // hasManyThrough options below
    }
  },

  // (N) This model is related to zero or more models through some query.
  hasRemote: {
    fieldName: {
      // hasRemote options below
    }
  }

});
```

**hasOne Options**

A hasOne relationship is a one-to-one relationship where the parent model **owns** the related model. When saving the related model is saved first - since the parent model has fields which map to the key of the related model. When removing the related model is removed along with the parent model (by default).

Defaults can be overridden by changing `Rekord.HasOne.Defaults`

```javascript
var ModelClass = Rekord({

  // The fields option must contain all local keys referenced in hasOne definitions.
  fields: ['related_id'],

  // (object) which contains hasOne definitions
  hasOne: {

    // (object) the name of the hasOne definition. By default (property=true)
    // this property is added to the model.
    related: {

      // (string|Model) The name, className, or reference to a Rekord instance that
      // this model is related to. This is required for non-polymorphic relationships
      // and is ignored for polymorphic relationships.
      model: 'RelatedClass',

      // (boolean) Whether or not this relationship is lazily initialized.
      lazy: true, // default: false

      // (any)
      query: '/api/1.0/related/{related_id}',

      // (Rekord.Store)
      store: Rekord.Store.None,

      // (Rekord.Save)
      save: Rekord.Save.None,

      // (boolean)
      auto: true,

      // (boolean)
      property: true,

      // (boolean)
      dynamic: true,

      // (string,string[])
      local: 'related_id',

      // (Rekord.Cascade)
      cascade: Rekord.Cascade.All,

      // (string)
      discriminator: 'related_type',

      // (object)
      discriminators: {
        'RelationClass1': 1,
        'RelationClass2': 2
      }

    }

  }
});
```
