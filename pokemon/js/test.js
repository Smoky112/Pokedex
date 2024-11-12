function upper(word) {
    return word[0].toUpperCase() + word.slice(1);
}

function getAbilityTranslation(abilityUrl) {
    return fetch(abilityUrl)
        .then(response => response.json())
        .then(data => {
            const italianTranslation = data.names.find(name => name.language.name === 'it');
            return italianTranslation ? italianTranslation.name : data.name;
        })
        .catch(error => {
            console.error("Errore nel recupero della traduzione dell'abilità:", error);
            return "Errore nella traduzione";
        });
}

function ricercaPk() {
    const nomePokemon = document.getElementById("search-input").value.toLowerCase();
    const nameElement = document.getElementById("name");
    const descriptionElement = document.getElementById("description");
    const sprite = document.getElementById("sprite");
    const numeroPokemon = document.getElementById("number");
    const abilitiesElements = document.getElementById('ability-div');

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
            let image = data.sprites.other.dream_world?.front_default || data.sprites.front_default; //FALLBACK in caso non ci fosse dream_world

            const hp = data.stats.find(stat => stat.stat.name === 'hp').base_stat;
            const attack = data.stats.find(stat => stat.stat.name === 'attack').base_stat;
            const defense = data.stats.find(stat => stat.stat.name === 'defense').base_stat;
            const specialAttack = data.stats.find(stat => stat.stat.name === 'special-attack').base_stat;
            const specialDefense = data.stats.find(stat => stat.stat.name === 'special-defense').base_stat;
            const speed = data.stats.find(stat => stat.stat.name === 'speed').base_stat;
            const abilities = data.abilities.map(ability => ability.ability.url); // URL delle abilità per la traduzione

            if (nameElement && descriptionElement && sprite) {
                nameElement.textContent = name;
                numeroPokemon.textContent = `#${data.id.toString().padStart(3, '0')}`;
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

                Promise.all(abilities.map(url => getAbilityTranslation(url)))
                    .then(translatedAbilities => {
                        abilitiesElements.innerHTML = "";

                        translatedAbilities.forEach((ability, _) => {
                            let ab = document.createElement("div");
                            ab.className = "px-4 py-1 bg-[#E6E6FA] text-gray-900 rounded-lg shadow";
                            ab.textContent = upper(ability.replace('-', ' '));
                            abilitiesElements.appendChild(ab);
                        });

                        /* translatedAbilities.forEach((ability, index) => {
                            if (abilitiesElements[index]) {
                                abilitiesElements[index].textContent = upper(ability.replace('-', ' ')); // Mostra l'abilità tradotta
                            }
                        }); */
                    })
                    .catch(error => {
                        console.error("Errore nel recupero delle abilità:", error);
                        abilitiesElements.forEach(element => {
                            element.textContent = "Errore nel recupero delle abilità.";
                        });
                    });
            }

            fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`)
                .then(response => response.json())
                .then(speciesData => {
                    const italianDescription = speciesData.flavor_text_entries.find(entry => entry.language.name === 'it');
                    if (italianDescription) {
                        descriptionElement.textContent = italianDescription.flavor_text.replace(/\n/g, ' ');
                    } else {
                        descriptionElement.textContent = "Descrizione non disponibile in italiano.";
                    }
                })
                .catch(error => {
                    console.error("Errore nel recupero della descrizione:", error);
                    descriptionElement.textContent = "Errore nel recupero della descrizione.";
                });
        })
        .then(() => { //qui in fondo così si vede solo quando tutto è caricato
            document.getElementById("main-box").hidden = false;
        })
        .catch(error => {
            console.error(error);
        });
}

document.getElementById("search-input").addEventListener("keyup", event => {
    if (event.key !== "Enter") return;
    document.getElementById("search-button").click();
    event.preventDefault();
});

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("main-box").hidden = true;
});