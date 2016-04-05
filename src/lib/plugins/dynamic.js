Neuro.on( Neuro.Events.Plugins, function(model, db, options)
{
  var dynamics = collapse( options.dynamic, Database.Defaults.dynamic );

  if ( !isEmpty( dynamics ) )
  {
    for ( var property in dynamics )
    {
      addDynamicProperty( model.prototype, property, dynamics[ property ] );
    }
  }
});

function addDynamicProperty(modelPrototype, property, definition)
{
  var get = isFunction( definition ) ? definition :
          ( isObject( definition ) && isFunction( definition.get ) ? definition.get : noop );
  var set = isObject( definition ) && isFunction( definition.set ) ? definition.set : noop;

  if ( Object.defineProperty )
  {
    Object.defineProperty( modelPrototype, property,
    {
      configurable: false,
      enumerable: true,
      get: get,
      set: set
    });
  }
  else
  {
    var $init = modelPrototype.$init;

    modelPrototype.$init = function()
    {
      $init.apply( this, arguments );

      var lastCalculatedValue = this[ property ] = get.apply( this );

      var handleChange = function()
      {
        var current = this[ property ];

        if ( current !== lastCalculatedValue )
        {
          set.call( this, current );
        }
        else
        {
          lastCalculatedValue = this[ property ] = get.apply( this );
        }
      };

      this.$after( Model.Events.Changes, handleChange, this );
    };
  }
}
