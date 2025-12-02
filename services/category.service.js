import Category from '../models/Category.js';
import * as dropdownService from './dropdown.service.js';

function buildParentIdQuery(parentId) {
  if (parentId === 'none' || parentId === '' || parentId === null) {
    return { parentId: null };
  }
  return { parentId };
}

export async function findAll(page = 1, limit = 10, parentId = null) {
  const query = buildParentIdQuery(parentId);
  const total = await Category.countDocuments(query);
  const skip = (page - 1) * limit;
  const items = await Category.find(query)
    .populate('parentId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findById(id) {
  return await Category.findById(id).populate('parentId', 'name');
}

export async function findByName(name) {
  return await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
}
export async function create(categoryData) {
  if (categoryData.parentId === '' || categoryData.parentId === null) {
    categoryData.parentId = null;
  }
  const category = new Category(categoryData);
  return await category.save();
}

export async function update(id, categoryData) {
  if (categoryData.parentId === '' || categoryData.parentId === null) {
    categoryData.parentId = null;
  }
  return await Category.findByIdAndUpdate(id, categoryData, { new: true });
}

export async function remove(id) {
  return await Category.findByIdAndDelete(id);
}

export async function getParentDropdown() {
  return await dropdownService.getDropdownData(
    Category,
    'name',
    '_id',
    { parentId: null },
    { name: 1 }
  );
}

export async function hasSubcategories(categoryId) {
  const count = await Category.countDocuments({ parentId: categoryId });
  return count > 0;
}

export async function countProductsByCategory(categoryId) {
  // This will be used when Product model is created
  // For now, return 0 to allow deletion
  // TODO: Implement when Product model exists
  // const Product = mongoose.model('Product');
  // return await Product.countDocuments({ categoryId });
  return 0;
}
