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
        // Cerchiamo la descrizione dell'abilità in italiano
        const description = data.effect_entries.find(
          (entry) => entry.language.name === "en"
        );
  
        if (description) {
          // Rimuoviamo eventuali ritorni a capo per visualizzare una descrizione compatta
          return description.effect.replace(/\n/g, " ");
        }
  
        return "Descrizione non disponibile.";
      })
      .catch((error) => {
        console.error("Errore nel recupero della descrizione dell'abilità:", error);
        return "Errore nel recupero della descrizione";
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
  const genderContainer = document.getElementById("gender-container");

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
                    "absolute bg-gray-900 text-white p-2 rounded-md shadow-md mt-1 text-xs max-w-xs";
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

        // Gestione del sesso
        document.addEventListener("DOMContentLoaded", () => {
          const genderElement = document.getElementById("gender");

          if (genderElement) {
            const gender = Math.random() > 0.5 ? "♂️" : "♀️";
            genderElement.textContent = gender;
          } else {
            console.error("Errore: Contenitore gender non trovato.");
          }
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
            descriptionElement.textContent =
              "Descrizione non disponibile in italiano.";
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

document.getElementById("search-input").addEventListener("keyup", (event) => {
  if (event.key !== "Enter") return;
  document.getElementById("search-button").click();
  event.preventDefault();
});

/* document.addEventListener("DOMContentLoaded", () => {
      document.getElementById("main-box").hidden = true;
  }); */

document.getElementById("main-box").hidden = true;
