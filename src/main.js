import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Geometries from "three/src/renderers/common/Geometries.js";
import { cameraFar, modelPosition, threshold } from "three/tsl";
import { DirectionalLight, Vector2 } from "three/webgpu";
import { EffectComposer } from "/node_modules/three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "/node_modules/three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "/node_modules/three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mx_fractal_noise_float, nodeProxy } from "three/src/nodes/TSL.js";
import { FontLoader, TextGeometry } from "three/examples/jsm/Addons.js";
import * as RAPIER from '@dimforge/rapier3d-compat';
import { mx_bilerp_0 } from "three/src/nodes/materialx/lib/mx_noise.js";
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';


await RAPIER.init() // This line is only needed if using the compat version
const gravity = new RAPIER.Vector3(0.0, 0, 0.0)
const world = new RAPIER.World(gravity)
const dynamicBodies = []

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
  let x = THREE.MathUtils.randFloat(-300, 300);
  let y = THREE.MathUtils.randFloat(-200, 200);
  let z = THREE.MathUtils.randFloat(-600, -100);
  const starGeometry = new THREE.SphereGeometry(0.26, 25, 25);
  const starMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
  const star = new THREE.Mesh( starGeometry, starMaterial );
  star.position.set(x,y,z);
  scene.add(star);
}

Array(450).fill().forEach(addStar);

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
// console.log(aspect);
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
  // smartphone.rotation.z -= aspect >= 1.95? 0.155: 0.198;
  // smartphone.rotation.x -= -0.04;
  smartphone.position.set(100, 100, -400);
  smartphoneZrotation = smartphone.rotation.z;
  scene.add(smartphone);
}, undefined, (err)=>{
  console.log(err);
});
// gltf.scene.position.set(0, 0, 0);

//cursor
var amongus, amongusCollider, amongusBody;
loader.load('models/amongus.glb', (gltf) => {
  amongus = gltf.scene;
  amongus.position.set(0, 0, -2);
  scene.add(amongus);

  amongusBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.kinematicPositionBased()
      .setTranslation(amongus.position.x, amongus.position.y, amongus.position.z)
  );

  // 🧠 Create a box collider — adjust size to match your model
  amongusCollider = world.createCollider(
    RAPIER.ColliderDesc.cuboid(0.1, 0.1, 0.1).setRestitution(1),
    amongusBody
  );

}, undefined, (err) => {
  console.log(err);
});

let mouse = new Vector2();
document.addEventListener('pointermove', event => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  // console.log(mouseX, mouseY);
});

const rayCaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 2)
//for cursor end here
var string = `+------------------------------+
|    WELCOME STRANGER     |
|          Scroll Down           |
+------------------------------+`
const fontLoader = new FontLoader();
fontLoader.load('./fonts/font2.json', function (font) {
  const textGeometry = new TextGeometry(string, {
    font: font,
    size: 0.1,
    height: 0.6,
    curveSegments: 22,
    bevelEnabled: true,
    bevelThickness: 0.0001,
    bevelSize: .0003,
    bevelOffset: 0,
    bevelSegments: 3,
    depth:0.002,
  });

  const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFDBB2D});
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0.44,0.35, -2);
  scene.add(textMesh);
  const box = new THREE.Box3().setFromObject(textMesh);
  const size = new THREE.Vector3();
  box.getSize(size);
  const center = new THREE.Vector3();
  box.getCenter(center);

  const textBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic().setTranslation(center.x , center.y - 0.2, center.z ).setAdditionalMass(1000000).enabledTranslations(true, true, false)
  );
  const textShape = RAPIER.ColliderDesc.cuboid(size.x / 2 - 0.17, size.y / 2 - 0.07, size.z / 2).setTranslation(0.58,0,0).setRestitution(1);
  world.createCollider(textShape, textBody);
  
  dynamicBodies.push([textMesh, textBody]);
});


const torusTexture = new THREE.TextureLoader().load('./grad.jpg');
var pivot = new THREE.Object3D();
const torusgeometry = new THREE.TorusGeometry( 0.3, 0.1, 12, 48 ); 
const torusmaterial = new THREE.MeshStandardMaterial( { color: 0xcccccc, map:torusTexture } ); 
const torus = new THREE.Mesh( torusgeometry, torusmaterial );
pivot.add(torus);
torus.position.set(2,1.5,0);
scene.add(pivot);

