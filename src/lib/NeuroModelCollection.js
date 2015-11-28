function NeuroModelCollection(database, models, remoteData)
{
  this.init( database, models, remoteData );
}

extendArray( NeuroCollection, NeuroModelCollection, 
{

  init: function(database, models, remoteData)
  {
    this.map = new NeuroMap();
    this.map.values = this;
    this.database = database;
    this.reset( models, remoteData );
  },

  resort: function(comparator, comparatorNullsFirst)
  {
    var cmp = comparator ? createComparator( comparator, comparatorNullsFirst ) : this.comparator;

    if ( !isSorted( cmp, this ) )
    {
      this.map.sort( cmp );
      this.trigger( NeuroCollection.Events.Sort, [this] );
    }
  },

  clear: function()
  {
    return this.map.reset();
  },

  reset: function(models, remoteData)
  {
    if ( isArray( models ) )
    {
      this.map.reset();

      for (var i = 0; i < models.length; i++)
      {
        var model = models[ i ];
        var parsed = this.database.parseModel( model, remoteData );

        if ( parsed )
        {
          this.map.put( parsed.$key(), parsed );
        }
      }

      this.trigger( NeuroCollection.Events.Reset, [this] );
      this.resort();
    }
  },

  add: function(model, delaySort)
  {
    this.map.put( model.$key(), model );
    this.trigger( NeuroCollection.Events.Add, [this, model] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  addAll: function(models, delaySort)
  {
    if ( isArray( models ) )
    {
      for (var i = 0; i < models.length; i++)
      {
        var model = models[ i ];

        this.map.put( model.$key(), model );
      }

      this.trigger( NeuroCollection.Events.Adds, [this, models] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  put: function(key, model, delaySort)
  {
    this.map.put( key, model );
    this.trigger( NeuroCollection.Events.Add, [this, model] );

    if ( !delaySort )
    {
      this.resort();
    }
  },

  has: function(key)
  {
    return this.map.has( key );
  },

  get: function(key)
  {
    return this.map.get( key );
  },

  remove: function(input, delaySort)
  {
    var key = this.database.buildKeyFromInput( input );
    var removing = this.map.get( key );

    if ( removing )
    {
      this.map.remove( key );
      this.trigger( NeuroCollection.Events.Remove, [this, input, removing] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  rebuild: function()
  {
    this.map.rebuildIndex();
  },

  keys: function()
  {
    return this.map.keys;
  },

  reverse: function()
  {
    this.map.reverse();
  },

  update: function(props, value, remoteData)
  {
    for (var i = 0; i < this.length; i++)
    {
      this[ i ].$set( props, value, remoteData );
    }

    for (var i = 0; i < this.length; i++)
    {
      this[ i ].$save();
    }

    this.resort();
  }

});