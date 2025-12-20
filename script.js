import * as THREE from "https://cdn.skypack.dev/three@0.133.1/build/three.module.js";

const canvasEl = document.querySelector("#canvas");
const cleanBtn = document.querySelector(".clean-btn");

const pointer = {
  x: 0.66,
  y: 0.3,
  clicked: true,
};

window.setTimeout(() => {
  pointer.x = 0.75;
  pointer.y = 0.5;
  pointer.clicked = true;
}, 700);

let basicMaterial, shaderMaterial;
const renderer = new THREE.WebGLRenderer({ canvas: canvasEl, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const sceneShader = new THREE.Scene();
const sceneBasic = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
const clock = new THREE.Clock();

const renderTargets = [
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
  new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight),
];

let isTouchScreen = false;

window.addEventListener("click", (e) => {
  if (!isTouchScreen) {
    pointer.x = e.pageX / window.innerWidth;
    pointer.y = e.pageY / window.innerHeight;
    pointer.clicked = true;
  }
});
window.addEventListener("touchstart", (e) => {
  isTouchScreen = true;
  pointer.x = e.targetTouches[0].pageX / window.innerWidth;
  pointer.y = e.targetTouches[0].pageY / window.innerHeight;
  pointer.clicked = true;
});
cleanBtn.addEventListener("click", cleanCanvas);

function cleanCanvas() {
  pointer.vanishCanvas = true;
  setTimeout(() => {
    pointer.vanishCanvas = false;
  }, 50);
}

function updateSize() {
  if (shaderMaterial) {
    shaderMaterial.uniforms.u_ratio.value = window.innerWidth / window.innerHeight;
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderTargets[0].setSize(window.innerWidth, window.innerHeight);
  renderTargets[1].setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", () => {
  updateSize();
  cleanCanvas();
});

async function loadShaders() {
  const vertex = await fetch("vertexShader.vert").then((res) => res.text());
  const fragment = await fetch("fragmentShader.frag").then((res) => res.text());

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      u_stop_time: { value: 0.0 },
      u_stop_randomizer: { value: new THREE.Vector2(Math.random(), Math.random()) },
      u_cursor: { value: new THREE.Vector2(pointer.x, pointer.y) },
      u_ratio: { value: window.innerWidth / window.innerHeight },
      u_texture: { value: null },
      u_clean: { value: 1.0 },
    },
    vertexShader: vertex,
    fragmentShader: fragment,
  });

  basicMaterial = new THREE.MeshBasicMaterial();
  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const planeBasic = new THREE.Mesh(planeGeometry, basicMaterial);
  const planeShader = new THREE.Mesh(planeGeometry, shaderMaterial);
  sceneBasic.add(planeBasic);
  sceneShader.add(planeShader);

  updateSize();
  render();
}

function render() {
  shaderMaterial.uniforms.u_clean.value = pointer.vanishCanvas ? 0 : 1;
  shaderMaterial.uniforms.u_texture.value = renderTargets[0].texture;

  if (pointer.clicked) {
    shaderMaterial.uniforms.u_cursor.value = new THREE.Vector2(pointer.x, 1 - pointer.y);
    shaderMaterial.uniforms.u_stop_randomizer.value = new THREE.Vector2(Math.random(), Math.random());
    shaderMaterial.uniforms.u_stop_time.value = 0.0;
    pointer.clicked = false;
  }
  shaderMaterial.uniforms.u_stop_time.value += clock.getDelta();

  renderer.setRenderTarget(renderTargets[1]);
  renderer.render(sceneShader, camera);
  basicMaterial.map = renderTargets[1].texture;
  renderer.setRenderTarget(null);
  renderer.render(sceneBasic, camera);

  let tmp = renderTargets[0];
  renderTargets[0] = renderTargets[1];
  renderTargets[1] = tmp;

  requestAnimationFrame(render);
}

loadShaders();
