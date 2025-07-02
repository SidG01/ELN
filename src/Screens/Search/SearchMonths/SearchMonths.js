const params = new URLSearchParams(window.location.search);
const selectedYear = params.get("selectedYear");

console.log(selectedYear); // Logs: 2025
document.getElementById("selectedYEAR").innerHTML = selectedYear;
document.getElementById("successModal").style.display = "none";
document.getElementById("feedbackModal").style.display = "none";


function selectedCard(inedx) {
    let selectedMonth = document.getElementById("month" + inedx).innerHTML;
    console.log(selectedMonth);
    location.assign(`../SearchOutput/SearchOutput.html?selectedYear=${encodeURIComponent(selectedYear)}&selectedMonth=${encodeURIComponent(selectedMonth)}`);
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