

function NeuroDatabase(options)
{  
  transfer( options, this );

  this.models = new NeuroMap();
  
  this.rest = Neuro.rest( this );
  this.store = Neuro.store( this );
  this.live = Neuro.live( this, this.handlePublish( this ) );
}

NeuroDatabase.prototype =
{

  // Whether or not there's a load pending until we're online again
  $pendingLoad: false,

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
    var cmp = this.comparator;

    if ( isFunction( cmp ) )
    {
      this.models.sort( cmp );
    }
    else if ( isString( cmp ) )
    {
      var order = 1;

      if ( cmp.charAt(0) === '-' )
      {
        cmp = cmp.substring( 1 );
        order = -1;
      }

      this.models.sort(function(a, b)
      {
        return order * compare( a[ cmp ], b[ cmp ] );
      });
    }

    this.trigger( 'updated' );
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model)
  {
    var db = this;
    var key = key || db.getKey( encoded );
    var model = model || db.models.get( key );
    var decoded = db.decode( copy( encoded ) );

    if ( model && model.$saved )
    {
      var current = model.$toJSON();

      for (var prop in encoded)
      {
        var currentValue = current[ prop ];
        var savedValue = model.$saved[ prop ];

        if ( equals( currentValue, savedValue ) )
        {
          model[ prop ] = decoded[ prop ];
          model.$local[ prop ] = encoded[ prop ];
        }

        model.$saved[ prop ] = copy( encoded[ prop ] );
      }

      model.$addOperation( NeuroSaveNow );
    }
    else
    {
      model = db.instantiate( decoded );

      model.$local = encoded;
      model.$saved = model.$local.$saved = copy( encoded );

      model.$addOperation( NeuroSaveNow );

      db.models.put( key, model );
    }

    model.trigger('saved');

    return model;
  },

  // Destroys a model locally because it doesn't exist remotely
  destroyLocalModel: function(key)
  {
    var db = this;
    var model = db.models.get( key );

    if ( model )
    {
      if ( model.$hasChanges() )
      {
        // Removed saved history and the current ID
        delete model.$saved;
        delete model.$local.$saved;

        db.removeKey( model );
        db.removeKey( model.$local );

        model.$addOperation( NeuroSaveNow );
     
        return false;
      }

      model.$addOperation( NeuroRemoveNow );

      db.models.remove( key );

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

  // Initialize the database by loading local values and on success load
  // remove values.
  init: function()
  {
    var db = this;

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

      db.updated();

      db.loadRemote();
    });    
  },

  // Loads all data remotely
  loadRemote: function()
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
          db.$pendingLoad = true;

          Neuro.once('online', function()
          {
            Neuro.debug( Neuro.Events.REMOTE_LOAD_RESUME );

            if ( db.$pendingLoad )
            {
              db.$pendingLoad = false;

              db.loadRemote(); 
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
      db.updated();
    }

    // Start by saving locally.
    model.$addOperation( NeuroSaveLocal );
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
      db.updated();
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

    // Start by removing locally.
    model.$addOperation( NeuroRemoveLocal );
  }

};

eventize( NeuroDatabase.prototype );