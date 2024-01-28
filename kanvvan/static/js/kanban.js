function fetchKanban() {
    fetch(`${window.origin}/kanban`)
    .then(data => {
        return data.json()
    })
    .then(data => {
        loadCards(data);
    });
}


// Deletes all the cards from all the boards.
function deleteCards() {
    cards = document.querySelectorAll(".card");
    for (let item of cards) {
        item.remove();
    }
}


// Creates a Kanban card from the data fetched from `fetchKanban()`
function createCard(card_data, labels_data) {
    let label = document.createElement("div");
    label.classList.add("label");

    label.innerText = labels_data[card_data["label_id"]]["name"];
    label.style.backgroundColor = labels_data[card_data["label_id"]]["color"];


    let title = document.createElement("h2");
    title.innerText = card_data["title"];

    let due = document.createElement("div");
    due.innerText = card_data["due"];

    let editBtn = document.createElement("div");
    editBtn.classList.add("edit-btn");
    editBtn.innerHTML = "&#9998;";
    editBtn.addEventListener("click", editCardWindow(card_data["id"]));
    
    let div = document.createElement("div");
    div.classList.add("card");
    div.id = "card"+card_data["id"];
    div.draggable = true;
    div.dataset.id = card_data["id"];
    div.appendChild(label);
    div.appendChild(title);
    div.appendChild(due);
    div.appendChild(editBtn);

    // Add data for dragstart, the cards id in the database.
    div.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", div.dataset.id);
    });

    return div;
}

// Loads the cards from the JSON data for each board.
function loadCards(data)
{
    const todo = document.getElementById("ToDo");
    const in_progress = document.getElementById("InProgress");
    const done = document.getElementById("Done");
    deleteCards();

    for (let card_data of data["todo"]) {
        let div = createCard(card_data, data["labels"]);
        todo.appendChild(div);
    }

    for (let card_data of data["inProgress"]) {
        let div = createCard(card_data, data["labels"]);
        in_progress.appendChild(div);
    }

    for (let card_data of data["done"]) {
        let div = createCard(card_data, data["labels"]);
        done.appendChild(div);
    }
}

// Fetches all labels, then adds them to a selection list.
function fetchLabelsforSelectList(select_elm) {
    let data_obj;
    fetch(`${window.origin}/labels`)
    .then(data => {
        return data.json()
    })
    .then(data => {
        addLabelsToSelectList(select_elm, data);
    });
}   

// Helper function for fetchLablesforSelectList, creates <option>s for each label.
function addLabelsToSelectList(select_elm, data) {
    for (const label of data) {
        let option = document.createElement("option");
        option.value = label["id"];
        option.innerText = label["name"];
        select_elm.appendChild(option);
    }
}


// Post Request for adding a card to the database.
function postAddCard(section_id)
{
    const label_id = document.getElementById("CWlabel");
    const title = document.getElementById("CWtitle");
    const due = document.getElementById("CWdue");
    kanban_values = {
        label_id: label_id.value,
        title: title.value,
        due: due.value,
        section_id: section_id
    }
    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(kanban_values)
    }
    fetch(`${window.origin}/kanban/add`, post)
    .then(function(response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json();
        }
    }).then(response => {
        fetchKanban();
    })
}

// Creates a create window function. The window created is for adding a card to a board.
// The function is wrapped in a closure so it can be dynamically created
// for an event listener.
function addCardWindow(section_id) {

    function createWindow() { 
        let heading = document.createElement("h2");
        heading.innerText = "Add Card";

        let title_label = document.createElement("label");
        title_label.for = "CWtitle";
        title_label.innerText = "Title";

        let title = document.createElement("input");
        title.id = "CWtitle";
        title.type = "text";

        let label_label = document.createElement("label");
        label_label.for = "CWlabel";
        label_label.innerText = "Label"; 

        let label = document.createElement("select");
        fetchLabelsforSelectList(label);
        label.id = "CWlabel";

        let due_label = document.createElement("label");
        due_label.for = "CWdue";
        due_label.innerText = "Due Date";

        let due = document.createElement("input");
        due.id = "CWdue";
        due.type = "date";

        let btnAdd = document.createElement("input");
        btnAdd.id = "CWadd";
        btnAdd.type = "button";
        btnAdd.value = "Add Card";

        let btnCancel = document.createElement("input");
        btnCancel.id = "CWcancel";
        btnCancel.type = "button";
        btnCancel.value = "Cancel";

        let div = document.createElement("div");
        div.id = "CW";
        for (elm of [heading ,title_label, title, label_label, label, due_label, due, btnAdd, btnCancel])
        {
            div.appendChild(elm);
        }

        document.body.appendChild(div);

        btnAdd.addEventListener("click", function() {
            postAddCard(section_id);
            fetchKanban();
            div.remove();
        });

        btnCancel.addEventListener("click", function(){
            div.remove();
        });


        
    }
    return createWindow
}

