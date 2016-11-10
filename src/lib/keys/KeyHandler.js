
function KeyHandler()
{

}

Class.create( KeyHandler,
{

  init: function(database)
  {
    this.key = database.key;
    this.keySeparator = database.keySeparator;
    this.database = database;
  },

  getKey: function(model, quietly)
  {
    var field = this.key;
    var modelKey = this.buildKey( model, field );

    if ( hasFields( model, field, isValue ) )
    {
      return modelKey;
    }
    else if ( !quietly )
    {
      throw 'Composite key not supplied.';
    }

    return null;
  },

  buildKeyFromRelations: function(input)
  {
    if ( isObject( input ) )
    {
      var relations = this.database.relations;

      for (var relationName in relations)
      {
        if ( relationName in input )
        {
          relations[ relationName ].buildKey( input );
        }
      }
    }
  },

  buildKeyFromInput: function(input)
  {
    if ( input instanceof this.database.Model )
    {
      return input.$key();
    }
    else if ( isArray( input ) ) // && isArray( this.key )
    {
      return input.join( this.keySeparator );
    }
    else if ( isObject( input ) )
    {
      return this.buildKey( input );
    }

    return input;
  }

});
