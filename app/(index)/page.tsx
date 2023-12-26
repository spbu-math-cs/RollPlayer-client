import Link from 'next/link'

export default function Home() {
  return (
    <>
      <section className="container mx-auto h-screen flex items-center justify-center">
        <div>
          <h1 className="text-7xl my-5">RollPlayer</h1>
          <Link
            href="/play"
            className="text-xl text-center text-white block bg-orange-500 p-3 rounded-2xl"
          >
            Play now
          </Link>
        </div>
      </section>
    </>
  )
}
