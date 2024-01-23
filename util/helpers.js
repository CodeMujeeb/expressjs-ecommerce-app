function getErrorClass() {
    return 'error';
}

function renderErrorMessage(error) {
    return error ? error.msg : '';
}

function getFormFieldClass(fieldName, validationErrors) {
    return validationErrors[fieldName] ? 'error' : '';
}

function removeStoragePrefix(filepath) {
    const prefix = 'storage/';

    // Check if the filepath starts with the specified prefix
    if (filepath.startsWith(prefix)) {
        // Remove the prefix from the filepath
        return filepath.slice(prefix.length);
    } else {
        // If the prefix is not found, return the original filepath
        return filepath;
    }
}

module.exports = {
    getErrorClass,
    renderErrorMessage,
    getFormFieldClass,
    removeStoragePrefix
};
