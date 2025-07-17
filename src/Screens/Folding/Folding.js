const db = firebase.firestore();
let batchNumber = "";

let editMode = false;
let createMode = false;

let employees = []
let employeeCheck = []
let employeeUsed = [];

let currentStructure = "Choose First"
let materialsID = ["Ingredients", "Concentration", "Percentage", "Volume"]
let structureArray = [];
let ingredientsArray = [];
let concentrationArray = [];
let concentrationDescArray = [];
let percentageArray = [];
let percentageDescArray = [];
let thermoTempArray = [];
let thermoTimeArray = [];
let thermoItem = 0;

employees = ["PH", "SG", "KT", "CL"]

let fillArray = [];

fetchAndFill(db.collection("Folding").doc("NewExperiment").collection("Structure"), false);
document.getElementById("successModal").style.display = "none";
document.getElementById("feedbackModal").style.display = "none";
document.getElementById("StructureC").style.border = "3px double red";
document.getElementById("StructureC").style.padding = "5px";

function selectedOption(idName) {
    if (document.getElementById(idName).selectedIndex === 0) {
        document.getElementById("StructureC").style.border = "3px double red";
        document.getElementById("StructureC").style.padding = "5px";
        currentStructure = "Choose First";
        fillBatchNumber(currentStructure);
    }
    else {
        document.getElementById("StructureC").style.border = "";
        document.getElementById("StructureC").style.padding = "";
        for (let i = 0; i < materialsID.length; i++) {
            let children = document.getElementById(materialsID[i] + "Card").children;
            for (let j = children.length - 1; j >= 0; j--) {
                if (!children[j].classList.contains('info-name') && !children[j].classList.contains('info-divider')) {
                    document.getElementById(materialsID[i] + "Card").removeChild(children[j]);
                }
            }
        }
        ingredientsArray = [];
        ingredientsDescArray = [];
        currentStructure = document.getElementById(idName).options[document.getElementById(idName).selectedIndex].text;
        fetchAndFill(db.collection("Folding").doc("NewExperiment").collection("Structure").doc(currentStructure).collection(materialsID[0]), true);
        fillBatchNumber(currentStructure);
    }
}

function fetchAndFill(path, getData) {
    fillArray = [];
    if (getData) {
        path.get().then((querySnapshot) => {
            const promises = [];
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id);
                ingredientsArray.push(doc.id);
                const promise = fetchAndFillData(path.doc(doc.id));
                promises.push(promise);
            });
            Promise.all(promises).then(() => {
                fillMaterials(materialsID[0] + "Card", fillArray, "Batch Number");
                calculate()
            }).catch((error) => {
                console.error("Error during data fetches:", error);
            });
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
    else {
        path.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id);
            });
            fill("Structure", fillArray);
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
}

function fetchAndFillData(path) {
    return path.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            concentrationArray.push(data.Concentration);
            concentrationDescArray.push(data.Unit);
            percentageArray.push(data.Percentage);
            document.getElementById("WSParts").value = data["WS Parts"]

            const XtextDiv = document.createElement('div');
            const XdescDiv = document.createElement('div');
            XtextDiv.className = 'info-text';
            XtextDiv.textContent = data.Concentration;
            XdescDiv.className = 'info-description';
            XdescDiv.textContent = data.Unit;
            document.getElementById(materialsID[1] + "Card").appendChild(XtextDiv);
            document.getElementById(materialsID[1] + "Card").appendChild(XdescDiv);

            const X1textDiv = document.createElement('div');
            const X1descDiv = document.createElement('div');
            X1textDiv.className = 'info-text';
            X1textDiv.textContent = data.Percentage + "%";
            X1descDiv.className = 'info-description';
            X1descDiv.textContent = "per concentration";
            document.getElementById(materialsID[2] + "Card").appendChild(X1textDiv);
            document.getElementById(materialsID[2] + "Card").appendChild(X1descDiv);
        } else {
            console.warn("No such document exists.");
        }
    }).catch((error) => {
        console.error("Error fetching document:", error);
    });
}

