addPlugin(function(model, db, options)
{
  
  model.clear = function(removeListeners)
  {
    return db.clear( removeListeners );
  };

});
