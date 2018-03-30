module( 'Rekord Polymorphic' );

test( 'poly hasOne', function()
{
  Rekord.promises = {};

  var prefix = 'poly_hasOne_';

  var Discriminators = {
    Email:    1,
    Address:  2,
    Phone:    3
  };

  var Email = Rekord({
    name: prefix + 'email',
    className: 'Email',
    fields: ['address']
  });

  var Address = Rekord({
    name: prefix + 'address',
    className: 'Address',
    fields: ['door_number', 'street', 'city', 'state']
  });

  var Phone = Rekord({
    name: prefix + 'phone',
    className: 'Phone',
    fields: ['number']
  });

  var Person = Rekord({
    name: prefix + 'person',
    fields: ['first', 'last', 'contact_id', 'contact_type'],
    hasOne: {
      contact: {
        local: 'contact_id',
        discriminator: 'contact_type',
        discriminators: Discriminators,
        dynamic: true,
        cascade: false
      }
    }
  });

  var c0 = Email.create({address: 'pdiffenderfer@gmail.com'});
  var c1 = Address.create({door_number: 613, street: 'Easy', city: 'Towne', state: 'PA'});
  var c2 = Phone.create({number: '8675309'});

  var p0 = Person.create({first: 'Phil', last: 'Diffy', contact: c0});

  strictEqual( p0.contact, c0 );
  strictEqual( p0.contact_id, c0.id );
  strictEqual( p0.contact_type, Discriminators.Email );

  p0.contact = c1;

  strictEqual( p0.contact, c1 );
  strictEqual( p0.contact_id, c1.id );
  strictEqual( p0.contact_type, Discriminators.Address );

  p0.contact = null;

  strictEqual( p0.contact, null );
  strictEqual( p0.contact_id, null );
  strictEqual( p0.contact_type, null );

  var p1 = Person.create({
    id: 92,
    first: 'Tim',
    last: 'John',
    contact_id: c1.id,
    contact_type: Discriminators.Address
  });

  strictEqual( p1.contact, c1 );
});

test( 'poly belongsTo', function()
{
  Rekord.promises = {};

  var prefix = 'poly_belongsTo_';

  var Discriminators = {
    Email:    1,
    Address:  2,
    Phone:    3
  };

  var Email = Rekord({
    name: prefix + 'email',
    className: 'Email',
    fields: ['address']
  });

  var Address = Rekord({
    name: prefix + 'address',
    className: 'Address',
    fields: ['door_number', 'street', 'city', 'state']
  });

  var Phone = Rekord({
    name: prefix + 'phone',
    className: 'Phone',
    fields: ['number']
  });

  var Person = Rekord({
    name: prefix + 'person',
    fields: ['first', 'last', 'contact_id', 'contact_type'],
    belongsTo: {
      contact: {
        local: 'contact_id',
        discriminator: 'contact_type',
        discriminators: Discriminators,
        dynamic: true
      }
    }
  });

  var c0 = Email.create({address: 'pdiffenderfer@gmail.com'});
  var c1 = Address.create({door_number: 613, street: 'Easy', city: 'Towne', state: 'PA'});
  var c2 = Phone.create({number: '8675309'});

  var p0 = Person.create({first: 'Phil', last: 'Diffy', contact: c0});

  strictEqual( p0.contact, c0 );
  strictEqual( p0.contact_id, c0.id );
  strictEqual( p0.contact_type, Discriminators.Email );

  p0.contact = c1;

  strictEqual( p0.contact, c1 );
  strictEqual( p0.contact_id, c1.id );
  strictEqual( p0.contact_type, Discriminators.Address );

  p0.contact = null;

  strictEqual( p0.contact, null );
  strictEqual( p0.contact_id, null );
  strictEqual( p0.contact_type, null );

  var p1 = Person.create({
    id: 92,
    first: 'Tim',
    last: 'John',
    contact_id: c1.id,
    contact_type: Discriminators.Address
  });

  strictEqual( p1.contact, c1 );
});


