function NeuroRemoveNow(model, cascade)
{
  this.reset( model, cascade );
}

extend( NeuroOperation, NeuroRemoveNow,
{

  interrupts: true,

  type: 'NeuroRemoveNow',

  run: function(db, model)
  {
    var key = model.$key();

    model.$status = NeuroModel.Status.RemovePending;

    db.removeFromModels( model );

    if ( db.cache === Neuro.Cache.None )
    {
      this.finishRemove();
      this.finish();
    }
    else
    {
      db.store.remove( key, this.success(), this.failure() );
    }
  },

  onSuccess: function()
  {
    this.finishRemove();
  },

  onFailure: function()
  {
    this.finishRemove();
  },

  finishRemove: function()
  {
    var model = this.model;

    model.$status = NeuroModel.Status.Removed;

    delete model.$local;
    delete model.$saving;
    delete model.$publish;
    delete model.$saved;
  }

});