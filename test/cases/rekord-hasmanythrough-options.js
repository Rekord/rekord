module( 'Rekord hasManyThrough options' );

function createUserGroups1( prefix, usersGroupsOptions, groupsUsersOptions )
{
  var UserName = prefix + 'user';
  var GroupName = prefix + 'group';
  var UserGroupName = prefix + 'user_group';

  var User = Rekord({
    name: UserName,
    fields: ['id', 'name'],
    hasMany: {
      userGroups: {
        model: UserGroupName,
        foreign: 'user_id',
        clearKey: false
      }
    },
    hasManyThrough: {
      groups: Rekord.transfer( usersGroupsOptions || {}, {
        model: GroupName,
        through: UserGroupName,
        local: 'user_id',
        foreign: 'group_id'
      })
    }
  });

  var Group = Rekord({
    name: GroupName,
    fields: ['id', 'name'],
    hasMany: {
      userGroups: {
        model: UserGroupName,
        foreign: 'group_id',
        clearKey: false
      }
    },
    hasManyThrough: {
      users: Rekord.transfer( groupsUsersOptions || {}, {
        model: UserName,
        through: UserGroupName,
        local: 'group_id',
        foreign: 'user_id'
      })
    }
  });

  var UserGroup = Rekord({
    name: UserGroupName,
    key: ['user_id', 'group_id'],
    fields: ['user_id', 'group_id'],
    belongsTo: {
      group: {
        model: GroupName,
        local: 'group_id',
        clearKey: false
      },
      user: {
        model: UserName,
        local: 'user_id',
        clearKey: false
      }
    }
  });

  return {
    User: User,
    Group: Group,
    UserGroup: UserGroup
  };
}

function createUserGroups2( prefix, usersGroupsOptions, groupsUsersOptions )
{
  var UserName = prefix + 'user';
  var GroupName = prefix + 'group';
  var UserGroupName = prefix + 'user_group';

  var User = Rekord({
    name: UserName,
    fields: ['id', 'name'],
    hasManyThrough: {
      groups: Rekord.transfer( usersGroupsOptions || {}, {
        model: GroupName,
        through: UserGroupName,
        local: 'user_id',
        foreign: 'group_id'
      })
    }
  });

  var Group = Rekord({
    name: GroupName,
    fields: ['id', 'name'],
    hasManyThrough: {
      users: Rekord.transfer( groupsUsersOptions || {}, {
        model: UserName,
        through: UserGroupName,
        local: 'group_id',
        foreign: 'user_id'
      })
    }
  });

  var UserGroup = Rekord({
    name: UserGroupName,
    key: ['user_id', 'group_id'],
    fields: ['user_id', 'group_id']
  });

  return {
    User: User,
    Group: Group,
    UserGroup: UserGroup
  };
}

function seedUserGroups1( test )
{
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var u0 = User.create({name: 'u0', groups: [g0, g1]});

  var ug0 = g0.userGroups[0];
  var ug1 = g1.userGroups[0];

  strictEqual( g0.userGroups.length, 1 );
  strictEqual( ug0.user, u0 );
  strictEqual( ug0.group, g0 );
  strictEqual( g0.users.length, 1 );
  strictEqual( g0.users[0], u0 );

  strictEqual( g1.userGroups.length, 1 );
  strictEqual( ug1.user, u0 );
  strictEqual( ug1.group, g1 );
  strictEqual( g1.users.length, 1 );
  strictEqual( g1.users[0], u0 );

  strictEqual( u0.groups.length, 2 );
  strictEqual( u0.groups[0], g0 );
  strictEqual( u0.groups[1], g1 );
  strictEqual( u0.userGroups.length, 2 );
  strictEqual( u0.userGroups[0], ug0 );
  strictEqual( u0.userGroups[1], ug1 );

  test.g0 = g0;
  test.g1 = g1;
  test.u0 = u0;
  test.ug0 = ug0;
  test.ug1 = ug1;
}