var rocket;
loader.load('models/rocket.glb', (gltf) => {
  rocket = gltf.scene;
  rocket.traverse((child) => {
    if (child.isMesh) {
      child.layers.set(1); // Set to layer 1
    }
  });
  // rocket.position.set(0, 0, -10);

  pivot.add(rocket);
  rocket.position.set(0, 0, 50);
  rocket.rotation.x = 2.8;
  rocket.rotation.y = 3;
  rocket.rotation.z = 1.5;
});

var laptop;
loader.load('models/laptop2.glb', (gltf) => {
  laptop = gltf.scene;
  laptop.position.set(0, 300, -800)
  // laptop.traverse(child => {
  //   if (child.isMesh && child.material) {
  //   child.material.emissive = new THREE.Color(0x000000);       // Disable glow
  //   child.material.emissiveIntensity = 0;
  //   child.material.metalness = 0.2;
  //   child.material.roughness = 0.6;
  //   child.material.needsUpdate = true;
  // }
  // });
  scene.add(laptop);
});

//testing

const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("extra").appendChild( css3dRenderer.domElement );

const div = document.createElement( 'div' );
div.style.width = '1128px';
div.style.height = '645px';
div.style.backgroundColor = '#aaaaaa';
div.style.transform = `scale(0.2)`;

const iframe = document.createElement( 'iframe' );
iframe.style.width = '1128px';
iframe.style.height = '645px';
iframe.style.border = '0px';
iframe.src = 'http://127.0.0.1:3000/iframes/test.html';
div.appendChild( iframe );

const screen = new CSS3DObject( div );
scene.add(screen);
// screen.scale.set(0.2);
screen.position.set(0,0, -100);
screen.visible = false;

//testing end



let currentSection = 0;
const totalSections = 3;
var lastSection = 0;
var smartphoneMode = false;  //remember to turn it true
var timerStarted = false;
var laptopInitiated = false;
  document.querySelectorAll(".body").forEach((el) => {
    el.addEventListener("wheel", (e) => {
    e.stopPropagation();
    // console.log("body scroll");
    })
  })

  window.addEventListener('wheel', (e) => {
    // console.log(e);
    e.preventDefault();
    if(!smartphoneMode && timerStarted == false){
      timerStarted = true;
      lastSection = currentSection;
      if (e.deltaY > 0 && currentSection < totalSections - 1) {
        currentSection++;
      } else if (e.deltaY < 0 && currentSection > 0) {
        currentSection--;
      }
      console.log(lastSection, currentSection);
      
      if(currentSection == 1){
      screen.visible = false;
    }
    else if(currentSection == 2){
      if(laptopInitiated){
        setTimeout(() => {
          screen.visible = true;
        }, 500);
      } else {
        laptopInitiated = true;
        setTimeout(() => {
          screen.visible = true;
        }, 2000);
      }
    }

      window.scrollTo({
        top: currentSection * window.innerHeight,
        behavior: 'smooth'
      });

      setTimeout(()=> {
        timerStarted = false;
      }, 700);
    }

      
  }, { passive: false });


//lights
const pointLight = new THREE.PointLight(0xfff0bb, 10 , 100);
pointLight.position.copy(moon.position);
pointLight.position.x += 3;
pointLight.position.y += 4;
pointLight.position.z += -1.6;
scene.add(pointLight);

const pointLightLaptop = new THREE.PointLight(0xffffff, 10 , 100);
pointLightLaptop.position.z = 2;
scene.add(pointLightLaptop);




const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add( ambientLight );

const ambientLight2 = new THREE.AmbientLight(0x010101);
ambientLight2.layers.set(1); 
scene.add( ambientLight2 );


//sunlight
const sunlight = new THREE.DirectionalLight(0xfff0bb, 1);
sunlight.position.set(100,100,100);
sunlight.position.copy(sun.position);
scene.add(sunlight);


//fog
// scene.fog = new THREE.FogExp2( 0xffffff, .012 );




//helpers

