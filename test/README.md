# Coverage

### Neuro functions

- [ ] get
- [ ] indexOf
- [ ] extend
- [ ] transfer
- [ ] swap
- [ ] grab
- [ ] pull
- [ ] copy
- [ ] diff
- [ ] isEmpty
- [ ] compare
- [ ] equals
- [ ] equalsStrict
- [ ] createComparator

### Neuro options

- [ ] key
- [ ] keySeparator
- [ ] fields
- [ ] defaults
- [ ] name
- [ ] className
- [ ] comparator
- [ ] comparatorNullsFirst
- [ ] revision
- [ ] loadRelations
- [ ] loadRemote
- [ ] autoRefresh
- [ ] cache
- [ ] cachePending
- [ ] fullSave
- [ ] fullPublish
- [ ] relations
- [ ] toString
- [ ] encode/decode

### Neuro instance functions

- [ ] all
- [ ] create

### Neuro.Database instance functions

- [ ] parseModel
- [ ] removeKey
- [ ] buildKey
- [ ] buildKeys
- [ ] buildKeyFromInput
- [ ] buildKeyFromArray
- [ ] hasFields
- [ ] setRevision
- [ ] sort
- [ ] setComparator
- [ ] refresh
- [ ] getModel

### Neuro.Model instance functions

- [ ] *constructor*
- [ ] $reset
- [ ] $set (object, property, relation)
- [ ] $get (array, object, property, relation)
- [ ] $relate
- [ ] $unrelate
- [ ] $isRelated
- [ ] $getRelation
- [ ] $save
- [ ] $remove
- [ ] $exists
- [ ] $key
- [ ] $keys
- [ ] $isSaved
- [ ] $isSavedLocally
- [ ] $getChanges
- [ ] $hasChanges

### Neuro.Model save cases

- [ ] save while deleted
- [ ] save with cache:false should go right to remote
- [ ] save without changes
- [ ] save while remotely removed (404/410)
- [ ] save with unexpected status code
- [ ] save while offline, resume save online
- [ ] save, then delete, then save finishes
- [ ] save, rest returns updated fields
- [ ] save remote first time, check $saved
- [ ] save remote and cachePending should remove locally

### Neuro.Model remove cases

- [ ] delete while in the middle of save
- [ ] delete with cache:false should go right to remote
- [ ] delete local when it hasn't been saved locally
- [ ] delete when it hasn't been saved remotely
- [ ] delete while remotely removed (404/410)
- [ ] delete with unexpected status code shouldn't remove from local storage
- [ ] delete while offline, resume delete online

### Neuro live

- [ ] live saving
- [ ] live removing

### Neuro hasOne options

- [ ] model
- [ ] store
- [ ] save
- [ ] auto
- [ ] property
- [ ] local

### Neuro hasOne

- [ ] no initial value
- [ ] initial value
- [ ] ninja remove
- [ ] ninja save
- [ ] set
- [ ] relate
- [ ] unrelate
- [ ] isRelated
- [ ] get
- [ ] encode
- [ ] cascade save
- [ ] cascade remove

### Neuro belongsTo options

- [ ] model
- [ ] store
- [ ] save
- [ ] auto
- [ ] property
- [ ] local

### Neuro belongsTo

- [ ] no initial value
- [ ] initial value
- [ ] ninja remove
- [ ] ninja save
- [ ] set
- [ ] relate
- [ ] unrelate
- [ ] isRelated
- [ ] get
- [ ] encode
- [ ] post remove

### Neuro hasMany options

- [ ] model
- [ ] store
- [ ] save
- [ ] auto
- [ ] property
- [ ] foreign
- [ ] comparator
- [ ] comparatorNullsFirst
- [ ] cascadeRemove
- [ ] cascadeSave

### Neuro hasMany

- [ ] no initial value
- [ ] initial value
- [ ] ninja remove
- [ ] ninja save
- [ ] ninja add
- [ ] set
- [ ] relate
- [ ] unrelate
- [ ] isRelated
- [ ] get
- [ ] encode
- [ ] post remove
- [ ] auto save parent

### Neuro hasManyThrough options

- [ ] model
- [ ] store
- [ ] save
- [ ] auto
- [ ] property
- [ ] through
- [ ] foreign
- [ ] local
- [ ] comparator
- [ ] comparatorNullsFirst
- [ ] cascadeRemove
- [ ] cascadeSave

### Neuro hasManyThrough

- [ ] no initial value
- [ ] initial value
- [ ] ninja remove
- [ ] ninja save
- [ ] set
- [ ] relate
- [ ] unrelate
- [ ] isRelated
- [ ] get
- [ ] encode
- [ ] pre remove
- [ ] post save
- [ ] auto save parent
- [ ] ninja through remove
- [ ] ninja through add

