
var Rests = {};

// Rekord.rest = function(options, success(data), failure(data, status))

Rests.Default =
Rekord.defaultRest =
Rekord.rest = function(database)
{

  return {

    // success ( data[] )
    // failure ( data[], status )
    all: function( options, success, failure )
    {
      success( [] );
    },

    // success( data )
    // failure( data, status )
    get: function( model, options, success, failure )
    {
      failure( null, -1 );
    },

    // success ( data )
    // failure ( data, status )
    create: function( model, encoded, options, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    update: function( model, encoded, options, success, failure )
    {
      success( {} );
    },

    // success ( data )
    // failure ( data, status )
    remove: function( model,options,  success, failure )
    {
      success( {} );
    },

    // success ( data[] )
    // failure ( data[], status )
    query: function( url, query, options, success, failure )
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
