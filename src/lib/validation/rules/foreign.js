// exists:X,Y
foreignRuleGenerator('exists',
  '{$alias} must match an existing {$matchAlias} in a {$class}',
  function isInvalid(value, model, models, fieldName)
  {
    return !models.contains(function isDifferentMatch(m)
    {
      return m !== model && equals( value, m.$get( fieldName ) );
    });
  }
);

// unique:X,Y
foreignRuleGenerator('unique',
  '{$alias} must be a unique {$matchAlias} in a {$class}',
  function isInvalid(value, model, models, fieldName)
  {
    return models.contains(function isDifferentMatch(m)
    {
      return m !== model && equals( value, m.$get( fieldName ) );
    });
  }
);

function foreignRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    var parts = split( params || '', /(\s*,\s*)/, '\\' );
    var modelName = parts[0] || database.name;
    var fieldName = parts[1] || field;
    var models = null;

    if ( indexOf( database.fields, fieldName ) === false )
    {
      throw fieldName + ' is not a valid field for the ' + ruleName + ' rule';
    }

    Rekord.get( modelName ).success(function(modelClass)
    {
      models = modelClass.all();
    });

    var messageTemplate = determineMessage( ruleName, message );
    var extra = {
      $class: modelName,
      $matchField: fieldName,
      $matchAlias: getAlias( fieldName )
    };

    return function(value, model, setMessage)
    {
      if ( models && isValue( value ) )
      {
        if ( isInvalid( value, model, models, fieldName ) )
        {
          setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate, extra ) );
        }
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessage;
}
