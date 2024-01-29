/**
 * 
 *  射线检测流程:
 *  _sphere.applyMatrix4(matrixWorld);
 *  geometry.computeBoundingSphere(); // ...position => updateMaxRadius
 *  !_sphere.containsPoint && _ray.intersectSphere(_sphere, _sphereHitAt)
 *  _inverseMatrix.copy(matrixWorld).invert();
 *  ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);
 *  geometry.boundingBox !== null && _ray.intersectsBox(geometry.boundingBox) 
 *  this._computeIntersections(raycaster, intersects, _ray);
 *      ...position1,2,3,... =  => checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, p1, p2, p3);
 *          checkIntersection(object, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint);
 *              ray.intersectTriangle(pC, pB, pA, true, point);
 *              _intersectionPointWorld.applyMatrix4(object.matrixWorld);
 *              distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);
 *          intersection.uv|uv1|uv2|normal = getInterpolation(...) 重心插值
 *          intersection.normal = getNormal(...)
 *          
 */


function raycast(raycaster, intersects) {

    const geometry = this.geometry;
    const material = this.material;
    const matrixWorld = this.matrixWorld;

    if (material === undefined) return;

    // test with bounding sphere in world space

    if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

    _sphere.copy(geometry.boundingSphere);
    _sphere.applyMatrix4(matrixWorld);

    // check distance from ray origin to bounding sphere

    _ray.copy(raycaster.ray).recast(raycaster.near);

    if (_sphere.containsPoint(_ray.origin) === false) {

        if (_ray.intersectSphere(_sphere, _sphereHitAt) === null) return;

        if (_ray.origin.distanceToSquared(_sphereHitAt) > (raycaster.far - raycaster.near) ** 2) return;

    }

    // convert ray to local space of mesh

    _inverseMatrix.copy(matrixWorld).invert();
    _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

    // test with bounding box in local space

    if (geometry.boundingBox !== null) {

        if (_ray.intersectsBox(geometry.boundingBox) === false) return;

    }

    // test for intersections with geometry

    this._computeIntersections(raycaster, intersects, _ray);

}

function _computeIntersections(raycaster, intersects, rayLocalSpace) {

    let intersection;

    const geometry = this.geometry;
    const material = this.material;

    const index = geometry.index;
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    const uv1 = geometry.attributes.uv1;
    const normal = geometry.attributes.normal;
    const groups = geometry.groups;
    const drawRange = geometry.drawRange;

    if (index !== null) {

        // indexed buffer geometry

        if (Array.isArray(material)) {

            for (let i = 0, il = groups.length; i < il; i++) {

                const group = groups[i];
                const groupMaterial = material[group.materialIndex];

                const start = Math.max(group.start, drawRange.start);
                const end = Math.min(index.count, Math.min((group.start + group.count), (drawRange.start + drawRange.count)));

                for (let j = start, jl = end; j < jl; j += 3) {

                    const a = index.getX(j);
                    const b = index.getX(j + 1);
                    const c = index.getX(j + 2);

                    intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);

                    if (intersection) {

                        intersection.faceIndex = Math.floor(j / 3); // triangle number in indexed buffer semantics
                        intersection.face.materialIndex = group.materialIndex;
                        intersects.push(intersection);

                    }

                }

            }

        } else {

            const start = Math.max(0, drawRange.start);
            const end = Math.min(index.count, (drawRange.start + drawRange.count));

            for (let i = start, il = end; i < il; i += 3) {

                const a = index.getX(i);
                const b = index.getX(i + 1);
                const c = index.getX(i + 2);

                intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);

                if (intersection) {

                    intersection.faceIndex = Math.floor(i / 3); // triangle number in indexed buffer semantics
                    intersects.push(intersection);

                }

            }

        }

    } else if (position !== undefined) {

        // non-indexed buffer geometry

        if (Array.isArray(material)) {

            for (let i = 0, il = groups.length; i < il; i++) {

                const group = groups[i];
                const groupMaterial = material[group.materialIndex];

                const start = Math.max(group.start, drawRange.start);
                const end = Math.min(position.count, Math.min((group.start + group.count), (drawRange.start + drawRange.count)));

                for (let j = start, jl = end; j < jl; j += 3) {

                    const a = j;
                    const b = j + 1;
                    const c = j + 2;

                    intersection = checkGeometryIntersection(this, groupMaterial, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);

                    if (intersection) {

                        intersection.faceIndex = Math.floor(j / 3); // triangle number in non-indexed buffer semantics
                        intersection.face.materialIndex = group.materialIndex;
                        intersects.push(intersection);

                    }

                }

            }

        } else {

            const start = Math.max(0, drawRange.start);
            const end = Math.min(position.count, (drawRange.start + drawRange.count));

            for (let i = start, il = end; i < il; i += 3) {

                const a = i;
                const b = i + 1;
                const c = i + 2;

                intersection = checkGeometryIntersection(this, material, raycaster, rayLocalSpace, uv, uv1, normal, a, b, c);

                if (intersection) {

                    intersection.faceIndex = Math.floor(i / 3); // triangle number in non-indexed buffer semantics
                    intersects.push(intersection);

                }

            }

        }

    }

}


