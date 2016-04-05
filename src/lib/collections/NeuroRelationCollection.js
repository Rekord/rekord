
/**
 * An extension of the {@link Neuro.ModelCollection} class for relationships.
 *
 * @constructor
 * @memberof Neuro
 * @alias RelationCollection
 * @extends Neuro.ModelCollection
 * @param {Neuro.Database} database -
 *    The database for the models in this collection.
 * @param {Neuro.Model} model -
 *    The model instance all models in this collection are related to.
 * @param {Neuro.Relation} relator -
 *    The relation instance responsible for relating/unrelating models.
 * @param {modelInput[]} [models] -
 *    The initial array of models in this collection.
 * @param {Boolean} [remoteData=false] -
 *    If the models array is from a remote source. Remote sources place the
 *    model directly into the database while local sources aren't stored in the
 *    database until they're saved.
 */
function NeuroRelationCollection(database, model, relator, models, remoteData)
{
  this.model = model;
  this.relator = relator;

  this.init( database, models, remoteData );
}

/**
 * The model instance all models in this collection are related to.
 *
 * @memberof Neuro.RelationCollection#
 * @member {Neuro.Model} model
 */

 /**
  * The relation instance responsible for relating/unrelating models.
  *
  * @memberof Neuro.RelationCollection#
  * @member {Neuro.Relation} relator
  */

extendArray( NeuroModelCollection, NeuroRelationCollection,
{

  /**
   * Sets the entire set of models which are related. If a model is specified
   * that doesn't exist in this collection a relationship is added. If a model
   * in this collection is not specified in the `input` the relationship is
   * removed. Depending on the relationship, adding and removing relationships
   * may result in the saving or deleting of models.
   *
   * @method
   * @memberof Neuro.RelationCollection#
   * @param {modelInput|modelInput[]} [input] -
   *    The model or array of models to relate. If input isn't specified, all
   *    models currently related are unrelated.
   * @return {Neuro.RelationCollection} -
   *    The reference to this collection.
   */
  set: function(input)
  {
    this.relator.set( this.model, input );

    return this;
  },

  /**
   * Relates one or more models to this collection's model. If a model is
   * specified that is already related then it has no effect.
   *
   * @method
   * @memberof Neuro.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to relate.
   * @return {Neuro.RelationCollection} -
   *    The reference to this collection.
   */
  relate: function(input)
  {
    this.relator.relate( this.model, input );

    return this;
  },

  /**
   * Unrelates one or more models from this collection's model. If a model is
   * specified that is not related then it has no effect. If no models are
   * specified then all models in this collection are unrelated.
   *
   * @method
   * @memberof Neuro.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to relate.
   * @return {Neuro.RelationCollection} -
   *    The reference to this collection.
   */
  unrelate: function(input)
  {
    this.relator.unrelate( this.model, input );

    return this;
  },

  /**
   * Determines whether one or more models all exist in this collection.
   *
   * @method
   * @memberof Neuro.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to check for existence.
   * @return {Boolean} -
   *    True if all models are related - otherwise false.
   */
  isRelated: function(input)
  {
    return this.relator.isRelated( this.model, input );
  },

  /**
   * Returns a clone of this collection.
   *
   * @method
   * @memberof Neuro.RelationCollection#
   * @return {Neuro.RelationCollection} -
   *    The reference to a clone collection.
   */
  clone: function()
  {
    return new NeuroRelationCollection( this.database, this.model, this.relator, this, true );
  },

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Neuro.RelationCollection#
   * @return {Neuro.RelationCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: function()
  {
    return new NeuroRelationCollection( this.database, this.model, this.relator );
  }

});
