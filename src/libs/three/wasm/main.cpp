#include <iostream>
#include <stdlib.h>
#include <array>
#include <emscripten/emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/console.h>
#include <emscripten/val.h>

using namespace std;

EM_JS(void, print_args, (float x, float y), {
    console.log('I received: ' + x + ', ' + y);
});

float lerp(float a, float b, float t)
{
    return (1 - t) * a + t * b;
}

EMSCRIPTEN_BINDINGS(module)
{
    emscripten::function("lerp", &lerp);
}

struct Point2f
{
    float x;
    float y;
};

struct PersonRecord
{
    std::string name;
    int age;
};

struct ArrayInStruct
{
    int field[2];
};

PersonRecord findPersonAtLocation(Point2f pt)
{
    PersonRecord res;
    res.name = "yutianjian";
    res.age = 37;
    return res;
}

EMSCRIPTEN_BINDINGS(my_value_example)
{
    emscripten::value_array<Point2f>("Point2f")
        .element(&Point2f::x)
        .element(&Point2f::y);

    emscripten::value_object<PersonRecord>("PersonRecord")
        .field("name", &PersonRecord::name)
        .field("age", &PersonRecord::age);

    emscripten::value_object<ArrayInStruct>("ArrayInStruct")
        .field("field", &ArrayInStruct::field) // Need to register the array type
        ;

    // Register std::array<int, 2> because ArrayInStruct::field is interpreted as such
    emscripten::value_array<std::array<int, 2>>("array_int_2")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>());

    emscripten::function("findPersonAtLocation", &findPersonAtLocation);
}

struct Matrix4f
{
    float a0;
    float a1;
    float a2;
    float a3;
    float a4;
    float a5;
    float a6;
    float a7;
    float a8;
    float a9;
    float a10;
    float a11;
    float a12;
    float a13;
    float a14;
    float a15;
};

struct FloatPointers2
{
    float *p0;
    float *p1;
};

struct Matrix4f4f
{
    float a0;
    float a1;
    float a2;
    float a3;
    float a4;
    float a5;
    float a6;
    float a7;
    float a8;
    float a9;
    float a10;
    float a11;
    float a12;
    float a13;
    float a14;
    float a15;
    float b0;
    float b1;
    float b2;
    float b3;
    float b4;
    float b5;
    float b6;
    float b7;
    float b8;
    float b9;
    float b10;
    float b11;
    float b12;
    float b13;
    float b14;
    float b15;
};

struct ArrayMat4
{
    int field[16];
};

