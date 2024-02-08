
// Bindings utilities

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function WrapperObject() {
}
WrapperObject.prototype = Object.create(WrapperObject.prototype);
WrapperObject.prototype.constructor = WrapperObject;
WrapperObject.prototype.__class__ = WrapperObject;
WrapperObject.__cache__ = {};
Module['WrapperObject'] = WrapperObject;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function getCache(__class__) {
  return (__class__ || WrapperObject).__cache__;
}
Module['getCache'] = getCache;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant)
    @param {*=} __class__ */
function wrapPointer(ptr, __class__) {
  var cache = getCache(__class__);
  var ret = cache[ptr];
  if (ret) return ret;
  ret = Object.create((__class__ || WrapperObject).prototype);
  ret.ptr = ptr;
  return cache[ptr] = ret;
}
Module['wrapPointer'] = wrapPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function castObject(obj, __class__) {
  return wrapPointer(obj.ptr, __class__);
}
Module['castObject'] = castObject;

Module['NULL'] = wrapPointer(0);

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function destroy(obj) {
  if (!obj['__destroy__']) throw 'Error: Cannot destroy object. (Did you create it yourself?)';
  obj['__destroy__']();
  // Remove from cache, so the object can be GC'd and refs added onto it released
  delete getCache(obj.__class__)[obj.ptr];
}
Module['destroy'] = destroy;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function compare(obj1, obj2) {
  return obj1.ptr === obj2.ptr;
}
Module['compare'] = compare;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getPointer(obj) {
  return obj.ptr;
}
Module['getPointer'] = getPointer;

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function getClass(obj) {
  return obj.__class__;
}
Module['getClass'] = getClass;

// Converts big (string or array) values into a C-style storage, in temporary space

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
var ensureCache = {
  buffer: 0,  // the main buffer of temporary storage
  size: 0,   // the size of buffer
  pos: 0,    // the next free offset in buffer
  temps: [], // extra allocations
  needed: 0, // the total size we need next time

  prepare: function() {
    if (ensureCache.needed) {
      // clear the temps
      for (var i = 0; i < ensureCache.temps.length; i++) {
        Module['_free'](ensureCache.temps[i]);
      }
      ensureCache.temps.length = 0;
      // prepare to allocate a bigger buffer
      Module['_free'](ensureCache.buffer);
      ensureCache.buffer = 0;
      ensureCache.size += ensureCache.needed;
      // clean up
      ensureCache.needed = 0;
    }
    if (!ensureCache.buffer) { // happens first time, or when we need to grow
      ensureCache.size += 128; // heuristic, avoid many small grow events
      ensureCache.buffer = Module['_malloc'](ensureCache.size);
      assert(ensureCache.buffer);
    }
    ensureCache.pos = 0;
  },
  alloc: function(array, view) {
    assert(ensureCache.buffer);
    var bytes = view.BYTES_PER_ELEMENT;
    var len = array.length * bytes;
    len = (len + 7) & -8; // keep things aligned to 8 byte boundaries
    var ret;
    if (ensureCache.pos + len >= ensureCache.size) {
      // we failed to allocate in the buffer, ensureCache time around :(
      assert(len > 0); // null terminator, at least
      ensureCache.needed += len;
      ret = Module['_malloc'](len);
      ensureCache.temps.push(ret);
    } else {
      // we can allocate in the buffer
      ret = ensureCache.buffer + ensureCache.pos;
      ensureCache.pos += len;
    }
    return ret;
  },
  copy: function(array, view, offset) {
    offset >>>= 0;
    var bytes = view.BYTES_PER_ELEMENT;
    switch (bytes) {
      case 2: offset >>>= 1; break;
      case 4: offset >>>= 2; break;
      case 8: offset >>>= 3; break;
    }
    for (var i = 0; i < array.length; i++) {
      view[offset + i] = array[i];
    }
  },
};

