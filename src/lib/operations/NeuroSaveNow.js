function NeuroSaveNow(model)
{
  this.reset( model );
}

extend( new NeuroOperation( false, 'NeuroSaveNow' ), NeuroSaveNow,
{

  run: function(db, model)
  {
    db.store.put( model.$key(), model.$local, this.success(), this.failure() );
  }

});