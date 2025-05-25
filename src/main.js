import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const canvas = document.getElementById("bg");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );

camera.position.z = 5;

const pointLight = new THREE.PointLight("0xffffff");
pointLight.position.set(1,1,1);
// const ambientLight = new THREE.AmbientLight("0xffffff");

scene.add( pointLight,ambientLight );

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 300);

// scene.add(lightHelper, gridHelper); 

const controls = new OrbitControls( camera, renderer.domElement );

function animate() {
  requestAnimationFrame( animate );
  cube.rotation.x += .01;
  cube.rotation.y += .01;
  controls.update();
  renderer.render( scene, camera );
}
animate();

