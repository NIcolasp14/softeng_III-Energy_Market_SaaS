const express = require('express');

const agpt = require('../controllers/agpt');
const upload = require("../middlewares/upload");

const router = express.Router();

router.post('/',upload.single("file"), agpt.postSystem);

module.exports = router;