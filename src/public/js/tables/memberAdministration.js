const { ipcRenderer } = require('electron');

const remove = document.getElementById('delete');
const dataTitle = document.querySelector('.dataTitle')
const dataResults = document.querySelector('.dataResults');
const thereAreNot = document.querySelector('.thereAreNot');
const spanTitle = document.querySelector('.spanTitle');

const searchInput = document.getElementById('searchInput');
let results, usersInformation, getInterval;
let animation = 0;

const loading = () => {
    spanTitle.textContent = 'Cargando';
    getInterval = setInterval(() => {
        animation ++;
        if (animation == 0) { spanTitle.textContent = 'Cargando' };
        if (animation == 1) { spanTitle.textContent = 'Cargando.' };
        if (animation == 2) { spanTitle.textContent = 'Cargando..' };
        if (animation == 3) { spanTitle.textContent = 'Cargando...' };
        if (animation == 4) { spanTitle.textContent = 'Cargando'; animation = 0 };
    },500);
};

async function getMembers() { 
    await ipcRenderer.invoke('getMembers');
    loading();
};
getMembers();

const add = document.getElementById('add');
add.addEventListener('click', () => { ipcRenderer.send('activeToAddMember') });

async function sortMember(order) { await ipcRenderer.invoke('orderMembers', order) };
const filter = document.getElementById('filter');
filter.addEventListener('change', () => {
    sortMember(filter.value);
    searchInput.value = '';
    setTimeout(() => {
        results = document.querySelectorAll('.result')
        usersInformation = document.querySelectorAll('.information');
    }, 600);
});

async function searchMember(search) { await ipcRenderer.invoke('lookingForMembers', search) };
searchInput.addEventListener('keyup', () => {
    if (searchInput.value.length !== 0) {
        searchMember(searchInput.value);
        filter.value = 'Ordenar Por Fecha De Registro Descendente'
        setTimeout(() => {
            results = document.querySelectorAll('.result');
            usersInformation = document.querySelectorAll('.information');
        }, 600);
    } else getMembers();
});

const getDate = (date) => {
    let getDay = date.getDate();
    let getMonth = date.getMonth();
    const getYear = date.getFullYear();

    if (getMonth == 0) getMonth += 1;
    if (getMonth < 10) getMonth = "0" + getMonth;
    if (getDay < 10) getDay = "0" + getDay;

    return `${getDay}-${getMonth}-${getYear}`;
};

ipcRenderer.on('members', (e, members) => {
    clearInterval(getInterval);
    animation = 0;
    spanTitle.textContent = '';
    dataResults.innerHTML = '';
    if (members.length <= 0) {
        dataTitle.style.display = 'none';
        remove.style.display = 'none';
        updateMember.style.display = 'none';
        thereAreNot.textContent = 'No Hay Miembros Agregados';
    } else {
        thereAreNot.textContent = '';
        remove.style.display = 'inline-block';
        updateMember.style.display = 'inline-block';
        filter.style.display = 'inline-block';
        dataTitle.style.display = 'grid';
        for (let i = 0; i <= members.length; i++) {
            let result = `
                <div class="result" key="${members[i].id}">
                    <h1 class="information" id="information" key="${members[i].id}">${members[i].nameAbbreviation}</h1>
                    <h1>${members[i].phoneNumber}</h1>
                    <h1>${getDate(members[i].dateOfBirth)}</h1>
                    <h1>${members[i].age}</h1>
                    <h1>${members[i].identification}</h1>
                    <h1>${members[i].address}</h1>
                    <h1>${members[i].familyMembers}</h1>
                    <h1>${members[i].familyRelationship}</h1>
                    <h1>${members[i].professionJob}</h1>
                    <h1>${members[i].email}</h1>
                    <h1>${getDate(members[i].christeningDate)}</h1>
                    <h1 id="discipleship">${(members[i].discipleship == 1) ? 'Activo' : 'Inactivo'}</h1>
                    <h1>${members[i].beliverStatus}</h1>
                    <h1>${members[i].churchCharge}</h1>
                </div>
            `;
            dataResults.innerHTML += result;
            results = document.querySelectorAll('.result');
            usersInformation = document.querySelectorAll('.information');
        };
    };
});

const informationSheet = document.querySelector('.informationSheet');
const dark = document.querySelector('.dark');
let userInformationActive = false;

async function information() {
    document.querySelector('body').style.overflow = 'hidden';
    userInformationActive = true;
    dark.classList.add('darkActive');
    informationSheet.style.display = 'flex';
    const key = this.getAttribute('key');

    await ipcRenderer.invoke('getMembers', key);
};

