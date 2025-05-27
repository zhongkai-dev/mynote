const { connectDB, User, Category, Note } = require('./db');
const bcrypt = require('bcrypt');

async function installDatabase() {
  try {
    console.log('Starting installation...');
    
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Installation aborted.');
      process.exit(1);
    }
    
    console.log('Connected to MongoDB. Setting up initial data...');

    // Create default admin user
    const defaultUsername = 'admin';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ username: defaultUsername });
    
    if (!existingUser) {
      await User.create({
        username: defaultUsername,
        password: hashedPassword
      });
      console.log('Default admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    // Create default category
    const defaultCategory = 'Note';
    let category;
    
    // Check if default category exists
    const existingCategory = await Category.findOne({ name: defaultCategory });
    
    if (!existingCategory) {
      category = await Category.create({ name: defaultCategory });
      console.log('Default category created successfully');
    } else {
      category = existingCategory;
      console.log('Default category already exists');
    }

    // Create default notes
    const defaultNotes = [
      {
        title: 'Greeting',
        content: "Yes I'm Crystal Lindley from Power Digital Marketing. We have some job openings. can I share more details?"
      },
      {
        title: 'Job Opportunity + Requirements',
        content: "This is a small requirement; -U.S citizen/permanentresident.🇺🇸-Must be over 25years of age.Do you meetthese requirements?"
      },
      {
        title: 'Job Opportunity + Requirements',
        content: "First, please confirm if you meet these requirements?\n1. Age 25 or holder\n2. US resident, S.S.N. holder. Please reply A for Eligible or B for Can't meet."
      },
      {
        title: 'Job Opportunity + Requirements (Alternate)',
        content: "Well! But I would like to know if you are interested and fully meet the requirements:\n1. US citizens or people living in the US have an SSN card.\n2. Age 25 and above. Please confirm (yes) if you meet the above requirements."
      },
      {
        title: 'Return',
        content: "Yeah, this is a part-time job you can do. Work 30-60 minutes/day, $100-$400. Kindly confirm, Yes or no?"
      },
      {
        title: 'Follow-up',
        content: "May I get your response, please, if you meet the requirements above?"
      },
      {
        title: 'END',
        content: "Great. A training manager will contact you via WhatsApp soon and provide you with free training. You can also get a bonus of $100-$650. Thank you for your time."
      }
    ];

    for (const note of defaultNotes) {
      // Check if note already exists to avoid duplicates
      const existingNote = await Note.findOne({ 
        category: category._id,
        title: note.title
      });
      
      if (!existingNote) {
        await Note.create({
          category: category._id,
          title: note.title,
          content: note.content
        });
        console.log(`Note '${note.title}' created successfully`);
      } else {
        console.log(`Note '${note.title}' already exists`);
      }
    }

    console.log('Installation completed successfully!');

  } catch (error) {
    console.error('Installation error:', error);
  } finally {
    process.exit();
  }
}

installDatabase(); 