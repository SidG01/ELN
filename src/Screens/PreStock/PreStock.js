
const employees = ["PH", "SG", "KT", "CL"]
const employeeCheck = [false, false, false, false]
const employeeUsed = [];

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
    console.log(employeeUsed);
}


document.getElementById('back-button').addEventListener('click', () => {
    window.history.back(); // or window.location.href = 'index.html';
});


fetch('../../Components/Header/header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
    });