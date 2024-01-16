import * as MathUtils from './MathUtils.js';
import { Quaternion } from './Quaternion.js';

// class Vector3 {

//     constructor(x = 0, y = 0, z = 0) {

//         Vector3.prototype.isVector3 = true;

//         this.x = x;
//         this.y = y;
//         this.z = z;

//     }

//     set(x, y, z) {

//         if (z === undefined) z = this.z; // sprite.scale.set(x,y)

//         this.x = x;
//         this.y = y;
//         this.z = z;

//         return this;

//     }

//     setScalar(scalar) {

//         this.x = scalar;
//         this.y = scalar;
//         this.z = scalar;

//         return this;

//     }

//     setX(x) {

//         this.x = x;

//         return this;

//     }

//     setY(y) {

//         this.y = y;

//         return this;

//     }

//     setZ(z) {

//         this.z = z;

//         return this;

//     }

//     setComponent(index, value) {

//         switch (index) {

//             case 0: this.x = value; break;
//             case 1: this.y = value; break;
//             case 2: this.z = value; break;
//             default: throw new Error('index is out of range: ' + index);

//         }

//         return this;

//     }

//     getComponent(index) {

//         switch (index) {

//             case 0: return this.x;
//             case 1: return this.y;
//             case 2: return this.z;
//             default: throw new Error('index is out of range: ' + index);

//         }

//     }

//     clone() {

//         return new this.constructor(this.x, this.y, this.z);

//     }

//     copy(v) {

//         this.x = v.x;
//         this.y = v.y;
//         this.z = v.z;

//         return this;

//     }

//     add(v) {

//         this.x += v.x;
//         this.y += v.y;
//         this.z += v.z;

//         return this;

//     }

//     addScalar(s) {

//         this.x += s;
//         this.y += s;
//         this.z += s;

//         return this;

//     }

//     addVectors(a, b) {

//         this.x = a.x + b.x;
//         this.y = a.y + b.y;
//         this.z = a.z + b.z;

//         return this;

//     }

//     addScaledVector(v, s) {

//         this.x += v.x * s;
//         this.y += v.y * s;
//         this.z += v.z * s;

//         return this;

//     }

//     sub(v) {

//         this.x -= v.x;
//         this.y -= v.y;
//         this.z -= v.z;

//         return this;

//     }

//     subScalar(s) {

//         this.x -= s;
//         this.y -= s;
//         this.z -= s;

//         return this;

//     }

//     subVectors(a, b) {

//         this.x = a.x - b.x;
//         this.y = a.y - b.y;
//         this.z = a.z - b.z;

//         return this;

//     }

//     multiply(v) {

//         this.x *= v.x;
//         this.y *= v.y;
//         this.z *= v.z;

//         return this;

//     }

//     multiplyScalar(scalar) {

//         this.x *= scalar;
//         this.y *= scalar;
//         this.z *= scalar;

//         return this;

//     }

//     multiplyVectors(a, b) {

//         this.x = a.x * b.x;
//         this.y = a.y * b.y;
//         this.z = a.z * b.z;

//         return this;

//     }

//     applyEuler(euler) {

//         return this.applyQuaternion(_quaternion.setFromEuler(euler));

//     }

//     applyAxisAngle(axis, angle) {

//         return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));

//     }

//     applyMatrix3(m) {

//         const x = this.x, y = this.y, z = this.z;
//         const e = m.elements;

//         this.x = e[0] * x + e[3] * y + e[6] * z;
//         this.y = e[1] * x + e[4] * y + e[7] * z;
//         this.z = e[2] * x + e[5] * y + e[8] * z;

//         return this;

//     }

//     applyNormalMatrix(m) {

//         return this.applyMatrix3(m).normalize();

//     }

//     applyMatrix4Fn(m) {
//         const x = this.x, y = this.y, z = this.z;
//         const e = m.elements;

//         const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

//         this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
//         this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
//         this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

//         return this;
//     }

//     applyMatrix4(m) {
//         let _t = performance.now()
//         window.vec3MultiplyMat4Calls += 1
//         let res
//         if (window.__USE_WASM) {
//             window._WASM.__jsRegisters.__vec3_1 = this
//             window._WASM.__jsRegisters.__registerMat4Multiply1 = m
//             window._WASM['_vec3MultiplyMat4'].apply(null, [])
//             window.__time2 += performance.now() - _t
//             return window._WASM.__jsRegisters.__vec3_1
//         } else {
//             res = this.applyMatrix4Fn(m)
//             window.__time2 += performance.now() - _t
//         }
//         return res
//     }

