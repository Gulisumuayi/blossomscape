import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';

const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

const scene = new THREE.Scene();

// Create gradient sky background using canvas texture
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 2;
skyCanvas.height = 2;
const ctx = skyCanvas.getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 2);
gradient.addColorStop(0, '#1a1a2e'); // dark top
gradient.addColorStop(1, '#3c3c6e'); // soft horizon
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 2, 2);

const skyTexture = new THREE.CanvasTexture(skyCanvas);
scene.background = skyTexture;

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

// --- Flowing river plane ---
const waterTex = new THREE.TextureLoader().load('https://threejsfundamentals.org/threejs/resources/images/water.jpg');
waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping;
waterTex.repeat.set(4, 1);

const riverMat = new THREE.MeshPhongMaterial({
  map: waterTex,
  transparent: true,
  opacity: 0.6,
  side: THREE.DoubleSide
});

const river = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), riverMat);
river.rotation.x = -Math.PI / 2;
river.position.set(-10, 0.011, 0);// slightly above ground
scene.add(river);


// --- Flower setup ---
const flowers = [];
const colors = [0xff99dd, 0xffdd66, 0x99ddff, 0xccffcc];

function createFlower(x, y, z) {
  const group = new THREE.Group();

  // Define petal shape (teardrop using Bezier curves)
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

  // Add center
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffcc33 })
  );
  center.position.y = 0.2;
  flower.add(center);

  // Add stem
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
    const blossom = f.children[0]; // assuming `flower` is added as group.children[0]
    if (blossom) {
      blossom.children.forEach(child => {
        // Only animate petals, not the stem or center
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

