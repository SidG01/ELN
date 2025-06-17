
const db = firebase.firestore();

let currentPsName = "default";
let currentPsBase = "";
let currentWorkingStock = "";
let currentPsShort = "";
// let time = Timestamp()
let batchNumber = "";

let editMode = false;

let fillArray = []
let employees = []
let employeeCheck = []
let employeeUsed = [];

let plateArray = [];
let plateDescArray = [];
let fromArray = [];
let fromDescArray = [];
let toArray = [];
let toDescArray = [];
let numOligos = 0;

// filled with databse
employees = ["PH", "SG", "KT", "CL"]
employeeCheck = [false, false, false, false]
let fillContext = ["psBase", "workingStock", "psName","psShort"];
let materialsID = ["Plate", "From", "To"];
let initialContext = ["Choose First", "Choose Project Base", "Choose Working Stock", "Choose Working Stock"]
let fillCheck = [];

for (let i = 0; i < fillContext.length; i++) {
    fillCheck.push(false);
    document.getElementById(fillContext[i] + "C").style.border = "3px double red";
    document.getElementById(fillContext[i] + "C").style.padding = "5px";
}

function fetchAndFill(path, index, getData) {
    fillArray = [];
    if (getData) {
        path.then((docSnapshot) => {
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                for (let i = 0; i < materialsID.length; i++) {
                    let mainText = []
                    let descText = []
                    if (Array.isArray(data[materialsID[i]])) {
                        mainText = [...data[materialsID[i]]];

                    }
                    if (Array.isArray(data[(materialsID[i]) + "Desc"])) {
                        descText = [...data[(materialsID[i]) + "Desc"]];
                    }
                    if (i === 0) {
                        plateArray = [...mainText];
                        plateDescArray = [...descText];
                    }
                    if (i === 1) {
                        fromArray = [...mainText];
                        fromDescArray = [...descText];
                    }
                    if (i === 0) {
                        toArray = [...mainText];
                        toDescArray = [...descText];
                    }
                    fillMaterials((materialsID[i] + "Card"), mainText, descText);
                }
                document.getElementById("oligos").value = data.Oligos;
                numOligos = data.Oligos;
                document.getElementById("notes").value = data.Notes;
                changedVolume();
            } else {
                console.warn("No such document exists.");
            }
        }).catch((error) => {
            console.error("Error fetching document:", error);
        });
    }
    else {
        path.then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id); // or doc.data()
            });
            fill(fillContext[index], fillArray, true);
            if (index === 2) {
                index = 0;
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[3]).get(),3, false);
            }
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
}

// Start the process with first selection
fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).get(),0, false);
document.getElementById("successModal").style.display = "none";

// fills employeeUsed with all employees that are selected
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
    fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
}

// gets data based off selected options
function selectedOption(id) {
    var option = document.getElementById(id);
    var index = option.selectedIndex;
    switch(id) {
        // new selection
        case "psBase":
            if (currentPsBase !== option.options[index].text && changeSelection(document.getElementById(id), 0)) {
                currentPsBase = option.options[index].text;
                currentPsShort = "Choose Here";
                currentPsName = "Choose Here";
                currentPsShort = "Choose Here";
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).get(),1, false);
                console.log(fillCheck);
                fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            }
            break;
        case "workingStock":
            if (currentWorkingStock !== option.options[index].text && changeSelection(document.getElementById(id), 1)) {
                currentWorkingStock = option.options[index].text;
                currentPsName = "Choose Here";
                currentPsShort = "Choose Here";
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[2]).get(),2, false);
                console.log(fillCheck);
                fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            }
            break;
        case "psName":
            if (currentPsName !== option.options[index].text && changeSelection(document.getElementById(id), 2)) {
                currentPsName = option.options[index].text;
                currentPsShort = document.getElementById("psShort").options[index].text;
                document.getElementById("psShort").selectedIndex = index;
                document.getElementById("psShortC").style.border = "";
                document.getElementById("psShortC").style.padding = "";
                fillCheck[2] = true;
                fillCheck[3] = true;
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[3]).doc(currentPsShort).get()
                    ,2, true);
            }
            else {
                document.getElementById("psShort").selectedIndex = index;
                document.getElementById("psShortC").style.border = "3px double red";
                document.getElementById("psShortC").style.padding = "5px";
                fillCheck[2] = false;
                fillCheck[3] = false;
            }
            fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            console.log(fillCheck);
            break;
        case "psShort":
            if (currentPsShort !== option.options[index].text && changeSelection(document.getElementById(id), 3)) {
                currentPsShort = option.options[index].text;
                currentPsName = document.getElementById("psName").options[index].text;
                // fillCheck[2] = true;
                document.getElementById("psName").selectedIndex = index;
                document.getElementById("psNameC").style.border = "";
                document.getElementById("psNameC").style.padding = "";
                fillCheck[2] = true;
                fillCheck[3] = true;
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                        .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[3]).doc(currentPsShort).get()
                    ,2, true);
            }
            else {
                document.getElementById("psName").selectedIndex = index;
                document.getElementById("psNameC").style.border = "3px double red";
                document.getElementById("psNameC").style.padding = "5px";
                fillCheck[2] = false;
                fillCheck[3] = false;
            }
            fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            console.log(fillCheck);
            break;
        default:
        // code block
    }
}

