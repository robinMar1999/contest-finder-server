const mongoose = require("mongoose");

const ContestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  contest_ids: [Number],
});

module.exports = Contest = mongoose.model("contest", ContestSchema);
