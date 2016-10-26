addPlugin(function(model, db, options)
{

  /**
   * Returns the model at the given index.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name', 'done']
   * });
   * var t0 = Task.create({name: 't0', done: true}); // saves
   * var t1 = new Task({name: 't1'});
   * Task.at( 0 ); // t0
   * ```
   *
   * @method at
   * @memberof Rekord.Model
   * @param {Number} index -
   *    The index of the model to return.
   * @return {Rekord.Model} -
   *    The reference to the model at the given index.
   */
  model.at = function(index)
  {
    return db.models[ index ];
  };

});
