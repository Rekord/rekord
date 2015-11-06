function NeuroSaveNow(model)
{
  this.reset( model );
}

NeuroSaveNow.prototype = new NeuroOperation( false, 'NeuroSaveNow' );

NeuroSaveNow.prototype.run = function(db, model)
{
  db.store.put( model.$key(), model.$local, this.success(), this.failure() );
};