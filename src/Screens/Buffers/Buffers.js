const db = firebase.firestore();
let batchNumber = "";

let editMode = false;
let createMode = false;

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

function selectedOption(idName) {
    if (document.getElementById(idName).selectedIndex === 0) {
        document.getElementById("bufferC").style.border = "3px double red";
        document.getElementById("bufferC").style.padding = "5px";
        currentWS = "Choose First";
        fillBatchNumber(currentBuffer);
    }
    else {
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
    batchNumber = Value + "-"  + (month) + (day) + (d.getFullYear()) + ".";
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
