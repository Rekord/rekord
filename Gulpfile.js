'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var plugins = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var qunit = require('gulp-qunit');
var shell = require('gulp-shell');
var merge = require('merge-stream');

var build = {
  filename: 'rekord.js',
  minified: 'rekord.min.js',
  output: './build/',
  include: [
    './src/header.js',
    './src/lib/functions/*',
    './src/lib/Rekord.js',
    './src/lib/debug.js',
    './src/lib/rest.js',
    './src/lib/store.js',
    './src/lib/live.js',
    './src/lib/offline.js',
    './src/lib/batch.js',
    './src/lib/Gate.js',
    './src/lib/Database.js',
    './src/lib/Model.js',
    './src/lib/Map.js',
    './src/lib/collections/Collection.js',
    './src/lib/collections/Filtering.js',
    './src/lib/collections/Page.js',
    './src/lib/collections/FilteredCollection.js',
    './src/lib/collections/ModelCollection.js',
    './src/lib/collections/FilteredModelCollection.js',
    './src/lib/collections/RelationCollection.js',
    './src/lib/collections/DiscriminateCollection.js',
    './src/lib/search/Search.js',
    './src/lib/search/SearchPaged.js',
    './src/lib/Promise.js',
    './src/lib/operations/Operation.js',
    './src/lib/operations/GetLocal.js',
    './src/lib/operations/GetRemote.js',
    './src/lib/operations/RemoveCache.js',
    './src/lib/operations/RemoveLocal.js',
    './src/lib/operations/RemoveNow.js',
    './src/lib/operations/RemoveRemote.js',
    './src/lib/operations/SaveLocal.js',
    './src/lib/operations/SaveNow.js',
    './src/lib/operations/SaveRemote.js',
    './src/lib/relations/Relation.js',
    './src/lib/relations/RelationSingle.js',
    './src/lib/relations/RelationMultiple.js',
    './src/lib/relations/BelongsTo.js',
    './src/lib/relations/HasOne.js',
    './src/lib/relations/HasMany.js',
    './src/lib/relations/HasManyThrough.js',
    './src/lib/relations/HasRemote.js',
    './src/lib/relations/Polymorphic.js',
    './src/lib/Shard.js',
    './src/lib/plugins/*.js',
    './src/lib/validation/**/*.js',
    './src/footer.js'
  ]
};

