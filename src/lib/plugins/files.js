Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var files = options.files || Database.Defaults.files;

  if ( !isObject( files ) )
  {
    return;
  }

  if ( !isFilesSupported() )
  {
    Rekord.trigger( Rekord.Events.FilesNotSupported );

    return;
  }

  for (var field in files)
  {
    var fieldOption = files[ field ];

    if ( isString( fieldOption ) )
    {
      fieldOption = {
        type: fieldOption
      };
    }

    db.decodings[ field ] = FileDecodings[ fieldOption.type ]( db, fieldOption );
    db.encodings[ field ] = FileEncoder;
  }
});

/**
files: {
  field: {
    type: 'text', // base64, dataURL, resource
    processor: 'processor_name',
    capacity: 1024 * 1024, // maximum bytes
    types: ['image/png', 'image/jpg', 'image/gif'], // acceptable MIME types
    autoSave: true,
    store: true,
    save: true
  }
}
**/

Rekord.fileProcessors = {};

Rekord.Events.FilesNotSupported = 'files-not-supported';
Rekord.Events.FileTooLarge = 'file-too-large';
Rekord.Events.FileWrongType = 'file-wrong-type';
Rekord.Events.FileOffline = 'file-offline';

// {
//  fileToValue(file, model, field, callback),
//  valueToUser(value, model, field, callback)
// }
Rekord.addFileProcessor = function(name, methods)
{
  Rekord.fileProcessors[ name ] = methods;
};

Rekord.fileProperties =
[
  'lastModifiedDate', 'name', 'size', 'type'
];

function isFilesSupported()
{
  return global.File && global.FileReader && global.FileList;
}

function toFile(input)
{
  if ( input instanceof global.File )
  {
    return input;
  }
  else if ( input instanceof global.Blob )
  {
    return input;
  }
  else if ( input instanceof global.FileList && input.length > 0 )
  {
    return input[0];
  }

  return false;
}

function convertNone(x)
{
  return x;
}

function convertBase64(x)
{
  var i = isString( x ) ? x.indexOf(';base64,') : -1;

  return i === -1 ? x : x.substring( i + 8 );
}

function trySave(model, options)
{
  if ( options.autoSave && model.$isSaved() )
  {
    model.$save();
  }
}

function putFileCache(model, property, value, file, options)
{
  model.$files = model.$files || {};
  model.$files[ property ] = {
    value: value,
    user: value,
    file: file,
    options: options
  };
}

function setFilesValue(processor, value, model, property, options)
{
  var result = undefined;
  var done = false;

  if ( processor && processor.valueToUser )
  {
    processor.valueToUser( value, model, property, function(user)
    {
      model.$files[ property ].user = user;

      if ( done )
      {
        model[ property ] = user;
        trySave( model, options );
      }
      else
      {
        result = user;
      }
    });
  }
  else
  {
    result = value;
  }

  done = true;

  return result;
}

function fileReader(method, converter, options)
{
  var processor = Rekord.fileProcessors[ options.processor ];

  if ( !(method in global.FileReader.prototype) )
  {
    Rekord.trigger( Rekord.Events.FilesNotSupported );
  }

  return function(input, model, property)
  {
    var file = toFile( input );

    if ( file !== false )
    {
      var reader = new global.FileReader();
      var result = undefined;
      var done = false;

      reader.onload = function(e)
      {
        var value = converter( e.target.result );

        putFileCache( model, property, value, file, options );

        result = setFilesValue( processor, value, model, property, options );

        if ( done )
        {
          model[ property ] = result;
          trySave( model, options );
        }
      };

      reader[ method ]( file );

      done = true;

      return result;
    }
    else if ( isObject( input ) && input.FILE )
    {
      var result = undefined;

      var setter = function(value)
      {
          result = value;
      };

      Rekord.trigger( Rekord.Events.FileOffline, [input, model, property, setter] );

      return result;
    }
    else
    {
      putFileCache( model, property, input, null, options );

      return setFilesValue( processor, input, model, property, options );
    }
  };
}

var FileDecodings =
{
  text: function(db, options)
  {
    return fileReader( 'readAsText', convertNone, options );
  },
  dataURL: function(db, options)
  {
    return fileReader( 'readAsDataURL', convertNone, options );
  },
  base64: function(db, options)
  {
    return fileReader( 'readAsDataURL', convertBase64, options );
  },
  resource: function(db, options)
  {
    return function(input, model, property)
    {
      var file = toFile( input );
      var processor = Rekord.fileProcessors[ options.processor ];

      if ( !processor )
      {
        throw 'Processor required for resource files.';
      }

      if ( file !== false )
      {
        if ( isNumber( options.capacity ) && isNumber( file.size ) && file.size > options.capacity )
        {
          Rekord.trigger( Rekord.Events.FileTooLarge, [file, model, property] );

          return undefined;
        }

        if ( isArray( options.types ) && isString( file.type ) && indexOf( options.types, file.type ) === false )
        {
          Rekord.trigger( Rekord.Events.FileWrongType, [file, model, property] );

          return undefined;
        }

        var result = undefined;
        var done = false;

        processor.fileToValue( file, model, property, function(value)
        {
          putFileCache( model, property, value, file, options );

          result = setFilesValue( processor, value, model, property, options );

          if ( done )
          {
            model[ property ] = result;
            trySave( model, options );
          }
        });

        done = true;

        return result;
      }
      else if ( isObject( input ) && input.FILE )
      {
        Rekord.trigger( Rekord.Events.FileOffline, [input, model, property] );
      }
      else
      {
        putFileCache( model, property, input, null, options );

        return setFilesValue( processor, input, model, property, options );
      }
    };
  }
};

function FileEncoder(input, model, field, forSaving)
{
  if ( model.$files && field in model.$files )
  {
    var cached = model.$files[ field ];

    if ( (forSaving && cached.save === false) || (!forSaving && cached.store === false) )
    {
      return undefined;
    }

    if ( !forSaving && cached.file )
    {
      var props = grab( cached.file, Rekord.fileProperties, false );

      props.FILE = true;

      return props;
    }

    if ( input === cached.user )
    {
      if ( forSaving && cached.file )
      {
        model.$once( Model.Events.RemoteSave, function()
        {
          delete cached.file;

          model.$addOperation( SaveLocal, Rekord.Cascade.Local );
        });
      }

      return cached.value;
    }
  }

  return input;
}