//     applyQuaternion(q) {

//         // quaternion q is assumed to have unit length

//         const vx = this.x, vy = this.y, vz = this.z;
//         const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

//         // t = 2 * cross( q.xyz, v );
//         const tx = 2 * (qy * vz - qz * vy);
//         const ty = 2 * (qz * vx - qx * vz);
//         const tz = 2 * (qx * vy - qy * vx);

//         // v + q.w * t + cross( q.xyz, t );
//         this.x = vx + qw * tx + qy * tz - qz * ty;
//         this.y = vy + qw * ty + qz * tx - qx * tz;
//         this.z = vz + qw * tz + qx * ty - qy * tx;

//         return this;

//     }

//     project(camera) {

//         return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);

//     }

//     unproject(camera) {

//         return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);

//     }

//     transformDirection(m) {

//         // input: THREE.Matrix4 affine matrix
//         // vector interpreted as a direction

//         const x = this.x, y = this.y, z = this.z;
//         const e = m.elements;

//         this.x = e[0] * x + e[4] * y + e[8] * z;
//         this.y = e[1] * x + e[5] * y + e[9] * z;
//         this.z = e[2] * x + e[6] * y + e[10] * z;

//         return this.normalize();

//     }

//     divide(v) {

//         this.x /= v.x;
//         this.y /= v.y;
//         this.z /= v.z;

//         return this;

//     }

//     divideScalar(scalar) {

//         return this.multiplyScalar(1 / scalar);

//     }

//     min(v) {

//         this.x = Math.min(this.x, v.x);
//         this.y = Math.min(this.y, v.y);
//         this.z = Math.min(this.z, v.z);

//         return this;

//     }

//     max(v) {

//         this.x = Math.max(this.x, v.x);
//         this.y = Math.max(this.y, v.y);
//         this.z = Math.max(this.z, v.z);

//         return this;

//     }

//     clamp(min, max) {

//         // assumes min < max, componentwise

//         this.x = Math.max(min.x, Math.min(max.x, this.x));
//         this.y = Math.max(min.y, Math.min(max.y, this.y));
//         this.z = Math.max(min.z, Math.min(max.z, this.z));

//         return this;

//     }

//     clampScalar(minVal, maxVal) {

//         this.x = Math.max(minVal, Math.min(maxVal, this.x));
//         this.y = Math.max(minVal, Math.min(maxVal, this.y));
//         this.z = Math.max(minVal, Math.min(maxVal, this.z));

//         return this;

//     }

//     clampLength(min, max) {

//         const length = this.length();

//         return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));

//     }

//     floor() {

//         this.x = Math.floor(this.x);
//         this.y = Math.floor(this.y);
//         this.z = Math.floor(this.z);

//         return this;

//     }

//     ceil() {

//         this.x = Math.ceil(this.x);
//         this.y = Math.ceil(this.y);
//         this.z = Math.ceil(this.z);

//         return this;

//     }

//     round() {

//         this.x = Math.round(this.x);
//         this.y = Math.round(this.y);
//         this.z = Math.round(this.z);

//         return this;

//     }

//     roundToZero() {

//         this.x = Math.trunc(this.x);
//         this.y = Math.trunc(this.y);
//         this.z = Math.trunc(this.z);

//         return this;

//     }

//     negate() {

//         this.x = - this.x;
//         this.y = - this.y;
//         this.z = - this.z;

//         return this;

//     }

//     dot(v) {

//         return this.x * v.x + this.y * v.y + this.z * v.z;

//     }

//     // TODO lengthSquared?

//     lengthSq() {

//         return this.x * this.x + this.y * this.y + this.z * this.z;

//     }

//     length() {

//         return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

//     }

//     manhattanLength() {

//         return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);

//     }

//     normalize() {

//         return this.divideScalar(this.length() || 1);

//     }

//     setLength(length) {

//         return this.normalize().multiplyScalar(length);

//     }

//     lerp(v, alpha) {

//         this.x += (v.x - this.x) * alpha;
//         this.y += (v.y - this.y) * alpha;
//         this.z += (v.z - this.z) * alpha;

//         return this;

//     }

//     lerpVectors(v1, v2, alpha) {

//         this.x = v1.x + (v2.x - v1.x) * alpha;
//         this.y = v1.y + (v2.y - v1.y) * alpha;
//         this.z = v1.z + (v2.z - v1.z) * alpha;

