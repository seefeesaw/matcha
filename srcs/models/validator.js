var db = require('./database');
var async = require('async');

module.exports = function (model, data, next, requireds, uniqueBypassIds) {
    var value;

    async.eachOfSeries(model.fields, function (types, name, callback) {
        if (requireds !== undefined && requireds.indexOf(name) === -1)
            return callback();

        types = types.split(':');
        async.eachSeries(types, function (type, cb) {
            if (type.indexOf('=') !== -1) {
                type = type.split('=');
                value = type[1];
                type = type[0];
            }

            switch (type) {
                case 'required':
                    if (data[name] === undefined || data[name].length === 0)
                        return cb("Field" + name + " can not be empty.");
                    cb();
                    break;
                case 'unique':
                    db.query('SELECT `id` FROM `' + model.table + '` WHERE `' + name + '` = ? ' + (uniqueBypassIds ? 'AND `id` NOT IN (' + uniqueBypassIds.join(',') + ')' : ''), data[name], function (err, rows) {
                       if (err) {
                           console.error(err);
                           return cb(err);
                       }
                       if (rows && rows.length > 0)
                           return cb("The value of the field " + name + " is already in use.");
                       cb();
                    });
                    break;
                case 'email':
                    if (!data[name].match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))
                        return cb("Field " + name + " must be a valid email.");
                    cb();
                    break;
                case 'password':
                    if (data[name].length < 8)
                        return cb("Field " + name + " must have a minimum of 8 characters.");
                    else if (!data[name].match(/[0-9]/))
                        return cb("Field " + name + " must contain at least one number.");
                    else if (!data[name].match(/[A-Z]/))
                        return cb("Field" + name + " must contain at least one uppercase letter.");
                    else if (!data[name].match(/[a-z]/))
                        return cb("Field " + name + " must contain at least one lowercase letter.");
                    cb();
                    break;
                case 'min':
                    if (data[name].length < value)
                        return cb("Field " + name + " must have a minimum of " + value + " characters.");
                    cb();
                    break;
                case 'max':
                    if (data[name].length > value)
                        return cb("Field " + name + " must have a maximum of " + value + " characters.");
                    cb();
                    break;
                case 'alpha_num':
                    if (!data[name].match(/^[0-9a-zA-Z]+$/))
                        return cb("Field " + name + " must be alphanumeric only.");
                    cb();
                    break;
                case 'alpha':
                    if (!data[name].match(/^[a-zA-Z ]+$/))
                        return cb("Field " + name + " must be alphabetical only.");
                    cb();
                    break;
                case 'in':
                    var values = value.split(',');
                    if (values.indexOf(data[name]) === -1)
                        return cb("Field " + name + " must only have one of the following values: " + value + ".");
                    cb();
                    break;
                case 'number':
                    if (!data[name].match(/^[0-9]+$/))
                        return cb("Field" + name + " must be a valid number.");
                    cb();
                    break;
                case 'between':
                    var values = value.split(',');
                    if (parseInt(data[name]) < parseInt(values[0]) || parseInt(data[name]) > parseInt(values[1]))
                        return cb("Field " + name + " must be between" + values[0] + " and " + values[1] + ".");
                    cb();
                    break;
            }
        }, function (err) {
            if (err)
                return next(err, false);
            return callback();
        })
    }, function () {
        next(undefined, true);
    });
};