////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// APP OBJECT MODEL ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const api = {
    url: 'https://api.giphy.com/v1/gifs',
    key: 'Zf45k9BsM730LcwnDxXFg7oesOYPcWBq'
}


const searchBar = {
    show(){
        searchBarContainer.style.display = "block";
    },
    hide(){
        searchBarContainer.style.display = "none";
    }
}

const home = {
    display() {
        homeSection.style.display = "block";
        suggested.display();
        trending.display();
    } 
}

const dropDownBox = {
    hidden: true,
    show(){
        dropdown.style.display = "flex";
        this.hidden = false;
    },
    hide(){
        dropdown.style.display = "none";  
        this.hidden = true;
    },
    toggle(){
        switch(this.hidden) {
            case true:
                this.show();
                break;

            case false:
                this.hide();
                break;
        }
    }
}

const suggested = {
    item: {},
    items: [],
    container: document.getElementById('suggested-container'),
    display(){
        this.get_items();
    },
    get_item(){
        const found = 
            fetch(`${api.url}/random?api_key=${api.key}`)
            .then((response) => {
        return response.json()
            }).then(data => {
                console.log(data.data);
                this.item = data.data;
                this.insert_item();
            })
            .catch((error) => {
                return error
            })
        return found
    },
    get_items(){
        const found = 
            fetch(`${api.url}/trending?limit=4&api_key=${api.key}`)
            .then((response) => {
               return response.json()
            }).then(data => {
                this.items = data.data;
                this.show_items();
            })
            .catch((error) => {
                return error
            })
        return found
    },
    show_items(){
        this.container.innerHTML = "";
        this.items.forEach(item => {
            this.container.insertAdjacentHTML("beforeend", `
                <div id="${item.id}" class="suggested-item">
                    <div class="title-bar gif-title flex justify-between align-center">
                        <p class="suggested-item-title"> #${item.title}</p>
                        <img src="./img/close.svg" onclick="replace_item(this)" class="cross col col-2">
                    </div>
                    <img class="img" src="${item.images.fixed_height_small.url}"/>
                    <div class="ver-mas-button" onclick="search.search_related('${item.title}')">Ver más...</div>
                </div>
            `);
        })
    },
    insert_item() {
        this.container.insertAdjacentHTML("beforeend", `
            <div id="${this.item.id}" class="suggested-item">
                <div class="title-bar gif-title flex align-center justify-between">
                    <span style="height: 15px;">#${this.item.title}</span>
                    <img src="./img/close.svg" onmouseup="replace_item(this)" class="cross">
                </div>
                <img class="img" src="${this.item.images.fixed_height_small.url}"/>
                <div class="ver-mas-button" onclick="search.search_related('${this.item.title}')">Ver más...</div>
            </div>
        `);
    }
}

const trending = {
    items: [],
    container: document.getElementById('trending-container'),
    display(){
        this.get_items();
    },
    get_items(){
        const found = 
            fetch(`${api.url}/trending?offset=4&limit=16&api_key=${api.key}`)
            .then((response) => {
               return response.json()
            }).then(data => {
                this.items = data.data;
                this.items.forEach(item => {
                    item.hashtag = item.title.replace(/ /g, ' #'); 
                })
                this.show_items();
            })
            .catch((error) => {
                return error
            })
        return found
    },
    show_items(){
        this.container.innerHTML = "";
        this.items.forEach(item => {
            this.container.insertAdjacentHTML("beforeend", `
            <div class="img-cont">
                <img class="img" src="${item.images.fixed_height_small.url}"/>
                <div class="gradient item-hashtags">#${item.hashtag}</div>
            </div>
            `);
        })
    }
}

const search = {
    term: "",
    items: [],
    container: document.getElementById('search-container'),
    setTimeoutPreview: null,
    setTimeoutPage: null,
    showPreview: false,
    pagination: {
        page:1,
        pages: null,
        page_size: 16,
        total_count: null,
        offset: 0
    },
    search() {
        if ( searchInput.value != "" ) {
            this.term = searchInput.value;
            searchTitleBar.innerHTML = `${searchInput.value} (resultados)`
            this.pagination.offset = 0;
            this.container.innerHTML = ""
            navigate("search");
        }
    },
    search_related(term) {
        searchInput.value = term;
        this.search();
    },
    preview () {
        this.showPreview = true;
        this.term = searchInput.value;
        if (this.setTimeoutPreview) {
            clearTimeout(this.setTimeoutPreview)
        }
        var v = this
        this.setTimeoutPreview = setTimeout(
            function () {
                v.get_preview_items();
            }, 300
        )
    },
    get_preview_items () {
        const found = 
        fetch(`${api.url}/search?q=${this.term}&limit=6&api_key=${api.key}`)
        .then((response) => {
            return response.json()
        })
        .then(data => {
            this.previewItems = data.data;
            this.show_preview_items();
            return data
        })
        .catch((error) => {
            return error
        })
        return found
    },
    show_preview_items () {
        extension.style.display = "block";
        extensionButCont.innerHTML = "";
        let i = 0;
        this.previewItems.forEach ( item => {
            if ( item.title != "" && item.title != " " && i < 3) {
                extensionButCont.insertAdjacentHTML("beforeend", `<div class="extension-button" onclick="search.search_related('${item.title}'); search.hide_preview();">${item.title}</div>`);
                i++;
            }
        })
        if (this.previewItems.length == 0) { this.hide_preview(); }
    },
    hide_preview () {
        extension.style.display = "none";
    },
    hide_preview_delay () {
        setTimeout(this.hide_preview, 300);
    },
    get_items() {
        const found = 
        fetch(`${api.url}/search?q=${this.term}&offset=${this.pagination.offset}&limit=${this.pagination.page_size}&api_key=${api.key}`)
        .then((response) => {
            return response.json()
        }).then(data => {
            this.items = data.data;
            this.items.forEach(item => {
                item.hashtag = item.title.replace(/ /g, ' #'); 
            })
            console.log(this.items);
            this.pagination.total_count = data.pagination.total_count;
            this.pagination.offset += this.pagination.page_size;
            this.render_hashtags();
            this.show_items();
            return data
        })
        .catch((error) => {
            return error
        })
        return found
    },
    render_hashtags () {
        hashtagContainer.innerHTML = "";
        for(let i = 0; i < 3; i++) {
            hashtagContainer.insertAdjacentHTML("beforeend", `<div class="hashtag" onclick="search.search_hashtag('${this.items[i].title}')">#${this.items[i].title}</div>`)
        }
    },
    search_hashtag(item){
        this.term = item;
        searchInput.value = item;
        this.search();
    },
    show_items(){
        this.items.forEach(item => {
            this.container.insertAdjacentHTML("beforeend", `
            <div class="img-cont">
                <img class="img" src="${item.images.fixed_height_small.url}"/>
                <div class="gradient item-hashtags">#${item.hashtag}</div>
            </div>
            `);
        })
    },
    display(){
        this.hide_preview();
        searchSection.style.display = "block";
    },
    hide_section() {
        searchSection.style.display = "none";
    },
    set_button_state () {
        if (searchInput.value == "") {
            searchButton.classList.remove("enabled");
            searchButton.classList.add("disabled");
            lupa.classList.remove('lupa-enabled');
            lupa.classList.add('lupa-disabled');
        } else {
            searchButton.classList.remove("disabled");
            searchButton.classList.add("enabled");
            lupa.classList.remove('lupa-disabled');
            lupa.classList.add('lupa-enabled');
        }
    }
}

