
// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
{
  
  return {

    // success ( data[] )
    // failure ( data[], status )
    all: function( success, failure )
    {
      failure( [], 0 );
    },

    // success ( data )
    // failure ( data, status )
    create: function( model, encoded, success, failure )
    {
      failure( {}, 0 );
    },

    // success ( data )
    // failure ( data, status )
    update: function( model, encoded, success, failure )
    {
      failure( {}, 0 );
    },

    // success ( data )
    // failure ( data, status )
    remove: function( model, success, failure )
    {
      failure( {}, 0 );
    }

  };

};