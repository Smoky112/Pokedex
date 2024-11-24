function upper(word) {
  return word[0].toUpperCase() + word.slice(1);
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

      const italianDescription = data.effect_entries.find(
        (entry) => entry.language.name === "it"
      );

      if (italianDescription) {

        return italianDescription.effect.replace(/\n/g, " ");
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

      // Aggiungi il simbolo del genere casuale
      printRandomGender(); // Chiamata per inserire il genere nel DOM

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

              // Aggiungi l'evento mouseover per mostrare la descrizione dell'abilità
              ab.addEventListener("mouseover", () => {
                getAbilityDescription(abilities[index]).then((description) => {
                  const tooltip = document.createElement("div");
                  tooltip.textContent = description;
                  tooltip.className =
                    "absolute bg-gray-900 text-white p-2 rounded-md shadow-md mt-1 text-xs max-w-xs z-10"; // Modificato il className con z-10
                  ab.appendChild(tooltip);

                  // Rimuovi la descrizione quando il mouse esce
                  ab.addEventListener("mouseleave", () => {
                    tooltip.remove();
                  });
                });
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
          img.className = "w-14 h-14 object-contain mt-2"; // Evita distorsioni
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


//CIAO
// Funzione per caricare la squadra dal localStorage e mostrarla
function loadSquad() {
    const squad = JSON.parse(localStorage.getItem("squad")) || [];
    squad.forEach(pokemon => {
      addToSquad(pokemon);
    });
}
  
// Funzione per aggiungere un Pokémon alla visualizzazione
function addToSquad(pokemon) {
    const squadContainer = document.getElementById("squad-container");

    // Contenitore principale del Pokémon con background nero
    const pokemonDiv = document.createElement("div");
    pokemonDiv.className = "relative flex items-center justify-start bg-black bg-opacity-50 rounded-lg p-2"; // Flex orizzontale

    // Contenitore per lo sprite (a sinistra)
    const pokemonSprite = document.createElement("img");
    pokemonSprite.src = pokemon.sprite;
    pokemonSprite.alt = pokemon.name;
    pokemonSprite.className = "w-24 h-24 rounded-lg cursor-pointer hover:opacity-75"; // Posizionato a sinistra

    // Contenitore per il nome, genere, barra HP e valore HP (a destra)
    const rightContainer = document.createElement("div");
    rightContainer.className = "flex flex-col items-start ml-4"; // Per mantenere tutto a destra

    // Nome del Pokémon
    const pokemonName = document.createElement("span");
    pokemonName.textContent = pokemon.name;
    pokemonName.className = "text-white font-bold text-center py-1"; // Nome centrato sopra la barra HP

    // Barra della vita (Health bar)
    const hpBarContainer = document.createElement("div");
    hpBarContainer.className = "w-full h-3 bg-gray-300 rounded-full mt-2 cursor-pointer"; // Cambia altezza per essere più simile ai giochi

    const hpBar = document.createElement("div");
    hpBar.className = "h-full rounded-full transition-all duration-300"; // Transizione per renderla dinamica

    // Determina il colore della barra in base alla percentuale di HP
    if (pokemon.hpPercentage >= 66) {
        hpBar.style.backgroundColor = "#76D700"; // Verde (Buona salute)
    } else if (pokemon.hpPercentage >= 33) {
        hpBar.style.backgroundColor = "#F7D700"; // Giallo (Salute media)
    } else {
        hpBar.style.backgroundColor = "#F70000"; // Rosso (Salute bassa)
    }

    hpBar.style.width = `${pokemon.hpPercentage}%`; // Imposta la larghezza in base alla percentuale di HP

    hpBarContainer.appendChild(hpBar);

    // Valore degli HP sotto la barra (es. 40/150)
    const hpValue = document.createElement("span");
    hpValue.textContent = `${pokemon.hp} / ${pokemon.maxHP}`; // Mostra HP correnti e HP massimi
    hpValue.className = "text-white text-center mt-1"; // Centra e separa un po' dalla barra

    // Aggiungi l'evento di clic sulla barra degli HP per riempirla
    hpBarContainer.addEventListener("click", () => {
        pokemon.hpPercentage = 100; // Imposta gli HP a 100% al clic sulla barra
        hpBar.style.width = "100%"; // Riempi la barra
        hpBar.style.backgroundColor = "#76D700"; // Cambia colore in verde
        hpValue.textContent = `${pokemon.maxHP} / ${pokemon.maxHP}`; // Aggiorna il valore degli HP
    });

    // Aggiungi tutto ciò nel contenitore a destra
    rightContainer.appendChild(pokemonName);
    rightContainer.appendChild(hpBarContainer); // Barra degli HP
    rightContainer.appendChild(hpValue);  // Valore degli HP sotto la barra

    // Aggiungi un evento per rimuovere il Pokémon dalla squadra
    pokemonSprite.addEventListener("click", () => removeFromSquad(pokemonSprite));

    // Aggiungi i contenuti al contenitore principale
    pokemonDiv.appendChild(pokemonSprite);  // Sprite a sinistra
    pokemonDiv.appendChild(rightContainer); // Resto a destra

    squadContainer.appendChild(pokemonDiv);
}

// Funzione per rimuovere un Pokémon dalla squadra
function removeFromSquad(pokemonSprite) {
    const squadContainer = document.getElementById("squad-container");
    squadContainer.removeChild(pokemonSprite.parentElement);

    let squad = JSON.parse(localStorage.getItem("squad"));
    squad = squad.filter(pokemon => pokemon.sprite !== pokemonSprite.src);
    localStorage.setItem("squad", JSON.stringify(squad));
}

// Funzione per salvare il Pokémon nella squadra (localStorage)
function savePokemon() {
    const sprite = document.getElementById("sprite");
    const name = document.getElementById("name").textContent;

    let squad = JSON.parse(localStorage.getItem("squad")) || [];

    if (squad.length >= 6) {
        alert("La tua squadra è al completo! Puoi avere al massimo 6 Pokémon.");
        return;
    }

    // Genera HP casuali tra 0 e 100
    const randomHP = Math.floor(Math.random() * 101);
    const gender = Math.random() > 0.5 ? "Male" : "Female"; // Assegna un genere casuale (solo a scopo di esempio)

    const pokemon = {
        name: name,
        sprite: sprite.src,
        hpPercentage: randomHP, // Memorizza la percentuale degli HP
        hp: randomHP, // HP correnti
        maxHP: 100, // HP massimi
        gender: gender // Genere del Pokémon
    };

    squad.push(pokemon);

    localStorage.setItem("squad", JSON.stringify(squad));

    addToSquad(pokemon);
}

// Carica la squadra quando la pagina viene caricata
function loadSquad() {
    const squad = JSON.parse(localStorage.getItem("squad")) || [];
    squad.forEach(pokemon => {
      addToSquad(pokemon);
    });
}

// Carica la squadra quando la pagina viene caricata
window.onload = loadSquad;

document.getElementById("poke-button").addEventListener("click", function() {
  savePokemon()
});



// Funzione per salvare il Pokémon nella squadra (localStorage)
function savePokemon() {
  const sprite = document.getElementById("sprite");
  const name = document.getElementById("name").textContent;

  let squad = JSON.parse(localStorage.getItem("squad")) || [];

  if (squad.length >= 6) {
      alert("La tua squadra è al completo! Puoi avere al massimo 6 Pokémon.");
      return;
  }

  // Ottieni i dati del Pokémon dall'API PokeAPI v2
  fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      .then(response => response.json())
      .then(data => {
          // Calcola gli HP massimi utilizzando le statistiche di base
          const baseHP = data.stats.find(stat => stat.stat.name === "hp").base_stat;
          const level = 50; // Livello del Pokémon (per semplicità, assumiamo livello 100)

          // Formula per calcolare gli HP massimi
          const maxHP = Math.floor(((2 * baseHP + 31 + 0) * level) / 100 + level + 10); // IV=31, EV=0

          // Calcola una percentuale casuale degli HP
          const randomHP = Math.floor(Math.random() * maxHP);

          const pokemon = {
              name: name,
              sprite: sprite.src,
              hp: randomHP, // Gli HP effettivi calcolati
              maxHP: maxHP, // HP massimi
              hpPercentage: Math.round((randomHP / maxHP) * 100) // Percentuale di HP
          };

          squad.push(pokemon);
          localStorage.setItem("squad", JSON.stringify(squad));

          addToSquad(pokemon);
      })
      .catch(error => {
          console.error("Errore nel recuperare i dati del Pokémon:", error);
      });
}



// Carica la squadra quando la pagina viene caricata
window.onload = loadSquad;


  //CIAO

  function printRandomGender() {
    const genderContainer = document.getElementById("genderContainer");
  
    // Verifica se l'elemento esiste
    if (!genderContainer) {
      console.error("Elemento con id 'genderContainer' non trovato!");
      return;
    }
  
    // Genera un numero casuale tra 0 e 1
    const randomChoice = Math.random();
  
    // Assegna il simbolo maschile o femminile con una probabilità del 50%
    if (randomChoice < 0.5) {
      genderContainer.textContent = "♂️"; // Simbolo maschile
    } else {
      genderContainer.textContent = "♀️"; // Simbolo femminile
    }
  }


document.getElementById("search-input").addEventListener("keyup", (event) => {
  if (event.key !== "Enter") return;
  document.getElementById("search-button").click();
  event.preventDefault();
});

/* document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("main-box").hidden = true;
  }); */

document.getElementById("main-box").hidden = true;
