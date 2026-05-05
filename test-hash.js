const bcrypt = require('bcryptjs');
const hash = '$2b$10$z1zHs2NahuJIDqd.hncWz.PFJWNSVZrkD56D9oOnH5Z28vkk.wzym';
console.log('Nri@2026:', bcrypt.compareSync('Nri@2026', hash));
console.log('Admin@123:', bcrypt.compareSync('Admin@123', hash));
