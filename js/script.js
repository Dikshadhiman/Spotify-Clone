console.log('Lets write Javascript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://192.168.18.8:3000/${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            // songs.push(element.href.split("/songs/")[1].split("%20")[0])
            songs.push(decodeURI(element.href.split(`/${currFolder}/`)[1]))
        }
    }
    // console.log(songs)

    // Show all the songs in playlist.
let songUL = document.querySelector(".songslist").getElementsByTagName("ul")[0];
songUL.innerHTML = ""
for (const song of songs){
    songUL.innerHTML = songUL.innerHTML + `<li> 
                    <img class="invert" src="img/music.svg" alt="">
                    <div class="info">
                        <div>${song}</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                    <img class="invert" src="img/pause.svg" alt="">
                    </div>
                </li>`;
}

// Attach an event listener to each song
Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e=>{
    e.addEventListener("click",element =>{
    // console.log(e.querySelector(".info").firstElementChild.innerHTML.trim())          
    playMusic(encodeURI((e.querySelector(".info").firstElementChild.innerHTML.trim())))
    play.src = "img/play.svg"
    })
})

return songs;

}

const playMusic = (track, pause=false) =>{
    // let audio = new Audio("/songs/"+track)
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play()
    }
    play.src = "img/pause.svg"
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`http://192.168.18.8:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer")
    // console.log(div);
    // console.log(anchors);
    let array = Array.from(anchors);
        // console.log(e.href);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];
        if(e.href.includes ("/songs")){
        // console.log(e.href.split("/").splice(-2)[0]);
        let folder = e.href.split("/").splice(-2)[0];

        // Get the metadata of the folder
        let a = await fetch(`http://192.168.18.8:3000/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder= ${folder} class="card">
                            <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="green"
                                class="bi bi-play-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0" fill="#1fdf64" />
                                <path d="M6.2 4.5a.5.5 0 0 1 .8-.5l4 3a.5.5 0 0 1 0 .814l-4 3a.5.5 0 0 1-.8-.407v-6z"
                                    fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach((e)=>{
        // console.log(e)
        e.addEventListener("click", async item=>{
            // console.log(item.currentTarget, item.currentTarget.dataset)
        songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
            play.src = "img/play.svg"
        })
    })

}
    

async function main() {
    // get the list of all songs
    await getSongs("songs/Karan")
    await getSongs("songs/Diljit")
    await getSongs("songs/Moosewala")
    await getSongs("songs/Shubh")
    await getSongs("songs/Juss")
    await getSongs("songs/Positive")
    await getSongs("songs/Sweet")

    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums()

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () =>{
        if(currentSong.paused){
            currentSong.play()
            play.src = "img/play.svg";
        }
        else{
            currentSong.pause()
            play.src = "img/pause.svg";
        }
    })

    // Listen for time update
    currentSong.addEventListener("timeupdate", () =>{
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration)* 100 + "%"
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration)* percent) /100

    })

    // Add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click",() =>{
        document.querySelector(".left").style.left = "0";
    })

    // Add event listener for close button1
    document.querySelector(".close").addEventListener("click", () =>{
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event listener to previous
    previous.addEventListener("click" , () =>{
        console.log("Previous")
        console.log(currentSong.src)
        console.log(currFolder)
        console.log(songs.indexOf(decodeURI(currentSong.src.split("/currFolder/")[1])))
        let index = songs.indexOf(decodeURI(currentSong.src.split("/currFolder/")[1]))

        // if(index > 0){
        //     playMusic(songs[index-1])
        // }
        // else{
        //     playMusic(songs[index])
        // }

        if ((index-1) >= 0){
            playMusic(songs[index-1]);
        }
    })

    // Add an event listener to next
    next.addEventListener("click" , () =>{
        console.log("Next")

        let index = songs.indexOf(decodeURI(currentSong.src.split("currFolder/")[1]))
        console.log(decodeURI(currentSong.src.split("/songs/")[1]))
        // console.log(currentSong.src.split("/songs/").slice(-1)[0])
        console.log(songs, index)

        // if(index == (songs.length)-1){
        //     playMusic(songs[index])
        // }
        // else{
        //     playMusic(songs[index+1])
        // }

        if ((index+1) < songs.length) {
            playMusic(songs[index+1]);
        }
    })

    // Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
       console.log("Setting Volume to " + e.target.value + "/100");
       currentSong.volume = parseInt(e.target.value)/100;
       if(currentSong.volume == 0){
        document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/mute.svg"
       }
       else{
        document.querySelector(".volume").getElementsByTagName("img")[0].src = "img/volume.svg"
       }
    })

    // Add event to volume
    document.querySelector(".volume>img").addEventListener("click",(e)=>{
        console.log(e.target.src)
        console.log("changing", e.target.src)
        if(e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg","mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.9;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 100;
        }
    })

}
main()