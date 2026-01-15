let wasm;

function addToExternrefTable0(obj) {
    const idx = wasm.__externref_table_alloc();
    wasm.__wbindgen_externrefs.set(idx, obj);
    return idx;
}

const CLOSURE_DTORS = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(state => state.dtor(state.a, state.b));

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches && builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function getArrayU8FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
    if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || (cachedDataViewMemory0.buffer.detached === undefined && cachedDataViewMemory0.buffer !== wasm.memory.buffer)) {
        cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
    }
    return cachedDataViewMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        const idx = addToExternrefTable0(e);
        wasm.__wbindgen_exn_store(idx);
    }
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function makeClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        try {
            return f(state.a, state.b, ...args);
        } finally {
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {

        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            state.a = a;
            real._wbg_cb_unref();
        }
    };
    real._wbg_cb_unref = () => {
        if (--state.cnt === 0) {
            state.dtor(state.a, state.b);
            state.a = 0;
            CLOSURE_DTORS.unregister(state);
        }
    };
    CLOSURE_DTORS.register(real, state, state);
    return real;
}

function passStringToWasm0(arg, malloc, realloc) {
    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8ArrayMemory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }
    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
        const ret = cachedTextEncoder.encodeInto(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

const cachedTextEncoder = new TextEncoder();

if (!('encodeInto' in cachedTextEncoder)) {
    cachedTextEncoder.encodeInto = function (arg, view) {
        const buf = cachedTextEncoder.encode(arg);
        view.set(buf);
        return {
            read: arg.length,
            written: buf.length
        };
    }
}

let WASM_VECTOR_LEN = 0;

function wasm_bindgen__convert__closures_____invoke__h5793e10bfaaf1707(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h5793e10bfaaf1707(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h0823683991661f7a(arg0, arg1, arg2) {
    wasm.wasm_bindgen__convert__closures_____invoke__h0823683991661f7a(arg0, arg1, arg2);
}

function wasm_bindgen__convert__closures_____invoke__h5c6de5859ba9739a(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__h5c6de5859ba9739a(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__hc1acf21124483a86(arg0, arg1) {
    wasm.wasm_bindgen__convert__closures_____invoke__hc1acf21124483a86(arg0, arg1);
}

function wasm_bindgen__convert__closures_____invoke__hb9d9973d7aeecabf(arg0, arg1, arg2, arg3) {
    wasm.wasm_bindgen__convert__closures_____invoke__hb9d9973d7aeecabf(arg0, arg1, arg2, arg3);
}

const __wbindgen_enum_ReadableStreamType = ["bytes"];

const __wbindgen_enum_RequestCache = ["default", "no-store", "reload", "no-cache", "force-cache", "only-if-cached"];

const __wbindgen_enum_RequestCredentials = ["omit", "same-origin", "include"];

const __wbindgen_enum_RequestMode = ["same-origin", "no-cors", "cors", "navigate"];

const IntoUnderlyingByteSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingbytesource_free(ptr >>> 0, 1));

const IntoUnderlyingSinkFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsink_free(ptr >>> 0, 1));

const IntoUnderlyingSourceFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_intounderlyingsource_free(ptr >>> 0, 1));

export class IntoUnderlyingByteSource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingByteSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingbytesource_free(ptr, 0);
    }
    /**
     * @returns {number}
     */
    get autoAllocateChunkSize() {
        const ret = wasm.intounderlyingbytesource_autoAllocateChunkSize(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @param {ReadableByteStreamController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingbytesource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    /**
     * @param {ReadableByteStreamController} controller
     */
    start(controller) {
        wasm.intounderlyingbytesource_start(this.__wbg_ptr, controller);
    }
    /**
     * @returns {ReadableStreamType}
     */
    get type() {
        const ret = wasm.intounderlyingbytesource_type(this.__wbg_ptr);
        return __wbindgen_enum_ReadableStreamType[ret];
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingbytesource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingByteSource.prototype[Symbol.dispose] = IntoUnderlyingByteSource.prototype.free;

export class IntoUnderlyingSink {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSinkFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsink_free(ptr, 0);
    }
    /**
     * @param {any} reason
     * @returns {Promise<any>}
     */
    abort(reason) {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_abort(ptr, reason);
        return ret;
    }
    /**
     * @returns {Promise<any>}
     */
    close() {
        const ptr = this.__destroy_into_raw();
        const ret = wasm.intounderlyingsink_close(ptr);
        return ret;
    }
    /**
     * @param {any} chunk
     * @returns {Promise<any>}
     */
    write(chunk) {
        const ret = wasm.intounderlyingsink_write(this.__wbg_ptr, chunk);
        return ret;
    }
}
if (Symbol.dispose) IntoUnderlyingSink.prototype[Symbol.dispose] = IntoUnderlyingSink.prototype.free;

export class IntoUnderlyingSource {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        IntoUnderlyingSourceFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_intounderlyingsource_free(ptr, 0);
    }
    /**
     * @param {ReadableStreamDefaultController} controller
     * @returns {Promise<any>}
     */
    pull(controller) {
        const ret = wasm.intounderlyingsource_pull(this.__wbg_ptr, controller);
        return ret;
    }
    cancel() {
        const ptr = this.__destroy_into_raw();
        wasm.intounderlyingsource_cancel(ptr);
    }
}
if (Symbol.dispose) IntoUnderlyingSource.prototype[Symbol.dispose] = IntoUnderlyingSource.prototype.free;

const EXPECTED_RESPONSE_TYPES = new Set(['basic', 'cors', 'default']);

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = module.ok && EXPECTED_RESPONSE_TYPES.has(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg___wbindgen_boolean_get_dea25b33882b895b = function(arg0) {
        const v = arg0;
        const ret = typeof(v) === 'boolean' ? v : undefined;
        return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
    };
    imports.wbg.__wbg___wbindgen_debug_string_adfb662ae34724b6 = function(arg0, arg1) {
        const ret = debugString(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_is_falsy_7b9692021c137978 = function(arg0) {
        const ret = !arg0;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_function_8d400b8b1af978cd = function(arg0) {
        const ret = typeof(arg0) === 'function';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_null_dfda7d66506c95b5 = function(arg0) {
        const ret = arg0 === null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_object_ce774f3490692386 = function(arg0) {
        const val = arg0;
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_string_704ef9c8fc131030 = function(arg0) {
        const ret = typeof(arg0) === 'string';
        return ret;
    };
    imports.wbg.__wbg___wbindgen_is_undefined_f6b95eab589e0269 = function(arg0) {
        const ret = arg0 === undefined;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_jsval_eq_b6101cc9cef1fe36 = function(arg0, arg1) {
        const ret = arg0 === arg1;
        return ret;
    };
    imports.wbg.__wbg___wbindgen_number_get_9619185a74197f95 = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getDataViewMemory0().setFloat64(arg0 + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
    };
    imports.wbg.__wbg___wbindgen_string_get_a2a31e16edf96e42 = function(arg0, arg1) {
        const obj = arg1;
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg___wbindgen_throw_dd24417ed36fc46e = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg__wbg_cb_unref_87dfb5aaa0cbcea7 = function(arg0) {
        arg0._wbg_cb_unref();
    };
    imports.wbg.__wbg_abort_07646c894ebbf2bd = function(arg0) {
        arg0.abort();
    };
    imports.wbg.__wbg_abort_399ecbcfd6ef3c8e = function(arg0, arg1) {
        arg0.abort(arg1);
    };
    imports.wbg.__wbg_addEventListener_6a82629b3d430a48 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.addEventListener(getStringFromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbg_addTo_4c3462c91060f881 = function(arg0, arg1) {
        const ret = arg0.addTo(arg1);
        return ret;
    };
    imports.wbg.__wbg_add_0042ba03119d8c50 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.add(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_add_a928536d6ee293f3 = function() { return handleError(function (arg0, arg1, arg2) {
        arg0.add(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_altKey_e13fae92dfebca3e = function(arg0) {
        const ret = arg0.altKey;
        return ret;
    };
    imports.wbg.__wbg_append_c5cbdf46455cc776 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.append(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_arrayBuffer_c04af4fce566092d = function() { return handleError(function (arg0) {
        const ret = arg0.arrayBuffer();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_bindPopup_99a8f36daa4ff48f = function(arg0, arg1) {
        const ret = arg0.bindPopup(arg1);
        return ret;
    };
    imports.wbg.__wbg_body_544738f8b03aef13 = function(arg0) {
        const ret = arg0.body;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_bottom_7d2cabadf8c452a8 = function(arg0) {
        const ret = arg0.bottom;
        return ret;
    };
    imports.wbg.__wbg_bringToBack_3b74d43f0b863310 = function(arg0) {
        const ret = arg0.bringToBack();
        return ret;
    };
    imports.wbg.__wbg_bringToFront_b8203ccde256929d = function(arg0) {
        const ret = arg0.bringToFront();
        return ret;
    };
    imports.wbg.__wbg_buffer_6cb2fecb1f253d71 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_button_a54acd25bab5d442 = function(arg0) {
        const ret = arg0.button;
        return ret;
    };
    imports.wbg.__wbg_byobRequest_f8e3517f5f8ad284 = function(arg0) {
        const ret = arg0.byobRequest;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_byteLength_faa9938885bdeee6 = function(arg0) {
        const ret = arg0.byteLength;
        return ret;
    };
    imports.wbg.__wbg_byteOffset_3868b6a19ba01dea = function(arg0) {
        const ret = arg0.byteOffset;
        return ret;
    };
    imports.wbg.__wbg_call_3020136f7a2d6e44 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_call_abb4ff46ce38be40 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cancelAnimationFrame_1c2a3faf7be5aedd = function() { return handleError(function (arg0, arg1) {
        arg0.cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_cancelBubble_3ab876913f65579a = function(arg0) {
        const ret = arg0.cancelBubble;
        return ret;
    };
    imports.wbg.__wbg_classList_d75bc19322d1b8f4 = function(arg0) {
        const ret = arg0.classList;
        return ret;
    };
    imports.wbg.__wbg_clearTimeout_42d9ccd50822fd3a = function(arg0) {
        const ret = clearTimeout(arg0);
        return ret;
    };
    imports.wbg.__wbg_clearWatch_f1f733f9f82ff512 = function(arg0, arg1) {
        arg0.clearWatch(arg1);
    };
    imports.wbg.__wbg_clientX_c17906c33ea43025 = function(arg0) {
        const ret = arg0.clientX;
        return ret;
    };
    imports.wbg.__wbg_clientY_70eb66d231a332a3 = function(arg0) {
        const ret = arg0.clientY;
        return ret;
    };
    imports.wbg.__wbg_cloneNode_34a31a9eb445b6ad = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.cloneNode(arg1 !== 0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_cloneNode_c9c45b24b171a776 = function() { return handleError(function (arg0) {
        const ret = arg0.cloneNode();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_close_0af5661bf3d335f2 = function() { return handleError(function (arg0) {
        arg0.close();
    }, arguments) };
    imports.wbg.__wbg_close_3ec111e7b23d94d8 = function() { return handleError(function (arg0) {
        arg0.close();
    }, arguments) };
    imports.wbg.__wbg_code_b3ddfa90f724c486 = function(arg0, arg1) {
        const ret = arg1.code;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_composedPath_c6de3259e6ae48ad = function(arg0) {
        const ret = arg0.composedPath();
        return ret;
    };
    imports.wbg.__wbg_content_ad90fa08b8c037c5 = function(arg0) {
        const ret = arg0.content;
        return ret;
    };
    imports.wbg.__wbg_coords_c832791f0078ece1 = function(arg0) {
        const ret = arg0.coords;
        return ret;
    };
    imports.wbg.__wbg_createComment_89db599aa930ef8a = function(arg0, arg1, arg2) {
        const ret = arg0.createComment(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_createElementNS_e7c12bbd579529e2 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        const ret = arg0.createElementNS(arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createElement_da4ed2b219560fc6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.createElement(getStringFromWasm0(arg1, arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_createTextNode_0cf8168f7646a5d2 = function(arg0, arg1, arg2) {
        const ret = arg0.createTextNode(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_b391e5105c3f6e76 = function(arg0) {
        const ret = arg0.ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_debug_9d0c87ddda3dc485 = function(arg0) {
        console.debug(arg0);
    };
    imports.wbg.__wbg_decodeURIComponent_4e62713cd03627d4 = function() { return handleError(function (arg0, arg1) {
        const ret = decodeURIComponent(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_decodeURI_b37dbbeac7109c58 = function() { return handleError(function (arg0, arg1) {
        const ret = decodeURI(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_defaultPrevented_656a2f6afcfa3679 = function(arg0) {
        const ret = arg0.defaultPrevented;
        return ret;
    };
    imports.wbg.__wbg_deleteProperty_da180bf2624d16d6 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.deleteProperty(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_disable_6d6140ef358fd36d = function(arg0) {
        const ret = arg0.disable();
        return ret;
    };
    imports.wbg.__wbg_documentElement_39f40310398a4cba = function(arg0) {
        const ret = arg0.documentElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_document_5b745e82ba551ca5 = function(arg0) {
        const ret = arg0.document;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_done_62ea16af4ce34b24 = function(arg0) {
        const ret = arg0.done;
        return ret;
    };
    imports.wbg.__wbg_dragging_ba95444d1a88d951 = function(arg0) {
        const ret = arg0.dragging;
        return ret;
    };
    imports.wbg.__wbg_enable_6488dd2e6af4261b = function(arg0) {
        const ret = arg0.enable();
        return ret;
    };
    imports.wbg.__wbg_encodeURIComponent_fe8578929b74aa6c = function(arg0, arg1) {
        const ret = encodeURIComponent(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_enqueue_a7e6b1ee87963aad = function() { return handleError(function (arg0, arg1) {
        arg0.enqueue(arg1);
    }, arguments) };
    imports.wbg.__wbg_error_7534b8e9a36f1ab4 = function(arg0, arg1) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg0;
            deferred0_1 = arg1;
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_error_7bc7d576a6aaf855 = function(arg0) {
        console.error(arg0);
    };
    imports.wbg.__wbg_fetch_6bbc32f991730587 = function(arg0) {
        const ret = fetch(arg0);
        return ret;
    };
    imports.wbg.__wbg_fetch_90447c28cc0b095e = function(arg0, arg1) {
        const ret = arg0.fetch(arg1);
        return ret;
    };
    imports.wbg.__wbg_firstElementChild_e207b33aaa4a86df = function(arg0) {
        const ret = arg0.firstElementChild;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_fitBounds_21cdc70866f7baa9 = function(arg0, arg1) {
        const ret = arg0.fitBounds(arg1);
        return ret;
    };
    imports.wbg.__wbg_focus_220a53e22147dc0f = function() { return handleError(function (arg0) {
        arg0.focus();
    }, arguments) };
    imports.wbg.__wbg_geolocation_d4aa214c4dfa0192 = function() { return handleError(function (arg0) {
        const ret = arg0.geolocation;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getAttribute_80900eec94cb3636 = function(arg0, arg1, arg2, arg3) {
        const ret = arg1.getAttribute(getStringFromWasm0(arg2, arg3));
        var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_getBoundingClientRect_25e44a78507968b0 = function(arg0) {
        const ret = arg0.getBoundingClientRect();
        return ret;
    };
    imports.wbg.__wbg_getComputedStyle_bbcd5e3d08077b71 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.getComputedStyle(arg1);
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_getElementById_e05488d2143c2b21 = function(arg0, arg1, arg2) {
        const ret = arg0.getElementById(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_getPropertyValue_dcded91357966805 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg1.getPropertyValue(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_getRandomValues_9b655bdd369112f2 = function() { return handleError(function (arg0, arg1) {
        globalThis.crypto.getRandomValues(getArrayU8FromWasm0(arg0, arg1));
    }, arguments) };
    imports.wbg.__wbg_getTime_ad1e9878a735af08 = function(arg0) {
        const ret = arg0.getTime();
        return ret;
    };
    imports.wbg.__wbg_getTimezoneOffset_45389e26d6f46823 = function(arg0) {
        const ret = arg0.getTimezoneOffset();
        return ret;
    };
    imports.wbg.__wbg_get_6b7bd52aca3f9671 = function(arg0, arg1) {
        const ret = arg0[arg1 >>> 0];
        return ret;
    };
    imports.wbg.__wbg_get_af9dab7e9603ea93 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_hasAttribute_af746bd1e7f1b334 = function(arg0, arg1, arg2) {
        const ret = arg0.hasAttribute(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_has_0e670569d65d3a45 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.has(arg0, arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_hash_2e67a8656ea02800 = function(arg0, arg1) {
        const ret = arg1.hash;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_hash_979a7861415bf1f8 = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.hash;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_head_aa354d3e01363673 = function(arg0) {
        const ret = arg0.head;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_headers_654c30e1bcccc552 = function(arg0) {
        const ret = arg0.headers;
        return ret;
    };
    imports.wbg.__wbg_height_b5f604f110c1540c = function(arg0) {
        const ret = arg0.height;
        return ret;
    };
    imports.wbg.__wbg_history_42a0e31617a8f00e = function() { return handleError(function (arg0) {
        const ret = arg0.history;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_host_3f3d16f21f257e93 = function(arg0) {
        const ret = arg0.host;
        return ret;
    };
    imports.wbg.__wbg_href_18222dace6ab46cf = function(arg0, arg1) {
        const ret = arg1.href;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_href_fd44bd17290b1611 = function(arg0, arg1) {
        const ret = arg1.href;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_id_0cd70c3a5517c880 = function(arg0, arg1) {
        const ret = arg1.id;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_info_ce6bcc489c22f6f0 = function(arg0) {
        console.info(arg0);
    };
    imports.wbg.__wbg_innerHeight_ccac894168ddb23c = function() { return handleError(function (arg0) {
        const ret = arg0.innerHeight;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_innerWidth_5a44c76afe8ca065 = function() { return handleError(function (arg0) {
        const ret = arg0.innerWidth;
        return ret;
    }, arguments) };
    imports.wbg.__wbg_insertBefore_93e77c32aeae9657 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.insertBefore(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_instanceof_Element_6f7ba982258cfc0f = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Element;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlAnchorElement_2ac07b5cf25eac0c = function(arg0) {
        let result;
        try {
            result = arg0 instanceof HTMLAnchorElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlElement_20a3acb594113d73 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof HTMLElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_HtmlInputElement_46b31917ce88698f = function(arg0) {
        let result;
        try {
            result = arg0 instanceof HTMLInputElement;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Response_cd74d1c2ac92cb0b = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Response;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_ShadowRoot_acbbcc2231ef8a7b = function(arg0) {
        let result;
        try {
            result = arg0 instanceof ShadowRoot;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_instanceof_Window_b5cf7783caa68180 = function(arg0) {
        let result;
        try {
            result = arg0 instanceof Window;
        } catch (_) {
            result = false;
        }
        const ret = result;
        return ret;
    };
    imports.wbg.__wbg_isArray_51fd9e6422c0a395 = function(arg0) {
        const ret = Array.isArray(arg0);
        return ret;
    };
    imports.wbg.__wbg_is_928aa29d71e75457 = function(arg0, arg1) {
        const ret = Object.is(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_iterator_27b7c8b35ab3e86b = function() {
        const ret = Symbol.iterator;
        return ret;
    };
    imports.wbg.__wbg_lat_dab9264ff88fd033 = function(arg0) {
        const ret = arg0.lat;
        return ret;
    };
    imports.wbg.__wbg_latitude_c0679f2c32f768ca = function(arg0) {
        const ret = arg0.latitude;
        return ret;
    };
    imports.wbg.__wbg_latlng_808fc05a3d6510cc = function(arg0) {
        const ret = arg0.latlng;
        return ret;
    };
    imports.wbg.__wbg_left_d52bfa3824286825 = function(arg0) {
        const ret = arg0.left;
        return ret;
    };
    imports.wbg.__wbg_length_22ac23eaec9d8053 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_length_d45040a40c570362 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_lng_bf085f7594a75eb2 = function(arg0) {
        const ret = arg0.lng;
        return ret;
    };
    imports.wbg.__wbg_locate_394595e4b2d1b985 = function(arg0, arg1) {
        const ret = arg0.locate(arg1);
        return ret;
    };
    imports.wbg.__wbg_location_962e75c1c1b3ebed = function(arg0) {
        const ret = arg0.location;
        return ret;
    };
    imports.wbg.__wbg_log_1d990106d99dacb7 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_longitude_ab7348aa2687f5e0 = function(arg0) {
        const ret = arg0.longitude;
        return ret;
    };
    imports.wbg.__wbg_metaKey_448c751accad2eba = function(arg0) {
        const ret = arg0.metaKey;
        return ret;
    };
    imports.wbg.__wbg_navigator_b49edef831236138 = function(arg0) {
        const ret = arg0.navigator;
        return ret;
    };
    imports.wbg.__wbg_new_0_23cedd11d9b40c9d = function() {
        const ret = new Date();
        return ret;
    };
    imports.wbg.__wbg_new_1ba21ce319a06297 = function() {
        const ret = new Object();
        return ret;
    };
    imports.wbg.__wbg_new_25f239778d6112b9 = function() {
        const ret = new Array();
        return ret;
    };
    imports.wbg.__wbg_new_2afa4873bb1cc37b = function(arg0, arg1) {
        const ret = new L.Point(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_3c79b3bb1b32b7d3 = function() { return handleError(function () {
        const ret = new Headers();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_6421f6084cc5bc5a = function(arg0) {
        const ret = new Uint8Array(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_67b14cceb4541e2e = function(arg0, arg1) {
        const ret = new L.LatLngBounds(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_6caa67c5ea415b1b = function(arg0, arg1, arg2) {
        const ret = new L.Map(getStringFromWasm0(arg0, arg1), arg2);
        return ret;
    };
    imports.wbg.__wbg_new_881a222c65f168fc = function() { return handleError(function () {
        const ret = new AbortController();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_8a6f238a6ece86ea = function() {
        const ret = new Error();
        return ret;
    };
    imports.wbg.__wbg_new_a0295ef1047e4f0a = function(arg0) {
        const ret = new L.Icon(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_b2db8aa2650f793a = function(arg0) {
        const ret = new Date(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_b7ff62f73f4eeb97 = function(arg0, arg1) {
        const ret = new L.Popup(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_cde852da082413b0 = function(arg0) {
        const ret = new L.DivIcon(arg0);
        return ret;
    };
    imports.wbg.__wbg_new_dc8b69c32b416910 = function(arg0, arg1) {
        const ret = new Intl.DateTimeFormat(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_df1173567d5ff028 = function(arg0, arg1) {
        const ret = new Error(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_fd899f461a1c9b55 = function(arg0, arg1) {
        const ret = new L.LatLng(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_ff12d2b041fb48f1 = function(arg0, arg1) {
        try {
            var state0 = {a: arg0, b: arg1};
            var cb0 = (arg0, arg1) => {
                const a = state0.a;
                state0.a = 0;
                try {
                    return wasm_bindgen__convert__closures_____invoke__hb9d9973d7aeecabf(a, state0.b, arg0, arg1);
                } finally {
                    state0.a = a;
                }
            };
            const ret = new Promise(cb0);
            return ret;
        } finally {
            state0.a = state0.b = 0;
        }
    };
    imports.wbg.__wbg_new_from_slice_f9c22b9153b26992 = function(arg0, arg1) {
        const ret = new Uint8Array(getArrayU8FromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_no_args_cb138f77cf6151ee = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbg_new_options_c2bc2ae8a5fcf989 = function(arg0, arg1, arg2) {
        const ret = new L.TileLayer(getStringFromWasm0(arg0, arg1), arg2);
        return ret;
    };
    imports.wbg.__wbg_new_with_base_7d0307fe97312036 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = new URL(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_with_byte_offset_and_length_d85c3da1fd8df149 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_new_with_lat_lng_fc8af693f5f34c51 = function(arg0, arg1) {
        const ret = new L.Popup(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_with_options_6e2e732c1e965451 = function(arg0, arg1) {
        const ret = new L.Marker(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_with_options_d5ffa89780c96bd6 = function(arg0, arg1) {
        const ret = new L.Polyline(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_new_with_str_and_init_c5748f76f5108934 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new Request(getStringFromWasm0(arg0, arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_new_with_str_dea1b77a8c2f6d7d = function() { return handleError(function (arg0, arg1) {
        const ret = new URLSearchParams(getStringFromWasm0(arg0, arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_next_138a17bbf04e926c = function(arg0) {
        const ret = arg0.next;
        return ret;
    };
    imports.wbg.__wbg_next_3cfe5c0fe2a4cc53 = function() { return handleError(function (arg0) {
        const ret = arg0.next();
        return ret;
    }, arguments) };
    imports.wbg.__wbg_nodeType_927ceb9308a9be24 = function(arg0) {
        const ret = arg0.nodeType;
        return ret;
    };
    imports.wbg.__wbg_offsetHeight_3a0cb1c43babb670 = function(arg0) {
        const ret = arg0.offsetHeight;
        return ret;
    };
    imports.wbg.__wbg_offsetTop_cea3f2bb4eff1df7 = function(arg0) {
        const ret = arg0.offsetTop;
        return ret;
    };
    imports.wbg.__wbg_offsetWidth_058fe16c7dd9e9bb = function(arg0) {
        const ret = arg0.offsetWidth;
        return ret;
    };
    imports.wbg.__wbg_on_8c7d6c7ab79756cd = function(arg0, arg1, arg2, arg3) {
        const ret = arg0.on(getStringFromWasm0(arg1, arg2), arg3);
        return ret;
    };
    imports.wbg.__wbg_openOn_bd2de2f85010b9ef = function(arg0, arg1) {
        arg0.openOn(arg1);
    };
    imports.wbg.__wbg_origin_583b9a7f27a7bc24 = function(arg0, arg1) {
        const ret = arg1.origin;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_origin_c4ac149104b9ebad = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.origin;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_parentElement_f12dbbdecc1452a6 = function(arg0) {
        const ret = arg0.parentElement;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_parentNode_6caea653ea9f3e23 = function(arg0) {
        const ret = arg0.parentNode;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_pathname_7b4426cce3f331cf = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.pathname;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_pathname_891dd78881a6e851 = function(arg0, arg1) {
        const ret = arg1.pathname;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_prepend_ab79c004564b1208 = function() { return handleError(function (arg0, arg1) {
        arg0.prepend(arg1);
    }, arguments) };
    imports.wbg.__wbg_preventDefault_e97663aeeb9709d3 = function(arg0) {
        arg0.preventDefault();
    };
    imports.wbg.__wbg_prototypesetcall_dfe9b766cdc1f1fd = function(arg0, arg1, arg2) {
        Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
    };
    imports.wbg.__wbg_pushState_97ca33be0ff17d82 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.pushState(arg1, getStringFromWasm0(arg2, arg3), arg4 === 0 ? undefined : getStringFromWasm0(arg4, arg5));
    }, arguments) };
    imports.wbg.__wbg_push_7d9be8f38fc13975 = function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
    };
    imports.wbg.__wbg_querySelector_15a92ce6bed6157d = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.querySelector(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_querySelector_83602705c2df3db0 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.querySelector(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    }, arguments) };
    imports.wbg.__wbg_queueMicrotask_9b549dfce8865860 = function(arg0) {
        const ret = arg0.queueMicrotask;
        return ret;
    };
    imports.wbg.__wbg_queueMicrotask_fca69f5bfad613a5 = function(arg0) {
        queueMicrotask(arg0);
    };
    imports.wbg.__wbg_random_cc1f9237d866d212 = function() {
        const ret = Math.random();
        return ret;
    };
    imports.wbg.__wbg_removeAttribute_96e791ceeb22d591 = function() { return handleError(function (arg0, arg1, arg2) {
        arg0.removeAttribute(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_removeEventListener_565e273024b68b75 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        arg0.removeEventListener(getStringFromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbg_removeProperty_c2e16faee2834bef = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg1.removeProperty(getStringFromWasm0(arg2, arg3));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_remove_28974cc8e1afc469 = function(arg0) {
        const ret = arg0.remove();
        return ret;
    };
    imports.wbg.__wbg_remove_32f69ffabcbc4072 = function(arg0) {
        arg0.remove();
    };
    imports.wbg.__wbg_remove_347354790d3a9bed = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.remove(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_remove_9f10fee6dc85af0e = function(arg0) {
        const ret = arg0.remove();
        return ret;
    };
    imports.wbg.__wbg_remove_c705a65e04542a70 = function() { return handleError(function (arg0, arg1, arg2) {
        arg0.remove(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_remove_e0441e385f51d1e9 = function(arg0) {
        arg0.remove();
    };
    imports.wbg.__wbg_replaceState_9b53ce8415668210 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5) {
        arg0.replaceState(arg1, getStringFromWasm0(arg2, arg3), arg4 === 0 ? undefined : getStringFromWasm0(arg4, arg5));
    }, arguments) };
    imports.wbg.__wbg_requestAnimationFrame_994dc4ebde22b8d9 = function() { return handleError(function (arg0, arg1) {
        const ret = arg0.requestAnimationFrame(arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_resolve_fd5bfbaa4ce36e1e = function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
    };
    imports.wbg.__wbg_resolvedOptions_c5df09ec2900085b = function(arg0) {
        const ret = arg0.resolvedOptions();
        return ret;
    };
    imports.wbg.__wbg_respond_9f7fc54636c4a3af = function() { return handleError(function (arg0, arg1) {
        arg0.respond(arg1 >>> 0);
    }, arguments) };
    imports.wbg.__wbg_right_b7a0dcdcec0301e1 = function(arg0) {
        const ret = arg0.right;
        return ret;
    };
    imports.wbg.__wbg_scrollIntoView_0e467b662eec87a8 = function(arg0) {
        arg0.scrollIntoView();
    };
    imports.wbg.__wbg_scrollIntoView_85c5ce295b95a895 = function(arg0, arg1) {
        arg0.scrollIntoView(arg1 !== 0);
    };
    imports.wbg.__wbg_scrollLeft_fd09c4fc9e877b68 = function(arg0) {
        const ret = arg0.scrollLeft;
        return ret;
    };
    imports.wbg.__wbg_scrollTo_8505d0b7a84c2713 = function(arg0, arg1) {
        arg0.scrollTo(arg1);
    };
    imports.wbg.__wbg_scrollTo_c18d69ba522ef774 = function(arg0, arg1, arg2) {
        arg0.scrollTo(arg1, arg2);
    };
    imports.wbg.__wbg_scrollTop_a9bb1dc2c9c6aed7 = function(arg0) {
        const ret = arg0.scrollTop;
        return ret;
    };
    imports.wbg.__wbg_searchParams_bc926163e047442f = function(arg0) {
        const ret = arg0.searchParams;
        return ret;
    };
    imports.wbg.__wbg_search_856af82f9dccb2ef = function() { return handleError(function (arg0, arg1) {
        const ret = arg1.search;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    }, arguments) };
    imports.wbg.__wbg_search_dbf031078dd8e645 = function(arg0, arg1) {
        const ret = arg1.search;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_setAttribute_34747dd193f45828 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setContent_866fea0e485a2094 = function(arg0, arg1) {
        const ret = arg0.setContent(arg1);
        return ret;
    };
    imports.wbg.__wbg_setCustomValidity_7cefa7e357784966 = function(arg0, arg1, arg2) {
        arg0.setCustomValidity(getStringFromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_setIcon_b973794c93b78db0 = function(arg0, arg1) {
        arg0.setIcon(arg1);
    };
    imports.wbg.__wbg_setLatLng_703a08551d8226ec = function(arg0, arg1) {
        arg0.setLatLng(arg1);
    };
    imports.wbg.__wbg_setLatLngs_b7008ab2f2569d9b = function(arg0, arg1) {
        const ret = arg0.setLatLngs(arg1);
        return ret;
    };
    imports.wbg.__wbg_setOpacity_63b9deacc14e619e = function(arg0, arg1) {
        arg0.setOpacity(arg1);
    };
    imports.wbg.__wbg_setProperty_f27b2c05323daf8a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        arg0.setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setStyle_a7d8be92cddd67a5 = function(arg0, arg1) {
        arg0.setStyle(arg1);
    };
    imports.wbg.__wbg_setTimeout_06477c23d31efef1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = arg0.setTimeout(arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_4ec014681668a581 = function(arg0, arg1) {
        const ret = setTimeout(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbg_set_169e13b608078b7b = function(arg0, arg1, arg2) {
        arg0.set(getArrayU8FromWasm0(arg1, arg2));
    };
    imports.wbg.__wbg_set_781438a03c0c3c81 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_set_alt_3e9469345053e91a = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.alt = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_attribution_988792154344a1f4 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.attribution = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_attribution_c34414ee161c4f64 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.attribution = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_autoClose_9205e1bcbd51d237 = function(arg0, arg1) {
        arg0.autoClose = arg1 !== 0;
    };
    imports.wbg.__wbg_set_autoPanPaddingBottomRight_7e22d0b4c1e0b06a = function(arg0, arg1) {
        arg0.autoPanPaddingBottomRight = arg1;
    };
    imports.wbg.__wbg_set_autoPanPaddingTopLeft_fdc6f2a58f16f6b2 = function(arg0, arg1) {
        arg0.autoPanPaddingTopLeft = arg1;
    };
    imports.wbg.__wbg_set_autoPanPadding_6a17f838fdfbdda4 = function(arg0, arg1) {
        arg0.autoPanPadding = arg1;
    };
    imports.wbg.__wbg_set_autoPanPadding_874000bf32634fdf = function(arg0, arg1) {
        arg0.autoPanPadding = arg1;
    };
    imports.wbg.__wbg_set_autoPanSpeed_3516dbb61137daf0 = function(arg0, arg1) {
        arg0.autoPanSpeed = arg1;
    };
    imports.wbg.__wbg_set_autoPan_7b83353c74ebf6c9 = function(arg0, arg1) {
        arg0.autoPan = arg1 !== 0;
    };
    imports.wbg.__wbg_set_autoPan_ad2fad14babca81e = function(arg0, arg1) {
        arg0.autoPan = arg1 !== 0;
    };
    imports.wbg.__wbg_set_body_8e743242d6076a4f = function(arg0, arg1) {
        arg0.body = arg1;
    };
    imports.wbg.__wbg_set_bubblingMouseEvents_464b089714e277a1 = function(arg0, arg1) {
        arg0.bubblingMouseEvents = arg1 !== 0;
    };
    imports.wbg.__wbg_set_bubblingMouseEvents_86c023fcfaf7346f = function(arg0, arg1) {
        arg0.bubblingMouseEvents = arg1 !== 0;
    };
    imports.wbg.__wbg_set_cache_0e437c7c8e838b9b = function(arg0, arg1) {
        arg0.cache = __wbindgen_enum_RequestCache[arg1];
    };
    imports.wbg.__wbg_set_center_dc848d456a25e38a = function(arg0, arg1) {
        arg0.center = arg1;
    };
    imports.wbg.__wbg_set_className_57b7affad903b198 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.className = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_className_6d7afc22efe41bd6 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.className = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_className_f0aafe9fb4645e46 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.className = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_closeButton_901f77b9b3969003 = function(arg0, arg1) {
        arg0.closeButton = arg1 !== 0;
    };
    imports.wbg.__wbg_set_closeOnClick_1d385b93e8aa45f7 = function(arg0, arg1) {
        arg0.closeOnClick = arg1 !== 0;
    };
    imports.wbg.__wbg_set_closeOnEscapeKey_e67297aa6fe6ff09 = function(arg0, arg1) {
        arg0.closeOnEscapeKey = arg1 !== 0;
    };
    imports.wbg.__wbg_set_color_6f7ead0cab43383e = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.color = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_credentials_55ae7c3c106fd5be = function(arg0, arg1) {
        arg0.credentials = __wbindgen_enum_RequestCredentials[arg1];
    };
    imports.wbg.__wbg_set_dashArray_506ffe7aa14a8940 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.dashArray = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_dashOffset_db395820f47eaa60 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.dashOffset = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_doubleClickZoom_aa3d6e30f8b7fe52 = function(arg0, arg1) {
        arg0.doubleClickZoom = arg1;
    };
    imports.wbg.__wbg_set_draggable_6fef87cab5e4e62b = function(arg0, arg1) {
        arg0.draggable = arg1 !== 0;
    };
    imports.wbg.__wbg_set_enable_high_accuracy_0d29aa77ae769a3f = function(arg0, arg1) {
        arg0.enableHighAccuracy = arg1 !== 0;
    };
    imports.wbg.__wbg_set_fillColor_808ac5c068fa52eb = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.fillColor = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_fillOpacity_109e949b49a45121 = function(arg0, arg1) {
        arg0.fillOpacity = arg1;
    };
    imports.wbg.__wbg_set_fillRule_e41758fe14ca2b39 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.fillRule = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_fill_d92374af00a8090b = function(arg0, arg1) {
        arg0.fill = arg1 !== 0;
    };
    imports.wbg.__wbg_set_headers_5671cf088e114d2b = function(arg0, arg1) {
        arg0.headers = arg1;
    };
    imports.wbg.__wbg_set_href_851b22e9bb498129 = function() { return handleError(function (arg0, arg1, arg2) {
        arg0.href = getStringFromWasm0(arg1, arg2);
    }, arguments) };
    imports.wbg.__wbg_set_iconAnchor_02d5969150a87656 = function(arg0, arg1) {
        arg0.iconAnchor = arg1;
    };
    imports.wbg.__wbg_set_iconAnchor_fcc8498c1be8bb85 = function(arg0, arg1) {
        arg0.iconAnchor = arg1;
    };
    imports.wbg.__wbg_set_iconSize_a47b6068dc72094c = function(arg0, arg1) {
        arg0.iconSize = arg1;
    };
    imports.wbg.__wbg_set_iconSize_fce3f68c35eb0d10 = function(arg0, arg1) {
        arg0.iconSize = arg1;
    };
    imports.wbg.__wbg_set_iconUrl_f3d9e9485eb34104 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.iconUrl = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_icon_5e30d35ec07ffc0e = function(arg0, arg1) {
        arg0.icon = arg1;
    };
    imports.wbg.__wbg_set_id_702da6e1bcec3b45 = function(arg0, arg1, arg2) {
        arg0.id = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_innerHTML_f1d03f780518a596 = function(arg0, arg1, arg2) {
        arg0.innerHTML = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_interactive_6aa70d1d20925af7 = function(arg0, arg1) {
        arg0.interactive = arg1 !== 0;
    };
    imports.wbg.__wbg_set_interactive_b8a698d636e1a0cc = function(arg0, arg1) {
        arg0.interactive = arg1 !== 0;
    };
    imports.wbg.__wbg_set_keepInView_d0590b510fcc500a = function(arg0, arg1) {
        arg0.keepInView = arg1 !== 0;
    };
    imports.wbg.__wbg_set_keyboard_6d062212152fe37c = function(arg0, arg1) {
        arg0.keyboard = arg1 !== 0;
    };
    imports.wbg.__wbg_set_lineCap_b7658e4361459872 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.lineCap = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_lineJoin_4ba48b49e32d2429 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.lineJoin = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_maxWidth_abf77c01419fe4c1 = function(arg0, arg1) {
        arg0.maxWidth = arg1;
    };
    imports.wbg.__wbg_set_maxZoom_0ad747ee63ed49e7 = function(arg0, arg1) {
        arg0.maxZoom = arg1;
    };
    imports.wbg.__wbg_set_maximum_age_3a8ab9f946156557 = function(arg0, arg1) {
        arg0.maximumAge = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_method_76c69e41b3570627 = function(arg0, arg1, arg2) {
        arg0.method = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_minWidth_2ec6e0cdaae1f4ff = function(arg0, arg1) {
        arg0.minWidth = arg1;
    };
    imports.wbg.__wbg_set_minZoom_4de3b890f0b6dfe1 = function(arg0, arg1) {
        arg0.minZoom = arg1;
    };
    imports.wbg.__wbg_set_minZoom_b969ad49e3731ad3 = function(arg0, arg1) {
        arg0.minZoom = arg1;
    };
    imports.wbg.__wbg_set_mode_611016a6818fc690 = function(arg0, arg1) {
        arg0.mode = __wbindgen_enum_RequestMode[arg1];
    };
    imports.wbg.__wbg_set_noClip_cb42d4963b02c8db = function(arg0, arg1) {
        arg0.noClip = arg1 !== 0;
    };
    imports.wbg.__wbg_set_nodeValue_997d7696f2c5d4bd = function(arg0, arg1, arg2) {
        arg0.nodeValue = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_offset_65c4edaabbe475e2 = function(arg0, arg1) {
        arg0.offset = arg1;
    };
    imports.wbg.__wbg_set_opacity_1ec826709414d899 = function(arg0, arg1) {
        arg0.opacity = arg1;
    };
    imports.wbg.__wbg_set_opacity_7e645d6765957c76 = function(arg0, arg1) {
        arg0.opacity = arg1;
    };
    imports.wbg.__wbg_set_pane_3bbfea144a749aa2 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.pane = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_pane_49b282a82f382d27 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.pane = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_preferCanvas_d587fcdaef517706 = function(arg0, arg1) {
        arg0.preferCanvas = arg1 !== 0;
    };
    imports.wbg.__wbg_set_riseOffset_124833d0f66b2339 = function(arg0, arg1) {
        arg0.riseOffset = arg1;
    };
    imports.wbg.__wbg_set_riseOnHover_dff41f625109a1f8 = function(arg0, arg1) {
        arg0.riseOnHover = arg1 !== 0;
    };
    imports.wbg.__wbg_set_scrollLeft_b4cda859c2fa1e56 = function(arg0, arg1) {
        arg0.scrollLeft = arg1;
    };
    imports.wbg.__wbg_set_scrollTop_541712f061a7c649 = function(arg0, arg1) {
        arg0.scrollTop = arg1;
    };
    imports.wbg.__wbg_set_scrollWheelZoom_e3276db9225b34cb = function(arg0, arg1) {
        arg0.scrollWheelZoom = arg1 !== 0;
    };
    imports.wbg.__wbg_set_shadowPane_9d1417483811e990 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.shadowPane = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_signal_e89be862d0091009 = function(arg0, arg1) {
        arg0.signal = arg1;
    };
    imports.wbg.__wbg_set_smoothFactor_281511201854a5ae = function(arg0, arg1) {
        arg0.smoothFactor = arg1;
    };
    imports.wbg.__wbg_set_stroke_51e382b6e11301a1 = function(arg0, arg1) {
        arg0.stroke = arg1 !== 0;
    };
    imports.wbg.__wbg_set_textContent_e461237efe237e01 = function(arg0, arg1, arg2) {
        arg0.textContent = arg1 === 0 ? undefined : getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_timeout_b02ec0df65439ef3 = function(arg0, arg1) {
        arg0.timeout = arg1 >>> 0;
    };
    imports.wbg.__wbg_set_title_0adf81d19495bec0 = function(arg0, arg1, arg2) {
        let deferred0_0;
        let deferred0_1;
        try {
            deferred0_0 = arg1;
            deferred0_1 = arg2;
            arg0.title = getStringFromWasm0(arg1, arg2);
        } finally {
            wasm.__wbindgen_free(deferred0_0, deferred0_1, 1);
        }
    };
    imports.wbg.__wbg_set_top_24ffb0a67b7cb634 = function(arg0, arg1) {
        arg0.top = arg1;
    };
    imports.wbg.__wbg_set_value_30f4d5ef18749d90 = function(arg0, arg1, arg2) {
        arg0.value = getStringFromWasm0(arg1, arg2);
    };
    imports.wbg.__wbg_set_weight_e7b4c7a14e8a5769 = function(arg0, arg1) {
        arg0.weight = arg1;
    };
    imports.wbg.__wbg_set_zIndexOffset_cede9f57ffc7a07c = function(arg0, arg1) {
        arg0.zIndexOffset = arg1;
    };
    imports.wbg.__wbg_set_zoomControl_5194bb8f60f7fbe3 = function(arg0, arg1) {
        arg0.zoomControl = arg1 !== 0;
    };
    imports.wbg.__wbg_set_zoomDelta_7e2285b827ef9aae = function(arg0, arg1) {
        arg0.zoomDelta = arg1;
    };
    imports.wbg.__wbg_set_zoomSnap_00a44f4eefb18369 = function(arg0, arg1) {
        arg0.zoomSnap = arg1;
    };
    imports.wbg.__wbg_set_zoom_4ecab855961ce9be = function(arg0, arg1) {
        arg0.zoom = arg1;
    };
    imports.wbg.__wbg_shiftKey_a6df227a917d203b = function(arg0) {
        const ret = arg0.shiftKey;
        return ret;
    };
    imports.wbg.__wbg_signal_3c14fbdc89694b39 = function(arg0) {
        const ret = arg0.signal;
        return ret;
    };
    imports.wbg.__wbg_stack_0ed75d68575b0f3c = function(arg0, arg1) {
        const ret = arg1.stack;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_769e6b65d6557335 = function() {
        const ret = typeof global === 'undefined' ? null : global;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_GLOBAL_THIS_60cf02db4de8e1c1 = function() {
        const ret = typeof globalThis === 'undefined' ? null : globalThis;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_SELF_08f5a74c69739274 = function() {
        const ret = typeof self === 'undefined' ? null : self;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_static_accessor_WINDOW_a8924b26aa92d024 = function() {
        const ret = typeof window === 'undefined' ? null : window;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_status_9bfc680efca4bdfd = function(arg0) {
        const ret = arg0.status;
        return ret;
    };
    imports.wbg.__wbg_stopPropagation_611935c25ee35a3c = function(arg0) {
        arg0.stopPropagation();
    };
    imports.wbg.__wbg_stringify_655a6390e1f5eb6b = function() { return handleError(function (arg0) {
        const ret = JSON.stringify(arg0);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_style_521a717da50e53c6 = function(arg0) {
        const ret = arg0.style;
        return ret;
    };
    imports.wbg.__wbg_tagName_e36b1c5d14a00d3f = function(arg0, arg1) {
        const ret = arg1.tagName;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_target_0e3e05a6263c37a0 = function(arg0) {
        const ret = arg0.target;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_target_e0867bf2c5a25124 = function(arg0, arg1) {
        const ret = arg1.target;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_then_429f7caf1026411d = function(arg0, arg1, arg2) {
        const ret = arg0.then(arg1, arg2);
        return ret;
    };
    imports.wbg.__wbg_then_4f95312d68691235 = function(arg0, arg1) {
        const ret = arg0.then(arg1);
        return ret;
    };
    imports.wbg.__wbg_timestamp_eba4bf04abe6201f = function(arg0) {
        const ret = arg0.timestamp;
        return ret;
    };
    imports.wbg.__wbg_top_7d5b82a2c5d7f13f = function(arg0) {
        const ret = arg0.top;
        return ret;
    };
    imports.wbg.__wbg_url_b6d11838a4f95198 = function(arg0, arg1) {
        const ret = arg1.url;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_value_2c75ca481407d038 = function(arg0, arg1) {
        const ret = arg1.value;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_value_57b7b035e117f7ee = function(arg0) {
        const ret = arg0.value;
        return ret;
    };
    imports.wbg.__wbg_value_5ea6e5ab9f609290 = function(arg0, arg1) {
        const ret = arg1.value;
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
        getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
    };
    imports.wbg.__wbg_view_788aaf149deefd2f = function(arg0) {
        const ret = arg0.view;
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    };
    imports.wbg.__wbg_warn_6e567d0d926ff881 = function(arg0) {
        console.warn(arg0);
    };
    imports.wbg.__wbg_watchPosition_c856abdd29224a3d = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = arg0.watchPosition(arg1, arg2, arg3);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_width_2ea6e6731430a171 = function(arg0) {
        const ret = arg0.width;
        return ret;
    };
    imports.wbg.__wbindgen_cast_2241b6af4c4b2941 = function(arg0, arg1) {
        // Cast intrinsic for `Ref(String) -> Externref`.
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_cast_28d0092abe182f8f = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [NamedExternref("Position")], shim_idx: 92, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__h0823683991661f7a);
        return ret;
    };
    imports.wbg.__wbindgen_cast_8497288b3b9bb1d0 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [], shim_idx: 98, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__hc1acf21124483a86);
        return ret;
    };
    imports.wbg.__wbindgen_cast_94e393bd40a0cef2 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [Externref], shim_idx: 100, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__h5793e10bfaaf1707);
        return ret;
    };
    imports.wbg.__wbindgen_cast_991e76cd024f2319 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [NamedExternref("Event")], shim_idx: 100, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__h5793e10bfaaf1707);
        return ret;
    };
    imports.wbg.__wbindgen_cast_a4adb7faaff067e1 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [Externref], shim_idx: 92, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__h0823683991661f7a);
        return ret;
    };
    imports.wbg.__wbindgen_cast_ca5a9fc4b7f90a8c = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [NamedExternref("PositionError")], shim_idx: 92, ret: Unit, inner_ret: Some(Unit) }, mutable: false }) -> Externref`.
        const ret = makeClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__h0823683991661f7a);
        return ret;
    };
    imports.wbg.__wbindgen_cast_d6cd19b81560fd6e = function(arg0) {
        // Cast intrinsic for `F64 -> Externref`.
        const ret = arg0;
        return ret;
    };
    imports.wbg.__wbindgen_cast_d9a02d1f68a7fb68 = function(arg0, arg1) {
        // Cast intrinsic for `Closure(Closure { dtor_idx: 72, function: Function { arguments: [], shim_idx: 73, ret: Unit, inner_ret: Some(Unit) }, mutable: true }) -> Externref`.
        const ret = makeMutClosure(arg0, arg1, wasm.wasm_bindgen__closure__destroy__h28d0d6c3d75edc7c, wasm_bindgen__convert__closures_____invoke__h5c6de5859ba9739a);
        return ret;
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_externrefs;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
    };

    return imports;
}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedDataViewMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('wui_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;
