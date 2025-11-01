const Job = require("../models/Job.model");

exports.saveJobRequest = async (req, res) => {
  try {
    const jobrequest = new Job({ ...req.body });
    await jobrequest.save();
    return res.success({
      status: 200,
      message: "Job request created successfully",
      data: jobrequest,
    });
  } catch (error) {
    return res.error({ status: 500, error });
  }
};

exports.getJobRequests = async (req, res) => {
  try {
    const data = await Job.find({ clientId: req.params.id });
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

exports.updateJobRequest = async (req, res) => {
  try {
    const updateFields = {};
    for (let key in req.body) {
      if (req.body[key] && key != "jobId" && key != "clientId") {
        updateFields[key] = req.body[key];
      }
    }
    let data = await Job.findOneAndUpdate(
      { jobId: req.body.jobId },
      { $set: updateFields },
      { new: true }
    );
    if(data){
      return res.success({status:200,data,message:"Job request updated successfully"})
    }else{
       res.success({status:404,data,message:"No job found to update"})
    }
    return res.success({
      status: 200,
      message: "Job request created successfully",
      data: jobrequest,
    });
  } catch (error) {
    return res.error({ status: 500, error });
  }
};