std::array<float, 16> &mat4MultiplyMat4_2(Matrix4f4f &mat)
{
    std::array<float, 16> res;
    const float a11 = mat.a0;
    const float a12 = mat.a4;
    const float a13 = mat.a8;
    const float a14 = mat.a12;
    const float a21 = mat.a1;
    const float a22 = mat.a5;
    const float a23 = mat.a9;
    const float a24 = mat.a13;
    const float a31 = mat.a2;
    const float a32 = mat.a6;
    const float a33 = mat.a10;
    const float a34 = mat.a14;
    const float a41 = mat.a3;
    const float a42 = mat.a7;
    const float a43 = mat.a11;
    const float a44 = mat.a15;
    const float b11 = mat.b0;
    const float b12 = mat.b4;
    const float b13 = mat.b8;
    const float b14 = mat.b12;
    const float b21 = mat.b1;
    const float b22 = mat.b5;
    const float b23 = mat.b9;
    const float b24 = mat.b13;
    const float b31 = mat.b2;
    const float b32 = mat.b6;
    const float b33 = mat.b10;
    const float b34 = mat.b14;
    const float b41 = mat.b3;
    const float b42 = mat.b7;
    const float b43 = mat.b11;
    const float b44 = mat.b15;
    res[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    res[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    res[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    res[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    res[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    res[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    res[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    res[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    res[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    res[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    res[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    res[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    res[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    res[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    res[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    res[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return res;
}

void mat4MultiplyMat4_3(FloatPointers2 mats)
{
    std::array<float, 16> res;
    float *mat1 = mats.p0;
    float *mat2 = mats.p1;
    // float *mat1;
    // float *mat2;
    cout << mats.p0 << ":" << mats.p1 << endl;
    // mat1 = mats.p0;
    // mat2 = mats.p1;
    const float a11 = mat1[0];
    const float a12 = mat1[4];
    const float a13 = mat1[8];
    const float a14 = mat1[12];
    const float a21 = mat1[1];
    const float a22 = mat1[5];
    const float a23 = mat1[9];
    const float a24 = mat1[13];
    const float a31 = mat1[2];
    const float a32 = mat1[6];
    const float a33 = mat1[10];
    const float a34 = mat1[14];
    const float a41 = mat1[3];
    const float a42 = mat1[7];
    const float a43 = mat1[11];
    const float a44 = mat1[15];
    const float b11 = mat2[0];
    const float b12 = mat2[4];
    const float b13 = mat2[8];
    const float b14 = mat2[12];
    const float b21 = mat2[1];
    const float b22 = mat2[5];
    const float b23 = mat2[9];
    const float b24 = mat2[13];
    const float b31 = mat2[2];
    const float b32 = mat2[6];
    const float b33 = mat2[10];
    const float b34 = mat2[14];
    const float b41 = mat2[3];
    const float b42 = mat2[7];
    const float b43 = mat2[11];
    const float b44 = mat2[15];
    res[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    res[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    res[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    res[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    res[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    res[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    res[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    res[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    res[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    res[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    res[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    res[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    res[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    res[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    res[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    res[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    // return res;
}

/**
 *
 * Value arrays are converted to and from JavaScript Arrays
 * value objects are converted to and from JavaScript Objects.
 */
EMSCRIPTEN_BINDINGS(mat4)
{
    emscripten::value_array<Matrix4f4f>("Matrix4f4f")
        .element(&Matrix4f4f::a0)
        .element(&Matrix4f4f::a1)
        .element(&Matrix4f4f::a2)
        .element(&Matrix4f4f::a3)
        .element(&Matrix4f4f::a4)
        .element(&Matrix4f4f::a5)
        .element(&Matrix4f4f::a6)
        .element(&Matrix4f4f::a7)
        .element(&Matrix4f4f::a8)
        .element(&Matrix4f4f::a9)
        .element(&Matrix4f4f::a10)
        .element(&Matrix4f4f::a11)
        .element(&Matrix4f4f::a12)
        .element(&Matrix4f4f::a13)
        .element(&Matrix4f4f::a14)
        .element(&Matrix4f4f::a15)
        .element(&Matrix4f4f::b0)
        .element(&Matrix4f4f::b1)
        .element(&Matrix4f4f::b2)
        .element(&Matrix4f4f::b3)
        .element(&Matrix4f4f::b4)
        .element(&Matrix4f4f::b5)
        .element(&Matrix4f4f::b6)
        .element(&Matrix4f4f::b7)
        .element(&Matrix4f4f::b8)
        .element(&Matrix4f4f::b9)
        .element(&Matrix4f4f::b10)
        .element(&Matrix4f4f::b11)
        .element(&Matrix4f4f::b12)
        .element(&Matrix4f4f::b13)
        .element(&Matrix4f4f::b14)
        .element(&Matrix4f4f::b15);
    // emscripten::value_array<FloatPointers2>("FloatPointers2")
    //     .element(&FloatPointers2::p0)
    //     .element(&FloatPointers2::p1);
    emscripten::value_array<std::array<float, 16>>("ArrayMat4")
        .element(emscripten::index<0>())
        .element(emscripten::index<1>())
        .element(emscripten::index<2>())
        .element(emscripten::index<3>())
        .element(emscripten::index<4>())
        .element(emscripten::index<5>())
        .element(emscripten::index<6>())
        .element(emscripten::index<7>())
        .element(emscripten::index<8>())
        .element(emscripten::index<9>())
        .element(emscripten::index<10>())
        .element(emscripten::index<11>())
        .element(emscripten::index<12>())
        .element(emscripten::index<13>())
        .element(emscripten::index<14>())
        .element(emscripten::index<15>());
    emscripten::function("mat4MultiplyMat4_2", &mat4MultiplyMat4_2);
    // emscripten::function("mat4MultiplyMat4_3", &mat4MultiplyMat4_3, emscripten::allow_raw_pointers());
}

// static void embind_init_mat4();
// static struct EmBindInit_mat4 : emscripten::internal::InitFunc
// {
//     EmBindInit_mat4() : InitFunc(embind_init_mat4) {}
// } EmBindInit_mat4_instance;
// static void embind_init_mat4()
// {
//     emscripten::value_array<Matrix4f4f>("Matrix4f4f").element(&Matrix4f4f::a0);
//     emscripten::value_array<std::array<float, 16>>("ArrayMat4").element(emscripten::index<0>());
//     emscripten::function("mat4MultiplyMat4_2", &mat4MultiplyMat4_2);
// }

// EMSCRIPTEN_BINDINGS(mat4V2)
// {
//     emscripten::value_array<FloatPointers2>("FloatPointers2")
//         .element(&FloatPointers2::p0)
//         .element(&FloatPointers2::p1);
//     // emscripten::value_array<std::array<float, 16>>("jsArray16")
//     //     .element(emscripten::index<0>())
//     //     .element(emscripten::index<1>())
//     //     .element(emscripten::index<2>())
//     //     .element(emscripten::index<3>())
//     //     .element(emscripten::index<4>())
//     //     .element(emscripten::index<5>())
//     //     .element(emscripten::index<6>())
//     //     .element(emscripten::index<7>())
//     //     .element(emscripten::index<8>())
//     //     .element(emscripten::index<9>())
//     //     .element(emscripten::index<10>())
//     //     .element(emscripten::index<11>())
//     //     .element(emscripten::index<12>())
//     //     .element(emscripten::index<13>())
//     //     .element(emscripten::index<14>())
//     //     .element(emscripten::index<15>());
//     emscripten::function("mat4MultiplyMat4_3", &mat4MultiplyMat4_3, emscripten::allow_raw_pointers());
// }

extern "C"
{
    float *mat4MultiplyMat4(float *a, float *b)
    {
        float res[16];
        const float a11 = a[0];
        const float a12 = a[4];
        const float a13 = a[8];
        const float a14 = a[12];
        const float a21 = a[1];
        const float a22 = a[5];
        const float a23 = a[9];
        const float a24 = a[13];
        const float a31 = a[2];
        const float a32 = a[6];
        const float a33 = a[10];
        const float a34 = a[14];
        const float a41 = a[3];
        const float a42 = a[7];
        const float a43 = a[11];
        const float a44 = a[15];
        const float b11 = b[0];
        const float b12 = b[4];
        const float b13 = b[8];
        const float b14 = b[12];
        const float b21 = b[1];
        const float b22 = b[5];
        const float b23 = b[9];
        const float b24 = b[13];
        const float b31 = b[2];
        const float b32 = b[6];
        const float b33 = b[10];
        const float b34 = b[14];
        const float b41 = b[3];
        const float b42 = b[7];
        const float b43 = b[11];
        const float b44 = b[15];
        res[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        res[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        res[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        res[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        res[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        res[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        res[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        res[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        res[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        res[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        res[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        res[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        res[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        res[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        res[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        res[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
        return res;
    }

    void runJs2()
    {
        emscripten_run_script("console.log('runJs1')");
        int x = EM_ASM_INT({
            console.log('I received: ' + $0);
            return $0 + 1;
        },
                           100);
        printf("%d\n", x);
    }

    // c 调 js
    void mat4MultiplyMat4CallJs()
    {
        EM_ASM({
            const jsRegisters = Module.__jsRegisters; // 可以访问到Module对象
            if (jsRegisters.__registerMat4Multiply1 && jsRegisters.__registerMat4Multiply2)
            {
                if (jsRegisters.__registerMat4Multiply.multiplyMatricesFn)
                {
                    jsRegisters.__registerMat4Multiply.multiplyMatricesFn(jsRegisters.__registerMat4Multiply1, jsRegisters.__registerMat4Multiply2)
                }
                else
                {
                    jsRegisters.__registerMat4Multiply.multiplyMatrices(jsRegisters.__registerMat4Multiply1, jsRegisters.__registerMat4Multiply2)
                }
            }
        });
    }

    void vec3MultiplyMat4CallJs()
    {
        EM_ASM({
            const jsRegisters = Module.__jsRegisters; // 可以访问到Module对象
            if (jsRegisters.__vec3_1 && jsRegisters.applyMatrix4)
            {
                if (jsRegisters.__vec3_1.applyMatrix4Fn)
                {
                    jsRegisters.__vec3_1.applyMatrix4Fn(jsRegisters.__registerMat4Multiply1)
                }
                else
                {
                    jsRegisters.__vec3_1.applyMatrix4(jsRegisters.__registerMat4Multiply1)
                }
            }
        });
    }

    // share buffer
    void vec3MultiplyMat4(float *vec3, float *mat4)
    {
        const float x = vec3[0], y = vec3[1], z = vec3[2];
        // cout << "a:" << vec3[0] << ":" << vec3[1] << ":" << vec3[2] << endl;
        // cout << "b:" << mat4[0] << ":" << mat4[1] << ":" << mat4[2] << mat4[3] << ":" << mat4[4] << ":" << mat4[5] << mat4[6] << ":" << mat4[7] << ":" << mat4[8] << endl;
        const float w = 1 / (mat4[3] * x + mat4[7] * y + mat4[11] * z + mat4[15]);
        vec3[0] = (mat4[0] * x + mat4[4] * y + mat4[8] * z + mat4[12]) * w;
        vec3[1] = (mat4[1] * x + mat4[5] * y + mat4[9] * z + mat4[13]) * w;
        vec3[2] = (mat4[2] * x + mat4[6] * y + mat4[10] * z + mat4[14]) * w;
        // cout << "o:" << vec3[0] << ":" << vec3[1] << ":" << vec3[2] << endl;
    }

    void mat4MultiplyMat4ReturnVoid(float *a, float *b, float *res)
    {
        const float a11 = a[0];
        const float a12 = a[4];
        const float a13 = a[8];
        const float a14 = a[12];
        const float a21 = a[1];
        const float a22 = a[5];
        const float a23 = a[9];
        const float a24 = a[13];
        const float a31 = a[2];
        const float a32 = a[6];
        const float a33 = a[10];
        const float a34 = a[14];
        const float a41 = a[3];
        const float a42 = a[7];
        const float a43 = a[11];
        const float a44 = a[15];
        const float b11 = b[0];
        const float b12 = b[4];
        const float b13 = b[8];
        const float b14 = b[12];
        const float b21 = b[1];
        const float b22 = b[5];
        const float b23 = b[9];
        const float b24 = b[13];
        const float b31 = b[2];
        const float b32 = b[6];
        const float b33 = b[10];
        const float b34 = b[14];
        const float b41 = b[3];
        const float b42 = b[7];
        const float b43 = b[11];
        const float b44 = b[15];
        res[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        res[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        res[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        res[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
        res[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        res[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        res[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        res[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
        res[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        res[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        res[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        res[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
        res[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        res[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        res[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        res[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    }
}

// static unsigned char data[] = {0, 1, 2, 3, 4, 5, 6, 7};
// size_t bufferLength = 15;

// emscripten::val getBytes()
// {
//     return emscripten::val(emscripten::typed_memory_view<char>(bufferLength, data));
// }

// EMSCRIPTEN_BINDINGS(memory_view_example)
// {
//     emscripten::function("getBytes", &getBytes);
// }

/**
 * em_bind 使用val() 读取js变量
 */

std::vector<float> mat4MultiplyMat4CallByVal()
{
    const std::vector<float> &a = emscripten::convertJSArrayToNumberVector<float>(emscripten::val::global("__registerMat4Multiply1"));
    const std::vector<float> &b = emscripten::convertJSArrayToNumberVector<float>(emscripten::val::global("__registerMat4Multiply2"));
    const std::vector<float> &res = emscripten::convertJSArrayToNumberVector<float>(emscripten::val::global("__registerMat4Multiply"));
    cout << a.size() << ": " << b.size() << ":" << res.size() << endl;
    const float a11 = a[0];
    const float a12 = a[4];
    const float a13 = a[8];
    const float a14 = a[12];
    const float a21 = a[1];
    const float a22 = a[5];
    const float a23 = a[9];
    const float a24 = a[13];
    const float a31 = a[2];
    const float a32 = a[6];
    const float a33 = a[10];
    const float a34 = a[14];
    const float a41 = a[3];
    const float a42 = a[7];
    const float a43 = a[11];
    const float a44 = a[15];
    const float b11 = b[0];
    const float b12 = b[4];
    const float b13 = b[8];
    const float b14 = b[12];
    const float b21 = b[1];
    const float b22 = b[5];
    const float b23 = b[9];
    const float b24 = b[13];
    const float b31 = b[2];
    const float b32 = b[6];
    const float b33 = b[10];
    const float b34 = b[14];
    const float b41 = b[3];
    const float b42 = b[7];
    const float b43 = b[11];
    const float b44 = b[15];
    // res[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    // res[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    // res[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    // res[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    // res[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    // res[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    // res[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    // res[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    // res[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    // res[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    // res[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    // res[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    // res[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    // res[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    // res[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    // res[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return res;
}

EMSCRIPTEN_BINDINGS(test_bindings)
{
    emscripten::function("mat4MultiplyMat4CallByVal", &mat4MultiplyMat4CallByVal, emscripten::allow_raw_pointers());
}