function checkIntersection(object, material, raycaster, ray, pA, pB, pC, point) {

    let intersect;

    if (material.side === BackSide) {

        intersect = ray.intersectTriangle(pC, pB, pA, true, point);

    } else {

        intersect = ray.intersectTriangle(pA, pB, pC, (material.side === FrontSide), point);

    }

    if (intersect === null) return null;

    _intersectionPointWorld.copy(point);
    _intersectionPointWorld.applyMatrix4(object.matrixWorld);

    const distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);

    if (distance < raycaster.near || distance > raycaster.far) return null;

    return {
        distance: distance,
        point: _intersectionPointWorld.clone(),
        object: object
    };

}

function checkGeometryIntersection(object, material, raycaster, ray, uv, uv1, normal, a, b, c) {

    object.getVertexPosition(a, _vA);
    object.getVertexPosition(b, _vB);
    object.getVertexPosition(c, _vC);

    const intersection = checkIntersection(object, material, raycaster, ray, _vA, _vB, _vC, _intersectionPoint);

    if (intersection) {

        if (uv) {

            _uvA.fromBufferAttribute(uv, a);
            _uvB.fromBufferAttribute(uv, b);
            _uvC.fromBufferAttribute(uv, c);

            intersection.uv = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2());

        }

        if (uv1) {

            _uvA.fromBufferAttribute(uv1, a);
            _uvB.fromBufferAttribute(uv1, b);
            _uvC.fromBufferAttribute(uv1, c);

            intersection.uv1 = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _uvA, _uvB, _uvC, new Vector2());
            intersection.uv2 = intersection.uv1; // @deprecated, r152

        }

        if (normal) {

            _normalA.fromBufferAttribute(normal, a);
            _normalB.fromBufferAttribute(normal, b);
            _normalC.fromBufferAttribute(normal, c);

            intersection.normal = Triangle.getInterpolation(_intersectionPoint, _vA, _vB, _vC, _normalA, _normalB, _normalC, new Vector3());

            if (intersection.normal.dot(ray.direction) > 0) {

                intersection.normal.multiplyScalar(- 1);

            }

        }

        const face = {
            a: a,
            b: b,
            c: c,
            normal: new Vector3(),
            materialIndex: 0
        };

        Triangle.getNormal(_vA, _vB, _vC, face.normal);

        intersection.face = face;

    }

    return intersection;

}

