var util = require('util');

function ListIdError(message, listid) {
    this.message = message + (listid ? (' listId: ' + listid) : '');
    this.listId = listid;
}

ListIdError.prototype = new Error();

module.exports = ListIdError;