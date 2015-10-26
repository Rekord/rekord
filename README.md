Tasks
- [X] When we receive a REMOVE operation and the model has unsaved data - don't remove it but clear it as being saved so it will be "inserted" again
- [X] Add Neuro.Events which we pass an event, the model, and the key to Neuro.debug
- [X] Add status method to NeuroModel
- [X] If an unsaved model is deleted - remove pending save/delete
- [X] If a model has a pending save (because offline) - don't run saveRemote again
- [ ] Add defaults to Neuro options
- [ ] Add feature to pubsub to queue publishes to a channel for a token - and when that token reconnects send those messages.
- [ ] Add relations to input for many-to-one, one-to-one, one-to-many, and many-to-many. A property stores an id or a reference to an object - or an array of ids or array of references.
  - [ ] One-to-One: (this model owns another)  
    ```javascript
      { 
        type: Neuro.ONE_TO_ONE,
        name: 'relation_name',
        model: ModelObject,
        local: 'local_field',
        store: Neuro.STORE_KEY | Neuro.STORE_MODEL | Neuro.STORE_NONE,
        cascade: true | false
      }
    ```
  - [ ] Many-to-One: (this model belongs to another)  
    ```javascript
      {
        type: Neuro.MANY_TO_ONE,
        name: 'relation_name',
        model: ModelObject, 
        local: 'local_field',
        store: Neuro.STORE_KEY | Neuro.STORE_MODEL | Neuro.STORE_NONE
      }
    ```
  - [ ] One-to-Many: (opposite of Many-to-One, this model owns others)  
    ```javascript
      {
        type: Neuro.ONE_TO_MANY,
        name: 'relation_name',
        model: ModelObject,
        foreign: 'foreign_field',
        store: Neuro.STORE_KEY | Neuro.STORE_MODEL | Neuro.STORE_NONE
      }
    ```
  - [ ] Many-to-Many: (has many through a relationship)  
    ```javascript
      {
        type: Neuro.MANY_TO_MANY,
        name: 'relation_name',
        model: ModelObject,
        relation: RelationObject,
        foreign: 'foreign_field',
        related: 'field_on_relation_pointing_to_model',
        store: Neuro.STORE_KEY | Neuro.STORE_MODEL | Neuro.STORE_NONE
      }
    ```

  ```javascript
    relations: {
      hasOne: { relation_name: { ... }, },
      belongsTo: { relation_name: { ... }, },
      hasMany: { relation_name: { ... }, }
      hasManyThrough: { relation_name: { ... }, }
    }
  ```

- [ ] Enable key option to be an array of fields and add an option keySeparator which joins column values together to form a key
- [ ] Add ability to use composite keys for relations
- [ ] Add ability to prioritize models so if we run out of local space we can remove the lower priority objects to free up space