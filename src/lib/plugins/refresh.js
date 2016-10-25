addPlugin(function(model, db, options)
{

  /**
   * Refreshs the model database from the remote source by calling
   * {@link Rekord.Database#refresh}. A `callback` can be passed to be invoked
   * when the model database has refreshed (or failed to refresh) where all
   * models that have been loaded will be passed as the first argument.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * Task.refresh( function(models) {
   *  models; // The collection of models loaded remotely (or current models if it failed to load them remotely.
   * });
   * ```
   *
   * @method refresh
   * @memberof Rekord.Model
   * @param {Function} callback -
   *    The function to invoke passing the reference model collection.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   */
  model.refresh = function( callback, context )
  {
    return db.refresh( callback, context );
  };
});
