// ==UserScript==
// @name         Gmail MCP-B Injector
// @namespace    https://github.com/miguelspizza/mcp-b-user-scripts
// @version      1.0.0
// @author       Alex Nahas
// @description  Injects MCP-B server into Gmail for AI assistant integration
// @license      MIT
// @homepageURL  https://github.com/miguelspizza/mcp-b-user-scripts
// @supportURL   https://github.com/miguelspizza/mcp-b-user-scripts/issues
// @match        https://mail.google.com/*
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.info
// @grant        GM.listValues
// @grant        GM.setValue
// @grant        unsafeWindow
// ==/UserScript==

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  function _mergeNamespaces$1(n, m) {
    for (var i = 0; i < m.length; i++) {
      const e = m[i];
      if (typeof e !== "string" && !Array.isArray(e)) {
        for (const k in e) {
          if (k !== "default" && !(k in n)) {
            const d = Object.getOwnPropertyDescriptor(e, k);
            if (d) {
              Object.defineProperty(n, k, d.get ? d : {
                enumerable: true,
                get: () => e[k]
              });
            }
          }
        }
      }
    }
    return Object.freeze(Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }));
  }
  const scriptRel = function detectScriptRel() {
    const relList = typeof document !== "undefined" && document.createElement("link").relList;
    return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
  }();
  const assetsURL = function(dep) {
    return "/" + dep;
  };
  const seen = {};
  const __vitePreload = function preload(baseModule, deps, importerUrl) {
    let promise = Promise.resolve();
    if (deps && deps.length > 0) {
      document.getElementsByTagName("link");
      const cspNonceMeta = document.querySelector(
        "meta[property=csp-nonce]"
      );
      const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
      promise = Promise.allSettled(
        deps.map((dep) => {
          dep = assetsURL(dep);
          if (dep in seen) return;
          seen[dep] = true;
          const isCss = dep.endsWith(".css");
          const cssSelector = isCss ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
            return;
          }
          const link = document.createElement("link");
          link.rel = isCss ? "stylesheet" : scriptRel;
          if (!isCss) {
            link.as = "script";
          }
          link.crossOrigin = "";
          link.href = dep;
          if (cspNonce) {
            link.setAttribute("nonce", cspNonce);
          }
          document.head.appendChild(link);
          if (isCss) {
            return new Promise((res, rej) => {
              link.addEventListener("load", res);
              link.addEventListener(
                "error",
                () => rej(new Error(`Unable to preload CSS for ${dep}`))
              );
            });
          }
        })
      );
    }
    function handlePreloadError(err) {
      const e = new Event("vite:preloadError", {
        cancelable: true
      });
      e.payload = err;
      window.dispatchEvent(e);
      if (!e.defaultPrevented) {
        throw err;
      }
    }
    return promise.then((res) => {
      for (const item of res || []) {
        if (item.status !== "rejected") continue;
        handlePreloadError(item.reason);
      }
      return baseModule().catch(handlePreloadError);
    });
  };
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
      return util2.objectKeys(obj).map(function(e) {
        return obj[e];
      });
    };
    util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
      const keys = [];
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          keys.push(key);
        }
      }
      return keys;
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
    const maps = errorMaps.filter((m) => !!m).slice().reverse();
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
    _getType(input) {
      return getParsedType(input.data);
    }
    _getOrReturnCtx(input, ctx) {
      return ctx || {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      };
    }
    _processInputParams(input) {
      return {
        status: new ParseStatus(),
        ctx: {
          common: input.parent.common,
          data: input.data,
          parsedType: getParsedType(input.data),
          schemaErrorMap: this._def.errorMap,
          path: input.path,
          parent: input.parent
        }
      };
    }
    _parseSync(input) {
      const result = this._parse(input);
      if (isAsync(result)) {
        throw new Error("Synchronous parse encountered promise.");
      }
      return result;
    }
    _parseAsync(input) {
      const result = this._parse(input);
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
    _parse(input) {
      if (this._def.coerce) {
        input.data = String(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.string) {
        const ctx2 = this._getOrReturnCtx(input);
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
          if (input.data.length < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          if (input.data.length > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          const tooBig = input.data.length > check.value;
          const tooSmall = input.data.length < check.value;
          if (tooBig || tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          if (!emailRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          if (!emojiRegex$1.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "emoji",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "uuid") {
          if (!uuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "uuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "nanoid") {
          if (!nanoidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "nanoid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid") {
          if (!cuidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cuid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cuid2") {
          if (!cuid2Regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cuid2",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ulid") {
          if (!ulidRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "ulid",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "url") {
          try {
            new URL(input.data);
          } catch {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "url",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "regex") {
          check.regex.lastIndex = 0;
          const testResult = check.regex.test(input.data);
          if (!testResult) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "regex",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "trim") {
          input.data = input.data.trim();
        } else if (check.kind === "includes") {
          if (!input.data.includes(check.value, check.position)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { includes: check.value, position: check.position },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "toLowerCase") {
          input.data = input.data.toLowerCase();
        } else if (check.kind === "toUpperCase") {
          input.data = input.data.toUpperCase();
        } else if (check.kind === "startsWith") {
          if (!input.data.startsWith(check.value)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { startsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "endsWith") {
          if (!input.data.endsWith(check.value)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: { endsWith: check.value },
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "datetime") {
          const regex2 = datetimeRegex(check);
          if (!regex2.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "datetime",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "date") {
          const regex2 = dateRegex;
          if (!regex2.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "date",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "time") {
          const regex2 = timeRegex(check);
          if (!regex2.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_string,
              validation: "time",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "duration") {
          if (!durationRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "duration",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "ip") {
          if (!isValidIP(input.data, check.version)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "ip",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "jwt") {
          if (!isValidJWT(input.data, check.alg)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "jwt",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "cidr") {
          if (!isValidCidr(input.data, check.version)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "cidr",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64") {
          if (!base64Regex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              validation: "base64",
              code: ZodIssueCode.invalid_string,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "base64url") {
          if (!base64urlRegex.test(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
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
      return { status: status.value, value: input.data };
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
    _parse(input) {
      if (this._def.coerce) {
        input.data = Number(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.number) {
        const ctx2 = this._getOrReturnCtx(input);
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
          if (!util$6.isInteger(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.invalid_type,
              expected: "integer",
              received: "float",
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          if (floatSafeRemainder(input.data, check.value) !== 0) {
            ctx = this._getOrReturnCtx(input, ctx);
            addIssueToContext(ctx, {
              code: ZodIssueCode.not_multiple_of,
              multipleOf: check.value,
              message: check.message
            });
            status.dirty();
          }
        } else if (check.kind === "finite") {
          if (!Number.isFinite(input.data)) {
            ctx = this._getOrReturnCtx(input, ctx);
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
      return { status: status.value, value: input.data };
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
    _parse(input) {
      if (this._def.coerce) {
        try {
          input.data = BigInt(input.data);
        } catch {
          return this._getInvalidInput(input);
        }
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.bigint) {
        return this._getInvalidInput(input);
      }
      let ctx = void 0;
      const status = new ParseStatus();
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
          if (tooSmall) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
          if (tooBig) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          if (input.data % check.value !== BigInt(0)) {
            ctx = this._getOrReturnCtx(input, ctx);
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
      return { status: status.value, value: input.data };
    }
    _getInvalidInput(input) {
      const ctx = this._getOrReturnCtx(input);
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
    _parse(input) {
      if (this._def.coerce) {
        input.data = Boolean(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.boolean) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.boolean,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
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
    _parse(input) {
      if (this._def.coerce) {
        input.data = new Date(input.data);
      }
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.date) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.date,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      if (Number.isNaN(input.data.getTime())) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_date
        });
        return INVALID;
      }
      const status = new ParseStatus();
      let ctx = void 0;
      for (const check of this._def.checks) {
        if (check.kind === "min") {
          if (input.data.getTime() < check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
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
          if (input.data.getTime() > check.value) {
            ctx = this._getOrReturnCtx(input, ctx);
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
        value: new Date(input.data.getTime())
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
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.symbol) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.symbol,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  }
  ZodSymbol.create = (params) => {
    return new ZodSymbol({
      typeName: ZodFirstPartyTypeKind.ZodSymbol,
      ...processCreateParams$1(params)
    });
  };
  class ZodUndefined extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.undefined,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  }
  ZodUndefined.create = (params) => {
    return new ZodUndefined({
      typeName: ZodFirstPartyTypeKind.ZodUndefined,
      ...processCreateParams$1(params)
    });
  };
  class ZodNull extends ZodType {
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.null) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.null,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
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
    _parse(input) {
      return OK(input.data);
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
    _parse(input) {
      return OK(input.data);
    }
  }
  ZodUnknown.create = (params) => {
    return new ZodUnknown({
      typeName: ZodFirstPartyTypeKind.ZodUnknown,
      ...processCreateParams$1(params)
    });
  };
  class ZodNever extends ZodType {
    _parse(input) {
      const ctx = this._getOrReturnCtx(input);
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
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.undefined) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.void,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return OK(input.data);
    }
  }
  ZodVoid.create = (params) => {
    return new ZodVoid({
      typeName: ZodFirstPartyTypeKind.ZodVoid,
      ...processCreateParams$1(params)
    });
  };
  class ZodArray extends ZodType {
    _parse(input) {
      const { ctx, status } = this._processInputParams(input);
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
      const keys = util$6.objectKeys(shape);
      this._cached = { shape, keys };
      return this._cached;
    }
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.object) {
        const ctx2 = this._getOrReturnCtx(input);
        addIssueToContext(ctx2, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.object,
          received: ctx2.parsedType
        });
        return INVALID;
      }
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
  function mergeValues(a, b) {
    const aType = getParsedType(a);
    const bType = getParsedType(b);
    if (a === b) {
      return { valid: true, data: a };
    } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
      const bKeys = util$6.objectKeys(b);
      const sharedKeys = util$6.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
      const newObj = { ...a, ...b };
      for (const key of sharedKeys) {
        const sharedValue = mergeValues(a[key], b[key]);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newObj[key] = sharedValue.data;
      }
      return { valid: true, data: newObj };
    } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
      if (a.length !== b.length) {
        return { valid: false };
      }
      const newArray = [];
      for (let index = 0; index < a.length; index++) {
        const itemA = a[index];
        const itemB = b[index];
        const sharedValue = mergeValues(itemA, itemB);
        if (!sharedValue.valid) {
          return { valid: false };
        }
        newArray.push(sharedValue.data);
      }
      return { valid: true, data: newArray };
    } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
      return { valid: true, data: a };
    } else {
      return { valid: false };
    }
  }
  class ZodIntersection extends ZodType {
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    _parse(input) {
      if (input.data !== this._def.value) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_literal,
          expected: this._def.value
        });
        return INVALID;
      }
      return { status: "valid", value: input.data };
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
  function createZodEnum(values, params) {
    return new ZodEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodEnum,
      ...processCreateParams$1(params)
    });
  }
  class ZodEnum extends ZodType {
    _parse(input) {
      if (typeof input.data !== "string") {
        const ctx = this._getOrReturnCtx(input);
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
      if (!this._cache.has(input.data)) {
        const ctx = this._getOrReturnCtx(input);
        const expectedValues = this._def.values;
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input.data);
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
    extract(values, newDef = this._def) {
      return ZodEnum.create(values, {
        ...this._def,
        ...newDef
      });
    }
    exclude(values, newDef = this._def) {
      return ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
        ...this._def,
        ...newDef
      });
    }
  }
  ZodEnum.create = createZodEnum;
  class ZodNativeEnum extends ZodType {
    _parse(input) {
      const nativeEnumValues = util$6.getValidEnumValues(this._def.values);
      const ctx = this._getOrReturnCtx(input);
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
      if (!this._cache.has(input.data)) {
        const expectedValues = util$6.objectValues(nativeEnumValues);
        addIssueToContext(ctx, {
          received: ctx.data,
          code: ZodIssueCode.invalid_enum_value,
          options: expectedValues
        });
        return INVALID;
      }
      return OK(input.data);
    }
    get enum() {
      return this._def.values;
    }
  }
  ZodNativeEnum.create = (values, params) => {
    return new ZodNativeEnum({
      values,
      typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
      ...processCreateParams$1(params)
    });
  };
  class ZodPromise extends ZodType {
    unwrap() {
      return this._def.type;
    }
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === ZodParsedType.undefined) {
        return OK(void 0);
      }
      return this._def.innerType._parse(input);
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
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType === ZodParsedType.null) {
        return OK(null);
      }
      return this._def.innerType._parse(input);
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
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    _parse(input) {
      const parsedType = this._getType(input);
      if (parsedType !== ZodParsedType.nan) {
        const ctx = this._getOrReturnCtx(input);
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_type,
          expected: ZodParsedType.nan,
          received: ctx.parsedType
        });
        return INVALID;
      }
      return { status: "valid", value: input.data };
    }
  }
  ZodNaN.create = (params) => {
    return new ZodNaN({
      typeName: ZodFirstPartyTypeKind.ZodNaN,
      ...processCreateParams$1(params)
    });
  };
  class ZodBranded extends ZodType {
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    _parse(input) {
      const { status, ctx } = this._processInputParams(input);
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
    static create(a, b) {
      return new ZodPipeline({
        in: a,
        out: b,
        typeName: ZodFirstPartyTypeKind.ZodPipeline
      });
    }
  }
  class ZodReadonly extends ZodType {
    _parse(input) {
      const result = this._def.innerType._parse(input);
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
  var _ = ((n) => (n.START = "start", n.STARTED = "started", n.STOP = "stop", n.STOPPED = "stopped", n.PING = "ping", n.PONG = "pong", n.ERROR = "error", n.LIST_TOOLS = "list_tools", n.CALL_TOOL = "call_tool", n.TOOL_LIST_UPDATED = "tool_list_updated", n.TOOL_LIST_UPDATED_ACK = "tool_list_updated_ack", n.PROCESS_DATA = "process_data", n.SERVER_STARTED = "server_started", n.SERVER_STOPPED = "server_stopped", n.ERROR_FROM_NATIVE_HOST = "error_from_native_host", n.CONNECT_NATIVE = "connectNative", n.PING_NATIVE = "ping_native", n.DISCONNECT_NATIVE = "disconnect_native", n))(_ || {});
  var h = class {
    constructor(e) {
      __publicField(this, "_started", false);
      __publicField(this, "_allowedOrigins");
      __publicField(this, "_channelId");
      __publicField(this, "_messageHandler");
      __publicField(this, "_clientOrigin");
      __publicField(this, "onclose");
      __publicField(this, "onerror");
      __publicField(this, "onmessage");
      if (!e.allowedOrigins || e.allowedOrigins.length === 0) throw new Error("At least one allowed origin must be specified");
      this._allowedOrigins = e.allowedOrigins, this._channelId = e.channelId || "mcp-default";
    }
    async start() {
      if (this._started) throw new Error("Transport already started");
      this._messageHandler = (e) => {
        var _a, _b, _c, _d, _e;
        if (!this._allowedOrigins.includes(e.origin) && !this._allowedOrigins.includes("*") || ((_a = e.data) == null ? void 0 : _a.channel) !== this._channelId || ((_b = e.data) == null ? void 0 : _b.type) !== "mcp" || ((_c = e.data) == null ? void 0 : _c.direction) !== "client-to-server") return;
        this._clientOrigin = e.origin;
        let t = e.data.payload;
        if (typeof t == "string" && t === "mcp-check-ready") {
          window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: "mcp-server-ready" }, this._clientOrigin);
          return;
        }
        try {
          let r = JSONRPCMessageSchema.parse(t);
          (_d = this.onmessage) == null ? void 0 : _d.call(this, r);
        } catch (r) {
          (_e = this.onerror) == null ? void 0 : _e.call(this, new Error(`Invalid message: ${r instanceof Error ? r.message : String(r)}`));
        }
      }, window.addEventListener("message", this._messageHandler), this._started = true, window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: "mcp-server-ready" }, "*");
    }
    async send(e) {
      if (!this._started) throw new Error("Transport not started");
      if (!this._clientOrigin) throw new Error("No client connected");
      window.postMessage({ channel: this._channelId, type: "mcp", direction: "server-to-client", payload: e }, this._clientOrigin);
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
        sendRequest: (r, resultSchema, options) => this.request(r, resultSchema, { ...options, relatedRequestId: request.id }),
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
  (function(module, exports) {
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
      var decode = function decode2(input) {
        var output = [];
        var inputLength = input.length;
        var i = 0;
        var n = initialN;
        var bias = initialBias;
        var basic = input.lastIndexOf(delimiter);
        if (basic < 0) {
          basic = 0;
        }
        for (var j = 0; j < basic; ++j) {
          if (input.charCodeAt(j) >= 128) {
            error$1("not-basic");
          }
          output.push(input.charCodeAt(j));
        }
        for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
          var oldi = i;
          for (
            var w = 1, k = base;
            ;
            /* no condition */
            k += base
          ) {
            if (index >= inputLength) {
              error$1("invalid-input");
            }
            var digit = basicToDigit(input.charCodeAt(index++));
            if (digit >= base || digit > floor((maxInt - i) / w)) {
              error$1("overflow");
            }
            i += digit * w;
            var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
            if (digit < t) {
              break;
            }
            var baseMinusT = base - t;
            if (w > floor(maxInt / baseMinusT)) {
              error$1("overflow");
            }
            w *= baseMinusT;
          }
          var out = output.length + 1;
          bias = adapt(i - oldi, out, oldi == 0);
          if (floor(i / out) > maxInt - n) {
            error$1("overflow");
          }
          n += floor(i / out);
          i %= out;
          output.splice(i++, 0, n);
        }
        return String.fromCodePoint.apply(String, output);
      };
      var encode = function encode2(input) {
        var output = [];
        input = ucs2decode(input);
        var inputLength = input.length;
        var n = initialN;
        var delta = 0;
        var bias = initialBias;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = void 0;
        try {
          for (var _iterator = input[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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
          var m = maxInt;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = void 0;
          try {
            for (var _iterator2 = input[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var currentValue = _step2.value;
              if (currentValue >= n && currentValue < m) {
                m = currentValue;
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
          if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error$1("overflow");
          }
          delta += (m - n) * handledCPCountPlusOne;
          n = m;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = void 0;
          try {
            for (var _iterator3 = input[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var _currentValue = _step3.value;
              if (_currentValue < n && ++delta > maxInt) {
                error$1("overflow");
              }
              if (_currentValue == n) {
                var q = delta;
                for (
                  var k = base;
                  ;
                  /* no condition */
                  k += base
                ) {
                  var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                  if (q < t) {
                    break;
                  }
                  var qMinusT = q - t;
                  var baseMinusT = base - t;
                  output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                  q = floor(qMinusT / baseMinusT);
                }
                output.push(stringFromCharCode(digitToBasic(q, 0)));
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
          ++n;
        }
        return output.join("");
      };
      var toUnicode = function toUnicode2(input) {
        return mapDomain(input, function(string) {
          return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
      };
      var toASCII = function toASCII2(input) {
        return mapDomain(input, function(string) {
          return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
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
        "encode": encode,
        "toASCII": toASCII,
        "toUnicode": toUnicode
      };
      var SCHEMES = {};
      function pctEncChar(chr) {
        var c = chr.charCodeAt(0);
        var e = void 0;
        if (c < 16) e = "%0" + c.toString(16).toUpperCase();
        else if (c < 128) e = "%" + c.toString(16).toUpperCase();
        else if (c < 2048) e = "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        else e = "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (c & 63 | 128).toString(16).toUpperCase();
        return e;
      }
      function pctDecChars(str) {
        var newStr = "";
        var i = 0;
        var il = str.length;
        while (i < il) {
          var c = parseInt(str.substr(i + 1, 2), 16);
          if (c < 128) {
            newStr += String.fromCharCode(c);
            i += 3;
          } else if (c >= 194 && c < 224) {
            if (il - i >= 6) {
              var c2 = parseInt(str.substr(i + 4, 2), 16);
              newStr += String.fromCharCode((c & 31) << 6 | c2 & 63);
            } else {
              newStr += str.substr(i, 6);
            }
            i += 6;
          } else if (c >= 224) {
            if (il - i >= 9) {
              var _c = parseInt(str.substr(i + 4, 2), 16);
              var c3 = parseInt(str.substr(i + 7, 2), 16);
              newStr += String.fromCharCode((c & 15) << 12 | (_c & 63) << 6 | c3 & 63);
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
        var matches = host.match(protocol.IPV4ADDRESS) || [];
        var _matches = slicedToArray(matches, 2), address = _matches[1];
        if (address) {
          return address.split(".").map(_stripLeadingZeros).join(".");
        } else {
          return host;
        }
      }
      function _normalizeIPv6(host, protocol) {
        var matches = host.match(protocol.IPV6ADDRESS) || [];
        var _matches2 = slicedToArray(matches, 3), address = _matches2[1], zone = _matches2[2];
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
          var longestZeroFields = allZeroFields.sort(function(a, b) {
            return b.length - a.length;
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
        var matches = uriString.match(URI_PARSE);
        if (matches) {
          if (NO_MATCH_IS_UNDEFINED) {
            components.scheme = matches[1];
            components.userinfo = matches[3];
            components.host = matches[4];
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = matches[7];
            components.fragment = matches[8];
            if (isNaN(components.port)) {
              components.port = matches[5];
            }
          } else {
            components.scheme = matches[1] || void 0;
            components.userinfo = uriString.indexOf("@") !== -1 ? matches[3] : void 0;
            components.host = uriString.indexOf("//") !== -1 ? matches[4] : void 0;
            components.port = parseInt(matches[5], 10);
            components.path = matches[6] || "";
            components.query = uriString.indexOf("?") !== -1 ? matches[7] : void 0;
            components.fragment = uriString.indexOf("#") !== -1 ? matches[8] : void 0;
            if (isNaN(components.port)) {
              components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : void 0;
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
              } catch (e) {
                components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
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
      function removeDotSegments(input) {
        var output = [];
        while (input.length) {
          if (input.match(RDS1)) {
            input = input.replace(RDS1, "");
          } else if (input.match(RDS2)) {
            input = input.replace(RDS2, "/");
          } else if (input.match(RDS3)) {
            input = input.replace(RDS3, "/");
            output.pop();
          } else if (input === "." || input === "..") {
            input = "";
          } else {
            var im = input.match(RDS5);
            if (im) {
              var s = im[0];
              input = input.slice(s.length);
              output.push(s);
            } else {
              throw new Error("Unexpected dot segment condition");
            }
          }
        }
        return output.join("");
      }
      function serialize(components) {
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
            } catch (e) {
              components.error = components.error || "Host's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
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
          base2 = parse(serialize(base2, options), options);
          relative = parse(serialize(relative, options), options);
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
        return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true), schemelessOptions);
      }
      function normalize(uri2, options) {
        if (typeof uri2 === "string") {
          uri2 = serialize(parse(uri2, options), options);
        } else if (typeOf(uri2) === "object") {
          uri2 = parse(serialize(uri2, options), options);
        }
        return uri2;
      }
      function equal3(uriA, uriB, options) {
        if (typeof uriA === "string") {
          uriA = serialize(parse(uriA, options), options);
        } else if (typeOf(uriA) === "object") {
          uriA = serialize(uriA, options);
        }
        if (typeof uriB === "string") {
          uriB = serialize(parse(uriB, options), options);
        } else if (typeOf(uriB) === "object") {
          uriB = serialize(uriB, options);
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
        serialize: function serialize2(components, options) {
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
        serialize: function serialize2(wsComponents, options) {
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
              } catch (e) {
                mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
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
              } catch (e) {
                components.error = components.error || "Email address's domain name can not be converted to " + (!options.iri ? "ASCII" : "Unicode") + " via punycode: " + e;
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
          var matches = components.path && components.path.match(URN_PARSE);
          var urnComponents = components;
          if (matches) {
            var scheme = options.scheme || urnComponents.scheme || "urn";
            var nid = matches[1].toLowerCase();
            var nss = matches[2];
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
        serialize: function serialize2(uuidComponents, options) {
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
      exports2.serialize = serialize;
      exports2.resolveComponents = resolveComponents;
      exports2.resolve = resolve2;
      exports2.normalize = normalize;
      exports2.equal = equal3;
      exports2.escapeComponent = escapeComponent;
      exports2.unescapeComponent = unescapeComponent;
      Object.defineProperty(exports2, "__esModule", { value: true });
    });
  })(uri_all, uri_all.exports);
  var uri_allExports = uri_all.exports;
  var fastDeepEqual = function equal(a, b) {
    if (a === b) return true;
    if (a && b && typeof a == "object" && typeof b == "object") {
      if (a.constructor !== b.constructor) return false;
      var length, i, keys;
      if (Array.isArray(a)) {
        length = a.length;
        if (length != b.length) return false;
        for (i = length; i-- !== 0; )
          if (!equal(a[i], b[i])) return false;
        return true;
      }
      if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
      if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
      if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
      keys = Object.keys(a);
      length = keys.length;
      if (length !== Object.keys(b).length) return false;
      for (i = length; i-- !== 0; )
        if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
      for (i = length; i-- !== 0; ) {
        var key = keys[i];
        if (!equal(a[key], b[key])) return false;
      }
      return true;
    }
    return a !== a && b !== b;
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
    copy,
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
  function copy(o, to) {
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
    var matches = str.match(new RegExp(dataVar, "g"));
    return matches ? matches.length : 0;
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
    var up, jsonPointer, data2, matches;
    if ($data === "") return "rootData";
    if ($data[0] == "/") {
      if (!JSON_POINTER$1.test($data)) throw new Error("Invalid JSON-pointer: " + $data);
      jsonPointer = $data;
      data2 = "rootData";
    } else {
      matches = $data.match(RELATIVE_JSON_POINTER$1);
      if (!matches) throw new Error("Invalid JSON-pointer: " + $data);
      up = +matches[1];
      jsonPointer = matches[2];
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
  function joinPaths(a, b) {
    if (a == '""') return b;
    return (a + " + " + b).replace(/([^\\])' \+ '/g, "$1");
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
    var schema, v, baseId;
    if (res) {
      schema = res.schema;
      root = res.root;
      baseId = res.baseId;
    }
    if (schema instanceof SchemaObject$1) {
      v = schema.validate || compile2.call(this, schema.schema, root, void 0, baseId);
    } else if (schema !== void 0) {
      v = inlineRef(schema, this._opts.inlineRefs) ? schema : compile2.call(this, schema, root, void 0, baseId);
    }
    return v;
  }
  function resolveSchema(root, ref2) {
    var p = URI$1.parse(ref2), refPath = _getFullPath(p), baseId = getFullPath(this._getId(root.schema));
    if (Object.keys(root.schema).length === 0 || refPath !== baseId) {
      var id = normalizeId(refPath);
      var refVal = this._refs[id];
      if (typeof refVal == "string") {
        return resolveRecursive.call(this, root, refVal, p);
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
    return getJsonPointer.call(this, p, baseId, root.schema, root);
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
  function getFullPath(id, normalize) {
    if (normalize !== false) id = normalizeId(id);
    var p = URI$1.parse(id);
    return _getFullPath(p);
  }
  function _getFullPath(p) {
    return URI$1.serialize(p).split("#")[0] + "#";
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
    var cmp = opts.cmp && /* @__PURE__ */ function(f) {
      return function(node) {
        return function(a, b) {
          var aobj = { key: a, value: node[a] };
          var bobj = { key: b, value: node[b] };
          return f(aobj, bobj);
        };
      };
    }(opts.cmp);
    var seen2 = [];
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
      if (seen2.indexOf(node) !== -1) {
        if (cycles) return JSON.stringify("__cycle__");
        throw new TypeError("Converting circular structure to JSON");
      }
      var seenIndex = seen2.push(node) - 1;
      var keys = Object.keys(node).sort(cmp && cmp(node));
      out = "";
      for (i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = stringify(node[key]);
        if (!value) continue;
        if (out) out += ",";
        out += JSON.stringify(key) + ":" + value;
      }
      seen2.splice(seenIndex, 1);
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
    var c = checkCompiling.call(this, schema, root, baseId);
    var compilation = this._compilations[c.index];
    if (c.compiling) return compilation.callValidate = callValidate;
    var formats2 = this._formats;
    var RULES = this.RULES;
    try {
      var v = localCompile(schema, root, localRefs, baseId);
      compilation.validate = v;
      var cv = compilation.callValidate;
      if (cv) {
        cv.schema = v.schema;
        cv.errors = null;
        cv.refs = v.refs;
        cv.refVal = v.refVal;
        cv.root = v.root;
        cv.$async = v.$async;
        if (opts.sourceCode) cv.source = v.source;
      }
      return v;
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
      } catch (e) {
        self2.logger.error("Error compiling schema, function code:", sourceCode);
        throw e;
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
      var v2 = resolve$1.call(self2, localCompile, root, ref2);
      if (v2 === void 0) {
        var localSchema = localRefs && localRefs[ref2];
        if (localSchema) {
          v2 = resolve$1.inlineRef(localSchema, opts.inlineRefs) ? localSchema : compile$1.call(self2, localSchema, root, localRefs, baseId2);
        }
      }
      if (v2 === void 0) {
        removeLocalRef(ref2);
      } else {
        replaceLocalRef(ref2, v2);
        return resolvedRef(v2, refCode);
      }
    }
    function addLocalRef(ref2, v2) {
      var refId = refVal.length;
      refVal[refId] = v2;
      refs[ref2] = refId;
      return "refVal" + refId;
    }
    function removeLocalRef(ref2) {
      delete refs[ref2];
    }
    function replaceLocalRef(ref2, v2) {
      var refId = refs[ref2];
      refVal[refId] = v2;
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
      var c = this._compilations[i];
      if (c.schema == schema && c.root == root && c.baseId == baseId) return i;
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
    var matches = str.match(DATE);
    if (!matches) return false;
    var year = +matches[1];
    var month = +matches[2];
    var day = +matches[3];
    return month >= 1 && month <= 12 && day >= 1 && day <= (month == 2 && isLeapYear(year) ? 29 : DAYS[month]);
  }
  function time(str, full) {
    var matches = str.match(TIME);
    if (!matches) return false;
    var hour = matches[1];
    var minute = matches[2];
    var second = matches[3];
    var timeZone = matches[5];
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
    } catch (e) {
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
  var format = function generate_format(it, $keyword, $ruleType) {
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
  var properties$2 = function generate_properties(it, $keyword, $ruleType) {
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
    function notProto(p) {
      return p !== "__proto__";
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
    format,
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
    properties: properties$2,
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
    var p = loadMetaSchemaOf(schema).then(function() {
      var schemaObj = self2._addSchema(schema, void 0, meta);
      return schemaObj.validate || _compileAsync(schemaObj);
    });
    if (callback) {
      p.then(
        function(v) {
          callback(null, v);
        },
        callback
      );
    }
    return p;
    function loadMetaSchemaOf(sch) {
      var $schema2 = sch.$schema;
      return $schema2 && !self2.getSchema($schema2) ? compileAsync.call(self2, { $ref: $schema2 }, true) : Promise.resolve();
    }
    function _compileAsync(schemaObj) {
      try {
        return self2._compile(schemaObj);
      } catch (e) {
        if (e instanceof MissingRefError) return loadMissingSchema(e);
        throw e;
      }
      function loadMissingSchema(e) {
        var ref2 = e.missingSchema;
        if (added(ref2)) throw new Error("Schema " + ref2 + " is loaded but " + e.missingRef + " cannot be resolved");
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
  const type$1 = [
    "object",
    "boolean"
  ];
  const properties$1 = {
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
    type: type$1,
    properties: properties$1,
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
    var v = this._validateKeyword = this._validateKeyword || this.compile(definitionSchema, true);
    if (v(definition)) return true;
    validateKeyword.errors = v.errors;
    if (throwError)
      throw new Error("custom keyword definition is invalid: " + this.errorsText(v.errors));
    else
      return false;
  }
  const $schema = "http://json-schema.org/draft-07/schema#";
  const $id = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
  const description = "Meta-schema for $data reference (JSON Schema extension proposal)";
  const type = "object";
  const required = [
    "$data"
  ];
  const properties = {
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
    type,
    required,
    properties,
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
    var v;
    if (typeof schemaKeyRef == "string") {
      v = this.getSchema(schemaKeyRef);
      if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
    } else {
      var schemaObj = this._addSchema(schemaKeyRef);
      v = schemaObj.validate || this._compile(schemaObj);
    }
    var valid = v(data2);
    if (v.$async !== true) this.errors = v.errors;
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
      var v = compileSchema.call(self2, schema, root, void 0, baseId);
      self2._fragments[ref2] = new SchemaObject({
        ref: ref2,
        fragment: true,
        schema,
        root,
        baseId,
        validate: v
      });
      return v;
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
        var serialize = this._opts.serialize;
        var cacheKey = serialize ? serialize(schemaKeyRef) : schemaKeyRef;
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
    var serialize = this._opts.serialize;
    var cacheKey = serialize ? serialize(schema) : schema;
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
    var v;
    try {
      v = compileSchema.call(this, schemaObj.schema, root, schemaObj.localRefs);
    } catch (e) {
      delete schemaObj.validate;
      throw e;
    } finally {
      schemaObj.compiling = false;
      if (schemaObj.meta) this._opts = currentOpts;
    }
    schemaObj.validate = v;
    schemaObj.refs = v.refs;
    schemaObj.refVal = v.refVal;
    schemaObj.root = v.root;
    return v;
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
      var e = errors[i];
      if (e) text += dataVar + e.dataPath + " " + e.message + separator;
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
    const keys = parseDef(def.keyType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items", "items", "0"]
    }) || parseAnyDef(refs);
    const values = parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items", "items", "1"]
    }) || parseAnyDef(refs);
    return {
      type: "array",
      maxItems: 125,
      items: {
        type: "array",
        items: [keys, values],
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
    const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
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
    const b = parseDef(def.out._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
    });
    return {
      allOf: [a, b].filter((x) => x !== void 0)
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
    _parse(input) {
      const { ctx } = this._processInputParams(input);
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
    registerResource(name, uriOrTemplate, config, readCallback) {
      if (typeof uriOrTemplate === "string") {
        if (this._registeredResources[uriOrTemplate]) {
          throw new Error(`Resource ${uriOrTemplate} is already registered`);
        }
        const registeredResource = this._createRegisteredResource(name, config.title, uriOrTemplate, config, readCallback);
        this.setResourceRequestHandlers();
        this.sendResourceListChanged();
        return registeredResource;
      } else {
        if (this._registeredResourceTemplates[name]) {
          throw new Error(`Resource template ${name} is already registered`);
        }
        const registeredResourceTemplate = this._createRegisteredResourceTemplate(name, config.title, uriOrTemplate, config, readCallback);
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
    registerTool(name, config, cb) {
      if (this._registeredTools[name]) {
        throw new Error(`Tool ${name} is already registered`);
      }
      const { title: title2, description: description2, inputSchema, outputSchema, annotations } = config;
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
    registerPrompt(name, config, cb) {
      if (this._registeredPrompts[name]) {
        throw new Error(`Prompt ${name} is already registered`);
      }
      const { title: title2, description: description2, argsSchema } = config;
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
  var gmail$2 = {};
  (function(exports) {
    var Gmail = function(localJQuery) {
      var $;
      if (localJQuery === false) ;
      else if (typeof localJQuery !== "undefined") {
        $ = localJQuery;
      } else if (typeof jQuery !== "undefined") {
        $ = jQuery;
      } else {
        throw new Error("GmailJS requires jQuery to be present in global scope or provided as a constructor argument.");
      }
      var window_opener = typeof window !== "undefined" ? window.opener : null;
      if (window_opener) {
        try {
          var opener_domain = window_opener.document.domain;
          if (opener_domain !== window.document.domain) {
            console.warn("GmailJS: window.opener domain differs from window domain.");
            window_opener = null;
          }
        } catch (error) {
          console.warn("GmailJS: Unable to access window.opener!", error);
          window_opener = null;
        }
      }
      var api = {
        get: {},
        observe: {},
        check: { data: {} },
        tools: {},
        tracker: {},
        dom: {},
        chat: {},
        compose: {},
        helper: { get: {} }
      };
      api.DISABLE_OLD_GMAIL_API_DEPRECATION_WARNINGS = false;
      function oldGmailApiDeprecated(text = "Migrate to new API compatible with new Gmail to silence this warning!") {
        if (api.DISABLE_OLD_GMAIL_API_DEPRECATION_WARNINGS) {
          return;
        }
        console.warn("GmailJS: using deprecated API for old Gmail.", text);
      }
      api.version = "0.8.0";
      api.tracker.globals = typeof GLOBALS !== "undefined" ? GLOBALS : window_opener && window_opener.GLOBALS || [];
      api.tracker.view_data = typeof VIEW_DATA !== "undefined" ? VIEW_DATA : window_opener && window_opener.VIEW_DATA || [];
      api.tracker.ik = api.tracker.globals[9] || "";
      api.tracker.mla = void 0;
      api.tracker.hangouts = void 0;
      api.cache = {};
      api.cache.debug_xhr_fetch = false;
      api.cache.emailIdCache = {};
      api.cache.emailLegacyIdCache = {};
      api.cache.threadCache = {};
      api.get.last_active = function() {
        var data2 = api.tracker.globals[17][15];
        return {
          time: data2[1],
          ip: data2[3],
          mac_address: data2[9],
          time_relative: data2[10]
        };
      };
      api.get.loggedin_accounts = function() {
        const data2 = api.tracker.mla;
        if (!Array.isArray(data2)) {
          return [];
        }
        return data2[1].map((item) => ({
          name: item[4],
          email: item[0],
          index: item[3]
        }));
      };
      api.get.user_email = function() {
        let user_email = api.tracker.globals[10];
        if (user_email) {
          return user_email;
        }
        const elements = document.getElementsByClassName("eYSAde");
        for (const el of elements) {
          if (el.innerHTML.indexOf("@") === -1) {
            return el.innerHTML;
          }
        }
        return null;
      };
      api.get.manager_email = function() {
        if (api.helper.get.is_delegated_inbox()) {
          return api.get.delegated_to_email();
        }
        return api.get.user_email();
      };
      api.get.delegated_to_email = function() {
        if (!api.helper.get.is_delegated_inbox()) {
          return null;
        }
        const userIndexPrefix = "/u/";
        const pathname = window.location.pathname;
        const delegatedToUserIndex = parseInt(pathname.substring(pathname.indexOf(userIndexPrefix) + userIndexPrefix.length), 10);
        const loggedInAccounts = api.get.loggedin_accounts();
        const loggedInAccount = loggedInAccounts.find((account) => account.index === delegatedToUserIndex);
        return loggedInAccount ? loggedInAccount.email : null;
      };
      api.helper.get.is_locale = function(locale) {
        if (!locale || typeof locale !== "string" || locale.length < 2) {
          return false;
        }
        if (locale.match(/[0-9]/)) {
          return false;
        }
        var localePrefix = locale.slice(0, 2);
        return localePrefix.toLowerCase() === localePrefix || localePrefix.toUpperCase() === localePrefix;
      };
      api.helper.filter_locale = function(locale) {
        if (!api.helper.get.is_locale(locale)) {
          return null;
        }
        return locale.substring(0, 2).toLowerCase();
      };
      api.helper.array_starts_with = function(list, item) {
        if (list && list.length > 0 && list[0] === item) {
          return true;
        } else {
          return false;
        }
      };
      api.helper.get.array_sublist = function(nestedArray, itemKey) {
        if (nestedArray) {
          for (var i = 0; i < nestedArray.length; i++) {
            var list = nestedArray[i];
            if (api.helper.array_starts_with(list, itemKey)) {
              return list;
            }
          }
        }
        return null;
      };
      api.helper.get.locale_from_url_params = function(value) {
        if (value && value.indexOf && (value.indexOf("https://") === 0 || value.indexOf("http://") === 0)) {
          var urlParts = value.split("?");
          if (urlParts.length > 1) {
            var hash = urlParts[1];
            var hashParts = hash.split("&");
            for (var i = 0; i < hashParts.length; i++) {
              var kvp = hashParts[i].split("=");
              if (kvp.length === 2 && kvp[0] === "hl") {
                return kvp[1];
              }
            }
          }
        }
        return null;
      };
      api.helper.get.locale_from_globals_item = function(list) {
        if (!list) {
          return null;
        }
        for (var i = 0; i < list.length; i++) {
          var item = list[i];
          var locale = api.helper.get.locale_from_url_params(item);
          if (locale) {
            return locale;
          }
        }
        return list[8];
      };
      api.get.localization = function() {
        var globals = api.tracker.globals;
        var localeList = api.helper.get.array_sublist(globals[17], "ui");
        if (localeList !== null && localeList.length > 8) {
          let locale = api.helper.get.locale_from_globals_item(localeList);
          locale = api.helper.filter_locale(locale);
          if (locale) {
            return locale;
          }
        }
        if (globals[12] !== null) {
          let locale = api.helper.get.locale_from_url_params(globals[12]);
          locale = api.helper.filter_locale(locale);
          if (locale) {
            return locale;
          }
        }
        if (globals[4]) {
          let locale = globals[4].split(".")[1];
          locale = api.helper.filter_locale(locale);
          if (locale) {
            return locale;
          }
        }
        return null;
      };
      api.check.is_new_data_layer = function() {
        return window["GM_SPT_ENABLED"] === "true";
      };
      api.check.is_new_gui = function() {
        return window.GM_RFT_ENABLED === "true";
      };
      api.check.is_thread = function() {
        var check_1 = $(".nH .if,.iY").children(":eq(1)").children().children(":eq(1)").children();
        var check_2 = api.get.email_ids();
        return check_1.length > 1 || check_2.length > 1;
      };
      api.check.is_peoplekit_compose = function(el) {
        return $(el).find("div[name=to] input[peoplekit-id]").length !== 0;
      };
      api.dom.inbox_content = function() {
        return $("div[role=main]:first");
      };
      api.check.is_preview_pane = function() {
        var dom = api.dom.inbox_content();
        var boxes = dom.find("[gh=tl]");
        var previewPaneFound = false;
        boxes.each(function() {
          if ($(this).hasClass("aia")) {
            previewPaneFound = true;
          }
        });
        return previewPaneFound;
      };
      api.check.is_multiple_inbox = function() {
        var dom = api.dom.inboxes();
        return dom.length > 1;
      };
      api.check.is_horizontal_split = function() {
        var dom = api.dom.inbox_content();
        var box = dom.find("[gh=tl]").find(".nn");
        return box.length === 0;
      };
      api.check.is_vertical_split = function() {
        return api.check.is_horizontal_split() === false;
      };
      api.check.is_tabbed_inbox = function() {
        return document.querySelectorAll(".aKh").length === 1;
      };
      api.check.is_right_side_chat = function() {
        var chat = document.querySelectorAll(".ApVoH");
        if (chat.length === 0) {
          return false;
        }
        return chat[0].getAttribute("aria-labelledby") === ":wf";
      };
      api.check.should_compose_fullscreen = function() {
        console.warn("gmail.js: This function is known to be unreliable, and may be deprecated in a future release.");
        var bx_scfs = [];
        try {
          bx_scfs = api.tracker.globals[17][4][1][32];
        } catch (er) {
          bx_scfs = ["bx_scfs", "false"];
        }
        return bx_scfs[1] === "true" ? true : false;
      };
      api.check.is_google_apps_user = function() {
        var email = api.get.user_email();
        return email.indexOf("gmail.com", email.length - "gmail.com".length) === -1;
      };
      api.get.storage_info = function() {
        var div = document.querySelector(".md.mj div");
        var used = div.querySelectorAll("span")[0].textContent.replace(/,/g, ".");
        var total = div.querySelectorAll("span")[1].textContent.replace(/,/g, ".");
        var percent = parseFloat(used.replace(/[^0-9\.]/g, "")) * 100 / parseFloat(total.replace(/[^0-9\.]/g, ""));
        return { used, total, percent: Math.floor(percent) };
      };
      api.dom.inboxes = function() {
        var dom = api.dom.inbox_content();
        return dom.find("[gh=tl]");
      };
      api.dom.email_subject = function() {
        var e = $(".hP");
        for (var i = 0; i < e.length; i++) {
          if ($(e[i]).is(":visible")) {
            return $(e[i]);
          }
        }
        return $();
      };
      api.get.email_subject = function() {
        var subject_dom = api.dom.email_subject();
        return subject_dom.text();
      };
      api.dom.email_body = function() {
        return $(".nH.hx");
      };
      api.dom.toolbar = function() {
        var tb = $("[gh='mtb']");
        while ($(tb).children().length === 1) {
          tb = $(tb).children().first();
        }
        return tb;
      };
      api.dom.right_toolbar = function() {
        return $("[gh='tm'] .Cr.aqJ");
      };
      api.check.is_inside_email = function() {
        if (api.get.current_page() !== "email" && !api.check.is_preview_pane()) {
          return false;
        }
        var items2 = document.querySelectorAll(".ii.gt .a3s");
        var ids = [];
        for (var i = 0; i < items2.length; i++) {
          var mail_id = items2[i].getAttribute("class").split(" ")[2];
          if (mail_id !== "undefined" && mail_id !== void 0) {
            ids.push(items2[i]);
          }
        }
        return ids.length > 0;
      };
      api.check.is_plain_text = function() {
        var settings = api.tracker.globals[17][4][1];
        for (var i = 0; i < settings.length; i++) {
          var plain_text_setting = settings[i];
          if (plain_text_setting[0] === "bx_cm") {
            return plain_text_setting[1] === "0";
          }
        }
        return false;
      };
      api.dom.email_contents = function() {
        var items2 = document.querySelectorAll(".ii.gt div.a3s.aXjCH");
        var ids = [];
        for (var i = 0; i < items2.length; i++) {
          var mail_id = items2[i].getAttribute("class").split(" ")[2];
          var is_editable = items2[i].getAttribute("contenteditable");
          if (mail_id !== "undefined" && mail_id !== void 0) {
            if (is_editable !== "true") {
              ids.push(items2[i]);
            }
          }
        }
        return ids;
      };
      api.get.email_ids = function() {
        oldGmailApiDeprecated();
        if (api.check.is_inside_email()) {
          var data2 = api.get.email_data();
          return Object.keys(data2.threads);
        }
        return [];
      };
      api.get.compose_ids = function() {
        var ret = [];
        var dom = document.querySelectorAll(".M9 [name=draft]");
        for (var i = 0; i < dom.length; i++) {
          if (dom[i].value !== "undefined") {
            ret.push(dom[i].value);
          }
        }
        return ret;
      };
      api.get.thread_id = function() {
        oldGmailApiDeprecated();
        const elem = document.querySelector("h2[data-legacy-thread-id]");
        if (elem !== null) {
          return elem.dataset.legacyThreadId;
        } else {
          return void 0;
        }
      };
      api.get.email_id = function() {
        oldGmailApiDeprecated();
        return api.get.thread_id();
      };
      api.check.is_priority_inbox = function() {
        return document.querySelector(".qh") !== null;
      };
      api.check.is_rapportive_installed = function() {
        return document.querySelector("#rapportive-sidebar") !== null;
      };
      api.check.is_streak_installed = function() {
        return document.querySelector("[id^='bentoBox'],[id*=' bentoBox'],[class*=' bentoBox'],[class*='bentoBox']") !== null;
      };
      api.check.is_anydo_installed = function() {
        return document.querySelector("[id^='anydo'],[id*=' anydo'],[class*=' anydo'],[class*='anydo']") !== null;
      };
      api.check.is_boomerang_installed = function() {
        return document.querySelector("[id^='b4g_'],[id*=' b4g_'],[class*=' b4g_'],[class*='b4g_']") !== null;
      };
      api.check.is_xobni_installed = function() {
        return document.querySelector("#xobni_frame") !== null;
      };
      api.check.is_signal_installed = function() {
        return document.querySelector("[id^='Signal'],[id*=' Signal'],[class*=' signal'],[class*='signal']") !== null;
      };
      api.check.are_shortcuts_enabled = function() {
        var flag_name = "bx_hs";
        var flag_value = void 0;
        var check = true;
        var array_with_flag = api.tracker.globals[17][4][1];
        for (var i = 0; i < array_with_flag.length; i++) {
          var current = array_with_flag[i];
          if (current[0] === flag_name) {
            flag_value = current[1];
            break;
          }
        }
        if (flag_value !== void 0) {
          var values = {
            "0": true,
            "1": false
          };
          check = values[flag_value];
        }
        return check;
      };
      api.dom.get_left_sidebar_links = function() {
        return $("div[role=navigation] [title]");
      };
      api.dom.header = function() {
        return $("#gb");
      };
      api.dom.search_bar = function() {
        return $("[gh=sb]");
      };
      api.get.search_query = function() {
        var dom = api.dom.search_bar();
        return dom.find("input")[0].value;
      };
      api.get.unread_inbox_emails = function() {
        return api.helper.get.navigation_count("inbox");
      };
      api.get.unread_draft_emails = function() {
        return api.helper.get.navigation_count("drafts");
      };
      api.get.unread_spam_emails = function() {
        return api.helper.get.navigation_count("spam");
      };
      api.get.unread_forum_emails = function() {
        return api.helper.get.navigation_count("forums");
      };
      api.get.unread_update_emails = function() {
        return api.helper.get.navigation_count("updates");
      };
      api.get.unread_promotion_emails = function() {
        return api.helper.get.navigation_count("promotions");
      };
      api.get.unread_social_emails = function() {
        return api.helper.get.navigation_count("social_updates");
      };
      api.helper.get.navigation_count = function(i18nName) {
        const title2 = api.tools.i18n(i18nName);
        const dom = document.querySelectorAll("div[role=navigation] [title*='" + title2 + "']");
        if (dom.length > 0) {
          if (dom[0].title.indexOf(title2) !== -1) {
            const value = parseInt(dom[0].attributes["aria-label"].value.replace(/[^0-9]/g, ""));
            if (!isNaN(value)) {
              return value;
            }
          }
        }
        return 0;
      };
      api.get.beta = function() {
        var features = {
          "new_nav_bar": document.querySelector("#gbz") !== null
        };
        return features;
      };
      api.get.unread_emails = function() {
        return {
          inbox: api.get.unread_inbox_emails(),
          drafts: api.get.unread_draft_emails(),
          spam: api.get.unread_spam_emails(),
          forum: api.get.unread_forum_emails(),
          update: api.get.unread_update_emails(),
          promotions: api.get.unread_promotion_emails(),
          social: api.get.unread_social_emails()
        };
      };
      api.tools.error = function(str, ...args) {
        console.error(str, ...args);
      };
      api.tools.parse_url = function(url) {
        var regex2 = /[?&]([^=#]+)=([^&#]*)/g;
        var params = {};
        var match = regex2.exec(url);
        while (match) {
          params[match[1]] = match[2];
          match = regex2.exec(url);
        }
        return params;
      };
      api.tools.sleep = function(milliseconds) {
        var start = (/* @__PURE__ */ new Date()).getTime();
        while (true) {
          if ((/* @__PURE__ */ new Date()).getTime() - start > milliseconds) {
            break;
          }
        }
      };
      api.tools.multitry = function(delay, tries, func, check, counter, retval) {
        if (counter !== void 0 && counter >= tries) {
          return retval;
        }
        counter = counter === void 0 ? 0 : counter;
        var value = func();
        if (check(value)) {
          return value;
        } else {
          api.tools.sleep(delay);
          api.tools.multitry(delay, tries, func, check, counter + 1, value);
        }
      };
      api.tools.deparam = function(params, coerce) {
        var each = function(arr, fnc) {
          var data2 = [];
          for (var i = 0; i < arr.length; i++) {
            data2.push(fnc(arr[i]));
          }
          return data2;
        };
        var isArray = Array.isArray || function(obj2) {
          return Object.prototype.toString.call(obj2) === "[object Array]";
        };
        var obj = {}, coerce_types = {
          "true": true,
          "false": false,
          "null": null
        };
        each(params.replace(/\+/g, " ").split("&"), function(v, j) {
          var param = v.split("="), key = decodeURIComponent(param[0]), val, cur = obj, i = 0, keys = key.split("]["), keys_last = keys.length - 1;
          if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
            keys[keys_last] = keys[keys_last].replace(/\]$/, "");
            keys = keys.shift().split("[").concat(keys);
            keys_last = keys.length - 1;
          } else {
            keys_last = 0;
          }
          if (param.length === 2) {
            val = decodeURIComponent(param[1]);
            if (coerce) {
              val = val && !isNaN(val) ? +val : val === "undefined" ? void 0 : coerce_types[val] !== void 0 ? coerce_types[val] : val;
            }
            if (keys_last) {
              for (; i <= keys_last; i++) {
                key = keys[i] === "" ? cur.length : keys[i];
                cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val;
              }
            } else {
              if (isArray(obj[key])) {
                obj[key].push(val);
              } else if (obj[key] !== void 0) {
                obj[key] = [obj[key], val];
              } else {
                obj[key] = val;
              }
            }
          } else if (key) {
            obj[key] = coerce ? void 0 : "";
          }
        });
        return obj;
      };
      api.tools.get_pathname_from_url = function(url) {
        if (typeof document !== "undefined") {
          const a = document.createElement("a");
          a.href = url;
          return a.pathname;
        } else {
          return url;
        }
      };
      api.tools.parse_actions = function(params, xhr) {
        if (params.url.act === "fup" || params.url.act === "fuv" || params.body_is_object) {
          return params.body_is_object && api.observe.bound("upload_attachment") ? { upload_attachment: [params.body_params] } : false;
        }
        if (params.url.search !== void 0) ;
        var triggered = {};
        var action_map = {
          "tae": "add_to_tasks",
          "rc_^i": "archive",
          "tr": "delete",
          "dm": "delete_message_in_thread",
          "dl": "delete_forever",
          "dc_": "delete_label",
          "dr": "discard_draft",
          "el": "expand_categories",
          "cffm": "filter_messages_like_these",
          "arl": "label",
          "mai": "mark_as_important",
          "mani": "mark_as_not_important",
          "us": "mark_as_not_spam",
          "sp": "mark_as_spam",
          "mt": "move_label",
          "ib": "move_to_inbox",
          "ig": "mute",
          "rd": "read",
          "sd": "save_draft",
          "sm": "send_message",
          "mo": "show_newly_arrived_message",
          "st": "star",
          "cs": "undo_send",
          "ug": "unmute",
          "ur": "unread",
          "xst": "unstar",
          "new_mail": "new_email",
          "poll": "poll",
          "refresh": "refresh",
          "rtr": "restore_message_in_thread",
          "open_email": "open_email",
          "toggle_threads": "toggle_threads"
        };
        if (typeof params.url.ik === "string") {
          api.tracker.ik = params.url.ik;
        }
        if (typeof params.url.at === "string") {
          api.tracker.at = params.url.at;
        }
        if (typeof params.url.rid === "string") {
          if (params.url.rid.indexOf("mail") !== -1) {
            api.tracker.rid = params.url.rid;
          }
        }
        var action = decodeURIComponent(params.url.act);
        var sent_params = params.body_params;
        var email_ids = typeof sent_params.t === "string" ? [sent_params.t] : sent_params.t;
        var response = null;
        switch (action) {
          case "cs":
          case "ur":
          case "rd":
          case "tr":
          case "sp":
          case "us":
          case "ib":
          case "dl":
          case "st":
          case "xst":
          case "mai":
          case "mani":
          case "ig":
          case "ug":
          case "dr":
          case "mt":
          case "cffm":
          case "rc_^i":
            response = [email_ids, params.url, params.body];
            break;
          case "arl":
          case "dc_":
            response = [email_ids, params.url, params.body, params.url.acn];
            break;
          case "sd":
            response = [email_ids, params.url, sent_params];
            break;
          case "tae":
          case "sm":
            response = [params.url, params.body, sent_params];
            break;
          case "el":
            response = [params.url, params.body, sent_params.ex === "1"];
            break;
          case "dm":
          case "rtr":
          case "mo":
            response = [sent_params.m, params.url, params.body];
            break;
        }
        if (typeof params.url._reqid === "string" && params.url.view === "tl" && params.url.auto !== void 0) {
          response = [params.url.th, params.url, params.body];
          if (api.observe.bound("new_email")) {
            triggered.new_email = response;
          }
        }
        if ((params.url.view === "cv" || params.url.view === "ad") && typeof params.url.th === "string" && typeof params.url.search === "string" && params.url.rid === void 0) {
          response = [params.url.th, params.url, params.body];
          if (api.observe.bound("open_email")) {
            triggered.open_email = response;
          }
        }
        if ((params.url.view === "cv" || params.url.view === "ad") && typeof params.url.th === "object" && typeof params.url.search === "string" && params.url.rid !== void 0) {
          response = [params.url.th, params.url, params.body];
          if (api.observe.bound("toggle_threads")) {
            triggered.toggle_threads = response;
          }
        }
        if ((params.url.view === "cv" || params.url.view === "ad") && typeof params.url.th === "string" && typeof params.url.search === "string" && params.url.rid !== void 0) {
          if (params.url.msgs !== void 0) {
            response = [params.url.th, params.url, params.body];
            if (api.observe.bound("toggle_threads")) {
              triggered.toggle_threads = response;
            }
          }
        }
        if (typeof params.url.SID === "string" && typeof params.url.zx === "string" && params.body.indexOf("req0_") !== -1) {
          api.tracker.SID = params.url.SID;
          response = [params.url, params.body, sent_params];
          if (api.observe.bound("poll")) {
            triggered.poll = response;
          }
        }
        if (typeof params.url.ik === "string" && typeof params.url.search === "string" && params.body.length === 0 && typeof params.url._reqid === "string") {
          response = [params.url, params.body, sent_params];
          if (api.observe.bound("refresh")) {
            triggered.refresh = response;
          }
        }
        if (response && action_map[action] && api.observe.bound(action_map[action])) {
          triggered[action_map[action]] = response;
        }
        if (params.method === "POST") {
          triggered.http_event = [params];
        }
        if (api.check.is_new_data_layer()) {
          api.tools.parse_request_payload(params, triggered);
        }
        return triggered;
      };
      api.check.data.is_thread_id = function(id) {
        return id && typeof id === "string" && /^thread-[a|f]:/.test(id);
      };
      api.check.data.is_thread = function(obj) {
        return obj && typeof obj === "object" && obj["0"] && api.check.data.is_thread_id(obj["0"]);
      };
      api.check.data.is_email_id = function(id) {
        return id && typeof id === "string" && id.indexOf("bump-") === -1 && /^msg-[a|f]:/.test(id);
      };
      api.check.data.is_email = function(obj) {
        return obj && typeof obj === "object" && obj["0"] && api.check.data.is_email_id(obj["0"]);
      };
      api.check.data.is_email_new = function(obj) {
        return obj && obj[0] && api.check.data.is_email_id(obj[0]);
      };
      api.check.data.is_legacy_email_id = function(id) {
        return id && typeof id === "string" && /^[0-9a-f]{16,}$/.test(id);
      };
      api.check.data.is_action = function(obj) {
        return api.check.data.is_first_type_action(obj) || api.check.data.is_second_type_action(obj);
      };
      api.check.data.is_first_type_action = function(obj) {
        return obj && obj["1"] && Array.isArray(obj["1"]) && obj["1"].length === 1 && typeof obj["1"]["0"] === "string";
      };
      api.check.data.is_second_type_action = function(obj) {
        return obj && obj["2"] && Array.isArray(obj["2"]) && obj["2"].length && typeof obj["2"]["0"] === "string";
      };
      api.check.data.is_smartlabels_array = function(obj) {
        const isNotArray = !obj || !Array.isArray(obj) || obj.length === 0;
        if (isNotArray) {
          return false;
        }
        for (let item of obj) {
          if (typeof item !== "string") {
            return false;
          }
          if (!/^\^[a-z]+/.test(item)) {
            return false;
          }
        }
        return true;
      };
      api.check.data.is_json_string = function(obj) {
        if (!obj || typeof obj !== "string") {
          return false;
        }
        let str = obj.trim();
        return str.startsWith("{") && str.endsWith("}") || str.startsWith("[") && str.endsWith("]");
      };
      api.tools.get_thread_id = function(obj) {
        return api.check.data.is_thread(obj) && obj["1"];
      };
      api.tools.get_thread_data = function(obj) {
        return obj && obj["2"] && typeof obj["2"] === "object" && obj["2"]["7"] && typeof obj["2"]["7"] === "object" && obj["2"]["7"];
      };
      api.tools.get_action = function(obj) {
        return api.tools.get_first_type_action(obj) || api.tools.get_second_type_action(obj);
      };
      api.tools.get_first_type_action = function(obj) {
        return obj && obj[1] && obj[1].join("");
      };
      api.tools.get_second_type_action = function(obj) {
        return obj && obj[2] && obj[2].join("");
      };
      api.tools.get_message_ids = function(obj) {
        return obj && obj["3"] && Array.isArray(obj["3"]) && obj["3"];
      };
      api.tools.extract_from_graph = function(obj, predicate) {
        const result = [];
        const safePredicate = function(item) {
          try {
            return predicate(item);
          } catch (err) {
            return false;
          }
        };
        const forEachGraph = function(obj2) {
          if (safePredicate(obj2)) {
            result.push(obj2);
            return;
          }
          for (let key in obj2) {
            let item = obj2[key];
            if (safePredicate(item)) {
              result.push(item);
              continue;
            }
            if (Array.isArray(item)) {
              for (let listItem of item) {
                forEachGraph(listItem);
              }
            } else if (typeof item === "object") {
              forEachGraph(item);
            }
          }
        };
        forEachGraph(obj);
        return result;
      };
      api.tools.check_event_type = function(threadObj) {
        const apply_label = "^x_";
        const action_map = {
          // ""            : "add_to_tasks",
          "^a": "archive",
          "^k": "delete",
          // ""            : "delete_message_in_thread",
          // ""            : "delete_forever",
          // ""            : "delete_label",
          // ""            : "discard_draft",
          // ""            : "expand_categories",
          // ""            : "filter_messages_like_these",
          "^x_": "label",
          // "^io_im^imi": "mark_as_important",
          // "^imn": "mark_as_not_important",
          // ""            : "mark_as_not_spam",
          // ""            : "mark_as_spam",
          // ""            : "move_label",
          // ""            : "move_to_inbox",
          // ""            : "mute",
          "^u^us": "read",
          // ""            : "save_draft",
          // ""            : "send_message",
          // ""            : "show_newly_arrived_message",
          // "^t^ss_sy": "star",
          // ""            : "undo_send",
          // ""            : "unmute",
          "^u": "unread",
          // "^t^ss_sy^ss_so^ss_sr^ss_sp^ss_sb^ss_sg^ss_cr^ss_co^ss_cy^ss_cg^ss_cb^ss_cp": "unstar",
          "^us": "new_email",
          // ""            : "poll",
          // ""            : "refresh",
          // ""            : "restore_message_in_thread",
          "^o": "open_email"
          // ""            : "toggle_threads"
        };
        const threadData = api.tools.get_thread_data(threadObj);
        if (threadData && api.check.data.is_action(threadData)) {
          const action = api.tools.get_action(threadData);
          if (action.startsWith(apply_label) && api.check.data.is_first_type_action(threadData)) {
            return action_map[apply_label];
          } else {
            return action_map[action];
          }
        } else {
          return null;
        }
      };
      api.tools.parse_fd_bv_contacts = function(json) {
        if (!json || !Array.isArray(json)) {
          return [];
        }
        const res = [];
        for (let item of json) {
          res.push(api.tools.parse_fd_bv_contact(item));
        }
        return res;
      };
      api.tools.parse_fd_bv_is_draft = function(item) {
        try {
          if (!Array.isArray(item)) return false;
          return item.includes("^r") && item.includes("^r_bt");
        } catch (e) {
          return false;
        }
      };
      api.tools.parse_fd_bv_contact = function(item) {
        try {
          return {
            name: item["2"],
            address: item["1"]
          };
        } catch (e) {
          return null;
        }
      };
      api.tools.parse_fd_attachments = function(json) {
        let res = [];
        if (Array.isArray(json)) {
          for (let item of json) {
            let data2 = item["0"]["3"] || "";
            res.push({
              attachment_id: item["0"]["1"],
              name: data2["2"],
              type: data2["3"],
              url: api.tools.check_fd_attachment_url(data2["1"]),
              size: Number.parseInt(data2["4"])
            });
          }
        }
        return res;
      };
      api.tools.parse_fd_embedded_json_attachments = function(json) {
        let res = [];
        if (Array.isArray(json)) {
          for (let item of json) {
            res.push({
              attachment_id: item[3],
              name: item[1],
              type: item[0],
              url: api.tools.check_fd_attachment_url(item[5]),
              size: item[2]
            });
          }
        }
        return res;
      };
      api.tools.check_fd_attachment_url = function(url) {
        var userAccountUrlPart = api.tracker.globals[7];
        if (url && userAccountUrlPart && url.indexOf(userAccountUrlPart) < 0) {
          url = url.replace("/mail/?", userAccountUrlPart + "?");
        }
        return url;
      };
      api.tools.parse_fd_request_html_payload = function(fd_email) {
        let fd_email_content_html = null;
        try {
          const fd_html_containers = fd_email["1"]["5"]["1"];
          for (let fd_html_container of fd_html_containers) {
            fd_email_content_html = (fd_email_content_html || "") + fd_html_container["2"]["1"];
          }
        } catch (e) {
        }
        return fd_email_content_html;
      };
      api.tools.parse_fd_embedded_json_content_html = function(fd_email) {
        let fd_email_content_html = null;
        try {
          const fd_html_containers = fd_email["8"]["1"];
          for (let fd_html_container of fd_html_containers) {
            fd_email_content_html = (fd_email_content_html || "") + fd_html_container["2"]["1"];
          }
        } catch (e) {
        }
        return fd_email_content_html;
      };
      api.tools.parse_fd_request_payload_get_email2 = function(fd_thread_container, fd_email_id) {
        try {
          const fd_emails2 = fd_thread_container["1"]["1"];
          const fd_email2 = fd_emails2.filter((i) => i["0"] === fd_email_id);
          return fd_email2[0];
        } catch (e) {
          return {};
        }
      };
      api.tools.parse_fd_embedded_json_get_email = function(fd_thread_container, fd_email_id) {
        try {
          const fd_emails2 = fd_thread_container["1"]["4"];
          const fd_email2 = fd_emails2.filter((i) => i["0"] === fd_email_id);
          return fd_email2[0];
        } catch (e) {
          return {};
        }
      };
      api.tools.parse_fd_request_payload = function(json) {
        let thread_root = json["1"];
        if (!thread_root || !Array.isArray(thread_root)) {
          return null;
        }
        try {
          const res = [];
          const fd_threads = thread_root;
          for (let fd_thread_container of fd_threads) {
            const fd_thread_id = fd_thread_container["0"];
            let fd_emails = fd_thread_container["2"];
            for (let fd_email of fd_emails) {
              const fd_email_id = fd_email["0"];
              const fd_email2 = api.tools.parse_fd_request_payload_get_email2(fd_thread_container, fd_email_id);
              const fd_legacy_email_id = fd_email["1"]["34"];
              const fd_email_smtp_id = fd_email["1"]["7"];
              const fd_email_subject = fd_email["1"]["4"];
              const fd_email_timestamp = Number.parseInt(fd_email["1"]["16"]);
              const fd_email_date = new Date(fd_email_timestamp);
              const fd_email_is_draft = api.tools.parse_fd_bv_is_draft(fd_email2["3"]);
              const fd_email_content_html = api.tools.parse_fd_request_html_payload(fd_email);
              const fd_attachments = api.tools.parse_fd_attachments(fd_email["1"]["13"]);
              const fd_email_sender_address = fd_email["1"]["10"]["16"];
              let fd_from = api.tools.parse_fd_bv_contact(fd_email2["1"]);
              if (!fd_from) {
                fd_from = { address: fd_email_sender_address, name: "" };
              }
              const fd_to = api.tools.parse_fd_bv_contacts(fd_email["1"]["0"]);
              const fd_cc = api.tools.parse_fd_bv_contacts(fd_email["1"]["1"]);
              const fd_bcc = api.tools.parse_fd_bv_contacts(fd_email["1"]["2"]);
              const email = {
                id: fd_email_id,
                is_draft: fd_email_is_draft,
                legacy_email_id: fd_legacy_email_id,
                thread_id: fd_thread_id,
                smtp_id: fd_email_smtp_id,
                subject: fd_email_subject,
                timestamp: fd_email_timestamp,
                content_html: fd_email_content_html,
                date: fd_email_date,
                from: fd_from,
                to: fd_to,
                cc: fd_cc,
                bcc: fd_bcc,
                attachments: fd_attachments
              };
              if (api.cache.debug_xhr_fetch) {
                email["$email_node"] = fd_email;
                email["$thread_node"] = fd_thread_container;
              }
              res.push(email);
            }
          }
          return res;
        } catch (error) {
          console.warn("Gmail.js encountered an error trying to parse email-data on fd request!", error);
          return null;
        }
      };
      api.tools.parse_fd_embedded_json = function(json) {
        let thread_root = json["1"];
        if (!thread_root || !Array.isArray(thread_root)) {
          return null;
        }
        try {
          const res = [];
          const fd_threads = thread_root;
          for (let fd_thread_container of fd_threads) {
            const fd_thread_id = fd_thread_container["1"]["3"];
            let fd_emails = fd_thread_container["1"]["4"];
            for (let fd_email of fd_emails) {
              const fd_email_id = fd_email["0"];
              const fd_email2 = api.tools.parse_fd_embedded_json_get_email(fd_thread_container, fd_email_id);
              const fd_legacy_email_id = fd_email["55"];
              const fd_email_smtp_id = fd_email["13"];
              const fd_email_subject = fd_email["7"];
              const fd_email_is_draft = api.tools.parse_fd_bv_is_draft(fd_email["10"]);
              const fd_email_timestamp = Number.parseInt(fd_email["17"]);
              const fd_email_date = new Date(fd_email_timestamp);
              const fd_email_content_html = api.tools.parse_fd_embedded_json_content_html(fd_email);
              const fd_attachments = api.tools.parse_fd_embedded_json_attachments(fd_email["11"]);
              const fd_email_sender_address = fd_email["18"]["16"];
              let fd_from = api.tools.parse_fd_bv_contact(fd_email2["1"]);
              if (!fd_from) {
                fd_from = {
                  address: fd_email_sender_address,
                  name: ""
                };
              }
              const fd_to = api.tools.parse_fd_bv_contacts(fd_email["2"]);
              const fd_cc = api.tools.parse_fd_bv_contacts(fd_email["3"]);
              const fd_bcc = api.tools.parse_fd_bv_contacts(fd_email["4"]);
              const email = {
                id: fd_email_id,
                is_draft: fd_email_is_draft,
                legacy_email_id: fd_legacy_email_id,
                thread_id: fd_thread_id,
                smtp_id: fd_email_smtp_id,
                subject: fd_email_subject,
                timestamp: fd_email_timestamp,
                content_html: fd_email_content_html,
                date: fd_email_date,
                from: fd_from,
                to: fd_to,
                cc: fd_cc,
                bcc: fd_bcc,
                attachments: fd_attachments
              };
              if (api.cache.debug_xhr_fetch) {
                email["$email_node"] = fd_email;
                email["$thread_node"] = fd_thread_container;
              }
              res.push(email);
            }
          }
          return res;
        } catch (error) {
          console.warn("Gmail.js encountered an error trying to parse email-data on embedded json!", error);
          return null;
        }
      };
      api.tools.parse_bv_request_payload = function(json) {
        let thread_root = json["2"];
        if (!thread_root || !Array.isArray(thread_root)) {
          return null;
        }
        try {
          const res = [];
          const bv_threads = thread_root;
          for (let bv_thread_container of bv_threads) {
            const bv_thread_subject = bv_thread_container["0"]["0"];
            const bv_thread_id = bv_thread_container["0"]["3"];
            let bv_emails = bv_thread_container["0"]["4"];
            for (let bv_email of bv_emails) {
              const bv_email_id = bv_email["0"];
              const bv_legacy_email_id = bv_email["55"];
              const bv_email_smtp_id = "";
              const bv_email_subject = bv_thread_subject;
              const bv_email_timestamp = Number.parseInt(bv_email["17"]);
              const bv_email_date = new Date(bv_email_timestamp);
              const bv_email_content_html = "";
              const bv_email_is_draft = api.tools.parse_fd_bv_is_draft(bv_email["10"]);
              const bv_attachments = [];
              const bv_from = {
                address: bv_email["1"]["1"] !== void 0 ? bv_email["1"]["1"] : "",
                name: bv_email["1"]["2"] !== void 0 ? bv_email["1"]["2"] : ""
              };
              const bv_to = [];
              const bv_cc = [];
              const bv_bcc = [];
              const email = {
                id: bv_email_id,
                is_draft: bv_email_is_draft,
                legacy_email_id: bv_legacy_email_id,
                thread_id: bv_thread_id,
                smtp_id: bv_email_smtp_id,
                subject: bv_email_subject,
                timestamp: bv_email_timestamp,
                content_html: bv_email_content_html,
                date: bv_email_date,
                from: bv_from,
                to: bv_to,
                cc: bv_cc,
                bcc: bv_bcc,
                attachments: bv_attachments
              };
              if (api.cache.debug_xhr_fetch) {
                email["$email_node"] = bv_email;
                email["$thread_node"] = bv_thread_container;
              }
              res.push(email);
            }
          }
          return res;
        } catch (error) {
          console.warn("Gmail.js encountered an error trying to parse email-data on bv request!", error);
          return null;
        }
      };
      api.tools.parse_bv_embedded_json = function(json) {
        let thread_root = json["0"]["0"];
        if (!thread_root || !Array.isArray(thread_root)) {
          return null;
        }
        try {
          const res = [];
          const bv_threads = thread_root;
          for (let bv_thread_container of bv_threads) {
            const bv_thread_subject = bv_thread_container["4"]["0"];
            const bv_thread_id = bv_thread_container["4"]["3"];
            let bv_emails = bv_thread_container["4"]["4"];
            for (let bv_email of bv_emails) {
              const bv_email_id = bv_email["0"];
              const bv_legacy_email_id = bv_email["55"];
              const bv_email_smtp_id = "";
              const bv_email_subject = bv_thread_subject;
              const bv_email_timestamp = Number.parseInt(bv_email["17"]);
              const bv_email_date = new Date(bv_email_timestamp);
              const bv_email_content_html = "";
              const bv_email_is_draft = api.tools.parse_fd_bv_is_draft(bv_email["10"]);
              const bv_attachments = [];
              const bv_from = {
                address: bv_email["1"]["1"] !== void 0 ? bv_email["1"]["1"] : "",
                name: bv_email["1"]["2"] !== void 0 ? bv_email["1"]["2"] : ""
              };
              const bv_to = [];
              const bv_cc = [];
              const bv_bcc = [];
              const email = {
                id: bv_email_id,
                is_draft: bv_email_is_draft,
                legacy_email_id: bv_legacy_email_id,
                thread_id: bv_thread_id,
                smtp_id: bv_email_smtp_id,
                subject: bv_email_subject,
                timestamp: bv_email_timestamp,
                content_html: bv_email_content_html,
                date: bv_email_date,
                from: bv_from,
                to: bv_to,
                cc: bv_cc,
                bcc: bv_bcc,
                attachments: bv_attachments
              };
              if (api.cache.debug_xhr_fetch) {
                email["$email_node"] = bv_email;
                email["$thread_node"] = bv_thread_container;
              }
              res.push(email);
            }
          }
          return res;
        } catch (error) {
          console.warn("Gmail.js encountered an error trying to parse email-data on bv request!", error);
          return null;
        }
      };
      api.tools.parse_sent_message_html_payload = function(sent_email) {
        let sent_email_content_html = null;
        try {
          const sent_html_containers = sent_email["9"]["2"];
          for (let sent_html_container of sent_html_containers) {
            sent_email_content_html = (sent_email_content_html || "") + sent_html_container["2"];
          }
        } catch (e) {
        }
        return sent_email_content_html;
      };
      api.tools.parse_sent_message_attachments = function(json) {
        let res = [];
        if (Array.isArray(json)) {
          for (let item of json) {
            res.push({
              id: item["5"],
              name: item["2"],
              type: item["1"],
              url: item["6"],
              size: Number.parseInt(item["3"])
            });
          }
        }
        return res;
      };
      api.tools.parse_sent_message_payload = function(json) {
        try {
          let sent_email = json;
          const sent_email_id = sent_email["0"];
          const sent_email_subject = sent_email["7"];
          const sent_email_timestamp = Number.parseInt(sent_email["6"]);
          const sent_email_date = new Date(sent_email_timestamp);
          const sent_email_content_html = api.tools.parse_sent_message_html_payload(sent_email);
          const sent_email_ishtml = sent_email["8"]["6"];
          const sent_attachments = api.tools.parse_sent_message_attachments(sent_email["11"]);
          const sent_from = api.tools.parse_fd_bv_contact(sent_email["1"]);
          const sent_to = api.tools.parse_fd_bv_contacts(sent_email["2"]);
          const sent_cc = api.tools.parse_fd_bv_contacts(sent_email["3"]);
          const sent_bcc = api.tools.parse_fd_bv_contacts(sent_email["4"]);
          const email = {
            1: sent_email_id,
            id: sent_email_id,
            subject: sent_email_subject,
            timestamp: sent_email_timestamp,
            content_html: sent_email_content_html,
            ishtml: sent_email_ishtml,
            date: sent_email_date,
            from: sent_from,
            to: sent_to,
            cc: sent_cc,
            bcc: sent_bcc,
            attachments: sent_attachments,
            email_node: json
          };
          return email;
        } catch (error) {
          console.warn("Gmail.js encountered an error trying to parse sent message!", error);
          return null;
        }
      };
      api.tools.parse_sent_message_payload_new = function(json) {
        try {
          const parse_fd_bv_contact_new = (a) => {
            if (a && a[1]) {
              return { name: a[2] || "", address: a[1] };
            } else {
              return void 0;
            }
          };
          const parse_fd_bv_contacts_new = (a) => {
            if (Array.isArray(a)) {
              return a.map(parse_fd_bv_contact_new).filter((a2) => a2);
            } else {
              return [];
            }
          };
          const parse_sent_message_attachments_new = (json2) => {
            if (Array.isArray(json2)) {
              return json2.map((item) => ({
                id: item[4],
                name: item[1],
                type: item[0],
                url: item[5],
                size: Number.parseInt(item[2])
              }));
            } else {
              return [];
            }
          };
          const parse_sent_message_html_payload_new = (sent_email2) => {
            let sent_email_content_html2 = null;
            try {
              const sent_html_containers = sent_email2[8][1];
              for (let sent_html_container of sent_html_containers) {
                sent_email_content_html2 = (sent_email_content_html2 || "") + sent_html_container[1];
              }
            } catch (err) {
              api.tools.error("Failed to parse html", err);
            }
            return sent_email_content_html2;
          };
          let sent_email = json;
          const sent_email_id = sent_email[0];
          const sent_email_subject = sent_email[7];
          const sent_email_timestamp = sent_email[6];
          const sent_email_date = new Date(sent_email_timestamp);
          const sent_email_content_html = parse_sent_message_html_payload_new(sent_email);
          const sent_email_ishtml = sent_email[8][6];
          const sent_attachments = parse_sent_message_attachments_new(sent_email[11]);
          const sent_from = parse_fd_bv_contact_new(sent_email[1]);
          const sent_to = parse_fd_bv_contacts_new(sent_email[2]);
          const sent_cc = parse_fd_bv_contacts_new(sent_email[3]);
          const sent_bcc = parse_fd_bv_contacts_new(sent_email[4]);
          const email = {
            1: sent_email_id,
            id: sent_email_id,
            subject: sent_email_subject,
            timestamp: sent_email_timestamp,
            content_html: sent_email_content_html,
            ishtml: sent_email_ishtml,
            date: sent_email_date,
            from: sent_from,
            to: sent_to,
            cc: sent_cc,
            bcc: sent_bcc,
            attachments: sent_attachments,
            email_node: json
          };
          return email;
        } catch (error) {
          console.warn("Gmail.js encountered an error trying to parse sent message!", error);
          return null;
        }
      };
      api.tools.parse_request_payload = function(params, events, force) {
        const pathname = api.tools.get_pathname_from_url(params.url_raw);
        if (!force && !pathname) {
          return;
        }
        const isSynch = (pathname || "").endsWith("/i/s");
        const isFetch = (pathname || "").endsWith("/i/fd");
        if (!force && !isFetch && !isSynch) {
          return;
        }
        if (isFetch) {
          events.load_email_data = [null];
        }
        const threads = api.tools.extract_from_graph(params, api.check.data.is_thread);
        const emails = [
          ...api.tools.extract_from_graph(params.body_params, api.check.data.is_email),
          ...api.tools.extract_from_graph(params.body_params, api.check.data.is_email_new)
        ];
        for (let email of emails) {
          for (let key in email) {
            let prop = email[key];
            if (api.check.data.is_smartlabels_array(prop)) {
              let sent_email = api.check.data.is_email_new(email) ? api.tools.parse_sent_message_payload_new(email) : api.tools.parse_sent_message_payload(email);
              if (prop.indexOf("^pfg") !== -1) {
                events.send_message = [params.url, params.body, sent_email];
              } else if (prop.indexOf("^scheduled") > -1) {
                events.send_scheduled_message = [params.url, params.body, sent_email];
              }
            }
          }
        }
        try {
          if (Array.isArray(threads) && api.check.data.is_thread(threads[0])) {
            const actionType = api.tools.check_event_type(threads[0]);
            if (actionType) {
              const threadsData = threads.map((thread) => api.tools.get_thread_data(thread));
              const new_thread_ids = threads.map((thread) => api.tools.get_thread_id(thread));
              const new_email_ids = threadsData.map((threadData) => api.tools.get_message_ids(threadData)).reduce((a, b) => a.concat(b), []);
              events[actionType] = [null, params.url, params.body, new_email_ids, new_thread_ids];
            }
          }
        } catch (e) {
          console.error("Error: ", e);
        }
      };
      api.tools.parse_response = function(response) {
        if (api.check.data.is_json_string(response)) {
          try {
            let json = JSON.parse(response);
            return json;
          } catch (err) {
          }
        }
        if (response.startsWith("<!DOCTYPE html") || response.indexOf("display:inline-block") !== -1) {
          return [];
        }
        let parsedResponse = [];
        try {
          response = response.replace(/\n/g, " ");
          response = response.substring(response.indexOf("'") + 1, response.length);
          while (response.replace(/\s/g, "").length > 1) {
            let dataLength = response.substring(0, response.indexOf("[")).replace(/\s/g, "");
            if (!dataLength) {
              dataLength = response.length;
            }
            let endIndex = parseInt(dataLength, 10) - 2 + response.indexOf("[");
            let data2 = response.substring(response.indexOf("["), endIndex);
            let json = JSON.parse(data2);
            parsedResponse.push(json);
            response = response.substring(response.indexOf("["), response.length);
            response = response.substring(data2.length, response.length);
          }
        } catch (e) {
        }
        return parsedResponse;
      };
      api.tools.parse_attachment_url = function(url) {
        var parts = url.split(":");
        return {
          type: parts[0],
          url: parts[2] + ":" + parts[4] + ":" + parts[5]
        };
      };
      var extend = function(target, extension) {
        for (var key in extension) {
          target[key] = extension[key];
        }
      };
      var merge = function(target, mergee) {
        for (var i = 0; i < mergee.length; i++) {
          var value = mergee[i];
          target.push(value);
        }
        return target;
      };
      api.tools.parse_requests = function(params, xhr) {
        params.url_raw = params.url;
        params.url = api.tools.parse_url(params.url);
        if (typeof params.body === "object") {
          params.body_params = params.body;
          params.body_is_object = true;
        } else if (api.check.data.is_json_string(params.body)) {
          params.body_params = JSON.parse(params.body);
        } else if (params.body !== void 0) {
          params.body_params = api.tools.deparam(params.body);
        } else {
          params.body_params = {};
        }
        if (typeof api.tracker.events !== "object" && typeof api.tracker.actions !== "object") {
          api.tracker.events = [];
          api.tracker.actions = [];
        }
        api.tracker.events.unshift(params);
        var events = api.tools.parse_actions(params, xhr);
        if (params.method === "POST" && typeof params.url.act === "string") {
          api.tracker.actions.unshift(params);
        }
        if (api.tracker.events.length > 50) {
          api.tracker.events.pop();
        }
        if (api.tracker.actions.length > 10) {
          api.tracker.actions.pop();
        }
        return events;
      };
      api.tools.patch = function(patchee, patch) {
        patch(patchee);
      };
      api.tools.cache_email_data = function(email_data, data_source) {
        if (email_data === null) {
          return;
        }
        const c = api.cache;
        let isUpdateAuthorized = false;
        if (data_source === "fd_request_payload" || data_source === "fd_embedded_json") {
          isUpdateAuthorized = true;
        }
        for (let email of email_data) {
          if (c.emailIdCache[email.id] === void 0) {
            c.emailIdCache[email.id] = email;
            c.emailLegacyIdCache[email.legacy_email_id] = email;
          } else if (isUpdateAuthorized) {
            c.emailIdCache[email.id] = email;
            c.emailLegacyIdCache[email.legacy_email_id] = email;
          }
          let thread = c.threadCache[email.thread_id];
          if (!thread) {
            thread = {
              thread_id: email.thread_id,
              emails: []
            };
            c.threadCache[email.thread_id] = thread;
          }
          if (thread.emails.filter((i) => i.id === email.id).length === 0) {
            thread.emails.push(email);
          } else if (isUpdateAuthorized) {
            let index = thread.emails.findIndex((i) => i.id === email.id);
            thread.emails[index] = email;
          }
        }
      };
      api.tools.xhr_watcher = function() {
        if (api.tracker.xhr_init) {
          return;
        }
        api.instanceId = Symbol("gmail-js-" + (performance ? performance.now() : Date.now()));
        api.tracker.xhr_init = true;
        const win = api.helper.get_xhr_window();
        api.tools.patch(win.XMLHttpRequest.prototype.open, (orig) => {
          win.XMLHttpRequest.prototype.open = function(method, url, async2, user, password) {
            var out = orig.apply(this, arguments);
            this.xhrParams = {
              method: method.toString(),
              url: url.toString()
            };
            Object.defineProperty(this, api.instanceId, {
              value: Object.freeze({
                method: method.toString(),
                url: url.toString()
              })
            });
            return out;
          };
        });
        api.tools.patch(win.XMLHttpRequest.prototype.send, (orig) => {
          win.XMLHttpRequest.prototype.send = function(body) {
            var events = false;
            if (this.xhrParams) {
              this.xhrParams.body = body;
              if (typeof this.xhrParams.url !== "string") {
                if (this[api.instanceId] && this[api.instanceId].url) {
                  this.xhrParams.url = this[api.instanceId].url;
                  delete this.xhrParams.url_raw;
                  delete this.xhrParams.body_params;
                }
              }
              events = api.tools.parse_requests(this.xhrParams, this);
            }
            if (api.observe.trigger("before", events, this)) {
              if (api.check.is_new_data_layer()) {
                body = arguments[0] = this.xhrParams.body_is_object ? this.xhrParams.body_params : JSON.stringify(this.xhrParams.body_params);
              } else {
                body = arguments[0] = this.xhrParams.body_is_object ? this.xhrParams.body_params : $.param(this.xhrParams.body_params, true).replace(/\+/g, "%20");
              }
            }
            if (api.observe.bound(events, "after") || api.check.is_new_data_layer()) {
              var curr_onreadystatechange = this.onreadystatechange;
              var xhr = this;
              this.onreadystatechange = function(progress) {
                if (this.readyState === this.DONE) {
                  if (progress.target.responseType === "" || progress.target.responseType === "text") {
                    xhr.xhrResponse = api.tools.parse_response(progress.target.responseText);
                  } else {
                    xhr.xhrResponse = progress.target.response;
                  }
                  if (api.check.is_new_data_layer()) {
                    const pathName = api.tools.get_pathname_from_url(xhr.xhrParams.url_raw);
                    if (pathName.endsWith("/i/fd")) {
                      let parsed_emails = api.tools.parse_fd_request_payload(xhr.xhrResponse);
                      if (parsed_emails !== void 0 && parsed_emails !== null) {
                        api.tools.cache_email_data(parsed_emails, "fd_request_payload");
                        events.load_email_data = [parsed_emails];
                      }
                    }
                    if (pathName.endsWith("/i/bv")) {
                      let parsed_emails = api.tools.parse_bv_request_payload(xhr.xhrResponse);
                      if (parsed_emails !== void 0 && parsed_emails !== null) {
                        api.tools.cache_email_data(parsed_emails, "bv_request_payload");
                        events.load_email_data = [parsed_emails];
                      }
                    }
                  }
                  api.observe.trigger("after", events, xhr);
                }
                if (curr_onreadystatechange) {
                  curr_onreadystatechange.apply(this, arguments);
                }
              };
            }
            var out = orig.apply(this, arguments);
            api.observe.trigger("on", events, this);
            return out;
          };
        });
      };
      api.tools.embedded_data_watcher = function() {
        if (api.tracker.embedded_data_init) {
          return;
        }
        api.tracker.embedded_data_init = true;
        var original_GM_setData = window._GM_setData;
        window._GM_setData = function(data2) {
          if (data2 !== void 0 && data2.Cl6csf !== void 0 && data2.Cl6csf[0] !== void 0 && data2.Cl6csf[0][2] !== void 0) {
            let parsed_emails = api.tools.parse_fd_embedded_json(JSON.parse(data2.Cl6csf[0][2]));
            api.tools.cache_email_data(parsed_emails, "fd_embedded_json");
          }
          if (data2 !== void 0 && data2.a6jdv !== void 0 && data2.a6jdv[0] !== void 0 && data2.a6jdv[0][2] !== void 0) {
            let parsed_emails = api.tools.parse_bv_embedded_json(JSON.parse(data2.a6jdv[0][2]));
            api.tools.cache_email_data(parsed_emails, "bv_embedded_json");
          }
          if (data2 !== void 0 && data2.sBEv4c !== void 0) {
            for (let item of data2.sBEv4c) {
              if (item[0] === "mla") {
                api.tracker.mla = item;
              }
            }
          }
          original_GM_setData(data2);
        };
      };
      api.helper.get_xhr_window = function() {
        if (api.check.is_new_gui()) {
          return top;
        }
        var js_frame = null;
        if (top.document.getElementById("js_frame")) {
          js_frame = top.document.getElementById("js_frame");
        } else if (window_opener) {
          js_frame = window_opener.top.document.getElementById("js_frame");
        }
        if (!js_frame) {
          if (window_opener) {
            js_frame = window_opener.top;
          } else {
            js_frame = top;
          }
        }
        var win;
        if (js_frame.contentDocument) {
          win = js_frame.contentDocument.defaultView;
        } else {
          win = js_frame;
        }
        return win;
      };
      api.observe.http_requests = function() {
        return api.tracker.events;
      };
      api.observe.actions = function() {
        return api.tracker.actions;
      };
      api.observe.bind = function(type2, action, callback) {
        if (typeof api.tracker.watchdog !== "object") {
          api.tracker.watchdog = {
            before: {},
            on: {},
            after: {},
            dom: {}
          };
          api.tracker.bound = {};
        }
        if (typeof api.tracker.watchdog[type2] !== "object") {
          api.tools.error("api.observe.bind called with invalid type: " + type2);
        }
        if (type2 !== "dom") {
          api.tools.xhr_watcher();
        }
        if (typeof api.tracker.watchdog[type2][action] !== "object") {
          api.tracker.watchdog[type2][action] = [];
        }
        api.tracker.watchdog[type2][action].push(callback);
        api.tracker.bound[action] = typeof api.tracker.bound[action] === "undefined" ? 1 : api.tracker.bound[action] + 1;
        api.tracker.bound[type2] = typeof api.tracker.bound[type2] === "undefined" ? 1 : api.tracker.bound[type2] + 1;
      };
      api.observe.on = function(action, callback, response_callback) {
        if (api.observe.on_dom(action, callback)) return true;
        api.observe.bind("on", action, callback);
        if (response_callback) {
          api.observe.after(action, callback);
        }
      };
      api.observe.before = function(action, callback) {
        api.observe.bind("before", action, callback);
      };
      api.observe.after = function(action, callback) {
        api.observe.bind("after", action, callback);
      };
      api.observe.bound = function(action, type2) {
        if (typeof api.tracker.watchdog !== "object") return false;
        if (action) {
          if (typeof action === "object") {
            var match = false;
            for (let key of Object.keys(action)) {
              if (typeof api.tracker.watchdog[type2][key] === "object") match = true;
            }
            return match;
          }
          if (type2) return typeof api.tracker.watchdog[type2][action] === "object";
          return api.tracker.bound[action] > 0;
        } else {
          if (type2) return api.tracker.bound[type2] > 0;
          api.tools.error("api.observe.bound called with invalid args");
        }
      };
      api.observe.off = function(action, type2) {
        if (typeof api.tracker.watchdog !== "object") return true;
        var types = type2 ? [type2] : ["before", "on", "after", "dom"];
        for (let type3 of types) {
          if (typeof api.tracker.watchdog[type3] !== "object") continue;
          if (action) {
            if (typeof api.tracker.watchdog[type3][action] === "object") {
              api.tracker.bound[action] -= api.tracker.watchdog[type3][action].length;
              api.tracker.bound[type3] -= api.tracker.watchdog[type3][action].length;
              delete api.tracker.watchdog[type3][action];
            }
          } else {
            for (let act of Object.keys(api.tracker.watchdog[type3])) {
              if (typeof api.tracker.watchdog[type3][act] === "object") {
                api.tracker.bound[act] -= api.tracker.watchdog[type3][act].length;
                api.tracker.bound[type3] -= api.tracker.watchdog[type3][act].length;
                delete api.tracker.watchdog[type3][act];
              }
            }
          }
        }
      };
      api.observe.trigger = function(type2, events, xhr) {
        if (!events) return false;
        var fired = false;
        for (let [action, response] of Object.entries(events)) {
          response = [...response];
          if (type2 === "after") response.push(xhr.xhrResponse);
          response.push(xhr);
          if (api.observe.bound(action, type2)) {
            fired = true;
            for (let callback of api.tracker.watchdog[type2][action]) {
              callback.apply(void 0, response);
            }
          }
        }
        return fired;
      };
      api.observe.trigger_dom = function(observer, element, handler) {
        if (!handler) {
          handler = function(match, callback) {
            callback(match);
          };
        }
        if (!api.tracker.watchdog.dom[observer]) {
          return;
        }
        for (let callback of api.tracker.watchdog.dom[observer]) {
          handler(element, callback);
        }
      };
      api.observe.initialize_dom_observers = function() {
        api.tracker.dom_observer_init = true;
        api.tracker.supported_observers = ["view_thread", "view_email", "load_email_menu", "recipient_change", "compose"];
        api.tracker.dom_observers = {
          // when a thread is clicked on in a mailbox for viewing - note: this should fire at a similar time (directly after) as the open_email XHR observer
          // which is triggered by the XHR request rather than nodes being inserted into the DOM (and thus returns different information)
          "view_thread": {
            class: ["Bu", "nH"],
            // class depends if is_preview_pane - Bu for preview pane, nH for standard view
            selector: "div.iY",
            handler: function(match, callback) {
              match = new api.dom.thread(match);
              callback(match);
            }
          },
          // when an individual email is loaded within a thread (also fires when thread loads displaying the latest email)
          "view_email": {
            // class depends if is_preview_pane - Bu for preview pane, nH for standard view,
            // FIXME: the empty class ("") is for emails opened after thread is rendered (causes a storm of updates)
            class: ["Bu", "nH", ""],
            handler: function(match, callback) {
              setTimeout(() => {
                match = match.find("div.adn.ads");
                if (match.length) {
                  match = new api.dom.email(match);
                  callback(match);
                }
              }, 0);
            }
          },
          // when the dropdown menu next to the reply button is inserted into the DOM when viewing an email
          "load_email_menu": {
            class: "J-N",
            selector: "div[role=menu] div[role=menuitem]:first-child",
            // use the first menu item in the popoup as the indicator to trigger this observer
            handler: function(match, callback) {
              match = match.closest("div[role=menu]");
              callback(match);
            }
          },
          // a new email address is added to any of the to,cc,bcc fields when composing a new email or replying/forwarding
          "recipient_change": {
            class: ["vR", "afV"],
            handler: function(match, callback) {
              if (typeof api.tracker.recipient_matches !== "object") {
                api.tracker.recipient_matches = [];
              }
              api.tracker.recipient_matches.push(match);
              setTimeout(function() {
                if (!api.tracker.recipient_matches.length) return;
                let composeRoot = [];
                api.tracker.recipient_matches.forEach((match2) => {
                  if (composeRoot.length === 0) {
                    composeRoot = match2.closest("div.M9");
                  }
                });
                if (composeRoot.length === 0) {
                  api.tools.error("Can't find composeRoot for " + match);
                }
                var compose = new api.dom.compose(composeRoot);
                var recipients = compose.recipients();
                callback(compose, recipients, api.tracker.recipient_matches);
                api.tracker.recipient_matches = [];
              }, 100);
            }
          },
          // this will fire if a new compose, reply or forward is created. it won"t fire if a reply changes to a forward & vice versa
          // passes a type of compose, reply, or forward to the callback
          "compose": {
            class: "An",
            // M9 would be better but this isn"t set at the point of insertion
            handler: function(match, callback) {
              var originalMatch = match;
              match = match.closest("div.M9");
              if (!match.length) return;
              match = new api.dom.compose(match);
              if (!match.is_inline()) {
                var composeWindow = originalMatch.closest("div.AD");
                composeWindow.find(".Ha").mouseup(function() {
                  if (api.tracker.composeCancelledCallback) {
                    api.tracker.composeCancelledCallback(match);
                  }
                  return true;
                });
              }
              callback(match, match.type());
            }
          }
        };
        if (api.tracker.custom_supported_observers) {
          $.merge(api.tracker.supported_observers, api.tracker.custom_supported_observers);
          $.extend(true, api.tracker.dom_observers, api.tracker.custom_dom_observers);
        }
        api.tracker.dom_observer_map = {};
        for (let [act, config] of Object.entries(api.tracker.dom_observers)) {
          if (!Array.isArray(config.class)) config.class = [config.class];
          for (let className of config.class) {
            if (!api.tracker.dom_observer_map[className]) {
              api.tracker.dom_observer_map[className] = [];
            }
            api.tracker.dom_observer_map[className].push(act);
          }
        }
      };
      api.observe.register = function(action, args) {
        if (api.tracker.dom_observer_init) {
          api.tools.error("Error: Please register all custom DOM observers before binding handlers using gmail.observe.on etc");
        }
        if (!api.tracker.custom_supported_observers) {
          api.tracker.custom_supported_observers = [];
          api.tracker.custom_dom_observers = {};
        }
        var config = {};
        if (typeof args === "object" && !Array.isArray(args)) {
          for (let arg of ["class", "selector", "sub_selector", "handler"]) {
            if (args[arg]) {
              config[arg] = args[arg];
            }
          }
        } else {
          config["class"] = args;
        }
        api.tracker.custom_supported_observers.push(action);
        api.tracker.custom_dom_observers[action] = config;
      };
      var getTarget = function(e) {
        if (e.path) {
          return e.path[0];
        } else {
          return e.target;
        }
      };
      var preventGmailJacking = function() {
        if (!api.tracker.jackPreventionInstalled) {
          window.addEventListener("click", (e) => {
            const target = getTarget(e);
            if (target && target !== document.body) {
              const gmailJsButton = target.querySelector(":scope > .gmailjs");
              if (gmailJsButton) {
                gmailJsButton.click();
                e.preventDefault();
              }
            }
          });
          api.tracker.jackPreventionInstalled = true;
        }
      };
      api.observe.on_dom = function(action, callback) {
        if (!api.tracker.dom_observer_init) {
          api.observe.initialize_dom_observers();
        }
        if (api.tracker.supported_observers.includes(action)) {
          if (!api.tracker.observing_dom) {
            api.tracker.observing_dom = true;
            var mutationObserver = new MutationObserver(function(mutations) {
              for (var i = 0; i < mutations.length; i++) {
                var mutation = mutations[i];
                var removedNodes = mutation.removedNodes;
                for (var j = 0; j < removedNodes.length; j++) {
                  var removedNode = removedNodes[j];
                  if (removedNode.className === "agh" && removedNode.querySelector("div[data-hovercard-id]")) {
                    let observer = api.tracker.dom_observer_map["afV"];
                    let handler = api.tracker.dom_observers.recipient_change.handler;
                    api.observe.trigger_dom(observer, $(mutation.target), handler);
                  } else if (removedNode.className === "vR") {
                    let observer = api.tracker.dom_observer_map["vR"];
                    let handler = api.tracker.dom_observers.recipient_change.handler;
                    api.observe.trigger_dom(observer, $(mutation.target), handler);
                  }
                }
                var addedNodes = mutation.addedNodes;
                for (var k = 0; k < addedNodes.length; k++) {
                  var addedNode = addedNodes[k];
                  api.tools.insertion_observer(addedNode, api.tracker.dom_observers, api.tracker.dom_observer_map);
                }
              }
            });
            mutationObserver.observe(document.body, { subtree: true, childList: true });
          }
          api.observe.bind("dom", action, callback);
          return true;
        } else if (action === "compose_cancelled") {
          api.tracker.composeCancelledCallback = callback;
          return true;
        } else if (action === "load") {
          if (api.dom.inbox_content().length) {
            preventGmailJacking();
            return callback();
          }
          var load_count = 0;
          var delay = 200;
          var attempts = 50;
          var timer = setInterval(function() {
            var test = api.dom.inbox_content().length;
            if (test > 0) {
              clearInterval(timer);
              preventGmailJacking();
              return callback();
            } else if (++load_count > attempts) {
              clearInterval(timer);
              setTimeout(callback, 5e3);
            }
          }, delay);
          return true;
        }
        return false;
      };
      api.tools.insertion_observer = function(target, dom_observers, dom_observer_map, sub) {
        if (!dom_observer_map) return;
        var cn = target.className || "";
        var classes = cn.trim ? cn.trim().split(/\s+/) : [];
        if (!classes.length) classes.push("");
        for (let className of classes) {
          var observers = dom_observer_map[className];
          if (!observers) {
            continue;
          }
          for (var observer of observers) {
            if (observer && api.tracker.watchdog && api.tracker.watchdog.dom[observer]) {
              var element = $(target);
              var config = dom_observers[observer];
              if (config.selector && !element.is(config.selector)) {
                break;
              }
              if (config.sub_selector) {
                element = element.find(config.sub_selector);
              }
              if (element.length) {
                var handler = config.handler ? config.handler : function(match, callback) {
                  callback(match);
                };
                api.observe.trigger_dom(observer, element, handler);
              }
            }
          }
        }
      };
      api.tools.make_request = function(_link, method, disable_cache) {
        var link = decodeURIComponent(_link.replace(/%23/g, "#-#-#"));
        method = method || "GET";
        link = encodeURI(link).replace(/#-#-#/gi, "%23");
        var config = { type: method, url: link, async: false, dataType: "text" };
        if (disable_cache) {
          config.cache = false;
        }
        var request = $.ajax(config);
        return request.responseText;
      };
      api.tools.make_request_async = function(_link, method, callback, error_callback, disable_cache) {
        var link = decodeURIComponent(_link.replace(/%23/g, "#-#-#"));
        method = method || "GET";
        link = encodeURI(link).replace(/#-#-#/gi, "%23");
        var config = { type: method, url: link, async: true, dataType: "text" };
        if (disable_cache) {
          config.cache = false;
        }
        $.ajax(config).done(function(data2, textStatus, jqxhr) {
          callback(jqxhr.responseText);
        }).fail(function(jqxhr, textStatus, errorThrown) {
          console.error("Request Failed", errorThrown);
          if (typeof error_callback === "function") {
            error_callback(jqxhr, textStatus, errorThrown);
          }
        });
      };
      api.tools.make_request_download_promise = function(url, preferBinary) {
        const timeStamp = Date.now();
        url += "&cacheCounter=" + timeStamp;
        let responseType = "text";
        if (preferBinary) {
          responseType = "arraybuffer";
        }
        return new Promise((resolve2, reject) => {
          const request = new XMLHttpRequest();
          request.open("GET", url, true);
          request.responseType = responseType;
          request.onreadystatechange = () => {
            if (request.readyState !== XMLHttpRequest.DONE) {
              return;
            }
            if (request.status >= 200 && request.status <= 302) {
              const result = request.response;
              if (result) {
                if (preferBinary) {
                  const byteArray = new Uint8Array(result);
                  resolve2(byteArray);
                } else {
                  resolve2(result);
                }
              }
            }
          };
          request.onerror = (ev) => {
            reject(ev);
          };
          request.send();
        });
      };
      api.tools.parse_view_data = function(view_data) {
        var parsed = [];
        var data2 = [];
        for (var j = 0; j < view_data.length; j++) {
          if (view_data[j][0] === "tb") {
            for (var k = 0; k < view_data[j][2].length; k++) {
              data2.push(view_data[j][2][k]);
            }
          }
        }
        for (var i = 0; i < data2.length; i++) {
          var x = data2[i];
          parsed.push({
            id: x[0],
            title: x[9],
            excerpt: x[10],
            time: x[15],
            sender: x[28],
            attachment: x[13],
            labels: x[5]
          });
        }
        return parsed;
      };
      api.helper.get.is_delegated_inbox = function() {
        return $(".gb_Ba a.gb_f svg").length === 1;
      };
      api.helper.get.visible_emails_pre = function(customInboxQuery) {
        var page = api.get.current_page();
        var url = window.location.origin + window.location.pathname + "?ui=2&ik=" + api.tracker.ik + "&rid=" + api.tracker.rid + "&view=tl&num=120&rt=1";
        var start = $(".aqK:visible .Dj").find("span:first").text().replace(",", "").replace(".", "").split("–")[0];
        if (start) {
          start = parseInt(start - 1);
          url += "&start=" + start + "&sstart=" + start;
        } else {
          url += "&start=0";
        }
        var cat_label = "";
        if (page.indexOf("label/") === 0) {
          url += "&cat=" + page.split("/")[1] + "&search=cat";
        } else if (page.indexOf("category/") === 0) {
          if (page.indexOf("forums") !== -1) {
            cat_label = "group";
          } else if (page.indexOf("updates") !== -1) {
            cat_label = "notification";
          } else if (page.indexOf("promotion") !== -1) {
            cat_label = "promo";
          } else if (page.indexOf("social") !== -1) {
            cat_label = "social";
          }
          url += "&cat=^smartlabel_" + cat_label + "&search=category";
        } else if (page.indexOf("search/") === 0) {
          var at = $("input[name=at]").val();
          url += "&qs=true&q=" + page.split("/")[1] + "&at=" + at + "&search=query";
        } else if (page === "inbox") {
          if ($("div[aria-label='Social']").attr("aria-selected") === "true") {
            cat_label = "social";
            url += "&cat=^smartlabel_" + cat_label + "&search=category";
          } else if ($("div[aria-label='Promotions']").attr("aria-selected") === "true") {
            cat_label = "promo";
            url += "&cat=^smartlabel_" + cat_label + "&search=category";
          } else if ($("div[aria-label='Updates']").attr("aria-selected") === "true") {
            cat_label = "notification";
            url += "&cat=^smartlabel_" + cat_label + "&search=category";
          } else if ($("div[aria-label='Forums']").attr("aria-selected") === "true") {
            cat_label = "group";
            url += "&cat=^smartlabel_" + cat_label + "&search=category";
          } else {
            if (customInboxQuery) {
              url += "&search=" + customInboxQuery;
            } else if (api.check.is_google_apps_user()) {
              url += "&search=inbox";
            } else {
              url += "&search=mbox";
            }
          }
        } else {
          url += "&search=" + page;
        }
        return url;
      };
      api.helper.get.visible_emails_post = function(get_data) {
        var emails = [];
        if (!get_data) {
          return emails;
        }
        var data2 = get_data.substring(get_data.indexOf("["), get_data.length);
        var json = JSON.parse(data2);
        api.tracker.view_data = json;
        for (var i in api.tracker.view_data) {
          if (typeof api.tracker.view_data[i] === "function") {
            continue;
          }
          var cdata = api.tools.parse_view_data(api.tracker.view_data[i]);
          if (cdata.length > 0) {
            merge(emails, cdata);
          }
        }
        return emails;
      };
      api.get.visible_emails = function(customInboxQuery) {
        var url = api.helper.get.visible_emails_pre(customInboxQuery);
        var get_data = api.tools.make_request(url);
        var emails = api.helper.get.visible_emails_post(get_data);
        return emails;
      };
      api.get.visible_emails_async = function(callback, customInboxQuery) {
        var url = api.helper.get.visible_emails_pre(customInboxQuery);
        api.tools.make_request_async(url, "GET", function(get_data) {
          var emails = api.helper.get.visible_emails_post(get_data);
          callback(emails);
        });
      };
      api.get.selected_emails_data = function(customInboxQuery) {
        var selected_emails = [];
        if (!api.check.is_inside_email()) {
          if ($("[gh='tl'] div[role='checkbox'][aria-checked='true']").length) {
            var email = null;
            var emails = api.get.visible_emails(customInboxQuery);
            $("[gh='tl'] div[role='checkbox']").each(function(index) {
              if ($(this).attr("aria-checked") === "true") {
                email = api.get.email_data(emails[index].id);
                selected_emails.push(email);
              }
            });
          }
        } else {
          selected_emails.push(api.get.email_data());
        }
        return selected_emails;
      };
      api.get.current_page = function(hash) {
        hash = hash || window.location.hash;
        var hashPart = hash.split("#").pop().split("?").shift() || "inbox";
        if (hashPart.match(/\/[0-9a-zA-Z]{16,}$/gi)) {
          return "email";
        }
        var isTwopart = hashPart.indexOf("search/") === 0 || hashPart.indexOf("category/") === 0 || hashPart.indexOf("label/") === 0;
        var result = null;
        if (!isTwopart) {
          result = hashPart.split("/").shift();
          return result;
        } else {
          var parts = hashPart.split("/");
          result = parts[0] + "/" + parts[1];
          return result;
        }
      };
      api.tools.infobox = function(message, time2, html) {
        var top2 = $(".b8.UC");
        if (top2.length > 0) {
          top2.stop(false, true);
          var info = top2.find(".vh");
          if (!html) {
            info.text(message);
          } else {
            info.html(message);
          }
          if (typeof time2 !== "undefined") {
            var initialInfoboxStyle = top2.attr("style");
            top2.removeAttr("style").fadeTo(time2, 0, function() {
              $(this).attr("style", initialInfoboxStyle);
            });
          } else {
            top2.removeAttr("style");
          }
        }
      };
      api.tools.rerender = function(callback) {
        var url = window.location.href;
        var hash = window.location.hash;
        var tempUrl;
        if (hash.indexOf("/") !== -1) {
          tempUrl = url.replace(/#.*?\//, "#/");
        } else {
          tempUrl = url.replace(/#.*/, "#");
        }
        window.location.replace(tempUrl);
        setTimeout(function() {
          window.location.replace(url);
          window.history.back();
          if (callback) callback();
        }, 0);
      };
      api.tools.get_reply_to = function(ms13) {
        var reply_to = ms13 ? ms13[4] : [];
        if (reply_to.length !== 0) {
          return api.tools.extract_email_address(reply_to[0]);
        }
        return null;
      };
      api.tools.parse_attachment_data = function(x) {
        if (!x[7] || !x[7][0]) {
          return null;
        }
        var baseUrl = "";
        if (typeof window !== "undefined") {
          baseUrl = window.location.origin + window.location.pathname;
        }
        var ad = x[7][0];
        api.tracker.attachment_data = ad;
        var attachments = [];
        for (var i = 0; i < ad.length; i++) {
          var a = ad[i];
          attachments.push({
            attachment_id: a[0],
            name: a[1],
            type: a[2],
            size: a[3],
            url: baseUrl + a[9]
          });
        }
        return attachments;
      };
      api.tools.parse_email_data = function(email_data) {
        var data2 = {};
        for (var i in email_data) {
          var x = email_data[i];
          if (x[0] === "cs") {
            data2.thread_id = x[1];
            data2.first_email = x[8][0];
            data2.last_email = x[2];
            data2.total_emails = x[3];
            data2.total_threads = x[8];
            data2.people_involved = x[15];
            data2.subject = x[23];
          }
          if (x[0] === "ms") {
            if (data2.threads === void 0) {
              data2.threads = {};
            }
            data2.threads[x[1]] = {};
            data2.threads[x[1]].is_deleted = x[9] && x[9].indexOf("^k") > -1;
            data2.threads[x[1]].reply_to_id = x[2];
            data2.threads[x[1]].from = x[5];
            data2.threads[x[1]].from_email = x[6];
            data2.threads[x[1]].timestamp = x[7];
            data2.threads[x[1]].datetime = x[24];
            data2.threads[x[1]].attachments = x[21].split(",");
            data2.threads[x[1]].attachments_details = x[13] ? api.tools.parse_attachment_data(x[13]) : null;
            data2.threads[x[1]].subject = x[12];
            data2.threads[x[1]].content_html = x[13] ? x[13][6] : x[8];
            data2.threads[x[1]].to = x[13] ? x[13][1] : x[37] !== void 0 ? x[37][1] : [];
            data2.threads[x[1]].cc = x[13] ? x[13][2] : [];
            data2.threads[x[1]].bcc = x[13] ? x[13][3] : [];
            data2.threads[x[1]].reply_to = api.tools.get_reply_to(x[13]);
            data2.threads[x[1]].labels = x[9];
            try {
              data2.threads[x[1]].content_plain = x[13] ? $(x[13][6]).text() : x[8];
            } catch (e) {
              data2.threads[x[1]].content_plain = x[13] ? x[13][6] : x[8];
            }
          }
        }
        return data2;
      };
      api.helper.get.email_data_pre = function(thread_id) {
        oldGmailApiDeprecated("Migrate code to use gmail.new.get.email_data() to fix this problem.");
        if (api.check.is_inside_email() && thread_id === void 0) {
          thread_id = api.get.thread_id();
        }
        var url = null;
        if (thread_id !== void 0) {
          url = window.location.origin + window.location.pathname + "?ui=2&ik=" + api.tracker.ik + "&rid=" + api.tracker.rid + "&view=cv&th=" + thread_id + "&msgs=&mb=0&rt=1&search=inbox";
        }
        return url;
      };
      api.helper.get.email_data_post = function(get_data) {
        if (!get_data) {
          return {};
        }
        var data2 = get_data.substring(get_data.indexOf("["), get_data.length);
        var json = JSON.parse(data2);
        api.tracker.email_data = json[0];
        return api.tools.parse_email_data(api.tracker.email_data);
      };
      api.get.email_data = function(thread_id) {
        var url = api.helper.get.email_data_pre(thread_id);
        if (url !== null) {
          var get_data = api.tools.make_request(url);
          var email_data = api.helper.get.email_data_post(get_data);
          return email_data;
        }
        return {};
      };
      api.get.email_data_async = function(email_id, callback) {
        var url = api.helper.get.email_data_pre(email_id);
        if (url !== null) {
          api.tools.make_request_async(url, "GET", function(get_data) {
            var email_data = api.helper.get.email_data_post(get_data);
            callback(email_data);
          });
        } else {
          callback({});
        }
      };
      api.helper.get.legacy_email_id = function(identifier) {
        if (!identifier) {
          return null;
        } else if (api.check.data.is_legacy_email_id(identifier)) {
          return identifier;
        } else if (identifier.legacy_email_id) {
          return identifier.legacy_email_id;
        } else if (api.check.data.is_email_id(identifier)) {
          console.warn("GmailJS: Warning! Using new-style ID in method expecting legacy-style IDs! Attempting to resolve via cache, but there's no guarantee this will work!");
          const emailData = api.cache.emailIdCache[identifier];
          return emailData && emailData.legacy_email_id;
        }
        if (identifier.$el && identifier.$el[0]) {
          identifier = identifier.$el[0];
        }
        if (identifier.dataset && identifier.dataset.legacyMessageId) {
          return identifier.dataset.legacyMessageId;
        }
        return null;
      };
      api.helper.get.new_email_id = function(identifier) {
        if (!identifier) {
          return null;
        } else if (api.check.data.is_email_id(identifier)) {
          return identifier;
        } else if (identifier.id && !identifier.$el) {
          return identifier.id;
        } else if (api.check.data.is_legacy_email_id(identifier)) {
          console.warn("GmailJS: Warning! Using legacy-style ID in method expecting new-style IDs! Attempting to resolve via cache, but there's no guarantee this will work!");
          const emailData = api.cache.emailLegacyIdCache[identifier];
          return emailData && emailData.id;
        }
        if (identifier.$el && identifier.$el[0]) {
          identifier = identifier.$el[0];
        }
        if (identifier.dataset && identifier.dataset.messageId) {
          let id = identifier.dataset.messageId;
          if (id.indexOf("#") === 0) {
            id = id.substring(1);
          }
          return id;
        }
        return null;
      };
      api.helper.get.thread_id = function(identifier) {
        if (!identifier) {
          return null;
        } else if (api.check.data.is_thread_id(identifier)) {
          return identifier;
        } else if (identifier.thread_id) {
          return identifier.thread_id;
        } else if (api.check.data.is_email_id(identifier)) {
          console.warn("GmailJS: Warning! Using email-ID in method expecting thread-ID! Attempting to resolve via cache, but there's no guarantee this will work!");
          const emailData = api.cache.emailIdCache[identifier];
          return emailData && emailData.thread_id;
        } else if (api.check.data.is_legacy_email_id(identifier)) {
          console.warn("GmailJS: Warning! Using legacy-style ID in method expecting thread-ID! Attempting to resolve via cache, but there's no guarantee this will work!");
          const emailData = api.cache.emailLegacyIdCache[identifier];
          return emailData && emailData.thread_id;
        }
        if (identifier.$el && identifier.$el[0]) {
          identifier = identifier.$el[0];
        }
        if (identifier.dataset && identifier.dataset.threadPermId) {
          let id = identifier.dataset.threadPermId;
          if (id.indexOf("#") === 0) {
            id = id.substring(1);
          }
          return id;
        }
        if (identifier.dataset && identifier.dataset.messageId) {
          let id = identifier.dataset.messageId;
          if (id.indexOf("#") === 0) {
            id = id.substring(1);
          }
          console.warn("GmailJS: Warning! Using DomEmail instance to lookup thread-ID. Attempting to resolve via cache, but there's no guarantee this will work!");
          const emailData = api.cache.emailIdCache[id];
          return emailData && emailData.thread_id;
        }
        return null;
      };
      api.helper.clean_thread_id = function(thread_id) {
        if (thread_id.startsWith("#")) {
          thread_id = thread_id.substring(1);
        }
        return thread_id;
      };
      api.helper.get.email_source_pre = function(identifier) {
        if (!identifier && api.check.is_inside_email()) {
          identifier = api.get.email_id();
        }
        if (api.check.data.is_legacy_email_id(identifier)) {
          return window.location.origin + window.location.pathname + "?view=att&th=" + identifier + "&attid=0&disp=comp&safe=1&zw";
        }
        const email_id = api.helper.get.new_email_id(identifier);
        if (email_id) {
          return window.location.origin + window.location.pathname + "?view=att&permmsgid=" + email_id + "&attid=0&disp=comp&safe=1&zw";
        } else {
          return null;
        }
      };
      api.get.email_source = function(identifier) {
        console.warn("Gmail.js: This function has been deprecated and will be removed in an upcoming release! Please migrate to email_source_async or email_source_promise!");
        var url = api.helper.get.email_source_pre(identifier);
        if (url !== null) {
          return api.tools.make_request(url, "GET", true);
        }
        return "";
      };
      api.get.email_source_async = function(identifier, callback, error_callback, preferBinary) {
        api.get.email_source_promise(identifier, preferBinary).then(callback).catch(error_callback);
      };
      api.get.email_source_promise = function(identifier, preferBinary) {
        const url = api.helper.get.email_source_pre(identifier);
        if (url !== null) {
          return api.tools.make_request_download_promise(url, preferBinary);
        } else {
          return new Promise((resolve2, reject) => {
            reject("Unable to resolve URL for email source!");
          });
        }
      };
      api.get.displayed_email_data = function() {
        var email_data = api.get.email_data();
        if (api.check.is_conversation_view()) {
          return get_displayed_email_data_for_thread(email_data);
        } else {
          return get_displayed_email_data_for_single_email(email_data);
        }
      };
      api.get.displayed_email_data_async = function(callback) {
        api.get.email_data_async(void 0, function(email_data) {
          if (api.check.is_conversation_view()) {
            callback(get_displayed_email_data_for_thread(email_data));
          } else {
            callback(get_displayed_email_data_for_single_email(email_data));
          }
        });
      };
      var get_displayed_email_data_for_thread = function(email_data) {
        var displayed_email_data = email_data;
        var threads = displayed_email_data.threads;
        var total_threads = displayed_email_data.total_threads;
        var hash = window.location.hash.split("#")[1] || "";
        var is_in_trash = hash.indexOf("trash") === 0;
        for (var id in threads) {
          var email = threads[id];
          var keep_email = is_in_trash ? email.is_deleted : !email.is_deleted;
          if (!keep_email) {
            delete threads[id];
            total_threads.splice(total_threads.indexOf(id), 1);
            displayed_email_data.total_emails--;
          }
        }
        return displayed_email_data;
      };
      var get_displayed_email_data_for_single_email = function(email_data) {
        var displayed_email_data = {};
        for (var id in email_data.threads) {
          var displayed_email_element = document.querySelector("div[data-legacy-message-id='" + id + "']");
          if (displayed_email_element) {
            var email = email_data.threads[id];
            displayed_email_data.first_email = id;
            displayed_email_data.last_email = id;
            displayed_email_data.subject = email_data.subject;
            displayed_email_data.threads = {};
            displayed_email_data.threads[id] = email;
            displayed_email_data.total_emails = 1;
            displayed_email_data.total_threads = [id];
            displayed_email_data.people_involved = [];
            displayed_email_data.people_involved.push(
              [email.from, email.from_email]
            );
            email.to.forEach(function(recipient) {
              var address = api.tools.extract_email_address(recipient);
              var name = api.tools.extract_name(recipient.replace(address, "")) || "";
              displayed_email_data.people_involved.push(
                [name, address]
              );
            });
            break;
          }
        }
        return displayed_email_data;
      };
      api.check.is_conversation_view = function() {
        if (api.check.is_new_data_layer()) {
          var conversation_flag = void 0;
          conversation_flag = api.tracker.globals[24].indexOf(7164);
          return conversation_flag !== -1;
        } else {
          var flag_name = "bx_vmb";
          var flag_value = void 0;
          var array_with_flag = api.tracker.globals[17][4][1];
          for (var i = 0; i < array_with_flag.length; i++) {
            var current = array_with_flag[i];
            if (current[0] === flag_name) {
              flag_value = current[1];
              break;
            }
          }
          return flag_value === "0" || flag_value === void 0;
        }
      };
      api.tools.extract_email_address = function(str) {
        var regex2 = /[\+a-z0-9._-]+@[a-z0-9._-]+\.[a-z0-9._-]+/gi;
        var matches = str ? str.match(regex2) : void 0;
        return matches ? matches[0] : void 0;
      };
      api.tools.extract_name = function(str) {
        var regex2 = /[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF"._\s-]+/gi;
        var matches = str ? str.match(regex2) : void 0;
        return matches && matches[0] ? matches[0].trim() : void 0;
      };
      api.tools.i18n = function(label) {
        var locale = api.get.localization();
        var dictionary;
        switch (locale) {
          case "fr":
            dictionary = {
              "inbox": "Boîte de réception",
              "drafts": "Brouillons",
              "spam": "Spam",
              "forums": "Forums",
              "updates": "Mises à jour",
              "promotions": "Promotions",
              "social_updates": "Réseaux sociaux"
            };
            break;
          case "no":
            dictionary = {
              "inbox": "Innboks",
              "drafts": "Utkast",
              "spam": "Søppelpost",
              "forums": "Forumer",
              "updates": "Oppdateringer",
              "promotions": "Reklame",
              "social_updates": "Sosialt"
            };
            break;
          case "nl":
            dictionary = {
              "inbox": "Postvak IN",
              "drafts": "Concepten",
              "spam": "Spam",
              "forums": "Forums",
              "updates": "Updates",
              "promotions": "Reclame",
              "social_updates": "Sociaal"
            };
            break;
          case "it":
            dictionary = {
              "inbox": "Posta in arrivo",
              "drafts": "Bozza",
              "spam": "Spam",
              "forums": "Forum",
              "updates": "Aggiornamenti",
              "promotions": "Promozioni",
              "social_updates": "Social"
            };
            break;
          case "en":
          default:
            dictionary = {
              "inbox": "Inbox",
              "drafts": "Drafts",
              "spam": "Spam",
              "forums": "Forums",
              "updates": "Updates",
              "promotions": "Promotions",
              "social_updates": "Social Updates"
            };
            break;
        }
        return dictionary[label];
      };
      var create_generic_toolbar_button = function(content_html, onClickFunction, basicStyle, defaultStyle, styleClass, selector) {
        var container = $(document.createElement("div"));
        container.attr("class", "G-Ni J-J5-Ji");
        var button = $(document.createElement("div"));
        var buttonClasses = "T-I J-J5-Ji gmailjs ";
        if (styleClass !== void 0 && styleClass !== null && styleClass !== "") {
          buttonClasses += basicStyle + styleClass;
        } else {
          buttonClasses += basicStyle + defaultStyle;
        }
        button.attr("class", buttonClasses);
        button.html(content_html);
        button.click(onClickFunction);
        var content = $(document.createElement("div"));
        content.attr("class", "asa");
        container.html(button);
        selector.append(container);
        return container;
      };
      api.tools.add_toolbar_button = function(content_html, onClickFunction, styleClass) {
        var basicLeftStyle = "lS ";
        var defaultLeftStyle = "T-I-ax7 ar7";
        return create_generic_toolbar_button(content_html, onClickFunction, basicLeftStyle, defaultLeftStyle, styleClass, api.dom.toolbar());
      };
      api.tools.add_right_toolbar_button = function(content_html, onClickFunction, styleClass) {
        var basicRightStyle = "ash ";
        var defaultRightStyle = "T-I-ax7 L3";
        return create_generic_toolbar_button(content_html, onClickFunction, basicRightStyle, defaultRightStyle, styleClass, api.dom.right_toolbar());
      };
      api.tools.add_compose_button = function(composeWindow, content_html, onClickFunction, styleClass) {
        var div = $(document.createElement("div"));
        div.attr("class", "gU Up");
        div.attr("style", "cursor: pointer !important; transform: translateY(1px);");
        var button = $(document.createElement("div"));
        var buttonClasses = "T-I J-J5-Ji aoO T-I-atl L3 gmailjs gmailjscomposebutton ";
        if (styleClass !== void 0) {
          buttonClasses += styleClass;
        }
        button.attr("class", buttonClasses);
        button.attr("style", "margin-left: 8px; max-width: 500px;");
        button.html(content_html);
        button.click(onClickFunction);
        div.append(button);
        var sendButton = composeWindow.find(".gU.Up").last();
        div.insertAfter(sendButton);
        return button;
      };
      api.tools.add_more_send_option = function(composeWindow, buttonText, onClickFunction, styleClass, imgClass) {
        var div = $(document.createElement("div"));
        div.attr("class", "J-N yr");
        div.attr("style", "user-select: none;");
        div.attr("role", "menuitem");
        var button = $(document.createElement("div"));
        var buttonClasses = "J-N-Jz ";
        if (styleClass !== void 0) {
          buttonClasses += styleClass;
        }
        button.attr("class", buttonClasses);
        button.attr("style", "user-select: none;");
        var img = $(document.createElement("img"));
        var imgClassFull = "J-N-JX";
        if (imgClass !== void 0) {
          imgClassFull = imgClass + " " + imgClassFull;
        }
        img.attr("class", imgClassFull);
        img.attr("style", "user-select: none;");
        img.attr("role", "menuitem");
        img.attr("src", "images/cleardot.gif");
        button.append(img);
        button.append(buttonText);
        button.click(onClickFunction);
        div.append(button);
        var scheduledSend = composeWindow.find(".J-N.yr").last();
        div.insertAfter(scheduledSend);
        return button;
      };
      api.tools.add_attachment_button = function(attachment, contentHtml, customCssClass, tooltip, onClickFunction) {
        var button = $(document.createElement("div"));
        button.attr("class", "T-I J-J5-Ji aQv T-I-ax7 L3");
        button.attr("style", "user-select: none;");
        button.attr("aria-label", tooltip);
        button.attr("data-tooltip", tooltip);
        var hoverClass = "T-I-JW";
        button.mouseover(function() {
          this.classList.add(hoverClass);
        });
        button.mouseout(function() {
          this.classList.remove(hoverClass);
        });
        var div = $(document.createElement("div"));
        var divClass = "wtScjd J-J5-Ji aYr";
        if (customCssClass) {
          divClass += " " + customCssClass;
        }
        div.attr("class", divClass);
        if (contentHtml) {
          div.html(contentHtml);
        }
        button.append(div);
        button.click(onClickFunction);
        attachment.$el.find("div.aQw").append(button);
        return button;
      };
      api.tools.remove_modal_window = function() {
        $("#gmailJsModalBackground").remove();
        $("#gmailJsModalWindow").remove();
      };
      api.tools.add_modal_window = function(title2, content_html, onClickOk, onClickCancel, onClickClose, okText, cancelText) {
        onClickClose = onClickClose || api.tools.remove_modal_window;
        onClickCancel = onClickCancel || api.tools.remove_modal_window;
        okText = okText || "OK";
        cancelText = cancelText || "Cancel";
        var background = $(document.createElement("div"));
        background.attr("id", "gmailJsModalBackground");
        background.attr("class", "Kj-JD-Jh");
        background.attr("aria-hidden", "true");
        background.attr("style", "opacity:0.75;width:100%;height:100%;");
        var container = $(document.createElement("div"));
        container.attr("id", "gmailJsModalWindow");
        container.attr("class", "Kj-JD");
        container.attr("tabindex", "0");
        container.attr("role", "alertdialog");
        container.attr("aria-labelledby", "gmailJsModalWindowTitle");
        container.attr("style", "left:50%;top:50%;opacity:1;");
        var header = $(document.createElement("div"));
        header.attr("class", "Kj-JD-K7 Kj-JD-K7-GIHV4");
        var heading = $(document.createElement("span"));
        heading.attr("id", "gmailJsModalWindowTitle");
        heading.attr("class", "Kj-JD-K7-K0");
        heading.attr("role", "heading");
        heading.html(title2);
        var closeButton = $(document.createElement("span"));
        closeButton.attr("id", "gmailJsModalWindowClose");
        closeButton.attr("class", "Kj-JD-K7-Jq");
        closeButton.attr("role", "button");
        closeButton.attr("tabindex", "0");
        closeButton.attr("aria-label", "Close");
        closeButton.click(onClickClose);
        header.append(heading);
        header.append(closeButton);
        var contents = $(document.createElement("div"));
        contents.attr("id", "gmailJsModalWindowContent");
        contents.attr("class", "Kj-JD-Jz");
        contents.html(content_html);
        var controls = $(document.createElement("div"));
        controls.attr("class", "Kj-JD-Jl");
        var okButton = $(document.createElement("button"));
        okButton.attr("id", "gmailJsModalWindowOk");
        okButton.attr("class", "J-at1-auR J-at1-atl");
        okButton.attr("name", "ok");
        okButton.text(okText);
        okButton.click(onClickOk);
        var cancelButton = $(document.createElement("button"));
        cancelButton.attr("id", "gmailJsModalWindowCancel");
        cancelButton.attr("name", "cancel");
        cancelButton.text(cancelText);
        cancelButton.click(onClickCancel);
        controls.append(okButton);
        controls.append(cancelButton);
        container.append(header);
        container.append(contents);
        container.append(controls);
        $(document.body).append(background);
        $(document.body).append(container);
        var center = function() {
          container.css({
            top: ($(window).height() - container.outerHeight()) / 2,
            left: ($(window).width() - container.outerWidth()) / 2
          });
        };
        center();
        container.on("DOMSubtreeModified", center);
        $(window).resize(center);
      };
      api.tools.toggle_minimize = function() {
        var minimizeButton = $("[alt='Minimize']")[0];
        if (minimizeButton) {
          minimizeButton.click();
          return true;
        }
        return false;
      };
      api.chat.is_hangouts = function() {
        if (api.tracker.hangouts !== void 0) {
          return api.tracker.hangouts;
        }
        var dwClasses = $(".dw");
        if (dwClasses.length > 1) {
          throw "Figuring out is hangouts - more than one dw classes found";
        }
        if (dwClasses.length === 0) {
          throw "Figuring out is hangouts - no dw classes found";
        }
        var dw = dwClasses[0];
        var chatWindows = $(".nH.aJl.nn", dw);
        if (chatWindows.length > 0) {
          api.tracker.hangouts = true;
          return true;
        }
        chatWindows = $(".nH.nn", dw);
        if (chatWindows.length > 2) {
          api.tracker.hangouts = false;
          return false;
        }
        return void 0;
      };
      api.dom.visible_messages = function() {
        const ret = [];
        $('tbody>tr.zA[role="row"]:visible', api.dom.inbox_content()).each((index, msgEle) => {
          const nameAndEmail = $("*[email][name]", msgEle);
          const linkAndSubject = $("*[role=link]", msgEle);
          const idNode = msgEle.querySelector("span[data-thread-id]");
          ret.push({
            from: {
              name: nameAndEmail.attr("name"),
              email: nameAndEmail.attr("email")
            },
            summary: linkAndSubject[0].innerText,
            thread_id: api.helper.clean_thread_id(idNode && idNode.dataset && idNode.dataset.threadId || ""),
            legacy_email_id: idNode && idNode.dataset && idNode.dataset.legacyMessageId || "",
            $el: $(msgEle)
          });
        });
        return ret;
      };
      api.dom.composes = function() {
        var objs = [];
        $("div.M9").each(function(idx, el) {
          objs.push(new api.dom.compose(el));
        });
        return objs;
      };
      api.dom.helper = {};
      api.dom.helper.trigger_address = function($el) {
        let el = $el[0];
        let event = new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          key: "Tab",
          shiftKey: true,
          keyCode: 9
        });
        el.focus();
        el.dispatchEvent(event);
      };
      api.dom.compose = function(element) {
        if (this.constructor !== api.dom.compose) {
          return new api.dom.compose(element);
        }
        element = $(element);
        if (!element || !element.hasClass("M9") && !element.hasClass("AD")) api.tools.error("api.dom.compose called with invalid element");
        this.$el = element;
        return this;
      };
      extend(api.dom.compose.prototype, {
        /**
           Retrieve the compose id
        */
        id: function() {
          return this.dom("id").val();
        },
        /**
           Retrieve the draft email id
        */
        email_id: function() {
          let email_id = this.dom("draft").val();
          if (email_id && email_id.startsWith("#")) {
            return email_id.substring(1);
          } else {
            return email_id;
          }
        },
        /**
           Retrieve the draft thread id
        */
        thread_id: function() {
          let thread_id = this.dom("thread").val() || "";
          return api.helper.clean_thread_id(thread_id);
        },
        /**
           Is this compose instance inline (as with reply & forwards) or a popup (as with a new compose)
        */
        is_inline: function() {
          return this.$el.closest(".AO").length > 0;
        },
        /**
            Compose type - reply / forward / compose (new)
         */
        type: function() {
          return this.is_inline() ? this.find("input[name=subject]").val().indexOf("Fw") === 0 ? "forward" : "reply" : "compose";
        },
        /**
           Retrieves to, cc, bcc and returns them in a hash of arrays
           Parameters:
           options.type  string  to, cc, or bcc to check a specific one
           options.flat  boolean if true will just return an array of all recipients instead of splitting out into to, cc, and bcc
        */
        recipients: function(options) {
          if (typeof options !== "object") options = {};
          const peopleKit = api.check.is_peoplekit_compose(this.$el);
          const type_selector = options.type ? "[name=" + options.type + "]" : "";
          const found = peopleKit ? this.$el.find("tr.bzf " + (type_selector || "div[name]") + " div[data-hovercard-id]").map((_2, el) => ({
            type: options.type || el.closest("div[name]").getAttribute("name"),
            email: el.getAttribute("data-hovercard-id")
          })) : this.$el.find(".GS input[type=hidden]" + type_selector).map((_2, el) => ({
            type: el.name,
            email: el.value
          }));
          if (options.flat) {
            return found.toArray().map((r) => r.email);
          } else {
            let result = { to: [], cc: [], bcc: [] };
            if (options.type) {
              result[options.type] = found.toArray().filter((r) => r.type === options.type).map((r) => r.email);
            } else {
              ["to", "cc", "bcc"].forEach((type2) => {
                result[type2] = found.toArray().filter((r) => r.type === type2).map((r) => r.email);
              });
            }
            return result;
          }
        },
        /**
           Retrieve the typing area for "to" recipients, not recipients.
           Either textarea or input, which can be empty if last recipient are typed and selected (by pressing ENTER)
        */
        to: function(to) {
          const $el = this.dom("to").val(to);
          api.dom.helper.trigger_address($el);
          return $el;
        },
        /**
           Retrieve the typing area for "cc" recipients, not recipients.
           Either textarea or input, which can be empty if last recipient are typed and selected (by pressing ENTER)
        */
        cc: function(cc) {
          if (cc) {
            const showCc = this.dom("show_cc");
            showCc.click();
          }
          const $el = this.dom("cc").val(cc);
          api.dom.helper.trigger_address($el);
          return $el;
        },
        /**
           Retrieve the typing area for "bcc" recipients, not recipients.
           Either textarea or input, which can be empty if last recipient are typed and selected (by pressing ENTER)
        */
        bcc: function(bcc) {
          if (bcc) {
            const showBcc = this.dom("show_bcc");
            showBcc.click();
          }
          const $el = this.dom("bcc").val(bcc);
          api.dom.helper.trigger_address($el);
          return $el;
        },
        /**
           Get/Set the current subject
           Parameters:
           subject   string  set as new subject
        */
        subject: function(subject) {
          if (subject) this.dom("all_subjects").val(subject);
          subject = this.dom("subjectbox").val();
          return subject ? subject : this.dom("subject").val();
        },
        /**
           Get the from email
           if user only has one email account they can send from, returns that email address
        */
        from: function() {
          var el = this.dom("from");
          if (el.length) {
            var fromNameAndEmail = el.val();
            if (fromNameAndEmail) {
              return api.tools.extract_email_address(fromNameAndEmail);
            }
          }
          return api.get.user_email();
        },
        /**
           Get/Set the email body
        */
        body: function(body) {
          var el = this.dom("body");
          if (body) el.html(body);
          return el.html();
        },
        /**
            Get the email attachments
        */
        attachments: function() {
          var out = [];
          this.dom("attachments").each(function() {
            var el = $(this);
            var result = {};
            result.$el = el;
            result.name = el.find("div.vI").html();
            result.size = el.find("div.vJ").html();
            result.url = el.find("a.dO").attr("href");
            result.type = "https";
            out.push(result);
          });
          {
            return out;
          }
        },
        /**
          Triggers the same action as clicking the "send" button would do.
          */
        send: function() {
          return this.dom("send_button").click();
        },
        /**
           Map find through to jquery element
        */
        find: function(selector) {
          return this.$el.find(selector);
        },
        /**
           Close compose window
        */
        close: function() {
          const e = document.createEvent("Events");
          e.initEvent("keydown", true, true);
          e.which = 27;
          e.keyCode = 27;
          var $body = this.dom("body");
          $body.focus();
          $body[0].dispatchEvent(e);
        },
        /**
           Retrieve preconfigured dom elements for this compose window
        */
        dom: function(lookup) {
          if (!lookup) return this.$el;
          var config = {
            to: "textarea[name=to]",
            cc: "textarea[name=cc]",
            bcc: "textarea[name=bcc]",
            id: "input[name=composeid]",
            draft: "input[name=draft]",
            thread: "input[name=rt]",
            subject: "input[name=subject]",
            subjectbox: "input[name=subjectbox]",
            all_subjects: "input[name=subjectbox], input[name=subject]",
            body: "div[contenteditable=true]:not([id=subject])",
            quoted_reply: "input[name=uet]",
            reply: "M9",
            forward: "M9",
            from: "input[name=from]",
            attachments: "div.dL",
            send_button: "div.T-I.T-I-atl:not(.gmailjscomposebutton)",
            show_cc: "span.aB.gQ.pE",
            show_bcc: "span.aB.gQ.pB"
          };
          if (api.check.is_peoplekit_compose(this.$el)) {
            config = Object.assign(config, {
              to: "div[name=to] input",
              cc: "div[name=cc] input",
              bcc: "div[name=bcc] input"
            });
          }
          if (!config[lookup]) api.tools.error('Dom lookup failed. Unable to find config for "' + lookup + '"', config, lookup, config[lookup]);
          return this.$el.find(config[lookup]);
        }
      });
      api.dom.email = function(element) {
        if (this.constructor !== api.dom.email) {
          return new api.dom.email(element);
        }
        if (typeof element === "string" && api.check.data.is_legacy_email_id(element)) {
          this.id = element;
          this.$el = $("div.adn[data-legacy-message-id='" + this.id + "']");
        } else if (typeof element === "string" && api.check.data.is_email_id(element)) {
          const elem = document.querySelector("div.adn[data-message-id='" + element.replace("msg-f:", "\\#msg-f\\:") + "']");
          this.id = elem.dataset.legacyMessageId;
          this.$el = $(elem);
        } else if (element && (element.classList && element.classList.contains("adn") || element.hasClass && element.hasClass("adn"))) {
          this.$el = $(element);
          this.id = this.$el.data("legacyMessageId");
        } else {
          api.tools.error("api.dom.email called with invalid element/id");
        }
        return this;
      };
      extend(api.dom.email.prototype, {
        /**
           Get/Set the full email body as it sits in the DOM
           If you want the actual DOM element use .dom("body");
           Note: This gets & sets the body html after it has been parsed & marked up by GMAIL. To retrieve it as it exists in the email message source, use a call to .data();
        */
        body: function(body) {
          var el = this.dom("body");
          if (body) {
            el.html(body);
          }
          return el.html();
        },
        /**
           Get/Set the sender
           Optionally receives email and name properties. If received updates the values in the DOM
           Returns an object containing email & name of the sender and dom element
        */
        from: function(email, name) {
          var el = this.dom("from");
          if (email) {
            el.attr("email", email);
          }
          if (name) {
            el.attr("name", name);
            el.html(name);
          }
          return {
            email: el.attr("email"),
            name: el.attr("name"),
            el
          };
        },
        /**
           Get/Set who the email is showing as To
           Optionally receives an object containing email and/or name properties. If received updates the values in the DOM.
           Optionally receives an array of these objects if multiple recipients
           Returns an array of objects containing email & name of who is showing in the DOM as the email is to
        */
        to: function(to_array) {
          if (to_array) {
            if (!Array.isArray(to_array)) {
              to_array = [to_array];
            }
            var html = [];
            for (let obj in to_array) {
              html.push($("<span />").attr({
                dir: "ltr",
                email: obj.email,
                name: obj.name
              }).addClass("g2").html(obj.name).wrap("<p/>").parent().html());
            }
            this.dom("to_wrapper").html("to " + html.join(", "));
          }
          var out = [];
          this.dom("to").each(function() {
            var el = $(this);
            out.push({
              email: el.attr("email"),
              name: el.attr("name"),
              el
            });
          });
          return out;
        },
        /**
           Retries the DOM elements which represents the emails attachments.
           Returns undefined if UI-elements are not yet ready for parsing.
        */
        attachments: function() {
          var out = [];
          this.dom("attachments").each(function() {
            var el = $(this);
            var result = {};
            result.$el = el;
            result.name = el.find(".aV3").html();
            result.size = el.find(".SaH2Ve").html();
            var url = el.attr("download_url");
            if (url) {
              var url_type = api.tools.parse_attachment_url(url);
              result.url = url_type.url;
              result.type = url_type.type;
            }
            out.push(result);
          });
          {
            return out;
          }
        },
        /**
           Retrieve relevant email from the Gmail servers for this email
           Makes use of the gmail.get.email_data() method
           Returns an object
        */
        data: function() {
          if (typeof api.dom.email_cache !== "object") {
            api.dom.email_cache = {};
          }
          if (!api.dom.email_cache[this.id]) {
            var data2 = api.get.email_data(this.id);
            for (let [email_id, email_data] of Object.entries(data2.threads)) {
              api.dom.email_cache[email_id] = email_data;
            }
          }
          return api.dom.email_cache[this.id];
        },
        /**
           Retrieve email source for this email from the Gmail servers
           Makes use of the gmail.get.email_source() method
           Returns string of email raw source
        */
        source: function() {
          return api.get.email_source(this.id);
        },
        /**
           Retrieve preconfigured dom elements for this email
        */
        dom: function(lookup) {
          if (!lookup) return this.$el;
          var config = {
            body: "div.a3s",
            from: "span[email].gD",
            to: "span[email].g2",
            to_wrapper: "span.hb",
            timestamp: "span.g3",
            star: "div.zd",
            attachments: "div.hq.gt div.aQH span.aZo",
            // buttons
            reply_button: "div[role=button].aaq, div[role=button].bsQ",
            menu_button: "div[role=button].aap",
            details_button: "div[role=button].ajz"
          };
          if (!config[lookup]) api.tools.error('Dom lookup failed. Unable to find config for "' + lookup + '"');
          return this.$el.find(config[lookup]);
        }
      });
      api.dom.thread = function(element) {
        if (this.constructor !== api.dom.thread) {
          return new api.dom.thread(element);
        }
        if (!element || !element.hasClass("if") && !element.hasClass("iY")) api.tools.error("api.dom.thread called with invalid element/id");
        this.$el = element;
        return this;
      };
      extend(api.dom.thread.prototype, {
        /**
           Retrieve preconfigured dom elements for this email
        */
        dom: function(lookup) {
          if (!lookup) return this.$el;
          var config = {
            opened_email: "div.adn",
            subject: "h2.hP",
            labels: "div.hN"
          };
          if (!config[lookup]) api.tools.error('Dom lookup failed. Unable to find config for "' + lookup + '"');
          return this.$el.find(config[lookup]);
        }
      });
      api.compose.start_compose = function() {
        var composeEl = document.getElementsByClassName("T-I T-I-KE L3")[0];
        if (composeEl) {
          composeEl.click();
          return true;
        }
        return false;
      };
      api.old = {};
      api.old.get = api.get;
      api.new = {};
      api.new.get = {};
      api.new.get.email_id = function(emailElem) {
        if (!emailElem) {
          const emailElems = document.querySelectorAll(".adn[data-message-id]");
          if (!emailElems || emailElems.length === 0) {
            return null;
          }
          emailElem = emailElems[emailElems.length - 1];
        }
        return api.helper.get.new_email_id(emailElem);
      };
      api.new.get.thread_id = function() {
        const threadElem = document.querySelector("[data-thread-perm-id]");
        if (!threadElem) {
          return null;
        }
        return threadElem.dataset["threadPermId"];
      };
      api.new.get.email_data = function(identifier) {
        identifier = identifier || api.new.get.email_id();
        const email_id = api.helper.get.new_email_id(identifier);
        if (!email_id) {
          return null;
        } else {
          return api.cache.emailIdCache[email_id];
        }
      };
      api.new.get.thread_data = function(identifier) {
        identifier = identifier || api.new.get.thread_id();
        const thread_id = api.helper.get.thread_id(identifier);
        if (!thread_id) {
          return null;
        } else {
          return api.cache.threadCache[thread_id];
        }
      };
      if (typeof document !== "undefined") {
        api.tools.xhr_watcher();
      }
      if (typeof document !== "undefined") {
        api.tools.embedded_data_watcher();
      }
      return api;
    };
    {
      exports.Gmail = Gmail;
    }
  })(gmail$2);
  const gmail = /* @__PURE__ */ getDefaultExportFromCjs(gmail$2);
  const gmail$1 = /* @__PURE__ */ _mergeNamespaces$1({
    __proto__: null,
    default: gmail
  }, [gmail$2]);
  /*!
   * jQuery JavaScript Library v4.0.0-beta.2
   * https://jquery.com/
   *
   * Copyright OpenJS Foundation and other contributors
   * Released under the MIT license
   * https://jquery.org/license
   *
   * Date: 2024-07-17T13:32Z
   */
  function jQueryFactory(window2, noGlobal) {
    if (typeof window2 === "undefined" || !window2.document) {
      throw new Error("jQuery requires a window with a document");
    }
    var arr = [];
    var getProto = Object.getPrototypeOf;
    var slice = arr.slice;
    var flat = arr.flat ? function(array) {
      return arr.flat.call(array);
    } : function(array) {
      return arr.concat.apply([], array);
    };
    var push = arr.push;
    var indexOf = arr.indexOf;
    var class2type = {};
    var toString = class2type.toString;
    var hasOwn = class2type.hasOwnProperty;
    var fnToString = hasOwn.toString;
    var ObjectFunctionString = fnToString.call(Object);
    var support = {};
    function toType(obj) {
      if (obj == null) {
        return obj + "";
      }
      return typeof obj === "object" ? class2type[toString.call(obj)] || "object" : typeof obj;
    }
    function isWindow(obj) {
      return obj != null && obj === obj.window;
    }
    function isArrayLike(obj) {
      var length = !!obj && obj.length, type2 = toType(obj);
      if (typeof obj === "function" || isWindow(obj)) {
        return false;
      }
      return type2 === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
    }
    var document$1 = window2.document;
    var preservedScriptAttributes = {
      type: true,
      src: true,
      nonce: true,
      noModule: true
    };
    function DOMEval(code, node, doc) {
      doc = doc || document$1;
      var i2, script = doc.createElement("script");
      script.text = code;
      for (i2 in preservedScriptAttributes) {
        if (node && node[i2]) {
          script[i2] = node[i2];
        }
      }
      if (doc.head.appendChild(script).parentNode) {
        script.parentNode.removeChild(script);
      }
    }
    var version = "4.0.0-beta.2", rhtmlSuffix = /HTML$/i, jQuery2 = function(selector, context) {
      return new jQuery2.fn.init(selector, context);
    };
    jQuery2.fn = jQuery2.prototype = {
      // The current version of jQuery being used
      jquery: version,
      constructor: jQuery2,
      // The default length of a jQuery object is 0
      length: 0,
      toArray: function() {
        return slice.call(this);
      },
      // Get the Nth element in the matched element set OR
      // Get the whole matched element set as a clean array
      get: function(num) {
        if (num == null) {
          return slice.call(this);
        }
        return num < 0 ? this[num + this.length] : this[num];
      },
      // Take an array of elements and push it onto the stack
      // (returning the new matched element set)
      pushStack: function(elems) {
        var ret = jQuery2.merge(this.constructor(), elems);
        ret.prevObject = this;
        return ret;
      },
      // Execute a callback for every element in the matched set.
      each: function(callback) {
        return jQuery2.each(this, callback);
      },
      map: function(callback) {
        return this.pushStack(jQuery2.map(this, function(elem, i2) {
          return callback.call(elem, i2, elem);
        }));
      },
      slice: function() {
        return this.pushStack(slice.apply(this, arguments));
      },
      first: function() {
        return this.eq(0);
      },
      last: function() {
        return this.eq(-1);
      },
      even: function() {
        return this.pushStack(jQuery2.grep(this, function(_elem, i2) {
          return (i2 + 1) % 2;
        }));
      },
      odd: function() {
        return this.pushStack(jQuery2.grep(this, function(_elem, i2) {
          return i2 % 2;
        }));
      },
      eq: function(i2) {
        var len = this.length, j = +i2 + (i2 < 0 ? len : 0);
        return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
      },
      end: function() {
        return this.prevObject || this.constructor();
      }
    };
    jQuery2.extend = jQuery2.fn.extend = function() {
      var options, name, src, copy2, copyIsArray, clone, target = arguments[0] || {}, i2 = 1, length = arguments.length, deep = false;
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[i2] || {};
        i2++;
      }
      if (typeof target !== "object" && typeof target !== "function") {
        target = {};
      }
      if (i2 === length) {
        target = this;
        i2--;
      }
      for (; i2 < length; i2++) {
        if ((options = arguments[i2]) != null) {
          for (name in options) {
            copy2 = options[name];
            if (name === "__proto__" || target === copy2) {
              continue;
            }
            if (deep && copy2 && (jQuery2.isPlainObject(copy2) || (copyIsArray = Array.isArray(copy2)))) {
              src = target[name];
              if (copyIsArray && !Array.isArray(src)) {
                clone = [];
              } else if (!copyIsArray && !jQuery2.isPlainObject(src)) {
                clone = {};
              } else {
                clone = src;
              }
              copyIsArray = false;
              target[name] = jQuery2.extend(deep, clone, copy2);
            } else if (copy2 !== void 0) {
              target[name] = copy2;
            }
          }
        }
      }
      return target;
    };
    jQuery2.extend({
      // Unique for each copy of jQuery on the page
      expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
      // Assume jQuery is ready without the ready module
      isReady: true,
      error: function(msg) {
        throw new Error(msg);
      },
      noop: function() {
      },
      isPlainObject: function(obj) {
        var proto, Ctor;
        if (!obj || toString.call(obj) !== "[object Object]") {
          return false;
        }
        proto = getProto(obj);
        if (!proto) {
          return true;
        }
        Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
        return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
      },
      isEmptyObject: function(obj) {
        var name;
        for (name in obj) {
          return false;
        }
        return true;
      },
      // Evaluates a script in a provided context; falls back to the global one
      // if not specified.
      globalEval: function(code, options, doc) {
        DOMEval(code, { nonce: options && options.nonce }, doc);
      },
      each: function(obj, callback) {
        var length, i2 = 0;
        if (isArrayLike(obj)) {
          length = obj.length;
          for (; i2 < length; i2++) {
            if (callback.call(obj[i2], i2, obj[i2]) === false) {
              break;
            }
          }
        } else {
          for (i2 in obj) {
            if (callback.call(obj[i2], i2, obj[i2]) === false) {
              break;
            }
          }
        }
        return obj;
      },
      // Retrieve the text value of an array of DOM nodes
      text: function(elem) {
        var node, ret = "", i2 = 0, nodeType = elem.nodeType;
        if (!nodeType) {
          while (node = elem[i2++]) {
            ret += jQuery2.text(node);
          }
        }
        if (nodeType === 1 || nodeType === 11) {
          return elem.textContent;
        }
        if (nodeType === 9) {
          return elem.documentElement.textContent;
        }
        if (nodeType === 3 || nodeType === 4) {
          return elem.nodeValue;
        }
        return ret;
      },
      // results is for internal usage only
      makeArray: function(arr2, results) {
        var ret = results || [];
        if (arr2 != null) {
          if (isArrayLike(Object(arr2))) {
            jQuery2.merge(
              ret,
              typeof arr2 === "string" ? [arr2] : arr2
            );
          } else {
            push.call(ret, arr2);
          }
        }
        return ret;
      },
      inArray: function(elem, arr2, i2) {
        return arr2 == null ? -1 : indexOf.call(arr2, elem, i2);
      },
      isXMLDoc: function(elem) {
        var namespace = elem && elem.namespaceURI, docElem = elem && (elem.ownerDocument || elem).documentElement;
        return !rhtmlSuffix.test(namespace || docElem && docElem.nodeName || "HTML");
      },
      // Note: an element does not contain itself
      contains: function(a, b) {
        var bup = b && b.parentNode;
        return a === bup || !!(bup && bup.nodeType === 1 && // Support: IE 9 - 11+
        // IE doesn't have `contains` on SVG.
        (a.contains ? a.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
      },
      merge: function(first, second) {
        var len = +second.length, j = 0, i2 = first.length;
        for (; j < len; j++) {
          first[i2++] = second[j];
        }
        first.length = i2;
        return first;
      },
      grep: function(elems, callback, invert) {
        var callbackInverse, matches2 = [], i2 = 0, length = elems.length, callbackExpect = !invert;
        for (; i2 < length; i2++) {
          callbackInverse = !callback(elems[i2], i2);
          if (callbackInverse !== callbackExpect) {
            matches2.push(elems[i2]);
          }
        }
        return matches2;
      },
      // arg is for internal usage only
      map: function(elems, callback, arg) {
        var length, value, i2 = 0, ret = [];
        if (isArrayLike(elems)) {
          length = elems.length;
          for (; i2 < length; i2++) {
            value = callback(elems[i2], i2, arg);
            if (value != null) {
              ret.push(value);
            }
          }
        } else {
          for (i2 in elems) {
            value = callback(elems[i2], i2, arg);
            if (value != null) {
              ret.push(value);
            }
          }
        }
        return flat(ret);
      },
      // A global GUID counter for objects
      guid: 1,
      // jQuery.support is not used in Core but other projects attach their
      // properties to it so it needs to exist.
      support
    });
    if (typeof Symbol === "function") {
      jQuery2.fn[Symbol.iterator] = arr[Symbol.iterator];
    }
    jQuery2.each(
      "Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),
      function(_i, name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
      }
    );
    function nodeName(elem, name) {
      return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
    }
    var pop = arr.pop;
    var whitespace = "[\\x20\\t\\r\\n\\f]";
    var isIE = document$1.documentMode;
    try {
      document$1.querySelector(":has(*,:jqfake)");
      support.cssHas = false;
    } catch (e) {
      support.cssHas = true;
    }
    var rbuggyQSA = [];
    if (isIE) {
      rbuggyQSA.push(
        // Support: IE 9 - 11+
        // IE's :disabled selector does not pick up the children of disabled fieldsets
        ":enabled",
        ":disabled",
        // Support: IE 11+
        // IE 11 doesn't find elements on a `[name='']` query in some cases.
        // Adding a temporary attribute to the document before the selection works
        // around the issue.
        "\\[" + whitespace + "*name" + whitespace + "*=" + whitespace + `*(?:''|"")`
      );
    }
    if (!support.cssHas) {
      rbuggyQSA.push(":has");
    }
    rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
    var rtrimCSS = new RegExp(
      "^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$",
      "g"
    );
    var identifier = "(?:\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\[^\\r\\n\\f]|[\\w-]|[^\0-\\x7f])+";
    var rleadingCombinator = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*");
    var rdescend = new RegExp(whitespace + "|>");
    var rsibling = /[+~]/;
    var documentElement$1 = document$1.documentElement;
    var matches = documentElement$1.matches || documentElement$1.msMatchesSelector;
    function createCache() {
      var keys = [];
      function cache2(key, value) {
        if (keys.push(key + " ") > jQuery2.expr.cacheLength) {
          delete cache2[keys.shift()];
        }
        return cache2[key + " "] = value;
      }
      return cache2;
    }
    function testContext(context) {
      return context && typeof context.getElementsByTagName !== "undefined" && context;
    }
    var attributes = "\\[" + whitespace + "*(" + identifier + ")(?:" + whitespace + // Operator (capture 2)
    "*([*^$|!~]?=)" + whitespace + // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
    `*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(` + identifier + "))|)" + whitespace + "*\\]";
    var pseudos = ":(" + identifier + `)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|` + attributes + ")*)|.*)\\)|)";
    var filterMatchExpr = {
      ID: new RegExp("^#(" + identifier + ")"),
      CLASS: new RegExp("^\\.(" + identifier + ")"),
      TAG: new RegExp("^(" + identifier + "|[*])"),
      ATTR: new RegExp("^" + attributes),
      PSEUDO: new RegExp("^" + pseudos),
      CHILD: new RegExp(
        "^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)",
        "i"
      )
    };
    var rpseudo = new RegExp(pseudos);
    var runescape = new RegExp("\\\\[\\da-fA-F]{1,6}" + whitespace + "?|\\\\([^\\r\\n\\f])", "g"), funescape = function(escape, nonHex) {
      var high = "0x" + escape.slice(1) - 65536;
      if (nonHex) {
        return nonHex;
      }
      return high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
    };
    function unescapeSelector(sel) {
      return sel.replace(runescape, funescape);
    }
    function selectorError(msg) {
      jQuery2.error("Syntax error, unrecognized expression: " + msg);
    }
    var rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*");
    var tokenCache = createCache();
    function tokenize(selector, parseOnly) {
      var matched, match, tokens, type2, soFar, groups, preFilters, cached = tokenCache[selector + " "];
      if (cached) {
        return parseOnly ? 0 : cached.slice(0);
      }
      soFar = selector;
      groups = [];
      preFilters = jQuery2.expr.preFilter;
      while (soFar) {
        if (!matched || (match = rcomma.exec(soFar))) {
          if (match) {
            soFar = soFar.slice(match[0].length) || soFar;
          }
          groups.push(tokens = []);
        }
        matched = false;
        if (match = rleadingCombinator.exec(soFar)) {
          matched = match.shift();
          tokens.push({
            value: matched,
            // Cast descendant combinators to space
            type: match[0].replace(rtrimCSS, " ")
          });
          soFar = soFar.slice(matched.length);
        }
        for (type2 in filterMatchExpr) {
          if ((match = jQuery2.expr.match[type2].exec(soFar)) && (!preFilters[type2] || (match = preFilters[type2](match)))) {
            matched = match.shift();
            tokens.push({
              value: matched,
              type: type2,
              matches: match
            });
            soFar = soFar.slice(matched.length);
          }
        }
        if (!matched) {
          break;
        }
      }
      if (parseOnly) {
        return soFar.length;
      }
      return soFar ? selectorError(selector) : (
        // Cache the tokens
        tokenCache(selector, groups).slice(0)
      );
    }
    var preFilter = {
      ATTR: function(match) {
        match[1] = unescapeSelector(match[1]);
        match[3] = unescapeSelector(match[3] || match[4] || match[5] || "");
        if (match[2] === "~=") {
          match[3] = " " + match[3] + " ";
        }
        return match.slice(0, 4);
      },
      CHILD: function(match) {
        match[1] = match[1].toLowerCase();
        if (match[1].slice(0, 3) === "nth") {
          if (!match[3]) {
            selectorError(match[0]);
          }
          match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
          match[5] = +(match[7] + match[8] || match[3] === "odd");
        } else if (match[3]) {
          selectorError(match[0]);
        }
        return match;
      },
      PSEUDO: function(match) {
        var excess, unquoted = !match[6] && match[2];
        if (filterMatchExpr.CHILD.test(match[0])) {
          return null;
        }
        if (match[3]) {
          match[2] = match[4] || match[5] || "";
        } else if (unquoted && rpseudo.test(unquoted) && // Get excess from tokenize (recursively)
        (excess = tokenize(unquoted, true)) && // advance to the next closing parenthesis
        (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
          match[0] = match[0].slice(0, excess);
          match[2] = unquoted.slice(0, excess);
        }
        return match.slice(0, 3);
      }
    };
    function toSelector(tokens) {
      var i2 = 0, len = tokens.length, selector = "";
      for (; i2 < len; i2++) {
        selector += tokens[i2].value;
      }
      return selector;
    }
    function access(elems, fn, key, value, chainable, emptyGet, raw) {
      var i2 = 0, len = elems.length, bulk = key == null;
      if (toType(key) === "object") {
        chainable = true;
        for (i2 in key) {
          access(elems, fn, i2, key[i2], true, emptyGet, raw);
        }
      } else if (value !== void 0) {
        chainable = true;
        if (typeof value !== "function") {
          raw = true;
        }
        if (bulk) {
          if (raw) {
            fn.call(elems, value);
            fn = null;
          } else {
            bulk = fn;
            fn = function(elem, _key, value2) {
              return bulk.call(jQuery2(elem), value2);
            };
          }
        }
        if (fn) {
          for (; i2 < len; i2++) {
            fn(
              elems[i2],
              key,
              raw ? value : value.call(elems[i2], i2, fn(elems[i2], key))
            );
          }
        }
      }
      if (chainable) {
        return elems;
      }
      if (bulk) {
        return fn.call(elems);
      }
      return len ? fn(elems[0], key) : emptyGet;
    }
    var rnothtmlwhite = /[^\x20\t\r\n\f]+/g;
    jQuery2.fn.extend({
      attr: function(name, value) {
        return access(this, jQuery2.attr, name, value, arguments.length > 1);
      },
      removeAttr: function(name) {
        return this.each(function() {
          jQuery2.removeAttr(this, name);
        });
      }
    });
    jQuery2.extend({
      attr: function(elem, name, value) {
        var ret, hooks, nType = elem.nodeType;
        if (nType === 3 || nType === 8 || nType === 2) {
          return;
        }
        if (typeof elem.getAttribute === "undefined") {
          return jQuery2.prop(elem, name, value);
        }
        if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
          hooks = jQuery2.attrHooks[name.toLowerCase()];
        }
        if (value !== void 0) {
          if (value === null || // For compat with previous handling of boolean attributes,
          // remove when `false` passed. For ARIA attributes -
          // many of which recognize a `"false"` value - continue to
          // set the `"false"` value as jQuery <4 did.
          value === false && name.toLowerCase().indexOf("aria-") !== 0) {
            jQuery2.removeAttr(elem, name);
            return;
          }
          if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
            return ret;
          }
          elem.setAttribute(name, value);
          return value;
        }
        if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
          return ret;
        }
        ret = elem.getAttribute(name);
        return ret == null ? void 0 : ret;
      },
      attrHooks: {},
      removeAttr: function(elem, value) {
        var name, i2 = 0, attrNames = value && value.match(rnothtmlwhite);
        if (attrNames && elem.nodeType === 1) {
          while (name = attrNames[i2++]) {
            elem.removeAttribute(name);
          }
        }
      }
    });
    if (isIE) {
      jQuery2.attrHooks.type = {
        set: function(elem, value) {
          if (value === "radio" && nodeName(elem, "input")) {
            var val = elem.value;
            elem.setAttribute("type", value);
            if (val) {
              elem.value = val;
            }
            return value;
          }
        }
      };
    }
    var rcssescape = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g;
    function fcssescape(ch, asCodePoint) {
      if (asCodePoint) {
        if (ch === "\0") {
          return "�";
        }
        return ch.slice(0, -1) + "\\" + ch.charCodeAt(ch.length - 1).toString(16) + " ";
      }
      return "\\" + ch;
    }
    jQuery2.escapeSelector = function(sel) {
      return (sel + "").replace(rcssescape, fcssescape);
    };
    var sort = arr.sort;
    var splice = arr.splice;
    var hasDuplicate;
    function sortOrder(a, b) {
      if (a === b) {
        hasDuplicate = true;
        return 0;
      }
      var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
      if (compare) {
        return compare;
      }
      compare = (a.ownerDocument || a) == (b.ownerDocument || b) ? a.compareDocumentPosition(b) : (
        // Otherwise we know they are disconnected
        1
      );
      if (compare & 1) {
        if (a == document$1 || a.ownerDocument == document$1 && jQuery2.contains(document$1, a)) {
          return -1;
        }
        if (b == document$1 || b.ownerDocument == document$1 && jQuery2.contains(document$1, b)) {
          return 1;
        }
        return 0;
      }
      return compare & 4 ? -1 : 1;
    }
    jQuery2.uniqueSort = function(results) {
      var elem, duplicates = [], j = 0, i2 = 0;
      hasDuplicate = false;
      sort.call(results, sortOrder);
      if (hasDuplicate) {
        while (elem = results[i2++]) {
          if (elem === results[i2]) {
            j = duplicates.push(i2);
          }
        }
        while (j--) {
          splice.call(results, duplicates[j], 1);
        }
      }
      return results;
    };
    jQuery2.fn.uniqueSort = function() {
      return this.pushStack(jQuery2.uniqueSort(slice.apply(this)));
    };
    var i, outermostContext, document2, documentElement, documentIsHTML, dirruns = 0, done = 0, classCache = createCache(), compilerCache = createCache(), nonnativeSelectorCache = createCache(), rwhitespace = new RegExp(whitespace + "+", "g"), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = jQuery2.extend({
      // For use in libraries implementing .is()
      // We use this for POS matching in `select`
      needsContext: new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
    }, filterMatchExpr), rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rquickExpr$1 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, unloadHandler = function() {
      setDocument();
    }, inDisabledFieldset = addCombinator(
      function(elem) {
        return elem.disabled === true && nodeName(elem, "fieldset");
      },
      { dir: "parentNode", next: "legend" }
    );
    function find(selector, context, results, seed) {
      var m, i2, elem, nid, match, groups, newSelector, newContext = context && context.ownerDocument, nodeType = context ? context.nodeType : 9;
      results = results || [];
      if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
        return results;
      }
      if (!seed) {
        setDocument(context);
        context = context || document2;
        if (documentIsHTML) {
          if (nodeType !== 11 && (match = rquickExpr$1.exec(selector))) {
            if (m = match[1]) {
              if (nodeType === 9) {
                if (elem = context.getElementById(m)) {
                  push.call(results, elem);
                }
                return results;
              } else {
                if (newContext && (elem = newContext.getElementById(m)) && jQuery2.contains(context, elem)) {
                  push.call(results, elem);
                  return results;
                }
              }
            } else if (match[2]) {
              push.apply(results, context.getElementsByTagName(selector));
              return results;
            } else if ((m = match[3]) && context.getElementsByClassName) {
              push.apply(results, context.getElementsByClassName(m));
              return results;
            }
          }
          if (!nonnativeSelectorCache[selector + " "] && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
            newSelector = selector;
            newContext = context;
            if (nodeType === 1 && (rdescend.test(selector) || rleadingCombinator.test(selector))) {
              newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
              if (newContext != context || isIE) {
                if (nid = context.getAttribute("id")) {
                  nid = jQuery2.escapeSelector(nid);
                } else {
                  context.setAttribute("id", nid = jQuery2.expando);
                }
              }
              groups = tokenize(selector);
              i2 = groups.length;
              while (i2--) {
                groups[i2] = (nid ? "#" + nid : ":scope") + " " + toSelector(groups[i2]);
              }
              newSelector = groups.join(",");
            }
            try {
              push.apply(
                results,
                newContext.querySelectorAll(newSelector)
              );
              return results;
            } catch (qsaError) {
              nonnativeSelectorCache(selector, true);
            } finally {
              if (nid === jQuery2.expando) {
                context.removeAttribute("id");
              }
            }
          }
        }
      }
      return select(selector.replace(rtrimCSS, "$1"), context, results, seed);
    }
    function markFunction(fn) {
      fn[jQuery2.expando] = true;
      return fn;
    }
    function createInputPseudo(type2) {
      return function(elem) {
        return nodeName(elem, "input") && elem.type === type2;
      };
    }
    function createButtonPseudo(type2) {
      return function(elem) {
        return (nodeName(elem, "input") || nodeName(elem, "button")) && elem.type === type2;
      };
    }
    function createDisabledPseudo(disabled) {
      return function(elem) {
        if ("form" in elem) {
          if (elem.parentNode && elem.disabled === false) {
            if ("label" in elem) {
              if ("label" in elem.parentNode) {
                return elem.parentNode.disabled === disabled;
              } else {
                return elem.disabled === disabled;
              }
            }
            return elem.isDisabled === disabled || // Where there is no isDisabled, check manually
            elem.isDisabled !== !disabled && inDisabledFieldset(elem) === disabled;
          }
          return elem.disabled === disabled;
        } else if ("label" in elem) {
          return elem.disabled === disabled;
        }
        return false;
      };
    }
    function createPositionalPseudo(fn) {
      return markFunction(function(argument) {
        argument = +argument;
        return markFunction(function(seed, matches2) {
          var j, matchIndexes = fn([], seed.length, argument), i2 = matchIndexes.length;
          while (i2--) {
            if (seed[j = matchIndexes[i2]]) {
              seed[j] = !(matches2[j] = seed[j]);
            }
          }
        });
      });
    }
    function setDocument(node) {
      var subWindow, doc = node ? node.ownerDocument || node : document$1;
      if (doc == document2 || doc.nodeType !== 9) {
        return;
      }
      document2 = doc;
      documentElement = document2.documentElement;
      documentIsHTML = !jQuery2.isXMLDoc(document2);
      if (isIE && document$1 != document2 && (subWindow = document2.defaultView) && subWindow.top !== subWindow) {
        subWindow.addEventListener("unload", unloadHandler);
      }
    }
    find.matches = function(expr, elements) {
      return find(expr, null, null, elements);
    };
    find.matchesSelector = function(elem, expr) {
      setDocument(elem);
      if (documentIsHTML && !nonnativeSelectorCache[expr + " "] && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
        try {
          return matches.call(elem, expr);
        } catch (e) {
          nonnativeSelectorCache(expr, true);
        }
      }
      return find(expr, document2, null, [elem]).length > 0;
    };
    jQuery2.expr = {
      // Can be adjusted by the user
      cacheLength: 50,
      createPseudo: markFunction,
      match: matchExpr,
      find: {
        ID: function(id, context) {
          if (typeof context.getElementById !== "undefined" && documentIsHTML) {
            var elem = context.getElementById(id);
            return elem ? [elem] : [];
          }
        },
        TAG: function(tag, context) {
          if (typeof context.getElementsByTagName !== "undefined") {
            return context.getElementsByTagName(tag);
          } else {
            return context.querySelectorAll(tag);
          }
        },
        CLASS: function(className, context) {
          if (typeof context.getElementsByClassName !== "undefined" && documentIsHTML) {
            return context.getElementsByClassName(className);
          }
        }
      },
      relative: {
        ">": { dir: "parentNode", first: true },
        " ": { dir: "parentNode" },
        "+": { dir: "previousSibling", first: true },
        "~": { dir: "previousSibling" }
      },
      preFilter,
      filter: {
        ID: function(id) {
          var attrId = unescapeSelector(id);
          return function(elem) {
            return elem.getAttribute("id") === attrId;
          };
        },
        TAG: function(nodeNameSelector) {
          var expectedNodeName = unescapeSelector(nodeNameSelector).toLowerCase();
          return nodeNameSelector === "*" ? function() {
            return true;
          } : function(elem) {
            return nodeName(elem, expectedNodeName);
          };
        },
        CLASS: function(className) {
          var pattern2 = classCache[className + " "];
          return pattern2 || (pattern2 = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
            return pattern2.test(
              typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || ""
            );
          });
        },
        ATTR: function(name, operator, check) {
          return function(elem) {
            var result = jQuery2.attr(elem, name);
            if (result == null) {
              return operator === "!=";
            }
            if (!operator) {
              return true;
            }
            result += "";
            if (operator === "=") {
              return result === check;
            }
            if (operator === "!=") {
              return result !== check;
            }
            if (operator === "^=") {
              return check && result.indexOf(check) === 0;
            }
            if (operator === "*=") {
              return check && result.indexOf(check) > -1;
            }
            if (operator === "$=") {
              return check && result.slice(-check.length) === check;
            }
            if (operator === "~=") {
              return (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1;
            }
            if (operator === "|=") {
              return result === check || result.slice(0, check.length + 1) === check + "-";
            }
            return false;
          };
        },
        CHILD: function(type2, what, _argument, first, last) {
          var simple = type2.slice(0, 3) !== "nth", forward = type2.slice(-4) !== "last", ofType = what === "of-type";
          return first === 1 && last === 0 ? (
            // Shortcut for :nth-*(n)
            function(elem) {
              return !!elem.parentNode;
            }
          ) : function(elem, _context, xml) {
            var cache2, outerCache, node, nodeIndex, start, dir2 = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType, diff = false;
            if (parent) {
              if (simple) {
                while (dir2) {
                  node = elem;
                  while (node = node[dir2]) {
                    if (ofType ? nodeName(node, name) : node.nodeType === 1) {
                      return false;
                    }
                  }
                  start = dir2 = type2 === "only" && !start && "nextSibling";
                }
                return true;
              }
              start = [forward ? parent.firstChild : parent.lastChild];
              if (forward && useCache) {
                outerCache = parent[jQuery2.expando] || (parent[jQuery2.expando] = {});
                cache2 = outerCache[type2] || [];
                nodeIndex = cache2[0] === dirruns && cache2[1];
                diff = nodeIndex && cache2[2];
                node = nodeIndex && parent.childNodes[nodeIndex];
                while (node = ++nodeIndex && node && node[dir2] || // Fallback to seeking `elem` from the start
                (diff = nodeIndex = 0) || start.pop()) {
                  if (node.nodeType === 1 && ++diff && node === elem) {
                    outerCache[type2] = [dirruns, nodeIndex, diff];
                    break;
                  }
                }
              } else {
                if (useCache) {
                  outerCache = elem[jQuery2.expando] || (elem[jQuery2.expando] = {});
                  cache2 = outerCache[type2] || [];
                  nodeIndex = cache2[0] === dirruns && cache2[1];
                  diff = nodeIndex;
                }
                if (diff === false) {
                  while (node = ++nodeIndex && node && node[dir2] || (diff = nodeIndex = 0) || start.pop()) {
                    if ((ofType ? nodeName(node, name) : node.nodeType === 1) && ++diff) {
                      if (useCache) {
                        outerCache = node[jQuery2.expando] || (node[jQuery2.expando] = {});
                        outerCache[type2] = [dirruns, diff];
                      }
                      if (node === elem) {
                        break;
                      }
                    }
                  }
                }
              }
              diff -= last;
              return diff === first || diff % first === 0 && diff / first >= 0;
            }
          };
        },
        PSEUDO: function(pseudo, argument) {
          var fn = jQuery2.expr.pseudos[pseudo] || jQuery2.expr.setFilters[pseudo.toLowerCase()] || selectorError("unsupported pseudo: " + pseudo);
          if (fn[jQuery2.expando]) {
            return fn(argument);
          }
          return fn;
        }
      },
      pseudos: {
        // Potentially complex pseudos
        not: markFunction(function(selector) {
          var input = [], results = [], matcher = compile2(selector.replace(rtrimCSS, "$1"));
          return matcher[jQuery2.expando] ? markFunction(function(seed, matches2, _context, xml) {
            var elem, unmatched = matcher(seed, null, xml, []), i2 = seed.length;
            while (i2--) {
              if (elem = unmatched[i2]) {
                seed[i2] = !(matches2[i2] = elem);
              }
            }
          }) : function(elem, _context, xml) {
            input[0] = elem;
            matcher(input, null, xml, results);
            input[0] = null;
            return !results.pop();
          };
        }),
        has: markFunction(function(selector) {
          return function(elem) {
            return find(selector, elem).length > 0;
          };
        }),
        contains: markFunction(function(text) {
          text = unescapeSelector(text);
          return function(elem) {
            return (elem.textContent || jQuery2.text(elem)).indexOf(text) > -1;
          };
        }),
        // "Whether an element is represented by a :lang() selector
        // is based solely on the element's language value
        // being equal to the identifier C,
        // or beginning with the identifier C immediately followed by "-".
        // The matching of C against the element's language value is performed case-insensitively.
        // The identifier C does not have to be a valid language name."
        // https://www.w3.org/TR/selectors/#lang-pseudo
        lang: markFunction(function(lang) {
          if (!ridentifier.test(lang || "")) {
            selectorError("unsupported lang: " + lang);
          }
          lang = unescapeSelector(lang).toLowerCase();
          return function(elem) {
            var elemLang;
            do {
              if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                elemLang = elemLang.toLowerCase();
                return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
              }
            } while ((elem = elem.parentNode) && elem.nodeType === 1);
            return false;
          };
        }),
        // Miscellaneous
        target: function(elem) {
          var hash = window2.location && window2.location.hash;
          return hash && hash.slice(1) === elem.id;
        },
        root: function(elem) {
          return elem === documentElement;
        },
        focus: function(elem) {
          return elem === document2.activeElement && document2.hasFocus() && !!(elem.type || elem.href || ~elem.tabIndex);
        },
        // Boolean properties
        enabled: createDisabledPseudo(false),
        disabled: createDisabledPseudo(true),
        checked: function(elem) {
          return nodeName(elem, "input") && !!elem.checked || nodeName(elem, "option") && !!elem.selected;
        },
        selected: function(elem) {
          if (isIE && elem.parentNode) {
            elem.parentNode.selectedIndex;
          }
          return elem.selected === true;
        },
        // Contents
        empty: function(elem) {
          for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
            if (elem.nodeType < 6) {
              return false;
            }
          }
          return true;
        },
        parent: function(elem) {
          return !jQuery2.expr.pseudos.empty(elem);
        },
        // Element/input types
        header: function(elem) {
          return rheader.test(elem.nodeName);
        },
        input: function(elem) {
          return rinputs.test(elem.nodeName);
        },
        button: function(elem) {
          return nodeName(elem, "input") && elem.type === "button" || nodeName(elem, "button");
        },
        text: function(elem) {
          return nodeName(elem, "input") && elem.type === "text";
        },
        // Position-in-collection
        first: createPositionalPseudo(function() {
          return [0];
        }),
        last: createPositionalPseudo(function(_matchIndexes, length) {
          return [length - 1];
        }),
        eq: createPositionalPseudo(function(_matchIndexes, length, argument) {
          return [argument < 0 ? argument + length : argument];
        }),
        even: createPositionalPseudo(function(matchIndexes, length) {
          var i2 = 0;
          for (; i2 < length; i2 += 2) {
            matchIndexes.push(i2);
          }
          return matchIndexes;
        }),
        odd: createPositionalPseudo(function(matchIndexes, length) {
          var i2 = 1;
          for (; i2 < length; i2 += 2) {
            matchIndexes.push(i2);
          }
          return matchIndexes;
        }),
        lt: createPositionalPseudo(function(matchIndexes, length, argument) {
          var i2;
          if (argument < 0) {
            i2 = argument + length;
          } else if (argument > length) {
            i2 = length;
          } else {
            i2 = argument;
          }
          for (; --i2 >= 0; ) {
            matchIndexes.push(i2);
          }
          return matchIndexes;
        }),
        gt: createPositionalPseudo(function(matchIndexes, length, argument) {
          var i2 = argument < 0 ? argument + length : argument;
          for (; ++i2 < length; ) {
            matchIndexes.push(i2);
          }
          return matchIndexes;
        })
      }
    };
    jQuery2.expr.pseudos.nth = jQuery2.expr.pseudos.eq;
    for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
      jQuery2.expr.pseudos[i] = createInputPseudo(i);
    }
    for (i in { submit: true, reset: true }) {
      jQuery2.expr.pseudos[i] = createButtonPseudo(i);
    }
    function setFilters() {
    }
    setFilters.prototype = jQuery2.expr.filters = jQuery2.expr.pseudos;
    jQuery2.expr.setFilters = new setFilters();
    function addCombinator(matcher, combinator, base) {
      var dir2 = combinator.dir, skip = combinator.next, key = skip || dir2, checkNonElements = base && key === "parentNode", doneName = done++;
      return combinator.first ? (
        // Check against closest ancestor/preceding element
        function(elem, context, xml) {
          while (elem = elem[dir2]) {
            if (elem.nodeType === 1 || checkNonElements) {
              return matcher(elem, context, xml);
            }
          }
          return false;
        }
      ) : (
        // Check against all ancestor/preceding elements
        function(elem, context, xml) {
          var oldCache, outerCache, newCache = [dirruns, doneName];
          if (xml) {
            while (elem = elem[dir2]) {
              if (elem.nodeType === 1 || checkNonElements) {
                if (matcher(elem, context, xml)) {
                  return true;
                }
              }
            }
          } else {
            while (elem = elem[dir2]) {
              if (elem.nodeType === 1 || checkNonElements) {
                outerCache = elem[jQuery2.expando] || (elem[jQuery2.expando] = {});
                if (skip && nodeName(elem, skip)) {
                  elem = elem[dir2] || elem;
                } else if ((oldCache = outerCache[key]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                  return newCache[2] = oldCache[2];
                } else {
                  outerCache[key] = newCache;
                  if (newCache[2] = matcher(elem, context, xml)) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        }
      );
    }
    function elementMatcher(matchers) {
      return matchers.length > 1 ? function(elem, context, xml) {
        var i2 = matchers.length;
        while (i2--) {
          if (!matchers[i2](elem, context, xml)) {
            return false;
          }
        }
        return true;
      } : matchers[0];
    }
    function multipleContexts(selector, contexts, results) {
      var i2 = 0, len = contexts.length;
      for (; i2 < len; i2++) {
        find(selector, contexts[i2], results);
      }
      return results;
    }
    function condense(unmatched, map, filter, context, xml) {
      var elem, newUnmatched = [], i2 = 0, len = unmatched.length, mapped = map != null;
      for (; i2 < len; i2++) {
        if (elem = unmatched[i2]) {
          if (!filter || filter(elem, context, xml)) {
            newUnmatched.push(elem);
            if (mapped) {
              map.push(i2);
            }
          }
        }
      }
      return newUnmatched;
    }
    function setMatcher(preFilter2, selector, matcher, postFilter, postFinder, postSelector) {
      if (postFilter && !postFilter[jQuery2.expando]) {
        postFilter = setMatcher(postFilter);
      }
      if (postFinder && !postFinder[jQuery2.expando]) {
        postFinder = setMatcher(postFinder, postSelector);
      }
      return markFunction(function(seed, results, context, xml) {
        var temp, i2, elem, matcherOut, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(
          selector || "*",
          context.nodeType ? [context] : context,
          []
        ), matcherIn = preFilter2 && (seed || !selector) ? condense(elems, preMap, preFilter2, context, xml) : elems;
        if (matcher) {
          matcherOut = postFinder || (seed ? preFilter2 : preexisting || postFilter) ? (
            // ...intermediate processing is necessary
            []
          ) : (
            // ...otherwise use results directly
            results
          );
          matcher(matcherIn, matcherOut, context, xml);
        } else {
          matcherOut = matcherIn;
        }
        if (postFilter) {
          temp = condense(matcherOut, postMap);
          postFilter(temp, [], context, xml);
          i2 = temp.length;
          while (i2--) {
            if (elem = temp[i2]) {
              matcherOut[postMap[i2]] = !(matcherIn[postMap[i2]] = elem);
            }
          }
        }
        if (seed) {
          if (postFinder || preFilter2) {
            if (postFinder) {
              temp = [];
              i2 = matcherOut.length;
              while (i2--) {
                if (elem = matcherOut[i2]) {
                  temp.push(matcherIn[i2] = elem);
                }
              }
              postFinder(null, matcherOut = [], temp, xml);
            }
            i2 = matcherOut.length;
            while (i2--) {
              if ((elem = matcherOut[i2]) && (temp = postFinder ? indexOf.call(seed, elem) : preMap[i2]) > -1) {
                seed[temp] = !(results[temp] = elem);
              }
            }
          }
        } else {
          matcherOut = condense(
            matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut
          );
          if (postFinder) {
            postFinder(null, results, matcherOut, xml);
          } else {
            push.apply(results, matcherOut);
          }
        }
      });
    }
    function matcherFromTokens(tokens) {
      var checkContext, matcher, j, len = tokens.length, leadingRelative = jQuery2.expr.relative[tokens[0].type], implicitRelative = leadingRelative || jQuery2.expr.relative[" "], i2 = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
        return elem === checkContext;
      }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
        return indexOf.call(checkContext, elem) > -1;
      }, implicitRelative, true), matchers = [function(elem, context, xml) {
        var ret = !leadingRelative && (xml || context != outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
        checkContext = null;
        return ret;
      }];
      for (; i2 < len; i2++) {
        if (matcher = jQuery2.expr.relative[tokens[i2].type]) {
          matchers = [addCombinator(elementMatcher(matchers), matcher)];
        } else {
          matcher = jQuery2.expr.filter[tokens[i2].type].apply(null, tokens[i2].matches);
          if (matcher[jQuery2.expando]) {
            j = ++i2;
            for (; j < len; j++) {
              if (jQuery2.expr.relative[tokens[j].type]) {
                break;
              }
            }
            return setMatcher(
              i2 > 1 && elementMatcher(matchers),
              i2 > 1 && toSelector(
                // If the preceding token was a descendant combinator, insert an implicit any-element `*`
                tokens.slice(0, i2 - 1).concat({ value: tokens[i2 - 2].type === " " ? "*" : "" })
              ).replace(rtrimCSS, "$1"),
              matcher,
              i2 < j && matcherFromTokens(tokens.slice(i2, j)),
              j < len && matcherFromTokens(tokens = tokens.slice(j)),
              j < len && toSelector(tokens)
            );
          }
          matchers.push(matcher);
        }
      }
      return elementMatcher(matchers);
    }
    function matcherFromGroupMatchers(elementMatchers, setMatchers) {
      var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
        var elem, j, matcher, matchedCount = 0, i2 = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && jQuery2.expr.find.TAG("*", outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1;
        if (outermost) {
          outermostContext = context == document2 || context || outermost;
        }
        for (; (elem = elems[i2]) != null; i2++) {
          if (byElement && elem) {
            j = 0;
            if (!context && elem.ownerDocument != document2) {
              setDocument(elem);
              xml = !documentIsHTML;
            }
            while (matcher = elementMatchers[j++]) {
              if (matcher(elem, context || document2, xml)) {
                push.call(results, elem);
                break;
              }
            }
            if (outermost) {
              dirruns = dirrunsUnique;
            }
          }
          if (bySet) {
            if (elem = !matcher && elem) {
              matchedCount--;
            }
            if (seed) {
              unmatched.push(elem);
            }
          }
        }
        matchedCount += i2;
        if (bySet && i2 !== matchedCount) {
          j = 0;
          while (matcher = setMatchers[j++]) {
            matcher(unmatched, setMatched, context, xml);
          }
          if (seed) {
            if (matchedCount > 0) {
              while (i2--) {
                if (!(unmatched[i2] || setMatched[i2])) {
                  setMatched[i2] = pop.call(results);
                }
              }
            }
            setMatched = condense(setMatched);
          }
          push.apply(results, setMatched);
          if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
            jQuery2.uniqueSort(results);
          }
        }
        if (outermost) {
          dirruns = dirrunsUnique;
          outermostContext = contextBackup;
        }
        return unmatched;
      };
      return bySet ? markFunction(superMatcher) : superMatcher;
    }
    function compile2(selector, match) {
      var i2, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
      if (!cached) {
        if (!match) {
          match = tokenize(selector);
        }
        i2 = match.length;
        while (i2--) {
          cached = matcherFromTokens(match[i2]);
          if (cached[jQuery2.expando]) {
            setMatchers.push(cached);
          } else {
            elementMatchers.push(cached);
          }
        }
        cached = compilerCache(
          selector,
          matcherFromGroupMatchers(elementMatchers, setMatchers)
        );
        cached.selector = selector;
      }
      return cached;
    }
    function select(selector, context, results, seed) {
      var i2, tokens, token, type2, find2, compiled = typeof selector === "function" && selector, match = !seed && tokenize(selector = compiled.selector || selector);
      results = results || [];
      if (match.length === 1) {
        tokens = match[0] = match[0].slice(0);
        if (tokens.length > 2 && (token = tokens[0]).type === "ID" && context.nodeType === 9 && documentIsHTML && jQuery2.expr.relative[tokens[1].type]) {
          context = (jQuery2.expr.find.ID(
            unescapeSelector(token.matches[0]),
            context
          ) || [])[0];
          if (!context) {
            return results;
          } else if (compiled) {
            context = context.parentNode;
          }
          selector = selector.slice(tokens.shift().value.length);
        }
        i2 = matchExpr.needsContext.test(selector) ? 0 : tokens.length;
        while (i2--) {
          token = tokens[i2];
          if (jQuery2.expr.relative[type2 = token.type]) {
            break;
          }
          if (find2 = jQuery2.expr.find[type2]) {
            if (seed = find2(
              unescapeSelector(token.matches[0]),
              rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
            )) {
              tokens.splice(i2, 1);
              selector = seed.length && toSelector(tokens);
              if (!selector) {
                push.apply(results, seed);
                return results;
              }
              break;
            }
          }
        }
      }
      (compiled || compile2(selector, match))(
        seed,
        context,
        !documentIsHTML,
        results,
        !context || rsibling.test(selector) && testContext(context.parentNode) || context
      );
      return results;
    }
    setDocument();
    jQuery2.find = find;
    find.compile = compile2;
    find.select = select;
    find.setDocument = setDocument;
    find.tokenize = tokenize;
    function dir(elem, dir2, until) {
      var matched = [], truncate = until !== void 0;
      while ((elem = elem[dir2]) && elem.nodeType !== 9) {
        if (elem.nodeType === 1) {
          if (truncate && jQuery2(elem).is(until)) {
            break;
          }
          matched.push(elem);
        }
      }
      return matched;
    }
    function siblings(n, elem) {
      var matched = [];
      for (; n; n = n.nextSibling) {
        if (n.nodeType === 1 && n !== elem) {
          matched.push(n);
        }
      }
      return matched;
    }
    var rneedsContext = jQuery2.expr.match.needsContext;
    var rsingleTag = /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i;
    function isObviousHtml(input) {
      return input[0] === "<" && input[input.length - 1] === ">" && input.length >= 3;
    }
    function winnow(elements, qualifier, not2) {
      if (typeof qualifier === "function") {
        return jQuery2.grep(elements, function(elem, i2) {
          return !!qualifier.call(elem, i2, elem) !== not2;
        });
      }
      if (qualifier.nodeType) {
        return jQuery2.grep(elements, function(elem) {
          return elem === qualifier !== not2;
        });
      }
      if (typeof qualifier !== "string") {
        return jQuery2.grep(elements, function(elem) {
          return indexOf.call(qualifier, elem) > -1 !== not2;
        });
      }
      return jQuery2.filter(qualifier, elements, not2);
    }
    jQuery2.filter = function(expr, elems, not2) {
      var elem = elems[0];
      if (not2) {
        expr = ":not(" + expr + ")";
      }
      if (elems.length === 1 && elem.nodeType === 1) {
        return jQuery2.find.matchesSelector(elem, expr) ? [elem] : [];
      }
      return jQuery2.find.matches(expr, jQuery2.grep(elems, function(elem2) {
        return elem2.nodeType === 1;
      }));
    };
    jQuery2.fn.extend({
      find: function(selector) {
        var i2, ret, len = this.length, self2 = this;
        if (typeof selector !== "string") {
          return this.pushStack(jQuery2(selector).filter(function() {
            for (i2 = 0; i2 < len; i2++) {
              if (jQuery2.contains(self2[i2], this)) {
                return true;
              }
            }
          }));
        }
        ret = this.pushStack([]);
        for (i2 = 0; i2 < len; i2++) {
          jQuery2.find(selector, self2[i2], ret);
        }
        return len > 1 ? jQuery2.uniqueSort(ret) : ret;
      },
      filter: function(selector) {
        return this.pushStack(winnow(this, selector || [], false));
      },
      not: function(selector) {
        return this.pushStack(winnow(this, selector || [], true));
      },
      is: function(selector) {
        return !!winnow(
          this,
          // If this is a positional/relative selector, check membership in the returned set
          // so $("p:first").is("p:last") won't return true for a doc with two "p".
          typeof selector === "string" && rneedsContext.test(selector) ? jQuery2(selector) : selector || [],
          false
        ).length;
      }
    });
    var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/, init = jQuery2.fn.init = function(selector, context) {
      var match, elem;
      if (!selector) {
        return this;
      }
      if (selector.nodeType) {
        this[0] = selector;
        this.length = 1;
        return this;
      } else if (typeof selector === "function") {
        return rootjQuery.ready !== void 0 ? rootjQuery.ready(selector) : (
          // Execute immediately if ready is not present
          selector(jQuery2)
        );
      } else {
        match = selector + "";
        if (isObviousHtml(match)) {
          match = [null, selector, null];
        } else if (typeof selector === "string") {
          match = rquickExpr.exec(selector);
        } else {
          return jQuery2.makeArray(selector, this);
        }
        if (match && (match[1] || !context)) {
          if (match[1]) {
            context = context instanceof jQuery2 ? context[0] : context;
            jQuery2.merge(this, jQuery2.parseHTML(
              match[1],
              context && context.nodeType ? context.ownerDocument || context : document$1,
              true
            ));
            if (rsingleTag.test(match[1]) && jQuery2.isPlainObject(context)) {
              for (match in context) {
                if (typeof this[match] === "function") {
                  this[match](context[match]);
                } else {
                  this.attr(match, context[match]);
                }
              }
            }
            return this;
          } else {
            elem = document$1.getElementById(match[2]);
            if (elem) {
              this[0] = elem;
              this.length = 1;
            }
            return this;
          }
        } else if (!context || context.jquery) {
          return (context || rootjQuery).find(selector);
        } else {
          return this.constructor(context).find(selector);
        }
      }
    };
    init.prototype = jQuery2.fn;
    rootjQuery = jQuery2(document$1);
    var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
      children: true,
      contents: true,
      next: true,
      prev: true
    };
    jQuery2.fn.extend({
      has: function(target) {
        var targets = jQuery2(target, this), l = targets.length;
        return this.filter(function() {
          var i2 = 0;
          for (; i2 < l; i2++) {
            if (jQuery2.contains(this, targets[i2])) {
              return true;
            }
          }
        });
      },
      closest: function(selectors, context) {
        var cur, i2 = 0, l = this.length, matched = [], targets = typeof selectors !== "string" && jQuery2(selectors);
        if (!rneedsContext.test(selectors)) {
          for (; i2 < l; i2++) {
            for (cur = this[i2]; cur && cur !== context; cur = cur.parentNode) {
              if (cur.nodeType < 11 && (targets ? targets.index(cur) > -1 : (
                // Don't pass non-elements to jQuery#find
                cur.nodeType === 1 && jQuery2.find.matchesSelector(cur, selectors)
              ))) {
                matched.push(cur);
                break;
              }
            }
          }
        }
        return this.pushStack(matched.length > 1 ? jQuery2.uniqueSort(matched) : matched);
      },
      // Determine the position of an element within the set
      index: function(elem) {
        if (!elem) {
          return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
        }
        if (typeof elem === "string") {
          return indexOf.call(jQuery2(elem), this[0]);
        }
        return indexOf.call(
          this,
          // If it receives a jQuery object, the first element is used
          elem.jquery ? elem[0] : elem
        );
      },
      add: function(selector, context) {
        return this.pushStack(
          jQuery2.uniqueSort(
            jQuery2.merge(this.get(), jQuery2(selector, context))
          )
        );
      },
      addBack: function(selector) {
        return this.add(
          selector == null ? this.prevObject : this.prevObject.filter(selector)
        );
      }
    });
    function sibling(cur, dir2) {
      while ((cur = cur[dir2]) && cur.nodeType !== 1) {
      }
      return cur;
    }
    jQuery2.each({
      parent: function(elem) {
        var parent = elem.parentNode;
        return parent && parent.nodeType !== 11 ? parent : null;
      },
      parents: function(elem) {
        return dir(elem, "parentNode");
      },
      parentsUntil: function(elem, _i, until) {
        return dir(elem, "parentNode", until);
      },
      next: function(elem) {
        return sibling(elem, "nextSibling");
      },
      prev: function(elem) {
        return sibling(elem, "previousSibling");
      },
      nextAll: function(elem) {
        return dir(elem, "nextSibling");
      },
      prevAll: function(elem) {
        return dir(elem, "previousSibling");
      },
      nextUntil: function(elem, _i, until) {
        return dir(elem, "nextSibling", until);
      },
      prevUntil: function(elem, _i, until) {
        return dir(elem, "previousSibling", until);
      },
      siblings: function(elem) {
        return siblings((elem.parentNode || {}).firstChild, elem);
      },
      children: function(elem) {
        return siblings(elem.firstChild);
      },
      contents: function(elem) {
        if (elem.contentDocument != null && // Support: IE 11+
        // <object> elements with no `data` attribute has an object
        // `contentDocument` with a `null` prototype.
        getProto(elem.contentDocument)) {
          return elem.contentDocument;
        }
        if (nodeName(elem, "template")) {
          elem = elem.content || elem;
        }
        return jQuery2.merge([], elem.childNodes);
      }
    }, function(name, fn) {
      jQuery2.fn[name] = function(until, selector) {
        var matched = jQuery2.map(this, fn, until);
        if (name.slice(-5) !== "Until") {
          selector = until;
        }
        if (selector && typeof selector === "string") {
          matched = jQuery2.filter(selector, matched);
        }
        if (this.length > 1) {
          if (!guaranteedUnique[name]) {
            jQuery2.uniqueSort(matched);
          }
          if (rparentsprev.test(name)) {
            matched.reverse();
          }
        }
        return this.pushStack(matched);
      };
    });
    function createOptions(options) {
      var object = {};
      jQuery2.each(options.match(rnothtmlwhite) || [], function(_2, flag) {
        object[flag] = true;
      });
      return object;
    }
    jQuery2.Callbacks = function(options) {
      options = typeof options === "string" ? createOptions(options) : jQuery2.extend({}, options);
      var firing, memory, fired, locked, list = [], queue = [], firingIndex = -1, fire = function() {
        locked = locked || options.once;
        fired = firing = true;
        for (; queue.length; firingIndex = -1) {
          memory = queue.shift();
          while (++firingIndex < list.length) {
            if (list[firingIndex].apply(memory[0], memory[1]) === false && options.stopOnFalse) {
              firingIndex = list.length;
              memory = false;
            }
          }
        }
        if (!options.memory) {
          memory = false;
        }
        firing = false;
        if (locked) {
          if (memory) {
            list = [];
          } else {
            list = "";
          }
        }
      }, self2 = {
        // Add a callback or a collection of callbacks to the list
        add: function() {
          if (list) {
            if (memory && !firing) {
              firingIndex = list.length - 1;
              queue.push(memory);
            }
            (function add(args) {
              jQuery2.each(args, function(_2, arg) {
                if (typeof arg === "function") {
                  if (!options.unique || !self2.has(arg)) {
                    list.push(arg);
                  }
                } else if (arg && arg.length && toType(arg) !== "string") {
                  add(arg);
                }
              });
            })(arguments);
            if (memory && !firing) {
              fire();
            }
          }
          return this;
        },
        // Remove a callback from the list
        remove: function() {
          jQuery2.each(arguments, function(_2, arg) {
            var index;
            while ((index = jQuery2.inArray(arg, list, index)) > -1) {
              list.splice(index, 1);
              if (index <= firingIndex) {
                firingIndex--;
              }
            }
          });
          return this;
        },
        // Check if a given callback is in the list.
        // If no argument is given, return whether or not list has callbacks attached.
        has: function(fn) {
          return fn ? jQuery2.inArray(fn, list) > -1 : list.length > 0;
        },
        // Remove all callbacks from the list
        empty: function() {
          if (list) {
            list = [];
          }
          return this;
        },
        // Disable .fire and .add
        // Abort any current/pending executions
        // Clear all callbacks and values
        disable: function() {
          locked = queue = [];
          list = memory = "";
          return this;
        },
        disabled: function() {
          return !list;
        },
        // Disable .fire
        // Also disable .add unless we have memory (since it would have no effect)
        // Abort any pending executions
        lock: function() {
          locked = queue = [];
          if (!memory && !firing) {
            list = memory = "";
          }
          return this;
        },
        locked: function() {
          return !!locked;
        },
        // Call all callbacks with the given context and arguments
        fireWith: function(context, args) {
          if (!locked) {
            args = args || [];
            args = [context, args.slice ? args.slice() : args];
            queue.push(args);
            if (!firing) {
              fire();
            }
          }
          return this;
        },
        // Call all the callbacks with the given arguments
        fire: function() {
          self2.fireWith(this, arguments);
          return this;
        },
        // To know if the callbacks have already been called at least once
        fired: function() {
          return !!fired;
        }
      };
      return self2;
    };
    function Identity(v) {
      return v;
    }
    function Thrower(ex) {
      throw ex;
    }
    function adoptValue(value, resolve2, reject, noValue) {
      var method;
      try {
        if (value && typeof (method = value.promise) === "function") {
          method.call(value).done(resolve2).fail(reject);
        } else if (value && typeof (method = value.then) === "function") {
          method.call(value, resolve2, reject);
        } else {
          resolve2.apply(void 0, [value].slice(noValue));
        }
      } catch (value2) {
        reject(value2);
      }
    }
    jQuery2.extend({
      Deferred: function(func) {
        var tuples = [
          // action, add listener, callbacks,
          // ... .then handlers, argument index, [final state]
          [
            "notify",
            "progress",
            jQuery2.Callbacks("memory"),
            jQuery2.Callbacks("memory"),
            2
          ],
          [
            "resolve",
            "done",
            jQuery2.Callbacks("once memory"),
            jQuery2.Callbacks("once memory"),
            0,
            "resolved"
          ],
          [
            "reject",
            "fail",
            jQuery2.Callbacks("once memory"),
            jQuery2.Callbacks("once memory"),
            1,
            "rejected"
          ]
        ], state = "pending", promise = {
          state: function() {
            return state;
          },
          always: function() {
            deferred.done(arguments).fail(arguments);
            return this;
          },
          catch: function(fn) {
            return promise.then(null, fn);
          },
          // Keep pipe for back-compat
          pipe: function() {
            var fns = arguments;
            return jQuery2.Deferred(function(newDefer) {
              jQuery2.each(tuples, function(_i, tuple) {
                var fn = typeof fns[tuple[4]] === "function" && fns[tuple[4]];
                deferred[tuple[1]](function() {
                  var returned = fn && fn.apply(this, arguments);
                  if (returned && typeof returned.promise === "function") {
                    returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);
                  } else {
                    newDefer[tuple[0] + "With"](
                      this,
                      fn ? [returned] : arguments
                    );
                  }
                });
              });
              fns = null;
            }).promise();
          },
          then: function(onFulfilled, onRejected, onProgress) {
            var maxDepth = 0;
            function resolve2(depth, deferred2, handler, special) {
              return function() {
                var that = this, args = arguments, mightThrow = function() {
                  var returned, then;
                  if (depth < maxDepth) {
                    return;
                  }
                  returned = handler.apply(that, args);
                  if (returned === deferred2.promise()) {
                    throw new TypeError("Thenable self-resolution");
                  }
                  then = returned && // Support: Promises/A+ section 2.3.4
                  // https://promisesaplus.com/#point-64
                  // Only check objects and functions for thenability
                  (typeof returned === "object" || typeof returned === "function") && returned.then;
                  if (typeof then === "function") {
                    if (special) {
                      then.call(
                        returned,
                        resolve2(maxDepth, deferred2, Identity, special),
                        resolve2(maxDepth, deferred2, Thrower, special)
                      );
                    } else {
                      maxDepth++;
                      then.call(
                        returned,
                        resolve2(maxDepth, deferred2, Identity, special),
                        resolve2(maxDepth, deferred2, Thrower, special),
                        resolve2(
                          maxDepth,
                          deferred2,
                          Identity,
                          deferred2.notifyWith
                        )
                      );
                    }
                  } else {
                    if (handler !== Identity) {
                      that = void 0;
                      args = [returned];
                    }
                    (special || deferred2.resolveWith)(that, args);
                  }
                }, process = special ? mightThrow : function() {
                  try {
                    mightThrow();
                  } catch (e) {
                    if (jQuery2.Deferred.exceptionHook) {
                      jQuery2.Deferred.exceptionHook(
                        e,
                        process.error
                      );
                    }
                    if (depth + 1 >= maxDepth) {
                      if (handler !== Thrower) {
                        that = void 0;
                        args = [e];
                      }
                      deferred2.rejectWith(that, args);
                    }
                  }
                };
                if (depth) {
                  process();
                } else {
                  if (jQuery2.Deferred.getErrorHook) {
                    process.error = jQuery2.Deferred.getErrorHook();
                  }
                  window2.setTimeout(process);
                }
              };
            }
            return jQuery2.Deferred(function(newDefer) {
              tuples[0][3].add(
                resolve2(
                  0,
                  newDefer,
                  typeof onProgress === "function" ? onProgress : Identity,
                  newDefer.notifyWith
                )
              );
              tuples[1][3].add(
                resolve2(
                  0,
                  newDefer,
                  typeof onFulfilled === "function" ? onFulfilled : Identity
                )
              );
              tuples[2][3].add(
                resolve2(
                  0,
                  newDefer,
                  typeof onRejected === "function" ? onRejected : Thrower
                )
              );
            }).promise();
          },
          // Get a promise for this deferred
          // If obj is provided, the promise aspect is added to the object
          promise: function(obj) {
            return obj != null ? jQuery2.extend(obj, promise) : promise;
          }
        }, deferred = {};
        jQuery2.each(tuples, function(i2, tuple) {
          var list = tuple[2], stateString = tuple[5];
          promise[tuple[1]] = list.add;
          if (stateString) {
            list.add(
              function() {
                state = stateString;
              },
              // rejected_callbacks.disable
              // fulfilled_callbacks.disable
              tuples[3 - i2][2].disable,
              // rejected_handlers.disable
              // fulfilled_handlers.disable
              tuples[3 - i2][3].disable,
              // progress_callbacks.lock
              tuples[0][2].lock,
              // progress_handlers.lock
              tuples[0][3].lock
            );
          }
          list.add(tuple[3].fire);
          deferred[tuple[0]] = function() {
            deferred[tuple[0] + "With"](this === deferred ? void 0 : this, arguments);
            return this;
          };
          deferred[tuple[0] + "With"] = list.fireWith;
        });
        promise.promise(deferred);
        if (func) {
          func.call(deferred, deferred);
        }
        return deferred;
      },
      // Deferred helper
      when: function(singleValue) {
        var remaining = arguments.length, i2 = remaining, resolveContexts = Array(i2), resolveValues = slice.call(arguments), primary = jQuery2.Deferred(), updateFunc = function(i3) {
          return function(value) {
            resolveContexts[i3] = this;
            resolveValues[i3] = arguments.length > 1 ? slice.call(arguments) : value;
            if (!--remaining) {
              primary.resolveWith(resolveContexts, resolveValues);
            }
          };
        };
        if (remaining <= 1) {
          adoptValue(
            singleValue,
            primary.done(updateFunc(i2)).resolve,
            primary.reject,
            !remaining
          );
          if (primary.state() === "pending" || typeof (resolveValues[i2] && resolveValues[i2].then) === "function") {
            return primary.then();
          }
        }
        while (i2--) {
          adoptValue(resolveValues[i2], updateFunc(i2), primary.reject);
        }
        return primary.promise();
      }
    });
    var rerrorNames = /^(Eval|Internal|Range|Reference|Syntax|Type|URI)Error$/;
    jQuery2.Deferred.exceptionHook = function(error, asyncError) {
      if (error && rerrorNames.test(error.name)) {
        window2.console.warn(
          "jQuery.Deferred exception",
          error,
          asyncError
        );
      }
    };
    jQuery2.readyException = function(error) {
      window2.setTimeout(function() {
        throw error;
      });
    };
    var readyList = jQuery2.Deferred();
    jQuery2.fn.ready = function(fn) {
      readyList.then(fn).catch(function(error) {
        jQuery2.readyException(error);
      });
      return this;
    };
    jQuery2.extend({
      // Is the DOM ready to be used? Set to true once it occurs.
      isReady: false,
      // A counter to track how many items to wait for before
      // the ready event fires. See trac-6781
      readyWait: 1,
      // Handle when the DOM is ready
      ready: function(wait) {
        if (wait === true ? --jQuery2.readyWait : jQuery2.isReady) {
          return;
        }
        jQuery2.isReady = true;
        if (wait !== true && --jQuery2.readyWait > 0) {
          return;
        }
        readyList.resolveWith(document$1, [jQuery2]);
      }
    });
    jQuery2.ready.then = readyList.then;
    function completed() {
      document$1.removeEventListener("DOMContentLoaded", completed);
      window2.removeEventListener("load", completed);
      jQuery2.ready();
    }
    if (document$1.readyState !== "loading") {
      window2.setTimeout(jQuery2.ready);
    } else {
      document$1.addEventListener("DOMContentLoaded", completed);
      window2.addEventListener("load", completed);
    }
    var rdashAlpha = /-([a-z])/g;
    function fcamelCase(_all, letter) {
      return letter.toUpperCase();
    }
    function camelCase(string) {
      return string.replace(rdashAlpha, fcamelCase);
    }
    function acceptData(owner) {
      return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
    }
    function Data() {
      this.expando = jQuery2.expando + Data.uid++;
    }
    Data.uid = 1;
    Data.prototype = {
      cache: function(owner) {
        var value = owner[this.expando];
        if (!value) {
          value = /* @__PURE__ */ Object.create(null);
          if (acceptData(owner)) {
            if (owner.nodeType) {
              owner[this.expando] = value;
            } else {
              Object.defineProperty(owner, this.expando, {
                value,
                configurable: true
              });
            }
          }
        }
        return value;
      },
      set: function(owner, data2, value) {
        var prop, cache2 = this.cache(owner);
        if (typeof data2 === "string") {
          cache2[camelCase(data2)] = value;
        } else {
          for (prop in data2) {
            cache2[camelCase(prop)] = data2[prop];
          }
        }
        return value;
      },
      get: function(owner, key) {
        return key === void 0 ? this.cache(owner) : (
          // Always use camelCase key (gh-2257)
          owner[this.expando] && owner[this.expando][camelCase(key)]
        );
      },
      access: function(owner, key, value) {
        if (key === void 0 || key && typeof key === "string" && value === void 0) {
          return this.get(owner, key);
        }
        this.set(owner, key, value);
        return value !== void 0 ? value : key;
      },
      remove: function(owner, key) {
        var i2, cache2 = owner[this.expando];
        if (cache2 === void 0) {
          return;
        }
        if (key !== void 0) {
          if (Array.isArray(key)) {
            key = key.map(camelCase);
          } else {
            key = camelCase(key);
            key = key in cache2 ? [key] : key.match(rnothtmlwhite) || [];
          }
          i2 = key.length;
          while (i2--) {
            delete cache2[key[i2]];
          }
        }
        if (key === void 0 || jQuery2.isEmptyObject(cache2)) {
          if (owner.nodeType) {
            owner[this.expando] = void 0;
          } else {
            delete owner[this.expando];
          }
        }
      },
      hasData: function(owner) {
        var cache2 = owner[this.expando];
        return cache2 !== void 0 && !jQuery2.isEmptyObject(cache2);
      }
    };
    var dataPriv = new Data();
    var dataUser = new Data();
    var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /[A-Z]/g;
    function getData2(data2) {
      if (data2 === "true") {
        return true;
      }
      if (data2 === "false") {
        return false;
      }
      if (data2 === "null") {
        return null;
      }
      if (data2 === +data2 + "") {
        return +data2;
      }
      if (rbrace.test(data2)) {
        return JSON.parse(data2);
      }
      return data2;
    }
    function dataAttr(elem, key, data2) {
      var name;
      if (data2 === void 0 && elem.nodeType === 1) {
        name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
        data2 = elem.getAttribute(name);
        if (typeof data2 === "string") {
          try {
            data2 = getData2(data2);
          } catch (e) {
          }
          dataUser.set(elem, key, data2);
        } else {
          data2 = void 0;
        }
      }
      return data2;
    }
    jQuery2.extend({
      hasData: function(elem) {
        return dataUser.hasData(elem) || dataPriv.hasData(elem);
      },
      data: function(elem, name, data2) {
        return dataUser.access(elem, name, data2);
      },
      removeData: function(elem, name) {
        dataUser.remove(elem, name);
      },
      // TODO: Now that all calls to _data and _removeData have been replaced
      // with direct calls to dataPriv methods, these can be deprecated.
      _data: function(elem, name, data2) {
        return dataPriv.access(elem, name, data2);
      },
      _removeData: function(elem, name) {
        dataPriv.remove(elem, name);
      }
    });
    jQuery2.fn.extend({
      data: function(key, value) {
        var i2, name, data2, elem = this[0], attrs = elem && elem.attributes;
        if (key === void 0) {
          if (this.length) {
            data2 = dataUser.get(elem);
            if (elem.nodeType === 1 && !dataPriv.get(elem, "hasDataAttrs")) {
              i2 = attrs.length;
              while (i2--) {
                if (attrs[i2]) {
                  name = attrs[i2].name;
                  if (name.indexOf("data-") === 0) {
                    name = camelCase(name.slice(5));
                    dataAttr(elem, name, data2[name]);
                  }
                }
              }
              dataPriv.set(elem, "hasDataAttrs", true);
            }
          }
          return data2;
        }
        if (typeof key === "object") {
          return this.each(function() {
            dataUser.set(this, key);
          });
        }
        return access(this, function(value2) {
          var data3;
          if (elem && value2 === void 0) {
            data3 = dataUser.get(elem, key);
            if (data3 !== void 0) {
              return data3;
            }
            data3 = dataAttr(elem, key);
            if (data3 !== void 0) {
              return data3;
            }
            return;
          }
          this.each(function() {
            dataUser.set(this, key, value2);
          });
        }, null, value, arguments.length > 1, null, true);
      },
      removeData: function(key) {
        return this.each(function() {
          dataUser.remove(this, key);
        });
      }
    });
    jQuery2.extend({
      queue: function(elem, type2, data2) {
        var queue;
        if (elem) {
          type2 = (type2 || "fx") + "queue";
          queue = dataPriv.get(elem, type2);
          if (data2) {
            if (!queue || Array.isArray(data2)) {
              queue = dataPriv.set(elem, type2, jQuery2.makeArray(data2));
            } else {
              queue.push(data2);
            }
          }
          return queue || [];
        }
      },
      dequeue: function(elem, type2) {
        type2 = type2 || "fx";
        var queue = jQuery2.queue(elem, type2), startLength = queue.length, fn = queue.shift(), hooks = jQuery2._queueHooks(elem, type2), next = function() {
          jQuery2.dequeue(elem, type2);
        };
        if (fn === "inprogress") {
          fn = queue.shift();
          startLength--;
        }
        if (fn) {
          if (type2 === "fx") {
            queue.unshift("inprogress");
          }
          delete hooks.stop;
          fn.call(elem, next, hooks);
        }
        if (!startLength && hooks) {
          hooks.empty.fire();
        }
      },
      // Not public - generate a queueHooks object, or return the current one
      _queueHooks: function(elem, type2) {
        var key = type2 + "queueHooks";
        return dataPriv.get(elem, key) || dataPriv.set(elem, key, {
          empty: jQuery2.Callbacks("once memory").add(function() {
            dataPriv.remove(elem, [type2 + "queue", key]);
          })
        });
      }
    });
    jQuery2.fn.extend({
      queue: function(type2, data2) {
        var setter = 2;
        if (typeof type2 !== "string") {
          data2 = type2;
          type2 = "fx";
          setter--;
        }
        if (arguments.length < setter) {
          return jQuery2.queue(this[0], type2);
        }
        return data2 === void 0 ? this : this.each(function() {
          var queue = jQuery2.queue(this, type2, data2);
          jQuery2._queueHooks(this, type2);
          if (type2 === "fx" && queue[0] !== "inprogress") {
            jQuery2.dequeue(this, type2);
          }
        });
      },
      dequeue: function(type2) {
        return this.each(function() {
          jQuery2.dequeue(this, type2);
        });
      },
      clearQueue: function(type2) {
        return this.queue(type2 || "fx", []);
      },
      // Get a promise resolved when queues of a certain type
      // are emptied (fx is the type by default)
      promise: function(type2, obj) {
        var tmp, count = 1, defer = jQuery2.Deferred(), elements = this, i2 = this.length, resolve2 = function() {
          if (!--count) {
            defer.resolveWith(elements, [elements]);
          }
        };
        if (typeof type2 !== "string") {
          obj = type2;
          type2 = void 0;
        }
        type2 = type2 || "fx";
        while (i2--) {
          tmp = dataPriv.get(elements[i2], type2 + "queueHooks");
          if (tmp && tmp.empty) {
            count++;
            tmp.empty.add(resolve2);
          }
        }
        resolve2();
        return defer.promise(obj);
      }
    });
    var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
    var rcssNum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i");
    var cssExpand = ["Top", "Right", "Bottom", "Left"];
    function isHiddenWithinTree(elem, el) {
      elem = el || elem;
      return elem.style.display === "none" || elem.style.display === "" && jQuery2.css(elem, "display") === "none";
    }
    var ralphaStart = /^[a-z]/, rautoPx = /^(?:Border(?:Top|Right|Bottom|Left)?(?:Width|)|(?:Margin|Padding)?(?:Top|Right|Bottom|Left)?|(?:Min|Max)?(?:Width|Height))$/;
    function isAutoPx(prop) {
      return ralphaStart.test(prop) && rautoPx.test(prop[0].toUpperCase() + prop.slice(1));
    }
    function adjustCSS(elem, prop, valueParts, tween) {
      var adjusted, scale, maxIterations = 20, currentValue = tween ? function() {
        return tween.cur();
      } : function() {
        return jQuery2.css(elem, prop, "");
      }, initial = currentValue(), unit = valueParts && valueParts[3] || (isAutoPx(prop) ? "px" : ""), initialInUnit = elem.nodeType && (!isAutoPx(prop) || unit !== "px" && +initial) && rcssNum.exec(jQuery2.css(elem, prop));
      if (initialInUnit && initialInUnit[3] !== unit) {
        initial = initial / 2;
        unit = unit || initialInUnit[3];
        initialInUnit = +initial || 1;
        while (maxIterations--) {
          jQuery2.style(elem, prop, initialInUnit + unit);
          if ((1 - scale) * (1 - (scale = currentValue() / initial || 0.5)) <= 0) {
            maxIterations = 0;
          }
          initialInUnit = initialInUnit / scale;
        }
        initialInUnit = initialInUnit * 2;
        jQuery2.style(elem, prop, initialInUnit + unit);
        valueParts = valueParts || [];
      }
      if (valueParts) {
        initialInUnit = +initialInUnit || +initial || 0;
        adjusted = valueParts[1] ? initialInUnit + (valueParts[1] + 1) * valueParts[2] : +valueParts[2];
        if (tween) {
          tween.unit = unit;
          tween.start = initialInUnit;
          tween.end = adjusted;
        }
      }
      return adjusted;
    }
    var rmsPrefix = /^-ms-/;
    function cssCamelCase(string) {
      return camelCase(string.replace(rmsPrefix, "ms-"));
    }
    var defaultDisplayMap = {};
    function getDefaultDisplay(elem) {
      var temp, doc = elem.ownerDocument, nodeName2 = elem.nodeName, display = defaultDisplayMap[nodeName2];
      if (display) {
        return display;
      }
      temp = doc.body.appendChild(doc.createElement(nodeName2));
      display = jQuery2.css(temp, "display");
      temp.parentNode.removeChild(temp);
      if (display === "none") {
        display = "block";
      }
      defaultDisplayMap[nodeName2] = display;
      return display;
    }
    function showHide(elements, show) {
      var display, elem, values = [], index = 0, length = elements.length;
      for (; index < length; index++) {
        elem = elements[index];
        if (!elem.style) {
          continue;
        }
        display = elem.style.display;
        if (show) {
          if (display === "none") {
            values[index] = dataPriv.get(elem, "display") || null;
            if (!values[index]) {
              elem.style.display = "";
            }
          }
          if (elem.style.display === "" && isHiddenWithinTree(elem)) {
            values[index] = getDefaultDisplay(elem);
          }
        } else {
          if (display !== "none") {
            values[index] = "none";
            dataPriv.set(elem, "display", display);
          }
        }
      }
      for (index = 0; index < length; index++) {
        if (values[index] != null) {
          elements[index].style.display = values[index];
        }
      }
      return elements;
    }
    jQuery2.fn.extend({
      show: function() {
        return showHide(this, true);
      },
      hide: function() {
        return showHide(this);
      },
      toggle: function(state) {
        if (typeof state === "boolean") {
          return state ? this.show() : this.hide();
        }
        return this.each(function() {
          if (isHiddenWithinTree(this)) {
            jQuery2(this).show();
          } else {
            jQuery2(this).hide();
          }
        });
      }
    });
    var isAttached = function(elem) {
      return jQuery2.contains(elem.ownerDocument, elem) || elem.getRootNode(composed) === elem.ownerDocument;
    }, composed = { composed: true };
    if (!documentElement$1.getRootNode) {
      isAttached = function(elem) {
        return jQuery2.contains(elem.ownerDocument, elem);
      };
    }
    var rtagName = /<([a-z][^\/\0>\x20\t\r\n\f]*)/i;
    var wrapMap = {
      // Table parts need to be wrapped with `<table>` or they're
      // stripped to their contents when put in a div.
      // XHTML parsers do not magically insert elements in the
      // same way that tag soup parsers do, so we cannot shorten
      // this by omitting <tbody> or other required elements.
      thead: ["table"],
      col: ["colgroup", "table"],
      tr: ["tbody", "table"],
      td: ["tr", "tbody", "table"]
    };
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    function getAll(context, tag) {
      var ret;
      if (typeof context.getElementsByTagName !== "undefined") {
        ret = context.getElementsByTagName(tag || "*");
      } else if (typeof context.querySelectorAll !== "undefined") {
        ret = context.querySelectorAll(tag || "*");
      } else {
        ret = [];
      }
      if (tag === void 0 || tag && nodeName(context, tag)) {
        return jQuery2.merge([context], ret);
      }
      return ret;
    }
    var rscriptType = /^$|^module$|\/(?:java|ecma)script/i;
    function setGlobalEval(elems, refElements) {
      var i2 = 0, l = elems.length;
      for (; i2 < l; i2++) {
        dataPriv.set(
          elems[i2],
          "globalEval",
          !refElements || dataPriv.get(refElements[i2], "globalEval")
        );
      }
    }
    var rhtml = /<|&#?\w+;/;
    function buildFragment(elems, context, scripts, selection, ignored) {
      var elem, tmp, tag, wrap, attached, j, fragment = context.createDocumentFragment(), nodes = [], i2 = 0, l = elems.length;
      for (; i2 < l; i2++) {
        elem = elems[i2];
        if (elem || elem === 0) {
          if (toType(elem) === "object" && (elem.nodeType || isArrayLike(elem))) {
            jQuery2.merge(nodes, elem.nodeType ? [elem] : elem);
          } else if (!rhtml.test(elem)) {
            nodes.push(context.createTextNode(elem));
          } else {
            tmp = tmp || fragment.appendChild(context.createElement("div"));
            tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
            wrap = wrapMap[tag] || arr;
            j = wrap.length;
            while (--j > -1) {
              tmp = tmp.appendChild(context.createElement(wrap[j]));
            }
            tmp.innerHTML = jQuery2.htmlPrefilter(elem);
            jQuery2.merge(nodes, tmp.childNodes);
            tmp = fragment.firstChild;
            tmp.textContent = "";
          }
        }
      }
      fragment.textContent = "";
      i2 = 0;
      while (elem = nodes[i2++]) {
        if (selection && jQuery2.inArray(elem, selection) > -1) {
          if (ignored) {
            ignored.push(elem);
          }
          continue;
        }
        attached = isAttached(elem);
        tmp = getAll(fragment.appendChild(elem), "script");
        if (attached) {
          setGlobalEval(tmp);
        }
        if (scripts) {
          j = 0;
          while (elem = tmp[j++]) {
            if (rscriptType.test(elem.type || "")) {
              scripts.push(elem);
            }
          }
        }
      }
      return fragment;
    }
    function disableScript(elem) {
      elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
      return elem;
    }
    function restoreScript(elem) {
      if ((elem.type || "").slice(0, 5) === "true/") {
        elem.type = elem.type.slice(5);
      } else {
        elem.removeAttribute("type");
      }
      return elem;
    }
    function domManip(collection, args, callback, ignored) {
      args = flat(args);
      var fragment, first, scripts, hasScripts, node, doc, i2 = 0, l = collection.length, iNoClone = l - 1, value = args[0], valueIsFunction = typeof value === "function";
      if (valueIsFunction) {
        return collection.each(function(index) {
          var self2 = collection.eq(index);
          args[0] = value.call(this, index, self2.html());
          domManip(self2, args, callback, ignored);
        });
      }
      if (l) {
        fragment = buildFragment(args, collection[0].ownerDocument, false, collection, ignored);
        first = fragment.firstChild;
        if (fragment.childNodes.length === 1) {
          fragment = first;
        }
        if (first || ignored) {
          scripts = jQuery2.map(getAll(fragment, "script"), disableScript);
          hasScripts = scripts.length;
          for (; i2 < l; i2++) {
            node = fragment;
            if (i2 !== iNoClone) {
              node = jQuery2.clone(node, true, true);
              if (hasScripts) {
                jQuery2.merge(scripts, getAll(node, "script"));
              }
            }
            callback.call(collection[i2], node, i2);
          }
          if (hasScripts) {
            doc = scripts[scripts.length - 1].ownerDocument;
            jQuery2.map(scripts, restoreScript);
            for (i2 = 0; i2 < hasScripts; i2++) {
              node = scripts[i2];
              if (rscriptType.test(node.type || "") && !dataPriv.get(node, "globalEval") && jQuery2.contains(doc, node)) {
                if (node.src && (node.type || "").toLowerCase() !== "module") {
                  if (jQuery2._evalUrl && !node.noModule) {
                    jQuery2._evalUrl(node.src, {
                      nonce: node.nonce,
                      crossOrigin: node.crossOrigin
                    }, doc);
                  }
                } else {
                  DOMEval(node.textContent, node, doc);
                }
              }
            }
          }
        }
      }
      return collection;
    }
    var rcheckableType = /^(?:checkbox|radio)$/i;
    var rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
    function returnTrue() {
      return true;
    }
    function returnFalse() {
      return false;
    }
    function on(elem, types, selector, data2, fn, one) {
      var origFn, type2;
      if (typeof types === "object") {
        if (typeof selector !== "string") {
          data2 = data2 || selector;
          selector = void 0;
        }
        for (type2 in types) {
          on(elem, type2, selector, data2, types[type2], one);
        }
        return elem;
      }
      if (data2 == null && fn == null) {
        fn = selector;
        data2 = selector = void 0;
      } else if (fn == null) {
        if (typeof selector === "string") {
          fn = data2;
          data2 = void 0;
        } else {
          fn = data2;
          data2 = selector;
          selector = void 0;
        }
      }
      if (fn === false) {
        fn = returnFalse;
      } else if (!fn) {
        return elem;
      }
      if (one === 1) {
        origFn = fn;
        fn = function(event) {
          jQuery2().off(event);
          return origFn.apply(this, arguments);
        };
        fn.guid = origFn.guid || (origFn.guid = jQuery2.guid++);
      }
      return elem.each(function() {
        jQuery2.event.add(this, types, fn, data2, selector);
      });
    }
    jQuery2.event = {
      add: function(elem, types, handler, data2, selector) {
        var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type2, namespaces, origType, elemData = dataPriv.get(elem);
        if (!acceptData(elem)) {
          return;
        }
        if (handler.handler) {
          handleObjIn = handler;
          handler = handleObjIn.handler;
          selector = handleObjIn.selector;
        }
        if (selector) {
          jQuery2.find.matchesSelector(documentElement$1, selector);
        }
        if (!handler.guid) {
          handler.guid = jQuery2.guid++;
        }
        if (!(events = elemData.events)) {
          events = elemData.events = /* @__PURE__ */ Object.create(null);
        }
        if (!(eventHandle = elemData.handle)) {
          eventHandle = elemData.handle = function(e) {
            return typeof jQuery2 !== "undefined" && jQuery2.event.triggered !== e.type ? jQuery2.event.dispatch.apply(elem, arguments) : void 0;
          };
        }
        types = (types || "").match(rnothtmlwhite) || [""];
        t = types.length;
        while (t--) {
          tmp = rtypenamespace.exec(types[t]) || [];
          type2 = origType = tmp[1];
          namespaces = (tmp[2] || "").split(".").sort();
          if (!type2) {
            continue;
          }
          special = jQuery2.event.special[type2] || {};
          type2 = (selector ? special.delegateType : special.bindType) || type2;
          special = jQuery2.event.special[type2] || {};
          handleObj = jQuery2.extend({
            type: type2,
            origType,
            data: data2,
            handler,
            guid: handler.guid,
            selector,
            needsContext: selector && jQuery2.expr.match.needsContext.test(selector),
            namespace: namespaces.join(".")
          }, handleObjIn);
          if (!(handlers = events[type2])) {
            handlers = events[type2] = [];
            handlers.delegateCount = 0;
            if (!special.setup || special.setup.call(elem, data2, namespaces, eventHandle) === false) {
              if (elem.addEventListener) {
                elem.addEventListener(type2, eventHandle);
              }
            }
          }
          if (special.add) {
            special.add.call(elem, handleObj);
            if (!handleObj.handler.guid) {
              handleObj.handler.guid = handler.guid;
            }
          }
          if (selector) {
            handlers.splice(handlers.delegateCount++, 0, handleObj);
          } else {
            handlers.push(handleObj);
          }
        }
      },
      // Detach an event or set of events from an element
      remove: function(elem, types, handler, selector, mappedTypes) {
        var j, origCount, tmp, events, t, handleObj, special, handlers, type2, namespaces, origType, elemData = dataPriv.hasData(elem) && dataPriv.get(elem);
        if (!elemData || !(events = elemData.events)) {
          return;
        }
        types = (types || "").match(rnothtmlwhite) || [""];
        t = types.length;
        while (t--) {
          tmp = rtypenamespace.exec(types[t]) || [];
          type2 = origType = tmp[1];
          namespaces = (tmp[2] || "").split(".").sort();
          if (!type2) {
            for (type2 in events) {
              jQuery2.event.remove(elem, type2 + types[t], handler, selector, true);
            }
            continue;
          }
          special = jQuery2.event.special[type2] || {};
          type2 = (selector ? special.delegateType : special.bindType) || type2;
          handlers = events[type2] || [];
          tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
          origCount = j = handlers.length;
          while (j--) {
            handleObj = handlers[j];
            if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
              handlers.splice(j, 1);
              if (handleObj.selector) {
                handlers.delegateCount--;
              }
              if (special.remove) {
                special.remove.call(elem, handleObj);
              }
            }
          }
          if (origCount && !handlers.length) {
            if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
              jQuery2.removeEvent(elem, type2, elemData.handle);
            }
            delete events[type2];
          }
        }
        if (jQuery2.isEmptyObject(events)) {
          dataPriv.remove(elem, "handle events");
        }
      },
      dispatch: function(nativeEvent) {
        var i2, j, ret, matched, handleObj, handlerQueue, args = new Array(arguments.length), event = jQuery2.event.fix(nativeEvent), handlers = (dataPriv.get(this, "events") || /* @__PURE__ */ Object.create(null))[event.type] || [], special = jQuery2.event.special[event.type] || {};
        args[0] = event;
        for (i2 = 1; i2 < arguments.length; i2++) {
          args[i2] = arguments[i2];
        }
        event.delegateTarget = this;
        if (special.preDispatch && special.preDispatch.call(this, event) === false) {
          return;
        }
        handlerQueue = jQuery2.event.handlers.call(this, event, handlers);
        i2 = 0;
        while ((matched = handlerQueue[i2++]) && !event.isPropagationStopped()) {
          event.currentTarget = matched.elem;
          j = 0;
          while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
            if (!event.rnamespace || handleObj.namespace === false || event.rnamespace.test(handleObj.namespace)) {
              event.handleObj = handleObj;
              event.data = handleObj.data;
              ret = ((jQuery2.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
              if (ret !== void 0) {
                if ((event.result = ret) === false) {
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            }
          }
        }
        if (special.postDispatch) {
          special.postDispatch.call(this, event);
        }
        return event.result;
      },
      handlers: function(event, handlers) {
        var i2, handleObj, sel, matchedHandlers, matchedSelectors, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
        if (delegateCount && // Support: Firefox <=42 - 66+
        // Suppress spec-violating clicks indicating a non-primary pointer button (trac-3861)
        // https://www.w3.org/TR/DOM-Level-3-Events/#event-type-click
        // Support: IE 11+
        // ...but not arrow key "clicks" of radio inputs, which can have `button` -1 (gh-2343)
        !(event.type === "click" && event.button >= 1)) {
          for (; cur !== this; cur = cur.parentNode || this) {
            if (cur.nodeType === 1 && !(event.type === "click" && cur.disabled === true)) {
              matchedHandlers = [];
              matchedSelectors = {};
              for (i2 = 0; i2 < delegateCount; i2++) {
                handleObj = handlers[i2];
                sel = handleObj.selector + " ";
                if (matchedSelectors[sel] === void 0) {
                  matchedSelectors[sel] = handleObj.needsContext ? jQuery2(sel, this).index(cur) > -1 : jQuery2.find(sel, this, null, [cur]).length;
                }
                if (matchedSelectors[sel]) {
                  matchedHandlers.push(handleObj);
                }
              }
              if (matchedHandlers.length) {
                handlerQueue.push({ elem: cur, handlers: matchedHandlers });
              }
            }
          }
        }
        cur = this;
        if (delegateCount < handlers.length) {
          handlerQueue.push({ elem: cur, handlers: handlers.slice(delegateCount) });
        }
        return handlerQueue;
      },
      addProp: function(name, hook) {
        Object.defineProperty(jQuery2.Event.prototype, name, {
          enumerable: true,
          configurable: true,
          get: typeof hook === "function" ? function() {
            if (this.originalEvent) {
              return hook(this.originalEvent);
            }
          } : function() {
            if (this.originalEvent) {
              return this.originalEvent[name];
            }
          },
          set: function(value) {
            Object.defineProperty(this, name, {
              enumerable: true,
              configurable: true,
              writable: true,
              value
            });
          }
        });
      },
      fix: function(originalEvent) {
        return originalEvent[jQuery2.expando] ? originalEvent : new jQuery2.Event(originalEvent);
      },
      special: jQuery2.extend(/* @__PURE__ */ Object.create(null), {
        load: {
          // Prevent triggered image.load events from bubbling to window.load
          noBubble: true
        },
        click: {
          // Utilize native event to ensure correct state for checkable inputs
          setup: function(data2) {
            var el = this || data2;
            if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
              leverageNative(el, "click", true);
            }
            return false;
          },
          trigger: function(data2) {
            var el = this || data2;
            if (rcheckableType.test(el.type) && el.click && nodeName(el, "input")) {
              leverageNative(el, "click");
            }
            return true;
          },
          // For cross-browser consistency, suppress native .click() on links
          // Also prevent it if we're currently inside a leveraged native-event stack
          _default: function(event) {
            var target = event.target;
            return rcheckableType.test(target.type) && target.click && nodeName(target, "input") && dataPriv.get(target, "click") || nodeName(target, "a");
          }
        },
        beforeunload: {
          postDispatch: function(event) {
            if (event.result !== void 0 && event.originalEvent) {
              event.originalEvent.returnValue = event.result;
            }
          }
        }
      })
    };
    function leverageNative(el, type2, isSetup) {
      if (!isSetup) {
        if (dataPriv.get(el, type2) === void 0) {
          jQuery2.event.add(el, type2, returnTrue);
        }
        return;
      }
      dataPriv.set(el, type2, false);
      jQuery2.event.add(el, type2, {
        namespace: false,
        handler: function(event) {
          var result, saved = dataPriv.get(this, type2);
          if (event.isTrigger & 1 && this[type2]) {
            if (!saved.length) {
              saved = slice.call(arguments);
              dataPriv.set(this, type2, saved);
              this[type2]();
              result = dataPriv.get(this, type2);
              dataPriv.set(this, type2, false);
              if (saved !== result) {
                event.stopImmediatePropagation();
                event.preventDefault();
                return result && result.value;
              }
            } else if ((jQuery2.event.special[type2] || {}).delegateType) {
              event.stopPropagation();
            }
          } else if (saved.length) {
            dataPriv.set(this, type2, {
              value: jQuery2.event.trigger(
                saved[0],
                saved.slice(1),
                this
              )
            });
            event.stopPropagation();
            event.isImmediatePropagationStopped = returnTrue;
          }
        }
      });
    }
    jQuery2.removeEvent = function(elem, type2, handle) {
      if (elem.removeEventListener) {
        elem.removeEventListener(type2, handle);
      }
    };
    jQuery2.Event = function(src, props) {
      if (!(this instanceof jQuery2.Event)) {
        return new jQuery2.Event(src, props);
      }
      if (src && src.type) {
        this.originalEvent = src;
        this.type = src.type;
        this.isDefaultPrevented = src.defaultPrevented ? returnTrue : returnFalse;
        this.target = src.target;
        this.currentTarget = src.currentTarget;
        this.relatedTarget = src.relatedTarget;
      } else {
        this.type = src;
      }
      if (props) {
        jQuery2.extend(this, props);
      }
      this.timeStamp = src && src.timeStamp || Date.now();
      this[jQuery2.expando] = true;
    };
    jQuery2.Event.prototype = {
      constructor: jQuery2.Event,
      isDefaultPrevented: returnFalse,
      isPropagationStopped: returnFalse,
      isImmediatePropagationStopped: returnFalse,
      isSimulated: false,
      preventDefault: function() {
        var e = this.originalEvent;
        this.isDefaultPrevented = returnTrue;
        if (e && !this.isSimulated) {
          e.preventDefault();
        }
      },
      stopPropagation: function() {
        var e = this.originalEvent;
        this.isPropagationStopped = returnTrue;
        if (e && !this.isSimulated) {
          e.stopPropagation();
        }
      },
      stopImmediatePropagation: function() {
        var e = this.originalEvent;
        this.isImmediatePropagationStopped = returnTrue;
        if (e && !this.isSimulated) {
          e.stopImmediatePropagation();
        }
        this.stopPropagation();
      }
    };
    jQuery2.each({
      altKey: true,
      bubbles: true,
      cancelable: true,
      changedTouches: true,
      ctrlKey: true,
      detail: true,
      eventPhase: true,
      metaKey: true,
      pageX: true,
      pageY: true,
      shiftKey: true,
      view: true,
      "char": true,
      code: true,
      charCode: true,
      key: true,
      keyCode: true,
      button: true,
      buttons: true,
      clientX: true,
      clientY: true,
      offsetX: true,
      offsetY: true,
      pointerId: true,
      pointerType: true,
      screenX: true,
      screenY: true,
      targetTouches: true,
      toElement: true,
      touches: true,
      which: true
    }, jQuery2.event.addProp);
    jQuery2.each({ focus: "focusin", blur: "focusout" }, function(type2, delegateType) {
      function focusMappedHandler(nativeEvent) {
        var event = jQuery2.event.fix(nativeEvent);
        event.type = nativeEvent.type === "focusin" ? "focus" : "blur";
        event.isSimulated = true;
        if (event.target === event.currentTarget) {
          dataPriv.get(this, "handle")(event);
        }
      }
      jQuery2.event.special[type2] = {
        // Utilize native event if possible so blur/focus sequence is correct
        setup: function() {
          leverageNative(this, type2, true);
          if (isIE) {
            this.addEventListener(delegateType, focusMappedHandler);
          } else {
            return false;
          }
        },
        trigger: function() {
          leverageNative(this, type2);
          return true;
        },
        teardown: function() {
          if (isIE) {
            this.removeEventListener(delegateType, focusMappedHandler);
          } else {
            return false;
          }
        },
        // Suppress native focus or blur if we're currently inside
        // a leveraged native-event stack
        _default: function(event) {
          return dataPriv.get(event.target, type2);
        },
        delegateType
      };
    });
    jQuery2.each({
      mouseenter: "mouseover",
      mouseleave: "mouseout",
      pointerenter: "pointerover",
      pointerleave: "pointerout"
    }, function(orig, fix) {
      jQuery2.event.special[orig] = {
        delegateType: fix,
        bindType: fix,
        handle: function(event) {
          var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
          if (!related || related !== target && !jQuery2.contains(target, related)) {
            event.type = handleObj.origType;
            ret = handleObj.handler.apply(this, arguments);
            event.type = fix;
          }
          return ret;
        }
      };
    });
    jQuery2.fn.extend({
      on: function(types, selector, data2, fn) {
        return on(this, types, selector, data2, fn);
      },
      one: function(types, selector, data2, fn) {
        return on(this, types, selector, data2, fn, 1);
      },
      off: function(types, selector, fn) {
        var handleObj, type2;
        if (types && types.preventDefault && types.handleObj) {
          handleObj = types.handleObj;
          jQuery2(types.delegateTarget).off(
            handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
            handleObj.selector,
            handleObj.handler
          );
          return this;
        }
        if (typeof types === "object") {
          for (type2 in types) {
            this.off(type2, selector, types[type2]);
          }
          return this;
        }
        if (selector === false || typeof selector === "function") {
          fn = selector;
          selector = void 0;
        }
        if (fn === false) {
          fn = returnFalse;
        }
        return this.each(function() {
          jQuery2.event.remove(this, types, fn, selector);
        });
      }
    });
    var rnoInnerhtml = /<script|<style|<link/i;
    function manipulationTarget(elem, content) {
      if (nodeName(elem, "table") && nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr")) {
        return jQuery2(elem).children("tbody")[0] || elem;
      }
      return elem;
    }
    function cloneCopyEvent(src, dest) {
      var type2, i2, l, events = dataPriv.get(src, "events");
      if (dest.nodeType !== 1) {
        return;
      }
      if (events) {
        dataPriv.remove(dest, "handle events");
        for (type2 in events) {
          for (i2 = 0, l = events[type2].length; i2 < l; i2++) {
            jQuery2.event.add(dest, type2, events[type2][i2]);
          }
        }
      }
      if (dataUser.hasData(src)) {
        dataUser.set(dest, jQuery2.extend({}, dataUser.get(src)));
      }
    }
    function remove(elem, selector, keepData) {
      var node, nodes = selector ? jQuery2.filter(selector, elem) : elem, i2 = 0;
      for (; (node = nodes[i2]) != null; i2++) {
        if (!keepData && node.nodeType === 1) {
          jQuery2.cleanData(getAll(node));
        }
        if (node.parentNode) {
          if (keepData && isAttached(node)) {
            setGlobalEval(getAll(node, "script"));
          }
          node.parentNode.removeChild(node);
        }
      }
      return elem;
    }
    jQuery2.extend({
      htmlPrefilter: function(html) {
        return html;
      },
      clone: function(elem, dataAndEvents, deepDataAndEvents) {
        var i2, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = isAttached(elem);
        if (isIE && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery2.isXMLDoc(elem)) {
          destElements = getAll(clone);
          srcElements = getAll(elem);
          for (i2 = 0, l = srcElements.length; i2 < l; i2++) {
            if (nodeName(destElements[i2], "textarea")) {
              destElements[i2].defaultValue = srcElements[i2].defaultValue;
            }
          }
        }
        if (dataAndEvents) {
          if (deepDataAndEvents) {
            srcElements = srcElements || getAll(elem);
            destElements = destElements || getAll(clone);
            for (i2 = 0, l = srcElements.length; i2 < l; i2++) {
              cloneCopyEvent(srcElements[i2], destElements[i2]);
            }
          } else {
            cloneCopyEvent(elem, clone);
          }
        }
        destElements = getAll(clone, "script");
        if (destElements.length > 0) {
          setGlobalEval(destElements, !inPage && getAll(elem, "script"));
        }
        return clone;
      },
      cleanData: function(elems) {
        var data2, elem, type2, special = jQuery2.event.special, i2 = 0;
        for (; (elem = elems[i2]) !== void 0; i2++) {
          if (acceptData(elem)) {
            if (data2 = elem[dataPriv.expando]) {
              if (data2.events) {
                for (type2 in data2.events) {
                  if (special[type2]) {
                    jQuery2.event.remove(elem, type2);
                  } else {
                    jQuery2.removeEvent(elem, type2, data2.handle);
                  }
                }
              }
              elem[dataPriv.expando] = void 0;
            }
            if (elem[dataUser.expando]) {
              elem[dataUser.expando] = void 0;
            }
          }
        }
      }
    });
    jQuery2.fn.extend({
      detach: function(selector) {
        return remove(this, selector, true);
      },
      remove: function(selector) {
        return remove(this, selector);
      },
      text: function(value) {
        return access(this, function(value2) {
          return value2 === void 0 ? jQuery2.text(this) : this.empty().each(function() {
            if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
              this.textContent = value2;
            }
          });
        }, null, value, arguments.length);
      },
      append: function() {
        return domManip(this, arguments, function(elem) {
          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
            var target = manipulationTarget(this, elem);
            target.appendChild(elem);
          }
        });
      },
      prepend: function() {
        return domManip(this, arguments, function(elem) {
          if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
            var target = manipulationTarget(this, elem);
            target.insertBefore(elem, target.firstChild);
          }
        });
      },
      before: function() {
        return domManip(this, arguments, function(elem) {
          if (this.parentNode) {
            this.parentNode.insertBefore(elem, this);
          }
        });
      },
      after: function() {
        return domManip(this, arguments, function(elem) {
          if (this.parentNode) {
            this.parentNode.insertBefore(elem, this.nextSibling);
          }
        });
      },
      empty: function() {
        var elem, i2 = 0;
        for (; (elem = this[i2]) != null; i2++) {
          if (elem.nodeType === 1) {
            jQuery2.cleanData(getAll(elem, false));
            elem.textContent = "";
          }
        }
        return this;
      },
      clone: function(dataAndEvents, deepDataAndEvents) {
        dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
        deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
        return this.map(function() {
          return jQuery2.clone(this, dataAndEvents, deepDataAndEvents);
        });
      },
      html: function(value) {
        return access(this, function(value2) {
          var elem = this[0] || {}, i2 = 0, l = this.length;
          if (value2 === void 0 && elem.nodeType === 1) {
            return elem.innerHTML;
          }
          if (typeof value2 === "string" && !rnoInnerhtml.test(value2) && !wrapMap[(rtagName.exec(value2) || ["", ""])[1].toLowerCase()]) {
            value2 = jQuery2.htmlPrefilter(value2);
            try {
              for (; i2 < l; i2++) {
                elem = this[i2] || {};
                if (elem.nodeType === 1) {
                  jQuery2.cleanData(getAll(elem, false));
                  elem.innerHTML = value2;
                }
              }
              elem = 0;
            } catch (e) {
            }
          }
          if (elem) {
            this.empty().append(value2);
          }
        }, null, value, arguments.length);
      },
      replaceWith: function() {
        var ignored = [];
        return domManip(this, arguments, function(elem) {
          var parent = this.parentNode;
          if (jQuery2.inArray(this, ignored) < 0) {
            jQuery2.cleanData(getAll(this));
            if (parent) {
              parent.replaceChild(elem, this);
            }
          }
        }, ignored);
      }
    });
    jQuery2.each({
      appendTo: "append",
      prependTo: "prepend",
      insertBefore: "before",
      insertAfter: "after",
      replaceAll: "replaceWith"
    }, function(name, original) {
      jQuery2.fn[name] = function(selector) {
        var elems, ret = [], insert = jQuery2(selector), last = insert.length - 1, i2 = 0;
        for (; i2 <= last; i2++) {
          elems = i2 === last ? this : this.clone(true);
          jQuery2(insert[i2])[original](elems);
          push.apply(ret, elems);
        }
        return this.pushStack(ret);
      };
    });
    var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
    var rcustomProp = /^--/;
    function getStyles(elem) {
      var view = elem.ownerDocument.defaultView;
      if (!view) {
        view = window2;
      }
      return view.getComputedStyle(elem);
    }
    function swap(elem, options, callback) {
      var ret, name, old = {};
      for (name in options) {
        old[name] = elem.style[name];
        elem.style[name] = options[name];
      }
      ret = callback.call(elem);
      for (name in options) {
        elem.style[name] = old[name];
      }
      return ret;
    }
    function curCSS(elem, name, computed) {
      var ret, isCustomProp = rcustomProp.test(name);
      computed = computed || getStyles(elem);
      if (computed) {
        ret = computed.getPropertyValue(name) || computed[name];
        if (isCustomProp && ret) {
          ret = ret.replace(rtrimCSS, "$1") || void 0;
        }
        if (ret === "" && !isAttached(elem)) {
          ret = jQuery2.style(elem, name);
        }
      }
      return ret !== void 0 ? (
        // Support: IE <=9 - 11+
        // IE returns zIndex value as an integer.
        ret + ""
      ) : ret;
    }
    var cssPrefixes = ["Webkit", "Moz", "ms"], emptyStyle = document$1.createElement("div").style, vendorProps = {};
    function vendorPropName(name) {
      var capName = name[0].toUpperCase() + name.slice(1), i2 = cssPrefixes.length;
      while (i2--) {
        name = cssPrefixes[i2] + capName;
        if (name in emptyStyle) {
          return name;
        }
      }
    }
    function finalPropName(name) {
      var final = vendorProps[name];
      if (final) {
        return final;
      }
      if (name in emptyStyle) {
        return name;
      }
      return vendorProps[name] = vendorPropName(name) || name;
    }
    (function() {
      var reliableTrDimensionsVal, div = document$1.createElement("div");
      if (!div.style) {
        return;
      }
      support.reliableTrDimensions = function() {
        var table, tr, trStyle;
        if (reliableTrDimensionsVal == null) {
          table = document$1.createElement("table");
          tr = document$1.createElement("tr");
          table.style.cssText = "position:absolute;left:-11111px;border-collapse:separate";
          tr.style.cssText = "box-sizing:content-box;border:1px solid";
          tr.style.height = "1px";
          div.style.height = "9px";
          div.style.display = "block";
          documentElement$1.appendChild(table).appendChild(tr).appendChild(div);
          if (table.offsetWidth === 0) {
            documentElement$1.removeChild(table);
            return;
          }
          trStyle = window2.getComputedStyle(tr);
          reliableTrDimensionsVal = Math.round(parseFloat(trStyle.height)) + Math.round(parseFloat(trStyle.borderTopWidth)) + Math.round(parseFloat(trStyle.borderBottomWidth)) === tr.offsetHeight;
          documentElement$1.removeChild(table);
        }
        return reliableTrDimensionsVal;
      };
    })();
    var rdisplayswap = /^(none|table(?!-c[ea]).+)/, cssShow = { position: "absolute", visibility: "hidden", display: "block" }, cssNormalTransform = {
      letterSpacing: "0",
      fontWeight: "400"
    };
    function setPositiveNumber(_elem, value, subtract) {
      var matches2 = rcssNum.exec(value);
      return matches2 ? (
        // Guard against undefined "subtract", e.g., when used as in cssHooks
        Math.max(0, matches2[2] - (subtract || 0)) + (matches2[3] || "px")
      ) : value;
    }
    function boxModelAdjustment(elem, dimension, box, isBorderBox, styles, computedVal) {
      var i2 = dimension === "width" ? 1 : 0, extra = 0, delta = 0, marginDelta = 0;
      if (box === (isBorderBox ? "border" : "content")) {
        return 0;
      }
      for (; i2 < 4; i2 += 2) {
        if (box === "margin") {
          marginDelta += jQuery2.css(elem, box + cssExpand[i2], true, styles);
        }
        if (!isBorderBox) {
          delta += jQuery2.css(elem, "padding" + cssExpand[i2], true, styles);
          if (box !== "padding") {
            delta += jQuery2.css(elem, "border" + cssExpand[i2] + "Width", true, styles);
          } else {
            extra += jQuery2.css(elem, "border" + cssExpand[i2] + "Width", true, styles);
          }
        } else {
          if (box === "content") {
            delta -= jQuery2.css(elem, "padding" + cssExpand[i2], true, styles);
          }
          if (box !== "margin") {
            delta -= jQuery2.css(elem, "border" + cssExpand[i2] + "Width", true, styles);
          }
        }
      }
      if (!isBorderBox && computedVal >= 0) {
        delta += Math.max(0, Math.ceil(
          elem["offset" + dimension[0].toUpperCase() + dimension.slice(1)] - computedVal - delta - extra - 0.5
          // If offsetWidth/offsetHeight is unknown, then we can't determine content-box scroll gutter
          // Use an explicit zero to avoid NaN (gh-3964)
        )) || 0;
      }
      return delta + marginDelta;
    }
    function getWidthOrHeight(elem, dimension, extra) {
      var styles = getStyles(elem), boxSizingNeeded = isIE || extra, isBorderBox = boxSizingNeeded && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", valueIsBorderBox = isBorderBox, val = curCSS(elem, dimension, styles), offsetProp = "offset" + dimension[0].toUpperCase() + dimension.slice(1);
      if (rnumnonpx.test(val)) {
        if (!extra) {
          return val;
        }
        val = "auto";
      }
      if (
        // Fall back to offsetWidth/offsetHeight when value is "auto"
        // This happens for inline elements with no explicit setting (gh-3571)
        (val === "auto" || // Support: IE 9 - 11+
        // Use offsetWidth/offsetHeight for when box sizing is unreliable.
        // In those cases, the computed value can be trusted to be border-box.
        isIE && isBorderBox || // Support: IE 10 - 11+
        // IE misreports `getComputedStyle` of table rows with width/height
        // set in CSS while `offset*` properties report correct values.
        // Support: Firefox 70+
        // Firefox includes border widths
        // in computed dimensions for table rows. (gh-4529)
        !support.reliableTrDimensions() && nodeName(elem, "tr")) && // Make sure the element is visible & connected
        elem.getClientRects().length
      ) {
        isBorderBox = jQuery2.css(elem, "boxSizing", false, styles) === "border-box";
        valueIsBorderBox = offsetProp in elem;
        if (valueIsBorderBox) {
          val = elem[offsetProp];
        }
      }
      val = parseFloat(val) || 0;
      return val + boxModelAdjustment(
        elem,
        dimension,
        extra || (isBorderBox ? "border" : "content"),
        valueIsBorderBox,
        styles,
        // Provide the current computed size to request scroll gutter calculation (gh-3589)
        val
      ) + "px";
    }
    jQuery2.extend({
      // Add in style property hooks for overriding the default
      // behavior of getting and setting a style property
      cssHooks: {},
      // Get and set the style property on a DOM Node
      style: function(elem, name, value, extra) {
        if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
          return;
        }
        var ret, type2, hooks, origName = cssCamelCase(name), isCustomProp = rcustomProp.test(name), style = elem.style;
        if (!isCustomProp) {
          name = finalPropName(origName);
        }
        hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
        if (value !== void 0) {
          type2 = typeof value;
          if (type2 === "string" && (ret = rcssNum.exec(value)) && ret[1]) {
            value = adjustCSS(elem, name, ret);
            type2 = "number";
          }
          if (value == null || value !== value) {
            return;
          }
          if (type2 === "number") {
            value += ret && ret[3] || (isAutoPx(origName) ? "px" : "");
          }
          if (isIE && value === "" && name.indexOf("background") === 0) {
            style[name] = "inherit";
          }
          if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== void 0) {
            if (isCustomProp) {
              style.setProperty(name, value);
            } else {
              style[name] = value;
            }
          }
        } else {
          if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== void 0) {
            return ret;
          }
          return style[name];
        }
      },
      css: function(elem, name, extra, styles) {
        var val, num, hooks, origName = cssCamelCase(name), isCustomProp = rcustomProp.test(name);
        if (!isCustomProp) {
          name = finalPropName(origName);
        }
        hooks = jQuery2.cssHooks[name] || jQuery2.cssHooks[origName];
        if (hooks && "get" in hooks) {
          val = hooks.get(elem, true, extra);
        }
        if (val === void 0) {
          val = curCSS(elem, name, styles);
        }
        if (val === "normal" && name in cssNormalTransform) {
          val = cssNormalTransform[name];
        }
        if (extra === "" || extra) {
          num = parseFloat(val);
          return extra === true || isFinite(num) ? num || 0 : val;
        }
        return val;
      }
    });
    jQuery2.each(["height", "width"], function(_i, dimension) {
      jQuery2.cssHooks[dimension] = {
        get: function(elem, computed, extra) {
          if (computed) {
            return rdisplayswap.test(jQuery2.css(elem, "display")) && // Support: Safari <=8 - 12+, Chrome <=73+
            // Table columns in WebKit/Blink have non-zero offsetWidth & zero
            // getBoundingClientRect().width unless display is changed.
            // Support: IE <=11+
            // Running getBoundingClientRect on a disconnected node
            // in IE throws an error.
            (!elem.getClientRects().length || !elem.getBoundingClientRect().width) ? swap(elem, cssShow, function() {
              return getWidthOrHeight(elem, dimension, extra);
            }) : getWidthOrHeight(elem, dimension, extra);
          }
        },
        set: function(elem, value, extra) {
          var matches2, styles = getStyles(elem), isBorderBox = extra && jQuery2.css(elem, "boxSizing", false, styles) === "border-box", subtract = extra ? boxModelAdjustment(
            elem,
            dimension,
            extra,
            isBorderBox,
            styles
          ) : 0;
          if (subtract && (matches2 = rcssNum.exec(value)) && (matches2[3] || "px") !== "px") {
            elem.style[dimension] = value;
            value = jQuery2.css(elem, dimension);
          }
          return setPositiveNumber(elem, value, subtract);
        }
      };
    });
    jQuery2.each({
      margin: "",
      padding: "",
      border: "Width"
    }, function(prefix, suffix) {
      jQuery2.cssHooks[prefix + suffix] = {
        expand: function(value) {
          var i2 = 0, expanded = {}, parts = typeof value === "string" ? value.split(" ") : [value];
          for (; i2 < 4; i2++) {
            expanded[prefix + cssExpand[i2] + suffix] = parts[i2] || parts[i2 - 2] || parts[0];
          }
          return expanded;
        }
      };
      if (prefix !== "margin") {
        jQuery2.cssHooks[prefix + suffix].set = setPositiveNumber;
      }
    });
    jQuery2.fn.extend({
      css: function(name, value) {
        return access(this, function(elem, name2, value2) {
          var styles, len, map = {}, i2 = 0;
          if (Array.isArray(name2)) {
            styles = getStyles(elem);
            len = name2.length;
            for (; i2 < len; i2++) {
              map[name2[i2]] = jQuery2.css(elem, name2[i2], false, styles);
            }
            return map;
          }
          return value2 !== void 0 ? jQuery2.style(elem, name2, value2) : jQuery2.css(elem, name2);
        }, name, value, arguments.length > 1);
      }
    });
    function Tween(elem, options, prop, end, easing) {
      return new Tween.prototype.init(elem, options, prop, end, easing);
    }
    jQuery2.Tween = Tween;
    Tween.prototype = {
      constructor: Tween,
      init: function(elem, options, prop, end, easing, unit) {
        this.elem = elem;
        this.prop = prop;
        this.easing = easing || jQuery2.easing._default;
        this.options = options;
        this.start = this.now = this.cur();
        this.end = end;
        this.unit = unit || (isAutoPx(prop) ? "px" : "");
      },
      cur: function() {
        var hooks = Tween.propHooks[this.prop];
        return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
      },
      run: function(percent) {
        var eased, hooks = Tween.propHooks[this.prop];
        if (this.options.duration) {
          this.pos = eased = jQuery2.easing[this.easing](
            percent,
            this.options.duration * percent,
            0,
            1,
            this.options.duration
          );
        } else {
          this.pos = eased = percent;
        }
        this.now = (this.end - this.start) * eased + this.start;
        if (this.options.step) {
          this.options.step.call(this.elem, this.now, this);
        }
        if (hooks && hooks.set) {
          hooks.set(this);
        } else {
          Tween.propHooks._default.set(this);
        }
        return this;
      }
    };
    Tween.prototype.init.prototype = Tween.prototype;
    Tween.propHooks = {
      _default: {
        get: function(tween) {
          var result;
          if (tween.elem.nodeType !== 1 || tween.elem[tween.prop] != null && tween.elem.style[tween.prop] == null) {
            return tween.elem[tween.prop];
          }
          result = jQuery2.css(tween.elem, tween.prop, "");
          return !result || result === "auto" ? 0 : result;
        },
        set: function(tween) {
          if (jQuery2.fx.step[tween.prop]) {
            jQuery2.fx.step[tween.prop](tween);
          } else if (tween.elem.nodeType === 1 && (jQuery2.cssHooks[tween.prop] || tween.elem.style[finalPropName(tween.prop)] != null)) {
            jQuery2.style(tween.elem, tween.prop, tween.now + tween.unit);
          } else {
            tween.elem[tween.prop] = tween.now;
          }
        }
      }
    };
    jQuery2.easing = {
      linear: function(p) {
        return p;
      },
      swing: function(p) {
        return 0.5 - Math.cos(p * Math.PI) / 2;
      },
      _default: "swing"
    };
    jQuery2.fx = Tween.prototype.init;
    jQuery2.fx.step = {};
    var fxNow, inProgress, rfxtypes = /^(?:toggle|show|hide)$/, rrun = /queueHooks$/;
    function schedule() {
      if (inProgress) {
        if (document$1.hidden === false && window2.requestAnimationFrame) {
          window2.requestAnimationFrame(schedule);
        } else {
          window2.setTimeout(schedule, 13);
        }
        jQuery2.fx.tick();
      }
    }
    function createFxNow() {
      window2.setTimeout(function() {
        fxNow = void 0;
      });
      return fxNow = Date.now();
    }
    function genFx(type2, includeWidth) {
      var which, i2 = 0, attrs = { height: type2 };
      includeWidth = includeWidth ? 1 : 0;
      for (; i2 < 4; i2 += 2 - includeWidth) {
        which = cssExpand[i2];
        attrs["margin" + which] = attrs["padding" + which] = type2;
      }
      if (includeWidth) {
        attrs.opacity = attrs.width = type2;
      }
      return attrs;
    }
    function createTween(value, prop, animation) {
      var tween, collection = (Animation.tweeners[prop] || []).concat(Animation.tweeners["*"]), index = 0, length = collection.length;
      for (; index < length; index++) {
        if (tween = collection[index].call(animation, prop, value)) {
          return tween;
        }
      }
    }
    function defaultPrefilter(elem, props, opts) {
      var prop, value, toggle, hooks, oldfire, propTween, restoreDisplay, display, isBox = "width" in props || "height" in props, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHiddenWithinTree(elem), dataShow = dataPriv.get(elem, "fxshow");
      if (!opts.queue) {
        hooks = jQuery2._queueHooks(elem, "fx");
        if (hooks.unqueued == null) {
          hooks.unqueued = 0;
          oldfire = hooks.empty.fire;
          hooks.empty.fire = function() {
            if (!hooks.unqueued) {
              oldfire();
            }
          };
        }
        hooks.unqueued++;
        anim.always(function() {
          anim.always(function() {
            hooks.unqueued--;
            if (!jQuery2.queue(elem, "fx").length) {
              hooks.empty.fire();
            }
          });
        });
      }
      for (prop in props) {
        value = props[prop];
        if (rfxtypes.test(value)) {
          delete props[prop];
          toggle = toggle || value === "toggle";
          if (value === (hidden ? "hide" : "show")) {
            if (value === "show" && dataShow && dataShow[prop] !== void 0) {
              hidden = true;
            } else {
              continue;
            }
          }
          orig[prop] = dataShow && dataShow[prop] || jQuery2.style(elem, prop);
        }
      }
      propTween = !jQuery2.isEmptyObject(props);
      if (!propTween && jQuery2.isEmptyObject(orig)) {
        return;
      }
      if (isBox && elem.nodeType === 1) {
        opts.overflow = [style.overflow, style.overflowX, style.overflowY];
        restoreDisplay = dataShow && dataShow.display;
        if (restoreDisplay == null) {
          restoreDisplay = dataPriv.get(elem, "display");
        }
        display = jQuery2.css(elem, "display");
        if (display === "none") {
          if (restoreDisplay) {
            display = restoreDisplay;
          } else {
            showHide([elem], true);
            restoreDisplay = elem.style.display || restoreDisplay;
            display = jQuery2.css(elem, "display");
            showHide([elem]);
          }
        }
        if (display === "inline" || display === "inline-block" && restoreDisplay != null) {
          if (jQuery2.css(elem, "float") === "none") {
            if (!propTween) {
              anim.done(function() {
                style.display = restoreDisplay;
              });
              if (restoreDisplay == null) {
                display = style.display;
                restoreDisplay = display === "none" ? "" : display;
              }
            }
            style.display = "inline-block";
          }
        }
      }
      if (opts.overflow) {
        style.overflow = "hidden";
        anim.always(function() {
          style.overflow = opts.overflow[0];
          style.overflowX = opts.overflow[1];
          style.overflowY = opts.overflow[2];
        });
      }
      propTween = false;
      for (prop in orig) {
        if (!propTween) {
          if (dataShow) {
            if ("hidden" in dataShow) {
              hidden = dataShow.hidden;
            }
          } else {
            dataShow = dataPriv.set(elem, "fxshow", { display: restoreDisplay });
          }
          if (toggle) {
            dataShow.hidden = !hidden;
          }
          if (hidden) {
            showHide([elem], true);
          }
          anim.done(function() {
            if (!hidden) {
              showHide([elem]);
            }
            dataPriv.remove(elem, "fxshow");
            for (prop in orig) {
              jQuery2.style(elem, prop, orig[prop]);
            }
          });
        }
        propTween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
        if (!(prop in dataShow)) {
          dataShow[prop] = propTween.start;
          if (hidden) {
            propTween.end = propTween.start;
            propTween.start = 0;
          }
        }
      }
    }
    function propFilter(props, specialEasing) {
      var index, name, easing, value, hooks;
      for (index in props) {
        name = cssCamelCase(index);
        easing = specialEasing[name];
        value = props[index];
        if (Array.isArray(value)) {
          easing = value[1];
          value = props[index] = value[0];
        }
        if (index !== name) {
          props[name] = value;
          delete props[index];
        }
        hooks = jQuery2.cssHooks[name];
        if (hooks && "expand" in hooks) {
          value = hooks.expand(value);
          delete props[name];
          for (index in value) {
            if (!(index in props)) {
              props[index] = value[index];
              specialEasing[index] = easing;
            }
          }
        } else {
          specialEasing[name] = easing;
        }
      }
    }
    function Animation(elem, properties2, options) {
      var result, stopped, index = 0, length = Animation.prefilters.length, deferred = jQuery2.Deferred().always(function() {
        delete tick.elem;
      }), tick = function() {
        if (stopped) {
          return false;
        }
        var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), percent = 1 - (remaining / animation.duration || 0), index2 = 0, length2 = animation.tweens.length;
        for (; index2 < length2; index2++) {
          animation.tweens[index2].run(percent);
        }
        deferred.notifyWith(elem, [animation, percent, remaining]);
        if (percent < 1 && length2) {
          return remaining;
        }
        if (!length2) {
          deferred.notifyWith(elem, [animation, 1, 0]);
        }
        deferred.resolveWith(elem, [animation]);
        return false;
      }, animation = deferred.promise({
        elem,
        props: jQuery2.extend({}, properties2),
        opts: jQuery2.extend(true, {
          specialEasing: {},
          easing: jQuery2.easing._default
        }, options),
        originalProperties: properties2,
        originalOptions: options,
        startTime: fxNow || createFxNow(),
        duration: options.duration,
        tweens: [],
        createTween: function(prop, end) {
          var tween = jQuery2.Tween(
            elem,
            animation.opts,
            prop,
            end,
            animation.opts.specialEasing[prop] || animation.opts.easing
          );
          animation.tweens.push(tween);
          return tween;
        },
        stop: function(gotoEnd) {
          var index2 = 0, length2 = gotoEnd ? animation.tweens.length : 0;
          if (stopped) {
            return this;
          }
          stopped = true;
          for (; index2 < length2; index2++) {
            animation.tweens[index2].run(1);
          }
          if (gotoEnd) {
            deferred.notifyWith(elem, [animation, 1, 0]);
            deferred.resolveWith(elem, [animation, gotoEnd]);
          } else {
            deferred.rejectWith(elem, [animation, gotoEnd]);
          }
          return this;
        }
      }), props = animation.props;
      propFilter(props, animation.opts.specialEasing);
      for (; index < length; index++) {
        result = Animation.prefilters[index].call(animation, elem, props, animation.opts);
        if (result) {
          if (typeof result.stop === "function") {
            jQuery2._queueHooks(animation.elem, animation.opts.queue).stop = result.stop.bind(result);
          }
          return result;
        }
      }
      jQuery2.map(props, createTween, animation);
      if (typeof animation.opts.start === "function") {
        animation.opts.start.call(elem, animation);
      }
      animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
      jQuery2.fx.timer(
        jQuery2.extend(tick, {
          elem,
          anim: animation,
          queue: animation.opts.queue
        })
      );
      return animation;
    }
    jQuery2.Animation = jQuery2.extend(Animation, {
      tweeners: {
        "*": [function(prop, value) {
          var tween = this.createTween(prop, value);
          adjustCSS(tween.elem, prop, rcssNum.exec(value), tween);
          return tween;
        }]
      },
      tweener: function(props, callback) {
        if (typeof props === "function") {
          callback = props;
          props = ["*"];
        } else {
          props = props.match(rnothtmlwhite);
        }
        var prop, index = 0, length = props.length;
        for (; index < length; index++) {
          prop = props[index];
          Animation.tweeners[prop] = Animation.tweeners[prop] || [];
          Animation.tweeners[prop].unshift(callback);
        }
      },
      prefilters: [defaultPrefilter],
      prefilter: function(callback, prepend) {
        if (prepend) {
          Animation.prefilters.unshift(callback);
        } else {
          Animation.prefilters.push(callback);
        }
      }
    });
    jQuery2.speed = function(speed, easing, fn) {
      var opt = speed && typeof speed === "object" ? jQuery2.extend({}, speed) : {
        complete: fn || easing || typeof speed === "function" && speed,
        duration: speed,
        easing: fn && easing || easing && typeof easing !== "function" && easing
      };
      if (jQuery2.fx.off) {
        opt.duration = 0;
      } else {
        if (typeof opt.duration !== "number") {
          if (opt.duration in jQuery2.fx.speeds) {
            opt.duration = jQuery2.fx.speeds[opt.duration];
          } else {
            opt.duration = jQuery2.fx.speeds._default;
          }
        }
      }
      if (opt.queue == null || opt.queue === true) {
        opt.queue = "fx";
      }
      opt.old = opt.complete;
      opt.complete = function() {
        if (typeof opt.old === "function") {
          opt.old.call(this);
        }
        if (opt.queue) {
          jQuery2.dequeue(this, opt.queue);
        }
      };
      return opt;
    };
    jQuery2.fn.extend({
      fadeTo: function(speed, to, easing, callback) {
        return this.filter(isHiddenWithinTree).css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
      },
      animate: function(prop, speed, easing, callback) {
        var empty = jQuery2.isEmptyObject(prop), optall = jQuery2.speed(speed, easing, callback), doAnimation = function() {
          var anim = Animation(this, jQuery2.extend({}, prop), optall);
          if (empty || dataPriv.get(this, "finish")) {
            anim.stop(true);
          }
        };
        doAnimation.finish = doAnimation;
        return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
      },
      stop: function(type2, clearQueue, gotoEnd) {
        var stopQueue = function(hooks) {
          var stop = hooks.stop;
          delete hooks.stop;
          stop(gotoEnd);
        };
        if (typeof type2 !== "string") {
          gotoEnd = clearQueue;
          clearQueue = type2;
          type2 = void 0;
        }
        if (clearQueue) {
          this.queue(type2 || "fx", []);
        }
        return this.each(function() {
          var dequeue = true, index = type2 != null && type2 + "queueHooks", timers = jQuery2.timers, data2 = dataPriv.get(this);
          if (index) {
            if (data2[index] && data2[index].stop) {
              stopQueue(data2[index]);
            }
          } else {
            for (index in data2) {
              if (data2[index] && data2[index].stop && rrun.test(index)) {
                stopQueue(data2[index]);
              }
            }
          }
          for (index = timers.length; index--; ) {
            if (timers[index].elem === this && (type2 == null || timers[index].queue === type2)) {
              timers[index].anim.stop(gotoEnd);
              dequeue = false;
              timers.splice(index, 1);
            }
          }
          if (dequeue || !gotoEnd) {
            jQuery2.dequeue(this, type2);
          }
        });
      },
      finish: function(type2) {
        if (type2 !== false) {
          type2 = type2 || "fx";
        }
        return this.each(function() {
          var index, data2 = dataPriv.get(this), queue = data2[type2 + "queue"], hooks = data2[type2 + "queueHooks"], timers = jQuery2.timers, length = queue ? queue.length : 0;
          data2.finish = true;
          jQuery2.queue(this, type2, []);
          if (hooks && hooks.stop) {
            hooks.stop.call(this, true);
          }
          for (index = timers.length; index--; ) {
            if (timers[index].elem === this && timers[index].queue === type2) {
              timers[index].anim.stop(true);
              timers.splice(index, 1);
            }
          }
          for (index = 0; index < length; index++) {
            if (queue[index] && queue[index].finish) {
              queue[index].finish.call(this);
            }
          }
          delete data2.finish;
        });
      }
    });
    jQuery2.each(["toggle", "show", "hide"], function(_i, name) {
      var cssFn = jQuery2.fn[name];
      jQuery2.fn[name] = function(speed, easing, callback) {
        return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
      };
    });
    jQuery2.each({
      slideDown: genFx("show"),
      slideUp: genFx("hide"),
      slideToggle: genFx("toggle"),
      fadeIn: { opacity: "show" },
      fadeOut: { opacity: "hide" },
      fadeToggle: { opacity: "toggle" }
    }, function(name, props) {
      jQuery2.fn[name] = function(speed, easing, callback) {
        return this.animate(props, speed, easing, callback);
      };
    });
    jQuery2.timers = [];
    jQuery2.fx.tick = function() {
      var timer, i2 = 0, timers = jQuery2.timers;
      fxNow = Date.now();
      for (; i2 < timers.length; i2++) {
        timer = timers[i2];
        if (!timer() && timers[i2] === timer) {
          timers.splice(i2--, 1);
        }
      }
      if (!timers.length) {
        jQuery2.fx.stop();
      }
      fxNow = void 0;
    };
    jQuery2.fx.timer = function(timer) {
      jQuery2.timers.push(timer);
      jQuery2.fx.start();
    };
    jQuery2.fx.start = function() {
      if (inProgress) {
        return;
      }
      inProgress = true;
      schedule();
    };
    jQuery2.fx.stop = function() {
      inProgress = null;
    };
    jQuery2.fx.speeds = {
      slow: 600,
      fast: 200,
      // Default speed
      _default: 400
    };
    jQuery2.fn.delay = function(time2, type2) {
      time2 = jQuery2.fx ? jQuery2.fx.speeds[time2] || time2 : time2;
      type2 = type2 || "fx";
      return this.queue(type2, function(next, hooks) {
        var timeout = window2.setTimeout(next, time2);
        hooks.stop = function() {
          window2.clearTimeout(timeout);
        };
      });
    };
    var rfocusable = /^(?:input|select|textarea|button)$/i, rclickable = /^(?:a|area)$/i;
    jQuery2.fn.extend({
      prop: function(name, value) {
        return access(this, jQuery2.prop, name, value, arguments.length > 1);
      },
      removeProp: function(name) {
        return this.each(function() {
          delete this[jQuery2.propFix[name] || name];
        });
      }
    });
    jQuery2.extend({
      prop: function(elem, name, value) {
        var ret, hooks, nType = elem.nodeType;
        if (nType === 3 || nType === 8 || nType === 2) {
          return;
        }
        if (nType !== 1 || !jQuery2.isXMLDoc(elem)) {
          name = jQuery2.propFix[name] || name;
          hooks = jQuery2.propHooks[name];
        }
        if (value !== void 0) {
          if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
            return ret;
          }
          return elem[name] = value;
        }
        if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
          return ret;
        }
        return elem[name];
      },
      propHooks: {
        tabIndex: {
          get: function(elem) {
            var tabindex = elem.getAttribute("tabindex");
            if (tabindex) {
              return parseInt(tabindex, 10);
            }
            if (rfocusable.test(elem.nodeName) || // href-less anchor's `tabIndex` property value is `0` and
            // the `tabindex` attribute value: `null`. We want `-1`.
            rclickable.test(elem.nodeName) && elem.href) {
              return 0;
            }
            return -1;
          }
        }
      },
      propFix: {
        "for": "htmlFor",
        "class": "className"
      }
    });
    if (isIE) {
      jQuery2.propHooks.selected = {
        get: function(elem) {
          var parent = elem.parentNode;
          if (parent && parent.parentNode) {
            parent.parentNode.selectedIndex;
          }
          return null;
        },
        set: function(elem) {
          var parent = elem.parentNode;
          if (parent) {
            parent.selectedIndex;
            if (parent.parentNode) {
              parent.parentNode.selectedIndex;
            }
          }
        }
      };
    }
    jQuery2.each([
      "tabIndex",
      "readOnly",
      "maxLength",
      "cellSpacing",
      "cellPadding",
      "rowSpan",
      "colSpan",
      "useMap",
      "frameBorder",
      "contentEditable"
    ], function() {
      jQuery2.propFix[this.toLowerCase()] = this;
    });
    function stripAndCollapse(value) {
      var tokens = value.match(rnothtmlwhite) || [];
      return tokens.join(" ");
    }
    function getClass(elem) {
      return elem.getAttribute && elem.getAttribute("class") || "";
    }
    function classesToArray(value) {
      if (Array.isArray(value)) {
        return value;
      }
      if (typeof value === "string") {
        return value.match(rnothtmlwhite) || [];
      }
      return [];
    }
    jQuery2.fn.extend({
      addClass: function(value) {
        var classNames, cur, curValue, className, i2, finalValue;
        if (typeof value === "function") {
          return this.each(function(j) {
            jQuery2(this).addClass(value.call(this, j, getClass(this)));
          });
        }
        classNames = classesToArray(value);
        if (classNames.length) {
          return this.each(function() {
            curValue = getClass(this);
            cur = this.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
            if (cur) {
              for (i2 = 0; i2 < classNames.length; i2++) {
                className = classNames[i2];
                if (cur.indexOf(" " + className + " ") < 0) {
                  cur += className + " ";
                }
              }
              finalValue = stripAndCollapse(cur);
              if (curValue !== finalValue) {
                this.setAttribute("class", finalValue);
              }
            }
          });
        }
        return this;
      },
      removeClass: function(value) {
        var classNames, cur, curValue, className, i2, finalValue;
        if (typeof value === "function") {
          return this.each(function(j) {
            jQuery2(this).removeClass(value.call(this, j, getClass(this)));
          });
        }
        if (!arguments.length) {
          return this.attr("class", "");
        }
        classNames = classesToArray(value);
        if (classNames.length) {
          return this.each(function() {
            curValue = getClass(this);
            cur = this.nodeType === 1 && " " + stripAndCollapse(curValue) + " ";
            if (cur) {
              for (i2 = 0; i2 < classNames.length; i2++) {
                className = classNames[i2];
                while (cur.indexOf(" " + className + " ") > -1) {
                  cur = cur.replace(" " + className + " ", " ");
                }
              }
              finalValue = stripAndCollapse(cur);
              if (curValue !== finalValue) {
                this.setAttribute("class", finalValue);
              }
            }
          });
        }
        return this;
      },
      toggleClass: function(value, stateVal) {
        var classNames, className, i2, self2;
        if (typeof value === "function") {
          return this.each(function(i3) {
            jQuery2(this).toggleClass(
              value.call(this, i3, getClass(this), stateVal),
              stateVal
            );
          });
        }
        if (typeof stateVal === "boolean") {
          return stateVal ? this.addClass(value) : this.removeClass(value);
        }
        classNames = classesToArray(value);
        if (classNames.length) {
          return this.each(function() {
            self2 = jQuery2(this);
            for (i2 = 0; i2 < classNames.length; i2++) {
              className = classNames[i2];
              if (self2.hasClass(className)) {
                self2.removeClass(className);
              } else {
                self2.addClass(className);
              }
            }
          });
        }
        return this;
      },
      hasClass: function(selector) {
        var className, elem, i2 = 0;
        className = " " + selector + " ";
        while (elem = this[i2++]) {
          if (elem.nodeType === 1 && (" " + stripAndCollapse(getClass(elem)) + " ").indexOf(className) > -1) {
            return true;
          }
        }
        return false;
      }
    });
    jQuery2.fn.extend({
      val: function(value) {
        var hooks, ret, valueIsFunction, elem = this[0];
        if (!arguments.length) {
          if (elem) {
            hooks = jQuery2.valHooks[elem.type] || jQuery2.valHooks[elem.nodeName.toLowerCase()];
            if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== void 0) {
              return ret;
            }
            ret = elem.value;
            return ret == null ? "" : ret;
          }
          return;
        }
        valueIsFunction = typeof value === "function";
        return this.each(function(i2) {
          var val;
          if (this.nodeType !== 1) {
            return;
          }
          if (valueIsFunction) {
            val = value.call(this, i2, jQuery2(this).val());
          } else {
            val = value;
          }
          if (val == null) {
            val = "";
          } else if (typeof val === "number") {
            val += "";
          } else if (Array.isArray(val)) {
            val = jQuery2.map(val, function(value2) {
              return value2 == null ? "" : value2 + "";
            });
          }
          hooks = jQuery2.valHooks[this.type] || jQuery2.valHooks[this.nodeName.toLowerCase()];
          if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === void 0) {
            this.value = val;
          }
        });
      }
    });
    jQuery2.extend({
      valHooks: {
        select: {
          get: function(elem) {
            var value, option, i2, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one", values = one ? null : [], max = one ? index + 1 : options.length;
            if (index < 0) {
              i2 = max;
            } else {
              i2 = one ? index : 0;
            }
            for (; i2 < max; i2++) {
              option = options[i2];
              if (option.selected && // Don't return options that are disabled or in a disabled optgroup
              !option.disabled && (!option.parentNode.disabled || !nodeName(option.parentNode, "optgroup"))) {
                value = jQuery2(option).val();
                if (one) {
                  return value;
                }
                values.push(value);
              }
            }
            return values;
          },
          set: function(elem, value) {
            var optionSet, option, options = elem.options, values = jQuery2.makeArray(value), i2 = options.length;
            while (i2--) {
              option = options[i2];
              if (option.selected = jQuery2.inArray(jQuery2(option).val(), values) > -1) {
                optionSet = true;
              }
            }
            if (!optionSet) {
              elem.selectedIndex = -1;
            }
            return values;
          }
        }
      }
    });
    if (isIE) {
      jQuery2.valHooks.option = {
        get: function(elem) {
          var val = elem.getAttribute("value");
          return val != null ? val : (
            // Support: IE <=10 - 11+
            // option.text throws exceptions (trac-14686, trac-14858)
            // Strip and collapse whitespace
            // https://html.spec.whatwg.org/#strip-and-collapse-whitespace
            stripAndCollapse(jQuery2.text(elem))
          );
        }
      };
    }
    jQuery2.each(["radio", "checkbox"], function() {
      jQuery2.valHooks[this] = {
        set: function(elem, value) {
          if (Array.isArray(value)) {
            return elem.checked = jQuery2.inArray(jQuery2(elem).val(), value) > -1;
          }
        }
      };
    });
    var rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, stopPropagationCallback = function(e) {
      e.stopPropagation();
    };
    jQuery2.extend(jQuery2.event, {
      trigger: function(event, data2, elem, onlyHandlers) {
        var i2, cur, tmp, bubbleType, ontype, handle, special, lastElement, eventPath = [elem || document$1], type2 = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
        cur = lastElement = tmp = elem = elem || document$1;
        if (elem.nodeType === 3 || elem.nodeType === 8) {
          return;
        }
        if (rfocusMorph.test(type2 + jQuery2.event.triggered)) {
          return;
        }
        if (type2.indexOf(".") > -1) {
          namespaces = type2.split(".");
          type2 = namespaces.shift();
          namespaces.sort();
        }
        ontype = type2.indexOf(":") < 0 && "on" + type2;
        event = event[jQuery2.expando] ? event : new jQuery2.Event(type2, typeof event === "object" && event);
        event.isTrigger = onlyHandlers ? 2 : 3;
        event.namespace = namespaces.join(".");
        event.rnamespace = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
        event.result = void 0;
        if (!event.target) {
          event.target = elem;
        }
        data2 = data2 == null ? [event] : jQuery2.makeArray(data2, [event]);
        special = jQuery2.event.special[type2] || {};
        if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data2) === false) {
          return;
        }
        if (!onlyHandlers && !special.noBubble && !isWindow(elem)) {
          bubbleType = special.delegateType || type2;
          if (!rfocusMorph.test(bubbleType + type2)) {
            cur = cur.parentNode;
          }
          for (; cur; cur = cur.parentNode) {
            eventPath.push(cur);
            tmp = cur;
          }
          if (tmp === (elem.ownerDocument || document$1)) {
            eventPath.push(tmp.defaultView || tmp.parentWindow || window2);
          }
        }
        i2 = 0;
        while ((cur = eventPath[i2++]) && !event.isPropagationStopped()) {
          lastElement = cur;
          event.type = i2 > 1 ? bubbleType : special.bindType || type2;
          handle = (dataPriv.get(cur, "events") || /* @__PURE__ */ Object.create(null))[event.type] && dataPriv.get(cur, "handle");
          if (handle) {
            handle.apply(cur, data2);
          }
          handle = ontype && cur[ontype];
          if (handle && handle.apply && acceptData(cur)) {
            event.result = handle.apply(cur, data2);
            if (event.result === false) {
              event.preventDefault();
            }
          }
        }
        event.type = type2;
        if (!onlyHandlers && !event.isDefaultPrevented()) {
          if ((!special._default || special._default.apply(eventPath.pop(), data2) === false) && acceptData(elem)) {
            if (ontype && typeof elem[type2] === "function" && !isWindow(elem)) {
              tmp = elem[ontype];
              if (tmp) {
                elem[ontype] = null;
              }
              jQuery2.event.triggered = type2;
              if (event.isPropagationStopped()) {
                lastElement.addEventListener(type2, stopPropagationCallback);
              }
              elem[type2]();
              if (event.isPropagationStopped()) {
                lastElement.removeEventListener(type2, stopPropagationCallback);
              }
              jQuery2.event.triggered = void 0;
              if (tmp) {
                elem[ontype] = tmp;
              }
            }
          }
        }
        return event.result;
      },
      // Piggyback on a donor event to simulate a different one
      // Used only for `focus(in | out)` events
      simulate: function(type2, elem, event) {
        var e = jQuery2.extend(
          new jQuery2.Event(),
          event,
          {
            type: type2,
            isSimulated: true
          }
        );
        jQuery2.event.trigger(e, null, elem);
      }
    });
    jQuery2.fn.extend({
      trigger: function(type2, data2) {
        return this.each(function() {
          jQuery2.event.trigger(type2, data2, this);
        });
      },
      triggerHandler: function(type2, data2) {
        var elem = this[0];
        if (elem) {
          return jQuery2.event.trigger(type2, data2, elem, true);
        }
      }
    });
    var location2 = window2.location;
    var nonce = { guid: Date.now() };
    var rquery = /\?/;
    jQuery2.parseXML = function(data2) {
      var xml, parserErrorElem;
      if (!data2 || typeof data2 !== "string") {
        return null;
      }
      try {
        xml = new window2.DOMParser().parseFromString(data2, "text/xml");
      } catch (e) {
      }
      parserErrorElem = xml && xml.getElementsByTagName("parsererror")[0];
      if (!xml || parserErrorElem) {
        jQuery2.error("Invalid XML: " + (parserErrorElem ? jQuery2.map(parserErrorElem.childNodes, function(el) {
          return el.textContent;
        }).join("\n") : data2));
      }
      return xml;
    };
    var rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
    function buildParams(prefix, obj, traditional, add) {
      var name;
      if (Array.isArray(obj)) {
        jQuery2.each(obj, function(i2, v) {
          if (traditional || rbracket.test(prefix)) {
            add(prefix, v);
          } else {
            buildParams(
              prefix + "[" + (typeof v === "object" && v != null ? i2 : "") + "]",
              v,
              traditional,
              add
            );
          }
        });
      } else if (!traditional && toType(obj) === "object") {
        for (name in obj) {
          buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
        }
      } else {
        add(prefix, obj);
      }
    }
    jQuery2.param = function(a, traditional) {
      var prefix, s = [], add = function(key, valueOrFunction) {
        var value = typeof valueOrFunction === "function" ? valueOrFunction() : valueOrFunction;
        s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value == null ? "" : value);
      };
      if (a == null) {
        return "";
      }
      if (Array.isArray(a) || a.jquery && !jQuery2.isPlainObject(a)) {
        jQuery2.each(a, function() {
          add(this.name, this.value);
        });
      } else {
        for (prefix in a) {
          buildParams(prefix, a[prefix], traditional, add);
        }
      }
      return s.join("&");
    };
    jQuery2.fn.extend({
      serialize: function() {
        return jQuery2.param(this.serializeArray());
      },
      serializeArray: function() {
        return this.map(function() {
          var elements = jQuery2.prop(this, "elements");
          return elements ? jQuery2.makeArray(elements) : this;
        }).filter(function() {
          var type2 = this.type;
          return this.name && !jQuery2(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type2) && (this.checked || !rcheckableType.test(type2));
        }).map(function(_i, elem) {
          var val = jQuery2(this).val();
          if (val == null) {
            return null;
          }
          if (Array.isArray(val)) {
            return jQuery2.map(val, function(val2) {
              return { name: elem.name, value: val2.replace(rCRLF, "\r\n") };
            });
          }
          return { name: elem.name, value: val.replace(rCRLF, "\r\n") };
        }).get();
      }
    });
    var r20 = /%20/g, rhash = /#.*$/, rantiCache = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, prefilters = {}, transports = {}, allTypes = "*/".concat("*"), originAnchor = document$1.createElement("a");
    originAnchor.href = location2.href;
    function addToPrefiltersOrTransports(structure) {
      return function(dataTypeExpression, func) {
        if (typeof dataTypeExpression !== "string") {
          func = dataTypeExpression;
          dataTypeExpression = "*";
        }
        var dataType, i2 = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnothtmlwhite) || [];
        if (typeof func === "function") {
          while (dataType = dataTypes[i2++]) {
            if (dataType[0] === "+") {
              dataType = dataType.slice(1) || "*";
              (structure[dataType] = structure[dataType] || []).unshift(func);
            } else {
              (structure[dataType] = structure[dataType] || []).push(func);
            }
          }
        }
      };
    }
    function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
      var inspected = {}, seekingTransport = structure === transports;
      function inspect(dataType) {
        var selected;
        inspected[dataType] = true;
        jQuery2.each(structure[dataType] || [], function(_2, prefilterOrFactory) {
          var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
          if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
            options.dataTypes.unshift(dataTypeOrTransport);
            inspect(dataTypeOrTransport);
            return false;
          } else if (seekingTransport) {
            return !(selected = dataTypeOrTransport);
          }
        });
        return selected;
      }
      return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
    }
    function ajaxExtend(target, src) {
      var key, deep, flatOptions = jQuery2.ajaxSettings.flatOptions || {};
      for (key in src) {
        if (src[key] !== void 0) {
          (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
        }
      }
      if (deep) {
        jQuery2.extend(true, target, deep);
      }
      return target;
    }
    function ajaxHandleResponses(s, jqXHR, responses) {
      var ct, type2, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
      while (dataTypes[0] === "*") {
        dataTypes.shift();
        if (ct === void 0) {
          ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
        }
      }
      if (ct) {
        for (type2 in contents) {
          if (contents[type2] && contents[type2].test(ct)) {
            dataTypes.unshift(type2);
            break;
          }
        }
      }
      if (dataTypes[0] in responses) {
        finalDataType = dataTypes[0];
      } else {
        for (type2 in responses) {
          if (!dataTypes[0] || s.converters[type2 + " " + dataTypes[0]]) {
            finalDataType = type2;
            break;
          }
          if (!firstDataType) {
            firstDataType = type2;
          }
        }
        finalDataType = finalDataType || firstDataType;
      }
      if (finalDataType) {
        if (finalDataType !== dataTypes[0]) {
          dataTypes.unshift(finalDataType);
        }
        return responses[finalDataType];
      }
    }
    function ajaxConvert(s, response, jqXHR, isSuccess) {
      var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
      if (dataTypes[1]) {
        for (conv in s.converters) {
          converters[conv.toLowerCase()] = s.converters[conv];
        }
      }
      current = dataTypes.shift();
      while (current) {
        if (s.responseFields[current]) {
          jqXHR[s.responseFields[current]] = response;
        }
        if (!prev && isSuccess && s.dataFilter) {
          response = s.dataFilter(response, s.dataType);
        }
        prev = current;
        current = dataTypes.shift();
        if (current) {
          if (current === "*") {
            current = prev;
          } else if (prev !== "*" && prev !== current) {
            conv = converters[prev + " " + current] || converters["* " + current];
            if (!conv) {
              for (conv2 in converters) {
                tmp = conv2.split(" ");
                if (tmp[1] === current) {
                  conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                  if (conv) {
                    if (conv === true) {
                      conv = converters[conv2];
                    } else if (converters[conv2] !== true) {
                      current = tmp[0];
                      dataTypes.unshift(tmp[1]);
                    }
                    break;
                  }
                }
              }
            }
            if (conv !== true) {
              if (conv && s.throws) {
                response = conv(response);
              } else {
                try {
                  response = conv(response);
                } catch (e) {
                  return {
                    state: "parsererror",
                    error: conv ? e : "No conversion from " + prev + " to " + current
                  };
                }
              }
            }
          }
        }
      }
      return { state: "success", data: response };
    }
    jQuery2.extend({
      // Counter for holding the number of active queries
      active: 0,
      // Last-Modified header cache for next request
      lastModified: {},
      etag: {},
      ajaxSettings: {
        url: location2.href,
        type: "GET",
        isLocal: rlocalProtocol.test(location2.protocol),
        global: true,
        processData: true,
        async: true,
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        /*
        timeout: 0,
        data: null,
        dataType: null,
        username: null,
        password: null,
        cache: null,
        throws: false,
        traditional: false,
        headers: {},
        */
        accepts: {
          "*": allTypes,
          text: "text/plain",
          html: "text/html",
          xml: "application/xml, text/xml",
          json: "application/json, text/javascript"
        },
        contents: {
          xml: /\bxml\b/,
          html: /\bhtml/,
          json: /\bjson\b/
        },
        responseFields: {
          xml: "responseXML",
          text: "responseText",
          json: "responseJSON"
        },
        // Data converters
        // Keys separate source (or catchall "*") and destination types with a single space
        converters: {
          // Convert anything to text
          "* text": String,
          // Text to html (true = no transformation)
          "text html": true,
          // Evaluate text as a json expression
          "text json": JSON.parse,
          // Parse text as xml
          "text xml": jQuery2.parseXML
        },
        // For options that shouldn't be deep extended:
        // you can add your own custom options here if
        // and when you create one that shouldn't be
        // deep extended (see ajaxExtend)
        flatOptions: {
          url: true,
          context: true
        }
      },
      // Creates a full fledged settings object into target
      // with both ajaxSettings and settings fields.
      // If target is omitted, writes into ajaxSettings.
      ajaxSetup: function(target, settings) {
        return settings ? (
          // Building a settings object
          ajaxExtend(ajaxExtend(target, jQuery2.ajaxSettings), settings)
        ) : (
          // Extending ajaxSettings
          ajaxExtend(jQuery2.ajaxSettings, target)
        );
      },
      ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
      ajaxTransport: addToPrefiltersOrTransports(transports),
      // Main method
      ajax: function(url, options) {
        if (typeof url === "object") {
          options = url;
          url = void 0;
        }
        options = options || {};
        var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, urlAnchor, completed2, fireGlobals, i2, uncached, s = jQuery2.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery2(callbackContext) : jQuery2.event, deferred = jQuery2.Deferred(), completeDeferred = jQuery2.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, strAbort = "canceled", jqXHR = {
          readyState: 0,
          // Builds headers hashtable if needed
          getResponseHeader: function(key) {
            var match;
            if (completed2) {
              if (!responseHeaders) {
                responseHeaders = {};
                while (match = rheaders.exec(responseHeadersString)) {
                  responseHeaders[match[1].toLowerCase() + " "] = (responseHeaders[match[1].toLowerCase() + " "] || []).concat(match[2]);
                }
              }
              match = responseHeaders[key.toLowerCase() + " "];
            }
            return match == null ? null : match.join(", ");
          },
          // Raw string
          getAllResponseHeaders: function() {
            return completed2 ? responseHeadersString : null;
          },
          // Caches the header
          setRequestHeader: function(name, value) {
            if (completed2 == null) {
              name = requestHeadersNames[name.toLowerCase()] = requestHeadersNames[name.toLowerCase()] || name;
              requestHeaders[name] = value;
            }
            return this;
          },
          // Overrides response content-type header
          overrideMimeType: function(type2) {
            if (completed2 == null) {
              s.mimeType = type2;
            }
            return this;
          },
          // Status-dependent callbacks
          statusCode: function(map) {
            var code;
            if (map) {
              if (completed2) {
                jqXHR.always(map[jqXHR.status]);
              } else {
                for (code in map) {
                  statusCode[code] = [statusCode[code], map[code]];
                }
              }
            }
            return this;
          },
          // Cancel the request
          abort: function(statusText) {
            var finalText = statusText || strAbort;
            if (transport) {
              transport.abort(finalText);
            }
            done2(0, finalText);
            return this;
          }
        };
        deferred.promise(jqXHR);
        s.url = ((url || s.url || location2.href) + "").replace(rprotocol, location2.protocol + "//");
        s.type = options.method || options.type || s.method || s.type;
        s.dataTypes = (s.dataType || "*").toLowerCase().match(rnothtmlwhite) || [""];
        if (s.crossDomain == null) {
          urlAnchor = document$1.createElement("a");
          try {
            urlAnchor.href = s.url;
            urlAnchor.href = urlAnchor.href;
            s.crossDomain = originAnchor.protocol + "//" + originAnchor.host !== urlAnchor.protocol + "//" + urlAnchor.host;
          } catch (e) {
            s.crossDomain = true;
          }
        }
        inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
        if (s.data && s.processData && typeof s.data !== "string") {
          s.data = jQuery2.param(s.data, s.traditional);
        }
        if (completed2) {
          return jqXHR;
        }
        fireGlobals = jQuery2.event && s.global;
        if (fireGlobals && jQuery2.active++ === 0) {
          jQuery2.event.trigger("ajaxStart");
        }
        s.type = s.type.toUpperCase();
        s.hasContent = !rnoContent.test(s.type);
        cacheURL = s.url.replace(rhash, "");
        if (!s.hasContent) {
          uncached = s.url.slice(cacheURL.length);
          if (s.data && (s.processData || typeof s.data === "string")) {
            cacheURL += (rquery.test(cacheURL) ? "&" : "?") + s.data;
            delete s.data;
          }
          if (s.cache === false) {
            cacheURL = cacheURL.replace(rantiCache, "$1");
            uncached = (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce.guid++ + uncached;
          }
          s.url = cacheURL + uncached;
        } else if (s.data && s.processData && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0) {
          s.data = s.data.replace(r20, "+");
        }
        if (s.ifModified) {
          if (jQuery2.lastModified[cacheURL]) {
            jqXHR.setRequestHeader("If-Modified-Since", jQuery2.lastModified[cacheURL]);
          }
          if (jQuery2.etag[cacheURL]) {
            jqXHR.setRequestHeader("If-None-Match", jQuery2.etag[cacheURL]);
          }
        }
        if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
          jqXHR.setRequestHeader("Content-Type", s.contentType);
        }
        jqXHR.setRequestHeader(
          "Accept",
          s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]
        );
        for (i2 in s.headers) {
          jqXHR.setRequestHeader(i2, s.headers[i2]);
        }
        if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || completed2)) {
          return jqXHR.abort();
        }
        strAbort = "abort";
        completeDeferred.add(s.complete);
        jqXHR.done(s.success);
        jqXHR.fail(s.error);
        transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
        if (!transport) {
          done2(-1, "No Transport");
        } else {
          jqXHR.readyState = 1;
          if (fireGlobals) {
            globalEventContext.trigger("ajaxSend", [jqXHR, s]);
          }
          if (completed2) {
            return jqXHR;
          }
          if (s.async && s.timeout > 0) {
            timeoutTimer = window2.setTimeout(function() {
              jqXHR.abort("timeout");
            }, s.timeout);
          }
          try {
            completed2 = false;
            transport.send(requestHeaders, done2);
          } catch (e) {
            if (completed2) {
              throw e;
            }
            done2(-1, e);
          }
        }
        function done2(status, nativeStatusText, responses, headers) {
          var isSuccess, success, error, response, modified, statusText = nativeStatusText;
          if (completed2) {
            return;
          }
          completed2 = true;
          if (timeoutTimer) {
            window2.clearTimeout(timeoutTimer);
          }
          transport = void 0;
          responseHeadersString = headers || "";
          jqXHR.readyState = status > 0 ? 4 : 0;
          isSuccess = status >= 200 && status < 300 || status === 304;
          if (responses) {
            response = ajaxHandleResponses(s, jqXHR, responses);
          }
          if (!isSuccess && jQuery2.inArray("script", s.dataTypes) > -1 && jQuery2.inArray("json", s.dataTypes) < 0) {
            s.converters["text script"] = function() {
            };
          }
          response = ajaxConvert(s, response, jqXHR, isSuccess);
          if (isSuccess) {
            if (s.ifModified) {
              modified = jqXHR.getResponseHeader("Last-Modified");
              if (modified) {
                jQuery2.lastModified[cacheURL] = modified;
              }
              modified = jqXHR.getResponseHeader("etag");
              if (modified) {
                jQuery2.etag[cacheURL] = modified;
              }
            }
            if (status === 204 || s.type === "HEAD") {
              statusText = "nocontent";
            } else if (status === 304) {
              statusText = "notmodified";
            } else {
              statusText = response.state;
              success = response.data;
              error = response.error;
              isSuccess = !error;
            }
          } else {
            error = statusText;
            if (status || !statusText) {
              statusText = "error";
              if (status < 0) {
                status = 0;
              }
            }
          }
          jqXHR.status = status;
          jqXHR.statusText = (nativeStatusText || statusText) + "";
          if (isSuccess) {
            deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
          } else {
            deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
          }
          jqXHR.statusCode(statusCode);
          statusCode = void 0;
          if (fireGlobals) {
            globalEventContext.trigger(
              isSuccess ? "ajaxSuccess" : "ajaxError",
              [jqXHR, s, isSuccess ? success : error]
            );
          }
          completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
          if (fireGlobals) {
            globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
            if (!--jQuery2.active) {
              jQuery2.event.trigger("ajaxStop");
            }
          }
        }
        return jqXHR;
      },
      getJSON: function(url, data2, callback) {
        return jQuery2.get(url, data2, callback, "json");
      },
      getScript: function(url, callback) {
        return jQuery2.get(url, void 0, callback, "script");
      }
    });
    jQuery2.each(["get", "post"], function(_i, method) {
      jQuery2[method] = function(url, data2, callback, type2) {
        if (typeof data2 === "function" || data2 === null) {
          type2 = type2 || callback;
          callback = data2;
          data2 = void 0;
        }
        return jQuery2.ajax(jQuery2.extend({
          url,
          type: method,
          dataType: type2,
          data: data2,
          success: callback
        }, jQuery2.isPlainObject(url) && url));
      };
    });
    jQuery2.ajaxPrefilter(function(s) {
      var i2;
      for (i2 in s.headers) {
        if (i2.toLowerCase() === "content-type") {
          s.contentType = s.headers[i2] || "";
        }
      }
    });
    jQuery2._evalUrl = function(url, options, doc) {
      return jQuery2.ajax({
        url,
        // Make this explicit, since user can override this through ajaxSetup (trac-11264)
        type: "GET",
        dataType: "script",
        cache: true,
        async: false,
        global: false,
        scriptAttrs: options.crossOrigin ? { "crossOrigin": options.crossOrigin } : void 0,
        // Only evaluate the response if it is successful (gh-4126)
        // dataFilter is not invoked for failure responses, so using it instead
        // of the default converter is kludgy but it works.
        converters: {
          "text script": function() {
          }
        },
        dataFilter: function(response) {
          jQuery2.globalEval(response, options, doc);
        }
      });
    };
    jQuery2.fn.extend({
      wrapAll: function(html) {
        var wrap;
        if (this[0]) {
          if (typeof html === "function") {
            html = html.call(this[0]);
          }
          wrap = jQuery2(html, this[0].ownerDocument).eq(0).clone(true);
          if (this[0].parentNode) {
            wrap.insertBefore(this[0]);
          }
          wrap.map(function() {
            var elem = this;
            while (elem.firstElementChild) {
              elem = elem.firstElementChild;
            }
            return elem;
          }).append(this);
        }
        return this;
      },
      wrapInner: function(html) {
        if (typeof html === "function") {
          return this.each(function(i2) {
            jQuery2(this).wrapInner(html.call(this, i2));
          });
        }
        return this.each(function() {
          var self2 = jQuery2(this), contents = self2.contents();
          if (contents.length) {
            contents.wrapAll(html);
          } else {
            self2.append(html);
          }
        });
      },
      wrap: function(html) {
        var htmlIsFunction = typeof html === "function";
        return this.each(function(i2) {
          jQuery2(this).wrapAll(htmlIsFunction ? html.call(this, i2) : html);
        });
      },
      unwrap: function(selector) {
        this.parent(selector).not("body").each(function() {
          jQuery2(this).replaceWith(this.childNodes);
        });
        return this;
      }
    });
    jQuery2.expr.pseudos.hidden = function(elem) {
      return !jQuery2.expr.pseudos.visible(elem);
    };
    jQuery2.expr.pseudos.visible = function(elem) {
      return !!(elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length);
    };
    jQuery2.ajaxSettings.xhr = function() {
      return new window2.XMLHttpRequest();
    };
    var xhrSuccessStatus = {
      // File protocol always yields status code 0, assume 200
      0: 200
    };
    jQuery2.ajaxTransport(function(options) {
      var callback;
      return {
        send: function(headers, complete) {
          var i2, xhr = options.xhr();
          xhr.open(
            options.type,
            options.url,
            options.async,
            options.username,
            options.password
          );
          if (options.xhrFields) {
            for (i2 in options.xhrFields) {
              xhr[i2] = options.xhrFields[i2];
            }
          }
          if (options.mimeType && xhr.overrideMimeType) {
            xhr.overrideMimeType(options.mimeType);
          }
          if (!options.crossDomain && !headers["X-Requested-With"]) {
            headers["X-Requested-With"] = "XMLHttpRequest";
          }
          for (i2 in headers) {
            xhr.setRequestHeader(i2, headers[i2]);
          }
          callback = function(type2) {
            return function() {
              if (callback) {
                callback = xhr.onload = xhr.onerror = xhr.onabort = xhr.ontimeout = null;
                if (type2 === "abort") {
                  xhr.abort();
                } else if (type2 === "error") {
                  complete(
                    // File: protocol always yields status 0; see trac-8605, trac-14207
                    xhr.status,
                    xhr.statusText
                  );
                } else {
                  complete(
                    xhrSuccessStatus[xhr.status] || xhr.status,
                    xhr.statusText,
                    // For XHR2 non-text, let the caller handle it (gh-2498)
                    (xhr.responseType || "text") === "text" ? { text: xhr.responseText } : { binary: xhr.response },
                    xhr.getAllResponseHeaders()
                  );
                }
              }
            };
          };
          xhr.onload = callback();
          xhr.onabort = xhr.onerror = xhr.ontimeout = callback("error");
          callback = callback("abort");
          try {
            xhr.send(options.hasContent && options.data || null);
          } catch (e) {
            if (callback) {
              throw e;
            }
          }
        },
        abort: function() {
          if (callback) {
            callback();
          }
        }
      };
    });
    function canUseScriptTag(s) {
      return s.scriptAttrs || !s.headers && (s.crossDomain || // When dealing with JSONP (`s.dataTypes` include "json" then)
      // don't use a script tag so that error responses still may have
      // `responseJSON` set. Continue using a script tag for JSONP requests that:
      //   * are cross-domain as AJAX requests won't work without a CORS setup
      //   * have `scriptAttrs` set as that's a script-only functionality
      // Note that this means JSONP requests violate strict CSP script-src settings.
      // A proper solution is to migrate from using JSONP to a CORS setup.
      s.async && jQuery2.inArray("json", s.dataTypes) < 0);
    }
    jQuery2.ajaxSetup({
      accepts: {
        script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
      },
      converters: {
        "text script": function(text) {
          jQuery2.globalEval(text);
          return text;
        }
      }
    });
    jQuery2.ajaxPrefilter("script", function(s) {
      if (s.cache === void 0) {
        s.cache = false;
      }
      if (canUseScriptTag(s)) {
        s.type = "GET";
      }
    });
    jQuery2.ajaxTransport("script", function(s) {
      if (canUseScriptTag(s)) {
        var script, callback;
        return {
          send: function(_2, complete) {
            script = jQuery2("<script>").attr(s.scriptAttrs || {}).prop({ charset: s.scriptCharset, src: s.url }).on("load error", callback = function(evt) {
              script.remove();
              callback = null;
              if (evt) {
                complete(evt.type === "error" ? 404 : 200, evt.type);
              }
            });
            document$1.head.appendChild(script[0]);
          },
          abort: function() {
            if (callback) {
              callback();
            }
          }
        };
      }
    });
    var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
    jQuery2.ajaxSetup({
      jsonp: "callback",
      jsonpCallback: function() {
        var callback = oldCallbacks.pop() || jQuery2.expando + "_" + nonce.guid++;
        this[callback] = true;
        return callback;
      }
    });
    jQuery2.ajaxPrefilter("jsonp", function(s, originalSettings, jqXHR) {
      var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && (s.contentType || "").indexOf("application/x-www-form-urlencoded") === 0 && rjsonp.test(s.data) && "data");
      callbackName = s.jsonpCallback = typeof s.jsonpCallback === "function" ? s.jsonpCallback() : s.jsonpCallback;
      if (jsonProp) {
        s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
      } else if (s.jsonp !== false) {
        s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
      }
      s.converters["script json"] = function() {
        if (!responseContainer) {
          jQuery2.error(callbackName + " was not called");
        }
        return responseContainer[0];
      };
      s.dataTypes[0] = "json";
      overwritten = window2[callbackName];
      window2[callbackName] = function() {
        responseContainer = arguments;
      };
      jqXHR.always(function() {
        if (overwritten === void 0) {
          jQuery2(window2).removeProp(callbackName);
        } else {
          window2[callbackName] = overwritten;
        }
        if (s[callbackName]) {
          s.jsonpCallback = originalSettings.jsonpCallback;
          oldCallbacks.push(callbackName);
        }
        if (responseContainer && typeof overwritten === "function") {
          overwritten(responseContainer[0]);
        }
        responseContainer = overwritten = void 0;
      });
      return "script";
    });
    jQuery2.ajaxPrefilter(function(s, origOptions) {
      if (typeof s.data !== "string" && !jQuery2.isPlainObject(s.data) && !Array.isArray(s.data) && // Don't disable data processing if explicitly set by the user.
      !("processData" in origOptions)) {
        s.processData = false;
      }
      if (s.data instanceof window2.FormData) {
        s.contentType = false;
      }
    });
    jQuery2.parseHTML = function(data2, context, keepScripts) {
      if (typeof data2 !== "string" && !isObviousHtml(data2 + "")) {
        return [];
      }
      if (typeof context === "boolean") {
        keepScripts = context;
        context = false;
      }
      var base, parsed, scripts;
      if (!context) {
        context = document$1.implementation.createHTMLDocument("");
        base = context.createElement("base");
        base.href = document$1.location.href;
        context.head.appendChild(base);
      }
      parsed = rsingleTag.exec(data2);
      scripts = !keepScripts && [];
      if (parsed) {
        return [context.createElement(parsed[1])];
      }
      parsed = buildFragment([data2], context, scripts);
      if (scripts && scripts.length) {
        jQuery2(scripts).remove();
      }
      return jQuery2.merge([], parsed.childNodes);
    };
    jQuery2.fn.load = function(url, params, callback) {
      var selector, type2, response, self2 = this, off = url.indexOf(" ");
      if (off > -1) {
        selector = stripAndCollapse(url.slice(off));
        url = url.slice(0, off);
      }
      if (typeof params === "function") {
        callback = params;
        params = void 0;
      } else if (params && typeof params === "object") {
        type2 = "POST";
      }
      if (self2.length > 0) {
        jQuery2.ajax({
          url,
          // If "type" variable is undefined, then "GET" method will be used.
          // Make value of this field explicit since
          // user can override it through ajaxSetup method
          type: type2 || "GET",
          dataType: "html",
          data: params
        }).done(function(responseText) {
          response = arguments;
          self2.html(selector ? (
            // If a selector was specified, locate the right elements in a dummy div
            // Exclude scripts to avoid IE 'Permission Denied' errors
            jQuery2("<div>").append(jQuery2.parseHTML(responseText)).find(selector)
          ) : (
            // Otherwise use the full result
            responseText
          ));
        }).always(callback && function(jqXHR, status) {
          self2.each(function() {
            callback.apply(this, response || [jqXHR.responseText, status, jqXHR]);
          });
        });
      }
      return this;
    };
    jQuery2.expr.pseudos.animated = function(elem) {
      return jQuery2.grep(jQuery2.timers, function(fn) {
        return elem === fn.elem;
      }).length;
    };
    jQuery2.offset = {
      setOffset: function(elem, options, i2) {
        var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery2.css(elem, "position"), curElem = jQuery2(elem), props = {};
        if (position === "static") {
          elem.style.position = "relative";
        }
        curOffset = curElem.offset();
        curCSSTop = jQuery2.css(elem, "top");
        curCSSLeft = jQuery2.css(elem, "left");
        calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
        if (calculatePosition) {
          curPosition = curElem.position();
          curTop = curPosition.top;
          curLeft = curPosition.left;
        } else {
          curTop = parseFloat(curCSSTop) || 0;
          curLeft = parseFloat(curCSSLeft) || 0;
        }
        if (typeof options === "function") {
          options = options.call(elem, i2, jQuery2.extend({}, curOffset));
        }
        if (options.top != null) {
          props.top = options.top - curOffset.top + curTop;
        }
        if (options.left != null) {
          props.left = options.left - curOffset.left + curLeft;
        }
        if ("using" in options) {
          options.using.call(elem, props);
        } else {
          curElem.css(props);
        }
      }
    };
    jQuery2.fn.extend({
      // offset() relates an element's border box to the document origin
      offset: function(options) {
        if (arguments.length) {
          return options === void 0 ? this : this.each(function(i2) {
            jQuery2.offset.setOffset(this, options, i2);
          });
        }
        var rect, win, elem = this[0];
        if (!elem) {
          return;
        }
        if (!elem.getClientRects().length) {
          return { top: 0, left: 0 };
        }
        rect = elem.getBoundingClientRect();
        win = elem.ownerDocument.defaultView;
        return {
          top: rect.top + win.pageYOffset,
          left: rect.left + win.pageXOffset
        };
      },
      // position() relates an element's margin box to its offset parent's padding box
      // This corresponds to the behavior of CSS absolute positioning
      position: function() {
        if (!this[0]) {
          return;
        }
        var offsetParent, offset, doc, elem = this[0], parentOffset = { top: 0, left: 0 };
        if (jQuery2.css(elem, "position") === "fixed") {
          offset = elem.getBoundingClientRect();
        } else {
          offset = this.offset();
          doc = elem.ownerDocument;
          offsetParent = elem.offsetParent || doc.documentElement;
          while (offsetParent && offsetParent !== doc.documentElement && jQuery2.css(offsetParent, "position") === "static") {
            offsetParent = offsetParent.offsetParent || doc.documentElement;
          }
          if (offsetParent && offsetParent !== elem && offsetParent.nodeType === 1 && jQuery2.css(offsetParent, "position") !== "static") {
            parentOffset = jQuery2(offsetParent).offset();
            parentOffset.top += jQuery2.css(offsetParent, "borderTopWidth", true);
            parentOffset.left += jQuery2.css(offsetParent, "borderLeftWidth", true);
          }
        }
        return {
          top: offset.top - parentOffset.top - jQuery2.css(elem, "marginTop", true),
          left: offset.left - parentOffset.left - jQuery2.css(elem, "marginLeft", true)
        };
      },
      // This method will return documentElement in the following cases:
      // 1) For the element inside the iframe without offsetParent, this method will return
      //    documentElement of the parent window
      // 2) For the hidden or detached element
      // 3) For body or html element, i.e. in case of the html node - it will return itself
      //
      // but those exceptions were never presented as a real life use-cases
      // and might be considered as more preferable results.
      //
      // This logic, however, is not guaranteed and can change at any point in the future
      offsetParent: function() {
        return this.map(function() {
          var offsetParent = this.offsetParent;
          while (offsetParent && jQuery2.css(offsetParent, "position") === "static") {
            offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || documentElement$1;
        });
      }
    });
    jQuery2.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(method, prop) {
      var top2 = "pageYOffset" === prop;
      jQuery2.fn[method] = function(val) {
        return access(this, function(elem, method2, val2) {
          var win;
          if (isWindow(elem)) {
            win = elem;
          } else if (elem.nodeType === 9) {
            win = elem.defaultView;
          }
          if (val2 === void 0) {
            return win ? win[prop] : elem[method2];
          }
          if (win) {
            win.scrollTo(
              !top2 ? val2 : win.pageXOffset,
              top2 ? val2 : win.pageYOffset
            );
          } else {
            elem[method2] = val2;
          }
        }, method, val, arguments.length);
      };
    });
    jQuery2.each({ Height: "height", Width: "width" }, function(name, type2) {
      jQuery2.each({
        padding: "inner" + name,
        content: type2,
        "": "outer" + name
      }, function(defaultExtra, funcName) {
        jQuery2.fn[funcName] = function(margin, value) {
          var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
          return access(this, function(elem, type3, value2) {
            var doc;
            if (isWindow(elem)) {
              return funcName.indexOf("outer") === 0 ? elem["inner" + name] : elem.document.documentElement["client" + name];
            }
            if (elem.nodeType === 9) {
              doc = elem.documentElement;
              return Math.max(
                elem.body["scroll" + name],
                doc["scroll" + name],
                elem.body["offset" + name],
                doc["offset" + name],
                doc["client" + name]
              );
            }
            return value2 === void 0 ? (
              // Get width or height on the element, requesting but not forcing parseFloat
              jQuery2.css(elem, type3, extra)
            ) : (
              // Set width or height on the element
              jQuery2.style(elem, type3, value2, extra)
            );
          }, type2, chainable ? margin : void 0, chainable);
        };
      });
    });
    jQuery2.each([
      "ajaxStart",
      "ajaxStop",
      "ajaxComplete",
      "ajaxError",
      "ajaxSuccess",
      "ajaxSend"
    ], function(_i, type2) {
      jQuery2.fn[type2] = function(fn) {
        return this.on(type2, fn);
      };
    });
    jQuery2.fn.extend({
      bind: function(types, data2, fn) {
        return this.on(types, null, data2, fn);
      },
      unbind: function(types, fn) {
        return this.off(types, null, fn);
      },
      delegate: function(selector, types, data2, fn) {
        return this.on(types, selector, data2, fn);
      },
      undelegate: function(selector, types, fn) {
        return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
      },
      hover: function(fnOver, fnOut) {
        return this.on("mouseenter", fnOver).on("mouseleave", fnOut || fnOver);
      }
    });
    jQuery2.each(
      "blur focus focusin focusout resize scroll click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup contextmenu".split(" "),
      function(_i, name) {
        jQuery2.fn[name] = function(data2, fn) {
          return arguments.length > 0 ? this.on(name, null, data2, fn) : this.trigger(name);
        };
      }
    );
    jQuery2.proxy = function(fn, context) {
      var tmp, args, proxy;
      if (typeof context === "string") {
        tmp = fn[context];
        context = fn;
        fn = tmp;
      }
      if (typeof fn !== "function") {
        return void 0;
      }
      args = slice.call(arguments, 2);
      proxy = function() {
        return fn.apply(context || this, args.concat(slice.call(arguments)));
      };
      proxy.guid = fn.guid = fn.guid || jQuery2.guid++;
      return proxy;
    };
    jQuery2.holdReady = function(hold) {
      if (hold) {
        jQuery2.readyWait++;
      } else {
        jQuery2.ready(true);
      }
    };
    if (typeof define === "function" && define.amd) {
      define("jquery", [], function() {
        return jQuery2;
      });
    }
    var _jQuery = window2.jQuery, _$ = window2.$;
    jQuery2.noConflict = function(deep) {
      if (window2.$ === jQuery2) {
        window2.$ = _$;
      }
      if (deep && window2.jQuery === jQuery2) {
        window2.jQuery = _jQuery;
      }
      return jQuery2;
    };
    return jQuery2;
  }
  var jQuery$1 = jQueryFactory(window);
  const log = (level, message, ...args) => {
    console.log(`[Gmail MCP Server] ${level}: ${message}`, ...args);
  };
  class GmailMCPServer {
    // Track registered tools with enable/disable state
    constructor() {
      this.initialized = false;
      this.currentPage = "";
      this.isInEmail = false;
      this.isComposing = false;
      this.writeEnabled = true;
      this.contextObservers = /* @__PURE__ */ new Map();
      this.registeredTools = /* @__PURE__ */ new Map();
      this.server = new McpServer(
        {
          name: "Gmail MCP Server Enhanced",
          version: "2.1.0"
        },
        {
          instructions: "Simplified Gmail integration server using Gmail.js API. Focuses on essential email operations: reading emails, listing inbox content, and composing new emails. All write operations are enabled by default. Tools return structured data for AI agent use."
        }
      );
      this.server.registerTool("ping", {
        title: "Ping",
        description: "Ping the server",
        inputSchema: {},
        annotations: {
          readOnlyHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        return this.formatSuccess("Pong");
      });
      this.transport = new h({
        allowedOrigins: ["*"]
      });
      this.init();
    }
    /**
     * Safely register a tool, avoiding duplicates and allowing disable/enable
     */
    safeRegisterTool(name, definition, handler, enabled = true) {
      if (!this.registeredTools.has(name)) {
        this.server.registerTool(name, definition, handler);
        this.registeredTools.set(name, { enabled });
      } else {
        this.registeredTools.set(name, { enabled });
      }
    }
    /**
     * Disable a tool by name (since MCP can't remove, we track internally)
     */
    disableTool(name) {
      if (this.registeredTools.has(name)) {
        this.registeredTools.set(name, { enabled: false });
      }
    }
    /**
     * Format success response with structured data for AI state
     */
    formatSuccess(data2) {
      return {
        content: [{
          type: "text",
          text: typeof data2 === "string" ? data2 : JSON.stringify(data2, null, 2)
        }]
      };
    }
    /**
     * Format error response
     */
    formatError(error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{
          type: "text",
          text: `Error: ${message}`
        }],
        isError: true
      };
    }
    async init() {
      try {
        log("info", "Initializing Enhanced Gmail MCP Server with Gmail.js...");
        await this.server.connect(this.transport);
        window.$ = jQuery$1;
        window.jQuery = jQuery$1;
        const GmailFactory = await __vitePreload(() => Promise.resolve().then(() => gmail$1), true ? void 0 : void 0);
        this.gmail = new GmailFactory.Gmail();
        this.gmail.observe.on("load", () => {
          log("info", "Gmail.js loaded and interface ready");
          this.registerCoreTools();
          if (!this.gmail.check.is_new_data_layer()) {
            log("warn", "Using old Gmail data layer; some tools may fail.");
          }
          this.updateGmailState();
          this.registerContextAwareTools();
          this.setupGmailObservers();
          log("info", "Enhanced Gmail MCP Server fully initialized");
          log("info", `Current context: ${this.currentPage}, In email: ${this.isInEmail}, Composing: ${this.isComposing}`);
        });
        this.initialized = true;
        log("info", "Enhanced Gmail MCP Server initialized successfully");
      } catch (error) {
        log("error", "Failed to initialize Enhanced Gmail MCP Server:", error);
        throw error;
      }
    }
    /**
     * Update Gmail state for context-aware tool registration
     */
    updateGmailState() {
      try {
        this.currentPage = this.gmail.get.current_page();
        this.isInEmail = this.gmail.check.is_inside_email();
        this.isComposing = this.gmail.dom.composes().length > 0;
        log("info", `Gmail state updated - Page: ${this.currentPage}, In email: ${this.isInEmail}, Composing: ${this.isComposing}`);
      } catch (error) {
        log("error", "Failed to update Gmail state:", error);
      }
    }
    /**
     * Register core tools that are always available
     */
    registerCoreTools() {
      this.safeRegisterTool("get_unread_counts", {
        title: "Get Unread Email Counts",
        description: "Get unread email counts for Gmail inbox and main categories",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        try {
          const data2 = {
            total: this.gmail.get.unread_emails(),
            inbox: this.gmail.get.unread_inbox_emails(),
            drafts: this.gmail.get.unread_draft_emails()
          };
          return this.formatSuccess(data2);
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("navigate_to_page", {
        title: "Navigate to Gmail Page",
        description: "Navigate to different Gmail pages/views like inbox, sent, drafts, etc. Updates state and tools.",
        inputSchema: {
          page: enumType(["inbox", "sent", "drafts", "starred", "spam", "trash", "all", "important"]).describe("Gmail page to navigate to")
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async ({ page }) => {
        try {
          const pageUrls = {
            inbox: "#inbox",
            sent: "#sent",
            drafts: "#drafts",
            starred: "#starred",
            spam: "#spam",
            trash: "#trash",
            all: "#all",
            important: "#imp"
          };
          window.location.hash = pageUrls[page] || "#inbox";
          setTimeout(() => {
            this.updateGmailState();
            this.registerContextAwareTools();
          }, 1e3);
          return this.formatSuccess({ navigatedTo: page, message: "Navigated successfully. State updated." });
        } catch (error) {
          return this.formatError(error);
        }
      });
      log("info", "Core tools registered");
    }
    /**
     * Register context-aware tools based on current Gmail state
     */
    registerContextAwareTools() {
      this.registerEmailListTools();
      this.registerWriteTools();
      this.registerSearchTools();
      if (this.isInEmail) {
        this.registerEmailViewTools();
      } else {
        this.disableTool("read_current_email");
        this.disableTool("get_email_thread");
      }
      if (this.isComposing) {
        this.registerComposeTools();
      } else {
        this.disableTool("get_compose_data");
        this.disableTool("update_compose");
        this.disableTool("send_compose");
      }
      log("info", `Context-aware tools registered for state: page=${this.currentPage}, inEmail=${this.isInEmail}, composing=${this.isComposing}`);
    }
    /**
     * Register tools for email list views (inbox, sent, starred, etc.)
     */
    registerEmailListTools() {
      this.safeRegisterTool("list_visible_emails", {
        title: "List Visible Emails",
        description: `List visible emails/threads from the current Gmail view (${this.currentPage}). Shows email summaries including sender, subject, and thread ID.`,
        inputSchema: {
          limit: numberType().min(1).max(50).default(20).describe("Maximum number of emails/threads to return")
        },
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async ({ limit }) => {
        try {
          const visibleMessages = this.gmail.dom.visible_messages().slice(0, limit);
          const data2 = visibleMessages.map((msg) => ({
            threadId: msg.thread_id,
            subject: msg.summary,
            from: {
              email: msg.from.email,
              name: msg.from.name
            },
            summary: msg.summary
          }));
          return this.formatSuccess(data2);
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("get_selected_emails", {
        title: "Get Selected Emails",
        description: "Get information about currently selected emails in the Gmail interface",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        try {
          const selectedElements = document.querySelectorAll('tr.zA.zE[role="row"][tabindex="0"]:checked, tr.zA.zE[role="row"].x7');
          const data2 = {
            selectedCount: selectedElements.length,
            emails: Array.from(selectedElements).map((el) => {
              var _a;
              const threadIdAttr = el.getAttribute("id");
              const subjectEl = el.querySelector("[data-thread-perm-id]");
              return {
                threadId: threadIdAttr || "unknown",
                subject: ((_a = subjectEl == null ? void 0 : subjectEl.textContent) == null ? void 0 : _a.trim()) || "No subject",
                element: "Selected via DOM"
              };
            })
          };
          return this.formatSuccess(data2);
        } catch (error) {
          return this.formatError(error);
        }
      });
    }
    /**
     * Register tools for when viewing an individual email
     */
    registerEmailViewTools() {
      this.safeRegisterTool("read_current_email", {
        title: "Read Current Email",
        description: "Read the currently open email with full content, metadata, and attachments",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        try {
          if (!this.isInEmail) {
            throw new Error("Not currently viewing an email. Use navigate_to_page or open_email first.");
          }
          const emailId = this.gmail.new.get.email_id();
          if (!emailId) {
            throw new Error("Could not determine current email ID. Try refreshing the page.");
          }
          const emailData = this.gmail.new.get.email_data(emailId);
          if (!emailData) {
            throw new Error("No email data found in cache. Try reopening the email or waiting for cache population.");
          }
          const data2 = {
            id: emailData.id,
            subject: emailData.subject,
            from: emailData.from,
            to: emailData.to,
            cc: emailData.cc || [],
            bcc: emailData.bcc || [],
            date: emailData.date,
            timestamp: emailData.timestamp,
            contentHtml: emailData.content_html,
            attachments: emailData.attachments || []
          };
          return this.formatSuccess(data2);
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("get_email_thread", {
        title: "Get Full Email Thread",
        description: "Get the complete thread/conversation containing the current email",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        try {
          const threadId = this.gmail.new.get.thread_id();
          const threadData = this.gmail.new.get.thread_data(threadId);
          if (!threadData) {
            throw new Error("No thread data found in cache.");
          }
          const data2 = {
            threadId: threadData.thread_id,
            totalEmails: threadData.emails.length,
            emails: threadData.emails.map((email) => ({
              id: email.id,
              subject: email.subject,
              from: email.from,
              timestamp: email.timestamp,
              snippet: email.content_html ? `${email.content_html.substring(0, 200)}...` : ""
            }))
          };
          return this.formatSuccess(data2);
        } catch (error) {
          return this.formatError(error);
        }
      });
    }
    /**
     * Register tools for compose mode
     */
    registerComposeTools() {
      this.safeRegisterTool("get_compose_data", {
        title: "Get Compose Data",
        description: "Get information about the current compose window(s) including recipients, subject, and body. Supports multiple composes.",
        inputSchema: {
          composeId: stringType().optional().describe("Specific compose ID to target (from get_compose_ids)")
        },
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async ({ composeId }) => {
        try {
          const composes = this.gmail.dom.composes();
          let targetComposes = composes;
          if (composeId) {
            targetComposes = composes.filter((c) => c.id() === composeId);
            if (targetComposes.length === 0) {
              throw new Error(`Compose window ${composeId} not found.`);
            }
          }
          const data2 = {
            activeComposes: composes.length,
            composeData: targetComposes.map((compose) => ({
              id: compose.id(),
              type: compose.type(),
              isInline: compose.is_inline(),
              to: compose.to().val(),
              cc: compose.cc().val(),
              bcc: compose.bcc().val(),
              subject: compose.subject(),
              from: compose.from(),
              body: compose.body()
            }))
          };
          return this.formatSuccess(data2);
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("update_compose", {
        title: "Update Compose Fields",
        description: "Update recipients, subject, or body of a compose window.",
        inputSchema: {
          composeId: stringType().optional().describe("Specific compose ID to target"),
          to: arrayType(stringType().email()).optional().describe("Update TO recipients"),
          cc: arrayType(stringType().email()).optional().describe("Update CC recipients"),
          bcc: arrayType(stringType().email()).optional().describe("Update BCC recipients"),
          subject: stringType().optional().describe("Update email subject"),
          body: stringType().optional().describe("Update email body content")
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async (params) => {
        try {
          const composes = this.gmail.dom.composes();
          let compose;
          if (params.composeId) {
            compose = composes.find((c) => c.id() === params.composeId);
            if (!compose) throw new Error(`Compose ${params.composeId} not found.`);
          } else if (composes.length > 0) {
            compose = composes[0];
          } else {
            throw new Error("No compose window found.");
          }
          const updates = [];
          if (params.to) {
            compose.to(params.to.join(", "));
            updates.push(`TO: ${params.to.join(", ")}`);
          }
          if (params.cc) {
            compose.cc(params.cc.join(", "));
            updates.push(`CC: ${params.cc.join(", ")}`);
          }
          if (params.bcc) {
            compose.bcc(params.bcc.join(", "));
            updates.push(`BCC: ${params.bcc.join(", ")}`);
          }
          if (params.subject) {
            compose.subject(params.subject);
            updates.push(`Subject: ${params.subject}`);
          }
          if (params.body) {
            compose.body(params.body);
            updates.push("Body updated");
          }
          return this.formatSuccess(`Updated compose fields: ${updates.join(", ")}. State: Composing updated.`);
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("send_compose", {
        title: "Send Email",
        description: "Send a compose email.",
        inputSchema: {
          composeId: stringType().optional().describe("Specific compose ID to send")
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        }
      }, async ({ composeId }) => {
        try {
          const composes = this.gmail.dom.composes();
          let compose;
          if (composeId) {
            compose = composes.find((c) => c.id() === composeId);
            if (!compose) throw new Error(`Compose ${composeId} not found.`);
          } else if (composes.length > 0) {
            compose = composes[0];
          } else {
            throw new Error("No compose window found");
          }
          compose.send();
          setTimeout(() => this.updateGmailState(), 500);
          return this.formatSuccess("Email sent successfully. State: Compose closed.");
        } catch (error) {
          return this.formatError(error);
        }
      });
    }
    /**
     * Register write tools (only when write permissions enabled)
     */
    registerWriteTools() {
      this.safeRegisterTool("compose_new_email", {
        title: "Compose New Email",
        description: "Create and compose a complete new email with recipients, subject, and body. Opens a compose window, fills fields, and optionally sends.",
        inputSchema: {
          to: arrayType(stringType().email()).min(1).describe("Email recipients (required)"),
          subject: stringType().min(1).describe("Email subject line"),
          body: stringType().describe("Email body content (supports HTML)"),
          cc: arrayType(stringType().email()).optional().describe("CC recipients"),
          bcc: arrayType(stringType().email()).optional().describe("BCC recipients"),
          send: booleanType().default(false).describe("Whether to send immediately after composing")
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: false,
          openWorldHint: true
        }
      }, async (params) => {
        try {
          this.gmail.compose.start_compose();
          return await new Promise((resolve2, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timeout waiting for compose")), 5e3);
            const handler = (compose, type2) => {
              if (type2 === "compose") {
                clearTimeout(timeout);
                this.gmail.observe.off("compose", "after");
                try {
                  setTimeout(() => {
                    compose.to(params.to.join(", "));
                    if (params.cc) compose.cc(params.cc.join(", "));
                    if (params.bcc) compose.bcc(params.bcc.join(", "));
                    compose.subject(params.subject);
                    compose.body(params.body);
                    this.isComposing = true;
                    this.registerContextAwareTools();
                    const result = {
                      composed: true,
                      to: params.to,
                      subject: params.subject,
                      cc: params.cc || [],
                      bcc: params.bcc || [],
                      status: params.send ? "Sent" : "Draft saved (use send_compose to send)"
                    };
                    if (params.send) {
                      setTimeout(() => compose.send(), 300);
                    }
                    resolve2(this.formatSuccess(result));
                  }, 200);
                } catch (error) {
                  reject(error);
                }
              }
            };
            this.gmail.observe.on("compose", handler);
          });
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("start_compose", {
        title: "Start New Compose",
        description: "Open a new empty email compose window. Use update_compose to fill fields.",
        inputSchema: {},
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        try {
          this.gmail.compose.start_compose();
          setTimeout(() => {
            this.isComposing = this.gmail.dom.composes().length > 0;
            if (this.isComposing) {
              this.registerContextAwareTools();
            }
          }, 1e3);
          return this.formatSuccess({ message: "New compose window opened.", composeIds: this.gmail.get.compose_ids() });
        } catch (error) {
          return this.formatError(error);
        }
      });
    }
    /**
     * Register search tools (useful in all contexts)
     */
    registerSearchTools() {
      this.safeRegisterTool("search_emails", {
        title: "Search Emails",
        description: "Search for emails using Gmail search syntax. Supports operators like from:, to:, subject:, has:attachment, etc.",
        inputSchema: {
          query: stringType().min(1).describe("Gmail search query (supports Gmail search operators)"),
          executeSearch: booleanType().default(true).describe("Execute the search in Gmail interface and update view")
        },
        annotations: {
          readOnlyHint: false,
          destructiveHint: false,
          idempotentHint: true,
          openWorldHint: true
        }
      }, async ({ query, executeSearch }) => {
        try {
          if (executeSearch) {
            window.location.hash = `#search/${encodeURIComponent(query)}`;
            setTimeout(() => {
              this.updateGmailState();
              this.registerContextAwareTools();
            }, 1e3);
            return this.formatSuccess({ searched: query, message: "Search executed. View updated; use list_visible_emails to see results." });
          }
          const currentQuery = this.gmail.get.search_query();
          return this.formatSuccess({
            currentQuery: currentQuery || "No active search",
            requestedQuery: query,
            note: "Use executeSearch: true to perform the search and update state."
          });
        } catch (error) {
          return this.formatError(error);
        }
      });
      this.safeRegisterTool("get_current_search", {
        title: "Get Current Search Query",
        description: "Get the currently active search query in Gmail",
        inputSchema: {},
        annotations: {
          readOnlyHint: true,
          idempotentHint: true,
          openWorldHint: false
        }
      }, async () => {
        try {
          const query = this.gmail.get.search_query();
          return this.formatSuccess({
            query: query || null,
            hasActiveSearch: !!query
          });
        } catch (error) {
          return this.formatError(error);
        }
      });
    }
    /**
     * Set up Gmail observers for dynamic tool updates and AI state
     */
    setupGmailObservers() {
      const navigationHandler = () => {
        setTimeout(() => {
          const oldState = { page: this.currentPage, inEmail: this.isInEmail, composing: this.isComposing };
          this.updateGmailState();
          if (JSON.stringify(oldState) !== JSON.stringify({ page: this.currentPage, inEmail: this.isInEmail, composing: this.isComposing })) {
            this.registerContextAwareTools();
            log("info", `State changed: ${JSON.stringify(oldState)} → ${JSON.stringify({ page: this.currentPage, inEmail: this.isInEmail, composing: this.isComposing })}. Tools updated.`);
          }
        }, 500);
      };
      this.gmail.observe.on("view_thread", navigationHandler);
      this.gmail.observe.on("view_email", navigationHandler);
      this.gmail.observe.on("compose", navigationHandler);
      this.gmail.observe.on("compose_cancelled", navigationHandler);
      this.gmail.observe.on("refresh", navigationHandler);
      this.contextObservers.set("navigation", () => {
        this.gmail.observe.off("view_thread", "after");
        this.gmail.observe.off("view_email", "after");
        this.gmail.observe.off("compose", "after");
        this.gmail.observe.off("compose_cancelled", "after");
        this.gmail.observe.off("refresh", "after");
      });
      log("info", "Gmail observers set up for dynamic updates and state management");
    }
    /**
     * Cleanup method
     */
    cleanup() {
      for (const cleanup of this.contextObservers.values()) {
        cleanup();
      }
      this.contextObservers.clear();
      log("info", "Cleanup completed");
    }
    getServer() {
      return this.server;
    }
    isInitialized() {
      return this.initialized;
    }
    shutdown() {
      this.cleanup();
      this.initialized = false;
    }
  }
  let gmailServer = null;
  async function initializeServer() {
    if (!gmailServer) {
      gmailServer = new GmailMCPServer();
      window.gmailMCPServer = gmailServer;
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeServer);
  } else {
    initializeServer();
  }
  let lastUrl = location.href;
  const navigationObserver = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(() => {
        if (!gmailServer || !gmailServer.isInitialized()) {
          initializeServer();
        }
      }, 1500);
    }
  });
  navigationObserver.observe(document.body, { subtree: true, childList: true });
  window.addEventListener("beforeunload", () => {
    if (gmailServer) {
      gmailServer.shutdown();
    }
  });
  log("info", "Enhanced Gmail MCP Server script loaded");

})();