const misGuifos = {
    items: [],
    container: document.getElementById('mis-guifos-container'),
    display () {
        misGuifosSection.style.display = "block";
        this.show_items();
    },
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





////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBAL FUNCTIONS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function hide(el) {
    el.style.display = "none";
}

function hide_all_sections() {
    hide(homeSection);
    hide(searchSection);
    hide(misGuifosSection);
}

function navigate(section) {
    hide_all_sections();
    switch(section) {
        case "home":
            searchBar.show();
            home.display();
            break;
        case "search":
            searchBar.show();
            search.display();
            break;
        case "create":
            window.location.href = 'upload.html';
        case "mis-guifos":
            searchBar.hide();
            misGuifos.display();
    } 
}

function set_theme(theme) {
    dropDownBox.toggle();
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

function get_theme(){
    let theme = sessionStorage.getItem("theme");
    if(theme){
        set_theme(theme);
    } else {
        set_theme('light');
    }
    dropDownBox.toggle();
}

function replace_item(item) {
    let parent = item.parentElement;
    parent = parent.parentElement;
    parent.style.display = "none";
    suggested.get_item();
}

function show_more(item) {
    console.log(item);
}

function retrieve_key(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        search.search();
        clearTimeout(search.setTimeoutPreview);
        search.hide_preview();
        search.showPreview = false;
    }
    if (event.key === "Escape") {
        event.preventDefault();
        search.hide_preview();
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOM BINDINGS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//SECTIONS//

const headerSection      = document.getElementById("header");
const homeSection        = document.getElementById("home");
const searchSection      = document.getElementById("search");
const createSection      = document.getElementById("create");
const misGuifosSection   = document.getElementById("mis-guifos");

//ELEMENTS//

const logo               = document.getElementById("logo");
const crearGuifosButton  = document.getElementById("crear-guifos");
const themeButton        = document.getElementById("elegir-both");
const misGuifosButton    = document.getElementById('mis-guifos-button');
const searchInput        = document.getElementById("search-input");
const searchButton       = document.getElementById('search-button');
const searchTitleBar     = document.getElementById('search-title-bar');
const lupa               = document.getElementById('lupa');
const extension          = document.getElementById('search-bar-extension');
const extensionButCont   = document.getElementById('extension-buttons-container');
const stylesheet         = document.getElementById('stylesheet');
const dropdown           = document.getElementById('dropdown');
const lightButton        = document.getElementById('theme-light-button')
const darkButton         = document.getElementById('theme-dark-button');
const hashtagContainer   = document.getElementById('hashtag-container');
const pageNumber         = document.getElementById('page-number');
const firstPageButton    = document.getElementById('first-page-button');
const searchBarContainer = document.getElementById('search-bar-container');
const createButton       = document.getElementById('crear-guifos');




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EVENT LISTENERS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.body.onscroll  = () => search.hide_preview();
logo.onclick            = () => navigate("home");
searchInput.oninput     = () => search.preview();
searchInput.onclick     = () => searchInput.select();
searchInput.onfocus     = () => search.preview();
searchInput.onblur      = () => search.hide_preview_delay();
searchButton.onclick    = () => search.search();
themeButton.onclick     = () => dropDownBox.toggle();
lightButton.onclick     = () => set_theme("light");
darkButton.onclick      = () => set_theme("dark");
searchInput.onkeydown   = (event) => {retrieve_key(event)}
searchInput.onkeyup     = () => {search.set_button_state()}
misGuifosButton.onclick = () => navigate("mis-guifos");
createButton.onclick    = () => navigate("create");



//OBSERVER////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var observer = new IntersectionObserver(function(entries) {
    if(entries[0].isIntersecting === true)
        search.get_items();
}, { threshold: [0] });

observer.observe(document.querySelector("#loader"));



// RUN ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

get_theme();
navigate("home");

