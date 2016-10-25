addPlugin(function(model, db, options)
{

  /**
   * Creates a collection of models.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name']
   * });
   * var t0 = Task.create({id: 34, name: 't0'});
   * var t1 = new Task({name: 't1'});
   * var t2 = {name: 't2'};
   *
   * var c = Task.collect( 34, t1, t2 ); // or Task.collect( [34, t1, t2] )
   * c; // [t0, t1, t2]
   * ```
   *
   * @method collect
   * @memberof Rekord.Model
   * @param {modelInput[]|...modelInput} models -
   *    The array of models to to return as a collection.
   * @return {Rekord.ModelCollection} -
   *    The collection created.
   */
  model.collect = function(a)
  {
    var models = arguments.length > 1 || !isArray(a) ?
      AP.slice.call( arguments ) : a;

    return new ModelCollection( db, models );
  };
});