// Fetches the card info to update the card edit window with the current values for the card data.
function fetchCardInfo(card_id) {
    fetch(`${window.origin}/kanban/${card_id}`)
    .then(data => {
        return data.json();
    })
    .then(data => {
        updateEditWindow(data);
    });
}

// Updates the edit window with current data.
function updateEditWindow(data) {
    const title = document.getElementById("EWtitle");
    title.value = data["title"];

    const label = document.getElementById("EWlabel");
    label.value = data["label_id"];

    const due = document.getElementById("EWdue");
    due.value = data["due"];
}

// Updates the card data in the database.
function postEditCard(card_id)
{
    const label_id = document.getElementById("EWlabel");
    const title = document.getElementById("EWtitle");
    const due = document.getElementById("EWdue");
    kanban_values = {
        id: card_id,
        label_id: label_id.value,
        title: title.value,
        due: due.value,
    }
    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(kanban_values)
    }
    fetch(`${window.origin}/kanban/edit`, post)
    .then(function(response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json();
        }
    }).then(response => {
        fetchKanban();
    })
}

// Creates a create window function. The window created is for editing a card to a board.
// The function is wrapped in a closure so it can be dynamically created
// for an event listener.
function editCardWindow(card_id) {


    function createWindow() { 
        let heading = document.createElement("h2");
        heading.innerText = "Edit Card";

        let title_label = document.createElement("label");
        title_label.for = "EWtitle";
        title_label.innerText = "Title";

        let title = document.createElement("input");
        title.id = "EWtitle";
        title.type = "text";

        let label_label = document.createElement("label");
        label_label.for = "EWlabel";
        label_label.innerText = "Label"; 

        let label = document.createElement("select");
        fetchLabelsforSelectList(label);
        label.id = "EWlabel";

        let due_label = document.createElement("label");
        due_label.for = "EWdue";
        due_label.innerText = "Due Date";

        let due = document.createElement("input");
        due.id = "EWdue";
        due.type = "date";

        let btnEdit = document.createElement("input");
        btnEdit.id = "EWedit";
        btnEdit.type = "button";
        btnEdit.value = "Edit Card";

        let btnDelete = document.createElement("input");
        btnDelete.type = "button";
        btnDelete.value = "Delete";

        let btnCancel = document.createElement("input");
        btnCancel.id = "EWcancel";
        btnCancel.type = "button";
        btnCancel.value = "Cancel";

        let div = document.createElement("div");
        div.id = "EW";
        for (elm of [heading ,title_label, title, label_label, label, due_label, due, btnEdit, btnDelete, btnCancel])
        {
            div.appendChild(elm);
        }
        fetchCardInfo(card_id);

        document.body.appendChild(div);

        btnEdit.addEventListener("click", function() {
            postEditCard(card_id);
            fetchKanban();
            div.remove();
        });

        btnDelete.addEventListener("click", function() {
            fetch(`${window.origin}/kanban/delete/${card_id}`)
            .then(data => {
                return data.json()
            });
            fetchKanban();
            div.remove();
        });

        btnCancel.addEventListener("click", function(){
            div.remove();
        });


        
    }
    return createWindow;
}


// postAddLabel makes a POST request to add a label form the Label Add window.

function postAddLabel() {
    const name = document.getElementById("LWname");
    const color = document.getElementById("LWcolor");
    label_values = {
        name: name.value,
        color: color.value
    }
    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(label_values)
    }
    fetch(`${window.origin}/labels/add`, post)
    .then(function (response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json()
        }
    })
}

// Create a div for adding Labels, is deleted on adding or cancelling.

