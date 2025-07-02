const db = firebase.firestore();

const params = new URLSearchParams(window.location.search);
let selectedYear = parseInt(params.get("selectedYear"), 10);
let selectedMonth = params.get("selectedMonth");
const months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentMonthIndex = months.indexOf(selectedMonth)
let selectedExperiment = params.get("selectedExperiment");
let selectedSpecifics = params.get("selectedSpecifics");
let selectedEmployee = params.get("selectedEmployee");
let selectedDate = params.get("selectedDate");
let employees = []
employees = ["PH", "SG", "KT", "CL"]

let fillArray = []
let searchCritera = [false, false, false, false];
let experimentNames = [];
let searchNames = ["experiment", "specifics", "employee", "date"];
let searchSpecifics = [""]
let layer = 0;
let currentYear = new Date().getFullYear() - 1;

document.getElementById("successModal").style.display = "none";
document.getElementById("feedbackModal").style.display = "none";
document.getElementById("Heading").innerHTML = selectedMonth;
document.getElementById("subHeading").innerHTML = ("All Contents In " + selectedMonth  + " of " + selectedYear);

runSearchAfterFill();
async function runSearchAfterFill() {
    await fetchAndFill(db.collection("Experiments"), false);
    searchQuerry(selectedYear.toString(), selectedMonth, selectedExperiment, selectedSpecifics, selectedEmployee, selectedDate);
}


// console.log(selectedMonth); // Logs: 2025
// console.log(selectedYear);
// console.log(selectedExperiment);
// if (selectedExperiment === null) {
//     console.log("yes")
// }

