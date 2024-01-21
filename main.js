/* Useful Features */
const $ = (selector) => document.querySelector(selector);

const cleanUrl = `http://gateway.marvel.com/v1/public/`
let ts = `ts=1`
const publicKey = "&apikey=6acd8c25d84392110b6f02e68799aac1"
const hash = "&hash=bf65d7f2a26f6d85116463c0b81b4273"

let marvelData;
let page = 1;
let itemsPerPage = 20;
let offset = 0;



/* construyo la URL */
const buildUrlMarvel = (recurso) => {
    return `${cleanUrl}${recurso}?${ts}${publicKey}${hash}`;
};

/* construyo los searchParams */
const buildSearchParams = (offset, itemsPerPage) => {
    return `&offset=${offset}&limit=${itemsPerPage}`;
};

/* llamado a la Api */
const fetchMarvel = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    console.log("data=", data);
    return data;

};

const getMarvel = async (recurso, offset, itemsPerPage) => {
    const url = buildUrlMarvel(recurso) + buildSearchParams(offset, itemsPerPage);
    return await fetchMarvel(url);
};


const printDataMarvel = (recurso, data) => {
    $("#results").innerHTML = ``;

    for (const item of data) {
        let thumbnail = item.thumbnail.path + "." + item.thumbnail.extension; /* NO FUNCIONAN LOS FOCUS*/
        $("#results").innerHTML += `
        <div tabindex="0" class="flex flex-col font-semibold w-56 h-100 m-2 p-2" data-id="${item.id}">
            <div class="h-2/3  :focus:translate-y-[5]">
                <img class="shadow-lg shadow-zinc-500/70 h-full w-full" src="${thumbnail}" alt="img-${recurso}">
            </div>
            <div class="text-center mt-6 ">
                <h1 class="text-sm :focus:text-red-600">${recurso === 'characters' ? item.name : item.title}</h1>
            </div>
        </div>
        `;
        //console.log(item);
    }
};

const showComicDetails = (comic) => {
    //actualizo los elementos
    $("#comic-thumbnail").src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    $("#comic-thumbnail").classList.add("w-52", "h-64");
    $("#comic-title").textContent = comic.title;
    $("#comic-date").textContent = `Fecha de publicación: ${comic.dates[0].date}`;
    $("#comic-description").textContent = comic.description || "Sin descripción disponible";

    getComicDetails(comic.id)
        .then((response) => {
            const characters = response.data.results[0].characters.items;
            $("#comic-characters").innerHTML = "<p class='text-xl font-bold mb-2'>Personajes:</p>";
            characters.forEach((character) => {
                $("#comic-characters").innerHTML += `<p>${character.name}</p>` || `<p>Sin personajes</p>`;
            });
        });
    //manejo las vistas
    $("#results-container").classList.add("hidden");
    $("#comic-details").classList.remove("hidden");
};

const getComicDetails = async (comicId) => {
    try {

        const url = buildUrlMarvel(`comics/${comicId}`);

        return await fetchMarvel(url);
    }
    catch (error) {
        console.error("Error fetching comic details:", error);
        throw error;
    }
};

//evento click del comic 
$("#results").addEventListener("click", (event) => {
    console.log("estoy escuchando");
    const comicElement = event.target.closest(".flex");
    if (comicElement) {
        const comicId = comicElement.getAttribute("data-id");
        const selectedComic = marvelData.results.find((comic) => comic.id == comicId);
        if (selectedComic) {
            showComicDetails(selectedComic);
        }
    }
});

/* PAGINATION */
const updatePageInfo = () => {
    $("#current-page").textContent = `pag ${page}`;
};

