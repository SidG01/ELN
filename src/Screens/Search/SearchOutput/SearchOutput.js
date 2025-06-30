const db = firebase.firestore();

const params = new URLSearchParams(window.location.search);
let selectedYear = params.get("selectedYear");
let selectedMonth = params.get("selectedMonth");
let selectedExperiment = params.get("selectedExperiment");
let selectedSpecifics = params.get("selectedSpecifics");
let selectedEmployee = params.get("selectedEmployee");
let selectedDate = params.get("selectedDate");
let employees = []
employees = ["PH", "SG", "KT", "CL"]

let searchCritera = [false, false, false, false];
let experimentNames = [];
let searchNames = ["experiment", "specifics", "employee", "date"];
let layer = 0;
let specificID = "";
let currentExperiment = "";
let fillArray = [];
let currentSpecifics = "";
let currentEmployee = "";
let currentDate = "";
let currentYear = new Date().getFullYear() - 1;

document.getElementById("successModal").style.display = "none";
runSearchAfterFill();
async function runSearchAfterFill() {
    await fetchAndFill(db.collection("Experiments"), false);
    selectedYear = null;
    selectedMonth = null;
    searchQuerry(selectedYear, selectedMonth, selectedExperiment, selectedSpecifics, selectedEmployee, selectedDate);
}

console.log(selectedMonth); // Logs: 2025
console.log(selectedYear);
console.log(selectedExperiment);
if (selectedExperiment === null) {
    console.log("yes")
}

function searchQuerry(YEAR, MONTH, EXPERIMENT, SPECIFICS, EMPLOYEE, DATE, ) {
    const binary = [
        YEAR != null ? 1 : 0,
        MONTH != null ? 1 : 0,
        EXPERIMENT != null ? 1 : 0,
        SPECIFICS != null ? 1 : 0,
        EMPLOYEE != null ? 1 : 0,
        DATE != null ? 1 : 0,
    ];

    const comboKey = binary.join(''); // e.g., "110011"

    switch (comboKey) {
        case '110000':
            console.log("Only YEAR and MONTH present");
            break;
        case '110001':
            console.log("YEAR, MONTH, DATE present");
            break;
        case '110010':
            console.log("YEAR, MONTH, EMPLOYEE present");
            break;
        case '110011':
            console.log("YEAR, MONTH, EMPLOYEE, DATE present");
            break;
        case '111000':
            console.log("YEAR, MONTH, EXPERIMENT present");
            break;
        case '111001':
            console.log("YEAR, MONTH, EXPERIMENT, DATE present");
            break;
        case '111010':
            console.log("YEAR, MONTH, EXPERIMENT, EMPLOYEE present");
            break;
        case '111011':
            console.log("YEAR, MONTH, EXPERIMENT, EMPLOYEE, DATE present");
            break;
        case '111100':
            console.log("YEAR, MONTH, EXPERIMENT, SPECIFICS present");
            break;
        case '111101':
            console.log("YEAR, MONTH, EXPERIMENT, SPECIFICS, DATE present");
            break;
        case '111110':
            console.log("YEAR, MONTH, EXPERIMENT, SPECIFICS, EMPLOYEE present");
            break;
        case '111111':
            console.log("YEAR, MONTH, EXPERIMENT, SPECIFICS, EMPLOYEE, DATE present");
            break;
        default:
            console.log("Unhandled combination:", comboKey);
    }
}
// const items = document.querySelectorAll('.accordion-item');
//
//             items.forEach(item => {
//                 item.querySelector('.accordion-title').addEventListener('click', () => {
//                     items.forEach(i => i !== item && i.classList.remove('open'));
//                     item.classList.toggle('open');
//                 });
//             });

async function fetchAndFill(path, getData) {
    fillArray = [];
    try {
        if (getData) {
            path.get().then(async (doc) => {
                if (doc.exists) {
                    const data = doc.data();
                    specificID = data.collectionID;
                    console.log(specificID);
                    await fetchAndFill(db.collection(currentExperiment).doc("NewExperiment").collection(specificID), false);
                    // fillArray.push(doc.id);
                    // fill("specifics", fillArray);
                } else {
                    console.log("Document does not exist");
                }
            }).catch((error) => {
                console.error("Error fetching document:", error);
            });
        } else {
            path.get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    fillArray.push(doc.id);
                    experimentNames.push(doc.id);
                });
                fill(searchNames[layer], fillArray);
                layer++;
            }).catch((error) => {
                console.error("Error fetching documents:", error);
            });
        }
    } catch (error) {
        console.error("Error in fetchAndFill: ", error)
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
}

function selectedOption(id, index) {
    if (document.getElementById(id).selectedIndex === 0) {
        searchCritera[index] = false;
    }
    else {
        searchCritera[index] = true;
    }
    if (id === "experiment") {
        layer = 1;
        currentExperiment = document.getElementById(id).value;
        console.log(experimentNames[document.getElementById(id).selectedIndex - 1]);
        fetchAndFill(db.collection("Experiments").doc(experimentNames[document.getElementById(id).selectedIndex - 1]), true).then(r => console.log("ignore this log"));
    } else if (id === "specifics") {
        currentSpecifics = document.getElementById(id).value;
    } else if (id === "employee") {
        currentEmployee = document.getElementById(id).value;
    } else if (id === "date") {
        currentDate = document.getElementById(id).value;
    }
}

function syncScroll(scrolledCard) {
    const cards = document.querySelectorAll('.accordion');
    const scrollLocation = scrolledCard.scrollTop;

    cards.forEach(card => {
        if (card !== scrolledCard) {
            card.scrollTop = scrollLocation;
        }
    });
}
