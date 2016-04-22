

Rekord.Havings = {};

function saveHaving(name, having)
{
  return Rekord.Havings[ name ] = createHaving( having );
}

function createHaving(having)
{
  if ( isFunction( having ) )
  {
    return having;
  }
  else if ( isString( having ) )
  {
    if ( having in Rekord.Havings )
    {
      return Rekord.Havings[ having ];
    }

    return function hasValue(model)
    {
      return isValue( model ) && isValue( model[ having ] );
    };
  }
  else
  {
    return function hasAll()
    {
      return true;
    };
  }
}
