

/**
 *
 * @constructor
 * @memberof Rekord
 * @augments Rekord.Eventful
 */
function Database(options)
{
  // Apply the options to this database!
  applyOptions( this, options, Defaults );

  // Create the key handler based on the given key
  this.keyHandler = isArray( this.key ) ?
    new KeyComposite( this ) : new KeySimple( this );

  // If key fields aren't in fields array, add them in
  this.keyHandler.addToFields( this.fields );

  // Properties
  this.models = ModelCollection.create( this );
  this.all = {};
  this.loaded = {};
  this.className = this.className || toCamelCase( this.name );
  this.initialized = false;
  this.pendingRefresh = false;
  this.localLoaded = false;
  this.remoteLoaded = false;
  this.firstRefresh = false;
  this.pendingOperations = 0;
  this.afterOnline = false;
  this.saveFields = copy( this.fields );
  this.readyPromise = new Promise( null, false );

  // Prepare
  this.prepare( this, options );

  // Services
  this.rest   = this.createRest( this );
  this.store  = this.createStore( this );
  this.live   = this.createLive( this );

  // Functions
  this.setComparator( this.comparator, this.comparatorNullsFirst );
  this.setRevision( this.revision );
  this.setSummarize( this.summarize );

  // Relations
  this.relations = {};
  this.relationNames = [];

  for (var relationType in options)
  {
    if ( !(relationType in Rekord.Relations) )
    {
      continue;
    }

    var RelationClass = Rekord.Relations[ relationType ];

    if ( !(RelationClass.prototype instanceof Relation ) )
    {
      continue;
    }

    var relationMap = options[ relationType ];

    for ( var name in relationMap )
    {
      var relationOptions = relationMap[ name ];
      var relation = new RelationClass();

      if ( isString( relationOptions ) )
      {
        relationOptions = {
          model: relationOptions
        };
      }
      else if ( !isObject( relationOptions ) )
      {
        relationOptions = {};
      }

      if ( !relationOptions.model && !relationOptions.discriminator )
      {
        relationOptions.model = name;
      }

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

function defaultEncode(model, data, forSaving)
{
  var encodings = this.encodings;

  for (var prop in data)
  {
    if ( prop in encodings )
    {
      data[ prop ] = encodings[ prop ]( data[ prop ], model, prop, forSaving );
    }
  }

  return data;
}

function defaultDecode(rawData)
{
  var decodings = this.decodings;

  for (var prop in rawData)
  {
    if ( prop in decodings )
    {
      rawData[ prop ] = decodings[ prop ]( rawData[ prop ], rawData, prop );
    }
  }

  return rawData;
}

function defaultSummarize(model)
{
  return model.$key();
}

function defaultCreateRest(database)
{
  return database.rest === false ? Rekord.defaultRest( database ) : Rekord.rest( database );
}

function defaultCreateStore(database)
{
  return database.store === false ? Rekord.defaultStore( database ) : Rekord.store( database );
}

function defaultCreateLive( database )
{
  return database.live === false ? Rekord.defaultLive( database ) : Rekord.live( database );
}

function defaultResolveModel( response )
{
  return response;
}

function defaultResolveModels( response )
{
  return response;
}

Database.Events =
{
  NoLoad:             'no-load',
  RemoteLoad:         'remote-load',
  LocalLoad:          'local-load',
  Updated:            'updated',
  ModelAdded:         'model-added',
  ModelUpdated:       'model-updated',
  ModelRemoved:       'model-removed',
  OperationsStarted:  'operations-started',
  OperationsFinished: 'operations-finished',
  Loads:              'no-load remote-load local-load',
  Changes:            'updated'
};

var Defaults = Database.Defaults =
{
  name:                 undefined,  // required
  className:            null,       // defaults to toCamelCase( name )
  key:                  'id',
  keySeparator:         '/',
  fields:               [],
  ignoredFields:        {},
  defaults:             {},
  publishAlways:        [],
  comparator:           null,
  comparatorNullsFirst: null,
  revision:             null,
  cascade:              Cascade.All,
  load:                 Load.None,
  allComplete:          false,
  loadRelations:        true,
  autoRefresh:          true,
  cache:                Cache.All,
  fullSave:             false,
  fullPublish:          false,
  noReferences:         false,
  encodings:            {},
  decodings:            {},
  prepare:              noop,
  encode:               defaultEncode,
  decode:               defaultDecode,
  resolveModel:         defaultResolveModel,
  resolveModels:        defaultResolveModels,
  summarize:            defaultSummarize,
  createRest:           defaultCreateRest,
  createStore:          defaultCreateStore,
  createLive:           defaultCreateLive
};

Class.create( Database,
{

  setStoreEnabled: function(enabled)
  {
    if ( enabled )
    {
      if ( this.storeDisabled )
      {
        this.store = this.storeDisabled;
        this.storeDisabled = false;
      }
    }
    else if ( !this.storeDisabled )
    {
      this.storeDisabled = this.store;
      this.store = Rekord.defaultStore( this );
    }
  },

  setRestEnabled: function(enabled)
  {
    if ( enabled )
    {
      if ( this.restDisabled )
      {
        this.rest = this.restDisabled;
        this.restDisabled = false;
      }
    }
    else if ( !this.restDisabled )
    {
      this.restDisabled = this.rest;
      this.rest = Rekord.defaultRest( this );
    }
  },

  setLiveEnabled: function(enabled)
  {
    if ( enabled )
    {
      if ( this.liveDisabled )
      {
        this.live = this.liveDisabled;
        this.liveDisabled = false;
      }
    }
    else if ( !this.liveDisabled )
    {
      this.liveDisabled = this.live;
      this.live = Rekord.defaultLive( this );
    }
  },

  // Notifies a callback when the database has loaded (either locally or remotely).
  ready: function(callback, context, persistent)
  {
    return this.readyPromise.success( callback, context, persistent );
  },

  // Determines whether the given object has data to save
  hasData: function(saving)
  {
    if ( !isObject( saving ) )
    {
      return false;
    }

    for (var prop in saving)
    {
      if ( !this.ignoredFields[ prop ] )
      {
        return true;
      }
    }

    return false;
  },

  // Grab a model with the given input and notify the callback
  grabModel: function(input, callback, context, remoteData)
  {
    var db = this;
    var promise = new Promise();

    promise.success( callback, context || db );

    function checkModel()
    {
      var result = db.parseModel( input, remoteData );

      if ( result !== false && !promise.isComplete() && db.initialized )
      {
        var remoteLoaded = db.remoteLoaded || !db.hasLoad( Load.All );
        var missingModel = (result === null || !result.$isSaved());
        var lazyLoad = db.hasLoad( Load.Lazy );

        if ( lazyLoad && remoteLoaded && missingModel )
        {
          if ( !result )
          {
            result = db.keyHandler.buildObjectFromKey( db.keyHandler.buildKeyFromInput( input ) );
          }

          result.$once( Model.Events.RemoteGets, function()
          {
            if ( !promise.isComplete() )
            {
              if ( isObject( input ) )
              {
                result.$set( input );
              }

              promise.resolve( result.$isSaved() ? result : null );
            }
          });

          result.$refresh();
        }
        else
        {
          promise.resolve( result );
        }
      }

      return promise.isComplete() ? false : true;
    }

    if ( checkModel() )
    {
      db.ready( checkModel, db, true );
    }

    return promise;
  },

  // Parses the model from the given input
  //
  // Returns false if the input doesn't resolve to a model at the moment
  // Returns null if the input doesn't resolve to a model and all models have been remotely loaded
  //
  // parseModel( Rekord )
  // parseModel( Rekord.Model )
  // parseModel( 'uuid' )
  // parseModel( ['uuid'] )
  // parseModel( modelInstance )
  // parseModel( {name:'new model'} )
  // parseModel( {id:4, name:'new or existing model'} )
  //
  parseModel: function(input, remoteData)
  {
    var db = this;
    var keyHandler = db.keyHandler;
    var hasRemote = db.remoteLoaded || !db.hasLoad( Load.All );

    if ( !isValue( input ) )
    {
      return hasRemote ? null : false;
    }

    if ( isRekord( input ) )
    {
      input = new input();
    }
    if ( isFunction( input ) )
    {
      input = input();
    }

    var key = keyHandler.buildKeyFromInput( input );

    if ( input instanceof db.Model )
    {
      return input;
    }
    else if ( key in db.all )
    {
      var model = db.all[ key ];

      if ( isObject( input ) )
      {
        keyHandler.buildKeyFromRelations( input );

        if ( remoteData )
        {
          db.putRemoteData( input, key, model );
        }
        else
        {
          model.$set( input );
        }
      }

      return model;
    }
    else if ( isObject( input ) )
    {
      keyHandler.buildKeyFromRelations( input );

      if ( remoteData )
      {
        return db.putRemoteData( input );
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

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.sort(); // TODO remove
    this.trigger( Database.Events.Updated );
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
        var ar = isObject( a ) && revision in a ? a[ revision ] : undefined;
        var br = isObject( b ) && revision in b ? b[ revision ] : undefined;

        return ar === undefined || br === undefined ? false : compare( ar, br ) > 0;
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
    this.models.setComparator( comparator, nullsFirst );
  },

  addComparator: function(comparator, nullsFirst)
  {
    this.models.addComparator( comparator, nullsFirst );
  },

  setSummarize: function(summarize)
  {
    if ( isFunction( summarize ) )
    {
      this.summarize = summarize;
    }
    else if ( isString( summarize ) )
    {
      if ( indexOf( this.fields, summarize ) !== false )
      {
        this.summarize = function(model)
        {
          return isValue( model ) ? model[ summarize ] : model;
        };
      }
      else
      {
        this.summarize = createFormatter( summarize );
      }
    }
    else
    {
      this.summarize = function(model)
      {
        return model.$key();
      };
    }
  },

  // Sorts the database if it isn't sorted.
  sort: function()
  {
    this.models.sort();
  },

  // Determines whether this database is sorted.
  isSorted: function()
  {
    return this.models.isSorted();
  },

  clean: function()
  {
    var db = this;
    var keys = db.models.keys;
    var models = db.models;

    db.all = {};

    for (var i = 0; i < keys.length; i++)
    {
      db.addReference( models[ i ], keys[ i ] );
    }
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model, overwrite)
  {
    if ( !isObject( encoded ) )
    {
      return model;
    }

    var db = this;
    var key = key || db.keyHandler.getKey( encoded, true );

    // The remote source might be crazy, if the key isn't there then log it and ignore it
    if ( !isValue( key ) )
    {
      Rekord.debug( Rekord.Debugs.MISSING_KEY, db, encoded );

      return;
    }

    var model = model || db.all[ key ];
    var decoded = db.decode( copy( encoded ) );

    // Reject the data if it's a lower revision
    if ( model )
    {
      var revisionRejected = this.revisionFunction( model, encoded );

      if ( revisionRejected )
      {
        Rekord.debug( Rekord.Debugs.SAVE_OLD_REVISION, db, model, encoded );

        return model;
      }
    }

    // If the model already exists, update it.
    if ( model )
    {
      if ( db.keyHandler.hasKeyChange( model, decoded ) )
      {
        key = model.$setKey( db.keyHandler.getKey( decoded, true ) );
      }

      db.addReference( model, key );

      if ( !model.$saved )
      {
        model.$saved = {};
      }

      var current = model.$toJSON( true );
      var conflicts = {};
      var conflicted = false;
      var updated = {};
      var previous = {};
      var saved = {};
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
          model.$set( prop, encoded[ prop ], true );

          continue;
        }

        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        previous[ prop ] = model[ prop ];
        saved[ prop ] = savedValue;

        if ( notReallySaved || overwrite || equals( currentValue, savedValue ) )
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
        model.$trigger( Model.Events.PartialUpdate, [encoded, updated, previous, saved, conflicts] );
      }
      else
      {
        model.$trigger( Model.Events.FullUpdate, [encoded, updated, previous, saved, conflicts] );
      }

      model.$trigger( Model.Events.RemoteUpdate, [encoded, updated, previous, saved, conflicts] );

      model.$addOperation( SaveNow );

      if ( !db.models.has( key ) )
      {
        db.saveReference( model, key );
        db.trigger( Database.Events.ModelAdded, [model, true] );
      }
    }
    // The model doesn't exist, create it.
    else
    {
      model = db.createModel( decoded, true );

      if ( model )
      {
        if ( db.cache === Cache.All )
        {
          model.$local = model.$toJSON( false );
          model.$local.$status = model.$status;
          model.$saved = model.$local.$saved = model.$toJSON( true );

          model.$addOperation( SaveNow );
        }
        else
        {
          model.$saved = model.$toJSON( true );
        }
      }
    }

    return model;
  },

  createModel: function(decoded, remoteData)
  {
    var db = this;
    var model = db.instantiate( decoded, remoteData );

    if ( model.$invalid === true )
    {
      Rekord.debug( Rekord.Debugs.MISSING_KEY, db, decoded );

      return;
    }

    var key = model.$key();

    if ( !db.models.has( key ) )
    {
      db.saveReference( model, key );
      db.trigger( Database.Events.ModelAdded, [model, remoteData] );
    }

    return model;
  },

  destroyModel: function(model, modelKey)
  {
    var db = this;
    var key = modelKey || model.$key();

    delete db.all[ key ];

    db.models.remove( key );
    db.trigger( Database.Events.ModelRemoved, [model] );

    model.$trigger( Model.Events.RemoteAndRemove );

    Rekord.debug( Rekord.Debugs.REMOTE_REMOVE, db, model );
  },

  destroyLocalUncachedModel: function(model, key)
  {
    var db = this;

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        delete model.$saved;

        db.keyHandler.removeKey( model );

        model.$trigger( Model.Events.Detach );

        return false;
      }

      db.destroyModel( model, key );

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

        db.keyHandler.removeKey( model );

        if ( model.$local )
        {
          delete model.$local.$saved;

          db.keyHandler.removeKey( model.$local );
        }

        model.$trigger( Model.Events.Detach );

        model.$addOperation( SaveNow );

        return false;
      }

      model.$addOperation( RemoveNow );

      db.destroyModel( model, key );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue)
        {
          Rekord.debug( Rekord.Debugs.REMOTE_REMOVE, db, removedValue );
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
    var model = db.all[ key ];

    if ( db.cache === Cache.All )
    {
      return db.destroyLocalCachedModel( model, key );
    }
    else
    {
      return db.destroyLocalUncachedModel( model, key );
    }
  },

  loadFinish: function()
  {
    var db = this;

    batchExecute(function()
    {
      for (var key in db.loaded)
      {
        var model = db.loaded[ key ];

        if ( model.$status === Model.Status.RemovePending )
        {
          Rekord.debug( Rekord.Debugs.LOCAL_RESUME_DELETE, db, model );

          model.$addOperation( RemoveRemote );
        }
        else
        {
          if ( model.$status === Model.Status.SavePending )
          {
            Rekord.debug( Rekord.Debugs.LOCAL_RESUME_SAVE, db, model );

            model.$addOperation( SaveRemote );
          }
          else
          {
            Rekord.debug( Rekord.Debugs.LOCAL_LOAD_SAVED, db, model );
          }

          db.saveReference( model, key, true );
        }
      }
    });

    db.loaded = {};
    db.updated();

    if ( db.hasLoad( Load.All ) )
    {
      if ( db.pendingOperations === 0 )
      {
        db.refresh();
      }
      else
      {
        db.firstRefresh = true;
      }
    }
  },

  hasLoad: function(load)
  {
    return (this.load & load) !== 0;
  },

  loadBegin: function(onLoaded)
  {
    var db = this;

    function onLocalLoad(records, keys)
    {
      Rekord.debug( Rekord.Debugs.LOCAL_LOAD, db, records );

      for (var i = 0; i < records.length; i++)
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var model = db.instantiate( decoded, true );

        if ( model.$invalid === true )
        {
          Rekord.debug( Rekord.Debugs.MISSING_KEY, db, encoded );

          break;
        }

        model.$local = encoded;
        model.$saved = encoded.$saved;

        if ( model.$status !== Model.Status.Removed )
        {
          db.loaded[ key ] = model;
          db.addReference( model, key );
        }
      }

      db.localLoaded = true;
      db.triggerLoad( Database.Events.LocalLoad );

      onLoaded( true, db );
    }

    function onLocalError()
    {
      db.loadNone();

      onLoaded( false, db );
    }

    if ( db.hasLoad( Load.All ) && db.autoRefresh )
    {
      Rekord.after( Rekord.Events.Online, db.onOnline, db );
    }

    if ( db.cache === Cache.None )
    {
      db.loadNone();

      onLoaded( false, db );
    }
    else
    {
      db.store.all( onLocalLoad, onLocalError );
    }
  },

  triggerLoad: function(loadEvent, additionalParameters)
  {
    var db = this;

    db.initialized = true;
    db.trigger( loadEvent, [ db ].concat( additionalParameters || [] ) );
    db.readyPromise.reset().resolve( db );
  },

  loadNone: function()
  {
    var db = this;

    if ( db.hasLoad( Load.All ) )
    {
      db.refresh();
    }
    else
    {
      db.triggerLoad( Database.Events.NoLoad );
    }
  },

  onOnline: function()
  {
    var db = this;

    db.afterOnline = true;

    if ( db.pendingOperations === 0 )
    {
      db.onOperationRest();
    }
  },

  onOperationRest: function()
  {
    var db = this;

    if ( ( db.autoRefresh && db.remoteLoaded && db.afterOnline ) || db.firstRefresh )
    {
      db.afterOnline = false;
      db.firstRefresh = false;

      Rekord.debug( Rekord.Debugs.AUTO_REFRESH, db );

      db.refresh();
    }
  },

  handleRefreshSuccess: function(promise)
  {
    var db = this;

    return function onRefreshSuccess(response)
    {
      var models = db.resolveModels( response );
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

      if ( db.allComplete )
      {
        var keys = db.models.keys().slice();

        for (var i = 0; i < keys.length; i++)
        {
          var k = keys[ i ];

          if ( !(k in mapped) )
          {
            var old = db.models.get( k );

            if ( old.$saved )
            {
              Rekord.debug( Rekord.Debugs.REMOTE_LOAD_REMOVE, db, k );

              db.destroyLocalModel( k );
            }
          }
        }
      }

      db.remoteLoaded = true;
      db.triggerLoad( Database.Events.RemoteLoad );

      db.updated();

      Rekord.debug( Rekord.Debugs.REMOTE_LOAD, db, models );

      promise.resolve( db.models );
    };
  },

  handleRefreshFailure: function(promise)
  {
    var db = this;

    return function onRefreshFailure(response, status)
    {
      if ( status === 0 )
      {
        Rekord.checkNetworkStatus();

        if ( !Rekord.online )
        {
          db.pendingRefresh = true;

          Rekord.once( Rekord.Events.Online, db.onRefreshOnline, db );
        }

        Rekord.debug( Rekord.Debugs.REMOTE_LOAD_OFFLINE, db );
      }
      else
      {
        Rekord.debug( Rekord.Debugs.REMOTE_LOAD_ERROR, db, status );

        db.triggerLoad( Database.Events.NoLoad, [response] );
      }

      promise.reject( db.models );
    };
  },

  executeRefresh: function(success, failure)
  {
    this.rest.all( success, failure );
  },

  // Loads all data remotely
  refresh: function(callback, context)
  {
    var db = this;
    var promise = new Promise();
    var success = this.handleRefreshSuccess( promise );
    var failure = this.handleRefreshFailure( promise );

    promise.complete( callback, context || db );

    batchExecute(function()
    {
      db.executeRefresh( success, failure );
    });

    return promise;
  },

  onRefreshOnline: function()
  {
    var db = this;

    Rekord.debug( Rekord.Debugs.REMOTE_LOAD_RESUME, db );

    if ( db.pendingRefresh )
    {
      db.pendingRefresh = false;

      db.refresh();
    }
  },

  // Returns a model
  get: function(key)
  {
    return this.all[ this.keyHandler.buildKeyFromInput( key ) ];
  },

  filter: function(isValid)
  {
    var all = this.all;
    var filtered = [];

    for (var key in all)
    {
      var model = all[ key ];

      if ( isValid( model ) )
      {
        filtered.push( model );
      }
    }

    return filtered;
  },

  liveSave: function(key, encoded)
  {
    this.putRemoteData( encoded, key );
    this.updated();

    Rekord.debug( Rekord.Debugs.REALTIME_SAVE, this, encoded, key );
  },

  liveRemove: function(key)
  {
    if ( this.destroyLocalModel( key ) )
    {
      this.updated();
    }

    Rekord.debug( Rekord.Debugs.REALTIME_REMOVE, this, key );
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data, remoteData)
  {
    return new this.Model( data, remoteData );
  },

  addReference: function(model, key)
  {
    if (!this.noReferences)
    {
      this.all[ key || model.$key() ] = model;
    }
  },

  saveReference: function(model, key, delaySort)
  {
    if ( !this.noReferences )
    {
      this.models.put( key || model.$key(), model, delaySort );
    }
  },

  // Save the model
  save: function(model, cascade)
  {
    var db = this;

    if ( model.$isDeleted() )
    {
      Rekord.debug( Rekord.Debugs.SAVE_DELETED, db, model );

      return;
    }

    var key = model.$key();
    var existing = db.models.has( key );

    if ( existing )
    {
      db.trigger( Database.Events.ModelUpdated, [model] );

      model.$trigger( Model.Events.UpdateAndSave );
    }
    else
    {
      db.saveReference( model, key );
      db.trigger( Database.Events.ModelAdded, [model] );
      db.updated();

      model.$trigger( Model.Events.CreateAndSave );
    }

    model.$addOperation( SaveLocal, cascade );
  },

  // Remove the model
  remove: function(model, cascade)
  {
    var db = this;

    // If we have it in the models, remove it!
    this.removeFromModels( model );

    // If we're offline and we have a pending save - cancel the pending save.
    if ( model.$status === Model.Status.SavePending )
    {
      Rekord.debug( Rekord.Debugs.REMOVE_CANCEL_SAVE, db, model );
    }

    model.$status = Model.Status.RemovePending;

    model.$addOperation( RemoveLocal, cascade );
  },

  removeFromModels: function(model)
  {
    var db = this;
    var key = model.$key();

    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( Database.Events.ModelRemoved, [model] );
      db.updated();

      model.$trigger( Model.Events.Removed );
    }
  }

});

addEventful( Database );

addEventFunction( Database, 'change', Database.Events.Changes );
