const db = firebase.firestore();
let batchNumber = "";

let editMode = false;
let createMode = false;

let employees = []
let employeeCheck = []
let employeeUsed = [];

let currentWS = "CHOOSE WORKING STOCK";

let materialsID = ["Prestocks", "Parts", "Volume"]
let prestocksArray = [];
let prestocksDescArray = [];
let partsArray = [];
let partsDescArray = [];
let volumeArray = [];
let volumeDescArray = [];
let tempLength = 0;
let fillCheck = false

// fill with database
employees = ["PH", "SG", "KT", "CL"]

// document.getElementById("workingStockC").style.border = "3px double red";
// document.getElementById("workingStockC").style.padding = "5px";
let fillArray = [];

fetchAndFill(db.collection("WorkingStock").doc("NewExperiment").collection("workingStock"), false);
document.getElementById("successModal").style.display = "none";

function fetchAndFill(path, getData) {
    fillArray = [];
    if (getData) {
        path.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id);
                prestocksArray.push(doc.id);
                fetchAndFillData(path.doc(doc.id));
            });
            fillMaterials("PrestocksCard", fillArray, "Batch Number");
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
    else {
        path.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id);
            });
            fill("workingStock", fillArray);
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
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

function fillBatchNumber(currentWS) {
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
    batchNumber = "WS" + "-" + currentWS + "."  + (month) + (day) + (d.getFullYear()) + ".";
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
    fillBatchNumber(currentWS);
}

function fetchAndFillData(path) {
    path.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            const ParttextDiv = document.createElement('div');
            const PartdescDiv = document.createElement('div');

            ParttextDiv.className = 'info-text';
            ParttextDiv.textContent = data.Parts;
            partsArray.push(data.Parts);
            PartdescDiv.className = 'info-description';
            PartdescDiv.textContent = data.PartsDesc;
            partsDescArray.push(data.PartsDesc);
            document.getElementById("PartsCard").appendChild(ParttextDiv);
            document.getElementById("PartsCard").appendChild(PartdescDiv);

            const VoltextDiv = document.createElement('div');
            const VoldescDiv = document.createElement('div');
            VoltextDiv.className = 'info-text';
            VoltextDiv.textContent = data.Volume;
            volumeArray.push(data.Volume);
            VoldescDiv.className = 'info-description';
            VoldescDiv.textContent = data.VolumeDesc;
            volumeDescArray.push(data.VolumeDesc);
            document.getElementById("VolumeCard").appendChild(VoltextDiv);
            document.getElementById("VolumeCard").appendChild(VoldescDiv);

        } else {
            console.warn("No such document exists.");
        }
    }).catch((error) => {
        console.error("Error fetching document:", error);
    });
}

function selectedOption(idName) {
    if (document.getElementById(idName).selectedIndex === 0) {
        document.getElementById("workingStockC").style.border = "3px double red";
        document.getElementById("workingStockC").style.padding = "5px";
        currentWS = "Choose First";
        fillCheck = false;
        fillBatchNumber(currentWS);
    }
    else {
        fillCheck = true;
        document.getElementById("workingStockC").style.border = "";
        document.getElementById("workingStockC").style.padding = "";
        let children = document.getElementById("PartsCard").children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
                document.getElementById("PartsCard").removeChild(children[i]);
            }
        }
        children = document.getElementById("VolumeCard").children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
                document.getElementById("VolumeCard").removeChild(children[i]);
            }
        }
        partsArray = [];
        partsDescArray = [];
        volumeArray = [];
        volumeDescArray = [];
        prestocksArray = [];
        currentWS = document.getElementById(idName).options[document.getElementById(idName).selectedIndex].text;
        fetchAndFill(db.collection("WorkingStock").doc("NewExperiment").collection("workingStock").doc(currentWS).collection("PreStocks"), true);
        fillBatchNumber(currentWS);
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
        prestocksArray: [],
        partsArray: [],
        partsDescArray: [],
        volumeArray: [],
        volumeDescArray: [],
    };
    if (!createMode) {
        createMode = true;

        // clear dropdowns
        let options = document.getElementById("workingStock");
        for (let i = options.options.length - 1; i >= 0; i--) {
            options.remove(i); // Clear existing options
        }
        let newOption = document.createElement("option");
        options.options.add(newOption);

        let infoCard;
        for (let i = 0; i < materialsID.length; i++) {
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

        const dropdownGroup = document.querySelector('.dropdown-group');
        const selects = dropdownGroup.querySelectorAll('select');

        selects.forEach(select => {
            // Hide the original select
            select.style.display = 'none';

            // Create a container to hold the inputs
            const inputContainer = document.createElement('div');
            inputContainer.className = 'input-container';

            // Create an input for each option
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
        });
    }
    else {
        createMode = false;
        document.getElementById("createBtn").innerHTML = "CREATE NEW";
        for(let i = 0; i < materialsID.length; i++) {
            infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
            const children = infoCard.children;
            infoCard.removeChild(children[children.length - 1]);
        }
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
        const dropdownGroup = document.querySelector('.dropdown-group');
        const selects = dropdownGroup.querySelectorAll('select');

        selects.forEach(select => {
            const inputContainerId = select.dataset.inputContainerId;
            const inputContainer = document.getElementById(inputContainerId);
            const inputs = inputContainer.querySelectorAll('input');

            // Clear current select options
            select.innerHTML = '';

            inputs.forEach(input => {
                const option = document.createElement('option');
                option.text = input.value;
                select.add(option);
            });

            // Remove inputs and show select again
            inputContainer.remove();
            select.style.display = 'inline-block';
        });
        currentWS = document.getElementById("workingStock").value;
        console.log(arrays)
        // const docData = {
        //     Parts: parts[i],
        //     Volume: volumes[i],
        //     PartsDesc: partsD[i],
        //     VolumeDesc: volumesD[i],
        // };
        db.collection("WorkingStock")
            .doc("NewExperiment")
            .collection("workingStock")
            .doc(currentWS) // or your dynamic variable `newPsBase`
            .set({ createdAt: firebase.firestore.FieldValue.serverTimestamp() })
            .then(() => {
                console.log("currentWS now exists with data");
            });
        for(let i = 0; i < arrays.prestocksArray.length; i++) {
            let docRef = db.collection("WorkingStock")
                .doc("NewExperiment")
                .collection("workingStock")
                .doc(currentWS) // or your dynamic variable `newPsBase`
                .collection("PreStocks")
                .doc(arrays.prestocksArray[i])

            docRef.set({
                Parts: arrays.partsArray[i],
                PartsDesc: arrays.partsDescArray[i],
                Volume: arrays.volumeArray[i],
                VolumeDesc: arrays.volumeDescArray[i],
            }).then(() => {
                console.log("Data updated successfully!");
            }).catch((error) => {
                console.error("Error updating Data:", error);
            });
        }
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "New Template Created";
        document.getElementById("modalTitle").style.color = "green"
        document.getElementById("modalBody").textContent = "You can now use this template for future Working Stock entries.";
        fetchAndFill(db.collection("WorkingStock").doc("NewExperiment").collection("workingStock"), false);
    }
}

