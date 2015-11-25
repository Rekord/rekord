

function NeuroDatabase(options)
{  
  var defaults = NeuroDatabase.Defaults;

  // Apply the options to this database!
  applyOptions( this, options, defaults );

  // Apply options not specified in defaults
  for (var prop in options)
  {
    if ( !(prop in defaults) )
    {
      this[ prop ] = options[ prop ];
    }
  }

  // If key fields aren't in fields array, add them in
  var key = this.key;
  var fields = this.fields;
  if ( isArray( key ) )
  {
    for (var i = key.length - 1; i >= 0; i--)
    {
      if ( indexOf( fields, key[ i ] ) === false )
      {
        fields.unshift( key[ i ] );
      }
    }
  }
  else // isString( key )
  {
    if ( indexOf( fields, key ) === false )
    {
      fields.unshift( key );
    }
  }

  // Properties
  this.models = new NeuroMap();
  this.className = this.className || toCamelCase( this.name );
  this.initialized = false;
  this.pendingRefresh = false;
  this.localLoaded = false;
  this.remoteLoaded = false;
  this.remoteOperations = 0;
  this.afterOnline = false;
  this.saveFields = copy( fields );

  // Services
  this.rest   = Neuro.rest( this );
  this.store  = Neuro.store( this );
  this.live   = Neuro.live( this, this.handlePublish( this ) );

  // Functions
  this.setComparator( this.comparator, this.comparatorNullsFirst );
  this.setRevision( this.revision );
  this.setToString( this.toString );

  // Event Listeners
  this.databaseEvents = [];
  this.modelEvents = [];

  if ( isObject( this.events ) )
  {
    for ( var eventType in this.events )
    {
      var callback = this.events[ eventType ];
      var eventName = toCamelCase( eventType );
      var databaseEventString = NeuroDatabase.Events[ eventName ];
      var modelEventString = NeuroModel.Events[ eventName ];

      if ( databaseEventString )
      {
        parseEventListeners( databaseEventString, callback, false, this.databaseEvents );
      }

      if ( modelEventString )
      {
        parseEventListeners( modelEventString, callback, true, this.modelEvents );
      }
    }
  }

  applyEventListeners( this, this.databaseEvents );

  // Relations
  this.relations = {};
  this.relationNames = [];

  for (var relationType in options)
  {
    if ( !(relationType in Neuro.Relations) )
    {
      continue;
    }

    var RelationClass = Neuro.Relations[ relationType ];

    if ( !(RelationClass.prototype instanceof NeuroRelation ) )
    {
      continue;
    }

    var relationMap = options[ relationType ];

    for ( var name in relationMap )
    {
      var relationOptions = relationMap[ name ];
      var relation = new RelationClass();

      relation.init( this, name, relationOptions );

      if ( relation.save )
      {
        this.saveFields.push( name );
      }

      this.relations[ name ] = relation;
      this.relationNames.push( name );
    }
  }
}

NeuroDatabase.Events = 
{
  NoLoad:       'no-load',
  RemoteLoad:   'remote-load',
  LocalLoad:    'local-load',
  Updated:      'updated',
  ModelAdded:   'model-added',
  ModelUpdated: 'model-updated',
  ModelRemoved: 'model-removed',
  Loads:        'no-load remote-load local-load'
};

NeuroDatabase.Live = 
{
  Save:         'SAVE',
  Remove:       'REMOVE'
};

Neuro.Cache = 
{
  None:       'none',
  Pending:    'pending',
  All:        'all'
};

NeuroDatabase.Defaults = 
{
  name:                 undefined,  // required
  className:            null,       // defaults to toCamelCase( name )
  key:                  'id',
  keySeparator:         '/',
  fields:               [],
  defaults:             {},
  comparator:           null,
  comparatorNullsFirst: null,
  revision:             null,
  loadRelations:        true,
  loadRemote:           true,
  autoRefresh:          true,
  cache:                Neuro.Cache.All,
  fullSave:             false,
  fullPublish:          false,
  dynamic:              false,
  methods:              false,
  events:               false,
  encode:               function(data) { return data; },
  decode:               function(rawData) { return rawData; },
  toString:             function(model) { return model.$key() }
};

