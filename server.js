// Dependencies and middleware
const express = require('express');
const app = express();
const {pool} = require('./dbConfig');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const { request } = require('express');
const passport = require('passport');
const PORT = 4000;
const initializePassport = require('./passportConfig');

const path = require('path');

initializePassport(passport);
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static(__dirname + '/views'));

app.use(
    session({
        secret: 'secret',
        resave: false,
        saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Get requests
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index');
});

app.get('/users/signup', checkAuthenticated, (req, res) => {
    res.render('signup');
});

app.get('/users/menu', checkNotAuthenticated, (req, res) => {
    res.render('menu', {user: req.user.name});
});

app.get('/users/stats', checkNotAuthenticated, (req, res) => {
    itemstats(req, res);
});


// Current month
app.get('/users/month', checkNotAuthenticated, (req, res) => {
    res.render('Current/month', {user: req.user.name});
});

app.get('/users/income', checkNotAuthenticated, (req, res) => {
    res.render('Current/income', {user: req.user.name});
});

app.get('/users/receipt', checkNotAuthenticated, (req, res) => {
    res.render('Current/receipt', {user: req.user.name});
});

app.get('/users/receipt/addfive', checkNotAuthenticated, (req, res) => {
    res.render('Current/addfive', {user: req.user.name});
});

app.get('/users/receipt/addten', checkNotAuthenticated, (req, res) => {
    res.render('Current/addten', {user: req.user.name});
});

app.get('/users/alterin', checkNotAuthenticated, (req, res) => {
    res.render('Current/alterin', {user: req.user.name});
});

app.get('/users/alterout', checkNotAuthenticated, (req, res) => {
    res.render('Current/alterout', {user: req.user.name});
});

app.get('/users/deletein', checkNotAuthenticated, (req, res) => {
    res.render('Current/deletein', {user: req.user.name});
});

app.get('/users/deleteout', checkNotAuthenticated, (req, res) => {
    res.render('Current/deleteout', {user: req.user.name});
});


// Months
app.get('/users/months', checkNotAuthenticated, (req, res) => {
    res.render('months', {user: req.user.name});
});

app.get('/users/months/january', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 0;
    outc(req, res, site, currmonth);
});

app.get('/users/months/february', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 1;
    outc(req, res, site, currmonth);
});

app.get('/users/months/march', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 2;
    outc(req, res, site, currmonth);
});

app.get('/users/months/april', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 3;
    outc(req, res, site, currmonth);
});

app.get('/users/months/may', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 4;
    outc(req, res, site, currmonth);
});

app.get('/users/months/june', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 5;
    outc(req, res, site, currmonth);
});

app.get('/users/months/july', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 6;
    outc(req, res, site, currmonth);
});

app.get('/users/months/august', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 7;
    outc(req, res, site, currmonth);
});

app.get('/users/months/september', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 8;
    outc(req, res, site, currmonth);
});

app.get('/users/months/october', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 9;
    outc(req, res, site, currmonth);
});

app.get('/users/months/november', checkNotAuthenticated, (req, res) => {
    let site = 'historymonth';
    let currmonth = 10;
    outc(req, res, site, currmonth);
});

app.get('/users/months/december', checkNotAuthenticated, (req, res) => {    
    let site = 'historymonth';
    let currmonth = 11;
    outc(req, res, site, currmonth);
});


// Displaying current month
app.get('/users/overview', checkNotAuthenticated, (req, res) => {
    let site = 'overview';
    let currmonth = new Date().getMonth();
    outc(req, res, site, currmonth);
});


// Functions to display queries for every month
function outc(req, res, site, currmonth) {
    let userid = {user: req.user.userid}.user;
    let user = {user: req.user.name};
    let outgoing = [];

    pool.query(
        `select sum(price) as price
        from outgoing
        where userid = $1 and month = $2`,
        [userid, currmonth],
        (err, results) => {
            if (err)
                throw err;

            outgoing.push({row: results.rows[0].price});
            inc(req, res, site, userid, user, currmonth, outgoing);
        }
    );
}

function inc(req, res, site, userid, user, currmonth, outgoing) {
    let income = [];

    pool.query(
        `select sum(price) as price
        from income
        where userid = $1 and month = $2`,
        [userid, currmonth],
        (err, results) => {
            if (err)
                throw err;

            income.push({row: results.rows[0].price});
            diff(req, res, site, userid, user, currmonth, outgoing, income);
        }
    );
}

