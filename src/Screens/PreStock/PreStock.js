
let currentPsName = "default";
let currentPsBase = "";
let currentWorkingStock = "";
let currentPsShort = "";
// let time = Timestamp()
let batchNumber = "";

let fillArray;
let employees;
let employeeCheck;
let employeeUsed = [];

// filled with databse
employees = ["PH", "SG", "KT", "CL"]
employeeCheck = [false, false, false, false]
let fillContext = ["psBase", "workingStock", "psName","psShort"];
let fillCheck = [];

for (let i = 0; i < fillContext.length; i++) {
    fillCheck.push(false);
}
// temporary. this will fill up from database
fillArray = ["Choose Here", "C-ITRCore", "NOting????"]
fill(fillContext[0], fillArray);
fillArray = ["Choose Here", "CMV_EGFP_Luciferase", "Horse?", "DOVAC", "THWIP", "hCMVGFP"]
fill(fillContext[1], fillArray);
fillArray = ["Choose Here", "hGL_v2_5", "Bottom Core MODIFIED for Anchors and Nanodiamonds"]
fill(fillContext[2], fillArray);
fillArray = ["Choose Here", "ConCore"]
fill(fillContext[3], fillArray);



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
        case "psName":
            if (currentPsName !== option.options[index].text) {
                currentPsName = option.options[index].text;
                currentPsShort = "Choose Here";
                changeSelection(document.getElementById(id), 2);
            }
            break;
        case "psBase":
            if (currentPsBase !== option.options[index].text) {
                currentPsBase = option.options[index].text;
                currentPsShort = "Choose Here";
                currentPsName = "Choose Here";
                currentPsShort = "Choose Here";
                changeSelection(document.getElementById(id), 0);
            }
            break;
        case "workingStock":
            if (currentWorkingStock !== option.options[index].text) {
                currentWorkingStock = option.options[index].text;
                currentPsName = "Choose Here";
                currentPsShort = "Choose Here";
                changeSelection(document.getElementById(id), 1);
            }
            fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            break;
        case "psShort":
            if (currentPsShort !== option.options[index].text) {
                currentPsShort = option.options[index].text;
                changeSelection(document.getElementById(id), 3);
            }
            fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
            break;
        default:
        // code block
    }
}

function changeSelection(option, checkIndex) {
    fillCheck[checkIndex] = true;
    console.log(option.options[option.selectedIndex].text);
    var container = document.getElementById(fillContext[checkIndex] + "C");
    if (option.options[option.selectedIndex].text === "Choose Here") {
        container.style.border = "3px double red";
        container.style.padding = "5px";
    }
    else {
        container.style.border = "";
        container.style.padding = "";
    }
    for (let i = checkIndex+1; i < fillCheck.length; i++) {
        fillCheck[i] = false;
        document.getElementById(fillContext[i]).selectedIndex = 0;
        container.style.border = "3px double red";
        container.style.padding = "5px";
    }
    // clears plate from to

     fillBatchNumber(currentPsName, currentPsBase, currentWorkingStock, currentPsShort);
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
    for (let i = 0; i < content.length; i++) {
        let newOption = document.createElement("option");
        newOption.text = content[i];
        options.options.add(newOption);
    }
    document.getElementById(idName + "C").style.border = "3px double red";
    document.getElementById(idName + "C").style.padding = "5px";
}

