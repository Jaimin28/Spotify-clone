
let currentsong = new Audio();
let songs;
let currfolder;
function convertToMinuteSecond(seconds) {
    // if(isNan(seconds) || seconds<0){
    //     return "00:00";
    // }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format minutes and seconds to be always 2 digits
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder){
    currfolder = folder
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response
    let li = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < li.length; index++) {
        const element = li[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${currfolder}/`) [1])
        }
        
    }
    return songs;
    
}
const playmusic = (track) => {
    // let audio = new Audio("/songs/" +track)
    currentsong.src = `/${currfolder}/` +track
    currentsong.play()
    play.src = "img/pause.svg"
    document.querySelector(".songinfo").innerHTML = track
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayalbum() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response
        let anchors =div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".cardcontainer");
    Array.from(anchors).forEach( async e => {
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[1]
            // get metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response);
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="ncs" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 25 25" class="Svg-sc-ytk21e-0 bneLcE">
                                <circle cx="12" cy="12" r="12" fill="#1fdf64"/>
                                <g transform="scale(0.6) translate(8 8)">
                                    <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"/>
                                  </g>
                            </svg>    
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
            
            
        }
    })
    
    
}
async function main() { 
    
    songs = await getsongs("songs/ncs")
    // playmusic(songs[0],false)
    // display albums
    displayalbum()
    // console.log(songs)
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for(const song of songs){
        songul.innerHTML = songul.innerHTML + `<li>
        <img  class="invert" src="img/music.svg" alt="">
            <div class="info">
                <div> ${song.replaceAll("%20"," ")}</div>
                <div>jaimin</div>
            </div>
            <div class="playnow">
                <span>Playnow</span>
                <img class="invert" src="img/play.svg" alt="">
            </div> </li>`;
    }
    // attach an eventlistner  to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
        return songs;
        
    });
    // attach eventlistner on play,next and previous
    play.addEventListener("click",() => {
        if(currentsong.paused){
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })
    // listen for time update
    currentsong.addEventListener("timeupdate",() => {
        // console.log(currentsong.currentTime,currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${convertToMinuteSecond(currentsong.currentTime)}/${convertToMinuteSecond(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration)*100 + "%";

        
    })
    // add event listner on seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) *  100
        document.querySelector(".circle").style.left = percent +"%";
        currentsong.currentTime = ((currentsong.duration) * percent)/100
        
    })

    // add an eventlistner on hamburger
    document.querySelector(".hamburger").addEventListener("click",() => {
        document.querySelector(".left").style.left = "0"
    })
    // add an eventlistner on close
    document.querySelector(".close").addEventListener("click",() => {
        document.querySelector(".left").style.left = "-110%"
    })
    // add en eventlistner on prev and next
    previous.addEventListener("click",() => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index-1)>=length){
            playmusic(songs[index+1])
        }
    })
    next.addEventListener("click",() => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if((index+1)<songs.length){
            playmusic(songs[index+1])
        }
        
    })
    //  add an event on volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e) => {
        currentsong.volume = parseInt(e.target.value)/100
    })
    // load the playlist when someone click the card 
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click",async item  => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playmusic(songs[0])
            
        })
    })
    // add event listner on volume button
    document.querySelector(".volume>img").addEventListener("click",(e) => {
        // console.log(e.target);
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 30
        }
        

    })
}

main()