function diff(req, res, site, userid, user, currmonth, outgoing, income) {
    let total = [];

    pool.query(
        `with inp as (
            select sum(price) as in_price
            from income i
            where userid = $1 and month = $2),
        
        outp as (
            select sum(price) as out_price
            from outgoing
            where userid = $1 and month = $2)
        
        select in_price - out_price as price
        from inp, outp`,
        [userid, currmonth],
        (err, results) => {
            if (err)
                throw err;

            total.push({row: results.rows[0].price});
            historyIn(req, res, site, userid, user, currmonth, outgoing, income, total);
        }
    );
}

function historyIn(req, res, site, userid, user, currmonth, outgoing, income, total) {
    let historyIn = [];
    let header = [];
    header.push({row: "ID"});
    header.push({row: "Date"});
    header.push({row: "Source"});
    header.push({row: "Matter"});
    header.push({row: "Category"});
    header.push({row: "Price"});

    pool.query(
        `select incomeid, date, source, matter, category, price
        from income
        where userid = $1 and month = $2
        order by incomeid`,
        [userid, currmonth],
        (err, results) => {
            if (err)
                throw err;

            for (let i = 0; i < results.rows.length; i++) {
                let incomeid = results.rows[i].incomeid;
                let tmpY = JSON.stringify(results.rows[i].date).slice(1, 5);
                let tmpM = JSON.stringify(results.rows[i].date).slice(6, 8);
                let tmpD = JSON.stringify(results.rows[i].date).slice(9, 11);
                let tmpDate = tmpD + ". " + tmpM + ". " + tmpY;
                let source = results.rows[i].source;
                let matter = results.rows[i].matter;
                let category = results.rows[i].category;
                let price = results.rows[i].price;

                historyIn.push({row: incomeid, tmpDate, source, matter, category, price});
            }

            historyOut(req, res, site, userid, user, currmonth, outgoing, income, total, header, historyIn);
        }
    );
}

function historyOut(req, res, site, userid, user, currmonth, outgoing, income, total, header, historyIn) {
    let historyOut = [];
    let historyMonth = [currmonth];
    
    pool.query(
        `select outgoingid, date, source, matter, category, price
        from outgoing
        where userid = $1 and month = $2
        order by outgoingid`,
        [userid, currmonth],
        (err, results) => {
            if (err)
                throw err;

            for (let i = 0; i < results.rows.length; i++) {
                let outgoingid = results.rows[i].outgoingid;
                let tmpY = JSON.stringify(results.rows[i].date).slice(1, 5);
                let tmpM = JSON.stringify(results.rows[i].date).slice(6, 8);
                let tmpD = JSON.stringify(results.rows[i].date).slice(9, 11);
                let tmpDate = tmpD + ". " + tmpM + ". " + tmpY;
                let source = results.rows[i].source;
                let matter = results.rows[i].matter;
                let category = results.rows[i].category;
                let price = results.rows[i].price;
                
                historyOut.push({row: outgoingid, tmpDate, source, matter, category, price});
            }

            res.render(site, {user, historyMonth, outgoing, income, total, header, historyIn, historyOut});
        }
    );
}


// Displaying stats
function itemstats(req, res) {
    let userid = {user: req.user.userid}.user;
    let user = {user: req.user.name}.user;
    let items = [];

    pool.query(
        `select matter, sum(price) as price
        from outgoing
        where userid = $1
        group by matter, price
        order by price desc
        limit 3`,
        [userid],
        (err, results) => {
            if (err)
                throw err;

            for (let i = 0; i < results.rows.length; i++) {
                let matter = results.rows[i].matter;
                let price = results.rows[i].price;
                items.push({row: matter, price});
            }

            catstats(req, res, userid, user, items);
        }
    );
}

function catstats(req, res, userid, user, items) {
    let categories = [];

    pool.query(
        `select category, sum(price) as price
        from outgoing
        where userid = $1
        group by category, price
        order by price desc
        limit 3`,
        [userid],
        (err, results) => {
            if (err)
                throw err;

            for (let i = 0; i < results.rows.length; i++) {
                let category = results.rows[i].category;
                let price = results.rows[i].price;
                categories.push({row: category, price});
            }

            sourcestats(req, res, userid, user, items, categories);
        }
    )
}

function sourcestats (req, res, userid, user, items, categories) {
    let incomes = [];

    pool.query(
        `select source, sum(price) as price
        from income
        where userid = $1
        group by source, price
        order by price desc
        limit 3`,
        [userid],
        (err, results) => {
            if (err)
                throw err;

            for (let i = 0; i < results.rows.length; i++) {
                let source = results.rows[i].source;
                let price = results.rows[i].price;
                incomes.push({row: source, price});
            }

            inccatstats(req, res, userid, user, items, categories, incomes);
        }
    );
}

