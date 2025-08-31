/**
 * Make a map and return a function for checking if a key
 * is in that map.
 * IMPORTANT: all calls of this function must be prefixed with
 * \/\*#\_\_PURE\_\_\*\/
 * So that rollup can tree-shake them if necessary.
 */
function makeMap(str, expectsLowerCase) {
    const map = Object.create(null);
    const list = str.split(',');
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true;
    }
    return expectsLowerCase ? val => !!map[val.toLowerCase()] : val => !!map[val];
}

/**
 * On the client we only need to offer special cases for boolean attributes that
 * have different names from their corresponding dom properties:
 * - itemscope -> N/A
 * - allowfullscreen -> allowFullscreen
 * - formnovalidate -> formNoValidate
 * - ismap -> isMap
 * - nomodule -> noModule
 * - novalidate -> noValidate
 * - readonly -> readOnly
 */
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /*#__PURE__*/ makeMap(specialBooleanAttrs);
/**
 * Boolean attributes should be included if the value is truthy or ''.
 * e.g. `<select multiple>` compiles to `{ multiple: '' }`
 */
function includeBooleanAttr(value) {
    return !!value || value === '';
}

function normalizeStyle(value) {
    if (isArray(value)) {
        const res = {};
        for (let i = 0; i < value.length; i++) {
            const item = value[i];
            const normalized = isString$1(item)
                ? parseStringStyle(item)
                : normalizeStyle(item);
            if (normalized) {
                for (const key in normalized) {
                    res[key] = normalized[key];
                }
            }
        }
        return res;
    }
    else if (isString$1(value)) {
        return value;
    }
    else if (isObject(value)) {
        return value;
    }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
    const ret = {};
    cssText.split(listDelimiterRE).forEach(item => {
        if (item) {
            const tmp = item.split(propertyDelimiterRE);
            tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
        }
    });
    return ret;
}
function normalizeClass(value) {
    let res = '';
    if (isString$1(value)) {
        res = value;
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const normalized = normalizeClass(value[i]);
            if (normalized) {
                res += normalized + ' ';
            }
        }
    }
    else if (isObject(value)) {
        for (const name in value) {
            if (value[name]) {
                res += name + ' ';
            }
        }
    }
    return res.trim();
}

/**
 * For converting {{ interpolation }} values to displayed strings.
 * @private
 */
const toDisplayString = (val) => {
    return isString$1(val)
        ? val
        : val == null
            ? ''
            : isArray(val) ||
                (isObject(val) &&
                    (val.toString === objectToString || !isFunction(val.toString)))
                ? JSON.stringify(val, replacer, 2)
                : String(val);
};
const replacer = (_key, val) => {
    // can't use isRef here since @vue/shared has no deps
    if (val && val.__v_isRef) {
        return replacer(_key, val.value);
    }
    else if (isMap(val)) {
        return {
            [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val]) => {
                entries[`${key} =>`] = val;
                return entries;
            }, {})
        };
    }
    else if (isSet(val)) {
        return {
            [`Set(${val.size})`]: [...val.values()]
        };
    }
    else if (isObject(val) && !isArray(val) && !isPlainObject(val)) {
        return String(val);
    }
    return val;
};

const EMPTY_OBJ = ({}.NODE_ENV !== 'production')
    ? Object.freeze({})
    : {};
const EMPTY_ARR = ({}.NODE_ENV !== 'production') ? Object.freeze([]) : [];
const NOOP = () => { };
/**
 * Always return false.
 */
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith('onUpdate:');
const extend = Object.assign;
const remove = (arr, el) => {
    const i = arr.indexOf(el);
    if (i > -1) {
        arr.splice(i, 1);
    }
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === '[object Map]';
const isSet = (val) => toTypeString(val) === '[object Set]';
const isFunction = (val) => typeof val === 'function';
const isString$1 = (val) => typeof val === 'string';
const isSymbol = (val) => typeof val === 'symbol';
const isObject = (val) => val !== null && typeof val === 'object';
const isPromise = (val) => {
    return isObject(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
    // extract "RawType" from strings like "[object RawType]"
    return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === '[object Object]';
const isIntegerKey = (key) => isString$1(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key;
const isReservedProp = /*#__PURE__*/ makeMap(
// the leading comma is intentional so empty string "" is also included
',key,ref,ref_for,ref_key,' +
    'onVnodeBeforeMount,onVnodeMounted,' +
    'onVnodeBeforeUpdate,onVnodeUpdated,' +
    'onVnodeBeforeUnmount,onVnodeUnmounted');
const isBuiltInDirective = /*#__PURE__*/ makeMap('bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo');
const cacheStringFunction = (fn) => {
    const cache = Object.create(null);
    return ((str) => {
        const hit = cache[str];
        return hit || (cache[str] = fn(str));
    });
};
const camelizeRE = /-(\w)/g;
/**
 * @private
 */
const camelize = cacheStringFunction((str) => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));
});
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, '-$1').toLowerCase());
/**
 * @private
 */
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
/**
 * @private
 */
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
// compare whether a value has changed, accounting for NaN.
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
    for (let i = 0; i < fns.length; i++) {
        fns[i](arg);
    }
};
const def = (obj, key, value) => {
    Object.defineProperty(obj, key, {
        configurable: true,
        enumerable: false,
        value
    });
};
const toNumber = (val) => {
    const n = parseFloat(val);
    return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
    return (_globalThis ||
        (_globalThis =
            typeof globalThis !== 'undefined'
                ? globalThis
                : typeof self !== 'undefined'
                    ? self
                    : typeof window !== 'undefined'
                        ? window
                        : typeof global !== 'undefined'
                            ? global
                            : {}));
};

function warn$1(msg, ...args) {
    console.warn(`[Vue warn] ${msg}`, ...args);
}

let activeEffectScope;
class EffectScope {
    constructor(detached = false) {
        /**
         * @internal
         */
        this.active = true;
        /**
         * @internal
         */
        this.effects = [];
        /**
         * @internal
         */
        this.cleanups = [];
        if (!detached && activeEffectScope) {
            this.parent = activeEffectScope;
            this.index =
                (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(this) - 1;
        }
    }
    run(fn) {
        if (this.active) {
            const currentEffectScope = activeEffectScope;
            try {
                activeEffectScope = this;
                return fn();
            }
            finally {
                activeEffectScope = currentEffectScope;
            }
        }
        else if (({}.NODE_ENV !== 'production')) {
            warn$1(`cannot run an inactive effect scope.`);
        }
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    on() {
        activeEffectScope = this;
    }
    /**
     * This should only be called on non-detached scopes
     * @internal
     */
    off() {
        activeEffectScope = this.parent;
    }
    stop(fromParent) {
        if (this.active) {
            let i, l;
            for (i = 0, l = this.effects.length; i < l; i++) {
                this.effects[i].stop();
            }
            for (i = 0, l = this.cleanups.length; i < l; i++) {
                this.cleanups[i]();
            }
            if (this.scopes) {
                for (i = 0, l = this.scopes.length; i < l; i++) {
                    this.scopes[i].stop(true);
                }
            }
            // nested scope, dereference from parent to avoid memory leaks
            if (this.parent && !fromParent) {
                // optimized O(1) removal
                const last = this.parent.scopes.pop();
                if (last && last !== this) {
                    this.parent.scopes[this.index] = last;
                    last.index = this.index;
                }
            }
            this.active = false;
        }
    }
}
function recordEffectScope(effect, scope = activeEffectScope) {
    if (scope && scope.active) {
        scope.effects.push(effect);
    }
}
function getCurrentScope() {
    return activeEffectScope;
}
function onScopeDispose(fn) {
    if (activeEffectScope) {
        activeEffectScope.cleanups.push(fn);
    }
    else if (({}.NODE_ENV !== 'production')) {
        warn$1(`onScopeDispose() is called when there is no active effect scope` +
            ` to be associated with.`);
    }
}

const createDep = (effects) => {
    const dep = new Set(effects);
    dep.w = 0;
    dep.n = 0;
    return dep;
};
const wasTracked = (dep) => (dep.w & trackOpBit) > 0;
const newTracked = (dep) => (dep.n & trackOpBit) > 0;
const initDepMarkers = ({ deps }) => {
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].w |= trackOpBit; // set was tracked
        }
    }
};
const finalizeDepMarkers = (effect) => {
    const { deps } = effect;
    if (deps.length) {
        let ptr = 0;
        for (let i = 0; i < deps.length; i++) {
            const dep = deps[i];
            if (wasTracked(dep) && !newTracked(dep)) {
                dep.delete(effect);
            }
            else {
                deps[ptr++] = dep;
            }
            // clear bits
            dep.w &= ~trackOpBit;
            dep.n &= ~trackOpBit;
        }
        deps.length = ptr;
    }
};

const targetMap = new WeakMap();
// The number of effects currently being tracked recursively.
let effectTrackDepth = 0;
let trackOpBit = 1;
/**
 * The bitwise track markers support at most 30 levels of recursion.
 * This value is chosen to enable modern JS engines to use a SMI on all platforms.
 * When recursion depth is greater, fall back to using a full cleanup.
 */
const maxMarkerBits = 30;
let activeEffect;
const ITERATE_KEY = Symbol(({}.NODE_ENV !== 'production') ? 'iterate' : '');
const MAP_KEY_ITERATE_KEY = Symbol(({}.NODE_ENV !== 'production') ? 'Map key iterate' : '');
class ReactiveEffect {
    constructor(fn, scheduler = null, scope) {
        this.fn = fn;
        this.scheduler = scheduler;
        this.active = true;
        this.deps = [];
        this.parent = undefined;
        recordEffectScope(this, scope);
    }
    run() {
        if (!this.active) {
            return this.fn();
        }
        let parent = activeEffect;
        let lastShouldTrack = shouldTrack;
        while (parent) {
            if (parent === this) {
                return;
            }
            parent = parent.parent;
        }
        try {
            this.parent = activeEffect;
            activeEffect = this;
            shouldTrack = true;
            trackOpBit = 1 << ++effectTrackDepth;
            if (effectTrackDepth <= maxMarkerBits) {
                initDepMarkers(this);
            }
            else {
                cleanupEffect(this);
            }
            return this.fn();
        }
        finally {
            if (effectTrackDepth <= maxMarkerBits) {
                finalizeDepMarkers(this);
            }
            trackOpBit = 1 << --effectTrackDepth;
            activeEffect = this.parent;
            shouldTrack = lastShouldTrack;
            this.parent = undefined;
            if (this.deferStop) {
                this.stop();
            }
        }
    }
    stop() {
        // stopped while running itself - defer the cleanup
        if (activeEffect === this) {
            this.deferStop = true;
        }
        else if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    const { deps } = effect;
    if (deps.length) {
        for (let i = 0; i < deps.length; i++) {
            deps[i].delete(effect);
        }
        deps.length = 0;
    }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = false;
}
function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
}
function track(target, type, key) {
    if (shouldTrack && activeEffect) {
        let depsMap = targetMap.get(target);
        if (!depsMap) {
            targetMap.set(target, (depsMap = new Map()));
        }
        let dep = depsMap.get(key);
        if (!dep) {
            depsMap.set(key, (dep = createDep()));
        }
        const eventInfo = ({}.NODE_ENV !== 'production')
            ? { effect: activeEffect, target, type, key }
            : undefined;
        trackEffects(dep, eventInfo);
    }
}
function trackEffects(dep, debuggerEventExtraInfo) {
    let shouldTrack = false;
    if (effectTrackDepth <= maxMarkerBits) {
        if (!newTracked(dep)) {
            dep.n |= trackOpBit; // set newly tracked
            shouldTrack = !wasTracked(dep);
        }
    }
    else {
        // Full cleanup mode.
        shouldTrack = !dep.has(activeEffect);
    }
    if (shouldTrack) {
        dep.add(activeEffect);
        activeEffect.deps.push(dep);
        if (({}.NODE_ENV !== 'production') && activeEffect.onTrack) {
            activeEffect.onTrack(Object.assign({ effect: activeEffect }, debuggerEventExtraInfo));
        }
    }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
    const depsMap = targetMap.get(target);
    if (!depsMap) {
        // never been tracked
        return;
    }
    let deps = [];
    if (type === "clear" /* CLEAR */) {
        // collection being cleared
        // trigger all effects for target
        deps = [...depsMap.values()];
    }
    else if (key === 'length' && isArray(target)) {
        depsMap.forEach((dep, key) => {
            if (key === 'length' || key >= newValue) {
                deps.push(dep);
            }
        });
    }
    else {
        // schedule runs for SET | ADD | DELETE
        if (key !== void 0) {
            deps.push(depsMap.get(key));
        }
        // also run for iteration key on ADD | DELETE | Map.SET
        switch (type) {
            case "add" /* ADD */:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                else if (isIntegerKey(key)) {
                    // new index added to array -> length changes
                    deps.push(depsMap.get('length'));
                }
                break;
            case "delete" /* DELETE */:
                if (!isArray(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                    if (isMap(target)) {
                        deps.push(depsMap.get(MAP_KEY_ITERATE_KEY));
                    }
                }
                break;
            case "set" /* SET */:
                if (isMap(target)) {
                    deps.push(depsMap.get(ITERATE_KEY));
                }
                break;
        }
    }
    const eventInfo = ({}.NODE_ENV !== 'production')
        ? { target, type, key, newValue, oldValue, oldTarget }
        : undefined;
    if (deps.length === 1) {
        if (deps[0]) {
            if (({}.NODE_ENV !== 'production')) {
                triggerEffects(deps[0], eventInfo);
            }
            else {
                triggerEffects(deps[0]);
            }
        }
    }
    else {
        const effects = [];
        for (const dep of deps) {
            if (dep) {
                effects.push(...dep);
            }
        }
        if (({}.NODE_ENV !== 'production')) {
            triggerEffects(createDep(effects), eventInfo);
        }
        else {
            triggerEffects(createDep(effects));
        }
    }
}
function triggerEffects(dep, debuggerEventExtraInfo) {
    // spread into array for stabilization
    const effects = isArray(dep) ? dep : [...dep];
    for (const effect of effects) {
        if (effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
    for (const effect of effects) {
        if (!effect.computed) {
            triggerEffect(effect, debuggerEventExtraInfo);
        }
    }
}
function triggerEffect(effect, debuggerEventExtraInfo) {
    if (effect !== activeEffect || effect.allowRecurse) {
        if (({}.NODE_ENV !== 'production') && effect.onTrigger) {
            effect.onTrigger(extend({ effect }, debuggerEventExtraInfo));
        }
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}

const isNonTrackableKeys = /*#__PURE__*/ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
/*#__PURE__*/
Object.getOwnPropertyNames(Symbol)
    // ios10.x Object.getOwnPropertyNames(Symbol) can enumerate 'arguments' and 'caller'
    // but accessing them on Symbol leads to TypeError because Symbol is a strict mode
    // function
    .filter(key => key !== 'arguments' && key !== 'caller')
    .map(key => Symbol[key])
    .filter(isSymbol));
const get = /*#__PURE__*/ createGetter();
const shallowGet = /*#__PURE__*/ createGetter(false, true);
const readonlyGet = /*#__PURE__*/ createGetter(true);
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true);
const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations();
function createArrayInstrumentations() {
    const instrumentations = {};
    ['includes', 'indexOf', 'lastIndexOf'].forEach(key => {
        instrumentations[key] = function (...args) {
            const arr = toRaw(this);
            for (let i = 0, l = this.length; i < l; i++) {
                track(arr, "get" /* GET */, i + '');
            }
            // we run the method using the original args first (which may be reactive)
            const res = arr[key](...args);
            if (res === -1 || res === false) {
                // if that didn't work, run it again using raw values.
                return arr[key](...args.map(toRaw));
            }
            else {
                return res;
            }
        };
    });
    ['push', 'pop', 'shift', 'unshift', 'splice'].forEach(key => {
        instrumentations[key] = function (...args) {
            pauseTracking();
            const res = toRaw(this)[key].apply(this, args);
            resetTracking();
            return res;
        };
    });
    return instrumentations;
}
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_isShallow" /* IS_SHALLOW */) {
            return shallow;
        }
        else if (key === "__v_raw" /* RAW */ &&
            receiver ===
                (isReadonly
                    ? shallow
                        ? shallowReadonlyMap
                        : readonlyMap
                    : shallow
                        ? shallowReactiveMap
                        : reactiveMap).get(target)) {
            return target;
        }
        const targetIsArray = isArray(target);
        if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
            return Reflect.get(arrayInstrumentations, key, receiver);
        }
        const res = Reflect.get(target, key, receiver);
        if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
            return res;
        }
        if (!isReadonly) {
            track(target, "get" /* GET */, key);
        }
        if (shallow) {
            return res;
        }
        if (isRef(res)) {
            // ref unwrapping - skip unwrap for Array + integer key.
            return targetIsArray && isIntegerKey(key) ? res : res.value;
        }
        if (isObject(res)) {
            // Convert returned value into a proxy as well. we do the isObject check
            // here to avoid invalid value warning. Also need to lazy access readonly
            // and reactive here to avoid circular dependency.
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
const set$1 = /*#__PURE__*/ createSetter();
const shallowSet = /*#__PURE__*/ createSetter(true);
function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        let oldValue = target[key];
        if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
            return false;
        }
        if (!shallow && !isReadonly(value)) {
            if (!isShallow$1(value)) {
                value = toRaw(value);
                oldValue = toRaw(oldValue);
            }
            if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                oldValue.value = value;
                return true;
            }
        }
        const hadKey = isArray(target) && isIntegerKey(key)
            ? Number(key) < target.length
            : hasOwn(target, key);
        const result = Reflect.set(target, key, value, receiver);
        // don't trigger if target is something up in the prototype chain of original
        if (target === toRaw(receiver)) {
            if (!hadKey) {
                trigger(target, "add" /* ADD */, key, value);
            }
            else if (hasChanged(value, oldValue)) {
                trigger(target, "set" /* SET */, key, value, oldValue);
            }
        }
        return result;
    };
}
function deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    const oldValue = target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
        trigger(target, "delete" /* DELETE */, key, undefined, oldValue);
    }
    return result;
}
function has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol(key) || !builtInSymbols.has(key)) {
        track(target, "has" /* HAS */, key);
    }
    return result;
}
function ownKeys(target) {
    track(target, "iterate" /* ITERATE */, isArray(target) ? 'length' : ITERATE_KEY);
    return Reflect.ownKeys(target);
}
const mutableHandlers = {
    get,
    set: set$1,
    deleteProperty,
    has,
    ownKeys
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        if (({}.NODE_ENV !== 'production')) {
            warn$1(`Set operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    },
    deleteProperty(target, key) {
        if (({}.NODE_ENV !== 'production')) {
            warn$1(`Delete operation on key "${String(key)}" failed: target is readonly.`, target);
        }
        return true;
    }
};
const shallowReactiveHandlers = /*#__PURE__*/ extend({}, mutableHandlers, {
    get: shallowGet,
    set: shallowSet
});
// Props handlers are special in the sense that it should not unwrap top-level
// refs (in order to allow refs to be explicitly passed down), but should
// retain the reactivity of the normal readonly object.
const shallowReadonlyHandlers = /*#__PURE__*/ extend({}, readonlyHandlers, {
    get: shallowReadonlyGet
});

const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function get$1(target, key, isReadonly = false, isShallow = false) {
    // #1772: readonly(reactive(Map)) should return readonly + reactive version
    // of the value
    target = target["__v_raw" /* RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if (key !== rawKey) {
            track(rawTarget, "get" /* GET */, key);
        }
        track(rawTarget, "get" /* GET */, rawKey);
    }
    const { has } = getProto(rawTarget);
    const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
    if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
    }
    else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
    }
    else if (target !== rawTarget) {
        // #3602 readonly(reactive(Map))
        // ensure that the nested reactive `Map` can do tracking for itself
        target.get(key);
    }
}
function has$1(key, isReadonly = false) {
    const target = this["__v_raw" /* RAW */];
    const rawTarget = toRaw(target);
    const rawKey = toRaw(key);
    if (!isReadonly) {
        if (key !== rawKey) {
            track(rawTarget, "has" /* HAS */, key);
        }
        track(rawTarget, "has" /* HAS */, rawKey);
    }
    return key === rawKey
        ? target.has(key)
        : target.has(key) || target.has(rawKey);
}
function size(target, isReadonly = false) {
    target = target["__v_raw" /* RAW */];
    !isReadonly && track(toRaw(target), "iterate" /* ITERATE */, ITERATE_KEY);
    return Reflect.get(target, 'size', target);
}
function add(value) {
    value = toRaw(value);
    const target = toRaw(this);
    const proto = getProto(target);
    const hadKey = proto.has.call(target, value);
    if (!hadKey) {
        target.add(value);
        trigger(target, "add" /* ADD */, value, value);
    }
    return this;
}
function set$1$1(key, value) {
    value = toRaw(value);
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else if (({}.NODE_ENV !== 'production')) {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get.call(target, key);
    target.set(key, value);
    if (!hadKey) {
        trigger(target, "add" /* ADD */, key, value);
    }
    else if (hasChanged(value, oldValue)) {
        trigger(target, "set" /* SET */, key, value, oldValue);
    }
    return this;
}
function deleteEntry(key) {
    const target = toRaw(this);
    const { has, get } = getProto(target);
    let hadKey = has.call(target, key);
    if (!hadKey) {
        key = toRaw(key);
        hadKey = has.call(target, key);
    }
    else if (({}.NODE_ENV !== 'production')) {
        checkIdentityKeys(target, has, key);
    }
    const oldValue = get ? get.call(target, key) : undefined;
    // forward the operation before queueing reactions
    const result = target.delete(key);
    if (hadKey) {
        trigger(target, "delete" /* DELETE */, key, undefined, oldValue);
    }
    return result;
}
function clear() {
    const target = toRaw(this);
    const hadItems = target.size !== 0;
    const oldTarget = ({}.NODE_ENV !== 'production')
        ? isMap(target)
            ? new Map(target)
            : new Set(target)
        : undefined;
    // forward the operation before queueing reactions
    const result = target.clear();
    if (hadItems) {
        trigger(target, "clear" /* CLEAR */, undefined, undefined, oldTarget);
    }
    return result;
}
function createForEach(isReadonly, isShallow) {
    return function forEach(callback, thisArg) {
        const observed = this;
        const target = observed["__v_raw" /* RAW */];
        const rawTarget = toRaw(target);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly && track(rawTarget, "iterate" /* ITERATE */, ITERATE_KEY);
        return target.forEach((value, key) => {
            // important: make sure the callback is
            // 1. invoked with the reactive map as `this` and 3rd arg
            // 2. the value received should be a corresponding reactive/readonly.
            return callback.call(thisArg, wrap(value), wrap(key), observed);
        });
    };
}
function createIterableMethod(method, isReadonly, isShallow) {
    return function (...args) {
        const target = this["__v_raw" /* RAW */];
        const rawTarget = toRaw(target);
        const targetIsMap = isMap(rawTarget);
        const isPair = method === 'entries' || (method === Symbol.iterator && targetIsMap);
        const isKeyOnly = method === 'keys' && targetIsMap;
        const innerIterator = target[method](...args);
        const wrap = isShallow ? toShallow : isReadonly ? toReadonly : toReactive;
        !isReadonly &&
            track(rawTarget, "iterate" /* ITERATE */, isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY);
        // return a wrapped iterator which returns observed versions of the
        // values emitted from the real iterator
        return {
            // iterator protocol
            next() {
                const { value, done } = innerIterator.next();
                return done
                    ? { value, done }
                    : {
                        value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
                        done
                    };
            },
            // iterable protocol
            [Symbol.iterator]() {
                return this;
            }
        };
    };
}
function createReadonlyMethod(type) {
    return function (...args) {
        if (({}.NODE_ENV !== 'production')) {
            const key = args[0] ? `on key "${args[0]}" ` : ``;
            console.warn(`${capitalize(type)} operation ${key}failed: target is readonly.`, toRaw(this));
        }
        return type === "delete" /* DELETE */ ? false : this;
    };
}
function createInstrumentations() {
    const mutableInstrumentations = {
        get(key) {
            return get$1(this, key);
        },
        get size() {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, false)
    };
    const shallowInstrumentations = {
        get(key) {
            return get$1(this, key, false, true);
        },
        get size() {
            return size(this);
        },
        has: has$1,
        add,
        set: set$1$1,
        delete: deleteEntry,
        clear,
        forEach: createForEach(false, true)
    };
    const readonlyInstrumentations = {
        get(key) {
            return get$1(this, key, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* ADD */),
        set: createReadonlyMethod("set" /* SET */),
        delete: createReadonlyMethod("delete" /* DELETE */),
        clear: createReadonlyMethod("clear" /* CLEAR */),
        forEach: createForEach(true, false)
    };
    const shallowReadonlyInstrumentations = {
        get(key) {
            return get$1(this, key, true, true);
        },
        get size() {
            return size(this, true);
        },
        has(key) {
            return has$1.call(this, key, true);
        },
        add: createReadonlyMethod("add" /* ADD */),
        set: createReadonlyMethod("set" /* SET */),
        delete: createReadonlyMethod("delete" /* DELETE */),
        clear: createReadonlyMethod("clear" /* CLEAR */),
        forEach: createForEach(true, true)
    };
    const iteratorMethods = ['keys', 'values', 'entries', Symbol.iterator];
    iteratorMethods.forEach(method => {
        mutableInstrumentations[method] = createIterableMethod(method, false, false);
        readonlyInstrumentations[method] = createIterableMethod(method, true, false);
        shallowInstrumentations[method] = createIterableMethod(method, false, true);
        shallowReadonlyInstrumentations[method] = createIterableMethod(method, true, true);
    });
    return [
        mutableInstrumentations,
        readonlyInstrumentations,
        shallowInstrumentations,
        shallowReadonlyInstrumentations
    ];
}
const [mutableInstrumentations, readonlyInstrumentations, shallowInstrumentations, shallowReadonlyInstrumentations] = /* #__PURE__*/ createInstrumentations();
function createInstrumentationGetter(isReadonly, shallow) {
    const instrumentations = shallow
        ? isReadonly
            ? shallowReadonlyInstrumentations
            : shallowInstrumentations
        : isReadonly
            ? readonlyInstrumentations
            : mutableInstrumentations;
    return (target, key, receiver) => {
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        else if (key === "__v_raw" /* RAW */) {
            return target;
        }
        return Reflect.get(hasOwn(instrumentations, key) && key in target
            ? instrumentations
            : target, key, receiver);
    };
}
const mutableCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
    get: /*#__PURE__*/ createInstrumentationGetter(true, true)
};
function checkIdentityKeys(target, has, key) {
    const rawKey = toRaw(key);
    if (rawKey !== key && has.call(target, rawKey)) {
        const type = toRawType(target);
        console.warn(`Reactive ${type} contains both the raw and reactive ` +
            `versions of the same object${type === `Map` ? ` as keys` : ``}, ` +
            `which can lead to inconsistencies. ` +
            `Avoid differentiating between the raw and reactive versions ` +
            `of an object and only use the reactive version if possible.`);
    }
}

const reactiveMap = new WeakMap();
const shallowReactiveMap = new WeakMap();
const readonlyMap = new WeakMap();
const shallowReadonlyMap = new WeakMap();
function targetTypeMap(rawType) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return 1 /* COMMON */;
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return 2 /* COLLECTION */;
        default:
            return 0 /* INVALID */;
    }
}
function getTargetType(value) {
    return value["__v_skip" /* SKIP */] || !Object.isExtensible(value)
        ? 0 /* INVALID */
        : targetTypeMap(toRawType(value));
}
function reactive(target) {
    // if trying to observe a readonly proxy, return the readonly version.
    if (isReadonly(target)) {
        return target;
    }
    return createReactiveObject(target, false, mutableHandlers, mutableCollectionHandlers, reactiveMap);
}
/**
 * Return a shallowly-reactive copy of the original object, where only the root
 * level properties are reactive. It also does not auto-unwrap refs (even at the
 * root level).
 */
function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowCollectionHandlers, shallowReactiveMap);
}
/**
 * Creates a readonly copy of the original object. Note the returned copy is not
 * made reactive, but `readonly` can be called on an already reactive object.
 */
function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers, readonlyCollectionHandlers, readonlyMap);
}
/**
 * Returns a reactive-copy of the original object, where only the root level
 * properties are readonly, and does NOT unwrap refs nor recursively convert
 * returned properties.
 * This is used for creating the props proxy object for stateful components.
 */
function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyCollectionHandlers, shallowReadonlyMap);
}
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, proxyMap) {
    if (!isObject(target)) {
        if (({}.NODE_ENV !== 'production')) {
            console.warn(`value cannot be made reactive: ${String(target)}`);
        }
        return target;
    }
    // target is already a Proxy, return it.
    // exception: calling readonly() on a reactive object
    if (target["__v_raw" /* RAW */] &&
        !(isReadonly && target["__v_isReactive" /* IS_REACTIVE */])) {
        return target;
    }
    // target already has corresponding Proxy
    const existingProxy = proxyMap.get(target);
    if (existingProxy) {
        return existingProxy;
    }
    // only specific value types can be observed.
    const targetType = getTargetType(target);
    if (targetType === 0 /* INVALID */) {
        return target;
    }
    const proxy = new Proxy(target, targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers);
    proxyMap.set(target, proxy);
    return proxy;
}
function isReactive(value) {
    if (isReadonly(value)) {
        return isReactive(value["__v_raw" /* RAW */]);
    }
    return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}
function isReadonly(value) {
    return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
}
function isShallow$1(value) {
    return !!(value && value["__v_isShallow" /* IS_SHALLOW */]);
}
function isProxy(value) {
    return isReactive(value) || isReadonly(value);
}
function toRaw(observed) {
    const raw = observed && observed["__v_raw" /* RAW */];
    return raw ? toRaw(raw) : observed;
}
function markRaw(value) {
    def(value, "__v_skip" /* SKIP */, true);
    return value;
}
const toReactive = (value) => isObject(value) ? reactive(value) : value;
const toReadonly = (value) => isObject(value) ? readonly(value) : value;

function trackRefValue(ref) {
    if (shouldTrack && activeEffect) {
        ref = toRaw(ref);
        if (({}.NODE_ENV !== 'production')) {
            trackEffects(ref.dep || (ref.dep = createDep()), {
                target: ref,
                type: "get" /* GET */,
                key: 'value'
            });
        }
        else {
            trackEffects(ref.dep || (ref.dep = createDep()));
        }
    }
}
function triggerRefValue(ref, newVal) {
    ref = toRaw(ref);
    if (ref.dep) {
        if (({}.NODE_ENV !== 'production')) {
            triggerEffects(ref.dep, {
                target: ref,
                type: "set" /* SET */,
                key: 'value',
                newValue: newVal
            });
        }
        else {
            triggerEffects(ref.dep);
        }
    }
}
function isRef(r) {
    return !!(r && r.__v_isRef === true);
}
function ref(value) {
    return createRef(value, false);
}
function createRef(rawValue, shallow) {
    if (isRef(rawValue)) {
        return rawValue;
    }
    return new RefImpl(rawValue, shallow);
}
class RefImpl {
    constructor(value, __v_isShallow) {
        this.__v_isShallow = __v_isShallow;
        this.dep = undefined;
        this.__v_isRef = true;
        this._rawValue = __v_isShallow ? value : toRaw(value);
        this._value = __v_isShallow ? value : toReactive(value);
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newVal) {
        newVal = this.__v_isShallow ? newVal : toRaw(newVal);
        if (hasChanged(newVal, this._rawValue)) {
            this._rawValue = newVal;
            this._value = this.__v_isShallow ? newVal : toReactive(newVal);
            triggerRefValue(this, newVal);
        }
    }
}
function unref(ref) {
    return isRef(ref) ? ref.value : ref;
}
const shallowUnwrapHandlers = {
    get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
    set: (target, key, value, receiver) => {
        const oldValue = target[key];
        if (isRef(oldValue) && !isRef(value)) {
            oldValue.value = value;
            return true;
        }
        else {
            return Reflect.set(target, key, value, receiver);
        }
    }
};
function proxyRefs(objectWithRefs) {
    return isReactive(objectWithRefs)
        ? objectWithRefs
        : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
function toRefs(object) {
    if (({}.NODE_ENV !== 'production') && !isProxy(object)) {
        console.warn(`toRefs() expects a reactive object but received a plain one.`);
    }
    const ret = isArray(object) ? new Array(object.length) : {};
    for (const key in object) {
        ret[key] = toRef(object, key);
    }
    return ret;
}
class ObjectRefImpl {
    constructor(_object, _key, _defaultValue) {
        this._object = _object;
        this._key = _key;
        this._defaultValue = _defaultValue;
        this.__v_isRef = true;
    }
    get value() {
        const val = this._object[this._key];
        return val === undefined ? this._defaultValue : val;
    }
    set value(newVal) {
        this._object[this._key] = newVal;
    }
}
function toRef(object, key, defaultValue) {
    const val = object[key];
    return isRef(val)
        ? val
        : new ObjectRefImpl(object, key, defaultValue);
}

class ComputedRefImpl {
    constructor(getter, _setter, isReadonly, isSSR) {
        this._setter = _setter;
        this.dep = undefined;
        this.__v_isRef = true;
        this._dirty = true;
        this.effect = new ReactiveEffect(getter, () => {
            if (!this._dirty) {
                this._dirty = true;
                triggerRefValue(this);
            }
        });
        this.effect.computed = this;
        this.effect.active = this._cacheable = !isSSR;
        this["__v_isReadonly" /* IS_READONLY */] = isReadonly;
    }
    get value() {
        // the computed ref may get wrapped by other proxies e.g. readonly() #3376
        const self = toRaw(this);
        trackRefValue(self);
        if (self._dirty || !self._cacheable) {
            self._dirty = false;
            self._value = self.effect.run();
        }
        return self._value;
    }
    set value(newValue) {
        this._setter(newValue);
    }
}
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
    let getter;
    let setter;
    const onlyGetter = isFunction(getterOrOptions);
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = ({}.NODE_ENV !== 'production')
            ? () => {
                console.warn('Write operation failed: computed value is readonly');
            }
            : NOOP;
    }
    else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }
    const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter, isSSR);
    if (({}.NODE_ENV !== 'production') && debugOptions && !isSSR) {
        cRef.effect.onTrack = debugOptions.onTrack;
        cRef.effect.onTrigger = debugOptions.onTrigger;
    }
    return cRef;
}

const stack = [];
function pushWarningContext(vnode) {
    stack.push(vnode);
}
function popWarningContext() {
    stack.pop();
}
function warn(msg, ...args) {
    // avoid props formatting or warn handler tracking deps that might be mutated
    // during patch, leading to infinite recursion.
    pauseTracking();
    const instance = stack.length ? stack[stack.length - 1].component : null;
    const appWarnHandler = instance && instance.appContext.config.warnHandler;
    const trace = getComponentTrace();
    if (appWarnHandler) {
        callWithErrorHandling(appWarnHandler, instance, 11 /* APP_WARN_HANDLER */, [
            msg + args.join(''),
            instance && instance.proxy,
            trace
                .map(({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`)
                .join('\n'),
            trace
        ]);
    }
    else {
        const warnArgs = [`[Vue warn]: ${msg}`, ...args];
        /* istanbul ignore if */
        if (trace.length &&
            // avoid spamming console during tests
            !false) {
            warnArgs.push(`\n`, ...formatTrace(trace));
        }
        console.warn(...warnArgs);
    }
    resetTracking();
}
function getComponentTrace() {
    let currentVNode = stack[stack.length - 1];
    if (!currentVNode) {
        return [];
    }
    // we can't just use the stack because it will be incomplete during updates
    // that did not start from the root. Re-construct the parent chain using
    // instance parent pointers.
    const normalizedStack = [];
    while (currentVNode) {
        const last = normalizedStack[0];
        if (last && last.vnode === currentVNode) {
            last.recurseCount++;
        }
        else {
            normalizedStack.push({
                vnode: currentVNode,
                recurseCount: 0
            });
        }
        const parentInstance = currentVNode.component && currentVNode.component.parent;
        currentVNode = parentInstance && parentInstance.vnode;
    }
    return normalizedStack;
}
/* istanbul ignore next */
function formatTrace(trace) {
    const logs = [];
    trace.forEach((entry, i) => {
        logs.push(...(i === 0 ? [] : [`\n`]), ...formatTraceEntry(entry));
    });
    return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
    const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
    const isRoot = vnode.component ? vnode.component.parent == null : false;
    const open = ` at <${formatComponentName(vnode.component, vnode.type, isRoot)}`;
    const close = `>` + postfix;
    return vnode.props
        ? [open, ...formatProps(vnode.props), close]
        : [open + close];
}
/* istanbul ignore next */
function formatProps(props) {
    const res = [];
    const keys = Object.keys(props);
    keys.slice(0, 3).forEach(key => {
        res.push(...formatProp(key, props[key]));
    });
    if (keys.length > 3) {
        res.push(` ...`);
    }
    return res;
}
/* istanbul ignore next */
function formatProp(key, value, raw) {
    if (isString$1(value)) {
        value = JSON.stringify(value);
        return raw ? value : [`${key}=${value}`];
    }
    else if (typeof value === 'number' ||
        typeof value === 'boolean' ||
        value == null) {
        return raw ? value : [`${key}=${value}`];
    }
    else if (isRef(value)) {
        value = formatProp(key, toRaw(value.value), true);
        return raw ? value : [`${key}=Ref<`, value, `>`];
    }
    else if (isFunction(value)) {
        return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
    }
    else {
        value = toRaw(value);
        return raw ? value : [`${key}=`, value];
    }
}

const ErrorTypeStrings = {
    ["sp" /* SERVER_PREFETCH */]: 'serverPrefetch hook',
    ["bc" /* BEFORE_CREATE */]: 'beforeCreate hook',
    ["c" /* CREATED */]: 'created hook',
    ["bm" /* BEFORE_MOUNT */]: 'beforeMount hook',
    ["m" /* MOUNTED */]: 'mounted hook',
    ["bu" /* BEFORE_UPDATE */]: 'beforeUpdate hook',
    ["u" /* UPDATED */]: 'updated',
    ["bum" /* BEFORE_UNMOUNT */]: 'beforeUnmount hook',
    ["um" /* UNMOUNTED */]: 'unmounted hook',
    ["a" /* ACTIVATED */]: 'activated hook',
    ["da" /* DEACTIVATED */]: 'deactivated hook',
    ["ec" /* ERROR_CAPTURED */]: 'errorCaptured hook',
    ["rtc" /* RENDER_TRACKED */]: 'renderTracked hook',
    ["rtg" /* RENDER_TRIGGERED */]: 'renderTriggered hook',
    [0 /* SETUP_FUNCTION */]: 'setup function',
    [1 /* RENDER_FUNCTION */]: 'render function',
    [2 /* WATCH_GETTER */]: 'watcher getter',
    [3 /* WATCH_CALLBACK */]: 'watcher callback',
    [4 /* WATCH_CLEANUP */]: 'watcher cleanup function',
    [5 /* NATIVE_EVENT_HANDLER */]: 'native event handler',
    [6 /* COMPONENT_EVENT_HANDLER */]: 'component event handler',
    [7 /* VNODE_HOOK */]: 'vnode hook',
    [8 /* DIRECTIVE_HOOK */]: 'directive hook',
    [9 /* TRANSITION_HOOK */]: 'transition hook',
    [10 /* APP_ERROR_HANDLER */]: 'app errorHandler',
    [11 /* APP_WARN_HANDLER */]: 'app warnHandler',
    [12 /* FUNCTION_REF */]: 'ref function',
    [13 /* ASYNC_COMPONENT_LOADER */]: 'async component loader',
    [14 /* SCHEDULER */]: 'scheduler flush. This is likely a Vue internals bug. ' +
        'Please open an issue at https://new-issue.vuejs.org/?repo=vuejs/core'
};
function callWithErrorHandling(fn, instance, type, args) {
    let res;
    try {
        res = args ? fn(...args) : fn();
    }
    catch (err) {
        handleError(err, instance, type);
    }
    return res;
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
    if (isFunction(fn)) {
        const res = callWithErrorHandling(fn, instance, type, args);
        if (res && isPromise(res)) {
            res.catch(err => {
                handleError(err, instance, type);
            });
        }
        return res;
    }
    const values = [];
    for (let i = 0; i < fn.length; i++) {
        values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
}
function handleError(err, instance, type, throwInDev = true) {
    const contextVNode = instance ? instance.vnode : null;
    if (instance) {
        let cur = instance.parent;
        // the exposed instance is the render proxy to keep it consistent with 2.x
        const exposedInstance = instance.proxy;
        // in production the hook receives only the error code
        const errorInfo = ({}.NODE_ENV !== 'production') ? ErrorTypeStrings[type] : type;
        while (cur) {
            const errorCapturedHooks = cur.ec;
            if (errorCapturedHooks) {
                for (let i = 0; i < errorCapturedHooks.length; i++) {
                    if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
                        return;
                    }
                }
            }
            cur = cur.parent;
        }
        // app-level handling
        const appErrorHandler = instance.appContext.config.errorHandler;
        if (appErrorHandler) {
            callWithErrorHandling(appErrorHandler, null, 10 /* APP_ERROR_HANDLER */, [err, exposedInstance, errorInfo]);
            return;
        }
    }
    logError(err, type, contextVNode, throwInDev);
}
function logError(err, type, contextVNode, throwInDev = true) {
    if (({}.NODE_ENV !== 'production')) {
        const info = ErrorTypeStrings[type];
        if (contextVNode) {
            pushWarningContext(contextVNode);
        }
        warn(`Unhandled error${info ? ` during execution of ${info}` : ``}`);
        if (contextVNode) {
            popWarningContext();
        }
        // crash in dev by default so it's more noticeable
        if (throwInDev) {
            throw err;
        }
        else {
            console.error(err);
        }
    }
    else {
        // recover in prod to reduce the impact on end-user
        console.error(err);
    }
}

let isFlushing = false;
let isFlushPending = false;
const queue = [];
let flushIndex = 0;
const pendingPreFlushCbs = [];
let activePreFlushCbs = null;
let preFlushIndex = 0;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /*#__PURE__*/ Promise.resolve();
let currentFlushPromise = null;
let currentPreFlushParentJob = null;
const RECURSION_LIMIT = 100;
function nextTick(fn) {
    const p = currentFlushPromise || resolvedPromise;
    return fn ? p.then(this ? fn.bind(this) : fn) : p;
}
// #2768
// Use binary-search to find a suitable position in the queue,
// so that the queue maintains the increasing order of job's id,
// which can prevent the job from being skipped and also can avoid repeated patching.
function findInsertionIndex(id) {
    // the start index should be `flushIndex + 1`
    let start = flushIndex + 1;
    let end = queue.length;
    while (start < end) {
        const middle = (start + end) >>> 1;
        const middleJobId = getId(queue[middle]);
        middleJobId < id ? (start = middle + 1) : (end = middle);
    }
    return start;
}
function queueJob(job) {
    // the dedupe search uses the startIndex argument of Array.includes()
    // by default the search index includes the current job that is being run
    // so it cannot recursively trigger itself again.
    // if the job is a watch() callback, the search will start with a +1 index to
    // allow it recursively trigger itself - it is the user's responsibility to
    // ensure it doesn't end up in an infinite loop.
    if ((!queue.length ||
        !queue.includes(job, isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex)) &&
        job !== currentPreFlushParentJob) {
        if (job.id == null) {
            queue.push(job);
        }
        else {
            queue.splice(findInsertionIndex(job.id), 0, job);
        }
        queueFlush();
    }
}
function queueFlush() {
    if (!isFlushing && !isFlushPending) {
        isFlushPending = true;
        currentFlushPromise = resolvedPromise.then(flushJobs);
    }
}
function invalidateJob(job) {
    const i = queue.indexOf(job);
    if (i > flushIndex) {
        queue.splice(i, 1);
    }
}
function queueCb(cb, activeQueue, pendingQueue, index) {
    if (!isArray(cb)) {
        if (!activeQueue ||
            !activeQueue.includes(cb, cb.allowRecurse ? index + 1 : index)) {
            pendingQueue.push(cb);
        }
    }
    else {
        // if cb is an array, it is a component lifecycle hook which can only be
        // triggered by a job, which is already deduped in the main queue, so
        // we can skip duplicate check here to improve perf
        pendingQueue.push(...cb);
    }
    queueFlush();
}
function queuePreFlushCb(cb) {
    queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex);
}
function queuePostFlushCb(cb) {
    queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex);
}
function flushPreFlushCbs(seen, parentJob = null) {
    if (pendingPreFlushCbs.length) {
        currentPreFlushParentJob = parentJob;
        activePreFlushCbs = [...new Set(pendingPreFlushCbs)];
        pendingPreFlushCbs.length = 0;
        if (({}.NODE_ENV !== 'production')) {
            seen = seen || new Map();
        }
        for (preFlushIndex = 0; preFlushIndex < activePreFlushCbs.length; preFlushIndex++) {
            if (({}.NODE_ENV !== 'production') &&
                checkRecursiveUpdates(seen, activePreFlushCbs[preFlushIndex])) {
                continue;
            }
            activePreFlushCbs[preFlushIndex]();
        }
        activePreFlushCbs = null;
        preFlushIndex = 0;
        currentPreFlushParentJob = null;
        // recursively flush until it drains
        flushPreFlushCbs(seen, parentJob);
    }
}
function flushPostFlushCbs(seen) {
    // flush any pre cbs queued during the flush (e.g. pre watchers)
    flushPreFlushCbs();
    if (pendingPostFlushCbs.length) {
        const deduped = [...new Set(pendingPostFlushCbs)];
        pendingPostFlushCbs.length = 0;
        // #1947 already has active queue, nested flushPostFlushCbs call
        if (activePostFlushCbs) {
            activePostFlushCbs.push(...deduped);
            return;
        }
        activePostFlushCbs = deduped;
        if (({}.NODE_ENV !== 'production')) {
            seen = seen || new Map();
        }
        activePostFlushCbs.sort((a, b) => getId(a) - getId(b));
        for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
            if (({}.NODE_ENV !== 'production') &&
                checkRecursiveUpdates(seen, activePostFlushCbs[postFlushIndex])) {
                continue;
            }
            activePostFlushCbs[postFlushIndex]();
        }
        activePostFlushCbs = null;
        postFlushIndex = 0;
    }
}
const getId = (job) => job.id == null ? Infinity : job.id;
function flushJobs(seen) {
    isFlushPending = false;
    isFlushing = true;
    if (({}.NODE_ENV !== 'production')) {
        seen = seen || new Map();
    }
    flushPreFlushCbs(seen);
    // Sort queue before flush.
    // This ensures that:
    // 1. Components are updated from parent to child. (because parent is always
    //    created before the child so its render effect will have smaller
    //    priority number)
    // 2. If a component is unmounted during a parent component's update,
    //    its update can be skipped.
    queue.sort((a, b) => getId(a) - getId(b));
    // conditional usage of checkRecursiveUpdate must be determined out of
    // try ... catch block since Rollup by default de-optimizes treeshaking
    // inside try-catch. This can leave all warning code unshaked. Although
    // they would get eventually shaken by a minifier like terser, some minifiers
    // would fail to do that (e.g. https://github.com/evanw/esbuild/issues/1610)
    const check = ({}.NODE_ENV !== 'production')
        ? (job) => checkRecursiveUpdates(seen, job)
        : NOOP;
    try {
        for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
            const job = queue[flushIndex];
            if (job && job.active !== false) {
                if (({}.NODE_ENV !== 'production') && check(job)) {
                    continue;
                }
                // console.log(`running:`, job.id)
                callWithErrorHandling(job, null, 14 /* SCHEDULER */);
            }
        }
    }
    finally {
        flushIndex = 0;
        queue.length = 0;
        flushPostFlushCbs(seen);
        isFlushing = false;
        currentFlushPromise = null;
        // some postFlushCb queued jobs!
        // keep flushing until it drains.
        if (queue.length ||
            pendingPreFlushCbs.length ||
            pendingPostFlushCbs.length) {
            flushJobs(seen);
        }
    }
}
function checkRecursiveUpdates(seen, fn) {
    if (!seen.has(fn)) {
        seen.set(fn, 1);
    }
    else {
        const count = seen.get(fn);
        if (count > RECURSION_LIMIT) {
            const instance = fn.ownerInstance;
            const componentName = instance && getComponentName(instance.type);
            warn(`Maximum recursive updates exceeded${componentName ? ` in component <${componentName}>` : ``}. ` +
                `This means you have a reactive effect that is mutating its own ` +
                `dependencies and thus recursively triggering itself. Possible sources ` +
                `include component template, render function, updated hook or ` +
                `watcher source function.`);
            return true;
        }
        else {
            seen.set(fn, count + 1);
        }
    }
}

/* eslint-disable no-restricted-globals */
let isHmrUpdating = false;
const hmrDirtyComponents = new Set();
// Expose the HMR runtime on the global object
// This makes it entirely tree-shakable without polluting the exports and makes
// it easier to be used in toolings like vue-loader
// Note: for a component to be eligible for HMR it also needs the __hmrId option
// to be set so that its instances can be registered / removed.
if (({}.NODE_ENV !== 'production')) {
    getGlobalThis().__VUE_HMR_RUNTIME__ = {
        createRecord: tryWrap(createRecord),
        rerender: tryWrap(rerender),
        reload: tryWrap(reload)
    };
}
const map = new Map();
function registerHMR(instance) {
    const id = instance.type.__hmrId;
    let record = map.get(id);
    if (!record) {
        createRecord(id, instance.type);
        record = map.get(id);
    }
    record.instances.add(instance);
}
function unregisterHMR(instance) {
    map.get(instance.type.__hmrId).instances.delete(instance);
}
function createRecord(id, initialDef) {
    if (map.has(id)) {
        return false;
    }
    map.set(id, {
        initialDef: normalizeClassComponent(initialDef),
        instances: new Set()
    });
    return true;
}
function normalizeClassComponent(component) {
    return isClassComponent(component) ? component.__vccOpts : component;
}
function rerender(id, newRender) {
    const record = map.get(id);
    if (!record) {
        return;
    }
    // update initial record (for not-yet-rendered component)
    record.initialDef.render = newRender;
    [...record.instances].forEach(instance => {
        if (newRender) {
            instance.render = newRender;
            normalizeClassComponent(instance.type).render = newRender;
        }
        instance.renderCache = [];
        // this flag forces child components with slot content to update
        isHmrUpdating = true;
        instance.update();
        isHmrUpdating = false;
    });
}
function reload(id, newComp) {
    const record = map.get(id);
    if (!record)
        return;
    newComp = normalizeClassComponent(newComp);
    // update initial def (for not-yet-rendered components)
    updateComponentDef(record.initialDef, newComp);
    // create a snapshot which avoids the set being mutated during updates
    const instances = [...record.instances];
    for (const instance of instances) {
        const oldComp = normalizeClassComponent(instance.type);
        if (!hmrDirtyComponents.has(oldComp)) {
            // 1. Update existing comp definition to match new one
            if (oldComp !== record.initialDef) {
                updateComponentDef(oldComp, newComp);
            }
            // 2. mark definition dirty. This forces the renderer to replace the
            // component on patch.
            hmrDirtyComponents.add(oldComp);
        }
        // 3. invalidate options resolution cache
        instance.appContext.optionsCache.delete(instance.type);
        // 4. actually update
        if (instance.ceReload) {
            // custom element
            hmrDirtyComponents.add(oldComp);
            instance.ceReload(newComp.styles);
            hmrDirtyComponents.delete(oldComp);
        }
        else if (instance.parent) {
            // 4. Force the parent instance to re-render. This will cause all updated
            // components to be unmounted and re-mounted. Queue the update so that we
            // don't end up forcing the same parent to re-render multiple times.
            queueJob(instance.parent.update);
            // instance is the inner component of an async custom element
            // invoke to reset styles
            if (instance.parent.type.__asyncLoader &&
                instance.parent.ceReload) {
                instance.parent.ceReload(newComp.styles);
            }
        }
        else if (instance.appContext.reload) {
            // root instance mounted via createApp() has a reload method
            instance.appContext.reload();
        }
        else if (typeof window !== 'undefined') {
            // root instance inside tree created via raw render(). Force reload.
            window.location.reload();
        }
        else {
            console.warn('[HMR] Root or manually mounted instance modified. Full reload required.');
        }
    }
    // 5. make sure to cleanup dirty hmr components after update
    queuePostFlushCb(() => {
        for (const instance of instances) {
            hmrDirtyComponents.delete(normalizeClassComponent(instance.type));
        }
    });
}
function updateComponentDef(oldComp, newComp) {
    extend(oldComp, newComp);
    for (const key in oldComp) {
        if (key !== '__file' && !(key in newComp)) {
            delete oldComp[key];
        }
    }
}
function tryWrap(fn) {
    return (id, arg) => {
        try {
            return fn(id, arg);
        }
        catch (e) {
            console.error(e);
            console.warn(`[HMR] Something went wrong during Vue component hot-reload. ` +
                `Full reload required.`);
        }
    };
}

let devtools;
let buffer = [];
let devtoolsNotInstalled = false;
function emit(event, ...args) {
    if (devtools) {
        devtools.emit(event, ...args);
    }
    else if (!devtoolsNotInstalled) {
        buffer.push({ event, args });
    }
}
function setDevtoolsHook(hook, target) {
    var _a, _b;
    devtools = hook;
    if (devtools) {
        devtools.enabled = true;
        buffer.forEach(({ event, args }) => devtools.emit(event, ...args));
        buffer = [];
    }
    else if (
    // handle late devtools injection - only do this if we are in an actual
    // browser environment to avoid the timer handle stalling test runner exit
    // (#4815)
    typeof window !== 'undefined' &&
        // some envs mock window but not fully
        window.HTMLElement &&
        // also exclude jsdom
        !((_b = (_a = window.navigator) === null || _a === void 0 ? void 0 : _a.userAgent) === null || _b === void 0 ? void 0 : _b.includes('jsdom'))) {
        const replay = (target.__VUE_DEVTOOLS_HOOK_REPLAY__ =
            target.__VUE_DEVTOOLS_HOOK_REPLAY__ || []);
        replay.push((newHook) => {
            setDevtoolsHook(newHook, target);
        });
        // clear buffer after 3s - the user probably doesn't have devtools installed
        // at all, and keeping the buffer will cause memory leaks (#4738)
        setTimeout(() => {
            if (!devtools) {
                target.__VUE_DEVTOOLS_HOOK_REPLAY__ = null;
                devtoolsNotInstalled = true;
                buffer = [];
            }
        }, 3000);
    }
    else {
        // non-browser env, assume not installed
        devtoolsNotInstalled = true;
        buffer = [];
    }
}
function devtoolsInitApp(app, version) {
    emit("app:init" /* APP_INIT */, app, version, {
        Fragment,
        Text,
        Comment,
        Static
    });
}
function devtoolsUnmountApp(app) {
    emit("app:unmount" /* APP_UNMOUNT */, app);
}
const devtoolsComponentAdded = /*#__PURE__*/ createDevtoolsComponentHook("component:added" /* COMPONENT_ADDED */);
const devtoolsComponentUpdated = 
/*#__PURE__*/ createDevtoolsComponentHook("component:updated" /* COMPONENT_UPDATED */);
const devtoolsComponentRemoved = 
/*#__PURE__*/ createDevtoolsComponentHook("component:removed" /* COMPONENT_REMOVED */);
function createDevtoolsComponentHook(hook) {
    return (component) => {
        emit(hook, component.appContext.app, component.uid, component.parent ? component.parent.uid : undefined, component);
    };
}
const devtoolsPerfStart = /*#__PURE__*/ createDevtoolsPerformanceHook("perf:start" /* PERFORMANCE_START */);
const devtoolsPerfEnd = /*#__PURE__*/ createDevtoolsPerformanceHook("perf:end" /* PERFORMANCE_END */);
function createDevtoolsPerformanceHook(hook) {
    return (component, type, time) => {
        emit(hook, component.appContext.app, component.uid, component, type, time);
    };
}
function devtoolsComponentEmit(component, event, params) {
    emit("component:emit" /* COMPONENT_EMIT */, component.appContext.app, component, event, params);
}

function emit$1(instance, event, ...rawArgs) {
    if (instance.isUnmounted)
        return;
    const props = instance.vnode.props || EMPTY_OBJ;
    if (({}.NODE_ENV !== 'production')) {
        const { emitsOptions, propsOptions: [propsOptions] } = instance;
        if (emitsOptions) {
            if (!(event in emitsOptions) &&
                !(false )) {
                if (!propsOptions || !(toHandlerKey(event) in propsOptions)) {
                    warn(`Component emitted event "${event}" but it is neither declared in ` +
                        `the emits option nor as an "${toHandlerKey(event)}" prop.`);
                }
            }
            else {
                const validator = emitsOptions[event];
                if (isFunction(validator)) {
                    const isValid = validator(...rawArgs);
                    if (!isValid) {
                        warn(`Invalid event arguments: event validation failed for event "${event}".`);
                    }
                }
            }
        }
    }
    let args = rawArgs;
    const isModelListener = event.startsWith('update:');
    // for v-model update:xxx events, apply modifiers on args
    const modelArg = isModelListener && event.slice(7);
    if (modelArg && modelArg in props) {
        const modifiersKey = `${modelArg === 'modelValue' ? 'model' : modelArg}Modifiers`;
        const { number, trim } = props[modifiersKey] || EMPTY_OBJ;
        if (trim) {
            args = rawArgs.map(a => a.trim());
        }
        if (number) {
            args = rawArgs.map(toNumber);
        }
    }
    if (({}.NODE_ENV !== 'production') || false) {
        devtoolsComponentEmit(instance, event, args);
    }
    if (({}.NODE_ENV !== 'production')) {
        const lowerCaseEvent = event.toLowerCase();
        if (lowerCaseEvent !== event && props[toHandlerKey(lowerCaseEvent)]) {
            warn(`Event "${lowerCaseEvent}" is emitted in component ` +
                `${formatComponentName(instance, instance.type)} but the handler is registered for "${event}". ` +
                `Note that HTML attributes are case-insensitive and you cannot use ` +
                `v-on to listen to camelCase events when using in-DOM templates. ` +
                `You should probably use "${hyphenate(event)}" instead of "${event}".`);
        }
    }
    let handlerName;
    let handler = props[(handlerName = toHandlerKey(event))] ||
        // also try camelCase event handler (#2249)
        props[(handlerName = toHandlerKey(camelize(event)))];
    // for v-model update:xxx events, also trigger kebab-case equivalent
    // for props passed via kebab-case
    if (!handler && isModelListener) {
        handler = props[(handlerName = toHandlerKey(hyphenate(event)))];
    }
    if (handler) {
        callWithAsyncErrorHandling(handler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args);
    }
    const onceHandler = props[handlerName + `Once`];
    if (onceHandler) {
        if (!instance.emitted) {
            instance.emitted = {};
        }
        else if (instance.emitted[handlerName]) {
            return;
        }
        instance.emitted[handlerName] = true;
        callWithAsyncErrorHandling(onceHandler, instance, 6 /* COMPONENT_EVENT_HANDLER */, args);
    }
}
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.emitsCache;
    const cached = cache.get(comp);
    if (cached !== undefined) {
        return cached;
    }
    const raw = comp.emits;
    let normalized = {};
    // apply mixin/extends props
    let hasExtends = false;
    if (!isFunction(comp)) {
        const extendEmits = (raw) => {
            const normalizedFromExtend = normalizeEmitsOptions(raw, appContext, true);
            if (normalizedFromExtend) {
                hasExtends = true;
                extend(normalized, normalizedFromExtend);
            }
        };
        if (!asMixin && appContext.mixins.length) {
            appContext.mixins.forEach(extendEmits);
        }
        if (comp.extends) {
            extendEmits(comp.extends);
        }
        if (comp.mixins) {
            comp.mixins.forEach(extendEmits);
        }
    }
    if (!raw && !hasExtends) {
        cache.set(comp, null);
        return null;
    }
    if (isArray(raw)) {
        raw.forEach(key => (normalized[key] = null));
    }
    else {
        extend(normalized, raw);
    }
    cache.set(comp, normalized);
    return normalized;
}
// Check if an incoming prop key is a declared emit event listener.
// e.g. With `emits: { click: null }`, props named `onClick` and `onclick` are
// both considered matched listeners.
function isEmitListener(options, key) {
    if (!options || !isOn(key)) {
        return false;
    }
    key = key.slice(2).replace(/Once$/, '');
    return (hasOwn(options, key[0].toLowerCase() + key.slice(1)) ||
        hasOwn(options, hyphenate(key)) ||
        hasOwn(options, key));
}

/**
 * mark the current rendering instance for asset resolution (e.g.
 * resolveComponent, resolveDirective) during render
 */
let currentRenderingInstance = null;
let currentScopeId = null;
/**
 * Note: rendering calls maybe nested. The function returns the parent rendering
 * instance if present, which should be restored after the render is done:
 *
 * ```js
 * const prev = setCurrentRenderingInstance(i)
 * // ...render
 * setCurrentRenderingInstance(prev)
 * ```
 */
function setCurrentRenderingInstance(instance) {
    const prev = currentRenderingInstance;
    currentRenderingInstance = instance;
    currentScopeId = (instance && instance.type.__scopeId) || null;
    return prev;
}
/**
 * Wrap a slot function to memoize current rendering instance
 * @private compiler helper
 */
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot // false only
) {
    if (!ctx)
        return fn;
    // already normalized
    if (fn._n) {
        return fn;
    }
    const renderFnWithContext = (...args) => {
        // If a user calls a compiled slot inside a template expression (#1745), it
        // can mess up block tracking, so by default we disable block tracking and
        // force bail out when invoking a compiled slot (indicated by the ._d flag).
        // This isn't necessary if rendering a compiled `<slot>`, so we flip the
        // ._d flag off when invoking the wrapped fn inside `renderSlot`.
        if (renderFnWithContext._d) {
            setBlockTracking(-1);
        }
        const prevInstance = setCurrentRenderingInstance(ctx);
        const res = fn(...args);
        setCurrentRenderingInstance(prevInstance);
        if (renderFnWithContext._d) {
            setBlockTracking(1);
        }
        if (({}.NODE_ENV !== 'production') || false) {
            devtoolsComponentUpdated(ctx);
        }
        return res;
    };
    // mark normalized to avoid duplicated wrapping
    renderFnWithContext._n = true;
    // mark this as compiled by default
    // this is used in vnode.ts -> normalizeChildren() to set the slot
    // rendering flag.
    renderFnWithContext._c = true;
    // disable block tracking by default
    renderFnWithContext._d = true;
    return renderFnWithContext;
}

/**
 * dev only flag to track whether $attrs was used during render.
 * If $attrs was used during render then the warning for failed attrs
 * fallthrough can be suppressed.
 */
let accessedAttrs = false;
function markAttrsAccessed() {
    accessedAttrs = true;
}
function renderComponentRoot(instance) {
    const { type: Component, vnode, proxy, withProxy, props, propsOptions: [propsOptions], slots, attrs, emit, render, renderCache, data, setupState, ctx, inheritAttrs } = instance;
    let result;
    let fallthroughAttrs;
    const prev = setCurrentRenderingInstance(instance);
    if (({}.NODE_ENV !== 'production')) {
        accessedAttrs = false;
    }
    try {
        if (vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */) {
            // withProxy is a proxy with a different `has` trap only for
            // runtime-compiled render functions using `with` block.
            const proxyToUse = withProxy || proxy;
            result = normalizeVNode(render.call(proxyToUse, proxyToUse, renderCache, props, setupState, data, ctx));
            fallthroughAttrs = attrs;
        }
        else {
            // functional
            const render = Component;
            // in dev, mark attrs accessed if optional props (attrs === props)
            if (({}.NODE_ENV !== 'production') && attrs === props) {
                markAttrsAccessed();
            }
            result = normalizeVNode(render.length > 1
                ? render(props, ({}.NODE_ENV !== 'production')
                    ? {
                        get attrs() {
                            markAttrsAccessed();
                            return attrs;
                        },
                        slots,
                        emit
                    }
                    : { attrs, slots, emit })
                : render(props, null /* we know it doesn't need it */));
            fallthroughAttrs = Component.props
                ? attrs
                : getFunctionalFallthrough(attrs);
        }
    }
    catch (err) {
        blockStack.length = 0;
        handleError(err, instance, 1 /* RENDER_FUNCTION */);
        result = createVNode(Comment);
    }
    // attr merging
    // in dev mode, comments are preserved, and it's possible for a template
    // to have comments along side the root element which makes it a fragment
    let root = result;
    let setRoot = undefined;
    if (({}.NODE_ENV !== 'production') &&
        result.patchFlag > 0 &&
        result.patchFlag & 2048 /* DEV_ROOT_FRAGMENT */) {
        [root, setRoot] = getChildRoot(result);
    }
    if (fallthroughAttrs && inheritAttrs !== false) {
        const keys = Object.keys(fallthroughAttrs);
        const { shapeFlag } = root;
        if (keys.length) {
            if (shapeFlag & (1 /* ELEMENT */ | 6 /* COMPONENT */)) {
                if (propsOptions && keys.some(isModelListener)) {
                    // If a v-model listener (onUpdate:xxx) has a corresponding declared
                    // prop, it indicates this component expects to handle v-model and
                    // it should not fallthrough.
                    // related: #1543, #1643, #1989
                    fallthroughAttrs = filterModelListeners(fallthroughAttrs, propsOptions);
                }
                root = cloneVNode(root, fallthroughAttrs);
            }
            else if (({}.NODE_ENV !== 'production') && !accessedAttrs && root.type !== Comment) {
                const allAttrs = Object.keys(attrs);
                const eventAttrs = [];
                const extraAttrs = [];
                for (let i = 0, l = allAttrs.length; i < l; i++) {
                    const key = allAttrs[i];
                    if (isOn(key)) {
                        // ignore v-model handlers when they fail to fallthrough
                        if (!isModelListener(key)) {
                            // remove `on`, lowercase first letter to reflect event casing
                            // accurately
                            eventAttrs.push(key[2].toLowerCase() + key.slice(3));
                        }
                    }
                    else {
                        extraAttrs.push(key);
                    }
                }
                if (extraAttrs.length) {
                    warn(`Extraneous non-props attributes (` +
                        `${extraAttrs.join(', ')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes.`);
                }
                if (eventAttrs.length) {
                    warn(`Extraneous non-emits event listeners (` +
                        `${eventAttrs.join(', ')}) ` +
                        `were passed to component but could not be automatically inherited ` +
                        `because component renders fragment or text root nodes. ` +
                        `If the listener is intended to be a component custom event listener only, ` +
                        `declare it using the "emits" option.`);
                }
            }
        }
    }
    // inherit directives
    if (vnode.dirs) {
        if (({}.NODE_ENV !== 'production') && !isElementRoot(root)) {
            warn(`Runtime directive used on component with non-element root node. ` +
                `The directives will not function as intended.`);
        }
        // clone before mutating since the root may be a hoisted vnode
        root = cloneVNode(root);
        root.dirs = root.dirs ? root.dirs.concat(vnode.dirs) : vnode.dirs;
    }
    // inherit transition data
    if (vnode.transition) {
        if (({}.NODE_ENV !== 'production') && !isElementRoot(root)) {
            warn(`Component inside <Transition> renders non-element root node ` +
                `that cannot be animated.`);
        }
        root.transition = vnode.transition;
    }
    if (({}.NODE_ENV !== 'production') && setRoot) {
        setRoot(root);
    }
    else {
        result = root;
    }
    setCurrentRenderingInstance(prev);
    return result;
}
/**
 * dev only
 * In dev mode, template root level comments are rendered, which turns the
 * template into a fragment root, but we need to locate the single element
 * root for attrs and scope id processing.
 */
const getChildRoot = (vnode) => {
    const rawChildren = vnode.children;
    const dynamicChildren = vnode.dynamicChildren;
    const childRoot = filterSingleRoot(rawChildren);
    if (!childRoot) {
        return [vnode, undefined];
    }
    const index = rawChildren.indexOf(childRoot);
    const dynamicIndex = dynamicChildren ? dynamicChildren.indexOf(childRoot) : -1;
    const setRoot = (updatedRoot) => {
        rawChildren[index] = updatedRoot;
        if (dynamicChildren) {
            if (dynamicIndex > -1) {
                dynamicChildren[dynamicIndex] = updatedRoot;
            }
            else if (updatedRoot.patchFlag > 0) {
                vnode.dynamicChildren = [...dynamicChildren, updatedRoot];
            }
        }
    };
    return [normalizeVNode(childRoot), setRoot];
};
function filterSingleRoot(children) {
    let singleRoot;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isVNode(child)) {
            // ignore user comment
            if (child.type !== Comment || child.children === 'v-if') {
                if (singleRoot) {
                    // has more than 1 non-comment child, return now
                    return;
                }
                else {
                    singleRoot = child;
                }
            }
        }
        else {
            return;
        }
    }
    return singleRoot;
}
const getFunctionalFallthrough = (attrs) => {
    let res;
    for (const key in attrs) {
        if (key === 'class' || key === 'style' || isOn(key)) {
            (res || (res = {}))[key] = attrs[key];
        }
    }
    return res;
};
const filterModelListeners = (attrs, props) => {
    const res = {};
    for (const key in attrs) {
        if (!isModelListener(key) || !(key.slice(9) in props)) {
            res[key] = attrs[key];
        }
    }
    return res;
};
const isElementRoot = (vnode) => {
    return (vnode.shapeFlag & (6 /* COMPONENT */ | 1 /* ELEMENT */) ||
        vnode.type === Comment // potential v-if branch switch
    );
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
    const { props: prevProps, children: prevChildren, component } = prevVNode;
    const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
    const emits = component.emitsOptions;
    // Parent component's render function was hot-updated. Since this may have
    // caused the child component's slots content to have changed, we need to
    // force the child to update as well.
    if (({}.NODE_ENV !== 'production') && (prevChildren || nextChildren) && isHmrUpdating) {
        return true;
    }
    // force child update for runtime directive or transition on component vnode.
    if (nextVNode.dirs || nextVNode.transition) {
        return true;
    }
    if (optimized && patchFlag >= 0) {
        if (patchFlag & 1024 /* DYNAMIC_SLOTS */) {
            // slot content that references values that might have changed,
            // e.g. in a v-for
            return true;
        }
        if (patchFlag & 16 /* FULL_PROPS */) {
            if (!prevProps) {
                return !!nextProps;
            }
            // presence of this flag indicates props are always non-null
            return hasPropsChanged(prevProps, nextProps, emits);
        }
        else if (patchFlag & 8 /* PROPS */) {
            const dynamicProps = nextVNode.dynamicProps;
            for (let i = 0; i < dynamicProps.length; i++) {
                const key = dynamicProps[i];
                if (nextProps[key] !== prevProps[key] &&
                    !isEmitListener(emits, key)) {
                    return true;
                }
            }
        }
    }
    else {
        // this path is only taken by manually written render functions
        // so presence of any children leads to a forced update
        if (prevChildren || nextChildren) {
            if (!nextChildren || !nextChildren.$stable) {
                return true;
            }
        }
        if (prevProps === nextProps) {
            return false;
        }
        if (!prevProps) {
            return !!nextProps;
        }
        if (!nextProps) {
            return true;
        }
        return hasPropsChanged(prevProps, nextProps, emits);
    }
    return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
    const nextKeys = Object.keys(nextProps);
    if (nextKeys.length !== Object.keys(prevProps).length) {
        return true;
    }
    for (let i = 0; i < nextKeys.length; i++) {
        const key = nextKeys[i];
        if (nextProps[key] !== prevProps[key] &&
            !isEmitListener(emitsOptions, key)) {
            return true;
        }
    }
    return false;
}
function updateHOCHostEl({ vnode, parent }, el // HostNode
) {
    while (parent && parent.subTree === vnode) {
        (vnode = parent.vnode).el = el;
        parent = parent.parent;
    }
}

const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
    if (suspense && suspense.pendingBranch) {
        if (isArray(fn)) {
            suspense.effects.push(...fn);
        }
        else {
            suspense.effects.push(fn);
        }
    }
    else {
        queuePostFlushCb(fn);
    }
}

function provide(key, value) {
    if (!currentInstance) {
        if (({}.NODE_ENV !== 'production')) {
            warn(`provide() can only be used inside setup().`);
        }
    }
    else {
        let provides = currentInstance.provides;
        // by default an instance inherits its parent's provides object
        // but when it needs to provide values of its own, it creates its
        // own provides object using parent provides object as prototype.
        // this way in `inject` we can simply look up injections from direct
        // parent and let the prototype chain do the work.
        const parentProvides = currentInstance.parent && currentInstance.parent.provides;
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        // TS doesn't allow symbol as index type
        provides[key] = value;
    }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
    // fallback to `currentRenderingInstance` so that this can be called in
    // a functional component
    const instance = currentInstance || currentRenderingInstance;
    if (instance) {
        // #2400
        // to support `app.use` plugins,
        // fallback to appContext's `provides` if the instance is at root
        const provides = instance.parent == null
            ? instance.vnode.appContext && instance.vnode.appContext.provides
            : instance.parent.provides;
        if (provides && key in provides) {
            // TS doesn't allow symbol as index type
            return provides[key];
        }
        else if (arguments.length > 1) {
            return treatDefaultAsFactory && isFunction(defaultValue)
                ? defaultValue.call(instance.proxy)
                : defaultValue;
        }
        else if (({}.NODE_ENV !== 'production')) {
            warn(`injection "${String(key)}" not found.`);
        }
    }
    else if (({}.NODE_ENV !== 'production')) {
        warn(`inject() can only be used inside setup() or functional components.`);
    }
}
// initial value for watchers to trigger on undefined initial values
const INITIAL_WATCHER_VALUE = {};
// implementation
function watch(source, cb, options) {
    if (({}.NODE_ENV !== 'production') && !isFunction(cb)) {
        warn(`\`watch(fn, options?)\` signature has been moved to a separate API. ` +
            `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` +
            `supports \`watch(source, cb, options?) signature.`);
    }
    return doWatch(source, cb, options);
}
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) {
    if (({}.NODE_ENV !== 'production') && !cb) {
        if (immediate !== undefined) {
            warn(`watch() "immediate" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
        if (deep !== undefined) {
            warn(`watch() "deep" option is only respected when using the ` +
                `watch(source, callback, options?) signature.`);
        }
    }
    const warnInvalidSource = (s) => {
        warn(`Invalid watch source: `, s, `A watch source can only be a getter/effect function, a ref, ` +
            `a reactive object, or an array of these types.`);
    };
    const instance = currentInstance;
    let getter;
    let forceTrigger = false;
    let isMultiSource = false;
    if (isRef(source)) {
        getter = () => source.value;
        forceTrigger = isShallow$1(source);
    }
    else if (isReactive(source)) {
        getter = () => source;
        deep = true;
    }
    else if (isArray(source)) {
        isMultiSource = true;
        forceTrigger = source.some(s => isReactive(s) || isShallow$1(s));
        getter = () => source.map(s => {
            if (isRef(s)) {
                return s.value;
            }
            else if (isReactive(s)) {
                return traverse(s);
            }
            else if (isFunction(s)) {
                return callWithErrorHandling(s, instance, 2 /* WATCH_GETTER */);
            }
            else {
                ({}.NODE_ENV !== 'production') && warnInvalidSource(s);
            }
        });
    }
    else if (isFunction(source)) {
        if (cb) {
            // getter with cb
            getter = () => callWithErrorHandling(source, instance, 2 /* WATCH_GETTER */);
        }
        else {
            // no cb -> simple effect
            getter = () => {
                if (instance && instance.isUnmounted) {
                    return;
                }
                if (cleanup) {
                    cleanup();
                }
                return callWithAsyncErrorHandling(source, instance, 3 /* WATCH_CALLBACK */, [onCleanup]);
            };
        }
    }
    else {
        getter = NOOP;
        ({}.NODE_ENV !== 'production') && warnInvalidSource(source);
    }
    if (cb && deep) {
        const baseGetter = getter;
        getter = () => traverse(baseGetter());
    }
    let cleanup;
    let onCleanup = (fn) => {
        cleanup = effect.onStop = () => {
            callWithErrorHandling(fn, instance, 4 /* WATCH_CLEANUP */);
        };
    };
    // in SSR there is no need to setup an actual effect, and it should be noop
    // unless it's eager
    if (isInSSRComponentSetup) {
        // we will also not call the invalidate callback (+ runner is not set up)
        onCleanup = NOOP;
        if (!cb) {
            getter();
        }
        else if (immediate) {
            callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
                getter(),
                isMultiSource ? [] : undefined,
                onCleanup
            ]);
        }
        return NOOP;
    }
    let oldValue = isMultiSource ? [] : INITIAL_WATCHER_VALUE;
    const job = () => {
        if (!effect.active) {
            return;
        }
        if (cb) {
            // watch(source, cb)
            const newValue = effect.run();
            if (deep ||
                forceTrigger ||
                (isMultiSource
                    ? newValue.some((v, i) => hasChanged(v, oldValue[i]))
                    : hasChanged(newValue, oldValue)) ||
                (false  )) {
                // cleanup before running cb again
                if (cleanup) {
                    cleanup();
                }
                callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [
                    newValue,
                    // pass undefined as the old value when it's changed for the first time
                    oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue,
                    onCleanup
                ]);
                oldValue = newValue;
            }
        }
        else {
            // watchEffect
            effect.run();
        }
    };
    // important: mark the job as a watcher callback so that scheduler knows
    // it is allowed to self-trigger (#1727)
    job.allowRecurse = !!cb;
    let scheduler;
    if (flush === 'sync') {
        scheduler = job; // the scheduler function gets called directly
    }
    else if (flush === 'post') {
        scheduler = () => queuePostRenderEffect(job, instance && instance.suspense);
    }
    else {
        // default: 'pre'
        scheduler = () => queuePreFlushCb(job);
    }
    const effect = new ReactiveEffect(getter, scheduler);
    if (({}.NODE_ENV !== 'production')) {
        effect.onTrack = onTrack;
        effect.onTrigger = onTrigger;
    }
    // initial run
    if (cb) {
        if (immediate) {
            job();
        }
        else {
            oldValue = effect.run();
        }
    }
    else if (flush === 'post') {
        queuePostRenderEffect(effect.run.bind(effect), instance && instance.suspense);
    }
    else {
        effect.run();
    }
    return () => {
        effect.stop();
        if (instance && instance.scope) {
            remove(instance.scope.effects, effect);
        }
    };
}
// this.$watch
function instanceWatch(source, value, options) {
    const publicThis = this.proxy;
    const getter = isString$1(source)
        ? source.includes('.')
            ? createPathGetter(publicThis, source)
            : () => publicThis[source]
        : source.bind(publicThis, publicThis);
    let cb;
    if (isFunction(value)) {
        cb = value;
    }
    else {
        cb = value.handler;
        options = value;
    }
    const cur = currentInstance;
    setCurrentInstance(this);
    const res = doWatch(getter, cb.bind(publicThis), options);
    if (cur) {
        setCurrentInstance(cur);
    }
    else {
        unsetCurrentInstance();
    }
    return res;
}
function createPathGetter(ctx, path) {
    const segments = path.split('.');
    return () => {
        let cur = ctx;
        for (let i = 0; i < segments.length && cur; i++) {
            cur = cur[segments[i]];
        }
        return cur;
    };
}
function traverse(value, seen) {
    if (!isObject(value) || value["__v_skip" /* SKIP */]) {
        return value;
    }
    seen = seen || new Set();
    if (seen.has(value)) {
        return value;
    }
    seen.add(value);
    if (isRef(value)) {
        traverse(value.value, seen);
    }
    else if (isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            traverse(value[i], seen);
        }
    }
    else if (isSet(value) || isMap(value)) {
        value.forEach((v) => {
            traverse(v, seen);
        });
    }
    else if (isPlainObject(value)) {
        for (const key in value) {
            traverse(value[key], seen);
        }
    }
    return value;
}

function useTransitionState() {
    const state = {
        isMounted: false,
        isLeaving: false,
        isUnmounting: false,
        leavingVNodes: new Map()
    };
    onMounted(() => {
        state.isMounted = true;
    });
    onBeforeUnmount(() => {
        state.isUnmounting = true;
    });
    return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionImpl = {
    name: `BaseTransition`,
    props: {
        mode: String,
        appear: Boolean,
        persisted: Boolean,
        // enter
        onBeforeEnter: TransitionHookValidator,
        onEnter: TransitionHookValidator,
        onAfterEnter: TransitionHookValidator,
        onEnterCancelled: TransitionHookValidator,
        // leave
        onBeforeLeave: TransitionHookValidator,
        onLeave: TransitionHookValidator,
        onAfterLeave: TransitionHookValidator,
        onLeaveCancelled: TransitionHookValidator,
        // appear
        onBeforeAppear: TransitionHookValidator,
        onAppear: TransitionHookValidator,
        onAfterAppear: TransitionHookValidator,
        onAppearCancelled: TransitionHookValidator
    },
    setup(props, { slots }) {
        const instance = getCurrentInstance();
        const state = useTransitionState();
        let prevTransitionKey;
        return () => {
            const children = slots.default && getTransitionRawChildren(slots.default(), true);
            if (!children || !children.length) {
                return;
            }
            let child = children[0];
            if (children.length > 1) {
                let hasFound = false;
                // locate first non-comment child
                for (const c of children) {
                    if (c.type !== Comment) {
                        if (({}.NODE_ENV !== 'production') && hasFound) {
                            // warn more than one non-comment child
                            warn('<transition> can only be used on a single element or component. ' +
                                'Use <transition-group> for lists.');
                            break;
                        }
                        child = c;
                        hasFound = true;
                        if (!({}.NODE_ENV !== 'production'))
                            break;
                    }
                }
            }
            // there's no need to track reactivity for these props so use the raw
            // props for a bit better perf
            const rawProps = toRaw(props);
            const { mode } = rawProps;
            // check mode
            if (({}.NODE_ENV !== 'production') &&
                mode &&
                mode !== 'in-out' &&
                mode !== 'out-in' &&
                mode !== 'default') {
                warn(`invalid <transition> mode: ${mode}`);
            }
            if (state.isLeaving) {
                return emptyPlaceholder(child);
            }
            // in the case of <transition><keep-alive/></transition>, we need to
            // compare the type of the kept-alive children.
            const innerChild = getKeepAliveChild(child);
            if (!innerChild) {
                return emptyPlaceholder(child);
            }
            const enterHooks = resolveTransitionHooks(innerChild, rawProps, state, instance);
            setTransitionHooks(innerChild, enterHooks);
            const oldChild = instance.subTree;
            const oldInnerChild = oldChild && getKeepAliveChild(oldChild);
            let transitionKeyChanged = false;
            const { getTransitionKey } = innerChild.type;
            if (getTransitionKey) {
                const key = getTransitionKey();
                if (prevTransitionKey === undefined) {
                    prevTransitionKey = key;
                }
                else if (key !== prevTransitionKey) {
                    prevTransitionKey = key;
                    transitionKeyChanged = true;
                }
            }
            // handle mode
            if (oldInnerChild &&
                oldInnerChild.type !== Comment &&
                (!isSameVNodeType(innerChild, oldInnerChild) || transitionKeyChanged)) {
                const leavingHooks = resolveTransitionHooks(oldInnerChild, rawProps, state, instance);
                // update old tree's hooks in case of dynamic transition
                setTransitionHooks(oldInnerChild, leavingHooks);
                // switching between different views
                if (mode === 'out-in') {
                    state.isLeaving = true;
                    // return placeholder node and queue update when leave finishes
                    leavingHooks.afterLeave = () => {
                        state.isLeaving = false;
                        instance.update();
                    };
                    return emptyPlaceholder(child);
                }
                else if (mode === 'in-out' && innerChild.type !== Comment) {
                    leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
                        const leavingVNodesCache = getLeavingNodesForType(state, oldInnerChild);
                        leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
                        // early removal callback
                        el._leaveCb = () => {
                            earlyRemove();
                            el._leaveCb = undefined;
                            delete enterHooks.delayedLeave;
                        };
                        enterHooks.delayedLeave = delayedLeave;
                    };
                }
            }
            return child;
        };
    }
};
// export the public type for h/tsx inference
// also to avoid inline import() in generated d.ts files
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
    const { leavingVNodes } = state;
    let leavingVNodesCache = leavingVNodes.get(vnode.type);
    if (!leavingVNodesCache) {
        leavingVNodesCache = Object.create(null);
        leavingVNodes.set(vnode.type, leavingVNodesCache);
    }
    return leavingVNodesCache;
}
// The transition hooks are attached to the vnode as vnode.transition
// and will be called at appropriate timing in the renderer.
function resolveTransitionHooks(vnode, props, state, instance) {
    const { appear, mode, persisted = false, onBeforeEnter, onEnter, onAfterEnter, onEnterCancelled, onBeforeLeave, onLeave, onAfterLeave, onLeaveCancelled, onBeforeAppear, onAppear, onAfterAppear, onAppearCancelled } = props;
    const key = String(vnode.key);
    const leavingVNodesCache = getLeavingNodesForType(state, vnode);
    const callHook = (hook, args) => {
        hook &&
            callWithAsyncErrorHandling(hook, instance, 9 /* TRANSITION_HOOK */, args);
    };
    const callAsyncHook = (hook, args) => {
        const done = args[1];
        callHook(hook, args);
        if (isArray(hook)) {
            if (hook.every(hook => hook.length <= 1))
                done();
        }
        else if (hook.length <= 1) {
            done();
        }
    };
    const hooks = {
        mode,
        persisted,
        beforeEnter(el) {
            let hook = onBeforeEnter;
            if (!state.isMounted) {
                if (appear) {
                    hook = onBeforeAppear || onBeforeEnter;
                }
                else {
                    return;
                }
            }
            // for same element (v-show)
            if (el._leaveCb) {
                el._leaveCb(true /* cancelled */);
            }
            // for toggled element with same key (v-if)
            const leavingVNode = leavingVNodesCache[key];
            if (leavingVNode &&
                isSameVNodeType(vnode, leavingVNode) &&
                leavingVNode.el._leaveCb) {
                // force early removal (not cancelled)
                leavingVNode.el._leaveCb();
            }
            callHook(hook, [el]);
        },
        enter(el) {
            let hook = onEnter;
            let afterHook = onAfterEnter;
            let cancelHook = onEnterCancelled;
            if (!state.isMounted) {
                if (appear) {
                    hook = onAppear || onEnter;
                    afterHook = onAfterAppear || onAfterEnter;
                    cancelHook = onAppearCancelled || onEnterCancelled;
                }
                else {
                    return;
                }
            }
            let called = false;
            const done = (el._enterCb = (cancelled) => {
                if (called)
                    return;
                called = true;
                if (cancelled) {
                    callHook(cancelHook, [el]);
                }
                else {
                    callHook(afterHook, [el]);
                }
                if (hooks.delayedLeave) {
                    hooks.delayedLeave();
                }
                el._enterCb = undefined;
            });
            if (hook) {
                callAsyncHook(hook, [el, done]);
            }
            else {
                done();
            }
        },
        leave(el, remove) {
            const key = String(vnode.key);
            if (el._enterCb) {
                el._enterCb(true /* cancelled */);
            }
            if (state.isUnmounting) {
                return remove();
            }
            callHook(onBeforeLeave, [el]);
            let called = false;
            const done = (el._leaveCb = (cancelled) => {
                if (called)
                    return;
                called = true;
                remove();
                if (cancelled) {
                    callHook(onLeaveCancelled, [el]);
                }
                else {
                    callHook(onAfterLeave, [el]);
                }
                el._leaveCb = undefined;
                if (leavingVNodesCache[key] === vnode) {
                    delete leavingVNodesCache[key];
                }
            });
            leavingVNodesCache[key] = vnode;
            if (onLeave) {
                callAsyncHook(onLeave, [el, done]);
            }
            else {
                done();
            }
        },
        clone(vnode) {
            return resolveTransitionHooks(vnode, props, state, instance);
        }
    };
    return hooks;
}
// the placeholder really only handles one special case: KeepAlive
// in the case of a KeepAlive in a leave phase we need to return a KeepAlive
// placeholder with empty content to avoid the KeepAlive instance from being
// unmounted.
function emptyPlaceholder(vnode) {
    if (isKeepAlive(vnode)) {
        vnode = cloneVNode(vnode);
        vnode.children = null;
        return vnode;
    }
}
function getKeepAliveChild(vnode) {
    return isKeepAlive(vnode)
        ? vnode.children
            ? vnode.children[0]
            : undefined
        : vnode;
}
function setTransitionHooks(vnode, hooks) {
    if (vnode.shapeFlag & 6 /* COMPONENT */ && vnode.component) {
        setTransitionHooks(vnode.component.subTree, hooks);
    }
    else if (vnode.shapeFlag & 128 /* SUSPENSE */) {
        vnode.ssContent.transition = hooks.clone(vnode.ssContent);
        vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
    }
    else {
        vnode.transition = hooks;
    }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
    let ret = [];
    let keyedFragmentCount = 0;
    for (let i = 0; i < children.length; i++) {
        let child = children[i];
        // #5360 inherit parent key in case of <template v-for>
        const key = parentKey == null
            ? child.key
            : String(parentKey) + String(child.key != null ? child.key : i);
        // handle fragment children case, e.g. v-for
        if (child.type === Fragment) {
            if (child.patchFlag & 128 /* KEYED_FRAGMENT */)
                keyedFragmentCount++;
            ret = ret.concat(getTransitionRawChildren(child.children, keepComment, key));
        }
        // comment placeholders should be skipped, e.g. v-if
        else if (keepComment || child.type !== Comment) {
            ret.push(key != null ? cloneVNode(child, { key }) : child);
        }
    }
    // #1126 if a transition children list contains multiple sub fragments, these
    // fragments will be merged into a flat children array. Since each v-for
    // fragment may contain different static bindings inside, we need to de-op
    // these children to force full diffs to ensure correct behavior.
    if (keyedFragmentCount > 1) {
        for (let i = 0; i < ret.length; i++) {
            ret[i].patchFlag = -2 /* BAIL */;
        }
    }
    return ret;
}

// implementation, close to no-op
function defineComponent(options) {
    return isFunction(options) ? { setup: options, name: options.name } : options;
}

const isAsyncWrapper = (i) => !!i.type.__asyncLoader;

const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
    registerKeepAliveHook(hook, "a" /* ACTIVATED */, target);
}
function onDeactivated(hook, target) {
    registerKeepAliveHook(hook, "da" /* DEACTIVATED */, target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
    // cache the deactivate branch check wrapper for injected hooks so the same
    // hook can be properly deduped by the scheduler. "__wdc" stands for "with
    // deactivation check".
    const wrappedHook = hook.__wdc ||
        (hook.__wdc = () => {
            // only fire the hook if the target instance is NOT in a deactivated branch.
            let current = target;
            while (current) {
                if (current.isDeactivated) {
                    return;
                }
                current = current.parent;
            }
            return hook();
        });
    injectHook(type, wrappedHook, target);
    // In addition to registering it on the target instance, we walk up the parent
    // chain and register it on all ancestor instances that are keep-alive roots.
    // This avoids the need to walk the entire component tree when invoking these
    // hooks, and more importantly, avoids the need to track child components in
    // arrays.
    if (target) {
        let current = target.parent;
        while (current && current.parent) {
            if (isKeepAlive(current.parent.vnode)) {
                injectToKeepAliveRoot(wrappedHook, type, target, current);
            }
            current = current.parent;
        }
    }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
    // injectHook wraps the original for error handling, so make sure to remove
    // the wrapped version.
    const injected = injectHook(type, hook, keepAliveRoot, true /* prepend */);
    onUnmounted(() => {
        remove(keepAliveRoot[type], injected);
    }, target);
}

function injectHook(type, hook, target = currentInstance, prepend = false) {
    if (target) {
        const hooks = target[type] || (target[type] = []);
        // cache the error handling wrapper for injected hooks so the same hook
        // can be properly deduped by the scheduler. "__weh" stands for "with error
        // handling".
        const wrappedHook = hook.__weh ||
            (hook.__weh = (...args) => {
                if (target.isUnmounted) {
                    return;
                }
                // disable tracking inside all lifecycle hooks
                // since they can potentially be called inside effects.
                pauseTracking();
                // Set currentInstance during hook invocation.
                // This assumes the hook does not synchronously trigger other hooks, which
                // can only be false when the user does something really funky.
                setCurrentInstance(target);
                const res = callWithAsyncErrorHandling(hook, target, type, args);
                unsetCurrentInstance();
                resetTracking();
                return res;
            });
        if (prepend) {
            hooks.unshift(wrappedHook);
        }
        else {
            hooks.push(wrappedHook);
        }
        return wrappedHook;
    }
    else if (({}.NODE_ENV !== 'production')) {
        const apiName = toHandlerKey(ErrorTypeStrings[type].replace(/ hook$/, ''));
        warn(`${apiName} is called when there is no active component instance to be ` +
            `associated with. ` +
            `Lifecycle injection APIs can only be used during execution of setup().` +
            (` If you are using async setup(), make sure to register lifecycle ` +
                    `hooks before the first await statement.`
                ));
    }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => 
// post-create lifecycle registrations are noops during SSR (except for serverPrefetch)
(!isInSSRComponentSetup || lifecycle === "sp" /* SERVER_PREFETCH */) &&
    injectHook(lifecycle, hook, target);
const onBeforeMount = createHook("bm" /* BEFORE_MOUNT */);
const onMounted = createHook("m" /* MOUNTED */);
const onBeforeUpdate = createHook("bu" /* BEFORE_UPDATE */);
const onUpdated = createHook("u" /* UPDATED */);
const onBeforeUnmount = createHook("bum" /* BEFORE_UNMOUNT */);
const onUnmounted = createHook("um" /* UNMOUNTED */);
const onServerPrefetch = createHook("sp" /* SERVER_PREFETCH */);
const onRenderTriggered = createHook("rtg" /* RENDER_TRIGGERED */);
const onRenderTracked = createHook("rtc" /* RENDER_TRACKED */);
function onErrorCaptured(hook, target = currentInstance) {
    injectHook("ec" /* ERROR_CAPTURED */, hook, target);
}

/**
Runtime helper for applying directives to a vnode. Example usage:

const comp = resolveComponent('comp')
const foo = resolveDirective('foo')
const bar = resolveDirective('bar')

return withDirectives(h(comp), [
  [foo, this.x],
  [bar, this.y]
])
*/
function validateDirectiveName(name) {
    if (isBuiltInDirective(name)) {
        warn('Do not use built-in directive ids as custom directive id: ' + name);
    }
}
/**
 * Adds directives to a VNode.
 */
function withDirectives(vnode, directives) {
    const internalInstance = currentRenderingInstance;
    if (internalInstance === null) {
        ({}.NODE_ENV !== 'production') && warn(`withDirectives can only be used inside render functions.`);
        return vnode;
    }
    const instance = getExposeProxy(internalInstance) ||
        internalInstance.proxy;
    const bindings = vnode.dirs || (vnode.dirs = []);
    for (let i = 0; i < directives.length; i++) {
        let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
        if (isFunction(dir)) {
            dir = {
                mounted: dir,
                updated: dir
            };
        }
        if (dir.deep) {
            traverse(value);
        }
        bindings.push({
            dir,
            instance,
            value,
            oldValue: void 0,
            arg,
            modifiers
        });
    }
    return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
    const bindings = vnode.dirs;
    const oldBindings = prevVNode && prevVNode.dirs;
    for (let i = 0; i < bindings.length; i++) {
        const binding = bindings[i];
        if (oldBindings) {
            binding.oldValue = oldBindings[i].value;
        }
        let hook = binding.dir[name];
        if (hook) {
            // disable tracking inside all lifecycle hooks
            // since they can potentially be called inside effects.
            pauseTracking();
            callWithAsyncErrorHandling(hook, instance, 8 /* DIRECTIVE_HOOK */, [
                vnode.el,
                binding,
                vnode,
                prevVNode
            ]);
            resetTracking();
        }
    }
}

const COMPONENTS = 'components';
const NULL_DYNAMIC_COMPONENT = Symbol();
/**
 * @private
 */
function resolveDynamicComponent(component) {
    if (isString$1(component)) {
        return resolveAsset(COMPONENTS, component, false) || component;
    }
    else {
        // invalid types will fallthrough to createVNode and raise warning
        return (component || NULL_DYNAMIC_COMPONENT);
    }
}
// implementation
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
    const instance = currentRenderingInstance || currentInstance;
    if (instance) {
        const Component = instance.type;
        // explicit self name has highest priority
        if (type === COMPONENTS) {
            const selfName = getComponentName(Component, false /* do not include inferred name to avoid breaking existing code */);
            if (selfName &&
                (selfName === name ||
                    selfName === camelize(name) ||
                    selfName === capitalize(camelize(name)))) {
                return Component;
            }
        }
        const res = 
        // local registration
        // check instance[type] first which is resolved for options API
        resolve(instance[type] || Component[type], name) ||
            // global registration
            resolve(instance.appContext[type], name);
        if (!res && maybeSelfReference) {
            // fallback to implicit self-reference
            return Component;
        }
        if (({}.NODE_ENV !== 'production') && warnMissing && !res) {
            const extra = type === COMPONENTS
                ? `\nIf this is a native custom element, make sure to exclude it from ` +
                    `component resolution via compilerOptions.isCustomElement.`
                : ``;
            warn(`Failed to resolve ${type.slice(0, -1)}: ${name}${extra}`);
        }
        return res;
    }
    else if (({}.NODE_ENV !== 'production')) {
        warn(`resolve${capitalize(type.slice(0, -1))} ` +
            `can only be used in render() or setup().`);
    }
}
function resolve(registry, name) {
    return (registry &&
        (registry[name] ||
            registry[camelize(name)] ||
            registry[capitalize(camelize(name))]));
}

/**
 * Actual implementation
 */
function renderList(source, renderItem, cache, index) {
    let ret;
    const cached = (cache && cache[index]);
    if (isArray(source) || isString$1(source)) {
        ret = new Array(source.length);
        for (let i = 0, l = source.length; i < l; i++) {
            ret[i] = renderItem(source[i], i, undefined, cached && cached[i]);
        }
    }
    else if (typeof source === 'number') {
        if (({}.NODE_ENV !== 'production') && !Number.isInteger(source)) {
            warn(`The v-for range expect an integer value but got ${source}.`);
        }
        ret = new Array(source);
        for (let i = 0; i < source; i++) {
            ret[i] = renderItem(i + 1, i, undefined, cached && cached[i]);
        }
    }
    else if (isObject(source)) {
        if (source[Symbol.iterator]) {
            ret = Array.from(source, (item, i) => renderItem(item, i, undefined, cached && cached[i]));
        }
        else {
            const keys = Object.keys(source);
            ret = new Array(keys.length);
            for (let i = 0, l = keys.length; i < l; i++) {
                const key = keys[i];
                ret[i] = renderItem(source[key], key, i, cached && cached[i]);
            }
        }
    }
    else {
        ret = [];
    }
    if (cache) {
        cache[index] = ret;
    }
    return ret;
}

/**
 * Compiler runtime helper for rendering `<slot/>`
 * @private
 */
function renderSlot(slots, name, props = {}, 
// this is not a user-facing function, so the fallback is always generated by
// the compiler and guaranteed to be a function returning an array
fallback, noSlotted) {
    if (currentRenderingInstance.isCE ||
        (currentRenderingInstance.parent &&
            isAsyncWrapper(currentRenderingInstance.parent) &&
            currentRenderingInstance.parent.isCE)) {
        return createVNode('slot', name === 'default' ? null : { name }, fallback && fallback());
    }
    let slot = slots[name];
    if (({}.NODE_ENV !== 'production') && slot && slot.length > 1) {
        warn(`SSR-optimized slot function detected in a non-SSR-optimized render ` +
            `function. You need to mark this component with $dynamic-slots in the ` +
            `parent template.`);
        slot = () => [];
    }
    // a compiled slot disables block tracking by default to avoid manual
    // invocation interfering with template-based block tracking, but in
    // `renderSlot` we can be sure that it's template-based so we can force
    // enable it.
    if (slot && slot._c) {
        slot._d = false;
    }
    openBlock();
    const validSlotContent = slot && ensureValidVNode(slot(props));
    const rendered = createBlock(Fragment, { key: props.key || `_${name}` }, validSlotContent || (fallback ? fallback() : []), validSlotContent && slots._ === 1 /* STABLE */
        ? 64 /* STABLE_FRAGMENT */
        : -2 /* BAIL */);
    if (!noSlotted && rendered.scopeId) {
        rendered.slotScopeIds = [rendered.scopeId + '-s'];
    }
    if (slot && slot._c) {
        slot._d = true;
    }
    return rendered;
}
function ensureValidVNode(vnodes) {
    return vnodes.some(child => {
        if (!isVNode(child))
            return true;
        if (child.type === Comment)
            return false;
        if (child.type === Fragment &&
            !ensureValidVNode(child.children))
            return false;
        return true;
    })
        ? vnodes
        : null;
}

/**
 * #2437 In Vue 3, functional components do not have a public instance proxy but
 * they exist in the internal parent chain. For code that relies on traversing
 * public $parent chains, skip functional ones and go to the parent instead.
 */
const getPublicInstance = (i) => {
    if (!i)
        return null;
    if (isStatefulComponent(i))
        return getExposeProxy(i) || i.proxy;
    return getPublicInstance(i.parent);
};
const publicPropertiesMap = 
// Move PURE marker to new line to workaround compiler discarding it
// due to type annotation
/*#__PURE__*/ extend(Object.create(null), {
    $: i => i,
    $el: i => i.vnode.el,
    $data: i => i.data,
    $props: i => (({}.NODE_ENV !== 'production') ? shallowReadonly(i.props) : i.props),
    $attrs: i => (({}.NODE_ENV !== 'production') ? shallowReadonly(i.attrs) : i.attrs),
    $slots: i => (({}.NODE_ENV !== 'production') ? shallowReadonly(i.slots) : i.slots),
    $refs: i => (({}.NODE_ENV !== 'production') ? shallowReadonly(i.refs) : i.refs),
    $parent: i => getPublicInstance(i.parent),
    $root: i => getPublicInstance(i.root),
    $emit: i => i.emit,
    $options: i => (resolveMergedOptions(i) ),
    $forceUpdate: i => i.f || (i.f = () => queueJob(i.update)),
    $nextTick: i => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: i => (instanceWatch.bind(i) )
});
const isReservedPrefix = (key) => key === '_' || key === '$';
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
        // for internal formatters to know that this is a Vue instance
        if (({}.NODE_ENV !== 'production') && key === '__isVue') {
            return true;
        }
        // prioritize <script setup> bindings during dev.
        // this allows even properties that start with _ or $ to be used - so that
        // it aligns with the production behavior where the render fn is inlined and
        // indeed has access to all declared variables.
        if (({}.NODE_ENV !== 'production') &&
            setupState !== EMPTY_OBJ &&
            setupState.__isScriptSetup &&
            hasOwn(setupState, key)) {
            return setupState[key];
        }
        // data / props / ctx
        // This getter gets called for every property access on the render context
        // during render and is a major hotspot. The most expensive part of this
        // is the multiple hasOwn() calls. It's much faster to do a simple property
        // access on a plain object, so we use an accessCache object (with null
        // prototype) to memoize what access type a key corresponds to.
        let normalizedProps;
        if (key[0] !== '$') {
            const n = accessCache[key];
            if (n !== undefined) {
                switch (n) {
                    case 1 /* SETUP */:
                        return setupState[key];
                    case 2 /* DATA */:
                        return data[key];
                    case 4 /* CONTEXT */:
                        return ctx[key];
                    case 3 /* PROPS */:
                        return props[key];
                    // default: just fallthrough
                }
            }
            else if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
                accessCache[key] = 1 /* SETUP */;
                return setupState[key];
            }
            else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
                accessCache[key] = 2 /* DATA */;
                return data[key];
            }
            else if (
            // only cache other properties when instance has declared (thus stable)
            // props
            (normalizedProps = instance.propsOptions[0]) &&
                hasOwn(normalizedProps, key)) {
                accessCache[key] = 3 /* PROPS */;
                return props[key];
            }
            else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
                accessCache[key] = 4 /* CONTEXT */;
                return ctx[key];
            }
            else if (shouldCacheAccess) {
                accessCache[key] = 0 /* OTHER */;
            }
        }
        const publicGetter = publicPropertiesMap[key];
        let cssModule, globalProperties;
        // public $xxx properties
        if (publicGetter) {
            if (key === '$attrs') {
                track(instance, "get" /* GET */, key);
                ({}.NODE_ENV !== 'production') && markAttrsAccessed();
            }
            return publicGetter(instance);
        }
        else if (
        // css module (injected by vue-loader)
        (cssModule = type.__cssModules) &&
            (cssModule = cssModule[key])) {
            return cssModule;
        }
        else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
            // user may set custom properties to `this` that start with `$`
            accessCache[key] = 4 /* CONTEXT */;
            return ctx[key];
        }
        else if (
        // global properties
        ((globalProperties = appContext.config.globalProperties),
            hasOwn(globalProperties, key))) {
            {
                return globalProperties[key];
            }
        }
        else if (({}.NODE_ENV !== 'production') &&
            currentRenderingInstance &&
            (!isString$1(key) ||
                // #1091 avoid internal isRef/isVNode checks on component instance leading
                // to infinite warning loop
                key.indexOf('__v') !== 0)) {
            if (data !== EMPTY_OBJ && isReservedPrefix(key[0]) && hasOwn(data, key)) {
                warn(`Property ${JSON.stringify(key)} must be accessed via $data because it starts with a reserved ` +
                    `character ("$" or "_") and is not proxied on the render context.`);
            }
            else if (instance === currentRenderingInstance) {
                warn(`Property ${JSON.stringify(key)} was accessed during render ` +
                    `but is not defined on instance.`);
            }
        }
    },
    set({ _: instance }, key, value) {
        const { data, setupState, ctx } = instance;
        if (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) {
            setupState[key] = value;
            return true;
        }
        else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
            data[key] = value;
            return true;
        }
        else if (hasOwn(instance.props, key)) {
            ({}.NODE_ENV !== 'production') &&
                warn(`Attempting to mutate prop "${key}". Props are readonly.`, instance);
            return false;
        }
        if (key[0] === '$' && key.slice(1) in instance) {
            ({}.NODE_ENV !== 'production') &&
                warn(`Attempting to mutate public property "${key}". ` +
                    `Properties starting with $ are reserved and readonly.`, instance);
            return false;
        }
        else {
            if (({}.NODE_ENV !== 'production') && key in instance.appContext.config.globalProperties) {
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    value
                });
            }
            else {
                ctx[key] = value;
            }
        }
        return true;
    },
    has({ _: { data, setupState, accessCache, ctx, appContext, propsOptions } }, key) {
        let normalizedProps;
        return (!!accessCache[key] ||
            (data !== EMPTY_OBJ && hasOwn(data, key)) ||
            (setupState !== EMPTY_OBJ && hasOwn(setupState, key)) ||
            ((normalizedProps = propsOptions[0]) && hasOwn(normalizedProps, key)) ||
            hasOwn(ctx, key) ||
            hasOwn(publicPropertiesMap, key) ||
            hasOwn(appContext.config.globalProperties, key));
    },
    defineProperty(target, key, descriptor) {
        if (descriptor.get != null) {
            // invalidate key cache of a getter based property #5417
            target._.accessCache[key] = 0;
        }
        else if (hasOwn(descriptor, 'value')) {
            this.set(target, key, descriptor.value, null);
        }
        return Reflect.defineProperty(target, key, descriptor);
    }
};
if (({}.NODE_ENV !== 'production') && !false) {
    PublicInstanceProxyHandlers.ownKeys = (target) => {
        warn(`Avoid app logic that relies on enumerating keys on a component instance. ` +
            `The keys will be empty in production mode to avoid performance overhead.`);
        return Reflect.ownKeys(target);
    };
}
// dev only
// In dev mode, the proxy target exposes the same properties as seen on `this`
// for easier console inspection. In prod mode it will be an empty object so
// these properties definitions can be skipped.
function createDevRenderContext(instance) {
    const target = {};
    // expose internal instance for proxy handlers
    Object.defineProperty(target, `_`, {
        configurable: true,
        enumerable: false,
        get: () => instance
    });
    // expose public properties
    Object.keys(publicPropertiesMap).forEach(key => {
        Object.defineProperty(target, key, {
            configurable: true,
            enumerable: false,
            get: () => publicPropertiesMap[key](instance),
            // intercepted by the proxy so no need for implementation,
            // but needed to prevent set errors
            set: NOOP
        });
    });
    return target;
}
// dev only
function exposePropsOnRenderContext(instance) {
    const { ctx, propsOptions: [propsOptions] } = instance;
    if (propsOptions) {
        Object.keys(propsOptions).forEach(key => {
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => instance.props[key],
                set: NOOP
            });
        });
    }
}
// dev only
function exposeSetupStateOnRenderContext(instance) {
    const { ctx, setupState } = instance;
    Object.keys(toRaw(setupState)).forEach(key => {
        if (!setupState.__isScriptSetup) {
            if (isReservedPrefix(key[0])) {
                warn(`setup() return property ${JSON.stringify(key)} should not start with "$" or "_" ` +
                    `which are reserved prefixes for Vue internals.`);
                return;
            }
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => setupState[key],
                set: NOOP
            });
        }
    });
}

function createDuplicateChecker() {
    const cache = Object.create(null);
    return (type, key) => {
        if (cache[key]) {
            warn(`${type} property "${key}" is already defined in ${cache[key]}.`);
        }
        else {
            cache[key] = type;
        }
    };
}
let shouldCacheAccess = true;
function applyOptions(instance) {
    const options = resolveMergedOptions(instance);
    const publicThis = instance.proxy;
    const ctx = instance.ctx;
    // do not cache property access on public proxy during state initialization
    shouldCacheAccess = false;
    // call beforeCreate first before accessing other options since
    // the hook may mutate resolved options (#2791)
    if (options.beforeCreate) {
        callHook$1(options.beforeCreate, instance, "bc" /* BEFORE_CREATE */);
    }
    const { 
    // state
    data: dataOptions, computed: computedOptions, methods, watch: watchOptions, provide: provideOptions, inject: injectOptions, 
    // lifecycle
    created, beforeMount, mounted, beforeUpdate, updated, activated, deactivated, beforeDestroy, beforeUnmount, destroyed, unmounted, render, renderTracked, renderTriggered, errorCaptured, serverPrefetch, 
    // public API
    expose, inheritAttrs, 
    // assets
    components, directives, filters } = options;
    const checkDuplicateProperties = ({}.NODE_ENV !== 'production') ? createDuplicateChecker() : null;
    if (({}.NODE_ENV !== 'production')) {
        const [propsOptions] = instance.propsOptions;
        if (propsOptions) {
            for (const key in propsOptions) {
                checkDuplicateProperties("Props" /* PROPS */, key);
            }
        }
    }
    // options initialization order (to be consistent with Vue 2):
    // - props (already done outside of this function)
    // - inject
    // - methods
    // - data (deferred since it relies on `this` access)
    // - computed
    // - watch (deferred since it relies on `this` access)
    if (injectOptions) {
        resolveInjections(injectOptions, ctx, checkDuplicateProperties, instance.appContext.config.unwrapInjectedRef);
    }
    if (methods) {
        for (const key in methods) {
            const methodHandler = methods[key];
            if (isFunction(methodHandler)) {
                // In dev mode, we use the `createRenderContext` function to define
                // methods to the proxy target, and those are read-only but
                // reconfigurable, so it needs to be redefined here
                if (({}.NODE_ENV !== 'production')) {
                    Object.defineProperty(ctx, key, {
                        value: methodHandler.bind(publicThis),
                        configurable: true,
                        enumerable: true,
                        writable: true
                    });
                }
                else {
                    ctx[key] = methodHandler.bind(publicThis);
                }
                if (({}.NODE_ENV !== 'production')) {
                    checkDuplicateProperties("Methods" /* METHODS */, key);
                }
            }
            else if (({}.NODE_ENV !== 'production')) {
                warn(`Method "${key}" has type "${typeof methodHandler}" in the component definition. ` +
                    `Did you reference the function correctly?`);
            }
        }
    }
    if (dataOptions) {
        if (({}.NODE_ENV !== 'production') && !isFunction(dataOptions)) {
            warn(`The data option must be a function. ` +
                `Plain object usage is no longer supported.`);
        }
        const data = dataOptions.call(publicThis, publicThis);
        if (({}.NODE_ENV !== 'production') && isPromise(data)) {
            warn(`data() returned a Promise - note data() cannot be async; If you ` +
                `intend to perform data fetching before component renders, use ` +
                `async setup() + <Suspense>.`);
        }
        if (!isObject(data)) {
            ({}.NODE_ENV !== 'production') && warn(`data() should return an object.`);
        }
        else {
            instance.data = reactive(data);
            if (({}.NODE_ENV !== 'production')) {
                for (const key in data) {
                    checkDuplicateProperties("Data" /* DATA */, key);
                    // expose data on ctx during dev
                    if (!isReservedPrefix(key[0])) {
                        Object.defineProperty(ctx, key, {
                            configurable: true,
                            enumerable: true,
                            get: () => data[key],
                            set: NOOP
                        });
                    }
                }
            }
        }
    }
    // state initialization complete at this point - start caching access
    shouldCacheAccess = true;
    if (computedOptions) {
        for (const key in computedOptions) {
            const opt = computedOptions[key];
            const get = isFunction(opt)
                ? opt.bind(publicThis, publicThis)
                : isFunction(opt.get)
                    ? opt.get.bind(publicThis, publicThis)
                    : NOOP;
            if (({}.NODE_ENV !== 'production') && get === NOOP) {
                warn(`Computed property "${key}" has no getter.`);
            }
            const set = !isFunction(opt) && isFunction(opt.set)
                ? opt.set.bind(publicThis)
                : ({}.NODE_ENV !== 'production')
                    ? () => {
                        warn(`Write operation failed: computed property "${key}" is readonly.`);
                    }
                    : NOOP;
            const c = computed({
                get,
                set
            });
            Object.defineProperty(ctx, key, {
                enumerable: true,
                configurable: true,
                get: () => c.value,
                set: v => (c.value = v)
            });
            if (({}.NODE_ENV !== 'production')) {
                checkDuplicateProperties("Computed" /* COMPUTED */, key);
            }
        }
    }
    if (watchOptions) {
        for (const key in watchOptions) {
            createWatcher(watchOptions[key], ctx, publicThis, key);
        }
    }
    if (provideOptions) {
        const provides = isFunction(provideOptions)
            ? provideOptions.call(publicThis)
            : provideOptions;
        Reflect.ownKeys(provides).forEach(key => {
            provide(key, provides[key]);
        });
    }
    if (created) {
        callHook$1(created, instance, "c" /* CREATED */);
    }
    function registerLifecycleHook(register, hook) {
        if (isArray(hook)) {
            hook.forEach(_hook => register(_hook.bind(publicThis)));
        }
        else if (hook) {
            register(hook.bind(publicThis));
        }
    }
    registerLifecycleHook(onBeforeMount, beforeMount);
    registerLifecycleHook(onMounted, mounted);
    registerLifecycleHook(onBeforeUpdate, beforeUpdate);
    registerLifecycleHook(onUpdated, updated);
    registerLifecycleHook(onActivated, activated);
    registerLifecycleHook(onDeactivated, deactivated);
    registerLifecycleHook(onErrorCaptured, errorCaptured);
    registerLifecycleHook(onRenderTracked, renderTracked);
    registerLifecycleHook(onRenderTriggered, renderTriggered);
    registerLifecycleHook(onBeforeUnmount, beforeUnmount);
    registerLifecycleHook(onUnmounted, unmounted);
    registerLifecycleHook(onServerPrefetch, serverPrefetch);
    if (isArray(expose)) {
        if (expose.length) {
            const exposed = instance.exposed || (instance.exposed = {});
            expose.forEach(key => {
                Object.defineProperty(exposed, key, {
                    get: () => publicThis[key],
                    set: val => (publicThis[key] = val)
                });
            });
        }
        else if (!instance.exposed) {
            instance.exposed = {};
        }
    }
    // options that are handled when creating the instance but also need to be
    // applied from mixins
    if (render && instance.render === NOOP) {
        instance.render = render;
    }
    if (inheritAttrs != null) {
        instance.inheritAttrs = inheritAttrs;
    }
    // asset options.
    if (components)
        instance.components = components;
    if (directives)
        instance.directives = directives;
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP, unwrapRef = false) {
    if (isArray(injectOptions)) {
        injectOptions = normalizeInject(injectOptions);
    }
    for (const key in injectOptions) {
        const opt = injectOptions[key];
        let injected;
        if (isObject(opt)) {
            if ('default' in opt) {
                injected = inject(opt.from || key, opt.default, true /* treat default function as factory */);
            }
            else {
                injected = inject(opt.from || key);
            }
        }
        else {
            injected = inject(opt);
        }
        if (isRef(injected)) {
            // TODO remove the check in 3.3
            if (unwrapRef) {
                Object.defineProperty(ctx, key, {
                    enumerable: true,
                    configurable: true,
                    get: () => injected.value,
                    set: v => (injected.value = v)
                });
            }
            else {
                if (({}.NODE_ENV !== 'production')) {
                    warn(`injected property "${key}" is a ref and will be auto-unwrapped ` +
                        `and no longer needs \`.value\` in the next minor release. ` +
                        `To opt-in to the new behavior now, ` +
                        `set \`app.config.unwrapInjectedRef = true\` (this config is ` +
                        `temporary and will not be needed in the future.)`);
                }
                ctx[key] = injected;
            }
        }
        else {
            ctx[key] = injected;
        }
        if (({}.NODE_ENV !== 'production')) {
            checkDuplicateProperties("Inject" /* INJECT */, key);
        }
    }
}
function callHook$1(hook, instance, type) {
    callWithAsyncErrorHandling(isArray(hook)
        ? hook.map(h => h.bind(instance.proxy))
        : hook.bind(instance.proxy), instance, type);
}
function createWatcher(raw, ctx, publicThis, key) {
    const getter = key.includes('.')
        ? createPathGetter(publicThis, key)
        : () => publicThis[key];
    if (isString$1(raw)) {
        const handler = ctx[raw];
        if (isFunction(handler)) {
            watch(getter, handler);
        }
        else if (({}.NODE_ENV !== 'production')) {
            warn(`Invalid watch handler specified by key "${raw}"`, handler);
        }
    }
    else if (isFunction(raw)) {
        watch(getter, raw.bind(publicThis));
    }
    else if (isObject(raw)) {
        if (isArray(raw)) {
            raw.forEach(r => createWatcher(r, ctx, publicThis, key));
        }
        else {
            const handler = isFunction(raw.handler)
                ? raw.handler.bind(publicThis)
                : ctx[raw.handler];
            if (isFunction(handler)) {
                watch(getter, handler, raw);
            }
            else if (({}.NODE_ENV !== 'production')) {
                warn(`Invalid watch handler specified by key "${raw.handler}"`, handler);
            }
        }
    }
    else if (({}.NODE_ENV !== 'production')) {
        warn(`Invalid watch option: "${key}"`, raw);
    }
}
/**
 * Resolve merged options and cache it on the component.
 * This is done only once per-component since the merging does not involve
 * instances.
 */
function resolveMergedOptions(instance) {
    const base = instance.type;
    const { mixins, extends: extendsOptions } = base;
    const { mixins: globalMixins, optionsCache: cache, config: { optionMergeStrategies } } = instance.appContext;
    const cached = cache.get(base);
    let resolved;
    if (cached) {
        resolved = cached;
    }
    else if (!globalMixins.length && !mixins && !extendsOptions) {
        {
            resolved = base;
        }
    }
    else {
        resolved = {};
        if (globalMixins.length) {
            globalMixins.forEach(m => mergeOptions(resolved, m, optionMergeStrategies, true));
        }
        mergeOptions(resolved, base, optionMergeStrategies);
    }
    cache.set(base, resolved);
    return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
    const { mixins, extends: extendsOptions } = from;
    if (extendsOptions) {
        mergeOptions(to, extendsOptions, strats, true);
    }
    if (mixins) {
        mixins.forEach((m) => mergeOptions(to, m, strats, true));
    }
    for (const key in from) {
        if (asMixin && key === 'expose') {
            ({}.NODE_ENV !== 'production') &&
                warn(`"expose" option is ignored when declared in mixins or extends. ` +
                    `It should only be declared in the base component itself.`);
        }
        else {
            const strat = internalOptionMergeStrats[key] || (strats && strats[key]);
            to[key] = strat ? strat(to[key], from[key]) : from[key];
        }
    }
    return to;
}
const internalOptionMergeStrats = {
    data: mergeDataFn,
    props: mergeObjectOptions,
    emits: mergeObjectOptions,
    // objects
    methods: mergeObjectOptions,
    computed: mergeObjectOptions,
    // lifecycle
    beforeCreate: mergeAsArray,
    created: mergeAsArray,
    beforeMount: mergeAsArray,
    mounted: mergeAsArray,
    beforeUpdate: mergeAsArray,
    updated: mergeAsArray,
    beforeDestroy: mergeAsArray,
    beforeUnmount: mergeAsArray,
    destroyed: mergeAsArray,
    unmounted: mergeAsArray,
    activated: mergeAsArray,
    deactivated: mergeAsArray,
    errorCaptured: mergeAsArray,
    serverPrefetch: mergeAsArray,
    // assets
    components: mergeObjectOptions,
    directives: mergeObjectOptions,
    // watch
    watch: mergeWatchOptions,
    // provide / inject
    provide: mergeDataFn,
    inject: mergeInject
};
function mergeDataFn(to, from) {
    if (!from) {
        return to;
    }
    if (!to) {
        return from;
    }
    return function mergedDataFn() {
        return (extend)(isFunction(to) ? to.call(this, this) : to, isFunction(from) ? from.call(this, this) : from);
    };
}
function mergeInject(to, from) {
    return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
    if (isArray(raw)) {
        const res = {};
        for (let i = 0; i < raw.length; i++) {
            res[raw[i]] = raw[i];
        }
        return res;
    }
    return raw;
}
function mergeAsArray(to, from) {
    return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
    return to ? extend(extend(Object.create(null), to), from) : from;
}
function mergeWatchOptions(to, from) {
    if (!to)
        return from;
    if (!from)
        return to;
    const merged = extend(Object.create(null), to);
    for (const key in from) {
        merged[key] = mergeAsArray(to[key], from[key]);
    }
    return merged;
}

function initProps(instance, rawProps, isStateful, // result of bitwise flag comparison
isSSR = false) {
    const props = {};
    const attrs = {};
    def(attrs, InternalObjectKey, 1);
    instance.propsDefaults = Object.create(null);
    setFullProps(instance, rawProps, props, attrs);
    // ensure all declared prop keys are present
    for (const key in instance.propsOptions[0]) {
        if (!(key in props)) {
            props[key] = undefined;
        }
    }
    // validation
    if (({}.NODE_ENV !== 'production')) {
        validateProps(rawProps || {}, props, instance);
    }
    if (isStateful) {
        // stateful
        instance.props = isSSR ? props : shallowReactive(props);
    }
    else {
        if (!instance.type.props) {
            // functional w/ optional props, props === attrs
            instance.props = attrs;
        }
        else {
            // functional w/ declared props
            instance.props = props;
        }
    }
    instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
    const { props, attrs, vnode: { patchFlag } } = instance;
    const rawCurrentProps = toRaw(props);
    const [options] = instance.propsOptions;
    let hasAttrsChanged = false;
    if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    !(({}.NODE_ENV !== 'production') &&
        (instance.type.__hmrId ||
            (instance.parent && instance.parent.type.__hmrId))) &&
        (optimized || patchFlag > 0) &&
        !(patchFlag & 16 /* FULL_PROPS */)) {
        if (patchFlag & 8 /* PROPS */) {
            // Compiler-generated props & no keys change, just set the updated
            // the props.
            const propsToUpdate = instance.vnode.dynamicProps;
            for (let i = 0; i < propsToUpdate.length; i++) {
                let key = propsToUpdate[i];
                // skip if the prop key is a declared emit event listener
                if (isEmitListener(instance.emitsOptions, key)) {
                    continue;
                }
                // PROPS flag guarantees rawProps to be non-null
                const value = rawProps[key];
                if (options) {
                    // attr / props separation was done on init and will be consistent
                    // in this code path, so just check if attrs have it.
                    if (hasOwn(attrs, key)) {
                        if (value !== attrs[key]) {
                            attrs[key] = value;
                            hasAttrsChanged = true;
                        }
                    }
                    else {
                        const camelizedKey = camelize(key);
                        props[camelizedKey] = resolvePropValue(options, rawCurrentProps, camelizedKey, value, instance, false /* isAbsent */);
                    }
                }
                else {
                    if (value !== attrs[key]) {
                        attrs[key] = value;
                        hasAttrsChanged = true;
                    }
                }
            }
        }
    }
    else {
        // full props update.
        if (setFullProps(instance, rawProps, props, attrs)) {
            hasAttrsChanged = true;
        }
        // in case of dynamic props, check if we need to delete keys from
        // the props object
        let kebabKey;
        for (const key in rawCurrentProps) {
            if (!rawProps ||
                // for camelCase
                (!hasOwn(rawProps, key) &&
                    // it's possible the original props was passed in as kebab-case
                    // and converted to camelCase (#955)
                    ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey)))) {
                if (options) {
                    if (rawPrevProps &&
                        // for camelCase
                        (rawPrevProps[key] !== undefined ||
                            // for kebab-case
                            rawPrevProps[kebabKey] !== undefined)) {
                        props[key] = resolvePropValue(options, rawCurrentProps, key, undefined, instance, true /* isAbsent */);
                    }
                }
                else {
                    delete props[key];
                }
            }
        }
        // in the case of functional component w/o props declaration, props and
        // attrs point to the same object so it should already have been updated.
        if (attrs !== rawCurrentProps) {
            for (const key in attrs) {
                if (!rawProps ||
                    (!hasOwn(rawProps, key) &&
                        (!false ))) {
                    delete attrs[key];
                    hasAttrsChanged = true;
                }
            }
        }
    }
    // trigger updates for $attrs in case it's used in component slots
    if (hasAttrsChanged) {
        trigger(instance, "set" /* SET */, '$attrs');
    }
    if (({}.NODE_ENV !== 'production')) {
        validateProps(rawProps || {}, props, instance);
    }
}
function setFullProps(instance, rawProps, props, attrs) {
    const [options, needCastKeys] = instance.propsOptions;
    let hasAttrsChanged = false;
    let rawCastValues;
    if (rawProps) {
        for (let key in rawProps) {
            // key, ref are reserved and never passed down
            if (isReservedProp(key)) {
                continue;
            }
            const value = rawProps[key];
            // prop option names are camelized during normalization, so to support
            // kebab -> camel conversion here we need to camelize the key.
            let camelKey;
            if (options && hasOwn(options, (camelKey = camelize(key)))) {
                if (!needCastKeys || !needCastKeys.includes(camelKey)) {
                    props[camelKey] = value;
                }
                else {
                    (rawCastValues || (rawCastValues = {}))[camelKey] = value;
                }
            }
            else if (!isEmitListener(instance.emitsOptions, key)) {
                if (!(key in attrs) || value !== attrs[key]) {
                    attrs[key] = value;
                    hasAttrsChanged = true;
                }
            }
        }
    }
    if (needCastKeys) {
        const rawCurrentProps = toRaw(props);
        const castValues = rawCastValues || EMPTY_OBJ;
        for (let i = 0; i < needCastKeys.length; i++) {
            const key = needCastKeys[i];
            props[key] = resolvePropValue(options, rawCurrentProps, key, castValues[key], instance, !hasOwn(castValues, key));
        }
    }
    return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
    const opt = options[key];
    if (opt != null) {
        const hasDefault = hasOwn(opt, 'default');
        // default values
        if (hasDefault && value === undefined) {
            const defaultValue = opt.default;
            if (opt.type !== Function && isFunction(defaultValue)) {
                const { propsDefaults } = instance;
                if (key in propsDefaults) {
                    value = propsDefaults[key];
                }
                else {
                    setCurrentInstance(instance);
                    value = propsDefaults[key] = defaultValue.call(null, props);
                    unsetCurrentInstance();
                }
            }
            else {
                value = defaultValue;
            }
        }
        // boolean casting
        if (opt[0 /* shouldCast */]) {
            if (isAbsent && !hasDefault) {
                value = false;
            }
            else if (opt[1 /* shouldCastTrue */] &&
                (value === '' || value === hyphenate(key))) {
                value = true;
            }
        }
    }
    return value;
}
function normalizePropsOptions(comp, appContext, asMixin = false) {
    const cache = appContext.propsCache;
    const cached = cache.get(comp);
    if (cached) {
        return cached;
    }
    const raw = comp.props;
    const normalized = {};
    const needCastKeys = [];
    // apply mixin/extends props
    let hasExtends = false;
    if (!isFunction(comp)) {
        const extendProps = (raw) => {
            hasExtends = true;
            const [props, keys] = normalizePropsOptions(raw, appContext, true);
            extend(normalized, props);
            if (keys)
                needCastKeys.push(...keys);
        };
        if (!asMixin && appContext.mixins.length) {
            appContext.mixins.forEach(extendProps);
        }
        if (comp.extends) {
            extendProps(comp.extends);
        }
        if (comp.mixins) {
            comp.mixins.forEach(extendProps);
        }
    }
    if (!raw && !hasExtends) {
        cache.set(comp, EMPTY_ARR);
        return EMPTY_ARR;
    }
    if (isArray(raw)) {
        for (let i = 0; i < raw.length; i++) {
            if (({}.NODE_ENV !== 'production') && !isString$1(raw[i])) {
                warn(`props must be strings when using array syntax.`, raw[i]);
            }
            const normalizedKey = camelize(raw[i]);
            if (validatePropName(normalizedKey)) {
                normalized[normalizedKey] = EMPTY_OBJ;
            }
        }
    }
    else if (raw) {
        if (({}.NODE_ENV !== 'production') && !isObject(raw)) {
            warn(`invalid props options`, raw);
        }
        for (const key in raw) {
            const normalizedKey = camelize(key);
            if (validatePropName(normalizedKey)) {
                const opt = raw[key];
                const prop = (normalized[normalizedKey] =
                    isArray(opt) || isFunction(opt) ? { type: opt } : opt);
                if (prop) {
                    const booleanIndex = getTypeIndex(Boolean, prop.type);
                    const stringIndex = getTypeIndex(String, prop.type);
                    prop[0 /* shouldCast */] = booleanIndex > -1;
                    prop[1 /* shouldCastTrue */] =
                        stringIndex < 0 || booleanIndex < stringIndex;
                    // if the prop needs boolean casting or default value
                    if (booleanIndex > -1 || hasOwn(prop, 'default')) {
                        needCastKeys.push(normalizedKey);
                    }
                }
            }
        }
    }
    const res = [normalized, needCastKeys];
    cache.set(comp, res);
    return res;
}
function validatePropName(key) {
    if (key[0] !== '$') {
        return true;
    }
    else if (({}.NODE_ENV !== 'production')) {
        warn(`Invalid prop name: "${key}" is a reserved property.`);
    }
    return false;
}
// use function string name to check type constructors
// so that it works across vms / iframes.
function getType(ctor) {
    const match = ctor && ctor.toString().match(/^\s*function (\w+)/);
    return match ? match[1] : ctor === null ? 'null' : '';
}
function isSameType(a, b) {
    return getType(a) === getType(b);
}
function getTypeIndex(type, expectedTypes) {
    if (isArray(expectedTypes)) {
        return expectedTypes.findIndex(t => isSameType(t, type));
    }
    else if (isFunction(expectedTypes)) {
        return isSameType(expectedTypes, type) ? 0 : -1;
    }
    return -1;
}
/**
 * dev only
 */
function validateProps(rawProps, props, instance) {
    const resolvedValues = toRaw(props);
    const options = instance.propsOptions[0];
    for (const key in options) {
        let opt = options[key];
        if (opt == null)
            continue;
        validateProp(key, resolvedValues[key], opt, !hasOwn(rawProps, key) && !hasOwn(rawProps, hyphenate(key)));
    }
}
/**
 * dev only
 */
function validateProp(name, value, prop, isAbsent) {
    const { type, required, validator } = prop;
    // required!
    if (required && isAbsent) {
        warn('Missing required prop: "' + name + '"');
        return;
    }
    // missing but optional
    if (value == null && !prop.required) {
        return;
    }
    // type check
    if (type != null && type !== true) {
        let isValid = false;
        const types = isArray(type) ? type : [type];
        const expectedTypes = [];
        // value is valid as long as one of the specified types match
        for (let i = 0; i < types.length && !isValid; i++) {
            const { valid, expectedType } = assertType(value, types[i]);
            expectedTypes.push(expectedType || '');
            isValid = valid;
        }
        if (!isValid) {
            warn(getInvalidTypeMessage(name, value, expectedTypes));
            return;
        }
    }
    // custom validator
    if (validator && !validator(value)) {
        warn('Invalid prop: custom validator check failed for prop "' + name + '".');
    }
}
const isSimpleType = /*#__PURE__*/ makeMap('String,Number,Boolean,Function,Symbol,BigInt');
/**
 * dev only
 */
function assertType(value, type) {
    let valid;
    const expectedType = getType(type);
    if (isSimpleType(expectedType)) {
        const t = typeof value;
        valid = t === expectedType.toLowerCase();
        // for primitive wrapper objects
        if (!valid && t === 'object') {
            valid = value instanceof type;
        }
    }
    else if (expectedType === 'Object') {
        valid = isObject(value);
    }
    else if (expectedType === 'Array') {
        valid = isArray(value);
    }
    else if (expectedType === 'null') {
        valid = value === null;
    }
    else {
        valid = value instanceof type;
    }
    return {
        valid,
        expectedType
    };
}
/**
 * dev only
 */
function getInvalidTypeMessage(name, value, expectedTypes) {
    let message = `Invalid prop: type check failed for prop "${name}".` +
        ` Expected ${expectedTypes.map(capitalize).join(' | ')}`;
    const expectedType = expectedTypes[0];
    const receivedType = toRawType(value);
    const expectedValue = styleValue(value, expectedType);
    const receivedValue = styleValue(value, receivedType);
    // check if we need to specify expected value
    if (expectedTypes.length === 1 &&
        isExplicable(expectedType) &&
        !isBoolean(expectedType, receivedType)) {
        message += ` with value ${expectedValue}`;
    }
    message += `, got ${receivedType} `;
    // check if we need to specify received value
    if (isExplicable(receivedType)) {
        message += `with value ${receivedValue}.`;
    }
    return message;
}
/**
 * dev only
 */
function styleValue(value, type) {
    if (type === 'String') {
        return `"${value}"`;
    }
    else if (type === 'Number') {
        return `${Number(value)}`;
    }
    else {
        return `${value}`;
    }
}
/**
 * dev only
 */
function isExplicable(type) {
    const explicitTypes = ['string', 'number', 'boolean'];
    return explicitTypes.some(elem => type.toLowerCase() === elem);
}
/**
 * dev only
 */
function isBoolean(...args) {
    return args.some(elem => elem.toLowerCase() === 'boolean');
}

const isInternalKey = (key) => key[0] === '_' || key === '$stable';
const normalizeSlotValue = (value) => isArray(value)
    ? value.map(normalizeVNode)
    : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
    if (rawSlot._n) {
        // already normalized - #5353
        return rawSlot;
    }
    const normalized = withCtx((...args) => {
        if (({}.NODE_ENV !== 'production') && currentInstance) {
            warn(`Slot "${key}" invoked outside of the render function: ` +
                `this will not track dependencies used in the slot. ` +
                `Invoke the slot function inside the render function instead.`);
        }
        return normalizeSlotValue(rawSlot(...args));
    }, ctx);
    normalized._c = false;
    return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
    const ctx = rawSlots._ctx;
    for (const key in rawSlots) {
        if (isInternalKey(key))
            continue;
        const value = rawSlots[key];
        if (isFunction(value)) {
            slots[key] = normalizeSlot(key, value, ctx);
        }
        else if (value != null) {
            if (({}.NODE_ENV !== 'production') &&
                !(false )) {
                warn(`Non-function value encountered for slot "${key}". ` +
                    `Prefer function slots for better performance.`);
            }
            const normalized = normalizeSlotValue(value);
            slots[key] = () => normalized;
        }
    }
};
const normalizeVNodeSlots = (instance, children) => {
    if (({}.NODE_ENV !== 'production') &&
        !isKeepAlive(instance.vnode) &&
        !(false )) {
        warn(`Non-function value encountered for default slot. ` +
            `Prefer function slots for better performance.`);
    }
    const normalized = normalizeSlotValue(children);
    instance.slots.default = () => normalized;
};
const initSlots = (instance, children) => {
    if (instance.vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
        const type = children._;
        if (type) {
            // users can get the shallow readonly version of the slots object through `this.$slots`,
            // we should avoid the proxy object polluting the slots of the internal instance
            instance.slots = toRaw(children);
            // make compiler marker non-enumerable
            def(children, '_', type);
        }
        else {
            normalizeObjectSlots(children, (instance.slots = {}));
        }
    }
    else {
        instance.slots = {};
        if (children) {
            normalizeVNodeSlots(instance, children);
        }
    }
    def(instance.slots, InternalObjectKey, 1);
};
const updateSlots = (instance, children, optimized) => {
    const { vnode, slots } = instance;
    let needDeletionCheck = true;
    let deletionComparisonTarget = EMPTY_OBJ;
    if (vnode.shapeFlag & 32 /* SLOTS_CHILDREN */) {
        const type = children._;
        if (type) {
            // compiled slots.
            if (({}.NODE_ENV !== 'production') && isHmrUpdating) {
                // Parent was HMR updated so slot content may have changed.
                // force update slots and mark instance for hmr as well
                extend(slots, children);
            }
            else if (optimized && type === 1 /* STABLE */) {
                // compiled AND stable.
                // no need to update, and skip stale slots removal.
                needDeletionCheck = false;
            }
            else {
                // compiled but dynamic (v-if/v-for on slots) - update slots, but skip
                // normalization.
                extend(slots, children);
                // #2893
                // when rendering the optimized slots by manually written render function,
                // we need to delete the `slots._` flag if necessary to make subsequent updates reliable,
                // i.e. let the `renderSlot` create the bailed Fragment
                if (!optimized && type === 1 /* STABLE */) {
                    delete slots._;
                }
            }
        }
        else {
            needDeletionCheck = !children.$stable;
            normalizeObjectSlots(children, slots);
        }
        deletionComparisonTarget = children;
    }
    else if (children) {
        // non slot object children (direct value) passed to a component
        normalizeVNodeSlots(instance, children);
        deletionComparisonTarget = { default: 1 };
    }
    // delete stale slots
    if (needDeletionCheck) {
        for (const key in slots) {
            if (!isInternalKey(key) && !(key in deletionComparisonTarget)) {
                delete slots[key];
            }
        }
    }
};

function createAppContext() {
    return {
        app: null,
        config: {
            isNativeTag: NO,
            performance: false,
            globalProperties: {},
            optionMergeStrategies: {},
            errorHandler: undefined,
            warnHandler: undefined,
            compilerOptions: {}
        },
        mixins: [],
        components: {},
        directives: {},
        provides: Object.create(null),
        optionsCache: new WeakMap(),
        propsCache: new WeakMap(),
        emitsCache: new WeakMap()
    };
}
let uid = 0;
function createAppAPI(render, hydrate) {
    return function createApp(rootComponent, rootProps = null) {
        if (!isFunction(rootComponent)) {
            rootComponent = Object.assign({}, rootComponent);
        }
        if (rootProps != null && !isObject(rootProps)) {
            ({}.NODE_ENV !== 'production') && warn(`root props passed to app.mount() must be an object.`);
            rootProps = null;
        }
        const context = createAppContext();
        const installedPlugins = new Set();
        let isMounted = false;
        const app = (context.app = {
            _uid: uid++,
            _component: rootComponent,
            _props: rootProps,
            _container: null,
            _context: context,
            _instance: null,
            version,
            get config() {
                return context.config;
            },
            set config(v) {
                if (({}.NODE_ENV !== 'production')) {
                    warn(`app.config cannot be replaced. Modify individual options instead.`);
                }
            },
            use(plugin, ...options) {
                if (installedPlugins.has(plugin)) {
                    ({}.NODE_ENV !== 'production') && warn(`Plugin has already been applied to target app.`);
                }
                else if (plugin && isFunction(plugin.install)) {
                    installedPlugins.add(plugin);
                    plugin.install(app, ...options);
                }
                else if (isFunction(plugin)) {
                    installedPlugins.add(plugin);
                    plugin(app, ...options);
                }
                else if (({}.NODE_ENV !== 'production')) {
                    warn(`A plugin must either be a function or an object with an "install" ` +
                        `function.`);
                }
                return app;
            },
            mixin(mixin) {
                {
                    if (!context.mixins.includes(mixin)) {
                        context.mixins.push(mixin);
                    }
                    else if (({}.NODE_ENV !== 'production')) {
                        warn('Mixin has already been applied to target app' +
                            (mixin.name ? `: ${mixin.name}` : ''));
                    }
                }
                return app;
            },
            component(name, component) {
                if (({}.NODE_ENV !== 'production')) {
                    validateComponentName(name, context.config);
                }
                if (!component) {
                    return context.components[name];
                }
                if (({}.NODE_ENV !== 'production') && context.components[name]) {
                    warn(`Component "${name}" has already been registered in target app.`);
                }
                context.components[name] = component;
                return app;
            },
            directive(name, directive) {
                if (({}.NODE_ENV !== 'production')) {
                    validateDirectiveName(name);
                }
                if (!directive) {
                    return context.directives[name];
                }
                if (({}.NODE_ENV !== 'production') && context.directives[name]) {
                    warn(`Directive "${name}" has already been registered in target app.`);
                }
                context.directives[name] = directive;
                return app;
            },
            mount(rootContainer, isHydrate, isSVG) {
                if (!isMounted) {
                    // #5571
                    if (({}.NODE_ENV !== 'production') && rootContainer.__vue_app__) {
                        warn(`There is already an app instance mounted on the host container.\n` +
                            ` If you want to mount another app on the same host container,` +
                            ` you need to unmount the previous app by calling \`app.unmount()\` first.`);
                    }
                    const vnode = createVNode(rootComponent, rootProps);
                    // store app context on the root VNode.
                    // this will be set on the root instance on initial mount.
                    vnode.appContext = context;
                    // HMR root reload
                    if (({}.NODE_ENV !== 'production')) {
                        context.reload = () => {
                            render(cloneVNode(vnode), rootContainer, isSVG);
                        };
                    }
                    if (isHydrate && hydrate) {
                        hydrate(vnode, rootContainer);
                    }
                    else {
                        render(vnode, rootContainer, isSVG);
                    }
                    isMounted = true;
                    app._container = rootContainer;
                    rootContainer.__vue_app__ = app;
                    if (({}.NODE_ENV !== 'production') || false) {
                        app._instance = vnode.component;
                        devtoolsInitApp(app, version);
                    }
                    return getExposeProxy(vnode.component) || vnode.component.proxy;
                }
                else if (({}.NODE_ENV !== 'production')) {
                    warn(`App has already been mounted.\n` +
                        `If you want to remount the same app, move your app creation logic ` +
                        `into a factory function and create fresh app instances for each ` +
                        `mount - e.g. \`const createMyApp = () => createApp(App)\``);
                }
            },
            unmount() {
                if (isMounted) {
                    render(null, app._container);
                    if (({}.NODE_ENV !== 'production') || false) {
                        app._instance = null;
                        devtoolsUnmountApp(app);
                    }
                    delete app._container.__vue_app__;
                }
                else if (({}.NODE_ENV !== 'production')) {
                    warn(`Cannot unmount an app that is not mounted.`);
                }
            },
            provide(key, value) {
                if (({}.NODE_ENV !== 'production') && key in context.provides) {
                    warn(`App already provides property with key "${String(key)}". ` +
                        `It will be overwritten with the new value.`);
                }
                context.provides[key] = value;
                return app;
            }
        });
        return app;
    };
}

/**
 * Function for handling a template ref
 */
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
    if (isArray(rawRef)) {
        rawRef.forEach((r, i) => setRef(r, oldRawRef && (isArray(oldRawRef) ? oldRawRef[i] : oldRawRef), parentSuspense, vnode, isUnmount));
        return;
    }
    if (isAsyncWrapper(vnode) && !isUnmount) {
        // when mounting async components, nothing needs to be done,
        // because the template ref is forwarded to inner component
        return;
    }
    const refValue = vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */
        ? getExposeProxy(vnode.component) || vnode.component.proxy
        : vnode.el;
    const value = isUnmount ? null : refValue;
    const { i: owner, r: ref } = rawRef;
    if (({}.NODE_ENV !== 'production') && !owner) {
        warn(`Missing ref owner context. ref cannot be used on hoisted vnodes. ` +
            `A vnode with ref must be created inside the render function.`);
        return;
    }
    const oldRef = oldRawRef && oldRawRef.r;
    const refs = owner.refs === EMPTY_OBJ ? (owner.refs = {}) : owner.refs;
    const setupState = owner.setupState;
    // dynamic ref changed. unset old ref
    if (oldRef != null && oldRef !== ref) {
        if (isString$1(oldRef)) {
            refs[oldRef] = null;
            if (hasOwn(setupState, oldRef)) {
                setupState[oldRef] = null;
            }
        }
        else if (isRef(oldRef)) {
            oldRef.value = null;
        }
    }
    if (isFunction(ref)) {
        callWithErrorHandling(ref, owner, 12 /* FUNCTION_REF */, [value, refs]);
    }
    else {
        const _isString = isString$1(ref);
        const _isRef = isRef(ref);
        if (_isString || _isRef) {
            const doSet = () => {
                if (rawRef.f) {
                    const existing = _isString ? refs[ref] : ref.value;
                    if (isUnmount) {
                        isArray(existing) && remove(existing, refValue);
                    }
                    else {
                        if (!isArray(existing)) {
                            if (_isString) {
                                refs[ref] = [refValue];
                                if (hasOwn(setupState, ref)) {
                                    setupState[ref] = refs[ref];
                                }
                            }
                            else {
                                ref.value = [refValue];
                                if (rawRef.k)
                                    refs[rawRef.k] = ref.value;
                            }
                        }
                        else if (!existing.includes(refValue)) {
                            existing.push(refValue);
                        }
                    }
                }
                else if (_isString) {
                    refs[ref] = value;
                    if (hasOwn(setupState, ref)) {
                        setupState[ref] = value;
                    }
                }
                else if (_isRef) {
                    ref.value = value;
                    if (rawRef.k)
                        refs[rawRef.k] = value;
                }
                else if (({}.NODE_ENV !== 'production')) {
                    warn('Invalid template ref type:', ref, `(${typeof ref})`);
                }
            };
            if (value) {
                doSet.id = -1;
                queuePostRenderEffect(doSet, parentSuspense);
            }
            else {
                doSet();
            }
        }
        else if (({}.NODE_ENV !== 'production')) {
            warn('Invalid template ref type:', ref, `(${typeof ref})`);
        }
    }
}

/* eslint-disable no-restricted-globals */
let supported;
let perf;
function startMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        perf.mark(`vue-${type}-${instance.uid}`);
    }
    if (({}.NODE_ENV !== 'production') || false) {
        devtoolsPerfStart(instance, type, isSupported() ? perf.now() : Date.now());
    }
}
function endMeasure(instance, type) {
    if (instance.appContext.config.performance && isSupported()) {
        const startTag = `vue-${type}-${instance.uid}`;
        const endTag = startTag + `:end`;
        perf.mark(endTag);
        perf.measure(`<${formatComponentName(instance, instance.type)}> ${type}`, startTag, endTag);
        perf.clearMarks(startTag);
        perf.clearMarks(endTag);
    }
    if (({}.NODE_ENV !== 'production') || false) {
        devtoolsPerfEnd(instance, type, isSupported() ? perf.now() : Date.now());
    }
}
function isSupported() {
    if (supported !== undefined) {
        return supported;
    }
    if (typeof window !== 'undefined' && window.performance) {
        supported = true;
        perf = window.performance;
    }
    else {
        supported = false;
    }
    return supported;
}

/**
 * This is only called in esm-bundler builds.
 * It is called when a renderer is created, in `baseCreateRenderer` so that
 * importing runtime-core is side-effects free.
 *
 * istanbul-ignore-next
 */
function initFeatureFlags() {
    const needWarn = [];
    if (({}.NODE_ENV !== 'production') && needWarn.length) {
        const multi = needWarn.length > 1;
        console.warn(`Feature flag${multi ? `s` : ``} ${needWarn.join(', ')} ${multi ? `are` : `is`} not explicitly defined. You are running the esm-bundler build of Vue, ` +
            `which expects these compile-time feature flags to be globally injected ` +
            `via the bundler config in order to get better tree-shaking in the ` +
            `production bundle.\n\n` +
            `For more details, see https://link.vuejs.org/feature-flags.`);
    }
}

const queuePostRenderEffect = queueEffectWithSuspense
    ;
/**
 * The createRenderer function accepts two generic arguments:
 * HostNode and HostElement, corresponding to Node and Element types in the
 * host environment. For example, for runtime-dom, HostNode would be the DOM
 * `Node` interface and HostElement would be the DOM `Element` interface.
 *
 * Custom renderers can pass in the platform specific types like this:
 *
 * ``` js
 * const { render, createApp } = createRenderer<Node, Element>({
 *   patchProp,
 *   ...nodeOps
 * })
 * ```
 */
function createRenderer(options) {
    return baseCreateRenderer(options);
}
// implementation
function baseCreateRenderer(options, createHydrationFns) {
    // compile-time feature flags check
    {
        initFeatureFlags();
    }
    const target = getGlobalThis();
    target.__VUE__ = true;
    if (({}.NODE_ENV !== 'production') || false) {
        setDevtoolsHook(target.__VUE_DEVTOOLS_GLOBAL_HOOK__, target);
    }
    const { insert: hostInsert, remove: hostRemove, patchProp: hostPatchProp, createElement: hostCreateElement, createText: hostCreateText, createComment: hostCreateComment, setText: hostSetText, setElementText: hostSetElementText, parentNode: hostParentNode, nextSibling: hostNextSibling, setScopeId: hostSetScopeId = NOOP, cloneNode: hostCloneNode, insertStaticContent: hostInsertStaticContent } = options;
    // Note: functions inside this closure should use `const xxx = () => {}`
    // style in order to prevent being inlined by minifiers.
    const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, isSVG = false, slotScopeIds = null, optimized = ({}.NODE_ENV !== 'production') && isHmrUpdating ? false : !!n2.dynamicChildren) => {
        if (n1 === n2) {
            return;
        }
        // patching & not same type, unmount old tree
        if (n1 && !isSameVNodeType(n1, n2)) {
            anchor = getNextHostNode(n1);
            unmount(n1, parentComponent, parentSuspense, true);
            n1 = null;
        }
        if (n2.patchFlag === -2 /* BAIL */) {
            optimized = false;
            n2.dynamicChildren = null;
        }
        const { type, ref, shapeFlag } = n2;
        switch (type) {
            case Text:
                processText(n1, n2, container, anchor);
                break;
            case Comment:
                processCommentNode(n1, n2, container, anchor);
                break;
            case Static:
                if (n1 == null) {
                    mountStaticNode(n2, container, anchor, isSVG);
                }
                else if (({}.NODE_ENV !== 'production')) {
                    patchStaticNode(n1, n2, container, isSVG);
                }
                break;
            case Fragment:
                processFragment(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (shapeFlag & 6 /* COMPONENT */) {
                    processComponent(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (shapeFlag & 64 /* TELEPORT */) {
                    type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                }
                else if (shapeFlag & 128 /* SUSPENSE */) {
                    type.process(n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, internals);
                }
                else if (({}.NODE_ENV !== 'production')) {
                    warn('Invalid VNode type:', type, `(${typeof type})`);
                }
        }
        // set ref
        if (ref != null && parentComponent) {
            setRef(ref, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
        }
    };
    const processText = (n1, n2, container, anchor) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateText(n2.children)), container, anchor);
        }
        else {
            const el = (n2.el = n1.el);
            if (n2.children !== n1.children) {
                hostSetText(el, n2.children);
            }
        }
    };
    const processCommentNode = (n1, n2, container, anchor) => {
        if (n1 == null) {
            hostInsert((n2.el = hostCreateComment(n2.children || '')), container, anchor);
        }
        else {
            // there's no support for dynamic comments
            n2.el = n1.el;
        }
    };
    const mountStaticNode = (n2, container, anchor, isSVG) => {
        [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG, n2.el, n2.anchor);
    };
    /**
     * Dev / HMR only
     */
    const patchStaticNode = (n1, n2, container, isSVG) => {
        // static nodes are only patched during dev for HMR
        if (n2.children !== n1.children) {
            const anchor = hostNextSibling(n1.anchor);
            // remove existing
            removeStaticNode(n1);
            [n2.el, n2.anchor] = hostInsertStaticContent(n2.children, container, anchor, isSVG);
        }
        else {
            n2.el = n1.el;
            n2.anchor = n1.anchor;
        }
    };
    const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
        let next;
        while (el && el !== anchor) {
            next = hostNextSibling(el);
            hostInsert(el, container, nextSibling);
            el = next;
        }
        hostInsert(anchor, container, nextSibling);
    };
    const removeStaticNode = ({ el, anchor }) => {
        let next;
        while (el && el !== anchor) {
            next = hostNextSibling(el);
            hostRemove(el);
            el = next;
        }
        hostRemove(anchor);
    };
    const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        isSVG = isSVG || n2.type === 'svg';
        if (n1 == null) {
            mountElement(n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        else {
            patchElement(n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
    };
    const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let el;
        let vnodeHook;
        const { type, props, shapeFlag, transition, patchFlag, dirs } = vnode;
        if (!({}.NODE_ENV !== 'production') &&
            vnode.el &&
            hostCloneNode !== undefined &&
            patchFlag === -1 /* HOISTED */) {
            // If a vnode has non-null el, it means it's being reused.
            // Only static vnodes can be reused, so its mounted DOM nodes should be
            // exactly the same, and we can simply do a clone here.
            // only do this in production since cloned trees cannot be HMR updated.
            el = vnode.el = hostCloneNode(vnode.el);
        }
        else {
            el = vnode.el = hostCreateElement(vnode.type, isSVG, props && props.is, props);
            // mount children first, since some props may rely on child content
            // being already rendered, e.g. `<select value>`
            if (shapeFlag & 8 /* TEXT_CHILDREN */) {
                hostSetElementText(el, vnode.children);
            }
            else if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                mountChildren(vnode.children, el, null, parentComponent, parentSuspense, isSVG && type !== 'foreignObject', slotScopeIds, optimized);
            }
            if (dirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'created');
            }
            // props
            if (props) {
                for (const key in props) {
                    if (key !== 'value' && !isReservedProp(key)) {
                        hostPatchProp(el, key, null, props[key], isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
                /**
                 * Special case for setting value on DOM elements:
                 * - it can be order-sensitive (e.g. should be set *after* min/max, #2325, #4024)
                 * - it needs to be forced (#1471)
                 * #2353 proposes adding another renderer option to configure this, but
                 * the properties affects are so finite it is worth special casing it
                 * here to reduce the complexity. (Special casing it also should not
                 * affect non-DOM renderers)
                 */
                if ('value' in props) {
                    hostPatchProp(el, 'value', null, props.value);
                }
                if ((vnodeHook = props.onVnodeBeforeMount)) {
                    invokeVNodeHook(vnodeHook, parentComponent, vnode);
                }
            }
            // scopeId
            setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
        }
        if (({}.NODE_ENV !== 'production') || false) {
            Object.defineProperty(el, '__vnode', {
                value: vnode,
                enumerable: false
            });
            Object.defineProperty(el, '__vueParentComponent', {
                value: parentComponent,
                enumerable: false
            });
        }
        if (dirs) {
            invokeDirectiveHook(vnode, null, parentComponent, 'beforeMount');
        }
        // #1583 For inside suspense + suspense not resolved case, enter hook should call when suspense resolved
        // #1689 For inside suspense + suspense resolved case, just call it
        const needCallTransitionHooks = (!parentSuspense || (parentSuspense && !parentSuspense.pendingBranch)) &&
            transition &&
            !transition.persisted;
        if (needCallTransitionHooks) {
            transition.beforeEnter(el);
        }
        hostInsert(el, container, anchor);
        if ((vnodeHook = props && props.onVnodeMounted) ||
            needCallTransitionHooks ||
            dirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                needCallTransitionHooks && transition.enter(el);
                dirs && invokeDirectiveHook(vnode, null, parentComponent, 'mounted');
            }, parentSuspense);
        }
    };
    const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
        if (scopeId) {
            hostSetScopeId(el, scopeId);
        }
        if (slotScopeIds) {
            for (let i = 0; i < slotScopeIds.length; i++) {
                hostSetScopeId(el, slotScopeIds[i]);
            }
        }
        if (parentComponent) {
            let subTree = parentComponent.subTree;
            if (({}.NODE_ENV !== 'production') &&
                subTree.patchFlag > 0 &&
                subTree.patchFlag & 2048 /* DEV_ROOT_FRAGMENT */) {
                subTree =
                    filterSingleRoot(subTree.children) || subTree;
            }
            if (vnode === subTree) {
                const parentVNode = parentComponent.vnode;
                setScopeId(el, parentVNode, parentVNode.scopeId, parentVNode.slotScopeIds, parentComponent.parent);
            }
        }
    };
    const mountChildren = (children, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, start = 0) => {
        for (let i = start; i < children.length; i++) {
            const child = (children[i] = optimized
                ? cloneIfMounted(children[i])
                : normalizeVNode(children[i]));
            patch(null, child, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
    };
    const patchElement = (n1, n2, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        const el = (n2.el = n1.el);
        let { patchFlag, dynamicChildren, dirs } = n2;
        // #1426 take the old vnode's patch flag into account since user may clone a
        // compiler-generated vnode, which de-opts to FULL_PROPS
        patchFlag |= n1.patchFlag & 16 /* FULL_PROPS */;
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        let vnodeHook;
        // disable recurse in beforeUpdate hooks
        parentComponent && toggleRecurse(parentComponent, false);
        if ((vnodeHook = newProps.onVnodeBeforeUpdate)) {
            invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        }
        if (dirs) {
            invokeDirectiveHook(n2, n1, parentComponent, 'beforeUpdate');
        }
        parentComponent && toggleRecurse(parentComponent, true);
        if (({}.NODE_ENV !== 'production') && isHmrUpdating) {
            // HMR updated, force full diff
            patchFlag = 0;
            optimized = false;
            dynamicChildren = null;
        }
        const areChildrenSVG = isSVG && n2.type !== 'foreignObject';
        if (dynamicChildren) {
            patchBlockChildren(n1.dynamicChildren, dynamicChildren, el, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds);
            if (({}.NODE_ENV !== 'production') && parentComponent && parentComponent.type.__hmrId) {
                traverseStaticChildren(n1, n2);
            }
        }
        else if (!optimized) {
            // full diff
            patchChildren(n1, n2, el, null, parentComponent, parentSuspense, areChildrenSVG, slotScopeIds, false);
        }
        if (patchFlag > 0) {
            // the presence of a patchFlag means this element's render code was
            // generated by the compiler and can take the fast path.
            // in this path old node and new node are guaranteed to have the same shape
            // (i.e. at the exact same position in the source template)
            if (patchFlag & 16 /* FULL_PROPS */) {
                // element props contain dynamic keys, full diff needed
                patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
            }
            else {
                // class
                // this flag is matched when the element has dynamic class bindings.
                if (patchFlag & 2 /* CLASS */) {
                    if (oldProps.class !== newProps.class) {
                        hostPatchProp(el, 'class', null, newProps.class, isSVG);
                    }
                }
                // style
                // this flag is matched when the element has dynamic style bindings
                if (patchFlag & 4 /* STYLE */) {
                    hostPatchProp(el, 'style', oldProps.style, newProps.style, isSVG);
                }
                // props
                // This flag is matched when the element has dynamic prop/attr bindings
                // other than class and style. The keys of dynamic prop/attrs are saved for
                // faster iteration.
                // Note dynamic keys like :[foo]="bar" will cause this optimization to
                // bail out and go through a full diff because we need to unset the old key
                if (patchFlag & 8 /* PROPS */) {
                    // if the flag is present then dynamicProps must be non-null
                    const propsToUpdate = n2.dynamicProps;
                    for (let i = 0; i < propsToUpdate.length; i++) {
                        const key = propsToUpdate[i];
                        const prev = oldProps[key];
                        const next = newProps[key];
                        // #1471 force patch value
                        if (next !== prev || key === 'value') {
                            hostPatchProp(el, key, prev, next, isSVG, n1.children, parentComponent, parentSuspense, unmountChildren);
                        }
                    }
                }
            }
            // text
            // This flag is matched when the element has only dynamic text children.
            if (patchFlag & 1 /* TEXT */) {
                if (n1.children !== n2.children) {
                    hostSetElementText(el, n2.children);
                }
            }
        }
        else if (!optimized && dynamicChildren == null) {
            // unoptimized, full diff
            patchProps(el, n2, oldProps, newProps, parentComponent, parentSuspense, isSVG);
        }
        if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
                dirs && invokeDirectiveHook(n2, n1, parentComponent, 'updated');
            }, parentSuspense);
        }
    };
    // The fast path for blocks.
    const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, isSVG, slotScopeIds) => {
        for (let i = 0; i < newChildren.length; i++) {
            const oldVNode = oldChildren[i];
            const newVNode = newChildren[i];
            // Determine the container (parent element) for the patch.
            const container = 
            // oldVNode may be an errored async setup() component inside Suspense
            // which will not have a mounted element
            oldVNode.el &&
                // - In the case of a Fragment, we need to provide the actual parent
                // of the Fragment itself so it can move its children.
                (oldVNode.type === Fragment ||
                    // - In the case of different nodes, there is going to be a replacement
                    // which also requires the correct parent container
                    !isSameVNodeType(oldVNode, newVNode) ||
                    // - In the case of a component, it could contain anything.
                    oldVNode.shapeFlag & (6 /* COMPONENT */ | 64 /* TELEPORT */))
                ? hostParentNode(oldVNode.el)
                : // In other cases, the parent container is not actually used so we
                    // just pass the block element here to avoid a DOM parentNode call.
                    fallbackContainer;
            patch(oldVNode, newVNode, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, true);
        }
    };
    const patchProps = (el, vnode, oldProps, newProps, parentComponent, parentSuspense, isSVG) => {
        if (oldProps !== newProps) {
            for (const key in newProps) {
                // empty string is not valid prop
                if (isReservedProp(key))
                    continue;
                const next = newProps[key];
                const prev = oldProps[key];
                // defer patching value
                if (next !== prev && key !== 'value') {
                    hostPatchProp(el, key, prev, next, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!isReservedProp(key) && !(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null, isSVG, vnode.children, parentComponent, parentSuspense, unmountChildren);
                    }
                }
            }
            if ('value' in newProps) {
                hostPatchProp(el, 'value', oldProps.value, newProps.value);
            }
        }
    };
    const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        const fragmentStartAnchor = (n2.el = n1 ? n1.el : hostCreateText(''));
        const fragmentEndAnchor = (n2.anchor = n1 ? n1.anchor : hostCreateText(''));
        let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
        if (({}.NODE_ENV !== 'production') &&
            // #5523 dev root fragment may inherit directives
            (isHmrUpdating || patchFlag & 2048 /* DEV_ROOT_FRAGMENT */)) {
            // HMR updated / Dev root fragment (w/ comments), force full diff
            patchFlag = 0;
            optimized = false;
            dynamicChildren = null;
        }
        // check if this is a slot fragment with :slotted scope ids
        if (fragmentSlotScopeIds) {
            slotScopeIds = slotScopeIds
                ? slotScopeIds.concat(fragmentSlotScopeIds)
                : fragmentSlotScopeIds;
        }
        if (n1 == null) {
            hostInsert(fragmentStartAnchor, container, anchor);
            hostInsert(fragmentEndAnchor, container, anchor);
            // a fragment can only have array children
            // since they are either generated by the compiler, or implicitly created
            // from arrays.
            mountChildren(n2.children, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        else {
            if (patchFlag > 0 &&
                patchFlag & 64 /* STABLE_FRAGMENT */ &&
                dynamicChildren &&
                // #2715 the previous fragment could've been a BAILed one as a result
                // of renderSlot() with no valid children
                n1.dynamicChildren) {
                // a stable fragment (template root or <template v-for>) doesn't need to
                // patch children order, but it may contain dynamicChildren.
                patchBlockChildren(n1.dynamicChildren, dynamicChildren, container, parentComponent, parentSuspense, isSVG, slotScopeIds);
                if (({}.NODE_ENV !== 'production') && parentComponent && parentComponent.type.__hmrId) {
                    traverseStaticChildren(n1, n2);
                }
                else if (
                // #2080 if the stable fragment has a key, it's a <template v-for> that may
                //  get moved around. Make sure all root level vnodes inherit el.
                // #2134 or if it's a component root, it may also get moved around
                // as the component is being moved.
                n2.key != null ||
                    (parentComponent && n2 === parentComponent.subTree)) {
                    traverseStaticChildren(n1, n2, true /* shallow */);
                }
            }
            else {
                // keyed / unkeyed, or manual fragments.
                // for keyed & unkeyed, since they are compiler generated from v-for,
                // each child is guaranteed to be a block so the fragment will never
                // have dynamicChildren.
                patchChildren(n1, n2, container, fragmentEndAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
        }
    };
    const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        n2.slotScopeIds = slotScopeIds;
        if (n1 == null) {
            if (n2.shapeFlag & 512 /* COMPONENT_KEPT_ALIVE */) {
                parentComponent.ctx.activate(n2, container, anchor, isSVG, optimized);
            }
            else {
                mountComponent(n2, container, anchor, parentComponent, parentSuspense, isSVG, optimized);
            }
        }
        else {
            updateComponent(n1, n2, optimized);
        }
    };
    const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, isSVG, optimized) => {
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent, parentSuspense));
        if (({}.NODE_ENV !== 'production') && instance.type.__hmrId) {
            registerHMR(instance);
        }
        if (({}.NODE_ENV !== 'production')) {
            pushWarningContext(initialVNode);
            startMeasure(instance, `mount`);
        }
        // inject renderer internals for keepAlive
        if (isKeepAlive(initialVNode)) {
            instance.ctx.renderer = internals;
        }
        // resolve props and slots for setup context
        {
            if (({}.NODE_ENV !== 'production')) {
                startMeasure(instance, `init`);
            }
            setupComponent(instance);
            if (({}.NODE_ENV !== 'production')) {
                endMeasure(instance, `init`);
            }
        }
        // setup() is async. This component relies on async logic to be resolved
        // before proceeding
        if (instance.asyncDep) {
            parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect);
            // Give it a placeholder if this is not hydration
            // TODO handle self-defined fallback
            if (!initialVNode.el) {
                const placeholder = (instance.subTree = createVNode(Comment));
                processCommentNode(null, placeholder, container, anchor);
            }
            return;
        }
        setupRenderEffect(instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized);
        if (({}.NODE_ENV !== 'production')) {
            popWarningContext();
            endMeasure(instance, `mount`);
        }
    };
    const updateComponent = (n1, n2, optimized) => {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2, optimized)) {
            if (instance.asyncDep &&
                !instance.asyncResolved) {
                // async & still pending - just update props and slots
                // since the component's reactive effect for render isn't set-up yet
                if (({}.NODE_ENV !== 'production')) {
                    pushWarningContext(n2);
                }
                updateComponentPreRender(instance, n2, optimized);
                if (({}.NODE_ENV !== 'production')) {
                    popWarningContext();
                }
                return;
            }
            else {
                // normal update
                instance.next = n2;
                // in case the child component is also queued, remove it to avoid
                // double updating the same child component in the same flush.
                invalidateJob(instance.update);
                // instance.update is the reactive effect.
                instance.update();
            }
        }
        else {
            // no update needed. just copy over properties
            n2.el = n1.el;
            instance.vnode = n2;
        }
    };
    const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, isSVG, optimized) => {
        const componentUpdateFn = () => {
            if (!instance.isMounted) {
                let vnodeHook;
                const { el, props } = initialVNode;
                const { bm, m, parent } = instance;
                const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
                toggleRecurse(instance, false);
                // beforeMount hook
                if (bm) {
                    invokeArrayFns(bm);
                }
                // onVnodeBeforeMount
                if (!isAsyncWrapperVNode &&
                    (vnodeHook = props && props.onVnodeBeforeMount)) {
                    invokeVNodeHook(vnodeHook, parent, initialVNode);
                }
                toggleRecurse(instance, true);
                if (el && hydrateNode) {
                    // vnode has adopted host node - perform hydration instead of mount.
                    const hydrateSubTree = () => {
                        if (({}.NODE_ENV !== 'production')) {
                            startMeasure(instance, `render`);
                        }
                        instance.subTree = renderComponentRoot(instance);
                        if (({}.NODE_ENV !== 'production')) {
                            endMeasure(instance, `render`);
                        }
                        if (({}.NODE_ENV !== 'production')) {
                            startMeasure(instance, `hydrate`);
                        }
                        hydrateNode(el, instance.subTree, instance, parentSuspense, null);
                        if (({}.NODE_ENV !== 'production')) {
                            endMeasure(instance, `hydrate`);
                        }
                    };
                    if (isAsyncWrapperVNode) {
                        initialVNode.type.__asyncLoader().then(
                        // note: we are moving the render call into an async callback,
                        // which means it won't track dependencies - but it's ok because
                        // a server-rendered async wrapper is already in resolved state
                        // and it will never need to change.
                        () => !instance.isUnmounted && hydrateSubTree());
                    }
                    else {
                        hydrateSubTree();
                    }
                }
                else {
                    if (({}.NODE_ENV !== 'production')) {
                        startMeasure(instance, `render`);
                    }
                    const subTree = (instance.subTree = renderComponentRoot(instance));
                    if (({}.NODE_ENV !== 'production')) {
                        endMeasure(instance, `render`);
                    }
                    if (({}.NODE_ENV !== 'production')) {
                        startMeasure(instance, `patch`);
                    }
                    patch(null, subTree, container, anchor, instance, parentSuspense, isSVG);
                    if (({}.NODE_ENV !== 'production')) {
                        endMeasure(instance, `patch`);
                    }
                    initialVNode.el = subTree.el;
                }
                // mounted hook
                if (m) {
                    queuePostRenderEffect(m, parentSuspense);
                }
                // onVnodeMounted
                if (!isAsyncWrapperVNode &&
                    (vnodeHook = props && props.onVnodeMounted)) {
                    const scopedInitialVNode = initialVNode;
                    queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode), parentSuspense);
                }
                // activated hook for keep-alive roots.
                // #1742 activated hook must be accessed after first render
                // since the hook may be injected by a child keep-alive
                if (initialVNode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */ ||
                    (parent &&
                        isAsyncWrapper(parent.vnode) &&
                        parent.vnode.shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */)) {
                    instance.a && queuePostRenderEffect(instance.a, parentSuspense);
                }
                instance.isMounted = true;
                if (({}.NODE_ENV !== 'production') || false) {
                    devtoolsComponentAdded(instance);
                }
                // #2458: deference mount-only object parameters to prevent memleaks
                initialVNode = container = anchor = null;
            }
            else {
                // updateComponent
                // This is triggered by mutation of component's own state (next: null)
                // OR parent calling processComponent (next: VNode)
                let { next, bu, u, parent, vnode } = instance;
                let originNext = next;
                let vnodeHook;
                if (({}.NODE_ENV !== 'production')) {
                    pushWarningContext(next || instance.vnode);
                }
                // Disallow component effect recursion during pre-lifecycle hooks.
                toggleRecurse(instance, false);
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next, optimized);
                }
                else {
                    next = vnode;
                }
                // beforeUpdate hook
                if (bu) {
                    invokeArrayFns(bu);
                }
                // onVnodeBeforeUpdate
                if ((vnodeHook = next.props && next.props.onVnodeBeforeUpdate)) {
                    invokeVNodeHook(vnodeHook, parent, next, vnode);
                }
                toggleRecurse(instance, true);
                // render
                if (({}.NODE_ENV !== 'production')) {
                    startMeasure(instance, `render`);
                }
                const nextTree = renderComponentRoot(instance);
                if (({}.NODE_ENV !== 'production')) {
                    endMeasure(instance, `render`);
                }
                const prevTree = instance.subTree;
                instance.subTree = nextTree;
                if (({}.NODE_ENV !== 'production')) {
                    startMeasure(instance, `patch`);
                }
                patch(prevTree, nextTree, 
                // parent may have changed if it's in a teleport
                hostParentNode(prevTree.el), 
                // anchor may have changed if it's in a fragment
                getNextHostNode(prevTree), instance, parentSuspense, isSVG);
                if (({}.NODE_ENV !== 'production')) {
                    endMeasure(instance, `patch`);
                }
                next.el = nextTree.el;
                if (originNext === null) {
                    // self-triggered update. In case of HOC, update parent component
                    // vnode el. HOC is indicated by parent instance's subTree pointing
                    // to child component's vnode
                    updateHOCHostEl(instance, nextTree.el);
                }
                // updated hook
                if (u) {
                    queuePostRenderEffect(u, parentSuspense);
                }
                // onVnodeUpdated
                if ((vnodeHook = next.props && next.props.onVnodeUpdated)) {
                    queuePostRenderEffect(() => invokeVNodeHook(vnodeHook, parent, next, vnode), parentSuspense);
                }
                if (({}.NODE_ENV !== 'production') || false) {
                    devtoolsComponentUpdated(instance);
                }
                if (({}.NODE_ENV !== 'production')) {
                    popWarningContext();
                }
            }
        };
        // create reactive effect for rendering
        const effect = (instance.effect = new ReactiveEffect(componentUpdateFn, () => queueJob(update), instance.scope // track it in component's effect scope
        ));
        const update = (instance.update = () => effect.run());
        update.id = instance.uid;
        // allowRecurse
        // #1801, #2043 component render effects should allow recursive updates
        toggleRecurse(instance, true);
        if (({}.NODE_ENV !== 'production')) {
            effect.onTrack = instance.rtc
                ? e => invokeArrayFns(instance.rtc, e)
                : void 0;
            effect.onTrigger = instance.rtg
                ? e => invokeArrayFns(instance.rtg, e)
                : void 0;
            update.ownerInstance = instance;
        }
        update();
    };
    const updateComponentPreRender = (instance, nextVNode, optimized) => {
        nextVNode.component = instance;
        const prevProps = instance.vnode.props;
        instance.vnode = nextVNode;
        instance.next = null;
        updateProps(instance, nextVNode.props, prevProps, optimized);
        updateSlots(instance, nextVNode.children, optimized);
        pauseTracking();
        // props update may have triggered pre-flush watchers.
        // flush them before the render update.
        flushPreFlushCbs(undefined, instance.update);
        resetTracking();
    };
    const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized = false) => {
        const c1 = n1 && n1.children;
        const prevShapeFlag = n1 ? n1.shapeFlag : 0;
        const c2 = n2.children;
        const { patchFlag, shapeFlag } = n2;
        // fast path
        if (patchFlag > 0) {
            if (patchFlag & 128 /* KEYED_FRAGMENT */) {
                // this could be either fully-keyed or mixed (some keyed some not)
                // presence of patchFlag means children are guaranteed to be arrays
                patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                return;
            }
            else if (patchFlag & 256 /* UNKEYED_FRAGMENT */) {
                // unkeyed
                patchUnkeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                return;
            }
        }
        // children has 3 possibilities: text, array or no children.
        if (shapeFlag & 8 /* TEXT_CHILDREN */) {
            // text children fast path
            if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                unmountChildren(c1, parentComponent, parentSuspense);
            }
            if (c2 !== c1) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 16 /* ARRAY_CHILDREN */) {
                // prev children was array
                if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                    // two arrays, cannot assume anything, do full diff
                    patchKeyedChildren(c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else {
                    // no new children, just unmount old
                    unmountChildren(c1, parentComponent, parentSuspense, true);
                }
            }
            else {
                // prev children was text OR null
                // new children is array OR null
                if (prevShapeFlag & 8 /* TEXT_CHILDREN */) {
                    hostSetElementText(container, '');
                }
                // mount new if array
                if (shapeFlag & 16 /* ARRAY_CHILDREN */) {
                    mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
            }
        }
    };
    const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        c1 = c1 || EMPTY_ARR;
        c2 = c2 || EMPTY_ARR;
        const oldLength = c1.length;
        const newLength = c2.length;
        const commonLength = Math.min(oldLength, newLength);
        let i;
        for (i = 0; i < commonLength; i++) {
            const nextChild = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
        }
        if (oldLength > newLength) {
            // remove old
            unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
        }
        else {
            // mount new
            mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
        }
    };
    // can be all-keyed or mixed
    const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1; // prev ending index
        let e2 = l2 - 1; // next ending index
        // 1. sync from start
        // (a b) c
        // (a b) d e
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                break;
            }
            i++;
        }
        // 2. sync from end
        // a (b c)
        // d e (b c)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = (c2[e2] = optimized
                ? cloneIfMounted(c2[e2])
                : normalizeVNode(c2[e2]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // 3. common sequence + mount
        // (a b)
        // (a b) c
        // i = 2, e1 = 1, e2 = 2
        // (a b)
        // c (a b)
        // i = 0, e1 = -1, e2 = 0
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
                while (i <= e2) {
                    patch(null, (c2[i] = optimized
                        ? cloneIfMounted(c2[i])
                        : normalizeVNode(c2[i])), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    i++;
                }
            }
        }
        // 4. common sequence + unmount
        // (a b) c
        // (a b)
        // i = 2, e1 = 2, e2 = 1
        // a (b c)
        // (b c)
        // i = 0, e1 = 0, e2 = -1
        else if (i > e2) {
            while (i <= e1) {
                unmount(c1[i], parentComponent, parentSuspense, true);
                i++;
            }
        }
        // 5. unknown sequence
        // [i ... e1 + 1]: a b [c d e] f g
        // [i ... e2 + 1]: a b [e d c h] f g
        // i = 2, e1 = 4, e2 = 5
        else {
            const s1 = i; // prev starting index
            const s2 = i; // next starting index
            // 5.1 build key:index map for newChildren
            const keyToNewIndexMap = new Map();
            for (i = s2; i <= e2; i++) {
                const nextChild = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                if (nextChild.key != null) {
                    if (({}.NODE_ENV !== 'production') && keyToNewIndexMap.has(nextChild.key)) {
                        warn(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
                    }
                    keyToNewIndexMap.set(nextChild.key, i);
                }
            }
            // 5.2 loop through old children left to be patched and try to patch
            // matching nodes & remove nodes that are no longer present
            let j;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            let moved = false;
            // used to track whether any node has moved
            let maxNewIndexSoFar = 0;
            // works as Map<newIndex, oldIndex>
            // Note that oldIndex is offset by +1
            // and oldIndex = 0 is a special value indicating the new node has
            // no corresponding old node.
            // used for determining longest stable subsequence
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
            for (i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    // all new children have been patched so this can only be a removal
                    unmount(prevChild, parentComponent, parentSuspense, true);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    // key-less node, try to locate a key-less node of the same type
                    for (j = s2; j <= e2; j++) {
                        if (newIndexToOldIndexMap[j - s2] === 0 &&
                            isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    unmount(prevChild, parentComponent, parentSuspense, true);
                }
                else {
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    patched++;
                }
            }
            // 5.3 move and mount
            // generate longest stable subsequence only when nodes have moved
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : EMPTY_ARR;
            j = increasingNewIndexSequence.length - 1;
            // looping backwards so that we can use last patched node as anchor
            for (i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexToOldIndexMap[i] === 0) {
                    // mount new
                    patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (moved) {
                    // move if:
                    // There is no stable subsequence (e.g. a reverse)
                    // OR current node is not among the stable sequence
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        move(nextChild, container, anchor, 2 /* REORDER */);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    };
    const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
        const { el, type, transition, children, shapeFlag } = vnode;
        if (shapeFlag & 6 /* COMPONENT */) {
            move(vnode.component.subTree, container, anchor, moveType);
            return;
        }
        if (shapeFlag & 128 /* SUSPENSE */) {
            vnode.suspense.move(container, anchor, moveType);
            return;
        }
        if (shapeFlag & 64 /* TELEPORT */) {
            type.move(vnode, container, anchor, internals);
            return;
        }
        if (type === Fragment) {
            hostInsert(el, container, anchor);
            for (let i = 0; i < children.length; i++) {
                move(children[i], container, anchor, moveType);
            }
            hostInsert(vnode.anchor, container, anchor);
            return;
        }
        if (type === Static) {
            moveStaticNode(vnode, container, anchor);
            return;
        }
        // single nodes
        const needTransition = moveType !== 2 /* REORDER */ &&
            shapeFlag & 1 /* ELEMENT */ &&
            transition;
        if (needTransition) {
            if (moveType === 0 /* ENTER */) {
                transition.beforeEnter(el);
                hostInsert(el, container, anchor);
                queuePostRenderEffect(() => transition.enter(el), parentSuspense);
            }
            else {
                const { leave, delayLeave, afterLeave } = transition;
                const remove = () => hostInsert(el, container, anchor);
                const performLeave = () => {
                    leave(el, () => {
                        remove();
                        afterLeave && afterLeave();
                    });
                };
                if (delayLeave) {
                    delayLeave(el, remove, performLeave);
                }
                else {
                    performLeave();
                }
            }
        }
        else {
            hostInsert(el, container, anchor);
        }
    };
    const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
        const { type, props, ref, children, dynamicChildren, shapeFlag, patchFlag, dirs } = vnode;
        // unset ref
        if (ref != null) {
            setRef(ref, null, parentSuspense, vnode, true);
        }
        if (shapeFlag & 256 /* COMPONENT_SHOULD_KEEP_ALIVE */) {
            parentComponent.ctx.deactivate(vnode);
            return;
        }
        const shouldInvokeDirs = shapeFlag & 1 /* ELEMENT */ && dirs;
        const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
        let vnodeHook;
        if (shouldInvokeVnodeHook &&
            (vnodeHook = props && props.onVnodeBeforeUnmount)) {
            invokeVNodeHook(vnodeHook, parentComponent, vnode);
        }
        if (shapeFlag & 6 /* COMPONENT */) {
            unmountComponent(vnode.component, parentSuspense, doRemove);
        }
        else {
            if (shapeFlag & 128 /* SUSPENSE */) {
                vnode.suspense.unmount(parentSuspense, doRemove);
                return;
            }
            if (shouldInvokeDirs) {
                invokeDirectiveHook(vnode, null, parentComponent, 'beforeUnmount');
            }
            if (shapeFlag & 64 /* TELEPORT */) {
                vnode.type.remove(vnode, parentComponent, parentSuspense, optimized, internals, doRemove);
            }
            else if (dynamicChildren &&
                // #1153: fast path should not be taken for non-stable (v-for) fragments
                (type !== Fragment ||
                    (patchFlag > 0 && patchFlag & 64 /* STABLE_FRAGMENT */))) {
                // fast path for block nodes: only need to unmount dynamic children.
                unmountChildren(dynamicChildren, parentComponent, parentSuspense, false, true);
            }
            else if ((type === Fragment &&
                patchFlag &
                    (128 /* KEYED_FRAGMENT */ | 256 /* UNKEYED_FRAGMENT */)) ||
                (!optimized && shapeFlag & 16 /* ARRAY_CHILDREN */)) {
                unmountChildren(children, parentComponent, parentSuspense);
            }
            if (doRemove) {
                remove(vnode);
            }
        }
        if ((shouldInvokeVnodeHook &&
            (vnodeHook = props && props.onVnodeUnmounted)) ||
            shouldInvokeDirs) {
            queuePostRenderEffect(() => {
                vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
                shouldInvokeDirs &&
                    invokeDirectiveHook(vnode, null, parentComponent, 'unmounted');
            }, parentSuspense);
        }
    };
    const remove = vnode => {
        const { type, el, anchor, transition } = vnode;
        if (type === Fragment) {
            if (({}.NODE_ENV !== 'production') &&
                vnode.patchFlag > 0 &&
                vnode.patchFlag & 2048 /* DEV_ROOT_FRAGMENT */ &&
                transition &&
                !transition.persisted) {
                vnode.children.forEach(child => {
                    if (child.type === Comment) {
                        hostRemove(child.el);
                    }
                    else {
                        remove(child);
                    }
                });
            }
            else {
                removeFragment(el, anchor);
            }
            return;
        }
        if (type === Static) {
            removeStaticNode(vnode);
            return;
        }
        const performRemove = () => {
            hostRemove(el);
            if (transition && !transition.persisted && transition.afterLeave) {
                transition.afterLeave();
            }
        };
        if (vnode.shapeFlag & 1 /* ELEMENT */ &&
            transition &&
            !transition.persisted) {
            const { leave, delayLeave } = transition;
            const performLeave = () => leave(el, performRemove);
            if (delayLeave) {
                delayLeave(vnode.el, performRemove, performLeave);
            }
            else {
                performLeave();
            }
        }
        else {
            performRemove();
        }
    };
    const removeFragment = (cur, end) => {
        // For fragments, directly remove all contained DOM nodes.
        // (fragment child nodes cannot have transition)
        let next;
        while (cur !== end) {
            next = hostNextSibling(cur);
            hostRemove(cur);
            cur = next;
        }
        hostRemove(end);
    };
    const unmountComponent = (instance, parentSuspense, doRemove) => {
        if (({}.NODE_ENV !== 'production') && instance.type.__hmrId) {
            unregisterHMR(instance);
        }
        const { bum, scope, update, subTree, um } = instance;
        // beforeUnmount hook
        if (bum) {
            invokeArrayFns(bum);
        }
        // stop effects in component scope
        scope.stop();
        // update may be null if a component is unmounted before its async
        // setup has resolved.
        if (update) {
            // so that scheduler will no longer invoke it
            update.active = false;
            unmount(subTree, instance, parentSuspense, doRemove);
        }
        // unmounted hook
        if (um) {
            queuePostRenderEffect(um, parentSuspense);
        }
        queuePostRenderEffect(() => {
            instance.isUnmounted = true;
        }, parentSuspense);
        // A component with async dep inside a pending suspense is unmounted before
        // its async dep resolves. This should remove the dep from the suspense, and
        // cause the suspense to resolve immediately if that was the last dep.
        if (parentSuspense &&
            parentSuspense.pendingBranch &&
            !parentSuspense.isUnmounted &&
            instance.asyncDep &&
            !instance.asyncResolved &&
            instance.suspenseId === parentSuspense.pendingId) {
            parentSuspense.deps--;
            if (parentSuspense.deps === 0) {
                parentSuspense.resolve();
            }
        }
        if (({}.NODE_ENV !== 'production') || false) {
            devtoolsComponentRemoved(instance);
        }
    };
    const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
        for (let i = start; i < children.length; i++) {
            unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
        }
    };
    const getNextHostNode = vnode => {
        if (vnode.shapeFlag & 6 /* COMPONENT */) {
            return getNextHostNode(vnode.component.subTree);
        }
        if (vnode.shapeFlag & 128 /* SUSPENSE */) {
            return vnode.suspense.next();
        }
        return hostNextSibling((vnode.anchor || vnode.el));
    };
    const render = (vnode, container, isSVG) => {
        if (vnode == null) {
            if (container._vnode) {
                unmount(container._vnode, null, null, true);
            }
        }
        else {
            patch(container._vnode || null, vnode, container, null, null, null, isSVG);
        }
        flushPostFlushCbs();
        container._vnode = vnode;
    };
    const internals = {
        p: patch,
        um: unmount,
        m: move,
        r: remove,
        mt: mountComponent,
        mc: mountChildren,
        pc: patchChildren,
        pbc: patchBlockChildren,
        n: getNextHostNode,
        o: options
    };
    let hydrate;
    let hydrateNode;
    if (createHydrationFns) {
        [hydrate, hydrateNode] = createHydrationFns(internals);
    }
    return {
        render,
        hydrate,
        createApp: createAppAPI(render, hydrate)
    };
}
function toggleRecurse({ effect, update }, allowed) {
    effect.allowRecurse = update.allowRecurse = allowed;
}
/**
 * #1156
 * When a component is HMR-enabled, we need to make sure that all static nodes
 * inside a block also inherit the DOM element from the previous tree so that
 * HMR updates (which are full updates) can retrieve the element for patching.
 *
 * #2080
 * Inside keyed `template` fragment static children, if a fragment is moved,
 * the children will always be moved. Therefore, in order to ensure correct move
 * position, el should be inherited from previous nodes.
 */
function traverseStaticChildren(n1, n2, shallow = false) {
    const ch1 = n1.children;
    const ch2 = n2.children;
    if (isArray(ch1) && isArray(ch2)) {
        for (let i = 0; i < ch1.length; i++) {
            // this is only called in the optimized path so array children are
            // guaranteed to be vnodes
            const c1 = ch1[i];
            let c2 = ch2[i];
            if (c2.shapeFlag & 1 /* ELEMENT */ && !c2.dynamicChildren) {
                if (c2.patchFlag <= 0 || c2.patchFlag === 32 /* HYDRATE_EVENTS */) {
                    c2 = ch2[i] = cloneIfMounted(ch2[i]);
                    c2.el = c1.el;
                }
                if (!shallow)
                    traverseStaticChildren(c1, c2);
            }
            // also inherit for comment nodes, but not placeholders (e.g. v-if which
            // would have received .el during block patch)
            if (({}.NODE_ENV !== 'production') && c2.type === Comment && !c2.el) {
                c2.el = c1.el;
            }
        }
    }
}
// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

const isTeleport = (type) => type.__isTeleport;

const Fragment = Symbol(({}.NODE_ENV !== 'production') ? 'Fragment' : undefined);
const Text = Symbol(({}.NODE_ENV !== 'production') ? 'Text' : undefined);
const Comment = Symbol(({}.NODE_ENV !== 'production') ? 'Comment' : undefined);
const Static = Symbol(({}.NODE_ENV !== 'production') ? 'Static' : undefined);
// Since v-if and v-for are the two possible ways node structure can dynamically
// change, once we consider v-if branches and each v-for fragment a block, we
// can divide a template into nested blocks, and within each block the node
// structure would be stable. This allows us to skip most children diffing
// and only worry about the dynamic nodes (indicated by patch flags).
const blockStack = [];
let currentBlock = null;
/**
 * Open a block.
 * This must be called before `createBlock`. It cannot be part of `createBlock`
 * because the children of the block are evaluated before `createBlock` itself
 * is called. The generated code typically looks like this:
 *
 * ```js
 * function render() {
 *   return (openBlock(),createBlock('div', null, [...]))
 * }
 * ```
 * disableTracking is true when creating a v-for fragment block, since a v-for
 * fragment always diffs its children.
 *
 * @private
 */
function openBlock(disableTracking = false) {
    blockStack.push((currentBlock = disableTracking ? null : []));
}
function closeBlock() {
    blockStack.pop();
    currentBlock = blockStack[blockStack.length - 1] || null;
}
// Whether we should be tracking dynamic child nodes inside a block.
// Only tracks when this value is > 0
// We are not using a simple boolean because this value may need to be
// incremented/decremented by nested usage of v-once (see below)
let isBlockTreeEnabled = 1;
/**
 * Block tracking sometimes needs to be disabled, for example during the
 * creation of a tree that needs to be cached by v-once. The compiler generates
 * code like this:
 *
 * ``` js
 * _cache[1] || (
 *   setBlockTracking(-1),
 *   _cache[1] = createVNode(...),
 *   setBlockTracking(1),
 *   _cache[1]
 * )
 * ```
 *
 * @private
 */
function setBlockTracking(value) {
    isBlockTreeEnabled += value;
}
function setupBlock(vnode) {
    // save current block children on the block vnode
    vnode.dynamicChildren =
        isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
    // close block
    closeBlock();
    // a block is always going to be patched, so track it as a child of its
    // parent block
    if (isBlockTreeEnabled > 0 && currentBlock) {
        currentBlock.push(vnode);
    }
    return vnode;
}
/**
 * @private
 */
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
    return setupBlock(createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, true /* isBlock */));
}
/**
 * Create a block root vnode. Takes the same exact arguments as `createVNode`.
 * A block root keeps track of dynamic nodes within the block in the
 * `dynamicChildren` array.
 *
 * @private
 */
function createBlock(type, props, children, patchFlag, dynamicProps) {
    return setupBlock(createVNode(type, props, children, patchFlag, dynamicProps, true /* isBlock: prevent a block from tracking itself */));
}
function isVNode(value) {
    return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
    if (({}.NODE_ENV !== 'production') &&
        n2.shapeFlag & 6 /* COMPONENT */ &&
        hmrDirtyComponents.has(n2.type)) {
        // HMR only: if the component has been hot-updated, force a reload.
        return false;
    }
    return n1.type === n2.type && n1.key === n2.key;
}
const createVNodeWithArgsTransform = (...args) => {
    return _createVNode(...(args));
};
const InternalObjectKey = `__vInternal`;
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({ ref, ref_key, ref_for }) => {
    return (ref != null
        ? isString$1(ref) || isRef(ref) || isFunction(ref)
            ? { i: currentRenderingInstance, r: ref, k: ref_key, f: !!ref_for }
            : ref
        : null);
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1 /* ELEMENT */, isBlockNode = false, needFullChildrenNormalization = false) {
    const vnode = {
        __v_isVNode: true,
        __v_skip: true,
        type,
        props,
        key: props && normalizeKey(props),
        ref: props && normalizeRef(props),
        scopeId: currentScopeId,
        slotScopeIds: null,
        children,
        component: null,
        suspense: null,
        ssContent: null,
        ssFallback: null,
        dirs: null,
        transition: null,
        el: null,
        anchor: null,
        target: null,
        targetAnchor: null,
        staticCount: 0,
        shapeFlag,
        patchFlag,
        dynamicProps,
        dynamicChildren: null,
        appContext: null
    };
    if (needFullChildrenNormalization) {
        normalizeChildren(vnode, children);
        // normalize suspense children
        if (shapeFlag & 128 /* SUSPENSE */) {
            type.normalize(vnode);
        }
    }
    else if (children) {
        // compiled element vnode - if children is passed, only possible types are
        // string or Array.
        vnode.shapeFlag |= isString$1(children)
            ? 8 /* TEXT_CHILDREN */
            : 16 /* ARRAY_CHILDREN */;
    }
    // validate key
    if (({}.NODE_ENV !== 'production') && vnode.key !== vnode.key) {
        warn(`VNode created with invalid key (NaN). VNode type:`, vnode.type);
    }
    // track vnode for block tree
    if (isBlockTreeEnabled > 0 &&
        // avoid a block node from tracking itself
        !isBlockNode &&
        // has current parent block
        currentBlock &&
        // presence of a patch flag indicates this node needs patching on updates.
        // component nodes also should always be patched, because even if the
        // component doesn't need to update, it needs to persist the instance on to
        // the next vnode so that it can be properly unmounted later.
        (vnode.patchFlag > 0 || shapeFlag & 6 /* COMPONENT */) &&
        // the EVENTS flag is only for hydration and if it is the only flag, the
        // vnode should not be considered dynamic due to handler caching.
        vnode.patchFlag !== 32 /* HYDRATE_EVENTS */) {
        currentBlock.push(vnode);
    }
    return vnode;
}
const createVNode = (({}.NODE_ENV !== 'production') ? createVNodeWithArgsTransform : _createVNode);
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
    if (!type || type === NULL_DYNAMIC_COMPONENT) {
        if (({}.NODE_ENV !== 'production') && !type) {
            warn(`Invalid vnode type when creating vnode: ${type}.`);
        }
        type = Comment;
    }
    if (isVNode(type)) {
        // createVNode receiving an existing vnode. This happens in cases like
        // <component :is="vnode"/>
        // #2078 make sure to merge refs during the clone instead of overwriting it
        const cloned = cloneVNode(type, props, true /* mergeRef: true */);
        if (children) {
            normalizeChildren(cloned, children);
        }
        if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
            if (cloned.shapeFlag & 6 /* COMPONENT */) {
                currentBlock[currentBlock.indexOf(type)] = cloned;
            }
            else {
                currentBlock.push(cloned);
            }
        }
        cloned.patchFlag |= -2 /* BAIL */;
        return cloned;
    }
    // class component normalization.
    if (isClassComponent(type)) {
        type = type.__vccOpts;
    }
    // class & style normalization.
    if (props) {
        // for reactive or proxy objects, we need to clone it to enable mutation.
        props = guardReactiveProps(props);
        let { class: klass, style } = props;
        if (klass && !isString$1(klass)) {
            props.class = normalizeClass(klass);
        }
        if (isObject(style)) {
            // reactive state objects need to be cloned since they are likely to be
            // mutated
            if (isProxy(style) && !isArray(style)) {
                style = extend({}, style);
            }
            props.style = normalizeStyle(style);
        }
    }
    // encode the vnode type information into a bitmap
    const shapeFlag = isString$1(type)
        ? 1 /* ELEMENT */
        : isSuspense(type)
            ? 128 /* SUSPENSE */
            : isTeleport(type)
                ? 64 /* TELEPORT */
                : isObject(type)
                    ? 4 /* STATEFUL_COMPONENT */
                    : isFunction(type)
                        ? 2 /* FUNCTIONAL_COMPONENT */
                        : 0;
    if (({}.NODE_ENV !== 'production') && shapeFlag & 4 /* STATEFUL_COMPONENT */ && isProxy(type)) {
        type = toRaw(type);
        warn(`Vue received a Component which was made a reactive object. This can ` +
            `lead to unnecessary performance overhead, and should be avoided by ` +
            `marking the component with \`markRaw\` or using \`shallowRef\` ` +
            `instead of \`ref\`.`, `\nComponent that was made reactive: `, type);
    }
    return createBaseVNode(type, props, children, patchFlag, dynamicProps, shapeFlag, isBlockNode, true);
}
function guardReactiveProps(props) {
    if (!props)
        return null;
    return isProxy(props) || InternalObjectKey in props
        ? extend({}, props)
        : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false) {
    // This is intentionally NOT using spread or extend to avoid the runtime
    // key enumeration cost.
    const { props, ref, patchFlag, children } = vnode;
    const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
    const cloned = {
        __v_isVNode: true,
        __v_skip: true,
        type: vnode.type,
        props: mergedProps,
        key: mergedProps && normalizeKey(mergedProps),
        ref: extraProps && extraProps.ref
            ? // #2078 in the case of <component :is="vnode" ref="extra"/>
                // if the vnode itself already has a ref, cloneVNode will need to merge
                // the refs so the single vnode can be set on multiple refs
                mergeRef && ref
                    ? isArray(ref)
                        ? ref.concat(normalizeRef(extraProps))
                        : [ref, normalizeRef(extraProps)]
                    : normalizeRef(extraProps)
            : ref,
        scopeId: vnode.scopeId,
        slotScopeIds: vnode.slotScopeIds,
        children: ({}.NODE_ENV !== 'production') && patchFlag === -1 /* HOISTED */ && isArray(children)
            ? children.map(deepCloneVNode)
            : children,
        target: vnode.target,
        targetAnchor: vnode.targetAnchor,
        staticCount: vnode.staticCount,
        shapeFlag: vnode.shapeFlag,
        // if the vnode is cloned with extra props, we can no longer assume its
        // existing patch flag to be reliable and need to add the FULL_PROPS flag.
        // note: preserve flag for fragments since they use the flag for children
        // fast paths only.
        patchFlag: extraProps && vnode.type !== Fragment
            ? patchFlag === -1 // hoisted node
                ? 16 /* FULL_PROPS */
                : patchFlag | 16 /* FULL_PROPS */
            : patchFlag,
        dynamicProps: vnode.dynamicProps,
        dynamicChildren: vnode.dynamicChildren,
        appContext: vnode.appContext,
        dirs: vnode.dirs,
        transition: vnode.transition,
        // These should technically only be non-null on mounted VNodes. However,
        // they *should* be copied for kept-alive vnodes. So we just always copy
        // them since them being non-null during a mount doesn't affect the logic as
        // they will simply be overwritten.
        component: vnode.component,
        suspense: vnode.suspense,
        ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
        ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
        el: vnode.el,
        anchor: vnode.anchor
    };
    return cloned;
}
/**
 * Dev only, for HMR of hoisted vnodes reused in v-for
 * https://github.com/vitejs/vite/issues/2022
 */
function deepCloneVNode(vnode) {
    const cloned = cloneVNode(vnode);
    if (isArray(vnode.children)) {
        cloned.children = vnode.children.map(deepCloneVNode);
    }
    return cloned;
}
/**
 * @private
 */
function createTextVNode(text = ' ', flag = 0) {
    return createVNode(Text, null, text, flag);
}
/**
 * @private
 */
function createStaticVNode(content, numberOfNodes) {
    // A static vnode can contain multiple stringified elements, and the number
    // of elements is necessary for hydration.
    const vnode = createVNode(Static, null, content);
    vnode.staticCount = numberOfNodes;
    return vnode;
}
/**
 * @private
 */
function createCommentVNode(text = '', 
// when used as the v-else branch, the comment node must be created as a
// block to ensure correct updates.
asBlock = false) {
    return asBlock
        ? (openBlock(), createBlock(Comment, null, text))
        : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
    if (child == null || typeof child === 'boolean') {
        // empty placeholder
        return createVNode(Comment);
    }
    else if (isArray(child)) {
        // fragment
        return createVNode(Fragment, null, 
        // #3666, avoid reference pollution when reusing vnode
        child.slice());
    }
    else if (typeof child === 'object') {
        // already vnode, this should be the most common since compiled templates
        // always produce all-vnode children arrays
        return cloneIfMounted(child);
    }
    else {
        // strings and numbers
        return createVNode(Text, null, String(child));
    }
}
// optimized normalization for template-compiled render fns
function cloneIfMounted(child) {
    return child.el === null || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
    let type = 0;
    const { shapeFlag } = vnode;
    if (children == null) {
        children = null;
    }
    else if (isArray(children)) {
        type = 16 /* ARRAY_CHILDREN */;
    }
    else if (typeof children === 'object') {
        if (shapeFlag & (1 /* ELEMENT */ | 64 /* TELEPORT */)) {
            // Normalize slot to plain children for plain element and Teleport
            const slot = children.default;
            if (slot) {
                // _c marker is added by withCtx() indicating this is a compiled slot
                slot._c && (slot._d = false);
                normalizeChildren(vnode, slot());
                slot._c && (slot._d = true);
            }
            return;
        }
        else {
            type = 32 /* SLOTS_CHILDREN */;
            const slotFlag = children._;
            if (!slotFlag && !(InternalObjectKey in children)) {
                children._ctx = currentRenderingInstance;
            }
            else if (slotFlag === 3 /* FORWARDED */ && currentRenderingInstance) {
                // a child component receives forwarded slots from the parent.
                // its slot type is determined by its parent's slot type.
                if (currentRenderingInstance.slots._ === 1 /* STABLE */) {
                    children._ = 1 /* STABLE */;
                }
                else {
                    children._ = 2 /* DYNAMIC */;
                    vnode.patchFlag |= 1024 /* DYNAMIC_SLOTS */;
                }
            }
        }
    }
    else if (isFunction(children)) {
        children = { default: children, _ctx: currentRenderingInstance };
        type = 32 /* SLOTS_CHILDREN */;
    }
    else {
        children = String(children);
        // force teleport children to array so it can be moved around
        if (shapeFlag & 64 /* TELEPORT */) {
            type = 16 /* ARRAY_CHILDREN */;
            children = [createTextVNode(children)];
        }
        else {
            type = 8 /* TEXT_CHILDREN */;
        }
    }
    vnode.children = children;
    vnode.shapeFlag |= type;
}
function mergeProps(...args) {
    const ret = {};
    for (let i = 0; i < args.length; i++) {
        const toMerge = args[i];
        for (const key in toMerge) {
            if (key === 'class') {
                if (ret.class !== toMerge.class) {
                    ret.class = normalizeClass([ret.class, toMerge.class]);
                }
            }
            else if (key === 'style') {
                ret.style = normalizeStyle([ret.style, toMerge.style]);
            }
            else if (isOn(key)) {
                const existing = ret[key];
                const incoming = toMerge[key];
                if (incoming &&
                    existing !== incoming &&
                    !(isArray(existing) && existing.includes(incoming))) {
                    ret[key] = existing
                        ? [].concat(existing, incoming)
                        : incoming;
                }
            }
            else if (key !== '') {
                ret[key] = toMerge[key];
            }
        }
    }
    return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
    callWithAsyncErrorHandling(hook, instance, 7 /* VNODE_HOOK */, [
        vnode,
        prevVNode
    ]);
}

const emptyAppContext = createAppContext();
let uid$1 = 0;
function createComponentInstance(vnode, parent, suspense) {
    const type = vnode.type;
    // inherit parent app context - or - if root, adopt from root vnode
    const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
    const instance = {
        uid: uid$1++,
        vnode,
        type,
        parent,
        appContext,
        root: null,
        next: null,
        subTree: null,
        effect: null,
        update: null,
        scope: new EffectScope(true /* detached */),
        render: null,
        proxy: null,
        exposed: null,
        exposeProxy: null,
        withProxy: null,
        provides: parent ? parent.provides : Object.create(appContext.provides),
        accessCache: null,
        renderCache: [],
        // local resolved assets
        components: null,
        directives: null,
        // resolved props and emits options
        propsOptions: normalizePropsOptions(type, appContext),
        emitsOptions: normalizeEmitsOptions(type, appContext),
        // emit
        emit: null,
        emitted: null,
        // props default value
        propsDefaults: EMPTY_OBJ,
        // inheritAttrs
        inheritAttrs: type.inheritAttrs,
        // state
        ctx: EMPTY_OBJ,
        data: EMPTY_OBJ,
        props: EMPTY_OBJ,
        attrs: EMPTY_OBJ,
        slots: EMPTY_OBJ,
        refs: EMPTY_OBJ,
        setupState: EMPTY_OBJ,
        setupContext: null,
        // suspense related
        suspense,
        suspenseId: suspense ? suspense.pendingId : 0,
        asyncDep: null,
        asyncResolved: false,
        // lifecycle hooks
        // not using enums here because it results in computed properties
        isMounted: false,
        isUnmounted: false,
        isDeactivated: false,
        bc: null,
        c: null,
        bm: null,
        m: null,
        bu: null,
        u: null,
        um: null,
        bum: null,
        da: null,
        a: null,
        rtg: null,
        rtc: null,
        ec: null,
        sp: null
    };
    if (({}.NODE_ENV !== 'production')) {
        instance.ctx = createDevRenderContext(instance);
    }
    else {
        instance.ctx = { _: instance };
    }
    instance.root = parent ? parent.root : instance;
    instance.emit = emit$1.bind(null, instance);
    // apply custom element special handling
    if (vnode.ce) {
        vnode.ce(instance);
    }
    return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
const setCurrentInstance = (instance) => {
    currentInstance = instance;
    instance.scope.on();
};
const unsetCurrentInstance = () => {
    currentInstance && currentInstance.scope.off();
    currentInstance = null;
};
const isBuiltInTag = /*#__PURE__*/ makeMap('slot,component');
function validateComponentName(name, config) {
    const appIsNativeTag = config.isNativeTag || NO;
    if (isBuiltInTag(name) || appIsNativeTag(name)) {
        warn('Do not use built-in or reserved HTML elements as component id: ' + name);
    }
}
function isStatefulComponent(instance) {
    return instance.vnode.shapeFlag & 4 /* STATEFUL_COMPONENT */;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false) {
    isInSSRComponentSetup = isSSR;
    const { props, children } = instance.vnode;
    const isStateful = isStatefulComponent(instance);
    initProps(instance, props, isStateful, isSSR);
    initSlots(instance, children);
    const setupResult = isStateful
        ? setupStatefulComponent(instance, isSSR)
        : undefined;
    isInSSRComponentSetup = false;
    return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
    var _a;
    const Component = instance.type;
    if (({}.NODE_ENV !== 'production')) {
        if (Component.name) {
            validateComponentName(Component.name, instance.appContext.config);
        }
        if (Component.components) {
            const names = Object.keys(Component.components);
            for (let i = 0; i < names.length; i++) {
                validateComponentName(names[i], instance.appContext.config);
            }
        }
        if (Component.directives) {
            const names = Object.keys(Component.directives);
            for (let i = 0; i < names.length; i++) {
                validateDirectiveName(names[i]);
            }
        }
        if (Component.compilerOptions && isRuntimeOnly()) {
            warn(`"compilerOptions" is only supported when using a build of Vue that ` +
                `includes the runtime compiler. Since you are using a runtime-only ` +
                `build, the options should be passed via your build tool config instead.`);
        }
    }
    // 0. create render proxy property access cache
    instance.accessCache = Object.create(null);
    // 1. create public instance / render proxy
    // also mark it raw so it's never observed
    instance.proxy = markRaw(new Proxy(instance.ctx, PublicInstanceProxyHandlers));
    if (({}.NODE_ENV !== 'production')) {
        exposePropsOnRenderContext(instance);
    }
    // 2. call setup()
    const { setup } = Component;
    if (setup) {
        const setupContext = (instance.setupContext =
            setup.length > 1 ? createSetupContext(instance) : null);
        setCurrentInstance(instance);
        pauseTracking();
        const setupResult = callWithErrorHandling(setup, instance, 0 /* SETUP_FUNCTION */, [({}.NODE_ENV !== 'production') ? shallowReadonly(instance.props) : instance.props, setupContext]);
        resetTracking();
        unsetCurrentInstance();
        if (isPromise(setupResult)) {
            setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
            if (isSSR) {
                // return the promise so server-renderer can wait on it
                return setupResult
                    .then((resolvedResult) => {
                    handleSetupResult(instance, resolvedResult, isSSR);
                })
                    .catch(e => {
                    handleError(e, instance, 0 /* SETUP_FUNCTION */);
                });
            }
            else {
                // async setup returned Promise.
                // bail here and wait for re-entry.
                instance.asyncDep = setupResult;
                if (({}.NODE_ENV !== 'production') && !instance.suspense) {
                    const name = (_a = Component.name) !== null && _a !== void 0 ? _a : 'Anonymous';
                    warn(`Component <${name}>: setup function returned a promise, but no ` +
                        `<Suspense> boundary was found in the parent component tree. ` +
                        `A component with async setup() must be nested in a <Suspense> ` +
                        `in order to be rendered.`);
                }
            }
        }
        else {
            handleSetupResult(instance, setupResult, isSSR);
        }
    }
    else {
        finishComponentSetup(instance, isSSR);
    }
}
function handleSetupResult(instance, setupResult, isSSR) {
    if (isFunction(setupResult)) {
        // setup returned an inline render function
        if (instance.type.__ssrInlineRender) {
            // when the function's name is `ssrRender` (compiled by SFC inline mode),
            // set it as ssrRender instead.
            instance.ssrRender = setupResult;
        }
        else {
            instance.render = setupResult;
        }
    }
    else if (isObject(setupResult)) {
        if (({}.NODE_ENV !== 'production') && isVNode(setupResult)) {
            warn(`setup() should not return VNodes directly - ` +
                `return a render function instead.`);
        }
        // setup returned bindings.
        // assuming a render function compiled from template is present.
        if (({}.NODE_ENV !== 'production') || false) {
            instance.devtoolsRawSetupState = setupResult;
        }
        instance.setupState = proxyRefs(setupResult);
        if (({}.NODE_ENV !== 'production')) {
            exposeSetupStateOnRenderContext(instance);
        }
    }
    else if (({}.NODE_ENV !== 'production') && setupResult !== undefined) {
        warn(`setup() should return an object. Received: ${setupResult === null ? 'null' : typeof setupResult}`);
    }
    finishComponentSetup(instance, isSSR);
}
let compile;
// dev only
const isRuntimeOnly = () => !compile;
function finishComponentSetup(instance, isSSR, skipOptions) {
    const Component = instance.type;
    // template / render function normalization
    // could be already set when returned from setup()
    if (!instance.render) {
        // only do on-the-fly compile if not in SSR - SSR on-the-fly compilation
        // is done by server-renderer
        if (!isSSR && compile && !Component.render) {
            const template = Component.template;
            if (template) {
                if (({}.NODE_ENV !== 'production')) {
                    startMeasure(instance, `compile`);
                }
                const { isCustomElement, compilerOptions } = instance.appContext.config;
                const { delimiters, compilerOptions: componentCompilerOptions } = Component;
                const finalCompilerOptions = extend(extend({
                    isCustomElement,
                    delimiters
                }, compilerOptions), componentCompilerOptions);
                Component.render = compile(template, finalCompilerOptions);
                if (({}.NODE_ENV !== 'production')) {
                    endMeasure(instance, `compile`);
                }
            }
        }
        instance.render = (Component.render || NOOP);
    }
    // support for 2.x options
    {
        setCurrentInstance(instance);
        pauseTracking();
        applyOptions(instance);
        resetTracking();
        unsetCurrentInstance();
    }
    // warn missing template/render
    // the runtime compilation of template in SSR is done by server-render
    if (({}.NODE_ENV !== 'production') && !Component.render && instance.render === NOOP && !isSSR) {
        /* istanbul ignore if */
        if (Component.template) {
            warn(`Component provided template option but ` +
                `runtime compilation is not supported in this build of Vue.` +
                (` Configure your bundler to alias "vue" to "vue/dist/vue.esm-bundler.js".`
                    ) /* should not happen */);
        }
        else {
            warn(`Component is missing template or render function.`);
        }
    }
}
function createAttrsProxy(instance) {
    return new Proxy(instance.attrs, ({}.NODE_ENV !== 'production')
        ? {
            get(target, key) {
                markAttrsAccessed();
                track(instance, "get" /* GET */, '$attrs');
                return target[key];
            },
            set() {
                warn(`setupContext.attrs is readonly.`);
                return false;
            },
            deleteProperty() {
                warn(`setupContext.attrs is readonly.`);
                return false;
            }
        }
        : {
            get(target, key) {
                track(instance, "get" /* GET */, '$attrs');
                return target[key];
            }
        });
}
function createSetupContext(instance) {
    const expose = exposed => {
        if (({}.NODE_ENV !== 'production') && instance.exposed) {
            warn(`expose() should be called only once per setup().`);
        }
        instance.exposed = exposed || {};
    };
    let attrs;
    if (({}.NODE_ENV !== 'production')) {
        // We use getters in dev in case libs like test-utils overwrite instance
        // properties (overwrites should not be done in prod)
        return Object.freeze({
            get attrs() {
                return attrs || (attrs = createAttrsProxy(instance));
            },
            get slots() {
                return shallowReadonly(instance.slots);
            },
            get emit() {
                return (event, ...args) => instance.emit(event, ...args);
            },
            expose
        });
    }
    else {
        return {
            get attrs() {
                return attrs || (attrs = createAttrsProxy(instance));
            },
            slots: instance.slots,
            emit: instance.emit,
            expose
        };
    }
}
function getExposeProxy(instance) {
    if (instance.exposed) {
        return (instance.exposeProxy ||
            (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
                get(target, key) {
                    if (key in target) {
                        return target[key];
                    }
                    else if (key in publicPropertiesMap) {
                        return publicPropertiesMap[key](instance);
                    }
                }
            })));
    }
}
const classifyRE = /(?:^|[-_])(\w)/g;
const classify = (str) => str.replace(classifyRE, c => c.toUpperCase()).replace(/[-_]/g, '');
function getComponentName(Component, includeInferred = true) {
    return isFunction(Component)
        ? Component.displayName || Component.name
        : Component.name || (includeInferred && Component.__name);
}
/* istanbul ignore next */
function formatComponentName(instance, Component, isRoot = false) {
    let name = getComponentName(Component);
    if (!name && Component.__file) {
        const match = Component.__file.match(/([^/\\]+)\.\w+$/);
        if (match) {
            name = match[1];
        }
    }
    if (!name && instance && instance.parent) {
        // try to infer the name based on reverse resolution
        const inferFromRegistry = (registry) => {
            for (const key in registry) {
                if (registry[key] === Component) {
                    return key;
                }
            }
        };
        name =
            inferFromRegistry(instance.components ||
                instance.parent.type.components) || inferFromRegistry(instance.appContext.components);
    }
    return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
    return isFunction(value) && '__vccOpts' in value;
}

const computed = ((getterOrOptions, debugOptions) => {
    // @ts-ignore
    return computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
});

// Actual implementation
function h$1(type, propsOrChildren, children) {
    const l = arguments.length;
    if (l === 2) {
        if (isObject(propsOrChildren) && !isArray(propsOrChildren)) {
            // single vnode without props
            if (isVNode(propsOrChildren)) {
                return createVNode(type, null, [propsOrChildren]);
            }
            // props without children
            return createVNode(type, propsOrChildren);
        }
        else {
            // omit props
            return createVNode(type, null, propsOrChildren);
        }
    }
    else {
        if (l > 3) {
            children = Array.prototype.slice.call(arguments, 2);
        }
        else if (l === 3 && isVNode(children)) {
            children = [children];
        }
        return createVNode(type, propsOrChildren, children);
    }
}

function isShallow(value) {
    return !!(value && value["__v_isShallow" /* IS_SHALLOW */]);
}

function initCustomFormatter() {
    /* eslint-disable no-restricted-globals */
    if (!({}.NODE_ENV !== 'production') || typeof window === 'undefined') {
        return;
    }
    const vueStyle = { style: 'color:#3ba776' };
    const numberStyle = { style: 'color:#0b1bc9' };
    const stringStyle = { style: 'color:#b62e24' };
    const keywordStyle = { style: 'color:#9d288c' };
    // custom formatter for Chrome
    // https://www.mattzeunert.com/2016/02/19/custom-chrome-devtools-object-formatters.html
    const formatter = {
        header(obj) {
            // TODO also format ComponentPublicInstance & ctx.slots/attrs in setup
            if (!isObject(obj)) {
                return null;
            }
            if (obj.__isVue) {
                return ['div', vueStyle, `VueInstance`];
            }
            else if (isRef(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, genRefFlag(obj)],
                    '<',
                    formatValue(obj.value),
                    `>`
                ];
            }
            else if (isReactive(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, isShallow(obj) ? 'ShallowReactive' : 'Reactive'],
                    '<',
                    formatValue(obj),
                    `>${isReadonly(obj) ? ` (readonly)` : ``}`
                ];
            }
            else if (isReadonly(obj)) {
                return [
                    'div',
                    {},
                    ['span', vueStyle, isShallow(obj) ? 'ShallowReadonly' : 'Readonly'],
                    '<',
                    formatValue(obj),
                    '>'
                ];
            }
            return null;
        },
        hasBody(obj) {
            return obj && obj.__isVue;
        },
        body(obj) {
            if (obj && obj.__isVue) {
                return [
                    'div',
                    {},
                    ...formatInstance(obj.$)
                ];
            }
        }
    };
    function formatInstance(instance) {
        const blocks = [];
        if (instance.type.props && instance.props) {
            blocks.push(createInstanceBlock('props', toRaw(instance.props)));
        }
        if (instance.setupState !== EMPTY_OBJ) {
            blocks.push(createInstanceBlock('setup', instance.setupState));
        }
        if (instance.data !== EMPTY_OBJ) {
            blocks.push(createInstanceBlock('data', toRaw(instance.data)));
        }
        const computed = extractKeys(instance, 'computed');
        if (computed) {
            blocks.push(createInstanceBlock('computed', computed));
        }
        const injected = extractKeys(instance, 'inject');
        if (injected) {
            blocks.push(createInstanceBlock('injected', injected));
        }
        blocks.push([
            'div',
            {},
            [
                'span',
                {
                    style: keywordStyle.style + ';opacity:0.66'
                },
                '$ (internal): '
            ],
            ['object', { object: instance }]
        ]);
        return blocks;
    }
    function createInstanceBlock(type, target) {
        target = extend({}, target);
        if (!Object.keys(target).length) {
            return ['span', {}];
        }
        return [
            'div',
            { style: 'line-height:1.25em;margin-bottom:0.6em' },
            [
                'div',
                {
                    style: 'color:#476582'
                },
                type
            ],
            [
                'div',
                {
                    style: 'padding-left:1.25em'
                },
                ...Object.keys(target).map(key => {
                    return [
                        'div',
                        {},
                        ['span', keywordStyle, key + ': '],
                        formatValue(target[key], false)
                    ];
                })
            ]
        ];
    }
    function formatValue(v, asRaw = true) {
        if (typeof v === 'number') {
            return ['span', numberStyle, v];
        }
        else if (typeof v === 'string') {
            return ['span', stringStyle, JSON.stringify(v)];
        }
        else if (typeof v === 'boolean') {
            return ['span', keywordStyle, v];
        }
        else if (isObject(v)) {
            return ['object', { object: asRaw ? toRaw(v) : v }];
        }
        else {
            return ['span', stringStyle, String(v)];
        }
    }
    function extractKeys(instance, type) {
        const Comp = instance.type;
        if (isFunction(Comp)) {
            return;
        }
        const extracted = {};
        for (const key in instance.ctx) {
            if (isKeyOfType(Comp, key, type)) {
                extracted[key] = instance.ctx[key];
            }
        }
        return extracted;
    }
    function isKeyOfType(Comp, key, type) {
        const opts = Comp[type];
        if ((isArray(opts) && opts.includes(key)) ||
            (isObject(opts) && key in opts)) {
            return true;
        }
        if (Comp.extends && isKeyOfType(Comp.extends, key, type)) {
            return true;
        }
        if (Comp.mixins && Comp.mixins.some(m => isKeyOfType(m, key, type))) {
            return true;
        }
    }
    function genRefFlag(v) {
        if (isShallow(v)) {
            return `ShallowRef`;
        }
        if (v.effect) {
            return `ComputedRef`;
        }
        return `Ref`;
    }
    if (window.devtoolsFormatters) {
        window.devtoolsFormatters.push(formatter);
    }
    else {
        window.devtoolsFormatters = [formatter];
    }
}

// Core API ------------------------------------------------------------------
const version = "3.2.37";

const svgNS = 'http://www.w3.org/2000/svg';
const doc = (typeof document !== 'undefined' ? document : null);
const templateContainer = doc && /*#__PURE__*/ doc.createElement('template');
const nodeOps = {
    insert: (child, parent, anchor) => {
        parent.insertBefore(child, anchor || null);
    },
    remove: child => {
        const parent = child.parentNode;
        if (parent) {
            parent.removeChild(child);
        }
    },
    createElement: (tag, isSVG, is, props) => {
        const el = isSVG
            ? doc.createElementNS(svgNS, tag)
            : doc.createElement(tag, is ? { is } : undefined);
        if (tag === 'select' && props && props.multiple != null) {
            el.setAttribute('multiple', props.multiple);
        }
        return el;
    },
    createText: text => doc.createTextNode(text),
    createComment: text => doc.createComment(text),
    setText: (node, text) => {
        node.nodeValue = text;
    },
    setElementText: (el, text) => {
        el.textContent = text;
    },
    parentNode: node => node.parentNode,
    nextSibling: node => node.nextSibling,
    querySelector: selector => doc.querySelector(selector),
    setScopeId(el, id) {
        el.setAttribute(id, '');
    },
    cloneNode(el) {
        const cloned = el.cloneNode(true);
        // #3072
        // - in `patchDOMProp`, we store the actual value in the `el._value` property.
        // - normally, elements using `:value` bindings will not be hoisted, but if
        //   the bound value is a constant, e.g. `:value="true"` - they do get
        //   hoisted.
        // - in production, hoisted nodes are cloned when subsequent inserts, but
        //   cloneNode() does not copy the custom property we attached.
        // - This may need to account for other custom DOM properties we attach to
        //   elements in addition to `_value` in the future.
        if (`_value` in el) {
            cloned._value = el._value;
        }
        return cloned;
    },
    // __UNSAFE__
    // Reason: innerHTML.
    // Static content here can only come from compiled templates.
    // As long as the user only uses trusted templates, this is safe.
    insertStaticContent(content, parent, anchor, isSVG, start, end) {
        // <parent> before | first ... last | anchor </parent>
        const before = anchor ? anchor.previousSibling : parent.lastChild;
        // #5308 can only take cached path if:
        // - has a single root node
        // - nextSibling info is still available
        if (start && (start === end || start.nextSibling)) {
            // cached
            while (true) {
                parent.insertBefore(start.cloneNode(true), anchor);
                if (start === end || !(start = start.nextSibling))
                    break;
            }
        }
        else {
            // fresh insert
            templateContainer.innerHTML = isSVG ? `<svg>${content}</svg>` : content;
            const template = templateContainer.content;
            if (isSVG) {
                // remove outer svg wrapper
                const wrapper = template.firstChild;
                while (wrapper.firstChild) {
                    template.appendChild(wrapper.firstChild);
                }
                template.removeChild(wrapper);
            }
            parent.insertBefore(template, anchor);
        }
        return [
            // first
            before ? before.nextSibling : parent.firstChild,
            // last
            anchor ? anchor.previousSibling : parent.lastChild
        ];
    }
};

// compiler should normalize class + :class bindings on the same element
// into a single binding ['staticClass', dynamic]
function patchClass(el, value, isSVG) {
    // directly setting className should be faster than setAttribute in theory
    // if this is an element during a transition, take the temporary transition
    // classes into account.
    const transitionClasses = el._vtc;
    if (transitionClasses) {
        value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(' ');
    }
    if (value == null) {
        el.removeAttribute('class');
    }
    else if (isSVG) {
        el.setAttribute('class', value);
    }
    else {
        el.className = value;
    }
}

function patchStyle(el, prev, next) {
    const style = el.style;
    const isCssString = isString$1(next);
    if (next && !isCssString) {
        for (const key in next) {
            setStyle(style, key, next[key]);
        }
        if (prev && !isString$1(prev)) {
            for (const key in prev) {
                if (next[key] == null) {
                    setStyle(style, key, '');
                }
            }
        }
    }
    else {
        const currentDisplay = style.display;
        if (isCssString) {
            if (prev !== next) {
                style.cssText = next;
            }
        }
        else if (prev) {
            el.removeAttribute('style');
        }
        // indicates that the `display` of the element is controlled by `v-show`,
        // so we always keep the current `display` value regardless of the `style`
        // value, thus handing over control to `v-show`.
        if ('_vod' in el) {
            style.display = currentDisplay;
        }
    }
}
const importantRE = /\s*!important$/;
function setStyle(style, name, val) {
    if (isArray(val)) {
        val.forEach(v => setStyle(style, name, v));
    }
    else {
        if (val == null)
            val = '';
        if (name.startsWith('--')) {
            // custom property definition
            style.setProperty(name, val);
        }
        else {
            const prefixed = autoPrefix(style, name);
            if (importantRE.test(val)) {
                // !important
                style.setProperty(hyphenate(prefixed), val.replace(importantRE, ''), 'important');
            }
            else {
                style[prefixed] = val;
            }
        }
    }
}
const prefixes = ['Webkit', 'Moz', 'ms'];
const prefixCache = {};
function autoPrefix(style, rawName) {
    const cached = prefixCache[rawName];
    if (cached) {
        return cached;
    }
    let name = camelize(rawName);
    if (name !== 'filter' && name in style) {
        return (prefixCache[rawName] = name);
    }
    name = capitalize(name);
    for (let i = 0; i < prefixes.length; i++) {
        const prefixed = prefixes[i] + name;
        if (prefixed in style) {
            return (prefixCache[rawName] = prefixed);
        }
    }
    return rawName;
}

const xlinkNS = 'http://www.w3.org/1999/xlink';
function patchAttr(el, key, value, isSVG, instance) {
    if (isSVG && key.startsWith('xlink:')) {
        if (value == null) {
            el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
        }
        else {
            el.setAttributeNS(xlinkNS, key, value);
        }
    }
    else {
        // note we are only checking boolean attributes that don't have a
        // corresponding dom prop of the same name here.
        const isBoolean = isSpecialBooleanAttr(key);
        if (value == null || (isBoolean && !includeBooleanAttr(value))) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, isBoolean ? '' : value);
        }
    }
}

// __UNSAFE__
// functions. The user is responsible for using them with only trusted content.
function patchDOMProp(el, key, value, 
// the following args are passed only due to potential innerHTML/textContent
// overriding existing VNodes, in which case the old tree must be properly
// unmounted.
prevChildren, parentComponent, parentSuspense, unmountChildren) {
    if (key === 'innerHTML' || key === 'textContent') {
        if (prevChildren) {
            unmountChildren(prevChildren, parentComponent, parentSuspense);
        }
        el[key] = value == null ? '' : value;
        return;
    }
    if (key === 'value' &&
        el.tagName !== 'PROGRESS' &&
        // custom elements may use _value internally
        !el.tagName.includes('-')) {
        // store value as _value as well since
        // non-string values will be stringified.
        el._value = value;
        const newValue = value == null ? '' : value;
        if (el.value !== newValue ||
            // #4956: always set for OPTION elements because its value falls back to
            // textContent if no value attribute is present. And setting .value for
            // OPTION has no side effect
            el.tagName === 'OPTION') {
            el.value = newValue;
        }
        if (value == null) {
            el.removeAttribute(key);
        }
        return;
    }
    let needRemove = false;
    if (value === '' || value == null) {
        const type = typeof el[key];
        if (type === 'boolean') {
            // e.g. <select multiple> compiles to { multiple: '' }
            value = includeBooleanAttr(value);
        }
        else if (value == null && type === 'string') {
            // e.g. <div :id="null">
            value = '';
            needRemove = true;
        }
        else if (type === 'number') {
            // e.g. <img :width="null">
            // the value of some IDL attr must be greater than 0, e.g. input.size = 0 -> error
            value = 0;
            needRemove = true;
        }
    }
    // some properties perform value validation and throw,
    // some properties has getter, no setter, will error in 'use strict'
    // eg. <select :type="null"></select> <select :willValidate="null"></select>
    try {
        el[key] = value;
    }
    catch (e) {
        if (({}.NODE_ENV !== 'production')) {
            warn(`Failed setting prop "${key}" on <${el.tagName.toLowerCase()}>: ` +
                `value ${value} is invalid.`, e);
        }
    }
    needRemove && el.removeAttribute(key);
}

// Async edge case fix requires storing an event listener's attach timestamp.
const [_getNow, skipTimestampCheck] = /*#__PURE__*/ (() => {
    let _getNow = Date.now;
    let skipTimestampCheck = false;
    if (typeof window !== 'undefined') {
        // Determine what event timestamp the browser is using. Annoyingly, the
        // timestamp can either be hi-res (relative to page load) or low-res
        // (relative to UNIX epoch), so in order to compare time we have to use the
        // same timestamp type when saving the flush timestamp.
        if (Date.now() > document.createEvent('Event').timeStamp) {
            // if the low-res timestamp which is bigger than the event timestamp
            // (which is evaluated AFTER) it means the event is using a hi-res timestamp,
            // and we need to use the hi-res version for event listeners as well.
            _getNow = performance.now.bind(performance);
        }
        // #3485: Firefox <= 53 has incorrect Event.timeStamp implementation
        // and does not fire microtasks in between event propagation, so safe to exclude.
        const ffMatch = navigator.userAgent.match(/firefox\/(\d+)/i);
        skipTimestampCheck = !!(ffMatch && Number(ffMatch[1]) <= 53);
    }
    return [_getNow, skipTimestampCheck];
})();
// To avoid the overhead of repeatedly calling performance.now(), we cache
// and use the same timestamp for all event listeners attached in the same tick.
let cachedNow = 0;
const p$1 = /*#__PURE__*/ Promise.resolve();
const reset = () => {
    cachedNow = 0;
};
const getNow = () => cachedNow || (p$1.then(reset), (cachedNow = _getNow()));
function addEventListener$1(el, event, handler, options) {
    el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
    el.removeEventListener(event, handler, options);
}
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
    // vei = vue event invokers
    const invokers = el._vei || (el._vei = {});
    const existingInvoker = invokers[rawName];
    if (nextValue && existingInvoker) {
        // patch
        existingInvoker.value = nextValue;
    }
    else {
        const [name, options] = parseName(rawName);
        if (nextValue) {
            // add
            const invoker = (invokers[rawName] = createInvoker(nextValue, instance));
            addEventListener$1(el, name, invoker, options);
        }
        else if (existingInvoker) {
            // remove
            removeEventListener(el, name, existingInvoker, options);
            invokers[rawName] = undefined;
        }
    }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
    let options;
    if (optionsModifierRE.test(name)) {
        options = {};
        let m;
        while ((m = name.match(optionsModifierRE))) {
            name = name.slice(0, name.length - m[0].length);
            options[m[0].toLowerCase()] = true;
        }
    }
    return [hyphenate(name.slice(2)), options];
}
function createInvoker(initialValue, instance) {
    const invoker = (e) => {
        // async edge case #6566: inner click event triggers patch, event handler
        // attached to outer element during patch, and triggered again. This
        // happens because browsers fire microtask ticks between event propagation.
        // the solution is simple: we save the timestamp when a handler is attached,
        // and the handler would only fire if the event passed to it was fired
        // AFTER it was attached.
        const timeStamp = e.timeStamp || _getNow();
        if (skipTimestampCheck || timeStamp >= invoker.attached - 1) {
            callWithAsyncErrorHandling(patchStopImmediatePropagation(e, invoker.value), instance, 5 /* NATIVE_EVENT_HANDLER */, [e]);
        }
    };
    invoker.value = initialValue;
    invoker.attached = getNow();
    return invoker;
}
function patchStopImmediatePropagation(e, value) {
    if (isArray(value)) {
        const originalStop = e.stopImmediatePropagation;
        e.stopImmediatePropagation = () => {
            originalStop.call(e);
            e._stopped = true;
        };
        return value.map(fn => (e) => !e._stopped && fn && fn(e));
    }
    else {
        return value;
    }
}

const nativeOnRE = /^on[a-z]/;
const patchProp = (el, key, prevValue, nextValue, isSVG = false, prevChildren, parentComponent, parentSuspense, unmountChildren) => {
    if (key === 'class') {
        patchClass(el, nextValue, isSVG);
    }
    else if (key === 'style') {
        patchStyle(el, prevValue, nextValue);
    }
    else if (isOn(key)) {
        // ignore v-model listeners
        if (!isModelListener(key)) {
            patchEvent(el, key, prevValue, nextValue, parentComponent);
        }
    }
    else if (key[0] === '.'
        ? ((key = key.slice(1)), true)
        : key[0] === '^'
            ? ((key = key.slice(1)), false)
            : shouldSetAsProp(el, key, nextValue, isSVG)) {
        patchDOMProp(el, key, nextValue, prevChildren, parentComponent, parentSuspense, unmountChildren);
    }
    else {
        // special case for <input v-model type="checkbox"> with
        // :true-value & :false-value
        // store value as dom properties since non-string values will be
        // stringified.
        if (key === 'true-value') {
            el._trueValue = nextValue;
        }
        else if (key === 'false-value') {
            el._falseValue = nextValue;
        }
        patchAttr(el, key, nextValue, isSVG);
    }
};
function shouldSetAsProp(el, key, value, isSVG) {
    if (isSVG) {
        // most keys must be set as attribute on svg elements to work
        // ...except innerHTML & textContent
        if (key === 'innerHTML' || key === 'textContent') {
            return true;
        }
        // or native onclick with function values
        if (key in el && nativeOnRE.test(key) && isFunction(value)) {
            return true;
        }
        return false;
    }
    // these are enumerated attrs, however their corresponding DOM properties
    // are actually booleans - this leads to setting it with a string "false"
    // value leading it to be coerced to `true`, so we need to always treat
    // them as attributes.
    // Note that `contentEditable` doesn't have this problem: its DOM
    // property is also enumerated string values.
    if (key === 'spellcheck' || key === 'draggable' || key === 'translate') {
        return false;
    }
    // #1787, #2840 form property on form elements is readonly and must be set as
    // attribute.
    if (key === 'form') {
        return false;
    }
    // #1526 <input list> must be set as attribute
    if (key === 'list' && el.tagName === 'INPUT') {
        return false;
    }
    // #2766 <textarea type> must be set as attribute
    if (key === 'type' && el.tagName === 'TEXTAREA') {
        return false;
    }
    // native onclick with string value, must be set as attribute
    if (nativeOnRE.test(key) && isString$1(value)) {
        return false;
    }
    return key in el;
}

function defineCustomElement(options, hydrate) {
    const Comp = defineComponent(options);
    class VueCustomElement extends VueElement {
        constructor(initialProps) {
            super(Comp, initialProps, hydrate);
        }
    }
    VueCustomElement.def = Comp;
    return VueCustomElement;
}
const BaseClass = (typeof HTMLElement !== 'undefined' ? HTMLElement : class {
});
class VueElement extends BaseClass {
    constructor(_def, _props = {}, hydrate) {
        super();
        this._def = _def;
        this._props = _props;
        /**
         * @internal
         */
        this._instance = null;
        this._connected = false;
        this._resolved = false;
        this._numberProps = null;
        if (this.shadowRoot && hydrate) {
            hydrate(this._createVNode(), this.shadowRoot);
        }
        else {
            if (({}.NODE_ENV !== 'production') && this.shadowRoot) {
                warn(`Custom element has pre-rendered declarative shadow root but is not ` +
                    `defined as hydratable. Use \`defineSSRCustomElement\`.`);
            }
            this.attachShadow({ mode: 'open' });
        }
    }
    connectedCallback() {
        this._connected = true;
        if (!this._instance) {
            this._resolveDef();
        }
    }
    disconnectedCallback() {
        this._connected = false;
        nextTick(() => {
            if (!this._connected) {
                render(null, this.shadowRoot);
                this._instance = null;
            }
        });
    }
    /**
     * resolve inner component definition (handle possible async component)
     */
    _resolveDef() {
        if (this._resolved) {
            return;
        }
        this._resolved = true;
        // set initial attrs
        for (let i = 0; i < this.attributes.length; i++) {
            this._setAttr(this.attributes[i].name);
        }
        // watch future attr changes
        new MutationObserver(mutations => {
            for (const m of mutations) {
                this._setAttr(m.attributeName);
            }
        }).observe(this, { attributes: true });
        const resolve = (def) => {
            const { props, styles } = def;
            const hasOptions = !isArray(props);
            const rawKeys = props ? (hasOptions ? Object.keys(props) : props) : [];
            // cast Number-type props set before resolve
            let numberProps;
            if (hasOptions) {
                for (const key in this._props) {
                    const opt = props[key];
                    if (opt === Number || (opt && opt.type === Number)) {
                        this._props[key] = toNumber(this._props[key]);
                        (numberProps || (numberProps = Object.create(null)))[key] = true;
                    }
                }
            }
            this._numberProps = numberProps;
            // check if there are props set pre-upgrade or connect
            for (const key of Object.keys(this)) {
                if (key[0] !== '_') {
                    this._setProp(key, this[key], true, false);
                }
            }
            // defining getter/setters on prototype
            for (const key of rawKeys.map(camelize)) {
                Object.defineProperty(this, key, {
                    get() {
                        return this._getProp(key);
                    },
                    set(val) {
                        this._setProp(key, val);
                    }
                });
            }
            // apply CSS
            this._applyStyles(styles);
            // initial render
            this._update();
        };
        const asyncDef = this._def.__asyncLoader;
        if (asyncDef) {
            asyncDef().then(resolve);
        }
        else {
            resolve(this._def);
        }
    }
    _setAttr(key) {
        let value = this.getAttribute(key);
        if (this._numberProps && this._numberProps[key]) {
            value = toNumber(value);
        }
        this._setProp(camelize(key), value, false);
    }
    /**
     * @internal
     */
    _getProp(key) {
        return this._props[key];
    }
    /**
     * @internal
     */
    _setProp(key, val, shouldReflect = true, shouldUpdate = true) {
        if (val !== this._props[key]) {
            this._props[key] = val;
            if (shouldUpdate && this._instance) {
                this._update();
            }
            // reflect
            if (shouldReflect) {
                if (val === true) {
                    this.setAttribute(hyphenate(key), '');
                }
                else if (typeof val === 'string' || typeof val === 'number') {
                    this.setAttribute(hyphenate(key), val + '');
                }
                else if (!val) {
                    this.removeAttribute(hyphenate(key));
                }
            }
        }
    }
    _update() {
        render(this._createVNode(), this.shadowRoot);
    }
    _createVNode() {
        const vnode = createVNode(this._def, extend({}, this._props));
        if (!this._instance) {
            vnode.ce = instance => {
                this._instance = instance;
                instance.isCE = true;
                // HMR
                if (({}.NODE_ENV !== 'production')) {
                    instance.ceReload = newStyles => {
                        // always reset styles
                        if (this._styles) {
                            this._styles.forEach(s => this.shadowRoot.removeChild(s));
                            this._styles.length = 0;
                        }
                        this._applyStyles(newStyles);
                        // if this is an async component, ceReload is called from the inner
                        // component so no need to reload the async wrapper
                        if (!this._def.__asyncLoader) {
                            // reload
                            this._instance = null;
                            this._update();
                        }
                    };
                }
                // intercept emit
                instance.emit = (event, ...args) => {
                    this.dispatchEvent(new CustomEvent(event, {
                        detail: args
                    }));
                };
                // locate nearest Vue custom element parent for provide/inject
                let parent = this;
                while ((parent =
                    parent && (parent.parentNode || parent.host))) {
                    if (parent instanceof VueElement) {
                        instance.parent = parent._instance;
                        break;
                    }
                }
            };
        }
        return vnode;
    }
    _applyStyles(styles) {
        if (styles) {
            styles.forEach(css => {
                const s = document.createElement('style');
                s.textContent = css;
                this.shadowRoot.appendChild(s);
                // record for HMR
                if (({}.NODE_ENV !== 'production')) {
                    (this._styles || (this._styles = [])).push(s);
                }
            });
        }
    }
}

const TRANSITION = 'transition';
const ANIMATION = 'animation';
// DOM Transition is a higher-order-component based on the platform-agnostic
// base Transition component, with DOM-specific logic.
const Transition = (props, { slots }) => h$1(BaseTransition, resolveTransitionProps(props), slots);
Transition.displayName = 'Transition';
const DOMTransitionPropsValidators = {
    name: String,
    type: String,
    css: {
        type: Boolean,
        default: true
    },
    duration: [String, Number, Object],
    enterFromClass: String,
    enterActiveClass: String,
    enterToClass: String,
    appearFromClass: String,
    appearActiveClass: String,
    appearToClass: String,
    leaveFromClass: String,
    leaveActiveClass: String,
    leaveToClass: String
};
(Transition.props =
    /*#__PURE__*/ extend({}, BaseTransition.props, DOMTransitionPropsValidators));
/**
 * #3227 Incoming hooks may be merged into arrays when wrapping Transition
 * with custom HOCs.
 */
const callHook = (hook, args = []) => {
    if (isArray(hook)) {
        hook.forEach(h => h(...args));
    }
    else if (hook) {
        hook(...args);
    }
};
/**
 * Check if a hook expects a callback (2nd arg), which means the user
 * intends to explicitly control the end of the transition.
 */
const hasExplicitCallback = (hook) => {
    return hook
        ? isArray(hook)
            ? hook.some(h => h.length > 1)
            : hook.length > 1
        : false;
};
function resolveTransitionProps(rawProps) {
    const baseProps = {};
    for (const key in rawProps) {
        if (!(key in DOMTransitionPropsValidators)) {
            baseProps[key] = rawProps[key];
        }
    }
    if (rawProps.css === false) {
        return baseProps;
    }
    const { name = 'v', type, duration, enterFromClass = `${name}-enter-from`, enterActiveClass = `${name}-enter-active`, enterToClass = `${name}-enter-to`, appearFromClass = enterFromClass, appearActiveClass = enterActiveClass, appearToClass = enterToClass, leaveFromClass = `${name}-leave-from`, leaveActiveClass = `${name}-leave-active`, leaveToClass = `${name}-leave-to` } = rawProps;
    const durations = normalizeDuration(duration);
    const enterDuration = durations && durations[0];
    const leaveDuration = durations && durations[1];
    const { onBeforeEnter, onEnter, onEnterCancelled, onLeave, onLeaveCancelled, onBeforeAppear = onBeforeEnter, onAppear = onEnter, onAppearCancelled = onEnterCancelled } = baseProps;
    const finishEnter = (el, isAppear, done) => {
        removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
        removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
        done && done();
    };
    const finishLeave = (el, done) => {
        el._isLeaving = false;
        removeTransitionClass(el, leaveFromClass);
        removeTransitionClass(el, leaveToClass);
        removeTransitionClass(el, leaveActiveClass);
        done && done();
    };
    const makeEnterHook = (isAppear) => {
        return (el, done) => {
            const hook = isAppear ? onAppear : onEnter;
            const resolve = () => finishEnter(el, isAppear, done);
            callHook(hook, [el, resolve]);
            nextFrame(() => {
                removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
                addTransitionClass(el, isAppear ? appearToClass : enterToClass);
                if (!hasExplicitCallback(hook)) {
                    whenTransitionEnds(el, type, enterDuration, resolve);
                }
            });
        };
    };
    return extend(baseProps, {
        onBeforeEnter(el) {
            callHook(onBeforeEnter, [el]);
            addTransitionClass(el, enterFromClass);
            addTransitionClass(el, enterActiveClass);
        },
        onBeforeAppear(el) {
            callHook(onBeforeAppear, [el]);
            addTransitionClass(el, appearFromClass);
            addTransitionClass(el, appearActiveClass);
        },
        onEnter: makeEnterHook(false),
        onAppear: makeEnterHook(true),
        onLeave(el, done) {
            el._isLeaving = true;
            const resolve = () => finishLeave(el, done);
            addTransitionClass(el, leaveFromClass);
            // force reflow so *-leave-from classes immediately take effect (#2593)
            forceReflow();
            addTransitionClass(el, leaveActiveClass);
            nextFrame(() => {
                if (!el._isLeaving) {
                    // cancelled
                    return;
                }
                removeTransitionClass(el, leaveFromClass);
                addTransitionClass(el, leaveToClass);
                if (!hasExplicitCallback(onLeave)) {
                    whenTransitionEnds(el, type, leaveDuration, resolve);
                }
            });
            callHook(onLeave, [el, resolve]);
        },
        onEnterCancelled(el) {
            finishEnter(el, false);
            callHook(onEnterCancelled, [el]);
        },
        onAppearCancelled(el) {
            finishEnter(el, true);
            callHook(onAppearCancelled, [el]);
        },
        onLeaveCancelled(el) {
            finishLeave(el);
            callHook(onLeaveCancelled, [el]);
        }
    });
}
function normalizeDuration(duration) {
    if (duration == null) {
        return null;
    }
    else if (isObject(duration)) {
        return [NumberOf(duration.enter), NumberOf(duration.leave)];
    }
    else {
        const n = NumberOf(duration);
        return [n, n];
    }
}
function NumberOf(val) {
    const res = toNumber(val);
    if (({}.NODE_ENV !== 'production'))
        validateDuration(res);
    return res;
}
function validateDuration(val) {
    if (typeof val !== 'number') {
        warn(`<transition> explicit duration is not a valid number - ` +
            `got ${JSON.stringify(val)}.`);
    }
    else if (isNaN(val)) {
        warn(`<transition> explicit duration is NaN - ` +
            'the duration expression might be incorrect.');
    }
}
function addTransitionClass(el, cls) {
    cls.split(/\s+/).forEach(c => c && el.classList.add(c));
    (el._vtc ||
        (el._vtc = new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
    cls.split(/\s+/).forEach(c => c && el.classList.remove(c));
    const { _vtc } = el;
    if (_vtc) {
        _vtc.delete(cls);
        if (!_vtc.size) {
            el._vtc = undefined;
        }
    }
}
function nextFrame(cb) {
    requestAnimationFrame(() => {
        requestAnimationFrame(cb);
    });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve) {
    const id = (el._endId = ++endId);
    const resolveIfNotStale = () => {
        if (id === el._endId) {
            resolve();
        }
    };
    if (explicitTimeout) {
        return setTimeout(resolveIfNotStale, explicitTimeout);
    }
    const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
    if (!type) {
        return resolve();
    }
    const endEvent = type + 'end';
    let ended = 0;
    const end = () => {
        el.removeEventListener(endEvent, onEnd);
        resolveIfNotStale();
    };
    const onEnd = (e) => {
        if (e.target === el && ++ended >= propCount) {
            end();
        }
    };
    setTimeout(() => {
        if (ended < propCount) {
            end();
        }
    }, timeout + 1);
    el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
    const styles = window.getComputedStyle(el);
    // JSDOM may return undefined for transition properties
    const getStyleProperties = (key) => (styles[key] || '').split(', ');
    const transitionDelays = getStyleProperties(TRANSITION + 'Delay');
    const transitionDurations = getStyleProperties(TRANSITION + 'Duration');
    const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
    const animationDelays = getStyleProperties(ANIMATION + 'Delay');
    const animationDurations = getStyleProperties(ANIMATION + 'Duration');
    const animationTimeout = getTimeout(animationDelays, animationDurations);
    let type = null;
    let timeout = 0;
    let propCount = 0;
    /* istanbul ignore if */
    if (expectedType === TRANSITION) {
        if (transitionTimeout > 0) {
            type = TRANSITION;
            timeout = transitionTimeout;
            propCount = transitionDurations.length;
        }
    }
    else if (expectedType === ANIMATION) {
        if (animationTimeout > 0) {
            type = ANIMATION;
            timeout = animationTimeout;
            propCount = animationDurations.length;
        }
    }
    else {
        timeout = Math.max(transitionTimeout, animationTimeout);
        type =
            timeout > 0
                ? transitionTimeout > animationTimeout
                    ? TRANSITION
                    : ANIMATION
                : null;
        propCount = type
            ? type === TRANSITION
                ? transitionDurations.length
                : animationDurations.length
            : 0;
    }
    const hasTransform = type === TRANSITION &&
        /\b(transform|all)(,|$)/.test(styles[TRANSITION + 'Property']);
    return {
        type,
        timeout,
        propCount,
        hasTransform
    };
}
function getTimeout(delays, durations) {
    while (delays.length < durations.length) {
        delays = delays.concat(delays);
    }
    return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
// Old versions of Chromium (below 61.0.3163.100) formats floating pointer
// numbers in a locale-dependent way, using a comma instead of a dot.
// If comma is not replaced with a dot, the input will be rounded down
// (i.e. acting as a floor function) causing unexpected behaviors
function toMs(s) {
    return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}
// synchronously force layout to put elements into a certain state
function forceReflow() {
    return document.body.offsetHeight;
}

const systemModifiers = ['ctrl', 'shift', 'alt', 'meta'];
const modifierGuards = {
    stop: e => e.stopPropagation(),
    prevent: e => e.preventDefault(),
    self: e => e.target !== e.currentTarget,
    ctrl: e => !e.ctrlKey,
    shift: e => !e.shiftKey,
    alt: e => !e.altKey,
    meta: e => !e.metaKey,
    left: e => 'button' in e && e.button !== 0,
    middle: e => 'button' in e && e.button !== 1,
    right: e => 'button' in e && e.button !== 2,
    exact: (e, modifiers) => systemModifiers.some(m => e[`${m}Key`] && !modifiers.includes(m))
};
/**
 * @private
 */
const withModifiers = (fn, modifiers) => {
    return (event, ...args) => {
        for (let i = 0; i < modifiers.length; i++) {
            const guard = modifierGuards[modifiers[i]];
            if (guard && guard(event, modifiers))
                return;
        }
        return fn(event, ...args);
    };
};

const vShow = {
    beforeMount(el, { value }, { transition }) {
        el._vod = el.style.display === 'none' ? '' : el.style.display;
        if (transition && value) {
            transition.beforeEnter(el);
        }
        else {
            setDisplay(el, value);
        }
    },
    mounted(el, { value }, { transition }) {
        if (transition && value) {
            transition.enter(el);
        }
    },
    updated(el, { value, oldValue }, { transition }) {
        if (!value === !oldValue)
            return;
        if (transition) {
            if (value) {
                transition.beforeEnter(el);
                setDisplay(el, true);
                transition.enter(el);
            }
            else {
                transition.leave(el, () => {
                    setDisplay(el, false);
                });
            }
        }
        else {
            setDisplay(el, value);
        }
    },
    beforeUnmount(el, { value }) {
        setDisplay(el, value);
    }
};
function setDisplay(el, value) {
    el.style.display = value ? el._vod : 'none';
}

const rendererOptions = /*#__PURE__*/ extend({ patchProp }, nodeOps);
// lazy create the renderer - this makes core renderer logic tree-shakable
// in case the user only imports reactivity utilities from Vue.
let renderer;
function ensureRenderer() {
    return (renderer ||
        (renderer = createRenderer(rendererOptions)));
}
// use explicit type casts here to avoid import() calls in rolled-up d.ts
const render = ((...args) => {
    ensureRenderer().render(...args);
});

function initDev() {
    {
        initCustomFormatter();
    }
}

// This entry exports the runtime only, and is built as
if (({}.NODE_ENV !== 'production')) {
    initDev();
}

var _a;
const isClient = typeof window !== "undefined";
const isString = (val) => typeof val === "string";
const noop = () => {
};
isClient && ((_a = window == null ? void 0 : window.navigator) == null ? void 0 : _a.userAgent) && /iP(ad|hone|od)/.test(window.navigator.userAgent);

function resolveUnref(r) {
  return typeof r === "function" ? r() : unref(r);
}

function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    filter(() => fn.apply(this, args), { fn, thisArg: this, args });
  }
  return wrapper;
}
const bypassFilter = (invoke) => {
  return invoke();
};
function debounceFilter(ms, options = {}) {
  let timer;
  let maxTimer;
  const filter = (invoke) => {
    const duration = resolveUnref(ms);
    const maxDuration = resolveUnref(options.maxWait);
    if (timer)
      clearTimeout(timer);
    if (duration <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
      if (maxTimer) {
        clearTimeout(maxTimer);
        maxTimer = null;
      }
      return invoke();
    }
    if (maxDuration && !maxTimer) {
      maxTimer = setTimeout(() => {
        if (timer)
          clearTimeout(timer);
        maxTimer = null;
        invoke();
      }, maxDuration);
    }
    timer = setTimeout(() => {
      if (maxTimer)
        clearTimeout(maxTimer);
      maxTimer = null;
      invoke();
    }, duration);
  };
  return filter;
}
function identity(arg) {
  return arg;
}

function tryOnScopeDispose(fn) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

function resolveRef(r) {
  return typeof r === "function" ? computed(r) : ref(r);
}

function tryOnMounted(fn, sync = true) {
  if (getCurrentInstance())
    onMounted(fn);
  else if (sync)
    fn();
  else
    nextTick(fn);
}

var __getOwnPropSymbols$6 = Object.getOwnPropertySymbols;
var __hasOwnProp$6 = Object.prototype.hasOwnProperty;
var __propIsEnum$6 = Object.prototype.propertyIsEnumerable;
var __objRest$5 = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp$6.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols$6)
    for (var prop of __getOwnPropSymbols$6(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum$6.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
function watchWithFilter(source, cb, options = {}) {
  const _a = options, {
    eventFilter = bypassFilter
  } = _a, watchOptions = __objRest$5(_a, [
    "eventFilter"
  ]);
  return watch(source, createFilterWrapper(eventFilter, cb), watchOptions);
}

var __defProp$4 = Object.defineProperty;
var __defProps$4 = Object.defineProperties;
var __getOwnPropDescs$4 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$4 = Object.getOwnPropertySymbols;
var __hasOwnProp$4 = Object.prototype.hasOwnProperty;
var __propIsEnum$4 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$4 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$4.call(b, prop))
      __defNormalProp$4(a, prop, b[prop]);
  if (__getOwnPropSymbols$4)
    for (var prop of __getOwnPropSymbols$4(b)) {
      if (__propIsEnum$4.call(b, prop))
        __defNormalProp$4(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$4 = (a, b) => __defProps$4(a, __getOwnPropDescs$4(b));
var __objRest$3 = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp$4.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols$4)
    for (var prop of __getOwnPropSymbols$4(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum$4.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
function watchDebounced(source, cb, options = {}) {
  const _a = options, {
    debounce = 0,
    maxWait = void 0
  } = _a, watchOptions = __objRest$3(_a, [
    "debounce",
    "maxWait"
  ]);
  return watchWithFilter(source, cb, __spreadProps$4(__spreadValues$4({}, watchOptions), {
    eventFilter: debounceFilter(debounce, { maxWait })
  }));
}

function unrefElement(elRef) {
  var _a;
  const plain = resolveUnref(elRef);
  return (_a = plain == null ? void 0 : plain.$el) != null ? _a : plain;
}

const defaultWindow = isClient ? window : void 0;
const defaultDocument = isClient ? window.document : void 0;
isClient ? window.navigator : void 0;
isClient ? window.location : void 0;

function useEventListener(...args) {
  let target;
  let event;
  let listener;
  let options;
  if (isString(args[0])) {
    [event, listener, options] = args;
    target = defaultWindow;
  } else {
    [target, event, listener, options] = args;
  }
  if (!target)
    return noop;
  let cleanup = noop;
  const stopWatch = watch(() => unrefElement(target), (el) => {
    cleanup();
    if (!el)
      return;
    el.addEventListener(event, listener, options);
    cleanup = () => {
      el.removeEventListener(event, listener, options);
      cleanup = noop;
    };
  }, { immediate: true, flush: "post" });
  const stop = () => {
    stopWatch();
    cleanup();
  };
  tryOnScopeDispose(stop);
  return stop;
}

function onClickOutside(target, handler, options = {}) {
  const { window = defaultWindow, ignore, capture = true, detectIframe = false } = options;
  if (!window)
    return;
  const shouldListen = ref(true);
  let fallback;
  const listener = (event) => {
    window.clearTimeout(fallback);
    const el = unrefElement(target);
    const composedPath = event.composedPath();
    if (!el || el === event.target || composedPath.includes(el) || !shouldListen.value)
      return;
    if (ignore && ignore.length > 0) {
      if (ignore.some((target2) => {
        const el2 = unrefElement(target2);
        return el2 && (event.target === el2 || composedPath.includes(el2));
      }))
        return;
    }
    handler(event);
  };
  const cleanup = [
    useEventListener(window, "click", listener, { passive: true, capture }),
    useEventListener(window, "pointerdown", (e) => {
      const el = unrefElement(target);
      shouldListen.value = !!el && !e.composedPath().includes(el);
    }, { passive: true }),
    useEventListener(window, "pointerup", (e) => {
      if (e.button === 0) {
        const path = e.composedPath();
        e.composedPath = () => path;
        fallback = window.setTimeout(() => listener(e), 50);
      }
    }, { passive: true }),
    detectIframe && useEventListener(window, "blur", (event) => {
      var _a;
      const el = unrefElement(target);
      if (((_a = document.activeElement) == null ? void 0 : _a.tagName) === "IFRAME" && !(el == null ? void 0 : el.contains(document.activeElement)))
        handler(event);
    })
  ].filter(Boolean);
  const stop = () => cleanup.forEach((fn) => fn());
  return stop;
}
const createKeyPredicate = (keyFilter) => {
  if (typeof keyFilter === "function")
    return keyFilter;
  else if (typeof keyFilter === "string")
    return (event) => event.key === keyFilter;
  else if (Array.isArray(keyFilter))
    return (event) => keyFilter.includes(event.key);
  else if (keyFilter)
    return () => true;
  else
    return () => false;
};
function onKeyStroke(key, handler, options = {}) {
  const { target = defaultWindow, eventName = "keydown", passive = false } = options;
  const predicate = createKeyPredicate(key);
  const listener = (e) => {
    if (predicate(e))
      handler(e);
  };
  return useEventListener(target, eventName, listener, passive);
}

function useSupported(callback, sync = false) {
  const isSupported = ref();
  const update = () => isSupported.value = Boolean(callback());
  update();
  tryOnMounted(update, sync);
  return isSupported;
}

const _global = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
const globalKey = "__vueuse_ssr_handlers__";
_global[globalKey] = _global[globalKey] || {};
_global[globalKey];

const functionsMap = [
  [
    "requestFullscreen",
    "exitFullscreen",
    "fullscreenElement",
    "fullscreenEnabled",
    "fullscreenchange",
    "fullscreenerror"
  ],
  [
    "webkitRequestFullscreen",
    "webkitExitFullscreen",
    "webkitFullscreenElement",
    "webkitFullscreenEnabled",
    "webkitfullscreenchange",
    "webkitfullscreenerror"
  ],
  [
    "webkitRequestFullScreen",
    "webkitCancelFullScreen",
    "webkitCurrentFullScreenElement",
    "webkitCancelFullScreen",
    "webkitfullscreenchange",
    "webkitfullscreenerror"
  ],
  [
    "mozRequestFullScreen",
    "mozCancelFullScreen",
    "mozFullScreenElement",
    "mozFullScreenEnabled",
    "mozfullscreenchange",
    "mozfullscreenerror"
  ],
  [
    "msRequestFullscreen",
    "msExitFullscreen",
    "msFullscreenElement",
    "msFullscreenEnabled",
    "MSFullscreenChange",
    "MSFullscreenError"
  ]
];
function useFullscreen(target, options = {}) {
  const { document = defaultDocument, autoExit = false } = options;
  const targetRef = target || (document == null ? void 0 : document.querySelector("html"));
  const isFullscreen = ref(false);
  let map = functionsMap[0];
  const isSupported = useSupported(() => {
    if (!document) {
      return false;
    } else {
      for (const m of functionsMap) {
        if (m[1] in document) {
          map = m;
          return true;
        }
      }
    }
    return false;
  });
  const [REQUEST, EXIT, ELEMENT, , EVENT] = map;
  async function exit() {
    if (!isSupported.value)
      return;
    if (document == null ? void 0 : document[ELEMENT])
      await document[EXIT]();
    isFullscreen.value = false;
  }
  async function enter() {
    if (!isSupported.value)
      return;
    await exit();
    const target2 = unrefElement(targetRef);
    if (target2) {
      await target2[REQUEST]();
      isFullscreen.value = true;
    }
  }
  async function toggle() {
    if (isFullscreen.value)
      await exit();
    else
      await enter();
  }
  if (document) {
    useEventListener(document, EVENT, () => {
      isFullscreen.value = !!(document == null ? void 0 : document[ELEMENT]);
    }, false);
  }
  if (autoExit)
    tryOnScopeDispose(exit);
  return {
    isSupported,
    isFullscreen,
    enter,
    exit,
    toggle
  };
}

var SwipeDirection;
(function(SwipeDirection2) {
  SwipeDirection2["UP"] = "UP";
  SwipeDirection2["RIGHT"] = "RIGHT";
  SwipeDirection2["DOWN"] = "DOWN";
  SwipeDirection2["LEFT"] = "LEFT";
  SwipeDirection2["NONE"] = "NONE";
})(SwipeDirection || (SwipeDirection = {}));

function usePointerSwipe(target, options = {}) {
  const targetRef = resolveRef(target);
  const {
    threshold = 50,
    onSwipe,
    onSwipeEnd,
    onSwipeStart
  } = options;
  const posStart = reactive({ x: 0, y: 0 });
  const updatePosStart = (x, y) => {
    posStart.x = x;
    posStart.y = y;
  };
  const posEnd = reactive({ x: 0, y: 0 });
  const updatePosEnd = (x, y) => {
    posEnd.x = x;
    posEnd.y = y;
  };
  const distanceX = computed(() => posStart.x - posEnd.x);
  const distanceY = computed(() => posStart.y - posEnd.y);
  const { max, abs } = Math;
  const isThresholdExceeded = computed(() => max(abs(distanceX.value), abs(distanceY.value)) >= threshold);
  const isSwiping = ref(false);
  const isPointerDown = ref(false);
  const direction = computed(() => {
    if (!isThresholdExceeded.value)
      return SwipeDirection.NONE;
    if (abs(distanceX.value) > abs(distanceY.value)) {
      return distanceX.value > 0 ? SwipeDirection.LEFT : SwipeDirection.RIGHT;
    } else {
      return distanceY.value > 0 ? SwipeDirection.UP : SwipeDirection.DOWN;
    }
  });
  const filterEvent = (e) => {
    if (options.pointerTypes)
      return options.pointerTypes.includes(e.pointerType);
    return true;
  };
  const stops = [
    useEventListener(target, "pointerdown", (e) => {
      var _a, _b;
      if (!filterEvent(e))
        return;
      isPointerDown.value = true;
      (_b = (_a = targetRef.value) == null ? void 0 : _a.style) == null ? void 0 : _b.setProperty("touch-action", "none");
      const eventTarget = e.target;
      eventTarget == null ? void 0 : eventTarget.setPointerCapture(e.pointerId);
      const { clientX: x, clientY: y } = e;
      updatePosStart(x, y);
      updatePosEnd(x, y);
      onSwipeStart == null ? void 0 : onSwipeStart(e);
    }),
    useEventListener(target, "pointermove", (e) => {
      if (!filterEvent(e))
        return;
      if (!isPointerDown.value)
        return;
      const { clientX: x, clientY: y } = e;
      updatePosEnd(x, y);
      if (!isSwiping.value && isThresholdExceeded.value)
        isSwiping.value = true;
      if (isSwiping.value)
        onSwipe == null ? void 0 : onSwipe(e);
    }),
    useEventListener(target, "pointerup", (e) => {
      var _a, _b;
      if (!filterEvent(e))
        return;
      if (isSwiping.value)
        onSwipeEnd == null ? void 0 : onSwipeEnd(e, direction.value);
      isPointerDown.value = false;
      isSwiping.value = false;
      (_b = (_a = targetRef.value) == null ? void 0 : _a.style) == null ? void 0 : _b.setProperty("touch-action", "initial");
    })
  ];
  const stop = () => stops.forEach((s) => s());
  return {
    isSwiping: readonly(isSwiping),
    direction: readonly(direction),
    posStart: readonly(posStart),
    posEnd: readonly(posEnd),
    distanceX,
    distanceY,
    stop
  };
}

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
const _TransitionPresets = {
  easeInSine: [0.12, 0, 0.39, 0],
  easeOutSine: [0.61, 1, 0.88, 1],
  easeInOutSine: [0.37, 0, 0.63, 1],
  easeInQuad: [0.11, 0, 0.5, 0],
  easeOutQuad: [0.5, 1, 0.89, 1],
  easeInOutQuad: [0.45, 0, 0.55, 1],
  easeInCubic: [0.32, 0, 0.67, 0],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeInQuart: [0.5, 0, 0.75, 0],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeInQuint: [0.64, 0, 0.78, 0],
  easeOutQuint: [0.22, 1, 0.36, 1],
  easeInOutQuint: [0.83, 0, 0.17, 1],
  easeInExpo: [0.7, 0, 0.84, 0],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeInCirc: [0.55, 0, 1, 0.45],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeInOutCirc: [0.85, 0, 0.15, 1],
  easeInBack: [0.36, 0, 0.66, -0.56],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInOutBack: [0.68, -0.6, 0.32, 1.6]
};
__spreadValues({
  linear: identity
}, _TransitionPresets);

function useWindowSize(options = {}) {
  const {
    window = defaultWindow,
    initialWidth = Infinity,
    initialHeight = Infinity,
    listenOrientation = true,
    includeScrollbar = true
  } = options;
  const width = ref(initialWidth);
  const height = ref(initialHeight);
  const update = () => {
    if (window) {
      if (includeScrollbar) {
        width.value = window.innerWidth;
        height.value = window.innerHeight;
      } else {
        width.value = window.document.documentElement.clientWidth;
        height.value = window.document.documentElement.clientHeight;
      }
    }
  };
  update();
  tryOnMounted(update);
  useEventListener("resize", update, { passive: true });
  if (listenOrientation)
    useEventListener("orientationchange", update, { passive: true });
  return { width, height };
}

function initStyles(props, rootComponent) {
	const settings = props.readerSettings
		? JSON.parse(props.readerSettings)
		: null;

	if (props.cssFile) {
		stylesheetLoader(props.cssFile, rootComponent);
	}

	if (props.cssString) {
		applyStylesheet(props.cssString, rootComponent);
	}

	if (settings?.cssString) {
		applyStylesheet(settings.cssString, rootComponent);
	}
}

function fontLoader(fontsOptions) {
	const fontsToLoad = fontsOptions.filter(item => item.link);

	if (fontsToLoad.length > 0) {
		const style = document.createElement('style');
		const head = document.head || document.getElementsByTagName('head')[0];
		head.appendChild(style);

		style.type = 'text/css';
		let css = '';
		fontsToLoad.forEach(
			item => css = css + `@import url(${item.link}); \n`
		);
		style.appendChild(document.createTextNode(css));
	}
}

async function stylesheetLoader(stylesheet, ref) {
	if (stylesheet) {
		try {
			const dataRef = await fetch(stylesheet);
			const cssText = await dataRef.text();

			applyStylesheet(cssText, ref);

		} catch (_) {}
	}
}

async function applyStylesheet(stylesheet, ref) {
	const style = document.createElement('style');
	ref.value.appendChild(style);
	style.type = 'text/css';
	style.appendChild(document.createTextNode(stylesheet));
}

const useStyles = {
	initStyles,
	fontLoader,
	stylesheetLoader,
	applyStylesheet
};

const state$5 = reactive({
	baseFont: 'Arial, sans-serif',
	textFont: 'Times New Roman, serif',
	fontsOptions: [
		{ name: 'Times New Roman, serif' },
		{ name: 'Georgia, serif' },
		{ name: 'Arial, sans-serif' },
		{ name: 'Verdana, sans-serif' },
	],
	fontSize: 16,
	columns: 'double',
	mode: 'light',
	blocked: false,

	bookTitle: null,
	chapterTitle: null,
	homeUrl: null,
});

const baseFont = computed(() => state$5.baseFont);
const textFont = computed(() => state$5.textFont);
const fontSize = computed(() => state$5.fontSize);
const fontsOptions = computed(() => state$5.fontsOptions);
const columns = computed(() => state$5.columns);
const mode = computed(() => state$5.mode);
const blocked = computed(() => state$5.blocked);

const bookTitle = computed(() => state$5.bookTitle);
const chapterTitle = computed(() => state$5.chapterTitle);
const homeUrl = computed(() => state$5.homeUrl);

watch(
	[baseFont, textFont, fontSize, columns, mode],
	() => saveSettings()
);

async function initSettings(settingsString) {
	const settings = settingsString
		? JSON.parse(settingsString)
		: null;

	if (settings?.baseFont)
		state$5.baseFont = settings.baseFont;

	if (settings?.textFont)
		state$5.textFont = settings.textFont;

	if (settings?.fontSize)
		state$5.fontSize = Number(settings.fontSize);

	if (settings?.fontsOptions) {
		state$5.fontsOptions = settings.fontsOptions;
		useStyles.fontLoader(settings.fontsOptions);

		// baseFont
		const defaultBaseFont = settings.fontsOptions.find(
			item => item.defaultBaseFont
		);
		if (defaultBaseFont)
			state$5.baseFont = defaultBaseFont.name;

		// textFont
		const defaultTextFont = settings.fontsOptions.find(
			item => item.defaultTextFont
		);
		if (defaultTextFont)
			state$5.textFont = defaultTextFont.name;
	}

	if (settings?.bookTitle)
		state$5.bookTitle = settings.bookTitle;

	if (settings?.chapterTitle)
		state$5.chapterTitle = settings.chapterTitle;

	if (settings?.homeUrl)
		state$5.homeUrl = settings.homeUrl;

	loadSavedSettings(settings);
}

function loadSavedSettings(settings) {
	const hasSettings = localStorage.getItem('readerSettings');

	if (hasSettings) {
		const savedSettings = JSON.parse(hasSettings);

		state$5.fontSize = savedSettings.fontSize;
		state$5.columns = savedSettings.columns;
		state$5.mode = savedSettings.mode;

		if (settings?.fontsOptions &&
			settings?.fontsOptions?.find(item => item.name === savedSettings.textFont)
		) {
			state$5.textFont = savedSettings.textFont;
		}

		if (savedSettings.mode === 'dark') {
			const htmlRoot = document.querySelector('html');
			if (htmlRoot) {
				htmlRoot.classList.remove("light");
				htmlRoot.classList.add("dark");
			}
		}
	}
}

function setColumns(value) {
	state$5.columns = value;
}

function setTextFont(value) {
	state$5.textFont = value;
}

function setFontSize(value) {
	state$5.fontSize = value;
}

function setBlocked(value) {
	state$5.blocked = value;
}

function setMode(value) {
	state$5.mode = value;

	const htmlRoot = document.querySelector('html');
	if (htmlRoot) {
		if (htmlRoot.classList.contains("dark")) {
			htmlRoot.classList.remove("dark");
			htmlRoot.classList.add("light");

		} else {
			htmlRoot.classList.remove("light");
			htmlRoot.classList.add("dark");
		}
	}
}

function saveSettings() {
	localStorage.setItem(
		'readerSettings',
		JSON.stringify({
			textFont: textFont.value,
			fontSize: fontSize.value,
			columns: columns.value,
			mode: mode.value
		})
	);
}

const useReaderSettings = {
	baseFont,
	textFont,
	fontSize,
	fontsOptions,
	columns,
	initSettings,
	setColumns,
	setTextFont,
	setFontSize,
	setBlocked,
	mode,
	blocked,
	setMode,
	saveSettings,

	bookTitle,
	chapterTitle,
	homeUrl
};

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const _sfc_main$s = {};

const _hoisted_1$q = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 20 22",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$o = /*#__PURE__*/createBaseVNode("path", {
  d: "M1 8L10 1L19 8V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8Z",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
}, null, -1);
const _hoisted_3$f = /*#__PURE__*/createBaseVNode("path", {
  d: "M7 21V11H13V21",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round"
}, null, -1);
const _hoisted_4$5 = [
  _hoisted_2$o,
  _hoisted_3$f
];

function _sfc_render$c(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$q, _hoisted_4$5))
}
const IconHome = /*#__PURE__*/_export_sfc(_sfc_main$s, [['render',_sfc_render$c]]);

const _sfc_main$r = {};

const _hoisted_1$p = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$n = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M6 18L18 6M6 6l12 12"
}, null, -1);
const _hoisted_3$e = [
  _hoisted_2$n
];

function _sfc_render$b(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$p, _hoisted_3$e))
}
const IconClose = /*#__PURE__*/_export_sfc(_sfc_main$r, [['render',_sfc_render$b]]);

const _sfc_main$q = {};

const _hoisted_1$o = {
  width: "24",
  height: "19",
  viewBox: "0 0 24 19",
  fill: "none",
  stroke: "currentColor",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$m = /*#__PURE__*/createStaticVNode("<line x1=\"5\" y1=\"1.08447\" x2=\"1\" y2=\"1.08447\" stroke-width=\"2\" stroke-linecap=\"round\"></line><line x1=\"23\" y1=\"1.04248\" x2=\"11\" y2=\"1.04248\" stroke-width=\"2\" stroke-linecap=\"round\"></line><line x1=\"23\" y1=\"9.08447\" x2=\"14\" y2=\"9.08447\" stroke-width=\"2\" stroke-linecap=\"round\"></line><line x1=\"8\" y1=\"9.14905\" x2=\"4\" y2=\"9.14905\" stroke-width=\"2\" stroke-linecap=\"round\"></line><line x1=\"23\" y1=\"17.149\" x2=\"10.9993\" y2=\"17.149\" stroke-width=\"2\" stroke-linecap=\"round\"></line><line x1=\"5\" y1=\"17.2429\" x2=\"1\" y2=\"17.2429\" stroke-width=\"2\" stroke-linecap=\"round\"></line>", 6);
const _hoisted_8$2 = [
  _hoisted_2$m
];

function _sfc_render$a(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$o, _hoisted_8$2))
}
const IconSummary = /*#__PURE__*/_export_sfc(_sfc_main$q, [['render',_sfc_render$a]]);

const state$4 = reactive({
	references: [],
	reference: null
});

const references = computed(() => state$4.references);

function setReferences(references) {
	state$4.references = references;
}

const reference = computed(() => state$4.reference);

function setHighlightedReference(reference) {
	state$4.reference = reference;
}

function applyReferences(contentRaw) {
	if (state$4.references.length === 0 || !contentRaw)
		return contentRaw

	return state$4.references.reduce((content, reference) => {
		if (!content) return content

		if (content.includes(reference.cit)) {
			const regex = new RegExp(reference.cit, 'g');
			const newContent = content.replace(
				regex,
				`<span class='reference reference-${reference.cit.replaceAll(' ', '')}'>
					${reference.cit}
				</span>`
			);
			return newContent
		}
		return content
	}, contentRaw)
}

function applyReference(event) {
	const classList = event.target.closest('.reference')?.classList.value.split(' ');

	if (classList.length === 0)
		return

	const target = classList.find(item => item.startsWith('reference-'));

	if (target) {
		const ref = state$4.references.find(
			item => target && item.cit.replaceAll(' ', '') === target.replace('reference-', '')
		);
		if (ref) {
			state$4.reference = ref;
		}
	}

}

const useReferences = {
	references,
	reference,
	applyReference,
	setReferences,
	setHighlightedReference,
	applyReferences,
};

const state$3 = reactive({
	footnotes: [],
	showFootnotes: false,
	footnote: null
});

const footnotes = computed(() => state$3.footnotes);
function setFootnotes(footnotes) {
	state$3.footnotes = footnotes;
}

const showFootnotes = computed(() => state$3.showFootnotes);
function setShowFootnotes(value) {
	state$3.showFootnotes = value;
}

const footnote = computed(() => state$3.footnote);
function setHighlightedFootnote(footnote) {
	state$3.footnote = footnote;
}

function applyFootnote(event) {
	const classList = event.target.closest('.footnote')?.classList.value.split(' ');

	if (classList.length === 0)
		return

	const footnoteTarget = classList.find(
		item => item.includes('footnote') && item !== 'footnote'
	);

	if (footnoteTarget) {
		const ref = state$3.footnotes.find(item => item.id === footnoteTarget);
		if (ref) {
			state$3.footnote = ref;
		}
	}
}

const useFootnotes = {
	footnotes,
	footnote,
	setFootnotes,
	applyFootnote,
	setHighlightedFootnote,
	setShowFootnotes,
	showFootnotes
};

const state$2 = reactive({
	summary: null,
	content: null
});

const content = computed(() => state$2.content);
const summary = computed(() => state$2.summary);
const context = computed(() => {
	const current = state$2.summary.findIndex(
		chapter => window.location.href.includes(chapter.link)
	);
	return {
		chapter: state$2.summary[current],
		surround: {
			before: current - 1 >= 0
				? state$2.summary[current - 1]
				: null,
			after: current + 1 <= state$2.summary.length
				? state$2.summary[current + 1]
				: null,
		}
	}
});

async function initContent(contentString, contentWrapper) {
	const { setReferences, applyReferences } = useReferences;
	const { setFootnotes } = useFootnotes;

	const content = contentString
		? JSON.parse(contentString)
		: null;

	if (content?.summary)
		state$2.summary = content.summary;

	if (content?.references)
		setReferences(content.references);

	if (content?.footnotes)
		setFootnotes(content.footnotes);

	// if content comes from file, apply references to file
	if (content?.summary?.[0]?.file) {
		const text = await getContent(content.summary?.[0]?.file);
		const newContent = content.applyReferences
			? applyReferences(text)
			: text;
		state$2.content = newContent;

	// else if content comes from slot, apply references to slot
	} else {
		const content = document.querySelectorAll('[slot="content"]');

		if (content && content?.[0]?.innerHTML && content.applyReferences) {
			const newContent = applyReferences(content?.[0]?.innerHTML);
			if (newContent) {
				content[0].innerHTML = newContent;
			}
		}
	}

	// after applying references above, now we start to listen to its clicks
	listenToClicks(contentWrapper);
}

async function getContent(location) {
	try {
		const dataRef = await fetch(location);
		const text = await dataRef.text();
		return text
	} catch (err) {
		console.log({ err });
		state$2.content = 'Ops, não foi possível carregar o arquivo solicitado.';
	}
}

function applyContent(text) {
	const { applyReferences } = useReferences;
	const newContent = applyReferences(text);
	state$2.content = newContent;
}

function listenToClicks(contentWrapper) {
	setTimeout(() => {
		useEventListener(contentWrapper, 'click', getClickedReferenceData);
	}, 100);
}

function getClickedReferenceData(event) {
	if (event.target.closest('.reference')) {
		useReferences.applyReference(event);
	}

	if (event.target.closest('.footnote')) {
		useFootnotes.applyFootnote(event);
	}
}

const useTextContent = {
	content,
	summary,
	initContent,
	getContent,
	applyContent,
	listenToClicks,
	context
};

const state$1 = reactive({
	totalPages: 1
});

function estimate(viewport, content) {
	if (viewport && content) {
		const { width: viewportWidth } = viewport.value.getBoundingClientRect();
		const { width: contentWidth } = content.value.getBoundingClientRect();

		if (contentWidth > viewportWidth) {
			state$1.totalPages = Math.ceil(contentWidth / viewportWidth);
			return Math.ceil(contentWidth / viewportWidth)

		} else {
			state$1.totalPages = 1;
			return 1
		}
	} else {
		state$1.totalPages = 1;
		return 1
	}
}

const totalPages$1 = computed(() => state$1.totalPages);

const useEstimatePages = {
	totalPages: totalPages$1,
	estimate
};

const isSafari = [
	'iPad Simulator',
	'iPhone Simulator',
	'iPod Simulator',
	'iPad',
	'iPhone',
	'iPod'
].includes(navigator.platform)
	|| (navigator.userAgent.includes("Mac") && "ontouchend" in document);

const isApple = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

const useBrowser = {
	isSafari,
	isApple
};

const state = reactive({
	currentPage: 1,
	nextTry: 0,
	prevTry: 0,
	willRedirect: false
});

const currentPage = computed(() => state.currentPage);
const totalPages = computed(() => useEstimatePages.totalPages.value);

function init(viewport, content) {
	useEstimatePages.estimate(viewport, content);

	// check if there is a query string for oring, and
	// if previews chapter was the next one. If so,
	// start from the end, as we are coming backwards
	const urlParams = new URLSearchParams(window.location.search);
	const origin = urlParams.get('origin');
	if (origin && origin === 'next') {
		setTimeout(() => {
			state.currentPage = totalPages.value;
		}, 200);
	}

	if (!useBrowser.isApple && !useBrowser.isSafari) {
		addEventListener('wheel', onWheel);
	}

	setInterval(() => {
		useEstimatePages.estimate(viewport, content);
	}, 5000);
}

// when resizing the viewport, totalPages change
// this watch is to currentPage inside totalPages range
watch(totalPages, () => {
	if (totalPages.value < currentPage.value) {
		set(totalPages.value);
	}
});

// navigate by increase/decrease value
function next(usingScroll = false) {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage + 1) <= totalPages.value) {
			state.currentPage = state.currentPage + 1;
		} else {
			// prevent going too fast to next chapter on
			// stronger scroll
			if (usingScroll && state.nextTry < 4) {
				state.nextTry += 1;
				return
			}

			if (state.willRedirect === false) {
				const context = useTextContent.context.value;
				if (context.surround?.after) {
					window.location.href = context.surround.after.link + (`?origin=prev`);
					state.willRedirect = true;
				}
			}
		}
	}
}
onKeyStroke('ArrowRight', (e) => {
	e.preventDefault();
	next();
});

function onWheel(event) {
	if (event.wheelDelta < 0) {
		next(true);
	} else {
		prev(true);
	}
}
function prev(usingScroll = false) {
	if (!useReaderSettings.blocked.value) {
		if ((state.currentPage - 1) > 0) {
			state.currentPage = state.currentPage - 1;
		} else {
			// prevent going too fast to prev chapter on
			// stronger scroll
			if (usingScroll && state.prevTry < 4) {
				state.prevTry += 1;
				return
			}

			if (state.willRedirect === false) {
				const context = useTextContent.context.value;
				if (context.surround?.before) {
					window.location.href = context.surround.before.link + (`?origin=next`);
				}
				state.willRedirect = true;
			}
		}
	}
}
onKeyStroke('ArrowLeft', (e) => {
	e.preventDefault();
	prev();
});

// navigate to specific page
function set(val) {
	state.currentPage = val;
}

const usePagination = {
	currentPage,
	totalPages,
	next,
	prev,
	init,
	set
};

const _hoisted_1$n = ["role"];
const _hoisted_2$l = { class: "summary-menu-dropdown-item-title" };
const _hoisted_3$d = {
  key: 0,
  class: "summary-menu-dropdown-item-author"
};

const _sfc_main$p = {
  __name: 'SummaryDropdown',
  setup(__props) {

const { summary } = useTextContent;

async function getChapter(item) {
	const text = await useTextContent.getContent(item.file);
	useTextContent.applyContent(text);
	usePagination.set(1);
}

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    id: "summary-menu-dropdown",
    class: "absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104 text-areia z-10 bg-white",
    role: _ctx.Sumário,
    "aria-orientation": "vertical",
    "aria-labelledby": "summary-menu"
  }, [
    createBaseVNode("nav", null, [
      renderSlot(_ctx.$slots, "summaryTop"),
      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(summary), (item) => {
        return (openBlock(), createBlock(resolveDynamicComponent(item.link ? 'a' : 'button'), {
          key: item.link,
          href: item.link,
          title: `Navegar para capítulo ${item.title}`,
          class: "w-full text-left block text-black py-2 px-3 hover:bg-gray-100 rounded mb-2",
          onClick: $event => (item.file ? getChapter(item) : null)
        }, {
          default: withCtx(() => [
            createBaseVNode("span", _hoisted_2$l, toDisplayString(item.title), 1),
            (item.author)
              ? (openBlock(), createElementBlock("span", _hoisted_3$d, toDisplayString(item.author), 1))
              : createCommentVNode("", true)
          ]),
          _: 2
        }, 1032, ["href", "title", "onClick"]))
      }), 128)),
      renderSlot(_ctx.$slots, "summaryBottom")
    ])
  ], 8, _hoisted_1$n))
}
}

};

const _hoisted_1$m = { class: "flex" };
const _hoisted_2$k = ["href"];
const _hoisted_3$c = { class: "position-relative" };
const _hoisted_4$4 = ["aria-expanded"];
const _hoisted_5$3 = /*#__PURE__*/createBaseVNode("span", { class: "block ml-3" }, " Sumário ", -1);


const _sfc_main$o = {
  __name: 'SummaryButton',
  setup(__props) {

const show = ref(false);
const button = ref(null);

const { homeUrl } = useReaderSettings;

const toggleSummary = () => show.value = !show.value;
const hide = () => {
	if (!useReaderSettings.blocked.value) {
		show.value = false;
	}
};

onClickOutside(button, () => hide());
onKeyStroke('Escape', () => hide());

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    id: "summary-menu",
    ref_key: "button",
    ref: button,
    class: "relative"
  }, [
    createBaseVNode("div", _hoisted_1$m, [
      (unref(homeUrl))
        ? (openBlock(), createElementBlock("a", {
            key: 0,
            href: unref(homeUrl),
            title: "Homepage",
            id: "home-button",
            class: "hidden md:flex items-center border p-3 shadow mr-3 border-white text-white"
          }, [
            createVNode(IconHome, { class: "w-6 h-6" })
          ], 8, _hoisted_2$k))
        : createCommentVNode("", true),
      createBaseVNode("div", _hoisted_3$c, [
        createBaseVNode("button", {
          onClick: _cache[0] || (_cache[0] = withModifiers($event => (toggleSummary()), ["prevent"])),
          class: "border p-3 shadow flex items-center border-white text-white",
          id: "summary-button",
          "aria-haspopup": "true",
          "aria-expanded": show.value
        }, [
          (!show.value)
            ? (openBlock(), createBlock(IconSummary, { key: 0 }))
            : (openBlock(), createBlock(IconClose, {
                key: 1,
                class: "w-6 h-6"
              })),
          _hoisted_5$3
        ], 8, _hoisted_4$4),
        createVNode(Transition, {
          "enter-active-class": "transition ease-out duration-100 transform",
          "enter-class": "opacity-0 scale-95",
          "enter-to-class": "opacity-100 scale-100",
          "leave-active-class": "transition ease-in duration-75 transform",
          "leave-class": "opacity-100 scale-100",
          "leave-to-class": "opacity-0 scale-95"
        }, {
          default: withCtx(() => [
            (show.value)
              ? (openBlock(), createBlock(_sfc_main$p, { key: 0 }, {
                  summaryTop: withCtx(() => [
                    renderSlot(_ctx.$slots, "summaryTop")
                  ]),
                  summaryBottom: withCtx(() => [
                    renderSlot(_ctx.$slots, "summaryBottom")
                  ]),
                  _: 3
                }))
              : createCommentVNode("", true)
          ]),
          _: 3
        })
      ])
    ])
  ], 512))
}
}

};

const _sfc_main$n = {};

const _hoisted_1$l = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$j = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
}, null, -1);
const _hoisted_3$b = [
  _hoisted_2$j
];

function _sfc_render$9(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$l, _hoisted_3$b))
}
const IconThreeDots = /*#__PURE__*/_export_sfc(_sfc_main$n, [['render',_sfc_render$9]]);

const _sfc_main$m = {};

const _hoisted_1$k = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$i = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
}, null, -1);
const _hoisted_3$a = [
  _hoisted_2$i
];

function _sfc_render$8(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$k, _hoisted_3$a))
}
const IconExpand = /*#__PURE__*/_export_sfc(_sfc_main$m, [['render',_sfc_render$8]]);

const _sfc_main$l = {};

const _hoisted_1$j = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$h = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
}, null, -1);
const _hoisted_3$9 = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
}, null, -1);
const _hoisted_4$3 = [
  _hoisted_2$h,
  _hoisted_3$9
];

function _sfc_render$7(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$j, _hoisted_4$3))
}
const IconEye = /*#__PURE__*/_export_sfc(_sfc_main$l, [['render',_sfc_render$7]]);

const _sfc_main$k = {};

const _hoisted_1$i = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$g = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
}, null, -1);
const _hoisted_3$8 = [
  _hoisted_2$g
];

function _sfc_render$6(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$i, _hoisted_3$8))
}
const IconFootnote = /*#__PURE__*/_export_sfc(_sfc_main$k, [['render',_sfc_render$6]]);

const _sfc_main$j = {};

const _hoisted_1$h = {
  viewBox: "0 0 341.5 441.2",
  fill: "currentColor"
};
const _hoisted_2$f = /*#__PURE__*/createStaticVNode("<rect data-v-acadaaca=\"\" x=\"73.2\" y=\"143.7\" width=\"195.2\" height=\"20\"></rect><rect data-v-acadaaca=\"\" x=\"73.2\" y=\"82.7\" width=\"195.2\" height=\"20\"></rect><rect data-v-acadaaca=\"\" x=\"73.2\" y=\"203.7\" width=\"195.2\" height=\"20\"></rect><rect data-v-acadaaca=\"\" x=\"73.2\" y=\"263.7\" width=\"195.2\" height=\"20\"></rect><rect data-v-acadaaca=\"\" x=\"73.2\" y=\"319\" width=\"195.2\" height=\"20\"></rect><rect data-v-acadaaca=\"\" x=\"0\" y=\"-0.6\" width=\"332.3\" height=\"15\"></rect><rect data-v-acadaaca=\"\" x=\"0\" y=\"426.2\" width=\"332.3\" height=\"15\"></rect><rect data-v-acadaaca=\"\" x=\"-209.4\" y=\"216.2\" transform=\"matrix(6.123234e-17 -1 1 6.123234e-17 -216.2339 231.2339)\" width=\"433.7\" height=\"15\"></rect><rect data-v-acadaaca=\"\" x=\"108\" y=\"211.9\" transform=\"matrix(6.123234e-17 -1 1 6.123234e-17 105.4808 544.1859)\" width=\"433.7\" height=\"15\"></rect>", 9);
const _hoisted_11 = [
  _hoisted_2$f
];

function _sfc_render$5(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$h, _hoisted_11))
}
const SingleColumn = /*#__PURE__*/_export_sfc(_sfc_main$j, [['render',_sfc_render$5]]);

const _sfc_main$i = {};

const _hoisted_1$g = {
  viewBox: "0 0 653 441.2",
  fill: "currentColor"
};
const _hoisted_2$e = /*#__PURE__*/createStaticVNode("<rect x=\"73.2\" y=\"143.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"73.2\" y=\"82.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"73.2\" y=\"203.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"73.2\" y=\"263.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"73.2\" y=\"319\" width=\"195.2\" height=\"20\"></rect><rect x=\"384.7\" y=\"143.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"384.7\" y=\"82.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"384.7\" y=\"203.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"384.7\" y=\"263.7\" width=\"195.2\" height=\"20\"></rect><rect x=\"384.7\" y=\"319\" width=\"195.2\" height=\"20\"></rect><path d=\"M0-0.6v7.5v7.5v411.8v14.4v0.6h653v-5v-10V14.4V2.5v-3.1H0z M638,426.2H15V14.4h623V426.2z\"></path>", 11);
const _hoisted_13 = [
  _hoisted_2$e
];

function _sfc_render$4(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$g, _hoisted_13))
}
const DoubleColumn = /*#__PURE__*/_export_sfc(_sfc_main$i, [['render',_sfc_render$4]]);

const _hoisted_1$f = {
  id: "columns-menu",
  class: "w-full hidden md:grid grid-cols-3 gap-2 mt-3"
};
const _hoisted_2$d = ["title"];

const _sfc_main$h = {
  __name: 'OptionsColumns',
  setup(__props) {

const { columns, setColumns } = useReaderSettings;
const { width } = useWindowSize();

const isSafari = computed(() => {
	const ua = navigator.userAgent.toLowerCase();
	return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1
});


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", _hoisted_1$f, [
    createBaseVNode("button", {
      id: "single-column-button",
      class: normalizeClass(["col-span-1 text-primary text-center cursor-pointer py-3 rounded-sm border", {
				'border-gray-300': unref(columns) !== 'single',
				'bg-primary-extralight border-2 border-primary': unref(columns) === 'single',
				'opacity-30 cursor-default': unref(isSafari)
			}]),
      onClick: _cache[0] || (_cache[0] = withModifiers($event => (!unref(isSafari) ? unref(setColumns)('single') : null), ["prevent"])),
      "aria-label": "Coluna única",
      title: unref(isSafari) ? 'O navegador Safari não aceita visualização de coluna única.' : 'Coluna única'
    }, [
      createVNode(SingleColumn, { class: "mx-auto h-10 opacity-75" })
    ], 10, _hoisted_2$d),
    createBaseVNode("button", {
      id: "double-column-button",
      class: normalizeClass(["col-span-2 text-primary text-center cursor-pointer py-3 rounded-sm border", {
				'border-gray-300': unref(columns) !== 'double',
				'bg-primary-extralight border-2 border-primary': unref(columns) === 'double',
				'opacity-30': unref(width) < 1024
			}]),
      onClick: _cache[1] || (_cache[1] = withModifiers($event => (unref(width) >= 1024 && unref(setColumns)('double')), ["prevent"])),
      "aria-label": "Coluna dupla",
      title: "Coluna dupla"
    }, [
      createVNode(DoubleColumn, {
        name: "DoubleColumn",
        class: "mx-auto h-10 divide-opacity-75"
      })
    ], 2)
  ]))
}
}

};

const _hoisted_1$e = {
  id: "font-family-menu",
  class: "w-full grid grid-cols-4 gap-2 my-3"
};
const _hoisted_2$c = ["onClick", "title"];

const _sfc_main$g = {
  __name: 'OptionsFontFamily',
  setup(__props) {

const { textFont, fontsOptions, setTextFont } = useReaderSettings;


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", _hoisted_1$e, [
    (openBlock(true), createElementBlock(Fragment, null, renderList(unref(fontsOptions), (font) => {
      return (openBlock(), createElementBlock("button", {
        key: font.name,
        onClick: withModifiers($event => (unref(setTextFont)(font.name)), ["prevent"]),
        class: normalizeClass(["font-light text-lg text-primary tracking-wide border border-urucum w-full h-10 flex justify-center items-center", {
				'bg-primary-extralight border-2 border-primary': unref(textFont) === font.name
			}]),
        style: normalizeStyle(`font-family: ${font.name}`),
        title: font.label ?? font.name
      }, " Ff ", 14, _hoisted_2$c))
    }), 128))
  ]))
}
}

};

const _sfc_main$f = {
  __name: 'OptionsFontSize',
  setup(__props) {

const { fontSize, setFontSize } = useReaderSettings;


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock(Fragment, null, [
    createBaseVNode("button", {
      id: "fontsize-add-button",
      onClick: _cache[0] || (_cache[0] = withModifiers($event => (unref(setFontSize)(unref(fontSize) + 1)), ["prevent"])),
      class: "font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
    }, " + A "),
    createBaseVNode("button", {
      id: "fontsize-subtr-button",
      onClick: _cache[1] || (_cache[1] = withModifiers($event => (unref(setFontSize)(unref(fontSize) - 1)), ["prevent"])),
      class: "font-light text-base border border-urucum w-full h-10 flex justify-center items-center"
    }, " - A ")
  ], 64))
}
}

};

const _sfc_main$e = {};

const _hoisted_1$d = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$b = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
}, null, -1);
const _hoisted_3$7 = [
  _hoisted_2$b
];

function _sfc_render$3(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$d, _hoisted_3$7))
}
const IconSun = /*#__PURE__*/_export_sfc(_sfc_main$e, [['render',_sfc_render$3]]);

const _sfc_main$d = {};

const _hoisted_1$c = {
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg"
};
const _hoisted_2$a = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
}, null, -1);
const _hoisted_3$6 = [
  _hoisted_2$a
];

function _sfc_render$2(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$c, _hoisted_3$6))
}
const IconMoon = /*#__PURE__*/_export_sfc(_sfc_main$d, [['render',_sfc_render$2]]);

const _sfc_main$c = {
  __name: 'OptionsColor',
  setup(__props) {

const { mode, setMode } = useReaderSettings;


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock(Fragment, null, [
    createBaseVNode("button", {
      id: "lightmode-button",
      onClick: _cache[0] || (_cache[0] = withModifiers($event => (unref(setMode)('light')), ["prevent"])),
      title: "Leitura diurna",
      class: normalizeClass(["font-light text-base border w-full h-10 flex justify-center items-center", {
			'bg-primary-extralight text-primary border-2 border-primary': unref(mode) === 'light'
		}])
    }, [
      createVNode(IconSun, { class: "w-5 h-5" })
    ], 2),
    createBaseVNode("button", {
      id: "darkmode-button",
      onClick: _cache[1] || (_cache[1] = withModifiers($event => (unref(setMode)('dark')), ["prevent"])),
      title: "Leitura noturna",
      class: normalizeClass(["font-light text-base border w-full h-10 flex justify-center items-center", {
			'bg-primary-extralight text-primary border-2 border-primary':  unref(mode) === 'dark'
		}])
    }, [
      createVNode(IconMoon, { class: "w-5 h-5" })
    ], 2)
  ], 64))
}
}

};

const _hoisted_1$b = {
  class: "absolute top-14 py-4 px-3 shadow-lg w-60 md:w-104 text-areia -right-2 md:right-16 z-10 bg-white",
  role: "Opções",
  "aria-orientation": "vertical",
  "aria-labelledby": "options-menu"
};
const _hoisted_2$9 = { id: "footnotes-button" };
const _hoisted_3$5 = /*#__PURE__*/createBaseVNode("span", { class: "ml-4" }, "Notas de rodapé", -1);
const _hoisted_4$2 = /*#__PURE__*/createBaseVNode("div", { class: "w-full border-b border-areia my-3" }, null, -1);
const _hoisted_5$2 = {
  class: "w-full flex justify-center items-center py-3 lowercase",
  id: "visualize-title"
};
const _hoisted_6$2 = /*#__PURE__*/createBaseVNode("span", { class: "ml-4" }, "Visualização", -1);
const _hoisted_7$1 = { class: "w-full grid grid-cols-4 gap-2 my-3" };
const _hoisted_8$1 = /*#__PURE__*/createBaseVNode("div", { class: "hidden w-full border-b border-areia my-8" }, null, -1);


const _sfc_main$b = {
  __name: 'OptionsDropdown',
  setup(__props) {


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", _hoisted_1$b, [
    createBaseVNode("div", null, [
      renderSlot(_ctx.$slots, "optionsTop"),
      createBaseVNode("div", _hoisted_2$9, [
        createBaseVNode("button", {
          onClick: _cache[0] || (_cache[0] = withModifiers($event => (unref(useFootnotes).setShowFootnotes(true)), ["prevent"])),
          class: "w-full flex justify-center items-center py-3 lowercase"
        }, [
          createVNode(IconFootnote, { class: "w-6 h-6" }),
          _hoisted_3$5
        ]),
        _hoisted_4$2
      ]),
      createBaseVNode("div", _hoisted_5$2, [
        createVNode(IconEye, { class: "w-6 h-6" }),
        _hoisted_6$2
      ]),
      createVNode(_sfc_main$h),
      createVNode(_sfc_main$g),
      createBaseVNode("div", _hoisted_7$1, [
        createVNode(_sfc_main$f),
        createVNode(_sfc_main$c)
      ]),
      _hoisted_8$1,
      renderSlot(_ctx.$slots, "optionsBottom")
    ])
  ]))
}
}

};

const _hoisted_1$a = { class: "flex" };
const _hoisted_2$8 = ["aria-expanded"];
const _hoisted_3$4 = /*#__PURE__*/createBaseVNode("span", { class: "block mr-3" }, " Opções ", -1);


const _sfc_main$a = {
  __name: 'OptionsButton',
  setup(__props) {

const show = ref(false);
const button = ref(null);

const toggleSummary = () => show.value = !show.value;
const hide = () => {
	if (!useReaderSettings.blocked.value) {
		show.value = false;
	}
};

onClickOutside(button, () => hide());
onKeyStroke('Escape', () => hide());

const { toggle: toggleFullScreen } = useFullscreen();

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    id: "options-menu",
    ref_key: "button",
    ref: button,
    class: "relative"
  }, [
    createBaseVNode("div", _hoisted_1$a, [
      createBaseVNode("button", {
        onClick: _cache[0] || (_cache[0] = withModifiers($event => (toggleSummary()), ["prevent"])),
        class: "border p-3 shadow flex items-center border-white text-white",
        id: "options-button",
        "aria-haspopup": "true",
        "aria-expanded": show.value
      }, [
        _hoisted_3$4,
        (show.value)
          ? (openBlock(), createBlock(IconClose, {
              key: 0,
              class: "w-6 h-6"
            }))
          : (openBlock(), createBlock(IconThreeDots, {
              key: 1,
              class: "w-6 h-6"
            }))
      ], 8, _hoisted_2$8),
      createBaseVNode("button", {
        onClick: _cache[1] || (_cache[1] = withModifiers($event => (unref(toggleFullScreen)()), ["prevent"])),
        class: "hidden md:flex items-center border p-3 shadow ml-3 border-white text-white"
      }, [
        createVNode(IconExpand, { class: "w-6 h-6" })
      ])
    ]),
    createVNode(Transition, {
      "enter-active-class": "transition ease-out duration-100 transform",
      "enter-class": "opacity-0 scale-95",
      "enter-to-class": "opacity-100 scale-100",
      "leave-active-class": "transition ease-in duration-75 transform",
      "leave-class": "opacity-100 scale-100",
      "leave-to-class": "opacity-0 scale-95"
    }, {
      default: withCtx(() => [
        withDirectives(createVNode(_sfc_main$b, null, {
          optionsTop: withCtx(() => [
            renderSlot(_ctx.$slots, "optionsTop")
          ]),
          optionsBottom: withCtx(() => [
            renderSlot(_ctx.$slots, "optionsBottom")
          ]),
          _: 3
        }, 512), [
          [vShow, show.value]
        ])
      ]),
      _: 3
    })
  ], 512))
}
}

};

const _hoisted_1$9 = {
  id: "component-header",
  class: "bg-primary flex justify-between items-center p-4"
};
const _hoisted_2$7 = { id: "header-titles" };

const _sfc_main$9 = {
  __name: 'HeaderSlot',
  setup(__props) {


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("header", _hoisted_1$9, [
    createVNode(_sfc_main$o, null, {
      summaryTop: withCtx(() => [
        renderSlot(_ctx.$slots, "summaryTop")
      ]),
      summaryBottom: withCtx(() => [
        renderSlot(_ctx.$slots, "summaryBottom")
      ]),
      _: 3
    }),
    createBaseVNode("div", _hoisted_2$7, [
      renderSlot(_ctx.$slots, "header")
    ]),
    createVNode(_sfc_main$a, null, {
      optionsTop: withCtx(() => [
        renderSlot(_ctx.$slots, "optionsTop")
      ]),
      optionsBottom: withCtx(() => [
        renderSlot(_ctx.$slots, "optionsBottom")
      ]),
      _: 3
    })
  ]))
}
}

};

const _hoisted_1$8 = ["innerHTML"];

const _sfc_main$8 = {
  __name: 'BookContent',
  props: {
	bookContent: String
},
  setup(__props) {

const props = __props;

const { content, initContent } = useTextContent;



const contentWrapper = ref(null);

onMounted(() => {
	initContent(props.bookContent, contentWrapper);
});

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    ref_key: "contentWrapper",
    ref: contentWrapper
  }, [
    (unref(content))
      ? (openBlock(), createElementBlock("div", {
          key: 0,
          innerHTML: unref(content)
        }, null, 8, _hoisted_1$8))
      : renderSlot(_ctx.$slots, "content", { key: 1 })
  ], 512))
}
}

};

const _sfc_main$7 = {
	name: "NavPrev",

	props: {
		target: String,
	},

	computed: {
		type() {
			return 'chapter'
		},
	}
};

const _hoisted_1$7 = {
  key: 0,
  viewBox: "0 0 20 20",
  fill: "currentColor",
  class: "[ viewer-nav-icon nav-prev ] arrow-narrow-left"
};
const _hoisted_2$6 = /*#__PURE__*/createBaseVNode("path", {
  "fill-rule": "evenodd",
  d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z",
  "clip-rule": "evenodd"
}, null, -1);
const _hoisted_3$3 = [
  _hoisted_2$6
];
const _hoisted_4$1 = {
  key: 1,
  "data-v-ef9c31bc": "",
  viewBox: "0 0 20 20",
  fill: "currentColor",
  class: "[ viewer-nav-icon nav-next ] right-0 arrow-narrow-right"
};
const _hoisted_5$1 = /*#__PURE__*/createBaseVNode("path", {
  "fill-rule": "evenodd",
  d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
  "clip-rule": "evenodd"
}, null, -1);
const _hoisted_6$1 = [
  _hoisted_5$1
];

function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
  return (openBlock(), createElementBlock("button", {
    onClick: _cache[0] || (_cache[0] = withModifiers($event => (_ctx.$emit('clicked')), ["prevent"])),
    class: normalizeClass(["[ viewer-nav ]", $options.type === 'cover' ? 'text-white' : 'text-gray-dark'])
  }, [
    ($props.target === 'prev')
      ? (openBlock(), createElementBlock("svg", _hoisted_1$7, _hoisted_3$3))
      : createCommentVNode("", true),
    ($props.target === 'next')
      ? (openBlock(), createElementBlock("svg", _hoisted_4$1, _hoisted_6$1))
      : createCommentVNode("", true)
  ], 2))
}
const NavigationButton = /*#__PURE__*/_export_sfc(_sfc_main$7, [['render',_sfc_render$1]]);

const _hoisted_1$6 = {
  id: "engine",
  class: "pt-10 transition-colors"
};
const _hoisted_2$5 = { class: "engineWrapper overflow-hidden" };

const _sfc_main$6 = {
  __name: 'EngineWrapper',
  setup(__props) {

const { next, prev } = usePagination;

return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", _hoisted_1$6, [
    createBaseVNode("div", _hoisted_2$5, [
      createVNode(NavigationButton, {
        target: "prev",
        onClicked: _cache[0] || (_cache[0] = $event => (unref(prev)()))
      }),
      renderSlot(_ctx.$slots, "default"),
      createVNode(NavigationButton, {
        target: "next",
        onClicked: _cache[1] || (_cache[1] = $event => (unref(next)()))
      })
    ])
  ]))
}
}

};

const _hoisted_1$5 = { class: "[ typeArea ] h-full relative transition-opacity duration-100 opacity-100 px-2 md:px-24" };


const _sfc_main$5 = {
  __name: 'ReaderWrapper',
  setup(__props) {
const { currentPage } = usePagination;

const el = ref(null);

const { width } = useWindowSize();
const { distanceX } = usePointerSwipe(el, {
	onSwipeEnd() {
		if (width.value < 600) {
			if (distanceX.value > 100) {
				usePagination.next();
			}
			if (distanceX.value < -100) {
				usePagination.prev();
			}
		}
	}
});


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    ref_key: "el",
    ref: el,
    class: "columnsArea",
    style: normalizeStyle(`margin-left: -${100 * (unref(currentPage) - 1)}%`)
  }, [
    createBaseVNode("div", _hoisted_1$5, [
      renderSlot(_ctx.$slots, "default")
    ])
  ], 4))
}
}

};

const _hoisted_1$4 = {
  key: 0,
  tabindex: "0",
  class: "[ reference-popup ] bg-gray-800 text-white fixed z-40 bottom-0 md:bottom-14 right-0 md:right-3 rounded flex justify-between p-4 shadow w-full md:w-2/5"
};
const _hoisted_2$4 = ["innerHTML"];
const _hoisted_3$2 = { class: "mt-3 flex self-end" };


const _sfc_main$4 = {
  __name: 'ReferencePopup',
  setup(__props) {

const { reference, setHighlightedReference } = useReferences;

function closeRef() {
	setHighlightedReference(null);
}

onKeyStroke('Escape', () => {
	if (!useReaderSettings.blocked.value) {
		setHighlightedReference(null);
	}
});


return (_ctx, _cache) => {
  return (openBlock(), createBlock(Transition, {
    "enter-active-class": "transition ease-out duration-200",
    "enter-from-class": "transform opacity-0 scale-95",
    "enter-to-class": "transform opacity-100 scale-100",
    "leave-active-class": "transition ease-in duration-200",
    "leave-from-class": "transform opacity-100 scale-100",
    "leave-to-class": "transform opacity-0 scale-95"
  }, {
    default: withCtx(() => [
      (unref(reference))
        ? (openBlock(), createElementBlock("div", _hoisted_1$4, [
            createBaseVNode("p", {
              class: "w-4/5",
              innerHTML: unref(reference).ref
            }, null, 8, _hoisted_2$4),
            createBaseVNode("div", _hoisted_3$2, [
              createBaseVNode("button", {
                onClick: _cache[0] || (_cache[0] = withModifiers($event => (closeRef()), ["prevent"])),
                class: "button button-negative"
              }, "OK")
            ])
          ]))
        : createCommentVNode("", true)
    ]),
    _: 1
  }))
}
}

};

function u(e){return -1!==[null,void 0,!1].indexOf(e)}function c(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}function p(e){var t={exports:{}};return e(t,t.exports),t.exports}var d=p((function(e,t){e.exports=function(){var e=["decimals","thousand","mark","prefix","suffix","encoder","decoder","negativeBefore","negative","edit","undo"];function t(e){return e.split("").reverse().join("")}function r(e,t){return e.substring(0,t.length)===t}function i(e,t){return e.slice(-1*t.length)===t}function n(e,t,r){if((e[t]||e[r])&&e[t]===e[r])throw new Error(t)}function o(e){return "number"==typeof e&&isFinite(e)}function a(e,t){return e=e.toString().split("e"),(+((e=(e=Math.round(+(e[0]+"e"+(e[1]?+e[1]+t:t)))).toString().split("e"))[0]+"e"+(e[1]?+e[1]-t:-t))).toFixed(t)}function s(e,r,i,n,s,l,u,c,p,d,f,h){var m,v,g,b=h,y="",S="";return l&&(h=l(h)),!!o(h)&&(!1!==e&&0===parseFloat(h.toFixed(e))&&(h=0),h<0&&(m=!0,h=Math.abs(h)),!1!==e&&(h=a(h,e)),-1!==(h=h.toString()).indexOf(".")?(g=(v=h.split("."))[0],i&&(y=i+v[1])):g=h,r&&(g=t(g).match(/.{1,3}/g),g=t(g.join(t(r)))),m&&c&&(S+=c),n&&(S+=n),m&&p&&(S+=p),S+=g,S+=y,s&&(S+=s),d&&(S=d(S,b)),S)}function l(e,t,n,a,s,l,u,c,p,d,f,h){var m,v="";return f&&(h=f(h)),!(!h||"string"!=typeof h)&&(c&&r(h,c)&&(h=h.replace(c,""),m=!0),a&&r(h,a)&&(h=h.replace(a,"")),p&&r(h,p)&&(h=h.replace(p,""),m=!0),s&&i(h,s)&&(h=h.slice(0,-1*s.length)),t&&(h=h.split(t).join("")),n&&(h=h.replace(n,".")),m&&(v+="-"),""!==(v=(v+=h).replace(/[^0-9\.\-.]/g,""))&&(v=Number(v),u&&(v=u(v)),!!o(v)&&v))}function u(t){var r,i,o,a={};for(void 0===t.suffix&&(t.suffix=t.postfix),r=0;r<e.length;r+=1)if(void 0===(o=t[i=e[r]]))"negative"!==i||a.negativeBefore?"mark"===i&&"."!==a.thousand?a[i]=".":a[i]=!1:a[i]="-";else if("decimals"===i){if(!(o>=0&&o<8))throw new Error(i);a[i]=o;}else if("encoder"===i||"decoder"===i||"edit"===i||"undo"===i){if("function"!=typeof o)throw new Error(i);a[i]=o;}else {if("string"!=typeof o)throw new Error(i);a[i]=o;}return n(a,"mark","thousand"),n(a,"prefix","negative"),n(a,"prefix","negativeBefore"),a}function c(t,r,i){var n,o=[];for(n=0;n<e.length;n+=1)o.push(t[e[n]]);return o.push(i),r.apply("",o)}function p(e){if(!(this instanceof p))return new p(e);"object"==typeof e&&(e=u(e),this.to=function(t){return c(e,s,t)},this.from=function(t){return c(e,l,t)});}return p}();}));var f=c(p((function(e,t){!function(e){function t(e){return r(e)&&"function"==typeof e.from}function r(e){return "object"==typeof e&&"function"==typeof e.to}function i(e){e.parentElement.removeChild(e);}function n(e){return null!=e}function o(e){e.preventDefault();}function a(e){return e.filter((function(e){return !this[e]&&(this[e]=!0)}),{})}function s(e,t){return Math.round(e/t)*t}function l(e,t){var r=e.getBoundingClientRect(),i=e.ownerDocument,n=i.documentElement,o=g(i);return /webkit.*Chrome.*Mobile/i.test(navigator.userAgent)&&(o.x=0),t?r.top+o.y-n.clientTop:r.left+o.x-n.clientLeft}function u(e){return "number"==typeof e&&!isNaN(e)&&isFinite(e)}function c(e,t,r){r>0&&(h(e,t),setTimeout((function(){m(e,t);}),r));}function p(e){return Math.max(Math.min(e,100),0)}function d(e){return Array.isArray(e)?e:[e]}function f(e){var t=(e=String(e)).split(".");return t.length>1?t[1].length:0}function h(e,t){e.classList&&!/\s/.test(t)?e.classList.add(t):e.className+=" "+t;}function m(e,t){e.classList&&!/\s/.test(t)?e.classList.remove(t):e.className=e.className.replace(new RegExp("(^|\\b)"+t.split(" ").join("|")+"(\\b|$)","gi")," ");}function v(e,t){return e.classList?e.classList.contains(t):new RegExp("\\b"+t+"\\b").test(e.className)}function g(e){var t=void 0!==window.pageXOffset,r="CSS1Compat"===(e.compatMode||"");return {x:t?window.pageXOffset:r?e.documentElement.scrollLeft:e.body.scrollLeft,y:t?window.pageYOffset:r?e.documentElement.scrollTop:e.body.scrollTop}}function b(){return window.navigator.pointerEnabled?{start:"pointerdown",move:"pointermove",end:"pointerup"}:window.navigator.msPointerEnabled?{start:"MSPointerDown",move:"MSPointerMove",end:"MSPointerUp"}:{start:"mousedown touchstart",move:"mousemove touchmove",end:"mouseup touchend"}}function y(){var e=!1;try{var t=Object.defineProperty({},"passive",{get:function(){e=!0;}});window.addEventListener("test",null,t);}catch(e){}return e}function S(){return window.CSS&&CSS.supports&&CSS.supports("touch-action","none")}function x(e,t){return 100/(t-e)}function w(e,t,r){return 100*t/(e[r+1]-e[r])}function E(e,t){return w(e,e[0]<0?t+Math.abs(e[0]):t-e[0],0)}function P(e,t){return t*(e[1]-e[0])/100+e[0]}function N(e,t){for(var r=1;e>=t[r];)r+=1;return r}function C(e,t,r){if(r>=e.slice(-1)[0])return 100;var i=N(r,e),n=e[i-1],o=e[i],a=t[i-1],s=t[i];return a+E([n,o],r)/x(a,s)}function k(e,t,r){if(r>=100)return e.slice(-1)[0];var i=N(r,t),n=e[i-1],o=e[i],a=t[i-1];return P([n,o],(r-a)*x(a,t[i]))}function A(e,t,r,i){if(100===i)return i;var n=N(i,e),o=e[n-1],a=e[n];return r?i-o>(a-o)/2?a:o:t[n-1]?e[n-1]+s(i-e[n-1],t[n-1]):i}var V,M;e.PipsMode=void 0,(M=e.PipsMode||(e.PipsMode={})).Range="range",M.Steps="steps",M.Positions="positions",M.Count="count",M.Values="values",e.PipsType=void 0,(V=e.PipsType||(e.PipsType={}))[V.None=-1]="None",V[V.NoValue=0]="NoValue",V[V.LargeValue=1]="LargeValue",V[V.SmallValue=2]="SmallValue";var L=function(){function e(e,t,r){var i;this.xPct=[],this.xVal=[],this.xSteps=[],this.xNumSteps=[],this.xHighestCompleteStep=[],this.xSteps=[r||!1],this.xNumSteps=[!1],this.snap=t;var n=[];for(Object.keys(e).forEach((function(t){n.push([d(e[t]),t]);})),n.sort((function(e,t){return e[0][0]-t[0][0]})),i=0;i<n.length;i++)this.handleEntryPoint(n[i][1],n[i][0]);for(this.xNumSteps=this.xSteps.slice(0),i=0;i<this.xNumSteps.length;i++)this.handleStepPoint(i,this.xNumSteps[i]);}return e.prototype.getDistance=function(e){for(var t=[],r=0;r<this.xNumSteps.length-1;r++)t[r]=w(this.xVal,e,r);return t},e.prototype.getAbsoluteDistance=function(e,t,r){var i,n=0;if(e<this.xPct[this.xPct.length-1])for(;e>this.xPct[n+1];)n++;else e===this.xPct[this.xPct.length-1]&&(n=this.xPct.length-2);r||e!==this.xPct[n+1]||n++,null===t&&(t=[]);var o=1,a=t[n],s=0,l=0,u=0,c=0;for(i=r?(e-this.xPct[n])/(this.xPct[n+1]-this.xPct[n]):(this.xPct[n+1]-e)/(this.xPct[n+1]-this.xPct[n]);a>0;)s=this.xPct[n+1+c]-this.xPct[n+c],t[n+c]*o+100-100*i>100?(l=s*i,o=(a-100*i)/t[n+c],i=1):(l=t[n+c]*s/100*o,o=0),r?(u-=l,this.xPct.length+c>=1&&c--):(u+=l,this.xPct.length-c>=1&&c++),a=t[n+c]*o;return e+u},e.prototype.toStepping=function(e){return e=C(this.xVal,this.xPct,e)},e.prototype.fromStepping=function(e){return k(this.xVal,this.xPct,e)},e.prototype.getStep=function(e){return e=A(this.xPct,this.xSteps,this.snap,e)},e.prototype.getDefaultStep=function(e,t,r){var i=N(e,this.xPct);return (100===e||t&&e===this.xPct[i-1])&&(i=Math.max(i-1,1)),(this.xVal[i]-this.xVal[i-1])/r},e.prototype.getNearbySteps=function(e){var t=N(e,this.xPct);return {stepBefore:{startValue:this.xVal[t-2],step:this.xNumSteps[t-2],highestStep:this.xHighestCompleteStep[t-2]},thisStep:{startValue:this.xVal[t-1],step:this.xNumSteps[t-1],highestStep:this.xHighestCompleteStep[t-1]},stepAfter:{startValue:this.xVal[t],step:this.xNumSteps[t],highestStep:this.xHighestCompleteStep[t]}}},e.prototype.countStepDecimals=function(){var e=this.xNumSteps.map(f);return Math.max.apply(null,e)},e.prototype.hasNoSize=function(){return this.xVal[0]===this.xVal[this.xVal.length-1]},e.prototype.convert=function(e){return this.getStep(this.toStepping(e))},e.prototype.handleEntryPoint=function(e,t){var r;if(!u(r="min"===e?0:"max"===e?100:parseFloat(e))||!u(t[0]))throw new Error("noUiSlider: 'range' value isn't numeric.");this.xPct.push(r),this.xVal.push(t[0]);var i=Number(t[1]);r?this.xSteps.push(!isNaN(i)&&i):isNaN(i)||(this.xSteps[0]=i),this.xHighestCompleteStep.push(0);},e.prototype.handleStepPoint=function(e,t){if(t)if(this.xVal[e]!==this.xVal[e+1]){this.xSteps[e]=w([this.xVal[e],this.xVal[e+1]],t,0)/x(this.xPct[e],this.xPct[e+1]);var r=(this.xVal[e+1]-this.xVal[e])/this.xNumSteps[e],i=Math.ceil(Number(r.toFixed(3))-1),n=this.xVal[e]+this.xNumSteps[e]*i;this.xHighestCompleteStep[e]=n;}else this.xSteps[e]=this.xHighestCompleteStep[e]=this.xVal[e];},e}(),U={to:function(e){return void 0===e?"":e.toFixed(2)},from:Number},O={target:"target",base:"base",origin:"origin",handle:"handle",handleLower:"handle-lower",handleUpper:"handle-upper",touchArea:"touch-area",horizontal:"horizontal",vertical:"vertical",background:"background",connect:"connect",connects:"connects",ltr:"ltr",rtl:"rtl",textDirectionLtr:"txt-dir-ltr",textDirectionRtl:"txt-dir-rtl",draggable:"draggable",drag:"state-drag",tap:"state-tap",active:"active",tooltip:"tooltip",pips:"pips",pipsHorizontal:"pips-horizontal",pipsVertical:"pips-vertical",marker:"marker",markerHorizontal:"marker-horizontal",markerVertical:"marker-vertical",markerNormal:"marker-normal",markerLarge:"marker-large",markerSub:"marker-sub",value:"value",valueHorizontal:"value-horizontal",valueVertical:"value-vertical",valueNormal:"value-normal",valueLarge:"value-large",valueSub:"value-sub"},D={tooltips:".__tooltips",aria:".__aria"};function j(e,t){if(!u(t))throw new Error("noUiSlider: 'step' is not numeric.");e.singleStep=t;}function F(e,t){if(!u(t))throw new Error("noUiSlider: 'keyboardPageMultiplier' is not numeric.");e.keyboardPageMultiplier=t;}function T(e,t){if(!u(t))throw new Error("noUiSlider: 'keyboardMultiplier' is not numeric.");e.keyboardMultiplier=t;}function z(e,t){if(!u(t))throw new Error("noUiSlider: 'keyboardDefaultStep' is not numeric.");e.keyboardDefaultStep=t;}function H(e,t){if("object"!=typeof t||Array.isArray(t))throw new Error("noUiSlider: 'range' is not an object.");if(void 0===t.min||void 0===t.max)throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");e.spectrum=new L(t,e.snap||!1,e.singleStep);}function q(e,t){if(t=d(t),!Array.isArray(t)||!t.length)throw new Error("noUiSlider: 'start' option is incorrect.");e.handles=t.length,e.start=t;}function R(e,t){if("boolean"!=typeof t)throw new Error("noUiSlider: 'snap' option must be a boolean.");e.snap=t;}function B(e,t){if("boolean"!=typeof t)throw new Error("noUiSlider: 'animate' option must be a boolean.");e.animate=t;}function _(e,t){if("number"!=typeof t)throw new Error("noUiSlider: 'animationDuration' option must be a number.");e.animationDuration=t;}function $(e,t){var r,i=[!1];if("lower"===t?t=[!0,!1]:"upper"===t&&(t=[!1,!0]),!0===t||!1===t){for(r=1;r<e.handles;r++)i.push(t);i.push(!1);}else {if(!Array.isArray(t)||!t.length||t.length!==e.handles+1)throw new Error("noUiSlider: 'connect' option doesn't match handle count.");i=t;}e.connect=i;}function X(e,t){switch(t){case"horizontal":e.ort=0;break;case"vertical":e.ort=1;break;default:throw new Error("noUiSlider: 'orientation' option is invalid.")}}function Y(e,t){if(!u(t))throw new Error("noUiSlider: 'margin' option must be numeric.");0!==t&&(e.margin=e.spectrum.getDistance(t));}function I(e,t){if(!u(t))throw new Error("noUiSlider: 'limit' option must be numeric.");if(e.limit=e.spectrum.getDistance(t),!e.limit||e.handles<2)throw new Error("noUiSlider: 'limit' option is only supported on linear sliders with 2 or more handles.")}function W(e,t){var r;if(!u(t)&&!Array.isArray(t))throw new Error("noUiSlider: 'padding' option must be numeric or array of exactly 2 numbers.");if(Array.isArray(t)&&2!==t.length&&!u(t[0])&&!u(t[1]))throw new Error("noUiSlider: 'padding' option must be numeric or array of exactly 2 numbers.");if(0!==t){for(Array.isArray(t)||(t=[t,t]),e.padding=[e.spectrum.getDistance(t[0]),e.spectrum.getDistance(t[1])],r=0;r<e.spectrum.xNumSteps.length-1;r++)if(e.padding[0][r]<0||e.padding[1][r]<0)throw new Error("noUiSlider: 'padding' option must be a positive number(s).");var i=t[0]+t[1],n=e.spectrum.xVal[0];if(i/(e.spectrum.xVal[e.spectrum.xVal.length-1]-n)>1)throw new Error("noUiSlider: 'padding' option must not exceed 100% of the range.")}}function G(e,t){switch(t){case"ltr":e.dir=0;break;case"rtl":e.dir=1;break;default:throw new Error("noUiSlider: 'direction' option was not recognized.")}}function J(e,t){if("string"!=typeof t)throw new Error("noUiSlider: 'behaviour' must be a string containing options.");var r=t.indexOf("tap")>=0,i=t.indexOf("drag")>=0,n=t.indexOf("fixed")>=0,o=t.indexOf("snap")>=0,a=t.indexOf("hover")>=0,s=t.indexOf("unconstrained")>=0,l=t.indexOf("drag-all")>=0,u=t.indexOf("smooth-steps")>=0;if(n){if(2!==e.handles)throw new Error("noUiSlider: 'fixed' behaviour must be used with 2 handles");Y(e,e.start[1]-e.start[0]);}if(s&&(e.margin||e.limit))throw new Error("noUiSlider: 'unconstrained' behaviour cannot be used with margin or limit");e.events={tap:r||o,drag:i,dragAll:l,smoothSteps:u,fixed:n,snap:o,hover:a,unconstrained:s};}function K(e,t){if(!1!==t)if(!0===t||r(t)){e.tooltips=[];for(var i=0;i<e.handles;i++)e.tooltips.push(t);}else {if((t=d(t)).length!==e.handles)throw new Error("noUiSlider: must pass a formatter for all handles.");t.forEach((function(e){if("boolean"!=typeof e&&!r(e))throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.")})),e.tooltips=t;}}function Q(e,t){if(t.length!==e.handles)throw new Error("noUiSlider: must pass a attributes for all handles.");e.handleAttributes=t;}function Z(e,t){if(!r(t))throw new Error("noUiSlider: 'ariaFormat' requires 'to' method.");e.ariaFormat=t;}function ee(e,r){if(!t(r))throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.");e.format=r;}function te(e,t){if("boolean"!=typeof t)throw new Error("noUiSlider: 'keyboardSupport' option must be a boolean.");e.keyboardSupport=t;}function re(e,t){e.documentElement=t;}function ie(e,t){if("string"!=typeof t&&!1!==t)throw new Error("noUiSlider: 'cssPrefix' must be a string or `false`.");e.cssPrefix=t;}function ne(e,t){if("object"!=typeof t)throw new Error("noUiSlider: 'cssClasses' must be an object.");"string"==typeof e.cssPrefix?(e.cssClasses={},Object.keys(t).forEach((function(r){e.cssClasses[r]=e.cssPrefix+t[r];}))):e.cssClasses=t;}function oe(e){var t={margin:null,limit:null,padding:null,animate:!0,animationDuration:300,ariaFormat:U,format:U},r={step:{r:!1,t:j},keyboardPageMultiplier:{r:!1,t:F},keyboardMultiplier:{r:!1,t:T},keyboardDefaultStep:{r:!1,t:z},start:{r:!0,t:q},connect:{r:!0,t:$},direction:{r:!0,t:G},snap:{r:!1,t:R},animate:{r:!1,t:B},animationDuration:{r:!1,t:_},range:{r:!0,t:H},orientation:{r:!1,t:X},margin:{r:!1,t:Y},limit:{r:!1,t:I},padding:{r:!1,t:W},behaviour:{r:!0,t:J},ariaFormat:{r:!1,t:Z},format:{r:!1,t:ee},tooltips:{r:!1,t:K},keyboardSupport:{r:!0,t:te},documentElement:{r:!1,t:re},cssPrefix:{r:!0,t:ie},cssClasses:{r:!0,t:ne},handleAttributes:{r:!1,t:Q}},i={connect:!1,direction:"ltr",behaviour:"tap",orientation:"horizontal",keyboardSupport:!0,cssPrefix:"noUi-",cssClasses:O,keyboardPageMultiplier:5,keyboardMultiplier:1,keyboardDefaultStep:10};e.format&&!e.ariaFormat&&(e.ariaFormat=e.format),Object.keys(r).forEach((function(o){if(n(e[o])||void 0!==i[o])r[o].t(t,n(e[o])?e[o]:i[o]);else if(r[o].r)throw new Error("noUiSlider: '"+o+"' is required.")})),t.pips=e.pips;var o=document.createElement("div"),a=void 0!==o.style.msTransform,s=void 0!==o.style.transform;t.transformRule=s?"transform":a?"msTransform":"webkitTransform";var l=[["left","top"],["right","bottom"]];return t.style=l[t.dir][t.ort],t}function ae(t,r,s){var u,f,x,w,E,P=b(),N=S()&&y(),C=t,k=r.spectrum,A=[],V=[],M=[],L=0,U={},O=t.ownerDocument,j=r.documentElement||O.documentElement,F=O.body,T="rtl"===O.dir||1===r.ort?0:100;function z(e,t){var r=O.createElement("div");return t&&h(r,t),e.appendChild(r),r}function H(e,t){var i=z(e,r.cssClasses.origin),n=z(i,r.cssClasses.handle);if(z(n,r.cssClasses.touchArea),n.setAttribute("data-handle",String(t)),r.keyboardSupport&&(n.setAttribute("tabindex","0"),n.addEventListener("keydown",(function(e){return fe(e,t)}))),void 0!==r.handleAttributes){var o=r.handleAttributes[t];Object.keys(o).forEach((function(e){n.setAttribute(e,o[e]);}));}return n.setAttribute("role","slider"),n.setAttribute("aria-orientation",r.ort?"vertical":"horizontal"),0===t?h(n,r.cssClasses.handleLower):t===r.handles-1&&h(n,r.cssClasses.handleUpper),i}function q(e,t){return !!t&&z(e,r.cssClasses.connect)}function R(e,t){var i=z(t,r.cssClasses.connects);f=[],(x=[]).push(q(i,e[0]));for(var n=0;n<r.handles;n++)f.push(H(t,n)),M[n]=n,x.push(q(i,e[n+1]));}function B(e){return h(e,r.cssClasses.target),0===r.dir?h(e,r.cssClasses.ltr):h(e,r.cssClasses.rtl),0===r.ort?h(e,r.cssClasses.horizontal):h(e,r.cssClasses.vertical),h(e,"rtl"===getComputedStyle(e).direction?r.cssClasses.textDirectionRtl:r.cssClasses.textDirectionLtr),z(e,r.cssClasses.base)}function _(e,t){return !(!r.tooltips||!r.tooltips[t])&&z(e.firstChild,r.cssClasses.tooltip)}function $(){return C.hasAttribute("disabled")}function X(e){return f[e].hasAttribute("disabled")}function Y(){E&&(ge("update"+D.tooltips),E.forEach((function(e){e&&i(e);})),E=null);}function I(){Y(),E=f.map(_),me("update"+D.tooltips,(function(e,t,i){if(E&&r.tooltips&&!1!==E[t]){var n=e[t];!0!==r.tooltips[t]&&(n=r.tooltips[t].to(i[t])),E[t].innerHTML=n;}}));}function W(){ge("update"+D.aria),me("update"+D.aria,(function(e,t,i,n,o){M.forEach((function(e){var t=f[e],n=ye(V,e,0,!0,!0,!0),a=ye(V,e,100,!0,!0,!0),s=o[e],l=String(r.ariaFormat.to(i[e]));n=k.fromStepping(n).toFixed(1),a=k.fromStepping(a).toFixed(1),s=k.fromStepping(s).toFixed(1),t.children[0].setAttribute("aria-valuemin",n),t.children[0].setAttribute("aria-valuemax",a),t.children[0].setAttribute("aria-valuenow",s),t.children[0].setAttribute("aria-valuetext",l);}));}));}function G(t){if(t.mode===e.PipsMode.Range||t.mode===e.PipsMode.Steps)return k.xVal;if(t.mode===e.PipsMode.Count){if(t.values<2)throw new Error("noUiSlider: 'values' (>= 2) required for mode 'count'.");for(var r=t.values-1,i=100/r,n=[];r--;)n[r]=r*i;return n.push(100),J(n,t.stepped)}return t.mode===e.PipsMode.Positions?J(t.values,t.stepped):t.mode===e.PipsMode.Values?t.stepped?t.values.map((function(e){return k.fromStepping(k.getStep(k.toStepping(e)))})):t.values:[]}function J(e,t){return e.map((function(e){return k.fromStepping(t?k.getStep(e):e)}))}function K(t){function r(e,t){return Number((e+t).toFixed(7))}var i=G(t),n={},o=k.xVal[0],s=k.xVal[k.xVal.length-1],l=!1,u=!1,c=0;return (i=a(i.slice().sort((function(e,t){return e-t}))))[0]!==o&&(i.unshift(o),l=!0),i[i.length-1]!==s&&(i.push(s),u=!0),i.forEach((function(o,a){var s,p,d,f,h,m,v,g,b,y,S=o,x=i[a+1],w=t.mode===e.PipsMode.Steps;for(w&&(s=k.xNumSteps[a]),s||(s=x-S),void 0===x&&(x=S),s=Math.max(s,1e-7),p=S;p<=x;p=r(p,s)){for(g=(h=(f=k.toStepping(p))-c)/(t.density||1),y=h/(b=Math.round(g)),d=1;d<=b;d+=1)n[(m=c+d*y).toFixed(5)]=[k.fromStepping(m),0];v=i.indexOf(p)>-1?e.PipsType.LargeValue:w?e.PipsType.SmallValue:e.PipsType.NoValue,!a&&l&&p!==x&&(v=0),p===x&&u||(n[f.toFixed(5)]=[p,v]),c=f;}})),n}function Q(t,i,n){var o,a,s=O.createElement("div"),l=((o={})[e.PipsType.None]="",o[e.PipsType.NoValue]=r.cssClasses.valueNormal,o[e.PipsType.LargeValue]=r.cssClasses.valueLarge,o[e.PipsType.SmallValue]=r.cssClasses.valueSub,o),u=((a={})[e.PipsType.None]="",a[e.PipsType.NoValue]=r.cssClasses.markerNormal,a[e.PipsType.LargeValue]=r.cssClasses.markerLarge,a[e.PipsType.SmallValue]=r.cssClasses.markerSub,a),c=[r.cssClasses.valueHorizontal,r.cssClasses.valueVertical],p=[r.cssClasses.markerHorizontal,r.cssClasses.markerVertical];function d(e,t){var i=t===r.cssClasses.value,n=i?l:u;return t+" "+(i?c:p)[r.ort]+" "+n[e]}function f(t,o,a){if((a=i?i(o,a):a)!==e.PipsType.None){var l=z(s,!1);l.className=d(a,r.cssClasses.marker),l.style[r.style]=t+"%",a>e.PipsType.NoValue&&((l=z(s,!1)).className=d(a,r.cssClasses.value),l.setAttribute("data-value",String(o)),l.style[r.style]=t+"%",l.innerHTML=String(n.to(o)));}}return h(s,r.cssClasses.pips),h(s,0===r.ort?r.cssClasses.pipsHorizontal:r.cssClasses.pipsVertical),Object.keys(t).forEach((function(e){f(e,t[e][0],t[e][1]);})),s}function Z(){w&&(i(w),w=null);}function ee(e){Z();var t=K(e),r=e.filter,i=e.format||{to:function(e){return String(Math.round(e))}};return w=C.appendChild(Q(t,r,i))}function te(){var e=u.getBoundingClientRect(),t="offset"+["Width","Height"][r.ort];return 0===r.ort?e.width||u[t]:e.height||u[t]}function re(e,t,i,n){var o=function(o){var a=ie(o,n.pageOffset,n.target||t);return !!a&&!($()&&!n.doNotReject)&&!(v(C,r.cssClasses.tap)&&!n.doNotReject)&&!(e===P.start&&void 0!==a.buttons&&a.buttons>1)&&(!n.hover||!a.buttons)&&(N||a.preventDefault(),a.calcPoint=a.points[r.ort],void i(a,n))},a=[];return e.split(" ").forEach((function(e){t.addEventListener(e,o,!!N&&{passive:!0}),a.push([e,o]);})),a}function ie(e,t,r){var i=0===e.type.indexOf("touch"),n=0===e.type.indexOf("mouse"),o=0===e.type.indexOf("pointer"),a=0,s=0;if(0===e.type.indexOf("MSPointer")&&(o=!0),"mousedown"===e.type&&!e.buttons&&!e.touches)return !1;if(i){var l=function(t){var i=t.target;return i===r||r.contains(i)||e.composed&&e.composedPath().shift()===r};if("touchstart"===e.type){var u=Array.prototype.filter.call(e.touches,l);if(u.length>1)return !1;a=u[0].pageX,s=u[0].pageY;}else {var c=Array.prototype.find.call(e.changedTouches,l);if(!c)return !1;a=c.pageX,s=c.pageY;}}return t=t||g(O),(n||o)&&(a=e.clientX+t.x,s=e.clientY+t.y),e.pageOffset=t,e.points=[a,s],e.cursor=n||o,e}function ne(e){var t=100*(e-l(u,r.ort))/te();return t=p(t),r.dir?100-t:t}function ae(e){var t=100,r=!1;return f.forEach((function(i,n){if(!X(n)){var o=V[n],a=Math.abs(o-e);(a<t||a<=t&&e>o||100===a&&100===t)&&(r=n,t=a);}})),r}function se(e,t){"mouseout"===e.type&&"HTML"===e.target.nodeName&&null===e.relatedTarget&&ue(e,t);}function le(e,t){if(-1===navigator.appVersion.indexOf("MSIE 9")&&0===e.buttons&&0!==t.buttonsProperty)return ue(e,t);var i=(r.dir?-1:1)*(e.calcPoint-t.startCalcPoint);xe(i>0,100*i/t.baseSize,t.locations,t.handleNumbers,t.connect);}function ue(e,t){t.handle&&(m(t.handle,r.cssClasses.active),L-=1),t.listeners.forEach((function(e){j.removeEventListener(e[0],e[1]);})),0===L&&(m(C,r.cssClasses.drag),Pe(),e.cursor&&(F.style.cursor="",F.removeEventListener("selectstart",o))),r.events.smoothSteps&&(t.handleNumbers.forEach((function(e){Ne(e,V[e],!0,!0,!1,!1);})),t.handleNumbers.forEach((function(e){be("update",e);}))),t.handleNumbers.forEach((function(e){be("change",e),be("set",e),be("end",e);}));}function ce(e,t){if(!t.handleNumbers.some(X)){var i;1===t.handleNumbers.length&&(i=f[t.handleNumbers[0]].children[0],L+=1,h(i,r.cssClasses.active)),e.stopPropagation();var n=[],a=re(P.move,j,le,{target:e.target,handle:i,connect:t.connect,listeners:n,startCalcPoint:e.calcPoint,baseSize:te(),pageOffset:e.pageOffset,handleNumbers:t.handleNumbers,buttonsProperty:e.buttons,locations:V.slice()}),s=re(P.end,j,ue,{target:e.target,handle:i,listeners:n,doNotReject:!0,handleNumbers:t.handleNumbers}),l=re("mouseout",j,se,{target:e.target,handle:i,listeners:n,doNotReject:!0,handleNumbers:t.handleNumbers});n.push.apply(n,a.concat(s,l)),e.cursor&&(F.style.cursor=getComputedStyle(e.target).cursor,f.length>1&&h(C,r.cssClasses.drag),F.addEventListener("selectstart",o,!1)),t.handleNumbers.forEach((function(e){be("start",e);}));}}function pe(e){e.stopPropagation();var t=ne(e.calcPoint),i=ae(t);!1!==i&&(r.events.snap||c(C,r.cssClasses.tap,r.animationDuration),Ne(i,t,!0,!0),Pe(),be("slide",i,!0),be("update",i,!0),r.events.snap?ce(e,{handleNumbers:[i]}):(be("change",i,!0),be("set",i,!0)));}function de(e){var t=ne(e.calcPoint),r=k.getStep(t),i=k.fromStepping(r);Object.keys(U).forEach((function(e){"hover"===e.split(".")[0]&&U[e].forEach((function(e){e.call(Te,i);}));}));}function fe(e,t){if($()||X(t))return !1;var i=["Left","Right"],n=["Down","Up"],o=["PageDown","PageUp"],a=["Home","End"];r.dir&&!r.ort?i.reverse():r.ort&&!r.dir&&(n.reverse(),o.reverse());var s,l=e.key.replace("Arrow",""),u=l===o[0],c=l===o[1],p=l===n[0]||l===i[0]||u,d=l===n[1]||l===i[1]||c,f=l===a[0],h=l===a[1];if(!(p||d||f||h))return !0;if(e.preventDefault(),d||p){var m=p?0:1,v=Oe(t)[m];if(null===v)return !1;!1===v&&(v=k.getDefaultStep(V[t],p,r.keyboardDefaultStep)),v*=c||u?r.keyboardPageMultiplier:r.keyboardMultiplier,v=Math.max(v,1e-7),v*=p?-1:1,s=A[t]+v;}else s=h?r.spectrum.xVal[r.spectrum.xVal.length-1]:r.spectrum.xVal[0];return Ne(t,k.toStepping(s),!0,!0),be("slide",t),be("update",t),be("change",t),be("set",t),!1}function he(e){e.fixed||f.forEach((function(e,t){re(P.start,e.children[0],ce,{handleNumbers:[t]});})),e.tap&&re(P.start,u,pe,{}),e.hover&&re(P.move,u,de,{hover:!0}),e.drag&&x.forEach((function(t,i){if(!1!==t&&0!==i&&i!==x.length-1){var n=f[i-1],o=f[i],a=[t],s=[n,o],l=[i-1,i];h(t,r.cssClasses.draggable),e.fixed&&(a.push(n.children[0]),a.push(o.children[0])),e.dragAll&&(s=f,l=M),a.forEach((function(e){re(P.start,e,ce,{handles:s,handleNumbers:l,connect:t});}));}}));}function me(e,t){U[e]=U[e]||[],U[e].push(t),"update"===e.split(".")[0]&&f.forEach((function(e,t){be("update",t);}));}function ve(e){return e===D.aria||e===D.tooltips}function ge(e){var t=e&&e.split(".")[0],r=t?e.substring(t.length):e;Object.keys(U).forEach((function(e){var i=e.split(".")[0],n=e.substring(i.length);t&&t!==i||r&&r!==n||ve(n)&&r!==n||delete U[e];}));}function be(e,t,i){Object.keys(U).forEach((function(n){var o=n.split(".")[0];e===o&&U[n].forEach((function(e){e.call(Te,A.map(r.format.to),t,A.slice(),i||!1,V.slice(),Te);}));}));}function ye(e,t,i,n,o,a,s){var l;return f.length>1&&!r.events.unconstrained&&(n&&t>0&&(l=k.getAbsoluteDistance(e[t-1],r.margin,!1),i=Math.max(i,l)),o&&t<f.length-1&&(l=k.getAbsoluteDistance(e[t+1],r.margin,!0),i=Math.min(i,l))),f.length>1&&r.limit&&(n&&t>0&&(l=k.getAbsoluteDistance(e[t-1],r.limit,!1),i=Math.min(i,l)),o&&t<f.length-1&&(l=k.getAbsoluteDistance(e[t+1],r.limit,!0),i=Math.max(i,l))),r.padding&&(0===t&&(l=k.getAbsoluteDistance(0,r.padding[0],!1),i=Math.max(i,l)),t===f.length-1&&(l=k.getAbsoluteDistance(100,r.padding[1],!0),i=Math.min(i,l))),s||(i=k.getStep(i)),!((i=p(i))===e[t]&&!a)&&i}function Se(e,t){var i=r.ort;return (i?t:e)+", "+(i?e:t)}function xe(e,t,i,n,o){var a=i.slice(),s=n[0],l=r.events.smoothSteps,u=[!e,e],c=[e,!e];n=n.slice(),e&&n.reverse(),n.length>1?n.forEach((function(e,r){var i=ye(a,e,a[e]+t,u[r],c[r],!1,l);!1===i?t=0:(t=i-a[e],a[e]=i);})):u=c=[!0];var p=!1;n.forEach((function(e,r){p=Ne(e,i[e]+t,u[r],c[r],!1,l)||p;})),p&&(n.forEach((function(e){be("update",e),be("slide",e);})),null!=o&&be("drag",s));}function we(e,t){return r.dir?100-e-t:e}function Ee(e,t){V[e]=t,A[e]=k.fromStepping(t);var i="translate("+Se(we(t,0)-T+"%","0")+")";f[e].style[r.transformRule]=i,Ce(e),Ce(e+1);}function Pe(){M.forEach((function(e){var t=V[e]>50?-1:1,r=3+(f.length+t*e);f[e].style.zIndex=String(r);}));}function Ne(e,t,r,i,n,o){return n||(t=ye(V,e,t,r,i,!1,o)),!1!==t&&(Ee(e,t),!0)}function Ce(e){if(x[e]){var t=0,i=100;0!==e&&(t=V[e-1]),e!==x.length-1&&(i=V[e]);var n=i-t,o="translate("+Se(we(t,n)+"%","0")+")",a="scale("+Se(n/100,"1")+")";x[e].style[r.transformRule]=o+" "+a;}}function ke(e,t){return null===e||!1===e||void 0===e?V[t]:("number"==typeof e&&(e=String(e)),!1!==(e=r.format.from(e))&&(e=k.toStepping(e)),!1===e||isNaN(e)?V[t]:e)}function Ae(e,t,i){var n=d(e),o=void 0===V[0];t=void 0===t||t,r.animate&&!o&&c(C,r.cssClasses.tap,r.animationDuration),M.forEach((function(e){Ne(e,ke(n[e],e),!0,!1,i);}));var a=1===M.length?0:1;if(o&&k.hasNoSize()&&(i=!0,V[0]=0,M.length>1)){var s=100/(M.length-1);M.forEach((function(e){V[e]=e*s;}));}for(;a<M.length;++a)M.forEach((function(e){Ne(e,V[e],!0,!0,i);}));Pe(),M.forEach((function(e){be("update",e),null!==n[e]&&t&&be("set",e);}));}function Ve(e){Ae(r.start,e);}function Me(e,t,r,i){if(!((e=Number(e))>=0&&e<M.length))throw new Error("noUiSlider: invalid handle number, got: "+e);Ne(e,ke(t,e),!0,!0,i),be("update",e),r&&be("set",e);}function Le(e){if(void 0===e&&(e=!1),e)return 1===A.length?A[0]:A.slice(0);var t=A.map(r.format.to);return 1===t.length?t[0]:t}function Ue(){for(ge(D.aria),ge(D.tooltips),Object.keys(r.cssClasses).forEach((function(e){m(C,r.cssClasses[e]);}));C.firstChild;)C.removeChild(C.firstChild);delete C.noUiSlider;}function Oe(e){var t=V[e],i=k.getNearbySteps(t),n=A[e],o=i.thisStep.step,a=null;if(r.snap)return [n-i.stepBefore.startValue||null,i.stepAfter.startValue-n||null];!1!==o&&n+o>i.stepAfter.startValue&&(o=i.stepAfter.startValue-n),a=n>i.thisStep.startValue?i.thisStep.step:!1!==i.stepBefore.step&&n-i.stepBefore.highestStep,100===t?o=null:0===t&&(a=null);var s=k.countStepDecimals();return null!==o&&!1!==o&&(o=Number(o.toFixed(s))),null!==a&&!1!==a&&(a=Number(a.toFixed(s))),[a,o]}function De(){return M.map(Oe)}function je(e,t){var i=Le(),o=["margin","limit","padding","range","animate","snap","step","format","pips","tooltips"];o.forEach((function(t){void 0!==e[t]&&(s[t]=e[t]);}));var a=oe(s);o.forEach((function(t){void 0!==e[t]&&(r[t]=a[t]);})),k=a.spectrum,r.margin=a.margin,r.limit=a.limit,r.padding=a.padding,r.pips?ee(r.pips):Z(),r.tooltips?I():Y(),V=[],Ae(n(e.start)?e.start:i,t);}function Fe(){u=B(C),R(r.connect,u),he(r.events),Ae(r.start),r.pips&&ee(r.pips),r.tooltips&&I(),W();}Fe();var Te={destroy:Ue,steps:De,on:me,off:ge,get:Le,set:Ae,setHandle:Me,reset:Ve,__moveHandles:function(e,t,r){xe(e,t,V,r);},options:s,updateOptions:je,target:C,removePips:Z,removeTooltips:Y,getPositions:function(){return V.slice()},getTooltips:function(){return E},getOrigins:function(){return f},pips:ee};return Te}function se(e,t){if(!e||!e.nodeName)throw new Error("noUiSlider: create requires a single element, got: "+e);if(e.noUiSlider)throw new Error("noUiSlider: Slider was already initialized.");var r=ae(e,oe(t),t);return e.noUiSlider=r,r}var le={__spectrum:L,cssClasses:O,create:se};e.create=se,e.cssClasses=O,e.default=le,Object.defineProperty(e,"__esModule",{value:!0});}(t);})));function h(e,t){if(!Array.isArray(e)||!Array.isArray(t))return !1;const r=t.slice().sort();return e.length===t.length&&e.slice().sort().every((function(e,t){return e===r[t]}))}var m={name:"Slider",emits:["input","update:modelValue","update","change"],props:{...{value:{validator:function(e){return e=>"number"==typeof e||e instanceof Array||null==e||!1===e},required:!1},modelValue:{validator:function(e){return e=>"number"==typeof e||e instanceof Array||null==e||!1===e},required:!1}},id:{type:[String,Number],required:!1},disabled:{type:Boolean,required:!1,default:!1},min:{type:Number,required:!1,default:0},max:{type:Number,required:!1,default:100},step:{type:Number,required:!1,default:1},orientation:{type:String,required:!1,default:"horizontal"},direction:{type:String,required:!1,default:"ltr"},tooltips:{type:Boolean,required:!1,default:!0},options:{type:Object,required:!1,default:()=>({})},merge:{type:Number,required:!1,default:-1},format:{type:[Object,Function,Boolean],required:!1,default:null},classes:{type:Object,required:!1,default:()=>({})},showTooltip:{type:String,required:!1,default:"always"},tooltipPosition:{type:String,required:!1,default:null},lazy:{type:Boolean,required:!1,default:!0},ariaLabelledby:{type:String,required:!1,default:void 0},aria:{required:!1,type:Object,default:()=>({})}},setup(a,s){const l=function(r,i,n){const{value:o,modelValue:a}=toRefs(r),s=a&&void 0!==a.value?a:o,l=ref(s.value);if(u(s.value))throw new Error("Slider v-model must be a Number or Array");if(Array.isArray(s.value)&&0==s.value.length)throw new Error("Slider v-model must not be an empty array");return {value:s,initialValue:l}}(a),c=function(t,i,n){const{classes:o,showTooltip:a,tooltipPosition:s,orientation:l}=toRefs(t),u=computed((()=>({target:"slider-target",focused:"slider-focused",tooltipFocus:"slider-tooltip-focus",tooltipDrag:"slider-tooltip-drag",ltr:"slider-ltr",rtl:"slider-rtl",horizontal:"slider-horizontal",vertical:"slider-vertical",textDirectionRtl:"slider-txt-dir-rtl",textDirectionLtr:"slider-txt-dir-ltr",base:"slider-base",connects:"slider-connects",connect:"slider-connect",origin:"slider-origin",handle:"slider-handle",handleLower:"slider-handle-lower",handleUpper:"slider-handle-upper",touchArea:"slider-touch-area",tooltip:"slider-tooltip",tooltipTop:"slider-tooltip-top",tooltipBottom:"slider-tooltip-bottom",tooltipLeft:"slider-tooltip-left",tooltipRight:"slider-tooltip-right",tooltipHidden:"slider-tooltip-hidden",active:"slider-active",draggable:"slider-draggable",tap:"slider-state-tap",drag:"slider-state-drag",pips:"slider-pips",pipsHorizontal:"slider-pips-horizontal",pipsVertical:"slider-pips-vertical",marker:"slider-marker",markerHorizontal:"slider-marker-horizontal",markerVertical:"slider-marker-vertical",markerNormal:"slider-marker-normal",markerLarge:"slider-marker-large",markerSub:"slider-marker-sub",value:"slider-value",valueHorizontal:"slider-value-horizontal",valueVertical:"slider-value-vertical",valueNormal:"slider-value-normal",valueLarge:"slider-value-large",valueSub:"slider-value-sub",...o.value})));return {classList:computed((()=>{const e={...u.value};return Object.keys(e).forEach((t=>{e[t]=Array.isArray(e[t])?e[t].filter((e=>null!==e)).join(" "):e[t];})),"always"!==a.value&&(e.target+=` ${"drag"===a.value?e.tooltipDrag:e.tooltipFocus}`),"horizontal"===l.value&&(e.tooltip+="bottom"===s.value?` ${e.tooltipBottom}`:` ${e.tooltipTop}`),"vertical"===l.value&&(e.tooltip+="right"===s.value?` ${e.tooltipRight}`:` ${e.tooltipLeft}`),e}))}}(a),p=function(t,i,n){const{format:o,step:a}=toRefs(t),s=n.value,l=n.classList,u=computed((()=>o&&o.value?"function"==typeof o.value?{to:o.value}:d({...o.value}):d({decimals:a.value>=0?0:2}))),c=computed((()=>Array.isArray(s.value)?s.value.map((e=>u.value)):u.value));return {tooltipFormat:u,tooltipsFormat:c,tooltipsMerge:(e,t,r)=>{var i="rtl"===getComputedStyle(e).direction,n="rtl"===e.noUiSlider.options.direction,o="vertical"===e.noUiSlider.options.orientation,a=e.noUiSlider.getTooltips(),s=e.noUiSlider.getOrigins();a.forEach((function(e,t){e&&s[t].appendChild(e);})),e.noUiSlider.on("update",(function(e,s,c,p,d){var f=[[]],h=[[]],m=[[]],v=0;a[0]&&(f[0][0]=0,h[0][0]=d[0],m[0][0]=u.value.to(parseFloat(e[0])));for(var g=1;g<e.length;g++)(!a[g]||e[g]-e[g-1]>t)&&(f[++v]=[],m[v]=[],h[v]=[]),a[g]&&(f[v].push(g),m[v].push(u.value.to(parseFloat(e[g]))),h[v].push(d[g]));f.forEach((function(e,t){for(var s=e.length,u=0;u<s;u++){var c=e[u];if(u===s-1){var p=0;h[t].forEach((function(e){p+=1e3-e;}));var d=o?"bottom":"right",f=n?0:s-1,v=1e3-h[t][f];p=(i&&!o?100:0)+p/s-v,a[c].innerHTML=m[t].join(r),a[c].style.display="block",a[c].style[d]=p+"%",l.value.tooltipHidden.split(" ").forEach((e=>{a[c].classList.contains(e)&&a[c].classList.remove(e);}));}else a[c].style.display="none",l.value.tooltipHidden.split(" ").forEach((e=>{a[c].classList.add(e);}));}}));}));}}}(a,0,{value:l.value,classList:c.classList}),m=function(a,s,l){const{orientation:c,direction:p,tooltips:d,step:m,min:v,max:g,merge:b,id:y,disabled:S,options:x,classes:w,format:E,lazy:P,ariaLabelledby:N,aria:C}=toRefs(a),k=l.value,A=l.initialValue,V=l.tooltipsFormat,M=l.tooltipsMerge,L=l.tooltipFormat,U=l.classList,O=ref(null),D=ref(null),j=ref(!1),F=computed((()=>{let e={cssPrefix:"",cssClasses:U.value,orientation:c.value,direction:p.value,tooltips:!!d.value&&V.value,connect:"lower",start:u(k.value)?v.value:k.value,range:{min:v.value,max:g.value}};if(m.value>0&&(e.step=m.value),Array.isArray(k.value)&&(e.connect=!0),N&&N.value||C&&Object.keys(C.value).length){let t=Array.isArray(k.value)?k.value:[k.value];e.handleAttributes=t.map((e=>Object.assign({},C.value,N&&N.value?{"aria-labelledby":N.value}:{})));}return E.value&&(e.ariaFormat=L.value),e})),T=computed((()=>{let e={id:y&&y.value?y.value:void 0};return S.value&&(e.disabled=!0),e})),z=computed((()=>Array.isArray(k.value))),H=()=>{let e=D.value.get();return Array.isArray(e)?e.map((e=>parseFloat(e))):parseFloat(e)},q=function(e){let t=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];D.value.set(e,t);},R=e=>{s.emit("input",e),s.emit("update:modelValue",e),s.emit("update",e);},B=()=>{D.value=f.create(O.value,Object.assign({},F.value,x.value)),d.value&&z.value&&b.value>=0&&M(O.value,b.value," - "),D.value.on("set",(e=>{const t=H();s.emit("change",t),P.value&&R(t);})),D.value.on("update",(e=>{if(!j.value)return;const t=H();z.value&&h(k.value,t)||!z.value&&k.value==t?s.emit("update",t):P.value||R(t);})),O.value.querySelectorAll("[data-handle]").forEach((e=>{e.onblur=()=>{U.value.focused.split(" ").forEach((e=>{O.value.classList.remove(e);}));},e.onfocus=()=>{U.value.focused.split(" ").forEach((e=>{O.value.classList.add(e);}));};})),j.value=!0;},_=()=>{D.value.off(),D.value.destroy(),D.value=null;},$=(e,t)=>{j.value=!1,_(),B();};return onMounted(B),onUnmounted(_),watch(k,((e,t)=>{t&&("object"==typeof t&&"object"==typeof e&&e&&Object.keys(t)>Object.keys(e)||"object"==typeof t&&"object"!=typeof e||!e)&&$();}),{immediate:!1}),watch(z,$,{immediate:!1}),watch(v,$,{immediate:!1}),watch(g,$,{immediate:!1}),watch(m,$,{immediate:!1}),watch(c,$,{immediate:!1}),watch(p,$,{immediate:!1}),watch(d,$,{immediate:!1}),watch(b,$,{immediate:!1}),watch(E,$,{immediate:!1,deep:!0}),watch(x,$,{immediate:!1,deep:!0}),watch(w,$,{immediate:!1,deep:!0}),watch(k,(e=>{if(u(e))return void q(v.value,!1);let t=H();z.value&&!Array.isArray(t)&&(t=[t]),(z.value&&!h(e,t)||!z.value&&e!=t)&&q(e,!1);}),{deep:!0}),{slider:O,slider$:D,isRange:z,sliderProps:T,init:B,destroy:_,refresh:$,update:q,reset:()=>{R(A.value);}}}(a,s,{value:l.value,initialValue:l.initialValue,tooltipFormat:p.tooltipFormat,tooltipsFormat:p.tooltipsFormat,tooltipsMerge:p.tooltipsMerge,classList:c.classList});return {...c,...p,...m}}};m.render=function(e,t,r,i,n,o){return openBlock(),createElementBlock("div",mergeProps(e.sliderProps,{ref:"slider"}),null,16)},m.__file="src/Slider.vue";

const _hoisted_1$3 = { class: "py-2 px-10 text-gray-700 dark:text-white" };
const _hoisted_2$3 = /*#__PURE__*/createBaseVNode("p", null, " ", -1);

const _sfc_main$3 = {
  __name: 'FooterSlot',
  setup(__props) {

const { totalPages, currentPage, set } = usePagination;

function format() {
	return `${currentPage.value} de ${totalPages.value}`
}


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", _hoisted_1$3, [
    renderSlot(_ctx.$slots, "footer", {}, () => [
      _hoisted_2$3
    ]),
    createVNode(unref(m), {
      modelValue: unref(currentPage),
      "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => (unref(set)(Math.round($event)))),
      min: 1,
      max: unref(totalPages),
      step: -1,
      showTooltip: "drag",
      format: format,
      lazy: false,
      class: "w-full"
    }, null, 8, ["modelValue", "max"])
  ]))
}
}

};

const _sfc_main$2 = {};

const _hoisted_1$2 = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  stroke: "currentColor"
};
const _hoisted_2$2 = /*#__PURE__*/createBaseVNode("path", {
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
  "stroke-width": "2",
  d: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
}, null, -1);
const _hoisted_3$1 = [
  _hoisted_2$2
];

function _sfc_render(_ctx, _cache) {
  return (openBlock(), createElementBlock("svg", _hoisted_1$2, _hoisted_3$1))
}
const IconNotes = /*#__PURE__*/_export_sfc(_sfc_main$2, [['render',_sfc_render]]);

const FootnotesAside_vue_vue_type_style_index_0_scoped_5391e486_lang = '';

const _hoisted_1$1 = {
  key: 0,
  id: "asidebar",
  class: "absolute top-0 right-0 w-96 md:w-[40em] flex-shrink-0 h-screen overflow-auto overflow-x-hidden z-20 shadow-2xl"
};
const _hoisted_2$1 = { class: "w-full p-4" };
const _hoisted_3 = { class: "text-areia py-4 pl-4" };
const _hoisted_4 = { class: "flex items-center mb-6" };
const _hoisted_5 = { class: "ml-4" };
const _hoisted_6 = /*#__PURE__*/createTextVNode(" Notas de rodapé ");
const _hoisted_7 = { class: "ml-10" };
const _hoisted_8 = ["id", "innerHTML"];


const _sfc_main$1 = {
  __name: 'FootnotesAside',
  setup(__props) {

const show = computed(() => useFootnotes.footnote.value);
const footnote = computed(() => useFootnotes.footnote.value);
const showFootnotes = computed(() => useFootnotes.showFootnotes.value);
const footnotes = computed(() => useFootnotes.footnotes.value);

const oldBlockedValue = ref(null);
const footnoteList = ref(null);

function hideAside() {
	useFootnotes.setHighlightedFootnote(null);
	useFootnotes.setShowFootnotes(false);
}

onKeyStroke('Escape', () => {
	if (footnote.value || showFootnotes.value) {
		hideAside();
	}
});

watch(
	[footnote, showFootnotes],
	() => {
		if (footnote.value || showFootnotes.value) {
			if (useReaderSettings.blocked.value === false) {
				oldBlockedValue.value = useReaderSettings.blocked.value;
			}
			useReaderSettings.setBlocked(true);

		} else {
			if (oldBlockedValue.value === false) {
				useReaderSettings.setBlocked(oldBlockedValue.value);
			}
			oldBlockedValue.value = null;
		}

		if (footnote.value) {
			setTimeout(() => {
				const element = footnoteList.value.querySelector(`#${footnote.value.id}`);
				element.scrollIntoView();
				element.focus();
			}, 50);
		}
	}
);


return (_ctx, _cache) => {
  return (openBlock(), createBlock(Transition, { name: "width" }, {
    default: withCtx(() => [
      (unref(show) || unref(showFootnotes))
        ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
            createBaseVNode("button", {
              onClick: _cache[0] || (_cache[0] = withModifiers($event => (hideAside()), ["prevent"])),
              class: "fixed top-4 right-8 z-20"
            }, [
              createVNode(IconClose, { class: "w-6 h-6 text-white" })
            ]),
            createBaseVNode("div", _hoisted_2$1, [
              createBaseVNode("header", _hoisted_3, [
                createBaseVNode("div", _hoisted_4, [
                  createVNode(IconNotes, { class: "w-8 h-8" }),
                  createBaseVNode("span", _hoisted_5, [
                    _hoisted_6,
                    createBaseVNode("span", _hoisted_7, toDisplayString(unref(footnotes).length), 1)
                  ])
                ])
              ]),
              createBaseVNode("section", null, [
                createBaseVNode("ul", {
                  ref_key: "footnoteList",
                  ref: footnoteList
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(unref(footnotes), (footnoteItem, index) => {
                    return (openBlock(), createElementBlock("li", {
                      key: footnoteItem.id,
                      id: footnoteItem.id,
                      innerHTML: `<span class='footnote-index'>${index + 1}.</span> ${footnoteItem.text}`,
                      class: normalizeClass(["text-left border-b border-b-white/25 last:border-transparent p-10 relative", unref(footnote) && unref(footnote).id !== footnoteItem.id
								? 'opacity-50'
								: 'opacity-100'
							])
                    }, null, 10, _hoisted_8))
                  }), 128))
                ], 512)
              ])
            ])
          ]))
        : createCommentVNode("", true)
    ]),
    _: 1
  }))
}
}

};
const FootnotesAside = /*#__PURE__*/_export_sfc(_sfc_main$1, [['__scopeId',"data-v-5391e486"]]);

const _style_0 = ".border-primary { border-color: var(--theme-primary, #690000);\n}\n.text-primary { color: var(--theme-primary, #690000);\n}\n.bg-primary { background-color: var(--theme-primary, #690000);\n}\n.border-primary-extralight { border-color: var(--theme-primary-extralight, #f3f4f6);\n}\n.text-primary-extralight { color: var(--theme-primary-extralight, #f3f4f6);\n}\n.bg-primary-extralight { background-color: var(--theme-primary-extralight, #f3f4f6);\n}\n.border-secondary { border-color: var(--theme-secondary, #ffa03c);\n}\n.text-secondary { color: var(--theme-secondary, #ffa03c);\n}\n.bg-secondary { background-color: var(--theme-secondary, #ffa03c);\n}\n.rootWrapper {\r\n\tmax-height: 100%;\r\n    height: 100%;\n}\nmain#rootComponent {\r\n\theight: 100%;\r\n\tmax-height: 100%;\n}\nmain#rootComponent.light {\r\n\t\tbackground-color: var(--bg-light-mode, #fff7e0)\n}\nmain#rootComponent.dark {\r\n\t\tbackground-color: var(--bg-dark-mode, #2d2d2d);\n}\nmain#rootComponent.dark #content-area {\r\n\t\t\tcolor: #fff\n}\nheader.wrapper {\r\n\twidth: 200px;\r\n\tmargin: 0 auto;\n}\n#engine {\r\n\theight: calc(100% - 8.4rem);\r\n\tposition: relative;\r\n    right: 0;\r\n    left: 0;\r\n    bottom: 0;\r\n    width: 100%;\n}\n.rootWrapper.safari {\r\n\tmax-height: initial;\r\n\theight: initial;\n}\n.rootWrapper.safari #engine {\r\n\theight: auto !important;\n}\n#reader-component {\r\n\twidth: 100%;\n}\n.typeArea {\r\n\twidth: 100%;\n}\n.engineWrapper {\r\n\theight: 100%;\r\n    display: flex;\r\n    justify-content: space-between;\r\n\tposition: relative;\r\n    right: 0;\r\n    left: 0;\r\n    bottom: 0;\r\n    width: 100%;\n}\n.rootWrapper:not(.safari) .columns-double .columnsArea {\r\n\t-moz-column-count: 2;\r\n    column-count: 2;\r\n    grid-column-gap: 0;\r\n    -moz-column-gap: 0;\r\n    column-gap: 0;\r\n    height: 100%;\r\n    padding: 0;\r\n    width: 100%;\n}\n@media only screen and (max-width: 1020px) {\n.rootWrapper:not(.safari) .columns-double .columnsArea {\r\n\t\t-moz-column-count: 1;\r\n    \tcolumn-count: 1\n}\n}\n.rootWrapper:not(.safari) .columns-single .columnsArea {\r\n\t-moz-column-count: 1;\r\n\t     column-count: 1;\r\n\t-moz-column-gap: 0;\r\n\t     column-gap: 0;\r\n\theight: 100%;\r\n    padding: 0;\r\n    width: 100%;\n}\n.rootWrapper:not(.safari) .columns-single .columnsArea #content-area {\r\n\t\tmax-width: 37em;\r\n\t\tmargin: 0 auto;\n}\n.nav-prev { left: 0px;\n}\n.nav-next { right: 0px;\n}\n.viewer-nav {\r\n\theight: 100%;\r\n\tposition: relative;\r\n\ttop: 0px;\r\n\tbottom: 0px;\r\n\tz-index: 10;\r\n\twidth: 2.5rem;\r\n\tflex-shrink: 0;\r\n\tcursor: pointer;\r\n\talign-self: center;\r\n\ttransition-property: color, background-color, border-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-text-decoration-color, -webkit-backdrop-filter;\r\n\ttransition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\r\n\ttransition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-text-decoration-color, -webkit-backdrop-filter;\r\n\ttransition-duration: 500ms;\r\n\ttransition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n}\n.viewer-nav:focus,\r\n\t.viewer-nav:active {\r\n\t\tborder: none !important;\r\n\t\tbox-shadow: none !important;\r\n\t\toutline-color: transparent !important;\n}\n#content-area *::-moz-selection {\r\n\tcolor: var(--theme-primary-extralight, #690000);\r\n\tbackground: var(--theme-secondary, #ffa03c);\n}\n#content-area *::selection {\r\n\tcolor: var(--theme-primary-extralight, #690000);\r\n\tbackground: var(--theme-secondary, #ffa03c);\n}\n.viewer-nav-icon { opacity: 0;\n}\n@media (min-width: 768px) {\n.viewer-nav-icon { opacity: 0.8;\n}\n}\n@media only screen and (max-width: 600px) {\n.columnsArea {\r\n\t\ttransition: margin 100ms\n}\n}\n#asidebar {\r\n\tbackground: var(--sidebar-backgorund, #690000);\r\n\tcolor: var(--sidebar-text, #f3f4f6);\n}\r\n\r\n/* slider */\n.rootWrapper.safari .slider-target,\r\n.rootWrapper.safari .slider-target *{\r\n\tdisplay: none !important;\n}\n.slider-target,.slider-target *{\r\n    -webkit-touch-callout:none;\r\n    -webkit-tap-highlight-color:rgba(0,0,0,0);\r\n    box-sizing:border-box;\r\n    touch-action:none;\r\n    -webkit-user-select:none;\r\n    -moz-user-select:none;\r\n    user-select:none\n}\n.slider-target{\r\n    position:relative\n}\n.slider-base,.slider-connects{\r\n    height:100%;\r\n    position:relative;\r\n    width:100%;\r\n    z-index:1\n}\n.slider-connects{\r\n    overflow:hidden;\r\n    z-index:0\n}\n.slider-connect,.slider-origin{\r\n    height:100%;\r\n    position:absolute;\r\n    right:0;\r\n    top:0;\r\n    transform-origin:0 0;\r\n    transform-style:flat;\r\n    width:100%;\r\n    will-change:transform;\r\n    z-index:1\n}\n.slider-txt-dir-rtl.slider-horizontal .slider-origin{\r\n    left:0;\r\n    right:auto\n}\n.slider-vertical .slider-origin{\r\n    top:-100%;\r\n    width:0\n}\n.slider-horizontal .slider-origin{\r\n    height:0\n}\n.slider-handle{\r\n    -webkit-backface-visibility:hidden;\r\n    backface-visibility:hidden;\r\n    position:absolute\n}\n.slider-touch-area{\r\n    height:100%;\r\n    width:100%\n}\n.slider-state-tap .slider-connect,.slider-state-tap .slider-origin{\r\n    transition:transform .3s\n}\n.slider-state-drag *{\r\n    cursor:inherit!important\n}\n.slider-tooltip-drag .slider-tooltip,.slider-tooltip-focus .slider-tooltip{\r\n    display:none!important\n}\n.slider-tooltip-drag .slider-active .slider-tooltip,.slider-tooltip-drag.slider-state-drag .slider-tooltip:not(.slider-tooltip-hidden),.slider-tooltip-focus.slider-focused .slider-tooltip:not(.slider-tooltip-hidden){\r\n    display:block!important\n}\n.slider-horizontal{\r\n    height:var(--slider-height,6px)\n}\n.slider-horizontal .slider-handle{\r\n    height:var(--slider-handle-height,16px);\r\n    right:calc(var(--slider-handle-width, 16px)/2*-1);\r\n    top:calc((var(--slider-handle-height, 16px) - var(--slider-height, 6px))/2*-1 + -1px);\r\n    width:var(--slider-handle-width,16px)\n}\n.slider-vertical{\r\n    height:var(--slider-vertical-height,300px);\r\n    width:var(--slider-height,6px)\n}\n.slider-vertical .slider-handle{\r\n    bottom:calc(var(--slider-handle-width, 16px)/2*-1);\r\n    height:var(--slider-handle-width,16px);\r\n    right:calc((var(--slider-handle-height, 16px) - var(--slider-height, 6px))/2*-1 + -1px);\r\n    width:var(--slider-handle-height,16px)\n}\n.slider-txt-dir-rtl.slider-horizontal .slider-handle{\r\n    left:calc(var(--slider-handle-width, 16px)/2*-1);\r\n    right:auto\n}\n.slider-base{\r\n    background-color:var(--slider-bg,#d1d5db)\n}\n.slider-base,.slider-connects{\r\n    border-radius:var(--slider-radius,9999px)\n}\n.slider-connect{\r\n    background:var(--theme-secondary, #690000);\r\n    cursor:pointer\n}\n.slider-draggable{\r\n    cursor:ew-resize\n}\n.slider-vertical .slider-draggable{\r\n    cursor:ns-resize\n}\n.slider-handle{\r\n    background:var(--slider-handle-bg,#fff);\r\n    border:var(--slider-handle-border,0);\r\n    border-radius:var(--slider-handle-radius,9999px);\r\n    box-shadow:var(--slider-handle-shadow,.5px .5px 2px 1px rgba(0,0,0,.32));\r\n    cursor:-webkit-grab;\r\n    cursor:grab;\r\n    height:var(--slider-handle-height,16px);\r\n    width:var(--slider-handle-width,16px)\n}\n.slider-handle:focus{\r\n    box-shadow:0 0 0 var(--slider-handle-ring-width,3px) var(--slider-handle-ring-color,rgba(16,185,129,.188)),var(--slider-handle-shadow,.5px .5px 2px 1px rgba(0,0,0,.32));\r\n    outline:none\n}\n.slider-active{\r\n    box-shadow:var(--slider-handle-shadow-active,.5px .5px 2px 1px rgba(0,0,0,.42));\r\n    cursor:-webkit-grabbing;\r\n    cursor:grabbing\n}\n[disabled] .slider-connect{\r\n    background:var(--slider-connect-bg-disabled,#9ca3af)\n}\n[disabled] .slider-handle,[disabled].slider-handle,[disabled].slider-target{\r\n    cursor:not-allowed\n}\n[disabled] .slider-tooltip{\r\n    background:var(--theme-secondary, #690000);\r\n    border-color:var(--theme-secondary, #690000);\r\n\topacity: 0.5;\n}\n.slider-tooltip{\r\n    background:var(--theme-secondary, #690000);\r\n    border:1px solid var(--theme-secondary, #690000);\r\n    border-radius:var(--slider-tooltip-radius,5px);\r\n    color:var(--slider-tooltip-color,#fff);\r\n    display:block;\r\n    font-size:var(--slider-tooltip-font-size,.875rem);\r\n    font-weight:var(--slider-tooltip-font-weight,600);\r\n    line-height:var(--slider-tooltip-line-height,1.25rem);\r\n    min-width:var(--slider-tooltip-min-width,20px);\r\n    padding:var(--slider-tooltip-py,2px) var(--slider-tooltip-px,6px);\r\n    position:absolute;\r\n    text-align:center;\r\n    white-space:nowrap\n}\n.slider-horizontal .slider-tooltip-top{\r\n    bottom:calc(var(--slider-handle-height, 16px) + var(--slider-tooltip-arrow-size, 5px) + var(--slider-tooltip-distance, 3px));\r\n    left:50%;\r\n    transform:translate(-50%)\n}\n.slider-horizontal .slider-tooltip-top:before{\r\n    border:var(--slider-tooltip-arrow-size,5px) solid transparent;\r\n    border-top-color:inherit;\r\n    bottom:calc(var(--slider-tooltip-arrow-size, 5px)*-2);\r\n    content:\"\";\r\n    height:0;\r\n    left:50%;\r\n    position:absolute;\r\n    transform:translate(-50%);\r\n    width:0\n}\n.slider-horizontal .slider-tooltip-bottom{\r\n    left:50%;\r\n    top:calc(var(--slider-handle-height, 16px) + var(--slider-tooltip-arrow-size, 5px) + var(--slider-tooltip-distance, 3px));\r\n    transform:translate(-50%)\n}\n.slider-horizontal .slider-tooltip-bottom:before{\r\n    border:var(--slider-tooltip-arrow-size,5px) solid transparent;\r\n    border-bottom-color:inherit;\r\n    content:\"\";\r\n    height:0;\r\n    left:50%;\r\n    position:absolute;\r\n    top:calc(var(--slider-tooltip-arrow-size, 5px)*-2);\r\n    transform:translate(-50%);\r\n    width:0\n}\n.slider-vertical .slider-tooltip-left{\r\n    right:calc(var(--slider-handle-height, 16px) + var(--slider-tooltip-arrow-size, 5px) + var(--slider-tooltip-distance, 3px));\r\n    top:50%;\r\n    transform:translateY(-50%)\n}\n.slider-vertical .slider-tooltip-left:before{\r\n    border:var(--slider-tooltip-arrow-size,5px) solid transparent;\r\n    border-left-color:inherit;\r\n    content:\"\";\r\n    height:0;\r\n    position:absolute;\r\n    right:calc(var(--slider-tooltip-arrow-size, 5px)*-2);\r\n    top:50%;\r\n    transform:translateY(-50%);\r\n    width:0\n}\n.slider-vertical .slider-tooltip-right{\r\n    left:calc(var(--slider-handle-height, 16px) + var(--slider-tooltip-arrow-size, 5px) + var(--slider-tooltip-distance, 3px));\r\n    top:50%;\r\n    transform:translateY(-50%)\n}\n.slider-vertical .slider-tooltip-right:before{\r\n    border:var(--slider-tooltip-arrow-size,5px) solid transparent;\r\n    border-right-color:inherit;\r\n    content:\"\";\r\n    height:0;\r\n    left:calc(var(--slider-tooltip-arrow-size, 5px)*-2);\r\n    position:absolute;\r\n    top:50%;\r\n    transform:translateY(-50%);\r\n    width:0\n}\n.slider-horizontal .slider-origin>.slider-tooltip{\r\n    left:auto;\r\n    transform:translate(50%)\n}\n.slider-horizontal .slider-origin>.slider-tooltip-top{\r\n    bottom:calc(var(--slider-tooltip-arrow-size, 5px) + (var(--slider-handle-height, 16px) - var(--slider-height, 6px))/2 + var(--slider-tooltip-distance, 3px) + 1px)\n}\n.slider-horizontal .slider-origin>.slider-tooltip-bottom{\r\n    top:calc(var(--slider-tooltip-arrow-size, 5px) + (var(--slider-handle-height, 16px) - var(--slider-height, 6px))/2 + var(--slider-tooltip-distance, 3px) + var(--slider-height, 6px) - 1px)\n}\n.slider-vertical .slider-origin>.slider-tooltip{\r\n    top:auto;\r\n    transform:translateY(calc((var(--slider-tooltip-line-height, 1.25rem) - var(--slider-tooltip-py, 2px))*-1 + 1px))\n}\n.slider-vertical .slider-origin>.slider-tooltip-left{\r\n    right:calc(var(--slider-tooltip-arrow-size, 5px) + var(--slider-height, 6px) + (var(--slider-handle-height, 16px) - var(--slider-height, 6px))/2 + var(--slider-tooltip-distance, 3px) - 1px)\n}\n.slider-vertical .slider-origin>.slider-tooltip-right{\r\n    left:calc(var(--slider-tooltip-arrow-size, 5px) + var(--slider-height, 6px) + (var(--slider-handle-height, 16px) - var(--slider-height, 6px))/2 + var(--slider-tooltip-distance, 3px) - var(--slider-height, 6px) + 1px)\n}\r\n\r\n";

const _hoisted_1 = { class: "text-white text-center text-sm" };
const _hoisted_2 = { class: "text-white text-center text-xs" };


const _sfc_main = {
  __name: 'App.ce',
  props: {
	bookTitle: String,
	bookContent: String,
	readerSettings: String,
	readerBlocked: Boolean,
	rootClass: {
		type: String,
		default: ''
	},
	cssFile: String,
	cssString: String
},
  setup(__props) {

const props = __props;



const { baseFont, bookTitle, chapterTitle, textFont, fontSize, columns, setColumns, mode } = useReaderSettings;
const { currentPage, totalPages } = usePagination;
const { content, listenToClicks } = useTextContent;
const { width, height } = useWindowSize();

const readerComponent = ref(null);
const contentArea = ref(null);
const rootComponent = ref(null);

onMounted(async () => {
	usePagination.init(readerComponent, contentArea);
	useReaderSettings.initSettings(props.readerSettings);
	useStyles.initStyles(props, rootComponent);

	if (['string', 'boolean'].includes(typeof props.readerBlocked)) {
		useReaderSettings.setBlocked(props.readerBlocked);
	}

});

watch(
	props,
	() => {
		if (props.hasOwnProperty('readerBlocked')) {
			const readerBlocked = typeof props.readerBlocked === 'boolean'
				? props.readerBlocked
				: props.readerBlocked === 'true';
			useReaderSettings.setBlocked(readerBlocked);
		}
	}
);

watchDebounced(
	[width, height, content, columns, fontSize, textFont],
	() => {
		if (width.value < 1024 && columns.value === 'double')
			setColumns('single');
		else
			useEstimatePages.estimate(readerComponent, contentArea);
	},
	{ debounce: 125, maxWait: 250 }
);

watchDebounced(content,
	() => listenToClicks(contentArea),
	{ debounce: 125, maxWait: 250 }
);


return (_ctx, _cache) => {
  return (openBlock(), createElementBlock("div", {
    class: normalizeClass(["rootWrapper", unref(useBrowser).isSafari ? 'safari' : ''])
  }, [
    createBaseVNode("main", {
      id: "rootComponent",
      ref_key: "rootComponent",
      ref: rootComponent,
      class: normalizeClass(unref(mode)
				.concat(` ${props.rootClass}`)
				.concat(` currentPage-${unref(currentPage)}`)
				.concat(` totalPages-${unref(totalPages)}`)
				.concat(` columns-${unref(columns)}`)
			),
      style: normalizeStyle(`font-family: ${unref(baseFont)}`)
    }, [
      createVNode(_sfc_main$9, null, {
        header: withCtx(() => [
          renderSlot(_ctx.$slots, "header", {}, () => [
            createBaseVNode("p", _hoisted_1, toDisplayString(props.bookTitle || unref(bookTitle)), 1),
            createBaseVNode("p", _hoisted_2, toDisplayString(props.chapterTitle || unref(chapterTitle)), 1)
          ])
        ]),
        summaryTop: withCtx(() => [
          renderSlot(_ctx.$slots, "summaryTop")
        ]),
        summaryBottom: withCtx(() => [
          renderSlot(_ctx.$slots, "summaryBottom")
        ]),
        optionsTop: withCtx(() => [
          renderSlot(_ctx.$slots, "optionsTop")
        ]),
        optionsBottom: withCtx(() => [
          renderSlot(_ctx.$slots, "optionsBottom")
        ]),
        _: 3
      }),
      createVNode(_sfc_main$6, null, {
        default: withCtx(() => [
          createBaseVNode("div", {
            id: "reader-component",
            ref_key: "readerComponent",
            ref: readerComponent
          }, [
            createVNode(_sfc_main$5, null, {
              default: withCtx(() => [
                createBaseVNode("section", {
                  id: "content-area",
                  ref_key: "contentArea",
                  ref: contentArea,
                  style: normalizeStyle(`font-family: ${unref(textFont)}; font-size: ${unref(fontSize)}px`)
                }, [
                  createVNode(_sfc_main$8, { bookContent: __props.bookContent }, {
                    content: withCtx(() => [
                      renderSlot(_ctx.$slots, "content")
                    ]),
                    _: 3
                  }, 8, ["bookContent"])
                ], 4)
              ]),
              _: 3
            })
          ], 512)
        ]),
        _: 3
      }),
      createVNode(_sfc_main$3, {
        currPage: unref(currentPage),
        totalPages: unref(totalPages)
      }, null, 8, ["currPage", "totalPages"]),
      createVNode(_sfc_main$4)
    ], 6),
    createVNode(FootnotesAside)
  ], 2))
}
}

};
const App = /*#__PURE__*/_export_sfc(_sfc_main, [['styles',[_style_0]]]);

const tailwindStyles = "/*\n! tailwindcss v3.1.8 | MIT License | https://tailwindcss.com\n*/\n\n/*\n1. Prevent padding and border from affecting element width. (https://github.com/mozdevs/cssremedy/issues/4)\n2. Allow adding a border to an element by just adding a border-width. (https://github.com/tailwindcss/tailwindcss/pull/116)\n*/\n\n*,\n::before,\n::after {\n  box-sizing: border-box;\n  /* 1 */\n  border-width: 0;\n  /* 2 */\n  border-style: solid;\n  /* 2 */\n  border-color: #e5e7eb;\n  /* 2 */\n}\n\n::before,\n::after {\n  --tw-content: '';\n}\n\n/*\n1. Use a consistent sensible line-height in all browsers.\n2. Prevent adjustments of font size after orientation changes in iOS.\n3. Use a more readable tab size.\n4. Use the user's configured `sans` font-family by default.\n*/\n\nhtml {\n  line-height: 1.5;\n  /* 1 */\n  -webkit-text-size-adjust: 100%;\n  /* 2 */\n  -moz-tab-size: 4;\n  /* 3 */\n  -o-tab-size: 4;\n     tab-size: 4;\n  /* 3 */\n  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif, \"Apple Color Emoji\", \"Segoe UI Emoji\", \"Segoe UI Symbol\", \"Noto Color Emoji\";\n  /* 4 */\n}\n\n/*\n1. Remove the margin in all browsers.\n2. Inherit line-height from `html` so users can set them as a class directly on the `html` element.\n*/\n\nbody {\n  margin: 0;\n  /* 1 */\n  line-height: inherit;\n  /* 2 */\n}\n\n/*\n1. Add the correct height in Firefox.\n2. Correct the inheritance of border color in Firefox. (https://bugzilla.mozilla.org/show_bug.cgi?id=190655)\n3. Ensure horizontal rules are visible by default.\n*/\n\nhr {\n  height: 0;\n  /* 1 */\n  color: inherit;\n  /* 2 */\n  border-top-width: 1px;\n  /* 3 */\n}\n\n/*\nAdd the correct text decoration in Chrome, Edge, and Safari.\n*/\n\nabbr:where([title]) {\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n}\n\n/*\nRemove the default font size and weight for headings.\n*/\n\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  font-size: inherit;\n  font-weight: inherit;\n}\n\n/*\nReset links to optimize for opt-in styling instead of opt-out.\n*/\n\na {\n  color: inherit;\n  text-decoration: inherit;\n}\n\n/*\nAdd the correct font weight in Edge and Safari.\n*/\n\nb,\nstrong {\n  font-weight: bolder;\n}\n\n/*\n1. Use the user's configured `mono` font family by default.\n2. Correct the odd `em` font sizing in all browsers.\n*/\n\ncode,\nkbd,\nsamp,\npre {\n  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n  /* 1 */\n  font-size: 1em;\n  /* 2 */\n}\n\n/*\nAdd the correct font size in all browsers.\n*/\n\nsmall {\n  font-size: 80%;\n}\n\n/*\nPrevent `sub` and `sup` elements from affecting the line height in all browsers.\n*/\n\nsub,\nsup {\n  font-size: 75%;\n  line-height: 0;\n  position: relative;\n  vertical-align: baseline;\n}\n\nsub {\n  bottom: -0.25em;\n}\n\nsup {\n  top: -0.5em;\n}\n\n/*\n1. Remove text indentation from table contents in Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=999088, https://bugs.webkit.org/show_bug.cgi?id=201297)\n2. Correct table border color inheritance in all Chrome and Safari. (https://bugs.chromium.org/p/chromium/issues/detail?id=935729, https://bugs.webkit.org/show_bug.cgi?id=195016)\n3. Remove gaps between table borders by default.\n*/\n\ntable {\n  text-indent: 0;\n  /* 1 */\n  border-color: inherit;\n  /* 2 */\n  border-collapse: collapse;\n  /* 3 */\n}\n\n/*\n1. Change the font styles in all browsers.\n2. Remove the margin in Firefox and Safari.\n3. Remove default padding in all browsers.\n*/\n\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  font-family: inherit;\n  /* 1 */\n  font-size: 100%;\n  /* 1 */\n  font-weight: inherit;\n  /* 1 */\n  line-height: inherit;\n  /* 1 */\n  color: inherit;\n  /* 1 */\n  margin: 0;\n  /* 2 */\n  padding: 0;\n  /* 3 */\n}\n\n/*\nRemove the inheritance of text transform in Edge and Firefox.\n*/\n\nbutton,\nselect {\n  text-transform: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Remove default button styles.\n*/\n\nbutton,\n[type='button'],\n[type='reset'],\n[type='submit'] {\n  -webkit-appearance: button;\n  /* 1 */\n  background-color: transparent;\n  /* 2 */\n  background-image: none;\n  /* 2 */\n}\n\n/*\nUse the modern Firefox focus style for all focusable elements.\n*/\n\n:-moz-focusring {\n  outline: auto;\n}\n\n/*\nRemove the additional `:invalid` styles in Firefox. (https://github.com/mozilla/gecko-dev/blob/2f9eacd9d3d995c937b4251a5557d95d494c9be1/layout/style/res/forms.css#L728-L737)\n*/\n\n:-moz-ui-invalid {\n  box-shadow: none;\n}\n\n/*\nAdd the correct vertical alignment in Chrome and Firefox.\n*/\n\nprogress {\n  vertical-align: baseline;\n}\n\n/*\nCorrect the cursor style of increment and decrement buttons in Safari.\n*/\n\n::-webkit-inner-spin-button,\n::-webkit-outer-spin-button {\n  height: auto;\n}\n\n/*\n1. Correct the odd appearance in Chrome and Safari.\n2. Correct the outline style in Safari.\n*/\n\n[type='search'] {\n  -webkit-appearance: textfield;\n  /* 1 */\n  outline-offset: -2px;\n  /* 2 */\n}\n\n/*\nRemove the inner padding in Chrome and Safari on macOS.\n*/\n\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n\n/*\n1. Correct the inability to style clickable types in iOS and Safari.\n2. Change font properties to `inherit` in Safari.\n*/\n\n::-webkit-file-upload-button {\n  -webkit-appearance: button;\n  /* 1 */\n  font: inherit;\n  /* 2 */\n}\n\n/*\nAdd the correct display in Chrome and Safari.\n*/\n\nsummary {\n  display: list-item;\n}\n\n/*\nRemoves the default spacing and border for appropriate elements.\n*/\n\nblockquote,\ndl,\ndd,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\nhr,\nfigure,\np,\npre {\n  margin: 0;\n}\n\nfieldset {\n  margin: 0;\n  padding: 0;\n}\n\nlegend {\n  padding: 0;\n}\n\nol,\nul,\nmenu {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n}\n\n/*\nPrevent resizing textareas horizontally by default.\n*/\n\ntextarea {\n  resize: vertical;\n}\n\n/*\n1. Reset the default placeholder opacity in Firefox. (https://github.com/tailwindlabs/tailwindcss/issues/3300)\n2. Set the default placeholder color to the user's configured gray 400 color.\n*/\n\ninput::-moz-placeholder, textarea::-moz-placeholder {\n  opacity: 1;\n  /* 1 */\n  color: #9ca3af;\n  /* 2 */\n}\n\ninput::placeholder,\ntextarea::placeholder {\n  opacity: 1;\n  /* 1 */\n  color: #9ca3af;\n  /* 2 */\n}\n\n/*\nSet the default cursor for buttons.\n*/\n\nbutton,\n[role=\"button\"] {\n  cursor: pointer;\n}\n\n/*\nMake sure disabled buttons don't get the pointer cursor.\n*/\n\n:disabled {\n  cursor: default;\n}\n\n/*\n1. Make replaced elements `display: block` by default. (https://github.com/mozdevs/cssremedy/issues/14)\n2. Add `vertical-align: middle` to align replaced elements more sensibly by default. (https://github.com/jensimmons/cssremedy/issues/14#issuecomment-634934210)\n   This can trigger a poorly considered lint error in some tools but is included by design.\n*/\n\nimg,\nsvg,\nvideo,\ncanvas,\naudio,\niframe,\nembed,\nobject {\n  display: block;\n  /* 1 */\n  vertical-align: middle;\n  /* 2 */\n}\n\n/*\nConstrain images and videos to the parent width and preserve their intrinsic aspect ratio. (https://github.com/mozdevs/cssremedy/issues/14)\n*/\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}\n\n*, ::before, ::after {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n\n::-webkit-backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n\n::backdrop {\n  --tw-border-spacing-x: 0;\n  --tw-border-spacing-y: 0;\n  --tw-translate-x: 0;\n  --tw-translate-y: 0;\n  --tw-rotate: 0;\n  --tw-skew-x: 0;\n  --tw-skew-y: 0;\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  --tw-pan-x:  ;\n  --tw-pan-y:  ;\n  --tw-pinch-zoom:  ;\n  --tw-scroll-snap-strictness: proximity;\n  --tw-ordinal:  ;\n  --tw-slashed-zero:  ;\n  --tw-numeric-figure:  ;\n  --tw-numeric-spacing:  ;\n  --tw-numeric-fraction:  ;\n  --tw-ring-inset:  ;\n  --tw-ring-offset-width: 0px;\n  --tw-ring-offset-color: #fff;\n  --tw-ring-color: rgb(59 130 246 / 0.5);\n  --tw-ring-offset-shadow: 0 0 #0000;\n  --tw-ring-shadow: 0 0 #0000;\n  --tw-shadow: 0 0 #0000;\n  --tw-shadow-colored: 0 0 #0000;\n  --tw-blur:  ;\n  --tw-brightness:  ;\n  --tw-contrast:  ;\n  --tw-grayscale:  ;\n  --tw-hue-rotate:  ;\n  --tw-invert:  ;\n  --tw-saturate:  ;\n  --tw-sepia:  ;\n  --tw-drop-shadow:  ;\n  --tw-backdrop-blur:  ;\n  --tw-backdrop-brightness:  ;\n  --tw-backdrop-contrast:  ;\n  --tw-backdrop-grayscale:  ;\n  --tw-backdrop-hue-rotate:  ;\n  --tw-backdrop-invert:  ;\n  --tw-backdrop-opacity:  ;\n  --tw-backdrop-saturate:  ;\n  --tw-backdrop-sepia:  ;\n}\n\n.fixed {\n  position: fixed;\n}\n\n.absolute {\n  position: absolute;\n}\n\n.relative {\n  position: relative;\n}\n\n.top-0 {\n  top: 0px;\n}\n\n.right-0 {\n  right: 0px;\n}\n\n.top-4 {\n  top: 1rem;\n}\n\n.right-8 {\n  right: 2rem;\n}\n\n.bottom-0 {\n  bottom: 0px;\n}\n\n.top-14 {\n  top: 3.5rem;\n}\n\n.-right-2 {\n  right: -0.5rem;\n}\n\n.z-20 {\n  z-index: 20;\n}\n\n.z-40 {\n  z-index: 40;\n}\n\n.z-10 {\n  z-index: 10;\n}\n\n.col-span-1 {\n  grid-column: span 1 / span 1;\n}\n\n.col-span-2 {\n  grid-column: span 2 / span 2;\n}\n\n.mx-auto {\n  margin-left: auto;\n  margin-right: auto;\n}\n\n.my-3 {\n  margin-top: 0.75rem;\n  margin-bottom: 0.75rem;\n}\n\n.my-8 {\n  margin-top: 2rem;\n  margin-bottom: 2rem;\n}\n\n.mb-6 {\n  margin-bottom: 1.5rem;\n}\n\n.ml-4 {\n  margin-left: 1rem;\n}\n\n.ml-10 {\n  margin-left: 2.5rem;\n}\n\n.mt-3 {\n  margin-top: 0.75rem;\n}\n\n.mr-3 {\n  margin-right: 0.75rem;\n}\n\n.ml-3 {\n  margin-left: 0.75rem;\n}\n\n.mb-2 {\n  margin-bottom: 0.5rem;\n}\n\n.block {\n  display: block;\n}\n\n.flex {\n  display: flex;\n}\n\n.grid {\n  display: grid;\n}\n\n.hidden {\n  display: none;\n}\n\n.h-screen {\n  height: 100vh;\n}\n\n.h-6 {\n  height: 1.5rem;\n}\n\n.h-8 {\n  height: 2rem;\n}\n\n.h-full {\n  height: 100%;\n}\n\n.h-10 {\n  height: 2.5rem;\n}\n\n.h-5 {\n  height: 1.25rem;\n}\n\n.w-full {\n  width: 100%;\n}\n\n.w-96 {\n  width: 24rem;\n}\n\n.w-6 {\n  width: 1.5rem;\n}\n\n.w-8 {\n  width: 2rem;\n}\n\n.w-4\\/5 {\n  width: 80%;\n}\n\n.w-5 {\n  width: 1.25rem;\n}\n\n.w-60 {\n  width: 15rem;\n}\n\n.flex-shrink-0 {\n  flex-shrink: 0;\n}\n\n.scale-95 {\n  --tw-scale-x: .95;\n  --tw-scale-y: .95;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n.scale-100 {\n  --tw-scale-x: 1;\n  --tw-scale-y: 1;\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n.transform {\n  transform: translate(var(--tw-translate-x), var(--tw-translate-y)) rotate(var(--tw-rotate)) skewX(var(--tw-skew-x)) skewY(var(--tw-skew-y)) scaleX(var(--tw-scale-x)) scaleY(var(--tw-scale-y));\n}\n\n.cursor-pointer {\n  cursor: pointer;\n}\n\n.cursor-default {\n  cursor: default;\n}\n\n.grid-cols-3 {\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n}\n\n.grid-cols-4 {\n  grid-template-columns: repeat(4, minmax(0, 1fr));\n}\n\n.items-center {\n  align-items: center;\n}\n\n.justify-center {\n  justify-content: center;\n}\n\n.justify-between {\n  justify-content: space-between;\n}\n\n.gap-2 {\n  gap: 0.5rem;\n}\n\n.divide-opacity-75 > :not([hidden]) ~ :not([hidden]) {\n  --tw-divide-opacity: 0.75;\n}\n\n.self-end {\n  align-self: flex-end;\n}\n\n.overflow-auto {\n  overflow: auto;\n}\n\n.overflow-hidden {\n  overflow: hidden;\n}\n\n.overflow-x-hidden {\n  overflow-x: hidden;\n}\n\n.rounded {\n  border-radius: 0.25rem;\n}\n\n.rounded-sm {\n  border-radius: 0.125rem;\n}\n\n.border {\n  border-width: 1px;\n}\n\n.border-2 {\n  border-width: 2px;\n}\n\n.border-b {\n  border-bottom-width: 1px;\n}\n\n.border-white {\n  --tw-border-opacity: 1;\n  border-color: rgb(255 255 255 / var(--tw-border-opacity));\n}\n\n.border-gray-300 {\n  --tw-border-opacity: 1;\n  border-color: rgb(209 213 219 / var(--tw-border-opacity));\n}\n\n.border-b-white\\/25 {\n  border-bottom-color: rgb(255 255 255 / 0.25);\n}\n\n.bg-gray-800 {\n  --tw-bg-opacity: 1;\n  background-color: rgb(31 41 55 / var(--tw-bg-opacity));\n}\n\n.bg-white {\n  --tw-bg-opacity: 1;\n  background-color: rgb(255 255 255 / var(--tw-bg-opacity));\n}\n\n.p-4 {\n  padding: 1rem;\n}\n\n.p-10 {\n  padding: 2.5rem;\n}\n\n.p-3 {\n  padding: 0.75rem;\n}\n\n.py-2 {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n\n.px-10 {\n  padding-left: 2.5rem;\n  padding-right: 2.5rem;\n}\n\n.py-4 {\n  padding-top: 1rem;\n  padding-bottom: 1rem;\n}\n\n.px-2 {\n  padding-left: 0.5rem;\n  padding-right: 0.5rem;\n}\n\n.py-3 {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n}\n\n.px-3 {\n  padding-left: 0.75rem;\n  padding-right: 0.75rem;\n}\n\n.pt-10 {\n  padding-top: 2.5rem;\n}\n\n.pl-4 {\n  padding-left: 1rem;\n}\n\n.text-left {\n  text-align: left;\n}\n\n.text-center {\n  text-align: center;\n}\n\n.text-sm {\n  font-size: 0.875rem;\n  line-height: 1.25rem;\n}\n\n.text-xs {\n  font-size: 0.75rem;\n  line-height: 1rem;\n}\n\n.text-base {\n  font-size: 1rem;\n  line-height: 1.5rem;\n}\n\n.text-lg {\n  font-size: 1.125rem;\n  line-height: 1.75rem;\n}\n\n.font-light {\n  font-weight: 300;\n}\n\n.lowercase {\n  text-transform: lowercase;\n}\n\n.tracking-wide {\n  letter-spacing: 0.025em;\n}\n\n.text-white {\n  --tw-text-opacity: 1;\n  color: rgb(255 255 255 / var(--tw-text-opacity));\n}\n\n.text-gray-700 {\n  --tw-text-opacity: 1;\n  color: rgb(55 65 81 / var(--tw-text-opacity));\n}\n\n.text-black {\n  --tw-text-opacity: 1;\n  color: rgb(0 0 0 / var(--tw-text-opacity));\n}\n\n.opacity-50 {\n  opacity: 0.5;\n}\n\n.opacity-100 {\n  opacity: 1;\n}\n\n.opacity-0 {\n  opacity: 0;\n}\n\n.opacity-30 {\n  opacity: 0.3;\n}\n\n.opacity-75 {\n  opacity: 0.75;\n}\n\n.shadow-2xl {\n  --tw-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);\n  --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow {\n  --tw-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.shadow-lg {\n  --tw-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);\n  --tw-shadow-colored: 0 10px 15px -3px var(--tw-shadow-color), 0 4px 6px -4px var(--tw-shadow-color);\n  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);\n}\n\n.filter {\n  filter: var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow);\n}\n\n.transition-colors {\n  transition-property: color, background-color, border-color, fill, stroke, -webkit-text-decoration-color;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition {\n  transition-property: color, background-color, border-color, fill, stroke, opacity, box-shadow, transform, filter, -webkit-text-decoration-color, -webkit-backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;\n  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter, -webkit-text-decoration-color, -webkit-backdrop-filter;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.transition-opacity {\n  transition-property: opacity;\n  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);\n  transition-duration: 150ms;\n}\n\n.duration-100 {\n  transition-duration: 100ms;\n}\n\n.duration-200 {\n  transition-duration: 200ms;\n}\n\n.duration-75 {\n  transition-duration: 75ms;\n}\n\n.ease-out {\n  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);\n}\n\n.ease-in {\n  transition-timing-function: cubic-bezier(0.4, 0, 1, 1);\n}\n\n.last\\:border-transparent:last-child {\n  border-color: transparent;\n}\n\n.hover\\:bg-gray-100:hover {\n  --tw-bg-opacity: 1;\n  background-color: rgb(243 244 246 / var(--tw-bg-opacity));\n}\n\n@media (prefers-color-scheme: dark) {\n  .dark\\:text-white {\n    --tw-text-opacity: 1;\n    color: rgb(255 255 255 / var(--tw-text-opacity));\n  }\n}\n\n@media (min-width: 768px) {\n  .md\\:bottom-14 {\n    bottom: 3.5rem;\n  }\n\n  .md\\:right-3 {\n    right: 0.75rem;\n  }\n\n  .md\\:right-16 {\n    right: 4rem;\n  }\n\n  .md\\:flex {\n    display: flex;\n  }\n\n  .md\\:grid {\n    display: grid;\n  }\n\n  .md\\:w-\\[40em\\] {\n    width: 40em;\n  }\n\n  .md\\:w-2\\/5 {\n    width: 40%;\n  }\n\n  .md\\:px-24 {\n    padding-left: 6rem;\n    padding-right: 6rem;\n  }\n}";

// https://maximomussini.com/posts/vue-custom-elements

const styles = [
	...[tailwindStyles],
	...App.styles
];

customElements.define(
	'paginate-content',
	defineCustomElement({
		...App,
		styles
	})
);
//# sourceMappingURL=index.es.js.map
