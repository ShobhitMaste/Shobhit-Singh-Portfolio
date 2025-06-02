document.querySelector("body").addEventListener("wheel", (e) => {
    e.preventDefault();
}, {passive: false});


const loadingScreen = document.querySelector(".Loader");
const iframe = document.querySelector(".iframe");
const startButton = document.querySelector(".startButton");
const windows = document.querySelector(".windows");

document.querySelector(".turnon").addEventListener("click", () => {
    startButton.classList.add("displayHide");
    loadingScreen.classList.remove("displayHide");
    setTimeout(() => {
        loadingScreen.classList.add("displayHide");
        windows.classList.remove("displayHide");
    }, 3000);
});

var appBlue;

document.querySelectorAll(".app img").forEach((img) => {
    img.addEventListener("click", (e) => {
        e.stopPropagation();
        if(appBlue)
            appBlue.style.background = "transparent";
        appBlue = img;
        img.style.background = "#3399FF";
    });
});

document.querySelector(".apps").addEventListener("click", (e) =>{
    if(appBlue)
        appBlue.style.background = "transparent";
})

document.querySelectorAll(".app img").forEach((app) => {
    app.addEventListener("dblclick", () => {
        console.log(app.id);
        openApp(app.id);
    });
});

function openApp(id){
    
};