NeuroDatabase.prototype =
{

  // Notifies a callback when the database has loaded (either locally or remotely).
  ready: function(callback, context, persistent)
  {
    var db = this;
    var callbackContext = context || db;
    var invoked = false;

    if ( db.initialized )
    {
      callback.call( callbackContext, db );
      invoked = true;
    }
    else
    {
      function onReadyRemove()
      {
        db.off( NeuroDatabase.Events.Loads, onReady );
      }

      function onReady()
      {
        if ( !persistent )
        {
          onReadyRemove();
        }
        if ( !invoked || persistent )
        {
          if ( callback.call( callbackContext, db ) === false )
          {
            onReadyRemove();
          }
          invoked = true;
        }
      }

      db.on( NeuroDatabase.Events.Loads, onReady );
    }

    return invoked;
  },

  // Grab a model with the given input and notify the callback
  grabModel: function(input, callback, context, fromStorage)
  {
    var db = this;
    var callbackContext = context || db;
    var grabbed = false;

    function checkModel()
    {
      var result = db.parseModel( input, fromStorage !== false );

      if ( result !== false && !grabbed )
      {
        grabbed = true;
        callback.call( callbackContext, result );
      }

      return result === null ? false : true;
    }

    if ( checkModel() )
    {
      db.ready( checkModel, db, true );
    }
  },

  // Parses the model from the given input
  // 
  // Returns false if the input doesn't resolve to a model at the moment
  // Returns null if the input doesn't resolve to a model and all models have been remotely loaded
  // 
  // parseModel( Neuro )
  // parseModel( Neuro.Model )
  // parseModel( 'uuid' )
  // parseModel( ['uuid'] )
  // parseModel( modelInstance )
  // parseModel( {name:'new model'} )
  // parseModel( {id:4, name:'new or existing model'} )
  // 
  parseModel: function(input, fromStorage)
  {
    var db = this;
    var hasRemote = db.remoteLoaded || !db.loadRemote;

    if ( !isValue( input ) )
    {
      return hasRemote ? null : false;
    }

    if ( isNeuro( input ) )
    {
      input = new input.Model();
    }
    else if ( isModelConstructor( input ) )
    {
      input = new input();
    }

    var key = db.buildKeyFromInput( input );

    if ( input instanceof db.model )
    {
      if ( !db.models.has( key ) )
      {
        // trigger? save?
        db.models.put( key, input );
      }

      return input;
    }
    else if ( db.models.has( key ) )
    {
      var model = db.models.get( key );
      
      if ( isObject( input ) )
      {
        db.putRemoteData( input, key, model, fromStorage );
      }

      return model;
    }
    else if ( isObject( input ) )
    {
      if ( fromStorage )
      { 
        return db.putRemoteData( input, undefined, undefined, true ); 
      }
      else
      {
        return db.instantiate( db.decode( input ) );
      }
    }
    else if ( hasRemote )
    {
      return null;
    }

    return false;
  },

  // Removes the key from the given model
  removeKey: function(model)
  {
    var k = this.key;

    if ( isArray(k) )
    {
      for (var i = 0; i < k.length; i++) 
      {
        delete model[ k[i] ];
      }
    }
    else
    {
      delete model[ k ];
    }
  },

  // Builds a key string from the given model and array of fields
  buildKey: function(model, fields)
  {
    var key = this.buildKeys( model, fields );

    if ( isArray( key ) )
    {
      key = key.join( this.keySeparator );
    }
    
    return key;
  },

  // Builds a key (possibly array) from the given model and array of fields
  buildKeys: function(model, fields)
  {
    var key = null;

    if ( isArray( fields ) )
    {      
      key = [];
      
      for (var i = 0; i < fields.length; i++) 
      {
        key.push( model[ fields[i] ] );
      }
    }
    else
    {
      key = model[ fields ];

      if (!key)
      {
        key = model[ fields ] = uuid();
      }
    }

    return key;
  },

  // Builds a key from various types of input.
  buildKeyFromInput: function(input)
  {
    if ( input instanceof this.model )
    {
      return input.$key();
    }
    else if ( isArray( input ) ) // && isArray( this.key )
    {
      return this.buildKeyFromArray( input );
    }
    else if ( isObject( input ) )
    {
      return this.buildKey( input, this.key );
    }

    return input;
  },

  // Builds a key from an array
  buildKeyFromArray: function(arr)
  {
    return arr.join( this.keySeparator );
  },

  // Gets the key from the given model
  getKey: function(model)
  {
    return this.buildKey( model, this.key );
  },

  // Gets the key from the given model
  getKeys: function(model)
  {
    return this.buildKeys( model, this.key );
  },

  buildObjectFromKey: function(key)
  {
    var db = this;

    var props = {};

    if ( isArray( db.key ) )
    {
      if ( isString( key ) )
      {
        key = key.split( db.keySeparator );
      }

      for (var i = 0; i < db.key.length; i++)
      {
        props[ db.key[ i ] ] = key[ i ];
      }
    }
    else
    {
      props[ db.key ] = key;
    }

    return db.instantiate( props );
  },

  // Determines whether the given model has the given fields
  hasFields: function(model, fields, exists)
  {
    if ( isArray( fields ) )
    {
      for (var i = 0; i < fields.length; i++) 
      {
        if ( !exists( model[ fields[ i ] ] ) )
        {
          return false;
        }
      }

      return true;
    }
    else // isString( fields )
    {
      return exists( model[ fields ] );
    }
  },

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.sort();
    this.trigger( NeuroDatabase.Events.Updated );
  },

  // Sets a revision comparision function for this database. It can be a field
  // name or a function. This is used to avoid updating model data that is older
  // than the model's current data.
  setRevision: function(revision)
  {
    if ( isFunction( revision ) )
    {
      this.revisionFunction = revision;
    }
    else if ( isString( revision ) )
    {
      this.revisionFunction = function(a, b)
      {
        return (revision in a && revision in b) ? (compare( a[ revision ], b[ revision ] )) : false;
      };
    }
    else
    {
      this.revisionFunction = function(a, b)
      {
        return false;
      };
    }
  },

  // Sets a comparator for this database. It can be a field name, a field name
  // with a minus in the front to sort in reverse, or a comparator function.
  setComparator: function(comparator, nullsFirst)
  {
    this.comparatorFunction = createComparator( comparator, nullsFirst );
  },

  setToString: function(toString)
  {
    if ( isFunction( toString ) )
    {
      this.toString = toString;
    }
    else if ( isString( toString ) )
    {
      this.toString = function(model)
      {
        return isValue( model ) ? model[ toString ] : model;
      };
    }
    else
    {
      this.toString = function(model)
      {
        return model.$key();
      };
    }
  },

  // Sorts the database if it isn't sorted.
  sort: function()
  {
    if ( !this.isSorted() )
    {
      this.models.sort( this.comparatorFunction );
    }
  },

  // Determines whether this database is sorted.
  isSorted: function()
  {
    return this.models.isSorted( this.comparatorFunction );
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model, fromStorage)
  {
    var db = this;
    var key = key || db.getKey( encoded );
    var model = model || db.models.get( key );
    var decoded = db.decode( copy( encoded ) );

    if ( model )
    {
      var revisionCompare = this.revisionFunction( model, encoded );

      if ( revisionCompare !== false && revisionCompare > 0 )
      {
        Neuro.debug( Neuro.Debugs.SAVE_OLD_REVISION, db, model, encoded );

        return model;
      }
    }

    if ( model && model.$saved )
    {
      var current = model.$toJSON( true );
      var conflicts = {};
      var conflicted = false;
      var updated = {};
      var notReallySaved = isEmpty( model.$saved );
      var relations = db.relations;

      for (var prop in encoded)
      {
        if ( prop.charAt(0) === '$' )
        {
          continue;
        }

        if ( prop in relations )
        {
          model.$set( prop, encoded[ prop ] );

          continue;
        }

        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        if ( notReallySaved || equals( currentValue, savedValue ) )
        {
          model[ prop ] = decoded[ prop ];
          updated[ prop ] = encoded[ prop ];

          if ( model.$local )
          {
            model.$local[ prop ] = encoded[ prop ];
          }
        }
        else
        {
          conflicts[ prop ] = encoded[ prop ];
          conflicted = true;
        }

        model.$saved[ prop ] = copy( encoded[ prop ] );
      }

      if ( conflicted )
      {
        model.$trigger( NeuroModel.Events.PartialUpdate, [encoded, conflicts] );
      }
      else
      {
        model.$trigger( NeuroModel.Events.FullUpdate, [encoded, updated] );
      }

      model.$trigger( NeuroModel.Events.RemoteUpdate, [encoded] );

      model.$addOperation( NeuroSaveNow ); 
    }
    else
    {
      model = db.instantiate( decoded, fromStorage );

      if ( db.cache === Neuro.Cache.All )
      {
        model.$local = encoded;
        model.$saved = model.$local.$saved = copy( encoded );

        model.$addOperation( NeuroSaveNow );
      }
      else
      {
        model.$saved = clean( encoded );
      }
    }

    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( NeuroDatabase.Events.ModelAdded, [model] );

      if ( !fromStorage )
      {
        model.$trigger( NeuroModel.Events.Saved ); 
      }
    }

    return model;
  },

  destroyLocalUncachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        delete model.$saved;

        db.removeKey( model );

        model.$trigger( NeuroModel.Events.Detach );

        return false;
      }

      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );

      model.$trigger( NeuroModel.Events.RemoteAndRemove );

      Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, model );

      return true;
    }

    return false;
  },

  destroyLocalCachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      // If a model was removed remotely but the model has changes - don't remove it.
      if ( model.$hasChanges() )
      {
        // Removed saved history and the current ID
        delete model.$saved;
        delete model.$local.$saved;

        db.removeKey( model );
        db.removeKey( model.$local );

        model.$trigger( NeuroModel.Events.Detach );

        model.$addOperation( NeuroSaveNow );
     
        return false;
      }

      model.$addOperation( NeuroRemoveNow );

      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );

      model.$trigger( NeuroModel.Events.RemoteAndRemove );

      Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, model );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue) 
        {
          Neuro.debug( Neuro.Debugs.REMOTE_REMOVE, db, removedValue );
        }
      });

      // The model didn't exist
      return false;
    }

    return true;
  },

  // Destroys a model locally because it doesn't exist remotely
  destroyLocalModel: function(key)
  {
    var db = this;
    var model = db.models.get( key );

    if ( db.cache === Neuro.Cache.All )
    {
      return db.destroyLocalCachedModel( model, key );
    }
    else
    {
      return db.destroyLocalUncachedModel( model, key );
    }
  },

  // Initialize the database by loading local values and on success load
  // remove values.
  init: function()
  {
    var db = this;

    if ( db.loadRemote && db.autoRefresh )
    {
      Neuro.after( 'online', db.onOnline, db );
    }

    if ( db.cache === Neuro.Cache.None )
    {
      if ( db.loadRemote )
      {
        db.refresh();
      }
      else
      {
        db.initialized = true;
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }

      return;
    }

    db.store.all( onLocalLoad, onLocalError );    

    function onLocalLoad(records, keys)
    {
      Neuro.debug( Neuro.Debugs.LOCAL_LOAD, db, records );

      db.models.reset();

      for (var i = 0; i < records.length; i++) 
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var model = db.instantiate( decoded, true );

        model.$local = encoded;

        if ( encoded.$deleted )
        {
          Neuro.debug( Neuro.Debugs.LOCAL_RESUME_DELETE, db, model );

          model.$addOperation( NeuroRemoveRemote );
        }
        else
        {
          if ( !encoded.$saved )
          {
            Neuro.debug( Neuro.Debugs.LOCAL_RESUME_SAVE, db, model );

            model.$addOperation( NeuroSaveRemote );
          }
          else
          {
            Neuro.debug( Neuro.Debugs.LOCAL_LOAD_SAVED, db, model );

            model.$local.$saved = model.$saved;
          }

          // TODO investigate why sometimes the key is removed from the model then saved
          if ( key === model.$key() )
          {
            db.models.put( key, model );            
          }
          else
          {
            db.store.remove( key );
          }
        }
      }
      
      db.initialized = true;
      db.localLoaded = true;

      db.trigger( NeuroDatabase.Events.LocalLoad, [db] );

      db.updated();

      if ( db.loadRemote )
      {
        db.refresh();
      }
    }

    function onLocalError()
    {
      db.initialized = true;

      if ( db.loadRemote )
      {
        db.refresh();
      }
      else
      {
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }
    }
  },

  onOnline: function()
  {
    this.afterOnline = true;

    if ( this.remoteOperations === 0 )
    {
      this.onRemoteRest();
    }
  },

  onRemoteRest: function()
  {
    var db = this;

    if ( db.autoRefresh && db.remoteLoaded )
    {
      if ( db.afterOnline )
      {
        db.afterOnline = false;
        
        Neuro.debug( Neuro.Debugs.AUTO_REFRESH, db );

        db.refresh();
      }
    }
  },

  // Loads all data remotely
  refresh: function()
  {
    var db = this;

    db.rest.all( onModels, onLoadError );
    
    function onModels(models) 
    {
      var mapped = {};

      for (var i = 0; i < models.length; i++)
      {
        var model = db.putRemoteData( models[ i ] );

        if ( model )
        {
          var key = model.$key();

          mapped[ key ] = model; 
        }
      }

      var keys = db.models.keys;

      for (var i = 0; i < keys.length; i++)
      {
        var k = keys[ i ];

        if ( !(k in mapped) )
        {
          var old = db.models.get( k );

          if ( old.$saved )
          {
            Neuro.debug( Neuro.Debugs.REMOTE_LOAD_REMOVE, db, k );

            db.destroyLocalModel( k );
          }
        }
      }

      db.initialized = true;
      db.remoteLoaded = true;

      db.trigger( NeuroDatabase.Events.RemoteLoad, [db] );

      db.updated();

      Neuro.debug( Neuro.Debugs.REMOTE_LOAD, db, models );
    }

    function onLoadError(models, status) 
    {
      if ( status === 0 )
      {
        Neuro.checkNetworkStatus();

        if ( !Neuro.online )
        {
          db.pendingRefresh = true;

          Neuro.once( 'online', db.onRefreshOnline, db );
        }

        Neuro.debug( Neuro.Debugs.REMOTE_LOAD_OFFLINE, db );
      }
      else
      {
        Neuro.debug( Neuro.Debugs.REMOTE_LOAD_ERROR, db, status );

        db.initialized = true;
        db.trigger( NeuroDatabase.Events.NoLoad, [db] );
      }
    }
  
  },

  onRefreshOnline: function()
  {
    var db = this;

    Neuro.debug( Neuro.Debugs.REMOTE_LOAD_RESUME, db );

    if ( db.pendingRefresh )
    {
      db.pendingRefresh = false;

      db.refresh(); 
    }
  },

  // The reference to all of the models in the database
  getModels: function()
  {
    return this.models.values;
  }, 

  // Returns a model
  getModel: function(key)
  {
    if ( isArray( key ) )
    {
      key = this.buildKeyFromArray( key );
    }

    return this.models.get( key );
  },

  // Crates a function for handling real-time changes
  handlePublish: function(db)
  {
    return function(message)
    {
      var key = message.key;
      var encoded = message.model;

      switch (message.op) 
      {
      case NeuroDatabase.Live.Save:

        db.putRemoteData( encoded, key );
        db.updated();

        Neuro.debug( Neuro.Debugs.REALTIME_SAVE, db, message.model, key );
        break;

      case NeuroDatabase.Live.Remove:

        if ( db.destroyLocalModel( key ) )
        {
          db.updated(); 
        }

        Neuro.debug( Neuro.Debugs.REALTIME_REMOVE, db, key );
        break;
      }
    };
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data, fromStorage)
  {
    return new this.model( data, fromStorage );
  },

  // Create the model
  create: function(props)
  {
    var db = this;

    if ( !isObject( props ) )
    {
      var model = db.instantiate();

      model.$save();

      return model;
    }

    var fields = grab( props, db.fields );
    var model = db.instantiate( fields );
    var key = model.$key();
    var relations = {};

    db.models.put( key, model );
    db.trigger( NeuroDatabase.Events.ModelAdded, [model] );
    db.updated();

    for (var i = 0; i < db.relationNames.length; i++)
    {
      var relationName = db.relationNames[ i ];

      if ( relationName in props )
      {
        relations[ relationName ] = props[ relationName ];
      }
    }

    model.$save( relations );

    return model;
  },

  // Save the model
  save: function(model, cascade)
  {
    var db = this;
    var key = model.$key();
    var cascade = isValue( cascade ) ? cascade : Neuro.Cascade.All;

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Debugs.SAVE_DELETED, db, model );

      return;
    }

    // Place the model and trigger a database update.
    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( NeuroDatabase.Events.ModelAdded, [model] );
      db.updated();

      model.$trigger( NeuroModel.Events.CreateAndSave );
    }
    else
    {
      db.trigger( NeuroDatabase.Events.ModelUpdated, [model] );

      model.$trigger( NeuroModel.Events.UpdateAndSave );
    }

    // If we're not supposed to cascade this anywhere, stop!
    if ( !cascade )
    {
      return;
    }

    // If we're not storing locally OR we're not cascading locally, jump directly to remote.
    // TODO ensure cascade rest, otherwise call live.
    if ( db.cache === Neuro.Cache.None || !(cascade & Neuro.Cascade.Local) )
    {
      // Save remotely
      model.$addOperation( NeuroSaveRemote, cascade );
    }
    else
    {
      // Start by saving locally.
      model.$addOperation( NeuroSaveLocal, cascade );
    }
  },

  // Remove the model 
  remove: function(model, cascade)
  {
    var db = this;
    var key = model.$key();
    var cascade = isValue( cascade ) ? cascade : Neuro.Cascade.All;

    // If we have it in the models, remove it!
    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( NeuroDatabase.Events.ModelRemoved, [model] );
      db.updated();

      model.$trigger( NeuroModel.Events.Removed );
    }

    // Mark as deleted right away
    model.$deleted = true;

    // If we're offline and we have a pending save - cancel the pending save.
    if ( model.$pendingSave )
    {
      Neuro.debug( Neuro.Debugs.REMOVE_CANCEL_SAVE, db, model );

      model.$pendingSave = false; 
    }

    // If we're not supposed to cascade this anywhere, stop!
    if ( !cascade )
    {
      return;
    }

    // If we're not storing locally OR we're not cascading locally, jump directly to remote.
    // TODO ensure cascade rest, otherwise call live.
    if ( db.cache === Neuro.Cache.None || !(cascade & Neuro.Cascade.Local) )
    {
      // Remove remotely
      model.$addOperation( NeuroRemoveRemote, cascade );
    }
    else
    { 
      // Start by removing locally.
      model.$addOperation( NeuroRemoveLocal, cascade );
    }
  },

  refreshModel: function(model, cascade)
  {
    var db = this;
    var cascade = isValue( cascade ) ? cascade : Neuro.Cascade.Rest;

    // If we're not supposed to cascade this anywhere, stop!
    if ( !cascade )
    {
      return;
    }

    // If we're not storing locally OR we're not cascading locally, jump directly to remote.
    if ( db.cache !== Neuro.Cache.All || !(cascade & Neuro.Cascade.Local) )
    {
      // Getting remotely
      model.$addOperation( NeuroGetRemote, cascade );
    }
    else
    {
      // Start by getting locally.
      model.$addOperation( NeuroGetLocal, cascade );
    }
  }

};

eventize( NeuroDatabase.prototype );