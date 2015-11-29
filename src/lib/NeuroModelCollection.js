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


  subtract: function(models, out)
  {
    var db = this.database;
    var target = out || new this.constructor();

    for (var i = 0; i < this.length; i++)
    {
      var a = this[ i ];
      var key = a.$key();
      var exists = false;

      if ( models instanceof NeuroModelCollection )
      {
        exists = models.has( key );
      }
      else
      {
        for (var i = 0; i < models.length && !exists; i++)
        {
          var modelKey = db.buildKeyFromInput( models[ i ] );

          exists = (key === modelKey);
        }
      }

      if (!exists)
      {
        target.push( a );
      }
    }

    return target;
  },

  intersect: function(models, out)
  {
    var db = this.database;
    var target = out || new this.constructor();

    for (var i = 0; i < models.length; i++)
    {
      var a = models[ i ];
      var key = db.buildKeyFromInput( a );

      if ( this.has( key ) )
      {
        target.push( a );
      }
    }

    return target;
  },

  complement: function(models, out)
  {
    var db = this.database;
    var target = out || new this.constructor();

    for (var i = 0; i < models.length; i++)
    {
      var a = models[ i ];
      var key = db.buildKeyFromInput( a );

      if ( !this.has( key ) )
      {
        target.push( a );
      }
    }

    return target;
  },


  clear: function()
  {
    return this.map.reset();
  },

  reset: function(models, remoteData)
  {
    if ( isArray( models ) )
    {
      var db = this.database;

      this.map.reset();

      for (var i = 0; i < models.length; i++)
      {
        var model = models[ i ];
        var parsed = db.parseModel( model, remoteData );

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
    var db = this.database;
    var key = db.buildKeyFromInput( input );
    var removing = this.map.get( key );

    if ( removing )
    {
      this.map.remove( key );
      this.trigger( NeuroCollection.Events.Remove, [this, removing, input] );

      if ( !delaySort )
      {
        this.resort();
      }
    }
  },

  removeAll: function(inputs, delaySort)
  {
    var db = this.database;
    var removed = [];

    for (var i = 0; i < inputs.length; i++)
    {
      var key = db.buildKeyFromInput( inputs[ i ] );
      var removing = this.map.get( key );

      if ( removing )
      {
        this.map.remove( key );
        removed.push( removing );
      }
    }

    this.trigger( NeuroCollection.Events.Removes, [this, removed] );

    if ( !delaySort )
    {
      this.resort();
    }

    return removed;
  },

  indexOf: function(input)
  {
    var db = this.database;
    var key = db.buildKeyFromInput( input );
    var index = this.map.indices[ key ];

    return index === undefined ? -1 : index;
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

  removeWhere: function(callRemove, whereProperties, whereValue, whereEquals)
  {
    var where = createWhere( whereProperties, whereValue, whereEquals );
    var removed = [];

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];
      var key = model.$key();

      if ( where( model ) )
      {
        this.map.remove( key );
        removed.push( model );

        if ( callRemove )
        {
          model.$remove();
        }
      }
    }

    this.trigger( NeuroCollection.Events.Removes, [this, removed] );
    this.resort();

    return removed;
  },

  update: function(props, value, remoteData)
  {
    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      model.$set( props, value, remoteData );
      model.$save();
    }

    this.trigger( NeuroCollection.Events.Updates, [this, this] );
    this.resort();

    return this;
  },

  updateWhere: function(where, props, value, remoteData)
  {
    var updated = [];

    for (var i = 0; i < this.length; i++)
    {
      var model = this[ i ];

      if ( where( model ) )
      {
        model.$set( props, value, remoteData );
        model.$save();   

        updated.push( model );     
      }
    }

    this.trigger( NeuroCollection.Events.Updates, [this, updated] );
    this.resort();

    return updated;
  },

});