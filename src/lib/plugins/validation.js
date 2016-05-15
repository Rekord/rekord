Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var validation = options.validation || Database.Defaults.validation;

  if ( isEmpty( validation ) )
  {
    return;
  }

  var rules = validation.rules || {};
  var messages = validation.messages || {};
  var aliases = validation.aliases || {};
  var required = !!validation.required;

  function getAlias(field)
  {
    return aliases[ field ] || field;
  }

  db.validations = {};

  for ( var field in rules )
  {
    db.validations[ field ] = Validation.parseRules( rules[ field ], field, db, getAlias, messages[ field ] )
  }

  addMethod( model.prototype, '$validate', function()
  {
    var $this = this;

    this.$trigger( Model.Events.PreValidate, [this] );

    this.$valid = true;
    this.$validations = {};
    this.$validationMessages.length = 0;

    for (var field in db.validations)
    {
      var chain = db.validations[ field ];
      var value = this.$get( field );
      var fieldValid = true;

      var setMessage = function(message)
      {
        // Only accept for the first valid message
        if ( message && fieldValid )
        {
          fieldValid = false;

          $this.$validations[ field ] = message;
          $this.$validationMessages.push( message );
          $this.$valid = false;
        }
      };

      for (var i = 0; i < chain.length && fieldValid && value !== Validation.Stop; i++)
      {
        value = chain[ i ]( value, this, setMessage );
      }
    }

    this.$trigger( this.$valid ? Model.Events.ValidatePass : Model.Events.ValidateFail, [this] );

    return this.$valid;
  });

  replaceMethod( model.prototype, '$init', function($init)
  {
    return function()
    {
      this.$valid = undefined;
      this.$validations = {};
      this.$validationMessages = [];

      return $init.apply( this, arguments );
    };
  });

  if ( required )
  {
    replaceMethod( model.prototype, '$save', function($save)
    {
      return function()
      {
        if ( this.$isDeleted() )
        {
          Rekord.debug( Rekord.Debugs.SAVE_DELETED, this.$db, this );

          return Promise.resolve( this );
        }

        if ( !this.$validate() )
        {
          return Promise.resolve( this );
        }

        return $save.apply( this, arguments );
      };
    });
  }
});

Model.Events.PreValidate = 'pre-validate';

Model.Events.ValidatePass = 'validate-pass';

Model.Events.ValidateFail = 'validate-fail';

var Validation =
{
  Rules: {},
  Expression: {},
  Expressions: [],
  Delimiter: /([|])/,
  Escape: '\\',
  RuleSeparator: ':',
  Stop: {},

  parseRules: function(rules, field, database, getAlias, message)
  {
    var validators = [];

    if ( isString( rules ) )
    {
      rules = split( rules, this.Delimiter, this.Escape );
    }

    if ( isArray( rules ) )
    {
      for (var i = 0; i < rules.length; i++)
      {
        var rule = rules[ i ];
        var validator = this.parseRule( rule, field, database, getAlias, message );

        validators.push( validator );
      }
    }
    else if ( isObject( rules ) )
    {
      for (var rule in rules)
      {
        var ruleMessage = rules[ rule ];
        var validator = this.parseRule( rule, field, database, getAlias, ruleMessage || message );

        validators.push( validator );
      }
    }

    return validators;
  },

  parseRule: function(rule, field, database, getAlias, message)
  {
    var colon = rule.indexOf( this.RuleSeparator );
    var ruleName = colon === -1 ? rule : rule.substring( 0, colon );

    if ( ruleName.charAt( 0 ) === '$' )
    {
      return this.customValidator( ruleName, field, database, getAlias, message );
    }

    var ruleParams = colon === -1 ? undefined : rule.substring( colon + 1 );
    var validatorFactory = Validation.Rules[ ruleName ];

    if ( !validatorFactory )
    {
      throw ruleName + ' is not a valid rule';
    }

    return validatorFactory( field, ruleParams, database, getAlias, message );
  },

  parseExpression: function(expr, database)
  {
    var parsers = Validation.Expressions;

    for (var i = 0; i < parsers.length; i++)
    {
      var parser = parsers[ i ];
      var expressionFunction = parser( expr, database );

      if ( isFunction( expressionFunction ) )
      {
        return expressionFunction; // (value, model)
      }
    }

    return noop;
  },

  customValidator: function(functionName, field, database, getAlias, message)
  {
    return function(value, model, setMessage)
    {
      var result = model[ functionName ]( value, getAlias, message );

      if ( isString( result ) )
      {
        setMessage( result );
      }

      return value;
    };
  }
};

// Export

Rekord.Validation = Validation;

Rekord.ruleGenerator = ruleGenerator;
Rekord.rangeRuleGenerator = rangeRuleGenerator;
Rekord.collectionRuleGenerator = collectionRuleGenerator;
Rekord.dateRuleGenerator = dateRuleGenerator;
Rekord.fieldListRuleGenerator = fieldListRuleGenerator;
Rekord.fieldsRuleGenerator = fieldsRuleGenerator;
Rekord.foreignRuleGenerator = foreignRuleGenerator;
Rekord.subRuleGenerator = subRuleGenerator;
Rekord.listRuleGenerator = listRuleGenerator;
Rekord.regexRuleGenerator = regexRuleGenerator;
Rekord.sizeRuleGenerator = sizeRuleGenerator;

Rekord.joinFriendly = joinFriendly;
Rekord.tryParseFloat = tryParseFloat;
Rekord.tryParseInt = tryParseInt;
Rekord.startOfDay = startOfDay;
Rekord.endOfDay = endOfDay;
Rekord.determineMessage = determineMessage;
Rekord.mapFromArray = mapFromArray;
Rekord.checkNoParams = checkNoParams;
Rekord.generateMessage = generateMessage;
