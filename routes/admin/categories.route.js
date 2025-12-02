import express from 'express';
import * as categoryService from '../../services/category.service.js';

const router = express.Router();

router.get('/', async function (req, res) {
  const page = parseInt(req.query.page) || 1;
  const parentId = req.query.parentId || 'none';
  const result = await categoryService.findAll(page, 10, parentId);
  const drpdwnParents = await categoryService.getParentDropdown();

  res.render('vwAdmin/categories/index', {
    ...result,
    drpdwnParents,
  });
});

router.get('/create', async function (req, res) {
  const drpdwnParents = await categoryService.getParentDropdown();

  res.render('vwAdmin/categories/create', {
    drpdwnParents,
  });
});

router.post('/create', async function (req, res) {
  const { name, img_url, description, parentId } = req.body;

  if (parentId) {
    const parent = await categoryService.findById(parentId);
    if (!parent) {
      return res.error('Parent category not found.');
    }
    if (parent.parentId) {
      return res.error('Cannot select a subcategory as parent.');
    }
  }

  await categoryService.create({
    name: name.trim(),
    img_url: img_url.trim(),
    description: description ? description.trim() : '',
    parentId: parentId || null,
  });

  res.redirect('/admin/categories');
});

router.get('/:id/edit', async function (req, res) {
  const category = await categoryService.findById(req.params.id);
  if (!category) {
    return res.status(404).render('404');
  }

  const drpdwnParents = await categoryService.getParentDropdown();

  res.render('vwAdmin/categories/edit', {
    category,
    drpdwnParents,
  });
});

router.put('/:id', async function (req, res) {
  const { id } = req.params;
  const { name, img_url, description, parentId } = req.body;

  const category = await categoryService.findById(id);
  if (!category) {
    return res.status(404).render('404');
  }

  if (parentId) {
    if (parentId === id) {
      return res.error('Cannot set category as its own parent.');
    }

    const parent = await categoryService.findById(parentId);
    if (!parent) {
      return res.error('Parent category not found.');
    }

    if (parent.parentId) {
      return res.error('Cannot select a subcategory as parent');
    }
  }

  if (category.parentId === null && parentId) {
    if (await categoryService.hasSubcategories(id)) {
      return res.error('Cannot convert parent category to subcategory');
    }
  }

  await categoryService.update(id, {
    name: name.trim(),
    img_url: img_url.trim(),
    description: description ? description.trim() : '',
    parentId: parentId || null,
  });

  res.redirect('/admin/categories');
});

router.delete('/:id', async function (req, res) {
  const { id } = req.params;

  const category = await categoryService.findById(id);
  if (!category) {
    return res.error('Category not found.');
  }

  if (await categoryService.hasSubcategories(id)) {
    return res.error('Cannot delete category that has subcategories');
  }

  const productCount = await categoryService.countProductsByCategory(id);
  if (productCount > 0) {
    return res.error('Cannot delete category that has products.');
  }

  await categoryService.remove(id);
  
  res.redirect('/admin/categories');
});

export default router;
