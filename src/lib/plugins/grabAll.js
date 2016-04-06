Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  model.grabAll = function( callback, context )
  {
    var callbackContext = context || this;
    var models = db.models;

    if ( models.length )
    {
      callback.call( callbackContext, models );
    }
    else
    {
      db.ready(function()
      {
        if ( models.length )
        {
          callback.call( callbackContext, models );
        }
        else
        {
          db.refresh(function()
          {
            callback.call( callbackContext, models );
          });
        }
      });
    }

    return models;
  };
});