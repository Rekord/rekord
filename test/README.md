# Coverage

### Neuro functions

- [x] get
- [x] uuid
- [x] indexOf
- [x] propsMatch
- [x] extend
- [x] transfer
- [x] swap
- [x] grab
- [x] pull
- [x] copy
- [x] diff
- [x] sizeof
- [x] isEmpty
- [x] compare
- [x] equals
- [x] equalsStrict
- [x] createComparator

### Neuro options

- [x] key
- [x] keySeparator
- [x] fields
- [x] defaults
- [x] name
- [x] className
- [x] comparator
- [x] comparatorNullsFirst
- [x] revision
- [ ] loadRelations
- [x] loadRemote
- [x] autoRefresh
- [x] cache
- [x] cachePending
- [x] fullSave
- [x] fullPublish
- [ ] relations
- [x] toString
- [x] encode/decode

### Neuro instance functions

- [x] all
- [x] create

### Neuro.Database instance functions

- [x] parseModel
- [x] removeKey
- [x] buildKey
- [x] buildKeys
- [x] buildKeyFromInput
- [x] buildKeyFromArray
- [x] hasFields
- [x] setRevision
- [x] sort
- [x] setComparator
- [x] refresh
- [x] getModel

### Neuro.Model instance functions

- [x] *constructor*
- [x] $reset
- [x] $set (object, property, relation)
- [x] $get (array, object, property, relation)
- [x] $relate
- [x] $unrelate
- [x] $isRelated
- [x] $getRelation
- [x] $save
- [x] $remove
- [x] $exists
- [x] $key
- [x] $keys
- [x] $isSaved
- [x] $isSavedLocally
- [x] $getChanges
- [x] $hasChanges

### Neuro.Model save cases

- [x] save while deleted
- [x] save with cache:false should go right to remote
- [x] save without changes
- [x] save while remotely removed (404/410)
- [x] save with unexpected status code
- [x] save while offline, resume save online
- [x] save, then delete, then save finishes
- [x] save, rest returns updated fields
- [x] save remote first time, check $saved
- [x] save remote and cachePending should remove locally

### Neuro.Model remove cases

- [x] delete while in the middle of save
- [x] delete with cache:false should go right to remote
- [x] delete local when it hasn't been saved locally
- [x] delete when it hasn't been saved remotely
- [x] delete while remotely removed (404/410)
- [x] delete with unexpected status code shouldn't remove from local storage
- [x] delete while offline, resume delete online

### Neuro live

- [x] live saving
- [x] live removing

### Neuro hasOne options

- [x] model
- [x] store
- [x] save
- [x] auto
- [x] property
- [x] local
- [x] cascade

### Neuro hasOne

- [x] no initial value
- [x] initial value
- [x] initial foreign key
- [x] ninja remove
- [x] ninja save
- [x] set
- [x] relate
- [x] unrelate
- [x] isRelated
- [x] get
- [x] encode
- [x] cascade remove
- [x] more than one hasOne relationship

### Neuro belongsTo options

- [x] model
- [x] store
- [x] save
- [x] auto
- [x] property
- [x] local
- [x] cascade

### Neuro belongsTo

- [x] no initial value
- [x] initial value
- [x] ninja remove
- [x] ninja save
- [x] set
- [x] relate
- [x] unrelate
- [x] isRelated
- [x] get
- [x] encode
- [x] post remove

### Neuro hasMany options

- [x] model
- [x] store
- [x] save
- [x] auto
- [x] property
- [x] foreign
- [x] comparator
- [x] comparatorNullsFirst
- [x] cascadeRemove
- [x] cascadeSave

### Neuro hasMany

- [x] no initial value
- [x] initial value
- [x] ninja remove
- [x] ninja save
- [x] ninja add
- [x] set
- [x] relate
- [x] unrelate
- [x] isRelated
- [x] get
- [x] encode
- [x] auto save parent

### Neuro hasManyThrough options

- [x] model
- [x] store
- [x] save
- [x] property
- [x] through
- [x] foreign
- [x] local
- [x] comparator
- [x] comparatorNullsFirst
- [x] cascadeRemove
- [x] cascadeSave

### Neuro hasManyThrough

- [x] no initial value
- [x] initial value
- [x] ninja remove
- [x] ninja save add
- [x] set
- [x] relate
- [x] unrelate
- [x] isRelated
- [x] get
- [x] encode
- [x] auto save parent
- [x] ninja through remove

