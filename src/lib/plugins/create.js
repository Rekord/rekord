Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  model.create = function( props )
  {
    if ( !isObject( props ) )
    {
      var model = db.instantiate();

      model.$save();

      return model;
    }

    var fields = grab( props, db.fields );
    var model = db.instantiate( fields );
    var key = model.$key();
    var relations = {};

    db.models.put( key, model );
    db.trigger( NeuroDatabase.Events.ModelAdded, [model, false] );
    db.updated();

    for (var i = 0; i < db.relationNames.length; i++)
    {
      var relationName = db.relationNames[ i ];

      if ( relationName in props )
      {
        relations[ relationName ] = props[ relationName ];
      }
    }

    model.$save( relations );

    return model;
  };
});