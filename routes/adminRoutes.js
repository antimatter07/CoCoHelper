const express = require('express');
const router = express.Router();
const Administrator = require('../database/models/Administrator');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../authMiddleware');

module.exports = (logger) => {
    router.get('/', (req, res) => {
        try {
            res.redirect('/admin/register');
        } catch (err) {
            logger.error(err);
            res.status(500).send('Internal Server Error');
        }
    });

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
            logger.error(err);
            res.status(500).send('Internal Server Error');
        }
    });

    router.get('/login', (req, res) => {
        res.render('adminLogin');
    });

    router.post('/login', async (req, res) => {
      const { username, pw } = req.body;
  
      const maxAttempts = 5;
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes in milliseconds
  
      try {
          const admin = await Administrator.findOne({ username });
  
          if (!admin) {
              logger.warn("Login attempt with non-existent username", { username });
              return res.status(401).send('Invalid username or password');
          }
  
          // check if the account is currently locked out
          if (admin.lockoutUntil && admin.lockoutUntil > Date.now()) {
              logger.warn("Attempt to access locked account", { username: admin.username, lockoutUntil: admin.lockoutUntil });
              return res.status(403).send('Account is locked. Please try again later.');
          }
  
          const match = await bcrypt.compare(pw, admin.pw);
  
          if (match) {
              // log successful login
              logger.info("Successful login", { username: admin.username });
  
              // reset failed attempts and lockout status on successful login
              admin.failedAttempts = 0;
              admin.lockoutUntil = null;
              await admin.save();
              req.session.admin = admin;
              if (admin.role === 'product_manager') {
                  res.redirect('/product_manager_dashboard');
              } else {
                  res.redirect('/admin/web_admin_dashboard');
              }
          } else {
              // increment failed attempts and check if lockout is needed
              admin.failedAttempts += 1;
              await admin.save();
  
              if (admin.failedAttempts >= maxAttempts) {
                  admin.lockoutUntil = Date.now() + lockoutDuration; // set lockout time
                  await admin.save();
                  
                  logger.warn("Account locked due to too many failed login attempts", { username: admin.username, failedAttempts: admin.failedAttempts, lockoutUntil: admin.lockoutUntil });
                  res.status(403).send('Account is locked due to too many failed login attempts. Please try again later.');
              } else {
                  logger.warn("Failed login attempt", { username: admin.username, failedAttempts: admin.failedAttempts });
                  res.status(401).send('Invalid username or password');
              }
          }
      } catch (err) {
          logger.error("Error during login process", { error: err });
          res.status(500).send('Internal Server Error');
      }
  });
  

    router.get('/web_admin_dashboard', authMiddleware('website_administrator'), (req, res) => {
        logger.info('Accessing web admin dashboard');
        res.render('webAdminDashboard', { logViewerUrl: '/admin/logs' });
    });

    router.get('/logs', authMiddleware('website_administrator'), (req, res) => {
        logger.info('Accessing logs page');
        const logDir = path.join(__dirname, '../logs');
        fs.readdir(logDir, (err, files) => {
            if (err) {
                logger.error(err);
                return res.status(500).send('Error reading log directory');
            }
            const logFiles = files.filter(file => file.endsWith('.log'));
            res.render('adminLogs', { logFiles });
        });
    });

    router.get('/logs/:filename', authMiddleware('website_administrator'), (req, res) => {
        const filename = req.params.filename;
        const logPath = path.join(__dirname, '../logs', filename);
        fs.readFile(logPath, 'utf8', (err, data) => {
            if (err) {
                logger.error(err);
                return res.status(500).send('Error reading log file');
            }
            res.render('adminLogView', { filename, logContent: data });
        });
    });

    router.post('/logs/search', authMiddleware('website_administrator'), (req, res) => {
        const { filename, searchTerm } = req.body;
        const logPath = path.join(__dirname, '../logs', filename);
        fs.readFile(logPath, 'utf8', (err, data) => {
            if (err) {
                logger.error(err);
                return res.status(500).send('Error reading log file');
            }
            const lines = data.split('\n');
            const filteredLines = lines.filter(line => line.includes(searchTerm));
            res.render('adminLogView', { filename, logContent: filteredLines.join('\n'), searchTerm });
        });
    });

    router.use((err, req, res, next) => {
        logger.error('Error in admin routes:', err);
        res.status(500).render('error', { message: 'An error occurred' });
    });

    return router;
};
