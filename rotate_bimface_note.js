
handleRotation(t, i, n) {
    var a = this.camera
    var s = a.position
    var o = a.target;
    var l
    // this.matrixWorld.multiplyMatrices( this.parent.matrixWorld, this.matrix );
    l = a.getWorldDirection(l) // this.matrixWorld 的 z-basis

    t = dx // 水平角度
    i = dy // 竖直角度
    var d
    var h = o.clone().sub(s) // target - position
    var c = h.length() // 距离
    var u = null

    function p(e, t = !1) { // u = (new THREE.Quaternion).setFromAxisAngle(this.matrixWorld 的 z-basis.clone().cross(a.realUp).normalize(), dy), dy > 0)
        var i, r, d, u = new THREE.Vector3;
        i = h.clone() // target - position
        r = c //  h.length()
        i.normalize() // Unit(target - position)
        d = i.clone().applyQuaternion(e).normalize()
        u.copy(s).add(d.multiplyScalar(r))
        o.copy(u);
    }

    var m = a.up
    var f = l.clone().cross(a.up).normalize().clone().cross(l).normalize() //  normalize(this.matrixWorld 的 z-basis x up) x camPos   realUp

    if (a.realUp.copy(f),
        r.EditorConfig.LockAxisZ) {
        if (Math.abs(t) > Math.abs(i))
            d = e,
                p(u = (new THREE.Quaternion).setFromAxisAngle(d, t)),
                a.realUp.applyQuaternion(u).normalize(),
                this.adjustCameraUp();
        else if (null != r.EditorConfig.LockAxisZRange && Math.abs(i) > 1e-4) {
            const e = r.EditorConfig.LockAxisZRange;
            y(this.camera, i, n, e) && (d = l.clone().cross(m).normalize(),
                p(u = (new THREE.Quaternion).setFromAxisAngle(d, i)),
                a.realUp.applyQuaternion(u).normalize(),
                this.adjustCameraUp())
        }
    } else {
        if (Math.abs(t) > Math.abs(i))

            //  -0.9999  > l.y > -1 || -1.0001 < l.y < -1 || 1 < l.y < 1.0001 ||  l.y < -0.9999
            (Math.abs(l.y + 1) < 1e-4 || Math.abs(l.y - 1) < 1e-4) && (
                d = l.clone().cross(a.realUp).normalize(), //  z-basis x realUp => x
                p(u = (new THREE.Quaternion).setFromAxisAngle(d, .1)),
                a.realUp.applyQuaternion(u).normalize(),
                this.adjustCameraUp()
            ),
                d = l.y > 0 && a.realUp.y < 0 ? new THREE.Vector3(0, -1, 0) : new THREE.Vector3(0, 1, 0),
                p(u = (new THREE.Quaternion).setFromAxisAngle(d, t)),
                a.realUp.applyQuaternion(u).normalize();
        else if (Math.abs(i) > 1e-4) { // dy > 0.0001 || dy < -0.0001
            if (null != this.maxPitch && null != this.minPitch) { // +-Math.PI / 3,
                const e = a.target.clone().sub(a.position);
                let t = new THREE.Vector2(Math.sqrt(e.x * e.x + e.z * e.z) * (a.realUp.y > 0 ? 1 : -1), e.y).angle();
                // Vector2(cam dir 在 xoz平面的投影的距离 * (realUp.y > 0 ? 1 : -1), Vec3(camTarget-camPos).y)
                if (t - Math.PI > 0 && (t -= 2 * Math.PI),
                    t = -t,
                    i < 0) {
                    if (t - i * (a.realUp.y > 0 ? 1 : -1) >= this.maxPitch)
                        return
                } else if (null != a.minimumElevation && a.position.y < a.minimumElevation || t - i <= this.minPitch)
                    return
            }
            if (d = l.clone().cross(a.realUp).normalize(), // d =  z-basis x realUp = x
                !p(u = (new THREE.Quaternion).setFromAxisAngle(d, i), i > 0))
                return;
            a.realUp.applyQuaternion(u).normalize()
        }
        this.adjustCameraUp()
    }
}
adjustCameraUp() {
    this.camera.realUp.y > 0 ? this.camera.up.set(0, 1, 0) : this.camera.realUp.y < 0 ? this.camera.up.set(0, -1, 0) : this.camera.realUp.x > 0 ? this.camera.up.set(1, 0, 0) : this.camera.realUp.x < 0 ? this.camera.up.set(-1, 0, 0) : this.camera.realUp.z > 0 ? this.camera.up.set(0, 0, 1) : this.camera.realUp.z < 0 && this.camera.up.set(0, 0, -1)
}
t.viewer.lockAxisZ("Z", [.1, Math.PI / 2.01]),

    function lockAxisZ(t, i) {
        var r = this.cameraControl;
        if (r) {
            var n = r.getZenith() // (camPos - sceneCenter).angleTo(e)
                , a = this.getBoundingBox().getCenter(e);
            if (t && void 0 !== i || (i = null),
                i) {
                const e = i[0]
                    , t = i[1];
                n > t ? r.handleRotation(0, t - n, a) : n < e && r.handleRotation(0, e - n, a),
                    this.render()
            }
            this.cameraControl.lockAxisZ(t),
                this.cameraControl.setLockAxisZRange(i)
        }
    }
