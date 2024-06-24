import {
    Euler,
    EventDispatcher,
    Vector3,
    MOUSE,
    TOUCH
} from 'three'
import * as THREE from 'three'

const roundFractional = function (x, n) {
    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
}
const _changeEvent = { type: 'change' }
const GRAVITY = -9.8
// const _PI_2 = Math.PI / 2

// let raycaster
const direction = new THREE.Vector3()

const STATE = {
    NONE: - 1,
    ROTATE: 0,
    DOLLY: 1,
    PAN: 2,
    TOUCH_ROTATE: 3,
    TOUCH_PAN: 4,
    TOUCH_DOLLY_PAN: 5,
    TOUCH_DOLLY_ROTATE: 6
};

class CannonEsControls extends EventDispatcher {
    constructor(scene, camera, domElement, target, world, moveObjs, configs = {}) {
        super()
        this.scene = scene
        this.target = target
        this.camera = camera
        this.domElement = domElement
        this.enabled = true
        this.pointers = []
        this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' }
        this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: -1, RIGHT: -1 }
        this.touches = { ONE: TOUCH.ROTATE }
        this.state = STATE.NONE
        this.collision = false
        this.debug = true
        this.octree = null
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            speed: configs.walkSpeed || 30,
            _vector: new Vector3(),
            displacement: new Vector3(),
            velocity: new Vector3(),
            prevTime: performance.now()
        }
        this.rotate = {
            start: new Vector3(),
            delta: new Vector3()
        }
        this.jump = {
            start: false,
            startTime: null,
            startY: null,
            enable: true,
            onTheGround: false,
            speed: configs.jumpSpeed || 4
        }
        this.boundOffset = {
            'x+': 0.2,
            'x-': 0.2,
            'y+': 0,
            'y-': configs.height || 1.7,
            'z+': 0.1,
            'z-': 0.1,
        }
        this.moveObjs = moveObjs
        this.world = world
        this.setCurrentPosition(configs.position || this.camera.position)
        this.setHeight(configs.height || 1.7)
        this.initBound()
        this.connect()
    }

    connect() {
        this.domElement.addEventListener('pointerdown', this.onPointerDown)
        this.domElement.addEventListener('pointermove', this.onPointerMove)
        this.domElement.addEventListener('pointerup', this.onPointerUp)
        document.addEventListener('keydown', this.onKeyDown)
        document.addEventListener('keyup', this.onKeyUp)
        document.body.click()
        const button = document.createElement('button')
        button.style = 'position:absolute;left: -999px;top:-999px;opacity:0;'
        document.body.appendChild(button)
        button.focus()
        setTimeout(() => {
            document.body.removeChild(button)
        }, 1000)
    }

    disconnect() {
        this.domElement.removeEventListener('pointerdown', this.onPointerDown)
        this.domElement.removeEventListener('pointermove', this.onPointerMove)
        this.domElement.removeEventListener('pointerup', this.onPointerUp)
        document.removeEventListener('keydown', this.onKeyDown)
        document.removeEventListener('keyup', this.onKeyUp)
    }

    dispose() {
        this.disconnect()
    }

    initBound() {
        this.boundOffset['y-'] = this.camera.position.y
    }

    moveForward(distance) {
        const camera = this.camera
        this.move._vector.setFromMatrixColumn(camera.matrix, 0)
        this.move._vector.crossVectors(camera.up, this.move._vector)
        camera.position.addScaledVector(this.move._vector, distance)
        this.target.addScaledVector(this.move._vector, distance)
    }

    moveRight(distance) {
        const camera = this.camera
        this.move._vector.setFromMatrixColumn(camera.matrix, 0)
        camera.position.addScaledVector(this.move._vector, distance)
        this.target.addScaledVector(this.move._vector, distance)
    }

    moveVertical(distance) {
        this.camera.position.y += distance
        this.target.setY(this.target.y + distance)
    }

    onPointerDown = (event) => {
        const handleRotateStart = (x, y) => {
            this.rotate.start.set(x, y, 0)
        }
        const onMouseDown = (event) => {
            let mouseAction
            switch (event.button) {
                case 0:
                    mouseAction = this.mouseButtons.LEFT
                    break
                case 1:
                    mouseAction = this.mouseButtons.MIDDLE
                    break
                case 2:
                    mouseAction = this.mouseButtons.RIGHT
                    break
                default:
                    break
            }
            switch (mouseAction) {
                case MOUSE.ROTATE:
                    handleRotateStart(event.offsetX, event.offsetY)
                    this.state = STATE.ROTATE
                    break
                default:
                    this.state = STATE.NONE
            }

        }
        const onTouchStart = (event) => {
            switch (this.pointers.length) {
                case 1:
                    switch (this.touches.ONE) {
                        case TOUCH.ROTATE:
                            const rotateStart = new Vector3()
                            if (this.pointers.length === 1) {
                                rotateStart.set(this.pointers[0].offsetX, this.pointers[0].offsetY)
                            } else {
                                const x = 0.5 * (this.pointers[0].offsetX + this.pointers[1].offsetX)
                                const y = 0.5 * (this.pointers[0].offsetY + this.pointers[1].offsetY)
                                rotateStart.set(x, y)
                            }
                            handleRotateStart(rotateStart.x, rotateStart.y)
                            this.state = STATE.TOUCH_ROTATE
                            break
                    }
                    break
                default:
                    this.state = STATE.NONE
            }
        }
        if (this.enabled === false) return
        this.pointers.push(event)
        if (event.pointerType === 'touch') {
            onTouchStart(event)
        } else {
            onMouseDown(event)
        }
    }
    onPointerMove = (event) => {
        const handleRotate = (x, y) => {
            const delta = new Vector3(x - this.rotate.start.x, y - this.rotate.start.y)
            this.rotate.start.set(x, y, 0)
            this.rotate.delta.add(delta)
        }
        const onMouseMove = (event) => {
            switch (this.state) {
                case STATE.ROTATE:
                    handleRotate(event.offsetX, event.offsetY)
                    break
                default:
                    this.state = STATE.NONE
            }
        }
        const onTouchMove = (event) => {
            switch (state) {
                case STATE.TOUCH_ROTATE:
                    const position = new Vector3()
                    if (this.pointers.length == 1) {
                        position.set(event.offsetX, event.offsetY);
                    } else {
                        const x = 0.5 * (this.pointers[0].offsetX + this.pointers[1].offsetX)
                        const y = 0.5 * (this.pointers[0].offsetY + this.pointers[1].offsetY)
                        position.set(x, y)
                    }
                    handleRotate(position.x, position.y)
                    break
                default:
                    this.state = STATE.NONE
            }
        }
        if (this.enabled === false || !this.pointers.length) return
        if (event.pointerType === 'touch') {
            onTouchMove(event)
        } else {
            onMouseMove(event)
        }
    }
    onPointerUp = (event) => {
        for (let i = 0; i < this.pointers.length; i++) {
            if (this.pointers[i].pointerId == event.pointerId) {
                this.pointers.splice(i, 1)
                return
            }
        }
    }

    onKeyDown = (event) => {
        if (!this.enabled) return
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.move.forward = true
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.move.left = true
                break
            case 'ArrowDown':
            case 'KeyS':
                this.move.backward = true
                break
            case 'ArrowRight':
            case 'KeyD':
                this.move.right = true
                break
            case 'Space':
                if (this.jump.enable === true && !this.jump.start && (this.collision && this.jump.onTheGround || !this.collision)) {
                    this._handleJumpStart(this.jump.speed)
                }
                break
        }
    }

    onKeyUp = (event) => {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                this.move.forward = false
                break
            case 'ArrowLeft':
            case 'KeyA':
                this.move.left = false
                break
            case 'ArrowDown':
            case 'KeyS':
                this.move.backward = false
                break
            case 'ArrowRight':
            case 'KeyD':
                this.move.right = false
                break
        }
    }

    update() {
        const time = performance.now()
        const delta = (time - this.move.prevTime) / 1000
        if (this.enabled === true) {
            this.move.displacement.x = 0
            this.move.displacement.y = 0
            this.move.displacement.z = 0
            if (this.jump.start) {
                const v0 = this.move.velocity.y
                const v1 = v0 + GRAVITY * delta
                this.move.displacement.y = (v0 + v1) * delta / 2
                this.move.velocity.setY(v1)
                if (!this.collision) {
                    if (this.move.displacement.y + this.camera.position.y <= this.jump.startY) {
                        this.move.displacement.y = this.jump.startY - this.camera.position.y
                        this._handleJumpEnd()
                    }
                }
            }
            direction.z = Number(this.move.forward) - Number(this.move.backward)
            direction.x = Number(this.move.right) - Number(this.move.left)
            direction.normalize() // this ensures consistent movements in all directions
            if (this.move.forward || this.move.backward) this.move.displacement.z -= direction.z * this.move.speed * delta
            if (this.move.left || this.move.right) this.move.displacement.x -= direction.x * this.move.speed * delta
            if (this.collision) {
                this._updateDisplacementAfterCollistion(this._collistionTest())
            }
            if (this.move.displacement.x) this.moveRight(-this.move.displacement.x)
            if (this.move.displacement.z) this.moveForward(-this.move.displacement.z)
            if (this.move.displacement.y) this.moveVertical(this.move.displacement.y)
            if (this.rotate.delta.length() != 0) {
                const m1 = new THREE.Matrix4().makeRotationX(-this.rotate.delta.y * Math.PI * 2 / this.domElement.offsetHeight)
                const m2 = new THREE.Matrix4().makeRotationY(-this.rotate.delta.x * Math.PI * 2 / this.domElement.offsetWidth)
                const b = new Vector3(0, 0, -this.target.clone().sub(this.camera.position).length())
                const T = new THREE.Matrix4().lookAt(this.camera.position, this.target, this.camera.up).premultiply(new THREE.Matrix4().makeTranslation(this.camera.position))
                const pb = b.clone().applyMatrix4(m1.premultiply(m2))
                this.target = pb.applyMatrix4(T)
                this.rotate.delta.set(0, 0, 0)
            }
            this.camera.lookAt(this.target)
            this.dispatchEvent(_changeEvent)
        }

        // 物理引擎计算物体位置
        {
            this.world.step(1 / 60, delta)
            // Update ball positions
            for (let i = 0; i < this.moveObjs.length; i++) {
                this.moveObjs[i]._threeObj.position.copy(this.moveObjs[i].position)
                this.moveObjs[i]._threeObj.quaternion.copy(this.moveObjs[i].quaternion)
            }
        }

        this.move.prevTime = time
    }
    setCurrentPosition(position) {
        const lookVector = this.target.clone().sub(this.camera.position)
        this.camera.position.set(position.x, this.camera.position.y, position.z)
        this.target = this.camera.position.clone().add(lookVector)
    }
    setHeight(val) {
        this.camera.position.y = val
        this.target.setY(this.camera.position.y)
        this.boundOffset['y-'] = this.camera.position.y
    }
    setWalkSpeed(val) {
        this.move.speed = val
    }
    setJumpSpeed(val) {
        this.jump.speed = val
    }
    toggleCollisionDetect(flg) {
        this.collision = flg
    }
    _handleJumpStart(speed) {
        this.jump.onTheGround = false
        this.move.prevTime = performance.now()
        this.jump.startTime = performance.now()
        this.jump.start = true
        this.jump.startY = this.camera.position.y
        this.move.velocity.setY(speed)
    }
    _handleJumpEnd() {
        this.move.velocity.y = 0
        this.jump.start = false
        if (this.collision) {
            this.jump.onTheGround = true
        }
    }
    _rayCast(rays, objects) {
        const dirs = Object.keys(rays)
        const intesects = {}
        for (let j = 0; j < dirs.length; j++) {
            if (this.octree) {
                intesects[dirs[j]] = [this.octree.rayIntersect(rays[dirs[j]].ray)]
            } else {
                intesects[dirs[j]] = rays[dirs[j]].intersectObjects(objects)
            }
        }
        return intesects;
    }
    _collistionTest() {
        const directions = {}
        const rays = {}
        if (this.move.displacement.x != 0) {
            const dir = new Vector3(this.move.displacement.x > 0 ? 1 : -1, 0, 0)
            directions[this.move.displacement.x > 0 ? 'x+' : 'x-'] = dir
            rays[this.move.displacement.x > 0 ? 'x+' : 'x-'] = new THREE.Raycaster(this.camera.position, dir)
        }
        if (this.move.displacement.y != 0) {
            const dir = new Vector3(0, this.move.displacement.y > 0 ? 1 : -1, 0)
            directions[this.move.displacement.y > 0 ? 'y+' : 'y-'] = dir
            rays[this.move.displacement.y > 0 ? 'y+' : 'y-'] = new THREE.Raycaster(this.camera.position, dir)
        }
        if (this.move.displacement.z != 0) {
            const dir = new Vector3(0, 0, this.move.displacement.z > 0 ? 1 : -1)
            directions[this.move.displacement.z > 0 ? 'z+' : 'z-'] = dir
            rays[this.move.displacement.z > 0 ? 'z+' : 'z-'] = new THREE.Raycaster(this.camera.position, dir)
        }
        if (!rays['y-']) {
            const dir = new Vector3(0, -1, 0)
            directions['y-'] = dir
            rays['y-'] = new THREE.Raycaster(this.camera.position, dir)
        }
        const objects = this.scene.children
        // if (this.debug) console.time('射线检测')
        const intersects = this._rayCast(rays, objects)
        // if (this.debug) console.timeEnd('射线检测')
        return intersects
    }
    _updateDisplacementAfterCollistion(collisions) {
        if (this.move.displacement.x) {
            if (this.move.displacement.x > 0 && collisions['x+']?.length) {
                // if (this.debug) console.error('x+ collision', collisions['x+'])
                if (roundFractional(collisions['x+'][0].distance, 5) <= this.move.displacement.x + this.boundOffset['x+']) {
                    this.move.displacement.x = Math.min(collisions['x+'][0].distance - this.boundOffset['x+'], 0)
                }
            } else if (this.move.displacement.x < 0 && collisions['x-']?.length) {
                // if (this.debug) console.error('x- collision', collisions['x-'])
                if (roundFractional(collisions['x-'][0].distance, 5) <= -this.move.displacement.x + this.boundOffset['x-']) {
                    this.move.displacement.x = -Math.min(collisions['x-'][0].distance - this.boundOffset['x-'], 0)
                }
            }
        }
        if (this.move.displacement.z) {
            if (this.move.displacement.z > 0 && collisions['z+']?.length) {
                // if (this.debug) console.error('z+ collision', collisions['z+'])
                if (roundFractional(collisions['z+'][0].distance, 5) <= this.move.displacement.z + this.boundOffset['z+']) {
                    this.move.displacement.z = Math.min(collisions['z+'][0].distance - this.boundOffset['z+'], 0)
                }
            } else if (this.move.displacement.z < 0 && collisions['z-']?.length) {
                // if (this.debug) console.error('z- collision', collisions['z-'])
                if (roundFractional(collisions['z-'][0].distance, 5) <= -this.move.displacement.z + this.boundOffset['z-']) {
                    this.move.displacement.z = -Math.min(collisions['z-'][0].distance - this.boundOffset['z-'], 0)
                }
            }
        }
        if (this.move.displacement.y > 0 && collisions['y+']?.length) {
            // if (this.debug) console.error('y+ collision', collisions['y+'])
            if (roundFractional(collisions['y+'][0].distance, 5) <= this.move.displacement.y + this.boundOffset['y+']) {
                this.move.displacement.y = Math.min(collisions['y+'][0].distance - this.boundOffset['y+'], 0)
                this.move.velocity.y = 0
            }
        }
        if (collisions['y-']?.length && this.move.displacement.y <= 0) {
            // if (this.debug) console.error('y- collision', collisions['y-'][0].distance, (-this.move.displacement.y + this.boundOffset['y-']))
            if (roundFractional(collisions['y-'][0].distance, 5) <= (-this.move.displacement.y + this.boundOffset['y-'])) {
                this.move.displacement.y = -Math.min(collisions['y-'][0].distance - this.boundOffset['y-'], -this.move.displacement.y)
                this._handleJumpEnd()
            } else if (!this.jump.start) {
                this._handleJumpStart(0)
                this.move.velocity.setY(0)
            }
        } else {
            this.jump.onTheGround = false
        }
    }
}

export { CannonEsControls }
