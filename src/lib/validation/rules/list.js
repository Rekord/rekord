// in:X,Y,Z,...
listRuleGenerator('in',
  '{$alias} must be one of {$list}.',
  function isInvalid(value, model, values, map)
  {
    return !map[ value ];
  }
);

// not_in:X,Y,Z,...
listRuleGenerator('not_in',
  '{$alias} must not be one of {$list}.',
  function isInvalid(value, model, values, map)
  {
    return map[ value ];
  }
);

function listRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires a list argument';
    }

    var values = split( params, /(,)/, '\\' );

    if ( values.length === 0 )
    {
      throw params + ' is not a valid list of values for the ' + ruleName + ' rule';
    }

    var messageTemplate = determineMessage( ruleName, message );
    var list = joinFriendly( values, 'or' );
    var extra = {
      $params: params,
      $list: list
    };
    var map = mapFromArray( values, true );

    return function(value, model, setMessage)
    {
      if ( isInvalid( value, model, values, map ) )
      {
        setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate, extra ) );
      }

      return value;
    };
  };


  Validation.Rules[ ruleName ].message = defaultMessage;
}