//         return this;

//     }

//     cross(v) {

//         return this.crossVectors(this, v);

//     }

//     crossVectors(a, b) {

//         const ax = a.x, ay = a.y, az = a.z;
//         const bx = b.x, by = b.y, bz = b.z;

//         this.x = ay * bz - az * by;
//         this.y = az * bx - ax * bz;
//         this.z = ax * by - ay * bx;

//         return this;

//     }

//     projectOnVector(v) {

//         const denominator = v.lengthSq();

//         if (denominator === 0) return this.set(0, 0, 0);

//         const scalar = v.dot(this) / denominator;

//         return this.copy(v).multiplyScalar(scalar);

//     }

//     projectOnPlane(planeNormal) {

//         _vector.copy(this).projectOnVector(planeNormal);

//         return this.sub(_vector);

//     }

//     reflect(normal) {

//         // reflect incident vector off plane orthogonal to normal
//         // normal is assumed to have unit length

//         return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));

//     }

//     angleTo(v) {

//         const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

//         if (denominator === 0) return Math.PI / 2;

//         const theta = this.dot(v) / denominator;

//         // clamp, to handle numerical problems

//         return Math.acos(MathUtils.clamp(theta, - 1, 1));

//     }

//     distanceTo(v) {

//         return Math.sqrt(this.distanceToSquared(v));

//     }

//     distanceToSquared(v) {

//         const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

//         return dx * dx + dy * dy + dz * dz;

//     }

//     manhattanDistanceTo(v) {

//         return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);

//     }

//     setFromSpherical(s) {

//         return this.setFromSphericalCoords(s.radius, s.phi, s.theta);

//     }

//     setFromSphericalCoords(radius, phi, theta) {

//         const sinPhiRadius = Math.sin(phi) * radius;

//         this.x = sinPhiRadius * Math.sin(theta);
//         this.y = Math.cos(phi) * radius;
//         this.z = sinPhiRadius * Math.cos(theta);

//         return this;

//     }

//     setFromCylindrical(c) {

//         return this.setFromCylindricalCoords(c.radius, c.theta, c.y);

//     }

//     setFromCylindricalCoords(radius, theta, y) {

//         this.x = radius * Math.sin(theta);
//         this.y = y;
//         this.z = radius * Math.cos(theta);

//         return this;

//     }

//     setFromMatrixPosition(m) {

//         const e = m.elements;

//         this.x = e[12];
//         this.y = e[13];
//         this.z = e[14];

//         return this;

//     }

//     setFromMatrixScale(m) {

//         const sx = this.setFromMatrixColumn(m, 0).length();
//         const sy = this.setFromMatrixColumn(m, 1).length();
//         const sz = this.setFromMatrixColumn(m, 2).length();

//         this.x = sx;
//         this.y = sy;
//         this.z = sz;

//         return this;

//     }

//     setFromMatrixColumn(m, index) {

//         return this.fromArray(m.elements, index * 4);

//     }

//     setFromMatrix3Column(m, index) {

//         return this.fromArray(m.elements, index * 3);

//     }

//     setFromEuler(e) {

//         this.x = e._x;
//         this.y = e._y;
//         this.z = e._z;

//         return this;

//     }

//     setFromColor(c) {

//         this.x = c.r;
//         this.y = c.g;
//         this.z = c.b;

//         return this;

//     }

//     equals(v) {

//         return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));

//     }

//     fromArray(array, offset = 0) {

//         this.x = array[offset];
//         this.y = array[offset + 1];
//         this.z = array[offset + 2];

//         return this;

//     }

//     toArray(array = [], offset = 0) {

//         array[offset] = this.x;
//         array[offset + 1] = this.y;
//         array[offset + 2] = this.z;

//         return array;

//     }

//     fromBufferAttribute(attribute, index) {

//         this.x = attribute.getX(index);
//         this.y = attribute.getY(index);
//         this.z = attribute.getZ(index);

//         return this;

//     }

//     random() {

//         this.x = Math.random();
//         this.y = Math.random();
//         this.z = Math.random();

//         return this;

//     }

//     randomDirection() {

//         // Derived from https://mathworld.wolfram.com/SpherePointPicking.html

//         const u = (Math.random() - 0.5) * 2;
//         const t = Math.random() * Math.PI * 2;
//         const f = Math.sqrt(1 - u ** 2);

