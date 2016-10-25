addPlugin(function(model, db, options)
{

  /**
   * Returns the model instance identified with the given input. This includes
   * saved and unsaved models. If a `callback` is given the model will be passed
   * to the function. The `callback` method is useful for waiting for Rekord
   * to finish initializing (which includes loading models from local storage
   * followed by remote storage if configured) and returning a model instance.
   * If Rekord has finished initializing and the model doesn't exist locally
   * then it is fetched from the remoute source using {@link Rekord.rest}.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var t0 = Task.get( 34 ); // only looks at models currently loaded
   * var t1 = Task.get( 23, function(model) {
   *   model; // local or remotely loaded if it didn't exist locally - could be null if it doesn't exist at all
   * })
   * ```
   *
   * @method get
   * @memberof Rekord.Model
   * @param {modelInput} input -
   *    The model input used to determine the key and load the model.
   * @param {Function} [callback] -
   *    The function to invoke passing the reference of the model when it's
   *    successfully found.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model instance if `callback` is not given - or undefined if the
   *    input doesn't resolve to a model or `callback` is given.
   */
  model.get = function( input, callback, context )
  {
    if ( isFunction( callback ) )
    {
      db.grabModel( input, callback, context );
    }
    else
    {
      return db.get( input );
    }
  };
});
