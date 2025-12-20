// script.js
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { PointerLockControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/PointerLockControls.js';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

// Gradient sky
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 2;
skyCanvas.height = 2;
const ctx = skyCanvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 2);
gradient.addColorStop(0, '#1a1a2e');
gradient.addColorStop(1, '#3c3c6e');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 2, 2);
scene.background = new THREE.CanvasTexture(skyCanvas);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);

const controls = new PointerLockControls(camera, document.body);
scene.add(controls.getObject());

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x444444));

// Ground
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// River
const waterTex = new THREE.TextureLoader().load('https://threejsfundamentals.org/threejs/resources/images/water.jpg');
waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
waterTex.repeat.set(4, 1);

const riverMat = new THREE.MeshPhongMaterial({ map: waterTex, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
const river = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), riverMat);
river.rotation.x = -Math.PI / 2;
river.position.set(-10, 0.011, 0);
scene.add(river);

// Flower creation
const flowers = [];
const colors = [0xff99dd, 0xffdd66, 0x99ddff, 0xccffcc];
function createFlower(x, y, z) {
  const group = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.5, 1.5, 1.5, 1.5, 0, 3);
  shape.bezierCurveTo(-1.5, 1.5, -0.5, 1.5, 0, 0);

  const extrudeSettings = { depth: 0.1, bevelEnabled: false };
  const petalGeom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  const petalMat = new THREE.MeshPhongMaterial({
    color: colors[Math.floor(Math.random() * colors.length)],
    side: THREE.DoubleSide
  });

  const flower = new THREE.Group();
  const layers = [
    { count: 5, radius: 1.2 },
    { count: 4, radius: 0.8, scale: 0.8, offset: Math.PI / 4 }
  ];

  layers.forEach(layer => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (2 * Math.PI * i) / layer.count + (layer.offset || 0);
      const petal = new THREE.Mesh(petalGeom, petalMat);
      petal.scale.setScalar(layer.scale || 1);
      petal.position.set(Math.cos(angle) * layer.radius, 0, Math.sin(angle) * layer.radius);
      petal.lookAt(0, 0, 0);
      flower.add(petal);
    }
  });

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffcc33 })
  );
  center.position.y = 0.2;
  flower.add(center);

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.2),
    new THREE.MeshPhongMaterial({ color: 0x3aa56a })
  );
  stem.position.y = -0.6;
  flower.add(stem);

  group.add(flower);
  group.position.set(x, y, z);
  scene.add(group);
  flowers.push(group);
}

// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
canvas.addEventListener('click', (e) => {
  if (!controls.isLocked) return;
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);
  const hit = raycaster.intersectObject(ground);
  if (hit.length) createFlower(hit[0].point.x, 0, hit[0].point.z);
});

// Movement
const move = { forward: false, backward: false, left: false, right: false };
const velocity = new THREE.Vector3();
const speed = 4.0;
const clock = new THREE.Clock();

document.addEventListener('keydown', (e) => {
  if (e.code === 'KeyW') move.forward = true;
  if (e.code === 'KeyS') move.backward = true;
  if (e.code === 'KeyA') move.left = true;
  if (e.code === 'KeyD') move.right = true;
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'KeyW') move.forward = false;
  if (e.code === 'KeyS') move.backward = false;
  if (e.code === 'KeyA') move.left = false;
  if (e.code === 'KeyD') move.right = false;
});
document.body.addEventListener('click', () => controls.lock());

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  velocity.set(0, 0, 0);
  if (move.forward) velocity.z -= speed * delta;
  if (move.backward) velocity.z += speed * delta;
  if (move.left) velocity.x -= speed * delta;
  if (move.right) velocity.x += speed * delta;
  controls.moveRight(velocity.x);
  controls.moveForward(velocity.z);

  flowers.forEach((f, i) => {
    const t = Date.now() * 0.001 + i;
    const blossom = f.children[0];
    if (blossom) {
      blossom.children.forEach(child => {
        if (child.type === 'Mesh' && child.geometry.type === 'ExtrudeGeometry') {
          child.scale.setScalar(1 + 0.2 * Math.sin(t));
        }
      });
    }
  });

  waterTex.offset.x += 0.002;
  renderer.render(scene, camera);
}

animate();

