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
const buildUrlMarvel = (recurso, orderBy, startsWith) => {
    let url = `${cleanUrl}${recurso}?${ts}${publicKey}${hash}`;
    if (startsWith) {
        url += (recurso === 'characters') ? `&nameStartsWith=${startsWith}` : `&titleStartsWith=${startsWith}`;
    }
    if (orderBy) {
        url += `&orderBy=${orderBy}`;
    }
    return url;
};

/* construyo los searchParams */
const buildSearchParams = (offset, itemsPerPage) => {
    return `&offset=${offset}&limit=${itemsPerPage}`;
};

/* llamado a la Api */
const fetchMarvel = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    //console.log("data=", data);
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


$("#results").addEventListener("click", async (event) => {
    const element = event.target.closest(".flex");
    //console.log("soy el elemento :", element);
    if (element) {
        const id = element.getAttribute("data-id");
        const selectedData = marvelData.results.find((data) => data.id == id);
        //console.log("selected comic dada", selectedData);
        if (selectedData) {
            if (selectedData.resourceURI.includes('characters')) {
                showCharacterDetails(id);
                //console.log("soy el id del elemento:", id);
            } else {
                try {
                    await showComicDetails(selectedData);
                    //console.log("soy el id del elemento:", id);
                } catch (error) {
                    console.error("error cuando muestro detalle de comic", error);
                }
            }

        }
    }

});


const showComicDetails = async (comic) => {
    if (!comic || !comic.thumbnail || !comic.dates || !comic.dates[0].date) {
        console.error('Invalid comic details:', comic);
        return;
    }

    const dateString = comic.dates[0].date;
    //console.log(comic.dates[0].date)

    const year = dateString.slice(0, 4);
    const month = dateString.slice(5, 7);
    const day = dateString.slice(8, 10);

    const formattedDate = `${day}-${month}-${year}`;

    const creatorsNames = comic.creators.items.map(creator => creator.name).join(',');

    //actualizo los elementos
    $("#comic-thumbnail").src = `${comic.thumbnail.path}.${comic.thumbnail.extension}`;
    $("#comic-thumbnail").classList.add("w-52", "h-64");
    $("#comic-title").textContent = comic.title;
    $("#comic-date").textContent = formattedDate;
    $("#comic-description").textContent = comic.description || "";
    $("#comic-creators").textContent = creatorsNames;
    //console.log(creatorsNames);

    try {
        await getComicDetails(comic.id);
        getComicDetails(comic.id)
            .then(async (response) => {
                const characters = response.data.results[0].characters.items;
                $("#comic-characters").innerHTML = '';
                if (characters.length >= 1) {
                    for (const character of characters) {
                        const characterDetails = await getCharacterDetails(character.resourceURI.split('/').pop());
                        const characterThumbnail = characterDetails.data.results[0].thumbnail;

                        $("#comic-characters").innerHTML += `
                   <div class="character-card bg-neutral-950 w-32 h-64 m-6 text-center" data-id="${characterDetails.data.results[0].id}">
                     <img class="h-48 border-b-4 border-red-600" src="${characterThumbnail.path}.${characterThumbnail.extension}" alt="${characterDetails.data.results[0].name}">
                     <p class="my-6 text-white text-sm">${characterDetails.data.results[0].name}</p>
                   </div>`
                    }

                } else if (characters.length = 0) {
                    $("#comic-characters").innerHTML = "<p>Sin personajes</p>";
                }

                //agrego el atributo data id con la clase charactercard
                document.querySelectorAll('.character-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const characterId = card.getAttribute('data-id');
                        showCharacterDetails(characterId);
                    });
                });
            });
    } catch (error) {
        console.error("error al obtener los detalles del comic", error);
        throw error;
    }

    //manejo las vistas
    $("#results-container").classList.add("hidden");
    $("#character-details").classList.add("hidden");
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

const getCharacterComics = async (characterId) => {
    try {
        const url = buildUrlMarvel(`characters/${characterId}/comics`)
        return await fetchMarvel(url);
    } catch (error) {
        console.error("Error fetching character comics:", error);
    } throw error;
};

const showCharacterDetails = (characterId) => {
    getCharacterDetails(characterId)
        .then(async (character) => {
            if (!character || !character.data.results[0].thumbnail) {
                console.error('characterDetails invalidooo', character)
                return;
            }

            $("#character-thumbnail").src = `${character.data.results[0].thumbnail.path}.${character.data.results[0].thumbnail.extension}`;
            $("#character-thumbnail").classList.add("w-52", "h-64");
            $("#character-name").textContent = character.data.results[0].name;
            $("#character-description").textContent = character.data.results[0].description || "Sin descripción disponible";

            //muestro tarj

            getCharacterComics(characterId)
                .then(async (response) => {
                    const comics = response.data.results;
                    $("#character-comics").innerHTML = '';
                    for (const comic of comics) {
                        const comicThumbnail = comic.thumbnail;
                        $("#character-comics").innerHTML += `
                    <div class="comic-card w-32 h-64 m-6" data-id="${comic.id}">
                        <img class="w-full h-48" src="${comicThumbnail.path}.${comicThumbnail.extension}" alt="${comic.title}">
                        <p class="text-xs mb-4">${comic.title}</p>
                    </div>`;
                    }
                    // <p>${comic.title}</p>
                    //agrego el atributo por la clase comic-card
                    document.querySelectorAll('.comic-card').forEach(card => {
                        card.addEventListener('click', () => {
                            const comicId = card.getAttribute('data-id');
                            const selectedComic = comics.find(c => c.id == comicId); // así puedo buscar el comic correspondiente en el array 
                            if(selectedComic){
                                showComicDetails(selectedComic);
                            }else {
                                console.error('Comic not found');
                            }
                            
                        });
                    });
                });

        })
        .catch(error => {
            console.error("Error characterDetails con fetching:", error);
        });

    //muestro el contenedor de personaje y oculto los resultados listados
    $("#character-details").classList.remove("hidden");
    $("#results-container").classList.add("hidden");
    $("#comic-details").classList.add("hidden");
};

