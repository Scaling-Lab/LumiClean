const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Створюємо інтерфейс для читання вводу з консолі
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Функція для пошуку оригінального URL
function findOriginalUrl(imageId) {
    const projectDir = __dirname;
    const htmlFiles = findHtmlFiles(projectDir);
    
    for (const file of htmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const regex = new RegExp(`https://cdn\\.builder\\.io/api/v1/image/assets/[^"']*${imageId}[^"']*`, 'g');
        const matches = content.match(regex);
        
        if (matches && matches.length > 0) {
            return matches[0];
        }
    }
    
    return null;
}

// Функція для рекурсивного пошуку HTML файлів
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

// Запитуємо ID зображення у користувача
rl.question('Введіть ID зображення: ', (imageId) => {
    const originalUrl = findOriginalUrl(imageId);
    
    if (originalUrl) {
        console.log('\nОригінальне посилання:');
        console.log(originalUrl);
    } else {
        console.log('\nПосилання не знайдено. Перевірте правильність ID.');
    }
    
    rl.close();
}); 