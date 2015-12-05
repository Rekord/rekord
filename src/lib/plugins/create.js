Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.create = function( props )
  {
    if ( !isObject( props ) )
    {
      var instance = db.instantiate();

      instance.$save();

      return instance;
    }

    var fields = grab( props, db.fields );
    var instance = db.instantiate( fields );
    var key = instance.$key();
    var relations = {};

    for (var i = 0; i < db.relationNames.length; i++)
    {
      var relationName = db.relationNames[ i ];

      if ( relationName in props )
      {
        relations[ relationName ] = props[ relationName ];
      }
    }

    instance.$save( relations );

    return instance;
  };
});