test( 'poly hasMany', function()
{
  Rekord.promises = {};

  var prefix = 'poly_hasMany_';

  var Discriminators = {
    Email:    1,
    Address:  2,
    Phone:    3,
    Person:   4
  };

  var Email = Rekord({
    name: prefix + 'email',
    className: 'Email',
    fields: ['parent_id', 'parent_type', 'address']
  });

  var Address = Rekord({
    name: prefix + 'address',
    className: 'Address',
    fields: ['parent_id', 'parent_type', 'door_number', 'street', 'city', 'state']
  });

  var Phone = Rekord({
    name: prefix + 'phone',
    className: 'Phone',
    fields: ['parent_id', 'parent_type', 'number']
  });

  var Person = Rekord({
    name: prefix + 'person',
    className: 'Person',
    fields: ['first', 'last'],
    hasMany: {
      contacts: {
        foreign: 'parent_id',
        discriminator: 'parent_type',
        discriminators: Discriminators,
        dynamic: true,
        clearKey: false
      }
    }
  });

  var c0 = Email.create({address: 'pdiffenderfer@gmail.com'});
  var c1 = Address.create({door_number: 613, street: 'Easy', city: 'Towne', state: 'PA'});
  var c2 = Phone.create({number: '8675309'});

  var p0 = Person.create({first: 'Phil', last: 'Diffy', contacts: [c0, c1, c2]});

  deepEqual( p0.contacts.toArray(), [c0, c1, c2] );
  notOk( c0.$isDeleted() );
  strictEqual( c0.parent_id, p0.id );
  strictEqual( c0.parent_type, Discriminators.Person );
  notOk( c1.$isDeleted() );
  strictEqual( c1.parent_id, p0.id );
  strictEqual( c1.parent_type, Discriminators.Person );
  notOk( c2.$isDeleted() );
  strictEqual( c2.parent_id, p0.id );
  strictEqual( c2.parent_type, Discriminators.Person );

  c1.$remove();

  deepEqual( p0.contacts.toArray(), [c0, c2] );
  notOk( c0.$isDeleted() );
  strictEqual( c0.parent_id, p0.id );
  strictEqual( c0.parent_type, Discriminators.Person );
  ok( c1.$isDeleted() );
  strictEqual( c1.parent_id, p0.id, 'foreign key does not get cleared' );
  strictEqual( c1.parent_type, Discriminators.Person, 'discriminator does not get cleared' );
  notOk( c2.$isDeleted() );
  strictEqual( c2.parent_id, p0.id );
  strictEqual( c2.parent_type, Discriminators.Person );

  p0.contacts = null;

  deepEqual( p0.contacts.toArray(), [] );
  ok( c0.$isDeleted() );
  ok( c1.$isDeleted() );
  ok( c2.$isDeleted() );
});

test( 'polymorphic hasmany', function(assert) {

  // Polymorphic Relationships
  // hasMany: discriminator on related
  // hasManyThrough: discriminator on through
  // hasOne: discriminator on model
  // belongsTo: discriminator on model

  var prefix = 'polymorphic_hasmany_';

  var ListenName = prefix + 'listen';
  var TodoName = prefix + 'todo';
  var TodoListName = prefix + 'todo_list';

  var ListenRest = Rekord.rest[ ListenName ] = new TestRest();
  var TodoRest = Rekord.rest[ TodoName ] = new TestRest();
  var TodoListRest = Rekord.rest[ TodoListName ] = new TestRest();

  ListenRest.map.put(1, {id: 1, related_id: 't1', related_type: 't', on_event: 'e0'});
  ListenRest.map.put(2, {id: 2, related_id: 'tl1', related_type: 'tl', on_event: 'e1'});
  ListenRest.map.put(3, {id: 3, related_id: 't1', related_type: 't', on_event: 'e2'});
  ListenRest.map.put(4, {id: 4, related_id: 't2', related_type: 't', on_event: 'e3'});

  TodoRest.map.put('t1', {id: 't1', name: 'todo1', done: true});
  TodoRest.map.put('t2', {id: 't2', name: 'todo2', done: false});

  TodoListRest.map.put('tl1', {id: 'tl1', name: 'todolist1'});
  TodoListRest.map.put('tl2', {id: 'tl2', name: 'todolist2'});

  var Discriminators = {};
  Discriminators[ TodoName ] = 't';
  Discriminators[ TodoListName ] = 'tl';

  Rekord.autoload = false;

  var Listen = Rekord({
    name: ListenName,
    fields: ['related_id', 'related_type', 'on_event'],
    hasOne: {
      related: {
        local: 'related_id',
        discriminator: 'related_type',
        discriminators: Discriminators,
        cascade: Rekord.Cascade.None
      }
    }
  });

  var HasListens = function(options) {
    var discriminator = Discriminators[ options.name ];
    return {
      hasMany: {
        listens: {
          model: ListenName,
          foreign: 'related_id',
          where: function(related, relation) {
            return Rekord.equals( related.related_type, discriminator );
          }
        }
      }
    };
  };

  var Todo = Rekord({
    name: TodoName,
    fields: ['name', 'done', 'order'],
    traits: [HasListens]
  });

  var TodoList = Rekord({
    name: TodoListName,
    fields: ['name'],
    traits: [HasListens]
  });

  Rekord.load();
  Rekord.autoload = true;

  var l1 = Listen.get(1);
  var l2 = Listen.get(2);
  var l3 = Listen.get(3);
  var l4 = Listen.get(4);

  var t1 = Todo.get('t1');
  var t2 = Todo.get('t2');

  var tl1 = TodoList.get('tl1');
  var tl2 = TodoList.get('tl2');

  strictEqual( l1.related, t1 );
  strictEqual( l2.related, tl1 );
  strictEqual( l3.related, t1 );
  strictEqual( l4.related, t2 );

  strictEqual( t1.listens.length, 2 );
  strictEqual( t1.listens[0], l1 );
  strictEqual( t1.listens[1], l3 );

  strictEqual( t2.listens.length, 1 );
  strictEqual( t2.listens[0], l4 );

  strictEqual( tl1.listens.length, 1 );
  strictEqual( tl1.listens[0], l2 );

  strictEqual( tl2.listens.length, 0 );
});
