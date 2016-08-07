
Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  if ( options.keyChanges )
  {
    enableKeyChanges();
  }
});

var Map_put = Map.prototype.put;
var Map_remove = Map.prototype.remove;

function mapKeyChangeListener(map)
{
  return function onKeyChange(model, oldKey, newKey)
  {
    var index = map.indices[ oldKey ];

    if ( isNumber( index ) )
    {
      var listener = map.listeners[ oldKey ];

      delete map.indices[ oldKey ];
      delete map.listeners[ oldKey ];

      map.keys[ index ] = newKey;
      map.indices[ newKey ] = index;
      map.listeners[ newKey ] = listener;
    }
  };
}

function mapKeyChangePut(key, value)
{
  Map_put.apply( this, arguments );

  if ( value instanceof Model && value.$db.keyChanges )
  {
    this.listeners = this.listeners || {};

    this.listeners[ key ] = value.$on( Model.Events.KeyChange, mapKeyChangeListener( this ) );
  }

  return this;
}

function mapKeyChangeRemove(key)
{
  var index = this.indices[ key ];

  if ( isNumber( index ) )
  {
    if ( this.listeners )
    {
      evaluate( this.listeners[ key ] );

      delete this.listeners[ key ];
    }

    this.removeAt( index );
  }

  return this;
}

function enableKeyChanges()
{
  addMethod( Map.prototype, 'put', mapKeyChangePut );
  addMethod( Map.prototype, 'remove', mapKeyChangeRemove );
}

function disableKeyChanges()
{
  addMethod( Map.prototype, 'put', Map_put );
  addMethod( Map.prototype, 'remove', Map_remove );
}
