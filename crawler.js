const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const envs = {  }

process.argv.slice(2).forEach(arg=>{
    const [key,value] =arg.split("=")
    envs[key] = value || true
})

async function fetchHTML(url) {
    const { data } = await axios.get(url);
    return data;
}

function extractData(html,url,depth=0) {
    const $ = cheerio.load(html);
    const images = []
    const links = []
    $('html a').each(function () {
        links.push($(this).attr('href'));
    });
    $('img').each(function () {
        images.push({
            imageUrl: $(this).attr('src'),
            sourceUrl: url, // the page url this image was found on
            depth // the depth of the source at which this image was found on
        });
    });

    return {images,links}
}

async function crawl(url) {
    try {
        const pwait = { w: true }
        process.stdout.write("gilad.")
        const doWait = () => {
            if (pwait.w === true) {
                process.stdout.write('.')
                setTimeout(doWait, 1000);
            }
        }
        doWait()
        const html = await fetchHTML(url);
        pwait.w = false
        const data = extractData(html,url);
        

            const content = JSON.stringify({ results:data.images});

            try {
            fs.writeFileSync('./results.json', content);
            // file written successfully
            } catch (err) {
            console.error(err);
            }
        console.log(data)
    } catch (error) {
        console.error(`Failed to crawl "${url}": ${error.message}`);
    }
}
const pageUrl= envs['url']
const pageDepth= envs['depth']
crawl(pageUrl);
