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
