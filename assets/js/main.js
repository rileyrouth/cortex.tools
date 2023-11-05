const main = document.querySelector("main");
const nav = document.querySelector("nav");
const starterBox = document.getElementById("starterBox");
const traitSets = main.children;
const addTraitSet = document.getElementById("addTraitSet");
const symbolCodes = {
    d4: '\u{2463}',
    d6: '\u{2465}',
    d8: '\u{2467}',
    d10: '\u{2469}',
    d12: '\u{246B}',
    pp: '\u{24C5}',
    mod: '\u{2463}'
}

let traitSetList = ["Attributes", "Skills", "Distinctions"];
const traitSetMenu = document.createElement("ul");
traitSetMenu.id = "traitSetMenu";
traitSetMenu.setAttribute("role", "list");

for (i = 0; i < traitSetList.length; i++) {
    const listItem = document.createElement("li");
    listItem.innerHTML = traitSetList[i];
    traitSetMenu.appendChild(listItem);
}

const character = loadFromJSON("character");

addTraitSet.addEventListener("click", function(event) {
    nav.appendChild(traitSetMenu);
})

document.addEventListener("mousedown", function(e) {
    if (e.target.matches("#traitSetMenu li")) {
        if (main.contains(starterBox)) {
            starterBox.remove();
        }
        main.appendChild(createNewTraitSet(loadFromJSON(e.target.innerHTML)));
    }
    if (e.target.id != "addTraitSet") {
        traitSetMenu.remove();
    }
});

function createNewTraitSet(traitSet) {
    character.traitSets.push(traitSet);
    const traitArticle = document.createElement("article")
        
    traitArticle.classList.add("trait-set");
    if (traitSet.options.prime) {
        traitArticle.classList.add("prime");
    }

    const heading = document.createElement("div");
    heading.classList.add("trait-set-header");
    const h2 = document.createElement("h2");
    h2.innerHTML = traitSet.name;
    heading.appendChild(h2);
    
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container")
    const optionsButton = document.createElement("i");
    optionsButton.classList.add("fa-solid", "fa-gears", "button");
    optionsButton.addEventListener("click", function(e) {
        openTraitOptions(traitArticle);
    });
    buttonContainer.appendChild(optionsButton);

    const editButton = document.createElement("i");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "button")
    editButton.addEventListener("click", function(e) {
        editTraitSet(traitArticle);
    });
    buttonContainer.appendChild(editButton);

    heading.appendChild(buttonContainer);
    traitArticle.appendChild(heading);

    const traitsList = document.createElement("ul");
    traitsList.setAttribute("role", "list");
    traitsList.classList.add("traits");
    for (i = 0; i < traitSet.traits.length; i++) {
        traitsList.appendChild(generateTrait(traitSet.traits[i]));
    }
    traitArticle.appendChild(traitsList);

    if (traitSet.traits.length > 6) {
        traitArticle.classList.add("grid");
    }

    const newTraitButton = document.createElement("button");
    newTraitButton.className = "new-trait-button";
    newTraitButton.innerHTML = `<i class="fa-solid fa-square-plus"></i>`;
    newTraitButton.addEventListener("click", function(e) {
        const newTraitName = traitSet.name.substring(0, traitSet.name.length -1);
        const newTrait = {
            name: newTraitName,
            rating: traitSet.options.defaultRating
        }
        traitSet.traits.push(newTrait)        
        const newTraitItem = generateTrait(newTrait);
        
        newTraitItem.querySelector("p").setAttribute("contenteditable", "true");

        traitsList.appendChild(newTraitItem);
    });
    traitArticle.appendChild(newTraitButton);
    return traitArticle;
}

function generateTrait(trait) {
    const listItem = document.createElement("li");
        
    const traitName = document.createElement("p")
    traitName.innerHTML = trait.name;
    traitName.setAttribute("contenteditable", "false");

    traitName.addEventListener("blur", traitName.blurfn = function blurfn(e) {
        if (e.target.getAttribute("contenteditable") === "true") {
            let lastTag = traitName.lastElementChild;
            if (lastTag && lastTag.tagName == "BR") {
                lastTag.remove();
            }
            
            traitName.innerHTML = traitName.innerHTML.trimEnd()
            trait.name = traitName.innerHTML;
        }
    });

    traitName.addEventListener("keypress", traitName.keypressfn = function keypressfn(e) {
        if (e.target.getAttribute("contenteditable") === "true" && e.key === "Enter") {          
            e.preventDefault();
            traitName.blur();
        }
    });

    listItem.appendChild(traitName);

    const traitRating = document.createElement("i");
    traitRating.classList.add("cortex", "d" + trait.rating);
    traitRating.innerHTML = symbolCodes["d" + trait.rating];
    
    traitRating.addEventListener("mouseenter",  traitRating.mouseenterfn = function mouseenterfn(e) {
        if (e.target.previousElementSibling.getAttribute("contenteditable") === "true") {
            traitRating.selector = generateDieSelector(trait);
        traitRating.appendChild(traitRating.selector);
        }
        
    });

    traitRating.addEventListener("mouseleave", traitRating.mouseleavefn = function mouseleavefn(e) {
        if (e.target.previousElementSibling.getAttribute("contenteditable") === "true") {
            traitRating.selector.remove();
        }
    })
    listItem.appendChild(traitRating);

    const closeButton = document.createElement("a");
    closeButton.className = "close-button";
    closeButton.innerHTML = "X";

    closeButton.addEventListener("click", function(e) {
        const traitSetName = e.target.closest(".trait-set").querySelector("h2").innerHTML;
        const traitSet = character.traitSets.find((t) => t.name === traitSetName).traits;
        
        traitSet.splice(traitSet.indexOf(trait), 1);
        listItem.remove();
        
    });
    listItem.appendChild(closeButton);

    return listItem;
}