const getCharacterDetails = async (characterId) => {
    try {
        const url = buildUrlMarvel(`characters/${characterId}`);
        const response = await fetchMarvel(url);
        //console.log("response de characterDetails:", response);
        return response;
    } catch (error) {
        console.error("error character details fetching: ", error);
        throw error;
    }
};

//evento para volver a listar los resultados con back to results btn
$("#back-to-results").addEventListener("click", () => {
    $("#results-container").classList.remove("hidden");
    $("#character-details").classList.add("hidden");
})

$("#back-btn").addEventListener("click", () => {
    //console.log("funciona el btn back");
    $("#results-container").classList.remove("hidden");
    $("#comic-details").classList.add("hidden");
});

/* PAGINATION */
const updatePageInfo = () => {
    $("#current-page").textContent = `pag ${page}`;
};

const fetchMarvelSearchConut = async (type, orderBy, searchInput, startsWith) => {
    let url;
    if (type === 'characters') {
        url = buildUrlMarvel(type, orderBy, startsWith);
    } else {
        url = buildUrlMarvel(type, orderBy, startsWith);
    }
    try {
        const response = await fetchMarvel(url);
        return response;
    } catch (error) {
        console.error("Error fetching Marvel search count:", error);
        throw error;
    }
};

/* SEARCH EVENTS*/
$("#search-btn").addEventListener("click", async () => {
    $("#results-container").classList.remove("hidden");
    $("#comic-details").classList.add("hidden");
    $("#character-details").classList.add('hidden');

    const type = $("#type-select").value;
    const sort = $("#sort-select").value;
    const searchInput = $("#input-search").value;
    let orderBy = '';
    let startsWith = '';

    offset = 0;

    try {
        if (type === 'characters') {
            orderBy = (sort === "a-to-z") ? 'name' : (sort === "z-to-a") ? '-name' : '';
            startsWith = (searchInput.length > 0) ? searchInput.charAt(0) : '';
        } else if (type === 'comics') {
            orderBy = (sort === "a-to-z") ? 'title' : (sort === "z-to-a") ? '-title' : (sort === 'newer') ? '-modified' : (sort === 'older') ? 'modified' : '';
            startsWith = (searchInput.length > 0) ? searchInput.charAt(0) : '';
        }

        const url = buildUrlMarvel(type, orderBy, startsWith) + buildSearchParams(offset, itemsPerPage);
        const response = await fetchMarvel(url);
        marvelData = response.data;

        let filteredData = marvelData.results;
        if (searchInput.length > 0) {
            const totalCount = await fetchMarvelSearchConut(type, orderBy, searchInput, startsWith);
            $("#count-results").textContent = `Resultados: ${totalCount.data.total}`;
            filteredData = marvelData.results.filter(item =>
                (item.name || '').toLowerCase().includes(searchInput.toLowerCase()) || (item.title || '').toLowerCase().includes(searchInput.toLowerCase())
            );
        } else {
            $("#count-results").textContent = `Resultados: ${marvelData.total}`;
        }

        printDataMarvel(type, filteredData);
        updatePageInfo(filteredData);

    } catch (error) {
        console.error("error fetching", error)
    }
});

$("#first-page").addEventListener("click", async () => {
    page = 1;
    offset = (page - 1) * itemsPerPage;
    const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
    marvelData = newData.data;
    printDataMarvel($("#type-select").value, marvelData.results);
    updatePageInfo();
    //console.log('soy first');
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
    //console.log('soy prev');
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
    //console.log('soy next');
});

$("#last-page").addEventListener("click", async () => {
    const lastPage = Math.ceil(marvelData.total / itemsPerPage);
    //console.log(marvelData.total)
    if (page < lastPage) {
        page = lastPage;
        offset = (page - 1) * itemsPerPage;
        const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
        marvelData = newData.data;
        printDataMarvel($("#type-select").value, marvelData.results);
        updatePageInfo();
    }
    //console.log('soy last');
});

/* change mode */
const toggleDarkMode = () => {

    const elementsToToggle = ["#page-body", "#search-btn", "#footer", "#pagination"];
    elementsToToggle.forEach(element => {
        document.querySelector(element).classList.toggle("text-black");
        document.querySelector(element).classList.toggle("text-white");
    });

    const bgToToggle = ["#page-body", "#search-btn", "#footer", "#first-page", "#previous-page", "#current-page", "#next-page", "#last-page"];
    bgToToggle.forEach(element => {
        document.querySelector(element).classList.toggle("bg-black");
        document.querySelector(element).classList.toggle("bg-white");
    });

    const bordersToToggle = ["#div-input-text"];
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
