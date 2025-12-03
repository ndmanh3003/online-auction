import express from 'express';
import * as configService from '../../services/config.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const configs = await configService.findAll();

  res.render('vwAdmin/config/index', {
    configs,
  });
});

router.get('/:key/edit', async function (req, res) {
  const config = await configService.findByKey(req.params.key);

  if (!config) {
    return res.status(404).render('404');
  }

  res.render('vwAdmin/config/edit', {
    config,
  });
});

router.put('/:key', async function (req, res) {
  const { value } = req.body;
  const config = await configService.findByKey(req.params.key);

  if (!config) {
    return res.status(404).render('404');
  }

  await configService.update(req.params.key, value.trim());

  res.redirect('/admin/config');
});

export default router;

