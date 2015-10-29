function NeuroRemoveNow(model)
{
  this.reset( model );
}

NeuroRemoveNow.prototype = new NeuroOperation( true );

NeuroRemoveNow.prototype.run = function(db, model)
{
  var key = model.$key();
  
  db.models.remove( key );

  db.store.remove( key, this.success(), this.failure() );
};