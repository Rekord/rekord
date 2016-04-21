
A hasOne relationship is a one-to-one relationship where the parent model **owns** the related model. When saving the related model is saved first - since the parent model has fields which map to the key of the related model. When removing the related model is removed along with the parent model (by default).

Defaults can be overridden by changing `Rekord.HasOne.Defaults`

```javascript
var ModelClass = Rekord({

  // The fields option must contain all local keys referenced in hasOne definitions.
  fields: ['related_id'],

  // (object) which contains hasOne definitions
  hasOne: {

    // (object) the name of the hasOne definition. By default (property=true)
    // this property is added to the model.
    related: {

      // (string|Model) The name, className, or reference to a Rekord instance that
      // this model is related to. This is required for non-polymorphic relationships
      // and is ignored for polymorphic relationships.
      model: 'RelatedClass',

      // (boolean) Whether or not this relationship is lazily initialized.
      lazy: true, // default: false

      // (any)
      query: '/api/1.0/related/{related_id}',

      // (Rekord.Store)
      store: Rekord.Store.None,

      // (Rekord.Save)
      save: Rekord.Save.None,

      // (boolean)
      auto: true,

      // (boolean)
      property: true,

      // (boolean)
      dynamic: true,

      // (string,string[])
      local: 'related_id',

      // (Rekord.Cascade)
      cascade: Rekord.Cascade.All,

      // (string)
      discriminator: 'related_type',

      // (object)
      discriminators: {
        'RelationClass1': 1,
        'RelationClass2': 2
      }

    }

  }
});
```
