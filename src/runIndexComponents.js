// file to load all components used in index.html



loadCard('Pre-Stock', 'hGL_v2_5', '5/15/2025', 'PreStockButton');
loadCard('Working Stock', 'hGL_4x4x4_F4', '6/2/2025', 'WorkingStockButton');
loadCard('Antibody Conjugation', 'hGL_v2_5', '6/2/2025', 'AntibodyConjugationButton');
loadCard('Buffers', 'hGL_v2_5', '6/2/2025', 'BuffersButton');
loadCard('Conjugation', 'hGL_v2_5', '6/2/2025', 'ConjugationButton');
loadCard('Cryopreservation', 'hGL_v2_5', '6/2/2025', 'CryopreservationButton');
loadCard('Folding', 'hGL_v2_5', '6/2/2025', 'FoldingButton');
loadCard('Gels', 'hGL_v2_5', '6/2/2025', 'GelsButton');
loadCard('Generic', 'hGL_v2_5', '6/2/2025', 'GenericButton');
loadCard('PEG', 'hGL_v2_5', '6/2/2025', 'PEGButton');
loadCard('Protein Conjugation', 'hGL_v2_5', '6/2/2025', 'ProteinConjugationButton');
loadCard('Scaffold', 'hGL_v2_5', '6/2/2025', 'ScaffoldButton');
loadCard('Spin Column', 'hGL_v2_5', '6/2/2025', 'SpinColumnButton');















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
