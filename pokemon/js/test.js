function upper(word) {
    return word[0].toUpperCase() + word.slice(1);
}

function ricercaPk() {
    const nomePokemon = document.getElementById("search-input").value.toLowerCase();
    const nameElement = document.getElementById("name");
    const descriptionElement = document.getElementById("description");
    const sprite = document.getElementById("sprite");
    const numeroPokemon = document.getElementById("number");

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
        .then(data => {
            const name = upper(data.name);
            // const image = data.sprites.front_default;
            const image = data.sprites.other.dream_world.front_default;
            const hp = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
            const attack = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
            const defense = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
            const specialAttack = data.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
            const specialDefense = data.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
            const speed = data.stats.find(stat => stat.stat.name === 'speed').base_stat;
            const abilities = data.abilities.map(ability => upper(ability.ability.name.replace('-', ' '))).join(', ');

            if (nameElement && descriptionElement && sprite) {
                nameElement.textContent = name;
                numeroPokemon.textContent = `#${data.id.toString().padStart(3, '0')}`
                // descriptionElement.textContent = data.species.flavor_text_entries[0].flavor_text.replace('\n', ' ');
                sprite.src = image;

                const statsElements = document.querySelectorAll('.stats > div');
                if (statsElements.length === 6) {
                    statsElements[0].textContent = `HP: ${hp}`;
                    statsElements[1].textContent = `ATK: ${attack}`;
                    statsElements[2].textContent = `DEF: ${defense}`;
                    statsElements[3].textContent = `SpA: ${specialAttack}`;
                    statsElements[4].textContent = `SpD: ${specialDefense}`;
                    statsElements[5].textContent = `SPD: ${speed}`;
                }

                const abilitiesElements = document.querySelectorAll('.abilities > div');
                if (abilitiesElements.length >= 2) {
                    abilitiesElements[0].textContent = abilities.split(',')[0].trim();
                    abilitiesElements[1].textContent = abilities.split(',')[1]?.trim() || '';
                }
            }
        })
        .catch(error => {
            console.error(error);
        });
}