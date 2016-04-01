
function NeuroRelationCollection(database, model, relator, models, remoteData)
{
  this.model = model;
  this.relator = relator;

  this.init( database, models, remoteData );
}

extendArray( NeuroModelCollection, NeuroRelationCollection,
{

  set: function(input)
  {
    this.relator.set( this.model, input );
  },

  relate: function(input)
  {
    this.relator.relate( this.model, input );
  },

  unrelate: function(input)
  {
    this.relator.unrelate( this.model, input );
  },

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