function loadFromJSON(filename) {
    const request = new XMLHttpRequest();
    request.open("GET", `assets/js/bin/${filename}.json`, false);
    request.send(null)
    return JSON.parse(request.responseText);
}

function editTraitSet(traitArticle) {
    let editButton = traitArticle.querySelector(".fa-pen-to-square, .fa-square-check");
    editButton.classList.toggle("fa-pen-to-square");
    editButton.classList.toggle("fa-square-check");
    let traitList = traitArticle.querySelectorAll("p");
    for (i = 0; i < traitList.length; i++) {
        let trait = traitList[i];
        trait.contentEditable = !trait.isContentEditable;
    }
    checkTraitArticleLayout(traitArticle);
}

function generateDieSelector(trait) {
    const dieSelector = document.createElement("div");
    dieSelector.classList.add("die-selector", "start-d" + trait.rating);

    for (i = 4; i < 13; i+= 2) {
        const die = document.createElement("i");
        const pureValue = i;
        const dieValue = "d" + pureValue;
        die.classList.add("cortex");
        die.innerHTML = symbolCodes[dieValue];
        die.addEventListener("click", function(e) {
            trait.rating = pureValue;
            this.parentElement.closest("i").innerHTML = die.innerHTML;
        });
        dieSelector.appendChild(die);
    }
    return dieSelector;
}

function checkTraitArticleLayout(traitArticle) {
    let traitList = traitArticle.querySelectorAll("p");
    if (traitList.length > 6) {
        traitArticle.classList.add("grid");
    }
    else {
        traitArticle.classList.remove("grid");        
    }
}

function openTraitOptions(traitArticle) {
    const traitSetName = traitArticle.querySelector("h2").innerHTML;
    const traitSet = character.traitSets.find((t) => t.name === traitSetName);
    const traitSetOptions = traitSet.options;
    const optionsPanel = document.createElement("div");
    optionsPanel.className = "options-panel";

    const optionsHeader = document.createElement("h2");
    optionsHeader.innerHTML = traitSetName;
    optionsPanel.appendChild(optionsHeader);

    const optionsInnerPanel = document.createElement("div");
    optionsInnerPanel.className = "options";

    for (let optionProp in traitSetOptions) {
        let optionValue = traitSetOptions[optionProp];
        const optionName = document.createElement("p");

        switch (optionProp) {
            case 'prime':
                optionName.innerHTML = "Prime Set"
                break;
            case "defaultRating":
                optionName.innerHTML = "Default Die Rating"
                break;
            default:
                console.log(`Option ${optionProp} not recognised`);
        }
        optionsInnerPanel.appendChild(optionName);

        const optionSelector = document.createElement("div");

        if (Number.parseInt(optionValue)) {
            optionSelector.classList.add("die-selector");
            const currentValue = optionValue;
            for (i = 4; i < 13; i+= 2) {
                const die = document.createElement("i");
                const pureValue = i;
                const dieValue = "d" + pureValue;
                die.classList.add("cortex");
                if (pureValue === currentValue) {
                    die.classList.add("current");
                }
                die.innerHTML = symbolCodes[dieValue];

                die.addEventListener("click", function(e) {
                    const selector = e.target.closest(".die-selector");
                    for (i = 0; i < 5; i++) {
                        selector.childNodes[i].className = "cortex";
                    }
                    e.target.classList.add("current");
                    traitSetOptions[optionProp] = pureValue;
                });

                optionSelector.appendChild(die);
            }
        }
        else if (typeof optionValue === "boolean") {
            const checkBox = document.createElement("input");
            checkBox.setAttribute("type", "checkbox");
            if (optionValue) {
                checkBox.setAttribute("checked", "true");
            }
            checkBox.addEventListener("click", function(e) {
                traitSetOptions[optionProp] = !optionValue;
            })
            optionSelector.appendChild(checkBox);
        }
        else {
            console.log("optionValue");
        }
        
        optionsInnerPanel.appendChild(optionSelector);
    }

    optionsPanel.appendChild(optionsInnerPanel);

    const optionsPanelFooter = document.createElement("div");
    optionsPanelFooter.className = "options-panel-footer";
    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    const deleteIcon = document.createElement("i");
    deleteIcon.className = "fa-solid fa-trash-can";
    deleteButton.innerHTML = "Delete Trait Set";
    deleteButton.prepend(deleteIcon);

    deleteButton.addEventListener("click", function(e) {
        traitArticle.remove();
        character.traitSets.splice(character.traitSets.indexOf(traitSet), 1);
        closeTraitOptions(e.target.closest(".options-panel"));
    });
    optionsPanelFooter.appendChild(deleteButton);

    const saveButton = document.createElement("button");
    saveButton.className = "save-button";
    const saveIcon = document.createElement("i");
    saveIcon.className = "fa-solid fa-check";
    saveButton.innerHTML = "Done";
    saveButton.appendChild(saveIcon);

    saveButton.addEventListener("click", function(e) {
        closeTraitOptions(e.target.closest(".options-panel"));
    });
    optionsPanelFooter.appendChild(saveButton);

    optionsPanel.appendChild(optionsPanelFooter);

    const darkenedBackground = document.createElement("div");
    darkenedBackground.className = "darkened-background";
    main.append(darkenedBackground);
    main.append(optionsPanel);
}

document.addEventListener("click", function(e) {
    if (e.target.className === "darkened-background") {
        closeTraitOptions(e.target.nextElementSibling);
    }
});

function closeTraitOptions(optionsPanel) {
    optionsPanel.previousElementSibling.remove();
    optionsPanel.remove();
}