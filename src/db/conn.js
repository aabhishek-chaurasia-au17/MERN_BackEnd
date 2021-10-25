const mongoose = require('mongoose');

mongoose.connect(process.env.CONNECT_KEY).then(() => {
    console.log(`connection Successful....`);
}).catch((e) => {
    console.log(`no connection`);
})