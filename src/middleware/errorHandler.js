export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Server error';

  if (req.path.startsWith('/api/')) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Invalid data',
        errors: Object.values(err.errors).map(e => e.message)
      });
    }

    if (err.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID' });
    }

    return res.status(status).json({
      message,
    });
  }

  res.status(status).render('error', {
    title: `${status} - Error`,
    message,
  });
};