function lockAxisZ(e) {
    r.EditorConfig.LockAxisZ = e
}
function setLockAxisZRange(e) {
    r.EditorConfig.LockAxisZRange = e
}
funciton getZenith() {
    var t = this.camera.position
        , i = this.viewer.getBoundingBox().getCenter(d);
    return t.clone().sub(i.clone()).clone().angleTo(e.clone()) // 
}
funciton getAzimuth() {
    var i = camera.position
        , r = this.viewer.getBoundingBox().getCenter(d)
        , n = i.clone().sub(r.clone()).clone().projectOnPlane(e.clone())
        , a = n.angleTo(t.clone());
    return n.x < 0 && (a = 360 - a),
        a
}

_updateRotation() {
    r.EditorConfig.LockAxisZ ? this.rotationVector.x = 0 : this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp,
        this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft,
        this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft
}

updateCamera() {
    var e = this.camera;
    e.dirty && (e.lookAt(e.target),
        e.updateMVP())
}
setCameraChanging(e) {
    this._cameraChanging = e,
        this.camera.dirty = e
}
updateMVP() {
    this.dirty && (this._statusInitialized || (this._statusInitialized = !0),
        null === this.parent && this.updateMatrixWorld(),
        this.matrixWorldInverse.copy(this.matrixWorld).invert(),
        this.projScreenMatrix.multiplyMatrices(this.projectionMatrix, this.matrixWorldInverse),
        this.viewProjInverse.copy(this.projScreenMatrix).invert(),
        this._updateFrustum(),
        this._updatePositionPlane(),
        this.frustumHeightFactor = this.computeFrustumHeightFactor())
}

setStandardView(i) {
    const { stdView: n, viewer: a, box: s, margin: o, direction: l, callbackProcess: d, callbackFinished: h } = i;
    var c = a.camera
        , u = c.position.clone()
        , p = c.target.clone()
        , m = c.getWorldDirection(e);
    m.normalize();
    var f = new THREE.Vector3;
    f.copy(c.realUp || c.up),
        f.normalize();
    var g = new THREE.Vector3(c.position.clone().sub(p).length(), 0, 0);
    const v = a.camera.clone();
    v.setStandardView(n, s);
    let y = v.zoomToBBox(s, o, void 0, l)
        , M = v.position.clone()
        , E = new THREE.Vector3;
    E.copy(v.realUp || v.up),
        E.normalize();
    let x = l;
    if (r.Utils.isDefined(x)) {
        const e = M.distanceTo(y);
        x.normalize(),
            M = y.clone().sub(x.clone().multiplyScalar(e)),
            x.y < -.9999 ? E.set(0, 0, -1) : x.y > .9999 ? E.set(0, 0, 1) : E.set(0, 1, 0)
    } else
        x = v.getWorldDirection(t),
            x.normalize();
    const _ = new THREE.Vector3(M.clone().sub(y).length(), 0, 0);
    0 != (() => {
        const e = .01
            , t = this.lastPosition.clone().sub(u).length() < e
            , i = x.clone().sub(m).length() < e
            , r = E.clone().sub(f).length() < e
            , n = this.lastBox.equals(s)
            , a = this.lastMargin === o;
        return !(t && i && r && n && a)
    }
    )() ? (this.lastPosition.copy(M),
        this.lastBox.copy(s),
        this.lastMargin = o,
        a.getEditorManager().setInteractiveState(!1),
        this._animation.from({
            animPos: u, // camPos
            animDir: m, //  cam z-basis
            animUp: f, // realUp
            animTarget: p, // animTarget
            animFocal: g,
            zoom: 1
        }).to({
            animPos: M, // camPos2
            animDir: x, //   cam z-basis 2
            animUp: E, // realUp2
            animTarget: y, // animTarget2
            animFocal: _,
            zoom: 1
        }, this._duration).onUpdate((function () {
            if (a.camera) {
                var e = this.animTarget
                    , t = this.animDir
                    , i = this.animUp
                    , n = this.animFocal.x;
                a.camera.LookAt(e, t, i, n),
                    r.Utils.isDefined(l),
                    a.cameraControl.update(!0, !0),
                    a.modelManager.dispatchEvent({
                        type: r.EVENTS.ON_CAMERA_ANIMATION_UPDATE
                    }),
                    d && d()
            }
        }
        )).onComplete((function () {
            a.camera && (a.camera.setZoom(1),
                a.camera.LookAt(y, x, E, _.x),
                r.Utils.isDefined(l),
                a.cameraControl.update(!0, !0),
                setTimeout((() => {
                    h && h()
                }
                ), 500),
                a.getEditorManager().setInteractiveState(!0))
        }
        )).start(this._frameTime)) : h && h()
}

LookAt(e /* target */, t /* z-basis */, i /* realUp */, r /* r */) {
    let n = new THREE.Vector3;
    n.copy(t),
        void 0 !== r && n.setLength(r),
        this.position.subVectors(e, n),
        this.up.copy(i),
        this.lookAt(e),
        this.realUp = i.clone(),
        this.target = e.clone(),
        this.dirty = !0
}