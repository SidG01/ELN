const db = firebase.firestore();
let batchNumber = "";

let editMode = false;
let createMode = false;
let fillCheck = false;

let employees = []
let employeeCheck = []
let employeeUsed = [];

let currentBuffer = "CHOOSE BUFFER";
let currentVolume = document.getElementById("volume").value;
let currentBufferX = document.getElementById("bufferx").value;

let materialsID = ["Ingredients", "Weight", "Concentration", "Mass"]
let ingredientsArray = [];
let ingredientsDescArray = [];
let weightArray = [];
let weightDescArray = [];
let concentrationArray = [];
let concentrationDescArray = [];
let massArray = [];
let massDescArray = [];

employees = ["PH", "SG", "KT", "CL"]

let fillArray = [];

fetchAndFill(db.collection("Buffer").doc("NewExperiment").collection("Buffer"), false);
document.getElementById("successModal").style.display = "none";
document.getElementById("feedbackModal").style.display = "none";

function selectedOption(idName) {
    fillCheck = false;
    if (document.getElementById(idName).selectedIndex === 0) {
        document.getElementById("bufferC").style.border = "3px double red";
        document.getElementById("bufferC").style.padding = "5px";
        currentBuffer = "Choose First";
        fillBatchNumber(currentBuffer);
    }
    else {
        fillCheck = true;
        document.getElementById("bufferC").style.border = "";
        document.getElementById("bufferC").style.padding = "";
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
        weightArray = [];
        weightDescArray = [];
        concentrationArray = [];
        concentrationDescArray = [];
        massArray = [];
        massDescArray = [];
        currentBuffer = document.getElementById(idName).options[document.getElementById(idName).selectedIndex].text;
        fetchAndFill(db.collection("Buffer").doc("NewExperiment").collection("Buffer").doc(currentBuffer).collection(materialsID[0]), true);
        fillBatchNumber(currentBuffer);
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
                calculate();
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
            fill("buffer", fillArray);
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
}

let tempBatchNumber = "";
function fetchAndFillData(path) {
    return path.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            ingredientsDescArray.push(data.Batch);

            const WeightextDiv = document.createElement('div');
            const WeightdescDiv = document.createElement('div');
            WeightextDiv.className = 'info-text';
            WeightextDiv.textContent = data.Weight;
            weightArray.push(data.Weight);
            WeightdescDiv.className = 'info-description';
            WeightdescDiv.textContent = data.WeightDesc;
            weightDescArray.push(data.WeightDesc);
            document.getElementById(materialsID[1] + "Card").appendChild(WeightextDiv);
            document.getElementById(materialsID[1] + "Card").appendChild(WeightdescDiv);

            const ConcentrationtextDiv = document.createElement('div');
            const ConcentrationdescDiv = document.createElement('div');
            ConcentrationtextDiv.className = 'info-text';
            ConcentrationtextDiv.textContent = (data.Concentration * currentBufferX).toString();
            concentrationArray.push(data.Concentration);
            ConcentrationdescDiv.className = 'info-description';
            ConcentrationdescDiv.textContent = data.ConcentrationDesc;
            concentrationDescArray.push(data.ConcentrationDesc);
            document.getElementById(materialsID[2] + "Card").appendChild(ConcentrationtextDiv);
            document.getElementById(materialsID[2] + "Card").appendChild(ConcentrationdescDiv);
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
        descDiv.textContent = ingredientsDescArray[i];

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

function calculate() {
    const infoCard = document.getElementById("MassCard");
    currentVolume = document.getElementById("volume").value;
    currentBufferX = document.getElementById("bufferx").value;
    let children = document.getElementById("ConcentrationCard").children;
    for (let i = children.length - 1; i >= 0; i--) {
        if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
            document.getElementById("ConcentrationCard").removeChild(children[i]);
        }
    }
    children = document.getElementById("MassCard").children;
    for (let i = children.length - 1; i >= 0; i--) {
        if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
            document.getElementById("MassCard").removeChild(children[i]);
        }
    }

    for (let i = 0; i < ingredientsArray.length; i++) {
        const CDiv = document.createElement('div');
        CDiv.className = 'info-text';
        CDiv.textContent = (concentrationArray[i] * currentBufferX).toString();

        const CDDiv = document.createElement('div');
        CDDiv.className = 'info-description';
        CDDiv.textContent = "micro molar"

        document.getElementById("ConcentrationCard").appendChild(CDiv);
        document.getElementById("ConcentrationCard").appendChild(CDDiv);

        const MDiv = document.createElement('div');
        MDiv.className = 'info-text';
        MDiv.textContent = ((currentVolume) * ((concentrationArray[i]) * currentBufferX) * (weightArray[i]) / (1000) / (1000)).toFixed(5);

        const MDDiv = document.createElement('div');
        MDDiv.className = 'info-description';
        MDDiv.textContent = "grams"

        document.getElementById("MassCard").appendChild(MDiv);
        document.getElementById("MassCard").appendChild(MDDiv);
    }
}

