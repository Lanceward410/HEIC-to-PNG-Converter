require('dotenv').config();
const express = require('express');
const multer = require('multer');
const heicConvert = require('heic-convert');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const app = express();
const port = 5000;

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });

const s3 = new AWS.S3();

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, '../public')));

app.post('/upload', upload.array('files', 10), async (req, res) => {
  const files = req.files;
  const outputPaths = [];
  console.log('Received upload request');

  try {
    for (const file of files) {
      console.log(`Processing file: ${file.originalname}`);
      const inputBuffer = await promisify(fs.readFile)(file.path);
      const outputBuffer = await heicConvert({
        buffer: inputBuffer,
        format: 'PNG',
      });

      const outputPath = path.join(__dirname, 'converted', `${file.filename}.png`);
      outputPaths.push(outputPath);
      await promisify(fs.writeFile)(outputPath, outputBuffer);

      // Upload to S3
      const fileContent = fs.readFileSync(outputPath);
      const params = {
        Bucket: 'process.env.S3_BUCKET_NAME',
        Key: `converted/${file.filename}.png`,
        Body: fileContent,
        ContentType: 'image/png',
      };
      await s3.upload(params).promise();

      console.log(`File converted and uploaded: ${file.filename}`);
      fs.unlinkSync(file.path);
      fs.unlinkSync(outputPath);
    }

    res.json({ message: 'Files converted and uploaded successfully' });
  } catch (error) {
    console.error('Error converting files:', error);
    res.status(500).json({ error: 'Error converting files' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});