function fillMaterials(cardId, content, descContent) {
    const infoCard = document.querySelector(`#${cardId}`);
    const children = infoCard.children;
    for (let i = children.length - 1; i >= 0; i--) {
        if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
            infoCard.removeChild(children[i]);
        }
    }
    for (let i = 0; i < content.length; i++) {
        const textDiv = document.createElement('div');
        textDiv.className = 'info-text';
        textDiv.textContent = content[i];

        const descDiv = document.createElement('div');
        descDiv.className = 'info-description';
        descDiv.textContent = descContent;

        infoCard.appendChild(textDiv);
        infoCard.appendChild(descDiv);
    }
}

function fill(idName, content) {
    let options = document.getElementById(idName);
    for (let i = options.options.length - 1; i > 0; i--) {
        options.remove(i); // Clear existing options
    }
    for (let i = 0; i < content.length; i++) {
        let newOption = document.createElement("option");
        newOption.text = content[i];
        options.options.add(newOption);
    }
    document.getElementById(idName + "C").style.border = "3px double red";
    document.getElementById(idName + "C").style.padding = "5px";
}

function fillBatchNumber(currentX) {
    // do you not put what prestock you used?
    const d = new Date();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    if (d.getMonth() < 10) {
        month = "0" + (d.getMonth() + 1);
    }
    if (d.getDate() < 10) {
        day = "0" + d.getDate();
    }
    batchNumber = "WS" + "-" + currentX + "."  + (month) + (day) + (d.getFullYear()) + ".";
    for (let i = 0; i < employeeUsed.length; i++) {
        batchNumber += employeeUsed[i]
    }
    let container = document.getElementById("batchNumber");
    container.value = batchNumber;
    container.style.width = ((container.value.length + 1) * 10) + 'px';
}

function employeeClicked(index) {
    let btn = document.getElementById("employeeBtn" + index.toString());
    btn.style.background = "#007bff";
    if (employeeCheck[index] === true) {
        btn.style.background = "#eee";
        employeeCheck[index] = false;
        employeeUsed.pop();
    }
    else {
        btn.style.background = "#007bff";
        employeeCheck[index] = true;
        employeeUsed.push(employees[index]);
    }
    fillBatchNumber(currentStructure);
}

function calculate() {
    currVolume = document.getElementById("TVolume").value;
    volumeArray = [];
    for(let i = 0; i<ingredientsArray.length; i++) {
        volumeArray[i] = (percentageArray[i]/100) * currVolume;
    }
    fillMaterials("VolumeCard", volumeArray, "Volume to add");
}

function upload() {
    let safeToUpload = true;
    if (document.getElementById("Structure").selectedIndex === 0) {
        safeToUpload = false;
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error: Missing Selection";
        document.getElementById("modalTitle").style.color = "red"
        document.getElementById("modalBody").textContent = "Please make sure all selections are made before saving.";
    }
    else if (employeeUsed.length === 0) {
        safeToUpload = false;
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error: Missing Employee Selection";
        document.getElementById("modalTitle").style.color = "red"
        document.getElementById("modalBody").textContent = "Please select at least one employee before saving.";
    }
    else if (thermoItem === 0 || document.getElementById("thermoTemp").value === "" || document.getElementById("thermoTime").value === "") {
        safeToUpload = false;
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error: Missing Thermocycler input";
        document.getElementById("modalTitle").style.color = "red"
        document.getElementById("modalBody").textContent = "Please input thermocycler temperature and timings correctly.";
    }
    else {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const d = new Date();
        let month = months[d.getMonth()];
        console.log(d.getFullYear())
        const path = db.collection("Folding")
            .doc(d.getFullYear().toString())
            .collection(month)
            .doc(batchNumber.toString());
        console.log(path);
        const newData = {};

        for (let i = 0; i < ingredientsArray.length; i++) {
            const name = ingredientsArray[i];
            newData[name] = {
                "Concentration": concentrationArray[i],
                "Unit": concentrationDescArray[i],
            };
        }
        for (let i = 0; i < thermoItem; i++) {
            const name = "Thermocycler Run " + (i + 1).toString();
            newData[name] = {
                "Temperature": document.getElementById("thermoTemp" + (i + 1)).value,
                "Time": document.getElementById("thermoTime" + (i + 1)).value,
            };
        }
        newData["Total Volume"] = document.getElementById("TVolume").value;
        newData["WS Parts"] = document.getElementById("WSParts").value
        newData.Notes = document.getElementById("notes").value

        path.set(newData)
            .then(() => {
                console.log("Data successfully uploaded!");
            })
            .catch((error) => {
                console.error("Error uploading document:", error);
            });
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Successfully uploaded experiment!";
        document.getElementById("modalTitle").style.color = "green"
        document.getElementById("modalBody").textContent = "Navigate through history in the nav bar OR search using the provided options";
    }
}

