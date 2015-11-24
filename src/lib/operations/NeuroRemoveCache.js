function NeuroRemoveCache(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( true, 'NeuroRemoveCache' ), NeuroRemoveCache,
{

  run: function(db, model)
  {
    model.$pendingSave = false;

    if ( db.cache )
    {
      db.store.remove( model.$key(), this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});