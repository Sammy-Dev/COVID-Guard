const mongoose = require('mongoose')
const extendSchema = require('mongoose-extend-schema');
const registeredUserSchema = require('./RegisteredUser');
const userTypes = require('../_constants/usertypes');
const {autoPopulateField} = require("../utils/db");

// Create Schema
const BusinessUserSchema = extendSchema(registeredUserSchema, {
    business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true },
});

autoPopulateField(BusinessUserSchema, 'business');

BusinessUserSchema.virtual('type').get(function () {
    return userTypes.BUSINESS;
});

const BusinessUser = mongoose.model('BusinessUser', BusinessUserSchema);

module.exports = BusinessUser;