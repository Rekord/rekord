
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

  // TODO document
  timestampFormat: Rekord.Timestamp.Millis, // default: 'millis'
  timestampType: Rekord.Timestamp.Date, // default: 'date'
  timestampUTC: false, // default: false

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
  load: Rekord.Load.Lazy, // default: Rekord.Load.None

  // (boolean) Whether all models should be remotely fetched after an application is offline, gets back online, and is
  // finished syncing all local changes to REST & real-time interfaces. This option is ignored if load is not All
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
