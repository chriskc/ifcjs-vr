import {
    Scene,
    BoxGeometry,
    MeshBasicMaterial,
    MeshToonMaterial,
    MeshPhongMaterial,
    Mesh,
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
    TextureLoader,
    LoadingManager,
    AmbientLight,
    HemisphereLight,
    DirectionalLightHelper,
    AxesHelper,
    GridHelper,
    HemisphereLightHelper,
    SphereGeometry,
    Object3D,
    Shape,
    ExtrudeGeometry,
    EdgesGeometry,
    LineBasicMaterial,
    LineSegments,
    WireframeGeometry,
    PointsMaterial,
    Points,
    MeshLambertMaterial,
} from "three";
import CameraControls from "camera-controls";

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

import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import gsap from "gsap";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import {
    CSS2DRenderer,
    CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

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

const base = document.createElement("div");
base.className = "base-label";

const deleteButton = document.createElement("button");
deleteButton.textContent = "X";
deleteButton.className = "button hidden";
base.appendChild(deleteButton);

const baseObject = new CSS2DObject(base);
baseObject.position.set(0, 1, 0);
scene.add(baseObject);

// -----------------------------------------------------
// load building
// -----------------------------------------------------

const modelLoader = new GLTFLoader();
const modelLoadingElem = document.querySelector("#loader-container");
const modelLoadingText = modelLoadingElem.querySelector("p");

modelLoader.load(
    "./GLTF/police_station.glb",

    (gltf) => {
        modelLoadingElem.style.display = "none";
        const model = gltf.scene;
        scene.add(model);
        model.position.setX(30);
        model.position.setY(-5);
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
// create cubes
// -----------------------------------------------------

const geometry = new BoxGeometry(0.5, 0.5, 0.5);

const loader = new TextureLoader();

const materialOrange = new MeshBasicMaterial({
    color: "orange",
    map: loader.load("./sample.jpg"),
    transparent: true,
    opacity: 0.8,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
});

const materialBlue = new MeshToonMaterial({
    color: 0x6030ff,
    bumpMap: loader.load("./sample.jpg"),
    bumpScale: 1,
});

const materialRed = new MeshPhongMaterial({
    color: 0xff5555,
    // color: 0xffffff,
    shininess: 150,
    specular: "white",
    // wireframe: true,
    // wireframeLinewidth: 50
});

const materialHover = new MeshLambertMaterial({ color: 0x0000ff });
const materialHover2 = new MeshLambertMaterial({ color: 0x00aaff });

const cube = new Mesh(geometry, materialOrange);
cube.position.x = 1;
scene.add(cube);

const wireCube = new EdgesGeometry(cube.geometry);
const materialLine = new LineBasicMaterial({ color: 0x0000ff, linewidth: 3 });
const wireframe = new LineSegments(wireCube, materialLine);
cube.add(wireframe);

const bigCube = new Mesh(geometry, materialBlue);
bigCube.scale.set(2, 2, 2);
bigCube.position.x = 3;
scene.add(bigCube);

const smallCube = new Mesh(geometry, materialRed);
smallCube.position.x = -0.75;
smallCube.scale.set(1.5, 1.5, 1.5);
scene.add(smallCube);

const hoverCube = new Mesh(geometry, materialHover);
hoverCube.position.y = -1;
scene.add(hoverCube);

const hoverCube2 = new Mesh(geometry, materialHover2);
hoverCube2.position.y = -2;
scene.add(hoverCube2);

// -----------------------------------------------------
// create photo cube
// -----------------------------------------------------

// get random images
const images = [];
for (let i = 0; i < 6; i++) {
    images.push(`https://picsum.photos/200/300?random=${i}`);
}

// loading progress bar
const loadingManager = new LoadingManager();
const loadingElem = document.querySelector("#loading");
const progressBar = loadingElem.querySelector(".progressbar");

const textureLoader = new TextureLoader(loadingManager);
const photoMaterial = [
    new MeshBasicMaterial({ map: textureLoader.load(images[0]) }),
    new MeshBasicMaterial({ map: textureLoader.load(images[1]) }),
    new MeshBasicMaterial({ map: textureLoader.load(images[2]) }),
    new MeshBasicMaterial({ map: textureLoader.load(images[3]) }),
    new MeshBasicMaterial({ map: textureLoader.load(images[4]) }),
    new MeshBasicMaterial({ map: textureLoader.load(images[5]) }),
];

let photoCube;

// -----------------------------------------------------
// create cube collection
// -----------------------------------------------------

const cubeCollection = new Object3D();
scene.add(cubeCollection);
cubeCollection.add(cube, smallCube, bigCube);

// -----------------------------------------------------
// create solar system
// -----------------------------------------------------

const sphereGeometry = new SphereGeometry(0.5);

const solarSystem = new Object3D();
scene.add(solarSystem);

const sunMaterial = new MeshBasicMaterial({ color: "yellow" });
const sunMesh = new Mesh(sphereGeometry, sunMaterial);
solarSystem.add(sunMesh);

const earthMaterial = new MeshBasicMaterial({ color: "blue" });
const earthMesh = new Mesh(sphereGeometry, earthMaterial);
earthMesh.position.set(5, 0, 0);
sunMesh.add(earthMesh);

const moonMaterial = new MeshBasicMaterial({ color: "white" });
const moonMesh = new Mesh(sphereGeometry, moonMaterial);
moonMesh.scale.set(0.5, 0.5, 0.5);
moonMesh.position.set(1, 0, 0);
earthMesh.add(moonMesh);

// -----------------------------------------------------
// create stars
// -----------------------------------------------------

const radius = 10;
const widthSegments = 24;
const heightSegments = 28;
const points = new SphereGeometry(radius, widthSegments, heightSegments);

const pointsMaterial = new PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    sizeAttenuation: true,
});

const stars = new Points(points, pointsMaterial);
scene.add(stars);

// -----------------------------------------------------
// create squiggly extrusion
// -----------------------------------------------------

const squiggle = new Shape();
const x = 5;
const y = 2;

squiggle.moveTo(x, y);

squiggle.bezierCurveTo(
    x + 2,
    y + 1,
    x + 3,
    y + 3,
    x + 2,
    y + 2,
    x + 2,
    y + 2,
    x + 1,
    y + 0.5,
    x,
    y
);

const extrudeSettings = {
    steps: 2,
    depth: 1,
    bevelEnabled: true,
    bevelThickness: 0.25,
    bevelSize: 0.5,
    bevelOffset: 0,
    bevelSegments: 1,
};

const squiggleGeometry = new ExtrudeGeometry(squiggle, extrudeSettings);
const squiggleMaterial = new MeshPhongMaterial({ color: 0xffffff });
const squiggleMesh = new Mesh(squiggleGeometry, squiggleMaterial);
scene.add(squiggleMesh);

const squiggleWireframe = new WireframeGeometry(squiggleGeometry);
const squiggleLine = new LineSegments(squiggleWireframe);
squiggleLine.material.depthTest = false;
squiggleLine.material.opacity = 0.25;
squiggleLine.material.transparent = true;

scene.add(squiggleLine);

// -----------------------------------------------------
// setup camera
// -----------------------------------------------------
const camera = new PerspectiveCamera(
    100,
    canvas.clientWidth / canvas.clientHeight
);
camera.position.x = -6;
camera.position.y = 1;
camera.position.z = 3; // Z let's you move backwards and forwards. X is sideways, Y is upward and do
scene.add(camera);

// -----------------------------------------------------
// setup view
// -----------------------------------------------------
const renderer = new WebGLRenderer({ canvas });

renderer.render(scene, camera);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); // this renders crisp on load

