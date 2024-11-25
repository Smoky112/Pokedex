function upper(word) {
    return word[0].toUpperCase() + word.slice(1);
}

function generateGUID() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

function getAbilityTranslation(abilityUrl) {
    return fetch(abilityUrl)
        .then((response) => response.json())
        .then((data) => {
            const italianTranslation = data.names.find(
                (name) => name.language.name === "it"
            );
            return italianTranslation ? italianTranslation.name : data.name;
        })
        .catch((error) => {
            console.error(
                "Errore nel recupero della traduzione dell'abilità:",
                error
            );
            return "Errore nella traduzione";
        });
}

function getAbilityDescription(abilityUrl) {
    return fetch(abilityUrl)
        .then((response) => response.json())
        .then((data) => {

            const italianDescription = data.flavor_text_entries.find(
                (entry) => entry.language.name === "it"
            );

            console.log(italianDescription);

            if (italianDescription) {

                return italianDescription.flavor_text.replace(/\n/g, " ");
            } else {

                const englishDescription = data.effect_entries.find(
                    (entry) => entry.language.name === "en"
                );

                if (englishDescription) {
                    return englishDescription.effect.replace(/\n/g, " ");
                } else {

                    return "Descrizione non disponibile.";
                }
            }
        })
        .catch((error) => {
            console.error("Errore nel recupero della descrizione dell'abilità:", error);
            return "Errore nel recupero della descrizione.";
        });
}



