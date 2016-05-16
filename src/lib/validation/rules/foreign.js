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

// 'ruleName'
// 'ruleName:name'
// 'ruleName:,field'
// 'ruleName:name,field'
// 'ruleName:name,field': '...'
// 'ruleName': {input: {field: 'field', model: 'name'}, message: '...'}
// 'ruleName': {input: {field: 'field', model: ModelClass}, message: '...'}
// 'ruleName': {input: {field: 'field', models: [...]}, message: '...'}
// 'ruleName': {field: 'field', model: 'name'}
// 'ruleName': {field: 'field', model: ModelClass}
// 'ruleName': {field: 'field', models: [...]}
function foreignRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    var modelName, models, fieldName;

    if ( !isValue( params ) || isString( params ) )
    {
      var parts = split( params || '', /(\s*,\s*)/, '\\' );
      modelName = parts[0] || database.name;
      fieldName = parts[1] || field;
      models = null;
    }
    else if ( isArray( params ) )
    {
      modelName = isString( params[0] ) ? params.shift() : database.name;
      fieldName = isString( params[0] ) ? params.shift() : field;
      models = new ModelCollection( database, params );
    }
    else if ( isObject( params ) )
    {
      modelName = params.model || database.name;
      fieldName = params.field || field;
      models = params.models;
    }

    if ( !models )
    {
      if ( !modelName )
      {
        throw 'model, model class, or models is required for ' + ruleName + ' rule';
      }

      if ( isString( modelName ) )
      {
        Rekord.get( modelName ).success(function(modelClass)
        {
          models = modelClass.all();
        });
      }
      else if ( isRekord( modelName ) )
      {
        models = modelName.all();
      }
    }

    if ( indexOf( database.fields, fieldName ) === false )
    {
      throw fieldName + ' is not a valid field for the ' + ruleName + ' rule';
    }

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
