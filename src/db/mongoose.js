//mongoose = ODM(Object Data mapper)
const mongoose = require('mongoose');

const connectionURL = process.env.MONGO_CONNECTION_URL;   //using localhost instead of ip causes problems
const databaseName = 'task-manager-api';

//useCreateIndex : makes sure when mongoose works with mongodb our indexes are created, allowing us to quickly access the data we want to access 
mongoose.connect(connectionURL + '/' + databaseName,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify:false
})

