addPlugin(function(model, db, options)
{

  /**
   * Returns an instance of a model or model collection with remote data (from
   * the server). If the model(s) exist locally then the values passed in will
   * overwrite the current values of the models. This is typically used to
   * bootstrap data from the server in your webpage.
   *
   * ```javascript
   * var User = Rekord({
   *   fields: ['name', 'email']
   * });
   * var currentUser = User.boot({
   *   id: 1234,
   *   name: 'Administrator',
   *   email: 'rekordjs@gmail.com'
   * });
   * var friends = User.boot([
   *   { id: 'c1', name: 'Cat 1', email: 'cat1@gmail.com' },
   *   { id: 'c2', name: 'Cat 2', email: 'cat2@gmail.com' }
   * ]);
   * ```
   *
   * @method boot
   * @memberof Rekord.Model
   * @param {modelInput[]|Object}
   * @return {Rekord.ModelCollection|Rekord.Model} -
   *    The collection or model bootstrapped.
   */
  model.boot = function( input )
  {
    if ( isArray( input ) )
    {
      return ModelCollection.create( db, input, true );
    }
    else if ( isObject( input ) )
    {
      return db.putRemoteData( input );
    }

    return input;
  };
});
