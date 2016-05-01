
  /* Top-Level Function */
  global.Rekord = Rekord;

  /* Classes */
  global.Rekord.Model = Model;
  global.Rekord.Database = Database;
  global.Rekord.Relation = Relation;
  global.Rekord.Operation = Operation;
  global.Rekord.Transaction = Transaction;
  global.Rekord.Search = Search;
  global.Rekord.SearchPaged = SearchPaged;

  /* Collections */
  global.Rekord.Map = Map;
  global.Rekord.Collection = Collection;
  global.Rekord.FilteredCollection = FilteredCollection;
  global.Rekord.ModelCollection = ModelCollection;
  global.Rekord.FilteredModelCollection = FilteredModelCollection;
  global.Rekord.Page = Page;

  /* Relationships */
  global.Rekord.HasOne = HasOne;
  global.Rekord.BelongsTo = BelongsTo;
  global.Rekord.HasMany = HasMany;
  global.Rekord.HasManyThrough = HasManyThrough;
  global.Rekord.HasRemote = HasRemote;

  /* Utility Functions */
  global.Rekord.isRekord = isRekord;
  global.Rekord.isDefined = isDefined;
  global.Rekord.isFunction = isFunction;
  global.Rekord.isString = isString;
  global.Rekord.isNumber = isNumber;
  global.Rekord.isBoolean = isBoolean;
  global.Rekord.isDate = isDate;
  global.Rekord.isRegExp = isRegExp;
  global.Rekord.isArray = isArray;
  global.Rekord.isObject = isObject;
  global.Rekord.isValue = isValue;

  global.Rekord.uuid = uuid;
  global.Rekord.indexOf = indexOf;
  global.Rekord.propsMatch = propsMatch;
  global.Rekord.hasFields = hasFields;
  global.Rekord.toArray = toArray;

  global.Rekord.addEventable = addEventable;

  global.Rekord.extend = extend;
  global.Rekord.extendArray = extendArray;
  global.Rekord.copyConstructor = copyConstructor;
  global.Rekord.factory = factory;

  global.Rekord.transfer = transfer;
  global.Rekord.collapse = collapse;
  global.Rekord.swap = swap;
  global.Rekord.reverse = reverse;
  global.Rekord.grab = grab;
  global.Rekord.pull = pull;
  global.Rekord.copy = copy;
  global.Rekord.noop = noop;
  global.Rekord.bind = bind;
  global.Rekord.diff = diff;
  global.Rekord.sizeof = sizeof;
  global.Rekord.isEmpty = isEmpty;
  global.Rekord.collect = collect;
  global.Rekord.applyOptions = applyOptions;
  global.Rekord.toCamelCase = toCamelCase;
  global.Rekord.evaluate = evaluate;

  global.Rekord.clean = clean;
  global.Rekord.cleanFunctions = cleanFunctions;

  global.Rekord.compare = compare;
  global.Rekord.compareNumbers = compareNumbers;
  global.Rekord.equals = equals;
  global.Rekord.equalsStrict = equalsStrict;
  global.Rekord.equalsCompare = equalsCompare;

  global.Rekord.isSorted = isSorted;
  global.Rekord.saveComparator = saveComparator;
  global.Rekord.createComparator = createComparator;
  global.Rekord.addComparator = addComparator;

  global.Rekord.saveWhere = saveWhere;
  global.Rekord.createWhere = createWhere;

  global.Rekord.savePropertyResolver = savePropertyResolver;
  global.Rekord.createPropertyResolver = createPropertyResolver;

  global.Rekord.saveNumberResolver = saveNumberResolver;
  global.Rekord.createNumberResolver = createNumberResolver;

  global.Rekord.parse = parse;
  global.Rekord.format = format;
  global.Rekord.createFormatter = createFormatter;

})(this);
