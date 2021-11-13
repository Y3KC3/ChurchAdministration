const { ipcRenderer } = require('electron');
const financeName = document.getElementById('name');
const dataType = document.getElementById('dataType');
const specifyDataType = document.getElementById('specifyDataType');
const amount = document.getElementById('amount');
const description = document.getElementById('description');
const send = document.getElementById('send');

const specifyDataTypeInput = document.getElementById('specifyDataTypeInput');

specifyDataType.addEventListener('change', () => {
    (specifyDataType.value === 'Otro') ? specifyDataTypeInput.classList.replace('inactive','active') : specifyDataTypeInput.classList.replace('active','inactive');
});

let editing = false;
let id;

ipcRenderer.on('financeObtained', (e,data) => {
    editing = true;
    data = data[0];
    id = data.id;

    if (data.specifyDataType !== 'Diezmo' &&
        data.specifyDataType !== 'Ofrenda' &&
        data.specifyDataType !== 'Primicia' &&
        data.specifyDataType !== 'Pacto' &&
        data.specifyDataType !== 'Gasto') {
            specifyDataType.value = 'Otro';
            specifyDataTypeInput.classList.replace('inactive','active');
            specifyDataTypeInput.value = data.specifyDataType;
        } else {
            specifyDataType.value = data.specifyDataType;
        };

    financeName.value = data.name;
    dataType.value = data.dataType;
    amount.value = data.amount;
    description.value = data.description;
});

const formValidation = (validation,pClass,text) => {
    if (validation) { document.querySelector(pClass).textContent = text }
    else document.querySelector(pClass).textContent = '';
};

send.addEventListener('click', e => {
    e.preventDefault();

    formValidation(financeName.value.length > 20 || financeName.value.length <= 2,'.name','El Nombre De La Finanza No Puede Tener Menos De 2 Caracteres Ni Tener Mas De 20 Caracteres');
    formValidation(amount.value > 1000000000 || amount.value == '','.amount','La Cantidad No Puede Ser Mayor Que Un Millardo (1000000000) Y No Puede Ser Nulla');
    formValidation(specifyDataTypeInput.value.length > 15,'.specifyDataType','El Valor Del Dato Especifico No Puede Ser Mayor A 15 Caracteres');

    if (financeName.value.length < 15 && financeName.value.length >= 3 && amount.value < 1000000000 && amount.value !== '') {
        let date = new Date();

        const finance = {
            name: financeName.value,
            dataType: dataType.value,
            specifyDataType: (specifyDataType.value === 'Otro') ? specifyDataTypeInput.value : specifyDataType.value,
            amount: amount.value,
            description: description.value,
            modificationDate: date,
        };

        if (!editing) finance.creationDate = date;

        (!editing)
            ? ipcRenderer.send('addFinance',finance)
            : ipcRenderer.send('updateFinance',[finance,id]);
    };
});