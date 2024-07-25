import React from 'react'

const PageTitle = ({title, description, button}) => {
  return (
    <>
      <section className='bg-white pt-[40px]'>
        <div className='mx-auto px-4 sm:container'>
          <div className='border-stroke items-center justify-between border-b md:flex'>
            <div className='mb-6 w-full'>
              <h2 className='mb-2 text-2xl font-semibold text-black'>
                {title}
              </h2>
              <p className='text-body-color text-sm font-medium'>
                {description}
              </p>
            </div>
            <div className='mb-6'>
              {button}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default PageTitle