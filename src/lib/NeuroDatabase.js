

function NeuroDatabase(options)
{  
  transfer( options, this );

  var pubsub = Neuro.getPubSub( options.pubsub );

  this.stork = new Stork( options );
  this.models = new Stork.FastMap();

  this.channel = pubsub.subscribe( options.channel, options.token );
  this.channel.onpublish = this.handlePublish( this );
}

NeuroDatabase.prototype =
{

  // Whether or not there's a load pending until we're online again
  $pendingLoad: false,

  // The method responsible for generating a key for the models in the database.
  generateKey: function()
  {
    return uuid();
  },

  // Sorts the models & notifies listeners that the database has been updated.
  updated: function()
  {
    this.models.sort( this.comparator );
    this.trigger( 'updated' );
  },

  // Handles when we receive data from the server - either from
  // a publish, refresh, or values being returned on a save.
  putRemoteData: function(encoded, key, model)
  {
    var db = this;
    var key = key || encoded[ db.key ];
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

      model.$queue(function()
      {
        Neuro.debug( Neuro.Events.REMOTE_UPDATE, encoded, model );

        return db.stork.save( model.$local );
      });
    }
    else
    {
      model = db.instantiate( decoded );

      model.$local = encoded;
      model.$saved = model.$local.$saved = copy( encoded );

      model.$queue(function()
      {
        Neuro.debug( Neuro.Events.REMOTE_CREATE, encoded, model );

        return db.stork.save( model.$local );
      });

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
        delete model[ db.key ];
        delete model.$local[ db.key ];

        model.$queue(function()
        {
          return db.stork.save( model.$local );
        });
     
        return false;
      }

      model.$queue(function()
      {
        return db.stork.remove( key );

      }, true );

      db.models.remove( key );

      model.trigger('removed');

      Neuro.debug( Neuro.Events.REMOTE_REMOVE, model );
    }
    else
    {
      db.stork.remove( key, function(removedValue)
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

    db.PROMISED = new Stork.Promise( db ).$success();

    db.stork.all(function(records, keys)
    {
      Neuro.debug( Neuro.Events.LOCAL_LOAD, records );

      db.models.reset();

      for (var i = 0; i < records.length; i++) 
      {
        var encoded = records[ i ];
        var key = keys[ i ];
        var decoded = db.decode( copy( encoded, true ) );
        var inst = db.instantiate( decoded );

        inst.$local = encoded;

        if ( encoded.$deleted )
        {
          Neuro.debug( Neuro.Events.LOCAL_RESUME_DELETE, inst );

          db.removeRemote( inst );
        }
        else
        {
          if ( !encoded.$saved )
          {
            Neuro.debug( Neuro.Events.LOCAL_RESUME_SAVE, inst );

            db.saveRemote( inst );
          }
          else
          {
            Neuro.debug( Neuro.Events.LOCAL_LOAD_SAVED, inst );
          }

          db.models.put( key, inst );
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

    var loadPromise = new Stork.Promise( this );

    var options = {
      method: 'GET',
      url: this.rest
    };

    Neuro.rest( options, loadPromise );

    loadPromise.then(
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
      },
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
    );
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

  // Waits for the given promise to finish before proceeding with the method
  waitForPending: function(promise, method, args)
  {
    var db = this;

    if ( promise.$pending() )
    {
      promise.either(function()
      {
        method.apply( db, args );
      });

      return true;
    }
    else
    {
      promise.$reset();

      return false;
    }
  },

  // Interrupt a pending promise
  interruptPending: function(promise)
  {
    promise.$clear();
  },

  // Save a model remotely
  saveRemote: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var promiseRest = new Stork.Promise( model );

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, model );

      return promise;
    }

    // Wait for other methods to finish executing
    if ( db.waitForPending( promise, this.saveRemote, arguments ) )
    {
      Neuro.debug( Neuro.Events.SAVE_REMOTE_BLOCKED, model );

      return promise;
    }

    var encoded = model.$toJSON();

    // The fields that have changed since last save
    var $saving = model.$saved ? 
      diff( encoded, model.$saved, db.fields, equals ) :
      encoded;

    var key = model.$key();

    // Make the REST call to remove the mdoel
    var options = {
      method: model.$saved ? 'PUT' : 'POST',
      url:    model.$saved ? db.rest + key : db.rest,
      data:   $saving
    };
    Neuro.rest( options, promiseRest );

    // FInish saving the model
    var finishSave = function(data)
    {
      // Check deleted one more time before updating model.
      if ( model.$deleted )
      {
        Neuro.debug( Neuro.Events.SAVE_REMOTE_DELETED, model, data );

        return promise.$failure();
      }

      // If data was returned, place it in saving to update the model and publish
      for (var prop in data)
      {
        if ( !(prop in $saving ) )
        {
          $saving[ prop ] = data[ prop ];
        }
      }

      Neuro.debug( Neuro.Events.SAVE_VALUES, $saving, model );

      // If the model hasn't been saved before - create the record where the 
      // local and model point to the same object.
      if ( !model.$saved )
      {
        model.$saved = model.$local.$saved = {};
      }
       
      // Update the model with the return data
      db.putRemoteData( $saving, key, model );

      // Success!
      promise.$success();

      Neuro.debug( Neuro.Events.SAVE_PUBLISH, $saving, model );

      // Publish saved data to everyone else
      db.channel.publish({
        op: 'SAVE',
        model: $saving,
        key: key
      });
    };

    promiseRest.then(
      function onRemoteSave(data) 
      {
        Neuro.debug( Neuro.Events.SAVE_REMOTE, model );

        // Update the model with the data saved and returned
        finishSave( data );
      },
      function onRemoteFailure(data, status) 
      {
        // A non-zero status means a real problem occurred
        if ( status === 409 ) // 409 Conflict
        {
          Neuro.debug( Neuro.Events.SAVE_CONFLICT, data, model );

          // Update the model with the data saved and returned
          finishSave( data );
        }
        else if ( status === 410 || status === 404 ) // 410 Gone, 404 Not Found
        {
          Neuro.debug( Neuro.Events.SAVE_UPDATE_FAIL, model );

          promise.$failure();

          model.$queue(function()
          {
            db.models.remove( key );

            return db.stork.remove( key );
          });
        }
        else if ( status !== 0 ) 
        {          
          Neuro.debug( Neuro.Events.SAVE_ERROR, model, status );

          promise.$failure();
        } 
        else 
        {
          // Check the network status right now
          Neuro.checkNetworkStatus();

          // If not online for sure, try saving once online again
          if (!Neuro.online) 
          {
            model.$pendingSave = true;

            Neuro.once('online', function() 
            {
              if ( model.$pendingSave )
              { 
                model.$pendingSave = false;

                Neuro.debug( Neuro.Events.SAVE_RESUME, model );

                db.saveRemote( model, true );
              }
            });

            promise.$success();
          } 
          else 
          {
            promise.$failure();
          }

          Neuro.debug( Neuro.Events.SAVE_OFFLINE, model );
        }
      }
    );

    return promise;
  },

  // Save the model locally then try remotely
  save: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var key = model.$key();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_DELETED, model );

      return promise;
    }

    // Place the model and trigger a database update.
    if ( !db.models.has( key ) )
    {
      db.models.put( key, model );
      db.updated();
    }

    return db.saveLocal( model );
  },

  // Saves the model locally
  saveLocal: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var encoded = model.$toJSON();

    // If the model is deleted, return immediately!
    if ( model.$deleted )
    {
      Neuro.debug( Neuro.Events.SAVE_LOCAL_DELETED, model );

      return promise;
    }

    // Wait for other methods to finish executing
    if ( db.waitForPending( promise, this.saveLocal, arguments ) )
    {
      Neuro.debug( Neuro.Events.SAVE_LOCAL_BLOCKED, mdoel );

      return promise;
    }

    // If this model doesn't have a local copy yet - create it.
    if ( !model.$local ) 
    {
      model.$local = encoded;
    } 
    else 
    {
      // Copy to the local copy
      transfer( encoded, model.$local );
    }

    // Save the local copy of the model.
    var localSave = db.stork.save( model.$local );

    // Finishes the local saving
    var finishSave = function()
    {
      promise.$success();

      db.saveRemote( model );
    };

    localSave.then(
      function onLocalSave(encoded) 
      {
        Neuro.debug( Neuro.Events.SAVE_LOCAL, model );

        finishSave();
      },
      function onLocalFailure(e) 
      {
        Neuro.debug( Neuro.Events.SAVE_LOCAL_ERROR, model, e );

        finishSave();
      }
    );

    return promise;
  },

  // Remove remotely
  removeRemote: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var promiseRest = new Stork.Promise( model );
    var key = model.$key();
    
    // Cancel any pending saves
    model.$pendingSave = false;
    model.$deleted = true;

    // Removals cancel other operations
    db.interruptPending( promise );

    // Wait for an existing promise to finish
    if ( db.waitForPending( promise, this.removeRemote, arguments ) )
    {
      Neuro.debug( Neuro.Events.REMOVE_REMOTE_BLOCKED, model );

      return promise;
    }

    // Make the REST call to remove the model
    var options = {
      method: 'DELETE',
      url:    this.rest + key
    };
    Neuro.rest( options, promiseRest );

    // Finish removing the model
    var removeModel = function()
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL, key, model ); 

      // We're done removing when it's removed locally.
      promise.$bindTo( db.stork.remove( key ) );

      // Notify the model that it's been removed
      model.trigger('removed');

      // Publish REMOVE
      Neuro.debug( Neuro.Events.REMOVE_PUBLISH, key, model );

      db.channel.publish({
        op: 'REMOVE',
        key: key
      });
    };

    promiseRest.then(
      function onRemoteRemove(data) 
      {
        Neuro.debug( Neuro.Events.REMOVE_REMOTE, model );

        removeModel();
      },
      function onRemoteFailure(data, status) 
      {
        if ( status === 404 || status === 410 )
        {
          Neuro.debug( Neuro.Events.REMOVE_MISSING, key, model );

          removeModel();
        }
        else if ( status !== 0 ) 
        {
          Neuro.debug( Neuro.Events.REMOVE_ERROR, status, key, model );

          promise.$failure();
        } 
        else 
        {
          // Looks like we're offline!
          Neuro.checkNetworkStatus();

          // If we are offline, wait until we're online again to resume the delete
          if (!Neuro.online) 
          {
            Neuro.once('online', function() 
            {
              Neuro.debug( Neuro.Events.REMOVE_RESUME, model );
            });

            promise.$success();
          } 
          else
          {
            promise.$failure();
          }

          Neuro.debug( Neuro.Events.REMOVE_OFFLINE, model );
        }
      }
    );

    return promise;
  },

  removeLocal: function(model)
  {
    var db = this;
    var promise = model.$promise;
    var key = model.$key();

    // Removals cancel other operations
    db.interruptPending( promise );

    // Wait for an existing promise to finish
    if ( db.waitForPending( promise, this.removeLocal, arguments ) )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_BLOCKED, model );

      return promise;
    }

    // If there is no local there's nothing to remove from anywhere!
    if ( !model.$local )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_NONE, model );

      return promise.$success();
    }

    // If this model hasn't been saved we only need to remove it from local
    // storage.
    if ( !model.$saved )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_UNSAVED, model );

      promise.$bindTo( db.stork.remove( key ) );
    }
    else
    {
      // Mark local copy as deleted in the event we're not online
      model.$local.$deleted = true;

      var localSave = db.stork.save( model.$local );

      var localRemove = function()
      {
        // If the model is saved, make sure we call removeRemote immediately.
        if ( model.$saved )
        {
          db.interruptPending( promise );

          promise.$success();

          db.removeRemote( model ); 
        }
        else
        {
          promise.$success();
        }
      };

      localSave.then(
        function onLocalRemove(encoded) 
        {
          Neuro.debug( Neuro.Events.REMOVE_LOCAL, model );

          localRemove();          
        },
        function onLocalFailure(e) 
        {
          Neuro.debug( Neuro.Events.REMOVE_LOCAL_ERROR, model, e );

          localRemove();
        }
      );
    }

    return promise;
  },

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

    // Remove it locally
    return db.removeLocal( model );
  }

};

eventize( NeuroDatabase.prototype );