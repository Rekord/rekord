addPlugin(function(model, db, options)
{

  /**
   * Gets the local model matching the given input (or creates one) and loads
   * it from the remote source ({@link Rekord.rest}). If `callback` is specified
   * then it is invoked with the instance once it's loaded.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var t0 = Task.fetch( 34, function(task) {
   *   task; // {id: 34 name: 'Remotely Loaded'}
   * });
   * t0; // {id: 34} until remotely loaded
   * ```
   *
   * @method fetch
   * @memberof Rekord.Model
   * @param {modelInput} input -
   *    The model input used to determine the key and load the model.
   * @param {Any} [options] -
   *    The options to pass to the REST service.
   * @param {Function} [callback] -
   *    The function to invoke passing the reference of the model once it's
   *    successfully remotely loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.Model} -
   *    The model instance.
   */
  model.fetch = function( input, options, callback, context )
  {
    var key = db.keyHandler.buildKeyFromInput( input );
    var instance = db.get( key );

    if ( !instance )
    {
      instance = db.keyHandler.buildObjectFromKey( key );

      if ( isObject( input ) )
      {
        instance.$set( input );
      }
    }

    if ( isFunction( callback ) )
    {
      var callbackContext = context || this;

      instance.$once( Model.Events.RemoteGets, function()
      {
        callback.call( callbackContext, instance );
      });
    }

    instance.$refresh( Cascade.Rest, options );

    return instance;
  };
});
