"use client"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Flowbite } from "flowbite-react"
import Web3Modal from "../context/Web3Modal"
import Head from "next/head"

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Monique</title>
        <meta name="description" content="Monique is an Ethereum address naming service" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="apple-touch-icon"
          href="/apple-icon.png"
          type="image/png"
          sizes="any"
        />
      </Head>
      <Flowbite>
        <Web3Modal>
          <Component {...pageProps} />
        </Web3Modal>
      </Flowbite>
    </>

  )
}

export default MyApp
