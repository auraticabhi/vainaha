import React from 'react'

type Props = {}

const ErrorPage = (props: Props) => {
  return (
    <div className=' flex items-center justify-center mx-auto my-[15%] font-dmsans'>
        <h1 className=' text-3xl font-bold'>404 - Page Not Found</h1>
    </div>
  )
}

export default ErrorPage