function seedUserGroups2( test )
{
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var g2 = Group.create({name: 'g2'});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  var ug0 = UserGroup.get( [u0.id, g0.id] );
  var ug1 = UserGroup.get( [u0.id, g1.id] );
  var ug2 = UserGroup.get( [u0.id, g2.id] );

  strictEqual( g0.users.length, 1 );
  strictEqual( g0.users[0], u0 );

  strictEqual( g1.users.length, 1 );
  strictEqual( g1.users[0], u0 );

  strictEqual( g2.users.length, 1 );
  strictEqual( g2.users[0], u0 );

  strictEqual( u0.groups.length, 3 );
  strictEqual( u0.groups[0], g0 );
  strictEqual( u0.groups[1], g1 );
  strictEqual( u0.groups[2], g2 );

  test.g0 = g0;
  test.g1 = g1;
  test.g2 = g2;
  test.u0 = u0;
  test.ug0 = ug0;
  test.ug1 = ug1;
  test.ug2 = ug2;
}

test( 'model string', function(assert)
{
  var prefix = 'hasManyThrough_model_string_';

  var test = createUserGroups1( prefix );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  strictEqual( User.Database.relations.groups.model, Group );
  strictEqual( User.Database.relations.groups.through, UserGroup );
  strictEqual( User.Database.relations.userGroups.model, UserGroup );

  strictEqual( Group.Database.relations.users.model, User );
  strictEqual( Group.Database.relations.users.through, UserGroup );
  strictEqual( Group.Database.relations.userGroups.model, UserGroup );

  strictEqual( UserGroup.Database.relations.user.model, User );
  strictEqual( UserGroup.Database.relations.group.model, Group );
});

test( 'store none', function(assert)
{
  var prefix = 'hasManyThrough_store_none_';

  var options = {
    store: Rekord.Store.None
  };

  var test = createUserGroups1( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'store model', function(assert)
{
  var prefix = 'hasManyThrough_store_model_';

  var userOptions = {
    store: Rekord.Store.Model
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}, $status: 0,
    groups: [
      g0.$local,
      g1.$local
    ]
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'store key', function(assert)
{
  var prefix = 'hasManyThrough_store_key_';

  var userOptions = {
    store: Rekord.Store.Key
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}, $status: 0,
    groups: [ g0.id, g1.id ]
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'store keys', function(assert)
{
  var prefix = 'hasManyThrough_store_keys_';

  // maybe later

  notOk();
});

test( 'save none', function(assert)
{
  var prefix = 'hasManyThrough_save_none_';

  var userOptions = {
    save: Rekord.Save.None
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name}, $status: 0
  });
  deepEqual( remote.lastRecord, {
    id: u0.id, name: u0.name
  });
});

test( 'save model', function(assert)
{
  var prefix = 'hasManyThrough_save_model_';

  var userOptions = {
    save: Rekord.Save.Model
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name,
      groups: [ g0.$saved, g1.$saved ]
    }, $status: 0
  });
  deepEqual( remote.map.get( u0.id ), {
    id: u0.id, name: u0.name,
    groups: [ g0.$saved, g1.$saved ]
  });
});

test( 'save key', function(assert)
{
  var prefix = 'hasManyThrough_save_key_';

  var userOptions = {
    save: Rekord.Save.Key
  };

  var test = createUserGroups1( prefix, userOptions );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  var local = User.Database.store;
  var remote = User.Database.rest;

  deepEqual( local.lastRecord, {
    id: u0.id, name: u0.name,
    $saved: {id: u0.id, name: u0.name,
      groups: [ g0.id, g1.id ]
    }, $status: 0
  });
  deepEqual( remote.map.get( u0.id ), {
    id: u0.id, name: u0.name,
    groups: [ g0.id, g1.id ]
  });
});