function computeBoundingSphere() {

    if (this.boundingSphere === null) {

        this.boundingSphere = new Sphere();

    }

    const position = this.attributes.position;
    const morphAttributesPosition = this.morphAttributes.position;

    if (position && position.isGLBufferAttribute) {

        console.error('THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".', this);

        this.boundingSphere.set(new Vector3(), Infinity);

        return;

    }

    if (position) {

        // first, find the center of the bounding sphere

        const center = this.boundingSphere.center;

        _box.setFromBufferAttribute(position);

        // process morph attributes if present

        if (morphAttributesPosition) {

            for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {

                const morphAttribute = morphAttributesPosition[i];
                _boxMorphTargets.setFromBufferAttribute(morphAttribute);

                if (this.morphTargetsRelative) {

                    _vector.addVectors(_box.min, _boxMorphTargets.min);
                    _box.expandByPoint(_vector);

                    _vector.addVectors(_box.max, _boxMorphTargets.max);
                    _box.expandByPoint(_vector);

                } else {

                    _box.expandByPoint(_boxMorphTargets.min);
                    _box.expandByPoint(_boxMorphTargets.max);

                }

            }

        }

        _box.getCenter(center);

        // second, try to find a boundingSphere with a radius smaller than the
        // boundingSphere of the boundingBox: sqrt(3) smaller in the best case

        let maxRadiusSq = 0;

        for (let i = 0, il = position.count; i < il; i++) {

            _vector.fromBufferAttribute(position, i);

            maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

        }

        // process morph attributes if present

        if (morphAttributesPosition) {

            for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {

                const morphAttribute = morphAttributesPosition[i];
                const morphTargetsRelative = this.morphTargetsRelative;

                for (let j = 0, jl = morphAttribute.count; j < jl; j++) {

                    _vector.fromBufferAttribute(morphAttribute, j);

                    if (morphTargetsRelative) {

                        _offset.fromBufferAttribute(position, j);
                        _vector.add(_offset);

                    }

                    maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(_vector));

                }

            }

        }

        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

        if (isNaN(this.boundingSphere.radius)) {

            console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);

        }

    }

}


_sphere.containsPoint = function () {
    return (point.distanceToSquared(this.center) <= (this.radius * this.radius));
}

_ray.intersectSphere = function (sphere, target) {

    _vector.subVectors(sphere.center, this.origin);
    const tca = _vector.dot(this.direction);    // 
    const d2 = _vector.dot(_vector) - tca * tca;    // 
    const radius2 = sphere.radius * sphere.radius;

    if (d2 > radius2) return null;

    const thc = Math.sqrt(radius2 - d2);

    // t0 = first intersect point - entrance on front of sphere
    const t0 = tca - thc;

    // t1 = second intersect point - exit point on back of sphere
    const t1 = tca + thc;

    // test to see if t1 is behind the ray - if so, return null
    if (t1 < 0) return null;

    // test to see if t0 is behind the ray:
    // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
    // in order to always return an intersect point that is in front of the ray.
    if (t0 < 0) return this.at(t1, target);

    // else t0 is in front of the ray, so return the first collision point scaled by t0
    return this.at(t0, target);

}


_ray.intersectTriangle = function (a, b, c, backfaceCulling, target) {

    // Compute the offset origin, edges, and normal.

    // from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

    _edge1.subVectors(b, a);
    _edge2.subVectors(c, a);
    _normal.crossVectors(_edge1, _edge2);

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
    let DdN = this.direction.dot(_normal);
    let sign;

    if (DdN > 0) {

        if (backfaceCulling) return null;
        sign = 1;

    } else if (DdN < 0) {

        sign = - 1;
        DdN = - DdN;

    } else {

        return null;

    }

    /**
     *             b
     *          /  |
     *      a  /   |
     *         \   |
     *          \  |
     *        /    c
     *       / direction
     *      /
     *      .origin
     *                               /  b
     *                              /   |
     *                             /    |
     *                           /      |
     *                       a  /       |
     *                      |   ________|   c
     *                      |     
     *                      |      _edge2 = c - a
     * diff = origin - a    |      
     *                      |  
*                           |
     *                      .origin
     * 
     */


    _diff.subVectors(this.origin, a);
    const DdQxE2 = sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));

    // b1 < 0, no intersection
    if (DdQxE2 < 0) {

        return null;

    }

    const DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));

    // b2 < 0, no intersection
    if (DdE1xQ < 0) {

        return null;

    }

    // b1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {

        return null;

    }

    // Line intersects triangle, check if ray does.
    const QdN = - sign * _diff.dot(_normal);

    // t < 0, no intersection
    if (QdN < 0) {

        return null;

    }

    // Ray intersects triangle.
    return this.at(QdN / DdN, target);

}