let accordionLength = 0;
function searchQuerry(YEAR, MONTH, EXPERIMENT, SPECIFICS, EMPLOYEE, DATE) {
    accordionLength = 0;
    const binary = [
        YEAR != null ? 1 : 0,
        MONTH != null ? 1 : 0,
        EXPERIMENT != null ? 1 : 0,
        SPECIFICS != null ? 1 : 0,
        EMPLOYEE != null ? 1 : 0,
        DATE != null ? 1 : 0,
    ];
    const comboKey = binary.join('');
    const accordion = document.querySelector('.accordion');
    if (accordion) {
        accordion.querySelectorAll('.accordion-item').forEach(item => item.remove());
    }
    switch (comboKey) {
        case '110000':
            console.log("Only YEAR and MONTH present");
            const promises = experimentNames.map((name) => {
                const path = db.collection(name).doc(YEAR).collection(MONTH);
                return querryFill(path, name);
            });

            Promise.all(promises).then(() => {
                filter('experiment');
            }).catch((err) => {
                console.error("Error running querryFill:", err);
            });
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

function filter(id) {
    if (document.getElementById(id).selectedIndex === 0) {
        for (let i = 0; i < accordionLength; i++) {
            document.getElementById("accordionItem" + (i + 1)).style.display = "";
        }
    }
    else {
        for (let i = 0; i < accordionLength; i++) {
            const titleElement = document.getElementById("accordionTitle" + (i + 1));
            const extractedTitle = titleElement.textContent.split(/\s+\|\s+/)[0].trim();
            console.log("Full Title:", titleElement.textContent);
            console.log("Extracted Title:", extractedTitle);
            if (extractedTitle !== document.getElementById(id).value) {
                document.getElementById("accordionItem" + (i + 1)).style.display = "none";
            }
            else {
                document.getElementById("accordionItem" + (i + 1)).style.display = "";
            }
        }
    }

}

function selectedOption(id, index) {
    if (document.getElementById(id).selectedIndex === 0) {
        searchCritera[index] = false;
        for (let i = 0; i < accordionLength; i++) {
            document.getElementById("accordionItem" + (i + 1)).style.display = "";
        }
    }
    else {
        searchCritera[index] = true;
        if (id === "experiment") {
            layer = 1;
            currentExperiment = document.getElementById(id).value;
            fetchAndFill(db.collection("Experiments").doc(experimentNames[document.getElementById(id).selectedIndex - 1]), true).then(r => console.log("ignore this log"));
            filter('experiment')
        } else if (id === "specifics") {
            currentSpecifics = document.getElementById(id).value;
        } else if (id === "employee") {
            currentEmployee = document.getElementById(id).value;
        } else if (id === "date") {
            currentDate = document.getElementById(id).value;
        }
    }
}

function querryFill(path, titleContent) {
    return new Promise((resolve, reject) => {
        querryArray = [];

        path.get().then((querySnapshot) => {
            const docs = querySnapshot.docs;
            if (!docs.length) return resolve();

            let pending = docs.length;

            docs.forEach((doc) => {
                querryArray.push(doc.id);
                accordionLength++;

                const accordion = document.querySelector(".accordion");
                if (!accordion) return reject("Accordion container not found");

                const item = document.createElement("div");
                const title = document.createElement("div");
                const content = document.createElement("div");

                item.id = "accordionItem" + accordionLength;
                item.classList.add("accordion-item");
                item.dataset.docId = doc.id;
                title.id = "accordionTitle" + accordionLength;
                title.className = "accordion-title";
                title.textContent = titleContent + "   |   " + doc.id;
                content.className = "accordion-content";
                content.textContent = "Loading...";

                item.append(title, content);
                accordion.appendChild(item);

                title.addEventListener("click", () => {
                    document.querySelectorAll(".accordion-item").forEach((i) => {
                        if (i !== item) i.classList.remove("open");
                    });
                    item.classList.toggle("open");
                });

                path.doc(doc.id).get().then((docSnap) => {
                    if (docSnap.exists) {
                        const data = docSnap.data();
                        const rows = Object.entries(data)
                            .map(([k, v]) => `<tr><td class="key">${k}</td><td>${v}</td></tr>`)
                            .join("");

                        content.innerHTML = `<table class="accordion-table"><tbody>${rows}</tbody></table>`;
                    }
                    if (--pending === 0) resolve(); // All docs done
                }).catch(reject);
            });
        }).catch(reject);
    });
}


function formatValue(value) {
    if (Array.isArray(value)) {
        value.join(", ");
    } else if (typeof value === "object" && value !== null) {
        let inner = "<div class='nested-table'>";
        for (const [k, v] of Object.entries(value)) {
            inner += `
                <div class="nested-row">
                    <span class="nested-key">${k}</span>
                    <span class="nested-value">${formatValue(v)}</span>
                </div>
            `;
        }
        inner += "</div>";
        return inner;
    } else {
        return value;
    }
}

function prevMonth() {
    if (currentMonthIndex === 1) {
        currentMonthIndex = 12;
        selectedYear = selectedYear - 1;
        selectedMonth = months[currentMonthIndex]
    }
    else {
        currentMonthIndex = months.indexOf(selectedMonth) - 1;
        selectedMonth = months[currentMonthIndex];
    }
    searchQuerry(selectedYear.toString(), selectedMonth, selectedExperiment, selectedSpecifics, selectedEmployee, selectedDate);
    document.getElementById("Heading").innerHTML = selectedMonth;
    document.getElementById("subHeading").innerHTML = ("All Contents In " + selectedMonth  + " of " + selectedYear);

}

function nextMonth() {
    if (currentMonthIndex === 12) {
        currentMonthIndex = 1;
        selectedYear = selectedYear + 1;
        selectedMonth = months[currentMonthIndex];
    }
    else {
        currentMonthIndex = months.indexOf(selectedMonth) + 1;
        selectedMonth = months[currentMonthIndex];
    }
    searchQuerry(
        selectedYear.toString(),
        selectedMonth,
        selectedExperiment,
        selectedSpecifics,
        selectedEmployee,
        selectedDate
    ).then(() => {
        filter('experiment');
    });

    document.getElementById("Heading").innerHTML = selectedMonth;
    document.getElementById("subHeading").innerHTML = ("All Contents In " + selectedMonth  + " of " + selectedYear);

}

async function fetchAndFill(path, getData) {
    fillArray = [];

    try {
        if (getData) {
            const doc = await path.get();
            if (doc.exists) {
                const data = doc.data();
                specificID = data.collectionID;
                searchSpecifics.push(data.collectionID);
                await fetchAndFill(db.collection(currentExperiment).doc("NewExperiment").collection(specificID), false);
            } else {
                console.log("Document does not exist");
            }
        } else {
            const querySnapshot = await path.get();
            querySnapshot.forEach((doc) => {
                fillArray.push(doc.id);
                experimentNames.push(doc.id);
            });
            fill(searchNames[layer], fillArray);
            layer++;
        }
    } catch (error) {
        console.error("Error in fetchAndFill:", error);
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

function syncScroll(scrolledCard) {
    const cards = document.querySelectorAll('.accordion');
    const scrollLocation = scrolledCard.scrollTop;

    cards.forEach(card => {
        if (card !== scrolledCard) {
            card.scrollTop = scrollLocation;
        }
    });
}
