import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'

// Ported from Claude Design "Organic Loader.html" prototype.
// A noise-displaced icosahedron blob with attendant small cells. Hovering an
// action morphs the blob into one of 5 shapes (Compose / Orbit / Extrude /
// Sharpen / Stretch); shape 0 (Dissolve) returns to the organic blob.

const VERTEX_PREAMBLE = `
  uniform float uTime;
  uniform float uPhase;
  uniform float uWobble;
  uniform float uDetail;
  uniform vec3  uPoke;
  uniform float uPokeStrength;
  uniform float uPokeRadius;
  uniform float uShapeA;
  uniform float uShapeB;
  uniform float uShapeBlend;
  uniform float uShapeMix;
  uniform float uOrbitMix;
  uniform float uOrbitPhase;

  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p){
    float n = 0.0;
    n += 0.60 * snoise(p * 1.0);
    n += 0.30 * snoise(p * 2.1 + 3.17);
    n += 0.15 * snoise(p * 4.3 + 7.91);
    return n;
  }

  float orbitDisp(vec3 d) {
    vec3 bulgeP = d * 1.8 + vec3(uOrbitPhase * 0.15);
    float bulge = fbm(bulgeP);
    float field = fbm(d * 6.5);
    float quill = pow(max(0.0, field), 6.0);
    float pulse = max(0.0, sin(uOrbitPhase));
    float body   = 0.30 * bulge * (0.15 + 1.7 * pulse);
    float spikes = 0.70 * quill * (0.0  + 1.8 * pulse);
    return uOrbitMix * (body + spikes);
  }

  vec3 shapeCube(vec3 p){
    vec3 a = abs(p);
    float m = max(a.x, max(a.y, a.z));
    return p / max(m, 0.0001);
  }
  vec3 shapeTorus(vec3 p){
    float R = 0.75, r = 0.35;
    vec2 xz = vec2(p.x, p.z);
    float lxz = length(xz);
    vec2 ringDir = lxz > 1e-4 ? xz / lxz : vec2(1.0, 0.0);
    vec2 q = vec2(lxz - R, p.y);
    float lq = length(q);
    vec2 qn = lq > 1e-4 ? q / lq : vec2(1.0, 0.0);
    vec2 onRing = vec2(R, 0.0) + qn * r;
    return vec3(ringDir * onRing.x, onRing.y).xzy;
  }
  vec3 shapeCylinder(vec3 p){
    float W = 0.62, H = 0.92, D = 0.14;
    float m = max(max(abs(p.x) / W, abs(p.y) / H), abs(p.z) / D);
    vec3 box = p / max(m, 0.0001);
    return mix(box, normalize(p) * 0.78, 0.12);
  }
  vec3 shapeCoin(vec3 p){
    float THICK = 0.32;
    vec2 xy = p.xy;
    float r = length(xy);
    vec2 dir = r > 1e-4 ? xy / r : vec2(1.0, 0.0);
    float radial = min(r, 1.0);
    float z = clamp(p.z, -THICK, THICK);
    float zN = z / THICK;
    float edge = sqrt(max(0.0, 1.0 - zN * zN));
    float ROUND = 0.18;
    float rimMask = smoothstep(0.85, 1.0, radial);
    float rOut = mix(radial, radial * mix(1.0, edge, ROUND), rimMask);
    return vec3(dir * rOut, z);
  }
  vec3 shapeStretch(vec3 p){
    return vec3(p.x * 1.6, p.y * 0.7, p.z * 0.7);
  }

  vec3 shapeTarget(vec3 p, float idx){
    int i = int(idx + 0.5);
    if (i == 1) return shapeCube(p);
    if (i == 2) return shapeTorus(p);
    if (i == 3) return shapeCylinder(p);
    if (i == 4) return shapeCoin(p);
    if (i == 5) return shapeStretch(p);
    return p;
  }

  vec3 shapeBlended(vec3 p){
    vec3 a = shapeTarget(p, uShapeA);
    vec3 b = shapeTarget(p, uShapeB);
    return mix(a, b, uShapeBlend);
  }
`

const VERTEX_BEGIN = `
  vec3 nrm = normalize(normal);
  vec3 shaped = mix(position, shapeBlended(position), uShapeMix);

  float t = uTime * 0.4 + uPhase;
  vec3 base = shaped * max(0.05, uDetail);
  float n = fbm(base + vec3(t, -t * 0.6, t * 0.8));

  float pokeD = distance(shaped, uPoke);
  float pokeFall = smoothstep(uPokeRadius, 0.0, pokeD);
  float pokeAmt = -uPokeStrength * pokeFall * pokeFall;

  float wobScale = mix(1.0, 0.25, uShapeMix);
  float disp = (0.22 * uWobble * wobScale) * n + pokeAmt + orbitDisp(nrm);
  vec3 transformed = shaped + nrm * disp;

  vec3 tang = normalize(cross(nrm, vec3(0.0, 1.0, 0.01)));
  vec3 bitan = normalize(cross(nrm, tang));
  float e = 0.12;
  vec3 nrmT = normalize(nrm + tang * e);
  vec3 nrmB = normalize(nrm + bitan * e);
  float nT = fbm(base + tang * e + vec3(t, -t * 0.6, t * 0.8));
  float nB = fbm(base + bitan * e + vec3(t, -t * 0.6, t * 0.8));
  vec3 pT = shaped + tang * e + nrm * ((0.22 * uWobble * wobScale) * nT + pokeAmt + orbitDisp(nrmT));
  vec3 pB = shaped + bitan * e + nrm * ((0.22 * uWobble * wobScale) * nB + pokeAmt + orbitDisp(nrmB));
  vec3 perturbedNormal = normalize(cross(pT - transformed, pB - transformed));
  objectNormal = perturbedNormal;
`

