
// field
// relation.field
// relations[pluckValue]
// relations?savedWhere[pluckValue]
// relations{pluckKey: pluckValue}
// relation(subprojection)
// relations(subprojection)
// relations?savedWhere(subprojection)
// expression|filter
// expression?savedWhere
// alias:expression
// expression#resolve

function Projection(database, input)
{
  this.database = database;
  this.input = input;
  this.projections = {};

  for (var i = 0; i < input.length; i++)
  {
    this.addProjection( input[ i ] );
  }
}

Class.create( Projection,
{

  addProjection: function(input)
  {
    var projection = this;
    var alias = input;
    var aliasIndex = input.indexOf( Projection.ALIAS_DELIMITER );

    if (aliasIndex > 0)
    {
      alias = input.substring( 0, aliasIndex );
      input = input.substring( aliasIndex + 1 );
    }

    var word = '';
    var words = [];
    var tokens = ['property'];
    var types = [this.database];
    var i = 0;
    var resolvers = [];

    var processWord = function(word)
    {
      if (!word)
      {
        return;
      }

      var token = tokens[0];
      var handler = Projection.TOKEN_HANDLER[ token ];

      words.unshift( word );

      if (handler && handler.post)
      {
        resolvers.push( handler.post( words, tokens, types, projection ) );
      }
    };

    var processToken = function(token)
    {
      var handler = Projection.TOKEN_HANDLER[ token ];

      tokens.unshift( token );

      if (handler && handler.pre)
      {
        resolvers.push( handler.pre( words, tokens, types, projection ) );
      }
    };

    for (var i = 0; i < input.length; i++)
    {
      var c = input.charAt( i );
      var token = Projection.TOKENS[ c ];

      if (token)
      {
        processWord( word );
        processToken( token );

        word = '';
      }
      else
      {
        word += c;
      }
    }

    processWord( word );

    var resolver = function(value) {
      return value;
    };

    for (var i = resolvers.length - 1; i >= 0; i--) {
      resolver = resolvers[ i ]( resolver );
    }

    this.projections[ alias ] = resolver;
  },

  project: function(model)
  {
    var out = {};

    for (var alias in this.projections)
    {
      out[ alias ] = this.projections[ alias ]( model );
    }

    return out;
  }

});

Projection.TOKENS =
{
  '.': 'property',
  '?': 'where',
  '|': 'filter',
  '#': 'resolve',
  '(': 'subStart',
  ')': 'subEnd',
  '[': 'pluckValueStart',
  ']': 'pluckValueEnd',
  '{': 'pluckObjectStart',
  ':': 'pluckObjectDelimiter',
  '}': 'pluckObjectEnd'
};

Projection.TOKEN_HANDLER =
{
  property: {
    post: function(words, tokens, types, projection) {
      var propertyName = words[0];
      var sourceType = types[0];
      if (!(sourceType instanceof Database)) {
        throw ('The property ' + propertyName + ' can only be taken from a Model');
      }
      var relation = sourceType.relations[ propertyName ];
      if (relation) {
        if (relation instanceof RelationSingle) {
          types.unshift( relation.model.Database );
        } else {
          types.unshift( relation );
        }
      }
      var fieldIndex = indexOf( sourceType.fields, propertyName );
      if (fieldIndex === false && !relation) {
        throw ('The property ' + propertyName + ' does not exist as a field or relation on the Model ' + sourceType.name );
      }
      return function(resolver) {
        return function(model) {
          if ( !isValue( model ) ) {
            return null;
          }
          return resolver( model.$get( propertyName ) );
        };
      };
    }
  },
  filter: {
    post: function(words, tokens, types, projection) {
      var filterName = words[0];
      var filter = Rekord.Filters[ filterName ];
      if (!filter) {
        throw (filterName + ' is not a valid filter function');
      }
      return function(resolver) {
        return function(value) {
          if ( !isValue( value ) ) {
            return null;
          }
          return resolver( filter( value ) );
        };
      };
    }
  },
  resolve: {
    post: function(words, tokens, types, projection) {
      var resolveName = words[0];
      return function(resolver) {
        return function(source) {
          if ( !isValue( source ) ) {
            return null;
          }
          var value = source[ resolveName ];
          if ( isFunction( value ) ) {
            value = value.apply( source );
          }
          return resolver( value );
        };
      };
    }
  },
  where: {
    post: function(words, tokens, types, projection) {
      var whereName = words[0];
      var whereFrom = types[0];
      var where = Rekord.Wheres[ whereName ];
      if (!where) {
        throw (whereName + ' is not a valid where expression');
      }
      if (!(whereFrom instanceof RelationMultiple)) {
        throw (whereName + ' where expressions can only be used on relations');
      }
      return function(resolver) {
        return function(relation) {
          if ( !isValue( relation ) ) {
            return null;
          }
          return resolver( relation.where( where ) );
        };
      };
    }
  },
  subEnd: {
    pre: function(words, tokens, types, projection) {
      var projectionName = words[0];
      var whereFrom = types[0];
      if (tokens[1] !== 'subStart') {
        throw ('Sub projection syntax error, an ending ) requires a starting (');
      }
      if (!(whereFrom instanceof Relation)) {
        throw ('Sub projections like ' + projectionName + ' from ' + words[1] + ' can only be used on relations');
      }
      if (!whereFrom.model.Database.projections[ projectionName ]) {
        throw ('The projection ' + projectionName + ' does not exist on ' + whereFrom.model.Database.name);
      }
      if (whereFrom instanceof RelationSingle) {
        return function(resolver) {
          return function (relation) {
            if ( !isValue( relation ) ) {
              return null;
            }
            return resolver( relation.$project( projectionName ) );
          };
        };
      } else {
        return function(resolver) {
          return function(relations) {
            if ( !isValue( relations ) ) {
              return null;
            }
            return resolver( relations.project( projectionName ) );
          };
        };
      }
    }
  },
  pluckValueEnd: {
    pre: function(words, tokens, types, projection) {
      var properties = words[0];
      var whereFrom = types[0];
      if (tokens[1] !== 'pluckValueStart') {
        throw ('Pluck value syntax error, an ending ] requires a starting [');
      }
      if (!(whereFrom instanceof RelationMultiple)) {
        throw ('Pluck values like ' + properties + ' from ' + words[1] + ' can only be used on relations');
      }
      return function (resolver) {
        return function (relations) {
          if ( !isValue( relations ) ) {
            return null;
          }
          return resolver( relations.pluck( properties ) );
        };
      };
    }
  },
  pluckObjectEnd: {
    pre: function(words, tokens, types, projection) {
      var properties = words[0];
      var keys = words[1];
      var whereFrom = types[0];
      if (tokens[1] !== 'pluckObjectDelimiter' || tokens[2] !== 'pluckObjectStart') {
        throw ('Pluck object syntax error, must be {key: value}');
      }
      if (!(whereFrom instanceof RelationMultiple)) {
        throw ('Pluck values like ' + properties + ' from ' + words[1] + ' can only be used on relations');
      }
      return function (resolver) {
        return function (relations) {
          if ( !isValue( relations ) ) {
            return null;
          }
          return resolver( relations.pluck( properties, keys ) );
        };
      };
    }
  }
};

Projection.ALIAS_DELIMITER = ':';

Projection.parse = function(database, input)
{
  var originalInput = input;

  if ( isString( input ) )
  {
    input = database.projections[ input ];
  }

  if ( isArray( input ) )
  {
    input = new Projection( database, input );
  }

  if (!(input instanceof Projection))
  {
    throw (originalInput + ' is not a valid projection');
  }

  return input;
};
