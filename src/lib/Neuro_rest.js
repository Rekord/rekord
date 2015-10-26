
// Neuro.rest = function(options, success(data), failure(data, status))

Neuro.rest = function(options, promise)
{
  // success ( data )
  // failure ( data, status )
  promise.$failure( [{}, 0] );
};