const fs = require('fs')
function deleteFile(filePath, callback) {
    fs.unlink(filePath, (err) => {
        if (err) {
            callback(err);
        }
    })
}

module.exports = {
    deleteFile
}