//         this.x = f * Math.cos(t);
//         this.y = f * Math.sin(t);
//         this.z = u;

//         return this;

//     }

//     *[Symbol.iterator]() {

//         yield this.x;
//         yield this.y;
//         yield this.z;

//     }

// }

// const _vector = /*@__PURE__*/ new Vector3();
// const _quaternion = /*@__PURE__*/ new Quaternion();

// export { Vector3 };


let _vector
let uuid = 0
const _quaternion = /*@__PURE__*/ new Quaternion();

class Vector3 {
    pt = 0
    uuid = 0
    constructor(x = 0, y = 0, z = 0, debug = false) {
        this.uuid = uuid++
        this.debug = debug
        Vector3.prototype.isVector3 = true;
        if (window.__USE_WASM) {
            this.pt = window._WASM._malloc(3 * Float32Array.BYTES_PER_ELEMENT)
            this.setEl(0, x)
            this.setEl(1, y)
            this.setEl(2, z)
        } else {
            this.x = x;
            this.y = y;
            this.z = z;

        }
    }
    setEl(index, val) {
        if (window.__USE_WASM) window._WASM.setValue(this.pt + Float32Array.BYTES_PER_ELEMENT * index, val, 'float')
        this[index == 0 ? 'x' : index == 1 ? 'y' : 'z'] = val
    }
    getEl(index) {
        if (window.__USE_WASM) {
            return window._WASM.getValue(this.pt + Float32Array.BYTES_PER_ELEMENT * index, 'float')
        } else {
            return this[index == 0 ? 'x' : index == 1 ? 'y' : 'z']
        }
    }
    set(x, y, z) {

        if (z === undefined) z = this.z; // sprite.scale.set(x,y)
        if (window.__USE_WASM) {
            this.setEl(0, x)
            this.setEl(1, y)
            this.setEl(2, z)
        }
        this.x = x;
        this.y = y;
        this.z = z;

        return this;

    }

    setScalar(scalar) {
        if (window.__USE_WASM) {
            this.setEl(0, scalar)
            this.setEl(1, scalar)
            this.setEl(2, scalar)
        }
        this.x = scalar;
        this.y = scalar;
        this.z = scalar;

        return this;

    }

    setX(x) {
        if (window.__USE_WASM) {
            this.setEl(0, x)
        }
        this.x = x;

        return this;

    }

    setY(y) {
        if (window.__USE_WASM) {
            this.setEl(1, y)
        }
        this.y = y;

        return this;

    }

    setZ(z) {
        if (window.__USE_WASM) {
            this.setEl(2, z)
        }
        this.z = z;

        return this;

    }

    setComponent(index, value) {
        this.setEl(index, value)
        switch (index) {

            case 0: this.x = value; break;
            case 1: this.y = value; break;
            case 2: this.z = value; break;
            default: throw new Error('index is out of range: ' + index);

        }

        return this;

    }

    getComponent(index) {

        switch (index) {
            case 0: return this.x;
            case 1: return this.y;
            case 2: return this.z;
            default: throw new Error('index is out of range: ' + index);
        }

    }

    clone() {

        return new this.constructor(this.x, this.y, this.z);

    }

    copy(v) {
        this.set(v.x, v.y, v.z)
        return this;
    }

    add(v) {
        this.set(v.x + this.x, v.y + this.y, v.z + this.z)
        return this;

    }

    addScalar(s) {
        this.set(s + this.x, s + this.y, s + this.z)

        return this;

    }

    addVectors(a, b) {
        this.set(a.x + b.x, a.y + b.y, a.z + b.z)
        return this;

    }

    addScaledVector(v, s) {
        this.set(v.x * s, v.y * s, v.z * s)
        return this;

    }

    sub(v) {
        this.set(this.x - v.x, this.y - v.y, this.z - v.z)
        return this;

    }

    subScalar(s) {

        this.set(this.x - s, this.y - s, this.z - s)
        return this;

    }

    subVectors(a, b) {
        this.set(a.x - b.x, a.y - b.y, a.z - b.z)
        return this;

    }

    multiply(v) {
        this.set(this.x * v.x, this.y * v.y, this.z * v.z)
        return this;

    }

    multiplyScalar(scalar) {
        this.set(this.x * scalar, this.y * scalar, this.z * scalar)
        return this;

    }

    multiplyVectors(a, b) {
        this.set(a.x * b.x, a.y * b.y, a.z * b.z)
        return this;

    }

