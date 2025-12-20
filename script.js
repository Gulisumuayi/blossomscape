import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module.js";

/* =======================
   DOM ELEMENTS
======================= */
const canvasEl = document.querySelector("#canvas");
const cleanBtn = document.querySelector(".clean-btn");
const titleEl = document.querySelector(".name");

/* =======================
   INTERACTION STATE
======================= */
const pointer = {
  x: 0.66,
  y: 0.3,
  clicked: true,
  vanishCanvas: false,
};

const targetPointer = {
  x: pointer.x,
  y: pointer.y,
};

let hasInteracted = false;
let isTouchScreen = false;

/* =======================
   UI HELPERS
======================= */
function hideTitleOnce() {
  if (hasInteracted) return;
  hasInteracted = true;
  titleEl.classList.add("hidden");
}

/* =======================
   THREE SETUP
======================= */
let basicMaterial, shaderMaterial;

const renderer = new THREE.WebGLRenderer({
  canvas: canvasEl,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const sceneShader = new THREE.Scene();
const sceneBasic = new THREE.Scene();

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
const clock = new THREE.Clock();

let renderTargets = [
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
];

/* =======================
   INPUT EVENTS
======================= */

// Smooth ambient movement
window.addEventListener("mousemove", (e) => {
  if (isTouchScreen) return;
  targetPointer.x = e.pageX / window.innerWidth;
  targetPointer.y = e.pageY / window.innerHeight;
});

// CLICK → place flower EXACTLY where clicked
window.addEventListener("click", (e) => {
  hideTitleOnce();

  const x = e.pageX / window.innerWidth;
  const y = e.pageY / window.innerHeight;

  targetPointer.x = x;
  targetPointer.y = y;
  pointer.x = x;
  pointer.y = y;

  pointer.clicked = true;
});

// TOUCH → same behavior
window.addEventListener("touchstart", (e) => {
  hideTitleOnce();
  isTouchScreen = true;

  const x = e.targetTouches[0].pageX / window.innerWidth;
  const y = e.targetTouches[0].pageY / window.innerHeight;

  targetPointer.x = x;
  targetPointer.y = y;
  pointer.x = x;
  pointer.y = y;

  pointer.clicked = true;
});

// Clear canvas
cleanBtn.addEventListener("click", () => {
  pointer.vanishCanvas = true;
  setTimeout(() => {
    pointer.vanishCanvas = false;
  }, 50);
});

/* =======================
   RESIZE
======================= */
function updateSize() {
  if (shaderMaterial) {
    shaderMaterial.uniforms.u_ratio.value =
      window.innerWidth / window.innerHeight;
  }

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderTargets[0].setSize(window.innerWidth, window.innerHeight);
  renderTargets[1].setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", updateSize);

/* =======================
   LOAD SHADERS
======================= */
async function loadShaders() {
  const vertex = await fetch("vertexShader.vert").then((r) => r.text());
  const fragment = await fetch("fragmentShader.frag").then((r) => r.text());

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_stop_time: { value: 0.0 },
      u_stop_randomizer: {
        value: new THREE.Vector2(Math.random(), Math.random()),
      },
      u_cursor: { value: new THREE.Vector2(pointer.x, pointer.y) },
      u_ratio: { value: window.innerWidth / window.innerHeight },
      u_texture: { value: null },
      u_clean: { value: 1.0 },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  });

  basicMaterial = new THREE.MeshBasicMaterial();

  const plane = new THREE.PlaneGeometry(2, 2);
  sceneShader.add(new THREE.Mesh(plane, shaderMaterial));
  sceneBasic.add(new THREE.Mesh(plane, basicMaterial));

  updateSize();
  render();
}

/* =======================
   RENDER LOOP
======================= */
function render() {
  // Smooth easing (museum pacing)
  const ease = 0.02;
  pointer.x += (targetPointer.x - pointer.x) * ease;
  pointer.y += (targetPointer.y - pointer.y) * ease;

  shaderMaterial.uniforms.u_clean.value = pointer.vanishCanvas ? 0.0 : 1.0;
  shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;

  if (pointer.clicked) {
    shaderMaterial.uniforms.u_cursor.value = new THREE.Vector2(
      pointer.x,
      1.0 - pointer.y
    );
    shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(
      Math.random(),
      Math.random()
    );
    shaderMaterial.uniforms.u_stop_time.value = 0.0;
    pointer.clicked = false;
  }

  shaderMaterial.uniforms.u_stop_time.value += clock.getDelta();

  renderer.setRenderTarget(renderTargets[1]);
  renderer.render(sceneShader, camera);

  basicMaterial.map = renderTargets[1].texture;

  renderer.setRenderTarget(null);
  renderer.render(sceneBasic, camera);

  [renderTargets[0], renderTargets[1]] = [
    renderTargets[1],
    renderTargets[0],
  ];

  requestAnimationFrame(render);
}

/* =======================
   START
======================= */
loadShaders();