const mainName = document.getElementById('nameAbbreviationTitle');
const names = document.getElementById('names');
const surnames = document.getElementById('surnames');
const sex = document.getElementById('sex');
const phoneNumber = document.getElementById('phoneNumber');
const CI = document.getElementById('CI');
const dateOfBirth = document.getElementById('dateOfBirth');
const age = document.getElementById('age');
const address = document.getElementById('address');
const familyMembers = document.getElementById('memebersFamily');
const familyRelationship = document.getElementById('familyRelationship');
const professionJob = document.getElementById('professionJob');
const email = document.getElementById('email');
const christeningDate = document.getElementById('christeningDate');
const beliverStatus = document.getElementById('beliverStatus');
const churchCharge = document.getElementById('churchCharge');
const biography = document.getElementById('biography');
const creationDate = document.getElementById('creationDate');
const modificationDate = document.getElementById('modificationDate');

ipcRenderer.on('memberObtained', (e, member) => {
    member = member[0];

    mainName.textContent = member.nameAbbreviation;
    names.textContent = (member.name.length == 0 && member.secondName == 0) ? 'Indefinidos' : `${member.name} ${member.secondName}`;
    surnames.textContent = (member.lastName.length == 0 && member.secondSurname == 0) ? 'Indefinidos' : `${member.lastName} ${member.secondSurname}`;
    sex.textContent = member.sex;
    phoneNumber.textContent = (member.phoneNumber.length == 0) ? 'Indefinido' : member.phoneNumber;
    CI.textContent = (member.identification.length == 0) ? 'Indefinido' : member.identification;
    dateOfBirth.textContent = getDate(member.dateOfBirth);
    age.textContent = (member.age.length == 0) ? 'Indefinido' : member.age;
    address.textContent = (member.address.length == 0) ? 'Indefinido' : member.address;
    familyMembers.textContent = (member.familyMembers.length == 0) ? 'Indefinido' : member.familyMembers;
    familyRelationship.textContent = (member.familyRelationship.length == 0) ? 'Indefinido' : member.familyRelationship;
    professionJob.textContent = (member.professionJob.length == 0) ? 'Indefinido' : member.professionJob;
    email.textContent = (member.email.length == 0) ? 'Indefinido' : member.email;
    christeningDate.textContent = getDate(member.christeningDate);
    beliverStatus.textContent = member.beliverStatus;
    churchCharge.textContent = (member.churchCharge.length == 0) ? 'Indefinido' : member.churchCharge;
    biography.textContent = member.biography;
    creationDate.textContent = getDate(member.creationDate);
    modificationDate.textContent = getDate(member.modificationDate);
});

let eventUpdateDelete = false;

setInterval(() => {
    if (!eventUpdateDelete) usersInformation.forEach(userInformation => userInformation.addEventListener('click', information))
    else usersInformation.forEach(userInformation => userInformation.removeEventListener('click', information))
}, 400);

const informationExit = document.getElementById('exit');

informationExit.addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'auto';
    userInformationActive = false;
    dark.classList.remove('darkActive');
    informationSheet.style.display = 'none';
});

document.getElementById('bars').addEventListener('click', () => {
    scroll(0, 0);
    document.querySelector('body').style.overflow = 'hidden'
    dark.classList.toggle('darkActive');
    document.querySelector('.sidebar').classList.toggle('activeBars');
});

dark.addEventListener('click', () => {
    if (!userInformationActive) {
        document.querySelector('body').style.overflow = 'auto'
        dark.classList.toggle('darkActive');
        document.querySelector('.sidebar').classList.toggle('activeBars');
    };
});

const deleteBar = document.querySelector('.deleteBar');
const cancel = document.getElementById('cancel');
const cancelUpdate = document.getElementById('cancelUpdate');
const confirm = document.getElementById('confirm');
const numberToDelete = document.getElementById('numberToDelete');
const updateMember = document.getElementById('update');

let membercountToDelete = 0;
let deleteValidation = false;
let updateValidation = false;
let idContainer = [];


