const { ipcRenderer } = require('electron');
const dark = document.querySelector('.dark');

const bars = document.getElementById('bars');
const nav = document.querySelector('.navAbsolutePosition');
const numberToDelete = document.getElementById('numberToDelete');

const dataTitle = document.querySelector('.dataTitle');
const dataResults = document.querySelector('.dataResults');
const spanTitle = document.querySelector('.spanTitle');
const thereAreNot = document.querySelector('.thereAreNot');

const filter = document.getElementById('filter');

let results, discipleshipMemberInformation, consolidations;
let deleteValidation;

const addMemberToDiscipleship = document.getElementById('add');
const cancelMemberSend = document.getElementById('cancelMemberSend');
const deleteDiscipleshipMember = document.getElementById('delete');
const rollCall = document.getElementById('rollCall');

const confirmRollCall = document.getElementById('confirmRollCall');
const cancelRollCall = document.getElementById('cancelRollCall');

const formContainer = document.querySelector('.form-container');

const send = document.getElementById('send');
const nameOptions = document.getElementById('nameOptions');
const addMemberTitle = document.querySelector('.addMemberTitle')

let getInterval;
let animation = 0;

const deleteBar = document.querySelector('.deleteBar');
const confirm = document.getElementById('confirm');
const cancelDelete = document.getElementById('cancelDelete');

const informationSheet = document.getElementById('discipleshipMemberInformation');
const informationExit = document.getElementById('exit');

const searchInput = document.getElementById('searchInput');

const loading = (element) => {
    element.textContent = 'Cargando';
    getInterval = setInterval(() => {
        animation++;
        if (animation == 0) { element.textContent = 'Cargando' };
        if (animation == 1) { element.textContent = 'Cargando.' };
        if (animation == 2) { element.textContent = 'Cargando..' };
        if (animation == 3) { element.textContent = 'Cargando...' };
        if (animation == 4) { element.textContent = 'Cargando'; animation = 0 };
    }, 500);
};

async function getDiscipleship() {
    await ipcRenderer.invoke('getDiscipleshipMembers', 'discipleshipMembers');
    loading(spanTitle);
}
getDiscipleship();

const validateNumberOfPeopleConsolidating = count => {
    if (count == 1) return `${count} Persona Consolidando`
    else return `${count} Personas Consolidando`;
};

ipcRenderer.on('discipleshipMembers', (e, members) => {
    spanTitle.textContent = '';
    clearInterval(getInterval);
    animation = 0;
    dataResults.innerHTML = '';
    consolidationPersonDataResults.innerHTML = '';
    consolidationPersonDataTitle.style.display = 'none';
    if (members.length <= 0) {
        rollCall.style.display = 'none';
        dataTitle.style.display = 'none';
        deleteDiscipleshipMember.style.display = 'none';
        thereAreNot.textContent = 'No Hay Miembros En El Discipulado';
    } else {
        rollCall.style.display = 'inline-block';
        thereAreNot.textContent = '';
        dataTitle.style.display = 'grid';
        deleteDiscipleshipMember.style.display = 'inline-block';
        for (let i = 0; i <= members.length; i++) {
            const count = members[i].consolidationPersonCount;
            let result = `
                <div class="result" memberKey="${members[i].id}" key="${members[i].id_discipleship}">
                    <div class="smallInformation">
                        <h1 class="id" key="${members[i].id_discipleship}">${members[i].id_discipleship}</h1>
                        <h1>${members[i].assistance}</h1>
                    </div>
                    <h1>${members[i].nameAbbreviation}</h1>
                    <h1 class="consolidation" key="${members[i].id_discipleship}">${(count == 0) ? 'No Consolidando' : validateNumberOfPeopleConsolidating(count)}</h1>
                <div>
            `;
            dataResults.innerHTML += result;
            results = document.querySelectorAll('.result');
            discipleshipMemberInformation = document.querySelectorAll('.id');
            consolidations = document.querySelectorAll('.consolidation');
        };
    };
});

filter.addEventListener('change', async () => { 
    searchInput.value = '';
    await ipcRenderer.invoke('orderDiscipleship', filter.value);
});

async function search(search) { await ipcRenderer.invoke('lookingForDiscipleship', search) };
searchInput.addEventListener('keyup', () => {
    if (searchInput.value.length !== 0) {
        search(searchInput.value);
        filter.value = 'Ordenar Por Orden De Registro Descendente';
    } else getDiscipleship();
});

async function information() {
    document.querySelector('body').style.overflow = 'hidden';
    watchingInformation = true;
    dark.classList.add('darkActive');
    informationSheet.style.display = 'flex';
    const key = this.getAttribute('key');

    await ipcRenderer.invoke('getOneMembersOfDiscipleship', key);
};

let adding = false;
let watchingInformation = false;
let eventsValidation = false;

setInterval(() => {
    if (!eventsValidation) discipleshipMemberInformation.forEach(discipleshipUserInformation => discipleshipUserInformation.addEventListener('click', information))
    else discipleshipMemberInformation.forEach(userInformation => userInformation.removeEventListener('click', information));
}, 400);

