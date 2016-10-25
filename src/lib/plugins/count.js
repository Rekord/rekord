addPlugin(function(model, db, options)
{

  /**
   * Counts the number of models which pass the given where expression.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name', 'done']
   * });
   * var t0 = Task.create({name: 't0', done: true}); // saves
   * var t1 = Task.create({name: 't1', done: false});
   * Task.count('done', true); // 1
   * ```
   *
   * @method count
   * @memberof Rekord.Model
   * @return {Number} -
   *    The number of models which pass the given where expression.
   */
  model.count = function(properties, value, equals)
  {
    return db.models.countWhere( properties, value, equals );
  };
});
