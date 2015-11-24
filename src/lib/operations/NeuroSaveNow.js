function NeuroSaveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( false, 'NeuroSaveNow' ), NeuroSaveNow,
{

  run: function(db, model)
  {
    if ( db.cache === Neuro.Cache.Pending )
    {
      this.finish();
    }
    else
    {
      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
  }

});