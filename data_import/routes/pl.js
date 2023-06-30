const express = require('express');

const pl = require('../controllers/pl');
const upload = require("../middlewares/upload");

const router = express.Router();

router.post('/',upload.single("file"), pl.postSystem);

module.exports = router;