const getDate = (date) => {
    let getDay = date.getDate();
    let getMonth = date.getMonth();
    const getYear = date.getFullYear();

    getMonth += 1;
    if (getMonth < 10) getMonth = "0" + getMonth;
    if (getDay < 10) getDay = "0" + getDay;

    return `${getDay}-${getMonth}-${getYear}`;
};

const name = document.getElementById('name');
const memberId = document.querySelector('.memberId');
const discipleshipId = document.querySelector('.discipleshipId');
const totalAssistance = document.querySelector('.totalAssistance');
const entryDate = document.querySelector('.entryDate');

ipcRenderer.on('memberInformation', (e, memberData) => {
    memberData = memberData[0];

    name.textContent = memberData.nameAbbreviation;
    memberId.textContent = memberData.id;
    discipleshipId.textContent = memberData.id_discipleship;
    totalAssistance.textContent = memberData.assistance;
    entryDate.textContent = getDate(memberData.discipleshipCreationDate);
});

informationExit.addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'auto';
    watchingInformation = false;
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
    if (!adding && !watchingInformation) {
        document.querySelector('body').style.overflow = 'auto'
        dark.classList.toggle('darkActive');
        document.querySelector('.sidebar').classList.toggle('activeBars');
    };
});

async function getMembersAvailableToAddToDiscipleship() { await ipcRenderer.invoke('getMembersAvailableToAddToDiscipleship') };

addMemberToDiscipleship.addEventListener('click', () => {
    getMembersAvailableToAddToDiscipleship();
    document.querySelector('body').style.overflow = 'hidden';
    dark.classList.add('darkActive');
    formContainer.style.display = 'flex';
});

ipcRenderer.on('membersAvailable', (e, members) => {
    nameOptions.innerHTML = '';
    if (members.length <= 0) {
        addMemberTitle.textContent = 'No Hay Miembros Que Añadir';
        send.style.display = 'none';
    } else {
        nameOptions.style.display = 'inline-block';
        for (let i = 0; i <= members.length; i++) {
            let result = `
                <option value="${members[i].id}">${members[i].nameAbbreviation}</option>
            `;
            nameOptions.innerHTML += result;
        };
    };
});

cancelMemberSend.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('body').style.overflow = 'auto';
    dark.classList.remove('darkActive');
    formContainer.style.display = 'none';
});

let membercountToDelete = 0;
let idContainer = [];
let idMembers = [];

const activeMouseEvent = (validation, remove, results, cls) => {
    (validation)
        ? results.forEach(result => result.addEventListener('click', (remove) ? (cls === 'mouseoverRemoveList') ? selectedToRemoveList : selectedToDeleteValidation : (cls == 'mouseoverRollCall') ? selectedToRollCall : (cls == 'mouseoverPersonToUpdate') ? selectedToUpdatePerson : (cls == 'mouseoverEditList') ? selectedToEditList : selectedToUpdateProcess))
        : results.forEach(result => result.removeEventListener('click', (remove) ? (cls === 'mouseoverRemoveList') ? selectedToRemoveList : selectedToDeleteValidation : (cls == 'mouseoverRollCall') ? selectedToRollCall : (cls == 'mouseoverPersonToUpdate') ? selectedToUpdatePerson : (cls == 'mouseoverEditList') ? selectedToEditList : selectedToUpdateProcess));
    results.forEach(result => mouseEvent((validation) ? true : false, result, cls, results));
};

async function selectedToEditList() {
    const date = new Date(this.getAttribute('listCreation'));
    const assistanceDate = document.querySelectorAll('.listDate');
    document.querySelector('body').style.overflow = 'auto';
    listContainer.style.display = 'none';
    cancelListEvent.style.display = 'none';
    editList.style.display = 'inline-block';
    removeList.style.display = 'inline-block';
	registerListExit.style.display = 'inline-block';
    spanTitleList.textContent = '';
    await ipcRenderer.invoke('getListToEdit', date);
    activeMouseEvent(false, false, assistanceDate, 'mouseoverEditList');
};

async function selectedToUpdatePerson() {
    const key = this.getAttribute('key');
    await ipcRenderer.invoke('getOneConsolidatinPersonForUpdate', key);
};

async function selectedToUpdateProcess() {
    const key = this.getAttribute('key');
    const idPerson = this.getAttribute('idPerson');
    await ipcRenderer.invoke('getOneConsolidatinProcessForUpdate', [key, idPerson]);
};

function selectedToRollCall() {
    const key = this.getAttribute('key');
    this.classList.toggle('selectedToRollCall');
    if (this.classList.contains('selectedToRollCall')) idContainer.push(key)
    else {
        const position = idContainer.indexOf(key);
        idContainer.splice(position, 1);
    };
};

function selectedToRemoveList () {
    const date = new Date(this.getAttribute('listCreation'));
    const assistanceDate = document.querySelectorAll('.listDate');
    document.querySelector('body').style.overflow = 'auto';
    listContainer.style.display = 'none';
    cancelListEvent.style.display = 'none';
    registerListExit.style.display = 'inline-block';
    editList.style.display = 'inline-block';
    removeList.style.display = 'inline-block';
    spanTitleList.textContent = '';
    ipcRenderer.send('removeList', date);
    activeMouseEvent(false, true, assistanceDate, 'mouseoverRemoveList');
};

