function RelationMultiple()
{
}

Class.extend( Relation, RelationMultiple,
{

  debugAutoSave: null,
  debugInitialGrabbed: null,
  debugSort: null,

  handleExecuteQuery: function(model)
  {
    return function onExecuteQuery(search)
    {
      var relation = model.$relations[ this.name ];
      var results = search.$results;

      Rekord.debug( this.debugQueryResults, this, model, search );

      this.bulk( relation, function()
      {
        for (var i = 0; i < results.length; i++)
        {
          this.addModel( relation, results[ i ], true );
        }
      });

      this.sort( relation );
      this.checkSave( relation, true );
    };
  },

  bulk: function(relation, callback, remoteData)
  {
    relation.delaySorting = true;
    relation.delaySaving = true;

    callback.apply( this );

    relation.delaySorting = false;
    relation.delaySaving = false;

    this.sort( relation );
    this.checkSave( relation, remoteData );
  },

  set: function(model, input, remoteData)
  {
    if ( isEmpty( input ) )
    {
      this.unrelate( model, undefined, remoteData );
    }
    else
    {
      var relation = model.$relations[ this.name ];
      var existing = relation.related;
      var given = this.createCollection();

      if ( this.isModelArray( input ) )
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ], remoteData, relation );

          if ( related )
          {
            given.add( related );
          }
        }
      }
      else
      {
        var related = this.parseModel( input, remoteData, relation );

        if ( related )
        {
          given.add( related );
        }
      }

      var removing = existing.subtract( given );
      var adding = given.subtract( existing );

      this.bulk( relation, function()
      {
        for (var i = 0; i < adding.length; i++)
        {
          this.addModel( relation, adding[ i ], remoteData );
        }

        for (var i = 0; i < removing.length; i++)
        {
          this.removeModel( relation, removing[ i ], remoteData );
        }

      }, remoteData);
    }
  },

  relate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ], remoteData, relation );

          if ( related )
          {
            this.addModel( relation, related, remoteData );
          }
        }
      }, remoteData );
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input, remoteData, relation );

      if ( related )
      {
        this.addModel( relation, related, remoteData );
      }
    }
  },

  unrelate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];

    if ( this.isModelArray( input ) )
    {
      this.bulk( relation, function()
      {
        for (var i = 0; i < input.length; i++)
        {
          var related = this.parseModel( input[ i ], remoteData, relation );

          if ( related )
          {
            this.removeModel( relation, related, remoteData );
          }
        }
      }, remoteData );
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input, remoteData, relation );

      if ( related )
      {
        this.removeModel( relation, related, remoteData );
      }
    }
    else
    {
      var all = relation.related;

      this.bulk( relation, function()
      {
        for (var i = all.length - 1; i >= 0; i--)
        {
          this.removeModel( relation, all[ i ], remoteData );
        }
      }, remoteData );
    }
  },

  isRelated: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var existing = relation.related;

    if ( this.isModelArray( input ) )
    {
      for (var i = 0; i < input.length; i++)
      {
        var related = this.parseModel( input[ i ], false, relation );

        if ( related && !existing.has( related.$key() ) )
        {
          return false;
        }
      }

      return input.length > 0;
    }
    else if ( isValue( input ) )
    {
      var related = this.parseModel( input, false, relation );

      return related && existing.has( related.$key() );
    }

    return false;
  },

  canRemoveRelated: function(related, remoteData)
  {
    return !remoteData || !related.$isSaving();
  },

  checkSave: function(relation, remoteData)
  {
    if ( !relation.delaySaving && !remoteData && relation.parent.$exists() )
    {
      if ( this.store === Store.Model || this.save === Save.Model )
      {
        Rekord.debug( this.debugAutoSave, this, relation );

        relation.parent.$save( this.saveParentCascade, this.saveParentOptions );
      }
    }
  },

  handleModel: function(relation, remoteData, ignoreLoaded)
  {
    return function (related)
    {
      var pending = relation.pending;
      var key = related.$key();

      if ( key in pending || ignoreLoaded )
      {
        Rekord.debug( this.debugInitialGrabbed, this, relation, related );

        this.addModel( relation, related, remoteData );

        delete pending[ key ];
      }
    };
  },

  sort: function(relation)
  {
    var related = relation.related;

    if ( !relation.delaySorting )
    {
      Rekord.debug( this.debugSort, this, relation );

      related.sort( this.comparator );

      relation.parent.$trigger( Model.Events.RelationUpdate, [this, relation] );
    }
  }

});
