function NeuroFilteredCollection(base, filter)
{
  this.onAdd      = bind( this, this.handleAdd );
  this.onAdds     = bind( this, this.handleAdds );
  this.onRemove   = bind( this, this.handleRemove );
  this.onRemoves  = bind( this, this.handleRemoves );
  this.onReset    = bind( this, this.handleReset );
  this.onUpdates  = bind( this, this.handleUpdates );
  this.onCleared  = bind( this, this.handleCleared );

  this.init( base, filter );
}

extendArray( NeuroCollection, NeuroFilteredCollection,
{
  init: function(base, filter)
  {
    if ( this.base !== base )
    {
      if ( this.base )
      {
        this.disconnect();
      }

      this.base = base;
      this.connect();
    }

    this.filter = filter;
    this.sync();
  },

  setFilter: function(whereProperties, whereValue, whereEquals)
  {
    this.filter = createWhere( whereProperties, whereValue, whereEquals );
    this.sync();
  },

  connect: function()
  {
    this.base.on( NeuroCollection.Events.Add, this.onAdd );
    this.base.on( NeuroCollection.Events.Adds, this.onAdds );
    this.base.on( NeuroCollection.Events.Remove, this.onRemove );
    this.base.on( NeuroCollection.Events.Removes, this.onRemoves );
    this.base.on( NeuroCollection.Events.Reset, this.onReset );
    this.base.on( NeuroCollection.Events.Updates, this.onUpdates );
    this.base.on( NeuroCollection.Events.Cleared, this.onClear );
  },

  disconnect: function()
  {
    this.base.off( NeuroCollection.Events.Add, this.onAdd );
    this.base.off( NeuroCollection.Events.Adds, this.onAdds );
    this.base.off( NeuroCollection.Events.Remove, this.onRemove );
    this.base.off( NeuroCollection.Events.Removes, this.onRemoves );
    this.base.off( NeuroCollection.Events.Reset, this.onReset );
    this.base.off( NeuroCollection.Events.Updates, this.onUpdates );
    this.base.off( NeuroCollection.Events.Cleared, this.onClear );
  },

  sync: function()
  {
    var base = this.base;
    var filter = this.filter;

    this.length = 0;

    for (var i = 0; i < base.length; i++)
    {
      var value = base[ i ];

      if ( filter( value ) )
      {
        this.push( value );
      }
    }

    this.trigger( NeuroCollection.Events.Reset, [this] );
  },

  handleAdd: function(collection, value)
  {
    var filter = this.filter;

    if ( filter( value ) )
    {
      this.add( value );
    }
  },

  handleAdds: function(collection, values)
  {
    var filter = this.filter;
    var filtered = [];

    for (var i = 0; i < values.length; i++)
    {
      var value = values[ i ];

      if ( filter( value ) )
      {
        filtered.push( value );
      }
    }

    this.addAll( filtered );
  },

  handleRemove: function(collection, value)
  {
    this.remove( value );
  },

  handleRemoves: function(collection, values)
  {
    this.removeAll( values );
  },

  handleReset: function(collection)
  {
    this.sync();
  },

  handleUpdates: function(collection, updates)
  {
    var filter = this.filter;

    for (var i = 0; i < updates.length; i++)
    {
      var value = updates[ i ];

      if ( filter( value ) )
      {
        this.add( value, true );
      }
      else
      {
        this.remove( value, true );
      }
    }

    this.sort();
  },

  handleCleared: function(collection)
  {
    this.clear();
  }

});
