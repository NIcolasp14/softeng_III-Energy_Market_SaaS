const express = require('express');

const atl = require('../controllers/atl');
const upload = require("../middlewares/upload");

const router = express.Router();

router.post('/',upload.single("file"), atl.postSystem);

module.exports = router;