// after:today
dateRuleGenerator('after',
  '{$alias} must be after {$date}.',
  function isInvalid(value, date) {
    return value < endOfDay( date );
  }
);

// after_on:tomorrow
dateRuleGenerator('after_on',
  '{$alias} must be after or equal to {$date}.',
  function isInvalid(value, date) {
    return value < date;
  }
);

// before:yesterday
dateRuleGenerator('before',
  '{$alias} must be before {$date}.',
  function isInvalid(value, date) {
    return value > date;
  }
);

// before_on:+2days
dateRuleGenerator('before_on',
  '{$alias} must be before or equal to {$date}.',
  function isInvalid(value, date) {
    return value > endOfDay( date );
  }
);

// date
ruleGenerator('date_like',
  '{$alias} must be a valid date.',
  function isInvalid(value, model, setValue) {
    var parsed = parseDate( value );
    var invalid = parsed === false;
    if ( !invalid ) {
      setValue( parsed.getTime() );
    }
    return invalid;
  }
);

function dateRuleGenerator(ruleName, defaultMessage, isInvalid)
{
  Validation.Rules[ ruleName ] = function(field, params, database, getAlias, message)
  {
    if ( !params )
    {
      throw ruleName + ' validation rule requires a date expression argument';
    }

    var dateExpression;

    if ( isString( params ) )
    {
      dateExpression = Validation.parseExpression( params, database );
    }
    else if ( isFunction( params ) )
    {
      dateExpression = params;
    }
    else
    {
      var parsed = parseDate( params );

      if ( parsed !== false )
      {
        var parsedTime = parsed.getTime();

        dateExpression = function()
        {
          return parsedTime;
        };
      }
    }

    if ( !dateExpression || dateExpression === noop )
    {
      throw params + ' is not a valid date expression for the ' + ruleName + ' rule';
    }

    var messageTemplate = determineMessage( ruleName, message );
    var extra = {
      $date: params
    };

    return function(value, model, setMessage)
    {
      var parsed = parseDate( value );

      if ( parsed !== false )
      {
        value = parsed.getTime();

        var date = dateExpression( value, model );

        if ( isNumber( date ) && isInvalid( value, date ) )
        {
          setMessage( generateMessage( field, getAlias( field ), value, model, messageTemplate, extra ) );
        }
      }

      return value;
    };
  };

  Validation.Rules[ ruleName ].message = defaultMessage;
}
