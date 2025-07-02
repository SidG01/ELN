const db = firebase.firestore();

let employees = []
employees = ["PH", "SG", "KT", "CL"]

let searchCritera = [false, false, false, false];
let experimentNames = [];
let searchNames = ["experiment", "specifics", "employee", "date"];
let layer = 0;
let specificID = "";
let currentExperiment = "";
let currentSpecifics = "";
let currentEmployee = "";
let currentDate = "";
let currentYear = new Date().getFullYear() - 1;

document.getElementById("successModal").style.display = "none";
document.getElementById("feedbackModal").style.display = "none";

fetchAndFill(db.collection("Experiments"), false);
const d = new Date();
fillCards("next");

function fillCards(action) {
    if (action === "next") {
        currentYear++;
        document.getElementById("year1").innerHTML = currentYear - 1;
        document.getElementById("year2").innerHTML = currentYear;
        document.getElementById("year3").innerHTML = currentYear + 1;
    }
    else if (action === "prev") {
        currentYear--;
        document.getElementById("year1").innerHTML = currentYear - 1;
        document.getElementById("year2").innerHTML = currentYear;
        document.getElementById("year3").innerHTML = currentYear + 1;
    }
    setDirection()
}

function selectedCard(inedx) {
    let selectedYear = document.getElementById("year" + inedx).innerHTML;
    location.assign(`../SearchMonths/SearchMonths.html?selectedYear=${encodeURIComponent(selectedYear)}`);
}

function setDirection() {
    for (let i = 0; i < 3; i++) {
        let year = "year" + (i + 1);
        let value = document.getElementById(year).innerHTML;
        let thisYear = new Date().getFullYear();
        if (value === thisYear.toString()) {
            document.getElementById("year" + (i+1) + "Direction").innerHTML = "&#9675;";
        }
        else if (value > thisYear) {
            document.getElementById("year" + (i+1) + "Direction").innerHTML = "&#x276E;";
        }
        else if (value < thisYear) {
            document.getElementById("year" + (i+1) + "Direction").innerHTML = "&#x276F;";
        }
    }
}

function fetchAndFill(path, getData) {
    fillArray = [];
    if (getData) {
        path.get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                specificID = data.collectionID;
                console.log(specificID);
                fetchAndFill(db.collection(currentExperiment).doc("NewExperiment").collection(specificID), false);
                // fillArray.push(doc.id);
                // fill("specifics", fillArray);
            } else {
                console.log("Document does not exist");
            }
        }).catch((error) => {
            console.error("Error fetching document:", error);
        });
    }
    else {
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
        fetchAndFill(db.collection("Experiments").doc(experimentNames[document.getElementById(id).selectedIndex - 1]), true);
    } else if (id === "specifics") {
        currentSpecifics = document.getElementById(id).value;
    } else if (id === "employee") {
        currentEmployee = document.getElementById(id).value;
    } else if (id === "date") {
        currentDate = document.getElementById(id).value;
    }
}

function searchContent() {

}

function clearContent() {
    layer = 1;
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