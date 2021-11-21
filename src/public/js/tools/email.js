const { ipcRenderer } = require('electron');
let emailEvent = false;

async function validationNecessaryForApplication (){ await ipcRenderer.invoke('validationNecessaryForApplication')};
validationNecessaryForApplication();

const alert = document.querySelector('.alert');

ipcRenderer.on('validationError', () => {
    emailEvent = true;
    document.querySelector('body').style.overflow = 'hidden'
    document.querySelector('.dark').classList.toggle('darkActive');
    alert.style.display = 'block';
});

document.getElementById('bars').addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'hidden'
    document.querySelector('.dark').classList.toggle('darkActive');
    document.querySelector('.sidebar').classList.toggle('activeBars');
});

document.querySelector('.dark').addEventListener('click', () => {
    if (!emailEvent) {
        document.querySelector('body').style.overflow = 'auto'
        document.querySelector('.dark').classList.toggle('darkActive');
        document.querySelector('.sidebar').classList.toggle('activeBars');
    };
});

let internet = true;
let emailsContainer = [];

const thereAreNoInternet = document.querySelector('.thereAreNoInternet');

setInterval(() => {
    if (navigator.onLine) {
        internet = true;
        thereAreNoInternet.textContent = 'Coneccion Establecida';
        thereAreNoInternet.style.background = '#009d1a';
        setTimeout(() => { thereAreNoInternet.style.transform = 'translateY(-100px)' },1500)
    } else {
        internet = false;
        thereAreNoInternet.textContent = '!No Hay Coneccion A Internet!';
        thereAreNoInternet.style.background = '#8f0000';
        thereAreNoInternet.style.transform = 'translateY(0px)';
    };
},100);

const spanTitle = document.querySelector('.spanTitle');
let getInterval;

const loading = () => {
    spanTitle.textContent = 'Cargando';
    getInterval = setInterval(() => {
        animation ++;
        if (animation == 0) { spanTitle.textContent = 'Cargando' };
        if (animation == 1) { spanTitle.textContent = 'Cargando.' };
        if (animation == 2) { spanTitle.textContent = 'Cargando..' };
        if (animation == 3) { spanTitle.textContent = 'Cargando...' };
        if (animation == 4) { spanTitle.textContent = 'Cargando'; animation = 0 };
    },200);
};

const title = document.getElementById('title');
const description = document.getElementById('description');
const send = document.getElementById('send');

const error = document.querySelector('.error');

send.addEventListener('click', async () => {
    error.textContent = '';
    if (emailsContainer.length === 0) error.textContent = 'Elija Las Personas A Quien Desea Enviar El Correo';
    if (description.value.length < 30) error.textContent = 'La Descripcion No Puede Ser Menor A 30 Caracteres';
    if (title.value.length < 4) error.textContent = 'El Titulo No Puede Ser Menor A 4 Caracteres';

    if (title.value.length <= 50 && title.value.length > 3 && description.value.length >= 30 && description.value.length <= 3000 && emailsContainer.length !== 0) {
        if (internet !== false) {
            loading();
            await ipcRenderer.invoke('sendEmail',{ title: title.value, description: description.value, emails: emailsContainer });
        } else { error.textContent = 'Por Favor Verifique Su Coneccion A Internet' };
    };
});

const selectEmail = document.getElementById('selectEmail');

const emailContainer = document.querySelector('.emailContainer');
const emailContainerExit = document.getElementById('emailContainerExit');

const emails = document.querySelector('.emails');
const emailP = document.querySelector('.emailP');

const peopleToSendEmailTitle = document.querySelector('.peopleToSendEmail');

selectEmail.addEventListener('click', async () => {
    emailEvent = true;
    emailContainer.style.display = 'block';
    document.querySelector('body').style.overflow = 'hidden'
    document.querySelector('.dark').classList.add('darkActive');
    await ipcRenderer.invoke('getEmails');
});

emailContainerExit.addEventListener('click', () => {
    emailEvent = false;
    emailContainer.style.display = 'none';
    document.querySelector('body').style.overflow = 'auto'
    document.querySelector('.dark').classList.remove('darkActive');
});

let emailsH4;

function emailSelect (){
    const email = this.getAttribute('email');
    const id = this.getAttribute('id');
    this.classList.toggle('select');
    if (this.classList.contains('select')) {
        this.style.background = '#13a500';
        emailsContainer.push(email);
        emailP.innerHTML += `<p class="emailData${id}">${this.textContent}: ${email}</p>`;
    } else {
        const position = emailsContainer.indexOf(email);
        emailsContainer.splice(position, 1);
        this.style.background = '';
        document.querySelector(`.emailData${id}`).remove();
    };
}

ipcRenderer.on('emailsObtined', (e,emailsData) => {
    if (emailsData.length === 0 ){
        peopleToSendEmailTitle.textContent = 'No Hay Miembros Con Correos Electronicos';
    } else {
        if (emailsContainer.length === 0) {
            emails.textContent = '';
            emailP.textContent = '';
            for (let i = 0; i <= emailsData.length; i++) {
                emails.innerHTML += `<h4 id="${emailsData[i].id}" email="${emailsData[i].email}">${emailsData[i].nameAbbreviation}</h4>`;
                emailsH4 = document.querySelectorAll('.emails h4');
                emailsH4.forEach(email => email.addEventListener('click',emailSelect));
            };
        };
    };
});