function NeuroQuery(database, whereProperties, whereValue, whereEquals)
{
  this.init( database );
  this.where = createWhere( whereProperties, whereValue, whereEquals );
  this.listen();
  this.sync();
}

extendArray( NeuroModelCollection, NeuroQuery,
{

  listen: function()
  {
    this.onModelAdd = copyFunction( this.handleModelAdded );
    this.onModelRemoved = copyFunction( this.handleModelRemoved );
    this.onModelUpdated = copyFunction( this.handleModelUpdated );

    this.database.on( NeuroDatabase.Events.ModelAdded, this.onModelAdd, this );
    this.database.on( NeuroDatabase.Events.ModelRemoved, this.onModelRemoved, this );
    this.database.on( NeuroDatabase.Events.ModelUpdated, this.onModelUpdated, this );
  },

  sync: function()
  {
    var models = this.database.getModels();

    this.map.reset();

    for (var i = 0; i < models.length; i++)
    {
      var model = models[ i ];

      if ( this.where( model ) )
      {
        this.map.put( model.$key(), model );
      }
    }

    this.trigger( NeuroCollection.Events.Reset, [this] );
  },

  handleModelAdded: function(model, remoteData)
  {
    if ( this.where( model ) )
    {
      this.add( model );
    }
  },

  handleModelRemoved: function(model)
  {
    this.remove( model );
  },

  handleModelUpdated: function(model, remoteData)
  {
    var key = model.$key();

    if ( this.map.has( key ) )
    {
      if ( !this.where( model ) )
      {
        this.remove( model );
      }
    }
    else
    {
      if ( this.where( model ) )
      {
        this.add( model );
      }
    }
  },

  destroy: function()
  {
    this.database.off( NeuroDatabase.Events.ModelAdded, this.onModelAdd );
    this.database.off( NeuroDatabase.Events.ModelRemoved, this.onModelRemoved );
    this.database.off( NeuroDatabase.Events.ModelUpdated, this.onModelUpdated );
  }

});