
const db = firebase.firestore();


let currentPsName = "default";
let currentPsBase = "";
let currentWorkingStock = "";
let currentPsShort = "";
// let time = Timestamp()
let batchNumber = "";

let fillArray = []
let employees = []
let employeeCheck = []
let employeeUsed = [];

// filled with databse
employees = ["PH", "SG", "KT", "CL"]
employeeCheck = [false, false, false, false]
let fillContext = ["psBase", "workingStock", "psName","psShort"];
let initialContext = ["Choose First", "Choose Project Base", "Choose Working Stock", "Choose Working Stock"]
let fillCheck = [];

for (let i = 0; i < fillContext.length; i++) {
    fillCheck.push(false);
    document.getElementById(fillContext[i] + "C").style.border = "3px double red";
    document.getElementById(fillContext[i] + "C").style.padding = "5px";
}


// temporary. this will fill up from db
// fillArray = ["Choose Here", "C-ITRCore", "Biosensor"]
// fill(fillContext[0], fillArray);
// fillArray = ["Choose Here", "CMV_EGFP_Luciferase", "Horse?", "DOVAC", "THWIP", "hCMVGFP"]
// fill(fillContext[1], fillArray);
// fillArray = ["Choose Here", "hGL_v2_5", "Bottom Core MODIFIED for Anchors and Nanodiamonds"]
// fill(fillContext[2], fillArray);
// fillArray = ["Choose Here", "ConCore"]
// fill(fillContext[3], fillArray);

function fetchAndFill(path, index, getData) {
    fillArray = [];
    if (getData) {
        path.then((docSnapshot) => {
            if (docSnapshot.exists) {
                const data = docSnapshot.data();
                if (Array.isArray(data.psName)) {
                    fillArray = [...data.psName];
                    fill(fillContext[index], fillArray);
                    console.log(`Filled ${fillContext[index]}:`, fillArray);
                }
                if (Array.isArray(data.psShort)) {
                    fillArray = [...data.psShort];
                    fill(fillContext[index+1], fillArray);
                    console.log(`Filled ${fillContext[index+1]}:`, fillArray);
                }
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
            fill(fillContext[index], fillArray);
            if (index === 2) {
                index = 0;
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[3]).get(),3, false);
            }
            console.log(`Filled ${fillContext[index]}:`, fillArray);
        }).catch((error) => {
            console.error("Error fetching documents:", error);
        });
    }
}

// Call the function
fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).get(),0, false);

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
                console.log("safeToRun");
                currentPsShort = "Choose Here";
                currentPsName = "Choose Here";
                currentPsShort = "Choose Here";
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).get(),1, false);
            }
            break;
        case "workingStock":
            if (currentWorkingStock !== option.options[index].text && changeSelection(document.getElementById(id), 1)) {
                currentWorkingStock = option.options[index].text;
                currentPsName = "Choose Here";
                currentPsShort = "Choose Here";
                fetchAndFill(db.collection("PreStock").doc("NewExperiment").collection(fillContext[0]).doc(currentPsBase)
                    .collection(fillContext[1]).doc(currentWorkingStock).collection(fillContext[2]).get(),2, false);
            }
            break;
        case "psName":
            if (currentPsName !== option.options[index].text && changeSelection(document.getElementById(id), 2)) {
                currentPsName = option.options[index].text;
                // currentPsShort = option.options[index].text;
                fillCheck[index+1] = true;

                // const namesIndex = options.indexOf(currentPsName);
                document.getElementById("psShort").selectedIndex = index;
                document.getElementById("psShortC").style.border = "";
                document.getElementById("psShortC").style.padding = "";
            }
            else {
                document.getElementById("psShort").selectedIndex = index;
                document.getElementById("psShortC").style.border = "3px double red";
                document.getElementById("psShortC").style.padding = "5px";
            }
            break;
        case "psShort":
            if (currentPsShort !== option.options[index].text && changeSelection(document.getElementById(id), 3)) {
                currentPsShort = option.options[index].text;
                // currentPsName = option.options[index].text;
                fillCheck[index-1] = true;
                console.log(currentPsShort);
                document.getElementById("psName").selectedIndex = index;
                document.getElementById("psNameC").style.border = "";
                document.getElementById("psNameC").style.padding = "";
            }
            else {
                document.getElementById("psName").selectedIndex = index;
                document.getElementById("psNameC").style.border = "3px double red";
                document.getElementById("psNameC").style.padding = "5px";
            }
            fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            break;
        default:
        // code block
    }
}

function changeSelection(option, checkIndex) {
    // console.log(option.options[option.selectedIndex].text);
    // console.log(option.options[option.selectedIndex].text.substring(0, 6) === "Choose")

    // resets options after a selection is made
    // dont put this in the substrring if statement. you can choose "Choose First" and then the batch number
    // would stay the same. if you forget, youre cooked
    for (let i = checkIndex+1; i < fillCheck.length-1; i++) {
        fillCheck[i] = false;
        document.getElementById(fillContext[i]).selectedIndex = 0;
        document.getElementById(fillContext[checkIndex+1] + "C").style.border = "3px double red";
        document.getElementById(fillContext[checkIndex+1] + "C").style.padding = "5px";
        // const fillInitialContext = [initialContext[i]];
        // fill(fillContext[i], fillInitialContext);
    }
    // clears plate from to

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
    batchNumber = WS + "-" + "PSC" + "-" + psS + "-" + "[TIME]";
    for (let i = 0; i < employeeUsed.length; i++) {
        batchNumber += employeeUsed[i]
    }
    let container = document.getElementById("batchNumber");
    container.value = batchNumber;
    container.style.width = ((container.value.length + 1) * 10) + 'px';
}

//psName, Choose Here-CT-NOting
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

