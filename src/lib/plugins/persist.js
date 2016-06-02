Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{

  /**
   * Persists model values, creating a model instance if none exists already
   * (determined by the key derived from the input).
   *
   * ```javascript
   * var ListItem = Rekord({
   *  key: ['list_id', 'iten_id'],
   *  fields: ['quantity'],
   *  belongsTo: {
   *    list: { model: 'list' },
   *    item: { model: 'item' }
   *  }
   * });
   *
   * var listItem = ListItem.persist({ // creates relationship if it doesn't exist already - updates existing
   *  list: someList,
   *  item: someItem,
   *  quantity: 23
   * });
   * ```
   *
   * @method persist
   * @memberof Rekord.Model
   * @param {Object} [input] -
   *    The values to persist in the model instance found or created.
   * @return {Rekord.Model} -
   *    The saved model instance or undefined if the model database has not
   *    finished loading.
   */
  model.persist = function( input, cascade, callback, context )
  {
    var callbackContext = context || this;

    return model.findOrCreate( input, cascade, function(instance, created)
    {
      if ( !created )
      {
        instance.$save( cascade );
      }

      if ( callback )
      {
        callback.call( callbackContext, instance );
      }
    });
  };
});
