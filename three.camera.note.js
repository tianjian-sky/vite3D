/**
 *  
    z: eye - target  up     
            \       /
              \    /   
                \ /
                    ------ y: z x x
                  /
                /
                x: up x z

*/

function lookAt(eye, target, up) {

    const te = this.elements;

    _z.subVectors(eye, target);

    if (_z.lengthSq() === 0) {

        // eye and target are in the same position

        _z.z = 1;

    }

    _z.normalize();
    _x.crossVectors(up, _z);

    if (_x.lengthSq() === 0) {

        // up and z are parallel

        if (Math.abs(up.z) === 1) {

            _z.x += 0.0001;

        } else {

            _z.z += 0.0001;

        }

        _z.normalize();
        _x.crossVectors(up, _z);

    }

    _x.normalize();
    _y.crossVectors(_z, _x);

    te[0] = _x.x; te[4] = _y.x; te[8] = _z.x;
    te[1] = _x.y; te[5] = _y.y; te[9] = _z.y;
    te[2] = _x.z; te[6] = _y.z; te[10] = _z.z;

    return this;

}

function lookAt(x, y, z) {

    // This method does not support objects having non-uniformly-scaled parent(s)

    if (x.isVector3) {

        _target.copy(x);

    } else {

        _target.set(x, y, z);

    }

    const parent = this.parent;

    this.updateWorldMatrix(true, false);

    _position$3.setFromMatrixPosition(this.matrixWorld);

    if (this.isCamera || this.isLight) {

        _m1$1.lookAt(_position$3, _target, this.up);

    } else {

        _m1$1.lookAt(_target, _position$3, this.up);

    }

    this.quaternion.setFromRotationMatrix(_m1$1);

    if (parent) {

        _m1$1.extractRotation(parent.matrixWorld);
        _q1.setFromRotationMatrix(_m1$1);
        this.quaternion.premultiply(_q1.invert());

    }

}

// 法向量计算规则
// normal = (c-b) x (a - b)
/**
 *          a
 *              _
 *             |\
 *      c   <-   b
 */

for (let i = 0, il = positionAttribute.count; i < il; i += 3) {

    pA.fromBufferAttribute(positionAttribute, i + 0);
    pB.fromBufferAttribute(positionAttribute, i + 1);
    pC.fromBufferAttribute(positionAttribute, i + 2);

    cb.subVectors(pC, pB);
    ab.subVectors(pA, pB);
    cb.cross(ab);

    normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
    normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
    normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);

}