function selectedToDeleteValidation() {
    const key = this.getAttribute('key');
    const memberKey = this.getAttribute('memberKey');
    this.classList.toggle('selectedToDelete');
    if (this.classList.contains('selectedToDelete')) {
        membercountToDelete += 1;
        idContainer.push(key);
        if (idMembers.indexOf(memberKey) == -1) { idMembers.push(memberKey) };
    } else {
        membercountToDelete -= 1;
        const position = idContainer.indexOf(key);
        idContainer.splice(position, 1);
        const positionMember = idContainer.indexOf(memberKey);
        idMembers.splice(positionMember, 1)
    };
    numberToDelete.textContent = `Registro A Eliminar: ${membercountToDelete}`;
};

function mouseEvent(active, element, cls, results) {
    if (cls == 'mouseoverRemoveList' || cls == 'mouseoverEditList') {
        if (active) {
            if (cls == 'mouseoverRemoveList') {
                element.addEventListener('mouseover', () => { element.style.background = '#ff0000' });
                element.addEventListener('mouseout', () => { element.style.background = '' });            
            } else {
                element.addEventListener('mouseover', () => { element.style.background = '#00c42e' });
                element.addEventListener('mouseout', () => { element.style.background = '' });
            };
            results.forEach(result => result.classList.add('activeCursor'));
        } else {
            results.forEach(result => result.classList.remove('activeCursor'));
            element.addEventListener('mouseover', () => { element.style.background = '' });
            element.addEventListener('mouseout', () => { element.style.background = '' });
        };
        return;
    } else {
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
    };
    return;
};

discipleshipMemberInformation = document.querySelectorAll('.id');
consolidations = document.querySelectorAll('.consolidation');

deleteDiscipleshipMember.addEventListener('click', () => {
    deleteValidation = 'discipleshipMember';
    eventsValidation = true;
    activeMouseEvent(true, true, results, 'mouseoverDelete');
    spanTitle.textContent = 'Seleccione El Miembro Que Desea Eliminar Del Discipulado';
    bars.style.display = 'none';
    nav.style.display = 'none';
    deleteDiscipleshipMember.style.display = 'none';
    rollCall.style.display = 'none';
    addMemberToDiscipleship.style.display = 'none';
    deleteBar.style.transform = 'translateY(0)';
    filter.style.display = 'none';
});

send.addEventListener('click', async e => {
    e.preventDefault();

    send.style.display = 'none';
    cancelMemberSend.style.display = 'none';
    loading(addMemberTitle);

    const memberToDiscipleship = {
        member_id: nameOptions.value,
        assistance: 0,
        consolidationPersonCount: 0,
        discipleshipCreationDate: new Date(),
        modificationDate: new Date()
    };

    await ipcRenderer.invoke('addMemberForDiscipleship', memberToDiscipleship);
});

let editingRollCall = false;

rollCall.addEventListener('click', () => {
    eventsValidation = true;
    idContainer = [];
    activeMouseEvent(true, false, results, 'mouseoverRollCall');
    filter.style.display = 'none';
    rollCall.style.display = 'none';
    addMemberToDiscipleship.style.display = 'none';
    deleteDiscipleshipMember.style.display = 'none';
    confirmRollCall.style.display = 'inline-block';
    cancelRollCall.style.display = 'inline-block';
});

cancelRollCall.addEventListener('click', async () => {
    filter.value = 'Ordenar Por Orden De Registro Descendente';
    await ipcRenderer.invoke('getDiscipleshipMembers', 'discipleshipMembers');
    editingRollCall = false;
    eventsValidation = false;
    idContainer = [];
    activeMouseEvent(false, false, results, 'mouseoverRollCall');
    filter.style.display = 'block';
    rollCall.style.display = 'inline-block';
    addMemberToDiscipleship.style.display = 'inline-block';
    deleteDiscipleshipMember.style.display = 'inline-block';
    results.forEach(result => result.classList.remove('selectedToRollCall'));
    confirmRollCall.style.display = 'none';
    cancelRollCall.style.display = 'none';
});

let currentDateToEdit;

confirmRollCall.addEventListener('click', () => {
    if (idContainer.length !== 0) {
        activeMouseEvent(false, false, results, 'mouseoverRollCall');
        confirmRollCall.style.display = 'none';
        cancelRollCall.style.display = 'none';
        (!editingRollCall) 
            ? ipcRenderer.send('rollCall', idContainer)
            : ipcRenderer.send('updateRollCall',{ids: idContainer, date: currentDateToEdit});
    } else { alert('Seleccione A Quien Desea Pasar La Lista') };
});

ipcRenderer.on('cancelRollCall', () => {
    activeMouseEvent(true, false, results, 'mouseoverRollCall');
    confirmRollCall.style.display = 'inline-block';
    cancelRollCall.style.display = 'inline-block';
});


ipcRenderer.on('errorRollCall', () => {
    eventsValidation = false;
    idContainer = [];
    activeMouseEvent(false, false, results, 'mouseoverRollCall');
    filter.style.display = 'block';
    rollCall.style.display = 'inline-block';
    addMemberToDiscipleship.style.display = 'inline-block';
    deleteDiscipleshipMember.style.display = 'inline-block';
    results.forEach(result => result.classList.remove('selectedToRollCall'));
    confirmRollCall.style.display = 'none';
    cancelRollCall.style.display = 'none';
});

