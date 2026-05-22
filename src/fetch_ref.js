import fs from 'fs';
import https from 'https';

const url = 'https://raw.githubusercontent.com/zabesangary/bouw/main/index.html';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('./ref_index.html', data);
    console.log('Successfully written ./ref_index.html, length:', data.length);
  });
}).on('error', (err) => {
  console.error('Error fetching:', err);
});
