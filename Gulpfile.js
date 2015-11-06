'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var plugins = require('gulp-load-plugins')();
var gutil = require('gulp-util');
var shell = require('gulp-shell');

var source = 
{
  default: 
  [
    './src/header.js',
    './src/lib/functions.js',
    './src/lib/eventize.js',
    './src/lib/Neuro.js',
    './src/lib/Neuro_debug.js',
    './src/lib/Neuro_rest.js',
    './src/lib/Neuro_store.js',
    './src/lib/Neuro_live.js',
    './src/lib/Neuro_offline.js',
    './src/lib/NeuroDatabase.js',
    './src/lib/NeuroModel.js',
    './src/lib/NeuroMap.js',
    './src/lib/NeuroOperation.js',
    './src/lib/operations/*.js',
    './src/lib/NeuroRelation.js',
    './src/lib/relations/*.js',
    './src/footer.js'
  ],
  plugins: 
  {
    pubsub: 
    [
      './src/plugins/neurosync-pubsub.js'
    ],
    angular: 
    [
      './src/plugins/neurosync-angular.js'
    ],
    stork: 
    [
      './src/plugins/neurosync-stork.js'
    ],
    debug: 
    [
      './src/plugins/neurosync-debug.js'
    ]
  }
};

var builds = 
{
  default:
  {
    filename: 'neurosync.js',
    minified: 'neurosync.min.js',
    output: './build/',
    include: source.default
  },
  plugins:
  {
    pubsub:
    {
      filename: 'neurosync-pubsub.js',
      minified: 'neurosync-pubsub.min.js',
      output: './build/plugins/',
      include: source.plugins.pubsub
    },
    angular:
    {
      filename: 'neurosync-angular.js',
      minified: 'neurosync-angular.min.js',
      output: './build/plugins/',
      include: source.plugins.angular
    },
    stork:
    {
      filename: 'neurosync-stork.js',
      minified: 'neurosync-stork.min.js',
      output: './build/plugins/',
      include: source.plugins.stork
    },
    debug:
    {
      filename: 'neurosync-debug.js',
      minified: 'neurosync-debug.min.js',
      output: './build/plugins/',
      include: source.plugins.debug
    }
  }
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

gulp.task( 'docs', shell.task(['./node_modules/.bin/jsdoc -c jsdoc.json']));

gulp.task( 'js:default',        executeBuild( builds.default ) );
gulp.task( 'js:default:min',    executeMinifiedBuild( builds.default ) );
gulp.task( 'js:pubsub',         executeMinifiedBuild( builds.plugins.pubsub ) );
gulp.task( 'js:angular',        executeMinifiedBuild( builds.plugins.angular ) );
gulp.task( 'js:stork',          executeMinifiedBuild( builds.plugins.stork ) );
gulp.task( 'js:debug',          executeMinifiedBuild( builds.plugins.debug ) );

gulp.task( 'js:min', ['js:default:min', 'js:pubsub', 'js:angular', 'js:stork', 'js:debug']);
gulp.task( 'js', ['js:default']);
gulp.task( 'default', ['js:min', 'js']);
