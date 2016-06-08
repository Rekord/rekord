
Rekord.debug = function(event, source)  /*, data.. */
{
  // up to the user
};

/**
 * Sets the debug implementation provided the factory function. This function
 * can only be called once - all subsequent calls will be ignored unless
 * `overwrite` is given as a truthy value.
 *
 * @memberof Rekord
 * @param {Function} factory -
 *    The factory which provides debug implementations.
 * @param {Boolean} [overwrite=false] -
 *    True if existing implementations are to be ignored and the given factory
 *    should be the implementation.
 */
Rekord.setDebug = function(factory, overwrite)
{
  if ( !Rekord.debugSet || overwrite )
  {
    Rekord.debug = factory;
    Rekord.debugSet = true;
  }
};

Rekord.Debugs = {

  CREATION: 0,                // options

  REST: 1,                    // options
  AUTO_REFRESH: 73,           //

  MISSING_KEY: 33,            // encoded

  REMOTE_UPDATE: 2,           // encoded, Model
  REMOTE_CREATE: 3,           // encoded, Model
  REMOTE_REMOVE: 4,           // Model
  REMOTE_LOAD: 5,             // encoded[]
  REMOTE_LOAD_OFFLINE: 6,     //
  REMOTE_LOAD_ERROR: 7,       // status
  REMOTE_LOAD_REMOVE: 8,      // key
  REMOTE_LOAD_RESUME: 22,     //

  LOCAL_LOAD: 9,              // encoded[]
  LOCAL_RESUME_DELETE: 10,    // Model
  LOCAL_RESUME_SAVE: 11,      // Model
  LOCAL_LOAD_SAVED: 12,       // Model

  REALTIME_SAVE: 13,          // encoded, key
  REALTIME_REMOVE: 14,        // key

  SAVE_VALUES: 15,            // encoded, Model
  SAVE_PUBLISH: 16,           // encoded, Model
  SAVE_CONFLICT: 17,          // encoded, Model
  SAVE_UPDATE_FAIL: 18,       // Model
  SAVE_ERROR: 19,             // Model, status
  SAVE_OFFLINE: 20,           // Model
  SAVE_RESUME: 21,            // Model
  SAVE_REMOTE: 25,            // Model
  SAVE_DELETED: 40,           // Model

  SAVE_OLD_REVISION: 48,      // Model, encoded

  SAVE_LOCAL: 23,             // Model
  SAVE_LOCAL_ERROR: 24,       // Model, error
  SAVE_LOCAL_DELETED: 38,     // Model
  SAVE_LOCAL_BLOCKED: 39,     // Model

  SAVE_REMOTE_DELETED: 41,    // Model, [encoded]
  SAVE_REMOTE_BLOCKED: 42,    // Model

  REMOVE_PUBLISH: 26,         // key, Model
  REMOVE_LOCAL: 27,           // key, Model
  REMOVE_MISSING: 28,         // key, Model
  REMOVE_ERROR: 29,           // status, key, Model
  REMOVE_OFFLINE: 30,         // Model
  REMOVE_RESUME: 31,          // Model
  REMOVE_REMOTE: 32,          // Model
  REMOVE_CANCEL_SAVE: 47,     // Model

  REMOVE_LOCAL_ERROR: 34,     // Model, error
  REMOVE_LOCAL_BLOCKED: 44,   // Model
  REMOVE_LOCAL_NONE: 45,      // Model
  REMOVE_LOCAL_UNSAVED: 46,   // Model

  REMOVE_REMOTE_BLOCKED: 43,  // Model

  GET_LOCAL_SKIPPED: 104,     // Model
  GET_LOCAL: 105,             // Model, encoded
  GET_LOCAL_ERROR: 106,       // Model, e
  GET_REMOTE: 107,            // Model, data
  GET_REMOTE_ERROR: 108,      // Model, data, status

  ONLINE: 35,                 //
  OFFLINE: 36,                //

  PUBSUB_CREATED: 37,         // PubSub

  HASONE_INIT: 53,            // HasOne
  HASONE_NINJA_REMOVE: 49,    // Model, relation
  HASONE_INITIAL_PULLED: 51,  // Model, initial
  HASONE_INITIAL: 52,         // Model, initial
  HASONE_CLEAR_MODEL: 54,     // relation
  HASONE_SET_MODEL: 55,       // relation
  HASONE_PRESAVE: 56,         // Model, relation
  HASONE_POSTREMOVE: 57,      // Model, relation
  HASONE_CLEAR_KEY: 58,       // Model, local
  HASONE_UPDATE_KEY: 59,      // Model, local, Model, foreign
  HASONE_LOADED: 60,          // Model, relation, [Model]
  HASONE_QUERY: 111,          // Model, RemoteQuery, queryOption, query
  HASONE_QUERY_RESULTS: 112,  // Model, RemoteQuery

  BELONGSTO_INIT: 61,          // HasOne
  BELONGSTO_NINJA_REMOVE: 62,  // Model, relation
  BELONGSTO_NINJA_SAVE: 63,    // Model, relation
  BELONGSTO_INITIAL_PULLED: 64,// Model, initial
  BELONGSTO_INITIAL: 65,       // Model, initial
  BELONGSTO_CLEAR_MODEL: 66,   // relation
  BELONGSTO_SET_MODEL: 67,     // relation
  BELONGSTO_POSTREMOVE: 69,    // Model, relation
  BELONGSTO_CLEAR_KEY: 70,     // Model, local
  BELONGSTO_UPDATE_KEY: 71,    // Model, local, Model, foreign
  BELONGSTO_LOADED: 72,        // Model, relation, [Model]
  BELONGSTO_QUERY: 113,        // Model, RemoteQuery, queryOption, query
  BELONGSTO_QUERY_RESULTS: 114,// Model, RemoteQuery

  HASMANY_INIT: 74,             // HasMany
  HASMANY_NINJA_REMOVE: 75,     // Model, Model, relation
  HASMANY_NINJA_SAVE: 76,       // Model, Model, relation
  HASMANY_INITIAL: 77,          // Model, relation, initial
  HASMANY_INITIAL_PULLED: 78,   // Model, relation
  HASMANY_REMOVE: 79,           // relation, Model
  HASMANY_SORT: 80,             // relation
  HASMANY_ADD: 81,              // relation, Model
  HASMANY_LAZY_LOAD: 82,        // relation, Model[]
  HASMANY_INITIAL_GRABBED: 83,  // relation, Model
  HASMANY_NINJA_ADD: 84,        // relation, Model
  HASMANY_AUTO_SAVE: 85,        // relation
  HASMANY_PREREMOVE: 86,        // Model, relation
  HASMANY_POSTSAVE: 87,         // Model, relation
  HASMANY_QUERY: 115,           // Model, RemoteQuery, queryOption, query
  HASMANY_QUERY_RESULTS: 116,   // Model, RemoteQuery

  HASMANYTHRU_INIT: 88,             // HasMany
  HASMANYTHRU_NINJA_REMOVE: 89,     // Model, Model, relation
  HASMANYTHRU_NINJA_SAVE: 90,       // Model, Model, relation
  HASMANYTHRU_NINJA_THRU_REMOVE: 91,// Model, Model, relation
  HASMANYTHRU_INITIAL: 92,          // Model, relation, initial
  HASMANYTHRU_INITIAL_PULLED: 93,   // Model, relation
  HASMANYTHRU_REMOVE: 94,           // relation, Model
  HASMANYTHRU_SORT: 95,             // relation
  HASMANYTHRU_ADD: 96,              // relation, Model
  HASMANYTHRU_LAZY_LOAD: 97,        // relation, Model[]
  HASMANYTHRU_INITIAL_GRABBED: 98,  // relation, Model
  HASMANYTHRU_NINJA_ADD: 99,        // relation, Model
  HASMANYTHRU_AUTO_SAVE: 100,       // relation
  HASMANYTHRU_PREREMOVE: 101,       // Model, relation
  HASMANYTHRU_POSTSAVE: 102,        // Model, relation
  HASMANYTHRU_THRU_ADD: 103,        // relation, Model
  HASMANYTHRU_THRU_REMOVE: 68,      // relation, Model, Model
  HASMANYTHRU_QUERY: 117,           // Model, RemoteQuery, queryOption, query
  HASMANYTHRU_QUERY_RESULTS: 118,   // Model, RemoteQuery

  HASREMOTE_INIT: 50,               // HasRemote
  HASREMOTE_SORT: 121,              // relation
  HASREMOTE_NINJA_REMOVE: 109,      // Model, Model, relation
  HASREMOTE_NINJA_SAVE: 110,        // Model, Model, relation
  HASREMOTE_QUERY: 119,             // Model, RemoteQuery, queryOption, query
  HASREMOTE_QUERY_RESULTS: 120,     // Model, RemoteQuery

  HASLIST_INIT: 122,                // HasList
  HASLIST_SORT: 123,                // relation
  HASLIST_NINJA_REMOVE: 124,        // Model, Model, relation
  HASLIST_NINJA_SAVE: 125,          // Model, Model, relation
  HASLIST_REMOVE: 126,              // HasList, relation, Model
  HASLIST_ADD: 127,                 // HasList, relation, Model
  HASLIST_INITIAL: 128              // HasList, Model, relation, initial
};