    applyEuler(euler) {

        return this.applyQuaternion(_quaternion.setFromEuler(euler));

    }

    applyAxisAngle(axis, angle) {

        return this.applyQuaternion(_quaternion.setFromAxisAngle(axis, angle));

    }

    applyMatrix3(m) {

        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        this.set(e[0] * x + e[3] * y + e[6] * z, e[1] * x + e[4] * y + e[7] * z, e[2] * x + e[5] * y + e[8] * z)

        return this;

    }

    applyNormalMatrix(m) {

        return this.applyMatrix3(m).normalize();

    }

    applyMatrix4Fn(m) {
        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        if (m.uuid == 89) console.log('elements', m.uuid, e)
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

        return this;
    }

    applyMatrix4(m) {
        let _t = performance.now()
        window.vec3MultiplyMat4Calls += 1
        if (window.__USE_WASM) {
            window._WASM['_vec3MultiplyMat4'].apply(null, [this.pt, m.pt])
            this.x = this.getEl(0)
            this.y = this.getEl(1)
            this.z = this.getEl(2)
        } else {
            this.applyMatrix4Fn(m)
        }
        window.__time2 += performance.now() - _t
        return this
    }

    applyQuaternion(q) {

        // quaternion q is assumed to have unit length

        const vx = this.x, vy = this.y, vz = this.z;
        const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

        // t = 2 * cross( q.xyz, v );
        const tx = 2 * (qy * vz - qz * vy);
        const ty = 2 * (qz * vx - qx * vz);
        const tz = 2 * (qx * vy - qy * vx);

        // v + q.w * t + cross( q.xyz, t );
        this.set(vx + qw * tx + qy * tz - qz * ty, vy + qw * ty + qz * tx - qx * tz, vz + qw * tz + qx * ty - qy * tx)

        return this;

    }

    project(camera) {

        return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(camera.projectionMatrix);

    }

    unproject(camera) {

        return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(camera.matrixWorld);

    }

    transformDirection(m) {

        // input: THREE.Matrix4 affine matrix
        // vector interpreted as a direction

        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        this.set(e[0] * x + e[4] * y + e[8] * z, e[1] * x + e[5] * y + e[9] * z, e[2] * x + e[6] * y + e[10] * z)

        return this.normalize();

    }

    divide(v) {

        this.set(this.x / v.x, this.y / v.y, this.z / v.z)
        return this;

    }

    divideScalar(scalar) {

        return this.multiplyScalar(1 / scalar);

    }

    min(v) {
        this.set(Math.min(this.x, v.x), Math.min(this.y, v.y), Math.min(this.z, v.z))
        return this;

    }

    max(v) {
        this.set(Math.max(this.x, v.x), Math.max(this.y, v.y), Math.max(this.z, v.z))

        return this;

    }

    clamp(min, max) {

        // assumes min < max, componentwise
        this.set(Math.max(min.x, Math.min(max.x, this.x)), Math.max(min.y, Math.min(max.y, this.y)), Math.max(min.z, Math.min(max.z, this.z)))

        return this;

    }

    clampScalar(minVal, maxVal) {
        this.set(Math.max(minVal, Math.min(maxVal, this.x)), Math.max(minVal, Math.min(maxVal, this.y)), Math.max(minVal, Math.min(maxVal, this.z)))
        return this;

    }

    clampLength(min, max) {

        const length = this.length();

        return this.divideScalar(length || 1).multiplyScalar(Math.max(min, Math.min(max, length)));

    }

