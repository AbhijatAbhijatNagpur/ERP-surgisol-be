const mongoose = require('mongoose');
const Job = require('../models/job.model'); // Adjust the path as necessary
const JobView = require("../models/jobView.model")
const User = require("../models/user.model")
const moment = require('moment');
const Applicant = require('../models/applicant.model')





// Sample job data
const jobsData = [
  {
    title: "Full Stack Developer",
    company: "Tech Innovations Inc.",
    location: "San Francisco, CA",
    description: "We are seeking a talented Full Stack Developer to join our dynamic team...",
    requirements: [
      "5+ years of experience in web development",
      "Proficiency in JavaScript, React, and Node.js",
      "Experience with database design and ORM technologies"
    ],
    salary: 120000,
    isActive: true
  },
  {
    title: "Data Scientist",
    company: "DataCrunch Analytics",
    location: "New York, NY",
    description: "Join our data science team to solve complex problems using machine learning...",
    requirements: [
      "PhD or Master's degree in Computer Science, Statistics, or related field",
      "Strong programming skills in Python and R",
      "Experience with big data technologies like Hadoop and Spark"
    ],
    salary: 135000,
    isActive: true
  },
  {
    title: "UX Designer",
    company: "Creative Designs Co.",
    location: "Austin, TX",
    description: "We're looking for a creative UX Designer to craft intuitive user experiences...",
    requirements: [
      "3+ years of UX design experience",
      "Proficiency in design tools such as Sketch, Figma, and Adobe XD",
      "Strong portfolio demonstrating your design process"
    ],
    salary: 95000,
    isActive: true
  }
];

// Function to seed the database
async function seedJobs(req, res) {
  try {
    // Clear existing jobs
    await Job.deleteMany({});
    console.log('Cleared existing jobs');

    // Insert new jobs
    const insertedJobs = await Job.insertMany(jobsData);
    console.log(`Seeded ${insertedJobs.length} jobs`);
    res.status(200).json({message : "jobs data seeding successfull"})

    // Log the inserted jobs
    insertedJobs.forEach(job => {
      console.log(`Inserted job: ${job.title} at ${job.company}`);
    });

  } catch (error) {
    console.error('Error seeding jobs:', error);
  } 
}

async function getAllJobs(req, res){
    try {
        const { companyId } = req.body;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
      
       // Find jobs by company ID with pagination
        const allJobs = await Job.find({ company: companyId }, null, { skip, limit });
        if(allJobs.length === 0) {
            return res.status(400).json({message : "Failed to fetch jobs"})
        }
        res.status(200).json(allJobs);
    } catch (error) {
        res.status(500).json({message : error. message})
    }
}

async function getJobByIdAndUpdateViews(req, res){
    try {
      const { jobId } = req.params;
  
      // Find the job
      const job = await Job.findById(jobId);
  
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
  
      // Create a new JobView document
      const jobView = new JobView({ jobId });
      await jobView.save();
  
      // Update job views count (optional, if needed)
      job.views++;
      await job.save();
  
      res.status(200).json({ job });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
};

async function getJobViewsPercentageChange(req, res){
    try {
      // Get the current month's start and end dates
      const currentMonthStart = moment().startOf('month');
      const currentMonthEnd = moment().endOf('month');
  
      // Get the previous month's start and end dates
      const previousMonthStart = moment().subtract(1, 'month').startOf('month');
      const previousMonthEnd = moment().subtract(1, 'month').endOf('month');   
  
  
      // Find all jobs and calculate total views
      const allJobs = await Job.find().aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);
  
      // Calculate total views for the current month
      const currentMonthViews = await Job.find({
        postedDate: {
          $gte: currentMonthStart.toDate(),
          $lte: currentMonthEnd.toDate()
        }
      }).aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);
  
      // Calculate total views for the previous month
      const previousMonthViews = await Job.find({
        postedDate: {
          $gte: previousMonthStart.toDate(),
          $lte: previousMonthEnd.toDate()
        }
      }).aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);
  
      // Calculate the percentage change
      const totalViews = allJobs[0].totalViews;
      const currentMonthViewsTotal = currentMonthViews[0].totalViews;
      const previousMonthViewsTotal = previousMonthViews[0].totalViews;
      const percentageChange = ((currentMonthViewsTotal - previousMonthViewsTotal) / previousMonthViewsTotal) * 100;
  
      return {
        totalViews,
        percentageChange
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
};


 
  
