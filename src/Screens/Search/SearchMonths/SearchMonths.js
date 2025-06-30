const params = new URLSearchParams(window.location.search);
const selectedYear = params.get("selectedYear");

console.log(selectedYear); // Logs: 2025
document.getElementById("selectedYEAR").innerHTML = selectedYear;
document.getElementById("successModal").style.display = "none";

function selectedCard(inedx) {
    let selectedMonth = document.getElementById("month" + inedx).innerHTML;
    console.log(selectedMonth);
    location.assign(`../SearchOutput/SearchOutput.html?selectedYear=${encodeURIComponent(selectedYear)}&selectedMonth=${encodeURIComponent(selectedMonth)}`);
}