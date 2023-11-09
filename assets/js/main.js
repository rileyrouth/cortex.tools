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

let traitSetList = ["Attributes", "Skills", "Distinctions", "Stress", "Complications","Assets","Signature Assets"];
const traitSetMenu = document.createElement("ul");
traitSetMenu.id = "traitSetMenu";
traitSetMenu.setAttribute("role", "list");

for (i = 0; i < traitSetList.length; i++) {
    const listItem = document.createElement("li");
    listItem.innerHTML = traitSetList[i];
    traitSetMenu.appendChild(listItem);
}

const character = {
    "name": "",
    "traitSets": []
}

loadSamples();

async function loadSamples() {
    let samples = ["signature assets"];
    starterBox.remove();

    for (let sample of samples) {
        const myRequest = new Request(`assets/js/bin/${sample}.json`);
        fetch(myRequest).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((response) => {
            main.appendChild(createNewTraitSet(response));
        });
    }
}

addTraitSet.addEventListener("click", function(event) {
    nav.appendChild(traitSetMenu);
})

document.addEventListener("mousedown", async function(e) {
    if (e.target.matches("#traitSetMenu li")) {
        if (main.contains(starterBox)) {
            starterBox.remove();
        }
        const targetName = e.target.innerHTML.toLowerCase();
        const myRequest = new Request(`assets/js/bin/${targetName}.json`);
        fetch(myRequest).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then((response) => {
            main.appendChild(createNewTraitSet(response));
        });
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
        traitsList.appendChild(generateTrait(traitSet.traits[i], traitSet.options.display));
    }
    traitArticle.appendChild(traitsList);

    const newTraitButton = document.createElement("button");
    newTraitButton.className = "new-trait-button";
    if (traitSet.options.temporary) {
        newTraitButton.classList.add("force-visible");
    }
    newTraitButton.innerHTML = `<i class="fa-solid fa-square-plus"></i>`;
    newTraitButton.addEventListener("click", function(e) {
        const newTraitName = traitSet.name.substring(0, traitSet.name.length -1);
        const newTrait = {
            name: newTraitName,
            rating: traitSet.options.defaultRating
        }
        traitSet.traits.push(newTrait)        
        const newTraitItem = generateTrait(newTrait, traitSet.options.display);
        
        const newTraitParagraph = newTraitItem.querySelector("p");

        if (editButton.classList.contains("fa-pen-to-square")) {
            newTraitParagraph.classList.add("temporarily-editable");
        }
        newTraitParagraph.setAttribute("contenteditable", "true");
        newTraitParagraph.focus();
        traitsList.appendChild(newTraitItem);
        
        var range = document.createRange();
        range.selectNodeContents(newTraitParagraph);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    });
    traitArticle.appendChild(newTraitButton);
    return traitArticle;
}

function generateTrait(trait, displayType) {
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
        if (e.target.classList.contains("temporarily-editable")) {
            e.target.classList.remove("temporarily-editable");
            e.target.setAttribute("contenteditable", "false");
        }
    });

    traitName.addEventListener("keypress", traitName.keypressfn = function keypressfn(e) {
        if (e.target.getAttribute("contenteditable") === "true" && e.key === "Enter") {          
            e.preventDefault();
            traitName.blur();
        }
    });

    listItem.appendChild(traitName);

    listItem.appendChild(generateDieRatingDisplay(trait, displayType));

    const closeButton = document.createElement("a");
    closeButton.className = "close-button";
    closeButton.innerHTML = "X";
    
    const traitSet = character.traitSets.find((t) => t.traits.includes(trait));  

    closeButton.addEventListener("click", function(e) {      
        traitSet.traits.splice(traitSet.traits.indexOf(trait), 1);
        listItem.remove();        
    });

    if (traitSet.options.temporary == true) {
        closeButton.classList.add("force-visible");
    }
    
    listItem.appendChild(closeButton);

    return listItem;
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

