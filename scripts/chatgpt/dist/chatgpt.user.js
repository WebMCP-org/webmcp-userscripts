// ==UserScript==
// @name         ChatGPT MCP Server
// @namespace    https://github.com/WebMCP-org/webmcp-userscripts
// @version      1.0.0
// @author       WebMCP
// @description  MCP tools for ChatGPT
// @license      MIT
// @homepageURL  https://github.com/WebMCP-org/webmcp-userscripts
// @supportURL   https://github.com/WebMCP-org/webmcp-userscripts/issues
// @match        https://chatgpt.com/*
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.info
// @grant        GM.listValues
// @grant        GM.setValue
// @grant        unsafeWindow
// ==/UserScript==

(async function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  var util$6;
  (function(util2) {
    util2.assertEqual = (_2) => {
    };
    function assertIs(_arg) {
    }
    util2.assertIs = assertIs;
    function assertNever(_x) {
      throw new Error();
    }
    util2.assertNever = assertNever;
    util2.arrayToEnum = (items2) => {
      const obj = {};
      for (const item of items2) {
        obj[item] = item;
      }
      return obj;
    };
    util2.getValidEnumValues = (obj) => {
      const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
      const filtered = {};
      for (const k of validKeys) {
        filtered[k] = obj[k];
      }
      return util2.objectValues(filtered);
    };
    util2.objectValues = (obj) => {
      return util2.objectKeys(obj).map(function(e2) {
        return obj[e2];
      });
    };
    util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
      const keys7 = [];
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          keys7.push(key);
        }
      }
      return keys7;
    };
    util2.find = (arr, checker) => {
      for (const item of arr) {
        if (checker(item))
          return item;
      }
      return void 0;
    };
    util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
    function joinValues(array, separator = " | ") {
      return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
    }
    util2.joinValues = joinValues;
    util2.jsonStringifyReplacer = (_2, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    };
  })(util$6 || (util$6 = {}));
  var objectUtil;
  (function(objectUtil2) {
    objectUtil2.mergeShapes = (first, second) => {
      return {
        ...first,
        ...second
        // second overwrites first
      };
    };
  })(objectUtil || (objectUtil = {}));
  const ZodParsedType = util$6.arrayToEnum([
    "string",
    "nan",
    "number",
    "integer",
    "float",
    "boolean",
    "date",
    "bigint",
    "symbol",
    "function",
    "undefined",
    "null",
    "array",
    "object",
    "unknown",
    "promise",
    "void",
    "never",
    "map",
    "set"
  ]);
  const getParsedType = (data2) => {
    const t = typeof data2;
    switch (t) {
      case "undefined":
        return ZodParsedType.undefined;
      case "string":
        return ZodParsedType.string;
      case "number":
        return Number.isNaN(data2) ? ZodParsedType.nan : ZodParsedType.number;
      case "boolean":
        return ZodParsedType.boolean;
      case "function":
        return ZodParsedType.function;
      case "bigint":
        return ZodParsedType.bigint;
      case "symbol":
        return ZodParsedType.symbol;
      case "object":
        if (Array.isArray(data2)) {
          return ZodParsedType.array;
        }
        if (data2 === null) {
          return ZodParsedType.null;
        }
        if (data2.then && typeof data2.then === "function" && data2.catch && typeof data2.catch === "function") {
          return ZodParsedType.promise;
        }
        if (typeof Map !== "undefined" && data2 instanceof Map) {
          return ZodParsedType.map;
        }
        if (typeof Set !== "undefined" && data2 instanceof Set) {
          return ZodParsedType.set;
        }
        if (typeof Date !== "undefined" && data2 instanceof Date) {
          return ZodParsedType.date;
        }
        return ZodParsedType.object;
      default:
        return ZodParsedType.unknown;
    }
  };
  const ZodIssueCode = util$6.arrayToEnum([
    "invalid_type",
    "invalid_literal",
    "custom",
    "invalid_union",
    "invalid_union_discriminator",
    "invalid_enum_value",
    "unrecognized_keys",
    "invalid_arguments",
    "invalid_return_type",
    "invalid_date",
    "invalid_string",
    "too_small",
    "too_big",
    "invalid_intersection_types",
    "not_multiple_of",
    "not_finite"
  ]);
  class ZodError extends Error {
    get errors() {
      return this.issues;
    }
    constructor(issues) {
      super();
      this.issues = [];
      this.addIssue = (sub) => {
        this.issues = [...this.issues, sub];
      };
      this.addIssues = (subs = []) => {
        this.issues = [...this.issues, ...subs];
      };
      const actualProto = new.target.prototype;
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(this, actualProto);
      } else {
        this.__proto__ = actualProto;
      }
      this.name = "ZodError";
      this.issues = issues;
    }
    format(_mapper) {
      const mapper = _mapper || function(issue) {
        return issue.message;
      };
      const fieldErrors = { _errors: [] };
      const processError = (error) => {
        for (const issue of error.issues) {
          if (issue.code === "invalid_union") {
            issue.unionErrors.map(processError);
          } else if (issue.code === "invalid_return_type") {
            processError(issue.returnTypeError);
          } else if (issue.code === "invalid_arguments") {
            processError(issue.argumentsError);
          } else if (issue.path.length === 0) {
            fieldErrors._errors.push(mapper(issue));
          } else {
            let curr = fieldErrors;
            let i = 0;
            while (i < issue.path.length) {
              const el = issue.path[i];
              const terminal = i === issue.path.length - 1;
              if (!terminal) {
                curr[el] = curr[el] || { _errors: [] };
              } else {
                curr[el] = curr[el] || { _errors: [] };
                curr[el]._errors.push(mapper(issue));
              }
              curr = curr[el];
              i++;
            }
          }
        }
      };
      processError(this);
      return fieldErrors;
    }
    static assert(value) {
      if (!(value instanceof ZodError)) {
        throw new Error(`Not a ZodError: ${value}`);
      }
    }
    toString() {
      return this.message;
    }
    get message() {
      return JSON.stringify(this.issues, util$6.jsonStringifyReplacer, 2);
    }
    get isEmpty() {
      return this.issues.length === 0;
    }
    flatten(mapper = (issue) => issue.message) {
      const fieldErrors = {};
      const formErrors = [];
      for (const sub of this.issues) {
        if (sub.path.length > 0) {
          const firstEl = sub.path[0];
          fieldErrors[firstEl] = fieldErrors[firstEl] || [];
          fieldErrors[firstEl].push(mapper(sub));
        } else {
          formErrors.push(mapper(sub));
        }
      }
      return { formErrors, fieldErrors };
    }
    get formErrors() {
      return this.flatten();
    }
  }
  ZodError.create = (issues) => {
    const error = new ZodError(issues);
    return error;
  };
  const errorMap = (issue, _ctx) => {
    let message;
    switch (issue.code) {
      case ZodIssueCode.invalid_type:
        if (issue.received === ZodParsedType.undefined) {
          message = "Required";
        } else {
          message = `Expected ${issue.expected}, received ${issue.received}`;
        }
        break;
      case ZodIssueCode.invalid_literal:
        message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util$6.jsonStringifyReplacer)}`;
        break;
      case ZodIssueCode.unrecognized_keys:
        message = `Unrecognized key(s) in object: ${util$6.joinValues(issue.keys, ", ")}`;
        break;
      case ZodIssueCode.invalid_union:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_union_discriminator:
        message = `Invalid discriminator value. Expected ${util$6.joinValues(issue.options)}`;
        break;
      case ZodIssueCode.invalid_enum_value:
        message = `Invalid enum value. Expected ${util$6.joinValues(issue.options)}, received '${issue.received}'`;
        break;
      case ZodIssueCode.invalid_arguments:
        message = `Invalid function arguments`;
        break;
      case ZodIssueCode.invalid_return_type:
        message = `Invalid function return type`;
        break;
      case ZodIssueCode.invalid_date:
        message = `Invalid date`;
        break;
      case ZodIssueCode.invalid_string:
        if (typeof issue.validation === "object") {
          if ("includes" in issue.validation) {
            message = `Invalid input: must include "${issue.validation.includes}"`;
            if (typeof issue.validation.position === "number") {
              message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
            }
          } else if ("startsWith" in issue.validation) {
            message = `Invalid input: must start with "${issue.validation.startsWith}"`;
          } else if ("endsWith" in issue.validation) {
            message = `Invalid input: must end with "${issue.validation.endsWith}"`;
          } else {
            util$6.assertNever(issue.validation);
          }
        } else if (issue.validation !== "regex") {
          message = `Invalid ${issue.validation}`;
        } else {
          message = "Invalid";
        }
        break;
      case ZodIssueCode.too_small:
        if (issue.type === "array")
          message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
        else if (issue.type === "bigint")
          message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
        else if (issue.type === "date")
          message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.too_big:
        if (issue.type === "array")
          message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
        else if (issue.type === "string")
          message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
        else if (issue.type === "number")
          message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
        else if (issue.type === "bigint")
          message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
        else if (issue.type === "date")
          message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
        else
          message = "Invalid input";
        break;
      case ZodIssueCode.custom:
        message = `Invalid input`;
        break;
      case ZodIssueCode.invalid_intersection_types:
        message = `Intersection results could not be merged`;
        break;
      case ZodIssueCode.not_multiple_of:
        message = `Number must be a multiple of ${issue.multipleOf}`;
        break;
      case ZodIssueCode.not_finite:
        message = "Number must be finite";
        break;
      default:
        message = _ctx.defaultError;
        util$6.assertNever(issue);
    }
    return { message };
  };
  let overrideErrorMap = errorMap;
  function getErrorMap() {
    return overrideErrorMap;
  }
  const makeIssue = (params) => {
    const { data: data2, path, errorMaps, issueData } = params;
    const fullPath = [...path, ...issueData.path || []];
    const fullIssue = {
      ...issueData,
      path: fullPath
    };
    if (issueData.message !== void 0) {
      return {
        ...issueData,
        path: fullPath,
        message: issueData.message
      };
    }
    let errorMessage = "";
    const maps = errorMaps.filter((m2) => !!m2).slice().reverse();
    for (const map of maps) {
      errorMessage = map(fullIssue, { data: data2, defaultError: errorMessage }).message;
    }
    return {
      ...issueData,
      path: fullPath,
      message: errorMessage
    };
  };
  function addIssueToContext(ctx, issueData) {
    const overrideMap = getErrorMap();
    const issue = makeIssue({
      issueData,
      data: ctx.data,
      path: ctx.path,
      errorMaps: [
        ctx.common.contextualErrorMap,
        // contextual error map is first priority
        ctx.schemaErrorMap,
        // then schema-bound map if available
        overrideMap,
        // then global override map
        overrideMap === errorMap ? void 0 : errorMap
        // then global default map
      ].filter((x) => !!x)
    });
    ctx.common.issues.push(issue);
  }
  class ParseStatus {
    constructor() {
      this.value = "valid";
    }
    dirty() {
      if (this.value === "valid")
        this.value = "dirty";
    }
    abort() {
      if (this.value !== "aborted")
        this.value = "aborted";
    }
    static mergeArray(status, results) {
      const arrayValue = [];
      for (const s of results) {
        if (s.status === "aborted")
          return INVALID;
        if (s.status === "dirty")
          status.dirty();
        arrayValue.push(s.value);
      }
      return { status: status.value, value: arrayValue };
    }
    static async mergeObjectAsync(status, pairs) {
      const syncPairs = [];
      for (const pair of pairs) {
        const key = await pair.key;
        const value = await pair.value;
        syncPairs.push({
          key,
          value
        });
      }
      return ParseStatus.mergeObjectSync(status, syncPairs);
    }
    static mergeObjectSync(status, pairs) {
      const finalObject = {};
      for (const pair of pairs) {
        const { key, value } = pair;
        if (key.status === "aborted")
          return INVALID;
        if (value.status === "aborted")
          return INVALID;
        if (key.status === "dirty")
          status.dirty();
        if (value.status === "dirty")
          status.dirty();
        if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
          finalObject[key.value] = value.value;
        }
      }
      return { status: status.value, value: finalObject };
    }
  }
  const INVALID = Object.freeze({
    status: "aborted"
  });
  const DIRTY = (value) => ({ status: "dirty", value });
  const OK = (value) => ({ status: "valid", value });
  const isAborted = (x) => x.status === "aborted";
  const isDirty = (x) => x.status === "dirty";
  const isValid = (x) => x.status === "valid";
  const isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;
  var errorUtil;
  (function(errorUtil2) {
    errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
    errorUtil2.toString = (message) => typeof message === "string" ? message : message == null ? void 0 : message.message;
  })(errorUtil || (errorUtil = {}));
  class ParseInputLazyPath {
    constructor(parent, value, path, key) {
      this._cachedPath = [];
      this.parent = parent;
      this.data = value;
      this._path = path;
      this._key = key;
    }
    get path() {
      if (!this._cachedPath.length) {
        if (Array.isArray(this._key)) {
          this._cachedPath.push(...this._path, ...this._key);
        } else {
          this._cachedPath.push(...this._path, this._key);
        }
      }
      return this._cachedPath;
    }
  }
  const handleResult = (ctx, result) => {
    if (isValid(result)) {
      return { success: true, data: result.value };
    } else {
      if (!ctx.common.issues.length) {
        throw new Error("Validation failed but no issues detected.");
      }
      return {
        success: false,
        get error() {
          if (this._error)
            return this._error;
          const error = new ZodError(ctx.common.issues);
          this._error = error;
          return this._error;
        }
      };
    }
  };
  function processCreateParams$1(params) {
    if (!params)
      return {};
    const { errorMap: errorMap2, invalid_type_error, required_error, description: description2 } = params;
    if (errorMap2 && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap2)
      return { errorMap: errorMap2, description: description2 };
    const customMap = (iss, ctx) => {
      const { message } = params;
      if (iss.code === "invalid_enum_value") {
        return { message: message ?? ctx.defaultError };
      }
      if (typeof ctx.data === "undefined") {
        return { message: message ?? required_error ?? ctx.defaultError };
      }
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      return { message: message ?? invalid_type_error ?? ctx.defaultError };
    };
    return { errorMap: customMap, description: description2 };
  }
  class ZodType {
    get description() {
      return this._def.description;
    }
    _getType(input2) {
      return getParsedType(input2.data);
    }
    _getOrReturnCtx(input2, ctx) {
      return ctx || {
        common: input2.parent.common,
        data: input2.data,
        parsedType: getParsedType(input2.data),
        schemaErrorMap: this._def.errorMap,
        path: input2.path,
        parent: input2.parent
      };
    }
    _processInputParams(input2) {
      return {
        status: new ParseStatus(),
        ctx: {
          common: input2.parent.common,
          data: input2.data,
          parsedType: getParsedType(input2.data),
          schemaErrorMap: this._def.errorMap,
          path: input2.path,
          parent: input2.parent
        }
      };
    }
    _parseSync(input2) {
      const result = this._parse(input2);
      if (isAsync(result)) {
        throw new Error("Synchronous parse encountered promise.");
      }
      return result;
    }
    _parseAsync(input2) {
      const result = this._parse(input2);
      return Promise.resolve(result);
    }
    parse(data2, params) {
      const result = this.safeParse(data2, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    safeParse(data2, params) {
      const ctx = {
        common: {
          issues: [],
          async: (params == null ? void 0 : params.async) ?? false,
          contextualErrorMap: params == null ? void 0 : params.errorMap
        },
        path: (params == null ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: data2,
        parsedType: getParsedType(data2)
      };
      const result = this._parseSync({ data: data2, path: ctx.path, parent: ctx });
      return handleResult(ctx, result);
    }
    "~validate"(data2) {
      var _a, _b;
      const ctx = {
        common: {
          issues: [],
          async: !!this["~standard"].async
        },
        path: [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: data2,
        parsedType: getParsedType(data2)
      };
      if (!this["~standard"].async) {
        try {
          const result = this._parseSync({ data: data2, path: [], parent: ctx });
          return isValid(result) ? {
            value: result.value
          } : {
            issues: ctx.common.issues
          };
        } catch (err) {
          if ((_b = (_a = err == null ? void 0 : err.message) == null ? void 0 : _a.toLowerCase()) == null ? void 0 : _b.includes("encountered")) {
            this["~standard"].async = true;
          }
          ctx.common = {
            issues: [],
            async: true
          };
        }
      }
      return this._parseAsync({ data: data2, path: [], parent: ctx }).then((result) => isValid(result) ? {
        value: result.value
      } : {
        issues: ctx.common.issues
      });
    }
    async parseAsync(data2, params) {
      const result = await this.safeParseAsync(data2, params);
      if (result.success)
        return result.data;
      throw result.error;
    }
    async safeParseAsync(data2, params) {
      const ctx = {
        common: {
          issues: [],
          contextualErrorMap: params == null ? void 0 : params.errorMap,
          async: true
        },
        path: (params == null ? void 0 : params.path) || [],
        schemaErrorMap: this._def.errorMap,
        parent: null,
        data: data2,
        parsedType: getParsedType(data2)
      };
      const maybeAsyncResult = this._parse({ data: data2, path: ctx.path, parent: ctx });
      const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
      return handleResult(ctx, result);
    }
    refine(check, message) {
      const getIssueProperties = (val) => {
        if (typeof message === "string" || typeof message === "undefined") {
          return { message };
        } else if (typeof message === "function") {
          return message(val);
        } else {
          return message;
        }
      };
      return this._refinement((val, ctx) => {
        const result = check(val);
        const setError = () => ctx.addIssue({
          code: ZodIssueCode.custom,
          ...getIssueProperties(val)
        });
        if (typeof Promise !== "undefined" && result instanceof Promise) {
          return result.then((data2) => {
            if (!data2) {
              setError();
              return false;
            } else {
              return true;
            }
          });
        }
        if (!result) {
          setError();
          return false;
        } else {
          return true;
        }
      });
    }
    refinement(check, refinementData) {
      return this._refinement((val, ctx) => {
        if (!check(val)) {
          ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
          return false;
        } else {
          return true;
        }
      });
    }
    _refinement(refinement) {
      return new ZodEffects({
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "refinement", refinement }
      });
    }
    superRefine(refinement) {
      return this._refinement(refinement);
    }
    constructor(def) {
      this.spa = this.safeParseAsync;
      this._def = def;
      this.parse = this.parse.bind(this);
      this.safeParse = this.safeParse.bind(this);
      this.parseAsync = this.parseAsync.bind(this);
      this.safeParseAsync = this.safeParseAsync.bind(this);
      this.spa = this.spa.bind(this);
      this.refine = this.refine.bind(this);
      this.refinement = this.refinement.bind(this);
      this.superRefine = this.superRefine.bind(this);
      this.optional = this.optional.bind(this);
      this.nullable = this.nullable.bind(this);
      this.nullish = this.nullish.bind(this);
      this.array = this.array.bind(this);
      this.promise = this.promise.bind(this);
      this.or = this.or.bind(this);
      this.and = this.and.bind(this);
      this.transform = this.transform.bind(this);
      this.brand = this.brand.bind(this);
      this.default = this.default.bind(this);
      this.catch = this.catch.bind(this);
      this.describe = this.describe.bind(this);
      this.pipe = this.pipe.bind(this);
      this.readonly = this.readonly.bind(this);
      this.isNullable = this.isNullable.bind(this);
      this.isOptional = this.isOptional.bind(this);
      this["~standard"] = {
        version: 1,
        vendor: "zod",
        validate: (data2) => this["~validate"](data2)
      };
    }
    optional() {
      return ZodOptional.create(this, this._def);
    }
    nullable() {
      return ZodNullable.create(this, this._def);
    }
    nullish() {
      return this.nullable().optional();
    }
    array() {
      return ZodArray.create(this);
    }
    promise() {
      return ZodPromise.create(this, this._def);
    }
    or(option) {
      return ZodUnion.create([this, option], this._def);
    }
    and(incoming) {
      return ZodIntersection.create(this, incoming, this._def);
    }
    transform(transform) {
      return new ZodEffects({
        ...processCreateParams$1(this._def),
        schema: this,
        typeName: ZodFirstPartyTypeKind.ZodEffects,
        effect: { type: "transform", transform }
      });
    }
    default(def) {
      const defaultValueFunc = typeof def === "function" ? def : () => def;
      return new ZodDefault({
        ...processCreateParams$1(this._def),
        innerType: this,
        defaultValue: defaultValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodDefault
      });
    }
    brand() {
      return new ZodBranded({
        typeName: ZodFirstPartyTypeKind.ZodBranded,
        type: this,
        ...processCreateParams$1(this._def)
      });
    }
    catch(def) {
      const catchValueFunc = typeof def === "function" ? def : () => def;
      return new ZodCatch({
        ...processCreateParams$1(this._def),
        innerType: this,
        catchValue: catchValueFunc,
        typeName: ZodFirstPartyTypeKind.ZodCatch
      });
    }
    describe(description2) {
      const This = this.constructor;
      return new This({
        ...this._def,
        description: description2
      });
    }
    pipe(target) {
      return ZodPipeline.create(this, target);
    }
    readonly() {
      return ZodReadonly.create(this);
    }
    isOptional() {
      return this.safeParse(void 0).success;
    }
    isNullable() {
      return this.safeParse(null).success;
    }
  }
  const cuidRegex = /^c[^\s-]{8,}$/i;
  const cuid2Regex = /^[0-9a-z]+$/;
  const ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
  const uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
  const nanoidRegex = /^[a-z0-9_-]{21}$/i;
  const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  const durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
  const emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
  const _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
  let emojiRegex$1;
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
  const ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  const ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
  const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  const base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
  const dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
  const dateRegex = new RegExp(`^${dateRegexSource}$`);
  function timeRegexSource(args) {
    let secondsRegexSource = `[0-5]\\d`;
    if (args.precision) {
      secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
    } else if (args.precision == null) {
      secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
    }
    const secondsQuantifier = args.precision ? "+" : "?";
    return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
  }
  function timeRegex(args) {
    return new RegExp(`^${timeRegexSource(args)}$`);
  }
  function datetimeRegex(args) {
    let regex2 = `${dateRegexSource}T${timeRegexSource(args)}`;
    const opts = [];
    opts.push(args.local ? `Z?` : `Z`);
    if (args.offset)
      opts.push(`([+-]\\d{2}:?\\d{2})`);
    regex2 = `${regex2}(${opts.join("|")})`;
    return new RegExp(`^${regex2}$`);
  }
  function isValidIP(ip, version) {
    if ((version === "v4" || !version) && ipv4Regex.test(ip)) {
      return true;
    }
    if ((version === "v6" || !version) && ipv6Regex.test(ip)) {
      return true;
    }
    return false;
  }
  function isValidJWT(jwt, alg) {
    if (!jwtRegex.test(jwt))
      return false;
    try {
      const [header] = jwt.split(".");
      if (!header)
        return false;
      const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
      const decoded = JSON.parse(atob(base64));
      if (typeof decoded !== "object" || decoded === null)
        return false;
      if ("typ" in decoded && (decoded == null ? void 0 : decoded.typ) !== "JWT")
        return false;
      if (!decoded.alg)
        return false;
      if (alg && decoded.alg !== alg)
        return false;
      return true;
    } catch {
      return false;
    }
  }
  function isValidCidr(ip, version) {
    if ((version === "v4" || !version) && ipv4CidrRegex.test(ip)) {
      return true;
    }
    if ((version === "v6" || !version) && ipv6CidrRegex.test(ip)) {
      return true;
    }
    return false;
  }
  class ZodString extends ZodType {
    _parse(input2) {
      if (this._def.coerce) {
        input2.data = String(input2.data);
      }
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.string) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.string,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input2.data.length < check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input2.data.length > check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "length") {
          const tooBig = input2.data.length > check.value;
          const tooSmall = input2.data.length < check.value;
          if (tooBig || tooSmall) {
            ctx = this._getOrReturnCtx(input2, ctx);
            if (tooBig) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_big,
                maximum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message
              });
            } else if (tooSmall) {
              addIssueToContext(ctx, {
                code: ZodIssueCode.too_small,
                minimum: check.value,
                type: "string",
                inclusive: true,
                exact: true,
                message: check.message
              });
            }
            status.dirty();
          }
        } else if (check.kind === "email") {
          if (!emailRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "email",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "emoji") {
          if (!emojiRegex$1) {
            emojiRegex$1 = new RegExp(_emojiRegex, "u");
          }
          if (!emojiRegex$1.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "emoji",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "uuid") {
          if (!uuidRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "nanoid") {
          if (!nanoidRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "nanoid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid") {
          if (!cuidRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid2") {
          if (!cuid2Regex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "cuid2",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ulid") {
          if (!ulidRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "ulid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "url") {
          try {
            new URL(input2.data);
          } catch {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "regex") {
          check.regex.lastIndex = 0;
          const testResult = check.regex.test(input2.data);
          if (!testResult) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "trim") {
          input2.data = input2.data.trim();
        } else if (check.kind === "includes") {
          if (!input2.data.includes(check.value, check.position)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { includes: check.value, position: check.position },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "toLowerCase") {
          input2.data = input2.data.toLowerCase();
        } else if (check.kind === "toUpperCase") {
          input2.data = input2.data.toUpperCase();
        } else if (check.kind === "startsWith") {
          if (!input2.data.startsWith(check.value)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { startsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "endsWith") {
          if (!input2.data.endsWith(check.value)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { endsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "datetime") {
          const regex2 = datetimeRegex(check);
          if (!regex2.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "datetime",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "date") {
          const regex2 = dateRegex;
          if (!regex2.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "date",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "time") {
          const regex2 = timeRegex(check);
          if (!regex2.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "time",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "duration") {
          if (!durationRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "duration",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ip") {
          if (!isValidIP(input2.data, check.version)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "ip",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "jwt") {
          if (!isValidJWT(input2.data, check.alg)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "jwt",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cidr") {
          if (!isValidCidr(input2.data, check.version)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "cidr",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64") {
          if (!base64Regex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "base64",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64url") {
          if (!base64urlRegex.test(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              validation: "base64url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util$6.assertNever(check);
        }
      }
      return { status: status.value, value: input2.data };
    }
    _regex(regex2, validation, message) {
      return this.refinement((data2) => regex2.test(data2), {
        validation,
        code: ZodIssueCode.invalid_string,
        ...errorUtil.errToObj(message)
      });
    }
    _addCheck(check) {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    email(message) {
      return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
    }
    url(message) {
      return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
    }
    emoji(message) {
      return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
    }
    uuid(message) {
      return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
    }
    nanoid(message) {
      return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
    }
    cuid(message) {
      return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
    }
    cuid2(message) {
      return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
    }
    ulid(message) {
      return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
    }
    base64(message) {
      return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
    }
    base64url(message) {
      return this._addCheck({
        kind: "base64url",
        ...errorUtil.errToObj(message)
      });
    }
    jwt(options) {
      return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
    }
    ip(options) {
      return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
    }
    cidr(options) {
      return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
    }
    datetime(options) {
      if (typeof options === "string") {
        return this._addCheck({
          kind: "datetime",
          precision: null,
          offset: false,
          local: false,
          message: options
        });
      }
      return this._addCheck({
        kind: "datetime",
        precision: typeof (options == null ? void 0 : options.precision) === "undefined" ? null : options == null ? void 0 : options.precision,
        offset: (options == null ? void 0 : options.offset) ?? false,
        local: (options == null ? void 0 : options.local) ?? false,
        ...errorUtil.errToObj(options == null ? void 0 : options.message)
      });
    }
    date(message) {
      return this._addCheck({ kind: "date", message });
    }
    time(options) {
      if (typeof options === "string") {
        return this._addCheck({
          kind: "time",
          precision: null,
          message: options
        });
      }
      return this._addCheck({
        kind: "time",
        precision: typeof (options == null ? void 0 : options.precision) === "undefined" ? null : options == null ? void 0 : options.precision,
        ...errorUtil.errToObj(options == null ? void 0 : options.message)
      });
    }
    duration(message) {
      return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
    }
    regex(regex2, message) {
      return this._addCheck({
        kind: "regex",
        regex: regex2,
        ...errorUtil.errToObj(message)
      });
    }
    includes(value, options) {
      return this._addCheck({
        kind: "includes",
        value,
        position: options == null ? void 0 : options.position,
        ...errorUtil.errToObj(options == null ? void 0 : options.message)
      });
    }
    startsWith(value, message) {
      return this._addCheck({
        kind: "startsWith",
        value,
        ...errorUtil.errToObj(message)
      });
    }
    endsWith(value, message) {
      return this._addCheck({
        kind: "endsWith",
        value,
        ...errorUtil.errToObj(message)
      });
    }
    min(minLength, message) {
      return this._addCheck({
        kind: "min",
        value: minLength,
        ...errorUtil.errToObj(message)
      });
    }
    max(maxLength, message) {
      return this._addCheck({
        kind: "max",
        value: maxLength,
        ...errorUtil.errToObj(message)
      });
    }
    length(len, message) {
      return this._addCheck({
        kind: "length",
        value: len,
        ...errorUtil.errToObj(message)
      });
    }
    /**
     * Equivalent to `.min(1)`
     */
    nonempty(message) {
      return this.min(1, errorUtil.errToObj(message));
    }
    trim() {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "trim" }]
      });
    }
    toLowerCase() {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "toLowerCase" }]
      });
    }
    toUpperCase() {
      return new ZodString({
        ...this._def,
        checks: [...this._def.checks, { kind: "toUpperCase" }]
      });
    }
    get isDatetime() {
      return !!this._def.checks.find((ch) => ch.kind === "datetime");
    }
    get isDate() {
      return !!this._def.checks.find((ch) => ch.kind === "date");
    }
    get isTime() {
      return !!this._def.checks.find((ch) => ch.kind === "time");
    }
    get isDuration() {
      return !!this._def.checks.find((ch) => ch.kind === "duration");
    }
    get isEmail() {
      return !!this._def.checks.find((ch) => ch.kind === "email");
    }
    get isURL() {
      return !!this._def.checks.find((ch) => ch.kind === "url");
    }
    get isEmoji() {
      return !!this._def.checks.find((ch) => ch.kind === "emoji");
    }
    get isUUID() {
      return !!this._def.checks.find((ch) => ch.kind === "uuid");
    }
    get isNANOID() {
      return !!this._def.checks.find((ch) => ch.kind === "nanoid");
    }
    get isCUID() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid");
    }
    get isCUID2() {
      return !!this._def.checks.find((ch) => ch.kind === "cuid2");
    }
    get isULID() {
      return !!this._def.checks.find((ch) => ch.kind === "ulid");
    }
    get isIP() {
      return !!this._def.checks.find((ch) => ch.kind === "ip");
    }
    get isCIDR() {
      return !!this._def.checks.find((ch) => ch.kind === "cidr");
    }
    get isBase64() {
      return !!this._def.checks.find((ch) => ch.kind === "base64");
    }
    get isBase64url() {
      return !!this._def.checks.find((ch) => ch.kind === "base64url");
    }
    get minLength() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxLength() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  }
  ZodString.create = (params) => {
    return new ZodString({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodString,
      coerce: (params == null ? void 0 : params.coerce) ?? false,
      ...processCreateParams$1(params)
    });
  };
  function floatSafeRemainder(val, step) {
    const valDecCount = (val.toString().split(".")[1] || "").length;
    const stepDecCount = (step.toString().split(".")[1] || "").length;
    const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
    const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
    const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
    return valInt % stepInt / 10 ** decCount;
  }
  class ZodNumber extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
      this.step = this.multipleOf;
    }
    _parse(input2) {
      if (this._def.coerce) {
        input2.data = Number(input2.data);
      }
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.number) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.number,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "int") {
          if (!util$6.isInteger(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive ? input2.data < check.value : input2.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "number",
              inclusive: check.inclusive,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input2.data > check.value : input2.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "number",
              inclusive: check.inclusive,
              exact: false,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (floatSafeRemainder(input2.data, check.value) !== 0) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "finite") {
          if (!Number.isFinite(input2.data)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_finite,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util$6.assertNever(check);
        }
      }
      return { status: status.value, value: input2.data };
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new ZodNumber({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new ZodNumber({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    int(message) {
      return this._addCheck({
        kind: "int",
        message: errorUtil.toString(message)
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: 0,
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil.toString(message)
      });
    }
    finite(message) {
      return this._addCheck({
        kind: "finite",
        message: errorUtil.toString(message)
      });
    }
    safe(message) {
      return this._addCheck({
        kind: "min",
        inclusive: true,
        value: Number.MIN_SAFE_INTEGER,
        message: errorUtil.toString(message)
      })._addCheck({
        kind: "max",
        inclusive: true,
        value: Number.MAX_SAFE_INTEGER,
        message: errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
    get isInt() {
      return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util$6.isInteger(ch.value));
    }
    get isFinite() {
      let max = null;
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
          return true;
        } else if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        } else if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return Number.isFinite(min) && Number.isFinite(max);
    }
  }
  ZodNumber.create = (params) => {
    return new ZodNumber({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodNumber,
      coerce: (params == null ? void 0 : params.coerce) || false,
      ...processCreateParams$1(params)
    });
  };
  class ZodBigInt extends ZodType {
    constructor() {
      super(...arguments);
      this.min = this.gte;
      this.max = this.lte;
    }
    _parse(input2) {
      if (this._def.coerce) {
        try {
          input2.data = BigInt(input2.data);
        } catch {
          return this._getInvalidInput(input2);
        }
      }
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.bigint) {
        return this._getInvalidInput(input2);
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          const tooSmall = check.inclusive ? input2.data < check.value : input2.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              type: "bigint",
              minimum: check.value,
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          const tooBig = check.inclusive ? input2.data > check.value : input2.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              type: "bigint",
              maximum: check.value,
              inclusive: check.inclusive,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "multipleOf") {
          if (input2.data % check.value !== BigInt(0)) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else {
          util$6.assertNever(check);
        }
      }
      return { status: status.value, value: input2.data };
    }
    _getInvalidInput(input2) {
      const ctx = this._getOrReturnCtx(input2);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.bigint,
        received: ctx.parsedType
      });
      return INVALID;
    }
    gte(value, message) {
      return this.setLimit("min", value, true, errorUtil.toString(message));
    }
    gt(value, message) {
      return this.setLimit("min", value, false, errorUtil.toString(message));
    }
    lte(value, message) {
      return this.setLimit("max", value, true, errorUtil.toString(message));
    }
    lt(value, message) {
      return this.setLimit("max", value, false, errorUtil.toString(message));
    }
    setLimit(kind, value, inclusive, message) {
      return new ZodBigInt({
        ...this._def,
        checks: [
          ...this._def.checks,
          {
            kind,
            value,
            inclusive,
            message: errorUtil.toString(message)
          }
        ]
      });
    }
    _addCheck(check) {
      return new ZodBigInt({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    positive(message) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    negative(message) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: false,
        message: errorUtil.toString(message)
      });
    }
    nonpositive(message) {
      return this._addCheck({
        kind: "max",
        value: BigInt(0),
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    nonnegative(message) {
      return this._addCheck({
        kind: "min",
        value: BigInt(0),
        inclusive: true,
        message: errorUtil.toString(message)
      });
    }
    multipleOf(value, message) {
      return this._addCheck({
        kind: "multipleOf",
        value,
        message: errorUtil.toString(message)
      });
    }
    get minValue() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min;
    }
    get maxValue() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max;
    }
  }
  ZodBigInt.create = (params) => {
    return new ZodBigInt({
      checks: [],
      typeName: ZodFirstPartyTypeKind.ZodBigInt,
      coerce: (params == null ? void 0 : params.coerce) ?? false,
      ...processCreateParams$1(params)
    });
  };
  class ZodBoolean extends ZodType {
    _parse(input2) {
      if (this._def.coerce) {
        input2.data = Boolean(input2.data);
      }
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.boolean) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  }
  ZodBoolean.create = (params) => {
    return new ZodBoolean({
      typeName: ZodFirstPartyTypeKind.ZodBoolean,
      coerce: (params == null ? void 0 : params.coerce) || false,
      ...processCreateParams$1(params)
    });
  };
  class ZodDate extends ZodType {
    _parse(input2) {
      if (this._def.coerce) {
        input2.data = new Date(input2.data);
      }
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.date) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      if (Number.isNaN(input2.data.getTime())) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_date
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input2.data.getTime() < check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              message: check.message,
              inclusive: true,
              exact: false,
              minimum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else if (check.kind === "max") {
          if (input2.data.getTime() > check.value) {
            ctx = this._getOrReturnCtx(input2, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              message: check.message,
              inclusive: true,
              exact: false,
              maximum: check.value,
              type: "date"
            });
            status.dirty();
          }
        } else {
          util$6.assertNever(check);
        }
      }
      return {
        status: status.value,
        value: new Date(input2.data.getTime())
      };
    }
    _addCheck(check) {
      return new ZodDate({
        ...this._def,
        checks: [...this._def.checks, check]
      });
    }
    min(minDate, message) {
      return this._addCheck({
        kind: "min",
        value: minDate.getTime(),
        message: errorUtil.toString(message)
      });
    }
    max(maxDate, message) {
      return this._addCheck({
        kind: "max",
        value: maxDate.getTime(),
        message: errorUtil.toString(message)
      });
    }
    get minDate() {
      let min = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "min") {
          if (min === null || ch.value > min)
            min = ch.value;
        }
      }
      return min != null ? new Date(min) : null;
    }
    get maxDate() {
      let max = null;
      for (const ch of this._def.checks) {
        if (ch.kind === "max") {
          if (max === null || ch.value < max)
            max = ch.value;
        }
      }
      return max != null ? new Date(max) : null;
    }
  }
  ZodDate.create = (params) => {
    return new ZodDate({
      checks: [],
      coerce: (params == null ? void 0 : params.coerce) || false,
      typeName: ZodFirstPartyTypeKind.ZodDate,
      ...processCreateParams$1(params)
    });
  };
  class ZodSymbol extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.symbol) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.symbol,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  }
  ZodSymbol.create = (params) => {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
      ...processCreateParams$1(params)
    });
  };
  class ZodUndefined extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  }
  ZodUndefined.create = (params) => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams$1(params)
    });
  };
  class ZodNull extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.null) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  }
  ZodNull.create = (params) => {
    return new ZodNull({
      typeName: ZodFirstPartyTypeKind.ZodNull,
      ...processCreateParams$1(params)
    });
  };
  class ZodAny extends ZodType {
    constructor() {
      super(...arguments);
      this._any = true;
    }
    _parse(input2) {
      return OK(input2.data);
    }
  }
  ZodAny.create = (params) => {
    return new ZodAny({
      typeName: ZodFirstPartyTypeKind.ZodAny,
      ...processCreateParams$1(params)
    });
  };
  class ZodUnknown extends ZodType {
    constructor() {
      super(...arguments);
      this._unknown = true;
    }
    _parse(input2) {
      return OK(input2.data);
    }
  }
  ZodUnknown.create = (params) => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams$1(params)
    });
  };
  class ZodNever extends ZodType {
    _parse(input2) {
      const ctx = this._getOrReturnCtx(input2);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.never,
        received: ctx.parsedType
      });
      return INVALID;
    }
  }
  ZodNever.create = (params) => {
    return new ZodNever({
      typeName: ZodFirstPartyTypeKind.ZodNever,
      ...processCreateParams$1(params)
    });
  };
  class ZodVoid extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input2.data);
    }
  }
  ZodVoid.create = (params) => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams$1(params)
    });
  };
  class ZodArray extends ZodType {
    _parse(input2) {
      const { ctx, status } = this._processInputParams(input2);
      const def = this._def;
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (def.exactLength !== null) {
        const tooBig = ctx.data.length > def.exactLength.value;
        const tooSmall = ctx.data.length < def.exactLength.value;
        if (tooBig || tooSmall) {
          addIssueToContext(ctx, {
            code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
            minimum: tooSmall ? def.exactLength.value : void 0,
            maximum: tooBig ? def.exactLength.value : void 0,
            type: "array",
            inclusive: true,
            exact: true,
            message: def.exactLength.message
          });
          status.dirty();
        }
      }
      if (def.minLength !== null) {
        if (ctx.data.length < def.minLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.minLength.message
          });
          status.dirty();
        }
      }
      if (def.maxLength !== null) {
        if (ctx.data.length > def.maxLength.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxLength.value,
            type: "array",
            inclusive: true,
            exact: false,
            message: def.maxLength.message
          });
          status.dirty();
        }
      }
      if (ctx.common.async) {
        return Promise.all([...ctx.data].map((item, i) => {
          return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
        })).then((result2) => {
          return ParseStatus.mergeArray(status, result2);
        });
      }
      const result = [...ctx.data].map((item, i) => {
        return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      });
      return ParseStatus.mergeArray(status, result);
    }
    get element() {
      return this._def.type;
    }
    min(minLength, message) {
      return new ZodArray({
        ...this._def,
        minLength: { value: minLength, message: errorUtil.toString(message) }
      });
    }
    max(maxLength, message) {
      return new ZodArray({
        ...this._def,
        maxLength: { value: maxLength, message: errorUtil.toString(message) }
      });
    }
    length(len, message) {
      return new ZodArray({
        ...this._def,
        exactLength: { value: len, message: errorUtil.toString(message) }
      });
    }
    nonempty(message) {
      return this.min(1, message);
    }
  }
  ZodArray.create = (schema, params) => {
    return new ZodArray({
      type: schema,
      minLength: null,
      maxLength: null,
      exactLength: null,
      typeName: ZodFirstPartyTypeKind.ZodArray,
      ...processCreateParams$1(params)
    });
  };
  function deepPartialify(schema) {
    if (schema instanceof ZodObject) {
      const newShape = {};
      for (const key in schema.shape) {
        const fieldSchema = schema.shape[key];
        newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
      }
      return new ZodObject({
        ...schema._def,
        shape: () => newShape
      });
    } else if (schema instanceof ZodArray) {
      return new ZodArray({
        ...schema._def,
        type: deepPartialify(schema.element)
      });
    } else if (schema instanceof ZodOptional) {
      return ZodOptional.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodNullable) {
      return ZodNullable.create(deepPartialify(schema.unwrap()));
    } else if (schema instanceof ZodTuple) {
      return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
    } else {
      return schema;
    }
  }
  class ZodObject extends ZodType {
    constructor() {
      super(...arguments);
      this._cached = null;
      this.nonstrict = this.passthrough;
      this.augment = this.extend;
    }
    _getCached() {
      if (this._cached !== null)
        return this._cached;
      const shape = this._def.shape();
      const keys7 = util$6.objectKeys(shape);
      this._cached = { shape, keys: keys7 };
      return this._cached;
    }
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.object) {
        const ctx2 = this._getOrReturnCtx(input2);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const { status, ctx } = this._processInputParams(input2);
      const { shape, keys: shapeKeys } = this._getCached();
      const extraKeys = [];
      if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
        for (const key in ctx.data) {
          if (!shapeKeys.includes(key)) {
            extraKeys.push(key);
          }
        }
      }
      const pairs = [];
      for (const key of shapeKeys) {
        const keyValidator = shape[key];
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (this._def.catchall instanceof ZodNever) {
        const unknownKeys = this._def.unknownKeys;
        if (unknownKeys === "passthrough") {
          for (const key of extraKeys) {
            pairs.push({
              key: { status: "valid", value: key },
              value: { status: "valid", value: ctx.data[key] }
            });
          }
        } else if (unknownKeys === "strict") {
          if (extraKeys.length > 0) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.unrecognized_keys,
              keys: extraKeys
            });
            status.dirty();
          }
        } else if (unknownKeys === "strip") ;
        else {
          throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
        }
      } else {
        const catchall = this._def.catchall;
        for (const key of extraKeys) {
          const value = ctx.data[key];
          pairs.push({
            key: { status: "valid", value: key },
            value: catchall._parse(
              new ParseInputLazyPath(ctx, value, ctx.path, key)
              //, ctx.child(key), value, getParsedType(value)
            ),
            alwaysSet: key in ctx.data
          });
        }
      }
      if (ctx.common.async) {
        return Promise.resolve().then(async () => {
          const syncPairs = [];
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            syncPairs.push({
              key,
              value,
              alwaysSet: pair.alwaysSet
            });
          }
          return syncPairs;
        }).then((syncPairs) => {
          return ParseStatus.mergeObjectSync(status, syncPairs);
        });
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get shape() {
      return this._def.shape();
    }
    strict(message) {
      errorUtil.errToObj;
      return new ZodObject({
        ...this._def,
        unknownKeys: "strict",
        ...message !== void 0 ? {
          errorMap: (issue, ctx) => {
            var _a, _b;
            const defaultError = ((_b = (_a = this._def).errorMap) == null ? void 0 : _b.call(_a, issue, ctx).message) ?? ctx.defaultError;
            if (issue.code === "unrecognized_keys")
              return {
                message: errorUtil.errToObj(message).message ?? defaultError
              };
            return {
              message: defaultError
            };
          }
        } : {}
      });
    }
    strip() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "strip"
      });
    }
    passthrough() {
      return new ZodObject({
        ...this._def,
        unknownKeys: "passthrough"
      });
    }
    // const AugmentFactory =
    //   <Def extends ZodObjectDef>(def: Def) =>
    //   <Augmentation extends ZodRawShape>(
    //     augmentation: Augmentation
    //   ): ZodObject<
    //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
    //     Def["unknownKeys"],
    //     Def["catchall"]
    //   > => {
    //     return new ZodObject({
    //       ...def,
    //       shape: () => ({
    //         ...def.shape(),
    //         ...augmentation,
    //       }),
    //     }) as any;
    //   };
    extend(augmentation) {
      return new ZodObject({
        ...this._def,
        shape: () => ({
          ...this._def.shape(),
          ...augmentation
        })
      });
    }
    /**
     * Prior to zod@1.0.12 there was a bug in the
     * inferred type of merged objects. Please
     * upgrade if you are experiencing issues.
     */
    merge(merging) {
      const merged = new ZodObject({
        unknownKeys: merging._def.unknownKeys,
        catchall: merging._def.catchall,
        shape: () => ({
          ...this._def.shape(),
          ...merging._def.shape()
        }),
        typeName: ZodFirstPartyTypeKind.ZodObject
      });
      return merged;
    }
    // merge<
    //   Incoming extends AnyZodObject,
    //   Augmentation extends Incoming["shape"],
    //   NewOutput extends {
    //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
    //       ? Augmentation[k]["_output"]
    //       : k extends keyof Output
    //       ? Output[k]
    //       : never;
    //   },
    //   NewInput extends {
    //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
    //       ? Augmentation[k]["_input"]
    //       : k extends keyof Input
    //       ? Input[k]
    //       : never;
    //   }
    // >(
    //   merging: Incoming
    // ): ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"],
    //   NewOutput,
    //   NewInput
    // > {
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    setKey(key, schema) {
      return this.augment({ [key]: schema });
    }
    // merge<Incoming extends AnyZodObject>(
    //   merging: Incoming
    // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
    // ZodObject<
    //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
    //   Incoming["_def"]["unknownKeys"],
    //   Incoming["_def"]["catchall"]
    // > {
    //   // const mergedShape = objectUtil.mergeShapes(
    //   //   this._def.shape(),
    //   //   merging._def.shape()
    //   // );
    //   const merged: any = new ZodObject({
    //     unknownKeys: merging._def.unknownKeys,
    //     catchall: merging._def.catchall,
    //     shape: () =>
    //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
    //     typeName: ZodFirstPartyTypeKind.ZodObject,
    //   }) as any;
    //   return merged;
    // }
    catchall(index) {
      return new ZodObject({
        ...this._def,
        catchall: index
      });
    }
    pick(mask) {
      const shape = {};
      for (const key of util$6.objectKeys(mask)) {
        if (mask[key] && this.shape[key]) {
          shape[key] = this.shape[key];
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    omit(mask) {
      const shape = {};
      for (const key of util$6.objectKeys(this.shape)) {
        if (!mask[key]) {
          shape[key] = this.shape[key];
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => shape
      });
    }
    /**
     * @deprecated
     */
    deepPartial() {
      return deepPartialify(this);
    }
    partial(mask) {
      const newShape = {};
      for (const key of util$6.objectKeys(this.shape)) {
        const fieldSchema = this.shape[key];
        if (mask && !mask[key]) {
          newShape[key] = fieldSchema;
        } else {
          newShape[key] = fieldSchema.optional();
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    required(mask) {
      const newShape = {};
      for (const key of util$6.objectKeys(this.shape)) {
        if (mask && !mask[key]) {
          newShape[key] = this.shape[key];
        } else {
          const fieldSchema = this.shape[key];
          let newField = fieldSchema;
          while (newField instanceof ZodOptional) {
            newField = newField._def.innerType;
          }
          newShape[key] = newField;
        }
      }
      return new ZodObject({
        ...this._def,
        shape: () => newShape
      });
    }
    keyof() {
      return createZodEnum(util$6.objectKeys(this.shape));
    }
  }
  ZodObject.create = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams$1(params)
    });
  };
  ZodObject.strictCreate = (shape, params) => {
    return new ZodObject({
      shape: () => shape,
      unknownKeys: "strict",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams$1(params)
    });
  };
  ZodObject.lazycreate = (shape, params) => {
    return new ZodObject({
      shape,
      unknownKeys: "strip",
      catchall: ZodNever.create(),
      typeName: ZodFirstPartyTypeKind.ZodObject,
      ...processCreateParams$1(params)
    });
  };
  class ZodUnion extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const options = this._def.options;
      function handleResults(results) {
        for (const result of results) {
          if (result.result.status === "valid") {
            return result.result;
          }
        }
        for (const result of results) {
          if (result.result.status === "dirty") {
            ctx.common.issues.push(...result.ctx.common.issues);
            return result.result;
          }
        }
        const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return Promise.all(options.map(async (option) => {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          return {
            result: await option._parseAsync({
              data: ctx.data,
              path: ctx.path,
              parent: childCtx
            }),
            ctx: childCtx
          };
        })).then(handleResults);
      } else {
        let dirty = void 0;
        const issues = [];
        for (const option of options) {
          const childCtx = {
            ...ctx,
            common: {
              ...ctx.common,
              issues: []
            },
            parent: null
          };
          const result = option._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          });
          if (result.status === "valid") {
            return result;
          } else if (result.status === "dirty" && !dirty) {
            dirty = { result, ctx: childCtx };
          }
          if (childCtx.common.issues.length) {
            issues.push(childCtx.common.issues);
          }
        }
        if (dirty) {
          ctx.common.issues.push(...dirty.ctx.common.issues);
          return dirty.result;
        }
        const unionErrors = issues.map((issues2) => new ZodError(issues2));
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union,
          unionErrors
        });
        return INVALID;
      }
    }
    get options() {
      return this._def.options;
    }
  }
  ZodUnion.create = (types, params) => {
    return new ZodUnion({
      options: types,
      typeName: ZodFirstPartyTypeKind.ZodUnion,
      ...processCreateParams$1(params)
    });
  };
  const getDiscriminator = (type2) => {
    if (type2 instanceof ZodLazy) {
      return getDiscriminator(type2.schema);
    } else if (type2 instanceof ZodEffects) {
      return getDiscriminator(type2.innerType());
    } else if (type2 instanceof ZodLiteral) {
      return [type2.value];
    } else if (type2 instanceof ZodEnum) {
      return type2.options;
    } else if (type2 instanceof ZodNativeEnum) {
      return util$6.objectValues(type2.enum);
    } else if (type2 instanceof ZodDefault) {
      return getDiscriminator(type2._def.innerType);
    } else if (type2 instanceof ZodUndefined) {
      return [void 0];
    } else if (type2 instanceof ZodNull) {
      return [null];
    } else if (type2 instanceof ZodOptional) {
      return [void 0, ...getDiscriminator(type2.unwrap())];
    } else if (type2 instanceof ZodNullable) {
      return [null, ...getDiscriminator(type2.unwrap())];
    } else if (type2 instanceof ZodBranded) {
      return getDiscriminator(type2.unwrap());
    } else if (type2 instanceof ZodReadonly) {
      return getDiscriminator(type2.unwrap());
    } else if (type2 instanceof ZodCatch) {
      return getDiscriminator(type2._def.innerType);
    } else {
      return [];
    }
  };
  class ZodDiscriminatedUnion extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const discriminator = this.discriminator;
      const discriminatorValue = ctx.data[discriminator];
      const option = this.optionsMap.get(discriminatorValue);
      if (!option) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_union_discriminator,
          options: Array.from(this.optionsMap.keys()),
          path: [discriminator]
        });
        return INVALID;
      }
      if (ctx.common.async) {
        return option._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      } else {
        return option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
      }
    }
    get discriminator() {
      return this._def.discriminator;
    }
    get options() {
      return this._def.options;
    }
    get optionsMap() {
      return this._def.optionsMap;
    }
    /**
     * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
     * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
     * have a different value for each object in the union.
     * @param discriminator the name of the discriminator property
     * @param types an array of object schemas
     * @param params
     */
    static create(discriminator, options, params) {
      const optionsMap = /* @__PURE__ */ new Map();
      for (const type2 of options) {
        const discriminatorValues = getDiscriminator(type2.shape[discriminator]);
        if (!discriminatorValues.length) {
          throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
        }
        for (const value of discriminatorValues) {
          if (optionsMap.has(value)) {
            throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
          }
          optionsMap.set(value, type2);
        }
      }
      return new ZodDiscriminatedUnion({
        typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
        discriminator,
        options,
        optionsMap,
        ...processCreateParams$1(params)
      });
    }
  }
  function mergeValues(a, b2) {
    const aType = getParsedType(a);
    const bType = getParsedType(b2);
    if (a === b2) {
      return { valid: true, data: a };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
      const bKeys = util$6.objectKeys(b2);
      const sharedKeys = util$6.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a, ...b2 };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a[key], b2[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
      if (a.length !== b2.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a.length; index++) {
        const itemA = a[index];
        const itemB = b2[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b2) {
      return { valid: true, data: a };
    } else {
      return { valid: false };
    }
  }
  class ZodIntersection extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      const handleParsed = (parsedLeft, parsedRight) => {
        if (isAborted(parsedLeft) || isAborted(parsedRight)) {
          return INVALID;
        }
        const merged = mergeValues(parsedLeft.value, parsedRight.value);
        if (!merged.valid) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_intersection_types
          });
          return INVALID;
        }
        if (isDirty(parsedLeft) || isDirty(parsedRight)) {
          status.dirty();
        }
        return { status: status.value, value: merged.data };
      };
      if (ctx.common.async) {
        return Promise.all([
          this._def.left._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          }),
          this._def.right._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          })
        ]).then(([left, right]) => handleParsed(left, right));
      } else {
        return handleParsed(this._def.left._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }), this._def.right._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }));
      }
    }
  }
  ZodIntersection.create = (left, right, params) => {
    return new ZodIntersection({
      left,
      right,
      typeName: ZodFirstPartyTypeKind.ZodIntersection,
      ...processCreateParams$1(params)
    });
  };
  class ZodTuple extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.array) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.array,
          received: ctx.parsedType
        });
        return INVALID;
      }
      if (ctx.data.length < this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array"
        });
        return INVALID;
      }
      const rest = this._def.rest;
      if (!rest && ctx.data.length > this._def.items.length) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: this._def.items.length,
          inclusive: true,
          exact: false,
          type: "array"
        });
        status.dirty();
      }
      const items2 = [...ctx.data].map((item, itemIndex) => {
        const schema = this._def.items[itemIndex] || this._def.rest;
        if (!schema)
          return null;
        return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
      }).filter((x) => !!x);
      if (ctx.common.async) {
        return Promise.all(items2).then((results) => {
          return ParseStatus.mergeArray(status, results);
        });
      } else {
        return ParseStatus.mergeArray(status, items2);
      }
    }
    get items() {
      return this._def.items;
    }
    rest(rest) {
      return new ZodTuple({
        ...this._def,
        rest
      });
    }
  }
  ZodTuple.create = (schemas, params) => {
    if (!Array.isArray(schemas)) {
      throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
    }
    return new ZodTuple({
      items: schemas,
      typeName: ZodFirstPartyTypeKind.ZodTuple,
      rest: null,
      ...processCreateParams$1(params)
    });
  };
  class ZodRecord extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.object) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const pairs = [];
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      for (const key in ctx.data) {
        pairs.push({
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
          value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
          alwaysSet: key in ctx.data
        });
      }
      if (ctx.common.async) {
        return ParseStatus.mergeObjectAsync(status, pairs);
      } else {
        return ParseStatus.mergeObjectSync(status, pairs);
      }
    }
    get element() {
      return this._def.valueType;
    }
    static create(first, second, third) {
      if (second instanceof ZodType) {
        return new ZodRecord({
          keyType: first,
          valueType: second,
          typeName: ZodFirstPartyTypeKind.ZodRecord,
          ...processCreateParams$1(third)
        });
      }
      return new ZodRecord({
        keyType: ZodString.create(),
        valueType: first,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams$1(second)
      });
    }
  }
  class ZodMap extends ZodType {
    get keySchema() {
      return this._def.keyType;
    }
    get valueSchema() {
      return this._def.valueType;
    }
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.map) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.map,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const keyType = this._def.keyType;
      const valueType = this._def.valueType;
      const pairs = [...ctx.data.entries()].map(([key, value], index) => {
        return {
          key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
          value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
        };
      });
      if (ctx.common.async) {
        const finalMap = /* @__PURE__ */ new Map();
        return Promise.resolve().then(async () => {
          for (const pair of pairs) {
            const key = await pair.key;
            const value = await pair.value;
            if (key.status === "aborted" || value.status === "aborted") {
              return INVALID;
            }
            if (key.status === "dirty" || value.status === "dirty") {
              status.dirty();
            }
            finalMap.set(key.value, value.value);
          }
          return { status: status.value, value: finalMap };
        });
      } else {
        const finalMap = /* @__PURE__ */ new Map();
        for (const pair of pairs) {
          const key = pair.key;
          const value = pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      }
    }
  }
  ZodMap.create = (keyType, valueType, params) => {
    return new ZodMap({
      valueType,
      keyType,
      typeName: ZodFirstPartyTypeKind.ZodMap,
      ...processCreateParams$1(params)
    });
  };
  class ZodSet extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.set) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.set,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const def = this._def;
      if (def.minSize !== null) {
        if (ctx.data.size < def.minSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: def.minSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.minSize.message
          });
          status.dirty();
        }
      }
      if (def.maxSize !== null) {
        if (ctx.data.size > def.maxSize.value) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: def.maxSize.value,
            type: "set",
            inclusive: true,
            exact: false,
            message: def.maxSize.message
          });
          status.dirty();
        }
      }
      const valueType = this._def.valueType;
      function finalizeSet(elements2) {
        const parsedSet = /* @__PURE__ */ new Set();
        for (const element of elements2) {
          if (element.status === "aborted")
            return INVALID;
          if (element.status === "dirty")
            status.dirty();
          parsedSet.add(element.value);
        }
        return { status: status.value, value: parsedSet };
      }
      const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
      if (ctx.common.async) {
        return Promise.all(elements).then((elements2) => finalizeSet(elements2));
      } else {
        return finalizeSet(elements);
      }
    }
    min(minSize, message) {
      return new ZodSet({
        ...this._def,
        minSize: { value: minSize, message: errorUtil.toString(message) }
      });
    }
    max(maxSize, message) {
      return new ZodSet({
        ...this._def,
        maxSize: { value: maxSize, message: errorUtil.toString(message) }
      });
    }
    size(size, message) {
      return this.min(size, message).max(size, message);
    }
    nonempty(message) {
      return this.min(1, message);
    }
  }
  ZodSet.create = (valueType, params) => {
    return new ZodSet({
      valueType,
      minSize: null,
      maxSize: null,
      typeName: ZodFirstPartyTypeKind.ZodSet,
      ...processCreateParams$1(params)
    });
  };
  class ZodLazy extends ZodType {
    get schema() {
      return this._def.getter();
    }
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const lazySchema = this._def.getter();
      return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
    }
  }
  ZodLazy.create = (getter, params) => {
    return new ZodLazy({
      getter,
      typeName: ZodFirstPartyTypeKind.ZodLazy,
      ...processCreateParams$1(params)
    });
  };
  class ZodLiteral extends ZodType {
    _parse(input2) {
      if (input2.data !== this._def.value) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value
        });
        return INVALID;
      }
      return { status: "valid", value: input2.data };
    }
    get value() {
      return this._def.value;
    }
  }
  ZodLiteral.create = (value, params) => {
    return new ZodLiteral({
      value,
      typeName: ZodFirstPartyTypeKind.ZodLiteral,
      ...processCreateParams$1(params)
    });
  };
  function createZodEnum(values6, params) {
    return new ZodEnum({
      values: values6,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      ...processCreateParams$1(params)
    });
  }
  class ZodEnum extends ZodType {
    _parse(input2) {
      if (typeof input2.data !== "string") {
        const ctx = this._getOrReturnCtx(input2);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          expected: util$6.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (!this._cache) {
        this._cache = new Set(this._def.values);
      }
      if (!this._cache.has(input2.data)) {
        const ctx = this._getOrReturnCtx(input2);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input2.data);
    }
    get options() {
      return this._def.values;
    }
    get enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Values() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    get Enum() {
      const enumValues = {};
      for (const val of this._def.values) {
        enumValues[val] = val;
      }
      return enumValues;
    }
    extract(values6, newDef = this._def) {
      return ZodEnum.create(values6, {
        ...this._def,
        ...newDef
      });
    }
    exclude(values6, newDef = this._def) {
      return ZodEnum.create(this.options.filter((opt) => !values6.includes(opt)), {
        ...this._def,
        ...newDef
      });
    }
  }
  ZodEnum.create = createZodEnum;
  class ZodNativeEnum extends ZodType {
    _parse(input2) {
      const nativeEnumValues = util$6.getValidEnumValues(this._def.values);
      const ctx = this._getOrReturnCtx(input2);
      if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
        const expectedValues = util$6.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          expected: util$6.joinValues(expectedValues),
          received: ctx.parsedType,
          code: ZodIssueCode.invalid_type
        });
        return INVALID;
      }
      if (!this._cache) {
        this._cache = new Set(util$6.getValidEnumValues(this._def.values));
      }
      if (!this._cache.has(input2.data)) {
        const expectedValues = util$6.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input2.data);
    }
    get enum() {
      return this._def.values;
    }
  }
  ZodNativeEnum.create = (values6, params) => {
    return new ZodNativeEnum({
      values: values6,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      ...processCreateParams$1(params)
    });
  };
  class ZodPromise extends ZodType {
    unwrap() {
      return this._def.type;
    }
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.promise,
          received: ctx.parsedType
        });
        return INVALID;
      }
      const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
      return OK(promisified.then((data2) => {
        return this._def.type.parseAsync(data2, {
          path: ctx.path,
          errorMap: ctx.common.contextualErrorMap
        });
      }));
    }
  }
  ZodPromise.create = (schema, params) => {
    return new ZodPromise({
      type: schema,
      typeName: ZodFirstPartyTypeKind.ZodPromise,
      ...processCreateParams$1(params)
    });
  };
  class ZodEffects extends ZodType {
    innerType() {
      return this._def.schema;
    }
    sourceType() {
      return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
    }
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      const effect = this._def.effect || null;
      const checkCtx = {
        addIssue: (arg) => {
          addIssueToContext(ctx, arg);
          if (arg.fatal) {
            status.abort();
          } else {
            status.dirty();
          }
        },
        get path() {
          return ctx.path;
        }
      };
      checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
      if (effect.type === "preprocess") {
        const processed = effect.transform(ctx.data, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(processed).then(async (processed2) => {
            if (status.value === "aborted")
              return INVALID;
            const result = await this._def.schema._parseAsync({
              data: processed2,
              path: ctx.path,
              parent: ctx
            });
            if (result.status === "aborted")
              return INVALID;
            if (result.status === "dirty")
              return DIRTY(result.value);
            if (status.value === "dirty")
              return DIRTY(result.value);
            return result;
          });
        } else {
          if (status.value === "aborted")
            return INVALID;
          const result = this._def.schema._parseSync({
            data: processed,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        }
      }
      if (effect.type === "refinement") {
        const executeRefinement = (acc) => {
          const result = effect.refinement(acc, checkCtx);
          if (ctx.common.async) {
            return Promise.resolve(result);
          }
          if (result instanceof Promise) {
            throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
          }
          return acc;
        };
        if (ctx.common.async === false) {
          const inner = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          executeRefinement(inner.value);
          return { status: status.value, value: inner.value };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
            if (inner.status === "aborted")
              return INVALID;
            if (inner.status === "dirty")
              status.dirty();
            return executeRefinement(inner.value).then(() => {
              return { status: status.value, value: inner.value };
            });
          });
        }
      }
      if (effect.type === "transform") {
        if (ctx.common.async === false) {
          const base = this._def.schema._parseSync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (!isValid(base))
            return INVALID;
          const result = effect.transform(base.value, checkCtx);
          if (result instanceof Promise) {
            throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
          }
          return { status: status.value, value: result };
        } else {
          return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
            if (!isValid(base))
              return INVALID;
            return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
              status: status.value,
              value: result
            }));
          });
        }
      }
      util$6.assertNever(effect);
    }
  }
  ZodEffects.create = (schema, effect, params) => {
    return new ZodEffects({
      schema,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect,
      ...processCreateParams$1(params)
    });
  };
  ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
    return new ZodEffects({
      schema,
      effect: { type: "preprocess", transform: preprocess },
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      ...processCreateParams$1(params)
    });
  };
  class ZodOptional extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType === ZodParsedType.undefined) {
        return OK(void 0);
      }
      return this._def.innerType._parse(input2);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  ZodOptional.create = (type2, params) => {
    return new ZodOptional({
      innerType: type2,
      typeName: ZodFirstPartyTypeKind.ZodOptional,
      ...processCreateParams$1(params)
    });
  };
  class ZodNullable extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType === ZodParsedType.null) {
        return OK(null);
      }
      return this._def.innerType._parse(input2);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  ZodNullable.create = (type2, params) => {
    return new ZodNullable({
      innerType: type2,
      typeName: ZodFirstPartyTypeKind.ZodNullable,
      ...processCreateParams$1(params)
    });
  };
  class ZodDefault extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      let data2 = ctx.data;
      if (ctx.parsedType === ZodParsedType.undefined) {
        data2 = this._def.defaultValue();
      }
      return this._def.innerType._parse({
        data: data2,
        path: ctx.path,
        parent: ctx
      });
    }
    removeDefault() {
      return this._def.innerType;
    }
  }
  ZodDefault.create = (type2, params) => {
    return new ZodDefault({
      innerType: type2,
      typeName: ZodFirstPartyTypeKind.ZodDefault,
      defaultValue: typeof params.default === "function" ? params.default : () => params.default,
      ...processCreateParams$1(params)
    });
  };
  class ZodCatch extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const newCtx = {
        ...ctx,
        common: {
          ...ctx.common,
          issues: []
        }
      };
      const result = this._def.innerType._parse({
        data: newCtx.data,
        path: newCtx.path,
        parent: {
          ...newCtx
        }
      });
      if (isAsync(result)) {
        return result.then((result2) => {
          return {
            status: "valid",
            value: result2.status === "valid" ? result2.value : this._def.catchValue({
              get error() {
                return new ZodError(newCtx.common.issues);
              },
              input: newCtx.data
            })
          };
        });
      } else {
        return {
          status: "valid",
          value: result.status === "valid" ? result.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      }
    }
    removeCatch() {
      return this._def.innerType;
    }
  }
  ZodCatch.create = (type2, params) => {
    return new ZodCatch({
      innerType: type2,
      typeName: ZodFirstPartyTypeKind.ZodCatch,
      catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
      ...processCreateParams$1(params)
    });
  };
  class ZodNaN extends ZodType {
    _parse(input2) {
      const parsedType = this._getType(input2);
      if (parsedType !== ZodParsedType.nan) {
        const ctx = this._getOrReturnCtx(input2);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return { status: "valid", value: input2.data };
    }
  }
  ZodNaN.create = (params) => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams$1(params)
    });
  };
  class ZodBranded extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const data2 = ctx.data;
      return this._def.type._parse({
        data: data2,
        path: ctx.path,
        parent: ctx
      });
    }
    unwrap() {
      return this._def.type;
    }
  }
  class ZodPipeline extends ZodType {
    _parse(input2) {
      const { status, ctx } = this._processInputParams(input2);
      if (ctx.common.async) {
        const handleAsync = async () => {
          const inResult = await this._def.in._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: ctx
          });
          if (inResult.status === "aborted")
            return INVALID;
          if (inResult.status === "dirty") {
            status.dirty();
            return DIRTY(inResult.value);
          } else {
            return this._def.out._parseAsync({
              data: inResult.value,
              path: ctx.path,
              parent: ctx
            });
          }
        };
        return handleAsync();
      } else {
        const inResult = this._def.in._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return {
            status: "dirty",
            value: inResult.value
          };
        } else {
          return this._def.out._parseSync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      }
    }
    static create(a, b2) {
      return new ZodPipeline({
        in: a,
        out: b2,
        typeName: ZodFirstPartyTypeKind.ZodPipeline
      });
    }
  }
  class ZodReadonly extends ZodType {
    _parse(input2) {
      const result = this._def.innerType._parse(input2);
      const freeze = (data2) => {
        if (isValid(data2)) {
          data2.value = Object.freeze(data2.value);
        }
        return data2;
      };
      return isAsync(result) ? result.then((data2) => freeze(data2)) : freeze(result);
    }
    unwrap() {
      return this._def.innerType;
    }
  }
  ZodReadonly.create = (type2, params) => {
    return new ZodReadonly({
      innerType: type2,
      typeName: ZodFirstPartyTypeKind.ZodReadonly,
      ...processCreateParams$1(params)
    });
  };
  var ZodFirstPartyTypeKind;
  (function(ZodFirstPartyTypeKind2) {
    ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
    ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
    ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
    ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
    ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
    ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
    ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
    ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
    ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
    ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
    ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
    ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
    ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
    ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
    ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
    ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
    ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
    ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
    ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
    ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
    ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
    ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
    ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
    ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
    ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
    ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
    ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
    ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
    ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
    ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
    ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
    ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
    ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
    ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
    ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
    ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
  })(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
  const stringType = ZodString.create;
  const numberType = ZodNumber.create;
  const booleanType = ZodBoolean.create;
  const unknownType = ZodUnknown.create;
  ZodNever.create;
  const arrayType = ZodArray.create;
  const objectType = ZodObject.create;
  const unionType = ZodUnion.create;
  const discriminatedUnionType = ZodDiscriminatedUnion.create;
  ZodIntersection.create;
  ZodTuple.create;
  const recordType = ZodRecord.create;
  const literalType = ZodLiteral.create;
  const enumType = ZodEnum.create;
  ZodPromise.create;
  const optionalType = ZodOptional.create;
  ZodNullable.create;
  const LATEST_PROTOCOL_VERSION = "2025-06-18";
  const SUPPORTED_PROTOCOL_VERSIONS = [
    LATEST_PROTOCOL_VERSION,
    "2025-03-26",
    "2024-11-05",
    "2024-10-07"
  ];
  const JSONRPC_VERSION = "2.0";
  const ProgressTokenSchema = unionType([stringType(), numberType().int()]);
  const CursorSchema = stringType();
  const RequestMetaSchema = objectType({
    /**
     * If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications.
     */
    progressToken: optionalType(ProgressTokenSchema)
  }).passthrough();
  const BaseRequestParamsSchema = objectType({
    _meta: optionalType(RequestMetaSchema)
  }).passthrough();
  const RequestSchema = objectType({
    method: stringType(),
    params: optionalType(BaseRequestParamsSchema)
  });
  const BaseNotificationParamsSchema = objectType({
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const NotificationSchema = objectType({
    method: stringType(),
    params: optionalType(BaseNotificationParamsSchema)
  });
  const ResultSchema = objectType({
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const RequestIdSchema = unionType([stringType(), numberType().int()]);
  const JSONRPCRequestSchema = objectType({
    jsonrpc: literalType(JSONRPC_VERSION),
    id: RequestIdSchema
  }).merge(RequestSchema).strict();
  const isJSONRPCRequest = (value) => JSONRPCRequestSchema.safeParse(value).success;
  const JSONRPCNotificationSchema = objectType({
    jsonrpc: literalType(JSONRPC_VERSION)
  }).merge(NotificationSchema).strict();
  const isJSONRPCNotification = (value) => JSONRPCNotificationSchema.safeParse(value).success;
  const JSONRPCResponseSchema = objectType({
    jsonrpc: literalType(JSONRPC_VERSION),
    id: RequestIdSchema,
    result: ResultSchema
  }).strict();
  const isJSONRPCResponse = (value) => JSONRPCResponseSchema.safeParse(value).success;
  var ErrorCode;
  (function(ErrorCode2) {
    ErrorCode2[ErrorCode2["ConnectionClosed"] = -32e3] = "ConnectionClosed";
    ErrorCode2[ErrorCode2["RequestTimeout"] = -32001] = "RequestTimeout";
    ErrorCode2[ErrorCode2["ParseError"] = -32700] = "ParseError";
    ErrorCode2[ErrorCode2["InvalidRequest"] = -32600] = "InvalidRequest";
    ErrorCode2[ErrorCode2["MethodNotFound"] = -32601] = "MethodNotFound";
    ErrorCode2[ErrorCode2["InvalidParams"] = -32602] = "InvalidParams";
    ErrorCode2[ErrorCode2["InternalError"] = -32603] = "InternalError";
  })(ErrorCode || (ErrorCode = {}));
  const JSONRPCErrorSchema = objectType({
    jsonrpc: literalType(JSONRPC_VERSION),
    id: RequestIdSchema,
    error: objectType({
      /**
       * The error type that occurred.
       */
      code: numberType().int(),
      /**
       * A short description of the error. The message SHOULD be limited to a concise single sentence.
       */
      message: stringType(),
      /**
       * Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.).
       */
      data: optionalType(unknownType())
    })
  }).strict();
  const isJSONRPCError = (value) => JSONRPCErrorSchema.safeParse(value).success;
  const JSONRPCMessageSchema = unionType([
    JSONRPCRequestSchema,
    JSONRPCNotificationSchema,
    JSONRPCResponseSchema,
    JSONRPCErrorSchema
  ]);
  const EmptyResultSchema = ResultSchema.strict();
  const CancelledNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/cancelled"),
    params: BaseNotificationParamsSchema.extend({
      /**
       * The ID of the request to cancel.
       *
       * This MUST correspond to the ID of a request previously issued in the same direction.
       */
      requestId: RequestIdSchema,
      /**
       * An optional string describing the reason for the cancellation. This MAY be logged or presented to the user.
       */
      reason: stringType().optional()
    })
  });
  const BaseMetadataSchema = objectType({
    /** Intended for programmatic or logical use, but used as a display name in past specs or fallback */
    name: stringType(),
    /**
    * Intended for UI and end-user contexts — optimized to be human-readable and easily understood,
    * even by those unfamiliar with domain-specific terminology.
    *
    * If not provided, the name should be used for display (except for Tool,
    * where `annotations.title` should be given precedence over using `name`,
    * if present).
    */
    title: optionalType(stringType())
  }).passthrough();
  const ImplementationSchema = BaseMetadataSchema.extend({
    version: stringType()
  });
  const ClientCapabilitiesSchema = objectType({
    /**
     * Experimental, non-standard capabilities that the client supports.
     */
    experimental: optionalType(objectType({}).passthrough()),
    /**
     * Present if the client supports sampling from an LLM.
     */
    sampling: optionalType(objectType({}).passthrough()),
    /**
     * Present if the client supports eliciting user input.
     */
    elicitation: optionalType(objectType({}).passthrough()),
    /**
     * Present if the client supports listing roots.
     */
    roots: optionalType(objectType({
      /**
       * Whether the client supports issuing notifications for changes to the roots list.
       */
      listChanged: optionalType(booleanType())
    }).passthrough())
  }).passthrough();
  const InitializeRequestSchema = RequestSchema.extend({
    method: literalType("initialize"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The latest version of the Model Context Protocol that the client supports. The client MAY decide to support older versions as well.
       */
      protocolVersion: stringType(),
      capabilities: ClientCapabilitiesSchema,
      clientInfo: ImplementationSchema
    })
  });
  const ServerCapabilitiesSchema = objectType({
    /**
     * Experimental, non-standard capabilities that the server supports.
     */
    experimental: optionalType(objectType({}).passthrough()),
    /**
     * Present if the server supports sending log messages to the client.
     */
    logging: optionalType(objectType({}).passthrough()),
    /**
     * Present if the server supports sending completions to the client.
     */
    completions: optionalType(objectType({}).passthrough()),
    /**
     * Present if the server offers any prompt templates.
     */
    prompts: optionalType(objectType({
      /**
       * Whether this server supports issuing notifications for changes to the prompt list.
       */
      listChanged: optionalType(booleanType())
    }).passthrough()),
    /**
     * Present if the server offers any resources to read.
     */
    resources: optionalType(objectType({
      /**
       * Whether this server supports clients subscribing to resource updates.
       */
      subscribe: optionalType(booleanType()),
      /**
       * Whether this server supports issuing notifications for changes to the resource list.
       */
      listChanged: optionalType(booleanType())
    }).passthrough()),
    /**
     * Present if the server offers any tools to call.
     */
    tools: optionalType(objectType({
      /**
       * Whether this server supports issuing notifications for changes to the tool list.
       */
      listChanged: optionalType(booleanType())
    }).passthrough())
  }).passthrough();
  const InitializeResultSchema = ResultSchema.extend({
    /**
     * The version of the Model Context Protocol that the server wants to use. This may not match the version that the client requested. If the client cannot support this version, it MUST disconnect.
     */
    protocolVersion: stringType(),
    capabilities: ServerCapabilitiesSchema,
    serverInfo: ImplementationSchema,
    /**
     * Instructions describing how to use the server and its features.
     *
     * This can be used by clients to improve the LLM's understanding of available tools, resources, etc. It can be thought of like a "hint" to the model. For example, this information MAY be added to the system prompt.
     */
    instructions: optionalType(stringType())
  });
  const InitializedNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/initialized")
  });
  const PingRequestSchema = RequestSchema.extend({
    method: literalType("ping")
  });
  const ProgressSchema = objectType({
    /**
     * The progress thus far. This should increase every time progress is made, even if the total is unknown.
     */
    progress: numberType(),
    /**
     * Total number of items to process (or total progress required), if known.
     */
    total: optionalType(numberType()),
    /**
     * An optional message describing the current progress.
     */
    message: optionalType(stringType())
  }).passthrough();
  const ProgressNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/progress"),
    params: BaseNotificationParamsSchema.merge(ProgressSchema).extend({
      /**
       * The progress token which was given in the initial request, used to associate this notification with the request that is proceeding.
       */
      progressToken: ProgressTokenSchema
    })
  });
  const PaginatedRequestSchema = RequestSchema.extend({
    params: BaseRequestParamsSchema.extend({
      /**
       * An opaque token representing the current pagination position.
       * If provided, the server should return results starting after this cursor.
       */
      cursor: optionalType(CursorSchema)
    }).optional()
  });
  const PaginatedResultSchema = ResultSchema.extend({
    /**
     * An opaque token representing the pagination position after the last returned result.
     * If present, there may be more results available.
     */
    nextCursor: optionalType(CursorSchema)
  });
  const ResourceContentsSchema = objectType({
    /**
     * The URI of this resource.
     */
    uri: stringType(),
    /**
     * The MIME type of this resource, if known.
     */
    mimeType: optionalType(stringType()),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const TextResourceContentsSchema = ResourceContentsSchema.extend({
    /**
     * The text of the item. This must only be set if the item can actually be represented as text (not binary data).
     */
    text: stringType()
  });
  const Base64Schema = stringType().refine((val) => {
    try {
      atob(val);
      return true;
    } catch (_a) {
      return false;
    }
  }, { message: "Invalid Base64 string" });
  const BlobResourceContentsSchema = ResourceContentsSchema.extend({
    /**
     * A base64-encoded string representing the binary data of the item.
     */
    blob: Base64Schema
  });
  const ResourceSchema = BaseMetadataSchema.extend({
    /**
     * The URI of this resource.
     */
    uri: stringType(),
    /**
     * A description of what this resource represents.
     *
     * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
     */
    description: optionalType(stringType()),
    /**
     * The MIME type of this resource, if known.
     */
    mimeType: optionalType(stringType()),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  });
  const ResourceTemplateSchema = BaseMetadataSchema.extend({
    /**
     * A URI template (according to RFC 6570) that can be used to construct resource URIs.
     */
    uriTemplate: stringType(),
    /**
     * A description of what this template is for.
     *
     * This can be used by clients to improve the LLM's understanding of available resources. It can be thought of like a "hint" to the model.
     */
    description: optionalType(stringType()),
    /**
     * The MIME type for all resources that match this template. This should only be included if all resources matching this template have the same type.
     */
    mimeType: optionalType(stringType()),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  });
  const ListResourcesRequestSchema = PaginatedRequestSchema.extend({
    method: literalType("resources/list")
  });
  const ListResourcesResultSchema = PaginatedResultSchema.extend({
    resources: arrayType(ResourceSchema)
  });
  const ListResourceTemplatesRequestSchema = PaginatedRequestSchema.extend({
    method: literalType("resources/templates/list")
  });
  const ListResourceTemplatesResultSchema = PaginatedResultSchema.extend({
    resourceTemplates: arrayType(ResourceTemplateSchema)
  });
  const ReadResourceRequestSchema = RequestSchema.extend({
    method: literalType("resources/read"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it.
       */
      uri: stringType()
    })
  });
  const ReadResourceResultSchema = ResultSchema.extend({
    contents: arrayType(unionType([TextResourceContentsSchema, BlobResourceContentsSchema]))
  });
  const ResourceListChangedNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/resources/list_changed")
  });
  const SubscribeRequestSchema = RequestSchema.extend({
    method: literalType("resources/subscribe"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The URI of the resource to subscribe to. The URI can use any protocol; it is up to the server how to interpret it.
       */
      uri: stringType()
    })
  });
  const UnsubscribeRequestSchema = RequestSchema.extend({
    method: literalType("resources/unsubscribe"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The URI of the resource to unsubscribe from.
       */
      uri: stringType()
    })
  });
  const ResourceUpdatedNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/resources/updated"),
    params: BaseNotificationParamsSchema.extend({
      /**
       * The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to.
       */
      uri: stringType()
    })
  });
  const PromptArgumentSchema = objectType({
    /**
     * The name of the argument.
     */
    name: stringType(),
    /**
     * A human-readable description of the argument.
     */
    description: optionalType(stringType()),
    /**
     * Whether this argument must be provided.
     */
    required: optionalType(booleanType())
  }).passthrough();
  const PromptSchema = BaseMetadataSchema.extend({
    /**
     * An optional description of what this prompt provides
     */
    description: optionalType(stringType()),
    /**
     * A list of arguments to use for templating the prompt.
     */
    arguments: optionalType(arrayType(PromptArgumentSchema)),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  });
  const ListPromptsRequestSchema = PaginatedRequestSchema.extend({
    method: literalType("prompts/list")
  });
  const ListPromptsResultSchema = PaginatedResultSchema.extend({
    prompts: arrayType(PromptSchema)
  });
  const GetPromptRequestSchema = RequestSchema.extend({
    method: literalType("prompts/get"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The name of the prompt or prompt template.
       */
      name: stringType(),
      /**
       * Arguments to use for templating the prompt.
       */
      arguments: optionalType(recordType(stringType()))
    })
  });
  const TextContentSchema = objectType({
    type: literalType("text"),
    /**
     * The text content of the message.
     */
    text: stringType(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const ImageContentSchema = objectType({
    type: literalType("image"),
    /**
     * The base64-encoded image data.
     */
    data: Base64Schema,
    /**
     * The MIME type of the image. Different providers may support different image types.
     */
    mimeType: stringType(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const AudioContentSchema = objectType({
    type: literalType("audio"),
    /**
     * The base64-encoded audio data.
     */
    data: Base64Schema,
    /**
     * The MIME type of the audio. Different providers may support different audio types.
     */
    mimeType: stringType(),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const EmbeddedResourceSchema = objectType({
    type: literalType("resource"),
    resource: unionType([TextResourceContentsSchema, BlobResourceContentsSchema]),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const ResourceLinkSchema = ResourceSchema.extend({
    type: literalType("resource_link")
  });
  const ContentBlockSchema = unionType([
    TextContentSchema,
    ImageContentSchema,
    AudioContentSchema,
    ResourceLinkSchema,
    EmbeddedResourceSchema
  ]);
  const PromptMessageSchema = objectType({
    role: enumType(["user", "assistant"]),
    content: ContentBlockSchema
  }).passthrough();
  const GetPromptResultSchema = ResultSchema.extend({
    /**
     * An optional description for the prompt.
     */
    description: optionalType(stringType()),
    messages: arrayType(PromptMessageSchema)
  });
  const PromptListChangedNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/prompts/list_changed")
  });
  const ToolAnnotationsSchema = objectType({
    /**
     * A human-readable title for the tool.
     */
    title: optionalType(stringType()),
    /**
     * If true, the tool does not modify its environment.
     *
     * Default: false
     */
    readOnlyHint: optionalType(booleanType()),
    /**
     * If true, the tool may perform destructive updates to its environment.
     * If false, the tool performs only additive updates.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: true
     */
    destructiveHint: optionalType(booleanType()),
    /**
     * If true, calling the tool repeatedly with the same arguments
     * will have no additional effect on the its environment.
     *
     * (This property is meaningful only when `readOnlyHint == false`)
     *
     * Default: false
     */
    idempotentHint: optionalType(booleanType()),
    /**
     * If true, this tool may interact with an "open world" of external
     * entities. If false, the tool's domain of interaction is closed.
     * For example, the world of a web search tool is open, whereas that
     * of a memory tool is not.
     *
     * Default: true
     */
    openWorldHint: optionalType(booleanType())
  }).passthrough();
  const ToolSchema = BaseMetadataSchema.extend({
    /**
     * A human-readable description of the tool.
     */
    description: optionalType(stringType()),
    /**
     * A JSON Schema object defining the expected parameters for the tool.
     */
    inputSchema: objectType({
      type: literalType("object"),
      properties: optionalType(objectType({}).passthrough()),
      required: optionalType(arrayType(stringType()))
    }).passthrough(),
    /**
     * An optional JSON Schema object defining the structure of the tool's output returned in
     * the structuredContent field of a CallToolResult.
     */
    outputSchema: optionalType(objectType({
      type: literalType("object"),
      properties: optionalType(objectType({}).passthrough()),
      required: optionalType(arrayType(stringType()))
    }).passthrough()),
    /**
     * Optional additional tool information.
     */
    annotations: optionalType(ToolAnnotationsSchema),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  });
  const ListToolsRequestSchema = PaginatedRequestSchema.extend({
    method: literalType("tools/list")
  });
  const ListToolsResultSchema = PaginatedResultSchema.extend({
    tools: arrayType(ToolSchema)
  });
  const CallToolResultSchema = ResultSchema.extend({
    /**
     * A list of content objects that represent the result of the tool call.
     *
     * If the Tool does not define an outputSchema, this field MUST be present in the result.
     * For backwards compatibility, this field is always present, but it may be empty.
     */
    content: arrayType(ContentBlockSchema).default([]),
    /**
     * An object containing structured tool output.
     *
     * If the Tool defines an outputSchema, this field MUST be present in the result, and contain a JSON object that matches the schema.
     */
    structuredContent: objectType({}).passthrough().optional(),
    /**
     * Whether the tool call ended in an error.
     *
     * If not set, this is assumed to be false (the call was successful).
     *
     * Any errors that originate from the tool SHOULD be reported inside the result
     * object, with `isError` set to true, _not_ as an MCP protocol-level error
     * response. Otherwise, the LLM would not be able to see that an error occurred
     * and self-correct.
     *
     * However, any errors in _finding_ the tool, an error indicating that the
     * server does not support tool calls, or any other exceptional conditions,
     * should be reported as an MCP error response.
     */
    isError: optionalType(booleanType())
  });
  CallToolResultSchema.or(ResultSchema.extend({
    toolResult: unknownType()
  }));
  const CallToolRequestSchema = RequestSchema.extend({
    method: literalType("tools/call"),
    params: BaseRequestParamsSchema.extend({
      name: stringType(),
      arguments: optionalType(recordType(unknownType()))
    })
  });
  const ToolListChangedNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/tools/list_changed")
  });
  const LoggingLevelSchema = enumType([
    "debug",
    "info",
    "notice",
    "warning",
    "error",
    "critical",
    "alert",
    "emergency"
  ]);
  const SetLevelRequestSchema = RequestSchema.extend({
    method: literalType("logging/setLevel"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The level of logging that the client wants to receive from the server. The server should send all logs at this level and higher (i.e., more severe) to the client as notifications/logging/message.
       */
      level: LoggingLevelSchema
    })
  });
  const LoggingMessageNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/message"),
    params: BaseNotificationParamsSchema.extend({
      /**
       * The severity of this log message.
       */
      level: LoggingLevelSchema,
      /**
       * An optional name of the logger issuing this message.
       */
      logger: optionalType(stringType()),
      /**
       * The data to be logged, such as a string message or an object. Any JSON serializable type is allowed here.
       */
      data: unknownType()
    })
  });
  const ModelHintSchema = objectType({
    /**
     * A hint for a model name.
     */
    name: stringType().optional()
  }).passthrough();
  const ModelPreferencesSchema = objectType({
    /**
     * Optional hints to use for model selection.
     */
    hints: optionalType(arrayType(ModelHintSchema)),
    /**
     * How much to prioritize cost when selecting a model.
     */
    costPriority: optionalType(numberType().min(0).max(1)),
    /**
     * How much to prioritize sampling speed (latency) when selecting a model.
     */
    speedPriority: optionalType(numberType().min(0).max(1)),
    /**
     * How much to prioritize intelligence and capabilities when selecting a model.
     */
    intelligencePriority: optionalType(numberType().min(0).max(1))
  }).passthrough();
  const SamplingMessageSchema = objectType({
    role: enumType(["user", "assistant"]),
    content: unionType([TextContentSchema, ImageContentSchema, AudioContentSchema])
  }).passthrough();
  const CreateMessageRequestSchema = RequestSchema.extend({
    method: literalType("sampling/createMessage"),
    params: BaseRequestParamsSchema.extend({
      messages: arrayType(SamplingMessageSchema),
      /**
       * An optional system prompt the server wants to use for sampling. The client MAY modify or omit this prompt.
       */
      systemPrompt: optionalType(stringType()),
      /**
       * A request to include context from one or more MCP servers (including the caller), to be attached to the prompt. The client MAY ignore this request.
       */
      includeContext: optionalType(enumType(["none", "thisServer", "allServers"])),
      temperature: optionalType(numberType()),
      /**
       * The maximum number of tokens to sample, as requested by the server. The client MAY choose to sample fewer tokens than requested.
       */
      maxTokens: numberType().int(),
      stopSequences: optionalType(arrayType(stringType())),
      /**
       * Optional metadata to pass through to the LLM provider. The format of this metadata is provider-specific.
       */
      metadata: optionalType(objectType({}).passthrough()),
      /**
       * The server's preferences for which model to select.
       */
      modelPreferences: optionalType(ModelPreferencesSchema)
    })
  });
  const CreateMessageResultSchema = ResultSchema.extend({
    /**
     * The name of the model that generated the message.
     */
    model: stringType(),
    /**
     * The reason why sampling stopped.
     */
    stopReason: optionalType(enumType(["endTurn", "stopSequence", "maxTokens"]).or(stringType())),
    role: enumType(["user", "assistant"]),
    content: discriminatedUnionType("type", [
      TextContentSchema,
      ImageContentSchema,
      AudioContentSchema
    ])
  });
  const BooleanSchemaSchema = objectType({
    type: literalType("boolean"),
    title: optionalType(stringType()),
    description: optionalType(stringType()),
    default: optionalType(booleanType())
  }).passthrough();
  const StringSchemaSchema = objectType({
    type: literalType("string"),
    title: optionalType(stringType()),
    description: optionalType(stringType()),
    minLength: optionalType(numberType()),
    maxLength: optionalType(numberType()),
    format: optionalType(enumType(["email", "uri", "date", "date-time"]))
  }).passthrough();
  const NumberSchemaSchema = objectType({
    type: enumType(["number", "integer"]),
    title: optionalType(stringType()),
    description: optionalType(stringType()),
    minimum: optionalType(numberType()),
    maximum: optionalType(numberType())
  }).passthrough();
  const EnumSchemaSchema = objectType({
    type: literalType("string"),
    title: optionalType(stringType()),
    description: optionalType(stringType()),
    enum: arrayType(stringType()),
    enumNames: optionalType(arrayType(stringType()))
  }).passthrough();
  const PrimitiveSchemaDefinitionSchema = unionType([
    BooleanSchemaSchema,
    StringSchemaSchema,
    NumberSchemaSchema,
    EnumSchemaSchema
  ]);
  const ElicitRequestSchema = RequestSchema.extend({
    method: literalType("elicitation/create"),
    params: BaseRequestParamsSchema.extend({
      /**
       * The message to present to the user.
       */
      message: stringType(),
      /**
       * The schema for the requested user input.
       */
      requestedSchema: objectType({
        type: literalType("object"),
        properties: recordType(stringType(), PrimitiveSchemaDefinitionSchema),
        required: optionalType(arrayType(stringType()))
      }).passthrough()
    })
  });
  const ElicitResultSchema = ResultSchema.extend({
    /**
     * The user's response action.
     */
    action: enumType(["accept", "decline", "cancel"]),
    /**
     * The collected user input content (only present if action is "accept").
     */
    content: optionalType(recordType(stringType(), unknownType()))
  });
  const ResourceTemplateReferenceSchema = objectType({
    type: literalType("ref/resource"),
    /**
     * The URI or URI template of the resource.
     */
    uri: stringType()
  }).passthrough();
  const PromptReferenceSchema = objectType({
    type: literalType("ref/prompt"),
    /**
     * The name of the prompt or prompt template
     */
    name: stringType()
  }).passthrough();
  const CompleteRequestSchema = RequestSchema.extend({
    method: literalType("completion/complete"),
    params: BaseRequestParamsSchema.extend({
      ref: unionType([PromptReferenceSchema, ResourceTemplateReferenceSchema]),
      /**
       * The argument's information
       */
      argument: objectType({
        /**
         * The name of the argument
         */
        name: stringType(),
        /**
         * The value of the argument to use for completion matching.
         */
        value: stringType()
      }).passthrough(),
      context: optionalType(objectType({
        /**
         * Previously-resolved variables in a URI template or prompt.
         */
        arguments: optionalType(recordType(stringType(), stringType()))
      }))
    })
  });
  const CompleteResultSchema = ResultSchema.extend({
    completion: objectType({
      /**
       * An array of completion values. Must not exceed 100 items.
       */
      values: arrayType(stringType()).max(100),
      /**
       * The total number of completion options available. This can exceed the number of values actually sent in the response.
       */
      total: optionalType(numberType().int()),
      /**
       * Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown.
       */
      hasMore: optionalType(booleanType())
    }).passthrough()
  });
  const RootSchema = objectType({
    /**
     * The URI identifying the root. This *must* start with file:// for now.
     */
    uri: stringType().startsWith("file://"),
    /**
     * An optional name for the root.
     */
    name: optionalType(stringType()),
    /**
     * See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields)
     * for notes on _meta usage.
     */
    _meta: optionalType(objectType({}).passthrough())
  }).passthrough();
  const ListRootsRequestSchema = RequestSchema.extend({
    method: literalType("roots/list")
  });
  const ListRootsResultSchema = ResultSchema.extend({
    roots: arrayType(RootSchema)
  });
  const RootsListChangedNotificationSchema = NotificationSchema.extend({
    method: literalType("notifications/roots/list_changed")
  });
  unionType([
    PingRequestSchema,
    InitializeRequestSchema,
    CompleteRequestSchema,
    SetLevelRequestSchema,
    GetPromptRequestSchema,
    ListPromptsRequestSchema,
    ListResourcesRequestSchema,
    ListResourceTemplatesRequestSchema,
    ReadResourceRequestSchema,
    SubscribeRequestSchema,
    UnsubscribeRequestSchema,
    CallToolRequestSchema,
    ListToolsRequestSchema
  ]);
  unionType([
    CancelledNotificationSchema,
    ProgressNotificationSchema,
    InitializedNotificationSchema,
    RootsListChangedNotificationSchema
  ]);
  unionType([
    EmptyResultSchema,
    CreateMessageResultSchema,
    ElicitResultSchema,
    ListRootsResultSchema
  ]);
  unionType([
    PingRequestSchema,
    CreateMessageRequestSchema,
    ElicitRequestSchema,
    ListRootsRequestSchema
  ]);
  unionType([
    CancelledNotificationSchema,
    ProgressNotificationSchema,
    LoggingMessageNotificationSchema,
    ResourceUpdatedNotificationSchema,
    ResourceListChangedNotificationSchema,
    ToolListChangedNotificationSchema,
    PromptListChangedNotificationSchema
  ]);
  unionType([
    EmptyResultSchema,
    InitializeResultSchema,
    CompleteResultSchema,
    GetPromptResultSchema,
    ListPromptsResultSchema,
    ListResourcesResultSchema,
    ListResourceTemplatesResultSchema,
    ReadResourceResultSchema,
    CallToolResultSchema,
    ListToolsResultSchema
  ]);
  class McpError extends Error {
    constructor(code, message, data2) {
      super(`MCP error ${code}: ${message}`);
      this.code = code;
      this.data = data2;
      this.name = "McpError";
    }
  }
  var _ = ((n2) => (n2.START = "start", n2.STARTED = "started", n2.STOP = "stop", n2.STOPPED = "stopped", n2.PING = "ping", n2.PONG = "pong", n2.ERROR = "error", n2.LIST_TOOLS = "list_tools", n2.CALL_TOOL = "call_tool", n2.TOOL_LIST_UPDATED = "tool_list_updated", n2.TOOL_LIST_UPDATED_ACK = "tool_list_updated_ack", n2.PROCESS_DATA = "process_data", n2.SERVER_STARTED = "server_started", n2.SERVER_STOPPED = "server_stopped", n2.ERROR_FROM_NATIVE_HOST = "error_from_native_host", n2.CONNECT_NATIVE = "connectNative", n2.PING_NATIVE = "ping_native", n2.DISCONNECT_NATIVE = "disconnect_native", n2))(_ || {});
  var p$1 = class p {
    constructor(e2) {
      __publicField(this, "_started", false);
      __publicField(this, "_allowedOrigins");
      __publicField(this, "_channelId");
      __publicField(this, "_messageHandler");
      __publicField(this, "_clientOrigin");
      __publicField(this, "onclose");
      __publicField(this, "onerror");
      __publicField(this, "onmessage");
      if (!e2.allowedOrigins || e2.allowedOrigins.length === 0) throw new Error("At least one allowed origin must be specified");
      this._allowedOrigins = e2.allowedOrigins, this._channelId = e2.channelId || "mcp-default";
    }
    async start() {
      if (this._started) throw new Error("Transport already started");
      this._messageHandler = (e2) => {
        var _a, _b, _c, _d, _e;
        if (!this._allowedOrigins.includes(e2.origin) && !this._allowedOrigins.includes("*") || ((_a = e2.data) == null ? void 0 : _a.channel) !== this._channelId || ((_b = e2.data) == null ? void 0 : _b.type) !== "mcp" || ((_c = e2.data) == null ? void 0 : _c.direction) !== "client-to-server") return;
        this._clientOrigin = e2.origin;
        let t = e2.data.payload;
        if (typeof t == "string" && t === "mcp-check-ready") {
          window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: "mcp-server-ready" }, this._clientOrigin);
          return;
        }
        try {
          let r2 = JSONRPCMessageSchema.parse(t);
          (_d = this.onmessage) == null ? void 0 : _d.call(this, r2);
        } catch (r2) {
          (_e = this.onerror) == null ? void 0 : _e.call(this, new Error(`Invalid message: ${r2 instanceof Error ? r2.message : String(r2)}`));
        }
      }, window.addEventListener("message", this._messageHandler), this._started = true, window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: "mcp-server-ready" }, "*");
    }
    async send(e2) {
      if (!this._started) throw new Error("Transport not started");
      if (!this._clientOrigin) throw new Error("No client connected");
      window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: e2 }, this._clientOrigin);
    }
    async close() {
      var _a;
      this._messageHandler && window.removeEventListener("message", this._messageHandler), this._started = false, window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: "mcp-server-stopped" }, "*"), (_a = this.onclose) == null ? void 0 : _a.call(this);
    }
  };
  const DEFAULT_REQUEST_TIMEOUT_MSEC = 6e4;
  class Protocol {
    constructor(_options) {
      this._options = _options;
      this._requestMessageId = 0;
      this._requestHandlers = /* @__PURE__ */ new Map();
      this._requestHandlerAbortControllers = /* @__PURE__ */ new Map();
      this._notificationHandlers = /* @__PURE__ */ new Map();
      this._responseHandlers = /* @__PURE__ */ new Map();
      this._progressHandlers = /* @__PURE__ */ new Map();
      this._timeoutInfo = /* @__PURE__ */ new Map();
      this._pendingDebouncedNotifications = /* @__PURE__ */ new Set();
      this.setNotificationHandler(CancelledNotificationSchema, (notification) => {
        const controller = this._requestHandlerAbortControllers.get(notification.params.requestId);
        controller === null || controller === void 0 ? void 0 : controller.abort(notification.params.reason);
      });
      this.setNotificationHandler(ProgressNotificationSchema, (notification) => {
        this._onprogress(notification);
      });
      this.setRequestHandler(
        PingRequestSchema,
        // Automatic pong by default.
        (_request) => ({})
      );
    }
    _setupTimeout(messageId, timeout, maxTotalTimeout, onTimeout, resetTimeoutOnProgress = false) {
      this._timeoutInfo.set(messageId, {
        timeoutId: setTimeout(onTimeout, timeout),
        startTime: Date.now(),
        timeout,
        maxTotalTimeout,
        resetTimeoutOnProgress,
        onTimeout
      });
    }
    _resetTimeout(messageId) {
      const info = this._timeoutInfo.get(messageId);
      if (!info)
        return false;
      const totalElapsed = Date.now() - info.startTime;
      if (info.maxTotalTimeout && totalElapsed >= info.maxTotalTimeout) {
        this._timeoutInfo.delete(messageId);
        throw new McpError(ErrorCode.RequestTimeout, "Maximum total timeout exceeded", { maxTotalTimeout: info.maxTotalTimeout, totalElapsed });
      }
      clearTimeout(info.timeoutId);
      info.timeoutId = setTimeout(info.onTimeout, info.timeout);
      return true;
    }
    _cleanupTimeout(messageId) {
      const info = this._timeoutInfo.get(messageId);
      if (info) {
        clearTimeout(info.timeoutId);
        this._timeoutInfo.delete(messageId);
      }
    }
    /**
     * Attaches to the given transport, starts it, and starts listening for messages.
     *
     * The Protocol object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
     */
    async connect(transport) {
      var _a, _b, _c;
      this._transport = transport;
      const _onclose = (_a = this.transport) === null || _a === void 0 ? void 0 : _a.onclose;
      this._transport.onclose = () => {
        _onclose === null || _onclose === void 0 ? void 0 : _onclose();
        this._onclose();
      };
      const _onerror = (_b = this.transport) === null || _b === void 0 ? void 0 : _b.onerror;
      this._transport.onerror = (error) => {
        _onerror === null || _onerror === void 0 ? void 0 : _onerror(error);
        this._onerror(error);
      };
      const _onmessage = (_c = this._transport) === null || _c === void 0 ? void 0 : _c.onmessage;
      this._transport.onmessage = (message, extra) => {
        _onmessage === null || _onmessage === void 0 ? void 0 : _onmessage(message, extra);
        if (isJSONRPCResponse(message) || isJSONRPCError(message)) {
          this._onresponse(message);
        } else if (isJSONRPCRequest(message)) {
          this._onrequest(message, extra);
        } else if (isJSONRPCNotification(message)) {
          this._onnotification(message);
        } else {
          this._onerror(new Error(`Unknown message type: ${JSON.stringify(message)}`));
        }
      };
      await this._transport.start();
    }
    _onclose() {
      var _a;
      const responseHandlers = this._responseHandlers;
      this._responseHandlers = /* @__PURE__ */ new Map();
      this._progressHandlers.clear();
      this._pendingDebouncedNotifications.clear();
      this._transport = void 0;
      (_a = this.onclose) === null || _a === void 0 ? void 0 : _a.call(this);
      const error = new McpError(ErrorCode.ConnectionClosed, "Connection closed");
      for (const handler of responseHandlers.values()) {
        handler(error);
      }
    }
    _onerror(error) {
      var _a;
      (_a = this.onerror) === null || _a === void 0 ? void 0 : _a.call(this, error);
    }
    _onnotification(notification) {
      var _a;
      const handler = (_a = this._notificationHandlers.get(notification.method)) !== null && _a !== void 0 ? _a : this.fallbackNotificationHandler;
      if (handler === void 0) {
        return;
      }
      Promise.resolve().then(() => handler(notification)).catch((error) => this._onerror(new Error(`Uncaught error in notification handler: ${error}`)));
    }
    _onrequest(request, extra) {
      var _a, _b;
      const handler = (_a = this._requestHandlers.get(request.method)) !== null && _a !== void 0 ? _a : this.fallbackRequestHandler;
      const capturedTransport = this._transport;
      if (handler === void 0) {
        capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: ErrorCode.MethodNotFound,
            message: "Method not found"
          }
        }).catch((error) => this._onerror(new Error(`Failed to send an error response: ${error}`)));
        return;
      }
      const abortController = new AbortController();
      this._requestHandlerAbortControllers.set(request.id, abortController);
      const fullExtra = {
        signal: abortController.signal,
        sessionId: capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.sessionId,
        _meta: (_b = request.params) === null || _b === void 0 ? void 0 : _b._meta,
        sendNotification: (notification) => this.notification(notification, { relatedRequestId: request.id }),
        sendRequest: (r2, resultSchema, options) => this.request(r2, resultSchema, { ...options, relatedRequestId: request.id }),
        authInfo: extra === null || extra === void 0 ? void 0 : extra.authInfo,
        requestId: request.id,
        requestInfo: extra === null || extra === void 0 ? void 0 : extra.requestInfo
      };
      Promise.resolve().then(() => handler(request, fullExtra)).then((result) => {
        if (abortController.signal.aborted) {
          return;
        }
        return capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send({
          result,
          jsonrpc: "2.0",
          id: request.id
        });
      }, (error) => {
        var _a2;
        if (abortController.signal.aborted) {
          return;
        }
        return capturedTransport === null || capturedTransport === void 0 ? void 0 : capturedTransport.send({
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: Number.isSafeInteger(error["code"]) ? error["code"] : ErrorCode.InternalError,
            message: (_a2 = error.message) !== null && _a2 !== void 0 ? _a2 : "Internal error"
          }
        });
      }).catch((error) => this._onerror(new Error(`Failed to send response: ${error}`))).finally(() => {
        this._requestHandlerAbortControllers.delete(request.id);
      });
    }
    _onprogress(notification) {
      const { progressToken, ...params } = notification.params;
      const messageId = Number(progressToken);
      const handler = this._progressHandlers.get(messageId);
      if (!handler) {
        this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(notification)}`));
        return;
      }
      const responseHandler = this._responseHandlers.get(messageId);
      const timeoutInfo = this._timeoutInfo.get(messageId);
      if (timeoutInfo && responseHandler && timeoutInfo.resetTimeoutOnProgress) {
        try {
          this._resetTimeout(messageId);
        } catch (error) {
          responseHandler(error);
          return;
        }
      }
      handler(params);
    }
    _onresponse(response) {
      const messageId = Number(response.id);
      const handler = this._responseHandlers.get(messageId);
      if (handler === void 0) {
        this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(response)}`));
        return;
      }
      this._responseHandlers.delete(messageId);
      this._progressHandlers.delete(messageId);
      this._cleanupTimeout(messageId);
      if (isJSONRPCResponse(response)) {
        handler(response);
      } else {
        const error = new McpError(response.error.code, response.error.message, response.error.data);
        handler(error);
      }
    }
    get transport() {
      return this._transport;
    }
    /**
     * Closes the connection.
     */
    async close() {
      var _a;
      await ((_a = this._transport) === null || _a === void 0 ? void 0 : _a.close());
    }
    /**
     * Sends a request and wait for a response.
     *
     * Do not use this method to emit notifications! Use notification() instead.
     */
    request(request, resultSchema, options) {
      const { relatedRequestId, resumptionToken, onresumptiontoken } = options !== null && options !== void 0 ? options : {};
      return new Promise((resolve2, reject) => {
        var _a, _b, _c, _d, _e, _f;
        if (!this._transport) {
          reject(new Error("Not connected"));
          return;
        }
        if (((_a = this._options) === null || _a === void 0 ? void 0 : _a.enforceStrictCapabilities) === true) {
          this.assertCapabilityForMethod(request.method);
        }
        (_b = options === null || options === void 0 ? void 0 : options.signal) === null || _b === void 0 ? void 0 : _b.throwIfAborted();
        const messageId = this._requestMessageId++;
        const jsonrpcRequest = {
          ...request,
          jsonrpc: "2.0",
          id: messageId
        };
        if (options === null || options === void 0 ? void 0 : options.onprogress) {
          this._progressHandlers.set(messageId, options.onprogress);
          jsonrpcRequest.params = {
            ...request.params,
            _meta: {
              ...((_c = request.params) === null || _c === void 0 ? void 0 : _c._meta) || {},
              progressToken: messageId
            }
          };
        }
        const cancel = (reason) => {
          var _a2;
          this._responseHandlers.delete(messageId);
          this._progressHandlers.delete(messageId);
          this._cleanupTimeout(messageId);
          (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send({
            jsonrpc: "2.0",
            method: "notifications/cancelled",
            params: {
              requestId: messageId,
              reason: String(reason)
            }
          }, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error) => this._onerror(new Error(`Failed to send cancellation: ${error}`)));
          reject(reason);
        };
        this._responseHandlers.set(messageId, (response) => {
          var _a2;
          if ((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.aborted) {
            return;
          }
          if (response instanceof Error) {
            return reject(response);
          }
          try {
            const result = resultSchema.parse(response.result);
            resolve2(result);
          } catch (error) {
            reject(error);
          }
        });
        (_d = options === null || options === void 0 ? void 0 : options.signal) === null || _d === void 0 ? void 0 : _d.addEventListener("abort", () => {
          var _a2;
          cancel((_a2 = options === null || options === void 0 ? void 0 : options.signal) === null || _a2 === void 0 ? void 0 : _a2.reason);
        });
        const timeout = (_e = options === null || options === void 0 ? void 0 : options.timeout) !== null && _e !== void 0 ? _e : DEFAULT_REQUEST_TIMEOUT_MSEC;
        const timeoutHandler = () => cancel(new McpError(ErrorCode.RequestTimeout, "Request timed out", { timeout }));
        this._setupTimeout(messageId, timeout, options === null || options === void 0 ? void 0 : options.maxTotalTimeout, timeoutHandler, (_f = options === null || options === void 0 ? void 0 : options.resetTimeoutOnProgress) !== null && _f !== void 0 ? _f : false);
        this._transport.send(jsonrpcRequest, { relatedRequestId, resumptionToken, onresumptiontoken }).catch((error) => {
          this._cleanupTimeout(messageId);
          reject(error);
        });
      });
    }
    /**
     * Emits a notification, which is a one-way message that does not expect a response.
     */
    async notification(notification, options) {
      var _a, _b;
      if (!this._transport) {
        throw new Error("Not connected");
      }
      this.assertNotificationCapability(notification.method);
      const debouncedMethods = (_b = (_a = this._options) === null || _a === void 0 ? void 0 : _a.debouncedNotificationMethods) !== null && _b !== void 0 ? _b : [];
      const canDebounce = debouncedMethods.includes(notification.method) && !notification.params && !(options === null || options === void 0 ? void 0 : options.relatedRequestId);
      if (canDebounce) {
        if (this._pendingDebouncedNotifications.has(notification.method)) {
          return;
        }
        this._pendingDebouncedNotifications.add(notification.method);
        Promise.resolve().then(() => {
          var _a2;
          this._pendingDebouncedNotifications.delete(notification.method);
          if (!this._transport) {
            return;
          }
          const jsonrpcNotification2 = {
            ...notification,
            jsonrpc: "2.0"
          };
          (_a2 = this._transport) === null || _a2 === void 0 ? void 0 : _a2.send(jsonrpcNotification2, options).catch((error) => this._onerror(error));
        });
        return;
      }
      const jsonrpcNotification = {
        ...notification,
        jsonrpc: "2.0"
      };
      await this._transport.send(jsonrpcNotification, options);
    }
    /**
     * Registers a handler to invoke when this protocol object receives a request with the given method.
     *
     * Note that this will replace any previous request handler for the same method.
     */
    setRequestHandler(requestSchema, handler) {
      const method = requestSchema.shape.method.value;
      this.assertRequestHandlerCapability(method);
      this._requestHandlers.set(method, (request, extra) => {
        return Promise.resolve(handler(requestSchema.parse(request), extra));
      });
    }
    /**
     * Removes the request handler for the given method.
     */
    removeRequestHandler(method) {
      this._requestHandlers.delete(method);
    }
    /**
     * Asserts that a request handler has not already been set for the given method, in preparation for a new one being automatically installed.
     */
    assertCanSetRequestHandler(method) {
      if (this._requestHandlers.has(method)) {
        throw new Error(`A request handler for ${method} already exists, which would be overridden`);
      }
    }
    /**
     * Registers a handler to invoke when this protocol object receives a notification with the given method.
     *
     * Note that this will replace any previous notification handler for the same method.
     */
    setNotificationHandler(notificationSchema, handler) {
      this._notificationHandlers.set(notificationSchema.shape.method.value, (notification) => Promise.resolve(handler(notificationSchema.parse(notification))));
    }
    /**
     * Removes the notification handler for the given method.
     */
    removeNotificationHandler(method) {
      this._notificationHandlers.delete(method);
    }
  }
  function mergeCapabilities(base, additional) {
    return Object.entries(additional).reduce((acc, [key, value]) => {
      if (value && typeof value === "object") {
        acc[key] = acc[key] ? { ...acc[key], ...value } : value;
      } else {
        acc[key] = value;
      }
      return acc;
    }, { ...base });
  }
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
  }
  var uri_all = { exports: {} };
  /** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
  (function(module2, exports) {
    (function(global2, factory) {
      factory(exports);
    })(commonjsGlobal, function(exports2) {
      function merge() {
        for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) {
          sets[_key] = arguments[_key];
        }
        if (sets.length > 1) {
          sets[0] = sets[0].slice(0, -1);
          var xl = sets.length - 1;
          for (var x = 1; x < xl; ++x) {
            sets[x] = sets[x].slice(1, -1);
          }
          sets[xl] = sets[xl].slice(1);
          return sets.join("");
        } else {
          return sets[0];
        }
      }
      function subexp(str) {
        return "(?:" + str + ")";
      }
      function typeOf(o) {
        return o === void 0 ? "undefined" : o === null ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
      }
      function toUpperCase(str) {
        return str.toUpperCase();
      }
      function toArray(obj) {
        return obj !== void 0 && obj !== null ? obj instanceof Array ? obj : typeof obj.length !== "number" || obj.split || obj.setInterval || obj.call ? [obj] : Array.prototype.slice.call(obj) : [];
      }
      function assign(target, source) {
        var obj = target;
        if (source) {
          for (var key in source) {
            obj[key] = source[key];
          }
        }
        return obj;
      }
      function buildExps(isIRI) {
        var ALPHA$$ = "[A-Za-z]", DIGIT$$ = "[0-9]", HEXDIG$$2 = merge(DIGIT$$, "[A-Fa-f]"), PCT_ENCODED$2 = subexp(subexp("%[EFef]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$2 + "%" + HEXDIG$$2 + HEXDIG$$2) + "|" + subexp("%" + HEXDIG$$2 + HEXDIG$$2)), GEN_DELIMS$$ = "[\\:\\/\\?\\#\\[\\]\\@]", SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", RESERVED$$ = merge(GEN_DELIMS$$, SUB_DELIMS$$), UCSCHAR$$ = isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]", IPRIVATE$$ = isIRI ? "[\\uE000-\\uF8FF]" : "[]", UNRESERVED$$2 = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", UCSCHAR$$);
        subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*");
        subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]")) + "*");
        var DEC_OCTET_RELAXED$ = subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$), IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$), H16$ = subexp(HEXDIG$$2 + "{1,4}"), LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$), IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$), IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$), IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$), IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$), IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$), IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$), IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$), IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$), IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"), IPV6ADDRESS$ = subexp([IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$].join("|")), ZONEID$ = subexp(subexp(UNRESERVED$$2 + "|" + PCT_ENCODED$2) + "+");
        subexp("[vV]" + HEXDIG$$2 + "+\\." + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:]") + "+");
        subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$)) + "*");
        var PCHAR$ = subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@]"));
        subexp(subexp(PCT_ENCODED$2 + "|" + merge(UNRESERVED$$2, SUB_DELIMS$$, "[\\@]")) + "+");
        subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*");
        return {
          NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
          NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
          NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$2, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
          ESCAPE: new RegExp(merge("[^]", UNRESERVED$$2, SUB_DELIMS$$), "g"),
          UNRESERVED: new RegExp(UNRESERVED$$2, "g"),
          OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$2, RESERVED$$), "g"),
          PCT_ENCODED: new RegExp(PCT_ENCODED$2, "g"),
          IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
          IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$2 + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$")
          //RFC 6874, with relaxed parsing rules
        };
      }
      var URI_PROTOCOL = buildExps(false);
      var IRI_PROTOCOL = buildExps(true);
      var slicedToArray = /* @__PURE__ */ function() {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = void 0;
          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);
              if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }
          return _arr;
        }
        return function(arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();
      var toConsumableArray = function(arr) {
        if (Array.isArray(arr)) {
          for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
          return arr2;
        } else {
          return Array.from(arr);
        }
      };
      var maxInt = 2147483647;
      var base = 36;
      var tMin = 1;
      var tMax = 26;
      var skew = 38;
      var damp = 700;
      var initialBias = 72;
      var initialN = 128;
      var delimiter = "-";
      var regexPunycode = /^xn--/;
      var regexNonASCII = /[^\0-\x7E]/;
      var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g;
      var errors = {
        "overflow": "Overflow: input needs wider integers to process",
        "not-basic": "Illegal input >= 0x80 (not a basic code point)",
        "invalid-input": "Invalid input"
      };
      var baseMinusTMin = base - tMin;
      var floor = Math.floor;
      var stringFromCharCode = String.fromCharCode;
      function error$1(type2) {
        throw new RangeError(errors[type2]);
      }
      function map(array, fn) {
        var result = [];
        var length = array.length;
        while (length--) {
          result[length] = fn(array[length]);
        }
        return result;
      }
      function mapDomain(string, fn) {
        var parts = string.split("@");
        var result = "";
        if (parts.length > 1) {
          result = parts[0] + "@";
          string = parts[1];
        }
        string = string.replace(regexSeparators, ".");
        var labels = string.split(".");
        var encoded = map(labels, fn).join(".");
        return result + encoded;
      }
      function ucs2decode(string) {
        var output = [];
        var counter = 0;
        var length = string.length;
        while (counter < length) {
          var value = string.charCodeAt(counter++);
          if (value >= 55296 && value <= 56319 && counter < length) {
            var extra = string.charCodeAt(counter++);
            if ((extra & 64512) == 56320) {
              output.push(((value & 1023) << 10) + (extra & 1023) + 65536);
            } else {
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }
      var ucs2encode = function ucs2encode2(array) {
        return String.fromCodePoint.apply(String, toConsumableArray(array));
      };
      var basicToDigit = function basicToDigit2(codePoint) {
        if (codePoint - 48 < 10) {
          return codePoint - 22;
        }
        if (codePoint - 65 < 26) {
          return codePoint - 65;
        }
        if (codePoint - 97 < 26) {
          return codePoint - 97;
        }
        return base;
      };
      var digitToBasic = function digitToBasic2(digit, flag) {
        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
      };
      var adapt = function adapt2(delta, numPoints, firstTime) {
        var k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (
          ;
          /* no initialization */
          delta > baseMinusTMin * tMax >> 1;
          k += base
        ) {
          delta = floor(delta / baseMinusTMin);
        }
        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
      };
      var decode = function decode2(input2) {
        var output = [];
        var inputLength = input2.length;
        var i = 0;
        var n2 = initialN;
        var bias = initialBias;
        var basic = input2.lastIndexOf(delimiter);
        if (basic < 0) {
          basic = 0;
        }
        for (var j = 0; j < basic; ++j) {
          if (input2.charCodeAt(j) >= 128) {
            error$1("not-basic");
          }
          output.push(input2.charCodeAt(j));
        }
        for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
          var oldi = i;
          for (
            var w2 = 1, k = base;
            ;
            /* no condition */
            k += base
          ) {
            if (index >= inputLength) {
              error$1("invalid-input");
            }
            var digit = basicToDigit(input2.charCodeAt(index++));
            if (digit >= base || digit > floor((maxInt - i) / w2)) {
              error$1("overflow");
            }
            i += digit * w2;
            var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
            if (digit < t) {
              break;
            }
            var baseMinusT = base - t;
            if (w2 > floor(maxInt / baseMinusT)) {
              error$1("overflow");
            }
            w2 *= baseMinusT;
          }
          var out = output.length + 1;
          bias = adapt(i - oldi, out, oldi == 0);
          if (floor(i / out) > maxInt - n2) {
            error$1("overflow");
          }
          n2 += floor(i / out);
          i %= out;
          output.splice(i++, 0, n2);
        }
        return String.fromCodePoint.apply(String, output);
      };
      var encode2 = function encode3(input2) {
        var output = [];
        input2 = ucs2decode(input2);
        var inputLength = input2.length;
        var n2 = initialN;
        var delta = 0;
        var bias = initialBias;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = input2[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _currentValue2 = _step.value;
            if (_currentValue2 < 128) {
              output.push(stringFromCharCode(_currentValue2));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
        var basicLength = output.length;
        var handledCPCount = basicLength;
        if (basicLength) {
          output.push(delimiter);
        }
        while (handledCPCount < inputLength) {
          var m2 = maxInt;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = void 0;
          try {
            for (var _iterator2 = input2[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var currentValue = _step2.value;
              if (currentValue >= n2 && currentValue < m2) {
                m2 = currentValue;
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
          var handledCPCountPlusOne = handledCPCount + 1;
          if (m2 - n2 > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error$1("overflow");
          }
          delta += (m2 - n2) * handledCPCountPlusOne;
          n2 = m2;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = void 0;
          try {
            for (var _iterator3 = input2[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _currentValue = _step3.value;
              if (_currentValue < n2 && ++delta > maxInt) {
                error$1("overflow");
              }
              if (_currentValue == n2) {
                var q2 = delta;
                for (
                  var k = base;
                  ;
                  /* no condition */
                  k += base
                ) {
                  var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                  if (q2 < t) {
                    break;
                  }
                  var qMinusT = q2 - t;
                  var baseMinusT = base - t;
                  output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                  q2 = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q2, 0)));
                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
                delta = 0;
                ++handledCPCount;
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
          ++delta;
          ++n2;
        }
        return output.join("");
      };
      var toUnicode = function toUnicode2(input2) {
        return mapDomain(input2, function(string) {
          return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
      };
      var toASCII = function toASCII2(input2) {
        return mapDomain(input2, function(string) {
          return regexNonASCII.test(string) ? "xn--" + encode2(string) : string;
        });
      };
      var punycode = {
        /**
         * A string representing the current Punycode.js version number.
         * @memberOf punycode
         * @type String
         */
        "version": "2.1.0",
        /**
         * An object of methods to convert from JavaScript's internal character
         * representation (UCS-2) to Unicode code points, and back.
         * @see <https://mathiasbynens.be/notes/javascript-encoding>
         * @memberOf punycode
         * @type Object
         */
        "ucs2": {
          "decode": ucs2decode,
          "encode": ucs2encode
        },
        "decode": decode,
        "encode": encode2,
        "toASCII": toASCII,
        "toUnicode": toUnicode
      };
      var SCHEMES = {};
      function pctEncChar(chr) {
        var c2 = chr.charCodeAt(0);
        var e2 = void 0;
        if (c2 < 16) e2 = "%0" + c2.toString(16).toUpperCase();
        else if (c2 < 128) e2 = "%" + c2.toString(16).toUpperCase();
        else if (c2 < 2048) e2 = "%" + (c2 >> 6 | 192).toString(16).toUpperCase() + "%" + (c2 & 63 | 128).toString(16).toUpperCase();
        else e2 = "%" + (c2 >> 12 | 224).toString(16).toUpperCase() + "%" + (c2 >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c2 & 63 | 128).toString(16).toUpperCase();
        return e2;
      }
      function pctDecChars(str) {
        var newStr = "";
        var i = 0;
        var il = str.length;
        while (i < il) {
          var c2 = parseInt(str.substr(i + 1, 2), 16);
          if (c2 < 128) {
            newStr += String.fromCharCode(c2);
            i += 3;
          } else if (c2 >= 194 && c2 < 224) {
            if (il - i >= 6) {
              var c22 = parseInt(str.substr(i + 4, 2), 16);
              newStr += String.fromCharCode((c2 & 31) << 6 | c22 & 63);
            } else {
              newStr += str.substr(i, 6);
            }
            i += 6;
          } else if (c2 >= 224) {
            if (il - i >= 9) {
              var _c = parseInt(str.substr(i + 4, 2), 16);
              var c3 = parseInt(str.substr(i + 7, 2), 16);
              newStr += String.fromCharCode((c2 & 15) << 12 | (_c & 63) << 6 | c3 & 63);
            } else {
              newStr += str.substr(i, 9);
            }
            i += 9;
          } else {
            newStr += str.substr(i, 3);
            i += 3;
          }
        }
        return newStr;
      }
      function _normalizeComponentEncoding(components, protocol) {
        function decodeUnreserved2(str) {
          var decStr = pctDecChars(str);
          return !decStr.match(protocol.UNRESERVED) ? str : decStr;
        }
        if (components.scheme) components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_SCHEME, "");
        if (components.userinfo !== void 0) components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.host !== void 0) components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved2).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.path !== void 0) components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.query !== void 0) components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        if (components.fragment !== void 0) components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved2).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase);
        return components;
      }
      function _stripLeadingZeros(str) {
        return str.replace(/^0*(.*)/, "$1") || "0";
      }
      function _normalizeIPv4(host, protocol) {
        var matches2 = host.match(protocol.IPV4ADDRESS) || [];
        var _matches = slicedToArray(matches2, 2), address = _matches[1];
        if (address) {
          return address.split(".").map(_stripLeadingZeros).join(".");
        } else {
          return host;
        }
      }
      function _normalizeIPv6(host, protocol) {
        var matches2 = host.match(protocol.IPV6ADDRESS) || [];
        var _matches2 = slicedToArray(matches2, 3), address = _matches2[1], zone = _matches2[2];
        if (address) {
          var _address$toLowerCase$ = address.toLowerCase().split("::").reverse(), _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2), last = _address$toLowerCase$2[0], first = _address$toLowerCase$2[1];
          var firstFields = first ? first.split(":").map(_stripLeadingZeros) : [];
          var lastFields = last.split(":").map(_stripLeadingZeros);
          var isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]);
          var fieldCount = isLastFieldIPv4Address ? 7 : 8;
          var lastFieldsStart = lastFields.length - fieldCount;
          var fields = Array(fieldCount);
          for (var x = 0; x < fieldCount; ++x) {
            fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || "";
          }
          if (isLastFieldIPv4Address) {
            fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol);
          }
          var allZeroFields = fields.reduce(function(acc, field, index) {
            if (!field || field === "0") {
              var lastLongest = acc[acc.length - 1];
              if (lastLongest && lastLongest.index + lastLongest.length === index) {
                lastLongest.length++;
              } else {
                acc.push({ index, length: 1 });
              }
            }
            return acc;
          }, []);
          var longestZeroFields = allZeroFields.sort(function(a, b2) {
            return b2.length - a.length;
          })[0];
          var newHost = void 0;
          if (longestZeroFields && longestZeroFields.length > 1) {
            var newFirst = fields.slice(0, longestZeroFields.index);
            var newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
            newHost = newFirst.join(":") + "::" + newLast.join(":");
          } else {
            newHost = fields.join(":");
          }
          if (zone) {
            newHost += "%" + zone;
          }
          return newHost;
        } else {
          return host;
        }
      }
      var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i;
      var NO_MATCH_IS_UNDEFINED = "".match(/(){0}/)[1] === void 0;
      function parse(uriString) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var components = {};
        var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        if (options.reference === "suffix") uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString;
        var matches2 = uriString.match(URI_PARSE);
        if (matches2) {
          if (NO_MATCH_IS_UNDEFINED) {
            components.scheme = matches2[1];
            components.userinfo = matches2[3];
            components.host = matches2[4];
            components.port = parseInt(matches2[5], 10);
            components.path = matches2[6] || "";
            components.query = matches2[7];
            components.fragment = matches2[8];
            if (isNaN(components.port)) {
              components.port = matches2[5];
            }
          } else {
            components.scheme = matches2[1] || void 0;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches2[3] : void 0;
            components.host = uriString.indexOf("//") !== -1 ? matches2[4] : void 0;
            components.port = parseInt(matches2[5], 10);
            components.path = matches2[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches2[7] : void 0;
            components.fragment = uriString.indexOf("#") !== -1 ? matches2[8] : void 0;
            if (isNaN(components.port)) {
              components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches2[4] : void 0;
            }
          }
          if (components.host) {
            components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol);
          }
          if (components.scheme === void 0 && components.userinfo === void 0 && components.host === void 0 && components.port === void 0 && !components.path && components.query === void 0) {
            components.reference = "same-document";
          } else if (components.scheme === void 0) {
            components.reference = "relative";
          } else if (components.fragment === void 0) {
            components.reference = "absolute";
          } else {
            components.reference = "uri";
          }
          if (options.reference && options.reference !== "suffix" && options.reference !== components.reference) {
            components.error = components.error || "URI is not a " + options.reference + " reference.";
          }
          var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
          if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
            if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) {
              try {
                components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
              } catch (e2) {
                components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e2;
              }
            }
            _normalizeComponentEncoding(components, URI_PROTOCOL);
          } else {
            _normalizeComponentEncoding(components, protocol);
          }
          if (schemeHandler && schemeHandler.parse) {
            schemeHandler.parse(components, options);
          }
        } else {
          components.error = components.error || "URI can not be parsed.";
        }
        return components;
      }
      function _recomposeAuthority(components, options) {
        var protocol = options.iri !== false ? IRI_PROTOCOL : URI_PROTOCOL;
        var uriTokens = [];
        if (components.userinfo !== void 0) {
          uriTokens.push(components.userinfo);
          uriTokens.push("@");
        }
        if (components.host !== void 0) {
          uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, function(_2, $1, $2) {
            return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
          }));
        }
        if (typeof components.port === "number" || typeof components.port === "string") {
          uriTokens.push(":");
          uriTokens.push(String(components.port));
        }
        return uriTokens.length ? uriTokens.join("") : void 0;
      }
      var RDS1 = /^\.\.?\//;
      var RDS2 = /^\/\.(\/|$)/;
      var RDS3 = /^\/\.\.(\/|$)/;
      var RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
      function removeDotSegments(input2) {
        var output = [];
        while (input2.length) {
          if (input2.match(RDS1)) {
            input2 = input2.replace(RDS1, "");
          } else if (input2.match(RDS2)) {
            input2 = input2.replace(RDS2, "/");
          } else if (input2.match(RDS3)) {
            input2 = input2.replace(RDS3, "/");
            output.pop();
          } else if (input2 === "." || input2 === "..") {
            input2 = "";
          } else {
            var im = input2.match(RDS5);
            if (im) {
              var s = im[0];
              input2 = input2.slice(s.length);
              output.push(s);
            } else {
              throw new Error("Unexpected dot segment condition");
            }
          }
        }
        return output.join("");
      }
      function serialize2(components) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        var protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
        var uriTokens = [];
        var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
        if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(components, options);
        if (components.host) {
          if (protocol.IPV6ADDRESS.test(components.host)) ;
          else if (options.domainHost || schemeHandler && schemeHandler.domainHost) {
            try {
              components.host = !options.iri ? punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase()) : punycode.toUnicode(components.host);
            } catch (e2) {
              components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e2;
            }
          }
        }
        _normalizeComponentEncoding(components, protocol);
        if (options.reference !== "suffix" && components.scheme) {
          uriTokens.push(components.scheme);
          uriTokens.push(":");
        }
        var authority = _recomposeAuthority(components, options);
        if (authority !== void 0) {
          if (options.reference !== "suffix") {
            uriTokens.push("//");
          }
          uriTokens.push(authority);
          if (components.path && components.path.charAt(0) !== "/") {
            uriTokens.push("/");
          }
        }
        if (components.path !== void 0) {
          var s = components.path;
          if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
            s = removeDotSegments(s);
          }
          if (authority === void 0) {
            s = s.replace(/^\/\//, "/%2F");
          }
          uriTokens.push(s);
        }
        if (components.query !== void 0) {
          uriTokens.push("?");
          uriTokens.push(components.query);
        }
        if (components.fragment !== void 0) {
          uriTokens.push("#");
          uriTokens.push(components.fragment);
        }
        return uriTokens.join("");
      }
      function resolveComponents(base2, relative) {
        var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        var skipNormalization = arguments[3];
        var target = {};
        if (!skipNormalization) {
          base2 = parse(serialize2(base2, options), options);
          relative = parse(serialize2(relative, options), options);
        }
        options = options || {};
        if (!options.tolerant && relative.scheme) {
          target.scheme = relative.scheme;
          target.userinfo = relative.userinfo;
          target.host = relative.host;
          target.port = relative.port;
          target.path = removeDotSegments(relative.path || "");
          target.query = relative.query;
        } else {
          if (relative.userinfo !== void 0 || relative.host !== void 0 || relative.port !== void 0) {
            target.userinfo = relative.userinfo;
            target.host = relative.host;
            target.port = relative.port;
            target.path = removeDotSegments(relative.path || "");
            target.query = relative.query;
          } else {
            if (!relative.path) {
              target.path = base2.path;
              if (relative.query !== void 0) {
                target.query = relative.query;
              } else {
                target.query = base2.query;
              }
            } else {
              if (relative.path.charAt(0) === "/") {
                target.path = removeDotSegments(relative.path);
              } else {
                if ((base2.userinfo !== void 0 || base2.host !== void 0 || base2.port !== void 0) && !base2.path) {
                  target.path = "/" + relative.path;
                } else if (!base2.path) {
                  target.path = relative.path;
                } else {
                  target.path = base2.path.slice(0, base2.path.lastIndexOf("/") + 1) + relative.path;
                }
                target.path = removeDotSegments(target.path);
              }
              target.query = relative.query;
            }
            target.userinfo = base2.userinfo;
            target.host = base2.host;
            target.port = base2.port;
          }
          target.scheme = base2.scheme;
        }
        target.fragment = relative.fragment;
        return target;
      }
      function resolve2(baseURI, relativeURI, options) {
        var schemelessOptions = assign({ scheme: "null" }, options);
        return serialize2(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
      }
      function normalize2(uri2, options) {
        if (typeof uri2 === "string") {
          uri2 = serialize2(parse(uri2, options), options);
        } else if (typeOf(uri2) === "object") {
          uri2 = parse(serialize2(uri2, options), options);
        }
        return uri2;
      }
      function equal3(uriA, uriB, options) {
        if (typeof uriA === "string") {
          uriA = serialize2(parse(uriA, options), options);
        } else if (typeOf(uriA) === "object") {
          uriA = serialize2(uriA, options);
        }
        if (typeof uriB === "string") {
          uriB = serialize2(parse(uriB, options), options);
        } else if (typeOf(uriB) === "object") {
          uriB = serialize2(uriB, options);
        }
        return uriA === uriB;
      }
      function escapeComponent(str, options) {
        return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.ESCAPE : IRI_PROTOCOL.ESCAPE, pctEncChar);
      }
      function unescapeComponent(str, options) {
        return str && str.toString().replace(!options || !options.iri ? URI_PROTOCOL.PCT_ENCODED : IRI_PROTOCOL.PCT_ENCODED, pctDecChars);
      }
      var handler = {
        scheme: "http",
        domainHost: true,
        parse: function parse2(components, options) {
          if (!components.host) {
            components.error = components.error || "HTTP URIs must have a host.";
          }
          return components;
        },
        serialize: function serialize3(components, options) {
          var secure = String(components.scheme).toLowerCase() === "https";
          if (components.port === (secure ? 443 : 80) || components.port === "") {
            components.port = void 0;
          }
          if (!components.path) {
            components.path = "/";
          }
          return components;
        }
      };
      var handler$1 = {
        scheme: "https",
        domainHost: handler.domainHost,
        parse: handler.parse,
        serialize: handler.serialize
      };
      function isSecure(wsComponents) {
        return typeof wsComponents.secure === "boolean" ? wsComponents.secure : String(wsComponents.scheme).toLowerCase() === "wss";
      }
      var handler$2 = {
        scheme: "ws",
        domainHost: true,
        parse: function parse2(components, options) {
          var wsComponents = components;
          wsComponents.secure = isSecure(wsComponents);
          wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : "");
          wsComponents.path = void 0;
          wsComponents.query = void 0;
          return wsComponents;
        },
        serialize: function serialize3(wsComponents, options) {
          if (wsComponents.port === (isSecure(wsComponents) ? 443 : 80) || wsComponents.port === "") {
            wsComponents.port = void 0;
          }
          if (typeof wsComponents.secure === "boolean") {
            wsComponents.scheme = wsComponents.secure ? "wss" : "ws";
            wsComponents.secure = void 0;
          }
          if (wsComponents.resourceName) {
            var _wsComponents$resourc = wsComponents.resourceName.split("?"), _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2), path = _wsComponents$resourc2[0], query = _wsComponents$resourc2[1];
            wsComponents.path = path && path !== "/" ? path : void 0;
            wsComponents.query = query;
            wsComponents.resourceName = void 0;
          }
          wsComponents.fragment = void 0;
          return wsComponents;
        }
      };
      var handler$3 = {
        scheme: "wss",
        domainHost: handler$2.domainHost,
        parse: handler$2.parse,
        serialize: handler$2.serialize
      };
      var O = {};
      var UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]";
      var HEXDIG$$ = "[0-9A-Fa-f]";
      var PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$));
      var ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]";
      var QTEXT$$ = "[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]";
      var VCHAR$$ = merge(QTEXT$$, '[\\"\\\\]');
      var SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]";
      var UNRESERVED = new RegExp(UNRESERVED$$, "g");
      var PCT_ENCODED = new RegExp(PCT_ENCODED$, "g");
      var NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g");
      var NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g");
      var NOT_HFVALUE = NOT_HFNAME;
      function decodeUnreserved(str) {
        var decStr = pctDecChars(str);
        return !decStr.match(UNRESERVED) ? str : decStr;
      }
      var handler$4 = {
        scheme: "mailto",
        parse: function parse$$1(components, options) {
          var mailtoComponents = components;
          var to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
          mailtoComponents.path = void 0;
          if (mailtoComponents.query) {
            var unknownHeaders = false;
            var headers = {};
            var hfields = mailtoComponents.query.split("&");
            for (var x = 0, xl = hfields.length; x < xl; ++x) {
              var hfield = hfields[x].split("=");
              switch (hfield[0]) {
                case "to":
                  var toAddrs = hfield[1].split(",");
                  for (var _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) {
                    to.push(toAddrs[_x]);
                  }
                  break;
                case "subject":
                  mailtoComponents.subject = unescapeComponent(hfield[1], options);
                  break;
                case "body":
                  mailtoComponents.body = unescapeComponent(hfield[1], options);
                  break;
                default:
                  unknownHeaders = true;
                  headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                  break;
              }
            }
            if (unknownHeaders) mailtoComponents.headers = headers;
          }
          mailtoComponents.query = void 0;
          for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
            var addr = to[_x2].split("@");
            addr[0] = unescapeComponent(addr[0]);
            if (!options.unicodeSupport) {
              try {
                addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
              } catch (e2) {
                mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e2;
              }
            } else {
              addr[1] = unescapeComponent(addr[1], options).toLowerCase();
            }
            to[_x2] = addr.join("@");
          }
          return mailtoComponents;
        },
        serialize: function serialize$$1(mailtoComponents, options) {
          var components = mailtoComponents;
          var to = toArray(mailtoComponents.to);
          if (to) {
            for (var x = 0, xl = to.length; x < xl; ++x) {
              var toAddr = String(to[x]);
              var atIdx = toAddr.lastIndexOf("@");
              var localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar);
              var domain = toAddr.slice(atIdx + 1);
              try {
                domain = !options.iri ? punycode.toASCII(unescapeComponent(domain, options).toLowerCase()) : punycode.toUnicode(domain);
              } catch (e2) {
                components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e2;
              }
              to[x] = localPart + "@" + domain;
            }
            components.path = to.join(",");
          }
          var headers = mailtoComponents.headers = mailtoComponents.headers || {};
          if (mailtoComponents.subject) headers["subject"] = mailtoComponents.subject;
          if (mailtoComponents.body) headers["body"] = mailtoComponents.body;
          var fields = [];
          for (var name in headers) {
            if (headers[name] !== O[name]) {
              fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
            }
          }
          if (fields.length) {
            components.query = fields.join("&");
          }
          return components;
        }
      };
      var URN_PARSE = /^([^\:]+)\:(.*)/;
      var handler$5 = {
        scheme: "urn",
        parse: function parse$$1(components, options) {
          var matches2 = components.path && components.path.match(URN_PARSE);
          var urnComponents = components;
          if (matches2) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = matches2[1].toLowerCase();
            var nss = matches2[2];
            var urnScheme = scheme + ":" + (options.nid || nid);
            var schemeHandler = SCHEMES[urnScheme];
            urnComponents.nid = nid;
            urnComponents.nss = nss;
            urnComponents.path = void 0;
            if (schemeHandler) {
              urnComponents = schemeHandler.parse(urnComponents, options);
            }
          } else {
            urnComponents.error = urnComponents.error || "URN can not be parsed.";
          }
          return urnComponents;
        },
        serialize: function serialize$$1(urnComponents, options) {
          var scheme = options.scheme || urnComponents.scheme || "urn";
          var nid = urnComponents.nid;
          var urnScheme = scheme + ":" + (options.nid || nid);
          var schemeHandler = SCHEMES[urnScheme];
          if (schemeHandler) {
            urnComponents = schemeHandler.serialize(urnComponents, options);
          }
          var uriComponents = urnComponents;
          var nss = urnComponents.nss;
          uriComponents.path = (nid || options.nid) + ":" + nss;
          return uriComponents;
        }
      };
      var UUID2 = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/;
      var handler$6 = {
        scheme: "urn:uuid",
        parse: function parse2(urnComponents, options) {
          var uuidComponents = urnComponents;
          uuidComponents.uuid = uuidComponents.nss;
          uuidComponents.nss = void 0;
          if (!options.tolerant && (!uuidComponents.uuid || !uuidComponents.uuid.match(UUID2))) {
            uuidComponents.error = uuidComponents.error || "UUID is not valid.";
          }
          return uuidComponents;
        },
        serialize: function serialize3(uuidComponents, options) {
          var urnComponents = uuidComponents;
          urnComponents.nss = (uuidComponents.uuid || "").toLowerCase();
          return urnComponents;
        }
      };
      SCHEMES[handler.scheme] = handler;
      SCHEMES[handler$1.scheme] = handler$1;
      SCHEMES[handler$2.scheme] = handler$2;
      SCHEMES[handler$3.scheme] = handler$3;
      SCHEMES[handler$4.scheme] = handler$4;
      SCHEMES[handler$5.scheme] = handler$5;
      SCHEMES[handler$6.scheme] = handler$6;
      exports2.SCHEMES = SCHEMES;
      exports2.pctEncChar = pctEncChar;
      exports2.pctDecChars = pctDecChars;
      exports2.parse = parse;
      exports2.removeDotSegments = removeDotSegments;
      exports2.serialize = serialize2;
      exports2.resolveComponents = resolveComponents;
      exports2.resolve = resolve2;
      exports2.normalize = normalize2;
      exports2.equal = equal3;
      exports2.escapeComponent = escapeComponent;
      exports2.unescapeComponent = unescapeComponent;
      Object.defineProperty(exports2, "__esModule", { value: true });
    });
  })(uri_all, uri_all.exports);
  var uri_allExports = uri_all.exports;
  var fastDeepEqual = function equal(a, b2) {
    if (a === b2) return true;
    if (a && b2 && typeof a == "object" && typeof b2 == "object") {
      if (a.constructor !== b2.constructor) return false;
      var length, i, keys7;
      if (Array.isArray(a)) {
        length = a.length;
        if (length != b2.length) return false;
        for (i = length; i-- !== 0; )
          if (!equal(a[i], b2[i])) return false;
        return true;
      }
      if (a.constructor === RegExp) return a.source === b2.source && a.flags === b2.flags;
      if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b2.valueOf();
      if (a.toString !== Object.prototype.toString) return a.toString() === b2.toString();
      keys7 = Object.keys(a);
      length = keys7.length;
      if (length !== Object.keys(b2).length) return false;
      for (i = length; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b2, keys7[i])) return false;
      for (i = length; i-- !== 0; ) {
        var key = keys7[i];
        if (!equal(a[key], b2[key])) return false;
      }
      return true;
    }
    return a !== a && b2 !== b2;
  };
  var ucs2length$1 = function ucs2length(str) {
    var length = 0, len = str.length, pos = 0, value;
    while (pos < len) {
      length++;
      value = str.charCodeAt(pos++);
      if (value >= 55296 && value <= 56319 && pos < len) {
        value = str.charCodeAt(pos);
        if ((value & 64512) == 56320) pos++;
      }
    }
    return length;
  };
  var util$5 = {
    copy: copy$2,
    checkDataType,
    checkDataTypes,
    coerceToTypes,
    toHash: toHash$1,
    getProperty,
    escapeQuotes,
    equal: fastDeepEqual,
    ucs2length: ucs2length$1,
    varOccurences,
    varReplace,
    schemaHasRules,
    schemaHasRulesExcept,
    schemaUnknownRules,
    toQuotedString,
    getPathExpr,
    getPath,
    getData,
    unescapeFragment,
    unescapeJsonPointer,
    escapeFragment,
    escapeJsonPointer
  };
  function copy$2(o, to) {
    to = to || {};
    for (var key in o) to[key] = o[key];
    return to;
  }
  function checkDataType(dataType, data2, strictNumbers, negate) {
    var EQUAL = negate ? " !== " : " === ", AND = negate ? " || " : " && ", OK2 = negate ? "!" : "", NOT = negate ? "" : "!";
    switch (dataType) {
      case "null":
        return data2 + EQUAL + "null";
      case "array":
        return OK2 + "Array.isArray(" + data2 + ")";
      case "object":
        return "(" + OK2 + data2 + AND + "typeof " + data2 + EQUAL + '"object"' + AND + NOT + "Array.isArray(" + data2 + "))";
      case "integer":
        return "(typeof " + data2 + EQUAL + '"number"' + AND + NOT + "(" + data2 + " % 1)" + AND + data2 + EQUAL + data2 + (strictNumbers ? AND + OK2 + "isFinite(" + data2 + ")" : "") + ")";
      case "number":
        return "(typeof " + data2 + EQUAL + '"' + dataType + '"' + (strictNumbers ? AND + OK2 + "isFinite(" + data2 + ")" : "") + ")";
      default:
        return "typeof " + data2 + EQUAL + '"' + dataType + '"';
    }
  }
  function checkDataTypes(dataTypes, data2, strictNumbers) {
    switch (dataTypes.length) {
      case 1:
        return checkDataType(dataTypes[0], data2, strictNumbers, true);
      default:
        var code = "";
        var types = toHash$1(dataTypes);
        if (types.array && types.object) {
          code = types.null ? "(" : "(!" + data2 + " || ";
          code += "typeof " + data2 + ' !== "object")';
          delete types.null;
          delete types.array;
          delete types.object;
        }
        if (types.number) delete types.integer;
        for (var t in types)
          code += (code ? " && " : "") + checkDataType(t, data2, strictNumbers, true);
        return code;
    }
  }
  var COERCE_TO_TYPES = toHash$1(["string", "number", "integer", "boolean", "null"]);
  function coerceToTypes(optionCoerceTypes, dataTypes) {
    if (Array.isArray(dataTypes)) {
      var types = [];
      for (var i = 0; i < dataTypes.length; i++) {
        var t = dataTypes[i];
        if (COERCE_TO_TYPES[t]) types[types.length] = t;
        else if (optionCoerceTypes === "array" && t === "array") types[types.length] = t;
      }
      if (types.length) return types;
    } else if (COERCE_TO_TYPES[dataTypes]) {
      return [dataTypes];
    } else if (optionCoerceTypes === "array" && dataTypes === "array") {
      return ["array"];
    }
  }
  function toHash$1(arr) {
    var hash = {};
    for (var i = 0; i < arr.length; i++) hash[arr[i]] = true;
    return hash;
  }
  var IDENTIFIER$1 = /^[a-z$_][a-z$_0-9]*$/i;
  var SINGLE_QUOTE = /'|\\/g;
  function getProperty(key) {
    return typeof key == "number" ? "[" + key + "]" : IDENTIFIER$1.test(key) ? "." + key : "['" + escapeQuotes(key) + "']";
  }
  function escapeQuotes(str) {
    return str.replace(SINGLE_QUOTE, "\\$&").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\f/g, "\\f").replace(/\t/g, "\\t");
  }
  function varOccurences(str, dataVar) {
    dataVar += "[^0-9]";
    var matches2 = str.match(new RegExp(dataVar, "g"));
    return matches2 ? matches2.length : 0;
  }
  function varReplace(str, dataVar, expr) {
    dataVar += "([^0-9])";
    expr = expr.replace(/\$/g, "$$$$");
    return str.replace(new RegExp(dataVar, "g"), expr + "$1");
  }
  function schemaHasRules(schema, rules3) {
    if (typeof schema == "boolean") return !schema;
    for (var key in schema) if (rules3[key]) return true;
  }
  function schemaHasRulesExcept(schema, rules3, exceptKeyword) {
    if (typeof schema == "boolean") return !schema && exceptKeyword != "not";
    for (var key in schema) if (key != exceptKeyword && rules3[key]) return true;
  }
  function schemaUnknownRules(schema, rules3) {
    if (typeof schema == "boolean") return;
    for (var key in schema) if (!rules3[key]) return key;
  }
  function toQuotedString(str) {
    return "'" + escapeQuotes(str) + "'";
  }
  function getPathExpr(currentPath, expr, jsonPointers, isNumber) {
    var path = jsonPointers ? "'/' + " + expr + (isNumber ? "" : ".replace(/~/g, '~0').replace(/\\//g, '~1')") : isNumber ? "'[' + " + expr + " + ']'" : "'[\\'' + " + expr + " + '\\']'";
    return joinPaths(currentPath, path);
  }
  function getPath(currentPath, prop, jsonPointers) {
    var path = jsonPointers ? toQuotedString("/" + escapeJsonPointer(prop)) : toQuotedString(getProperty(prop));
    return joinPaths(currentPath, path);
  }
  var JSON_POINTER$1 = /^\/(?:[^~]|~0|~1)*$/;
  var RELATIVE_JSON_POINTER$1 = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
  function getData($data, lvl, paths) {
    var up, jsonPointer, data2, matches2;
    if ($data === "") return "rootData";
    if ($data[0] == "/") {
      if (!JSON_POINTER$1.test($data)) throw new Error("Invalid JSON-pointer: " + $data);
      jsonPointer = $data;
      data2 = "rootData";
    } else {
      matches2 = $data.match(RELATIVE_JSON_POINTER$1);
      if (!matches2) throw new Error("Invalid JSON-pointer: " + $data);
      up = +matches2[1];
      jsonPointer = matches2[2];
      if (jsonPointer == "#") {
        if (up >= lvl) throw new Error("Cannot access property/index " + up + " levels up, current level is " + lvl);
        return paths[lvl - up];
      }
      if (up > lvl) throw new Error("Cannot access data " + up + " levels up, current level is " + lvl);
      data2 = "data" + (lvl - up || "");
      if (!jsonPointer) return data2;
    }
    var expr = data2;
    var segments = jsonPointer.split("/");
    for (var i = 0; i < segments.length; i++) {
      var segment = segments[i];
      if (segment) {
        data2 += getProperty(unescapeJsonPointer(segment));
        expr += " && " + data2;
      }
    }
    return expr;
  }
  function joinPaths(a, b2) {
    if (a == '""') return b2;
    return (a + " + " + b2).replace(/([^\\])' \+ '/g, "$1");
  }
  function unescapeFragment(str) {
    return unescapeJsonPointer(decodeURIComponent(str));
  }
  function escapeFragment(str) {
    return encodeURIComponent(escapeJsonPointer(str));
  }
  function escapeJsonPointer(str) {
    return str.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function unescapeJsonPointer(str) {
    return str.replace(/~1/g, "/").replace(/~0/g, "~");
  }
  var util$4 = util$5;
  var schema_obj = SchemaObject$2;
  function SchemaObject$2(obj) {
    util$4.copy(obj, this);
  }
  var jsonSchemaTraverse = { exports: {} };
  var traverse$1 = jsonSchemaTraverse.exports = function(schema, opts, cb) {
    if (typeof opts == "function") {
      cb = opts;
      opts = {};
    }
    cb = opts.cb || cb;
    var pre = typeof cb == "function" ? cb : cb.pre || function() {
    };
    var post = cb.post || function() {
    };
    _traverse(opts, pre, post, schema, "", schema);
  };
  traverse$1.keywords = {
    additionalItems: true,
    items: true,
    contains: true,
    additionalProperties: true,
    propertyNames: true,
    not: true
  };
  traverse$1.arrayKeywords = {
    items: true,
    allOf: true,
    anyOf: true,
    oneOf: true
  };
  traverse$1.propsKeywords = {
    definitions: true,
    properties: true,
    patternProperties: true,
    dependencies: true
  };
  traverse$1.skipKeywords = {
    default: true,
    enum: true,
    const: true,
    required: true,
    maximum: true,
    minimum: true,
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    multipleOf: true,
    maxLength: true,
    minLength: true,
    pattern: true,
    format: true,
    maxItems: true,
    minItems: true,
    uniqueItems: true,
    maxProperties: true,
    minProperties: true
  };
  function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
    if (schema && typeof schema == "object" && !Array.isArray(schema)) {
      pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
      for (var key in schema) {
        var sch = schema[key];
        if (Array.isArray(sch)) {
          if (key in traverse$1.arrayKeywords) {
            for (var i = 0; i < sch.length; i++)
              _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
          }
        } else if (key in traverse$1.propsKeywords) {
          if (sch && typeof sch == "object") {
            for (var prop in sch)
              _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
          }
        } else if (key in traverse$1.keywords || opts.allKeys && !(key in traverse$1.skipKeywords)) {
          _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
        }
      }
      post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
    }
  }
  function escapeJsonPtr(str) {
    return str.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  var jsonSchemaTraverseExports = jsonSchemaTraverse.exports;
  var URI$1 = uri_allExports, equal$1 = fastDeepEqual, util$3 = util$5, SchemaObject$1 = schema_obj, traverse = jsonSchemaTraverseExports;
  var resolve_1 = resolve$3;
  resolve$3.normalizeId = normalizeId;
  resolve$3.fullPath = getFullPath;
  resolve$3.url = resolveUrl;
  resolve$3.ids = resolveIds;
  resolve$3.inlineRef = inlineRef;
  resolve$3.schema = resolveSchema;
  function resolve$3(compile2, root, ref2) {
    var refVal = this._refs[ref2];
    if (typeof refVal == "string") {
      if (this._refs[refVal]) refVal = this._refs[refVal];
      else return resolve$3.call(this, compile2, root, refVal);
    }
    refVal = refVal || this._schemas[ref2];
    if (refVal instanceof SchemaObject$1) {
      return inlineRef(refVal.schema, this._opts.inlineRefs) ? refVal.schema : refVal.validate || this._compile(refVal);
    }
    var res = resolveSchema.call(this, root, ref2);
    var schema, v2, baseId;
    if (res) {
      schema = res.schema;
      root = res.root;
      baseId = res.baseId;
    }
    if (schema instanceof SchemaObject$1) {
      v2 = schema.validate || compile2.call(this, schema.schema, root, void 0, baseId);
    } else if (schema !== void 0) {
      v2 = inlineRef(schema, this._opts.inlineRefs) ? schema : compile2.call(this, schema, root, void 0, baseId);
    }
    return v2;
  }
  function resolveSchema(root, ref2) {
    var p3 = URI$1.parse(ref2), refPath = _getFullPath(p3), baseId = getFullPath(this._getId(root.schema));
    if (Object.keys(root.schema).length === 0 || refPath !== baseId) {
      var id = normalizeId(refPath);
      var refVal = this._refs[id];
      if (typeof refVal == "string") {
        return resolveRecursive.call(this, root, refVal, p3);
      } else if (refVal instanceof SchemaObject$1) {
        if (!refVal.validate) this._compile(refVal);
        root = refVal;
      } else {
        refVal = this._schemas[id];
        if (refVal instanceof SchemaObject$1) {
          if (!refVal.validate) this._compile(refVal);
          if (id == normalizeId(ref2))
            return { schema: refVal, root, baseId };
          root = refVal;
        } else {
          return;
        }
      }
      if (!root.schema) return;
      baseId = getFullPath(this._getId(root.schema));
    }
    return getJsonPointer.call(this, p3, baseId, root.schema, root);
  }
  function resolveRecursive(root, ref2, parsedRef) {
    var res = resolveSchema.call(this, root, ref2);
    if (res) {
      var schema = res.schema;
      var baseId = res.baseId;
      root = res.root;
      var id = this._getId(schema);
      if (id) baseId = resolveUrl(baseId, id);
      return getJsonPointer.call(this, parsedRef, baseId, schema, root);
    }
  }
  var PREVENT_SCOPE_CHANGE = util$3.toHash(["properties", "patternProperties", "enum", "dependencies", "definitions"]);
  function getJsonPointer(parsedRef, baseId, schema, root) {
    parsedRef.fragment = parsedRef.fragment || "";
    if (parsedRef.fragment.slice(0, 1) != "/") return;
    var parts = parsedRef.fragment.split("/");
    for (var i = 1; i < parts.length; i++) {
      var part = parts[i];
      if (part) {
        part = util$3.unescapeFragment(part);
        schema = schema[part];
        if (schema === void 0) break;
        var id;
        if (!PREVENT_SCOPE_CHANGE[part]) {
          id = this._getId(schema);
          if (id) baseId = resolveUrl(baseId, id);
          if (schema.$ref) {
            var $ref = resolveUrl(baseId, schema.$ref);
            var res = resolveSchema.call(this, root, $ref);
            if (res) {
              schema = res.schema;
              root = res.root;
              baseId = res.baseId;
            }
          }
        }
      }
    }
    if (schema !== void 0 && schema !== root.schema)
      return { schema, root, baseId };
  }
  var SIMPLE_INLINED = util$3.toHash([
    "type",
    "format",
    "pattern",
    "maxLength",
    "minLength",
    "maxProperties",
    "minProperties",
    "maxItems",
    "minItems",
    "maximum",
    "minimum",
    "uniqueItems",
    "multipleOf",
    "required",
    "enum"
  ]);
  function inlineRef(schema, limit) {
    if (limit === false) return false;
    if (limit === void 0 || limit === true) return checkNoRef(schema);
    else if (limit) return countKeys(schema) <= limit;
  }
  function checkNoRef(schema) {
    var item;
    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) {
        item = schema[i];
        if (typeof item == "object" && !checkNoRef(item)) return false;
      }
    } else {
      for (var key in schema) {
        if (key == "$ref") return false;
        item = schema[key];
        if (typeof item == "object" && !checkNoRef(item)) return false;
      }
    }
    return true;
  }
  function countKeys(schema) {
    var count = 0, item;
    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) {
        item = schema[i];
        if (typeof item == "object") count += countKeys(item);
        if (count == Infinity) return Infinity;
      }
    } else {
      for (var key in schema) {
        if (key == "$ref") return Infinity;
        if (SIMPLE_INLINED[key]) {
          count++;
        } else {
          item = schema[key];
          if (typeof item == "object") count += countKeys(item) + 1;
          if (count == Infinity) return Infinity;
        }
      }
    }
    return count;
  }
  function getFullPath(id, normalize2) {
    if (normalize2 !== false) id = normalizeId(id);
    var p3 = URI$1.parse(id);
    return _getFullPath(p3);
  }
  function _getFullPath(p3) {
    return URI$1.serialize(p3).split("#")[0] + "#";
  }
  var TRAILING_SLASH_HASH = /#\/?$/;
  function normalizeId(id) {
    return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
  }
  function resolveUrl(baseId, id) {
    id = normalizeId(id);
    return URI$1.resolve(baseId, id);
  }
  function resolveIds(schema) {
    var schemaId = normalizeId(this._getId(schema));
    var baseIds = { "": schemaId };
    var fullPaths = { "": getFullPath(schemaId, false) };
    var localRefs = {};
    var self2 = this;
    traverse(schema, { allKeys: true }, function(sch, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
      if (jsonPtr === "") return;
      var id = self2._getId(sch);
      var baseId = baseIds[parentJsonPtr];
      var fullPath = fullPaths[parentJsonPtr] + "/" + parentKeyword;
      if (keyIndex !== void 0)
        fullPath += "/" + (typeof keyIndex == "number" ? keyIndex : util$3.escapeFragment(keyIndex));
      if (typeof id == "string") {
        id = baseId = normalizeId(baseId ? URI$1.resolve(baseId, id) : id);
        var refVal = self2._refs[id];
        if (typeof refVal == "string") refVal = self2._refs[refVal];
        if (refVal && refVal.schema) {
          if (!equal$1(sch, refVal.schema))
            throw new Error('id "' + id + '" resolves to more than one schema');
        } else if (id != normalizeId(fullPath)) {
          if (id[0] == "#") {
            if (localRefs[id] && !equal$1(sch, localRefs[id]))
              throw new Error('id "' + id + '" resolves to more than one schema');
            localRefs[id] = sch;
          } else {
            self2._refs[id] = fullPath;
          }
        }
      }
      baseIds[jsonPtr] = baseId;
      fullPaths[jsonPtr] = fullPath;
    });
    return localRefs;
  }
  var resolve$2 = resolve_1;
  var error_classes = {
    Validation: errorSubclass(ValidationError$1),
    MissingRef: errorSubclass(MissingRefError$1)
  };
  function ValidationError$1(errors) {
    this.message = "validation failed";
    this.errors = errors;
    this.ajv = this.validation = true;
  }
  MissingRefError$1.message = function(baseId, ref2) {
    return "can't resolve reference " + ref2 + " from id " + baseId;
  };
  function MissingRefError$1(baseId, ref2, message) {
    this.message = message || MissingRefError$1.message(baseId, ref2);
    this.missingRef = resolve$2.url(baseId, ref2);
    this.missingSchema = resolve$2.normalizeId(resolve$2.fullPath(this.missingRef));
  }
  function errorSubclass(Subclass) {
    Subclass.prototype = Object.create(Error.prototype);
    Subclass.prototype.constructor = Subclass;
    return Subclass;
  }
  var fastJsonStableStringify = function(data2, opts) {
    if (!opts) opts = {};
    if (typeof opts === "function") opts = { cmp: opts };
    var cycles = typeof opts.cycles === "boolean" ? opts.cycles : false;
    var cmp = opts.cmp && /* @__PURE__ */ function(f2) {
      return function(node) {
        return function(a, b2) {
          var aobj = { key: a, value: node[a] };
          var bobj = { key: b2, value: node[b2] };
          return f2(aobj, bobj);
        };
      };
    }(opts.cmp);
    var seen = [];
    return function stringify(node) {
      if (node && node.toJSON && typeof node.toJSON === "function") {
        node = node.toJSON();
      }
      if (node === void 0) return;
      if (typeof node == "number") return isFinite(node) ? "" + node : "null";
      if (typeof node !== "object") return JSON.stringify(node);
      var i, out;
      if (Array.isArray(node)) {
        out = "[";
        for (i = 0; i < node.length; i++) {
          if (i) out += ",";
          out += stringify(node[i]) || "null";
        }
        return out + "]";
      }
      if (node === null) return "null";
      if (seen.indexOf(node) !== -1) {
        if (cycles) return JSON.stringify("__cycle__");
        throw new TypeError("Converting circular structure to JSON");
      }
      var seenIndex = seen.push(node) - 1;
      var keys7 = Object.keys(node).sort(cmp && cmp(node));
      out = "";
      for (i = 0; i < keys7.length; i++) {
        var key = keys7[i];
        var value = stringify(node[key]);
        if (!value) continue;
        if (out) out += ",";
        out += JSON.stringify(key) + ":" + value;
      }
      seen.splice(seenIndex, 1);
      return "{" + out + "}";
    }(data2);
  };
  var validate$1 = function generate_validate(it, $keyword, $ruleType) {
    var out = "";
    var $async = it.schema.$async === true, $refKeywords = it.util.schemaHasRulesExcept(it.schema, it.RULES.all, "$ref"), $id2 = it.self._getId(it.schema);
    if (it.opts.strictKeywords) {
      var $unknownKwd = it.util.schemaUnknownRules(it.schema, it.RULES.keywords);
      if ($unknownKwd) {
        var $keywordsMsg = "unknown keyword: " + $unknownKwd;
        if (it.opts.strictKeywords === "log") it.logger.warn($keywordsMsg);
        else throw new Error($keywordsMsg);
      }
    }
    if (it.isTop) {
      out += " var validate = ";
      if ($async) {
        it.async = true;
        out += "async ";
      }
      out += "function(data, dataPath, parentData, parentDataProperty, rootData) { 'use strict'; ";
      if ($id2 && (it.opts.sourceCode || it.opts.processCode)) {
        out += " " + ("/*# sourceURL=" + $id2 + " */") + " ";
      }
    }
    if (typeof it.schema == "boolean" || !($refKeywords || it.schema.$ref)) {
      var $keyword = "false schema";
      var $lvl = it.level;
      var $dataLvl = it.dataLevel;
      var $schema2 = it.schema[$keyword];
      var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
      var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
      var $breakOnError = !it.opts.allErrors;
      var $errorKeyword;
      var $data = "data" + ($dataLvl || "");
      var $valid = "valid" + $lvl;
      if (it.schema === false) {
        if (it.isTop) {
          $breakOnError = true;
        } else {
          out += " var " + $valid + " = false; ";
        }
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: '" + ($errorKeyword || "false schema") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
          if (it.opts.messages !== false) {
            out += " , message: 'boolean schema is false' ";
          }
          if (it.opts.verbose) {
            out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
      } else {
        if (it.isTop) {
          if ($async) {
            out += " return data; ";
          } else {
            out += " validate.errors = null; return true; ";
          }
        } else {
          out += " var " + $valid + " = true; ";
        }
      }
      if (it.isTop) {
        out += " }; return validate; ";
      }
      return out;
    }
    if (it.isTop) {
      var $top = it.isTop, $lvl = it.level = 0, $dataLvl = it.dataLevel = 0, $data = "data";
      it.rootId = it.resolve.fullPath(it.self._getId(it.root.schema));
      it.baseId = it.baseId || it.rootId;
      delete it.isTop;
      it.dataPathArr = [""];
      if (it.schema.default !== void 0 && it.opts.useDefaults && it.opts.strictDefaults) {
        var $defaultMsg = "default is ignored in the schema root";
        if (it.opts.strictDefaults === "log") it.logger.warn($defaultMsg);
        else throw new Error($defaultMsg);
      }
      out += " var vErrors = null; ";
      out += " var errors = 0;     ";
      out += " if (rootData === undefined) rootData = data; ";
    } else {
      var $lvl = it.level, $dataLvl = it.dataLevel, $data = "data" + ($dataLvl || "");
      if ($id2) it.baseId = it.resolve.url(it.baseId, $id2);
      if ($async && !it.async) throw new Error("async schema in sync schema");
      out += " var errs_" + $lvl + " = errors;";
    }
    var $valid = "valid" + $lvl, $breakOnError = !it.opts.allErrors, $closingBraces1 = "", $closingBraces2 = "";
    var $errorKeyword;
    var $typeSchema = it.schema.type, $typeIsArray = Array.isArray($typeSchema);
    if ($typeSchema && it.opts.nullable && it.schema.nullable === true) {
      if ($typeIsArray) {
        if ($typeSchema.indexOf("null") == -1) $typeSchema = $typeSchema.concat("null");
      } else if ($typeSchema != "null") {
        $typeSchema = [$typeSchema, "null"];
        $typeIsArray = true;
      }
    }
    if ($typeIsArray && $typeSchema.length == 1) {
      $typeSchema = $typeSchema[0];
      $typeIsArray = false;
    }
    if (it.schema.$ref && $refKeywords) {
      if (it.opts.extendRefs == "fail") {
        throw new Error('$ref: validation keywords used in schema at path "' + it.errSchemaPath + '" (see option extendRefs)');
      } else if (it.opts.extendRefs !== true) {
        $refKeywords = false;
        it.logger.warn('$ref: keywords ignored in schema at path "' + it.errSchemaPath + '"');
      }
    }
    if (it.schema.$comment && it.opts.$comment) {
      out += " " + it.RULES.all.$comment.code(it, "$comment");
    }
    if ($typeSchema) {
      if (it.opts.coerceTypes) {
        var $coerceToTypes = it.util.coerceToTypes(it.opts.coerceTypes, $typeSchema);
      }
      var $rulesGroup = it.RULES.types[$typeSchema];
      if ($coerceToTypes || $typeIsArray || $rulesGroup === true || $rulesGroup && !$shouldUseGroup($rulesGroup)) {
        var $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type";
        var $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type", $method = $typeIsArray ? "checkDataTypes" : "checkDataType";
        out += " if (" + it.util[$method]($typeSchema, $data, it.opts.strictNumbers, true) + ") { ";
        if ($coerceToTypes) {
          var $dataType = "dataType" + $lvl, $coerced = "coerced" + $lvl;
          out += " var " + $dataType + " = typeof " + $data + "; var " + $coerced + " = undefined; ";
          if (it.opts.coerceTypes == "array") {
            out += " if (" + $dataType + " == 'object' && Array.isArray(" + $data + ") && " + $data + ".length == 1) { " + $data + " = " + $data + "[0]; " + $dataType + " = typeof " + $data + "; if (" + it.util.checkDataType(it.schema.type, $data, it.opts.strictNumbers) + ") " + $coerced + " = " + $data + "; } ";
          }
          out += " if (" + $coerced + " !== undefined) ; ";
          var arr1 = $coerceToTypes;
          if (arr1) {
            var $type, $i = -1, l1 = arr1.length - 1;
            while ($i < l1) {
              $type = arr1[$i += 1];
              if ($type == "string") {
                out += " else if (" + $dataType + " == 'number' || " + $dataType + " == 'boolean') " + $coerced + " = '' + " + $data + "; else if (" + $data + " === null) " + $coerced + " = ''; ";
              } else if ($type == "number" || $type == "integer") {
                out += " else if (" + $dataType + " == 'boolean' || " + $data + " === null || (" + $dataType + " == 'string' && " + $data + " && " + $data + " == +" + $data + " ";
                if ($type == "integer") {
                  out += " && !(" + $data + " % 1)";
                }
                out += ")) " + $coerced + " = +" + $data + "; ";
              } else if ($type == "boolean") {
                out += " else if (" + $data + " === 'false' || " + $data + " === 0 || " + $data + " === null) " + $coerced + " = false; else if (" + $data + " === 'true' || " + $data + " === 1) " + $coerced + " = true; ";
              } else if ($type == "null") {
                out += " else if (" + $data + " === '' || " + $data + " === 0 || " + $data + " === false) " + $coerced + " = null; ";
              } else if (it.opts.coerceTypes == "array" && $type == "array") {
                out += " else if (" + $dataType + " == 'string' || " + $dataType + " == 'number' || " + $dataType + " == 'boolean' || " + $data + " == null) " + $coerced + " = [" + $data + "]; ";
              }
            }
          }
          out += " else {   ";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: '" + ($errorKeyword || "type") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '";
            if ($typeIsArray) {
              out += "" + $typeSchema.join(",");
            } else {
              out += "" + $typeSchema;
            }
            out += "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should be ";
              if ($typeIsArray) {
                out += "" + $typeSchema.join(",");
              } else {
                out += "" + $typeSchema;
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } if (" + $coerced + " !== undefined) {  ";
          var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty";
          out += " " + $data + " = " + $coerced + "; ";
          if (!$dataLvl) {
            out += "if (" + $parentData + " !== undefined)";
          }
          out += " " + $parentData + "[" + $parentDataProperty + "] = " + $coerced + "; } ";
        } else {
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: '" + ($errorKeyword || "type") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '";
            if ($typeIsArray) {
              out += "" + $typeSchema.join(",");
            } else {
              out += "" + $typeSchema;
            }
            out += "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should be ";
              if ($typeIsArray) {
                out += "" + $typeSchema.join(",");
              } else {
                out += "" + $typeSchema;
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
        }
        out += " } ";
      }
    }
    if (it.schema.$ref && !$refKeywords) {
      out += " " + it.RULES.all.$ref.code(it, "$ref") + " ";
      if ($breakOnError) {
        out += " } if (errors === ";
        if ($top) {
          out += "0";
        } else {
          out += "errs_" + $lvl;
        }
        out += ") { ";
        $closingBraces2 += "}";
      }
    } else {
      var arr2 = it.RULES;
      if (arr2) {
        var $rulesGroup, i2 = -1, l2 = arr2.length - 1;
        while (i2 < l2) {
          $rulesGroup = arr2[i2 += 1];
          if ($shouldUseGroup($rulesGroup)) {
            if ($rulesGroup.type) {
              out += " if (" + it.util.checkDataType($rulesGroup.type, $data, it.opts.strictNumbers) + ") { ";
            }
            if (it.opts.useDefaults) {
              if ($rulesGroup.type == "object" && it.schema.properties) {
                var $schema2 = it.schema.properties, $schemaKeys = Object.keys($schema2);
                var arr3 = $schemaKeys;
                if (arr3) {
                  var $propertyKey, i3 = -1, l3 = arr3.length - 1;
                  while (i3 < l3) {
                    $propertyKey = arr3[i3 += 1];
                    var $sch = $schema2[$propertyKey];
                    if ($sch.default !== void 0) {
                      var $passData = $data + it.util.getProperty($propertyKey);
                      if (it.compositeRule) {
                        if (it.opts.strictDefaults) {
                          var $defaultMsg = "default is ignored for: " + $passData;
                          if (it.opts.strictDefaults === "log") it.logger.warn($defaultMsg);
                          else throw new Error($defaultMsg);
                        }
                      } else {
                        out += " if (" + $passData + " === undefined ";
                        if (it.opts.useDefaults == "empty") {
                          out += " || " + $passData + " === null || " + $passData + " === '' ";
                        }
                        out += " ) " + $passData + " = ";
                        if (it.opts.useDefaults == "shared") {
                          out += " " + it.useDefault($sch.default) + " ";
                        } else {
                          out += " " + JSON.stringify($sch.default) + " ";
                        }
                        out += "; ";
                      }
                    }
                  }
                }
              } else if ($rulesGroup.type == "array" && Array.isArray(it.schema.items)) {
                var arr4 = it.schema.items;
                if (arr4) {
                  var $sch, $i = -1, l4 = arr4.length - 1;
                  while ($i < l4) {
                    $sch = arr4[$i += 1];
                    if ($sch.default !== void 0) {
                      var $passData = $data + "[" + $i + "]";
                      if (it.compositeRule) {
                        if (it.opts.strictDefaults) {
                          var $defaultMsg = "default is ignored for: " + $passData;
                          if (it.opts.strictDefaults === "log") it.logger.warn($defaultMsg);
                          else throw new Error($defaultMsg);
                        }
                      } else {
                        out += " if (" + $passData + " === undefined ";
                        if (it.opts.useDefaults == "empty") {
                          out += " || " + $passData + " === null || " + $passData + " === '' ";
                        }
                        out += " ) " + $passData + " = ";
                        if (it.opts.useDefaults == "shared") {
                          out += " " + it.useDefault($sch.default) + " ";
                        } else {
                          out += " " + JSON.stringify($sch.default) + " ";
                        }
                        out += "; ";
                      }
                    }
                  }
                }
              }
            }
            var arr5 = $rulesGroup.rules;
            if (arr5) {
              var $rule, i5 = -1, l5 = arr5.length - 1;
              while (i5 < l5) {
                $rule = arr5[i5 += 1];
                if ($shouldUseRule($rule)) {
                  var $code = $rule.code(it, $rule.keyword, $rulesGroup.type);
                  if ($code) {
                    out += " " + $code + " ";
                    if ($breakOnError) {
                      $closingBraces1 += "}";
                    }
                  }
                }
              }
            }
            if ($breakOnError) {
              out += " " + $closingBraces1 + " ";
              $closingBraces1 = "";
            }
            if ($rulesGroup.type) {
              out += " } ";
              if ($typeSchema && $typeSchema === $rulesGroup.type && !$coerceToTypes) {
                out += " else { ";
                var $schemaPath = it.schemaPath + ".type", $errSchemaPath = it.errSchemaPath + "/type";
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = "";
                if (it.createErrors !== false) {
                  out += " { keyword: '" + ($errorKeyword || "type") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { type: '";
                  if ($typeIsArray) {
                    out += "" + $typeSchema.join(",");
                  } else {
                    out += "" + $typeSchema;
                  }
                  out += "' } ";
                  if (it.opts.messages !== false) {
                    out += " , message: 'should be ";
                    if ($typeIsArray) {
                      out += "" + $typeSchema.join(",");
                    } else {
                      out += "" + $typeSchema;
                    }
                    out += "' ";
                  }
                  if (it.opts.verbose) {
                    out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                  }
                  out += " } ";
                } else {
                  out += " {} ";
                }
                var __err = out;
                out = $$outStack.pop();
                if (!it.compositeRule && $breakOnError) {
                  if (it.async) {
                    out += " throw new ValidationError([" + __err + "]); ";
                  } else {
                    out += " validate.errors = [" + __err + "]; return false; ";
                  }
                } else {
                  out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                }
                out += " } ";
              }
            }
            if ($breakOnError) {
              out += " if (errors === ";
              if ($top) {
                out += "0";
              } else {
                out += "errs_" + $lvl;
              }
              out += ") { ";
              $closingBraces2 += "}";
            }
          }
        }
      }
    }
    if ($breakOnError) {
      out += " " + $closingBraces2 + " ";
    }
    if ($top) {
      if ($async) {
        out += " if (errors === 0) return data;           ";
        out += " else throw new ValidationError(vErrors); ";
      } else {
        out += " validate.errors = vErrors; ";
        out += " return errors === 0;       ";
      }
      out += " }; return validate;";
    } else {
      out += " var " + $valid + " = errors === errs_" + $lvl + ";";
    }
    function $shouldUseGroup($rulesGroup2) {
      var rules3 = $rulesGroup2.rules;
      for (var i = 0; i < rules3.length; i++)
        if ($shouldUseRule(rules3[i])) return true;
    }
    function $shouldUseRule($rule2) {
      return it.schema[$rule2.keyword] !== void 0 || $rule2.implements && $ruleImplementsSomeKeyword($rule2);
    }
    function $ruleImplementsSomeKeyword($rule2) {
      var impl = $rule2.implements;
      for (var i = 0; i < impl.length; i++)
        if (it.schema[impl[i]] !== void 0) return true;
    }
    return out;
  };
  var resolve$1 = resolve_1, util$2 = util$5, errorClasses$1 = error_classes, stableStringify$1 = fastJsonStableStringify;
  var validateGenerator = validate$1;
  var ucs2length2 = util$2.ucs2length;
  var equal2 = fastDeepEqual;
  var ValidationError = errorClasses$1.Validation;
  var compile_1 = compile$1;
  function compile$1(schema, root, localRefs, baseId) {
    var self2 = this, opts = this._opts, refVal = [void 0], refs = {}, patterns = [], patternsHash = {}, defaults = [], defaultsHash = {}, customRules = [];
    root = root || { schema, refVal, refs };
    var c2 = checkCompiling.call(this, schema, root, baseId);
    var compilation = this._compilations[c2.index];
    if (c2.compiling) return compilation.callValidate = callValidate;
    var formats2 = this._formats;
    var RULES = this.RULES;
    try {
      var v2 = localCompile(schema, root, localRefs, baseId);
      compilation.validate = v2;
      var cv = compilation.callValidate;
      if (cv) {
        cv.schema = v2.schema;
        cv.errors = null;
        cv.refs = v2.refs;
        cv.refVal = v2.refVal;
        cv.root = v2.root;
        cv.$async = v2.$async;
        if (opts.sourceCode) cv.source = v2.source;
      }
      return v2;
    } finally {
      endCompiling.call(this, schema, root, baseId);
    }
    function callValidate() {
      var validate2 = compilation.validate;
      var result = validate2.apply(this, arguments);
      callValidate.errors = validate2.errors;
      return result;
    }
    function localCompile(_schema, _root, localRefs2, baseId2) {
      var isRoot = !_root || _root && _root.schema == _schema;
      if (_root.schema != root.schema)
        return compile$1.call(self2, _schema, _root, localRefs2, baseId2);
      var $async = _schema.$async === true;
      var sourceCode = validateGenerator({
        isTop: true,
        schema: _schema,
        isRoot,
        baseId: baseId2,
        root: _root,
        schemaPath: "",
        errSchemaPath: "#",
        errorPath: '""',
        MissingRefError: errorClasses$1.MissingRef,
        RULES,
        validate: validateGenerator,
        util: util$2,
        resolve: resolve$1,
        resolveRef,
        usePattern,
        useDefault,
        useCustomRule,
        opts,
        formats: formats2,
        logger: self2.logger,
        self: self2
      });
      sourceCode = vars(refVal, refValCode) + vars(patterns, patternCode) + vars(defaults, defaultCode) + vars(customRules, customRuleCode$1) + sourceCode;
      if (opts.processCode) sourceCode = opts.processCode(sourceCode, _schema);
      var validate2;
      try {
        var makeValidate = new Function(
          "self",
          "RULES",
          "formats",
          "root",
          "refVal",
          "defaults",
          "customRules",
          "equal",
          "ucs2length",
          "ValidationError",
          sourceCode
        );
        validate2 = makeValidate(
          self2,
          RULES,
          formats2,
          root,
          refVal,
          defaults,
          customRules,
          equal2,
          ucs2length2,
          ValidationError
        );
        refVal[0] = validate2;
      } catch (e2) {
        self2.logger.error("Error compiling schema, function code:", sourceCode);
        throw e2;
      }
      validate2.schema = _schema;
      validate2.errors = null;
      validate2.refs = refs;
      validate2.refVal = refVal;
      validate2.root = isRoot ? validate2 : _root;
      if ($async) validate2.$async = true;
      if (opts.sourceCode === true) {
        validate2.source = {
          code: sourceCode,
          patterns,
          defaults
        };
      }
      return validate2;
    }
    function resolveRef(baseId2, ref2, isRoot) {
      ref2 = resolve$1.url(baseId2, ref2);
      var refIndex = refs[ref2];
      var _refVal, refCode;
      if (refIndex !== void 0) {
        _refVal = refVal[refIndex];
        refCode = "refVal[" + refIndex + "]";
        return resolvedRef(_refVal, refCode);
      }
      if (!isRoot && root.refs) {
        var rootRefId = root.refs[ref2];
        if (rootRefId !== void 0) {
          _refVal = root.refVal[rootRefId];
          refCode = addLocalRef(ref2, _refVal);
          return resolvedRef(_refVal, refCode);
        }
      }
      refCode = addLocalRef(ref2);
      var v3 = resolve$1.call(self2, localCompile, root, ref2);
      if (v3 === void 0) {
        var localSchema = localRefs && localRefs[ref2];
        if (localSchema) {
          v3 = resolve$1.inlineRef(localSchema, opts.inlineRefs) ? localSchema : compile$1.call(self2, localSchema, root, localRefs, baseId2);
        }
      }
      if (v3 === void 0) {
        removeLocalRef(ref2);
      } else {
        replaceLocalRef(ref2, v3);
        return resolvedRef(v3, refCode);
      }
    }
    function addLocalRef(ref2, v3) {
      var refId = refVal.length;
      refVal[refId] = v3;
      refs[ref2] = refId;
      return "refVal" + refId;
    }
    function removeLocalRef(ref2) {
      delete refs[ref2];
    }
    function replaceLocalRef(ref2, v3) {
      var refId = refs[ref2];
      refVal[refId] = v3;
    }
    function resolvedRef(refVal2, code) {
      return typeof refVal2 == "object" || typeof refVal2 == "boolean" ? { code, schema: refVal2, inline: true } : { code, $async: refVal2 && !!refVal2.$async };
    }
    function usePattern(regexStr) {
      var index = patternsHash[regexStr];
      if (index === void 0) {
        index = patternsHash[regexStr] = patterns.length;
        patterns[index] = regexStr;
      }
      return "pattern" + index;
    }
    function useDefault(value) {
      switch (typeof value) {
        case "boolean":
        case "number":
          return "" + value;
        case "string":
          return util$2.toQuotedString(value);
        case "object":
          if (value === null) return "null";
          var valueStr = stableStringify$1(value);
          var index = defaultsHash[valueStr];
          if (index === void 0) {
            index = defaultsHash[valueStr] = defaults.length;
            defaults[index] = value;
          }
          return "default" + index;
      }
    }
    function useCustomRule(rule, schema2, parentSchema, it) {
      if (self2._opts.validateSchema !== false) {
        var deps = rule.definition.dependencies;
        if (deps && !deps.every(function(keyword2) {
          return Object.prototype.hasOwnProperty.call(parentSchema, keyword2);
        }))
          throw new Error("parent schema must have all required keywords: " + deps.join(","));
        var validateSchema2 = rule.definition.validateSchema;
        if (validateSchema2) {
          var valid = validateSchema2(schema2);
          if (!valid) {
            var message = "keyword schema is invalid: " + self2.errorsText(validateSchema2.errors);
            if (self2._opts.validateSchema == "log") self2.logger.error(message);
            else throw new Error(message);
          }
        }
      }
      var compile2 = rule.definition.compile, inline = rule.definition.inline, macro = rule.definition.macro;
      var validate2;
      if (compile2) {
        validate2 = compile2.call(self2, schema2, parentSchema, it);
      } else if (macro) {
        validate2 = macro.call(self2, schema2, parentSchema, it);
        if (opts.validateSchema !== false) self2.validateSchema(validate2, true);
      } else if (inline) {
        validate2 = inline.call(self2, it, rule.keyword, schema2, parentSchema);
      } else {
        validate2 = rule.definition.validate;
        if (!validate2) return;
      }
      if (validate2 === void 0)
        throw new Error('custom keyword "' + rule.keyword + '"failed to compile');
      var index = customRules.length;
      customRules[index] = validate2;
      return {
        code: "customRule" + index,
        validate: validate2
      };
    }
  }
  function checkCompiling(schema, root, baseId) {
    var index = compIndex.call(this, schema, root, baseId);
    if (index >= 0) return { index, compiling: true };
    index = this._compilations.length;
    this._compilations[index] = {
      schema,
      root,
      baseId
    };
    return { index, compiling: false };
  }
  function endCompiling(schema, root, baseId) {
    var i = compIndex.call(this, schema, root, baseId);
    if (i >= 0) this._compilations.splice(i, 1);
  }
  function compIndex(schema, root, baseId) {
    for (var i = 0; i < this._compilations.length; i++) {
      var c2 = this._compilations[i];
      if (c2.schema == schema && c2.root == root && c2.baseId == baseId) return i;
    }
    return -1;
  }
  function patternCode(i, patterns) {
    return "var pattern" + i + " = new RegExp(" + util$2.toQuotedString(patterns[i]) + ");";
  }
  function defaultCode(i) {
    return "var default" + i + " = defaults[" + i + "];";
  }
  function refValCode(i, refVal) {
    return refVal[i] === void 0 ? "" : "var refVal" + i + " = refVal[" + i + "];";
  }
  function customRuleCode$1(i) {
    return "var customRule" + i + " = customRules[" + i + "];";
  }
  function vars(arr, statement) {
    if (!arr.length) return "";
    var code = "";
    for (var i = 0; i < arr.length; i++)
      code += statement(i, arr);
    return code;
  }
  var cache = { exports: {} };
  var Cache$1 = cache.exports = function Cache() {
    this._cache = {};
  };
  Cache$1.prototype.put = function Cache_put(key, value) {
    this._cache[key] = value;
  };
  Cache$1.prototype.get = function Cache_get(key) {
    return this._cache[key];
  };
  Cache$1.prototype.del = function Cache_del(key) {
    delete this._cache[key];
  };
  Cache$1.prototype.clear = function Cache_clear() {
    this._cache = {};
  };
  var cacheExports = cache.exports;
  var util$1 = util$5;
  var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
  var DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
  var HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
  var URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  var URIREF = /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
  var URITEMPLATE = /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i;
  var URL$1 = /^(?:(?:http[s\u017F]?|ftp):\/\/)(?:(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+(?::(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?@)?(?:(?!10(?:\.[0-9]{1,3}){3})(?!127(?:\.[0-9]{1,3}){3})(?!169\.254(?:\.[0-9]{1,3}){2})(?!192\.168(?:\.[0-9]{1,3}){2})(?!172\.(?:1[6-9]|2[0-9]|3[01])(?:\.[0-9]{1,3}){2})(?:[1-9][0-9]?|1[0-9][0-9]|2[01][0-9]|22[0-3])(?:\.(?:1?[0-9]{1,2}|2[0-4][0-9]|25[0-5])){2}(?:\.(?:[1-9][0-9]?|1[0-9][0-9]|2[0-4][0-9]|25[0-4]))|(?:(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)(?:\.(?:(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+-)*(?:[0-9a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])+)*(?:\.(?:(?:[a-z\xA1-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]){2,})))(?::[0-9]{2,5})?(?:\/(?:[\0-\x08\x0E-\x1F!-\x9F\xA1-\u167F\u1681-\u1FFF\u200B-\u2027\u202A-\u202E\u2030-\u205E\u2060-\u2FFF\u3001-\uD7FF\uE000-\uFEFE\uFF00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])*)?$/i;
  var UUID = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
  var JSON_POINTER = /^(?:\/(?:[^~/]|~0|~1)*)*$/;
  var JSON_POINTER_URI_FRAGMENT = /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i;
  var RELATIVE_JSON_POINTER = /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/;
  var formats_1 = formats$1;
  function formats$1(mode) {
    mode = mode == "full" ? "full" : "fast";
    return util$1.copy(formats$1[mode]);
  }
  formats$1.fast = {
    // date: http://tools.ietf.org/html/rfc3339#section-5.6
    date: /^\d\d\d\d-[0-1]\d-[0-3]\d$/,
    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
    time: /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
    "date-time": /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
    "uri-template": URITEMPLATE,
    url: URL$1,
    // email (sources from jsen validator):
    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'willful violation')
    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
    hostname: HOSTNAME,
    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    // optimized http://stackoverflow.com/questions/53497/regular-expression-that-matches-valid-ipv6-addresses
    ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
    regex,
    // uuid: http://tools.ietf.org/html/rfc4122
    uuid: UUID,
    // JSON-pointer: https://tools.ietf.org/html/rfc6901
    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
    "json-pointer": JSON_POINTER,
    "json-pointer-uri-fragment": JSON_POINTER_URI_FRAGMENT,
    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
    "relative-json-pointer": RELATIVE_JSON_POINTER
  };
  formats$1.full = {
    date,
    time,
    "date-time": date_time,
    uri,
    "uri-reference": URIREF,
    "uri-template": URITEMPLATE,
    url: URL$1,
    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
    hostname: HOSTNAME,
    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
    ipv6: /^\s*(?:(?:(?:[0-9a-f]{1,4}:){7}(?:[0-9a-f]{1,4}|:))|(?:(?:[0-9a-f]{1,4}:){6}(?::[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){5}(?:(?:(?::[0-9a-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(?:(?:[0-9a-f]{1,4}:){4}(?:(?:(?::[0-9a-f]{1,4}){1,3})|(?:(?::[0-9a-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){3}(?:(?:(?::[0-9a-f]{1,4}){1,4})|(?:(?::[0-9a-f]{1,4}){0,2}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){2}(?:(?:(?::[0-9a-f]{1,4}){1,5})|(?:(?::[0-9a-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?:(?:[0-9a-f]{1,4}:){1}(?:(?:(?::[0-9a-f]{1,4}){1,6})|(?:(?::[0-9a-f]{1,4}){0,4}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(?::(?:(?:(?::[0-9a-f]{1,4}){1,7})|(?:(?::[0-9a-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(?:%.+)?\s*$/i,
    regex,
    uuid: UUID,
    "json-pointer": JSON_POINTER,
    "json-pointer-uri-fragment": JSON_POINTER_URI_FRAGMENT,
    "relative-json-pointer": RELATIVE_JSON_POINTER
  };
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }
  function date(str) {
    var matches2 = str.match(DATE);
    if (!matches2) return false;
    var year = +matches2[1];
    var month = +matches2[2];
    var day = +matches2[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
  }
  function time(str, full) {
    var matches2 = str.match(TIME);
    if (!matches2) return false;
    var hour = matches2[1];
    var minute = matches2[2];
    var second = matches2[3];
    var timeZone = matches2[5];
    return (hour <= 23 && minute <= 59 && second <= 59 || hour == 23 && minute == 59 && second == 60) && (!full || timeZone);
  }
  var DATE_TIME_SEPARATOR = /t|\s/i;
  function date_time(str) {
    var dateTime = str.split(DATE_TIME_SEPARATOR);
    return dateTime.length == 2 && date(dateTime[0]) && time(dateTime[1], true);
  }
  var NOT_URI_FRAGMENT = /\/|:/;
  function uri(str) {
    return NOT_URI_FRAGMENT.test(str) && URI.test(str);
  }
  var Z_ANCHOR = /[^\\]\\Z/;
  function regex(str) {
    if (Z_ANCHOR.test(str)) return false;
    try {
      new RegExp(str);
      return true;
    } catch (e2) {
      return false;
    }
  }
  var ref = function generate_ref(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $async, $refCode;
    if ($schema2 == "#" || $schema2 == "#/") {
      if (it.isRoot) {
        $async = it.async;
        $refCode = "validate";
      } else {
        $async = it.root.schema.$async === true;
        $refCode = "root.refVal[0]";
      }
    } else {
      var $refVal = it.resolveRef(it.baseId, $schema2, it.isRoot);
      if ($refVal === void 0) {
        var $message = it.MissingRefError.message(it.baseId, $schema2);
        if (it.opts.missingRefs == "fail") {
          it.logger.error($message);
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: '$ref' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { ref: '" + it.util.escapeQuotes($schema2) + "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'can\\'t resolve reference " + it.util.escapeQuotes($schema2) + "' ";
            }
            if (it.opts.verbose) {
              out += " , schema: " + it.util.toQuotedString($schema2) + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          if ($breakOnError) {
            out += " if (false) { ";
          }
        } else if (it.opts.missingRefs == "ignore") {
          it.logger.warn($message);
          if ($breakOnError) {
            out += " if (true) { ";
          }
        } else {
          throw new it.MissingRefError(it.baseId, $schema2, $message);
        }
      } else if ($refVal.inline) {
        var $it = it.util.copy(it);
        $it.level++;
        var $nextValid = "valid" + $it.level;
        $it.schema = $refVal.schema;
        $it.schemaPath = "";
        $it.errSchemaPath = $schema2;
        var $code = it.validate($it).replace(/validate\.schema/g, $refVal.code);
        out += " " + $code + " ";
        if ($breakOnError) {
          out += " if (" + $nextValid + ") { ";
        }
      } else {
        $async = $refVal.$async === true || it.async && $refVal.$async !== false;
        $refCode = $refVal.code;
      }
    }
    if ($refCode) {
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.opts.passContext) {
        out += " " + $refCode + ".call(this, ";
      } else {
        out += " " + $refCode + "( ";
      }
      out += " " + $data + ", (dataPath || '')";
      if (it.errorPath != '""') {
        out += " + " + it.errorPath;
      }
      var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty";
      out += " , " + $parentData + " , " + $parentDataProperty + ", rootData)  ";
      var __callValidate = out;
      out = $$outStack.pop();
      if ($async) {
        if (!it.async) throw new Error("async schema referenced by sync schema");
        if ($breakOnError) {
          out += " var " + $valid + "; ";
        }
        out += " try { await " + __callValidate + "; ";
        if ($breakOnError) {
          out += " " + $valid + " = true; ";
        }
        out += " } catch (e) { if (!(e instanceof ValidationError)) throw e; if (vErrors === null) vErrors = e.errors; else vErrors = vErrors.concat(e.errors); errors = vErrors.length; ";
        if ($breakOnError) {
          out += " " + $valid + " = false; ";
        }
        out += " } ";
        if ($breakOnError) {
          out += " if (" + $valid + ") { ";
        }
      } else {
        out += " if (!" + __callValidate + ") { if (vErrors === null) vErrors = " + $refCode + ".errors; else vErrors = vErrors.concat(" + $refCode + ".errors); errors = vErrors.length; } ";
        if ($breakOnError) {
          out += " else { ";
        }
      }
    }
    return out;
  };
  var allOf = function generate_allOf(it, $keyword, $ruleType) {
    var out = " ";
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $currentBaseId = $it.baseId, $allSchemasEmpty = true;
    var arr1 = $schema2;
    if (arr1) {
      var $sch, $i = -1, l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[$i += 1];
        if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
          $allSchemasEmpty = false;
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + "[" + $i + "]";
          $it.errSchemaPath = $errSchemaPath + "/" + $i;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
          if ($breakOnError) {
            out += " if (" + $nextValid + ") { ";
            $closingBraces += "}";
          }
        }
      }
    }
    if ($breakOnError) {
      if ($allSchemasEmpty) {
        out += " if (true) { ";
      } else {
        out += " " + $closingBraces.slice(0, -1) + " ";
      }
    }
    return out;
  };
  var anyOf = function generate_anyOf(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $noEmptySchema = $schema2.every(function($sch2) {
      return it.opts.strictKeywords ? typeof $sch2 == "object" && Object.keys($sch2).length > 0 || $sch2 === false : it.util.schemaHasRules($sch2, it.RULES.all);
    });
    if ($noEmptySchema) {
      var $currentBaseId = $it.baseId;
      out += " var " + $errs + " = errors; var " + $valid + " = false;  ";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      var arr1 = $schema2;
      if (arr1) {
        var $sch, $i = -1, l1 = arr1.length - 1;
        while ($i < l1) {
          $sch = arr1[$i += 1];
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + "[" + $i + "]";
          $it.errSchemaPath = $errSchemaPath + "/" + $i;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
          out += " " + $valid + " = " + $valid + " || " + $nextValid + "; if (!" + $valid + ") { ";
          $closingBraces += "}";
        }
      }
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " " + $closingBraces + " if (!" + $valid + ") {   var err =   ";
      if (it.createErrors !== false) {
        out += " { keyword: 'anyOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: 'should match some schema in anyOf' ";
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError(vErrors); ";
        } else {
          out += " validate.errors = vErrors; return false; ";
        }
      }
      out += " } else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } ";
      if (it.opts.allErrors) {
        out += " } ";
      }
    } else {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    }
    return out;
  };
  var comment = function generate_comment(it, $keyword, $ruleType) {
    var out = " ";
    var $schema2 = it.schema[$keyword];
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    !it.opts.allErrors;
    var $comment = it.util.toQuotedString($schema2);
    if (it.opts.$comment === true) {
      out += " console.log(" + $comment + ");";
    } else if (typeof it.opts.$comment == "function") {
      out += " self._opts.$comment(" + $comment + ", " + it.util.toQuotedString($errSchemaPath) + ", validate.root.schema);";
    }
    return out;
  };
  var _const = function generate_const(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema2 && $schema2.$data;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
    }
    if (!$isData) {
      out += " var schema" + $lvl + " = validate.schema" + $schemaPath + ";";
    }
    out += "var " + $valid + " = equal(" + $data + ", schema" + $lvl + "); if (!" + $valid + ") {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: 'const' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { allowedValue: schema" + $lvl + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be equal to constant' ";
      }
      if (it.opts.verbose) {
        out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " }";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var contains = function generate_contains(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $idx = "i" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $currentBaseId = it.baseId, $nonEmptySchema = it.opts.strictKeywords ? typeof $schema2 == "object" && Object.keys($schema2).length > 0 || $schema2 === false : it.util.schemaHasRules($schema2, it.RULES.all);
    out += "var " + $errs + " = errors;var " + $valid + ";";
    if ($nonEmptySchema) {
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      $it.schema = $schema2;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out += " var " + $nextValid + " = false; for (var " + $idx + " = 0; " + $idx + " < " + $data + ".length; " + $idx + "++) { ";
      $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
      var $passData = $data + "[" + $idx + "]";
      $it.dataPathArr[$dataNxt] = $idx;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
      } else {
        out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
      }
      out += " if (" + $nextValid + ") break; }  ";
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " " + $closingBraces + " if (!" + $nextValid + ") {";
    } else {
      out += " if (" + $data + ".length == 0) {";
    }
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: 'contains' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
      if (it.opts.messages !== false) {
        out += " , message: 'should contain a valid item' ";
      }
      if (it.opts.verbose) {
        out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " } else { ";
    if ($nonEmptySchema) {
      out += "  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } ";
    }
    if (it.opts.allErrors) {
      out += " } ";
    }
    return out;
  };
  var dependencies = function generate_dependencies(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $schemaDeps = {}, $propertyDeps = {}, $ownProperties = it.opts.ownProperties;
    for ($property in $schema2) {
      if ($property == "__proto__") continue;
      var $sch = $schema2[$property];
      var $deps = Array.isArray($sch) ? $propertyDeps : $schemaDeps;
      $deps[$property] = $sch;
    }
    out += "var " + $errs + " = errors;";
    var $currentErrorPath = it.errorPath;
    out += "var missing" + $lvl + ";";
    for (var $property in $propertyDeps) {
      $deps = $propertyDeps[$property];
      if ($deps.length) {
        out += " if ( " + $data + it.util.getProperty($property) + " !== undefined ";
        if ($ownProperties) {
          out += " && Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($property) + "') ";
        }
        if ($breakOnError) {
          out += " && ( ";
          var arr1 = $deps;
          if (arr1) {
            var $propertyKey, $i = -1, l1 = arr1.length - 1;
            while ($i < l1) {
              $propertyKey = arr1[$i += 1];
              if ($i) {
                out += " || ";
              }
              var $prop = it.util.getProperty($propertyKey), $useData = $data + $prop;
              out += " ( ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
              }
              out += ") && (missing" + $lvl + " = " + it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop) + ") ) ";
            }
          }
          out += ")) {  ";
          var $propertyPath = "missing" + $lvl, $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + " + " + $propertyPath;
          }
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { property: '" + it.util.escapeQuotes($property) + "', missingProperty: '" + $missingProperty + "', depsCount: " + $deps.length + ", deps: '" + it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", ")) + "' } ";
            if (it.opts.messages !== false) {
              out += " , message: 'should have ";
              if ($deps.length == 1) {
                out += "property " + it.util.escapeQuotes($deps[0]);
              } else {
                out += "properties " + it.util.escapeQuotes($deps.join(", "));
              }
              out += " when property " + it.util.escapeQuotes($property) + " is present' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
        } else {
          out += " ) { ";
          var arr2 = $deps;
          if (arr2) {
            var $propertyKey, i2 = -1, l2 = arr2.length - 1;
            while (i2 < l2) {
              $propertyKey = arr2[i2 += 1];
              var $prop = it.util.getProperty($propertyKey), $missingProperty = it.util.escapeQuotes($propertyKey), $useData = $data + $prop;
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
              }
              out += " if ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
              }
              out += ") {  var err =   ";
              if (it.createErrors !== false) {
                out += " { keyword: 'dependencies' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { property: '" + it.util.escapeQuotes($property) + "', missingProperty: '" + $missingProperty + "', depsCount: " + $deps.length + ", deps: '" + it.util.escapeQuotes($deps.length == 1 ? $deps[0] : $deps.join(", ")) + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: 'should have ";
                  if ($deps.length == 1) {
                    out += "property " + it.util.escapeQuotes($deps[0]);
                  } else {
                    out += "properties " + it.util.escapeQuotes($deps.join(", "));
                  }
                  out += " when property " + it.util.escapeQuotes($property) + " is present' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
            }
          }
        }
        out += " }   ";
        if ($breakOnError) {
          $closingBraces += "}";
          out += " else { ";
        }
      }
    }
    it.errorPath = $currentErrorPath;
    var $currentBaseId = $it.baseId;
    for (var $property in $schemaDeps) {
      var $sch = $schemaDeps[$property];
      if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
        out += " " + $nextValid + " = true; if ( " + $data + it.util.getProperty($property) + " !== undefined ";
        if ($ownProperties) {
          out += " && Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($property) + "') ";
        }
        out += ") { ";
        $it.schema = $sch;
        $it.schemaPath = $schemaPath + it.util.getProperty($property);
        $it.errSchemaPath = $errSchemaPath + "/" + it.util.escapeFragment($property);
        out += "  " + it.validate($it) + " ";
        $it.baseId = $currentBaseId;
        out += " }  ";
        if ($breakOnError) {
          out += " if (" + $nextValid + ") { ";
          $closingBraces += "}";
        }
      }
    }
    if ($breakOnError) {
      out += "   " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
  var _enum = function generate_enum(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema2 && $schema2.$data;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
    }
    var $i = "i" + $lvl, $vSchema = "schema" + $lvl;
    if (!$isData) {
      out += " var " + $vSchema + " = validate.schema" + $schemaPath + ";";
    }
    out += "var " + $valid + ";";
    if ($isData) {
      out += " if (schema" + $lvl + " === undefined) " + $valid + " = true; else if (!Array.isArray(schema" + $lvl + ")) " + $valid + " = false; else {";
    }
    out += "" + $valid + " = false;for (var " + $i + "=0; " + $i + "<" + $vSchema + ".length; " + $i + "++) if (equal(" + $data + ", " + $vSchema + "[" + $i + "])) { " + $valid + " = true; break; }";
    if ($isData) {
      out += "  }  ";
    }
    out += " if (!" + $valid + ") {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: 'enum' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { allowedValues: schema" + $lvl + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be equal to one of the allowed values' ";
      }
      if (it.opts.verbose) {
        out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " }";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var format$1 = function generate_format(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    if (it.opts.format === false) {
      if ($breakOnError) {
        out += " if (true) { ";
      }
      return out;
    }
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    var $unknownFormats = it.opts.unknownFormats, $allowUnknown = Array.isArray($unknownFormats);
    if ($isData) {
      var $format = "format" + $lvl, $isObject = "isObject" + $lvl, $formatType = "formatType" + $lvl;
      out += " var " + $format + " = formats[" + $schemaValue + "]; var " + $isObject + " = typeof " + $format + " == 'object' && !(" + $format + " instanceof RegExp) && " + $format + ".validate; var " + $formatType + " = " + $isObject + " && " + $format + ".type || 'string'; if (" + $isObject + ") { ";
      if (it.async) {
        out += " var async" + $lvl + " = " + $format + ".async; ";
      }
      out += " " + $format + " = " + $format + ".validate; } if (  ";
      if ($isData) {
        out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'string') || ";
      }
      out += " (";
      if ($unknownFormats != "ignore") {
        out += " (" + $schemaValue + " && !" + $format + " ";
        if ($allowUnknown) {
          out += " && self._opts.unknownFormats.indexOf(" + $schemaValue + ") == -1 ";
        }
        out += ") || ";
      }
      out += " (" + $format + " && " + $formatType + " == '" + $ruleType + "' && !(typeof " + $format + " == 'function' ? ";
      if (it.async) {
        out += " (async" + $lvl + " ? await " + $format + "(" + $data + ") : " + $format + "(" + $data + ")) ";
      } else {
        out += " " + $format + "(" + $data + ") ";
      }
      out += " : " + $format + ".test(" + $data + "))))) {";
    } else {
      var $format = it.formats[$schema2];
      if (!$format) {
        if ($unknownFormats == "ignore") {
          it.logger.warn('unknown format "' + $schema2 + '" ignored in schema at path "' + it.errSchemaPath + '"');
          if ($breakOnError) {
            out += " if (true) { ";
          }
          return out;
        } else if ($allowUnknown && $unknownFormats.indexOf($schema2) >= 0) {
          if ($breakOnError) {
            out += " if (true) { ";
          }
          return out;
        } else {
          throw new Error('unknown format "' + $schema2 + '" is used in schema at path "' + it.errSchemaPath + '"');
        }
      }
      var $isObject = typeof $format == "object" && !($format instanceof RegExp) && $format.validate;
      var $formatType = $isObject && $format.type || "string";
      if ($isObject) {
        var $async = $format.async === true;
        $format = $format.validate;
      }
      if ($formatType != $ruleType) {
        if ($breakOnError) {
          out += " if (true) { ";
        }
        return out;
      }
      if ($async) {
        if (!it.async) throw new Error("async format in sync schema");
        var $formatRef = "formats" + it.util.getProperty($schema2) + ".validate";
        out += " if (!(await " + $formatRef + "(" + $data + "))) { ";
      } else {
        out += " if (! ";
        var $formatRef = "formats" + it.util.getProperty($schema2);
        if ($isObject) $formatRef += ".validate";
        if (typeof $format == "function") {
          out += " " + $formatRef + "(" + $data + ") ";
        } else {
          out += " " + $formatRef + ".test(" + $data + ") ";
        }
        out += ") { ";
      }
    }
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: 'format' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { format:  ";
      if ($isData) {
        out += "" + $schemaValue;
      } else {
        out += "" + it.util.toQuotedString($schema2);
      }
      out += "  } ";
      if (it.opts.messages !== false) {
        out += ` , message: 'should match format "`;
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + it.util.escapeQuotes($schema2);
        }
        out += `"' `;
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + it.util.toQuotedString($schema2);
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " } ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var _if = function generate_if(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $thenSch = it.schema["then"], $elseSch = it.schema["else"], $thenPresent = $thenSch !== void 0 && (it.opts.strictKeywords ? typeof $thenSch == "object" && Object.keys($thenSch).length > 0 || $thenSch === false : it.util.schemaHasRules($thenSch, it.RULES.all)), $elsePresent = $elseSch !== void 0 && (it.opts.strictKeywords ? typeof $elseSch == "object" && Object.keys($elseSch).length > 0 || $elseSch === false : it.util.schemaHasRules($elseSch, it.RULES.all)), $currentBaseId = $it.baseId;
    if ($thenPresent || $elsePresent) {
      var $ifClause;
      $it.createErrors = false;
      $it.schema = $schema2;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out += " var " + $errs + " = errors; var " + $valid + " = true;  ";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      out += "  " + it.validate($it) + " ";
      $it.baseId = $currentBaseId;
      $it.createErrors = true;
      out += "  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; }  ";
      it.compositeRule = $it.compositeRule = $wasComposite;
      if ($thenPresent) {
        out += " if (" + $nextValid + ") {  ";
        $it.schema = it.schema["then"];
        $it.schemaPath = it.schemaPath + ".then";
        $it.errSchemaPath = it.errSchemaPath + "/then";
        out += "  " + it.validate($it) + " ";
        $it.baseId = $currentBaseId;
        out += " " + $valid + " = " + $nextValid + "; ";
        if ($thenPresent && $elsePresent) {
          $ifClause = "ifClause" + $lvl;
          out += " var " + $ifClause + " = 'then'; ";
        } else {
          $ifClause = "'then'";
        }
        out += " } ";
        if ($elsePresent) {
          out += " else { ";
        }
      } else {
        out += " if (!" + $nextValid + ") { ";
      }
      if ($elsePresent) {
        $it.schema = it.schema["else"];
        $it.schemaPath = it.schemaPath + ".else";
        $it.errSchemaPath = it.errSchemaPath + "/else";
        out += "  " + it.validate($it) + " ";
        $it.baseId = $currentBaseId;
        out += " " + $valid + " = " + $nextValid + "; ";
        if ($thenPresent && $elsePresent) {
          $ifClause = "ifClause" + $lvl;
          out += " var " + $ifClause + " = 'else'; ";
        } else {
          $ifClause = "'else'";
        }
        out += " } ";
      }
      out += " if (!" + $valid + ") {   var err =   ";
      if (it.createErrors !== false) {
        out += " { keyword: 'if' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { failingKeyword: " + $ifClause + " } ";
        if (it.opts.messages !== false) {
          out += ` , message: 'should match "' + ` + $ifClause + ` + '" schema' `;
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError(vErrors); ";
        } else {
          out += " validate.errors = vErrors; return false; ";
        }
      }
      out += " }   ";
      if ($breakOnError) {
        out += " else { ";
      }
    } else {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    }
    return out;
  };
  var items = function generate_items(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $idx = "i" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $currentBaseId = it.baseId;
    out += "var " + $errs + " = errors;var " + $valid + ";";
    if (Array.isArray($schema2)) {
      var $additionalItems = it.schema.additionalItems;
      if ($additionalItems === false) {
        out += " " + $valid + " = " + $data + ".length <= " + $schema2.length + "; ";
        var $currErrSchemaPath = $errSchemaPath;
        $errSchemaPath = it.errSchemaPath + "/additionalItems";
        out += "  if (!" + $valid + ") {   ";
        var $$outStack = $$outStack || [];
        $$outStack.push(out);
        out = "";
        if (it.createErrors !== false) {
          out += " { keyword: 'additionalItems' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schema2.length + " } ";
          if (it.opts.messages !== false) {
            out += " , message: 'should NOT have more than " + $schema2.length + " items' ";
          }
          if (it.opts.verbose) {
            out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        var __err = out;
        out = $$outStack.pop();
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError([" + __err + "]); ";
          } else {
            out += " validate.errors = [" + __err + "]; return false; ";
          }
        } else {
          out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        }
        out += " } ";
        $errSchemaPath = $currErrSchemaPath;
        if ($breakOnError) {
          $closingBraces += "}";
          out += " else { ";
        }
      }
      var arr1 = $schema2;
      if (arr1) {
        var $sch, $i = -1, l1 = arr1.length - 1;
        while ($i < l1) {
          $sch = arr1[$i += 1];
          if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
            out += " " + $nextValid + " = true; if (" + $data + ".length > " + $i + ") { ";
            var $passData = $data + "[" + $i + "]";
            $it.schema = $sch;
            $it.schemaPath = $schemaPath + "[" + $i + "]";
            $it.errSchemaPath = $errSchemaPath + "/" + $i;
            $it.errorPath = it.util.getPathExpr(it.errorPath, $i, it.opts.jsonPointers, true);
            $it.dataPathArr[$dataNxt] = $i;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            out += " }  ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
              $closingBraces += "}";
            }
          }
        }
      }
      if (typeof $additionalItems == "object" && (it.opts.strictKeywords ? typeof $additionalItems == "object" && Object.keys($additionalItems).length > 0 || $additionalItems === false : it.util.schemaHasRules($additionalItems, it.RULES.all))) {
        $it.schema = $additionalItems;
        $it.schemaPath = it.schemaPath + ".additionalItems";
        $it.errSchemaPath = it.errSchemaPath + "/additionalItems";
        out += " " + $nextValid + " = true; if (" + $data + ".length > " + $schema2.length + ") {  for (var " + $idx + " = " + $schema2.length + "; " + $idx + " < " + $data + ".length; " + $idx + "++) { ";
        $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
        var $passData = $data + "[" + $idx + "]";
        $it.dataPathArr[$dataNxt] = $idx;
        var $code = it.validate($it);
        $it.baseId = $currentBaseId;
        if (it.util.varOccurences($code, $nextData) < 2) {
          out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
        } else {
          out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
        }
        if ($breakOnError) {
          out += " if (!" + $nextValid + ") break; ";
        }
        out += " } }  ";
        if ($breakOnError) {
          out += " if (" + $nextValid + ") { ";
          $closingBraces += "}";
        }
      }
    } else if (it.opts.strictKeywords ? typeof $schema2 == "object" && Object.keys($schema2).length > 0 || $schema2 === false : it.util.schemaHasRules($schema2, it.RULES.all)) {
      $it.schema = $schema2;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out += "  for (var " + $idx + " = 0; " + $idx + " < " + $data + ".length; " + $idx + "++) { ";
      $it.errorPath = it.util.getPathExpr(it.errorPath, $idx, it.opts.jsonPointers, true);
      var $passData = $data + "[" + $idx + "]";
      $it.dataPathArr[$dataNxt] = $idx;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
      } else {
        out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
      }
      if ($breakOnError) {
        out += " if (!" + $nextValid + ") break; ";
      }
      out += " }";
    }
    if ($breakOnError) {
      out += " " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
  var _limit = function generate__limit(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    var $isMax = $keyword == "maximum", $exclusiveKeyword = $isMax ? "exclusiveMaximum" : "exclusiveMinimum", $schemaExcl = it.schema[$exclusiveKeyword], $isDataExcl = it.opts.$data && $schemaExcl && $schemaExcl.$data, $op = $isMax ? "<" : ">", $notOp = $isMax ? ">" : "<", $errorKeyword = void 0;
    if (!($isData || typeof $schema2 == "number" || $schema2 === void 0)) {
      throw new Error($keyword + " must be number");
    }
    if (!($isDataExcl || $schemaExcl === void 0 || typeof $schemaExcl == "number" || typeof $schemaExcl == "boolean")) {
      throw new Error($exclusiveKeyword + " must be number or boolean");
    }
    if ($isDataExcl) {
      var $schemaValueExcl = it.util.getData($schemaExcl.$data, $dataLvl, it.dataPathArr), $exclusive = "exclusive" + $lvl, $exclType = "exclType" + $lvl, $exclIsNumber = "exclIsNumber" + $lvl, $opExpr = "op" + $lvl, $opStr = "' + " + $opExpr + " + '";
      out += " var schemaExcl" + $lvl + " = " + $schemaValueExcl + "; ";
      $schemaValueExcl = "schemaExcl" + $lvl;
      out += " var " + $exclusive + "; var " + $exclType + " = typeof " + $schemaValueExcl + "; if (" + $exclType + " != 'boolean' && " + $exclType + " != 'undefined' && " + $exclType + " != 'number') { ";
      var $errorKeyword = $exclusiveKeyword;
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out += " { keyword: '" + ($errorKeyword || "_exclusiveLimit") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: '" + $exclusiveKeyword + " should be boolean' ";
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      out += " } else if ( ";
      if ($isData) {
        out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
      }
      out += " " + $exclType + " == 'number' ? ( (" + $exclusive + " = " + $schemaValue + " === undefined || " + $schemaValueExcl + " " + $op + "= " + $schemaValue + ") ? " + $data + " " + $notOp + "= " + $schemaValueExcl + " : " + $data + " " + $notOp + " " + $schemaValue + " ) : ( (" + $exclusive + " = " + $schemaValueExcl + " === true) ? " + $data + " " + $notOp + "= " + $schemaValue + " : " + $data + " " + $notOp + " " + $schemaValue + " ) || " + $data + " !== " + $data + ") { var op" + $lvl + " = " + $exclusive + " ? '" + $op + "' : '" + $op + "='; ";
      if ($schema2 === void 0) {
        $errorKeyword = $exclusiveKeyword;
        $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
        $schemaValue = $schemaValueExcl;
        $isData = $isDataExcl;
      }
    } else {
      var $exclIsNumber = typeof $schemaExcl == "number", $opStr = $op;
      if ($exclIsNumber && $isData) {
        var $opExpr = "'" + $opStr + "'";
        out += " if ( ";
        if ($isData) {
          out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
        }
        out += " ( " + $schemaValue + " === undefined || " + $schemaExcl + " " + $op + "= " + $schemaValue + " ? " + $data + " " + $notOp + "= " + $schemaExcl + " : " + $data + " " + $notOp + " " + $schemaValue + " ) || " + $data + " !== " + $data + ") { ";
      } else {
        if ($exclIsNumber && $schema2 === void 0) {
          $exclusive = true;
          $errorKeyword = $exclusiveKeyword;
          $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
          $schemaValue = $schemaExcl;
          $notOp += "=";
        } else {
          if ($exclIsNumber) $schemaValue = Math[$isMax ? "min" : "max"]($schemaExcl, $schema2);
          if ($schemaExcl === ($exclIsNumber ? $schemaValue : true)) {
            $exclusive = true;
            $errorKeyword = $exclusiveKeyword;
            $errSchemaPath = it.errSchemaPath + "/" + $exclusiveKeyword;
            $notOp += "=";
          } else {
            $exclusive = false;
            $opStr += "=";
          }
        }
        var $opExpr = "'" + $opStr + "'";
        out += " if ( ";
        if ($isData) {
          out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
        }
        out += " " + $data + " " + $notOp + " " + $schemaValue + " || " + $data + " !== " + $data + ") { ";
      }
    }
    $errorKeyword = $errorKeyword || $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: '" + ($errorKeyword || "_limit") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { comparison: " + $opExpr + ", limit: " + $schemaValue + ", exclusive: " + $exclusive + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be " + $opStr + " ";
        if ($isData) {
          out += "' + " + $schemaValue;
        } else {
          out += "" + $schemaValue + "'";
        }
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema2;
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += " } ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var _limitItems = function generate__limitItems(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    if (!($isData || typeof $schema2 == "number")) {
      throw new Error($keyword + " must be number");
    }
    var $op = $keyword == "maxItems" ? ">" : "<";
    out += "if ( ";
    if ($isData) {
      out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
    }
    out += " " + $data + ".length " + $op + " " + $schemaValue + ") { ";
    var $errorKeyword = $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: '" + ($errorKeyword || "_limitItems") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should NOT have ";
        if ($keyword == "maxItems") {
          out += "more";
        } else {
          out += "fewer";
        }
        out += " than ";
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + $schema2;
        }
        out += " items' ";
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema2;
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var _limitLength = function generate__limitLength(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    if (!($isData || typeof $schema2 == "number")) {
      throw new Error($keyword + " must be number");
    }
    var $op = $keyword == "maxLength" ? ">" : "<";
    out += "if ( ";
    if ($isData) {
      out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
    }
    if (it.opts.unicode === false) {
      out += " " + $data + ".length ";
    } else {
      out += " ucs2length(" + $data + ") ";
    }
    out += " " + $op + " " + $schemaValue + ") { ";
    var $errorKeyword = $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: '" + ($errorKeyword || "_limitLength") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should NOT be ";
        if ($keyword == "maxLength") {
          out += "longer";
        } else {
          out += "shorter";
        }
        out += " than ";
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + $schema2;
        }
        out += " characters' ";
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema2;
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var _limitProperties = function generate__limitProperties(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    if (!($isData || typeof $schema2 == "number")) {
      throw new Error($keyword + " must be number");
    }
    var $op = $keyword == "maxProperties" ? ">" : "<";
    out += "if ( ";
    if ($isData) {
      out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'number') || ";
    }
    out += " Object.keys(" + $data + ").length " + $op + " " + $schemaValue + ") { ";
    var $errorKeyword = $keyword;
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: '" + ($errorKeyword || "_limitProperties") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { limit: " + $schemaValue + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should NOT have ";
        if ($keyword == "maxProperties") {
          out += "more";
        } else {
          out += "fewer";
        }
        out += " than ";
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + $schema2;
        }
        out += " properties' ";
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema2;
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var multipleOf = function generate_multipleOf(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    if (!($isData || typeof $schema2 == "number")) {
      throw new Error($keyword + " must be number");
    }
    out += "var division" + $lvl + ";if (";
    if ($isData) {
      out += " " + $schemaValue + " !== undefined && ( typeof " + $schemaValue + " != 'number' || ";
    }
    out += " (division" + $lvl + " = " + $data + " / " + $schemaValue + ", ";
    if (it.opts.multipleOfPrecision) {
      out += " Math.abs(Math.round(division" + $lvl + ") - division" + $lvl + ") > 1e-" + it.opts.multipleOfPrecision + " ";
    } else {
      out += " division" + $lvl + " !== parseInt(division" + $lvl + ") ";
    }
    out += " ) ";
    if ($isData) {
      out += "  )  ";
    }
    out += " ) {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: 'multipleOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { multipleOf: " + $schemaValue + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should be multiple of ";
        if ($isData) {
          out += "' + " + $schemaValue;
        } else {
          out += "" + $schemaValue + "'";
        }
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + $schema2;
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var not = function generate_not(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    $it.level++;
    var $nextValid = "valid" + $it.level;
    if (it.opts.strictKeywords ? typeof $schema2 == "object" && Object.keys($schema2).length > 0 || $schema2 === false : it.util.schemaHasRules($schema2, it.RULES.all)) {
      $it.schema = $schema2;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      out += " var " + $errs + " = errors;  ";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      $it.createErrors = false;
      var $allErrorsOption;
      if ($it.opts.allErrors) {
        $allErrorsOption = $it.opts.allErrors;
        $it.opts.allErrors = false;
      }
      out += " " + it.validate($it) + " ";
      $it.createErrors = true;
      if ($allErrorsOption) $it.opts.allErrors = $allErrorsOption;
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " if (" + $nextValid + ") {   ";
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out += " { keyword: 'not' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: 'should NOT be valid' ";
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      out += " } else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; } ";
      if (it.opts.allErrors) {
        out += " } ";
      }
    } else {
      out += "  var err =   ";
      if (it.createErrors !== false) {
        out += " { keyword: 'not' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: {} ";
        if (it.opts.messages !== false) {
          out += " , message: 'should NOT be valid' ";
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if ($breakOnError) {
        out += " if (false) { ";
      }
    }
    return out;
  };
  var oneOf = function generate_oneOf(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $currentBaseId = $it.baseId, $prevValid = "prevValid" + $lvl, $passingSchemas = "passingSchemas" + $lvl;
    out += "var " + $errs + " = errors , " + $prevValid + " = false , " + $valid + " = false , " + $passingSchemas + " = null; ";
    var $wasComposite = it.compositeRule;
    it.compositeRule = $it.compositeRule = true;
    var arr1 = $schema2;
    if (arr1) {
      var $sch, $i = -1, l1 = arr1.length - 1;
      while ($i < l1) {
        $sch = arr1[$i += 1];
        if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
          $it.schema = $sch;
          $it.schemaPath = $schemaPath + "[" + $i + "]";
          $it.errSchemaPath = $errSchemaPath + "/" + $i;
          out += "  " + it.validate($it) + " ";
          $it.baseId = $currentBaseId;
        } else {
          out += " var " + $nextValid + " = true; ";
        }
        if ($i) {
          out += " if (" + $nextValid + " && " + $prevValid + ") { " + $valid + " = false; " + $passingSchemas + " = [" + $passingSchemas + ", " + $i + "]; } else { ";
          $closingBraces += "}";
        }
        out += " if (" + $nextValid + ") { " + $valid + " = " + $prevValid + " = true; " + $passingSchemas + " = " + $i + "; }";
      }
    }
    it.compositeRule = $it.compositeRule = $wasComposite;
    out += "" + $closingBraces + "if (!" + $valid + ") {   var err =   ";
    if (it.createErrors !== false) {
      out += " { keyword: 'oneOf' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { passingSchemas: " + $passingSchemas + " } ";
      if (it.opts.messages !== false) {
        out += " , message: 'should match exactly one schema in oneOf' ";
      }
      if (it.opts.verbose) {
        out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError(vErrors); ";
      } else {
        out += " validate.errors = vErrors; return false; ";
      }
    }
    out += "} else {  errors = " + $errs + "; if (vErrors !== null) { if (" + $errs + ") vErrors.length = " + $errs + "; else vErrors = null; }";
    if (it.opts.allErrors) {
      out += " } ";
    }
    return out;
  };
  var pattern = function generate_pattern(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    var $regexp = $isData ? "(new RegExp(" + $schemaValue + "))" : it.usePattern($schema2);
    out += "if ( ";
    if ($isData) {
      out += " (" + $schemaValue + " !== undefined && typeof " + $schemaValue + " != 'string') || ";
    }
    out += " !" + $regexp + ".test(" + $data + ") ) {   ";
    var $$outStack = $$outStack || [];
    $$outStack.push(out);
    out = "";
    if (it.createErrors !== false) {
      out += " { keyword: 'pattern' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { pattern:  ";
      if ($isData) {
        out += "" + $schemaValue;
      } else {
        out += "" + it.util.toQuotedString($schema2);
      }
      out += "  } ";
      if (it.opts.messages !== false) {
        out += ` , message: 'should match pattern "`;
        if ($isData) {
          out += "' + " + $schemaValue + " + '";
        } else {
          out += "" + it.util.escapeQuotes($schema2);
        }
        out += `"' `;
      }
      if (it.opts.verbose) {
        out += " , schema:  ";
        if ($isData) {
          out += "validate.schema" + $schemaPath;
        } else {
          out += "" + it.util.toQuotedString($schema2);
        }
        out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
      }
      out += " } ";
    } else {
      out += " {} ";
    }
    var __err = out;
    out = $$outStack.pop();
    if (!it.compositeRule && $breakOnError) {
      if (it.async) {
        out += " throw new ValidationError([" + __err + "]); ";
      } else {
        out += " validate.errors = [" + __err + "]; return false; ";
      }
    } else {
      out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
    }
    out += "} ";
    if ($breakOnError) {
      out += " else { ";
    }
    return out;
  };
  var properties$3 = function generate_properties(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    var $key = "key" + $lvl, $idx = "idx" + $lvl, $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $dataProperties = "dataProperties" + $lvl;
    var $schemaKeys = Object.keys($schema2 || {}).filter(notProto), $pProperties = it.schema.patternProperties || {}, $pPropertyKeys = Object.keys($pProperties).filter(notProto), $aProperties = it.schema.additionalProperties, $someProperties = $schemaKeys.length || $pPropertyKeys.length, $noAdditional = $aProperties === false, $additionalIsSchema = typeof $aProperties == "object" && Object.keys($aProperties).length, $removeAdditional = it.opts.removeAdditional, $checkAdditional = $noAdditional || $additionalIsSchema || $removeAdditional, $ownProperties = it.opts.ownProperties, $currentBaseId = it.baseId;
    var $required = it.schema.required;
    if ($required && !(it.opts.$data && $required.$data) && $required.length < it.opts.loopRequired) {
      var $requiredHash = it.util.toHash($required);
    }
    function notProto(p3) {
      return p3 !== "__proto__";
    }
    out += "var " + $errs + " = errors;var " + $nextValid + " = true;";
    if ($ownProperties) {
      out += " var " + $dataProperties + " = undefined;";
    }
    if ($checkAdditional) {
      if ($ownProperties) {
        out += " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; ";
      } else {
        out += " for (var " + $key + " in " + $data + ") { ";
      }
      if ($someProperties) {
        out += " var isAdditional" + $lvl + " = !(false ";
        if ($schemaKeys.length) {
          if ($schemaKeys.length > 8) {
            out += " || validate.schema" + $schemaPath + ".hasOwnProperty(" + $key + ") ";
          } else {
            var arr1 = $schemaKeys;
            if (arr1) {
              var $propertyKey, i1 = -1, l1 = arr1.length - 1;
              while (i1 < l1) {
                $propertyKey = arr1[i1 += 1];
                out += " || " + $key + " == " + it.util.toQuotedString($propertyKey) + " ";
              }
            }
          }
        }
        if ($pPropertyKeys.length) {
          var arr2 = $pPropertyKeys;
          if (arr2) {
            var $pProperty, $i = -1, l2 = arr2.length - 1;
            while ($i < l2) {
              $pProperty = arr2[$i += 1];
              out += " || " + it.usePattern($pProperty) + ".test(" + $key + ") ";
            }
          }
        }
        out += " ); if (isAdditional" + $lvl + ") { ";
      }
      if ($removeAdditional == "all") {
        out += " delete " + $data + "[" + $key + "]; ";
      } else {
        var $currentErrorPath = it.errorPath;
        var $additionalProperty = "' + " + $key + " + '";
        if (it.opts._errorDataPathProperty) {
          it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
        }
        if ($noAdditional) {
          if ($removeAdditional) {
            out += " delete " + $data + "[" + $key + "]; ";
          } else {
            out += " " + $nextValid + " = false; ";
            var $currErrSchemaPath = $errSchemaPath;
            $errSchemaPath = it.errSchemaPath + "/additionalProperties";
            var $$outStack = $$outStack || [];
            $$outStack.push(out);
            out = "";
            if (it.createErrors !== false) {
              out += " { keyword: 'additionalProperties' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { additionalProperty: '" + $additionalProperty + "' } ";
              if (it.opts.messages !== false) {
                out += " , message: '";
                if (it.opts._errorDataPathProperty) {
                  out += "is an invalid additional property";
                } else {
                  out += "should NOT have additional properties";
                }
                out += "' ";
              }
              if (it.opts.verbose) {
                out += " , schema: false , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            var __err = out;
            out = $$outStack.pop();
            if (!it.compositeRule && $breakOnError) {
              if (it.async) {
                out += " throw new ValidationError([" + __err + "]); ";
              } else {
                out += " validate.errors = [" + __err + "]; return false; ";
              }
            } else {
              out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
            }
            $errSchemaPath = $currErrSchemaPath;
            if ($breakOnError) {
              out += " break; ";
            }
          }
        } else if ($additionalIsSchema) {
          if ($removeAdditional == "failing") {
            out += " var " + $errs + " = errors;  ";
            var $wasComposite = it.compositeRule;
            it.compositeRule = $it.compositeRule = true;
            $it.schema = $aProperties;
            $it.schemaPath = it.schemaPath + ".additionalProperties";
            $it.errSchemaPath = it.errSchemaPath + "/additionalProperties";
            $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
            var $passData = $data + "[" + $key + "]";
            $it.dataPathArr[$dataNxt] = $key;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            out += " if (!" + $nextValid + ") { errors = " + $errs + "; if (validate.errors !== null) { if (errors) validate.errors.length = errors; else validate.errors = null; } delete " + $data + "[" + $key + "]; }  ";
            it.compositeRule = $it.compositeRule = $wasComposite;
          } else {
            $it.schema = $aProperties;
            $it.schemaPath = it.schemaPath + ".additionalProperties";
            $it.errSchemaPath = it.errSchemaPath + "/additionalProperties";
            $it.errorPath = it.opts._errorDataPathProperty ? it.errorPath : it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
            var $passData = $data + "[" + $key + "]";
            $it.dataPathArr[$dataNxt] = $key;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            if ($breakOnError) {
              out += " if (!" + $nextValid + ") break; ";
            }
          }
        }
        it.errorPath = $currentErrorPath;
      }
      if ($someProperties) {
        out += " } ";
      }
      out += " }  ";
      if ($breakOnError) {
        out += " if (" + $nextValid + ") { ";
        $closingBraces += "}";
      }
    }
    var $useDefaults = it.opts.useDefaults && !it.compositeRule;
    if ($schemaKeys.length) {
      var arr3 = $schemaKeys;
      if (arr3) {
        var $propertyKey, i3 = -1, l3 = arr3.length - 1;
        while (i3 < l3) {
          $propertyKey = arr3[i3 += 1];
          var $sch = $schema2[$propertyKey];
          if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
            var $prop = it.util.getProperty($propertyKey), $passData = $data + $prop, $hasDefault = $useDefaults && $sch.default !== void 0;
            $it.schema = $sch;
            $it.schemaPath = $schemaPath + $prop;
            $it.errSchemaPath = $errSchemaPath + "/" + it.util.escapeFragment($propertyKey);
            $it.errorPath = it.util.getPath(it.errorPath, $propertyKey, it.opts.jsonPointers);
            $it.dataPathArr[$dataNxt] = it.util.toQuotedString($propertyKey);
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              $code = it.util.varReplace($code, $nextData, $passData);
              var $useData = $passData;
            } else {
              var $useData = $nextData;
              out += " var " + $nextData + " = " + $passData + "; ";
            }
            if ($hasDefault) {
              out += " " + $code + " ";
            } else {
              if ($requiredHash && $requiredHash[$propertyKey]) {
                out += " if ( " + $useData + " === undefined ";
                if ($ownProperties) {
                  out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                }
                out += ") { " + $nextValid + " = false; ";
                var $currentErrorPath = it.errorPath, $currErrSchemaPath = $errSchemaPath, $missingProperty = it.util.escapeQuotes($propertyKey);
                if (it.opts._errorDataPathProperty) {
                  it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
                }
                $errSchemaPath = it.errSchemaPath + "/required";
                var $$outStack = $$outStack || [];
                $$outStack.push(out);
                out = "";
                if (it.createErrors !== false) {
                  out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                  if (it.opts.messages !== false) {
                    out += " , message: '";
                    if (it.opts._errorDataPathProperty) {
                      out += "is a required property";
                    } else {
                      out += "should have required property \\'" + $missingProperty + "\\'";
                    }
                    out += "' ";
                  }
                  if (it.opts.verbose) {
                    out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                  }
                  out += " } ";
                } else {
                  out += " {} ";
                }
                var __err = out;
                out = $$outStack.pop();
                if (!it.compositeRule && $breakOnError) {
                  if (it.async) {
                    out += " throw new ValidationError([" + __err + "]); ";
                  } else {
                    out += " validate.errors = [" + __err + "]; return false; ";
                  }
                } else {
                  out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
                }
                $errSchemaPath = $currErrSchemaPath;
                it.errorPath = $currentErrorPath;
                out += " } else { ";
              } else {
                if ($breakOnError) {
                  out += " if ( " + $useData + " === undefined ";
                  if ($ownProperties) {
                    out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                  }
                  out += ") { " + $nextValid + " = true; } else { ";
                } else {
                  out += " if (" + $useData + " !== undefined ";
                  if ($ownProperties) {
                    out += " &&   Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
                  }
                  out += " ) { ";
                }
              }
              out += " " + $code + " } ";
            }
          }
          if ($breakOnError) {
            out += " if (" + $nextValid + ") { ";
            $closingBraces += "}";
          }
        }
      }
    }
    if ($pPropertyKeys.length) {
      var arr4 = $pPropertyKeys;
      if (arr4) {
        var $pProperty, i4 = -1, l4 = arr4.length - 1;
        while (i4 < l4) {
          $pProperty = arr4[i4 += 1];
          var $sch = $pProperties[$pProperty];
          if (it.opts.strictKeywords ? typeof $sch == "object" && Object.keys($sch).length > 0 || $sch === false : it.util.schemaHasRules($sch, it.RULES.all)) {
            $it.schema = $sch;
            $it.schemaPath = it.schemaPath + ".patternProperties" + it.util.getProperty($pProperty);
            $it.errSchemaPath = it.errSchemaPath + "/patternProperties/" + it.util.escapeFragment($pProperty);
            if ($ownProperties) {
              out += " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; ";
            } else {
              out += " for (var " + $key + " in " + $data + ") { ";
            }
            out += " if (" + it.usePattern($pProperty) + ".test(" + $key + ")) { ";
            $it.errorPath = it.util.getPathExpr(it.errorPath, $key, it.opts.jsonPointers);
            var $passData = $data + "[" + $key + "]";
            $it.dataPathArr[$dataNxt] = $key;
            var $code = it.validate($it);
            $it.baseId = $currentBaseId;
            if (it.util.varOccurences($code, $nextData) < 2) {
              out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
            } else {
              out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
            }
            if ($breakOnError) {
              out += " if (!" + $nextValid + ") break; ";
            }
            out += " } ";
            if ($breakOnError) {
              out += " else " + $nextValid + " = true; ";
            }
            out += " }  ";
            if ($breakOnError) {
              out += " if (" + $nextValid + ") { ";
              $closingBraces += "}";
            }
          }
        }
      }
    }
    if ($breakOnError) {
      out += " " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
  var propertyNames = function generate_propertyNames(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $errs = "errs__" + $lvl;
    var $it = it.util.copy(it);
    var $closingBraces = "";
    $it.level++;
    var $nextValid = "valid" + $it.level;
    out += "var " + $errs + " = errors;";
    if (it.opts.strictKeywords ? typeof $schema2 == "object" && Object.keys($schema2).length > 0 || $schema2 === false : it.util.schemaHasRules($schema2, it.RULES.all)) {
      $it.schema = $schema2;
      $it.schemaPath = $schemaPath;
      $it.errSchemaPath = $errSchemaPath;
      var $key = "key" + $lvl, $idx = "idx" + $lvl, $i = "i" + $lvl, $invalidName = "' + " + $key + " + '", $dataNxt = $it.dataLevel = it.dataLevel + 1, $nextData = "data" + $dataNxt, $dataProperties = "dataProperties" + $lvl, $ownProperties = it.opts.ownProperties, $currentBaseId = it.baseId;
      if ($ownProperties) {
        out += " var " + $dataProperties + " = undefined; ";
      }
      if ($ownProperties) {
        out += " " + $dataProperties + " = " + $dataProperties + " || Object.keys(" + $data + "); for (var " + $idx + "=0; " + $idx + "<" + $dataProperties + ".length; " + $idx + "++) { var " + $key + " = " + $dataProperties + "[" + $idx + "]; ";
      } else {
        out += " for (var " + $key + " in " + $data + ") { ";
      }
      out += " var startErrs" + $lvl + " = errors; ";
      var $passData = $key;
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      var $code = it.validate($it);
      $it.baseId = $currentBaseId;
      if (it.util.varOccurences($code, $nextData) < 2) {
        out += " " + it.util.varReplace($code, $nextData, $passData) + " ";
      } else {
        out += " var " + $nextData + " = " + $passData + "; " + $code + " ";
      }
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " if (!" + $nextValid + ") { for (var " + $i + "=startErrs" + $lvl + "; " + $i + "<errors; " + $i + "++) { vErrors[" + $i + "].propertyName = " + $key + "; }   var err =   ";
      if (it.createErrors !== false) {
        out += " { keyword: 'propertyNames' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { propertyName: '" + $invalidName + "' } ";
        if (it.opts.messages !== false) {
          out += " , message: 'property name \\'" + $invalidName + "\\' is invalid' ";
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError(vErrors); ";
        } else {
          out += " validate.errors = vErrors; return false; ";
        }
      }
      if ($breakOnError) {
        out += " break; ";
      }
      out += " } }";
    }
    if ($breakOnError) {
      out += " " + $closingBraces + " if (" + $errs + " == errors) {";
    }
    return out;
  };
  var required$1 = function generate_required(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema2 && $schema2.$data;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
    }
    var $vSchema = "schema" + $lvl;
    if (!$isData) {
      if ($schema2.length < it.opts.loopRequired && it.schema.properties && Object.keys(it.schema.properties).length) {
        var $required = [];
        var arr1 = $schema2;
        if (arr1) {
          var $property, i1 = -1, l1 = arr1.length - 1;
          while (i1 < l1) {
            $property = arr1[i1 += 1];
            var $propertySch = it.schema.properties[$property];
            if (!($propertySch && (it.opts.strictKeywords ? typeof $propertySch == "object" && Object.keys($propertySch).length > 0 || $propertySch === false : it.util.schemaHasRules($propertySch, it.RULES.all)))) {
              $required[$required.length] = $property;
            }
          }
        }
      } else {
        var $required = $schema2;
      }
    }
    if ($isData || $required.length) {
      var $currentErrorPath = it.errorPath, $loopRequired = $isData || $required.length >= it.opts.loopRequired, $ownProperties = it.opts.ownProperties;
      if ($breakOnError) {
        out += " var missing" + $lvl + "; ";
        if ($loopRequired) {
          if (!$isData) {
            out += " var " + $vSchema + " = validate.schema" + $schemaPath + "; ";
          }
          var $i = "i" + $lvl, $propertyPath = "schema" + $lvl + "[" + $i + "]", $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
          }
          out += " var " + $valid + " = true; ";
          if ($isData) {
            out += " if (schema" + $lvl + " === undefined) " + $valid + " = true; else if (!Array.isArray(schema" + $lvl + ")) " + $valid + " = false; else {";
          }
          out += " for (var " + $i + " = 0; " + $i + " < " + $vSchema + ".length; " + $i + "++) { " + $valid + " = " + $data + "[" + $vSchema + "[" + $i + "]] !== undefined ";
          if ($ownProperties) {
            out += " &&   Object.prototype.hasOwnProperty.call(" + $data + ", " + $vSchema + "[" + $i + "]) ";
          }
          out += "; if (!" + $valid + ") break; } ";
          if ($isData) {
            out += "  }  ";
          }
          out += "  if (!" + $valid + ") {   ";
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
            if (it.opts.messages !== false) {
              out += " , message: '";
              if (it.opts._errorDataPathProperty) {
                out += "is a required property";
              } else {
                out += "should have required property \\'" + $missingProperty + "\\'";
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } else { ";
        } else {
          out += " if ( ";
          var arr2 = $required;
          if (arr2) {
            var $propertyKey, $i = -1, l2 = arr2.length - 1;
            while ($i < l2) {
              $propertyKey = arr2[$i += 1];
              if ($i) {
                out += " || ";
              }
              var $prop = it.util.getProperty($propertyKey), $useData = $data + $prop;
              out += " ( ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
              }
              out += ") && (missing" + $lvl + " = " + it.util.toQuotedString(it.opts.jsonPointers ? $propertyKey : $prop) + ") ) ";
            }
          }
          out += ") {  ";
          var $propertyPath = "missing" + $lvl, $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.opts.jsonPointers ? it.util.getPathExpr($currentErrorPath, $propertyPath, true) : $currentErrorPath + " + " + $propertyPath;
          }
          var $$outStack = $$outStack || [];
          $$outStack.push(out);
          out = "";
          if (it.createErrors !== false) {
            out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
            if (it.opts.messages !== false) {
              out += " , message: '";
              if (it.opts._errorDataPathProperty) {
                out += "is a required property";
              } else {
                out += "should have required property \\'" + $missingProperty + "\\'";
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          var __err = out;
          out = $$outStack.pop();
          if (!it.compositeRule && $breakOnError) {
            if (it.async) {
              out += " throw new ValidationError([" + __err + "]); ";
            } else {
              out += " validate.errors = [" + __err + "]; return false; ";
            }
          } else {
            out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
          }
          out += " } else { ";
        }
      } else {
        if ($loopRequired) {
          if (!$isData) {
            out += " var " + $vSchema + " = validate.schema" + $schemaPath + "; ";
          }
          var $i = "i" + $lvl, $propertyPath = "schema" + $lvl + "[" + $i + "]", $missingProperty = "' + " + $propertyPath + " + '";
          if (it.opts._errorDataPathProperty) {
            it.errorPath = it.util.getPathExpr($currentErrorPath, $propertyPath, it.opts.jsonPointers);
          }
          if ($isData) {
            out += " if (" + $vSchema + " && !Array.isArray(" + $vSchema + ")) {  var err =   ";
            if (it.createErrors !== false) {
              out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
              if (it.opts.messages !== false) {
                out += " , message: '";
                if (it.opts._errorDataPathProperty) {
                  out += "is a required property";
                } else {
                  out += "should have required property \\'" + $missingProperty + "\\'";
                }
                out += "' ";
              }
              if (it.opts.verbose) {
                out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
              }
              out += " } ";
            } else {
              out += " {} ";
            }
            out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } else if (" + $vSchema + " !== undefined) { ";
          }
          out += " for (var " + $i + " = 0; " + $i + " < " + $vSchema + ".length; " + $i + "++) { if (" + $data + "[" + $vSchema + "[" + $i + "]] === undefined ";
          if ($ownProperties) {
            out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", " + $vSchema + "[" + $i + "]) ";
          }
          out += ") {  var err =   ";
          if (it.createErrors !== false) {
            out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
            if (it.opts.messages !== false) {
              out += " , message: '";
              if (it.opts._errorDataPathProperty) {
                out += "is a required property";
              } else {
                out += "should have required property \\'" + $missingProperty + "\\'";
              }
              out += "' ";
            }
            if (it.opts.verbose) {
              out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
            }
            out += " } ";
          } else {
            out += " {} ";
          }
          out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } } ";
          if ($isData) {
            out += "  }  ";
          }
        } else {
          var arr3 = $required;
          if (arr3) {
            var $propertyKey, i3 = -1, l3 = arr3.length - 1;
            while (i3 < l3) {
              $propertyKey = arr3[i3 += 1];
              var $prop = it.util.getProperty($propertyKey), $missingProperty = it.util.escapeQuotes($propertyKey), $useData = $data + $prop;
              if (it.opts._errorDataPathProperty) {
                it.errorPath = it.util.getPath($currentErrorPath, $propertyKey, it.opts.jsonPointers);
              }
              out += " if ( " + $useData + " === undefined ";
              if ($ownProperties) {
                out += " || ! Object.prototype.hasOwnProperty.call(" + $data + ", '" + it.util.escapeQuotes($propertyKey) + "') ";
              }
              out += ") {  var err =   ";
              if (it.createErrors !== false) {
                out += " { keyword: 'required' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { missingProperty: '" + $missingProperty + "' } ";
                if (it.opts.messages !== false) {
                  out += " , message: '";
                  if (it.opts._errorDataPathProperty) {
                    out += "is a required property";
                  } else {
                    out += "should have required property \\'" + $missingProperty + "\\'";
                  }
                  out += "' ";
                }
                if (it.opts.verbose) {
                  out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
                }
                out += " } ";
              } else {
                out += " {} ";
              }
              out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; } ";
            }
          }
        }
      }
      it.errorPath = $currentErrorPath;
    } else if ($breakOnError) {
      out += " if (true) {";
    }
    return out;
  };
  var uniqueItems = function generate_uniqueItems(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    if (($schema2 || $isData) && it.opts.uniqueItems !== false) {
      if ($isData) {
        out += " var " + $valid + "; if (" + $schemaValue + " === false || " + $schemaValue + " === undefined) " + $valid + " = true; else if (typeof " + $schemaValue + " != 'boolean') " + $valid + " = false; else { ";
      }
      out += " var i = " + $data + ".length , " + $valid + " = true , j; if (i > 1) { ";
      var $itemType = it.schema.items && it.schema.items.type, $typeIsArray = Array.isArray($itemType);
      if (!$itemType || $itemType == "object" || $itemType == "array" || $typeIsArray && ($itemType.indexOf("object") >= 0 || $itemType.indexOf("array") >= 0)) {
        out += " outer: for (;i--;) { for (j = i; j--;) { if (equal(" + $data + "[i], " + $data + "[j])) { " + $valid + " = false; break outer; } } } ";
      } else {
        out += " var itemIndices = {}, item; for (;i--;) { var item = " + $data + "[i]; ";
        var $method = "checkDataType" + ($typeIsArray ? "s" : "");
        out += " if (" + it.util[$method]($itemType, "item", it.opts.strictNumbers, true) + ") continue; ";
        if ($typeIsArray) {
          out += ` if (typeof item == 'string') item = '"' + item; `;
        }
        out += " if (typeof itemIndices[item] == 'number') { " + $valid + " = false; j = itemIndices[item]; break; } itemIndices[item] = i; } ";
      }
      out += " } ";
      if ($isData) {
        out += "  }  ";
      }
      out += " if (!" + $valid + ") {   ";
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out += " { keyword: 'uniqueItems' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { i: i, j: j } ";
        if (it.opts.messages !== false) {
          out += " , message: 'should NOT have duplicate items (items ## ' + j + ' and ' + i + ' are identical)' ";
        }
        if (it.opts.verbose) {
          out += " , schema:  ";
          if ($isData) {
            out += "validate.schema" + $schemaPath;
          } else {
            out += "" + $schema2;
          }
          out += "         , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      out += " } ";
      if ($breakOnError) {
        out += " else { ";
      }
    } else {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    }
    return out;
  };
  var dotjs = {
    "$ref": ref,
    allOf,
    anyOf,
    "$comment": comment,
    const: _const,
    contains,
    dependencies,
    "enum": _enum,
    format: format$1,
    "if": _if,
    items,
    maximum: _limit,
    minimum: _limit,
    maxItems: _limitItems,
    minItems: _limitItems,
    maxLength: _limitLength,
    minLength: _limitLength,
    maxProperties: _limitProperties,
    minProperties: _limitProperties,
    multipleOf,
    not,
    oneOf,
    pattern,
    properties: properties$3,
    propertyNames,
    required: required$1,
    uniqueItems,
    validate: validate$1
  };
  var ruleModules = dotjs, toHash = util$5.toHash;
  var rules$1 = function rules() {
    var RULES = [
      {
        type: "number",
        rules: [
          { "maximum": ["exclusiveMaximum"] },
          { "minimum": ["exclusiveMinimum"] },
          "multipleOf",
          "format"
        ]
      },
      {
        type: "string",
        rules: ["maxLength", "minLength", "pattern", "format"]
      },
      {
        type: "array",
        rules: ["maxItems", "minItems", "items", "contains", "uniqueItems"]
      },
      {
        type: "object",
        rules: [
          "maxProperties",
          "minProperties",
          "required",
          "dependencies",
          "propertyNames",
          { "properties": ["additionalProperties", "patternProperties"] }
        ]
      },
      { rules: ["$ref", "const", "enum", "not", "anyOf", "oneOf", "allOf", "if"] }
    ];
    var ALL = ["type", "$comment"];
    var KEYWORDS2 = [
      "$schema",
      "$id",
      "id",
      "$data",
      "$async",
      "title",
      "description",
      "default",
      "definitions",
      "examples",
      "readOnly",
      "writeOnly",
      "contentMediaType",
      "contentEncoding",
      "additionalItems",
      "then",
      "else"
    ];
    var TYPES = ["number", "integer", "string", "array", "object", "boolean", "null"];
    RULES.all = toHash(ALL);
    RULES.types = toHash(TYPES);
    RULES.forEach(function(group) {
      group.rules = group.rules.map(function(keyword2) {
        var implKeywords;
        if (typeof keyword2 == "object") {
          var key = Object.keys(keyword2)[0];
          implKeywords = keyword2[key];
          keyword2 = key;
          implKeywords.forEach(function(k) {
            ALL.push(k);
            RULES.all[k] = true;
          });
        }
        ALL.push(keyword2);
        var rule = RULES.all[keyword2] = {
          keyword: keyword2,
          code: ruleModules[keyword2],
          implements: implKeywords
        };
        return rule;
      });
      RULES.all.$comment = {
        keyword: "$comment",
        code: ruleModules.$comment
      };
      if (group.type) RULES.types[group.type] = group;
    });
    RULES.keywords = toHash(ALL.concat(KEYWORDS2));
    RULES.custom = {};
    return RULES;
  };
  var KEYWORDS = [
    "multipleOf",
    "maximum",
    "exclusiveMaximum",
    "minimum",
    "exclusiveMinimum",
    "maxLength",
    "minLength",
    "pattern",
    "additionalItems",
    "maxItems",
    "minItems",
    "uniqueItems",
    "maxProperties",
    "minProperties",
    "required",
    "additionalProperties",
    "enum",
    "format",
    "const"
  ];
  var data = function(metaSchema2, keywordsJsonPointers) {
    for (var i = 0; i < keywordsJsonPointers.length; i++) {
      metaSchema2 = JSON.parse(JSON.stringify(metaSchema2));
      var segments = keywordsJsonPointers[i].split("/");
      var keywords = metaSchema2;
      var j;
      for (j = 1; j < segments.length; j++)
        keywords = keywords[segments[j]];
      for (j = 0; j < KEYWORDS.length; j++) {
        var key = KEYWORDS[j];
        var schema = keywords[key];
        if (schema) {
          keywords[key] = {
            anyOf: [
              schema,
              { $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" }
            ]
          };
        }
      }
    }
    return metaSchema2;
  };
  var MissingRefError = error_classes.MissingRef;
  var async = compileAsync;
  function compileAsync(schema, meta, callback) {
    var self2 = this;
    if (typeof this._opts.loadSchema != "function")
      throw new Error("options.loadSchema should be a function");
    if (typeof meta == "function") {
      callback = meta;
      meta = void 0;
    }
    var p3 = loadMetaSchemaOf(schema).then(function() {
      var schemaObj = self2._addSchema(schema, void 0, meta);
      return schemaObj.validate || _compileAsync(schemaObj);
    });
    if (callback) {
      p3.then(
        function(v2) {
          callback(null, v2);
        },
        callback
      );
    }
    return p3;
    function loadMetaSchemaOf(sch) {
      var $schema2 = sch.$schema;
      return $schema2 && !self2.getSchema($schema2) ? compileAsync.call(self2, { $ref: $schema2 }, true) : Promise.resolve();
    }
    function _compileAsync(schemaObj) {
      try {
        return self2._compile(schemaObj);
      } catch (e2) {
        if (e2 instanceof MissingRefError) return loadMissingSchema(e2);
        throw e2;
      }
      function loadMissingSchema(e2) {
        var ref2 = e2.missingSchema;
        if (added(ref2)) throw new Error("Schema " + ref2 + " is loaded but " + e2.missingRef + " cannot be resolved");
        var schemaPromise = self2._loadingSchemas[ref2];
        if (!schemaPromise) {
          schemaPromise = self2._loadingSchemas[ref2] = self2._opts.loadSchema(ref2);
          schemaPromise.then(removePromise, removePromise);
        }
        return schemaPromise.then(function(sch) {
          if (!added(ref2)) {
            return loadMetaSchemaOf(sch).then(function() {
              if (!added(ref2)) self2.addSchema(sch, ref2, void 0, meta);
            });
          }
        }).then(function() {
          return _compileAsync(schemaObj);
        });
        function removePromise() {
          delete self2._loadingSchemas[ref2];
        }
        function added(ref3) {
          return self2._refs[ref3] || self2._schemas[ref3];
        }
      }
    }
  }
  var custom = function generate_custom(it, $keyword, $ruleType) {
    var out = " ";
    var $lvl = it.level;
    var $dataLvl = it.dataLevel;
    var $schema2 = it.schema[$keyword];
    var $schemaPath = it.schemaPath + it.util.getProperty($keyword);
    var $errSchemaPath = it.errSchemaPath + "/" + $keyword;
    var $breakOnError = !it.opts.allErrors;
    var $errorKeyword;
    var $data = "data" + ($dataLvl || "");
    var $valid = "valid" + $lvl;
    var $errs = "errs__" + $lvl;
    var $isData = it.opts.$data && $schema2 && $schema2.$data, $schemaValue;
    if ($isData) {
      out += " var schema" + $lvl + " = " + it.util.getData($schema2.$data, $dataLvl, it.dataPathArr) + "; ";
      $schemaValue = "schema" + $lvl;
    } else {
      $schemaValue = $schema2;
    }
    var $rule = this, $definition = "definition" + $lvl, $rDef = $rule.definition, $closingBraces = "";
    var $compile, $inline, $macro, $ruleValidate, $validateCode;
    if ($isData && $rDef.$data) {
      $validateCode = "keywordValidate" + $lvl;
      var $validateSchema = $rDef.validateSchema;
      out += " var " + $definition + " = RULES.custom['" + $keyword + "'].definition; var " + $validateCode + " = " + $definition + ".validate;";
    } else {
      $ruleValidate = it.useCustomRule($rule, $schema2, it.schema, it);
      if (!$ruleValidate) return;
      $schemaValue = "validate.schema" + $schemaPath;
      $validateCode = $ruleValidate.code;
      $compile = $rDef.compile;
      $inline = $rDef.inline;
      $macro = $rDef.macro;
    }
    var $ruleErrs = $validateCode + ".errors", $i = "i" + $lvl, $ruleErr = "ruleErr" + $lvl, $asyncKeyword = $rDef.async;
    if ($asyncKeyword && !it.async) throw new Error("async keyword in sync schema");
    if (!($inline || $macro)) {
      out += "" + $ruleErrs + " = null;";
    }
    out += "var " + $errs + " = errors;var " + $valid + ";";
    if ($isData && $rDef.$data) {
      $closingBraces += "}";
      out += " if (" + $schemaValue + " === undefined) { " + $valid + " = true; } else { ";
      if ($validateSchema) {
        $closingBraces += "}";
        out += " " + $valid + " = " + $definition + ".validateSchema(" + $schemaValue + "); if (" + $valid + ") { ";
      }
    }
    if ($inline) {
      if ($rDef.statements) {
        out += " " + $ruleValidate.validate + " ";
      } else {
        out += " " + $valid + " = " + $ruleValidate.validate + "; ";
      }
    } else if ($macro) {
      var $it = it.util.copy(it);
      var $closingBraces = "";
      $it.level++;
      var $nextValid = "valid" + $it.level;
      $it.schema = $ruleValidate.validate;
      $it.schemaPath = "";
      var $wasComposite = it.compositeRule;
      it.compositeRule = $it.compositeRule = true;
      var $code = it.validate($it).replace(/validate\.schema/g, $validateCode);
      it.compositeRule = $it.compositeRule = $wasComposite;
      out += " " + $code;
    } else {
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      out += "  " + $validateCode + ".call( ";
      if (it.opts.passContext) {
        out += "this";
      } else {
        out += "self";
      }
      if ($compile || $rDef.schema === false) {
        out += " , " + $data + " ";
      } else {
        out += " , " + $schemaValue + " , " + $data + " , validate.schema" + it.schemaPath + " ";
      }
      out += " , (dataPath || '')";
      if (it.errorPath != '""') {
        out += " + " + it.errorPath;
      }
      var $parentData = $dataLvl ? "data" + ($dataLvl - 1 || "") : "parentData", $parentDataProperty = $dataLvl ? it.dataPathArr[$dataLvl] : "parentDataProperty";
      out += " , " + $parentData + " , " + $parentDataProperty + " , rootData )  ";
      var def_callRuleValidate = out;
      out = $$outStack.pop();
      if ($rDef.errors === false) {
        out += " " + $valid + " = ";
        if ($asyncKeyword) {
          out += "await ";
        }
        out += "" + def_callRuleValidate + "; ";
      } else {
        if ($asyncKeyword) {
          $ruleErrs = "customErrors" + $lvl;
          out += " var " + $ruleErrs + " = null; try { " + $valid + " = await " + def_callRuleValidate + "; } catch (e) { " + $valid + " = false; if (e instanceof ValidationError) " + $ruleErrs + " = e.errors; else throw e; } ";
        } else {
          out += " " + $ruleErrs + " = null; " + $valid + " = " + def_callRuleValidate + "; ";
        }
      }
    }
    if ($rDef.modifying) {
      out += " if (" + $parentData + ") " + $data + " = " + $parentData + "[" + $parentDataProperty + "];";
    }
    out += "" + $closingBraces;
    if ($rDef.valid) {
      if ($breakOnError) {
        out += " if (true) { ";
      }
    } else {
      out += " if ( ";
      if ($rDef.valid === void 0) {
        out += " !";
        if ($macro) {
          out += "" + $nextValid;
        } else {
          out += "" + $valid;
        }
      } else {
        out += " " + !$rDef.valid + " ";
      }
      out += ") { ";
      $errorKeyword = $rule.keyword;
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      var $$outStack = $$outStack || [];
      $$outStack.push(out);
      out = "";
      if (it.createErrors !== false) {
        out += " { keyword: '" + ($errorKeyword || "custom") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { keyword: '" + $rule.keyword + "' } ";
        if (it.opts.messages !== false) {
          out += ` , message: 'should pass "` + $rule.keyword + `" keyword validation' `;
        }
        if (it.opts.verbose) {
          out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
        }
        out += " } ";
      } else {
        out += " {} ";
      }
      var __err = out;
      out = $$outStack.pop();
      if (!it.compositeRule && $breakOnError) {
        if (it.async) {
          out += " throw new ValidationError([" + __err + "]); ";
        } else {
          out += " validate.errors = [" + __err + "]; return false; ";
        }
      } else {
        out += " var err = " + __err + ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
      }
      var def_customError = out;
      out = $$outStack.pop();
      if ($inline) {
        if ($rDef.errors) {
          if ($rDef.errors != "full") {
            out += "  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + "; if (" + $ruleErr + ".schemaPath === undefined) { " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '"; } ';
            if (it.opts.verbose) {
              out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; ";
            }
            out += " } ";
          }
        } else {
          if ($rDef.errors === false) {
            out += " " + def_customError + " ";
          } else {
            out += " if (" + $errs + " == errors) { " + def_customError + " } else {  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + "; if (" + $ruleErr + ".schemaPath === undefined) { " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '"; } ';
            if (it.opts.verbose) {
              out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; ";
            }
            out += " } } ";
          }
        }
      } else if ($macro) {
        out += "   var err =   ";
        if (it.createErrors !== false) {
          out += " { keyword: '" + ($errorKeyword || "custom") + "' , dataPath: (dataPath || '') + " + it.errorPath + " , schemaPath: " + it.util.toQuotedString($errSchemaPath) + " , params: { keyword: '" + $rule.keyword + "' } ";
          if (it.opts.messages !== false) {
            out += ` , message: 'should pass "` + $rule.keyword + `" keyword validation' `;
          }
          if (it.opts.verbose) {
            out += " , schema: validate.schema" + $schemaPath + " , parentSchema: validate.schema" + it.schemaPath + " , data: " + $data + " ";
          }
          out += " } ";
        } else {
          out += " {} ";
        }
        out += ";  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; ";
        if (!it.compositeRule && $breakOnError) {
          if (it.async) {
            out += " throw new ValidationError(vErrors); ";
          } else {
            out += " validate.errors = vErrors; return false; ";
          }
        }
      } else {
        if ($rDef.errors === false) {
          out += " " + def_customError + " ";
        } else {
          out += " if (Array.isArray(" + $ruleErrs + ")) { if (vErrors === null) vErrors = " + $ruleErrs + "; else vErrors = vErrors.concat(" + $ruleErrs + "); errors = vErrors.length;  for (var " + $i + "=" + $errs + "; " + $i + "<errors; " + $i + "++) { var " + $ruleErr + " = vErrors[" + $i + "]; if (" + $ruleErr + ".dataPath === undefined) " + $ruleErr + ".dataPath = (dataPath || '') + " + it.errorPath + ";  " + $ruleErr + '.schemaPath = "' + $errSchemaPath + '";  ';
          if (it.opts.verbose) {
            out += " " + $ruleErr + ".schema = " + $schemaValue + "; " + $ruleErr + ".data = " + $data + "; ";
          }
          out += " } } else { " + def_customError + " } ";
        }
      }
      out += " } ";
      if ($breakOnError) {
        out += " else { ";
      }
    }
    return out;
  };
  const $schema$1 = "http://json-schema.org/draft-07/schema#";
  const $id$1 = "http://json-schema.org/draft-07/schema#";
  const title = "Core schema meta-schema";
  const definitions = {
    schemaArray: {
      type: "array",
      minItems: 1,
      items: {
        $ref: "#"
      }
    },
    nonNegativeInteger: {
      type: "integer",
      minimum: 0
    },
    nonNegativeIntegerDefault0: {
      allOf: [
        {
          $ref: "#/definitions/nonNegativeInteger"
        },
        {
          "default": 0
        }
      ]
    },
    simpleTypes: {
      "enum": [
        "array",
        "boolean",
        "integer",
        "null",
        "number",
        "object",
        "string"
      ]
    },
    stringArray: {
      type: "array",
      items: {
        type: "string"
      },
      uniqueItems: true,
      "default": []
    }
  };
  const type$3 = [
    "object",
    "boolean"
  ];
  const properties$2 = {
    $id: {
      type: "string",
      format: "uri-reference"
    },
    $schema: {
      type: "string",
      format: "uri"
    },
    $ref: {
      type: "string",
      format: "uri-reference"
    },
    $comment: {
      type: "string"
    },
    title: {
      type: "string"
    },
    description: {
      type: "string"
    },
    "default": true,
    readOnly: {
      type: "boolean",
      "default": false
    },
    examples: {
      type: "array",
      items: true
    },
    multipleOf: {
      type: "number",
      exclusiveMinimum: 0
    },
    maximum: {
      type: "number"
    },
    exclusiveMaximum: {
      type: "number"
    },
    minimum: {
      type: "number"
    },
    exclusiveMinimum: {
      type: "number"
    },
    maxLength: {
      $ref: "#/definitions/nonNegativeInteger"
    },
    minLength: {
      $ref: "#/definitions/nonNegativeIntegerDefault0"
    },
    pattern: {
      type: "string",
      format: "regex"
    },
    additionalItems: {
      $ref: "#"
    },
    items: {
      anyOf: [
        {
          $ref: "#"
        },
        {
          $ref: "#/definitions/schemaArray"
        }
      ],
      "default": true
    },
    maxItems: {
      $ref: "#/definitions/nonNegativeInteger"
    },
    minItems: {
      $ref: "#/definitions/nonNegativeIntegerDefault0"
    },
    uniqueItems: {
      type: "boolean",
      "default": false
    },
    contains: {
      $ref: "#"
    },
    maxProperties: {
      $ref: "#/definitions/nonNegativeInteger"
    },
    minProperties: {
      $ref: "#/definitions/nonNegativeIntegerDefault0"
    },
    required: {
      $ref: "#/definitions/stringArray"
    },
    additionalProperties: {
      $ref: "#"
    },
    definitions: {
      type: "object",
      additionalProperties: {
        $ref: "#"
      },
      "default": {}
    },
    properties: {
      type: "object",
      additionalProperties: {
        $ref: "#"
      },
      "default": {}
    },
    patternProperties: {
      type: "object",
      additionalProperties: {
        $ref: "#"
      },
      propertyNames: {
        format: "regex"
      },
      "default": {}
    },
    dependencies: {
      type: "object",
      additionalProperties: {
        anyOf: [
          {
            $ref: "#"
          },
          {
            $ref: "#/definitions/stringArray"
          }
        ]
      }
    },
    propertyNames: {
      $ref: "#"
    },
    "const": true,
    "enum": {
      type: "array",
      items: true,
      minItems: 1,
      uniqueItems: true
    },
    type: {
      anyOf: [
        {
          $ref: "#/definitions/simpleTypes"
        },
        {
          type: "array",
          items: {
            $ref: "#/definitions/simpleTypes"
          },
          minItems: 1,
          uniqueItems: true
        }
      ]
    },
    format: {
      type: "string"
    },
    contentMediaType: {
      type: "string"
    },
    contentEncoding: {
      type: "string"
    },
    "if": {
      $ref: "#"
    },
    then: {
      $ref: "#"
    },
    "else": {
      $ref: "#"
    },
    allOf: {
      $ref: "#/definitions/schemaArray"
    },
    anyOf: {
      $ref: "#/definitions/schemaArray"
    },
    oneOf: {
      $ref: "#/definitions/schemaArray"
    },
    not: {
      $ref: "#"
    }
  };
  const require$$13 = {
    $schema: $schema$1,
    $id: $id$1,
    title,
    definitions,
    type: type$3,
    properties: properties$2,
    "default": true
  };
  var metaSchema = require$$13;
  var definition_schema = {
    $id: "https://github.com/ajv-validator/ajv/blob/master/lib/definition_schema.js",
    definitions: {
      simpleTypes: metaSchema.definitions.simpleTypes
    },
    type: "object",
    dependencies: {
      schema: ["validate"],
      $data: ["validate"],
      statements: ["inline"],
      valid: { not: { required: ["macro"] } }
    },
    properties: {
      type: metaSchema.properties.type,
      schema: { type: "boolean" },
      statements: { type: "boolean" },
      dependencies: {
        type: "array",
        items: { type: "string" }
      },
      metaSchema: { type: "object" },
      modifying: { type: "boolean" },
      valid: { type: "boolean" },
      $data: { type: "boolean" },
      async: { type: "boolean" },
      errors: {
        anyOf: [
          { type: "boolean" },
          { const: "full" }
        ]
      }
    }
  };
  var IDENTIFIER = /^[a-z_$][a-z0-9_$-]*$/i;
  var customRuleCode = custom;
  var definitionSchema = definition_schema;
  var keyword = {
    add: addKeyword,
    get: getKeyword,
    remove: removeKeyword,
    validate: validateKeyword
  };
  function addKeyword(keyword2, definition) {
    var RULES = this.RULES;
    if (RULES.keywords[keyword2])
      throw new Error("Keyword " + keyword2 + " is already defined");
    if (!IDENTIFIER.test(keyword2))
      throw new Error("Keyword " + keyword2 + " is not a valid identifier");
    if (definition) {
      this.validateKeyword(definition, true);
      var dataType = definition.type;
      if (Array.isArray(dataType)) {
        for (var i = 0; i < dataType.length; i++)
          _addRule(keyword2, dataType[i], definition);
      } else {
        _addRule(keyword2, dataType, definition);
      }
      var metaSchema2 = definition.metaSchema;
      if (metaSchema2) {
        if (definition.$data && this._opts.$data) {
          metaSchema2 = {
            anyOf: [
              metaSchema2,
              { "$ref": "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#" }
            ]
          };
        }
        definition.validateSchema = this.compile(metaSchema2, true);
      }
    }
    RULES.keywords[keyword2] = RULES.all[keyword2] = true;
    function _addRule(keyword3, dataType2, definition2) {
      var ruleGroup;
      for (var i2 = 0; i2 < RULES.length; i2++) {
        var rg = RULES[i2];
        if (rg.type == dataType2) {
          ruleGroup = rg;
          break;
        }
      }
      if (!ruleGroup) {
        ruleGroup = { type: dataType2, rules: [] };
        RULES.push(ruleGroup);
      }
      var rule = {
        keyword: keyword3,
        definition: definition2,
        custom: true,
        code: customRuleCode,
        implements: definition2.implements
      };
      ruleGroup.rules.push(rule);
      RULES.custom[keyword3] = rule;
    }
    return this;
  }
  function getKeyword(keyword2) {
    var rule = this.RULES.custom[keyword2];
    return rule ? rule.definition : this.RULES.keywords[keyword2] || false;
  }
  function removeKeyword(keyword2) {
    var RULES = this.RULES;
    delete RULES.keywords[keyword2];
    delete RULES.all[keyword2];
    delete RULES.custom[keyword2];
    for (var i = 0; i < RULES.length; i++) {
      var rules3 = RULES[i].rules;
      for (var j = 0; j < rules3.length; j++) {
        if (rules3[j].keyword == keyword2) {
          rules3.splice(j, 1);
          break;
        }
      }
    }
    return this;
  }
  function validateKeyword(definition, throwError) {
    validateKeyword.errors = null;
    var v2 = this._validateKeyword = this._validateKeyword || this.compile(definitionSchema, true);
    if (v2(definition)) return true;
    validateKeyword.errors = v2.errors;
    if (throwError)
      throw new Error("custom keyword definition is invalid: " + this.errorsText(v2.errors));
    else
      return false;
  }
  const $schema = "http://json-schema.org/draft-07/schema#";
  const $id = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
  const description = "Meta-schema for $data reference (JSON Schema extension proposal)";
  const type$2 = "object";
  const required = [
    "$data"
  ];
  const properties$1 = {
    $data: {
      type: "string",
      anyOf: [
        {
          format: "relative-json-pointer"
        },
        {
          format: "json-pointer"
        }
      ]
    }
  };
  const additionalProperties = false;
  const require$$12 = {
    $schema,
    $id,
    description,
    type: type$2,
    required,
    properties: properties$1,
    additionalProperties
  };
  var compileSchema = compile_1, resolve = resolve_1, Cache2 = cacheExports, SchemaObject = schema_obj, stableStringify = fastJsonStableStringify, formats = formats_1, rules2 = rules$1, $dataMetaSchema = data, util = util$5;
  var ajv = Ajv;
  Ajv.prototype.validate = validate;
  Ajv.prototype.compile = compile;
  Ajv.prototype.addSchema = addSchema;
  Ajv.prototype.addMetaSchema = addMetaSchema;
  Ajv.prototype.validateSchema = validateSchema;
  Ajv.prototype.getSchema = getSchema;
  Ajv.prototype.removeSchema = removeSchema;
  Ajv.prototype.addFormat = addFormat$1;
  Ajv.prototype.errorsText = errorsText;
  Ajv.prototype._addSchema = _addSchema;
  Ajv.prototype._compile = _compile;
  Ajv.prototype.compileAsync = async;
  var customKeyword = keyword;
  Ajv.prototype.addKeyword = customKeyword.add;
  Ajv.prototype.getKeyword = customKeyword.get;
  Ajv.prototype.removeKeyword = customKeyword.remove;
  Ajv.prototype.validateKeyword = customKeyword.validate;
  var errorClasses = error_classes;
  Ajv.ValidationError = errorClasses.Validation;
  Ajv.MissingRefError = errorClasses.MissingRef;
  Ajv.$dataMetaSchema = $dataMetaSchema;
  var META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
  var META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes", "strictDefaults"];
  var META_SUPPORT_DATA = ["/properties"];
  function Ajv(opts) {
    if (!(this instanceof Ajv)) return new Ajv(opts);
    opts = this._opts = util.copy(opts) || {};
    setLogger(this);
    this._schemas = {};
    this._refs = {};
    this._fragments = {};
    this._formats = formats(opts.format);
    this._cache = opts.cache || new Cache2();
    this._loadingSchemas = {};
    this._compilations = [];
    this.RULES = rules2();
    this._getId = chooseGetId(opts);
    opts.loopRequired = opts.loopRequired || Infinity;
    if (opts.errorDataPath == "property") opts._errorDataPathProperty = true;
    if (opts.serialize === void 0) opts.serialize = stableStringify;
    this._metaOpts = getMetaSchemaOptions(this);
    if (opts.formats) addInitialFormats(this);
    if (opts.keywords) addInitialKeywords(this);
    addDefaultMetaSchema(this);
    if (typeof opts.meta == "object") this.addMetaSchema(opts.meta);
    if (opts.nullable) this.addKeyword("nullable", { metaSchema: { type: "boolean" } });
    addInitialSchemas(this);
  }
  function validate(schemaKeyRef, data2) {
    var v2;
    if (typeof schemaKeyRef == "string") {
      v2 = this.getSchema(schemaKeyRef);
      if (!v2) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
    } else {
      var schemaObj = this._addSchema(schemaKeyRef);
      v2 = schemaObj.validate || this._compile(schemaObj);
    }
    var valid = v2(data2);
    if (v2.$async !== true) this.errors = v2.errors;
    return valid;
  }
  function compile(schema, _meta) {
    var schemaObj = this._addSchema(schema, void 0, _meta);
    return schemaObj.validate || this._compile(schemaObj);
  }
  function addSchema(schema, key, _skipValidation, _meta) {
    if (Array.isArray(schema)) {
      for (var i = 0; i < schema.length; i++) this.addSchema(schema[i], void 0, _skipValidation, _meta);
      return this;
    }
    var id = this._getId(schema);
    if (id !== void 0 && typeof id != "string")
      throw new Error("schema id must be string");
    key = resolve.normalizeId(key || id);
    checkUnique(this, key);
    this._schemas[key] = this._addSchema(schema, _skipValidation, _meta, true);
    return this;
  }
  function addMetaSchema(schema, key, skipValidation) {
    this.addSchema(schema, key, skipValidation, true);
    return this;
  }
  function validateSchema(schema, throwOrLogError) {
    var $schema2 = schema.$schema;
    if ($schema2 !== void 0 && typeof $schema2 != "string")
      throw new Error("$schema must be a string");
    $schema2 = $schema2 || this._opts.defaultMeta || defaultMeta(this);
    if (!$schema2) {
      this.logger.warn("meta-schema not available");
      this.errors = null;
      return true;
    }
    var valid = this.validate($schema2, schema);
    if (!valid && throwOrLogError) {
      var message = "schema is invalid: " + this.errorsText();
      if (this._opts.validateSchema == "log") this.logger.error(message);
      else throw new Error(message);
    }
    return valid;
  }
  function defaultMeta(self2) {
    var meta = self2._opts.meta;
    self2._opts.defaultMeta = typeof meta == "object" ? self2._getId(meta) || meta : self2.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0;
    return self2._opts.defaultMeta;
  }
  function getSchema(keyRef) {
    var schemaObj = _getSchemaObj(this, keyRef);
    switch (typeof schemaObj) {
      case "object":
        return schemaObj.validate || this._compile(schemaObj);
      case "string":
        return this.getSchema(schemaObj);
      case "undefined":
        return _getSchemaFragment(this, keyRef);
    }
  }
  function _getSchemaFragment(self2, ref2) {
    var res = resolve.schema.call(self2, { schema: {} }, ref2);
    if (res) {
      var schema = res.schema, root = res.root, baseId = res.baseId;
      var v2 = compileSchema.call(self2, schema, root, void 0, baseId);
      self2._fragments[ref2] = new SchemaObject({
        ref: ref2,
        fragment: true,
        schema,
        root,
        baseId,
        validate: v2
      });
      return v2;
    }
  }
  function _getSchemaObj(self2, keyRef) {
    keyRef = resolve.normalizeId(keyRef);
    return self2._schemas[keyRef] || self2._refs[keyRef] || self2._fragments[keyRef];
  }
  function removeSchema(schemaKeyRef) {
    if (schemaKeyRef instanceof RegExp) {
      _removeAllSchemas(this, this._schemas, schemaKeyRef);
      _removeAllSchemas(this, this._refs, schemaKeyRef);
      return this;
    }
    switch (typeof schemaKeyRef) {
      case "undefined":
        _removeAllSchemas(this, this._schemas);
        _removeAllSchemas(this, this._refs);
        this._cache.clear();
        return this;
      case "string":
        var schemaObj = _getSchemaObj(this, schemaKeyRef);
        if (schemaObj) this._cache.del(schemaObj.cacheKey);
        delete this._schemas[schemaKeyRef];
        delete this._refs[schemaKeyRef];
        return this;
      case "object":
        var serialize2 = this._opts.serialize;
        var cacheKey = serialize2 ? serialize2(schemaKeyRef) : schemaKeyRef;
        this._cache.del(cacheKey);
        var id = this._getId(schemaKeyRef);
        if (id) {
          id = resolve.normalizeId(id);
          delete this._schemas[id];
          delete this._refs[id];
        }
    }
    return this;
  }
  function _removeAllSchemas(self2, schemas, regex2) {
    for (var keyRef in schemas) {
      var schemaObj = schemas[keyRef];
      if (!schemaObj.meta && (!regex2 || regex2.test(keyRef))) {
        self2._cache.del(schemaObj.cacheKey);
        delete schemas[keyRef];
      }
    }
  }
  function _addSchema(schema, skipValidation, meta, shouldAddSchema) {
    if (typeof schema != "object" && typeof schema != "boolean")
      throw new Error("schema should be object or boolean");
    var serialize2 = this._opts.serialize;
    var cacheKey = serialize2 ? serialize2(schema) : schema;
    var cached = this._cache.get(cacheKey);
    if (cached) return cached;
    shouldAddSchema = shouldAddSchema || this._opts.addUsedSchema !== false;
    var id = resolve.normalizeId(this._getId(schema));
    if (id && shouldAddSchema) checkUnique(this, id);
    var willValidate = this._opts.validateSchema !== false && !skipValidation;
    var recursiveMeta;
    if (willValidate && !(recursiveMeta = id && id == resolve.normalizeId(schema.$schema)))
      this.validateSchema(schema, true);
    var localRefs = resolve.ids.call(this, schema);
    var schemaObj = new SchemaObject({
      id,
      schema,
      localRefs,
      cacheKey,
      meta
    });
    if (id[0] != "#" && shouldAddSchema) this._refs[id] = schemaObj;
    this._cache.put(cacheKey, schemaObj);
    if (willValidate && recursiveMeta) this.validateSchema(schema, true);
    return schemaObj;
  }
  function _compile(schemaObj, root) {
    if (schemaObj.compiling) {
      schemaObj.validate = callValidate;
      callValidate.schema = schemaObj.schema;
      callValidate.errors = null;
      callValidate.root = root ? root : callValidate;
      if (schemaObj.schema.$async === true)
        callValidate.$async = true;
      return callValidate;
    }
    schemaObj.compiling = true;
    var currentOpts;
    if (schemaObj.meta) {
      currentOpts = this._opts;
      this._opts = this._metaOpts;
    }
    var v2;
    try {
      v2 = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs);
    } catch (e2) {
      delete schemaObj.validate;
      throw e2;
    } finally {
      schemaObj.compiling = false;
      if (schemaObj.meta) this._opts = currentOpts;
    }
    schemaObj.validate = v2;
    schemaObj.refs = v2.refs;
    schemaObj.refVal = v2.refVal;
    schemaObj.root = v2.root;
    return v2;
    function callValidate() {
      var _validate = schemaObj.validate;
      var result = _validate.apply(this, arguments);
      callValidate.errors = _validate.errors;
      return result;
    }
  }
  function chooseGetId(opts) {
    switch (opts.schemaId) {
      case "auto":
        return _get$IdOrId;
      case "id":
        return _getId;
      default:
        return _get$Id;
    }
  }
  function _getId(schema) {
    if (schema.$id) this.logger.warn("schema $id ignored", schema.$id);
    return schema.id;
  }
  function _get$Id(schema) {
    if (schema.id) this.logger.warn("schema id ignored", schema.id);
    return schema.$id;
  }
  function _get$IdOrId(schema) {
    if (schema.$id && schema.id && schema.$id != schema.id)
      throw new Error("schema $id is different from id");
    return schema.$id || schema.id;
  }
  function errorsText(errors, options) {
    errors = errors || this.errors;
    if (!errors) return "No errors";
    options = options || {};
    var separator = options.separator === void 0 ? ", " : options.separator;
    var dataVar = options.dataVar === void 0 ? "data" : options.dataVar;
    var text = "";
    for (var i = 0; i < errors.length; i++) {
      var e2 = errors[i];
      if (e2) text += dataVar + e2.dataPath + " " + e2.message + separator;
    }
    return text.slice(0, -separator.length);
  }
  function addFormat$1(name, format2) {
    if (typeof format2 == "string") format2 = new RegExp(format2);
    this._formats[name] = format2;
    return this;
  }
  function addDefaultMetaSchema(self2) {
    var $dataSchema;
    if (self2._opts.$data) {
      $dataSchema = require$$12;
      self2.addMetaSchema($dataSchema, $dataSchema.$id, true);
    }
    if (self2._opts.meta === false) return;
    var metaSchema2 = require$$13;
    if (self2._opts.$data) metaSchema2 = $dataMetaSchema(metaSchema2, META_SUPPORT_DATA);
    self2.addMetaSchema(metaSchema2, META_SCHEMA_ID, true);
    self2._refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
  }
  function addInitialSchemas(self2) {
    var optsSchemas = self2._opts.schemas;
    if (!optsSchemas) return;
    if (Array.isArray(optsSchemas)) self2.addSchema(optsSchemas);
    else for (var key in optsSchemas) self2.addSchema(optsSchemas[key], key);
  }
  function addInitialFormats(self2) {
    for (var name in self2._opts.formats) {
      var format2 = self2._opts.formats[name];
      self2.addFormat(name, format2);
    }
  }
  function addInitialKeywords(self2) {
    for (var name in self2._opts.keywords) {
      var keyword2 = self2._opts.keywords[name];
      self2.addKeyword(name, keyword2);
    }
  }
  function checkUnique(self2, id) {
    if (self2._schemas[id] || self2._refs[id])
      throw new Error('schema with key or id "' + id + '" already exists');
  }
  function getMetaSchemaOptions(self2) {
    var metaOpts = util.copy(self2._opts);
    for (var i = 0; i < META_IGNORE_OPTIONS.length; i++)
      delete metaOpts[META_IGNORE_OPTIONS[i]];
    return metaOpts;
  }
  function setLogger(self2) {
    var logger = self2._opts.logger;
    if (logger === false) {
      self2.logger = { log: noop, warn: noop, error: noop };
    } else {
      if (logger === void 0) logger = console;
      if (!(typeof logger == "object" && logger.log && logger.warn && logger.error))
        throw new Error("logger must implement log, warn and error methods");
      self2.logger = logger;
    }
  }
  function noop() {
  }
  const Ajv$1 = /* @__PURE__ */ getDefaultExportFromCjs(ajv);
  class Server extends Protocol {
    /**
     * Initializes this server with the given name and version information.
     */
    constructor(_serverInfo, options) {
      var _a;
      super(options);
      this._serverInfo = _serverInfo;
      this._capabilities = (_a = options === null || options === void 0 ? void 0 : options.capabilities) !== null && _a !== void 0 ? _a : {};
      this._instructions = options === null || options === void 0 ? void 0 : options.instructions;
      this.setRequestHandler(InitializeRequestSchema, (request) => this._oninitialize(request));
      this.setNotificationHandler(InitializedNotificationSchema, () => {
        var _a2;
        return (_a2 = this.oninitialized) === null || _a2 === void 0 ? void 0 : _a2.call(this);
      });
    }
    /**
     * Registers new capabilities. This can only be called before connecting to a transport.
     *
     * The new capabilities will be merged with any existing capabilities previously given (e.g., at initialization).
     */
    registerCapabilities(capabilities) {
      if (this.transport) {
        throw new Error("Cannot register capabilities after connecting to transport");
      }
      this._capabilities = mergeCapabilities(this._capabilities, capabilities);
    }
    assertCapabilityForMethod(method) {
      var _a, _b, _c;
      switch (method) {
        case "sampling/createMessage":
          if (!((_a = this._clientCapabilities) === null || _a === void 0 ? void 0 : _a.sampling)) {
            throw new Error(`Client does not support sampling (required for ${method})`);
          }
          break;
        case "elicitation/create":
          if (!((_b = this._clientCapabilities) === null || _b === void 0 ? void 0 : _b.elicitation)) {
            throw new Error(`Client does not support elicitation (required for ${method})`);
          }
          break;
        case "roots/list":
          if (!((_c = this._clientCapabilities) === null || _c === void 0 ? void 0 : _c.roots)) {
            throw new Error(`Client does not support listing roots (required for ${method})`);
          }
          break;
      }
    }
    assertNotificationCapability(method) {
      switch (method) {
        case "notifications/message":
          if (!this._capabilities.logging) {
            throw new Error(`Server does not support logging (required for ${method})`);
          }
          break;
        case "notifications/resources/updated":
        case "notifications/resources/list_changed":
          if (!this._capabilities.resources) {
            throw new Error(`Server does not support notifying about resources (required for ${method})`);
          }
          break;
        case "notifications/tools/list_changed":
          if (!this._capabilities.tools) {
            throw new Error(`Server does not support notifying of tool list changes (required for ${method})`);
          }
          break;
        case "notifications/prompts/list_changed":
          if (!this._capabilities.prompts) {
            throw new Error(`Server does not support notifying of prompt list changes (required for ${method})`);
          }
          break;
      }
    }
    assertRequestHandlerCapability(method) {
      switch (method) {
        case "sampling/createMessage":
          if (!this._capabilities.sampling) {
            throw new Error(`Server does not support sampling (required for ${method})`);
          }
          break;
        case "logging/setLevel":
          if (!this._capabilities.logging) {
            throw new Error(`Server does not support logging (required for ${method})`);
          }
          break;
        case "prompts/get":
        case "prompts/list":
          if (!this._capabilities.prompts) {
            throw new Error(`Server does not support prompts (required for ${method})`);
          }
          break;
        case "resources/list":
        case "resources/templates/list":
        case "resources/read":
          if (!this._capabilities.resources) {
            throw new Error(`Server does not support resources (required for ${method})`);
          }
          break;
        case "tools/call":
        case "tools/list":
          if (!this._capabilities.tools) {
            throw new Error(`Server does not support tools (required for ${method})`);
          }
          break;
      }
    }
    async _oninitialize(request) {
      const requestedVersion = request.params.protocolVersion;
      this._clientCapabilities = request.params.capabilities;
      this._clientVersion = request.params.clientInfo;
      const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requestedVersion) ? requestedVersion : LATEST_PROTOCOL_VERSION;
      return {
        protocolVersion,
        capabilities: this.getCapabilities(),
        serverInfo: this._serverInfo,
        ...this._instructions && { instructions: this._instructions }
      };
    }
    /**
     * After initialization has completed, this will be populated with the client's reported capabilities.
     */
    getClientCapabilities() {
      return this._clientCapabilities;
    }
    /**
     * After initialization has completed, this will be populated with information about the client's name and version.
     */
    getClientVersion() {
      return this._clientVersion;
    }
    getCapabilities() {
      return this._capabilities;
    }
    async ping() {
      return this.request({ method: "ping" }, EmptyResultSchema);
    }
    async createMessage(params, options) {
      return this.request({ method: "sampling/createMessage", params }, CreateMessageResultSchema, options);
    }
    async elicitInput(params, options) {
      const result = await this.request({ method: "elicitation/create", params }, ElicitResultSchema, options);
      if (result.action === "accept" && result.content) {
        try {
          const ajv2 = new Ajv$1();
          const validate2 = ajv2.compile(params.requestedSchema);
          const isValid2 = validate2(result.content);
          if (!isValid2) {
            throw new McpError(ErrorCode.InvalidParams, `Elicitation response content does not match requested schema: ${ajv2.errorsText(validate2.errors)}`);
          }
        } catch (error) {
          if (error instanceof McpError) {
            throw error;
          }
          throw new McpError(ErrorCode.InternalError, `Error validating elicitation response: ${error}`);
        }
      }
      return result;
    }
    async listRoots(params, options) {
      return this.request({ method: "roots/list", params }, ListRootsResultSchema, options);
    }
    async sendLoggingMessage(params) {
      return this.notification({ method: "notifications/message", params });
    }
    async sendResourceUpdated(params) {
      return this.notification({
        method: "notifications/resources/updated",
        params
      });
    }
    async sendResourceListChanged() {
      return this.notification({
        method: "notifications/resources/list_changed"
      });
    }
    async sendToolListChanged() {
      return this.notification({ method: "notifications/tools/list_changed" });
    }
    async sendPromptListChanged() {
      return this.notification({ method: "notifications/prompts/list_changed" });
    }
  }
  const ignoreOverride = Symbol("Let zodToJsonSchema decide on which parser to use");
  const defaultOptions = {
    name: void 0,
    $refStrategy: "root",
    basePath: ["#"],
    effectStrategy: "input",
    pipeStrategy: "all",
    dateStrategy: "format:date-time",
    mapStrategy: "entries",
    removeAdditionalStrategy: "passthrough",
    allowedAdditionalProperties: true,
    rejectedAdditionalProperties: false,
    definitionPath: "definitions",
    target: "jsonSchema7",
    strictUnions: false,
    definitions: {},
    errorMessages: false,
    markdownDescription: false,
    patternStrategy: "escape",
    applyRegexFlags: false,
    emailStrategy: "format:email",
    base64Strategy: "contentEncoding:base64",
    nameStrategy: "ref",
    openAiAnyTypeName: "OpenAiAnyType"
  };
  const getDefaultOptions = (options) => typeof options === "string" ? {
    ...defaultOptions,
    name: options
  } : {
    ...defaultOptions,
    ...options
  };
  const getRefs = (options) => {
    const _options = getDefaultOptions(options);
    const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
    return {
      ..._options,
      flags: { hasReferencedOpenAiAnyType: false },
      currentPath,
      propertyPath: void 0,
      seen: new Map(Object.entries(_options.definitions).map(([name, def]) => [
        def._def,
        {
          def: def._def,
          path: [..._options.basePath, _options.definitionPath, name],
          // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
          jsonSchema: void 0
        }
      ]))
    };
  };
  function addErrorMessage(res, key, errorMessage, refs) {
    if (!(refs == null ? void 0 : refs.errorMessages))
      return;
    if (errorMessage) {
      res.errorMessage = {
        ...res.errorMessage,
        [key]: errorMessage
      };
    }
  }
  function setResponseValueAndErrors(res, key, value, errorMessage, refs) {
    res[key] = value;
    addErrorMessage(res, key, errorMessage, refs);
  }
  const getRelativePath = (pathA, pathB) => {
    let i = 0;
    for (; i < pathA.length && i < pathB.length; i++) {
      if (pathA[i] !== pathB[i])
        break;
    }
    return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
  };
  function parseAnyDef(refs) {
    if (refs.target !== "openAi") {
      return {};
    }
    const anyDefinitionPath = [
      ...refs.basePath,
      refs.definitionPath,
      refs.openAiAnyTypeName
    ];
    refs.flags.hasReferencedOpenAiAnyType = true;
    return {
      $ref: refs.$refStrategy === "relative" ? getRelativePath(anyDefinitionPath, refs.currentPath) : anyDefinitionPath.join("/")
    };
  }
  function parseArrayDef(def, refs) {
    var _a, _b, _c;
    const res = {
      type: "array"
    };
    if (((_a = def.type) == null ? void 0 : _a._def) && ((_c = (_b = def.type) == null ? void 0 : _b._def) == null ? void 0 : _c.typeName) !== ZodFirstPartyTypeKind.ZodAny) {
      res.items = parseDef(def.type._def, {
        ...refs,
        currentPath: [...refs.currentPath, "items"]
      });
    }
    if (def.minLength) {
      setResponseValueAndErrors(res, "minItems", def.minLength.value, def.minLength.message, refs);
    }
    if (def.maxLength) {
      setResponseValueAndErrors(res, "maxItems", def.maxLength.value, def.maxLength.message, refs);
    }
    if (def.exactLength) {
      setResponseValueAndErrors(res, "minItems", def.exactLength.value, def.exactLength.message, refs);
      setResponseValueAndErrors(res, "maxItems", def.exactLength.value, def.exactLength.message, refs);
    }
    return res;
  }
  function parseBigintDef(def, refs) {
    const res = {
      type: "integer",
      format: "int64"
    };
    if (!def.checks)
      return res;
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          if (refs.target === "jsonSchema7") {
            if (check.inclusive) {
              setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
            } else {
              setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
            }
          } else {
            if (!check.inclusive) {
              res.exclusiveMinimum = true;
            }
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          }
          break;
        case "max":
          if (refs.target === "jsonSchema7") {
            if (check.inclusive) {
              setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
            } else {
              setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
            }
          } else {
            if (!check.inclusive) {
              res.exclusiveMaximum = true;
            }
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          }
          break;
        case "multipleOf":
          setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
          break;
      }
    }
    return res;
  }
  function parseBooleanDef() {
    return {
      type: "boolean"
    };
  }
  function parseBrandedDef(_def, refs) {
    return parseDef(_def.type._def, refs);
  }
  const parseCatchDef = (def, refs) => {
    return parseDef(def.innerType._def, refs);
  };
  function parseDateDef(def, refs, overrideDateStrategy) {
    const strategy = overrideDateStrategy ?? refs.dateStrategy;
    if (Array.isArray(strategy)) {
      return {
        anyOf: strategy.map((item, i) => parseDateDef(def, refs, item))
      };
    }
    switch (strategy) {
      case "string":
      case "format:date-time":
        return {
          type: "string",
          format: "date-time"
        };
      case "format:date":
        return {
          type: "string",
          format: "date"
        };
      case "integer":
        return integerDateParser(def, refs);
    }
  }
  const integerDateParser = (def, refs) => {
    const res = {
      type: "integer",
      format: "unix-time"
    };
    if (refs.target === "openApi3") {
      return res;
    }
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          setResponseValueAndErrors(
            res,
            "minimum",
            check.value,
            // This is in milliseconds
            check.message,
            refs
          );
          break;
        case "max":
          setResponseValueAndErrors(
            res,
            "maximum",
            check.value,
            // This is in milliseconds
            check.message,
            refs
          );
          break;
      }
    }
    return res;
  };
  function parseDefaultDef(_def, refs) {
    return {
      ...parseDef(_def.innerType._def, refs),
      default: _def.defaultValue()
    };
  }
  function parseEffectsDef(_def, refs) {
    return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : parseAnyDef(refs);
  }
  function parseEnumDef(def) {
    return {
      type: "string",
      enum: Array.from(def.values)
    };
  }
  const isJsonSchema7AllOfType = (type2) => {
    if ("type" in type2 && type2.type === "string")
      return false;
    return "allOf" in type2;
  };
  function parseIntersectionDef(def, refs) {
    const allOf2 = [
      parseDef(def.left._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", "0"]
      }),
      parseDef(def.right._def, {
        ...refs,
        currentPath: [...refs.currentPath, "allOf", "1"]
      })
    ].filter((x) => !!x);
    let unevaluatedProperties = refs.target === "jsonSchema2019-09" ? { unevaluatedProperties: false } : void 0;
    const mergedAllOf = [];
    allOf2.forEach((schema) => {
      if (isJsonSchema7AllOfType(schema)) {
        mergedAllOf.push(...schema.allOf);
        if (schema.unevaluatedProperties === void 0) {
          unevaluatedProperties = void 0;
        }
      } else {
        let nestedSchema = schema;
        if ("additionalProperties" in schema && schema.additionalProperties === false) {
          const { additionalProperties: additionalProperties2, ...rest } = schema;
          nestedSchema = rest;
        } else {
          unevaluatedProperties = void 0;
        }
        mergedAllOf.push(nestedSchema);
      }
    });
    return mergedAllOf.length ? {
      allOf: mergedAllOf,
      ...unevaluatedProperties
    } : void 0;
  }
  function parseLiteralDef(def, refs) {
    const parsedType = typeof def.value;
    if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
      return {
        type: Array.isArray(def.value) ? "array" : "object"
      };
    }
    if (refs.target === "openApi3") {
      return {
        type: parsedType === "bigint" ? "integer" : parsedType,
        enum: [def.value]
      };
    }
    return {
      type: parsedType === "bigint" ? "integer" : parsedType,
      const: def.value
    };
  }
  let emojiRegex = void 0;
  const zodPatterns = {
    /**
     * `c` was changed to `[cC]` to replicate /i flag
     */
    cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    /**
     * `a-z` was added to replicate /i flag
     */
    email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    /**
     * Constructed a valid Unicode RegExp
     *
     * Lazily instantiate since this type of regex isn't supported
     * in all envs (e.g. React Native).
     *
     * See:
     * https://github.com/colinhacks/zod/issues/2433
     * Fix in Zod:
     * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
     */
    emoji: () => {
      if (emojiRegex === void 0) {
        emojiRegex = RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u");
      }
      return emojiRegex;
    },
    /**
     * Unused
     */
    uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    /**
     * Unused
     */
    ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
    ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
    /**
     * Unused
     */
    ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
    ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
  };
  function parseStringDef(def, refs) {
    const res = {
      type: "string"
    };
    if (def.checks) {
      for (const check of def.checks) {
        switch (check.kind) {
          case "min":
            setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
            break;
          case "max":
            setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
            break;
          case "email":
            switch (refs.emailStrategy) {
              case "format:email":
                addFormat(res, "email", check.message, refs);
                break;
              case "format:idn-email":
                addFormat(res, "idn-email", check.message, refs);
                break;
              case "pattern:zod":
                addPattern(res, zodPatterns.email, check.message, refs);
                break;
            }
            break;
          case "url":
            addFormat(res, "uri", check.message, refs);
            break;
          case "uuid":
            addFormat(res, "uuid", check.message, refs);
            break;
          case "regex":
            addPattern(res, check.regex, check.message, refs);
            break;
          case "cuid":
            addPattern(res, zodPatterns.cuid, check.message, refs);
            break;
          case "cuid2":
            addPattern(res, zodPatterns.cuid2, check.message, refs);
            break;
          case "startsWith":
            addPattern(res, RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`), check.message, refs);
            break;
          case "endsWith":
            addPattern(res, RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`), check.message, refs);
            break;
          case "datetime":
            addFormat(res, "date-time", check.message, refs);
            break;
          case "date":
            addFormat(res, "date", check.message, refs);
            break;
          case "time":
            addFormat(res, "time", check.message, refs);
            break;
          case "duration":
            addFormat(res, "duration", check.message, refs);
            break;
          case "length":
            setResponseValueAndErrors(res, "minLength", typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value, check.message, refs);
            setResponseValueAndErrors(res, "maxLength", typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value, check.message, refs);
            break;
          case "includes": {
            addPattern(res, RegExp(escapeLiteralCheckValue(check.value, refs)), check.message, refs);
            break;
          }
          case "ip": {
            if (check.version !== "v6") {
              addFormat(res, "ipv4", check.message, refs);
            }
            if (check.version !== "v4") {
              addFormat(res, "ipv6", check.message, refs);
            }
            break;
          }
          case "base64url":
            addPattern(res, zodPatterns.base64url, check.message, refs);
            break;
          case "jwt":
            addPattern(res, zodPatterns.jwt, check.message, refs);
            break;
          case "cidr": {
            if (check.version !== "v6") {
              addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
            }
            if (check.version !== "v4") {
              addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
            }
            break;
          }
          case "emoji":
            addPattern(res, zodPatterns.emoji(), check.message, refs);
            break;
          case "ulid": {
            addPattern(res, zodPatterns.ulid, check.message, refs);
            break;
          }
          case "base64": {
            switch (refs.base64Strategy) {
              case "format:binary": {
                addFormat(res, "binary", check.message, refs);
                break;
              }
              case "contentEncoding:base64": {
                setResponseValueAndErrors(res, "contentEncoding", "base64", check.message, refs);
                break;
              }
              case "pattern:zod": {
                addPattern(res, zodPatterns.base64, check.message, refs);
                break;
              }
            }
            break;
          }
          case "nanoid": {
            addPattern(res, zodPatterns.nanoid, check.message, refs);
          }
        }
      }
    }
    return res;
  }
  function escapeLiteralCheckValue(literal, refs) {
    return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
  }
  const ALPHA_NUMERIC = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789");
  function escapeNonAlphaNumeric(source) {
    let result = "";
    for (let i = 0; i < source.length; i++) {
      if (!ALPHA_NUMERIC.has(source[i])) {
        result += "\\";
      }
      result += source[i];
    }
    return result;
  }
  function addFormat(schema, value, message, refs) {
    var _a;
    if (schema.format || ((_a = schema.anyOf) == null ? void 0 : _a.some((x) => x.format))) {
      if (!schema.anyOf) {
        schema.anyOf = [];
      }
      if (schema.format) {
        schema.anyOf.push({
          format: schema.format,
          ...schema.errorMessage && refs.errorMessages && {
            errorMessage: { format: schema.errorMessage.format }
          }
        });
        delete schema.format;
        if (schema.errorMessage) {
          delete schema.errorMessage.format;
          if (Object.keys(schema.errorMessage).length === 0) {
            delete schema.errorMessage;
          }
        }
      }
      schema.anyOf.push({
        format: value,
        ...message && refs.errorMessages && { errorMessage: { format: message } }
      });
    } else {
      setResponseValueAndErrors(schema, "format", value, message, refs);
    }
  }
  function addPattern(schema, regex2, message, refs) {
    var _a;
    if (schema.pattern || ((_a = schema.allOf) == null ? void 0 : _a.some((x) => x.pattern))) {
      if (!schema.allOf) {
        schema.allOf = [];
      }
      if (schema.pattern) {
        schema.allOf.push({
          pattern: schema.pattern,
          ...schema.errorMessage && refs.errorMessages && {
            errorMessage: { pattern: schema.errorMessage.pattern }
          }
        });
        delete schema.pattern;
        if (schema.errorMessage) {
          delete schema.errorMessage.pattern;
          if (Object.keys(schema.errorMessage).length === 0) {
            delete schema.errorMessage;
          }
        }
      }
      schema.allOf.push({
        pattern: stringifyRegExpWithFlags(regex2, refs),
        ...message && refs.errorMessages && { errorMessage: { pattern: message } }
      });
    } else {
      setResponseValueAndErrors(schema, "pattern", stringifyRegExpWithFlags(regex2, refs), message, refs);
    }
  }
  function stringifyRegExpWithFlags(regex2, refs) {
    var _a;
    if (!refs.applyRegexFlags || !regex2.flags) {
      return regex2.source;
    }
    const flags = {
      i: regex2.flags.includes("i"),
      m: regex2.flags.includes("m"),
      s: regex2.flags.includes("s")
      // `.` matches newlines
    };
    const source = flags.i ? regex2.source.toLowerCase() : regex2.source;
    let pattern2 = "";
    let isEscaped = false;
    let inCharGroup = false;
    let inCharRange = false;
    for (let i = 0; i < source.length; i++) {
      if (isEscaped) {
        pattern2 += source[i];
        isEscaped = false;
        continue;
      }
      if (flags.i) {
        if (inCharGroup) {
          if (source[i].match(/[a-z]/)) {
            if (inCharRange) {
              pattern2 += source[i];
              pattern2 += `${source[i - 2]}-${source[i]}`.toUpperCase();
              inCharRange = false;
            } else if (source[i + 1] === "-" && ((_a = source[i + 2]) == null ? void 0 : _a.match(/[a-z]/))) {
              pattern2 += source[i];
              inCharRange = true;
            } else {
              pattern2 += `${source[i]}${source[i].toUpperCase()}`;
            }
            continue;
          }
        } else if (source[i].match(/[a-z]/)) {
          pattern2 += `[${source[i]}${source[i].toUpperCase()}]`;
          continue;
        }
      }
      if (flags.m) {
        if (source[i] === "^") {
          pattern2 += `(^|(?<=[\r
]))`;
          continue;
        } else if (source[i] === "$") {
          pattern2 += `($|(?=[\r
]))`;
          continue;
        }
      }
      if (flags.s && source[i] === ".") {
        pattern2 += inCharGroup ? `${source[i]}\r
` : `[${source[i]}\r
]`;
        continue;
      }
      pattern2 += source[i];
      if (source[i] === "\\") {
        isEscaped = true;
      } else if (inCharGroup && source[i] === "]") {
        inCharGroup = false;
      } else if (!inCharGroup && source[i] === "[") {
        inCharGroup = true;
      }
    }
    try {
      new RegExp(pattern2);
    } catch {
      console.warn(`Could not convert regex pattern at ${refs.currentPath.join("/")} to a flag-independent form! Falling back to the flag-ignorant source`);
      return regex2.source;
    }
    return pattern2;
  }
  function parseRecordDef(def, refs) {
    var _a, _b, _c, _d, _e, _f;
    if (refs.target === "openAi") {
      console.warn("Warning: OpenAI may not support records in schemas! Try an array of key-value pairs instead.");
    }
    if (refs.target === "openApi3" && ((_a = def.keyType) == null ? void 0 : _a._def.typeName) === ZodFirstPartyTypeKind.ZodEnum) {
      return {
        type: "object",
        required: def.keyType._def.values,
        properties: def.keyType._def.values.reduce((acc, key) => ({
          ...acc,
          [key]: parseDef(def.valueType._def, {
            ...refs,
            currentPath: [...refs.currentPath, "properties", key]
          }) ?? parseAnyDef(refs)
        }), {}),
        additionalProperties: refs.rejectedAdditionalProperties
      };
    }
    const schema = {
      type: "object",
      additionalProperties: parseDef(def.valueType._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalProperties"]
      }) ?? refs.allowedAdditionalProperties
    };
    if (refs.target === "openApi3") {
      return schema;
    }
    if (((_b = def.keyType) == null ? void 0 : _b._def.typeName) === ZodFirstPartyTypeKind.ZodString && ((_c = def.keyType._def.checks) == null ? void 0 : _c.length)) {
      const { type: type2, ...keyType } = parseStringDef(def.keyType._def, refs);
      return {
        ...schema,
        propertyNames: keyType
      };
    } else if (((_d = def.keyType) == null ? void 0 : _d._def.typeName) === ZodFirstPartyTypeKind.ZodEnum) {
      return {
        ...schema,
        propertyNames: {
          enum: def.keyType._def.values
        }
      };
    } else if (((_e = def.keyType) == null ? void 0 : _e._def.typeName) === ZodFirstPartyTypeKind.ZodBranded && def.keyType._def.type._def.typeName === ZodFirstPartyTypeKind.ZodString && ((_f = def.keyType._def.type._def.checks) == null ? void 0 : _f.length)) {
      const { type: type2, ...keyType } = parseBrandedDef(def.keyType._def, refs);
      return {
        ...schema,
        propertyNames: keyType
      };
    }
    return schema;
  }
  function parseMapDef(def, refs) {
    if (refs.mapStrategy === "record") {
      return parseRecordDef(def, refs);
    }
    const keys7 = parseDef(def.keyType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items", "items", "0"]
    }) || parseAnyDef(refs);
    const values6 = parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items", "items", "1"]
    }) || parseAnyDef(refs);
    return {
      type: "array",
      maxItems: 125,
      items: {
        type: "array",
        items: [keys7, values6],
        minItems: 2,
        maxItems: 2
      }
    };
  }
  function parseNativeEnumDef(def) {
    const object = def.values;
    const actualKeys = Object.keys(def.values).filter((key) => {
      return typeof object[object[key]] !== "number";
    });
    const actualValues = actualKeys.map((key) => object[key]);
    const parsedTypes = Array.from(new Set(actualValues.map((values6) => typeof values6)));
    return {
      type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
      enum: actualValues
    };
  }
  function parseNeverDef(refs) {
    return refs.target === "openAi" ? void 0 : {
      not: parseAnyDef({
        ...refs,
        currentPath: [...refs.currentPath, "not"]
      })
    };
  }
  function parseNullDef(refs) {
    return refs.target === "openApi3" ? {
      enum: ["null"],
      nullable: true
    } : {
      type: "null"
    };
  }
  const primitiveMappings = {
    ZodString: "string",
    ZodNumber: "number",
    ZodBigInt: "integer",
    ZodBoolean: "boolean",
    ZodNull: "null"
  };
  function parseUnionDef(def, refs) {
    if (refs.target === "openApi3")
      return asAnyOf(def, refs);
    const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
    if (options.every((x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length))) {
      const types = options.reduce((types2, x) => {
        const type2 = primitiveMappings[x._def.typeName];
        return type2 && !types2.includes(type2) ? [...types2, type2] : types2;
      }, []);
      return {
        type: types.length > 1 ? types : types[0]
      };
    } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
      const types = options.reduce((acc, x) => {
        const type2 = typeof x._def.value;
        switch (type2) {
          case "string":
          case "number":
          case "boolean":
            return [...acc, type2];
          case "bigint":
            return [...acc, "integer"];
          case "object":
            if (x._def.value === null)
              return [...acc, "null"];
          case "symbol":
          case "undefined":
          case "function":
          default:
            return acc;
        }
      }, []);
      if (types.length === options.length) {
        const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
        return {
          type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
          enum: options.reduce((acc, x) => {
            return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
          }, [])
        };
      }
    } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
      return {
        type: "string",
        enum: options.reduce((acc, x) => [
          ...acc,
          ...x._def.values.filter((x2) => !acc.includes(x2))
        ], [])
      };
    }
    return asAnyOf(def, refs);
  }
  const asAnyOf = (def, refs) => {
    const anyOf2 = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map((x, i) => parseDef(x._def, {
      ...refs,
      currentPath: [...refs.currentPath, "anyOf", `${i}`]
    })).filter((x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0));
    return anyOf2.length ? { anyOf: anyOf2 } : void 0;
  };
  function parseNullableDef(def, refs) {
    if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(def.innerType._def.typeName) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
      if (refs.target === "openApi3") {
        return {
          type: primitiveMappings[def.innerType._def.typeName],
          nullable: true
        };
      }
      return {
        type: [
          primitiveMappings[def.innerType._def.typeName],
          "null"
        ]
      };
    }
    if (refs.target === "openApi3") {
      const base2 = parseDef(def.innerType._def, {
        ...refs,
        currentPath: [...refs.currentPath]
      });
      if (base2 && "$ref" in base2)
        return { allOf: [base2], nullable: true };
      return base2 && { ...base2, nullable: true };
    }
    const base = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "anyOf", "0"]
    });
    return base && { anyOf: [base, { type: "null" }] };
  }
  function parseNumberDef(def, refs) {
    const res = {
      type: "number"
    };
    if (!def.checks)
      return res;
    for (const check of def.checks) {
      switch (check.kind) {
        case "int":
          res.type = "integer";
          addErrorMessage(res, "type", check.message, refs);
          break;
        case "min":
          if (refs.target === "jsonSchema7") {
            if (check.inclusive) {
              setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
            } else {
              setResponseValueAndErrors(res, "exclusiveMinimum", check.value, check.message, refs);
            }
          } else {
            if (!check.inclusive) {
              res.exclusiveMinimum = true;
            }
            setResponseValueAndErrors(res, "minimum", check.value, check.message, refs);
          }
          break;
        case "max":
          if (refs.target === "jsonSchema7") {
            if (check.inclusive) {
              setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
            } else {
              setResponseValueAndErrors(res, "exclusiveMaximum", check.value, check.message, refs);
            }
          } else {
            if (!check.inclusive) {
              res.exclusiveMaximum = true;
            }
            setResponseValueAndErrors(res, "maximum", check.value, check.message, refs);
          }
          break;
        case "multipleOf":
          setResponseValueAndErrors(res, "multipleOf", check.value, check.message, refs);
          break;
      }
    }
    return res;
  }
  function parseObjectDef(def, refs) {
    const forceOptionalIntoNullable = refs.target === "openAi";
    const result = {
      type: "object",
      properties: {}
    };
    const required2 = [];
    const shape = def.shape();
    for (const propName in shape) {
      let propDef = shape[propName];
      if (propDef === void 0 || propDef._def === void 0) {
        continue;
      }
      let propOptional = safeIsOptional(propDef);
      if (propOptional && forceOptionalIntoNullable) {
        if (propDef._def.typeName === "ZodOptional") {
          propDef = propDef._def.innerType;
        }
        if (!propDef.isNullable()) {
          propDef = propDef.nullable();
        }
        propOptional = false;
      }
      const parsedDef = parseDef(propDef._def, {
        ...refs,
        currentPath: [...refs.currentPath, "properties", propName],
        propertyPath: [...refs.currentPath, "properties", propName]
      });
      if (parsedDef === void 0) {
        continue;
      }
      result.properties[propName] = parsedDef;
      if (!propOptional) {
        required2.push(propName);
      }
    }
    if (required2.length) {
      result.required = required2;
    }
    const additionalProperties2 = decideAdditionalProperties(def, refs);
    if (additionalProperties2 !== void 0) {
      result.additionalProperties = additionalProperties2;
    }
    return result;
  }
  function decideAdditionalProperties(def, refs) {
    if (def.catchall._def.typeName !== "ZodNever") {
      return parseDef(def.catchall._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalProperties"]
      });
    }
    switch (def.unknownKeys) {
      case "passthrough":
        return refs.allowedAdditionalProperties;
      case "strict":
        return refs.rejectedAdditionalProperties;
      case "strip":
        return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
    }
  }
  function safeIsOptional(schema) {
    try {
      return schema.isOptional();
    } catch {
      return true;
    }
  }
  const parseOptionalDef = (def, refs) => {
    var _a;
    if (refs.currentPath.toString() === ((_a = refs.propertyPath) == null ? void 0 : _a.toString())) {
      return parseDef(def.innerType._def, refs);
    }
    const innerSchema = parseDef(def.innerType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "anyOf", "1"]
    });
    return innerSchema ? {
      anyOf: [
        {
          not: parseAnyDef(refs)
        },
        innerSchema
      ]
    } : parseAnyDef(refs);
  };
  const parsePipelineDef = (def, refs) => {
    if (refs.pipeStrategy === "input") {
      return parseDef(def.in._def, refs);
    } else if (refs.pipeStrategy === "output") {
      return parseDef(def.out._def, refs);
    }
    const a = parseDef(def.in._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    });
    const b2 = parseDef(def.out._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
    });
    return {
      allOf: [a, b2].filter((x) => x !== void 0)
    };
  };
  function parsePromiseDef(def, refs) {
    return parseDef(def.type._def, refs);
  }
  function parseSetDef(def, refs) {
    const items2 = parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
    const schema = {
      type: "array",
      uniqueItems: true,
      items: items2
    };
    if (def.minSize) {
      setResponseValueAndErrors(schema, "minItems", def.minSize.value, def.minSize.message, refs);
    }
    if (def.maxSize) {
      setResponseValueAndErrors(schema, "maxItems", def.maxSize.value, def.maxSize.message, refs);
    }
    return schema;
  }
  function parseTupleDef(def, refs) {
    if (def.rest) {
      return {
        type: "array",
        minItems: def.items.length,
        items: def.items.map((x, i) => parseDef(x._def, {
          ...refs,
          currentPath: [...refs.currentPath, "items", `${i}`]
        })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], []),
        additionalItems: parseDef(def.rest._def, {
          ...refs,
          currentPath: [...refs.currentPath, "additionalItems"]
        })
      };
    } else {
      return {
        type: "array",
        minItems: def.items.length,
        maxItems: def.items.length,
        items: def.items.map((x, i) => parseDef(x._def, {
          ...refs,
          currentPath: [...refs.currentPath, "items", `${i}`]
        })).reduce((acc, x) => x === void 0 ? acc : [...acc, x], [])
      };
    }
  }
  function parseUndefinedDef(refs) {
    return {
      not: parseAnyDef(refs)
    };
  }
  function parseUnknownDef(refs) {
    return parseAnyDef(refs);
  }
  const parseReadonlyDef = (def, refs) => {
    return parseDef(def.innerType._def, refs);
  };
  const selectParser = (def, typeName, refs) => {
    switch (typeName) {
      case ZodFirstPartyTypeKind.ZodString:
        return parseStringDef(def, refs);
      case ZodFirstPartyTypeKind.ZodNumber:
        return parseNumberDef(def, refs);
      case ZodFirstPartyTypeKind.ZodObject:
        return parseObjectDef(def, refs);
      case ZodFirstPartyTypeKind.ZodBigInt:
        return parseBigintDef(def, refs);
      case ZodFirstPartyTypeKind.ZodBoolean:
        return parseBooleanDef();
      case ZodFirstPartyTypeKind.ZodDate:
        return parseDateDef(def, refs);
      case ZodFirstPartyTypeKind.ZodUndefined:
        return parseUndefinedDef(refs);
      case ZodFirstPartyTypeKind.ZodNull:
        return parseNullDef(refs);
      case ZodFirstPartyTypeKind.ZodArray:
        return parseArrayDef(def, refs);
      case ZodFirstPartyTypeKind.ZodUnion:
      case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
        return parseUnionDef(def, refs);
      case ZodFirstPartyTypeKind.ZodIntersection:
        return parseIntersectionDef(def, refs);
      case ZodFirstPartyTypeKind.ZodTuple:
        return parseTupleDef(def, refs);
      case ZodFirstPartyTypeKind.ZodRecord:
        return parseRecordDef(def, refs);
      case ZodFirstPartyTypeKind.ZodLiteral:
        return parseLiteralDef(def, refs);
      case ZodFirstPartyTypeKind.ZodEnum:
        return parseEnumDef(def);
      case ZodFirstPartyTypeKind.ZodNativeEnum:
        return parseNativeEnumDef(def);
      case ZodFirstPartyTypeKind.ZodNullable:
        return parseNullableDef(def, refs);
      case ZodFirstPartyTypeKind.ZodOptional:
        return parseOptionalDef(def, refs);
      case ZodFirstPartyTypeKind.ZodMap:
        return parseMapDef(def, refs);
      case ZodFirstPartyTypeKind.ZodSet:
        return parseSetDef(def, refs);
      case ZodFirstPartyTypeKind.ZodLazy:
        return () => def.getter()._def;
      case ZodFirstPartyTypeKind.ZodPromise:
        return parsePromiseDef(def, refs);
      case ZodFirstPartyTypeKind.ZodNaN:
      case ZodFirstPartyTypeKind.ZodNever:
        return parseNeverDef(refs);
      case ZodFirstPartyTypeKind.ZodEffects:
        return parseEffectsDef(def, refs);
      case ZodFirstPartyTypeKind.ZodAny:
        return parseAnyDef(refs);
      case ZodFirstPartyTypeKind.ZodUnknown:
        return parseUnknownDef(refs);
      case ZodFirstPartyTypeKind.ZodDefault:
        return parseDefaultDef(def, refs);
      case ZodFirstPartyTypeKind.ZodBranded:
        return parseBrandedDef(def, refs);
      case ZodFirstPartyTypeKind.ZodReadonly:
        return parseReadonlyDef(def, refs);
      case ZodFirstPartyTypeKind.ZodCatch:
        return parseCatchDef(def, refs);
      case ZodFirstPartyTypeKind.ZodPipeline:
        return parsePipelineDef(def, refs);
      case ZodFirstPartyTypeKind.ZodFunction:
      case ZodFirstPartyTypeKind.ZodVoid:
      case ZodFirstPartyTypeKind.ZodSymbol:
        return void 0;
      default:
        return /* @__PURE__ */ ((_2) => void 0)();
    }
  };
  function parseDef(def, refs, forceResolution = false) {
    var _a;
    const seenItem = refs.seen.get(def);
    if (refs.override) {
      const overrideResult = (_a = refs.override) == null ? void 0 : _a.call(refs, def, refs, seenItem, forceResolution);
      if (overrideResult !== ignoreOverride) {
        return overrideResult;
      }
    }
    if (seenItem && !forceResolution) {
      const seenSchema = get$ref(seenItem, refs);
      if (seenSchema !== void 0) {
        return seenSchema;
      }
    }
    const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
    refs.seen.set(def, newItem);
    const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
    const jsonSchema = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
    if (jsonSchema) {
      addMeta(def, refs, jsonSchema);
    }
    if (refs.postProcess) {
      const postProcessResult = refs.postProcess(jsonSchema, def, refs);
      newItem.jsonSchema = jsonSchema;
      return postProcessResult;
    }
    newItem.jsonSchema = jsonSchema;
    return jsonSchema;
  }
  const get$ref = (item, refs) => {
    switch (refs.$refStrategy) {
      case "root":
        return { $ref: item.path.join("/") };
      case "relative":
        return { $ref: getRelativePath(refs.currentPath, item.path) };
      case "none":
      case "seen": {
        if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
          console.warn(`Recursive reference detected at ${refs.currentPath.join("/")}! Defaulting to any`);
          return parseAnyDef(refs);
        }
        return refs.$refStrategy === "seen" ? parseAnyDef(refs) : void 0;
      }
    }
  };
  const addMeta = (def, refs, jsonSchema) => {
    if (def.description) {
      jsonSchema.description = def.description;
      if (refs.markdownDescription) {
        jsonSchema.markdownDescription = def.description;
      }
    }
    return jsonSchema;
  };
  const zodToJsonSchema = (schema, options) => {
    const refs = getRefs(options);
    let definitions2 = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce((acc, [name2, schema2]) => ({
      ...acc,
      [name2]: parseDef(schema2._def, {
        ...refs,
        currentPath: [...refs.basePath, refs.definitionPath, name2]
      }, true) ?? parseAnyDef(refs)
    }), {}) : void 0;
    const name = typeof options === "string" ? options : (options == null ? void 0 : options.nameStrategy) === "title" ? void 0 : options == null ? void 0 : options.name;
    const main = parseDef(schema._def, name === void 0 ? refs : {
      ...refs,
      currentPath: [...refs.basePath, refs.definitionPath, name]
    }, false) ?? parseAnyDef(refs);
    const title2 = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
    if (title2 !== void 0) {
      main.title = title2;
    }
    if (refs.flags.hasReferencedOpenAiAnyType) {
      if (!definitions2) {
        definitions2 = {};
      }
      if (!definitions2[refs.openAiAnyTypeName]) {
        definitions2[refs.openAiAnyTypeName] = {
          // Skipping "object" as no properties can be defined and additionalProperties must be "false"
          type: ["string", "number", "integer", "boolean", "array", "null"],
          items: {
            $ref: refs.$refStrategy === "relative" ? "1" : [
              ...refs.basePath,
              refs.definitionPath,
              refs.openAiAnyTypeName
            ].join("/")
          }
        };
      }
    }
    const combined = name === void 0 ? definitions2 ? {
      ...main,
      [refs.definitionPath]: definitions2
    } : main : {
      $ref: [
        ...refs.$refStrategy === "relative" ? [] : refs.basePath,
        refs.definitionPath,
        name
      ].join("/"),
      [refs.definitionPath]: {
        ...definitions2,
        [name]: main
      }
    };
    if (refs.target === "jsonSchema7") {
      combined.$schema = "http://json-schema.org/draft-07/schema#";
    } else if (refs.target === "jsonSchema2019-09" || refs.target === "openAi") {
      combined.$schema = "https://json-schema.org/draft/2019-09/schema#";
    }
    if (refs.target === "openAi" && ("anyOf" in combined || "oneOf" in combined || "allOf" in combined || "type" in combined && Array.isArray(combined.type))) {
      console.warn("Warning: OpenAI may not support schemas with unions as roots! Try wrapping it in an object property.");
    }
    return combined;
  };
  var McpZodTypeKind;
  (function(McpZodTypeKind2) {
    McpZodTypeKind2["Completable"] = "McpCompletable";
  })(McpZodTypeKind || (McpZodTypeKind = {}));
  class Completable extends ZodType {
    _parse(input2) {
      const { ctx } = this._processInputParams(input2);
      const data2 = ctx.data;
      return this._def.type._parse({
        data: data2,
        path: ctx.path,
        parent: ctx
      });
    }
    unwrap() {
      return this._def.type;
    }
  }
  Completable.create = (type2, params) => {
    return new Completable({
      type: type2,
      typeName: McpZodTypeKind.Completable,
      complete: params.complete,
      ...processCreateParams(params)
    });
  };
  function processCreateParams(params) {
    if (!params)
      return {};
    const { errorMap: errorMap2, invalid_type_error, required_error, description: description2 } = params;
    if (errorMap2 && (invalid_type_error || required_error)) {
      throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
    }
    if (errorMap2)
      return { errorMap: errorMap2, description: description2 };
    const customMap = (iss, ctx) => {
      var _a, _b;
      const { message } = params;
      if (iss.code === "invalid_enum_value") {
        return { message: message !== null && message !== void 0 ? message : ctx.defaultError };
      }
      if (typeof ctx.data === "undefined") {
        return { message: (_a = message !== null && message !== void 0 ? message : required_error) !== null && _a !== void 0 ? _a : ctx.defaultError };
      }
      if (iss.code !== "invalid_type")
        return { message: ctx.defaultError };
      return { message: (_b = message !== null && message !== void 0 ? message : invalid_type_error) !== null && _b !== void 0 ? _b : ctx.defaultError };
    };
    return { errorMap: customMap, description: description2 };
  }
  class McpServer {
    constructor(serverInfo, options) {
      this._registeredResources = {};
      this._registeredResourceTemplates = {};
      this._registeredTools = {};
      this._registeredPrompts = {};
      this._toolHandlersInitialized = false;
      this._completionHandlerInitialized = false;
      this._resourceHandlersInitialized = false;
      this._promptHandlersInitialized = false;
      this.server = new Server(serverInfo, options);
    }
    /**
     * Attaches to the given transport, starts it, and starts listening for messages.
     *
     * The `server` object assumes ownership of the Transport, replacing any callbacks that have already been set, and expects that it is the only user of the Transport instance going forward.
     */
    async connect(transport) {
      return await this.server.connect(transport);
    }
    /**
     * Closes the connection.
     */
    async close() {
      await this.server.close();
    }
    setToolRequestHandlers() {
      if (this._toolHandlersInitialized) {
        return;
      }
      this.server.assertCanSetRequestHandler(ListToolsRequestSchema.shape.method.value);
      this.server.assertCanSetRequestHandler(CallToolRequestSchema.shape.method.value);
      this.server.registerCapabilities({
        tools: {
          listChanged: true
        }
      });
      this.server.setRequestHandler(ListToolsRequestSchema, () => ({
        tools: Object.entries(this._registeredTools).filter(([, tool]) => tool.enabled).map(([name, tool]) => {
          const toolDefinition = {
            name,
            title: tool.title,
            description: tool.description,
            inputSchema: tool.inputSchema ? zodToJsonSchema(tool.inputSchema, {
              strictUnions: true
            }) : EMPTY_OBJECT_JSON_SCHEMA,
            annotations: tool.annotations
          };
          if (tool.outputSchema) {
            toolDefinition.outputSchema = zodToJsonSchema(tool.outputSchema, { strictUnions: true });
          }
          return toolDefinition;
        })
      }));
      this.server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
        const tool = this._registeredTools[request.params.name];
        if (!tool) {
          throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} not found`);
        }
        if (!tool.enabled) {
          throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} disabled`);
        }
        let result;
        if (tool.inputSchema) {
          const parseResult = await tool.inputSchema.safeParseAsync(request.params.arguments);
          if (!parseResult.success) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for tool ${request.params.name}: ${parseResult.error.message}`);
          }
          const args = parseResult.data;
          const cb = tool.callback;
          try {
            result = await Promise.resolve(cb(args, extra));
          } catch (error) {
            result = {
              content: [
                {
                  type: "text",
                  text: error instanceof Error ? error.message : String(error)
                }
              ],
              isError: true
            };
          }
        } else {
          const cb = tool.callback;
          try {
            result = await Promise.resolve(cb(extra));
          } catch (error) {
            result = {
              content: [
                {
                  type: "text",
                  text: error instanceof Error ? error.message : String(error)
                }
              ],
              isError: true
            };
          }
        }
        if (tool.outputSchema && !result.isError) {
          if (!result.structuredContent) {
            throw new McpError(ErrorCode.InvalidParams, `Tool ${request.params.name} has an output schema but no structured content was provided`);
          }
          const parseResult = await tool.outputSchema.safeParseAsync(result.structuredContent);
          if (!parseResult.success) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid structured content for tool ${request.params.name}: ${parseResult.error.message}`);
          }
        }
        return result;
      });
      this._toolHandlersInitialized = true;
    }
    setCompletionRequestHandler() {
      if (this._completionHandlerInitialized) {
        return;
      }
      this.server.assertCanSetRequestHandler(CompleteRequestSchema.shape.method.value);
      this.server.registerCapabilities({
        completions: {}
      });
      this.server.setRequestHandler(CompleteRequestSchema, async (request) => {
        switch (request.params.ref.type) {
          case "ref/prompt":
            return this.handlePromptCompletion(request, request.params.ref);
          case "ref/resource":
            return this.handleResourceCompletion(request, request.params.ref);
          default:
            throw new McpError(ErrorCode.InvalidParams, `Invalid completion reference: ${request.params.ref}`);
        }
      });
      this._completionHandlerInitialized = true;
    }
    async handlePromptCompletion(request, ref2) {
      const prompt = this._registeredPrompts[ref2.name];
      if (!prompt) {
        throw new McpError(ErrorCode.InvalidParams, `Prompt ${ref2.name} not found`);
      }
      if (!prompt.enabled) {
        throw new McpError(ErrorCode.InvalidParams, `Prompt ${ref2.name} disabled`);
      }
      if (!prompt.argsSchema) {
        return EMPTY_COMPLETION_RESULT;
      }
      const field = prompt.argsSchema.shape[request.params.argument.name];
      if (!(field instanceof Completable)) {
        return EMPTY_COMPLETION_RESULT;
      }
      const def = field._def;
      const suggestions = await def.complete(request.params.argument.value, request.params.context);
      return createCompletionResult(suggestions);
    }
    async handleResourceCompletion(request, ref2) {
      const template = Object.values(this._registeredResourceTemplates).find((t) => t.resourceTemplate.uriTemplate.toString() === ref2.uri);
      if (!template) {
        if (this._registeredResources[ref2.uri]) {
          return EMPTY_COMPLETION_RESULT;
        }
        throw new McpError(ErrorCode.InvalidParams, `Resource template ${request.params.ref.uri} not found`);
      }
      const completer = template.resourceTemplate.completeCallback(request.params.argument.name);
      if (!completer) {
        return EMPTY_COMPLETION_RESULT;
      }
      const suggestions = await completer(request.params.argument.value, request.params.context);
      return createCompletionResult(suggestions);
    }
    setResourceRequestHandlers() {
      if (this._resourceHandlersInitialized) {
        return;
      }
      this.server.assertCanSetRequestHandler(ListResourcesRequestSchema.shape.method.value);
      this.server.assertCanSetRequestHandler(ListResourceTemplatesRequestSchema.shape.method.value);
      this.server.assertCanSetRequestHandler(ReadResourceRequestSchema.shape.method.value);
      this.server.registerCapabilities({
        resources: {
          listChanged: true
        }
      });
      this.server.setRequestHandler(ListResourcesRequestSchema, async (request, extra) => {
        const resources = Object.entries(this._registeredResources).filter(([_2, resource]) => resource.enabled).map(([uri2, resource]) => ({
          uri: uri2,
          name: resource.name,
          ...resource.metadata
        }));
        const templateResources = [];
        for (const template of Object.values(this._registeredResourceTemplates)) {
          if (!template.resourceTemplate.listCallback) {
            continue;
          }
          const result = await template.resourceTemplate.listCallback(extra);
          for (const resource of result.resources) {
            templateResources.push({
              ...template.metadata,
              // the defined resource metadata should override the template metadata if present
              ...resource
            });
          }
        }
        return { resources: [...resources, ...templateResources] };
      });
      this.server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => {
        const resourceTemplates = Object.entries(this._registeredResourceTemplates).map(([name, template]) => ({
          name,
          uriTemplate: template.resourceTemplate.uriTemplate.toString(),
          ...template.metadata
        }));
        return { resourceTemplates };
      });
      this.server.setRequestHandler(ReadResourceRequestSchema, async (request, extra) => {
        const uri2 = new URL(request.params.uri);
        const resource = this._registeredResources[uri2.toString()];
        if (resource) {
          if (!resource.enabled) {
            throw new McpError(ErrorCode.InvalidParams, `Resource ${uri2} disabled`);
          }
          return resource.readCallback(uri2, extra);
        }
        for (const template of Object.values(this._registeredResourceTemplates)) {
          const variables = template.resourceTemplate.uriTemplate.match(uri2.toString());
          if (variables) {
            return template.readCallback(uri2, variables, extra);
          }
        }
        throw new McpError(ErrorCode.InvalidParams, `Resource ${uri2} not found`);
      });
      this.setCompletionRequestHandler();
      this._resourceHandlersInitialized = true;
    }
    setPromptRequestHandlers() {
      if (this._promptHandlersInitialized) {
        return;
      }
      this.server.assertCanSetRequestHandler(ListPromptsRequestSchema.shape.method.value);
      this.server.assertCanSetRequestHandler(GetPromptRequestSchema.shape.method.value);
      this.server.registerCapabilities({
        prompts: {
          listChanged: true
        }
      });
      this.server.setRequestHandler(ListPromptsRequestSchema, () => ({
        prompts: Object.entries(this._registeredPrompts).filter(([, prompt]) => prompt.enabled).map(([name, prompt]) => {
          return {
            name,
            title: prompt.title,
            description: prompt.description,
            arguments: prompt.argsSchema ? promptArgumentsFromSchema(prompt.argsSchema) : void 0
          };
        })
      }));
      this.server.setRequestHandler(GetPromptRequestSchema, async (request, extra) => {
        const prompt = this._registeredPrompts[request.params.name];
        if (!prompt) {
          throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} not found`);
        }
        if (!prompt.enabled) {
          throw new McpError(ErrorCode.InvalidParams, `Prompt ${request.params.name} disabled`);
        }
        if (prompt.argsSchema) {
          const parseResult = await prompt.argsSchema.safeParseAsync(request.params.arguments);
          if (!parseResult.success) {
            throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for prompt ${request.params.name}: ${parseResult.error.message}`);
          }
          const args = parseResult.data;
          const cb = prompt.callback;
          return await Promise.resolve(cb(args, extra));
        } else {
          const cb = prompt.callback;
          return await Promise.resolve(cb(extra));
        }
      });
      this.setCompletionRequestHandler();
      this._promptHandlersInitialized = true;
    }
    resource(name, uriOrTemplate, ...rest) {
      let metadata;
      if (typeof rest[0] === "object") {
        metadata = rest.shift();
      }
      const readCallback = rest[0];
      if (typeof uriOrTemplate === "string") {
        if (this._registeredResources[uriOrTemplate]) {
          throw new Error(`Resource ${uriOrTemplate} is already registered`);
        }
        const registeredResource = this._createRegisteredResource(name, void 0, uriOrTemplate, metadata, readCallback);
        this.setResourceRequestHandlers();
        this.sendResourceListChanged();
        return registeredResource;
      } else {
        if (this._registeredResourceTemplates[name]) {
          throw new Error(`Resource template ${name} is already registered`);
        }
        const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, void 0, uriOrTemplate, metadata, readCallback);
        this.setResourceRequestHandlers();
        this.sendResourceListChanged();
        return registeredResourceTemplate;
      }
    }
    registerResource(name, uriOrTemplate, config2, readCallback) {
      if (typeof uriOrTemplate === "string") {
        if (this._registeredResources[uriOrTemplate]) {
          throw new Error(`Resource ${uriOrTemplate} is already registered`);
        }
        const registeredResource = this._createRegisteredResource(name, config2.title, uriOrTemplate, config2, readCallback);
        this.setResourceRequestHandlers();
        this.sendResourceListChanged();
        return registeredResource;
      } else {
        if (this._registeredResourceTemplates[name]) {
          throw new Error(`Resource template ${name} is already registered`);
        }
        const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, config2.title, uriOrTemplate, config2, readCallback);
        this.setResourceRequestHandlers();
        this.sendResourceListChanged();
        return registeredResourceTemplate;
      }
    }
    _createRegisteredResource(name, title2, uri2, metadata, readCallback) {
      const registeredResource = {
        name,
        title: title2,
        metadata,
        readCallback,
        enabled: true,
        disable: () => registeredResource.update({ enabled: false }),
        enable: () => registeredResource.update({ enabled: true }),
        remove: () => registeredResource.update({ uri: null }),
        update: (updates) => {
          if (typeof updates.uri !== "undefined" && updates.uri !== uri2) {
            delete this._registeredResources[uri2];
            if (updates.uri)
              this._registeredResources[updates.uri] = registeredResource;
          }
          if (typeof updates.name !== "undefined")
            registeredResource.name = updates.name;
          if (typeof updates.title !== "undefined")
            registeredResource.title = updates.title;
          if (typeof updates.metadata !== "undefined")
            registeredResource.metadata = updates.metadata;
          if (typeof updates.callback !== "undefined")
            registeredResource.readCallback = updates.callback;
          if (typeof updates.enabled !== "undefined")
            registeredResource.enabled = updates.enabled;
          this.sendResourceListChanged();
        }
      };
      this._registeredResources[uri2] = registeredResource;
      return registeredResource;
    }
    _createRegisteredResourceTemplate(name, title2, template, metadata, readCallback) {
      const registeredResourceTemplate = {
        resourceTemplate: template,
        title: title2,
        metadata,
        readCallback,
        enabled: true,
        disable: () => registeredResourceTemplate.update({ enabled: false }),
        enable: () => registeredResourceTemplate.update({ enabled: true }),
        remove: () => registeredResourceTemplate.update({ name: null }),
        update: (updates) => {
          if (typeof updates.name !== "undefined" && updates.name !== name) {
            delete this._registeredResourceTemplates[name];
            if (updates.name)
              this._registeredResourceTemplates[updates.name] = registeredResourceTemplate;
          }
          if (typeof updates.title !== "undefined")
            registeredResourceTemplate.title = updates.title;
          if (typeof updates.template !== "undefined")
            registeredResourceTemplate.resourceTemplate = updates.template;
          if (typeof updates.metadata !== "undefined")
            registeredResourceTemplate.metadata = updates.metadata;
          if (typeof updates.callback !== "undefined")
            registeredResourceTemplate.readCallback = updates.callback;
          if (typeof updates.enabled !== "undefined")
            registeredResourceTemplate.enabled = updates.enabled;
          this.sendResourceListChanged();
        }
      };
      this._registeredResourceTemplates[name] = registeredResourceTemplate;
      return registeredResourceTemplate;
    }
    _createRegisteredPrompt(name, title2, description2, argsSchema, callback) {
      const registeredPrompt = {
        title: title2,
        description: description2,
        argsSchema: argsSchema === void 0 ? void 0 : objectType(argsSchema),
        callback,
        enabled: true,
        disable: () => registeredPrompt.update({ enabled: false }),
        enable: () => registeredPrompt.update({ enabled: true }),
        remove: () => registeredPrompt.update({ name: null }),
        update: (updates) => {
          if (typeof updates.name !== "undefined" && updates.name !== name) {
            delete this._registeredPrompts[name];
            if (updates.name)
              this._registeredPrompts[updates.name] = registeredPrompt;
          }
          if (typeof updates.title !== "undefined")
            registeredPrompt.title = updates.title;
          if (typeof updates.description !== "undefined")
            registeredPrompt.description = updates.description;
          if (typeof updates.argsSchema !== "undefined")
            registeredPrompt.argsSchema = objectType(updates.argsSchema);
          if (typeof updates.callback !== "undefined")
            registeredPrompt.callback = updates.callback;
          if (typeof updates.enabled !== "undefined")
            registeredPrompt.enabled = updates.enabled;
          this.sendPromptListChanged();
        }
      };
      this._registeredPrompts[name] = registeredPrompt;
      return registeredPrompt;
    }
    _createRegisteredTool(name, title2, description2, inputSchema, outputSchema, annotations, callback) {
      const registeredTool = {
        title: title2,
        description: description2,
        inputSchema: inputSchema === void 0 ? void 0 : objectType(inputSchema),
        outputSchema: outputSchema === void 0 ? void 0 : objectType(outputSchema),
        annotations,
        callback,
        enabled: true,
        disable: () => registeredTool.update({ enabled: false }),
        enable: () => registeredTool.update({ enabled: true }),
        remove: () => registeredTool.update({ name: null }),
        update: (updates) => {
          if (typeof updates.name !== "undefined" && updates.name !== name) {
            delete this._registeredTools[name];
            if (updates.name)
              this._registeredTools[updates.name] = registeredTool;
          }
          if (typeof updates.title !== "undefined")
            registeredTool.title = updates.title;
          if (typeof updates.description !== "undefined")
            registeredTool.description = updates.description;
          if (typeof updates.paramsSchema !== "undefined")
            registeredTool.inputSchema = objectType(updates.paramsSchema);
          if (typeof updates.callback !== "undefined")
            registeredTool.callback = updates.callback;
          if (typeof updates.annotations !== "undefined")
            registeredTool.annotations = updates.annotations;
          if (typeof updates.enabled !== "undefined")
            registeredTool.enabled = updates.enabled;
          this.sendToolListChanged();
        }
      };
      this._registeredTools[name] = registeredTool;
      this.setToolRequestHandlers();
      this.sendToolListChanged();
      return registeredTool;
    }
    /**
     * tool() implementation. Parses arguments passed to overrides defined above.
     */
    tool(name, ...rest) {
      if (this._registeredTools[name]) {
        throw new Error(`Tool ${name} is already registered`);
      }
      let description2;
      let inputSchema;
      let outputSchema;
      let annotations;
      if (typeof rest[0] === "string") {
        description2 = rest.shift();
      }
      if (rest.length > 1) {
        const firstArg = rest[0];
        if (isZodRawShape(firstArg)) {
          inputSchema = rest.shift();
          if (rest.length > 1 && typeof rest[0] === "object" && rest[0] !== null && !isZodRawShape(rest[0])) {
            annotations = rest.shift();
          }
        } else if (typeof firstArg === "object" && firstArg !== null) {
          annotations = rest.shift();
        }
      }
      const callback = rest[0];
      return this._createRegisteredTool(name, void 0, description2, inputSchema, outputSchema, annotations, callback);
    }
    /**
     * Registers a tool with a config object and callback.
     */
    registerTool(name, config2, cb) {
      if (this._registeredTools[name]) {
        throw new Error(`Tool ${name} is already registered`);
      }
      const { title: title2, description: description2, inputSchema, outputSchema, annotations } = config2;
      return this._createRegisteredTool(name, title2, description2, inputSchema, outputSchema, annotations, cb);
    }
    prompt(name, ...rest) {
      if (this._registeredPrompts[name]) {
        throw new Error(`Prompt ${name} is already registered`);
      }
      let description2;
      if (typeof rest[0] === "string") {
        description2 = rest.shift();
      }
      let argsSchema;
      if (rest.length > 1) {
        argsSchema = rest.shift();
      }
      const cb = rest[0];
      const registeredPrompt = this._createRegisteredPrompt(name, void 0, description2, argsSchema, cb);
      this.setPromptRequestHandlers();
      this.sendPromptListChanged();
      return registeredPrompt;
    }
    /**
     * Registers a prompt with a config object and callback.
     */
    registerPrompt(name, config2, cb) {
      if (this._registeredPrompts[name]) {
        throw new Error(`Prompt ${name} is already registered`);
      }
      const { title: title2, description: description2, argsSchema } = config2;
      const registeredPrompt = this._createRegisteredPrompt(name, title2, description2, argsSchema, cb);
      this.setPromptRequestHandlers();
      this.sendPromptListChanged();
      return registeredPrompt;
    }
    /**
     * Checks if the server is connected to a transport.
     * @returns True if the server is connected
     */
    isConnected() {
      return this.server.transport !== void 0;
    }
    /**
     * Sends a resource list changed event to the client, if connected.
     */
    sendResourceListChanged() {
      if (this.isConnected()) {
        this.server.sendResourceListChanged();
      }
    }
    /**
     * Sends a tool list changed event to the client, if connected.
     */
    sendToolListChanged() {
      if (this.isConnected()) {
        this.server.sendToolListChanged();
      }
    }
    /**
     * Sends a prompt list changed event to the client, if connected.
     */
    sendPromptListChanged() {
      if (this.isConnected()) {
        this.server.sendPromptListChanged();
      }
    }
  }
  const EMPTY_OBJECT_JSON_SCHEMA = {
    type: "object",
    properties: {}
  };
  function isZodRawShape(obj) {
    if (typeof obj !== "object" || obj === null)
      return false;
    const isEmptyObject = Object.keys(obj).length === 0;
    return isEmptyObject || Object.values(obj).some(isZodTypeLike);
  }
  function isZodTypeLike(value) {
    return value !== null && typeof value === "object" && "parse" in value && typeof value.parse === "function" && "safeParse" in value && typeof value.safeParse === "function";
  }
  function promptArgumentsFromSchema(schema) {
    return Object.entries(schema.shape).map(([name, field]) => ({
      name,
      description: field.description,
      required: !field.isOptional()
    }));
  }
  function createCompletionResult(suggestions) {
    return {
      completion: {
        values: suggestions.slice(0, 100),
        total: suggestions.length,
        hasMore: suggestions.length > 100
      }
    };
  }
  const EMPTY_COMPLETION_RESULT = {
    completion: {
      values: [],
      hasMore: false
    }
  };
  async function createServer(config2) {
    const server2 = new McpServer(
      {
        name: config2.name,
        version: config2.version
      },
      {
        capabilities: config2.capabilities || {
          tools: { listChanged: true }
        },
        ...config2.instructions && { instructions: config2.instructions }
      }
    );
    const transport = new p$1({
      allowedOrigins: ["*"]
    });
    try {
      await server2.connect(transport);
      console.log(`[${config2.name}] MCP Server initialized`);
      return server2;
    } catch (error) {
      console.error(`[${config2.name}] Failed to initialize:`, error);
      throw error;
    }
  }
  function formatSuccess(message, data2) {
    return {
      content: [
        {
          type: "text",
          text: data2 ? `${message}
${JSON.stringify(data2, null, 2)}` : message
        }
      ]
    };
  }
  function formatError(message, error) {
    return {
      content: [
        {
          type: "text",
          text: error ? `${message}: ${error.message || error}` : message
        }
      ],
      isError: true
    };
  }
  function isElementType(element, tag, props) {
    if (element.namespaceURI && element.namespaceURI !== "http://www.w3.org/1999/xhtml") {
      return false;
    }
    tag = Array.isArray(tag) ? tag : [
      tag
    ];
    if (!tag.includes(element.tagName.toLowerCase())) {
      return false;
    }
    if (props) {
      return Object.entries(props).every(([k, v2]) => element[k] === v2);
    }
    return true;
  }
  function getWindow(node) {
    var _node_ownerDocument;
    if (isDocument$1(node) && node.defaultView) {
      return node.defaultView;
    } else if ((_node_ownerDocument = node.ownerDocument) === null || _node_ownerDocument === void 0 ? void 0 : _node_ownerDocument.defaultView) {
      return node.ownerDocument.defaultView;
    }
    throw new Error(`Could not determine window of node. Node was ${describe(node)}`);
  }
  function isDocument$1(node) {
    return node.nodeType === 9;
  }
  function describe(val) {
    return typeof val === "function" ? `function ${val.name}` : val === null ? "null" : String(val);
  }
  function readBlobText(blob, FileReader) {
    return new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = rej;
      fr.onabort = rej;
      fr.onload = () => {
        res(String(fr.result));
      };
      fr.readAsText(blob);
    });
  }
  function createFileList(window2, files) {
    const list = {
      ...files,
      length: files.length,
      item: (index) => list[index],
      [Symbol.iterator]: function* nextFile() {
        for (let i = 0; i < list.length; i++) {
          yield list[i];
        }
      }
    };
    list.constructor = window2.FileList;
    if (window2.FileList) {
      Object.setPrototypeOf(list, window2.FileList.prototype);
    }
    Object.freeze(list);
    return list;
  }
  function _define_property$8(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class DataTransferItemStub {
    getAsFile() {
      return this.file;
    }
    getAsString(callback) {
      if (typeof this.data === "string") {
        callback(this.data);
      }
    }
    /* istanbul ignore next */
    webkitGetAsEntry() {
      throw new Error("not implemented");
    }
    constructor(dataOrFile, type2) {
      _define_property$8(this, "kind", void 0);
      _define_property$8(this, "type", void 0);
      _define_property$8(this, "file", null);
      _define_property$8(this, "data", void 0);
      if (typeof dataOrFile === "string") {
        this.kind = "string";
        this.type = String(type2);
        this.data = dataOrFile;
      } else {
        this.kind = "file";
        this.type = dataOrFile.type;
        this.file = dataOrFile;
      }
    }
  }
  class DataTransferItemListStub extends Array {
    add(...args) {
      const item = new DataTransferItemStub(args[0], args[1]);
      this.push(item);
      return item;
    }
    clear() {
      this.splice(0, this.length);
    }
    remove(index) {
      this.splice(index, 1);
    }
  }
  function getTypeMatcher(type2, exact) {
    const [group, sub] = type2.split("/");
    const isGroup = !sub || sub === "*";
    return (item) => {
      return exact ? item.type === (isGroup ? group : type2) : isGroup ? item.type.startsWith(`${group}/`) : item.type === group;
    };
  }
  function createDataTransferStub(window2) {
    return new class DataTransferStub {
      getData(format2) {
        var _this_items_find;
        const match = (_this_items_find = this.items.find(getTypeMatcher(format2, true))) !== null && _this_items_find !== void 0 ? _this_items_find : this.items.find(getTypeMatcher(format2, false));
        let text = "";
        match === null || match === void 0 ? void 0 : match.getAsString((t) => {
          text = t;
        });
        return text;
      }
      setData(format2, data2) {
        const matchIndex = this.items.findIndex(getTypeMatcher(format2, true));
        const item = new DataTransferItemStub(data2, format2);
        if (matchIndex >= 0) {
          this.items.splice(matchIndex, 1, item);
        } else {
          this.items.push(item);
        }
      }
      clearData(format2) {
        if (format2) {
          const matchIndex = this.items.findIndex(getTypeMatcher(format2, true));
          if (matchIndex >= 0) {
            this.items.remove(matchIndex);
          }
        } else {
          this.items.clear();
        }
      }
      get types() {
        const t = [];
        if (this.files.length) {
          t.push("Files");
        }
        this.items.forEach((i) => t.push(i.type));
        Object.freeze(t);
        return t;
      }
      /* istanbul ignore next */
      setDragImage() {
      }
      constructor() {
        _define_property$8(this, "dropEffect", "none");
        _define_property$8(this, "effectAllowed", "uninitialized");
        _define_property$8(this, "items", new DataTransferItemListStub());
        _define_property$8(this, "files", createFileList(window2, []));
      }
    }();
  }
  function createDataTransfer(window2, files = []) {
    const dt = typeof window2.DataTransfer === "undefined" ? createDataTransferStub(window2) : (
      /* istanbul ignore next */
      new window2.DataTransfer()
    );
    Object.defineProperty(dt, "files", {
      get: () => createFileList(window2, files)
    });
    return dt;
  }
  async function getBlobFromDataTransferItem(window2, item) {
    if (item.kind === "file") {
      return item.getAsFile();
    }
    return new window2.Blob([
      await new Promise((r2) => item.getAsString(r2))
    ], {
      type: item.type
    });
  }
  function _define_property$7(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function createClipboardItem(window2, ...blobs) {
    const dataMap = Object.fromEntries(blobs.map((b2) => [
      typeof b2 === "string" ? "text/plain" : b2.type,
      Promise.resolve(b2)
    ]));
    if (typeof window2.ClipboardItem !== "undefined") {
      return new window2.ClipboardItem(dataMap);
    }
    return new class ClipboardItem {
      get types() {
        return Array.from(Object.keys(this.data));
      }
      async getType(type2) {
        const value = await this.data[type2];
        if (!value) {
          throw new Error(`${type2} is not one of the available MIME types on this item.`);
        }
        return value instanceof window2.Blob ? value : new window2.Blob([
          value
        ], {
          type: type2
        });
      }
      constructor(d2) {
        _define_property$7(this, "data", void 0);
        this.data = d2;
      }
    }(dataMap);
  }
  const ClipboardStubControl = Symbol("Manage ClipboardSub");
  function createClipboardStub(window2, control) {
    return Object.assign(new class Clipboard extends window2.EventTarget {
      async read() {
        return Array.from(this.items);
      }
      async readText() {
        let text = "";
        for (const item of this.items) {
          const type2 = item.types.includes("text/plain") ? "text/plain" : item.types.find((t) => t.startsWith("text/"));
          if (type2) {
            text += await item.getType(type2).then((b2) => readBlobText(b2, window2.FileReader));
          }
        }
        return text;
      }
      async write(data2) {
        this.items = data2;
      }
      async writeText(text) {
        this.items = [
          createClipboardItem(window2, text)
        ];
      }
      constructor(...args) {
        super(...args), _define_property$7(this, "items", []);
      }
    }(), {
      [ClipboardStubControl]: control
    });
  }
  function isClipboardStub(clipboard) {
    return !!(clipboard === null || clipboard === void 0 ? void 0 : clipboard[ClipboardStubControl]);
  }
  function attachClipboardStubToView(window2) {
    if (isClipboardStub(window2.navigator.clipboard)) {
      return window2.navigator.clipboard[ClipboardStubControl];
    }
    const realClipboard = Object.getOwnPropertyDescriptor(window2.navigator, "clipboard");
    let stub;
    const control = {
      resetClipboardStub: () => {
        stub = createClipboardStub(window2, control);
      },
      detachClipboardStub: () => {
        if (realClipboard) {
          Object.defineProperty(window2.navigator, "clipboard", realClipboard);
        } else {
          Object.defineProperty(window2.navigator, "clipboard", {
            value: void 0,
            configurable: true
          });
        }
      }
    };
    stub = createClipboardStub(window2, control);
    Object.defineProperty(window2.navigator, "clipboard", {
      get: () => stub,
      configurable: true
    });
    return stub[ClipboardStubControl];
  }
  function resetClipboardStubOnView(window2) {
    if (isClipboardStub(window2.navigator.clipboard)) {
      window2.navigator.clipboard[ClipboardStubControl].resetClipboardStub();
    }
  }
  function detachClipboardStubFromView(window2) {
    if (isClipboardStub(window2.navigator.clipboard)) {
      window2.navigator.clipboard[ClipboardStubControl].detachClipboardStub();
    }
  }
  async function readDataTransferFromClipboard(document2) {
    const window2 = document2.defaultView;
    const clipboard = window2 === null || window2 === void 0 ? void 0 : window2.navigator.clipboard;
    const items2 = clipboard && await clipboard.read();
    if (!items2) {
      throw new Error("The Clipboard API is unavailable.");
    }
    const dt = createDataTransfer(window2);
    for (const item of items2) {
      for (const type2 of item.types) {
        dt.setData(type2, await item.getType(type2).then((b2) => readBlobText(b2, window2.FileReader)));
      }
    }
    return dt;
  }
  async function writeDataTransferToClipboard(document2, clipboardData) {
    const window2 = getWindow(document2);
    const clipboard = window2.navigator.clipboard;
    const items2 = [];
    for (let i = 0; i < clipboardData.items.length; i++) {
      const dtItem = clipboardData.items[i];
      const blob = await getBlobFromDataTransferItem(window2, dtItem);
      items2.push(createClipboardItem(window2, blob));
    }
    const written = clipboard && await clipboard.write(items2).then(
      () => true,
      // Can happen with other implementations that e.g. require permissions
      /* istanbul ignore next */
      () => false
    );
    if (!written) {
      throw new Error("The Clipboard API is unavailable.");
    }
  }
  const g$1 = globalThis;
  if (typeof g$1.afterEach === "function") {
    g$1.afterEach(() => resetClipboardStubOnView(globalThis.window));
  }
  if (typeof g$1.afterAll === "function") {
    g$1.afterAll(() => detachClipboardStubFromView(globalThis.window));
  }
  const FOCUSABLE_SELECTOR = [
    "input:not([type=hidden]):not([disabled])",
    "button:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[contenteditable=""]',
    '[contenteditable="true"]',
    "a[href]",
    "[tabindex]:not([disabled])"
  ].join(", ");
  function isFocusable(element) {
    return element.matches(FOCUSABLE_SELECTOR);
  }
  function cloneEvent(event) {
    return new event.constructor(event.type, event);
  }
  function isDisabled(element) {
    for (let el = element; el; el = el.parentElement) {
      if (isElementType(el, [
        "button",
        "input",
        "select",
        "textarea",
        "optgroup",
        "option"
      ])) {
        if (el.hasAttribute("disabled")) {
          return true;
        }
      } else if (isElementType(el, "fieldset")) {
        var _el_querySelector;
        if (el.hasAttribute("disabled") && !((_el_querySelector = el.querySelector(":scope > legend")) === null || _el_querySelector === void 0 ? void 0 : _el_querySelector.contains(element))) {
          return true;
        }
      } else if (el.tagName.includes("-")) {
        if (el.constructor.formAssociated && el.hasAttribute("disabled")) {
          return true;
        }
      }
    }
    return false;
  }
  function getActiveElement(document2) {
    const activeElement = document2.activeElement;
    if (activeElement === null || activeElement === void 0 ? void 0 : activeElement.shadowRoot) {
      return getActiveElement(activeElement.shadowRoot);
    } else {
      if (isDisabled(activeElement)) {
        return document2.ownerDocument ? (
          /* istanbul ignore next */
          document2.ownerDocument.body
        ) : document2.body;
      }
      return activeElement;
    }
  }
  function getActiveElementOrBody(document2) {
    var _getActiveElement;
    return (_getActiveElement = getActiveElement(document2)) !== null && _getActiveElement !== void 0 ? _getActiveElement : (
      /* istanbul ignore next */
      document2.body
    );
  }
  function findClosest(element, callback) {
    let el = element;
    do {
      if (callback(el)) {
        return el;
      }
      el = el.parentElement;
    } while (el && el !== element.ownerDocument.body);
    return void 0;
  }
  function isContentEditable(element) {
    return element.hasAttribute("contenteditable") && (element.getAttribute("contenteditable") == "true" || element.getAttribute("contenteditable") == "");
  }
  function getContentEditable(node) {
    const element = getElement$1(node);
    return element && (element.closest('[contenteditable=""]') || element.closest('[contenteditable="true"]'));
  }
  function getElement$1(node) {
    return node.nodeType === 1 ? node : node.parentElement;
  }
  var clickableInputTypes = /* @__PURE__ */ function(clickableInputTypes2) {
    clickableInputTypes2["button"] = "button";
    clickableInputTypes2["color"] = "color";
    clickableInputTypes2["file"] = "file";
    clickableInputTypes2["image"] = "image";
    clickableInputTypes2["reset"] = "reset";
    clickableInputTypes2["submit"] = "submit";
    clickableInputTypes2["checkbox"] = "checkbox";
    clickableInputTypes2["radio"] = "radio";
    return clickableInputTypes2;
  }(clickableInputTypes || {});
  function isClickableInput(element) {
    return isElementType(element, "button") || isElementType(element, "input") && element.type in clickableInputTypes;
  }
  function isEditable(element) {
    return isEditableInputOrTextArea(element) && !element.readOnly || isContentEditable(element);
  }
  var editableInputTypes = /* @__PURE__ */ function(editableInputTypes2) {
    editableInputTypes2["text"] = "text";
    editableInputTypes2["date"] = "date";
    editableInputTypes2["datetime-local"] = "datetime-local";
    editableInputTypes2["email"] = "email";
    editableInputTypes2["month"] = "month";
    editableInputTypes2["number"] = "number";
    editableInputTypes2["password"] = "password";
    editableInputTypes2["search"] = "search";
    editableInputTypes2["tel"] = "tel";
    editableInputTypes2["time"] = "time";
    editableInputTypes2["url"] = "url";
    editableInputTypes2["week"] = "week";
    return editableInputTypes2;
  }(editableInputTypes || {});
  function isEditableInputOrTextArea(element) {
    return isElementType(element, "textarea") || isElementType(element, "input") && element.type in editableInputTypes;
  }
  function hasOwnSelection(node) {
    return isElement$2(node) && isEditableInputOrTextArea(node);
  }
  function hasNoSelection(node) {
    return isElement$2(node) && isClickableInput(node);
  }
  function isElement$2(node) {
    return node.nodeType === 1;
  }
  function updateSelectionOnFocus(element) {
    const selection = element.ownerDocument.getSelection();
    if (!(selection === null || selection === void 0 ? void 0 : selection.focusNode)) {
      return;
    }
    if (hasOwnSelection(element)) {
      const contenteditable = getContentEditable(selection.focusNode);
      if (contenteditable) {
        if (!selection.isCollapsed) {
          var _contenteditable_firstChild;
          const focusNode = ((_contenteditable_firstChild = contenteditable.firstChild) === null || _contenteditable_firstChild === void 0 ? void 0 : _contenteditable_firstChild.nodeType) === 3 ? contenteditable.firstChild : contenteditable;
          selection.setBaseAndExtent(focusNode, 0, focusNode, 0);
        }
      } else {
        selection.setBaseAndExtent(element, 0, element, 0);
      }
    }
  }
  var build$1 = {};
  var ansiStyles = { exports: {} };
  ansiStyles.exports;
  (function(module2) {
    const ANSI_BACKGROUND_OFFSET = 10;
    const wrapAnsi256 = (offset = 0) => (code) => `\x1B[${38 + offset};5;${code}m`;
    const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\x1B[${38 + offset};2;${red};${green};${blue}m`;
    function assembleStyles() {
      const codes = /* @__PURE__ */ new Map();
      const styles = {
        modifier: {
          reset: [0, 0],
          // 21 isn't widely supported and 22 does the same thing
          bold: [1, 22],
          dim: [2, 22],
          italic: [3, 23],
          underline: [4, 24],
          overline: [53, 55],
          inverse: [7, 27],
          hidden: [8, 28],
          strikethrough: [9, 29]
        },
        color: {
          black: [30, 39],
          red: [31, 39],
          green: [32, 39],
          yellow: [33, 39],
          blue: [34, 39],
          magenta: [35, 39],
          cyan: [36, 39],
          white: [37, 39],
          // Bright color
          blackBright: [90, 39],
          redBright: [91, 39],
          greenBright: [92, 39],
          yellowBright: [93, 39],
          blueBright: [94, 39],
          magentaBright: [95, 39],
          cyanBright: [96, 39],
          whiteBright: [97, 39]
        },
        bgColor: {
          bgBlack: [40, 49],
          bgRed: [41, 49],
          bgGreen: [42, 49],
          bgYellow: [43, 49],
          bgBlue: [44, 49],
          bgMagenta: [45, 49],
          bgCyan: [46, 49],
          bgWhite: [47, 49],
          // Bright color
          bgBlackBright: [100, 49],
          bgRedBright: [101, 49],
          bgGreenBright: [102, 49],
          bgYellowBright: [103, 49],
          bgBlueBright: [104, 49],
          bgMagentaBright: [105, 49],
          bgCyanBright: [106, 49],
          bgWhiteBright: [107, 49]
        }
      };
      styles.color.gray = styles.color.blackBright;
      styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
      styles.color.grey = styles.color.blackBright;
      styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;
      for (const [groupName, group] of Object.entries(styles)) {
        for (const [styleName, style] of Object.entries(group)) {
          styles[styleName] = {
            open: `\x1B[${style[0]}m`,
            close: `\x1B[${style[1]}m`
          };
          group[styleName] = styles[styleName];
          codes.set(style[0], style[1]);
        }
        Object.defineProperty(styles, groupName, {
          value: group,
          enumerable: false
        });
      }
      Object.defineProperty(styles, "codes", {
        value: codes,
        enumerable: false
      });
      styles.color.close = "\x1B[39m";
      styles.bgColor.close = "\x1B[49m";
      styles.color.ansi256 = wrapAnsi256();
      styles.color.ansi16m = wrapAnsi16m();
      styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
      styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);
      Object.defineProperties(styles, {
        rgbToAnsi256: {
          value: (red, green, blue) => {
            if (red === green && green === blue) {
              if (red < 8) {
                return 16;
              }
              if (red > 248) {
                return 231;
              }
              return Math.round((red - 8) / 247 * 24) + 232;
            }
            return 16 + 36 * Math.round(red / 255 * 5) + 6 * Math.round(green / 255 * 5) + Math.round(blue / 255 * 5);
          },
          enumerable: false
        },
        hexToRgb: {
          value: (hex) => {
            const matches2 = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
            if (!matches2) {
              return [0, 0, 0];
            }
            let { colorString } = matches2.groups;
            if (colorString.length === 3) {
              colorString = colorString.split("").map((character) => character + character).join("");
            }
            const integer = Number.parseInt(colorString, 16);
            return [
              integer >> 16 & 255,
              integer >> 8 & 255,
              integer & 255
            ];
          },
          enumerable: false
        },
        hexToAnsi256: {
          value: (hex) => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
          enumerable: false
        }
      });
      return styles;
    }
    Object.defineProperty(module2, "exports", {
      enumerable: true,
      get: assembleStyles
    });
  })(ansiStyles);
  var ansiStylesExports = ansiStyles.exports;
  var collections = {};
  Object.defineProperty(collections, "__esModule", {
    value: true
  });
  collections.printIteratorEntries = printIteratorEntries;
  collections.printIteratorValues = printIteratorValues;
  collections.printListItems = printListItems;
  collections.printObjectProperties = printObjectProperties;
  const getKeysOfEnumerableProperties = (object, compareKeys) => {
    const keys7 = Object.keys(object).sort(compareKeys);
    if (Object.getOwnPropertySymbols) {
      Object.getOwnPropertySymbols(object).forEach((symbol) => {
        if (Object.getOwnPropertyDescriptor(object, symbol).enumerable) {
          keys7.push(symbol);
        }
      });
    }
    return keys7;
  };
  function printIteratorEntries(iterator, config2, indentation, depth, refs, printer2, separator = ": ") {
    let result = "";
    let current = iterator.next();
    if (!current.done) {
      result += config2.spacingOuter;
      const indentationNext = indentation + config2.indent;
      while (!current.done) {
        const name = printer2(
          current.value[0],
          config2,
          indentationNext,
          depth,
          refs
        );
        const value = printer2(
          current.value[1],
          config2,
          indentationNext,
          depth,
          refs
        );
        result += indentationNext + name + separator + value;
        current = iterator.next();
        if (!current.done) {
          result += "," + config2.spacingInner;
        } else if (!config2.min) {
          result += ",";
        }
      }
      result += config2.spacingOuter + indentation;
    }
    return result;
  }
  function printIteratorValues(iterator, config2, indentation, depth, refs, printer2) {
    let result = "";
    let current = iterator.next();
    if (!current.done) {
      result += config2.spacingOuter;
      const indentationNext = indentation + config2.indent;
      while (!current.done) {
        result += indentationNext + printer2(current.value, config2, indentationNext, depth, refs);
        current = iterator.next();
        if (!current.done) {
          result += "," + config2.spacingInner;
        } else if (!config2.min) {
          result += ",";
        }
      }
      result += config2.spacingOuter + indentation;
    }
    return result;
  }
  function printListItems(list, config2, indentation, depth, refs, printer2) {
    let result = "";
    if (list.length) {
      result += config2.spacingOuter;
      const indentationNext = indentation + config2.indent;
      for (let i = 0; i < list.length; i++) {
        result += indentationNext;
        if (i in list) {
          result += printer2(list[i], config2, indentationNext, depth, refs);
        }
        if (i < list.length - 1) {
          result += "," + config2.spacingInner;
        } else if (!config2.min) {
          result += ",";
        }
      }
      result += config2.spacingOuter + indentation;
    }
    return result;
  }
  function printObjectProperties(val, config2, indentation, depth, refs, printer2) {
    let result = "";
    const keys7 = getKeysOfEnumerableProperties(val, config2.compareKeys);
    if (keys7.length) {
      result += config2.spacingOuter;
      const indentationNext = indentation + config2.indent;
      for (let i = 0; i < keys7.length; i++) {
        const key = keys7[i];
        const name = printer2(key, config2, indentationNext, depth, refs);
        const value = printer2(val[key], config2, indentationNext, depth, refs);
        result += indentationNext + name + ": " + value;
        if (i < keys7.length - 1) {
          result += "," + config2.spacingInner;
        } else if (!config2.min) {
          result += ",";
        }
      }
      result += config2.spacingOuter + indentation;
    }
    return result;
  }
  var AsymmetricMatcher = {};
  Object.defineProperty(AsymmetricMatcher, "__esModule", {
    value: true
  });
  AsymmetricMatcher.test = AsymmetricMatcher.serialize = AsymmetricMatcher.default = void 0;
  var _collections$3 = collections;
  var global$2 = function() {
    if (typeof globalThis !== "undefined") {
      return globalThis;
    } else if (typeof global$2 !== "undefined") {
      return global$2;
    } else if (typeof self !== "undefined") {
      return self;
    } else if (typeof window !== "undefined") {
      return window;
    } else {
      return Function("return this")();
    }
  }();
  var Symbol$2 = global$2["jest-symbol-do-not-touch"] || global$2.Symbol;
  const asymmetricMatcher = typeof Symbol$2 === "function" && Symbol$2.for ? Symbol$2.for("jest.asymmetricMatcher") : 1267621;
  const SPACE$2 = " ";
  const serialize$6 = (val, config2, indentation, depth, refs, printer2) => {
    const stringedValue = val.toString();
    if (stringedValue === "ArrayContaining" || stringedValue === "ArrayNotContaining") {
      if (++depth > config2.maxDepth) {
        return "[" + stringedValue + "]";
      }
      return stringedValue + SPACE$2 + "[" + (0, _collections$3.printListItems)(
        val.sample,
        config2,
        indentation,
        depth,
        refs,
        printer2
      ) + "]";
    }
    if (stringedValue === "ObjectContaining" || stringedValue === "ObjectNotContaining") {
      if (++depth > config2.maxDepth) {
        return "[" + stringedValue + "]";
      }
      return stringedValue + SPACE$2 + "{" + (0, _collections$3.printObjectProperties)(
        val.sample,
        config2,
        indentation,
        depth,
        refs,
        printer2
      ) + "}";
    }
    if (stringedValue === "StringMatching" || stringedValue === "StringNotMatching") {
      return stringedValue + SPACE$2 + printer2(val.sample, config2, indentation, depth, refs);
    }
    if (stringedValue === "StringContaining" || stringedValue === "StringNotContaining") {
      return stringedValue + SPACE$2 + printer2(val.sample, config2, indentation, depth, refs);
    }
    return val.toAsymmetricMatcher();
  };
  AsymmetricMatcher.serialize = serialize$6;
  const test$6 = (val) => val && val.$$typeof === asymmetricMatcher;
  AsymmetricMatcher.test = test$6;
  const plugin$6 = {
    serialize: serialize$6,
    test: test$6
  };
  var _default$2q = plugin$6;
  AsymmetricMatcher.default = _default$2q;
  var ConvertAnsi = {};
  var ansiRegex = ({ onlyFirst = false } = {}) => {
    const pattern2 = [
      "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
      "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern2, onlyFirst ? void 0 : "g");
  };
  Object.defineProperty(ConvertAnsi, "__esModule", {
    value: true
  });
  ConvertAnsi.test = ConvertAnsi.serialize = ConvertAnsi.default = void 0;
  var _ansiRegex = _interopRequireDefault$d(ansiRegex);
  var _ansiStyles$1 = _interopRequireDefault$d(ansiStylesExports);
  function _interopRequireDefault$d(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  const toHumanReadableAnsi = (text) => text.replace((0, _ansiRegex.default)(), (match) => {
    switch (match) {
      case _ansiStyles$1.default.red.close:
      case _ansiStyles$1.default.green.close:
      case _ansiStyles$1.default.cyan.close:
      case _ansiStyles$1.default.gray.close:
      case _ansiStyles$1.default.white.close:
      case _ansiStyles$1.default.yellow.close:
      case _ansiStyles$1.default.bgRed.close:
      case _ansiStyles$1.default.bgGreen.close:
      case _ansiStyles$1.default.bgYellow.close:
      case _ansiStyles$1.default.inverse.close:
      case _ansiStyles$1.default.dim.close:
      case _ansiStyles$1.default.bold.close:
      case _ansiStyles$1.default.reset.open:
      case _ansiStyles$1.default.reset.close:
        return "</>";
      case _ansiStyles$1.default.red.open:
        return "<red>";
      case _ansiStyles$1.default.green.open:
        return "<green>";
      case _ansiStyles$1.default.cyan.open:
        return "<cyan>";
      case _ansiStyles$1.default.gray.open:
        return "<gray>";
      case _ansiStyles$1.default.white.open:
        return "<white>";
      case _ansiStyles$1.default.yellow.open:
        return "<yellow>";
      case _ansiStyles$1.default.bgRed.open:
        return "<bgRed>";
      case _ansiStyles$1.default.bgGreen.open:
        return "<bgGreen>";
      case _ansiStyles$1.default.bgYellow.open:
        return "<bgYellow>";
      case _ansiStyles$1.default.inverse.open:
        return "<inverse>";
      case _ansiStyles$1.default.dim.open:
        return "<dim>";
      case _ansiStyles$1.default.bold.open:
        return "<bold>";
      default:
        return "";
    }
  });
  const test$5 = (val) => typeof val === "string" && !!val.match((0, _ansiRegex.default)());
  ConvertAnsi.test = test$5;
  const serialize$5 = (val, config2, indentation, depth, refs, printer2) => printer2(toHumanReadableAnsi(val), config2, indentation, depth, refs);
  ConvertAnsi.serialize = serialize$5;
  const plugin$5 = {
    serialize: serialize$5,
    test: test$5
  };
  var _default$2p = plugin$5;
  ConvertAnsi.default = _default$2p;
  var DOMCollection$1 = {};
  Object.defineProperty(DOMCollection$1, "__esModule", {
    value: true
  });
  DOMCollection$1.test = DOMCollection$1.serialize = DOMCollection$1.default = void 0;
  var _collections$2 = collections;
  const SPACE$1 = " ";
  const OBJECT_NAMES = ["DOMStringMap", "NamedNodeMap"];
  const ARRAY_REGEXP = /^(HTML\w*Collection|NodeList)$/;
  const testName = (name) => OBJECT_NAMES.indexOf(name) !== -1 || ARRAY_REGEXP.test(name);
  const test$4 = (val) => val && val.constructor && !!val.constructor.name && testName(val.constructor.name);
  DOMCollection$1.test = test$4;
  const isNamedNodeMap = (collection) => collection.constructor.name === "NamedNodeMap";
  const serialize$4 = (collection, config2, indentation, depth, refs, printer2) => {
    const name = collection.constructor.name;
    if (++depth > config2.maxDepth) {
      return "[" + name + "]";
    }
    return (config2.min ? "" : name + SPACE$1) + (OBJECT_NAMES.indexOf(name) !== -1 ? "{" + (0, _collections$2.printObjectProperties)(
      isNamedNodeMap(collection) ? Array.from(collection).reduce((props, attribute) => {
        props[attribute.name] = attribute.value;
        return props;
      }, {}) : { ...collection },
      config2,
      indentation,
      depth,
      refs,
      printer2
    ) + "}" : "[" + (0, _collections$2.printListItems)(
      Array.from(collection),
      config2,
      indentation,
      depth,
      refs,
      printer2
    ) + "]");
  };
  DOMCollection$1.serialize = serialize$4;
  const plugin$4 = {
    serialize: serialize$4,
    test: test$4
  };
  var _default$2o = plugin$4;
  DOMCollection$1.default = _default$2o;
  var DOMElement = {};
  var markup = {};
  var escapeHTML$2 = {};
  Object.defineProperty(escapeHTML$2, "__esModule", {
    value: true
  });
  escapeHTML$2.default = escapeHTML$1;
  function escapeHTML$1(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  Object.defineProperty(markup, "__esModule", {
    value: true
  });
  markup.printText = markup.printProps = markup.printElementAsLeaf = markup.printElement = markup.printComment = markup.printChildren = void 0;
  var _escapeHTML = _interopRequireDefault$c(escapeHTML$2);
  function _interopRequireDefault$c(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  const printProps$1 = (keys7, props, config2, indentation, depth, refs, printer2) => {
    const indentationNext = indentation + config2.indent;
    const colors = config2.colors;
    return keys7.map((key) => {
      const value = props[key];
      let printed = printer2(value, config2, indentationNext, depth, refs);
      if (typeof value !== "string") {
        if (printed.indexOf("\n") !== -1) {
          printed = config2.spacingOuter + indentationNext + printed + config2.spacingOuter + indentation;
        }
        printed = "{" + printed + "}";
      }
      return config2.spacingInner + indentation + colors.prop.open + key + colors.prop.close + "=" + colors.value.open + printed + colors.value.close;
    }).join("");
  };
  markup.printProps = printProps$1;
  const printChildren$1 = (children, config2, indentation, depth, refs, printer2) => children.map(
    (child) => config2.spacingOuter + indentation + (typeof child === "string" ? printText$1(child, config2) : printer2(child, config2, indentation, depth, refs))
  ).join("");
  markup.printChildren = printChildren$1;
  const printText$1 = (text, config2) => {
    const contentColor = config2.colors.content;
    return contentColor.open + (0, _escapeHTML.default)(text) + contentColor.close;
  };
  markup.printText = printText$1;
  const printComment$1 = (comment2, config2) => {
    const commentColor = config2.colors.comment;
    return commentColor.open + "<!--" + (0, _escapeHTML.default)(comment2) + "-->" + commentColor.close;
  };
  markup.printComment = printComment$1;
  const printElement$1 = (type2, printedProps, printedChildren, config2, indentation) => {
    const tagColor = config2.colors.tag;
    return tagColor.open + "<" + type2 + (printedProps && tagColor.close + printedProps + config2.spacingOuter + indentation + tagColor.open) + (printedChildren ? ">" + tagColor.close + printedChildren + config2.spacingOuter + indentation + tagColor.open + "</" + type2 : (printedProps && !config2.min ? "" : " ") + "/") + ">" + tagColor.close;
  };
  markup.printElement = printElement$1;
  const printElementAsLeaf$1 = (type2, config2) => {
    const tagColor = config2.colors.tag;
    return tagColor.open + "<" + type2 + tagColor.close + " …" + tagColor.open + " />" + tagColor.close;
  };
  markup.printElementAsLeaf = printElementAsLeaf$1;
  Object.defineProperty(DOMElement, "__esModule", {
    value: true
  });
  DOMElement.test = DOMElement.serialize = DOMElement.default = void 0;
  var _markup$2 = markup;
  const ELEMENT_NODE$2 = 1;
  const TEXT_NODE$2 = 3;
  const COMMENT_NODE$2 = 8;
  const FRAGMENT_NODE$1 = 11;
  const ELEMENT_REGEXP$1 = /^((HTML|SVG)\w*)?Element$/;
  const testHasAttribute = (val) => {
    try {
      return typeof val.hasAttribute === "function" && val.hasAttribute("is");
    } catch {
      return false;
    }
  };
  const testNode$1 = (val) => {
    const constructorName = val.constructor.name;
    const { nodeType, tagName } = val;
    const isCustomElement2 = typeof tagName === "string" && tagName.includes("-") || testHasAttribute(val);
    return nodeType === ELEMENT_NODE$2 && (ELEMENT_REGEXP$1.test(constructorName) || isCustomElement2) || nodeType === TEXT_NODE$2 && constructorName === "Text" || nodeType === COMMENT_NODE$2 && constructorName === "Comment" || nodeType === FRAGMENT_NODE$1 && constructorName === "DocumentFragment";
  };
  const test$3 = (val) => {
    var _val$constructor;
    return (val === null || val === void 0 ? void 0 : (_val$constructor = val.constructor) === null || _val$constructor === void 0 ? void 0 : _val$constructor.name) && testNode$1(val);
  };
  DOMElement.test = test$3;
  function nodeIsText$1(node) {
    return node.nodeType === TEXT_NODE$2;
  }
  function nodeIsComment$1(node) {
    return node.nodeType === COMMENT_NODE$2;
  }
  function nodeIsFragment$1(node) {
    return node.nodeType === FRAGMENT_NODE$1;
  }
  const serialize$3 = (node, config2, indentation, depth, refs, printer2) => {
    if (nodeIsText$1(node)) {
      return (0, _markup$2.printText)(node.data, config2);
    }
    if (nodeIsComment$1(node)) {
      return (0, _markup$2.printComment)(node.data, config2);
    }
    const type2 = nodeIsFragment$1(node) ? "DocumentFragment" : node.tagName.toLowerCase();
    if (++depth > config2.maxDepth) {
      return (0, _markup$2.printElementAsLeaf)(type2, config2);
    }
    return (0, _markup$2.printElement)(
      type2,
      (0, _markup$2.printProps)(
        nodeIsFragment$1(node) ? [] : Array.from(node.attributes).map((attr) => attr.name).sort(),
        nodeIsFragment$1(node) ? {} : Array.from(node.attributes).reduce((props, attribute) => {
          props[attribute.name] = attribute.value;
          return props;
        }, {}),
        config2,
        indentation + config2.indent,
        depth,
        refs,
        printer2
      ),
      (0, _markup$2.printChildren)(
        Array.prototype.slice.call(node.childNodes || node.children),
        config2,
        indentation + config2.indent,
        depth,
        refs,
        printer2
      ),
      config2,
      indentation
    );
  };
  DOMElement.serialize = serialize$3;
  const plugin$3 = {
    serialize: serialize$3,
    test: test$3
  };
  var _default$2n = plugin$3;
  DOMElement.default = _default$2n;
  var Immutable = {};
  Object.defineProperty(Immutable, "__esModule", {
    value: true
  });
  Immutable.test = Immutable.serialize = Immutable.default = void 0;
  var _collections$1 = collections;
  const IS_ITERABLE_SENTINEL = "@@__IMMUTABLE_ITERABLE__@@";
  const IS_LIST_SENTINEL = "@@__IMMUTABLE_LIST__@@";
  const IS_KEYED_SENTINEL = "@@__IMMUTABLE_KEYED__@@";
  const IS_MAP_SENTINEL = "@@__IMMUTABLE_MAP__@@";
  const IS_ORDERED_SENTINEL = "@@__IMMUTABLE_ORDERED__@@";
  const IS_RECORD_SENTINEL = "@@__IMMUTABLE_RECORD__@@";
  const IS_SEQ_SENTINEL = "@@__IMMUTABLE_SEQ__@@";
  const IS_SET_SENTINEL = "@@__IMMUTABLE_SET__@@";
  const IS_STACK_SENTINEL = "@@__IMMUTABLE_STACK__@@";
  const getImmutableName = (name) => "Immutable." + name;
  const printAsLeaf = (name) => "[" + name + "]";
  const SPACE = " ";
  const LAZY = "…";
  const printImmutableEntries = (val, config2, indentation, depth, refs, printer2, type2) => ++depth > config2.maxDepth ? printAsLeaf(getImmutableName(type2)) : getImmutableName(type2) + SPACE + "{" + (0, _collections$1.printIteratorEntries)(
    val.entries(),
    config2,
    indentation,
    depth,
    refs,
    printer2
  ) + "}";
  function getRecordEntries(val) {
    let i = 0;
    return {
      next() {
        if (i < val._keys.length) {
          const key = val._keys[i++];
          return {
            done: false,
            value: [key, val.get(key)]
          };
        }
        return {
          done: true,
          value: void 0
        };
      }
    };
  }
  const printImmutableRecord = (val, config2, indentation, depth, refs, printer2) => {
    const name = getImmutableName(val._name || "Record");
    return ++depth > config2.maxDepth ? printAsLeaf(name) : name + SPACE + "{" + (0, _collections$1.printIteratorEntries)(
      getRecordEntries(val),
      config2,
      indentation,
      depth,
      refs,
      printer2
    ) + "}";
  };
  const printImmutableSeq = (val, config2, indentation, depth, refs, printer2) => {
    const name = getImmutableName("Seq");
    if (++depth > config2.maxDepth) {
      return printAsLeaf(name);
    }
    if (val[IS_KEYED_SENTINEL]) {
      return name + SPACE + "{" + // from Immutable collection of entries or from ECMAScript object
      (val._iter || val._object ? (0, _collections$1.printIteratorEntries)(
        val.entries(),
        config2,
        indentation,
        depth,
        refs,
        printer2
      ) : LAZY) + "}";
    }
    return name + SPACE + "[" + (val._iter || // from Immutable collection of values
    val._array || // from ECMAScript array
    val._collection || // from ECMAScript collection in immutable v4
    val._iterable ? (0, _collections$1.printIteratorValues)(
      val.values(),
      config2,
      indentation,
      depth,
      refs,
      printer2
    ) : LAZY) + "]";
  };
  const printImmutableValues = (val, config2, indentation, depth, refs, printer2, type2) => ++depth > config2.maxDepth ? printAsLeaf(getImmutableName(type2)) : getImmutableName(type2) + SPACE + "[" + (0, _collections$1.printIteratorValues)(
    val.values(),
    config2,
    indentation,
    depth,
    refs,
    printer2
  ) + "]";
  const serialize$2 = (val, config2, indentation, depth, refs, printer2) => {
    if (val[IS_MAP_SENTINEL]) {
      return printImmutableEntries(
        val,
        config2,
        indentation,
        depth,
        refs,
        printer2,
        val[IS_ORDERED_SENTINEL] ? "OrderedMap" : "Map"
      );
    }
    if (val[IS_LIST_SENTINEL]) {
      return printImmutableValues(
        val,
        config2,
        indentation,
        depth,
        refs,
        printer2,
        "List"
      );
    }
    if (val[IS_SET_SENTINEL]) {
      return printImmutableValues(
        val,
        config2,
        indentation,
        depth,
        refs,
        printer2,
        val[IS_ORDERED_SENTINEL] ? "OrderedSet" : "Set"
      );
    }
    if (val[IS_STACK_SENTINEL]) {
      return printImmutableValues(
        val,
        config2,
        indentation,
        depth,
        refs,
        printer2,
        "Stack"
      );
    }
    if (val[IS_SEQ_SENTINEL]) {
      return printImmutableSeq(val, config2, indentation, depth, refs, printer2);
    }
    return printImmutableRecord(val, config2, indentation, depth, refs, printer2);
  };
  Immutable.serialize = serialize$2;
  const test$2 = (val) => val && (val[IS_ITERABLE_SENTINEL] === true || val[IS_RECORD_SENTINEL] === true);
  Immutable.test = test$2;
  const plugin$2 = {
    serialize: serialize$2,
    test: test$2
  };
  var _default$2m = plugin$2;
  Immutable.default = _default$2m;
  var ReactElement = {};
  var reactIs = { exports: {} };
  var reactIs_production_min = {};
  /** @license React v17.0.2
   * react-is.production.min.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */
  var b = 60103, c = 60106, d = 60107, e = 60108, f = 60114, g = 60109, h = 60110, k$2 = 60112, l = 60113, m = 60120, n = 60115, p2 = 60116, q = 60121, r = 60122, u = 60117, v = 60129, w = 60131;
  if ("function" === typeof Symbol && Symbol.for) {
    var x = Symbol.for;
    b = x("react.element");
    c = x("react.portal");
    d = x("react.fragment");
    e = x("react.strict_mode");
    f = x("react.profiler");
    g = x("react.provider");
    h = x("react.context");
    k$2 = x("react.forward_ref");
    l = x("react.suspense");
    m = x("react.suspense_list");
    n = x("react.memo");
    p2 = x("react.lazy");
    q = x("react.block");
    r = x("react.server.block");
    u = x("react.fundamental");
    v = x("react.debug_trace_mode");
    w = x("react.legacy_hidden");
  }
  function y(a) {
    if ("object" === typeof a && null !== a) {
      var t = a.$$typeof;
      switch (t) {
        case b:
          switch (a = a.type, a) {
            case d:
            case f:
            case e:
            case l:
            case m:
              return a;
            default:
              switch (a = a && a.$$typeof, a) {
                case h:
                case k$2:
                case p2:
                case n:
                case g:
                  return a;
                default:
                  return t;
              }
          }
        case c:
          return t;
      }
    }
  }
  var z = g, A = b, B = k$2, C = d, D = p2, E = n, F = c, G = f, H = e, I = l;
  reactIs_production_min.ContextConsumer = h;
  reactIs_production_min.ContextProvider = z;
  reactIs_production_min.Element = A;
  reactIs_production_min.ForwardRef = B;
  reactIs_production_min.Fragment = C;
  reactIs_production_min.Lazy = D;
  reactIs_production_min.Memo = E;
  reactIs_production_min.Portal = F;
  reactIs_production_min.Profiler = G;
  reactIs_production_min.StrictMode = H;
  reactIs_production_min.Suspense = I;
  reactIs_production_min.isAsyncMode = function() {
    return false;
  };
  reactIs_production_min.isConcurrentMode = function() {
    return false;
  };
  reactIs_production_min.isContextConsumer = function(a) {
    return y(a) === h;
  };
  reactIs_production_min.isContextProvider = function(a) {
    return y(a) === g;
  };
  reactIs_production_min.isElement = function(a) {
    return "object" === typeof a && null !== a && a.$$typeof === b;
  };
  reactIs_production_min.isForwardRef = function(a) {
    return y(a) === k$2;
  };
  reactIs_production_min.isFragment = function(a) {
    return y(a) === d;
  };
  reactIs_production_min.isLazy = function(a) {
    return y(a) === p2;
  };
  reactIs_production_min.isMemo = function(a) {
    return y(a) === n;
  };
  reactIs_production_min.isPortal = function(a) {
    return y(a) === c;
  };
  reactIs_production_min.isProfiler = function(a) {
    return y(a) === f;
  };
  reactIs_production_min.isStrictMode = function(a) {
    return y(a) === e;
  };
  reactIs_production_min.isSuspense = function(a) {
    return y(a) === l;
  };
  reactIs_production_min.isValidElementType = function(a) {
    return "string" === typeof a || "function" === typeof a || a === d || a === f || a === v || a === e || a === l || a === m || a === w || "object" === typeof a && null !== a && (a.$$typeof === p2 || a.$$typeof === n || a.$$typeof === g || a.$$typeof === h || a.$$typeof === k$2 || a.$$typeof === u || a.$$typeof === q || a[0] === r) ? true : false;
  };
  reactIs_production_min.typeOf = y;
  {
    reactIs.exports = reactIs_production_min;
  }
  var reactIsExports = reactIs.exports;
  Object.defineProperty(ReactElement, "__esModule", {
    value: true
  });
  ReactElement.test = ReactElement.serialize = ReactElement.default = void 0;
  var ReactIs = _interopRequireWildcard(reactIsExports);
  var _markup$1 = markup;
  function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache2 = _getRequireWildcardCache(nodeInterop);
    if (cache2 && cache2.has(obj)) {
      return cache2.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache2) {
      cache2.set(obj, newObj);
    }
    return newObj;
  }
  const getChildren = (arg, children = []) => {
    if (Array.isArray(arg)) {
      arg.forEach((item) => {
        getChildren(item, children);
      });
    } else if (arg != null && arg !== false) {
      children.push(arg);
    }
    return children;
  };
  const getType = (element) => {
    const type2 = element.type;
    if (typeof type2 === "string") {
      return type2;
    }
    if (typeof type2 === "function") {
      return type2.displayName || type2.name || "Unknown";
    }
    if (ReactIs.isFragment(element)) {
      return "React.Fragment";
    }
    if (ReactIs.isSuspense(element)) {
      return "React.Suspense";
    }
    if (typeof type2 === "object" && type2 !== null) {
      if (ReactIs.isContextProvider(element)) {
        return "Context.Provider";
      }
      if (ReactIs.isContextConsumer(element)) {
        return "Context.Consumer";
      }
      if (ReactIs.isForwardRef(element)) {
        if (type2.displayName) {
          return type2.displayName;
        }
        const functionName = type2.render.displayName || type2.render.name || "";
        return functionName !== "" ? "ForwardRef(" + functionName + ")" : "ForwardRef";
      }
      if (ReactIs.isMemo(element)) {
        const functionName = type2.displayName || type2.type.displayName || type2.type.name || "";
        return functionName !== "" ? "Memo(" + functionName + ")" : "Memo";
      }
    }
    return "UNDEFINED";
  };
  const getPropKeys$1 = (element) => {
    const { props } = element;
    return Object.keys(props).filter((key) => key !== "children" && props[key] !== void 0).sort();
  };
  const serialize$1 = (element, config2, indentation, depth, refs, printer2) => ++depth > config2.maxDepth ? (0, _markup$1.printElementAsLeaf)(getType(element), config2) : (0, _markup$1.printElement)(
    getType(element),
    (0, _markup$1.printProps)(
      getPropKeys$1(element),
      element.props,
      config2,
      indentation + config2.indent,
      depth,
      refs,
      printer2
    ),
    (0, _markup$1.printChildren)(
      getChildren(element.props.children),
      config2,
      indentation + config2.indent,
      depth,
      refs,
      printer2
    ),
    config2,
    indentation
  );
  ReactElement.serialize = serialize$1;
  const test$1 = (val) => val != null && ReactIs.isElement(val);
  ReactElement.test = test$1;
  const plugin$1 = {
    serialize: serialize$1,
    test: test$1
  };
  var _default$2l = plugin$1;
  ReactElement.default = _default$2l;
  var ReactTestComponent = {};
  Object.defineProperty(ReactTestComponent, "__esModule", {
    value: true
  });
  ReactTestComponent.test = ReactTestComponent.serialize = ReactTestComponent.default = void 0;
  var _markup = markup;
  var global$1 = function() {
    if (typeof globalThis !== "undefined") {
      return globalThis;
    } else if (typeof global$1 !== "undefined") {
      return global$1;
    } else if (typeof self !== "undefined") {
      return self;
    } else if (typeof window !== "undefined") {
      return window;
    } else {
      return Function("return this")();
    }
  }();
  var Symbol$1 = global$1["jest-symbol-do-not-touch"] || global$1.Symbol;
  const testSymbol = typeof Symbol$1 === "function" && Symbol$1.for ? Symbol$1.for("react.test.json") : 245830487;
  const getPropKeys = (object) => {
    const { props } = object;
    return props ? Object.keys(props).filter((key) => props[key] !== void 0).sort() : [];
  };
  const serialize = (object, config2, indentation, depth, refs, printer2) => ++depth > config2.maxDepth ? (0, _markup.printElementAsLeaf)(object.type, config2) : (0, _markup.printElement)(
    object.type,
    object.props ? (0, _markup.printProps)(
      getPropKeys(object),
      object.props,
      config2,
      indentation + config2.indent,
      depth,
      refs,
      printer2
    ) : "",
    object.children ? (0, _markup.printChildren)(
      object.children,
      config2,
      indentation + config2.indent,
      depth,
      refs,
      printer2
    ) : "",
    config2,
    indentation
  );
  ReactTestComponent.serialize = serialize;
  const test = (val) => val && val.$$typeof === testSymbol;
  ReactTestComponent.test = test;
  const plugin = {
    serialize,
    test
  };
  var _default$2k = plugin;
  ReactTestComponent.default = _default$2k;
  Object.defineProperty(build$1, "__esModule", {
    value: true
  });
  build$1.default = build$1.DEFAULT_OPTIONS = void 0;
  var format_1 = build$1.format = format;
  var plugins_1 = build$1.plugins = void 0;
  var _ansiStyles = _interopRequireDefault$b(ansiStylesExports);
  var _collections = collections;
  var _AsymmetricMatcher = _interopRequireDefault$b(
    AsymmetricMatcher
  );
  var _ConvertAnsi = _interopRequireDefault$b(ConvertAnsi);
  var _DOMCollection = _interopRequireDefault$b(DOMCollection$1);
  var _DOMElement = _interopRequireDefault$b(DOMElement);
  var _Immutable = _interopRequireDefault$b(Immutable);
  var _ReactElement = _interopRequireDefault$b(ReactElement);
  var _ReactTestComponent = _interopRequireDefault$b(
    ReactTestComponent
  );
  function _interopRequireDefault$b(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  const toString = Object.prototype.toString;
  const toISOString = Date.prototype.toISOString;
  const errorToString = Error.prototype.toString;
  const regExpToString = RegExp.prototype.toString;
  const getConstructorName = (val) => typeof val.constructor === "function" && val.constructor.name || "Object";
  const isWindow = (val) => typeof window !== "undefined" && val === window;
  const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
  const NEWLINE_REGEXP = /\n/gi;
  class PrettyFormatPluginError extends Error {
    constructor(message, stack) {
      super(message);
      this.stack = stack;
      this.name = this.constructor.name;
    }
  }
  function isToStringedArrayType(toStringed) {
    return toStringed === "[object Array]" || toStringed === "[object ArrayBuffer]" || toStringed === "[object DataView]" || toStringed === "[object Float32Array]" || toStringed === "[object Float64Array]" || toStringed === "[object Int8Array]" || toStringed === "[object Int16Array]" || toStringed === "[object Int32Array]" || toStringed === "[object Uint8Array]" || toStringed === "[object Uint8ClampedArray]" || toStringed === "[object Uint16Array]" || toStringed === "[object Uint32Array]";
  }
  function printNumber(val) {
    return Object.is(val, -0) ? "-0" : String(val);
  }
  function printBigInt(val) {
    return String(`${val}n`);
  }
  function printFunction(val, printFunctionName) {
    if (!printFunctionName) {
      return "[Function]";
    }
    return "[Function " + (val.name || "anonymous") + "]";
  }
  function printSymbol(val) {
    return String(val).replace(SYMBOL_REGEXP, "Symbol($1)");
  }
  function printError(val) {
    return "[" + errorToString.call(val) + "]";
  }
  function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
    if (val === true || val === false) {
      return "" + val;
    }
    if (val === void 0) {
      return "undefined";
    }
    if (val === null) {
      return "null";
    }
    const typeOf = typeof val;
    if (typeOf === "number") {
      return printNumber(val);
    }
    if (typeOf === "bigint") {
      return printBigInt(val);
    }
    if (typeOf === "string") {
      if (escapeString) {
        return '"' + val.replace(/"|\\/g, "\\$&") + '"';
      }
      return '"' + val + '"';
    }
    if (typeOf === "function") {
      return printFunction(val, printFunctionName);
    }
    if (typeOf === "symbol") {
      return printSymbol(val);
    }
    const toStringed = toString.call(val);
    if (toStringed === "[object WeakMap]") {
      return "WeakMap {}";
    }
    if (toStringed === "[object WeakSet]") {
      return "WeakSet {}";
    }
    if (toStringed === "[object Function]" || toStringed === "[object GeneratorFunction]") {
      return printFunction(val, printFunctionName);
    }
    if (toStringed === "[object Symbol]") {
      return printSymbol(val);
    }
    if (toStringed === "[object Date]") {
      return isNaN(+val) ? "Date { NaN }" : toISOString.call(val);
    }
    if (toStringed === "[object Error]") {
      return printError(val);
    }
    if (toStringed === "[object RegExp]") {
      if (escapeRegex) {
        return regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
      }
      return regExpToString.call(val);
    }
    if (val instanceof Error) {
      return printError(val);
    }
    return null;
  }
  function printComplexValue(val, config2, indentation, depth, refs, hasCalledToJSON) {
    if (refs.indexOf(val) !== -1) {
      return "[Circular]";
    }
    refs = refs.slice();
    refs.push(val);
    const hitMaxDepth = ++depth > config2.maxDepth;
    const min = config2.min;
    if (config2.callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === "function" && !hasCalledToJSON) {
      return printer(val.toJSON(), config2, indentation, depth, refs, true);
    }
    const toStringed = toString.call(val);
    if (toStringed === "[object Arguments]") {
      return hitMaxDepth ? "[Arguments]" : (min ? "" : "Arguments ") + "[" + (0, _collections.printListItems)(
        val,
        config2,
        indentation,
        depth,
        refs,
        printer
      ) + "]";
    }
    if (isToStringedArrayType(toStringed)) {
      return hitMaxDepth ? "[" + val.constructor.name + "]" : (min ? "" : !config2.printBasicPrototype && val.constructor.name === "Array" ? "" : val.constructor.name + " ") + "[" + (0, _collections.printListItems)(
        val,
        config2,
        indentation,
        depth,
        refs,
        printer
      ) + "]";
    }
    if (toStringed === "[object Map]") {
      return hitMaxDepth ? "[Map]" : "Map {" + (0, _collections.printIteratorEntries)(
        val.entries(),
        config2,
        indentation,
        depth,
        refs,
        printer,
        " => "
      ) + "}";
    }
    if (toStringed === "[object Set]") {
      return hitMaxDepth ? "[Set]" : "Set {" + (0, _collections.printIteratorValues)(
        val.values(),
        config2,
        indentation,
        depth,
        refs,
        printer
      ) + "}";
    }
    return hitMaxDepth || isWindow(val) ? "[" + getConstructorName(val) + "]" : (min ? "" : !config2.printBasicPrototype && getConstructorName(val) === "Object" ? "" : getConstructorName(val) + " ") + "{" + (0, _collections.printObjectProperties)(
      val,
      config2,
      indentation,
      depth,
      refs,
      printer
    ) + "}";
  }
  function isNewPlugin(plugin2) {
    return plugin2.serialize != null;
  }
  function printPlugin(plugin2, val, config2, indentation, depth, refs) {
    let printed;
    try {
      printed = isNewPlugin(plugin2) ? plugin2.serialize(val, config2, indentation, depth, refs, printer) : plugin2.print(
        val,
        (valChild) => printer(valChild, config2, indentation, depth, refs),
        (str) => {
          const indentationNext = indentation + config2.indent;
          return indentationNext + str.replace(NEWLINE_REGEXP, "\n" + indentationNext);
        },
        {
          edgeSpacing: config2.spacingOuter,
          min: config2.min,
          spacing: config2.spacingInner
        },
        config2.colors
      );
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
    if (typeof printed !== "string") {
      throw new Error(
        `pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`
      );
    }
    return printed;
  }
  function findPlugin(plugins2, val) {
    for (let p3 = 0; p3 < plugins2.length; p3++) {
      try {
        if (plugins2[p3].test(val)) {
          return plugins2[p3];
        }
      } catch (error) {
        throw new PrettyFormatPluginError(error.message, error.stack);
      }
    }
    return null;
  }
  function printer(val, config2, indentation, depth, refs, hasCalledToJSON) {
    const plugin2 = findPlugin(config2.plugins, val);
    if (plugin2 !== null) {
      return printPlugin(plugin2, val, config2, indentation, depth, refs);
    }
    const basicResult = printBasicValue(
      val,
      config2.printFunctionName,
      config2.escapeRegex,
      config2.escapeString
    );
    if (basicResult !== null) {
      return basicResult;
    }
    return printComplexValue(
      val,
      config2,
      indentation,
      depth,
      refs,
      hasCalledToJSON
    );
  }
  const DEFAULT_THEME = {
    comment: "gray",
    content: "reset",
    prop: "yellow",
    tag: "cyan",
    value: "green"
  };
  const DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);
  const DEFAULT_OPTIONS = {
    callToJSON: true,
    compareKeys: void 0,
    escapeRegex: false,
    escapeString: true,
    highlight: false,
    indent: 2,
    maxDepth: Infinity,
    min: false,
    plugins: [],
    printBasicPrototype: true,
    printFunctionName: true,
    theme: DEFAULT_THEME
  };
  build$1.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
  function validateOptions(options) {
    Object.keys(options).forEach((key) => {
      if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
        throw new Error(`pretty-format: Unknown option "${key}".`);
      }
    });
    if (options.min && options.indent !== void 0 && options.indent !== 0) {
      throw new Error(
        'pretty-format: Options "min" and "indent" cannot be used together.'
      );
    }
    if (options.theme !== void 0) {
      if (options.theme === null) {
        throw new Error('pretty-format: Option "theme" must not be null.');
      }
      if (typeof options.theme !== "object") {
        throw new Error(
          `pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`
        );
      }
    }
  }
  const getColorsHighlight = (options) => DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value = options.theme && options.theme[key] !== void 0 ? options.theme[key] : DEFAULT_THEME[key];
    const color = value && _ansiStyles.default[value];
    if (color && typeof color.close === "string" && typeof color.open === "string") {
      colors[key] = color;
    } else {
      throw new Error(
        `pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`
      );
    }
    return colors;
  }, /* @__PURE__ */ Object.create(null));
  const getColorsEmpty = () => DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = {
      close: "",
      open: ""
    };
    return colors;
  }, /* @__PURE__ */ Object.create(null));
  const getPrintFunctionName = (options) => options && options.printFunctionName !== void 0 ? options.printFunctionName : DEFAULT_OPTIONS.printFunctionName;
  const getEscapeRegex = (options) => options && options.escapeRegex !== void 0 ? options.escapeRegex : DEFAULT_OPTIONS.escapeRegex;
  const getEscapeString = (options) => options && options.escapeString !== void 0 ? options.escapeString : DEFAULT_OPTIONS.escapeString;
  const getConfig$1 = (options) => {
    var _options$printBasicPr;
    return {
      callToJSON: options && options.callToJSON !== void 0 ? options.callToJSON : DEFAULT_OPTIONS.callToJSON,
      colors: options && options.highlight ? getColorsHighlight(options) : getColorsEmpty(),
      compareKeys: options && typeof options.compareKeys === "function" ? options.compareKeys : DEFAULT_OPTIONS.compareKeys,
      escapeRegex: getEscapeRegex(options),
      escapeString: getEscapeString(options),
      indent: options && options.min ? "" : createIndent(
        options && options.indent !== void 0 ? options.indent : DEFAULT_OPTIONS.indent
      ),
      maxDepth: options && options.maxDepth !== void 0 ? options.maxDepth : DEFAULT_OPTIONS.maxDepth,
      min: options && options.min !== void 0 ? options.min : DEFAULT_OPTIONS.min,
      plugins: options && options.plugins !== void 0 ? options.plugins : DEFAULT_OPTIONS.plugins,
      printBasicPrototype: (_options$printBasicPr = options === null || options === void 0 ? void 0 : options.printBasicPrototype) !== null && _options$printBasicPr !== void 0 ? _options$printBasicPr : true,
      printFunctionName: getPrintFunctionName(options),
      spacingInner: options && options.min ? " " : "\n",
      spacingOuter: options && options.min ? "" : "\n"
    };
  };
  function createIndent(indent) {
    return new Array(indent + 1).join(" ");
  }
  function format(val, options) {
    if (options) {
      validateOptions(options);
      if (options.plugins) {
        const plugin2 = findPlugin(options.plugins, val);
        if (plugin2 !== null) {
          return printPlugin(plugin2, val, getConfig$1(options), "", 0, []);
        }
      }
    }
    const basicResult = printBasicValue(
      val,
      getPrintFunctionName(options),
      getEscapeRegex(options),
      getEscapeString(options)
    );
    if (basicResult !== null) {
      return basicResult;
    }
    return printComplexValue(val, getConfig$1(options), "", 0, []);
  }
  const plugins = {
    AsymmetricMatcher: _AsymmetricMatcher.default,
    ConvertAnsi: _ConvertAnsi.default,
    DOMCollection: _DOMCollection.default,
    DOMElement: _DOMElement.default,
    Immutable: _Immutable.default,
    ReactElement: _ReactElement.default,
    ReactTestComponent: _ReactTestComponent.default
  };
  plugins_1 = build$1.plugins = plugins;
  var _default$2j = format;
  build$1.default = _default$2j;
  var toStr = Object.prototype.toString;
  function isCallable(fn) {
    return typeof fn === "function" || toStr.call(fn) === "[object Function]";
  }
  function toInteger(value) {
    var number = Number(value);
    if (isNaN(number)) {
      return 0;
    }
    if (number === 0 || !isFinite(number)) {
      return number;
    }
    return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
  }
  var maxSafeInteger = Math.pow(2, 53) - 1;
  function toLength(value) {
    var len = toInteger(value);
    return Math.min(Math.max(len, 0), maxSafeInteger);
  }
  function arrayFrom(arrayLike, mapFn) {
    var C2 = Array;
    var items2 = Object(arrayLike);
    if (arrayLike == null) {
      throw new TypeError("Array.from requires an array-like object - not null or undefined");
    }
    var len = toLength(items2.length);
    var A2 = isCallable(C2) ? Object(new C2(len)) : new Array(len);
    var k = 0;
    var kValue;
    while (k < len) {
      kValue = items2[k];
      {
        A2[k] = kValue;
      }
      k += 1;
    }
    A2.length = len;
    return A2;
  }
  function _typeof$2(obj) {
    "@babel/helpers - typeof";
    return _typeof$2 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof$2(obj);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey$1(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    Object.defineProperty(Constructor, "prototype", { writable: false });
    return Constructor;
  }
  function _defineProperty$2(obj, key, value) {
    key = _toPropertyKey$1(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey$1(arg) {
    var key = _toPrimitive$1(arg, "string");
    return _typeof$2(key) === "symbol" ? key : String(key);
  }
  function _toPrimitive$1(input2, hint) {
    if (_typeof$2(input2) !== "object" || input2 === null) return input2;
    var prim = input2[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input2, hint);
      if (_typeof$2(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input2);
  }
  var SetLike = /* @__PURE__ */ function() {
    function SetLike2() {
      var items2 = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
      _classCallCheck(this, SetLike2);
      _defineProperty$2(this, "items", void 0);
      this.items = items2;
    }
    _createClass(SetLike2, [{
      key: "add",
      value: function add(value) {
        if (this.has(value) === false) {
          this.items.push(value);
        }
        return this;
      }
    }, {
      key: "clear",
      value: function clear2() {
        this.items = [];
      }
    }, {
      key: "delete",
      value: function _delete(value) {
        var previousLength = this.items.length;
        this.items = this.items.filter(function(item) {
          return item !== value;
        });
        return previousLength !== this.items.length;
      }
    }, {
      key: "forEach",
      value: function forEach6(callbackfn) {
        var _this = this;
        this.items.forEach(function(item) {
          callbackfn(item, item, _this);
        });
      }
    }, {
      key: "has",
      value: function has7(value) {
        return this.items.indexOf(value) !== -1;
      }
    }, {
      key: "size",
      get: function get6() {
        return this.items.length;
      }
    }]);
    return SetLike2;
  }();
  const SetLike$1 = typeof Set === "undefined" ? Set : SetLike;
  function getLocalName(element) {
    var _element$localName;
    return (
      // eslint-disable-next-line no-restricted-properties -- actual guard for environments without localName
      (_element$localName = element.localName) !== null && _element$localName !== void 0 ? _element$localName : (
        // eslint-disable-next-line no-restricted-properties -- required for the fallback
        element.tagName.toLowerCase()
      )
    );
  }
  var localNameToRoleMappings = {
    article: "article",
    aside: "complementary",
    button: "button",
    datalist: "listbox",
    dd: "definition",
    details: "group",
    dialog: "dialog",
    dt: "term",
    fieldset: "group",
    figure: "figure",
    // WARNING: Only with an accessible name
    form: "form",
    footer: "contentinfo",
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
    header: "banner",
    hr: "separator",
    html: "document",
    legend: "legend",
    li: "listitem",
    math: "math",
    main: "main",
    menu: "list",
    nav: "navigation",
    ol: "list",
    optgroup: "group",
    // WARNING: Only in certain context
    option: "option",
    output: "status",
    progress: "progressbar",
    // WARNING: Only with an accessible name
    section: "region",
    summary: "button",
    table: "table",
    tbody: "rowgroup",
    textarea: "textbox",
    tfoot: "rowgroup",
    // WARNING: Only in certain context
    td: "cell",
    th: "columnheader",
    thead: "rowgroup",
    tr: "row",
    ul: "list"
  };
  var prohibitedAttributes = {
    caption: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    code: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    deletion: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    emphasis: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    generic: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby", "aria-roledescription"]),
    insertion: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    paragraph: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    presentation: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    strong: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    subscript: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"]),
    superscript: /* @__PURE__ */ new Set(["aria-label", "aria-labelledby"])
  };
  function hasGlobalAriaAttributes(element, role) {
    return [
      "aria-atomic",
      "aria-busy",
      "aria-controls",
      "aria-current",
      "aria-describedby",
      "aria-details",
      // "disabled",
      "aria-dropeffect",
      // "errormessage",
      "aria-flowto",
      "aria-grabbed",
      // "haspopup",
      "aria-hidden",
      // "invalid",
      "aria-keyshortcuts",
      "aria-label",
      "aria-labelledby",
      "aria-live",
      "aria-owns",
      "aria-relevant",
      "aria-roledescription"
    ].some(function(attributeName) {
      var _prohibitedAttributes;
      return element.hasAttribute(attributeName) && !((_prohibitedAttributes = prohibitedAttributes[role]) !== null && _prohibitedAttributes !== void 0 && _prohibitedAttributes.has(attributeName));
    });
  }
  function ignorePresentationalRole(element, implicitRole) {
    return hasGlobalAriaAttributes(element, implicitRole);
  }
  function getRole(element) {
    var explicitRole = getExplicitRole(element);
    if (explicitRole === null || explicitRole === "presentation") {
      var implicitRole = getImplicitRole(element);
      if (explicitRole !== "presentation" || ignorePresentationalRole(element, implicitRole || "")) {
        return implicitRole;
      }
    }
    return explicitRole;
  }
  function getImplicitRole(element) {
    var mappedByTag = localNameToRoleMappings[getLocalName(element)];
    if (mappedByTag !== void 0) {
      return mappedByTag;
    }
    switch (getLocalName(element)) {
      case "a":
      case "area":
      case "link":
        if (element.hasAttribute("href")) {
          return "link";
        }
        break;
      case "img":
        if (element.getAttribute("alt") === "" && !ignorePresentationalRole(element, "img")) {
          return "presentation";
        }
        return "img";
      case "input": {
        var _ref = element, type2 = _ref.type;
        switch (type2) {
          case "button":
          case "image":
          case "reset":
          case "submit":
            return "button";
          case "checkbox":
          case "radio":
            return type2;
          case "range":
            return "slider";
          case "email":
          case "tel":
          case "text":
          case "url":
            if (element.hasAttribute("list")) {
              return "combobox";
            }
            return "textbox";
          case "search":
            if (element.hasAttribute("list")) {
              return "combobox";
            }
            return "searchbox";
          case "number":
            return "spinbutton";
          default:
            return null;
        }
      }
      case "select":
        if (element.hasAttribute("multiple") || element.size > 1) {
          return "listbox";
        }
        return "combobox";
    }
    return null;
  }
  function getExplicitRole(element) {
    var role = element.getAttribute("role");
    if (role !== null) {
      var explicitRole = role.trim().split(" ")[0];
      if (explicitRole.length > 0) {
        return explicitRole;
      }
    }
    return null;
  }
  function isElement$1(node) {
    return node !== null && node.nodeType === node.ELEMENT_NODE;
  }
  function isHTMLTableCaptionElement(node) {
    return isElement$1(node) && getLocalName(node) === "caption";
  }
  function isHTMLInputElement(node) {
    return isElement$1(node) && getLocalName(node) === "input";
  }
  function isHTMLOptGroupElement(node) {
    return isElement$1(node) && getLocalName(node) === "optgroup";
  }
  function isHTMLSelectElement(node) {
    return isElement$1(node) && getLocalName(node) === "select";
  }
  function isHTMLTableElement(node) {
    return isElement$1(node) && getLocalName(node) === "table";
  }
  function isHTMLTextAreaElement(node) {
    return isElement$1(node) && getLocalName(node) === "textarea";
  }
  function safeWindow(node) {
    var _ref = node.ownerDocument === null ? node : node.ownerDocument, defaultView = _ref.defaultView;
    if (defaultView === null) {
      throw new TypeError("no window available");
    }
    return defaultView;
  }
  function isHTMLFieldSetElement(node) {
    return isElement$1(node) && getLocalName(node) === "fieldset";
  }
  function isHTMLLegendElement(node) {
    return isElement$1(node) && getLocalName(node) === "legend";
  }
  function isHTMLSlotElement(node) {
    return isElement$1(node) && getLocalName(node) === "slot";
  }
  function isSVGElement(node) {
    return isElement$1(node) && node.ownerSVGElement !== void 0;
  }
  function isSVGSVGElement(node) {
    return isElement$1(node) && getLocalName(node) === "svg";
  }
  function isSVGTitleElement(node) {
    return isSVGElement(node) && getLocalName(node) === "title";
  }
  function queryIdRefs(node, attributeName) {
    if (isElement$1(node) && node.hasAttribute(attributeName)) {
      var ids = node.getAttribute(attributeName).split(" ");
      var root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
      return ids.map(function(id) {
        return root.getElementById(id);
      }).filter(
        function(element) {
          return element !== null;
        }
        // TODO: why does this not narrow?
      );
    }
    return [];
  }
  function hasAnyConcreteRoles(node, roles2) {
    if (isElement$1(node)) {
      return roles2.indexOf(getRole(node)) !== -1;
    }
    return false;
  }
  function asFlatString(s) {
    return s.trim().replace(/\s\s+/g, " ");
  }
  function isHidden(node, getComputedStyleImplementation) {
    if (!isElement$1(node)) {
      return false;
    }
    if (node.hasAttribute("hidden") || node.getAttribute("aria-hidden") === "true") {
      return true;
    }
    var style = getComputedStyleImplementation(node);
    return style.getPropertyValue("display") === "none" || style.getPropertyValue("visibility") === "hidden";
  }
  function isControl(node) {
    return hasAnyConcreteRoles(node, ["button", "combobox", "listbox", "textbox"]) || hasAbstractRole(node, "range");
  }
  function hasAbstractRole(node, role) {
    if (!isElement$1(node)) {
      return false;
    }
    switch (role) {
      case "range":
        return hasAnyConcreteRoles(node, ["meter", "progressbar", "scrollbar", "slider", "spinbutton"]);
      default:
        throw new TypeError("No knowledge about abstract role '".concat(role, "'. This is likely a bug :("));
    }
  }
  function querySelectorAllSubtree(element, selectors) {
    var elements = arrayFrom(element.querySelectorAll(selectors));
    queryIdRefs(element, "aria-owns").forEach(function(root) {
      elements.push.apply(elements, arrayFrom(root.querySelectorAll(selectors)));
    });
    return elements;
  }
  function querySelectedOptions(listbox) {
    if (isHTMLSelectElement(listbox)) {
      return listbox.selectedOptions || querySelectorAllSubtree(listbox, "[selected]");
    }
    return querySelectorAllSubtree(listbox, '[aria-selected="true"]');
  }
  function isMarkedPresentational(node) {
    return hasAnyConcreteRoles(node, ["none", "presentation"]);
  }
  function isNativeHostLanguageTextAlternativeElement(node) {
    return isHTMLTableCaptionElement(node);
  }
  function allowsNameFromContent(node) {
    return hasAnyConcreteRoles(node, ["button", "cell", "checkbox", "columnheader", "gridcell", "heading", "label", "legend", "link", "menuitem", "menuitemcheckbox", "menuitemradio", "option", "radio", "row", "rowheader", "switch", "tab", "tooltip", "treeitem"]);
  }
  function isDescendantOfNativeHostLanguageTextAlternativeElement(node) {
    return false;
  }
  function getValueOfTextbox(element) {
    if (isHTMLInputElement(element) || isHTMLTextAreaElement(element)) {
      return element.value;
    }
    return element.textContent || "";
  }
  function getTextualContent(declaration) {
    var content = declaration.getPropertyValue("content");
    if (/^["'].*["']$/.test(content)) {
      return content.slice(1, -1);
    }
    return "";
  }
  function isLabelableElement(element) {
    var localName = getLocalName(element);
    return localName === "button" || localName === "input" && element.getAttribute("type") !== "hidden" || localName === "meter" || localName === "output" || localName === "progress" || localName === "select" || localName === "textarea";
  }
  function findLabelableElement(element) {
    if (isLabelableElement(element)) {
      return element;
    }
    var labelableElement = null;
    element.childNodes.forEach(function(childNode) {
      if (labelableElement === null && isElement$1(childNode)) {
        var descendantLabelableElement = findLabelableElement(childNode);
        if (descendantLabelableElement !== null) {
          labelableElement = descendantLabelableElement;
        }
      }
    });
    return labelableElement;
  }
  function getControlOfLabel(label) {
    if (label.control !== void 0) {
      return label.control;
    }
    var htmlFor = label.getAttribute("for");
    if (htmlFor !== null) {
      return label.ownerDocument.getElementById(htmlFor);
    }
    return findLabelableElement(label);
  }
  function getLabels$1(element) {
    var labelsProperty = element.labels;
    if (labelsProperty === null) {
      return labelsProperty;
    }
    if (labelsProperty !== void 0) {
      return arrayFrom(labelsProperty);
    }
    if (!isLabelableElement(element)) {
      return null;
    }
    var document2 = element.ownerDocument;
    return arrayFrom(document2.querySelectorAll("label")).filter(function(label) {
      return getControlOfLabel(label) === element;
    });
  }
  function getSlotContents(slot) {
    var assignedNodes = slot.assignedNodes();
    if (assignedNodes.length === 0) {
      return arrayFrom(slot.childNodes);
    }
    return assignedNodes;
  }
  function computeTextAlternative(root) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var consultedNodes = new SetLike$1();
    var window2 = safeWindow(root);
    var _options$compute = options.compute, compute = _options$compute === void 0 ? "name" : _options$compute, _options$computedStyl = options.computedStyleSupportsPseudoElements, computedStyleSupportsPseudoElements = _options$computedStyl === void 0 ? options.getComputedStyle !== void 0 : _options$computedStyl, _options$getComputedS = options.getComputedStyle, getComputedStyle = _options$getComputedS === void 0 ? window2.getComputedStyle.bind(window2) : _options$getComputedS, _options$hidden = options.hidden, hidden = _options$hidden === void 0 ? false : _options$hidden;
    function computeMiscTextAlternative(node, context) {
      var accumulatedText = "";
      if (isElement$1(node) && computedStyleSupportsPseudoElements) {
        var pseudoBefore = getComputedStyle(node, "::before");
        var beforeContent = getTextualContent(pseudoBefore);
        accumulatedText = "".concat(beforeContent, " ").concat(accumulatedText);
      }
      var childNodes = isHTMLSlotElement(node) ? getSlotContents(node) : arrayFrom(node.childNodes).concat(queryIdRefs(node, "aria-owns"));
      childNodes.forEach(function(child) {
        var result = computeTextAlternative2(child, {
          isEmbeddedInLabel: context.isEmbeddedInLabel,
          isReferenced: false,
          recursion: true
        });
        var display = isElement$1(child) ? getComputedStyle(child).getPropertyValue("display") : "inline";
        var separator = display !== "inline" ? " " : "";
        accumulatedText += "".concat(separator).concat(result).concat(separator);
      });
      if (isElement$1(node) && computedStyleSupportsPseudoElements) {
        var pseudoAfter = getComputedStyle(node, "::after");
        var afterContent = getTextualContent(pseudoAfter);
        accumulatedText = "".concat(accumulatedText, " ").concat(afterContent);
      }
      return accumulatedText.trim();
    }
    function useAttribute(element, attributeName) {
      var attribute = element.getAttributeNode(attributeName);
      if (attribute !== null && !consultedNodes.has(attribute) && attribute.value.trim() !== "") {
        consultedNodes.add(attribute);
        return attribute.value;
      }
      return null;
    }
    function computeTooltipAttributeValue(node) {
      if (!isElement$1(node)) {
        return null;
      }
      return useAttribute(node, "title");
    }
    function computeElementTextAlternative(node) {
      if (!isElement$1(node)) {
        return null;
      }
      if (isHTMLFieldSetElement(node)) {
        consultedNodes.add(node);
        var children = arrayFrom(node.childNodes);
        for (var i = 0; i < children.length; i += 1) {
          var child = children[i];
          if (isHTMLLegendElement(child)) {
            return computeTextAlternative2(child, {
              isEmbeddedInLabel: false,
              isReferenced: false,
              recursion: false
            });
          }
        }
      } else if (isHTMLTableElement(node)) {
        consultedNodes.add(node);
        var _children = arrayFrom(node.childNodes);
        for (var _i = 0; _i < _children.length; _i += 1) {
          var _child = _children[_i];
          if (isHTMLTableCaptionElement(_child)) {
            return computeTextAlternative2(_child, {
              isEmbeddedInLabel: false,
              isReferenced: false,
              recursion: false
            });
          }
        }
      } else if (isSVGSVGElement(node)) {
        consultedNodes.add(node);
        var _children2 = arrayFrom(node.childNodes);
        for (var _i2 = 0; _i2 < _children2.length; _i2 += 1) {
          var _child2 = _children2[_i2];
          if (isSVGTitleElement(_child2)) {
            return _child2.textContent;
          }
        }
        return null;
      } else if (getLocalName(node) === "img" || getLocalName(node) === "area") {
        var nameFromAlt = useAttribute(node, "alt");
        if (nameFromAlt !== null) {
          return nameFromAlt;
        }
      } else if (isHTMLOptGroupElement(node)) {
        var nameFromLabel = useAttribute(node, "label");
        if (nameFromLabel !== null) {
          return nameFromLabel;
        }
      }
      if (isHTMLInputElement(node) && (node.type === "button" || node.type === "submit" || node.type === "reset")) {
        var nameFromValue = useAttribute(node, "value");
        if (nameFromValue !== null) {
          return nameFromValue;
        }
        if (node.type === "submit") {
          return "Submit";
        }
        if (node.type === "reset") {
          return "Reset";
        }
      }
      var labels = getLabels$1(node);
      if (labels !== null && labels.length !== 0) {
        consultedNodes.add(node);
        return arrayFrom(labels).map(function(element) {
          return computeTextAlternative2(element, {
            isEmbeddedInLabel: true,
            isReferenced: false,
            recursion: true
          });
        }).filter(function(label) {
          return label.length > 0;
        }).join(" ");
      }
      if (isHTMLInputElement(node) && node.type === "image") {
        var _nameFromAlt = useAttribute(node, "alt");
        if (_nameFromAlt !== null) {
          return _nameFromAlt;
        }
        var nameFromTitle = useAttribute(node, "title");
        if (nameFromTitle !== null) {
          return nameFromTitle;
        }
        return "Submit Query";
      }
      if (hasAnyConcreteRoles(node, ["button"])) {
        var nameFromSubTree = computeMiscTextAlternative(node, {
          isEmbeddedInLabel: false
        });
        if (nameFromSubTree !== "") {
          return nameFromSubTree;
        }
      }
      return null;
    }
    function computeTextAlternative2(current, context) {
      if (consultedNodes.has(current)) {
        return "";
      }
      if (!hidden && isHidden(current, getComputedStyle) && !context.isReferenced) {
        consultedNodes.add(current);
        return "";
      }
      var labelAttributeNode = isElement$1(current) ? current.getAttributeNode("aria-labelledby") : null;
      var labelElements = labelAttributeNode !== null && !consultedNodes.has(labelAttributeNode) ? queryIdRefs(current, "aria-labelledby") : [];
      if (compute === "name" && !context.isReferenced && labelElements.length > 0) {
        consultedNodes.add(labelAttributeNode);
        return labelElements.map(function(element) {
          return computeTextAlternative2(element, {
            isEmbeddedInLabel: context.isEmbeddedInLabel,
            isReferenced: true,
            // this isn't recursion as specified, otherwise we would skip
            // `aria-label` in
            // <input id="myself" aria-label="foo" aria-labelledby="myself"
            recursion: false
          });
        }).join(" ");
      }
      var skipToStep2E = context.recursion && isControl(current) && compute === "name";
      if (!skipToStep2E) {
        var ariaLabel = (isElement$1(current) && current.getAttribute("aria-label") || "").trim();
        if (ariaLabel !== "" && compute === "name") {
          consultedNodes.add(current);
          return ariaLabel;
        }
        if (!isMarkedPresentational(current)) {
          var elementTextAlternative = computeElementTextAlternative(current);
          if (elementTextAlternative !== null) {
            consultedNodes.add(current);
            return elementTextAlternative;
          }
        }
      }
      if (hasAnyConcreteRoles(current, ["menu"])) {
        consultedNodes.add(current);
        return "";
      }
      if (skipToStep2E || context.isEmbeddedInLabel || context.isReferenced) {
        if (hasAnyConcreteRoles(current, ["combobox", "listbox"])) {
          consultedNodes.add(current);
          var selectedOptions = querySelectedOptions(current);
          if (selectedOptions.length === 0) {
            return isHTMLInputElement(current) ? current.value : "";
          }
          return arrayFrom(selectedOptions).map(function(selectedOption) {
            return computeTextAlternative2(selectedOption, {
              isEmbeddedInLabel: context.isEmbeddedInLabel,
              isReferenced: false,
              recursion: true
            });
          }).join(" ");
        }
        if (hasAbstractRole(current, "range")) {
          consultedNodes.add(current);
          if (current.hasAttribute("aria-valuetext")) {
            return current.getAttribute("aria-valuetext");
          }
          if (current.hasAttribute("aria-valuenow")) {
            return current.getAttribute("aria-valuenow");
          }
          return current.getAttribute("value") || "";
        }
        if (hasAnyConcreteRoles(current, ["textbox"])) {
          consultedNodes.add(current);
          return getValueOfTextbox(current);
        }
      }
      if (allowsNameFromContent(current) || isElement$1(current) && context.isReferenced || isNativeHostLanguageTextAlternativeElement(current) || isDescendantOfNativeHostLanguageTextAlternativeElement()) {
        var accumulatedText2F = computeMiscTextAlternative(current, {
          isEmbeddedInLabel: context.isEmbeddedInLabel
        });
        if (accumulatedText2F !== "") {
          consultedNodes.add(current);
          return accumulatedText2F;
        }
      }
      if (current.nodeType === current.TEXT_NODE) {
        consultedNodes.add(current);
        return current.textContent || "";
      }
      if (context.recursion) {
        consultedNodes.add(current);
        return computeMiscTextAlternative(current, {
          isEmbeddedInLabel: context.isEmbeddedInLabel
        });
      }
      var tooltipAttributeValue = computeTooltipAttributeValue(current);
      if (tooltipAttributeValue !== null) {
        consultedNodes.add(current);
        return tooltipAttributeValue;
      }
      consultedNodes.add(current);
      return "";
    }
    return asFlatString(computeTextAlternative2(root, {
      isEmbeddedInLabel: false,
      // by spec computeAccessibleDescription starts with the referenced elements as roots
      isReferenced: compute === "description",
      recursion: false
    }));
  }
  function _typeof$1(obj) {
    "@babel/helpers - typeof";
    return _typeof$1 = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof$1(obj);
  }
  function ownKeys(object, enumerableOnly) {
    var keys7 = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys7.push.apply(keys7, symbols);
    }
    return keys7;
  }
  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty$1(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty$1(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return _typeof$1(key) === "symbol" ? key : String(key);
  }
  function _toPrimitive(input2, hint) {
    if (_typeof$1(input2) !== "object" || input2 === null) return input2;
    var prim = input2[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input2, hint);
      if (_typeof$1(res) !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input2);
  }
  function computeAccessibleDescription(root) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var description2 = queryIdRefs(root, "aria-describedby").map(function(element) {
      return computeTextAlternative(element, _objectSpread(_objectSpread({}, options), {}, {
        compute: "description"
      }));
    }).join(" ");
    if (description2 === "") {
      var title2 = root.getAttribute("title");
      description2 = title2 === null ? "" : title2;
    }
    return description2;
  }
  function prohibitsNaming(node) {
    return hasAnyConcreteRoles(node, ["caption", "code", "deletion", "emphasis", "generic", "insertion", "paragraph", "presentation", "strong", "subscript", "superscript"]);
  }
  function computeAccessibleName(root) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    if (prohibitsNaming(root)) {
      return "";
    }
    return computeTextAlternative(root, options);
  }
  var lib = {};
  var ariaPropsMap$1 = {};
  var iterationDecorator$1 = {};
  var iteratorProxy$1 = {};
  Object.defineProperty(iteratorProxy$1, "__esModule", {
    value: true
  });
  iteratorProxy$1.default = void 0;
  function iteratorProxy() {
    var values6 = this;
    var index = 0;
    var iter = {
      "@@iterator": function iterator() {
        return iter;
      },
      next: function next() {
        if (index < values6.length) {
          var value = values6[index];
          index = index + 1;
          return {
            done: false,
            value
          };
        } else {
          return {
            done: true
          };
        }
      }
    };
    return iter;
  }
  var _default$2i = iteratorProxy;
  iteratorProxy$1.default = _default$2i;
  Object.defineProperty(iterationDecorator$1, "__esModule", {
    value: true
  });
  iterationDecorator$1.default = iterationDecorator;
  var _iteratorProxy = _interopRequireDefault$a(iteratorProxy$1);
  function _interopRequireDefault$a(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _typeof(obj) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof(obj);
  }
  function iterationDecorator(collection, entries6) {
    if (typeof Symbol === "function" && _typeof(Symbol.iterator) === "symbol") {
      Object.defineProperty(collection, Symbol.iterator, {
        value: _iteratorProxy.default.bind(entries6)
      });
    }
    return collection;
  }
  Object.defineProperty(ariaPropsMap$1, "__esModule", {
    value: true
  });
  ariaPropsMap$1.default = void 0;
  var _iterationDecorator$4 = _interopRequireDefault$9(iterationDecorator$1);
  function _interopRequireDefault$9(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _slicedToArray$4(arr, i) {
    return _arrayWithHoles$4(arr) || _iterableToArrayLimit$4(arr, i) || _unsupportedIterableToArray$4(arr, i) || _nonIterableRest$4();
  }
  function _nonIterableRest$4() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit$4(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles$4(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _createForOfIteratorHelper$4(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray$4(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        var F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        }, e: function e2(_e2) {
          throw _e2;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return { s: function s() {
      it = it.call(o);
    }, n: function n2() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    }, e: function e2(_e3) {
      didErr = true;
      err = _e3;
    }, f: function f2() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
  }
  function _unsupportedIterableToArray$4(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$4(o, minLen);
    var n2 = Object.prototype.toString.call(o).slice(8, -1);
    if (n2 === "Object" && o.constructor) n2 = o.constructor.name;
    if (n2 === "Map" || n2 === "Set") return Array.from(o);
    if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$4(o, minLen);
  }
  function _arrayLikeToArray$4(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var properties = [["aria-activedescendant", {
    "type": "id"
  }], ["aria-atomic", {
    "type": "boolean"
  }], ["aria-autocomplete", {
    "type": "token",
    "values": ["inline", "list", "both", "none"]
  }], ["aria-braillelabel", {
    "type": "string"
  }], ["aria-brailleroledescription", {
    "type": "string"
  }], ["aria-busy", {
    "type": "boolean"
  }], ["aria-checked", {
    "type": "tristate"
  }], ["aria-colcount", {
    type: "integer"
  }], ["aria-colindex", {
    type: "integer"
  }], ["aria-colspan", {
    type: "integer"
  }], ["aria-controls", {
    "type": "idlist"
  }], ["aria-current", {
    type: "token",
    values: ["page", "step", "location", "date", "time", true, false]
  }], ["aria-describedby", {
    "type": "idlist"
  }], ["aria-description", {
    "type": "string"
  }], ["aria-details", {
    "type": "id"
  }], ["aria-disabled", {
    "type": "boolean"
  }], ["aria-dropeffect", {
    "type": "tokenlist",
    "values": ["copy", "execute", "link", "move", "none", "popup"]
  }], ["aria-errormessage", {
    "type": "id"
  }], ["aria-expanded", {
    "type": "boolean",
    "allowundefined": true
  }], ["aria-flowto", {
    "type": "idlist"
  }], ["aria-grabbed", {
    "type": "boolean",
    "allowundefined": true
  }], ["aria-haspopup", {
    "type": "token",
    "values": [false, true, "menu", "listbox", "tree", "grid", "dialog"]
  }], ["aria-hidden", {
    "type": "boolean",
    "allowundefined": true
  }], ["aria-invalid", {
    "type": "token",
    "values": ["grammar", false, "spelling", true]
  }], ["aria-keyshortcuts", {
    type: "string"
  }], ["aria-label", {
    "type": "string"
  }], ["aria-labelledby", {
    "type": "idlist"
  }], ["aria-level", {
    "type": "integer"
  }], ["aria-live", {
    "type": "token",
    "values": ["assertive", "off", "polite"]
  }], ["aria-modal", {
    type: "boolean"
  }], ["aria-multiline", {
    "type": "boolean"
  }], ["aria-multiselectable", {
    "type": "boolean"
  }], ["aria-orientation", {
    "type": "token",
    "values": ["vertical", "undefined", "horizontal"]
  }], ["aria-owns", {
    "type": "idlist"
  }], ["aria-placeholder", {
    type: "string"
  }], ["aria-posinset", {
    "type": "integer"
  }], ["aria-pressed", {
    "type": "tristate"
  }], ["aria-readonly", {
    "type": "boolean"
  }], ["aria-relevant", {
    "type": "tokenlist",
    "values": ["additions", "all", "removals", "text"]
  }], ["aria-required", {
    "type": "boolean"
  }], ["aria-roledescription", {
    type: "string"
  }], ["aria-rowcount", {
    type: "integer"
  }], ["aria-rowindex", {
    type: "integer"
  }], ["aria-rowspan", {
    type: "integer"
  }], ["aria-selected", {
    "type": "boolean",
    "allowundefined": true
  }], ["aria-setsize", {
    "type": "integer"
  }], ["aria-sort", {
    "type": "token",
    "values": ["ascending", "descending", "none", "other"]
  }], ["aria-valuemax", {
    "type": "number"
  }], ["aria-valuemin", {
    "type": "number"
  }], ["aria-valuenow", {
    "type": "number"
  }], ["aria-valuetext", {
    "type": "string"
  }]];
  var ariaPropsMap = {
    entries: function entries() {
      return properties;
    },
    forEach: function forEach(fn) {
      var thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var _iterator = _createForOfIteratorHelper$4(properties), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var _step$value = _slicedToArray$4(_step.value, 2), key = _step$value[0], values6 = _step$value[1];
          fn.call(thisArg, values6, key, properties);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    get: function get(key) {
      var item = properties.find(function(tuple) {
        return tuple[0] === key ? true : false;
      });
      return item && item[1];
    },
    has: function has(key) {
      return !!ariaPropsMap.get(key);
    },
    keys: function keys() {
      return properties.map(function(_ref) {
        var _ref2 = _slicedToArray$4(_ref, 1), key = _ref2[0];
        return key;
      });
    },
    values: function values() {
      return properties.map(function(_ref3) {
        var _ref4 = _slicedToArray$4(_ref3, 2), values6 = _ref4[1];
        return values6;
      });
    }
  };
  var _default$2h = (0, _iterationDecorator$4.default)(ariaPropsMap, ariaPropsMap.entries());
  ariaPropsMap$1.default = _default$2h;
  var domMap$1 = {};
  Object.defineProperty(domMap$1, "__esModule", {
    value: true
  });
  domMap$1.default = void 0;
  var _iterationDecorator$3 = _interopRequireDefault$8(iterationDecorator$1);
  function _interopRequireDefault$8(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _slicedToArray$3(arr, i) {
    return _arrayWithHoles$3(arr) || _iterableToArrayLimit$3(arr, i) || _unsupportedIterableToArray$3(arr, i) || _nonIterableRest$3();
  }
  function _nonIterableRest$3() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit$3(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles$3(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _createForOfIteratorHelper$3(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray$3(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        var F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        }, e: function e2(_e2) {
          throw _e2;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return { s: function s() {
      it = it.call(o);
    }, n: function n2() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    }, e: function e2(_e3) {
      didErr = true;
      err = _e3;
    }, f: function f2() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
  }
  function _unsupportedIterableToArray$3(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$3(o, minLen);
    var n2 = Object.prototype.toString.call(o).slice(8, -1);
    if (n2 === "Object" && o.constructor) n2 = o.constructor.name;
    if (n2 === "Map" || n2 === "Set") return Array.from(o);
    if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$3(o, minLen);
  }
  function _arrayLikeToArray$3(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var dom$1 = [["a", {
    reserved: false
  }], ["abbr", {
    reserved: false
  }], ["acronym", {
    reserved: false
  }], ["address", {
    reserved: false
  }], ["applet", {
    reserved: false
  }], ["area", {
    reserved: false
  }], ["article", {
    reserved: false
  }], ["aside", {
    reserved: false
  }], ["audio", {
    reserved: false
  }], ["b", {
    reserved: false
  }], ["base", {
    reserved: true
  }], ["bdi", {
    reserved: false
  }], ["bdo", {
    reserved: false
  }], ["big", {
    reserved: false
  }], ["blink", {
    reserved: false
  }], ["blockquote", {
    reserved: false
  }], ["body", {
    reserved: false
  }], ["br", {
    reserved: false
  }], ["button", {
    reserved: false
  }], ["canvas", {
    reserved: false
  }], ["caption", {
    reserved: false
  }], ["center", {
    reserved: false
  }], ["cite", {
    reserved: false
  }], ["code", {
    reserved: false
  }], ["col", {
    reserved: true
  }], ["colgroup", {
    reserved: true
  }], ["content", {
    reserved: false
  }], ["data", {
    reserved: false
  }], ["datalist", {
    reserved: false
  }], ["dd", {
    reserved: false
  }], ["del", {
    reserved: false
  }], ["details", {
    reserved: false
  }], ["dfn", {
    reserved: false
  }], ["dialog", {
    reserved: false
  }], ["dir", {
    reserved: false
  }], ["div", {
    reserved: false
  }], ["dl", {
    reserved: false
  }], ["dt", {
    reserved: false
  }], ["em", {
    reserved: false
  }], ["embed", {
    reserved: false
  }], ["fieldset", {
    reserved: false
  }], ["figcaption", {
    reserved: false
  }], ["figure", {
    reserved: false
  }], ["font", {
    reserved: false
  }], ["footer", {
    reserved: false
  }], ["form", {
    reserved: false
  }], ["frame", {
    reserved: false
  }], ["frameset", {
    reserved: false
  }], ["h1", {
    reserved: false
  }], ["h2", {
    reserved: false
  }], ["h3", {
    reserved: false
  }], ["h4", {
    reserved: false
  }], ["h5", {
    reserved: false
  }], ["h6", {
    reserved: false
  }], ["head", {
    reserved: true
  }], ["header", {
    reserved: false
  }], ["hgroup", {
    reserved: false
  }], ["hr", {
    reserved: false
  }], ["html", {
    reserved: true
  }], ["i", {
    reserved: false
  }], ["iframe", {
    reserved: false
  }], ["img", {
    reserved: false
  }], ["input", {
    reserved: false
  }], ["ins", {
    reserved: false
  }], ["kbd", {
    reserved: false
  }], ["keygen", {
    reserved: false
  }], ["label", {
    reserved: false
  }], ["legend", {
    reserved: false
  }], ["li", {
    reserved: false
  }], ["link", {
    reserved: true
  }], ["main", {
    reserved: false
  }], ["map", {
    reserved: false
  }], ["mark", {
    reserved: false
  }], ["marquee", {
    reserved: false
  }], ["menu", {
    reserved: false
  }], ["menuitem", {
    reserved: false
  }], ["meta", {
    reserved: true
  }], ["meter", {
    reserved: false
  }], ["nav", {
    reserved: false
  }], ["noembed", {
    reserved: true
  }], ["noscript", {
    reserved: true
  }], ["object", {
    reserved: false
  }], ["ol", {
    reserved: false
  }], ["optgroup", {
    reserved: false
  }], ["option", {
    reserved: false
  }], ["output", {
    reserved: false
  }], ["p", {
    reserved: false
  }], ["param", {
    reserved: true
  }], ["picture", {
    reserved: true
  }], ["pre", {
    reserved: false
  }], ["progress", {
    reserved: false
  }], ["q", {
    reserved: false
  }], ["rp", {
    reserved: false
  }], ["rt", {
    reserved: false
  }], ["rtc", {
    reserved: false
  }], ["ruby", {
    reserved: false
  }], ["s", {
    reserved: false
  }], ["samp", {
    reserved: false
  }], ["script", {
    reserved: true
  }], ["section", {
    reserved: false
  }], ["select", {
    reserved: false
  }], ["small", {
    reserved: false
  }], ["source", {
    reserved: true
  }], ["spacer", {
    reserved: false
  }], ["span", {
    reserved: false
  }], ["strike", {
    reserved: false
  }], ["strong", {
    reserved: false
  }], ["style", {
    reserved: true
  }], ["sub", {
    reserved: false
  }], ["summary", {
    reserved: false
  }], ["sup", {
    reserved: false
  }], ["table", {
    reserved: false
  }], ["tbody", {
    reserved: false
  }], ["td", {
    reserved: false
  }], ["textarea", {
    reserved: false
  }], ["tfoot", {
    reserved: false
  }], ["th", {
    reserved: false
  }], ["thead", {
    reserved: false
  }], ["time", {
    reserved: false
  }], ["title", {
    reserved: true
  }], ["tr", {
    reserved: false
  }], ["track", {
    reserved: true
  }], ["tt", {
    reserved: false
  }], ["u", {
    reserved: false
  }], ["ul", {
    reserved: false
  }], ["var", {
    reserved: false
  }], ["video", {
    reserved: false
  }], ["wbr", {
    reserved: false
  }], ["xmp", {
    reserved: false
  }]];
  var domMap = {
    entries: function entries2() {
      return dom$1;
    },
    forEach: function forEach2(fn) {
      var thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var _iterator = _createForOfIteratorHelper$3(dom$1), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var _step$value = _slicedToArray$3(_step.value, 2), key = _step$value[0], values6 = _step$value[1];
          fn.call(thisArg, values6, key, dom$1);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    get: function get2(key) {
      var item = dom$1.find(function(tuple) {
        return tuple[0] === key ? true : false;
      });
      return item && item[1];
    },
    has: function has2(key) {
      return !!domMap.get(key);
    },
    keys: function keys2() {
      return dom$1.map(function(_ref) {
        var _ref2 = _slicedToArray$3(_ref, 1), key = _ref2[0];
        return key;
      });
    },
    values: function values2() {
      return dom$1.map(function(_ref3) {
        var _ref4 = _slicedToArray$3(_ref3, 2), values6 = _ref4[1];
        return values6;
      });
    }
  };
  var _default$2g = (0, _iterationDecorator$3.default)(domMap, domMap.entries());
  domMap$1.default = _default$2g;
  var rolesMap$1 = {};
  var ariaAbstractRoles$1 = {};
  var commandRole$1 = {};
  Object.defineProperty(commandRole$1, "__esModule", {
    value: true
  });
  commandRole$1.default = void 0;
  var commandRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget"]]
  };
  var _default$2f = commandRole;
  commandRole$1.default = _default$2f;
  var compositeRole$1 = {};
  Object.defineProperty(compositeRole$1, "__esModule", {
    value: true
  });
  compositeRole$1.default = void 0;
  var compositeRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-activedescendant": null,
      "aria-disabled": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget"]]
  };
  var _default$2e = compositeRole;
  compositeRole$1.default = _default$2e;
  var inputRole$1 = {};
  Object.defineProperty(inputRole$1, "__esModule", {
    value: true
  });
  inputRole$1.default = void 0;
  var inputRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null
    },
    relatedConcepts: [{
      concept: {
        name: "input"
      },
      module: "XForms"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget"]]
  };
  var _default$2d = inputRole;
  inputRole$1.default = _default$2d;
  var landmarkRole$1 = {};
  Object.defineProperty(landmarkRole$1, "__esModule", {
    value: true
  });
  landmarkRole$1.default = void 0;
  var landmarkRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$2c = landmarkRole;
  landmarkRole$1.default = _default$2c;
  var rangeRole$1 = {};
  Object.defineProperty(rangeRole$1, "__esModule", {
    value: true
  });
  rangeRole$1.default = void 0;
  var rangeRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-valuemax": null,
      "aria-valuemin": null,
      "aria-valuenow": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$2b = rangeRole;
  rangeRole$1.default = _default$2b;
  var roletypeRole$1 = {};
  Object.defineProperty(roletypeRole$1, "__esModule", {
    value: true
  });
  roletypeRole$1.default = void 0;
  var roletypeRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: [],
    prohibitedProps: [],
    props: {
      "aria-atomic": null,
      "aria-busy": null,
      "aria-controls": null,
      "aria-current": null,
      "aria-describedby": null,
      "aria-details": null,
      "aria-dropeffect": null,
      "aria-flowto": null,
      "aria-grabbed": null,
      "aria-hidden": null,
      "aria-keyshortcuts": null,
      "aria-label": null,
      "aria-labelledby": null,
      "aria-live": null,
      "aria-owns": null,
      "aria-relevant": null,
      "aria-roledescription": null
    },
    relatedConcepts: [{
      concept: {
        name: "role"
      },
      module: "XHTML"
    }, {
      concept: {
        name: "type"
      },
      module: "Dublin Core"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: []
  };
  var _default$2a = roletypeRole;
  roletypeRole$1.default = _default$2a;
  var sectionRole$1 = {};
  Object.defineProperty(sectionRole$1, "__esModule", {
    value: true
  });
  sectionRole$1.default = void 0;
  var sectionRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: [],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "frontmatter"
      },
      module: "DTB"
    }, {
      concept: {
        name: "level"
      },
      module: "DTB"
    }, {
      concept: {
        name: "level"
      },
      module: "SMIL"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$29 = sectionRole;
  sectionRole$1.default = _default$29;
  var sectionheadRole$1 = {};
  Object.defineProperty(sectionheadRole$1, "__esModule", {
    value: true
  });
  sectionheadRole$1.default = void 0;
  var sectionheadRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$28 = sectionheadRole;
  sectionheadRole$1.default = _default$28;
  var selectRole$1 = {};
  Object.defineProperty(selectRole$1, "__esModule", {
    value: true
  });
  selectRole$1.default = void 0;
  var selectRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-orientation": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite"], ["roletype", "structure", "section", "group"]]
  };
  var _default$27 = selectRole;
  selectRole$1.default = _default$27;
  var structureRole$1 = {};
  Object.defineProperty(structureRole$1, "__esModule", {
    value: true
  });
  structureRole$1.default = void 0;
  var structureRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: [],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype"]]
  };
  var _default$26 = structureRole;
  structureRole$1.default = _default$26;
  var widgetRole$1 = {};
  Object.defineProperty(widgetRole$1, "__esModule", {
    value: true
  });
  widgetRole$1.default = void 0;
  var widgetRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: [],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype"]]
  };
  var _default$25 = widgetRole;
  widgetRole$1.default = _default$25;
  var windowRole$1 = {};
  Object.defineProperty(windowRole$1, "__esModule", {
    value: true
  });
  windowRole$1.default = void 0;
  var windowRole = {
    abstract: true,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-modal": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype"]]
  };
  var _default$24 = windowRole;
  windowRole$1.default = _default$24;
  Object.defineProperty(ariaAbstractRoles$1, "__esModule", {
    value: true
  });
  ariaAbstractRoles$1.default = void 0;
  var _commandRole = _interopRequireDefault$7(commandRole$1);
  var _compositeRole = _interopRequireDefault$7(compositeRole$1);
  var _inputRole = _interopRequireDefault$7(inputRole$1);
  var _landmarkRole = _interopRequireDefault$7(landmarkRole$1);
  var _rangeRole = _interopRequireDefault$7(rangeRole$1);
  var _roletypeRole = _interopRequireDefault$7(roletypeRole$1);
  var _sectionRole = _interopRequireDefault$7(sectionRole$1);
  var _sectionheadRole = _interopRequireDefault$7(sectionheadRole$1);
  var _selectRole = _interopRequireDefault$7(selectRole$1);
  var _structureRole = _interopRequireDefault$7(structureRole$1);
  var _widgetRole = _interopRequireDefault$7(widgetRole$1);
  var _windowRole = _interopRequireDefault$7(windowRole$1);
  function _interopRequireDefault$7(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var ariaAbstractRoles = [["command", _commandRole.default], ["composite", _compositeRole.default], ["input", _inputRole.default], ["landmark", _landmarkRole.default], ["range", _rangeRole.default], ["roletype", _roletypeRole.default], ["section", _sectionRole.default], ["sectionhead", _sectionheadRole.default], ["select", _selectRole.default], ["structure", _structureRole.default], ["widget", _widgetRole.default], ["window", _windowRole.default]];
  var _default$23 = ariaAbstractRoles;
  ariaAbstractRoles$1.default = _default$23;
  var ariaLiteralRoles$1 = {};
  var alertRole$1 = {};
  Object.defineProperty(alertRole$1, "__esModule", {
    value: true
  });
  alertRole$1.default = void 0;
  var alertRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-atomic": "true",
      "aria-live": "assertive"
    },
    relatedConcepts: [{
      concept: {
        name: "alert"
      },
      module: "XForms"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$22 = alertRole;
  alertRole$1.default = _default$22;
  var alertdialogRole$1 = {};
  Object.defineProperty(alertdialogRole$1, "__esModule", {
    value: true
  });
  alertdialogRole$1.default = void 0;
  var alertdialogRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "alert"
      },
      module: "XForms"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "alert"], ["roletype", "window", "dialog"]]
  };
  var _default$21 = alertdialogRole;
  alertdialogRole$1.default = _default$21;
  var applicationRole$1 = {};
  Object.defineProperty(applicationRole$1, "__esModule", {
    value: true
  });
  applicationRole$1.default = void 0;
  var applicationRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-activedescendant": null,
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "Device Independence Delivery Unit"
      }
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$20 = applicationRole;
  applicationRole$1.default = _default$20;
  var articleRole$1 = {};
  Object.defineProperty(articleRole$1, "__esModule", {
    value: true
  });
  articleRole$1.default = void 0;
  var articleRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-posinset": null,
      "aria-setsize": null
    },
    relatedConcepts: [{
      concept: {
        name: "article"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "document"]]
  };
  var _default$1$ = articleRole;
  articleRole$1.default = _default$1$;
  var bannerRole$1 = {};
  Object.defineProperty(bannerRole$1, "__esModule", {
    value: true
  });
  bannerRole$1.default = void 0;
  var bannerRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        constraints: ["scoped to the body element"],
        name: "header"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1_ = bannerRole;
  bannerRole$1.default = _default$1_;
  var blockquoteRole$1 = {};
  Object.defineProperty(blockquoteRole$1, "__esModule", {
    value: true
  });
  blockquoteRole$1.default = void 0;
  var blockquoteRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "blockquote"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1Z = blockquoteRole;
  blockquoteRole$1.default = _default$1Z;
  var buttonRole$1 = {};
  Object.defineProperty(buttonRole$1, "__esModule", {
    value: true
  });
  buttonRole$1.default = void 0;
  var buttonRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-pressed": null
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "type",
          value: "button"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "type",
          value: "image"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "type",
          value: "reset"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "type",
          value: "submit"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        name: "button"
      },
      module: "HTML"
    }, {
      concept: {
        name: "trigger"
      },
      module: "XForms"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command"]]
  };
  var _default$1Y = buttonRole;
  buttonRole$1.default = _default$1Y;
  var captionRole$1 = {};
  Object.defineProperty(captionRole$1, "__esModule", {
    value: true
  });
  captionRole$1.default = void 0;
  var captionRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "caption"
      },
      module: "HTML"
    }],
    requireContextRole: ["figure", "grid", "table"],
    requiredContextRole: ["figure", "grid", "table"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1X = captionRole;
  captionRole$1.default = _default$1X;
  var cellRole$1 = {};
  Object.defineProperty(cellRole$1, "__esModule", {
    value: true
  });
  cellRole$1.default = void 0;
  var cellRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-colindex": null,
      "aria-colspan": null,
      "aria-rowindex": null,
      "aria-rowspan": null
    },
    relatedConcepts: [{
      concept: {
        constraints: ["ancestor table element has table role"],
        name: "td"
      },
      module: "HTML"
    }],
    requireContextRole: ["row"],
    requiredContextRole: ["row"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1W = cellRole;
  cellRole$1.default = _default$1W;
  var checkboxRole$1 = {};
  Object.defineProperty(checkboxRole$1, "__esModule", {
    value: true
  });
  checkboxRole$1.default = void 0;
  var checkboxRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-checked": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-invalid": null,
      "aria-readonly": null,
      "aria-required": null
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "type",
          value: "checkbox"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        name: "option"
      },
      module: "ARIA"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-checked": null
    },
    superClass: [["roletype", "widget", "input"]]
  };
  var _default$1V = checkboxRole;
  checkboxRole$1.default = _default$1V;
  var codeRole$1 = {};
  Object.defineProperty(codeRole$1, "__esModule", {
    value: true
  });
  codeRole$1.default = void 0;
  var codeRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "code"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1U = codeRole;
  codeRole$1.default = _default$1U;
  var columnheaderRole$1 = {};
  Object.defineProperty(columnheaderRole$1, "__esModule", {
    value: true
  });
  columnheaderRole$1.default = void 0;
  var columnheaderRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-sort": null
    },
    relatedConcepts: [{
      concept: {
        name: "th"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "scope",
          value: "col"
        }],
        name: "th"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "scope",
          value: "colgroup"
        }],
        name: "th"
      },
      module: "HTML"
    }],
    requireContextRole: ["row"],
    requiredContextRole: ["row"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "cell"], ["roletype", "structure", "section", "cell", "gridcell"], ["roletype", "widget", "gridcell"], ["roletype", "structure", "sectionhead"]]
  };
  var _default$1T = columnheaderRole;
  columnheaderRole$1.default = _default$1T;
  var comboboxRole$1 = {};
  Object.defineProperty(comboboxRole$1, "__esModule", {
    value: true
  });
  comboboxRole$1.default = void 0;
  var comboboxRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-activedescendant": null,
      "aria-autocomplete": null,
      "aria-errormessage": null,
      "aria-invalid": null,
      "aria-readonly": null,
      "aria-required": null,
      "aria-expanded": "false",
      "aria-haspopup": "listbox"
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "list"
        }, {
          name: "type",
          value: "email"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "list"
        }, {
          name: "type",
          value: "search"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "list"
        }, {
          name: "type",
          value: "tel"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "list"
        }, {
          name: "type",
          value: "text"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "list"
        }, {
          name: "type",
          value: "url"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "list"
        }, {
          name: "type",
          value: "url"
        }],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "multiple"
        }, {
          constraints: ["undefined"],
          name: "size"
        }],
        constraints: ["the multiple attribute is not set and the size attribute does not have a value greater than 1"],
        name: "select"
      },
      module: "HTML"
    }, {
      concept: {
        name: "select"
      },
      module: "XForms"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-controls": null,
      "aria-expanded": "false"
    },
    superClass: [["roletype", "widget", "input"]]
  };
  var _default$1S = comboboxRole;
  comboboxRole$1.default = _default$1S;
  var complementaryRole$1 = {};
  Object.defineProperty(complementaryRole$1, "__esModule", {
    value: true
  });
  complementaryRole$1.default = void 0;
  var complementaryRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "aside"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "aria-label"
        }],
        constraints: ["scoped to a sectioning content element", "scoped to a sectioning root element other than body"],
        name: "aside"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "aria-labelledby"
        }],
        constraints: ["scoped to a sectioning content element", "scoped to a sectioning root element other than body"],
        name: "aside"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1R = complementaryRole;
  complementaryRole$1.default = _default$1R;
  var contentinfoRole$1 = {};
  Object.defineProperty(contentinfoRole$1, "__esModule", {
    value: true
  });
  contentinfoRole$1.default = void 0;
  var contentinfoRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        constraints: ["scoped to the body element"],
        name: "footer"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1Q = contentinfoRole;
  contentinfoRole$1.default = _default$1Q;
  var definitionRole$1 = {};
  Object.defineProperty(definitionRole$1, "__esModule", {
    value: true
  });
  definitionRole$1.default = void 0;
  var definitionRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "dd"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1P = definitionRole;
  definitionRole$1.default = _default$1P;
  var deletionRole$1 = {};
  Object.defineProperty(deletionRole$1, "__esModule", {
    value: true
  });
  deletionRole$1.default = void 0;
  var deletionRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "del"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1O = deletionRole;
  deletionRole$1.default = _default$1O;
  var dialogRole$1 = {};
  Object.defineProperty(dialogRole$1, "__esModule", {
    value: true
  });
  dialogRole$1.default = void 0;
  var dialogRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "dialog"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "window"]]
  };
  var _default$1N = dialogRole;
  dialogRole$1.default = _default$1N;
  var directoryRole$1 = {};
  Object.defineProperty(directoryRole$1, "__esModule", {
    value: true
  });
  directoryRole$1.default = void 0;
  var directoryRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      module: "DAISY Guide"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "list"]]
  };
  var _default$1M = directoryRole;
  directoryRole$1.default = _default$1M;
  var documentRole$1 = {};
  Object.defineProperty(documentRole$1, "__esModule", {
    value: true
  });
  documentRole$1.default = void 0;
  var documentRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "Device Independence Delivery Unit"
      }
    }, {
      concept: {
        name: "html"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$1L = documentRole;
  documentRole$1.default = _default$1L;
  var emphasisRole$1 = {};
  Object.defineProperty(emphasisRole$1, "__esModule", {
    value: true
  });
  emphasisRole$1.default = void 0;
  var emphasisRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "em"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1K = emphasisRole;
  emphasisRole$1.default = _default$1K;
  var feedRole$1 = {};
  Object.defineProperty(feedRole$1, "__esModule", {
    value: true
  });
  feedRole$1.default = void 0;
  var feedRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["article"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "list"]]
  };
  var _default$1J = feedRole;
  feedRole$1.default = _default$1J;
  var figureRole$1 = {};
  Object.defineProperty(figureRole$1, "__esModule", {
    value: true
  });
  figureRole$1.default = void 0;
  var figureRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "figure"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1I = figureRole;
  figureRole$1.default = _default$1I;
  var formRole$1 = {};
  Object.defineProperty(formRole$1, "__esModule", {
    value: true
  });
  formRole$1.default = void 0;
  var formRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "aria-label"
        }],
        name: "form"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "aria-labelledby"
        }],
        name: "form"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "name"
        }],
        name: "form"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1H = formRole;
  formRole$1.default = _default$1H;
  var genericRole$1 = {};
  Object.defineProperty(genericRole$1, "__esModule", {
    value: true
  });
  genericRole$1.default = void 0;
  var genericRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "a"
      },
      module: "HTML"
    }, {
      concept: {
        name: "area"
      },
      module: "HTML"
    }, {
      concept: {
        name: "aside"
      },
      module: "HTML"
    }, {
      concept: {
        name: "b"
      },
      module: "HTML"
    }, {
      concept: {
        name: "bdo"
      },
      module: "HTML"
    }, {
      concept: {
        name: "body"
      },
      module: "HTML"
    }, {
      concept: {
        name: "data"
      },
      module: "HTML"
    }, {
      concept: {
        name: "div"
      },
      module: "HTML"
    }, {
      concept: {
        constraints: ["scoped to the main element", "scoped to a sectioning content element", "scoped to a sectioning root element other than body"],
        name: "footer"
      },
      module: "HTML"
    }, {
      concept: {
        constraints: ["scoped to the main element", "scoped to a sectioning content element", "scoped to a sectioning root element other than body"],
        name: "header"
      },
      module: "HTML"
    }, {
      concept: {
        name: "hgroup"
      },
      module: "HTML"
    }, {
      concept: {
        name: "i"
      },
      module: "HTML"
    }, {
      concept: {
        name: "pre"
      },
      module: "HTML"
    }, {
      concept: {
        name: "q"
      },
      module: "HTML"
    }, {
      concept: {
        name: "samp"
      },
      module: "HTML"
    }, {
      concept: {
        name: "section"
      },
      module: "HTML"
    }, {
      concept: {
        name: "small"
      },
      module: "HTML"
    }, {
      concept: {
        name: "span"
      },
      module: "HTML"
    }, {
      concept: {
        name: "u"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$1G = genericRole;
  genericRole$1.default = _default$1G;
  var gridRole$1 = {};
  Object.defineProperty(gridRole$1, "__esModule", {
    value: true
  });
  gridRole$1.default = void 0;
  var gridRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-multiselectable": null,
      "aria-readonly": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["row"], ["row", "rowgroup"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite"], ["roletype", "structure", "section", "table"]]
  };
  var _default$1F = gridRole;
  gridRole$1.default = _default$1F;
  var gridcellRole$1 = {};
  Object.defineProperty(gridcellRole$1, "__esModule", {
    value: true
  });
  gridcellRole$1.default = void 0;
  var gridcellRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null,
      "aria-readonly": null,
      "aria-required": null,
      "aria-selected": null
    },
    relatedConcepts: [{
      concept: {
        constraints: ["ancestor table element has grid role", "ancestor table element has treegrid role"],
        name: "td"
      },
      module: "HTML"
    }],
    requireContextRole: ["row"],
    requiredContextRole: ["row"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "cell"], ["roletype", "widget"]]
  };
  var _default$1E = gridcellRole;
  gridcellRole$1.default = _default$1E;
  var groupRole$1 = {};
  Object.defineProperty(groupRole$1, "__esModule", {
    value: true
  });
  groupRole$1.default = void 0;
  var groupRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-activedescendant": null,
      "aria-disabled": null
    },
    relatedConcepts: [{
      concept: {
        name: "details"
      },
      module: "HTML"
    }, {
      concept: {
        name: "fieldset"
      },
      module: "HTML"
    }, {
      concept: {
        name: "optgroup"
      },
      module: "HTML"
    }, {
      concept: {
        name: "address"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1D = groupRole;
  groupRole$1.default = _default$1D;
  var headingRole$1 = {};
  Object.defineProperty(headingRole$1, "__esModule", {
    value: true
  });
  headingRole$1.default = void 0;
  var headingRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-level": "2"
    },
    relatedConcepts: [{
      concept: {
        name: "h1"
      },
      module: "HTML"
    }, {
      concept: {
        name: "h2"
      },
      module: "HTML"
    }, {
      concept: {
        name: "h3"
      },
      module: "HTML"
    }, {
      concept: {
        name: "h4"
      },
      module: "HTML"
    }, {
      concept: {
        name: "h5"
      },
      module: "HTML"
    }, {
      concept: {
        name: "h6"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-level": "2"
    },
    superClass: [["roletype", "structure", "sectionhead"]]
  };
  var _default$1C = headingRole;
  headingRole$1.default = _default$1C;
  var imgRole$1 = {};
  Object.defineProperty(imgRole$1, "__esModule", {
    value: true
  });
  imgRole$1.default = void 0;
  var imgRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "alt"
        }],
        name: "img"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "alt"
        }],
        name: "img"
      },
      module: "HTML"
    }, {
      concept: {
        name: "imggroup"
      },
      module: "DTB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1B = imgRole;
  imgRole$1.default = _default$1B;
  var insertionRole$1 = {};
  Object.defineProperty(insertionRole$1, "__esModule", {
    value: true
  });
  insertionRole$1.default = void 0;
  var insertionRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "ins"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1A = insertionRole;
  insertionRole$1.default = _default$1A;
  var linkRole$1 = {};
  Object.defineProperty(linkRole$1, "__esModule", {
    value: true
  });
  linkRole$1.default = void 0;
  var linkRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-expanded": null,
      "aria-haspopup": null
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "href"
        }],
        name: "a"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "href"
        }],
        name: "area"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command"]]
  };
  var _default$1z = linkRole;
  linkRole$1.default = _default$1z;
  var listRole$1 = {};
  Object.defineProperty(listRole$1, "__esModule", {
    value: true
  });
  listRole$1.default = void 0;
  var listRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "menu"
      },
      module: "HTML"
    }, {
      concept: {
        name: "ol"
      },
      module: "HTML"
    }, {
      concept: {
        name: "ul"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["listitem"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1y = listRole;
  listRole$1.default = _default$1y;
  var listboxRole$1 = {};
  Object.defineProperty(listboxRole$1, "__esModule", {
    value: true
  });
  listboxRole$1.default = void 0;
  var listboxRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-invalid": null,
      "aria-multiselectable": null,
      "aria-readonly": null,
      "aria-required": null,
      "aria-orientation": "vertical"
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: [">1"],
          name: "size"
        }],
        constraints: ["the size attribute value is greater than 1"],
        name: "select"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "multiple"
        }],
        name: "select"
      },
      module: "HTML"
    }, {
      concept: {
        name: "datalist"
      },
      module: "HTML"
    }, {
      concept: {
        name: "list"
      },
      module: "ARIA"
    }, {
      concept: {
        name: "select"
      },
      module: "XForms"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["option", "group"], ["option"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
  };
  var _default$1x = listboxRole;
  listboxRole$1.default = _default$1x;
  var listitemRole$1 = {};
  Object.defineProperty(listitemRole$1, "__esModule", {
    value: true
  });
  listitemRole$1.default = void 0;
  var listitemRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-level": null,
      "aria-posinset": null,
      "aria-setsize": null
    },
    relatedConcepts: [{
      concept: {
        constraints: ["direct descendant of ol", "direct descendant of ul", "direct descendant of menu"],
        name: "li"
      },
      module: "HTML"
    }, {
      concept: {
        name: "item"
      },
      module: "XForms"
    }],
    requireContextRole: ["directory", "list"],
    requiredContextRole: ["directory", "list"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1w = listitemRole;
  listitemRole$1.default = _default$1w;
  var logRole$1 = {};
  Object.defineProperty(logRole$1, "__esModule", {
    value: true
  });
  logRole$1.default = void 0;
  var logRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-live": "polite"
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1v = logRole;
  logRole$1.default = _default$1v;
  var mainRole$1 = {};
  Object.defineProperty(mainRole$1, "__esModule", {
    value: true
  });
  mainRole$1.default = void 0;
  var mainRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "main"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1u = mainRole;
  mainRole$1.default = _default$1u;
  var markRole$1 = {};
  Object.defineProperty(markRole$1, "__esModule", {
    value: true
  });
  markRole$1.default = void 0;
  var markRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: [],
    props: {
      "aria-braillelabel": null,
      "aria-brailleroledescription": null,
      "aria-description": null
    },
    relatedConcepts: [{
      concept: {
        name: "mark"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1t = markRole;
  markRole$1.default = _default$1t;
  var marqueeRole$1 = {};
  Object.defineProperty(marqueeRole$1, "__esModule", {
    value: true
  });
  marqueeRole$1.default = void 0;
  var marqueeRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1s = marqueeRole;
  marqueeRole$1.default = _default$1s;
  var mathRole$1 = {};
  Object.defineProperty(mathRole$1, "__esModule", {
    value: true
  });
  mathRole$1.default = void 0;
  var mathRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "math"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1r = mathRole;
  mathRole$1.default = _default$1r;
  var menuRole$1 = {};
  Object.defineProperty(menuRole$1, "__esModule", {
    value: true
  });
  menuRole$1.default = void 0;
  var menuRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-orientation": "vertical"
    },
    relatedConcepts: [{
      concept: {
        name: "MENU"
      },
      module: "JAPI"
    }, {
      concept: {
        name: "list"
      },
      module: "ARIA"
    }, {
      concept: {
        name: "select"
      },
      module: "XForms"
    }, {
      concept: {
        name: "sidebar"
      },
      module: "DTB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["menuitem", "group"], ["menuitemradio", "group"], ["menuitemcheckbox", "group"], ["menuitem"], ["menuitemcheckbox"], ["menuitemradio"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
  };
  var _default$1q = menuRole;
  menuRole$1.default = _default$1q;
  var menubarRole$1 = {};
  Object.defineProperty(menubarRole$1, "__esModule", {
    value: true
  });
  menubarRole$1.default = void 0;
  var menubarRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-orientation": "horizontal"
    },
    relatedConcepts: [{
      concept: {
        name: "toolbar"
      },
      module: "ARIA"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["menuitem", "group"], ["menuitemradio", "group"], ["menuitemcheckbox", "group"], ["menuitem"], ["menuitemcheckbox"], ["menuitemradio"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite", "select", "menu"], ["roletype", "structure", "section", "group", "select", "menu"]]
  };
  var _default$1p = menubarRole;
  menubarRole$1.default = _default$1p;
  var menuitemRole$1 = {};
  Object.defineProperty(menuitemRole$1, "__esModule", {
    value: true
  });
  menuitemRole$1.default = void 0;
  var menuitemRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-posinset": null,
      "aria-setsize": null
    },
    relatedConcepts: [{
      concept: {
        name: "MENU_ITEM"
      },
      module: "JAPI"
    }, {
      concept: {
        name: "listitem"
      },
      module: "ARIA"
    }, {
      concept: {
        name: "option"
      },
      module: "ARIA"
    }],
    requireContextRole: ["group", "menu", "menubar"],
    requiredContextRole: ["group", "menu", "menubar"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command"]]
  };
  var _default$1o = menuitemRole;
  menuitemRole$1.default = _default$1o;
  var menuitemcheckboxRole$1 = {};
  Object.defineProperty(menuitemcheckboxRole$1, "__esModule", {
    value: true
  });
  menuitemcheckboxRole$1.default = void 0;
  var menuitemcheckboxRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "menuitem"
      },
      module: "ARIA"
    }],
    requireContextRole: ["group", "menu", "menubar"],
    requiredContextRole: ["group", "menu", "menubar"],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-checked": null
    },
    superClass: [["roletype", "widget", "input", "checkbox"], ["roletype", "widget", "command", "menuitem"]]
  };
  var _default$1n = menuitemcheckboxRole;
  menuitemcheckboxRole$1.default = _default$1n;
  var menuitemradioRole$1 = {};
  Object.defineProperty(menuitemradioRole$1, "__esModule", {
    value: true
  });
  menuitemradioRole$1.default = void 0;
  var menuitemradioRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "menuitem"
      },
      module: "ARIA"
    }],
    requireContextRole: ["group", "menu", "menubar"],
    requiredContextRole: ["group", "menu", "menubar"],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-checked": null
    },
    superClass: [["roletype", "widget", "input", "checkbox", "menuitemcheckbox"], ["roletype", "widget", "command", "menuitem", "menuitemcheckbox"], ["roletype", "widget", "input", "radio"]]
  };
  var _default$1m = menuitemradioRole;
  menuitemradioRole$1.default = _default$1m;
  var meterRole$1 = {};
  Object.defineProperty(meterRole$1, "__esModule", {
    value: true
  });
  meterRole$1.default = void 0;
  var meterRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-valuetext": null,
      "aria-valuemax": "100",
      "aria-valuemin": "0"
    },
    relatedConcepts: [{
      concept: {
        name: "meter"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-valuenow": null
    },
    superClass: [["roletype", "structure", "range"]]
  };
  var _default$1l = meterRole;
  meterRole$1.default = _default$1l;
  var navigationRole$1 = {};
  Object.defineProperty(navigationRole$1, "__esModule", {
    value: true
  });
  navigationRole$1.default = void 0;
  var navigationRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "nav"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1k = navigationRole;
  navigationRole$1.default = _default$1k;
  var noneRole$1 = {};
  Object.defineProperty(noneRole$1, "__esModule", {
    value: true
  });
  noneRole$1.default = void 0;
  var noneRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: [],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: []
  };
  var _default$1j = noneRole;
  noneRole$1.default = _default$1j;
  var noteRole$1 = {};
  Object.defineProperty(noteRole$1, "__esModule", {
    value: true
  });
  noteRole$1.default = void 0;
  var noteRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1i = noteRole;
  noteRole$1.default = _default$1i;
  var optionRole$1 = {};
  Object.defineProperty(optionRole$1, "__esModule", {
    value: true
  });
  optionRole$1.default = void 0;
  var optionRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-checked": null,
      "aria-posinset": null,
      "aria-setsize": null,
      "aria-selected": "false"
    },
    relatedConcepts: [{
      concept: {
        name: "item"
      },
      module: "XForms"
    }, {
      concept: {
        name: "listitem"
      },
      module: "ARIA"
    }, {
      concept: {
        name: "option"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-selected": "false"
    },
    superClass: [["roletype", "widget", "input"]]
  };
  var _default$1h = optionRole;
  optionRole$1.default = _default$1h;
  var paragraphRole$1 = {};
  Object.defineProperty(paragraphRole$1, "__esModule", {
    value: true
  });
  paragraphRole$1.default = void 0;
  var paragraphRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "p"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$1g = paragraphRole;
  paragraphRole$1.default = _default$1g;
  var presentationRole$1 = {};
  Object.defineProperty(presentationRole$1, "__esModule", {
    value: true
  });
  presentationRole$1.default = void 0;
  var presentationRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "alt",
          value: ""
        }],
        name: "img"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$1f = presentationRole;
  presentationRole$1.default = _default$1f;
  var progressbarRole$1 = {};
  Object.defineProperty(progressbarRole$1, "__esModule", {
    value: true
  });
  progressbarRole$1.default = void 0;
  var progressbarRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-valuetext": null
    },
    relatedConcepts: [{
      concept: {
        name: "progress"
      },
      module: "HTML"
    }, {
      concept: {
        name: "status"
      },
      module: "ARIA"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "range"], ["roletype", "widget"]]
  };
  var _default$1e = progressbarRole;
  progressbarRole$1.default = _default$1e;
  var radioRole$1 = {};
  Object.defineProperty(radioRole$1, "__esModule", {
    value: true
  });
  radioRole$1.default = void 0;
  var radioRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-checked": null,
      "aria-posinset": null,
      "aria-setsize": null
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "type",
          value: "radio"
        }],
        name: "input"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-checked": null
    },
    superClass: [["roletype", "widget", "input"]]
  };
  var _default$1d = radioRole;
  radioRole$1.default = _default$1d;
  var radiogroupRole$1 = {};
  Object.defineProperty(radiogroupRole$1, "__esModule", {
    value: true
  });
  radiogroupRole$1.default = void 0;
  var radiogroupRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null,
      "aria-readonly": null,
      "aria-required": null
    },
    relatedConcepts: [{
      concept: {
        name: "list"
      },
      module: "ARIA"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["radio"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
  };
  var _default$1c = radiogroupRole;
  radiogroupRole$1.default = _default$1c;
  var regionRole$1 = {};
  Object.defineProperty(regionRole$1, "__esModule", {
    value: true
  });
  regionRole$1.default = void 0;
  var regionRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "aria-label"
        }],
        name: "section"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["set"],
          name: "aria-labelledby"
        }],
        name: "section"
      },
      module: "HTML"
    }, {
      concept: {
        name: "Device Independence Glossart perceivable unit"
      }
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$1b = regionRole;
  regionRole$1.default = _default$1b;
  var rowRole$1 = {};
  Object.defineProperty(rowRole$1, "__esModule", {
    value: true
  });
  rowRole$1.default = void 0;
  var rowRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-colindex": null,
      "aria-expanded": null,
      "aria-level": null,
      "aria-posinset": null,
      "aria-rowindex": null,
      "aria-selected": null,
      "aria-setsize": null
    },
    relatedConcepts: [{
      concept: {
        name: "tr"
      },
      module: "HTML"
    }],
    requireContextRole: ["grid", "rowgroup", "table", "treegrid"],
    requiredContextRole: ["grid", "rowgroup", "table", "treegrid"],
    requiredOwnedElements: [["cell"], ["columnheader"], ["gridcell"], ["rowheader"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "group"], ["roletype", "widget"]]
  };
  var _default$1a = rowRole;
  rowRole$1.default = _default$1a;
  var rowgroupRole$1 = {};
  Object.defineProperty(rowgroupRole$1, "__esModule", {
    value: true
  });
  rowgroupRole$1.default = void 0;
  var rowgroupRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "tbody"
      },
      module: "HTML"
    }, {
      concept: {
        name: "tfoot"
      },
      module: "HTML"
    }, {
      concept: {
        name: "thead"
      },
      module: "HTML"
    }],
    requireContextRole: ["grid", "table", "treegrid"],
    requiredContextRole: ["grid", "table", "treegrid"],
    requiredOwnedElements: [["row"]],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$19 = rowgroupRole;
  rowgroupRole$1.default = _default$19;
  var rowheaderRole$1 = {};
  Object.defineProperty(rowheaderRole$1, "__esModule", {
    value: true
  });
  rowheaderRole$1.default = void 0;
  var rowheaderRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-sort": null
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "scope",
          value: "row"
        }],
        name: "th"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          name: "scope",
          value: "rowgroup"
        }],
        name: "th"
      },
      module: "HTML"
    }],
    requireContextRole: ["row", "rowgroup"],
    requiredContextRole: ["row", "rowgroup"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "cell"], ["roletype", "structure", "section", "cell", "gridcell"], ["roletype", "widget", "gridcell"], ["roletype", "structure", "sectionhead"]]
  };
  var _default$18 = rowheaderRole;
  rowheaderRole$1.default = _default$18;
  var scrollbarRole$1 = {};
  Object.defineProperty(scrollbarRole$1, "__esModule", {
    value: true
  });
  scrollbarRole$1.default = void 0;
  var scrollbarRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-valuetext": null,
      "aria-orientation": "vertical",
      "aria-valuemax": "100",
      "aria-valuemin": "0"
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-controls": null,
      "aria-valuenow": null
    },
    superClass: [["roletype", "structure", "range"], ["roletype", "widget"]]
  };
  var _default$17 = scrollbarRole;
  scrollbarRole$1.default = _default$17;
  var searchRole$1 = {};
  Object.defineProperty(searchRole$1, "__esModule", {
    value: true
  });
  searchRole$1.default = void 0;
  var searchRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$16 = searchRole;
  searchRole$1.default = _default$16;
  var searchboxRole$1 = {};
  Object.defineProperty(searchboxRole$1, "__esModule", {
    value: true
  });
  searchboxRole$1.default = void 0;
  var searchboxRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "list"
        }, {
          name: "type",
          value: "search"
        }],
        constraints: ["the list attribute is not set"],
        name: "input"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "input", "textbox"]]
  };
  var _default$15 = searchboxRole;
  searchboxRole$1.default = _default$15;
  var separatorRole$1 = {};
  Object.defineProperty(separatorRole$1, "__esModule", {
    value: true
  });
  separatorRole$1.default = void 0;
  var separatorRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-orientation": "horizontal",
      "aria-valuemax": "100",
      "aria-valuemin": "0",
      "aria-valuenow": null,
      "aria-valuetext": null
    },
    relatedConcepts: [{
      concept: {
        name: "hr"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure"]]
  };
  var _default$14 = separatorRole;
  separatorRole$1.default = _default$14;
  var sliderRole$1 = {};
  Object.defineProperty(sliderRole$1, "__esModule", {
    value: true
  });
  sliderRole$1.default = void 0;
  var sliderRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-haspopup": null,
      "aria-invalid": null,
      "aria-readonly": null,
      "aria-valuetext": null,
      "aria-orientation": "horizontal",
      "aria-valuemax": "100",
      "aria-valuemin": "0"
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "type",
          value: "range"
        }],
        name: "input"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-valuenow": null
    },
    superClass: [["roletype", "widget", "input"], ["roletype", "structure", "range"]]
  };
  var _default$13 = sliderRole;
  sliderRole$1.default = _default$13;
  var spinbuttonRole$1 = {};
  Object.defineProperty(spinbuttonRole$1, "__esModule", {
    value: true
  });
  spinbuttonRole$1.default = void 0;
  var spinbuttonRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null,
      "aria-readonly": null,
      "aria-required": null,
      "aria-valuetext": null,
      "aria-valuenow": "0"
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          name: "type",
          value: "number"
        }],
        name: "input"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite"], ["roletype", "widget", "input"], ["roletype", "structure", "range"]]
  };
  var _default$12 = spinbuttonRole;
  spinbuttonRole$1.default = _default$12;
  var statusRole$1 = {};
  Object.defineProperty(statusRole$1, "__esModule", {
    value: true
  });
  statusRole$1.default = void 0;
  var statusRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-atomic": "true",
      "aria-live": "polite"
    },
    relatedConcepts: [{
      concept: {
        name: "output"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$11 = statusRole;
  statusRole$1.default = _default$11;
  var strongRole$1 = {};
  Object.defineProperty(strongRole$1, "__esModule", {
    value: true
  });
  strongRole$1.default = void 0;
  var strongRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "strong"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$10 = strongRole;
  strongRole$1.default = _default$10;
  var subscriptRole$1 = {};
  Object.defineProperty(subscriptRole$1, "__esModule", {
    value: true
  });
  subscriptRole$1.default = void 0;
  var subscriptRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "sub"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$$ = subscriptRole;
  subscriptRole$1.default = _default$$;
  var superscriptRole$1 = {};
  Object.defineProperty(superscriptRole$1, "__esModule", {
    value: true
  });
  superscriptRole$1.default = void 0;
  var superscriptRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["prohibited"],
    prohibitedProps: ["aria-label", "aria-labelledby"],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "sup"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$_ = superscriptRole;
  superscriptRole$1.default = _default$_;
  var switchRole$1 = {};
  Object.defineProperty(switchRole$1, "__esModule", {
    value: true
  });
  switchRole$1.default = void 0;
  var switchRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "button"
      },
      module: "ARIA"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-checked": null
    },
    superClass: [["roletype", "widget", "input", "checkbox"]]
  };
  var _default$Z = switchRole;
  switchRole$1.default = _default$Z;
  var tabRole$1 = {};
  Object.defineProperty(tabRole$1, "__esModule", {
    value: true
  });
  tabRole$1.default = void 0;
  var tabRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-posinset": null,
      "aria-setsize": null,
      "aria-selected": "false"
    },
    relatedConcepts: [],
    requireContextRole: ["tablist"],
    requiredContextRole: ["tablist"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "sectionhead"], ["roletype", "widget"]]
  };
  var _default$Y = tabRole;
  tabRole$1.default = _default$Y;
  var tableRole$1 = {};
  Object.defineProperty(tableRole$1, "__esModule", {
    value: true
  });
  tableRole$1.default = void 0;
  var tableRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-colcount": null,
      "aria-rowcount": null
    },
    relatedConcepts: [{
      concept: {
        name: "table"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["row"], ["row", "rowgroup"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$X = tableRole;
  tableRole$1.default = _default$X;
  var tablistRole$1 = {};
  Object.defineProperty(tablistRole$1, "__esModule", {
    value: true
  });
  tablistRole$1.default = void 0;
  var tablistRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-level": null,
      "aria-multiselectable": null,
      "aria-orientation": "horizontal"
    },
    relatedConcepts: [{
      module: "DAISY",
      concept: {
        name: "guide"
      }
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["tab"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite"]]
  };
  var _default$W = tablistRole;
  tablistRole$1.default = _default$W;
  var tabpanelRole$1 = {};
  Object.defineProperty(tabpanelRole$1, "__esModule", {
    value: true
  });
  tabpanelRole$1.default = void 0;
  var tabpanelRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$V = tabpanelRole;
  tabpanelRole$1.default = _default$V;
  var termRole$1 = {};
  Object.defineProperty(termRole$1, "__esModule", {
    value: true
  });
  termRole$1.default = void 0;
  var termRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "dfn"
      },
      module: "HTML"
    }, {
      concept: {
        name: "dt"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$U = termRole;
  termRole$1.default = _default$U;
  var textboxRole$1 = {};
  Object.defineProperty(textboxRole$1, "__esModule", {
    value: true
  });
  textboxRole$1.default = void 0;
  var textboxRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-activedescendant": null,
      "aria-autocomplete": null,
      "aria-errormessage": null,
      "aria-haspopup": null,
      "aria-invalid": null,
      "aria-multiline": null,
      "aria-placeholder": null,
      "aria-readonly": null,
      "aria-required": null
    },
    relatedConcepts: [{
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "type"
        }, {
          constraints: ["undefined"],
          name: "list"
        }],
        constraints: ["the list attribute is not set"],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "list"
        }, {
          name: "type",
          value: "email"
        }],
        constraints: ["the list attribute is not set"],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "list"
        }, {
          name: "type",
          value: "tel"
        }],
        constraints: ["the list attribute is not set"],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "list"
        }, {
          name: "type",
          value: "text"
        }],
        constraints: ["the list attribute is not set"],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        attributes: [{
          constraints: ["undefined"],
          name: "list"
        }, {
          name: "type",
          value: "url"
        }],
        constraints: ["the list attribute is not set"],
        name: "input"
      },
      module: "HTML"
    }, {
      concept: {
        name: "input"
      },
      module: "XForms"
    }, {
      concept: {
        name: "textarea"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "input"]]
  };
  var _default$T = textboxRole;
  textboxRole$1.default = _default$T;
  var timeRole$1 = {};
  Object.defineProperty(timeRole$1, "__esModule", {
    value: true
  });
  timeRole$1.default = void 0;
  var timeRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "time"
      },
      module: "HTML"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$S = timeRole;
  timeRole$1.default = _default$S;
  var timerRole$1 = {};
  Object.defineProperty(timerRole$1, "__esModule", {
    value: true
  });
  timerRole$1.default = void 0;
  var timerRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "status"]]
  };
  var _default$R = timerRole;
  timerRole$1.default = _default$R;
  var toolbarRole$1 = {};
  Object.defineProperty(toolbarRole$1, "__esModule", {
    value: true
  });
  toolbarRole$1.default = void 0;
  var toolbarRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-orientation": "horizontal"
    },
    relatedConcepts: [{
      concept: {
        name: "menubar"
      },
      module: "ARIA"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "group"]]
  };
  var _default$Q = toolbarRole;
  toolbarRole$1.default = _default$Q;
  var tooltipRole$1 = {};
  Object.defineProperty(tooltipRole$1, "__esModule", {
    value: true
  });
  tooltipRole$1.default = void 0;
  var tooltipRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$P = tooltipRole;
  tooltipRole$1.default = _default$P;
  var treeRole$1 = {};
  Object.defineProperty(treeRole$1, "__esModule", {
    value: true
  });
  treeRole$1.default = void 0;
  var treeRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null,
      "aria-multiselectable": null,
      "aria-required": null,
      "aria-orientation": "vertical"
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["treeitem", "group"], ["treeitem"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite", "select"], ["roletype", "structure", "section", "group", "select"]]
  };
  var _default$O = treeRole;
  treeRole$1.default = _default$O;
  var treegridRole$1 = {};
  Object.defineProperty(treegridRole$1, "__esModule", {
    value: true
  });
  treegridRole$1.default = void 0;
  var treegridRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["row"], ["row", "rowgroup"]],
    requiredProps: {},
    superClass: [["roletype", "widget", "composite", "grid"], ["roletype", "structure", "section", "table", "grid"], ["roletype", "widget", "composite", "select", "tree"], ["roletype", "structure", "section", "group", "select", "tree"]]
  };
  var _default$N = treegridRole;
  treegridRole$1.default = _default$N;
  var treeitemRole$1 = {};
  Object.defineProperty(treeitemRole$1, "__esModule", {
    value: true
  });
  treeitemRole$1.default = void 0;
  var treeitemRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-expanded": null,
      "aria-haspopup": null
    },
    relatedConcepts: [],
    requireContextRole: ["group", "tree"],
    requiredContextRole: ["group", "tree"],
    requiredOwnedElements: [],
    requiredProps: {
      "aria-selected": null
    },
    superClass: [["roletype", "structure", "section", "listitem"], ["roletype", "widget", "input", "option"]]
  };
  var _default$M = treeitemRole;
  treeitemRole$1.default = _default$M;
  Object.defineProperty(ariaLiteralRoles$1, "__esModule", {
    value: true
  });
  ariaLiteralRoles$1.default = void 0;
  var _alertRole = _interopRequireDefault$6(alertRole$1);
  var _alertdialogRole = _interopRequireDefault$6(alertdialogRole$1);
  var _applicationRole = _interopRequireDefault$6(applicationRole$1);
  var _articleRole = _interopRequireDefault$6(articleRole$1);
  var _bannerRole = _interopRequireDefault$6(bannerRole$1);
  var _blockquoteRole = _interopRequireDefault$6(blockquoteRole$1);
  var _buttonRole = _interopRequireDefault$6(buttonRole$1);
  var _captionRole = _interopRequireDefault$6(captionRole$1);
  var _cellRole = _interopRequireDefault$6(cellRole$1);
  var _checkboxRole = _interopRequireDefault$6(checkboxRole$1);
  var _codeRole = _interopRequireDefault$6(codeRole$1);
  var _columnheaderRole = _interopRequireDefault$6(columnheaderRole$1);
  var _comboboxRole = _interopRequireDefault$6(comboboxRole$1);
  var _complementaryRole = _interopRequireDefault$6(complementaryRole$1);
  var _contentinfoRole = _interopRequireDefault$6(contentinfoRole$1);
  var _definitionRole = _interopRequireDefault$6(definitionRole$1);
  var _deletionRole = _interopRequireDefault$6(deletionRole$1);
  var _dialogRole = _interopRequireDefault$6(dialogRole$1);
  var _directoryRole = _interopRequireDefault$6(directoryRole$1);
  var _documentRole = _interopRequireDefault$6(documentRole$1);
  var _emphasisRole = _interopRequireDefault$6(emphasisRole$1);
  var _feedRole = _interopRequireDefault$6(feedRole$1);
  var _figureRole = _interopRequireDefault$6(figureRole$1);
  var _formRole = _interopRequireDefault$6(formRole$1);
  var _genericRole = _interopRequireDefault$6(genericRole$1);
  var _gridRole = _interopRequireDefault$6(gridRole$1);
  var _gridcellRole = _interopRequireDefault$6(gridcellRole$1);
  var _groupRole = _interopRequireDefault$6(groupRole$1);
  var _headingRole = _interopRequireDefault$6(headingRole$1);
  var _imgRole = _interopRequireDefault$6(imgRole$1);
  var _insertionRole = _interopRequireDefault$6(insertionRole$1);
  var _linkRole = _interopRequireDefault$6(linkRole$1);
  var _listRole = _interopRequireDefault$6(listRole$1);
  var _listboxRole = _interopRequireDefault$6(listboxRole$1);
  var _listitemRole = _interopRequireDefault$6(listitemRole$1);
  var _logRole = _interopRequireDefault$6(logRole$1);
  var _mainRole = _interopRequireDefault$6(mainRole$1);
  var _markRole = _interopRequireDefault$6(markRole$1);
  var _marqueeRole = _interopRequireDefault$6(marqueeRole$1);
  var _mathRole = _interopRequireDefault$6(mathRole$1);
  var _menuRole = _interopRequireDefault$6(menuRole$1);
  var _menubarRole = _interopRequireDefault$6(menubarRole$1);
  var _menuitemRole = _interopRequireDefault$6(menuitemRole$1);
  var _menuitemcheckboxRole = _interopRequireDefault$6(menuitemcheckboxRole$1);
  var _menuitemradioRole = _interopRequireDefault$6(menuitemradioRole$1);
  var _meterRole = _interopRequireDefault$6(meterRole$1);
  var _navigationRole = _interopRequireDefault$6(navigationRole$1);
  var _noneRole = _interopRequireDefault$6(noneRole$1);
  var _noteRole = _interopRequireDefault$6(noteRole$1);
  var _optionRole = _interopRequireDefault$6(optionRole$1);
  var _paragraphRole = _interopRequireDefault$6(paragraphRole$1);
  var _presentationRole = _interopRequireDefault$6(presentationRole$1);
  var _progressbarRole = _interopRequireDefault$6(progressbarRole$1);
  var _radioRole = _interopRequireDefault$6(radioRole$1);
  var _radiogroupRole = _interopRequireDefault$6(radiogroupRole$1);
  var _regionRole = _interopRequireDefault$6(regionRole$1);
  var _rowRole = _interopRequireDefault$6(rowRole$1);
  var _rowgroupRole = _interopRequireDefault$6(rowgroupRole$1);
  var _rowheaderRole = _interopRequireDefault$6(rowheaderRole$1);
  var _scrollbarRole = _interopRequireDefault$6(scrollbarRole$1);
  var _searchRole = _interopRequireDefault$6(searchRole$1);
  var _searchboxRole = _interopRequireDefault$6(searchboxRole$1);
  var _separatorRole = _interopRequireDefault$6(separatorRole$1);
  var _sliderRole = _interopRequireDefault$6(sliderRole$1);
  var _spinbuttonRole = _interopRequireDefault$6(spinbuttonRole$1);
  var _statusRole = _interopRequireDefault$6(statusRole$1);
  var _strongRole = _interopRequireDefault$6(strongRole$1);
  var _subscriptRole = _interopRequireDefault$6(subscriptRole$1);
  var _superscriptRole = _interopRequireDefault$6(superscriptRole$1);
  var _switchRole = _interopRequireDefault$6(switchRole$1);
  var _tabRole = _interopRequireDefault$6(tabRole$1);
  var _tableRole = _interopRequireDefault$6(tableRole$1);
  var _tablistRole = _interopRequireDefault$6(tablistRole$1);
  var _tabpanelRole = _interopRequireDefault$6(tabpanelRole$1);
  var _termRole = _interopRequireDefault$6(termRole$1);
  var _textboxRole = _interopRequireDefault$6(textboxRole$1);
  var _timeRole = _interopRequireDefault$6(timeRole$1);
  var _timerRole = _interopRequireDefault$6(timerRole$1);
  var _toolbarRole = _interopRequireDefault$6(toolbarRole$1);
  var _tooltipRole = _interopRequireDefault$6(tooltipRole$1);
  var _treeRole = _interopRequireDefault$6(treeRole$1);
  var _treegridRole = _interopRequireDefault$6(treegridRole$1);
  var _treeitemRole = _interopRequireDefault$6(treeitemRole$1);
  function _interopRequireDefault$6(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var ariaLiteralRoles = [["alert", _alertRole.default], ["alertdialog", _alertdialogRole.default], ["application", _applicationRole.default], ["article", _articleRole.default], ["banner", _bannerRole.default], ["blockquote", _blockquoteRole.default], ["button", _buttonRole.default], ["caption", _captionRole.default], ["cell", _cellRole.default], ["checkbox", _checkboxRole.default], ["code", _codeRole.default], ["columnheader", _columnheaderRole.default], ["combobox", _comboboxRole.default], ["complementary", _complementaryRole.default], ["contentinfo", _contentinfoRole.default], ["definition", _definitionRole.default], ["deletion", _deletionRole.default], ["dialog", _dialogRole.default], ["directory", _directoryRole.default], ["document", _documentRole.default], ["emphasis", _emphasisRole.default], ["feed", _feedRole.default], ["figure", _figureRole.default], ["form", _formRole.default], ["generic", _genericRole.default], ["grid", _gridRole.default], ["gridcell", _gridcellRole.default], ["group", _groupRole.default], ["heading", _headingRole.default], ["img", _imgRole.default], ["insertion", _insertionRole.default], ["link", _linkRole.default], ["list", _listRole.default], ["listbox", _listboxRole.default], ["listitem", _listitemRole.default], ["log", _logRole.default], ["main", _mainRole.default], ["mark", _markRole.default], ["marquee", _marqueeRole.default], ["math", _mathRole.default], ["menu", _menuRole.default], ["menubar", _menubarRole.default], ["menuitem", _menuitemRole.default], ["menuitemcheckbox", _menuitemcheckboxRole.default], ["menuitemradio", _menuitemradioRole.default], ["meter", _meterRole.default], ["navigation", _navigationRole.default], ["none", _noneRole.default], ["note", _noteRole.default], ["option", _optionRole.default], ["paragraph", _paragraphRole.default], ["presentation", _presentationRole.default], ["progressbar", _progressbarRole.default], ["radio", _radioRole.default], ["radiogroup", _radiogroupRole.default], ["region", _regionRole.default], ["row", _rowRole.default], ["rowgroup", _rowgroupRole.default], ["rowheader", _rowheaderRole.default], ["scrollbar", _scrollbarRole.default], ["search", _searchRole.default], ["searchbox", _searchboxRole.default], ["separator", _separatorRole.default], ["slider", _sliderRole.default], ["spinbutton", _spinbuttonRole.default], ["status", _statusRole.default], ["strong", _strongRole.default], ["subscript", _subscriptRole.default], ["superscript", _superscriptRole.default], ["switch", _switchRole.default], ["tab", _tabRole.default], ["table", _tableRole.default], ["tablist", _tablistRole.default], ["tabpanel", _tabpanelRole.default], ["term", _termRole.default], ["textbox", _textboxRole.default], ["time", _timeRole.default], ["timer", _timerRole.default], ["toolbar", _toolbarRole.default], ["tooltip", _tooltipRole.default], ["tree", _treeRole.default], ["treegrid", _treegridRole.default], ["treeitem", _treeitemRole.default]];
  var _default$L = ariaLiteralRoles;
  ariaLiteralRoles$1.default = _default$L;
  var ariaDpubRoles$1 = {};
  var docAbstractRole$1 = {};
  Object.defineProperty(docAbstractRole$1, "__esModule", {
    value: true
  });
  docAbstractRole$1.default = void 0;
  var docAbstractRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "abstract [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$K = docAbstractRole;
  docAbstractRole$1.default = _default$K;
  var docAcknowledgmentsRole$1 = {};
  Object.defineProperty(docAcknowledgmentsRole$1, "__esModule", {
    value: true
  });
  docAcknowledgmentsRole$1.default = void 0;
  var docAcknowledgmentsRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "acknowledgments [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$J = docAcknowledgmentsRole;
  docAcknowledgmentsRole$1.default = _default$J;
  var docAfterwordRole$1 = {};
  Object.defineProperty(docAfterwordRole$1, "__esModule", {
    value: true
  });
  docAfterwordRole$1.default = void 0;
  var docAfterwordRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "afterword [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$I = docAfterwordRole;
  docAfterwordRole$1.default = _default$I;
  var docAppendixRole$1 = {};
  Object.defineProperty(docAppendixRole$1, "__esModule", {
    value: true
  });
  docAppendixRole$1.default = void 0;
  var docAppendixRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "appendix [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$H = docAppendixRole;
  docAppendixRole$1.default = _default$H;
  var docBacklinkRole$1 = {};
  Object.defineProperty(docBacklinkRole$1, "__esModule", {
    value: true
  });
  docBacklinkRole$1.default = void 0;
  var docBacklinkRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "referrer [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command", "link"]]
  };
  var _default$G = docBacklinkRole;
  docBacklinkRole$1.default = _default$G;
  var docBiblioentryRole$1 = {};
  Object.defineProperty(docBiblioentryRole$1, "__esModule", {
    value: true
  });
  docBiblioentryRole$1.default = void 0;
  var docBiblioentryRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "EPUB biblioentry [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: ["doc-bibliography"],
    requiredContextRole: ["doc-bibliography"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "listitem"]]
  };
  var _default$F = docBiblioentryRole;
  docBiblioentryRole$1.default = _default$F;
  var docBibliographyRole$1 = {};
  Object.defineProperty(docBibliographyRole$1, "__esModule", {
    value: true
  });
  docBibliographyRole$1.default = void 0;
  var docBibliographyRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "bibliography [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["doc-biblioentry"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$E = docBibliographyRole;
  docBibliographyRole$1.default = _default$E;
  var docBibliorefRole$1 = {};
  Object.defineProperty(docBibliorefRole$1, "__esModule", {
    value: true
  });
  docBibliorefRole$1.default = void 0;
  var docBibliorefRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "biblioref [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command", "link"]]
  };
  var _default$D = docBibliorefRole;
  docBibliorefRole$1.default = _default$D;
  var docChapterRole$1 = {};
  Object.defineProperty(docChapterRole$1, "__esModule", {
    value: true
  });
  docChapterRole$1.default = void 0;
  var docChapterRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "chapter [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$C = docChapterRole;
  docChapterRole$1.default = _default$C;
  var docColophonRole$1 = {};
  Object.defineProperty(docColophonRole$1, "__esModule", {
    value: true
  });
  docColophonRole$1.default = void 0;
  var docColophonRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "colophon [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$B = docColophonRole;
  docColophonRole$1.default = _default$B;
  var docConclusionRole$1 = {};
  Object.defineProperty(docConclusionRole$1, "__esModule", {
    value: true
  });
  docConclusionRole$1.default = void 0;
  var docConclusionRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "conclusion [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$A = docConclusionRole;
  docConclusionRole$1.default = _default$A;
  var docCoverRole$1 = {};
  Object.defineProperty(docCoverRole$1, "__esModule", {
    value: true
  });
  docCoverRole$1.default = void 0;
  var docCoverRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "cover [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "img"]]
  };
  var _default$z = docCoverRole;
  docCoverRole$1.default = _default$z;
  var docCreditRole$1 = {};
  Object.defineProperty(docCreditRole$1, "__esModule", {
    value: true
  });
  docCreditRole$1.default = void 0;
  var docCreditRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "credit [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$y = docCreditRole;
  docCreditRole$1.default = _default$y;
  var docCreditsRole$1 = {};
  Object.defineProperty(docCreditsRole$1, "__esModule", {
    value: true
  });
  docCreditsRole$1.default = void 0;
  var docCreditsRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "credits [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$x = docCreditsRole;
  docCreditsRole$1.default = _default$x;
  var docDedicationRole$1 = {};
  Object.defineProperty(docDedicationRole$1, "__esModule", {
    value: true
  });
  docDedicationRole$1.default = void 0;
  var docDedicationRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "dedication [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$w = docDedicationRole;
  docDedicationRole$1.default = _default$w;
  var docEndnoteRole$1 = {};
  Object.defineProperty(docEndnoteRole$1, "__esModule", {
    value: true
  });
  docEndnoteRole$1.default = void 0;
  var docEndnoteRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "rearnote [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: ["doc-endnotes"],
    requiredContextRole: ["doc-endnotes"],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "listitem"]]
  };
  var _default$v = docEndnoteRole;
  docEndnoteRole$1.default = _default$v;
  var docEndnotesRole$1 = {};
  Object.defineProperty(docEndnotesRole$1, "__esModule", {
    value: true
  });
  docEndnotesRole$1.default = void 0;
  var docEndnotesRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "rearnotes [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["doc-endnote"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$u = docEndnotesRole;
  docEndnotesRole$1.default = _default$u;
  var docEpigraphRole$1 = {};
  Object.defineProperty(docEpigraphRole$1, "__esModule", {
    value: true
  });
  docEpigraphRole$1.default = void 0;
  var docEpigraphRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "epigraph [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$t = docEpigraphRole;
  docEpigraphRole$1.default = _default$t;
  var docEpilogueRole$1 = {};
  Object.defineProperty(docEpilogueRole$1, "__esModule", {
    value: true
  });
  docEpilogueRole$1.default = void 0;
  var docEpilogueRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "epilogue [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$s = docEpilogueRole;
  docEpilogueRole$1.default = _default$s;
  var docErrataRole$1 = {};
  Object.defineProperty(docErrataRole$1, "__esModule", {
    value: true
  });
  docErrataRole$1.default = void 0;
  var docErrataRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "errata [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$r = docErrataRole;
  docErrataRole$1.default = _default$r;
  var docExampleRole$1 = {};
  Object.defineProperty(docExampleRole$1, "__esModule", {
    value: true
  });
  docExampleRole$1.default = void 0;
  var docExampleRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$q = docExampleRole;
  docExampleRole$1.default = _default$q;
  var docFootnoteRole$1 = {};
  Object.defineProperty(docFootnoteRole$1, "__esModule", {
    value: true
  });
  docFootnoteRole$1.default = void 0;
  var docFootnoteRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "footnote [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$p = docFootnoteRole;
  docFootnoteRole$1.default = _default$p;
  var docForewordRole$1 = {};
  Object.defineProperty(docForewordRole$1, "__esModule", {
    value: true
  });
  docForewordRole$1.default = void 0;
  var docForewordRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "foreword [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$o = docForewordRole;
  docForewordRole$1.default = _default$o;
  var docGlossaryRole$1 = {};
  Object.defineProperty(docGlossaryRole$1, "__esModule", {
    value: true
  });
  docGlossaryRole$1.default = void 0;
  var docGlossaryRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "glossary [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [["definition"], ["term"]],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$n = docGlossaryRole;
  docGlossaryRole$1.default = _default$n;
  var docGlossrefRole$1 = {};
  Object.defineProperty(docGlossrefRole$1, "__esModule", {
    value: true
  });
  docGlossrefRole$1.default = void 0;
  var docGlossrefRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "glossref [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command", "link"]]
  };
  var _default$m = docGlossrefRole;
  docGlossrefRole$1.default = _default$m;
  var docIndexRole$1 = {};
  Object.defineProperty(docIndexRole$1, "__esModule", {
    value: true
  });
  docIndexRole$1.default = void 0;
  var docIndexRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "index [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark", "navigation"]]
  };
  var _default$l = docIndexRole;
  docIndexRole$1.default = _default$l;
  var docIntroductionRole$1 = {};
  Object.defineProperty(docIntroductionRole$1, "__esModule", {
    value: true
  });
  docIntroductionRole$1.default = void 0;
  var docIntroductionRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "introduction [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$k = docIntroductionRole;
  docIntroductionRole$1.default = _default$k;
  var docNoterefRole$1 = {};
  Object.defineProperty(docNoterefRole$1, "__esModule", {
    value: true
  });
  docNoterefRole$1.default = void 0;
  var docNoterefRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "noteref [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "widget", "command", "link"]]
  };
  var _default$j = docNoterefRole;
  docNoterefRole$1.default = _default$j;
  var docNoticeRole$1 = {};
  Object.defineProperty(docNoticeRole$1, "__esModule", {
    value: true
  });
  docNoticeRole$1.default = void 0;
  var docNoticeRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "notice [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "note"]]
  };
  var _default$i = docNoticeRole;
  docNoticeRole$1.default = _default$i;
  var docPagebreakRole$1 = {};
  Object.defineProperty(docPagebreakRole$1, "__esModule", {
    value: true
  });
  docPagebreakRole$1.default = void 0;
  var docPagebreakRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "pagebreak [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "separator"]]
  };
  var _default$h = docPagebreakRole;
  docPagebreakRole$1.default = _default$h;
  var docPagelistRole$1 = {};
  Object.defineProperty(docPagelistRole$1, "__esModule", {
    value: true
  });
  docPagelistRole$1.default = void 0;
  var docPagelistRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "page-list [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark", "navigation"]]
  };
  var _default$g = docPagelistRole;
  docPagelistRole$1.default = _default$g;
  var docPartRole$1 = {};
  Object.defineProperty(docPartRole$1, "__esModule", {
    value: true
  });
  docPartRole$1.default = void 0;
  var docPartRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "part [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$f = docPartRole;
  docPartRole$1.default = _default$f;
  var docPrefaceRole$1 = {};
  Object.defineProperty(docPrefaceRole$1, "__esModule", {
    value: true
  });
  docPrefaceRole$1.default = void 0;
  var docPrefaceRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "preface [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$e = docPrefaceRole;
  docPrefaceRole$1.default = _default$e;
  var docPrologueRole$1 = {};
  Object.defineProperty(docPrologueRole$1, "__esModule", {
    value: true
  });
  docPrologueRole$1.default = void 0;
  var docPrologueRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "prologue [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark"]]
  };
  var _default$d = docPrologueRole;
  docPrologueRole$1.default = _default$d;
  var docPullquoteRole$1 = {};
  Object.defineProperty(docPullquoteRole$1, "__esModule", {
    value: true
  });
  docPullquoteRole$1.default = void 0;
  var docPullquoteRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {},
    relatedConcepts: [{
      concept: {
        name: "pullquote [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["none"]]
  };
  var _default$c = docPullquoteRole;
  docPullquoteRole$1.default = _default$c;
  var docQnaRole$1 = {};
  Object.defineProperty(docQnaRole$1, "__esModule", {
    value: true
  });
  docQnaRole$1.default = void 0;
  var docQnaRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "qna [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section"]]
  };
  var _default$b = docQnaRole;
  docQnaRole$1.default = _default$b;
  var docSubtitleRole$1 = {};
  Object.defineProperty(docSubtitleRole$1, "__esModule", {
    value: true
  });
  docSubtitleRole$1.default = void 0;
  var docSubtitleRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "subtitle [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "sectionhead"]]
  };
  var _default$a = docSubtitleRole;
  docSubtitleRole$1.default = _default$a;
  var docTipRole$1 = {};
  Object.defineProperty(docTipRole$1, "__esModule", {
    value: true
  });
  docTipRole$1.default = void 0;
  var docTipRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "help [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "note"]]
  };
  var _default$9 = docTipRole;
  docTipRole$1.default = _default$9;
  var docTocRole$1 = {};
  Object.defineProperty(docTocRole$1, "__esModule", {
    value: true
  });
  docTocRole$1.default = void 0;
  var docTocRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      concept: {
        name: "toc [EPUB-SSV]"
      },
      module: "EPUB"
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "landmark", "navigation"]]
  };
  var _default$8 = docTocRole;
  docTocRole$1.default = _default$8;
  Object.defineProperty(ariaDpubRoles$1, "__esModule", {
    value: true
  });
  ariaDpubRoles$1.default = void 0;
  var _docAbstractRole = _interopRequireDefault$5(docAbstractRole$1);
  var _docAcknowledgmentsRole = _interopRequireDefault$5(docAcknowledgmentsRole$1);
  var _docAfterwordRole = _interopRequireDefault$5(docAfterwordRole$1);
  var _docAppendixRole = _interopRequireDefault$5(docAppendixRole$1);
  var _docBacklinkRole = _interopRequireDefault$5(docBacklinkRole$1);
  var _docBiblioentryRole = _interopRequireDefault$5(docBiblioentryRole$1);
  var _docBibliographyRole = _interopRequireDefault$5(docBibliographyRole$1);
  var _docBibliorefRole = _interopRequireDefault$5(docBibliorefRole$1);
  var _docChapterRole = _interopRequireDefault$5(docChapterRole$1);
  var _docColophonRole = _interopRequireDefault$5(docColophonRole$1);
  var _docConclusionRole = _interopRequireDefault$5(docConclusionRole$1);
  var _docCoverRole = _interopRequireDefault$5(docCoverRole$1);
  var _docCreditRole = _interopRequireDefault$5(docCreditRole$1);
  var _docCreditsRole = _interopRequireDefault$5(docCreditsRole$1);
  var _docDedicationRole = _interopRequireDefault$5(docDedicationRole$1);
  var _docEndnoteRole = _interopRequireDefault$5(docEndnoteRole$1);
  var _docEndnotesRole = _interopRequireDefault$5(docEndnotesRole$1);
  var _docEpigraphRole = _interopRequireDefault$5(docEpigraphRole$1);
  var _docEpilogueRole = _interopRequireDefault$5(docEpilogueRole$1);
  var _docErrataRole = _interopRequireDefault$5(docErrataRole$1);
  var _docExampleRole = _interopRequireDefault$5(docExampleRole$1);
  var _docFootnoteRole = _interopRequireDefault$5(docFootnoteRole$1);
  var _docForewordRole = _interopRequireDefault$5(docForewordRole$1);
  var _docGlossaryRole = _interopRequireDefault$5(docGlossaryRole$1);
  var _docGlossrefRole = _interopRequireDefault$5(docGlossrefRole$1);
  var _docIndexRole = _interopRequireDefault$5(docIndexRole$1);
  var _docIntroductionRole = _interopRequireDefault$5(docIntroductionRole$1);
  var _docNoterefRole = _interopRequireDefault$5(docNoterefRole$1);
  var _docNoticeRole = _interopRequireDefault$5(docNoticeRole$1);
  var _docPagebreakRole = _interopRequireDefault$5(docPagebreakRole$1);
  var _docPagelistRole = _interopRequireDefault$5(docPagelistRole$1);
  var _docPartRole = _interopRequireDefault$5(docPartRole$1);
  var _docPrefaceRole = _interopRequireDefault$5(docPrefaceRole$1);
  var _docPrologueRole = _interopRequireDefault$5(docPrologueRole$1);
  var _docPullquoteRole = _interopRequireDefault$5(docPullquoteRole$1);
  var _docQnaRole = _interopRequireDefault$5(docQnaRole$1);
  var _docSubtitleRole = _interopRequireDefault$5(docSubtitleRole$1);
  var _docTipRole = _interopRequireDefault$5(docTipRole$1);
  var _docTocRole = _interopRequireDefault$5(docTocRole$1);
  function _interopRequireDefault$5(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var ariaDpubRoles = [["doc-abstract", _docAbstractRole.default], ["doc-acknowledgments", _docAcknowledgmentsRole.default], ["doc-afterword", _docAfterwordRole.default], ["doc-appendix", _docAppendixRole.default], ["doc-backlink", _docBacklinkRole.default], ["doc-biblioentry", _docBiblioentryRole.default], ["doc-bibliography", _docBibliographyRole.default], ["doc-biblioref", _docBibliorefRole.default], ["doc-chapter", _docChapterRole.default], ["doc-colophon", _docColophonRole.default], ["doc-conclusion", _docConclusionRole.default], ["doc-cover", _docCoverRole.default], ["doc-credit", _docCreditRole.default], ["doc-credits", _docCreditsRole.default], ["doc-dedication", _docDedicationRole.default], ["doc-endnote", _docEndnoteRole.default], ["doc-endnotes", _docEndnotesRole.default], ["doc-epigraph", _docEpigraphRole.default], ["doc-epilogue", _docEpilogueRole.default], ["doc-errata", _docErrataRole.default], ["doc-example", _docExampleRole.default], ["doc-footnote", _docFootnoteRole.default], ["doc-foreword", _docForewordRole.default], ["doc-glossary", _docGlossaryRole.default], ["doc-glossref", _docGlossrefRole.default], ["doc-index", _docIndexRole.default], ["doc-introduction", _docIntroductionRole.default], ["doc-noteref", _docNoterefRole.default], ["doc-notice", _docNoticeRole.default], ["doc-pagebreak", _docPagebreakRole.default], ["doc-pagelist", _docPagelistRole.default], ["doc-part", _docPartRole.default], ["doc-preface", _docPrefaceRole.default], ["doc-prologue", _docPrologueRole.default], ["doc-pullquote", _docPullquoteRole.default], ["doc-qna", _docQnaRole.default], ["doc-subtitle", _docSubtitleRole.default], ["doc-tip", _docTipRole.default], ["doc-toc", _docTocRole.default]];
  var _default$7 = ariaDpubRoles;
  ariaDpubRoles$1.default = _default$7;
  var ariaGraphicsRoles$1 = {};
  var graphicsDocumentRole$1 = {};
  Object.defineProperty(graphicsDocumentRole$1, "__esModule", {
    value: true
  });
  graphicsDocumentRole$1.default = void 0;
  var graphicsDocumentRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      module: "GRAPHICS",
      concept: {
        name: "graphics-object"
      }
    }, {
      module: "ARIA",
      concept: {
        name: "img"
      }
    }, {
      module: "ARIA",
      concept: {
        name: "article"
      }
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "document"]]
  };
  var _default$6 = graphicsDocumentRole;
  graphicsDocumentRole$1.default = _default$6;
  var graphicsObjectRole$1 = {};
  Object.defineProperty(graphicsObjectRole$1, "__esModule", {
    value: true
  });
  graphicsObjectRole$1.default = void 0;
  var graphicsObjectRole = {
    abstract: false,
    accessibleNameRequired: false,
    baseConcepts: [],
    childrenPresentational: false,
    nameFrom: ["author", "contents"],
    prohibitedProps: [],
    props: {
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [{
      module: "GRAPHICS",
      concept: {
        name: "graphics-document"
      }
    }, {
      module: "ARIA",
      concept: {
        name: "group"
      }
    }, {
      module: "ARIA",
      concept: {
        name: "img"
      }
    }, {
      module: "GRAPHICS",
      concept: {
        name: "graphics-symbol"
      }
    }],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "group"]]
  };
  var _default$5 = graphicsObjectRole;
  graphicsObjectRole$1.default = _default$5;
  var graphicsSymbolRole$1 = {};
  Object.defineProperty(graphicsSymbolRole$1, "__esModule", {
    value: true
  });
  graphicsSymbolRole$1.default = void 0;
  var graphicsSymbolRole = {
    abstract: false,
    accessibleNameRequired: true,
    baseConcepts: [],
    childrenPresentational: true,
    nameFrom: ["author"],
    prohibitedProps: [],
    props: {
      "aria-disabled": null,
      "aria-errormessage": null,
      "aria-expanded": null,
      "aria-haspopup": null,
      "aria-invalid": null
    },
    relatedConcepts: [],
    requireContextRole: [],
    requiredContextRole: [],
    requiredOwnedElements: [],
    requiredProps: {},
    superClass: [["roletype", "structure", "section", "img"]]
  };
  var _default$4 = graphicsSymbolRole;
  graphicsSymbolRole$1.default = _default$4;
  Object.defineProperty(ariaGraphicsRoles$1, "__esModule", {
    value: true
  });
  ariaGraphicsRoles$1.default = void 0;
  var _graphicsDocumentRole = _interopRequireDefault$4(graphicsDocumentRole$1);
  var _graphicsObjectRole = _interopRequireDefault$4(graphicsObjectRole$1);
  var _graphicsSymbolRole = _interopRequireDefault$4(graphicsSymbolRole$1);
  function _interopRequireDefault$4(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var ariaGraphicsRoles = [["graphics-document", _graphicsDocumentRole.default], ["graphics-object", _graphicsObjectRole.default], ["graphics-symbol", _graphicsSymbolRole.default]];
  var _default$3 = ariaGraphicsRoles;
  ariaGraphicsRoles$1.default = _default$3;
  Object.defineProperty(rolesMap$1, "__esModule", {
    value: true
  });
  rolesMap$1.default = void 0;
  var _ariaAbstractRoles = _interopRequireDefault$3(ariaAbstractRoles$1);
  var _ariaLiteralRoles = _interopRequireDefault$3(ariaLiteralRoles$1);
  var _ariaDpubRoles = _interopRequireDefault$3(ariaDpubRoles$1);
  var _ariaGraphicsRoles = _interopRequireDefault$3(ariaGraphicsRoles$1);
  var _iterationDecorator$2 = _interopRequireDefault$3(iterationDecorator$1);
  function _interopRequireDefault$3(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _createForOfIteratorHelper$2(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray$2(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        var F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        }, e: function e2(_e2) {
          throw _e2;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return { s: function s() {
      it = it.call(o);
    }, n: function n2() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    }, e: function e2(_e3) {
      didErr = true;
      err = _e3;
    }, f: function f2() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
  }
  function _slicedToArray$2(arr, i) {
    return _arrayWithHoles$2(arr) || _iterableToArrayLimit$2(arr, i) || _unsupportedIterableToArray$2(arr, i) || _nonIterableRest$2();
  }
  function _nonIterableRest$2() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _unsupportedIterableToArray$2(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$2(o, minLen);
    var n2 = Object.prototype.toString.call(o).slice(8, -1);
    if (n2 === "Object" && o.constructor) n2 = o.constructor.name;
    if (n2 === "Map" || n2 === "Set") return Array.from(o);
    if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$2(o, minLen);
  }
  function _arrayLikeToArray$2(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  function _iterableToArrayLimit$2(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles$2(arr) {
    if (Array.isArray(arr)) return arr;
  }
  var roles$1 = [].concat(_ariaAbstractRoles.default, _ariaLiteralRoles.default, _ariaDpubRoles.default, _ariaGraphicsRoles.default);
  roles$1.forEach(function(_ref) {
    var _ref2 = _slicedToArray$2(_ref, 2), roleDefinition = _ref2[1];
    var _iterator = _createForOfIteratorHelper$2(roleDefinition.superClass), _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done; ) {
        var superClassIter = _step.value;
        var _iterator2 = _createForOfIteratorHelper$2(superClassIter), _step2;
        try {
          var _loop = function _loop2() {
            var superClassName = _step2.value;
            var superClassRoleTuple = roles$1.find(function(_ref3) {
              var _ref4 = _slicedToArray$2(_ref3, 1), name = _ref4[0];
              return name === superClassName;
            });
            if (superClassRoleTuple) {
              var superClassDefinition = superClassRoleTuple[1];
              for (var _i2 = 0, _Object$keys = Object.keys(superClassDefinition.props); _i2 < _Object$keys.length; _i2++) {
                var prop = _Object$keys[_i2];
                if (
                  // $FlowIssue Accessing the hasOwnProperty on the Object prototype is fine.
                  !Object.prototype.hasOwnProperty.call(roleDefinition.props, prop)
                ) {
                  Object.assign(roleDefinition.props, _defineProperty({}, prop, superClassDefinition.props[prop]));
                }
              }
            }
          };
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done; ) {
            _loop();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  });
  var rolesMap = {
    entries: function entries3() {
      return roles$1;
    },
    forEach: function forEach3(fn) {
      var thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var _iterator3 = _createForOfIteratorHelper$2(roles$1), _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done; ) {
          var _step3$value = _slicedToArray$2(_step3.value, 2), key = _step3$value[0], values6 = _step3$value[1];
          fn.call(thisArg, values6, key, roles$1);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    get: function get3(key) {
      var item = roles$1.find(function(tuple) {
        return tuple[0] === key ? true : false;
      });
      return item && item[1];
    },
    has: function has3(key) {
      return !!rolesMap.get(key);
    },
    keys: function keys3() {
      return roles$1.map(function(_ref5) {
        var _ref6 = _slicedToArray$2(_ref5, 1), key = _ref6[0];
        return key;
      });
    },
    values: function values3() {
      return roles$1.map(function(_ref7) {
        var _ref8 = _slicedToArray$2(_ref7, 2), values6 = _ref8[1];
        return values6;
      });
    }
  };
  var _default$2 = (0, _iterationDecorator$2.default)(rolesMap, rolesMap.entries());
  rolesMap$1.default = _default$2;
  var elementRoleMap$1 = {};
  var lite = {};
  var has4 = Object.prototype.hasOwnProperty;
  function dequal(foo, bar) {
    var ctor, len;
    if (foo === bar) return true;
    if (foo && bar && (ctor = foo.constructor) === bar.constructor) {
      if (ctor === Date) return foo.getTime() === bar.getTime();
      if (ctor === RegExp) return foo.toString() === bar.toString();
      if (ctor === Array) {
        if ((len = foo.length) === bar.length) {
          while (len-- && dequal(foo[len], bar[len])) ;
        }
        return len === -1;
      }
      if (!ctor || typeof foo === "object") {
        len = 0;
        for (ctor in foo) {
          if (has4.call(foo, ctor) && ++len && !has4.call(bar, ctor)) return false;
          if (!(ctor in bar) || !dequal(foo[ctor], bar[ctor])) return false;
        }
        return Object.keys(bar).length === len;
      }
    }
    return foo !== foo && bar !== bar;
  }
  lite.dequal = dequal;
  Object.defineProperty(elementRoleMap$1, "__esModule", {
    value: true
  });
  elementRoleMap$1.default = void 0;
  var _lite = lite;
  var _iterationDecorator$1 = _interopRequireDefault$2(iterationDecorator$1);
  var _rolesMap$2 = _interopRequireDefault$2(rolesMap$1);
  function _interopRequireDefault$2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _slicedToArray$1(arr, i) {
    return _arrayWithHoles$1(arr) || _iterableToArrayLimit$1(arr, i) || _unsupportedIterableToArray$1(arr, i) || _nonIterableRest$1();
  }
  function _nonIterableRest$1() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit$1(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles$1(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _createForOfIteratorHelper$1(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        var F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        }, e: function e2(_e2) {
          throw _e2;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return { s: function s() {
      it = it.call(o);
    }, n: function n2() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    }, e: function e2(_e3) {
      didErr = true;
      err = _e3;
    }, f: function f2() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
  }
  function _unsupportedIterableToArray$1(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray$1(o, minLen);
    var n2 = Object.prototype.toString.call(o).slice(8, -1);
    if (n2 === "Object" && o.constructor) n2 = o.constructor.name;
    if (n2 === "Map" || n2 === "Set") return Array.from(o);
    if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray$1(o, minLen);
  }
  function _arrayLikeToArray$1(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var elementRoles$1 = [];
  var keys$1 = _rolesMap$2.default.keys();
  for (var i$1 = 0; i$1 < keys$1.length; i$1++) {
    var key$1 = keys$1[i$1];
    var role$1 = _rolesMap$2.default.get(key$1);
    if (role$1) {
      var concepts$1 = [].concat(role$1.baseConcepts, role$1.relatedConcepts);
      for (var k$1 = 0; k$1 < concepts$1.length; k$1++) {
        var relation$1 = concepts$1[k$1];
        if (relation$1.module === "HTML") {
          (function() {
            var concept = relation$1.concept;
            if (concept) {
              var elementRoleRelation = elementRoles$1.find(function(relation) {
                return (0, _lite.dequal)(relation, concept);
              });
              var roles2;
              if (elementRoleRelation) {
                roles2 = elementRoleRelation[1];
              } else {
                roles2 = [];
              }
              var isUnique = true;
              for (var _i = 0; _i < roles2.length; _i++) {
                if (roles2[_i] === key$1) {
                  isUnique = false;
                  break;
                }
              }
              if (isUnique) {
                roles2.push(key$1);
              }
              elementRoles$1.push([concept, roles2]);
            }
          })();
        }
      }
    }
  }
  var elementRoleMap = {
    entries: function entries4() {
      return elementRoles$1;
    },
    forEach: function forEach4(fn) {
      var thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var _iterator = _createForOfIteratorHelper$1(elementRoles$1), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var _step$value = _slicedToArray$1(_step.value, 2), _key = _step$value[0], values6 = _step$value[1];
          fn.call(thisArg, values6, _key, elementRoles$1);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    get: function get4(key) {
      var item = elementRoles$1.find(function(tuple) {
        return key.name === tuple[0].name && (0, _lite.dequal)(key.attributes, tuple[0].attributes);
      });
      return item && item[1];
    },
    has: function has5(key) {
      return !!elementRoleMap.get(key);
    },
    keys: function keys4() {
      return elementRoles$1.map(function(_ref) {
        var _ref2 = _slicedToArray$1(_ref, 1), key = _ref2[0];
        return key;
      });
    },
    values: function values4() {
      return elementRoles$1.map(function(_ref3) {
        var _ref4 = _slicedToArray$1(_ref3, 2), values6 = _ref4[1];
        return values6;
      });
    }
  };
  var _default$1 = (0, _iterationDecorator$1.default)(elementRoleMap, elementRoleMap.entries());
  elementRoleMap$1.default = _default$1;
  var roleElementMap$1 = {};
  Object.defineProperty(roleElementMap$1, "__esModule", {
    value: true
  });
  roleElementMap$1.default = void 0;
  var _iterationDecorator = _interopRequireDefault$1(iterationDecorator$1);
  var _rolesMap$1 = _interopRequireDefault$1(rolesMap$1);
  function _interopRequireDefault$1(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }
  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);
        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _createForOfIteratorHelper(o, allowArrayLike) {
    var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"];
    if (!it) {
      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike) {
        if (it) o = it;
        var i = 0;
        var F2 = function F3() {
        };
        return { s: F2, n: function n2() {
          if (i >= o.length) return { done: true };
          return { done: false, value: o[i++] };
        }, e: function e2(_e2) {
          throw _e2;
        }, f: F2 };
      }
      throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return { s: function s() {
      it = it.call(o);
    }, n: function n2() {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    }, e: function e2(_e3) {
      didErr = true;
      err = _e3;
    }, f: function f2() {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    } };
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n2 = Object.prototype.toString.call(o).slice(8, -1);
    if (n2 === "Object" && o.constructor) n2 = o.constructor.name;
    if (n2 === "Map" || n2 === "Set") return Array.from(o);
    if (n2 === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n2)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
  var roleElement = [];
  var keys5 = _rolesMap$1.default.keys();
  for (var i = 0; i < keys5.length; i++) {
    var key = keys5[i];
    var role = _rolesMap$1.default.get(key);
    var relationConcepts = [];
    if (role) {
      var concepts = [].concat(role.baseConcepts, role.relatedConcepts);
      for (var k = 0; k < concepts.length; k++) {
        var relation = concepts[k];
        if (relation.module === "HTML") {
          var concept = relation.concept;
          if (concept != null) {
            relationConcepts.push(concept);
          }
        }
      }
      if (relationConcepts.length > 0) {
        roleElement.push([key, relationConcepts]);
      }
    }
  }
  var roleElementMap = {
    entries: function entries5() {
      return roleElement;
    },
    forEach: function forEach5(fn) {
      var thisArg = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : null;
      var _iterator = _createForOfIteratorHelper(roleElement), _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done; ) {
          var _step$value = _slicedToArray(_step.value, 2), _key = _step$value[0], values6 = _step$value[1];
          fn.call(thisArg, values6, _key, roleElement);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    get: function get5(key) {
      var item = roleElement.find(function(tuple) {
        return tuple[0] === key ? true : false;
      });
      return item && item[1];
    },
    has: function has6(key) {
      return !!roleElementMap.get(key);
    },
    keys: function keys6() {
      return roleElement.map(function(_ref) {
        var _ref2 = _slicedToArray(_ref, 1), key = _ref2[0];
        return key;
      });
    },
    values: function values5() {
      return roleElement.map(function(_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2), values6 = _ref4[1];
        return values6;
      });
    }
  };
  var _default = (0, _iterationDecorator.default)(roleElementMap, roleElementMap.entries());
  roleElementMap$1.default = _default;
  Object.defineProperty(lib, "__esModule", {
    value: true
  });
  var roles_1 = lib.roles = roleElements_1 = lib.roleElements = elementRoles_1 = lib.elementRoles = lib.dom = lib.aria = void 0;
  var _ariaPropsMap = _interopRequireDefault(ariaPropsMap$1);
  var _domMap = _interopRequireDefault(domMap$1);
  var _rolesMap = _interopRequireDefault(rolesMap$1);
  var _elementRoleMap = _interopRequireDefault(elementRoleMap$1);
  var _roleElementMap = _interopRequireDefault(roleElementMap$1);
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  var aria = _ariaPropsMap.default;
  lib.aria = aria;
  var dom = _domMap.default;
  lib.dom = dom;
  var roles = _rolesMap.default;
  roles_1 = lib.roles = roles;
  var elementRoles = _elementRoleMap.default;
  var elementRoles_1 = lib.elementRoles = elementRoles;
  var roleElements = _roleElementMap.default;
  var roleElements_1 = lib.roleElements = roleElements;
  var lzString$1 = { exports: {} };
  (function(module2) {
    var LZString = function() {
      var f2 = String.fromCharCode;
      var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
      var baseReverseDic = {};
      function getBaseValue(alphabet, character) {
        if (!baseReverseDic[alphabet]) {
          baseReverseDic[alphabet] = {};
          for (var i = 0; i < alphabet.length; i++) {
            baseReverseDic[alphabet][alphabet.charAt(i)] = i;
          }
        }
        return baseReverseDic[alphabet][character];
      }
      var LZString2 = {
        compressToBase64: function(input2) {
          if (input2 == null) return "";
          var res = LZString2._compress(input2, 6, function(a) {
            return keyStrBase64.charAt(a);
          });
          switch (res.length % 4) {
            default:
            case 0:
              return res;
            case 1:
              return res + "===";
            case 2:
              return res + "==";
            case 3:
              return res + "=";
          }
        },
        decompressFromBase64: function(input2) {
          if (input2 == null) return "";
          if (input2 == "") return null;
          return LZString2._decompress(input2.length, 32, function(index) {
            return getBaseValue(keyStrBase64, input2.charAt(index));
          });
        },
        compressToUTF16: function(input2) {
          if (input2 == null) return "";
          return LZString2._compress(input2, 15, function(a) {
            return f2(a + 32);
          }) + " ";
        },
        decompressFromUTF16: function(compressed) {
          if (compressed == null) return "";
          if (compressed == "") return null;
          return LZString2._decompress(compressed.length, 16384, function(index) {
            return compressed.charCodeAt(index) - 32;
          });
        },
        //compress into uint8array (UCS-2 big endian format)
        compressToUint8Array: function(uncompressed) {
          var compressed = LZString2.compress(uncompressed);
          var buf = new Uint8Array(compressed.length * 2);
          for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
            var current_value = compressed.charCodeAt(i);
            buf[i * 2] = current_value >>> 8;
            buf[i * 2 + 1] = current_value % 256;
          }
          return buf;
        },
        //decompress from uint8array (UCS-2 big endian format)
        decompressFromUint8Array: function(compressed) {
          if (compressed === null || compressed === void 0) {
            return LZString2.decompress(compressed);
          } else {
            var buf = new Array(compressed.length / 2);
            for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) {
              buf[i] = compressed[i * 2] * 256 + compressed[i * 2 + 1];
            }
            var result = [];
            buf.forEach(function(c2) {
              result.push(f2(c2));
            });
            return LZString2.decompress(result.join(""));
          }
        },
        //compress into a string that is already URI encoded
        compressToEncodedURIComponent: function(input2) {
          if (input2 == null) return "";
          return LZString2._compress(input2, 6, function(a) {
            return keyStrUriSafe.charAt(a);
          });
        },
        //decompress from an output of compressToEncodedURIComponent
        decompressFromEncodedURIComponent: function(input2) {
          if (input2 == null) return "";
          if (input2 == "") return null;
          input2 = input2.replace(/ /g, "+");
          return LZString2._decompress(input2.length, 32, function(index) {
            return getBaseValue(keyStrUriSafe, input2.charAt(index));
          });
        },
        compress: function(uncompressed) {
          return LZString2._compress(uncompressed, 16, function(a) {
            return f2(a);
          });
        },
        _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
          if (uncompressed == null) return "";
          var i, value, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0, ii;
          for (ii = 0; ii < uncompressed.length; ii += 1) {
            context_c = uncompressed.charAt(ii);
            if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
              context_dictionary[context_c] = context_dictSize++;
              context_dictionaryToCreate[context_c] = true;
            }
            context_wc = context_w + context_c;
            if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
              context_w = context_wc;
            } else {
              if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                if (context_w.charCodeAt(0) < 256) {
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 8; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                } else {
                  value = 1;
                  for (i = 0; i < context_numBits; i++) {
                    context_data_val = context_data_val << 1 | value;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = 0;
                  }
                  value = context_w.charCodeAt(0);
                  for (i = 0; i < 16; i++) {
                    context_data_val = context_data_val << 1 | value & 1;
                    if (context_data_position == bitsPerChar - 1) {
                      context_data_position = 0;
                      context_data.push(getCharFromInt(context_data_val));
                      context_data_val = 0;
                    } else {
                      context_data_position++;
                    }
                    value = value >> 1;
                  }
                }
                context_enlargeIn--;
                if (context_enlargeIn == 0) {
                  context_enlargeIn = Math.pow(2, context_numBits);
                  context_numBits++;
                }
                delete context_dictionaryToCreate[context_w];
              } else {
                value = context_dictionary[context_w];
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              context_dictionary[context_wc] = context_dictSize++;
              context_w = String(context_c);
            }
          }
          if (context_w !== "") {
            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
              if (context_w.charCodeAt(0) < 256) {
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 8; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              } else {
                value = 1;
                for (i = 0; i < context_numBits; i++) {
                  context_data_val = context_data_val << 1 | value;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = 0;
                }
                value = context_w.charCodeAt(0);
                for (i = 0; i < 16; i++) {
                  context_data_val = context_data_val << 1 | value & 1;
                  if (context_data_position == bitsPerChar - 1) {
                    context_data_position = 0;
                    context_data.push(getCharFromInt(context_data_val));
                    context_data_val = 0;
                  } else {
                    context_data_position++;
                  }
                  value = value >> 1;
                }
              }
              context_enlargeIn--;
              if (context_enlargeIn == 0) {
                context_enlargeIn = Math.pow(2, context_numBits);
                context_numBits++;
              }
              delete context_dictionaryToCreate[context_w];
            } else {
              value = context_dictionary[context_w];
              for (i = 0; i < context_numBits; i++) {
                context_data_val = context_data_val << 1 | value & 1;
                if (context_data_position == bitsPerChar - 1) {
                  context_data_position = 0;
                  context_data.push(getCharFromInt(context_data_val));
                  context_data_val = 0;
                } else {
                  context_data_position++;
                }
                value = value >> 1;
              }
            }
            context_enlargeIn--;
            if (context_enlargeIn == 0) {
              context_enlargeIn = Math.pow(2, context_numBits);
              context_numBits++;
            }
          }
          value = 2;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = context_data_val << 1 | value & 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
          while (true) {
            context_data_val = context_data_val << 1;
            if (context_data_position == bitsPerChar - 1) {
              context_data.push(getCharFromInt(context_data_val));
              break;
            } else context_data_position++;
          }
          return context_data.join("");
        },
        decompress: function(compressed) {
          if (compressed == null) return "";
          if (compressed == "") return null;
          return LZString2._decompress(compressed.length, 32768, function(index) {
            return compressed.charCodeAt(index);
          });
        },
        _decompress: function(length, resetValue, getNextValue) {
          var dictionary = [], enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], i, w2, bits, resb, maxpower, power, c2, data2 = { val: getNextValue(0), position: resetValue, index: 1 };
          for (i = 0; i < 3; i += 1) {
            dictionary[i] = i;
          }
          bits = 0;
          maxpower = Math.pow(2, 2);
          power = 1;
          while (power != maxpower) {
            resb = data2.val & data2.position;
            data2.position >>= 1;
            if (data2.position == 0) {
              data2.position = resetValue;
              data2.val = getNextValue(data2.index++);
            }
            bits |= (resb > 0 ? 1 : 0) * power;
            power <<= 1;
          }
          switch (bits) {
            case 0:
              bits = 0;
              maxpower = Math.pow(2, 8);
              power = 1;
              while (power != maxpower) {
                resb = data2.val & data2.position;
                data2.position >>= 1;
                if (data2.position == 0) {
                  data2.position = resetValue;
                  data2.val = getNextValue(data2.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c2 = f2(bits);
              break;
            case 1:
              bits = 0;
              maxpower = Math.pow(2, 16);
              power = 1;
              while (power != maxpower) {
                resb = data2.val & data2.position;
                data2.position >>= 1;
                if (data2.position == 0) {
                  data2.position = resetValue;
                  data2.val = getNextValue(data2.index++);
                }
                bits |= (resb > 0 ? 1 : 0) * power;
                power <<= 1;
              }
              c2 = f2(bits);
              break;
            case 2:
              return "";
          }
          dictionary[3] = c2;
          w2 = c2;
          result.push(c2);
          while (true) {
            if (data2.index > length) {
              return "";
            }
            bits = 0;
            maxpower = Math.pow(2, numBits);
            power = 1;
            while (power != maxpower) {
              resb = data2.val & data2.position;
              data2.position >>= 1;
              if (data2.position == 0) {
                data2.position = resetValue;
                data2.val = getNextValue(data2.index++);
              }
              bits |= (resb > 0 ? 1 : 0) * power;
              power <<= 1;
            }
            switch (c2 = bits) {
              case 0:
                bits = 0;
                maxpower = Math.pow(2, 8);
                power = 1;
                while (power != maxpower) {
                  resb = data2.val & data2.position;
                  data2.position >>= 1;
                  if (data2.position == 0) {
                    data2.position = resetValue;
                    data2.val = getNextValue(data2.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f2(bits);
                c2 = dictSize - 1;
                enlargeIn--;
                break;
              case 1:
                bits = 0;
                maxpower = Math.pow(2, 16);
                power = 1;
                while (power != maxpower) {
                  resb = data2.val & data2.position;
                  data2.position >>= 1;
                  if (data2.position == 0) {
                    data2.position = resetValue;
                    data2.val = getNextValue(data2.index++);
                  }
                  bits |= (resb > 0 ? 1 : 0) * power;
                  power <<= 1;
                }
                dictionary[dictSize++] = f2(bits);
                c2 = dictSize - 1;
                enlargeIn--;
                break;
              case 2:
                return result.join("");
            }
            if (enlargeIn == 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
            if (dictionary[c2]) {
              entry = dictionary[c2];
            } else {
              if (c2 === dictSize) {
                entry = w2 + w2.charAt(0);
              } else {
                return null;
              }
            }
            result.push(entry);
            dictionary[dictSize++] = w2 + entry.charAt(0);
            enlargeIn--;
            w2 = entry;
            if (enlargeIn == 0) {
              enlargeIn = Math.pow(2, numBits);
              numBits++;
            }
          }
        }
      };
      return LZString2;
    }();
    if (module2 != null) {
      module2.exports = LZString;
    } else if (typeof angular !== "undefined" && angular != null) {
      angular.module("LZString", []).factory("LZString", function() {
        return LZString;
      });
    }
  })(lzString$1);
  var lzStringExports = lzString$1.exports;
  const lzString = /* @__PURE__ */ getDefaultExportFromCjs(lzStringExports);
  var define_process_env_default = {};
  function escapeHTML(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  const printProps = (keys7, props, config2, indentation, depth, refs, printer2) => {
    const indentationNext = indentation + config2.indent;
    const colors = config2.colors;
    return keys7.map((key) => {
      const value = props[key];
      let printed = printer2(value, config2, indentationNext, depth, refs);
      if (typeof value !== "string") {
        if (printed.indexOf("\n") !== -1) {
          printed = config2.spacingOuter + indentationNext + printed + config2.spacingOuter + indentation;
        }
        printed = "{" + printed + "}";
      }
      return config2.spacingInner + indentation + colors.prop.open + key + colors.prop.close + "=" + colors.value.open + printed + colors.value.close;
    }).join("");
  };
  const NodeTypeTextNode = 3;
  const printChildren = (children, config2, indentation, depth, refs, printer2) => children.map((child) => {
    const printedChild = typeof child === "string" ? printText(child, config2) : printer2(child, config2, indentation, depth, refs);
    if (printedChild === "" && typeof child === "object" && child !== null && child.nodeType !== NodeTypeTextNode) {
      return "";
    }
    return config2.spacingOuter + indentation + printedChild;
  }).join("");
  const printText = (text, config2) => {
    const contentColor = config2.colors.content;
    return contentColor.open + escapeHTML(text) + contentColor.close;
  };
  const printComment = (comment2, config2) => {
    const commentColor = config2.colors.comment;
    return commentColor.open + "<!--" + escapeHTML(comment2) + "-->" + commentColor.close;
  };
  const printElement = (type2, printedProps, printedChildren, config2, indentation) => {
    const tagColor = config2.colors.tag;
    return tagColor.open + "<" + type2 + (printedProps && tagColor.close + printedProps + config2.spacingOuter + indentation + tagColor.open) + (printedChildren ? ">" + tagColor.close + printedChildren + config2.spacingOuter + indentation + tagColor.open + "</" + type2 : (printedProps && !config2.min ? "" : " ") + "/") + ">" + tagColor.close;
  };
  const printElementAsLeaf = (type2, config2) => {
    const tagColor = config2.colors.tag;
    return tagColor.open + "<" + type2 + tagColor.close + " …" + tagColor.open + " />" + tagColor.close;
  };
  const ELEMENT_NODE$1 = 1;
  const TEXT_NODE$1 = 3;
  const COMMENT_NODE$1 = 8;
  const FRAGMENT_NODE = 11;
  const ELEMENT_REGEXP = /^((HTML|SVG)\w*)?Element$/;
  const isCustomElement = (val) => {
    const {
      tagName
    } = val;
    return Boolean(typeof tagName === "string" && tagName.includes("-") || typeof val.hasAttribute === "function" && val.hasAttribute("is"));
  };
  const testNode = (val) => {
    const constructorName = val.constructor.name;
    const {
      nodeType
    } = val;
    return nodeType === ELEMENT_NODE$1 && (ELEMENT_REGEXP.test(constructorName) || isCustomElement(val)) || nodeType === TEXT_NODE$1 && constructorName === "Text" || nodeType === COMMENT_NODE$1 && constructorName === "Comment" || nodeType === FRAGMENT_NODE && constructorName === "DocumentFragment";
  };
  function nodeIsText(node) {
    return node.nodeType === TEXT_NODE$1;
  }
  function nodeIsComment(node) {
    return node.nodeType === COMMENT_NODE$1;
  }
  function nodeIsFragment(node) {
    return node.nodeType === FRAGMENT_NODE;
  }
  function createDOMElementFilter(filterNode) {
    return {
      test: (val) => {
        var _val$constructor2;
        return ((val == null || (_val$constructor2 = val.constructor) == null ? void 0 : _val$constructor2.name) || isCustomElement(val)) && testNode(val);
      },
      serialize: (node, config2, indentation, depth, refs, printer2) => {
        if (nodeIsText(node)) {
          return printText(node.data, config2);
        }
        if (nodeIsComment(node)) {
          return printComment(node.data, config2);
        }
        const type2 = nodeIsFragment(node) ? "DocumentFragment" : node.tagName.toLowerCase();
        if (++depth > config2.maxDepth) {
          return printElementAsLeaf(type2, config2);
        }
        return printElement(type2, printProps(nodeIsFragment(node) ? [] : Array.from(node.attributes).map((attr) => attr.name).sort(), nodeIsFragment(node) ? {} : Array.from(node.attributes).reduce((props, attribute) => {
          props[attribute.name] = attribute.value;
          return props;
        }, {}), config2, indentation + config2.indent, depth, refs, printer2), printChildren(Array.prototype.slice.call(node.childNodes || node.children).filter(filterNode), config2, indentation + config2.indent, depth, refs, printer2), config2, indentation);
      }
    };
  }
  let picocolors = null;
  let readFileSync = null;
  let codeFrameColumns = null;
  try {
    const nodeRequire = module && module.require;
    readFileSync = nodeRequire.call(module, "fs").readFileSync;
    codeFrameColumns = nodeRequire.call(module, "@babel/code-frame").codeFrameColumns;
    picocolors = nodeRequire.call(module, "picocolors");
  } catch {
  }
  function getCodeFrame(frame) {
    const locationStart = frame.indexOf("(") + 1;
    const locationEnd = frame.indexOf(")");
    const frameLocation = frame.slice(locationStart, locationEnd);
    const frameLocationElements = frameLocation.split(":");
    const [filename, line, column] = [frameLocationElements[0], parseInt(frameLocationElements[1], 10), parseInt(frameLocationElements[2], 10)];
    let rawFileContents = "";
    try {
      rawFileContents = readFileSync(filename, "utf-8");
    } catch {
      return "";
    }
    const codeFrame = codeFrameColumns(rawFileContents, {
      start: {
        line,
        column
      }
    }, {
      highlightCode: true,
      linesBelow: 0
    });
    return picocolors.dim(frameLocation) + "\n" + codeFrame + "\n";
  }
  function getUserCodeFrame() {
    if (!readFileSync || !codeFrameColumns) {
      return "";
    }
    const err = new Error();
    const firstClientCodeFrame = err.stack.split("\n").slice(1).find((frame) => !frame.includes("node_modules/"));
    return getCodeFrame(firstClientCodeFrame);
  }
  const TEXT_NODE = 3;
  function jestFakeTimersAreEnabled() {
    if (typeof jest !== "undefined" && jest !== null) {
      return (
        // legacy timers
        setTimeout._isMockFunction === true || // modern timers
        // eslint-disable-next-line prefer-object-has-own -- not supported by our support matrix
        Object.prototype.hasOwnProperty.call(setTimeout, "clock")
      );
    }
    return false;
  }
  function getDocument$1() {
    if (typeof window === "undefined") {
      throw new Error("Could not find default container");
    }
    return window.document;
  }
  function getWindowFromNode(node) {
    if (node.defaultView) {
      return node.defaultView;
    } else if (node.ownerDocument && node.ownerDocument.defaultView) {
      return node.ownerDocument.defaultView;
    } else if (node.window) {
      return node.window;
    } else if (node.ownerDocument && node.ownerDocument.defaultView === null) {
      throw new Error("It looks like the window object is not available for the provided node.");
    } else if (node.then instanceof Function) {
      throw new Error("It looks like you passed a Promise object instead of a DOM node. Did you do something like `fireEvent.click(screen.findBy...` when you meant to use a `getBy` query `fireEvent.click(screen.getBy...`, or await the findBy query `fireEvent.click(await screen.findBy...`?");
    } else if (Array.isArray(node)) {
      throw new Error("It looks like you passed an Array instead of a DOM node. Did you do something like `fireEvent.click(screen.getAllBy...` when you meant to use a `getBy` query `fireEvent.click(screen.getBy...`?");
    } else if (typeof node.debug === "function" && typeof node.logTestingPlaygroundURL === "function") {
      throw new Error("It looks like you passed a `screen` object. Did you do something like `fireEvent.click(screen, ...` when you meant to use a query, e.g. `fireEvent.click(screen.getBy..., `?");
    } else {
      throw new Error("The given node is not an Element, the node type is: " + typeof node + ".");
    }
  }
  function checkContainerType(container) {
    if (!container || !(typeof container.querySelector === "function") || !(typeof container.querySelectorAll === "function")) {
      throw new TypeError("Expected container to be an Element, a Document or a DocumentFragment but got " + getTypeName(container) + ".");
    }
    function getTypeName(object) {
      if (typeof object === "object") {
        return object === null ? "null" : object.constructor.name;
      }
      return typeof object;
    }
  }
  const shouldHighlight = () => {
    if (typeof process === "undefined") {
      return false;
    }
    let colors;
    try {
      var _process$env;
      const colorsJSON = (_process$env = define_process_env_default) == null ? void 0 : _process$env.COLORS;
      if (colorsJSON) {
        colors = JSON.parse(colorsJSON);
      }
    } catch {
    }
    if (typeof colors === "boolean") {
      return colors;
    } else {
      return process.versions !== void 0 && process.versions.node !== void 0;
    }
  };
  const {
    DOMCollection
  } = plugins_1;
  const ELEMENT_NODE = 1;
  const COMMENT_NODE = 8;
  function filterCommentsAndDefaultIgnoreTagsTags(value) {
    return value.nodeType !== COMMENT_NODE && (value.nodeType !== ELEMENT_NODE || !value.matches(getConfig().defaultIgnore));
  }
  function prettyDOM(dom2, maxLength, options) {
    if (options === void 0) {
      options = {};
    }
    if (!dom2) {
      dom2 = getDocument$1().body;
    }
    if (typeof maxLength !== "number") {
      maxLength = typeof process !== "undefined" && typeof define_process_env_default !== "undefined" && define_process_env_default.DEBUG_PRINT_LIMIT || 7e3;
    }
    if (maxLength === 0) {
      return "";
    }
    if (dom2.documentElement) {
      dom2 = dom2.documentElement;
    }
    let domTypeName = typeof dom2;
    if (domTypeName === "object") {
      domTypeName = dom2.constructor.name;
    } else {
      dom2 = {};
    }
    if (!("outerHTML" in dom2)) {
      throw new TypeError("Expected an element or document but got " + domTypeName);
    }
    const {
      filterNode = filterCommentsAndDefaultIgnoreTagsTags,
      ...prettyFormatOptions
    } = options;
    const debugContent = format_1(dom2, {
      plugins: [createDOMElementFilter(filterNode), DOMCollection],
      printFunctionName: false,
      highlight: shouldHighlight(),
      ...prettyFormatOptions
    });
    return maxLength !== void 0 && dom2.outerHTML.length > maxLength ? debugContent.slice(0, maxLength) + "..." : debugContent;
  }
  const logDOM = function() {
    const userCodeFrame = getUserCodeFrame();
    if (userCodeFrame) {
      console.log(prettyDOM(...arguments) + "\n\n" + userCodeFrame);
    } else {
      console.log(prettyDOM(...arguments));
    }
  };
  let config = {
    testIdAttribute: "data-testid",
    asyncUtilTimeout: 1e3,
    // asyncWrapper and advanceTimersWrapper is to support React's async `act` function.
    // forcing react-testing-library to wrap all async functions would've been
    // a total nightmare (consider wrapping every findBy* query and then also
    // updating `within` so those would be wrapped too. Total nightmare).
    // so we have this config option that's really only intended for
    // react-testing-library to use. For that reason, this feature will remain
    // undocumented.
    asyncWrapper: (cb) => cb(),
    unstable_advanceTimersWrapper: (cb) => cb(),
    eventWrapper: (cb) => cb(),
    // default value for the `hidden` option in `ByRole` queries
    defaultHidden: false,
    // default value for the `ignore` option in `ByText` queries
    defaultIgnore: "script, style",
    // showOriginalStackTrace flag to show the full error stack traces for async errors
    showOriginalStackTrace: false,
    // throw errors w/ suggestions for better queries. Opt in so off by default.
    throwSuggestions: false,
    // called when getBy* queries fail. (message, container) => Error
    getElementError(message, container) {
      const prettifiedDOM = prettyDOM(container);
      const error = new Error([message, "Ignored nodes: comments, " + config.defaultIgnore + "\n" + prettifiedDOM].filter(Boolean).join("\n\n"));
      error.name = "TestingLibraryElementError";
      return error;
    },
    _disableExpensiveErrorDiagnostics: false,
    computedStyleSupportsPseudoElements: false
  };
  function runWithExpensiveErrorDiagnosticsDisabled(callback) {
    try {
      config._disableExpensiveErrorDiagnostics = true;
      return callback();
    } finally {
      config._disableExpensiveErrorDiagnostics = false;
    }
  }
  function getConfig() {
    return config;
  }
  const labelledNodeNames = ["button", "meter", "output", "progress", "select", "textarea", "input"];
  function getTextContent(node) {
    if (labelledNodeNames.includes(node.nodeName.toLowerCase())) {
      return "";
    }
    if (node.nodeType === TEXT_NODE) return node.textContent;
    return Array.from(node.childNodes).map((childNode) => getTextContent(childNode)).join("");
  }
  function getLabelContent(element) {
    let textContent;
    if (element.tagName.toLowerCase() === "label") {
      textContent = getTextContent(element);
    } else {
      textContent = element.value || element.textContent;
    }
    return textContent;
  }
  function getRealLabels(element) {
    if (element.labels !== void 0) {
      var _labels;
      return (_labels = element.labels) != null ? _labels : [];
    }
    if (!isLabelable(element)) return [];
    const labels = element.ownerDocument.querySelectorAll("label");
    return Array.from(labels).filter((label) => label.control === element);
  }
  function isLabelable(element) {
    return /BUTTON|METER|OUTPUT|PROGRESS|SELECT|TEXTAREA/.test(element.tagName) || element.tagName === "INPUT" && element.getAttribute("type") !== "hidden";
  }
  function getLabels(container, element, _temp) {
    let {
      selector = "*"
    } = _temp === void 0 ? {} : _temp;
    const ariaLabelledBy = element.getAttribute("aria-labelledby");
    const labelsId = ariaLabelledBy ? ariaLabelledBy.split(" ") : [];
    return labelsId.length ? labelsId.map((labelId) => {
      const labellingElement = container.querySelector('[id="' + labelId + '"]');
      return labellingElement ? {
        content: getLabelContent(labellingElement),
        formControl: null
      } : {
        content: "",
        formControl: null
      };
    }) : Array.from(getRealLabels(element)).map((label) => {
      const textToMatch = getLabelContent(label);
      const formControlSelector = "button, input, meter, output, progress, select, textarea";
      const labelledFormControl = Array.from(label.querySelectorAll(formControlSelector)).filter((formControlElement) => formControlElement.matches(selector))[0];
      return {
        content: textToMatch,
        formControl: labelledFormControl
      };
    });
  }
  function assertNotNullOrUndefined(matcher) {
    if (matcher === null || matcher === void 0) {
      throw new Error(
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions -- implicitly converting `T` to `string`
        "It looks like " + matcher + " was passed instead of a matcher. Did you do something like getByText(" + matcher + ")?"
      );
    }
  }
  function fuzzyMatches(textToMatch, node, matcher, normalizer) {
    if (typeof textToMatch !== "string") {
      return false;
    }
    assertNotNullOrUndefined(matcher);
    const normalizedText = normalizer(textToMatch);
    if (typeof matcher === "string" || typeof matcher === "number") {
      return normalizedText.toLowerCase().includes(matcher.toString().toLowerCase());
    } else if (typeof matcher === "function") {
      return matcher(normalizedText, node);
    } else {
      return matchRegExp(matcher, normalizedText);
    }
  }
  function matches(textToMatch, node, matcher, normalizer) {
    if (typeof textToMatch !== "string") {
      return false;
    }
    assertNotNullOrUndefined(matcher);
    const normalizedText = normalizer(textToMatch);
    if (matcher instanceof Function) {
      return matcher(normalizedText, node);
    } else if (matcher instanceof RegExp) {
      return matchRegExp(matcher, normalizedText);
    } else {
      return normalizedText === String(matcher);
    }
  }
  function getDefaultNormalizer(_temp) {
    let {
      trim = true,
      collapseWhitespace = true
    } = _temp === void 0 ? {} : _temp;
    return (text) => {
      let normalizedText = text;
      normalizedText = trim ? normalizedText.trim() : normalizedText;
      normalizedText = collapseWhitespace ? normalizedText.replace(/\s+/g, " ") : normalizedText;
      return normalizedText;
    };
  }
  function makeNormalizer(_ref) {
    let {
      trim,
      collapseWhitespace,
      normalizer
    } = _ref;
    if (!normalizer) {
      return getDefaultNormalizer({
        trim,
        collapseWhitespace
      });
    }
    if (typeof trim !== "undefined" || typeof collapseWhitespace !== "undefined") {
      throw new Error('trim and collapseWhitespace are not supported with a normalizer. If you want to use the default trim and collapseWhitespace logic in your normalizer, use "getDefaultNormalizer({trim, collapseWhitespace})" and compose that into your normalizer');
    }
    return normalizer;
  }
  function matchRegExp(matcher, text) {
    const match = matcher.test(text);
    if (matcher.global && matcher.lastIndex !== 0) {
      console.warn("To match all elements we had to reset the lastIndex of the RegExp because the global flag is enabled. We encourage to remove the global flag from the RegExp.");
      matcher.lastIndex = 0;
    }
    return match;
  }
  function getNodeText(node) {
    if (node.matches("input[type=submit], input[type=button], input[type=reset]")) {
      return node.value;
    }
    return Array.from(node.childNodes).filter((child) => child.nodeType === TEXT_NODE && Boolean(child.textContent)).map((c2) => c2.textContent).join("");
  }
  const elementRoleList = buildElementRoleList(elementRoles_1);
  function isSubtreeInaccessible(element) {
    if (element.hidden === true) {
      return true;
    }
    if (element.getAttribute("aria-hidden") === "true") {
      return true;
    }
    const window2 = element.ownerDocument.defaultView;
    if (window2.getComputedStyle(element).display === "none") {
      return true;
    }
    return false;
  }
  function isInaccessible(element, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      isSubtreeInaccessible: isSubtreeInaccessibleImpl = isSubtreeInaccessible
    } = options;
    const window2 = element.ownerDocument.defaultView;
    if (window2.getComputedStyle(element).visibility === "hidden") {
      return true;
    }
    let currentElement = element;
    while (currentElement) {
      if (isSubtreeInaccessibleImpl(currentElement)) {
        return true;
      }
      currentElement = currentElement.parentElement;
    }
    return false;
  }
  function getImplicitAriaRoles(currentNode) {
    for (const {
      match,
      roles: roles2
    } of elementRoleList) {
      if (match(currentNode)) {
        return [...roles2];
      }
    }
    return [];
  }
  function buildElementRoleList(elementRolesMap) {
    function makeElementSelector(_ref) {
      let {
        name,
        attributes
      } = _ref;
      return "" + name + attributes.map((_ref2) => {
        let {
          name: attributeName,
          value,
          constraints = []
        } = _ref2;
        const shouldNotExist = constraints.indexOf("undefined") !== -1;
        const shouldBeNonEmpty = constraints.indexOf("set") !== -1;
        const hasExplicitValue = typeof value !== "undefined";
        if (hasExplicitValue) {
          return "[" + attributeName + '="' + value + '"]';
        } else if (shouldNotExist) {
          return ":not([" + attributeName + "])";
        } else if (shouldBeNonEmpty) {
          return "[" + attributeName + "]:not([" + attributeName + '=""])';
        }
        return "[" + attributeName + "]";
      }).join("");
    }
    function getSelectorSpecificity(_ref3) {
      let {
        attributes = []
      } = _ref3;
      return attributes.length;
    }
    function bySelectorSpecificity(_ref4, _ref5) {
      let {
        specificity: leftSpecificity
      } = _ref4;
      let {
        specificity: rightSpecificity
      } = _ref5;
      return rightSpecificity - leftSpecificity;
    }
    function match(element) {
      let {
        attributes = []
      } = element;
      const typeTextIndex = attributes.findIndex((attribute) => attribute.value && attribute.name === "type" && attribute.value === "text");
      if (typeTextIndex >= 0) {
        attributes = [...attributes.slice(0, typeTextIndex), ...attributes.slice(typeTextIndex + 1)];
      }
      const selector = makeElementSelector({
        ...element,
        attributes
      });
      return (node) => {
        if (typeTextIndex >= 0 && node.type !== "text") {
          return false;
        }
        return node.matches(selector);
      };
    }
    let result = [];
    for (const [element, roles2] of elementRolesMap.entries()) {
      result = [...result, {
        match: match(element),
        roles: Array.from(roles2),
        specificity: getSelectorSpecificity(element)
      }];
    }
    return result.sort(bySelectorSpecificity);
  }
  function getRoles(container, _temp) {
    let {
      hidden = false
    } = _temp === void 0 ? {} : _temp;
    function flattenDOM(node) {
      return [node, ...Array.from(node.children).reduce((acc, child) => [...acc, ...flattenDOM(child)], [])];
    }
    return flattenDOM(container).filter((element) => {
      return hidden === false ? isInaccessible(element) === false : true;
    }).reduce((acc, node) => {
      let roles2 = [];
      if (node.hasAttribute("role")) {
        roles2 = node.getAttribute("role").split(" ").slice(0, 1);
      } else {
        roles2 = getImplicitAriaRoles(node);
      }
      return roles2.reduce((rolesAcc, role) => Array.isArray(rolesAcc[role]) ? {
        ...rolesAcc,
        [role]: [...rolesAcc[role], node]
      } : {
        ...rolesAcc,
        [role]: [node]
      }, acc);
    }, {});
  }
  function prettyRoles(dom2, _ref6) {
    let {
      hidden,
      includeDescription
    } = _ref6;
    const roles2 = getRoles(dom2, {
      hidden
    });
    return Object.entries(roles2).filter((_ref7) => {
      let [role] = _ref7;
      return role !== "generic";
    }).map((_ref8) => {
      let [role, elements] = _ref8;
      const delimiterBar = "-".repeat(50);
      const elementsString = elements.map((el) => {
        const nameString = 'Name "' + computeAccessibleName(el, {
          computedStyleSupportsPseudoElements: getConfig().computedStyleSupportsPseudoElements
        }) + '":\n';
        const domString = prettyDOM(el.cloneNode(false));
        if (includeDescription) {
          const descriptionString = 'Description "' + computeAccessibleDescription(el, {
            computedStyleSupportsPseudoElements: getConfig().computedStyleSupportsPseudoElements
          }) + '":\n';
          return "" + nameString + descriptionString + domString;
        }
        return "" + nameString + domString;
      }).join("\n\n");
      return role + ":\n\n" + elementsString + "\n\n" + delimiterBar;
    }).join("\n");
  }
  function computeAriaSelected(element) {
    if (element.tagName === "OPTION") {
      return element.selected;
    }
    return checkBooleanAttribute(element, "aria-selected");
  }
  function computeAriaBusy(element) {
    return element.getAttribute("aria-busy") === "true";
  }
  function computeAriaChecked(element) {
    if ("indeterminate" in element && element.indeterminate) {
      return void 0;
    }
    if ("checked" in element) {
      return element.checked;
    }
    return checkBooleanAttribute(element, "aria-checked");
  }
  function computeAriaPressed(element) {
    return checkBooleanAttribute(element, "aria-pressed");
  }
  function computeAriaCurrent(element) {
    var _ref9, _checkBooleanAttribut;
    return (_ref9 = (_checkBooleanAttribut = checkBooleanAttribute(element, "aria-current")) != null ? _checkBooleanAttribut : element.getAttribute("aria-current")) != null ? _ref9 : false;
  }
  function computeAriaExpanded(element) {
    return checkBooleanAttribute(element, "aria-expanded");
  }
  function checkBooleanAttribute(element, attribute) {
    const attributeValue = element.getAttribute(attribute);
    if (attributeValue === "true") {
      return true;
    }
    if (attributeValue === "false") {
      return false;
    }
    return void 0;
  }
  function computeHeadingLevel(element) {
    const implicitHeadingLevels = {
      H1: 1,
      H2: 2,
      H3: 3,
      H4: 4,
      H5: 5,
      H6: 6
    };
    const ariaLevelAttribute = element.getAttribute("aria-level") && Number(element.getAttribute("aria-level"));
    return ariaLevelAttribute || implicitHeadingLevels[element.tagName];
  }
  function computeAriaValueNow(element) {
    const valueNow = element.getAttribute("aria-valuenow");
    return valueNow === null ? void 0 : +valueNow;
  }
  function computeAriaValueMax(element) {
    const valueMax = element.getAttribute("aria-valuemax");
    return valueMax === null ? void 0 : +valueMax;
  }
  function computeAriaValueMin(element) {
    const valueMin = element.getAttribute("aria-valuemin");
    return valueMin === null ? void 0 : +valueMin;
  }
  function computeAriaValueText(element) {
    const valueText = element.getAttribute("aria-valuetext");
    return valueText === null ? void 0 : valueText;
  }
  const normalize$1 = getDefaultNormalizer();
  function escapeRegExp(string) {
    return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
  }
  function getRegExpMatcher(string) {
    return new RegExp(escapeRegExp(string.toLowerCase()), "i");
  }
  function makeSuggestion(queryName, element, content, _ref) {
    let {
      variant,
      name
    } = _ref;
    let warning = "";
    const queryOptions = {};
    const queryArgs = [["Role", "TestId"].includes(queryName) ? content : getRegExpMatcher(content)];
    if (name) {
      queryOptions.name = getRegExpMatcher(name);
    }
    if (queryName === "Role" && isInaccessible(element)) {
      queryOptions.hidden = true;
      warning = "Element is inaccessible. This means that the element and all its children are invisible to screen readers.\n    If you are using the aria-hidden prop, make sure this is the right choice for your case.\n    ";
    }
    if (Object.keys(queryOptions).length > 0) {
      queryArgs.push(queryOptions);
    }
    const queryMethod = variant + "By" + queryName;
    return {
      queryName,
      queryMethod,
      queryArgs,
      variant,
      warning,
      toString() {
        if (warning) {
          console.warn(warning);
        }
        let [text, options] = queryArgs;
        text = typeof text === "string" ? "'" + text + "'" : text;
        options = options ? ", { " + Object.entries(options).map((_ref2) => {
          let [k, v2] = _ref2;
          return k + ": " + v2;
        }).join(", ") + " }" : "";
        return queryMethod + "(" + text + options + ")";
      }
    };
  }
  function canSuggest(currentMethod, requestedMethod, data2) {
    return data2 && true;
  }
  function getSuggestedQuery(element, variant, method) {
    var _element$getAttribute, _getImplicitAriaRoles;
    if (variant === void 0) {
      variant = "get";
    }
    if (element.matches(getConfig().defaultIgnore)) {
      return void 0;
    }
    const role = (_element$getAttribute = element.getAttribute("role")) != null ? _element$getAttribute : (_getImplicitAriaRoles = getImplicitAriaRoles(element)) == null ? void 0 : _getImplicitAriaRoles[0];
    if (role !== "generic" && canSuggest("Role", method, role)) {
      return makeSuggestion("Role", element, role, {
        variant,
        name: computeAccessibleName(element, {
          computedStyleSupportsPseudoElements: getConfig().computedStyleSupportsPseudoElements
        })
      });
    }
    const labelText = getLabels(document, element).map((label) => label.content).join(" ");
    if (canSuggest("LabelText", method, labelText)) {
      return makeSuggestion("LabelText", element, labelText, {
        variant
      });
    }
    const placeholderText = element.getAttribute("placeholder");
    if (canSuggest("PlaceholderText", method, placeholderText)) {
      return makeSuggestion("PlaceholderText", element, placeholderText, {
        variant
      });
    }
    const textContent = normalize$1(getNodeText(element));
    if (canSuggest("Text", method, textContent)) {
      return makeSuggestion("Text", element, textContent, {
        variant
      });
    }
    if (canSuggest("DisplayValue", method, element.value)) {
      return makeSuggestion("DisplayValue", element, normalize$1(element.value), {
        variant
      });
    }
    const alt = element.getAttribute("alt");
    if (canSuggest("AltText", method, alt)) {
      return makeSuggestion("AltText", element, alt, {
        variant
      });
    }
    const title2 = element.getAttribute("title");
    if (canSuggest("Title", method, title2)) {
      return makeSuggestion("Title", element, title2, {
        variant
      });
    }
    const testId = element.getAttribute(getConfig().testIdAttribute);
    if (canSuggest("TestId", method, testId)) {
      return makeSuggestion("TestId", element, testId, {
        variant
      });
    }
    return void 0;
  }
  function copyStackTrace(target, source) {
    target.stack = source.stack.replace(source.message, target.message);
  }
  function waitFor(callback, _ref) {
    let {
      container = getDocument$1(),
      timeout = getConfig().asyncUtilTimeout,
      showOriginalStackTrace = getConfig().showOriginalStackTrace,
      stackTraceError,
      interval = 50,
      onTimeout = (error) => {
        Object.defineProperty(error, "message", {
          value: getConfig().getElementError(error.message, container).message
        });
        return error;
      },
      mutationObserverOptions = {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true
      }
    } = _ref;
    if (typeof callback !== "function") {
      throw new TypeError("Received `callback` arg must be a function");
    }
    return new Promise(async (resolve2, reject) => {
      let lastError, intervalId, observer;
      let finished = false;
      let promiseStatus = "idle";
      const overallTimeoutTimer = setTimeout(handleTimeout, timeout);
      const usingJestFakeTimers = jestFakeTimersAreEnabled();
      if (usingJestFakeTimers) {
        const {
          unstable_advanceTimersWrapper: advanceTimersWrapper
        } = getConfig();
        checkCallback();
        while (!finished) {
          if (!jestFakeTimersAreEnabled()) {
            const error = new Error("Changed from using fake timers to real timers while using waitFor. This is not allowed and will result in very strange behavior. Please ensure you're awaiting all async things your test is doing before changing to real timers. For more info, please go to https://github.com/testing-library/dom-testing-library/issues/830");
            if (!showOriginalStackTrace) copyStackTrace(error, stackTraceError);
            reject(error);
            return;
          }
          await advanceTimersWrapper(async () => {
            jest.advanceTimersByTime(interval);
          });
          if (finished) {
            break;
          }
          checkCallback();
        }
      } else {
        try {
          checkContainerType(container);
        } catch (e2) {
          reject(e2);
          return;
        }
        intervalId = setInterval(checkRealTimersCallback, interval);
        const {
          MutationObserver
        } = getWindowFromNode(container);
        observer = new MutationObserver(checkRealTimersCallback);
        observer.observe(container, mutationObserverOptions);
        checkCallback();
      }
      function onDone(error, result) {
        finished = true;
        clearTimeout(overallTimeoutTimer);
        if (!usingJestFakeTimers) {
          clearInterval(intervalId);
          observer.disconnect();
        }
        if (error) {
          reject(error);
        } else {
          resolve2(result);
        }
      }
      function checkRealTimersCallback() {
        if (jestFakeTimersAreEnabled()) {
          const error = new Error("Changed from using real timers to fake timers while using waitFor. This is not allowed and will result in very strange behavior. Please ensure you're awaiting all async things your test is doing before changing to fake timers. For more info, please go to https://github.com/testing-library/dom-testing-library/issues/830");
          if (!showOriginalStackTrace) copyStackTrace(error, stackTraceError);
          return reject(error);
        } else {
          return checkCallback();
        }
      }
      function checkCallback() {
        if (promiseStatus === "pending") return;
        try {
          const result = runWithExpensiveErrorDiagnosticsDisabled(callback);
          if (typeof (result == null ? void 0 : result.then) === "function") {
            promiseStatus = "pending";
            result.then((resolvedValue) => {
              promiseStatus = "resolved";
              onDone(null, resolvedValue);
            }, (rejectedValue) => {
              promiseStatus = "rejected";
              lastError = rejectedValue;
            });
          } else {
            onDone(null, result);
          }
        } catch (error) {
          lastError = error;
        }
      }
      function handleTimeout() {
        let error;
        if (lastError) {
          error = lastError;
          if (!showOriginalStackTrace && error.name === "TestingLibraryElementError") {
            copyStackTrace(error, stackTraceError);
          }
        } else {
          error = new Error("Timed out in waitFor.");
          if (!showOriginalStackTrace) {
            copyStackTrace(error, stackTraceError);
          }
        }
        onDone(onTimeout(error), null);
      }
    });
  }
  function waitForWrapper(callback, options) {
    const stackTraceError = new Error("STACK_TRACE_MESSAGE");
    return getConfig().asyncWrapper(() => waitFor(callback, {
      stackTraceError,
      ...options
    }));
  }
  function getElementError(message, container) {
    return getConfig().getElementError(message, container);
  }
  function getMultipleElementsFoundError(message, container) {
    return getElementError(message + "\n\n(If this is intentional, then use the `*AllBy*` variant of the query (like `queryAllByText`, `getAllByText`, or `findAllByText`)).", container);
  }
  function queryAllByAttribute(attribute, container, text, _temp) {
    let {
      exact = true,
      collapseWhitespace,
      trim,
      normalizer
    } = _temp === void 0 ? {} : _temp;
    const matcher = exact ? matches : fuzzyMatches;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    return Array.from(container.querySelectorAll("[" + attribute + "]")).filter((node) => matcher(node.getAttribute(attribute), node, text, matchNormalizer));
  }
  function makeSingleQuery(allQuery, getMultipleError2) {
    return function(container) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      const els = allQuery(container, ...args);
      if (els.length > 1) {
        const elementStrings = els.map((element) => getElementError(null, element).message).join("\n\n");
        throw getMultipleElementsFoundError(getMultipleError2(container, ...args) + "\n\nHere are the matching elements:\n\n" + elementStrings, container);
      }
      return els[0] || null;
    };
  }
  function getSuggestionError(suggestion, container) {
    return getConfig().getElementError("A better query is available, try this:\n" + suggestion.toString() + "\n", container);
  }
  function makeGetAllQuery(allQuery, getMissingError2) {
    return function(container) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      const els = allQuery(container, ...args);
      if (!els.length) {
        throw getConfig().getElementError(getMissingError2(container, ...args), container);
      }
      return els;
    };
  }
  function makeFindQuery(getter) {
    return (container, text, options, waitForOptions) => {
      return waitForWrapper(() => {
        return getter(container, text, options);
      }, {
        container,
        ...waitForOptions
      });
    };
  }
  const wrapSingleQueryWithSuggestion = (query, queryAllByName, variant) => function(container) {
    for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      args[_key3 - 1] = arguments[_key3];
    }
    const element = query(container, ...args);
    const [{
      suggest = getConfig().throwSuggestions
    } = {}] = args.slice(-1);
    if (element && suggest) {
      const suggestion = getSuggestedQuery(element, variant);
      if (suggestion && !queryAllByName.endsWith(suggestion.queryName)) {
        throw getSuggestionError(suggestion.toString(), container);
      }
    }
    return element;
  };
  const wrapAllByQueryWithSuggestion = (query, queryAllByName, variant) => function(container) {
    for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      args[_key4 - 1] = arguments[_key4];
    }
    const els = query(container, ...args);
    const [{
      suggest = getConfig().throwSuggestions
    } = {}] = args.slice(-1);
    if (els.length && suggest) {
      const uniqueSuggestionMessages = [...new Set(els.map((element) => {
        var _getSuggestedQuery;
        return (_getSuggestedQuery = getSuggestedQuery(element, variant)) == null ? void 0 : _getSuggestedQuery.toString();
      }))];
      if (
        // only want to suggest if all the els have the same suggestion.
        uniqueSuggestionMessages.length === 1 && !queryAllByName.endsWith(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- TODO: Can this be null at runtime?
          getSuggestedQuery(els[0], variant).queryName
        )
      ) {
        throw getSuggestionError(uniqueSuggestionMessages[0], container);
      }
    }
    return els;
  };
  function buildQueries(queryAllBy, getMultipleError2, getMissingError2) {
    const queryBy = wrapSingleQueryWithSuggestion(makeSingleQuery(queryAllBy, getMultipleError2), queryAllBy.name, "query");
    const getAllBy = makeGetAllQuery(queryAllBy, getMissingError2);
    const getBy = makeSingleQuery(getAllBy, getMultipleError2);
    const getByWithSuggestions = wrapSingleQueryWithSuggestion(getBy, queryAllBy.name, "get");
    const getAllWithSuggestions = wrapAllByQueryWithSuggestion(getAllBy, queryAllBy.name.replace("query", "get"), "getAll");
    const findAllBy = makeFindQuery(wrapAllByQueryWithSuggestion(getAllBy, queryAllBy.name, "findAll"));
    const findBy = makeFindQuery(wrapSingleQueryWithSuggestion(getBy, queryAllBy.name, "find"));
    return [queryBy, getAllWithSuggestions, getByWithSuggestions, findAllBy, findBy];
  }
  function queryAllLabels(container) {
    return Array.from(container.querySelectorAll("label,input")).map((node) => {
      return {
        node,
        textToMatch: getLabelContent(node)
      };
    }).filter((_ref) => {
      let {
        textToMatch
      } = _ref;
      return textToMatch !== null;
    });
  }
  const queryAllLabelsByText = function(container, text, _temp) {
    let {
      exact = true,
      trim,
      collapseWhitespace,
      normalizer
    } = _temp === void 0 ? {} : _temp;
    const matcher = exact ? matches : fuzzyMatches;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    const textToMatchByLabels = queryAllLabels(container);
    return textToMatchByLabels.filter((_ref2) => {
      let {
        node,
        textToMatch
      } = _ref2;
      return matcher(textToMatch, node, text, matchNormalizer);
    }).map((_ref3) => {
      let {
        node
      } = _ref3;
      return node;
    });
  };
  const queryAllByLabelText = function(container, text, _temp2) {
    let {
      selector = "*",
      exact = true,
      collapseWhitespace,
      trim,
      normalizer
    } = _temp2 === void 0 ? {} : _temp2;
    checkContainerType(container);
    const matcher = exact ? matches : fuzzyMatches;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    const matchingLabelledElements = Array.from(container.querySelectorAll("*")).filter((element) => {
      return getRealLabels(element).length || element.hasAttribute("aria-labelledby");
    }).reduce((labelledElements, labelledElement) => {
      const labelList = getLabels(container, labelledElement, {
        selector
      });
      labelList.filter((label) => Boolean(label.formControl)).forEach((label) => {
        if (matcher(label.content, label.formControl, text, matchNormalizer) && label.formControl) {
          labelledElements.push(label.formControl);
        }
      });
      const labelsValue = labelList.filter((label) => Boolean(label.content)).map((label) => label.content);
      if (matcher(labelsValue.join(" "), labelledElement, text, matchNormalizer)) {
        labelledElements.push(labelledElement);
      }
      if (labelsValue.length > 1) {
        labelsValue.forEach((labelValue, index) => {
          if (matcher(labelValue, labelledElement, text, matchNormalizer)) {
            labelledElements.push(labelledElement);
          }
          const labelsFiltered = [...labelsValue];
          labelsFiltered.splice(index, 1);
          if (labelsFiltered.length > 1) {
            if (matcher(labelsFiltered.join(" "), labelledElement, text, matchNormalizer)) {
              labelledElements.push(labelledElement);
            }
          }
        });
      }
      return labelledElements;
    }, []).concat(queryAllByAttribute("aria-label", container, text, {
      exact,
      normalizer: matchNormalizer
    }));
    return Array.from(new Set(matchingLabelledElements)).filter((element) => element.matches(selector));
  };
  const getAllByLabelText = function(container, text) {
    for (var _len = arguments.length, rest = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      rest[_key - 2] = arguments[_key];
    }
    const els = queryAllByLabelText(container, text, ...rest);
    if (!els.length) {
      const labels = queryAllLabelsByText(container, text, ...rest);
      if (labels.length) {
        const tagNames = labels.map((label) => getTagNameOfElementAssociatedWithLabelViaFor(container, label)).filter((tagName) => !!tagName);
        if (tagNames.length) {
          throw getConfig().getElementError(tagNames.map((tagName) => "Found a label with the text of: " + text + ", however the element associated with this label (<" + tagName + " />) is non-labellable [https://html.spec.whatwg.org/multipage/forms.html#category-label]. If you really need to label a <" + tagName + " />, you can use aria-label or aria-labelledby instead.").join("\n\n"), container);
        } else {
          throw getConfig().getElementError("Found a label with the text of: " + text + `, however no form control was found associated to that label. Make sure you're using the "for" attribute or "aria-labelledby" attribute correctly.`, container);
        }
      } else {
        throw getConfig().getElementError("Unable to find a label with the text of: " + text, container);
      }
    }
    return els;
  };
  function getTagNameOfElementAssociatedWithLabelViaFor(container, label) {
    const htmlFor = label.getAttribute("for");
    if (!htmlFor) {
      return null;
    }
    const element = container.querySelector('[id="' + htmlFor + '"]');
    return element ? element.tagName.toLowerCase() : null;
  }
  const getMultipleError$7 = (c2, text) => "Found multiple elements with the text of: " + text;
  const queryByLabelText = wrapSingleQueryWithSuggestion(makeSingleQuery(queryAllByLabelText, getMultipleError$7), queryAllByLabelText.name, "query");
  const getByLabelText = makeSingleQuery(getAllByLabelText, getMultipleError$7);
  const findAllByLabelText = makeFindQuery(wrapAllByQueryWithSuggestion(getAllByLabelText, getAllByLabelText.name, "findAll"));
  const findByLabelText = makeFindQuery(wrapSingleQueryWithSuggestion(getByLabelText, getAllByLabelText.name, "find"));
  const getAllByLabelTextWithSuggestions = wrapAllByQueryWithSuggestion(getAllByLabelText, getAllByLabelText.name, "getAll");
  const getByLabelTextWithSuggestions = wrapSingleQueryWithSuggestion(getByLabelText, getAllByLabelText.name, "get");
  const queryAllByLabelTextWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByLabelText, queryAllByLabelText.name, "queryAll");
  const queryAllByPlaceholderText = function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    checkContainerType(args[0]);
    return queryAllByAttribute("placeholder", ...args);
  };
  const getMultipleError$6 = (c2, text) => "Found multiple elements with the placeholder text of: " + text;
  const getMissingError$6 = (c2, text) => "Unable to find an element with the placeholder text of: " + text;
  const queryAllByPlaceholderTextWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByPlaceholderText, queryAllByPlaceholderText.name, "queryAll");
  const [queryByPlaceholderText, getAllByPlaceholderText, getByPlaceholderText, findAllByPlaceholderText, findByPlaceholderText] = buildQueries(queryAllByPlaceholderText, getMultipleError$6, getMissingError$6);
  const queryAllByText = function(container, text, _temp) {
    let {
      selector = "*",
      exact = true,
      collapseWhitespace,
      trim,
      ignore = getConfig().defaultIgnore,
      normalizer
    } = _temp === void 0 ? {} : _temp;
    checkContainerType(container);
    const matcher = exact ? matches : fuzzyMatches;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    let baseArray = [];
    if (typeof container.matches === "function" && container.matches(selector)) {
      baseArray = [container];
    }
    return [...baseArray, ...Array.from(container.querySelectorAll(selector))].filter((node) => !ignore || !node.matches(ignore)).filter((node) => matcher(getNodeText(node), node, text, matchNormalizer));
  };
  const getMultipleError$5 = (c2, text) => "Found multiple elements with the text: " + text;
  const getMissingError$5 = function(c2, text, options) {
    if (options === void 0) {
      options = {};
    }
    const {
      collapseWhitespace,
      trim,
      normalizer,
      selector
    } = options;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    const normalizedText = matchNormalizer(text.toString());
    const isNormalizedDifferent = normalizedText !== text.toString();
    const isCustomSelector = (selector != null ? selector : "*") !== "*";
    return "Unable to find an element with the text: " + (isNormalizedDifferent ? normalizedText + " (normalized from '" + text + "')" : text) + (isCustomSelector ? ", which matches selector '" + selector + "'" : "") + ". This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.";
  };
  const queryAllByTextWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByText, queryAllByText.name, "queryAll");
  const [queryByText, getAllByText, getByText, findAllByText, findByText] = buildQueries(queryAllByText, getMultipleError$5, getMissingError$5);
  const queryAllByDisplayValue = function(container, value, _temp) {
    let {
      exact = true,
      collapseWhitespace,
      trim,
      normalizer
    } = _temp === void 0 ? {} : _temp;
    checkContainerType(container);
    const matcher = exact ? matches : fuzzyMatches;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    return Array.from(container.querySelectorAll("input,textarea,select")).filter((node) => {
      if (node.tagName === "SELECT") {
        const selectedOptions = Array.from(node.options).filter((option) => option.selected);
        return selectedOptions.some((optionNode) => matcher(getNodeText(optionNode), optionNode, value, matchNormalizer));
      } else {
        return matcher(node.value, node, value, matchNormalizer);
      }
    });
  };
  const getMultipleError$4 = (c2, value) => "Found multiple elements with the display value: " + value + ".";
  const getMissingError$4 = (c2, value) => "Unable to find an element with the display value: " + value + ".";
  const queryAllByDisplayValueWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByDisplayValue, queryAllByDisplayValue.name, "queryAll");
  const [queryByDisplayValue, getAllByDisplayValue, getByDisplayValue, findAllByDisplayValue, findByDisplayValue] = buildQueries(queryAllByDisplayValue, getMultipleError$4, getMissingError$4);
  const VALID_TAG_REGEXP = /^(img|input|area|.+-.+)$/i;
  const queryAllByAltText = function(container, alt, options) {
    if (options === void 0) {
      options = {};
    }
    checkContainerType(container);
    return queryAllByAttribute("alt", container, alt, options).filter((node) => VALID_TAG_REGEXP.test(node.tagName));
  };
  const getMultipleError$3 = (c2, alt) => "Found multiple elements with the alt text: " + alt;
  const getMissingError$3 = (c2, alt) => "Unable to find an element with the alt text: " + alt;
  const queryAllByAltTextWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByAltText, queryAllByAltText.name, "queryAll");
  const [queryByAltText, getAllByAltText, getByAltText, findAllByAltText, findByAltText] = buildQueries(queryAllByAltText, getMultipleError$3, getMissingError$3);
  const isSvgTitle = (node) => {
    var _node$parentElement;
    return node.tagName.toLowerCase() === "title" && ((_node$parentElement = node.parentElement) == null ? void 0 : _node$parentElement.tagName.toLowerCase()) === "svg";
  };
  const queryAllByTitle = function(container, text, _temp) {
    let {
      exact = true,
      collapseWhitespace,
      trim,
      normalizer
    } = _temp === void 0 ? {} : _temp;
    checkContainerType(container);
    const matcher = exact ? matches : fuzzyMatches;
    const matchNormalizer = makeNormalizer({
      collapseWhitespace,
      trim,
      normalizer
    });
    return Array.from(container.querySelectorAll("[title], svg > title")).filter((node) => matcher(node.getAttribute("title"), node, text, matchNormalizer) || isSvgTitle(node) && matcher(getNodeText(node), node, text, matchNormalizer));
  };
  const getMultipleError$2 = (c2, title2) => "Found multiple elements with the title: " + title2 + ".";
  const getMissingError$2 = (c2, title2) => "Unable to find an element with the title: " + title2 + ".";
  const queryAllByTitleWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByTitle, queryAllByTitle.name, "queryAll");
  const [queryByTitle, getAllByTitle, getByTitle, findAllByTitle, findByTitle] = buildQueries(queryAllByTitle, getMultipleError$2, getMissingError$2);
  const queryAllByRole = function(container, role, _temp) {
    let {
      hidden = getConfig().defaultHidden,
      name,
      description: description2,
      queryFallbacks = false,
      selected,
      busy,
      checked,
      pressed,
      current,
      level,
      expanded,
      value: {
        now: valueNow,
        min: valueMin,
        max: valueMax,
        text: valueText
      } = {}
    } = _temp === void 0 ? {} : _temp;
    checkContainerType(container);
    if (selected !== void 0) {
      var _allRoles$get;
      if (((_allRoles$get = roles_1.get(role)) == null ? void 0 : _allRoles$get.props["aria-selected"]) === void 0) {
        throw new Error('"aria-selected" is not supported on role "' + role + '".');
      }
    }
    if (busy !== void 0) {
      var _allRoles$get2;
      if (((_allRoles$get2 = roles_1.get(role)) == null ? void 0 : _allRoles$get2.props["aria-busy"]) === void 0) {
        throw new Error('"aria-busy" is not supported on role "' + role + '".');
      }
    }
    if (checked !== void 0) {
      var _allRoles$get3;
      if (((_allRoles$get3 = roles_1.get(role)) == null ? void 0 : _allRoles$get3.props["aria-checked"]) === void 0) {
        throw new Error('"aria-checked" is not supported on role "' + role + '".');
      }
    }
    if (pressed !== void 0) {
      var _allRoles$get4;
      if (((_allRoles$get4 = roles_1.get(role)) == null ? void 0 : _allRoles$get4.props["aria-pressed"]) === void 0) {
        throw new Error('"aria-pressed" is not supported on role "' + role + '".');
      }
    }
    if (current !== void 0) {
      var _allRoles$get5;
      if (((_allRoles$get5 = roles_1.get(role)) == null ? void 0 : _allRoles$get5.props["aria-current"]) === void 0) {
        throw new Error('"aria-current" is not supported on role "' + role + '".');
      }
    }
    if (level !== void 0) {
      if (role !== "heading") {
        throw new Error('Role "' + role + '" cannot have "level" property.');
      }
    }
    if (valueNow !== void 0) {
      var _allRoles$get6;
      if (((_allRoles$get6 = roles_1.get(role)) == null ? void 0 : _allRoles$get6.props["aria-valuenow"]) === void 0) {
        throw new Error('"aria-valuenow" is not supported on role "' + role + '".');
      }
    }
    if (valueMax !== void 0) {
      var _allRoles$get7;
      if (((_allRoles$get7 = roles_1.get(role)) == null ? void 0 : _allRoles$get7.props["aria-valuemax"]) === void 0) {
        throw new Error('"aria-valuemax" is not supported on role "' + role + '".');
      }
    }
    if (valueMin !== void 0) {
      var _allRoles$get8;
      if (((_allRoles$get8 = roles_1.get(role)) == null ? void 0 : _allRoles$get8.props["aria-valuemin"]) === void 0) {
        throw new Error('"aria-valuemin" is not supported on role "' + role + '".');
      }
    }
    if (valueText !== void 0) {
      var _allRoles$get9;
      if (((_allRoles$get9 = roles_1.get(role)) == null ? void 0 : _allRoles$get9.props["aria-valuetext"]) === void 0) {
        throw new Error('"aria-valuetext" is not supported on role "' + role + '".');
      }
    }
    if (expanded !== void 0) {
      var _allRoles$get0;
      if (((_allRoles$get0 = roles_1.get(role)) == null ? void 0 : _allRoles$get0.props["aria-expanded"]) === void 0) {
        throw new Error('"aria-expanded" is not supported on role "' + role + '".');
      }
    }
    const subtreeIsInaccessibleCache = /* @__PURE__ */ new WeakMap();
    function cachedIsSubtreeInaccessible(element) {
      if (!subtreeIsInaccessibleCache.has(element)) {
        subtreeIsInaccessibleCache.set(element, isSubtreeInaccessible(element));
      }
      return subtreeIsInaccessibleCache.get(element);
    }
    return Array.from(container.querySelectorAll(
      // Only query elements that can be matched by the following filters
      makeRoleSelector(role)
    )).filter((node) => {
      const isRoleSpecifiedExplicitly = node.hasAttribute("role");
      if (isRoleSpecifiedExplicitly) {
        const roleValue = node.getAttribute("role");
        if (queryFallbacks) {
          return roleValue.split(" ").filter(Boolean).some((roleAttributeToken) => roleAttributeToken === role);
        }
        const [firstRoleAttributeToken] = roleValue.split(" ");
        return firstRoleAttributeToken === role;
      }
      const implicitRoles = getImplicitAriaRoles(node);
      return implicitRoles.some((implicitRole) => {
        return implicitRole === role;
      });
    }).filter((element) => {
      if (selected !== void 0) {
        return selected === computeAriaSelected(element);
      }
      if (busy !== void 0) {
        return busy === computeAriaBusy(element);
      }
      if (checked !== void 0) {
        return checked === computeAriaChecked(element);
      }
      if (pressed !== void 0) {
        return pressed === computeAriaPressed(element);
      }
      if (current !== void 0) {
        return current === computeAriaCurrent(element);
      }
      if (expanded !== void 0) {
        return expanded === computeAriaExpanded(element);
      }
      if (level !== void 0) {
        return level === computeHeadingLevel(element);
      }
      if (valueNow !== void 0 || valueMax !== void 0 || valueMin !== void 0 || valueText !== void 0) {
        let valueMatches = true;
        if (valueNow !== void 0) {
          valueMatches && (valueMatches = valueNow === computeAriaValueNow(element));
        }
        if (valueMax !== void 0) {
          valueMatches && (valueMatches = valueMax === computeAriaValueMax(element));
        }
        if (valueMin !== void 0) {
          valueMatches && (valueMatches = valueMin === computeAriaValueMin(element));
        }
        if (valueText !== void 0) {
          var _computeAriaValueText;
          valueMatches && (valueMatches = matches((_computeAriaValueText = computeAriaValueText(element)) != null ? _computeAriaValueText : null, element, valueText, (text) => text));
        }
        return valueMatches;
      }
      return true;
    }).filter((element) => {
      if (name === void 0) {
        return true;
      }
      return matches(computeAccessibleName(element, {
        computedStyleSupportsPseudoElements: getConfig().computedStyleSupportsPseudoElements
      }), element, name, (text) => text);
    }).filter((element) => {
      if (description2 === void 0) {
        return true;
      }
      return matches(computeAccessibleDescription(element, {
        computedStyleSupportsPseudoElements: getConfig().computedStyleSupportsPseudoElements
      }), element, description2, (text) => text);
    }).filter((element) => {
      return hidden === false ? isInaccessible(element, {
        isSubtreeInaccessible: cachedIsSubtreeInaccessible
      }) === false : true;
    });
  };
  function makeRoleSelector(role) {
    var _roleElements$get;
    const explicitRoleSelector = '*[role~="' + role + '"]';
    const roleRelations = (_roleElements$get = roleElements_1.get(role)) != null ? _roleElements$get : /* @__PURE__ */ new Set();
    const implicitRoleSelectors = new Set(Array.from(roleRelations).map((_ref) => {
      let {
        name
      } = _ref;
      return name;
    }));
    return [explicitRoleSelector].concat(Array.from(implicitRoleSelectors)).join(",");
  }
  const getNameHint = (name) => {
    let nameHint = "";
    if (name === void 0) {
      nameHint = "";
    } else if (typeof name === "string") {
      nameHint = ' and name "' + name + '"';
    } else {
      nameHint = " and name `" + name + "`";
    }
    return nameHint;
  };
  const getMultipleError$1 = function(c2, role, _temp2) {
    let {
      name
    } = _temp2 === void 0 ? {} : _temp2;
    return 'Found multiple elements with the role "' + role + '"' + getNameHint(name);
  };
  const getMissingError$1 = function(container, role, _temp3) {
    let {
      hidden = getConfig().defaultHidden,
      name,
      description: description2
    } = _temp3 === void 0 ? {} : _temp3;
    if (getConfig()._disableExpensiveErrorDiagnostics) {
      return 'Unable to find role="' + role + '"' + getNameHint(name);
    }
    let roles2 = "";
    Array.from(container.children).forEach((childElement) => {
      roles2 += prettyRoles(childElement, {
        hidden,
        includeDescription: description2 !== void 0
      });
    });
    let roleMessage;
    if (roles2.length === 0) {
      if (hidden === false) {
        roleMessage = "There are no accessible roles. But there might be some inaccessible roles. If you wish to access them, then set the `hidden` option to `true`. Learn more about this here: https://testing-library.com/docs/dom-testing-library/api-queries#byrole";
      } else {
        roleMessage = "There are no available roles.";
      }
    } else {
      roleMessage = ("\nHere are the " + (hidden === false ? "accessible" : "available") + " roles:\n\n  " + roles2.replace(/\n/g, "\n  ").replace(/\n\s\s\n/g, "\n\n") + "\n").trim();
    }
    let nameHint = "";
    if (name === void 0) {
      nameHint = "";
    } else if (typeof name === "string") {
      nameHint = ' and name "' + name + '"';
    } else {
      nameHint = " and name `" + name + "`";
    }
    let descriptionHint = "";
    if (description2 === void 0) {
      descriptionHint = "";
    } else if (typeof description2 === "string") {
      descriptionHint = ' and description "' + description2 + '"';
    } else {
      descriptionHint = " and description `" + description2 + "`";
    }
    return ("\nUnable to find an " + (hidden === false ? "accessible " : "") + 'element with the role "' + role + '"' + nameHint + descriptionHint + "\n\n" + roleMessage).trim();
  };
  const queryAllByRoleWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByRole, queryAllByRole.name, "queryAll");
  const [queryByRole, getAllByRole, getByRole, findAllByRole, findByRole] = buildQueries(queryAllByRole, getMultipleError$1, getMissingError$1);
  const getTestIdAttribute = () => getConfig().testIdAttribute;
  const queryAllByTestId = function() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    checkContainerType(args[0]);
    return queryAllByAttribute(getTestIdAttribute(), ...args);
  };
  const getMultipleError = (c2, id) => "Found multiple elements by: [" + getTestIdAttribute() + '="' + id + '"]';
  const getMissingError = (c2, id) => "Unable to find an element by: [" + getTestIdAttribute() + '="' + id + '"]';
  const queryAllByTestIdWithSuggestions = wrapAllByQueryWithSuggestion(queryAllByTestId, queryAllByTestId.name, "queryAll");
  const [queryByTestId, getAllByTestId, getByTestId, findAllByTestId, findByTestId] = buildQueries(queryAllByTestId, getMultipleError, getMissingError);
  var queries = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    queryAllByLabelText: queryAllByLabelTextWithSuggestions,
    queryByLabelText,
    getAllByLabelText: getAllByLabelTextWithSuggestions,
    getByLabelText: getByLabelTextWithSuggestions,
    findAllByLabelText,
    findByLabelText,
    queryByPlaceholderText,
    queryAllByPlaceholderText: queryAllByPlaceholderTextWithSuggestions,
    getByPlaceholderText,
    getAllByPlaceholderText,
    findAllByPlaceholderText,
    findByPlaceholderText,
    queryByText,
    queryAllByText: queryAllByTextWithSuggestions,
    getByText,
    getAllByText,
    findAllByText,
    findByText,
    queryByDisplayValue,
    queryAllByDisplayValue: queryAllByDisplayValueWithSuggestions,
    getByDisplayValue,
    getAllByDisplayValue,
    findAllByDisplayValue,
    findByDisplayValue,
    queryByAltText,
    queryAllByAltText: queryAllByAltTextWithSuggestions,
    getByAltText,
    getAllByAltText,
    findAllByAltText,
    findByAltText,
    queryByTitle,
    queryAllByTitle: queryAllByTitleWithSuggestions,
    getByTitle,
    getAllByTitle,
    findAllByTitle,
    findByTitle,
    queryByRole,
    queryAllByRole: queryAllByRoleWithSuggestions,
    getAllByRole,
    getByRole,
    findAllByRole,
    findByRole,
    queryByTestId,
    queryAllByTestId: queryAllByTestIdWithSuggestions,
    getByTestId,
    getAllByTestId,
    findAllByTestId,
    findByTestId
  });
  function getQueriesForElement(element, queries$1, initialValue2) {
    if (queries$1 === void 0) {
      queries$1 = queries;
    }
    if (initialValue2 === void 0) {
      initialValue2 = {};
    }
    return Object.keys(queries$1).reduce((helpers, key) => {
      const fn = queries$1[key];
      helpers[key] = fn.bind(null, element);
      return helpers;
    }, initialValue2);
  }
  const eventMap$1 = {
    // Clipboard Events
    copy: {
      EventType: "ClipboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    cut: {
      EventType: "ClipboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    paste: {
      EventType: "ClipboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    // Composition Events
    compositionEnd: {
      EventType: "CompositionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    compositionStart: {
      EventType: "CompositionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    compositionUpdate: {
      EventType: "CompositionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    // Keyboard Events
    keyDown: {
      EventType: "KeyboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        charCode: 0,
        composed: true
      }
    },
    keyPress: {
      EventType: "KeyboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        charCode: 0,
        composed: true
      }
    },
    keyUp: {
      EventType: "KeyboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        charCode: 0,
        composed: true
      }
    },
    // Focus Events
    focus: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    blur: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    focusIn: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    focusOut: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    // Form Events
    change: {
      EventType: "Event",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    input: {
      EventType: "InputEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    invalid: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: true
      }
    },
    submit: {
      EventType: "Event",
      defaultInit: {
        bubbles: true,
        cancelable: true
      }
    },
    reset: {
      EventType: "Event",
      defaultInit: {
        bubbles: true,
        cancelable: true
      }
    },
    // Mouse Events
    click: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        button: 0,
        composed: true
      }
    },
    contextMenu: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    dblClick: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    drag: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    dragEnd: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    dragEnter: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    dragExit: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    dragLeave: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    dragOver: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    dragStart: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    drop: {
      EventType: "DragEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseDown: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseEnter: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    mouseLeave: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    mouseMove: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseOut: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseOver: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseUp: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    // Selection Events
    select: {
      EventType: "Event",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    // Touch Events
    touchCancel: {
      EventType: "TouchEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    touchEnd: {
      EventType: "TouchEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    touchMove: {
      EventType: "TouchEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    touchStart: {
      EventType: "TouchEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    // UI Events
    resize: {
      EventType: "UIEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    scroll: {
      EventType: "UIEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    // Wheel Events
    wheel: {
      EventType: "WheelEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    // Media Events
    abort: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    canPlay: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    canPlayThrough: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    durationChange: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    emptied: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    encrypted: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    ended: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    loadedData: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    loadedMetadata: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    loadStart: {
      EventType: "ProgressEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    pause: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    play: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    playing: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    progress: {
      EventType: "ProgressEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    rateChange: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    seeked: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    seeking: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    stalled: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    suspend: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    timeUpdate: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    volumeChange: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    waiting: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    // Events
    load: {
      // TODO: load events can be UIEvent or Event depending on what generated them
      // This is where this abstraction breaks down.
      // But the common targets are <img />, <script /> and window.
      // Neither of these targets receive a UIEvent
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    error: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    // Animation Events
    animationStart: {
      EventType: "AnimationEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    animationEnd: {
      EventType: "AnimationEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    animationIteration: {
      EventType: "AnimationEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    // Transition Events
    transitionCancel: {
      EventType: "TransitionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    transitionEnd: {
      EventType: "TransitionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true
      }
    },
    transitionRun: {
      EventType: "TransitionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    transitionStart: {
      EventType: "TransitionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    // pointer events
    pointerOver: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerEnter: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    pointerDown: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerMove: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerUp: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerCancel: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    pointerOut: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerLeave: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    gotPointerCapture: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    lostPointerCapture: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    // history events
    popState: {
      EventType: "PopStateEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    // window events
    offline: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    online: {
      EventType: "Event",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    pageHide: {
      EventType: "PageTransitionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true
      }
    },
    pageShow: {
      EventType: "PageTransitionEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true
      }
    }
  };
  const eventAliasMap = {
    doubleClick: "dblClick"
  };
  Object.keys(eventMap$1).forEach((key) => {
    const {
      EventType,
      defaultInit
    } = eventMap$1[key];
    key.toLowerCase();
  });
  Object.keys(eventAliasMap).forEach((aliasKey) => {
  });
  function unindent(string) {
    return string.replace(/[ \t]*[\n][ \t]*/g, "\n");
  }
  function encode(value) {
    return lzString.compressToEncodedURIComponent(unindent(value));
  }
  function getPlaygroundUrl(markup2) {
    return "https://testing-playground.com/#markup=" + encode(markup2);
  }
  const debug = (element, maxLength, options) => Array.isArray(element) ? element.forEach((el) => logDOM(el, maxLength, options)) : logDOM(element, maxLength, options);
  const logTestingPlaygroundURL = function(element) {
    if (element === void 0) {
      element = getDocument$1().body;
    }
    if (!element || !("innerHTML" in element)) {
      console.log("The element you're providing isn't a valid DOM element.");
      return;
    }
    if (!element.innerHTML) {
      console.log("The provided element doesn't have any children.");
      return;
    }
    const playgroundUrl = getPlaygroundUrl(element.innerHTML);
    console.log("Open this URL in your browser\n\n" + playgroundUrl);
    return playgroundUrl;
  };
  const initialValue = {
    debug,
    logTestingPlaygroundURL
  };
  typeof document !== "undefined" && document.body ? getQueriesForElement(document.body, queries, initialValue) : Object.keys(queries).reduce((helpers, key) => {
    helpers[key] = () => {
      throw new TypeError("For queries bound to document.body a global document has to be available... Learn more: https://testing-library.com/s/screen-global-error");
    };
    return helpers;
  }, initialValue);
  function wrapEvent(cb, _element) {
    return getConfig().eventWrapper(cb);
  }
  function focusElement(element) {
    const target = findClosest(element, isFocusable);
    const activeElement = getActiveElement(element.ownerDocument);
    if ((target !== null && target !== void 0 ? target : element.ownerDocument.body) === activeElement) {
      return;
    } else if (target) {
      wrapEvent(() => target.focus());
    } else {
      wrapEvent(() => activeElement === null || activeElement === void 0 ? void 0 : activeElement.blur());
    }
    updateSelectionOnFocus(target !== null && target !== void 0 ? target : element.ownerDocument.body);
  }
  function blurElement(element) {
    if (!isFocusable(element)) return;
    const wasActive = getActiveElement(element.ownerDocument) === element;
    if (!wasActive) return;
    wrapEvent(() => element.blur());
  }
  const behavior = {};
  behavior.click = (event, target, instance) => {
    const context = target.closest("button,input,label,select,textarea");
    const control = context && isElementType(context, "label") && context.control;
    if (control && control !== target) {
      return () => {
        if (isFocusable(control)) {
          focusElement(control);
          instance.dispatchEvent(control, cloneEvent(event));
        }
      };
    } else if (isElementType(target, "input", {
      type: "file"
    })) {
      return () => {
        blurElement(target);
        target.dispatchEvent(new (getWindow(target)).Event("fileDialog"));
        focusElement(target);
      };
    }
  };
  const UIValue = Symbol("Displayed value in UI");
  const UISelection = Symbol("Displayed selection in UI");
  const InitialValue = Symbol("Initial value to compare on blur");
  function isUIValue(value) {
    return typeof value === "object" && UIValue in value;
  }
  function isUISelectionStart(start) {
    return !!start && typeof start === "object" && UISelection in start;
  }
  function setUIValue(element, value) {
    if (element[InitialValue] === void 0) {
      element[InitialValue] = element.value;
    }
    element[UIValue] = value;
    element.value = Object.assign(new String(value), {
      [UIValue]: true
    });
  }
  function getUIValue(element) {
    return element[UIValue] === void 0 ? element.value : String(element[UIValue]);
  }
  function setUIValueClean(element) {
    element[UIValue] = void 0;
  }
  function clearInitialValue(element) {
    element[InitialValue] = void 0;
  }
  function getInitialValue(element) {
    return element[InitialValue];
  }
  function setUISelectionRaw(element, selection) {
    element[UISelection] = selection;
  }
  function setUISelection(element, { focusOffset: focusOffsetParam, anchorOffset: anchorOffsetParam = focusOffsetParam }, mode = "replace") {
    const valueLength = getUIValue(element).length;
    const sanitizeOffset = (o) => Math.max(0, Math.min(valueLength, o));
    const anchorOffset = mode === "replace" || element[UISelection] === void 0 ? sanitizeOffset(anchorOffsetParam) : element[UISelection].anchorOffset;
    const focusOffset = sanitizeOffset(focusOffsetParam);
    const startOffset = Math.min(anchorOffset, focusOffset);
    const endOffset = Math.max(anchorOffset, focusOffset);
    element[UISelection] = {
      anchorOffset,
      focusOffset
    };
    if (element.selectionStart === startOffset && element.selectionEnd === endOffset) {
      return;
    }
    const startObj = Object.assign(new Number(startOffset), {
      [UISelection]: true
    });
    try {
      element.setSelectionRange(startObj, endOffset);
    } catch {
    }
  }
  function getUISelection(element) {
    var _element_selectionStart, _element_selectionEnd, _element_UISelection;
    const sel = (_element_UISelection = element[UISelection]) !== null && _element_UISelection !== void 0 ? _element_UISelection : {
      anchorOffset: (_element_selectionStart = element.selectionStart) !== null && _element_selectionStart !== void 0 ? _element_selectionStart : 0,
      focusOffset: (_element_selectionEnd = element.selectionEnd) !== null && _element_selectionEnd !== void 0 ? _element_selectionEnd : 0
    };
    return {
      ...sel,
      startOffset: Math.min(sel.anchorOffset, sel.focusOffset),
      endOffset: Math.max(sel.anchorOffset, sel.focusOffset)
    };
  }
  function hasUISelection(element) {
    return !!element[UISelection];
  }
  function setUISelectionClean(element) {
    element[UISelection] = void 0;
  }
  const parseInt$1 = globalThis.parseInt;
  function buildTimeValue(value) {
    const onlyDigitsValue = value.replace(/\D/g, "");
    if (onlyDigitsValue.length < 2) {
      return value;
    }
    const firstDigit = parseInt$1(onlyDigitsValue[0], 10);
    const secondDigit = parseInt$1(onlyDigitsValue[1], 10);
    if (firstDigit >= 3 || firstDigit === 2 && secondDigit >= 4) {
      let index;
      if (firstDigit >= 3) {
        index = 1;
      } else {
        index = 2;
      }
      return build(onlyDigitsValue, index);
    }
    if (value.length === 2) {
      return value;
    }
    return build(onlyDigitsValue, 2);
  }
  function build(onlyDigitsValue, index) {
    const hours = onlyDigitsValue.slice(0, index);
    const validHours = Math.min(parseInt$1(hours, 10), 23);
    const minuteCharacters = onlyDigitsValue.slice(index);
    const parsedMinutes = parseInt$1(minuteCharacters, 10);
    const validMinutes = Math.min(parsedMinutes, 59);
    return `${validHours.toString().padStart(2, "0")}:${validMinutes.toString().padStart(2, "0")}`;
  }
  function isValidDateOrTimeValue(element, value) {
    const clone = element.cloneNode();
    clone.value = value;
    return clone.value === value;
  }
  var maxLengthSupportedTypes = /* @__PURE__ */ function(maxLengthSupportedTypes2) {
    maxLengthSupportedTypes2["email"] = "email";
    maxLengthSupportedTypes2["password"] = "password";
    maxLengthSupportedTypes2["search"] = "search";
    maxLengthSupportedTypes2["telephone"] = "telephone";
    maxLengthSupportedTypes2["text"] = "text";
    maxLengthSupportedTypes2["url"] = "url";
    return maxLengthSupportedTypes2;
  }(maxLengthSupportedTypes || {});
  function getMaxLength(element) {
    var _element_getAttribute;
    const attr = (_element_getAttribute = element.getAttribute("maxlength")) !== null && _element_getAttribute !== void 0 ? _element_getAttribute : "";
    return /^\d+$/.test(attr) && Number(attr) >= 0 ? Number(attr) : void 0;
  }
  function supportsMaxLength(element) {
    return isElementType(element, "textarea") || isElementType(element, "input") && element.type in maxLengthSupportedTypes;
  }
  function getNextCursorPosition(node, offset, direction, inputType) {
    if (isTextNode(node) && offset + direction >= 0 && offset + direction <= node.nodeValue.length) {
      return {
        node,
        offset: offset + direction
      };
    }
    const nextNode = getNextCharacterContentNode(node, offset, direction);
    if (nextNode) {
      if (isTextNode(nextNode)) {
        return {
          node: nextNode,
          offset: direction > 0 ? Math.min(1, nextNode.nodeValue.length) : Math.max(nextNode.nodeValue.length - 1, 0)
        };
      } else if (isElementType(nextNode, "br")) {
        const nextPlusOne = getNextCharacterContentNode(nextNode, void 0, direction);
        if (!nextPlusOne) {
          if (direction < 0 && inputType === "deleteContentBackward") {
            return {
              node: nextNode.parentNode,
              offset: getOffset(nextNode)
            };
          }
          return void 0;
        } else if (isTextNode(nextPlusOne)) {
          return {
            node: nextPlusOne,
            offset: direction > 0 ? 0 : nextPlusOne.nodeValue.length
          };
        } else if (direction < 0 && isElementType(nextPlusOne, "br")) {
          return {
            node: nextNode.parentNode,
            offset: getOffset(nextNode)
          };
        } else {
          return {
            node: nextPlusOne.parentNode,
            offset: getOffset(nextPlusOne) + (direction > 0 ? 0 : 1)
          };
        }
      } else {
        return {
          node: nextNode.parentNode,
          offset: getOffset(nextNode) + (direction > 0 ? 1 : 0)
        };
      }
    }
  }
  function getNextCharacterContentNode(node, offset, direction) {
    const nextOffset = Number(offset) + (direction < 0 ? -1 : 0);
    if (offset !== void 0 && isElement(node) && nextOffset >= 0 && nextOffset < node.children.length) {
      node = node.children[nextOffset];
    }
    return walkNodes(node, direction === 1 ? "next" : "previous", isTreatedAsCharacterContent);
  }
  function isTreatedAsCharacterContent(node) {
    if (isTextNode(node)) {
      return true;
    }
    if (isElement(node)) {
      if (isElementType(node, [
        "input",
        "textarea"
      ])) {
        return node.type !== "hidden";
      } else if (isElementType(node, "br")) {
        return true;
      }
    }
    return false;
  }
  function getOffset(node) {
    let i = 0;
    while (node.previousSibling) {
      i++;
      node = node.previousSibling;
    }
    return i;
  }
  function isElement(node) {
    return node.nodeType === 1;
  }
  function isTextNode(node) {
    return node.nodeType === 3;
  }
  function walkNodes(node, direction, callback) {
    for (; ; ) {
      var _node_ownerDocument;
      const sibling = node[`${direction}Sibling`];
      if (sibling) {
        node = getDescendant(sibling, direction === "next" ? "first" : "last");
        if (callback(node)) {
          return node;
        }
      } else if (node.parentNode && (!isElement(node.parentNode) || !isContentEditable(node.parentNode) && node.parentNode !== ((_node_ownerDocument = node.ownerDocument) === null || _node_ownerDocument === void 0 ? void 0 : _node_ownerDocument.body))) {
        node = node.parentNode;
      } else {
        break;
      }
    }
  }
  function getDescendant(node, direction) {
    while (node.hasChildNodes()) {
      node = node[`${direction}Child`];
    }
    return node;
  }
  const TrackChanges = Symbol("Track programmatic changes for React workaround");
  function isReact17Element(element) {
    return Object.getOwnPropertyNames(element).some((k) => k.startsWith("__react")) && getWindow(element).REACT_VERSION === 17;
  }
  function startTrackValue(element) {
    if (!isReact17Element(element)) {
      return;
    }
    element[TrackChanges] = {
      previousValue: String(element.value),
      tracked: []
    };
  }
  function trackOrSetValue(element, v2) {
    var _element_TrackChanges_tracked, _element_TrackChanges;
    (_element_TrackChanges = element[TrackChanges]) === null || _element_TrackChanges === void 0 ? void 0 : (_element_TrackChanges_tracked = _element_TrackChanges.tracked) === null || _element_TrackChanges_tracked === void 0 ? void 0 : _element_TrackChanges_tracked.push(v2);
    if (!element[TrackChanges]) {
      setUIValueClean(element);
      setUISelection(element, {
        focusOffset: v2.length
      });
    }
  }
  function commitValueAfterInput(element, cursorOffset) {
    var _changes_tracked;
    const changes = element[TrackChanges];
    element[TrackChanges] = void 0;
    if (!(changes === null || changes === void 0 ? void 0 : (_changes_tracked = changes.tracked) === null || _changes_tracked === void 0 ? void 0 : _changes_tracked.length)) {
      return;
    }
    const isJustReactStateUpdate = changes.tracked.length === 2 && changes.tracked[0] === changes.previousValue && changes.tracked[1] === element.value;
    if (!isJustReactStateUpdate) {
      setUIValueClean(element);
    }
    if (hasUISelection(element)) {
      setUISelection(element, {
        focusOffset: isJustReactStateUpdate ? cursorOffset : element.value.length
      });
    }
  }
  function getTargetTypeAndSelection(node) {
    const element = getElement(node);
    if (element && hasOwnSelection(element)) {
      return {
        type: "input",
        selection: getUISelection(element)
      };
    }
    const selection = element === null || element === void 0 ? void 0 : element.ownerDocument.getSelection();
    const isCE = getContentEditable(node) && (selection === null || selection === void 0 ? void 0 : selection.anchorNode) && getContentEditable(selection.anchorNode);
    return {
      type: isCE ? "contenteditable" : "default",
      selection
    };
  }
  function getElement(node) {
    return node.nodeType === 1 ? node : node.parentElement;
  }
  function getInputRange(focusNode) {
    const typeAndSelection = getTargetTypeAndSelection(focusNode);
    if (typeAndSelection.type === "input") {
      return typeAndSelection.selection;
    } else if (typeAndSelection.type === "contenteditable") {
      var _typeAndSelection_selection;
      return (_typeAndSelection_selection = typeAndSelection.selection) === null || _typeAndSelection_selection === void 0 ? void 0 : _typeAndSelection_selection.getRangeAt(0);
    }
  }
  function setSelection({ focusNode, focusOffset, anchorNode = focusNode, anchorOffset = focusOffset }) {
    var _anchorNode_ownerDocument_getSelection, _anchorNode_ownerDocument;
    const typeAndSelection = getTargetTypeAndSelection(focusNode);
    if (typeAndSelection.type === "input") {
      return setUISelection(focusNode, {
        anchorOffset,
        focusOffset
      });
    }
    (_anchorNode_ownerDocument = anchorNode.ownerDocument) === null || _anchorNode_ownerDocument === void 0 ? void 0 : (_anchorNode_ownerDocument_getSelection = _anchorNode_ownerDocument.getSelection()) === null || _anchorNode_ownerDocument_getSelection === void 0 ? void 0 : _anchorNode_ownerDocument_getSelection.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
  }
  function isDateOrTime(element) {
    return isElementType(element, "input") && [
      "date",
      "time"
    ].includes(element.type);
  }
  function input(instance, element, data2, inputType = "insertText") {
    const inputRange = getInputRange(element);
    if (!inputRange) {
      return;
    }
    if (!isDateOrTime(element)) {
      const unprevented = instance.dispatchUIEvent(element, "beforeinput", {
        inputType,
        data: data2
      });
      if (!unprevented) {
        return;
      }
    }
    if ("startContainer" in inputRange) {
      editContenteditable(instance, element, inputRange, data2, inputType);
    } else {
      editInputElement(instance, element, inputRange, data2, inputType);
    }
  }
  function editContenteditable(instance, element, inputRange, data2, inputType) {
    let del = false;
    if (!inputRange.collapsed) {
      del = true;
      inputRange.deleteContents();
    } else if ([
      "deleteContentBackward",
      "deleteContentForward"
    ].includes(inputType)) {
      const nextPosition = getNextCursorPosition(inputRange.startContainer, inputRange.startOffset, inputType === "deleteContentBackward" ? -1 : 1, inputType);
      if (nextPosition) {
        del = true;
        const delRange = inputRange.cloneRange();
        if (delRange.comparePoint(nextPosition.node, nextPosition.offset) < 0) {
          delRange.setStart(nextPosition.node, nextPosition.offset);
        } else {
          delRange.setEnd(nextPosition.node, nextPosition.offset);
        }
        delRange.deleteContents();
      }
    }
    if (data2) {
      if (inputRange.endContainer.nodeType === 3) {
        const offset = inputRange.endOffset;
        inputRange.endContainer.insertData(offset, data2);
        inputRange.setStart(inputRange.endContainer, offset + data2.length);
        inputRange.setEnd(inputRange.endContainer, offset + data2.length);
      } else {
        const text = element.ownerDocument.createTextNode(data2);
        inputRange.insertNode(text);
        inputRange.setStart(text, data2.length);
        inputRange.setEnd(text, data2.length);
      }
    }
    if (del || data2) {
      instance.dispatchUIEvent(element, "input", {
        inputType
      });
    }
  }
  function editInputElement(instance, element, inputRange, data2, inputType) {
    let dataToInsert = data2;
    if (supportsMaxLength(element)) {
      const maxLength = getMaxLength(element);
      if (maxLength !== void 0 && data2.length > 0) {
        const spaceUntilMaxLength = maxLength - element.value.length;
        if (spaceUntilMaxLength > 0) {
          dataToInsert = data2.substring(0, spaceUntilMaxLength);
        } else {
          return;
        }
      }
    }
    const { newValue, newOffset, oldValue } = calculateNewValue(dataToInsert, element, inputRange, inputType);
    if (newValue === oldValue && newOffset === inputRange.startOffset && newOffset === inputRange.endOffset) {
      return;
    }
    if (isElementType(element, "input", {
      type: "number"
    }) && !isValidNumberInput(newValue)) {
      return;
    }
    setUIValue(element, newValue);
    setSelection({
      focusNode: element,
      anchorOffset: newOffset,
      focusOffset: newOffset
    });
    if (isDateOrTime(element)) {
      if (isValidDateOrTimeValue(element, newValue)) {
        commitInput(instance, element, newOffset, {});
        instance.dispatchUIEvent(element, "change");
        clearInitialValue(element);
      }
    } else {
      commitInput(instance, element, newOffset, {
        data: data2,
        inputType
      });
    }
  }
  function calculateNewValue(inputData, node, { startOffset, endOffset }, inputType) {
    const value = getUIValue(node);
    const prologEnd = Math.max(0, startOffset === endOffset && inputType === "deleteContentBackward" ? startOffset - 1 : startOffset);
    const prolog = value.substring(0, prologEnd);
    const epilogStart = Math.min(value.length, startOffset === endOffset && inputType === "deleteContentForward" ? startOffset + 1 : endOffset);
    const epilog = value.substring(epilogStart, value.length);
    let newValue = `${prolog}${inputData}${epilog}`;
    let newOffset = prologEnd + inputData.length;
    if (isElementType(node, "input", {
      type: "time"
    })) {
      const builtValue = buildTimeValue(newValue);
      if (builtValue !== "" && isValidDateOrTimeValue(node, builtValue)) {
        newValue = builtValue;
        newOffset = builtValue.length;
      }
    }
    return {
      oldValue: value,
      newValue,
      newOffset
    };
  }
  function commitInput(instance, element, newOffset, inputInit) {
    instance.dispatchUIEvent(element, "input", inputInit);
    commitValueAfterInput(element, newOffset);
  }
  function isValidNumberInput(value) {
    var _value_match, _value_match1;
    const valueParts = value.split("e", 2);
    return !(/[^\d.\-e]/.test(value) || Number((_value_match = value.match(/-/g)) === null || _value_match === void 0 ? void 0 : _value_match.length) > 2 || Number((_value_match1 = value.match(/\./g)) === null || _value_match1 === void 0 ? void 0 : _value_match1.length) > 1 || valueParts[1] && !/^-?\d*$/.test(valueParts[1]));
  }
  behavior.cut = (event, target, instance) => {
    return () => {
      if (isEditable(target)) {
        input(instance, target, "", "deleteByCut");
      }
    };
  };
  function getValueOrTextContent(element) {
    if (!element) {
      return null;
    }
    if (isContentEditable(element)) {
      return element.textContent;
    }
    return getUIValue(element);
  }
  function isVisible(element) {
    const window2 = getWindow(element);
    for (let el = element; el === null || el === void 0 ? void 0 : el.ownerDocument; el = el.parentElement) {
      const { display, visibility } = window2.getComputedStyle(el);
      if (display === "none") {
        return false;
      }
      if (visibility === "hidden") {
        return false;
      }
    }
    return true;
  }
  function getTabDestination(activeElement, shift) {
    const document2 = activeElement.ownerDocument;
    const focusableElements = document2.querySelectorAll(FOCUSABLE_SELECTOR);
    const enabledElements = Array.from(focusableElements).filter((el) => el === activeElement || !(Number(el.getAttribute("tabindex")) < 0 || isDisabled(el)));
    if (Number(activeElement.getAttribute("tabindex")) >= 0) {
      enabledElements.sort((a, b2) => {
        const i = Number(a.getAttribute("tabindex"));
        const j = Number(b2.getAttribute("tabindex"));
        if (i === j) {
          return 0;
        } else if (i === 0) {
          return 1;
        } else if (j === 0) {
          return -1;
        }
        return i - j;
      });
    }
    const checkedRadio = {};
    let prunedElements = [
      document2.body
    ];
    const activeRadioGroup = isElementType(activeElement, "input", {
      type: "radio"
    }) ? activeElement.name : void 0;
    enabledElements.forEach((currentElement) => {
      const el = currentElement;
      if (isElementType(el, "input", {
        type: "radio"
      }) && el.name) {
        if (el === activeElement) {
          prunedElements.push(el);
          return;
        } else if (el.name === activeRadioGroup) {
          return;
        }
        if (el.checked) {
          prunedElements = prunedElements.filter((e2) => !isElementType(e2, "input", {
            type: "radio",
            name: el.name
          }));
          prunedElements.push(el);
          checkedRadio[el.name] = el;
          return;
        }
        if (typeof checkedRadio[el.name] !== "undefined") {
          return;
        }
      }
      prunedElements.push(el);
    });
    for (let index = prunedElements.findIndex((el) => el === activeElement); ; ) {
      index += shift ? -1 : 1;
      if (index === prunedElements.length) {
        index = 0;
      } else if (index === -1) {
        index = prunedElements.length - 1;
      }
      if (prunedElements[index] === activeElement || prunedElements[index] === document2.body || isVisible(prunedElements[index])) {
        return prunedElements[index];
      }
    }
  }
  function moveSelection(node, direction) {
    if (hasOwnSelection(node)) {
      const selection = getUISelection(node);
      setSelection({
        focusNode: node,
        focusOffset: selection.startOffset === selection.endOffset ? selection.focusOffset + direction : direction < 0 ? selection.startOffset : selection.endOffset
      });
    } else {
      const selection = node.ownerDocument.getSelection();
      if (!(selection === null || selection === void 0 ? void 0 : selection.focusNode)) {
        return;
      }
      if (selection.isCollapsed) {
        const nextPosition = getNextCursorPosition(selection.focusNode, selection.focusOffset, direction);
        if (nextPosition) {
          setSelection({
            focusNode: nextPosition.node,
            focusOffset: nextPosition.offset
          });
        }
      } else {
        selection[direction < 0 ? "collapseToStart" : "collapseToEnd"]();
      }
    }
  }
  function selectAll(target) {
    if (hasOwnSelection(target)) {
      return setSelection({
        focusNode: target,
        anchorOffset: 0,
        focusOffset: getUIValue(target).length
      });
    }
    var _getContentEditable;
    const focusNode = (_getContentEditable = getContentEditable(target)) !== null && _getContentEditable !== void 0 ? _getContentEditable : target.ownerDocument.body;
    setSelection({
      focusNode,
      anchorOffset: 0,
      focusOffset: focusNode.childNodes.length
    });
  }
  function isAllSelected(target) {
    if (hasOwnSelection(target)) {
      return getUISelection(target).startOffset === 0 && getUISelection(target).endOffset === getUIValue(target).length;
    }
    var _getContentEditable;
    const focusNode = (_getContentEditable = getContentEditable(target)) !== null && _getContentEditable !== void 0 ? _getContentEditable : target.ownerDocument.body;
    const selection = target.ownerDocument.getSelection();
    return (selection === null || selection === void 0 ? void 0 : selection.anchorNode) === focusNode && selection.focusNode === focusNode && selection.anchorOffset === 0 && selection.focusOffset === focusNode.childNodes.length;
  }
  function setSelectionRange(element, anchorOffset, focusOffset) {
    var _element_firstChild;
    if (hasOwnSelection(element)) {
      return setSelection({
        focusNode: element,
        anchorOffset,
        focusOffset
      });
    }
    if (isContentEditable(element) && ((_element_firstChild = element.firstChild) === null || _element_firstChild === void 0 ? void 0 : _element_firstChild.nodeType) === 3) {
      return setSelection({
        focusNode: element.firstChild,
        anchorOffset,
        focusOffset
      });
    }
    throw new Error("Not implemented. The result of this interaction is unreliable.");
  }
  function walkRadio(instance, el, direction) {
    const window2 = getWindow(el);
    const group = Array.from(el.ownerDocument.querySelectorAll(el.name ? `input[type="radio"][name="${window2.CSS.escape(el.name)}"]` : `input[type="radio"][name=""], input[type="radio"]:not([name])`));
    for (let i = group.findIndex((e2) => e2 === el) + direction; ; i += direction) {
      if (!group[i]) {
        i = direction > 0 ? 0 : group.length - 1;
      }
      if (group[i] === el) {
        return;
      }
      if (isDisabled(group[i])) {
        continue;
      }
      focusElement(group[i]);
      instance.dispatchUIEvent(group[i], "click");
      return;
    }
  }
  behavior.keydown = (event, target, instance) => {
    var _keydownBehavior_event_key;
    var _keydownBehavior_event_key1;
    return (_keydownBehavior_event_key1 = (_keydownBehavior_event_key = keydownBehavior[event.key]) === null || _keydownBehavior_event_key === void 0 ? void 0 : _keydownBehavior_event_key.call(keydownBehavior, event, target, instance)) !== null && _keydownBehavior_event_key1 !== void 0 ? _keydownBehavior_event_key1 : combinationBehavior(event, target, instance);
  };
  const keydownBehavior = {
    ArrowDown: (event, target, instance) => {
      if (isElementType(target, "input", {
        type: "radio"
      })) {
        return () => walkRadio(instance, target, 1);
      }
    },
    ArrowLeft: (event, target, instance) => {
      if (isElementType(target, "input", {
        type: "radio"
      })) {
        return () => walkRadio(instance, target, -1);
      }
      return () => moveSelection(target, -1);
    },
    ArrowRight: (event, target, instance) => {
      if (isElementType(target, "input", {
        type: "radio"
      })) {
        return () => walkRadio(instance, target, 1);
      }
      return () => moveSelection(target, 1);
    },
    ArrowUp: (event, target, instance) => {
      if (isElementType(target, "input", {
        type: "radio"
      })) {
        return () => walkRadio(instance, target, -1);
      }
    },
    Backspace: (event, target, instance) => {
      if (isEditable(target)) {
        return () => {
          input(instance, target, "", "deleteContentBackward");
        };
      }
    },
    Delete: (event, target, instance) => {
      if (isEditable(target)) {
        return () => {
          input(instance, target, "", "deleteContentForward");
        };
      }
    },
    End: (event, target) => {
      if (isElementType(target, [
        "input",
        "textarea"
      ]) || isContentEditable(target)) {
        return () => {
          var _getValueOrTextContent;
          var _getValueOrTextContent_length;
          const newPos = (_getValueOrTextContent_length = (_getValueOrTextContent = getValueOrTextContent(target)) === null || _getValueOrTextContent === void 0 ? void 0 : _getValueOrTextContent.length) !== null && _getValueOrTextContent_length !== void 0 ? _getValueOrTextContent_length : (
            /* istanbul ignore next */
            0
          );
          setSelectionRange(target, newPos, newPos);
        };
      }
    },
    Home: (event, target) => {
      if (isElementType(target, [
        "input",
        "textarea"
      ]) || isContentEditable(target)) {
        return () => {
          setSelectionRange(target, 0, 0);
        };
      }
    },
    PageDown: (event, target) => {
      if (isElementType(target, [
        "input"
      ])) {
        return () => {
          const newPos = getUIValue(target).length;
          setSelectionRange(target, newPos, newPos);
        };
      }
    },
    PageUp: (event, target) => {
      if (isElementType(target, [
        "input"
      ])) {
        return () => {
          setSelectionRange(target, 0, 0);
        };
      }
    },
    Tab: (event, target, instance) => {
      return () => {
        const dest = getTabDestination(target, instance.system.keyboard.modifiers.Shift);
        focusElement(dest);
        if (hasOwnSelection(dest)) {
          setUISelection(dest, {
            anchorOffset: 0,
            focusOffset: dest.value.length
          });
        }
      };
    }
  };
  const combinationBehavior = (event, target, instance) => {
    if (event.code === "KeyA" && instance.system.keyboard.modifiers.Control) {
      return () => selectAll(target);
    }
  };
  behavior.keypress = (event, target, instance) => {
    if (event.key === "Enter") {
      if (isElementType(target, "button") || isElementType(target, "input") && ClickInputOnEnter.includes(target.type) || isElementType(target, "a") && Boolean(target.href)) {
        return () => {
          instance.dispatchUIEvent(target, "click");
        };
      } else if (isElementType(target, "input")) {
        const form = target.form;
        const submit = form === null || form === void 0 ? void 0 : form.querySelector('input[type="submit"], button:not([type]), button[type="submit"]');
        if (submit) {
          return () => instance.dispatchUIEvent(submit, "click");
        } else if (form && SubmitSingleInputOnEnter.includes(target.type) && form.querySelectorAll("input").length === 1) {
          return () => instance.dispatchUIEvent(form, "submit");
        } else {
          return;
        }
      }
    }
    if (isEditable(target)) {
      const inputType = event.key === "Enter" ? isContentEditable(target) && !instance.system.keyboard.modifiers.Shift ? "insertParagraph" : "insertLineBreak" : "insertText";
      const inputData = event.key === "Enter" ? "\n" : event.key;
      return () => input(instance, target, inputData, inputType);
    }
  };
  const ClickInputOnEnter = [
    "button",
    "color",
    "file",
    "image",
    "reset",
    "submit"
  ];
  const SubmitSingleInputOnEnter = [
    "email",
    "month",
    "password",
    "search",
    "tel",
    "text",
    "url",
    "week"
  ];
  behavior.keyup = (event, target, instance) => {
    var _keyupBehavior_event_key;
    return (_keyupBehavior_event_key = keyupBehavior[event.key]) === null || _keyupBehavior_event_key === void 0 ? void 0 : _keyupBehavior_event_key.call(keyupBehavior, event, target, instance);
  };
  const keyupBehavior = {
    " ": (event, target, instance) => {
      if (isClickableInput(target)) {
        return () => instance.dispatchUIEvent(target, "click");
      }
    }
  };
  behavior.paste = (event, target, instance) => {
    if (isEditable(target)) {
      return () => {
        var _event_clipboardData;
        const insertData = (_event_clipboardData = event.clipboardData) === null || _event_clipboardData === void 0 ? void 0 : _event_clipboardData.getData("text");
        if (insertData) {
          input(instance, target, insertData, "insertFromPaste");
        }
      };
    }
  };
  const eventMap = {
    auxclick: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    beforeinput: {
      EventType: "InputEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    blur: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    click: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    contextmenu: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    copy: {
      EventType: "ClipboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    change: {
      EventType: "Event",
      defaultInit: {
        bubbles: true,
        cancelable: false
      }
    },
    cut: {
      EventType: "ClipboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    dblclick: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    focus: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    focusin: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    focusout: {
      EventType: "FocusEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    keydown: {
      EventType: "KeyboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    keypress: {
      EventType: "KeyboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    keyup: {
      EventType: "KeyboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    paste: {
      EventType: "ClipboardEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    input: {
      EventType: "InputEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    mousedown: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseenter: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    mouseleave: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false,
        composed: true
      }
    },
    mousemove: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseout: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseover: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    mouseup: {
      EventType: "MouseEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerover: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerenter: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    pointerdown: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointermove: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerup: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointercancel: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: false,
        composed: true
      }
    },
    pointerout: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    },
    pointerleave: {
      EventType: "PointerEvent",
      defaultInit: {
        bubbles: false,
        cancelable: false
      }
    },
    submit: {
      EventType: "Event",
      defaultInit: {
        bubbles: true,
        cancelable: true
      }
    }
  };
  function getEventClass(type2) {
    return eventMap[type2].EventType;
  }
  const mouseEvents = [
    "MouseEvent",
    "PointerEvent"
  ];
  function isMouseEvent(type2) {
    return mouseEvents.includes(getEventClass(type2));
  }
  function isKeyboardEvent(type2) {
    return getEventClass(type2) === "KeyboardEvent";
  }
  const eventInitializer = {
    ClipboardEvent: [
      initClipboardEvent
    ],
    Event: [],
    FocusEvent: [
      initUIEvent,
      initFocusEvent
    ],
    InputEvent: [
      initUIEvent,
      initInputEvent
    ],
    MouseEvent: [
      initUIEvent,
      initUIEventModifiers,
      initMouseEvent
    ],
    PointerEvent: [
      initUIEvent,
      initUIEventModifiers,
      initMouseEvent,
      initPointerEvent
    ],
    KeyboardEvent: [
      initUIEvent,
      initUIEventModifiers,
      initKeyboardEvent
    ]
  };
  function createEvent(type2, target, init) {
    const window2 = getWindow(target);
    const { EventType, defaultInit } = eventMap[type2];
    const event = new (getEventConstructors(window2))[EventType](type2, defaultInit);
    eventInitializer[EventType].forEach((f2) => f2(event, init !== null && init !== void 0 ? init : {}));
    return event;
  }
  function getEventConstructors(window2) {
    var _window_Event;
    const Event2 = (_window_Event = window2.Event) !== null && _window_Event !== void 0 ? _window_Event : class Event {
    };
    var _window_AnimationEvent;
    const AnimationEvent = (_window_AnimationEvent = window2.AnimationEvent) !== null && _window_AnimationEvent !== void 0 ? _window_AnimationEvent : class AnimationEvent extends Event2 {
    };
    var _window_ClipboardEvent;
    const ClipboardEvent = (_window_ClipboardEvent = window2.ClipboardEvent) !== null && _window_ClipboardEvent !== void 0 ? _window_ClipboardEvent : class ClipboardEvent extends Event2 {
    };
    var _window_PopStateEvent;
    const PopStateEvent = (_window_PopStateEvent = window2.PopStateEvent) !== null && _window_PopStateEvent !== void 0 ? _window_PopStateEvent : class PopStateEvent extends Event2 {
    };
    var _window_ProgressEvent;
    const ProgressEvent = (_window_ProgressEvent = window2.ProgressEvent) !== null && _window_ProgressEvent !== void 0 ? _window_ProgressEvent : class ProgressEvent extends Event2 {
    };
    var _window_TransitionEvent;
    const TransitionEvent = (_window_TransitionEvent = window2.TransitionEvent) !== null && _window_TransitionEvent !== void 0 ? _window_TransitionEvent : class TransitionEvent extends Event2 {
    };
    var _window_UIEvent;
    const UIEvent = (_window_UIEvent = window2.UIEvent) !== null && _window_UIEvent !== void 0 ? _window_UIEvent : class UIEvent extends Event2 {
    };
    var _window_CompositionEvent;
    const CompositionEvent = (_window_CompositionEvent = window2.CompositionEvent) !== null && _window_CompositionEvent !== void 0 ? _window_CompositionEvent : class CompositionEvent extends UIEvent {
    };
    var _window_FocusEvent;
    const FocusEvent = (_window_FocusEvent = window2.FocusEvent) !== null && _window_FocusEvent !== void 0 ? _window_FocusEvent : class FocusEvent extends UIEvent {
    };
    var _window_InputEvent;
    const InputEvent = (_window_InputEvent = window2.InputEvent) !== null && _window_InputEvent !== void 0 ? _window_InputEvent : class InputEvent extends UIEvent {
    };
    var _window_KeyboardEvent;
    const KeyboardEvent = (_window_KeyboardEvent = window2.KeyboardEvent) !== null && _window_KeyboardEvent !== void 0 ? _window_KeyboardEvent : class KeyboardEvent extends UIEvent {
    };
    var _window_MouseEvent;
    const MouseEvent = (_window_MouseEvent = window2.MouseEvent) !== null && _window_MouseEvent !== void 0 ? _window_MouseEvent : class MouseEvent extends UIEvent {
    };
    var _window_DragEvent;
    const DragEvent = (_window_DragEvent = window2.DragEvent) !== null && _window_DragEvent !== void 0 ? _window_DragEvent : class DragEvent extends MouseEvent {
    };
    var _window_PointerEvent;
    const PointerEvent = (_window_PointerEvent = window2.PointerEvent) !== null && _window_PointerEvent !== void 0 ? _window_PointerEvent : class PointerEvent extends MouseEvent {
    };
    var _window_TouchEvent;
    const TouchEvent = (_window_TouchEvent = window2.TouchEvent) !== null && _window_TouchEvent !== void 0 ? _window_TouchEvent : class TouchEvent extends UIEvent {
    };
    return {
      Event: Event2,
      AnimationEvent,
      ClipboardEvent,
      PopStateEvent,
      ProgressEvent,
      TransitionEvent,
      UIEvent,
      CompositionEvent,
      FocusEvent,
      InputEvent,
      KeyboardEvent,
      MouseEvent,
      DragEvent,
      PointerEvent,
      TouchEvent
    };
  }
  function assignProps(obj, props) {
    for (const [key, value] of Object.entries(props)) {
      Object.defineProperty(obj, key, {
        get: () => value !== null && value !== void 0 ? value : null
      });
    }
  }
  function sanitizeNumber(n2) {
    return Number(n2 !== null && n2 !== void 0 ? n2 : 0);
  }
  function initClipboardEvent(event, { clipboardData }) {
    assignProps(event, {
      clipboardData
    });
  }
  function initFocusEvent(event, { relatedTarget }) {
    assignProps(event, {
      relatedTarget
    });
  }
  function initInputEvent(event, { data: data2, inputType, isComposing }) {
    assignProps(event, {
      data: data2,
      isComposing: Boolean(isComposing),
      inputType: String(inputType)
    });
  }
  function initUIEvent(event, { view, detail }) {
    assignProps(event, {
      view,
      detail: sanitizeNumber(detail !== null && detail !== void 0 ? detail : 0)
    });
  }
  function initUIEventModifiers(event, { altKey, ctrlKey, metaKey, shiftKey, modifierAltGraph, modifierCapsLock, modifierFn, modifierFnLock, modifierNumLock, modifierScrollLock, modifierSymbol, modifierSymbolLock }) {
    assignProps(event, {
      altKey: Boolean(altKey),
      ctrlKey: Boolean(ctrlKey),
      metaKey: Boolean(metaKey),
      shiftKey: Boolean(shiftKey),
      getModifierState(k) {
        return Boolean({
          Alt: altKey,
          AltGraph: modifierAltGraph,
          CapsLock: modifierCapsLock,
          Control: ctrlKey,
          Fn: modifierFn,
          FnLock: modifierFnLock,
          Meta: metaKey,
          NumLock: modifierNumLock,
          ScrollLock: modifierScrollLock,
          Shift: shiftKey,
          Symbol: modifierSymbol,
          SymbolLock: modifierSymbolLock
        }[k]);
      }
    });
  }
  function initKeyboardEvent(event, { key, code, location, repeat, isComposing, charCode }) {
    assignProps(event, {
      key: String(key),
      code: String(code),
      location: sanitizeNumber(location),
      repeat: Boolean(repeat),
      isComposing: Boolean(isComposing),
      charCode
    });
  }
  function initMouseEvent(event, { x, y: y2, screenX, screenY, clientX = x, clientY = y2, button, buttons, relatedTarget, offsetX, offsetY, pageX, pageY }) {
    assignProps(event, {
      screenX: sanitizeNumber(screenX),
      screenY: sanitizeNumber(screenY),
      clientX: sanitizeNumber(clientX),
      x: sanitizeNumber(clientX),
      clientY: sanitizeNumber(clientY),
      y: sanitizeNumber(clientY),
      button: sanitizeNumber(button),
      buttons: sanitizeNumber(buttons),
      relatedTarget,
      offsetX: sanitizeNumber(offsetX),
      offsetY: sanitizeNumber(offsetY),
      pageX: sanitizeNumber(pageX),
      pageY: sanitizeNumber(pageY)
    });
  }
  function initPointerEvent(event, { pointerId, width, height, pressure, tangentialPressure, tiltX, tiltY, twist, pointerType, isPrimary }) {
    assignProps(event, {
      pointerId: sanitizeNumber(pointerId),
      width: sanitizeNumber(width !== null && width !== void 0 ? width : 1),
      height: sanitizeNumber(height !== null && height !== void 0 ? height : 1),
      pressure: sanitizeNumber(pressure),
      tangentialPressure: sanitizeNumber(tangentialPressure),
      tiltX: sanitizeNumber(tiltX),
      tiltY: sanitizeNumber(tiltY),
      twist: sanitizeNumber(twist),
      pointerType: String(pointerType),
      isPrimary: Boolean(isPrimary)
    });
  }
  function dispatchUIEvent(target, type2, init, preventDefault = false) {
    if (isMouseEvent(type2) || isKeyboardEvent(type2)) {
      init = {
        ...init,
        ...this.system.getUIEventModifiers()
      };
    }
    const event = createEvent(type2, target, init);
    return dispatchEvent.call(this, target, event, preventDefault);
  }
  function dispatchEvent(target, event, preventDefault = false) {
    var _behavior_type;
    const type2 = event.type;
    const behaviorImplementation = preventDefault ? () => {
    } : (_behavior_type = behavior[type2]) === null || _behavior_type === void 0 ? void 0 : _behavior_type.call(behavior, event, target, this);
    if (behaviorImplementation) {
      event.preventDefault();
      let defaultPrevented = false;
      Object.defineProperty(event, "defaultPrevented", {
        get: () => defaultPrevented
      });
      Object.defineProperty(event, "preventDefault", {
        value: () => {
          defaultPrevented = event.cancelable;
        }
      });
      wrapEvent(() => target.dispatchEvent(event));
      if (!defaultPrevented) {
        behaviorImplementation();
      }
      return !defaultPrevented;
    }
    return wrapEvent(() => target.dispatchEvent(event));
  }
  function dispatchDOMEvent(target, type2, init) {
    const event = createEvent(type2, target, init);
    wrapEvent(() => target.dispatchEvent(event));
  }
  const patched = Symbol("patched focus/blur methods");
  function patchFocus(HTMLElement) {
    if (HTMLElement.prototype[patched]) {
      return;
    }
    const { focus, blur } = HTMLElement.prototype;
    Object.defineProperties(HTMLElement.prototype, {
      focus: {
        configurable: true,
        get: () => patchedFocus
      },
      blur: {
        configurable: true,
        get: () => patchedBlur
      },
      [patched]: {
        configurable: true,
        get: () => ({
          focus,
          blur
        })
      }
    });
    let activeCall;
    function patchedFocus(options) {
      if (this.ownerDocument.visibilityState !== "hidden") {
        return focus.call(this, options);
      }
      const blurred = getActiveTarget(this.ownerDocument);
      if (blurred === this) {
        return;
      }
      const thisCall = Symbol("focus call");
      activeCall = thisCall;
      if (blurred) {
        blur.call(blurred);
        dispatchDOMEvent(blurred, "blur", {
          relatedTarget: this
        });
        dispatchDOMEvent(blurred, "focusout", {
          relatedTarget: activeCall === thisCall ? this : null
        });
      }
      if (activeCall === thisCall) {
        focus.call(this, options);
        dispatchDOMEvent(this, "focus", {
          relatedTarget: blurred
        });
      }
      if (activeCall === thisCall) {
        dispatchDOMEvent(this, "focusin", {
          relatedTarget: blurred
        });
      }
    }
    function patchedBlur() {
      if (this.ownerDocument.visibilityState !== "hidden") {
        return blur.call(this);
      }
      const blurred = getActiveTarget(this.ownerDocument);
      if (blurred !== this) {
        return;
      }
      const thisCall = Symbol("blur call");
      activeCall = thisCall;
      blur.call(this);
      dispatchDOMEvent(blurred, "blur", {
        relatedTarget: null
      });
      dispatchDOMEvent(blurred, "focusout", {
        relatedTarget: null
      });
    }
  }
  function getActiveTarget(document2) {
    const active = getActiveElement(document2);
    return (active === null || active === void 0 ? void 0 : active.tagName) === "BODY" ? null : active;
  }
  const Interceptor = Symbol("Interceptor for programmatical calls");
  function prepareInterceptor(element, propName, interceptorImpl) {
    const prototypeDescriptor = Object.getOwnPropertyDescriptor(element.constructor.prototype, propName);
    const objectDescriptor = Object.getOwnPropertyDescriptor(element, propName);
    const target = (prototypeDescriptor === null || prototypeDescriptor === void 0 ? void 0 : prototypeDescriptor.set) ? "set" : "value";
    if (typeof (prototypeDescriptor === null || prototypeDescriptor === void 0 ? void 0 : prototypeDescriptor[target]) !== "function" || prototypeDescriptor[target][Interceptor]) {
      throw new Error(`Element ${element.tagName} does not implement "${String(propName)}".`);
    }
    function intercept(...args) {
      const { applyNative = false, realArgs, then } = interceptorImpl.call(this, ...args);
      const realFunc = (!applyNative && objectDescriptor || prototypeDescriptor)[target];
      if (target === "set") {
        realFunc.call(this, realArgs);
      } else {
        realFunc.call(this, ...realArgs);
      }
      then === null || then === void 0 ? void 0 : then();
    }
    intercept[Interceptor] = Interceptor;
    Object.defineProperty(element, propName, {
      ...objectDescriptor !== null && objectDescriptor !== void 0 ? objectDescriptor : prototypeDescriptor,
      [target]: intercept
    });
  }
  function prepareValueInterceptor(element) {
    prepareInterceptor(element, "value", function interceptorImpl(v2) {
      const isUI = isUIValue(v2);
      if (isUI) {
        startTrackValue(this);
      }
      return {
        applyNative: !!isUI,
        realArgs: sanitizeValue(this, v2),
        then: isUI ? void 0 : () => trackOrSetValue(this, String(v2))
      };
    });
  }
  function sanitizeValue(element, v2) {
    if (isElementType(element, "input", {
      type: "number"
    }) && String(v2) !== "" && !Number.isNaN(Number(v2))) {
      return String(Number(v2));
    }
    return String(v2);
  }
  function prepareSelectionInterceptor(element) {
    prepareInterceptor(element, "setSelectionRange", function interceptorImpl(start, ...others) {
      const isUI = isUISelectionStart(start);
      return {
        applyNative: !!isUI,
        realArgs: [
          Number(start),
          ...others
        ],
        then: () => isUI ? void 0 : setUISelectionClean(element)
      };
    });
    prepareInterceptor(element, "selectionStart", function interceptorImpl(v2) {
      return {
        realArgs: v2,
        then: () => setUISelectionClean(element)
      };
    });
    prepareInterceptor(element, "selectionEnd", function interceptorImpl(v2) {
      return {
        realArgs: v2,
        then: () => setUISelectionClean(element)
      };
    });
    prepareInterceptor(element, "select", function interceptorImpl() {
      return {
        realArgs: [],
        then: () => setUISelectionRaw(element, {
          anchorOffset: 0,
          focusOffset: getUIValue(element).length
        })
      };
    });
  }
  function prepareRangeTextInterceptor(element) {
    prepareInterceptor(element, "setRangeText", function interceptorImpl(...realArgs) {
      return {
        realArgs,
        then: () => {
          setUIValueClean(element);
          setUISelectionClean(element);
        }
      };
    });
  }
  const isPrepared = Symbol("Node prepared with document state workarounds");
  function prepareDocument(document2) {
    if (document2[isPrepared]) {
      return;
    }
    document2.addEventListener("focus", (e2) => {
      const el = e2.target;
      prepareElement(el);
    }, {
      capture: true,
      passive: true
    });
    if (document2.activeElement) {
      prepareElement(document2.activeElement);
    }
    document2.addEventListener("blur", (e2) => {
      const el = e2.target;
      const initialValue2 = getInitialValue(el);
      if (initialValue2 !== void 0) {
        if (el.value !== initialValue2) {
          dispatchDOMEvent(el, "change");
        }
        clearInitialValue(el);
      }
    }, {
      capture: true,
      passive: true
    });
    document2[isPrepared] = isPrepared;
  }
  function prepareElement(el) {
    if (el[isPrepared]) {
      return;
    }
    if (isElementType(el, [
      "input",
      "textarea"
    ])) {
      prepareValueInterceptor(el);
      prepareSelectionInterceptor(el);
      prepareRangeTextInterceptor(el);
    }
    el[isPrepared] = isPrepared;
  }
  function getDocumentFromNode(el) {
    return isDocument(el) ? el : el.ownerDocument;
  }
  function isDocument(node) {
    return node.nodeType === 9;
  }
  var ApiLevel = /* @__PURE__ */ function(ApiLevel2) {
    ApiLevel2[ApiLevel2["Trigger"] = 2] = "Trigger";
    ApiLevel2[ApiLevel2["Call"] = 1] = "Call";
    return ApiLevel2;
  }({});
  function setLevelRef(instance, level) {
    instance.levelRefs[level] = {};
  }
  function getLevelRef(instance, level) {
    return instance.levelRefs[level];
  }
  function wait(config2) {
    const delay = config2.delay;
    if (typeof delay !== "number") {
      return;
    }
    return Promise.all([
      new Promise((resolve2) => globalThis.setTimeout(() => resolve2(), delay)),
      config2.advanceTimers(delay)
    ]);
  }
  var PointerEventsCheckLevel = /* @__PURE__ */ function(PointerEventsCheckLevel2) {
    PointerEventsCheckLevel2[PointerEventsCheckLevel2["EachTrigger"] = 4] = "EachTrigger";
    PointerEventsCheckLevel2[PointerEventsCheckLevel2["EachApiCall"] = 2] = "EachApiCall";
    PointerEventsCheckLevel2[PointerEventsCheckLevel2["EachTarget"] = 1] = "EachTarget";
    PointerEventsCheckLevel2[PointerEventsCheckLevel2["Never"] = 0] = "Never";
    return PointerEventsCheckLevel2;
  }({});
  function _define_property$6(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var DOM_KEY_LOCATION = /* @__PURE__ */ function(DOM_KEY_LOCATION2) {
    DOM_KEY_LOCATION2[DOM_KEY_LOCATION2["STANDARD"] = 0] = "STANDARD";
    DOM_KEY_LOCATION2[DOM_KEY_LOCATION2["LEFT"] = 1] = "LEFT";
    DOM_KEY_LOCATION2[DOM_KEY_LOCATION2["RIGHT"] = 2] = "RIGHT";
    DOM_KEY_LOCATION2[DOM_KEY_LOCATION2["NUMPAD"] = 3] = "NUMPAD";
    return DOM_KEY_LOCATION2;
  }({});
  const modifierKeys = [
    "Alt",
    "AltGraph",
    "Control",
    "Fn",
    "Meta",
    "Shift",
    "Symbol"
  ];
  function isModifierKey(key) {
    return modifierKeys.includes(key);
  }
  const modifierLocks = [
    "CapsLock",
    "FnLock",
    "NumLock",
    "ScrollLock",
    "SymbolLock"
  ];
  function isModifierLock(key) {
    return modifierLocks.includes(key);
  }
  class KeyboardHost {
    isKeyPressed(keyDef) {
      return this.pressed.has(String(keyDef.code));
    }
    getPressedKeys() {
      return this.pressed.values().map((p3) => p3.keyDef);
    }
    /** Press a key */
    async keydown(instance, keyDef) {
      const key = String(keyDef.key);
      const code = String(keyDef.code);
      const target = getActiveElementOrBody(instance.config.document);
      this.setKeydownTarget(target);
      this.pressed.add(code, keyDef);
      if (isModifierKey(key)) {
        this.modifiers[key] = true;
      }
      const unprevented = instance.dispatchUIEvent(target, "keydown", {
        key,
        code
      });
      if (isModifierLock(key) && !this.modifiers[key]) {
        this.modifiers[key] = true;
        this.modifierLockStart[key] = true;
      }
      if (unprevented) {
        this.pressed.setUnprevented(code);
      }
      if (unprevented && this.hasKeyPress(key)) {
        instance.dispatchUIEvent(getActiveElementOrBody(instance.config.document), "keypress", {
          key,
          code,
          charCode: keyDef.key === "Enter" ? 13 : String(keyDef.key).charCodeAt(0)
        });
      }
    }
    /** Release a key */
    async keyup(instance, keyDef) {
      const key = String(keyDef.key);
      const code = String(keyDef.code);
      const unprevented = this.pressed.isUnprevented(code);
      this.pressed.delete(code);
      if (isModifierKey(key) && !this.pressed.values().find((p3) => p3.keyDef.key === key)) {
        this.modifiers[key] = false;
      }
      instance.dispatchUIEvent(getActiveElementOrBody(instance.config.document), "keyup", {
        key,
        code
      }, !unprevented);
      if (isModifierLock(key) && this.modifiers[key]) {
        if (this.modifierLockStart[key]) {
          this.modifierLockStart[key] = false;
        } else {
          this.modifiers[key] = false;
        }
      }
    }
    setKeydownTarget(target) {
      if (target !== this.lastKeydownTarget) {
        this.carryChar = "";
      }
      this.lastKeydownTarget = target;
    }
    hasKeyPress(key) {
      return (key.length === 1 || key === "Enter") && !this.modifiers.Control && !this.modifiers.Alt;
    }
    constructor(system) {
      _define_property$6(this, "system", void 0);
      _define_property$6(this, "modifiers", {
        Alt: false,
        AltGraph: false,
        CapsLock: false,
        Control: false,
        Fn: false,
        FnLock: false,
        Meta: false,
        NumLock: false,
        ScrollLock: false,
        Shift: false,
        Symbol: false,
        SymbolLock: false
      });
      _define_property$6(this, "pressed", new class {
        add(code, keyDef) {
          var _this_registry, _code;
          var _2;
          (_2 = (_this_registry = this.registry)[_code = code]) !== null && _2 !== void 0 ? _2 : _this_registry[_code] = {
            keyDef,
            unpreventedDefault: false
          };
        }
        has(code) {
          return !!this.registry[code];
        }
        setUnprevented(code) {
          const o = this.registry[code];
          if (o) {
            o.unpreventedDefault = true;
          }
        }
        isUnprevented(code) {
          var _this_registry_code;
          return !!((_this_registry_code = this.registry[code]) === null || _this_registry_code === void 0 ? void 0 : _this_registry_code.unpreventedDefault);
        }
        delete(code) {
          delete this.registry[code];
        }
        values() {
          return Object.values(this.registry);
        }
        constructor() {
          _define_property$6(this, "registry", {});
        }
      }());
      _define_property$6(this, "carryChar", "");
      _define_property$6(this, "lastKeydownTarget", void 0);
      _define_property$6(this, "modifierLockStart", {});
      this.system = system;
    }
  }
  const defaultKeyMap$1 = [
    // alphanumeric block - writing system
    ..."0123456789".split("").map((c2) => ({
      code: `Digit${c2}`,
      key: c2
    })),
    ...")!@#$%^&*(".split("").map((c2, i) => ({
      code: `Digit${i}`,
      key: c2,
      shiftKey: true
    })),
    ..."abcdefghijklmnopqrstuvwxyz".split("").map((c2) => ({
      code: `Key${c2.toUpperCase()}`,
      key: c2
    })),
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c2) => ({
      code: `Key${c2}`,
      key: c2,
      shiftKey: true
    })),
    {
      code: "BracketLeft",
      key: "["
    },
    {
      code: "BracketLeft",
      key: "{",
      shiftKey: true
    },
    {
      code: "BracketRight",
      key: "]"
    },
    {
      code: "BracketRight",
      key: "}",
      shiftKey: true
    },
    // alphanumeric block - functional
    {
      code: "Space",
      key: " "
    },
    {
      code: "AltLeft",
      key: "Alt",
      location: DOM_KEY_LOCATION.LEFT
    },
    {
      code: "AltRight",
      key: "Alt",
      location: DOM_KEY_LOCATION.RIGHT
    },
    {
      code: "ShiftLeft",
      key: "Shift",
      location: DOM_KEY_LOCATION.LEFT
    },
    {
      code: "ShiftRight",
      key: "Shift",
      location: DOM_KEY_LOCATION.RIGHT
    },
    {
      code: "ControlLeft",
      key: "Control",
      location: DOM_KEY_LOCATION.LEFT
    },
    {
      code: "ControlRight",
      key: "Control",
      location: DOM_KEY_LOCATION.RIGHT
    },
    {
      code: "MetaLeft",
      key: "Meta",
      location: DOM_KEY_LOCATION.LEFT
    },
    {
      code: "MetaRight",
      key: "Meta",
      location: DOM_KEY_LOCATION.RIGHT
    },
    {
      code: "OSLeft",
      key: "OS",
      location: DOM_KEY_LOCATION.LEFT
    },
    {
      code: "OSRight",
      key: "OS",
      location: DOM_KEY_LOCATION.RIGHT
    },
    {
      code: "ContextMenu",
      key: "ContextMenu"
    },
    {
      code: "Tab",
      key: "Tab"
    },
    {
      code: "CapsLock",
      key: "CapsLock"
    },
    {
      code: "Backspace",
      key: "Backspace"
    },
    {
      code: "Enter",
      key: "Enter"
    },
    // function
    {
      code: "Escape",
      key: "Escape"
    },
    // arrows
    {
      code: "ArrowUp",
      key: "ArrowUp"
    },
    {
      code: "ArrowDown",
      key: "ArrowDown"
    },
    {
      code: "ArrowLeft",
      key: "ArrowLeft"
    },
    {
      code: "ArrowRight",
      key: "ArrowRight"
    },
    // control pad
    {
      code: "Home",
      key: "Home"
    },
    {
      code: "End",
      key: "End"
    },
    {
      code: "Delete",
      key: "Delete"
    },
    {
      code: "PageUp",
      key: "PageUp"
    },
    {
      code: "PageDown",
      key: "PageDown"
    },
    // Special keys that are not part of a default US-layout but included for specific behavior
    {
      code: "Fn",
      key: "Fn"
    },
    {
      code: "Symbol",
      key: "Symbol"
    },
    {
      code: "AltRight",
      key: "AltGraph"
    }
  ];
  const defaultKeyMap = [
    {
      name: "MouseLeft",
      pointerType: "mouse",
      button: "primary"
    },
    {
      name: "MouseRight",
      pointerType: "mouse",
      button: "secondary"
    },
    {
      name: "MouseMiddle",
      pointerType: "mouse",
      button: "auxiliary"
    },
    {
      name: "TouchA",
      pointerType: "touch"
    },
    {
      name: "TouchB",
      pointerType: "touch"
    },
    {
      name: "TouchC",
      pointerType: "touch"
    }
  ];
  function _define_property$5(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class Buttons {
    getButtons() {
      let v2 = 0;
      for (const button of Object.keys(this.pressed)) {
        v2 |= 2 ** Number(button);
      }
      return v2;
    }
    down(keyDef) {
      const button = getMouseButtonId(keyDef.button);
      if (button in this.pressed) {
        this.pressed[button].push(keyDef);
        return void 0;
      }
      this.pressed[button] = [
        keyDef
      ];
      return button;
    }
    up(keyDef) {
      const button = getMouseButtonId(keyDef.button);
      if (button in this.pressed) {
        this.pressed[button] = this.pressed[button].filter((k) => k.name !== keyDef.name);
        if (this.pressed[button].length === 0) {
          delete this.pressed[button];
          return button;
        }
      }
      return void 0;
    }
    constructor() {
      _define_property$5(this, "pressed", {});
    }
  }
  const MouseButton = {
    primary: 0,
    secondary: 1,
    auxiliary: 2,
    back: 3,
    X1: 3,
    forward: 4,
    X2: 4
  };
  function getMouseButtonId(button = 0) {
    if (button in MouseButton) {
      return MouseButton[button];
    }
    return Number(button);
  }
  const MouseButtonFlip = {
    1: 2,
    2: 1
  };
  function getMouseEventButton(button) {
    button = getMouseButtonId(button);
    if (button in MouseButtonFlip) {
      return MouseButtonFlip[button];
    }
    return button;
  }
  function _define_property$4(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class Device {
    get countPressed() {
      return this.pressedKeys.size;
    }
    isPressed(keyDef) {
      return this.pressedKeys.has(keyDef.name);
    }
    addPressed(keyDef) {
      return this.pressedKeys.add(keyDef.name);
    }
    removePressed(keyDef) {
      return this.pressedKeys.delete(keyDef.name);
    }
    constructor() {
      _define_property$4(this, "pressedKeys", /* @__PURE__ */ new Set());
    }
  }
  function getTreeDiff(a, b2) {
    const treeA = [];
    for (let el = a; el; el = el.parentElement) {
      treeA.push(el);
    }
    const treeB = [];
    for (let el = b2; el; el = el.parentElement) {
      treeB.push(el);
    }
    let i = 0;
    for (; ; i++) {
      if (i >= treeA.length || i >= treeB.length || treeA[treeA.length - 1 - i] !== treeB[treeB.length - 1 - i]) {
        break;
      }
    }
    return [
      treeA.slice(0, treeA.length - i),
      treeB.slice(0, treeB.length - i),
      treeB.slice(treeB.length - i)
    ];
  }
  function resolveCaretPosition({ target, node, offset }) {
    if (hasOwnSelection(target)) {
      return {
        node: target,
        offset: offset !== null && offset !== void 0 ? offset : getUIValue(target).length
      };
    } else if (node) {
      return {
        node,
        offset: offset !== null && offset !== void 0 ? offset : node.nodeType === 3 ? node.nodeValue.length : node.childNodes.length
      };
    }
    return findNodeAtTextOffset(target, offset);
  }
  function findNodeAtTextOffset(node, offset, isRoot = true) {
    let i = offset === void 0 ? node.childNodes.length - 1 : 0;
    const step = offset === void 0 ? -1 : 1;
    while (offset === void 0 ? i >= (isRoot ? Math.max(node.childNodes.length - 1, 0) : 0) : i <= node.childNodes.length) {
      if (offset && i === node.childNodes.length) {
        throw new Error("The given offset is out of bounds.");
      }
      const c2 = node.childNodes.item(i);
      const text = String(c2.textContent);
      if (text.length) {
        if (offset !== void 0 && text.length < offset) {
          offset -= text.length;
        } else if (c2.nodeType === 1) {
          return findNodeAtTextOffset(c2, offset, false);
        } else {
          if (c2.nodeType === 3) {
            return {
              node: c2,
              offset: offset !== null && offset !== void 0 ? offset : c2.nodeValue.length
            };
          }
        }
      }
      i += step;
    }
    return {
      node,
      offset: node.childNodes.length
    };
  }
  function setSelectionPerMouseDown({ document: document2, target, clickCount, node, offset }) {
    if (hasNoSelection(target)) {
      return;
    }
    const targetHasOwnSelection = hasOwnSelection(target);
    const text = String(targetHasOwnSelection ? getUIValue(target) : target.textContent);
    const [start, end] = node ? (
      // which elements might be considered in the same line of text.
      // TODO: support expanding initial range on multiple clicks if node is given
      [
        offset,
        offset
      ]
    ) : getTextRange(text, offset, clickCount);
    if (targetHasOwnSelection) {
      setUISelection(target, {
        anchorOffset: start !== null && start !== void 0 ? start : text.length,
        focusOffset: end !== null && end !== void 0 ? end : text.length
      });
      return {
        node: target,
        start: start !== null && start !== void 0 ? start : 0,
        end: end !== null && end !== void 0 ? end : text.length
      };
    } else {
      const { node: startNode, offset: startOffset } = resolveCaretPosition({
        target,
        node,
        offset: start
      });
      const { node: endNode, offset: endOffset } = resolveCaretPosition({
        target,
        node,
        offset: end
      });
      const range = target.ownerDocument.createRange();
      try {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
      } catch (e2) {
        throw new Error("The given offset is out of bounds.");
      }
      const selection = document2.getSelection();
      selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
      selection === null || selection === void 0 ? void 0 : selection.addRange(range.cloneRange());
      return range;
    }
  }
  function getTextRange(text, pos, clickCount) {
    if (clickCount % 3 === 1 || text.length === 0) {
      return [
        pos,
        pos
      ];
    }
    const textPos = pos !== null && pos !== void 0 ? pos : text.length;
    if (clickCount % 3 === 2) {
      return [
        textPos - text.substr(0, pos).match(/(\w+|\s+|\W)?$/)[0].length,
        pos === void 0 ? pos : pos + text.substr(pos).match(/^(\w+|\s+|\W)?/)[0].length
      ];
    }
    return [
      textPos - text.substr(0, pos).match(/[^\r\n]*$/)[0].length,
      pos === void 0 ? pos : pos + text.substr(pos).match(/^[^\r\n]*/)[0].length
    ];
  }
  function modifySelectionPerMouseMove(selectionRange, { document: document2, target, node, offset }) {
    const selectionFocus = resolveCaretPosition({
      target,
      node,
      offset
    });
    if ("node" in selectionRange) {
      if (selectionFocus.node === selectionRange.node) {
        const anchorOffset = selectionFocus.offset < selectionRange.start ? selectionRange.end : selectionRange.start;
        const focusOffset = selectionFocus.offset > selectionRange.end || selectionFocus.offset < selectionRange.start ? selectionFocus.offset : selectionRange.end;
        setUISelection(selectionRange.node, {
          anchorOffset,
          focusOffset
        });
      }
    } else {
      const range = selectionRange.cloneRange();
      const cmp = range.comparePoint(selectionFocus.node, selectionFocus.offset);
      if (cmp < 0) {
        range.setStart(selectionFocus.node, selectionFocus.offset);
      } else if (cmp > 0) {
        range.setEnd(selectionFocus.node, selectionFocus.offset);
      }
      const selection = document2.getSelection();
      selection === null || selection === void 0 ? void 0 : selection.removeAllRanges();
      selection === null || selection === void 0 ? void 0 : selection.addRange(range.cloneRange());
    }
  }
  function isDifferentPointerPosition(positionA, positionB) {
    var _positionA_coords, _positionB_coords, _positionA_coords1, _positionB_coords1, _positionA_coords2, _positionB_coords2, _positionA_coords3, _positionB_coords3, _positionA_coords4, _positionB_coords4, _positionA_coords5, _positionB_coords5, _positionA_coords6, _positionB_coords6, _positionA_coords7, _positionB_coords7, _positionA_coords8, _positionB_coords8, _positionA_coords9, _positionB_coords9, _positionA_caret, _positionB_caret, _positionA_caret1, _positionB_caret1;
    return positionA.target !== positionB.target || ((_positionA_coords = positionA.coords) === null || _positionA_coords === void 0 ? void 0 : _positionA_coords.x) !== ((_positionB_coords = positionB.coords) === null || _positionB_coords === void 0 ? void 0 : _positionB_coords.x) || ((_positionA_coords1 = positionA.coords) === null || _positionA_coords1 === void 0 ? void 0 : _positionA_coords1.y) !== ((_positionB_coords1 = positionB.coords) === null || _positionB_coords1 === void 0 ? void 0 : _positionB_coords1.y) || ((_positionA_coords2 = positionA.coords) === null || _positionA_coords2 === void 0 ? void 0 : _positionA_coords2.clientX) !== ((_positionB_coords2 = positionB.coords) === null || _positionB_coords2 === void 0 ? void 0 : _positionB_coords2.clientX) || ((_positionA_coords3 = positionA.coords) === null || _positionA_coords3 === void 0 ? void 0 : _positionA_coords3.clientY) !== ((_positionB_coords3 = positionB.coords) === null || _positionB_coords3 === void 0 ? void 0 : _positionB_coords3.clientY) || ((_positionA_coords4 = positionA.coords) === null || _positionA_coords4 === void 0 ? void 0 : _positionA_coords4.offsetX) !== ((_positionB_coords4 = positionB.coords) === null || _positionB_coords4 === void 0 ? void 0 : _positionB_coords4.offsetX) || ((_positionA_coords5 = positionA.coords) === null || _positionA_coords5 === void 0 ? void 0 : _positionA_coords5.offsetY) !== ((_positionB_coords5 = positionB.coords) === null || _positionB_coords5 === void 0 ? void 0 : _positionB_coords5.offsetY) || ((_positionA_coords6 = positionA.coords) === null || _positionA_coords6 === void 0 ? void 0 : _positionA_coords6.pageX) !== ((_positionB_coords6 = positionB.coords) === null || _positionB_coords6 === void 0 ? void 0 : _positionB_coords6.pageX) || ((_positionA_coords7 = positionA.coords) === null || _positionA_coords7 === void 0 ? void 0 : _positionA_coords7.pageY) !== ((_positionB_coords7 = positionB.coords) === null || _positionB_coords7 === void 0 ? void 0 : _positionB_coords7.pageY) || ((_positionA_coords8 = positionA.coords) === null || _positionA_coords8 === void 0 ? void 0 : _positionA_coords8.screenX) !== ((_positionB_coords8 = positionB.coords) === null || _positionB_coords8 === void 0 ? void 0 : _positionB_coords8.screenX) || ((_positionA_coords9 = positionA.coords) === null || _positionA_coords9 === void 0 ? void 0 : _positionA_coords9.screenY) !== ((_positionB_coords9 = positionB.coords) === null || _positionB_coords9 === void 0 ? void 0 : _positionB_coords9.screenY) || ((_positionA_caret = positionA.caret) === null || _positionA_caret === void 0 ? void 0 : _positionA_caret.node) !== ((_positionB_caret = positionB.caret) === null || _positionB_caret === void 0 ? void 0 : _positionB_caret.node) || ((_positionA_caret1 = positionA.caret) === null || _positionA_caret1 === void 0 ? void 0 : _positionA_caret1.offset) !== ((_positionB_caret1 = positionB.caret) === null || _positionB_caret1 === void 0 ? void 0 : _positionB_caret1.offset);
  }
  function _define_property$3(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class Mouse {
    move(instance, position, isPrevented) {
      const prevPosition = this.position;
      const prevTarget = this.getTarget(instance);
      this.position = position;
      if (!isDifferentPointerPosition(prevPosition, position)) {
        return;
      }
      const nextTarget = this.getTarget(instance);
      const init = this.getEventInit("mousemove");
      const [leave, enter] = getTreeDiff(prevTarget, nextTarget);
      return {
        leave: () => {
          if (prevTarget !== nextTarget) {
            instance.dispatchUIEvent(prevTarget, "mouseout", init);
            leave.forEach((el) => instance.dispatchUIEvent(el, "mouseleave", init));
          }
        },
        enter: () => {
          if (prevTarget !== nextTarget) {
            instance.dispatchUIEvent(nextTarget, "mouseover", init);
            enter.forEach((el) => instance.dispatchUIEvent(el, "mouseenter", init));
          }
        },
        move: () => {
          if (isPrevented) {
            return;
          }
          instance.dispatchUIEvent(nextTarget, "mousemove", init);
          this.modifySelecting(instance);
        }
      };
    }
    down(instance, keyDef, isPrevented) {
      const button = this.buttons.down(keyDef);
      if (button === void 0) {
        return;
      }
      const target = this.getTarget(instance);
      this.buttonDownTarget[button] = target;
      const init = this.getEventInit("mousedown", keyDef.button);
      const disabled = isDisabled(target);
      if (!isPrevented && (disabled || instance.dispatchUIEvent(target, "mousedown", init))) {
        this.startSelecting(instance, init.detail);
        focusElement(target);
      }
      if (!disabled && getMouseEventButton(keyDef.button) === 2) {
        instance.dispatchUIEvent(target, "contextmenu", this.getEventInit("contextmenu", keyDef.button));
      }
    }
    up(instance, keyDef, isPrevented) {
      const button = this.buttons.up(keyDef);
      if (button === void 0) {
        return;
      }
      const target = this.getTarget(instance);
      if (!isDisabled(target)) {
        if (!isPrevented) {
          const mouseUpInit = this.getEventInit("mouseup", keyDef.button);
          instance.dispatchUIEvent(target, "mouseup", mouseUpInit);
          this.endSelecting();
        }
        const clickTarget = getTreeDiff(this.buttonDownTarget[button], target)[2][0];
        if (clickTarget) {
          const init = this.getEventInit("click", keyDef.button);
          if (init.detail) {
            instance.dispatchUIEvent(clickTarget, init.button === 0 ? "click" : "auxclick", init);
            if (init.button === 0 && init.detail === 2) {
              instance.dispatchUIEvent(clickTarget, "dblclick", {
                ...this.getEventInit("dblclick", keyDef.button),
                detail: init.detail
              });
            }
          }
        }
      }
    }
    resetClickCount() {
      this.clickCount.reset();
    }
    getEventInit(type2, button) {
      const init = {
        ...this.position.coords
      };
      init.button = getMouseEventButton(button);
      init.buttons = this.buttons.getButtons();
      if (type2 === "mousedown") {
        init.detail = this.clickCount.getOnDown(init.button);
      } else if (type2 === "mouseup") {
        init.detail = this.clickCount.getOnUp(init.button);
      } else if (type2 === "click" || type2 === "auxclick") {
        init.detail = this.clickCount.incOnClick(init.button);
      }
      return init;
    }
    getTarget(instance) {
      var _this_position_target;
      return (_this_position_target = this.position.target) !== null && _this_position_target !== void 0 ? _this_position_target : instance.config.document.body;
    }
    startSelecting(instance, clickCount) {
      var _this_position_caret, _this_position_caret1;
      this.selecting = setSelectionPerMouseDown({
        document: instance.config.document,
        target: this.getTarget(instance),
        node: (_this_position_caret = this.position.caret) === null || _this_position_caret === void 0 ? void 0 : _this_position_caret.node,
        offset: (_this_position_caret1 = this.position.caret) === null || _this_position_caret1 === void 0 ? void 0 : _this_position_caret1.offset,
        clickCount
      });
    }
    modifySelecting(instance) {
      var _this_position_caret, _this_position_caret1;
      if (!this.selecting) {
        return;
      }
      modifySelectionPerMouseMove(this.selecting, {
        document: instance.config.document,
        target: this.getTarget(instance),
        node: (_this_position_caret = this.position.caret) === null || _this_position_caret === void 0 ? void 0 : _this_position_caret.node,
        offset: (_this_position_caret1 = this.position.caret) === null || _this_position_caret1 === void 0 ? void 0 : _this_position_caret1.offset
      });
    }
    endSelecting() {
      this.selecting = void 0;
    }
    constructor() {
      _define_property$3(this, "position", {});
      _define_property$3(this, "buttons", new Buttons());
      _define_property$3(this, "selecting", void 0);
      _define_property$3(this, "buttonDownTarget", {});
      _define_property$3(this, "clickCount", new class {
        incOnClick(button) {
          const current = this.down[button] === void 0 ? void 0 : Number(this.down[button]) + 1;
          this.count = this.count[button] === void 0 ? {} : {
            [button]: Number(this.count[button]) + 1
          };
          return current;
        }
        getOnDown(button) {
          var _this_count_button;
          this.down = {
            [button]: (_this_count_button = this.count[button]) !== null && _this_count_button !== void 0 ? _this_count_button : 0
          };
          var _this_count_button1;
          this.count = {
            [button]: (_this_count_button1 = this.count[button]) !== null && _this_count_button1 !== void 0 ? _this_count_button1 : 0
          };
          return Number(this.count[button]) + 1;
        }
        getOnUp(button) {
          return this.down[button] === void 0 ? void 0 : Number(this.down[button]) + 1;
        }
        reset() {
          this.count = {};
        }
        constructor() {
          _define_property$3(this, "down", {});
          _define_property$3(this, "count", {});
        }
      }());
    }
  }
  function hasPointerEvents(instance, element) {
    var _checkPointerEvents;
    return ((_checkPointerEvents = checkPointerEvents(instance, element)) === null || _checkPointerEvents === void 0 ? void 0 : _checkPointerEvents.pointerEvents) !== "none";
  }
  function closestPointerEventsDeclaration(element) {
    const window2 = getWindow(element);
    for (let el = element, tree = []; el === null || el === void 0 ? void 0 : el.ownerDocument; el = el.parentElement) {
      tree.push(el);
      const pointerEvents = window2.getComputedStyle(el).pointerEvents;
      if (pointerEvents && ![
        "inherit",
        "unset"
      ].includes(pointerEvents)) {
        return {
          pointerEvents,
          tree
        };
      }
    }
    return void 0;
  }
  const PointerEventsCheck = Symbol("Last check for pointer-events");
  function checkPointerEvents(instance, element) {
    const lastCheck = element[PointerEventsCheck];
    const needsCheck = instance.config.pointerEventsCheck !== PointerEventsCheckLevel.Never && (!lastCheck || hasBitFlag(instance.config.pointerEventsCheck, PointerEventsCheckLevel.EachApiCall) && lastCheck[ApiLevel.Call] !== getLevelRef(instance, ApiLevel.Call) || hasBitFlag(instance.config.pointerEventsCheck, PointerEventsCheckLevel.EachTrigger) && lastCheck[ApiLevel.Trigger] !== getLevelRef(instance, ApiLevel.Trigger));
    if (!needsCheck) {
      return lastCheck === null || lastCheck === void 0 ? void 0 : lastCheck.result;
    }
    const declaration = closestPointerEventsDeclaration(element);
    element[PointerEventsCheck] = {
      [ApiLevel.Call]: getLevelRef(instance, ApiLevel.Call),
      [ApiLevel.Trigger]: getLevelRef(instance, ApiLevel.Trigger),
      result: declaration
    };
    return declaration;
  }
  function assertPointerEvents(instance, element) {
    const declaration = checkPointerEvents(instance, element);
    if ((declaration === null || declaration === void 0 ? void 0 : declaration.pointerEvents) === "none") {
      throw new Error([
        `Unable to perform pointer interaction as the element ${declaration.tree.length > 1 ? "inherits" : "has"} \`pointer-events: none\`:`,
        "",
        printTree(declaration.tree)
      ].join("\n"));
    }
  }
  function printTree(tree) {
    return tree.reverse().map((el, i) => [
      "".padEnd(i),
      el.tagName,
      el.id && `#${el.id}`,
      el.hasAttribute("data-testid") && `(testId=${el.getAttribute("data-testid")})`,
      getLabelDescr(el),
      tree.length > 1 && i === 0 && "  <-- This element declared `pointer-events: none`",
      tree.length > 1 && i === tree.length - 1 && "  <-- Asserted pointer events here"
    ].filter(Boolean).join("")).join("\n");
  }
  function getLabelDescr(element) {
    var _element_labels;
    let label;
    if (element.hasAttribute("aria-label")) {
      label = element.getAttribute("aria-label");
    } else if (element.hasAttribute("aria-labelledby")) {
      var _element_ownerDocument_getElementById_textContent, _element_ownerDocument_getElementById;
      label = (_element_ownerDocument_getElementById = element.ownerDocument.getElementById(element.getAttribute("aria-labelledby"))) === null || _element_ownerDocument_getElementById === void 0 ? void 0 : (_element_ownerDocument_getElementById_textContent = _element_ownerDocument_getElementById.textContent) === null || _element_ownerDocument_getElementById_textContent === void 0 ? void 0 : _element_ownerDocument_getElementById_textContent.trim();
    } else if (isElementType(element, [
      "button",
      "input",
      "meter",
      "output",
      "progress",
      "select",
      "textarea"
    ]) && ((_element_labels = element.labels) === null || _element_labels === void 0 ? void 0 : _element_labels.length)) {
      label = Array.from(element.labels).map((el) => {
        var _el_textContent;
        return (_el_textContent = el.textContent) === null || _el_textContent === void 0 ? void 0 : _el_textContent.trim();
      }).join("|");
    } else if (isElementType(element, "button")) {
      var _element_textContent;
      label = (_element_textContent = element.textContent) === null || _element_textContent === void 0 ? void 0 : _element_textContent.trim();
    }
    label = label === null || label === void 0 ? void 0 : label.replace(/\n/g, "  ");
    if (Number(label === null || label === void 0 ? void 0 : label.length) > 30) {
      label = `${label === null || label === void 0 ? void 0 : label.substring(0, 29)}…`;
    }
    return label ? `(label=${label})` : "";
  }
  function hasBitFlag(conf, flag) {
    return (conf & flag) > 0;
  }
  function _define_property$2(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class Pointer {
    init(instance) {
      const target = this.getTarget(instance);
      const [, enter] = getTreeDiff(null, target);
      const init = this.getEventInit();
      assertPointerEvents(instance, target);
      instance.dispatchUIEvent(target, "pointerover", init);
      enter.forEach((el) => instance.dispatchUIEvent(el, "pointerenter", init));
      return this;
    }
    move(instance, position) {
      const prevPosition = this.position;
      const prevTarget = this.getTarget(instance);
      this.position = position;
      if (!isDifferentPointerPosition(prevPosition, position)) {
        return;
      }
      const nextTarget = this.getTarget(instance);
      const init = this.getEventInit(-1);
      const [leave, enter] = getTreeDiff(prevTarget, nextTarget);
      return {
        leave: () => {
          if (hasPointerEvents(instance, prevTarget)) {
            if (prevTarget !== nextTarget) {
              instance.dispatchUIEvent(prevTarget, "pointerout", init);
              leave.forEach((el) => instance.dispatchUIEvent(el, "pointerleave", init));
            }
          }
        },
        enter: () => {
          assertPointerEvents(instance, nextTarget);
          if (prevTarget !== nextTarget) {
            instance.dispatchUIEvent(nextTarget, "pointerover", init);
            enter.forEach((el) => instance.dispatchUIEvent(el, "pointerenter", init));
          }
        },
        move: () => {
          instance.dispatchUIEvent(nextTarget, "pointermove", init);
        }
      };
    }
    down(instance, button = 0) {
      if (this.isDown) {
        return;
      }
      const target = this.getTarget(instance);
      assertPointerEvents(instance, target);
      this.isDown = true;
      this.isPrevented = !instance.dispatchUIEvent(target, "pointerdown", this.getEventInit(button));
    }
    up(instance, button = 0) {
      if (!this.isDown) {
        return;
      }
      const target = this.getTarget(instance);
      assertPointerEvents(instance, target);
      this.isPrevented = false;
      this.isDown = false;
      instance.dispatchUIEvent(target, "pointerup", this.getEventInit(button));
    }
    release(instance) {
      const target = this.getTarget(instance);
      const [leave] = getTreeDiff(target, null);
      const init = this.getEventInit();
      if (hasPointerEvents(instance, target)) {
        instance.dispatchUIEvent(target, "pointerout", init);
        leave.forEach((el) => instance.dispatchUIEvent(el, "pointerleave", init));
      }
      this.isCancelled = true;
    }
    getTarget(instance) {
      var _this_position_target;
      return (_this_position_target = this.position.target) !== null && _this_position_target !== void 0 ? _this_position_target : instance.config.document.body;
    }
    getEventInit(button) {
      return {
        ...this.position.coords,
        pointerId: this.pointerId,
        pointerType: this.pointerType,
        isPrimary: this.isPrimary,
        button: getMouseEventButton(button),
        buttons: this.buttons.getButtons()
      };
    }
    constructor({ pointerId, pointerType, isPrimary }, buttons) {
      _define_property$2(this, "pointerId", void 0);
      _define_property$2(this, "pointerType", void 0);
      _define_property$2(this, "isPrimary", void 0);
      _define_property$2(this, "buttons", void 0);
      _define_property$2(this, "isMultitouch", false);
      _define_property$2(this, "isCancelled", false);
      _define_property$2(this, "isDown", false);
      _define_property$2(this, "isPrevented", false);
      _define_property$2(this, "position", {});
      this.pointerId = pointerId;
      this.pointerType = pointerType;
      this.isPrimary = isPrimary;
      this.isMultitouch = !isPrimary;
      this.buttons = buttons;
    }
  }
  function _define_property$1(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class PointerHost {
    isKeyPressed(keyDef) {
      return this.devices.get(keyDef.pointerType).isPressed(keyDef);
    }
    async press(instance, keyDef, position) {
      this.devices.get(keyDef.pointerType).addPressed(keyDef);
      this.buttons.down(keyDef);
      const pointerName = this.getPointerName(keyDef);
      const pointer2 = keyDef.pointerType === "touch" ? this.pointers.new(pointerName, keyDef.pointerType, this.buttons) : this.pointers.get(pointerName);
      pointer2.position = position;
      if (pointer2.pointerType !== "touch") {
        this.mouse.position = position;
      }
      if (pointer2.pointerType === "touch") {
        pointer2.init(instance);
      }
      pointer2.down(instance, keyDef.button);
      if (pointer2.pointerType !== "touch") {
        this.mouse.down(instance, keyDef, pointer2.isPrevented);
      }
    }
    async move(instance, pointerName, position) {
      const pointer2 = this.pointers.get(pointerName);
      const pointermove = pointer2.move(instance, position);
      const mousemove = pointer2.pointerType === "touch" ? void 0 : this.mouse.move(instance, position, pointer2.isPrevented);
      pointermove === null || pointermove === void 0 ? void 0 : pointermove.leave();
      mousemove === null || mousemove === void 0 ? void 0 : mousemove.leave();
      pointermove === null || pointermove === void 0 ? void 0 : pointermove.enter();
      mousemove === null || mousemove === void 0 ? void 0 : mousemove.enter();
      pointermove === null || pointermove === void 0 ? void 0 : pointermove.move();
      mousemove === null || mousemove === void 0 ? void 0 : mousemove.move();
    }
    async release(instance, keyDef, position) {
      const device = this.devices.get(keyDef.pointerType);
      device.removePressed(keyDef);
      this.buttons.up(keyDef);
      const pointer2 = this.pointers.get(this.getPointerName(keyDef));
      const isPrevented = pointer2.isPrevented;
      pointer2.position = position;
      if (pointer2.pointerType !== "touch") {
        this.mouse.position = position;
      }
      if (device.countPressed === 0) {
        pointer2.up(instance, keyDef.button);
      }
      if (pointer2.pointerType === "touch") {
        pointer2.release(instance);
      }
      if (pointer2.pointerType === "touch" && !pointer2.isMultitouch) {
        const mousemove = this.mouse.move(instance, position, isPrevented);
        mousemove === null || mousemove === void 0 ? void 0 : mousemove.leave();
        mousemove === null || mousemove === void 0 ? void 0 : mousemove.enter();
        mousemove === null || mousemove === void 0 ? void 0 : mousemove.move();
        this.mouse.down(instance, keyDef, isPrevented);
      }
      if (!pointer2.isMultitouch) {
        const mousemove = this.mouse.move(instance, position, isPrevented);
        mousemove === null || mousemove === void 0 ? void 0 : mousemove.leave();
        mousemove === null || mousemove === void 0 ? void 0 : mousemove.enter();
        mousemove === null || mousemove === void 0 ? void 0 : mousemove.move();
        this.mouse.up(instance, keyDef, isPrevented);
      }
    }
    getPointerName(keyDef) {
      return keyDef.pointerType === "touch" ? keyDef.name : keyDef.pointerType;
    }
    getPreviousPosition(pointerName) {
      return this.pointers.has(pointerName) ? this.pointers.get(pointerName).position : void 0;
    }
    resetClickCount() {
      this.mouse.resetClickCount();
    }
    getMouseTarget(instance) {
      var _this_mouse_position_target;
      return (_this_mouse_position_target = this.mouse.position.target) !== null && _this_mouse_position_target !== void 0 ? _this_mouse_position_target : instance.config.document.body;
    }
    setMousePosition(position) {
      this.mouse.position = position;
      this.pointers.get("mouse").position = position;
    }
    constructor(system) {
      _define_property$1(this, "system", void 0);
      _define_property$1(this, "mouse", void 0);
      _define_property$1(this, "buttons", void 0);
      _define_property$1(this, "devices", new class {
        get(k) {
          var _this_registry, _k;
          var _2;
          return (_2 = (_this_registry = this.registry)[_k = k]) !== null && _2 !== void 0 ? _2 : _this_registry[_k] = new Device();
        }
        constructor() {
          _define_property$1(this, "registry", {});
        }
      }());
      _define_property$1(this, "pointers", new class {
        new(pointerName, pointerType, buttons) {
          const isPrimary = pointerType !== "touch" || !Object.values(this.registry).some((p3) => p3.pointerType === "touch" && !p3.isCancelled);
          if (!isPrimary) {
            Object.values(this.registry).forEach((p3) => {
              if (p3.pointerType === pointerType && !p3.isCancelled) {
                p3.isMultitouch = true;
              }
            });
          }
          this.registry[pointerName] = new Pointer({
            pointerId: this.nextId++,
            pointerType,
            isPrimary
          }, buttons);
          return this.registry[pointerName];
        }
        get(pointerName) {
          if (!this.has(pointerName)) {
            throw new Error(`Trying to access pointer "${pointerName}" which does not exist.`);
          }
          return this.registry[pointerName];
        }
        has(pointerName) {
          return pointerName in this.registry;
        }
        constructor() {
          _define_property$1(this, "registry", {});
          _define_property$1(this, "nextId", 1);
        }
      }());
      this.system = system;
      this.buttons = new Buttons();
      this.mouse = new Mouse();
      this.pointers.new("mouse", "mouse", this.buttons);
    }
  }
  function _define_property(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  class System {
    getUIEventModifiers() {
      return {
        altKey: this.keyboard.modifiers.Alt,
        ctrlKey: this.keyboard.modifiers.Control,
        metaKey: this.keyboard.modifiers.Meta,
        shiftKey: this.keyboard.modifiers.Shift,
        modifierAltGraph: this.keyboard.modifiers.AltGraph,
        modifierCapsLock: this.keyboard.modifiers.CapsLock,
        modifierFn: this.keyboard.modifiers.Fn,
        modifierFnLock: this.keyboard.modifiers.FnLock,
        modifierNumLock: this.keyboard.modifiers.NumLock,
        modifierScrollLock: this.keyboard.modifiers.ScrollLock,
        modifierSymbol: this.keyboard.modifiers.Symbol,
        modifierSymbolLock: this.keyboard.modifiers.SymbolLock
      };
    }
    constructor() {
      _define_property(this, "keyboard", new KeyboardHost(this));
      _define_property(this, "pointer", new PointerHost(this));
    }
  }
  async function click$1(element) {
    const pointerIn = [];
    if (!this.config.skipHover) {
      pointerIn.push({
        target: element
      });
    }
    pointerIn.push({
      keys: "[MouseLeft]",
      target: element
    });
    return this.pointer(pointerIn);
  }
  async function dblClick$1(element) {
    return this.pointer([
      {
        target: element
      },
      "[MouseLeft][MouseLeft]"
    ]);
  }
  async function tripleClick$1(element) {
    return this.pointer([
      {
        target: element
      },
      "[MouseLeft][MouseLeft][MouseLeft]"
    ]);
  }
  async function hover$1(element) {
    return this.pointer({
      target: element
    });
  }
  async function unhover$1(element) {
    assertPointerEvents(this, this.system.pointer.getMouseTarget(this));
    return this.pointer({
      target: element.ownerDocument.body
    });
  }
  async function tab$1({ shift } = {}) {
    return this.keyboard(shift === true ? "{Shift>}{Tab}{/Shift}" : shift === false ? "[/ShiftLeft][/ShiftRight]{Tab}" : "{Tab}");
  }
  var bracketDict = /* @__PURE__ */ function(bracketDict2) {
    bracketDict2["{"] = "}";
    bracketDict2["["] = "]";
    return bracketDict2;
  }(bracketDict || {});
  function readNextDescriptor(text, context) {
    let pos = 0;
    const startBracket = text[pos] in bracketDict ? text[pos] : "";
    pos += startBracket.length;
    const isEscapedChar = new RegExp(`^\\${startBracket}{2}`).test(text);
    const type2 = isEscapedChar ? "" : startBracket;
    return {
      type: type2,
      ...type2 === "" ? readPrintableChar(text, pos, context) : readTag(text, pos, type2, context)
    };
  }
  function readPrintableChar(text, pos, context) {
    const descriptor = text[pos];
    assertDescriptor(descriptor, text, pos, context);
    pos += descriptor.length;
    return {
      consumedLength: pos,
      descriptor,
      releasePrevious: false,
      releaseSelf: true,
      repeat: 1
    };
  }
  function readTag(text, pos, startBracket, context) {
    var _text_slice_match, _text_slice_match1;
    const releasePreviousModifier = text[pos] === "/" ? "/" : "";
    pos += releasePreviousModifier.length;
    const escapedDescriptor = startBracket === "{" && text[pos] === "\\";
    pos += Number(escapedDescriptor);
    const descriptor = escapedDescriptor ? text[pos] : (_text_slice_match = text.slice(pos).match(startBracket === "{" ? /^\w+|^[^}>/]/ : /^\w+/)) === null || _text_slice_match === void 0 ? void 0 : _text_slice_match[0];
    assertDescriptor(descriptor, text, pos, context);
    pos += descriptor.length;
    var _text_slice_match_;
    const repeatModifier = (_text_slice_match_ = (_text_slice_match1 = text.slice(pos).match(/^>\d+/)) === null || _text_slice_match1 === void 0 ? void 0 : _text_slice_match1[0]) !== null && _text_slice_match_ !== void 0 ? _text_slice_match_ : "";
    pos += repeatModifier.length;
    const releaseSelfModifier = text[pos] === "/" || !repeatModifier && text[pos] === ">" ? text[pos] : "";
    pos += releaseSelfModifier.length;
    const expectedEndBracket = bracketDict[startBracket];
    const endBracket = text[pos] === expectedEndBracket ? expectedEndBracket : "";
    if (!endBracket) {
      throw new Error(getErrorMessage([
        !repeatModifier && "repeat modifier",
        !releaseSelfModifier && "release modifier",
        `"${expectedEndBracket}"`
      ].filter(Boolean).join(" or "), text[pos], text, context));
    }
    pos += endBracket.length;
    return {
      consumedLength: pos,
      descriptor,
      releasePrevious: !!releasePreviousModifier,
      repeat: repeatModifier ? Math.max(Number(repeatModifier.substr(1)), 1) : 1,
      releaseSelf: hasReleaseSelf(releaseSelfModifier, repeatModifier)
    };
  }
  function assertDescriptor(descriptor, text, pos, context) {
    if (!descriptor) {
      throw new Error(getErrorMessage("key descriptor", text[pos], text, context));
    }
  }
  function hasReleaseSelf(releaseSelfModifier, repeatModifier) {
    if (releaseSelfModifier) {
      return releaseSelfModifier === "/";
    }
    if (repeatModifier) {
      return false;
    }
  }
  function getErrorMessage(expected, found, text, context) {
    return `Expected ${expected} but found "${found !== null && found !== void 0 ? found : ""}" in "${text}"
    See ${context === "pointer" ? `https://testing-library.com/docs/user-event/pointer#pressing-a-button-or-touching-the-screen` : `https://testing-library.com/docs/user-event/keyboard`}
    for more information about how userEvent parses your input.`;
  }
  function parseKeyDef$1(keyboardMap, text) {
    const defs = [];
    do {
      const { type: type2, descriptor, consumedLength, releasePrevious, releaseSelf = true, repeat } = readNextDescriptor(text, "keyboard");
      var _keyboardMap_find;
      const keyDef = (_keyboardMap_find = keyboardMap.find((def) => {
        if (type2 === "[") {
          var _def_code;
          return ((_def_code = def.code) === null || _def_code === void 0 ? void 0 : _def_code.toLowerCase()) === descriptor.toLowerCase();
        } else if (type2 === "{") {
          var _def_key;
          return ((_def_key = def.key) === null || _def_key === void 0 ? void 0 : _def_key.toLowerCase()) === descriptor.toLowerCase();
        }
        return def.key === descriptor;
      })) !== null && _keyboardMap_find !== void 0 ? _keyboardMap_find : {
        key: "Unknown",
        code: "Unknown",
        [type2 === "[" ? "code" : "key"]: descriptor
      };
      defs.push({
        keyDef,
        releasePrevious,
        releaseSelf,
        repeat
      });
      text = text.slice(consumedLength);
    } while (text);
    return defs;
  }
  async function keyboard$1(text) {
    const actions = parseKeyDef$1(this.config.keyboardMap, text);
    for (let i = 0; i < actions.length; i++) {
      await wait(this.config);
      await keyboardAction(this, actions[i]);
    }
  }
  async function keyboardAction(instance, { keyDef, releasePrevious, releaseSelf, repeat }) {
    const { system } = instance;
    if (system.keyboard.isKeyPressed(keyDef)) {
      await system.keyboard.keyup(instance, keyDef);
    }
    if (!releasePrevious) {
      for (let i = 1; i <= repeat; i++) {
        await system.keyboard.keydown(instance, keyDef);
        if (i < repeat) {
          await wait(instance.config);
        }
      }
      if (releaseSelf) {
        await system.keyboard.keyup(instance, keyDef);
      }
    }
  }
  async function releaseAllKeys(instance) {
    for (const k of instance.system.keyboard.getPressedKeys()) {
      await instance.system.keyboard.keyup(instance, k);
    }
  }
  function copySelection(target) {
    const data2 = hasOwnSelection(target) ? {
      "text/plain": readSelectedValueFromInput(target)
    } : {
      "text/plain": String(target.ownerDocument.getSelection())
    };
    const dt = createDataTransfer(getWindow(target));
    for (const type2 in data2) {
      if (data2[type2]) {
        dt.setData(type2, data2[type2]);
      }
    }
    return dt;
  }
  function readSelectedValueFromInput(target) {
    const sel = getUISelection(target);
    const val = getUIValue(target);
    return val.substring(sel.startOffset, sel.endOffset);
  }
  async function copy$1() {
    const doc = this.config.document;
    var _doc_activeElement;
    const target = (_doc_activeElement = doc.activeElement) !== null && _doc_activeElement !== void 0 ? _doc_activeElement : (
      /* istanbul ignore next */
      doc.body
    );
    const clipboardData = copySelection(target);
    if (clipboardData.items.length === 0) {
      return;
    }
    if (this.dispatchUIEvent(target, "copy", {
      clipboardData
    }) && this.config.writeToClipboard) {
      await writeDataTransferToClipboard(doc, clipboardData);
    }
    return clipboardData;
  }
  async function cut$1() {
    const doc = this.config.document;
    var _doc_activeElement;
    const target = (_doc_activeElement = doc.activeElement) !== null && _doc_activeElement !== void 0 ? _doc_activeElement : (
      /* istanbul ignore next */
      doc.body
    );
    const clipboardData = copySelection(target);
    if (clipboardData.items.length === 0) {
      return;
    }
    if (this.dispatchUIEvent(target, "cut", {
      clipboardData
    }) && this.config.writeToClipboard) {
      await writeDataTransferToClipboard(target.ownerDocument, clipboardData);
    }
    return clipboardData;
  }
  async function paste$1(clipboardData) {
    const doc = this.config.document;
    var _doc_activeElement;
    const target = (_doc_activeElement = doc.activeElement) !== null && _doc_activeElement !== void 0 ? _doc_activeElement : (
      /* istanbul ignore next */
      doc.body
    );
    var _ref;
    const dataTransfer = (_ref = typeof clipboardData === "string" ? getClipboardDataFromString(doc, clipboardData) : clipboardData) !== null && _ref !== void 0 ? _ref : await readDataTransferFromClipboard(doc).catch(() => {
      throw new Error("`userEvent.paste()` without `clipboardData` requires the `ClipboardAPI` to be available.");
    });
    this.dispatchUIEvent(target, "paste", {
      clipboardData: dataTransfer
    });
  }
  function getClipboardDataFromString(doc, text) {
    const dt = createDataTransfer(getWindow(doc));
    dt.setData("text", text);
    return dt;
  }
  function parseKeyDef(pointerMap, keys7) {
    const defs = [];
    do {
      const { descriptor, consumedLength, releasePrevious, releaseSelf = true } = readNextDescriptor(keys7, "pointer");
      const keyDef = pointerMap.find((p3) => p3.name === descriptor);
      if (keyDef) {
        defs.push({
          keyDef,
          releasePrevious,
          releaseSelf
        });
      }
      keys7 = keys7.slice(consumedLength);
    } while (keys7);
    return defs;
  }
  async function pointer$1(input2) {
    const { pointerMap } = this.config;
    const actions = [];
    (Array.isArray(input2) ? input2 : [
      input2
    ]).forEach((actionInput) => {
      if (typeof actionInput === "string") {
        actions.push(...parseKeyDef(pointerMap, actionInput));
      } else if ("keys" in actionInput) {
        actions.push(...parseKeyDef(pointerMap, actionInput.keys).map((i) => ({
          ...actionInput,
          ...i
        })));
      } else {
        actions.push(actionInput);
      }
    });
    for (let i = 0; i < actions.length; i++) {
      await wait(this.config);
      await pointerAction(this, actions[i]);
    }
    this.system.pointer.resetClickCount();
  }
  async function pointerAction(instance, action) {
    var _previousPosition_caret, _previousPosition_caret1;
    const pointerName = "pointerName" in action && action.pointerName ? action.pointerName : "keyDef" in action ? instance.system.pointer.getPointerName(action.keyDef) : "mouse";
    const previousPosition = instance.system.pointer.getPreviousPosition(pointerName);
    var _action_target, _action_coords, _action_node, _action_offset;
    const position = {
      target: (_action_target = action.target) !== null && _action_target !== void 0 ? _action_target : getPrevTarget(instance, previousPosition),
      coords: (_action_coords = action.coords) !== null && _action_coords !== void 0 ? _action_coords : previousPosition === null || previousPosition === void 0 ? void 0 : previousPosition.coords,
      caret: {
        node: (_action_node = action.node) !== null && _action_node !== void 0 ? _action_node : hasCaretPosition(action) ? void 0 : previousPosition === null || previousPosition === void 0 ? void 0 : (_previousPosition_caret = previousPosition.caret) === null || _previousPosition_caret === void 0 ? void 0 : _previousPosition_caret.node,
        offset: (_action_offset = action.offset) !== null && _action_offset !== void 0 ? _action_offset : hasCaretPosition(action) ? void 0 : previousPosition === null || previousPosition === void 0 ? void 0 : (_previousPosition_caret1 = previousPosition.caret) === null || _previousPosition_caret1 === void 0 ? void 0 : _previousPosition_caret1.offset
      }
    };
    if ("keyDef" in action) {
      if (instance.system.pointer.isKeyPressed(action.keyDef)) {
        setLevelRef(instance, ApiLevel.Trigger);
        await instance.system.pointer.release(instance, action.keyDef, position);
      }
      if (!action.releasePrevious) {
        setLevelRef(instance, ApiLevel.Trigger);
        await instance.system.pointer.press(instance, action.keyDef, position);
        if (action.releaseSelf) {
          setLevelRef(instance, ApiLevel.Trigger);
          await instance.system.pointer.release(instance, action.keyDef, position);
        }
      }
    } else {
      setLevelRef(instance, ApiLevel.Trigger);
      await instance.system.pointer.move(instance, pointerName, position);
    }
  }
  function hasCaretPosition(action) {
    var _action_target, _ref;
    return !!((_ref = (_action_target = action.target) !== null && _action_target !== void 0 ? _action_target : action.node) !== null && _ref !== void 0 ? _ref : action.offset !== void 0);
  }
  function getPrevTarget(instance, position) {
    if (!position) {
      throw new Error("This pointer has no previous position. Provide a target property!");
    }
    var _position_target;
    return (_position_target = position.target) !== null && _position_target !== void 0 ? _position_target : instance.config.document.body;
  }
  async function clear$1(element) {
    if (!isEditable(element) || isDisabled(element)) {
      throw new Error("clear()` is only supported on editable elements.");
    }
    focusElement(element);
    if (element.ownerDocument.activeElement !== element) {
      throw new Error("The element to be cleared could not be focused.");
    }
    selectAll(element);
    if (!isAllSelected(element)) {
      throw new Error("The element content to be cleared could not be selected.");
    }
    input(this, element, "", "deleteContentBackward");
  }
  async function selectOptions$1(select, values6) {
    return selectOptionsBase.call(this, true, select, values6);
  }
  async function deselectOptions$1(select, values6) {
    return selectOptionsBase.call(this, false, select, values6);
  }
  async function selectOptionsBase(newValue, select, values6) {
    if (!newValue && !select.multiple) {
      throw getConfig().getElementError(`Unable to deselect an option in a non-multiple select. Use selectOptions to change the selection instead.`, select);
    }
    const valArray = Array.isArray(values6) ? values6 : [
      values6
    ];
    const allOptions = Array.from(select.querySelectorAll('option, [role="option"]'));
    const selectedOptions = valArray.map((val) => {
      if (typeof val !== "string" && allOptions.includes(val)) {
        return val;
      } else {
        const matchingOption = allOptions.find((o) => o.value === val || o.innerHTML === val);
        if (matchingOption) {
          return matchingOption;
        } else {
          throw getConfig().getElementError(`Value "${String(val)}" not found in options`, select);
        }
      }
    }).filter((option) => !isDisabled(option));
    if (isDisabled(select) || !selectedOptions.length) return;
    const selectOption = (option) => {
      option.selected = newValue;
      this.dispatchUIEvent(select, "input", {
        bubbles: true,
        cancelable: false,
        composed: true
      });
      this.dispatchUIEvent(select, "change");
    };
    if (isElementType(select, "select")) {
      if (select.multiple) {
        for (const option of selectedOptions) {
          const withPointerEvents = this.config.pointerEventsCheck === 0 ? true : hasPointerEvents(this, option);
          if (withPointerEvents) {
            this.dispatchUIEvent(option, "pointerover");
            this.dispatchUIEvent(select, "pointerenter");
            this.dispatchUIEvent(option, "mouseover");
            this.dispatchUIEvent(select, "mouseenter");
            this.dispatchUIEvent(option, "pointermove");
            this.dispatchUIEvent(option, "mousemove");
            this.dispatchUIEvent(option, "pointerdown");
            this.dispatchUIEvent(option, "mousedown");
          }
          focusElement(select);
          if (withPointerEvents) {
            this.dispatchUIEvent(option, "pointerup");
            this.dispatchUIEvent(option, "mouseup");
          }
          selectOption(option);
          if (withPointerEvents) {
            this.dispatchUIEvent(option, "click");
          }
          await wait(this.config);
        }
      } else if (selectedOptions.length === 1) {
        const withPointerEvents = this.config.pointerEventsCheck === 0 ? true : hasPointerEvents(this, select);
        if (withPointerEvents) {
          await this.click(select);
        } else {
          focusElement(select);
        }
        selectOption(selectedOptions[0]);
        if (withPointerEvents) {
          this.dispatchUIEvent(select, "pointerover");
          this.dispatchUIEvent(select, "pointerenter");
          this.dispatchUIEvent(select, "mouseover");
          this.dispatchUIEvent(select, "mouseenter");
          this.dispatchUIEvent(select, "pointerup");
          this.dispatchUIEvent(select, "mouseup");
          this.dispatchUIEvent(select, "click");
        }
        await wait(this.config);
      } else {
        throw getConfig().getElementError(`Cannot select multiple options on a non-multiple select`, select);
      }
    } else if (select.getAttribute("role") === "listbox") {
      for (const option of selectedOptions) {
        await this.click(option);
        await this.unhover(option);
      }
    } else {
      throw getConfig().getElementError(`Cannot select options on elements that are neither select nor listbox elements`, select);
    }
  }
  async function type$1(element, text, { skipClick = this.config.skipClick, skipAutoClose = this.config.skipAutoClose, initialSelectionStart, initialSelectionEnd } = {}) {
    if (element.disabled) return;
    if (!skipClick) {
      await this.click(element);
    }
    if (initialSelectionStart !== void 0) {
      setSelectionRange(element, initialSelectionStart, initialSelectionEnd !== null && initialSelectionEnd !== void 0 ? initialSelectionEnd : initialSelectionStart);
    }
    await this.keyboard(text);
    if (!skipAutoClose) {
      await releaseAllKeys(this);
    }
  }
  const fakeFiles = Symbol("files and value properties are mocked");
  function restoreProperty(obj, prop, descriptor) {
    if (descriptor) {
      Object.defineProperty(obj, prop, descriptor);
    } else {
      delete obj[prop];
    }
  }
  function setFiles(el, files) {
    var _el_fakeFiles;
    (_el_fakeFiles = el[fakeFiles]) === null || _el_fakeFiles === void 0 ? void 0 : _el_fakeFiles.restore();
    const typeDescr = Object.getOwnPropertyDescriptor(el, "type");
    const valueDescr = Object.getOwnPropertyDescriptor(el, "value");
    const filesDescr = Object.getOwnPropertyDescriptor(el, "files");
    function restore() {
      restoreProperty(el, "type", typeDescr);
      restoreProperty(el, "value", valueDescr);
      restoreProperty(el, "files", filesDescr);
    }
    el[fakeFiles] = {
      restore
    };
    Object.defineProperties(el, {
      files: {
        configurable: true,
        get: () => files
      },
      value: {
        configurable: true,
        get: () => files.length ? `C:\\fakepath\\${files[0].name}` : "",
        set(v2) {
          if (v2 === "") {
            restore();
          } else {
            var _valueDescr_set;
            valueDescr === null || valueDescr === void 0 ? void 0 : (_valueDescr_set = valueDescr.set) === null || _valueDescr_set === void 0 ? void 0 : _valueDescr_set.call(el, v2);
          }
        }
      },
      type: {
        configurable: true,
        get: () => "file",
        set(v2) {
          if (v2 !== "file") {
            restore();
            el.type = v2;
          }
        }
      }
    });
  }
  async function upload$1(element, fileOrFiles) {
    const input2 = isElementType(element, "label") ? element.control : element;
    if (!input2 || !isElementType(input2, "input", {
      type: "file"
    })) {
      throw new TypeError(`The ${input2 === element ? "given" : "associated"} ${input2 === null || input2 === void 0 ? void 0 : input2.tagName} element does not accept file uploads`);
    }
    if (isDisabled(element)) return;
    const files = (Array.isArray(fileOrFiles) ? fileOrFiles : [
      fileOrFiles
    ]).filter((file) => !this.config.applyAccept || isAcceptableFile(file, input2.accept)).slice(0, input2.multiple ? void 0 : 1);
    const fileDialog = () => {
      var _input_files;
      if (files.length === ((_input_files = input2.files) === null || _input_files === void 0 ? void 0 : _input_files.length) && files.every((f2, i) => {
        var _input_files2;
        return f2 === ((_input_files2 = input2.files) === null || _input_files2 === void 0 ? void 0 : _input_files2.item(i));
      })) {
        return;
      }
      setFiles(input2, createFileList(getWindow(element), files));
      this.dispatchUIEvent(input2, "input");
      this.dispatchUIEvent(input2, "change");
    };
    input2.addEventListener("fileDialog", fileDialog);
    await this.click(element);
    input2.removeEventListener("fileDialog", fileDialog);
  }
  function normalize(nameOrType) {
    return nameOrType.toLowerCase().replace(/(\.|\/)jpg\b/g, "$1jpeg");
  }
  function isAcceptableFile(file, accept) {
    if (!accept) {
      return true;
    }
    const wildcards = [
      "audio/*",
      "image/*",
      "video/*"
    ];
    return normalize(accept).trim().split(/\s*,\s*/).some((acceptToken) => {
      if (acceptToken.startsWith(".")) {
        return normalize(file.name).endsWith(acceptToken);
      } else if (wildcards.includes(acceptToken)) {
        return normalize(file.type).startsWith(acceptToken.replace("*", ""));
      }
      return normalize(file.type) === acceptToken;
    });
  }
  const userEventApi = {
    click: click$1,
    dblClick: dblClick$1,
    tripleClick: tripleClick$1,
    hover: hover$1,
    unhover: unhover$1,
    tab: tab$1,
    keyboard: keyboard$1,
    copy: copy$1,
    cut: cut$1,
    paste: paste$1,
    pointer: pointer$1,
    clear: clear$1,
    deselectOptions: deselectOptions$1,
    selectOptions: selectOptions$1,
    type: type$1,
    upload: upload$1
  };
  function wrapAsync(implementation) {
    return getConfig().asyncWrapper(implementation);
  }
  const defaultOptionsDirect = {
    applyAccept: true,
    autoModify: true,
    delay: 0,
    document: globalThis.document,
    keyboardMap: defaultKeyMap$1,
    pointerMap: defaultKeyMap,
    pointerEventsCheck: PointerEventsCheckLevel.EachApiCall,
    skipAutoClose: false,
    skipClick: false,
    skipHover: false,
    writeToClipboard: false,
    advanceTimers: () => Promise.resolve()
  };
  const defaultOptionsSetup = {
    ...defaultOptionsDirect,
    writeToClipboard: true
  };
  function createConfig(options = {}, defaults = defaultOptionsSetup, node) {
    const document2 = getDocument(options, node, defaults);
    return {
      ...defaults,
      ...options,
      document: document2
    };
  }
  function setupMain(options = {}) {
    const config2 = createConfig(options);
    prepareDocument(config2.document);
    patchFocus(getWindow(config2.document).HTMLElement);
    var _config_document_defaultView;
    const view = (_config_document_defaultView = config2.document.defaultView) !== null && _config_document_defaultView !== void 0 ? _config_document_defaultView : (
      /* istanbul ignore next */
      globalThis.window
    );
    attachClipboardStubToView(view);
    return createInstance(config2).api;
  }
  function setupDirect({ keyboardState, pointerState, ...options } = {}, node) {
    const config2 = createConfig(options, defaultOptionsDirect, node);
    prepareDocument(config2.document);
    patchFocus(getWindow(config2.document).HTMLElement);
    var _ref;
    const system = (_ref = pointerState !== null && pointerState !== void 0 ? pointerState : keyboardState) !== null && _ref !== void 0 ? _ref : new System();
    return {
      api: createInstance(config2, system).api,
      system
    };
  }
  function setupSub(options) {
    return createInstance({
      ...this.config,
      ...options
    }, this.system).api;
  }
  function wrapAndBindImpl(instance, impl) {
    function method(...args) {
      setLevelRef(instance, ApiLevel.Call);
      return wrapAsync(() => impl.apply(instance, args).then(async (ret) => {
        await wait(instance.config);
        return ret;
      }));
    }
    Object.defineProperty(method, "name", {
      get: () => impl.name
    });
    return method;
  }
  function createInstance(config2, system = new System()) {
    const instance = {};
    Object.assign(instance, {
      config: config2,
      dispatchEvent: dispatchEvent.bind(instance),
      dispatchUIEvent: dispatchUIEvent.bind(instance),
      system,
      levelRefs: {},
      ...userEventApi
    });
    return {
      instance,
      api: {
        ...Object.fromEntries(Object.entries(userEventApi).map(([name, api]) => [
          name,
          wrapAndBindImpl(instance, api)
        ])),
        setup: setupSub.bind(instance)
      }
    };
  }
  function getDocument(options, node, defaults) {
    var _options_document, _ref;
    return (_ref = (_options_document = options.document) !== null && _options_document !== void 0 ? _options_document : node && getDocumentFromNode(node)) !== null && _ref !== void 0 ? _ref : defaults.document;
  }
  function clear(element) {
    return setupDirect().api.clear(element);
  }
  function click(element, options = {}) {
    return setupDirect(options, element).api.click(element);
  }
  function copy(options = {}) {
    return setupDirect(options).api.copy();
  }
  function cut(options = {}) {
    return setupDirect(options).api.cut();
  }
  function dblClick(element, options = {}) {
    return setupDirect(options).api.dblClick(element);
  }
  function deselectOptions(select, values6, options = {}) {
    return setupDirect(options).api.deselectOptions(select, values6);
  }
  function hover(element, options = {}) {
    return setupDirect(options).api.hover(element);
  }
  async function keyboard(text, options = {}) {
    const { api, system } = setupDirect(options);
    return api.keyboard(text).then(() => system);
  }
  async function pointer(input2, options = {}) {
    const { api, system } = setupDirect(options);
    return api.pointer(input2).then(() => system);
  }
  function paste(clipboardData, options) {
    return setupDirect(options).api.paste(clipboardData);
  }
  function selectOptions(select, values6, options = {}) {
    return setupDirect(options).api.selectOptions(select, values6);
  }
  function tripleClick(element, options = {}) {
    return setupDirect(options).api.tripleClick(element);
  }
  function type(element, text, options = {}) {
    return setupDirect(options, element).api.type(element, text, options);
  }
  function unhover(element, options = {}) {
    const { api, system } = setupDirect(options);
    system.pointer.setMousePosition({
      target: element
    });
    return api.unhover(element);
  }
  function upload(element, fileOrFiles, options = {}) {
    return setupDirect(options).api.upload(element, fileOrFiles);
  }
  function tab(options = {}) {
    return setupDirect().api.tab(options);
  }
  const directApi = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
    __proto__: null,
    clear,
    click,
    copy,
    cut,
    dblClick,
    deselectOptions,
    hover,
    keyboard,
    paste,
    pointer,
    selectOptions,
    tab,
    tripleClick,
    type,
    unhover,
    upload
  }, Symbol.toStringTag, { value: "Module" }));
  const userEvent = {
    ...directApi,
    setup: setupMain
  };
  var user = userEvent.setup();
  async function waitForSelector(selector, timeout = 1e4) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) {
        return element;
      }
      await new Promise((resolve2) => setTimeout(resolve2, 100));
    }
    return null;
  }
  async function pressKey(key) {
    await user.keyboard(key);
  }
  function getElementText(element) {
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      return element.value;
    }
    return element.textContent || "";
  }
  const server = await( createServer({
    name: "ChatGPT MCP Server",
    version: "1.0.0"
  }));
  server.registerTool(
    "chatgpt_get_info",
    {
      description: "Get current ChatGPT page information",
      inputSchema: {}
    },
    async () => {
      return formatSuccess("Page info retrieved", {
        title: document.title,
        url: window.location.href,
        isLoggedIn: !!document.querySelector('[data-testid="profile-button"]'),
        hasActiveChat: !!document.querySelector('[data-testid="conversation-content"]')
      });
    }
  );
  server.registerTool(
    "chatgpt_send_message",
    {
      description: "Send a message to ChatGPT",
      inputSchema: {
        message: stringType().describe("The message to send to ChatGPT")
      }
    },
    async ({ message }) => {
      var _a;
      const messageInput = document.querySelector('#prompt-textarea, [contenteditable="true"]');
      if (!messageInput) {
        return formatError("Message input field not found");
      }
      messageInput.focus();
      messageInput.textContent = message;
      const inputEvent = new Event("input", { bubbles: true });
      messageInput.dispatchEvent(inputEvent);
      const sendButton = (_a = document.querySelector('[data-testid="send-button"], button[aria-label*="Send"], button svg[class*="h-4 w-4"]')) == null ? void 0 : _a.closest("button");
      if (!sendButton) {
        await pressKey("Enter");
      } else {
        sendButton.click();
      }
      await waitForSelector('[data-testid="conversation-content"], .group.w-full', 3e3);
      return formatSuccess("Message sent", {
        messageSent: message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  );
  server.registerTool(
    "chatgpt_get_conversation",
    {
      description: "Get the current conversation messages",
      inputSchema: {}
    },
    async () => {
      var _a;
      const messages = [];
      const messageElements = document.querySelectorAll("[data-message-author-role], .group.w-full");
      for (const element of messageElements) {
        const role = element.getAttribute("data-message-author-role") || (((_a = element.textContent) == null ? void 0 : _a.includes("ChatGPT")) ? "assistant" : "user");
        const content = getElementText(element);
        if (content) {
          messages.push({
            role,
            content: content.substring(0, 500)
            // Limit content length
          });
        }
      }
      return formatSuccess(`Found ${messages.length} messages`, messages);
    }
  );
  server.registerTool(
    "chatgpt_new_chat",
    {
      description: "Start a new chat conversation",
      inputSchema: {}
    },
    async () => {
      const newChatButton = document.querySelector('[href="/"], a[aria-label*="New chat"], button[aria-label*="New chat"]');
      if (!newChatButton) {
        return formatError("New chat button not found");
      }
      newChatButton.click();
      await waitForSelector('#prompt-textarea, [contenteditable="true"]', 2e3);
      return formatSuccess("New chat started", {
        url: window.location.href
      });
    }
  );
  server.registerTool(
    "chatgpt_get_models",
    {
      description: "Get list of available ChatGPT models",
      inputSchema: {}
    },
    async () => {
      var _a;
      const modelSelector = document.querySelector('[data-testid="model-selector"], button[aria-haspopup="menu"]');
      if (!modelSelector) {
        return formatSuccess("Model selector not found", {
          currentModel: ((_a = document.querySelector('[data-testid="model-name"]')) == null ? void 0 : _a.textContent) || "Unknown"
        });
      }
      modelSelector.click();
      await waitForSelector('[role="menu"], [data-radix-menu-content]', 1e3);
      const models = [];
      const modelOptions = document.querySelectorAll('[role="menuitem"], [data-radix-collection-item]');
      for (const option of modelOptions) {
        const modelName = getElementText(option);
        if (modelName) {
          models.push(modelName);
        }
      }
      pressKey("Escape");
      return formatSuccess(`Found ${models.length} models`, models);
    }
  );
  console.log("ChatGPT MCP Server initialized successfully");

})();