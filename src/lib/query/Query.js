function Query(database, whereProperties, whereValue, whereEquals)
{
  this.onModelAdd     = bind( this, this.handleModelAdded );
  this.onModelRemoved = bind( this, this.handleModelRemoved );
  this.onModelUpdated = bind( this, this.handleModelUpdated );

  this.init( database );
  this.connect();
  this.setWhere( whereProperties, whereValue, whereEquals );
}

extendArray( ModelCollection, Query,
{

  setWhere: function(whereProperties, whereValue, whereEquals)
  {
    this.where = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();
  },

  connect: function()
  {
    this.database.on( Database.Events.ModelAdded, this.onModelAdd );
    this.database.on( Database.Events.ModelRemoved, this.onModelRemoved );
    this.database.on( Database.Events.ModelUpdated, this.onModelUpdated );
  },

  disconnect: function()
  {
    this.database.off( Database.Events.ModelAdded, this.onModelAdd );
    this.database.off( Database.Events.ModelRemoved, this.onModelRemoved );
    this.database.off( Database.Events.ModelUpdated, this.onModelUpdated );
  },

  sync: function()
  {
    var where = this.where;
    var map = this.map;
    var models = this.database.models;

    map.reset();

    for (var i = 0; i < models.length; i++)
    {
      var model = models[ i ];

      if ( where( model ) )
      {
        map.put( model.$key(), model );
      }
    }

    this.trigger( Collection.Events.Reset, [this] );
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
  }

});
