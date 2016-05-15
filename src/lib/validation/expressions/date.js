Validation.Expression.date =
Validation.Expressions.push(function(expr, database)
{
  var parsed = parseDate( expr );

  if ( parsed !== false )
  {
    var parsedTime = parsed.getTime();

    return function(value, model)
    {
      return parsedTime;
    };
  }
}) - 1;
