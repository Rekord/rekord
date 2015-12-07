function NeuroRelationSingle()
{
}


extend( NeuroRelation, NeuroRelationSingle, 
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

    Neuro.debug( this.debugInit, this );

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

      if ( related && !relation.isRelated( related ) )
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
    
    if ( related )
    {
      if ( relation.related !== related )
      {
        this.clearModel( relation );
        this.setRelated( relation, related, remoteData );
      }
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

      if ( related && related.$isPending() )
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
      Neuro.debug( this.debugClearModel, this, relation );

      if (relation.onSaved) related.$off( NeuroModel.Events.Saved, relation.onSaved );
      if (relation.onRemoved) related.$off( NeuroModel.Events.Removed, relation.onRemoved );

      relation.related = null;
      relation.dirty = true;
      relation.loaded = true;

      delete relation.parent.$dependents[ related.$uid() ];
    }
  },

  setModel: function(relation, related)
  {
    if (relation.onSaved) related.$on( NeuroModel.Events.Saved, relation.onSaved, this );
    if (relation.onRemoved) related.$on( NeuroModel.Events.Removed, relation.onRemoved, this );

    relation.related = related;
    relation.dirty = true;
    relation.loaded = true;
    
    relation.parent.$dependents[ related.$uid() ] = related;

    Neuro.debug( this.debugSetModel, this, relation );
  },

  handleModel: function(relation, remoteData)
  {
    return function(related) 
    {
      var model = relation.parent;

      Neuro.debug( this.debugLoaded, this, model, relation, related );

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
            this.executeQuery( model );
          }
          else
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

    Neuro.debug( this.debugClearKey, this, model, local );

    this.clearFields( model, local, remoteData );
  },

  updateForeignKey: function(model, related, remoteData)
  {
    var local = this.local;
    var foreign = related.$db.key;

    Neuro.debug( this.debugUpdateKey, this, model, local, related, foreign );

    this.updateFields( model, local, related, foreign, remoteData );
  }

});