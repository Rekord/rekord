function NeuroRemoveLocal(model)
{
  this.reset( model );
}

extend( new NeuroOperation( true, 'NeuroRemoveLocal' ), NeuroRemoveLocal, 
{

  run: function(db, model)
  {
    var key = model.$key();

    // If there is no local there's nothing to remove from anywhere!
    if ( !model.$local )
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_NONE, model );

      return this.finish();
    }

    // If this model hasn't been saved we only need to remove it from local storage.
    if ( model.$saved )
    {
      // Mark local copy as deleted in the event we're not online
      model.$local.$deleted = true;

      db.store.put( key, model.$local, this.success(), this.failure() );
    }
    else
    {
      Neuro.debug( Neuro.Events.REMOVE_LOCAL_UNSAVED, model );

      db.store.remove( key, this.success(), this.failure() );
    }
  },

  onSuccess: function(key, encoded, previousValue)
  {
    var model = this.model;

    Neuro.debug( Neuro.Events.REMOVE_LOCAL, model );

    if ( model.$saved )
    {
      model.$addOperation( NeuroRemoveRemote );
    }
  },

  onFailure: function(e)
  {
    var model = this.model;

    Neuro.debug( Neuro.Events.REMOVE_LOCAL_ERROR, model, e );

    if ( model.$saved )
    {
      model.$addOperation( NeuroRemoveRemote );
    }
  }

});