function addCardContent() {
    for (let i = 0; i < materialsID.length; i++) {
        const infoCard = document.querySelector(`#${materialsID[i]}Card`);
        const children = infoCard.children;

        if (children.length > 0 && children[children.length - 1].classList.contains('action-button')) {
            infoCard.removeChild(children[children.length - 1]);
        }

        if (infoCard.id !== 'VolumeCard') {
            const textDiv = document.createElement('div');
            textDiv.className = 'info-text';
            textDiv.textContent = "Add Content Here";

            const descDiv = document.createElement('div');
            descDiv.className = 'info-description';
            descDiv.textContent = "Add Description Here";

            infoCard.appendChild(textDiv);
            infoCard.appendChild(descDiv);

            infoCard.querySelectorAll('.info-text, .info-description').forEach((div) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = div.textContent;
                input.setAttribute('data-type', div.classList.contains('info-text') ? 'text' : 'desc');
                input.style.border = "2px solid green";
                input.style.fontSize = "15px";
                input.style.marginBottom = "4px";
                input.setAttribute('data-card', infoCard.id);
                div.replaceWith(input);
            });

            const button = document.createElement('button');
            button.className = 'action-button';
            button.textContent = 'Add More Content';
            button.onclick = addCardContent;
            infoCard.appendChild(button);
        }
    }
}

function closeFeedbackModal() {
    document.getElementById("feedbackModal").style.display = "none";
}

function syncScroll(scrolledCard) {
    const cards = document.querySelectorAll('.info-card');
    const scrollLocation = scrolledCard.scrollTop;

    cards.forEach(card => {
        if (card !== scrolledCard) {
            card.scrollTop = scrollLocation;
        }
    });
}

