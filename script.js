import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 2, 8);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0x444444));

// --- Ground plane ---
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// --- Flower setup ---
const flowers = [];
const colors = [0xff99dd, 0xffdd66, 0x99ddff, 0xccffcc];

function createFlower(x, y, z) {
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8),
    new THREE.MeshPhongMaterial({ color: 0x3aa56a })
  );
  stem.position.y = 0.4;

  const blossom = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshPhongMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      emissiveIntensity: 0.8,
      emissive: 0xff66cc
    })
  );
  blossom.position.y = 0.9;

  const group = new THREE.Group();
  group.add(stem);
  group.add(blossom);
  group.position.set(x, y, z);

  scene.add(group);
  flowers.push(group);
}

// --- Raycasting to detect click position ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

canvas.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(ground);

  if (intersects.length > 0) {
    const point = intersects[0].point;
    createFlower(point.x, 0, point.z);
  }
});

// --- Resize handling ---
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// --- Animation ---
function animate() {
  requestAnimationFrame(animate);

  flowers.forEach((f, i) => {
    const t = Date.now() * 0.001 + i;
    f.children[1].scale.setScalar(1 + 0.2 * Math.sin(t));
  });

  renderer.render(scene, camera);
}

animate();