    floor() {
        this.set(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z))
        return this;

    }

    ceil() {
        this.set(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z))
        return this;

    }

    round() {
        this.set(Math.round(this.x), Math.round(this.y), Math.round(this.z))

        return this;

    }

    roundToZero() {
        this.set(Math.trunc(this.x), Math.trunc(this.y), Math.trunc(this.z))
        return this;

    }

    negate() {
        this.set(-this.x, -this.y, -this.z)
        return this;

    }

    dot(v) {

        return this.x * v.x + this.y * v.y + this.z * v.z;

    }

    // TODO lengthSquared?

    lengthSq() {

        return this.x * this.x + this.y * this.y + this.z * this.z;

    }

    length() {

        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);

    }

    manhattanLength() {

        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);

    }

    normalize() {

        return this.divideScalar(this.length() || 1);

    }

    setLength(length) {

        return this.normalize().multiplyScalar(length);

    }

    lerp(v, alpha) {
        this.set(this.x + (v.x - this.x) * alpha, this.y + (v.y - this.y) * alpha, this.z + (v.z - this.z) * alpha)
        return this;

    }

    lerpVectors(v1, v2, alpha) {
        this.set(v1.x + (v2.x - v1.x) * alpha, v1.y + (v2.y - v1.y) * alpha, v1.z + (v2.z - v1.z) * alpha)
        return this;

    }

    cross(v) {

        return this.crossVectors(this, v);

    }

    crossVectors(a, b) {

        const ax = a.x, ay = a.y, az = a.z;
        const bx = b.x, by = b.y, bz = b.z;
        this.set(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx)
        return this;

    }

    projectOnVector(v) {

        const denominator = v.lengthSq();

        if (denominator === 0) return this.set(0, 0, 0);

        const scalar = v.dot(this) / denominator;

        return this.copy(v).multiplyScalar(scalar);

    }

    projectOnPlane(planeNormal) {
        if (!_vector) _vector = new Vector3(0, 0, 0, 'a');
        _vector.copy(this).projectOnVector(planeNormal);

        return this.sub(_vector);

    }

    reflect(normal) {
        if (!_vector) _vector = new Vector3(0, 0, 0, 'a');
        // reflect incident vector off plane orthogonal to normal
        // normal is assumed to have unit length

        return this.sub(_vector.copy(normal).multiplyScalar(2 * this.dot(normal)));

    }

    angleTo(v) {

        const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

        if (denominator === 0) return Math.PI / 2;

        const theta = this.dot(v) / denominator;

        // clamp, to handle numerical problems

        return Math.acos(MathUtils.clamp(theta, - 1, 1));

    }

    distanceTo(v) {

        return Math.sqrt(this.distanceToSquared(v));

    }

    distanceToSquared(v) {

        const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;

        return dx * dx + dy * dy + dz * dz;

    }

    manhattanDistanceTo(v) {

        return Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z);

    }

    setFromSpherical(s) {

        return this.setFromSphericalCoords(s.radius, s.phi, s.theta);

    }

    setFromSphericalCoords(radius, phi, theta) {

        const sinPhiRadius = Math.sin(phi) * radius;
        this.set(sinPhiRadius * Math.sin(theta), Math.cos(phi) * radius, sinPhiRadius * Math.cos(theta))
        return this;

    }

    setFromCylindrical(c) {

        return this.setFromCylindricalCoords(c.radius, c.theta, c.y);

    }

    setFromCylindricalCoords(radius, theta, y) {
        this.set(radius * Math.sin(theta), y, radius * Math.cos(theta))
        return this;

    }

    setFromMatrixPosition(m) {

        const e = m.elements;
        this.set(e[12], e[13], e[14])
        return this;

    }

    setFromMatrixScale(m) {

        const sx = this.setFromMatrixColumn(m, 0).length();
        const sy = this.setFromMatrixColumn(m, 1).length();
        const sz = this.setFromMatrixColumn(m, 2).length();
        this.set(sx, sy, sz)
        return this;

    }

    setFromMatrixColumn(m, index) {

        return this.fromArray(m.elements, index * 4);

    }

    setFromMatrix3Column(m, index) {

        return this.fromArray(m.elements, index * 3);

    }

    setFromEuler(e) {
        this.set(e._x, e._y, e._z)
        return this;

    }

    setFromColor(c) {
        this.set(c.r, c.g, c.b)
        return this;

    }

    equals(v) {

        return ((v.x === this.x) && (v.y === this.y) && (v.z === this.z));

    }

    fromArray(array, offset = 0) {
        this.set(array[offset], array[offset + 1], array[offset + 2])
        return this;

    }

    toArray(array = [], offset = 0) {

        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;

        return array;

    }

    fromBufferAttribute(attribute, index) {
        this.set(attribute.getX(index), attribute.getY(index), attribute.getZ(index))
        return this;

    }

    random() {
        this.set(Math.random(), Math.random(), Math.random())
        return this;

    }

    randomDirection() {

        // Derived from https://mathworld.wolfram.com/SpherePointPicking.html

        const u = (Math.random() - 0.5) * 2;
        const t = Math.random() * Math.PI * 2;
        const f = Math.sqrt(1 - u ** 2);
        this.set(f * Math.cos(t), f * Math.sin(t), u)
        return this;

    }

    *[Symbol.iterator]() {

        yield this.x;
        yield this.y;
        yield this.z;

    }

}

export { Vector3 };