/*-------consolidation System--------*/

const discipleshipTitle = document.getElementById('discipleshipTitle');
const back = document.getElementById('back');

const addPerson = document.getElementById('addPersonToConsolidation');
const deletePerson = document.getElementById('deleteConsolidationPerson');
const updatePerson = document.getElementById('updateConsolidationPerson');
const cancelUpdate = document.getElementById('cancelUpdate');

const consolidationPersonDataTitle = document.querySelector('.consolidationPersonDataTitle');
const consolidationPersonDataResults = document.querySelector('.consolidationPersonDataResults')

let consolidationPersonResults, consolidationPersonProcess;

let idOfTheSelectedDiscipleshipMember;

async function getSpecificConsolidation() {
    addMemberToDiscipleship.style.display = 'none';
    deleteDiscipleshipMember.style.display = 'none';
    rollCall.style.display = 'none';
    loading(spanTitle);
    const key = this.getAttribute('key');
    idOfTheSelectedDiscipleshipMember = key;
    dataTitle.style.display = 'none';
    dataResults.innerHTML = '';
    filter.style.display = 'none';
    searchInput.style.display = 'none';
    await ipcRenderer.invoke('getSpecificConsolidation', key);
};

ipcRenderer.on('consolidationPeopleObtined', (e, person) => {
    back.removeAttribute('key', '');
    consolidationPersonDataResults.innerHTML = '';
    consolidationPersonDataResults.style.display = 'grid';
    discipleshipTitle.textContent = `${person[0].nameAbbreviation}/Consolidacion`;
    back.style.display = 'inline-block';
    addPerson.style.display = 'inline-block';
    clearInterval(getInterval);
    spanTitle.textContent = '';
    consolidationProcessDataResults.innerHTML = '';
    consolidationProcessDataTitle.style.display = 'none';
    if (Object.keys(person[0]).length === 1) {
        animation = 0;
        spanTitle.textContent = '';
        thereAreNot.textContent = `${person[0].nameAbbreviation} No Tiene A Nadie Consolidando`;
    } else {
        deletePerson.style.display = 'inline-block';
        updatePerson.style.display = 'inline-block';
        consolidationPersonDataTitle.style.display = 'grid';
        for (let i = 0; i <= person.length; i++) {
            let result = `
                <div class="consolidationPersonResult" key="${person[i].id}" memberKey="${person[i].discipleship_id}">
                    <h1 class="consolidationPersonId">${person[i].id}</h1>
                    <h1>${person[i].name} ${person[i].lastName}</h1>
                    <h1>${person[i].age}</h1>
                    <h1>${person[i].phoneNumber}</h1>
                    <h1>${person[i].address}</h1>
                    <h1 class="consolidationProcess" key="${person[i].id}" memberKey="${person[i].discipleship_id}">Proceso</h1>
                </div>
            `;
            consolidationPersonDataResults.innerHTML += result;
            consolidationPersonResults = document.querySelectorAll('.consolidationPersonResult');
            consolidationPersonProcess = document.querySelectorAll('.consolidationProcess');
            setInterval(() => {
                if (!eventsValidation) consolidationPersonProcess.forEach(consolidation => consolidation.addEventListener('click', getConsolidationProcess))
                else consolidationPersonProcess.forEach(consolidation => consolidation.removeEventListener('click', getConsolidationProcess));
            }, 400);
        };
    };
});

addPerson.addEventListener('click', async () => {
    ipcRenderer.send('activeToAddPersonToConsolidation', idOfTheSelectedDiscipleshipMember);
});

setInterval(() => {
    if (!eventsValidation) consolidations.forEach(consolidation => consolidation.addEventListener('click', getSpecificConsolidation))
    else consolidations.forEach(consolidation => consolidation.removeEventListener('click', getSpecificConsolidation));
}, 400);

deletePerson.addEventListener('click', () => {
    deleteValidation = 'consolidationPerson';
    activeMouseEvent(true, true, consolidationPersonResults, 'mouseoverDelete');
    spanTitle.textContent = 'Seleccione Las Personas Que Desea Eliminar De La Consolidacion';
    back.style.display = 'none';
    bars.style.display = 'none';
    nav.style.display = 'none';
    deletePerson.style.display = 'none';
    updatePerson.style.display = 'none';
    deleteBar.style.transform = 'translateY(0)';
    filter.style.display = 'none';
});

ipcRenderer.on('cancel', () => {
    deleteBar.style.transform = 'translateY(0)';
    if (deleteValidation == 'discipleshipMember') {
        activeMouseEvent(true, true, results, 'mouseoverDelete');
        addMemberToDiscipleship.style.display = 'inline-block';
    } else if (deleteValidation == 'consolidationPerson') {
        activeMouseEvent(true, true, consolidationPersonResults, 'mouseoverDelete');
        addPerson.style.display = 'inline-block';
    } else {
        activeMouseEvent(true, true, consolidationProcessResults, 'mouseoverDelete');
        addProcess.style.display = 'inline-block';
    };
});

