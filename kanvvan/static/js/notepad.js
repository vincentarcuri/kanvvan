let now = new Date()
let current_display_date = dateToDateString(now);
displayDateHeading();


function deleteAllItems() {
    const ul = document.getElementById("items");
    items.innerHTML = "";
}

function fetchCurrentDateItems() {
    fetch(`${window.origin}/todo/${current_display_date}`)
    .then(data => {
        return data.json();
    }).then(data => {
        deleteAllItems();
        displayDateHeading();
        displayItems(data);
    });
}

function createListItem(item_data) {
    const items = document.getElementById("items");
    const li = document.createElement("div");
    li.classList.add("list-item");
    const trash_div = document.createElement("div");
    trash_div.innerHTML = "&#9746;";
    trash_div.classList.add("trash-div");
    trash_div.dataset.id = item_data["id"];
    trash_div.addEventListener("click", function(evt) {
        let item_id = evt.target.dataset.id;
        fetch(`${window.origin}/todo/delete/${item_id}`)
        .then(function(response) {
            if (response.status != 200) {
                console.log("Error");
            } else {
                fetchCurrentDateItems();
            }
        });
    });

    text_div = document.createElement("div");
    text_div.innerText = item_data["title"];
    text_div.dataset.id = item_data["id"];
    text_div.dataset.done = item_data["done"];
    text_div.classList.add("item-text");
    if (item_data["done"] == 1) {
        text_div.classList.add("done");
    }

    text_div.addEventListener("click", e => {
        changeToDone(e.target);
    });
    li.appendChild(trash_div);
    li.appendChild(text_div);
    items.appendChild(li);

}

function displayItems(data) {
    for (let item of data) {
        createListItem(item);
    }
}

function changeToDone(elm) {
    todo_id = elm.dataset.id;
    done_value = Number(elm.dataset.done);

    let json_body = {
        done: done_value
    }

    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(json_body)
    };
    fetch(`${window.origin}/todo/edit/${todo_id}`, post)
    .then(function(response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json();
        }
    }).then(response => {
        fetchCurrentDateItems();
    });

}

function addItem() {
    item = document.getElementById("add-item")
    item_value = item.value;

    let item_json = {
        "title": item_value
    };

    let post = {
        method: "POST",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        }),
        body: JSON.stringify(item_json)
    };

    fetch(`${window.origin}/todo/add/${current_display_date}`, post)
    .then(function(response) {
        if (response.status != 200) {
            console.log("Error");
        } else {
            return response.json();
        }
    }).then(response => {
        fetchCurrentDateItems();
    });
    item.value = "";
}


function displayDateHeading() {
    const heading = document.getElementById("notepad-date");
    if (dateToDateString(now) == current_display_date) {
        heading.innerText = "Today";
    } else {
        heading.innerText = current_display_date;
    }
}

function changeDate(date_string, offset) {
    let date = dateStringToDate(date_string);
    date.setDate(date.getDate() + offset);
    return dateToDateString(date);
}

function dateToDateString(date) {
    let string = date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, '0') + "-" + String(date.getDate()).padStart(2, "0");
    return string;
}

function dateStringToDate(date_string) {
    let year = Number(date_string.slice(0, 4));
    let month = Number(date_string.slice(5, 7)) - 1;
    let day = Number(date_string.slice(8));
    
    return new Date(year, month, day);
}



const back = document.getElementById("back");
back.addEventListener("click", function() {
    current_display_date = changeDate(current_display_date, -1);
    fetchCurrentDateItems();
});

const forward = document.getElementById("forward");
forward.addEventListener("click", function() {
    current_display_date = changeDate(current_display_date, 1);
    fetchCurrentDateItems();
});

const addItemTextBox = document.getElementById("add-item");
addItemTextBox.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        addItem();
    }
})

const addItemBtn = document.getElementById("add-item-btn");
addItemBtn.addEventListener("click", addItem);
window.onload = fetchCurrentDateItems();

