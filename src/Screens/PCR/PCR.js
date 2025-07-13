const db = firebase.firestore();
let batchNumber = "";

let editMode = false;
let createMode = false;

let employees = []
let employeeCheck = []
let employeeUsed = [];

let currentProjectID = "Choose First";
let reactionVolumeArray = []
let reactionDescArray = []
let toAddArray = []
let toAddDescArray = []
let addedArray = []
let volumesCheck = []
let itemCheck = false;
let numTubes = document.getElementById("numTubes").value;

let materialsID = ["Reagants", "ReactionVolume", "Volume", "Added"]
let reagantsArray = [];
let reagantsDescArray = [];

employees = ["PH", "SG", "KT", "CL"]

let fillArray = [];
let numInputs = 0;

fetchAndFill(db.collection("PCR").doc("NewExperiment").collection("ProjectName"), false);
document.getElementById("successModal").style.display = "none";
document.getElementById("itemNameC").style.border = "3px double red";
document.getElementById("itemNameC").style.padding = "5px";

function selectedOption(idName) {
    if (document.getElementById(idName).selectedIndex === 0) {
        document.getElementById("ProjectNameC").style.border = "3px double red";
        document.getElementById("ProjectNameC").style.padding = "5px";
        currentProjectID = "Choose First";
        fillBatchNumber(currentProjectID);
    }
    else {
        document.getElementById("ProjectNameC").style.border = "";
        document.getElementById("ProjectNameC").style.padding = "";
        for (let i = 0; i < materialsID.length; i++) {
            let children = document.getElementById(materialsID[i] + "Card").children;
            for (let j = children.length - 1; j >= 0; j--) {
                if (!children[j].classList.contains('info-name') && !children[j].classList.contains('info-divider')) {
                    document.getElementById(materialsID[i] + "Card").removeChild(children[j]);
                }
            }
        }
        reagantsArray = [];
        reagantsDescArray = [];
        currentProjectID = document.getElementById(idName).options[document.getElementById(idName).selectedIndex].text;
        fetchAndFill(db.collection("PCR").doc("NewExperiment").collection("ProjectName").doc(currentProjectID).collection(materialsID[0]), true);
        fillBatchNumber(currentProjectID);
    }
}

function inputItem() {
    if (document.getElementById("itemName").value !== "") {
        document.getElementById("itemNameC").style.border = "";
        document.getElementById("itemNameC").style.padding = "";
        itemCheck = true;
    }
    else {
        itemCheck = false;
        document.getElementById("itemNameC").style.border = "3px double red";
        document.getElementById("itemNameC").style.padding = "5px";
    }
}

function fetchAndFill(path, getData) {
    fillArray = [];
    if (getData) {
        path.get().then((querySnapshot) => {
            const promises = [];
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id);
                reagantsArray.push(doc.id);
                const promise = fetchAndFillData(path.doc(doc.id));
                promises.push(promise);
            });
            Promise.all(promises).then(() => {
                fillMaterials(materialsID[0] + "Card", fillArray, "Batch Number");
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
            fill("ProjectName", fillArray);
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
}

function calculate() {
    numTubes = document.getElementById("numTubes").value;
    console.log(reactionVolumeArray);
    newVolArray = [];
    for(let i = 0; i<reactionVolumeArray.length; i++) {
        newVolArray[i] = reactionVolumeArray[i] * numTubes;
    }
    console.log(newVolArray);
    fillMaterials("VolumeCard", newVolArray, "Volume to add");
}

function fetchAndFillData(path) {
    return path.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            reactionVolumeArray.push(docSnapshot.data()["Reaction Volume"]);

            const XtextDiv = document.createElement('div');
            const XdescDiv = document.createElement('div');
            XtextDiv.className = 'info-text';
            XtextDiv.textContent = docSnapshot.data()["Reaction Volume"];
            XdescDiv.className = 'info-description';
            XdescDiv.textContent = docSnapshot.data()["Reaction VolumeDesc"];
            reactionDescArray.push(docSnapshot.data()["Reaction VolumeDesc"]);
            document.getElementById(materialsID[1] + "Card").appendChild(XtextDiv);
            document.getElementById(materialsID[1] + "Card").appendChild(XdescDiv);

            const X1textDiv = document.createElement('div');
            const X1descDiv = document.createElement('div');
            X1textDiv.className = 'info-text';
            X1textDiv.textContent = (docSnapshot.data()["Reaction Volume"] * numTubes).toString();
            toAddArray.push(docSnapshot.data()["Reaction Volume"]);
            X1descDiv.className = 'info-description';
            X1descDiv.textContent = "Volume to add";
            toAddDescArray.push("Volume to add");
            document.getElementById(materialsID[2] + "Card").appendChild(X1textDiv);
            document.getElementById(materialsID[2] + "Card").appendChild(X1descDiv);

            const X2input = document.createElement('input');
            X2input.className = 'volume-input';
            X2input.type = 'text';
            X2input.id = "VolInput" + numInputs;
            X2input.oninput = () => InputChanged(X2input.id);
            numInputs++;
            console.log("N: ", numInputs);
            document.getElementById(materialsID[3] + "Card").appendChild(X2input);
            document.getElementById(X2input.id).style.border = "3px double red";
            document.getElementById(X2input.id).style.padding = "5px";
            volumesCheck.push(false)
            addedArray.push('')
        } else {
            console.warn("No such document exists.");
        }
    }).catch((error) => {
        console.error("Error fetching document:", error);
    });
}

