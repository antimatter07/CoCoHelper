const express = require('express');
const router = express.Router();
const Administrator = require('../database/models/Administrator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = (logger) => {
    router.get('/', (req, res) => {
      try {
        res.redirect('admin/register');
      } catch (err) {
        logger.error(err);  // Use logger here
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
        res.redirect('/admin/register');
      } catch (err) {
        logger.error(err);  // Use logger here
        res.status(500).send('Internal Server Error');
      }
    });
  
    // log-in page for both web admin and product manager
    router.get('/login', (req, res) => {
      res.render('adminLogin');
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
          req.session.admin = admin;
          if (admin.role === 'product_manager') {
            res.redirect('/product_manager_dashboard');
          } else {
            res.redirect('/web_admin_dashboard');
          }
        } else {
          res.status(401).send('Invalid username or password');
        }
      } catch (err) {
        logger.error(err);  // Use logger here
        res.status(500).send('Internal Server Error');
      }
    });
  
    return router;
  };