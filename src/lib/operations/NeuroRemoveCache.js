function NeuroRemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( true, 'NeuroRemoveCache' ), NeuroRemoveCache,
{

  run: function(db, model)
  {
    model.$pendingSave = false;

    if ( db.cache == Neuro.Cache.None )
    {
      this.finish();
    }
    else
    {
      db.store.remove( model.$key(), this.success(), this.failure() );
    }
  }

});