async function getJobApplicationsPercentageChange(req, res){
    try {
      // Get the current month's start and end dates
      const currentMonthStart = moment().startOf('month');
      const currentMonthEnd = moment().endOf('month');
  
      // Get the previous month's start and end dates
      const previousMonthStart = moment().subtract(1, 'month').startOf('month');
      const previousMonthEnd = moment().subtract(1, 'month').endOf('month');
  
      // Find all applicants and their applied jobs
      const applicants = await Applicant.find().populate('appliedJobs');
  
      // Calculate total job applications for the current month
      const currentMonthApplications = applicants.reduce((acc, applicant) => {
        return acc + applicant.appliedJobs.filter(job => {
          return job.postedDate >= currentMonthStart.toDate() && job.postedDate <= currentMonthEnd.toDate();
        }).length;
      }, 0);
  
      // Calculate total job applications for the previous month
      const previousMonthApplications = applicants.reduce((acc, applicant) => {
        return acc + applicant.appliedJobs.filter(job => {
          return job.postedDate >= previousMonthStart.toDate() && job.postedDate <= previousMonthEnd.toDate();
        }).length;
      }, 0);
  
      // Calculate the percentage change
      const percentageChange = ((currentMonthApplications - previousMonthApplications) / previousMonthApplications) * 100;
  
      return {
        totalApplications: applicants.length,
        currentMonthApplications,
        previousMonthApplications,
        percentageChange
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
};


async function getEmployeeData(req, res){
  try {
    // Get the current month's start and end dates
    const currentMonthStart = moment().startOf('month');
    const currentMonthEnd = moment().endOf('month');

    // Get the previous month's start and end dates
    const previousMonthStart = moment().subtract(1, 'month').startOf('month');
    const previousMonthEnd = moment().subtract(1, 'month').endOf('month');

    // Find all employees
    const allEmployees = await User.find();

    // Calculate total employees for the current month
    const currentMonthEmployees = allEmployees.filter(employee => {
      return employee.hireDate >= currentMonthStart.toDate() && employee.joining_date <= currentMonthEnd.toDate();
    }).length;

    // Calculate total employees for the previous month
    const previousMonthEmployees = allEmployees.filter(employee => {
      return employee.hireDate >= previousMonthStart.toDate() && employee.joining_date <= previousMonthEnd.toDate();
    }).length;

    // Calculate total resigned employees for the current month
    const currentMonthResigned = allEmployees.filter(employee => {
      return employee.resignationDate && employee.resignationDate >= currentMonthStart.toDate() && employee.resignationDate <= currentMonthEnd.toDate();
    }).length;

    // Calculate total resigned employees for the previous month
    const previousMonthResigned = allEmployees.filter(employee => {
      return employee.resignationDate && employee.resignationDate >= previousMonthStart.toDate() && employee.resignationDate <= previousMonthEnd.toDate();
    }).length;

    // Calculate percentage changes
    const employeePercentageChange = ((currentMonthEmployees - previousMonthEmployees) / previousMonthEmployees) * 100;
    const resignedPercentageChange = ((currentMonthResigned - previousMonthResigned) / previousMonthResigned) * 100;

    return {
      totalEmployees: allEmployees.length,
    //   currentMonthEmployees,
    //   previousMonthEmployees,
      employeePercentageChange,
    //   currentMonthResigned,
    //   previousMonthResigned,
      resignedPercentageChange
    };
  } catch (err) {
    console.error(err);
    throw err;
  }
};


async function getCardsData(){
    try {
        let employeeCardsData = await getEmployeeData();
        let jobViewCardsData = await getJobViewsPercentageChange();
        let jobAppliedCardData = await getJobApplicationsPercentageChange();
        return { employeeCardsData, jobViewCardsData, jobAppliedCardData };
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}



module.exports  = { 
    seedJobs,
    getAllJobs,
    getJobByIdAndUpdateViews,
    getCardsData
}