var modularized = {
  output: './build/modular/',
  header: [
    './src/header.js',
    './src/lib/functions/*',
    './src/lib/Rekord.js',
    './src/lib/debug.js',
    './src/lib/rest.js',
    './src/lib/store.js',
    './src/lib/live.js',
    './src/lib/offline.js',
    './src/lib/batch.js',
    './src/lib/Gate.js',
    './src/lib/Database.js',
    './src/lib/Model.js',
    './src/lib/Map.js',
    './src/lib/collections/Collection.js',
    './src/lib/collections/Filtering.js',
    './src/lib/collections/Page.js',
    './src/lib/collections/FilteredCollection.js',
    './src/lib/collections/ModelCollection.js',
    './src/lib/collections/FilteredModelCollection.js',
    './src/lib/collections/RelationCollection.js',
    './src/lib/Promise.js',
    './src/lib/operations/Operation.js',
    './src/lib/operations/GetLocal.js',
    './src/lib/operations/GetRemote.js',
    './src/lib/operations/RemoveCache.js',
    './src/lib/operations/RemoveLocal.js',
    './src/lib/operations/RemoveNow.js',
    './src/lib/operations/RemoveRemote.js',
    './src/lib/operations/SaveLocal.js',
    './src/lib/operations/SaveNow.js',
    './src/lib/operations/SaveRemote.js',
    './src/lib/relations/Relation.js',
    './src/lib/relations/RelationSingle.js',
    './src/lib/relations/RelationMultiple.js',
    './src/lib/relations/BelongsTo.js',
    './src/lib/relations/HasOne.js',
    './src/lib/relations/HasMany.js',
    './src/lib/relations/HasManyThrough.js',
    './src/lib/relations/HasRemote.js',
    './src/lib/plugins/all.js',
    './src/lib/plugins/boot.js',
    './src/lib/plugins/collect.js',
    './src/lib/plugins/create.js',
    './src/lib/plugins/fetch.js',
    './src/lib/plugins/fetchAll.js',
    './src/lib/plugins/filtered.js',
    './src/lib/plugins/find.js',
    './src/lib/plugins/get.js',
    './src/lib/plugins/grab.js',
    './src/lib/plugins/grabAll.js',
    './src/lib/plugins/methods.js',
    './src/lib/plugins/ready.js',
    './src/lib/plugins/refresh.js'
  ],
  modules: {
    S: [ // searching
      './src/lib/search/Search.js',
      './src/lib/search/SearchPaged.js',
      './src/lib/plugins/search.js',
      './src/lib/plugins/searchPaged.js'
    ],
    P: [ // polymorphism
      './src/lib/collections/DiscriminateCollection.js',
      './src/lib/relations/Polymorphic.js'
    ],
    R: [ // sharding
      './src/lib/Shard.js',
      './src/lib/plugins/shard.js'
    ],
    V: [ // validation
      './src/lib/plugins/validation.js',
      './src/lib/validation/**/*.js'
    ],
    F: [ // files
      './src/lib/plugins/files.js'
    ],
    Y: [ // dynamic
      './src/lib/plugins/dynamic.js'
    ],
    T: [ // dates
      './src/lib/plugins/timestamps.js'
    ],
    E: [ // events
      './src/lib/plugins/events.js'
    ],
    X: [ // extend
      './src/lib/plugins/extend.js'
    ]
  },
  footer: [
    './src/footer.js'
  ]
};

var executeMinifiedBuild = function(props)
{
  return function() {
    return gulp
      .src( props.include )
      .pipe( sourcemaps.init() )
        .pipe( plugins.concat( props.minified ) )
        .pipe( plugins.uglify().on('error', gutil.log) )
      .pipe( sourcemaps.write('.') )
      .pipe( gulp.dest( props.output ) )
    ;
  };
};

var executeBuild = function(props)
{
  return function() {
    return gulp
      .src( props.include )
      .pipe( plugins.concat( props.filename ) )
      .pipe( gulp.dest( props.output ) )
    ;
  };
};

var executeTest = function(file)
{
  return function() {
    return gulp.src( file ).pipe( qunit() );
  };
};

var executeModular = function(def, minify)
{
  return function()
  {
    var modules = merge();
    var moduleNames = Object.keys( def.modules );
    var moduleCombinations = Math.pow( 2, moduleNames.length );

    for (var i = 0; i < moduleCombinations; i++)
    {
      var files = def.header;
      var fileModules = [];

      for (var j = 0; j < moduleNames.length; j++)
      {
        if ((i & Math.pow(2, j)))
        {
          fileModules.push( moduleNames[ j ] );
          files = files.concat( def.modules[ moduleNames[ j ] ] );
        }
      }

      files = files.concat( def.footer );

      var build = {
        include: files,
        filename: 'rekord-' + fileModules.join('') + '.js',
        minified: 'rekord-' + fileModules.join('') + '.min.js',
        output: def.output
      };

      modules.add( minify ?
        executeMinifiedBuild( build )() :
        executeBuild( build )()
      );
    }

    return modules;
  };
};

gulp.task( 'docs', shell.task(['./node_modules/.bin/jsdoc -c jsdoc.json']));
gulp.task( 'clean', shell.task(['rm -rf build/*.js', 'rm -rf build/*.map']));
gulp.task( 'test', executeTest( './test/index.html' ) );

gulp.task( 'js:min', executeMinifiedBuild( build ) );
gulp.task( 'js', executeBuild( build ) );
gulp.task( 'js:modular:min', executeModular( modularized, true ) );
gulp.task( 'js:modular', executeModular( modularized, false ) );
gulp.task( 'default', ['js:min', 'js']);
