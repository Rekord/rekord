function NeuroSaveLocal(model)
{
  this.reset( model );
}

NeuroSaveLocal.prototype = new NeuroOperation( false );

NeuroSaveLocal.prototype.run = function(db, model)
{
  // If the model is deleted, return immediately!
  if ( model.$deleted )
  {
    Neuro.debug( Neuro.Events.SAVE_LOCAL_DELETED, model );

    return this.finish();
  }

  var encoded = model.$toJSON();

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

  db.store.put( model.$key(), model.$local, this.success(), this.failure() );
};

NeuroSaveLocal.prototype.onSuccess = function(key, encoded, previousValue)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.SAVE_LOCAL, model );

  this.tryNext( NeuroSaveRemote );
};

NeuroSaveLocal.prototype.onFailure = function(e)
{
  var model = this.model;

  Neuro.debug( Neuro.Events.SAVE_LOCAL_ERROR, model, e );

  this.tryNext( NeuroSaveRemote );
};