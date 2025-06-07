// file to load all components used in index.html

loadCard('Pre-Stock', 'hGL_v2_5', '6/2/2025');














// Load header.html and inject it into #header
fetch('Components/Header/Header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
    });

async function loadCard(title, latest, date) {
    let html = await fetch('Components/ExperimentButton/experimentButton.html').then(res => res.text());
    html = html.replace('{{title}}', title)
        .replace('{{latest}}', latest)
        .replace('{{date}}', date);
    document.getElementById('card-container').innerHTML += html;
}