function createNew() {
    const arrays = {
        ingredientsArray: [],
        concentrationArray: [],
        concentrationDescArray: [],
        percentageArray: [],
    };
    if (!createMode) {
        createMode = true;

        // clear dropdowns
        let options = document.getElementById("Structure");
        for (let i = options.options.length - 1; i >= 0; i--) {
            options.remove(i);
        }
        let newOption = document.createElement("option");
        options.options.add(newOption);

        let infoCard;
        for (let i = 0; i < materialsID.length - 1; i++) {
            infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
            const children = infoCard.children;
            for (let i = children.length - 1; i >= 0; i--) {
                if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
                    infoCard.removeChild(children[i]);
                }
            }
        }

        addCardContent()
        document.getElementById("createBtn").innerHTML = "SAVE NEW";

        const dropdownGroup = document.querySelector('.dropdown-group');
        const selects = dropdownGroup.querySelectorAll('select');

        selects.forEach(select => {
            if (select.id === "Structure") {
                select.style.display = 'none';
                const inputContainer = document.createElement('div');
                inputContainer.className = 'input-container';

                Array.from(select.options).forEach(option => {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = option.text;
                    input.className = 'option-edit';
                    inputContainer.appendChild(input);
                });
                select.dataset.inputContainerId = `inputs-${select.id}`;
                inputContainer.id = select.dataset.inputContainerId;
                select.parentNode.appendChild(inputContainer);
            }
        });
        document.getElementById("StructureC").style.border = "3px double green";
        document.getElementById("StructureC").style.padding = "5px";
        document.getElementById("WSPartsC").style.border = "3px double green";
        document.getElementById("WSPartsC").style.padding = "5px";
    }
    else {
        let safeToCreate = true;
        if (document.getElementById("Structure").value !== "" && document.getElementById("ProjectName").value !== null) {
            safeToCreate = true;
            document.getElementById("StructureC").style.border = "";
            document.getElementById("StructureC").style.padding = "";
        } else {
            safeToCreate = false;
            document.getElementById("StructureC").style.border = "3px double red";
            document.getElementById("StructureC").style.padding = "5px";
        }
        if (document.getElementById("WSParts").value !== "" && document.getElementById("WSParts").value !== null) {
            safeToCreate = true;
            document.getElementById("WSPartsC").style.border = "";
            document.getElementById("WSPartsC").style.padding = "";
        } else {
            safeToCreate = false;
            document.getElementById("WSPartsC").style.border = "3px double red";
            document.getElementById("WSPartsC").style.padding = "5px";
        }
        if (safeToCreate) {
            createMode = false;
            document.getElementById("createBtn").innerHTML = "CREATE NEW";
            for (let i = 0; i < materialsID.length - 1; i++) {
                infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const children = infoCard.children;
                infoCard.removeChild(children[children.length - 1]);
            }
            for (const key in arrays) {
                arrays[key] = [];
            }
            document.querySelectorAll('.info-card').forEach(card => {
                if (card.id !== "VolumeCard") {
                    const cardId = card.id.toLowerCase().replace("card", "");
                    const inputs = card.querySelectorAll('input');
                    inputs.forEach((input, index) => {
                        const isText = input.getAttribute('data-type') === 'text';
                        const arrayName = cardId + (isText ? 'Array' : 'DescArray');

                        if (arrays[arrayName]) {
                            arrays[arrayName].push(input.value);
                        }

                        const newDiv = document.createElement('div');
                        newDiv.className = isText ? 'info-text' : 'info-description';
                        newDiv.textContent = input.value;
                        input.replaceWith(newDiv);
                    });
                }
            });
            const dropdownGroup = document.querySelector('.dropdown-group');
            const selects = dropdownGroup.querySelectorAll('select');

            selects.forEach(select => {
                if (select.id === "Structure") {
                    const inputContainerId = select.dataset.inputContainerId;
                    const inputContainer = document.getElementById(inputContainerId);
                    const inputs = inputContainer.querySelectorAll('input');
                    select.innerHTML = '';

                    inputs.forEach(input => {
                        const option = document.createElement('option');
                        option.text = input.value;
                        select.add(option);
                    });
                    inputContainer.remove();
                    select.style.display = 'inline-block';
                }
            });
            currentStructure = document.getElementById("Structure").value;
            console.log(arrays)
            db.collection("Folding")
                .doc("NewExperiment")
                .collection("Structure")
                .doc(currentStructure)
                .set({createdAt: firebase.firestore.FieldValue.serverTimestamp()})
                .then(() => {
                    console.log("current doc now initialized");
                });
            for(let i = 0; i < arrays.ingredientsArray.length; i++) {
                let docRef = db.collection("Folding")
                    .doc("NewExperiment")
                    .collection("Structure")
                    .doc(currentStructure)
                    .collection("Ingredients")
                    .doc(arrays.ingredientsArray[i])

                docRef.set({
                    "Concentration": arrays.concentrationArray[i],
                    "Percentage": arrays.percentageArray[i],
                    "Unit": arrays.concentrationDescArray[i],
                    "WS Parts": document.getElementById("WSParts").value
                }).then(() => {
                    console.log("Data updated successfully!");
                }).catch((error) => {
                    console.error("Error updating Data:", error);
                });
            }
            document.getElementById("successModal").style.display = "block";
            document.getElementById("modalTitle").textContent = "New Template Created";
            document.getElementById("modalTitle").style.color = "green"
            document.getElementById("modalBody").textContent = "You can now use this template for future Buffer entries.";
            fetchAndFill(db.collection("Folding").doc("NewExperiment").collection("Structure"), false);
            calculate()
        }
        else {
            document.getElementById("successModal").style.display = "block";
            document.getElementById("modalTitle").textContent = "Error: Missing Selection";
            document.getElementById("modalTitle").style.color = "red"
            document.getElementById("modalBody").textContent = "Please make sure all selections are made before saving.";
        }
    }
}

