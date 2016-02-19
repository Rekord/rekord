
// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
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
    query: function( query, success, failure )
    {
      success( [] );
    }

  };

};