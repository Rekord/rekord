
addPlugin( function(model, db, options)
{

  model.hasTrait = function(trait, comparator)
  {
    return db.hasTrait(trait, comparator);
  };

  model.hasTraits = function(traits, comparator)
  {
    return db.hasTraits(traits, comparator);
  };

});