test( 'property true', function(assert)
{
  var prefix = 'hasManyThrough_property_true_';

  var options = {
    property: true
  };

  var test = createUserGroups1( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  seedUserGroups1( test );
});

test( 'property false', function(assert)
{
  var prefix = 'hasManyThrough_property_false_';

  var options = {
    property: false
  };

  var test = createUserGroups1( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g1'});
  var u0 = User.create({name: 'u0', groups: [g0, g1]});

  var ug0 = g0.userGroups[0];
  var ug1 = g1.userGroups[0];

  strictEqual( g0.userGroups.length, 1 );
  strictEqual( ug0.user, u0 );
  strictEqual( ug0.group, g0 );
  strictEqual( g0.users, void 0 );

  strictEqual( g1.userGroups.length, 1 );
  strictEqual( ug1.user, u0 );
  strictEqual( ug1.group, g1 );
  strictEqual( g1.users, void 0 );

  strictEqual( u0.groups, void 0 );
  strictEqual( u0.userGroups.length, 2 );
  strictEqual( u0.userGroups[0], ug0 );
  strictEqual( u0.userGroups[1], ug1 );
});

test( 'dynamic true', function(assert)
{
  var prefix = 'hasManyThrough_dynamic_true_';

  var options = {
    property: true,
    dynamic: true
  };

  var test = createUserGroups1( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  User.Database.relations.groups.comparator = Rekord.createComparator( 'name' );

  seedUserGroups1( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = Group.create({name: 'g2'});
  var g3 = Group.create({name: 'g3'});
  var u0 = test.u0;

  deepEqual( u0.groups.toArray(), [g0, g1] );

  u0.groups = [g2, g3, g0];

  deepEqual( u0.groups.toArray(), [g0, g2, g3] );
});

test( 'comparator', function(assert)
{
  var prefix = 'hasManyThrough_comparator_';

  var options = {
    comparator: 'name'
  };

  var test = createUserGroups1( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'C'});
  var g1 = Group.create({name: 'A'});
  var g2 = Group.create({name: 'B'});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  var expected = [g1, g2, g0];

  deepEqual( u0.groups.toArray(), expected );
});

test( 'comparatorNullsFirst', function(assert)
{
  var prefix = 'hasManyThrough_comparatorNullsFirst_';

  var options = {
    comparator: 'name',
    comparatorNullsFirst: true
  };

  var test = createUserGroups1( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var g0 = Group.create({name: 'C'});
  var g1 = Group.create({name: 'A'});
  var g2 = Group.create({name: null});
  var u0 = User.create({name: 'u0', groups: [g0, g1, g2]});

  var expected = [g2, g1, g0];

  deepEqual( u0.groups.toArray(), expected );
});

test( 'cascadeRemove none', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_none_';

  var options = {
    cascadeRemove: Rekord.Cascade.None
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug0, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug0.$key()}, 'live' );
  strictEqual( local.lastKey, ug0.$key(), 'local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug1, 'no rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug1.$key()}, 'live' );
  strictEqual( local.lastKey, ug1.$key(), 'local' );
});

test( 'cascadeRemove local', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_local_';

  var options = {
    cascadeRemove: Rekord.Cascade.Local
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, ug0.$key(), 'local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, ug1.$key(), 'local' );
});

test( 'cascadeRemove rest', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_rest_';

  var options = {
    cascadeRemove: Rekord.Cascade.Rest
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug0, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug1, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );
});

test( 'cascadeRemove nolive', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_nolive_';

  var options = {
    cascadeRemove: Rekord.Cascade.NoLive
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug0, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, ug0.$key(), 'local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug1, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, ug1.$key(), 'local' );
});

test( 'cascadeRemove live', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_live_';

  var options = {
    cascadeRemove: Rekord.Cascade.Live
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage.key, ug0.$key(), 'live' );
  strictEqual( local.lastKey, null, 'no local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage.key, ug1.$key(), 'no live' );
  strictEqual( local.lastKey, null, 'no local' );
});

test( 'cascadeRemove norest', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_norest_';

  var options = {
    cascadeRemove: Rekord.Cascade.NoRest
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage.key, ug0.$key(), 'live' );
  strictEqual( local.lastKey, ug0.$key(), 'local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage.key, ug1.$key(), 'live' );
  strictEqual( local.lastKey, ug1.$key(), 'local' );
});

test( 'cascadeRemove remote', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_remote_';

  var options = {
    cascadeRemove: Rekord.Cascade.Remote
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug0, 'rest' );
  strictEqual( live.lastMessage.key, ug0.$key(), 'live' );
  strictEqual( local.lastKey, null, 'no local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug1, 'rest' );
  strictEqual( live.lastMessage.key, ug1.$key(), 'live' );
  strictEqual( local.lastKey, null , 'no local' );
});

