import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils,
    Clock,
    DirectionalLight,
    HemisphereLight,
    DirectionalLightHelper,
    AxesHelper,
    GridHelper,
    HemisphereLightHelper,
} from "three";

const subsetOfTHREE = {
    MOUSE,
    Vector2,
    Vector3,
    Vector4,
    Quaternion,
    Matrix4,
    Spherical,
    Box3,
    Sphere,
    Raycaster,
    MathUtils: {
        DEG2RAD: MathUtils.DEG2RAD,
        clamp: MathUtils.clamp,
    },
};
import CameraControls from "camera-controls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import Stats from "stats.js/src/Stats";

import { VRButton } from "three/examples/jsm/webxr/VRButton.js";

// -----------------------------------------------------
// initialize scene
// -----------------------------------------------------
const canvas = document.getElementById("three-canvas");
const scene = new Scene();

const axesHelper = new AxesHelper();
scene.add(axesHelper);
const gridHelper = new GridHelper();
scene.add(gridHelper);

// -----------------------------------------------------
// setup 2d renderer
// -----------------------------------------------------

const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = "absolute";
labelRenderer.domElement.style.pointerEvents = "none";
labelRenderer.domElement.style.top = "0";
document.body.appendChild(labelRenderer.domElement);

// const base = document.createElement("div");
// base.className = "base-label";

// const deleteButton = document.createElement("button");
// deleteButton.textContent = "X";
// deleteButton.className = "button hidden";
// base.appendChild(deleteButton);

// const baseObject = new CSS2DObject(base);
// baseObject.position.set(0, 1, 0);
// scene.add(baseObject);

// -----------------------------------------------------
// load building
// -----------------------------------------------------

const modelLoader = new GLTFLoader();
const modelLoadingElem = document.querySelector("#loader-container");
const modelLoadingText = modelLoadingElem.querySelector("p");

let model;

modelLoader.load(
    "./GLTF/police_station.glb",

    (gltf) => {
        modelLoadingElem.style.display = "none";
        model = gltf.scene;
        scene.add(model);
        // model.position.setZ(5);
        model.position.setY(-8);
    },

    (progress) => {
        const current = (progress.loaded / progress.total) * 100;
        const formatted = Math.trunc(current * 100) / 100;
        modelLoadingText.textContent = `Loading: ${formatted}%`;
    },

    (error) => {
        console.log("Building model did not load. Error: ", error);
    }
);

// -----------------------------------------------------
// setup camera
// -----------------------------------------------------
const camera = new PerspectiveCamera(
    90,
    canvas.clientWidth / canvas.clientHeight
);

// Z let's you move backwards and forwards. X is sideways, Y is upward and do
camera.position.x = 10;
camera.position.y = 10;
camera.position.z = 15;
scene.add(camera);

// -----------------------------------------------------
// setup view
// -----------------------------------------------------
const renderer = new WebGLRenderer({ canvas });

renderer.render(scene, camera);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); // this renders crisp on load

renderer.xr.enabled = true;

renderer.setAnimationLoop(function () {
    renderer.render(scene, camera);
});

// -----------------------------------------------------
// create lights
// -----------------------------------------------------

const light = new DirectionalLight();
light.position.set(1, 20, 1).normalize();
scene.add(light);
// const lightHelper = new DirectionalLightHelper(light, 1);
// scene.add(lightHelper);

const hemisphereLight = new HemisphereLight(0xffffff, 0x5533ff);
scene.add(hemisphereLight);
// const hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight);
// scene.add(hemisphereLightHelper);

// -----------------------------------------------------
// create raycaster
// -----------------------------------------------------

const raycaster = new Raycaster();
const mouse = new Vector2();

window.addEventListener("dblclick", (event) => {
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = (event.clientY / canvas.clientHeight) * -2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(model);
    const location = intersects[0].point;

    const result = window.prompt("Add comment:");

    console.log(location);

    const base = document.createElement("div");
    base.className = "base-label";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "X";
    deleteButton.className = "delete-button hidden";
    base.appendChild(deleteButton);

    const postit = document.createElement("div");
    postit.className = "label";
    postit.textContent = result;
    base.appendChild(postit);

    const ifcJsTitle = new CSS2DObject(base);
    ifcJsTitle.position.copy(location);
    scene.add(ifcJsTitle);
    // console.log(ifcJsTitle);

    deleteButton.onclick = () => {
        base.remove();
        ifcJsTitle.element = null;
        ifcJsTitle.removeFromParent();
    };
});

// -----------------------------------------------------
// VR
// -----------------------------------------------------

const vrButton = VRButton.createButton(renderer);
document.body.appendChild(vrButton);

console.log(vrButton);

// -----------------------------------------------------
// resize canvas with client window
// -----------------------------------------------------
window.addEventListener("resize", () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    labelRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
});

// camera - cameracontrols lib
// left:orbit | right:pan | middle:zoom
CameraControls.install({ THREE: subsetOfTHREE });
const clock = new Clock();
const cameraControls = new CameraControls(camera, canvas);

// add stats
const stats = new Stats();
// stats.showPanel(1);
stats.showPanel(2);
document.body.appendChild(stats.dom);

// animate cubes
function animate() {
    stats.begin();
    const delta = clock.getDelta(); // camera - cameracontrols lib
    cameraControls.update(delta); // camera - cameracontrols lib
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    stats.end();

    labelRenderer.render(scene, camera);
}

animate();
