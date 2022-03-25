'use strict';

exports.logError = (data) => {
    try {
        console.error(JSON.stringify(data, null, 2))
    } catch (error) {
        console.error(error, data);
    }

};

exports.log = (data, fileName = 'log') => {
    if (process.env.TYPE !== 'prod') {
        console.log(JSON.stringify(data, null, 2))
    }
};


exports.asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
};
