
// Given two objects, merge src into dst.
// - If a property in src has a truthy value in ignoreMap then skip merging it.
// - If a property exists in src and not in dst, the property is added to dst.
// - If an array property exists in src and in dst, the src elements are added to dst.
// - If an array property exists in dst and a non array value exists in src, added the value to the dst array.
// - If a property in dst is an object, try to merge the property from src into it.
// - If a property exists in dst that is not an object or array, replace it with the value in src.
function merge(dst, src, ignoreMap)
{
  if (isObject( dst ) && isObject( src ))
  {
    for (var prop in src)
    {
      if (!ignoreMap || !ignoreMap[ prop ])
      {
        var adding = src[ prop ];

        if (prop in dst)
        {
          var existing = dst[ prop ];

          if (isArray( existing ))
          {
            if (isArray( adding ))
            {
              existing.push.apply( existing, adding );
            }
            else
            {
              existing.push( adding );
            }
          }
          else if (isObject( existing ))
          {
            merge( existing, adding, ignoreMap );
          }
          else
          {
            dst[ prop ] = copy( adding, true );
          }
        }
        else
        {
          dst[ prop ] = copy( adding, true );
        }
      }
    }
  }

  return dst;
}
