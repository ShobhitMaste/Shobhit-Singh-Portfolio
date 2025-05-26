import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Geometries from "three/src/renderers/common/Geometries.js";
import { threshold } from "three/tsl";
import { DirectionalLight } from "three/webgpu";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const canvas = document.getElementById("bg");


//settings
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
  canvas,
});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setClearColor(0x000000);
camera.position.z = 10;


// sun glow
const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
  1.5,
  0.4,
  0.85
);
bloomPass.threshold = 0.1;
bloomPass.strength = 1.4; //intensity of glow
const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(window.innerWidth, window.innerHeight);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

//stars
function addStar(){
  let x = THREE.MathUtils.randFloat(-250, 250);
  let y = THREE.MathUtils.randFloat(-150, 150);
  let z = THREE.MathUtils.randFloat(-300, -100);
  const starGeometry = new THREE.SphereGeometry(0.26, 25, 25);
  const starMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
  const star = new THREE.Mesh( starGeometry, starMaterial );
  star.position.set(x,y,z);
  scene.add(star);
}

Array(300).fill().forEach(addStar);

//sun
const sunTexture = new THREE.TextureLoader().load('./sun.png' ); 
const sun3dTexture = new THREE.TextureLoader().load('./sunTexture.jpg');
const sunGeometry = new THREE.SphereGeometry(20, 25, 25);
const sunMaterial = new THREE.MeshBasicMaterial( { 
  color: 0xFFFF00, map: sunTexture,
  // normalMap: sun3dTexture,
} );
const sun = new THREE.Mesh( sunGeometry, sunMaterial );
sun.position.set(100,40,-110);
scene.add(sun);


//moon

const moonTexture = new THREE.TextureLoader().load('./moon.jpg');
const moon3dTexture = new THREE.TextureLoader().load('./moonSurface.jpg');
const moonGeometry = new THREE.SphereGeometry(3, 300, 300);
const moonMaterial = new THREE.MeshStandardMaterial( { 
  color: 0x202020,
  map: moonTexture,
  // normalMap: moonTexture,
} );
const moon = new THREE.Mesh( moonGeometry, moonMaterial );
moon.position.set(0, -3, -299);
moon.rotation.x = 0.875;
moon.rotation.y = 0.274;
scene.add(moon);

//phone 



//lights
const pointLight = new THREE.PointLight(0xfff0bb, 99, 100);
pointLight.position.set(2, 1, -295.5);
scene.add(pointLight);



const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add( ambientLight );


//sunlight
const sunlight = new THREE.DirectionalLight(0xfff0bb, 1);
sunlight.position.set(100,100,100);
sunlight.position.copy(sun.position);
scene.add(sunlight);


//fog
// scene.fog = new THREE.FogExp2( 0xffffff, .012 );




//helpers

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 300);

// scene.add( lightHelper); 

// const controls = new OrbitControls( camera, renderer.domElement );


window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);


var lastScroll = 0;
window.onscroll = () => scrollCheck();
function scrollCheck() {
  let t = document.body.getBoundingClientRect().top;
  t = Math.abs(t);
  console.log(t);
  if(t > lastScroll){
    //scroll down
    // console.log("scroll down");
    lastScroll = t;
    if(t < 10){
      //scroll to moon
      window.scrollTo({
        top: 990,
        behavior: "smooth",
      });
      camera.lookAt(moon.position);
    }
  } else {
    //scroll up
    // console.log("scroll up");
    if(t < 1000 && t > 900){
      window.scrollTo({
      top: 0,
      behavior: "smooth",
      });

    }
    lastScroll = t;
  }
}
let t;
function animate() {
  // console.log(camera.position)
  
  requestAnimationFrame( animate );
  let t = document.body.getBoundingClientRect().top;
  camera.position.z = t * 0.3;
  camera.rotation.z = t * 0.0002;
  sun.rotation.x += 0.0001;
  sun.rotation.y += 0.0002;
  // renderer.render( scene, camera );
  // moon.rotation.x += 0.0004;
  bloomComposer.render();
  
  
//   moon.rotation.x += 0.005;
// moon.rotation.y += 0.004;
}
animate();

