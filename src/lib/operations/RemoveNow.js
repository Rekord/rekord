function RemoveNow(model, cascade)
{
  this.reset( model, cascade );
}

Class.extend( Operation, RemoveNow,
{

  cascading: Cascade.Local,

  interrupts: true,

  type: 'RemoveNow',

  run: function(db, model)
  {
    var key = model.$key();

    model.$status = Model.Status.RemovePending;

    db.removeFromModels( model );

    if ( db.cache === Cache.None || !this.canCascade() )
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

    model.$status = Model.Status.Removed;

    delete model.$local;
    delete model.$saving;
    delete model.$publish;
    delete model.$saved;
  }

});
