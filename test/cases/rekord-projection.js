
module( 'Rekord Projection' );

Rekord.Filters.upper = function(x) {
  return Rekord.isString( x ) ? x.toUpperCase() : x;
};
Rekord.Filters.lower = function(x) {
  return Rekord.isString( x ) ? x.toLowerCase() : x;
};
Rekord.Filters.currency = function(x) {
  return Rekord.isNumber( x ) ? '$' + x.toFixed( 2 ) : x;
};
Rekord.Filters.length = function(x) {
  return x.length;
};
Rekord.Wheres.isDone = function(x) {
  return x.done;
};
Rekord.Wheres.notdone = function(x) {
  return !x.done;
};

test( 'field', function(assert)
{
  var prefix = 'Projection_field_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var proj0 = new Rekord.Projection( Task.Database, ['name'] );

  var t0 = new Task({name: 'My Task'});
  var p0 = proj0.project( t0 );

  deepEqual( p0, {name: 'My Task'} );
});

test( 'filter', function(assert)
{
  var prefix = 'Projection_filter_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done']
  });

  var proj0 = new Rekord.Projection( Task.Database, ['name:name|upper'] );

  var t0 = new Task({name: 'My Task'});
  var p0 = proj0.project( t0 );

  deepEqual( p0, {name: 'MY TASK'} );
});

test( 'filter number', function(assert)
{
  var prefix = 'Projection_filter_number_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['name', 'done', 'cost']
  });

  var proj0 = new Rekord.Projection( Task.Database, ['name', 'cost:cost|currency'] );

  var t0 = new Task({name: 'My Task', cost: 1.234});
  var p0 = proj0.project( t0 );

  deepEqual( p0, {name: 'My Task', cost: '$1.23'} );
});

test( 'relation single', function(assert)
{
  var prefix = 'Projection_relation_single_';

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name']
  });

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['created_by', 'name', 'done'],
    belongsTo: {
      creator: {
        model: User,
        local: 'created_by'
      }
    }
  });

  var proj0 = new Rekord.Projection( Task.Database, ['name', 'creator:creator.name|lower'] );

  var t0 = new Task({name: 'My Task', creator: {name: 'Phil'}});
  var p0 = proj0.project( t0 );

  deepEqual( p0, {name: 'My Task', creator: 'phil'} );
});

test( 'relation multiple where', function(assert)
{
  var prefix = 'Projection_relation_multiple_where_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['created_by', 'name', 'done'],
    projections: {
      named: ['name']
    }
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'created_by'
      }
    },
    projections: {
      doneSummary: ['name', 'finished:tasks?isDone(named)', 'todo:tasks?notdone|length']
    }
  });

  var u0 = User.boot({
    id: 2,
    name: 'u0',
    tasks: [
      {id: 3, name: 't0', done: false},
      {id: 4, name: 't1', done: true},
      {id: 5, name: 't2', done: false}
    ]
  });

  var p0 = u0.$project( 'doneSummary' );

  deepEqual( p0, {
    name: 'u0',
    todo: 2,
    finished: [
      {name: 't1'}
    ]
  });
});

test( 'pluck values', function(assert)
{
  var prefix = 'Projection_pluck_values_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['created_by', 'name', 'done'],
    projections: {
      named: ['name']
    }
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'created_by'
      }
    },
    projections: {
      doneSummary: ['name', 'finished:tasks?isDone[name]', 'todo:tasks?notdone|length']
    }
  });

  var u0 = User.boot({
    id: 2,
    name: 'u0',
    tasks: [
      {id: 3, name: 't0', done: false},
      {id: 4, name: 't1', done: true},
      {id: 5, name: 't2', done: false}
    ]
  });

  var p0 = u0.$project( 'doneSummary' );

  deepEqual( p0, {
    name: 'u0',
    todo: 2,
    finished: ['t1']
  });
});

test( 'pluck objects', function(assert)
{
  var prefix = 'Projection_pluck_objects_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['created_by', 'name', 'done'],
    projections: {
      named: ['name']
    }
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'created_by'
      }
    },
    projections: {
      doneSummary: ['name', 'finished:tasks?isDone{id:name}']
    }
  });

  var u0 = User.boot({
    id: 2,
    name: 'u0',
    tasks: [
      {id: 3, name: 't0', done: false},
      {id: 4, name: 't1', done: true},
      {id: 5, name: 't2', done: false}
    ]
  });

  var p0 = u0.$project( 'doneSummary' );

  deepEqual( p0, {
    name: 'u0',
    finished: {4:'t1'}
  });
});

test( 'resolve simple', function(assert)
{
  var prefix = 'Projection_resolve_simple_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['created_by', 'name', 'done'],
    projections: {
      named: ['name']
    }
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'created_by'
      }
    },
    projections: {
      doneSummary: ['name', 'finished:tasks?isDone#length']
    }
  });

  var u0 = User.boot({
    id: 2,
    name: 'u0',
    tasks: [
      {id: 3, name: 't0', done: false},
      {id: 4, name: 't1', done: true},
      {id: 5, name: 't2', done: false}
    ]
  });

  var p0 = u0.$project( 'doneSummary' );

  deepEqual( p0, {
    name: 'u0',
    finished: 1
  });
});

test( 'resolve function', function(assert)
{
  var prefix = 'Projection_resolve_function_';

  var Task = Rekord({
    name: prefix + 'task',
    fields: ['created_by', 'name', 'done'],
    projections: {
      named: ['name']
    }
  });

  var User = Rekord({
    name: prefix + 'user',
    fields: ['name'],
    hasMany: {
      tasks: {
        model: Task,
        foreign: 'created_by'
      }
    },
    projections: {
      doneSummary: ['name', 'finished:tasks?isDone#0#$key'] /* key of the first done */
    }
  });

  var u0 = User.boot({
    id: 2,
    name: 'u0',
    tasks: [
      {id: 3, name: 't0', done: false},
      {id: 4, name: 't1', done: true},
      {id: 5, name: 't2', done: false}
    ]
  });

  var p0 = u0.$project( 'doneSummary' );

  deepEqual( p0, {
    name: 'u0',
    finished: 4
  });
});
