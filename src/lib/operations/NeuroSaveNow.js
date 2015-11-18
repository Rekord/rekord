function NeuroSaveNow(model)
{
  this.reset( model );
}

extend( new NeuroOperation( false, 'NeuroSaveNow' ), NeuroSaveNow,
{

  run: function(db, model)
  {
    if ( db.cachePending && db.cache !== false )
    {
      this.finish();
    }
    else
    {
      db.store.put( model.$key(), model.$local, this.success(), this.failure() );
    }
  }

});