function addCardContent() {
    let infoCard;

    for(let i = 0; i < materialsID.length; i++) {
        infoCard = document.querySelector(`#${materialsID[i] + "Card"}`);
        const children = infoCard.children;
        if (children[children.length - 1].classList.contains('action-button')) {
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

        const button = document.createElement('button');
        button.className = 'action-button'; // Optional: style class
        button.textContent = 'Add More Content';

        button.onclick = addCardContent;

        infoCard.appendChild(button);
    }

}

function clickedEdit() {
    const arrays = {
        partsArray: [],
        partsDescArray: [],
        volumeArray: [],
        volumeDescArray: [],
        prestocksArray: []
    };
    if (currentWS !== "CHOOSE WORKING STOCK") {
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
                    tempLength+= 0.5;
                });
            });
            for(let i = 0; i < materialsID.length; i++) {
                let tempCard = document.querySelector(`#${materialsID[i] + "Card"}`);
                const button = document.createElement('button');
                button.className = 'action-button'; // Optional: style class
                button.textContent = 'Add More Content';

                button.onclick = addCardContent;

                tempCard.appendChild(button);
            }

            console.log(tempLength / 3)
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
            updatePreStocks(arrays.prestocksArray, arrays.partsArray, arrays.partsDescArray, arrays.volumeArray, arrays.volumeDescArray);
        }
    }
    else {
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Error";
        document.getElementById("modalTitle").style.color = "red";
        document.getElementById("modalBody").textContent = "Please select a Working Stock to edit.";
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
        const path = db.collection("WorkingStock")
            .doc(d.getFullYear().toString())
            .collection(month)
            .doc(batchNumber.toString());
        console.log(path);
        const newData = {};

        for (let i = 0; i < prestocksArray.length; i++) {
            newData[prestocksArray[i]] = {
                Parts: partsArray[i],
                Volume: volumeArray[i],

            };
        }
        newData.TargetVolume = document.getElementById("TargetVol").value
        newData.TotalWSVol = document.getElementById("TotalVol").value
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

function closeModal() {
    document.getElementById("successModal").style.display = "none";
}

async function updatePreStocks(names, parts, partsD ,volumes, volumesD) {
    const preStocksRef = db
        .collection("WorkingStock")
        .doc("NewExperiment")
        .collection("workingStock")
        .doc(currentWS)
        .collection("PreStocks");

    // 1. Get and delete all existing documents
    const snapshot = await preStocksRef.get();
    const deletePromises = [];

    snapshot.forEach(doc => {
        deletePromises.push(preStocksRef.doc(doc.id).delete());
    });

    await Promise.all(deletePromises);
    console.log("All existing PreStocks documents deleted.");

    // 2. Add new documents
    const addPromises = [];

    for (let i = 0; i < names.length; i++) {
        const docData = {
            Parts: parts[i],
            Volume: volumes[i],
            PartsDesc: partsD[i],
            VolumeDesc: volumesD[i],
        };
        console.log(docData);
        addPromises.push(preStocksRef.doc(names[i]).set(docData));
    }

    await Promise.all(addPromises);
    console.log("New PreStocks documents added.");
    document.getElementById("successModal").style.display = "block";
    document.getElementById("modalTitle").textContent = "Edit saved successfully to the Database";
    document.getElementById("modalTitle").style.color = "green"
    document.getElementById("modalBody").textContent = "This change will now be reflected in this Working Stock template.";
}