function InputChanged(idName) {
    const index = parseInt(idName.slice(8), 10);
    addedArray[index] = document.getElementById(idName).value;
    volumesCheck[index] = document.getElementById(idName).value !== '';
    if (document.getElementById(idName).value === '') {
        document.getElementById(idName).style.border = "3px double red";
        document.getElementById(idName).style.padding = "5px";
    }
    else {
        document.getElementById(idName).style.border = "";
        document.getElementById(idName).style.padding = "";
    }
    console.log(addedArray);
}

async function openThermoModal() {
    document.getElementById('thermoModal').style.display = 'block';
}

function closeThermoModal() {
    document.getElementById('thermoModal').style.display = 'none';
}


async function fillMaterials(cardId, content, descContent) {
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
        descDiv.textContent = reactionDescArray[i];

        infoCard.appendChild(textDiv);
        infoCard.appendChild(descDiv);
    }
    document.getElementById("thermoTable").querySelector("tbody").innerHTML = ""
    const tableBody = document.getElementById("thermoTable").querySelector("tbody");

    const thermocyclerRef = db
        .collection("PCR")
        .doc("NewExperiment")
        .collection("ProjectName")
        .doc(currentProjectID)
        .collection("Thermocycler");

    try {
        const snapshot = await thermocyclerRef.get();
        snapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            const tempCell = document.createElement("td");
            tempCell.textContent = data["Temperature"] + " ˚F";

            const timeCell = document.createElement("td");
            timeCell.textContent = data["Time"];

            row.appendChild(tempCell);
            row.appendChild(timeCell);

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error fetching thermocycler data:", error);
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
    batchNumber = "PCR" + "-" + currentProjectID + "."  + (month) + (day) + (d.getFullYear()) + ".";
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
    fillBatchNumber(currentProjectID);
}

