
// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(database)
{
  return function (method, model, data, success, failure)
  {
    // success ( data )
    // failure ( data, status )
    
    failure( {}, 0 );
  };
};