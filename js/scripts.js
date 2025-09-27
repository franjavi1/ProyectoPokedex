const pokemonContainer = document.getElementById("pokemonResult"); // contenedor principal
const loading = document.getElementById("loading");
const searchInput = document.getElementById("searchPokemon");

// Mapa de tipos en español -> inglés (para la API)
const tipoMap = {
    fuego: "fire",
    agua: "water",
    planta: "grass",
    electrico: "electric",
    hielo: "ice",
    lucha: "fighting",
    veneno: "poison",
    tierra: "ground",
    volador: "flying",
    psiquico: "psychic",
    bicho: "bug",
    roca: "rock",
    fantasma: "ghost",
    dragon: "dragon",
    siniestro: "dark",
    acero: "steel",
    hada: "fairy"
};

// ===== Mostrar todos los Pokémon al cargar =====
document.addEventListener("DOMContentLoaded", () => {
    mostrarPokemones(151);
});

// ===== Función para mostrar varios Pokémon =====
async function mostrarPokemones(cantidad) {
    const inicio = Date.now();
    try {
        loading.classList.remove("d-none");
        pokemonContainer.classList.add("d-none");

        let row = pokemonContainer.querySelector(".row");
        if (!row) {
            row = document.createElement("div");
            row.className = "row g-3";
            pokemonContainer.appendChild(row);
        }
        row.innerHTML = "";

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${cantidad}`);
        const data = await res.json();

        for (let poke of data.results) {
            const resPoke = await fetch(poke.url);
            const dataPoke = await resPoke.json();

            const card = `
<div class="col-6 col-sm-4 col-md-3 col-lg-2 d-flex justify-content-center mb-2">
    <div class="card pokemon-figurita shadow-sm text-center bg-light" 
         style="width: 160px; border-radius: 14px;">
        <img src="${dataPoke.sprites.other['official-artwork'].front_default}" 
             class="card-img-top" 
             alt="${dataPoke.name}" 
             style="max-height: 120px; object-fit: contain; margin: 0 auto;">
        <div class="card-body p-1">
            <h6 class="card-title text-capitalize fw-bold mb-1" style="font-size: 0.9rem;">${dataPoke.name}</h6>
            <p class="card-text small mb-0">ID: #${dataPoke.id}</p>
            <p class="card-text small mb-0">Altura: ${dataPoke.height / 10} m</p>
            <p class="card-text small mb-1">Peso: ${dataPoke.weight / 10} kg</p>
            <div>
                ${dataPoke.types.map(t => 
                    `<span class="badge bg-primary me-1" style="font-size: 0.65rem; padding: 0.15rem 0.3rem;">${t.type.name}</span>`
                ).join("")}
            </div>
        </div>
    </div>
</div>



            `;
            row.innerHTML += card;
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '¡Oops!',
            text: 'Error al cargar los Pokémon',
            confirmButtonColor: '#ff5722'
        });
        console.error(error);
    } finally {
        const duracion = Date.now() - inicio;
        const tiempoMinimo = 1000; // 1 segundo mínimo
        const retraso = Math.max(0, tiempoMinimo - duracion);

        setTimeout(() => {
            loading.classList.add("d-none");
            pokemonContainer.classList.remove("d-none");
        }, retraso);
    }
}

// ===== Función para buscar un Pokémon por nombre =====
async function buscarPokemon(nombre) {
    if (!nombre) {
        mostrarPokemones(151);
        return;
    }

    const inicio = Date.now();
    loading.classList.remove("d-none");
    pokemonContainer.classList.add("d-none"); // ocultar contenedor mientras carga

    try {
        let row = pokemonContainer.querySelector(".row");
        if (!row) {
            row = document.createElement("div");
            row.className = "row g-3";
            pokemonContainer.appendChild(row);
        }
        row.innerHTML = "";

        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${nombre.toLowerCase()}`);
        if (!res.ok) throw new Error("No encontrado");
        const dataPoke = await res.json();

        const card = `
            <div class="col-12 d-flex flex-column align-items-center">
                <div class="card pokemon-card-grande shadow-lg text-center mb-3 bg-light">
                    <img src="${dataPoke.sprites.other['official-artwork'].front_default}" 
                         class="card-img-top p-4" alt="${dataPoke.name}">
                    <div class="card-body">
                        <h3 class="card-title text-capitalize fw-bold">${dataPoke.name}</h3>
                        <p class="card-text mb-1">ID: #${dataPoke.id}</p>
                        <p class="card-text mb-1">Altura: ${dataPoke.height / 10} m</p>
                        <p class="card-text mb-1">Peso: ${dataPoke.weight / 10} kg</p>
                        <div>
                            ${dataPoke.types.map(t => `<span class="badge bg-primary me-1">${t.type.name}</span>`).join("")}
                        </div>
                    </div>
                </div>
                <button id="btnVolver" class="btn btn-warning mb-4">🔙 Volver a todos</button>
            </div>
        `;

        // ⏳ Mostrar card solo después del spinner
        const duracion = Date.now() - inicio;
        const tiempoMinimo = 1000;
        const retraso = Math.max(0, tiempoMinimo - duracion);

        setTimeout(() => {
            row.innerHTML = card; // recién acá aparece
            loading.classList.add("d-none");
            pokemonContainer.classList.remove("d-none");

            document.getElementById("btnVolver").addEventListener("click", () => {
                searchInput.value = "";
                mostrarPokemones(151);
            });
        }, retraso);

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '¡Oops!',
            text: 'Pokémon no encontrado',
            confirmButtonColor: '#ff5722'
        }).then(() => {
            searchInput.value = "";
            mostrarPokemones(151);
        });
    }
}


