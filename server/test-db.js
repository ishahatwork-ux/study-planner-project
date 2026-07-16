const mongoose = require('mongoose');

const uri = "mongodb+srv://ishahatwork_db_user:MyPassword12345@cluster0.beyjcvp.mongodb.net/StudySyncAI?appName=Cluster0";

console.log("Attempting to connect...");
mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESS: Connected to MongoDB Atlas");
    process.exit(0);
  })
  .catch(err => {
    console.error("FAIL: Could not connect", err);
    process.exit(1);
  });
