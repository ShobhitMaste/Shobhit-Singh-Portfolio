import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Geometries from "three/src/renderers/common/Geometries.js";
import { cameraFar, modelPosition, threshold } from "three/tsl";
import { DirectionalLight } from "three/webgpu";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { nodeProxy } from "three/src/nodes/TSL.js";
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
  normalMap: moon3dTexture,
} );
const moon = new THREE.Mesh( moonGeometry, moonMaterial );
var vh = window.innerHeight;
var iw = window.innerWidth;
var aspect = iw / vh;
console.log(aspect);
console.log("vh - " + vh);
// moon.position.set(-1.8, -3.6, -vh/3.318);
moon.position.set(1000, 1000, -500);
moon.rotation.x = 0.775;
moon.rotation.y = 0.674;
scene.add(moon);

// smartphone.position.x += -0.1;
//   smartphone.position.y += 2.66;
//   smartphone.position.z -= 1.5;
var smartphoneZrotation;
//phone 
const loader = new GLTFLoader();
var smartphone;
loader.load('models/newSmartphone.glb', (gltf) => {
  smartphone = gltf.scene;
  // smartphone.rotation.y -= -0.17;
  smartphone.rotation.z -= aspect >= 1.95? 0.155: 0.198;
  // smartphone.rotation.x -= -0.04;
  smartphone.position.set(100, 100, -400);
  smartphoneZrotation = smartphone.rotation.z;
  scene.add(smartphone);
}, undefined, (err)=>{
  console.log(err);
});
// gltf.scene.position.set(0, 0, 0);

let currentSection = 0;
const totalSections = 3;
var lastSection = 0;

  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    lastSection = currentSection;
    if (e.deltaY > 0 && currentSection < totalSections - 1) {
      currentSection++;
    } else if (e.deltaY < 0 && currentSection > 0) {
      currentSection--;
    }
    // console.log(lastSection, currentSection);

    window.scrollTo({
      top: currentSection * window.innerHeight,
      behavior: 'smooth'
    });
  }, { passive: false });


//lights
const pointLight = new THREE.PointLight(0xfff0bb, 10 , 100);
pointLight.position.copy(moon.position);
pointLight.position.x += 3;
pointLight.position.y += 4;
pointLight.position.z += -1.6;
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


var once = true;
var finalPhonepos;
var finalMoonpos;
function animate() {
  // console.log(camera.position)
  
  requestAnimationFrame( animate );
  let t = document.body.getBoundingClientRect().top;
  camera.position.z = t * 0.3;
  camera.rotation.z = t * 0.0002;
  // console.log(camera.fov);
  sun.rotation.x += 0.0001;
  sun.rotation.y += 0.0002;
  if(smartphone){
    
    if(currentSection == 1 && once == true){
      const targetPos = new THREE.Vector3(
        moon.position.x + 0.3,
        moon.position.y + 2.701,
        moon.position.z - 1.3
      );

      smartphone.position.lerp(targetPos, 0.05);   //used for animation
      
      
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const moonPos = new THREE.Vector3();
      moonPos.copy(camera.position).add(dir.multiplyScalar(6));
      moonPos.x += -2.6;
      moonPos.y += -3.8;
      moonPos.z += 4;
      moon.position.lerp(moonPos, 0.05);
      // smartphone.lookAt(camera.position);

      setTimeout(() => {
        once = false;
        finalPhonepos = smartphone.position;
        finalMoonpos = moon.position;
      }, 2000);
    
    } 
      
    if(smartphone && currentSection  == 1){
      if(phoneFullscreen == true){
        if(aspect >= 1.95)
          smartphone.rotation.z = smartphone.rotation.z + ((-(Math.PI / 2) - 0.155) - smartphone.rotation.z) * 0.04;     //magic happening here 
        else 
          smartphone.rotation.z = smartphone.rotation.z + ((-(Math.PI / 2) - 0.191) - smartphone.rotation.z) * 0.04;     //magic happening here 

        //smartphone moving
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const phonePos = new THREE.Vector3();
        phonePos.copy(camera.position).add(dir.multiplyScalar(2));
        phonePos.x += -1.8;
        phonePos.y += 0.3;
        phonePos.z += 1;
        smartphone.position.lerp(phonePos, 0.05);
      } 
      
      else if(nophonefullscreen){
        smartphone.rotation.z = smartphone.rotation.z + (smartphoneZrotation - smartphone.rotation.z) * 0.04
        // smartphone.rotation.z = smartphoneZrotation;

        const targetPos = new THREE.Vector3(
        moon.position.x + 0.3,
        moon.position.y + 2.701,
        moon.position.z - 1.3
        );

        smartphone.position.lerp(targetPos, 0.05);
      }

    }
    
  }
  
  bloomComposer.render();
}

