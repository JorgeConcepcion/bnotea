var aws = require('aws-sdk'),
    fs = require("fs");



var functionObj = {};

functionObj.arraycmp = function (modified, original, action) {
    var isThere = false;
    var modifiedVar = [];
    var originalVar = [];
    var returnedElements = [];
    //Converting the entry variables to arrays if necesary
    if (!Array.isArray(modified)) {
        modifiedVar.push(modified);
    }
    else {
        modifiedVar = modified;
    }
    if (!Array.isArray(original)) {
        originalVar.push(original);
    }
    else {
        originalVar = original;
    }
    //Functionality selection
    if (action == "added") {
        modifiedVar.forEach(function (elementModified) {
            originalVar.forEach(function (elementOriginal) {
                if (elementOriginal == elementModified) {
                    isThere = true;
                }
            });
            if (!isThere) {
                returnedElements.push(elementModified);
            }
            isThere = false;
        });
    }
    else if (action == "deleted") {
        originalVar.forEach(function (elementOriginal) {
            modifiedVar.forEach(function (elementModified) {
                if (elementModified == elementOriginal) {
                    isThere = true;
                }
            });
            if (!isThere) {
                returnedElements.push(elementOriginal);
            }
            isThere = false;
        });
    }
    else if (action == "unchanged") {
        originalVar.forEach(function (elementOriginal) {
            modifiedVar.forEach(function (elementModified) {
                if (elementModified == elementOriginal) {
                    isThere = true;
                }
            });
            if (isThere) {
                returnedElements.push(elementOriginal);
            }
            isThere = false;
        });
    }
    return returnedElements;
};

//Used to filter the fuzzy searchs
functionObj.escapeRegex = function (text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//AWS S3 file uploader
functionObj.AWSS3Upload = function (bucket, key, filePath, acl) {
    var s3 = new aws.S3;
    aws.config.loadFromPath('./private/aws-keys.json');
    var uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: '',
        ACL: acl
    };
    var fileStream = fs.createReadStream(filePath);
    fileStream.on('error', function (err) {
        if (err) {
            return err;
        }
    });
    uploadParams.Body = fileStream;
    s3.upload(uploadParams, function (err) {
        if (err) {
            return err;
        }
    });
    return "good";
};

module.exports = functionObj;
