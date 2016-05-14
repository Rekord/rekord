Validation.Expression.tomorrow =
Validation.Expressions.push(function(expr, database)
{
  if ( expr === 'tomorrow' )
  {
    return function(value, model)
    {
      var tomorrow = new Date();

      tomorrow.setDate( tomorrow.getDate() + 1 );
      startOfDay( tomorrow );

      return tomorrow.getTime();
    };
  }
}) - 1;
