'use strict';

const debug = require('debug')('loopback:mixins:objectid-type');
const ObjectId = require('mongodb').ObjectId;

module.exports = (Model, options) => {
    const objectId = Model.getDataSource().connector.getDefaultIdType();
    const isMongoConnector = Model.getDataSource().connector.name === 'mongodb';
    const isPropertiesExists = options && options.properties && Array.isArray(options.properties);

    if (!isPropertiesExists) {
        debug('Properties not found for ' + Model.definition.name);
        throw 'Properties not found for ' + Model.definition.name;
    }

    if (isMongoConnector) {
        options.properties.map(propertyKey => {
            Model.defineProperty(propertyKey, {
                type: objectId
            });
        })
    } else {
        throw 'loopback-connector-mongodb not found for current model'
        debug('loopback-connector-mongodb not found for current model');
    }


    Model.observe('before save', function(ctx, next) {
        if (!isPropertiesExists) {
            debug('Properties not found for ' + Model.definition.name);
            throw 'Properties not found for ' + Model.definition.name;
        }

        if (isMongoConnector) {
            if(ctx.instance) {
                options.properties.map(propertyKey => {
                    if(!(ctx.instance[propertyKey] instanceof objectId)) {
                        ctx.instance[propertyKey] = new ObjectId(ctx.instance[propertyKey]);
                    }
                })
                next();
            }
            if(ctx.data) {
                options.properties.map(propertyKey => {
                    if(ctx.data[propertyKey] && !(ctx.data[propertyKey] instanceof objectId))
                        ctx.data[propertyKey] = new ObjectId(ctx.data[propertyKey]);
                })
                next();
            }
        } else {
            throw 'loopback-connector-mongodb not found for current model'
            debug('loopback-connector-mongodb not found for current model');
        }
    })
};
