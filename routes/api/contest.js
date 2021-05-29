const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const request = require("request");
const Contest = require("../../models/Contest");

// @route     GET api/contest
// @desc      Contest route
// @access    Public
router.get("/", async (req, res) => {
  try {
    const allContests = await Contest.findOne({ name: "all" });
    let doneContests = await Contest.findOne({ name: "done" });
    if (!allContests) {
      return res.json({ contests: [] });
    }
    if (!doneContests) {
      doneContests = new Contest({
        name: "done",
        contest_ids: [],
      });
    }
    await doneContests.save();
    const remContests = [];
    for (let i = 0; i < allContests.contest_ids.length; i++) {
      let found = false;
      for (let j = 0; j < doneContests.contest_ids.length; j++) {
        if (doneContests.contest_ids[j] === allContests.contest_ids[i]) {
          found = true;
          break;
        }
      }
      if (!found) {
        remContests.push(allContests.contest_ids[i]);
      }
    }
    res.json({ contests: remContests });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

router.post("/update", (req, res) => {
  const url = "https://codeforces.com/api/contest.list";
  request({ url, json: true }, async (err, { body }) => {
    if (err) {
      res.status(500).json({ error: "Unable to connect to Codeforces API" });
    } else if (body.status === "FAILED") {
      res.status(500).json({ error: "Codeforces API server error" });
    } else {
      try {
        let allContests = await Contest.findOne({ name: "all" });
        if (!allContests) {
          allContests = new Contest({
            name: "all",
            contest_ids: [],
          });
        }
        body.result.forEach((contest) => {
          if (
            !(
              contest.name.includes("Div. 2") || contest.name.includes("Global")
            ) ||
            contest.relativeTimeSeconds < 0
          ) {
            // do nothing
          } else {
            allContests.contest_ids.push(parseInt(contest.id));
          }
        });

        await allContests.save();
        res.json({ msg: "Successful" });
      } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Server Error" });
      }
    }
  });
});

router.post(
  "/",
  [body("contest_id", "Contest id is required").not().isEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0] });
      }
      let { contest_id } = req.body;
      contest_id = parseInt(contest_id);
      let doneContests = await Contest.findOne({ name: "done" });
      if (!doneContests) {
        doneContests = new Contest({
          name: "done",
          contest_ids: [],
        });
      }
      doneContests.contest_ids.push(contest_id);
      await doneContests.save();
      res.json({ msg: "Successful" });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

module.exports = router;