function inccatstats (req, res, userid, user, items, categories, incomes) {
    let incategories = [];

    pool.query(
        `select category, sum(price) as price
        from income
        where userid = $1
        group by category, price
        order by price desc
        limit 3`,
        [userid],
        (err, results) => {
            if (err)
                throw err;

            for (let i = 0; i < results.rows.length; i++) {
                let category = results.rows[i].category;
                let price = results.rows[i].price;
                incategories.push({row: category, price});
            }
            totalmonth(req, res, userid, user, items, categories, incomes, incategories);
        }
    );
}

function totalmonth (req, res, userid, user, items, categories, incomes, incategories) {
    let totalmonth = [];

    pool.query(
        `select month, sum(price) as price
        from outgoing
        where userid = $1
        group by month
        order by price desc
        limit 1`,
        [userid],
        (err, results) => {
            if (err)
                throw err;

            let month = results.rows[0].month;
            let price = results.rows[0].price;
            totalmonth.push({row: month, price});

            totalday(req, res, userid, user, items, categories, incomes, incategories, totalmonth);
        }
    )
}

function totalday (req, res, userid, user, items, categories, incomes, incategories, totalmonth) {
    let totalday = [];

    pool.query(
        `select date, sum(price) as price
        from outgoing
        where userid = $1
        group by date
        order by price desc
        limit 1`,
        [userid],
        (err, results) => {
            if (err)
                throw err;

            let tmpM = JSON.stringify(results.rows[0].date).slice(6, 8);
            let tmpD = JSON.stringify(results.rows[0].date).slice(9, 11);
            let tmpDate = tmpD + ". " + tmpM;
            let price = results.rows[0].price;

            totalday.push({row: tmpDate, price});
            res.render('stats', {user, items, categories, incomes, incategories, totalmonth, totalday});
        }
    )
}

// Delete receipt
app.post('/users/deleteout', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {id} = req.body;

    pool.query(
        `delete from outgoing
        where userid = $1 and outgoingid = $2`,
        [userid, id],
        (err) => {
            if (err)
                console.log(err);

            res.redirect('/users/month');
        }
    );
});

// Delete income
app.post('/users/deletein', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {id} = req.body;

    pool.query(
        `delete from income
        where userid = $1 and incomeid = $2`,
        [userid, id],
        (err) => {
            if (err)
                console.log(err);

            res.redirect('/users/month');
        }
    );
});

// Alter receipts
app.post('/users/alterout', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {id, source, matter, category, price} = req.body;
    let errors = [];

    pool.query(
        `UPDATE outgoing
        SET source = $1, matter = $2, category = $3, price = $4
        WHERE userid = $5 and outgoingid = $6`,
        [source, matter, category, price, userid, id],
        (err) => {
            if (err) {
                errors.push({message: "Something went wrong, receipt not altered"});
                errors.push({message: "Remember to fill in everything!"});
                res.render('Current/alterout', {errors})
            } else {
                res.redirect('/users/month');
            }
        }
    );
});

// Alter income
app.post('/users/alterin', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {id, source, matter, category, price} = req.body;
    let errors = [];

    pool.query(
        `UPDATE income
        SET source = $1, matter = $2, category = $3, price = $4
        WHERE userid = $5 and incomeid = $6`,
        [source, matter, category, price, userid, id],
        (err) => {
            if (err) {
                errors.push({message: "Something went wrong, income not altered"});
                errors.push({message: "Remember to fill in everything!"});
                res.render('Current/alterin', {errors})
            } else {
                res.redirect('/users/month');
            }
        }
    );
});


// Adding income
app.post('/users/income', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {source, matter, category, price} = req.body;
    let currmonth = new Date().getMonth();
    let errors = [];

    pool.query(
        `insert into income (userid, date, month, source, matter, category, price)
        values ($1, current_date, $2, $3, $4, $5, $6)`,
        [userid, currmonth, source, matter, category, price],
        (err) => {
            if (err) {
                errors.push({message: "Something went wrong, income not added"});
                errors.push({message: "Remember to fill in everything!"});
                res.render('Current/income', {errors})
            } else {
                res.redirect('/users/month');
            }
        }
    );
});

// Adding a receipt
app.post('/users/receipt', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {source, matter, category, price} = req.body;
    let currmonth = new Date().getMonth();
    let errors = [];

    pool.query(
        `insert into outgoing (userid, date, month, source, matter, category, price)
        values ($1, current_date, $2, $3, $4, $5, $6)`,
        [userid, currmonth, source, matter, category, price],
        (err) => {
            if (err) {
                errors.push({message: "Something went wrong, receipt not added"});
                errors.push({message: "Remember to fill in everything!"});
                res.render('Current/receipt', {errors})
            } else {
                res.redirect('/users/month');
            }
        }
    );
});