// -----------------------------------------------------
// create lights
// -----------------------------------------------------

const light = new DirectionalLight();
const lightHelper = new DirectionalLightHelper(light, 1);
light.position.set(1, 20, 1).normalize();
scene.add(light);
scene.add(lightHelper);

const hemisphereLight = new HemisphereLight(0xffffff, 0x5533ff);
scene.add(hemisphereLight);
const hemisphereLightHelper = new HemisphereLightHelper(hemisphereLight);
scene.add(hemisphereLightHelper);

// -----------------------------------------------------
// create raycaster
// -----------------------------------------------------

// const raycaster = new Raycaster();
// const rayOrigin = new Vector3(-3, 0, 0);
// const rayDirection = new Vector3(10, 0, 0);
// rayDirection.normalize();
// raycaster.set(rayOrigin, rayDirection);

// const intersect = raycaster.intersectObject(cube);
// const intersects = raycaster.intersectObjects([cube, bigCube, smallCube]);

// -----------------------------------------------------
// create hover-select
// -----------------------------------------------------

// const objectsArray = Object.values(objectsToTest).map((item) => item.object);

const raycaster = new Raycaster();
const mouse = new Vector2();
let previousSelectedUuid;

const objectsArray = [hoverCube, hoverCube2];

// iterate to create an object
// -------------------------
let objectsToTest = {};
for (const object of objectsArray) {
    objectsToTest[object.uuid] = {
        object: object,
        color:
            "0x" + object.material.color.getHex().toString(16).padStart(6, "0"),
    };
}

