import {
	Euler,
	EventDispatcher,
	Vector3,
    MOUSE,
	TOUCH
} from 'three'
import * as THREE from 'three'


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

class RoamingControls extends EventDispatcher {
	constructor( camera, domElement, target ) {
		super()
        this.target = target
		this.camera = camera
		this.domElement = domElement
		this.enabled = true
		// Set to constrain the pitch of the camera
		// Range is 0 to Math.PI radians
		this.minPolarAngle = 0 // radians
		this.maxPolarAngle = Math.PI // radians
		this.pointerSpeed = 1.0
        this.pointers = []
		// The four arrow keys
		this.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' }
		// Mouse buttons
		this.mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: -1, RIGHT: -1 }
		// Touch fingers
		this.touches = { ONE: TOUCH.ROTATE }
        this.state = STATE.NONE
        this.move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            speed: 30,
            _vector: new Vector3(),
            displacement: new Vector3(),
            prevTime: performance.now()
        }
        this.rotate = {
            start: new Vector3(),
            delta: new Vector3(),
            _euler: new Euler( 0, 0, 0, 'YXZ' )
        }
        this.jump = {
            start: false,
            startTime: null,
            enable: true,
            groudY: 0,
            speed: 4
        }
		this.connect()
	}

	connect() {
        this.domElement.addEventListener( 'pointerdown', this.onPointerDown )
        this.domElement.addEventListener('pointermove', this.onPointerMove)
        this.domElement.addEventListener('pointerup', this.onPointerUp)
        document.addEventListener( 'keydown', this.onKeyDown )
        document.addEventListener( 'keyup', this.onKeyUp )
	}

	disconnect() {
		this.domElement.removeEventListener( 'pointerdown', this.onPointerDown )
        this.domElement.removeEventListener('pointermove', this.onPointerMove)
        this.domElement.removeEventListener('pointerup', this.onPointerUp)
        document.removeEventListener( 'keydown', this.onKeyDown )
        document.removeEventListener( 'keyup', this.onKeyUp )
	}

	dispose() {
		this.disconnect()
	}

	moveForward( distance ) {
		const camera = this.camera
		this.move._vector.setFromMatrixColumn( camera.matrix, 0 )
		this.move._vector.crossVectors( camera.up, this.move._vector )
		camera.position.addScaledVector( this.move._vector, distance )
        this.target.addScaledVector( this.move._vector, distance )
	}

	moveRight( distance ) {
		const camera = this.camera
		this.move._vector.setFromMatrixColumn( camera.matrix, 0 )
		camera.position.addScaledVector( this.move._vector, distance )
        this.target.addScaledVector( this.move._vector, distance )
	}

    onPointerDown = (event) => {
        const handleRotateStart = (x, y) => {
            this.rotate.start.set(x, y, 0)
        }
        const onMouseDown = ( event ) => {
			let mouseAction
			switch ( event.button ) {
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
			switch ( mouseAction ) {
				case MOUSE.ROTATE:
					handleRotateStart( event.offsetX, event.offsetY )
                    this.state = STATE.ROTATE
					break
				default:
					this.state = STATE.NONE
			}

		}
        const onTouchStart = ( event ) => {
			switch ( this.pointers.length ) {
				case 1:
					switch ( this.touches.ONE ) {
						case TOUCH.ROTATE:
                            const rotateStart = new Vector3()
                            if ( this.pointers.length === 1 ) {
                                rotateStart.set( this.pointers[ 0 ].offsetX, this.pointers[ 0 ].offsetY )
                            } else {
                                const x = 0.5 * ( this.pointers[ 0 ].offsetX + this.pointers[ 1 ].offsetX )
                                const y = 0.5 * ( this.pointers[ 0 ].offsetY + this.pointers[ 1 ].offsetY )
                                rotateStart.set( x, y )
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
        if ( this.enabled === false ) return
        this.pointers.push( event )
        if ( event.pointerType === 'touch' ) {
            onTouchStart( event )
        } else {
            onMouseDown( event )
        }
    }
    onPointerMove = (event) => {
        const handleRotate = (x, y) => {
            const delta = new Vector3(x - this.rotate.start.x, y - this.rotate.start.y)
            this.rotate.start.set(x, y, 0)
            this.rotate.delta.add(delta)
        }
        const onMouseMove = ( event ) => {
			switch ( this.state ) {
				case STATE.ROTATE:
					handleRotate( event.offsetX, event.offsetY )
					break
                default:
                    this.state = STATE.NONE
			}
		}
        const onTouchMove = ( event ) => {
			switch ( state ) {
				case STATE.TOUCH_ROTATE:
                    const position = new Vector3()
                    if ( this.pointers.length == 1 ) {
                        position.set( event.offsetX, event.offsetY );
                    } else {
                        const x = 0.5 * ( this.pointers[ 0 ].offsetX + this.pointers[ 1 ].offsetX )
                        const y = 0.5 * ( this.pointers[ 0 ].offsetY + this.pointers[ 1 ].offsetY )
                        position.set( x, y )
                    }
					handleRotate( position.x, position.y )
					break
				default:
					this.state = STATE.NONE
			}
		}
        if ( this.enabled === false || !this.pointers.length ) return
        if ( event.pointerType === 'touch' ) {
            onTouchMove( event )
        } else {
            onMouseMove( event )
        }
    }
    onPointerUp = (event) => {
        for ( let i = 0; i < this.pointers.length; i ++ ) {
            if ( this.pointers[ i ].pointerId == event.pointerId ) {
                this.pointers.splice( i, 1 )
                return
            }
        }
    }

    onKeyDown = ( event ) => {
        if (!this.enabled) return
        switch ( event.code ) {
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
                if ( this.jump.enable === true && !this.jump.start ) {
                    this.move.prevTime = performance.now()
                    this.jump.startTime = performance.now()
                    this.jump.groudY = this.camera.position.y
                    this.jump.start = true
                }
                break
        }
    }

    onKeyUp = ( event ) => {
        switch ( event.code ) {
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

    update () {
        const time = performance.now()
        if ( this.enabled === true ) {
            // raycaster.ray.origin.copy( this.camera.position )
            // raycaster.ray.origin.y -= 10
            // const intersections = raycaster.intersectObjects( objects, false )
            // const onObject = intersections.length > 0
            let onObject = false
            const delta = ( time - this.move.prevTime ) / 1000
            this.move.displacement.x = 0
            this.move.displacement.y = 0
            this.move.displacement.z = 0
            if (this.jump.start) {
                // Δs = v0(t2-t1) + .5a(t2^2-t1^2)
                this.move.displacement.y = this.jump.speed * delta + .5 * GRAVITY * (((time - this.jump.startTime) / 1000) ** 2 - ((this.move.prevTime - this.jump.startTime) / 1000) ** 2)
            }
            direction.z = Number( this.move.forward ) - Number( this.move.backward )
            direction.x = Number( this.move.right ) - Number( this.move.left )
            direction.normalize() // this ensures consistent movements in all directions
            if ( this.move.forward || this.move.backward ) this.move.displacement.z -= direction.z * this.move.speed * delta
            if ( this.move.left || this.move.right ) this.move.displacement.x -= direction.x * this.move.speed * delta
            const newY = this.camera.position.y + this.move.displacement.y
            if (newY <= this.jump.groudY) {
                onObject = true
            }
            if ( onObject === true ) {
                this.move.displacement.y = 0
                this.jump.start = false
            }
            this.moveRight( - this.move.displacement.x )
            this.moveForward( - this.move.displacement.z )
            this.camera.position.y += this.move.displacement.y
            this.target.setY(this.target.y + this.move.displacement.y)
            if (this.rotate.delta.length() != 0) {
                const A = this.target.clone()
                const dist = A.clone().sub(this.camera.position).length()
                const pa = new Vector3(0, 0, -dist)
                const bT = new THREE.Matrix4().lookAt(this.camera.position, this.target, this.camera.up).premultiply(new THREE.Matrix4().makeTranslation(this.camera.position))
                const m2 = new THREE.Matrix4().makeRotationX(-this.rotate.delta.y * Math.PI * 2 / this.domElement.offsetHeight)
                const m3 = new THREE.Matrix4().makeRotationY(-this.rotate.delta.x * Math.PI * 2 / this.domElement.offsetWidth)
                const a = pa.clone().applyMatrix4(m2.premultiply(m3))
                const p = a.applyMatrix4(bT)
                this.target = p
                this.rotate.delta.set(0, 0, 0)
            }
            this.camera.lookAt(this.target)
            {
                if (!window.__target) {
                    window.__target = new THREE.Mesh(new THREE.BoxGeometry( 10, 10, 10 ), new THREE.MeshBasicMaterial( {color: 0x00ff00}))
                    this.camera.parent.add( window.__target )
                }
                window.__target.position.set(this.target.x, this.target.y, this.target.z)
            }
            this.dispatchEvent(_changeEvent)
        }
        this.move.prevTime = time
    }

}

export { RoamingControls }
