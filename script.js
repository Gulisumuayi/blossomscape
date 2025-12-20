let camera, scene, renderer, controls;
let blocker, instructions, crosshair;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let prevTime = performance.now();
let pointerMoved = false;         // will trigger flower reset when true
let flowerMaterial;               // will hold the ShaderMaterial for the flower

// Load the shader source files asynchronously, then initialize
Promise.all([
  fetch('vertexShader.vert').then(res => res.text()),
  fetch('fragmentShader.frag').then(res => res.text())
]).then(([vertSrc, fragSrc]) => {
  init(vertSrc, fragSrc);
  animate();
}).catch(err => {
  console.error('Error loading shaders:', err);
});

function init(vertexShaderSource, fragmentShaderSource) {
  // Get overlay elements
  blocker = document.getElementById('blocker');
  instructions = document.getElementById('instructions');
  crosshair = document.getElementById('crosshair');

  // Set up scene and camera
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);  // sky color background (light blue)
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.y = 10;  // start the camera above the ground

  // Lighting: hemisphere light for sky and ground
  const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x228B22, 0.6);
  hemiLight.position.set(0, 1, 0);
  scene.add(hemiLight);

  // Ground plane (green)
  const groundGeom = new THREE.PlaneGeometry(200, 200);
  groundGeom.rotateX(-Math.PI / 2);  // make it horizontal
  const groundMat = new THREE.MeshPhongMaterial({ color: 0x228B22 });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.position.y = 0;
  scene.add(ground);

  // Flower shader plane (placed in front of the camera)
  const planeGeom = new THREE.PlaneGeometry(20, 20);
  flowerMaterial = new THREE.ShaderMaterial({
    vertexShader: vertexShaderSource,
    fragmentShader: fragmentShaderSource,
    uniforms: {
      u_ratio:          { value: window.innerWidth / window.innerHeight },
      u_moving:         { value: 0.0 },
      u_stop_time:      { value: 0.0 },
      u_speed:          { value: 0.0 },
      u_stop_randomizer:{ value: new THREE.Vector2(Math.random(), Math.random()) },
      u_clean:          { value: 1.0 },
      u_cursor:         { value: new THREE.Vector2(0.5, 0.6) },  // cursor at center-ish
      u_texture:        { value: null }
    }
  });
  // Provide a base texture (black) for u_texture
  const baseColor = new Uint8Array([0, 0, 0, 255]);  // opaque black pixel
  const baseTexture = new THREE.DataTexture(baseColor, 1, 1);
  baseTexture.needsUpdate = true;
  flowerMaterial.uniforms.u_texture.value = baseTexture;
  flowerMaterial.side = THREE.DoubleSide;  // render both front and back of the plane

  const flowerPlane = new THREE.Mesh(planeGeom, flowerMaterial);
  flowerPlane.position.set(0, 10, -30);    // in front of camera at same height
  scene.add(flowerPlane);

  // Renderer setup
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // PointerLock controls setup
  controls = new THREE.PointerLockControls(camera, document.body);
  // Show/hide UI on lock/unlock
  controls.addEventListener('lock', () => {
    blocker.style.display = 'none';
    crosshair.style.display = 'block';
    // Reset and bloom a new flower when pointer lock is entered
    pointerMoved = true;
  });
  controls.addEventListener('unlock', () => {
    blocker.style.display = 'flex';
    instructions.style.display = '';
    crosshair.style.display = 'none';
  });
  // Lock pointer on click
  instructions.addEventListener('click', () => {
    controls.lock();
  });
  // Add the controls object to the scene (so camera's movement is handled by controls)
  scene.add(controls.getObject());

  // Movement controls (WASD)
  document.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveForward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveLeft = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveBackward = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveRight = true;
        break;
    }
  }, false);
  document.addEventListener('keyup', (event) => {
    switch (event.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveForward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveLeft = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveBackward = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveRight = false;
        break;
    }
  }, false);

  // Handle window resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // update aspect ratio uniform
    if (flowerMaterial) {
      flowerMaterial.uniforms.u_ratio.value = window.innerWidth / window.innerHeight;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now();
  if (controls.isLocked === true) {
    const delta = (time - prevTime) / 1000;

    // Update movement: move camera based on keys
    const moveSpeed = 100.0; // units per second for movement
    if (moveForward) controls.moveForward(moveSpeed * delta);
    if (moveBackward) controls.moveForward(-moveSpeed * delta);
    if (moveLeft) controls.moveRight(-moveSpeed * delta);
    if (moveRight) controls.moveRight(moveSpeed * delta);

    // Update flower shader uniforms (simulate "cursor" movement effect)
    if (pointerMoved) {
      // A new "stop" event – reset time and randomize flower parameters
      flowerMaterial.uniforms.u_moving.value = 1.0;
      flowerMaterial.uniforms.u_stop_randomizer.value.set(Math.random(), Math.random());
      flowerMaterial.uniforms.u_stop_time.value = 0.0;
      pointerMoved = false;
    } else {
      flowerMaterial.uniforms.u_moving.value = 0.0;
    }
    // Advance time uniform for the flower growth animation
    flowerMaterial.uniforms.u_stop_time.value += delta;
    // (u_speed could be set to player movement speed if desired; here we keep it at 0)
    flowerMaterial.uniforms.u_speed.value = 0.0;
  } else {
    // If not locked, we don't update movement or time (pause the scene)
    prevTime = time;
  }

  prevTime = time;
  renderer.render(scene, camera);
}

