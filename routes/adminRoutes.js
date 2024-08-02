const express = require('express');
const router = express.Router();
const Administrator = require('../database/models/Administrator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', (req, res) => {

    try {
    res.redirect('admin/register')
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
        

    }
});
// registration page
router.get('/register', (req, res) => {
    res.render('adminRegister'); 
});


router.post('/register', async (req, res) => {
    const { username, pw, role } = req.body;
    
    try {
        const hashedPw = await bcrypt.hash(pw, saltRounds);
        const newAdmin = new Administrator({ username, pw: hashedPw, role });
        await newAdmin.save();
        res.redirect('/admin/register'); // redirect to registration page or any other page
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

//log-in page for both web admin and product manager
router.get('/login', (req, res) => {
    res.render('adminLogin'); // Render login view
});

router.post('/login', async (req, res) => {
    const { username, pw } = req.body;
    
    try {
        const admin = await Administrator.findOne({ username });
        
        if (!admin) {
            return res.status(401).send('Invalid username or password');
        }

        const match = await bcrypt.compare(pw, admin.pw);

        if (match) {
            req.session.admin = admin; // Save admin info in session
            if (admin.role === 'product_manager') {
                res.redirect('/product_manager_dashboard'); // Redirect to Product Manager dashboard
            } else {
                res.redirect('/web_admin_dashboard'); // Redirect to Website Administrator dashboard
            }
        } else {
            res.status(401).send('Invalid username or password');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;

