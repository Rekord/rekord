
function extend(parent, child, override)
{
  // Avoid calling the parent constructor
  parent = copyConstructor( parent );
  // Child instances are instanceof parent
  child.prototype = new parent();
  // Copy new methods into child prototype
  addMethods( child.prototype, override );
  // Set the correct constructor
  child.prototype.constructor = child;
}

function extendArray(parent, child, override)
{
  // If direct extension of array is supported...
  if ( extendArraySupported() )
  {
    extend( parent, child, override );
    child.create = factory( child );
  }
  // Otherwise copy all of the methods
  else
  {
    // Avoid calling the parent constructor
    parent = copyConstructor( parent );

    // TODO fix for IE8
    child.create = function()
    {
      var created = new parent();
      child.apply( created, arguments );
      transfer( override, created );
      return created;
    };
  }
}

// Is directly extending an array supported?
function extendArraySupported()
{
  function EA() {}

  if ( extendArraySupported.supported === undefined )
  {
    EA.prototype = [];
    var eq = new EA();
    eq.push(0);
    extendArraySupported.supported = (eq.length === 1);
  }

  return extendArraySupported.supported;
}

var addMethod = (function()
{
  if ( Object.defineProperty )
  {
    return function(target, methodName, method)
    {
      Object.defineProperty( target, methodName, {
        configurable: true,
        enumerable: false,
        value: method
      });
    };
  }
  else
  {
    return function(target, methodName, method)
    {
      target[ methodName ] = method;
    };
  }

})();

function addMethods(target, methods)
{
  for (var methodName in methods)
  {
    addMethod( target, methodName, methods[ methodName ] );
  }
}

function replaceMethod(target, methodName, methodFactory)
{
  addMethod( target, methodName, methodFactory( target[ methodName ] ) );
}


// Copies a constructor function returning a function that can be called to
// return an instance and doesn't invoke the original constructor.
function copyConstructor(func)
{
  function F() {}
  F.prototype = func.prototype;
  return F;
}

// Creates a factory for instantiating
function factory(constructor)
{
  function F(args)
  {
    return constructor.apply( this, args );
  }

  F.prototype = constructor.prototype;

  return function()
  {
    return new F( arguments );
  };
}