/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureString(value) {
  if (typeof value === 'string') {
    var intArray = intArrayFromString(value);
    var offset = ensureCache.alloc(intArray, HEAP8);
    ensureCache.copy(intArray, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt8(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP8);
    ensureCache.copy(value, HEAP8, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt16(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP16);
    ensureCache.copy(value, HEAP16, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureInt32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAP32);
    ensureCache.copy(value, HEAP32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat32(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF32);
    ensureCache.copy(value, HEAPF32, offset);
    return offset;
  }
  return value;
}
/** @suppress {duplicate} (TODO: avoid emitting this multiple times, it is redundant) */
function ensureFloat64(value) {
  if (typeof value === 'object') {
    var offset = ensureCache.alloc(value, HEAPF64);
    ensureCache.copy(value, HEAPF64, offset);
    return offset;
  }
  return value;
}


// VoidPtr
/** @suppress {undefinedVars, duplicate} @this{Object} */function VoidPtr() { throw "cannot construct a VoidPtr, no constructor in IDL" }
VoidPtr.prototype = Object.create(WrapperObject.prototype);
VoidPtr.prototype.constructor = VoidPtr;
VoidPtr.prototype.__class__ = VoidPtr;
VoidPtr.__cache__ = {};
Module['VoidPtr'] = VoidPtr;

  VoidPtr.prototype['__destroy__'] = VoidPtr.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_VoidPtr___destroy___0(self);
};
// Foo
/** @suppress {undefinedVars, duplicate} @this{Object} */function Foo() {
  this.ptr = _emscripten_bind_Foo_Foo_0();
  getCache(Foo)[this.ptr] = this;
};;
Foo.prototype = Object.create(WrapperObject.prototype);
Foo.prototype.constructor = Foo;
Foo.prototype.__class__ = Foo;
Foo.__cache__ = {};
Module['Foo'] = Foo;

Foo.prototype['getVal'] = Foo.prototype.getVal = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Foo_getVal_0(self);
};;

Foo.prototype['setVal'] = Foo.prototype.setVal = /** @suppress {undefinedVars, duplicate} @this{Object} */function(v) {
  var self = this.ptr;
  if (v && typeof v === 'object') v = v.ptr;
  _emscripten_bind_Foo_setVal_1(self, v);
};;

  Foo.prototype['get_value'] = Foo.prototype.get_value = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Foo_get_value_0(self);
};
    Foo.prototype['set_value'] = Foo.prototype.set_value = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_Foo_set_value_1(self, arg0);
};
    Object.defineProperty(Foo.prototype, 'value', { get: Foo.prototype.get_value, set: Foo.prototype.set_value });
  Foo.prototype['__destroy__'] = Foo.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Foo___destroy___0(self);
};
// Bar
/** @suppress {undefinedVars, duplicate} @this{Object} */function Bar(val) {
  if (val && typeof val === 'object') val = val.ptr;
  this.ptr = _emscripten_bind_Bar_Bar_1(val);
  getCache(Bar)[this.ptr] = this;
};;
Bar.prototype = Object.create(WrapperObject.prototype);
Bar.prototype.constructor = Bar;
Bar.prototype.__class__ = Bar;
Bar.__cache__ = {};
Module['Bar'] = Bar;

Bar.prototype['doSomething'] = Bar.prototype.doSomething = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Bar_doSomething_0(self);
};;

  Bar.prototype['get_value'] = Bar.prototype.get_value = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  return _emscripten_bind_Bar_get_value_0(self);
};
    Bar.prototype['set_value'] = Bar.prototype.set_value = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  _emscripten_bind_Bar_set_value_1(self, arg0);
};
    Object.defineProperty(Bar.prototype, 'value', { get: Bar.prototype.get_value, set: Bar.prototype.set_value });
  Bar.prototype['__destroy__'] = Bar.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Bar___destroy___0(self);
};
// Matrix4
/** @suppress {undefinedVars, duplicate} @this{Object} */function Matrix4(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16) {
  if (e1 && typeof e1 === 'object') e1 = e1.ptr;
  if (e2 && typeof e2 === 'object') e2 = e2.ptr;
  if (e3 && typeof e3 === 'object') e3 = e3.ptr;
  if (e4 && typeof e4 === 'object') e4 = e4.ptr;
  if (e5 && typeof e5 === 'object') e5 = e5.ptr;
  if (e6 && typeof e6 === 'object') e6 = e6.ptr;
  if (e7 && typeof e7 === 'object') e7 = e7.ptr;
  if (e8 && typeof e8 === 'object') e8 = e8.ptr;
  if (e9 && typeof e9 === 'object') e9 = e9.ptr;
  if (e10 && typeof e10 === 'object') e10 = e10.ptr;
  if (e11 && typeof e11 === 'object') e11 = e11.ptr;
  if (e12 && typeof e12 === 'object') e12 = e12.ptr;
  if (e13 && typeof e13 === 'object') e13 = e13.ptr;
  if (e14 && typeof e14 === 'object') e14 = e14.ptr;
  if (e15 && typeof e15 === 'object') e15 = e15.ptr;
  if (e16 && typeof e16 === 'object') e16 = e16.ptr;
  if (e1 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_0(); getCache(Matrix4)[this.ptr] = this;return }
  if (e2 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_1(e1); getCache(Matrix4)[this.ptr] = this;return }
  if (e3 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_2(e1, e2); getCache(Matrix4)[this.ptr] = this;return }
  if (e4 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_3(e1, e2, e3); getCache(Matrix4)[this.ptr] = this;return }
  if (e5 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_4(e1, e2, e3, e4); getCache(Matrix4)[this.ptr] = this;return }
  if (e6 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_5(e1, e2, e3, e4, e5); getCache(Matrix4)[this.ptr] = this;return }
  if (e7 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_6(e1, e2, e3, e4, e5, e6); getCache(Matrix4)[this.ptr] = this;return }
  if (e8 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_7(e1, e2, e3, e4, e5, e6, e7); getCache(Matrix4)[this.ptr] = this;return }
  if (e9 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_8(e1, e2, e3, e4, e5, e6, e7, e8); getCache(Matrix4)[this.ptr] = this;return }
  if (e10 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_9(e1, e2, e3, e4, e5, e6, e7, e8, e9); getCache(Matrix4)[this.ptr] = this;return }
  if (e11 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_10(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10); getCache(Matrix4)[this.ptr] = this;return }
  if (e12 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_11(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11); getCache(Matrix4)[this.ptr] = this;return }
  if (e13 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_12(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12); getCache(Matrix4)[this.ptr] = this;return }
  if (e14 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_13(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13); getCache(Matrix4)[this.ptr] = this;return }
  if (e15 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_14(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14); getCache(Matrix4)[this.ptr] = this;return }
  if (e16 === undefined) { this.ptr = _emscripten_bind_Matrix4_Matrix4_15(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15); getCache(Matrix4)[this.ptr] = this;return }
  this.ptr = _emscripten_bind_Matrix4_Matrix4_16(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16);
  getCache(Matrix4)[this.ptr] = this;
};;
Matrix4.prototype = Object.create(WrapperObject.prototype);
Matrix4.prototype.constructor = Matrix4;
Matrix4.prototype.__class__ = Matrix4;
Matrix4.__cache__ = {};
Module['Matrix4'] = Matrix4;

