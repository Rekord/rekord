addPlugin(function(model, db, options)
{

  /**
   * Gets all model instances currently loaded, locally loaded, or remotely
   * loaded and passes it to the `callback` function.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var tasks = Task.grabAll( function(models) {
   *   models; // local or remotely loaded if it didn't exist locally.
   * })
   * ```
   *
   * @method grabAll
   * @memberof Rekord.Model
   * @param {Function} callback -
   *    The function to invoke passing the reference of the model collection
   *    when it's loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model collection of it exists locally at the moment, or undefined
   *    if models haven't been loaded yet.
   */
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
