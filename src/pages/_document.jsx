import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => (
  <Html>
    <Head>
      <link rel="shortcut icon" href="/favicon-32.png" />
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Lato:wght@400;500;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <body>
      <Main />
      <NextScript />
    </body>
  </Html>
)

export default Document
