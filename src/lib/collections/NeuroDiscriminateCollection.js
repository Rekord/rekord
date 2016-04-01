
/**
 * Overrides functions in the given model collection to turn it into a collection
 * which contains models with a discriminator field.
 *
 * @param {Neuro.ModelCollection} collection -
 *    The collection instance with discriminated models.
 * @param {String} discriminator -
 *    The name of the field which contains the discriminator.
 * @param {Object} discriminatorsToModel -
 *    A map of discriminators to the Neuro instances.
 * @return {Neuro.ModelCollection} -
 *    The reference to the given collection.
 */
function NeuroDiscriminateCollection(collection, discriminator, discriminatorsToModel)
{
  collection.discriminator = discriminator;
  collection.discriminatorsToModel = discriminatorsToModel;

  // Original Functions
  var buildKeyFromInput = collection.buildKeyFromInput;
  var parseModel = collection.parseModel;
  var clone = collection.clone;
  var cloneEmpty = collection.cloneEmpty;

  /**
   * Builds a key from input. Discriminated collections only accept objects as
   * input - otherwise there's no way to determine the discriminator. If the
   * discriminator on the input doesn't map to a Neuro instance OR the input
   * is not an object the input will be returned instead of a model instance.
   *
   * @param {modelInput} input -
   *    The input to create a key for.
   * @return {Any} -
   *    The built key or the given input if a key could not be built.
   */
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

  /**
   * Takes input and returns a model instance. The input is expected to be an
   * object, any other type will return null.
   *
   * @param {modelInput} input -
   *    The input to parse to a model instance.
   * @param {Boolean} [remoteData=false] -
   *    Whether or not the input is coming from a remote source.
   * @return {Neuro.Model} -
   *    The model instance parsed or null if none was found.
   */
  collection.parseModel = function(input, remoteData)
  {
    if ( input instanceof NeuroModel )
    {
      return input;
    }

    var discriminatedValue = isValue( input ) ? input[ this.discriminator ] : null;
    var model = this.discriminatorsToModel[ discriminatedValue ];

    return model ? model.Database.parseModel( input, remoteData ) : null;
  };

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Neuro.Collection#
   * @return {Neuro.Collection} -
   *    The reference to a clone collection.
   */
  collection.clone = function()
  {
    return NeuroDiscriminateCollection( clone.apply( this ), discriminator, discriminatorsToModel );
  };

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Neuro.Collection#
   * @return {Neuro.Collection} -
   *    The reference to a clone collection.
   */
  collection.cloneEmpty = function()
  {
    return NeuroDiscriminateCollection( cloneEmpty.apply( this ), discriminator, discriminatorsToModel );
  };

  return collection;
}
