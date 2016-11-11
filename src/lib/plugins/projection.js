addPlugin(function(model, db, options)
{

  model.projection = function(projectionInput)
  {
    return Projection.parse( db, projectionInput );
  };

});
