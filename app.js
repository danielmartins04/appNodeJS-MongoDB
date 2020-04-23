//Módulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require("path");
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
require('./models/Postagem');
const Postagem = mongoose.model("postagens");

//Configuração
//Body Parser
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//Sessão
app.use(session({
    secret: "curso node",
    resave: true,
    saveUninitialized: true
}));

app.use(flash());

//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.erro_msg = req.flash("error_msg");
    next();
});

//Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Mongoose
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/blogapp").then(() => {
    //console.log("Conectado ao mongo");
}).catch((err) => {
    console.log("Erro ao se conectar"+err);
});

//Public
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
//    console.log("Mid");
    next();
});

//Rotas
app.get('/', (req, res) => {
    Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
        res.render("index", {postagens: postagens});
    }).catch((err) => {
        req.flash("error_msg", "Erro ao vizualizar");
        res.redirect('/404');
    });
});

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({slug: req.params.slug}).then((postagem) => {
        if(postagem) {
            res.render('postagem/index', {postagem: postagem});
            //res.send("asasas");
        } else {
            req.flash("error_msg", "Esta postagem não existe");
            res.redirect("/");
        }
    }).catch((err) =>  {
        req.flash("error_msg", "Erro interno");
        res.redirect("/");
    });
});

app.get('/404', (req, res) => {
    res.send("Erro 404!");
});

app.use('/admin', admin);

//Outros
const PORT = 8081 
app.listen(PORT, () => {
    console.log("Servidor rodando!");
});