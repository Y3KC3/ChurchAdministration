document.getElementById('bars').addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'hidden'
    document.querySelector('.dark').classList.toggle('darkActive');
    document.querySelector('.sidebar').classList.toggle('activeBars');
});

document.querySelector('.dark').addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'auto'
    document.querySelector('.dark').classList.toggle('darkActive');
    document.querySelector('.sidebar').classList.toggle('activeBars');
});