
// Rekord.rest = function(options, success(data), failure(data, status))

Rekord.defaultRest = Rekord.rest = function(database)
{

  return {

    // success ( data[] )
    // failure ( data[], status )
    all: function( success, failure )
    {
      success( [] );
    },

    // success( data )
    // failure( data, status )
    get: function( model, success, failure )
    {
      failure( null, -1 );
    },

    // success ( data )
    // failure ( data, status )
    create: function( model, encoded, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    update: function( model, encoded, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    remove: function( model, success, failure )
    {
      success( {} );
    },

    // success ( data[] )
    // failure ( data[], status )
    query: function( url, query, success, failure )
    {
      success( [] );
    }

  };

};

/**
 * Sets the rest implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides rest implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setRest = function(factory, overwrite)
{
  if ( !Rekord.restSet || overwrite )
  {
    Rekord.rest = factory;
    Rekord.restSet = true;
  }
};