function openTraitOptions(traitArticle) {
    const traitSetName = traitArticle.querySelector("h2").innerHTML;
    const traitSet = character.traitSets.find((t) => t.name === traitSetName);
    const traitSetOptions = traitSet.options;
    const optionsPanel = document.createElement("div");
    optionsPanel.className = "options-panel";

    const optionsHeader = document.createElement("div");
    const myH2 = document.createElement("h2");
    myH2.id = "editableTraitHeader";
    myH2.innerHTML = traitSetName;
    myH2.setAttribute("contenteditable", "false");
    optionsHeader.appendChild(myH2);

    const editButton = document.createElement("i");
    editButton.classList.add("fa-solid", "fa-pen-to-square", "button")
    editButton.addEventListener("click", function(e) {
        myH2.contentEditable = !myH2.isContentEditable;
        myH2.focus();
        var range = document.createRange();
        range.selectNodeContents(myH2);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        myH2.addEventListener("keypress", myH2.keypressfn = function keypressfn(e) {
            if (e.target.getAttribute("contenteditable") === "true" && e.key === "Enter") {          
                e.preventDefault();
                myH2.blur();
            }
        });
        myH2.addEventListener("blur", function(e) {
            sel.removeAllRanges();
            myH2.contentEditable = "false";

            let str = myH2.innerText.toLowerCase();
            const arr = str.split(' ');
            for (i = 0; i < arr.length; i++) {
                arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
            }
            str = arr.join(' ');

            traitSet.name = str;
            traitArticle.querySelector("h2").innerHTML = str;
        });
        document.addEventListener("click", function(e) {
            let activeEditableHeader = document.querySelector(`div:has(> #editableTraitHeader[contenteditable="true"])`);
            if (activeEditableHeader && !activeEditableHeader.contains(e.target)) {
                let activeH2 = activeEditableHeader.querySelector("h2");
                activeH2.blur();
            }
            document.removeEventListener("click", this);
        })
    });    
    optionsHeader.appendChild(editButton);

    optionsPanel.appendChild(optionsHeader);

    const optionsInnerPanel = document.createElement("div");
    optionsInnerPanel.className = "options";

    for (let optionProp in traitSetOptions) {
        let optionValue = traitSetOptions[optionProp];
        const optionName = document.createElement("p");
        const optionSelector = document.createElement("div");

        switch (optionProp) {
            case 'prime':
                optionName.innerHTML = "Prime set";
                optionSelector.appendChild(createcheckbox());
                break;
            case "defaultRating":
                optionName.innerHTML = "Default die rating";
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
                break;
            case "display":
                optionName.innerHTML = "Display type";
                const radioList = document.createElement("div");
                const radioLabels = ["static", "stepped", "scale"];
                for (i = 0; i < 3; i++) {
                    let label = document.createElement("label");
                    label.innerHTML = radioLabels[i].charAt(0).toUpperCase() + radioLabels[i].slice(1);

                    let radio = document.createElement("input");
                    radio.setAttribute("type", "radio");
                    radio.setAttribute("name", "display-type");
                    if (optionValue == radioLabels[i]) {
                        radio.setAttribute("checked", "");
                    }
                    label.addEventListener("input", function(e) {
                        traitSetOptions[optionProp] = label.innerText.toLowerCase();
                        changeDisplay(traitArticle, label.innerText.toLowerCase());
                    });
                    label.prepend(radio);
                    radioList.appendChild(label);   
                }
                optionSelector.appendChild(radioList);
                break;
            case "temporary":
                optionName.innerHTML = "Temporary traits";
                let temporaryCheckbox = createcheckbox();
                temporaryCheckbox.addEventListener("input", function(e) {
                    let newTraitButton = traitArticle.querySelector(".new-trait-button");
                    newTraitButton.classList.toggle("force-visible");
                    let closeButtons = traitArticle.querySelectorAll(".close-button");
                    for (i = 0; i < closeButtons.length; i++) {
                        closeButtons[i].classList.toggle("force-visible");
                    }
                });
                optionSelector.appendChild(temporaryCheckbox);
                break;          
            default:
                console.log(`Option ${optionProp} not recognised`);
        }
        
        function createcheckbox() {
            const checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            if (optionValue) {
                checkbox.setAttribute("checked", "true");
            }
            checkbox.addEventListener("click", function(e) {
                traitSetOptions[optionProp] = !optionValue;
            })
            return checkbox;
        }
        
        optionsInnerPanel.appendChild(optionName);
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
    darkenedBackground.addEventListener("click", function(e) {
        closeTraitOptions(e.target.nextElementSibling);
        console.log(character.traitSets[0].options);
    });
    main.append(darkenedBackground);

    main.append(optionsPanel);
}

function closeTraitOptions(optionsPanel) {
    optionsPanel.previousElementSibling.remove();
    optionsPanel.remove();
}

function changeDisplay(traitArticle, displayType) {
    const traitSet = character.traitSets.find((t) => t.name === traitArticle.querySelector("h2").innerHTML);
    const traitList = traitArticle.querySelectorAll("li");
    for (i = 0; i < traitList.length; i++) {
        let oldDice = traitList[i].querySelector(".cortex");
        oldDice.replaceWith(generateDieRatingDisplay(traitSet.traits[i], displayType));
    }
}

function getRatingFromSymbol(value) {
    switch (value) {
        case "\u{2463}":
            return 4;
            break;
        case "\u{2465}":
            return 6;
            break;
        case "\u{2467}":
            return 8;
            break;
        case "\u{2469}":
            return 10;
            break;
        case "\u{246B}":
            return 12;
            break;
        default:
            console.log(`Die value ${value} not recognised`);
    }
}

function generateDieRatingDisplay(trait, displayType) {
    switch (displayType) {
        case "static":
            const staticRating = document.createElement("i");
            staticRating.classList.add("cortex");
            staticRating.innerHTML = symbolCodes["d" + trait.rating];
            staticRating.addEventListener("mouseenter",  staticRating.mouseenterfn = function mouseenterfn(e) {
                if (e.target.previousElementSibling.getAttribute("contenteditable") === "true") {
                    staticRating.selector = generateDieSelector(trait);
                staticRating.appendChild(staticRating.selector);
                }                
            });

            staticRating.addEventListener("mouseleave", staticRating.mouseleavefn = function mouseleavefn(e) {
                if (e.target.previousElementSibling.getAttribute("contenteditable") === "true") {
                    staticRating.selector.remove();
                }
            })
            return staticRating;
        case "stepped":
            const steppedRating = document.createElement("span");
            steppedRating.classList.add("cortex", "die-step");

            const stepDown = document.createElement("i");
            if (symbolCodes["d" + (trait.rating - 2)]) {
                stepDown.innerHTML = symbolCodes["d" + (trait.rating - 2)]
            }
            stepDown.addEventListener("click", function(e) {
                updateStep(e, "down");
            });
            steppedRating.appendChild(stepDown);

            const base = document.createElement("i");
            base.className = "current";
            base.innerHTML = symbolCodes["d" + trait.rating];
            steppedRating.appendChild(base);

            const stepUp = document.createElement("i");
            if (symbolCodes["d" + (trait.rating + 2)]) {
                stepUp.innerHTML = symbolCodes["d" + (trait.rating + 2)];
            }
            stepUp.addEventListener("click", function(e) {
                updateStep(e, "up");
            });
            steppedRating.appendChild(stepUp);

            return steppedRating;

            function updateStep(e, direction) {
                let stepper = e.target.parentElement.children;
                let lowerDie = stepper[0];
                let currentDie = stepper[1];
                let higherDie = stepper[2];
                switch (direction) {
                    case "up":
                        lowerDie.innerHTML = currentDie.innerHTML;
                        currentDie.innerHTML = higherDie.innerHTML;
                        higherDie.innerHTML = symbolCodes["d" + (getRatingFromSymbol(higherDie.innerHTML) + 2)];
                        if (higherDie.innerHTML == "undefined") {
                            higherDie.innerHTML = "";
                        }
                        break;
                    case "down":
                        higherDie.innerHTML = currentDie.innerHTML;
                        currentDie.innerHTML = lowerDie.innerHTML;
                        lowerDie.innerHTML = symbolCodes["d" + (getRatingFromSymbol(lowerDie.innerHTML) - 2)];
                        if (lowerDie.innerHTML == "undefined") {
                            lowerDie.innerHTML = "";
                        }
                        break;
                    default:
                        throw new Error();
                }
                trait.rating = getRatingFromSymbol(currentDie.innerHTML);
            }
        case "scale":
            const scaleRating = document.createElement("span");
            scaleRating.classList.add("cortex", "die-scale");
        
            for (d = 4; d < 13; d+= 2) {
                const die = document.createElement("i");
                if (d == trait.rating) {
                    die.className = "current";
                }
                const dieValue = "d" + d;
                die.innerHTML = symbolCodes[dieValue];
                die.addEventListener("click", function(e) {
                    const scale = e.target.parentElement.children;
                    for (i = 0; i < scale.length; i++) {
                        scale[i].className = "";
                    }
                    e.target.className = "current";
                    trait.rating = getRatingFromSymbol(e.target.innerHTML);
                });
                scaleRating.appendChild(die);
            }
            return scaleRating;
        default:
            throw new Error(`Display Type ${displayType} unrecognised.`);
    }
}