// for testing against code from exercise
// -----------------------------------------
// const objectsToTest2 = {
//     [hoverCube.uuid]: { object: hoverCube, color: "blue" },
//     [hoverCube2.uuid]: { object: hoverCube2, color: "green" },
// };

console.log(objectsToTest);
// console.log(objectsToTest2);

function resetPreviousSelection() {
    if (previousSelectedUuid === undefined) return;
    const previousSelected = objectsToTest[previousSelectedUuid];
    let previousColor = previousSelected.color;
    previousSelected.object.material.color.setHex(previousColor);
    previousSelectedUuid = undefined; // needed this otherwise stuck on first geometry
}

window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = (event.clientY / canvas.clientHeight) * -2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objectsArray);

    // if raycaster hits nothing reset
    // -------------------------------------
    if (!intersects.length) {
        resetPreviousSelection();
        return;
    }

    // if raycaster hits something
    // -------------------------------------
    const firstIntersection = intersects[0];

    const isNotPrevious =
        previousSelectedUuid !== firstIntersection.object.uuid;

    if (previousSelectedUuid !== undefined && isNotPrevious) {
        resetPreviousSelection();
        return;
    }
    previousSelectedUuid = firstIntersection.object.uuid;
    firstIntersection.object.material.color.set("orange");
});

// -----------------------------------------------------
// ensuring resizing window doesn't distort canvas
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

// animate cubes
function animateCubes() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    bigCube.rotation.x += 0.0075;
    bigCube.rotation.y += 0.0075;
    smallCube.rotation.x += 0.005;
    smallCube.rotation.y += 0.005;
    photoCube.rotation.x += 0.02;
    photoCube.rotation.y += 0.02;
    // controls.update(); // camera - orbit controls
    const delta = clock.getDelta(); // camera - cameracontrols lib
    cameraControls.update(delta); // camera - cameracontrols lib
    requestAnimationFrame(animateCubes);
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

function animateSolarSystem() {
    sunMesh.rotation.y += 0.005;
    earthMesh.rotation.y += 0.005;

    const delta = clock.getDelta(); // camera - cameracontrols lib
    cameraControls.update(delta); // camera - cameracontrols lib
    requestAnimationFrame(animateSolarSystem);
    renderer.render(scene, camera);
}

animateSolarSystem();

loadingManager.onLoad = () => {
    loadingElem.style.display = "none";

    setTimeout(() => {
        photoCube = new Mesh(geometry, photoMaterial);
        photoCube.position.x = -3;
        photoCube.scale.set(2, 2, 2);
        scene.add(photoCube);
        animateCubes();

        cubeCollection.add(photoCube);
        cubeCollection.position.set(0, 5, 0);
        // move code into here for timeout
    }, 3000); // simulate an artificial delay
};

loadingManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    progressBar.style.transform = `scaleX(${progress})`;
};

// -----------------------------------------------------
// initialize gui -- for debugging
// -----------------------------------------------------

const gui = new GUI();

const functionParam = {
    spin: () => {
        gsap.to(cube.rotation, { y: cube.rotation.y + 10, duration: 1 });
        gsap.to(smallCube.rotation, {
            y: smallCube.rotation.y + 10,
            duration: 1,
        });
        gsap.to(bigCube.rotation, { y: bigCube.rotation.y + 10, duration: 1 });
        gsap.to(photoCube.rotation, {
            y: photoCube.rotation.y + 10,
            duration: 1,
        });
    },
};

const boxCollectionControls = gui.addFolder("cubeCollection");
boxCollectionControls
    .add(cubeCollection.position, "y")
    .min(-10)
    .max(10)
    .step(0.01)
    .name("cubeCollection Y-axis");
boxCollectionControls
    .add(cubeCollection, "visible")
    .name("cubeCollection visible");
boxCollectionControls.add(functionParam, "spin").name("spin");

const solarSystemControls = gui.addFolder("solarSystem");
solarSystemControls
    .add(solarSystem.rotation, "z")
    .min(-1)
    .max(1)
    .step(0.01)
    .name("z-rotation");

const colorParam = { color: 0xffffff };
solarSystemControls.addColor(colorParam, "color").onChange(() => {
    moonMesh.material.color.set(colorParam.color);
});
