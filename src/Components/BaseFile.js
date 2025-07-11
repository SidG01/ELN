const db = firebase.firestore();
let batchNumber = "";

let editMode = false;
let createMode = false;

let employees = []
let employeeCheck = []
let employeeUsed = [];

let currentX = "Choose First"
let materialsID = ["X"]
let XArray = [];
let XDescArray = [];

employees = ["PH", "SG", "KT", "CL"]

let fillArray = [];

fetchAndFill(db.collection("X").doc("NewExperiment").collection("X"), false);
document.getElementById("successModal").style.display = "none";

function selectedOption(idName) {
    if (document.getElementById(idName).selectedIndex === 0) {
        document.getElementById("XC").style.border = "3px double red";
        document.getElementById("XC").style.padding = "5px";
        currentX = "Choose First";
        fillBatchNumber(currentX);
    }
    else {
        document.getElementById("XC").style.border = "";
        document.getElementById("XC").style.padding = "";
        for (let i = 0; i < materialsID.length; i++) {
            let children = document.getElementById(materialsID[i] + "Card").children;
            for (let j = children.length - 1; j >= 0; j--) {
                if (!children[j].classList.contains('info-name') && !children[j].classList.contains('info-divider')) {
                    document.getElementById(materialsID[i] + "Card").removeChild(children[j]);
                }
            }
        }
        XArray = [];
        XDescArray = [];
        currentX = document.getElementById(idName).options[document.getElementById(idName).selectedIndex].text;
        fetchAndFill(db.collection("X").doc("NewExperiment").collection("X").doc(currentX).collection(materialsID[0]), true);
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
                XArray.push(doc.id);
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
            fill("X", fillArray);
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
}

function fetchAndFillData(path) {
    return path.get().then((docSnapshot) => {
        if (docSnapshot.exists) {
            const data = docSnapshot.data();
            XDescArray.push(data.X);

            const XtextDiv = document.createElement('div');
            const XdescDiv = document.createElement('div');
            XtextDiv.className = 'info-text';
            XtextDiv.textContent = data.X;
            XArray.push(data.X);
            XdescDiv.className = 'info-description';
            XdescDiv.textContent = data.X;
            XDescArray.push(data.X);
            document.getElementById(materialsID[1] + "Card").appendChild(XtextDiv);
            document.getElementById(materialsID[1] + "Card").appendChild(XdescDiv);

            const X1textDiv = document.createElement('div');
            const X1descDiv = document.createElement('div');
            XtextDiv.className = 'info-text';
            XtextDiv.textContent = data.X;
            XArray.push(data.X);
            XdescDiv.className = 'info-description';
            XdescDiv.textContent = data.X;
            XDescArray.push(data.X);
            document.getElementById(materialsID[1] + "Card").appendChild(XtextDiv);
            document.getElementById(materialsID[1] + "Card").appendChild(XdescDiv);
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
        descDiv.textContent = xDescArray[i];

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
    fillBatchNumber(currentX);
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

        const d = new Date();
        let month = months[d.getMonth()];
        console.log(d.getFullYear())
        const path = db.collection("PCR")
            .doc(d.getFullYear().toString())
            .collection(month)
            .doc(batchNumber.toString());
        console.log(path);
        const newData = {};

        for (let i = 0; i < reagantsAray.length; i++) {
            const name = reagantsAray[i];
            newData[name] = {
                "Single Reaction Volume": reactionVolArray[i],
                "Volume to Add": volumeArray[i],
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

//edit
async function updateDB(ingredient, ingredientD, weight ,weightD, concentration, concentrationD) {
    const mainRef = db
        .collection("X")
        .doc("NewExperiment")
        .collection("X")
        .doc(X)
        .collection("X");

    const snapshot = await mainRef.get();
    const deletePromises = [];
    snapshot.forEach(doc => {
        deletePromises.push(mainRef.doc(doc.id).delete());
    });
    await Promise.all(deletePromises);
    console.log("All existing X documents deleted.");

    const addPromises = [];
    for (let i = 0; i < X.length; i++) {
        const docData = {
            X: X[i],
            X: X[i],
            X: X[i],
            X: X[i],
            X: X[i],
        };
        console.log(docData);
        addPromises.push(mainRef.doc(X[i]).set(docData));
    }
    await Promise.all(addPromises);
    console.log("New Buffer documents added.");
    document.getElementById("successModal").style.display = "block";
    document.getElementById("modalTitle").textContent = "Edit saved successfully to the Database";
    document.getElementById("modalTitle").style.color = "green"
    document.getElementById("modalBody").textContent = "This change will now be reflected in this X template.";
}

function addCardContent() {
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