function fillBatchNumber(Value) {
    // how does this work for buffer
    const d = new Date();
    let month = d.getMonth() + 1;
    let day = d.getDate();
    if (d.getMonth() < 10) {
        month = "0" + (d.getMonth() + 1);
    }
    if (d.getDate() < 10) {
        day = "0" + d.getDate();
    }
    batchNumber = Value + "."  + (month) + (day) + (d.getFullYear()) + ".";
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
    fillBatchNumber(currentBuffer);
}

function createNew() {
    const arrays = {
        ingredientsArray: [],
        ingredientsDescArray: [],
        weightArray: [],
        weightDescArray: [],
        concentrationArray: [],
        concentrationDescArray: [],
    };
    if (!createMode) {
        createMode = true;

        // clear dropdowns
        let options = document.getElementById("buffer");
        for (let i = options.options.length - 1; i >= 0; i--) {
            options.remove(i); // Clear existing options
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
        document.querySelectorAll('.info-card').forEach(card => {
            if (card.id !== "MassCard") {
                card.querySelectorAll('.info-text, .info-description').forEach((div) => {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.value = div.textContent;
                    input.setAttribute('data-type', div.classList.contains('info-text') ? 'text' : 'desc');
                    input.style.border = "2px solid green";
                    input.style.fontSize = "15px";
                    input.style.gap = "4px";
                    input.setAttribute('data-card', card.id);
                    div.replaceWith(input);
                });
            }
        });


        const dropdownGroup = document.querySelector('.dropdown-group');
        const selects = dropdownGroup.querySelectorAll('select');

        selects.forEach(select => {
            if (select.id === "buffer") {
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
    }
    else {
        createMode = false;
        document.getElementById("createBtn").innerHTML = "CREATE NEW";
        for(let i = 0; i < materialsID.length - 1; i++) {
            infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
            const children = infoCard.children;
            infoCard.removeChild(children[children.length - 1]);
        }
        for (const key in arrays) {
            arrays[key] = [];
        }
        document.querySelectorAll('.info-card').forEach(card => {
            if (card.id !== "MassCard") {
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
            if (select.id === "buffer") {
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
        currentBuffer = document.getElementById("buffer").value;
        console.log(arrays)
        db.collection("Buffer")
            .doc("NewExperiment")
            .collection("Buffer")
            .doc(currentBuffer)
            .set({ createdAt: firebase.firestore.FieldValue.serverTimestamp() })
            .then(() => {
                console.log("current doc now initialized");
            });
        for(let i = 0; i < arrays.ingredientsArray.length; i++) {
            let docRef = db.collection("Buffer")
                .doc("NewExperiment")
                .collection("Buffer")
                .doc(currentBuffer)
                .collection("Ingredients")
                .doc(arrays.ingredientsArray[i])

            docRef.set({
                Batch: arrays.ingredientsDescArray[i],
                Concentration: arrays.concentrationArray[i],
                ConcentrationDesc: arrays.concentrationDescArray[i],
                Weight: arrays.weightArray[i],
                WeightDesc: arrays.weightDescArray[i],
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
        fetchAndFill(db.collection("Buffer").doc("NewExperiment").collection("Buffer"), false);
        calculate()
    }
}

function upload() {
    let safeToUpload = true;
    if (fillCheck === false) {
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
    else {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        const d = new Date();
        let month = months[d.getMonth()];
        console.log(d.getFullYear())
        const path = db.collection("Buffer")
            .doc(d.getFullYear().toString())
            .collection(month)
            .doc(batchNumber.toString());
        console.log(path);
        const newData = {};

        for (let i = 0; i < ingredientsArray.length; i++) {
            const name = ingredientsArray[i];
            newData[name] = {
                Desc: ingredientsDescArray[i],
                Weight: weightArray[i],
                WeightDesc: weightDescArray[i],
                Concentration: concentrationArray[i],
                ConcentrationDesc: concentrationDescArray[i]
            };
        }
        newData.Volume = document.getElementById("volume").value
        newData.BufferX = document.getElementById("bufferx").value
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

function clickedEdit() {
    const arrays = {
        ingredientsArray: [],
        ingredientsDescArray: [],
        weightArray: [],
        weightDescArray: [],
        concentrationArray: [],
        concentrationDescArray: [],
    };
    if (currentBuffer !== "Choose First") {
        if (!editMode) {
            editMode = true;
            document.getElementById("editBtn").innerHTML = "SAVE";

            document.querySelectorAll('.info-card').forEach(card => {
                if (card.id !== "MassCard") {
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
                }
            });
            // i couldve just done materialsID.length - 1    :/
            // (i just realized)
            for (let i = 0; i < materialsID.length; i++) {
                const tempCard = document.getElementById(`${materialsID[i]}Card`);
                if (tempCard.id !== "MassCard") {
                    const button = document.createElement('button');
                    button.className = 'action-button';
                    button.textContent = 'Add More Content';
                    button.onclick = addCardContent;
                    tempCard.appendChild(button);
                }
            }
        }
        else {
            editMode = false;
            document.getElementById("editBtn").innerHTML = "EDIT";
            for (const key in arrays) {
                arrays[key] = [];
            }
            document.querySelectorAll('.info-card').forEach(card => {
                if (card.id !== "MassCard") {
                    const cardId = card.id.toLowerCase().replace("card", "");
                    const inputs = card.querySelectorAll('input');
                    inputs.forEach((input) => {
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
            console.log(arrays);

            for (let i = 0; i < materialsID.length; i++) {
                const infoCard = document.getElementById(`${materialsID[i]}Card`);
                if (infoCard.id !== "MassCard") {
                    const children = infoCard.children;
                    infoCard.removeChild(children[children.length - 1]);
                }
            }
            updateDB(arrays.ingredientsArray, arrays.ingredientsDescArray, arrays.weightArray, arrays.weightDescArray, arrays.concentrationArray, arrays.concentrationDescArray);
        }
    }
    else {
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error";
        document.getElementById("modalTitle").style.color = "red";
        document.getElementById("modalBody").textContent = "Please select a Buffer to edit.";
    }
}

async function updateDB(ingredient, ingredientD, weight ,weightD, concentration, concentrationD) {
    const mainRef = db
        .collection("Buffer")
        .doc("NewExperiment")
        .collection("Buffer")
        .doc(currentBuffer)
        .collection("Ingredients");

    const snapshot = await mainRef.get();
    const deletePromises = [];
    snapshot.forEach(doc => {
        deletePromises.push(mainRef.doc(doc.id).delete());
    });
    await Promise.all(deletePromises);
    console.log("All existing Buffer documents deleted.");

    const addPromises = [];
    for (let i = 0; i < ingredient.length; i++) {
        const docData = {
            Batch: ingredientD[i],
            Concentration: concentration[i],
            ConcentrationDesc: concentrationD[i],
            Weight: weight[i],
            WeightDesc: weightD[i],
        };
        console.log(docData);
        addPromises.push(mainRef.doc(ingredient[i]).set(docData));
    }
    await Promise.all(addPromises);
    console.log("New Buffer documents added.");
    document.getElementById("successModal").style.display = "block";
    document.getElementById("modalTitle").textContent = "Edit saved successfully to the Database";
    document.getElementById("modalTitle").style.color = "green"
    document.getElementById("modalBody").textContent = "This change will now be reflected in this Buffer template.";
    calculate();
}

function addCardContent() {
    for (let i = 0; i < materialsID.length; i++) {
        const cardId = `${materialsID[i]}Card`;
        if (cardId !== "MassCard") {
            const infoCard = document.getElementById(cardId);
            const children = infoCard.children;
            if (children[children.length - 1]?.classList.contains('action-button')) {
                infoCard.removeChild(children[children.length - 1]);
            }

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
                input.style.gap = "4px";
                input.setAttribute('data-card', cardId);
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
