

let _stream;
let status;
let result;
let uploading;
let link;
let pictureURL;
let playing = false;
let play;
let play_slots = 17;
let start;
let end;
let length;

for(let i = 0; i < play_slots; i++){
    document.getElementById('lapse-bar').innerHTML += `<div id="playslot-${i}" class="lapse-bar-step"></div>`
}

api = {
    url: 'https://api.giphy.com/v1/gifs',
    uploadURL: 'https://upload.giphy.com/v1/gifs',
    key: 'Zf45k9BsM730LcwnDxXFg7oesOYPcWBq'
}

timer = {
    d: 0,
    h: 0,
    m: 0,
    s: 0,
    timer: null,
    start() {
        clearInterval(this.timer);
        let _this = this;
        this.s = 0;
        this.m = 0;
        this.h = 0;
        this.d = 0;
        document.getElementById('s').innerHTML = "00";
        document.getElementById('m').innerHTML = "00";
        document.getElementById('h').innerHTML = "00";
        document.getElementById('d').innerHTML = "00";
        this.timer = setInterval(function(){
            _this.s++;
            if(_this.s > 59){_this.m++; _this.s=0}
            if(_this.m > 59){_this.h++; _this.m=0}
            if(_this.h > 24){_this.d++; _this.h=0}
            document.getElementById('s').innerHTML = new Intl.NumberFormat("en", { minimumIntegerDigits: 2 }).format(_this.s)
            document.getElementById('m').innerHTML = new Intl.NumberFormat("en", { minimumIntegerDigits: 2 }).format(_this.m)
            document.getElementById('h').innerHTML = new Intl.NumberFormat("en", { minimumIntegerDigits: 2 }).format(_this.h)
            document.getElementById('d').innerHTML = new Intl.NumberFormat("en", { minimumIntegerDigits: 2 }).format(_this.d)
        },1000)
    },
    stop() {
        clearInterval(this.timer);
    }
}

misGuifos = {
    items: [],
    container: document.getElementById('mis-guifos-container'),
    show_items() {
        this.container.innerHTML = "";
        this.items = [];
        for (let i = 0; i < localStorage.length; i++){
            this.items.push(localStorage.getItem(localStorage.key(i)))
        }
        this.items.forEach(item => {
            this.container.insertAdjacentHTML("beforeend", `
            <div class="img-cont">
                <img class="img margin-bottom" src="${item}"/>
            </div>
            `);
        })
    }
}




function setTheme(theme) {
    switch(theme) {
        case 'dark':
            sessionStorage.setItem('theme', 'dark');
            stylesheet.href = 'css/dark.css';
            break;
        case 'light':
            sessionStorage.setItem('theme', 'light');
            stylesheet.href = 'css/light.css';
            break;    
    }
}

function getTheme(){
    let theme = sessionStorage.getItem('theme');
    if(theme){
        setTheme(theme);
    } else {
        setTheme('light');
    }
}

function hideAll() {
    $confirmDialog.style.display = "none";
    $misGuifos.style.display = "none";
    $captura.style.display = "none";
}

function navigate(section) {
    hideAll();
    switch (section) {
        case 'back':
            window.location.href = "index.html";
            break;
        case 'confirm-dialog':
            $confirmDialog.style.display = "flex";
            $misGuifos.style.display = "block";
            misGuifos.show_items();
            break;
        case 'captura':
            $captura.style.display = "flex";
            getStream();
    }
}

function getStream() {
    navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width: { min: 960, max: 960 },
            height: { min: 540, max: 540 }
        } 
    })
    .then(function(stream) {
        _stream = stream;
        // console.log(stream);
        $video.srcObject = stream;
        $video.play();
    })
}

function takePicture() {
    var context = $canvas.getContext('2d');
    $canvas.width = 960;
    $canvas.height = 540;
    context.drawImage($video, 0, 0, 960, 540);
    pictureURL = $canvas.toDataURL('image/png');
}

function startRecording() {
    if(_stream){
        takePicture();
        $capturaButton.style.display = "none";
        $endCapturaButton.style.display = "flex";
        $dialogTitle.innerHTML = "Capturando Tu Guifo";
        recorder = RecordRTC(_stream, {
            type: 'gif',
            frameRate: 1,
            quality: 10,
            width: 360,
            hidden: 240,
            onGifRecordingStarted: function() {
                $capturaButtonContainer.style.justifyContent = "space-between";
                $counter.style.display = "flex";
                timer.start();
                status = 'recording';
                console.log('started');
                start = Date.now();
            },
        });
        recorder.startRecording();
    }
}

function stopRecording() {
    if(status == 'recording'){
        end = Date.now();
        status = 'stopped';
        recorder.stopRecording(recording => {timer.stop(); result = recording;});
        length = end - start - 390;
        $video.style.display = "none";
        $previewContainer.style.display = "block";
        $endCapturaButton.style.display = "none";
        $afterCapturaButtons.style.display = "flex";
        $previewLapseBar.style.display = "flex";
        $dialogTitle.innerHTML = "Vista previa";
        togglePlay();
    }
}

function repeatCaptura() {
    recorder.destroy();
    stopPlaying();
    $previewContainer.style.display = "none";
    $video.style.display = "block";
    $afterCapturaButtons.style.display = "none";
    $previewLapseBar.style.display = "none";
    $capturaButtonContainer.style.justifyContent = "flex-end";
    $capturaButton.style.display = "flex";
    $counter.style.display = "none";
}