updatePerson.addEventListener('click', () => {
    activeMouseEvent(true, false, consolidationPersonResults, 'mouseoverPersonToUpdate');
    spanTitle.textContent = 'Seleccione A La Persona De Consolidacion Que Desea Actualizar, Los Datos A Actualizar Se Aplicaran En Todos Los Registros';
    back.style.display = 'none'
    addPerson.style.display = 'none';
    deletePerson.style.display = 'none';
    updatePerson.style.display = 'none';
    filter.style.display = 'none';
    cancelUpdate.style.display = 'inline-block';
});

cancelUpdate.addEventListener('click', () => {
    activeMouseEvent(false, false, consolidationPersonResults, 'mouseoverPersonToUpdate');
    spanTitle.textContent = '';
    back.style.display = 'block'
    addPerson.style.display = 'inline-block';
    deletePerson.style.display = 'inline-block';
    updatePerson.style.display = 'inline-block';
    filter.style.display = 'inline-block';
    cancelUpdate.style.display = 'none';
});

ipcRenderer.on('loading', () => {
    loading(spanTitle);
    activeMouseEvent(false, false, consolidationPersonResults, 'mouseoverUpdate');
    cancelUpdate.style.display = 'none';
    addMemberToDiscipleship.style.display = 'none';
    deleteDiscipleshipMember.style.display = 'none';
    rollCall.style.display = 'none';
    back.style.display = 'none';
    bars.style.display = 'none';
    nav.style.display = 'none';
    addPerson.style.display = 'none';
    deletePerson.style.display = 'none';
    updatePerson.style.display = 'none';
});

/*-------consolidation Process--------*/

const addProcess = document.getElementById('addProcess');
const deleteProcess = document.getElementById('deleteProcess');
const updateProcess = document.getElementById('updateProcess');
const cancelUpdateProcess = document.getElementById('cancelUpdateProcess');

const consolidationProcessDataTitle = document.querySelector('.consolidationProcessDataTitle');
const consolidationProcessDataResults = document.querySelector('.consolidationProcessDataResults');

let idPersonForAddProcess, consolidationProcessResults;

async function getConsolidationProcess() {
    const key = this.getAttribute('key');
    const memberKey = this.getAttribute('memberKey');
    loading(spanTitle);
    consolidationPersonDataResults.style.display = 'none';
    consolidationPersonDataTitle.style.display = 'none';
    cancelUpdate.style.display = 'none';
    addMemberToDiscipleship.style.display = 'none';
    deleteDiscipleshipMember.style.display = 'none';
    rollCall.style.display = 'none';
    back.style.display = 'none';
    addPerson.style.display = 'none';
    deletePerson.style.display = 'none';
    updatePerson.style.display = 'none';
    await ipcRenderer.invoke('getProcess', [key, memberKey]);
};

let processValidation = false;
let processInformationButtons;

ipcRenderer.on('process', (e, process) => {
    idPersonForAddProcess = process[0].idPerson;
    addProcess.style.display = 'inline-block';
    spanTitle.textContent = '';
    clearInterval(getInterval);
    animation = 0;
    processValidation = true;
    back.style.display = 'block';
    back.setAttribute('key', process[0].idDiscipleship);
    consolidationPersonDataResults.innerHTML = '';
    discipleshipTitle.textContent = `${process[0].nameAbbreviation}/Consolidacion/${process[0].personName}`;
    if (Object.keys(process[0]).length <= 4) thereAreNot.textContent = `${process[0].personName} No Tiene Procesos`
    else {
        consolidationProcessDataTitle.style.display = 'grid';
        deleteProcess.style.display = 'inline-block';
        updateProcess.style.display = 'inline-block';
        for (let i = 0; i <= process.length; i++) {
            let result = `
                <div class="consolidationProcessResult" key="${process[i].id}" idPerson="${process[0].idPerson}">
                    <h1 class="consolidationProcessId" key="${process[i].id}">${process[i].id}</h1>
                    <h1>${process[i].title}</h1>
                    <h1>${process[i].consolidationLeader}</h1>
                    <h1>${process[i].observation}</h1>
                    <h1>${getDate(process[i].creationDate)}</h1>
                </div>
            `;
            consolidationProcessDataResults.innerHTML += result;
            processInformationButtons = document.querySelectorAll('.consolidationProcessId');
            consolidationProcessResults = document.querySelectorAll('.consolidationProcessResult');

            setInterval(() => {
                if (!eventsValidation) processInformationButtons.forEach(processInformationButton => processInformationButton.addEventListener('click', processInformation))
                else processInformationButtons.forEach(processInformationButton => processInformationButton.removeEventListener('click', processInformation));
            }, 400);
        };
    }
});

