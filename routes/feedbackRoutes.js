const express = require('express');
const multer = require('multer');
const Feedback = require('../models/Feedback');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');
require('dotenv').config();
const cloudinary = require('../config/cloudinary');

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

router.post(
    '/',
    upload.single('photo'),
    [
        body('name', 'Name is required').notEmpty(),
        body('batch', 'Batch is required').notEmpty(),
        body('feedback', 'Feedback is required').notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { name, batch, mobile, feedback, comments } = req.body;
            let photo = null;
            let photoType = null;
            let photoUrl = null;

            if (req.file) {
                photo = req.file.buffer;
                photoType = req.file.mimetype;

                const uploadResult = await cloudinary.uploader.upload(
                    `data:${photoType};base64,${photo.toString('base64')}`, {
                        folder: 'classroom_feedback_images',
                        resource_type: 'image',
                    }
                );
               photoUrl = uploadResult.secure_url;
            }

           const newFeedback = new Feedback({
                name,
                batch,
                mobile,
               feedback,
               comments,
                photo: photoUrl, //Store the photoUrl
                photoType
           });
            await newFeedback.save();
           res.status(201).json({ message: 'Feedback submitted successfully!' });
           logger.info(`New feedback submitted by ${name}`);

            if (feedback === 'Negative') {
                const mailOptions = {
                    from: process.env.MAIL_USER,
                   to: process.env.NOTIFICATION_EMAIL,
                    subject: 'New Negative Feedback Received',
                     text: `A new negative feedback has been submitted by ${name} in batch ${batch}. Comments: ${comments}`,
                };

               transporter.sendMail(mailOptions, (error, info) => {
                  if (error) {
                        console.error('Error sending email:', error);
                        logger.error('Error sending email', error);
                   } else {
                        console.log('Email sent: ' + info.response);
                      logger.info('Email sent: ' + info.response);
                  }
                });
            }
        } catch (error) {
           console.error('Error submitting feedback:', error);
            logger.error('Error submitting feedback', error);
             res.status(500).json({ message: 'Failed to submit feedback.' });
       }
  });

router.get('/', protect, async (req, res) => {
    try {
        const { batch, startDate, endDate, feedback } = req.query;
        let query = {};
        if (batch) {
            query.batch = batch;
        }
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setDate(new Date(endDate).getDate() + 1)),
            };
        }
        if (feedback) {
            query.feedback = feedback;
        }
        const feedbackData = await Feedback.find(query);
        res.json(feedbackData);
        logger.info(`Fetched feedback data with query ${JSON.stringify(req.query)}`);
    } catch (error) {
        console.error('Error fetching feedback data:', error);
        logger.error('Error fetching feedback data', error);
        res.status(500).json({ message: 'Failed to load data.' });
    }
});

module.exports = router;