setTimeout(() => {
    results = document.querySelectorAll('.result');

    const activeMouseEvent = (validation, remove, cls) => {
        (validation)
            ? results.forEach(result => result.addEventListener('click', (remove) ? selectedToDeleteValidation : selectedToUpdateValidation))
            : results.forEach(result => result.removeEventListener('click', (remove) ? selectedToDeleteValidation : selectedToUpdateValidation));
        results.forEach(result => mouseEvent((validation) ? true : false, result, cls, results));
    };

    function selectedToDeleteValidation() {
        const key = this.getAttribute('key');
        this.classList.toggle('selectedToDelete');
        if (this.classList.contains('selectedToDelete')) {
            membercountToDelete += 1;
            idContainer.push(key);
        } else {
            membercountToDelete -= 1
            const position = idContainer.indexOf(key);
            idContainer.splice(position, 1);
        };
        numberToDelete.textContent = `Registro A Eliminar: ${membercountToDelete}`;
    };

    async function selectedToUpdateValidation() {
        const key = this.getAttribute('key');
        await ipcRenderer.invoke('getOneMemberForUpdate', key);
        updateValidation = false;
        activeMouseEvent(updateValidation, false, 'mouseoverUpdate');
        spanTitle.textContent = '';
        remove.style.display = 'inline-block';
        updateMember.style.display = 'inline-block';
        cancelUpdate.style.display = 'none';
    };

    function mouseEvent(active, element, cls, results) {
        if (active) {
            element.addEventListener('mouseover', () => { element.classList.add(cls) });
            element.addEventListener('mouseout', () => { element.classList.remove(cls) });
            results.forEach(result => result.classList.add('activeCursor'));
            return;
        } else {
            element.addEventListener('mouseover', () => { element.classList.remove(cls) });
            element.addEventListener('mouseout', () => { element.classList.remove(cls) });
            element.classList.remove(cls);
            results.forEach(result => result.classList.remove('activeCursor'));
        };
        return;
    };


    updateMember.addEventListener('click', () => {
        eventUpdateDelete = true;
        updateValidation = true;
        activeMouseEvent(updateValidation, false, 'mouseoverUpdate');
        spanTitle.textContent = 'Selecciona El Usuario Que Quiere Actualizar';
        searchInput.style.display = 'none';
        remove.style.display = 'none';
        updateMember.style.display = 'none';
        filter.style.display = 'none';
        cancelUpdate.style.display = 'inline-block';
    });

    cancelUpdate.addEventListener('click', () => {        
        eventUpdateDelete = false;
        updateValidation = false;
        activeMouseEvent(updateValidation, false, 'mouseoverUpdate');
        spanTitle.textContent = '';
        searchInput.style.display = 'inline-block';
        filter.style.display = 'inline-block';
        remove.style.display = 'inline-block';
        updateMember.style.display = 'inline-block';
        cancelUpdate.style.display = 'none';
    });

    remove.addEventListener('click', () => {
        eventUpdateDelete = true;
        deleteValidation = true;
        filter.style.display = 'none';
        document.getElementById('bars').style.display = 'none';
        document.querySelector('.navAbsolutePosition').style.display = 'none';
        activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
        searchInput.style.display = 'none';
        deleteBar.style.transform = 'translateY(0)';
        spanTitle.textContent = 'Seleccione Los Nombres De Los Miembros Que Desea Eliminar';
        remove.style.display = 'none';
        updateMember.style.display = 'none';
    });

    cancel.addEventListener('click', () => {
        eventUpdateDelete = false;
        deleteValidation = false;
        idContainer = [];
        activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
        filter.style.display = 'inline-block';
        deleteBar.style.transform = 'translateY(-100px)';
        document.getElementById('bars').style.display = 'block';
        document.querySelector('.navAbsolutePosition').style.display = 'block';
        spanTitle.textContent = '';
        results.forEach(result => result.classList.remove('selectedToDelete'));
        membercountToDelete = 0;
        numberToDelete.textContent = `Registro A Eliminar: 0`;
        searchInput.style.display = 'inline-block';
        remove.style.display = 'inline-block';
        updateMember.style.display = 'inline-block';
    });

    confirm.addEventListener('click', () => {        
        if (membercountToDelete >= 1) {      
            deleteValidation = false;
            activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
            searchInput.style.display = 'none';      
            filter.style.display = 'none';
            deleteBar.style.transform = 'translateY(-100px)';
            add.style.display = 'none';
            remove.style.display = 'none';
            updateMember.style.display = 'none';
            ipcRenderer.send('removeMember', idContainer)
        } else alert('Seleccione Un Miembro A Eliminar');
    });

    ipcRenderer.on('loading', () => {
        loading();
        add.style.display = 'none';
        remove.style.display = 'none';
        updateMember.style.display = 'none';
    });
    
    ipcRenderer.on('cancel', () => {
        deleteValidation = true;
        activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
        deleteBar.style.transform = 'translateY(0)';
        add.style.display = 'inline-block';
    });

}, 700);