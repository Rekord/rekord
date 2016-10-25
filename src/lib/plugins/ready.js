addPlugin(function(model, db, options)
{

  /**
   * Invokes a function when Rekord has loaded. It's considered loaded when
   * it's loaded locally, remotely, or neither (depending on the options
   * passed to the database). The `callback` can also be invoked `persistent`ly
   * on any load event - which includes {@link Rekord.Database#refresh}.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * Task.ready( function(db) {
   *  // Tasks have been loaded, lets do something about it!
   * });
   * ```
   *
   * @method ready
   * @memberof Rekord.Model
   * @param {Function} callback -
   *    The function to invoke passing the reference of the database when it's
   *    loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @param {Boolean} [persistent=false] -
   *    Whether the `callback` function should be invoked multiple times.
   *    Depending on the state of initializing, the callback can be invoked when
   *    models are loaded locally (if the `cache` is not equal to `None`),
   *    models are loaded remotely (if `load` is Rekord.Load.All), and every time
   *    {@link Rekord.Database#refresh} is called manually OR if `autoRefresh`
   *    is specified as true and the application changes from offline to online.
   */
  model.ready = function( callback, context, persistent )
  {
    db.ready( callback, context, persistent );
  };
});
