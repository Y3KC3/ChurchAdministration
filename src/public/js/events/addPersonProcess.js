const { ipcRenderer } = require('electron');

let id = undefined;

ipcRenderer.on('idPerson', async (e, idPerson) => {
    id = idPerson;
    await ipcRenderer.invoke('getResponsiblePeopleToProcess', idPerson);
});

const consolidationLeader = document.getElementById('consolidationLeader');
const title = document.getElementById('processTitle');
const observation = document.getElementById('observation');
const description = document.getElementById('description');
const send = document.getElementById('send');

let editing = false;
let idToUpdate;

ipcRenderer.on('processObtined', async (e,process) => {
    editing = true;
    id = process[1];
    const processData = process[0][0];
    idToUpdate = processData.id;

    title.value = processData.title;
    observation.value = processData.observation;
    description.value = processData.description;

    await ipcRenderer.invoke('getResponsiblePeopleToProcess', process[1]);
});

ipcRenderer.on('peopleObtined', (e, peopleName) => {
    for (let i = 0; i <= peopleName.length; i++) {
        let option = `<option>${peopleName[i].nameAbbreviation}</option>`;
        consolidationLeader.innerHTML += option;
    };
});

const formValidation = (validation, pClass, text) => {
    if (validation) { document.querySelector(pClass).textContent = text }
    else document.querySelector(pClass).textContent = '';
};

send.addEventListener('click', e => {
    e.preventDefault();

    formValidation(title.value.length <= 3 || title.value.length > 30, '.processTitle', 'El Titulo No Puede Tener Menos De 3 Caracteres Y No Puede Tener Mas De 30 Caracteres');
    formValidation(observation.value.length > 50, '.observationP', 'La Observacion No Puede Tener Mas De 30 Caracteres');
    formValidation(description.value.length > 2500, '.descriptionP', 'La Descripcion No Puede Superar Los 2500 Caracteres');

    if (title.value.length > 3 && title.value.length <= 30 && observation.value.length <= 50 && description.value.length <= 2500) {
        if (id !== undefined) {
            let date = new Date();

            const process = {
                title: title.value,
                consolidationLeader: consolidationLeader.value,
                observation: observation.value,
                description: description.value,
                person_id: id,
                modificationDate: date,
            };

            if (!editing) process.creationDate = date;

            (!editing)
              ? ipcRenderer.send('addProcess', process)
              : ipcRenderer.send('updateProcess',[process,idToUpdate]);
            
        } else { document.getElementById('error').textContent = 'Hubo Un Problema Al Guardar La Informacion, Por Favor Reinicie El Proceso' };
    };
});