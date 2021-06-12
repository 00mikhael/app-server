const router = require('express').Router();
const expressDomain = require('express-domain-middleware');

const { database, headers } = require('../middleware');


router.use(expressDomain);
router.use(database);
router.use(headers);

router.get('/', async (req, res) => {
    res.send({
        message: "Api Endpoint"
    });
});

module.exports = router;
