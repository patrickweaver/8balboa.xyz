export function view(main, title = "") {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='0.9em' font-size='90'>🚍</text></svg>"
        />
        <meta property="og:title" content="8th and Balboa MUNI" id="og-title">
        <meta property="og:description" content="Nearby Arrivals" id="og-description">
        <meta property="og:image" content="https://www.8balboa.xyz/image" id="og-image">
        <meta property="og:image:alt" content="A picture of a fast pass" id="og-image-alt">
        <title>8th and Balboa MUNI</title>
        <style>
          body {
            background: rgb(235,235,44);
            background: linear-gradient(163deg, rgba(235,235,44,0.8239889705882353) 0%, rgba(246,204,243,0.6615239845938375) 35%, rgba(197,247,165,0.7651654411764706) 100%);
            margin: 0 auto;
            max-width: 600px;
            font-family: 'Helvetica', 'Ariel', sans-serif;
            min-height: 100vh;
          }
          
          main {
              position: relative;
              width: 100%;
          }
          
          #title {
              display: inline-block;
              max-width: Calc(100% - 85px);
          }

          .arrival-list {
            margin: 1rem 0;
            padding: 0 0 0 1.5rem;
          }

          .arrival-list > li {
            margin: 0 0 0.5rem;
          }
          
          #pass {
              position: absolute;
              top: 10px;
              right: 10px;
              max-width: 75px;
          }
          
          #pass > img {
              display: block;
              width: 100%;
          }
        </style>
      </head>
      <body>
        <main>
          <h1 id="title">8th and Balboa</h1>
          <div id="current-location"></div>
          <div id="nearby-arrivals"></div>
          ${main}
          <div id="pass"><img src="/image" /></div>
        </main>
        <script>console.log('vercel')</script>
      </body>
    </html>
  `;
}
