function RelationSingle()
{
}


extend( Relation, RelationSingle,
{

  debugInit: null,
  debugClearModel: null,
  debugSetModel: null,
  debugLoaded: null,
  debugClearKey: null,
  debugUpdateKey: null,

  onInitialized: function(database, field, options)
  {
    if ( !this.discriminated )
    {
      var relatedDatabase = this.model.Database;

      this.local = this.local || ( relatedDatabase.name + '_' + relatedDatabase.key );
    }

    Rekord.debug( this.debugInit, this );

    this.finishInitialization();
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
      var related = this.parseModel( input, remoteData );

      if ( related && relation.related !== related )
      {
        this.clearModel( relation );
        this.setRelated( relation, related, remoteData );
      }
    }
  },

  relate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input, remoteData );

    if ( related && relation.related !== related )
    {
      this.clearModel( relation );
      this.setRelated( relation, related, remoteData );
    }
  },

  unrelate: function(model, input, remoteData)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );

    if ( !related || relation.related === related )
    {
      this.clearRelated( relation, remoteData );
    }
  },

  isRelated: function(model, input)
  {
    var relation = model.$relations[ this.name ];
    var related = this.parseModel( input );

    return related === relation.related;
  },

  setRelated: function(relation, related, remoteData)
  {
    if ( !related.$isDeleted() )
    {
      this.setModel( relation, related );
      this.updateForeignKey( relation.parent, related, remoteData );
      this.setProperty( relation );
    }
  },

  clearRelated: function(relation, remoteData)
  {
    if ( remoteData )
    {
      var related = relation.related;

      if ( related && related.$isSaving() )
      {
        return;
      }
    }

    this.clearModel( relation );
    this.clearForeignKey( relation.parent );
    this.setProperty( relation );
  },

  clearModel: function(relation)
  {
    var related = relation.related;

    if ( related )
    {
      Rekord.debug( this.debugClearModel, this, relation );

      if (relation.onSaved)
      {
        related.$off( Model.Events.Saved, relation.onSaved );
      }
      if (relation.onRemoved)
      {
        related.$off( Model.Events.Removed, relation.onRemoved );
      }

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      relation.parent.$dependents.remove( related );
    }
  },

  setModel: function(relation, related)
  {
    if (relation.onSaved)
    {
      related.$on( Model.Events.Saved, relation.onSaved, this );
    }

    if (relation.onRemoved)
    {
      related.$on( Model.Events.Removed, relation.onRemoved, this );
    }

    relation.related = related;
    relation.dirty = true;
    relation.loaded = true;

    if ( this.isDependent( relation, related ) )
    {
      relation.parent.$dependents.add( related, this );
    }

    Rekord.debug( this.debugSetModel, this, relation );
  },

  isDependent: function(relation, related)
  {
    return true;
  },

  handleModel: function(relation, remoteData)
  {
    return function(related)
    {
      var model = relation.parent;

      Rekord.debug( this.debugLoaded, this, model, relation, related );

      if ( relation.loaded === false )
      {
        if ( related && !related.$isDeleted() )
        {
          this.setModel( relation, related, remoteData );
          this.updateForeignKey( model, related, remoteData );
        }
        else
        {
          if ( this.query )
          {
            relation.query = this.executeQuery( model );
          }
          else if ( !this.preserve )
          {
            this.clearForeignKey( model, remoteData );
          }
        }

        relation.loaded = true;

        this.setProperty( relation );
      }
    };
  },

  isRelatedFactory: function(model)
  {
    var local = this.local;

    return function hasForeignKey(related)
    {
      return propsMatch( model, local, related, related.$db.key );
    };
  },

  clearForeignKey: function(model, remoteData)
  {
    var local = this.local;

    Rekord.debug( this.debugClearKey, this, model, local );

    this.clearFields( model, local, remoteData );
  },

  getTargetFields: function(target)
  {
    return this.local;
  },

  buildKey: function(input)
  {
    var related = input[ this.name ];
    var key = this.local;

    if ( isObject( related ) && this.model )
    {
      var modelDatabase = this.model.Database;
      var foreign = modelDatabase.key;

      modelDatabase.keyHandler.copyFields( input, key, related, foreign );
    }
  }

});
