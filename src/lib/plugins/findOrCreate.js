addPlugin(function(model, db, options)
{

  /**
   * Finds or creates a model instance based on the given values. The key for
   * the model must be derivable from the given values - or this function will
   * always create a new model instance.
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
   * var listItem = ListItem.findOrCreate({
   *  list: someList,
   *  item: someItem,
   *  quantity: 23
   * });
   * // do stuff with listItem
   * ```
   *
   * @method persist
   * @memberof Rekord.Model
   * @param {Object} [input] -
   *    The values to set in the model instance found or created.
   * @return {Rekord.Model} -
   *    The saved model instance or undefined if the model database has not
   *    finished loading.
   */
  model.findOrCreate = function( input, cascade, callback, context )
  {
    var callbackContext = context || this;
    var instance = db.get( input );
    var created = false;

    if ( !instance )
    {
      db.grabModel( input, function(grabbed)
      {
        if ( !grabbed )
        {
          instance = model.create( input, cascade );
          created = true;
        }
        else
        {
          instance = grabbed;
          instance.$set( input );

          // grab model created an instance that needs to be "created"
          if ( !instance.$isSaved() )
          {
            instance.$save( cascade );
          }
        }

        if ( callback )
        {
          callback.call( callbackContext, instance, created );
        }
      });
    }
    else
    {
      instance.$set( input );

      if ( callback )
      {
        callback.call( callbackContext, instance, created );
      }
    }

    return instance;
  };
});
