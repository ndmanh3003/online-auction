import 'dotenv/config';
import './../utils/db.js';
import ProductQuestion from '../models/ProductQuestion.js';

export const seedQuestions = async (products, bidders) => {
  try {
    console.log('Starting question seed...');

    await ProductQuestion.deleteMany({});
    console.log('Cleared existing questions');

    const questions = [];
    const questionTemplates = [
      {
        question: 'What is the exact condition of this item? Are there any scratches or damage?',
        answer: 'The item is in excellent condition with minimal signs of wear. No major scratches or damage. All details are shown in the photos.',
      },
      {
        question: 'Do you offer international shipping for this product?',
        answer: 'Yes, we ship internationally. Shipping costs will be calculated based on your location.',
      },
      {
        question: 'Is the certificate of authenticity included with this item?',
        answer: 'Yes, a certificate of authenticity is included with the purchase.',
      },
      {
        question: 'Can you provide more detailed photos of specific areas?',
        answer: 'I can send additional photos upon request. Please provide your email address.',
      },
      {
        question: 'What is your return policy for this item?',
        answer: 'We accept returns within 7 days if the item is not as described. Buyer pays return shipping.',
      },
      {
        question: 'How long have you owned this item?',
        answer: 'I have owned this item for approximately 3 years. It has been well-maintained during this time.',
      },
      {
        question: 'Are there any additional accessories included?',
        answer: 'All accessories shown in the photos are included. Nothing else is part of this listing.',
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept bank transfer, PayPal, and credit cards through our secure checkout system.',
      },
    ];

    for (const product of products.slice(0, 15)) {
      const numQuestions = 1 + Math.floor(Math.random() * 3);
      const shuffledBidders = [...bidders].sort(() => Math.random() - 0.5);
      const shuffledTemplates = [...questionTemplates].sort(() => Math.random() - 0.5);

      for (let i = 0; i < Math.min(numQuestions, shuffledBidders.length, shuffledTemplates.length); i++) {
        const hasAnswer = Math.random() > 0.3;
        const questionTime = new Date(product.createdAt.getTime() + (i + 1) * 7200000);

        questions.push({
          productId: product._id,
          askerId: shuffledBidders[i]._id,
          question: shuffledTemplates[i].question,
          answer: hasAnswer ? shuffledTemplates[i].answer : null,
          answeredAt: hasAnswer ? new Date(questionTime.getTime() + 3600000) : null,
          createdAt: questionTime,
        });
      }
    }

    await ProductQuestion.insertMany(questions);
    console.log(`Created ${questions.length} questions`);

    return questions;
  } catch (error) {
    console.error('Error seeding questions:', error);
    throw error;
  }
};

