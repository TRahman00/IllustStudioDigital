const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const fileController = require('../controllers/fileController');

// router.use(auth);   // <-- Authentication temporarily disabled for development

router.post('/', fileController.createFile);
router.get('/', fileController.getUserFiles);
router.get('/:id', fileController.getFileById);
router.put('/:id', fileController.updateFile);
router.delete('/:id', fileController.deleteFile);
router.post('/:id/export', fileController.exportFile);
router.post('/:id/save-local', fileController.saveLocalCopy);

module.exports = router;