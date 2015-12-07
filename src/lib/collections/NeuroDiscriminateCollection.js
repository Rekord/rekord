function NeuroDiscriminateCollection(collection, discriminator, discriminatorsToModel)
{
  collection.discriminator = discriminator;
  collection.discriminatorsToModel = discriminatorsToModel;

  collection.buildKeyFromInput = function(input)
  {
    if ( isObject( input ) )
    {
      var discriminatedValue = input[ this.discriminator ];
      var model = this.discriminatorsToModel[ discriminatedValue ];

      if ( model )
      {
        return model.Database.buildKeyFromInput( input );
      }
    }
    
    return input;
  };

  collection.parseModel = function(input, remoteData)
  {
    var discriminatedValue = input[ this.discriminator ];
    var model = this.discriminatorsToModel[ discriminatedValue ];

    return model ? model.Database.parseModel( input, remoteData ) : null;
  };

  return collection;
}