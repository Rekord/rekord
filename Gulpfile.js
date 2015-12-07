'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var plugins = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var qunit = require('gulp-qunit');
var shell = require('gulp-shell');

var build = {
  filename: 'neurosync.js',
  minified: 'neurosync.min.js',
  output: './build/',
  include: [
    './src/header.js',
    './src/lib/functions.js',
    './src/lib/eventize.js',
    './src/lib/Neuro.js',
    './src/lib/plugins/*.js',
    './src/lib/Neuro_debug.js',
    './src/lib/Neuro_rest.js',
    './src/lib/Neuro_store.js',
    './src/lib/Neuro_live.js',
    './src/lib/Neuro_offline.js',
    './src/lib/NeuroDatabase.js',
    './src/lib/NeuroModel.js',
    './src/lib/NeuroMap.js',
    './src/lib/collections/NeuroCollection.js',
    './src/lib/collections/NeuroFilteredCollection.js',
    './src/lib/collections/NeuroModelCollection.js',
    './src/lib/collections/NeuroRelationCollection.js',
    './src/lib/collections/NeuroDiscriminateCollection.js',
    './src/lib/query/NeuroQuery.js',
    './src/lib/query/NeuroRemoteQuery.js',
    './src/lib/NeuroPage.js',
    './src/lib/NeuroOperation.js',
    './src/lib/operations/*.js',
    './src/lib/NeuroRelation.js',
    './src/lib/relations/NeuroRelationSingle.js',
    './src/lib/relations/NeuroRelationMultiple.js',
    './src/lib/relations/NeuroBelongsTo.js',
    './src/lib/relations/NeuroHasOne.js',
    './src/lib/relations/NeuroHasMany.js',
    './src/lib/relations/NeuroHasManyThrough.js',
    './src/lib/relations/NeuroPolymorphic.js',
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

gulp.task( 'docs', shell.task(['./node_modules/.bin/jsdoc -c jsdoc.json']));
gulp.task( 'test', executeTest( './test/index.html' ) );

gulp.task( 'js:min', executeMinifiedBuild( build ) );
gulp.task( 'js', executeBuild( build ) );
gulp.task( 'default', ['js:min', 'js']);
