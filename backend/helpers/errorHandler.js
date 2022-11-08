const uniqueMessage = (error) => {
    let output;
    try {
        let fieldName = error.message.substring(
            error.message.lastIndexOf('{') + 2,
            error.message.lastIndexOf(':'),
        );
        output =
            fieldName.charAt(0).toUpperCase() +
            fieldName.slice(1) +
            ' đã tồn tại';
    } catch (ex) {
        output = 'File đã tồn tại';
    }

    return output;
};

exports.errorHandler = (error) => {
    let message = '';

    if (error.code) {
        switch (error.code) {
            case 11000:
            case 11001:
                message = uniqueMessage(error);
                break;
            default:
                message = 'Có lỗi xảy ra';
        }
    } else {
        // for (let errorName in error.errorors) {
        //     if (error.errorors[errorName].message)
        //         message = error.errorors[errorName].message;
        // }

        message = error.message;
    }

    return message;
};
