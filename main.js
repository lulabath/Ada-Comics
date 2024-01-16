/* Useful Features */
const $ = (selector) => document.querySelector(selector)

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


const printDataMarvel = async (recurso, data) => {
    if (recurso === 'characters') {
        $("#count-results").innerHTML = `Resultados : ${data.length}`;
        $("#results").innerHTML = ``;
        for (const character of data) {
            $("#results").innerHTML += `
        <div class="flex flex-col bg-black bg-clip-border border border-zinc-400 border-solid text-white font-semibold w-40 h-64 m-4">
            <div class="h-2/3">
                <img class="border-b-4 border-red-600 h-full w-full" src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="img-character">
            </div>
            <div class="text-center">
                <h1 class="text-white text-sm">${character.name}</h1>
            </div>
        </div>
        `
        console.log(character.name);
        }
    }
    else if (recurso === 'comics') {
        $("#results").innerHTML = ``;
        for (const comic of data) {
            $("#results").innerHTML += `
            <div class="flex flex-col bg-black bg-clip-border border border-zinc-400 border-solid text-white font-semibold w-48 h-64 m-4">
                <div class="h-2/3">
                    <img class="border-b-4 border-red-600 h-full w-full" src="${comic.thumbnail.path}.${comic.thumbnail.extension}" alt="img-comic">
                </div>
                <div class="text-center">
                    <h1 class="text-white text-sm">${comic.title}</h1>
                </div>
            </div>
            `
        }
    }
};



/* filters */
// $("#type-select").addEventListener("change", () => {
//     if ($("#type-select").value === 'comics') {
//         printDataMarvel('comics');
//     }
//     else if ($("#type-select").value === 'characters') {
//         printDataMarvel('characters');
//     }
// });

// $("#search-btn").addEventListener("click", ()=>{
//     const val = $("#type-select").value
//     printDataMarvel(val)
// })

// $("#sort-select").addEventListener("change", async () => {
//     if (marvelData) {
//         switch ($("#sort-select").value) {
//             case "newer":
//                 marvelData.sort((a, b) => new Date(b.dates.date) - new Date(a.dates.date));
//                 break
//             case "older":
//                 marvelData.sort((a, b) => new Date(a.dates.date) - new Date(b.dates.date));
//                 break
//             case "a-to-z":
//                 marvelData.sort((a, b) => a.title.localeCompare(b.title));
//                 break
//             case "z-to-a":
//                 marvelData.sort((b, a) => b.title.localeCompare(a.title));
//                 break
//         }
//     await printDataMarvel($("#type-select").value);
//     }
// });


/* PAGINATION */
const pagination = async (promesa) => {
    const result = await promesa;
    const getTotalPages = () => Math.ceil(result.data.total / itemsPerPage); 

    const updatePageInfo = () => {
        $("#current-page").textContent = `Pag ${page} de ${getTotalPages()}`;
    };

    const updateResults = () => {
        printDataMarvel($("#type-select").value, result.data.results);
    };

    $("#first-page").addEventListener("click", async () => {
        if (page > 1) {
            page = 1;
            offset = (page -1) * itemsPerPage;
            const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
            marvelData = newData;
            updateResults();
            updatePageInfo();
        }
        console.log('soy first');
    });

    $("#previous-page").addEventListener("click", async () => {
        if (page > 1) {
            page--;
            offset = (page - 1) * itemsPerPage;
            if(offset < 0) offset = 0;
            const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
            marvelData = newData;
            updateResults();
            updatePageInfo();
        }
        console.log('soy prev');
    });

    $("#next-page").addEventListener("click", async () => {
        const lastPage = getTotalPages();
        if (page < lastPage) {
            page++;
            offset = (page - 1) * itemsPerPage;
            const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
            marvelData = newData;
            updateResults();
            updatePageInfo();
        }
        console.log('soy next');
    });

    $("#last-page").addEventListener("click", async () => {
        const lastPage = getTotalPages();
        if (page < lastPage) {
            page = lastPage;
            offset = (page - 1) * itemsPerPage;
            const newData = await getMarvel($("#type-select").value, offset, itemsPerPage);
            marvelData = newData;
            updateResults();
            updatePageInfo();
        }
        console.log('soy last');
    });

    updatePageInfo();
    updateResults();
    
};

const initializeApp = async () => {
    try {
        const response = await getMarvel('comics', offset, itemsPerPage);
        marvelData = response || {};
        pagination(Promise.resolve());
    } catch (error) {
        console.error("Error fetching Marvel data:", error);
    }
};
window.addEventListener("load", initializeApp)