test( 'cascadeRemove all', function(assert)
{
  var prefix = 'hasManyThrough_cascadeRemove_all_';

  var options = {
    cascadeRemove: Rekord.Cascade.All
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var local = db.store;
  var live = db.live;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var g2 = test.g2;
  var u0 = test.u0;
  var ug0 = test.ug0;
  var ug1 = test.ug1;
  var ug2 = test.ug2;

  ok( ug0.$exists() );
  ok( ug1.$exists() );
  ok( ug2.$exists() );
  deepEqual( u0.groups.toArray(), [g0, g1, g2] );

  // onRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  g0.$remove();

  deepEqual( u0.groups.toArray(), [g2, g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  notOk( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug0, 'rest' );
  strictEqual( live.lastMessage.key, ug0.$key(), 'live' );
  strictEqual( local.lastKey, ug0.$key(), 'local' );

  // onThroughRemoved

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  ug2.$remove();

  deepEqual( u0.groups.toArray(), [g1] );
  ok( ug0.$isDeleted() );
  notOk( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug2, 'rest' );
  deepEqual( live.lastMessage, {op: 'REMOVE', key: ug2.$key()}, 'live' );
  strictEqual( local.lastKey, ug2.$key(), 'local' );

  // preRemove

  rest.lastModel = null;
  local.lastKey = null;
  live.lastMessage = null;

  u0.$remove();

  ok( u0.$isDeleted() );
  deepEqual( u0.groups.toArray(), [] );
  ok( ug0.$isDeleted() );
  ok( ug1.$isDeleted() );
  ok( ug2.$isDeleted() );

  strictEqual( rest.lastModel, ug1, 'rest' );
  strictEqual( live.lastMessage.key, ug1.$key(), 'live' );
  strictEqual( local.lastKey, ug1.$key() , 'local' );
});

test( 'cascadeSave local', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_local_';

  var options = {
    cascadeSave: Rekord.Cascade.Local
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  notOk( ug3.$isSaved(), 'not saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, ug3.$key(), 'local' );
});

test( 'cascadeSave rest', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_rest_';

  var options = {
    cascadeSave: Rekord.Cascade.Rest
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  ok( ug3.$isSaved(), 'saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, ug3, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );
});

test( 'cascadeSave nolive', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_nolive_';

  var options = {
    cascadeSave: Rekord.Cascade.NoLive
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  ok( ug3.$isSaved(), 'saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, ug3, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, ug3.$key(), 'local' );
});

test( 'cascadeSave live', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_live_';

  var options = {
    cascadeSave: Rekord.Cascade.Live
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  notOk( ug3.$isSaved(), 'saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage.key, ug3.$key(), 'live' );
  strictEqual( local.lastKey, null, 'no local' );
});

test( 'cascadeSave norest', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_norest_';

  var options = {
    cascadeSave: Rekord.Cascade.NoRest
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  notOk( ug3.$isSaved(), 'saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage.key, ug3.$key(), 'live' );
  strictEqual( local.lastKey, ug3.$key(), 'local' );
});

test( 'cascadeSave remote', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_remote_';

  var options = {
    cascadeSave: Rekord.Cascade.Remote
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  ok( ug3.$isSaved(), 'saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, ug3, 'rest' );
  strictEqual( live.lastMessage.key, ug3.$key(), 'live' );
  strictEqual( local.lastKey, null, 'no local' );
});

test( 'cascadeSave all', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSave_all_';

  var options = {
    cascadeSave: Rekord.Cascade.All
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = UserGroup.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var u0 = test.u0;
  var g3 = Group.create({name: 'g3'});

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  strictEqual( u0.groups.length, 3, '3 groups' );

  u0.groups.relate( g3 );

  var ug3 = UserGroup.get( [u0.id, g3.id] );

  ok( ug3, 'has been created' );
  ok( ug3.$isSaved(), 'saved' );
  strictEqual( u0.groups.length, 4, '4 groups' );

  strictEqual( rest.lastModel, ug3, 'rest' );
  strictEqual( live.lastMessage.key, ug3.$key(), 'live' );
  strictEqual( local.lastKey, ug3.$key(), 'local' );
});

test( 'cascadeSaveRelated none', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_none_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.None
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );

  strictEqual( g0.$saved.name, 'g0' );

  g0.$save();

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'cascadeSaveRelated local', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_local_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.Local
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, null, 'no rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, g0.id, 'local' );

  strictEqual( g0.$saved.name, 'g0' );

  g0.$save();

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'cascadeSaveRelated rest', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_rest_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.Rest
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, g0, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, null, 'no local' );

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'cascadeSaveRelated nolive', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_nolive_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.NoLive
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, g0, 'rest' );
  strictEqual( live.lastMessage, null, 'no live' );
  strictEqual( local.lastKey, g0.id, 'local' );

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'cascadeSaveRelated live', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_live_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.Live
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, null, 'rest' );
  strictEqual( live.lastMessage.key, g0.id, 'live' );
  strictEqual( local.lastKey, null, 'no local' );

  strictEqual( g0.$saved.name, 'g0' );
});

test( 'cascadeSaveRelated norest', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_norest_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.NoRest
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, null, 'rest' );
  strictEqual( live.lastMessage.key, g0.id, 'live' );
  strictEqual( local.lastKey, g0.id, 'local' );

  strictEqual( g0.$saved.name, 'g0' );
});

test( 'cascadeSaveRelated remote', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_remote_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.Remote
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, g0, 'rest' );
  strictEqual( live.lastMessage.key, g0.id, 'live' );
  strictEqual( local.lastKey, null, 'no local' );

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'cascadeSaveRelated all', function(assert)
{
  var prefix = 'hasManyThrough_cascadeSaveRelated_all_';

  var options = {
    cascadeSaveRelated: Rekord.Cascade.All
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var db = Group.Database;
  var rest = db.rest;
  var live = db.live;
  var local = db.store;

  seedUserGroups2( test );

  var g0 = test.g0;
  var g1 = test.g1;
  var u0 = test.u0;

  strictEqual( g0.$saved.name, 'g0' );

  rest.lastModel = null;
  live.lastMessage = null;
  local.lastKey = null;

  g0.name = 'g0a';

  u0.$save();

  strictEqual( rest.lastModel, g0, 'rest' );
  strictEqual( live.lastMessage.key, g0.id, 'live' );
  strictEqual( local.lastKey, g0.id, 'local' );

  strictEqual( g0.$saved.name, 'g0a' );
});

test( 'lazy true', function(assert)
{
  var prefix = 'hasManyThrough_lazy_true_';

  var options = {
    lazy: true
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var u0 = User.create({name: 'u0'});
  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g0'});
  var ug0 = UserGroup.create({user_id: u0.id, group_id: g0.id});
  var ug1 = UserGroup.create({user_id: u0.id, group_id: g1.id});

  strictEqual( u0.groups, void 0 );
  strictEqual( u0.$relations.groups, void 0 );

  isInstance( u0.$get('groups'), Rekord.ModelCollection );
  deepEqual( u0.groups.toArray(), [g0, g1] );
  notStrictEqual( u0.$relations.groups, void 0 );
});

test( 'lazy false', function(assert)
{
  var prefix = 'hasManyThrough_lazy_false_';

  var options = {
    lazy: false
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var u0 = User.create({name: 'u0'});
  var g0 = Group.create({name: 'g0'});
  var g1 = Group.create({name: 'g0'});
  var ug0 = UserGroup.create({user_id: u0.id, group_id: g0.id});
  var ug1 = UserGroup.create({user_id: u0.id, group_id: g1.id});

  isInstance( u0.$get('groups'), Rekord.ModelCollection );
  deepEqual( u0.groups.toArray(), [g0, g1] );
  notStrictEqual( u0.$relations.groups, void 0 );
});

test( 'query', function(assert)
{
  var prefix = 'hasManyThrough_query_';

  var options = {
    query: '/groups/{id}'
  };

  var test = createUserGroups2( prefix, options, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var rest = Group.Database.rest;

  rest.queries.put( '/groups/29', [
    {id: 4, name: 'g0'},
    {id: 5, name: 'g1'}
  ]);

  var u0 = User.create({id: 29, name: 'u0'});

  var ug0 = UserGroup.get( [u0.id, 4] );
  var ug1 = UserGroup.get( [u0.id, 5] );

  notStrictEqual( u0.groups, void 0 );
  strictEqual( u0.groups.length, 2 );
  strictEqual( u0.groups[0].name, 'g0' );
  strictEqual( u0.groups[1].name, 'g1' );
  notStrictEqual( ug0, void 0 );
  notStrictEqual( ug1, void 0 );

  isInstance( u0.$relations.groups.query, Rekord.Search, 'query exists' );
});

test( 'where', function(assert)
{
  var prefix = 'hasManyThrough_where_';

  var options = {
    where: function(grp) {
      return grp.name.length === 3;
    }
  };

  var test = createUserGroups2( prefix, options );
  var User = test.User;
  var Group = test.Group;
  var UserGroup = test.UserGroup;

  var u0 = User.create({name: 'u0'});
  var g0 = Group.create({name: '0'});
  var g1 = Group.create({name: '123'});
  var g2 = Group.create({name: '4567'});
  var g3 = Group.create({name: '890'});

  u0.groups.relate([g0, g1, g2, g3]);

  strictEqual( u0.groups.length, 2 );
  deepEqual( u0.groups.toArray(), [g1, g3] );
});
