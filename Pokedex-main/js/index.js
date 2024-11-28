function upper(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function generateGUID() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
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
      console.error(
        "Errore nel recupero della descrizione dell'abilità:",
        error
      );
      return "Errore nel recupero della descrizione.";
    });
}

function loadSquad() {
  const squad = JSON.parse(localStorage.getItem("squad")) || [];
  squad.forEach((pokemon) => {
    addToSquad(pokemon);
  });
}

function addToSquad(pokemon) {
  const squadContainer = document.getElementById("squad-container");

  const pokemonDiv = document.createElement("div");
  pokemonDiv.id = pokemon.guid;
  pokemonDiv.className =
    "relative flex items-center justify-start bg-black bg-opacity-50 rounded-lg p-2";

  const pokemonSprite = document.createElement("img");
  pokemonSprite.src = pokemon.sprite;
  pokemonSprite.alt = pokemon.name;
  pokemonSprite.className =
    "w-24 h-24 rounded-lg cursor-pointer hover:opacity-75 hover:scale-90";

  const rightContainer = document.createElement("div");
  rightContainer.className = "flex flex-col items-start ml-4";

  const pokemonName = document.createElement("span");
  pokemonName.textContent = pokemon.name;
  pokemonName.className = "text-white font-bold text-center py-1";

  const hpBarContainer = document.createElement("div");
  hpBarContainer.className =
    "w-full h-3 bg-gray-300 rounded-full mt-2 cursor-pointer";

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
  squad = squad.filter(
    (pokemon) => pokemon.guid !== pokemonSprite.parentElement.id
  );
  localStorage.setItem("squad", JSON.stringify(squad));

  squadContainer.removeChild(pokemonSprite.parentElement);
}

function loadSquad() {
  const squad = JSON.parse(localStorage.getItem("squad")) || [];
  squad.forEach((pokemon) => {
    addToSquad(pokemon);
  });
}

document.getElementById("poke-ball").addEventListener("click", function () {
  getRandomPokemon();
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
    .then((response) => response.json())
    .then((data) => {
      const baseHP = data.stats.find(
        (stat) => stat.stat.name === "hp"
      ).base_stat;
      const level = 50;

      const maxHP = Math.floor(
        ((2 * baseHP + 31 + 0) * level) / 100 + level + 10
      );

      const randomHP = Math.floor(Math.random() * maxHP);

      const pokemon = {
        name: name,
        guid: `pk-${Date.now()}${Math.random()}`,
        sprite: sprite.src,
        hp: randomHP,
        maxHP: maxHP,
        hpPercentage: Math.round((randomHP / maxHP) * 100),
      };

      squad.push(pokemon);
      localStorage.setItem("squad", JSON.stringify(squad));

      addToSquad(pokemon);
    })
    .catch((error) => {
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
  document.getElementById("autocomplete-results").style.display = "none";
  document.getElementById("search-button").click();
  event.preventDefault();
});

document.getElementById("main-box").hidden = true;
window.onload = loadSquad;

//TEST
// Funzione per recuperare un elenco di Pokémon dalla API
function getPokemonList() {
  return fetch("https://pokeapi.co/api/v2/pokemon?limit=1000") // Limita la risposta a 1000 Pokémon
    .then((response) => response.json())
    .then((data) => data.results.map((pokemon) => pokemon.name)); // Estrai solo i nomi dei Pokémon
}

function handleSearchInput() {
  const inputValue = document
    .getElementById("search-input")
    .value.toLowerCase();
  const autocompleteResults = document.getElementById("autocomplete-results");

  if (!inputValue) {
    autocompleteResults.style.display = "none";
    return;
  }

  getPokemonList().then((pokemonList) => {
    const filteredPokemons = pokemonList.filter((pokemon) =>
      pokemon.startsWith(inputValue)
    );

    autocompleteResults.innerHTML = "";
    if (filteredPokemons.length > 0) {
      autocompleteResults.style.display = "block";
      filteredPokemons.forEach((pokemon) => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)
          .then((response) => response.json())
          .then((data) => {
            const suggestionElement = document.createElement("div");
            suggestionElement.className =
              "ml-2 px-2 py-2 cursor-pointer hover:bg-gray-300 hover:scale-105 transform transition-all duration-160";

            const sprite = document.createElement("img");
            sprite.src = data.sprites.front_default;
            sprite.alt = pokemon;
            sprite.className = "inline-block w-12 h-12 mr-3";

            const name = document.createElement("span");
            name.textContent =
              pokemon.charAt(0).toUpperCase() + pokemon.slice(1);

            suggestionElement.appendChild(sprite);
            suggestionElement.appendChild(name);

            suggestionElement.onclick = function () {
              document.getElementById("search-input").value = pokemon;
              autocompleteResults.style.display = "none";
              ricercaPk();
            };

            autocompleteResults.appendChild(suggestionElement);
          })
          .catch((error) =>
            console.error("Errore nel recupero dei dati del Pokémon:", error)
          );
      });
    } else {
      autocompleteResults.style.display = "none";
    }
  });
}

