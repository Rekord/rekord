Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  /**
   * Returns the collection of all local models and tries to reload them (and
   * any additional models returned) from a remote source ({@link Rekord.rest}).
   * If `callback` is specified then it is invoked with the collections all
   * models once it's loaded.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name']
   * });
   * var tasks0 = Task.fetchAll( function(tasks1) {
   *   tasks0 // tasks1
   * });
   * ```
   *
   * @method fetchAll
   * @memberof Rekord.Model
   * @param {Function} [callback] -
   *    The function to invoke passing the reference of the model collection
   *    when it's successfully remotely loaded.
   * @param {Object} [context] -
   *    The context (this) for the callback.
   * @return {Rekord.ModelCollection} -
   *    The collection of all models of this type.
   */
  model.fetchAll = function(callback, context)
  {
    db.refresh( callback, context );

    return db.models;
  };
});