back.addEventListener('click', async function () {
    back.style.display = 'none';
    addProcess.style.display = 'none';
    deleteProcess.style.display = 'none';
    updateProcess.style.display = 'none';
    addPerson.style.display = 'none';
    deletePerson.style.display = 'none';
    updatePerson.style.display = 'none';
    thereAreNot.textContent = '';
    loading(spanTitle);
    if (!processValidation) {
        searchInput.style.display = 'inline-block';
        filter.value = 'Ordenar Por Orden De Registro Descendente';
        filter.style.display = 'block';
        discipleshipTitle.textContent = `Discipulado`;
        addMemberToDiscipleship.style.display = 'inline-block';
        idOfTheSelectedDiscipleshipMember = '';
        await ipcRenderer.invoke('getDiscipleshipMembers', 'discipleshipMembers');
    } else {
        const key = this.getAttribute('key');
        processValidation = false;
        await ipcRenderer.invoke('getSpecificConsolidation', key);
    };
});

addProcess.addEventListener('click', () => { ipcRenderer.send('activateWindowToAddProcess', idPersonForAddProcess) });

deleteProcess.addEventListener('click', () => {
    deleteValidation = 'personProcess';
    activeMouseEvent(true, true, consolidationProcessResults, 'mouseoverDelete');
    spanTitle.textContent = 'Seleccione Las Personas Que Desea Eliminar De La Consolidacion';
    back.style.display = 'none';
    bars.style.display = 'none';
    nav.style.display = 'none';
    deleteProcess.style.display = 'none';
    updateProcess.style.display = 'none';
    deleteBar.style.transform = 'translateY(0)';
    filter.style.display = 'none';
});

cancelDelete.addEventListener('click', () => {
    eventsValidation = false;
    idContainer = [];
    idMembers = [];
    membercountToDelete = 0;
    numberToDelete.textContent = `Registro A Eliminar: 0`;
    spanTitle.textContent = '';
    bars.style.display = 'block';
    nav.style.display = 'block';
    deleteBar.style.transform = 'translateY(-100px)';
    if (deleteValidation == 'discipleshipMember') {
        results.forEach(result => result.classList.remove('selectedToDelete'));
        activeMouseEvent(false, true, results, 'mouseoverDelete');
        deleteDiscipleshipMember.style.display = 'inline-block';
        rollCall.style.display = 'inline-block';
        addMemberToDiscipleship.style.display = 'inline-block';
    } else if (deleteValidation == 'consolidationPerson') {
        back.style.display = 'block';
        consolidationPersonResults.forEach(result => result.classList.remove('selectedToDelete'));
        activeMouseEvent(false, true, consolidationPersonResults, 'mouseoverDelete');
        deletePerson.style.display = 'inline-block';
        updatePerson.style.display = 'inline-block';
    } else {
        back.style.display = 'block';
        consolidationProcessResults.forEach(result => result.classList.remove('selectedToDelete'));
        activeMouseEvent(false, true, consolidationProcessResults, 'mouseoverDelete');
        deleteProcess.style.display = 'inline-block';
        updateProcess.style.display = 'inline-block';
    };
    filter.style.display = 'block';
});

confirm.addEventListener('click', () => {
    if (membercountToDelete >= 1) {
        (deleteValidation == 'discipleshipMember') ? activeMouseEvent(false, true, results, 'mouseoverDelete') : activeMouseEvent(false, true, consolidationPersonResults, 'mouseoverDelete');
        filter.style.display = 'none';
        deleteBar.style.transform = 'translateY(-100px)';
        if (deleteValidation == 'discipleshipMember') {
            addMemberToDiscipleship.style.display = 'none';
            deleteDiscipleshipMember.style.display = 'none';
            rollCall.style.display = 'none';
            ipcRenderer.send('removeDiscipleshipMembers', [idContainer, idMembers]);
        } else if (deleteValidation == 'consolidationPerson') {
            addPerson.style.display = 'none';
            deletePerson.style.display = 'none';
            updatePerson.style.display = 'none';
            ipcRenderer.send('removeConsolidationPerson', [idContainer, idMembers]);
        } else {
            addProcess.style.display = 'none';
            deleteProcess.style.display = 'none';
            updateProcess.style.display = 'none';
            ipcRenderer.send('removePersonProcess', idContainer);
        };
    } else alert('Seleccione Un Registro A Eliminar');
});

updateProcess.addEventListener('click', () => {
    activeMouseEvent(true, false, consolidationProcessResults, 'mouseoverProcessToUpdate');
    spanTitle.textContent = 'Seleccione El Proceso Que Desea Actualizar';
    back.style.display = 'none'
    addProcess.style.display = 'none';
    deleteProcess.style.display = 'none';
    updateProcess.style.display = 'none';
    filter.style.display = 'none';
    cancelUpdateProcess.style.display = 'inline-block';
});

cancelUpdateProcess.addEventListener('click', () => {
    activeMouseEvent(false, false, consolidationProcessResults, 'mouseoverProcessToUpdate');
    spanTitle.textContent = '';
    back.style.display = 'block'
    addProcess.style.display = 'inline-block';
    deleteProcess.style.display = 'inline-block';
    updateProcess.style.display = 'inline-block';
    filter.style.display = 'inline-block';
    cancelUpdateProcess.style.display = 'none';
});

const processInformationSheet = document.getElementById('processInformation');
const processExit = document.getElementById('processExit');

const processName = document.getElementById('processName');
const processId = document.querySelector('.processId');
const consolidationLeader = document.querySelector('.consolidationLeader');
const totalTime = document.querySelector('.totalTime');
const processObservation = document.querySelector('.processObservation');
const processDescription = document.querySelector('.processDescription');
const processCreationDate = document.querySelector('.processCreationDate');
const processModificationDate = document.querySelector('.processModificationDate');