document
  .getElementById("search-input")
  .addEventListener("input", handleSearchInput);

function getRandomPokemon() {
  const randomId = Math.floor(Math.random() * 1000) + 1;
  const pokemonUrl = `https://pokeapi.co/api/v2/pokemon/${randomId}`;

  fetch(pokemonUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Pokemon non trovato");
      }
      return response.json();
    })
    .then((data) => {
      const nomePokemon = data.name;

      ricercaPk(nomePokemon);
    })
    .catch((error) => {
      console.error("Errore nel recupero di un Pokémon casuale:", error);
    });
}

function ricercaPk(nomePokemon = "") {
  const nome =
    nomePokemon || document.getElementById("search-input").value.toLowerCase();

  const nameElement = document.getElementById("name");
  const descriptionElement = document.getElementById("description");
  const sprite = document.getElementById("sprite");
  const numeroPokemon = document.getElementById("number");
  const abilitiesElements = document.getElementById("ability-div");
  const typeContainer = document.getElementById("type-container");

  if (!nome) {
    alert("Inserisci un nome di Pokémon.");
    return;
  }

  fetch(`https://pokeapi.co/api/v2/pokemon/${nome}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Pokemon non trovato");
      }
      return response.json();
    })
    .then((data) => {
      const name = upper(data.name);
      const normalSprite =
        data.sprites.other.dream_world?.front_default ||
        data.sprites.other["official-artwork"]?.front_default;

      const shinySprite =
        data.sprites.other["official-artwork"]?.front_shiny ||
        data.sprites.front_shiny;

      var currentSprite = normalSprite;

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
        sprite.src = currentSprite;

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
                "px-4 py-1 bg-[#E6E6FA] text-gray-900 rounded-lg hover:scale-110 hover:shadow-3xl transition-all duration-300 transform";
              ab.textContent = upper(ability.replace("-", " "));

              const tooltip = document.createElement("div");
              tooltip.className =
                "absolute bg-[#1f1f1f] text-white max-w-xl text-sm p-2 rounded-md opacity-0 transition-opacity duration-300 pointer-events-none z-50";
              tooltip.textContent = "Caricamento...";
              document.body.appendChild(tooltip);
              tooltip.style.position = "absolute";

              ab.addEventListener("mouseover", () => {
                getAbilityDescription(abilities[index]).then((description) => {
                  tooltip.textContent = description;
                  tooltip.classList.remove("opacity-0", "pointer-events-none");
                  tooltip.classList.add("opacity-100");
                });
              });

              ab.addEventListener("mousemove", (event) => {
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
              });

              ab.addEventListener("mouseleave", () => {
                tooltip.classList.remove("opacity-100");
                tooltip.classList.add("opacity-0", "pointer-events-none");
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

        const formatName = (name) => {
          return name.replace(
            /-(\w)/g,
            (
              match,
              letter //alcuni pokemon tipo Nidoran-F hanno un nome diverso, togliamo il -!
            ) => letter.toLowerCase()
          );
        };

        const cryUrl = `https://play.pokemonshowdown.com/audio/cries/${formatName(
          //USIAMO UN'ALTRA API!
          data.name
        )}.mp3`;
        const playCryButton = document.getElementById("play-cry");

        if (playCryButton) {
          playCryButton.hidden = false;
          playCryButton.onclick = () => {
            const audio = new Audio(cryUrl);
            audio.play();
          };
        }
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
              descriptionElement.textContent = "Descrizione non disponibile.";
            }
          }
        })
        .catch((error) => {
          console.error("Errore nel recupero della descrizione:", error);
          descriptionElement.textContent =
            "Errore nel recupero della descrizione.";
        });

      window.shinySprite = function () {
        currentSprite =
          currentSprite === normalSprite ? shinySprite : normalSprite;
        sprite.src = currentSprite;
      };
    })
    .then(() => {
      document.getElementById("main-box").hidden = false;
    })
    .catch((error) => {
      console.error(error);
    });
}

const popup = document.getElementById("popup");
const closePopup = document.getElementById("close-popup");
const infoButton = document.getElementById("info-button");
const popupOverlay = document.getElementById("popup-overlay");

infoButton.addEventListener("click", () => {
  popup.classList.remove("opacity-0", "pointer-events-none");
  popup.classList.add("opacity-100", "pointer-events-auto");

  popupOverlay.classList.remove("hidden");

  document.body.style.overflow = "hidden";
});

closePopup.addEventListener("click", () => {
  popup.classList.remove("opacity-100", "pointer-events-auto");
  popup.classList.add("opacity-0", "pointer-events-none");

  popupOverlay.classList.add("hidden");

  document.body.style.overflow = "auto";
});
