const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { log } = require('console');

const app = express();
const port = 5000;

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use original file name
  }
});

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'freelancing'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL database: ', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.post('/register', (req, res) => {
  const signupUsername = req.body.signupUsername;
  const signupEmail = req.body.signupEmail;
  const signupPhno = req.body.signupPhno;
  const signupPassword = req.body.signupPassword;

  console.log(signupEmail,signupUsername,signupPhno,signupPassword);
  // Check if username already exists
  const checkUsernameQuery = 'SELECT * FROM users WHERE name like ?';
  
  connection.query(checkUsernameQuery, signupUsername, (checkUsernameErr, checkUsernameResult) => {
    if (checkUsernameErr) {
      console.error('Error checking existing name:', checkUsernameErr);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (checkUsernameResult.length > 0) {
      return res.json({ success: "Username Already exist" });
    }

    // Check if email already exists
    const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
    connection.query(checkEmailQuery, signupEmail, (checkEmailErr, checkEmailResult) => {
      if (checkEmailErr) {
        console.error('Error checking existing email:', checkEmailErr);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (checkEmailResult.length > 0) {
        return res.json({ success: "Email Already exist" });
      }

      // Check if phone number already exists
      const checkPhnoQuery = 'SELECT * FROM users WHERE phone_number = ?';
      connection.query(checkPhnoQuery, signupPhno, (checkPhnoErr, checkPhnoResult) => {
        if (checkPhnoErr) {
          console.error('Error checking existing phone number:', checkPhnoErr);
          return res.status(500).json({ error: 'Internal server error' });
        }

        if (checkPhnoResult.length > 0) {
          return res.json({ success: "Phone number Already exist" });
        }


        // Insert new user if username, email, and phone number are unique
        const sql = "INSERT INTO users (name, email, phone_number, password, location, gender, dob, type, status, skills, image, email_verified_at, remember_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
  const values = [
    signupUsername,
    signupEmail,
    signupPhno,
    signupPassword,
    null,
    null,
    null,
    "Buyer",
    1,
    null,
    null,
    null,
    null,
    null
  ];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error inserting user data:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('User registered successfully');
    return res.json({ success: "Registration Successfully!!!" });
  });

      });
    });
  });
});


app.post('/auth', (req, res) => {
  const email = req.body.loginUsername;
  const password = req.body.loginPassword;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  console.log(email);
  console.log(password);
  connection.query(sql, [email, password], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.json({ success: true, message: 'Login successful' });
    } else {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

app.get('/user-data/:email', (req, res) => {
  const { email } = req.params;
  const sql = 'SELECT * FROM users WHERE email = ?';

  connection.query(sql, [email], (error, results) => {
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.json(results[0]);
      
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  });
});

app.get('/user-data-id/:id', (req, res) => {
  const { id } = req.params;
  // console.log(id);
  const sql = 'SELECT * FROM users WHERE id = ?';

  connection.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      return res.json(results[0]);
      
    } else {
      return res.status(404).json({ error: 'User not found' });
    }
  });
});

