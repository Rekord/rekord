Validation.Expression.yesterday =
Validation.Expressions.push(function(expr, database)
{
  if ( expr === 'yesterday' )
  {
    return function(value, model)
    {
      var yesterday = new Date();

      yesterday.setDate( yesterday.getDate() - 1 );
      startOfDay( yesterday );

      return yesterday.getTime();
    };
  }
}) - 1;
