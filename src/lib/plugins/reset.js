addPlugin(function(model, db, options)
{

  model.reset = function(failOnPendingChanges, removeListeners)
  {
    return db.reset( failOnPendingChanges, removeListeners );
  };

});
