(function(){
    let studentsList = [];
    let filteredStudentsList = [];
    let studentsListTableBody;
    let filterForm;
    let tableHeaderCellsParam = [];
    let isAscSort = 1;
    let filterTimeout;

    function newStudentListItem(firstName, secondName, middleName, birthDate, firstYear, facultyName) {
        this.firstName = firstName,
        this.secondName = secondName,
        this.middleName = middleName,
        this.birthDate = birthDate,
        this.firstYear = firstYear,
        this.facultyName = facultyName,
        
        Object.defineProperties(this, {
            "fullName": {
                 "get": () => { return this.secondName + ' ' + this.firstName + ' ' + this.middleName }
            },
            "age": {
                 "get": () => { return convertDateToDDMMYYYY(new Date(this.birthDate)) + ' ( ' + calculateStudentAge(new Date(this.birthDate)) + ' )' }
            },
            "educationYears": {
                 "get": () => { return this.firstYear + ' - ' + String(Number(this.firstYear) + 4) }
            }
        });
    }
    
    function createStudentListTitle(title) {
        let studentListTitle = document.createElement('h1');
        studentListTitle.textContent = title;
        return studentListTitle;
    }
    
    function createStudentListFormSubtitle(title) {
        let studentListSubtitle = document.createElement('h5');
        studentListSubtitle.textContent = title;
        studentListSubtitle.classList.add('form-spoiler-closed', 'form-spoiler');
        return studentListSubtitle;
    }

    function createAddStudentForm() {
        const currentDate = new Date;
        let addStudentFormTitle = createStudentListFormSubtitle('Добавить нового студента');
        let addStudentFormDiv = document.createElement('div');

        let addStudentForm = document.createElement('form');

        let inputFirstName      = createAddStudentFormItem(addStudentForm, 'input', 'first-name', 'text', 'Имя', 'required');
        let inputSecondName     = createAddStudentFormItem(addStudentForm, 'input', 'second-name', 'text', 'Фамилия', 'required');
        let inputMiddleName     = createAddStudentFormItem(addStudentForm, 'input', 'middle-name', 'text', 'Отчество', 'required');
        let inputBirthDate      = createAddStudentFormItem(addStudentForm, 'input', 'birth-date', 'date', 'Дата рождения', 'required');
        let inputFirstYear      = createAddStudentFormItem(addStudentForm, 'select', 'study-first-year', '', 'Первый год обучения', 'required');
        let inputFacultyName    = createAddStudentFormItem(addStudentForm, 'input', 'faculty-name', 'text', 'Факультет', 'required');
        let buttonSubmit        = document.createElement('input');
        
        inputFirstName.addEventListener('blur', trimString.bind(inputFirstName));
        inputSecondName.addEventListener('blur', trimString.bind(inputSecondName));
        inputMiddleName.addEventListener('blur', trimString.bind(inputMiddleName));
        inputFacultyName.addEventListener('blur', trimString.bind(inputFacultyName));

        inputBirthDate.min = '1900-01-01';
        buttonSubmit.type = 'submit';
        buttonSubmit.value = 'Добавить студента'
        
        addStudentForm.classList.add('mb-3');
        inputFirstYear.classList.add('form-select');
        buttonSubmit.classList.add('btn', 'btn-primary', 'mb-3');
        
        for (let i = 2000; i <= currentDate.getFullYear(); i++) {
            let newOption = document.createElement('option');
            if (i === 2000) newOption.selected = "selected";
            newOption.textContent = i;
            inputFirstYear.append(newOption);
        }

        addStudentForm.hidden = true;

        addStudentFormTitle.addEventListener('click', function() {
            addStudentForm.hidden = !addStudentForm.hidden;
            if (addStudentFormTitle.classList.contains('form-spoiler-closed')) {
                addStudentFormTitle.classList.remove('form-spoiler-closed');
                addStudentFormTitle.classList.add('form-spoiler-opened');
            } else {
                addStudentFormTitle.classList.remove('form-spoiler-opened');
                addStudentFormTitle.classList.add('form-spoiler-closed');
            };
        });

        addStudentFormDiv.classList.add('form-div');

        addStudentForm.append(buttonSubmit);
        addStudentFormDiv.append(addStudentFormTitle);
        addStudentFormDiv.append(addStudentForm);

        return { 
            addStudentFormDiv,
            addStudentForm,
            inputFirstName,
            inputSecondName,
            inputMiddleName,
            inputBirthDate,
            inputFirstYear,
            inputFacultyName,
            buttonSubmit,
        }
    }

    function createAddStudentFormItem (form, tagName, elemName, type, labelName, required) {
        let formItemRow = document.createElement('div');
        let inputElementCell = document.createElement('div');
        let inputElement = document.createElement(tagName);
        let inputElementLabel = document.createElement('label');
        if (!!type) inputElement.type = type;
        if (!!required) inputElement.required = required;
        inputElement.id = elemName;
        inputElementLabel.setAttribute('for', elemName);
        inputElementLabel.textContent = labelName;
        inputElement.classList.add('form-control');
        inputElementCell.classList.add('col-sm-5');
        inputElementLabel.classList.add('col-sm-3', 'col-form-label');
        formItemRow.classList.add('mb-3', 'row');
        inputElementCell.append(inputElement);
        formItemRow.append(inputElementLabel);
        formItemRow.append(inputElementCell);
        form.append(formItemRow);
        
        return inputElement;
    }

    function trimString() {
        this.value = this.value.trim();
    }

    function clearForm(form) {
        form.inputFirstName.value = '';
        form.inputSecondName.value = '';
        form.inputMiddleName.value = '';
        form.inputBirthDate.value = '';
        form.inputFirstYear.value = '2000';
        form.inputFacultyName.value = '';
    }

    function createStudentsListFilter() {
        let studentFilterTitle = createStudentListFormSubtitle('Фильтры');
        let studentsListFilterDiv = document.createElement('div');
        let studentsListFilterForm = document.createElement('form');

        studentsListFilterDiv.append(studentFilterTitle);

        let inputFullName       = createStudentListFilterItem(studentsListFilterForm, 'input', 'full-name-filter', 'text', 'ФИО');
        let inputFacultyName    = createStudentListFilterItem(studentsListFilterForm, 'input', 'faculty-name-filter', 'text', 'Факультет');
        let inputBirthDate      = createStudentListFilterItem(studentsListFilterForm, 'input', 'age-filter', 'text', 'Дата рождения (Возраст)');
        let inputFirstYear      = createStudentListFilterItem(studentsListFilterForm, 'input', 'education-tears-filter', 'text', 'Годы обучения');

        studentsListFilterForm.classList.add('mb-3');
        studentsListFilterForm.hidden = true;

        studentsListFilterDiv.classList.add('form-div');        
        studentsListFilterDiv.append(studentsListFilterForm);
        
        inputFullName.addEventListener('blur', trimString.bind(inputFullName));
        inputFacultyName.addEventListener('blur', trimString.bind(inputFacultyName));
        inputBirthDate.addEventListener('blur', trimString.bind(inputBirthDate));
        inputFirstYear.addEventListener('blur', trimString.bind(inputFirstYear));

        studentFilterTitle.addEventListener('click', function() {
            studentsListFilterForm.hidden = !studentsListFilterForm.hidden;
            if (studentFilterTitle.classList.contains('form-spoiler-closed')) {
                studentFilterTitle.classList.remove('form-spoiler-closed');
                studentFilterTitle.classList.add('form-spoiler-opened');
            } else {
                studentFilterTitle.classList.remove('form-spoiler-opened');
                studentFilterTitle.classList.add('form-spoiler-closed');
            };
        });

        return {
            studentsListFilterDiv,
            inputFullName,
            inputFacultyName,
            inputBirthDate,
            inputFirstYear,
        }
    }

    function createStudentListFilterItem(form, tagName, elemName, type, labelName) {
        let filterItemRow = document.createElement('div');
        let filterInputCell = document.createElement('div');
        let inputElement = document.createElement(tagName);
        let inputElementLabel = document.createElement('label');
        if (!!type) inputElement.type = type;
        inputElement.id = elemName;
        inputElementLabel.setAttribute('for', elemName);
        inputElementLabel.textContent = labelName;
        inputElement.classList.add('form-control');
        filterInputCell.classList.add('col-sm-5');
        inputElementLabel.classList.add('col-sm-3', 'col-form-label');
        filterItemRow.classList.add('mb-3', 'row');
        filterInputCell.append(inputElement);
        filterItemRow.append(inputElementLabel);
        filterItemRow.append(filterInputCell);
        form.append(filterItemRow);
        
        return inputElement;
    }

    function createStudentsListTable() {
        let studentsListTable = document.createElement('table');

        let studentsListTableHeader = document.createElement('thead');
        
        studentsListTableBody = document.createElement('tbody');

        studentsListTable.classList.add('table', 'table-striped', 'table-hover');

        createStudentsListTableHeader(studentsListTableHeader);
        createStudentsListTableBody();

        studentsListTable.append(studentsListTableHeader);
        studentsListTable.append(studentsListTableBody)

        return {
            studentsListTable,
            studentsListTableHeader,
            studentsListTableBody,
        };
    }

    function createStudentsListTableHeader(tableHeaderElem) {
        let studentsListTableHeaderRow = document.createElement('tr');
        
        let studentsListTableHeaderFullName = createStudentsListTableDataHeader('ФИО', 'full-name-header', sortByFullName);
        let studentsListTableHeaderFaculty = createStudentsListTableDataHeader('Факультет', 'faculty-header', sortByFacultyName);
        let studentsListTableHeaderAge = createStudentsListTableDataHeader('Дата рождения (Возраст)', 'birth-date-header', sortByBirthDate);
        let studentsListTableHeaderEducationYears = createStudentsListTableDataHeader('Годы обучения', 'education-years-header', sortByFirstYear);

        studentsListTableHeaderRow.append(studentsListTableHeaderFullName);
        studentsListTableHeaderRow.append(studentsListTableHeaderFaculty);
        studentsListTableHeaderRow.append(studentsListTableHeaderAge);
        studentsListTableHeaderRow.append(studentsListTableHeaderEducationYears);
        tableHeaderElem.append(studentsListTableHeaderRow);
    }

    function updateHeaderSortClassList() {
        tableHeaderCellsParam.forEach(x => {
            if (x.isChosen) {
                if (isAscSort === 1) {
                    x.cell.classList.add('header-asc-sort-link');
                    x.cell.classList.remove('header-desc-sort-link');
                }
                if (isAscSort === -1) {
                    x.cell.classList.remove('header-asc-sort-link');
                    x.cell.classList.add('header-desc-sort-link');
                }
            } else {
                x.cell.classList.remove('header-asc-sort-link', 'header-desc-sort-link');
            };
        })

    }

    function createStudentsListTableDataHeader(headerName, headerId, sortFunction) {
        let headerNameTableData = document.createElement('th');
        
        headerNameTableData.classList.add('header-sort-link');
        headerNameTableData.textContent = headerName;

        headerNameTableData.addEventListener('click', function(){
            tableHeaderCellsParam.forEach(x => {
                if (x.cell === headerNameTableData) {
                    if (x.isChosen) {
                        console.log(tableHeaderCellsParam);
                        isAscSort = -isAscSort;
                    } else {
                        console.log(tableHeaderCellsParam);
                        tableHeaderCellsParam.forEach(y => y.isChosen = 0);
                        x.isChosen = 1;
                        isAscSort = 1;
                    };
                }
            });
            updateHeaderSortClassList();
            refreshStudentsList();
        });

        headerNameTableData.id = headerId;
        tableHeaderCellsParam.push({
            cell: headerNameTableData,
            sortType: sortFunction,
            isChosen: 0,
        });

        return headerNameTableData;
    }

    function createStudentsListTableBody(list = studentsList) {
        list.forEach((x, ind) => {
            let studentTableRow = createStudentsListTableRow(x);
            studentTableRow.id = ind;
            studentTableRow.classList.add('students-list-table-body-row');
            studentsListTableBody.append(studentTableRow);
        });
    }

    function createStudentsListTableRow(studentObj) {
        let studentTableRow = document.createElement('tr');
        let studentFullName = document.createElement('td');
        let studentFaculty = document.createElement('td');
        let studentAge = document.createElement('td');
        let studentEducationYears = document.createElement('td');
        let studentDeleteButtonElem = document.createElement('td');
        let studentDeleteButton = document.createElement('input');

        studentFullName.textContent = studentObj.fullName;
        studentFaculty.textContent = studentObj.facultyName;
        studentAge.textContent = studentObj.age;
        studentEducationYears.textContent = studentObj.educationYears;

        studentDeleteButton.type = 'button';
        studentDeleteButton.classList.add('btn', 'btn-danger', 'py-0', 'px-2', 'lh-1');

        studentDeleteButtonElem.append(studentDeleteButton);

        studentDeleteButton.addEventListener('click', function() {
            let rowToDelete = this.parentElement.parentElement;
            studentsList.splice(rowToDelete.id, 1);
            refreshStudentsList();
        });

        studentTableRow.append(studentFullName);
        studentTableRow.append(studentFaculty);
        studentTableRow.append(studentAge);
        studentTableRow.append(studentEducationYears);
        studentTableRow.append(studentDeleteButtonElem);

        return studentTableRow;
    }

    function calculateStudentAge(birthDate) {
        let currentDate = new Date;
        let yearsDifference = currentDate.getFullYear() - birthDate.getFullYear();
        
        if (currentDate.getMonth() > birthDate.getMonth()) return yearsDifference + ' ' + chooseStringForAge(yearsDifference);
        if (currentDate.getMonth() === birthDate.getMonth()) {
            return currentDate.getDate() >= birthDate.getDate() ? yearsDifference + ' ' + chooseStringForAge(yearsDifference) : String(yearsDifference - 1) + ' ' + chooseStringForAge(yearsDifference - 1);
        }
        return String(yearsDifference - 1) + ' ' + chooseStringForAge(yearsDifference - 1);
    }

    function chooseStringForAge(age) {
        let ageStringsList = ['лет', 'год', 'года'];
        return ageStringsList[ ( (age % 10 === 0) || (age > 10 && age < 20) || (age % 10 > 4 && age % 10 < 10)) ? 0 : ((age % 10 === 1) ? 1 : 2 ) ];
    }

    function convertDateToDDMMYYYY(date) {
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let day = date.getDate();

        year = (year < 10) ? '000' + year : (year < 100) ? '00' + year : (year < 1000) ? '0' + year : year;
        month = (month < 10) ? '0' + month : month;
        if (day < 10) day = '0' + day;

        return day + '.' + month + '.' + year;
    }

    function refreshStudentsList() {
        studentsListTableBody.textContent = '';
        applyFilters();
        applySort();
        createStudentsListTableBody(filteredStudentsList);
    }

    function sortByFullName(firstObj, secondObj) {
        let firstObjFullName = firstObj.secondName + ' ' + firstObj.firstName + ' ' + firstObj.middleName;
        let secondObjFullName = secondObj.secondName + ' ' + secondObj.firstName + ' ' + secondObj.middleName;

        return firstObjFullName.toLowerCase() > secondObjFullName.toLowerCase() ? isAscSort : -isAscSort;
    }

    function sortByFacultyName(firstObj, secondObj) {
        let firstObjFacultyName = firstObj.facultyName;
        let secondObjFacultyName = secondObj.facultyName;

        return firstObjFacultyName.toLowerCase() > secondObjFacultyName.toLowerCase() ? isAscSort : -isAscSort;
    }

    function sortByBirthDate(firstObj, secondObj) {
        let firstObjDate = new Date(firstObj.birthDate);
        let secondObjDate = new Date(secondObj.birthDate);

        return Number(firstObjDate) > Number(secondObjDate) ? isAscSort : -isAscSort;
    }

    function sortByFirstYear(firstObj, secondObj) {
        let firstObjEducationYear = firstObj.firstYear;
        let secondObjEducationYear = secondObj.firstYear;

        return Number(firstObjEducationYear) > Number(secondObjEducationYear) ? isAscSort : -isAscSort;
    }

    function applySort() {
        let chosenSortField = tableHeaderCellsParam.find(x => x.isChosen === 1);
        if (chosenSortField) filteredStudentsList.sort(chosenSortField.sortType);
    }

    function applyFilters() {
        filteredStudentsList = studentsList.filter(x => {
            return  x.fullName.toLowerCase().includes(filterForm.inputFullName.value.toLowerCase())
                    && x.facultyName.toLowerCase().includes(filterForm.inputFacultyName.value.toLowerCase())
                    && x.age.toLowerCase().includes(filterForm.inputBirthDate.value.toLowerCase())
                    && x.educationYears.includes(filterForm.inputFirstYear.value)
        });
    }

    // создаем страницу приложения
    function createApp(container) {
        let studentListTitle = createStudentListTitle('Список студентов');
        let form = createAddStudentForm();
        
        filterForm = createStudentsListFilter();

        studentsList.push(new newStudentListItem ('Герман', 'Германов', 'Германович', '1991-11-19', '2013', 'Математический'));
        studentsList.push(new newStudentListItem ('Петр', 'Петров', 'Петрович', '1963-01-02', '1999', 'Физический'));
        studentsList.push(new newStudentListItem ('Иван', 'Иванов', 'Иванович', '1998-05-13', '2016', 'Биологический'));

        let table = createStudentsListTable();
        
        container.append(studentListTitle);
        container.append(form.addStudentFormDiv);
        container.append(filterForm.studentsListFilterDiv);
        container.append(table.studentsListTable);

        form.addStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            studentsList.push(new newStudentListItem (
                form.inputFirstName.value,
                form.inputSecondName.value,
                form.inputMiddleName.value,
                form.inputBirthDate.value,
                form.inputFirstYear.value,
                form.inputFacultyName.value,
            ));

            refreshStudentsList();
            clearForm(form);
        });

        filterForm.inputFullName.addEventListener('keyup', () => { clearTimeout(filterTimeout); filterTimeout = setTimeout(refreshStudentsList, 500)});
        filterForm.inputFacultyName.addEventListener('keyup', () => { clearTimeout(filterTimeout); filterTimeout = setTimeout(refreshStudentsList, 500)});
        filterForm.inputBirthDate.addEventListener('keyup', () => { clearTimeout(filterTimeout); filterTimeout = setTimeout(refreshStudentsList, 500)});
        filterForm.inputFirstYear.addEventListener('keyup', () => { clearTimeout(filterTimeout); filterTimeout = setTimeout(refreshStudentsList, 500)});
    }

    window.createApp = createApp;
})();