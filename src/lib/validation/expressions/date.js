Validation.Expression.date =
Validation.Expressions.push(function(expr, database)
{
  var parsed = tryParseDate( expr );

  if ( !isNaN(parsed) )
  {
    return function(value, model)
    {
      return parsed;
    };
  }
}) - 1;
