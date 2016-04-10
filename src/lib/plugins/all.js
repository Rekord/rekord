Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  /**
   * Returns the reference to the collection which contains all saved models.
   *
   * ```javascript
   * var Task = Rekord({
   *   fields: ['name', 'done']
   * });
   * var t0 = Task.create({name: 't0', done: true}); // saves
   * var t1 = new Task({name: 't1'});
   * Task.all(); // [t0]
   * ```
   *
   * @method all
   * @memberof Rekord.Model
   * @return {Rekord.ModelCollection} -
   *    The reference to the collection of models.
   */
  model.all = function()
  {
    return db.models;
  };
});