function upload() {
    let safeToUpload = true;
    if (document.getElementById("ProjectName").selectedIndex === 0) {
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
    else if (!itemCheck) {
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error: Missing Item Text";
        document.getElementById("modalTitle").style.color = "red"
        document.getElementById("modalBody").textContent = "Please type in the Item field of this experiment.";
    }
    else if (volumesCheck.includes(false)) {
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error: Missing Volume added";
        document.getElementById("modalTitle").style.color = "red"
        document.getElementById("modalBody").textContent = "Please fill all Volumes added.";
    }
    else {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        console.log(reactionVolumeArray);
        console.log(toAddArray)
        console.log(addedArray);
        const d = new Date();
        let month = months[d.getMonth()];
        console.log(d.getFullYear())
        const path = db.collection("PCR")
            .doc(d.getFullYear().toString())
            .collection(month)
            .doc(batchNumber.toString());
        console.log(path);
        const newData = {};

        for (let i = 0; i < reagantsArray.length; i++) {
            const name = reagantsArray[i];
            newData[name] = {
                "Single Reaction Volume": reactionVolumeArray[i],
                "Volume to Add": toAddArray[i],
                "Volume Added": addedArray[i],
            };
        }
        newData["Item Description"] = document.getElementById("itemName").value;
        newData["# of Tubes"] = document.getElementById("numTubes").value
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

function createNew() {
    const arrays = {
        reagantsArray: [],
        reagantsDescArray: [],
        reactionvolumeArray: [],
        reactionvolumeDescArray: [],
    };
    if (!createMode) {
        createMode = true;

        // clear dropdowns
        let options = document.getElementById("ProjectName");
        for (let i = options.options.length - 1; i >= 0; i--) {
            options.remove(i);
        }
        let newOption = document.createElement("option");
        options.options.add(newOption);

        let infoCard;
        for (let i = 0; i < materialsID.length - 2; i++) {
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
            if (select.id === "ProjectName") {
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
        let safeToCreate = true;
        if (document.getElementById("ProjectName").value !== "" && document.getElementById("ProjectName").value !== null) {
            safeToCreate = true;
            document.getElementById("ProjectNameC").style.border = "";
            document.getElementById("ProjectNameC").style.padding = "";
        } else {
            safeToCreate = false;
            document.getElementById("ProjectNameC").style.border = "3px double red";
            document.getElementById("ProjectNameC").style.padding = "5px";
        }
        if (document.getElementById("itemName").value !== "" && document.getElementById("itemName").value !== null) {
            safeToCreate = true;
            document.getElementById("itemNameC").style.border = "";
            document.getElementById("itemNameC").style.padding = "";
        } else {
            safeToCreate = false;
            document.getElementById("itemNameC").style.border = "3px double red";
            document.getElementById("itemNameC").style.padding = "5px";
        }
        if (safeToCreate) {
            createMode = false;
            document.getElementById("createBtn").innerHTML = "CREATE NEW";
            for (let i = 0; i < materialsID.length - 2; i++) {
                infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const children = infoCard.children;
                infoCard.removeChild(children[children.length - 1]);
            }
            for (const key in arrays) {
                arrays[key] = [];
            }
            document.querySelectorAll('.info-card').forEach(card => {
                if (card.id !== "VolumeCard" && card.id !== "AddedCard") {
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
                if (select.id === "ProjectName") {
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
            currentProjectID = document.getElementById("ProjectName").value;
            console.log(arrays)
            db.collection("PCR")
                .doc("NewExperiment")
                .collection("ProjectName")
                .doc(currentProjectID)
                .set({createdAt: firebase.firestore.FieldValue.serverTimestamp()})
                .then(() => {
                    console.log("current doc now initialized");
                });
            for(let i = 0; i < arrays.reagantsArray.length; i++) {
                let docRef = db.collection("PCR")
                    .doc("NewExperiment")
                    .collection("ProjectName")
                    .doc(currentProjectID)
                    .collection("Reagants")
                    .doc(arrays.reagantsArray[i])

                docRef.set({
                    "Reaction Volume": arrays.reactionvolumeArray[i],
                    "Reaction VolumeDesc": arrays.reactionvolumeDescArray[i],
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
            fetchAndFill(db.collection("PCR").doc("NewExperiment").collection("ProjectName"), false);
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
        reagantsArray: [],
        reagantsDescArray: [],
        reactionvolumeArray: [],
        reactionvolumeDescArray: [],
    };
    if (currentProjectID !== "Choose First") {
        if (!editMode) {
            editMode = true;
            document.getElementById("editBtn").innerHTML = "SAVE";
            document.querySelectorAll('.info-card').forEach(card => {
                if (card.id === 'ReagantsCard' || card.id === 'ReactionVolumeCard') {
                    card.querySelectorAll('.info-text, .info-description').forEach((div, index) => {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.value = div.textContent;
                        input.setAttribute('data-type', div.classList.contains('info-text') ? 'text' : 'desc');
                        input.style.border = "2px solid green";
                        input.style.fontSize = "15px";
                        input.style.marginBottom = "4px";
                        const field = card.id;
                        input.setAttribute('data-card', field);
                        div.replaceWith(input);
                    });
                }
                else {
                    document.getElementById(card.id).disabled = true;
                }
            });
            for(let i = 0; i < materialsID.length - 2; i++) {
                let tempCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const button = document.createElement('button');
                button.className = 'action-button'; // Optional: style class
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
            for(let i = 0; i < materialsID.length - 2; i++) {
                infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const children = infoCard.children;
                infoCard.removeChild(children[children.length - 1]);
            }
            updateDB(arrays.reagantsArray, arrays.reagantsDescArray, arrays.reactionvolumeArray, arrays.reactionvolumeDescArray);
        }
    }
    else {
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error";
        document.getElementById("modalTitle").style.color = "red";
        document.getElementById("modalBody").textContent = "Please select a Working Stock to edit.";
    }
}

async function updateDB(reagant, reagantD, reactionV ,reactionVD) {
    const mainRef = db
        .collection("PCR")
        .doc("NewExperiment")
        .collection("ProjectName")
        .doc(currentProjectID)
        .collection("Reagants");

    const snapshot = await mainRef.get();
    const deletePromises = [];
    snapshot.forEach(doc => {
        deletePromises.push(mainRef.doc(doc.id).delete());
    });
    await Promise.all(deletePromises);
    console.log("All existing PCR documents deleted.");

    const addPromises = [];
    for (let i = 0; i < reagant.length; i++) {
        const docData = {
            "Reaction Volume": reactionV[i],
            "Reaction VolumeDesc": reactionVD[i],
        };
        console.log(docData);
        addPromises.push(mainRef.doc(reagant[i]).set(docData));
    }
    await Promise.all(addPromises);
    console.log("New PCR documents added.");
    document.getElementById("successModal").style.display = "block";
    document.getElementById("modalTitle").textContent = "Edit saved successfully to the Database";
    document.getElementById("modalTitle").style.color = "green"
    document.getElementById("modalBody").textContent = "This change will now be reflected in this PCR template.";
}

function addCardContent() {
    for (let i = 0; i < materialsID.length; i++) {
        const infoCard = document.querySelector(`#${materialsID[i]}Card`);
        const children = infoCard.children;

        if (children.length > 0 && children[children.length - 1].classList.contains('action-button')) {
            infoCard.removeChild(children[children.length - 1]);
        }

        if (infoCard.id === 'ReagantsCard' || infoCard.id === 'ReactionVolumeCard') {
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

function submitFeedback() {
    const feedback = document.getElementById("feedbackTextarea").value.trim();
    if (feedback !== "") {
        console.log("Submitted Feedback:", feedback);
        // Add Firebase or server logic here if needed

        closeFeedbackModal(); // Auto-close after submit
        alert("Thank you for your feedback!");
    } else {
        alert("Please enter your feedback before submitting.");
    }
}

function closeModal() {
    document.getElementById("successModal").style.display = "none";
}
