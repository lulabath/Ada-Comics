/* Useful Features */
const $ = (selector) => document.querySelector(selector)
const $$ = (selector) => document.querySelectorAll(selector)

const cleanUrl = `http://gateway.marvel.com/v1/public/`
let ts = `ts=1`
const publicKey = "&apikey=6acd8c25d84392110b6f02e68799aac1"
const hash = "&hash=bf65d7f2a26f6d85116463c0b81b4273"

let marvelData;
let page = 1;
let itemsPerPage = 20;
let set = 1;

/* llamado a la Api */
const getMarvel = async (recurso, set, itemsPerPage) => {
    let url = `${cleanUrl}${recurso}?${ts}${publicKey}${hash}&offset=${set}&limit=${itemsPerPage}`
    const response = await fetch(url)
    const getData = await response.json();
    console.log("ahora me podes manipular", getData.data.results)
    return getData.data.results;
}


const printDataMarvel = async (recurso) => {
    if (recurso === 'characters') {
        $("#count-results").innerHTML = `Resultados : ${marvelData.length}`
        $("#results").innerHTML = ``;
        for (const data of marvelData) {
            $("#results").innerHTML += `
        <div class="flex flex-col bg-black bg-clip-border border border-zinc-400 border-solid text-white font-semibold w-40 h-64 m-4">
            <div class="h-2/3">
                <img class="border-b-4 border-red-600 h-full w-full" src="${data.thumbnail.path}.${data.thumbnail.extension}" alt="img-character">
            </div>
            <div class="text-center">
                <h1 class="text-white text-sm">${data.name}</h1>
            </div>
        </div>
        `
        console.log(data.name);
        }
    }
    else if (recurso === 'comics') {
        $("#results").innerHTML = ``;
        for (const data of marvelData) {
            $("#results").innerHTML += `
            <div class="flex flex-col bg-black bg-clip-border border border-zinc-400 border-solid text-white font-semibold w-48 h-64 m-4">
                <div class="h-2/3">
                    <img class="border-b-4 border-red-600 h-full w-full" src="${data.thumbnail.path}.${data.thumbnail.extension}" alt="img-comic">
                </div>
                <div class="text-center">
                    <h1 class="text-white text-sm">${data.title}</h1>
                </div>
            </div>
            `
        }
    }
}



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

    const getTotalPages = () => Math.ceil(marvelData.length / itemsPerPage); 

    const updatePageInfo = () => {
        $("#current-page").textContent = `Page ${page} of ${getTotalPages()}`;
    };

    const updateResults = () => {
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const slicedData = marvelData.slice(startIndex, endIndex);
        printDataMarvel($("#type-select").value, slicedData);
    };

    $("#first-page").addEventListener("click", async () => {
        if (page > 1) {
            page = 1;
            set = (page -1) * itemsPerPage;
            await getMarvel($("#type-select").value, set, itemsPerPage);
            updateResults();
            updatePageInfo();
        }
        console.log('soy first');
    });

    $("#previous-page").addEventListener("click", async () => {
        if (page > 1) {
            page--;
            set = (page - 1) * itemsPerPage;
            if(set < 0) set = 0;
            await getMarvel($("#type-select").value, set, itemsPerPage);
            updateResults();
            updatePageInfo();
        }
        console.log('soy prev');
    });

    $("#next-page").addEventListener("click", async () => {
        const lastPage = getTotalPages();
        if (page < lastPage) {
            page++;
            set = (page - 1) * itemsPerPage;
            await getMarvel($("#type-select").value, set, itemsPerPage);
            updateResults();
            updatePageInfo();
        }
        console.log('soy next');
    });

    $("#last-page").addEventListener("click", async () => {
        const lastPage = getTotalPages();
        if (page < lastPage) {
            page = lastPage;
            set = (page - 1) * itemsPerPage;
            await getMarvel($("#type-select").value, set, itemsPerPage);
            updateResults();
            updatePageInfo();
        }
        console.log('soy last');
    });

    updatePageInfo();
    updateResults();
    
};

const initializeApp = async () => {
    marvelData = await getMarvel('comics', set, itemsPerPage);
    pagination(Promise.resolve());
};
window.addEventListener("load", initializeApp)