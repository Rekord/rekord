
// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
{
  return function (options, success, failure)
  {
    // success ( data )
    // failure ( data, status )
    
    failure( {}, 0 );
  };
};