

function NeuroDatabase(options)
{  
  transfer( options, this );

  this.models = new NeuroMap();

  this.rest = Neuro.rest( this );
  this.store = Neuro.store( this );
  this.live = Neuro.live( this, this.handlePublish( this ) );

  this.relations = {};

  this.setComparator( this.comparator );
  this.setRevision( this.revision );
}

NeuroDatabase.prototype =
{

  // Whether or not there's a load pending until we're online again
  pendingRefresh: false,

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

  // Gets the key from the given model
  getKey: function(model)
  {
    var k = this.key;
    var key = null;

    if ( isArray(k) )
    {
      var ks = this.keySeparator || '/';
      
      key = '';
      
      for (var i = 0; i < k.length; i++) 
      {
        if (i > 0) 
        {
          key += ks;
        }

        key += model[ k[i] ];
      }
    }
    else
    {
      key = model[ k ];

      if (!key)
      {
        model[ k ] = key = uuid();
      }
    }

    return key;
  },

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.sort();
    this.trigger( 'updated' );
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
        return (revision in a && revision in b) ? (a[ revision ] - b[ revision ]) : false;
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
  setComparator: function(comparator)
  {
    if ( isFunction( comparator ) )
    {
      this.comparatorFunction = comparator;
    }
    else if ( isString( comparator ) )
    {
      if ( comparator.charAt(0) === '-' )
      {
        comparator = comparator.substring( 1 );

        this.comparatorFunction = function(a, b)
        {
          return compare( b[ comparator ], a[ comparator ] );
        };
      }
      else
      {
        this.comparatorFunction = function(a, b)
        {
          return compare( a[ comparator ], b[ comparator ] );
        };
      }
    }
    else
    {
      this.comparatorFunction = null;
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
    var comparator = this.comparatorFunction;

    if ( !comparator )
    {
      return true;
    }

    var models = this.models.values;

    for (var i = 0, n = models.length - 1; i < n; i++)
    {
      if ( comparator( models[ i ], models[ i + 1 ] ) > 0 )
      {
        return false;
      }
    }

    return true;
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model)
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
        Neuro.debug( Neuro.Events.SAVE_OLD_REVISION, model, encoded );

        return;
      }
    }

    if ( model && model.$saved )
    {
      var current = model.$toJSON();
      var conflicts = {};
      var conflicted = false;
      var updated = {};

      for (var prop in encoded)
      {
        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        if ( equals( currentValue, savedValue ) )
        {
          model[ prop ] = decoded[ prop ];
          updated[ prop ] = encoded[ prop ];

          if ( db.cache !== false )
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
        model.trigger( 'partial-update', [encoded, conflicts] );
      }
      else
      {
        model.trigger( 'full-update', [encoded, updated] );
      }

      model.trigger( 'remote-update', [encoded] );

      if ( db.cache !== false )
      {
        model.$addOperation( NeuroSaveNow ); 
      }
    }
    else
    {
      model = db.instantiate( decoded );

      if ( db.cache !== false )
      {
        model.$local = encoded;
        model.$saved = model.$local.$saved = copy( encoded );

        model.$addOperation( NeuroSaveNow );
      }
      else
      {
        model.$saved = encoded;
      }
    }

    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( 'model-added', [model] );

      model.trigger( 'saved' );
    }

    return model;
  },

  destroyLocalUncachedModel: function(model)
  {
    var db = this;

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        delete model.$saved;

        db.removeKey( model );

        model.trigger( 'detach' );

        return false;
      }

      model.trigger( 'remote-remove' );

      db.models.remove( key );
      db.trigger( 'model-removed', [model] );

      model.trigger('removed');

      Neuro.debug( Neuro.Events.REMOTE_REMOVE, model );

      return true;
    }

    return false;
  },

  destroyLocalCachedModel: function(model, key)
  {
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

        model.trigger( 'detach' );

        model.$addOperation( NeuroSaveNow );
     
        return false;
      }

      model.trigger( 'remote-remove' );

      model.$addOperation( NeuroRemoveNow );

      db.models.remove( key );
      db.trigger( 'model-removed', [model] );

      model.trigger('removed');

      Neuro.debug( Neuro.Events.REMOTE_REMOVE, model );
    }
    else
    {
      db.store.remove( key, function(removedValue)
      {
        if (removedValue) 
        {
          Neuro.debug( Neuro.Events.REMOTE_REMOVE, removedValue );
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

    if ( db.cache === false )
    {
      return db.destroyLocalUncachedModel( model );
    }
    else
    {
      return db.destroyLocalCachedModel( model, key );
    }
  },

  // Initialize the database by loading local values and on success load
  // remove values.
  init: function()
  {
    var db = this;

    if ( db.cache === false )
    {
      if ( db.loadRemote !== false )
      {
        db.refresh();
      }

      return;
    }

    db.store.all(function(records, keys)
    {
      Neuro.debug( Neuro.Events.LOCAL_LOAD, records );

      db.models.reset();

      for (var i = 0; i < records.length; i++) 
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var model = db.instantiate( decoded );

        model.$local = encoded;

        if ( encoded.$deleted )
        {
          Neuro.debug( Neuro.Events.LOCAL_RESUME_DELETE, model );

          model.$addOperation( NeuroRemoveRemote );
        }
        else
        {
          if ( !encoded.$saved )
          {
            Neuro.debug( Neuro.Events.LOCAL_RESUME_SAVE, model );

            model.$addOperation( NeuroSaveRemote );
          }
          else
          {
            Neuro.debug( Neuro.Events.LOCAL_LOAD_SAVED, model );

            model.$local.$saved = model.$saved;
          }

          db.models.put( key, model );
        }
      }

      db.trigger( 'local-load' );

      db.updated();

      if ( db.loadRemote !== false )
      {
        db.refresh();
      }
    });    
  },

  // Loads all data remotely
  refresh: function()
  {
    var db = this;
    var options = {
      method: 'GET',
      url: db.api
    };

    db.rest( options, onModels, onLoadError );
    
    function onModels(models) 
    {
      var mapped = {};

      for (var i = 0; i < models.length; i++)
      {
        var model = db.putRemoteData( models[ i ] );
        var key = model.$key();

        mapped[ key ] = model;
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
            Neuro.debug( Neuro.Events.REMOTE_LOAD_REMOVE, k );

            db.destroyLocalModel( k );
          }
        }
      }

      db.trigger( 'remote-load' );

      db.updated();

      Neuro.debug( Neuro.Events.REMOTE_LOAD, models );
    }

    function onLoadError(models, status) 
    {
      if ( status === 0 )
      {
        Neuro.checkNetworkStatus();

        if ( !Neuro.online )
        {
          db.pendingRefresh = true;

          Neuro.once('online', function()
          {
            Neuro.debug( Neuro.Events.REMOTE_LOAD_RESUME );

            if ( db.pendingRefresh )
            {
              db.pendingRefresh = false;

              db.refresh(); 
            }
          })
        }

        Neuro.debug( Neuro.Events.REMOTE_LOAD_OFFLINE );
      }
      else
      {
        Neuro.debug( Neuro.Events.REMOTE_LOAD_ERROR, status );
      }
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
      var ks = this.keySeparator || '/';
      var keyString = '';

      for (var i = 0; i < key.length; i++)
      {
        if (i > 0)
        {
          keyString += ks;
        }

        keyString += key[ i ];
      }

      key = keyString;
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
      case 'SAVE':

        db.putRemoteData( encoded, key );
        db.updated();

        Neuro.debug( Neuro.Events.REALTIME_SAVE, message.model );
        break;

      case 'REMOVE':

        if ( db.destroyLocalModel( key ) )
        {
          db.updated(); 
        }

        Neuro.debug( Neuro.Events.REALTIME_REMOVE, key );
        break;
      }
    };
  },

  // Return an instance of the model with the data as initial values
  instantiate: function(data)
  {
    return new this.model( data );
  },

  // Converts properties in data into their storable form
  encode: function(data)
  {
    return data;
  },

  // Converts properties in rawData from their storable form to their desired
  decode: function(rawData)
  {
    return rawData;
  },

  // Save the model
  save: function(model)
  {
    var db = this;
    var key = model.$key();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_DELETED, model );

      return;
    }

    // Place the model and trigger a database update.
    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.trigger( 'model-added', [model] );
      db.updated();

      model.trigger('saved');
    }
    else
    {
      db.trigger( 'model-updated', [model] );
    }

    if ( db.cache === false )
    {
      // Save remotely
      model.$addOperation( NeuroSaveRemote );
    }
    else
    {
      // Start by saving locally.
      model.$addOperation( NeuroSaveLocal );
    }
  },

  // Remove the model 
  remove: function(model)
  {
    var db = this;
    var key = model.$key();

    // If we have it in the models, remove it!
    if ( db.models.has( key ) )
    {
      db.models.remove( key );
      db.trigger( 'model-removed', [model] );
      db.updated();

      model.trigger('removed');
    }

    // Mark as deleted right away
    model.$deleted = true;

    // If we're offline and we have a pending save - cancel the pending save.
    // TODO Add Debug here?
    if ( model.$pendingSave )
    {
      Neuro.debug( Neuro.Events.REMOVE_CANCEL_SAVE, model );

      model.$pendingSave = false; 
    }

    if ( db.cache === false )
    {
      // Remove remotely
      model.$addOperation( NeuroRemoveRemote );
    }
    else
    { 
      // Start by removing locally.
      model.$addOperation( NeuroRemoveLocal );
    }
  }

};

eventize( NeuroDatabase.prototype );