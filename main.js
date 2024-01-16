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

/* llamado a la Api */
const getMarvel = async (recurso, offset, itemsPerPage) => {
    let url = `${cleanUrl}${recurso}?${ts}${publicKey}${hash}&offset=${offset}&limit=${itemsPerPage}`;
    const response = await fetch(url);
    const getData = await response.json();
    console.log("ahora me podes manipular", getData.data.results)
    return getData;
};


const printDataMarvel = (recurso, data) => {

    $("#count-results").innerHTML = `Resultados : ${data.length}`;
    $("#results").innerHTML = ``;

    for (const item of data) {
        let thumbnail = item.thumbnail.path + "." + item.thumbnail.extension;
        $("#results").innerHTML += `
        <div class="flex flex-col bg-black text-white font-semibold w-40 h-64 m-4">
            <div class="h-2/3">
                <img class="border-b-4 border-red-600 h-full w-full" src="${thumbnail}" alt="img-${recurso}">
            </div>
            <div class="text-center mt-2">
                <h1 class="text-white text-sm">${recurso === 'characters' ? item.name : item.title}</h1>
            </div>
        </div>
        `
        console.log(item);
    }
};

/* PAGINATION */

const updatePageInfo = () => {
    $("#current-page").textContent = `Pag ${page}`;
};

/* SEARCH EVENTS*/
$("#search-btn").addEventListener("click", async () => {
    const type = $("#type-select").value;
    const sort = $("#sort-select").value;
    const searchInput = $("#input-search").value;

    offset = 0; // lo vuelvo a reiniciar

    try {
        const response = await getMarvel(type, offset, itemsPerPage);
        marvelData = response.data;
        const filteredData = marvelData.results.filter(item =>
            item.name.includes(searchInput) ||
            item.title.includes(searchInput)
        );

        switch (sort) {
            case "newer":
                filteredData.sort((a, b) => new Date(b.dates.date) - new Date(a.dates.date));
                break;
            case "older":
                filteredData.sort((a, b) => new Date(a.dates.date) - new Date(b.dates.date));
                break;
            case "a-to-z":
                filteredData.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "z-to-a":
                filteredData.sort((b, a) => b.title.localeCompare(a.title));
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


/* INITIALIZE APP */
window.addEventListener("load", async () => {
    try {
        const response = await getMarvel('comics', offset, itemsPerPage);
        marvelData = response.data;
        printDataMarvel('comics', marvelData.results);
        updatePageInfo();
    } catch (error) {
        console.error("Error fetching Marvel data:", error);
    }
});