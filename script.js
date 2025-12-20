import * as THREE from 'https://cdn.skypack.dev/three@0.155.0';
import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.155.0/examples/jsm/controls/PointerLockControls.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);  // sky color (light blue)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 0);  // start at height 2 units above ground

const renderer = new THREE.WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// PointerLock controls for first-person camera
const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());  // add the camera controller to the scene

// DOM elements for instructions and crosshair
const blocker = document.getElementById('blocker');
const instructions = document.getElementById('instructions');
const crosshair = document.getElementById('crosshair');

// Start pointer lock on click
blocker.addEventListener('click', () => {
  controls.lock();
});
controls.addEventListener('lock', () => {
  // Hide overlay and show crosshair when controls are locked
  blocker.style.display = 'none';
  crosshair.style.display = 'block';
});
controls.addEventListener('unlock', () => {
  // Show overlay and hide crosshair when pointer is unlocked (e.g., ESC pressed)
  blocker.style.display = 'flex';
  crosshair.style.display = 'none';
});

// Ground plane (large flat plane to represent terrain)
const groundGeo = new THREE.PlaneGeometry(1000, 1000);
const groundMat = new THREE.MeshBasicMaterial({ color: 0x228B22 });  // forest green ground
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;  // rotate to lie on XZ-plane
ground.position.y = 0;
scene.add(ground);

// Load the custom shaders and create shader material
const vertexShaderUrl = 'vertexShader.vert';
const fragmentShaderUrl = 'fragmentShader.frag';
const uniforms = {
  uTime: { value: 0.0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
};
// Fetch shader source asynchronously, then init the shader material and objects
Promise.all([
  fetch(vertexShaderUrl).then(res => res.text()),
  fetch(fragmentShaderUrl).then(res => res.text())
]).then(([vertSource, fragSource]) => {
  const shaderMat = new THREE.ShaderMaterial({
    vertexShader: vertSource,
    fragmentShader: fragSource,
    uniforms: uniforms
  });
  shaderMat.transparent = false;  // opaque (no transparency)
  shaderMat.side = THREE.DoubleSide;  // make double-sided so it's visible from both sides

  // Create a plane mesh for the flower shader and add to scene
  const flowerPlane = new THREE.PlaneGeometry(10, 10);
  const flowerMesh = new THREE.Mesh(flowerPlane, shaderMat);
  flowerMesh.position.set(0, 6, -15);
  // Orient the plane to face the camera initially
  flowerMesh.lookAt(camera.position);
  scene.add(flowerMesh);
  
  // Start the animation loop after shaders are applied
  animate();
});

// Movement controls state
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
let moveForward = false, moveBackward = false;
let moveLeft = false, moveRight = false;

// Key event listeners for WASD/arrow movement
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      moveForward = true;
      break;
    case 'KeyS':
    case 'ArrowDown':
      moveBackward = true;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      moveLeft = true;
      break;
    case 'KeyD':
    case 'ArrowRight':
      moveRight = true;
      break;
  }
});
document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyW':
    case 'ArrowUp':
      moveForward = false;
      break;
    case 'KeyS':
    case 'ArrowDown':
      moveBackward = false;
      break;
    case 'KeyA':
    case 'ArrowLeft':
      moveLeft = false;
      break;
    case 'KeyD':
    case 'ArrowRight':
      moveRight = false;
      break;
  }
});

// Handle window resize to adjust camera and renderer
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // Update time uniform for shader
  uniforms.uTime.value = clock.getElapsedTime();

  // Update movement only if pointer lock is enabled
  if (controls.isLocked === true) {
    const delta = clock.getDelta();

    // Apply friction (damping)
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    // Determine movement direction vector
    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.normalize();  // prevent faster diagonal movement:contentReference[oaicite:7]{index=7}

    // Acceleration
    if (moveForward || moveBackward) {
      velocity.z -= direction.z * 400.0 * delta;
    }
    if (moveLeft || moveRight) {
      velocity.x -= direction.x * 400.0 * delta;
    }

    // Move the camera (controls object) by the computed velocity.
    controls.moveRight(-velocity.x * delta);
    controls.moveForward(-velocity.z * delta);
    // (Note: Negative signs above convert velocity to the proper local direction:contentReference[oaicite:8]{index=8}:contentReference[oaicite:9]{index=9})
  }

  renderer.render(scene, camera);
}

