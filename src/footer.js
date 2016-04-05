
  /* Top-Level Function */
  global.Neuro = Neuro;

  /* Classes */
  global.Neuro.Model = Model;
  global.Neuro.Database = Database;
  global.Neuro.Relation = Relation;
  global.Neuro.Operation = Operation;
  global.Neuro.Transaction = Transaction;
  global.Neuro.Search = Search;
  global.Neuro.SearchPaged = SearchPaged;

  /* Collections */
  global.Neuro.Map = Map;
  global.Neuro.Collection = Collection;
  global.Neuro.FilteredCollection = FilteredCollection;
  global.Neuro.ModelCollection = ModelCollection;
  global.Neuro.Query = Query;
  global.Neuro.RemoteQuery = RemoteQuery;
  global.Neuro.Page = Page;

  /* Relationships */
  global.Neuro.HasOne = HasOne;
  global.Neuro.BelongsTo = BelongsTo;
  global.Neuro.HasMany = HasMany;
  global.Neuro.HasManyThrough = HasManyThrough;
  global.Neuro.HasRemote = HasRemote;

  /* Utility Functions */
  global.Neuro.isNeuro = isNeuro;
  global.Neuro.isDefined = isDefined;
  global.Neuro.isFunction = isFunction;
  global.Neuro.isString = isString;
  global.Neuro.isNumber = isNumber;
  global.Neuro.isBoolean = isBoolean;
  global.Neuro.isDate = isDate;
  global.Neuro.isRegExp = isRegExp;
  global.Neuro.isArray = isArray;
  global.Neuro.isObject = isObject;
  global.Neuro.isValue = isValue;

  global.Neuro.uuid = uuid;
  global.Neuro.indexOf = indexOf;
  global.Neuro.propsMatch = propsMatch;
  global.Neuro.hasFields = hasFields;
  global.Neuro.toArray = toArray;

  global.Neuro.eventize = eventize;

  global.Neuro.extend = extend;
  global.Neuro.extendArray = extendArray;
  global.Neuro.copyConstructor = copyConstructor;
  global.Neuro.factory = factory;

  global.Neuro.transfer = transfer;
  global.Neuro.collapse = collapse;
  global.Neuro.swap = swap;
  global.Neuro.grab = grab;
  global.Neuro.pull = pull;
  global.Neuro.copy = copy;
  global.Neuro.noop = noop;
  global.Neuro.bind = bind;
  global.Neuro.diff = diff;
  global.Neuro.sizeof = sizeof;
  global.Neuro.isEmpty = isEmpty;
  global.Neuro.collect = collect;
  global.Neuro.applyOptions = applyOptions;
  global.Neuro.toCamelCase = toCamelCase;
  global.Neuro.evaluate = evaluate;

  global.Neuro.clean = clean;
  global.Neuro.cleanFunctions = cleanFunctions;

  global.Neuro.compare = compare;
  global.Neuro.equals = equals;
  global.Neuro.equalsStrict = equalsStrict;
  global.Neuro.equalsCompare = equalsCompare;

  global.Neuro.isSorted = isSorted;
  global.Neuro.saveComparator = saveComparator;
  global.Neuro.createComparator = createComparator;
  global.Neuro.addComparator = addComparator;

  global.Neuro.saveWhere = saveWhere;
  global.Neuro.createWhere = createWhere;

  global.Neuro.savePropertyResolver = savePropertyResolver;
  global.Neuro.createPropertyResolver = createPropertyResolver;

  global.Neuro.saveNumberResolver = saveNumberResolver;
  global.Neuro.createNumberResolver = createNumberResolver;

  global.Neuro.saveHaving = saveHaving;
  global.Neuro.createHaving = createHaving;

  global.Neuro.parse = parse;
  global.Neuro.format = format;
  global.Neuro.createFormatter = createFormatter;

})(this);