// Update profile route
app.put('/update-profile', (req, res) => {
  const location = req.body.location
  const gender = req.body.gender
  const dob = req.body.dob
  const email = req.body.email
  console.log(req.body);
  const query = `UPDATE users SET location=?, gender=?, dob=? WHERE email=?`;

  connection.query(query, [ location, gender, dob, email], (err, results) => {
    if (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    console.log('Profile updated successfully');
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

app.put('/update-about', (req, res) => {
  const aboutMe = req.body.aboutMe
  const email = req.body.email
  console.log(req.body);
  const query = `UPDATE users SET aboutMe=? WHERE email=?`;

  connection.query(query, [aboutMe, email], (err, results) => {
    if (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    console.log('Profile updated successfully');
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

app.put('/update-skills', (req, res) => {
  
  const skills = req.body.skills
  const email = req.body.email
  console.log(req.body);
  const query = `UPDATE users SET skills=? WHERE email=?`;

  connection.query(query, [skills, email], (err, results) => {
    if (err) {
      console.error('Error updating profile:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    console.log('Profile updated successfully');
    res.status(200).json({ message: 'Profile updated successfully' });
  });
});

const upload2 = multer({ storage: storage });

// app.post('/api/gigImage', upload2.single('image'), (req, res) => {
//   console.log(req.file);
// });


// Route to handle image upload and update in the users table
app.post('/upload-profile-image', upload2.single('image'), (req, res) => {
  const email = req.body.email; // Email of the user
  const imagePath = req.file.filename; // Path to the uploaded image
console.log(imagePath);
  // Update the image path in the users table
  const query = 'UPDATE users SET image = ? WHERE email = ?';
  connection.query(query, [imagePath, email], (err, results) => {
    if (err) {
      console.error('Error updating profile image:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    console.log('Profile image updated successfully');
    res.status(200).json({ message: 'Profile image updated successfully' });
  });
});

app.get('/api/categories', (req, res) => {
  const query = 'SELECT id, name FROM categories WHERE category_parent_id IS null'; // Adjust the table and column names as per your database schema
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results); // Send the fetched categories as a JSON response
  });
});
app.get('/api/subCategory/:id', (req, res) => {
  const { id } = req.params
  const query = 'SELECT id, name FROM categories WHERE category_parent_id = ?'; // Adjust the table and column names as per your database schema
  connection.query(query, [id],(err, results) => {
    if (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(results); // Send the fetched categories as a JSON response
  });
});



app.post('/type', (req, res) => {
  const email = req.body.email; // Assuming you pass only the email as a string from the frontend
  const sql = `UPDATE users SET type = 'Seller' WHERE email = ?`;
  console.log('serverside: ',req.body.email);
  connection.query(sql, email,(err, result) => {
    if (err) {
      console.error(`Error updating user with email ${email} to Seller:`, err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`User with email ${email} updated to Seller`);
      res.status(200).send('User type updated successfully');
    }
  });
});



const upload = multer({ storage: storage });

app.post('/api/gigImage', upload.single('file'), (req, res) => {
  console.log(req.file);
});


app.post('/api/gigs', (req, res) => {
  
  const title = req.body.title
  const description = req.body.description
  const price = req.body.price
  const category = req.body.category
  const uid = req.body.uid
  const image = req.body.image // The filename of the uploaded image
  
  console.log(req.file);
console.log(title);
  const query = 'INSERT INTO gigs (gigtitle, gigimage, gigdesc, gigprice, uid, gigstatus, category_id) VALUES (?, ?, ?, ?, ?, 1, ?)';
  connection.query(query, [title, image, description, price, uid,category], (err, result) => {
    if (err) {
      console.error('Error creating gig:', err);
      res.status(500).json({ error: 'An error occurred while creating the gig' });
    } else {
      console.log('Gig created successfully');
      res.status(201).json({ message: 'Gig created successfully' });
    }
  });
});
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/gigEdit', (req, res) => {
  
  const title = req.body.title
  const description = req.body.description
  const price = req.body.price
  const category = req.body.category
  const gid = req.body.gid
  const i = req.body.image
  const imageFilename =i.split('\\').pop().split('/').pop();
  
  console.log("reqbody:",req.body);
  // const imageFilename = req.file ? req.file.filename : null;

  const queryFetchPreviousImage = 'SELECT gigimage FROM gigs WHERE id = ?';
  connection.query(queryFetchPreviousImage, [gid], (err, results) => {
    if (err) {
      console.error('Error fetching previous image filename:', err);
      res.status(500).json({ error: 'An error occurred while updating the gig' });
    } else {
      // Get the previous image filename from the query results
      // const previousImageFilename = results.length > 0 ? results[0].image_filename : null;
    
      const previousImageFilename = results[0].gigimage.split('\\').pop().split('/').pop();
      console.log("Results",results[0].gigimage);
      // const previousImageFilename = results.length > 0 ? results[0].image_filename : null;

      // Use the previous image filename if no new image is uploaded
      const finalImageFilename = imageFilename || previousImageFilename;
      console.log("newimage:",imageFilename);
      console.log("previousimage:",previousImageFilename);
      console.log("final image:",finalImageFilename);


  const query = 'UPDATE gigs SET gigtitle = ?, gigdesc = ?, gigprice = ? where id = ?';
  connection.query(query, [title, description,price,  gid], (err, result) => {
    if (err) {
      console.error('Error Updating gig:', err);
      res.status(500).json({ error: 'An error occurred while creating the gig' });
    } else {
      console.log('Gig Updating successfully');
      res.status(201).json({ message: 'Gig created successfully' });
    }
  });
}
  });
});

const upload1 = multer({ storage: storage });

app.post('/api/gigEditImage', upload1.single('file1'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  console.log("backend",req.file.filename);
});

app.post('/api/gigDelete', (req, res) => {
  console.log(req.body);
  const gid = req.body.gid

  const query = 'DELETE from gigs where id = ?';
  connection.query(query, gid, (err, result) => {
    if (err) {
      console.error('Error deleting gig:', err);
      res.status(500).json({ error: 'An error occurred while creating the gig' });
    } else {
      console.log('Gig deleting successfully');
      res.status(201).json({ message: 'Gig created successfully' });
    }
  });
});
const imagePath = path.join(__dirname, 'uploads');

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(imagePath));
app.get('/api/gigfetch/:id', (req, res) => {
  const query = 'SELECT gigs.*, categories.name, COALESCE(review_details.avg_rating, 0) AS average_rating, COALESCE(review_details.total_reviews, 0) AS total_reviews FROM gigs JOIN users ON gigs.uid = users.id JOIN categories ON gigs.category_id = categories.id LEFT JOIN ( SELECT gig_id, AVG(rating) AS avg_rating, COUNT(*) AS total_reviews FROM gig_reviews GROUP BY gig_id ) AS review_details ON gigs.id = review_details.gig_id WHERE gigs.uid = ?'; // Adjust this query based on your database schema
  const {id} = req.params;
  console.log(id);
  
  connection.query(query,[id] ,(err, results) => {
    
    if (err) {
      console.error('Error fetching gigs:', err);
      res.status(500).json({ error: 'An error occurred while fetching gigs' });
    } else {
      res.status(200).json(results); // Send the fetched gigs as JSON response
    }
  });
});

app.get('/api/image/:filename', (req, res) => {
  const filename = req.params.filename;
  const imagePath = path.join(__dirname, 'uploads', filename);

  // Send the image file as the response
  res.sendFile(imagePath);
});

// const path = require('path');

app.get('/api/imageById/:id', (req, res) => {
  const { id } = req.params;
  // console.log("imagebyid",[id]);
  const sql = 'SELECT image FROM users WHERE id = ?';

  connection.query(sql, [id], (error, results) => {
    if (error) {
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      const imagePath = path.join(__dirname, 'uploads', results[0].image); // Access the image field in the results

      // Send the image file as the response
      return res.sendFile(imagePath);
      
    } else {
      return res.sendFile("https://366icons.com/media/01/profile-avatar-account-icon-16699.svg");
    }
  }); // <-- Added missing closing parenthesis
});


app.get('/api/gigEditModalFetch/:id', (req, res) => {
  const query = 'SELECT gigs.*,users.name,categories.name FROM gigs JOIN users ON gigs.uid = users.id JOIN categories ON gigs.category_id = categories.id WHERE gigs.id = ?'; // Adjust this query based on your database schema
  const {id} = req.params;
  console.log("id:",id);
  connection.query(query,[id] ,(err, results) => {
    if (err) {
      console.error('Error fetching gigs:', err);
      res.status(500).json({ error: 'An error occurred while fetching gigs' });
    } else {
      console.log("result:",results);
      res.status(200).json(results); // Send the fetched gigs as JSON response
    }
  });
});

app.get('/api/gigOrder/:id', (req, res) => {
  const query = 'SELECT gigs.*,users.name FROM gigs JOIN users ON gigs.uid = users.id  WHERE gigs.id = ?'; // Adjust this query based on your database schema
  const {id} = req.params;
  console.log("id:",id);
  connection.query(query,[id] ,(err, results) => {
    if (err) {
      console.error('Error fetching gigs:', err);
      res.status(500).json({ error: 'An error occurred while fetching gigs' });
    } else {
      res.status(200).json(results); // Send the fetched gigs as JSON response
    }
  });
});
app.get('/api/othergigfetch/:id', (req, res) => {
  const query = 'SELECT gigs.*, users.name, users.image AS user_image, COALESCE(review_details.avg_rating, 0) AS average_rating, COALESCE(review_details.total_reviews, 0) AS total_reviews FROM gigs JOIN users ON gigs.uid = users.id JOIN categories ON gigs.category_id = categories.id LEFT JOIN ( SELECT gig_id, AVG(rating) AS avg_rating, COUNT(*) AS total_reviews FROM gig_reviews GROUP BY gig_id ) AS review_details ON gigs.id = review_details.gig_id WHERE categories.category_parent_id = ? LIMIT 4;;'; // Adjust this query based on your database schema
  const {id} = req.params;
  console.log(id);
  
  connection.query(query,[id] ,(err, results) => {
    
    if (err) {
      console.error('Error fetching gigs:', err);
      res.status(500).json({ error: 'An error occurred while fetching gigs' });
    } else {
      res.status(200).json(results); // Send the fetched gigs as JSON response
    }
  });
});

// API endpoint to handle order creation
app.post('/api/order', (req, res) => {
  try {
      log(req.body)
      const gig_id = req.body.gig_id;
      const uid = req.body.uid;
      const sid = req.body.sid;
      const bill_id = req.body.bill_id;
      const status = 0;

      // Insert into order_table
      connection.query('INSERT INTO orders (gig_id, uid, sid, bill_id , status) VALUES (?, ?, ?, ?, ?)', 
          [gig_id, uid, sid, bill_id, status]);

      

      res.status(201).json({ message: 'Order created successfully' });
  } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'An error occurred while creating the order' });
  }
});

// API endpoint to handle bill creation
app.post('/api/bill', (req, res) => {
  try {
      const uid = req.body.uid;
      const sid = req.body.sid;
      const s_amount = req.body.s_amount;
      const platform_fees = req.body.platform_fees;
      const total_amount = s_amount + platform_fees;
      const method = req.body.paymentMethod;
      console.log(req.body);

      // Insert into bill table
      const results = connection.query('INSERT INTO bills ( uid, sid, s_amount, platform_fees, total_amount, method) VALUES ( ?, ?, ?, ?, ?, ?)',
          [ uid, sid, s_amount, platform_fees, total_amount, method],
          (error, results) => {
            if (error) {
                console.error('Error creating bill:', error);
                res.status(500).json({ error: 'An error occurred while creating the bill' });
            } else {
                const insertedId = results.insertId; // Retrieve the auto-incremented ID
                res.status(201).json({ message: 'Bill created successfully', insertedId });
            }
          }
      );
  } catch (error) {
      console.error('Error creating bill:', error);
      res.status(500).json({ error: 'An error occurred while creating the bill' });
  }
});

app.get('/bills/:id', (req, res) => {
  const userId = req.params.id
  console.log(userId);
  const sql = 'SELECT b.*, u1.name AS user_name, u2.name AS seller_name FROM   bills b JOIN users u1 ON b.uid = u1.id JOIN users u2 ON b.sid = u2.id WHERE  b.uid = ? ORDER  BY b.created_at DESC';
  connection.query(sql, userId, (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching bill details');
      } else {
          res.json(results);
      }
  });
});

app.get('/orders/:id', (req, res) => {
  const userId = req.params.id
  console.log("userId",userId);
  const sql = "SELECT o.id, o.gig_id, g.gigtitle,g.uid AS sid, o.uid, u.name, o.bill_id, o.created_at, o.status AS stat,CASE WHEN o.status = 1 THEN 'complete' WHEN o.status = 2 THEN 'complete' WHEN o.status = 0 THEN 'In-Progress' END AS status FROM   orders o JOIN gigs g ON o.gig_id = g.id JOIN users u ON o.sid = u.id WHERE  o.uid = ? ORDER  BY o.created_at DESC;";

  connection.query(sql, userId, (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching bill details');
      } else {
        console.log(results);
          res.json(results);
      }
  });
});

app.get('/works/:id', (req, res) => {
  const userId = req.params.id
  console.log(userId);
  const sql = "SELECT o.id, o.gig_id, g.gigtitle, g.id AS gig_uid,o.uid AS order_uid, u.name AS user_name,  o.bill_id, o.created_at,CASE WHEN o.status = 1 THEN 'complete' WHEN o.status = 2 THEN 'complete' WHEN o.status = 0 THEN 'In-Progress' END AS status FROM orders o JOIN gigs g ON o.gig_id = g.id JOIN users u ON o.uid = u.id WHERE g.uid = ? ORDER BY o.created_at DESC";
  connection.query(sql, [userId], (err, results) => {
      if (err) {
          console.error(err);
          res.status(500).send('Error fetching bill details');
      } else {
        console.log(results);
          res.json(results);
      }
  });
});


app.post('/api/orderComplete/:order_id', (req, res) => {
  console.log("Status:",req.params);
  const  order_id  = req.params.order_id

  const query = 'UPDATE orders SET status = 1 WHERE id = ?';
  connection.query(query, [order_id], (err, result) => {
    if (err) {
      console.error('Error deleting gig:', err);
      res.status(500).json({ error: 'An error occurred while creating the gig' });
    } else {
      console.log('complete order');
      console.log(result);
      res.status(201).json({ message: 'Gig created successfully' });
    }
  });
});
app.post('/reviews', async (req, res) => {
  const { id,gig_id, reviewer_id, rating, comment } = req.body;

  try {
    // Insert the review data into the database
    await connection.query(
      'INSERT INTO gig_reviews (gig_id, reviewer_id, rating, comment) VALUES (?, ?, ?, ?)',
      [gig_id, reviewer_id, rating, comment]
    );

    // Update the status in the orders table to 2
    await connection.query(
      'UPDATE orders SET status = 2 WHERE id = ?',
      [id]
    );

    console.log('Review submitted successfully');
    res.status(200).json({ message: 'Review submitted successfully' });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

app.get('/api/reviews/:gigId', (req, res) => {
  const gigId = req.params.gigId;
  const sql = 'SELECT gig_reviews.*, users.name AS buyerName, users.image AS image FROM gig_reviews JOIN users ON gig_reviews.reviewer_id = users.id WHERE gig_reviews.gig_id = ?;';
  connection.query(sql, [gigId], (error, results) => {
    if (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    } else {
      res.json(results);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
