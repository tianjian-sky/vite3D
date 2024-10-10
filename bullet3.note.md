
## btCollisionWorld

``` javascript
const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
const broadphase = new Ammo.btDbvtBroadphase();
const solver = new Ammo.btSequentialImpulseConstraintSolver();
const world = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);

```

``` c++ 
/**
btCollisionWorld::btCollisionWorld(btDispatcher* dispatcher, btBroadphaseInterface* pairCache, btCollisionConfiguration* collisionConfiguration)
	: m_dispatcher1(dispatcher),
	  m_broadphasePairCache(pairCache),
	  m_debugDrawer(0),
	  m_forceUpdateAllAabbs(true)
{
}
 */
 ```

 ## rigidBody

 ``` c++
//island management, m_activationState1
#define ACTIVE_TAG 1
#define ISLAND_SLEEPING 2
#define WANTS_DEACTIVATION 3
#define DISABLE_DEACTIVATION 4
#define DISABLE_SIMULATION 5
#define FIXED_BASE_MULTI_BODY 6

struct btDispatcherInfo
{
	enum DispatchFunc
	{
		DISPATCH_DISCRETE = 1,
		DISPATCH_CONTINUOUS
	};
	btDispatcherInfo()
		: m_timeStep(btScalar(0.)),
		  m_stepCount(0),
		  m_dispatchFunc(DISPATCH_DISCRETE),
		  m_timeOfImpact(btScalar(1.)),
		  m_useContinuous(true),
		  m_debugDraw(0),
		  m_enableSatConvex(false),
		  m_enableSPU(true),
		  m_useEpa(true),
		  m_allowedCcdPenetration(btScalar(0.04)),
		  m_useConvexConservativeDistanceUtil(false),
		  m_convexConservativeDistanceThreshold(0.0f),
		  m_deterministicOverlappingPairs(false)
	{
	}
	btScalar m_timeStep;
	int m_stepCount;
	int m_dispatchFunc;
	mutable btScalar m_timeOfImpact;
	bool m_useContinuous;
	class btIDebugDraw* m_debugDraw;
	bool m_enableSatConvex;
	bool m_enableSPU;
	bool m_useEpa;
	btScalar m_allowedCcdPenetration;
	bool m_useConvexConservativeDistanceUtil;
	btScalar m_convexConservativeDistanceThreshold;
	bool m_deterministicOverlappingPairs;
};
enum CollisionFlags
{
	CF_DYNAMIC_OBJECT = 0,
	CF_STATIC_OBJECT = 1,
	CF_KINEMATIC_OBJECT = 2,
	CF_NO_CONTACT_RESPONSE = 4,
	CF_CUSTOM_MATERIAL_CALLBACK = 8,  //this allows per-triangle material (friction/restitution)
	CF_CHARACTER_OBJECT = 16,
	CF_DISABLE_VISUALIZE_OBJECT = 32,          //disable debug drawing
	CF_DISABLE_SPU_COLLISION_PROCESSING = 64,  //disable parallel/SPU processing
	CF_HAS_CONTACT_STIFFNESS_DAMPING = 128,
	CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR = 256,
	CF_HAS_FRICTION_ANCHOR = 512,
	CF_HAS_COLLISION_SOUND_TRIGGER = 1024
};

enum btRigidBodyFlags
{
	BT_DISABLE_WORLD_GRAVITY = 1,
	///BT_ENABLE_GYROPSCOPIC_FORCE flags is enabled by default in Bullet 2.83 and onwards.
	///and it BT_ENABLE_GYROPSCOPIC_FORCE becomes equivalent to BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY
	///See Demos/GyroscopicDemo and computeGyroscopicImpulseImplicit
	BT_ENABLE_GYROSCOPIC_FORCE_EXPLICIT = 2,
	BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_WORLD = 4,
	BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY = 8,
	BT_ENABLE_GYROPSCOPIC_FORCE = BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY,
};
SIMD_FORCE_INLINE bool isStaticOrKinematicObject() const
{
	return (m_collisionFlags & (CF_KINEMATIC_OBJECT | CF_STATIC_OBJECT)) != 0;
}

void btDiscreteDynamicsWorld::addRigidBody(btRigidBody* body)
{
	if (!body->isStaticOrKinematicObject() && !(body->getFlags() & BT_DISABLE_WORLD_GRAVITY))
	{
		body->setGravity(m_gravity);
	}

	if (body->getCollisionShape())
	{
		if (!body->isStaticObject())
		{
			m_nonStaticRigidBodies.push_back(body);
		}
		else
		{
			body->setActivationState(ISLAND_SLEEPING);
		}

		bool isDynamic = !(body->isStaticObject() || body->isKinematicObject());
		int collisionFilterGroup = isDynamic ? int(btBroadphaseProxy::DefaultFilter) : int(btBroadphaseProxy::StaticFilter);
		int collisionFilterMask = isDynamic ? int(btBroadphaseProxy::AllFilter) : int(btBroadphaseProxy::AllFilter ^ btBroadphaseProxy::StaticFilter);

		addCollisionObject(body, collisionFilterGroup, collisionFilterMask);
	}
}
enum BroadphaseNativeTypes
{
	// polyhedral convex shapes
	BOX_SHAPE_PROXYTYPE,
	TRIANGLE_SHAPE_PROXYTYPE,
	TETRAHEDRAL_SHAPE_PROXYTYPE,
	CONVEX_TRIANGLEMESH_SHAPE_PROXYTYPE,
	CONVEX_HULL_SHAPE_PROXYTYPE,
	CONVEX_POINT_CLOUD_SHAPE_PROXYTYPE,
	CUSTOM_POLYHEDRAL_SHAPE_TYPE,
	//implicit convex shapes
	IMPLICIT_CONVEX_SHAPES_START_HERE,
	SPHERE_SHAPE_PROXYTYPE,
	MULTI_SPHERE_SHAPE_PROXYTYPE,
	CAPSULE_SHAPE_PROXYTYPE,
	CONE_SHAPE_PROXYTYPE,
	CONVEX_SHAPE_PROXYTYPE,
	CYLINDER_SHAPE_PROXYTYPE,
	UNIFORM_SCALING_SHAPE_PROXYTYPE,
	MINKOWSKI_SUM_SHAPE_PROXYTYPE,
	MINKOWSKI_DIFFERENCE_SHAPE_PROXYTYPE,
	BOX_2D_SHAPE_PROXYTYPE,
	CONVEX_2D_SHAPE_PROXYTYPE,
	CUSTOM_CONVEX_SHAPE_TYPE,
	//concave shapes
	CONCAVE_SHAPES_START_HERE,
	//keep all the convex shapetype below here, for the check IsConvexShape in broadphase proxy!
	TRIANGLE_MESH_SHAPE_PROXYTYPE,
	SCALED_TRIANGLE_MESH_SHAPE_PROXYTYPE,
	///used for demo integration FAST/Swift collision library and Bullet
	FAST_CONCAVE_MESH_PROXYTYPE,
	//terrain
	TERRAIN_SHAPE_PROXYTYPE,
	///Used for GIMPACT Trimesh integration
	GIMPACT_SHAPE_PROXYTYPE,
	///Multimaterial mesh
	MULTIMATERIAL_TRIANGLE_MESH_PROXYTYPE,

	EMPTY_SHAPE_PROXYTYPE,
	STATIC_PLANE_PROXYTYPE,
	CUSTOM_CONCAVE_SHAPE_TYPE,
	SDF_SHAPE_PROXYTYPE = CUSTOM_CONCAVE_SHAPE_TYPE,
	CONCAVE_SHAPES_END_HERE,

	COMPOUND_SHAPE_PROXYTYPE,

	SOFTBODY_SHAPE_PROXYTYPE,
	HFFLUID_SHAPE_PROXYTYPE,
	HFFLUID_BUOYANT_CONVEX_SHAPE_PROXYTYPE,
	INVALID_SHAPE_PROXYTYPE,

	MAX_BROADPHASE_COLLISION_TYPES

};
SIMD_FORCE_INLINE bool isConvex() const
{
	return btBroadphaseProxy::isConvex(getShapeType());
}
static SIMD_FORCE_INLINE bool isPolyhedral(int proxyType)
{
	return (proxyType < IMPLICIT_CONVEX_SHAPES_START_HERE);
}
void btCollisionWorld::addCollisionObject(btCollisionObject* collisionObject, int collisionFilterGroup, int collisionFilterMask)
{
	btAssert(collisionObject);

	//check that the object isn't already added
	btAssert(m_collisionObjects.findLinearSearch(collisionObject) == m_collisionObjects.size());
	btAssert(collisionObject->getWorldArrayIndex() == -1);  // do not add the same object to more than one collision world

	collisionObject->setWorldArrayIndex(m_collisionObjects.size());
	m_collisionObjects.push_back(collisionObject);

	//calculate new AABB
	btTransform trans = collisionObject->getWorldTransform(); // m_worldTransform

	btVector3 minAabb;
	btVector3 maxAabb;
	collisionObject->getCollisionShape()->getAabb(trans, minAabb, maxAabb);

	int type = collisionObject->getCollisionShape()->getShapeType();
	collisionObject->setBroadphaseHandle(getBroadphase()->createProxy(
		minAabb,
		maxAabb,
		type,
		collisionObject,
		collisionFilterGroup,
		collisionFilterMask,
		m_dispatcher1));
}

//
btBroadphaseProxy* btDbvtBroadphase::createProxy(const btVector3& aabbMin,
												 const btVector3& aabbMax,
												 int /*shapeType*/,
												 void* userPtr,
												 int collisionFilterGroup,
												 int collisionFilterMask,
												 btDispatcher* /*dispatcher*/)
{
	btDbvtProxy* proxy = new (btAlignedAlloc(sizeof(btDbvtProxy), 16)) btDbvtProxy(aabbMin, aabbMax, userPtr,
																				   collisionFilterGroup,
																				   collisionFilterMask);

	btDbvtAabbMm aabb = btDbvtVolume::FromMM(aabbMin, aabbMax);

	//bproxy->aabb			=	btDbvtVolume::FromMM(aabbMin,aabbMax);
	proxy->stage = m_stageCurrent;
	proxy->m_uniqueId = ++m_gid;
	proxy->leaf = m_sets[0].insert(aabb, proxy);
	listappend(proxy, m_stageRoots[m_stageCurrent]);
	if (!m_deferedcollide)
	{
		btDbvtTreeCollider collider(this);
		collider.proxy = proxy;
		m_sets[0].collideTV(m_sets[0].m_root, aabb, collider);
		m_sets[1].collideTV(m_sets[1].m_root, aabb, collider);
	}
	return (proxy);
}
template <typename T>
static inline void listappend(T* item, T*& list)
{
	item->links[0] = 0;
	item->links[1] = list;
	if (list) list->links[0] = item;
	list = item;
}
//
btDbvtNode* btDbvt::insert(const btDbvtVolume& volume, void* data)
{
	btDbvtNode* leaf = createnode(this, 0, volume, data);
	insertleaf(this, m_root, leaf);
	++m_leaves;
	return (leaf);
}

//
static void insertleaf(btDbvt* pdbvt,
					   btDbvtNode* root,
					   btDbvtNode* leaf)
{
	if (!pdbvt->m_root)
	{
		pdbvt->m_root = leaf;
		leaf->parent = 0;
	}
	else
	{
		if (!root->isleaf())
		{
			do
			{
				root = root->childs[Select(leaf->volume,
										   root->childs[0]->volume,
										   root->childs[1]->volume)];
			} while (!root->isleaf());
		}
		btDbvtNode* prev = root->parent;
		btDbvtNode* node = createnode(pdbvt, prev, leaf->volume, root->volume, 0);
		if (prev)
		{
			prev->childs[indexof(root)] = node;
			node->childs[0] = root;
			root->parent = node;
			node->childs[1] = leaf;
			leaf->parent = node;
			do
			{
				if (!prev->volume.Contain(node->volume))
					Merge(prev->childs[0]->volume, prev->childs[1]->volume, prev->volume);
				else
					break;
				node = prev;
			} while (0 != (prev = node->parent));
		}
		else
		{
			node->childs[0] = root;
			root->parent = node;
			node->childs[1] = leaf;
			leaf->parent = node;
			pdbvt->m_root = node;
		}
	}
}

//
DBVT_INLINE int Select(const btDbvtAabbMm& o,
					   const btDbvtAabbMm& a,
					   const btDbvtAabbMm& b)
{
#if DBVT_SELECT_IMPL == DBVT_IMPL_SSE

#if defined(_WIN32)
	static ATTRIBUTE_ALIGNED16(const unsigned __int32) mask[] = {0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff};
#else
	static ATTRIBUTE_ALIGNED16(const unsigned int) mask[] = {0x7fffffff, 0x7fffffff, 0x7fffffff, 0x00000000 /*0x7fffffff*/};
#endif
	///@todo: the intrinsic version is 11% slower
#if DBVT_USE_INTRINSIC_SSE

	union btSSEUnion  ///NOTE: if we use more intrinsics, move btSSEUnion into the LinearMath directory
	{
		__m128 ssereg;
		float floats[4];
		int ints[4];
	};

	__m128 omi(_mm_load_ps(o.mi));
	omi = _mm_add_ps(omi, _mm_load_ps(o.mx));
	__m128 ami(_mm_load_ps(a.mi));
	ami = _mm_add_ps(ami, _mm_load_ps(a.mx));
	ami = _mm_sub_ps(ami, omi);
	ami = _mm_and_ps(ami, _mm_load_ps((const float*)mask));
	__m128 bmi(_mm_load_ps(b.mi));
	bmi = _mm_add_ps(bmi, _mm_load_ps(b.mx));
	bmi = _mm_sub_ps(bmi, omi);
	bmi = _mm_and_ps(bmi, _mm_load_ps((const float*)mask));
	__m128 t0(_mm_movehl_ps(ami, ami));
	ami = _mm_add_ps(ami, t0);
	ami = _mm_add_ss(ami, _mm_shuffle_ps(ami, ami, 1));
	__m128 t1(_mm_movehl_ps(bmi, bmi));
	bmi = _mm_add_ps(bmi, t1);
	bmi = _mm_add_ss(bmi, _mm_shuffle_ps(bmi, bmi, 1));

	btSSEUnion tmp;
	tmp.ssereg = _mm_cmple_ss(bmi, ami);
	return tmp.ints[0] & 1;

#else
	ATTRIBUTE_ALIGNED16(__int32 r[1]);
	__asm
	{
		mov		eax,o
			mov		ecx,a
			mov		edx,b
			movaps	xmm0,[eax]
		movaps	xmm5,mask
			addps	xmm0,[eax+16]	
		movaps	xmm1,[ecx]
		movaps	xmm2,[edx]
		addps	xmm1,[ecx+16]
		addps	xmm2,[edx+16]
		subps	xmm1,xmm0
			subps	xmm2,xmm0
			andps	xmm1,xmm5
			andps	xmm2,xmm5
			movhlps	xmm3,xmm1
			movhlps	xmm4,xmm2
			addps	xmm1,xmm3
			addps	xmm2,xmm4
			pshufd	xmm3,xmm1,1
			pshufd	xmm4,xmm2,1
			addss	xmm1,xmm3
			addss	xmm2,xmm4
			cmpless	xmm2,xmm1
			movss	r,xmm2
	}
	return (r[0] & 1);
#endif
#else
	return (Proximity(o, a) < Proximity(o, b) ? 0 : 1);
#endif
}
 ```

## btDbvtProxy

``` c++

struct btDbvtProxy : btBroadphaseProxy
{
	/* Fields		*/
	//btDbvtAabbMm	aabb;
	btDbvtNode* leaf;
	btDbvtProxy* links[2];
	int stage;
	/* ctor			*/
	btDbvtProxy(const btVector3& aabbMin, const btVector3& aabbMax, void* userPtr, int collisionFilterGroup, int collisionFilterMask) : btBroadphaseProxy(aabbMin, aabbMax, userPtr, collisionFilterGroup, collisionFilterMask)
	{
		links[0] = links[1] = 0;
	}
};
```
### btBroadphaseProxy

``` c++

///The btBroadphaseProxy is the main class that can be used with the Bullet broadphases.
///It stores collision shape type information, collision filter information and a client object, typically a btCollisionObject or btRigidBody.
ATTRIBUTE_ALIGNED16(struct)
btBroadphaseProxy
{
	BT_DECLARE_ALIGNED_ALLOCATOR();

	///optional filtering to cull potential collisions
	enum CollisionFilterGroups
	{
		DefaultFilter = 1,
		StaticFilter = 2,
		KinematicFilter = 4,
		DebrisFilter = 8,
		SensorTrigger = 16,
		CharacterFilter = 32,
		AllFilter = -1  //all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
	};

	//Usually the client btCollisionObject or Rigidbody class
	void* m_clientObject;
	int m_collisionFilterGroup;
	int m_collisionFilterMask;

	int m_uniqueId;  //m_uniqueId is introduced for paircache. could get rid of this, by calculating the address offset etc.

	btVector3 m_aabbMin;
	btVector3 m_aabbMax;

	SIMD_FORCE_INLINE int getUid() const
	{
		return m_uniqueId;
	}

	//used for memory pools
	btBroadphaseProxy() : m_clientObject(0)
	{
	}

	btBroadphaseProxy(const btVector3& aabbMin, const btVector3& aabbMax, void* userPtr, int collisionFilterGroup, int collisionFilterMask)
		: m_clientObject(userPtr),
		  m_collisionFilterGroup(collisionFilterGroup),
		  m_collisionFilterMask(collisionFilterMask),
		  m_aabbMin(aabbMin),
		  m_aabbMax(aabbMax)
	{
	}

	static SIMD_FORCE_INLINE bool isPolyhedral(int proxyType)
	{
		return (proxyType < IMPLICIT_CONVEX_SHAPES_START_HERE);
	}

	static SIMD_FORCE_INLINE bool isConvex(int proxyType)
	{
		return (proxyType < CONCAVE_SHAPES_START_HERE);
	}

	static SIMD_FORCE_INLINE bool isNonMoving(int proxyType)
	{
		return (isConcave(proxyType) && !(proxyType == GIMPACT_SHAPE_PROXYTYPE));
	}

	static SIMD_FORCE_INLINE bool isConcave(int proxyType)
	{
		return ((proxyType > CONCAVE_SHAPES_START_HERE) &&
				(proxyType < CONCAVE_SHAPES_END_HERE));
	}
	static SIMD_FORCE_INLINE bool isCompound(int proxyType)
	{
		return (proxyType == COMPOUND_SHAPE_PROXYTYPE);
	}

	static SIMD_FORCE_INLINE bool isSoftBody(int proxyType)
	{
		return (proxyType == SOFTBODY_SHAPE_PROXYTYPE);
	}

	static SIMD_FORCE_INLINE bool isInfinite(int proxyType)
	{
		return (proxyType == STATIC_PLANE_PROXYTYPE);
	}

	static SIMD_FORCE_INLINE bool isConvex2d(int proxyType)
	{
		return (proxyType == BOX_2D_SHAPE_PROXYTYPE) || (proxyType == CONVEX_2D_SHAPE_PROXYTYPE);
	}
};

```
### btDbvtNode

``` c++
/* btDbvtNode				*/
struct btDbvtNode
{
	btDbvtVolume volume;
	btDbvtNode* parent;
	DBVT_INLINE bool isleaf() const { return (childs[1] == 0); }
	DBVT_INLINE bool isinternal() const { return (!isleaf()); }
	union {
		btDbvtNode* childs[2];
		void* data;
		int dataAsInt;
	};
};
```

### btDbvtVolume;
``` c++
typedef btDbvtAabbMm btDbvtVolume;

/* btDbvtAabbMm			*/
struct btDbvtAabbMm
{
    DBVT_INLINE btDbvtAabbMm(){}
	DBVT_INLINE btVector3 Center() const { return ((mi + mx) / 2); }
	DBVT_INLINE btVector3 Lengths() const { return (mx - mi); }
	DBVT_INLINE btVector3 Extents() const { return ((mx - mi) / 2); }
	DBVT_INLINE const btVector3& Mins() const { return (mi); }
	DBVT_INLINE const btVector3& Maxs() const { return (mx); }
	static inline btDbvtAabbMm FromCE(const btVector3& c, const btVector3& e);
	static inline btDbvtAabbMm FromCR(const btVector3& c, btScalar r);
	static inline btDbvtAabbMm FromMM(const btVector3& mi, const btVector3& mx);
	static inline btDbvtAabbMm FromPoints(const btVector3* pts, int n);
	static inline btDbvtAabbMm FromPoints(const btVector3** ppts, int n);
	DBVT_INLINE void Expand(const btVector3& e);
	DBVT_INLINE void SignedExpand(const btVector3& e);
	DBVT_INLINE bool Contain(const btDbvtAabbMm& a) const;
	DBVT_INLINE int Classify(const btVector3& n, btScalar o, int s) const;
	DBVT_INLINE btScalar ProjectMinimum(const btVector3& v, unsigned signs) const;
	DBVT_INLINE friend bool Intersect(const btDbvtAabbMm& a,
									  const btDbvtAabbMm& b);

	DBVT_INLINE friend bool Intersect(const btDbvtAabbMm& a,
									  const btVector3& b);

	DBVT_INLINE friend btScalar Proximity(const btDbvtAabbMm& a,
										  const btDbvtAabbMm& b);
	DBVT_INLINE friend int Select(const btDbvtAabbMm& o,
								  const btDbvtAabbMm& a,
								  const btDbvtAabbMm& b);
	DBVT_INLINE friend void Merge(const btDbvtAabbMm& a,
								  const btDbvtAabbMm& b,
								  btDbvtAabbMm& r);
	DBVT_INLINE friend bool NotEqual(const btDbvtAabbMm& a,
									 const btDbvtAabbMm& b);

	DBVT_INLINE btVector3& tMins() { return (mi); }
	DBVT_INLINE btVector3& tMaxs() { return (mx); }

private:
	DBVT_INLINE void AddSpan(const btVector3& d, btScalar& smi, btScalar& smx) const;

private:
	btVector3 mi, mx;
};

```

### btDbvtTreeCollider

``` c++
/* Tree collider	*/
struct btDbvtTreeCollider : btDbvt::ICollide
{
	btDbvtBroadphase* pbp;
	btDbvtProxy* proxy;
	btDbvtTreeCollider(btDbvtBroadphase* p) : pbp(p) {}
	void Process(const btDbvtNode* na, const btDbvtNode* nb)
	{
		if (na != nb)
		{
			btDbvtProxy* pa = (btDbvtProxy*)na->data;
			btDbvtProxy* pb = (btDbvtProxy*)nb->data;
#if DBVT_BP_SORTPAIRS
			if (pa->m_uniqueId > pb->m_uniqueId)
				btSwap(pa, pb);
#endif
			pbp->m_paircache->addOverlappingPair(pa, pb);
			++pbp->m_newpairs;
		}
	}
	void Process(const btDbvtNode* n)
	{
		Process(n, proxy->leaf);
	}
};

```

 ## btDbvtBroadphase
 ``` c++
///The btDbvtBroadphase implements a broadphase using two dynamic AABB bounding volume hierarchies/trees (see btDbvt).
///One tree is used for static/non-moving objects, and another tree is used for dynamic objects. Objects can move from one tree to the other.
///This is a very fast broadphase, especially for very dynamic worlds where many objects are moving. Its insert/add and remove of objects is generally faster than the sweep and prune broadphases btAxisSweep3 and bt32BitAxisSweep3.
struct btDbvtBroadphase : btBroadphaseInterface
{
	/* Config		*/
	enum
	{
		DYNAMIC_SET = 0, /* Dynamic set index	*/
		FIXED_SET = 1,   /* Fixed set index		*/
		STAGECOUNT = 2   /* Number of stages		*/
	};
	/* Fields		*/
	btDbvt m_sets[2];                           // Dbvt sets
	btDbvtProxy* m_stageRoots[STAGECOUNT + 1];  // Stages list
	btOverlappingPairCache* m_paircache;        // Pair cache
	btScalar m_prediction;                      // Velocity prediction
	int m_stageCurrent;                         // Current stage
	int m_fupdates;                             // % of fixed updates per frame
	int m_dupdates;                             // % of dynamic updates per frame
	int m_cupdates;                             // % of cleanup updates per frame
	int m_newpairs;                             // Number of pairs created
	int m_fixedleft;                            // Fixed optimization left
	unsigned m_updates_call;                    // Number of updates call
	unsigned m_updates_done;                    // Number of updates done
	btScalar m_updates_ratio;                   // m_updates_done/m_updates_call
	int m_pid;                                  // Parse id
	int m_cid;                                  // Cleanup index
	int m_gid;                                  // Gen id
	bool m_releasepaircache;                    // Release pair cache on delete
	bool m_deferedcollide;                      // Defere dynamic/static collision to collide call
	bool m_needcleanup;                         // Need to run cleanup?
	btAlignedObjectArray<btAlignedObjectArray<const btDbvtNode*> > m_rayTestStacks;
#if DBVT_BP_PROFILE
	btClock m_clock;
	struct
	{
		unsigned long m_total;
		unsigned long m_ddcollide;
		unsigned long m_fdcollide;
		unsigned long m_cleanup;
		unsigned long m_jobcount;
	} m_profiling;
#endif
	/* Methods		*/
	btDbvtBroadphase(btOverlappingPairCache* paircache = 0);
	~btDbvtBroadphase();
	void collide(btDispatcher* dispatcher);
	void optimize();

	/* btBroadphaseInterface Implementation	*/
	btBroadphaseProxy* createProxy(const btVector3& aabbMin, const btVector3& aabbMax, int shapeType, void* userPtr, int collisionFilterGroup, int collisionFilterMask, btDispatcher* dispatcher);
	virtual void destroyProxy(btBroadphaseProxy* proxy, btDispatcher* dispatcher);
	virtual void setAabb(btBroadphaseProxy* proxy, const btVector3& aabbMin, const btVector3& aabbMax, btDispatcher* dispatcher);
	virtual void rayTest(const btVector3& rayFrom, const btVector3& rayTo, btBroadphaseRayCallback& rayCallback, const btVector3& aabbMin = btVector3(0, 0, 0), const btVector3& aabbMax = btVector3(0, 0, 0));
	virtual void aabbTest(const btVector3& aabbMin, const btVector3& aabbMax, btBroadphaseAabbCallback& callback);

	virtual void getAabb(btBroadphaseProxy* proxy, btVector3& aabbMin, btVector3& aabbMax) const;
	virtual void calculateOverlappingPairs(btDispatcher* dispatcher);
	virtual btOverlappingPairCache* getOverlappingPairCache();
	virtual const btOverlappingPairCache* getOverlappingPairCache() const;
	virtual void getBroadphaseAabb(btVector3& aabbMin, btVector3& aabbMax) const;
	virtual void printStats();

	///reset broadphase internal structures, to ensure determinism/reproducability
	virtual void resetPool(btDispatcher* dispatcher);

	void performDeferredRemoval(btDispatcher* dispatcher);

	void setVelocityPrediction(btScalar prediction)
	{
		m_prediction = prediction;
	}
	btScalar getVelocityPrediction() const
	{
		return m_prediction;
	}

	///this setAabbForceUpdate is similar to setAabb but always forces the aabb update.
	///it is not part of the btBroadphaseInterface but specific to btDbvtBroadphase.
	///it bypasses certain optimizations that prevent aabb updates (when the aabb shrinks), see
	///http://code.google.com/p/bullet/issues/detail?id=223
	void setAabbForceUpdate(btBroadphaseProxy* absproxy, const btVector3& aabbMin, const btVector3& aabbMax, btDispatcher* /*dispatcher*/);

	static void benchmark(btBroadphaseInterface*);
};

#endif
 ```

## stepSimulation

``` c++
int btDiscreteDynamicsWorld::stepSimulation(btScalar timeStep, int maxSubSteps, btScalar fixedTimeStep)
{
    if (maxSubSteps)
	{
		//fixed timestep with interpolation
		m_fixedTimeStep = fixedTimeStep;
		m_localTime += timeStep;
	}
	else
	{
		//variable timestep
		fixedTimeStep = timeStep;
		m_localTime = m_latencyMotionStateInterpolation ? 0 : timeStep;
		m_fixedTimeStep = 0;
        numSimulationSubSteps = 1;
        maxSubSteps = 1;
	}
    //clamp the number of substeps, to prevent simulation grinding spiralling down to a halt
    int clampedSimulationSteps = (numSimulationSubSteps > maxSubSteps) ? maxSubSteps : numSimulationSubSteps;
    saveKinematicState(fixedTimeStep * clampedSimulationSteps);

    /**
     * 
     * void btDiscreteDynamicsWorld::applyGravity()
        {
            ///@todo: iterate over awake simulation islands!
            for (int i = 0; i < m_nonStaticRigidBodies.size(); i++)
            {
                btRigidBody* body = m_nonStaticRigidBodies[i];
                if (body->isActive())
                {
                    body->applyGravity();
                }
            }
        }

     * 
     */
    /**
     * btVector3 m_gravity; {0, -10, 0}
     * void btRigidBody::applyGravity()
        {
            if (isStaticOrKinematicObject())
                return;

            applyCentralForce(m_gravity);
        }
     */
    /**
     * SIMD_FORCE_INLINE bool isStaticOrKinematicObject() const
        {
            return (m_collisionFlags & (CF_KINEMATIC_OBJECT | CF_STATIC_OBJECT)) != 0;
        }
     */
    /**
     * void applyCentralForce(const btVector3& force)
        {
            m_totalForce += force * m_linearFactor;
        }
     * 
     */
    applyGravity();
    for (int i = 0; i < clampedSimulationSteps; i++)
    {
        internalSingleStepSimulation(fixedTimeStep);
        synchronizeMotionStates();
    }
    clearForces();
}

```
### btDiscreteDynamicsWorld::internalSingleStepSimulation(btScalar timeStep)

``` c++

void btDiscreteDynamicsWorld::internalSingleStepSimulation(btScalar timeStep)
{
	BT_PROFILE("internalSingleStepSimulation");

	if (0 != m_internalPreTickCallback)
	{
		(*m_internalPreTickCallback)(this, timeStep);
	}

	///apply gravity, predict motion
	predictUnconstraintMotion(timeStep);

	btDispatcherInfo& dispatchInfo = getDispatchInfo();

	dispatchInfo.m_timeStep = timeStep;
	dispatchInfo.m_stepCount = 0;
	dispatchInfo.m_debugDraw = getDebugDrawer();

	createPredictiveContacts(timeStep);

	///perform collision detection
	performDiscreteCollisionDetection();

	calculateSimulationIslands();

	getSolverInfo().m_timeStep = timeStep;

	///solve contact and other joint constraints
	solveConstraints(getSolverInfo());

	///CallbackTriggers();

	///integrate transforms

	integrateTransforms(timeStep);

	///update vehicle simulation
	updateActions(timeStep);

	updateActivationState(timeStep);

	if (0 != m_internalTickCallback)
	{
		(*m_internalTickCallback)(this, timeStep);
	}
}

```

### btDiscreteDynamicsWorld::synchronizeMotionStates()

``` c++

void btDiscreteDynamicsWorld::synchronizeMotionStates()
{
	//	BT_PROFILE("synchronizeMotionStates");
	if (m_synchronizeAllMotionStates)
	{
		//iterate  over all collision objects
		for (int i = 0; i < m_collisionObjects.size(); i++)
		{
			btCollisionObject* colObj = m_collisionObjects[i];
			btRigidBody* body = btRigidBody::upcast(colObj);
			if (body)
				synchronizeSingleMotionState(body);
		}
	}
	else
	{
		//iterate over all active rigid bodies
		for (int i = 0; i < m_nonStaticRigidBodies.size(); i++)
		{
			btRigidBody* body = m_nonStaticRigidBodies[i];
			if (body->isActive())
				synchronizeSingleMotionState(body);
		}
	}
}

```

### btSimpleDynamicsWorld::synchronizeMotionStates()
``` c++

void btSimpleDynamicsWorld::synchronizeMotionStates()
{
	///@todo: iterate over awake simulation islands!
	for (int i = 0; i < m_collisionObjects.size(); i++)
	{
		btCollisionObject* colObj = m_collisionObjects[i];
		btRigidBody* body = btRigidBody::upcast(colObj);
		if (body && body->getMotionState())
		{
			if (body->getActivationState() != ISLAND_SLEEPING)
			{
				body->getMotionState()->setWorldTransform(body->getWorldTransform());
			}
		}
	}
}

```

### btDiscreteDynamicsWorld::saveKinematicState

``` c++

void btDiscreteDynamicsWorld::saveKinematicState(btScalar timeStep)
{
	///would like to iterate over m_nonStaticRigidBodies, but unfortunately old API allows
	///to switch status _after_ adding kinematic objects to the world
	///fix it for Bullet 3.x release

    /**
     * btCollisionWorld::m_collisionObjects
     * btAlignedObjectArray<btCollisionObject*> m_collisionObjects;
     * 
     * virtual btScalar btCollisionWorld::addSingleResult(LocalRayResult& rayResult, bool normalInWorldSpace)
		{
			m_collisionObject = rayResult.m_collisionObject;
			m_collisionObjects.push_back(rayResult.m_collisionObject);
			btVector3 hitNormalWorld;
			if (normalInWorldSpace)
			{
				hitNormalWorld = rayResult.m_hitNormalLocal;
			}
			else
			{
				///need to transform normal into worldspace
				hitNormalWorld = m_collisionObject->getWorldTransform().getBasis() * rayResult.m_hitNormalLocal;
			}
			m_hitNormalWorld.push_back(hitNormalWorld);
			btVector3 hitPointWorld;
			hitPointWorld.setInterpolate3(m_rayFromWorld, m_rayToWorld, rayResult.m_hitFraction);
			m_hitPointWorld.push_back(hitPointWorld);
			m_hitFractions.push_back(rayResult.m_hitFraction);
			return m_closestHitFraction;
		}
     */

    /**
     * 
     * btCollisionObject
     * 
     * /// btCollisionObject maintains all information that is needed for a collision detection: Shape, Transform and AABB proxy.
        /// They can be added to the btCollisionWorld.
     * 
     */
	for (int i = 0; i < m_collisionObjects.size(); i++)
	{
		btCollisionObject* colObj = m_collisionObjects[i];
		btRigidBody* body = btRigidBody::upcast(colObj);
        /**
         * btCollisionObject::getActivationState
         * SIMD_FORCE_INLINE int getActivationState() const { return m_activationState1; }
         * 
         * 
         * //m_activationState1
            #define ACTIVE_TAG 1
            #define ISLAND_SLEEPING 2
            #define WANTS_DEACTIVATION 3
            #define DISABLE_DEACTIVATION 4
            #define DISABLE_SIMULATION 5
            #define FIXED_BASE_MULTI_BODY 6
         * 
         */

        /**
         * enum CollisionFlags
            {
                CF_DYNAMIC_OBJECT = 0,
                CF_STATIC_OBJECT = 1,
                CF_KINEMATIC_OBJECT = 2,
                CF_NO_CONTACT_RESPONSE = 4,
                CF_CUSTOM_MATERIAL_CALLBACK = 8,  //this allows per-triangle material (friction/restitution)
                CF_CHARACTER_OBJECT = 16,
                CF_DISABLE_VISUALIZE_OBJECT = 32,          //disable debug drawing
                CF_DISABLE_SPU_COLLISION_PROCESSING = 64,  //disable parallel/SPU processing
                CF_HAS_CONTACT_STIFFNESS_DAMPING = 128,
                CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR = 256,
                CF_HAS_FRICTION_ANCHOR = 512,
                CF_HAS_COLLISION_SOUND_TRIGGER = 1024
            };
         */

        /**
         * 
         *  SIMD_FORCE_INLINE bool btCollisionObject::isKinematicObject() const
            {
                return (m_collisionFlags & CF_KINEMATIC_OBJECT) != 0;
            }
         * 
         */

        /**
         * 
            void btRigidBody::saveKinematicState(btScalar timeStep)
            {
                //todo: clamp to some (user definable) safe minimum timestep, to limit maximum angular/linear velocities
                if (timeStep != btScalar(0.))
                {
                    //if we use motionstate to synchronize world transforms, get the new kinematic/animated world transform
                    if (getMotionState())
                        getMotionState()->getWorldTransform(m_worldTransform);
                    btVector3 linVel, angVel;

                    btTransformUtil::calculateVelocity(m_interpolationWorldTransform, m_worldTransform, timeStep, m_linearVelocity, m_angularVelocity);
                    m_interpolationLinearVelocity = m_linearVelocity;
                    m_interpolationAngularVelocity = m_angularVelocity;
                    m_interpolationWorldTransform = m_worldTransform;
                    //printf("angular = %f %f %f\n",m_angularVelocity.getX(),m_angularVelocity.getY(),m_angularVelocity.getZ());
                }
            }
         */

        /**
         * btRigidBody::getMotionState
         * btMotionState* getMotionState()
            {
                return m_optionalMotionState;
            }
         * 
         */
        /**
            * static void calculateVelocity(const btTransform& transform0, const btTransform& transform1, btScalar timeStep, btVector3& linVel, btVector3& angVel)
            {
                linVel = (transform1.getOrigin() - transform0.getOrigin()) / timeStep;
                btVector3 axis;
                btScalar angle;
                calculateDiffAxisAngle(transform0, transform1, axis, angle);
                angVel = axis * angle / timeStep;
            }
         * 
         */

		if (body && body->getActivationState() != ISLAND_SLEEPING)
		{
			if (body->isKinematicObject())
			{
				//to calculate velocities next frame
				body->saveKinematicState(timeStep);
			}
		}
	}
}
```

 ## btDiscreteDynamicsWorld::internalSingleStepSimulation(btScalar timeStep)

``` c++

void btDiscreteDynamicsWorld::internalSingleStepSimulation(btScalar timeStep)
{
	BT_PROFILE("internalSingleStepSimulation");

	if (0 != m_internalPreTickCallback)
	{
		(*m_internalPreTickCallback)(this, timeStep);
	}

	///apply gravity, predict motion
	predictUnconstraintMotion(timeStep);

	btDispatcherInfo& dispatchInfo = getDispatchInfo();

	dispatchInfo.m_timeStep = timeStep;
	dispatchInfo.m_stepCount = 0;
	dispatchInfo.m_debugDraw = getDebugDrawer();

	createPredictiveContacts(timeStep);

	///perform collision detection
	performDiscreteCollisionDetection();

	calculateSimulationIslands();

	getSolverInfo().m_timeStep = timeStep;

	///solve contact and other joint constraints
	solveConstraints(getSolverInfo());

	///CallbackTriggers();

	///integrate transforms

	integrateTransforms(timeStep);

	///update vehicle simulation
	updateActions(timeStep);

	updateActivationState(timeStep);

	if (0 != m_internalTickCallback)
	{
		(*m_internalTickCallback)(this, timeStep);
	}
}

```
### getDispatchInfo
 * btDispatcherInfo m_dispatchInfo;

### btDiscreteDynamicsWorld::predictUnconstraintMotion

``` c++
void btDiscreteDynamicsWorld::predictUnconstraintMotion(btScalar timeStep)
{
	BT_PROFILE("predictUnconstraintMotion");
	for (int i = 0; i < m_nonStaticRigidBodies.size(); i++)
	{
		btRigidBody* body = m_nonStaticRigidBodies[i];
		if (!body->isStaticOrKinematicObject())
		{
			//don't integrate/update velocities here, it happens in the constraint solver

			body->applyDamping(timeStep);

			body->predictIntegratedTransform(timeStep, body->getInterpolationWorldTransform());
		}
	}
}
```

#### btRigidBody::applyDamping(btScalar timeStep)
``` c++

///applyDamping damps the velocity, using the given m_linearDamping and m_angularDamping
void btRigidBody::applyDamping(btScalar timeStep)
{
	//On new damping: see discussion/issue report here: http://code.google.com/p/bullet/issues/detail?id=74
	//todo: do some performance comparisons (but other parts of the engine are probably bottleneck anyway

#ifdef BT_USE_OLD_DAMPING_METHOD
	m_linearVelocity *= btMax((btScalar(1.0) - timeStep * m_linearDamping), btScalar(0.0));
	m_angularVelocity *= btMax((btScalar(1.0) - timeStep * m_angularDamping), btScalar(0.0));
#else
	m_linearVelocity *= btPow(btScalar(1) - m_linearDamping, timeStep);
	m_angularVelocity *= btPow(btScalar(1) - m_angularDamping, timeStep);
#endif

	if (m_additionalDamping)
	{
		//Additional damping can help avoiding lowpass jitter motion, help stability for ragdolls etc.
		//Such damping is undesirable, so once the overall simulation quality of the rigid body dynamics system has improved, this should become obsolete
		if ((m_angularVelocity.length2() < m_additionalAngularDampingThresholdSqr) &&
			(m_linearVelocity.length2() < m_additionalLinearDampingThresholdSqr))
		{
			m_angularVelocity *= m_additionalDampingFactor;
			m_linearVelocity *= m_additionalDampingFactor;
		}

		btScalar speed = m_linearVelocity.length();
		if (speed < m_linearDamping)
		{
			btScalar dampVel = btScalar(0.005);
			if (speed > dampVel)
			{
				btVector3 dir = m_linearVelocity.normalized();
				m_linearVelocity -= dir * dampVel;
			}
			else
			{
				m_linearVelocity.setValue(btScalar(0.), btScalar(0.), btScalar(0.));
			}
		}

		btScalar angSpeed = m_angularVelocity.length();
		if (angSpeed < m_angularDamping)
		{
			btScalar angDampVel = btScalar(0.005);
			if (angSpeed > angDampVel)
			{
				btVector3 dir = m_angularVelocity.normalized();
				m_angularVelocity -= dir * angDampVel;
			}
			else
			{
				m_angularVelocity.setValue(btScalar(0.), btScalar(0.), btScalar(0.));
			}
		}
	}
}
```

#### btRigidBody::predictIntegratedTransform

``` c++

void btRigidBody::predictIntegratedTransform(btScalar timeStep, btTransform& predictedTransform)
{
	btTransformUtil::integrateTransform(m_worldTransform, m_linearVelocity, m_angularVelocity, timeStep, predictedTransform);
}

```


### btDiscreteDynamicsWorld::createPredictiveContacts(btScalar timeStep)
``` c++
void btDiscreteDynamicsWorld::createPredictiveContacts(btScalar timeStep)
{
	BT_PROFILE("createPredictiveContacts");
	releasePredictiveContacts();
	if (m_nonStaticRigidBodies.size() > 0)
	{
		createPredictiveContactsInternal(&m_nonStaticRigidBodies[0], m_nonStaticRigidBodies.size(), timeStep);
	}
}

#### btDiscreteDynamicsWorld::releasePredictiveContacts()

``` c++
void btDiscreteDynamicsWorld::releasePredictiveContacts()
{
	BT_PROFILE("release predictive contact manifolds");

	for (int i = 0; i < m_predictiveManifolds.size(); i++)
	{
		btPersistentManifold* manifold = m_predictiveManifolds[i];
		this->m_dispatcher1->releaseManifold(manifold);
	}
	m_predictiveManifolds.clear();
}

```

#### btCollisionDispatcher::releaseManifold(btPersistentManifold* manifold)

``` c++
void btCollisionDispatcher::releaseManifold(btPersistentManifold* manifold)
{
	//printf("releaseManifold: gNumManifold %d\n",gNumManifold);
	clearManifold(manifold);

	int findIndex = manifold->m_index1a;
	btAssert(findIndex < m_manifoldsPtr.size());
	m_manifoldsPtr.swap(findIndex, m_manifoldsPtr.size() - 1);
	m_manifoldsPtr[findIndex]->m_index1a = findIndex;
	m_manifoldsPtr.pop_back();

	manifold->~btPersistentManifold();
	if (m_persistentManifoldPoolAllocator->validPtr(manifold))
	{
		m_persistentManifoldPoolAllocator->freeMemory(manifold);
	}
	else
	{
		btAlignedFree(manifold);
	}
}

```

#### btDiscreteDynamicsWorld::createPredictiveContactsInternal(btRigidBody** bodies, int numBodies, btScalar timeStep)

``` c++

void btDiscreteDynamicsWorld::createPredictiveContactsInternal(btRigidBody** bodies, int numBodies, btScalar timeStep)
{
	btTransform predictedTrans;
	for (int i = 0; i < numBodies; i++)
	{
		btRigidBody* body = bodies[i];
		body->setHitFraction(1.f);

		if (body->isActive() && (!body->isStaticOrKinematicObject()))
		{
			body->predictIntegratedTransform(timeStep, predictedTrans);

			btScalar squareMotion = (predictedTrans.getOrigin() - body->getWorldTransform().getOrigin()).length2();

            /**
             * ccd continuous collision detection
             */
			if (getDispatchInfo().m_useContinuous && body->getCcdSquareMotionThreshold() && body->getCcdSquareMotionThreshold() < squareMotion)
			{
				BT_PROFILE("predictive convexSweepTest");
				if (body->getCollisionShape()->isConvex())
				{
					gNumClampedCcdMotions++;
#ifdef PREDICTIVE_CONTACT_USE_STATIC_ONLY
					class StaticOnlyCallback : public btClosestNotMeConvexResultCallback
					{
					public:
						StaticOnlyCallback(btCollisionObject* me, const btVector3& fromA, const btVector3& toA, btOverlappingPairCache* pairCache, btDispatcher* dispatcher) : btClosestNotMeConvexResultCallback(me, fromA, toA, pairCache, dispatcher)
						{
						}

						virtual bool needsCollision(btBroadphaseProxy* proxy0) const
						{
							btCollisionObject* otherObj = (btCollisionObject*)proxy0->m_clientObject;
							if (!otherObj->isStaticOrKinematicObject())
								return false;
							return btClosestNotMeConvexResultCallback::needsCollision(proxy0);
						}
					};

					StaticOnlyCallback sweepResults(body, body->getWorldTransform().getOrigin(), predictedTrans.getOrigin(), getBroadphase()->getOverlappingPairCache(), getDispatcher());
#else
					btClosestNotMeConvexResultCallback sweepResults(body, body->getWorldTransform().getOrigin(), predictedTrans.getOrigin(), getBroadphase()->getOverlappingPairCache(), getDispatcher());
#endif
					//btConvexShape* convexShape = static_cast<btConvexShape*>(body->getCollisionShape());
					btSphereShape tmpSphere(body->getCcdSweptSphereRadius());  //btConvexShape* convexShape = static_cast<btConvexShape*>(body->getCollisionShape());
					sweepResults.m_allowedPenetration = getDispatchInfo().m_allowedCcdPenetration;
/**
 * 
 * ATTRIBUTE_ALIGNED16(struct)
btBroadphaseProxy
{
	BT_DECLARE_ALIGNED_ALLOCATOR();

	///optional filtering to cull potential collisions
	enum CollisionFilterGroups
	{
		DefaultFilter = 1,
		StaticFilter = 2,
		KinematicFilter = 4,
		DebrisFilter = 8,
		SensorTrigger = 16,
		CharacterFilter = 32,
		AllFilter = -1  //all bits sets: DefaultFilter | StaticFilter | KinematicFilter | DebrisFilter | SensorTrigger
	};

	//Usually the client btCollisionObject or Rigidbody class
	void* m_clientObject;
	int m_collisionFilterGroup;
	int m_collisionFilterMask;

	int m_uniqueId;  //m_uniqueId is introduced for paircache. could get rid of this, by calculating the address offset etc.

	btVector3 m_aabbMin;
	btVector3 m_aabbMax;

	SIMD_FORCE_INLINE int getUid() const
	{
		return m_uniqueId;
	}

	//used for memory pools
	btBroadphaseProxy() : m_clientObject(0)
	{
	}

	btBroadphaseProxy(const btVector3& aabbMin, const btVector3& aabbMax, void* userPtr, int collisionFilterGroup, int collisionFilterMask)
		: m_clientObject(userPtr),
		  m_collisionFilterGroup(collisionFilterGroup),
		  m_collisionFilterMask(collisionFilterMask),
		  m_aabbMin(aabbMin),
		  m_aabbMax(aabbMax)
	{
	}

	static SIMD_FORCE_INLINE bool isPolyhedral(int proxyType)
	{
		return (proxyType < IMPLICIT_CONVEX_SHAPES_START_HERE);
	}

	static SIMD_FORCE_INLINE bool isConvex(int proxyType)
	{
		return (proxyType < CONCAVE_SHAPES_START_HERE);
	}

	static SIMD_FORCE_INLINE bool isNonMoving(int proxyType)
	{
		return (isConcave(proxyType) && !(proxyType == GIMPACT_SHAPE_PROXYTYPE));
	}

	static SIMD_FORCE_INLINE bool isConcave(int proxyType)
	{
		return ((proxyType > CONCAVE_SHAPES_START_HERE) &&
				(proxyType < CONCAVE_SHAPES_END_HERE));
	}
	static SIMD_FORCE_INLINE bool isCompound(int proxyType)
	{
		return (proxyType == COMPOUND_SHAPE_PROXYTYPE);
	}

	static SIMD_FORCE_INLINE bool isSoftBody(int proxyType)
	{
		return (proxyType == SOFTBODY_SHAPE_PROXYTYPE);
	}

	static SIMD_FORCE_INLINE bool isInfinite(int proxyType)
	{
		return (proxyType == STATIC_PLANE_PROXYTYPE);
	}

	static SIMD_FORCE_INLINE bool isConvex2d(int proxyType)
	{
		return (proxyType == BOX_2D_SHAPE_PROXYTYPE) || (proxyType == CONVEX_2D_SHAPE_PROXYTYPE);
	}
};

 * 
 */
					sweepResults.m_collisionFilterGroup = body->getBroadphaseProxy()->m_collisionFilterGroup;
					sweepResults.m_collisionFilterMask = body->getBroadphaseProxy()->m_collisionFilterMask;
					btTransform modifiedPredictedTrans = predictedTrans;
					modifiedPredictedTrans.setBasis(body->getWorldTransform().getBasis());

					convexSweepTest(&tmpSphere, body->getWorldTransform(), modifiedPredictedTrans, sweepResults);
					if (sweepResults.hasHit() && (sweepResults.m_closestHitFraction < 1.f))
					{
						btVector3 distVec = (predictedTrans.getOrigin() - body->getWorldTransform().getOrigin()) * sweepResults.m_closestHitFraction;
						btScalar distance = distVec.dot(-sweepResults.m_hitNormalWorld);

						btMutexLock(&m_predictiveManifoldsMutex);
						btPersistentManifold* manifold = m_dispatcher1->getNewManifold(body, sweepResults.m_hitCollisionObject);
						m_predictiveManifolds.push_back(manifold);
						btMutexUnlock(&m_predictiveManifoldsMutex);

						btVector3 worldPointB = body->getWorldTransform().getOrigin() + distVec;
						btVector3 localPointB = sweepResults.m_hitCollisionObject->getWorldTransform().inverse() * worldPointB;

						btManifoldPoint newPoint(btVector3(0, 0, 0), localPointB, sweepResults.m_hitNormalWorld, distance);

						bool isPredictive = true;
						int index = manifold->addManifoldPoint(newPoint, isPredictive);
						btManifoldPoint& pt = manifold->getContactPoint(index);
						pt.m_combinedRestitution = 0;
						pt.m_combinedFriction = gCalculateCombinedFrictionCallback(body, sweepResults.m_hitCollisionObject);
						pt.m_positionWorldOnA = body->getWorldTransform().getOrigin();
						pt.m_positionWorldOnB = worldPointB;
					}
				}
			}
		}
	}
}

```
##### getCcdMotionThreshold

```c++
btScalar getCcdMotionThreshold() const
	{
		return m_ccdMotionThreshold;
	}
```

##### btCollisionWorld::convexSweepTest(const btConvexShape* castShape, const btTransform& convexFromWorld, const btTransform& convexToWorld, ConvexResultCallback& resultCallback, btScalar allowedCcdPenetration) const

``` c++

void btCollisionWorld::convexSweepTest(const btConvexShape* castShape, const btTransform& convexFromWorld, const btTransform& convexToWorld, ConvexResultCallback& resultCallback, btScalar allowedCcdPenetration) const
{
	BT_PROFILE("convexSweepTest");
	/// use the broadphase to accelerate the search for objects, based on their aabb
	/// and for each object with ray-aabb overlap, perform an exact ray test
	/// unfortunately the implementation for rayTest and convexSweepTest duplicated, albeit practically identical

	btTransform convexFromTrans, convexToTrans;
	convexFromTrans = convexFromWorld;
	convexToTrans = convexToWorld;
	btVector3 castShapeAabbMin, castShapeAabbMax;
	/* Compute AABB that encompasses angular movement */
	{
		btVector3 linVel, angVel;
		btTransformUtil::calculateVelocity(convexFromTrans, convexToTrans, 1.0f, linVel, angVel);
		btVector3 zeroLinVel;
		zeroLinVel.setValue(0, 0, 0);
		btTransform R;
		R.setIdentity();
		R.setRotation(convexFromTrans.getRotation());
		castShape->calculateTemporalAabb(R, zeroLinVel, angVel, 1.0f, castShapeAabbMin, castShapeAabbMax);
	}

#ifndef USE_BRUTEFORCE_RAYBROADPHASE

	btSingleSweepCallback convexCB(castShape, convexFromWorld, convexToWorld, this, resultCallback, allowedCcdPenetration);

	m_broadphasePairCache->rayTest(convexFromTrans.getOrigin(), convexToTrans.getOrigin(), convexCB, castShapeAabbMin, castShapeAabbMax);

#else
	/// go over all objects, and if the ray intersects their aabb + cast shape aabb,
	// do a ray-shape query using convexCaster (CCD)
	int i;
	for (i = 0; i < m_collisionObjects.size(); i++)
	{
		btCollisionObject* collisionObject = m_collisionObjects[i];
		//only perform raycast if filterMask matches
		if (resultCallback.needsCollision(collisionObject->getBroadphaseHandle()))
		{
			//RigidcollisionObject* collisionObject = ctrl->GetRigidcollisionObject();
			btVector3 collisionObjectAabbMin, collisionObjectAabbMax;
			collisionObject->getCollisionShape()->getAabb(collisionObject->getWorldTransform(), collisionObjectAabbMin, collisionObjectAabbMax);
			AabbExpand(collisionObjectAabbMin, collisionObjectAabbMax, castShapeAabbMin, castShapeAabbMax);
			btScalar hitLambda = btScalar(1.);  //could use resultCallback.m_closestHitFraction, but needs testing
			btVector3 hitNormal;
			if (btRayAabb(convexFromWorld.getOrigin(), convexToWorld.getOrigin(), collisionObjectAabbMin, collisionObjectAabbMax, hitLambda, hitNormal))
			{
				objectQuerySingle(castShape, convexFromTrans, convexToTrans,
								  collisionObject,
								  collisionObject->getCollisionShape(),
								  collisionObject->getWorldTransform(),
								  resultCallback,
								  allowedCcdPenetration);
			}
		}
	}
#endif  //USE_BRUTEFORCE_RAYBROADPHASE
}

```

###### btCollisionWorld::objectQuerySingle(const btConvexShape* castShape, const btTransform& convexFromTrans, const btTransform& convexToTrans,
										 btCollisionObject* collisionObject,
										 const btCollisionShape* collisionShape,
										 const btTransform& colObjWorldTransform,
										 ConvexResultCallback& resultCallback, btScalar allowedPenetration)

``` c++
void btCollisionWorld::objectQuerySingle(const btConvexShape* castShape, const btTransform& convexFromTrans, const btTransform& convexToTrans,
										 btCollisionObject* collisionObject,
										 const btCollisionShape* collisionShape,
										 const btTransform& colObjWorldTransform,
										 ConvexResultCallback& resultCallback, btScalar allowedPenetration)
{
	btCollisionObjectWrapper tmpOb(0, collisionShape, collisionObject, colObjWorldTransform, -1, -1);
	btCollisionWorld::objectQuerySingleInternal(castShape, convexFromTrans, convexToTrans, &tmpOb, resultCallback, allowedPenetration);
}
```
####### btCollisionWorld::objectQuerySingleInternal

``` c++

void btCollisionWorld::objectQuerySingleInternal(const btConvexShape* castShape, const btTransform& convexFromTrans, const btTransform& convexToTrans,
												 const btCollisionObjectWrapper* colObjWrap,
												 ConvexResultCallback& resultCallback, btScalar allowedPenetration)
{
	const btCollisionShape* collisionShape = colObjWrap->getCollisionShape();
	const btTransform& colObjWorldTransform = colObjWrap->getWorldTransform();

	if (collisionShape->isConvex())
	{
		//BT_PROFILE("convexSweepConvex");
		btConvexCast::CastResult castResult;
		castResult.m_allowedPenetration = allowedPenetration;
		castResult.m_fraction = resultCallback.m_closestHitFraction;  //btScalar(1.);//??

		btConvexShape* convexShape = (btConvexShape*)collisionShape;
		btVoronoiSimplexSolver simplexSolver;
		btGjkEpaPenetrationDepthSolver gjkEpaPenetrationSolver;

		btContinuousConvexCollision convexCaster1(castShape, convexShape, &simplexSolver, &gjkEpaPenetrationSolver);
		//btGjkConvexCast convexCaster2(castShape,convexShape,&simplexSolver);
		//btSubsimplexConvexCast convexCaster3(castShape,convexShape,&simplexSolver);

		btConvexCast* castPtr = &convexCaster1;

		if (castPtr->calcTimeOfImpact(convexFromTrans, convexToTrans, colObjWorldTransform, colObjWorldTransform, castResult))
		{
			//add hit
			if (castResult.m_normal.length2() > btScalar(0.0001))
			{
				if (castResult.m_fraction < resultCallback.m_closestHitFraction)
				{
					castResult.m_normal.normalize();
					btCollisionWorld::LocalConvexResult localConvexResult(
						colObjWrap->getCollisionObject(),
						0,
						castResult.m_normal,
						castResult.m_hitPoint,
						castResult.m_fraction);

					bool normalInWorldSpace = true;
					resultCallback.addSingleResult(localConvexResult, normalInWorldSpace);
				}
			}
		}
	}
	else
	{
		if (collisionShape->isConcave())
		{

			if (collisionShape->getShapeType() == TRIANGLE_MESH_SHAPE_PROXYTYPE)
			{
				//BT_PROFILE("convexSweepbtBvhTriangleMesh");
				btBvhTriangleMeshShape* triangleMesh = (btBvhTriangleMeshShape*)collisionShape;
				btTransform worldTocollisionObject = colObjWorldTransform.inverse();
				btVector3 convexFromLocal = worldTocollisionObject * convexFromTrans.getOrigin();
				btVector3 convexToLocal = worldTocollisionObject * convexToTrans.getOrigin();
				// rotation of box in local mesh space = MeshRotation^-1 * ConvexToRotation
				btTransform rotationXform = btTransform(worldTocollisionObject.getBasis() * convexToTrans.getBasis());

				//ConvexCast::CastResult
				struct BridgeTriangleConvexcastCallback : public btTriangleConvexcastCallback
				{
					btCollisionWorld::ConvexResultCallback* m_resultCallback;
					const btCollisionObject* m_collisionObject;
					btTriangleMeshShape* m_triangleMesh;

					BridgeTriangleConvexcastCallback(const btConvexShape* castShape, const btTransform& from, const btTransform& to,
													 btCollisionWorld::ConvexResultCallback* resultCallback, const btCollisionObject* collisionObject, btTriangleMeshShape* triangleMesh, const btTransform& triangleToWorld) : btTriangleConvexcastCallback(castShape, from, to, triangleToWorld, triangleMesh->getMargin()),
																																																								m_resultCallback(resultCallback),
																																																								m_collisionObject(collisionObject),
																																																								m_triangleMesh(triangleMesh)
					{
					}

					virtual btScalar reportHit(const btVector3& hitNormalLocal, const btVector3& hitPointLocal, btScalar hitFraction, int partId, int triangleIndex)
					{
						btCollisionWorld::LocalShapeInfo shapeInfo;
						shapeInfo.m_shapePart = partId;
						shapeInfo.m_triangleIndex = triangleIndex;
						if (hitFraction <= m_resultCallback->m_closestHitFraction)
						{
							btCollisionWorld::LocalConvexResult convexResult(m_collisionObject,
																			 &shapeInfo,
																			 hitNormalLocal,
																			 hitPointLocal,
																			 hitFraction);

							bool normalInWorldSpace = true;

							return m_resultCallback->addSingleResult(convexResult, normalInWorldSpace);
						}
						return hitFraction;
					}
				};

				BridgeTriangleConvexcastCallback tccb(castShape, convexFromTrans, convexToTrans, &resultCallback, colObjWrap->getCollisionObject(), triangleMesh, colObjWorldTransform);
				tccb.m_hitFraction = resultCallback.m_closestHitFraction;
				tccb.m_allowedPenetration = allowedPenetration;
				btVector3 boxMinLocal, boxMaxLocal;
				castShape->getAabb(rotationXform, boxMinLocal, boxMaxLocal);
				triangleMesh->performConvexcast(&tccb, convexFromLocal, convexToLocal, boxMinLocal, boxMaxLocal);
			}
			else
			{
				if (collisionShape->getShapeType() == STATIC_PLANE_PROXYTYPE)
				{
					btConvexCast::CastResult castResult;
					castResult.m_allowedPenetration = allowedPenetration;
					castResult.m_fraction = resultCallback.m_closestHitFraction;
					btStaticPlaneShape* planeShape = (btStaticPlaneShape*)collisionShape;
					btContinuousConvexCollision convexCaster1(castShape, planeShape);
					btConvexCast* castPtr = &convexCaster1;

					if (castPtr->calcTimeOfImpact(convexFromTrans, convexToTrans, colObjWorldTransform, colObjWorldTransform, castResult))
					{
						//add hit
						if (castResult.m_normal.length2() > btScalar(0.0001))
						{
							if (castResult.m_fraction < resultCallback.m_closestHitFraction)
							{
								castResult.m_normal.normalize();
								btCollisionWorld::LocalConvexResult localConvexResult(
									colObjWrap->getCollisionObject(),
									0,
									castResult.m_normal,
									castResult.m_hitPoint,
									castResult.m_fraction);

								bool normalInWorldSpace = true;
								resultCallback.addSingleResult(localConvexResult, normalInWorldSpace);
							}
						}
					}
				}
				else
				{
					//BT_PROFILE("convexSweepConcave");
					btConcaveShape* concaveShape = (btConcaveShape*)collisionShape;
					btTransform worldTocollisionObject = colObjWorldTransform.inverse();
					btVector3 convexFromLocal = worldTocollisionObject * convexFromTrans.getOrigin();
					btVector3 convexToLocal = worldTocollisionObject * convexToTrans.getOrigin();
					// rotation of box in local mesh space = MeshRotation^-1 * ConvexToRotation
					btTransform rotationXform = btTransform(worldTocollisionObject.getBasis() * convexToTrans.getBasis());

					//ConvexCast::CastResult
					struct BridgeTriangleConvexcastCallback : public btTriangleConvexcastCallback
					{
						btCollisionWorld::ConvexResultCallback* m_resultCallback;
						const btCollisionObject* m_collisionObject;
						btConcaveShape* m_triangleMesh;

						BridgeTriangleConvexcastCallback(const btConvexShape* castShape, const btTransform& from, const btTransform& to,
														 btCollisionWorld::ConvexResultCallback* resultCallback, const btCollisionObject* collisionObject, btConcaveShape* triangleMesh, const btTransform& triangleToWorld) : btTriangleConvexcastCallback(castShape, from, to, triangleToWorld, triangleMesh->getMargin()),
																																																							   m_resultCallback(resultCallback),
																																																							   m_collisionObject(collisionObject),
																																																							   m_triangleMesh(triangleMesh)
						{
						}

						virtual btScalar reportHit(const btVector3& hitNormalLocal, const btVector3& hitPointLocal, btScalar hitFraction, int partId, int triangleIndex)
						{
							btCollisionWorld::LocalShapeInfo shapeInfo;
							shapeInfo.m_shapePart = partId;
							shapeInfo.m_triangleIndex = triangleIndex;
							if (hitFraction <= m_resultCallback->m_closestHitFraction)
							{
								btCollisionWorld::LocalConvexResult convexResult(m_collisionObject,
																				 &shapeInfo,
																				 hitNormalLocal,
																				 hitPointLocal,
																				 hitFraction);

								bool normalInWorldSpace = true;

								return m_resultCallback->addSingleResult(convexResult, normalInWorldSpace);
							}
							return hitFraction;
						}
					};

					BridgeTriangleConvexcastCallback tccb(castShape, convexFromTrans, convexToTrans, &resultCallback, colObjWrap->getCollisionObject(), concaveShape, colObjWorldTransform);
					tccb.m_hitFraction = resultCallback.m_closestHitFraction;
					tccb.m_allowedPenetration = allowedPenetration;
					btVector3 boxMinLocal, boxMaxLocal;
					castShape->getAabb(rotationXform, boxMinLocal, boxMaxLocal);

					btVector3 rayAabbMinLocal = convexFromLocal;
					rayAabbMinLocal.setMin(convexToLocal);
					btVector3 rayAabbMaxLocal = convexFromLocal;
					rayAabbMaxLocal.setMax(convexToLocal);
					rayAabbMinLocal += boxMinLocal;
					rayAabbMaxLocal += boxMaxLocal;
					concaveShape->processAllTriangles(&tccb, rayAabbMinLocal, rayAabbMaxLocal);
				}
			}
		}
		else
		{
			if (collisionShape->isCompound())
			{
				struct btCompoundLeafCallback : btDbvt::ICollide
				{
					btCompoundLeafCallback(
						const btCollisionObjectWrapper* colObjWrap,
						const btConvexShape* castShape,
						const btTransform& convexFromTrans,
						const btTransform& convexToTrans,
						btScalar allowedPenetration,
						const btCompoundShape* compoundShape,
						const btTransform& colObjWorldTransform,
						ConvexResultCallback& resultCallback)
						: m_colObjWrap(colObjWrap),
						  m_castShape(castShape),
						  m_convexFromTrans(convexFromTrans),
						  m_convexToTrans(convexToTrans),
						  m_allowedPenetration(allowedPenetration),
						  m_compoundShape(compoundShape),
						  m_colObjWorldTransform(colObjWorldTransform),
						  m_resultCallback(resultCallback)
					{
					}

					const btCollisionObjectWrapper* m_colObjWrap;
					const btConvexShape* m_castShape;
					const btTransform& m_convexFromTrans;
					const btTransform& m_convexToTrans;
					btScalar m_allowedPenetration;
					const btCompoundShape* m_compoundShape;
					const btTransform& m_colObjWorldTransform;
					ConvexResultCallback& m_resultCallback;

				public:
					void ProcessChild(int index, const btTransform& childTrans, const btCollisionShape* childCollisionShape)
					{
						btTransform childWorldTrans = m_colObjWorldTransform * childTrans;

						struct LocalInfoAdder : public ConvexResultCallback
						{
							ConvexResultCallback* m_userCallback;
							int m_i;

							LocalInfoAdder(int i, ConvexResultCallback* user)
								: m_userCallback(user), m_i(i)
							{
								m_closestHitFraction = m_userCallback->m_closestHitFraction;
							}
							virtual bool needsCollision(btBroadphaseProxy* p) const
							{
								return m_userCallback->needsCollision(p);
							}
							virtual btScalar addSingleResult(btCollisionWorld::LocalConvexResult& r, bool b)
							{
								btCollisionWorld::LocalShapeInfo shapeInfo;
								shapeInfo.m_shapePart = -1;
								shapeInfo.m_triangleIndex = m_i;
								if (r.m_localShapeInfo == NULL)
									r.m_localShapeInfo = &shapeInfo;
								const btScalar result = m_userCallback->addSingleResult(r, b);
								m_closestHitFraction = m_userCallback->m_closestHitFraction;
								return result;
							}
						};

						LocalInfoAdder my_cb(index, &m_resultCallback);

						btCollisionObjectWrapper tmpObj(m_colObjWrap, childCollisionShape, m_colObjWrap->getCollisionObject(), childWorldTrans, -1, index);

						objectQuerySingleInternal(m_castShape, m_convexFromTrans, m_convexToTrans, &tmpObj, my_cb, m_allowedPenetration);
					}

					void Process(const btDbvtNode* leaf)
					{
						// Processing leaf node
						int index = leaf->dataAsInt;

						btTransform childTrans = m_compoundShape->getChildTransform(index);
						const btCollisionShape* childCollisionShape = m_compoundShape->getChildShape(index);

						ProcessChild(index, childTrans, childCollisionShape);
					}
				};

				BT_PROFILE("convexSweepCompound");
				const btCompoundShape* compoundShape = static_cast<const btCompoundShape*>(collisionShape);

				btVector3 fromLocalAabbMin, fromLocalAabbMax;
				btVector3 toLocalAabbMin, toLocalAabbMax;

				castShape->getAabb(colObjWorldTransform.inverse() * convexFromTrans, fromLocalAabbMin, fromLocalAabbMax);
				castShape->getAabb(colObjWorldTransform.inverse() * convexToTrans, toLocalAabbMin, toLocalAabbMax);

				fromLocalAabbMin.setMin(toLocalAabbMin);
				fromLocalAabbMax.setMax(toLocalAabbMax);

				btCompoundLeafCallback callback(colObjWrap, castShape, convexFromTrans, convexToTrans,
												allowedPenetration, compoundShape, colObjWorldTransform, resultCallback);

				const btDbvt* tree = compoundShape->getDynamicAabbTree();
				if (tree)
				{
					const ATTRIBUTE_ALIGNED16(btDbvtVolume) bounds = btDbvtVolume::FromMM(fromLocalAabbMin, fromLocalAabbMax);
					tree->collideTV(tree->m_root, bounds, callback);
				}
				else
				{
					int i;
					for (i = 0; i < compoundShape->getNumChildShapes(); i++)
					{
						const btCollisionShape* childCollisionShape = compoundShape->getChildShape(i);
						btTransform childTrans = compoundShape->getChildTransform(i);
						callback.ProcessChild(i, childTrans, childCollisionShape);
					}
				}
			}
		}
	}
}
void btTriangleConvexcastCallback::processTriangle(btVector3* triangle, int partId, int triangleIndex)
			{
				btTriangleShape triangleShape(triangle[0], triangle[1], triangle[2]);
				triangleShape.setMargin(m_triangleCollisionMargin);

				btVoronoiSimplexSolver simplexSolver;
				btGjkEpaPenetrationDepthSolver gjkEpaPenetrationSolver;

			//#define  USE_SUBSIMPLEX_CONVEX_CAST 1
			//if you reenable USE_SUBSIMPLEX_CONVEX_CAST see commented out code below
			#ifdef USE_SUBSIMPLEX_CONVEX_CAST
				btSubsimplexConvexCast convexCaster(m_convexShape, &triangleShape, &simplexSolver);
			#else
				//btGjkConvexCast	convexCaster(m_convexShape,&triangleShape,&simplexSolver);
				btContinuousConvexCollision convexCaster(m_convexShape, &triangleShape, &simplexSolver, &gjkEpaPenetrationSolver);
			#endif  //#USE_SUBSIMPLEX_CONVEX_CAST

				btConvexCast::CastResult castResult;
				castResult.m_fraction = btScalar(1.);
				castResult.m_allowedPenetration = m_allowedPenetration;
				if (convexCaster.calcTimeOfImpact(m_convexShapeFrom, m_convexShapeTo, m_triangleToWorld, m_triangleToWorld, castResult))
				{
					//add hit
					if (castResult.m_normal.length2() > btScalar(0.0001))
					{
						if (castResult.m_fraction < m_hitFraction)
						{
							/* btContinuousConvexCast's normal is already in world space */
							/*
			#ifdef USE_SUBSIMPLEX_CONVEX_CAST
							//rotate normal into worldspace
							castResult.m_normal = m_convexShapeFrom.getBasis() * castResult.m_normal;
			#endif //USE_SUBSIMPLEX_CONVEX_CAST
			*/
							castResult.m_normal.normalize();

							reportHit(castResult.m_normal,
									castResult.m_hitPoint,
									castResult.m_fraction,
									partId,
									triangleIndex);
						}
					}
				}
			}
```

######## bool btContinuousConvexCollision::calcTimeOfImpact(
	const btTransform& fromA,
	const btTransform& toA,
	const btTransform& fromB,
	const btTransform& toB,
	CastResult& result)

``` c++

static void calculateVelocity(const b3Transform& transform0, const b3Transform& transform1, b3Scalar timeStep, b3Vector3& linVel, b3Vector3& angVel)
	{
		linVel = (transform1.getOrigin() - transform0.getOrigin()) / timeStep;
		b3Vector3 axis;
		b3Scalar angle;
		calculateDiffAxisAngle(transform0, transform1, axis, angle);
		angVel = axis * angle / timeStep;
	}

static void calculateDiffAxisAngle(const b3Transform& transform0, const b3Transform& transform1, b3Vector3& axis, b3Scalar& angle)
	{
		b3Matrix3x3 dmat = transform1.getBasis() * transform0.getBasis().inverse();
		b3Quaternion dorn;
		dmat.getRotation(dorn);

		///floating point inaccuracy can lead to w component > 1..., which breaks
		dorn.normalize();

		angle = dorn.getAngle();
		axis = b3MakeVector3(dorn.getX(), dorn.getY(), dorn.getZ());
		axis[3] = b3Scalar(0.);
		//check for axis length
		b3Scalar len = axis.length2();
		if (len < B3_EPSILON * B3_EPSILON)
			axis = b3MakeVector3(b3Scalar(1.), b3Scalar(0.), b3Scalar(0.));
		else
			axis /= b3Sqrt(len);
	}

btScalar btCollisionShape::getAngularMotionDisc() const
{
	///@todo cache this value, to improve performance
	btVector3 center;
	btScalar disc;
	getBoundingSphere(center, disc);
	disc += (center).length();
	return disc;
}


void btContinuousConvexCollision::computeClosestPoints(const btTransform& transA, const btTransform& transB, btPointCollector& pointCollector)
{
	if (m_convexB1)
	{
		m_simplexSolver->reset();
		btGjkPairDetector gjk(m_convexA, m_convexB1, m_convexA->getShapeType(), m_convexB1->getShapeType(), m_convexA->getMargin(), m_convexB1->getMargin(), m_simplexSolver, m_penetrationDepthSolver);
		btGjkPairDetector::ClosestPointInput input;
		input.m_transformA = transA;
		input.m_transformB = transB;
		gjk.getClosestPoints(input, pointCollector, 0);
	}
	else
	{
		//convex versus plane
		const btConvexShape* convexShape = m_convexA;
		const btStaticPlaneShape* planeShape = m_planeShape;

		const btVector3& planeNormal = planeShape->getPlaneNormal();
		const btScalar& planeConstant = planeShape->getPlaneConstant();

		btTransform convexWorldTransform = transA;
		btTransform convexInPlaneTrans;
		convexInPlaneTrans = transB.inverse() * convexWorldTransform;
		btTransform planeInConvex;
		planeInConvex = convexWorldTransform.inverse() * transB;

		btVector3 vtx = convexShape->localGetSupportingVertex(planeInConvex.getBasis() * -planeNormal);

		btVector3 vtxInPlane = convexInPlaneTrans(vtx);
		btScalar distance = (planeNormal.dot(vtxInPlane) - planeConstant);

		btVector3 vtxInPlaneProjected = vtxInPlane - distance * planeNormal;
		btVector3 vtxInPlaneWorld = transB * vtxInPlaneProjected;
		btVector3 normalOnSurfaceB = transB.getBasis() * planeNormal;

		pointCollector.addContactPoint(
			normalOnSurfaceB,
			vtxInPlaneWorld,
			distance);
	}
}


bool btContinuousConvexCollision::calcTimeOfImpact(
	const btTransform& fromA,
	const btTransform& toA,
	const btTransform& fromB,
	const btTransform& toB,
	CastResult& result)
{
	/// compute linear and angular velocity for this interval, to interpolate
	btVector3 linVelA, angVelA, linVelB, angVelB;
	btTransformUtil::calculateVelocity(fromA, toA, btScalar(1.), linVelA, angVelA);
	btTransformUtil::calculateVelocity(fromB, toB, btScalar(1.), linVelB, angVelB);

	btScalar boundingRadiusA = m_convexA->getAngularMotionDisc();
	btScalar boundingRadiusB = m_convexB1 ? m_convexB1->getAngularMotionDisc() : 0.f;

	btScalar maxAngularProjectedVelocity = angVelA.length() * boundingRadiusA + angVelB.length() * boundingRadiusB;
	btVector3 relLinVel = (linVelB - linVelA);

	btScalar relLinVelocLength = (linVelB - linVelA).length();

	if ((relLinVelocLength + maxAngularProjectedVelocity) == 0.f)
		return false;

	btScalar lambda = btScalar(0.);

	btVector3 n;
	n.setValue(btScalar(0.), btScalar(0.), btScalar(0.));
	bool hasResult = false;
	btVector3 c;

	btScalar lastLambda = lambda;
	//btScalar epsilon = btScalar(0.001);

	int numIter = 0;
	//first solution, using GJK

	btScalar radius = 0.001f;
	//	result.drawCoordSystem(sphereTr);

	btPointCollector pointCollector1;

	{
		computeClosestPoints(fromA, fromB, pointCollector1);

		hasResult = pointCollector1.m_hasResult;
		c = pointCollector1.m_pointInWorld;
	}

	if (hasResult)
	{
		btScalar dist;
		dist = pointCollector1.m_distance + result.m_allowedPenetration;
		n = pointCollector1.m_normalOnBInWorld;
		btScalar projectedLinearVelocity = relLinVel.dot(n);
		if ((projectedLinearVelocity + maxAngularProjectedVelocity) <= SIMD_EPSILON)
			return false;

		//not close enough
		while (dist > radius)
		{
			if (result.m_debugDrawer)
			{
				result.m_debugDrawer->drawSphere(c, 0.2f, btVector3(1, 1, 1));
			}
			btScalar dLambda = btScalar(0.);

			projectedLinearVelocity = relLinVel.dot(n);

			//don't report time of impact for motion away from the contact normal (or causes minor penetration)
			if ((projectedLinearVelocity + maxAngularProjectedVelocity) <= SIMD_EPSILON)
				return false;

			dLambda = dist / (projectedLinearVelocity + maxAngularProjectedVelocity);

			lambda += dLambda;

			if (lambda > btScalar(1.) || lambda < btScalar(0.))
				return false;

			//todo: next check with relative epsilon
			if (lambda <= lastLambda)
			{
				return false;
				//n.setValue(0,0,0);
				//break;
			}
			lastLambda = lambda;

			//interpolate to next lambda
			btTransform interpolatedTransA, interpolatedTransB, relativeTrans;

			btTransformUtil::integrateTransform(fromA, linVelA, angVelA, lambda, interpolatedTransA);
			btTransformUtil::integrateTransform(fromB, linVelB, angVelB, lambda, interpolatedTransB);
			relativeTrans = interpolatedTransB.inverseTimes(interpolatedTransA);

			if (result.m_debugDrawer)
			{
				result.m_debugDrawer->drawSphere(interpolatedTransA.getOrigin(), 0.2f, btVector3(1, 0, 0));
			}

			result.DebugDraw(lambda);

			btPointCollector pointCollector;
			computeClosestPoints(interpolatedTransA, interpolatedTransB, pointCollector);

			if (pointCollector.m_hasResult)
			{
				dist = pointCollector.m_distance + result.m_allowedPenetration;
				c = pointCollector.m_pointInWorld;
				n = pointCollector.m_normalOnBInWorld;
			}
			else
			{
				result.reportFailure(-1, numIter);
				return false;
			}

			numIter++;
			if (numIter > MAX_ITERATIONS)
			{
				result.reportFailure(-2, numIter);
				return false;
			}
		}

		result.m_fraction = lambda;
		result.m_normal = n;
		result.m_hitPoint = c;
		return true;
	}

	return false;
}

```


### btCollisionWorld::performDiscreteCollisionDetection()

``` c++
void btCollisionWorld::performDiscreteCollisionDetection()
{
	BT_PROFILE("performDiscreteCollisionDetection");

	btDispatcherInfo& dispatchInfo = getDispatchInfo();

	updateAabbs();

	computeOverlappingPairs();

	btDispatcher* dispatcher = getDispatcher();
	{
		BT_PROFILE("dispatchAllCollisionPairs");
		if (dispatcher)
			dispatcher->dispatchAllCollisionPairs(m_broadphasePairCache->getOverlappingPairCache(), dispatchInfo, m_dispatcher1);
	}
}


```

#### updateAabbs()

``` c++
void btCollisionWorld::updateAabbs()
{
	BT_PROFILE("updateAabbs");

	for (int i = 0; i < m_collisionObjects.size(); i++)
	{
		btCollisionObject* colObj = m_collisionObjects[i];
		btAssert(colObj->getWorldArrayIndex() == i);

		//only update aabb of active objects
		if (m_forceUpdateAllAabbs || colObj->isActive())
		{
			updateSingleAabb(colObj);
		}
	}
}


void btCollisionWorld::updateSingleAabb(btCollisionObject* colObj)
{
	btVector3 minAabb, maxAabb;
	colObj->getCollisionShape()->getAabb(colObj->getWorldTransform(), minAabb, maxAabb);
	//need to increase the aabb for contact thresholds
	btVector3 contactThreshold(gContactBreakingThreshold, gContactBreakingThreshold, gContactBreakingThreshold);
	minAabb -= contactThreshold;
	maxAabb += contactThreshold;

	if (getDispatchInfo().m_useContinuous && colObj->getInternalType() == btCollisionObject::CO_RIGID_BODY && !colObj->isStaticOrKinematicObject())
	{
		btVector3 minAabb2, maxAabb2;
		colObj->getCollisionShape()->getAabb(colObj->getInterpolationWorldTransform(), minAabb2, maxAabb2);
		minAabb2 -= contactThreshold;
		maxAabb2 += contactThreshold;
		minAabb.setMin(minAabb2);
		maxAabb.setMax(maxAabb2);
	}

	btBroadphaseInterface* bp = (btBroadphaseInterface*)m_broadphasePairCache;

	//moving objects should be moderately sized, probably something wrong if not
	if (colObj->isStaticObject() || ((maxAabb - minAabb).length2() < btScalar(1e12)))
	{
		bp->setAabb(colObj->getBroadphaseHandle(), minAabb, maxAabb, m_dispatcher1);
	}
	else
	{
		//something went wrong, investigate
		//this assert is unwanted in 3D modelers (danger of loosing work)
		colObj->setActivationState(DISABLE_SIMULATION);

		static bool reportMe = true;
		if (reportMe && m_debugDrawer)
		{
			reportMe = false;
			m_debugDrawer->reportErrorWarning("Overflow in AABB, object removed from simulation");
			m_debugDrawer->reportErrorWarning("If you can reproduce this, please email bugs@continuousphysics.com\n");
			m_debugDrawer->reportErrorWarning("Please include above information, your Platform, version of OS.\n");
			m_debugDrawer->reportErrorWarning("Thanks.\n");
		}
	}
}

```

#### btCollisionWorld::computeOverlappingPairs()
``` c++
void btCollisionWorld::computeOverlappingPairs()
{
	BT_PROFILE("calculateOverlappingPairs");
    /**
     * btBroadphaseInterface* bp = (btBroadphaseInterface*)m_broadphasePairCache;
     */
	m_broadphasePairCache->calculateOverlappingPairs(m_dispatcher1);
}

```

#### btDbvtBroadphase::calculateOverlappingPairs

``` c++

void btDbvtBroadphase::calculateOverlappingPairs(btDispatcher* dispatcher)
{
	collide(dispatcher);
#if DBVT_BP_PROFILE
	if (0 == (m_pid % DBVT_BP_PROFILING_RATE))
	{
		printf("fixed(%u) dynamics(%u) pairs(%u)\r\n", m_sets[1].m_leaves, m_sets[0].m_leaves, m_paircache->getNumOverlappingPairs());
		unsigned int total = m_profiling.m_total;
		if (total <= 0) total = 1;
		printf("ddcollide: %u%% (%uus)\r\n", (50 + m_profiling.m_ddcollide * 100) / total, m_profiling.m_ddcollide / DBVT_BP_PROFILING_RATE);
		printf("fdcollide: %u%% (%uus)\r\n", (50 + m_profiling.m_fdcollide * 100) / total, m_profiling.m_fdcollide / DBVT_BP_PROFILING_RATE);
		printf("cleanup:   %u%% (%uus)\r\n", (50 + m_profiling.m_cleanup * 100) / total, m_profiling.m_cleanup / DBVT_BP_PROFILING_RATE);
		printf("total:     %uus\r\n", total / DBVT_BP_PROFILING_RATE);
		const unsigned long sum = m_profiling.m_ddcollide +
								  m_profiling.m_fdcollide +
								  m_profiling.m_cleanup;
		printf("leaked: %u%% (%uus)\r\n", 100 - ((50 + sum * 100) / total), (total - sum) / DBVT_BP_PROFILING_RATE);
		printf("job counts: %u%%\r\n", (m_profiling.m_jobcount * 100) / ((m_sets[0].m_leaves + m_sets[1].m_leaves) * DBVT_BP_PROFILING_RATE));
		clear(m_profiling);
		m_clock.reset();
	}
#endif

	performDeferredRemoval(dispatcher);
}
```

##### btDbvtBroadphase::collide(btDispatcher* dispatcher)

``` c++

void btDbvtBroadphase::collide(btDispatcher* dispatcher)
{
	/*printf("---------------------------------------------------------\n");
	printf("m_sets[0].m_leaves=%d\n",m_sets[0].m_leaves);
	printf("m_sets[1].m_leaves=%d\n",m_sets[1].m_leaves);
	printf("numPairs = %d\n",getOverlappingPairCache()->getNumOverlappingPairs());
	{
		int i;
		for (i=0;i<getOverlappingPairCache()->getNumOverlappingPairs();i++)
		{
			printf("pair[%d]=(%d,%d),",i,getOverlappingPairCache()->getOverlappingPairArray()[i].m_pProxy0->getUid(),
				getOverlappingPairCache()->getOverlappingPairArray()[i].m_pProxy1->getUid());
		}
		printf("\n");
	}
*/

	SPC(m_profiling.m_total);
	/* optimize				*/
	m_sets[0].optimizeIncremental(1 + (m_sets[0].m_leaves * m_dupdates) / 100);
	if (m_fixedleft)
	{
		const int count = 1 + (m_sets[1].m_leaves * m_fupdates) / 100;
		m_sets[1].optimizeIncremental(1 + (m_sets[1].m_leaves * m_fupdates) / 100);
		m_fixedleft = btMax<int>(0, m_fixedleft - count);
	}
	/* dynamic -> fixed set	*/
	m_stageCurrent = (m_stageCurrent + 1) % STAGECOUNT;
	btDbvtProxy* current = m_stageRoots[m_stageCurrent];
	if (current)
	{
#if DBVT_BP_ACCURATESLEEPING
		btDbvtTreeCollider collider(this);
#endif
		do
		{
			btDbvtProxy* next = current->links[1];
			listremove(current, m_stageRoots[current->stage]);
			listappend(current, m_stageRoots[STAGECOUNT]);
#if DBVT_BP_ACCURATESLEEPING
			m_paircache->removeOverlappingPairsContainingProxy(current, dispatcher);
			collider.proxy = current;
			btDbvt::collideTV(m_sets[0].m_root, current->aabb, collider);
			btDbvt::collideTV(m_sets[1].m_root, current->aabb, collider);
#endif
			m_sets[0].remove(current->leaf);
			ATTRIBUTE_ALIGNED16(btDbvtVolume)
			curAabb = btDbvtVolume::FromMM(current->m_aabbMin, current->m_aabbMax);
			current->leaf = m_sets[1].insert(curAabb, current);
			current->stage = STAGECOUNT;
			current = next;
		} while (current);
		m_fixedleft = m_sets[1].m_leaves;
		m_needcleanup = true;
	}
	/* collide dynamics		*/
	{
		btDbvtTreeCollider collider(this);
		if (m_deferedcollide)
		{
			SPC(m_profiling.m_fdcollide);
			m_sets[0].collideTTpersistentStack(m_sets[0].m_root, m_sets[1].m_root, collider);
		}
		if (m_deferedcollide)
		{
			SPC(m_profiling.m_ddcollide);
			m_sets[0].collideTTpersistentStack(m_sets[0].m_root, m_sets[0].m_root, collider);
		}
	}
	/* clean up				*/
	if (m_needcleanup)
	{
		SPC(m_profiling.m_cleanup);
		btBroadphasePairArray& pairs = m_paircache->getOverlappingPairArray();
		if (pairs.size() > 0)
		{
			int ni = btMin(pairs.size(), btMax<int>(m_newpairs, (pairs.size() * m_cupdates) / 100));
			for (int i = 0; i < ni; ++i)
			{
				btBroadphasePair& p = pairs[(m_cid + i) % pairs.size()];
				btDbvtProxy* pa = (btDbvtProxy*)p.m_pProxy0;
				btDbvtProxy* pb = (btDbvtProxy*)p.m_pProxy1;
				if (!Intersect(pa->leaf->volume, pb->leaf->volume))
				{
#if DBVT_BP_SORTPAIRS
					if (pa->m_uniqueId > pb->m_uniqueId)
						btSwap(pa, pb);
#endif
					m_paircache->removeOverlappingPair(pa, pb, dispatcher);
					--ni;
					--i;
				}
			}
			if (pairs.size() > 0)
				m_cid = (m_cid + ni) % pairs.size();
			else
				m_cid = 0;
		}
	}
	++m_pid;
	m_newpairs = 1;
	m_needcleanup = false;
	if (m_updates_call > 0)
	{
		m_updates_ratio = m_updates_done / (btScalar)m_updates_call;
	}
	else
	{
		m_updates_ratio = 0;
	}
	m_updates_done /= 2;
	m_updates_call /= 2;
}

```
#### btCollisionDispatcher::dispatchAllCollisionPairs
``` c++
void btCollisionDispatcher::dispatchAllCollisionPairs(btOverlappingPairCache* pairCache, const btDispatcherInfo& dispatchInfo, btDispatcher* dispatcher)
{
	//m_blockedForChanges = true;

	btCollisionPairCallback collisionCallback(dispatchInfo, this);

	{
		BT_PROFILE("processAllOverlappingPairs");
		pairCache->processAllOverlappingPairs(&collisionCallback, dispatcher, dispatchInfo);
	}

	//m_blockedForChanges = false;
}

```
##### b3HashedOverlappingPairCache::processAllOverlappingPairs(b3OverlapCallback* callback, b3Dispatcher* dispatcher)

``` c++


void b3HashedOverlappingPairCache::processAllOverlappingPairs(b3OverlapCallback* callback, b3Dispatcher* dispatcher)
{
	int i;

	//	printf("m_overlappingPairArray.size()=%d\n",m_overlappingPairArray.size());
	for (i = 0; i < m_overlappingPairArray.size();)
	{
		b3BroadphasePair* pair = &m_overlappingPairArray[i];
		if (callback->processOverlap(*pair))
		{
			removeOverlappingPair(pair->x, pair->y, dispatcher);

			b3g_overlappingPairs--;
		}
		else
		{
			i++;
		}
	}
}

```

###### processOverlap


``` c++
virtual bool processOverlap(btBroadphasePair& pair)
	{
		(*m_dispatcher->getNearCallback())(pair, *m_dispatcher, m_dispatchInfo);
		return false;
	}
void btCollisionDispatcher::defaultNearCallback(btBroadphasePair& collisionPair, btCollisionDispatcher& dispatcher, const btDispatcherInfo& dispatchInfo)
{
	btCollisionObject* colObj0 = (btCollisionObject*)collisionPair.m_pProxy0->m_clientObject;
	btCollisionObject* colObj1 = (btCollisionObject*)collisionPair.m_pProxy1->m_clientObject;

	if (dispatcher.needsCollision(colObj0, colObj1))
	{
		btCollisionObjectWrapper obj0Wrap(0, colObj0->getCollisionShape(), colObj0, colObj0->getWorldTransform(), -1, -1);
		btCollisionObjectWrapper obj1Wrap(0, colObj1->getCollisionShape(), colObj1, colObj1->getWorldTransform(), -1, -1);

		//dispatcher will keep algorithms persistent in the collision pair
		if (!collisionPair.m_algorithm)
		{
			collisionPair.m_algorithm = dispatcher.findAlgorithm(&obj0Wrap, &obj1Wrap, 0, BT_CONTACT_POINT_ALGORITHMS);
		}

		if (collisionPair.m_algorithm)
		{
			btManifoldResult contactPointResult(&obj0Wrap, &obj1Wrap);

			if (dispatchInfo.m_dispatchFunc == btDispatcherInfo::DISPATCH_DISCRETE)
			{
				//discrete collision detection query

				collisionPair.m_algorithm->processCollision(&obj0Wrap, &obj1Wrap, dispatchInfo, &contactPointResult);
			}
			else
			{
				//continuous collision detection query, time of impact (toi)
				btScalar toi = collisionPair.m_algorithm->calculateTimeOfImpact(colObj0, colObj1, dispatchInfo, &contactPointResult);
				if (dispatchInfo.m_timeOfImpact > toi)
					dispatchInfo.m_timeOfImpact = toi;
			}
		}
	}
}
```

### btDiscreteDynamicsWorld::calculateSimulationIslands()

``` c++
void btDiscreteDynamicsWorld::calculateSimulationIslands()
{
	BT_PROFILE("calculateSimulationIslands");
	void btSimulationIslandManager::updateActivationState(btCollisionWorld* colWorld, btDispatcher* dispatcher)
	{
		// put the index into m_controllers into m_tag
		int index = 0;
		{
			int i;
			for (i = 0; i < colWorld->getCollisionObjectArray().size(); i++)
			{
				btCollisionObject* collisionObject = colWorld->getCollisionObjectArray()[i];
				//Adding filtering here
				if (!collisionObject->isStaticOrKinematicObject())
				{
					collisionObject->setIslandTag(index++);
				}
				collisionObject->setCompanionId(-1);
				collisionObject->setHitFraction(btScalar(1.));
			}
		}
		// do the union find

		initUnionFind(index);

		findUnions(dispatcher, colWorld);
	}
	void btSimulationIslandManager::findUnions(btDispatcher* /* dispatcher */, btCollisionWorld* colWorld)
	{
		{
			btOverlappingPairCache* pairCachePtr = colWorld->getPairCache();
			const int numOverlappingPairs = pairCachePtr->getNumOverlappingPairs();
			if (numOverlappingPairs)
			{
				btBroadphasePair* pairPtr = pairCachePtr->getOverlappingPairArrayPtr();

				for (int i = 0; i < numOverlappingPairs; i++)
				{
					const btBroadphasePair& collisionPair = pairPtr[i];
					btCollisionObject* colObj0 = (btCollisionObject*)collisionPair.m_pProxy0->m_clientObject;
					btCollisionObject* colObj1 = (btCollisionObject*)collisionPair.m_pProxy1->m_clientObject;

				/**
				 * 
				 * 	SIMD_FORCE_INLINE bool mergesSimulationIslands() const
					{
						///static objects, kinematic and object without contact response don't merge islands
						return ((m_collisionFlags & (CF_STATIC_OBJECT | CF_KINEMATIC_OBJECT | CF_NO_CONTACT_RESPONSE)) == 0);
					}
				* 
				*/
					if (((colObj0) && ((colObj0)->mergesSimulationIslands())) &&
						((colObj1) && ((colObj1)->mergesSimulationIslands())))
					{
						m_unionFind.unite((colObj0)->getIslandTag(),
										(colObj1)->getIslandTag());
					}
				}
			}
		}
	}
	getSimulationIslandManager()->updateActivationState(getCollisionWorld(), getCollisionWorld()->getDispatcher());

	{
		//merge islands based on speculative contact manifolds too
		for (int i = 0; i < this->m_predictiveManifolds.size(); i++)
		{
			btPersistentManifold* manifold = m_predictiveManifolds[i];

			const btCollisionObject* colObj0 = manifold->getBody0();
			const btCollisionObject* colObj1 = manifold->getBody1();

			if (((colObj0) && (!(colObj0)->isStaticOrKinematicObject())) &&
				((colObj1) && (!(colObj1)->isStaticOrKinematicObject())))
			{
				getSimulationIslandManager()->getUnionFind().unite((colObj0)->getIslandTag(), (colObj1)->getIslandTag());
			}
		}
	}

	{
		int i;
		int numConstraints = int(m_constraints.size());
		for (i = 0; i < numConstraints; i++)
		{
			btTypedConstraint* constraint = m_constraints[i];
			if (constraint->isEnabled())
			{
				const btRigidBody* colObj0 = &constraint->getRigidBodyA();
				const btRigidBody* colObj1 = &constraint->getRigidBodyB();

				if (((colObj0) && (!(colObj0)->isStaticOrKinematicObject())) &&
					((colObj1) && (!(colObj1)->isStaticOrKinematicObject())))
				{
					getSimulationIslandManager()->getUnionFind().unite((colObj0)->getIslandTag(), (colObj1)->getIslandTag());
				}
			}
		}
	}

	//Store the island id in each body
	getSimulationIslandManager()->storeIslandActivationState(getCollisionWorld());
}


```

### btDiscreteDynamicsWorld::solveConstraints(btContactSolverInfo& solverInfo)

``` c++
void btDiscreteDynamicsWorld::solveConstraints(btContactSolverInfo& solverInfo)
{
	BT_PROFILE("solveConstraints");

	m_sortedConstraints.resize(m_constraints.size());
	int i;
	for (i = 0; i < getNumConstraints(); i++)
	{
		m_sortedConstraints[i] = m_constraints[i];
	}

	//	btAssert(0);

	m_sortedConstraints.quickSort(btSortConstraintOnIslandPredicate());

	btTypedConstraint** constraintsPtr = getNumConstraints() ? &m_sortedConstraints[0] : 0;

	m_solverIslandCallback->setup(&solverInfo, constraintsPtr, m_sortedConstraints.size(), getDebugDrawer());
	m_constraintSolver->prepareSolve(getCollisionWorld()->getNumCollisionObjects(), getCollisionWorld()->getDispatcher()->getNumManifolds());

	/// solve all the constraints for this island
	m_islandManager->buildAndProcessIslands(getCollisionWorld()->getDispatcher(), getCollisionWorld(), m_solverIslandCallback);

	m_solverIslandCallback->processConstraints();

	m_constraintSolver->allSolved(solverInfo, m_debugDrawer);
}
```

#### btDiscreteDynamicsWorldMt::solveConstraints(btContactSolverInfo& solverInfo)
``` c++

void btDiscreteDynamicsWorldMt::solveConstraints(btContactSolverInfo& solverInfo)
{
	BT_PROFILE("solveConstraints");

	m_constraintSolver->prepareSolve(getCollisionWorld()->getNumCollisionObjects(), getCollisionWorld()->getDispatcher()->getNumManifolds());

	/// solve all the constraints for this island
	btSimulationIslandManagerMt* im = static_cast<btSimulationIslandManagerMt*>(m_islandManager);
	btSimulationIslandManagerMt::SolverParams solverParams;
	solverParams.m_solverPool = m_constraintSolver;
	solverParams.m_solverMt = m_constraintSolverMt;
	solverParams.m_solverInfo = &solverInfo;
	solverParams.m_debugDrawer = m_debugDrawer;
	solverParams.m_dispatcher = getCollisionWorld()->getDispatcher();
	im->buildAndProcessIslands(getCollisionWorld()->getDispatcher(), getCollisionWorld(), m_constraints, solverParams);

	m_constraintSolver->allSolved(solverInfo, m_debugDrawer);
}

```

#### btSimulationIslandManagerMt::buildAndProcessIslands(btDispatcher* dispatcher,
														 btCollisionWorld* collisionWorld,
														 btAlignedObjectArray<btTypedConstraint*>& constraints,
														 const SolverParams& solverParams)

``` c++

///@todo: this is random access, it can be walked 'cache friendly'!
void btSimulationIslandManagerMt::buildAndProcessIslands(btDispatcher* dispatcher,
														 btCollisionWorld* collisionWorld,
														 btAlignedObjectArray<btTypedConstraint*>& constraints,
														 const SolverParams& solverParams)
{
	BT_PROFILE("buildAndProcessIslands");
	btCollisionObjectArray& collisionObjects = collisionWorld->getCollisionObjectArray();

	buildIslands(dispatcher, collisionWorld);

	if (!getSplitIslands())
	{
		btPersistentManifold** manifolds = dispatcher->getInternalManifoldPointer();
		int maxNumManifolds = dispatcher->getNumManifolds();

		for (int i = 0; i < maxNumManifolds; i++)
		{
			btPersistentManifold* manifold = manifolds[i];

			const btCollisionObject* colObj0 = static_cast<const btCollisionObject*>(manifold->getBody0());
			const btCollisionObject* colObj1 = static_cast<const btCollisionObject*>(manifold->getBody1());

			///@todo: check sleeping conditions!
			if (((colObj0) && colObj0->getActivationState() != ISLAND_SLEEPING) ||
				((colObj1) && colObj1->getActivationState() != ISLAND_SLEEPING))
			{
				//kinematic objects don't merge islands, but wake up all connected objects
				if (colObj0->isKinematicObject() && colObj0->getActivationState() != ISLAND_SLEEPING)
				{
					if (colObj0->hasContactResponse())
						colObj1->activate();
				}
				if (colObj1->isKinematicObject() && colObj1->getActivationState() != ISLAND_SLEEPING)
				{
					if (colObj1->hasContactResponse())
						colObj0->activate();
				}
			}
		}
		btTypedConstraint** constraintsPtr = constraints.size() ? &constraints[0] : NULL;
		btConstraintSolver* solver = solverParams.m_solverMt ? solverParams.m_solverMt : solverParams.m_solverPool;
		solver->solveGroup(&collisionObjects[0],
						   collisionObjects.size(),
						   manifolds,
						   maxNumManifolds,
						   constraintsPtr,
						   constraints.size(),
						   *solverParams.m_solverInfo,
						   solverParams.m_debugDrawer,
						   solverParams.m_dispatcher);
	}
	else
	{
		initIslandPools();

		//traverse the simulation islands, and call the solver, unless all objects are sleeping/deactivated
		addBodiesToIslands(collisionWorld);
		addManifoldsToIslands(dispatcher);
		addConstraintsToIslands(constraints);

		// m_activeIslands array should now contain all non-sleeping Islands, and each Island should
		// have all the necessary bodies, manifolds and constraints.

		// if we want to merge islands with small batch counts,
		if (m_minimumSolverBatchSize > 1)
		{
			mergeIslands();
		}
		// dispatch islands to solver
		m_islandDispatch(&m_activeIslands, solverParams);
	}
}

```
### btDiscreteDynamicsWorld::integrateTransforms(btScalar timeStep)

``` c++
CalculateCombinedCallback gCalculateCombinedRestitutionCallback = &btManifoldResult::calculateCombinedRestitution;
extern CalculateCombinedCallback gCalculateCombinedRestitutionCallback;

btScalar btManifoldResult::calculateCombinedRestitution(const btCollisionObject* body0, const btCollisionObject* body1)
{
	return body0->getRestitution() * body1->getRestitution();
}


void btDiscreteDynamicsWorld::integrateTransforms(btScalar timeStep)
{
	BT_PROFILE("integrateTransforms");
	if (m_nonStaticRigidBodies.size() > 0)
	{
		integrateTransformsInternal(&m_nonStaticRigidBodies[0], m_nonStaticRigidBodies.size(), timeStep);
	}

	///this should probably be switched on by default, but it is not well tested yet
	if (m_applySpeculativeContactRestitution)
	{
		BT_PROFILE("apply speculative contact restitution");
		for (int i = 0; i < m_predictiveManifolds.size(); i++)
		{
			btPersistentManifold* manifold = m_predictiveManifolds[i];
			btRigidBody* body0 = btRigidBody::upcast((btCollisionObject*)manifold->getBody0());
			btRigidBody* body1 = btRigidBody::upcast((btCollisionObject*)manifold->getBody1());

			for (int p = 0; p < manifold->getNumContacts(); p++)
			{
				const btManifoldPoint& pt = manifold->getContactPoint(p);
				btScalar btManifoldResult::calculateCombinedRestitution(const btCollisionObject* body0, const btCollisionObject* body1)
				{
					return body0->getRestitution() * body1->getRestitution();
				}

				btScalar combinedRestitution = gCalculateCombinedRestitutionCallback(body0, body1);

				if (combinedRestitution > 0 && pt.m_appliedImpulse != 0.f)
				//if (pt.getDistance()>0 && combinedRestitution>0 && pt.m_appliedImpulse != 0.f)
				{
					btVector3 imp = -pt.m_normalWorldOnB * pt.m_appliedImpulse * combinedRestitution;

					const btVector3& pos1 = pt.getPositionWorldOnA();
					const btVector3& pos2 = pt.getPositionWorldOnB();

					btVector3 rel_pos0 = pos1 - body0->getWorldTransform().getOrigin();
					btVector3 rel_pos1 = pos2 - body1->getWorldTransform().getOrigin();

					if (body0)
						body0->applyImpulse(imp, rel_pos0);
					if (body1)
						body1->applyImpulse(-imp, rel_pos1);
				}
			}
		}
	}
}

void btRigidBody::predictIntegratedTransform(btScalar timeStep, btTransform& predictedTransform)
{
	btTransformUtil::integrateTransform(m_worldTransform, m_linearVelocity, m_angularVelocity, timeStep, predictedTransform);
}
const btVector3& getLinearVelocity() const
{
	return m_linearVelocity;
}

void btRigidBody::setCenterOfMassTransform(const btTransform& xform)
{
	if (isKinematicObject())
	{
		m_interpolationWorldTransform = m_worldTransform;
	}
	else
	{
		m_interpolationWorldTransform = xform;
	}
	m_interpolationLinearVelocity = getLinearVelocity();
	m_interpolationAngularVelocity = getAngularVelocity();
	m_worldTransform = xform;
	updateInertiaTensor();
}

void btRigidBody::updateInertiaTensor()
{
	m_invInertiaTensorWorld = m_worldTransform.getBasis().scaled(m_invInertiaLocal) * m_worldTransform.getBasis().transpose();
}


void btRigidBody::proceedToTransform(const btTransform& newTrans)
{
	setCenterOfMassTransform(newTrans);
}

void btDiscreteDynamicsWorld::integrateTransformsInternal(btRigidBody** bodies, int numBodies, btScalar timeStep)
{
	btTransform predictedTrans;
	for (int i = 0; i < numBodies; i++)
	{
		btRigidBody* body = bodies[i];
		body->setHitFraction(1.f);

		if (body->isActive() && (!body->isStaticOrKinematicObject()))
		{
			body->predictIntegratedTransform(timeStep, predictedTrans);

			btScalar squareMotion = (predictedTrans.getOrigin() - body->getWorldTransform().getOrigin()).length2();

			if (getDispatchInfo().m_useContinuous && body->getCcdSquareMotionThreshold() && body->getCcdSquareMotionThreshold() < squareMotion)
			{
				BT_PROFILE("CCD motion clamping");
				if (body->getCollisionShape()->isConvex())
				{
					gNumClampedCcdMotions++;
#ifdef USE_STATIC_ONLY
					class StaticOnlyCallback : public btClosestNotMeConvexResultCallback
					{
					public:
						StaticOnlyCallback(btCollisionObject* me, const btVector3& fromA, const btVector3& toA, btOverlappingPairCache* pairCache, btDispatcher* dispatcher) : btClosestNotMeConvexResultCallback(me, fromA, toA, pairCache, dispatcher)
						{
						}

						virtual bool needsCollision(btBroadphaseProxy* proxy0) const
						{
							btCollisionObject* otherObj = (btCollisionObject*)proxy0->m_clientObject;
							if (!otherObj->isStaticOrKinematicObject())
								return false;
							return btClosestNotMeConvexResultCallback::needsCollision(proxy0);
						}
					};

					StaticOnlyCallback sweepResults(body, body->getWorldTransform().getOrigin(), predictedTrans.getOrigin(), getBroadphase()->getOverlappingPairCache(), getDispatcher());
#else
					btClosestNotMeConvexResultCallback sweepResults(body, body->getWorldTransform().getOrigin(), predictedTrans.getOrigin(), getBroadphase()->getOverlappingPairCache(), getDispatcher());
#endif
					//btConvexShape* convexShape = static_cast<btConvexShape*>(body->getCollisionShape());
					btSphereShape tmpSphere(body->getCcdSweptSphereRadius());  //btConvexShape* convexShape = static_cast<btConvexShape*>(body->getCollisionShape());
					sweepResults.m_allowedPenetration = getDispatchInfo().m_allowedCcdPenetration;

					sweepResults.m_collisionFilterGroup = body->getBroadphaseProxy()->m_collisionFilterGroup;
					sweepResults.m_collisionFilterMask = body->getBroadphaseProxy()->m_collisionFilterMask;
					btTransform modifiedPredictedTrans = predictedTrans;
					modifiedPredictedTrans.setBasis(body->getWorldTransform().getBasis());

					convexSweepTest(&tmpSphere, body->getWorldTransform(), modifiedPredictedTrans, sweepResults);
					if (sweepResults.hasHit() && (sweepResults.m_closestHitFraction < 1.f))
					{
						//printf("clamped integration to hit fraction = %f\n",fraction);
						body->setHitFraction(sweepResults.m_closestHitFraction);
						body->predictIntegratedTransform(timeStep * body->getHitFraction(), predictedTrans);
						body->setHitFraction(0.f);
						body->proceedToTransform(predictedTrans);

						continue;
					}
				}
			}

			body->proceedToTransform(predictedTrans);
		}
	}
}

```

### btDiscreteDynamicsWorld::updateActions(btScalar timeStep)

``` c++
void btDiscreteDynamicsWorld::updateActions(btScalar timeStep)
{
	BT_PROFILE("updateActions");

	for (int i = 0; i < m_actions.size(); i++)
	{
		m_actions[i]->updateAction(this, timeStep);
	}
}

```
### btDiscreteDynamicsWorld::updateActivationState(btScalar timeStep)
``` c++
SIMD_FORCE_INLINE bool wantsSleeping()
	{
		if (getActivationState() == DISABLE_DEACTIVATION)
			return false;

		//disable deactivation
		if (gDisableDeactivation || (gDeactivationTime == btScalar(0.)))
			return false;

		if ((getActivationState() == ISLAND_SLEEPING) || (getActivationState() == WANTS_DEACTIVATION))
			return true;

		if (m_deactivationTime > gDeactivationTime)
		{
			return true;
		}
		return false;
	}
void btDiscreteDynamicsWorld::updateActivationState(btScalar timeStep)
{
	BT_PROFILE("updateActivationState");

	for (int i = 0; i < m_nonStaticRigidBodies.size(); i++)
	{
		btRigidBody* body = m_nonStaticRigidBodies[i];
		if (body)
		{
			
			body->updateDeactivation(timeStep);

			if (body->wantsSleeping())
			{
				if (body->isStaticOrKinematicObject())
				{
					body->setActivationState(ISLAND_SLEEPING);
				}
				else
				{
					if (body->getActivationState() == ACTIVE_TAG)
						body->setActivationState(WANTS_DEACTIVATION);
					if (body->getActivationState() == ISLAND_SLEEPING)
					{
						body->setAngularVelocity(btVector3(0, 0, 0));
						body->setLinearVelocity(btVector3(0, 0, 0));
					}
				}
			}
			else
			{
				if (body->getActivationState() != DISABLE_DEACTIVATION)
					body->setActivationState(ACTIVE_TAG);
			}
		}
	}
}

```
## classes

### btDiscreteDynamicsWorld

``` c++
btDiscreteDynamicsWorld : public btDynamicsWorld
{
protected:
	btAlignedObjectArray<btTypedConstraint*> m_sortedConstraints;
	InplaceSolverIslandCallback* m_solverIslandCallback;

	btConstraintSolver* m_constraintSolver;

	btSimulationIslandManager* m_islandManager;

	btAlignedObjectArray<btTypedConstraint*> m_constraints;

	btAlignedObjectArray<btRigidBody*> m_nonStaticRigidBodies;

	btVector3 m_gravity;

	//for variable timesteps
	btScalar m_localTime;
	btScalar m_fixedTimeStep;
	//for variable timesteps

	bool m_ownsIslandManager;
	bool m_ownsConstraintSolver;
	bool m_synchronizeAllMotionStates;
	bool m_applySpeculativeContactRestitution;

	btAlignedObjectArray<btActionInterface*> m_actions;

	int m_profileTimings;

	bool m_latencyMotionStateInterpolation;

	btAlignedObjectArray<btPersistentManifold*> m_predictiveManifolds;
	btSpinMutex m_predictiveManifoldsMutex;  // used to synchronize threads creating predictive contacts

	virtual void predictUnconstraintMotion(btScalar timeStep);

	void integrateTransformsInternal(btRigidBody * *bodies, int numBodies, btScalar timeStep);  // can be called in parallel
	virtual void integrateTransforms(btScalar timeStep);

	virtual void calculateSimulationIslands();

	

	virtual void updateActivationState(btScalar timeStep);

	void updateActions(btScalar timeStep);

	void startProfiling(btScalar timeStep);

	virtual void internalSingleStepSimulation(btScalar timeStep);

	void releasePredictiveContacts();
	void createPredictiveContactsInternal(btRigidBody * *bodies, int numBodies, btScalar timeStep);  // can be called in parallel
	virtual void createPredictiveContacts(btScalar timeStep);

	virtual void saveKinematicState(btScalar timeStep);

	void serializeRigidBodies(btSerializer * serializer);

	void serializeDynamicsWorldInfo(btSerializer * serializer);
    
public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	///this btDiscreteDynamicsWorld constructor gets created objects from the user, and will not delete those
	btDiscreteDynamicsWorld(btDispatcher * dispatcher, btBroadphaseInterface * pairCache, btConstraintSolver * constraintSolver, btCollisionConfiguration * collisionConfiguration);

	virtual ~btDiscreteDynamicsWorld();

	///if maxSubSteps > 0, it will interpolate motion between fixedTimeStep's
	virtual int stepSimulation(btScalar timeStep, int maxSubSteps = 1, btScalar fixedTimeStep = btScalar(1.) / btScalar(60.));

    virtual void solveConstraints(btContactSolverInfo & solverInfo);
    
	virtual void synchronizeMotionStates();

	///this can be useful to synchronize a single rigid body -> graphics object
	void synchronizeSingleMotionState(btRigidBody * body);

	virtual void addConstraint(btTypedConstraint * constraint, bool disableCollisionsBetweenLinkedBodies = false);

	virtual void removeConstraint(btTypedConstraint * constraint);

	virtual void addAction(btActionInterface*);

	virtual void removeAction(btActionInterface*);

	btSimulationIslandManager* getSimulationIslandManager()
	{
		return m_islandManager;
	}

	const btSimulationIslandManager* getSimulationIslandManager() const
	{
		return m_islandManager;
	}

	btCollisionWorld* getCollisionWorld()
	{
		return this;
	}

	virtual void setGravity(const btVector3& gravity);

	virtual btVector3 getGravity() const;

	virtual void addCollisionObject(btCollisionObject * collisionObject, int collisionFilterGroup = btBroadphaseProxy::StaticFilter, int collisionFilterMask = btBroadphaseProxy::AllFilter ^ btBroadphaseProxy::StaticFilter);

	virtual void addRigidBody(btRigidBody * body);

	virtual void addRigidBody(btRigidBody * body, int group, int mask);

	virtual void removeRigidBody(btRigidBody * body);

	///removeCollisionObject will first check if it is a rigid body, if so call removeRigidBody otherwise call btCollisionWorld::removeCollisionObject
	virtual void removeCollisionObject(btCollisionObject * collisionObject);

	virtual void debugDrawConstraint(btTypedConstraint * constraint);

	virtual void debugDrawWorld();

	virtual void setConstraintSolver(btConstraintSolver * solver);

	virtual btConstraintSolver* getConstraintSolver();

	virtual int getNumConstraints() const;

	virtual btTypedConstraint* getConstraint(int index);

	virtual const btTypedConstraint* getConstraint(int index) const;

	virtual btDynamicsWorldType getWorldType() const
	{
		return BT_DISCRETE_DYNAMICS_WORLD;
	}

	///the forces on each rigidbody is accumulating together with gravity. clear this after each timestep.
	virtual void clearForces();

	///apply gravity, call this once per timestep
	virtual void applyGravity();

	virtual void setNumTasks(int numTasks)
	{
		(void)numTasks;
	}

	///obsolete, use updateActions instead
	virtual void updateVehicles(btScalar timeStep)
	{
		updateActions(timeStep);
	}

	///obsolete, use addAction instead
	virtual void addVehicle(btActionInterface * vehicle);
	///obsolete, use removeAction instead
	virtual void removeVehicle(btActionInterface * vehicle);
	///obsolete, use addAction instead
	virtual void addCharacter(btActionInterface * character);
	///obsolete, use removeAction instead
	virtual void removeCharacter(btActionInterface * character);

	void setSynchronizeAllMotionStates(bool synchronizeAll)
	{
		m_synchronizeAllMotionStates = synchronizeAll;
	}
	bool getSynchronizeAllMotionStates() const
	{
		return m_synchronizeAllMotionStates;
	}

	void setApplySpeculativeContactRestitution(bool enable)
	{
		m_applySpeculativeContactRestitution = enable;
	}

	bool getApplySpeculativeContactRestitution() const
	{
		return m_applySpeculativeContactRestitution;
	}

	///Preliminary serialization test for Bullet 2.76. Loading those files requires a separate parser (see Bullet/Demos/SerializeDemo)
	virtual void serialize(btSerializer * serializer);

	///Interpolate motion state between previous and current transform, instead of current and next transform.
	///This can relieve discontinuities in the rendering, due to penetrations
	void setLatencyMotionStateInterpolation(bool latencyInterpolation)
	{
		m_latencyMotionStateInterpolation = latencyInterpolation;
	}
	bool getLatencyMotionStateInterpolation() const
	{
		return m_latencyMotionStateInterpolation;
	}
    
    btAlignedObjectArray<btRigidBody*>& getNonStaticRigidBodies()
    {
        return m_nonStaticRigidBodies;
    }
    
    const btAlignedObjectArray<btRigidBody*>& getNonStaticRigidBodies() const
    {
        return m_nonStaticRigidBodies;
    }
};

```

### btDynamicsWorld

``` c++
class btDynamicsWorld : public btCollisionWorld
{
protected:
	btInternalTickCallback m_internalTickCallback;
	btInternalTickCallback m_internalPreTickCallback;
	void* m_worldUserInfo;

	btContactSolverInfo m_solverInfo;

public:
	btDynamicsWorld(btDispatcher* dispatcher, btBroadphaseInterface* broadphase, btCollisionConfiguration* collisionConfiguration)
		: btCollisionWorld(dispatcher, broadphase, collisionConfiguration), m_internalTickCallback(0), m_internalPreTickCallback(0), m_worldUserInfo(0)
	{
	}

	virtual ~btDynamicsWorld()
	{
	}

	///stepSimulation proceeds the simulation over 'timeStep', units in preferably in seconds.
	///By default, Bullet will subdivide the timestep in constant substeps of each 'fixedTimeStep'.
	///in order to keep the simulation real-time, the maximum number of substeps can be clamped to 'maxSubSteps'.
	///You can disable subdividing the timestep/substepping by passing maxSubSteps=0 as second argument to stepSimulation, but in that case you have to keep the timeStep constant.
	virtual int stepSimulation(btScalar timeStep, int maxSubSteps = 1, btScalar fixedTimeStep = btScalar(1.) / btScalar(60.)) = 0;

	virtual void debugDrawWorld() = 0;

	virtual void addConstraint(btTypedConstraint* constraint, bool disableCollisionsBetweenLinkedBodies = false)
	{
		(void)constraint;
		(void)disableCollisionsBetweenLinkedBodies;
	}

	virtual void removeConstraint(btTypedConstraint* constraint) { (void)constraint; }

	virtual void addAction(btActionInterface* action) = 0;

	virtual void removeAction(btActionInterface* action) = 0;

	//once a rigidbody is added to the dynamics world, it will get this gravity assigned
	//existing rigidbodies in the world get gravity assigned too, during this method
	virtual void setGravity(const btVector3& gravity) = 0;
	virtual btVector3 getGravity() const = 0;

	virtual void synchronizeMotionStates() = 0;

	virtual void addRigidBody(btRigidBody* body) = 0;

	virtual void addRigidBody(btRigidBody* body, int group, int mask) = 0;

	virtual void removeRigidBody(btRigidBody* body) = 0;

	virtual void setConstraintSolver(btConstraintSolver* solver) = 0;

	virtual btConstraintSolver* getConstraintSolver() = 0;

	virtual int getNumConstraints() const { return 0; }

	virtual btTypedConstraint* getConstraint(int index)
	{
		(void)index;
		return 0;
	}

	virtual const btTypedConstraint* getConstraint(int index) const
	{
		(void)index;
		return 0;
	}

	virtual btDynamicsWorldType getWorldType() const = 0;

	virtual void clearForces() = 0;

	/// Set the callback for when an internal tick (simulation substep) happens, optional user info
	void setInternalTickCallback(btInternalTickCallback cb, void* worldUserInfo = 0, bool isPreTick = false)
	{
		if (isPreTick)
		{
			m_internalPreTickCallback = cb;
		}
		else
		{
			m_internalTickCallback = cb;
		}
		m_worldUserInfo = worldUserInfo;
	}

	void setWorldUserInfo(void* worldUserInfo)
	{
		m_worldUserInfo = worldUserInfo;
	}

	void* getWorldUserInfo() const
	{
		return m_worldUserInfo;
	}

	btContactSolverInfo& getSolverInfo()
	{
		return m_solverInfo;
	}

	const btContactSolverInfo& getSolverInfo() const
	{
		return m_solverInfo;
	}

	///obsolete, use addAction instead.
	virtual void addVehicle(btActionInterface* vehicle) { (void)vehicle; }
	///obsolete, use removeAction instead
	virtual void removeVehicle(btActionInterface* vehicle) { (void)vehicle; }
	///obsolete, use addAction instead.
	virtual void addCharacter(btActionInterface* character) { (void)character; }
	///obsolete, use removeAction instead
	virtual void removeCharacter(btActionInterface* character) { (void)character; }
};

///do not change those serialization structures, it requires an updated sBulletDNAstr/sBulletDNAstr64
struct btDynamicsWorldDoubleData
{
	btContactSolverInfoDoubleData m_solverInfo;
	btVector3DoubleData m_gravity;
};

///do not change those serialization structures, it requires an updated sBulletDNAstr/sBulletDNAstr64
struct btDynamicsWorldFloatData
{
	btContactSolverInfoFloatData m_solverInfo;
	btVector3FloatData m_gravity;
};

```

### btCollisionWorld

``` c++
// CollisionWorld is interface and container for the collision detection
class btCollisionWorld
{
protected:
	btAlignedObjectArray<btCollisionObject*> m_collisionObjects;

	btDispatcher* m_dispatcher1;

	btDispatcherInfo m_dispatchInfo;

	btBroadphaseInterface* m_broadphasePairCache;

	btIDebugDraw* m_debugDrawer;

	///m_forceUpdateAllAabbs can be set to false as an optimization to only update active object AABBs
	///it is true by default, because it is error-prone (setting the position of static objects wouldn't update their AABB)
	bool m_forceUpdateAllAabbs;

	void serializeCollisionObjects(btSerializer* serializer);

	void serializeContactManifolds(btSerializer* serializer);

public:
	//this constructor doesn't own the dispatcher and paircache/broadphase
	btCollisionWorld(btDispatcher* dispatcher, btBroadphaseInterface* broadphasePairCache, btCollisionConfiguration* collisionConfiguration);

	virtual ~btCollisionWorld();

	void setBroadphase(btBroadphaseInterface* pairCache)
	{
		m_broadphasePairCache = pairCache;
	}

	const btBroadphaseInterface* getBroadphase() const
	{
		return m_broadphasePairCache;
	}

	btBroadphaseInterface* getBroadphase()
	{
		return m_broadphasePairCache;
	}

	btOverlappingPairCache* getPairCache()
	{
		return m_broadphasePairCache->getOverlappingPairCache();
	}

	btDispatcher* getDispatcher()
	{
		return m_dispatcher1;
	}

	const btDispatcher* getDispatcher() const
	{
		return m_dispatcher1;
	}

	void updateSingleAabb(btCollisionObject* colObj);

	virtual void updateAabbs();

	///the computeOverlappingPairs is usually already called by performDiscreteCollisionDetection (or stepSimulation)
	///it can be useful to use if you perform ray tests without collision detection/simulation
	virtual void computeOverlappingPairs();

	virtual void setDebugDrawer(btIDebugDraw* debugDrawer)
	{
		m_debugDrawer = debugDrawer;
	}

	virtual btIDebugDraw* getDebugDrawer()
	{
		return m_debugDrawer;
	}

	virtual void debugDrawWorld();

	virtual void debugDrawObject(const btTransform& worldTransform, const btCollisionShape* shape, const btVector3& color);

	///LocalShapeInfo gives extra information for complex shapes
	///Currently, only btTriangleMeshShape is available, so it just contains triangleIndex and subpart
	struct LocalShapeInfo
	{
		int m_shapePart;
		int m_triangleIndex;

		//const btCollisionShape*	m_shapeTemp;
		//const btTransform*	m_shapeLocalTransform;
	};

	struct LocalRayResult
	{
		LocalRayResult(const btCollisionObject* collisionObject,
					   LocalShapeInfo* localShapeInfo,
					   const btVector3& hitNormalLocal,
					   btScalar hitFraction)
			: m_collisionObject(collisionObject),
			  m_localShapeInfo(localShapeInfo),
			  m_hitNormalLocal(hitNormalLocal),
			  m_hitFraction(hitFraction)
		{
		}

		const btCollisionObject* m_collisionObject;
		LocalShapeInfo* m_localShapeInfo;
		btVector3 m_hitNormalLocal;
		btScalar m_hitFraction;
	};

	///RayResultCallback is used to report new raycast results
	struct RayResultCallback
	{
		btScalar m_closestHitFraction;
		const btCollisionObject* m_collisionObject;
		int m_collisionFilterGroup;
		int m_collisionFilterMask;
		//@BP Mod - Custom flags, currently used to enable backface culling on tri-meshes, see btRaycastCallback.h. Apply any of the EFlags defined there on m_flags here to invoke.
		unsigned int m_flags;

		virtual ~RayResultCallback()
		{
		}
		bool hasHit() const
		{
			return (m_collisionObject != 0);
		}

		RayResultCallback()
			: m_closestHitFraction(btScalar(1.)),
			  m_collisionObject(0),
			  m_collisionFilterGroup(btBroadphaseProxy::DefaultFilter),
			  m_collisionFilterMask(btBroadphaseProxy::AllFilter),
			  //@BP Mod
			  m_flags(0)
		{
		}

		virtual bool needsCollision(btBroadphaseProxy* proxy0) const
		{
			bool collides = (proxy0->m_collisionFilterGroup & m_collisionFilterMask) != 0;
			collides = collides && (m_collisionFilterGroup & proxy0->m_collisionFilterMask);
			return collides;
		}

		virtual btScalar addSingleResult(LocalRayResult& rayResult, bool normalInWorldSpace) = 0;
	};

	struct ClosestRayResultCallback : public RayResultCallback
	{
		ClosestRayResultCallback(const btVector3& rayFromWorld, const btVector3& rayToWorld)
			: m_rayFromWorld(rayFromWorld),
			  m_rayToWorld(rayToWorld)
		{
		}

		btVector3 m_rayFromWorld;  //used to calculate hitPointWorld from hitFraction
		btVector3 m_rayToWorld;

		btVector3 m_hitNormalWorld;
		btVector3 m_hitPointWorld;

		virtual btScalar addSingleResult(LocalRayResult& rayResult, bool normalInWorldSpace)
		{
			//caller already does the filter on the m_closestHitFraction
			btAssert(rayResult.m_hitFraction <= m_closestHitFraction);

			m_closestHitFraction = rayResult.m_hitFraction;
			m_collisionObject = rayResult.m_collisionObject;
			if (normalInWorldSpace)
			{
				m_hitNormalWorld = rayResult.m_hitNormalLocal;
			}
			else
			{
				///need to transform normal into worldspace
				m_hitNormalWorld = m_collisionObject->getWorldTransform().getBasis() * rayResult.m_hitNormalLocal;
			}
			m_hitPointWorld.setInterpolate3(m_rayFromWorld, m_rayToWorld, rayResult.m_hitFraction);
			return rayResult.m_hitFraction;
		}
	};

	struct AllHitsRayResultCallback : public RayResultCallback
	{
		AllHitsRayResultCallback(const btVector3& rayFromWorld, const btVector3& rayToWorld)
			: m_rayFromWorld(rayFromWorld),
			  m_rayToWorld(rayToWorld)
		{
		}

		btAlignedObjectArray<const btCollisionObject*> m_collisionObjects;

		btVector3 m_rayFromWorld;  //used to calculate hitPointWorld from hitFraction
		btVector3 m_rayToWorld;

		btAlignedObjectArray<btVector3> m_hitNormalWorld;
		btAlignedObjectArray<btVector3> m_hitPointWorld;
		btAlignedObjectArray<btScalar> m_hitFractions;

		virtual btScalar addSingleResult(LocalRayResult& rayResult, bool normalInWorldSpace)
		{
			m_collisionObject = rayResult.m_collisionObject;
			m_collisionObjects.push_back(rayResult.m_collisionObject);
			btVector3 hitNormalWorld;
			if (normalInWorldSpace)
			{
				hitNormalWorld = rayResult.m_hitNormalLocal;
			}
			else
			{
				///need to transform normal into worldspace
				hitNormalWorld = m_collisionObject->getWorldTransform().getBasis() * rayResult.m_hitNormalLocal;
			}
			m_hitNormalWorld.push_back(hitNormalWorld);
			btVector3 hitPointWorld;
			hitPointWorld.setInterpolate3(m_rayFromWorld, m_rayToWorld, rayResult.m_hitFraction);
			m_hitPointWorld.push_back(hitPointWorld);
			m_hitFractions.push_back(rayResult.m_hitFraction);
			return m_closestHitFraction;
		}
	};

	struct LocalConvexResult
	{
		LocalConvexResult(const btCollisionObject* hitCollisionObject,
						  LocalShapeInfo* localShapeInfo,
						  const btVector3& hitNormalLocal,
						  const btVector3& hitPointLocal,
						  btScalar hitFraction)
			: m_hitCollisionObject(hitCollisionObject),
			  m_localShapeInfo(localShapeInfo),
			  m_hitNormalLocal(hitNormalLocal),
			  m_hitPointLocal(hitPointLocal),
			  m_hitFraction(hitFraction)
		{
		}

		const btCollisionObject* m_hitCollisionObject;
		LocalShapeInfo* m_localShapeInfo;
		btVector3 m_hitNormalLocal;
		btVector3 m_hitPointLocal;
		btScalar m_hitFraction;
	};

	///RayResultCallback is used to report new raycast results
	struct ConvexResultCallback
	{
		btScalar m_closestHitFraction;
		int m_collisionFilterGroup;
		int m_collisionFilterMask;

		ConvexResultCallback()
			: m_closestHitFraction(btScalar(1.)),
			  m_collisionFilterGroup(btBroadphaseProxy::DefaultFilter),
			  m_collisionFilterMask(btBroadphaseProxy::AllFilter)
		{
		}

		virtual ~ConvexResultCallback()
		{
		}

		bool hasHit() const
		{
			return (m_closestHitFraction < btScalar(1.));
		}

		virtual bool needsCollision(btBroadphaseProxy* proxy0) const
		{
			bool collides = (proxy0->m_collisionFilterGroup & m_collisionFilterMask) != 0;
			collides = collides && (m_collisionFilterGroup & proxy0->m_collisionFilterMask);
			return collides;
		}

		virtual btScalar addSingleResult(LocalConvexResult& convexResult, bool normalInWorldSpace) = 0;
	};

	struct ClosestConvexResultCallback : public ConvexResultCallback
	{
		ClosestConvexResultCallback(const btVector3& convexFromWorld, const btVector3& convexToWorld)
			: m_convexFromWorld(convexFromWorld),
			  m_convexToWorld(convexToWorld),
			  m_hitCollisionObject(0)
		{
		}

		btVector3 m_convexFromWorld;  //used to calculate hitPointWorld from hitFraction
		btVector3 m_convexToWorld;

		btVector3 m_hitNormalWorld;
		btVector3 m_hitPointWorld;
		const btCollisionObject* m_hitCollisionObject;

		virtual btScalar addSingleResult(LocalConvexResult& convexResult, bool normalInWorldSpace)
		{
			//caller already does the filter on the m_closestHitFraction
			btAssert(convexResult.m_hitFraction <= m_closestHitFraction);

			m_closestHitFraction = convexResult.m_hitFraction;
			m_hitCollisionObject = convexResult.m_hitCollisionObject;
			if (normalInWorldSpace)
			{
				m_hitNormalWorld = convexResult.m_hitNormalLocal;
			}
			else
			{
				///need to transform normal into worldspace
				m_hitNormalWorld = m_hitCollisionObject->getWorldTransform().getBasis() * convexResult.m_hitNormalLocal;
			}
			m_hitPointWorld = convexResult.m_hitPointLocal;
			return convexResult.m_hitFraction;
		}
	};

	///ContactResultCallback is used to report contact points
	struct ContactResultCallback
	{
		int m_collisionFilterGroup;
		int m_collisionFilterMask;
		btScalar m_closestDistanceThreshold;

		ContactResultCallback()
			: m_collisionFilterGroup(btBroadphaseProxy::DefaultFilter),
			  m_collisionFilterMask(btBroadphaseProxy::AllFilter),
			  m_closestDistanceThreshold(0)
		{
		}

		virtual ~ContactResultCallback()
		{
		}

		virtual bool needsCollision(btBroadphaseProxy* proxy0) const
		{
			bool collides = (proxy0->m_collisionFilterGroup & m_collisionFilterMask) != 0;
			collides = collides && (m_collisionFilterGroup & proxy0->m_collisionFilterMask);
			return collides;
		}

		virtual btScalar addSingleResult(btManifoldPoint& cp, const btCollisionObjectWrapper* colObj0Wrap, int partId0, int index0, const btCollisionObjectWrapper* colObj1Wrap, int partId1, int index1) = 0;
	};

	int getNumCollisionObjects() const
	{
		return int(m_collisionObjects.size());
	}

	/// rayTest performs a raycast on all objects in the btCollisionWorld, and calls the resultCallback
	/// This allows for several queries: first hit, all hits, any hit, dependent on the value returned by the callback.
	virtual void rayTest(const btVector3& rayFromWorld, const btVector3& rayToWorld, RayResultCallback& resultCallback) const;

	/// convexTest performs a swept convex cast on all objects in the btCollisionWorld, and calls the resultCallback
	/// This allows for several queries: first hit, all hits, any hit, dependent on the value return by the callback.
	void convexSweepTest(const btConvexShape* castShape, const btTransform& from, const btTransform& to, ConvexResultCallback& resultCallback, btScalar allowedCcdPenetration = btScalar(0.)) const;

	///contactTest performs a discrete collision test between colObj against all objects in the btCollisionWorld, and calls the resultCallback.
	///it reports one or more contact points for every overlapping object (including the one with deepest penetration)
	void contactTest(btCollisionObject* colObj, ContactResultCallback& resultCallback);

	///contactTest performs a discrete collision test between two collision objects and calls the resultCallback if overlap if detected.
	///it reports one or more contact points (including the one with deepest penetration)
	void contactPairTest(btCollisionObject* colObjA, btCollisionObject* colObjB, ContactResultCallback& resultCallback);

	/// rayTestSingle performs a raycast call and calls the resultCallback. It is used internally by rayTest.
	/// In a future implementation, we consider moving the ray test as a virtual method in btCollisionShape.
	/// This allows more customization.
	static void rayTestSingle(const btTransform& rayFromTrans, const btTransform& rayToTrans,
							  btCollisionObject* collisionObject,
							  const btCollisionShape* collisionShape,
							  const btTransform& colObjWorldTransform,
							  RayResultCallback& resultCallback);

	static void rayTestSingleInternal(const btTransform& rayFromTrans, const btTransform& rayToTrans,
									  const btCollisionObjectWrapper* collisionObjectWrap,
									  RayResultCallback& resultCallback);

	/// objectQuerySingle performs a collision detection query and calls the resultCallback. It is used internally by rayTest.
	static void objectQuerySingle(const btConvexShape* castShape, const btTransform& rayFromTrans, const btTransform& rayToTrans,
								  btCollisionObject* collisionObject,
								  const btCollisionShape* collisionShape,
								  const btTransform& colObjWorldTransform,
								  ConvexResultCallback& resultCallback, btScalar allowedPenetration);

	static void objectQuerySingleInternal(const btConvexShape* castShape, const btTransform& convexFromTrans, const btTransform& convexToTrans,
										  const btCollisionObjectWrapper* colObjWrap,
										  ConvexResultCallback& resultCallback, btScalar allowedPenetration);

	virtual void addCollisionObject(btCollisionObject* collisionObject, int collisionFilterGroup = btBroadphaseProxy::DefaultFilter, int collisionFilterMask = btBroadphaseProxy::AllFilter);

	virtual void refreshBroadphaseProxy(btCollisionObject* collisionObject);

	btCollisionObjectArray& getCollisionObjectArray()
	{
		return m_collisionObjects;
	}

	const btCollisionObjectArray& getCollisionObjectArray() const
	{
		return m_collisionObjects;
	}

	virtual void removeCollisionObject(btCollisionObject* collisionObject);

	virtual void performDiscreteCollisionDetection();

	btDispatcherInfo& getDispatchInfo()
	{
		return m_dispatchInfo;
	}

	const btDispatcherInfo& getDispatchInfo() const
	{
		return m_dispatchInfo;
	}

	bool getForceUpdateAllAabbs() const
	{
		return m_forceUpdateAllAabbs;
	}
	void setForceUpdateAllAabbs(bool forceUpdateAllAabbs)
	{
		m_forceUpdateAllAabbs = forceUpdateAllAabbs;
	}

	///Preliminary serialization test for Bullet 2.76. Loading those files requires a separate parser (Bullet/Demos/SerializeDemo)
	virtual void serialize(btSerializer* serializer);
};

```


### btRigidBody

``` c++

///The btRigidBody is the main class for rigid body objects. It is derived from btCollisionObject, so it keeps a pointer to a btCollisionShape.
///It is recommended for performance and memory use to share btCollisionShape objects whenever possible.
///There are 3 types of rigid bodies:
///- A) Dynamic rigid bodies, with positive mass. Motion is controlled by rigid body dynamics.
///- B) Fixed objects with zero mass. They are not moving (basically collision objects)
///- C) Kinematic objects, which are objects without mass, but the user can move them. There is one-way interaction, and Bullet calculates a velocity based on the timestep and previous and current world transform.
///Bullet automatically deactivates dynamic rigid bodies, when the velocity is below a threshold for a given time.
///Deactivated (sleeping) rigid bodies don't take any processing time, except a minor broadphase collision detection impact (to allow active objects to activate/wake up sleeping objects)
class btRigidBody : public btCollisionObject
{
	btMatrix3x3 m_invInertiaTensorWorld;
	btVector3 m_linearVelocity;
	btVector3 m_angularVelocity;
	btScalar m_inverseMass;
	btVector3 m_linearFactor;

	btVector3 m_gravity;
	btVector3 m_gravity_acceleration;
	btVector3 m_invInertiaLocal;
	btVector3 m_totalForce;
	btVector3 m_totalTorque;

	btScalar m_linearDamping;
	btScalar m_angularDamping;

	bool m_additionalDamping;
	btScalar m_additionalDampingFactor;
	btScalar m_additionalLinearDampingThresholdSqr;
	btScalar m_additionalAngularDampingThresholdSqr;
	btScalar m_additionalAngularDampingFactor;

	btScalar m_linearSleepingThreshold;
	btScalar m_angularSleepingThreshold;

	//m_optionalMotionState allows to automatic synchronize the world transform for active objects
	btMotionState* m_optionalMotionState;

	//keep track of typed constraints referencing this rigid body, to disable collision between linked bodies
	btAlignedObjectArray<btTypedConstraint*> m_constraintRefs;

	int m_rigidbodyFlags;

	int m_debugBodyId;

protected:
	ATTRIBUTE_ALIGNED16(btVector3 m_deltaLinearVelocity);
	btVector3 m_deltaAngularVelocity;
	btVector3 m_angularFactor;
	btVector3 m_invMass;
	btVector3 m_pushVelocity;
	btVector3 m_turnVelocity;

public:
	///The btRigidBodyConstructionInfo structure provides information to create a rigid body. Setting mass to zero creates a fixed (non-dynamic) rigid body.
	///For dynamic objects, you can use the collision shape to approximate the local inertia tensor, otherwise use the zero vector (default argument)
	///You can use the motion state to synchronize the world transform between physics and graphics objects.
	///And if the motion state is provided, the rigid body will initialize its initial world transform from the motion state,
	///m_startWorldTransform is only used when you don't provide a motion state.
	struct btRigidBodyConstructionInfo
	{
		btScalar m_mass;

		///When a motionState is provided, the rigid body will initialize its world transform from the motion state
		///In this case, m_startWorldTransform is ignored.
		btMotionState* m_motionState;
		btTransform m_startWorldTransform;

		btCollisionShape* m_collisionShape;
		btVector3 m_localInertia;
		btScalar m_linearDamping;
		btScalar m_angularDamping;

		///best simulation results when friction is non-zero
		btScalar m_friction;
		///the m_rollingFriction prevents rounded shapes, such as spheres, cylinders and capsules from rolling forever.
		///See Bullet/Demos/RollingFrictionDemo for usage
		btScalar m_rollingFriction;
		btScalar m_spinningFriction;  //torsional friction around contact normal

		///best simulation results using zero restitution.
		btScalar m_restitution;

		btScalar m_linearSleepingThreshold;
		btScalar m_angularSleepingThreshold;

		//Additional damping can help avoiding lowpass jitter motion, help stability for ragdolls etc.
		//Such damping is undesirable, so once the overall simulation quality of the rigid body dynamics system has improved, this should become obsolete
		bool m_additionalDamping;
		btScalar m_additionalDampingFactor;
		btScalar m_additionalLinearDampingThresholdSqr;
		btScalar m_additionalAngularDampingThresholdSqr;
		btScalar m_additionalAngularDampingFactor;

		btRigidBodyConstructionInfo(btScalar mass, btMotionState* motionState, btCollisionShape* collisionShape, const btVector3& localInertia = btVector3(0, 0, 0)) : m_mass(mass),
																																									   m_motionState(motionState),
																																									   m_collisionShape(collisionShape),
																																									   m_localInertia(localInertia),
																																									   m_linearDamping(btScalar(0.)),
																																									   m_angularDamping(btScalar(0.)),
																																									   m_friction(btScalar(0.5)),
																																									   m_rollingFriction(btScalar(0)),
																																									   m_spinningFriction(btScalar(0)),
																																									   m_restitution(btScalar(0.)),
																																									   m_linearSleepingThreshold(btScalar(0.8)),
																																									   m_angularSleepingThreshold(btScalar(1.f)),
																																									   m_additionalDamping(false),
																																									   m_additionalDampingFactor(btScalar(0.005)),
																																									   m_additionalLinearDampingThresholdSqr(btScalar(0.01)),
																																									   m_additionalAngularDampingThresholdSqr(btScalar(0.01)),
																																									   m_additionalAngularDampingFactor(btScalar(0.01))
		{
			m_startWorldTransform.setIdentity();
		}
	};

	///btRigidBody constructor using construction info
	btRigidBody(const btRigidBodyConstructionInfo& constructionInfo);

	///btRigidBody constructor for backwards compatibility.
	///To specify friction (etc) during rigid body construction, please use the other constructor (using btRigidBodyConstructionInfo)
	btRigidBody(btScalar mass, btMotionState* motionState, btCollisionShape* collisionShape, const btVector3& localInertia = btVector3(0, 0, 0));

	virtual ~btRigidBody()
	{
		//No constraints should point to this rigidbody
		//Remove constraints from the dynamics world before you delete the related rigidbodies.
		btAssert(m_constraintRefs.size() == 0);
	}

protected:
	///setupRigidBody is only used internally by the constructor
	void setupRigidBody(const btRigidBodyConstructionInfo& constructionInfo);

public:
	void proceedToTransform(const btTransform& newTrans);

	///to keep collision detection and dynamics separate we don't store a rigidbody pointer
	///but a rigidbody is derived from btCollisionObject, so we can safely perform an upcast
	static const btRigidBody* upcast(const btCollisionObject* colObj)
	{
		if (colObj->getInternalType() & btCollisionObject::CO_RIGID_BODY)
			return (const btRigidBody*)colObj;
		return 0;
	}
	static btRigidBody* upcast(btCollisionObject* colObj)
	{
		if (colObj->getInternalType() & btCollisionObject::CO_RIGID_BODY)
			return (btRigidBody*)colObj;
		return 0;
	}

	/// continuous collision detection needs prediction
	void predictIntegratedTransform(btScalar step, btTransform& predictedTransform);

	void saveKinematicState(btScalar step);

	void applyGravity();
    
    void clearGravity();

	void setGravity(const btVector3& acceleration);

	const btVector3& getGravity() const
	{
		return m_gravity_acceleration;
	}

	void setDamping(btScalar lin_damping, btScalar ang_damping);

	btScalar getLinearDamping() const
	{
		return m_linearDamping;
	}

	btScalar getAngularDamping() const
	{
		return m_angularDamping;
	}

	btScalar getLinearSleepingThreshold() const
	{
		return m_linearSleepingThreshold;
	}

	btScalar getAngularSleepingThreshold() const
	{
		return m_angularSleepingThreshold;
	}

	void applyDamping(btScalar timeStep);

	SIMD_FORCE_INLINE const btCollisionShape* getCollisionShape() const
	{
		return m_collisionShape;
	}

	SIMD_FORCE_INLINE btCollisionShape* getCollisionShape()
	{
		return m_collisionShape;
	}

	void setMassProps(btScalar mass, const btVector3& inertia);

	const btVector3& getLinearFactor() const
	{
		return m_linearFactor;
	}
	void setLinearFactor(const btVector3& linearFactor)
	{
		m_linearFactor = linearFactor;
		m_invMass = m_linearFactor * m_inverseMass;
	}
	btScalar getInvMass() const { return m_inverseMass; }
	btScalar getMass() const { return m_inverseMass == btScalar(0.) ? btScalar(0.) : btScalar(1.0) / m_inverseMass; }
	const btMatrix3x3& getInvInertiaTensorWorld() const
	{
		return m_invInertiaTensorWorld;
	}

	void integrateVelocities(btScalar step);

	void setCenterOfMassTransform(const btTransform& xform);

	void applyCentralForce(const btVector3& force)
	{
		m_totalForce += force * m_linearFactor;
	}

	const btVector3& getTotalForce() const
	{
		return m_totalForce;
	};

	const btVector3& getTotalTorque() const
	{
		return m_totalTorque;
	};

	const btVector3& getInvInertiaDiagLocal() const
	{
		return m_invInertiaLocal;
	};

	void setInvInertiaDiagLocal(const btVector3& diagInvInertia)
	{
		m_invInertiaLocal = diagInvInertia;
	}

	void setSleepingThresholds(btScalar linear, btScalar angular)
	{
		m_linearSleepingThreshold = linear;
		m_angularSleepingThreshold = angular;
	}

	void applyTorque(const btVector3& torque)
	{
		m_totalTorque += torque * m_angularFactor;
		#if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
		clampVelocity(m_totalTorque);
		#endif
	}

	void applyForce(const btVector3& force, const btVector3& rel_pos)
	{
		applyCentralForce(force);
		applyTorque(rel_pos.cross(force * m_linearFactor));
	}

	void applyCentralImpulse(const btVector3& impulse)
	{
		m_linearVelocity += impulse * m_linearFactor * m_inverseMass;
		#if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
		clampVelocity(m_linearVelocity);
		#endif
	}

	void applyTorqueImpulse(const btVector3& torque)
	{
		m_angularVelocity += m_invInertiaTensorWorld * torque * m_angularFactor;
		#if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
		clampVelocity(m_angularVelocity);
		#endif
	}

	void applyImpulse(const btVector3& impulse, const btVector3& rel_pos)
	{
		if (m_inverseMass != btScalar(0.))
		{
			applyCentralImpulse(impulse);
			if (m_angularFactor)
			{
				applyTorqueImpulse(rel_pos.cross(impulse * m_linearFactor));
			}
		}
	}
    
    void applyPushImpulse(const btVector3& impulse, const btVector3& rel_pos)
    {
        if (m_inverseMass != btScalar(0.))
        {
            applyCentralPushImpulse(impulse);
            if (m_angularFactor)
            {
                applyTorqueTurnImpulse(rel_pos.cross(impulse * m_linearFactor));
            }
        }
    }
    
    btVector3 getPushVelocity() const
    {
        return m_pushVelocity;
    }
    
    btVector3 getTurnVelocity() const
    {
        return m_turnVelocity;
    }
    
    void setPushVelocity(const btVector3& v)
    {
        m_pushVelocity = v;
    }

    #if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
    void clampVelocity(btVector3& v) const {
        v.setX(
            fmax(-BT_CLAMP_VELOCITY_TO,
                 fmin(BT_CLAMP_VELOCITY_TO, v.getX()))
        );
        v.setY(
            fmax(-BT_CLAMP_VELOCITY_TO,
                 fmin(BT_CLAMP_VELOCITY_TO, v.getY()))
        );
        v.setZ(
            fmax(-BT_CLAMP_VELOCITY_TO,
                 fmin(BT_CLAMP_VELOCITY_TO, v.getZ()))
        );
    }
    #endif

    void setTurnVelocity(const btVector3& v)
    {
        m_turnVelocity = v;
        #if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
        clampVelocity(m_turnVelocity);
        #endif
    }
    
    void applyCentralPushImpulse(const btVector3& impulse)
    {
        m_pushVelocity += impulse * m_linearFactor * m_inverseMass;
        #if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
        clampVelocity(m_pushVelocity);
        #endif
    }
    
    void applyTorqueTurnImpulse(const btVector3& torque)
    {
        m_turnVelocity += m_invInertiaTensorWorld * torque * m_angularFactor;
        #if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
        clampVelocity(m_turnVelocity);
        #endif
    }

	void clearForces()
	{
		m_totalForce.setValue(btScalar(0.0), btScalar(0.0), btScalar(0.0));
		m_totalTorque.setValue(btScalar(0.0), btScalar(0.0), btScalar(0.0));
	}

	void updateInertiaTensor();

	const btVector3& getCenterOfMassPosition() const
	{
		return m_worldTransform.getOrigin();
	}
	btQuaternion getOrientation() const;

	const btTransform& getCenterOfMassTransform() const
	{
		return m_worldTransform;
	}
	const btVector3& getLinearVelocity() const
	{
		return m_linearVelocity;
	}
	const btVector3& getAngularVelocity() const
	{
		return m_angularVelocity;
	}

	inline void setLinearVelocity(const btVector3& lin_vel)
	{
		m_updateRevision++;
		m_linearVelocity = lin_vel;
		#if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
		clampVelocity(m_linearVelocity);
		#endif
	}

	inline void setAngularVelocity(const btVector3& ang_vel)
	{
		m_updateRevision++;
		m_angularVelocity = ang_vel;
		#if defined(BT_CLAMP_VELOCITY_TO) && BT_CLAMP_VELOCITY_TO > 0
		clampVelocity(m_angularVelocity);
		#endif
	}

	btVector3 getVelocityInLocalPoint(const btVector3& rel_pos) const
	{
		//we also calculate lin/ang velocity for kinematic objects
		return m_linearVelocity + m_angularVelocity.cross(rel_pos);

		//for kinematic objects, we could also use use:
		//		return 	(m_worldTransform(rel_pos) - m_interpolationWorldTransform(rel_pos)) / m_kinematicTimeStep;
	}
    
    btVector3 getPushVelocityInLocalPoint(const btVector3& rel_pos) const
    {
        //we also calculate lin/ang velocity for kinematic objects
        return m_pushVelocity + m_turnVelocity.cross(rel_pos);
    }

	void translate(const btVector3& v)
	{
		m_worldTransform.getOrigin() += v;
	}

	void getAabb(btVector3& aabbMin, btVector3& aabbMax) const;

	SIMD_FORCE_INLINE btScalar computeImpulseDenominator(const btVector3& pos, const btVector3& normal) const
	{
		btVector3 r0 = pos - getCenterOfMassPosition();

		btVector3 c0 = (r0).cross(normal);

		btVector3 vec = (c0 * getInvInertiaTensorWorld()).cross(r0);

		return m_inverseMass + normal.dot(vec);
	}

	SIMD_FORCE_INLINE btScalar computeAngularImpulseDenominator(const btVector3& axis) const
	{
		btVector3 vec = axis * getInvInertiaTensorWorld();
		return axis.dot(vec);
	}

	SIMD_FORCE_INLINE void updateDeactivation(btScalar timeStep)
	{
		if ((getActivationState() == ISLAND_SLEEPING) || (getActivationState() == DISABLE_DEACTIVATION))
			return;

		if ((getLinearVelocity().length2() < m_linearSleepingThreshold * m_linearSleepingThreshold) &&
			(getAngularVelocity().length2() < m_angularSleepingThreshold * m_angularSleepingThreshold))
		{
			m_deactivationTime += timeStep;
		}
		else
		{
			m_deactivationTime = btScalar(0.);
			setActivationState(0);
		}
	}

	SIMD_FORCE_INLINE bool wantsSleeping()
	{
		if (getActivationState() == DISABLE_DEACTIVATION)
			return false;

		//disable deactivation
		if (gDisableDeactivation || (gDeactivationTime == btScalar(0.)))
			return false;

		if ((getActivationState() == ISLAND_SLEEPING) || (getActivationState() == WANTS_DEACTIVATION))
			return true;

		if (m_deactivationTime > gDeactivationTime)
		{
			return true;
		}
		return false;
	}

	const btBroadphaseProxy* getBroadphaseProxy() const
	{
		return m_broadphaseHandle;
	}
	btBroadphaseProxy* getBroadphaseProxy()
	{
		return m_broadphaseHandle;
	}
	void setNewBroadphaseProxy(btBroadphaseProxy* broadphaseProxy)
	{
		m_broadphaseHandle = broadphaseProxy;
	}

	//btMotionState allows to automatic synchronize the world transform for active objects
	btMotionState* getMotionState()
	{
		return m_optionalMotionState;
	}
	const btMotionState* getMotionState() const
	{
		return m_optionalMotionState;
	}
	void setMotionState(btMotionState* motionState)
	{
		m_optionalMotionState = motionState;
		if (m_optionalMotionState)
			motionState->getWorldTransform(m_worldTransform);
	}

	//for experimental overriding of friction/contact solver func
	int m_contactSolverType;
	int m_frictionSolverType;

	void setAngularFactor(const btVector3& angFac)
	{
		m_updateRevision++;
		m_angularFactor = angFac;
	}

	void setAngularFactor(btScalar angFac)
	{
		m_updateRevision++;
		m_angularFactor.setValue(angFac, angFac, angFac);
	}
	const btVector3& getAngularFactor() const
	{
		return m_angularFactor;
	}

	//is this rigidbody added to a btCollisionWorld/btDynamicsWorld/btBroadphase?
	bool isInWorld() const
	{
		return (getBroadphaseProxy() != 0);
	}

	void addConstraintRef(btTypedConstraint* c);
	void removeConstraintRef(btTypedConstraint* c);

	btTypedConstraint* getConstraintRef(int index)
	{
		return m_constraintRefs[index];
	}

	int getNumConstraintRefs() const
	{
		return m_constraintRefs.size();
	}

	void setFlags(int flags)
	{
		m_rigidbodyFlags = flags;
	}

	int getFlags() const
	{
		return m_rigidbodyFlags;
	}

	///perform implicit force computation in world space
	btVector3 computeGyroscopicImpulseImplicit_World(btScalar dt) const;

	///perform implicit force computation in body space (inertial frame)
	btVector3 computeGyroscopicImpulseImplicit_Body(btScalar step) const;

	///explicit version is best avoided, it gains energy
	btVector3 computeGyroscopicForceExplicit(btScalar maxGyroscopicForce) const;
	btVector3 getLocalInertia() const;

	///////////////////////////////////////////////

	virtual int calculateSerializeBufferSize() const;

	///fills the dataBuffer and returns the struct name (and 0 on failure)
	virtual const char* serialize(void* dataBuffer, class btSerializer* serializer) const;

	virtual void serializeSingleObject(class btSerializer* serializer) const;
};


```


### btCollisionObject

btCollisionObject maintains all information that is needed for a collision detection: Shape, Transform and AABB proxy.
They can be added to the btCollisionWorld.

``` c++
ATTRIBUTE_ALIGNED16(class)
btCollisionObject
{
protected:
	btTransform m_worldTransform;

	///m_interpolationWorldTransform is used for CCD and interpolation
	///it can be either previous or future (predicted) transform
	btTransform m_interpolationWorldTransform;
	//those two are experimental: just added for bullet time effect, so you can still apply impulses (directly modifying velocities)
	//without destroying the continuous interpolated motion (which uses this interpolation velocities)
	btVector3 m_interpolationLinearVelocity;
	btVector3 m_interpolationAngularVelocity;

	btVector3 m_anisotropicFriction;
	int m_hasAnisotropicFriction;
	btScalar m_contactProcessingThreshold;

	btBroadphaseProxy* m_broadphaseHandle;
	btCollisionShape* m_collisionShape;
	///m_extensionPointer is used by some internal low-level Bullet extensions.
	void* m_extensionPointer;

	///m_rootCollisionShape is temporarily used to store the original collision shape
	///The m_collisionShape might be temporarily replaced by a child collision shape during collision detection purposes
	///If it is NULL, the m_collisionShape is not temporarily replaced.
	btCollisionShape* m_rootCollisionShape;

	int m_collisionFlags;

	int m_islandTag1;
	int m_companionId;
	int m_worldArrayIndex;  // index of object in world's collisionObjects array

	mutable int m_activationState1;
	mutable btScalar m_deactivationTime;

	btScalar m_friction;
	btScalar m_restitution;
	btScalar m_rollingFriction;   //torsional friction orthogonal to contact normal (useful to stop spheres rolling forever)
	btScalar m_spinningFriction;  // torsional friction around the contact normal (useful for grasping)
	btScalar m_contactDamping;
	btScalar m_contactStiffness;

	///m_internalType is reserved to distinguish Bullet's btCollisionObject, btRigidBody, btSoftBody, btGhostObject etc.
	///do not assign your own m_internalType unless you write a new dynamics object class.
	int m_internalType;

	///users can point to their objects, m_userPointer is not used by Bullet, see setUserPointer/getUserPointer

	void* m_userObjectPointer;

	int m_userIndex2;

	int m_userIndex;

	int m_userIndex3;

	///time of impact calculation
	btScalar m_hitFraction;

	///Swept sphere radius (0.0 by default), see btConvexConvexAlgorithm::
	btScalar m_ccdSweptSphereRadius;

	/// Don't do continuous collision detection if the motion (in one step) is less then m_ccdMotionThreshold
	btScalar m_ccdMotionThreshold;

	/// If some object should have elaborate collision filtering by sub-classes
	int m_checkCollideWith;

	btAlignedObjectArray<const btCollisionObject*> m_objectsWithoutCollisionCheck;

	///internal update revision number. It will be increased when the object changes. This allows some subsystems to perform lazy evaluation.
	int m_updateRevision;

	btVector3 m_customDebugColorRGB;

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	enum CollisionFlags
	{
		CF_DYNAMIC_OBJECT = 0,
		CF_STATIC_OBJECT = 1,
		CF_KINEMATIC_OBJECT = 2,
		CF_NO_CONTACT_RESPONSE = 4,
		CF_CUSTOM_MATERIAL_CALLBACK = 8,  //this allows per-triangle material (friction/restitution)
		CF_CHARACTER_OBJECT = 16,
		CF_DISABLE_VISUALIZE_OBJECT = 32,          //disable debug drawing
		CF_DISABLE_SPU_COLLISION_PROCESSING = 64,  //disable parallel/SPU processing
		CF_HAS_CONTACT_STIFFNESS_DAMPING = 128,
		CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR = 256,
		CF_HAS_FRICTION_ANCHOR = 512,
		CF_HAS_COLLISION_SOUND_TRIGGER = 1024
	};

	enum CollisionObjectTypes
	{
		CO_COLLISION_OBJECT = 1,
		CO_RIGID_BODY = 2,
		///CO_GHOST_OBJECT keeps track of all objects overlapping its AABB and that pass its collision filter
		///It is useful for collision sensors, explosion objects, character controller etc.
		CO_GHOST_OBJECT = 4,
		CO_SOFT_BODY = 8,
		CO_HF_FLUID = 16,
		CO_USER_TYPE = 32,
		CO_FEATHERSTONE_LINK = 64
	};

	enum AnisotropicFrictionFlags
	{
		CF_ANISOTROPIC_FRICTION_DISABLED = 0,
		CF_ANISOTROPIC_FRICTION = 1,
		CF_ANISOTROPIC_ROLLING_FRICTION = 2
	};

	SIMD_FORCE_INLINE bool mergesSimulationIslands() const
	{
		///static objects, kinematic and object without contact response don't merge islands
		return ((m_collisionFlags & (CF_STATIC_OBJECT | CF_KINEMATIC_OBJECT | CF_NO_CONTACT_RESPONSE)) == 0);
	}

	const btVector3& getAnisotropicFriction() const
	{
		return m_anisotropicFriction;
	}
	void setAnisotropicFriction(const btVector3& anisotropicFriction, int frictionMode = CF_ANISOTROPIC_FRICTION)
	{
		m_anisotropicFriction = anisotropicFriction;
		bool isUnity = (anisotropicFriction[0] != 1.f) || (anisotropicFriction[1] != 1.f) || (anisotropicFriction[2] != 1.f);
		m_hasAnisotropicFriction = isUnity ? frictionMode : 0;
	}
	bool hasAnisotropicFriction(int frictionMode = CF_ANISOTROPIC_FRICTION) const
	{
		return (m_hasAnisotropicFriction & frictionMode) != 0;
	}

	///the constraint solver can discard solving contacts, if the distance is above this threshold. 0 by default.
	///Note that using contacts with positive distance can improve stability. It increases, however, the chance of colliding with degerate contacts, such as 'interior' triangle edges
	void setContactProcessingThreshold(btScalar contactProcessingThreshold)
	{
		m_contactProcessingThreshold = contactProcessingThreshold;
	}
	btScalar getContactProcessingThreshold() const
	{
		return m_contactProcessingThreshold;
	}

	SIMD_FORCE_INLINE bool isStaticObject() const
	{
		return (m_collisionFlags & CF_STATIC_OBJECT) != 0;
	}

	SIMD_FORCE_INLINE bool isKinematicObject() const
	{
		return (m_collisionFlags & CF_KINEMATIC_OBJECT) != 0;
	}

	SIMD_FORCE_INLINE bool isStaticOrKinematicObject() const
	{
		return (m_collisionFlags & (CF_KINEMATIC_OBJECT | CF_STATIC_OBJECT)) != 0;
	}

	SIMD_FORCE_INLINE bool hasContactResponse() const
	{
		return (m_collisionFlags & CF_NO_CONTACT_RESPONSE) == 0;
	}

	btCollisionObject();

	virtual ~btCollisionObject();

	virtual void setCollisionShape(btCollisionShape * collisionShape)
	{
		m_updateRevision++;
		m_collisionShape = collisionShape;
		m_rootCollisionShape = collisionShape;
	}

	SIMD_FORCE_INLINE const btCollisionShape* getCollisionShape() const
	{
		return m_collisionShape;
	}

	SIMD_FORCE_INLINE btCollisionShape* getCollisionShape()
	{
		return m_collisionShape;
	}

	void setIgnoreCollisionCheck(const btCollisionObject* co, bool ignoreCollisionCheck)
	{
		if (ignoreCollisionCheck)
		{
			//We don't check for duplicates. Is it ok to leave that up to the user of this API?
			//int index = m_objectsWithoutCollisionCheck.findLinearSearch(co);
			//if (index == m_objectsWithoutCollisionCheck.size())
			//{
			m_objectsWithoutCollisionCheck.push_back(co);
			//}
		}
		else
		{
			m_objectsWithoutCollisionCheck.remove(co);
		}
		m_checkCollideWith = m_objectsWithoutCollisionCheck.size() > 0;
	}

        int getNumObjectsWithoutCollision() const
	{
		return m_objectsWithoutCollisionCheck.size();
	}

	const btCollisionObject* getObjectWithoutCollision(int index)
	{
		return m_objectsWithoutCollisionCheck[index];
	}

	virtual bool checkCollideWithOverride(const btCollisionObject* co) const
	{
		int index = m_objectsWithoutCollisionCheck.findLinearSearch(co);
		if (index < m_objectsWithoutCollisionCheck.size())
		{
			return false;
		}
		return true;
	}

	///Avoid using this internal API call, the extension pointer is used by some Bullet extensions.
	///If you need to store your own user pointer, use 'setUserPointer/getUserPointer' instead.
	void* internalGetExtensionPointer() const
	{
		return m_extensionPointer;
	}
	///Avoid using this internal API call, the extension pointer is used by some Bullet extensions
	///If you need to store your own user pointer, use 'setUserPointer/getUserPointer' instead.
	void internalSetExtensionPointer(void* pointer)
	{
		m_extensionPointer = pointer;
	}

	SIMD_FORCE_INLINE int getActivationState() const { return m_activationState1; }

	void setActivationState(int newState) const;

	void setDeactivationTime(btScalar time)
	{
		m_deactivationTime = time;
	}
	btScalar getDeactivationTime() const
	{
		return m_deactivationTime;
	}

	void forceActivationState(int newState) const;

	void activate(bool forceActivation = false) const;

	SIMD_FORCE_INLINE bool isActive() const
	{
		return ((getActivationState() != FIXED_BASE_MULTI_BODY) && (getActivationState() != ISLAND_SLEEPING) && (getActivationState() != DISABLE_SIMULATION));
	}

	void setRestitution(btScalar rest)
	{
		m_updateRevision++;
		m_restitution = rest;
	}
	btScalar getRestitution() const
	{
		return m_restitution;
	}
	void setFriction(btScalar frict)
	{
		m_updateRevision++;
		m_friction = frict;
	}
	btScalar getFriction() const
	{
		return m_friction;
	}

	void setRollingFriction(btScalar frict)
	{
		m_updateRevision++;
		m_rollingFriction = frict;
	}
	btScalar getRollingFriction() const
	{
		return m_rollingFriction;
	}
	void setSpinningFriction(btScalar frict)
	{
		m_updateRevision++;
		m_spinningFriction = frict;
	}
	btScalar getSpinningFriction() const
	{
		return m_spinningFriction;
	}
	void setContactStiffnessAndDamping(btScalar stiffness, btScalar damping)
	{
		m_updateRevision++;
		m_contactStiffness = stiffness;
		m_contactDamping = damping;

		m_collisionFlags |= CF_HAS_CONTACT_STIFFNESS_DAMPING;

		//avoid divisions by zero...
		if (m_contactStiffness < SIMD_EPSILON)
		{
			m_contactStiffness = SIMD_EPSILON;
		}
	}

	btScalar getContactStiffness() const
	{
		return m_contactStiffness;
	}

	btScalar getContactDamping() const
	{
		return m_contactDamping;
	}

	///reserved for Bullet internal usage
	int getInternalType() const
	{
		return m_internalType;
	}

	btTransform& getWorldTransform()
	{
		return m_worldTransform;
	}

	const btTransform& getWorldTransform() const
	{
		return m_worldTransform;
	}

	void setWorldTransform(const btTransform& worldTrans)
	{
		m_updateRevision++;
		m_worldTransform = worldTrans;
	}

	SIMD_FORCE_INLINE btBroadphaseProxy* getBroadphaseHandle()
	{
		return m_broadphaseHandle;
	}

	SIMD_FORCE_INLINE const btBroadphaseProxy* getBroadphaseHandle() const
	{
		return m_broadphaseHandle;
	}

	void setBroadphaseHandle(btBroadphaseProxy * handle)
	{
		m_broadphaseHandle = handle;
	}

	const btTransform& getInterpolationWorldTransform() const
	{
		return m_interpolationWorldTransform;
	}

	btTransform& getInterpolationWorldTransform()
	{
		return m_interpolationWorldTransform;
	}

	void setInterpolationWorldTransform(const btTransform& trans)
	{
		m_updateRevision++;
		m_interpolationWorldTransform = trans;
	}

	void setInterpolationLinearVelocity(const btVector3& linvel)
	{
		m_updateRevision++;
		m_interpolationLinearVelocity = linvel;
	}

	void setInterpolationAngularVelocity(const btVector3& angvel)
	{
		m_updateRevision++;
		m_interpolationAngularVelocity = angvel;
	}

	const btVector3& getInterpolationLinearVelocity() const
	{
		return m_interpolationLinearVelocity;
	}

	const btVector3& getInterpolationAngularVelocity() const
	{
		return m_interpolationAngularVelocity;
	}

	SIMD_FORCE_INLINE int getIslandTag() const
	{
		return m_islandTag1;
	}

	void setIslandTag(int tag)
	{
		m_islandTag1 = tag;
	}

	SIMD_FORCE_INLINE int getCompanionId() const
	{
		return m_companionId;
	}

	void setCompanionId(int id)
	{
		m_companionId = id;
	}

	SIMD_FORCE_INLINE int getWorldArrayIndex() const
	{
		return m_worldArrayIndex;
	}

	// only should be called by CollisionWorld
	void setWorldArrayIndex(int ix)
	{
		m_worldArrayIndex = ix;
	}

	SIMD_FORCE_INLINE btScalar getHitFraction() const
	{
		return m_hitFraction;
	}

	void setHitFraction(btScalar hitFraction)
	{
		m_hitFraction = hitFraction;
	}

	SIMD_FORCE_INLINE int getCollisionFlags() const
	{
		return m_collisionFlags;
	}

	void setCollisionFlags(int flags)
	{
		m_collisionFlags = flags;
	}

	///Swept sphere radius (0.0 by default), see btConvexConvexAlgorithm::
	btScalar getCcdSweptSphereRadius() const
	{
		return m_ccdSweptSphereRadius;
	}

	///Swept sphere radius (0.0 by default), see btConvexConvexAlgorithm::
	void setCcdSweptSphereRadius(btScalar radius)
	{
		m_ccdSweptSphereRadius = radius;
	}

	btScalar getCcdMotionThreshold() const
	{
		return m_ccdMotionThreshold;
	}

	btScalar getCcdSquareMotionThreshold() const
	{
		return m_ccdMotionThreshold * m_ccdMotionThreshold;
	}

	/// Don't do continuous collision detection if the motion (in one step) is less then m_ccdMotionThreshold
	void setCcdMotionThreshold(btScalar ccdMotionThreshold)
	{
		m_ccdMotionThreshold = ccdMotionThreshold;
	}

	///users can point to their objects, userPointer is not used by Bullet
	void* getUserPointer() const
	{
		return m_userObjectPointer;
	}

	int getUserIndex() const
	{
		return m_userIndex;
	}

	int getUserIndex2() const
	{
		return m_userIndex2;
	}

	int getUserIndex3() const
	{
		return m_userIndex3;
	}

	///users can point to their objects, userPointer is not used by Bullet
	void setUserPointer(void* userPointer)
	{
		m_userObjectPointer = userPointer;
	}

	///users can point to their objects, userPointer is not used by Bullet
	void setUserIndex(int index)
	{
		m_userIndex = index;
	}

	void setUserIndex2(int index)
	{
		m_userIndex2 = index;
	}

	void setUserIndex3(int index)
	{
		m_userIndex3 = index;
	}

	int getUpdateRevisionInternal() const
	{
		return m_updateRevision;
	}

	void setCustomDebugColor(const btVector3& colorRGB)
	{
		m_customDebugColorRGB = colorRGB;
		m_collisionFlags |= CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
	}

	void removeCustomDebugColor()
	{
		m_collisionFlags &= ~CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR;
	}

	bool getCustomDebugColor(btVector3 & colorRGB) const
	{
		bool hasCustomColor = (0 != (m_collisionFlags & CF_HAS_CUSTOM_DEBUG_RENDERING_COLOR));
		if (hasCustomColor)
		{
			colorRGB = m_customDebugColorRGB;
		}
		return hasCustomColor;
	}

	inline bool checkCollideWith(const btCollisionObject* co) const
	{
		if (m_checkCollideWith)
			return checkCollideWithOverride(co);

		return true;
	}

	virtual int calculateSerializeBufferSize() const;

	///fills the dataBuffer and returns the struct name (and 0 on failure)
	virtual const char* serialize(void* dataBuffer, class btSerializer* serializer) const;

	virtual void serializeSingleObject(class btSerializer * serializer) const;
};

```

### btDispatcherInfo

``` c++
struct btDispatcherInfo
{
	enum DispatchFunc
	{
		DISPATCH_DISCRETE = 1,
		DISPATCH_CONTINUOUS
	};
	btDispatcherInfo()
		: m_timeStep(btScalar(0.)),
		  m_stepCount(0),
		  m_dispatchFunc(DISPATCH_DISCRETE),
		  m_timeOfImpact(btScalar(1.)),
		  m_useContinuous(true),
		  m_debugDraw(0),
		  m_enableSatConvex(false),
		  m_enableSPU(true),
		  m_useEpa(true),
		  m_allowedCcdPenetration(btScalar(0.04)),
		  m_useConvexConservativeDistanceUtil(false),
		  m_convexConservativeDistanceThreshold(0.0f),
		  m_deterministicOverlappingPairs(false)
	{
	}
	btScalar m_timeStep;
	int m_stepCount;
	int m_dispatchFunc;
	mutable btScalar m_timeOfImpact;
	bool m_useContinuous;
	class btIDebugDraw* m_debugDraw;
	bool m_enableSatConvex;
	bool m_enableSPU;
	bool m_useEpa;
	btScalar m_allowedCcdPenetration;
	bool m_useConvexConservativeDistanceUtil;
	btScalar m_convexConservativeDistanceThreshold;
	bool m_deterministicOverlappingPairs;
};
```

### btPersistentManifold

``` c++


///btPersistentManifold is a contact point cache, it stays persistent as long as objects are overlapping in the broadphase.
///Those contact points are created by the collision narrow phase.
///The cache can be empty, or hold 1,2,3 or 4 points. Some collision algorithms (GJK) might only add one point at a time.
///updates/refreshes old contact points, and throw them away if necessary (distance becomes too large)
///reduces the cache to 4 points, when more then 4 points are added, using following rules:
///the contact point with deepest penetration is always kept, and it tries to maximuze the area covered by the points
///note that some pairs of objects might have more then one contact manifold.

//ATTRIBUTE_ALIGNED128( class) btPersistentManifold : public btTypedObject
ATTRIBUTE_ALIGNED16(class)
btPersistentManifold : public btTypedObject
{
	btManifoldPoint m_pointCache[MANIFOLD_CACHE_SIZE];

	/// this two body pointers can point to the physics rigidbody class.
	const btCollisionObject* m_body0;
	const btCollisionObject* m_body1;

	int m_cachedPoints;

	btScalar m_contactBreakingThreshold;
	btScalar m_contactProcessingThreshold;

	/// sort cached points so most isolated points come first
	int sortCachedPoints(const btManifoldPoint& pt);

	int findContactPoint(const btManifoldPoint* unUsed, int numUnused, const btManifoldPoint& pt);

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	int m_companionIdA;
	int m_companionIdB;

	int m_index1a;

	btPersistentManifold();

	btPersistentManifold(const btCollisionObject* body0, const btCollisionObject* body1, int, btScalar contactBreakingThreshold, btScalar contactProcessingThreshold)
		: btTypedObject(BT_PERSISTENT_MANIFOLD_TYPE),
		  m_body0(body0),
		  m_body1(body1),
		  m_cachedPoints(0),
		  m_contactBreakingThreshold(contactBreakingThreshold),
		  m_contactProcessingThreshold(contactProcessingThreshold),
		  m_companionIdA(0),
		  m_companionIdB(0),
		  m_index1a(0)
	{
	}

	SIMD_FORCE_INLINE const btCollisionObject* getBody0() const { return m_body0; }
	SIMD_FORCE_INLINE const btCollisionObject* getBody1() const { return m_body1; }

	void setBodies(const btCollisionObject* body0, const btCollisionObject* body1)
	{
		m_body0 = body0;
		m_body1 = body1;
	}

	void clearUserCache(btManifoldPoint & pt);

#ifdef DEBUG_PERSISTENCY
	void DebugPersistency();
#endif  //

	SIMD_FORCE_INLINE int getNumContacts() const
	{
		return m_cachedPoints;
	}
	/// the setNumContacts API is usually not used, except when you gather/fill all contacts manually
	void setNumContacts(int cachedPoints)
	{
		m_cachedPoints = cachedPoints;
	}

	SIMD_FORCE_INLINE const btManifoldPoint& getContactPoint(int index) const
	{
		btAssert(index < m_cachedPoints);
		return m_pointCache[index];
	}

	SIMD_FORCE_INLINE btManifoldPoint& getContactPoint(int index)
	{
		btAssert(index < m_cachedPoints);
		return m_pointCache[index];
	}

	///@todo: get this margin from the current physics / collision environment
	btScalar getContactBreakingThreshold() const;

	btScalar getContactProcessingThreshold() const
	{
		return m_contactProcessingThreshold;
	}

	void setContactBreakingThreshold(btScalar contactBreakingThreshold)
	{
		m_contactBreakingThreshold = contactBreakingThreshold;
	}

	void setContactProcessingThreshold(btScalar contactProcessingThreshold)
	{
		m_contactProcessingThreshold = contactProcessingThreshold;
	}

	int getCacheEntry(const btManifoldPoint& newPoint) const;

	int addManifoldPoint(const btManifoldPoint& newPoint, bool isPredictive = false);

	void removeContactPoint(int index)
	{
		clearUserCache(m_pointCache[index]);

		int lastUsedIndex = getNumContacts() - 1;
		//		m_pointCache[index] = m_pointCache[lastUsedIndex];
		if (index != lastUsedIndex)
		{
			m_pointCache[index] = m_pointCache[lastUsedIndex];
			//get rid of duplicated userPersistentData pointer
			m_pointCache[lastUsedIndex].m_userPersistentData = 0;
			m_pointCache[lastUsedIndex].m_appliedImpulse = 0.f;
			m_pointCache[lastUsedIndex].m_prevRHS = 0.f;
			m_pointCache[lastUsedIndex].m_contactPointFlags = 0;
			m_pointCache[lastUsedIndex].m_appliedImpulseLateral1 = 0.f;
			m_pointCache[lastUsedIndex].m_appliedImpulseLateral2 = 0.f;
			m_pointCache[lastUsedIndex].m_lifeTime = 0;
		}

		btAssert(m_pointCache[lastUsedIndex].m_userPersistentData == 0);
		m_cachedPoints--;

		if (gContactEndedCallback && m_cachedPoints == 0)
		{
			gContactEndedCallback(this);
		}
	}
	void replaceContactPoint(const btManifoldPoint& newPoint, int insertIndex)
	{
		btAssert(validContactDistance(newPoint));

#define MAINTAIN_PERSISTENCY 1
#ifdef MAINTAIN_PERSISTENCY
		int lifeTime = m_pointCache[insertIndex].getLifeTime();
		btScalar appliedImpulse = m_pointCache[insertIndex].m_appliedImpulse;
		btScalar prevRHS = m_pointCache[insertIndex].m_prevRHS;
		btScalar appliedLateralImpulse1 = m_pointCache[insertIndex].m_appliedImpulseLateral1;
		btScalar appliedLateralImpulse2 = m_pointCache[insertIndex].m_appliedImpulseLateral2;

		bool replacePoint = true;
		///we keep existing contact points for friction anchors
		///if the friction force is within the Coulomb friction cone
		if (newPoint.m_contactPointFlags & BT_CONTACT_FLAG_FRICTION_ANCHOR)
		{
			//   printf("appliedImpulse=%f\n", appliedImpulse);
			//   printf("appliedLateralImpulse1=%f\n", appliedLateralImpulse1);
			//   printf("appliedLateralImpulse2=%f\n", appliedLateralImpulse2);
			//   printf("mu = %f\n", m_pointCache[insertIndex].m_combinedFriction);
			btScalar mu = m_pointCache[insertIndex].m_combinedFriction;
			btScalar eps = 0;  //we could allow to enlarge or shrink the tolerance to check against the friction cone a bit, say 1e-7
			btScalar a = appliedLateralImpulse1 * appliedLateralImpulse1 + appliedLateralImpulse2 * appliedLateralImpulse2;
			btScalar b = eps + mu * appliedImpulse;
			b = b * b;
			replacePoint = (a) > (b);
		}

		if (replacePoint)
		{
			btAssert(lifeTime >= 0);
			void* cache = m_pointCache[insertIndex].m_userPersistentData;

			m_pointCache[insertIndex] = newPoint;
			m_pointCache[insertIndex].m_userPersistentData = cache;
			m_pointCache[insertIndex].m_appliedImpulse = appliedImpulse;
			m_pointCache[insertIndex].m_prevRHS = prevRHS;
			m_pointCache[insertIndex].m_appliedImpulseLateral1 = appliedLateralImpulse1;
			m_pointCache[insertIndex].m_appliedImpulseLateral2 = appliedLateralImpulse2;
		}

		m_pointCache[insertIndex].m_lifeTime = lifeTime;
#else
		clearUserCache(m_pointCache[insertIndex]);
		m_pointCache[insertIndex] = newPoint;

#endif
	}

	bool validContactDistance(const btManifoldPoint& pt) const
	{
		return pt.m_distance1 <= getContactBreakingThreshold();
	}
	/// calculated new worldspace coordinates and depth, and reject points that exceed the collision margin
	void refreshContactPoints(const btTransform& trA, const btTransform& trB);

	SIMD_FORCE_INLINE void clearManifold()
	{
		int i;
		for (i = 0; i < m_cachedPoints; i++)
		{
			clearUserCache(m_pointCache[i]);
		}

		if (gContactEndedCallback && m_cachedPoints)
		{
			gContactEndedCallback(this);
		}
		m_cachedPoints = 0;
	}

	int calculateSerializeBufferSize() const;
	const char* serialize(const class btPersistentManifold* manifold, void* dataBuffer, class btSerializer* serializer) const;
	void deSerialize(const struct btPersistentManifoldDoubleData* manifoldDataPtr);
	void deSerialize(const struct btPersistentManifoldFloatData* manifoldDataPtr);
};

```

### btCollisionDispatcher

``` c++

class btCollisionDispatcher;
///user can override this nearcallback for collision filtering and more finegrained control over collision detection
typedef void (*btNearCallback)(btBroadphasePair& collisionPair, btCollisionDispatcher& dispatcher, const btDispatcherInfo& dispatchInfo);

///btCollisionDispatcher supports algorithms that handle ConvexConvex and ConvexConcave collision pairs.
///Time of Impact, Closest Points and Penetration Depth.
class btCollisionDispatcher : public btDispatcher
{
protected:
	int m_dispatcherFlags;

	btAlignedObjectArray<btPersistentManifold*> m_manifoldsPtr;

	btNearCallback m_nearCallback;

	btPoolAllocator* m_collisionAlgorithmPoolAllocator;

	btPoolAllocator* m_persistentManifoldPoolAllocator;

	btCollisionAlgorithmCreateFunc* m_doubleDispatchContactPoints[MAX_BROADPHASE_COLLISION_TYPES][MAX_BROADPHASE_COLLISION_TYPES];

	btCollisionAlgorithmCreateFunc* m_doubleDispatchClosestPoints[MAX_BROADPHASE_COLLISION_TYPES][MAX_BROADPHASE_COLLISION_TYPES];

	btCollisionConfiguration* m_collisionConfiguration;

public:
	enum DispatcherFlags
	{
		CD_STATIC_STATIC_REPORTED = 1,
		CD_USE_RELATIVE_CONTACT_BREAKING_THRESHOLD = 2,
		CD_DISABLE_CONTACTPOOL_DYNAMIC_ALLOCATION = 4
	};

	int getDispatcherFlags() const
	{
		return m_dispatcherFlags;
	}

	void setDispatcherFlags(int flags)
	{
		m_dispatcherFlags = flags;
	}

	///registerCollisionCreateFunc allows registration of custom/alternative collision create functions
	void registerCollisionCreateFunc(int proxyType0, int proxyType1, btCollisionAlgorithmCreateFunc* createFunc);

	void registerClosestPointsCreateFunc(int proxyType0, int proxyType1, btCollisionAlgorithmCreateFunc* createFunc);

	int getNumManifolds() const
	{
		return int(m_manifoldsPtr.size());
	}

	btPersistentManifold** getInternalManifoldPointer()
	{
		return m_manifoldsPtr.size() ? &m_manifoldsPtr[0] : 0;
	}

	btPersistentManifold* getManifoldByIndexInternal(int index)
	{
		btAssert(index>=0);
		btAssert(index<m_manifoldsPtr.size());
		return m_manifoldsPtr[index];
	}

	const btPersistentManifold* getManifoldByIndexInternal(int index) const
	{
		btAssert(index>=0);
		btAssert(index<m_manifoldsPtr.size());
		return m_manifoldsPtr[index];
	}

	btCollisionDispatcher(btCollisionConfiguration* collisionConfiguration);

	virtual ~btCollisionDispatcher();

	virtual btPersistentManifold* getNewManifold(const btCollisionObject* b0, const btCollisionObject* b1);

	virtual void releaseManifold(btPersistentManifold* manifold);

	virtual void clearManifold(btPersistentManifold* manifold);

	btCollisionAlgorithm* findAlgorithm(const btCollisionObjectWrapper* body0Wrap, const btCollisionObjectWrapper* body1Wrap, btPersistentManifold* sharedManifold, ebtDispatcherQueryType queryType);

	virtual bool needsCollision(const btCollisionObject* body0, const btCollisionObject* body1);

	virtual bool needsResponse(const btCollisionObject* body0, const btCollisionObject* body1);

	virtual void dispatchAllCollisionPairs(btOverlappingPairCache* pairCache, const btDispatcherInfo& dispatchInfo, btDispatcher* dispatcher);

	void setNearCallback(btNearCallback nearCallback)
	{
		m_nearCallback = nearCallback;
	}

	btNearCallback getNearCallback() const
	{
		return m_nearCallback;
	}

	//by default, Bullet will use this near callback
	static void defaultNearCallback(btBroadphasePair& collisionPair, btCollisionDispatcher& dispatcher, const btDispatcherInfo& dispatchInfo);

	virtual void* allocateCollisionAlgorithm(int size);

	virtual void freeCollisionAlgorithm(void* ptr);

	btCollisionConfiguration* getCollisionConfiguration()
	{
		return m_collisionConfiguration;
	}

	const btCollisionConfiguration* getCollisionConfiguration() const
	{
		return m_collisionConfiguration;
	}

	void setCollisionConfiguration(btCollisionConfiguration* config)
	{
		m_collisionConfiguration = config;
	}

	virtual btPoolAllocator* getInternalManifoldPool()
	{
		return m_persistentManifoldPoolAllocator;
	}

	virtual const btPoolAllocator* getInternalManifoldPool() const
	{
		return m_persistentManifoldPoolAllocator;
	}
};
```

### btClosestNotMeConvexResultCallback : public btCollisionWorld::ClosestConvexResultCallback

``` c++

class btClosestNotMeConvexResultCallback : public btCollisionWorld::ClosestConvexResultCallback
{
public:
	btCollisionObject* m_me;
	btScalar m_allowedPenetration;
	btOverlappingPairCache* m_pairCache;
	btDispatcher* m_dispatcher;

public:
	btClosestNotMeConvexResultCallback(btCollisionObject* me, const btVector3& fromA, const btVector3& toA, btOverlappingPairCache* pairCache, btDispatcher* dispatcher) : btCollisionWorld::ClosestConvexResultCallback(fromA, toA),
																																										   m_me(me),
																																										   m_allowedPenetration(0.0f),
																																										   m_pairCache(pairCache),
																																										   m_dispatcher(dispatcher)
	{
	}

	virtual btScalar addSingleResult(btCollisionWorld::LocalConvexResult& convexResult, bool normalInWorldSpace)
	{
		if (convexResult.m_hitCollisionObject == m_me)
			return 1.0f;

		//ignore result if there is no contact response
		if (!convexResult.m_hitCollisionObject->hasContactResponse())
			return 1.0f;

		btVector3 linVelA, linVelB;
		linVelA = m_convexToWorld - m_convexFromWorld;
		linVelB = btVector3(0, 0, 0);  //toB.getOrigin()-fromB.getOrigin();

		btVector3 relativeVelocity = (linVelA - linVelB);
		//don't report time of impact for motion away from the contact normal (or causes minor penetration)
		if (convexResult.m_hitNormalLocal.dot(relativeVelocity) >= -m_allowedPenetration)
			return 1.f;

		return ClosestConvexResultCallback::addSingleResult(convexResult, normalInWorldSpace);
	}

	virtual bool needsCollision(btBroadphaseProxy* proxy0) const
	{
		//don't collide with itself
		if (proxy0->m_clientObject == m_me)
			return false;

		///don't do CCD when the collision filters are not matching
		if (!ClosestConvexResultCallback::needsCollision(proxy0))
			return false;
		if (m_pairCache->getOverlapFilterCallback()) {
			btBroadphaseProxy* proxy1 = m_me->getBroadphaseHandle();
			bool collides = m_pairCache->needsBroadphaseCollision(proxy0, proxy1);
			if (!collides)
			{
				return false;
			}
		}

		btCollisionObject* otherObj = (btCollisionObject*)proxy0->m_clientObject;

		if (!m_dispatcher->needsCollision(m_me, otherObj))
			return false;

		//call needsResponse, see http://code.google.com/p/bullet/issues/detail?id=179
		if (m_dispatcher->needsResponse(m_me, otherObj))
		{
#if 0
			///don't do CCD when there are already contact points (touching contact/penetration)
			btAlignedObjectArray<btPersistentManifold*> manifoldArray;
			btBroadphasePair* collisionPair = m_pairCache->findPair(m_me->getBroadphaseHandle(),proxy0);
			if (collisionPair)
			{
				if (collisionPair->m_algorithm)
				{
					manifoldArray.resize(0);
					collisionPair->m_algorithm->getAllContactManifolds(manifoldArray);
					for (int j=0;j<manifoldArray.size();j++)
					{
						btPersistentManifold* manifold = manifoldArray[j];
						if (manifold->getNumContacts()>0)
							return false;
					}
				}
			}
#endif
			return true;
		}

		return false;
	}
};
```

#### ClosestConvexResultCallback
#### ConvexResultCallback

``` c++
struct ClosestConvexResultCallback : public ConvexResultCallback
	{
		ClosestConvexResultCallback(const btVector3& convexFromWorld, const btVector3& convexToWorld)
			: m_convexFromWorld(convexFromWorld),
			  m_convexToWorld(convexToWorld),
			  m_hitCollisionObject(0)
		{
		}

		btVector3 m_convexFromWorld;  //used to calculate hitPointWorld from hitFraction
		btVector3 m_convexToWorld;

		btVector3 m_hitNormalWorld;
		btVector3 m_hitPointWorld;
		const btCollisionObject* m_hitCollisionObject;

		virtual btScalar addSingleResult(LocalConvexResult& convexResult, bool normalInWorldSpace)
		{
			//caller already does the filter on the m_closestHitFraction
			btAssert(convexResult.m_hitFraction <= m_closestHitFraction);

			m_closestHitFraction = convexResult.m_hitFraction;
			m_hitCollisionObject = convexResult.m_hitCollisionObject;
			if (normalInWorldSpace)
			{
				m_hitNormalWorld = convexResult.m_hitNormalLocal;
			}
			else
			{
				///need to transform normal into worldspace
				m_hitNormalWorld = m_hitCollisionObject->getWorldTransform().getBasis() * convexResult.m_hitNormalLocal;
			}
			m_hitPointWorld = convexResult.m_hitPointLocal;
			return convexResult.m_hitFraction;
		}
	};

	///ContactResultCallback is used to report contact points
	struct ContactResultCallback
	{
		int m_collisionFilterGroup;
		int m_collisionFilterMask;
		btScalar m_closestDistanceThreshold;

		ContactResultCallback()
			: m_collisionFilterGroup(btBroadphaseProxy::DefaultFilter),
			  m_collisionFilterMask(btBroadphaseProxy::AllFilter),
			  m_closestDistanceThreshold(0)
		{
		}

		virtual ~ContactResultCallback()
		{
		}

		virtual bool needsCollision(btBroadphaseProxy* proxy0) const
		{
			bool collides = (proxy0->m_collisionFilterGroup & m_collisionFilterMask) != 0;
			collides = collides && (m_collisionFilterGroup & proxy0->m_collisionFilterMask);
			return collides;
		}

		virtual btScalar addSingleResult(btManifoldPoint& cp, const btCollisionObjectWrapper* colObj0Wrap, int partId0, int index0, const btCollisionObjectWrapper* colObj1Wrap, int partId1, int index1) = 0;
	};



```

### btContinuousConvexCollision

``` c++

/// btContinuousConvexCollision implements angular and linear time of impact for convex objects.
/// Based on Brian Mirtich's Conservative Advancement idea (PhD thesis).
/// Algorithm operates in worldspace, in order to keep in between motion globally consistent.
/// It uses GJK at the moment. Future improvement would use minkowski sum / supporting vertex, merging innerloops
class btContinuousConvexCollision : public btConvexCast
{
	btSimplexSolverInterface* m_simplexSolver;
	btConvexPenetrationDepthSolver* m_penetrationDepthSolver;
	const btConvexShape* m_convexA;
	//second object is either a convex or a plane (code sharing)
	const btConvexShape* m_convexB1;
	const btStaticPlaneShape* m_planeShape;

	void computeClosestPoints(const btTransform& transA, const btTransform& transB, struct btPointCollector& pointCollector);

public:
	btContinuousConvexCollision(const btConvexShape* shapeA, const btConvexShape* shapeB, btSimplexSolverInterface* simplexSolver, btConvexPenetrationDepthSolver* penetrationDepthSolver);

	btContinuousConvexCollision(const btConvexShape* shapeA, const btStaticPlaneShape* plane);

	virtual bool calcTimeOfImpact(
		const btTransform& fromA,
		const btTransform& toA,
		const btTransform& fromB,
		const btTransform& toB,
		CastResult& result);
};


/// btConvexCast is an interface for Casting
class btConvexCast
{
public:
	virtual ~btConvexCast();

	///RayResult stores the closest result
	/// alternatively, add a callback method to decide about closest/all results
	struct CastResult
	{
		//virtual bool	addRayResult(const btVector3& normal,btScalar	fraction) = 0;

		virtual void DebugDraw(btScalar fraction) { (void)fraction; }
		virtual void drawCoordSystem(const btTransform& trans) { (void)trans; }
		virtual void reportFailure(int errNo, int numIterations)
		{
			(void)errNo;
			(void)numIterations;
		}
		CastResult()
			: m_fraction(btScalar(BT_LARGE_FLOAT)),
			  m_debugDrawer(0),
			  m_allowedPenetration(btScalar(0)),
			  m_subSimplexCastMaxIterations(MAX_CONVEX_CAST_ITERATIONS),
			  m_subSimplexCastEpsilon(MAX_CONVEX_CAST_EPSILON)
		{
		}

		virtual ~CastResult(){};

		btTransform m_hitTransformA;
		btTransform m_hitTransformB;
		btVector3 m_normal;
		btVector3 m_hitPoint;
		btScalar m_fraction;  //input and output
		btIDebugDraw* m_debugDrawer;
		btScalar m_allowedPenetration;
		
		int m_subSimplexCastMaxIterations;
		btScalar m_subSimplexCastEpsilon;

	};

	/// cast a convex against another convex object
	virtual bool calcTimeOfImpact(
		const btTransform& fromA,
		const btTransform& toA,
		const btTransform& fromB,
		const btTransform& toB,
		CastResult& result) = 0;
};

```



### btBvhTriangleMeshShape
``` c++

///The btBvhTriangleMeshShape is a static-triangle mesh shape, it can only be used for fixed/non-moving objects.
///If you required moving concave triangle meshes, it is recommended to perform convex decomposition
///using HACD, see Bullet/Demos/ConvexDecompositionDemo.
///Alternatively, you can use btGimpactMeshShape for moving concave triangle meshes.
///btBvhTriangleMeshShape has several optimizations, such as bounding volume hierarchy and
///cache friendly traversal for PlayStation 3 Cell SPU.
///It is recommended to enable useQuantizedAabbCompression for better memory usage.
///It takes a triangle mesh as input, for example a btTriangleMesh or btTriangleIndexVertexArray. The btBvhTriangleMeshShape class allows for triangle mesh deformations by a refit or partialRefit method.
///Instead of building the bounding volume hierarchy acceleration structure, it is also possible to serialize (save) and deserialize (load) the structure from disk.
///See Demos\ConcaveDemo\ConcavePhysicsDemo.cpp for an example.
btBvhTriangleMeshShape : public btTriangleMeshShape
{
	btOptimizedBvh* m_bvh;
	btTriangleInfoMap* m_triangleInfoMap;

	bool m_useQuantizedAabbCompression;
	bool m_ownsBvh;
#ifdef __clang__
	bool m_pad[11] __attribute__((unused));  ////need padding due to alignment
#else
	bool m_pad[11];  ////need padding due to alignment
#endif

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	btBvhTriangleMeshShape(btStridingMeshInterface * meshInterface, bool useQuantizedAabbCompression, bool buildBvh = true);

	///optionally pass in a larger bvh aabb, used for quantization. This allows for deformations within this aabb
	btBvhTriangleMeshShape(btStridingMeshInterface * meshInterface, bool useQuantizedAabbCompression, const btVector3& bvhAabbMin, const btVector3& bvhAabbMax, bool buildBvh = true);

	virtual ~btBvhTriangleMeshShape();

	bool getOwnsBvh() const
	{
		return m_ownsBvh;
	}

	void performRaycast(btTriangleCallback * callback, const btVector3& raySource, const btVector3& rayTarget);
	void performConvexcast(btTriangleCallback * callback, const btVector3& boxSource, const btVector3& boxTarget, const btVector3& boxMin, const btVector3& boxMax);

	virtual void processAllTriangles(btTriangleCallback * callback, const btVector3& aabbMin, const btVector3& aabbMax) const;

	void refitTree(const btVector3& aabbMin, const btVector3& aabbMax);

	///for a fast incremental refit of parts of the tree. Note: the entire AABB of the tree will become more conservative, it never shrinks
	void partialRefitTree(const btVector3& aabbMin, const btVector3& aabbMax);

	//debugging
	virtual const char* getName() const { return "BVHTRIANGLEMESH"; }

	virtual void setLocalScaling(const btVector3& scaling);

	btOptimizedBvh* getOptimizedBvh()
	{
		return m_bvh;
	}

	void setOptimizedBvh(btOptimizedBvh * bvh, const btVector3& localScaling = btVector3(1, 1, 1));

	void buildOptimizedBvh();

	bool usesQuantizedAabbCompression() const
	{
		return m_useQuantizedAabbCompression;
	}

	void setTriangleInfoMap(btTriangleInfoMap * triangleInfoMap)
	{
		m_triangleInfoMap = triangleInfoMap;
	}

	const btTriangleInfoMap* getTriangleInfoMap() const
	{
		return m_triangleInfoMap;
	}

	btTriangleInfoMap* getTriangleInfoMap()
	{
		return m_triangleInfoMap;
	}

	virtual int calculateSerializeBufferSize() const;

	///fills the dataBuffer and returns the struct name (and 0 on failure)
	virtual const char* serialize(void* dataBuffer, btSerializer* serializer) const;

	virtual void serializeSingleBvh(btSerializer * serializer) const;

	virtual void serializeSingleTriangleInfoMap(btSerializer * serializer) const;
};

```
### btStridingMeshInterfacer

``` c++


///	The btStridingMeshInterface is the interface class for high performance generic access to triangle meshes, used in combination with btBvhTriangleMeshShape and some other collision shapes.
/// Using index striding of 3*sizeof(integer) it can use triangle arrays, using index striding of 1*sizeof(integer) it can handle triangle strips.
/// It allows for sharing graphics and collision meshes. Also it provides locking/unlocking of graphics meshes that are in gpu memory.
ATTRIBUTE_ALIGNED16(class)
btStridingMeshInterface
{
protected:
	btVector3 m_scaling;

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	btStridingMeshInterface() : m_scaling(btScalar(1.), btScalar(1.), btScalar(1.))
	{
	}

	virtual ~btStridingMeshInterface();

	virtual void InternalProcessAllTriangles(btInternalTriangleIndexCallback * callback, const btVector3& aabbMin, const btVector3& aabbMax) const;

	///brute force method to calculate aabb
	void calculateAabbBruteForce(btVector3 & aabbMin, btVector3 & aabbMax);

	/// get read and write access to a subpart of a triangle mesh
	/// this subpart has a continuous array of vertices and indices
	/// in this way the mesh can be handled as chunks of memory with striding
	/// very similar to OpenGL vertexarray support
	/// make a call to unLockVertexBase when the read and write access is finished
	virtual void getLockedVertexIndexBase(unsigned char** vertexbase, int& numverts, PHY_ScalarType& type, int& stride, unsigned char** indexbase, int& indexstride, int& numfaces, PHY_ScalarType& indicestype, int subpart = 0) = 0;

	virtual void getLockedReadOnlyVertexIndexBase(const unsigned char** vertexbase, int& numverts, PHY_ScalarType& type, int& stride, const unsigned char** indexbase, int& indexstride, int& numfaces, PHY_ScalarType& indicestype, int subpart = 0) const = 0;

	/// unLockVertexBase finishes the access to a subpart of the triangle mesh
	/// make a call to unLockVertexBase when the read and write access (using getLockedVertexIndexBase) is finished
	virtual void unLockVertexBase(int subpart) = 0;

	virtual void unLockReadOnlyVertexBase(int subpart) const = 0;

	/// getNumSubParts returns the number of separate subparts
	/// each subpart has a continuous array of vertices and indices
	virtual int getNumSubParts() const = 0;

	virtual void preallocateVertices(int numverts) = 0;
	virtual void preallocateIndices(int numindices) = 0;

	virtual bool hasPremadeAabb() const { return false; }
	virtual void setPremadeAabb(const btVector3& aabbMin, const btVector3& aabbMax) const
	{
		(void)aabbMin;
		(void)aabbMax;
	}
	virtual void getPremadeAabb(btVector3 * aabbMin, btVector3 * aabbMax) const
	{
		(void)aabbMin;
		(void)aabbMax;
	}

	const btVector3& getScaling() const
	{
		return m_scaling;
	}
	void setScaling(const btVector3& scaling)
	{
		m_scaling = scaling;
	}

	virtual int calculateSerializeBufferSize() const;

	///fills the dataBuffer and returns the struct name (and 0 on failure)
	virtual const char* serialize(void* dataBuffer, btSerializer* serializer) const;
};

```

### btStaticPlaneShape


///The btStaticPlaneShape simulates an infinite non-moving (static) collision plane.
ATTRIBUTE_ALIGNED16(class)
btStaticPlaneShape : public btConcaveShape
{
protected:
	btVector3 m_localAabbMin;
	btVector3 m_localAabbMax;

	btVector3 m_planeNormal;
	btScalar m_planeConstant;
	btVector3 m_localScaling;

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	btStaticPlaneShape(const btVector3& planeNormal, btScalar planeConstant);

	virtual ~btStaticPlaneShape();

	virtual void getAabb(const btTransform& t, btVector3& aabbMin, btVector3& aabbMax) const;

	virtual void processAllTriangles(btTriangleCallback * callback, const btVector3& aabbMin, const btVector3& aabbMax) const;

	virtual void calculateLocalInertia(btScalar mass, btVector3 & inertia) const;

	virtual void setLocalScaling(const btVector3& scaling);
	virtual const btVector3& getLocalScaling() const;

	const btVector3& getPlaneNormal() const
	{
		return m_planeNormal;
	}

	const btScalar& getPlaneConstant() const
	{
		return m_planeConstant;
	}

	//debugging
	virtual const char* getName() const { return "STATICPLANE"; }

	virtual int calculateSerializeBufferSize() const;

	///fills the dataBuffer and returns the struct name (and 0 on failure)
	virtual const char* serialize(void* dataBuffer, btSerializer* serializer) const;
};


### btCollisionPairCallback

``` c++

struct btOverlapCallback
{
	virtual ~btOverlapCallback()
	{
	}
	//return true for deletion of the pair
	virtual bool processOverlap(btBroadphasePair& pair) = 0;
};


///interface for iterating all overlapping collision pairs, no matter how those pairs are stored (array, set, map etc)
///this is useful for the collision dispatcher.
class btCollisionPairCallback : public btOverlapCallback
{
	const btDispatcherInfo& m_dispatchInfo;
	btCollisionDispatcher* m_dispatcher;

public:
	btCollisionPairCallback(const btDispatcherInfo& dispatchInfo, btCollisionDispatcher* dispatcher)
		: m_dispatchInfo(dispatchInfo),
		  m_dispatcher(dispatcher)
	{
	}

	/*btCollisionPairCallback& operator=(btCollisionPairCallback& other)
	{
		m_dispatchInfo = other.m_dispatchInfo;
		m_dispatcher = other.m_dispatcher;
		return *this;
	}
	*/

	virtual ~btCollisionPairCallback() {}

	virtual bool processOverlap(btBroadphasePair& pair)
	{
		(*m_dispatcher->getNearCallback())(pair, *m_dispatcher, m_dispatchInfo);
		return false;
	}
};

```
### btSimulationIslandManager

``` c++

///SimulationIslandManager creates and handles simulation islands, using btUnionFind
class btSimulationIslandManager
{
	btUnionFind m_unionFind;

	btAlignedObjectArray<btPersistentManifold*> m_islandmanifold;
	btAlignedObjectArray<btCollisionObject*> m_islandBodies;

	bool m_splitIslands;

public:
	btSimulationIslandManager();
	virtual ~btSimulationIslandManager();

	void initUnionFind(int n);

	btUnionFind& getUnionFind() { return m_unionFind; }

	virtual void updateActivationState(btCollisionWorld* colWorld, btDispatcher* dispatcher);
	virtual void storeIslandActivationState(btCollisionWorld* world);

	void findUnions(btDispatcher* dispatcher, btCollisionWorld* colWorld);

	struct IslandCallback
	{
		virtual ~IslandCallback(){};

		virtual void processIsland(btCollisionObject** bodies, int numBodies, class btPersistentManifold** manifolds, int numManifolds, int islandId) = 0;
	};

	void buildAndProcessIslands(btDispatcher* dispatcher, btCollisionWorld* collisionWorld, IslandCallback* callback);
    
	void buildIslands(btDispatcher* dispatcher, btCollisionWorld* colWorld);

    void processIslands(btDispatcher* dispatcher, btCollisionWorld* collisionWorld, IslandCallback* callback);
    
	bool getSplitIslands()
	{
		return m_splitIslands;
	}
	void setSplitIslands(bool doSplitIslands)
	{
		m_splitIslands = doSplitIslands;
	}
};
```
### btUnionFind

``` c++

///UnionFind calculates connected subsets
// Implements weighted Quick Union with path compression
// optimization: could use short ints instead of ints (halving memory, would limit the number of rigid bodies to 64k, sounds reasonable)
class btUnionFind
{
private:
	btAlignedObjectArray<btElement> m_elements;

public:
	btUnionFind();
	~btUnionFind();

	//this is a special operation, destroying the content of btUnionFind.
	//it sorts the elements, based on island id, in order to make it easy to iterate over islands
	void sortIslands();

	void reset(int N);

	SIMD_FORCE_INLINE int getNumElements() const
	{
		return int(m_elements.size());
	}
	SIMD_FORCE_INLINE bool isRoot(int x) const
	{
		return (x == m_elements[x].m_id);
	}

	btElement& getElement(int index)
	{
		return m_elements[index];
	}
	const btElement& getElement(int index) const
	{
		return m_elements[index];
	}

	void allocate(int N);
	void Free();

	int find(int p, int q)
	{
		return (find(p) == find(q));
	}

	void unite(int p, int q)
	{
		int i = find(p), j = find(q);
		if (i == j)
			return;

#ifndef USE_PATH_COMPRESSION
		//weighted quick union, this keeps the 'trees' balanced, and keeps performance of unite O( log(n) )
		if (m_elements[i].m_sz < m_elements[j].m_sz)
		{
			m_elements[i].m_id = j;
			m_elements[j].m_sz += m_elements[i].m_sz;
		}
		else
		{
			m_elements[j].m_id = i;
			m_elements[i].m_sz += m_elements[j].m_sz;
		}
#else
		m_elements[i].m_id = j;
		m_elements[j].m_sz += m_elements[i].m_sz;
#endif  //USE_PATH_COMPRESSION
	}

	int find(int x)
	{
		//btAssert(x < m_N);
		//btAssert(x >= 0);

		while (x != m_elements[x].m_id)
		{
			//not really a reason not to use path compression, and it flattens the trees/improves find performance dramatically

#ifdef USE_PATH_COMPRESSION
			const btElement* elementPtr = &m_elements[m_elements[x].m_id];
			m_elements[x].m_id = elementPtr->m_id;
			x = elementPtr->m_id;
#else  //
			x = m_elements[x].m_id;
#endif
			//btAssert(x < m_N);
			//btAssert(x >= 0);
		}
		return x;
	}
};
```

### btOverlappingPairCache
``` c++

///The btOverlappingPairCache provides an interface for overlapping pair management (add, remove, storage), used by the btBroadphaseInterface broadphases.
///The btHashedOverlappingPairCache and btSortedOverlappingPairCache classes are two implementations.
class btOverlappingPairCache : public btOverlappingPairCallback
{
public:
	virtual ~btOverlappingPairCache() {}  // this is needed so we can get to the derived class destructor

	virtual btBroadphasePair* getOverlappingPairArrayPtr() = 0;

	virtual const btBroadphasePair* getOverlappingPairArrayPtr() const = 0;

	virtual btBroadphasePairArray& getOverlappingPairArray() = 0;

	virtual void cleanOverlappingPair(btBroadphasePair& pair, btDispatcher* dispatcher) = 0;

	virtual int getNumOverlappingPairs() const = 0;
	virtual bool needsBroadphaseCollision(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1) const = 0;
	virtual btOverlapFilterCallback* getOverlapFilterCallback() = 0;
	virtual void cleanProxyFromPairs(btBroadphaseProxy* proxy, btDispatcher* dispatcher) = 0;

	virtual void setOverlapFilterCallback(btOverlapFilterCallback* callback) = 0;

	virtual void processAllOverlappingPairs(btOverlapCallback*, btDispatcher* dispatcher) = 0;

	virtual void processAllOverlappingPairs(btOverlapCallback* callback, btDispatcher* dispatcher, const struct btDispatcherInfo& /*dispatchInfo*/)
	{
		processAllOverlappingPairs(callback, dispatcher);
	}
	virtual btBroadphasePair* findPair(btBroadphaseProxy* proxy0, btBroadphaseProxy* proxy1) = 0;

	virtual bool hasDeferredRemoval() = 0;

	virtual void setInternalGhostPairCallback(btOverlappingPairCallback* ghostPairCallback) = 0;

	virtual void sortOverlappingPairs(btDispatcher* dispatcher) = 0;
};

// Add a pair and return the new pair. If the pair already exists,
	// no new pair is created and the old one is returned.
	virtual btBroadphasePair* addOverlappingPair(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1)
	{
		if (!needsBroadphaseCollision(proxy0, proxy1))
			return 0;

		return internalAddPair(proxy0, proxy1);
	}


///The btOverlappingPairCallback class is an additional optional broadphase user callback for adding/removing overlapping pairs, similar interface to btOverlappingPairCache.
class btOverlappingPairCallback
{
protected:
	btOverlappingPairCallback() {}

public:
	virtual ~btOverlappingPairCallback()
	{
	}

	virtual btBroadphasePair* addOverlappingPair(btBroadphaseProxy* proxy0, btBroadphaseProxy* proxy1) = 0;

	virtual void* removeOverlappingPair(btBroadphaseProxy* proxy0, btBroadphaseProxy* proxy1, btDispatcher* dispatcher) = 0;

	virtual void removeOverlappingPairsContainingProxy(btBroadphaseProxy* proxy0, btDispatcher* dispatcher) = 0;
};


btBroadphasePair* btHashedOverlappingPairCache::internalAddPair(btBroadphaseProxy* proxy0, btBroadphaseProxy* proxy1)
{
	if (proxy0->m_uniqueId > proxy1->m_uniqueId)
		btSwap(proxy0, proxy1);
	int proxyId1 = proxy0->getUid();
	int proxyId2 = proxy1->getUid();

	/*if (proxyId1 > proxyId2) 
		btSwap(proxyId1, proxyId2);*/

	int hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1), static_cast<unsigned int>(proxyId2)) & (m_overlappingPairArray.capacity() - 1));  // New hash value with new mask

	btBroadphasePair* pair = internalFindPair(proxy0, proxy1, hash);
	if (pair != NULL)
	{
		return pair;
	}
	/*for(int i=0;i<m_overlappingPairArray.size();++i)
		{
		if(	(m_overlappingPairArray[i].m_pProxy0==proxy0)&&
			(m_overlappingPairArray[i].m_pProxy1==proxy1))
			{
			printf("Adding duplicated %u<>%u\r\n",proxyId1,proxyId2);
			internalFindPair(proxy0, proxy1, hash);
			}
		}*/
	int count = m_overlappingPairArray.size();
	int oldCapacity = m_overlappingPairArray.capacity();
	void* mem = &m_overlappingPairArray.expandNonInitializing();

	//this is where we add an actual pair, so also call the 'ghost'
	if (m_ghostPairCallback)
		m_ghostPairCallback->addOverlappingPair(proxy0, proxy1);

	int newCapacity = m_overlappingPairArray.capacity();

	if (oldCapacity < newCapacity)
	{
		growTables();
		//hash with new capacity
		hash = static_cast<int>(getHash(static_cast<unsigned int>(proxyId1), static_cast<unsigned int>(proxyId2)) & (m_overlappingPairArray.capacity() - 1));
	}

	pair = new (mem) btBroadphasePair(*proxy0, *proxy1);
	//	pair->m_pProxy0 = proxy0;
	//	pair->m_pProxy1 = proxy1;
	pair->m_algorithm = 0;
	pair->m_internalTmpValue = 0;

	m_next[count] = m_hashTable[hash];
	m_hashTable[hash] = count;

	return pair;
}

```

### btHashedOverlappingPairCache

``` c++
ATTRIBUTE_ALIGNED16(class)
btHashedOverlappingPairCache : public btOverlappingPairCache
{
	btBroadphasePairArray m_overlappingPairArray;
	btOverlapFilterCallback* m_overlapFilterCallback;

protected:
	btAlignedObjectArray<int> m_hashTable;
	btAlignedObjectArray<int> m_next;
	btOverlappingPairCallback* m_ghostPairCallback;

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	btHashedOverlappingPairCache();
	virtual ~btHashedOverlappingPairCache();

	void removeOverlappingPairsContainingProxy(btBroadphaseProxy * proxy, btDispatcher * dispatcher);

	virtual void* removeOverlappingPair(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1, btDispatcher * dispatcher);

	SIMD_FORCE_INLINE bool needsBroadphaseCollision(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1) const
	{
		if (m_overlapFilterCallback)
			return m_overlapFilterCallback->needBroadphaseCollision(proxy0, proxy1);

		bool collides = (proxy0->m_collisionFilterGroup & proxy1->m_collisionFilterMask) != 0;
		collides = collides && (proxy1->m_collisionFilterGroup & proxy0->m_collisionFilterMask);

		return collides;
	}

	// Add a pair and return the new pair. If the pair already exists,
	// no new pair is created and the old one is returned.
	virtual btBroadphasePair* addOverlappingPair(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1)
	{
		if (!needsBroadphaseCollision(proxy0, proxy1))
			return 0;

		return internalAddPair(proxy0, proxy1);
	}

	void cleanProxyFromPairs(btBroadphaseProxy * proxy, btDispatcher * dispatcher);

	virtual void processAllOverlappingPairs(btOverlapCallback*, btDispatcher * dispatcher);

	virtual void processAllOverlappingPairs(btOverlapCallback * callback, btDispatcher * dispatcher, const struct btDispatcherInfo& dispatchInfo);

	virtual btBroadphasePair* getOverlappingPairArrayPtr()
	{
		return &m_overlappingPairArray[0];
	}

	const btBroadphasePair* getOverlappingPairArrayPtr() const
	{
		return &m_overlappingPairArray[0];
	}

	btBroadphasePairArray& getOverlappingPairArray()
	{
		return m_overlappingPairArray;
	}

	const btBroadphasePairArray& getOverlappingPairArray() const
	{
		return m_overlappingPairArray;
	}

	void cleanOverlappingPair(btBroadphasePair & pair, btDispatcher * dispatcher);

	btBroadphasePair* findPair(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1);

	int GetCount() const { return m_overlappingPairArray.size(); }
	//	btBroadphasePair* GetPairs() { return m_pairs; }

	btOverlapFilterCallback* getOverlapFilterCallback()
	{
		return m_overlapFilterCallback;
	}

	void setOverlapFilterCallback(btOverlapFilterCallback * callback)
	{
		m_overlapFilterCallback = callback;
	}

	int getNumOverlappingPairs() const
	{
		return m_overlappingPairArray.size();
	}

private:
	btBroadphasePair* internalAddPair(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1);

	void growTables();

	SIMD_FORCE_INLINE bool equalsPair(const btBroadphasePair& pair, int proxyId1, int proxyId2)
	{
		return pair.m_pProxy0->getUid() == proxyId1 && pair.m_pProxy1->getUid() == proxyId2;
	}

	/*
	// Thomas Wang's hash, see: http://www.concentric.net/~Ttwang/tech/inthash.htm
	// This assumes proxyId1 and proxyId2 are 16-bit.
	SIMD_FORCE_INLINE int getHash(int proxyId1, int proxyId2)
	{
		int key = (proxyId2 << 16) | proxyId1;
		key = ~key + (key << 15);
		key = key ^ (key >> 12);
		key = key + (key << 2);
		key = key ^ (key >> 4);
		key = key * 2057;
		key = key ^ (key >> 16);
		return key;
	}
	*/

	SIMD_FORCE_INLINE unsigned int getHash(unsigned int proxyId1, unsigned int proxyId2)
	{
		unsigned int key = proxyId1 | (proxyId2 << 16);
		// Thomas Wang's hash

		key += ~(key << 15);
		key ^= (key >> 10);
		key += (key << 3);
		key ^= (key >> 6);
		key += ~(key << 11);
		key ^= (key >> 16);
		return key;
	}

	SIMD_FORCE_INLINE btBroadphasePair* internalFindPair(btBroadphaseProxy * proxy0, btBroadphaseProxy * proxy1, int hash)
	{
		int proxyId1 = proxy0->getUid();
		int proxyId2 = proxy1->getUid();
#if 0  // wrong, 'equalsPair' use unsorted uids, copy-past devil striked again. Nat.
		if (proxyId1 > proxyId2) 
			btSwap(proxyId1, proxyId2);
#endif

		int index = m_hashTable[hash];

		while (index != BT_NULL_PAIR && equalsPair(m_overlappingPairArray[index], proxyId1, proxyId2) == false)
		{
			index = m_next[index];
		}

		if (index == BT_NULL_PAIR)
		{
			return NULL;
		}

		btAssert(index < m_overlappingPairArray.size());

		return &m_overlappingPairArray[index];
	}

	virtual bool hasDeferredRemoval()
	{
		return false;
	}

	virtual void setInternalGhostPairCallback(btOverlappingPairCallback * ghostPairCallback)
	{
		m_ghostPairCallback = ghostPairCallback;
	}

	virtual void sortOverlappingPairs(btDispatcher * dispatcher);
};
```

### btUnionFind 并查集

``` c++
/*
Bullet Continuous Collision Detection and Physics Library
Copyright (c) 2003-2006 Erwin Coumans  https://bulletphysics.org

This software is provided 'as-is', without any express or implied warranty.
In no event will the authors be held liable for any damages arising from the use of this software.
Permission is granted to anyone to use this software for any purpose, 
including commercial applications, and to alter it and redistribute it freely, 
subject to the following restrictions:

1. The origin of this software must not be misrepresented; you must not claim that you wrote the original software. If you use this software in a product, an acknowledgment in the product documentation would be appreciated but is not required.
2. Altered source versions must be plainly marked as such, and must not be misrepresented as being the original software.
3. This notice may not be removed or altered from any source distribution.
*/

#ifndef BT_UNION_FIND_H
#define BT_UNION_FIND_H

#include "LinearMath/btAlignedObjectArray.h"

#define USE_PATH_COMPRESSION 1

///see for discussion of static island optimizations by Vroonsh here: http://code.google.com/p/bullet/issues/detail?id=406
#define STATIC_SIMULATION_ISLAND_OPTIMIZATION 1

struct btElement
{
	int m_id;
	int m_sz;
};

///UnionFind calculates connected subsets
// Implements weighted Quick Union with path compression
// optimization: could use short ints instead of ints (halving memory, would limit the number of rigid bodies to 64k, sounds reasonable)
class btUnionFind
{
private:
	btAlignedObjectArray<btElement> m_elements;

public:
	btUnionFind();
	~btUnionFind();

	//this is a special operation, destroying the content of btUnionFind.
	//it sorts the elements, based on island id, in order to make it easy to iterate over islands
	void sortIslands();

	void reset(int N);

	SIMD_FORCE_INLINE int getNumElements() const
	{
		return int(m_elements.size());
	}
	SIMD_FORCE_INLINE bool isRoot(int x) const
	{
		return (x == m_elements[x].m_id);
	}

	btElement& getElement(int index)
	{
		return m_elements[index];
	}
	const btElement& getElement(int index) const
	{
		return m_elements[index];
	}

	void allocate(int N);
	void Free();

	int find(int p, int q)
	{
		return (find(p) == find(q));
	}

	void unite(int p, int q)
	{
		int i = find(p), j = find(q);
		if (i == j)
			return;

#ifndef USE_PATH_COMPRESSION
		//weighted quick union, this keeps the 'trees' balanced, and keeps performance of unite O( log(n) )
		if (m_elements[i].m_sz < m_elements[j].m_sz)
		{
			m_elements[i].m_id = j;
			m_elements[j].m_sz += m_elements[i].m_sz;
		}
		else
		{
			m_elements[j].m_id = i;
			m_elements[i].m_sz += m_elements[j].m_sz;
		}
#else
		m_elements[i].m_id = j;
		m_elements[j].m_sz += m_elements[i].m_sz;
#endif  //USE_PATH_COMPRESSION
	}

	int find(int x)
	{
		//btAssert(x < m_N);
		//btAssert(x >= 0);

		while (x != m_elements[x].m_id)
		{
			//not really a reason not to use path compression, and it flattens the trees/improves find performance dramatically

#ifdef USE_PATH_COMPRESSION
			const btElement* elementPtr = &m_elements[m_elements[x].m_id];
			m_elements[x].m_id = elementPtr->m_id;
			x = elementPtr->m_id;
#else  //
			x = m_elements[x].m_id;
#endif
			//btAssert(x < m_N);
			//btAssert(x >= 0);
		}
		return x;
	}
};

#endif  //BT_UNION_FIND_H
```
### btPersistentManifold

``` c++

///btPersistentManifold is a contact point cache, it stays persistent as long as objects are overlapping in the broadphase.
///Those contact points are created by the collision narrow phase.
///The cache can be empty, or hold 1,2,3 or 4 points. Some collision algorithms (GJK) might only add one point at a time.
///updates/refreshes old contact points, and throw them away if necessary (distance becomes too large)
///reduces the cache to 4 points, when more then 4 points are added, using following rules:
///the contact point with deepest penetration is always kept, and it tries to maximuze the area covered by the points
///note that some pairs of objects might have more then one contact manifold.

//ATTRIBUTE_ALIGNED128( class) btPersistentManifold : public btTypedObject
ATTRIBUTE_ALIGNED16(class)
btPersistentManifold : public btTypedObject
{
	btManifoldPoint m_pointCache[MANIFOLD_CACHE_SIZE];

	/// this two body pointers can point to the physics rigidbody class.
	const btCollisionObject* m_body0;
	const btCollisionObject* m_body1;

	int m_cachedPoints;

	btScalar m_contactBreakingThreshold;
	btScalar m_contactProcessingThreshold;

	/// sort cached points so most isolated points come first
	int sortCachedPoints(const btManifoldPoint& pt);

	int findContactPoint(const btManifoldPoint* unUsed, int numUnused, const btManifoldPoint& pt);

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	int m_companionIdA;
	int m_companionIdB;

	int m_index1a;

	btPersistentManifold();

	btPersistentManifold(const btCollisionObject* body0, const btCollisionObject* body1, int, btScalar contactBreakingThreshold, btScalar contactProcessingThreshold)
		: btTypedObject(BT_PERSISTENT_MANIFOLD_TYPE),
		  m_body0(body0),
		  m_body1(body1),
		  m_cachedPoints(0),
		  m_contactBreakingThreshold(contactBreakingThreshold),
		  m_contactProcessingThreshold(contactProcessingThreshold),
		  m_companionIdA(0),
		  m_companionIdB(0),
		  m_index1a(0)
	{
	}

	SIMD_FORCE_INLINE const btCollisionObject* getBody0() const { return m_body0; }
	SIMD_FORCE_INLINE const btCollisionObject* getBody1() const { return m_body1; }

	void setBodies(const btCollisionObject* body0, const btCollisionObject* body1)
	{
		m_body0 = body0;
		m_body1 = body1;
	}

	void clearUserCache(btManifoldPoint & pt);

#ifdef DEBUG_PERSISTENCY
	void DebugPersistency();
#endif  //

	SIMD_FORCE_INLINE int getNumContacts() const
	{
		return m_cachedPoints;
	}
	/// the setNumContacts API is usually not used, except when you gather/fill all contacts manually
	void setNumContacts(int cachedPoints)
	{
		m_cachedPoints = cachedPoints;
	}

	SIMD_FORCE_INLINE const btManifoldPoint& getContactPoint(int index) const
	{
		btAssert(index < m_cachedPoints);
		return m_pointCache[index];
	}

	SIMD_FORCE_INLINE btManifoldPoint& getContactPoint(int index)
	{
		btAssert(index < m_cachedPoints);
		return m_pointCache[index];
	}

	///@todo: get this margin from the current physics / collision environment
	btScalar getContactBreakingThreshold() const;

	btScalar getContactProcessingThreshold() const
	{
		return m_contactProcessingThreshold;
	}

	void setContactBreakingThreshold(btScalar contactBreakingThreshold)
	{
		m_contactBreakingThreshold = contactBreakingThreshold;
	}

	void setContactProcessingThreshold(btScalar contactProcessingThreshold)
	{
		m_contactProcessingThreshold = contactProcessingThreshold;
	}

	int getCacheEntry(const btManifoldPoint& newPoint) const;

	int addManifoldPoint(const btManifoldPoint& newPoint, bool isPredictive = false);

	void removeContactPoint(int index)
	{
		clearUserCache(m_pointCache[index]);

		int lastUsedIndex = getNumContacts() - 1;
		//		m_pointCache[index] = m_pointCache[lastUsedIndex];
		if (index != lastUsedIndex)
		{
			m_pointCache[index] = m_pointCache[lastUsedIndex];
			//get rid of duplicated userPersistentData pointer
			m_pointCache[lastUsedIndex].m_userPersistentData = 0;
			m_pointCache[lastUsedIndex].m_appliedImpulse = 0.f;
			m_pointCache[lastUsedIndex].m_prevRHS = 0.f;
			m_pointCache[lastUsedIndex].m_contactPointFlags = 0;
			m_pointCache[lastUsedIndex].m_appliedImpulseLateral1 = 0.f;
			m_pointCache[lastUsedIndex].m_appliedImpulseLateral2 = 0.f;
			m_pointCache[lastUsedIndex].m_lifeTime = 0;
		}

		btAssert(m_pointCache[lastUsedIndex].m_userPersistentData == 0);
		m_cachedPoints--;

		if (gContactEndedCallback && m_cachedPoints == 0)
		{
			gContactEndedCallback(this);
		}
	}
	void replaceContactPoint(const btManifoldPoint& newPoint, int insertIndex)
	{
		btAssert(validContactDistance(newPoint));

#define MAINTAIN_PERSISTENCY 1
#ifdef MAINTAIN_PERSISTENCY
		int lifeTime = m_pointCache[insertIndex].getLifeTime();
		btScalar appliedImpulse = m_pointCache[insertIndex].m_appliedImpulse;
		btScalar prevRHS = m_pointCache[insertIndex].m_prevRHS;
		btScalar appliedLateralImpulse1 = m_pointCache[insertIndex].m_appliedImpulseLateral1;
		btScalar appliedLateralImpulse2 = m_pointCache[insertIndex].m_appliedImpulseLateral2;

		bool replacePoint = true;
		///we keep existing contact points for friction anchors
		///if the friction force is within the Coulomb friction cone
		if (newPoint.m_contactPointFlags & BT_CONTACT_FLAG_FRICTION_ANCHOR)
		{
			//   printf("appliedImpulse=%f\n", appliedImpulse);
			//   printf("appliedLateralImpulse1=%f\n", appliedLateralImpulse1);
			//   printf("appliedLateralImpulse2=%f\n", appliedLateralImpulse2);
			//   printf("mu = %f\n", m_pointCache[insertIndex].m_combinedFriction);
			btScalar mu = m_pointCache[insertIndex].m_combinedFriction;
			btScalar eps = 0;  //we could allow to enlarge or shrink the tolerance to check against the friction cone a bit, say 1e-7
			btScalar a = appliedLateralImpulse1 * appliedLateralImpulse1 + appliedLateralImpulse2 * appliedLateralImpulse2;
			btScalar b = eps + mu * appliedImpulse;
			b = b * b;
			replacePoint = (a) > (b);
		}

		if (replacePoint)
		{
			btAssert(lifeTime >= 0);
			void* cache = m_pointCache[insertIndex].m_userPersistentData;

			m_pointCache[insertIndex] = newPoint;
			m_pointCache[insertIndex].m_userPersistentData = cache;
			m_pointCache[insertIndex].m_appliedImpulse = appliedImpulse;
			m_pointCache[insertIndex].m_prevRHS = prevRHS;
			m_pointCache[insertIndex].m_appliedImpulseLateral1 = appliedLateralImpulse1;
			m_pointCache[insertIndex].m_appliedImpulseLateral2 = appliedLateralImpulse2;
		}

		m_pointCache[insertIndex].m_lifeTime = lifeTime;
#else
		clearUserCache(m_pointCache[insertIndex]);
		m_pointCache[insertIndex] = newPoint;

#endif
	}

	bool validContactDistance(const btManifoldPoint& pt) const
	{
		return pt.m_distance1 <= getContactBreakingThreshold();
	}
	/// calculated new worldspace coordinates and depth, and reject points that exceed the collision margin
	void refreshContactPoints(const btTransform& trA, const btTransform& trB);

	SIMD_FORCE_INLINE void clearManifold()
	{
		int i;
		for (i = 0; i < m_cachedPoints; i++)
		{
			clearUserCache(m_pointCache[i]);
		}

		if (gContactEndedCallback && m_cachedPoints)
		{
			gContactEndedCallback(this);
		}
		m_cachedPoints = 0;
	}

	int calculateSerializeBufferSize() const;
	const char* serialize(const class btPersistentManifold* manifold, void* dataBuffer, class btSerializer* serializer) const;
	void deSerialize(const struct btPersistentManifoldDoubleData* manifoldDataPtr);
	void deSerialize(const struct btPersistentManifoldFloatData* manifoldDataPtr);
};


```
### btManifoldPoint
``` c++
class btManifoldPoint
{
public:
	btManifoldPoint()
		: m_userPersistentData(0),
		  m_contactPointFlags(0),
		  m_appliedImpulse(0.f),
		  m_prevRHS(0.f),
		  m_appliedImpulseLateral1(0.f),
		  m_appliedImpulseLateral2(0.f),
		  m_contactMotion1(0.f),
		  m_contactMotion2(0.f),
		  m_contactCFM(0.f),
		  m_contactERP(0.f),
		  m_frictionCFM(0.f),
		  m_lifeTime(0)
	{
	}

	btManifoldPoint(const btVector3& pointA, const btVector3& pointB,
					const btVector3& normal,
					btScalar distance) : m_localPointA(pointA),
										 m_localPointB(pointB),
										 m_positionWorldOnB(0,0,0),
										 m_positionWorldOnA(0,0,0),
										 m_normalWorldOnB(normal),
										 m_distance1(distance),
										 m_combinedFriction(btScalar(0.)),
										 m_combinedRollingFriction(btScalar(0.)),
										 m_combinedSpinningFriction(btScalar(0.)),
										 m_combinedRestitution(btScalar(0.)),
										 m_partId0(-1),
										 m_partId1(-1),
										 m_index0(-1),
										 m_index1(-1),
										 m_userPersistentData(0),
										 m_contactPointFlags(0),
										 m_appliedImpulse(0.f),
										 m_prevRHS(0.f),
										 m_appliedImpulseLateral1(0.f),
										 m_appliedImpulseLateral2(0.f),
										 m_contactMotion1(0.f),
										 m_contactMotion2(0.f),
										 m_contactCFM(0.f),
										 m_contactERP(0.f),
										 m_frictionCFM(0.f),
										 m_lifeTime(0),
										 m_lateralFrictionDir1(0,0,0),
										 m_lateralFrictionDir2(0,0,0)
	{
	}

	btVector3 m_localPointA;
	btVector3 m_localPointB;
	btVector3 m_positionWorldOnB;
	///m_positionWorldOnA is redundant information, see getPositionWorldOnA(), but for clarity
	btVector3 m_positionWorldOnA;
	btVector3 m_normalWorldOnB;

	btScalar m_distance1;
	btScalar m_combinedFriction;
	btScalar m_combinedRollingFriction;   //torsional friction orthogonal to contact normal, useful to make spheres stop rolling forever
	btScalar m_combinedSpinningFriction;  //torsional friction around contact normal, useful for grasping objects
	btScalar m_combinedRestitution;

	//BP mod, store contact triangles.
	int m_partId0;
	int m_partId1;
	int m_index0;
	int m_index1;

	mutable void* m_userPersistentData;
	//bool			m_lateralFrictionInitialized;
	int m_contactPointFlags;

	btScalar m_appliedImpulse;
	btScalar m_prevRHS;
	btScalar m_appliedImpulseLateral1;
	btScalar m_appliedImpulseLateral2;
	btScalar m_contactMotion1;
	btScalar m_contactMotion2;

	union {
		btScalar m_contactCFM;
		btScalar m_combinedContactStiffness1;
	};

	union {
		btScalar m_contactERP;
		btScalar m_combinedContactDamping1;
	};

	btScalar m_frictionCFM;

	int m_lifeTime;  //lifetime of the contactpoint in frames

	btVector3 m_lateralFrictionDir1;
	btVector3 m_lateralFrictionDir2;

	btScalar getDistance() const
	{
		return m_distance1;
	}
	int getLifeTime() const
	{
		return m_lifeTime;
	}

	const btVector3& getPositionWorldOnA() const
	{
		return m_positionWorldOnA;
		//				return m_positionWorldOnB + m_normalWorldOnB * m_distance1;
	}

	const btVector3& getPositionWorldOnB() const
	{
		return m_positionWorldOnB;
	}

	void setDistance(btScalar dist)
	{
		m_distance1 = dist;
	}

	///this returns the most recent applied impulse, to satisfy contact constraints by the constraint solver
	btScalar getAppliedImpulse() const
	{
		return m_appliedImpulse;
	}
};
```

### btAlignedObjectArray
``` c++

template <typename T>
//template <class T>
class btAlignedObjectArray
{
	btAlignedAllocator<T, 16> m_allocator;

	int m_size;
	int m_capacity;
	T* m_data;
	//PCK: added this line
	bool m_ownsMemory;

#ifdef BT_ALLOW_ARRAY_COPY_OPERATOR
public:
	SIMD_FORCE_INLINE btAlignedObjectArray<T>& operator=(const btAlignedObjectArray<T>& other)
	{
		copyFromArray(other);
		return *this;
	}
#else   //BT_ALLOW_ARRAY_COPY_OPERATOR
private:
	SIMD_FORCE_INLINE btAlignedObjectArray<T>& operator=(const btAlignedObjectArray<T>& other);
#endif  //BT_ALLOW_ARRAY_COPY_OPERATOR

protected:
	SIMD_FORCE_INLINE int allocSize(int size)
	{
		return (size ? size * 2 : 1);
	}
	SIMD_FORCE_INLINE void copy(int start, int end, T* dest) const
	{
		int i;
		for (i = start; i < end; ++i)
#ifdef BT_USE_PLACEMENT_NEW
			new (&dest[i]) T(m_data[i]);
#else
			dest[i] = m_data[i];
#endif  //BT_USE_PLACEMENT_NEW
	}

	SIMD_FORCE_INLINE void init()
	{
		//PCK: added this line
		m_ownsMemory = true;
		m_data = 0;
		m_size = 0;
		m_capacity = 0;
	}
	SIMD_FORCE_INLINE void destroy(int first, int last)
	{
		int i;
		for (i = first; i < last; i++)
		{
			m_data[i].~T();
		}
	}

	SIMD_FORCE_INLINE void* allocate(int size)
	{
		if (size)
			return m_allocator.allocate(size);
		return 0;
	}

	SIMD_FORCE_INLINE void deallocate()
	{
		if (m_data)
		{
			//PCK: enclosed the deallocation in this block
			if (m_ownsMemory)
			{
				m_allocator.deallocate(m_data);
			}
			m_data = 0;
		}
	}

public:
	btAlignedObjectArray()
	{
		init();
	}

	~btAlignedObjectArray()
	{
		clear();
	}

	///Generally it is best to avoid using the copy constructor of an btAlignedObjectArray, and use a (const) reference to the array instead.
	btAlignedObjectArray(const btAlignedObjectArray& otherArray)
	{
		init();

		int otherSize = otherArray.size();
		resize(otherSize);
		otherArray.copy(0, otherSize, m_data);
	}

	/// return the number of elements in the array
	SIMD_FORCE_INLINE int size() const
	{
		return m_size;
	}

	SIMD_FORCE_INLINE const T& at(int n) const
	{
		btAssert(n >= 0);
		btAssert(n < size());
		return m_data[n];
	}

	SIMD_FORCE_INLINE T& at(int n)
	{
		btAssert(n >= 0);
		btAssert(n < size());
		return m_data[n];
	}

	SIMD_FORCE_INLINE const T& operator[](int n) const
	{
		btAssert(n >= 0);
		btAssert(n < size());
		return m_data[n];
	}

	SIMD_FORCE_INLINE T& operator[](int n)
	{
		btAssert(n >= 0);
		btAssert(n < size());
		return m_data[n];
	}

	///clear the array, deallocated memory. Generally it is better to use array.resize(0), to reduce performance overhead of run-time memory (de)allocations.
	SIMD_FORCE_INLINE void clear()
	{
		destroy(0, size());

		deallocate();

		init();
	}

	SIMD_FORCE_INLINE void pop_back()
	{
		btAssert(m_size > 0);
		m_size--;
		m_data[m_size].~T();
	}

	///resize changes the number of elements in the array. If the new size is larger, the new elements will be constructed using the optional second argument.
	///when the new number of elements is smaller, the destructor will be called, but memory will not be freed, to reduce performance overhead of run-time memory (de)allocations.
	SIMD_FORCE_INLINE void resizeNoInitialize(int newsize)
	{
		if (newsize > size())
		{
			reserve(newsize);
		}
		m_size = newsize;
	}

	SIMD_FORCE_INLINE void resize(int newsize, const T& fillData = T())
	{
		const int curSize = size();

		if (newsize < curSize)
		{
			for (int i = newsize; i < curSize; i++)
			{
				m_data[i].~T();
			}
		}
		else
		{
			if (newsize > curSize)
			{
				reserve(newsize);
			}
#ifdef BT_USE_PLACEMENT_NEW
			for (int i = curSize; i < newsize; i++)
			{
				new (&m_data[i]) T(fillData);
			}
#endif  //BT_USE_PLACEMENT_NEW
		}

		m_size = newsize;
	}
	SIMD_FORCE_INLINE T& expandNonInitializing()
	{
		const int sz = size();
		if (sz == capacity())
		{
			reserve(allocSize(size()));
		}
		m_size++;

		return m_data[sz];
	}

	SIMD_FORCE_INLINE T& expand(const T& fillValue = T())
	{
		const int sz = size();
		if (sz == capacity())
		{
			reserve(allocSize(size()));
		}
		m_size++;
#ifdef BT_USE_PLACEMENT_NEW
		new (&m_data[sz]) T(fillValue);  //use the in-place new (not really allocating heap memory)
#endif

		return m_data[sz];
	}

	SIMD_FORCE_INLINE void push_back(const T& _Val)
	{
		const int sz = size();
		if (sz == capacity())
		{
			reserve(allocSize(size()));
		}

#ifdef BT_USE_PLACEMENT_NEW
		new (&m_data[m_size]) T(_Val);
#else
		m_data[size()] = _Val;
#endif  //BT_USE_PLACEMENT_NEW

		m_size++;
	}

	/// return the pre-allocated (reserved) elements, this is at least as large as the total number of elements,see size() and reserve()
	SIMD_FORCE_INLINE int capacity() const
	{
		return m_capacity;
	}

	SIMD_FORCE_INLINE void reserve(int _Count)
	{  // determine new minimum length of allocated storage
		if (capacity() < _Count)
		{  // not enough room, reallocate
			T* s = (T*)allocate(_Count);

			copy(0, size(), s);

			destroy(0, size());

			deallocate();

			//PCK: added this line
			m_ownsMemory = true;

			m_data = s;

			m_capacity = _Count;
		}
	}

	class less
	{
	public:
		bool operator()(const T& a, const T& b) const
		{
			return (a < b);
		}
	};

	template <typename L>
	void quickSortInternal(const L& CompareFunc, int lo, int hi)
	{
		//  lo is the lower index, hi is the upper index
		//  of the region of array a that is to be sorted
		int i = lo, j = hi;
		T x = m_data[(lo + hi) / 2];

		//  partition
		do
		{
			while (CompareFunc(m_data[i], x))
				i++;
			while (CompareFunc(x, m_data[j]))
				j--;
			if (i <= j)
			{
				swap(i, j);
				i++;
				j--;
			}
		} while (i <= j);

		//  recursion
		if (lo < j)
			quickSortInternal(CompareFunc, lo, j);
		if (i < hi)
			quickSortInternal(CompareFunc, i, hi);
	}

	template <typename L>
	void quickSort(const L& CompareFunc)
	{
		//don't sort 0 or 1 elements
		if (size() > 1)
		{
			quickSortInternal(CompareFunc, 0, size() - 1);
		}
	}

	///heap sort from http://www.csse.monash.edu.au/~lloyd/tildeAlgDS/Sort/Heap/
	template <typename L>
	void downHeap(T* pArr, int k, int n, const L& CompareFunc)
	{
		/*  PRE: a[k+1..N] is a heap */
		/* POST:  a[k..N]  is a heap */

		T temp = pArr[k - 1];
		/* k has child(s) */
		while (k <= n / 2)
		{
			int child = 2 * k;

			if ((child < n) && CompareFunc(pArr[child - 1], pArr[child]))
			{
				child++;
			}
			/* pick larger child */
			if (CompareFunc(temp, pArr[child - 1]))
			{
				/* move child up */
				pArr[k - 1] = pArr[child - 1];
				k = child;
			}
			else
			{
				break;
			}
		}
		pArr[k - 1] = temp;
	} /*downHeap*/

	void swap(int index0, int index1)
	{
#ifdef BT_USE_MEMCPY
		char temp[sizeof(T)];
		memcpy(temp, &m_data[index0], sizeof(T));
		memcpy(&m_data[index0], &m_data[index1], sizeof(T));
		memcpy(&m_data[index1], temp, sizeof(T));
#else
		T temp = m_data[index0];
		m_data[index0] = m_data[index1];
		m_data[index1] = temp;
#endif  //BT_USE_PLACEMENT_NEW
	}

	template <typename L>
	void heapSort(const L& CompareFunc)
	{
		/* sort a[0..N-1],  N.B. 0 to N-1 */
		int k;
		int n = m_size;
		for (k = n / 2; k > 0; k--)
		{
			downHeap(m_data, k, n, CompareFunc);
		}

		/* a[1..N] is now a heap */
		while (n >= 1)
		{
			swap(0, n - 1); /* largest of a[0..n-1] */

			n = n - 1;
			/* restore a[1..i-1] heap */
			downHeap(m_data, 1, n, CompareFunc);
		}
	}

	///non-recursive binary search, assumes sorted array
	int findBinarySearch(const T& key) const
	{
		int first = 0;
		int last = size() - 1;

		//assume sorted array
		while (first <= last)
		{
			int mid = (first + last) / 2;  // compute mid point.
			if (key > m_data[mid])
				first = mid + 1;  // repeat search in top half.
			else if (key < m_data[mid])
				last = mid - 1;  // repeat search in bottom half.
			else
				return mid;  // found it. return position /////
		}
		return size();  // failed to find key
	}

	int findLinearSearch(const T& key) const
	{
		int index = size();
		int i;

		for (i = 0; i < size(); i++)
		{
			if (m_data[i] == key)
			{
				index = i;
				break;
			}
		}
		return index;
	}

	// If the key is not in the array, return -1 instead of 0,
	// since 0 also means the first element in the array.
	int findLinearSearch2(const T& key) const
	{
		int index = -1;
		int i;

		for (i = 0; i < size(); i++)
		{
			if (m_data[i] == key)
			{
				index = i;
				break;
			}
		}
		return index;
	}

	void removeAtIndex(int index)
	{
		if (index < size())
		{
			swap(index, size() - 1);
			pop_back();
		}
	}
	void remove(const T& key)
	{
		int findIndex = findLinearSearch(key);
		removeAtIndex(findIndex);
	}

	//PCK: whole function
	void initializeFromBuffer(void* buffer, int size, int capacity)
	{
		clear();
		m_ownsMemory = false;
		m_data = (T*)buffer;
		m_size = size;
		m_capacity = capacity;
	}

	void copyFromArray(const btAlignedObjectArray& otherArray)
	{
		int otherSize = otherArray.size();
		resize(otherSize);
		otherArray.copy(0, otherSize, m_data);
	}
};

#endif  //BT_OBJECT_ARRAY__


```
### btSolverBody

``` c++

///The btSolverBody is an internal datastructure for the constraint solver. Only necessary data is packed to increase cache coherence/performance.
ATTRIBUTE_ALIGNED16(struct)
btSolverBody
{
	BT_DECLARE_ALIGNED_ALLOCATOR();
	btTransform m_worldTransform;
	btVector3 m_deltaLinearVelocity;
	btVector3 m_deltaAngularVelocity;
	btVector3 m_angularFactor;
	btVector3 m_linearFactor;
	btVector3 m_invMass;
	btVector3 m_pushVelocity;
	btVector3 m_turnVelocity;
	btVector3 m_linearVelocity;
	btVector3 m_angularVelocity;
	btVector3 m_externalForceImpulse;
	btVector3 m_externalTorqueImpulse;

	btRigidBody* m_originalBody;
	void setWorldTransform(const btTransform& worldTransform)
	{
		m_worldTransform = worldTransform;
	}

	const btTransform& getWorldTransform() const
	{
		return m_worldTransform;
	}

	SIMD_FORCE_INLINE void getVelocityInLocalPointNoDelta(const btVector3& rel_pos, btVector3& velocity) const
	{
		if (m_originalBody)
			velocity = m_linearVelocity + m_externalForceImpulse + (m_angularVelocity + m_externalTorqueImpulse).cross(rel_pos);
		else
			velocity.setValue(0, 0, 0);
	}

	SIMD_FORCE_INLINE void getVelocityInLocalPointObsolete(const btVector3& rel_pos, btVector3& velocity) const
	{
		if (m_originalBody)
			velocity = m_linearVelocity + m_deltaLinearVelocity + (m_angularVelocity + m_deltaAngularVelocity).cross(rel_pos);
		else
			velocity.setValue(0, 0, 0);
	}

	SIMD_FORCE_INLINE void getAngularVelocity(btVector3 & angVel) const
	{
		if (m_originalBody)
			angVel = m_angularVelocity + m_deltaAngularVelocity;
		else
			angVel.setValue(0, 0, 0);
	}

	//Optimization for the iterative solver: avoid calculating constant terms involving inertia, normal, relative position
	SIMD_FORCE_INLINE void applyImpulse(const btVector3& linearComponent, const btVector3& angularComponent, const btScalar impulseMagnitude)
	{
		if (m_originalBody)
		{
			m_deltaLinearVelocity += linearComponent * impulseMagnitude * m_linearFactor;
			m_deltaAngularVelocity += angularComponent * (impulseMagnitude * m_angularFactor);
		}
	}

	SIMD_FORCE_INLINE void internalApplyPushImpulse(const btVector3& linearComponent, const btVector3& angularComponent, btScalar impulseMagnitude)
	{
		if (m_originalBody)
		{
			m_pushVelocity += linearComponent * impulseMagnitude * m_linearFactor;
			m_turnVelocity += angularComponent * (impulseMagnitude * m_angularFactor);
		}
	}

	const btVector3& getDeltaLinearVelocity() const
	{
		return m_deltaLinearVelocity;
	}

	const btVector3& getDeltaAngularVelocity() const
	{
		return m_deltaAngularVelocity;
	}

	const btVector3& getPushVelocity() const
	{
		return m_pushVelocity;
	}

	const btVector3& getTurnVelocity() const
	{
		return m_turnVelocity;
	}

	////////////////////////////////////////////////
	///some internal methods, don't use them

	btVector3& internalGetDeltaLinearVelocity()
	{
		return m_deltaLinearVelocity;
	}

	btVector3& internalGetDeltaAngularVelocity()
	{
		return m_deltaAngularVelocity;
	}

	const btVector3& internalGetAngularFactor() const
	{
		return m_angularFactor;
	}

	const btVector3& internalGetInvMass() const
	{
		return m_invMass;
	}

	void internalSetInvMass(const btVector3& invMass)
	{
		m_invMass = invMass;
	}

	btVector3& internalGetPushVelocity()
	{
		return m_pushVelocity;
	}

	btVector3& internalGetTurnVelocity()
	{
		return m_turnVelocity;
	}

	SIMD_FORCE_INLINE void internalGetVelocityInLocalPointObsolete(const btVector3& rel_pos, btVector3& velocity) const
	{
		velocity = m_linearVelocity + m_deltaLinearVelocity + (m_angularVelocity + m_deltaAngularVelocity).cross(rel_pos);
	}

	SIMD_FORCE_INLINE void internalGetAngularVelocity(btVector3 & angVel) const
	{
		angVel = m_angularVelocity + m_deltaAngularVelocity;
	}

	//Optimization for the iterative solver: avoid calculating constant terms involving inertia, normal, relative position
	SIMD_FORCE_INLINE void internalApplyImpulse(const btVector3& linearComponent, const btVector3& angularComponent, const btScalar impulseMagnitude)
	{
		if (m_originalBody)
		{
			m_deltaLinearVelocity += linearComponent * impulseMagnitude * m_linearFactor;
			m_deltaAngularVelocity += angularComponent * (impulseMagnitude * m_angularFactor);
		}
	}

	void writebackVelocity()
	{
		if (m_originalBody)
		{
			m_linearVelocity += m_deltaLinearVelocity;
			m_angularVelocity += m_deltaAngularVelocity;

			//m_originalBody->setCompanionId(-1);
		}
	}

	void writebackVelocityAndTransform(btScalar timeStep, btScalar splitImpulseTurnErp)
	{
		(void)timeStep;
		if (m_originalBody)
		{
			m_linearVelocity += m_deltaLinearVelocity;
			m_angularVelocity += m_deltaAngularVelocity;

			//correct the position/orientation based on push/turn recovery
			btTransform newTransform;
			if (m_pushVelocity[0] != 0.f || m_pushVelocity[1] != 0 || m_pushVelocity[2] != 0 || m_turnVelocity[0] != 0.f || m_turnVelocity[1] != 0 || m_turnVelocity[2] != 0)
			{
				//	btQuaternion orn = m_worldTransform.getRotation();
				btTransformUtil::integrateTransform(m_worldTransform, m_pushVelocity, m_turnVelocity * splitImpulseTurnErp, timeStep, newTransform);
				m_worldTransform = newTransform;
			}
			//m_worldTransform.setRotation(orn);
			//m_originalBody->setCompanionId(-1);
		}
	}
};

```

###  btConstraintSolver

``` c++

class btConstraintSolver
{
public:
	virtual ~btConstraintSolver() {}

	virtual void prepareSolve(int /* numBodies */, int /* numManifolds */) { ; }

	///solve a group of constraints
	virtual btScalar solveGroup(btCollisionObject** bodies, int numBodies, btPersistentManifold** manifold, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& info, class btIDebugDraw* debugDrawer, btDispatcher* dispatcher) = 0;

	virtual void allSolved(const btContactSolverInfo& /* info */, class btIDebugDraw* /* debugDrawer */) { ; }

	///clear internal cached data and reset random seed
	virtual void reset() = 0;

	virtual btConstraintSolverType getSolverType() const = 0;
};

```
#### btSequentialImpulseConstraintSolver
``` c++
btSequentialImpulseConstraintSolver : public btConstraintSolver
{
	

protected:
	btAlignedObjectArray<btSolverBody> m_tmpSolverBodyPool;
	btConstraintArray m_tmpSolverContactConstraintPool;
	btConstraintArray m_tmpSolverNonContactConstraintPool;
	btConstraintArray m_tmpSolverContactFrictionConstraintPool;
	btConstraintArray m_tmpSolverContactRollingFrictionConstraintPool;

	btAlignedObjectArray<int> m_orderTmpConstraintPool;
	btAlignedObjectArray<int> m_orderNonContactConstraintPool;
	btAlignedObjectArray<int> m_orderFrictionConstraintPool;
	btAlignedObjectArray<btTypedConstraint::btConstraintInfo1> m_tmpConstraintSizesPool;
	int m_maxOverrideNumSolverIterations;
	int m_fixedBodyId;
	// When running solvers on multiple threads, a race condition exists for Kinematic objects that
	// participate in more than one solver.
	// The getOrInitSolverBody() function writes the companionId of each body (storing the index of the solver body
	// for the current solver). For normal dynamic bodies it isn't an issue because they can only be in one island
	// (and therefore one thread) at a time. But kinematic bodies can be in multiple islands at once.
	// To avoid this race condition, this solver does not write the companionId, instead it stores the solver body
	// index in this solver-local table, indexed by the uniqueId of the body.
	btAlignedObjectArray<int> m_kinematicBodyUniqueIdToSolverBodyTable;  // only used for multithreading

	btSingleConstraintRowSolver m_resolveSingleConstraintRowGeneric;
	btSingleConstraintRowSolver m_resolveSingleConstraintRowLowerLimit;
	btSingleConstraintRowSolver m_resolveSplitPenetrationImpulse;
	int m_cachedSolverMode;  // used to check if SOLVER_SIMD flag has been changed
	void setupSolverFunctions(bool useSimd);

	btScalar m_leastSquaresResidual;

	void setupFrictionConstraint(btSolverConstraint & solverConstraint, const btVector3& normalAxis, int solverBodyIdA, int solverBodyIdB,
		btManifoldPoint& cp, const btVector3& rel_pos1, const btVector3& rel_pos2,
		btCollisionObject* colObj0, btCollisionObject* colObj1, btScalar relaxation,
		const btContactSolverInfo& infoGlobal,
		btScalar desiredVelocity = 0., btScalar cfmSlip = 0.);

	void setupTorsionalFrictionConstraint(btSolverConstraint & solverConstraint, const btVector3& normalAxis, int solverBodyIdA, int solverBodyIdB,
		btManifoldPoint& cp, btScalar combinedTorsionalFriction, const btVector3& rel_pos1, const btVector3& rel_pos2,
		btCollisionObject* colObj0, btCollisionObject* colObj1, btScalar relaxation,
		btScalar desiredVelocity = 0., btScalar cfmSlip = 0.);

	btSolverConstraint& addFrictionConstraint(const btVector3& normalAxis, int solverBodyIdA, int solverBodyIdB, int frictionIndex, btManifoldPoint& cp, const btVector3& rel_pos1, const btVector3& rel_pos2, btCollisionObject* colObj0, btCollisionObject* colObj1, btScalar relaxation, const btContactSolverInfo& infoGlobal, btScalar desiredVelocity = 0., btScalar cfmSlip = 0.);
	btSolverConstraint& addTorsionalFrictionConstraint(const btVector3& normalAxis, int solverBodyIdA, int solverBodyIdB, int frictionIndex, btManifoldPoint& cp, btScalar torsionalFriction, const btVector3& rel_pos1, const btVector3& rel_pos2, btCollisionObject* colObj0, btCollisionObject* colObj1, btScalar relaxation, btScalar desiredVelocity = 0, btScalar cfmSlip = 0.f);

	void setupContactConstraint(btSolverConstraint & solverConstraint, int solverBodyIdA, int solverBodyIdB, btManifoldPoint& cp,
		const btContactSolverInfo& infoGlobal, btScalar& relaxation, const btVector3& rel_pos1, const btVector3& rel_pos2);

	static void applyAnisotropicFriction(btCollisionObject * colObj, btVector3 & frictionDirection, int frictionMode);

	void setFrictionConstraintImpulse(btSolverConstraint & solverConstraint, int solverBodyIdA, int solverBodyIdB,
		btManifoldPoint& cp, const btContactSolverInfo& infoGlobal);

	///m_btSeed2 is used for re-arranging the constraint rows. improves convergence/quality of friction
	unsigned long m_btSeed2;

	btScalar restitutionCurve(btScalar rel_vel, btScalar restitution, btScalar velocityThreshold);

	virtual void convertContacts(btPersistentManifold * *manifoldPtr, int numManifolds, const btContactSolverInfo& infoGlobal);

	void convertContact(btPersistentManifold * manifold, const btContactSolverInfo& infoGlobal);

	virtual void convertJoints(btTypedConstraint * *constraints, int numConstraints, const btContactSolverInfo& infoGlobal);
	void convertJoint(btSolverConstraint * currentConstraintRow, btTypedConstraint * constraint, const btTypedConstraint::btConstraintInfo1& info1, int solverBodyIdA, int solverBodyIdB, const btContactSolverInfo& infoGlobal);

	virtual void convertBodies(btCollisionObject * *bodies, int numBodies, const btContactSolverInfo& infoGlobal);

	btScalar resolveSplitPenetrationSIMD(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint)
	{
		return m_resolveSplitPenetrationImpulse(bodyA, bodyB, contactConstraint);
	}

	btScalar resolveSplitPenetrationImpulseCacheFriendly(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint)
	{
		return m_resolveSplitPenetrationImpulse(bodyA, bodyB, contactConstraint);
	}

	//internal method
	int getOrInitSolverBody(btCollisionObject & body, btScalar timeStep);
	void initSolverBody(btSolverBody * solverBody, btCollisionObject * collisionObject, btScalar timeStep);

	btScalar resolveSingleConstraintRowGeneric(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint);
	btScalar resolveSingleConstraintRowGenericSIMD(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint);
	btScalar resolveSingleConstraintRowLowerLimit(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint);
	btScalar resolveSingleConstraintRowLowerLimitSIMD(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint);
	btScalar resolveSplitPenetrationImpulse(btSolverBody & bodyA, btSolverBody & bodyB, const btSolverConstraint& contactConstraint)
	{
		return m_resolveSplitPenetrationImpulse(bodyA, bodyB, contactConstraint);
	}

protected:
	void writeBackContacts(int iBegin, int iEnd, const btContactSolverInfo& infoGlobal);
	void writeBackJoints(int iBegin, int iEnd, const btContactSolverInfo& infoGlobal);
	void writeBackBodies(int iBegin, int iEnd, const btContactSolverInfo& infoGlobal);
	virtual void solveGroupCacheFriendlySplitImpulseIterations(btCollisionObject * *bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer);
	virtual btScalar solveGroupCacheFriendlyFinish(btCollisionObject * *bodies, int numBodies, const btContactSolverInfo& infoGlobal);
	virtual btScalar solveSingleIteration(int iteration, btCollisionObject** bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer);

	virtual btScalar solveGroupCacheFriendlySetup(btCollisionObject * *bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer);
	virtual btScalar solveGroupCacheFriendlyIterations(btCollisionObject * *bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer);

public:
	BT_DECLARE_ALIGNED_ALLOCATOR();

	btSequentialImpulseConstraintSolver();
	virtual ~btSequentialImpulseConstraintSolver();

	virtual btScalar solveGroup(btCollisionObject * *bodies, int numBodies, btPersistentManifold** manifold, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& info, btIDebugDraw* debugDrawer, btDispatcher* dispatcher);

	///clear internal cached data and reset random seed
	virtual void reset();

	unsigned long btRand2();

	int btRandInt2(int n);

	void setRandSeed(unsigned long seed)
	{
		m_btSeed2 = seed;
	}
	unsigned long getRandSeed() const
	{
		return m_btSeed2;
	}

	virtual btConstraintSolverType getSolverType() const
	{
		return BT_SEQUENTIAL_IMPULSE_SOLVER;
	}

	btSingleConstraintRowSolver getActiveConstraintRowSolverGeneric()
	{
		return m_resolveSingleConstraintRowGeneric;
	}
	void setConstraintRowSolverGeneric(btSingleConstraintRowSolver rowSolver)
	{
		m_resolveSingleConstraintRowGeneric = rowSolver;
	}
	btSingleConstraintRowSolver getActiveConstraintRowSolverLowerLimit()
	{
		return m_resolveSingleConstraintRowLowerLimit;
	}
	void setConstraintRowSolverLowerLimit(btSingleConstraintRowSolver rowSolver)
	{
		m_resolveSingleConstraintRowLowerLimit = rowSolver;
	}



	///Various implementations of solving a single constraint row using a generic equality constraint, using scalar reference, SSE2 or SSE4
	btSingleConstraintRowSolver getScalarConstraintRowSolverGeneric();
	btSingleConstraintRowSolver getSSE2ConstraintRowSolverGeneric();
	btSingleConstraintRowSolver getSSE4_1ConstraintRowSolverGeneric();

	///Various implementations of solving a single constraint row using an inequality (lower limit) constraint, using scalar reference, SSE2 or SSE4
	btSingleConstraintRowSolver getScalarConstraintRowSolverLowerLimit();
	btSingleConstraintRowSolver getSSE2ConstraintRowSolverLowerLimit();
	btSingleConstraintRowSolver getSSE4_1ConstraintRowSolverLowerLimit();
	btSolverAnalyticsData m_analyticsData;
};

```

##### btSequentialImpulseConstraintSolver::solveGroup
``` c++
/// btSequentialImpulseConstraintSolver Sequentially applies impulses
btScalar btSequentialImpulseConstraintSolver::solveGroup(btCollisionObject** bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer, btDispatcher* /*dispatcher*/)
{
	BT_PROFILE("solveGroup");
	//you need to provide at least some bodies

	solveGroupCacheFriendlySetup(bodies, numBodies, manifoldPtr, numManifolds, constraints, numConstraints, infoGlobal, debugDrawer);

	solveGroupCacheFriendlyIterations(bodies, numBodies, manifoldPtr, numManifolds, constraints, numConstraints, infoGlobal, debugDrawer);

	solveGroupCacheFriendlyFinish(bodies, numBodies, infoGlobal);

	return 0.f;
}
```

###### btSequentialImpulseConstraintSolver::solveGroupCacheFriendlySetup
``` c++

btScalar btSequentialImpulseConstraintSolver::solveGroupCacheFriendlySetup(btCollisionObject** bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer)
{
	m_fixedBodyId = -1;
	BT_PROFILE("solveGroupCacheFriendlySetup");
	(void)debugDrawer;

	// if solver mode has changed,
	if (infoGlobal.m_solverMode != m_cachedSolverMode)
	{
		// update solver functions to use SIMD or non-SIMD
		bool useSimd = !!(infoGlobal.m_solverMode & SOLVER_SIMD);
		setupSolverFunctions(useSimd);
		m_cachedSolverMode = infoGlobal.m_solverMode;
	}
	m_maxOverrideNumSolverIterations = 0;

#ifdef BT_ADDITIONAL_DEBUG
	//make sure that dynamic bodies exist for all (enabled) constraints
	for (int i = 0; i < numConstraints; i++)
	{
		btTypedConstraint* constraint = constraints[i];
		if (constraint->isEnabled())
		{
			if (!constraint->getRigidBodyA().isStaticOrKinematicObject())
			{
				bool found = false;
				for (int b = 0; b < numBodies; b++)
				{
					if (&constraint->getRigidBodyA() == bodies[b])
					{
						found = true;
						break;
					}
				}
				btAssert(found);
			}
			if (!constraint->getRigidBodyB().isStaticOrKinematicObject())
			{
				bool found = false;
				for (int b = 0; b < numBodies; b++)
				{
					if (&constraint->getRigidBodyB() == bodies[b])
					{
						found = true;
						break;
					}
				}
				btAssert(found);
			}
		}
	}
	//make sure that dynamic bodies exist for all contact manifolds
	for (int i = 0; i < numManifolds; i++)
	{
		if (!manifoldPtr[i]->getBody0()->isStaticOrKinematicObject())
		{
			bool found = false;
			for (int b = 0; b < numBodies; b++)
			{
				if (manifoldPtr[i]->getBody0() == bodies[b])
				{
					found = true;
					break;
				}
			}
			btAssert(found);
		}
		if (!manifoldPtr[i]->getBody1()->isStaticOrKinematicObject())
		{
			bool found = false;
			for (int b = 0; b < numBodies; b++)
			{
				if (manifoldPtr[i]->getBody1() == bodies[b])
				{
					found = true;
					break;
				}
			}
			btAssert(found);
		}
	}
#endif  //BT_ADDITIONAL_DEBUG

	//convert all bodies
	convertBodies(bodies, numBodies, infoGlobal);

	convertJoints(constraints, numConstraints, infoGlobal);

	convertContacts(manifoldPtr, numManifolds, infoGlobal);

	//	btContactSolverInfo info = infoGlobal;

	int numNonContactPool = m_tmpSolverNonContactConstraintPool.size();
	int numConstraintPool = m_tmpSolverContactConstraintPool.size();
	int numFrictionPool = m_tmpSolverContactFrictionConstraintPool.size();

	///@todo: use stack allocator for such temporarily memory, same for solver bodies/constraints
	m_orderNonContactConstraintPool.resizeNoInitialize(numNonContactPool);
	if ((infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS))
		m_orderTmpConstraintPool.resizeNoInitialize(numConstraintPool * 2);
	else
		m_orderTmpConstraintPool.resizeNoInitialize(numConstraintPool);

	m_orderFrictionConstraintPool.resizeNoInitialize(numFrictionPool);
	{
		int i;
		for (i = 0; i < numNonContactPool; i++)
		{
			m_orderNonContactConstraintPool[i] = i;
		}
		for (i = 0; i < numConstraintPool; i++)
		{
			m_orderTmpConstraintPool[i] = i;
		}
		for (i = 0; i < numFrictionPool; i++)
		{
			m_orderFrictionConstraintPool[i] = i;
		}
	}

	return 0.f;
}

```

``` c++
void btSequentialImpulseConstraintSolver::convertBodies(btCollisionObject** bodies, int numBodies, const btContactSolverInfo& infoGlobal)
{
	BT_PROFILE("convertBodies");
	for (int i = 0; i < numBodies; i++)
	{
		bodies[i]->setCompanionId(-1);
	}
#if BT_THREADSAFE
	m_kinematicBodyUniqueIdToSolverBodyTable.resize(0);
#endif  // BT_THREADSAFE

	m_tmpSolverBodyPool.reserve(numBodies + 1);
	m_tmpSolverBodyPool.resize(0);

	//btSolverBody& fixedBody = m_tmpSolverBodyPool.expand();
	//initSolverBody(&fixedBody,0);

	for (int i = 0; i < numBodies; i++)
	{
		int bodyId = getOrInitSolverBody(*bodies[i], infoGlobal.m_timeStep);

		btRigidBody* body = btRigidBody::upcast(bodies[i]);
		if (body && body->getInvMass())
		{
			btSolverBody& solverBody = m_tmpSolverBodyPool[bodyId];
			btVector3 gyroForce(0, 0, 0);
			if (body->getFlags() & BT_ENABLE_GYROSCOPIC_FORCE_EXPLICIT)
			{
				gyroForce = body->computeGyroscopicForceExplicit(infoGlobal.m_maxGyroscopicForce);
				solverBody.m_externalTorqueImpulse -= gyroForce * body->getInvInertiaTensorWorld() * infoGlobal.m_timeStep;
			}
			if (body->getFlags() & BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_WORLD)
			{
				gyroForce = body->computeGyroscopicImpulseImplicit_World(infoGlobal.m_timeStep);
				solverBody.m_externalTorqueImpulse += gyroForce;
			}
			if (body->getFlags() & BT_ENABLE_GYROSCOPIC_FORCE_IMPLICIT_BODY)
			{
				gyroForce = body->computeGyroscopicImpulseImplicit_Body(infoGlobal.m_timeStep);
				solverBody.m_externalTorqueImpulse += gyroForce;
			}
		}
	}
}
```

``` c++
void btSequentialImpulseConstraintSolver::convertContacts(btPersistentManifold** manifoldPtr, int numManifolds, const btContactSolverInfo& infoGlobal)
{
	int i;
	btPersistentManifold* manifold = 0;
	//			btCollisionObject* colObj0=0,*colObj1=0;

	for (i = 0; i < numManifolds; i++)
	{
		manifold = manifoldPtr[i];
		convertContact(manifold, infoGlobal);
	}
}


void btSequentialImpulseConstraintSolver::convertContact(btPersistentManifold* manifold, const btContactSolverInfo& infoGlobal)
{
	btCollisionObject *colObj0 = 0, *colObj1 = 0;

	colObj0 = (btCollisionObject*)manifold->getBody0();
	colObj1 = (btCollisionObject*)manifold->getBody1();

	int solverBodyIdA = getOrInitSolverBody(*colObj0, infoGlobal.m_timeStep);
	int solverBodyIdB = getOrInitSolverBody(*colObj1, infoGlobal.m_timeStep);

	//	btRigidBody* bodyA = btRigidBody::upcast(colObj0);
	//	btRigidBody* bodyB = btRigidBody::upcast(colObj1);

	btSolverBody* solverBodyA = &m_tmpSolverBodyPool[solverBodyIdA];
	btSolverBody* solverBodyB = &m_tmpSolverBodyPool[solverBodyIdB];

	///avoid collision response between two static objects
	if (!solverBodyA || (solverBodyA->m_invMass.fuzzyZero() && (!solverBodyB || solverBodyB->m_invMass.fuzzyZero())))
		return;

	int rollingFriction = 1;
	for (int j = 0; j < manifold->getNumContacts(); j++)
	{
		btManifoldPoint& cp = manifold->getContactPoint(j);

		if (cp.getDistance() <= manifold->getContactProcessingThreshold())
		{
			btVector3 rel_pos1;
			btVector3 rel_pos2;
			btScalar relaxation;

			int frictionIndex = m_tmpSolverContactConstraintPool.size();
			btSolverConstraint& solverConstraint = m_tmpSolverContactConstraintPool.expandNonInitializing();
			solverConstraint.m_solverBodyIdA = solverBodyIdA;
			solverConstraint.m_solverBodyIdB = solverBodyIdB;

			solverConstraint.m_originalContactPoint = &cp;

			const btVector3& pos1 = cp.getPositionWorldOnA();
			const btVector3& pos2 = cp.getPositionWorldOnB();

			rel_pos1 = pos1 - colObj0->getWorldTransform().getOrigin();
			rel_pos2 = pos2 - colObj1->getWorldTransform().getOrigin();

			btVector3 vel1;
			btVector3 vel2;

			solverBodyA->getVelocityInLocalPointNoDelta(rel_pos1, vel1);
			solverBodyB->getVelocityInLocalPointNoDelta(rel_pos2, vel2);

			btVector3 vel = vel1 - vel2;
			btScalar rel_vel = cp.m_normalWorldOnB.dot(vel);

			setupContactConstraint(solverConstraint, solverBodyIdA, solverBodyIdB, cp, infoGlobal, relaxation, rel_pos1, rel_pos2);

			/////setup the friction constraints

			solverConstraint.m_frictionIndex = m_tmpSolverContactFrictionConstraintPool.size();

			if ((cp.m_combinedRollingFriction > 0.f) && (rollingFriction > 0))
			{
				{
					addTorsionalFrictionConstraint(cp.m_normalWorldOnB, solverBodyIdA, solverBodyIdB, frictionIndex, cp, cp.m_combinedSpinningFriction, rel_pos1, rel_pos2, colObj0, colObj1, relaxation);
					btVector3 axis0, axis1;
					btPlaneSpace1(cp.m_normalWorldOnB, axis0, axis1);
					axis0.normalize();
					axis1.normalize();

					applyAnisotropicFriction(colObj0, axis0, btCollisionObject::CF_ANISOTROPIC_ROLLING_FRICTION);
					applyAnisotropicFriction(colObj1, axis0, btCollisionObject::CF_ANISOTROPIC_ROLLING_FRICTION);
					applyAnisotropicFriction(colObj0, axis1, btCollisionObject::CF_ANISOTROPIC_ROLLING_FRICTION);
					applyAnisotropicFriction(colObj1, axis1, btCollisionObject::CF_ANISOTROPIC_ROLLING_FRICTION);
					if (axis0.length() > 0.001)
						addTorsionalFrictionConstraint(axis0, solverBodyIdA, solverBodyIdB, frictionIndex, cp,
							cp.m_combinedRollingFriction, rel_pos1, rel_pos2, colObj0, colObj1, relaxation);
					if (axis1.length() > 0.001)
						addTorsionalFrictionConstraint(axis1, solverBodyIdA, solverBodyIdB, frictionIndex, cp,
							cp.m_combinedRollingFriction, rel_pos1, rel_pos2, colObj0, colObj1, relaxation);
					}
				}

			///Bullet has several options to set the friction directions
			///By default, each contact has only a single friction direction that is recomputed automatically very frame
			///based on the relative linear velocity.
			///If the relative velocity it zero, it will automatically compute a friction direction.

			///You can also enable two friction directions, using the SOLVER_USE_2_FRICTION_DIRECTIONS.
			///In that case, the second friction direction will be orthogonal to both contact normal and first friction direction.
			///
			///If you choose SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION, then the friction will be independent from the relative projected velocity.
			///
			///The user can manually override the friction directions for certain contacts using a contact callback,
			///and use contactPoint.m_contactPointFlags |= BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED
			///In that case, you can set the target relative motion in each friction direction (cp.m_contactMotion1 and cp.m_contactMotion2)
			///this will give a conveyor belt effect
			///

			if (!(infoGlobal.m_solverMode & SOLVER_ENABLE_FRICTION_DIRECTION_CACHING) || !(cp.m_contactPointFlags & BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED))
			{
				cp.m_lateralFrictionDir1 = vel - cp.m_normalWorldOnB * rel_vel;
				btScalar lat_rel_vel = cp.m_lateralFrictionDir1.length2();
				if (!(infoGlobal.m_solverMode & SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION) && lat_rel_vel > SIMD_EPSILON)
				{
					cp.m_lateralFrictionDir1 *= 1.f / btSqrt(lat_rel_vel);
					applyAnisotropicFriction(colObj0, cp.m_lateralFrictionDir1, btCollisionObject::CF_ANISOTROPIC_FRICTION);
					applyAnisotropicFriction(colObj1, cp.m_lateralFrictionDir1, btCollisionObject::CF_ANISOTROPIC_FRICTION);
					addFrictionConstraint(cp.m_lateralFrictionDir1, solverBodyIdA, solverBodyIdB, frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1, relaxation, infoGlobal);

					if ((infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS))
					{
						cp.m_lateralFrictionDir2 = cp.m_lateralFrictionDir1.cross(cp.m_normalWorldOnB);
						cp.m_lateralFrictionDir2.normalize();  //??
						applyAnisotropicFriction(colObj0, cp.m_lateralFrictionDir2, btCollisionObject::CF_ANISOTROPIC_FRICTION);
						applyAnisotropicFriction(colObj1, cp.m_lateralFrictionDir2, btCollisionObject::CF_ANISOTROPIC_FRICTION);
						addFrictionConstraint(cp.m_lateralFrictionDir2, solverBodyIdA, solverBodyIdB, frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1, relaxation, infoGlobal);
					}
				}
				else
				{
					btPlaneSpace1(cp.m_normalWorldOnB, cp.m_lateralFrictionDir1, cp.m_lateralFrictionDir2);

					applyAnisotropicFriction(colObj0, cp.m_lateralFrictionDir1, btCollisionObject::CF_ANISOTROPIC_FRICTION);
					applyAnisotropicFriction(colObj1, cp.m_lateralFrictionDir1, btCollisionObject::CF_ANISOTROPIC_FRICTION);
					addFrictionConstraint(cp.m_lateralFrictionDir1, solverBodyIdA, solverBodyIdB, frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1, relaxation, infoGlobal);

					if ((infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS))
					{
						applyAnisotropicFriction(colObj0, cp.m_lateralFrictionDir2, btCollisionObject::CF_ANISOTROPIC_FRICTION);
						applyAnisotropicFriction(colObj1, cp.m_lateralFrictionDir2, btCollisionObject::CF_ANISOTROPIC_FRICTION);
						addFrictionConstraint(cp.m_lateralFrictionDir2, solverBodyIdA, solverBodyIdB, frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1, relaxation, infoGlobal);
					}

					if ((infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS) && (infoGlobal.m_solverMode & SOLVER_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION))
					{
						cp.m_contactPointFlags |= BT_CONTACT_FLAG_LATERAL_FRICTION_INITIALIZED;
					}
				}
			}
			else
			{
				addFrictionConstraint(cp.m_lateralFrictionDir1, solverBodyIdA, solverBodyIdB, frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1, relaxation, infoGlobal, cp.m_contactMotion1, cp.m_frictionCFM);

				if ((infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS))
					addFrictionConstraint(cp.m_lateralFrictionDir2, solverBodyIdA, solverBodyIdB, frictionIndex, cp, rel_pos1, rel_pos2, colObj0, colObj1, relaxation, infoGlobal, cp.m_contactMotion2, cp.m_frictionCFM);
				}
			setFrictionConstraintImpulse(solverConstraint, solverBodyIdA, solverBodyIdB, cp, infoGlobal);
			}
		}
	}
```

##### btSequentialImpulseConstraintSolver::solveGroupCacheFriendlyIterations
``` c++

btScalar btSequentialImpulseConstraintSolver::solveGroupCacheFriendlyIterations(btCollisionObject** bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer)
{
	BT_PROFILE("solveGroupCacheFriendlyIterations");

	{
		///this is a special step to resolve penetrations (just for contacts)
		solveGroupCacheFriendlySplitImpulseIterations(bodies, numBodies, manifoldPtr, numManifolds, constraints, numConstraints, infoGlobal, debugDrawer);

		int maxIterations = m_maxOverrideNumSolverIterations > infoGlobal.m_numIterations ? m_maxOverrideNumSolverIterations : infoGlobal.m_numIterations;

		for (int iteration = 0; iteration < maxIterations; iteration++)
			//for ( int iteration = maxIterations-1  ; iteration >= 0;iteration--)
		{
			m_leastSquaresResidual = solveSingleIteration(iteration, bodies, numBodies, manifoldPtr, numManifolds, constraints, numConstraints, infoGlobal, debugDrawer);

			if (m_leastSquaresResidual <= infoGlobal.m_leastSquaresResidualThreshold || (iteration >= (maxIterations - 1)))
			{
				m_analyticsData.m_numSolverCalls++;
				m_analyticsData.m_numIterationsUsed = iteration+1;
				m_analyticsData.m_islandId = -2;
				if (numBodies>0)
					m_analyticsData.m_islandId = bodies[0]->getCompanionId();
				m_analyticsData.m_numBodies = numBodies;
				m_analyticsData.m_numContactManifolds = numManifolds;
				m_analyticsData.m_remainingLeastSquaresResidual = m_leastSquaresResidual;
				break;
			}
		}
	}
	return 0.f;
}


void btSequentialImpulseConstraintSolver::solveGroupCacheFriendlySplitImpulseIterations(btCollisionObject** bodies, int numBodies, btPersistentManifold** manifoldPtr, int numManifolds, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* debugDrawer)
{
	BT_PROFILE("solveGroupCacheFriendlySplitImpulseIterations");
	int iteration;
	if (infoGlobal.m_splitImpulse)
	{
		{
			for (iteration = 0; iteration < infoGlobal.m_numIterations; iteration++)
			{
				btScalar leastSquaresResidual = 0.f;
				{
					int numPoolConstraints = m_tmpSolverContactConstraintPool.size();
					int j;
					for (j = 0; j < numPoolConstraints; j++)
					{
						const btSolverConstraint& solveManifold = m_tmpSolverContactConstraintPool[m_orderTmpConstraintPool[j]];

						btScalar residual = resolveSplitPenetrationImpulse(m_tmpSolverBodyPool[solveManifold.m_solverBodyIdA], m_tmpSolverBodyPool[solveManifold.m_solverBodyIdB], solveManifold);
						leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
					}
				}
				if (leastSquaresResidual <= infoGlobal.m_leastSquaresResidualThreshold || iteration >= (infoGlobal.m_numIterations - 1))
				{
					break;
				}
			}
		}
	}
}


btScalar btSequentialImpulseConstraintSolver::solveSingleIteration(int iteration, btCollisionObject** /*bodies */, int /*numBodies*/, btPersistentManifold** /*manifoldPtr*/, int /*numManifolds*/, btTypedConstraint** constraints, int numConstraints, const btContactSolverInfo& infoGlobal, btIDebugDraw* /*debugDrawer*/)
{
	BT_PROFILE("solveSingleIteration");
	btScalar leastSquaresResidual = 0.f;

	int numNonContactPool = m_tmpSolverNonContactConstraintPool.size();
	int numConstraintPool = m_tmpSolverContactConstraintPool.size();
	int numFrictionPool = m_tmpSolverContactFrictionConstraintPool.size();

	if (infoGlobal.m_solverMode & SOLVER_RANDMIZE_ORDER)
	{
		if (1)  // uncomment this for a bit less random ((iteration & 7) == 0)
		{
			for (int j = 0; j < numNonContactPool; ++j)
			{
				int tmp = m_orderNonContactConstraintPool[j];
				int swapi = btRandInt2(j + 1);
				m_orderNonContactConstraintPool[j] = m_orderNonContactConstraintPool[swapi];
				m_orderNonContactConstraintPool[swapi] = tmp;
			}

			//contact/friction constraints are not solved more than
			if (iteration < infoGlobal.m_numIterations)
			{
				for (int j = 0; j < numConstraintPool; ++j)
				{
					int tmp = m_orderTmpConstraintPool[j];
					int swapi = btRandInt2(j + 1);
					m_orderTmpConstraintPool[j] = m_orderTmpConstraintPool[swapi];
					m_orderTmpConstraintPool[swapi] = tmp;
				}

				for (int j = 0; j < numFrictionPool; ++j)
				{
					int tmp = m_orderFrictionConstraintPool[j];
					int swapi = btRandInt2(j + 1);
					m_orderFrictionConstraintPool[j] = m_orderFrictionConstraintPool[swapi];
					m_orderFrictionConstraintPool[swapi] = tmp;
				}
			}
		}
	}

	///solve all joint constraints
	for (int j = 0; j < m_tmpSolverNonContactConstraintPool.size(); j++)
	{
		btSolverConstraint& constraint = m_tmpSolverNonContactConstraintPool[m_orderNonContactConstraintPool[j]];
		if (iteration < constraint.m_overrideNumSolverIterations)
		{
			btScalar residual = resolveSingleConstraintRowGeneric(m_tmpSolverBodyPool[constraint.m_solverBodyIdA], m_tmpSolverBodyPool[constraint.m_solverBodyIdB], constraint);
			leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
		}
	}

	if (iteration < infoGlobal.m_numIterations)
	{
		for (int j = 0; j < numConstraints; j++)
		{
			if (constraints[j]->isEnabled())
			{
				int bodyAid = getOrInitSolverBody(constraints[j]->getRigidBodyA(), infoGlobal.m_timeStep);
				int bodyBid = getOrInitSolverBody(constraints[j]->getRigidBodyB(), infoGlobal.m_timeStep);
				btSolverBody& bodyA = m_tmpSolverBodyPool[bodyAid];
				btSolverBody& bodyB = m_tmpSolverBodyPool[bodyBid];
				constraints[j]->solveConstraintObsolete(bodyA, bodyB, infoGlobal.m_timeStep);
			}
		}

		///solve all contact constraints
		if (infoGlobal.m_solverMode & SOLVER_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS)
		{
			int numPoolConstraints = m_tmpSolverContactConstraintPool.size();
			int multiplier = (infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS) ? 2 : 1;

			for (int c = 0; c < numPoolConstraints; c++)
			{
				btScalar totalImpulse = 0;

				{
					const btSolverConstraint& solveManifold = m_tmpSolverContactConstraintPool[m_orderTmpConstraintPool[c]];
					btScalar residual = resolveSingleConstraintRowLowerLimit(m_tmpSolverBodyPool[solveManifold.m_solverBodyIdA], m_tmpSolverBodyPool[solveManifold.m_solverBodyIdB], solveManifold);
					leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);

					totalImpulse = solveManifold.m_appliedImpulse;
				}
				bool applyFriction = true;
				if (applyFriction)
				{
					{
						btSolverConstraint& solveManifold = m_tmpSolverContactFrictionConstraintPool[m_orderFrictionConstraintPool[c * multiplier]];

						if (totalImpulse > btScalar(0))
						{
							solveManifold.m_lowerLimit = -(solveManifold.m_friction * totalImpulse);
							solveManifold.m_upperLimit = solveManifold.m_friction * totalImpulse;

							btScalar residual = resolveSingleConstraintRowGeneric(m_tmpSolverBodyPool[solveManifold.m_solverBodyIdA], m_tmpSolverBodyPool[solveManifold.m_solverBodyIdB], solveManifold);
							leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
						}
					}

					if (infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS)
					{
						btSolverConstraint& solveManifold = m_tmpSolverContactFrictionConstraintPool[m_orderFrictionConstraintPool[c * multiplier + 1]];

						if (totalImpulse > btScalar(0))
						{
							solveManifold.m_lowerLimit = -(solveManifold.m_friction * totalImpulse);
							solveManifold.m_upperLimit = solveManifold.m_friction * totalImpulse;

							btScalar residual = resolveSingleConstraintRowGeneric(m_tmpSolverBodyPool[solveManifold.m_solverBodyIdA], m_tmpSolverBodyPool[solveManifold.m_solverBodyIdB], solveManifold);
							leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
						}
					}
				}
			}
		}
		else  //SOLVER_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS
		{
			//solve the friction constraints after all contact constraints, don't interleave them
			int numPoolConstraints = m_tmpSolverContactConstraintPool.size();
			int j;

			for (j = 0; j < numPoolConstraints; j++)
			{
				const btSolverConstraint& solveManifold = m_tmpSolverContactConstraintPool[m_orderTmpConstraintPool[j]];
				btScalar residual = resolveSingleConstraintRowLowerLimit(m_tmpSolverBodyPool[solveManifold.m_solverBodyIdA], m_tmpSolverBodyPool[solveManifold.m_solverBodyIdB], solveManifold);
				leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
			}

			///solve all friction constraints

			int numFrictionPoolConstraints = m_tmpSolverContactFrictionConstraintPool.size();
			for (j = 0; j < numFrictionPoolConstraints; j++)
			{
				btSolverConstraint& solveManifold = m_tmpSolverContactFrictionConstraintPool[m_orderFrictionConstraintPool[j]];
				btScalar totalImpulse = m_tmpSolverContactConstraintPool[solveManifold.m_frictionIndex].m_appliedImpulse;

				if (totalImpulse > btScalar(0))
				{
					solveManifold.m_lowerLimit = -(solveManifold.m_friction * totalImpulse);
					solveManifold.m_upperLimit = solveManifold.m_friction * totalImpulse;

					btScalar residual = resolveSingleConstraintRowGeneric(m_tmpSolverBodyPool[solveManifold.m_solverBodyIdA], m_tmpSolverBodyPool[solveManifold.m_solverBodyIdB], solveManifold);
					leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
				}
			}
		}

		int numRollingFrictionPoolConstraints = m_tmpSolverContactRollingFrictionConstraintPool.size();
		for (int j = 0; j < numRollingFrictionPoolConstraints; j++)
		{
			btSolverConstraint& rollingFrictionConstraint = m_tmpSolverContactRollingFrictionConstraintPool[j];
			btScalar totalImpulse = m_tmpSolverContactConstraintPool[rollingFrictionConstraint.m_frictionIndex].m_appliedImpulse;
			if (totalImpulse > btScalar(0))
			{
				btScalar rollingFrictionMagnitude = rollingFrictionConstraint.m_friction * totalImpulse;
				if (rollingFrictionMagnitude > rollingFrictionConstraint.m_friction)
					rollingFrictionMagnitude = rollingFrictionConstraint.m_friction;

				rollingFrictionConstraint.m_lowerLimit = -rollingFrictionMagnitude;
				rollingFrictionConstraint.m_upperLimit = rollingFrictionMagnitude;

				btScalar residual = resolveSingleConstraintRowGeneric(m_tmpSolverBodyPool[rollingFrictionConstraint.m_solverBodyIdA], m_tmpSolverBodyPool[rollingFrictionConstraint.m_solverBodyIdB], rollingFrictionConstraint);
				leastSquaresResidual = btMax(leastSquaresResidual, residual * residual);
			}
		}
	}
	return leastSquaresResidual;
}

```
##### btSequentialImpulseConstraintSolver::solveGroupCacheFriendlyFinish

``` c++

btScalar btSequentialImpulseConstraintSolver::solveGroupCacheFriendlyFinish(btCollisionObject** bodies, int numBodies, const btContactSolverInfo& infoGlobal)
{
	BT_PROFILE("solveGroupCacheFriendlyFinish");

	if (infoGlobal.m_solverMode & SOLVER_USE_WARMSTARTING)
	{
		writeBackContacts(0, m_tmpSolverContactConstraintPool.size(), infoGlobal);
	}

	writeBackJoints(0, m_tmpSolverNonContactConstraintPool.size(), infoGlobal);
	writeBackBodies(0, m_tmpSolverBodyPool.size(), infoGlobal);

	m_tmpSolverContactConstraintPool.resizeNoInitialize(0);
	m_tmpSolverNonContactConstraintPool.resizeNoInitialize(0);
	m_tmpSolverContactFrictionConstraintPool.resizeNoInitialize(0);
	m_tmpSolverContactRollingFrictionConstraintPool.resizeNoInitialize(0);

	m_tmpSolverBodyPool.resizeNoInitialize(0);
	return 0.f;
}
```

``` c++

void btSequentialImpulseConstraintSolver::writeBackContacts(int iBegin, int iEnd, const btContactSolverInfo& infoGlobal)
{
	for (int j = iBegin; j < iEnd; j++)
	{
		const btSolverConstraint& solveManifold = m_tmpSolverContactConstraintPool[j];
		btManifoldPoint* pt = (btManifoldPoint*)solveManifold.m_originalContactPoint;
		btAssert(pt);
		pt->m_appliedImpulse = solveManifold.m_appliedImpulse;
		//	float f = m_tmpSolverContactFrictionConstraintPool[solveManifold.m_frictionIndex].m_appliedImpulse;
		//	printf("pt->m_appliedImpulseLateral1 = %f\n", f);
		pt->m_appliedImpulseLateral1 = m_tmpSolverContactFrictionConstraintPool[solveManifold.m_frictionIndex].m_appliedImpulse;
		//printf("pt->m_appliedImpulseLateral1 = %f\n", pt->m_appliedImpulseLateral1);
		if ((infoGlobal.m_solverMode & SOLVER_USE_2_FRICTION_DIRECTIONS))
		{
			pt->m_appliedImpulseLateral2 = m_tmpSolverContactFrictionConstraintPool[solveManifold.m_frictionIndex + 1].m_appliedImpulse;
		}
		//do a callback here?
	}
}

void btSequentialImpulseConstraintSolver::writeBackJoints(int iBegin, int iEnd, const btContactSolverInfo& infoGlobal)
{
	for (int j = iBegin; j < iEnd; j++)
	{
		const btSolverConstraint& solverConstr = m_tmpSolverNonContactConstraintPool[j];
		btTypedConstraint* constr = (btTypedConstraint*)solverConstr.m_originalContactPoint;
		btJointFeedback* fb = constr->getJointFeedback();
		if (fb)
		{
			fb->m_appliedForceBodyA += solverConstr.m_contactNormal1 * solverConstr.m_appliedImpulse * constr->getRigidBodyA().getLinearFactor() / infoGlobal.m_timeStep;
			fb->m_appliedForceBodyB += solverConstr.m_contactNormal2 * solverConstr.m_appliedImpulse * constr->getRigidBodyB().getLinearFactor() / infoGlobal.m_timeStep;
			fb->m_appliedTorqueBodyA += solverConstr.m_relpos1CrossNormal * constr->getRigidBodyA().getAngularFactor() * solverConstr.m_appliedImpulse / infoGlobal.m_timeStep;
			fb->m_appliedTorqueBodyB += solverConstr.m_relpos2CrossNormal * constr->getRigidBodyB().getAngularFactor() * solverConstr.m_appliedImpulse / infoGlobal.m_timeStep; /*RGM ???? */
		}

		constr->internalSetAppliedImpulse(solverConstr.m_appliedImpulse);
		if (btFabs(solverConstr.m_appliedImpulse) >= constr->getBreakingImpulseThreshold())
		{
			constr->setEnabled(false);
		}
	}
}

void btSequentialImpulseConstraintSolver::writeBackBodies(int iBegin, int iEnd, const btContactSolverInfo& infoGlobal)
{
	for (int i = iBegin; i < iEnd; i++)
	{
		btRigidBody* body = m_tmpSolverBodyPool[i].m_originalBody;
		if (body)
		{
			if (infoGlobal.m_splitImpulse)
				m_tmpSolverBodyPool[i].writebackVelocityAndTransform(infoGlobal.m_timeStep, infoGlobal.m_splitImpulseTurnErp);
			else
				m_tmpSolverBodyPool[i].writebackVelocity();

			m_tmpSolverBodyPool[i].m_originalBody->setLinearVelocity(
				m_tmpSolverBodyPool[i].m_linearVelocity +
				m_tmpSolverBodyPool[i].m_externalForceImpulse);

			m_tmpSolverBodyPool[i].m_originalBody->setAngularVelocity(
				m_tmpSolverBodyPool[i].m_angularVelocity +
				m_tmpSolverBodyPool[i].m_externalTorqueImpulse);

			if (infoGlobal.m_splitImpulse)
				m_tmpSolverBodyPool[i].m_originalBody->setWorldTransform(m_tmpSolverBodyPool[i].m_worldTransform);

			m_tmpSolverBodyPool[i].m_originalBody->setCompanionId(-1);
		}
	}
}
```

##### getOrInitSolverBody

``` c++

int btSequentialImpulseConstraintSolver::getOrInitSolverBody(btCollisionObject& body, btScalar timeStep)
{
#if BT_THREADSAFE
	int solverBodyId = -1;
	const bool isRigidBodyType = btRigidBody::upcast(&body) != NULL;
	const bool isStaticOrKinematic = body.isStaticOrKinematicObject();
	const bool isKinematic = body.isKinematicObject();
	if (isRigidBodyType && !isStaticOrKinematic)
	{
		// dynamic body
		// Dynamic bodies can only be in one island, so it's safe to write to the companionId
		solverBodyId = body.getCompanionId();
		if (solverBodyId < 0)
		{
			solverBodyId = m_tmpSolverBodyPool.size();
			btSolverBody& solverBody = m_tmpSolverBodyPool.expand();
			initSolverBody(&solverBody, &body, timeStep);
			body.setCompanionId(solverBodyId);
		}
	}
	else if (isRigidBodyType && isKinematic)
	{
		//
		// NOTE: must test for kinematic before static because some kinematic objects also
		//   identify as "static"
		//
		// Kinematic bodies can be in multiple islands at once, so it is a
		// race condition to write to them, so we use an alternate method
		// to record the solverBodyId
		int uniqueId = body.getWorldArrayIndex();
		const int INVALID_SOLVER_BODY_ID = -1;
		if (uniqueId >= m_kinematicBodyUniqueIdToSolverBodyTable.size())
		{
			m_kinematicBodyUniqueIdToSolverBodyTable.resize(uniqueId + 1, INVALID_SOLVER_BODY_ID);
		}
		solverBodyId = m_kinematicBodyUniqueIdToSolverBodyTable[uniqueId];
		// if no table entry yet,
		if (solverBodyId == INVALID_SOLVER_BODY_ID)
		{
			// create a table entry for this body
			solverBodyId = m_tmpSolverBodyPool.size();
			btSolverBody& solverBody = m_tmpSolverBodyPool.expand();
			initSolverBody(&solverBody, &body, timeStep);
			m_kinematicBodyUniqueIdToSolverBodyTable[uniqueId] = solverBodyId;
		}
	}
	else
	{
		bool isMultiBodyType = (body.getInternalType() & btCollisionObject::CO_FEATHERSTONE_LINK);
		// Incorrectly set collision object flags can degrade performance in various ways.
		if (!isMultiBodyType)
		{
			btAssert(body.isStaticOrKinematicObject());
		}
		//it could be a multibody link collider
		// all fixed bodies (inf mass) get mapped to a single solver id
		if (m_fixedBodyId < 0)
		{
			m_fixedBodyId = m_tmpSolverBodyPool.size();
			btSolverBody& fixedBody = m_tmpSolverBodyPool.expand();
			initSolverBody(&fixedBody, 0, timeStep);
		}
		solverBodyId = m_fixedBodyId;
	}
	btAssert(solverBodyId >= 0 && solverBodyId < m_tmpSolverBodyPool.size());
	return solverBodyId;
#else   // BT_THREADSAFE

	int solverBodyIdA = -1;

	if (body.getCompanionId() >= 0)
	{
		//body has already been converted
		solverBodyIdA = body.getCompanionId();
		btAssert(solverBodyIdA < m_tmpSolverBodyPool.size());
	}
	else
	{
		btRigidBody* rb = btRigidBody::upcast(&body);
		//convert both active and kinematic objects (for their velocity)
		if (rb && (rb->getInvMass() || rb->isKinematicObject()))
		{
			solverBodyIdA = m_tmpSolverBodyPool.size();
			btSolverBody& solverBody = m_tmpSolverBodyPool.expand();
			initSolverBody(&solverBody, &body, timeStep);
			body.setCompanionId(solverBodyIdA);
		}
		else
		{
			if (m_fixedBodyId < 0)
			{
				m_fixedBodyId = m_tmpSolverBodyPool.size();
				btSolverBody& fixedBody = m_tmpSolverBodyPool.expand();
				initSolverBody(&fixedBody, 0, timeStep);
			}
			return m_fixedBodyId;
			//			return 0;//assume first one is a fixed solver body
		}
	}

	return solverBodyIdA;
#endif  // BT_THREADSAFE
}


void btSequentialImpulseConstraintSolver::initSolverBody(btSolverBody* solverBody, btCollisionObject* collisionObject, btScalar timeStep)
{
	btRigidBody* rb = collisionObject ? btRigidBody::upcast(collisionObject) : 0;

	solverBody->internalGetDeltaLinearVelocity().setValue(0.f, 0.f, 0.f);
	solverBody->internalGetDeltaAngularVelocity().setValue(0.f, 0.f, 0.f);
	solverBody->internalGetPushVelocity().setValue(0.f, 0.f, 0.f);
	solverBody->internalGetTurnVelocity().setValue(0.f, 0.f, 0.f);

	if (rb)
	{
		solverBody->m_worldTransform = rb->getWorldTransform();
		solverBody->internalSetInvMass(btVector3(rb->getInvMass(), rb->getInvMass(), rb->getInvMass()) * rb->getLinearFactor());
		solverBody->m_originalBody = rb;
		solverBody->m_angularFactor = rb->getAngularFactor();
		solverBody->m_linearFactor = rb->getLinearFactor();
		solverBody->m_linearVelocity = rb->getLinearVelocity();
		solverBody->m_angularVelocity = rb->getAngularVelocity();
		solverBody->m_externalForceImpulse = rb->getTotalForce() * rb->getInvMass() * timeStep;
		solverBody->m_externalTorqueImpulse = rb->getTotalTorque() * rb->getInvInertiaTensorWorld() * timeStep;
	}
	else
		{
		solverBody->m_worldTransform.setIdentity();
		solverBody->internalSetInvMass(btVector3(0, 0, 0));
		solverBody->m_originalBody = 0;
		solverBody->m_angularFactor.setValue(1, 1, 1);
		solverBody->m_linearFactor.setValue(1, 1, 1);
		solverBody->m_linearVelocity.setValue(0, 0, 0);
		solverBody->m_angularVelocity.setValue(0, 0, 0);
		solverBody->m_externalForceImpulse.setValue(0, 0, 0);
		solverBody->m_externalTorqueImpulse.setValue(0, 0, 0);
					}
				}
```

#### InplaceSolverIslandCallback
``` c++
struct IslandCallback
{
	virtual ~IslandCallback(){};

	virtual void processIsland(btCollisionObject** bodies, int numBodies, class btPersistentManifold** manifolds, int numManifolds, int islandId) = 0;
};
struct InplaceSolverIslandCallback : public btSimulationIslandManager::IslandCallback
{
	btContactSolverInfo* m_solverInfo;
	btConstraintSolver* m_solver;
	btTypedConstraint** m_sortedConstraints;
	int m_numConstraints;
	btIDebugDraw* m_debugDrawer;
	btDispatcher* m_dispatcher;

	btAlignedObjectArray<btCollisionObject*> m_bodies;
	btAlignedObjectArray<btPersistentManifold*> m_manifolds;
	btAlignedObjectArray<btTypedConstraint*> m_constraints;

	InplaceSolverIslandCallback(
		btConstraintSolver* solver,
		btStackAlloc* stackAlloc,
		btDispatcher* dispatcher)
		: m_solverInfo(NULL),
		  m_solver(solver),
		  m_sortedConstraints(NULL),
		  m_numConstraints(0),
		  m_debugDrawer(NULL),
		  m_dispatcher(dispatcher)
	{
	}

	InplaceSolverIslandCallback& operator=(InplaceSolverIslandCallback& other)
	{
		btAssert(0);
		(void)other;
		return *this;
	}

	SIMD_FORCE_INLINE void setup(btContactSolverInfo* solverInfo, btTypedConstraint** sortedConstraints, int numConstraints, btIDebugDraw* debugDrawer)
	{
		btAssert(solverInfo);
		m_solverInfo = solverInfo;
		m_sortedConstraints = sortedConstraints;
		m_numConstraints = numConstraints;
		m_debugDrawer = debugDrawer;
		m_bodies.resize(0);
		m_manifolds.resize(0);
		m_constraints.resize(0);
	}

	virtual void processIsland(btCollisionObject** bodies, int numBodies, btPersistentManifold** manifolds, int numManifolds, int islandId)
	{
		if (islandId < 0)
		{
			///we don't split islands, so all constraints/contact manifolds/bodies are passed into the solver regardless the island id
			m_solver->solveGroup(bodies, numBodies, manifolds, numManifolds, &m_sortedConstraints[0], m_numConstraints, *m_solverInfo, m_debugDrawer, m_dispatcher);
		}
		else
		{
			//also add all non-contact constraints/joints for this island
			btTypedConstraint** startConstraint = 0;
			int numCurConstraints = 0;
			int i;

			//find the first constraint for this island
			for (i = 0; i < m_numConstraints; i++)
			{
				if (btGetConstraintIslandId(m_sortedConstraints[i]) == islandId)
				{
					startConstraint = &m_sortedConstraints[i];
					break;
				}
			}
			//count the number of constraints in this island
			for (; i < m_numConstraints; i++)
			{
				if (btGetConstraintIslandId(m_sortedConstraints[i]) == islandId)
				{
					numCurConstraints++;
				}
			}

			if (m_solverInfo->m_minimumSolverBatchSize <= 1)
			{
				m_solver->solveGroup(bodies, numBodies, manifolds, numManifolds, startConstraint, numCurConstraints, *m_solverInfo, m_debugDrawer, m_dispatcher);
			}
			else
			{
				for (i = 0; i < numBodies; i++)
					m_bodies.push_back(bodies[i]);
				for (i = 0; i < numManifolds; i++)
					m_manifolds.push_back(manifolds[i]);
				for (i = 0; i < numCurConstraints; i++)
					m_constraints.push_back(startConstraint[i]);
				if ((m_constraints.size() + m_manifolds.size()) > m_solverInfo->m_minimumSolverBatchSize)
				{
					processConstraints();
				}
				else
				{
					//printf("deferred\n");
				}
			}
		}
	}
	void processConstraints()
	{
		btCollisionObject** bodies = m_bodies.size() ? &m_bodies[0] : 0;
		btPersistentManifold** manifold = m_manifolds.size() ? &m_manifolds[0] : 0;
		btTypedConstraint** constraints = m_constraints.size() ? &m_constraints[0] : 0;

		m_solver->solveGroup(bodies, m_bodies.size(), manifold, m_manifolds.size(), constraints, m_constraints.size(), *m_solverInfo, m_debugDrawer, m_dispatcher);
		m_bodies.resize(0);
		m_manifolds.resize(0);
		m_constraints.resize(0);
	}
};

```

### btSimulationIslandManager

``` c++

///@todo: this is random access, it can be walked 'cache friendly'!
void btSimulationIslandManager::buildAndProcessIslands(btDispatcher* dispatcher, btCollisionWorld* collisionWorld, IslandCallback* callback)
{
	buildIslands(dispatcher, collisionWorld);
    processIslands(dispatcher, collisionWorld, callback);
}

void btSimulationIslandManager::buildIslands(btDispatcher* dispatcher, btCollisionWorld* collisionWorld)
{
	BT_PROFILE("islandUnionFindAndQuickSort");

	btCollisionObjectArray& collisionObjects = collisionWorld->getCollisionObjectArray();

	m_islandmanifold.resize(0);

	//we are going to sort the unionfind array, and store the element id in the size
	//afterwards, we clean unionfind, to make sure no-one uses it anymore

	getUnionFind().sortIslands();
	int numElem = getUnionFind().getNumElements();

	int endIslandIndex = 1;
	int startIslandIndex;

	//update the sleeping state for bodies, if all are sleeping
	for (startIslandIndex = 0; startIslandIndex < numElem; startIslandIndex = endIslandIndex)
	{
		int islandId = getUnionFind().getElement(startIslandIndex).m_id;
		for (endIslandIndex = startIslandIndex + 1; (endIslandIndex < numElem) && (getUnionFind().getElement(endIslandIndex).m_id == islandId); endIslandIndex++)
		{
		}

		//int numSleeping = 0;

		bool allSleeping = true;

		int idx;
		for (idx = startIslandIndex; idx < endIslandIndex; idx++)
		{
			int i = getUnionFind().getElement(idx).m_sz;

			btCollisionObject* colObj0 = collisionObjects[i];
			if ((colObj0->getIslandTag() != islandId) && (colObj0->getIslandTag() != -1))
			{
				//				printf("error in island management\n");
			}

            btAssert((colObj0->getIslandTag() == islandId) || (colObj0->getIslandTag() == -1));
			if (colObj0->getIslandTag() == islandId)
			{
				if (colObj0->getActivationState() == ACTIVE_TAG ||
					colObj0->getActivationState() == DISABLE_DEACTIVATION)
				{
					allSleeping = false;
					break;
				}
			}
		}

		if (allSleeping)
		{
			int idx;
			for (idx = startIslandIndex; idx < endIslandIndex; idx++)
			{
				int i = getUnionFind().getElement(idx).m_sz;
				btCollisionObject* colObj0 = collisionObjects[i];
				if ((colObj0->getIslandTag() != islandId) && (colObj0->getIslandTag() != -1))
				{
					//					printf("error in island management\n");
				}

                btAssert((colObj0->getIslandTag() == islandId) || (colObj0->getIslandTag() == -1));

				if (colObj0->getIslandTag() == islandId)
				{
					colObj0->setActivationState(ISLAND_SLEEPING);
				}
			}
		}
		else
		{
			int idx;
			for (idx = startIslandIndex; idx < endIslandIndex; idx++)
			{
				int i = getUnionFind().getElement(idx).m_sz;

				btCollisionObject* colObj0 = collisionObjects[i];
				if ((colObj0->getIslandTag() != islandId) && (colObj0->getIslandTag() != -1))
				{
					//					printf("error in island management\n");
				}

                 btAssert((colObj0->getIslandTag() == islandId) || (colObj0->getIslandTag() == -1));


				if (colObj0->getIslandTag() == islandId)
				{
					if (colObj0->getActivationState() == ISLAND_SLEEPING)
					{
						colObj0->setActivationState(WANTS_DEACTIVATION);
						colObj0->setDeactivationTime(0.f);
					}
				}
			}
		}
	}

	int i;
	int maxNumManifolds = dispatcher->getNumManifolds();

	//#define SPLIT_ISLANDS 1
	//#ifdef SPLIT_ISLANDS

	//#endif //SPLIT_ISLANDS

	for (i = 0; i < maxNumManifolds; i++)
	{
		btPersistentManifold* manifold = dispatcher->getManifoldByIndexInternal(i);
		if (collisionWorld->getDispatchInfo().m_deterministicOverlappingPairs)
		{
			if (manifold->getNumContacts() == 0)
				continue;
		}

		const btCollisionObject* colObj0 = static_cast<const btCollisionObject*>(manifold->getBody0());
		const btCollisionObject* colObj1 = static_cast<const btCollisionObject*>(manifold->getBody1());

		///@todo: check sleeping conditions!
		if (((colObj0) && colObj0->getActivationState() != ISLAND_SLEEPING) ||
			((colObj1) && colObj1->getActivationState() != ISLAND_SLEEPING))
		{
			//kinematic objects don't merge islands, but wake up all connected objects
			if (colObj0->isKinematicObject() && colObj0->getActivationState() != ISLAND_SLEEPING)
			{
				if (colObj0->hasContactResponse())
					colObj1->activate();
			}
			if (colObj1->isKinematicObject() && colObj1->getActivationState() != ISLAND_SLEEPING)
			{
				if (colObj1->hasContactResponse())
					colObj0->activate();
			}
			if (m_splitIslands)
			{
				//filtering for response
				if (dispatcher->needsResponse(colObj0, colObj1))
					m_islandmanifold.push_back(manifold);
			}
		}
	}
}

void btSimulationIslandManager::processIslands(btDispatcher* dispatcher, btCollisionWorld* collisionWorld, IslandCallback* callback)
{
    btCollisionObjectArray& collisionObjects = collisionWorld->getCollisionObjectArray();
	int endIslandIndex = 1;
	int startIslandIndex;
	int numElem = getUnionFind().getNumElements();

	BT_PROFILE("processIslands");

	if (!m_splitIslands)
	{
		btPersistentManifold** manifold = dispatcher->getInternalManifoldPointer();
		int maxNumManifolds = dispatcher->getNumManifolds();
		callback->processIsland(&collisionObjects[0], collisionObjects.size(), manifold, maxNumManifolds, -1);
	}
	else
	{
		// Sort manifolds, based on islands
		// Sort the vector using predicate and std::sort
		//std::sort(islandmanifold.begin(), islandmanifold.end(), btPersistentManifoldSortPredicate);

		int numManifolds = int(m_islandmanifold.size());

		//tried a radix sort, but quicksort/heapsort seems still faster
		//@todo rewrite island management
		//btPersistentManifoldSortPredicateDeterministic sorts contact manifolds based on islandid,
		//but also based on object0 unique id and object1 unique id
		if (collisionWorld->getDispatchInfo().m_deterministicOverlappingPairs)
		{
			m_islandmanifold.quickSort(btPersistentManifoldSortPredicateDeterministic());
		}
		else
		{
			m_islandmanifold.quickSort(btPersistentManifoldSortPredicate());
		}

		//m_islandmanifold.heapSort(btPersistentManifoldSortPredicate());

		//now process all active islands (sets of manifolds for now)

		int startManifoldIndex = 0;
		int endManifoldIndex = 1;

		//int islandId;

		//	printf("Start Islands\n");

		//traverse the simulation islands, and call the solver, unless all objects are sleeping/deactivated
		for (startIslandIndex = 0; startIslandIndex < numElem; startIslandIndex = endIslandIndex)
		{
			int islandId = getUnionFind().getElement(startIslandIndex).m_id;

			bool islandSleeping = true;

			for (endIslandIndex = startIslandIndex; (endIslandIndex < numElem) && (getUnionFind().getElement(endIslandIndex).m_id == islandId); endIslandIndex++)
			{
				int i = getUnionFind().getElement(endIslandIndex).m_sz;
				btCollisionObject* colObj0 = collisionObjects[i];
				m_islandBodies.push_back(colObj0);
				if (colObj0->isActive())
					islandSleeping = false;
			}

			//find the accompanying contact manifold for this islandId
			int numIslandManifolds = 0;
			btPersistentManifold** startManifold = 0;

			if (startManifoldIndex < numManifolds)
			{
				int curIslandId = getIslandId(m_islandmanifold[startManifoldIndex]);
				if (curIslandId == islandId)
				{
					startManifold = &m_islandmanifold[startManifoldIndex];

					for (endManifoldIndex = startManifoldIndex + 1; (endManifoldIndex < numManifolds) && (islandId == getIslandId(m_islandmanifold[endManifoldIndex])); endManifoldIndex++)
					{
					}
					/// Process the actual simulation, only if not sleeping/deactivated
					numIslandManifolds = endManifoldIndex - startManifoldIndex;
				}
			}

			if (!islandSleeping)
			{
				callback->processIsland(&m_islandBodies[0], m_islandBodies.size(), startManifold, numIslandManifolds, islandId);
				//			printf("Island callback of size:%d bodies, %d manifolds\n",islandBodies.size(),numIslandManifolds);
			}

			if (numIslandManifolds)
			{
				startManifoldIndex = endManifoldIndex;
			}

			m_islandBodies.resize(0);
		}
	}  // else if(!splitIslands)
}



```

### btSimulationIslandManagerMt

``` c++


///
/// SimulationIslandManagerMt -- Multithread capable version of SimulationIslandManager
///                       Splits the world up into islands which can be solved in parallel.
///                       In order to solve islands in parallel, an IslandDispatch function
///                       must be provided which will dispatch calls to multiple threads.
///                       The amount of parallelism that can be achieved depends on the number
///                       of islands. If only a single island exists, then no parallelism is
///                       possible.
///
class btSimulationIslandManagerMt : public btSimulationIslandManager
{
public:
	struct Island
	{
		// a simulation island consisting of bodies, manifolds and constraints,
		// to be passed into a constraint solver.
		btAlignedObjectArray<btCollisionObject*> bodyArray;
		btAlignedObjectArray<btPersistentManifold*> manifoldArray;
		btAlignedObjectArray<btTypedConstraint*> constraintArray;
		int id;  // island id
		bool isSleeping;

		void append(const Island& other);  // add bodies, manifolds, constraints to my own
	};
	struct SolverParams
	{
		btConstraintSolver* m_solverPool;
		btConstraintSolver* m_solverMt;
		btContactSolverInfo* m_solverInfo;
		btIDebugDraw* m_debugDrawer;
		btDispatcher* m_dispatcher;
	};
	static void solveIsland(btConstraintSolver* solver, Island& island, const SolverParams& solverParams);

	typedef void (*IslandDispatchFunc)(btAlignedObjectArray<Island*>* islands, const SolverParams& solverParams);
	static void serialIslandDispatch(btAlignedObjectArray<Island*>* islandsPtr, const SolverParams& solverParams);
	static void parallelIslandDispatch(btAlignedObjectArray<Island*>* islandsPtr, const SolverParams& solverParams);

protected:
	btAlignedObjectArray<Island*> m_allocatedIslands;    // owner of all Islands
	btAlignedObjectArray<Island*> m_activeIslands;       // islands actively in use
	btAlignedObjectArray<Island*> m_freeIslands;         // islands ready to be reused
	btAlignedObjectArray<Island*> m_lookupIslandFromId;  // big lookup table to map islandId to Island pointer
	Island* m_batchIsland;
	int m_minimumSolverBatchSize;
	int m_batchIslandMinBodyCount;
	IslandDispatchFunc m_islandDispatch;

	Island* getIsland(int id);
	virtual Island* allocateIsland(int id, int numBodies);
	virtual void initIslandPools();
	virtual void addBodiesToIslands(btCollisionWorld* collisionWorld);
	virtual void addManifoldsToIslands(btDispatcher* dispatcher);
	virtual void addConstraintsToIslands(btAlignedObjectArray<btTypedConstraint*>& constraints);
	virtual void mergeIslands();

public:
	btSimulationIslandManagerMt();
	virtual ~btSimulationIslandManagerMt();

	virtual void buildAndProcessIslands(btDispatcher* dispatcher,
										btCollisionWorld* collisionWorld,
										btAlignedObjectArray<btTypedConstraint*>& constraints,
										const SolverParams& solverParams);

	virtual void buildIslands(btDispatcher* dispatcher, btCollisionWorld* colWorld);

	int getMinimumSolverBatchSize() const
	{
		return m_minimumSolverBatchSize;
	}
	void setMinimumSolverBatchSize(int sz)
	{
		m_minimumSolverBatchSize = sz;
	}
	IslandDispatchFunc getIslandDispatchFunction() const
	{
		return m_islandDispatch;
	}
	// allow users to set their own dispatch function for multithreaded dispatch
	void setIslandDispatchFunction(IslandDispatchFunc func)
	{
		m_islandDispatch = func;
	}
};

```
### btSolverAnalyticsData
``` c++
struct btSolverAnalyticsData
{
	btSolverAnalyticsData()
	{
		m_numSolverCalls = 0;
		m_numIterationsUsed = -1;
		m_remainingLeastSquaresResidual = -1;
		m_islandId = -2;
	}
	int m_islandId;
	int m_numBodies;
	int m_numContactManifolds;
	int m_numSolverCalls;
	int m_numIterationsUsed;
	double m_remainingLeastSquaresResidual;
};
```