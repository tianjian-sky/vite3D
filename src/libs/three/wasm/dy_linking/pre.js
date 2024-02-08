Module['print'] = function (text) { alert('stdout: ' + text) };
Module['locateFile'] = function (fileName) {
    return '/static/dy_linking/' + `${fileName}`
};