function clickedEdit() {
    const arrays = {
        ingredientsArray: [],
        concentrationArray: [],
        concentrationDescArray: [],
        percentageArray: [],
    };
    if (currentStructure !== "Choose First") {
        if (!editMode) {
            editMode = true;
            document.getElementById("editBtn").innerHTML = "SAVE";
            document.querySelectorAll('.info-card').forEach(card => {
                card.querySelectorAll('.info-text, .info-description').forEach((div, index) => {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = div.textContent;
                    input.setAttribute('data-type', div.classList.contains('info-text') ? 'text' : 'desc');
                    input.style.border = "2px solid green";
                    input.style.fontSize = "15px";
                    input.style.gap = "4px";
                    const field = card.id;
                    input.setAttribute('data-card', field);
                    div.replaceWith(input);
                });
            });
            for(let i = 0; i < materialsID.length; i++) {
                let tempCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const button = document.createElement('button');
                button.className = 'action-button';
                button.textContent = 'Add More Content';

                button.onclick = addCardContent;

                tempCard.appendChild(button);
            }
        } else {
            editMode = false;
            document.getElementById("editBtn").innerHTML = "EDIT";
            for (const key in arrays) {
                arrays[key] = [];
            }
            document.querySelectorAll('.info-card').forEach(card => {
                const cardId = card.id.toLowerCase().replace("card", "");

                const inputs = card.querySelectorAll('input');
                inputs.forEach((input, index) => {
                    const isText = input.getAttribute('data-type') === 'text';
                    const arrayName = cardId + (isText ? 'Array' : 'DescArray');

                    if (arrays[arrayName]) {
                        arrays[arrayName].push(input.value);
                    }

                    const newDiv = document.createElement('div');
                    newDiv.className = isText ? 'info-text' : 'info-description';
                    newDiv.textContent = input.value;
                    input.replaceWith(newDiv);
                });
            });
            console.log(arrays);
            for(let i = 0; i < materialsID.length; i++) {
                infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const children = infoCard.children;
                infoCard.removeChild(children[children.length - 1]);
            }
            updateDB(arrays.concentrationArray, arrays.concentrationDescArray, arrays.percentageArray, arrays.ingredientsArray);
        }
    }
    else {
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error";
        document.getElementById("modalTitle").style.color = "red";
        document.getElementById("modalBody").textContent = "Please select a Working Stock to edit.";
    }
}

async function updateDB(ConcentrationA, ConcentrationDA, PercentageA ,IngredientsA) {
    const mainRef = db
        .collection("Folding")
        .doc("NewExperiment")
        .collection("Structure")
        .doc(currentStructure)
        .collection("Ingredients");

    const snapshot = await mainRef.get();
    const deletePromises = [];
    snapshot.forEach(doc => {
        deletePromises.push(mainRef.doc(doc.id).delete());
    });
    await Promise.all(deletePromises);
    console.log("All existing Folding documents deleted.");

    const addPromises = [];
    for (let i = 0; i < IngredientsA.length; i++) {
        const docData = {
            "Concentration": ConcentrationA[i],
            "Percentage": PercentageA[i],
            "Unit": ConcentrationDA[i],
            "WS Parts": document.getElementById("WSParts").value
        };
        console.log(docData);
        addPromises.push(mainRef.doc(IngredientsA[i]).set(docData));
    }
    await Promise.all(addPromises);
    console.log("New Buffer documents added.");
    document.getElementById("successModal").style.display = "block";
    document.getElementById("modalTitle").textContent = "Edit saved successfully to the Database";
    document.getElementById("modalTitle").style.color = "green"
    document.getElementById("modalBody").textContent = "This change will now be reflected in this X template.";
}

function addThermoRow() {
    thermoItem++;
    const container = document.getElementById("thermoRows");
    const row = document.createElement("div");
    const tempInput = document.createElement("input");
    const timeInput = document.createElement("input");

    row.className = "thermo-row";
    tempInput.type = "text";
    tempInput.placeholder = "Temperature";
    tempInput.id = "thermoTemp" + thermoItem.toString();
    timeInput.type = "text";
    timeInput.placeholder = "Time";
    timeInput.id = "thermoTime" + thermoItem.toString();

    row.appendChild(tempInput);
    row.appendChild(timeInput);
    container.appendChild(row);
}


async function openThermoModal() {
    document.getElementById('thermoModal').style.display = 'block';
}

function closeThermoModal() {
    document.getElementById('thermoModal').style.display = 'none';
}

function submitFeedback() {
    const feedback = document.getElementById("feedbackTextarea").value.trim();
    const path = db.collection("Feedback").doc();
    const newData = {
        Ticket: feedback,
        Timestamp: new Date(),
    };
    path.set(newData)
        .then(() => {
            console.log("Data successfully uploaded!");
        })
        .catch((error) => {
            console.error("Error uploading document:", error);
        });

    closeFeedbackModal();
}

function closeModal() {
    document.getElementById("successModal").style.display = "none";
}
