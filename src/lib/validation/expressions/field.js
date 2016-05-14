Validation.Expression.field =
Validation.Expressions.push(function(expr, database)
{
  if ( indexOf( database.fields, expr ) )
  {
    return function(value, model)
    {
      return model.$get( expr );
    };
  }
}) - 1;
