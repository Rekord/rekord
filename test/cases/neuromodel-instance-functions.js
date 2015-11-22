module( 'Neuro.Model instance functions' );

test( 'constructor', function(assert)
{
  var Named = Neuro({
    name: 'Model_constructor',
    fields: ['id', 'name']
  });

  var n0 = new Named();
  strictEqual( n0.id, void 0 );
  strictEqual( n0.name, void 0 );

  var n1 = new Named({name: 'name1'});
  strictEqual( n1.id, void 0 );
  strictEqual( n1.name, 'name1' );

  var n2 = new Named({id: 5, name: 'name2'});
  strictEqual( n2.id, 5 );
  strictEqual( n2.name, 'name2' );
});

test( '$reset', function(assert)
{
  var Todo = Neuro({
    name: 'Model_reset',
    fields: ['id', 'name', 'done', 'times'],
    defaults: {
      name: '',
      done: false,
      times: 0
    }
  });

  var t0 = new Todo({name: 'Yo', done: true});
  t0.times += 23;

  strictEqual( t0.name, 'Yo' );
  strictEqual( t0.done, true );
  strictEqual( t0.times, 23 );

  t0.$reset();

  strictEqual( t0.name, '' );
  strictEqual( t0.done, false );
  strictEqual( t0.times, 0 );

  t0.done = true;

  t0.$reset({
    times: 10,
    name: 'Fo'
  });

  strictEqual( t0.name, 'Fo' );
  strictEqual( t0.done, false );
  strictEqual( t0.times, 10 );
});

test( '$set', function(assert)
{
  var Address = Neuro({
    name: 'Model_set_address',
    fields: ['id', 'street', 'city', 'state']
  });

  var Person = Neuro({
    name: 'Model_set_person',
    fields: ['id', 'first', 'last', 'address_id'],
    defaults: {
      address: Address.create
    },
    hasOne: {
      address: {
        model: Address,
        local: 'address_id'
      }
    }
  });

  var p0 = new Person();

  strictEqual( p0.first, void 0 );
  strictEqual( p0.last, void 0 );
  notStrictEqual( p0.address, void 0 );
  notStrictEqual( p0.address_id, void 0 );

  p0.$set('first', 'Jessica');

  strictEqual( p0.first, 'Jessica' );

  p0.$set({
    last: 'Jones'
  });

  strictEqual( p0.last, 'Jones' );

  var a0 = p0.address;

  p0.$set({
    address: Address.create({street: 'Easy St', city: 'NYC', state: 'NY'})
  });

  var a1 = p0.address;

  notStrictEqual( a0, a1 );
  ok( a0.$deleted );
});

test( '$get', function(assert)
{
  var Address = Neuro({
    name: 'Model_get_address',
    fields: ['id', 'street', 'city', 'state']
  });

  var Person = Neuro({
    name: 'Model_get_person',
    fields: ['id', 'first', 'last', 'address_id'],
    defaults: {
      address: Address
    },
    hasOne: {
      address: {
        model: Address,
        local: 'address_id'
      }
    }
  });

  var p0 = Person.create({first: 'Jones', last: 'Jessica'});
  var a0 = p0.address;

  strictEqual( p0.$get( 'last' ), 'Jessica' );
  strictEqual( p0.$get( 'address' ), a0 );
  deepEqual( p0.$get( {first: 0} ), {first: 'Jones'} );
  deepEqual( p0.$get( ['last', 'first'] ), {last: 'Jessica', first: 'Jones'} );
});

test( '$relate $unrelate $isRelated $getRelation', function(assert)
{
  var Task = Neuro({
    name: 'Model_relations_task',
    fields: ['id', 'task_list_id', 'name', 'completed_at'],
    belongsTo: {
      list: {
        model: 'Model_relations_tasklist',
        local: 'task_list_id'
      }
    }
  });

  var TaskList = Neuro({
    name: 'Model_relations_tasklist',
    fields: ['id', 'name'],
    hasMany: {
      tasks: {
        model: 'Model_relations_task',
        foreign: 'task_list_id'
      }
    }
  });

  var l0 = TaskList.create({name: 'TaskList0'});

  strictEqual( l0.tasks.length, 0 );

  var t0 = Task.create({name: 'Task0'});

  l0.$relate( 'tasks', t0 );

  strictEqual( l0.tasks.length, 1 );
  strictEqual( l0.id, t0.task_list_id );
  strictEqual( l0.id, t0.list.id );

  ok( l0.$isRelated( 'tasks', t0 ) );
  ok( l0.$isRelated( 'tasks', t0.id ) );

  l0.$unrelate( 'tasks', t0.id );

  strictEqual( l0.tasks.length, 0 );
  strictEqual( t0.task_list_id, null );

  notStrictEqual( l0.$getRelation( 'tasks' ), void 0 );
});

