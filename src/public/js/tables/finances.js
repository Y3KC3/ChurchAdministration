const { ipcRenderer } = require('electron');

const dataResults = document.querySelector('.dataResults');
const dataTitle = document.querySelector('.dataTitle');
let results, financesInformation;

const amount = document.querySelector('.totalAmount');
const spanTitle = document.querySelector('.spanTitle');
const thereAreNot = document.querySelector('.thereAreNot');

const addFinance = document.getElementById('add');
const removeFinance = document.getElementById('delete');
const updateFinance = document.getElementById('update');
const cancelUpdate = document.getElementById('cancelUpdate');

const searchInput = document.getElementById('searchInput');

const informationSheet = document.getElementById('financeInformation');
const informationExit = document.getElementById('exit');

let getInterval;
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

async function getFinances (){ 
    await ipcRenderer.invoke('getFinances');
    loading();
};
getFinances();

async function sortFinance(order) { await ipcRenderer.invoke('orderFinances', order) };
const filter = document.getElementById('filter');
filter.addEventListener('change', () => {
    sortFinance(filter.value);
    setTimeout(() => { results = document.querySelectorAll('.result') }, 600);
});

async function searchFinance(search) { await ipcRenderer.invoke('lookingForFinances', search) };
searchInput.addEventListener('keyup', () => {
    if (searchInput.value.length !== 0) {
        searchFinance(searchInput.value);
        filter.value = 'Ordenar Por Fecha De Registro Descendente';
        setTimeout(() => { results = document.querySelectorAll('.result') }, 600);
    } else getFinances();
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

ipcRenderer.on('finances', (e,finances) => {
    clearInterval(getInterval);
    spanTitle.textContent = '';
    animation = 0;
    dataResults.innerHTML = '';
    if (finances.length != 0) {
        dataTitle.style.display = 'grid';
        removeFinance.style.display = 'inline-block';
        updateFinance.style.display = 'inline-block';
        filter.style.display = 'block';
        thereAreNot.textContent = '';
        let totalAmount = 0;
        for (let i = 0; i <= finances.length; i++){
            let result = `
                <div class="result" key="${finances[i].id}">
                    <h1 class="financeName" key="${finances[i].id}">${finances[i].name}</h1>
                    <h1 ${(finances[i].dataType === 'Ingreso') ? '' : 'class="expenses"'}>${(finances[i].dataType === 'Ingreso') ? '+' : '-'}${finances[i].amount}$</h1>
                    <h1 ${(finances[i].dataType === 'Ingreso') ? '' : 'class="expenses"'}>${getDate(finances[i].creationDate)}</h1>
                </div>
            `;
            (finances[i].dataType == 'Ingreso') ? totalAmount += finances[i].amount : totalAmount -= finances[i].amount;
            if (totalAmount !== 0) amount.textContent = `Cantidad Total: ${totalAmount}$`;
            results = document.querySelectorAll('.result');
            financesInformation = document.querySelectorAll('.financeName');
            dataResults.innerHTML += result;
        };
    } else {
        dataTitle.style.display = 'none';
        removeFinance.style.display = 'none';
        updateFinance.style.display = 'none';
        thereAreNot.textContent = 'No Hay Registros De Finanzas Agregados';
    };
});

async function information() {
    document.querySelector('body').style.overflow = 'hidden';
    watchingInformation = true;
    document.querySelector('.dark').classList.add('darkActive');
    informationSheet.style.display = 'flex';
    const key = this.getAttribute('key');

    await ipcRenderer.invoke('getOneFinance', key);
};

let watchingInformation = false; 
let eventsValidation = false;

setInterval(() => {
    if (!eventsValidation) financesInformation.forEach(financeInformation => financeInformation.addEventListener('click', information))
    else financesInformation.forEach(financeInformation => financeInformation.removeEventListener('click', information));
}, 400);

const name = document.getElementById('name');
const id = document.querySelector('.id');
const dataType = document.querySelector('.dataType');
const specifyDataType = document.querySelector('.specifyDataType');
const amountInformation = document.querySelector('.amountInformation');
const description = document.querySelector('.description');
const creationDate = document.querySelector('.creationDate');
const modificationDate = document.querySelector('.modificationDate');

ipcRenderer.on('financeInformation', (e,financeData) => {
    financeData = financeData[0];

    name.textContent = financeData.name;
    id.textContent = financeData.id;
    dataType.textContent = financeData.dataType;
    specifyDataType.textContent = financeData.specifyDataType;
    amountInformation.textContent = (financeData.dataType == 'Ingreso') ? financeData.amount : `-${financeData.amount}$`;
    description.textContent = financeData.description;
    creationDate.textContent = getDate(financeData.creationDate);
    modificationDate.textContent = getDate(financeData.modificationDate);
});

informationExit.addEventListener('click', () => {
    document.querySelector('body').style.overflow = 'auto';
    watchingInformation = false;
    document.querySelector('.dark').classList.remove('darkActive');
    informationSheet.style.display = 'none';
});

document.getElementById('bars').addEventListener('click', () => {
    scroll(0,0);
    document.querySelector('body').style.overflow = 'hidden'
    document.querySelector('.dark').classList.toggle('darkActive');
    document.querySelector('.sidebar').classList.toggle('activeBars');
});

document.querySelector('.dark').addEventListener('click', () => {
    if (!eventsValidation) {
        document.querySelector('body').style.overflow = 'auto'
        document.querySelector('.dark').classList.toggle('darkActive');
        document.querySelector('.sidebar').classList.toggle('activeBars');
    };
});

addFinance.addEventListener('click', () => { ipcRenderer.send('activeToAddFiance') });

ipcRenderer.on('loading', () => { 
    loading() 
    addFinance.style.display = 'none';
    removeFinance.style.display = 'none';
    updateFinance.style.display = 'none';
});

let membercountToDelete = 0;
let idContainer = [];

let updateValidation = false;
let deleteValidation = false;

const deleteBar = document.querySelector('.deleteBar');
const confirm = document.getElementById('confirm');
const cancelDelete = document.getElementById('cancelDelete');
const numberToDelete = document.getElementById('numberToDelete');

setTimeout(() => {
    results = document.querySelectorAll('.result');
    financesInformation = document.querySelectorAll('.financeName');

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
        await ipcRenderer.invoke('getOneFinanceForUpdate', key);
        updateValidation = false;
        activeMouseEvent(updateValidation, false, 'mouseoverUpdate');
        spanTitle.textContent = '';
        removeFinance.style.display = 'inline-block';
        updateFinance.style.display = 'inline-block';
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

    updateFinance.addEventListener('click', () => {
        updateValidation = true;
        activeMouseEvent(updateValidation, false, 'mouseoverUpdate');
        spanTitle.textContent = 'Selecciona El La Finanza Que Desea Actualizar';
        searchInput.style.display = 'none';
        removeFinance.style.display = 'none';
        updateFinance.style.display = 'none';
        filter.style.display = 'none';
        cancelUpdate.style.display = 'inline-block';
    });

    cancelUpdate.addEventListener('click', () => {
        updateValidation = false;
        activeMouseEvent(updateValidation, false, 'mouseoverUpdate');
        spanTitle.textContent = '';
        searchInput.style.display = 'inline-block';
        removeFinance.style.display = 'inline-block';
        updateFinance.style.display = 'inline-block';
        filter.style.display = 'block';
        cancelUpdate.style.display = 'none';
    });

    removeFinance.addEventListener('click', () => {
        eventsValidation = true;
        deleteValidation = true;
        document.getElementById('bars').style.display = 'none';
        document.querySelector('.navAbsolutePosition').style.display = 'none';
        activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
        deleteBar.style.transform = 'translateY(0)';
        spanTitle.textContent = 'Seleccione Los Nombres De Los Miembros Que Desea Eliminar';
        searchInput.style.display = 'none';
        removeFinance.style.display = 'none';
        updateFinance.style.display = 'none';
        filter.style.display = 'none';
    });

    cancelDelete.addEventListener('click', () => {
        eventsValidation = false;
        deleteValidation = false;
        idContainer = [];
        activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
        deleteBar.style.transform = 'translateY(-100px)';
        document.getElementById('bars').style.display = 'block';
        document.querySelector('.navAbsolutePosition').style.display = 'block';
        spanTitle.textContent = '';
        results.forEach(result => result.classList.remove('selectedToDelete'));
        membercountToDelete = 0;
        numberToDelete.textContent = `Registro A Eliminar: 0`;
        searchInput.style.display = 'inline-block';
        removeFinance.style.display = 'inline-block';
        updateFinance.style.display = 'inline-block';
        filter.style.display = 'block';
    });

    confirm.addEventListener('click', () => {        
        if (membercountToDelete >= 1) {      
            deleteValidation = false;
            activeMouseEvent(deleteValidation, true, 'mouseoverDelete');      
            deleteBar.style.transform = 'translateY(-100px)';
            addFinance.style.display = 'none';
            removeFinance.style.display = 'none';
            updateFinance.style.display = 'none';
            filter.style.display = 'none';
            ipcRenderer.send('removeFinance', idContainer)
        } else alert('Seleccione Un Registro A Eliminar');
    });

    ipcRenderer.on('cancel', () => {
        eventsValidation = false;
        deleteValidation = true;
        activeMouseEvent(deleteValidation, true, 'mouseoverDelete');
        deleteBar.style.transform = 'translateY(0)';
        add.style.display = 'inline-block';
    });
}, 1000);