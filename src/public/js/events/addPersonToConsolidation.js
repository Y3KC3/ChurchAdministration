const { ipcRenderer } = require('electron');
const personName = document.getElementById('name');
const personLastName = document.getElementById('lastName');
const age = document.getElementById('age');
const phoneNumber = document.getElementById('phoneNumber');
const address = document.getElementById('address');

const idMembersToTakeResponsibility = [];

const membersToTakeResponsibility = document.getElementById('membersToTakeResponsibility');
const membersToTakeResponsibilitySelected = document.getElementById('membersToTakeResponsibilitySelected');
const send = document.getElementById('send');

let editing = false;
let idToUpdate;

ipcRenderer.on('personObtined', (e,person) => {
    editing = true;
    personData = person[0][0];
    personConsolidation = person[1];
    idToUpdate = personData.id;

    personName.value = personData.name;
    personLastName.value = personData.lastName;
    age.value = personData.age;
    phoneNumber.value = personData.phoneNumber;
    address.value = personData.address;

    let options = membersToTakeResponsibility.querySelectorAll('option');
    for(let i = 0; i <= personConsolidation.length; i++){
        options.forEach(option => excludeDiscipleshipMember(option,personConsolidation[i].id_discipleship,personConsolidation[i].nameAbbreviation));
    }
});

async function getDiscipleshipMembers (){ await ipcRenderer.invoke('getDiscipleshipMembers', 'discipleshipMembersToTakeResponsibility') };
getDiscipleshipMembers();

ipcRenderer.on('discipleshipMembers', (e,members) => {
    for (let i = 0; i <= members.length; i++) {
        membersToTakeResponsibility.innerHTML += `<option value="${members[i].id_discipleship}">${members[i].nameAbbreviation}</option>`;
    };
});

let cancelAddResponsibility;

function excludeDiscipleshipMember(option,id,name) {
    if (option.value == id) {
        membersToTakeResponsibilitySelected.innerHTML += `<p class="selected" value="${option.value}" name="${name}">${name}${(editing) ? '<button class="selectedButton cancelAddResponsibility">X</button>' : ''}</p>`;
        idMembersToTakeResponsibility.push(id);
        let options = membersToTakeResponsibility.querySelectorAll('option');
        console.log(options.length);
        if (options.length == 2) membersToTakeResponsibility.setAttribute('disabled','');
        option.remove();
        cancelAddResponsibility = document.querySelectorAll('.cancelAddResponsibility');
        cancelAddResponsibility.forEach(button => button.addEventListener('click',cancelAddResponsibilityActive));
    };
};

ipcRenderer.on('excludeDiscipleshipMember', (e,id) => {
    let options = membersToTakeResponsibility.querySelectorAll('option');
    options.forEach(option => excludeDiscipleshipMember(option,id,option.text));
});

membersToTakeResponsibility.addEventListener('change', e => {
    idMembersToTakeResponsibility.push(membersToTakeResponsibility.value);

    const idxSelected = membersToTakeResponsibility.selectedIndex;
    const memberOption = membersToTakeResponsibility.options[idxSelected];
    let options = membersToTakeResponsibility.querySelectorAll('option');
    const optionName = membersToTakeResponsibility.options[idxSelected].text;

    membersToTakeResponsibilitySelected.innerHTML += `<p class="selected" value="${membersToTakeResponsibility.value}" name="${optionName}">${optionName}<button class="selectedButton cancelAddResponsibility">X</button></p>`;
    cancelAddResponsibility = document.querySelectorAll('.cancelAddResponsibility');
    memberOption.remove();
    
    cancelAddResponsibility.forEach(button => button.addEventListener('click',cancelAddResponsibilityActive));

    if (options.length == 2) membersToTakeResponsibility.setAttribute('disabled','');

    membersToTakeResponsibility.value = 'Delegar Responsabilidades';
});

const cancelAddResponsibilityActive = e => {
    e.preventDefault();

    const parentTag = e.path[1];
    const key = parentTag.getAttribute('value');
    let option = `<option value="${key}">${parentTag.getAttribute('name')}</option>`
    membersToTakeResponsibility.innerHTML += option;
    parentTag.remove();

    const discipleshipIdPosition = idMembersToTakeResponsibility.indexOf(key);
    idMembersToTakeResponsibility.splice(discipleshipIdPosition,1);

    membersToTakeResponsibility.removeAttribute('disabled','');
};

//////////////////

const formValidation = (validation,pClass,text) => {
    if (validation) { document.querySelector(pClass).textContent = text }
    else document.querySelector(pClass).textContent = '';
};

send.addEventListener('click', e => {
    e.preventDefault();

    formValidation(personName.value.length > 20 || personName.value.length <= 2,'.name','El Nombre De No Puede Tener Menos De 2 Caracteres Ni Tener Mas De 20 Caracteres');
    formValidation(personLastName.value.length > 20 || personLastName.value.length == 1 || personLastName.value.length == 2,'.lastName','El Apellido De La No Puede Tener 1 Ni 2 Caracteres Ni Tener Mas De 20 Caracteres');
    formValidation(age.value > 120,'.age','No Puede Tener Mas De 120 Años');
    formValidation(idMembersToTakeResponsibility.length === 0,'.membersToTakeResponsibility','Debe Seleccionar A Quien Lo Va A Delegar');
    formValidation(phoneNumber.value.length > 15,'.phoneNumber','El Numero De Telefono No Puede Tener Mas De 15 Digitos');
    formValidation(address.value.length > 50,'.address','La Direccion  No Puede Tener Mas De 50 Digitos');

    if (personName.value.length < 20 && personName.value.length >= 3 && personLastName.value.length < 20 && personLastName.value.length !== 1 && personLastName.value.length !== 2 && age.value < 120 && phoneNumber.value.length < 15 && address.value.length < 50 && idMembersToTakeResponsibility.length !== 0) {
        let date = new Date();

        const personData = {
            name: personName.value,
            lastName: personLastName.value,
            age: age.value,
            phoneNumber: phoneNumber.value,
            address: address.value,
            modificationDate: date,
        };

        if (!editing) { personData.creationDate = date };

        (!editing) ? ipcRenderer.send('addPerson',[personData,idMembersToTakeResponsibility]) : ipcRenderer.send('updatePerson',[personData,idMembersToTakeResponsibility,idToUpdate]);
    };
});