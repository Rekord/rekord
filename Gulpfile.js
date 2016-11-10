'use strict';

var fs = require('fs');
var pkg = JSON.parse( fs.readFileSync('./package.json') );
var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var plugins = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var qunit = require('gulp-qunit');
var shell = require('gulp-shell');
var merge = require('merge-stream');
var size = require('gulp-check-filesize');
var jshint = require('gulp-jshint');
var rename = require('gulp-rename');
var insert = require('gulp-insert');

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
    './src/lib/Dependents.js',
    './src/lib/keys/KeyHandler.js',
    './src/lib/keys/KeySimple.js',
    './src/lib/keys/KeyComposite.js',
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
    './src/lib/relations/HasList.js',
    './src/lib/relations/HasReference.js',
    './src/lib/relations/Polymorphic.js',
    './src/lib/Shard.js',
    './src/lib/plugins/*.js',
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
    './src/lib/Dependents.js',
    './src/lib/keys/KeyHandler.js',
    './src/lib/keys/KeySimple.js',
    './src/lib/keys/KeyComposite.js',
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
    './src/lib/relations/HasList.js',
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

var comments = [
  "/*", pkg.name, pkg.version, '-', pkg.description, 'by', pkg.author, "*/\n"
];

var executeMinifiedBuild = function(props)
{
  return function() {
    return gulp
      .src( props.output + props.filename )
      .pipe( rename( props.minified ) )
      .pipe( sourcemaps.init() )
        .pipe( plugins.uglify().on('error', gutil.log) )
        .pipe( insert.prepend( comments.join(' ') ) )
      .pipe( sourcemaps.write('.') )
      .pipe( size({enableGzip: true}) )
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
      .pipe( insert.prepend( comments.join(' ') ) )
      .pipe( size({enableGzip: true}) )
      .pipe( gulp.dest( props.output ) )
      .pipe( jshint() )
      .pipe( jshint.reporter('default') )
      .pipe( jshint.reporter('fail') )
    ;
  };
};

var executeTest = function(file)
{
  return function() {
    return gulp
      .src( file )
      .pipe( qunit() )
    ;
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

gulp.task('lint', function() {
  return gulp
    .src( build.output + build.filename )
    .pipe( jshint() )
    .pipe( jshint.reporter('default') )
    .pipe( jshint.reporter('fail') )
  ;
});

gulp.task( 'js', executeBuild( build ) );
gulp.task( 'js:min', ['js'], executeMinifiedBuild( build ) );
gulp.task( 'js:modular', executeModular( modularized, false ) );
gulp.task( 'js:modular:min', ['js:modular'], executeModular( modularized, true ) );

gulp.task( 'default', ['js:min']);

gulp.task( 'test:normal', ['js'], executeTest( './test/index.html' ) );
gulp.task( 'test:nativearray', ['js'], executeTest( './test/index-nativearray.html' ) );
gulp.task( 'test', ['test:normal', 'test:nativearray'] );

gulp.task( 'docs', shell.task(['./node_modules/.bin/jsdoc -c jsdoc.json']));
gulp.task( 'clean', shell.task(['rm -rf build/*.js', 'rm -rf build/*.map']));
