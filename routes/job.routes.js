const express = require('express')
const router = express.Router()
const jobController = require("../controllers/job.controller")
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const checkCompanyId = require("../middlewares/checkCompanyId.middleware");

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.COUNDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


// Route to handle resume upload
// Configure multer for handling file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to handle resume upload
router.post('/upload-resume', checkCompanyId, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Convert buffer to base64
        const fileStr = req.file.buffer.toString('base64');
        const fileType = req.file.mimetype;

        // Upload to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(
            `data:${fileType};base64,${fileStr}`,
            {
                resource_type: 'raw',
                folder: 'resumes',
                use_filename: true,
                unique_filename: true
            }
        );
        // The file has been uploaded to Cloudinary
        const resumeUrl = uploadResponse.secure_url;
        res.json({ message: 'Resume uploaded successfully', resumeUrl: resumeUrl });
    } catch (error) {
        console.error('Error uploading resume:', error);
        res.status(500).json({ error: 'Error uploading resume' });
    }
});





router.post("/seed-jobs", jobController.seedJobs)
router.get("/all-jobs", checkCompanyId, jobController.getAllJobs)



module.exports = router ;