Validation.Expression.today =
Validation.Expressions.push(function(expr, database)
{
  if ( expr === 'today' )
  {
    return function(value, model)
    {
      var today = new Date();

      startOfDay( today );

      return today.getTime();
    };
  }
}) - 1;
