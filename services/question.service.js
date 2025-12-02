import ProductQuestion from '../models/ProductQuestion.js';

export async function findById(id) {
  return await ProductQuestion.findById(id)
    .populate('askerId', 'name email')
    .populate('productId', 'name sellerId');
}

export async function findByProductId(productId) {
  return await ProductQuestion.find({ productId })
    .populate('askerId', 'name')
    .sort({ createdAt: -1 });
}

export async function create(questionData) {
  const question = new ProductQuestion(questionData);
  return await question.save();
}

export async function answer(id, answerText) {
  return await ProductQuestion.findByIdAndUpdate(
    id,
    {
      answer: answerText,
      answeredAt: new Date(),
    },
    { new: true }
  );
}

export async function remove(id) {
  return await ProductQuestion.findByIdAndDelete(id);
}

