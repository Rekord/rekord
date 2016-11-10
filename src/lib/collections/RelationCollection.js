
/**
 * An extension of the {@link Rekord.ModelCollection} class for relationships.
 *
 * @constructor
 * @memberof Rekord
 * @extends Rekord.ModelCollection
 * @param {Rekord.Database} database -
 *    The database for the models in this collection.
 * @param {Rekord.Model} model -
 *    The model instance all models in this collection are related to.
 * @param {Rekord.Relation} relator -
 *    The relation instance responsible for relating/unrelating models.
 * @param {modelInput[]} [models] -
 *    The initial array of models in this collection.
 * @param {Boolean} [remoteData=false] -
 *    If the models array is from a remote source. Remote sources place the
 *    model directly into the database while local sources aren't stored in the
 *    database until they're saved.
 */
function RelationCollection(database, model, relator, models, remoteData)
{
  Class.props(this, {
    model:    model,
    relator:  relator
  });

  this.init( database, models, remoteData );
}

/**
 * The model instance all models in this collection are related to.
 *
 * @memberof Rekord.RelationCollection#
 * @member {Rekord.Model} model
 */

 /**
  * The relation instance responsible for relating/unrelating models.
  *
  * @memberof Rekord.RelationCollection#
  * @member {Rekord.Relation} relator
  */

Class.extend( ModelCollection, RelationCollection,
{

  /**
   * Sets the entire set of models which are related. If a model is specified
   * that doesn't exist in this collection a relationship is added. If a model
   * in this collection is not specified in the `input` the relationship is
   * removed. Depending on the relationship, adding and removing relationships
   * may result in the saving or deleting of models.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} [input] -
   *    The model or array of models to relate. If input isn't specified, all
   *    models currently related are unrelated.
   * @param {boolean} [remoteData=false] -
   *    Whether this change is due to remote changes or changes that should not
   *    trigger removes or saves.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  set: function(input, remoteData)
  {
    this.relator.set( this.model, input, remoteData );

    return this;
  },

  /**
   * Relates one or more models to this collection's model. If a model is
   * specified that is already related then it has no effect.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to relate.
   * @param {boolean} [remoteData=false] -
   *    Whether this change is due to remote changes or changes that should not
   *    trigger removes or saves.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  relate: function(input, remoteData)
  {
    this.relator.relate( this.model, input, remoteData );

    return this;
  },

  /**
   * Unrelates one or more models from this collection's model. If a model is
   * specified that is not related then it has no effect. If no models are
   * specified then all models in this collection are unrelated.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {modelInput|modelInput[]} input -
   *    The model or array of models to relate.
   * @param {boolean} [remoteData=false] -
   *    Whether this change is due to remote changes or changes that should not
   *    trigger removes or saves.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  unrelate: function(input, remoteData)
  {
    this.relator.unrelate( this.model, input, remoteData );

    return this;
  },

  /**
   * Syncrhonizes the related models in this collection by re-evaluating all
   * models for a relationship.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {boolean} [removeUnrelated=false] -
   *    Whether to remove models that are no longer related. The $remove
   *    function is not called on these models.
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   */
  sync: function(removeUnrelated)
  {
    this.relator.sync( this.model, removeUnrelated );

    return this;
  },

  /**
   * Unrelates any models in this collection which meet the where expression.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @param {whereInput} [properties] -
   *    See {@link Rekord.createWhere}
   * @param {Any} [value] -
   *    See {@link Rekord.createWhere}
   * @param {equalityCallback} [equals] -
   *    See {@link Rekord.createWhere}
   * @return {Rekord.RelationCollection} -
   *    The reference to this collection.
   * @see Rekord.createWhere
   * @see Rekord.RelationCollection.unrelate
   * @see Rekord.RelationCollection.where
   */
  unrelateWhere: function(properties, value, equals)
  {
    return this.unrelate( this.where( properties, value, equals, [] ) );
  },

  /**
   * Determines whether one or more models all exist in this collection.
   *
   * @method
   * @memberof Rekord.RelationCollection#
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
   * @memberof Rekord.RelationCollection#
   * @return {Rekord.RelationCollection} -
   *    The reference to a clone collection.
   */
  clone: function()
  {
    return RelationCollection.create( this.database, this.model, this.relator, this, true );
  },

  /**
   * Returns an empty clone of this collection.
   *
   * @method
   * @memberof Rekord.RelationCollection#
   * @return {Rekord.RelationCollection} -
   *    The reference to a clone collection.
   */
  cloneEmpty: function()
  {
    return RelationCollection.create( this.database, this.model, this.relator );
  }

});
