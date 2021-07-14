let { connect, set, Promise, connection } = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            useCreateIndex: true,
            useNewUrlParser: true,
            autoIndex: false,
            useUnifiedTopology: true,
            poolSize: 5,
            connectTimeoutMS: 10000,
            family: 4
        }; 
        connect('mongodb+srv://abhro:abhro@cluster0.4b14t.mongodb.net/test?authSource=admin&replicaSet=atlas-jfl2hb-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true', dbOptions);
        set('useFindAndModify', false);
        Promise = global.Promise;

        connection.on('connected', () => {
            console.log('Connected to MongoDB Successfully!');
        });

        connection.on('err', err => {
            console.error(`Error Occured From MongoDB: \n${err.message}`);
        });

        connection.on('disconnected', () => {
            console.warn('Connection Disconnected!');
        });
    }
};