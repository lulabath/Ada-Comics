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
   // console.log("ahora me podes manipular", getData.data.results)
    return getData;
};


const printDataMarvel = (recurso, data) => {
    $("#count-results").innerHTML = `Resultados : ${data.length}`;
    $("#results").innerHTML = ``;
  
    for (const item of data) {
      let thumbnail = item.thumbnail.path + "." + item.thumbnail.extension; /* NO FUNCIONAN LOS FOCUS*/
      $("#results").innerHTML += `
        <div tabindex="0" class="flex flex-col font-semibold w-56 h-100 m-2 p-2">
            <div class="h-2/3  :focus:translate-y-[5]">                                        
                <img class="shadow-lg shadow-red-600/50 h-full w-full" src="${thumbnail}" alt="img-${recurso}">
            </div>
            <div class="text-center mt-6 ">
                <h1 class="text-sm :focus:text-red-600">${recurso === 'characters' ? item.name : item.title}</h1>
            </div>
        </div>
        `;
      //console.log(item);
    }
  };

/* PAGINATION */

const updatePageInfo = () => {
    $("#current-page").textContent = `pag ${page}`;
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
            (item.name || '').toLowerCase().includes(searchInput.toLowerCase()) || (item.title || '').toLowerCase.includes(searchInput.toLowerCase())
        );

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
    $("#page-body").classList.toggle("bg-black");
    $("#page-body").classList.toggle("bg-white");
    $("#page-body").classList.toggle("text-white");
    $("#page-body").classList.toggle("text-black");

    $("#sun-light").classList.toggle("hidden");
    $("#moon-dark").classList.toggle("hidden");
    $("#results-container").classList.toggle("text-white");
    $("#results-container").classList.toggle("text-black");
};
$("#sun-light").addEventListener("click", () => {
    toggleDarkMode();
    $("#sun-light").classList.add("hidden");
    $("#moon-dark").classList.remove("hidden");
});

$("#moon-dark").addEventListener("click", () => {
    toggleDarkMode();
    $("#moon-dark").classList.add("hidden");
    $("#sun-light").classList.remove("hidden");
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