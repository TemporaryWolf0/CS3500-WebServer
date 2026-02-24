const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const expressLayouts = require('express-ejs-layouts');

app.use(expressLayouts);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;

const navLinks = [
  { name: 'Home', path: '/pages/home', key: 'home' },
  { name: 'About', path: '/pages/about', key: 'about' },
  { name: 'Contact', path: '/pages/contact', key: 'contact' }
];
var handlePublicFileRequest = function (req, res) {
    var pagePath = req.path;

    if (pagePath === "/") {
        pagePath = "home";
    }else{
        pagePath = req.params.page;
    }
    console.log('handlePublicFileRequest ' + pagePath + ' ...');
    const template = path.join(__dirname, 'views', 'pages', `${pagePath}.ejs`);

    if (!fs.existsSync(template)) {
        return res.status(404).render('layout', {
        title: 'Not Found',
        key: "NA",
        active: "none",
        content: 'pages/404',
        navLinks: navLinks
        });
    }

    res.render('layout', {
    title: pagePath,
    active: pagePath,
    content: `pages/${pagePath}.ejs`,
    navLinks: navLinks
    });
}


app.get('/', handlePublicFileRequest);
app.get('/pages/:page', handlePublicFileRequest);

app.listen(PORT, () =>{
    console.log(`Server Started on Port http://localhost:${PORT}`);
});
