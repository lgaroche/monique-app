"use client"
import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Flowbite } from "flowbite-react"
import Web3Modal from "../context/Web3Modal"
import Head from "next/head"
import { Analytics } from '@vercel/analytics/react';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Monique</title>
        <meta name="description" content="Monique is an Ethereum address naming service" />
        <meta property="og:title" content="Monique" />
        <meta property="og:description" content="Monique is an Ethereum address naming service" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://monique.app" />
        <meta property="og:image" content="https://monique.app/apple-icon.png" />
        <meta property="twitter:description" content="Monique is an Ethereum address naming service" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content="Monique" />
        <meta property="twitter:image" content="https://monique.app/apple-icon.png" />
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
      <Analytics />
    </>

  )
}

export default MyApp
