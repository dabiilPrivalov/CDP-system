(() => {

    const modalButton = document.querySelector('.footer__btn');
    const overlay = document.querySelector('.footer__overlay');
    const closeButtons = document.querySelectorAll('.cancel');
    const table = document.getElementById('table');

    //получаем список клиентов из базы данных
    async function getClient() {
        const response = await fetch('http://localhost:3000/api/clients');
        const data = await response.json();
        return data
    }

    //отрисовка таблицы клиентов
    async function createClient(clients) {
        table.innerHTML = '';
        clients = await clients;
        clients.forEach(element => {
            createClientElemnt(element);
        })
    }
    createClient(getClient());

    //сортировка по id и по дате
    let reverse; //переключает тип сортировки

    async function sortMain(reverse, prop, e) {
        const clients = await getClient();
     
        if (reverse) {
            e.target.closest('th').querySelector('.arrow').classList.add('click');
            clients.sort((a, b) => {
                if (a[prop] > b[prop]) return -1
            })
        } else {
            e.target.closest('th').querySelector('.arrow').classList.remove('click');
            clients.sort((a, b) => {
                if (a[prop] < b[prop]) return -1
            })
        }
        createClient(clients);
    }

    //сортировка по имени
    
    async function sortName(reverse, e) {
        const clients = await getClient();
        if (reverse) {
            e.target.closest('th').querySelector('.arrow').classList.add('click');
            clients.sort((a, b) => {
                if ((a.surname + a.name + a.lastName) > (b.surname + b.name + b.lastName)) return -1
            })
        } else {
            e.target.closest('th').querySelector('.arrow').classList.remove('click');
            clients.sort((a, b) => {
                if ((a.surname + a.name + a.lastName) < (b.surname + b.name + b.lastName)) return -1
            })
        }

        createClient(clients);
    }

    const idCol = document.querySelector('.id');
    idCol.addEventListener('click', (e) => {
        sortMain(reverse, prop = 'id', e);
        reverse = !reverse;
    });

    const nameCol = document.querySelector('.name');
    nameCol.addEventListener('click', (e) => {
        sortName(reverse, e);
        reverse = !reverse;
    });

    const dateCol = document.querySelector('.date');
    dateCol.addEventListener('click', (e) => {
        sortMain(reverse, prop = 'createdAt', e);
        reverse = !reverse;
    });

    const editCol = document.querySelector('.edit');
    editCol.addEventListener('click', (e) => {
        sortMain(reverse, prop = 'updatedAt', e);
        reverse = !reverse;
    });


    //фильтр
    let timerId; //задаем параметр для сброса таймаута
    const searchField = document.getElementById('search');
    searchField.addEventListener('input', ()=>{
        clearTimeout(timerId);
        timerId = setTimeout(filterClients, 300);
    });

    async function filterClients() {
        let filteredArray = await getClient();
        let newarray = filteredArray.filter(client => {
            let date = dateFormat(client);
            return client.name.trim().toUpperCase().includes(searchField.value.toUpperCase()) || 
            client.surname.trim().toUpperCase().includes(searchField.value.toUpperCase()) ||
            client.lastName.trim().toUpperCase().includes(searchField.value.toUpperCase()) ||
            client.id.trim().toUpperCase().includes(searchField.value.toUpperCase()) ||
            date.correctTime.includes(searchField.value) || date.dateArray[0].includes(searchField.value) ||
            date.correctTimeEdit.includes(searchField.value) || date.dateEditArray[0].includes(searchField.value)
            });
        createClient(newarray);
    }

    // создадим функцию форматирования даты, для дальнейшей работы с данными даты
    function dateFormat(client) {
        // данные даты создания клиента
        const parseDate = new Date(client.createdAt);
        const dateArray = parseDate.toLocaleString().split(',');
        const year = dateArray[0];
        const time = dateArray[1].split(':');
        time.pop();
        const correctTime = time.join(':');

        // данные даты последнего редактирования клиента
        const parseDateEdit = new Date(client.updatedAt);
        const dateEditArray = parseDateEdit.toLocaleString().split(',');
        const yearEdit = dateEditArray[0];
        const timeEdit = dateEditArray[1].split(':');
        timeEdit.pop();
        const correctTimeEdit = timeEdit.join(':');
        
        return {
            dateArray,
            year,
            time,
            correctTime,

            dateEditArray,
            yearEdit,
            timeEdit,
            correctTimeEdit,
        }
    }

    //создание строки с клиентом
    function createClientElemnt(element) {
        const row = document.createElement('tr');
        const colID = document.createElement('td');
        const colName = document.createElement('td');
        const colDate = document.createElement('td');
        const colEdit = document.createElement('td');
        const colContacts = document.createElement('td');
        const colAction = document.createElement('td');

        colID.textContent = element.id;
        colName.textContent = element.surname.trim() + ' ' + element.name.trim() + ' ' + element.lastName.trim() + ' ';

        let date = dateFormat(element);

        colDate.textContent = `${date.year} ${date.correctTime}`;
        colEdit.textContent = `${date.yearEdit} ${date.correctTimeEdit}`;

        element.contacts.forEach(contact => {
            if (contact.type === 'Телефон') {
                const phone = document.createElement('button');
                const value = document.createElement('span');
                value.textContent = `${contact.type}: ${contact.value}`;
                phone.setAttribute("id", "myButton");
                phone.classList.add('phone', 'type');
                value.classList.add('value');
                phone.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><circle cx="8" cy="8" r="8" fill="#9873FF"/><path d="M11.56 9.50222C11.0133 9.50222 10.4844 9.41333 9.99111 9.25333C9.83556 9.2 9.66222 9.24 9.54222 9.36L8.84444 10.2356C7.58667 9.63556 6.40889 8.50222 5.78222 7.2L6.64889 6.46222C6.76889 6.33778 6.80444 6.16444 6.75556 6.00889C6.59111 5.51556 6.50667 4.98667 6.50667 4.44C6.50667 4.2 6.30667 4 6.06667 4H4.52889C4.28889 4 4 4.10667 4 4.44C4 8.56889 7.43556 12 11.56 12C11.8756 12 12 11.72 12 11.4756V9.94222C12 9.70222 11.8 9.50222 11.56 9.50222Z" fill="white"/></g></svg>'
                phone.append(value);
                colContacts.append(phone);
            }
            if (contact.type === 'Email') {
                const email = document.createElement('button');
                const value = document.createElement('span');
                value.textContent = `${contact.type}: ${contact.value}`;
                email.classList.add('email', 'type');
                value.classList.add('value');
                email.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM4 5.75C4 5.3375 4.36 5 4.8 5H11.2C11.64 5 12 5.3375 12 5.75V10.25C12 10.6625 11.64 11 11.2 11H4.8C4.36 11 4 10.6625 4 10.25V5.75ZM8.424 8.1275L11.04 6.59375C11.14 6.53375 11.2 6.4325 11.2 6.32375C11.2 6.0725 10.908 5.9225 10.68 6.05375L8 7.625L5.32 6.05375C5.092 5.9225 4.8 6.0725 4.8 6.32375C4.8 6.4325 4.86 6.53375 4.96 6.59375L7.576 8.1275C7.836 8.28125 8.164 8.28125 8.424 8.1275Z" fill="#9873FF"/></svg>'
                email.append(value);
                colContacts.append(email);
            }
            if (contact.type === 'Facebook') {
                const facebook = document.createElement('button');
                const value = document.createElement('span');
                value.textContent = `${contact.type}: ${contact.value}`;
                facebook.classList.add('facebook', 'type');
                value.classList.add('value');
                facebook.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M7.99999 0C3.6 0 0 3.60643 0 8.04819C0 12.0643 2.928 15.3976 6.75199 16V10.3775H4.71999V8.04819H6.75199V6.27309C6.75199 4.25703 7.94399 3.14859 9.77599 3.14859C10.648 3.14859 11.56 3.30121 11.56 3.30121V5.28514H10.552C9.55999 5.28514 9.24799 5.90362 9.24799 6.53815V8.04819H11.472L11.112 10.3775H9.24799V16C11.1331 15.7011 12.8497 14.7354 14.0879 13.2772C15.3261 11.819 16.0043 9.96437 16 8.04819C16 3.60643 12.4 0 7.99999 0Z" fill="#9873FF"/> </svg>'
                facebook.append(value);
                colContacts.append(facebook);
            }
            if (contact.type === 'VK') {
                const vk = document.createElement('button');
                const value = document.createElement('span');
                value.textContent = `${contact.type}: ${contact.value}`;
                vk.classList.add('vk', 'type');
                value.classList.add('value');
                vk.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path d="M8 0C3.58187 0 0 3.58171 0 8C0 12.4183 3.58187 16 8 16C12.4181 16 16 12.4183 16 8C16 3.58171 12.4181 0 8 0ZM12.058 8.86523C12.4309 9.22942 12.8254 9.57217 13.1601 9.97402C13.3084 10.1518 13.4482 10.3356 13.5546 10.5423C13.7065 10.8371 13.5693 11.1604 13.3055 11.1779L11.6665 11.1776C11.2432 11.2126 10.9064 11.0419 10.6224 10.7525C10.3957 10.5219 10.1853 10.2755 9.96698 10.037C9.87777 9.93915 9.78382 9.847 9.67186 9.77449C9.44843 9.62914 9.2543 9.67366 9.1263 9.90707C8.99585 10.1446 8.96606 10.4078 8.95362 10.6721C8.93577 11.0586 8.81923 11.1596 8.43147 11.1777C7.60291 11.2165 6.81674 11.0908 6.08606 10.6731C5.44147 10.3047 4.94257 9.78463 4.50783 9.19587C3.66126 8.04812 3.01291 6.78842 2.43036 5.49254C2.29925 5.2007 2.39517 5.04454 2.71714 5.03849C3.25205 5.02817 3.78697 5.02948 4.32188 5.03799C4.53958 5.04143 4.68362 5.166 4.76726 5.37142C5.05633 6.08262 5.4107 6.75928 5.85477 7.38684C5.97311 7.55396 6.09391 7.72059 6.26594 7.83861C6.45582 7.9689 6.60051 7.92585 6.69005 7.71388C6.74734 7.57917 6.77205 7.43513 6.78449 7.29076C6.82705 6.79628 6.83212 6.30195 6.75847 5.80943C6.71263 5.50122 6.53929 5.30218 6.23206 5.24391C6.07558 5.21428 6.0985 5.15634 6.17461 5.06697C6.3067 4.91245 6.43045 4.81686 6.67777 4.81686L8.52951 4.81653C8.82136 4.87382 8.88683 5.00477 8.92645 5.29874L8.92808 7.35656C8.92464 7.47032 8.98521 7.80751 9.18948 7.88198C9.35317 7.936 9.4612 7.80473 9.55908 7.70112C10.0032 7.22987 10.3195 6.67368 10.6029 6.09801C10.7279 5.84413 10.8358 5.58142 10.9406 5.31822C11.0185 5.1236 11.1396 5.02785 11.3593 5.03112L13.1424 5.03325C13.195 5.03325 13.2483 5.03374 13.3004 5.04274C13.6009 5.09414 13.6832 5.22345 13.5903 5.5166C13.4439 5.97721 13.1596 6.36088 12.8817 6.74553C12.5838 7.15736 12.2661 7.55478 11.9711 7.96841C11.7001 8.34652 11.7215 8.53688 12.058 8.86523Z" fill="#9873FF"/></g></svg>'
                vk.append(value);
                colContacts.append(vk);
            }

            if (contact.type !== 'VK' && contact.type !== 'Facebook' && contact.type !== 'Email' && contact.type !== 'Телефон') {
                const other = document.createElement('button');
                const value = document.createElement('span');
                value.textContent = `${contact.type}: ${contact.value}`;
                other.classList.add('other', 'type');
                value.classList.add('value');
                other.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.7"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8C13 10.76 10.76 13 8 13C5.24 13 3 10.76 3 8ZM9.5 6C9.5 5.17 8.83 4.5 8 4.5C7.17 4.5 6.5 5.17 6.5 6C6.5 6.83 7.17 7.5 8 7.5C8.83 7.5 9.5 6.83 9.5 6ZM5 9.99C5.645 10.96 6.75 11.6 8 11.6C9.25 11.6 10.355 10.96 11 9.99C10.985 8.995 8.995 8.45 8 8.45C7 8.45 5.015 8.995 5 9.99Z" fill="#9873FF"/></svg>'
                other.append(value);
                colContacts.append(other);
            }

        })
        const editButton = document.createElement('button');
        const editSvg = document.createElement('span');
        const deleteButton = document.createElement('button');
        const deleteSvg = document.createElement('span');

        editSvg.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 10.5V13H2.5L9.87333 5.62662L7.37333 3.12662L0 10.5ZM11.8067 3.69329C12.0667 3.43329 12.0667 3.01329 11.8067 2.75329L10.2467 1.19329C9.98667 0.933291 9.56667 0.933291 9.30667 1.19329L8.08667 2.41329L10.5867 4.91329L11.8067 3.69329Z" fill="#9873FF"/></svg>'
        editButton.textContent = 'Изменить';
        editButton.classList.add('editButton');
        editButton.prepend(editSvg);
        editButton.setAttribute('data-edit', 1);
        deleteSvg.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="#F06A4D"/></svg>'
        deleteButton.textContent = 'Удалить';
        deleteButton.classList.add('deleteButton');
        deleteButton.prepend(deleteSvg);
        deleteButton.setAttribute('data-delete', 1);

        row.append(colID);
        row.append(colName);
        row.append(colDate);
        row.append(colEdit);
        row.append(colContacts);
        colAction.append(editButton);
        colAction.append(deleteButton);
        row.append(colAction);
        table.append(row);

        // клик по кнопке изменить
        editButton.addEventListener('click', editClient);
        // клик по кнопке удалить
        deleteButton.addEventListener('click', (e)=>{
            deleteConfirm(e.target, colID.textContent);
        });
    }

    //предупреждение об удалении
    function deleteConfirm(target, id) {
        const modalId = target.getAttribute('data-delete');
        const modalElem = document.querySelector(`[data-delete="delete${modalId}"]`);
        deleteConfirmButton.setAttribute('data-confirm', id) //присваиваем дата атрибута с айди, по этому айди будем удалять клиента
        /* После того как нашли нужное модальное окно, добавим классы
        подложке и окну чтобы показать их. */
        modalElem.classList.add('active');
        overlay.classList.add('active');
    }

    //клик по кнопке подтверждения Удалить элемент
    let deleteConfirmButton = document.querySelector('.deleteConfirm')
        deleteConfirmButton.addEventListener('click', (e)=>{
            const id = deleteConfirmButton.getAttribute('data-confirm'); 
            deleteClient(id);
        })

    // функия удаления клиента
    async function deleteClient(id) {
        await fetch(`http://localhost:3000/api/clients/${id}`, { // ждем внесения изменений на сервере
                method: 'DELETE',
            })
        // отрисовываем таблицу снова после удаления элемента
        createClient(getClient());
        //и закрытие окна
        document.querySelector('.footer__modal.active').classList.remove('active');
        overlay.classList.remove('active');
    }

    //  функция изменения клиента
    async function editClient() {
        //очищаем поле контактов
        document.querySelectorAll('.footer__modal__contacts').forEach(contactField => contactField.remove());
        
        /* При каждом клике на кнопку мы будем забирать содержимое атрибута data
        и будем искать модальное окно с таким же атрибутом. */
        const modalId = this.getAttribute('data-edit');
        const modalElem = document.querySelector(`[data-edit="edit${modalId}"]`);

        /* После того как нашли нужное модальное окно, добавим классы
        подложке и окну чтобы показать их. */
        modalElem.classList.add('active');
        overlay.classList.add('active');

        const parentTr = this.closest('tr');
        const id = parentTr.querySelector('td').textContent;
        const idField = document.querySelector('.footer__modal__edit__idclient');
        idField.textContent = `ID: ${id}`;
        const response = await fetch(`http://localhost:3000/api/clients/${id}`);
        const data = await response.json();

        const nameField = document.querySelector('input[name="nameEdit"]');
        const surnameField = document.querySelector('input[name="surnameEdit"]');
        const lastnameField = document.querySelector('input[name="lastNameEdit"]');
        const deleteButton = document.querySelector('.footer__edit__delete-client');
        deleteButton.setAttribute('data-delete', 1);
        //при клике в карточке этого клиента берем id и по этому id удаляем из базы
        deleteButton.addEventListener('click', (e)=>{
 
            //и закрытие окна
            document.querySelector('.footer__modal.active').classList.remove('active');
            overlay.classList.remove('active');
            
            deleteConfirm(e.target, id);

        });

        nameField.value = data.name;
        surnameField.value = data.surname;
        lastnameField.value = data.lastName;
        data.contacts.forEach(contact => {
            const targetButton = document.getElementById('btnEdit');
            //заполняем поля контактов
            const contactDestruct = {
                type: contact.type,
                value: contact.value
            };

            createContactField(targetButton, contactDestruct);
        })
       
    };

    // сохраняем изменения в полях клиента (событие submit)
    const editWindow = document.getElementById('modalContactEdit');
    editWindow.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const id = document.querySelector('.footer__modal__edit__idclient').textContent.replace(/[^0-9]/g,"");
        //сохранение изменение на сервер из полей формы изменения
        await fetch(`http://localhost:3000/api/clients/${id}`, { // ждем внесения изменений на сервере
            method: 'PATCH',
            body: JSON.stringify(
                {name: form.nameEdit.value, surname: form.surnameEdit.value, lastName: form.lastNameEdit.value, contacts: saveContacts()}
            ), 
            headers: {
                'Content-type': 'application/json'
            } 
        })

        //отрисовка таблицы после внесения изменений в данных клиента
        createClient(getClient());

        // очищаем поля
        resetFields(form);

        //и закрытие окна
        document.querySelector('.footer__modal.active').classList.remove('active');
        overlay.classList.remove('active');
        //e.target.reset();
        
    })

    // функция обнуления полей
    function resetFields(form) {
        //обнуление полей 
        Array.from(form.querySelectorAll('input')).forEach(input => {
            input.value = '';
        });
        //удаление контакта
        Array.from(form.querySelectorAll('.footer__modal__contacts')).forEach(contact => {
            contact.remove();
        });
    }

    /* Модальноет окно Назначаем каждой кнопке обработчик клика */
    modalButton.addEventListener('click', function (e) {

        /* Предотвращаем стандартное действие элемента. Так как кнопку разные
        люди могут сделать по-разному. Кто-то сделает ссылку, кто-то кнопку.
        Нужно подстраховаться. */
        e.preventDefault();
        
        /* При каждом клике на кнопку мы будем забирать содержимое атрибута data-modal
        и будем искать модальное окно с таким же атрибутом. */
        const modalId = this.getAttribute('data-modal');
        const modalElem = document.querySelector(`[data-modal="open${modalId}"]`);

        /* После того как нашли нужное модальное окно, добавим классы
        подложке и окну чтобы показать их. */
        modalElem.classList.add('active');
        overlay.classList.add('active');
    }); 

    Array.from(closeButtons).forEach(element => {
        element.addEventListener('click', function (e) {
            const parentModal = this.closest('.footer__modal');
            parentModal.classList.remove('active');
            overlay.classList.remove('active');
        })
    });

    overlay.addEventListener('click', function () {
        document.querySelector('.footer__modal.active').classList.remove('active');
        this.classList.remove('active');
    });

    //список контактов по нажанию на кнопку добавить контакт
    const addContact = document.querySelectorAll('.footer__modal__btn__wrapper');

    Array.from(addContact).forEach(contact => {
        contact.addEventListener('click', function(e) {
            const targetButton = e.target;
            createContactField(targetButton, {type: '', value: ''});
        })
    });

    function createContactField(target, contactDestruct) {
        
        const bodyModal = target.closest('.footer__modal__field');
        const fieldWrapper = document.createElement('div');
        fieldWrapper.classList.add('footer__modal__contacts')
        const inputField = document.createElement('input');
        const cancelField = document.createElement('span');
        const cancelTooltip = document.createElement('span');
        cancelTooltip.textContent = 'Удалить контакт';
        cancelTooltip.classList.add('cancelTooltip')
        cancelField.classList.add('deleteField')
        const contactSelect = document.createElement('select');
        contactSelect.innerHTML = '<option  value="Телефон">Телефон</option> <option  value="Другое">Другое</option> <option  value="Email">Email</option> <option  value="VK">VK</option> <option  value="Facebook">Facebook</option>';
        cancelField.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M6 0C2.682 0 0 2.682 0 6C0 9.318 2.682 12 6 12C9.318 12 12 9.318 12 6C12 2.682 9.318 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.154 3L6 5.154L3.846 3L3 3.846L5.154 6L3 8.154L3.846 9L6 6.846L8.154 9L9 8.154L6.846 6L9 3.846L8.154 3Z" fill="#B0B0B0"/> </svg>'
        contactSelect.setAttribute('data-select', 1);
        contactSelect.classList.add('footer__modal__select', 'js-choice');
        inputField.setAttribute('data-input', 1);
        inputField.classList.add('inputContact');
        cancelField.append(cancelTooltip);
        fieldWrapper.append(contactSelect);
        fieldWrapper.append(inputField);
        fieldWrapper.append(cancelField);
        bodyModal.prepend(fieldWrapper);

        // дропдаун
        const element = document.querySelector('.js-choice');
        const choices = new Choices(element, {
            searchEnabled: false,
            position: 'bottom',
            placeholder: false,
            shouldSort: false,
            itemSelectText: '',
        });

        cancelField.addEventListener('click', ()=> {
            cancelField.closest('.footer__modal__contacts').remove();
            if(contactCounter.length < 9) {
                target.closest('.footer__modal__btn__wrapper').classList.remove('disable');
                bodyModal.querySelector('.error').classList.remove('active');
            }
        })
        // присваиваем значение полю селект из объекта contact базы данных и полю инпут - в нем значения данных
        if (contactDestruct.type) {
        contactSelect.value = contactDestruct.type;
        inputField.value = contactDestruct.value
        }

        let contactCounter = bodyModal.querySelectorAll('.footer__modal__contacts');
        if (contactCounter.length > 9) {
            target.closest('.footer__modal__btn__wrapper').classList.add('disable');
            bodyModal.querySelector('.error').classList.add('active');
        } 
        
        return {
            contactSelect,
            inputField,
            cancelField
        }
    }

    //занесение клиента в базу при нажатии на кнопку
    const saveModalForm = document.getElementById('modalContact');
    saveModalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        let clientContacts = saveContacts();
        await client(clientContacts, e.target); // дожидаемся формирования строки с данными и ее отправки на сервер, после чего отрисовываем таблицу
        createClient(getClient());
        
        // очищаем поля
        resetFields(e.target);

        //и закрытие окна
        document.querySelector('.footer__modal.active').classList.remove('active');
        overlay.classList.remove('active');
    });

    //формирование строки с данными клиента
    async function client(contacts, form) {
        const client = {};
        const name = form.elements.name.value;
        const lastName = form.elements.lastName.value;
        const surname = form.elements.surname.value;
        client.name = name;
        client.lastName = lastName;
        client.surname = surname;
        client.contacts = contacts;
        const id = await getClient();
        client.id = id.length.toString();
        client.createdAt = new Date().toLocaleString();
        client.updatedAt = new Date().toLocaleString();
        const response = await fetch('http://localhost:3000/api/clients', {
            method: 'POST',
            body: JSON.stringify(client),
            headers: {
                'Content-type': 'application/json'
            }
        })
    }

    // формирование массива контактов
    function saveContacts() {
        const fields = document.querySelectorAll('.footer__modal__contacts');
        const arrFields = Array.from(fields);
        let contacts = [];
        arrFields.forEach(field => {
            const select = field.querySelector(`[data-select]`);
            const input = field.querySelector(`[data-input]`);
            const type = select[select.selectedIndex].value;
            const objContact = {};
            objContact.type = type;
            objContact.value = input.value;
            contacts.push(objContact);
        })
        return contacts
    }

})()