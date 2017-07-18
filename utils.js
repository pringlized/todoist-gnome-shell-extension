function isDueDateInPast(item) {
    let dueDateString = item.due_date_utc;
    if (dueDateString === null) {
        return false;
    }

    let dueDate = new Date(dueDateString);
    dueDate.setHours(0,0,0,0);
    let today = new Date;
    today.setHours(0,0,0,0);
    return dueDate <= today;
}

function isDueToday(item) {
    let dueDateString = item.due_date_utc;
    if (dueDateString === null) {
        return false;
    }

    let dueDate = new Date(dueDateString);
    dueDate.setHours(0,0,0,0);
    let today = new Date;
    today.setHours(0,0,0,0);
    let equal = false;
    if (dueDate.getTime().toString() == today.getTime().toString()) {
        equal = true; 
    }
    //log('('+equal+') content: '+item.content+' -> due: '+dueDate.getTime()+' -> today: '+today.getTime());
    // total HACK because comparing the integers just wasn't working
    return dueDate.getTime().toString() == today.getTime().toString();
}

function isPastDue(item) {
    let dueDateString = item.due_date_utc;
    if (dueDateString === null) {
        return false;
    }

    let dueDate = new Date(dueDateString);
    dueDate.setHours(0,0,0,0);
    let today = new Date;
    today.setHours(0,0,0,0);
    let equal = false;
    if (dueDate < today) {
        equal = true; 
    }
    //log('('+equal+') content: '+item.content+' -> due: '+dueDate.getTime()); 
    return dueDate < today;
}