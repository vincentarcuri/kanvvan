from flask import (
    Blueprint, g, render_template, request, url_for, jsonify, make_response
)
from kanvvan.db import get_db
from kanvvan.weather import get_weather

bp = Blueprint("home", __name__)

@bp.route('/')
def index():
    db = get_db()
    return render_template("index.html")


@bp.route('/weather', methods=("GET",))
def weather_info():
    db = get_db()
    location = db.execute("SELECT * FROM location WHERE id = 1").fetchone()
    weather = get_weather(location["lat"], location["lon"])
    return jsonify(weather)

@bp.route("/weather/update", methods=("POST",))
def location_update():
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        UPDATE location 
        SET lat = ?, lon = ?
        WHERE id = 1
        """,
        (req["lat"], req["lon"])
    )
    db.commit()
    res = make_response(jsonify({"message": "Kanban Updated"}), 200)
    return res




# Kanban API
# Read
@bp.route("/kanban", methods=("GET",))
def kanban():
    db = get_db()
    todo = db.execute(
        """
        SELECT id, label_id, title, due
        FROM kanban
        WHERE section_id = 1
        ORDER BY due
        """
    ).fetchall()
    in_progress = db.execute(
        """
        SELECT id, label_id, title, due
        FROM kanban
        WHERE section_id = 2
        ORDER BY due
        """
    ).fetchall()
    done = db.execute(
        """
        SELECT id, label_id, title, due
        FROM kanban
        WHERE section_id = 3
        ORDER BY due
        """
    ).fetchall()
    labels = db.execute(
        """
        SELECT *
        FROM label
        """
    ).fetchall()
    todo_dict = [
        {"id": row[0], "label_id": row[1], "title": row[2], "due": row[3]}
        for row in todo
    ]
    in_progress_dict = [
        {"id": row[0], "label_id": row[1], "title": row[2], "due": row[3]}
        for row in in_progress
    ]
    done_dict = [
        {"id": row[0], "label_id": row[1], "title": row[2], "due": row[3]}
        for row in done
    ]
    labels_dict = dict()
    for row in labels:
        labels_dict[str(row[0])] = {"name": row[1], "color": row[2]}

    kanban_dict = {
        "todo": todo_dict, 
        "inProgress": in_progress_dict,
        "done": done_dict,
        "labels": labels_dict,
    }
    return jsonify(kanban_dict)

@bp.route("/kanban/<int:card_id>", methods=("GET",))
def card_info(card_id):
    db = get_db()
    info = db.execute(
        "SELECT label_id, title, due FROM kanban WHERE id = ?", 
        (str(card_id))
        ).fetchone()
    data = {
        "label_id": info["label_id"],
        "title": info["title"],
        "due": info["due"]
    }
    return jsonify(data)


# Update
@bp.route("/kanban/edit", methods=("GET", "POST"))
def kanban_edit():
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        UPDATE kanban
        SET label_id = ?,
            title = ?,
            due = ?
        WHERE id = ?
        """,
        (req["label_id"], req["title"], req["due"], req["id"])
    )
    db.commit()
    res = make_response(jsonify({"message": "Kanban Updated"}), 200)
    return res


@bp.route("/kanban/edit/section", methods=("GET", "POST"))
def kanban_edit_section():
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        UPDATE kanban
        SET section_id = ?
        WHERE id = ?
        """,
        (req["section"], req["id"])
    )
    db.commit()
    res = make_response(jsonify({"message": "Kanban Updated"}), 200)
    return res


# Create
@bp.route("/kanban/add", methods=("GET", "POST"))
def kanban_add():
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        INSERT INTO kanban (label_id, title, due, section_id)
        VALUES (?, ?, ?, ?)
        """,
        (req["label_id"], req["title"], req["due"], req["section_id"])
    )
    db.commit()
    res = make_response(jsonify({"message": "Kanban Added"}), 200)
    return res

# Delete
@bp.route("/kanban/delete/<int:card_id>", methods=("GET", "POST"))
def kanban_delete(card_id):
    db = get_db()
    db.execute("DELETE FROM kanban WHERE id = ?", (str(card_id),))
    db.commit()
    res = make_response(jsonify({"message": "Kanban Deleted"}), 200)
    return res





# Labels
# Read
@bp.route("/labels", methods=("GET", ))
def labels():
    db = get_db()
    labels_query = db.execute(
        """
        SELECT * 
        FROM label
        """
    ).fetchall()
    label_list = [
        {"id": row[0], "name": row[1], "color": row[2]}
        for row in labels_query
    ]
    return jsonify(label_list)


# Create
@bp.route("/labels/add", methods=("GET", "POST"))
def labels_add():
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        INSERT INTO label (name, color)
        VALUES (?, ?)
        """,
        (req["name"], req["color"])
    )
    db.commit()
    res = make_response(jsonify({"message": "Label Added"}), 200)
    return res


# Update
@bp.route("/labels/edit", methods=("POST",))
def labels_edit():
    db = get_db()
    req = request.get_json()
    for edit in req:
        db.execute(
            """ 
            UPDATE label
            SET name = ?, color = ?
            WHERE id = ?
            """,
            (edit["name"], edit["color"], edit["id"])
        )
        db.commit()
    res = make_response(jsonify({"message": "Labels Edited"}), 200)
    return res



# todo/notepad API
# Read
@bp.route("/todo/<date>", methods=("GET",)) 
def todo(date):
    db = get_db()
    items = db.execute("SELECT id, title, done FROM todo WHERE date = ?", (date,)).fetchall()
    items_list = [
        {"id": row[0], "title": row[1], "done": row[2]}
        for row in items
    ]
    return jsonify(items_list)


# Create
@bp.route("/todo/add/<date>", methods=("GET", "POST"))
def todo_add(date):
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        INSERT INTO todo (title, done, date)
        VALUES(?, 0, ?)
        """,
        (req["title"], date)
    )
    db.commit()
    res = make_response(jsonify({"message": "Labels Edited"}), 200)
    return res

# Update
@bp.route("/todo/edit/<int:id>", methods=("GET", "POST"))
def todo_edit(id):
    db = get_db()
    req = request.get_json()
    db.execute(
        """
        UPDATE todo SET done = ?
        WHERE id = ?
        """,
        (abs(req["done"] - 1), id)
    )
    db.commit()
    res = make_response(jsonify({"message": "Todo Edited"}), 200)
    return res

@bp.route("/todo/delete/<int:id>", methods=("GET", "POST"))
def todo_delete(id):
    db = get_db()
    db.execute("DELETE FROM todo WHERE id = ?", (id,))
    db.commit()
    res = make_response(jsonify({"message": "Todo Deleted"}), 200)
    return res