function addLabelsWindow()
{
    let name_label = document.createElement("label");
    name_label.for = "name";
    name_label.innerText = "Name";

    let name = document.createElement("input");
    name.id = "LWname";
    name.type = "text";

    let color = document.createElement("input");
    color.type = "color";
    color.id = "LWcolor";

    let addBtn = document.createElement("input");
    addBtn.id = "LWadd";
    addBtn.type = "button";
    addBtn.value = "Add Label";

    let cancelBtn = document.createElement("input");
    cancelBtn.id = "LWcancel";
    cancelBtn.type = "button";
    cancelBtn.value = "Cancel";

    let div = document.createElement("div");
    div.id = "LW";
    
    for (let elm of [name_label, name, color, addBtn, cancelBtn]) {
        div.appendChild(elm);
    }

    document.body.appendChild(div);

    addBtn.addEventListener("click", function(){
        postAddLabel();
        div.remove();
    });

    cancelBtn.addEventListener("click", function(){
        div.remove();
    });
}

// Fetch all the labels for the label edit windows, so it can have their current values.
function fetchLabelsForEditLabelsWindow() {
    fetch(`${window.origin}/labels`)
    .then(data => {
        return data.json();
    })
    .then(data => {
        editLabelsWindow(data);
        fetchKanban();
    })
}

// Posts all the label edits to the database. Updates them even if they haven't changed.
function postLabelEdits() {
    const all_labels = document.getElementById("ELlabels");
    let label_edits = []
    for (let label_div of all_labels.children) {
        let label_id = label_div.dataset.id;
        let name_value;
        let color_value;
        for (let field of label_div.children) {
            if (field.dataset.field == "name") {
                name_value = field.value;
            } else {
                color_value = field.value;
            }
        }
        label_edits.push({id: label_id, name: name_value, color: color_value});
    }

    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(label_edits)
    }
    fetch(`${window.origin}/labels/edit`, post)
    .then(function (response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json()
        }
    })
}


// Creates the label editor window.
function editLabelsWindow(labels_data) {

    const div = document.createElement("div");
    div.id = "EL";

    const all_labels = document.createElement("div");
    all_labels.id = "ELlabels"


    for (let label of labels_data) {
        let label_container = document.createElement("div");
        label_container.dataset.id = label["id"];

        let name = document.createElement("input");
        name.dataset.field="name";
        name.type = "text";
        name.value = label["name"];

        let color = document.createElement("input");
        color.dataset.field="color";
        color.type = "color";
        color.value = label["color"];

        label_container.appendChild(name);
        label_container.appendChild(color);

        all_labels.appendChild(label_container);
    }

    div.appendChild(all_labels);

    saveBtn = document.createElement("input");
    saveBtn.value = "Save";
    saveBtn.type = "button";

    cancelBtn = document.createElement("input");
    cancelBtn.value = "Cancel";
    cancelBtn.type = "button";

    div.appendChild(saveBtn);
    div.appendChild(cancelBtn);

    document.body.appendChild(div);

    saveBtn.addEventListener("click", function() {
        postLabelEdits();
        fetchKanban()
        div.remove();
    });

    cancelBtn.addEventListener("click", function() {
        div.remove();
    });

}

// Drag-and-Drop Cards update the section id in the database.
function postUpdateSection(dropped_card_id, new_section) {
    update_info = {
        id: dropped_card_id,
        section: new_section
    }
    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(update_info)
    }
    fetch(`${window.origin}/kanban/edit/section`, post)
    .then(function (response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json()
        }
    })
    .then(data => {
        fetchKanban();
    });
}


// Adds drag and drop functionality for cards by updating the section in the database
// then reloading the cards.
function addDragAndDrop() {
    const todo = document.getElementById("ToDo");
    const inProgress = document.getElementById("InProgress");
    const done = document.getElementById("Done");
    for (let board of [todo, inProgress, done]) {
        board.addEventListener("dragover", e => {
            e.preventDefault();
        });
        board.addEventListener("drop", e => {
            e.preventDefault();
            dropped_card_id = e.dataTransfer.getData("text/plain");
            postUpdateSection(dropped_card_id, board.dataset.section);


            // fetchKanban();
        });
    }
}

// Add event listeners to the page, load data when page loads.
window.onload = fetchKanban();

document.getElementById("todoAdd").addEventListener("click", addCardWindow(1));
document.getElementById("inProgressAdd").addEventListener("click", addCardWindow(2));
document.getElementById("doneAdd").addEventListener("click", addCardWindow(3));

document.getElementById("addLabelsBtn").addEventListener("click", addLabelsWindow);
document.getElementById("editLabelsBtn").addEventListener("click", fetchLabelsForEditLabelsWindow);

addDragAndDrop();