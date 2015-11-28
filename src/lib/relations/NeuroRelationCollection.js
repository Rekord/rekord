
function NeuroRelationCollection(database, model, relator)
{
  this.init( database );
  this.model = model;
  this.relator = relator;
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
  }

});