function changeSelection(option, checkIndex) {
    // resets options after a selection is made
    for (let i = checkIndex+1; i < fillCheck.length-1; i++) {
        fillCheck[i] = false;
        document.getElementById(fillContext[i]).selectedIndex = 0;
        document.getElementById(fillContext[checkIndex+1] + "C").style.border = "3px double red";
        document.getElementById(fillContext[checkIndex+1] + "C").style.padding = "5px";
    }
    // clears plate from to
    for(let i = 0; i < materialsID.length; i++) {
        const infoCard = document.querySelector(`#${(materialsID[i] + "Card")}`);
        const children = infoCard.children;
        for (let i = children.length - 1; i >= 0; i--) {
            if (!children[i].classList.contains('info-name') && !children[i].classList.contains('info-divider')) {
                infoCard.removeChild(children[i]);
            }
        }
    }

    fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);

    // checks if the selection is valid
    var container = document.getElementById(fillContext[checkIndex] + "C");
    let safeToQuery = false;
    if (option.options[option.selectedIndex].text.substring(0, 6) === "Choose") {
        container.style.border = "3px double red";
        container.style.padding = "5px";
        safeToQuery = false;
        return safeToQuery;
    }
    else {
        if (checkIndex === 2 || checkIndex === 3) {
            fillCheck[2] = true;
            fillCheck[3] = true;
        }
        fillCheck[checkIndex] = true;
        container.style.border = "";
        container.style.padding = "";
        safeToQuery = true;
        return safeToQuery;
    }
}

// fills the batch number based on the current selections
function fillBatchNumber(psN, psB, WS, psS) {
    // where does PSC come from?
    const d = new Date();
    const day = d.getDate();
    batchNumber = WS + "-" + "PSC" + "-" + psS + "-" + d.getDate() + "/" + (d.getMonth()) + "/" + d.getFullYear();
    for (let i = 0; i < employeeUsed.length; i++) {
        batchNumber += employeeUsed[i]
    }
    let container = document.getElementById("batchNumber");
    container.value = batchNumber;
    container.style.width = ((container.value.length + 1) * 10) + 'px';
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

function fillMaterials(cardId, content, description) {
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
        descDiv.textContent = description[i];

        infoCard.appendChild(textDiv);
        infoCard.appendChild(descDiv);
    }
}

function clickedEdit() {
    const arrays = {
        plateArray: [],
        plateDescArray: [],
        fromArray: [],
        fromDescArray: [],
        toArray: [],
        toDescArray: []
    };
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

        document.getElementById("oligos").style.border = "2px solid green";

        // const dropdownGroup = document.querySelector('.dropdown-group');
        // const selects = dropdownGroup.querySelectorAll('select');
        //
        // selects.forEach(select => {
        //     // Hide the original select
        //     select.style.display = 'none';
        //
        //     // Create a container to hold the inputs
        //     const inputContainer = document.createElement('div');
        //     inputContainer.className = 'input-container';
        //
        //     // Create an input for each option
        //     Array.from(select.options).forEach(option => {
        //         const input = document.createElement('input');
        //         input.type = 'text';
        //         input.value = option.text;
        //         input.className = 'option-edit';
        //         inputContainer.appendChild(input);
        //     });
        //
        //     // Store reference on the select for later access
        //     select.dataset.inputContainerId = `inputs-${select.id}`;
        //     inputContainer.id = select.dataset.inputContainerId;
        //
        //     // Insert input container after the select
        //     select.parentNode.appendChild(inputContainer);
        // });
    }
    else {
        editMode = false;
        document.getElementById("editBtn").innerHTML = "EDIT";
        document.getElementById("oligos").style.border = "";
        numOligos = parseInt(document.getElementById("oligos").value, 10);
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

        let firebaseIDLink = {
            plateArray: "Plate",
            plateDescArray: "PlateDesc",
            fromArray: "From",
            fromDescArray: "FromDesc",
            toArray: "To",
            toDescArray: "ToDesc",
        };
        let newDatabaseData = {};

        for (const tempArrayName in firebaseIDLink) {
            newDatabaseData[firebaseIDLink[tempArrayName]] = arrays[tempArrayName];
        }
        const docRef = db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
            .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[3]).doc(currentPsShort);
        docRef.set(newDatabaseData, { merge: true })
            .then(() => {
                console.log("Data saved successfully to Firebase");
            })
            .catch((error) => {
                console.error("Error saving to Firebase:", error);
                displayTitle = "Error saving to Firebase:"
                displayBody = error
            });
        docRef.update({
            Oligos: numOligos,
        }).then(() => {
            console.log("Oligos updated successfully!");
        }).catch((error) => {
            console.error("Error updating Oligos:", error);
        });
        document.getElementById("successModal").style.display = "block";
        document.getElementById("modalTitle").textContent = "Data saved successfully to the Database";
        document.getElementById("modalBody").textContent = "Navigate through history in the nav bar OR search using the provided options";

        // const dropdownGroup = document.querySelector('.dropdown-group');
        // const selects = dropdownGroup.querySelectorAll('select');
        //
        // selects.forEach(select => {
        //     const inputContainerId = select.dataset.inputContainerId;
        //     const inputContainer = document.getElementById(inputContainerId);
        //     const inputs = inputContainer.querySelectorAll('input');
        //
        //     // Clear current select options
        //     select.innerHTML = '';
        //
        //     inputs.forEach(input => {
        //         const option = document.createElement('option');
        //         option.text = input.value;
        //         select.add(option);
        //     });
        //
        //     // Remove inputs and show select again
        //     inputContainer.remove();
        //     select.style.display = 'inline-block';
        // });
    }
}

function changedVolume() {
    document.getElementById("Vwell").value = document.getElementById("Vtarget").value * (0.4) * (1/200);
    document.getElementById("Vtotal").value = document.getElementById("Vwell").value * (numOligos);
}

function closeModal() {
    document.getElementById("successModal").style.display = "none";
}



