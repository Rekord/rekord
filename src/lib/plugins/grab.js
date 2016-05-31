Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  /**
   * Gets the model instance identified with the given input and passes it to the
   * `callback` function. If Rekord is not finished initializing this function
   * will wait until it is and check for the model. If it still doesn't exist
   * locally it is loaded from a remote source using {@link Rekord.rest}. If the
   * model doesn't exist at all a null value will be returned to the function.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var t1 = Task.grab( 23, function(model) {
   *   model; // local or remotely loaded if it didn't exist locally - could be null if it doesn't exist at all
   * })
   * ```
   *
   * @method grab
   * @memberof Rekord.Model
   * @param {modelInput} input -
   *    The model input used to determine the key and load the model.
   * @param {Function} callback -
   *    The function to invoke passing the reference of the model when it's
   *    successfully found.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model instance of it exists locally at the moment, or undefined
   *    if the model hasn't been loaded yet.
   */
  model.grab = function( input, callback, context )
  {
    var callbackContext = context || this;
    var instance = db.get( input );

    if ( instance )
    {
      callback.call( callbackContext, instance );
    }
    else
    {
      db.grabModel( input, function(instance)
      {
        if ( instance )
        {
          callback.call( callbackContext, instance );
        }
        else
        {
          model.fetch( input, callback, context );
        }
      });
    }

    return instance;
  };
});