const lightHelper = new THREE.PointLightHelper(pointLightLaptop);
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
var onceForLaptop = true;
function animate() {
  // console.log(camera.position)
  
  
  requestAnimationFrame( animate );
  let t = document.body.getBoundingClientRect().top;
  camera.position.z = t * 0.3;
  // camera.rotation.z = t * 0.0002;
  // console.log(camera.fov);
  sun.rotation.x += 0.0001;
  sun.rotation.y += 0.0002;
  
  world.step();

  for (const [mesh, body] of dynamicBodies) {
    const pos = body.translation();
    const rot = body.rotation();
    mesh.position.set(pos.x, pos.y, pos.z);
  mesh.quaternion.set(rot.x, rot.y, rot.z, rot.w);
  }

  if(amongus){
    rayCaster.setFromCamera(mouse, camera);
    const targetPoint = new THREE.Vector3();
    rayCaster.ray.intersectPlane(plane, targetPoint);

    // Optionally smooth the movement
    amongus.position.lerp(targetPoint, 0.01);
    var x = amongus.position.x;
    var y = amongus.position.y;
    var z = amongus.position.z;
    amongusBody.setNextKinematicTranslation({x,y,z});
    // amongus.rotation.x += 0.001;
    // amongus.rotation.y += 0.001;
    amongus.rotation.z += Math.sin(60) * 0.006;
    
    amongus.rotation.x += (mouse.x - amongus.rotation.x) * 0.1;
    amongus.rotation.y += (mouse.y - amongus.rotation.y) * 0.1;
    // amongus.rotation.z += 0.003;

  }
  if(smartphone){

    pivot.position.copy(smartphone.position);
    
    pivot.rotation.y += 0.003;
    torus.rotation.x += 0.006;
    torus.rotation.y += 0.005;
    torus.rotation.z += 0.005;

    if(currentSection == 1 && once == true){
      const targetPos = new THREE.Vector3(
        moon.position.x + -0.1,
        moon.position.y + 2.701,
        moon.position.z - 1.3
      );


      smartphone.position.lerp(targetPos, 0.05);   //used for animation
      

      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      const moonPos = new THREE.Vector3();
      moonPos.copy(camera.position).add(dir.multiplyScalar(6));
      moonPos.x += -2.6;
      moonPos.y += -4.2;
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
        smartphone.rotation.z = smartphone.rotation.z + ((-(Math.PI / 2)) - smartphone.rotation.z) * 0.04;     //magic happening here 

        //smartphone moving
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir);
        const phonePos = new THREE.Vector3();
        phonePos.copy(camera.position).add(dir.multiplyScalar(2));
        phonePos.x += -1.8;
        phonePos.y += 0;
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

  if(currentSection == 2 && onceForLaptop){
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const laptopPos = new THREE.Vector3();
    laptopPos.copy(camera.position).add(dir.multiplyScalar(0.18));
    laptop.lookAt(camera.position);
    laptop.position.y = -0.09;
    laptop.position.lerp(laptopPos, 0.05);
    laptop.rotation.x = 0;
    laptop.rotation.y = 0;
    laptop.rotation.z = 0;

    screen.position.copy(laptop.position);
    screen.quaternion.copy(laptop.quaternion);
    screen.rotation.x = -0;
    screen.position.x += 0;
    screen.position.y += 70;
    screen.position.z -= 800;
  
    pointLightLaptop.position.lerp(laptop.position , 0.05);
    pointLightLaptop.position.z += 0.1;
    pointLightLaptop.position.y += 0.1;
    setTimeout(() => {
      onceForLaptop = false;
      // screen.visible = true;
    }, 2000)
  }

  bloomComposer.render();
  css3dRenderer.render(scene, camera);
}
camera.layers.enable(1);

animate();

let horizontalPhoneDOM = document.getElementById("horizontalPhoneScreen");


let phoneFullscreen = false;
let nophonefullscreen = false;

function PhoneFullscreenModeSwitch(){
  if((!phoneFullscreen && !nophonefullscreen) || (!phoneFullscreen && nophonefullscreen)){
    smartphoneMode = true;
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
    smartphoneMode = false;
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
  renderer.domElement.style.transform = `translateX(-50%) translateY(-50%)`;
  vector.copy(object3D.position);
  vector.project(camera);

  return {
    x: (vector.x + 1) / 2 * canva.clientWidth,
    y: (-vector.y + 1) / 2 * canva.clientHeight
  };
};

let homeSection = document.getElementById("homeSection");
let aboutSection = document.getElementById("aboutSection");
let experienceSection = document.getElementById("experienceSection");
let projectSection = document.getElementById("projectSection");
let contactSection = document.getElementById("contactSection");

let currentScene = homeSection;
function changeScene(to){
  // console.log(to);
  currentScene.classList.add("displayHide");
  currentScene = document.getElementById(to);
  currentScene.classList.remove("displayHide");
  
}

window.changeScene = changeScene






















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