Matrix4.prototype['setElements'] = Matrix4.prototype.setElements = /** @suppress {undefinedVars, duplicate} @this{Object} */function(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16) {
  var self = this.ptr;
  if (e1 && typeof e1 === 'object') e1 = e1.ptr;
  if (e2 && typeof e2 === 'object') e2 = e2.ptr;
  if (e3 && typeof e3 === 'object') e3 = e3.ptr;
  if (e4 && typeof e4 === 'object') e4 = e4.ptr;
  if (e5 && typeof e5 === 'object') e5 = e5.ptr;
  if (e6 && typeof e6 === 'object') e6 = e6.ptr;
  if (e7 && typeof e7 === 'object') e7 = e7.ptr;
  if (e8 && typeof e8 === 'object') e8 = e8.ptr;
  if (e9 && typeof e9 === 'object') e9 = e9.ptr;
  if (e10 && typeof e10 === 'object') e10 = e10.ptr;
  if (e11 && typeof e11 === 'object') e11 = e11.ptr;
  if (e12 && typeof e12 === 'object') e12 = e12.ptr;
  if (e13 && typeof e13 === 'object') e13 = e13.ptr;
  if (e14 && typeof e14 === 'object') e14 = e14.ptr;
  if (e15 && typeof e15 === 'object') e15 = e15.ptr;
  if (e16 && typeof e16 === 'object') e16 = e16.ptr;
  _emscripten_bind_Matrix4_setElements_16(self, e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16);
};;

Matrix4.prototype['getElement'] = Matrix4.prototype.getElement = /** @suppress {undefinedVars, duplicate} @this{Object} */function(index) {
  var self = this.ptr;
  if (index && typeof index === 'object') index = index.ptr;
  return _emscripten_bind_Matrix4_getElement_1(self, index);
};;

Matrix4.prototype['multiply'] = Matrix4.prototype.multiply = /** @suppress {undefinedVars, duplicate} @this{Object} */function(a, b) {
  var self = this.ptr;
  if (a && typeof a === 'object') a = a.ptr;
  if (b && typeof b === 'object') b = b.ptr;
  _emscripten_bind_Matrix4_multiply_2(self, a, b);
};;

  Matrix4.prototype['get_elements'] = Matrix4.prototype.get_elements = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0) {
  var self = this.ptr;
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  return _emscripten_bind_Matrix4_get_elements_1(self, arg0);
};
    Matrix4.prototype['set_elements'] = Matrix4.prototype.set_elements = /** @suppress {undefinedVars, duplicate} @this{Object} */function(arg0, arg1) {
  var self = this.ptr;
  ensureCache.prepare();
  if (arg0 && typeof arg0 === 'object') arg0 = arg0.ptr;
  if (arg1 && typeof arg1 === 'object') arg1 = arg1.ptr;
  _emscripten_bind_Matrix4_set_elements_2(self, arg0, arg1);
};
    Object.defineProperty(Matrix4.prototype, 'elements', { get: Matrix4.prototype.get_elements, set: Matrix4.prototype.set_elements });
  Matrix4.prototype['__destroy__'] = Matrix4.prototype.__destroy__ = /** @suppress {undefinedVars, duplicate} @this{Object} */function() {
  var self = this.ptr;
  _emscripten_bind_Matrix4___destroy___0(self);
};