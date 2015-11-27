function NeuroSaveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( new NeuroOperation( false, 'NeuroSaveNow' ), NeuroSaveNow,
{

  run: function(db, model)
  {
    var key = model.$key();
    var local = model.$local;

    if ( db.cache === Neuro.Cache.All && key && local )
    {
      db.store.put( key, local, this.success(), this.failure() );
    }
    else
    {
      this.finish();
    }
  }

});