// Adding 5 receipts
app.post('/users/receipt/addfive', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {source, matter, category, price} = req.body;
    let currmonth = new Date().getMonth();
    let errors = [];

    pool.query(
        `insert into outgoing (userid, date, month, source, matter, category, price)
        values ($1, current_date, $2, $3, $4, $5, $6),
        ($1, current_date, $2, $3, $7, $8, $9),
        ($1, current_date, $2, $3, $10, $11, $12),
        ($1, current_date, $2, $3, $13, $14, $15),
        ($1, current_date, $2, $3, $16, $17, $18)`,
        [userid, currmonth, source, matter[0], category[0], price[0],
        matter[1], category[1], price[1], matter[2], category[2], price[2],
        matter[3], category[3], price[3], matter[4], category[4], price[4]],
        (err) => {
            if (err) {
                errors.push({message: "Something went wrong, receipts not added"});
                errors.push({message: "Remember to fill in everything!"});
                res.render('Current/addfive', {errors})
            } else {
                res.redirect('/users/month');
            }
        }
    );
});

// Adding 10 receipts
app.post('/users/receipt/addten', async (req, res) => {
    let userid = {user: req.user.userid}.user;
    let {source, matter, category, price} = req.body;
    let currmonth = new Date().getMonth();
    let errors = [];

    pool.query(
        `insert into outgoing (userid, date, month, source, matter, category, price)
        values ($1, current_date, $2, $3, $4, $5, $6),
        ($1, current_date, $2, $3, $7, $8, $9),
        ($1, current_date, $2, $3, $10, $11, $12),
        ($1, current_date, $2, $3, $13, $14, $15),
        ($1, current_date, $2, $3, $16, $17, $18),
        ($1, current_date, $2, $3, $19, $20, $21),
        ($1, current_date, $2, $3, $22, $23, $24),
        ($1, current_date, $2, $3, $25, $26, $27),
        ($1, current_date, $2, $3, $28, $29, $30),
        ($1, current_date, $2, $3, $31, $32, $33)`,
        [userid, currmonth, source, matter[0], category[0], price[0],
        matter[1], category[1], price[1], matter[2], category[2], price[2],
        matter[3], category[3], price[3], matter[4], category[4], price[4],
        matter[5], category[5], price[5], matter[6], category[6], price[6],
        matter[7], category[7], price[7], matter[8], category[8], price[8],
        matter[9], category[9], price[9]],
        (err) => {
            if (err) {
                errors.push({message: "Something went wrong, receipts not added"});
                errors.push({message: "Remember to fill in everything!"});
                res.render('Current/addten', {errors})
            } else {
                res.redirect('/users/month');
            }
        }
    );
});

// Allowing new users to sign up 
app.post('/users/signup', async (req, res) => {
    let {username, password, password2} = req.body;
    let errors = [];

    if (!(username || password || password2))
        errors.push({message: "Please enter all fields"});

    if (password.length < 6)
        errors.push({message: "Passwords must be minimum 6 characters long"});

    if (password !== password2)
        errors.push({message: "Passwords do not match"});

    let count = 0;
    let numList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = 0; i < password.length; i++)
        for (let j = 0; j < numList.length; j++)
            if (password.charAt(i) == numList[j])
                count++;

    if (count == 0)
        errors.push({message: "Password must contain a number"});

    if (errors.length > 0) {
        res.render('signup', {errors});

    } else {
        let salt = await bcrypt.genSalt(10)
        let encryptedPassword = await bcrypt.hash(password, salt)

        pool.query(
            `select * from users
            where name = $1`,
            [username],
            (err, results) => {
                if (err)
                    throw err;

                if (results.rows.length > 0) {
                    errors.push({message: 'Username unavailable'});
                    res.render('signup', {errors});
                } else {
                    
                    pool.query(
                        `insert into users (name, password)
                        values($1, $2)
                        returning userid, password`,
                        [username, encryptedPassword],
                        (err) => {
                            if (err)
                                throw err;

                            req.flash('success_msg', 'You are now registered. Please log in');
                            res.redirect('/');
                        }
                    );
                }
            }
        );
    }
});

// If they sign in, they proceed to the menu, if else, they are remain at login
app.post('/', passport.authenticate('local', {
    successRedirect: '/users/menu',
    failureRedirect: '/',
    failureFlash: true
    })
);

// Authenticated users cannot access login/signup menu
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        return res.redirect('/users/menu');
    else
        next();
}

// Non-authenticated users must log in to access menu
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated())
        next();
    else
        return res.redirect('/');
}

app.listen(PORT, () => {
    console.log('Server is running');
});

// app.listen(PORT, '0.0.0.0');