function stopPlaying() {
    clearInterval(play);
    playing = false;
    timer.stop();
    for(let j = 0; j < play_slots; j++){
        document.getElementById(`playslot-${j}`).classList.remove("active");
    } 
}

function togglePlay() {
    if(playing) {
        clearInterval(play);
        playing = false;
        timer.stop();
        $previewContainer.src = pictureURL;
        for(let j = 0; j < play_slots; j++){
            document.getElementById(`playslot-${j}`).classList.remove("active");
        }
    } else {
        playing = true;
        timer.start();
        $previewContainer.src = result;
        let slot = 0;
        let interval = length / play_slots;
        play = setInterval(()=>{
            if(slot == play_slots) {
                slot = 0;
                for(let j = 0; j < play_slots; j++){
                    document.getElementById(`playslot-${j}`).classList.remove("active");
                    $previewContainer.src = result;
                    timer.start();
                }
            } else {
                document.getElementById(`playslot-${slot}`).classList.add("active");
                slot++;
            }
        }, interval)
    }
}

function uploadGif() {
    _stream.stop();
    stopPlaying();
    $previewContainer.style.display = "none";
    $counter.style.display = "none";
    $previewLapseBar.style.display = "none";
    $afterCapturaButtons.style.display = "none";
    $uploadScreen.style.display = "flex";
    $capturaButtonContainer.style.justifyContent = "flex-end";
    $cancelButton.style.display = "flex";
    $dialogTitle.innerHTML = "Subiendo Guifo";

    let slots = 23;

    for(let i = 0; i < slots; i++){
        document.getElementById('upload-bar').innerHTML += `<div id="slot-${i}" class="lapse-bar-step"></div>`
    }

    let slot = 0;
    let interval = 100;
    uploading = setInterval(()=>{
        if(slot == slots){
            slot = 0;
            for(let j = 0; j < slots; j++){
                document.getElementById(`slot-${j}`).classList.remove("active")
            }
        } else {
            document.getElementById(`slot-${slot}`).classList.add("active");
            slot++;
        }
    }, interval)

    let form = new FormData();
    form.append('file', recorder.getBlob(), 'myGif.gif');

    fetch(`${api.uploadURL}?api_key=${api.key}`, {method:'POST', body: form})
    .then(response => {
        return response.json();
    })
    .then(data => {
        clearInterval(uploading);
        recorder.destroy();
        $captura.style.display = "none";
        $success.style.display = "flex";
        $misGuifos.style.display = "block";
        $successDialogPreview.src = result;
        fetch(`${api.url}/${data.data.id}?api_key=${api.key}`)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(data);
            link = data.data.images.original.url;
            localStorage.setItem(data.data.id, data.data.images.fixed_height.url);
            misGuifos.show_items();
        })
    })

}

function cancelUpload() {
    navigate('back');
}

function copyLink() {
    const el = document.createElement('textarea');
    el.value = link;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert("La URL de tu Guifo ha sido copiada al portapapeles");
}

function downloadGIF() {
    fetch(link)
    .then(resp => resp.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'mi-guifo.gif';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
}

function closeDialog() {
    $success.style.display = 'none';
}





const $arrowBack              = document.getElementById('arrow-back');
const $confirmDialog          = document.getElementById('confirm-dialog');
const $dialogTitle            = document.getElementById('capture-dialog-title-bar');
const $dialogButtonCancel     = document.getElementById('dialog-button-cancel');
const $dialogButtonStart      = document.getElementById('dialog-button-start');
const $misGuifos              = document.getElementById('mis-guifos');
const $captura                = document.getElementById('captura');
const $capturaButtonContainer = document.getElementById('captura-button-container');
const $capturaButton          = document.getElementById('captura-button');
const $endCapturaButton       = document.getElementById('end-captura-button');
const $counter                = document.getElementById('counter');
const $previewContainer       = document.getElementById('preview-container');
const $videoContainer         = document.getElementById('camera-image');
const $video                  = document.getElementById('video-stream');
const $playButton             = document.getElementById('play-button');
const $afterCapturaButtons    = document.getElementById('after-captura-buttons');
const $repeatCapturaButton    = document.getElementById('repetir-captura');
const $uploadCapturaButton    = document.getElementById('subir-guifo');
const $previewLapseBar        = document.getElementById('preview-lapse-bar');
const $uploadScreen           = document.getElementById('upload-screen');
const $cancelButton           = document.getElementById('cancel-button');
const $success                = document.getElementById('success');
const $successDialog          = document.getElementById('success-dialog');
const $successDialogPreview   = document.getElementById('success-dialog-preview-image');
const $copyLinkButton         = document.getElementById('copy-link-button');
const $downloadGifButton      = document.getElementById('download-gif-button');
const $finishButton           = document.getElementById('finish-button');
const $canvas                 = document.getElementById('canvas');






$arrowBack.onclick            = () => navigate('back');
$dialogButtonCancel.onclick   = () => navigate('back');
$dialogButtonStart.onclick    = () => navigate('captura');
$capturaButton.onclick        = () => startRecording();
$endCapturaButton.onclick     = () => stopRecording();
$repeatCapturaButton.onclick  = () => repeatCaptura();
$uploadCapturaButton.onclick  = () => uploadGif();
$copyLinkButton.onclick       = () => copyLink();
$downloadGifButton.onclick    = () => downloadGIF();
$finishButton.onclick         = () => closeDialog();
$playButton.onclick           = () => togglePlay();
$cancelButton.onclick         = () => cancelUpload();




getTheme();
navigate('confirm-dialog');