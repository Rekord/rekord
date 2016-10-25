addPlugin(function(model, db, options)
{

  /**
   * Creates a model instance, saves it, and returns it.
   *
   * ```javascript
   * var Task = Rekord({
   *  fields: ['name'],
   *  defaults: {
   *    name: 'New Task'
   *  }
   * });
   * var t0 = Task.create({id: 34, name: 't0'});
   * var t1 = Task.create({name: 't1'}); // id generated with uuid
   * var t2 = Task.create(); // name populated with default 'New Task'
   * ```
   *
   * @method create
   * @memberof Rekord.Model
   * @param {Object} [props] -
   *    The initial values for the new model - if any.
   * @return {Rekord.Model} -
   *    The saved model instance.
   */
  model.create = function( props, cascade )
  {
    var instance = isObject( props ) ?
      db.createModel( props ) :
      db.instantiate();

    instance.$save( cascade );

    return instance;
  };
});
