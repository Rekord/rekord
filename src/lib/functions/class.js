
// Class.create( construct, methods )
// Class.extend( parent, construct, override )
// Class.prop( target, name, value )
// Class.props( target, properties )
// Class.method( construct, methodName, method )
// Class.method( construct, methods )
// Class.replace( construct, methodName, methodFactory(super) )

// constructor.create( ... )
// constructor.native( ... ) // for arrays
// constructor.$constuctor
// constructor.prototype.$super
// constructor.$methods
// constructor.$prop( name, value ) // add to prototype
// constructor.$method( methodName, method ) // add to prototype
// constructor.$replace( methodName, methodFactory(super) )

var Class =
{

  create: function( construct, methods )
  {
    Class.prop( construct, 'create', Class.factory( construct ) );
    Class.build( construct, methods, noop );
  },

  extend: function( parent, construct, override )
  {
    var methods = collapse( override, parent.$methods );
    var parentCopy = Class.copyConstructor( parent );

    construct.prototype = new parentCopy();

    var instanceFactory = Class.factory( construct );

    if ( Class.isArray( parent ) )
    {
      var nativeArray = function()
      {
        var arr = [];
        Class.props( arr, methods );
        construct.apply( arr, arguments );
        return arr;
      };

      Class.prop( construct, 'native', nativeArray );
      Class.prop( construct, 'create', Settings.nativeArray ? nativeArray : instanceFactory );
    }
    else
    {
      Class.prop( construct, 'create', instanceFactory );
    }

    Class.build( construct, methods, parent );
  },

  dynamic: function(parent, parentInstance, className, code)
  {
    var DynamicClass = new Function('return function ' + className + code)(); // jshint ignore:line

    DynamicClass.prototype = parentInstance;

    Class.build( DynamicClass, {}, parent );

    return DynamicClass;
  },

  build: function(construct, methods, parent)
  {
    Class.prop( construct, '$methods', methods );
    Class.prop( construct, '$prop', Class.propThis );
    Class.prop( construct, '$method', Class.methodThis );
    Class.prop( construct, '$replace', Class.replaceThis );
    Class.prop( construct.prototype, '$super', parent );
    Class.prop( construct.prototype, 'constructor', construct );
    Class.props( construct.prototype, methods );
  },

  isArray: function( construct )
  {
    return Array === construct || construct.prototype instanceof Array;
  },

  method: function( construct, methodName, method )
  {
    if (construct.$methods)
    {
      construct.$methods[ methodName ] = method;
    }

    Class.prop( construct.prototype, methodName, method );
  },

  methodThis: function( methodName, method )
  {
    Class.method( this, methodName, method );
  },

  methods: function( construct, methods )
  {
    for (var methodName in methods)
    {
      Class.method( construct, methodName, methods[ methodName ] );
    }
  },

  prop: (function()
  {
    if (Object.defineProperty)
    {
      return function( target, property, value )
      {
        Object.defineProperty( target, property, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: value
        });
      };
    }
    else
    {
      return function( target, property, value )
      {
        target[ property ] = value;
      };
    }
  })(),

  propThis: function( property, value )
  {
    Class.prop( this.prototype, property, value );
  },

  props: function( target, properties )
  {
    for (var propertyName in properties)
    {
      Class.prop( target, propertyName, properties[ propertyName ] );
    }
  },

  replace: function( target, methodName, methodFactory )
  {
    var existingMethod = target.prototype[ methodName ] || target[ methodName ] || noop;

    Class.method( target, methodName, methodFactory( existingMethod ) );
  },

  replaceThis: function( methodName, methodFactory )
  {
    Class.replace( this, methodName, methodFactory );
  },

  copyConstructor: function(construct)
  {
    function F()
    {

    }

    F.prototype = construct.prototype;

    return F;
  },

  factory: function(construct)
  {
    function F(args)
    {
      construct.apply( this, args );
    }

    F.prototype = construct.prototype;

    return function()
    {
      return new F( arguments );
    };
  }

};
