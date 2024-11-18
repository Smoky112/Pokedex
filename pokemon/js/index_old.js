function ricercaPk() {
    const nomePokemon = document.getElementById("nomePokemon").value.toLowerCase();
    const dettagliPokemon = document.getElementById("dettagliPokemon");
    dettagliPokemon.innerHTML = "";

    if (!nomePokemon) {
        alert("Inserisci un nome di Pokémon.");
        return;
    }
    fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokemon non trovato');
            }
            return response.json();
        })
        .then(dati => {
            const name = dati.name.charAt(0).toUpperCase() + dati.name.slice(1); //Primo carattere maiuscolo, dal resto minuscolo
            const image = dati.sprites.front_default;
            const types = dati.types.map(tipoPoke =>{
                const tipo = tipoPoke.type.name.toUpperCase();
                return `<img src="assets/types/${tipo}.png" alt="${tipo}" title="${tipo}" class="icona-tipo">`; // Usa l'immagine
            }).join(' ');
            

            dettagliPokemon.innerHTML = `
                    <h2>${name}</h2>
                    <img src="${image}">
                    <p>Tipi:${types}</p>
                    <p>ID del Pokemon:${dati.id}</p>
                `;
        })
        .catch(error => {
           console.error(error);
        });
}

// const types = dati.types.map(tipoPoke => tipoPoke.type.name).join(', ');