async function processInformation() {
    document.querySelector('body').style.overflow = 'hidden';
    watchingInformation = true;
    dark.classList.add('darkActive');
    processInformationSheet.style.display = 'flex';
    const key = this.getAttribute('key');

    await ipcRenderer.invoke('getOneProcess', key);
};

ipcRenderer.on('processObtined', (e, process) => {
    process = process[0][0];

    let date = new Date();
    const diff = date - process.creationDate;
    const totalTimeToCalculateInDays = Math.trunc(diff / (1000 * 60 * 60 * 24));

    processName.textContent = process.title;
    processId.textContent = process.id;
    consolidationLeader.textContent = process.consolidationLeader;
    totalTime.textContent = `${(totalTimeToCalculateInDays == 1) ? totalTimeToCalculateInDays + '  Dia' : (totalTimeToCalculateInDays == 0) ? 'Creado Hoy' : totalTimeToCalculateInDays + '  Dias'}`;
    processObservation.textContent = process.observation;
    processDescription.textContent = process.description;
    processCreationDate.textContent = getDate(process.creationDate);
    processModificationDate.textContent = getDate(process.modificationDate);
});

processExit.addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'auto';
    watchingInformation = false;
    dark.classList.remove('darkActive');
    processInformationSheet.style.display = 'none';
});

/* Eventos De Lista*/

const assistanceButton = document.getElementById('assistance');
const registerListExit = document.getElementById('registerListExit');

const editList = document.getElementById('editList');
const cancelListEvent = document.getElementById('cancelListEvent');
const removeList = document.getElementById('removeList');

const spanTitleList = document.querySelector('.spanTitleList');

const listContainer = document.querySelector('.listContainer');

const dateDataTitle = document.querySelector('.dateDataTitle');
const assistance = document.querySelector('.assitance');

const loadingList = document.querySelector('.loadingList');
const thereAreNotList = document.querySelector('.thereAreNotList');

assistanceButton.addEventListener('click', async () => {
    if (!eventsValidation) {
        loading(loadingList);
        document.querySelector('body').style.overflow = 'hidden';
        listContainer.style.display = 'block';
        await ipcRenderer.invoke('getListRegister');
    };
});

registerListExit.addEventListener('click', () => {
    cancelListEvent.style.display = 'none';
    editList.style.display = 'inline-block';
    spanTitleList.textContent = '';
    document.querySelector('body').style.overflow = 'auto';
    listContainer.style.display = 'none';
});

ipcRenderer.on('listRegisterObtined', (e, list) => {
    clearInterval(getInterval);
    loadingList.textContent = '';
    let currentDate = undefined;
    assistance.innerHTML = '';
    if (list.length !== 0) {
        dateDataTitle.innerHTML = '<h4>Nombre</h4>';
        for (let i = 0; i <= list.length; i++) {
            const dateObtined = getDate(list[i].creationDate);
            if (dateObtined !== currentDate) {
                currentDate = dateObtined;
                dateDataTitle.innerHTML += `<h4 class="listDate" listCreation="${list[i].creationDate}">${dateObtined}</h4>`;
            };
            if (!document.querySelector(`.assistance${list[i].discipleship_id}`)) {
                let personalAssistance = `
                    <div class="assistance assistance${list[i].discipleship_id}">
                        <h1>${list[i].nameAbbreviation}</h1>
                        ${(list[i].verification == 1 && list[i].verification !== null && list[i].verification !== undefined) ? '<h1 class="arrive"></h1>' : '<h1></h1>'}
                    </div>
                `;
                assistance.innerHTML += personalAssistance;
            } else {
                let personalAssistance = (list[i].verification == 1) ? '<h1 class="arrive"></h1>' : '<h1></h1>';
                document.querySelector(`.assistance${list[i].discipleship_id}`).innerHTML += personalAssistance;
            };
        };
    } else thereAreNotList.textContent = 'No Has Pasado La Lista';
});

editList.addEventListener('click', () => {
    const assistanceDate = document.querySelectorAll('.listDate');
    editList.style.display = 'none';
    removeList.style.display = 'none';
    registerListExit.style.display = 'none';
    cancelListEvent.style.display = 'inline-block';
    spanTitleList.textContent = 'Seleccione La Fecha Que Desea Editar';
    activeMouseEvent(true, false, assistanceDate, 'mouseoverEditList');
});

cancelListEvent.addEventListener('click', () => {
    const assistanceDate = document.querySelectorAll('.listDate');
    editList.style.display = 'inline-block';
    removeList.style.display = 'inline-block';
    registerListExit.style.display = 'inline-block';
    cancelListEvent.style.display = 'none';
    spanTitleList.textContent = '';
    activeMouseEvent(false, false, assistanceDate, 'mouseoverEditList');
    activeMouseEvent(false, true, assistanceDate, 'mouseoverRemoveList');
});