// ===== Buscar al presionar Enter =====
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        buscarPokemon(searchInput.value.trim());
    }
});

// ===== Filtros por tipo =====
const tipoButtons = document.querySelectorAll('input[name="tipo"]');

tipoButtons.forEach(btn => {
    btn.addEventListener("change", () => {
        const tipo = btn.id;
        if (tipo === "todos") {
            mostrarPokemones(151);
        } else {
            mostrarPorTipo(tipo);
        }
    });
});

// ===== Función para mostrar Pokémon por tipo =====
async function mostrarPorTipo(tipo) {
    const inicio = Date.now();
    try {
        loading.classList.remove("d-none");
        pokemonContainer.classList.add("d-none");

        let row = pokemonContainer.querySelector(".row");
        if (!row) {
            row = document.createElement("div");
            row.className = "row g-3";
            pokemonContainer.appendChild(row);
        }
        row.innerHTML = "";

        const tipoApi = tipoMap[tipo];
        const res = await fetch(`https://pokeapi.co/api/v2/type/${tipoApi}`);
        const data = await res.json();

        for (let poke of data.pokemon) {
            const resPoke = await fetch(poke.pokemon.url);
            const dataPoke = await resPoke.json();

            const card = `
       <div class="col-12 col-sm-6 col-md-4 col-lg-3 d-flex justify-content-center mb-3">
    <div class="card shadow-lg text-center bg-light h-100" 
         style="max-width: 300px; width: 100%; border-radius: 16px;">
        <img src="${dataPoke.sprites.other['official-artwork'].front_default}" 
             class="card-img-top p-3" alt="${dataPoke.name}" 
             style="max-height: 180px; object-fit: contain; margin: 0 auto;">
        <div class="card-body">
            <h5 class="card-title text-capitalize fw-bold">${dataPoke.name}</h5>
            <p class="card-text mb-1">ID: #${dataPoke.id}</p>
            <p class="card-text mb-1">Altura: ${dataPoke.height/10} m</p>
            <p class="card-text mb-1">Peso: ${dataPoke.weight/10} kg</p>
            <div>
                ${dataPoke.types.map(t => 
                    `<span class="badge bg-primary me-1">${t.type.name}</span>`
                ).join("")}
            </div>
        </div>
    </div>
</div>

            `;
            row.innerHTML += card;
        }

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: '¡Oops!',
            text: 'Error al cargar Pokémon por tipo',
            confirmButtonColor: '#ff5722'
        });
        console.error(error);
    } finally {
        const duracion = Date.now() - inicio;
        const tiempoMinimo = 1000;
        const retraso = Math.max(0, tiempoMinimo - duracion);

        setTimeout(() => {
            loading.classList.add("d-none");
            pokemonContainer.classList.remove("d-none");
        }, retraso);
    }
}
