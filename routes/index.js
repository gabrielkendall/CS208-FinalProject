var express = require('express');
var router = express.Router();

const COMMENTS_PER_PAGE = 10;

// Remove dissallowed characters
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .trim();
}

// Filter out Nonsense Comments
function isLowQualityText(str) {
  // Remove spaces for detection purposes
  const cleaned = str.replace(/\s+/g, '');

  
  // Count unique characters
  const uniqueChars = new Set(cleaned);

  // if less than 3 unique characters I.E. asdasdasdasd
  if (uniqueChars.size <= 3) {
    return true;
  }

  // If only a few characters long
  return cleaned.length < 15;
}

function formatTimestamp(dateString) {
  const now = new Date();
  const posted = new Date(dateString);
  const diffMs = now - posted;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) {
    const mins = Math.floor(diffMs / minute);
    return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  }

  return posted.toLocaleString();
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET Menu. */
router.get('/menu', function(req, res, next) {
  res.render('menu', { title: 'Menu' });
});

/* GET Contacts Page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contacts' });
});

/* GET Reviews page. */
router.get('/reviews', function(req, res, next) {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const offset = (page - 1) * COMMENTS_PER_PAGE;

  try {
    req.db.query('SELECT COUNT(*) AS total FROM comments', (countErr, countResults) => {
      if (countErr) {
        console.error('Error counting comments:', countErr);
        return res.status(500).render('reviews', {
          title: 'Reviews',
          comments: [],
          currentPage: 1,
          totalPages: 1,
          formData: { name: '', comment: '' },
          errorMessage: 'Sorry, comments could not be loaded right now.',
          successMessage: ''
        });
      }

      const totalComments = countResults[0].total;
      const totalPages = Math.max(Math.ceil(totalComments / COMMENTS_PER_PAGE), 1);

      req.db.query(
        'SELECT id, name, comment, created_at FROM comments ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [COMMENTS_PER_PAGE, offset],
        (err, results) => {
          if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).render('reviews', {
              title: 'Reviews',
              comments: [],
              currentPage: 1,
              totalPages: 1,
              formData: { name: '', comment: '' },
              errorMessage: 'Sorry, comments could not be loaded right now.',
              successMessage: ''
            });
          }

          const comments = results.map(comment => ({
            ...comment,
            displayTime: formatTimestamp(comment.created_at)
          }));

          res.render('reviews', {
            title: 'Reviews',
            comments,
            currentPage: page,
            totalPages,
            formData: { name: '', comment: '' },
            errorMessage: '',
            successMessage: /* req.query.success ? 'Your comment was posted.' :  */ ''
          });
        }
      );
    });
  } catch (error) {
    console.error('Error in reviews route:', error);
    res.status(500).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name: '', comment: '' },
      errorMessage: 'Sorry, something went wrong loading the page.',
      successMessage: ''
    });
  }
});

router.post('/reviews', function(req, res, next) {
  const MAX_NAME_LENGTH = 100;
  const MAX_COMMENT_LENGTH = 500;

  let { name, comment } = req.body;

  name = sanitizeInput(name);
  comment = sanitizeInput(comment);

  if (!name || !comment) {
    return res.status(400).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name, comment },
      errorMessage: 'Name and comment are required.',
      successMessage: ''
    });
  }

  if (isLowQualityText(comment)) {
    return res.status(400).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name, comment },
      errorMessage: 'Please enter a more meaningful comment.',
      successMessage: ''
    });
  }

  if (name.length > MAX_NAME_LENGTH) {
    return res.status(400).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name, comment },
      errorMessage: `Name must be ${MAX_NAME_LENGTH} characters or fewer.`,
      successMessage: ''
    });
  }

  if (comment.length > MAX_COMMENT_LENGTH) {
    return res.status(400).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name, comment },
      errorMessage: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.`,
      successMessage: ''
    });
  }

  try {
    req.db.query(
      'INSERT INTO comments (name, comment, created_at) VALUES (?, ?, NOW())',
      [name, comment],
      (err, results) => {
        if (err) {
          console.error('Error adding comment:', err);
          return res.status(500).render('reviews', {
            title: 'Reviews',
            comments: [],
            currentPage: 1,
            totalPages: 1,
            formData: { name, comment },
            errorMessage: 'Sorry, your comment could not be saved.',
            successMessage: ''
          });
        }

        res.redirect('/reviews?success=1');
      }
    );
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name, comment },
      errorMessage: 'Sorry, something went wrong submitting your comment.',
      successMessage: ''
    });
  }
});


router.post('/clear', function(req, res, next) {
  try {
    req.db.query('TRUNCATE TABLE comments', (err, results) => {
      if (err) {
        console.error('Error clearing comments table:', err);
        return res.status(500).render('reviews', {
          title: 'Reviews',
          comments: [],
          currentPage: 1,
          totalPages: 1,
          formData: { name: '', comment: '' },
          errorMessage: 'Sorry, the comments could not be cleared.',
          successMessage: ''
        });
      }

      res.redirect('/reviews?success=cleared');
    });
  } catch (error) {
    console.error('Error clearing comments table:', error);
    res.status(500).render('reviews', {
      title: 'Reviews',
      comments: [],
      currentPage: 1,
      totalPages: 1,
      formData: { name: '', comment: '' },
      errorMessage: 'Sorry, something went wrong clearing the comments.',
      successMessage: ''
    });
  }
});

module.exports = router;