animate();

let horizontalPhoneDOM = document.getElementById("horizontalPhoneScreen");


let phoneFullscreen = false;
let nophonefullscreen = false;

function PhoneFullscreenModeSwitch(){
  if((!phoneFullscreen && !nophonefullscreen) || (!phoneFullscreen && nophonefullscreen)){
    phoneFullscreen = true;
    nophonefullscreen = false;
    document.getElementById("moonContent").classList.add("hidden");
    document.getElementById("horizontalPhoneScreen").classList.remove("hidden");
    setTimeout(() => {
        document.getElementById("moonContent").classList.add("displayHide");
        document.getElementById("horizontalPhoneScreen").classList.remove("displayHide");
    }, 500);

    //loading screen
    setTimeout(() => {
      document.getElementById("loading").classList.add("hidden");
    }, 1800);
    setTimeout(() => {
      document.getElementById("loading").style.display = "none" ;
      document.getElementById("screenContent").classList.remove("displayHide");
      document.querySelector(".curtains").classList.remove ("displayHide");
    }, 2400);
    setTimeout(() => {
      document.querySelector(".rightHalf").classList.add("hoverRight");
      document.querySelector(".leftHalf").classList.add("hoverLeft");
    }, 2600);
    setTimeout(() => {
      document.querySelector(".curtains").style.display = "none";
      // document.querySelector(".leftHalf").classList.add("displayHide");
    }, 3600);
//loading end here

  } else {
    phoneFullscreen = false;
    nophonefullscreen = true;
    document.getElementById("moonContent").classList.remove("hidden");
    // document.getElementById("horizontalPhoneScreen").classList.add("hidden");
    document.getElementById("horizontalPhoneScreen").classList.add("displayHide");
    setTimeout(() => {
      document.getElementById("moonContent").classList.remove("displayHide");
    }, 500);
  }
}
window.PhoneFullscreenModeSwitch = PhoneFullscreenModeSwitch;


function getScreenPosition (object3D, camera) {
  let vector = new THREE.Vector3();
  let canva = renderer.domElement;

  vector.copy(object3D.position);
  vector.project(camera);

  return {
    x: (vector.x + 1) / 2 * canva.clientWidth,
    y: (-vector.y + 1) / 2 * canva.clientHeight
  };
};





















// else {
    //   setTimeout(() => {
    //     const hiddenPos = new THREE.Vector3(100, 100, -600);
    //     smartphone.position.lerp(hiddenPos, 0.05);
  
    //     const hiddenPosMoon = new THREE.Vector3(250, 450, -1000);
    //     moon.position.lerp(hiddenPosMoon, 0.05);
    //   }, 300);
    // }



// var lastScroll = 0;
// window.onscroll = () => scrollCheck();
// function scrollCheck() {
//   let t = document.body.getBoundingClientRect().top;
//   t = Math.abs(t);
//   console.log(t);
//   if(t > lastScroll){
//     //scroll down
//     // console.log("scroll down");
//     lastScroll = t;
//     if(t < 10){
//       //scroll to moon
//       window.scrollTo({
//         top: 990,
//         behavior: "smooth",
//       });
//       // camera.lookAt(moon.position);
//     }
//   } else {
//     //scroll up
//     // console.log("scroll up");
//     if(t < 1000 && t > 900){
//       window.scrollTo({
//       top: 0,
//       behavior: "smooth",
//       });

//     }
//     lastScroll = t;
//   }
// }