/* SEARCH EVENTS*/
$("#search-btn").addEventListener("click", async () => {
    $("#comic-details").classList.add('hidden');
    $("#results").classList.remove('hidden');

    const type = $("#type-select").value;
    const sort = $("#sort-select").value;
    const searchInput = $("#input-search").value;

    offset = 0; // lo vuelvo a reiniciar

    try {
        const url = buildUrlMarvel(type) + buildSearchParams(offset, itemsPerPage);
        const response = await fetchMarvel(url);
        console.log("atos de la Api", response);

        marvelData = response.data;


        const filteredData = marvelData.results.filter(item =>
            (item.name || '').toLowerCase().includes(searchInput.toLowerCase()) || (item.title || '').toLowerCase().includes(searchInput.toLowerCase())
        );
        console.log("datos filtrados", filteredData);

        $("#count-results").innerHTML = `Resultados : ${filteredData.length}`
        switch (sort) {
            case "newer":
                filteredData.sort((a, b) => new Date(b.dates.date) - new Date(a.dates.date));
                break;
            case "older":
                filteredData.sort((a, b) => new Date(a.dates.date) - new Date(b.dates.date));
                break;
            case "a-to-z":
                filteredData.sort((a, b) => {
                    const titleA = a.title || a.name || '';
                    const titleB = b.title || b.name || '';
                    return titleA.localeCompare(titleB)
                });

                break;
            case "z-to-a":
                filteredData.sort((a, b) => {
                    const titleA = a.title || a.name || '';
                    const titleB = b.title || b.name || '';
                    return titleB.localeCompare(titleA)
                });
                break;
        }

        printDataMarvel(type, filteredData);
        updatePageInfo();

    } catch (error) {
        console.log("erroe fetching", error)
    }
});

/* PAGINATION EVENTS */
$("#first-page").addEventListener("click", async () => {
    page = 1;
    offset = (page - 1) * itemsPerPage;
    const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
    marvelData = newData.data;
    printDataMarvel($("#type-select").value, marvelData.results);
    updatePageInfo();
    console.log('soy first');
});

$("#previous-page").addEventListener("click", async () => {
    if (page > 1) {
        page--;
        offset = (page - 1) * itemsPerPage;
        const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
        marvelData = newData.data;
        printDataMarvel($("#type-select").value, marvelData.results);
        updatePageInfo();
    }
    console.log('soy prev');
});

$("#next-page").addEventListener("click", async () => {
    const lastPage = Math.ceil(marvelData.total / itemsPerPage);
    if (page < lastPage) {
        page++;
        offset = (page - 1) * itemsPerPage;
        const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
        marvelData = newData.data;
        printDataMarvel($("#type-select").value, marvelData.results);
        updatePageInfo();
    }
    console.log('soy next');
});

$("#last-page").addEventListener("click", async () => {
    const lastPage = Math.ceil(marvelData.total / itemsPerPage);
    console.log(marvelData.total)
    if (page < lastPage) {
        page = lastPage;
        offset = (page - 1) * itemsPerPage;
        const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
        marvelData = newData.data;
        printDataMarvel($("#type-select").value, marvelData.results);
        updatePageInfo();
    }
    console.log('soy last');
});

/* change mode */
const toggleDarkMode = () => {
    const elementsToToggle = ["#page-body", "#results-container", "#search-btn", "#type-select", "#sort-select", "#div-input-text", "#sun-light", "#moon-dark"];

    $("#page-body").classList.toggle("bg-black");
    $("#page-body").classList.toggle("bg-white");


    elementsToToggle.forEach(element => {
        document.querySelector(element).classList.toggle("text-black");
        document.querySelector(element).classList.toggle("text-white");
    });

    const bordersToToggle = ["#search-btn", "#type-select", "#sort-select", "#div-input-text"];

    bordersToToggle.forEach(element => {
        document.querySelector(element).classList.toggle("border-white");
        document.querySelector(element).classList.toggle("border-black");
    });

    $("#sun-light").classList.toggle("hidden");
    $("#moon-dark").classList.toggle("hidden");
};

$("#sun-light").addEventListener("click", () => {
    toggleDarkMode();
});

$("#moon-dark").addEventListener("click", () => {
    toggleDarkMode();
});

$("#back-btn").addEventListener("click", () => {
    console.log("funciona el btn back");
    $("#results-container").classList.remove("hidden");
    $("#comic-details").classList.add("hidden");
});

/* INITIALIZE APP */
window.addEventListener("load", async () => {
    try {
        const url = buildUrlMarvel('comics') + buildSearchParams(offset, itemsPerPage);
        const response = await fetchMarvel(url);
        marvelData = response.data;
        printDataMarvel('comics', marvelData.results);
        updatePageInfo();
    } catch (error) {
        console.error("Error fetching Marvel data:", error);
    }
});