const OrganicLoader = forwardRef(function OrganicLoader(
  {
    className,
    style,
    color = '#111111',
    roughness = 0.8,
    cellSpawnDir = null,
    interactive = true,
    disableTagLines = false,
  },
  ref
) {
  const containerRef = useRef(null)
  const apiRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const STATE = {
      size: 0.49,
      wobble: 2.3,
      detail: 0.25,
      speed: 0.3,
      roughness,
      color,
      smallCount: 3,
      orbit: 2.2,
      smallSize: 0.3,
      smallSpeed: 0.45,
      smallWobble: 0.8,
      smallDetail: 0.21,
      // Optional bias direction for small-cell spawn (world coords). When
      // null, cells spawn uniformly on a sphere (default home behavior).
      cellSpawnDir,
    }

    const canvas = document.createElement('canvas')
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.touchAction = 'none'
    container.appendChild(canvas)

    // preserveDrawingBuffer is required so OrganicLoaderTags can call gl.readPixels
    // each frame to sample the canvas underneath each tag for adaptive coloring.
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 5)

    scene.add(new THREE.AmbientLight(0xffffff, 0.35))
    const key = new THREE.DirectionalLight(0xffffff, 1.8); key.position.set(3, 4, 4); scene.add(key)
    const rim = new THREE.DirectionalLight(0xffffff, 1.2); rim.position.set(-4, -1, 2); scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(0, -3, -3); scene.add(fill)

    const swallowLockRef = { current: null }

    function makeBlobMaterial() {
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(STATE.color),
        roughness: STATE.roughness,
        metalness: 0.05,
        clearcoat: 0.25,
        clearcoatRoughness: 0.6,
        flatShading: false,
      })
      const u = {
        uTime: { value: Math.random() * 100 },
        uPhase: { value: Math.random() * 100 },
        uWobble: { value: STATE.wobble },
        uDetail: { value: STATE.detail },
        uPoke: { value: new THREE.Vector3(0, 0, 0) },
        uPokeStrength: { value: 0.0 },
        uPokeRadius: { value: 0.6 },
        uShapeA: { value: 0 },
        uShapeB: { value: 0 },
        uShapeBlend: { value: 0 },
        uShapeMix: { value: 0 },
        uOrbitMix: { value: 0 },
        uOrbitPhase: { value: 0 },
      }
      mat.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, u)
        shader.vertexShader = VERTEX_PREAMBLE + shader.vertexShader
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          VERTEX_BEGIN
        )
      }
      return { mat, u }
    }

    // Big blob
    const { mat: blobMat, u: uniforms } = makeBlobMaterial()
    const geom = new THREE.IcosahedronGeometry(1, 128)
    const blob = new THREE.Mesh(geom, blobMat)

    // Stretch mode: dynamic capsule snake. Each segment is a small capsule;
    // we recycle a fixed pool, positioning/scaling per frame.
    const snakeMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(STATE.color),
      roughness: STATE.roughness,
      metalness: 0.05,
      clearcoat: 0.25,
      clearcoatRoughness: 0.6,
    })
    const SNAKE_RADIUS = 0.028
    const stretchCapsuleGeom = new THREE.CapsuleGeometry(SNAKE_RADIUS, 1.0, 8, 16)
    const STRETCH_MAX_SEGMENTS = 160
    const stretchSegments = []
    for (let i = 0; i < STRETCH_MAX_SEGMENTS; i++) {
      const m = new THREE.Mesh(stretchCapsuleGeom, snakeMat)
      m.visible = false
      stretchSegments.push(m)
    }

    const stretchPath = { waypoints: [], segs: [], totalLen: 0, cycleIdx: -1 }
    function buildRandomStretchPath() {
      const AXES = [
        new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
        new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
      ]
      const W = [new THREE.Vector3(0, 0, 0)]
      // Mid-size paths: long enough for the snake to feel substantial but
      // not so long that it sprawls past the viewport. Closing the loop
      // at the end keeps the bounding box centered around origin.
      const steps = 6 + Math.floor(Math.random() * 3)
      let lastAxisIdx = -1
      const extent = [0, 0, 0]
      for (let i = 0; i < steps; i++) {
        let pick
        do { pick = Math.floor(Math.random() * AXES.length) }
        while (lastAxisIdx !== -1 && (pick >> 1) === (lastAxisIdx >> 1))
        lastAxisIdx = pick
        const axis = pick >> 1
        const dir = (pick & 1) ? -1 : 1
        const bias = extent[axis] * dir < 0 ? 0.25 : 0
        const len = 0.55 + Math.random() * 0.55 + bias
        const prev = W[W.length - 1]
        W.push(prev.clone().addScaledVector(AXES[pick], len))
        extent[axis] += dir * len
      }
      const closing = (lastAxisIdx >> 1)
      const order = [0, 1, 2].filter(a => a !== closing).concat([closing])
      for (const axis of order) {
        const prev = W[W.length - 1]
        const target = prev.clone()
        target.setComponent(axis, 0)
        if (target.distanceTo(prev) > 0.01) W.push(target)
      }
      const last = W[W.length - 1]
      if (last.length() > 0.001) W.push(new THREE.Vector3(0, 0, 0))
      const start = W[0].clone()
      const raw = W.map(p => p.clone().sub(start))
      const CORNER_R = 0.28
      const ARC_SAMPLES = 8
      const smoothed = []
      smoothed.push(raw[0].clone())
      for (let i = 1; i < raw.length - 1; i++) {
        const prev = raw[i - 1], curr = raw[i], next = raw[i + 1]
        const dirIn = new THREE.Vector3().subVectors(curr, prev)
        const dirOut = new THREE.Vector3().subVectors(next, curr)
        const lenIn = dirIn.length(), lenOut = dirOut.length()
        const r = Math.min(CORNER_R, lenIn * 0.45, lenOut * 0.45)
        if (r < 0.02) { smoothed.push(curr.clone()); continue }
        const uIn = dirIn.clone().normalize()
        const uOut = dirOut.clone().normalize()
        const p0 = curr.clone().addScaledVector(uIn, -r)
        const p2 = curr.clone().addScaledVector(uOut, r)
        smoothed.push(p0)
        for (let s = 1; s < ARC_SAMPLES; s++) {
          const t = s / ARC_SAMPLES
          const it = 1 - t
          const x = it * it * p0.x + 2 * it * t * curr.x + t * t * p2.x
          const y = it * it * p0.y + 2 * it * t * curr.y + t * t * p2.y
          const z = it * it * p0.z + 2 * it * t * curr.z + t * t * p2.z
          smoothed.push(new THREE.Vector3(x, y, z))
        }
        smoothed.push(p2)
      }
      smoothed.push(raw[raw.length - 1].clone())
      const segs = []
      let totalLen = 0
      for (let i = 0; i < smoothed.length - 1; i++) {
        const a = smoothed[i], b = smoothed[i + 1]
        const len = a.distanceTo(b)
        if (len < 0.002) continue
        segs.push({ a, b, len, start: totalLen })
        totalLen += len
      }
      stretchPath.waypoints = smoothed
      stretchPath.segs = segs
      stretchPath.totalLen = totalLen
    }

    const world = new THREE.Group()
    scene.add(world)
    world.add(blob)
    for (const s of stretchSegments) world.add(s)

    // Tag system. Three world-space anchor points (where the connector line
    // attaches to the visual) + three targets (where the DOM tag floats) +
    // three real THREE.Line objects. All live inside `world` so they
    // tilt/auto-rotate with the scene; lines are depth-tested so the portion
    // hidden inside the blob disappears, making each line look attached.
    //
    //   anchor (= blob center, or a snake point) ─── line ─── target (tag)
    //
    // Outward direction is fixed per tag. Distance is expressed as a multiple
    // of the blob's current radius — when the blob shrinks (compose puff,
    // extrude fan card, etc.) the tags + lines scale with it so the
    // composition stays tight. `tagLineScales[i]` is an animation multiplier
    // (0 = fully retracted, 1 = fully extended) driven by OrganicLoaderTags.
    // 3 tags surround the visual in distinct screen regions so longer tag
    // text (e.g. "Loyalty Program", "Interaction Design") doesn't overlap
    // during float, AND each tag projects safely inside the viewport even
    // on tighter aspect ratios:
    //   tag 0 — upper-right quadrant
    //   tag 1 — left side, slightly below center
    //   tag 2 — lower-right quadrant (well below tag 0)
    // Direction is randomized per-mount within each tag's angular sector so
    // every visit gets a slightly different composition without any two tags
    // ever colliding. Distances also get a small ±10% jitter.
    const D2R = Math.PI / 180
    const TAG_ANGLE_RANGES = [
      [ 35 * D2R,  85 * D2R],   // upper-right
      [160 * D2R, 215 * D2R],   // left
      [-30 * D2R, -85 * D2R],   // lower-right
    ]
    const pickInRange = ([a, b]) => a + Math.random() * (b - a)
    const TAG_DIRS = TAG_ANGLE_RANGES.map((range) => {
      const a = pickInRange(range)
      const z = 0.10 + Math.random() * 0.20
      return new THREE.Vector3(Math.cos(a), Math.sin(a), z).normalize()
    })
    const TAG_FACTORS = [
      1.20 + Math.random() * 0.15,
      1.25 + Math.random() * 0.20,
      1.20 + Math.random() * 0.15,
    ]
    // In Stretch mode the snake itself sprawls across world units, so tags
    // sit close to their snake anchor (small offset) — keeps the connector
    // lines short and the tags clustered around the visible early portion of
    // the line instead of flying off to fixed offsets.
    const STRETCH_BASE = 0.22

    // Each tag oscillates around its frozen rest position so it visually
    // "floats" instead of being pinned. Per-tag amp/freq/phase so they don't
    // sync up. Driven by raw real-time so floating doesn't slow down when
    // STATE.speed is dialed down.
    const TAG_FLOAT_AMPS   = [[0.055, 0.045], [0.060, 0.050], [0.050, 0.060]]   // x, y amplitude (world units)
    const TAG_FLOAT_FREQS  = [[0.50,  0.38],  [0.42,  0.55],  [0.58,  0.40]]    // x, y frequency (rad/sec)
    const TAG_FLOAT_PHASES = [[0.0,   1.7],   [2.1,   0.5],   [1.3,   3.0]]    // x, y phase (rad)

    // Anchors live in `world` (rotate with the visual). Frozen targets are
    // captured in scene-world coordinates whenever the tag swaps in — so the
    // tag itself "floats" at a fixed screen position while only the line
    // (anchored on one end to the moving visual, on the other end to the
    // frozen point in space) flexes.
    const tagAnchors = [new THREE.Object3D(), new THREE.Object3D(), new THREE.Object3D()]
    const tagFrozenWorld = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]
    const tagLines = []
    const tagLineMats = []
    const tagLineGeoms = []
    const tagLineScales = [1, 1, 1]
    let freezePending = true   // captures initial natural positions on the first tick
    for (let i = 0; i < 3; i++) {
      world.add(tagAnchors[i])
      const geom = new THREE.BufferGeometry()
      geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
      const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
      const line = new THREE.Line(geom, mat)
      // Lines live in the SCENE (not in `world`) so vertex coordinates are
      // already in scene-world space — vertex 0 is recomputed each frame from
      // the rotating anchor's world position; vertex 1 is the frozen target.
      // When disableTagLines is set, the line still exists (the tick code
      // updates its geometry indexed by tag i), but it's hidden from render.
      if (disableTagLines) line.visible = false
      scene.add(line)
      tagLines.push(line)
      tagLineMats.push(mat)
      tagLineGeoms.push(geom)
    }
    if (disableTagLines) {
      tagLineScales[0] = 0
      tagLineScales[1] = 0
      tagLineScales[2] = 0
    }

    // Cached per-frame results consumed by OrganicLoaderTags via the API.
    const tagScreenPos = [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]
    const tagLumas = [1, 1, 1]
    // 1 = tag's projected target is inside the canvas, 0 = off-screen.
    // Drives both line opacity and the DOM tag's visibility so off-screen
    // tags + lines hide together (used heavily in Stretch / FigArrow mode
    // where the snake can rotate a tag past the viewport edge).
    const tagOnScreen = [1, 1, 1]
    // Per-tag opacity gate. Only the Stretch (FigArrow) mode uses it: each
    // tag's gate is controlled independently so the tag fades in as the
    // snake's head passes its anchor position along the path, and fades
    // out as the snake retraces back. Other modes leave this at 1.
    const tagModeOpacity = [1, 1, 1]
    // Anchor positions (fraction of total path length) for the 3 tags.
    // Used by both the snake's tag-anchor placement and the per-tag gate.
    const STRETCH_US = [0.03, 0.06, 0.10]

    // Small cells
    const smallGeom = new THREE.IcosahedronGeometry(1, 48)
    const smallGroup = new THREE.Group()
    world.add(smallGroup)

    const rand = (a, b) => a + Math.random() * (b - a)
    const smoothstep01 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x) }

    // Pulse cycle period for compose-mode signal radiation (seconds per breath).
    const PULSE_PERIOD = 0.9
    // Seconds the main cells take to gather into the big cell on Compose entry.
    // Extras (signal pulses) stay hidden until composeRealT crosses this, so the
    // radiation reads as being born from the absorbed cells.
    const GATHER_DUR = 0.7
    // Phase clock for compose extras + the big cell's puff. Resets to 0 when
    // extras first arm so every pulse cycle starts cleanly at "tiny seed", and
    // drives the big cell's breath in lockstep so the puff visibly pushes each
    // pulse outward.
    const EXTRAS = { phase: 0, armed: false }

    class Small {
      constructor(isExtra = false) {
        // Main cells exist always (they're the orbit/swallow cycle in default
        // view). Extras spawn only while Compose is active and emit signal
        // pulses — they're hidden until the main cells finish gathering.
        this.isExtra = isExtra
        const { mat, u } = makeBlobMaterial()
        this.mat = mat
        this.u = u
        this.mesh = new THREE.Mesh(smallGeom, mat)
        smallGroup.add(this.mesh)
        this.spawn(true)
        if (isExtra) this.mesh.visible = false
      }
      spawn(initial = false) {
        // Always release the global swallow lock if this cell held it. Otherwise
        // a mode transition (Compose/Orbit) that respawns a captured cell via
        // some path other than the swallow-completion branch will leak the lock,
        // permanently blocking every other cell from being captured.
        if (swallowLockRef.current === this) swallowLockRef.current = null
        const baseR = STATE.size * (1.4 + STATE.orbit)
        if (STATE.cellSpawnDir) {
          // Biased spawn: cells appear from a fixed direction (world coords)
          // with small jitter so they don't pile on the same point.
          // Smaller radius (vs full baseR) keeps them inside the visible
          // canvas instead of starting beyond its edge.
          const r = 0.85 * rand(0.9, 1.1)
          const d = STATE.cellSpawnDir
          const dir = new THREE.Vector3(d.x, d.y, d.z).normalize()
          const jitter = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(0.2)
          dir.add(jitter).normalize()
          this.pos = dir.multiplyScalar(r)
        } else {
          const r = baseR * rand(0.9, 1.1)
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          this.pos = new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta) * r,
            Math.cos(phi) * r,
            Math.sin(phi) * Math.sin(theta) * r
          )
        }
        const inward = this.pos.clone().negate().normalize()
        const jitter = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize()
        this.vel = inward.clone().multiplyScalar(0.7)
          .addScaledVector(jitter, 0.3)
          .normalize()
          .multiplyScalar(rand(0.3, 0.6))
        this.baseScale = rand(0.22, 0.38)
        this.mesh.scale.setScalar(this.baseScale * STATE.smallSize)
        this.mesh.position.copy(this.pos)
        this.captured = false
        this.pace = rand(0.55, 1.25)
        this.wanderDir = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize()
        this.wanderTarget = this.wanderDir.clone()
        this.wanderT = 0
        this.wanderInterval = rand(1.5, 2.8)
        this.captureT = 0
        this.capturePos = new THREE.Vector3()
        this.captureScale = this.baseScale
        this.swallowDur = 0.9
        this.born = initial ? 1 : 0
        this.mesh.visible = true
      }
      step(dt) {
        this.u.uTime.value += dt
        if (this.born < 1) this.born = Math.min(1, this.born + dt * 2)

        const cmx = smoothstep01(morph.composeMix)

        // Compose: extras (signal pulses). Hidden until the main cells finish
        // gathering — radiation reads as "born from" the absorbed energy
        // instead of appearing simultaneously with the gather.
        if (this.isExtra) {
          const armed = cmx > 0.02 && morph.composeRealT > GATHER_DUR
          if (armed) {
            this.mesh.visible = true
            if (!this.signal) this.spawnSignal(true)
            this.stepSignal(dt, cmx)
          } else {
            this.mesh.visible = false
            this.signal = null
          }
          return
        }

        // Compose: main cells gather inward into big cell, then hide. Smooth
        // ease-in cubic on position + late shrink so it reads as being pulled
        // in (not teleporting + flashing into signal mode).
        if (cmx > 0.02) {
          if (!this._gather) {
            this._gather = { from: this.pos.clone(), t: 0 }
          }
          const g = this._gather
          g.t = Math.min(GATHER_DUR, g.t + dt)
          const u = g.t / GATHER_DUR
          const eP = u * u * u
          this.pos.copy(g.from).lerp(blob.position, eP)
          this.mesh.position.copy(this.pos)
          let s = 1
          if (u > 0.35) {
            const v = (u - 0.35) / 0.65
            s = 1 - v * v
          }
          this.mesh.scale.setScalar(this.baseScale * STATE.smallSize * this.born * s)
          this.mesh.visible = u < 1
          return
        } else if (this._gather) {
          this._gather = null
          this.mesh.visible = true
          this.spawn(false)
        }

        // Orbit mode → surf
        const omx = smoothstep01(morph.orbitMix)
        if (omx > 0.02) {
          if (!this.surf) this.initSurf()
          this.stepSurf(dt, omx)
          if (omx < 0.02) this.surf = null
          return
        } else if (this.surf) {
          this.surf = null
          this.mesh.quaternion.identity()
          this.spawn(false)
        }

        const bigPos = blob.position
        const toBig = new THREE.Vector3().subVectors(bigPos, this.pos)
        const d = toBig.length()
        const bigR = STATE.size * (1.15 + 0.1 * STATE.wobble)
        const touchR = bigR + this.baseScale * STATE.smallSize * 1.2

        if (!this.captured) {
          this.wanderT += dt
          if (this.wanderT > this.wanderInterval) {
            this.wanderTarget.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize()
            this.wanderT = 0
            this.wanderInterval = rand(1.5, 2.8)
          }
          this.wanderDir.lerp(this.wanderTarget, Math.min(1, dt * 0.8))
          this.wanderDir.normalize()
          this.vel.addScaledVector(this.wanderDir, 0.25 * dt)

          const pullRef = STATE.size * (1.4 + STATE.orbit)
          const k = Math.max(0, 1 - d / pullRef)
          const pull = (1.0 + k * k * 3.5) * dt * STATE.smallSpeed * this.pace
          this.vel.add(toBig.clone().normalize().multiplyScalar(pull))
          this.vel.multiplyScalar(Math.pow(0.85, dt))

          const vmin = 0.22 * this.pace
          if (this.vel.length() < vmin) {
            const want = toBig.clone().normalize()
            this.vel.addScaledVector(want, vmin - this.vel.length())
          }
          const farLimit = STATE.size * (1.4 + STATE.orbit) + 1.0
          if (d > farLimit) this.vel.addScaledVector(toBig.clone().normalize(), 0.8 * dt)

          const motionSpeed = Math.max(0.5, STATE.speed) * STATE.smallSpeed * this.pace
          this.pos.addScaledVector(this.vel, dt * motionSpeed)

          if (d < touchR && !swallowLockRef.current) {
            this.captured = true
            this.captureT = 0
            this.capturePos.copy(this.pos)
            this.captureScale = this.baseScale
            swallowLockRef.current = this
          }
        } else {
          this.captureT += dt * STATE.speed
          const u = Math.min(1, this.captureT / this.swallowDur)
          this.pos.lerpVectors(this.capturePos, bigPos, u)
          const shrinkStart = 0.55
          let s = this.captureScale
          if (u > shrinkStart) {
            const v = (u - shrinkStart) / (1 - shrinkStart)
            s = this.captureScale * (1 - v * v)
          }
          this.mesh.scale.setScalar(s * STATE.smallSize * this.born)
          if (u >= 1) {
            if (swallowLockRef.current === this) swallowLockRef.current = null
            this.spawn(false)
            return
          }
        }

        this.mesh.position.copy(this.pos)
        if (!this.captured) {
          this.mesh.scale.setScalar(this.baseScale * STATE.smallSize * this.born)
        }
        this.u.uWobble.value = STATE.smallWobble
        this.u.uDetail.value = STATE.smallDetail
        this.mat.color.set(STATE.color)
        this.mat.roughness = STATE.roughness
      }

      spawnSignal() {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        this.signal = {
          dir: new THREE.Vector3(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi) * 0.5,
            Math.sin(phi) * Math.sin(theta)
          ).normalize(),
          lastPhase: EXTRAS.phase,
          speed: rand(1.2, 1.8),
          seedScale: rand(0.03, 0.06),
          peakScale: rand(0.09, 0.16),
        }
      }
      stepSignal(dt, cmx) {
        const s = this.signal
        const u = EXTRAS.phase
        if (u < s.lastPhase) {
          // Cycle restart: pick a fresh emission direction so consecutive
          // pulses don't trail along the same vector.
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          s.dir.set(
            Math.sin(phi) * Math.cos(theta),
            Math.cos(phi) * 0.5,
            Math.sin(phi) * Math.sin(theta)
          ).normalize()
        }
        s.lastPhase = u
        const origin = blob.position
        const easeOut = 1 - Math.pow(1 - u, 2)
        const dist = easeOut * s.speed * 1.6
        this.pos.copy(origin).addScaledVector(s.dir, dist)
        this.mesh.position.copy(this.pos)
        let sc
        if (u < 0.35) {
          const t = u / 0.35
          sc = s.seedScale + (s.peakScale - s.seedScale) * t
        } else {
          const t = (u - 0.35) / 0.65
          sc = s.peakScale * (1 - t * t)
        }
        const baseS = sc * STATE.smallSize * cmx * this.born
        const stretch = 1.0 + 1.5 * easeOut
        const squish = 1.0 - 0.2 * easeOut
        this.mesh.scale.set(baseS * squish, baseS * squish, baseS * stretch)
        if (!this._up) this._up = new THREE.Vector3(0, 0, 1)
        this.mesh.quaternion.setFromUnitVectors(this._up, s.dir)
        this.u.uWobble.value = STATE.smallWobble * 0.6
        this.u.uDetail.value = STATE.smallDetail
        this.mat.color.set(STATE.color)
        this.mat.roughness = STATE.roughness
      }

      initSurf() {
        const theta = Math.random() * Math.PI * 2
        const cosPhi = rand(-0.9, 0.9)
        const phi = Math.acos(cosPhi)
        this.surf = {
          theta, phi,
          dTheta: rand(-0.6, 0.6),
          dPhi: rand(-0.3, 0.3),
          tgtDTheta: rand(-0.6, 0.6),
          tgtDPhi: rand(-0.3, 0.3),
          retargetT: 0,
          retargetEvery: rand(1.5, 3.0),
          scale: rand(0.15, 0.28),
          hopOffset: Math.random() * Math.PI * 2,
          dir: new THREE.Vector3(),
        }
      }
      stepSurf(dt, omx) {
        const s = this.surf
        s.retargetT += dt
        if (s.retargetT > s.retargetEvery) {
          s.retargetT = 0
          s.retargetEvery = rand(1.2, 2.8)
          s.tgtDTheta = rand(-0.9, 0.9)
          s.tgtDPhi = rand(-0.5, 0.5)
        }
        const k = 1 - Math.pow(0.1, dt)
        s.dTheta += (s.tgtDTheta - s.dTheta) * k
        s.dPhi += (s.tgtDPhi - s.dPhi) * k
        const wander = STATE.speed
        s.theta += s.dTheta * dt * wander
        s.phi += s.dPhi * dt * wander
        const EPS = 0.12
        if (s.phi < EPS) { s.phi = EPS; s.dPhi = Math.abs(s.dPhi); s.tgtDPhi = Math.abs(s.tgtDPhi) }
        if (s.phi > Math.PI - EPS) { s.phi = Math.PI - EPS; s.dPhi = -Math.abs(s.dPhi); s.tgtDPhi = -Math.abs(s.tgtDPhi) }
        const sinPhi = Math.sin(s.phi)
        const d = s.dir.set(sinPhi * Math.cos(s.theta), Math.cos(s.phi), sinPhi * Math.sin(s.theta))
        const bulge = this._orbitBulge(d)
        const quill = this._orbitQuill(d)
        const pulse = Math.max(0, Math.sin(morph.orbitPhase))
        const body = 0.30 * bulge * (0.15 + 1.7 * pulse)
        const spikes = 0.70 * quill * (0.0 + 1.8 * pulse)
        const disp = omx * (body + spikes)
        const beat = morph.orbitPhase
        const hopEnv = Math.max(0, Math.sin(beat))
        const hop = hopEnv * hopEnv
        const hopLift = omx * 0.85 * hop
        const particleLift = s.scale * STATE.smallSize * 0.6
        const r = STATE.size * (1.0 + disp) + particleLift + hopLift * STATE.size
        this.pos.copy(blob.position).addScaledVector(d, r)
        this.mesh.position.copy(this.pos)
        const baseS = s.scale * STATE.smallSize * 0.6 * omx * this.born
        const stretch = 1.0 + 0.6 * hop
        const squish = 1.0 - 0.25 * hop
        this.mesh.scale.set(baseS * squish, baseS * squish, baseS * stretch)
        if (!this._up) this._up = new THREE.Vector3(0, 0, 1)
        this.mesh.quaternion.setFromUnitVectors(this._up, d)
        this.u.uWobble.value = STATE.smallWobble * 1.8
        this.u.uDetail.value = STATE.smallDetail * 1.4
        this.mat.color.set(STATE.color)
        this.mat.roughness = STATE.roughness
      }
      _orbitQuill(d) {
        const p = 6.5
        const n = Math.sin(d.x * p) * Math.sin(d.y * p + 1.7)
                + Math.sin(d.y * p + 2.3) * Math.sin(d.z * p + 0.4)
                + Math.sin(d.z * p + 3.1) * Math.sin(d.x * p + 2.6)
        return Math.pow(Math.max(0, n / 3), 6)
      }
      _orbitBulge(d) {
        const p = 1.8
        const q = morph.orbitPhase * 0.15
        const n = Math.sin(d.x * p + q) * Math.sin(d.y * p + 1.7 + q)
                + Math.sin(d.y * p + 2.3 + q) * Math.sin(d.z * p + 0.4 + q)
                + Math.sin(d.z * p + 3.1 + q) * Math.sin(d.x * p + 2.6 + q)
        return n / 3
      }
      dispose() {
        smallGroup.remove(this.mesh)
        this.mat.dispose()
      }
    }

    let smalls = []
    function resetSmalls() {
      smalls.forEach(s => s.dispose())
      smalls = []
      for (let i = 0; i < STATE.smallCount; i++) smalls.push(new Small())
      swallowLockRef.current = null
    }
    resetSmalls()

    // Compose extras pool
    const COMPOSE_EXTRA_COUNT = 14
    let composeExtras = []
    function ensureComposeExtras() {
      if (composeExtras.length) return
      for (let i = 0; i < COMPOSE_EXTRA_COUNT; i++) composeExtras.push(new Small(true))
    }
    function disposeComposeExtras() {
      composeExtras.forEach(s => s.dispose())
      composeExtras = []
    }

    // Morph state
    const morph = {
      shapeA: 0, shapeB: 0, blend: 0, mix: 0,
      targetShape: 0, targetMix: 0,
      composeTarget: 0, composeMix: 0, composeRealT: 0,
      orbitTarget: 0, orbitMix: 0, orbitPhase: 0,
      stretchTarget: 0, stretchMix: 0, stretchT: 0,
      sharpenTarget: 0, sharpenMix: 0, sharpenT: 0, sharpenSpinT: 0,
    }

    function setTargetShape(newShape) {
      const wasCompose = morph.composeTarget === 1
      const wasSharpen = morph.sharpenTarget === 1
      morph.composeTarget = (newShape === 1) ? 1 : 0
      morph.orbitTarget = (newShape === 2) ? 1 : 0
      morph.sharpenTarget = (newShape === 4) ? 1 : 0
      morph.stretchTarget = (newShape === 5) ? 1 : 0
      if (newShape === 5) {
        morph.stretchT = 0
        stretchPath.cycleIdx = -1
      }
      if (!wasCompose && morph.composeTarget === 1) {
        // Reset the real-time compose clock so the gather→radiate timing is
        // consistent every entry — it gates extras arming after GATHER_DUR
        // seconds, independent of STATE.speed.
        morph.composeRealT = 0
      }
      if (!wasSharpen && morph.sharpenTarget === 1) {
        morph.sharpenT = 0
        morph.sharpenSpinT = 0
      }
      if (newShape === 1 || newShape === 2 || newShape === 5) {
        morph.targetMix = 0; morph.targetShape = 0; return
      }
      if (newShape === 0) { morph.targetMix = 0; morph.targetShape = 0; return }
      morph.targetMix = 1
      morph.targetShape = newShape
      if (morph.mix < 0.05) {
        morph.shapeA = newShape; morph.shapeB = newShape; morph.blend = 0; return
      }
      if (morph.shapeB === newShape && morph.blend > 0) return
      if (morph.shapeA === newShape && morph.shapeB === morph.shapeA) return
      if (morph.blend > 0 && morph.blend < 1 && morph.shapeB !== morph.shapeA) {
        if (morph.blend > 0.5) morph.shapeA = morph.shapeB
      }
      morph.shapeB = newShape
      morph.blend = 0
    }

    // Imperative API for the floating tags overlay.
    const _projVec = new THREE.Vector3()
    const _tmpAnchor = new THREE.Vector3()
    const _tmpDir = new THREE.Vector3()
    const _tmpEnd = new THREE.Vector3()
    const _tmpEffective = new THREE.Vector3()
    const _pixel = new Uint8Array(4)
    let floatT = 0  // raw real seconds, drives tag floating (independent of STATE.speed)
    function samplePixelLuma(x, y) {
      // x, y are CSS px relative to the canvas's bounding rect. Convert to
      // drawing-buffer coordinates (origin bottom-left, scaled by pixel ratio).
      const gl = renderer.getContext()
      const dpr = renderer.getPixelRatio()
      const dx = Math.max(0, Math.min(gl.drawingBufferWidth - 1, Math.round(x * dpr)))
      const dy = Math.max(0, Math.min(gl.drawingBufferHeight - 1, gl.drawingBufferHeight - Math.round(y * dpr)))
      gl.readPixels(dx, dy, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, _pixel)
      // If pixel is transparent (alpha 0), the body bg shows through — treat
      // it as light (the page bg is warm cream).
      if (_pixel[3] < 8) return 1
      return (0.299 * _pixel[0] + 0.587 * _pixel[1] + 0.114 * _pixel[2]) / 255
    }
    function getTagScreenPos(i) {
      return tagScreenPos[i] ? { x: tagScreenPos[i].x, y: tagScreenPos[i].y } : null
    }
    function getTagOnScreen(i) {
      return tagOnScreen[i] ?? 1
    }
    function getTagModeOpacity(i) {
      return tagModeOpacity[i] ?? 1
    }
    function getTagLuma(i) {
      return tagLumas[i] ?? 1
    }
    function setTagLineScale(i, s) {
      // Clamp to [0, 1]. OrganicLoaderTags drives this for the swap animation.
      if (i < 0 || i > 2) return
      tagLineScales[i] = Math.max(0, Math.min(1, s))
    }
    function requestFreezeTagTargets() {
      // Defer to the next tick so the freeze sees the current frame's blob
      // scale + anchor matrices (we don't know stretch state at this depth).
      freezePending = true
    }
    function setTagLinesEnabled(enabled) {
      // Toggles the three tag→blob connector lines as a group. Init-time
      // visibility comes from the `disableTagLines` prop; this method lets
      // callers flip it later (e.g. on a viewport resize across the mobile
      // breakpoint) without re-creating the WebGL context.
      const visible = !!enabled
      for (let i = 0; i < tagLines.length; i++) tagLines[i].visible = visible
      if (!visible) {
        tagLineScales[0] = 0
        tagLineScales[1] = 0
        tagLineScales[2] = 0
      }
    }
    apiRef.current = {
      setShape: setTargetShape,
      getTagScreenPos,
      getTagOnScreen,
      getTagModeOpacity,
      getTagLuma,
      setTagLineScale,
      setTagLinesEnabled,
      requestFreezeTagTargets,
      samplePixelLuma,
    }

    // -------- TILT / DRAG / POKE / GYRO -------- //
    // Three input modes feed tilt:
    //   - mouse: cursor position (viewport-normalized) drives tilt every move
    //   - touch: drag deltas accumulate into tilt, ease back to 0 on release
    //   - gyro:  device orientation adds a baseline tilt offset (mobile only)
    // Poke fires on pointerup if it was a short, low-movement tap (works for
    // both mouse click and touch tap; bare drag/swipe doesn't poke).
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 }
    const TILT_X = 0.6   // pitch (around X)
    const TILT_Y = 0.8   // yaw (around Y)
    let pokeVel = 0
    const drag = { active: false, isTouch: false, sx: 0, sy: 0, lx: 0, ly: 0, t0: 0, moved: 0, accX: 0, accY: 0 }
    let gyroX = 0, gyroY = 0
    let gyroEnabled = false

    const onPointerMove = (e) => {
      if (drag.active && drag.isTouch) {
        drag.accX += e.clientX - drag.lx
        drag.accY += e.clientY - drag.ly
        drag.lx = e.clientX; drag.ly = e.clientY
        drag.moved = Math.max(drag.moved, Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy))
        // Map accumulated drag offset (in pixels) to tilt. Multiplier of 2
        // means dragging across the full viewport produces ~2× the mouse-
        // hover tilt range, so a swipe feels expressive without being touchy.
        tilt.tx = -drag.accY / window.innerHeight * TILT_X * 2
        tilt.ty =  drag.accX / window.innerWidth  * TILT_Y * 2
        return
      }
      if (e.pointerType === 'mouse') {
        // Cursor → tilt directly. Viewport-relative so any pixel of the page
        // contributes; canvas covers the whole viewport so this matches.
        const nx = (e.clientX / window.innerWidth) * 2 - 1
        const ny = (e.clientY / window.innerHeight) * 2 - 1
        tilt.tx = -ny * TILT_X
        tilt.ty =  nx * TILT_Y
      }
    }
    const onPointerDown = (e) => {
      drag.active = true
      drag.isTouch = e.pointerType !== 'mouse'
      drag.sx = drag.lx = e.clientX
      drag.sy = drag.ly = e.clientY
      drag.t0 = performance.now()
      drag.moved = 0
      // Touch start is a valid user gesture on iOS — request gyro permission now.
      if (drag.isTouch && !gyroEnabled) enableGyro()
    }
    const onPointerUp = (e) => {
      if (!drag.active) return
      const wasTap = drag.moved < 6 && (performance.now() - drag.t0) < 400
      const wasTouch = drag.isTouch
      drag.active = false
      // Touch release: ease drag tilt back to 0 (the smoothing in tick handles
      // the easing once we set the target). Mouse: leave tilt alone, cursor
      // position still drives it.
      if (wasTouch) {
        drag.accX = 0; drag.accY = 0
        tilt.tx = 0; tilt.ty = 0
      }
      if (wasTap) {
        const ndc = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        )
        const ray = new THREE.Raycaster()
        ray.setFromCamera(ndc, camera)
        const hits = ray.intersectObject(blob)
        if (hits.length) {
          const p = hits[0].point.clone()
          blob.worldToLocal(p)
          uniforms.uPoke.value.copy(p)
          pokeVel = 0.6
        }
      }
    }

    const onDeviceOrientation = (e) => {
      if (e.beta == null || e.gamma == null) return
      // beta: front-back tilt around X (degrees). 0 = flat on table, ~60 = held
      // upright at a comfortable reading angle. We treat 60° as neutral.
      // gamma: left-right tilt around Y. 0 = neutral, ±45° comfortable range.
      const NEUTRAL_BETA = 60
      const bx = Math.max(-1, Math.min(1, (e.beta - NEUTRAL_BETA) / 45))
      const gy = Math.max(-1, Math.min(1, e.gamma / 45))
      gyroX = bx * TILT_X * 0.6
      gyroY = gy * TILT_Y * 0.6
    }
    async function enableGyro() {
      if (gyroEnabled || typeof DeviceOrientationEvent === 'undefined') return
      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const result = await DeviceOrientationEvent.requestPermission()
          if (result !== 'granted') return
        }
        window.addEventListener('deviceorientation', onDeviceOrientation)
        gyroEnabled = true
      } catch { /* permission denied or sensor unavailable */ }
    }

    // When `interactive` is false, the loader skips all pointer + gyro
    // tracking — the blob/cells animate on their own clock with no hover
    // tilt or tap response. Used by AboutPortrait where the blob is decorative.
    if (interactive) {
      window.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('pointercancel', onPointerUp)
    }

    // Resize via ResizeObserver — fits container changes
    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    // Animation loop
    const clock = new THREE.Clock()
    let simT = 0
    const tmpQ = new THREE.Quaternion()

    let raf = 0
    let firstRenderDone = false
    function tick() {
      const dt = Math.min(0.05, clock.getDelta())
      simT += dt * STATE.speed
      floatT += dt

      uniforms.uWobble.value = STATE.wobble
      uniforms.uDetail.value = STATE.detail

      tilt.x += (tilt.tx - tilt.x) * 0.08
      tilt.y += (tilt.ty - tilt.y) * 0.08

      world.rotation.x = tilt.x + gyroX
      world.rotation.y = tilt.y + gyroY + simT * 0.05
      blob.rotation.y += 0.002 * STATE.speed

      uniforms.uTime.value = simT

      const mixRate = (morph.sharpenTarget === 1 || morph.targetShape === 4) ? 2.2 : 5
      morph.mix += (morph.targetMix - morph.mix) * Math.min(1, dt * mixRate)
      morph.composeMix += (morph.composeTarget - morph.composeMix) * Math.min(1, dt * 3.5)
      if (morph.composeTarget === 1) morph.composeRealT += dt
      else morph.composeRealT = 0
      // Advance the extras phase clock once they're armed; reset to 0 on first
      // arm so every pulse cycle starts from the seed-scale "birth" state.
      if (morph.composeTarget === 1 && morph.composeRealT > GATHER_DUR) {
        if (!EXTRAS.armed) { EXTRAS.armed = true; EXTRAS.phase = 0 }
        EXTRAS.phase = (EXTRAS.phase + dt * STATE.smallSpeed / PULSE_PERIOD) % 1
      } else if (EXTRAS.armed) {
        EXTRAS.armed = false
      }
      const sharpenLerpRate = morph.sharpenTarget === 0 ? 1.8 : 3.5
      morph.sharpenMix += (morph.sharpenTarget - morph.sharpenMix) * Math.min(1, dt * sharpenLerpRate)
      const SHARPEN_HANDOFF_END = 1.35 + 0.40
      if (morph.sharpenT < SHARPEN_HANDOFF_END) morph.sharpenT += dt * STATE.speed
      if (morph.sharpenT >= SHARPEN_HANDOFF_END) morph.sharpenSpinT += dt * STATE.speed
      morph.orbitMix += (morph.orbitTarget - morph.orbitMix) * Math.min(1, dt * 3.5)
      morph.orbitPhase += dt * 12.0 * STATE.speed
      uniforms.uOrbitMix.value = morph.orbitMix
      uniforms.uOrbitPhase.value = morph.orbitPhase

      if (morph.shapeA !== morph.shapeB) {
        morph.blend += (1 - morph.blend) * Math.min(1, dt * 5)
        if (morph.blend > 0.995) { morph.shapeA = morph.shapeB; morph.blend = 0 }
      }
      if (morph.mix < 0.01 && morph.targetShape === 0) {
        morph.shapeA = 0; morph.shapeB = 0; morph.blend = 0
      }
      uniforms.uShapeA.value = morph.shapeA
      uniforms.uShapeB.value = morph.shapeB
      uniforms.uShapeBlend.value = morph.blend
      uniforms.uShapeMix.value = morph.mix

      const extrudingSmalls = (morph.shapeA === 3 || morph.shapeB === 3)
      for (const s of smalls) {
        if (extrudingSmalls) {
          s.u.uShapeA.value = morph.shapeA
          s.u.uShapeB.value = morph.shapeB
          s.u.uShapeBlend.value = morph.blend
          s.u.uShapeMix.value = morph.mix
        } else {
          s.u.uShapeMix.value = 0
        }
      }

      // Compose: big cell stays anchored at origin (same place as the default
      // view) so the radiation reads as emitting from a fixed source. The
      // breathing puff below provides the only motion.
      const cmx = smoothstep01(morph.composeMix)
      blob.position.set(0, 0, 0)
      // Puff in sync with the radiation: only after extras arm, sourced from
      // the same EXTRAS.phase that drives the pulses. Peaks at sp=0.18 — the
      // moment pulses emerge from the rim — so the big cell visibly "pushes"
      // each pulse out instead of breathing on its own clock.
      let puff = 0
      if (EXTRAS.armed) {
        const sp = EXTRAS.phase
        if (sp < 0.18) { const t = sp / 0.18; puff = 1 - (1 - t) * (1 - t) }
        else { const t = (sp - 0.18) / 0.82; puff = 1 - t * t }
      }
      const composeBaseMul = 1 - 0.35 * cmx
      const pulseAmp = 0.55 * cmx
      const composeScaleMul = composeBaseMul * (1 + pulseAmp * puff)
      blob.scale.setScalar(STATE.size * composeScaleMul)

      // Sharpen: damp wobble, spin/float overlay
      const shmx = smoothstep01(morph.sharpenMix)
      const inSharpen = shmx > 0.01
      if (inSharpen) {
        const tS = morph.sharpenSpinT
        const calmMul = 1 - 0.95 * shmx
        uniforms.uWobble.value = STATE.wobble * calmMul
        uniforms.uDetail.value = STATE.detail * (1 - 0.4 * shmx)
        const spinGate = smoothstep01((shmx - 0.4) / 0.5)
        const SPIN_OMEGA = Math.PI * 2
        blob.rotation.y += SPIN_OMEGA * spinGate * dt * Math.max(0.5, STATE.speed)
        blob.rotation.x = Math.sin(tS * 0.9) * 0.08 * spinGate
        blob.position.x = Math.sin(tS * 1.1) * 0.10 * spinGate
        blob.position.y = Math.sin(tS * 1.6) * 0.18 * spinGate
      }

      // Stretch
      morph.stretchMix += (morph.stretchTarget - morph.stretchMix) * Math.min(1, dt * 3.5)
      morph.stretchT += dt * STATE.speed
      const smx = smoothstep01(morph.stretchMix)
      const inStretch = smx > 0.01

      // Per-cycle bidirectional snake. Cycle: extend out (0–0.4), hold at
      // full extent (0.4–0.6), retract back along the same path (0.6–1.0).
      // Snake length = 0 at the cycle boundaries → it briefly disappears
      // before the next cycle begins (used by the tag gate below).
      const CYCLE = 4.0
      const phaseInCycle = inStretch ? (morph.stretchT % CYCLE) / CYCLE : 0
      const ease = (g) => g * g * (3 - 2 * g)
      let headU = 0
      if (inStretch) {
        if (phaseInCycle < 0.4) headU = ease(phaseInCycle / 0.4)
        else if (phaseInCycle < 0.6) headU = 1
        else headU = ease(1 - (phaseInCycle - 0.6) / 0.4)
      }

      // Per-tag gate. Combines mode entry/exit with per-tag thresholds
      // along the snake path: tag i appears as the snake's head passes its
      // anchor (headU > STRETCH_US[i]) and fades as the head retraces back.
      //   - Entering stretch (stretchTarget=1, smx<0.95): each tag → 0.
      //   - Fully in stretch (stretchTarget=1, smx≥0.95): per-tag target
      //     = smoothstep((headU - STRETCH_US[i]) / 0.04).
      //   - Leaving stretch (stretchTarget=0, smx>0.01): track smx so tags
      //     + lines fade with the snake's retraction.
      //   - Out of stretch (smx≤0.01): ease back to 1.
      if (morph.stretchTarget === 1 && smx > 0.95) {
        for (let i = 0; i < 3; i++) {
          const target = smoothstep01((headU - STRETCH_US[i]) / 0.04)
          tagModeOpacity[i] += (target - tagModeOpacity[i]) * Math.min(1, dt * 8)
        }
      } else if (morph.stretchTarget === 1) {
        for (let i = 0; i < 3; i++) {
          tagModeOpacity[i] += (0 - tagModeOpacity[i]) * Math.min(1, dt * 4)
        }
      } else if (smx > 0.01) {
        for (let i = 0; i < 3; i++) tagModeOpacity[i] = smx
      } else {
        for (let i = 0; i < 3; i++) {
          tagModeOpacity[i] += (1 - tagModeOpacity[i]) * Math.min(1, dt * 4)
        }
      }
      stretchSegments.forEach(s => s.visible = false)
      const sharpenLock = inSharpen && morph.sharpenTarget === 1
      smallGroup.visible = !inStretch && !sharpenLock
      if (inStretch) {
        const blobVisU = 1 - smoothstep01((smx - 0.35) / 0.35)
        const squish = 1 - 0.92 * smx
        const elong = 1 + 0.6 * smx
        if (stretchPath.segs && stretchPath.segs.length > 0) {
          const firstSeg = stretchPath.segs[0]
          const segDir = new THREE.Vector3().subVectors(firstSeg.b, firstSeg.a).normalize()
          const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), segDir)
          blob.quaternion.slerp(q, Math.min(1, smx * 1.5))
        }
        blob.scale.set(
          STATE.size * composeScaleMul * squish * blobVisU,
          STATE.size * composeScaleMul * elong * (0.2 + 0.8 * blobVisU),
          STATE.size * composeScaleMul * squish * blobVisU,
        )
        const cycleIdx = Math.floor(morph.stretchT / CYCLE)
        if (cycleIdx !== stretchPath.cycleIdx) {
          buildRandomStretchPath()
          stretchPath.cycleIdx = cycleIdx
        }
        const { segs, totalLen } = stretchPath
        if (segs.length > 0) {
          // Tail anchored at origin; head retraces back along the same
          // path each cycle. Snake length goes 0 → totalLen → 0.
          const headDist = headU * totalLen
          const tailDist = 0
          const orientY = new THREE.Vector3(0, 1, 0)
          const placeCapsule = (mesh, a, b) => {
            const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)
            const delta = new THREE.Vector3().subVectors(b, a)
            const len = delta.length()
            if (len < 0.005) { mesh.visible = false; return }
            mesh.visible = true
            mesh.position.copy(mid)
            mesh.quaternion.setFromUnitVectors(orientY, delta.clone().normalize())
            mesh.scale.set(smx, smx * len, smx)
          }
          let out = 0
          for (let i = 0; i < segs.length && out < STRETCH_MAX_SEGMENTS; i++) {
            const s = segs[i]
            const segEnd = s.start + s.len
            if (segEnd <= tailDist) continue
            if (s.start >= headDist) break
            const uStart = Math.max(0, (tailDist - s.start) / s.len)
            const uEnd = Math.min(1, (headDist - s.start) / s.len)
            if (uEnd - uStart < 0.001) continue
            const a = uStart > 0 ? new THREE.Vector3().lerpVectors(s.a, s.b, uStart) : s.a
            const b = uEnd < 1 ? new THREE.Vector3().lerpVectors(s.a, s.b, uEnd) : s.b
            placeCapsule(stretchSegments[out++], a, b)
          }
          for (let i = out; i < STRETCH_MAX_SEGMENTS; i++) stretchSegments[i].visible = false
        }
      } else {
        stretchPath.cycleIdx = -1
        blob.scale.setScalar(STATE.size * composeScaleMul)
        if (!inSharpen) {
          blob.quaternion.slerp(tmpQ.identity(), Math.min(1, dt * 4))
        }
      }

      // Sharpen camera pull
      const SHARPEN_FOV = 12, SHARPEN_DIST = 15
      const DEFAULT_FOV = 35, DEFAULT_DIST = 5
      const targetFov = DEFAULT_FOV + (SHARPEN_FOV - DEFAULT_FOV) * shmx
      const targetDist = DEFAULT_DIST + (SHARPEN_DIST - DEFAULT_DIST) * shmx
      if (Math.abs(camera.fov - targetFov) > 0.01) {
        camera.fov = targetFov
        camera.updateProjectionMatrix()
      }
      camera.position.z = targetDist

      // Poke decay
      if (pokeVel > 0) pokeVel = Math.max(0, pokeVel - dt * 1.2)
      uniforms.uPokeStrength.value += (pokeVel - uniforms.uPokeStrength.value) * 0.15

      for (const s of smalls) s.step(dt)
      if (morph.composeTarget > 0) {
        ensureComposeExtras()
        for (const s of composeExtras) s.step(dt)
      } else if (composeExtras.length) {
        disposeComposeExtras()
      }

      // Extrude fan layout: arrange big + smalls in a fanned poker hand
      let fanW = 0
      if (morph.shapeA === 3 && morph.shapeB === 3) fanW = morph.mix
      else if (morph.shapeA === 3) fanW = morph.mix * (1 - morph.blend)
      else if (morph.shapeB === 3) fanW = morph.mix * morph.blend
      if (fanW > 0.001) {
        const N = smalls.length
        const total = N + 1
        const midIdx = Math.floor(total / 2)
        const SPREAD = 0.26
        const PIVOT_Y = -1.8
        const RADIUS = 2.4
        const cardScale = STATE.size * 0.62
        const slotPos = (i) => {
          const ang = (i - midIdx) * SPREAD
          return {
            x: Math.sin(ang) * RADIUS,
            y: Math.cos(ang) * RADIUS + PIVOT_Y,
            z: -i * 0.015,
            ang,
          }
        }
        if (!fanState.shuffle || fanState.shuffle.total !== total) {
          const init = new Array(total)
          for (let i = 0; i < total; i++) init[i] = i
          fanState.shuffle = {
            total, from: init.slice(), to: init.slice(),
            prog: new Array(total).fill(1), nextSwapAt: 0, _lastT: 0,
          }
        }
        const sh = fanState.shuffle
        const now = performance.now()
        const SWAP_DURATION = 850, SWAP_INTERVAL = 700
        const dtMs = Math.min(50, now - (sh._lastT || now))
        sh._lastT = now
        for (let i = 0; i < total; i++) {
          if (sh.prog[i] < 1) {
            sh.prog[i] = Math.min(1, sh.prog[i] + dtMs / SWAP_DURATION)
            if (sh.prog[i] >= 1) sh.from[i] = sh.to[i]
          }
        }
        if (fanW > 0.85 && now >= sh.nextSwapAt && total >= 2) {
          const idle = []
          for (let i = 0; i < total; i++) if (sh.prog[i] >= 1) idle.push(i)
          if (idle.length >= 2) {
            const a = idle[(Math.random() * idle.length) | 0]
            let b = idle[(Math.random() * idle.length) | 0]
            let guard = 8
            while (b === a && guard-- > 0) b = idle[(Math.random() * idle.length) | 0]
            if (b !== a) {
              const ta = sh.to[a], tb = sh.to[b]
              sh.from[a] = ta; sh.to[a] = tb; sh.prog[a] = 0
              sh.from[b] = tb; sh.to[b] = ta; sh.prog[b] = 0
            }
          }
          sh.nextSwapAt = now + SWAP_INTERVAL
        }
        const easeFn = (t) => t * t * (3 - 2 * t)
        const cardSlot = (cardI) => {
          const a = slotPos(sh.from[cardI])
          const b = slotPos(sh.to[cardI])
          const t = easeFn(sh.prog[cardI])
          const lift = Math.sin(sh.prog[cardI] * Math.PI) * 0.18
          return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t + lift,
            z: a.z + (b.z - a.z) * t + lift * 0.6,
            ang: a.ang + (b.ang - a.ang) * t,
          }
        }
        const tmpV = fanState.tmpV, tmpQ2 = fanState.tmpQ, tmpS = fanState.tmpS, axis = fanState.axis
        {
          const sl = cardSlot(0)
          tmpV.set(sl.x, sl.y, sl.z)
          blob.position.lerp(tmpV, fanW)
          tmpQ2.setFromAxisAngle(axis, -sl.ang)
          blob.quaternion.slerp(tmpQ2, fanW)
          tmpS.setScalar(cardScale)
          blob.scale.lerp(tmpS, fanW)
        }
        for (let k = 0; k < N; k++) {
          const sl = cardSlot(k + 1)
          const s = smalls[k]
          tmpV.set(sl.x, sl.y, sl.z)
          s.mesh.position.lerp(tmpV, fanW)
          tmpQ2.setFromAxisAngle(axis, -sl.ang)
          s.mesh.quaternion.slerp(tmpQ2, fanW)
          tmpS.setScalar(cardScale)
          s.mesh.scale.lerp(tmpS, fanW)
          if (fanW > 0.6) {
            s.captured = false
            if (swallowLockRef.current === s) swallowLockRef.current = null
            s.pos.copy(s.mesh.position)
            s.vel.set(0, 0, 0)
          }
        }
      } else if (fanState.shuffle) {
        fanState.shuffle = null
      }

      // ── Tag system ──
      // 1) Place anchors on the visible visual (snake in Stretch mode, blob
      //    position elsewhere).
      // 2) Place targets at anchor + outward direction × distance.
      // 3) Update each 3D line's geometry to span anchor → target.
      // 4) Project target to screen & sample canvas luma so DOM tags can
      //    position themselves and pick adaptive (white-on-dark, dark-on-light)
      //    styling, and adjust the line material color accordingly.
      const stretchActive = inStretch && stretchPath.segs && stretchPath.segs.length > 0
      if (stretchActive) {
        const totalLen = stretchPath.totalLen
        // Anchors clustered near the SNAKE START (= world origin, since the
        // path is built relative to its first waypoint at 0,0,0). All 3
        // connector lines emerge from this small region, with the DOM tags
        // floating around the start in three directions per TAG_DIRS.
        // STRETCH_US is hoisted to outer scope so the per-tag gate can use it.
        for (let i = 0; i < tagAnchors.length; i++) {
          const targetDist = STRETCH_US[i] * totalLen
          let seg = stretchPath.segs[stretchPath.segs.length - 1]
          for (const s of stretchPath.segs) {
            if (s.start + s.len >= targetDist) { seg = s; break }
          }
          const localU = Math.max(0, Math.min(1, (targetDist - seg.start) / seg.len))
          tagAnchors[i].position.lerpVectors(seg.a, seg.b, localU)
        }
      } else {
        // Anchors at blob center: the line goes from center outward in 3
        // different directions; the inside-blob portion is depth-occluded so
        // each line emerges visually from the blob's silhouette in its own
        // direction. As blob.scale changes (compose puff, fan card), the
        // silhouette shrinks and lines emerge from the new rim automatically.
        for (let i = 0; i < tagAnchors.length; i++) {
          tagAnchors[i].position.copy(blob.position)
        }
      }

      // Make sure world matrix is current so anchor world positions / dir
      // transforms are accurate this frame.
      world.updateMatrixWorld(true)

      // ── Optional freeze ──
      // OrganicLoaderTags requests a freeze when the swap-out finishes.
      // Capture the natural target world position (anchor world + outward dir
      // in world space × scaled distance). After this, the tag floats at this
      // fixed scene-world point until the next freeze request.
      //
      // Per-mode factor multiplier: default (no hover) and Orbit (Poweramp)
      // push tags noticeably further out so the visual breathes; the other
      // shape modes keep tags close.
      if (freezePending) {
        const baseScale = stretchActive ? STRETCH_BASE : blob.scale.x
        const isDefault =
          morph.composeTarget === 0 && morph.orbitTarget === 0 &&
          morph.sharpenTarget === 0 && morph.stretchTarget === 0 &&
          morph.targetShape === 0
        const isOrbit = morph.orbitTarget === 1
        // Default mode lifts tags slightly past the blob silhouette so
        // the three pieces of copy don't crowd each other on the right
        // side. Orbit keeps the previous (1.40) lift.
        let factorMul = 1.00
        if (isDefault) factorMul = 1.55
        else if (isOrbit) factorMul = 1.40
        for (let i = 0; i < tagAnchors.length; i++) {
          tagAnchors[i].getWorldPosition(_tmpAnchor)
          _tmpDir.copy(TAG_DIRS[i]).transformDirection(world.matrixWorld).normalize()
          const dist = TAG_FACTORS[i] * baseScale * factorMul
          tagFrozenWorld[i].copy(_tmpAnchor).addScaledVector(_tmpDir, dist)
        }
        freezePending = false
      }

      const cw = container.clientWidth, ch = container.clientHeight
      for (let i = 0; i < tagAnchors.length; i++) {
        // Anchor in scene-world coords (changes per frame as world rotates).
        tagAnchors[i].getWorldPosition(_tmpAnchor)

        // Effective target = frozen rest position + per-tag floating offset.
        // Different sin/cos terms (independent x/y freqs + per-tag phases)
        // keep the tags from drifting in sync.
        const fx = TAG_FLOAT_FREQS[i][0],  fy = TAG_FLOAT_FREQS[i][1]
        const px = TAG_FLOAT_PHASES[i][0], py = TAG_FLOAT_PHASES[i][1]
        const ax = TAG_FLOAT_AMPS[i][0],   ay = TAG_FLOAT_AMPS[i][1]
        const offX = Math.sin(floatT * fx + px) * ax
        const offY = Math.cos(floatT * fy + py) * ay
        _tmpEffective.copy(tagFrozenWorld[i])
        _tmpEffective.x += offX
        _tmpEffective.y += offY

        // Line vertex 1 = anchor lerp toward effective target by lineScale.
        _tmpEnd.copy(_tmpAnchor).lerp(_tmpEffective, tagLineScales[i])

        const arr = tagLineGeoms[i].attributes.position.array
        arr[0] = _tmpAnchor.x; arr[1] = _tmpAnchor.y; arr[2] = _tmpAnchor.z
        arr[3] = _tmpEnd.x;    arr[4] = _tmpEnd.y;    arr[5] = _tmpEnd.z
        tagLineGeoms[i].attributes.position.needsUpdate = true

        // Tag DOM screen position = projection of the effective (floating) target.
        _projVec.copy(_tmpEffective)
        _projVec.project(camera)
        tagScreenPos[i].x = ((_projVec.x + 1) * 0.5) * cw
        tagScreenPos[i].y = ((-_projVec.y + 1) * 0.5) * ch

        // Off-screen check on the projected target. A tag whose target
        // lands outside the canvas hides both its line and its DOM tag.
        tagOnScreen[i] =
          tagScreenPos[i].x >= 0 && tagScreenPos[i].x <= cw &&
          tagScreenPos[i].y >= 0 && tagScreenPos[i].y <= ch
            ? 1
            : 0

        // Line opacity is tied to lineScale (swap animation), per-tag
        // visibility (off-screen → 0), AND the per-tag mode gate.
        tagLineMats[i].opacity =
          tagLineScales[i] * 0.9 * tagOnScreen[i] * tagModeOpacity[i]
      }

      renderer.render(scene, camera)

      // Notify listeners that the visual has finished its first paint —
      // shaders are compiled and the scene is on screen. App.jsx waits on
      // this event before fading out the loading screen on '/' so the
      // user never sees an empty Home.
      if (!firstRenderDone) {
        firstRenderDone = true
        try {
          window.dispatchEvent(new Event('organic-loader-ready'))
        } catch { /* SSR / non-DOM env */ }
      }

      // After render: sample canvas pixels (fresh frame is now in the
      // drawing buffer thanks to preserveDrawingBuffer). Three samples per tag
      // offset away from the line endpoint so we don't strobe-sample the line
      // itself; average them. Material color updates apply on the NEXT render
      // so colors lag by one frame (imperceptible).
      for (let i = 0; i < tagAnchors.length; i++) {
        const sx = tagScreenPos[i].x, sy = tagScreenPos[i].y
        const a = samplePixelLuma(sx + 25, sy)
        const b = samplePixelLuma(sx, sy + 25)
        const c = samplePixelLuma(sx + 18, sy + 18)
        const luma = (a + b + c) / 3
        tagLumas[i] = luma
        // Lines stay white on every backdrop — under the canvas's difference
        // blend, white inverts to dark on light bg and stays light on dark.
        tagLineMats[i].color.setHex(0xffffff)
      }
      raf = requestAnimationFrame(tick)
    }

    const fanState = {
      shuffle: null,
      tmpV: new THREE.Vector3(),
      tmpQ: new THREE.Quaternion(),
      tmpS: new THREE.Vector3(),
      axis: new THREE.Vector3(0, 0, 1),
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      if (gyroEnabled) window.removeEventListener('deviceorientation', onDeviceOrientation)
      smalls.forEach(s => s.dispose())
      composeExtras.forEach(s => s.dispose())
      geom.dispose()
      smallGeom.dispose()
      stretchCapsuleGeom.dispose()
      blobMat.dispose()
      snakeMat.dispose()
      renderer.dispose()
      if (canvas.parentNode === container) container.removeChild(canvas)
      apiRef.current = null
    }
  }, [color, roughness])

  useImperativeHandle(ref, () => ({
    setShape: (idx) => apiRef.current?.setShape(idx),
    getTagScreenPos: (i) => apiRef.current?.getTagScreenPos(i),
    getTagOnScreen: (i) => apiRef.current?.getTagOnScreen(i) ?? 1,
    getTagModeOpacity: (i) => apiRef.current?.getTagModeOpacity(i) ?? 1,
    getTagLuma: (i) => apiRef.current?.getTagLuma(i) ?? 1,
    setTagLineScale: (i, s) => apiRef.current?.setTagLineScale(i, s),
    setTagLinesEnabled: (enabled) => apiRef.current?.setTagLinesEnabled(enabled),
    requestFreezeTagTargets: () => apiRef.current?.requestFreezeTagTargets(),
    samplePixelLuma: (x, y) => apiRef.current?.samplePixelLuma(x, y) ?? 1,
  }), [])

  return <div ref={containerRef} className={className} style={style} />
})

export default OrganicLoader
