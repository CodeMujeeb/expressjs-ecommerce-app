function getErrorClass() {
    return 'error';
}

function renderErrorMessage(error) {
    return error ? error.msg : '';
}

function getFormFieldClass(fieldName, validationErrors) {
    return validationErrors[fieldName] ? 'error' : '';
}

module.exports = {
    getErrorClass,
    renderErrorMessage,
    getFormFieldClass,
};