removeList.addEventListener('click', () => {
    const assistanceDate = document.querySelectorAll('.listDate');
    editList.style.display = 'none';
    removeList.style.display = 'none';
    registerListExit.style.display = 'none';
    cancelListEvent.style.display = 'inline-block';
    spanTitleList.textContent = 'Seleccione La Fecha Que Desea Eliminar';
    activeMouseEvent(true, true, assistanceDate, 'mouseoverRemoveList');
});

ipcRenderer.on('editDiscipleshipAssistance', (e, resultEdit) => {
    editingRollCall = true;
    eventsValidation = true;
    idContainer = [];
    filter.style.display = 'none';
    rollCall.style.display = 'none';
    addMemberToDiscipleship.style.display = 'none';
    deleteDiscipleshipMember.style.display = 'none';
    confirmRollCall.style.display = 'inline-block';
    cancelRollCall.style.display = 'inline-block';
    dataResults.textContent = '';
    const members = resultEdit[0];
    currentDateToEdit = new Date(resultEdit[1][0].creationDate);
    for (let i = 0; i <= resultEdit[0].length; i++) {
        const count = members[i].consolidationPersonCount;
        let result = `
            <div class="result result${members[i].id_discipleship}" memberKey="${members[i].id}" key="${members[i].id_discipleship}">
                <div class="smallInformation">
                    <h1 class="id" key="${members[i].id_discipleship}">${members[i].id_discipleship}</h1>
                    <h1>${members[i].assistance}</h1>
                </div>
                <h1>${members[i].nameAbbreviation}</h1>
                <h1 class="consolidation" key="${members[i].id_discipleship}">${(count == 0) ? 'No Consolidando' : validateNumberOfPeopleConsolidating(count)}</h1>
            <div>
        `;
        dataResults.innerHTML += result;
        results = document.querySelectorAll('.result');
        discipleshipMemberInformation = document.querySelectorAll('.id');
        consolidations = document.querySelectorAll('.consolidation');
        resultEdit[1].forEach(assistance => {
            if (assistance.discipleship_id === members[i].id_discipleship && assistance.verification === 1) {
                const result = document.querySelector(`.result${members[i].id_discipleship}`);
                result.classList.add('selectedToRollCall');
                const key = result.getAttribute('key');
                idContainer.push(key);
            };
            activeMouseEvent(true, false, results, 'mouseoverRollCall');
        });
    };
});

/*---------------------------*/

/*
    tarea 2:

        *agregar el grafico de la asistencia
        (ordenandolo por fechas y nombre)

    objetivo: terminar eso en el menor tiempo posible, maximo 3 horas

----------------------------------------------------------------------------

    tarea 3:
        *interfast agradable y sencilla
        (esto incluye seleccion de multiples usuarios, mensaje a enviar,
        boton de enviar, y verificacion al enviar)

        *traer a los miembros y solo los que tengan correos pueden aparecer

        *(tarea adelantada 'correo del administrador guardado en la base de datos')

        *creacion del sistema de enviar correos

    objetivo: terminar eso en el menor tiempo posible, maximo 2 horas

----------------------------------------------------------------------------

    tarea 4:
        *creacion de la interfaz de academia
        (esto incluye que sea facil de usar sin muchos botones)

        *agregar tipo de evaluacion
        (por trabajos, por asistencia, eliminacion
        cual es el puntaje minimo para pasar,
        puntos a evaluar, fecha a culminar,
        etc...)

        *materias y alumnos a agregar
        (se deja a escojer del administrador)

        *sistema de evaluacion
        (el administrador le pondra notas a los
        alumnos en este caso, dado en la evaluacion,
        si es por asistencia el administrador pasara
        asistencia, etc....)

        *finalizacion de academia
        (en este caso se hara una notificacion que la academia
        a terminado, se le mostrara el nombre de la academia con
        un color diferente, se le dara la opcion de finalizado y
        editar, si le da finalizado los registros quedaran permanente,
        es decir apareceran los datos y informacion dada en esa academia
        sin editar ni devolver ningun dato, si da a editar puede hacer una
        extension, por ejemplo poner 10 puntos mas, o participar 10 dias mas
        en ese caso sigue la academia si ningun problema adicional)

        *notas finales
        (si llega a finalizar la academia aqui va a
        mostrar los alumnos que no pasaron,
        los mejores alumnos de los que pasaron,
        los alumnos destacados en su trabajo, en
        este caso si es evaluativo, promedio total
        en notas)

    objetivo terminar en el menor tiempo posible, maximo 5 horas

---------------------------------------------------------------------------------

    tarea 5:
        *crear el sistema de configuracion del administrador
        (poner correo, contrasena, restrinciones de invitado, etc..)

        *creacion de la barra de navegacion superior
        (herramientas, menu, registros,seguridad,etc)

        *funcionalidad de la zona de invitados y restrinciones

        *guardar informacion
        (esto aplica el archivo que va a guardar y cifrar y almacenar en el
        correo en un archivo etc.....)

        *arreglar problemas responsive de la aplicacion

    objetivo terminar en el menor tiempo posible, maximo 2 horas

-----------------------------------------------------------------------------------

    tarea 6:
        * arreglar problemas de disenos etc.
        * creacion de logo
        * exportar el executable de la aplicacion
        *comprobar si funciona

        -- Si es asi terminamos la version 1.0 del software church Administration || Felicidades Programador
*/