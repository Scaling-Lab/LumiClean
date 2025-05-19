const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const axios = require('axios');

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dg8ibuag5',
    api_key: '384938179698359',
    api_secret: 'qHqi9jmQk7FCo5WpHkRgMVmdt8w'
});

// Function to download image from URL
async function downloadImage(url) {
    const response = await axios({
        url,
        responseType: 'arraybuffer'
    });
    return response.data;
}

// Function to upload image to Cloudinary
async function uploadToCloudinary(imageBuffer, filename) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                public_id: `lumiclean/${filename}`,
                folder: 'lumiclean'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        // Convert buffer to stream and pipe to upload stream
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(imageBuffer);
        bufferStream.pipe(uploadStream);
    });
}

// Function to process HTML file
async function processHtmlFile(filePath) {
    try {
        // Read HTML file
        let html = fs.readFileSync(filePath, 'utf8');

        // Find all Builder.io image URLs
        const builderUrlRegex = /https:\/\/cdn\.builder\.io\/api\/v1\/image\/assets\/[^"'\s]+/g;
        const matches = html.match(builderUrlRegex) || [];

        // Process each image
        for (const url of matches) {
            try {
                // Generate unique filename from URL
                const filename = url.split('/').pop().split('?')[0];

                // Download image
                const imageBuffer = await downloadImage(url);

                // Upload to Cloudinary
                const uploadResult = await uploadToCloudinary(imageBuffer, filename);

                // Generate optimized URL
                const optimizedUrl = cloudinary.url(uploadResult.public_id, {
                    fetch_format: 'auto',
                    quality: 'auto',
                    width: 'auto',
                    dpr: 'auto'
                });

                // Replace old URL with new one
                html = html.replace(url, optimizedUrl);

                console.log(`Processed: ${filename}`);
            } catch (error) {
                console.error(`Error processing image ${url}:`, error.message);
            }
        }

        // Write updated HTML back to file
        fs.writeFileSync(filePath, html);
        console.log(`Updated file: ${filePath}`);

    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error.message);
    }
}

// Function to recursively find all HTML files
function findHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    const htmlFiles = [];

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            htmlFiles.push(...findHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            htmlFiles.push(filePath);
        }
    }

    return htmlFiles;
}

// Main function to process all HTML files
async function main() {
    const projectDir = __dirname;
    const htmlFiles = findHtmlFiles(projectDir);

    console.log(`Found ${htmlFiles.length} HTML files to process`);

    for (const file of htmlFiles) {
        await processHtmlFile(file);
    }

    console.log('Migration completed!');
}

// Run the script
main().catch(console.error);