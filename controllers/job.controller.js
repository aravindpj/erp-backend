const { JobRequestSchema, Job } = require("../models/Job.model");
const Client = require("../models/Client.model");
const EmailService = require("../services/email");
exports.saveJobRequest = async (req, res) => {
  try {
    let jobrequest = new JobRequestSchema({ ...req.body });
    jobrequest = await jobrequest.save();
    Job.$locals = { createdBy: req.body.createdBy, jobId: jobrequest.jobId };
    Job.insertMany(req.body.testRows);
    const client = await Client.findOne({ clientId: req.body.clientId });
    if (process.env.MAIL_SERVICE == "enabled") {
      await EmailService.sendMail({
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Job Request Created</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #f8f9fa;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              background: #ffffff;
              margin: 40px auto;
              padding: 24px 32px;
              border-radius: 12px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            }
            h2 {
              color: #333333;
              font-size: 22px;
              margin-bottom: 8px;
            }
            p {
              color: #555555;
              line-height: 1.6;
              font-size: 15px;
            }
            .job-info {
              background: #f1f3f5;
              border-radius: 8px;
              padding: 16px;
              margin-top: 16px;
            }
            .job-info p {
              margin: 4px 0;
            }
            .label {
              font-weight: 600;
              color: #222;
            }
            .footer {
              margin-top: 32px;
              text-align: center;
              font-size: 13px;
              color: #777;
            }
            .footer a {
              color: #0066cc;
              text-decoration: none;
            }
            .highlight {
              color: #007bff;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>✅ Job Request Created Successfully!</h2>
            <p>Dear <span class="highlight">${client.businessName}</span>,</p>
            <p>
              We’re pleased to inform you that your job request has been successfully created.  
              Our team will review the details and get back to you soon.
            </p>

            <div class="job-info">
              <p><span class="label">Job ID:</span> ${jobrequest.jobId}</p>
              <p><span class="label">Client Name:</span> ${
                client.businessName
              }</p>
              <p><span class="label">Client Email:</span> ${client.email}</p>
              <p><span class="label">Address:</span> ${
                client.businessAddress
              }</p>
              <p><span class="label">Job Details:</span> ${
                jobrequest.detailsProvided
              }</p>
            </div>

            <p>
              Thank you for choosing our services.<br />
              If you have any questions, feel free to reply to this email.
            </p>

            <div class="footer">
              <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
              <p><a href="http://localhost:${process.env.UI_PORT}/job-details/${
          jobrequest.jobId
        }">View more details</a></p>
            </div>
          </div>
        </body>
  </html>
  `,
        subject: "✅ Job Request Created Successfully",
        text: `Job request created successfully with Job ID: ${jobrequest.jobId}`,
        to: req.body.clientEmail,
      });
    }
    return res.success({
      status: 200,
      message: "Job request created successfully",
      data: jobrequest,
    });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getJobRequests = async (req, res) => {
  try {
    // const data = await JobRequestSchema.find({ clientId: req.params.id });
    const data = await JobRequestSchema.aggregate([
      { $match: { clientId: req.params.id } },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "jobId",
          as: "testRows",
        },
      },
    ]);
    if (!data || data.length === 0) {
      return res.error({
        status: 404,
        message: "No jobs found for this client",
      });
    }

    res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.getJobDetails = async (req, res) => {
  try {
    const { id } = req.params;
    let data = await JobRequestSchema.findOne({ jobId: id });
    if (!data) {
      return res.error({ status: 404, message: "Job not found !" });
    }
    return res.success({ status: 200, data });
  } catch (error) {
    console.log(error);
    return res.error({ status: 500, error });
  }
};

exports.updateJobRequest = async (req, res) => {
  try {
    const updateFields = {};
    for (let key in req.body) {
      if (req.body[key] && key != "jobId" && key != "clientId") {
        updateFields[key] = req.body[key];
      }
    }

    let data = await JobRequestSchema.findOneAndUpdate(
      { jobId: req.body.jobId },
      { $set: updateFields },
      { new: true }
    );
    let jobs = req.body.testRows;
    console.log(req.body)
    const incomingTechIds = jobs.map((j) => j.tech);
    for (const item of jobs) {
      await Job.updateOne(
        { jobId: data.jobId, tech: item.tech },
        { ...item, jobId: data.jobId },
        { upsert: true }
      );
    }

    await Job.deleteMany({
      jobId:data.jobId,
      tech: { $nin: incomingTechIds },
    });

    if (data) {
      return res.success({
        status: 200,
        data: "test",
        message: "Job request updated successfully",
      });
    } else {
      res.success({ status: 404, data, message: "No job found to update" });
    }
    // return res.success({
    //   status: 200,
    //   message: "Job request created successfully",
    //   data: jobrequest,
    // });
  } catch (error) {
    console.log(error)
    return res.error({ status: 500, error });
  }
};
