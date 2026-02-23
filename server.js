const express = require('express');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index', {title:'My Home Page'});
});

app.listen(PORT, () =>{
    console.log(`Server Started on Port http://localhost:${PORT}`);
});
