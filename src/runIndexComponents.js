// file to load all components used in index.html

// writing to the database
// const db = firebase.firestore();
// db.collection("PreStock").add({
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
// })
//
// // reading from the databse
// db.collection("PreStock").get().then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//         console.log(`${doc.id} => ${doc.data()}`);
//     });
// });





loadCard('Pre-Stock', 'hGL_v2_5', '5/15/2025', 'PreStockButton');
loadCard('Working Stock', 'hGL_4x4x4_F4', '6/2/2025', 'WorkingStockButton');
loadCard('PCR', 'hGL_v2_5', '6/2/2025', 'PcrButton');
loadCard('Antibody Conjugation', 'hGL_v2_5', '6/2/2025', 'AntibodyConjugationButton');
loadCard('Buffers', 'hGL_v2_5', '6/2/2025', 'BuffersButton');
loadCard('Conjugation', 'hGL_v2_5', '6/2/2025', 'ConjugationButton');
loadCard('Cryopreservation', 'hGL_v2_5', '6/2/2025', 'CryopreservationButton');
loadCard('Folding', 'hGL_v2_5', '6/2/2025', 'FoldingButton');
loadCard('AGE Gels', 'hGL_v2_5', '6/2/2025', 'GelsButton');
loadCard('Generic', 'hGL_v2_5', '6/2/2025', 'GenericButton');
loadCard('PEG', 'hGL_v2_5', '6/2/2025', 'PEGButton');
loadCard('Protein Conjugation', 'hGL_v2_5', '6/2/2025', 'ProteinConjugationButton');
loadCard('Scaffold', 'hGL_v2_5', '6/2/2025', 'ScaffoldButton');
loadCard('Spin Column', 'hGL_v2_5', '6/2/2025', 'SpinColumnButton');




function preStockPage() {
    location.assign("Screens/PreStock/PreStock.html");
}
function workingStockPage() {
    location.assign("Screens/WorkingStock/WorkingStock.html");
}
function pcrPage() {
    location.assign("Screens/PCR/PCR.html");
}
function antiBodyCPage() {
    location.assign("Screens/AntibodyConjugation/AntibodyConjugation.html");
}
function buffersPage () {
    location.assign("Screens/Buffers/Buffers.html");
}
function conjugationPage() {
    location.assign("Screens/Conjugation/Conjugation.html");
}
function cryoPage() {
    location.assign("Screens/Cryopreservation/Cryopreservation.html");
}
function foldingPage() {
    location.assign("Screens/Folding/Folding.html");
}
function gelsPage() {
    location.assign("Screens/Gels/Gels.html");
}
function genericPage() {
    location.assign("Screens/Generic/Generic.html");
}
function pegPage() {
    location.assign("Screens/PEG/PEG.html");
}
function proteinCPage() {
    location.assign("Screens/ProteinConjugation/ProteinConjugation.html");
}
function scaffoldPage() {
    location.assign("Screens/Scaffold/Scaffold.html");
}
function spinCPage() {
    location.assign("Screens/SpinColumn/SpinColumn.html");
}








// Load header.html and inject it into #header
fetch('Components/Header/header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
    });

async function loadCard(title, latest, date, name) {
    let html = await fetch('Components/ExperimentButton/experimentButton.html')
        .then(res => res.text());
    html = html.replace('{{title}}', title)
        .replace('{{latest}}', latest)
        .replace('{{date}}', date);
    document.getElementById(name).innerHTML += html;
}
