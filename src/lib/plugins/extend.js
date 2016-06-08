Rekord.on( Rekord.Events.Plugins, function(model, db, options)
{
  var extend = options.extend || Defaults.extend;

  if ( !isRekord( extend ) )
  {
    return;
  }

  var defaults = Defaults;
  var edb = extend.Database;
  var eoptions = edb.options;

  function tryOverwrite(option)
  {
    if ( !options[ option ] )
    {
      db[ option ] = edb[ option ];
    }
  }

  function tryMerge(option)
  {
    var dbo = db[ option ];
    var edbo = edb[ option ];

    for (var prop in edbo)
    {
      if ( !(prop in dbo ) )
      {
        dbo[ prop ] = edbo[ prop ];
      }
    }
  }

  function tryUnshift(options, sourceOptions)
  {
    var source = edb[ sourceOptions || options ];
    var target = db[ options ];

    for (var i = source.length - 1; i >= 0; i--)
    {
      var k = indexOf( target, source[ i ] );

      if ( k !== false )
      {
        target.splice( k, 1 );
      }

      target.unshift( source[ i ] );
    }
  }

  tryOverwrite( 'keySeparator' );
  tryMerge( 'defaults' );
  tryMerge( 'ignoredFields' );
  tryOverwrite( 'loadRelations' );
  tryOverwrite( 'load' );
  tryOverwrite( 'autoRefresh' );
  tryOverwrite( 'cache' );
  tryOverwrite( 'fullSave' );
  tryOverwrite( 'fullPublish' );
  tryMerge( 'encodings' );
  tryMerge( 'decodings' );
  tryOverwrite( 'summarize' );
  tryUnshift( 'fields' );
  tryUnshift( 'saveFields', 'fields' );

  if ( !options.comparator )
  {
    db.setComparator( eoptions.comparator, eoptions.comparatorNullsFirst );
  }

  if ( !options.revision )
  {
    db.setRevision( eoptions.revision );
  }

  if ( !options.summarize )
  {
    db.setSummarize( eoptions.summarize );
  }

  for (var name in edb.relations)
  {
    if ( name in db.relations )
    {
      continue;
    }

    var relation = edb.relations[ name ];
    var relationCopy = new relation.constructor();

    relationCopy.init( db, name, relation.options );

    if ( relationCopy.save )
    {
      db.saveFields.push( name );
    }

    db.relations[ name ] = relationCopy;
    db.relationNames.push( name );
  }

  db.rest   = Rekord.rest( db );
  db.store  = Rekord.store( db );
  db.live   = Rekord.live( db );

});
