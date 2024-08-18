import Head from 'next/head'
import { NavBarTop } from 'components/NavBarTop'
import { LayoutProps } from './types'

const MainLayout = ({
  component: Component,
  pageTitle,
  background,
  backgroundPosition = 'bottom',
}: LayoutProps) => {
  const title = pageTitle || "DEFAULT_TITLE"

  return (
    <div className="bg-white h-full z-10">
      <Head>
        <title>{title}</title>
      </Head>
      <NavBarTop />
      <section className="p-6 sm:px-20 relative sm:pt-6 sm:pb-16 z-10 flex-grow flex flex-col min-h-[calc(100%-72px)]">
        <Component title={title} />
      </section>
      {background && (
        <div
          style={{
            backgroundImage: `url(${background})`,
            backgroundPosition,
          }}
          className="z-0 absolute bottom-0 bg-no-repeat w-full h-screen bg-contain"
        />
      )}
    </div>
  )
}

export default MainLayout
