function NeuroDiscriminatedModelCollection(discriminator, discriminatorsToModel, models, remoteData)
{
  this.discriminator = discriminator;
  this.discriminatorsToModel = discriminatorsToModel;

  this.init( null, models, remoteData );
}

extendArray( NeuroModelCollection, NeuroDiscriminatedModelCollection, 
{

  buildKeyFromInput: function(input)
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
  },

  parseModel: function(input, remoteData)
  {
    var discriminatedValue = input[ this.discriminator ];
    var model = this.discriminatorsToModel[ discriminatedValue ];

    return model ? model.Database.parseModel( input, remoteData ) : null;
  }

});