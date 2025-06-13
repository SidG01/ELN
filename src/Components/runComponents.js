document.getElementById('back-button').addEventListener('click', () => {
    window.history.back(); // or window.location.href = 'index.html';
});


fetch('../../Components/Header/header.html')
    .then(res => res.text())
    .then(html => {
        document.getElementById('header').innerHTML = html;
    });