test( '$save', function(assert)
{
  var Issue = Neuro({
    name: 'Model_save',
    fields: ['id', 'title', 'number']
  });

  var i0 = new Issue();

  i0.$save({
    title: 'Title0',
    number: 1
  });

  ok( i0.$isSaved() );

  strictEqual( i0.title, 'Title0' );
  strictEqual( i0.number, 1 );

  i0.$save('number', 4);

  strictEqual( i0.title, 'Title0' );
  strictEqual( i0.number, 4 );

  i0.title = 'Title1';
  i0.$save();

  strictEqual( i0.title, 'Title1' );
  strictEqual( i0.number, 4 );
});

test( '$remove $exists', function(assert)
{
  var Issue = Neuro({
    name: 'Model_remove_exists',
    fields: ['id', 'title', 'number']
  });

  var i0 = new Issue({title: 'Tissue'});

  notOk( i0.$exists() );

  i0.$save();

  ok( i0.$exists() );

  i0.$remove();

  notOk( i0.$exists() );
});

test( '$key', function(assert)
{
  var Issue = Neuro({
    name: 'Model_key',
    fields: ['id', 'title', 'number']
  });

  var i0 = new Issue({title: 'Wipe'});

  strictEqual( i0.id, void 0 );
  notStrictEqual( i0.$key(), void 0 );
  notStrictEqual( i0.id, void 0 );
  strictEqual( i0.$keys(), i0.id );
});

test( '$keys', function(assert)
{
  var Issue = Neuro({
    name: 'Model_keys',
    key: ['id', 'number'],
    fields: ['id', 'title', 'number']
  });

  var i0 = new Issue({id: 4, number: 3, title: 'Wipe'});

  strictEqual( i0.$key(), '4/3' );
  deepEqual( i0.$keys(), [4,3] );
});

test( '$isSaved', function(assert)
{
  var Issue = Neuro({
    name: 'Model_isSaved',
    fields: ['id', 'title', 'number']
  });

  var i0 = new Issue({title: 'Not!'});

  notOk( i0.$isSaved() );

  i0.$save();

  ok( i0.$isSaved() );
});

test( '$isSavedLocally', function(assert)
{
  var done = assert.async();

  var Issue = Neuro({
    name: 'Model_isSavedLocally',
    fields: ['id', 'title', 'number']
  });

  var rest = Neuro.rest.Model_isSavedLocally;

  var i0 = new Issue({title: 'issue#0'});

  notOk( i0.$isSavedLocally() );
  notOk( i0.$isSaved() );

  rest.delay = 10;

  i0.$save();

  ok( i0.$isSavedLocally() );
  notOk( i0.$isSaved() );

  setTimeout(function()
  {
    ok( i0.$isSavedLocally() );
    ok( i0.$isSaved() );
    done();

  }, 15);

});

test( '$getChanges', function(assert)
{
  var Todo = Neuro({
    name: 'Model_getChanges',
    fields: ['id', 'name']
  });

  var t0 = new Todo({name: 'this'});

  deepEqual( t0.$getChanges(), {id: void 0, name: 'this'} );

  t0.$save();

  deepEqual( t0.$getChanges(), {} );

  t0.name = 'changed!';

  deepEqual( t0.$getChanges(), {name: 'changed!'} );

  t0.$save();

  deepEqual( t0.$getChanges(), {} );
});

test( '$hasChanges', function(assert)
{
  var Todo = Neuro({
    name: 'Model_hasChanges',
    fields: ['id', 'name']
  });

  var t0 = new Todo({name: 'this'});

  ok( t0.$hasChanges() );

  t0.$save();

  notOk( t0.$hasChanges() );

  t0.name = 'changed!';

  ok( t0.$hasChanges() );

  t0.$save();

  notOk( t0.$hasChanges() );
});