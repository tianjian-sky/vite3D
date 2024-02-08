
#include <emscripten.h>

EM_JS_DEPS(webidl_binder, "$intArrayFromString");

extern "C" {

// Not using size_t for array indices as the values used by the javascript code are signed.

EM_JS(void, array_bounds_check_error, (size_t idx, size_t size), {
  throw 'Array index ' + idx + ' out of bounds: [0,' + size + ')';
});

void array_bounds_check(const int array_size, const int array_idx) {
  if (array_idx < 0 || array_idx >= array_size) {
    array_bounds_check_error(array_idx, array_size);
  }
}

// VoidPtr

void EMSCRIPTEN_KEEPALIVE emscripten_bind_VoidPtr___destroy___0(void** self) {
  delete self;
}

// Foo

Foo* EMSCRIPTEN_KEEPALIVE emscripten_bind_Foo_Foo_0() {
  return new Foo();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_Foo_getVal_0(Foo* self) {
  return self->getVal();
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Foo_setVal_1(Foo* self, int v) {
  self->setVal(v);
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_Foo_get_value_0(Foo* self) {
  return self->value;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Foo_set_value_1(Foo* self, int arg0) {
  self->value = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Foo___destroy___0(Foo* self) {
  delete self;
}

// Bar

Bar* EMSCRIPTEN_KEEPALIVE emscripten_bind_Bar_Bar_1(int val) {
  return new Bar(val);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Bar_doSomething_0(Bar* self) {
  self->doSomething();
}

int EMSCRIPTEN_KEEPALIVE emscripten_bind_Bar_get_value_0(Bar* self) {
  return self->value;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Bar_set_value_1(Bar* self, int arg0) {
  self->value = arg0;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Bar___destroy___0(Bar* self) {
  delete self;
}

// Matrix4

Matrix4* EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_Matrix4_0() {
  return new Matrix4();
}

Matrix4* EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_Matrix4_16(float e1, float e2, float e3, float e4, float e5, float e6, float e7, float e8, float e9, float e10, float e11, float e12, float e13, float e14, float e15, float e16) {
  return new Matrix4(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_setElements_16(Matrix4* self, float e1, float e2, float e3, float e4, float e5, float e6, float e7, float e8, float e9, float e10, float e11, float e12, float e13, float e14, float e15, float e16) {
  self->setElements(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_getElement_1(Matrix4* self, int index) {
  return self->getElement(index);
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_multiply_2(Matrix4* self, Matrix4* a, Matrix4* b) {
  self->multiply(a, b);
}

float EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_get_elements_1(Matrix4* self, int arg0) {
  return self->elements[arg0];
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4_set_elements_2(Matrix4* self, int arg0, float arg1) {
  self->elements[arg0] = arg1;
}

void EMSCRIPTEN_KEEPALIVE emscripten_bind_Matrix4___destroy___0(Matrix4* self) {
  delete self;
}

}

