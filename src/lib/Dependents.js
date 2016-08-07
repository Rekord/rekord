
function Dependents(subject)
{
  this.map = {};
  this.listeners = {};

  this.subject = subject;
}

Dependents.prototype =
{
  add: function(model, relator)
  {
    var key = model.$uid();

    this.map[ key ] = model;

    if ( model.$db.keyChanges && !this.listeners[ key ] )
    {
      var listener = this.handleKeyChange( relator );

      this.listeners[ key ] = model.$on( Model.Events.KeyChange, listener, this );
    }
  },

  remove: function(model)
  {
    var key = model.$uid();

    evaluate( this.listeners[ key ] );

    delete this.listeners[ key ];
    delete this.map[ key ];
  },

  handleKeyChange: function(relator)
  {
    return function(model, oldKey, newKey)
    {
      var prefix = model.$db.name + '$';

      oldKey = prefix + oldKey;
      newKey = prefix + newKey;

      this.listeners[ newKey ] = this.listeners[ oldKey ];
      this.map[ newKey ] = this.map[ oldKey ];

      delete this.listeners[ oldKey ];
      delete this.map[ oldKey ];

      relator.updateForeignKey( this.subject, model, true );
    };
  },

  isSaved: function(callbackOnSaved, contextOnSaved)
  {
    var dependents = this.map;
    var off = noop;

    var onDependentSave = function()
    {
      callbackOnSaved.apply( contextOnSaved || this, arguments );

      off();
    };

    for (var uid in dependents)
    {
      var dependent = dependents[ uid ];

      if ( !dependent.$isSaved() )
      {
        off = dependent.$once( Model.Events.RemoteSaves, onDependentSave );

        return false;
      }
    }

    return true;
  }

};