function ricercaPk() {
    const nomePokemon = document
        .getElementById("search-input")
        .value.toLowerCase();
    const nameElement = document.getElementById("name");
    const descriptionElement = document.getElementById("description");
    const sprite = document.getElementById("sprite");
    const numeroPokemon = document.getElementById("number");
    const abilitiesElements = document.getElementById("ability-div");
    const typeContainer = document.getElementById("type-container");

    if (!nomePokemon) {
        alert("Inserisci un nome di Pokémon.");
        return;
    }

    fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("Pokemon non trovato");
            }
            return response.json();
        })
        .then((data) => {
            const name = upper(data.name);
            let image =
                data.sprites.other.dream_world?.front_default ||
                data.sprites.front_default;

            printRandomGender();

            const hp = data.stats.find((stat) => stat.stat.name === "hp").base_stat;
            const attack = data.stats.find(
                (stat) => stat.stat.name === "attack"
            ).base_stat;
            const defense = data.stats.find(
                (stat) => stat.stat.name === "defense"
            ).base_stat;
            const specialAttack = data.stats.find(
                (stat) => stat.stat.name === "special-attack"
            ).base_stat;
            const specialDefense = data.stats.find(
                (stat) => stat.stat.name === "special-defense"
            ).base_stat;
            const speed = data.stats.find(
                (stat) => stat.stat.name === "speed"
            ).base_stat;
            const abilities = data.abilities.map((ability) => ability.ability.url);

            if (nameElement && descriptionElement && sprite) {
                nameElement.textContent = name;
                numeroPokemon.textContent = `#${data.id.toString().padStart(3, "0")}`;
                sprite.src = image;

                const statsElements = document.querySelectorAll(".stats > div");
                if (statsElements.length === 6) {
                    statsElements[0].textContent = `HP: ${hp}`;
                    statsElements[1].textContent = `ATK: ${attack}`;
                    statsElements[2].textContent = `DEF: ${defense}`;
                    statsElements[3].textContent = `SpA: ${specialAttack}`;
                    statsElements[4].textContent = `SpD: ${specialDefense}`;
                    statsElements[5].textContent = `SPD: ${speed}`;
                }

                Promise.all(abilities.map((url) => getAbilityTranslation(url)))
                    .then((translatedAbilities) => {
                        abilitiesElements.innerHTML = "";

                        translatedAbilities.forEach((ability, index) => {
                            let ab = document.createElement("div");
                            ab.className =
                                "px-4 py-1 bg-[#E6E6FA] text-gray-900 rounded-lg hover:shadow-2xl transition duration-300";
                            ab.textContent = upper(ability.replace("-", " "));

                            const tooltip = document.createElement("div");
                            tooltip.className = "absolute bg-gray-900 text-white max-w-xl text-sm p-2 rounded-md opacity-0 transition-opacity duration-300 pointer-events-none"; // Tooltip styles
                            tooltip.textContent = "Caricamento...";
                            document.body.appendChild(tooltip);
                            tooltip.style.position = "absolute";

                            ab.addEventListener("mouseover", () => {
                                getAbilityDescription(abilities[index]).then((description) => {
                                    tooltip.textContent = description;
                                    tooltip.classList.remove('opacity-0', 'pointer-events-none');
                                    tooltip.classList.add('opacity-100');
                                });
                            });

                            ab.addEventListener("mousemove", (event) => {
                                tooltip.style.left = `${event.pageX + 10}px`;
                                tooltip.style.top = `${event.pageY + 10}px`;
                            });

                            ab.addEventListener("mouseleave", () => {
                                tooltip.classList.remove('opacity-100');
                                tooltip.classList.add('opacity-0', 'pointer-events-none');
                            });

                            abilitiesElements.appendChild(ab);
                        });
                    })
                    .catch((error) => {
                        console.error("Errore nel recupero delle abilità:", error);
                        abilitiesElements.forEach((element) => {
                            element.textContent = "Errore nel recupero delle abilità.";
                        });
                    });

                typeContainer.innerHTML = "";
                const types = data.types.map((type) => type.type.name.toUpperCase());
                types.forEach((type) => {
                    const img = document.createElement("img");
                    img.src = `assets/types/${type}.png`;
                    img.alt = type;
                    img.className = "w-14 h-14 object-contain mt-2";
                    typeContainer.appendChild(img);
                });
            }

            fetch(`https://pokeapi.co/api/v2/pokemon-species/${data.id}`)
                .then((response) => response.json())
                .then((speciesData) => {
                    const italianDescription = speciesData.flavor_text_entries.find(
                        (entry) => entry.language.name === "it"
                    );

                    if (italianDescription) {
                        descriptionElement.textContent =
                            italianDescription.flavor_text.replace(/\n/g, " ");
                    } else {
                        const englishDescription = speciesData.flavor_text_entries.find(
                            (entry) => entry.language.name === "en"
                        );

                        if (englishDescription) {
                            descriptionElement.textContent =
                                englishDescription.flavor_text.replace(/\n/g, " ");
                        } else {
                            descriptionElement.textContent =
                                "Descrizione non disponibile.";
                        }
                    }
                })
                .catch((error) => {
                    console.error("Errore nel recupero della descrizione:", error);
                    descriptionElement.textContent =
                        "Errore nel recupero della descrizione.";
                });
        })
        .then(() => {
            document.getElementById("main-box").hidden = false;
        })
        .catch((error) => {
            console.error(error);
        });
}


function loadSquad() {
    const squad = JSON.parse(localStorage.getItem("squad")) || [];
    squad.forEach(pokemon => {
        addToSquad(pokemon);
    });
}

function addToSquad(pokemon) {
    const squadContainer = document.getElementById("squad-container");

    const pokemonDiv = document.createElement("div");
    pokemonDiv.id = pokemon.guid;
    pokemonDiv.className = "relative flex items-center justify-start bg-black bg-opacity-50 rounded-lg p-2";

    const pokemonSprite = document.createElement("img");
    pokemonSprite.src = pokemon.sprite;
    pokemonSprite.alt = pokemon.name;
    pokemonSprite.className = "w-24 h-24 rounded-lg cursor-pointer hover:opacity-75";

    const rightContainer = document.createElement("div");
    rightContainer.className = "flex flex-col items-start ml-4";

    const pokemonName = document.createElement("span");
    pokemonName.textContent = pokemon.name;
    pokemonName.className = "text-white font-bold text-center py-1";

    const hpBarContainer = document.createElement("div");
    hpBarContainer.className = "w-full h-3 bg-gray-300 rounded-full mt-2 cursor-pointer";

    const hpBar = document.createElement("div");
    hpBar.className = "h-full rounded-full transition-all duration-300";

    if (pokemon.hpPercentage >= 66) {
        hpBar.style.backgroundColor = "#76D700";
    } else if (pokemon.hpPercentage >= 33) {
        hpBar.style.backgroundColor = "#F7D700";
    } else {
        hpBar.style.backgroundColor = "#F70000";
    }

    hpBar.style.width = `${pokemon.hpPercentage}%`;

    hpBarContainer.appendChild(hpBar);

    const hpValue = document.createElement("span");
    hpValue.textContent = `${pokemon.hp} / ${pokemon.maxHP}`;
    hpValue.className = "text-white text-center mt-1";

    hpBarContainer.addEventListener("click", () => {
        pokemon.hpPercentage = 100;
        hpBar.style.width = "100%";
        hpBar.style.backgroundColor = "#76D700";
        hpValue.textContent = `${pokemon.maxHP} / ${pokemon.maxHP}`;
    });

    rightContainer.appendChild(pokemonName);
    rightContainer.appendChild(hpBarContainer); 
    rightContainer.appendChild(hpValue);  

    
    pokemonSprite.addEventListener("click", () => removeFromSquad(pokemonSprite));

    
    pokemonDiv.appendChild(pokemonSprite);  
    pokemonDiv.appendChild(rightContainer); 

    squadContainer.appendChild(pokemonDiv);
}


function removeFromSquad(pokemonSprite) {
    const squadContainer = document.getElementById("squad-container");

    let squad = JSON.parse(localStorage.getItem("squad"));
    squad = squad.filter(pokemon => pokemon.guid !== pokemonSprite.parentElement.id);
    localStorage.setItem("squad", JSON.stringify(squad));

    squadContainer.removeChild(pokemonSprite.parentElement);
}


function loadSquad() {
    const squad = JSON.parse(localStorage.getItem("squad")) || [];
    squad.forEach(pokemon => {
        addToSquad(pokemon);
    });
}

document.getElementById("poke-button").addEventListener("click", function () {
    savePokemon()
});

function savePokemon() {
    const sprite = document.getElementById("sprite");
    const name = document.getElementById("name").textContent;

    let squad = JSON.parse(localStorage.getItem("squad")) || [];

    if (squad.length >= 6) {
        alert("La tua squadra è al completo! Puoi avere al massimo 6 Pokémon.");
        return;
    }

    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
            
            const baseHP = data.stats.find(stat => stat.stat.name === "hp").base_stat;
            const level = 50; 

            
            const maxHP = Math.floor(((2 * baseHP + 31 + 0) * level) / 100 + level + 10); 

            
            const randomHP = Math.floor(Math.random() * maxHP);

            const pokemon = {
                name: name,
                guid: `pk-${Date.now()}${Math.random()}`,
                sprite: sprite.src,
                hp: randomHP, 
                maxHP: maxHP, 
                hpPercentage: Math.round((randomHP / maxHP) * 100) 
            };

            squad.push(pokemon);
            localStorage.setItem("squad", JSON.stringify(squad));

            addToSquad(pokemon);
        })
        .catch(error => {
            console.error("Errore nel recuperare i dati del Pokémon:", error);
        });
}

function printRandomGender() {
    const genderContainer = document.getElementById("genderContainer");

    
    if (!genderContainer) {
        console.error("Elemento con id 'genderContainer' non trovato!");
        return;
    }

    
    const randomChoice = Math.random();

    
    if (randomChoice < 0.5) {
        genderContainer.textContent = "♂️"; 
    } else {
        genderContainer.textContent = "♀️"; 
    }
}

document.getElementById("search-input").addEventListener("keyup", (event) => {
    if (event.key !== "Enter") return;
    document.getElementById("search-button").click();
    event.preventDefault();
});


document.getElementById("main-box").hidden = true;
window.onload = loadSquad;
